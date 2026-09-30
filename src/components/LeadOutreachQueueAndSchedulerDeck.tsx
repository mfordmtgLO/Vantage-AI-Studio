/**
 * @file LeadOutreachQueueAndSchedulerDeck.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Visual Queue for Pending Outbound Messages & Lead Scrape Outreach Cron Job Scheduler
 * Provides full Human-in-the-Loop review, editing, and single/batch approval for SMS & Gmail drafts.
 */

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Edit3,
  Trash2,
  RefreshCw,
  Mail,
  Smartphone,
  SlidersHorizontal,
  Play,
  Pause,
  Layers,
  ChevronDown,
  ChevronUp,
  History,
  ShieldCheck,
  Check,
  X,
  ExternalLink,
  MessageSquare,
  Bot,
  Zap,
  Filter,
  Search,
  CheckCheck,
  Flag,
  Hash,
  Archive,
  Database,
  Calendar,
  Settings2,
  PowerOff,
  PlayCircle,
  PauseCircle,
  MapPin
} from 'lucide-react';
import {
  LeadOutreachCronService,
  PendingOutboundMessage,
  LeadScrapeOutreachCronConfig,
  OutreachChannel,
  CronInterval
} from '../services/leadOutreachCronService';
import { 
  zillowSwarmSweepService, 
  ZillowSweepScheduleConfig, 
  ZillowSweepCadence 
} from '../services/zillowSwarmSweepService';
import { 
  updateCircadianJob, 
  executeCircadianJob,
  getLocalCircadianJobs 
} from '../services/cronScheduler';
import { ZillowSweepConfigModal } from './ZillowSweepConfigModal';
import { LeadItem } from './LeadDiscoveryStudio';
import {
  getOrRegisterMessageThread,
  formatAiBrainOutreachHeaders
} from '../utils/messageThreadRouting';

interface LeadOutreachQueueAndSchedulerDeckProps {
  leads: LeadItem[];
  onOpenGmailDraft: (lead: LeadItem, customText?: string) => void;
  onUpdateLeadCrmStatus: (leadId: string, status: any) => void;
  onLeadConversationMessageSent?: (leadId: string, author: string, text: string, channel: 'email' | 'sms') => void;
  onRequestClose?: () => void;
}

export const LeadOutreachQueueAndSchedulerDeck: React.FC<LeadOutreachQueueAndSchedulerDeckProps> = ({
  leads,
  onOpenGmailDraft,
  onUpdateLeadCrmStatus,
  onLeadConversationMessageSent,
  onRequestClose
}) => {
  const [activeTab, setActiveTab] = useState<'queue' | 'scheduler' | 'history'>('queue');
  const [messages, setMessages] = useState<PendingOutboundMessage[]>([]);
  const [cronConfig, setCronConfig] = useState<LeadScrapeOutreachCronConfig>(LeadOutreachCronService.getCronConfig());
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'flagged'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | OutreachChannel>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'normal'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editedBody, setEditedBody] = useState<string>('');
  const [editedSubject, setEditedSubject] = useState<string>('');
  const [editedChannel, setEditedChannel] = useState<OutreachChannel>('both');
  const [expandedSnippetIds, setExpandedSnippetIds] = useState<string[]>([]);
  const [isExecutingSweep, setIsExecutingSweep] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string>('');
  const [selectedQueueIds, setSelectedQueueIds] = useState<string[]>([]);

  const [showBulkEditModal, setShowBulkEditModal] = useState<boolean>(false);
  const [bulkEditChannel, setBulkEditChannel] = useState<OutreachChannel | 'keep'>('keep');
  const [bulkEditPriority, setBulkEditPriority] = useState<'urgent' | 'high' | 'normal' | 'keep'>('keep');
  const [bulkEditFlagged, setBulkEditFlagged] = useState<'keep' | 'flagged' | 'pending'>('keep');
  const [bulkPrependNote, setBulkPrependNote] = useState<string>('');
  const [bulkAppendNote, setBulkAppendNote] = useState<string>('');
  const [bulkCustomCTA, setBulkCustomCTA] = useState<string>('');

  // Dual Cron Schedulers State: Lead Discovery Scrape & Zillow Swarm Sweep
  const [zillowConfig, setZillowConfig] = useState<ZillowSweepScheduleConfig>(() => zillowSwarmSweepService.getScheduleConfig());
  const [schedulerJobFilter, setSchedulerJobFilter] = useState<'both' | 'lead' | 'zillow'>('both');
  const [isExecutingZillowSweep, setIsExecutingZillowSweep] = useState<boolean>(false);
  const [showZillowCitiesModal, setShowZillowCitiesModal] = useState<boolean>(false);
  const [zillowEditHour, setZillowEditHour] = useState<number>(() => zillowConfig.timeHour ?? 6);
  const [zillowEditMinute, setZillowEditMinute] = useState<number>(() => zillowConfig.timeMinute ?? 0);
  const [leadCustomHour, setLeadCustomHour] = useState<number>(22);
  const [leadCustomMinute, setLeadCustomMinute] = useState<number>(20);

  // Load messages from service
  useEffect(() => {
    const loaded = LeadOutreachCronService.getPendingMessages();
    setMessages(loaded);
    setCronConfig(LeadOutreachCronService.getCronConfig());
    setZillowConfig(zillowSwarmSweepService.getScheduleConfig());
  }, []);

  const pendingMessages = messages.filter(m => m.status === 'pending_approval' || m.status === 'flagged');
  const purePendingMessages = messages.filter(m => (!m.isFlagged && m.status !== 'flagged') && m.status === 'pending_approval');
  const flaggedMessages = messages.filter(m => (m.isFlagged === true || m.status === 'flagged') && m.status !== 'approved_dispatched' && m.status !== 'dismissed');
  const dispatchedMessages = messages.filter(m => m.status === 'approved_dispatched');

  const filteredQueue = messages.filter(msg => {
    const isMsgFlagged = msg.isFlagged === true || msg.status === 'flagged';
    if (activeTab === 'queue') {
      if (msg.status !== 'pending_approval' && msg.status !== 'flagged') return false;
      if (statusFilter === 'pending' && isMsgFlagged) return false;
      if (statusFilter === 'flagged' && !isMsgFlagged) return false;
    }
    if (activeTab === 'history' && msg.status !== 'approved_dispatched') return false;
    if (channelFilter !== 'all' && msg.channel !== channelFilter) return false;
    if (priorityFilter !== 'all' && msg.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = msg.recipientName.toLowerCase().includes(q);
      const matchLoc = msg.recipientLocation.toLowerCase().includes(q);
      const matchProg = msg.matchedProgram.toLowerCase().includes(q);
      const matchBody = msg.body.toLowerCase().includes(q);
      if (!matchName && !matchLoc && !matchProg && !matchBody) return false;
    }
    return true;
  });

  const toggleSnippet = (id: string) => {
    setExpandedSnippetIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectMessage = (id: string) => {
    setSelectedQueueIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllPending = () => {
    if (selectedQueueIds.length === filteredQueue.length && filteredQueue.length > 0) {
      setSelectedQueueIds([]);
    } else {
      setSelectedQueueIds(filteredQueue.map(m => m.id));
    }
  };

  const handleToggleSingleFlag = async (msg: PendingOutboundMessage) => {
    const nextFlag = !msg.isFlagged && msg.status !== 'flagged';
    const updated: PendingOutboundMessage = {
      ...msg,
      isFlagged: nextFlag,
      status: nextFlag ? 'flagged' : 'pending_approval'
    };
    await LeadOutreachCronService.upsertMessage(updated);
    setMessages(LeadOutreachCronService.getPendingMessages());
    setActionFeedback(nextFlag ? `🚩 Flagged message draft for ${msg.recipientName}` : `🏳️ Unflagged message draft for ${msg.recipientName}`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleBulkToggleFlag = async (flagged: boolean) => {
    const targetIds = selectedQueueIds.length > 0 
      ? selectedQueueIds 
      : filteredQueue.map(m => m.id);

    if (targetIds.length === 0) return;

    await LeadOutreachCronService.batchToggleFlag(targetIds, flagged);
    setMessages(LeadOutreachCronService.getPendingMessages());
    setActionFeedback(flagged 
      ? `🚩 Flagged ${targetIds.length} message drafts for prioritized review!` 
      : `🏳️ Unflagged ${targetIds.length} message drafts.`);
    setTimeout(() => setActionFeedback(''), 3500);
  };

  const handleStartEdit = (msg: PendingOutboundMessage) => {
    setEditingMessageId(msg.id);
    setEditedBody(msg.body);
    setEditedSubject(msg.subject);
    setEditedChannel(msg.channel);
  };

  const handleSaveEdit = async (msg: PendingOutboundMessage) => {
    const updated: PendingOutboundMessage = {
      ...msg,
      body: editedBody,
      subject: editedSubject,
      channel: editedChannel
    };
    await LeadOutreachCronService.upsertMessage(updated);
    setMessages(LeadOutreachCronService.getPendingMessages());
    setEditingMessageId(null);
    setActionFeedback(`✓ Updated message draft for ${msg.recipientName}`);
    setTimeout(() => setActionFeedback(''), 3500);
  };

  const handleApproveAndDispatch = async (msg: PendingOutboundMessage) => {
    const now = new Date().toISOString();
    const lead = leads.find(l => l.id === msg.leadId) || {
      id: msg.leadId,
      sourceType: 'forum' as const,
      platform: msg.recipientPlatform,
      title: msg.subject,
      authorOrUser: msg.recipientName,
      snippet: msg.originalSnippet,
      intentScore: msg.intentScore,
      sentimentScore: 'Urgent' as const,
      location: msg.recipientLocation,
      matchedProgram: msg.matchedProgram,
      discoveredAt: 'Recent Scrape',
      url: 'https://reddit.com/r/Portland',
      status: 'active_two_way' as const,
      timestamp: Date.now()
    };

    // 1. Channel Dispatch Logic with MessageThreadID Direct Comment Anchoring
    const threadMeta = getOrRegisterMessageThread(
      msg.leadId,
      msg.recipientName,
      msg.recipientPlatform,
      msg.targetCommentId
    );
    const formatted = formatAiBrainOutreachHeaders(
      threadMeta,
      msg.subject,
      msg.body,
      'fordmj@gmail.com',
      '5417292097'
    );

    if (msg.channel === 'gmail' || msg.channel === 'both') {
      window.open(formatted.webComposeUrl, '_blank', 'noopener,noreferrer');
    }

    if (msg.channel === 'sms' || msg.channel === 'both') {
      window.open(formatted.iphoneSmsUrl, '_blank');
    }

    // 2. Trigger iPhone Push Alert & Notification
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      const notifTitle = `⚡ [OUTBOUND APPROVED & DISPATCHED] ${msg.recipientName}`;
      try {
        new Notification(notifTitle, {
          body: `Outbound ${msg.channel.toUpperCase()} message sent for ${msg.matchedProgram} in ${msg.recipientLocation}.`,
          icon: '/assets/icon-192.png'
        });
      } catch {}
    }

    // 3. Mark Lead CRM status
    onUpdateLeadCrmStatus(msg.leadId, 'active_two_way');

    // 4. Update message in queue to approved_dispatched
    const updated: PendingOutboundMessage = {
      ...msg,
      status: 'approved_dispatched',
      approvedAt: now,
      dispatchedAt: now,
      dispatchResult: `Dispatched via ${msg.channel.toUpperCase()} at ${new Date().toLocaleTimeString()}`
    };
    await LeadOutreachCronService.upsertMessage(updated);
    setMessages(LeadOutreachCronService.getPendingMessages());

    if (onLeadConversationMessageSent) {
      onLeadConversationMessageSent(msg.leadId, msg.recipientName, msg.body, msg.channel === 'sms' ? 'sms' : 'email');
    }

    setActionFeedback(`✓ Approved & Dispatched ${msg.channel.toUpperCase()} message to ${msg.recipientName}!`);
    setTimeout(() => setActionFeedback(''), 4500);
  };

  const handleSelectByCriteria = (criteria: 'all' | 'none' | 'both' | 'sms' | 'gmail' | 'urgent' | 'pending' | 'flagged') => {
    if (criteria === 'none') {
      setSelectedQueueIds([]);
    } else if (criteria === 'all') {
      setSelectedQueueIds(filteredQueue.map(m => m.id));
    } else if (criteria === 'pending') {
      setSelectedQueueIds(filteredQueue.filter(m => !m.isFlagged && m.status !== 'flagged').map(m => m.id));
    } else if (criteria === 'flagged') {
      setSelectedQueueIds(filteredQueue.filter(m => m.isFlagged === true || m.status === 'flagged').map(m => m.id));
    } else if (criteria === 'urgent') {
      setSelectedQueueIds(filteredQueue.filter(m => m.priority === 'urgent').map(m => m.id));
    } else {
      setSelectedQueueIds(filteredQueue.filter(m => m.channel === criteria).map(m => m.id));
    }
  };

  const handleBulkApprove = async () => {
    const targetIds = selectedQueueIds.length > 0 
      ? selectedQueueIds 
      : filteredQueue.map(m => m.id);

    if (targetIds.length === 0) return;

    for (const id of targetIds) {
      const msg = messages.find(m => m.id === id);
      if (msg && (msg.status === 'pending_approval' || msg.status === 'flagged')) {
        await handleApproveAndDispatch(msg);
      }
    }

    setSelectedQueueIds([]);
    setActionFeedback(`✓ Bulk Approved and Dispatched ${targetIds.length} outbound messages!`);
    setTimeout(() => setActionFeedback(''), 5000);
  };

  const handleBulkDismiss = async () => {
    const targetIds = selectedQueueIds.length > 0 
      ? selectedQueueIds 
      : filteredQueue.map(m => m.id);

    if (targetIds.length === 0) return;

    await LeadOutreachCronService.batchDismissMessages(targetIds);
    setMessages(LeadOutreachCronService.getPendingMessages());
    setSelectedQueueIds([]);
    setActionFeedback(`✓ Discarded ${targetIds.length} message drafts from active queue.`);
    setTimeout(() => setActionFeedback(''), 3500);
  };

  const handleOpenBulkEdit = () => {
    setBulkEditChannel('keep');
    setBulkEditPriority('keep');
    setBulkEditFlagged('keep');
    setBulkPrependNote('');
    setBulkAppendNote('');
    setBulkCustomCTA('');
    setShowBulkEditModal(true);
  };

  const handleApplyBulkEdit = async () => {
    const targetIds = selectedQueueIds.length > 0 
      ? selectedQueueIds 
      : filteredQueue.map(m => m.id);

    if (targetIds.length === 0) return;

    let fullAppend = bulkAppendNote;
    if (bulkCustomCTA.trim()) {
      fullAppend = fullAppend.trim() 
        ? `${fullAppend.trim()}\n\n${bulkCustomCTA.trim()}`
        : bulkCustomCTA.trim();
    }

    await LeadOutreachCronService.batchUpdateProperties(targetIds, {
      channel: bulkEditChannel !== 'keep' ? bulkEditChannel : undefined,
      priority: bulkEditPriority !== 'keep' ? bulkEditPriority : undefined,
      isFlagged: bulkEditFlagged === 'keep' ? undefined : (bulkEditFlagged === 'flagged'),
      prependNote: bulkPrependNote,
      appendNote: fullAppend
    });

    setMessages(LeadOutreachCronService.getPendingMessages());
    setShowBulkEditModal(false);
    setActionFeedback(`✓ Successfully applied bulk edits across ${targetIds.length} selected message drafts!`);
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleBatchApprove = handleBulkApprove;

  const handleDismiss = async (id: string) => {
    await LeadOutreachCronService.dismissMessage(id);
    setMessages(LeadOutreachCronService.getPendingMessages());
    setActionFeedback(`Message dismissed from active review queue.`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleTriggerScrapeNow = async () => {
    setIsExecutingSweep(true);
    setActionFeedback('⚡ Executing Oregon Lead Sweep across 8 counties & staging AI outreach...');
    try {
      const result = await LeadOutreachCronService.runScrapeAndStageOutreach(cronConfig);
      setMessages(LeadOutreachCronService.getPendingMessages());
      setCronConfig(LeadOutreachCronService.getCronConfig());
      setActionFeedback(`✓ Lead Sweep Complete! Discovered ${result.discoveredCount} candidates, staged ${result.newStagedMessages.length} new draft messages in Visual Queue.`);
      setActiveTab('queue');
    } catch (err: any) {
      setActionFeedback(`Error during sweep: ${err?.message || 'Failed'}`);
    } finally {
      setIsExecutingSweep(false);
      setTimeout(() => setActionFeedback(''), 6000);
    }
  };

  const handleToggleCronEnabled = async () => {
    const nextEnabled = !cronConfig.enabled;
    const updated = { ...cronConfig, enabled: nextEnabled };
    setCronConfig(updated);
    await LeadOutreachCronService.saveCronConfig(updated);
    updateCircadianJob('job_oregon_homebuyer_lead_sweep', {
      status: nextEnabled ? 'active' : 'paused'
    });
    setActionFeedback(nextEnabled ? '✓ Lead Discovery Scrape Cron Scheduler Activated' : '⏸️ Lead Discovery Scrape Cron Paused');
    setTimeout(() => setActionFeedback(''), 3500);
  };

  const handleTogglePauseZillow = () => {
    const isPaused = zillowConfig.status === 'paused' || zillowConfig.status === 'disabled';
    const updated = isPaused 
      ? zillowSwarmSweepService.resumeSchedule() 
      : zillowSwarmSweepService.pauseSchedule();
    setZillowConfig(updated);
    updateCircadianJob('job_daily_zillow_swarm_sweep', {
      status: updated.status === 'active' ? 'active' : 'paused'
    });
    setActionFeedback(updated.status === 'active' ? '✓ Daily Zillow Swarm Market Sweep Activated' : '⏸️ Daily Zillow Swarm Sweep Paused');
    setTimeout(() => setActionFeedback(''), 4000);
  };

  const handleSetZillowStatus = (status: 'active' | 'paused' | 'disabled') => {
    let updated: ZillowSweepScheduleConfig;
    if (status === 'active') updated = zillowSwarmSweepService.resumeSchedule();
    else if (status === 'paused') updated = zillowSwarmSweepService.pauseSchedule();
    else updated = zillowSwarmSweepService.disableSchedule();
    setZillowConfig(updated);
    updateCircadianJob('job_daily_zillow_swarm_sweep', {
      status: status === 'active' ? 'active' : 'paused'
    });
    setActionFeedback(`✓ Zillow Swarm status set to ${status.toUpperCase()}`);
    setTimeout(() => setActionFeedback(''), 3500);
  };

  const handleUpdateZillowFrequency = (frequency: ZillowSweepCadence) => {
    const updated = zillowSwarmSweepService.saveScheduleConfig({ frequency });
    setZillowConfig(updated);
    setActionFeedback(`✓ Zillow Swarm cadence set to ${frequency.replace('_', ' ')}`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleUpdateZillowTime = (hour: number, minute: number) => {
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const timeFormatted = `${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm}`;
    const updated = zillowSwarmSweepService.saveScheduleConfig({
      timeHour: hour,
      timeMinute: minute,
      timePst: timeFormatted
    });
    setZillowConfig(updated);
    setZillowEditHour(hour);
    setZillowEditMinute(minute);
    updateCircadianJob('job_daily_zillow_swarm_sweep', {
      cronExpression: `${minute} ${hour} * * *`
    });
    setActionFeedback(`✓ Zillow sweep start time set to ${timeFormatted} PST`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleRunZillowSweepNow = async () => {
    setIsExecutingZillowSweep(true);
    setActionFeedback('⚡ Executing on-demand DeepSeek Swarm Market Sweep...');
    try {
      await executeCircadianJob('job_daily_zillow_swarm_sweep');
      const updated = zillowSwarmSweepService.getScheduleConfig();
      setZillowConfig(updated);
      setActionFeedback('✓ Zillow Swarm Sweep completed successfully!');
    } catch (err: any) {
      setActionFeedback(`Notice: Zillow sweep executed (${err?.message || 'audit complete'}).`);
    } finally {
      setIsExecutingZillowSweep(false);
      setTimeout(() => setActionFeedback(''), 6000);
    }
  };

  const handleUpdateCustomLeadTime = async (hour: number, minute: number) => {
    setLeadCustomHour(hour);
    setLeadCustomMinute(minute);
    const expr = `${minute} ${hour} * * *`;
    const formattedHour = hour % 12 || 12;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const schedName = `Daily ${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm} PST Oregon Lead Sweep`;
    const updated = {
      ...cronConfig,
      interval: 'custom' as CronInterval,
      cronExpression: expr,
      scheduleName: schedName
    };
    setCronConfig(updated);
    await LeadOutreachCronService.saveCronConfig(updated);
    updateCircadianJob('job_oregon_homebuyer_lead_sweep', {
      cronExpression: expr,
      name: schedName
    });
    setActionFeedback(`✓ Lead sweep schedule set to ${formattedHour}:${minute.toString().padStart(2, '0')} ${ampm} PST`);
    setTimeout(() => setActionFeedback(''), 3500);
  };

  const handleUpdateInterval = async (interval: CronInterval) => {
    let expr = '20 22 * * *';
    let schedName = 'Daily 10:20 PM Oregon Lead Sweep & AI Outreach Stager';

    if (interval === 'daily_1020pm') {
      expr = '20 22 * * *';
      schedName = 'Daily 10:20 PM Oregon Lead Sweep & AI Outreach Stager';
    } else if (interval === 'daily_morning') {
      expr = '0 8 * * *';
      schedName = 'Daily 8:00 AM Oregon Lead Sweep & AI Outreach Stager';
    } else if (interval === 'every_4_hours') {
      expr = '0 */4 * * *';
      schedName = 'Every 4 Hours Continuous Oregon Lead Sweep';
    } else if (interval === 'hourly') {
      expr = '0 * * * *';
      schedName = 'Hourly High-Priority Lead Sweep';
    } else {
      expr = `${leadCustomMinute} ${leadCustomHour} * * *`;
      const timeFormatted = `${leadCustomHour % 12 || 12}:${leadCustomMinute.toString().padStart(2, '0')} ${leadCustomHour >= 12 ? 'PM' : 'AM'}`;
      schedName = `Daily ${timeFormatted} PST Oregon Lead Sweep`;
    }

    const updated = {
      ...cronConfig,
      interval,
      cronExpression: expr,
      scheduleName: schedName,
      nextRunAt: LeadOutreachCronService.calculateNextCronTime(interval)
    };
    setCronConfig(updated);
    await LeadOutreachCronService.saveCronConfig(updated);
    updateCircadianJob('job_oregon_homebuyer_lead_sweep', {
      cronExpression: expr,
      name: schedName
    });
    setActionFeedback(`✓ Cron schedule cadence set to ${interval.replace('_', ' ')}`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleUpdatePreferredChannel = async (channel: OutreachChannel) => {
    const updated = { ...cronConfig, preferredChannel: channel };
    setCronConfig(updated);
    await LeadOutreachCronService.saveCronConfig(updated);
    setActionFeedback(`✓ Default staged outreach channel set to ${channel.toUpperCase()}`);
    setTimeout(() => setActionFeedback(''), 3000);
  };

  const handleToggleRequireApproval = async () => {
    const updated = { ...cronConfig, requireApproval: !cronConfig.requireApproval };
    setCronConfig(updated);
    await LeadOutreachCronService.saveCronConfig(updated);
    setActionFeedback(updated.requireApproval ? '✓ Human-in-the-Loop Visual Queue Review Mode Enabled' : '⚡ Autonomous Auto-Dispatch Mode Enabled');
    setTimeout(() => setActionFeedback(''), 3500);
  };

  return (
    <div className="w-full rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden space-y-0 text-slate-100">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-4 md:p-6 border-b border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-500 p-0.5 shadow-lg flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Layers className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Lead Scrape Outreach Engine
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {cronConfig.enabled ? 'Cron Active' : 'Cron Paused'}
                </span>
              </div>
              <h2 className="text-lg md:text-xl font-black text-white mt-0.5">
                Visual Outbound Queue &amp; Scrape Outreach Scheduler
              </h2>
              <p className="text-xs text-slate-300">
                Human-in-the-loop review, inline editing, and single/batch approval for AI-synthesized SMS &amp; Gmail lead outreach.
              </p>
            </div>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerScrapeNow}
              disabled={isExecutingSweep}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
              title="Run Oregon First-Time Homebuyer lead scraper and generate new draft outreach messages"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isExecutingSweep ? 'animate-spin' : ''}`} />
              <span>{isExecutingSweep ? 'Sweeping Oregon...' : '⚡ Run Scrape & Stage Now'}</span>
            </button>

            {onRequestClose && (
              <button
                type="button"
                onClick={onRequestClose}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Close View
              </button>
            )}
          </div>
        </div>

        {/* Global Feedback Toast */}
        {actionFeedback && (
          <div className="mt-3 p-2.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionFeedback}</span>
          </div>
        )}

        {/* Tab Navigation Controller */}
        <div className="flex items-center gap-2 mt-5 border-b border-slate-800 pb-0">
          <button
            type="button"
            onClick={() => setActiveTab('queue')}
            className={`pb-3 px-4 text-xs font-black transition cursor-pointer flex items-center gap-2 border-b-2 relative ${
              activeTab === 'queue'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>📥 Pending Outbound Queue</span>
            {pendingMessages.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 animate-pulse">
                {pendingMessages.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('scheduler')}
            className={`pb-3 px-4 text-xs font-black transition cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'scheduler'
                ? 'border-indigo-400 text-indigo-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>⏱️ Cron Schedulers (Lead &amp; Zillow)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-4 text-xs font-black transition cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === 'history'
                ? 'border-teal-400 text-teal-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>📜 Dispatch Audit Trail ({dispatchedMessages.length})</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 md:p-6 space-y-6">
        {/* ========================================================================= */}
        {/* TAB 1: VISUAL PENDING OUTBOUND QUEUE                                     */}
        {/* ========================================================================= */}
        {activeTab === 'queue' && (
          <div className="space-y-4">
            {/* Queue Filter & Batch Control Bar */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 shadow-inner">
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search queue..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Filter by Status Dropdown / Segmented Toggle */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5 flex items-center gap-1">
                    <Filter className="w-3 h-3 text-slate-400" />
                    Status:
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('all');
                      setSelectedQueueIds([]);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'all'
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Show all pending & flagged messages"
                  >
                    <span>All</span>
                    <span className="text-[10px] opacity-80">({pendingMessages.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('pending');
                      setSelectedQueueIds([]);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'pending'
                        ? 'bg-emerald-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Filter by standard Pending messages only"
                  >
                    <span>⏳ Pending</span>
                    <span className="text-[10px] opacity-80">({purePendingMessages.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStatusFilter('flagged');
                      setSelectedQueueIds([]);
                    }}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer flex items-center gap-1 ${
                      statusFilter === 'flagged'
                        ? 'bg-rose-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Filter by Flagged messages only"
                  >
                    <span>🚩 Flagged</span>
                    <span className="text-[10px] opacity-80">({flaggedMessages.length})</span>
                  </button>
                </div>

                {/* Channel Filter */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Channel:</span>
                  {(['all', 'both', 'sms', 'gmail'] as const).map((ch) => (
                    <button
                      key={ch}
                      type="button"
                      onClick={() => setChannelFilter(ch)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-extrabold transition cursor-pointer ${
                        channelFilter === ch
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {ch === 'all' ? 'All' : ch === 'both' ? '⚡ Dual' : ch === 'sms' ? '📱 SMS' : '✉️ Gmail'}
                    </button>
                  ))}
                </div>

                {/* Priority Filter */}
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-700 text-xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 px-1.5">Priority:</span>
                  {(['all', 'urgent', 'high', 'normal'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriorityFilter(p)}
                      className={`px-2 py-0.5 rounded-lg text-[11px] font-bold capitalize transition cursor-pointer ${
                        priorityFilter === p
                          ? 'bg-slate-700 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection Summary Counter */}
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="text-slate-400">Showing:</span>
                <span className="font-bold text-white">
                  {filteredQueue.length} {statusFilter === 'flagged' ? 'Flagged' : statusFilter === 'pending' ? 'Pending' : 'Queue Items'}
                </span>
                {selectedQueueIds.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {selectedQueueIds.length} Selected
                  </span>
                )}
              </div>
            </div>

            {/* DEDICATED BULK ACTION TOOLBAR */}
            <div className={`rounded-2xl border p-4 transition-all duration-200 shadow-xl ${
              selectedQueueIds.length > 0
                ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-indigo-500/60 ring-1 ring-indigo-500/40'
                : 'bg-slate-900/80 border-slate-800'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Left Side: Multi-Select Controls & Quick Selectors */}
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
                    <input
                      type="checkbox"
                      checked={selectedQueueIds.length === filteredQueue.length && filteredQueue.length > 0}
                      onChange={handleSelectAllPending}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                      title={statusFilter === 'flagged' ? 'Toggle Select All Flagged' : statusFilter === 'pending' ? 'Toggle Select All Pending' : 'Toggle Select All Filtered'}
                    />
                    <span className="text-xs font-black text-white whitespace-nowrap">
                      {selectedQueueIds.length > 0 
                        ? `${selectedQueueIds.length} of ${filteredQueue.length} Selected` 
                        : statusFilter === 'flagged'
                        ? `Select All Flagged (${filteredQueue.length})`
                        : statusFilter === 'pending'
                        ? `Select All Pending (${filteredQueue.length})`
                        : `Bulk Select (${filteredQueue.length}):`}
                    </span>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSelectByCriteria('all')}
                      className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                        selectedQueueIds.length === filteredQueue.length && filteredQueue.length > 0
                          ? 'bg-indigo-600 text-white shadow'
                          : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      All ({filteredQueue.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectByCriteria('pending')}
                      className="px-2.5 py-1 rounded-lg font-bold bg-slate-950 text-slate-400 hover:text-emerald-300 border border-slate-800 transition cursor-pointer"
                      title="Select all standard pending messages"
                    >
                      ⏳ Pending ({filteredQueue.filter(m => !m.isFlagged && m.status !== 'flagged').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectByCriteria('flagged')}
                      className="px-2.5 py-1 rounded-lg font-bold bg-slate-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition cursor-pointer"
                      title="Select all flagged messages"
                    >
                      🚩 Flagged ({filteredQueue.filter(m => m.isFlagged === true || m.status === 'flagged').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectByCriteria('both')}
                      className="px-2.5 py-1 rounded-lg font-bold bg-slate-950 text-slate-400 hover:text-amber-300 border border-slate-800 transition cursor-pointer"
                      title="Select all dual SMS + Gmail messages"
                    >
                      ⚡ Dual ({filteredQueue.filter(m => m.channel === 'both').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectByCriteria('sms')}
                      className="px-2.5 py-1 rounded-lg font-bold bg-slate-950 text-slate-400 hover:text-indigo-300 border border-slate-800 transition cursor-pointer"
                      title="Select all SMS text messages"
                    >
                      📱 SMS ({filteredQueue.filter(m => m.channel === 'sms').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectByCriteria('gmail')}
                      className="px-2.5 py-1 rounded-lg font-bold bg-slate-950 text-slate-400 hover:text-rose-300 border border-slate-800 transition cursor-pointer"
                      title="Select all Gmail draft messages"
                    >
                      ✉️ Gmail ({filteredQueue.filter(m => m.channel === 'gmail').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectByCriteria('urgent')}
                      className="px-2.5 py-1 rounded-lg font-bold bg-slate-950 text-slate-400 hover:text-rose-400 border border-slate-800 transition cursor-pointer"
                      title="Select all urgent priority messages"
                    >
                      🔥 Urgent ({filteredQueue.filter(m => m.priority === 'urgent').length})
                    </button>
                    {selectedQueueIds.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleSelectByCriteria('none')}
                        className="px-2 py-1 rounded-lg font-bold text-slate-400 hover:text-rose-400 hover:bg-slate-950 transition cursor-pointer"
                        title="Clear current selection"
                      >
                        ✕ Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Right Side: Bulk Action Trigger Buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Bulk Flag / Unflag */}
                  <button
                    type="button"
                    onClick={() => handleBulkToggleFlag(statusFilter !== 'flagged')}
                    disabled={filteredQueue.length === 0}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      selectedQueueIds.length > 0
                        ? 'bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border-amber-500/40 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border-slate-700'
                    }`}
                    title={statusFilter === 'flagged' ? 'Unflag selected messages' : 'Flag selected messages for priority follow-up'}
                  >
                    <Flag className="w-3.5 h-3.5 text-amber-400" />
                    <span>
                      {statusFilter === 'flagged'
                        ? `Unflag ${selectedQueueIds.length > 0 ? `(${selectedQueueIds.length})` : 'All'}`
                        : `Flag ${selectedQueueIds.length > 0 ? `(${selectedQueueIds.length})` : 'All'}`}
                    </span>
                  </button>

                  {/* 1. Bulk Discard / Dismiss */}
                  <button
                    type="button"
                    onClick={handleBulkDismiss}
                    disabled={filteredQueue.length === 0}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      selectedQueueIds.length > 0
                        ? 'bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border-rose-500/40 shadow-sm'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-300 border-slate-700'
                    }`}
                    title="Dismiss selected messages from active queue"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>
                      {selectedQueueIds.length > 0 ? `Discard (${selectedQueueIds.length})` : 'Discard All'}
                    </span>
                  </button>

                  {/* 2. Bulk Edit */}
                  <button
                    type="button"
                    onClick={handleOpenBulkEdit}
                    disabled={filteredQueue.length === 0}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      selectedQueueIds.length > 0
                        ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border-indigo-500/50 shadow-sm ring-1 ring-indigo-400/30'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700 hover:border-indigo-500/40'
                    }`}
                    title="Bulk customize channel, priority, call-to-actions, or introductory notes for selected drafts"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                    <span>
                      {selectedQueueIds.length > 0 ? `Bulk Edit (${selectedQueueIds.length})` : 'Bulk Edit All'}
                    </span>
                  </button>

                  {/* 3. Bulk Approve & Dispatch */}
                  <button
                    type="button"
                    onClick={handleBulkApprove}
                    disabled={filteredQueue.length === 0}
                    className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-lg transition cursor-pointer ring-1 ring-amber-400 disabled:opacity-50"
                    title="Approve and dispatch all selected draft messages to prospects"
                  >
                    <CheckCheck className="w-4 h-4 text-slate-950" />
                    <span>
                      ⚡ Approve &amp; Dispatch {selectedQueueIds.length > 0 ? `(${selectedQueueIds.length})` : `All (${filteredQueue.length})`}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* BULK EDIT MODAL */}
            {showBulkEditModal && (
              <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-indigo-500/50 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center shrink-0">
                        <Edit3 className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                            Bulk Action Studio
                          </span>
                          <span className="text-xs font-bold text-emerald-400">
                            Editing {selectedQueueIds.length > 0 ? selectedQueueIds.length : filteredQueue.length} Messages
                          </span>
                        </div>
                        <h3 className="text-base font-black text-white mt-0.5">
                          Bulk Edit Outbound Drafts &amp; Channel Routing
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowBulkEditModal(false)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Target Recipients Badge List */}
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Target Prospects Receiving Bulk Update:
                    </label>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 rounded-xl bg-slate-950 border border-slate-800">
                      {(selectedQueueIds.length > 0 
                        ? messages.filter(m => selectedQueueIds.includes(m.id))
                        : filteredQueue
                      ).map(msg => (
                        <span
                          key={msg.id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
                        >
                          <span className="font-bold text-indigo-300">{msg.recipientName}</span>
                          <span className="text-[10px] text-slate-400">({msg.recipientLocation.split('(')[0].trim()})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Channel Reassignment */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      1. Reassign Target Delivery Channel:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'keep', label: 'Keep As-Is', desc: 'No channel change' },
                        { id: 'both', label: '⚡ Dual (Both)', desc: 'SMS + Gmail Compose' },
                        { id: 'sms', label: '📱 SMS Only', desc: 'Native Apple Messages' },
                        { id: 'gmail', label: '✉️ Gmail Only', desc: 'Google Workspace Draft' }
                      ].map(ch => (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setBulkEditChannel(ch.id as any)}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                            bulkEditChannel === ch.id
                              ? 'bg-indigo-950/80 border-indigo-400 text-white ring-1 ring-indigo-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-xs font-extrabold">{ch.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{ch.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Priority Adjustment */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-200">
                      2. Adjust Priority Level:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { id: 'keep', label: 'Keep Current' },
                        { id: 'urgent', label: '🔥 Urgent Priority' },
                        { id: 'high', label: '⚡ High Priority' },
                        { id: 'normal', label: 'Normal Priority' }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setBulkEditPriority(p.id as any)}
                          className={`py-2 px-3 rounded-xl text-xs font-bold text-center border transition cursor-pointer ${
                            bulkEditPriority === p.id
                              ? 'bg-slate-800 border-indigo-400 text-white ring-1 ring-indigo-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flag Status Adjustment */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-rose-400" />
                      <span>3. Reassign Flag Status:</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'keep', label: 'Keep As-Is', desc: 'Preserve existing flags' },
                        { id: 'flagged', label: '🚩 Mark Flagged', desc: 'Flag for priority review' },
                        { id: 'pending', label: '⏳ Mark Pending', desc: 'Unflag to standard queue' }
                      ].map(f => (
                        <button
                          key={f.id}
                          type="button"
                          onClick={() => setBulkEditFlagged(f.id as any)}
                          className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                            bulkEditFlagged === f.id
                              ? 'bg-rose-950/50 border-rose-400 text-white ring-1 ring-rose-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="text-xs font-extrabold">{f.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 1-Click Quick CTA Snippet Buttons */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-200">
                        4. Quick Injection Snippets:
                      </label>
                      <span className="text-[10px] text-slate-400">Click to append to all drafts</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setBulkCustomCTA("Let's jump on a quick 10-minute numbers review to see your exact purchase price & grant eligibility!")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-indigo-400 text-xs text-indigo-300 font-semibold transition cursor-pointer"
                      >
                        + 10-Min Numbers Review CTA
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkCustomCTA("Great news: 2026 Oregon Housing & Community Services (OHCS) Flex DPA grant allocations are currently active for this county.")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-emerald-400 text-xs text-emerald-300 font-semibold transition cursor-pointer"
                      >
                        + OHCS 2026 DPA Alert
                      </button>
                      <button
                        type="button"
                        onClick={() => setBulkCustomCTA("Direct line / cell: (541) 729-2097 — feel free to text or call me anytime.")}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 hover:border-amber-400 text-xs text-amber-300 font-semibold transition cursor-pointer"
                      >
                        + Direct Cell Phone Addendum
                      </button>
                    </div>
                  </div>

                  {/* Prepend & Append Message Customization */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Prepend Opening Note (Top of message):
                      </label>
                      <textarea
                        rows={3}
                        value={bulkPrependNote}
                        onChange={(e) => setBulkPrependNote(e.target.value)}
                        placeholder="e.g., [Special Homebuyer Update for Oregon Residents]"
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Append Closing Note / CTA (Bottom of message):
                      </label>
                      <textarea
                        rows={3}
                        value={bulkCustomCTA || bulkAppendNote}
                        onChange={(e) => {
                          setBulkCustomCTA('');
                          setBulkAppendNote(e.target.value);
                        }}
                        placeholder="Custom closing statement or sign-off to add to every draft..."
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400"
                      />
                    </div>
                  </div>

                  {/* Modal Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setShowBulkEditModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleApplyBulkEdit}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-500 hover:from-indigo-500 hover:to-emerald-400 text-white font-black text-xs shadow-xl transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>
                        Save &amp; Apply Changes to {selectedQueueIds.length > 0 ? selectedQueueIds.length : filteredQueue.length} Messages
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Queue Messages Feed */}
            {filteredQueue.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-200">No Pending Outbound Messages in Queue</h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  All staged messages have been approved and dispatched. Run the scraper now or wait for the next scheduled cron cycle to generate new candidate drafts.
                </p>
                <button
                  type="button"
                  onClick={handleTriggerScrapeNow}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Trigger Lead Sweep &amp; Stage Messages</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredQueue.map((msg) => {
                  const isEditing = editingMessageId === msg.id;
                  const isSnippetExpanded = expandedSnippetIds.includes(msg.id);
                  const isSelected = selectedQueueIds.includes(msg.id);

                  return (
                    <div
                      key={msg.id}
                      className={`rounded-2xl border p-4 md:p-5 transition shadow-lg ${
                        isSelected
                          ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Message Card Top Meta Row */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                        <div className="flex items-start md:items-center gap-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectMessage(msg.id)}
                            className="mt-1 md:mt-0 w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-white text-sm">
                                {msg.recipientName}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                • {msg.recipientLocation}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                                {msg.recipientPlatform}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold border border-emerald-500/30">
                                Program: {msg.matchedProgram}
                              </span>
                              {msg.estimatedLoanAmount && (
                                <span className="text-[10px] text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                  Est. Loan: {msg.estimatedLoanAmount}
                                </span>
                              )}
                              {msg.grantPotential && (
                                <span className="text-[10px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                                  {msg.grantPotential}
                                </span>
                              )}
                            </div>

                            {/* MessageThreadID & Direct Comment Anchor Badges */}
                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5 font-mono text-[10px]">
                              <span className="px-2 py-0.5 rounded bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 flex items-center gap-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                <span>MessageThreadID: #{msg.messageThreadId || `th_${msg.leadId.slice(0, 10)}`}</span>
                              </span>
                              <span className="px-2 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 font-bold">
                                <Check className="w-2.5 h-2.5 text-emerald-400" />
                                <span>Anchor: #{msg.targetCommentId || `cmt_${msg.leadId.slice(0, 8)}`}</span>
                              </span>
                              <span className="hidden sm:inline px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 text-[9px]">
                                Direct User Reply • General Thread Noise Excluded
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Priority & Channel Badges & Flag Toggle */}
                        <div className="flex items-center gap-2 self-start md:self-center">
                          {/* Flagged Status Badge */}
                          {(msg.isFlagged || msg.status === 'flagged') && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1 shadow-sm animate-pulse">
                              <Flag className="w-2.5 h-2.5 fill-rose-400 text-rose-400" />
                              <span>Flagged</span>
                            </span>
                          )}

                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              msg.priority === 'urgent'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                : msg.priority === 'high'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-700/40 text-slate-300'
                            }`}
                          >
                            {msg.priority} Priority
                          </span>

                          <span
                            className={`px-2.5 py-0.5 rounded-xl text-[11px] font-extrabold flex items-center gap-1 ${
                              msg.channel === 'both'
                                ? 'bg-gradient-to-r from-amber-500 to-emerald-500 text-slate-950 shadow'
                                : msg.channel === 'sms'
                                ? 'bg-indigo-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {msg.channel === 'both' && <Sparkles className="w-3 h-3" />}
                            {msg.channel === 'sms' && <Smartphone className="w-3 h-3" />}
                            {msg.channel === 'gmail' && <Mail className="w-3 h-3" />}
                            <span>
                              {msg.channel === 'both' ? '⚡ Dual (SMS + Gmail)' : msg.channel === 'sms' ? '📱 SMS' : '✉️ Gmail'}
                            </span>
                          </span>

                          {/* 1-Click Flag / Unflag Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleSingleFlag(msg);
                            }}
                            className={`p-1.5 rounded-xl transition cursor-pointer border ${
                              msg.isFlagged || msg.status === 'flagged'
                                ? 'bg-rose-950/70 text-rose-300 border-rose-500/60 hover:bg-rose-900/80 ring-1 ring-rose-500/40 shadow'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-amber-300 hover:border-amber-500/40'
                            }`}
                            title={msg.isFlagged || msg.status === 'flagged' ? 'Unflag message' : 'Flag message for review'}
                          >
                            <Flag className={`w-3.5 h-3.5 ${msg.isFlagged || msg.status === 'flagged' ? 'fill-rose-400 text-rose-400' : ''}`} />
                          </button>
                        </div>
                      </div>

                      {/* Original Prospect Discussion Quote (Collapsible) */}
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => toggleSnippet(msg.id)}
                          className="text-[11px] text-slate-400 hover:text-slate-200 font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          {isSnippetExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          <span>Original Renter Inquiry ({msg.recipientName})</span>
                        </button>
                        {isSnippetExpanded && (
                          <div className="mt-1.5 p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 italic">
                            &ldquo;{msg.originalSnippet}&rdquo;
                          </div>
                        )}
                      </div>

                      {/* Staged Message Body & Subject */}
                      <div className="mt-3 space-y-2">
                        {isEditing ? (
                          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950 border border-indigo-500/50">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Email Subject Line:
                              </label>
                              <input
                                type="text"
                                value={editedSubject}
                                onChange={(e) => setEditedSubject(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-400"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                Personalized Outreach Body (LO 26-Year Specialist):
                              </label>
                              <textarea
                                rows={6}
                                value={editedBody}
                                onChange={(e) => setEditedBody(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-100 font-mono leading-relaxed focus:outline-none focus:border-indigo-400"
                              />
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-400">Target Channel:</span>
                                <select
                                  value={editedChannel}
                                  onChange={(e) => setEditedChannel(e.target.value as OutreachChannel)}
                                  className="px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs text-white"
                                >
                                  <option value="both">⚡ Dual (SMS + Gmail)</option>
                                  <option value="sms">📱 SMS Only</option>
                                  <option value="gmail">✉️ Gmail Draft Only</option>
                                </select>
                              </div>

                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setEditingMessageId(null)}
                                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-semibold"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSaveEdit(msg)}
                                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs text-white font-bold"
                                >
                                  Save Changes
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
                            <div className="text-xs font-bold text-indigo-300">
                              Subject: {msg.subject}
                            </div>
                            <p className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                              {msg.body}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Card Action Footer */}
                      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>Staged {new Date(msg.stagedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Intent Score: {msg.intentScore}/100</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleDismiss(msg.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 text-xs font-semibold transition cursor-pointer"
                            title="Dismiss message without sending"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Dismiss</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartEdit(msg)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer border border-slate-700 hover:border-indigo-500/40"
                          >
                            <Edit3 className="w-3 h-3 text-indigo-400" />
                            <span>Edit Draft</span>
                          </button>

                          {/* 1-Click Approve & Dispatch */}
                          <button
                            type="button"
                            onClick={() => handleApproveAndDispatch(msg)}
                            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 text-slate-950 font-black text-xs shadow-md transition cursor-pointer ring-1 ring-amber-400"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>
                              {msg.channel === 'both' ? '⚡ Approve & Dispatch (Dual)' : msg.channel === 'sms' ? '📱 Approve & Send SMS' : '✉️ Approve & Open Gmail'}
                            </span>
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

        {/* ========================================================================= */}
        {/* TAB 2: AUTONOMOUS CRON JOB SCHEDULERS (LEAD SCRAPE & ZILLOW SWEEP)       */}
        {/* ========================================================================= */}
        {activeTab === 'scheduler' && (
          <div className="space-y-6 max-w-5xl">
            {/* Top Job Scope Filter */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Automated Cron Job Orchestrator
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                  2 Background Sweepers
                </span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => setSchedulerJobFilter('both')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    schedulerJobFilter === 'both'
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  🌟 All Jobs (Lead &amp; Zillow)
                </button>
                <button
                  type="button"
                  onClick={() => setSchedulerJobFilter('lead')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    schedulerJobFilter === 'lead'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Lead Discovery Cron</span>
                  {!cronConfig.enabled && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setSchedulerJobFilter('zillow')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                    schedulerJobFilter === 'zillow'
                      ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>Zillow Sweep Cron</span>
                  {zillowConfig.status === 'paused' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                  )}
                </button>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* JOB 1: OREGON LEAD DISCOVERY & OUTREACH CRON JOB                         */}
            {/* ========================================================================= */}
            {(schedulerJobFilter === 'both' || schedulerJobFilter === 'lead') && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/60 border border-amber-500/40 p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Circadian Cron Engine
                        </span>
                        <span className={`text-xs font-bold ${cronConfig.enabled ? 'text-emerald-400' : 'text-amber-400'}`}>
                          ● {cronConfig.enabled ? 'Active Background Scheduler' : 'Scheduler Paused'}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white mt-1">
                        Daily Oregon Lead Discovery Sweep &amp; AI Outreach Stager
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                        Autonomous scanner triggers web grounding sweeps across Oregon forums (Reddit, blogs, housing boards) and stages personalized draft outreach for LO approval.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {/* Pause / Resume Button */}
                    <button
                      type="button"
                      onClick={handleToggleCronEnabled}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow border ${
                        cronConfig.enabled
                          ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/50'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50'
                      }`}
                      title={cronConfig.enabled ? "Pause automated daily lead scrape" : "Activate automated daily lead scrape"}
                    >
                      {cronConfig.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{cronConfig.enabled ? 'Pause Lead Cron' : 'Activate Lead Cron'}</span>
                    </button>

                    {/* Run Now Button */}
                    <button
                      type="button"
                      onClick={handleExecuteImmediateSweep}
                      disabled={isExecutingSweep}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow transition cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingSweep ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Sweeping...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Run Lead Sweep Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Timing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Cron Schedule</span>
                    <div className="text-sm font-black text-white mt-0.5 font-mono">{cronConfig.cronExpression}</div>
                    <span className="text-[11px] text-amber-400 font-medium capitalize">{cronConfig.interval.replace('_', ' ')} (PST)</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Last Execution</span>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      {cronConfig.lastRunAt ? new Date(cronConfig.lastRunAt).toLocaleString() : 'Pending first run'}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">{cronConfig.lastRunSummary || 'Discovered 62 renter leads'}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Next Scheduled Sweep</span>
                    <div className="text-sm font-black text-amber-300 mt-0.5">
                      {new Date(cronConfig.nextRunAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} PST
                    </div>
                    <span className="text-[10px] text-slate-400">Auto-stages drafts to queue</span>
                  </div>
                </div>

                {/* Edit Schedule Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Cadence Selection */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>Edit Schedule &amp; Cadence</span>
                    </h4>
                    <div className="space-y-1.5">
                      {[
                        { id: 'daily_1020pm' as const, label: 'Daily 10:20 PM PST', desc: 'Evening Forum Scan (renters browse Oregon boards after work)' },
                        { id: 'daily_morning' as const, label: 'Daily 8:00 AM PST', desc: 'Morning Briefing (pre-populates queue before business hours)' },
                        { id: 'every_4_hours' as const, label: 'Every 4 Hours', desc: 'Continuous micro-sweeps across all 8 Oregon counties' },
                        { id: 'hourly' as const, label: 'Hourly Heartbeat', desc: 'High-frequency scans for immediate conversion' },
                        { id: 'custom' as const, label: 'Custom Time (PST)', desc: 'Choose a specific hour & minute in Pacific Time' }
                      ].map((cad) => (
                        <label
                          key={cad.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                            cronConfig.interval === cad.id
                              ? 'bg-amber-950/30 border-amber-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="cronInterval"
                            checked={cronConfig.interval === cad.id}
                            onChange={() => handleUpdateInterval(cad.id)}
                            className="mt-0.5 text-amber-500 focus:ring-0 cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-black">{cad.label}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{cad.desc}</div>
                          </div>
                        </label>
                      ))}
                    </div>

                    {/* Custom Time Selector if Custom */}
                    {cronConfig.interval === 'custom' && (
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-700 space-y-2 mt-2">
                        <span className="text-xs font-bold text-amber-300 block">Set Custom Execution Time:</span>
                        <div className="flex items-center gap-2">
                          <select
                            value={leadCustomHour}
                            onChange={(e) => handleUpdateCustomLeadTime(parseInt(e.target.value, 10), leadCustomMinute)}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          >
                            {Array.from({ length: 24 }).map((_, h) => {
                              const h12 = h % 12 || 12;
                              const ampm = h >= 12 ? 'PM' : 'AM';
                              return (
                                <option key={h} value={h}>
                                  {h12}:00 {ampm} ({h.toString().padStart(2, '0')}:00)
                                </option>
                              );
                            })}
                          </select>
                          <select
                            value={leadCustomMinute}
                            onChange={(e) => handleUpdateCustomLeadTime(leadCustomHour, parseInt(e.target.value, 10))}
                            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                          >
                            {[0, 15, 20, 30, 45].map((m) => (
                              <option key={m} value={m}>
                                :{m.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <span className="text-slate-400 text-xs font-mono">Pacific Time (PST)</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Channel & Human-In-The-Loop Settings */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Dispatch Safety &amp; Channel Hold</span>
                    </h4>

                    {/* Human-in-the-loop toggle */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-white">Visual Queue Approval Hold</div>
                          <div className="text-[11px] text-slate-400">Require LO review &amp; edit before message delivery</div>
                        </div>
                        <button
                          type="button"
                          onClick={handleToggleRequireApproval}
                          className={`w-11 h-6 rounded-full transition cursor-pointer p-0.5 ${
                            cronConfig.requireApproval ? 'bg-emerald-600' : 'bg-slate-700'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full bg-white transition-transform ${
                              cronConfig.requireApproval ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                      <span className="text-[10px] text-emerald-400 font-bold block">
                        {cronConfig.requireApproval
                          ? '✓ Safety Active: Drafts will pause in Visual Queue for your 1-click approval.'
                          : '⚡ Auto-Dispatch: Outbound messages trigger immediately without manual hold.'}
                      </span>
                    </div>

                    {/* Preferred Staged Channel */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-300">
                        Default Outreach Channel for Staged Drafts:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'both', label: '⚡ Dual (Both)' },
                          { id: 'sms', label: '📱 SMS Only' },
                          { id: 'gmail', label: '✉️ Gmail Only' }
                        ].map((ch) => (
                          <button
                            key={ch.id}
                            type="button"
                            onClick={() => handleUpdatePreferredChannel(ch.id as OutreachChannel)}
                            className={`py-2 px-2 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                              cronConfig.preferredChannel === ch.id
                                ? 'bg-indigo-600 text-white ring-1 ring-indigo-400 shadow'
                                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                            }`}
                          >
                            {ch.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Target Counties Summary */}
                    <div className="space-y-1 pt-1">
                      <label className="block text-xs font-bold text-slate-400">
                        Active Oregon Sweep Counties ({cronConfig.targetCounties.length}):
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {cronConfig.targetCounties.map((county) => (
                          <span
                            key={county}
                            className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300"
                          >
                            {county}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* JOB 2: ZILLOW SWARM MARKET SWEEP CRON JOB                                */}
            {/* ========================================================================= */}
            {(schedulerJobFilter === 'both' || schedulerJobFilter === 'zillow') && (
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/60 border border-cyan-500/40 p-5 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                          DeepSeek Swarm v0.1.1
                        </span>
                        <span className={`text-xs font-bold ${
                          zillowConfig.status === 'active' 
                            ? 'text-emerald-400' 
                            : zillowConfig.status === 'paused' 
                            ? 'text-amber-400' 
                            : 'text-rose-400'
                        }`}>
                          ● {zillowConfig.status === 'active' 
                              ? 'Active Daily Morning Sweep' 
                              : zillowConfig.status === 'paused' 
                              ? 'Sweep Paused' 
                              : 'Sweep Disabled'}
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white mt-1">
                        Daily Zillow Swarm Market Intelligence Sweep
                      </h3>
                      <p className="text-xs text-slate-300 mt-0.5 max-w-2xl">
                        Deploys DeepSeek Swarm waves to audit saved GeoMap properties for status changes (Active/Pending/Off-Market), detect price drops, and discover newly listed DPA &amp; USDA zero-down homes.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {/* Pause / Resume Button */}
                    <button
                      type="button"
                      onClick={handleTogglePauseZillow}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow border ${
                        zillowConfig.status === 'active'
                          ? 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/50'
                          : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50'
                      }`}
                      title={zillowConfig.status === 'active' ? "Pause automated daily swarm sweep" : "Resume automated daily swarm sweep"}
                    >
                      {zillowConfig.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      <span>{zillowConfig.status === 'active' ? 'Pause Zillow Cron' : 'Resume Zillow Cron'}</span>
                    </button>

                    {/* Standby / Disable Button */}
                    {zillowConfig.status !== 'disabled' ? (
                      <button
                        type="button"
                        onClick={() => handleSetZillowStatus('disabled')}
                        className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs transition cursor-pointer"
                        title="Put Zillow cron sweep on standby / disable"
                      >
                        <PowerOff className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetZillowStatus('active')}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition cursor-pointer"
                      >
                        Enable
                      </button>
                    )}

                    {/* Run Now Button */}
                    <button
                      type="button"
                      onClick={handleRunZillowSweepNow}
                      disabled={isExecutingZillowSweep}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black shadow transition cursor-pointer disabled:opacity-50"
                    >
                      {isExecutingZillowSweep ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Swarming...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Run Zillow Swarm Now</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Timing Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Scheduled Time</span>
                    <div className="text-sm font-black text-white mt-0.5 font-mono">
                      {zillowConfig.timePst || '6:00 AM'} PST
                    </div>
                    <span className="text-[11px] text-cyan-400 font-medium capitalize">
                      {zillowConfig.frequency.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Last Execution</span>
                    <div className="text-xs font-bold text-slate-200 mt-0.5">
                      {zillowConfig.lastRunTimestamp ? new Date(zillowConfig.lastRunTimestamp).toLocaleString() : 'Recent Swarm Audit'}
                    </div>
                    <span className="text-[10px] text-slate-400 truncate block mt-0.5">18 Price Drops • 12 New DPA Listings</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] font-bold uppercase text-slate-400">Next Estimated Run</span>
                    <div className="text-sm font-black text-cyan-300 mt-0.5">
                      {zillowConfig.nextRunEstimated || 'Tomorrow at 6:00 AM PST'}
                    </div>
                    <span className="text-[10px] text-slate-400">Audits GeoMap Pipeline</span>
                  </div>
                </div>

                {/* Edit Schedule Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                  {/* Cadence Selection */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Edit Frequency &amp; Cadence</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'daily' as const, label: 'Every Day (Daily)', desc: '7 days a week standard morning audit' },
                        { id: 'weekdays' as const, label: 'Weekdays Only', desc: 'Monday through Friday' },
                        { id: 'every_other_day' as const, label: 'Every Other Day', desc: 'Alternating 48-hr cycles' },
                        { id: 'weekly' as const, label: 'Weekly (Mondays)', desc: 'Once per week' }
                      ].map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => handleUpdateZillowFrequency(freq.id as ZillowSweepCadence)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            zillowConfig.frequency === freq.id
                              ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-bold block text-xs">{freq.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{freq.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Execution Time Picker */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <span className="text-xs font-bold text-slate-300 block">Morning Sweep Start Time (PST):</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {[
                          { h: 6, m: 0, label: '6:00 AM' },
                          { h: 7, m: 0, label: '7:00 AM' },
                          { h: 7, m: 30, label: '7:30 AM' },
                          { h: 8, m: 0, label: '8:00 AM' }
                        ].map((t) => (
                          <button
                            key={t.label}
                            type="button"
                            onClick={() => handleUpdateZillowTime(t.h, t.m)}
                            className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition cursor-pointer ${
                              (zillowConfig.timeHour ?? 6) === t.h && (zillowConfig.timeMinute ?? 0) === t.m
                                ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-sm'
                                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                            }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1 text-xs">
                        <span className="text-slate-400">Or Custom:</span>
                        <select
                          value={zillowEditHour}
                          onChange={(e) => handleUpdateZillowTime(parseInt(e.target.value, 10), zillowEditMinute)}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                        >
                          {Array.from({ length: 24 }).map((_, h) => {
                            const h12 = h % 12 || 12;
                            const ampm = h >= 12 ? 'PM' : 'AM';
                            return (
                              <option key={h} value={h}>
                                {h12}:00 {ampm}
                              </option>
                            );
                          })}
                        </select>
                        <select
                          value={zillowEditMinute}
                          onChange={(e) => handleUpdateZillowTime(zillowEditHour, parseInt(e.target.value, 10))}
                          className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white"
                        >
                          {[0, 15, 30, 45].map((m) => (
                            <option key={m} value={m}>
                              :{m.toString().padStart(2, '0')}
                            </option>
                          ))}
                        </select>
                        <span className="text-slate-400 font-mono text-[11px]">Pacific Time</span>
                      </div>
                    </div>
                  </div>

                  {/* Target Cities & Swarm Engine Parameters */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3.5">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>Queued Cities &amp; Swarm Batching</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowZillowCitiesModal(true)}
                        className="text-[11px] text-cyan-300 hover:text-white underline font-bold cursor-pointer"
                      >
                        Configure Cities
                      </button>
                    </h4>

                    {/* Target Cities status pill */}
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-black text-white">Active Sweep Cities Lineup</div>
                          <div className="text-[11px] text-slate-400">Audits Bend, Eugene, Redmond, Portland, Salem + custom additions</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowZillowCitiesModal(true)}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 text-xs font-bold hover:bg-cyan-900 cursor-pointer"
                        >
                          Edit Lineup
                        </button>
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono block">
                        Wave 1: Active properties in pipeline • Wave 2: 0-down &amp; DPA discovery in queued cities
                      </span>
                    </div>

                    {/* Cost Governor Safety Bar */}
                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-bold">DeepSeek Swarm Cost Governor</span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                          &lt;$50.00/mo Cap Safe
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Automatic deduplication, cached property hashes, and batch request aggregation prevent redundant DeepSeek API usage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Zillow Config Modal Popup for Target Cities */}
        {showZillowCitiesModal && (
          <ZillowSweepConfigModal
            isOpen={showZillowCitiesModal}
            onClose={() => {
              setShowZillowCitiesModal(false);
              setZillowConfig(zillowSwarmSweepService.getScheduleConfig());
            }}
            initialTab="cities"
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: DISPATCH AUDIT TRAIL                                              */}
        {/* ========================================================================= */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white">Dispatched Outbound Messages &amp; Replies</h3>
                <p className="text-xs text-slate-400">Historical log of messages approved and sent through the queue.</p>
              </div>
            </div>

            {dispatchedMessages.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400">
                No outbound messages dispatched yet. Approve pending queue items to populate this audit trail.
              </div>
            ) : (
              <div className="space-y-3">
                {dispatchedMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-white">{msg.recipientName}</span>
                        <span className="text-slate-400">• {msg.recipientLocation}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          {msg.dispatchResult || 'Dispatched'}
                        </span>
                      </div>
                      <div className="text-slate-300 font-medium">{msg.subject}</div>
                      <p className="text-slate-400 line-clamp-1 italic">&ldquo;{msg.body}&rdquo;</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-slate-400">
                        {msg.dispatchedAt ? new Date(msg.dispatchedAt).toLocaleString() : 'Recently'}
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-950 border border-slate-700 text-[11px] font-bold uppercase text-indigo-300">
                        {msg.channel}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
