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
