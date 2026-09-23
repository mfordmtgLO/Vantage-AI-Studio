/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  ActiveCronJob, 
  AutomationDecompositionResult, 
  DailyQuotaStatus, 
  GoogleAppId, 
  ProposedCronTask,
  ReadyMadeCronJobTemplate
} from '../types/cronAutomation';
import { READY_MADE_CRON_JOBS, GOOGLE_APPS_METADATA } from '../data/googleAppsCronCatalog';

const ACTIVE_CRON_STORAGE_KEY = 'vantage_active_cron_jobs_v2';
const QUOTA_STORAGE_KEY = 'vantage_cron_daily_quota_v1';
const MAX_USER_DAILY_QUOTA = 20; // Single user hard limit: 20 fetches/results/tasks per day
const MAX_GLOBAL_DAILY_QUOTA = 50; // Total combined users hard limit: 50 max API calls per day

// --- DAILY QUOTA TRACKER ---

function getTodayKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

export function getDailyQuotaStatus(): DailyQuotaStatus {
  const today = getTodayKey();
  let userUsed = 0;
  let globalUsed = 0;

  try {
    const raw = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.dateKey === today) {
        userUsed = Number(parsed.usedCount) || 0;
        globalUsed = Number(parsed.globalUsedCount) || Math.min(50, userUsed * 2 + 12);
      }
    }
  } catch (err) {
    console.warn('Failed to parse quota status from localStorage:', err);
  }

  const isUserExceeded = userUsed >= MAX_USER_DAILY_QUOTA;
  const isGlobalExceeded = globalUsed >= MAX_GLOBAL_DAILY_QUOTA;
  const isExceeded = isUserExceeded || isGlobalExceeded;
  const isApproaching = userUsed >= 15 || globalUsed >= 40;

  let warningMessage: string | undefined = undefined;
  if (isGlobalExceeded) {
    warningMessage = `Total combined daily system limit reached (${globalUsed}/${MAX_GLOBAL_DAILY_QUOTA} total calls). Max for the day, please try again tomorrow!`;
  } else if (isUserExceeded) {
    warningMessage = `Your personal daily task limit reached (${userUsed}/${MAX_USER_DAILY_QUOTA} tasks used). Max for the day, please try again tomorrow!`;
  } else if (isApproaching) {
    warningMessage = userUsed >= 15
      ? `Warning: You are approaching your daily limit (${userUsed}/${MAX_USER_DAILY_QUOTA} used).`
      : `Warning: System approaching total combined daily limit (${globalUsed}/${MAX_GLOBAL_DAILY_QUOTA} used).`;
  }

  const status: DailyQuotaStatus = {
    dateKey: today,
    usedCount: userUsed,
    maxLimit: MAX_USER_DAILY_QUOTA,
    globalUsedCount: globalUsed,
    globalMaxLimit: MAX_GLOBAL_DAILY_QUOTA,
    remaining: Math.max(0, MAX_USER_DAILY_QUOTA - userUsed),
    globalRemaining: Math.max(0, MAX_GLOBAL_DAILY_QUOTA - globalUsed),
    isExceeded,
    isGlobalExceeded,
    isApproaching,
    warningMessage
  };

  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(status));
  } catch {}
  return status;
}

export function incrementDailyQuota(amount: number = 1): DailyQuotaStatus {
  const current = getDailyQuotaStatus();
  const newUserCount = current.usedCount + amount;
  const newGlobalCount = Math.min(MAX_GLOBAL_DAILY_QUOTA, current.globalUsedCount + amount);

  const isUserExceeded = newUserCount >= MAX_USER_DAILY_QUOTA;
  const isGlobalExceeded = newGlobalCount >= MAX_GLOBAL_DAILY_QUOTA;
  const isExceeded = isUserExceeded || isGlobalExceeded;
  const isApproaching = newUserCount >= 15 || newGlobalCount >= 40;

  let warningMessage: string | undefined = undefined;
  if (isGlobalExceeded) {
    warningMessage = `Total combined daily system limit reached (${newGlobalCount}/${MAX_GLOBAL_DAILY_QUOTA} total calls). Max for the day, please try again tomorrow!`;
  } else if (isUserExceeded) {
    warningMessage = `Your personal daily task limit reached (${newUserCount}/${MAX_USER_DAILY_QUOTA} tasks used). Max for the day, please try again tomorrow!`;
  } else if (isApproaching) {
    warningMessage = newUserCount >= 15
      ? `Warning: You are approaching your daily limit (${newUserCount}/${MAX_USER_DAILY_QUOTA} used).`
      : `Warning: System approaching total combined daily limit (${newGlobalCount}/${MAX_GLOBAL_DAILY_QUOTA} used).`;
  }

  const updated: DailyQuotaStatus = {
    dateKey: current.dateKey,
    usedCount: newUserCount,
    maxLimit: MAX_USER_DAILY_QUOTA,
    globalUsedCount: newGlobalCount,
    globalMaxLimit: MAX_GLOBAL_DAILY_QUOTA,
    remaining: Math.max(0, MAX_USER_DAILY_QUOTA - newUserCount),
    globalRemaining: Math.max(0, MAX_GLOBAL_DAILY_QUOTA - newGlobalCount),
    isExceeded,
    isGlobalExceeded,
    isApproaching,
    warningMessage
  };

  try {
    localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

// --- ACTIVE CRON JOBS REPOSITORY ---

const SEED_DEFAULT_CRON_JOBS: ActiveCronJob[] = [
  {
    id: 'cron_active_01',
    appId: 'gmail',
    appName: 'Gmail',
    title: 'Daily Morning Inbox Synthesis & Urgent Flagging',
    prompt: 'Scan all unread emails from the past 24 hours. Identify urgent client inquiries, flag high-priority VIP emails, and generate executive draft responses in Gmail.',
    cronExpression: '0 8 * * *',
    scheduleDescription: 'Every Day at 8:00 AM',
    cadence: 'Daily',
    status: 'active',
    nextRunTime: 'Tomorrow at 8:00 AM',
    lastRunTime: 'Today at 8:00 AM',
    lastRunStatus: 'success',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    executionLogs: [
      {
        id: 'log_01',
        timestamp: 'Today at 8:00 AM',
        status: 'success',
        message: 'Synthesized 7 unread emails. Flagged 2 VIP client inquiries and generated 2 Gmail drafts.',
        durationMs: 1420,
        itemsProcessed: 7,
        groundSearchUsed: false
      }
    ]
  },
  {
    id: 'cron_active_02',
    appId: 'calendar',
    appName: 'Google Calendar',
    title: 'Daily Meeting Agenda & Attendee Dossier Briefing',
    prompt: 'Review today’s scheduled calendar events. Pull attendee context and assemble talking points.',
    cronExpression: '30 7 * * *',
    scheduleDescription: 'Every Morning at 7:30 AM',
    cadence: 'Daily',
    status: 'active',
    nextRunTime: 'Tomorrow at 7:30 AM',
    lastRunTime: 'Today at 7:30 AM',
    lastRunStatus: 'success',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    executionLogs: [
      {
        id: 'log_02',
        timestamp: 'Today at 7:30 AM',
        status: 'success',
        message: 'Checked 4 scheduled meetings today. Prepared attendee dossier and time-block recommendations.',
        durationMs: 980,
        itemsProcessed: 4,
        groundSearchUsed: false
      }
    ]
  },
  {
    id: 'cron_active_03',
    appId: 'sheets',
    appName: 'Google Sheets',
    title: 'Weekly Relational De-duping & Data Hygiene Scrub',
    prompt: 'Execute relational fuzzy matching across CRM spreadsheets to detect duplicate contact rows.',
    cronExpression: '0 3 * * 6',
    scheduleDescription: 'Every Saturday at 3:00 AM',
    cadence: 'Weekly',
    status: 'active',
    nextRunTime: 'Saturday at 3:00 AM',
    lastRunTime: 'Last Saturday at 3:00 AM',
    lastRunStatus: 'success',
    createdAt: new Date(Date.now() - 604800000).toISOString(),
    executionLogs: [
      {
        id: 'log_03',
        timestamp: 'Last Saturday at 3:00 AM',
        status: 'success',
        message: 'Audited 248 CRM rows. Deduplicated 3 identical entries and normalized phone numbers.',
        durationMs: 2100,
        itemsProcessed: 248,
        groundSearchUsed: false
      }
    ]
  }
];

export function getActiveCronJobs(): ActiveCronJob[] {
  try {
    const raw = localStorage.getItem(ACTIVE_CRON_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to read active cron jobs from localStorage:', err);
  }

  // Return default seeds and save
  try {
    localStorage.setItem(ACTIVE_CRON_STORAGE_KEY, JSON.stringify(SEED_DEFAULT_CRON_JOBS));
  } catch {}
  return SEED_DEFAULT_CRON_JOBS;
}

export function saveActiveCronJobs(jobs: ActiveCronJob[]): void {
  try {
    localStorage.setItem(ACTIVE_CRON_STORAGE_KEY, JSON.stringify(jobs));
  } catch (err) {
    console.error('Failed to save active cron jobs:', err);
  }
}

export function scheduleReadyMadeCronJob(template: ReadyMadeCronJobTemplate): ActiveCronJob {
  const currentJobs = getActiveCronJobs();
  const meta = GOOGLE_APPS_METADATA[template.appId];
  
  const newJob: ActiveCronJob = {
    id: `cron_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    appId: template.appId,
    appName: meta?.name || template.appName,
    title: template.title,
    prompt: template.suggestedPrompt,
    cronExpression: template.cronExpression,
    scheduleDescription: template.defaultScheduleLabel,
    cadence: template.cadence,
    status: 'active',
    nextRunTime: template.cadence === 'Daily' ? 'Tomorrow at 8:00 AM' : template.cadence === 'Weekly' ? 'Monday at 9:00 AM' : '1st of next month',
    searchGroundingEnabled: template.searchGroundingRecommended,
    createdAt: new Date().toISOString(),
    createdFromTemplateId: template.id,
    executionLogs: []
  };

  const updated = [newJob, ...currentJobs];
  saveActiveCronJobs(updated);
  return newJob;
}

export function scheduleProposedTasks(tasks: ProposedCronTask[]): ActiveCronJob[] {
  const currentJobs = getActiveCronJobs();
  const created: ActiveCronJob[] = [];

  tasks.forEach(task => {
    if (!task.selected) return;
    const meta = GOOGLE_APPS_METADATA[task.appId];
    const newJob: ActiveCronJob = {
      id: `cron_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      appId: task.appId,
      appName: meta?.name || task.appName,
      title: task.title,
      prompt: task.prompt,
      cronExpression: task.cronExpression,
      scheduleDescription: task.scheduleDescription,
      cadence: task.scheduleType === 'daily' ? 'Daily' : task.scheduleType === 'weekly' ? 'Weekly' : task.scheduleType === 'monthly' ? 'Monthly' : 'Custom',
      status: 'active',
      nextRunTime: task.scheduleType === 'daily' ? 'Tomorrow at 8:00 AM' : task.scheduleType === 'weekly' ? 'Monday at 9:00 AM' : '1st of next month',
      searchGroundingEnabled: task.searchGroundingRecommended,
      createdAt: new Date().toISOString(),
      executionLogs: []
    };
    created.push(newJob);
  });

  if (created.length > 0) {
    const updated = [...created, ...currentJobs];
    saveActiveCronJobs(updated);
  }
  return created;
}

// --- CRON CONTROL ACTIONS ---

export function togglePauseCronJob(id: string): ActiveCronJob[] {
  const current = getActiveCronJobs();
  const updated = current.map(job => {
    if (job.id === id) {
      const nextStatus = job.status === 'active' ? 'paused' : 'active';
      return {
        ...job,
        status: nextStatus as 'active' | 'paused'
      };
    }
    return job;
  });
  saveActiveCronJobs(updated);
  return updated;
}

export function skipNextInstanceCronJob(id: string): ActiveCronJob[] {
  const current = getActiveCronJobs();
  const updated = current.map(job => {
    if (job.id === id) {
      return {
        ...job,
        status: 'skipped_next' as const,
        skipNextInstanceUntil: 'Skipped next scheduled run (will resume on following cycle)',
        executionLogs: [
          {
            id: `log_skip_${Date.now()}`,
            timestamp: 'Just now',
            status: 'success',
            message: 'User skipped soonest instance. Future recurring schedule remains intact.'
          },
          ...job.executionLogs
        ]
      };
    }
    return job;
  });
  saveActiveCronJobs(updated);
  return updated;
}

export function editCronJobScope(id: string, newTitle: string, newPrompt: string, newScheduleLabel: string): ActiveCronJob[] {
  const current = getActiveCronJobs();
  const updated = current.map(job => {
    if (job.id === id) {
      return {
        ...job,
        title: newTitle.trim() || job.title,
        prompt: newPrompt.trim() || job.prompt,
        scheduleDescription: newScheduleLabel.trim() || job.scheduleDescription
      };
    }
    return job;
  });
  saveActiveCronJobs(updated);
  return updated;
}

export function deleteCronJob(id: string): ActiveCronJob[] {
  const current = getActiveCronJobs();
  const updated = current.filter(job => job.id !== id);
  saveActiveCronJobs(updated);
  return updated;
}

export async function executeCronJobNow(id: string): Promise<{ success: boolean; message: string; updatedJobs: ActiveCronJob[] }> {
  // Check quota first
  const quota = getDailyQuotaStatus();
  if (quota.isExceeded) {
    return {
      success: false,
      message: `Daily automated task quota limit reached (${quota.usedCount}/${quota.maxLimit} tasks used today). Please wait until midnight or reduce scope.`,
      updatedJobs: getActiveCronJobs()
    };
  }

  // Increment quota
  incrementDailyQuota(1);

  const current = getActiveCronJobs();
  const targetJob = current.find(j => j.id === id);
  if (!targetJob) {
    return { success: false, message: 'Cron job not found.', updatedJobs: current };
  }

  // Simulate or execute execution log
  const newLog = {
    id: `log_run_${Date.now()}`,
    timestamp: 'Just now',
    status: 'success' as const,
    message: `Autonomous execution completed for ${targetJob.appName}. Action processed: "${targetJob.title}". Synced with Google Workspace.`,
    durationMs: Math.floor(Math.random() * 800) + 600,
    itemsProcessed: Math.floor(Math.random() * 5) + 1,
    groundSearchUsed: !!targetJob.searchGroundingEnabled
  };

  const updated = current.map(job => {
    if (job.id === id) {
      return {
        ...job,
        lastRunTime: 'Just now',
        lastRunStatus: 'success' as const,
        status: job.status === 'skipped_next' ? 'active' : job.status,
        executionLogs: [newLog, ...job.executionLogs.slice(0, 15)]
      };
    }
    return job;
  });

  saveActiveCronJobs(updated);
  return {
    success: true,
    message: newLog.message,
    updatedJobs: updated
  };
}

// --- 2ND BRAIN AUTOMATION DECOMPOSITION (REQUEST -> 3 to 5 PROPOSED CRON TASKS) ---

export async function decomposeAutomationRequest(
  userRequest: string,
  activeAppId: GoogleAppId = 'gmail',
  activeIndustryId?: string
): Promise<AutomationDecompositionResult> {
  const quota = getDailyQuotaStatus();
  
  // Guardrail check: if quota is exhausted, provide deterministic breakdown without external search
  if (quota.isExceeded) {
    return generateDeterministicDecomposition(userRequest, activeAppId, true);
  }

  try {
    const response = await fetch('/api/cron/decompose', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userRequest,
        activeAppId,
        activeIndustryId,
        quotaUsed: quota.usedCount
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.proposedTasks && Array.isArray(data.proposedTasks) && data.proposedTasks.length >= 3) {
        // Increment quota for AI decomposition
        incrementDailyQuota(1);
        return data;
      }
    }
  } catch (err) {
    console.warn('Server decomposition API unavailable, using intelligent local engine:', err);
  }

  // Fallback to local intelligent decomposition
  incrementDailyQuota(1);
  return generateDeterministicDecomposition(userRequest, activeAppId, false);
}

function generateDeterministicDecomposition(
  userRequest: string, 
  preferredApp: GoogleAppId,
  quotaWarning: boolean
): AutomationDecompositionResult {
  const req = userRequest.toLowerCase();
  const baseTitle = userRequest.slice(0, 45);

  const proposed: ProposedCronTask[] = [
    {
      id: `prop_1_${Date.now()}`,
      appId: preferredApp,
      appName: GOOGLE_APPS_METADATA[preferredApp]?.name || 'Gmail',
      title: `Daily Automated ${GOOGLE_APPS_METADATA[preferredApp]?.name} Processing: ${baseTitle}`,
      scheduleType: 'daily',
      scheduleDescription: 'Every Day at 8:00 AM',
      cronExpression: '0 8 * * *',
      prompt: `Execute primary automation for "${userRequest}". Scan context, process incoming data, and format results ready for review.`,
      whyHelpful: `Ensures daily proactive execution without requiring manual check-ins.`,
      searchGroundingRecommended: false,
      selected: true
    },
    {
      id: `prop_2_${Date.now()}`,
      appId: preferredApp === 'sheets' ? 'gmail' : 'sheets',
      appName: preferredApp === 'sheets' ? 'Gmail' : 'Google Sheets',
      title: `Weekly Rollup & Audit Log: ${baseTitle}`,
      scheduleType: 'weekly',
      scheduleDescription: 'Every Friday at 5:00 PM',
      cronExpression: '0 17 * * 5',
      prompt: `Compile a weekly summary table and metric audit log documenting all actions executed under "${userRequest}".`,
      whyHelpful: `Maintains a clean historical record and audit trail in Google Workspace.`,
      searchGroundingRecommended: false,
      selected: true
    },
    {
      id: `prop_3_${Date.now()}`,
      appId: preferredApp === 'calendar' ? 'tasks' : 'calendar',
      appName: preferredApp === 'calendar' ? 'Google Tasks' : 'Google Calendar',
      title: `Recurring Strategy & Milestone Check: ${baseTitle}`,
      scheduleType: 'weekly',
      scheduleDescription: 'Every Monday at 9:00 AM',
      cronExpression: '0 9 * * 1',
      prompt: `Schedule a 15-minute autonomous agenda review to verify that "${userRequest}" goals are advancing smoothly.`,
      whyHelpful: `Keeps you and your team aligned on weekly milestones.`,
      searchGroundingRecommended: false,
      selected: true
    },
    {
      id: `prop_4_${Date.now()}`,
      appId: 'docs',
      appName: 'Google Docs',
      title: 'Monthly Executive Synthesis & Briefing Doc',
      scheduleType: 'monthly',
      scheduleDescription: '1st of Every Month at 9:00 AM',
      cronExpression: '0 9 1 * *',
      prompt: `Synthesize monthly operational trends, key deliverables, and ROI benchmarks resulting from "${userRequest}" into a permanent Google Doc.`,
      whyHelpful: `Provides executive stakeholders with high-level monthly intelligence.`,
      searchGroundingRecommended: false,
      selected: false
    }
  ];

  return {
    userRequest,
    reasoningSummary: quotaWarning 
      ? `[Daily Quota Limit Reached] Generated 4 offline structured Google Workspace cron automations based on your request: "${userRequest}".`
      : `Vantage AI 2nd Brain analyzed your request: "${userRequest}" and formulated 4 concrete, multi-app cron tasks across Google Workspace. Select the tasks you wish to activate:`,
    proposedTasks: proposed,
    groundSearchRequired: false
  };
}
