import React, { useState, useMemo } from 'react';
import { useMemory } from '../context/MemoryContext';
import { UserMemory, MemoryType } from '../types';
import {
  Brain,
  Search,
  Plus,
  Trash2,
  Edit3,
  ExternalLink,
  Tag,
  Clock,
  Sparkles,
  Database,
  RefreshCw,
  Eye,
  Check,
  X,
  FileText,
  Globe,
  Cpu,
  ShieldCheck,
  AlertTriangle,
  Download,
  Filter,
  Layers,
  Sliders,
  Code,
  BookOpen
} from 'lucide-react';

interface AgentMemoryExplorerProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const AgentMemoryExplorer: React.FC<AgentMemoryExplorerProps> = ({ onClose, isModal = false }) => {
  const {
    memories,
    loading,
    cloudSyncStatus,
    saveMemory,
    deleteMemory,
    refreshMemories,
    openRememberModal,
    openMemoryScenarios,
    setIsGuardrailsModalOpen
  } = useMemory();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | MemoryType>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'alphabetical'>('newest');

  // Inspect & Edit states
  const [inspectingMemory, setInspectingMemory] = useState<UserMemory | null>(null);
  const [editingMemory, setEditingMemory] = useState<UserMemory | null>(null);
  const [deletingMemoryId, setDeletingMemoryId] = useState<string | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Edit form inputs
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editType, setEditType] = useState<MemoryType>('knowledge');
  const [editTags, setEditTags] = useState('');
  const [editAiSummary, setEditAiSummary] = useState('');

  // Open edit modal
  const handleStartEdit = (mem: UserMemory) => {
    setEditingMemory(mem);
    setEditTitle(mem.title);
    setEditContent(mem.content);
    setEditType(mem.type);
    setEditTags(mem.tags.join(', '));
    setEditAiSummary(mem.aiSummary || '');
    setEditSuccessMsg(null);
  };

  // Submit edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMemory || !editTitle.trim() || !editContent.trim()) return;

    setIsSavingEdit(true);
    try {
      const parsedTags = editTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await saveMemory({
        id: editingMemory.id,
        title: editTitle.trim(),
        content: editContent.trim(),
        type: editType,
        tags: parsedTags.length > 0 ? parsedTags : [editType],
        aiSummary: editAiSummary.trim() || editTitle.trim(),
        source: editingMemory.source,
        sourceUrl: editingMemory.sourceUrl,
        fileName: editingMemory.fileName,
        metadata: editingMemory.metadata
      });

      setEditSuccessMsg('Memory updated in Firebase Firestore and synchronized with 2nd Brain reasoning engine!');
      setTimeout(() => {
        setEditingMemory(null);
        setEditSuccessMsg(null);
      }, 1200);
    } catch (err: any) {
      alert('Failed to update memory: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle delete
  const handleConfirmDelete = async (id: string) => {
    try {
      await deleteMemory(id);
      setDeletingMemoryId(null);
      if (inspectingMemory?.id === id) {
        setInspectingMemory(null);
      }
    } catch (err: any) {
      alert('Failed to delete memory: ' + (err?.message || 'Unknown error'));
    }
  };

  // Filter and sort memories
  const filteredMemories = useMemo(() => {
    return memories
      .filter((mem) => {
        const matchesType =
          selectedType === 'all'
            ? true
            : selectedType === 'instruction'
            ? mem.type === 'instruction' || mem.type === 'persona'
            : mem.type === selectedType;

        const q = searchQuery.toLowerCase();
        const matchesQuery =
          !q ||
          mem.title.toLowerCase().includes(q) ||
          mem.content.toLowerCase().includes(q) ||
          (mem.aiSummary && mem.aiSummary.toLowerCase().includes(q)) ||
          mem.tags.some((t) => t.toLowerCase().includes(q));

        return matchesType && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return a.title.localeCompare(b.title);
      });
  }, [memories, selectedType, searchQuery, sortBy]);

  // Export all memories as JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(memories, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `vantage-agent-memories-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Memory type helpers
  const getTypeColor = (type: MemoryType) => {
    switch (type) {
      case 'persona':
      case 'instruction':
        return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'agent_workflow':
        return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'url_scrape':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'file_extracted':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getReasoningImpactDescription = (type: MemoryType) => {
    switch (type) {
      case 'persona':
      case 'instruction':
        return 'Active Persona Directives: Automatically injected into every Prompt Studio session to govern tone, formatting, and behavioral responses.';
      case 'agent_workflow':
        return 'Automation Blueprint: Stored in hybrid DeepSeek + Gemini cron memory for instant re-execution and parameter recall.';
      case 'url_scrape':
        return 'Scraped Web Context: Grounded into 2nd Brain multi-step reasoning, answering research queries with cited knowledge.';
      case 'file_extracted':
        return 'Document Knowledge: Extracted text used as primary source material when reasoning over corporate or user files.';
      default:
        return 'General Memory Bank: Retrieved dynamically when user inquiries match relevant semantic keywords.';
    }
  };

  return (
    <div className={`space-y-6 ${isModal ? 'p-6 max-h-[85vh] overflow-y-auto' : ''}`}>
      {/* Header & Transparency Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-xs">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Agent Memory Explorer
                  <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Firebase Firestore Persisted
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Inspect, edit, and control all learned context, persona directives, and automation scripts governing the AI's 2nd brain reasoning.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshMemories()}
              disabled={loading}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
              title="Refresh memories from Firebase Firestore"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Export all memories as JSON backup"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export JSON</span>
            </button>
            <button
              onClick={() => openMemoryScenarios()}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-blue-200 dark:border-blue-800/80 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Open Memory Scenarios & Playbook"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Scenarios Playbook</span>
            </button>
            <button
              onClick={() => setIsGuardrailsModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition flex items-center gap-1.5 cursor-pointer"
              title="Customize 2nd Brain personality, censorship boundaries & behavioral guardrails"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Guardrails & Censorship</span>
            </button>
            <button
              onClick={() => openRememberModal({ title: '', content: '', type: 'instruction' })}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Reasoning Transparency Callout */}
        <div className="p-3.5 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-900 dark:text-indigo-200">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span>
              <strong>Transparency & Alignment:</strong> You have full control over what the model remembers. Edits and deletions propagate synchronously to the reasoning prompt context.
            </span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 shrink-0">
            {memories.length} Active Memory Units
          </span>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories by title, prompt directive, tag, or content..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto justify-end">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sliders className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="text-xs py-2 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="alphabetical">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              selectedType === 'all'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Context ({memories.length})
          </button>
          <button
            onClick={() => setSelectedType('instruction')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'instruction'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            Personas & Instructions ({memories.filter((m) => m.type === 'persona' || m.type === 'instruction').length})
          </button>
          <button
            onClick={() => setSelectedType('agent_workflow')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'agent_workflow'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Cpu className="w-3 h-3" />
            Automations & Blueprints ({memories.filter((m) => m.type === 'agent_workflow').length})
          </button>
          <button
            onClick={() => setSelectedType('url_scrape')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'url_scrape'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <Globe className="w-3 h-3" />
            Scraped Web ({memories.filter((m) => m.type === 'url_scrape').length})
          </button>
          <button
            onClick={() => setSelectedType('file_extracted')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              selectedType === 'file_extracted'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3 h-3" />
            Extracted Documents ({memories.filter((m) => m.type === 'file_extracted').length})
          </button>
        </div>
      </div>

      {/* Memories Grid */}
      {filteredMemories.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <Brain className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No matching memories found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? `No memories matched "${searchQuery}". Try clearing your search query or selecting a different filter.`
              : 'Your persistent 2nd brain memory is empty. Use "Remember this" on chat responses, ingest URLs, or upload documents to start learning.'}
          </p>
          <button
            onClick={() => openRememberModal({ title: '', content: '', type: 'instruction' })}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Add First Memory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map((mem) => {
            const isDeleting = deletingMemoryId === mem.id;

            return (
              <div
                key={mem.id}
                className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300 dark:hover:border-indigo-700/60 transition space-y-3.5 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  {/* Card Header: Type Badge & Action Controls */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${getTypeColor(
                          mem.type
                        )}`}
                      >
                        {mem.type.replace('_', ' ')}
                      </span>
                      {mem.source && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          via {mem.source.replace(/_/g, ' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      {/* View details */}
                      <button
                        onClick={() => setInspectingMemory(mem)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition cursor-pointer"
                        title="Inspect full memory & reasoning prompt"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => handleStartEdit(mem)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition cursor-pointer"
                        title="Edit memory title, directive, or tags"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setDeletingMemoryId(mem.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                        title="Purge memory from Firebase & 2nd brain"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">{mem.title}</h3>

                  {/* AI Summary */}
                  {mem.aiSummary && (
                    <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">AI Summary: </span>
                      {mem.aiSummary}
                    </div>
                  )}

                  {/* Content preview */}
                  <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed whitespace-pre-wrap font-sans">
                    {mem.content}
                  </p>
                </div>

                {/* Card Footer: Metadata, Tags, Reasoning Impact */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {mem.tags &&
                      mem.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md flex items-center gap-1 font-medium"
                        >
                          <Tag className="w-2.5 h-2.5 text-slate-400" /> {tag}
                        </span>
                      ))}
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(mem.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => setInspectingMemory(mem)}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-0.5"
                    >
                      Reasoning Impact <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation Inline Overlay */}
                {isDeleting && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-red-800 dark:text-red-300">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      Delete this memory from Firebase?
                    </div>
                    <p className="text-[11px] text-red-700 dark:text-red-400">
                      This will permanently purge this learned instruction from cloud storage and stop affecting future reasoning.
                    </p>
                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => setDeletingMemoryId(null)}
                        className="px-2.5 py-1 text-xs text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleConfirmDelete(mem.id)}
                        className="px-2.5 py-1 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs cursor-pointer"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT MEMORY MODAL */}
      {editingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Edit Persisted Context</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modify this memory to re-tune how the 2nd Brain reasons over your preferences.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingMemory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccessMsg ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-emerald-800 dark:text-emerald-300">{editSuccessMsg}</h4>
              </div>
            ) : (
              <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Title / Reference
                    </label>
                    <input
                      type="text"
                      required
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Memory Classification
                    </label>
                    <select
                      value={editType}
                      onChange={(e: any) => setEditType(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                    >
                      <option value="instruction">Instruction Directive</option>
                      <option value="persona">Persona Directive</option>
                      <option value="knowledge">General Knowledge</option>
                      <option value="agent_workflow">Agent Workflow / Script</option>
                      <option value="url_scrape">Scraped URL Context</option>
                      <option value="file_extracted">Extracted File Data</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    AI Summary (Quick Recall Anchor)
                  </label>
                  <input
                    type="text"
                    value={editAiSummary}
                    onChange={(e) => setEditAiSummary(e.target.value)}
                    placeholder="Short summary used by the AI during fast vector retrieval"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Content & Prompt Directives
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="e.g. persona, tone, executive, marketing"
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    Syncs to Firestore ID:{' '}
                    <span className="font-mono text-indigo-600 dark:text-indigo-400">{editingMemory.id}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMemory(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingEdit}
                      className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {isSavingEdit ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* INSPECT REASONING IMPACT MODAL */}
      {inspectingMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-colors">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Reasoning Transparency Inspector
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    How this persistent memory shapes the 2nd Brain's thought process
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectingMemory(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* How it affects reasoning */}
              <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/30 rounded-xl border border-indigo-100 dark:border-indigo-900/40 space-y-1.5">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Cognitive Reasoning Role:
                </div>
                <p className="text-xs text-indigo-800 dark:text-indigo-300 leading-relaxed">
                  {getReasoningImpactDescription(inspectingMemory.type)}
                </p>
              </div>

              {/* Exact Injected Prompt Payload */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-slate-500" /> Injected System Prompt Representation:
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Type: {inspectingMemory.type}
                  </span>
                </div>
                <div className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800">
                  {inspectingMemory.type === 'persona' || inspectingMemory.type === 'instruction' ? (
                    <pre className="whitespace-pre-wrap">
                      {`[ACTIVE USER DIRECTIVE - "${inspectingMemory.title}"]\n${inspectingMemory.content}`}
                    </pre>
                  ) : inspectingMemory.type === 'agent_workflow' ? (
                    <pre className="whitespace-pre-wrap">
                      {`[SAVED AUTOMATION BLUEPRINT - "${inspectingMemory.title}"]\nSchedule: ${
                        inspectingMemory.metadata?.cronSchedule || 'One-shot execution'
                      }\nWorkflow: ${inspectingMemory.content}`}
                    </pre>
                  ) : (
                    <pre className="whitespace-pre-wrap">
                      {`[PERSISTED KNOWLEDGE RECORD - "${inspectingMemory.title}"]\nSummary: ${
                        inspectingMemory.aiSummary || inspectingMemory.title
                      }\nContent: ${inspectingMemory.content}`}
                    </pre>
                  )}
                </div>
              </div>

              {/* Metadata Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Memory ID</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200 text-[11px] truncate block">
                    {inspectingMemory.id}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Source</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs capitalize block">
                    {inspectingMemory.source.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Created At</span>
                  <span className="text-slate-800 dark:text-slate-200 text-[11px] block">
                    {new Date(inspectingMemory.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Storage Engine</span>
                  <span className="text-emerald-600 font-bold text-[11px] block">Firestore Cloud</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    const mem = inspectingMemory;
                    setInspectingMemory(null);
                    setDeletingMemoryId(mem.id);
                  }}
                  className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Purge Memory
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const mem = inspectingMemory;
                      setInspectingMemory(null);
                      handleStartEdit(mem);
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit Context
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
