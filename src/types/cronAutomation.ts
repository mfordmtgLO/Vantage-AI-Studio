/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

export type GoogleAppId = 'gmail' | 'calendar' | 'drive' | 'sheets' | 'docs' | 'tasks' | 'contacts';

export type CronScheduleType = 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom_cron';

export type CronCadence = 'Daily' | 'Weekly' | 'Monthly' | 'Hourly' | 'Custom';

export interface ReadyMadeCronJobTemplate {
  id: string;
  appId: GoogleAppId;
  appName: string;
  title: string;
  description: string;
  cadence: CronCadence;
  defaultScheduleLabel: string;
  cronExpression: string;
  suggestedPrompt: string;
  searchGroundingRecommended?: boolean;
  tags: string[];
}

export interface CronExecutionLog {
  id: string;
  timestamp: string;
  status: 'success' | 'failed' | 'running';
  message: string;
  durationMs?: number;
  itemsProcessed?: number;
  dataPreview?: string;
  groundSearchUsed?: boolean;
}

export interface ActiveCronJob {
  id: string;
  appId: GoogleAppId;
  appName: string;
  title: string;
  prompt: string;
  cronExpression: string;
  scheduleDescription: string;
  cadence: CronCadence;
  status: 'active' | 'paused' | 'skipped_next';
  nextRunTime: string;
  lastRunTime?: string;
  lastRunStatus?: 'success' | 'failed';
  executionLogs: CronExecutionLog[];
  createdFromTemplateId?: string;
  searchGroundingEnabled?: boolean;
  createdAt: string;
  industryId?: string;
  skipNextInstanceUntil?: string;
}

export interface ProposedCronTask {
  id: string;
  title: string;
  appId: GoogleAppId;
  appName: string;
  scheduleType: CronScheduleType;
  scheduleDescription: string;
  cronExpression: string;
  prompt: string;
  whyHelpful: string;
  searchGroundingRecommended: boolean;
  selected: boolean;
}

export interface AutomationDecompositionResult {
  userRequest: string;
  reasoningSummary: string;
  proposedTasks: ProposedCronTask[];
  groundSearchRequired: boolean;
}

export interface DailyQuotaStatus {
  dateKey: string;
  usedCount: number;             // User usage today (max 20)
  maxLimit: number;              // 20
  globalUsedCount: number;       // Combined total system usage today (max 50)
  globalMaxLimit: number;        // 50
  remaining: number;             // 20 - usedCount
  globalRemaining: number;       // 50 - globalUsedCount
  isExceeded: boolean;           // user >= 20 || global >= 50
  isGlobalExceeded: boolean;     // global >= 50
  isApproaching: boolean;        // user >= 15 (80%) || global >= 40 (80%)
  warningMessage?: string;
}
