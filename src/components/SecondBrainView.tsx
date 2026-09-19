import React, { useState } from 'react';
import { Brain, Upload, Search, Sparkles, FileText, Database, Shield, Cpu, Tag, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

export const SecondBrainView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'recall' | 'ingest' | 'knowledge'>('recall');
  const [query, setQuery] = useState<string>('');
  const [engine, setEngine] = useState<'hybrid' | 'deepseek' | 'gemini'>('hybrid');
  const [enableDeepThink, setEnableDeepThink] = useState<boolean>(true);
  const [enableSearch, setEnableSearch] = useState<boolean>(true);

  const [recallResult, setRecallResult] = useState<{ answer: string; engineUsed: string; memoriesSearched: number } | null>(null);
  const [isRecalling, setIsRecalling] = useState<boolean>(false);

  // Ingest state
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [category, setCategory] = useState<'document' | 'media' | 'note' | 'workspace'>('document');
  const [tagsInput, setTagsInput] = useState<string>('ai, memory, notes');
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [ingestSuccess, setIngestSuccess] = useState<string | null>(null);

  const [memories, setMemories] = useState<Array<{ id: string; title: string; content: string; category: string; tags: string[]; createdAt: string; aiSummary?: string }>>([
    {
      id: 'mem_1',
      title: 'Vantage AI Assist Architecture Overview',
      content: 'Hybrid Gemini + Deepseek 2nd brain architecture integrating Google Workspace apps, persistent memory recall, and deepthink reasoning.',
      category: 'document',
      tags: ['ai', 'architecture', 'vantage'],
      createdAt: new Date().toISOString(),
      aiSummary: 'Core architecture blueprint for hybrid multi-model reasoning and workspace integration.'
    }
  ]);

  const handleRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsRecalling(true);
    setRecallResult(null);

    try {
      const res = await fetch('/api/vantage/recall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, engine, enableDeepThink, enableSearch }),
      });

      if (!res.ok) throw new Error('Failed to recall memory');
      const data = await res.json();
      setRecallResult(data);
    } catch (err: any) {
      console.error(err);
      setRecallResult({ answer: 'Error executing memory recall: ' + err.message, engineUsed: 'error', memoriesSearched: 0 });
    } finally {
      setIsRecalling(false);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setIsIngesting(true);
    setIngestSuccess(null);

    try {
      const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch('/api/vantage/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, category, tags }),
      });

      if (!res.ok) throw new Error('Failed to ingest document');
      const data = await res.json();
      if (data.memory) {
        setMemories(prev => [data.memory, ...prev]);
      }
      setIngestSuccess('Successfully ingested and summarized into your 2nd Brain!');
      setTitle('');
      setContent('');
    } catch (err: any) {
      console.error(err);
      alert('Ingestion error: ' + err.message);
    } finally {
      setIsIngesting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
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
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('recall')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'recall' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Search className="w-4 h-4" /> AI Memory Recall
        </button>
        <button
          onClick={() => setActiveTab('ingest')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'ingest' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Upload className="w-4 h-4" /> Ingest Docs & Media
        </button>
        <button
          onClick={() => setActiveTab('knowledge')}
          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold border-b-2 transition cursor-pointer ${
            activeTab === 'knowledge' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" /> Knowledge Base ({memories.length})
        </button>
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
                  Enable DeepThink Reasoning Mode
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={enableSearch}
                    onChange={(e) => setEnableSearch(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300"
                  />
                  Google Search Grounding
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
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" /> Recall Synthesis & Insights
            </h3>

            {isRecalling ? (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-xs font-medium">Synthesizing across Deepseek & Gemini memory banks...</p>
              </div>
            ) : recallResult ? (
              <div className="space-y-4 flex-1">
                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700">Engine Used: <span className="text-blue-600 uppercase">{recallResult.engineUsed}</span></span>
                  <span className="text-slate-500">{recallResult.memoriesSearched} memories indexed</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {recallResult.answer}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-16 text-slate-400 text-center space-y-2">
                <Brain className="w-12 h-12 text-slate-300" />
                <p className="text-sm font-medium text-slate-600">Enter a prompt on the left to query your 2nd Brain.</p>
                <p className="text-xs text-slate-400 max-w-sm">
                  Leverages true persistence learning memory recall with Deepseek and Gemini.
                </p>
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
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Title / Subject</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Q3 Strategic Roadmap & Meeting Notes"
                className="w-full text-sm p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                required
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

      {/* Tab 3: Knowledge Base */}
      {activeTab === 'knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-blue-600" /> Stored Memories ({memories.length})
            </h3>
            <span className="text-xs text-slate-500 font-medium">Synced with Persistent Cloud & Local Index</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((mem) => (
              <div key={mem.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                      {mem.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">{mem.title}</h4>
                  </div>
                  <span className="text-[11px] text-slate-400">{new Date(mem.createdAt).toLocaleDateString()}</span>
                </div>

                {mem.aiSummary && (
                  <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-medium">
                    <span className="font-semibold text-blue-600">AI Summary:</span> {mem.aiSummary}
                  </p>
                )}

                <p className="text-xs text-slate-500 line-clamp-2">{mem.content}</p>

                <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-100">
                  {mem.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400" /> {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
