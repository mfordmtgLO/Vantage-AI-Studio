/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  GoogleAppId, 
  ActiveCronJob, 
  ProposedCronTask, 
  ReadyMadeCronJobTemplate, 
  DailyQuotaStatus,
  CronCadence
} from '../types/cronAutomation';
import { 
  GOOGLE_APPS_METADATA, 
  READY_MADE_CRON_JOBS, 
  getTailoredGhostTextIdeas, 
  GhostTextIdea 
} from '../data/googleAppsCronCatalog';
import { 
  getActiveCronJobs, 
  scheduleReadyMadeCronJob, 
  scheduleProposedTasks, 
  togglePauseCronJob, 
  skipNextInstanceCronJob, 
  editCronJobScope, 
  deleteCronJob, 
  executeCronJobNow, 
  decomposeAutomationRequest, 
  getDailyQuotaStatus 
} from '../services/cronAutomationService';
import { useMemory } from '../context/MemoryContext';
import { 
  Mail, Calendar, FolderOpen, Table, FileText, CheckSquare, Users,
  Clock, Sparkles, Play, Pause, SkipForward, Edit3, Trash2, HelpCircle,
  CheckCircle2, AlertCircle, RefreshCw, ChevronDown, ChevronRight,
  Shield, Zap, Layers, Send, X, Info, ExternalLink, Search, Flame, Plus
} from 'lucide-react';

interface GoogleAppsCronAutomationDeckProps {
  initialAppId?: GoogleAppId;
  onNavigateToApp?: (appId: GoogleAppId) => void;
  compactMode?: boolean;
}

export const GoogleAppsCronAutomationDeck: React.FC<GoogleAppsCronAutomationDeckProps> = ({
  initialAppId = 'gmail',
  onNavigateToApp,
  compactMode = false
}) => {
  const { activePersona } = useMemory();
  
  // Selected App Filter
  const [selectedApp, setSelectedApp] = useState<GoogleAppId | 'all'>(initialAppId);
  
  // Accordion & Sidebar Tabbed State
  const [sidebarTab, setSidebarTab] = useState<'active' | 'catalog' | 'quota'>('active');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedApps, setExpandedApps] = useState<Record<GoogleAppId, boolean>>({
    gmail: true,
    calendar: false,
    drive: false,
    sheets: false,
    docs: false,
    tasks: false,
    contacts: false
  });

  const toggleAppAccordion = (appId: GoogleAppId) => {
    setExpandedApps(prev => ({
      ...prev,
      [appId]: !prev[appId]
    }));
  };

  const handleExpandAllApps = () => {
    setExpandedApps({
      gmail: true,
      calendar: true,
      drive: true,
      sheets: true,
      docs: true,
      tasks: true,
      contacts: true
    });
  };

  const handleCollapseAllApps = () => {
    setExpandedApps({
      gmail: false,
      calendar: false,
      drive: false,
      sheets: false,
      docs: false,
      tasks: false,
      contacts: false
    });
  };

  // Automatically expand target app when top tab selected
  const handleSelectAppTab = (appId: GoogleAppId | 'all') => {
    setSelectedApp(appId);
    if (appId !== 'all') {
      setExpandedApps(prev => ({
        ...prev,
        [appId]: true
      }));
    }
  };
  
  // Active Cron Jobs & Quota State
  const [activeJobs, setActiveJobs] = useState<ActiveCronJob[]>(() => getActiveCronJobs());
  const [quotaStatus, setQuotaStatus] = useState<DailyQuotaStatus>(() => getDailyQuotaStatus());
  
  // Ready-Made Dropdown Filter
  const [readyCadenceFilter, setReadyCadenceFilter] = useState<'All' | CronCadence>('All');
  const [isReadyDropdownOpen, setIsReadyDropdownOpen] = useState<boolean>(false);
  
  // Custom Request Input & Ghost Text Rotation
  const [userCustomRequest, setUserCustomRequest] = useState<string>('');
  const [ghostIndex, setGhostIndex] = useState<number>(0);
  const [isGhostTextVisible, setIsGhostTextVisible] = useState<boolean>(true);
  
  // 3-5 Proposed Tasks Selection State
  const [isDecomposing, setIsDecomposing] = useState<boolean>(false);
  const [proposedTasks, setProposedTasks] = useState<ProposedCronTask[] | null>(null);
  const [decompositionReasoning, setDecompositionReasoning] = useState<string | null>(null);
  
  // Modals & UI Feedback
  const [isHelpModalOpen, setIsHelpModalOpen] = useState<boolean>(false);
  const [editingJob, setEditingJob] = useState<ActiveCronJob | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [editSchedule, setEditSchedule] = useState<string>('');
  const [viewingLogsJob, setViewingLogsJob] = useState<ActiveCronJob | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [executingJobId, setExecutingJobId] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const activeIndustryId = activePersona?.title;

  // Resolve current ghost ideas based on selected app and active 2nd brain industry
  const effectiveAppForGhost: GoogleAppId = selectedApp === 'all' ? 'gmail' : selectedApp;
  const ghostIdeas: GhostTextIdea[] = getTailoredGhostTextIdeas(effectiveAppForGhost, activeIndustryId);
  const currentGhostIdea = ghostIdeas[ghostIndex % ghostIdeas.length] || ghostIdeas[0];

  // Sync quota status from server
  const syncQuota = async () => {
    try {
      const res = await fetch('/api/cron/quota');
      if (res.ok) {
        const data = await res.json();
        const local = getDailyQuotaStatus();
        const globalUsed = data.globalUsedCount ?? local.globalUsedCount;
        const isUserExceeded = local.usedCount >= 20;
        const isGlobalExceeded = data.isGlobalExceeded || globalUsed >= 50;
        const isExceeded = isUserExceeded || isGlobalExceeded;
        const isApproaching = local.usedCount >= 15 || globalUsed >= 40;

        let warningMessage: string | undefined = undefined;
        if (isGlobalExceeded) {
          warningMessage = `Total combined daily system limit reached (${globalUsed}/50 calls). Max for the day, please try again tomorrow!`;
        } else if (isUserExceeded) {
          warningMessage = `Your personal daily task limit reached (${local.usedCount}/20 tasks used). Max for the day, please try again tomorrow!`;
        } else if (isApproaching) {
          warningMessage = local.usedCount >= 15
            ? `Warning: Approaching personal daily limit (${local.usedCount}/20 tasks used).`
            : `Warning: System approaching combined daily limit (${globalUsed}/50 calls used).`;
        }

        setQuotaStatus({
          ...local,
          globalUsedCount: globalUsed,
          globalMaxLimit: 50,
          globalRemaining: Math.max(0, 50 - globalUsed),
          isExceeded,
          isGlobalExceeded,
          isApproaching,
          warningMessage
        });
      }
    } catch {
      setQuotaStatus(getDailyQuotaStatus());
    }
  };

  useEffect(() => {
    syncQuota();
  }, []);

  // Rotate Ghost Text every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setGhostIndex(prev => (prev + 1) % Math.max(1, ghostIdeas.length));
    }, 10000);
    return () => clearInterval(timer);
  }, [ghostIdeas.length]);

  // Refresh quota and jobs on mount
  useEffect(() => {
    setActiveJobs(getActiveCronJobs());
    setQuotaStatus(getDailyQuotaStatus());
  }, []);

  const showNotification = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setFeedbackMsg({ text, type });
    setTimeout(() => setFeedbackMsg(null), 4500);
  };

  // When user clicks the ghost text or input with ghost text
  const handlePopulateGhostText = () => {
    if (currentGhostIdea && !userCustomRequest.trim()) {
      setUserCustomRequest(currentGhostIdea.promptText);
      setIsGhostTextVisible(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
      showNotification(`Loaded suggested cron automation: "${currentGhostIdea.cadenceLabel}"`, 'info');
    }
  };

  // Submit Automation Request -> 2nd Brain Decomposition
  const handleSubmitAutomationRequest = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = userCustomRequest.trim() || (currentGhostIdea ? currentGhostIdea.promptText : '');
    if (!query) return;

    if (quotaStatus.isExceeded) {
      showNotification(`Daily automated quota reached (${quotaStatus.usedCount}/20 tasks). Using offline structured breakdown.`, 'info');
    }

    setIsDecomposing(true);
    try {
      const result = await decomposeAutomationRequest(
        query,
        selectedApp === 'all' ? 'gmail' : selectedApp,
        activeIndustryId
      );

      setProposedTasks(result.proposedTasks);
      setDecompositionReasoning(result.reasoningSummary);
      setQuotaStatus(getDailyQuotaStatus());
      showNotification(`Vantage AI formulated ${result.proposedTasks.length} multi-app cron tasks for your review!`, 'success');
    } catch (err: any) {
      showNotification(err.message || 'Failed to decompose automation request', 'error');
    } finally {
      setIsDecomposing(false);
    }
  };

  // Schedule Selected Proposed Tasks
  const handleConfirmScheduledTasks = () => {
    if (!proposedTasks) return;
    const selectedCount = proposedTasks.filter(t => t.selected).length;
    if (selectedCount === 0) {
      showNotification('Please select at least one cron task to schedule.', 'error');
      return;
    }

    const scheduled = scheduleProposedTasks(proposedTasks);
    setActiveJobs(getActiveCronJobs());
    setProposedTasks(null);
    setUserCustomRequest('');
    setIsGhostTextVisible(true);
    showNotification(`Successfully scheduled ${scheduled.length} recurring Google Workspace cron job(s)!`, 'success');
  };

  // Toggle Single Proposed Task Selection
  const toggleProposedTask = (taskId: string) => {
    if (!proposedTasks) return;
    setProposedTasks(proposedTasks.map(t => t.id === taskId ? { ...t, selected: !t.selected } : t));
  };

  // Schedule a Ready-Made Cron Template
  const handleScheduleReadyMade = (template: ReadyMadeCronJobTemplate) => {
    const newJob = scheduleReadyMadeCronJob(template);
    setActiveJobs(getActiveCronJobs());
    setIsReadyDropdownOpen(false);
    showNotification(`Scheduled "${template.title}" (${template.defaultScheduleLabel}) in ${template.appName}!`, 'success');
  };

  // Cron Job Controls
  const handleTogglePause = (jobId: string) => {
    const updated = togglePauseCronJob(jobId);
    setActiveJobs(updated);
    const target = updated.find(j => j.id === jobId);
    showNotification(`Cron job status updated to: ${target?.status.toUpperCase()}`, 'info');
  };

  const handleSkipNext = (jobId: string) => {
    const updated = skipNextInstanceCronJob(jobId);
    setActiveJobs(updated);
    showNotification('Skipped soonest instance. Future recurring runs remain intact.', 'info');
  };

  const handleDelete = (jobId: string) => {
    const updated = deleteCronJob(jobId);
    setActiveJobs(updated);
    showNotification('Cron job deleted successfully.', 'info');
  };

  const handleOpenEdit = (job: ActiveCronJob) => {
    setEditingJob(job);
    setEditTitle(job.title);
    setEditPrompt(job.prompt);
    setEditSchedule(job.scheduleDescription);
  };

  const handleSaveEdit = () => {
    if (!editingJob) return;
    const updated = editCronJobScope(editingJob.id, editTitle, editPrompt, editSchedule);
    setActiveJobs(updated);
    setEditingJob(null);
    showNotification('Updated cron job scope and schedule parameters.', 'success');
  };

  const handleTriggerRunNow = async (jobId: string) => {
    setExecutingJobId(jobId);
    try {
      const res = await executeCronJobNow(jobId);
      setActiveJobs(res.updatedJobs);
      setQuotaStatus(getDailyQuotaStatus());
      if (res.success) {
        showNotification(res.message, 'success');
      } else {
        showNotification(res.message, 'error');
      }
    } catch (err: any) {
      showNotification(err.message || 'Execution failed', 'error');
    } finally {
      setExecutingJobId(null);
    }
  };

  // Filtered lists
  const filteredReadyJobs = READY_MADE_CRON_JOBS.filter(t => {
    const matchesApp = selectedApp === 'all' || t.appId === selectedApp;
    const matchesCadence = readyCadenceFilter === 'All' || t.cadence === readyCadenceFilter;
    return matchesApp && matchesCadence;
  });

  const filteredActiveJobs = activeJobs.filter(j => {
    return selectedApp === 'all' || j.appId === selectedApp;
  });

  const getAppIcon = (appId: GoogleAppId) => {
    switch (appId) {
      case 'gmail': return Mail;
      case 'calendar': return Calendar;
      case 'drive': return FolderOpen;
      case 'sheets': return Table;
      case 'docs': return FileText;
      case 'tasks': return CheckSquare;
      case 'contacts': return Users;
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR & QUOTA BADGE */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl border border-indigo-500/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Clock className="w-5 h-5 animate-pulse" />
            </span>
            <h2 className="text-xl font-black tracking-tight text-white flex items-center gap-2">
              Google Workspace Autonomous Cron Engine
              <span className="px-2 py-0.5 text-[10px] uppercase font-bold tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                7 Apps Active
              </span>
            </h2>
          </div>
          <p className="text-xs text-indigo-200/80">
            Automate routine daily, weekly, and monthly workflows across Gmail, Calendar, Drive, Sheets, Docs, Tasks, and Contacts with 2nd Brain hybrid agents.
          </p>
        </div>

        {/* Daily Quota Guardrail Pill & Help Button */}
        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/15 flex items-center gap-2.5">
            <Flame className={`w-4 h-4 ${quotaStatus.isExceeded ? 'text-red-400' : 'text-amber-400'}`} />
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-slate-300 flex items-center justify-between gap-2">
                <span>API Usage</span>
                <span className={quotaStatus.isExceeded ? 'text-red-300 font-black' : 'text-emerald-300 font-black'}>
                  User: {quotaStatus.usedCount}/20 | System: {quotaStatus.globalUsedCount}/50
                </span>
              </div>
              <div className="w-36 bg-white/20 h-1.5 rounded-full overflow-hidden mt-1">
                <div 
                  className={`h-full transition-all ${quotaStatus.isExceeded ? 'bg-red-500' : quotaStatus.isApproaching ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.max((quotaStatus.usedCount / 20) * 100, (quotaStatus.globalUsedCount / 50) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsHelpModalOpen(true)}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl border border-white/20 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            title="How 2nd Brain Cron Automations Work"
          >
            <HelpCircle className="w-4 h-4 text-sky-300" />
            <span>How It Works</span>
          </button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedbackMsg && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between border transition-all ${
          feedbackMsg.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800' 
            : feedbackMsg.type === 'error'
            ? 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border-red-300 dark:border-red-800'
            : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800'
        }`}>
          <div className="flex items-center gap-2.5">
            {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Info className="w-4 h-4 text-blue-600" />}
            <span>{feedbackMsg.text}</span>
          </div>
          <button onClick={() => setFeedbackMsg(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer font-bold">×</button>
        </div>
      )}

      {/* 7 GOOGLE APPS SELECTOR TAB BAR */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2">
        <button
          onClick={() => handleSelectAppTab('all')}
          className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
            selectedApp === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-md dark:bg-white dark:text-slate-900'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All 7 Apps</span>
        </button>

        {(Object.keys(GOOGLE_APPS_METADATA) as GoogleAppId[]).map(appKey => {
          const meta = GOOGLE_APPS_METADATA[appKey];
          const Icon = getAppIcon(appKey);
          const isSelected = selectedApp === appKey;
          return (
            <button
              key={appKey}
              onClick={() => handleSelectAppTab(appKey)}
              className={`px-3 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border ${
                isSelected
                  ? `${meta.bgLight} ${meta.color} ${meta.borderColor} ring-2 ring-indigo-500/20 shadow-xs font-black`
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="truncate">{meta.name}</span>
            </button>
          );
        })}
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: LEFT = REQUEST & PRE-CANNED / RIGHT = SCROLLABLE ACTIVE SIDEBAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN (7 COLS): CUSTOM CRON REQUEST WITH ROTATING GHOST TEXT & PRE-CANNED DROPDOWN */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. CUSTOM CRON REQUEST INPUT WINDOW WITH 10-SECOND ROTATING GHOST TEXT */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="p-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Create Custom Cron Job & Scheduled Task
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                <Clock className="w-3 h-3 text-indigo-500 animate-spin" style={{ animationDuration: '10s' }} />
                <span>Auto-cycling ideas (every 10s)</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Type any automated routine or click the rotating ghost text below. Vantage AI 2nd Brain will analyze your request and formulate 3–5 multi-app cron actions.
            </p>

            {/* Interactive Request Input with Ghost Text */}
            <form onSubmit={handleSubmitAutomationRequest} className="space-y-3">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={userCustomRequest}
                  onChange={(e) => {
                    setUserCustomRequest(e.target.value);
                    setIsGhostTextVisible(!e.target.value);
                  }}
                  onFocus={() => {
                    if (!userCustomRequest) {
                      handlePopulateGhostText();
                    }
                  }}
                  placeholder=""
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-50 dark:bg-slate-950/80 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition shadow-inner relative z-10 bg-transparent"
                />

                {/* Rotating Ghost Text Layer (clickable) */}
                {!userCustomRequest && currentGhostIdea && (
                  <div
                    onClick={handlePopulateGhostText}
                    className="absolute inset-0 flex items-center pl-4 pr-12 text-xs text-slate-400 dark:text-slate-500 italic pointer-events-auto cursor-pointer select-none truncate hover:text-indigo-600 dark:hover:text-indigo-400 transition"
                    title="Click to populate this tailored cron automation idea"
                  >
                    <span className="truncate flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>{currentGhostIdea.promptText}</span>
                    </span>
                  </div>
                )}

                {/* Permanent Help '?' icon inside input box */}
                <button
                  type="button"
                  onClick={() => setIsHelpModalOpen(true)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 z-20 transition cursor-pointer"
                  title="Click to learn how Vantage AI translates requests into multi-app cron jobs"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Ghost Suggestion Badge & Quick Click Pill */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Suggested Cadence:</span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-md font-bold text-[10px] border border-indigo-200 dark:border-indigo-800">
                    {currentGhostIdea?.cadenceLabel || 'Daily at 8:00 AM'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isDecomposing}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                >
                  {isDecomposing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Formulating 3-5 Cron Tasks...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Automation Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* 2. 3-5 PROPOSED TASKS INTERACTIVE SELECTION ACCORDION */}
            {proposedTasks && proposedTasks.length > 0 && (
              <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 space-y-4 animate-fadeIn">
                <div className="bg-indigo-50 dark:bg-indigo-950/40 p-4 rounded-xl border border-indigo-200 dark:border-indigo-800">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs mb-1">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>2nd Brain Decomposition Results</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {decompositionReasoning}
                  </p>
                </div>

                <div className="space-y-2.5">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>Select Cron Activities to Schedule ({proposedTasks.filter(t => t.selected).length} selected):</span>
                    <button
                      onClick={() => setProposedTasks(proposedTasks.map(t => ({ ...t, selected: true })))}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                    >
                      Select All
                    </button>
                  </div>

                  {proposedTasks.map(task => {
                    const meta = GOOGLE_APPS_METADATA[task.appId];
                    const Icon = getAppIcon(task.appId);
                    return (
                      <div
                        key={task.id}
                        onClick={() => toggleProposedTask(task.id)}
                        className={`p-3.5 rounded-xl border transition cursor-pointer flex items-start gap-3 ${
                          task.selected
                            ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-400 dark:border-indigo-700 shadow-xs'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-75 hover:opacity-100'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={task.selected}
                          onChange={() => {}} // handled by parent onClick
                          className="mt-1 w-4 h-4 text-indigo-600 rounded-md cursor-pointer accent-indigo-600"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className={`p-1 rounded-md text-xs ${meta?.bgLight || 'bg-slate-100'} ${meta?.color || 'text-slate-600'}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white">
                                {task.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                              {task.scheduleDescription}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            {task.prompt}
                          </p>
                          <div className="text-[10px] text-indigo-600 dark:text-indigo-400 italic">
                            💡 {task.whyHelpful}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => setProposedTasks(null)}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={handleConfirmScheduledTasks}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Schedule Selected Automations ({proposedTasks.filter(t => t.selected).length})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 3. PRE-CANNED ACCORDION DIRECTORY (ALL 7 INTEGRATED GOOGLE APPS) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Google Workspace Apps Cron Templates Catalog (7 Apps)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Organized by Google App with ready-to-schedule typical daily, weekly, and monthly jobs.
                </p>
              </div>

              {/* Controls & Cadence Filter Tabs */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={handleExpandAllApps}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                >
                  Expand All
                </button>
                <button
                  onClick={handleCollapseAllApps}
                  className="px-2.5 py-1 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                >
                  Collapse All
                </button>
                
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                  {(['All', 'Daily', 'Weekly', 'Monthly'] as const).map(cad => (
                    <button
                      key={cad}
                      onClick={() => setReadyCadenceFilter(cad)}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition cursor-pointer ${
                        readyCadenceFilter === cad
                          ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      {cad}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Soft Suggestive Callout Banner */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-3.5 rounded-xl border border-blue-200 dark:border-blue-900/60 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 dark:text-slate-300">
                <strong className="text-blue-900 dark:text-blue-200">AI Assistant Tip:</strong> Expand any Google App below to enable pre-canned jobs with one click. Vantage AI will automatically run tasks in the background on your schedule!
              </div>
            </div>

            {/* Search Filter Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search templates across Gmail, Calendar, Drive, Sheets, Docs, Tasks, Contacts..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>

            {/* ACCORDIONS DIRECTORY FOR ALL 7 GOOGLE APPS */}
            <div className="space-y-3 pt-1">
              {(Object.keys(GOOGLE_APPS_METADATA) as GoogleAppId[])
                .filter(appId => selectedApp === 'all' || selectedApp === appId)
                .map(appId => {
                  const meta = GOOGLE_APPS_METADATA[appId];
                  const Icon = getAppIcon(appId);
                  const appTemplates = READY_MADE_CRON_JOBS.filter(t => {
                    const matchesApp = t.appId === appId;
                    const matchesCadence = readyCadenceFilter === 'All' || t.cadence === readyCadenceFilter;
                    const matchesSearch = !searchTerm || 
                      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      t.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
                    return matchesApp && matchesCadence && matchesSearch;
                  });

                  if (appTemplates.length === 0 && searchTerm) return null;

                  const isExpanded = !!expandedApps[appId];

                  return (
                    <div 
                      key={appId}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50/40 dark:bg-slate-950/40 transition-all shadow-xs"
                    >
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleAppAccordion(appId)}
                        className="w-full px-4 py-3.5 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <span className={`p-2 rounded-xl text-sm ${meta.bgLight} ${meta.color} border ${meta.borderColor}`}>
                            <Icon className="w-4 h-4" />
                          </span>
                          <div className="text-left">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                                {meta.name}
                              </h4>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                                {appTemplates.length} Template{appTemplates.length === 1 ? '' : 's'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                              {meta.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                            {isExpanded ? 'Collapse' : 'Expand templates'}
                          </span>
                          <span className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </span>
                        </div>
                      </button>

                      {/* Accordion Content Grid */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70 grid grid-cols-1 md:grid-cols-3 gap-3">
                          {appTemplates.map(template => (
                            <div
                              key={template.id}
                              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-400 dark:hover:border-indigo-600 transition flex flex-col justify-between space-y-3 shadow-xs"
                            >
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 rounded-md text-[10px] font-bold">
                                    {template.cadence}
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium">
                                    🕒 {template.defaultScheduleLabel}
                                  </span>
                                </div>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                  {template.title}
                                </h5>
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                  {template.description}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-1">
                                <div className="flex flex-wrap gap-1">
                                  {template.tags.slice(0, 2).map(tag => (
                                    <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                                <button
                                  onClick={() => handleScheduleReadyMade(template)}
                                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg shadow-xs transition flex items-center gap-1 cursor-pointer shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Schedule</span>
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (5 COLS): REFACTORED TABBED AUTOMATION SIDEBAR */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[660px]">
            
            {/* SIDEBAR NAVIGATION TAB BAR */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mb-4 shrink-0">
              <button
                onClick={() => setSidebarTab('active')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'active'
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Active ({filteredActiveJobs.length})</span>
              </button>

              <button
                onClick={() => setSidebarTab('catalog')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'catalog'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Templates (21)</span>
              </button>

              <button
                onClick={() => setSidebarTab('quota')}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  sidebarTab === 'quota'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Guardrails</span>
              </button>
            </div>

            {/* TAB CONTENT 1: LIVE ACTIVE CRON JOBS */}
            {sidebarTab === 'active' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      Live Active Automations
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Real-time triggers, logs & scope editing
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 rounded-md">
                    {activeJobs.filter(j => j.status === 'active').length} Running
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-3 mt-3 max-h-[540px]">
                  {filteredActiveJobs.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <Clock className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">No active cron jobs found.</p>
                      <p className="text-[11px] text-slate-500">Select a template from the Catalog tab or submit a request on the left!</p>
                      <button
                        onClick={() => setSidebarTab('catalog')}
                        className="mt-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                      >
                        Browse Pre-Canned Catalog
                      </button>
                    </div>
                  ) : (
                    filteredActiveJobs.map(job => {
                      const meta = GOOGLE_APPS_METADATA[job.appId];
                      const Icon = getAppIcon(job.appId);
                      const isExecuting = executingJobId === job.id;

                      return (
                        <div
                          key={job.id}
                          className={`p-3.5 rounded-xl border transition space-y-2.5 ${
                            job.status === 'paused'
                              ? 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                              : job.status === 'skipped_next'
                              ? 'bg-amber-50/40 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800'
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-300'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-start gap-2">
                              <span className={`p-1.5 rounded-lg text-xs mt-0.5 ${meta?.bgLight} ${meta?.color}`}>
                                <Icon className="w-3.5 h-3.5" />
                              </span>
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                  {job.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] text-slate-500 font-medium">
                                    📅 {job.scheduleDescription}
                                  </span>
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                                    job.status === 'active'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                      : job.status === 'skipped_next'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                      : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                  }`}>
                                    {job.status === 'skipped_next' ? 'Skipped Soonest' : job.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <p className="text-[10px] text-slate-600 dark:text-slate-300 line-clamp-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 font-mono">
                            "{job.prompt}"
                          </p>

                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span>Next: <strong className="text-slate-700 dark:text-slate-200">{job.nextRunTime}</strong></span>
                            {job.lastRunTime && (
                              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                                Last: {job.lastRunTime}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                            <button
                              onClick={() => handleTriggerRunNow(job.id)}
                              disabled={isExecuting}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                              title="Trigger immediate test execution of this cron job"
                            >
                              {isExecuting ? (
                                <RefreshCw className="w-3 h-3 animate-spin" />
                              ) : (
                                <Play className="w-3 h-3 fill-current" />
                              )}
                              <span>Run Now</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleTogglePause(job.id)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-lg transition cursor-pointer"
                                title={job.status === 'active' ? 'Pause cron job' : 'Resume cron job'}
                              >
                                {job.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                              </button>

                              <button
                                onClick={() => handleSkipNext(job.id)}
                                className="p-1.5 text-amber-600 hover:text-amber-800 bg-amber-50 dark:bg-amber-950/50 rounded-lg transition cursor-pointer"
                                title="Skip the soonest run instance"
                              >
                                <SkipForward className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleOpenEdit(job)}
                                className="p-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 dark:bg-blue-950/50 rounded-lg transition cursor-pointer"
                                title="Edit prompt scope and schedule parameters"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => setViewingLogsJob(job)}
                                className="p-1.5 text-indigo-600 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg transition cursor-pointer"
                                title="View execution logs & audit history"
                              >
                                <Info className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDelete(job.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 bg-red-50 dark:bg-red-950/50 rounded-lg transition cursor-pointer"
                                title="Delete cron job"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: SIDEBAR GOOGLE APPS CATALOG ACCORDIONS */}
            {sidebarTab === 'catalog' && (
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      Quick Pre-Canned Catalog
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      1-click schedule templates directly from sidebar
                    </p>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 rounded-md">
                    21 Pre-Canned Jobs
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-2 mt-3 max-h-[540px]">
                  {(Object.keys(GOOGLE_APPS_METADATA) as GoogleAppId[]).map(appId => {
                    const meta = GOOGLE_APPS_METADATA[appId];
                    const Icon = getAppIcon(appId);
                    const templates = READY_MADE_CRON_JOBS.filter(t => t.appId === appId);
                    const isOpen = !!expandedApps[appId];

                    return (
                      <div key={appId} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
                        <button
                          onClick={() => toggleAppAccordion(appId)}
                          className="w-full p-2.5 flex items-center justify-between bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className={`p-1 rounded-md text-xs ${meta.bgLight} ${meta.color}`}>
                              <Icon className="w-3.5 h-3.5" />
                            </span>
                            <span className="text-xs font-bold text-slate-900 dark:text-white">
                              {meta.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded font-semibold">
                              3 Templates
                            </span>
                            {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-slate-400" /> : <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="p-2 space-y-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
                            {templates.map(tpl => (
                              <div key={tpl.id} className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-[11px] font-bold text-slate-900 dark:text-white line-clamp-1">
                                    {tpl.title}
                                  </h5>
                                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300 rounded">
                                    {tpl.cadence}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {tpl.description}
                                </p>
                                <div className="pt-1 flex items-center justify-between">
                                  <span className="text-[9px] text-slate-400">🕒 {tpl.defaultScheduleLabel}</span>
                                  <button
                                    onClick={() => handleScheduleReadyMade(tpl)}
                                    className="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded transition cursor-pointer flex items-center gap-1"
                                  >
                                    <Plus className="w-3 h-3" />
                                    <span>Schedule</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3: QUOTA & GUARDRAILS METRICS */}
            {sidebarTab === 'quota' && (
              <div className="flex-1 flex flex-col min-h-0 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-amber-500" />
                      API Daily Quota Guardrails
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Enforced hard limits to prevent runaway API pulls
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                    quotaStatus.isExceeded ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {quotaStatus.isExceeded ? 'Limit Reached' : 'Quota Active'}
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Meter 1: Personal User Daily Quota (Max 20) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-xs">
                        👤 Your Personal Daily Quota
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {quotaStatus.usedCount} / 20 calls
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          quotaStatus.usedCount >= 20 ? 'bg-red-600' : quotaStatus.usedCount >= 15 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, (quotaStatus.usedCount / 20) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      Resets automatically every 24 hours at midnight UTC.
                    </p>
                  </div>

                  {/* Meter 2: Total Combined System Daily Quota (Max 50) */}
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 text-xs">
                        🌐 Combined System-Wide Quota
                      </span>
                      <span className="font-extrabold text-slate-900 dark:text-white">
                        {quotaStatus.globalUsedCount} / 50 calls
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          quotaStatus.globalUsedCount >= 50 ? 'bg-red-600' : quotaStatus.globalUsedCount >= 40 ? 'bg-amber-500' : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(100, (quotaStatus.globalUsedCount / 50) * 100)}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500">
                      System-wide hard stop protecting against overall project limit exhaustion.
                    </p>
                  </div>

                  {/* Alerts */}
                  {quotaStatus.isExceeded && (
                    <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-200 space-y-1">
                      <strong className="font-bold block text-xs">Quota Reached — Try Again Tomorrow!</strong>
                      <p className="text-[11px] leading-relaxed opacity-90">
                        {quotaStatus.warningMessage || "Daily limit reached. Please try again tomorrow!"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* PERMANENT HELP '?' MODAL */}
      {isHelpModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  How Vantage AI Google Apps Cron Automations Work
                </h3>
              </div>
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer font-bold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 rounded-xl border border-indigo-200 dark:border-indigo-800">
                <strong className="text-indigo-900 dark:text-indigo-200 block mb-1">
                  1. Natural Language to Multi-App Decomposition
                </strong>
                You can input any automated task request related to Google apps into the text input window (or select any of the rotating ghost text ideas) and hit <strong>Submit Automation Request</strong>.
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block mb-1">
                  2. 3–5 Multi-Action Formulated Tasks
                </strong>
                The Vantage AI 2nd Brain analyzes your prompt and formulates <strong>3 to 5 concrete cron activities/tasks</strong> distributed logically across your Google Workspace (e.g. Gmail triage, Calendar prep, Sheets rollup, Docs briefing).
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <strong className="text-slate-900 dark:text-white block mb-1">
                  3. Full User Control & Execution Deck
                </strong>
                Select the tasks you wish to activate. You can always:
                <ul className="list-disc pl-4 mt-1 space-y-1 text-[11px]">
                  <li><strong>Run Now:</strong> Trigger an immediate test execution anytime.</li>
                  <li><strong>Skip Next:</strong> Pause the upcoming instance without altering future schedules.</li>
                  <li><strong>Edit Scope:</strong> Refactor prompt text or modify recurrence.</li>
                  <li><strong>Delete:</strong> Remove any cron job with 1 click.</li>
                </ul>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
                <strong className="block mb-0.5">🛡️ Built-in Guardrail & Quota Protection</strong>
                Gemini search grounding is enabled for research-heavy tasks, with a hardwired safety stop at <strong>20 automated tasks per day</strong> to prevent excessive API consumption.
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setIsHelpModalOpen(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Got It, Let's Automate!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SCOPE MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-blue-600" />
                Edit Cron Job Scope & Parameters
              </h3>
              <button onClick={() => setEditingJob(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Prompt / Automation Directive</label>
                <textarea
                  rows={3}
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Schedule Description</label>
                <input
                  type="text"
                  value={editSchedule}
                  onChange={(e) => setEditSchedule(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 text-xs text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTION LOGS AUDIT MODAL */}
      {viewingLogsJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                Execution Audit Logs: {viewingLogsJob.title}
              </h3>
              <button onClick={() => setViewingLogsJob(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2.5 text-xs pr-1">
              {viewingLogsJob.executionLogs.length === 0 ? (
                <p className="text-slate-400 text-center py-6">No execution logs recorded yet. Click "Run Now" to test this job.</p>
              ) : (
                viewingLogsJob.executionLogs.map(log => (
                  <div key={log.id} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">● {log.status.toUpperCase()}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{log.message}</p>
                    {log.durationMs && (
                      <span className="text-[10px] text-slate-400 block">Execution Duration: {log.durationMs}ms</span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingLogsJob(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
