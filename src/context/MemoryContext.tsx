import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserMemory, MemoryType, GuardrailSettings, PersonalityPreset, CustomizationInputRecord } from '../types';
import {
  fetchAllMemories,
  saveUserMemory,
  deleteUserMemory,
  ingestUrlToMemory,
  ingestFileToMemory,
  getLocalMemories
} from '../services/memoryService';
import {
  DEFAULT_GUARDRAIL_SETTINGS,
  PRESET_PROFILES,
  getLocalGuardrails,
  fetchGuardrails,
  persistGuardrails,
  recordCustomizationInput,
  deleteCustomizationInput,
  deleteMultipleCustomizationInputs,
  performCleanWipe
} from '../services/guardrailService';
import { auth } from '../services/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

interface MemoryContextType {
  memories: UserMemory[];
  loading: boolean;
  cloudSyncStatus: 'synced' | 'local_only' | 'syncing' | 'error';
  saveMemory: (data: Partial<UserMemory> & { title: string; content: string; type: MemoryType }) => Promise<UserMemory>;
  deleteMemory: (id: string) => Promise<void>;
  ingestUrl: (url: string, tags?: string[]) => Promise<UserMemory>;
  ingestFile: (file: File) => Promise<UserMemory>;
  rememberTurn: (prompt: string, response: string, suggestedTitle?: string) => Promise<UserMemory>;
  refreshMemories: () => Promise<void>;
  activePersona: UserMemory | null;
  // Modal states for "Remember this" prompt
  isRememberModalOpen: boolean;
  rememberModalData: { title?: string; content?: string; type?: MemoryType; tags?: string[] } | null;
  openRememberModal: (initialData?: { title?: string; content?: string; type?: MemoryType; tags?: string[] }) => void;
  closeRememberModal: () => void;
  // Full Knowledge Base drawer/modal
  isKnowledgeBaseOpen: boolean;
  setIsKnowledgeBaseOpen: (open: boolean) => void;
  // Agent Memory Explorer modal
  isMemoryExplorerOpen: boolean;
  setIsMemoryExplorerOpen: (open: boolean) => void;
  // Memory Scenarios modal / playbook
  isMemoryScenariosOpen: boolean;
  setIsMemoryScenariosOpen: (open: boolean) => void;
  openMemoryScenarios: () => void;
  closeMemoryScenarios: () => void;
  // 2nd Brain Guardrails & Boundaries customization
  guardrails: GuardrailSettings;
  updateGuardrails: (newSettings: Partial<GuardrailSettings>) => Promise<void>;
  resetGuardrailsToDefault: () => Promise<void>;
  applyGuardrailPreset: (preset: PersonalityPreset) => Promise<void>;
  recordGuardrailCustomization: (entry: Omit<CustomizationInputRecord, 'id' | 'timestamp'>) => Promise<void>;
  deleteGuardrailInput: (inputId: string) => Promise<void>;
  deleteMultipleGuardrailInputs: (inputIds: string[]) => Promise<void>;
  cleanWipeGuardrails: () => Promise<void>;
  isGuardrailsModalOpen: boolean;
  setIsGuardrailsModalOpen: (open: boolean) => void;
}

const MemoryContext = createContext<MemoryContextType | undefined>(undefined);

export const MemoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [memories, setMemories] = useState<UserMemory[]>(() => getLocalMemories());
  const [loading, setLoading] = useState<boolean>(false);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'local_only' | 'syncing' | 'error'>('local_only');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Remember Modal state
  const [isRememberModalOpen, setIsRememberModalOpen] = useState(false);
  const [rememberModalData, setRememberModalData] = useState<{ title?: string; content?: string; type?: MemoryType; tags?: string[] } | null>(null);

  // Full Knowledge Base drawer state
  const [isKnowledgeBaseOpen, setIsKnowledgeBaseOpen] = useState(false);
  // Agent Memory Explorer modal state
  const [isMemoryExplorerOpen, setIsMemoryExplorerOpen] = useState(false);
  // Memory Scenarios modal state
  const [isMemoryScenariosOpen, setIsMemoryScenariosOpen] = useState(false);
  // Guardrails & Boundaries modal state
  const [isGuardrailsModalOpen, setIsGuardrailsModalOpen] = useState(false);
  // User 2nd Brain Guardrail Settings
  const [guardrails, setGuardrails] = useState<GuardrailSettings>(() => getLocalGuardrails());

  const loadAll = useCallback(async (user?: User | null) => {
    setLoading(true);
    try {
      const current = user !== undefined ? user : currentUser;
      if (current) {
        setCloudSyncStatus('syncing');
      }
      const [list, loadedGuardrails] = await Promise.all([
        fetchAllMemories(current?.uid),
        fetchGuardrails(current?.uid)
      ]);
      setMemories(list);
      setGuardrails(loadedGuardrails);
      setCloudSyncStatus(current ? 'synced' : 'local_only');
    } catch (err) {
      console.warn('Memory load error:', err);
      setCloudSyncStatus(currentUser ? 'error' : 'local_only');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      loadAll(user);
    });
    return () => unsubscribe();
  }, [loadAll]);

  const handleUpdateGuardrails = async (newSettings: Partial<GuardrailSettings>) => {
    const merged = { ...guardrails, ...newSettings };
    setGuardrails(merged);
    const saved = await persistGuardrails(merged, currentUser?.uid);
    setGuardrails(saved);
  };

  const handleResetGuardrails = async () => {
    const reset = { ...DEFAULT_GUARDRAIL_SETTINGS, userId: currentUser?.uid };
    setGuardrails(reset);
    const saved = await persistGuardrails(reset, currentUser?.uid);
    setGuardrails(saved);
  };

  const handleApplyPreset = async (preset: PersonalityPreset) => {
    const profile = PRESET_PROFILES[preset] || {};
    const updated: GuardrailSettings = {
      ...guardrails,
      ...profile,
      personalityPreset: preset
    };
    setGuardrails(updated);
    const saved = await persistGuardrails(updated, currentUser?.uid);
    setGuardrails(saved);
  };

  const handleRecordCustomization = async (
    entry: Omit<CustomizationInputRecord, 'id' | 'timestamp'>
  ) => {
    const updated = recordCustomizationInput(guardrails, entry);
    setGuardrails(updated);
    const saved = await persistGuardrails(updated, currentUser?.uid);
    setGuardrails(saved);
  };

  const handleDeleteGuardrailInput = async (inputId: string) => {
    const updated = deleteCustomizationInput(guardrails, inputId);
    setGuardrails(updated);
    const saved = await persistGuardrails(updated, currentUser?.uid);
    setGuardrails(saved);
  };

  const handleDeleteMultipleGuardrailInputs = async (inputIds: string[]) => {
    const updated = deleteMultipleCustomizationInputs(guardrails, inputIds);
    setGuardrails(updated);
    const saved = await persistGuardrails(updated, currentUser?.uid);
    setGuardrails(saved);
  };

  const handleCleanWipeGuardrails = async () => {
    const wiped = await performCleanWipe(currentUser?.uid);
    setGuardrails(wiped);
  };

  const handleSaveMemory = async (
    data: Partial<UserMemory> & { title: string; content: string; type: MemoryType }
  ): Promise<UserMemory> => {
    setLoading(true);
    try {
      const saved = await saveUserMemory(data, currentUser?.uid);
      await loadAll(currentUser);
      return saved;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMemory = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      await deleteUserMemory(id, currentUser?.uid);
      await loadAll(currentUser);
    } finally {
      setLoading(false);
    }
  };

  const handleIngestUrl = async (url: string, tags?: string[]): Promise<UserMemory> => {
    setLoading(true);
    try {
      const ingested = await ingestUrlToMemory(url, tags, currentUser?.uid);
      await loadAll(currentUser);
      return ingested;
    } finally {
      setLoading(false);
    }
  };

  const handleIngestFile = async (file: File): Promise<UserMemory> => {
    setLoading(true);
    try {
      const ingested = await ingestFileToMemory(file, currentUser?.uid);
      await loadAll(currentUser);
      return ingested;
    } finally {
      setLoading(false);
    }
  };

  const handleRememberTurn = async (
    prompt: string,
    response: string,
    suggestedTitle?: string
  ): Promise<UserMemory> => {
    const title = suggestedTitle || `Learned: ${prompt.slice(0, 45)}...`;
    const content = `User Prompt / Context:\n${prompt}\n\nKey Learned Guidance / Response Insight:\n${response}`;

    return await handleSaveMemory({
      title,
      content,
      type: 'instruction',
      tags: ['chat_remember_this', 'learning'],
      source: 'chat_remember_this'
    });
  };

  const openRememberModal = (initialData?: { title?: string; content?: string; type?: MemoryType; tags?: string[] }) => {
    setRememberModalData(initialData || null);
    setIsRememberModalOpen(true);
  };

  const closeRememberModal = () => {
    setIsRememberModalOpen(false);
    setRememberModalData(null);
  };

  const openMemoryScenarios = () => {
    setIsMemoryScenariosOpen(true);
  };

  const closeMemoryScenarios = () => {
    setIsMemoryScenariosOpen(false);
  };

  const activePersona = memories.find(m => m.type === 'persona') || null;

  return (
    <MemoryContext.Provider
      value={{
        memories,
        loading,
        cloudSyncStatus,
        saveMemory: handleSaveMemory,
        deleteMemory: handleDeleteMemory,
        ingestUrl: handleIngestUrl,
        ingestFile: handleIngestFile,
        rememberTurn: handleRememberTurn,
        refreshMemories: () => loadAll(currentUser),
        activePersona,
        isRememberModalOpen,
        rememberModalData,
        openRememberModal,
        closeRememberModal,
        isKnowledgeBaseOpen,
        setIsKnowledgeBaseOpen,
        isMemoryExplorerOpen,
        setIsMemoryExplorerOpen,
        isMemoryScenariosOpen,
        setIsMemoryScenariosOpen,
        openMemoryScenarios,
        closeMemoryScenarios,
        guardrails,
        updateGuardrails: handleUpdateGuardrails,
        resetGuardrailsToDefault: handleResetGuardrails,
        applyGuardrailPreset: handleApplyPreset,
        recordGuardrailCustomization: handleRecordCustomization,
        deleteGuardrailInput: handleDeleteGuardrailInput,
        deleteMultipleGuardrailInputs: handleDeleteMultipleGuardrailInputs,
        cleanWipeGuardrails: handleCleanWipeGuardrails,
        isGuardrailsModalOpen,
        setIsGuardrailsModalOpen
      }}
    >
      {children}
    </MemoryContext.Provider>
  );
};

export const useMemory = () => {
  const context = useContext(MemoryContext);
  if (!context) {
    throw new Error('useMemory must be used within a MemoryProvider');
  }
  return context;
};
