import React, { useState } from 'react';
import { useMemory } from '../context/MemoryContext';
import { Brain, Upload, Search, Sparkles, FileText, Database, Shield, Cpu, Tag, CheckCircle2, Loader2, ArrowRight, User, RotateCcw, Trash2, CloudCheck, ExternalLink, Cloud, Code, Box, Lock, BookOpen } from 'lucide-react';
import { AgentMemoryExplorer } from './AgentMemoryExplorer';
import { GuardrailsAndBoundariesStudio } from './GuardrailsAndBoundariesStudio';
import { StandalonePluginArchetypeGenerator } from './StandalonePluginArchetypeGenerator';
import { MemoryScenariosPanel } from './MemoryScenariosPanel';
import { isMikeFordAdmin, ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';
import { getByokHttpHeaders } from '../utils/byokStorage';
import { auth } from '../services/firebase';

interface BrainChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  engineUsed?: string;
  memoriesSearched?: number;
}

export const SecondBrainView: React.FC = () => {
  const {
    memories,
    saveMemory,
    deleteMemory,
    ingestUrl,
    ingestFile,
    openRememberModal,
    cloudSyncStatus,
    setIsKnowledgeBaseOpen,
    activePersona,
    guardrails,
    setIsGuardrailsModalOpen
  } = useMemory();

  const [activeTab, setActiveTab] = useState<'recall' | 'ingest' | 'explorer' | 'guardrails' | 'scenarios' | 'plugin_generator'>('recall');
  const [query, setQuery] = useState<string>('');
  const [engine, setEngine] = useState<'hybrid' | 'deepseek' | 'gemini'>('hybrid');
  const [enableDeepThink, setEnableDeepThink] = useState<boolean>(true);
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [enableCodeExpansion, setEnableCodeExpansion] = useState<boolean>(true);

  const [chatHistory, setChatHistory] = useState<BrainChatMessage[]>([]);
  const [recallResult, setRecallResult] = useState<{ answer: string; engineUsed: string; memoriesSearched: number } | null>(null);
  const [isRecalling, setIsRecalling] = useState<boolean>(false);

  // Ingest state
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [urlInput, setUrlInput] = useState<string>('');
  const [category, setCategory] = useState<'instruction' | 'knowledge' | 'workflow' | 'document'>('knowledge');
  const [tagsInput, setTagsInput] = useState<string>('ai, memory, vantage');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtractingAudio, setIsExtractingAudio] = useState<boolean>(false);

  const handleRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    const promptText = query.trim();
    if (!promptText) return;

    const userMessage: BrainChatMessage = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...chatHistory, userMessage];
    setChatHistory(newHistory);
    setQuery('');
    setIsRecalling(true);

    try {
      const headers = getByokHttpHeaders({ 'Content-Type': 'application/json' });
      const res = await fetch('/api/vantage/recall', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query: promptText,
          engine,
          enableDeepThink,
          enableSearch,
          enableCodeExpansion,
          history: chatHistory.map(h => ({ sender: h.sender, text: h.text })),
          userMemories: memories,
          guardrails: guardrails
        }),
      });

      if (!res.ok) throw new Error('Failed to query 2nd Brain');
      const data = await res.json();
      const botMessage: BrainChatMessage = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engineUsed: data.engineUsed,
        memoriesSearched: data.memoriesSearched
      };
      setChatHistory([...newHistory, botMessage]);
      setRecallResult(data);
    } catch (err: any) {
      console.error(err);
      const errorMsg: BrainChatMessage = {
        id: 'err_' + Date.now(),
        sender: 'assistant',
        text: 'Error executing query: ' + err.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        engineUsed: 'error',
        memoriesSearched: 0
      };
      setChatHistory([...newHistory, errorMsg]);
    } finally {
      setIsRecalling(false);
    }
  };

  const handleClearChat = () => {
    setChatHistory([]);
    setRecallResult(null);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      alert('File size exceeds 50MB maximum limit.');
      return;
    }

    setUploadedFile(file);
    setIsExtractingAudio(true);
    setToastMessage(`Processing & extracting text from "${file.name}" with Gemini AI...`);

    try {
      const newMemory = await ingestFile(file);
      setIsExtractingAudio(false);
      const successMsg = `Successfully extracted & persisted "${newMemory.title}" to Firebase Firestore & local session!`;
      setIngestSuccess(successMsg);
      setToastMessage(successMsg);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      console.error(err);
      alert('File extraction error: ' + err.message);
      setIsExtractingAudio(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !urlInput.trim()) {
      alert('Please provide either a Title with Content or a Website URL.');
      return;
    }
    setIsIngesting(true);
    setIngestSuccess(null);

    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      if (urlInput.trim()) {
        const mem = await ingestUrl(urlInput.trim(), tags);
        const successMsg = `Successfully scraped, summarized & persisted URL: ${urlInput} to Firestore!`;
        setIngestSuccess(successMsg);
        setToastMessage(successMsg);
      } else {
        await saveMemory({
          title: title.trim(),
          content: content.trim(),
          type: category as any,
          tags
        });
        const successMsg = `Successfully ingested "${title}" into 2nd Brain Cloud Persistence!`;
        setIngestSuccess(successMsg);
        setToastMessage(successMsg);
      }
      setTimeout(() => setToastMessage(null), 5000);

      setTitle('');
      setContent('');
      setUrlInput('');
    } catch (err: any) {
      console.error(err);
      alert('Ingestion error: ' + err.message);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div className="text-xs">
            <div className="font-bold text-slate-100">2nd Brain Ingested Successfully</div>
            <div className="text-slate-300">{toastMessage}</div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-semibold w-fit mb-3 border border-white/10">
              <Brain className="w-4 h-4 text-cyan-400" /> Vantage 2nd Brain AI
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Hybrid Deepseek + Gemini Persistent Memory & Ingestion</h2>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              True persistence learning memory recall with DeepThink reasoning, live search grounding, and secure Firebase + Cloud Run cloud storage.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10">
            <Cpu className="w-8 h-8 text-cyan-400" />
            <div>
              <div className="text-xs text-slate-400">AI Engine Status</div>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Active (Hybrid Model)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation sub-tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recall')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'recall' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" /> AI Memory Recall
        </button>
        <button
          onClick={() => setActiveTab('ingest')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'ingest' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" /> Ingest Docs & Media
        </button>
        <button
          onClick={() => setActiveTab('explorer')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'explorer' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" /> Agent Memory Explorer ({memories.length})
        </button>
        <button
          onClick={() => setActiveTab('guardrails')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'guardrails' ? 'border-emerald-600 text-emerald-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4 text-emerald-600" /> Boundaries & Guardrails
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800">
            {guardrails.personalityPreset}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('scenarios')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition shrink-0 cursor-pointer ${
            activeTab === 'scenarios' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4 text-blue-600" /> Memory Scenarios
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800">
            3 Categories
          </span>
        </button>

        {/* Secured Admin-Only Plugin Distribution Vault (Visible ONLY if Mike Ford Admin is signed in) */}
        {isMikeFordAdmin(auth.currentUser) && (
          <button
            onClick={() => setActiveTab('plugin_generator')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition shrink-0 cursor-pointer ${
              activeTab === 'plugin_generator' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-indigo-600" /> Admin Plugin Vault
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
              Mike Ford
            </span>
          </button>
        )}
      </div>

      {/* Tab 1: AI Memory Recall */}
      {activeTab === 'recall' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" /> Query 2nd Brain
            </h3>
            <p className="text-xs text-slate-500">
              Ask anything across all ingested documents, notes, media summaries, and workspace data.
            </p>

            <form onSubmit={handleRecall} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recall Prompt / Question</label>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. What were the key takeaways from the Vantage architecture notes and recent emails?"
                  rows={4}
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reasoning Engine</label>
                <select
                  value={engine}
                  onChange={(e: any) => setEngine(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="hybrid">Hybrid (Deepseek + Gemini)</option>
                  <option value="deepseek">Deepseek (DeepThink)</option>
                  <option value="gemini">Gemini Flash</option>
                </select>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={enableDeepThink}
                    onChange={(e) => setEnableDeepThink(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Enable DeepThink Reasoning Mode</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={enableCodeExpansion}
                    onChange={(e) => setEnableCodeExpansion(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                  />
                  <span>Reasoning Skills & Code Expansion (Production logic & complete code)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={enableSearch}
                    onChange={(e) => setEnableSearch(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  <span>Google Search Grounding</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isRecalling}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {isRecalling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Recalling Memory...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" /> Query 2nd Brain
                  </>
                )}
              </button>

              {/* Active Guardrails Card */}
              <div className="pt-3 border-t border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600" /> Active Guardrails
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('guardrails')}
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    Customize
                  </button>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] space-y-1.5">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Archetype:</span>
                    <span className="font-bold text-slate-800 capitalize">{guardrails.personalityPreset}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Demeanor:</span>
                    <span className="font-medium text-slate-700 capitalize">{guardrails.toneDemeanor?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Action Boundary:</span>
                    <span className="font-medium text-slate-700 capitalize">{guardrails.actionExecutionBoundary?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Forbidden Curbs:</span>
                    <span className="font-semibold text-rose-600">{guardrails.forbiddenTopics?.length || 0} topics</span>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col min-h-[500px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-indigo-600" /> 2nd Brain Reasoning & Conversation
                </h3>
                <button
                  type="button"
                  onClick={() => setIsGuardrailsModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                  title="Click to view or edit 2nd Brain guardrails"
                >
                  <Shield className="w-3 h-3 text-emerald-600" />
                  <span>Aligned: {guardrails.personalityPreset}</span>
                </button>
              </div>
              {chatHistory.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-medium transition cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Clear Chat
                </button>
              )}
            </div>

            {chatHistory.length === 0 && !isRecalling ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <Brain className="w-7 h-7 text-indigo-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-slate-700">Your 2nd Brain is ready with free unconstrained reasoning.</p>
                  <p className="text-xs text-slate-400 max-w-md">
                    Ask any prompt engineering question, exploratory learning topic, deep research inquiry, or query your ingested documents.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[600px] pr-2">
                {chatHistory.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400 font-medium">
                      {msg.sender === 'user' ? (
                        <>
                          <span>You</span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </>
                      ) : (
                        <>
                          <span className="text-indigo-600 font-semibold">2nd Brain</span>
                          {msg.engineUsed && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 font-mono text-[10px] uppercase border border-blue-200">
                              {msg.engineUsed}
                            </span>
                          )}
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </>
                      )}
                    </div>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-blue-600 text-white max-w-[85%] rounded-tr-xs shadow-xs'
                          : 'bg-slate-50 border border-slate-200 text-slate-800 max-w-[95%] rounded-tl-xs font-sans'
                      }`}
                    >
                      {msg.text}

                      <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-end gap-2">
                        {msg.text.includes('```') && (
                          <button
                            type="button"
                            onClick={() => openRememberModal({
                              title: `Code: ${msg.text.slice(0, 30).replace(/[`\n]/g, '')}`,
                              content: msg.text,
                              type: 'agent_workflow'
                            })}
                            className="flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200"
                            title="Save this expanded code / automation script to persistent memory"
                          >
                            <Code className="w-3 h-3" />
                            <span>Save Code</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openRememberModal({
                            title: msg.sender === 'user' ? `Query Directive: ${msg.text.slice(0, 35)}` : `Learned Insight: ${msg.text.slice(0, 35)}`,
                            content: msg.text,
                            type: 'instruction'
                          })}
                          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-lg transition cursor-pointer ${
                            msg.sender === 'user'
                              ? 'bg-white/20 hover:bg-white/30 text-white'
                              : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200'
                          }`}
                          title="Save this to persistent Firestore memory and persona"
                        >
                          <Brain className="w-3 h-3" />
                          <span>Remember this</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {isRecalling && (
                  <div className="flex items-start gap-3 p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 animate-pulse">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0 mt-0.5" />
                    <div className="text-xs text-indigo-900 space-y-1">
                      <p className="font-semibold">2nd Brain is reasoning deeply...</p>
                      <p className="text-indigo-700">Synthesizing insights across hybrid Gemini & DeepSeek models.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Ingest Docs & Media */}
      {activeTab === 'ingest' && (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" /> Ingest Document, Media or Note
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Add new records to your persistent 2nd brain. AI will automatically generate summaries and tag them for instant recall.
            </p>
          </div>

          {ingestSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-medium">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{ingestSuccess}</span>
            </div>
          )}

          <form onSubmit={handleIngest} className="space-y-4">
            {/* Comprehensive File Upload (Max 50MB) */}
            <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3">
              <label className="block text-xs font-bold text-indigo-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-600" /> Upload File (Max 50MB - PDF, TXT, CSV, JSON, MD, DOCX, XLSX, MP4, MPEG-2, AVI, HEIC, AAC, QT, MP3, FLAC, RAW, TIFF)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-indigo-200 rounded-xl bg-white hover:bg-indigo-50/30 transition cursor-pointer">
                  {isExtractingAudio ? (
                    <div className="flex items-center gap-2 text-indigo-600 text-xs font-semibold">
                      <Loader2 className="w-5 h-5 animate-spin" /> Converting to .txt / JSON & Ingesting...
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-indigo-500 mb-1" />
                      <span className="text-xs font-semibold text-slate-700">Click to upload file (PDF, DOCX, MP4, MP3, etc.)</span>
                      <span className="text-[10px] text-slate-400">Max file size: 50MB • Converts to extracted .txt or JSON</span>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.txt,.csv,.json,.md,.docx,.xlsx,.mp4,.mpeg,.avi,.heic,.aac,.qt,.mp3,.flac,.raw,.tiff,video/*,audio/*,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
              {uploadedFile && !isExtractingAudio && (
                <div className="text-[11px] text-indigo-800 font-medium flex items-center justify-between bg-white p-2 rounded-lg border border-indigo-100">
                  <span>Uploaded: {uploadedFile.name} ({(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)</span>
                  <span className="text-emerald-600 font-bold">Converted to .txt / JSON</span>
                </div>
              )}
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
              <label className="block text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-blue-600" /> Scrape Website URL (Optional Live Web Learning)
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/article-or-documentation"
                  className="w-full text-xs p-3 rounded-xl border border-blue-200 bg-white focus:border-blue-500 outline-none"
                />
              </div>
              <p className="text-[11px] text-blue-700">
                Enter a live website URL above to automatically scrape, summarize, and index its content for long-term situational recall.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Subject (or auto-detected from URL)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Strategic Roadmap or leave blank for URL title"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800"
                >
                  <option value="document">Document / PDF</option>
                  <option value="media">Media / Audio Transcript</option>
                  <option value="note">Quick Note</option>
                  <option value="workspace">Workspace Sync</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="strategy, q3, notes"
                  className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Content / Transcript / Text</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste the raw text, notes, document excerpt, or media transcript here..."
                rows={6}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-blue-500 outline-none font-sans"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isIngesting}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              {isIngesting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Ingesting & Summarizing with AI...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" /> Ingest into 2nd Brain
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Agent Memory Explorer */}
      {activeTab === 'explorer' && (
        <AgentMemoryExplorer />
      )}

      {/* Tab 4: Boundaries & Guardrail Customization Studio */}
      {activeTab === 'guardrails' && (
        <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-xs min-h-[700px]">
          <GuardrailsAndBoundariesStudio />
        </div>
      )}

      {/* Tab: Memory Scenarios Playbook */}
      {activeTab === 'scenarios' && (
        <MemoryScenariosPanel />
      )}

      {/* Tab 5: Standalone Plugin Archetype & LLM Prompt Generator */}
      {activeTab === 'plugin_generator' && (
        <StandalonePluginArchetypeGenerator />
      )}
    </div>
  );
};
