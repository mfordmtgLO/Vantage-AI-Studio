/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleAppId, ReadyMadeCronJobTemplate } from '../types/cronAutomation';

export interface AppMetadata {
  id: GoogleAppId;
  name: string;
  tagline: string;
  color: string;
  bgLight: string;
  borderColor: string;
  iconName: string;
  webUrl: string;
}

export const GOOGLE_APPS_METADATA: Record<GoogleAppId, AppMetadata> = {
  gmail: {
    id: 'gmail',
    name: 'Gmail',
    tagline: 'Inbox Intelligence, AI Drafts & VIP Triage',
    color: 'text-red-600 dark:text-red-400',
    bgLight: 'bg-red-50 dark:bg-red-950/40',
    borderColor: 'border-red-200 dark:border-red-800/60',
    iconName: 'Mail',
    webUrl: 'https://mail.google.com'
  },
  calendar: {
    id: 'calendar',
    name: 'Google Calendar',
    tagline: 'Autonomous Meeting Concierge & Time-Blocking',
    color: 'text-blue-600 dark:text-blue-400',
    bgLight: 'bg-blue-50 dark:bg-blue-950/40',
    borderColor: 'border-blue-200 dark:border-blue-800/60',
    iconName: 'Calendar',
    webUrl: 'https://calendar.google.com'
  },
  drive: {
    id: 'drive',
    name: 'Google Drive',
    tagline: 'Cloud Storage, File Discovery & Asset Indexing',
    color: 'text-amber-600 dark:text-amber-400',
    bgLight: 'bg-amber-50 dark:bg-amber-950/40',
    borderColor: 'border-amber-200 dark:border-amber-800/60',
    iconName: 'FolderOpen',
    webUrl: 'https://drive.google.com'
  },
  sheets: {
    id: 'sheets',
    name: 'Google Sheets',
    tagline: 'Relational SQL Querying, Data Cleanups & Rollups',
    color: 'text-emerald-600 dark:text-emerald-400',
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderColor: 'border-emerald-200 dark:border-emerald-800/60',
    iconName: 'Table',
    webUrl: 'https://sheets.google.com'
  },
  docs: {
    id: 'docs',
    name: 'Google Docs',
    tagline: 'Autonomous Synthesis, Briefings & Client Proposals',
    color: 'text-sky-600 dark:text-sky-400',
    bgLight: 'bg-sky-50 dark:bg-sky-950/40',
    borderColor: 'border-sky-200 dark:border-sky-800/60',
    iconName: 'FileText',
    webUrl: 'https://docs.google.com'
  },
  tasks: {
    id: 'tasks',
    name: 'Google Tasks',
    tagline: 'Priority Matrix, Reminders & Milestone Tracking',
    color: 'text-indigo-600 dark:text-indigo-400',
    bgLight: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderColor: 'border-indigo-200 dark:border-indigo-800/60',
    iconName: 'CheckSquare',
    webUrl: 'https://tasks.google.com'
  },
  contacts: {
    id: 'contacts',
    name: 'Google Contacts',
    tagline: 'Relationship CRM, Contact Enrichment & Lead Hygiene',
    color: 'text-purple-600 dark:text-purple-400',
    bgLight: 'bg-purple-50 dark:bg-purple-950/40',
    borderColor: 'border-purple-200 dark:border-purple-800/60',
    iconName: 'Users',
    webUrl: 'https://contacts.google.com'
  }
};

export const READY_MADE_CRON_JOBS: ReadyMadeCronJobTemplate[] = [
  // --- GMAIL ---
  {
    id: 'cron_gmail_morning_triage',
    appId: 'gmail',
    appName: 'Gmail',
    title: 'Daily Morning Inbox Synthesis & Urgent Flagging',
    description: 'Scans unread emails at 8:00 AM, categorizes VIP senders, and drafts bulleted response summaries.',
    cadence: 'Daily',
    defaultScheduleLabel: 'Every Day at 8:00 AM',
    cronExpression: '0 8 * * *',
    suggestedPrompt: 'Scan all unread emails from the past 24 hours. Identify urgent client inquiries, flag high-priority VIP emails, and generate executive draft responses in Gmail.',
    searchGroundingRecommended: false,
    tags: ['Daily', 'Inbox', 'Triage', 'VIP']
  },
  {
    id: 'cron_gmail_lead_followup',
    appId: 'gmail',
    appName: 'Gmail',
    title: 'Weekly Inactive Lead Follow-Up Drafts',
    description: 'Identifies leads who have not replied in 5+ days and generates personalized touchpoint drafts.',
    cadence: 'Weekly',
    defaultScheduleLabel: 'Every Monday at 9:00 AM',
    cronExpression: '0 9 * * 1',
    suggestedPrompt: 'Identify all active prospect conversations with no reply in the last 5 business days. Prepare customized follow-up email drafts with value-add insights tailored to their profile.',
    searchGroundingRecommended: false,
    tags: ['Weekly', 'Leads', 'Follow-up', 'Drafts']
  },
  {
    id: 'cron_gmail_monthly_newsletter',
    appId: 'gmail',
    appName: 'Gmail',
    title: 'Monthly Industry Market Update Newsletter Draft',
    description: 'Researches latest industry benchmarks and drafts a comprehensive client newsletter on the 1st of each month.',
    cadence: 'Monthly',
    defaultScheduleLabel: '1st of Every Month at 10:00 AM',
    cronExpression: '0 10 1 * *',
    suggestedPrompt: 'Synthesize key monthly industry trends, interest rate benchmarks, and key market updates into an executive newsletter draft in Gmail ready for distribution.',
    searchGroundingRecommended: true,
    tags: ['Monthly', 'Newsletter', 'Research', 'Grounding']
  },

  // --- GOOGLE CALENDAR ---
  {
    id: 'cron_cal_daily_agenda_prep',
    appId: 'calendar',
    appName: 'Google Calendar',
    title: 'Daily Meeting Agenda & Attendee Dossier Briefing',
    description: 'Prepares briefing notes 1 hour before the work day begins, checking meeting attendee profiles and open action items.',
    cadence: 'Daily',
    defaultScheduleLabel: 'Every Morning at 7:30 AM',
    cronExpression: '30 7 * * *',
    suggestedPrompt: 'Review today’s scheduled calendar events. Pull attendee context, cross-reference previous email threads, and assemble a 3-bullet meeting objective brief for each appointment.',
    searchGroundingRecommended: false,
    tags: ['Daily', 'Briefing', 'Attendees', 'Prep']
  },
  {
    id: 'cron_cal_weekly_focus_blocks',
    appId: 'calendar',
    appName: 'Google Calendar',
    title: 'Weekly Autonomous Deep Work & Buffer Time-Blocking',
    description: 'Analyzes next week’s meeting density and automatically reserves 2-hour deep focus blocks.',
    cadence: 'Weekly',
    defaultScheduleLabel: 'Every Sunday at 6:00 PM',
    cronExpression: '0 18 * * 0',
    suggestedPrompt: 'Examine calendar availability for the upcoming week. Automatically schedule 2-hour uninterrupted deep focus blocks on Tuesday and Thursday mornings, avoiding back-to-back meeting fatigue.',
    searchGroundingRecommended: false,
    tags: ['Weekly', 'Time-Blocking', 'Focus', 'Productivity']
  },
  {
    id: 'cron_cal_monthly_review',
    appId: 'calendar',
    appName: 'Google Calendar',
    title: 'Monthly Client Cadence & Milestone Scheduling',
    description: 'Schedules recurring quarterly review holds and checks for lapsed customer check-ins.',
    cadence: 'Monthly',
    defaultScheduleLabel: 'Last Friday of Every Month at 4:00 PM',
    cronExpression: '0 16 28-31 * 5',
    suggestedPrompt: 'Review customer touchpoint milestones for the past 90 days. Schedule 30-minute quarterly check-in placeholders for priority accounts whose last touch was over 60 days ago.',
    searchGroundingRecommended: false,
    tags: ['Monthly', 'Client Cadence', 'Review']
  },

  // --- GOOGLE DRIVE ---
  {
    id: 'cron_drive_daily_indexer',
    appId: 'drive',
    appName: 'Google Drive',
    title: 'Daily New Asset & Document Auto-Tagging Indexer',
    description: 'Scans newly uploaded documents in Drive, generates keyword tags, and verifies folder hierarchy.',
    cadence: 'Daily',
    defaultScheduleLabel: 'Every Evening at 6:00 PM',
    cronExpression: '0 18 * * *',
    suggestedPrompt: 'Scan all documents, PDFs, and presentations modified or created in Google Drive today. Extract summary tags and update the master index catalogue.',
    searchGroundingRecommended: false,
    tags: ['Daily', 'Drive', 'Indexing', 'Tagging']
  },
  {
    id: 'cron_drive_weekly_audit',
    appId: 'drive',
    appName: 'Google Drive',
    title: 'Weekly Shared Folder Permissions & Storage Audit',
    description: 'Checks shared folder access, flags external sharing links older than 30 days, and archives stale files.',
    cadence: 'Weekly',
    defaultScheduleLabel: 'Every Friday at 5:00 PM',
    cronExpression: '0 17 * * 5',
    suggestedPrompt: 'Audit shared Google Drive documents for open public links or expired collaborator access. Prepare a clean summary of external permissions for security review.',
    searchGroundingRecommended: false,
    tags: ['Weekly', 'Audit', 'Security', 'Permissions']
  },
  {
    id: 'cron_drive_monthly_backup_pack',
    appId: 'drive',
    appName: 'Google Drive',
    title: 'Monthly Contract & Financial Asset Export Pack',
    description: 'Packages executed contracts, invoices, and closing disclosures into organized monthly backup archives.',
    cadence: 'Monthly',
    defaultScheduleLabel: 'Last Day of Month at 11:00 PM',
    cronExpression: '0 23 28-31 * *',
    suggestedPrompt: 'Organize all executed agreements, closing packages, and financial statements from this month into a structured /Archive/YYYY-MM folder hierarchy in Google Drive.',
    searchGroundingRecommended: false,
    tags: ['Monthly', 'Archiving', 'Backups', 'Compliance']
  },

  // --- GOOGLE SHEETS ---
  {
    id: 'cron_sheets_daily_kpi_rollup',
    appId: 'sheets',
    appName: 'Google Sheets',
    title: 'Daily Pipeline KPI Rollup & Conversion Metric Sync',
    description: 'Aggregates newly captured leads, pre-approval volume, and task completion percentages into master Sheets.',
    cadence: 'Daily',
    defaultScheduleLabel: 'Every Night at 11:30 PM',
    cronExpression: '30 23 * * *',
    suggestedPrompt: 'Calculate daily pipeline metrics, new inquiry volume, conversion rates, and closed transactions. Append clean daily rollup rows into the master KPI Google Sheet.',
    searchGroundingRecommended: false,
    tags: ['Daily', 'KPI', 'Rollup', 'Metrics']
  },
  {
    id: 'cron_sheets_weekly_dedupe',
    appId: 'sheets',
    appName: 'Google Sheets',
    title: 'Weekly Relational De-duping & Data Hygiene Scrub',
    description: 'Scans CRM spreadsheets for duplicate emails, standardizes phone numbers, and flags missing fields.',
    cadence: 'Weekly',
    defaultScheduleLabel: 'Every Saturday at 3:00 AM',
    cronExpression: '0 3 * * 6',
    suggestedPrompt: 'Execute relational fuzzy matching across CRM spreadsheets to detect duplicate contact rows, normalize phone formatting (E.164), and highlight unassigned leads.',
    searchGroundingRecommended: false,
    tags: ['Weekly', 'Deduplication', 'Hygiene', 'CRM']
  },
  {
    id: 'cron_sheets_monthly_financial_recon',
    appId: 'sheets',
    appName: 'Google Sheets',
    title: 'Monthly Revenue & Commission Reconciliation',
    description: 'Matches bank deposits and closed transaction ledger rows, creating a variance audit tab.',
    cadence: 'Monthly',
    defaultScheduleLabel: '2nd of Every Month at 6:00 AM',
    cronExpression: '0 6 2 * *',
    suggestedPrompt: 'Perform end-of-month financial reconciliation in Google Sheets. Compare pipeline volume with final funding numbers and generate profit/commission totals.',
    searchGroundingRecommended: false,
    tags: ['Monthly', 'Finance', 'Reconciliation', 'Commission']
  },

  // --- GOOGLE DOCS ---
  {
    id: 'cron_docs_daily_meeting_synthesis',
    appId: 'docs',
    appName: 'Google Docs',
    title: 'Daily Executive Debrief & Action Items Doc Compiler',
    description: 'Synthesizes notes from today’s client calls and meetings into a standardized Google Doc debrief.',
    cadence: 'Daily',
    defaultScheduleLabel: 'Every Day at 5:30 PM',
    cronExpression: '30 17 * * *',
    suggestedPrompt: 'Compile notes, transcript highlights, and next steps from today’s meetings into a dated Executive Debrief Google Doc, including clear assignment owners.',
    searchGroundingRecommended: false,
    tags: ['Daily', 'Debrief', 'Meeting Notes', 'Action Items']
  },
  {
    id: 'cron_docs_weekly_executive_brief',
    appId: 'docs',
    appName: 'Google Docs',
    title: 'Weekly Operational & Strategic Executive Brief',
    description: 'Drafts a 2-page executive summary covering pipeline milestones, market intelligence, and upcoming risks.',
    cadence: 'Weekly',
    defaultScheduleLabel: 'Every Monday at 7:00 AM',
    cronExpression: '0 7 * * 1',
    suggestedPrompt: 'Generate a comprehensive Weekly Strategic Executive Brief Google Doc synthesizing weekly milestones, active opportunities, team bandwidth, and prioritized goals.',
    searchGroundingRecommended: true,
    tags: ['Weekly', 'Executive Brief', 'Synthesis', 'Strategy']
  },
  {
    id: 'cron_docs_monthly_sop_updater',
    appId: 'docs',
    appName: 'Google Docs',
    title: 'Monthly Standard Operating Procedure (SOP) Audit & Refresh',
    description: 'Updates onboarding guides and compliance documentation with latest operational workflows.',
    cadence: 'Monthly',
    defaultScheduleLabel: '15th of Every Month at 9:00 AM',
    cronExpression: '0 9 15 * *',
    suggestedPrompt: 'Review and update team SOP Google Docs with newly introduced workflow automations, regulatory guideline adjustments, and step-by-step best practices.',
    searchGroundingRecommended: false,
    tags: ['Monthly', 'SOP', 'Documentation', 'Compliance']
  },

  // --- GOOGLE TASKS ---
  {
    id: 'cron_tasks_daily_priority_matrix',
    appId: 'tasks',
    appName: 'Google Tasks',
    title: 'Daily Eisenhower Priority Matrix & Overdue Rescheduling',
    description: 'Re-prioritizes open tasks at 8:15 AM into Urgent/Important quadrants and flags overdue items.',
    cadence: 'Daily',
    defaultScheduleLabel: 'Every Morning at 8:15 AM',
    cronExpression: '15 8 * * *',
    suggestedPrompt: 'Evaluate all pending tasks across Google Tasks lists. Organize into high-impact priority buckets, adjust past-due deadlines, and highlight top 3 critical daily must-wins.',
    searchGroundingRecommended: false,
    tags: ['Daily', 'Prioritization', 'Eisenhower', 'Must-Wins']
  },
  {
    id: 'cron_tasks_weekly_sprint_kickoff',
    appId: 'tasks',
    appName: 'Google Tasks',
    title: 'Weekly Sprint Milestone & Deliverables Sync',
    description: 'Generates structured weekly sprint checklist tasks aligned with team revenue and project goals.',
    cadence: 'Weekly',
    defaultScheduleLabel: 'Every Monday at 8:30 AM',
    cronExpression: '30 8 * * 1',
    suggestedPrompt: 'Create a structured Google Tasks weekly sprint list containing key business development targets, client deliverables, and administrative milestones.',
    searchGroundingRecommended: false,
    tags: ['Weekly', 'Sprint', 'Milestones', 'Checklist']
  },
  {
    id: 'cron_tasks_monthly_recurrence_check',
    appId: 'tasks',
    appName: 'Google Tasks',
    title: 'Monthly Recurring Compliance & Renewal Task Generator',
    description: 'Generates license renewal, compliance filing, and quarterly tax review reminders in Google Tasks.',
    cadence: 'Monthly',
    defaultScheduleLabel: '1st of Every Month at 8:00 AM',
    cronExpression: '0 8 1 * *',
    suggestedPrompt: 'Populate monthly recurring compliance verification, continuing education checks, and license maintenance tasks in Google Tasks.',
    searchGroundingRecommended: false,
    tags: ['Monthly', 'Compliance', 'Renewals', 'Licensing']
  },

  // --- GOOGLE CONTACTS ---
  {
    id: 'cron_contacts_daily_interaction_tagger',
    appId: 'contacts',
    appName: 'Google Contacts',
    title: 'Daily New Sender & Meeting Attendee Auto-Contact Creation',
    description: 'Extracts new client phone numbers, emails, and company titles from daily communications and saves to Contacts.',
    cadence: 'Daily',
    defaultScheduleLabel: 'Every Evening at 7:00 PM',
    cronExpression: '0 19 * * *',
    suggestedPrompt: 'Detect new inbound communication senders and calendar attendees from today. Format clean Google Contacts entries with job titles and relationship tags.',
    searchGroundingRecommended: false,
    tags: ['Daily', 'Auto-Create', 'Enrichment', 'CRM']
  },
  {
    id: 'cron_contacts_weekly_cold_lead_scan',
    appId: 'contacts',
    appName: 'Google Contacts',
    title: 'Weekly Cold Relationship Re-Engagement Radar',
    description: 'Scans contacts with no touchpoint in 45+ days and generates re-engagement suggestions.',
    cadence: 'Weekly',
    defaultScheduleLabel: 'Every Wednesday at 10:00 AM',
    cronExpression: '0 10 * * 3',
    suggestedPrompt: 'Audit Google Contacts directory for past clients and high-value referral partners not contacted in over 45 days. Assemble a prioritized re-engagement touchpoint list.',
    searchGroundingRecommended: false,
    tags: ['Weekly', 'Radar', 'Re-engagement', 'Referrals']
  },
  {
    id: 'cron_contacts_monthly_hygiene_scrub',
    appId: 'contacts',
    appName: 'Google Contacts',
    title: 'Monthly VIP Contact Birthday & Milestone Enrichment',
    description: 'Enriches contact records with upcoming birthdays, home purchase anniversaries, and company promotions.',
    cadence: 'Monthly',
    defaultScheduleLabel: 'Last Sunday of Month at 2:00 PM',
    cronExpression: '0 14 28-31 * 0',
    suggestedPrompt: 'Scan next month’s contact birthdays, loan closing anniversaries, and partnership milestones. Tag corresponding Google Contacts for automated greeting cards.',
    searchGroundingRecommended: false,
    tags: ['Monthly', 'Anniversaries', 'Milestones', 'VIP']
  }
];

// --- GHOST TEXT CYCLING DATABASE (Tailored by Google App AND Active 2nd Brain Industry) ---

export interface GhostTextIdea {
  id: string;
  appId: GoogleAppId;
  industryId?: string; // e.g. 'mortgage_real_estate', 'healthcare', 'legal', 'tech_engineering', 'general'
  promptText: string;
  cadenceLabel: string;
}

export const GHOST_TEXT_CATALOG: GhostTextIdea[] = [
  // --- GMAIL ---
  // Real Estate / Mortgage
  {
    id: 'gt_gmail_mlo_1',
    appId: 'gmail',
    industryId: 'mortgage_real_estate',
    promptText: 'Scan inbox every morning at 8:00 AM, identify borrower rate-lock requests, and draft pre-approval update emails with current FHA/VA/Conventional benchmarks.',
    cadenceLabel: 'Daily at 8:00 AM'
  },
  {
    id: 'gt_gmail_mlo_2',
    appId: 'gmail',
    industryId: 'mortgage_real_estate',
    promptText: 'Every Friday at 3:00 PM, draft weekend open house check-in emails to all partnering realtors with current DPA grant eligible properties.',
    cadenceLabel: 'Weekly on Friday'
  },
  {
    id: 'gt_gmail_mlo_3',
    appId: 'gmail',
    industryId: 'mortgage_real_estate',
    promptText: 'Scan for missing conditional loan approval documents (W2s, tax returns, bank statements) and draft polite automated reminder emails every Tuesday.',
    cadenceLabel: 'Weekly on Tuesday'
  },
  {
    id: 'gt_gmail_mlo_4',
    appId: 'gmail',
    industryId: 'mortgage_real_estate',
    promptText: 'On the 1st of each month, draft a personalized market interest rate forecast newsletter for past funded borrowers.',
    cadenceLabel: 'Monthly on the 1st'
  },
  // Legal
  {
    id: 'gt_gmail_legal_1',
    appId: 'gmail',
    industryId: 'legal',
    promptText: 'Daily at 8:30 AM, flag opposing counsel communications, extract upcoming court filing deadlines, and draft acknowledgement emails.',
    cadenceLabel: 'Daily at 8:30 AM'
  },
  {
    id: 'gt_gmail_legal_2',
    appId: 'gmail',
    industryId: 'legal',
    promptText: 'Weekly on Monday, generate draft status updates for all active litigation clients detailing discovery phase progress.',
    cadenceLabel: 'Weekly on Monday'
  },
  {
    id: 'gt_gmail_legal_3',
    appId: 'gmail',
    industryId: 'legal',
    promptText: 'Daily at 5:00 PM, summarize all client billable inquiries from today’s email threads and draft time-entry notes.',
    cadenceLabel: 'Daily at 5:00 PM'
  },
  {
    id: 'gt_gmail_legal_4',
    appId: 'gmail',
    industryId: 'legal',
    promptText: 'Monthly on the 1st, draft retainer renewal reminders and upcoming statute of limitations checklist emails.',
    cadenceLabel: 'Monthly on the 1st'
  },
  // Tech / Engineering
  {
    id: 'gt_gmail_tech_1',
    appId: 'gmail',
    industryId: 'tech_engineering',
    promptText: 'Every morning at 8:00 AM, synthesize GitHub/Sentry error alerts and incident threads into a 3-bullet sprint standup email draft.',
    cadenceLabel: 'Daily at 8:00 AM'
  },
  {
    id: 'gt_gmail_tech_2',
    appId: 'gmail',
    industryId: 'tech_engineering',
    promptText: 'Every Friday afternoon, scan vendor renewal invoices and API usage notifications to draft cost-optimization summaries.',
    cadenceLabel: 'Weekly on Friday'
  },
  {
    id: 'gt_gmail_tech_3',
    appId: 'gmail',
    industryId: 'tech_engineering',
    promptText: 'Weekly on Wednesday, draft stakeholder progress updates on feature release milestones and beta testing feedback.',
    cadenceLabel: 'Weekly on Wednesday'
  },
  {
    id: 'gt_gmail_tech_4',
    appId: 'gmail',
    industryId: 'tech_engineering',
    promptText: 'Monthly on the 28th, draft cloud architecture security advisory emails to executive leadership.',
    cadenceLabel: 'Monthly on the 28th'
  },
  // General / Default
  {
    id: 'gt_gmail_gen_1',
    appId: 'gmail',
    promptText: 'Every morning at 8:00 AM, scan unread emails, identify VIP clients, and draft polite executive response summaries in Gmail.',
    cadenceLabel: 'Daily at 8:00 AM'
  },
  {
    id: 'gt_gmail_gen_2',
    appId: 'gmail',
    promptText: 'Every Monday morning, draft personalized check-in follow-ups for all prospects who have not responded in 5+ business days.',
    cadenceLabel: 'Weekly on Monday'
  },
  {
    id: 'gt_gmail_gen_3',
    appId: 'gmail',
    promptText: 'Daily at 4:30 PM, flag pending invoice payment emails and draft polite payment receipt confirmation notes.',
    cadenceLabel: 'Daily at 4:30 PM'
  },
  {
    id: 'gt_gmail_gen_4',
    appId: 'gmail',
    promptText: 'On the 1st of each month, draft an executive industry trends and business achievements digest in Gmail.',
    cadenceLabel: 'Monthly on the 1st'
  },

  // --- GOOGLE CALENDAR ---
  {
    id: 'gt_cal_1',
    appId: 'calendar',
    promptText: 'Every morning at 7:30 AM, assemble attendee dossiers for all today’s calendar meetings with bulleted talking points.',
    cadenceLabel: 'Daily at 7:30 AM'
  },
  {
    id: 'gt_cal_2',
    appId: 'calendar',
    promptText: 'Every Sunday evening, analyze upcoming meeting density and reserve 2-hour uninterrupted deep focus blocks on Tuesday and Thursday mornings.',
    cadenceLabel: 'Weekly on Sunday'
  },
  {
    id: 'gt_cal_3',
    appId: 'calendar',
    promptText: 'Every Friday at 4:00 PM, review calendar schedule for next week and flag double-booked slots or missing buffer times.',
    cadenceLabel: 'Weekly on Friday'
  },
  {
    id: 'gt_cal_4',
    appId: 'calendar',
    promptText: 'Last business day of each month, schedule 30-minute quarterly strategy review holds with key accounts and stakeholders.',
    cadenceLabel: 'Monthly'
  },

  // --- GOOGLE DRIVE ---
  {
    id: 'gt_drive_1',
    appId: 'drive',
    promptText: 'Every evening at 6:00 PM, scan newly uploaded PDFs and proposals in Google Drive, generate search tags, and verify client folder placement.',
    cadenceLabel: 'Daily at 6:00 PM'
  },
  {
    id: 'gt_drive_2',
    appId: 'drive',
    promptText: 'Every Friday at 5:00 PM, audit shared Drive files for open external links and compile a security permissions summary.',
    cadenceLabel: 'Weekly on Friday'
  },
  {
    id: 'gt_drive_3',
    appId: 'drive',
    promptText: 'Every Wednesday at 2:00 PM, index newly approved marketing collateral and pitch decks into the master team knowledge folder.',
    cadenceLabel: 'Weekly on Wednesday'
  },
  {
    id: 'gt_drive_4',
    appId: 'drive',
    promptText: 'Last day of every month, package executed contracts, invoices, and closing packages into structured /Archive/YYYY-MM folders in Drive.',
    cadenceLabel: 'Monthly'
  },

  // --- GOOGLE SHEETS ---
  {
    id: 'gt_sheets_1',
    appId: 'sheets',
    promptText: 'Every night at 11:30 PM, calculate daily pipeline conversion metrics, new inquiries, and append rollup rows into the master KPI Sheet.',
    cadenceLabel: 'Daily at 11:30 PM'
  },
  {
    id: 'gt_sheets_2',
    appId: 'sheets',
    promptText: 'Every Saturday at 3:00 AM, perform relational fuzzy matching across CRM sheets to deduplicate contact rows and format phone numbers.',
    cadenceLabel: 'Weekly on Saturday'
  },
  {
    id: 'gt_sheets_3',
    appId: 'sheets',
    promptText: 'Every Monday at 6:00 AM, sync regional property MLS listings or market data benchmarks into the competitive analysis Sheet.',
    cadenceLabel: 'Weekly on Monday'
  },
  {
    id: 'gt_sheets_4',
    appId: 'sheets',
    promptText: '2nd day of every month, reconcile closed pipeline ledger rows with bank settlement reports and generate revenue variance totals.',
    cadenceLabel: 'Monthly on the 2nd'
  },

  // --- GOOGLE DOCS ---
  {
    id: 'gt_docs_1',
    appId: 'docs',
    promptText: 'Every day at 5:30 PM, compile transcript notes and next steps from today’s client calls into a dated Executive Debrief Google Doc.',
    cadenceLabel: 'Daily at 5:30 PM'
  },
  {
    id: 'gt_docs_2',
    appId: 'docs',
    promptText: 'Every Monday at 7:00 AM, generate a 2-page Weekly Operational & Strategic Executive Brief Google Doc with key goals and risks.',
    cadenceLabel: 'Weekly on Monday'
  },
  {
    id: 'gt_docs_3',
    appId: 'docs',
    promptText: 'Every Thursday at 4:00 PM, synthesize client feedback surveys into a structured product enhancement proposal Google Doc.',
    cadenceLabel: 'Weekly on Thursday'
  },
  {
    id: 'gt_docs_4',
    appId: 'docs',
    promptText: '15th of each month, review and update internal Standard Operating Procedure (SOP) Google Docs with new team best practices.',
    cadenceLabel: 'Monthly on the 15th'
  },

  // --- GOOGLE TASKS ---
  {
    id: 'gt_tasks_1',
    appId: 'tasks',
    promptText: 'Every morning at 8:15 AM, organize open Google Tasks into an Eisenhower priority matrix, reschedule overdue items, and flag top 3 must-wins.',
    cadenceLabel: 'Daily at 8:15 AM'
  },
  {
    id: 'gt_tasks_2',
    appId: 'tasks',
    promptText: 'Every Monday at 8:30 AM, generate weekly sprint deliverables checklist tasks tied to quarterly revenue and project milestones.',
    cadenceLabel: 'Weekly on Monday'
  },
  {
    id: 'gt_tasks_3',
    appId: 'tasks',
    promptText: 'Every Friday at 4:30 PM, review completed tasks for the week and archive resolved action items into a weekly accomplishment log.',
    cadenceLabel: 'Weekly on Friday'
  },
  {
    id: 'gt_tasks_4',
    appId: 'tasks',
    promptText: '1st of each month, generate recurring compliance filing, license renewal, and audit preparation checklist items in Google Tasks.',
    cadenceLabel: 'Monthly on the 1st'
  },

  // --- GOOGLE CONTACTS ---
  {
    id: 'gt_contacts_1',
    appId: 'contacts',
    promptText: 'Every evening at 7:00 PM, detect new inbound email senders and meeting attendees from today and auto-create enriched Google Contacts.',
    cadenceLabel: 'Daily at 7:00 PM'
  },
  {
    id: 'gt_contacts_2',
    appId: 'contacts',
    promptText: 'Every Wednesday at 10:00 AM, audit contacts for high-value VIP referral partners not contacted in 45+ days and flag re-engagement targets.',
    cadenceLabel: 'Weekly on Wednesday'
  },
  {
    id: 'gt_contacts_3',
    appId: 'contacts',
    promptText: 'Every Friday at 11:00 AM, normalize address and company title fields across newly added mobile and web leads.',
    cadenceLabel: 'Weekly on Friday'
  },
  {
    id: 'gt_contacts_4',
    appId: 'contacts',
    promptText: 'Last Sunday of each month, scan next month’s contact birthdays and transaction anniversaries to tag for personalized greetings.',
    cadenceLabel: 'Monthly'
  }
];

/**
 * Returns at least 4 tailored ghost text suggestions for the given Google App and active industry
 */
export function getTailoredGhostTextIdeas(appId: GoogleAppId, industryId?: string): GhostTextIdea[] {
  const matchingIndustry = GHOST_TEXT_CATALOG.filter(
    item => item.appId === appId && item.industryId && item.industryId === industryId
  );
  
  const generalAppIdeas = GHOST_TEXT_CATALOG.filter(
    item => item.appId === appId && !item.industryId
  );
  
  const combined = [...matchingIndustry, ...generalAppIdeas];
  
  // If we have fewer than 4, fill with ready-made cron templates
  if (combined.length < 4) {
    const fallbackTemplates = READY_MADE_CRON_JOBS.filter(t => t.appId === appId);
    fallbackTemplates.forEach(t => {
      combined.push({
        id: `fallback_${t.id}`,
        appId: t.appId,
        promptText: t.suggestedPrompt,
        cadenceLabel: t.defaultScheduleLabel
      });
    });
  }
  
  return combined.slice(0, 6);
}
