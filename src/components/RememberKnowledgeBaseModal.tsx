import React, { useState, useRef } from 'react';
import { useMemory } from '../context/MemoryContext';
import { MemoryType, UserMemory } from '../types';
import {
  Brain,
  X,
  Search,
  Plus,
  Globe,
  Upload,
  Sparkles,
  Shield,
  FileText,
  Clock,
  Trash2,
  ExternalLink,
  Check,
  RefreshCw,
  Cloud,
  ChevronDown,
  ChevronUp,
  Tag,
  Play,
  Database
} from 'lucide-react';

export const RememberKnowledgeBaseModal: React.FC = () => {
  const {
    isKnowledgeBaseOpen,
    setIsKnowledgeBaseOpen,
    setIsMemoryExplorerOpen,
    memories,
    deleteMemory,
    ingestUrl,
    ingestFile,
    openRememberModal,
    cloudSyncStatus,
    refreshMemories,
    loading
  } = useMemory();

  const [activeFilter, setActiveFilter] = useState<'all' | MemoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMemoryId, setExpandedMemoryId] = useState<string | null>(null);

  // Ingest URL state
  const [urlInput, setUrlInput] = useState('');
  const [isScraping, setIsScraping] = useState(false);
  const [scrapeError, setScrapeError] = useState<string | null>(null);
  const [scrapeSuccess, setScrapeSuccess] = useState<string | null>(null);

  // File upload state
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isKnowledgeBaseOpen) return null;

  const filteredMemories = memories.filter((mem) => {
    const matchesFilter =
      activeFilter === 'all'
        ? true
        : activeFilter === 'instruction'
        ? mem.type === 'instruction' || mem.type === 'persona'
        : mem.type === activeFilter;

    const matchesSearch =
      !searchQuery.trim() ||
      mem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mem.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const handleScrapeUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    let targetUrl = urlInput.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    setIsScraping(true);
    setScrapeError(null);
    setScrapeSuccess(null);

    try {
      const ingested = await ingestUrl(targetUrl);
      setScrapeSuccess(`Ingested "${ingested.title}" into 2nd Brain knowledge base!`);
      setUrlInput('');
      setTimeout(() => setScrapeSuccess(null), 4000);
    } catch (err: any) {
      setScrapeError(err?.message || 'Failed to scrape URL.');
    } finally {
      setIsScraping(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploadingFile(true);
    setUploadError(null);

    try {
      await ingestFile(file);
    } catch (err: any) {
      setUploadError(err?.message || 'Failed to extract text from file.');
    } finally {
      setIsUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExecuteWorkflow = (mem: UserMemory) => {
    // Copy the payload or content and notify
    navigator.clipboard.writeText(mem.content);
    alert(`Automation payload for "${mem.title}" copied to clipboard! You can paste it directly into Copilot or the Logic Orchestrator.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs transition-opacity">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[90vh] max-h-[840px] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all relative">
        
        {/* Absolute Fail-Safe Close Button for Mobile Devices */}
        <button
          onClick={() => setIsKnowledgeBaseOpen(false)}
          className="absolute top-3.5 right-3.5 md:hidden text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-full cursor-pointer shadow-md transition-all z-50 flex items-center justify-center"
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="px-4 py-4 md:px-6 md:py-5 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/70 dark:bg-slate-950/60 pr-12 md:pr-6">
          <div className="flex items-start md:items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                  2nd Brain Memory & Knowledge Base
                </h2>
                <span className="text-[10px] md:text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 flex items-center gap-1 shrink-0 w-fit">
                  <Cloud className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  {cloudSyncStatus === 'synced' ? 'Cloud Synced (Firestore)' : 'Local Storage Session'}
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Persistent persona instructions, ingested URL scrapes, document extractions, and saved automation payloads.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => refreshMemories()}
              disabled={loading}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition shrink-0"
              title="Refresh & Sync Memories"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                setIsKnowledgeBaseOpen(false);
                setIsMemoryExplorerOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 py-2 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-xl border border-indigo-200 dark:border-indigo-900/60 shadow-xs transition cursor-pointer"
              title="Open Agent Memory Explorer to inspect AI reasoning and edit memories"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="whitespace-nowrap">Memory Explorer</span>
            </button>
            <button
              onClick={() => openRememberModal()}
              className="flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap">Remember New</span>
            </button>
            <button
              onClick={() => setIsKnowledgeBaseOpen(false)}
              className="hidden md:flex text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Toolbar: Ingest URL & Upload Document */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/40 dark:bg-slate-900/40 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          {/* URL Scraper Ingest */}
          <form onSubmit={handleScrapeUrl} className="flex gap-2 items-center bg-white dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Globe className="w-4 h-4 text-blue-500 shrink-0 ml-1" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Ingest webpage URL (e.g. https://docs.google.com/specs)..."
              className="w-full text-xs bg-transparent outline-none text-slate-800 dark:text-slate-200 placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={isScraping || !urlInput.trim()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-[11px] shrink-0 disabled:opacity-50 transition cursor-pointer flex items-center gap-1"
            >
              {isScraping ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Scraping...
                </>
              ) : (
                'Scrape & Learn'
              )}
            </button>
          </form>

          {/* File Upload Ingest */}
          <div className="flex gap-2 items-center bg-white dark:bg-slate-950 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Upload className="w-4 h-4 text-emerald-500 shrink-0 ml-1" />
            <div className="flex-1 truncate text-slate-600 dark:text-slate-400 text-xs">
              {isUploadingFile ? 'Extracting text with Gemini...' : 'Upload PDF, DOCX, CSV, Markdown, or TXT'}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.txt,.md,.markdown,.csv,.json,.docx"
              className="hidden"
            />
            <button
              type="button"
              disabled={isUploadingFile}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-medium rounded-xl text-[11px] shrink-0 transition cursor-pointer"
            >
              {isUploadingFile ? 'Parsing...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {/* Feedback Messages */}
        {scrapeSuccess && (
          <div className="px-6 py-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 border-b border-emerald-100 dark:border-emerald-900/60">
            <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{scrapeSuccess}</span>
          </div>
        )}
        {(scrapeError || uploadError) && (
          <div className="px-6 py-2 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs flex items-center gap-2 border-b border-red-100 dark:border-red-900/60">
            <X className="w-4 h-4 text-red-500 shrink-0" />
            <span>{scrapeError || uploadError}</span>
          </div>
        )}

        {/* Filter Tabs & Search */}
        <div className="px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Knowledge', count: memories.length },
              {
                id: 'instruction',
                label: '🎭 Persona & Instructions',
                count: memories.filter((m) => m.type === 'persona' || m.type === 'instruction').length
              },
              {
                id: 'url_scrape',
                label: '🌐 Scraped URLs',
                count: memories.filter((m) => m.type === 'url_scrape').length
              },
              {
                id: 'file_extracted',
                label: '📄 Extracted Documents',
                count: memories.filter((m) => m.type === 'file_extracted').length
              },
              {
                id: 'agent_workflow',
                label: '⚡ Automations & Cron',
                count: memories.filter((m) => m.type === 'agent_workflow').length
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${
                  activeFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeFilter === tab.id
                      ? 'bg-blue-700/60 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memory bank..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Memories Content List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredMemories.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Brain className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No memories found matching this view
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Click "Remember New", scrape a web URL, or upload a document to expand your 2nd Brain knowledge base.
              </p>
            </div>
          ) : (
            filteredMemories.map((mem) => {
              const isExpanded = expandedMemoryId === mem.id;
              const isWorkflow = mem.type === 'agent_workflow';

              return (
                <div
                  key={mem.id}
                  className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            mem.type === 'persona'
                              ? 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60'
                              : mem.type === 'instruction'
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60'
                              : mem.type === 'url_scrape'
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60'
                              : mem.type === 'file_extracted'
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                              : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60'
                          }`}
                        >
                          {mem.type.replace('_', ' ')}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {mem.title}
                        </h4>
                        {mem.metadata?.cronSchedule && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-blue-500" />
                            Cron: {mem.metadata.cronSchedule}
                          </span>
                        )}
                      </div>

                      {mem.sourceUrl && (
                        <a
                          href={mem.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {mem.sourceUrl}
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isWorkflow && (
                        <button
                          onClick={() => handleExecuteWorkflow(mem)}
                          className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                          title="Copy workflow payload for execution"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Recall Payload</span>
                        </button>
                      )}
                      <button
                        onClick={() => deleteMemory(mem.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Delete Memory"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Content Preview / Full Text */}
                  <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 font-mono whitespace-pre-wrap leading-relaxed">
                    {isExpanded ? mem.content : mem.content.slice(0, 240)}
                    {mem.content.length > 240 && (
                      <button
                        onClick={() => setExpandedMemoryId(isExpanded ? null : mem.id)}
                        className="ml-2 text-blue-600 dark:text-blue-400 font-sans font-semibold hover:underline inline-flex items-center gap-0.5"
                      >
                        {isExpanded ? (
                          <>
                            Show less <ChevronUp className="w-3 h-3" />
                          </>
                        ) : (
                          <>
                            Show full ({mem.content.length} chars) <ChevronDown className="w-3 h-3" />
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Footer Meta & Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {mem.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 text-[10px] text-slate-400">
                      <span>Source: {mem.source}</span>
                      <span>•</span>
                      <span>{new Date(mem.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
