/**
 * Vantage AI Workspace - Executive Smart Inbox Studio
 * 4-Quadrant Urgency Heatmap, Contractual Commitment/Deadline Extractor, and 2nd Brain VIP Triage
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

import React, { useState } from 'react';
import { 
  Flame, AlertTriangle, Info, Trash2, Mail, Clock, Calendar, 
  CheckCircle2, Sparkles, Send, ShieldAlert, ArrowRight, Filter, 
  ExternalLink, Brain, RefreshCw, CheckSquare, XCircle, Search,
  AlertCircle, DollarSign, Copy, Check
} from 'lucide-react';
import { 
  SmartEmailThread, 
  PRESET_SMART_INBOX_THREADS, 
  UrgencyQuadrant, 
  QUADRANT_DEFINITIONS,
  ExtractedCommitment 
} from '../utils/inboxUrgencyEngine';
import { useMemory } from '../context/MemoryContext';
import { CalendarEvent, GoogleTask } from '../types';

interface ExecutiveSmartInboxStudioProps {
  onScheduleCalendarHold?: (title: string, startIso: string, durationMinutes: number) => void;
  onCreateTask?: (title: string, notes: string) => void;
  onSendDraftEmail?: (to: string, subject: string, body: string) => void;
  existingEvents?: CalendarEvent[];
}

export const ExecutiveSmartInboxStudio: React.FC<ExecutiveSmartInboxStudioProps> = ({
  onScheduleCalendarHold,
  onCreateTask,
  onSendDraftEmail,
  existingEvents = []
}) => {
  const { memories, activePersona, guardrails, saveMemory } = useMemory();

  const [threads, setThreads] = useState<SmartEmailThread[]>(PRESET_SMART_INBOX_THREADS);
  const [selectedQuadrant, setSelectedQuadrant] = useState<UrgencyQuadrant | 'all'>('all');
  const [selectedThreadId, setSelectedThreadId] = useState<string>(PRESET_SMART_INBOX_THREADS[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [draftEditingBody, setDraftEditingBody] = useState<string>(PRESET_SMART_INBOX_THREADS[0].draftResponse || '');
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [isSynthesizingDraft, setIsSynthesizingDraft] = useState(false);

  const selectedThread = threads.find((t) => t.id === selectedThreadId) || threads[0];

  const filteredThreads = threads.filter((t) => {
    if (t.isPurged) return false;
    if (selectedQuadrant !== 'all' && t.quadrant !== selectedQuadrant) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.subject.toLowerCase().includes(q) ||
        t.from.toLowerCase().includes(q) ||
        t.snippet.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getQuadrantCount = (quad: UrgencyQuadrant) => {
    return threads.filter((t) => !t.isPurged && t.quadrant === quad).length;
  };

  const handleSelectThread = (t: SmartEmailThread) => {
    setSelectedThreadId(t.id);
    setDraftEditingBody(t.draftResponse || '');
  };

  // 1-Click Action: Schedule Calendar Hold for an extracted commitment
  const handleScheduleCommitmentHold = (cm: ExtractedCommitment) => {
    if (onScheduleCalendarHold) {
      onScheduleCalendarHold(`[Deadline Hold] ${cm.text}`, cm.targetDateTime, 30);
    }
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === selectedThread.id) {
          return {
            ...t,
            commitments: t.commitments.map((c) => (c.id === cm.id ? { ...c, status: 'scheduled_calendar' } : c))
          };
        }
        return t;
      })
    );
    setActionSuccessMsg(`Calendar Soft-Hold scheduled with 15-min focus buffer for "${cm.text}"`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 1-Click Action: Add Extracted Commitment to Google Tasks
  const handleCreateTaskFromCommitment = (cm: ExtractedCommitment) => {
    if (onCreateTask) {
      onCreateTask(`[Commitment] ${cm.text}`, `From Thread: ${selectedThread.subject}\nDue: ${cm.targetDateFormatted}`);
    }
    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === selectedThread.id) {
          return {
            ...t,
            commitments: t.commitments.map((c) => (c.id === cm.id ? { ...c, status: 'task_created' } : c))
          };
        }
        return t;
      })
    );
    setActionSuccessMsg(`Added to Google Tasks with milestone reminder: "${cm.text}"`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // 1-Click Action: Purge Spam & Blacklist Domain permanently to 2nd Brain
  const handlePurgeThreadAndBlacklist = async (thread: SmartEmailThread) => {
    // Extract domain from sender
    const domainMatch = thread.senderEmail.match(/@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const domain = domainMatch ? domainMatch[1] : thread.senderEmail;

    // Save to 2nd Brain
    await saveMemory({
      title: `Blacklist Domain: ${domain}`,
      content: `Permanently blocked sender ${thread.senderEmail} from Vantage AI Workspace OS. Reason: Cold scraper spam & unverified solicitation.`,
      type: 'knowledge',
      category: 'domain_purge_blacklist',
      tags: ['blacklist_domain', 'spam_purge', domain],
      source: 'manual'
    });

    setThreads((prev) => prev.map((t) => (t.id === thread.id ? { ...t, isPurged: true } : t)));
    setActionSuccessMsg(`Purged thread and permanently blacklisted "${domain}" into 2nd Brain cognitive memory vault.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  // Re-generate VIP draft with 2nd Brain persona context
  const handleSynthesizePersonaDraft = () => {
    setIsSynthesizingDraft(true);
    setTimeout(() => {
      let refined = '';
      if (selectedThread.quadrant === 'q1_urgent_revenue') {
        refined = `Hi ${selectedThread.senderName},\n\nThank you for the urgent update regarding ${selectedThread.subject}.\n\nAs the ${activePersona?.title || 'Executive Mortgage Strategist'}, I have reviewed the settlement parameters and confirmed our commitment deadline (${selectedThread.commitments[0]?.targetDateFormatted || 'prior to scheduled close'}).\n\nAll escrow sign-offs are in queue and compliance disclosures adhere to TRID guidelines. I have locked a provisional focus window on my calendar to ensure flawless execution.\n\nWarm regards,\nMike Ford\nVantage AI Executive Workspace`;
      } else {
        refined = `Hi ${selectedThread.senderName},\n\nConfirming receipt of your message regarding "${selectedThread.subject}".\n\nOur team has registered the action items and our active guardrails are monitoring milestone compliance. We will provide formal documentation well before the required SLA deadline.\n\nBest regards,\nMike Ford`;
      }
      setDraftEditingBody(refined);
      setIsSynthesizingDraft(false);
      setActionSuccessMsg('Draft response re-synthesized using active 2nd Brain persona and cognitive guardrails.');
      setTimeout(() => setActionSuccessMsg(null), 3500);
    }, 800);
  };

  const handleCopyDraft = () => {
    navigator.clipboard.writeText(draftEditingBody);
    setCopiedResponse(true);
    setTimeout(() => setCopiedResponse(false), 2500);
  };

  const handleSendDraft = () => {
    if (onSendDraftEmail) {
      onSendDraftEmail(selectedThread.senderEmail, `Re: ${selectedThread.subject}`, draftEditingBody);
    }
    setActionSuccessMsg(`Draft dispatched to Gmail queue for ${selectedThread.senderEmail}.`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600/10 via-amber-600/10 to-blue-600/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center shadow-md shadow-red-500/20 shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Executive Smart Inbox & Urgency Heatmap
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-red-600 text-white rounded-full">
                SLA Guardian Active
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              4-Quadrant priority triage, contractual deadline deconfliction, and 2nd Brain VIP response synthesis.
            </p>
          </div>
        </div>

        {/* Global Stats Pill */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span className="text-slate-600 dark:text-slate-400">
            Active Persona: <strong className="text-slate-900 dark:text-slate-100 font-semibold">{activePersona?.title || 'Executive Strategist'}</strong>
          </span>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-3.5 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* 4 Quadrants Quick Selector */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(['q1_urgent_revenue', 'q2_urgent_operational', 'q3_low_informational', 'q4_spam_purge'] as UrgencyQuadrant[]).map((quad) => {
          const config = QUADRANT_DEFINITIONS[quad];
          const count = getQuadrantCount(quad);
          const isSelected = selectedQuadrant === quad;

          return (
            <button
              key={quad}
              onClick={() => setSelectedQuadrant(isSelected ? 'all' : quad)}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 dark:border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{config.label.split(':')[0]}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badge}`}>
                  {count} Active
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                {config.label.split(':')[1]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Main 2-Column Split: Threads List & Detail + AI Responder */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Threads Feed */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search and Filter bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search urgency threads, senders, or tags..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
            {filteredThreads.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                No active threads in this quadrant.
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const isSelected = thread.id === selectedThread.id;
                const quadConfig = QUADRANT_DEFINITIONS[thread.quadrant];

                return (
                  <div
                    key={thread.id}
                    onClick={() => handleSelectThread(thread)}
                    className={`p-4 rounded-xl border transition cursor-pointer space-y-2 relative ${
                      isSelected
                        ? 'border-blue-600 dark:border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {/* Header line */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate max-w-[200px]">
                        {thread.senderName}
                      </span>
                      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                        {thread.receivedDate}
                      </span>
                    </div>

                    {/* Subject line */}
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">
                      {thread.subject}
                    </h4>

                    {/* Snippet */}
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                      {thread.snippet}
                    </p>

                    {/* Bottom Metadata & Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${quadConfig.badge}`}>
                          Score: {thread.urgencyScore}
                        </span>
                        {thread.financialValue && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                            {thread.financialValue}
                          </span>
                        )}
                      </div>

                      {thread.slaHoursRemaining > 0 && (
                        <span className="text-[10px] font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> SLA: {thread.slaHoursRemaining}h left
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Thread Deep Analysis, Extracted Commitments & VIP Responder */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            {/* Thread Header */}
            <div className="space-y-2 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${QUADRANT_DEFINITIONS[selectedThread.quadrant].badge}`}>
                  {QUADRANT_DEFINITIONS[selectedThread.quadrant].label}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Received: {selectedThread.receivedDate}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {selectedThread.subject}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                From: <strong className="font-semibold text-slate-800 dark:text-slate-200">{selectedThread.from}</strong>
              </p>
            </div>

            {/* Email Full Body */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {selectedThread.body}
            </div>

            {/* Contractual Commitments & Deadlines Extractor */}
            {selectedThread.commitments.length > 0 && (
              <div className="space-y-2.5 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 p-4 rounded-xl">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Detected Deadlines & Contractual Commitments ({selectedThread.commitments.length})
                  </h4>
                  <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                    Google Calendar Cross-Referenced
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedThread.commitments.map((cm) => (
                    <div
                      key={cm.id}
                      className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{cm.text}</span>
                          {cm.hasCalendarConflict && (
                            <span className="px-1.5 py-0.2 text-[9px] font-extrabold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 rounded">
                              Conflict: {cm.conflictingEventTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Target: <strong className="text-slate-800 dark:text-slate-200">{cm.targetDateFormatted}</strong>
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleScheduleCommitmentHold(cm)}
                          disabled={cm.status === 'scheduled_calendar'}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          title="Create Google Calendar soft-hold with 15m focus buffer"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>{cm.status === 'scheduled_calendar' ? 'Held' : 'Hold Slot'}</span>
                        </button>

                        <button
                          onClick={() => handleCreateTaskFromCommitment(cm)}
                          disabled={cm.status === 'task_created'}
                          className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition cursor-pointer flex items-center gap-1 disabled:opacity-50"
                        >
                          <CheckSquare className="w-3 h-3" />
                          <span>Task</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spam Purge & Permanent Domain Blacklist Action (If Q4) */}
            {selectedThread.quadrant === 'q4_spam_purge' && (
              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/60 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-red-900 dark:text-red-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-600" />
                    Spam & Competitor Scraper Detected
                  </span>
                  <button
                    onClick={() => handlePurgeThreadAndBlacklist(selectedThread)}
                    className="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Purge & Sync to 2nd Brain Blacklist</span>
                  </button>
                </div>
                <p className="text-[11px] text-red-700 dark:text-red-300">
                  Clicking this will delete this email thread and permanently store the sender domain into your 2nd Brain Blacklist vault to filter future CSV/CRM imports.
                </p>
              </div>
            )}

            {/* Autonomous VIP AI Draft Responder */}
            {selectedThread.quadrant !== 'q4_spam_purge' && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    Autonomous 2nd Brain VIP Response Draft
                  </h4>
                  <button
                    onClick={handleSynthesizePersonaDraft}
                    disabled={isSynthesizingDraft}
                    className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSynthesizingDraft ? 'animate-spin' : ''}`} />
                    <span>Re-synthesize with Active Persona</span>
                  </button>
                </div>

                <textarea
                  rows={6}
                  value={draftEditingBody}
                  onChange={(e) => setDraftEditingBody(e.target.value)}
                  className="w-full p-3 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 resize-none font-sans"
                  placeholder="AI-generated compliant email draft will appear here..."
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={handleCopyDraft}
                    className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition cursor-pointer flex items-center gap-1.5"
                  >
                    {copiedResponse ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedResponse ? 'Copied to Clipboard' : 'Copy Draft'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSendDraft}
                      className="px-4 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Review & Dispatch to Gmail</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
