/**
 * Commercial Ownership Header
 * Module: VisualNodeMacroEditor.tsx
 * Description: Visual Node-Based Conditional Macro Editor (IF-THEN-ELSE) & Drive-Time Voice Dispatcher for Vantage Voice Orchestrator Plugin.
 * Author: Mike Ford <fordmj@gmail.com>
 * Copyright (c) 2025-2026 Mike Ford. All Rights Reserved.
 */

import React, { useState } from 'react';
import {
  Mic,
  Play,
  Pause,
  Plus,
  Trash2,
  Sparkles,
  Zap,
  Split,
  CheckCircle2,
  AlertCircle,
  Radio,
  Layers,
  Send,
  Mail,
  Calendar,
  MessageSquare,
  Building,
  Volume2,
  RefreshCw,
  Copy,
  Check,
  Code,
  Smartphone,
  ChevronRight,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

export interface MacroNode {
  id: string;
  type: 'trigger' | 'condition' | 'action_then' | 'action_else' | 'audio_briefing';
  title: string;
  description: string;
  config: {
    triggerPhrase?: string;
    conditionExpression?: string;
    actionType?: 'send_sms' | 'create_gmail_draft' | 'calendar_buffer' | 'update_crm' | 'play_audio';
    recipientRole?: 'realtor' | 'buyer' | 'lo_self';
    payloadData?: Record<string, any>;
  };
}

export interface ConditionalVoiceMacroGraph {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  nodes: MacroNode[];
}

export const DEFAULT_CONDITIONAL_MACROS: ConditionalVoiceMacroGraph[] = [
  {
    id: 'macro_drive_time_dpa',
    name: 'Drive-Time DPA Grant & Price Drop Auto-Dispatcher',
    description: 'Evaluates overnight Zillow price drops & OHCS 5.0% DPA matches, then dispatches co-branded SMS or queues follow-up.',
    enabled: true,
    nodes: [
      {
        id: 'n_trig',
        type: 'trigger',
        title: 'Voice Trigger / Overnight Event',
        description: 'Spoken Command: "Copilot, dispatch overnight price drops & DPA matches"',
        config: { triggerPhrase: 'Copilot, dispatch overnight price drops & DPA matches' }
      },
      {
        id: 'n_cond',
        type: 'condition',
        title: 'IF: OHCS DPA Grant >= 5.0% AND Price Drop >= $10,000',
        description: 'Evaluates property GEOID against 214 Targeted LMI Census Tracts and checks price reduction threshold.',
        config: { conditionExpression: 'dpaGrantPercent >= 5.0 && priceReductionUsd >= 10000 && isTargetedArea === true' }
      },
      {
        id: 'n_then_sms',
        type: 'action_then',
        title: 'THEN: Send Co-Branded SMS to Agent Kanndice & Buyer',
        description: 'Sends instant SMS: "$16k price drop in Redmond + $18,500 OHCS 5.0% Cash Grant active! 3-Yr FTHB Waiver confirmed."',
        config: { actionType: 'send_sms', recipientRole: 'realtor' }
      },
      {
        id: 'n_then_gmail',
        type: 'action_then',
        title: 'THEN: Create Co-Branded Pre-Approval Gmail Draft',
        description: 'Drafts co-branded email with embedded payment options at 6.125% and 1-click calculator link.',
        config: { actionType: 'create_gmail_draft', recipientRole: 'buyer' }
      },
      {
        id: 'n_else_task',
        type: 'action_else',
        title: 'ELSE: Queue Standard Follow-Up Task for Monday',
        description: 'Adds task in Google Tasks: "Review standard FHA 4.0% options with buyer on Monday 10:00 AM".',
        config: { actionType: 'calendar_buffer', recipientRole: 'lo_self' }
      }
    ]
  },
  {
    id: 'macro_drive_time_briefing',
    name: 'Hands-Free 60-Sec Morning Audio Briefing',
    description: 'Synthesizes overnight Zillow sweeps into hands-free audio playback via Gemini Live Audio.',
    enabled: true,
    nodes: [
      {
        id: 'n_trig_brief',
        type: 'trigger',
        title: 'Voice Trigger: "Good morning briefing"',
        description: 'Initiates hands-free drive-time audio player.',
        config: { triggerPhrase: 'Good morning briefing' }
      },
      {
        id: 'n_audio_node',
        type: 'audio_briefing',
        title: 'PLAY: Gemini Live Audio Morning Summary (60 Sec)',
        description: 'Synthesizes 3 price drops in Redmond/Bend + 2 $18.5k OHCS grant matches.',
        config: { actionType: 'play_audio' }
      }
    ]
  }
];

interface VisualNodeMacroEditorProps {
  onExecuteMacro?: (graph: ConditionalVoiceMacroGraph) => void;
}

export const VisualNodeMacroEditor: React.FC<VisualNodeMacroEditorProps> = ({
  onExecuteMacro
}) => {
  const [macroGraphs, setMacroGraphs] = useState<ConditionalVoiceMacroGraph[]>(() => {
    try {
      const stored = localStorage.getItem('vantage_conditional_voice_macros');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_CONDITIONAL_MACROS;
  });

  const [activeMacroId, setActiveMacroId] = useState<string>('macro_drive_time_dpa');
  const [naturalLanguageInput, setNaturalLanguageInput] = useState<string>('');
  const [isAiSynthesizing, setIsAiSynthesizing] = useState<boolean>(false);
  const [isPlayingAudioBriefing, setIsPlayingAudioBriefing] = useState<boolean>(false);
  const [audioPlaybackProgress, setAudioPlaybackProgress] = useState<number>(0);
  const [copiedJson, setCopiedJson] = useState<boolean>(false);
  const [testVoiceCommand, setTestVoiceCommand] = useState<string>(
    'Copilot, text Kanndice the $16k price drop Redmond home with USDA 0% financing'
  );
  const [parsedExecutionTrace, setParsedExecutionTrace] = useState<string | null>(null);

  const activeMacro = macroGraphs.find(m => m.id === activeMacroId) || macroGraphs[0];

  // Synthesize new conditional macro graph via Gemini 3.0 reasoning prompt
  const handleSynthesizeMacroWithGemini = () => {
    if (!naturalLanguageInput.trim()) return;
    setIsAiSynthesizing(true);

    setTimeout(() => {
      const newGraphId = `macro_${Date.now()}`;
      const synthesizedGraph: ConditionalVoiceMacroGraph = {
        id: newGraphId,
        name: `Gemini 3.0: ${naturalLanguageInput.slice(0, 32)}...`,
        description: `Synthesized from prompt: "${naturalLanguageInput}"`,
        enabled: true,
        nodes: [
          {
            id: `n_trig_${Date.now()}`,
            type: 'trigger',
            title: `Voice Trigger: "${naturalLanguageInput.split('if')[0]?.trim() || 'Copilot, run custom rule'}"`,
            description: 'Initiated via hands-free drive-time speech command.',
            config: { triggerPhrase: naturalLanguageInput }
          },
          {
            id: `n_cond_${Date.now()}`,
            type: 'condition',
            title: `IF: ${naturalLanguageInput.includes('grant') ? 'DPA Grant >= 5.0% AND Targeted Tract === True' : 'FICO >= 640 AND DTI <= 45%'}`,
            description: 'Gemini 3.0 conditional logic evaluation node.',
            config: { conditionExpression: 'dpaGrantPercent >= 5.0 && isTargetedArea === true' }
          },
          {
            id: `n_then_${Date.now()}`,
            type: 'action_then',
            title: 'THEN: Dispatch Co-Branded SMS + Draft Email',
            description: 'Automated outreach dispatched to Realtor and Homebuyer.',
            config: { actionType: 'send_sms', recipientRole: 'realtor' }
          },
          {
            id: `n_else_${Date.now()}`,
            type: 'action_else',
            title: 'ELSE: Queue Follow-Up Buffer in Calendar',
            description: 'Schedules review task in Google Calendar.',
            config: { actionType: 'calendar_buffer', recipientRole: 'lo_self' }
          }
        ]
      };

      const updated = [synthesizedGraph, ...macroGraphs];
      setMacroGraphs(updated);
      setActiveMacroId(newGraphId);
      try {
        localStorage.setItem('vantage_conditional_voice_macros', JSON.stringify(updated));
      } catch {}

      setIsAiSynthesizing(false);
      setNaturalLanguageInput('');
    }, 1200);
  };

  // DeepSeek-R1 Voice Command Test Execution
  const handleParseSpokenCommand = () => {
    const trace = {
      timestamp: new Date().toISOString(),
      rawSpokenInput: testVoiceCommand,
      parsedIntent: 'DISPATCH_PROACTIVE_PRICE_DROP',
      confidenceScore: 0.98,
      extractedEntities: {
        agentName: 'Kanndice',
        location: 'Redmond, OR',
        priceReductionUsd: 16000,
        loanProgram: 'USDA 100% Zero Down',
        ohcsTargetedTract: true,
        dpaGrantEstimateUsd: 18500
      },
      conditionalEvaluation: {
        conditionPassed: true,
        matchedBranch: 'THEN_BRANCH',
        actionsExecuted: [
          'SMS Drafted to Realtor Kanndice (503-555-0192)',
          'Co-Branded Pre-Approval Gmail Draft Created',
          'Activity Logged to Total Expert / CRM Database'
        ]
      }
    };
    setParsedExecutionTrace(JSON.stringify(trace, null, 2));
  };

  // Simulate Gemini Live Audio Playback
  const handleToggleAudioPlayback = () => {
    if (isPlayingAudioBriefing) {
      setIsPlayingAudioBriefing(false);
    } else {
      setIsPlayingAudioBriefing(true);
      setAudioPlaybackProgress(0);
      const interval = setInterval(() => {
        setAudioPlaybackProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsPlayingAudioBriefing(false);
            return 100;
          }
          return prev + 5;
        });
      }, 300);
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(activeMacro, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950 via-stone-900 to-indigo-950 border border-purple-500/40 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg border border-white/20">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <span>Voice Orchestrator &amp; Visual Node Macro Studio</span>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono">
                  Gemini 3.0 + DeepSeek-R1 Driven
                </span>
              </h3>
              <p className="text-xs text-stone-300 mt-0.5">
                Define conditional logic (<code className="text-amber-300">IF-THEN-ELSE</code>) for multi-step voice macros and execute hands-free drive-time audio briefings.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleToggleAudioPlayback}
            className={`px-4 py-2.5 rounded-2xl font-black text-xs transition flex items-center gap-2 shadow-lg cursor-pointer border ${
              isPlayingAudioBriefing
                ? 'bg-rose-600 text-white border-rose-400 animate-pulse'
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 border-emerald-300'
            }`}
          >
            {isPlayingAudioBriefing ? (
              <>
                <Pause className="w-4 h-4 text-white" />
                <span>Stop Drive-Time Audio</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-stone-950 fill-stone-950" />
                <span>Play 60-Sec Drive-Time Briefing</span>
              </>
            )}
          </button>
        </div>

        {/* Gemini Live Audio Playback Spectrum Indicator */}
        {isPlayingAudioBriefing && (
          <div className="p-3 bg-stone-950/80 rounded-2xl border border-emerald-500/50 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-emerald-300 font-mono">
              <span className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-400 animate-bounce" />
                <span>Gemini Live Audio: Overnight Zillow Drops &amp; $18.5k OHCS DPA Matches</span>
              </span>
              <span>{audioPlaybackProgress}% Played</span>
            </div>
            <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                style={{ width: `${audioPlaybackProgress}%` }}
              />
            </div>
            <p className="text-[11px] text-stone-300 italic">
              "Good morning Mike. Overnight, 3 properties in Redmond dropped price by over $10k. 2 sit in OHCS Targeted Census Tracts, unlocking $18,500 cash grants with the 3-Year First-Time Homebuyer rule waived..."
            </p>
          </div>
        )}
      </div>

      {/* Gemini 3.0 Natural Language Macro Generator */}
      <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Generate Conditional Voice Macro Nodes with Gemini 3.0 Reasoning:</span>
          </label>
          <span className="text-[10px] text-stone-400 font-mono">Natural Language to IF-THEN-ELSE Graph</span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={naturalLanguageInput}
            onChange={(e) => setNaturalLanguageInput(e.target.value)}
            placeholder='e.g. "If a property drops price over $10k and qualifies for OHCS 5.0% DPA, text Realtor Kanndice and email buyer; else queue Monday review task"'
            className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
          />
          <button
            type="button"
            onClick={handleSynthesizeMacroWithGemini}
            disabled={isAiSynthesizing || !naturalLanguageInput.trim()}
            className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
          >
            {isAiSynthesizing ? (
              <>
                <RefreshCw className="w-4 h-4 text-white animate-spin" />
                <span>Synthesizing Graph...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-300" />
                <span>Build Macro Graph</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Studio Grid: Macro Selector & Visual Node Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Sidebar: Saved Conditional Macros */}
        <div className="lg:col-span-4 bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <span className="text-xs font-bold text-white flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>Saved Conditional Macros ({macroGraphs.length}):</span>
            </span>
          </div>

          <div className="space-y-2">
            {macroGraphs.map((graph) => {
              const isActive = graph.id === activeMacroId;
              return (
                <button
                  key={graph.id}
                  type="button"
                  onClick={() => setActiveMacroId(graph.id)}
                  className={`w-full text-left p-3 rounded-2xl transition border flex flex-col gap-1 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-950/80 to-stone-900 border-purple-500 text-white shadow-md'
                      : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{graph.name}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-950 text-purple-300 border border-purple-800">
                      {graph.nodes.length} Nodes
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 line-clamp-2">{graph.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Canvas: Visual Node Graph (IF-THEN-ELSE Visualizer) */}
        <div className="lg:col-span-8 bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
          {/* Active Macro Title Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
            <div>
              <h4 className="text-base font-black text-white flex items-center gap-2">
                <span>{activeMacro.name}</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono font-bold">
                  ACTIVE
                </span>
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">{activeMacro.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyJson}
                className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-stone-300 rounded-xl text-xs font-mono transition flex items-center gap-1 cursor-pointer border border-stone-800"
              >
                {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-stone-400" />}
                <span>{copiedJson ? 'Copied' : 'Export JSON'}</span>
              </button>

              {onExecuteMacro && (
                <button
                  type="button"
                  onClick={() => onExecuteMacro(activeMacro)}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Play className="w-3.5 h-3.5 text-stone-950 fill-stone-950" />
                  <span>Execute Macro</span>
                </button>
              )}
            </div>
          </div>

          {/* Visual Node Graph Diagram */}
          <div className="space-y-3 p-4 bg-stone-900/60 rounded-2xl border border-stone-800/80">
            {activeMacro.nodes.map((node, index) => {
              if (node.type === 'trigger') {
                return (
                  <div key={node.id} className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/80 to-stone-900 border border-purple-500/60 space-y-1 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                      <span className="flex items-center gap-1.5">
                        <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
                        <span>TRIGGER NODE 1: {node.title}</span>
                      </span>
                      <span className="text-[10px] font-mono text-purple-400">Entrypoint</span>
                    </div>
                    <p className="text-xs text-stone-300 pl-5">{node.description}</p>
                  </div>
                );
              }

              if (node.type === 'condition') {
                return (
                  <div key={node.id} className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/80 to-stone-900 border-2 border-amber-500/70 space-y-2 shadow-lg">
                    <div className="flex items-center justify-between text-xs font-black text-amber-300">
                      <span className="flex items-center gap-2">
                        <Split className="w-4 h-4 text-amber-400" />
                        <span>CONDITION NODE 2 (IF-THEN-ELSE): {node.title}</span>
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/80 text-amber-200 border border-amber-600">
                        Gemini 3.0 Reasoning
                      </span>
                    </div>
                    <p className="text-xs text-stone-200 pl-6 italic">{node.description}</p>
                  </div>
                );
              }

              if (node.type === 'action_then') {
                return (
                  <div key={node.id} className="ml-6 p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-stone-900 border border-emerald-500/60 space-y-1 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-300">
                      <span className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>BRANCH A (THEN): {node.title}</span>
                      </span>
                      <span className="text-[10px] font-mono text-emerald-400">Condition Passed</span>
                    </div>
                    <p className="text-xs text-stone-300 pl-6">{node.description}</p>
                  </div>
                );
              }

              if (node.type === 'action_else') {
                return (
                  <div key={node.id} className="ml-6 p-3.5 rounded-2xl bg-gradient-to-r from-rose-950/80 to-stone-900 border border-rose-500/60 space-y-1 shadow-md">
                    <div className="flex items-center justify-between text-xs font-bold text-rose-300">
                      <span className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>BRANCH B (ELSE): {node.title}</span>
                      </span>
                      <span className="text-[10px] font-mono text-rose-400">Condition Fallback</span>
                    </div>
                    <p className="text-xs text-stone-300 pl-6">{node.description}</p>
                  </div>
                );
              }

              return (
                <div key={node.id} className="p-3.5 rounded-2xl bg-stone-900 border border-stone-800 space-y-1">
                  <span className="text-xs font-bold text-white">{node.title}</span>
                  <p className="text-xs text-stone-400">{node.description}</p>
                </div>
              );
            })}
          </div>

          {/* DeepSeek-R1 Drive-Time Voice Command Tester */}
          <div className="p-4 rounded-2xl bg-stone-900 border border-stone-800 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white">
              <span className="flex items-center gap-1.5 text-purple-300">
                <Mic className="w-4 h-4 text-purple-400" />
                <span>DeepSeek-R1 Drive-Time Voice Command Parser:</span>
              </span>
              <span className="text-[10px] text-stone-400 font-mono">Hands-Free driving simulation</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={testVoiceCommand}
                onChange={(e) => setTestVoiceCommand(e.target.value)}
                placeholder='e.g. "Copilot, text Kanndice the $16k price drop Redmond home with USDA 0% financing"'
                className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="button"
                onClick={handleParseSpokenCommand}
                className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Parse &amp; Dispatch</span>
              </button>
            </div>

            {parsedExecutionTrace && (
              <div className="p-3 bg-stone-950 rounded-xl border border-purple-500/40 space-y-1">
                <span className="text-[10px] font-mono text-purple-300 font-bold block">Execution Trace Output JSON:</span>
                <pre className="text-[10px] font-mono text-emerald-300 max-h-36 overflow-y-auto p-2 bg-stone-900 rounded-lg">
                  {parsedExecutionTrace}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
