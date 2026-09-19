import React, { useState, useEffect } from 'react';
import { WorkflowStep, WorkflowTemplate } from './LogicOrchestratorView';
import { Bot, Sparkles, Bookmark, ThumbsUp, ThumbsDown, Heart, Search, Tag, Plus, X, Share2, Download, Code, FileText, Eye, RefreshCw, CheckCircle2, AlertCircle, Mic, Brain, Trash2, Calendar, Mail, File, Table, CheckSquare, Users } from 'lucide-react';

interface AppAIPromptAndTemplateManagerProps {
  appId: string; // 'gmail' | 'calendar' | 'drive' | 'sheets' | 'tasks' | 'contacts' | 'drafts'
  appName: string;
  appDescription: string;
  appIcon: React.ReactNode;
  contextData?: any;
  onExecuteAction?: (action: any) => void;
  onLoadTemplateToStudio?: (template: WorkflowTemplate) => void;
}

const DEFAULT_APP_TEMPLATES: Record<string, WorkflowTemplate[]> = {
  gmail: [
    {
      id: 'gmail_t1',
      name: 'VIP Executive Email Triage & Draft Reply',
      description: 'Scans unread messages from VIP contacts, synthesizes sentiment, and drafts high-priority contextual replies.',
      tags: ['Gmail', 'VIP', 'Productivity', 'Email-Automation'],
      upvotes: 48,
      downvotes: 1,
      isFavorite: true,
      steps: [
        { id: 'g1', name: 'Fetch Unread VIP Threads', type: 'gmail_draft', config: { recipient: 'vip@exec.com', subject: 'Priority Review' } },
        { id: 'g2', name: 'Gemini DeepThink Sentiment & Draft', type: 'ai_synthesize', config: { prompt: 'Analyze sender tone and draft a concise executive reply.' } },
        { id: 'g3', name: 'Create Draft in Gmail', type: 'gmail_draft', config: { subject: 'Follow-up: Q3 Strategy', recipient: 'client@company.com' } }
      ]
    },
    {
      id: 'gmail_t2',
      name: 'Automated Newsletter & RSS Digest Summarizer',
      description: 'Extracts newsletters, groups key industry bullet points, and formats a daily digest document.',
      tags: ['Newsletter', 'Digest', 'Cleanup', 'AI-Synthesis'],
      upvotes: 29,
      downvotes: 0,
      isFavorite: false,
      steps: [
        { id: 'gn1', name: 'Scan Newsletter Messages', type: 'gmail_draft', config: { subject: 'Weekly Digest' } },
        { id: 'gn2', name: 'AI Synthesis of Key Insights', type: 'ai_synthesize', config: { prompt: 'Summarize key tech bulletins into 3 bullet points.' } },
        { id: 'gn3', name: 'Save Digest to Google Docs', type: 'docs_create', config: { docTitle: 'Daily Executive Digest' } }
      ]
    }
  ],
  calendar: [
    {
      id: 'cal_t1',
      name: 'Conflict-Free Meeting Batch Scheduler & Agenda Builder',
      description: 'Finds optimal calendar slots across participants, drafts meeting agendas, and schedules events.',
      tags: ['Calendar', 'Scheduling', 'Meetings', 'Productivity'],
      upvotes: 55,
      downvotes: 2,
      isFavorite: true,
      steps: [
        { id: 'c1', name: 'Analyze Calendar Free Slots', type: 'calendar_event', config: { eventTitle: 'Strategy Sync' } },
        { id: 'c2', name: 'Generate AI Agenda via DeepThink', type: 'ai_synthesize', config: { prompt: 'Create 4-item agenda for quarterly alignment.' } },
        { id: 'c3', name: 'Schedule Google Calendar Event', type: 'calendar_event', config: { eventTitle: 'Quarterly Alignment Sync' } }
      ]
    }
  ],
  drive: [
    {
      id: 'drv_t1',
      name: 'Smart Document Classification & Folder Sync',
      description: 'Scans recent Drive uploads, extracts text summaries, and categorizes files into appropriate project folders.',
      tags: ['Drive', 'Organization', 'Files', 'Storage'],
      upvotes: 34,
      downvotes: 1,
      isFavorite: false,
      steps: [
        { id: 'd1', name: 'Scan Recent Drive Files', type: 'scrape_url', config: { url: 'https://drive.google.com/drive/recent' } },
        { id: 'd2', name: 'AI Classification & Tagging', type: 'ai_synthesize', config: { prompt: 'Categorize files by project category and summarize content.' } },
        { id: 'd3', name: 'Generate Summary Google Doc', type: 'docs_create', config: { docTitle: 'Drive Index Summary' } }
      ]
    }
  ],
  sheets: [
    {
      id: 'sht_t1',
      name: 'Automated KPI Data Aggregator & Analytics Feed',
      description: 'Pulls metrics from web sources or workspace logs and formats structured tabular data.',
      tags: ['Sheets', 'Analytics', 'Finance', 'Data'],
      upvotes: 40,
      downvotes: 1,
      isFavorite: true,
      steps: [
        { id: 'sh1', name: 'Fetch Data Source Metrics', type: 'scrape_url', config: { url: 'https://api.metrics.sample/kpi' } },
        { id: 'sh2', name: 'AI Data Cleansing & Formatting', type: 'ai_synthesize', config: { prompt: 'Format extracted metrics into rows and columns.' } }
      ]
    }
  ],
  tasks: [
    {
      id: 'tsk_t1',
      name: 'Prioritized Daily Sprint Planner & Checklist Generator',
      description: 'Reviews calendar, unread emails, and pending items to formulate a ranked daily task checklist.',
      tags: ['Tasks', 'Planning', 'Sprint', 'Productivity'],
      upvotes: 62,
      downvotes: 3,
      isFavorite: true,
      steps: [
        { id: 't1', name: 'Gather Workspace Action Items', type: 'ai_synthesize', config: { prompt: 'Extract open tasks from calendar and messages.' } },
        { id: 't2', name: 'Create Google Tasks Checklist', type: 'gmail_draft', config: { subject: 'Daily Sprint' } }
      ]
    }
  ],
  contacts: [
    {
      id: 'cnt_t1',
      name: 'VIP Client Relationship & Meeting History Sync',
      description: 'Enriches contact profiles with recent email interactions and scheduled meetings.',
      tags: ['CRM', 'Contacts', 'Networking', 'Sales'],
      upvotes: 27,
      downvotes: 0,
      isFavorite: false,
      steps: [
        { id: 'cn1', name: 'Scan Contact Communications', type: 'gmail_draft', config: { recipient: 'lead@client.com', subject: 'CRM Sync' } },
        { id: 'cn2', name: 'AI Relationship Health Scoring', type: 'ai_synthesize', config: { prompt: 'Calculate engagement score and recommend next touchpoint.' } }
      ]
    }
  ],
  drafts: [
    {
      id: 'dft_t1',
      name: 'AI Proposal Generator & Executive Pitch Writer',
      description: 'Synthesizes project outlines into professionally styled executive pitches and markdown proposals.',
      tags: ['Pitch', 'Proposals', 'Sales', 'AI-Writing'],
      upvotes: 51,
      downvotes: 2,
      isFavorite: true,
      steps: [
        { id: 'df1', name: 'Ingest Client Requirements', type: 'ai_synthesize', config: { prompt: 'Outline core deliverables and value proposition.' } },
        { id: 'df2', name: 'Create Google Doc Proposal', type: 'docs_create', config: { docTitle: 'Client Proposal - Q3' } }
      ]
    }
  ]
};

export const AppAIPromptAndTemplateManager: React.FC<AppAIPromptAndTemplateManagerProps> = ({
  appId,
  appName,
  appDescription,
  appIcon,
  contextData,
  onExecuteAction,
  onLoadTemplateToStudio
}) => {
  // Local persistent state for app templates
  const [appTemplates, setAppTemplates] = useState<WorkflowTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(`vantage_app_templates_${appId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return DEFAULT_APP_TEMPLATES[appId] || DEFAULT_APP_TEMPLATES.gmail;
  });

  // Long-term memory log of past prompts & executions for this app
  const [appMemoryLog, setAppMemoryLog] = useState<Array<{ id: string; prompt: string; summary: string; timestamp: string }>>(() => {
    try {
      const stored = localStorage.getItem(`vantage_app_memory_${appId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'mem_1',
        prompt: `Optimize and triage recent ${appName} workflows for maximum productivity.`,
        summary: `Initialized 2nd brain memory bank for ${appName} with situational recall enabled.`,
        timestamp: 'Today, 9:00 AM'
      }
    ];
  });

  // Prompt Studio state
  const [promptInput, setPromptInput] = useState('');
  const [enableDeepThink, setEnableDeepThink] = useState(true);
  const [enableSearch, setEnableSearch] = useState(true);
  const [isPrompting, setIsPrompting] = useState(false);
  const [copilotResult, setCopilotResult] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Template manager UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'score' | 'newest' | 'steps' | 'alphabetical'>('score');
  const [quickPeekTemplateId, setQuickPeekTemplateId] = useState<string | null>(null);

  // Save templates to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(`vantage_app_templates_${appId}`, JSON.stringify(appTemplates));
    } catch (e) {}
  }, [appTemplates, appId]);

  useEffect(() => {
    try {
      localStorage.setItem(`vantage_app_memory_${appId}`, JSON.stringify(appMemoryLog));
    } catch (e) {}
  }, [appMemoryLog, appId]);

  const handleRunAppPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsPrompting(true);
    setCopilotResult(null);

    try {
      const res = await fetch('/api/gemini/workspace-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `[${appName} Context] ${promptInput}`,
          workspaceContext: contextData || {},
          activeTab: appId,
          enableDeepThink,
          enableSearch
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to process AI prompt');
      }

      const data = await res.json();
      setCopilotResult(data);

      // Record into long-term memory log
      const newEntry = {
        id: `mem_${Date.now()}`,
        prompt: promptInput,
        summary: data.summary || 'Executed prompt successfully.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setAppMemoryLog(prev => [newEntry, ...prev.slice(0, 9)]);
      setSuccessMsg(`Vantage AI processed ${appName} prompt successfully!`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setSuccessMsg(`Error: ${err.message}`);
      setTimeout(() => setSuccessMsg(null), 3500);
    } finally {
      setIsPrompting(false);
    }
  };

  const handleVote = (templateId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    setAppTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        return {
          ...t,
          upvotes: direction === 'up' ? (t.upvotes ?? 15) + 1 : (t.upvotes ?? 15),
          downvotes: direction === 'down' ? (t.downvotes ?? 1) + 1 : (t.downvotes ?? 1)
        };
      }
      return t;
    }));
    setSuccessMsg(direction === 'up' ? 'Upvoted template!' : 'Recorded feedback.');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleToggleFavorite = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAppTemplates(prev => prev.map(t => {
      if (t.id === templateId) {
        return { ...t, isFavorite: !t.isFavorite };
      }
      return t;
    }));
    setSuccessMsg('Updated template favorites.');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  // Collect unique tags for this app's templates
  const allTags = Array.from(new Set(appTemplates.flatMap(t => t.tags || [appName])));

  const filteredTemplates = appTemplates.filter(t => {
    if (showFavoritesOnly && !t.isFavorite) return false;
    if (selectedTagFilter && !(t.tags || []).some(tg => tg.toLowerCase() === selectedTagFilter.toLowerCase())) return false;
    if (!searchQuery.trim()) return true;

    const q = searchQuery.trim().toLowerCase();
    if (q === 'fav' || q === 'favorite') return t.isFavorite;
    if (q === 'top' || q === 'score') return ((t.upvotes ?? 15) - (t.downvotes ?? 1)) >= 20;

    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      (t.tags || []).some(tg => tg.toLowerCase().includes(q))
    );
  }).sort((a, b) => {
    const scoreA = (a.upvotes ?? 15) - (a.downvotes ?? 1);
    const scoreB = (b.upvotes ?? 15) - (b.downvotes ?? 1);
    if (sortBy === 'score') return scoreB - scoreA;
    if (sortBy === 'steps') return b.steps.length - a.steps.length;
    if (sortBy === 'alphabetical') return a.name.localeCompare(b.name);
    return b.id.localeCompare(a.id);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Success Notification Banner */}
      {successMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-200 p-3.5 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700">×</button>
        </div>
      )}

      {/* SECTION 1: APP-SPECIFIC VANTAGE AI PROMPT STUDIO & 2ND BRAIN */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              {appIcon}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{appName} Vantage AI 2nd Brain Copilot</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Hybrid DeepSeek + Gemini
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Prompt engineer tasks, automated agent routines, and multi-step workflows specific to {appName}.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-500" />
              <span>Situational Recall Active</span>
            </span>
          </div>
        </div>

        <form onSubmit={handleRunAppPrompt} className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableDeepThink}
                  onChange={(e) => setEnableDeepThink(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> DeepThink Mode
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableSearch}
                  onChange={(e) => setEnableSearch(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Google Search Grounding
                </span>
              </label>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Contextual {appName} Memory Synced</span>
          </div>

          <div className="relative">
            <textarea
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder={`Ask Vantage AI to engineer tasks, draft templates, or run agent routines for ${appName}...`}
              rows={3}
              className="w-full p-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
            />
          </div>

          <div className="flex justify-between items-center flex-wrap gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Tip: Use app templates below or type custom multi-step prompt instructions.</span>
            </div>
            <button
              type="submit"
              disabled={isPrompting || !promptInput.trim()}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isPrompting ? 'animate-spin' : ''}`} />
              {isPrompting ? 'Running AI Copilot...' : `Run ${appName} Prompt`}
            </button>
          </div>
        </form>

        {copilotResult && (
          <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Vantage AI Copilot Analysis & Execution Plan</span>
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{copilotResult.summary}</p>
            {copilotResult.suggestedActions && copilotResult.suggestedActions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {copilotResult.suggestedActions.map((action: any) => (
                  <div key={action.id} className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        {action.type}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1">{action.title}</h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{action.description}</p>
                    </div>
                    {onExecuteAction && (
                      <button
                        onClick={() => onExecuteAction(action)}
                        className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition"
                      >
                        Execute Action
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 2: APP-SPECIFIC SUB TEMPLATE MANAGER */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-blue-600" />
              <span>{appName} Sub Template Manager & Agent Routines</span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200">
                {appTemplates.length} Templates
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Build, vote, favorite, and load app-specific prompt-engineered routines and scheduled multi-step tasks.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${appName} templates or #tags...`}
                className="pl-9 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl px-3 py-2 text-xs font-semibold"
            >
              <option value="score">Most Voted (Score)</option>
              <option value="newest">Newest First</option>
              <option value="steps">Step Count</option>
              <option value="alphabetical">Alphabetical (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Filter Bar & Tags */}
        <div className="flex items-center justify-between gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => { setShowFavoritesOnly(false); setSelectedTagFilter(null); }}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                !showFavoritesOnly && !selectedTagFilter ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              All ({appTemplates.length})
            </button>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                showFavoritesOnly ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current text-white' : 'text-rose-500'}`} />
              <span>Favorites ({appTemplates.filter(t => t.isFavorite).length})</span>
            </button>

            {allTags.map(tag => {
              const isActive = selectedTagFilter?.toLowerCase() === tag.toLowerCase();
              return (
                <button
                  key={tag}
                  onClick={() => setSelectedTagFilter(isActive ? null : tag)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                    isActive ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  #{tag}
                </button>
              );
            })}
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <strong>{filteredTemplates.length}</strong> of {appTemplates.length} templates
          </div>
        </div>

        {/* Template Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.map(template => {
            const score = (template.upvotes ?? 15) - (template.downvotes ?? 1);
            return (
              <div
                key={template.id}
                className="bg-slate-50/60 dark:bg-slate-800/40 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col justify-between space-y-4 hover:border-blue-400 transition"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md border border-blue-100 dark:border-blue-900">
                      {template.steps.length} Steps
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={(e) => handleToggleFavorite(template.id, e)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          template.isFavorite ? 'bg-rose-600 text-white border-rose-600' : 'bg-white dark:bg-slate-900 text-slate-500 hover:text-rose-500 border-slate-200 dark:border-slate-700'
                        }`}
                        title="Toggle Favorite"
                      >
                        <Heart className={`w-3.5 h-3.5 ${template.isFavorite ? 'fill-current text-white' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{template.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{template.description}</p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {(template.tags || [appName]).map((tg, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-medium bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        #{tg}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Voting & Actions Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => handleVote(template.id, 'up', e)}
                      className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 rounded-lg cursor-pointer"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span className="font-bold">+{template.upvotes ?? 15}</span>
                    </button>
                    <button
                      onClick={(e) => handleVote(template.id, 'down', e)}
                      className="flex items-center gap-1 px-2 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 rounded-lg cursor-pointer"
                    >
                      <ThumbsDown className="w-3 h-3" />
                      <span>{template.downvotes ?? 1}</span>
                    </button>
                    <span className="text-[11px] text-slate-500 font-medium ml-1">Score: {score}</span>
                  </div>

                  {onLoadTemplateToStudio && (
                    <button
                      onClick={() => onLoadTemplateToStudio(template)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>Load to Studio</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: APP-SPECIFIC LONG-TERM MEMORY & SITUATIONAL RECALL BANK */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                {appName} Long-Term Memory & Situational Recall Bank
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Persistent memory of past prompts and task requests executed in {appName} over time.
              </p>
            </div>
          </div>
          <button
            onClick={() => setAppMemoryLog([])}
            className="text-xs font-semibold text-slate-400 hover:text-red-500 transition cursor-pointer"
          >
            Clear Memory Log
          </button>
        </div>

        <div className="space-y-2">
          {appMemoryLog.map(mem => (
            <div key={mem.id} className="bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400">Prompt: "{mem.prompt}"</span>
                <span className="text-[10px] text-slate-400">{mem.timestamp}</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300">{mem.summary}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
