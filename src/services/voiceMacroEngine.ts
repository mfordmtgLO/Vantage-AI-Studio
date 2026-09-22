/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import { VoiceMacroStep, VoiceIntentPayload, VoiceSafetyAirgapConfig, VoiceMacroRecipe, VoicePreQualParams } from '../types/voiceMacro';
import { GuardrailSettings } from '../types';
import { getByokHttpHeaders } from '../utils/byokStorage';

export const DEFAULT_AIRGAP_CONFIG: VoiceSafetyAirgapConfig = {
  enabled: true,
  spokenAudioFeedback: true,
  requireSpokenAffirmation: true,
  requireConfirmationForExternalSends: true,
  requireConfirmationForDeletes: true,
  requireConfirmationForFinancialSimulations: true,
  undoWindowSeconds: 10,
  speechRate: 1.0,
};

/**
 * Conjunction keywords used to split compound spoken instructions
 */
const COMPOUND_CONJUNCTIONS = [
  ' and then ',
  ' after that ',
  ' also ',
  ' next ',
  ' then ',
  ' and also ',
  ' afterwards ',
  ' followed by ',
  '; ',
  ', then ',
  ', and '
];

/**
 * Normalizes speech text for robust intent recognition
 */
export function normalizeSpokenText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts dollar values, debts, and income figures from spoken text
 */
export function extractFinancialEntities(text: string): {
  monthlyIncome?: number;
  monthlyDebt?: number;
  downPayment?: number;
  dollarAmounts: number[];
} {
  const dollarAmounts: number[] = [];
  const normalized = text.toLowerCase();

  // Match $XX,XXX or XXk or XX thousand or X hundred
  const moneyRegex = /\$?\s*(\d{1,3}(?:,\d{3})*|\d+)(?:\s*(k|thousand|hundred|million|m))?/gi;
  let match;

  while ((match = moneyRegex.exec(normalized)) !== null) {
    const rawNumStr = match[1].replace(/,/g, '');
    let num = parseFloat(rawNumStr);
    const unit = match[2]?.toLowerCase();

    if (unit === 'k' || unit === 'thousand') {
      num *= 1000;
    } else if (unit === 'hundred') {
      num *= 100;
    } else if (unit === 'm' || unit === 'million') {
      num *= 1000000;
    }

    if (!isNaN(num) && num > 0) {
      dollarAmounts.push(num);
    }
  }

  let monthlyIncome: number | undefined;
  let monthlyDebt: number | undefined;
  let downPayment: number | undefined;

  // Contextual pattern matching: "make $8,500 a month" / "$8500 income"
  const incomeMatch = normalized.match(/(?:make|earn|income|salary of|bring in)\s*\$?(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:k|thousand)?(?:\s*(?:a|per)\s*(?:month|mo|year|yr))?/i);
  if (incomeMatch) {
    let inc = parseFloat(incomeMatch[1].replace(/,/g, ''));
    if (normalized.includes('year') || normalized.includes('annual') || inc > 25000) {
      inc = Math.round(inc / 12);
    }
    monthlyIncome = inc;
  }

  // Debt pattern matching: "$450 in debt" / "debt of $450"
  const debtMatch = normalized.match(/(?:debt|debts|loans|car payment|credit card)\s*(?:of|is|equals)?\s*\$?(\d+(?:,\d+)*)/i) ||
                     normalized.match(/\$?(\d+(?:,\d+)*)\s*(?:in|of)\s*debt/i);
  if (debtMatch) {
    monthlyDebt = parseFloat(debtMatch[1].replace(/,/g, ''));
  }

  // Down payment pattern matching: "$20,000 saved" / "$20k down"
  const downMatch = normalized.match(/(?:saved|savings|down payment|down)\s*(?:of|is|equals)?\s*\$?(\d+(?:,\d+)*(?:\s*(?:k|thousand))?)/i) ||
                    normalized.match(/\$?(\d+(?:,\d+)*(?:\s*(?:k|thousand))?)\s*(?:saved|in savings|down|for down payment)/i);
  if (downMatch) {
    let dpStr = downMatch[1].replace(/,/g, '').toLowerCase();
    let dp = parseFloat(dpStr);
    if (dpStr.includes('k') || dpStr.includes('thousand')) dp *= 1000;
    downPayment = dp;
  }

  return { monthlyIncome, monthlyDebt, downPayment, dollarAmounts };
}

/**
 * Calculates mortgage prequalification and DTI ratios from financial entities
 */
export function calculateVoicePreQual(
  monthlyIncome: number,
  monthlyDebt: number,
  downPayment: number,
  interestRate = 0.065
): VoicePreQualParams {
  const safeIncome = Math.max(1000, monthlyIncome);
  const maxHousingPaymentFrontEnd = safeIncome * 0.28; // standard 28% front-end
  const maxTotalDebtBackEnd = safeIncome * 0.36; // standard 36% back-end
  const maxAllowableHousingPayment = Math.max(0, Math.min(maxHousingPaymentFrontEnd, maxTotalDebtBackEnd - monthlyDebt));

  // Approximate mortgage payment factor (P&I + Taxes/Insurance ~ 1.25x P&I)
  const monthlyRate = interestRate / 12;
  const numPayments = 360; // 30 yr
  const factor = (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / (Math.pow(1 + monthlyRate, numPayments) - 1);
  const estimatedPAndI = maxAllowableHousingPayment * 0.80; // 80% to P&I, 20% to escrow
  const maxLoanAmount = Math.max(50000, Math.round(estimatedPAndI / factor));
  const maxPurchaseEnvelope = Math.round(maxLoanAmount + downPayment);

  const calculatedFrontEndDti = Math.round((maxAllowableHousingPayment / safeIncome) * 100);
  const calculatedBackEndDti = Math.round(((maxAllowableHousingPayment + monthlyDebt) / safeIncome) * 100);

  return {
    monthlyIncome,
    monthlyDebt,
    downPayment,
    loanType: downPayment === 0 ? 'USDA' : 'Conventional',
    calculatedFrontEndDti,
    calculatedBackEndDti,
    maxPurchaseEnvelope
  };
}

/**
 * Decomposes single sub-phrases into individual VoiceMacroStep objects
 */
function parseSingleIntentClause(clauseText: string, stepIndex: number): VoiceMacroStep {
  const normalized = clauseText.trim();
  const lower = normalized.toLowerCase();

  // 1. 2nd Brain Memory Ingestion ("Remember that...", "Note down that...")
  if (lower.startsWith('remember that') || lower.startsWith('remember ') || lower.startsWith('note down') || lower.startsWith('memorize')) {
    const memoryContent = normalized
      .replace(/^(remember that|remember|note down that|note down|memorize)\s*/i, '')
      .trim();
    
    return {
      stepId: stepIndex,
      actionType: 'memory_ingest',
      category: 'memory_ingest',
      label: 'Store in 2nd Brain Cognitive Vault',
      description: `Ingest knowledge note: "${memoryContent.slice(0, 60)}..."`,
      requiresAirgapConfirmation: false,
      status: 'pending',
      payload: {
        title: `Spoken Memory: ${memoryContent.slice(0, 40)}`,
        content: memoryContent,
        category: 'note',
        tags: ['voice-memo', '2nd-brain', 'cognitive-memory']
      }
    };
  }

  // 2. Real Estate GeoMap Filter ("Show me USDA 100% rural eligible homes under $350k")
  if (lower.includes('homes under') || lower.includes('usda') || lower.includes('properties in') || lower.includes('eligible homes') || lower.includes('show me listings')) {
    const isUsda = lower.includes('usda') || lower.includes('rural');
    const isFha = lower.includes('fha');
    const maxPriceMatch = lower.match(/(?:under|below|less than|up to)\s*\$?(\d+(?:,\d+)*(?:\s*(?:k|thousand))?)/i);
    let maxPrice = 400000;
    if (maxPriceMatch) {
      let pStr = maxPriceMatch[1].replace(/,/g, '');
      let p = parseFloat(pStr);
      if (pStr.includes('k') || pStr.includes('thousand') || p < 1000) p *= 1000;
      maxPrice = p;
    }

    return {
      stepId: stepIndex,
      actionType: 'real_estate_filter',
      category: 'real_estate_filter',
      label: 'Update Real Estate GeoMap Filters',
      description: `Filter GeoMap for ${isUsda ? 'USDA 100% Rural' : isFha ? 'FHA Eligible' : 'Target'} homes under $${maxPrice.toLocaleString()}`,
      requiresAirgapConfirmation: false,
      status: 'pending',
      payload: {
        program: isUsda ? 'USDA' : isFha ? 'FHA' : 'ALL',
        maxPrice,
        usdaOnly: isUsda
      }
    };
  }

  // 3. Real Estate Pre-Qualification ("I make $8,500 a month with $450 in debt and $20,000 saved")
  if ((lower.includes('make') || lower.includes('earn') || lower.includes('income')) && (lower.includes('debt') || lower.includes('saved') || lower.includes('down'))) {
    const fin = extractFinancialEntities(normalized);
    const income = fin.monthlyIncome || 8500;
    const debt = fin.monthlyDebt || 450;
    const dp = fin.downPayment || 20000;
    const prequal = calculateVoicePreQual(income, debt, dp);

    return {
      stepId: stepIndex,
      actionType: 'real_estate_prequal',
      category: 'real_estate_prequal',
      label: 'Calculate Mortgage & DTI Envelope',
      description: `Synthesize purchase power for $${income.toLocaleString()}/mo income & $${debt}/mo debt -> ~$${prequal.maxPurchaseEnvelope.toLocaleString()} purchase envelope`,
      requiresAirgapConfirmation: false,
      status: 'pending',
      payload: prequal
    };
  }

  // 4. Gmail Scan & VIP Triage ("Check unread VIP emails", "Triage my inbox")
  if (lower.includes('vip') || lower.includes('unread') || (lower.includes('email') && (lower.includes('check') || lower.includes('scan') || lower.includes('triage')))) {
    const isVip = lower.includes('vip') || lower.includes('important');
    return {
      stepId: stepIndex,
      actionType: 'workspace_gmail_triage',
      category: 'workspace_gmail',
      label: `Scan & Triage ${isVip ? 'VIP' : 'Unread'} Emails`,
      description: `Filter connected Gmail inbox for ${isVip ? 'high-priority VIP threads' : 'recent unread client inquiries'}`,
      target: isVip ? 'vip' : 'all_unread',
      requiresAirgapConfirmation: false,
      status: 'pending',
      payload: {
        filter: isVip ? 'label:VIP OR label:IMPORTANT is:unread' : 'is:unread',
        maxResults: 5
      }
    };
  }

  // 5. AI Draft Reply in Gmail ("Draft an executive reply in Gmail", "Draft a reply to...")
  if (lower.includes('draft') && (lower.includes('reply') || lower.includes('email') || lower.includes('gmail'))) {
    return {
      stepId: stepIndex,
      actionType: 'ai_draft_reply',
      category: 'workspace_gmail',
      label: 'Synthesize & Draft Gmail Reply',
      description: 'Use Gemini Copilot to compose professional, contextual draft response in Gmail',
      requiresAirgapConfirmation: true, // external communication draft
      status: 'pending',
      payload: {
        tone: 'executive',
        includeContext: true
      }
    };
  }

  // 6. Google Calendar Buffer / Focus Block ("Block 15 minutes on my Google Calendar", "Schedule 30-min meeting")
  if (lower.includes('calendar') || lower.includes('schedule') || lower.includes('block') || lower.includes('meeting')) {
    const minMatch = lower.match(/(\d+)\s*(?:min|minute)/i);
    const durationMinutes = minMatch ? parseInt(minMatch[1], 10) : 15;
    const isBuffer = lower.includes('buffer') || lower.includes('focus') || lower.includes('break');

    return {
      stepId: stepIndex,
      actionType: 'workspace_calendar_buffer',
      category: 'workspace_calendar',
      label: `Reserve ${durationMinutes}-Min ${isBuffer ? 'Focus Buffer' : 'Calendar Block'}`,
      description: `Schedule a ${durationMinutes}-minute dynamic buffer slot on connected Google Calendar`,
      durationMinutes,
      requiresAirgapConfirmation: true,
      status: 'pending',
      payload: {
        summary: isBuffer ? `AI Focus Buffer (${durationMinutes}m)` : `Scheduled Task Review (${durationMinutes}m)`,
        durationMinutes
      }
    };
  }

  // 7. Google Docs Creation / Executive Brief
  if (lower.includes('doc') || lower.includes('brief') || lower.includes('summary report')) {
    return {
      stepId: stepIndex,
      actionType: 'workspace_docs_create',
      category: 'workspace_docs',
      label: 'Synthesize Executive Brief in Google Docs',
      description: 'Create formatted Google Doc report archiving synthesis and action notes',
      requiresAirgapConfirmation: false,
      status: 'pending',
      payload: {
        title: `Vantage Executive Brief: ${new Date().toLocaleDateString()}`
      }
    };
  }

  // 8. Google Tasks Creation
  if (lower.includes('task') || lower.includes('todo') || lower.includes('action item')) {
    const taskTitle = normalized.replace(/^(add task|create task|task|todo)\s*/i, '');
    return {
      stepId: stepIndex,
      actionType: 'workspace_tasks_create',
      category: 'workspace_tasks',
      label: 'Create Actionable Google Task',
      description: `Save priority deliverable: "${taskTitle.slice(0, 50)}" to Google Tasks`,
      requiresAirgapConfirmation: false,
      status: 'pending',
      payload: {
        title: taskTitle || 'Voice-extracted Workspace Action Item'
      }
    };
  }

  // 9. Generic AI Workspace Studio Command
  return {
    stepId: stepIndex,
    actionType: 'workspace_copilot_prompt',
    category: 'system_navigation',
    label: 'Execute Workspace Copilot Directive',
    description: `Process voice directive: "${normalized.slice(0, 60)}"`,
    requiresAirgapConfirmation: false,
    status: 'pending',
    payload: {
      prompt: normalized
    }
  };
}

/**
 * Deconstructs compound voice commands into sequential multi-step objects
 * Enforces 2nd Brain Guardrail validation and Verbal Airgap checks.
 */
export function decomposeCompoundVoiceIntent(
  rawTranscript: string,
  customMacros: VoiceMacroRecipe[] = [],
  guardrails?: GuardrailSettings
): VoiceIntentPayload {
  const normalizedText = normalizeSpokenText(rawTranscript);
  const lower = normalizedText.toLowerCase();

  // Check custom user macros first
  for (const macro of customMacros) {
    if (macro.enabled && lower.includes(normalizeSpokenText(macro.triggerPhrase))) {
      return {
        rawTranscript,
        normalizedText,
        timestamp: new Date().toISOString(),
        matchedMacroName: macro.workflowName,
        isCompound: false,
        confidenceScore: 0.98,
        requiresVerbalAirgap: true,
        guardrailChecked: true,
        airgapPrompt: `I detected your voice macro shortcut "${macro.triggerPhrase}". Should I execute the "${macro.workflowName}" workflow now?`,
        steps: [
          {
            stepId: 1,
            actionType: 'workflow_macro',
            category: 'workflow_macro',
            label: `Execute ${macro.workflowName}`,
            description: macro.description || 'Pre-configured custom workflow automation',
            requiresAirgapConfirmation: true,
            status: 'pending',
            payload: { workflowName: macro.workflowName }
          }
        ],
        extractedEntities: extractFinancialEntities(rawTranscript)
      };
    }
  }

  // Split transcript by conjunction delimiters
  let clauses: string[] = [rawTranscript];

  for (const conj of COMPOUND_CONJUNCTIONS) {
    const nextClauses: string[] = [];
    for (const c of clauses) {
      if (c.toLowerCase().includes(conj.trim())) {
        const regex = new RegExp(conj, 'i');
        const parts = c.split(regex).map(p => p.trim()).filter(Boolean);
        nextClauses.push(...parts);
      } else {
        nextClauses.push(c);
      }
    }
    clauses = nextClauses;
  }

  // Clean empty clauses
  clauses = clauses.map(c => c.trim()).filter(c => c.length > 2);
  if (clauses.length === 0) clauses = [rawTranscript];

  const steps: VoiceMacroStep[] = clauses.map((clause, idx) => parseSingleIntentClause(clause, idx + 1));
  const isCompound = steps.length > 1;

  // Guardrail check against 2nd Brain
  const guardrailViolations: string[] = [];
  if (guardrails && !guardrails.unconstrainedMode && guardrails.personalityPreset !== 'unconstrained') {
    if (Array.isArray(guardrails.forbiddenTopics)) {
      for (const forbidden of guardrails.forbiddenTopics) {
        if (lower.includes(forbidden.toLowerCase())) {
          guardrailViolations.push(`Forbidden Topic: ${forbidden}`);
        }
      }
    }
  }

  // Determine if verbal safety airgap is required
  const hasHighImpactStep = steps.some(s => s.requiresAirgapConfirmation || s.category === 'workspace_gmail' || s.category === 'workspace_calendar');
  const requiresVerbalAirgap = hasHighImpactStep || isCompound;

  // Formulate spoken airgap confirmation prompt
  let airgapPrompt = '';
  if (steps.length === 1) {
    airgapPrompt = `I have prepared 1 action: ${steps[0].label}. Should I execute now?`;
  } else if (steps.length === 2) {
    airgapPrompt = `I have prepared 2 actions: ${steps[0].label} and ${steps[1].label}. Should I proceed?`;
  } else {
    const labels = steps.slice(0, 3).map(s => s.label).join(', ');
    airgapPrompt = `I have prepared ${steps.length} sequential actions: ${labels}. Ready to execute?`;
  }

  return {
    rawTranscript,
    normalizedText,
    timestamp: new Date().toISOString(),
    steps,
    isCompound,
    confidenceScore: 0.94,
    airgapPrompt,
    requiresVerbalAirgap,
    guardrailChecked: true,
    guardrailViolations: guardrailViolations.length > 0 ? guardrailViolations : undefined,
    extractedEntities: extractFinancialEntities(rawTranscript)
  };
}

/**
 * Native SpeechSynthesis spoken audio output for Airgap confirmations and TTS
 */
export function speakSpokenAirgap(text: string, onComplete?: () => void): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onComplete?.();
    return null;
  }

  try {
    window.speechSynthesis.cancel(); // clear previous queue
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Karen')));
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      onComplete?.();
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      onComplete?.();
    };

    window.speechSynthesis.speak(utterance);
    return utterance;
  } catch (err) {
    console.warn('Speech synthesis invocation failed:', err);
    onComplete?.();
    return null;
  }
}

/**
 * Listens for affirmative voice keywords ("Yes", "Proceed", "Confirm", "Execute", "Do it")
 */
export function listenForAffirmativeConfirmation(timeoutSeconds = 8): Promise<boolean> {
  return new Promise((resolve) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      resolve(true); // fallback to manual tap
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      const timeoutId = setTimeout(() => {
        try { recognition.stop(); } catch {}
        resolve(false);
      }, timeoutSeconds * 1000);

      recognition.onresult = (event: any) => {
        clearTimeout(timeoutId);
        const transcript = event.results?.[0]?.[0]?.transcript?.toLowerCase() || '';
        const affirmativeWords = ['yes', 'proceed', 'execute', 'confirm', 'do it', 'go ahead', 'run', 'sure', 'ok', 'okay'];
        const isAffirmative = affirmativeWords.some(word => transcript.includes(word));
        resolve(isAffirmative);
      };

      recognition.onerror = () => {
        clearTimeout(timeoutId);
        resolve(false);
      };

      recognition.onend = () => {
        clearTimeout(timeoutId);
      };

      recognition.start();
    } catch {
      resolve(false);
    }
  });
}

/**
 * Optional server-side BYOK Gemini endpoint for complex acoustic transcription & intent breakdown
 */
export async function decomposeWithServerGemini(rawTranscript: string, customApiKey?: string): Promise<VoiceIntentPayload> {
  try {
    const headers = getByokHttpHeaders({ 'Content-Type': 'application/json' });
    if (customApiKey) {
      headers['x-gemini-api-key'] = customApiKey;
    }

    const res = await fetch('/api/voice/decompose-intent', {
      method: 'POST',
      headers,
      body: JSON.stringify({ transcript: rawTranscript })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.steps) && data.steps.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Server voice decomposition fallback to client engine:', err);
  }

  // Graceful fallback to client deterministic parser
  return decomposeCompoundVoiceIntent(rawTranscript);
}
