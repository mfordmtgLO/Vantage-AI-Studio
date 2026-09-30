/**
 * @file PriorityTwoWayTaskCenter.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 *
 * Dedicated Priority Two-Way Communication Task Center for Loan Officers
 * Re-organizes active two-way lead communication tasks into a strict, clear
 * priority sequence in the dashboard layout with ZERO distracting popups or ping sounds.
 * Automatically dispatches lead-initiated initial replies and follow-up replies
 * as text messages to Mike Ford's iPhone (+1 541-729-2097) for remote two-way response.
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Smartphone,
  Send,
  Mail,
  Zap,
  CheckCircle2,
  Clock,
  MapPin,
  ChevronDown,
  ChevronUp,
  VolumeX,
  Phone,
  Check,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  Sliders,
  Filter,
  ExternalLink
} from 'lucide-react';
import { LeadItem } from './LeadDiscoveryStudio';

export interface PriorityTwoWayTask {
  id: string;
  leadId: string;
  author: string;
  location?: string;
  matchedProgram?: string;
  replyText: string;
  platform?: string;
  timestamp: string;
  receivedAt: string;
  priority: 'urgent' | 'high' | 'normal';
  status: 'awaiting_lo_reply' | 'replied_via_iphone' | 'replied_in_dashboard' | 'handled';
  smsForwardedToIphone: boolean;
  targetMobileNumber: string;
  messageThreadId?: string;
}

interface PriorityTwoWayTaskCenterProps {
  tasks: PriorityTwoWayTask[];
  leads: LeadItem[];
  targetMobileNumber?: string;
  onOpenReplyModal: (task: PriorityTwoWayTask) => void;
  onOpenGmailDraft: (task: PriorityTwoWayTask) => void;
  onMarkTaskHandled: (taskId: string) => void;
  onSimulateInboundReply?: () => void;
  onOpenNotificationConfig?: () => void;
  isCompactMode?: boolean;
}

export const PriorityTwoWayTaskCenter: React.FC<PriorityTwoWayTaskCenterProps> = ({
  tasks,
  leads,
  targetMobileNumber = '+1 (541) 729-2097',
  onOpenReplyModal,
  onOpenGmailDraft,
  onMarkTaskHandled,
  onSimulateInboundReply,
  onOpenNotificationConfig,
  isCompactMode = false
}) => {
  const [filter, setFilter] = useState<'awaiting' | 'all' | 'handled'>('awaiting');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const cleanPhone = (targetMobileNumber || '5417292097').replace(/[^0-9]/g, '');
  const tenDigits = cleanPhone.length === 11 && cleanPhone.startsWith('1') ? cleanPhone.slice(1) : cleanPhone;

  // Filter tasks based on selected view
  const awaitingTasks = tasks.filter(t => t.status === 'awaiting_lo_reply');
  const handledTasks = tasks.filter(t => t.status === 'handled' || t.status === 'replied_via_iphone' || t.status === 'replied_in_dashboard');

  const visibleTasks = tasks.filter(task => {
    if (filter === 'awaiting' && task.status !== 'awaiting_lo_reply') return false;
    if (filter === 'handled' && task.status === 'awaiting_lo_reply') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchAuthor = task.author.toLowerCase().includes(q);
      const matchText = task.replyText.toLowerCase().includes(q);
      const matchLoc = (task.location || '').toLowerCase().includes(q);
      const matchProg = (task.matchedProgram || '').toLowerCase().includes(q);
      if (!matchAuthor && !matchText && !matchLoc && !matchProg) return false;
    }
    return true;
  });

  const handleSmsLinkClick = (task: PriorityTwoWayTask) => {
    setFeedbackMsg(`📱 Remote Apple Messages draft opened for @${task.author}. Text alert already sent to ${targetMobileNumber}!`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/50 shadow-2xl p-4 sm:p-5 space-y-4 relative overflow-hidden transition-all duration-300">
      {/* Top Header Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-slate-950 font-black shadow-lg shrink-0 mt-0.5">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30 flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Zero-Popup Layout Priority Queue</span>
              </span>
              <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                <VolumeX className="w-3 h-3 text-emerald-400" />
                <span>Silent Dashboard Mode (No Pings)</span>
              </span>
              <span className="text-[10px] font-bold bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30 flex items-center gap-1">
                <Smartphone className="w-3 h-3 text-amber-400" />
                <span>iPhone SMS Forwarding Active ({targetMobileNumber})</span>
              </span>
            </div>
            <h2 className="text-white font-black text-base sm:text-lg flex items-center gap-2 mt-1">
              <span>Priority Two-Way Communication Tasks</span>
              {awaitingTasks.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-xs font-black animate-pulse">
                  {awaitingTasks.length} Awaiting Response
                </span>
              )}
            </h2>
            <p className="text-slate-300 text-xs mt-0.5 max-w-3xl">
              All lead-initiated initial replies and follow-up replies are delivered directly to your iPhone as text messages so you can respond remotely away from your computer. Tasks are ordered below in strict priority sequence for clear handling without popup distractions.
            </p>
          </div>
        </div>

        {/* Top Controls & View Toggles */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-end">
          {onSimulateInboundReply && (
            <button
              type="button"
              onClick={onSimulateInboundReply}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
              title="Simulate an inbound lead reply arriving silently and texting Mike's iPhone"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>🧪 Test Inbound Reply</span>
            </button>
          )}

          {onOpenNotificationConfig && (
            <button
              type="button"
              onClick={onOpenNotificationConfig}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
              title="Notification & SMS Preferences"
            >
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Settings</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition cursor-pointer"
          >
            {isCollapsed ? (
              <>
                <ChevronDown className="w-3.5 h-3.5" />
                <span>Expand Queue ({visibleTasks.length})</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3.5 h-3.5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Content Area when expanded */}
      {!isCollapsed && (
        <div className="space-y-4">
          {/* Sub-Filter Tabs Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <button
                type="button"
                onClick={() => setFilter('awaiting')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  filter === 'awaiting'
                    ? 'bg-amber-500 text-slate-950 shadow-md ring-1 ring-amber-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                }`}
              >
                <span>🔥 Priority Awaiting LO Response</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filter === 'awaiting' ? 'bg-slate-950 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>
                  {awaitingTasks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  filter === 'all'
                    ? 'bg-indigo-600 text-white shadow-md ring-1 ring-indigo-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                }`}
              >
                <span>📋 All Two-Way Tasks</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filter === 'all' ? 'bg-indigo-950 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  {tasks.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFilter('handled')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  filter === 'handled'
                    ? 'bg-emerald-600 text-white shadow-md ring-1 ring-emerald-400'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700'
                }`}
              >
                <span>✅ Handled &amp; Up to Date</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${filter === 'handled' ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-700 text-slate-300'}`}>
                  {handledTasks.length}
                </span>
              </button>
            </div>

            {/* Quick Filter Search */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prospect, message, county..."
                className="w-full sm:w-64 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Task Cards in Priority Sequence */}
          {visibleTasks.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h3 className="text-white font-bold text-sm">All Two-Way Communication Tasks Handled!</h3>
              <p className="text-slate-400 text-xs max-w-md mx-auto">
                No active prospect replies waiting for loan officer response in this view. When an active lead initiates or replies, it will be automatically dispatched to Mike's iPhone ({targetMobileNumber}) and staged here without disturbing dashboard popups.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {visibleTasks.map((task, index) => {
                const isAwaiting = task.status === 'awaiting_lo_reply';
                const isUrgent = task.priority === 'urgent' || index === 0;
                const lead = leads.find(l => l.id === task.leadId);

                // Build Apple Messages 1-tap deep link
                const threadTag = task.messageThreadId ? ` [Thread #${task.messageThreadId}]` : '';
                const smsReplyBody = `Hi ${task.author}! Got your message regarding ${task.matchedProgram || 'financing'} in ${task.location || 'Oregon'}. Let's run your exact numbers review today!${threadTag}`;
                const nativeSmsDeepLink = `sms:+1${tenDigits}?body=${encodeURIComponent(smsReplyBody)}`;

                return (
                  <div
                    key={task.id}
                    className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 border ${
                      isAwaiting
                        ? isUrgent
                          ? 'bg-slate-900/95 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/40'
                          : 'bg-slate-900/90 border-indigo-500/50 shadow-md'
                        : 'bg-slate-950/70 border-slate-800 opacity-80 hover:opacity-100'
                    }`}
                  >
                    {/* Header Row: Priority Rank & Context */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {isAwaiting ? (
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1 ${
                              isUrgent
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-400/40 animate-pulse'
                                : 'bg-indigo-500 text-white'
                            }`}
                          >
                            <Zap className="w-3 h-3" />
                            <span>
                              {isUrgent ? `🔥 Priority #${index + 1} • Immediate Action` : `⚡ Priority #${index + 1} • Inbound Reply`}
                            </span>
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            <span>
                              {task.status === 'replied_via_iphone' ? '📱 Answered via iPhone SMS' : '✅ Handled by LO'}
                            </span>
                          </span>
                        )}

                        <span className="text-white font-black text-sm sm:text-base">
                          {task.author}
                        </span>

                        {task.platform && (
                          <span className="text-[10px] font-semibold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md border border-slate-700">
                            {task.platform}
                          </span>
                        )}

                        {task.location && (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{task.location}</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{task.timestamp || 'Recent'}</span>
                      </div>
                    </div>

                    {/* Matched Loan Program Tag */}
                    {task.matchedProgram && (
                      <div className="mt-2.5 flex items-center gap-2 text-xs">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Matched Program:</span>
                        <span className="font-bold text-indigo-300 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                          {task.matchedProgram}
                        </span>
                      </div>
                    )}

                    {/* Lead's Message Quote Bubble */}
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs sm:text-sm text-slate-100 font-medium leading-relaxed relative">
                      <div className="text-[10px] font-extrabold text-amber-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>💬 Prospect Inbound Message:</span>
                        <span className="text-slate-400 font-mono font-normal text-[10px]">
                          {task.receivedAt ? new Date(task.receivedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="italic text-slate-200">
                        &ldquo;{task.replyText}&rdquo;
                      </p>
                    </div>

                    {/* Remote iPhone Delivery Status Indicator */}
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2 p-2 rounded-xl bg-slate-950/50 border border-slate-800/80 text-[11px]">
                      <div className="flex items-center gap-2 text-slate-300">
                        <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          Delivered to Mike's iPhone (<strong className="text-white">{targetMobileNumber}</strong>) via SMS Relay.
                        </span>
                        <span className="text-emerald-400 font-semibold">• Remote Response Ready</span>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Carrier: Verizon (vtext.com)
                      </span>
                    </div>

                    {/* Action Hub per Task */}
                    <div className="mt-3.5 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* 1. Remote Apple Messages / SMS 1-Tap Link */}
                        <a
                          href={nativeSmsDeepLink}
                          onClick={() => handleSmsLinkClick(task)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs transition shadow-md cursor-pointer"
                          title="Open native Apple Messages / SMS with pre-drafted expert response"
                        >
                          <Smartphone className="w-3.5 h-3.5" />
                          <span>📱 1-Tap Apple Messages</span>
                        </a>

                        {/* 2. In-Dashboard Conversation Reply Modal */}
                        <button
                          type="button"
                          onClick={() => onOpenReplyModal(task)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-extrabold text-xs transition cursor-pointer border border-amber-500/40"
                          title="Open two-way chat modal in dashboard to type reply directly"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>💬 Reply in Dashboard</span>
                        </button>

                        {/* 3. Google Workspace / Gmail Draft */}
                        <button
                          type="button"
                          onClick={() => onOpenGmailDraft(task)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer border border-slate-700"
                          title="Create pre-drafted Google Workspace email reply"
                        >
                          <Mail className="w-3.5 h-3.5 text-rose-400" />
                          <span>✉️ Workspace Draft</span>
                        </button>
                      </div>

                      {/* Right Hand Action: Mark Handled */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onMarkTaskHandled(task.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isAwaiting
                              ? 'bg-slate-800 hover:bg-emerald-950 hover:text-emerald-300 hover:border-emerald-500/50 text-slate-300 border border-slate-700'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-800'
                          }`}
                          title={isAwaiting ? 'Mark task as handled/responded' : 'Re-open task to pending'}
                        >
                          {isAwaiting ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Mark Handled</span>
                            </>
                          ) : (
                            <>
                              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                              <span>Re-Open Task</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
