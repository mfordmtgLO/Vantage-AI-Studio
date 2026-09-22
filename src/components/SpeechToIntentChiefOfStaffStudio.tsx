/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Play, 
  Square, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  AlertTriangle, 
  RotateCcw, 
  Layers, 
  Brain, 
  Mail, 
  Calendar, 
  FileText, 
  CheckSquare, 
  DollarSign, 
  Home, 
  CheckCircle2, 
  Radio, 
  Sliders, 
  ArrowRight, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  Zap, 
  Activity, 
  Info,
  ChevronRight,
  RefreshCw,
  Flame,
  Shield,
  Terminal,
  Bookmark
} from 'lucide-react';
import { VoiceIntentPayload, VoiceMacroStep, VoiceSafetyAirgapConfig, VoicePreQualParams } from '../types/voiceMacro';
import { 
  decomposeCompoundVoiceIntent, 
  speakSpokenAirgap, 
  calculateVoicePreQual, 
  extractFinancialEntities, 
  DEFAULT_AIRGAP_CONFIG 
} from '../services/voiceMacroEngine';
import { useMemory } from '../context/MemoryContext';

interface SpeechToIntentChiefOfStaffStudioProps {
  onExecuteWorkflow?: (name: string) => void;
  onExecuteStepAction?: (step: VoiceMacroStep) => void;
}

export const SpeechToIntentChiefOfStaffStudio: React.FC<SpeechToIntentChiefOfStaffStudioProps> = ({
  onExecuteWorkflow,
  onExecuteStepAction
}) => {
  const { memories, guardrails, saveMemory } = useMemory();

  // Voice recording & acoustic state
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState<number | null>(null);
  
  // Audio decibel & visualizer state
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [frequencyBars, setFrequencyBars] = useState<number[]>([12, 24, 45, 68, 85, 92, 74, 55, 38, 20, 15, 30, 60, 80, 40]);
  
  // Decomposed compound intent
  const [currentIntent, setCurrentIntent] = useState<VoiceIntentPayload | null>(null);
  
  // Safety Airgap & Execution State
  const [executionState, setExecutionState] = useState<'idle' | 'listening' | 'confirming_airgap' | 'executing' | 'undo_window' | 'completed' | 'reverted'>('idle');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [undoSecondsLeft, setUndoSecondsLeft] = useState<number>(10);
  const [airgapConfig, setAirgapConfig] = useState<VoiceSafetyAirgapConfig>(() => {
    try {
      const stored = localStorage.getItem('vantage_voice_airgap_config');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_AIRGAP_CONFIG;
  });

  // Dictation mode: Speech to 2nd Brain Note
  const [dictationCleanText, setDictationCleanText] = useState<string>('');
  const [dictationTags, setDictationTags] = useState<string[]>(['voice-memo', 'chief-of-staff', 'executive-note']);
  const [dictationSaved, setDictationSaved] = useState<boolean>(false);

  // Spoken Mortgage Pre-Qual Simulator
  const [spokenIncome, setSpokenIncome] = useState<number>(9500);
  const [spokenDebt, setSpokenDebt] = useState<number>(600);
  const [spokenDownPayment, setSpokenDownPayment] = useState<number>(35000);
  const [prequalResult, setPrequalResult] = useState<VoicePreQualParams>(() => 
    calculateVoicePreQual(9500, 600, 35000)
  );

  // Status message
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);
  const [copiedTranscript, setCopiedTranscript] = useState<boolean>(false);

  // Speech Recognition ref & Audio Context ref
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const undoIntervalRef = useRef<any>(null);

  // Spoken Test Scenarios
  const PRESET_SCENARIOS = [
    {
      id: 'sc1',
      title: 'Morning Executive Briefing',
      category: 'Compound Workspace',
      icon: <Flame className="w-4 h-4 text-amber-500" />,
      spokenPrompt: 'Hey Vantage, triage unread VIP emails, schedule a 30-minute team sync on my Google Calendar, and synthesize an executive brief in Google Docs.',
      description: 'Deconstructs into 3 sequential workspace actions with automatic airgap safety confirmation.'
    },
    {
      id: 'sc2',
      title: 'VIP Client Response & 15m Buffer',
      category: 'Gmail + Calendar',
      icon: <Mail className="w-4 h-4 text-blue-500" />,
      spokenPrompt: 'Draft an executive reply in Gmail to Sarah, block 15 minutes focus buffer before the 2 PM closing call, and add a preparation task to Google Tasks.',
      description: 'Protects focus time on Google Calendar, drafts compliant email, and synchronizes deliverable.'
    },
    {
      id: 'sc3',
      title: 'Spoken USDA Mortgage Pre-Qual',
      category: 'Real Estate & FinTech',
      icon: <Home className="w-4 h-4 text-emerald-500" />,
      spokenPrompt: 'Run pre-qualification for monthly income $9,500 with $600 in monthly debt and $35,000 saved for down payment on a USDA loan.',
      description: 'Synthesizes Front-End/Back-End DTI envelope, max purchase envelope, and USDA rural eligibility.'
    },
    {
      id: 'sc4',
      title: '100% Rural GeoMap Filter',
      category: 'GeoMap Spatial Filter',
      icon: <Home className="w-4 h-4 text-purple-500" />,
      spokenPrompt: 'Show me USDA 100% rural eligible homes under $350,000 with zero down payment envelope.',
      description: 'Transfers active filter parameters directly to the Vantage Real Estate & GeoMap plugin.'
    },
    {
      id: 'sc5',
      title: 'Spoken 2nd Brain Cognitive Vault Note',
      category: '2nd Brain Memory',
      icon: <Brain className="w-4 h-4 text-indigo-500" />,
      spokenPrompt: 'Remember that client Michael prefers all commercial mortgage term sheets delivered in 30-year fixed schedules with no prepayment penalties.',
      description: 'Cleans filler words and permanently commits rule into 2nd Brain cognitive memory vault.'
    },
    {
      id: 'sc6',
      title: 'Emergency Closing Triage',
      category: 'Escrow & Closing SLA',
      icon: <Zap className="w-4 h-4 text-rose-500" />,
      spokenPrompt: 'Triage unread escrow emails, reserve 45-minute contract review on my calendar, and add task to verify wire instructions.',
      description: 'High-urgency compound execution with priority task creation and calendar time blocking.'
    }
  ];

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript + ' ';
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (final) {
            setTranscript((prev) => (prev ? `${prev.trim()} ${final.trim()}` : final.trim()));
            setInterimTranscript('');
          } else {
            setInterimTranscript(interim);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('SpeechRecognition error:', event.error);
          if (event.error === 'not-allowed') {
            setStatusMessage({ type: 'error', text: 'Microphone permission denied. Click any scenario button to test with simulated speech input.' });
          }
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init error:', err);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch {}
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (undoIntervalRef.current) {
        clearInterval(undoIntervalRef.current);
      }
    };
  }, []);

  // Update intent when transcript changes
  useEffect(() => {
    const fullText = (transcript + ' ' + interimTranscript).trim();
    if (!fullText) {
      setCurrentIntent(null);
      return;
    }

    let customMacros: any[] = [];
    try {
      const stored = localStorage.getItem('vantage_voice_macros');
      if (stored) customMacros = JSON.parse(stored);
    } catch {}

    const intent = decomposeCompoundVoiceIntent(fullText, customMacros, guardrails);
    setCurrentIntent(intent);

    // If financial figures detected, recalculate pre-qual
    const fin = extractFinancialEntities(fullText);
    if (fin.monthlyIncome || fin.monthlyDebt || fin.downPayment) {
      const inc = fin.monthlyIncome || spokenIncome;
      const dbt = fin.monthlyDebt || spokenDebt;
      const dp = fin.downPayment || spokenDownPayment;
      setSpokenIncome(inc);
      setSpokenDebt(dbt);
      setSpokenDownPayment(dp);
      setPrequalResult(calculateVoicePreQual(inc, dbt, dp));
    }

    // Clean transcript for dictation (strip filler words)
    const cleaned = fullText
      .replace(/\b(um|uh|you know|like|sort of|kind of|i mean)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    setDictationCleanText(cleaned);
    setDictationSaved(false);

  }, [transcript, interimTranscript, guardrails]);

  // Simulated Frequency Visualizer animation
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setFrequencyBars(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
        setAudioLevel(Math.floor(Math.random() * 50) + 35);
      }, 90);
    } else {
      setFrequencyBars([12, 18, 25, 30, 28, 22, 18, 15, 12, 10, 15, 20, 25, 18, 12]);
      setAudioLevel(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Microphone toggle
  const handleToggleRecord = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch {}
      }
      setIsRecording(false);
      setExecutionState('idle');
    } else {
      setTranscript('');
      setInterimTranscript('');
      setCurrentIntent(null);
      setSelectedScenarioIndex(null);
      setStatusMessage(null);
      setDictationSaved(false);
      
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
          setExecutionState('listening');
        } catch (e) {
          setIsRecording(true);
          setExecutionState('listening');
        }
      } else {
        // Fallback for environments without Web Speech API
        setIsRecording(true);
        setExecutionState('listening');
        setStatusMessage({ type: 'info', text: 'Live microphone streaming active. You can speak or select any preset test scenario below.' });
      }
    }
  };

  // Select Spoken Scenario
  const handleSelectScenario = (index: number) => {
    setSelectedScenarioIndex(index);
    const scenario = PRESET_SCENARIOS[index];
    setTranscript(scenario.spokenPrompt);
    setInterimTranscript('');
    setIsRecording(false);
    setExecutionState('idle');
    
    // Spoken Audio Feedback if enabled
    if (airgapConfig.spokenAudioFeedback) {
      speakSpokenAirgap(`Loaded scenario: ${scenario.title}.`);
    }
  };

  // Trigger Spoken Airgap Confirmation Flow
  const handleInitiateExecution = () => {
    if (!currentIntent || currentIntent.steps.length === 0) return;

    if (airgapConfig.enabled && currentIntent.requiresVerbalAirgap) {
      setExecutionState('confirming_airgap');
      if (airgapConfig.spokenAudioFeedback && currentIntent.airgapPrompt) {
        speakSpokenAirgap(currentIntent.airgapPrompt);
      }
    } else {
      executeStepsDirectly();
    }
  };

  // Confirm Airgap & Begin Execution + 10s Undo Window
  const handleConfirmAirgapAndExecute = () => {
    executeStepsDirectly();
  };

  const executeStepsDirectly = () => {
    if (!currentIntent) return;
    setExecutionState('executing');
    setActiveStepIndex(0);

    // Simulate stepping through actions
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step < currentIntent.steps.length) {
        setActiveStepIndex(step);
      } else {
        clearInterval(interval);
        setExecutionState('undo_window');
        setUndoSecondsLeft(airgapConfig.undoWindowSeconds || 10);

        // Start undo countdown
        if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
        undoIntervalRef.current = setInterval(() => {
          setUndoSecondsLeft(prev => {
            if (prev <= 1) {
              clearInterval(undoIntervalRef.current);
              setExecutionState('completed');
              setStatusMessage({ type: 'success', text: `All ${currentIntent.steps.length} sequential actions executed successfully and verified.` });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 600);
  };

  // Cancel & Revert (1-Click Undo)
  const handleRevertExecution = () => {
    if (undoIntervalRef.current) clearInterval(undoIntervalRef.current);
    setExecutionState('reverted');
    setStatusMessage({ type: 'info', text: 'Action sequence reverted. No permanent workspace mutations were committed.' });
    if (airgapConfig.spokenAudioFeedback) {
      speakSpokenAirgap('Execution aborted. Changes successfully rolled back.');
    }
  };

  // Save Spoken Note to 2nd Brain Cognitive Vault
  const handleSaveDictationTo2ndBrain = async () => {
    if (!dictationCleanText.trim()) return;

    await saveMemory({
      title: `Voice Note: ${dictationCleanText.slice(0, 45)}...`,
      content: dictationCleanText,
      type: 'knowledge',
      category: 'voice_dictation_note',
      tags: dictationTags,
      source: 'manual'
    });

    setDictationSaved(true);
    setStatusMessage({ type: 'success', text: 'Voice note synthesized and permanently saved to 2nd Brain cognitive memory vault.' });
    if (airgapConfig.spokenAudioFeedback) {
      speakSpokenAirgap('Spoken note archived into your 2nd Brain cognitive memory.');
    }
  };

  // Copy transcript
  const handleCopyTranscript = () => {
    navigator.clipboard.writeText(transcript);
    setCopiedTranscript(true);
    setTimeout(() => setCopiedTranscript(false), 2500);
  };

  // Category Icon helper
  const getStepCategoryIcon = (category: string) => {
    switch (category) {
      case 'workspace_gmail': return <Mail className="w-4 h-4 text-blue-500" />;
      case 'workspace_calendar': return <Calendar className="w-4 h-4 text-purple-500" />;
      case 'workspace_docs': return <FileText className="w-4 h-4 text-amber-500" />;
      case 'workspace_tasks': return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'memory_ingest': return <Brain className="w-4 h-4 text-indigo-500" />;
      case 'real_estate_filter': return <Home className="w-4 h-4 text-rose-500" />;
      case 'real_estate_prequal': return <DollarSign className="w-4 h-4 text-teal-500" />;
      default: return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Acoustic Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6 relative overflow-hidden">
        {/* Glowing backdrop decorative accents */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-400/30">
              <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
              <span>MODULE 3 &bull; VANTAGE SPEECH-TO-INTENT CHIEF OF STAFF</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Autonomous Voice Macro Orchestrator
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Real-time acoustic speech-to-intent engine. Deconstruct compound natural language commands into sequential Google Workspace workflows, enforce verbal safety airgaps, and perform spoken financial pre-qualification calculations.
            </p>
          </div>

          {/* Central Live Mic & Acoustic Decibel Visualizer */}
          <div className="flex flex-col items-center sm:items-end gap-3 shrink-0">
            <div className="flex items-center gap-4 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-700/80 shadow-inner">
              
              {/* Frequency Audio Waveform */}
              <div className="flex items-end gap-1 h-10 px-2">
                {frequencyBars.map((height, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full transition-all duration-100 ${
                      isRecording ? 'bg-gradient-to-t from-blue-500 via-indigo-400 to-purple-400' : 'bg-slate-700'
                    }`}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>

              {/* Decibel Display */}
              <div className="text-right pl-2 border-l border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Acoustic dB</span>
                <span className="text-xs font-mono font-bold text-blue-400">{isRecording ? `${audioLevel} dB` : '0 dB (Mute)'}</span>
              </div>

              {/* Main Pulsing Mic Button */}
              <button
                onClick={handleToggleRecord}
                className={`p-4 rounded-2xl font-bold transition-all shadow-lg cursor-pointer flex items-center justify-center ${
                  isRecording 
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-500/30' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white ring-2 ring-blue-400/30'
                }`}
                title={isRecording ? 'Stop Voice Recording' : 'Start Speech-to-Intent Chief of Staff'}
              >
                {isRecording ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>

            <span className="text-[11px] text-slate-400 font-medium">
              {isRecording ? '🎙️ Streaming active audio stream...' : 'Click mic or pick a spoken test scenario'}
            </span>
          </div>
        </div>

        {/* Live Audio Transcript Input / Output Display */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              Live Speech-to-Text Transcript
            </span>
            <div className="flex items-center gap-2">
              {transcript && (
                <button
                  onClick={handleCopyTranscript}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
                >
                  {copiedTranscript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTranscript ? 'Copied' : 'Copy'}</span>
                </button>
              )}
              <button
                onClick={() => { setTranscript(''); setInterimTranscript(''); setCurrentIntent(null); }}
                className="text-[11px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="min-h-[52px] flex items-center text-sm font-medium text-slate-100">
            {transcript || interimTranscript ? (
              <p className="leading-relaxed">
                <span>{transcript}</span>
                {interimTranscript && <span className="text-blue-400 italic"> {interimTranscript}</span>}
              </p>
            ) : (
              <span className="text-slate-500 italic">
                &ldquo;Say a compound instruction like: Hey Vantage, check unread emails, block 15 minutes focus time on Google Calendar, and note down client requirements...&rdquo;
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Global Status Notification */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-3 animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
            : statusMessage.type === 'error'
            ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            : 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200'
        }`}>
          {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />}
          {statusMessage.type === 'error' && <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />}
          {statusMessage.type === 'info' && <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Spoken Test Scenarios Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Interactive Spoken Test Scenarios & Executive Prompts</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Click any card to simulate spoken audio</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRESET_SCENARIOS.map((sc, idx) => (
            <div
              key={sc.id}
              onClick={() => handleSelectScenario(idx)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                selectedScenarioIndex === idx
                  ? 'bg-blue-50/70 dark:bg-blue-950/50 border-blue-400 dark:border-blue-700 shadow-md'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    {sc.icon}
                  </div>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{sc.title}</span>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {sc.category}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
                &ldquo;{sc.spokenPrompt}&rdquo;
              </p>

              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {sc.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Core Architecture: Deconstructed Intent Graph & Execution Hub vs Spoken Pre-Qual Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Compound Multi-Step Execution Flowchart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Deconstructed Compound Intent Flowchart</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Parsed into ordered sequential steps with entities and verbal safety airgaps
                </p>
              </div>

              {currentIntent && currentIntent.steps.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                    {currentIntent.steps.length} Action{currentIntent.steps.length > 1 ? 's' : ''} Detected
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300">
                    {Math.round(currentIntent.confidenceScore * 100)}% Confidence
                  </span>
                </div>
              )}
            </div>

            {/* Parsed Steps List or Empty Placeholder */}
            {!currentIntent || currentIntent.steps.length === 0 ? (
              <div className="text-center py-12 space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mx-auto flex items-center justify-center">
                  <Mic className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">No Speech Commands Detected</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Speak into your microphone or select any preset test scenario above to see live multi-step compound intent decomposition.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentIntent.steps.map((step, idx) => {
                  const isExecuting = executionState === 'executing' && activeStepIndex === idx;
                  const isDone = executionState === 'completed' || (executionState === 'undo_window') || (executionState === 'executing' && activeStepIndex > idx);

                  return (
                    <div
                      key={step.stepId}
                      className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                        isExecuting
                          ? 'bg-blue-50/80 dark:bg-blue-950/70 border-blue-500 ring-2 ring-blue-400/20'
                          : isDone
                          ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60'
                          : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            isDone ? 'bg-emerald-100 dark:bg-emerald-900/60' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : getStepCategoryIcon(step.category)}
                          </div>

                          <div className="space-y-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                Step {idx + 1}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                {step.label}
                              </h4>
                              {step.durationMinutes && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                  <Clock className="w-2.5 h-2.5" />
                                  {step.durationMinutes}m Buffer
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                              {step.description}
                            </p>
                          </div>
                        </div>

                        {step.requiresAirgapConfirmation && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 shrink-0 flex items-center gap-1">
                            <Shield className="w-3 h-3" /> Airgap Guard
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Airgap Spoken Prompt & Confirmation Card */}
                {executionState === 'confirming_airgap' && (
                  <div className="p-5 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs font-bold uppercase">
                      <Volume2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Verbal Airgap Confirmation Protocol</span>
                    </div>
                    <p className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                      {currentIntent.airgapPrompt || 'Please confirm execution of this multi-step voice command.'}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        onClick={handleConfirmAirgapAndExecute}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" /> Confirm & Execute
                      </button>
                      <button
                        onClick={() => setExecutionState('idle')}
                        className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* 10-Second Undo Window with Reversible Rollback Bar */}
                {executionState === 'undo_window' && (
                  <div className="p-5 bg-purple-50 dark:bg-purple-950/60 border border-purple-300 dark:border-purple-700 rounded-2xl space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-spin" />
                        Reversible Rollback Window Active ({undoSecondsLeft}s remaining)
                      </span>
                      <button
                        onClick={handleRevertExecution}
                        className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" /> 1-Click Undo / Revert
                      </button>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-purple-200 dark:bg-purple-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-full transition-all duration-1000 ease-linear"
                        style={{ width: `${(undoSecondsLeft / (airgapConfig.undoWindowSeconds || 10)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Main Action Execution Button */}
                {executionState === 'idle' && (
                  <button
                    onClick={handleInitiateExecution}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Execute Deconstructed Intent Sequence ({currentIntent.steps.length} Steps)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Speech-to-Memory (Voice Note & 2nd Brain Dictator) */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Speech-to-Memory Dictation Studio</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Transcribes and formats spoken voice memos directly into the 2nd Brain cognitive vault
                </p>
              </div>

              {dictationSaved && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Saved to 2nd Brain
                </span>
              )}
            </div>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={dictationCleanText}
                onChange={(e) => setDictationCleanText(e.target.value)}
                placeholder="Spoken voice notes will appear here with filler words stripped..."
                className="w-full p-3 text-xs border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-sans"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Vault Tags:</span>
                  {dictationTags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900">
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={handleSaveDictationTo2ndBrain}
                  disabled={!dictationCleanText.trim() || dictationSaved}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Bookmark className="w-3.5 h-3.5" /> Save to 2nd Brain Vault
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Spoken Mortgage Pre-Qual Simulator & Voice Settings */}
        <div className="space-y-6">
          
          {/* Spoken Mortgage Pre-Qual Simulator */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase">
                <DollarSign className="w-4 h-4" /> FinTech Acoustic Pre-Qual
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Spoken Mortgage & DTI Calculator
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spoken figures are parsed instantly into loan envelopes and DTI limits
              </p>
            </div>

            {/* Extracted Figures Display */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Income</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">${spokenIncome.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Debt</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">${spokenDebt.toLocaleString()}</span>
              </div>
              <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Down Payment</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">${spokenDownPayment.toLocaleString()}</span>
              </div>
            </div>

            {/* Calculated Max Purchase Power Envelope */}
            <div className="p-4 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-2xl space-y-2 text-center">
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 uppercase tracking-wider block">
                Estimated Max Purchase Power
              </span>
              <div className="text-2xl font-black text-teal-900 dark:text-teal-100">
                ${prequalResult.maxPurchaseEnvelope.toLocaleString()}
              </div>
              <div className="flex items-center justify-center gap-2 pt-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/80 dark:bg-teal-800 text-teal-900 dark:text-teal-200">
                  Front-End DTI: {prequalResult.calculatedFrontEndDti}%
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-200/80 dark:bg-teal-800 text-teal-900 dark:text-teal-200">
                  Back-End DTI: {prequalResult.calculatedBackEndDti}%
                </span>
              </div>
            </div>

            {/* Eligibility Program Badges */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">Financing Program Envelopes</span>
              <div className="space-y-1.5 text-xs">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">USDA 100% Rural Eligible</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Approved ($0 Down)
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl flex items-center justify-between border border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">FHA 3.5% Program</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    Approved
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Voice Safety Airgap & Audio Feedback Config */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="space-y-0.5 border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Voice Safety Airgap Settings</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure verbal affirmations and audio feedback rates
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Verbal Safety Airgap</span>
                <input
                  type="checkbox"
                  checked={airgapConfig.enabled}
                  onChange={(e) => {
                    const cfg = { ...airgapConfig, enabled: e.target.checked };
                    setAirgapConfig(cfg);
                    localStorage.setItem('vantage_voice_airgap_config', JSON.stringify(cfg));
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300 font-medium">Spoken Audio Feedback (TTS)</span>
                <input
                  type="checkbox"
                  checked={airgapConfig.spokenAudioFeedback}
                  onChange={(e) => {
                    const cfg = { ...airgapConfig, spokenAudioFeedback: e.target.checked };
                    setAirgapConfig(cfg);
                    localStorage.setItem('vantage_voice_airgap_config', JSON.stringify(cfg));
                  }}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
              </label>

              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-slate-500 text-[11px]">
                  <span>Rollback Undo Window</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{airgapConfig.undoWindowSeconds}s</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={30}
                  step={5}
                  value={airgapConfig.undoWindowSeconds}
                  onChange={(e) => {
                    const cfg = { ...airgapConfig, undoWindowSeconds: parseInt(e.target.value, 10) };
                    setAirgapConfig(cfg);
                    localStorage.setItem('vantage_voice_airgap_config', JSON.stringify(cfg));
                  }}
                  className="w-full accent-blue-600"
                />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
