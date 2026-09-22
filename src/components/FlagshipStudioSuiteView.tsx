/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Bot, 
  Mic, 
  Home, 
  CheckCircle2, 
  ArrowRight, 
  Play, 
  RotateCcw, 
  ShieldCheck, 
  Layers, 
  Zap, 
  Award, 
  TrendingUp, 
  Copy, 
  Check, 
  ExternalLink, 
  Code, 
  Database, 
  DollarSign, 
  Mail, 
  Calendar, 
  Table, 
  Lock, 
  Share2, 
  Smartphone,
  BookOpen
} from 'lucide-react';
import { WorkspaceTab } from '../types';
import { useMemory } from '../context/MemoryContext';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { formatUSD } from '../services/geomapMortgageEngine';
import { isMikeFordAdmin } from '../utils/adminAuth';
import { auth } from '../services/firebase';

interface FlagshipStudioSuiteViewProps {
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenVoiceModal?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenShareLinksModal?: () => void;
}

export const FlagshipStudioSuiteView: React.FC<FlagshipStudioSuiteViewProps> = ({
  onNavigateTab,
  onOpenVoiceModal,
  onOpenPitchDeck,
  onOpenShareLinksModal
}) => {
  const { memories, guardrails } = useMemory();
  const { connectedWorkspaceEmail, isWorkspaceConnected } = useAccountPathway();
  const isAdmin = isMikeFordAdmin(auth.currentUser) || isMikeFordAdmin({ email: connectedWorkspaceEmail });

  const [copiedMasterSnippet, setCopiedMasterSnippet] = useState(false);
  const [activeSimulationStep, setActiveSimulationStep] = useState<number | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const masterSuiteSnippet = `<script src="https://vantage-ai.workspace/plugins/vantage-4in1-suite.js" data-license="VAN-SUITE-4IN1-MASTER-PLATINUM" async></script>
<div id="vantage-suite-container" data-theme="adaptive" data-superpowers="brain,workspace,voice,geomap"></div>`;

  const handleCopyMasterSnippet = () => {
    navigator.clipboard.writeText(masterSuiteSnippet);
    setCopiedMasterSnippet(true);
    setTimeout(() => setCopiedMasterSnippet(false), 3000);
  };

  // Run 4-in-1 Unified Cross-Superpower Chain Simulation
  const handleRun4In1Simulation = () => {
    setIsSimulating(true);
    setActiveSimulationStep(1);

    setTimeout(() => {
      setActiveSimulationStep(2);
    }, 1800);

    setTimeout(() => {
      setActiveSimulationStep(3);
    }, 3600);

    setTimeout(() => {
      setActiveSimulationStep(4);
    }, 5400);

    setTimeout(() => {
      setIsSimulating(false);
    }, 7200);
  };

  const handleResetSimulation = () => {
    setActiveSimulationStep(null);
    setIsSimulating(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Hero Banner: The 4-in-1 Flagship Suite */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>FLAGSHIP 4-IN-1 AI SUPERPOWERS &bull; VANTAGE STUDIO-SUITE</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              The Vantage AI Platinum Ecosystem
            </h1>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Uniting four enterprise-grade superpowers: Long-Term Cognitive Memory, Google Workspace Autonomous OS, Speech-to-Intent Voice Chief of Staff, and Real Estate GeoMap DPA Engines into a single unified workspace.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-slate-400">
              <span>Author & Commercial Architect:</span>
              <span className="font-semibold text-slate-200">Mike Ford</span>
              <span>(&lt;fordmj@gmail.com&gt;)</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCopyMasterSnippet}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer shadow-sm"
            >
              {copiedMasterSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedMasterSnippet ? 'Master Embed Copied!' : 'Copy 4-in-1 Script'}</span>
            </button>

            {onOpenPitchDeck && (
              <button
                onClick={onOpenPitchDeck}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-indigo-600/30 cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>Executive Pitch Deck</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Superpower Status Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800">
          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-purple-300 flex items-center gap-1">
              <Brain className="w-3 h-3" /> Superpower 1
            </span>
            <div className="text-sm font-bold text-white">2nd Brain & Memory</div>
            <div className="text-[10px] text-slate-400">{memories.length} Memories &bull; {guardrails.personalityPreset} Preset</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-blue-300 flex items-center gap-1">
              <Bot className="w-3 h-3" /> Superpower 2
            </span>
            <div className="text-sm font-bold text-white">Workspace OS</div>
            <div className="text-[10px] text-slate-400">SQL Sheets &bull; Email Triage</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-emerald-300 flex items-center gap-1">
              <Mic className="w-3 h-3" /> Superpower 3
            </span>
            <div className="text-sm font-bold text-white">Voice Chief of Staff</div>
            <div className="text-[10px] text-slate-400">Compound Intents &bull; Airgap</div>
          </div>

          <div className="p-3 bg-white/5 rounded-xl border border-white/10 space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-amber-300 flex items-center gap-1">
              <Home className="w-3 h-3" /> Superpower 4
            </span>
            <div className="text-sm font-bold text-white">Real Estate GeoMap</div>
            <div className="text-[10px] text-slate-400">DPA Stacker &bull; USDA GIS</div>
          </div>
        </div>
      </div>

      {/* 4-IN-1 SUPERPOWER CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* SUPERPOWER 1 CARD: 2nd Brain */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Brain className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800">
                Superpower 1
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Vantage AI 2nd Brain (Cognitive Core)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Persistent cognitive memory vault, dynamic prompt guardrails, multi-persona governance, and automatic vectorization of client knowledge into Firestore.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Stored Memories:</span>
                <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">{memories.length} records</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Active Safety Guardrails:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200 font-mono">{guardrails.personalityPreset} ({guardrails.forbiddenTopics?.length || 0} curbs)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Context Auto-Injection:</span>
                <span className="text-emerald-600 font-bold">Enabled (100%)</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('brain')}
            className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch 2nd Brain Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SUPERPOWER 2 CARD: Workspace UI Autonomous OS */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800">
                Superpower 2
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Vantage AI Workspace UI (Google Autonomous OS)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Relational SQL queries across Google Sheets, multi-source de-duplication lead cleaners, intelligent Gmail triage, and calendar focus negotiation.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Google Workspace Pathway:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{isWorkspaceConnected ? 'Connected' : 'Autonomous Mode'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>SQL Sheets Intelligence:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">Interactive Engine</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Smart Inbox & Heatmap:</span>
                <span className="text-emerald-600 font-bold">Live AI Triage</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('studio')}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch Workspace OS Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SUPERPOWER 3 CARD: Voice Orchestrator */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Mic className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                Superpower 3
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Vantage Voice Orchestrator (Chief of Staff)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time acoustic audio waveform, compound multi-intent deconstruction graph, verbal safety airgap protocol, and spoken FinTech mortgage pre-qual.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>Acoustic Waveform Visualizer:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Live Frequency Bars</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Safety Airgap Protocol:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">10s Reversible Undo</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Spoken DTI Calculation:</span>
                <span className="text-emerald-600 font-bold">Active Engine</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('voice-macros')}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch Voice Chief of Staff</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* SUPERPOWER 4 CARD: Real Estate GeoMap & DPA Engine */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all space-y-5 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <Home className="w-5 h-5" />
              </div>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800">
                Superpower 4
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Vantage Real Estate GeoMap & Lead DPA Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Multi-subsidy DPA grant stacker, USDA 100% rural boundary GIS explorer, 3-step buyer prequal wizard, and automatic Google Sheets CRM lead pipeline.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>DPA Subsidy Stacker:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">5 Grants & Subsidies</span>
              </div>
              <div className="flex items-center justify-between">
                <span>USDA Rural Zone GIS:</span>
                <span className="font-bold text-slate-900 dark:text-slate-200">100% Zero-Down Verified</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Buyer Lead Scorecard:</span>
                <span className="text-emerald-600 font-bold">Live CRM Sync</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('real_estate')}
            className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2"
          >
            <span>Launch Real Estate GeoMap</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* CROSS-SUPERPOWER 4-IN-1 UNIFIED PIPELINE SIMULATOR */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase">
              <Zap className="w-4 h-4" /> Cross-Superpower Autonomous Chain
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              Live 4-in-1 End-to-End Orchestration Simulator
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Watch an executive spoken command cascade through all four superpowers simultaneously
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isSimulating ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold rounded-xl border border-indigo-200 dark:border-indigo-800 animate-pulse">
                <Sparkles className="w-4 h-4" />
                <span>Executing 4-in-1 Chain...</span>
              </div>
            ) : (
              <button
                onClick={handleRun4In1Simulation}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Play 4-in-1 Chain Simulation</span>
              </button>
            )}

            {activeSimulationStep !== null && !isSimulating && (
              <button
                onClick={handleResetSimulation}
                className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                title="Reset simulation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 4-Step Pipeline Flow Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Step 1: Voice Chief of Staff */}
          <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
            activeSimulationStep === 1
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20'
              : activeSimulationStep && activeSimulationStep > 1
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center">1</span>
              <Mic className="w-4 h-4 text-emerald-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Spoken Voice Intake
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              &ldquo;Prequalify Marcus for $425k in Scappoose, check 100% USDA grant, draft VIP email, and save to 2nd brain.&rdquo;
            </p>
            {activeSimulationStep && activeSimulationStep >= 1 && (
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" /> Decomposed into 4 Compound Steps
              </div>
            )}
          </div>

          {/* Step 2: 2nd Brain Cognitive Vault */}
          <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
            activeSimulationStep === 2
              ? 'bg-purple-50 dark:bg-purple-950/50 border-purple-500 shadow-md ring-2 ring-purple-500/20'
              : activeSimulationStep && activeSimulationStep > 2
              ? 'bg-purple-50/40 dark:bg-purple-950/20 border-purple-300 dark:border-purple-800'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-[11px] font-bold flex items-center justify-center">2</span>
              <Brain className="w-4 h-4 text-purple-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Cognitive Embedding
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Vectorizes buyer profile into Firestore memory vault. Enforces DTI &lt; 45% guardrail rule automatically.
            </p>
            {activeSimulationStep && activeSimulationStep >= 2 && (
              <div className="text-[10px] text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" /> Saved with Tags: #marcus #prequal
              </div>
            )}
          </div>

          {/* Step 3: Workspace OS Action */}
          <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
            activeSimulationStep === 3
              ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20'
              : activeSimulationStep && activeSimulationStep > 3
              ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-300 dark:border-blue-800'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center">3</span>
              <Bot className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Workspace OS Execution
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Dispatches Gmail confirmation draft and logs new pre-qualified row into Google Sheets CRM pipeline.
            </p>
            {activeSimulationStep && activeSimulationStep >= 3 && (
              <div className="text-[10px] text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" /> Sheets Updated &bull; Draft Staged
              </div>
            )}
          </div>

          {/* Step 4: Real Estate GeoMap DPA */}
          <div className={`p-5 rounded-2xl border transition-all space-y-3 ${
            activeSimulationStep === 4
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 shadow-md ring-2 ring-amber-500/20'
              : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800'
          }`}>
            <div className="flex items-center justify-between">
              <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-[11px] font-bold flex items-center justify-center">4</span>
              <Home className="w-4 h-4 text-amber-600" />
            </div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
              DPA Subsidy Matching
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Pins 100% USDA eligible properties in Scappoose and stacks $7,500 Bank CRA LMI Grant.
            </p>
            {activeSimulationStep && activeSimulationStep >= 4 && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" /> Buyer Cash Needed: $0.00
              </div>
            )}
          </div>

        </div>

        {/* Simulation Summary Banner */}
        {activeSimulationStep === 4 && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between gap-4 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span><strong>4-in-1 Pipeline Execution Succeeded:</strong> Voice decomposed into 4 discrete actions, vectorized into 2nd Brain, updated Sheets CRM, and matched 100% zero-down USDA DPA subsidies.</span>
            </div>
            <button
              onClick={handleResetSimulation}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shrink-0 cursor-pointer"
            >
              Reset
            </button>
          </div>
        )}
      </div>

      {/* ENTERPRISE MASTER LICENSE & TURNKEY DISTRIBUTION BAR */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl border border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Enterprise 4-in-1 Commercial License
            </span>
            <span className="text-xs font-bold text-slate-300">
              Master Bundle VAN-SUITE-4IN1-MASTER
            </span>
          </div>
          <h4 className="text-base font-black tracking-tight text-white">
            Embed All 4 Superpowers in External Portals with One Line of Code
          </h4>
          <p className="text-xs text-slate-400 max-w-2xl">
            Commercial multi-tenant architecture with domain-locking, BYOK secret management, and automated Firestore synchronization for client organizations.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCopyMasterSnippet}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer"
          >
            {copiedMasterSnippet ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedMasterSnippet ? 'Copied' : 'Copy Script Tag'}</span>
          </button>

          {isAdmin && onOpenShareLinksModal && (
            <button
              onClick={onOpenShareLinksModal}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile PWA Links</span>
            </button>
          )}
        </div>
      </div>

    </div>
  );
};
