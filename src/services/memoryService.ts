import { collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserMemory, MemoryType } from '../types';

const LOCAL_STORAGE_KEY = 'vantage_user_memories';

// Default initial seeds so users immediately see how persona, instructions, and agent workflows work
const DEFAULT_INITIAL_MEMORIES: UserMemory[] = [
  {
    id: 'mem_seed_persona',
    title: 'Executive AI Persona & Reasoning Tone',
    content: 'Always respond as an elite, high-clarity Executive Chief of Staff and strategic technologist. Be direct, articulate, insightful, and structure outputs with clean markdown formatting, headers, and bullet points. Never be overly sycophantic.',
    type: 'persona',
    tags: ['persona', 'tone', 'executive'],
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    aiSummary: 'Default persona instruction ensuring articulate, executive-grade responses.',
    syncedToCloud: false
  },
  {
    id: 'mem_seed_instruction',
    title: 'Workspace Action Safety & Precision',
    content: 'When generating Google Workspace draft actions (Gmail, Calendar, Drive, Tasks), ensure all timestamps are explicit and recipient emails are carefully verified before requesting execution confirmation.',
    type: 'instruction',
    tags: ['instruction', 'safety', 'workspace'],
    source: 'manual',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    aiSummary: 'Verification protocol for workspace drafting and action safety.',
    syncedToCloud: false
  },
  {
    id: 'mem_seed_workflow',
    title: 'Daily VIP Email & Meeting Morning Digest',
    content: 'Multi-step scheduled triage: 1) Scan unread high-priority Gmail threads from VIP clients. 2) Check today\'s Calendar schedule for conflicts. 3) Synthesize a 3-bullet morning briefing with proposed quick-draft replies.',
    type: 'agent_workflow',
    tags: ['agent_workflow', 'cron', 'triage', 'deepseek', 'gemini'],
    source: 'agent_orchestrator',
    metadata: {
      cronSchedule: '0 8 * * 1-5',
      steps: [
        'Scan VIP messages in Gmail',
        'Verify today\'s Calendar commitments',
        'Synthesize executive brief with suggested draft actions'
      ],
      promptEngineered: true
    },
    createdAt: new Date().toISOString(),
    aiSummary: 'Autonomous multi-step morning digest workflow with scheduled cron cadence.',
    syncedToCloud: false
  }
];

// Helper to get local session memories
export const getLocalMemories = (): UserMemory[] => {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_INITIAL_MEMORIES));
      return DEFAULT_INITIAL_MEMORIES;
    }
    return JSON.parse(data);
  } catch (err) {
    console.warn('Failed to load local memories:', err);
    return DEFAULT_INITIAL_MEMORIES;
  }
};

// Helper to save local session memories
export const saveLocalMemories = (memories: UserMemory[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memories));
  } catch (err) {
    console.warn('Failed to save local memories:', err);
  }
};

/**
 * Fetch all memories combining Firestore cloud persistence with local session storage.
 */
export const fetchAllMemories = async (userId?: string): Promise<UserMemory[]> => {
  const localList = getLocalMemories();
  const currentUid = userId || auth.currentUser?.uid;

  if (!currentUid) {
    return localList;
  }

  try {
    const memoriesRef = collection(db, 'users', currentUid, 'memories');
    const q = query(memoriesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const cloudMemories: UserMemory[] = snapshot.docs.map(docSnap => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          userId: currentUid,
          title: d.title || 'Untitled Memory',
          content: d.content || '',
          type: (d.type as MemoryType) || 'knowledge',
          tags: Array.isArray(d.tags) ? d.tags : [],
          source: d.source || 'manual',
          sourceUrl: d.sourceUrl,
          fileName: d.fileName,
          metadata: d.metadata || {},
          createdAt: d.createdAt || new Date().toISOString(),
          updatedAt: d.updatedAt,
          aiSummary: d.aiSummary,
          syncedToCloud: true
        };
      });

      // Merge cloud memories with any unsynced local memories
      const cloudIds = new Set(cloudMemories.map(m => m.id));
      const unsyncedLocals = localList.filter(m => !cloudIds.has(m.id));
      
      const merged = [...cloudMemories, ...unsyncedLocals];
      saveLocalMemories(merged);
      return merged;
    }
  } catch (cloudErr) {
    console.warn('Firestore memories fetch warning (using local session fallback):', cloudErr);
  }

  return localList;
};

/**
 * Save or update a memory in both local session and Firestore cloud persistence.
 */
export const saveUserMemory = async (
  memoryData: Partial<UserMemory> & { title: string; content: string; type: MemoryType },
  userId?: string
): Promise<UserMemory> => {
  const currentUid = userId || auth.currentUser?.uid;
  const memoryId = memoryData.id || `mem_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const now = new Date().toISOString();

  const newMemory: UserMemory = {
    id: memoryId,
    userId: currentUid,
    title: memoryData.title.trim(),
    content: memoryData.content.trim(),
    type: memoryData.type,
    tags: memoryData.tags && memoryData.tags.length > 0 ? memoryData.tags : [memoryData.type],
    source: memoryData.source || 'manual',
    sourceUrl: memoryData.sourceUrl,
    fileName: memoryData.fileName,
    metadata: memoryData.metadata || {},
    createdAt: memoryData.createdAt || now,
    updatedAt: now,
    aiSummary: memoryData.aiSummary || memoryData.title,
    syncedToCloud: false
  };

  // 1. Immediately update local storage session
  const currentLocals = getLocalMemories();
  const existingIdx = currentLocals.findIndex(m => m.id === memoryId);
  let updatedList: UserMemory[];
  if (existingIdx >= 0) {
    updatedList = [...currentLocals];
    updatedList[existingIdx] = newMemory;
  } else {
    updatedList = [newMemory, ...currentLocals];
  }
  saveLocalMemories(updatedList);

  // 2. Persist to Firestore if user is authenticated
  if (currentUid) {
    try {
      const memoryDocRef = doc(db, 'users', currentUid, 'memories', memoryId);
      await setDoc(memoryDocRef, {
        id: memoryId,
        userId: currentUid,
        title: newMemory.title,
        content: newMemory.content,
        type: newMemory.type,
        tags: newMemory.tags,
        source: newMemory.source,
        sourceUrl: newMemory.sourceUrl || null,
        fileName: newMemory.fileName || null,
        metadata: newMemory.metadata || {},
        createdAt: newMemory.createdAt,
        updatedAt: now,
        aiSummary: newMemory.aiSummary || null
      }, { merge: true });

      newMemory.syncedToCloud = true;
      const syncedIdx = updatedList.findIndex(m => m.id === memoryId);
      if (syncedIdx >= 0) {
        updatedList[syncedIdx].syncedToCloud = true;
        saveLocalMemories(updatedList);
      }
    } catch (firestoreErr) {
      console.warn('Firestore cloud memory write error:', firestoreErr);
    }
  }

  return newMemory;
};

/**
 * Delete a memory from local session and Firestore.
 */
export const deleteUserMemory = async (memoryId: string, userId?: string): Promise<void> => {
  const currentUid = userId || auth.currentUser?.uid;

  // Remove from local storage
  const currentLocals = getLocalMemories();
  const updatedList = currentLocals.filter(m => m.id !== memoryId);
  saveLocalMemories(updatedList);

  // Remove from Firestore if authenticated
  if (currentUid) {
    try {
      const memoryDocRef = doc(db, 'users', currentUid, 'memories', memoryId);
      await deleteDoc(memoryDocRef);
    } catch (err) {
      console.warn('Firestore delete memory error:', err);
    }
  }
};

/**
 * Ingest URL into 2nd Brain knowledge base.
 */
export const ingestUrlToMemory = async (url: string, tags?: string[], userId?: string): Promise<UserMemory> => {
  const resp = await fetch('/api/vantage/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, category: 'workspace', tags })
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || 'Failed to scrape and ingest URL');
  }

  const data = await resp.json();
  const ingested = data.memory;

  return await saveUserMemory({
    title: ingested.title || `Scraped: ${url}`,
    content: ingested.content,
    type: 'url_scrape',
    tags: tags && tags.length > 0 ? tags : (ingested.tags || ['url', 'web-scrape']),
    source: 'url_scrape',
    sourceUrl: url,
    aiSummary: ingested.aiSummary
  }, userId);
};

/**
 * Ingest an uploaded file (PDF, TXT, CSV, JSON, Markdown) with text extraction.
 */
export const ingestFileToMemory = async (file: File, userId?: string): Promise<UserMemory> => {
  // Convert file to base64
  const base64Data = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const resp = await fetch('/api/vantage/ingest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fileName: file.name,
      fileMimeType: file.type || 'text/plain',
      fileBase64: base64Data,
      type: 'file_extracted'
    })
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `Failed to extract and ingest ${file.name}`);
  }

  const data = await resp.json();
  const ingested = data.memory;

  return await saveUserMemory({
    title: ingested.title || file.name,
    content: ingested.content,
    type: 'file_extracted',
    tags: ingested.tags || ['file-upload', 'document'],
    source: 'file_upload',
    fileName: file.name,
    aiSummary: ingested.aiSummary
  }, userId);
};

/**
 * Save an automation workflow / cron job for instant recall and re-execution.
 */
export const rememberAgentWorkflow = async (
  title: string,
  workflowDetails: string,
  metadata: {
    cronSchedule?: string;
    actionPayload?: any;
    steps?: any[];
  },
  userId?: string
): Promise<UserMemory> => {
  return await saveUserMemory({
    title,
    content: workflowDetails,
    type: 'agent_workflow',
    tags: ['agent_workflow', 'automation', metadata.cronSchedule ? 'cron' : 'one-shot'],
    source: 'agent_orchestrator',
    metadata: {
      ...metadata,
      promptEngineered: true,
      extractedAt: new Date().toISOString()
    },
    aiSummary: `Saved automation payload: "${title}" ready for instant recall.`
  }, userId);
};
