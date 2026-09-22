/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Copy, 
  CheckCircle2, 
  Volume2, 
  X, 
  Play, 
  Zap, 
  ShieldCheck, 
  Layers, 
  Brain, 
  Home, 
  Mail, 
  Calendar, 
  FileText, 
  CheckSquare, 
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  Radio,
  Sliders
} from 'lucide-react';
import { VoiceMacroStep, VoiceIntentPayload, VoiceSafetyAirgapConfig } from '../types/voiceMacro';
import { 
  decomposeCompoundVoiceIntent, 
  speakSpokenAirgap, 
  listenForAffirmativeConfirmation, 
  DEFAULT_AIRGAP_CONFIG 
} from '../services/voiceMacroEngine';
import { useMemory } from '../context/MemoryContext';

interface GlobalVoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunWorkflowCommand?: (workflowName: string) => void;
  onExecuteVoiceIntent?: (intent: VoiceIntentPayload) => void;
}

export const GlobalVoiceRecorderModal: React.FC<GlobalVoiceRecorderModalProps> = ({ 
  isOpen, 
  onClose, 
  onRunWorkflowCommand,
  onExecuteVoiceIntent
}) => {
  const { guardrails, saveMemory } = useMemory();

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [airgapConfig, setAirgapConfig] = useState<VoiceSafetyAirgapConfig>(DEFAULT_AIRGAP_CONFIG);
  
  // Compound Intent Decomposition state
  const [decomposedIntent, setDecomposedIntent] = useState<VoiceIntentPayload | null>(null);
  const [isWaitingAirgapAffirmation, setIsWaitingAirgapAffirmation] = useState<boolean>(false);
  const [isSynthesizingVoice, setIsSynthesizingVoice] = useState<boolean>(false);
  const [engineMode, setEngineMode] = useState<'client_zero_cost' | 'gemini_byok'>('client_zero_cost');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setDecomposedIntent(null);
      setIsWaitingAirgapAffirmation(false);
      setErrorMessage(null);
      startListening();
    } else {
      stopListening();
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  // Whenever transcript changes, run real-time compound intent decomposition
  useEffect(() => {
    if (!transcript.trim()) {
      setDecomposedIntent(null);
      return;
    }

    // Load custom macros
    let customMacros: any[] = [];
    try {
      const stored = localStorage.getItem('vantage_voice_macros');
      if (stored) customMacros = JSON.parse(stored);
    } catch {}

    const parsed = decomposeCompoundVoiceIntent(transcript, customMacros, guardrails);
    setDecomposedIntent(parsed);
  }, [transcript, guardrails]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, Safari, or open in a new tab.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        const fullText = (transcript + ' ' + currentTranscript).trim();
        setTranscript(fullText);
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access was blocked. Please enable microphone permissions in your browser settings.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setErrorMessage('Unable to initialize voice capture: ' + (err?.message || 'unknown error'));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSamplePrompt = (sample: string) => {
    setTranscript(sample);
  };

  const handleExecuteIntent = async () => {
    if (!decomposedIntent) return;

    // Check guardrails
    if (decomposedIntent.guardrailViolations && decomposedIntent.guardrailViolations.length > 0) {
      setErrorMessage(`Action blocked by 2nd Brain Guardrails: ${decomposedIntent.guardrailViolations.join(', ')}`);
      return;
    }

    // If verbal safety airgap is required and audio feedback is enabled, speak prompt
    if (airgapConfig.enabled && airgapConfig.spokenAudioFeedback && decomposedIntent.airgapPrompt && !isWaitingAirgapAffirmation) {
      setIsSynthesizingVoice(true);
      speakSpokenAirgap(decomposedIntent.airgapPrompt, async () => {
        setIsSynthesizingVoice(false);
        if (airgapConfig.requireSpokenAffirmation) {
          setIsWaitingAirgapAffirmation(true);
          const affirmed = await listenForAffirmativeConfirmation(6);
          setIsWaitingAirgapAffirmation(false);
          if (affirmed) {
            proceedWithExecution();
          } else {
            // keep modal open for manual confirmation tap
          }
        } else {
          proceedWithExecution();
        }
      });
      return;
    }

    proceedWithExecution();
  };

  const proceedWithExecution = async () => {
    if (!decomposedIntent) return;

    // 1. Process 2nd Brain Memory ingestion if included
    const memorySteps = decomposedIntent.steps.filter(s => s.category === 'memory_ingest');
    for (const memStep of memorySteps) {
      try {
        await saveMemory({
          title: memStep.payload.title || 'Spoken Voice Note',
          content: memStep.payload.content || memStep.description,
          type: 'knowledge',
          tags: ['voice-memo', '2nd-brain']
        });
      } catch (err) {
        console.warn('Memory save failed:', err);
      }
    }

    // 2. Dispatch intent to App / Snackbar handler
    if (onExecuteVoiceIntent) {
      onExecuteVoiceIntent(decomposedIntent);
    } else if (onRunWorkflowCommand && decomposedIntent.matchedMacroName) {
      onRunWorkflowCommand(decomposedIntent.matchedMacroName);
    } else if (onRunWorkflowCommand) {
      onRunWorkflowCommand('Compound Voice Intent: ' + (decomposedIntent.steps[0]?.label || 'Workspace Action'));
    }

    onClose();
  };

  const getStepCategoryIcon = (category: string) => {
    switch (category) {
      case 'workspace_gmail':
        return <Mail className="w-3.5 h-3.5 text-red-500" />;
      case 'workspace_calendar':
        return <Calendar className="w-3.5 h-3.5 text-blue-500" />;
      case 'workspace_docs':
        return <FileText className="w-3.5 h-3.5 text-indigo-500" />;
      case 'workspace_tasks':
        return <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />;
      case 'memory_ingest':
        return <Brain className="w-3.5 h-3.5 text-purple-500" />;
      case 'real_estate_filter':
      case 'real_estate_prequal':
        return <Home className="w-3.5 h-3.5 text-amber-500" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-5 sm:p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${
              isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white'
            }`}>
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  Vantage Voice Macro Orchestrator
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-extrabold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                  Compound Intent Router
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Continuous speech decomposition with verbal airgap & 2nd Brain integration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="hidden sm:inline-block text-[10px] font-semibold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-md border border-slate-200 dark:border-slate-700">
              ⌘K / Esc
            </kbd>
            <button 
              onClick={onClose} 
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg transition cursor-pointer" 
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Middle Container */}
        <div className="space-y-4 overflow-y-auto pr-1">

          {/* Engine Selector & Guardrail Badge */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-600 dark:text-slate-300 text-[11px]">Speech Engine:</span>
              <button
                onClick={() => setEngineMode('client_zero_cost')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  engineMode === 'client_zero_cost'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                Zero-Cost Client Web Speech
              </button>
              <button
                onClick={() => setEngineMode('gemini_byok')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                  engineMode === 'gemini_byok'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                }`}
              >
                Gemini BYOK Studio Engine
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>2nd Brain Guardrails Active</span>
            </div>
          </div>

          {/* Audio Waveform Equalizer Visualizer */}
          {isRecording && (
            <div className="bg-slate-900 dark:bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-red-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                Listening for compound voice commands...
              </div>
              <div className="flex items-center gap-1">
                {[12, 28, 40, 20, 36, 48, 24, 16, 44, 32, 18, 40, 26, 14].map((h, i) => (
                  <div
                    key={i}
                    className="w-1 bg-gradient-to-t from-red-500 to-amber-400 rounded-full animate-pulse"
                    style={{
                      height: `${Math.max(8, (h * Math.sin(Date.now() / 200 + i)) % 36 + 12)}px`,
                      animationDelay: `${i * 70}ms`
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Spoken Airgap Status Notice */}
          {(isSynthesizingVoice || isWaitingAirgapAffirmation) && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs text-amber-700 dark:text-amber-300 font-semibold">
                <Radio className="w-4 h-4 animate-spin text-amber-500" />
                <span>
                  {isSynthesizingVoice
                    ? 'Speaking Verbal Safety Airgap confirmation...'
                    : 'Listening for affirmative verbal confirmation ("Yes", "Proceed", "Confirm")...'}
                </span>
              </div>
              <button
                onClick={proceedWithExecution}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
              >
                1-Tap Confirm
              </button>
            </div>
          )}

          {/* Live Transcript Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Live Speech Transcript
              </span>
              <div className="flex items-center gap-2">
                {transcript && (
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                )}
                <button
                  onClick={isRecording ? stopListening : startListening}
                  className={`flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition ${
                    isRecording
                      ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-300'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-950 dark:text-blue-300'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3 h-3" /> : <Mic className="w-3 h-3" />}
                  <span>{isRecording ? 'Pause Mic' : 'Resume Mic'}</span>
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak naturally or click a sample below. Say: 'Check unread VIP emails, draft an executive reply in Gmail, and block 15 minutes on my Google Calendar'..."
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-300 dark:border-slate-800 outline-none focus:ring-2 focus:ring-blue-500 resize-none font-medium leading-relaxed"
            />
          </div>

          {/* Decomposed Sequential Steps Visualizer */}
          {decomposedIntent && (
            <div className="space-y-2 bg-slate-50 dark:bg-slate-800/40 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/70">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Deconstructed Action Steps ({decomposedIntent.steps.length})
                  </span>
                </div>
                {decomposedIntent.isCompound && (
                  <span className="text-[10px] px-2 py-0.5 bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 rounded-full font-bold">
                    Compound Conjunction Split
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {decomposedIntent.steps.map((step, idx) => (
                  <div
                    key={step.stepId}
                    className="flex items-start gap-2.5 p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs"
                  >
                    <div className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-xs font-bold text-slate-700 dark:text-slate-300">
                      {idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center gap-2">
                        {getStepCategoryIcon(step.category)}
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {step.label}
                        </h5>
                        {step.requiresAirgapConfirmation && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                            Airgap Verified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Airgap Spoken Prompt Preview */}
              {decomposedIntent.airgapPrompt && (
                <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 rounded-lg border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-200 flex items-start gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Verbal Airgap Prompt: </span>
                    <span>&ldquo;{decomposedIntent.airgapPrompt}&rdquo;</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-900 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>{errorMessage}</div>
            </div>
          )}

          {/* Quick Click Sample Compound Commands */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-blue-500" />
              Compound Recipe Presets:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                {
                  label: 'VIP Inbox Triage & Calendar Buffer',
                  cmd: 'Check unread VIP emails, draft an executive reply in Gmail, and block 15 minutes on my Google Calendar'
                },
                {
                  label: '2nd Brain Note & Loan Strategy',
                  cmd: 'Remember that client John prefers 30-year fixed loans with 5% down and no prepayment penalties'
                },
                {
                  label: 'USDA Real Estate GeoMap Filter',
                  cmd: 'Show me USDA 100% rural eligible homes under $350k in the target area'
                },
                {
                  label: 'Mortgage Pre-Qualification Envelope',
                  cmd: 'I make $8,500 a month with $450 in debt and $20,000 saved for down payment'
                }
              ].map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSamplePrompt(sample.cmd)}
                  className="p-2 text-left bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:border-blue-300 dark:hover:border-blue-700 rounded-xl border border-slate-200 dark:border-slate-800 transition cursor-pointer space-y-0.5"
                >
                  <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200">{sample.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 italic">&ldquo;{sample.cmd}&rdquo;</p>
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 font-semibold text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              10s Rollback Window Enabled
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExecuteIntent}
              disabled={!transcript.trim() || !decomposedIntent}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>
                {decomposedIntent && decomposedIntent.steps.length > 1
                  ? `Execute Compound Actions (${decomposedIntent.steps.length})`
                  : 'Execute Voice Action'}
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
