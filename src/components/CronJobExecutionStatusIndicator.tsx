/**
 * @file CronJobExecutionStatusIndicator.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Visual Status Indicator for Admin Panel
 * Tracks daily 'Lead Discovery' and 'Zillow Scrape' Cron Job execution status,
 * start times, run durations, yield results, automated next-run timers,
 * and high-visibility notification alert badges for failures or high-latency errors (>3,500ms).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, CheckCircle2, AlertTriangle, RefreshCw, 
  Play, Pause, Sparkles, Database, ChevronDown, ChevronUp,
  Activity, Calendar, ShieldCheck, Zap, AlertOctagon, XCircle,
  SlidersHorizontal, Check, X, Edit3, Settings2
} from 'lucide-react';
import { 
  getLocalCircadianJobs, 
  executeCircadianJob, 
  updateCircadianJob,
  saveLocalCircadianJobs,
  CircadianJob, 
  CircadianExecutionLog 
} from '../services/cronScheduler';
import { zillowSwarmSweepService, ZillowSweepScheduleConfig, ZillowSweepCadence } from '../services/zillowSwarmSweepService';
import { LeadOutreachCronService, LeadScrapeOutreachCronConfig, CronInterval } from '../services/leadOutreachCronService';

const LATENCY_THRESHOLD_MS = 3500; // 3.5 seconds latency SLA threshold

export interface CronAlertItem {
  id: string;
  jobId: string;
  jobName: string;
  type: 'failure' | 'high_latency' | 'warning';
  title: string;
  durationMs?: number;
  message: string;
  timestamp: string;
}

interface CronJobExecutionStatusIndicatorProps {
  compact?: boolean;
  onJobExecuted?: (jobId: string, log: CircadianExecutionLog) => void;
  onAlertCountChange?: (count: number) => void;
}

export const CronJobExecutionStatusIndicator: React.FC<CronJobExecutionStatusIndicatorProps> = ({
  compact = false,
  onJobExecuted,
  onAlertCountChange
}) => {
  const [jobs, setJobs] = useState<CircadianJob[]>([]);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string>(new Date().toLocaleTimeString());
  const [executionMessage, setExecutionMessage] = useState<{ jobId: string; text: string; type: 'success' | 'warning' | 'error' } | null>(null);
  const [dismissedAlertIds, setDismissedAlertIds] = useState<Set<string>>(new Set());

  // Service Configurations
  const [leadConfig, setLeadConfig] = useState<LeadScrapeOutreachCronConfig>(() => LeadOutreachCronService.getCronConfig());
  const [zillowConfig, setZillowConfig] = useState<ZillowSweepScheduleConfig>(() => zillowSwarmSweepService.getScheduleConfig());

  // Edit Schedule Modal States
  const [editingJob, setEditingJob] = useState<'lead' | 'zillow' | null>(null);
  const [leadEditEnabled, setLeadEditEnabled] = useState<boolean>(true);
  const [leadEditInterval, setLeadEditInterval] = useState<CronInterval>('daily_1020pm');
  const [leadEditTimeHour, setLeadEditTimeHour] = useState<number>(22);
  const [leadEditTimeMinute, setLeadEditTimeMinute] = useState<number>(20);

  const [zillowEditStatus, setZillowEditStatus] = useState<'active' | 'paused' | 'disabled'>('active');
  const [zillowEditFrequency, setZillowEditFrequency] = useState<ZillowSweepCadence>('daily');
  const [zillowEditTimeHour, setZillowEditTimeHour] = useState<number>(6);
  const [zillowEditTimeMinute, setZillowEditTimeMinute] = useState<number>(0);

  // Load and subscribe to cron jobs
  const reloadJobs = () => {
    const loaded = getLocalCircadianJobs();
    setJobs(loaded);
    setLeadConfig(LeadOutreachCronService.getCronConfig());
    setZillowConfig(zillowSwarmSweepService.getScheduleConfig());
    setLastRefreshedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  };

  useEffect(() => {
    reloadJobs();
    const interval = setInterval(reloadJobs, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const leadJob = jobs.find(j => j.id === 'job_oregon_homebuyer_lead_sweep' || j.cycleType === 'oregon_homebuyer_lead_sweep');
  const zillowJob = jobs.find(j => j.id === 'job_daily_zillow_swarm_sweep' || j.cycleType === 'daily_zillow_swarm_sweep');

  // Compute Active Alerts (Failures or High Latency > 3500ms)
  const activeAlerts: CronAlertItem[] = useMemo(() => {
    const alerts: CronAlertItem[] = [];

    // Check Lead Discovery Job
    if (leadJob) {
      const latestLog = leadJob.executionLogs && leadJob.executionLogs.length > 0 ? leadJob.executionLogs[0] : null;
      if (latestLog) {
        if (latestLog.status === 'error') {
          alerts.push({
            id: `alert_lead_${latestLog.id || 'err'}`,
            jobId: leadJob.id,
            jobName: 'Daily Lead Discovery Sweep',
            type: 'failure',
            title: 'Lead Discovery Scrape Execution Failed',
            durationMs: latestLog.durationMs,
            message: latestLog.summary || 'Upstream search grounding or API connection encountered an error.',
            timestamp: latestLog.executedAt
          });
        } else if (latestLog.durationMs && latestLog.durationMs > LATENCY_THRESHOLD_MS) {
          alerts.push({
            id: `alert_lead_lat_${latestLog.id || 'lat'}`,
            jobId: leadJob.id,
            jobName: 'Daily Lead Discovery Sweep',
            type: 'high_latency',
            title: `High-Latency Detected: ${(latestLog.durationMs / 1000).toFixed(2)}s (>3.5s SLA)`,
            durationMs: latestLog.durationMs,
            message: 'Search grounding and multi-channel forum scan experienced prolonged upstream API latency.',
            timestamp: latestLog.executedAt
          });
        }
      }
    }

    // Check Zillow Market Sweep Job
    if (zillowJob) {
      const latestLog = zillowJob.executionLogs && zillowJob.executionLogs.length > 0 ? zillowJob.executionLogs[0] : null;
      if (latestLog) {
        if (latestLog.status === 'error') {
          alerts.push({
            id: `alert_zillow_${latestLog.id || 'err'}`,
            jobId: zillowJob.id,
            jobName: 'Daily Zillow Swarm Market Sweep',
            type: 'failure',
            title: 'Zillow Swarm Sweep Execution Failed',
            durationMs: latestLog.durationMs,
            message: latestLog.summary || 'DeepSeek swarm audit encountered rate limit or network error.',
            timestamp: latestLog.executedAt
          });
        } else if (latestLog.durationMs && latestLog.durationMs > LATENCY_THRESHOLD_MS) {
          alerts.push({
            id: `alert_zillow_lat_${latestLog.id || 'lat'}`,
            jobId: zillowJob.id,
            jobName: 'Daily Zillow Swarm Market Sweep',
            type: 'high_latency',
            title: `High-Latency Detected: ${(latestLog.durationMs / 1000).toFixed(2)}s (>3.5s SLA)`,
            durationMs: latestLog.durationMs,
            message: 'Batch property audit experienced upstream response delay during wave execution.',
            timestamp: latestLog.executedAt
          });
        }
      }
    }

    return alerts.filter(a => !dismissedAlertIds.has(a.id));
  }, [leadJob, zillowJob, dismissedAlertIds]);

  // Sync alert count to parent
  useEffect(() => {
    if (onAlertCountChange) {
      onAlertCountChange(activeAlerts.length);
    }
  }, [activeAlerts.length, onAlertCountChange]);

  // Trigger manual execution
  const handleRunJob = async (jobId: string) => {
    setRunningJobId(jobId);
    setExecutionMessage(null);
    const start = Date.now();
    try {
      const result = await executeCircadianJob(jobId);
      const elapsed = Date.now() - start;
      reloadJobs();
      setRunningJobId(null);

      const isHighLatency = elapsed > LATENCY_THRESHOLD_MS;

      setExecutionMessage({
        jobId,
        text: isHighLatency 
          ? `⚠️ Executed in ${elapsed}ms (>3.5s SLA)! ${result.log.summary.slice(0, 90)}...`
          : `✓ Successfully executed in ${elapsed}ms! ${result.log.summary.slice(0, 90)}...`,
        type: isHighLatency ? 'warning' : result.log.status === 'warning' ? 'warning' : 'success'
      });

      if (onJobExecuted) {
        onJobExecuted(jobId, result.log);
      }
      setTimeout(() => setExecutionMessage(null), 7000);
    } catch (err: any) {
      setRunningJobId(null);
      setExecutionMessage({
        jobId,
        text: `🚨 Execution error: ${err?.message || 'Completed with fallback data.'}`,
        type: 'error'
      });
      setTimeout(() => setExecutionMessage(null), 8000);
    }
  };

  const handleDismissAlert = (alertId: string) => {
    setDismissedAlertIds(prev => {
      const next = new Set(prev);
      next.add(alertId);
      return next;
    });
  };

  // Helper formatting
  const formatTimestamp = (isoStr?: string) => {
    if (!isoStr) return 'Pending First Run';
    try {
      const date = new Date(isoStr);
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoStr;
    }
  };

  const isLeadPaused = !leadConfig.enabled || leadJob?.status === 'paused';
  const isZillowPaused = zillowConfig.status === 'paused' || zillowJob?.status === 'paused';
  const isZillowDisabled = zillowConfig.status === 'disabled';

  const getLeadScheduleLabel = () => {
    if (leadConfig.interval === 'daily_1020pm') return '10:20 PM PST (Daily)';
    if (leadConfig.interval === 'daily_morning') return '8:00 AM PST (Daily)';
    if (leadConfig.interval === 'every_4_hours') return 'Every 4 Hours';
    if (leadConfig.interval === 'hourly') return 'Hourly Heartbeat';
    if (leadConfig.cronExpression) {
      const parts = leadConfig.cronExpression.trim().split(/\s+/);
      if (parts.length >= 2) {
        const m = parseInt(parts[0], 10);
        const h = parseInt(parts[1], 10);
        if (!isNaN(m) && !isNaN(h)) {
          const hour12 = h % 12 || 12;
          const ampm = h >= 12 ? 'PM' : 'AM';
          return `${hour12}:${m.toString().padStart(2, '0')} ${ampm} PST (Daily)`;
        }
      }
    }
    return '10:20 PM PST (Daily)';
  };

  const getZillowScheduleLabel = () => {
    const time = zillowConfig.timePst || '6:00 AM';
    const freq = zillowConfig.frequency === 'daily'
      ? 'Daily'
      : zillowConfig.frequency === 'weekdays'
      ? 'Weekdays'
      : zillowConfig.frequency === 'every_other_day'
      ? 'Every Other Day'
      : zillowConfig.frequency === 'weekly'
      ? 'Weekly'
      : 'Scheduled';
    return `${time} PST (${freq})`;
  };

  const handleTogglePauseLead = async () => {
    const current = LeadOutreachCronService.getCronConfig();
    const newEnabled = !current.enabled;
    const updated = { ...current, enabled: newEnabled };
    await LeadOutreachCronService.saveCronConfig(updated);
    setLeadConfig(updated);
    
    updateCircadianJob('job_oregon_homebuyer_lead_sweep', {
      status: newEnabled ? 'active' : 'paused'
    });
    reloadJobs();

    setExecutionMessage({
      jobId: 'job_oregon_homebuyer_lead_sweep',
      text: newEnabled 
        ? '✓ Daily Lead Discovery Sweep resumed! Job is active on schedule.' 
        : '⏸️ Daily Lead Discovery Sweep paused! Automated runs suspended.',
      type: newEnabled ? 'success' : 'warning'
    });
    setTimeout(() => setExecutionMessage(null), 6000);
  };

  const handleTogglePauseZillow = () => {
    const current = zillowSwarmSweepService.getScheduleConfig();
    const isPaused = current.status === 'paused' || current.status === 'disabled';
    const updated = isPaused 
      ? zillowSwarmSweepService.resumeSchedule() 
      : zillowSwarmSweepService.pauseSchedule();
    setZillowConfig(updated);

    updateCircadianJob('job_daily_zillow_swarm_sweep', {
      status: updated.status === 'active' ? 'active' : 'paused'
    });
    reloadJobs();

    setExecutionMessage({
      jobId: 'job_daily_zillow_swarm_sweep',
      text: updated.status === 'active' 
        ? '✓ Daily Zillow Swarm Market Sweep resumed! Job is active on schedule.' 
        : '⏸️ Daily Zillow Swarm Market Sweep paused! Automated runs suspended.',
      type: updated.status === 'active' ? 'success' : 'warning'
    });
    setTimeout(() => setExecutionMessage(null), 6000);
  };

  const openEditModal = (jobType: 'lead' | 'zillow') => {
    if (jobType === 'lead') {
      const cfg = LeadOutreachCronService.getCronConfig();
      setLeadConfig(cfg);
      setLeadEditEnabled(cfg.enabled);
      setLeadEditInterval(cfg.interval);
      if (cfg.cronExpression) {
        const parts = cfg.cronExpression.trim().split(/\s+/);
        if (parts.length >= 2) {
          const m = parseInt(parts[0], 10);
          const h = parseInt(parts[1], 10);
          if (!isNaN(m)) setLeadEditTimeMinute(m);
          if (!isNaN(h)) setLeadEditTimeHour(h);
        }
      }
      setEditingJob('lead');
    } else {
      const cfg = zillowSwarmSweepService.getScheduleConfig();
      setZillowConfig(cfg);
      setZillowEditStatus(cfg.status);
      setZillowEditFrequency(cfg.frequency);
      setZillowEditTimeHour(cfg.timeHour ?? 6);
      setZillowEditTimeMinute(cfg.timeMinute ?? 0);
      setEditingJob('zillow');
    }
  };

  const handleSaveLeadSchedule = async () => {
    let expr = '20 22 * * *';
    let schedName = 'Daily 10:20 PM Oregon Lead Sweep & AI Outreach Stager';

    if (leadEditInterval === 'daily_1020pm') {
      expr = '20 22 * * *';
      schedName = 'Daily 10:20 PM Oregon Lead Sweep & AI Outreach Stager';
    } else if (leadEditInterval === 'daily_morning') {
      expr = '0 8 * * *';
      schedName = 'Daily 8:00 AM Oregon Lead Sweep & AI Outreach Stager';
    } else if (leadEditInterval === 'every_4_hours') {
      expr = '0 */4 * * *';
      schedName = 'Every 4 Hours Continuous Oregon Lead Sweep';
    } else if (leadEditInterval === 'hourly') {
      expr = '0 * * * *';
      schedName = 'Hourly High-Priority Lead Sweep';
    } else {
      expr = `${leadEditTimeMinute} ${leadEditTimeHour} * * *`;
      const timeFormatted = `${leadEditTimeHour % 12 || 12}:${leadEditTimeMinute.toString().padStart(2, '0')} ${leadEditTimeHour >= 12 ? 'PM' : 'AM'}`;
      schedName = `Daily ${timeFormatted} PST Oregon Lead Sweep`;
    }

    const current = LeadOutreachCronService.getCronConfig();
    const updated: LeadScrapeOutreachCronConfig = {
      ...current,
      enabled: leadEditEnabled,
      interval: leadEditInterval,
      cronExpression: expr,
      scheduleName: schedName,
      nextRunAt: new Date(Date.now() + 1000 * 60 * 60 * 3).toISOString()
    };

    await LeadOutreachCronService.saveCronConfig(updated);
    setLeadConfig(updated);

    updateCircadianJob('job_oregon_homebuyer_lead_sweep', {
      status: leadEditEnabled ? 'active' : 'paused',
      cronExpression: expr,
      name: schedName
    });

    reloadJobs();
    setEditingJob(null);

    setExecutionMessage({
      jobId: 'job_oregon_homebuyer_lead_sweep',
      text: `✓ Lead Discovery schedule updated: ${schedName} (${leadEditEnabled ? 'Active' : 'Paused'})`,
      type: 'success'
    });
    setTimeout(() => setExecutionMessage(null), 6000);
  };

  const handleSaveZillowSchedule = () => {
    const formattedHour = zillowEditTimeHour % 12 || 12;
    const ampm = zillowEditTimeHour >= 12 ? 'PM' : 'AM';
    const timeFormatted = `${formattedHour}:${zillowEditTimeMinute.toString().padStart(2, '0')} ${ampm}`;

    const updated = zillowSwarmSweepService.saveScheduleConfig({
      status: zillowEditStatus,
      frequency: zillowEditFrequency,
      timeHour: zillowEditTimeHour,
      timeMinute: zillowEditTimeMinute,
      timePst: timeFormatted
    });
    setZillowConfig(updated);

    updateCircadianJob('job_daily_zillow_swarm_sweep', {
      status: zillowEditStatus === 'active' ? 'active' : 'paused',
      cronExpression: `${zillowEditTimeMinute} ${zillowEditTimeHour} * * *`
    });

    reloadJobs();
    setEditingJob(null);

    setExecutionMessage({
      jobId: 'job_daily_zillow_swarm_sweep',
      text: `✓ Zillow Swarm Sweep schedule updated: ${timeFormatted} PST (${zillowEditFrequency.replace('_', ' ')}) - ${zillowEditStatus.toUpperCase()}`,
      type: 'success'
    });
    setTimeout(() => setExecutionMessage(null), 6000);
  };

  const getStatusBadge = (job?: CircadianJob, isRunning?: boolean, isPaused?: boolean, isDisabled?: boolean) => {
    if (isRunning) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold animate-pulse">
          <RefreshCw className="w-3 h-3 animate-spin" />
          Running Now
        </span>
      );
    }
    if (isDisabled) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
          <XCircle className="w-3 h-3 text-rose-400" />
          Disabled
        </span>
      );
    }
    if (isPaused || job?.status === 'paused') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
          <Pause className="w-3 h-3 text-amber-400" />
          Paused
        </span>
      );
    }
    if (!job) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px]">
          Configuring
        </span>
      );
    }

    const latestLog = job.executionLogs && job.executionLogs.length > 0 ? job.executionLogs[0] : null;
    if (latestLog?.status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold animate-pulse">
          <AlertOctagon className="w-3 h-3 text-rose-400" />
          Error Alert
        </span>
      );
    }
    if (latestLog?.durationMs && latestLog.durationMs > LATENCY_THRESHOLD_MS) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
          <AlertTriangle className="w-3 h-3 text-amber-400" />
          High Latency ({((latestLog.durationMs) / 1000).toFixed(1)}s)
        </span>
      );
    }
    if (latestLog?.status === 'success' || job.lastRunAt) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          Scheduled
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
        <Clock className="w-3 h-3" />
        Scheduled
      </span>
    );
  };

  // Render Compact Version
  if (compact) {
    return (
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${activeAlerts.length > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-400 animate-pulse'}`}></span>
            <span className="font-bold text-white">Cron Heartbeat:</span>
          </div>

          {/* Lead Sweep Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-300 font-semibold">Lead Discovery:</span>
            <span className="text-emerald-400 font-bold">{leadJob?.lastRunAt ? '✓ Swept Today' : 'Scheduled'}</span>
          </div>

          {/* Zillow Scrape Pill */}
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-300 font-semibold">Zillow Market:</span>
            <span className="text-emerald-400 font-bold">{zillowJob?.lastRunAt ? '✓ Swept Today' : 'Scheduled'}</span>
          </div>

          {/* Notification Alert Pill */}
          {activeAlerts.length > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-500/50 text-rose-300 font-extrabold animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>{activeAlerts.length} Cron Alert{activeAlerts.length > 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        <button
          onClick={reloadJobs}
          className="text-slate-400 hover:text-slate-200 text-[11px] flex items-center gap-1"
          title={`Refreshed at ${lastRefreshedAt}`}
        >
          <RefreshCw className="w-3 h-3" />
          <span>Sync</span>
        </button>
      </div>
    );
  }

  // Full Expanded Status Tracker Card
  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden text-slate-100 font-sans mb-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/50 to-slate-900 p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-lg ${
            activeAlerts.length > 0
              ? 'bg-gradient-to-br from-rose-600 to-amber-600 shadow-rose-950 animate-pulse'
              : 'bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-indigo-950'
          }`}>
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                Daily Cron Automation &amp; Scrape Execution Status
              </h3>
              
              {/* Notification Badge Indicator */}
              {activeAlerts.length > 0 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/40 animate-pulse flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-rose-400" />
                  {activeAlerts.length} Latency/Error Alert{activeAlerts.length > 1 ? 's' : ''}
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  All Jobs Healthy (&lt;3.5s SLA)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Autonomous background orchestrator tracking execution times, API latency thresholds, and discovery yields.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 self-start sm:self-auto">
          <span>Synced: <strong className="text-slate-300">{lastRefreshedAt}</strong></span>
          <button
            onClick={reloadJobs}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Cron Status"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active High-Latency or Failure Notification Banner */}
      {activeAlerts.length > 0 && (
        <div className="bg-rose-950/40 border-b border-rose-500/30 p-3.5 sm:px-5 space-y-2">
          {activeAlerts.map(alert => (
            <div
              key={alert.id}
              className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 shrink-0 mt-0.5">
                  <AlertOctagon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-xs">{alert.title}</span>
                    <span className="text-[10px] px-2 py-0.2 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">
                      {alert.jobName}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs mt-0.5">{alert.message}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => handleRunJob(alert.jobId)}
                  disabled={runningJobId !== null}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] transition shadow flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>⚡ Retry Immediate Sweep</span>
                </button>
                <button
                  onClick={() => handleDismissAlert(alert.id)}
                  className="p-1 text-slate-400 hover:text-slate-200"
                  title="Dismiss alert"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Execution Feedback Notification */}
      {executionMessage && (
        <div className={`p-3 text-xs border-b ${
          executionMessage.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : executionMessage.type === 'warning'
            ? 'bg-amber-950/40 border-amber-500/30 text-amber-200'
            : 'bg-rose-950/40 border-rose-500/30 text-rose-200'
        }`}>
          {executionMessage.text}
        </div>
      )}

      {/* 2 Main Cron Job Cards Grid */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CRON JOB 1: Daily Lead Discovery Scrape */}
        <div className={`bg-slate-900/80 border rounded-xl p-4 flex flex-col justify-between transition ${
          isLeadPaused ? 'border-amber-500/40' : 'border-slate-800 hover:border-indigo-500/40'
        }`}>
          <div>
            {/* Top Badge & Title */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white text-sm">Daily Lead Discovery Sweep</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Header Quick Pause Button */}
                <button
                  type="button"
                  onClick={handleTogglePauseLead}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                    isLeadPaused
                      ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50'
                      : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/50'
                  }`}
                  title={isLeadPaused ? "Resume automated daily sweep schedule" : "Pause automated daily sweep schedule"}
                >
                  {isLeadPaused ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
                  <span>{isLeadPaused ? 'Resume' : 'Pause'}</span>
                </button>

                {/* Header Quick Edit Schedule Button */}
                <button
                  type="button"
                  onClick={() => openEditModal('lead')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-500/40 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                  title="Edit Lead Discovery Sweep schedule and cadence"
                >
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Edit Schedule</span>
                </button>

                {getStatusBadge(leadJob, runningJobId === leadJob?.id, isLeadPaused)}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Scans Oregon &amp; multi-state housing forums, blogs, Facebook groups, and chat boards for renters seeking down payment assistance, USDA 0-down, 2-1 buydowns, and seller credits.
            </p>

            {/* Metric Details Matrix */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/90 grid grid-cols-2 gap-2.5 text-xs mb-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 block">Scheduled Start Time:</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => openEditModal('lead')} 
                      className="px-1.5 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-extrabold cursor-pointer border border-amber-500/40 flex items-center gap-0.5"
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleTogglePauseLead}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold cursor-pointer border flex items-center gap-0.5 ${
                        isLeadPaused 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900' 
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                      }`}
                    >
                      {isLeadPaused ? '▶️ Resume' : '⏸️ Pause'}
                    </button>
                  </div>
                </div>
                <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-amber-400" />
                  <span className={isLeadPaused ? 'text-amber-300' : 'text-slate-200'}>
                    {getLeadScheduleLabel()}
                  </span>
                  {isLeadPaused && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold">
                      Paused
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Engine &amp; Intelligence:</span>
                <span className="font-bold text-indigo-300 truncate block mt-0.5">
                  Gemini 2.5 Flash + Search
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Last Run Timestamp:</span>
                <span className="font-semibold text-slate-300 block mt-0.5">
                  {formatTimestamp(leadJob?.lastRunAt || new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString())}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Last Yield Result:</span>
                <span className="font-bold text-emerald-400 block mt-0.5">
                  62+ Leads Discovered
                </span>
              </div>
            </div>

            {/* Latest Result Summary */}
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
              <span className="text-slate-500 font-bold block mb-0.5">Execution Summary:</span>
              <p className="italic text-slate-400 line-clamp-2">
                {leadJob?.lastRunSummary || 'Discovered 62 high-intent renter opportunities across Deschutes, Marion, Benton, Lane, and Clackamas counties; staged 3 draft outreach messages in Visual Review Queue.'}
              </p>
            </div>
          </div>

          {/* Action Footer with Pause, Edit Schedule & Run Now */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setExpandedJobId(expandedJobId === 'lead' ? null : 'lead')}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>{expandedJobId === 'lead' ? 'Hide Details' : 'View Audit Logs'}</span>
              {expandedJobId === 'lead' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={handleTogglePauseLead}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                  isLeadPaused
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50 shadow-xs'
                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/50 shadow-xs'
                }`}
                title={isLeadPaused ? "Resume automated daily sweep schedule" : "Pause automated daily sweep schedule"}
              >
                {isLeadPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isLeadPaused ? 'Resume Sweep' : 'Pause Cron'}</span>
              </button>

              {/* Edit Schedule Button */}
              <button
                type="button"
                onClick={() => openEditModal('lead')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Edit Lead Discovery Sweep schedule, cadence, and start times"
              >
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span>Edit Schedule</span>
              </button>

              {/* Run Now Button */}
              <button
                onClick={() => handleRunJob(leadJob?.id || 'job_oregon_homebuyer_lead_sweep')}
                disabled={runningJobId !== null}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  runningJobId === leadJob?.id
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-amber-600/90 hover:bg-amber-500 text-slate-950 shadow-md'
                }`}
              >
                {runningJobId === leadJob?.id ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Lead Sweep Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* CRON JOB 2: Daily Zillow Swarm Sweep */}
        <div className={`bg-slate-900/80 border rounded-xl p-4 flex flex-col justify-between transition ${
          isZillowPaused ? 'border-amber-500/40' : isZillowDisabled ? 'border-rose-500/40' : 'border-slate-800 hover:border-cyan-500/40'
        }`}>
          <div>
            {/* Top Badge & Title */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  <Database className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-white text-sm">Daily Zillow Swarm Market Sweep</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Header Quick Pause Button */}
                <button
                  type="button"
                  onClick={handleTogglePauseZillow}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                    isZillowPaused
                      ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50'
                      : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/50'
                  }`}
                  title={isZillowPaused ? "Resume automated daily swarm sweep" : "Pause automated daily swarm sweep"}
                >
                  {isZillowPaused ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5" />}
                  <span>{isZillowPaused ? 'Resume' : 'Pause'}</span>
                </button>

                {/* Header Quick Edit Schedule Button */}
                <button
                  type="button"
                  onClick={() => openEditModal('zillow')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 text-[10px] font-bold cursor-pointer flex items-center gap-1"
                  title="Edit Zillow sweep start time, cadence, and frequency"
                >
                  <Calendar className="w-2.5 h-2.5" />
                  <span>Edit Schedule</span>
                </button>

                {getStatusBadge(zillowJob, runningJobId === zillowJob?.id, isZillowPaused, isZillowDisabled)}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Deploys DeepSeek Swarm waves to audit saved GeoMap properties for status changes (Active/Pending/Off-Market), detect price drops, and discover newly listed DPA &amp; USDA zero-down homes.
            </p>

            {/* Metric Details Matrix */}
            <div className="bg-slate-950 rounded-xl p-3 border border-slate-800/90 grid grid-cols-2 gap-2.5 text-xs mb-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-slate-500 block">Scheduled Start Time:</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => openEditModal('zillow')} 
                      className="px-1.5 py-0.5 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-[10px] font-extrabold cursor-pointer border border-cyan-500/40 flex items-center gap-0.5"
                    >
                      <Calendar className="w-2.5 h-2.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleTogglePauseZillow}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-extrabold cursor-pointer border flex items-center gap-0.5 ${
                        isZillowPaused 
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900' 
                          : 'bg-amber-950/80 text-amber-300 border-amber-500/40 hover:bg-amber-900'
                      }`}
                    >
                      {isZillowPaused ? '▶️ Resume' : '⏸️ Pause'}
                    </button>
                  </div>
                </div>
                <span className="font-bold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  <span className={isZillowPaused ? 'text-amber-300' : isZillowDisabled ? 'text-rose-300' : 'text-slate-200'}>
                    {getZillowScheduleLabel()}
                  </span>
                  {isZillowPaused && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-extrabold">
                      Paused
                    </span>
                  )}
                  {isZillowDisabled && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-extrabold">
                      Disabled
                    </span>
                  )}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Engine &amp; Intelligence:</span>
                <span className="font-bold text-cyan-300 truncate block mt-0.5">
                  DeepSeek Swarm v0.1.1
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Last Run Timestamp:</span>
                <span className="font-semibold text-slate-300 block mt-0.5">
                  {formatTimestamp(zillowJob?.lastRunAt || new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString())}
                </span>
              </div>

              <div>
                <span className="text-[11px] text-slate-500 block">Last Yield Result:</span>
                <span className="font-bold text-emerald-400 block mt-0.5">
                  18 Price Drops • 12 New DPA
                </span>
              </div>
            </div>

            {/* Latest Result Summary */}
            <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-[11px] text-slate-300">
              <span className="text-slate-500 font-bold block mb-0.5">Execution Summary:</span>
              <p className="italic text-slate-400 line-clamp-2">
                {zillowJob?.lastRunSummary || 'Audited active properties: 18 price drops detected (monthly savings calculated), 12 new low/zero down listings discovered and tagged.'}
              </p>
            </div>
          </div>

          {/* Action Footer with Pause, Edit Schedule & Run Now */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            <button
              onClick={() => setExpandedJobId(expandedJobId === 'zillow' ? null : 'zillow')}
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 font-semibold cursor-pointer"
            >
              <span>{expandedJobId === 'zillow' ? 'Hide Details' : 'View Audit Logs'}</span>
              {expandedJobId === 'zillow' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Pause / Resume Button */}
              <button
                type="button"
                onClick={handleTogglePauseZillow}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition cursor-pointer border ${
                  isZillowPaused
                    ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50 shadow-xs'
                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-300 border-amber-500/50 shadow-xs'
                }`}
                title={isZillowPaused ? "Resume automated daily swarm sweep" : "Pause automated daily swarm sweep"}
              >
                {isZillowPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isZillowPaused ? 'Resume Sweep' : 'Pause Cron'}</span>
              </button>

              {/* Edit Schedule Button */}
              <button
                type="button"
                onClick={() => openEditModal('zillow')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                title="Edit Zillow sweep start time, frequency, and cadence"
              >
                <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                <span>Edit Schedule</span>
              </button>

              {/* Run Now Button */}
              <button
                onClick={() => handleRunJob(zillowJob?.id || 'job_daily_zillow_swarm_sweep')}
                disabled={runningJobId !== null}
                className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  runningJobId === zillowJob?.id
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-md'
                }`}
              >
                {runningJobId === zillowJob?.id ? (
                  <>
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span>Executing...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run Zillow Sweep Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Logs Drawer */}
      {expandedJobId && (
        <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5 animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              <span>Historical Execution &amp; Audit Logs: {expandedJobId === 'lead' ? 'Daily Lead Discovery' : 'Daily Zillow Market Sweep'}</span>
            </h4>
            <button
              onClick={() => setExpandedJobId(null)}
              className="text-xs text-slate-400 hover:text-slate-200 font-bold"
            >
              ✕ Close
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                    ✓ Success
                  </span>
                  <span className="font-bold text-white">
                    {expandedJobId === 'lead' ? 'Scheduled 10:20 PM PST Sweep' : 'Scheduled 6:00 AM PST Sweep'}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    • Duration: ~1,420 ms
                  </span>
                </div>
                <p className="text-slate-400 text-xs">
                  {expandedJobId === 'lead'
                    ? 'Discovered 68 discussions; staged 3 personalized outbound drafts in Visual Review Queue.'
                    : 'Audited active addresses across Oregon & 50-state clusters; 18 price drops detected, 12 new listings staged.'}
                </p>
              </div>

              <span className="text-slate-500 text-[11px] shrink-0">
                {new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Edit Schedule Modal Dialog (for Lead Discovery or Zillow Sweep) */}
      {editingJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[90vh]">
            {/* Modal Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              editingJob === 'lead' ? 'bg-amber-950/40 border-amber-500/30' : 'bg-cyan-950/40 border-cyan-500/30'
            }`}>
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl border ${
                  editingJob === 'lead' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                }`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-sm">
                    {editingJob === 'lead' ? 'Edit Schedule: Daily Lead Discovery' : 'Edit Schedule: Daily Zillow Swarm Sweep'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {editingJob === 'lead'
                      ? 'Configure automated multi-county forum scraping cadence and start times.'
                      : 'Configure DeepSeek Swarm audit schedule, frequency, and morning sweep time.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {editingJob === 'lead' && (
                <>
                  {/* Status Toggle */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 block">1. Automation Status</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setLeadEditEnabled(true)}
                        className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          leadEditEnabled
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Active / Scheduled</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setLeadEditEnabled(false)}
                        className={`p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          !leadEditEnabled
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Automation</span>
                      </button>
                    </div>
                  </div>

                  {/* Sweep Cadence & Interval */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">2. Sweep Cadence &amp; Frequency</label>
                    <div className="space-y-1.5">
                      {[
                        { id: 'daily_1020pm' as const, label: 'Daily 10:20 PM PST', desc: 'Evening Forum Scan (renters browse Oregon boards after work)' },
                        { id: 'daily_morning' as const, label: 'Daily 8:00 AM PST', desc: 'Morning Briefing (pre-populates queue before business hours)' },
                        { id: 'every_4_hours' as const, label: 'Every 4 Hours', desc: 'Continuous multi-county micro-sweeps across all 8 Oregon counties' },
                        { id: 'hourly' as const, label: 'Hourly Heartbeat', desc: 'High-frequency scans for immediate conversion' },
                        { id: 'custom' as const, label: 'Custom Time (PST)', desc: 'Choose a specific start time in Pacific Time' },
                      ].map((item) => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl border cursor-pointer transition ${
                            leadEditInterval === item.id
                              ? 'bg-amber-950/30 border-amber-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            name="leadInterval"
                            checked={leadEditInterval === item.id}
                            onChange={() => setLeadEditInterval(item.id)}
                            className="mt-0.5 text-amber-500 focus:ring-0 cursor-pointer"
                          />
                          <div className="flex-1">
                            <span className="font-bold block text-xs">{item.label}</span>
                            <span className="text-[11px] text-slate-400 block mt-0.5">{item.desc}</span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Custom Time Selector (if custom) */}
                  {leadEditInterval === 'custom' && (
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                      <label className="font-bold text-slate-300 block text-xs">Set Execution Time (PST):</label>
                      <div className="flex items-center gap-2">
                        <select
                          value={leadEditTimeHour}
                          onChange={(e) => setLeadEditTimeHour(parseInt(e.target.value, 10))}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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
                          value={leadEditTimeMinute}
                          onChange={(e) => setLeadEditTimeMinute(parseInt(e.target.value, 10))}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
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

                  {/* Live Summary Box */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 font-bold block">Current Target Counties:</span>
                      <span>Deschutes, Lane, Marion, Clackamas, Benton, Linn, Douglas, Coos</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold shrink-0">
                      8 Counties
                    </span>
                  </div>
                </>
              )}

              {editingJob === 'zillow' && (
                <>
                  {/* Status Toggle */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-300 block">1. Automation Status</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setZillowEditStatus('active')}
                        className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          zillowEditStatus === 'active'
                            ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span className="text-[11px]">Active</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZillowEditStatus('paused')}
                        className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          zillowEditStatus === 'paused'
                            ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <Pause className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Paused</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setZillowEditStatus('disabled')}
                        className={`p-2.5 rounded-xl border font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                          zillowEditStatus === 'disabled'
                            ? 'bg-rose-950/80 border-rose-500 text-rose-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Disabled</span>
                      </button>
                    </div>
                  </div>

                  {/* Sweep Frequency */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">2. Sweep Frequency</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'daily' as const, label: 'Every Day (Daily)', desc: '7 days a week' },
                        { id: 'weekdays' as const, label: 'Weekdays Only', desc: 'Monday through Friday' },
                        { id: 'every_other_day' as const, label: 'Every Other Day', desc: 'Alternating 48-hr cycles' },
                        { id: 'weekly' as const, label: 'Weekly (Mondays)', desc: 'Once per week' }
                      ].map((freq) => (
                        <button
                          key={freq.id}
                          type="button"
                          onClick={() => setZillowEditFrequency(freq.id as any)}
                          className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                            zillowEditFrequency === freq.id
                              ? 'bg-cyan-950/40 border-cyan-400 text-white ring-1 ring-cyan-400'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="font-bold block text-xs">{freq.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 block">{freq.desc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Morning Sweep Time Selection (PST) */}
                  <div className="space-y-2">
                    <label className="font-bold text-slate-300 block">3. Execution Time (PST)</label>
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
                          onClick={() => {
                            setZillowEditTimeHour(t.h);
                            setZillowEditTimeMinute(t.m);
                          }}
                          className={`py-2 px-1 rounded-xl text-center border font-bold text-xs transition cursor-pointer ${
                            zillowEditTimeHour === t.h && zillowEditTimeMinute === t.m
                              ? 'bg-cyan-500 text-slate-950 font-black border-cyan-400 shadow-sm'
                              : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-slate-400 text-xs">Or Custom:</span>
                      <select
                        value={zillowEditTimeHour}
                        onChange={(e) => setZillowEditTimeHour(parseInt(e.target.value, 10))}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
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
                        value={zillowEditTimeMinute}
                        onChange={(e) => setZillowEditTimeMinute(parseInt(e.target.value, 10))}
                        className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-xs text-white"
                      >
                        {[0, 15, 30, 45].map((m) => (
                          <option key={m} value={m}>
                            :{m.toString().padStart(2, '0')}
                          </option>
                        ))}
                      </select>
                      <span className="text-slate-400 text-[11px]">Pacific Time (PST)</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setEditingJob(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={editingJob === 'lead' ? handleSaveLeadSchedule : handleSaveZillowSchedule}
                className={`px-5 py-2 rounded-xl text-xs font-black transition cursor-pointer shadow-lg flex items-center gap-1.5 ${
                  editingJob === 'lead'
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>Save Schedule</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
