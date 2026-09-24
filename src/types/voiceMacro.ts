/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

export type VoiceActionCategory = 
  | 'workspace_gmail'
  | 'workspace_calendar'
  | 'workspace_docs'
  | 'workspace_tasks'
  | 'workspace_sheets'
  | 'workspace_contacts'
  | 'memory_ingest'
  | 'memory_recall'
  | 'real_estate_filter'
  | 'real_estate_prequal'
  | 'workflow_macro'
  | 'system_navigation';

export interface VoiceMacroStep {
  stepId: number;
  actionType: string;
  category: VoiceActionCategory;
  label: string;
  description: string;
  target?: string;
  durationMinutes?: number;
  requiresAirgapConfirmation?: boolean;
  status: 'pending' | 'airgap_wait' | 'executing' | 'completed' | 'failed' | 'reverted';
  payload: Record<string, any>;
  errorMessage?: string;
}

export interface VoiceIntentPayload {
  rawTranscript: string;
  normalizedText: string;
  timestamp: string;
  steps: VoiceMacroStep[];
  isCompound: boolean;
  confidenceScore: number;
  matchedMacroName?: string;
  airgapPrompt?: string;
  requiresVerbalAirgap: boolean;
  guardrailChecked: boolean;
  guardrailViolations?: string[];
  extractedEntities: {
    emails?: string[];
    dates?: string[];
    timeMinutes?: number;
    dollarAmounts?: number[];
    monthlyIncome?: number;
    monthlyDebt?: number;
    downPayment?: number;
    locations?: string[];
    programs?: string[];
    memoryNotes?: string;
  };
}

export interface VoiceExecutionState {
  isListening: boolean;
  isProcessing: boolean;
  currentIntent: VoiceIntentPayload | null;
  activeStepIndex: number;
  totalSteps: number;
  executionStatus: 'idle' | 'listening' | 'transcribing' | 'confirming_airgap' | 'executing' | 'undo_window' | 'completed' | 'reverted' | 'error';
  undoTimeRemainingMs: number;
  error: string | null;
  activeWorkflowName?: string | null;
}

export interface VoiceSafetyAirgapConfig {
  enabled: boolean;
  spokenAudioFeedback: boolean;
  requireSpokenAffirmation: boolean;
  requireConfirmationForExternalSends: boolean;
  requireConfirmationForDeletes: boolean;
  requireConfirmationForFinancialSimulations: boolean;
  undoWindowSeconds: number;
  voiceGender?: 'female' | 'male';
  speechRate?: number;
}

export interface VoiceMacroRecipe {
  id: string;
  triggerPhrase: string;
  workflowName: string;
  description: string;
  enabled: boolean;
  isCompoundRecipe?: boolean;
  chainedActions?: Array<{
    actionType: string;
    label: string;
    payload: Record<string, any>;
  }>;
  createdAt?: string;
}

export interface VoicePreQualParams {
  monthlyIncome: number;
  monthlyDebt: number;
  downPayment: number;
  creditScore?: number;
  loanType?: 'USDA' | 'FHA' | 'Conventional' | 'VA';
  calculatedFrontEndDti: number;
  calculatedBackEndDti: number;
  maxPurchaseEnvelope: number;
}

export interface DriveTimeBriefingScheduleConfig {
  enabled: boolean;
  scheduledTime: string; // e.g. "07:30"
  timezone: string; // e.g. "America/Los_Angeles"
  repeatDays: string[]; // ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  voicePersona: 'Puck' | 'Fenrir' | 'Kore' | 'Aoede';
  speakingSpeed: number; // 1.0, 1.15, 1.3
  maxDurationSeconds: number; // 60, 90, 180
  includeZillowPriceDrops: boolean;
  minPriceDropAmount: number; // e.g. 10000
  targetCounties: string[]; // e.g. ['Multnomah', 'Deschutes', 'Marion', 'Lane']
  includeOhcsTargetedAreaHomes: boolean;
  includeUsdaZeroDownHomes: boolean;
  includeHotCrmLeads: boolean;
  minCrmLeadScore: number; // e.g. 8
  includeUnreadRealtorInquiries: boolean;
  includeRateLockExpirations: boolean;
  includeDpaGrantWaterfalls: boolean;
  customPromptInstructions: string;
  deliveryChannels: {
    carPlayPush: boolean;
    inAppAutoPlay: boolean;
    smsAudioMemo: boolean;
    calendarAttachment: boolean;
  };
  recipientPhone?: string;
  lastRunAt?: string;
}

export interface DriveTimeBriefingLog {
  id: string;
  timestamp: string;
  durationSeconds: number;
  audioUrl?: string;
  transcript: string;
  zillowPriceDropCount: number;
  hotLeadCount: number;
  ohcsTargetedMatchCount: number;
  currentMortgageRate30Y: string;
  status: 'completed' | 'delivered' | 'failed';
  voicePersonaUsed: string;
}
