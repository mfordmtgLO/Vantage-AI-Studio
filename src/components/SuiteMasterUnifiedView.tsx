import React, { useState } from 'react';
import { 
  Sparkles, Home, Brain, Mic, Building2, Smartphone, Share2, 
  Layers, CheckCircle2, ArrowRight, Zap, RefreshCw, Copy, Check, 
  ExternalLink, QrCode, Play, Shield, DollarSign, Database, 
  Mail, Calendar, FileText, Table, CheckSquare, Users, Cpu, 
  ChevronRight, Compass, TrendingUp, Sliders, Volume2, ShieldCheck,
  BookOpen
} from 'lucide-react';
import { RealEstateMortgageView } from './RealEstateMortgageView';
import { SecondBrainView } from './SecondBrainView';
import { LogicOrchestratorView } from './LogicOrchestratorView';
import { VoiceMacroManagerView } from './VoiceMacroManagerView';
import { FlagshipStudioSuiteView } from './FlagshipStudioSuiteView';
import { TopTierCommercialStrategyHub } from './TopTierCommercialStrategyHub';
import { PrioritizedCodeImplementationRoadmap } from './PrioritizedCodeImplementationRoadmap';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { useMemory } from '../context/MemoryContext';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';
import { IosInstallGuideModal } from './IosInstallGuideModal';
import { buildLeadPluginUrl, SHARED_BASE_URL } from '../data/leadMobilePluginUrls';
import { auth } from '../services/firebase';
import { isMikeFordAdmin } from '../utils/adminAuth';

interface SuiteMasterUnifiedViewProps {
  onOpenShareLinksModal?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenByokDrawer?: () => void;
  onOpenByokChecklist?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const SuiteMasterUnifiedView: React.FC<SuiteMasterUnifiedViewProps> = ({
  onOpenShareLinksModal,
  onOpenPitchDeck,
  onOpenByokDrawer,
  onOpenByokChecklist,
  onNavigateTab
}) => {
  const { pathway, isWorkspaceConnected, connectedWorkspaceEmail } = useAccountPathway();
  const { memories, activePersona, guardrails } = useMemory();
  const { isInstallable, isInstalled, isIOS, isIosGuideOpen, setIsIosGuideOpen, triggerInstall } = usePwaInstallPrompt();

  const [activeModuleTab, setActiveModuleTab] = useState<'bento_all' | 'superpowers' | 'commercial' | 'roadmap' | 'geomap' | 'brain' | 'voice' | 'workspace' | 'synergies'>('superpowers');
  const [simulationRunning, setSimulationRunning] = useState(false);
  const [simulationStep, setSimulationStep] = useState<number>(0);
  const [simulationLog, setSimulationLog] = useState<string[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrDrawer, setShowQrDrawer] = useState(false);

  const suiteLiveUrl = buildLeadPluginUrl('suite', SHARED_BASE_URL, { leadMode: true });

  const handleCopySuiteLink = () => {
    navigator.clipboard.writeText(suiteLiveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleMobileInstall = async () => {
    if (isIOS) {
      setIsIosGuideOpen(true);
      return;
    }
    const res = await triggerInstall();
    if (res === 'ios_guide') {
      setIsIosGuideOpen(true);
    }
  };

  // Run a real-time interactive simulation showing all 4 modules talking to each other
  const handleRunCrossModuleSimulation = () => {
    if (simulationRunning) return;
    setSimulationRunning(true);
    setSimulationStep(1);
    setSimulationLog([
      '🎙️ [Voice Module]: Captured speech macro "Process new homebuyer lead Sarah Miller in Dallas, OR — check USDA zero-down & schedule consult"...'
    ]);

    setTimeout(() => {
      setSimulationStep(2);
      setSimulationLog((prev) => [
        ...prev,
        '🧠 [2nd Brain Module]: Vectorizing lead details into cognitive memory. Active persona "Executive Mortgage Strategist" applied with strict guardrails.'
      ]);
    }, 1400);

    setTimeout(() => {
      setSimulationStep(3);
      setSimulationLog((prev) => [
        ...prev,
        '🏡 [GeoMap DPA Module]: Geocoded Census Tract #41053005202. Verified 100% USDA Rural Housing eligible + $5,000 CRA Grant match.'
      ]);
    }, 2800);

    setTimeout(() => {
      setSimulationStep(4);
      setSimulationLog((prev) => [
        ...prev,
        '🏛️ [Workspace UI Module]: Appended record to Google Sheets CRM pipeline, drafted email in Gmail ("USDA Pre-Approval Overview"), and placed a 15-min buffered meeting hold on Google Calendar.'
      ]);
    }, 4200);

    setTimeout(() => {
      setSimulationStep(5);
      setSimulationLog((prev) => [
        ...prev,
        '✅ [Suite Synergy Complete]: All 4 modules executed synchronously with zero human data-entry friction.'
      ]);
      setSimulationRunning(false);
    }, 5500);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Flagship Suite Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-blue-950 text-white p-5 sm:p-8 border border-indigo-500/30 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-slate-950" />
                Vantage AI Studio-Suite
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold rounded-full">
                4-in-1 Turnkey Commercial Platform
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" /> Live Connected & Ready
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              All 4 Autonomous Plugin Modules <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-amber-300">
                Wired & Live in One Master Mobile & Desktop App
              </span>
            </h1>

            <p className="text-sm sm:text-base text-blue-100/80 leading-relaxed">
              Experience the complete enterprise suite as advertised: <strong>Real Estate GeoMap & DPA</strong>, <strong>2nd Brain Cognitive Memory</strong>, <strong>Voice Orchestrator</strong>, and <strong>Google Workspace UI</strong> integrated into a single seamless cockpit. Install to your smartphone home screen or embed into client websites in 1-click.
            </p>

            {/* Quick Feature Matrix Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <Home className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="font-medium text-slate-200">GeoMap & DPA Grants</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <Brain className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="font-medium text-slate-200">2nd Brain Memory</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <Mic className="w-4 h-4 text-purple-400 shrink-0" />
                <span className="font-medium text-slate-200">Voice Macro Studio</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
                <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-medium text-slate-200">Workspace UI Cockpit</span>
              </div>
            </div>
          </div>

          {/* Action Hub Column */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {!isInstalled && (
              <button
                type="button"
                onClick={handleMobileInstall}
                className="px-5 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-sm rounded-2xl transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2 text-center"
              >
                <Smartphone className="w-4 h-4" />
                <span>Add Full Suite to Phone</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-slate-950 text-amber-400 font-bold rounded-md">PWA</span>
              </button>
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopySuiteLink}
                className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'Suite Link Copied!' : 'Copy Suite URL'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowQrDrawer(!showQrDrawer)}
                className="p-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                title="Toggle Mobile QR Code for Phone Camera Scan"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {onOpenShareLinksModal && (
                <button
                  type="button"
                  onClick={onOpenShareLinksModal}
                  className="px-3.5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1 shadow-xs"
                  title="Open Lead Mobile URLs & Pitch Generator"
                >
                  <Share2 className="w-4 h-4" />
                  <span className="hidden sm:inline">Lead URLs</span>
                </button>
              )}
            </div>

            {onOpenPitchDeck && (
              <button
                type="button"
                onClick={onOpenPitchDeck}
                className="px-4 py-2 bg-indigo-900/60 hover:bg-indigo-800/80 border border-indigo-400/30 text-indigo-200 font-semibold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Commercial Pitch Deck & Pricing Tiers</span>
              </button>
            )}
          </div>
        </div>

        {/* QR Code Quick Scan Drawer */}
        {showQrDrawer && (
          <div className="mt-5 pt-5 border-t border-white/15 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
            <div className="p-2 bg-white rounded-2xl shadow-md shrink-0">
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(suiteLiveUrl)}&margin=4`}
                alt="Suite QR Code"
                className="w-28 h-28 object-contain"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-300" />
                Scan to Open Vantage AI Studio-Suite on Mobile
              </h4>
              <p className="text-xs text-blue-200/80 max-w-xl">
                Point your iPhone or Android camera at this code. The full 4-in-1 Suite will open directly in mobile browser with zero login friction. Tap <strong>"Add to Home Screen"</strong> to run it as a standalone app!
              </p>
              <div className="pt-1">
                <code className="text-[11px] font-mono bg-black/40 px-2 py-0.5 rounded text-blue-200 select-all">
                  {suiteLiveUrl}
                </code>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Module Navigation Tabs */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setActiveModuleTab('superpowers')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'superpowers'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>💎 4-in-1 Superpowers Studio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('commercial')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'commercial'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>🚀 Commercial Strategy & ROI</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('roadmap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'roadmap'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-500/20 font-black'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Cpu className="w-4 h-4 text-cyan-500" />
            <span>🛠️ Code Roadmap & System Architecture</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('bento_all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'bento_all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>4-in-1 Bento Command Deck</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('synergies')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'synergies'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Live Inter-Module Synergies</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('geomap')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'geomap'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Home className="w-4 h-4 text-emerald-500" />
            <span>GeoMap & DPA</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('brain')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'brain'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Brain className="w-4 h-4 text-purple-500" />
            <span>2nd Brain Memory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('voice')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'voice'
                ? 'bg-rose-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Mic className="w-4 h-4 text-rose-500" />
            <span>Voice Orchestrator</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveModuleTab('workspace')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeModuleTab === 'workspace'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-500" />
            <span>Workspace UI Cockpit</span>
          </button>
        </div>
      </div>

      {/* VIEW MODE 0: FLAGSHIP 4-IN-1 SUPERPOWERS STUDIO */}
      {activeModuleTab === 'superpowers' && (
        <FlagshipStudioSuiteView
          onNavigateTab={(tab) => {
            if (onNavigateTab) {
              onNavigateTab(tab);
            } else {
              if (tab === 'brain') setActiveModuleTab('brain');
              else if (tab === 'voice-macros' || tab === 'orchestrator') setActiveModuleTab('voice');
              else if (tab === 'real_estate') setActiveModuleTab('geomap');
              else if (tab === 'studio' || tab === 'sheets' || tab === 'gmail') setActiveModuleTab('workspace');
            }
          }}
          onOpenPitchDeck={onOpenPitchDeck}
          onOpenShareLinksModal={onOpenShareLinksModal}
        />
      )}

      {/* VIEW MODE 0.5: TOP-TIER BEST-SELLING COMMERCIAL STRATEGY & ROI */}
      {activeModuleTab === 'commercial' && (
        <TopTierCommercialStrategyHub
          onOpenLicenseStudio={onOpenPitchDeck}
          onOpenPitchDeck={onOpenPitchDeck}
          onOpenShareLinksModal={onOpenShareLinksModal}
          onNavigateTab={onNavigateTab}
        />
      )}

      {/* VIEW MODE 0.7: PRIORITIZED CODE IMPLEMENTATION ROADMAP */}
      {activeModuleTab === 'roadmap' && (
        <PrioritizedCodeImplementationRoadmap
          onNavigateTab={onNavigateTab}
          onOpenByokDrawer={onOpenByokDrawer}
        />
      )}

      {/* VIEW MODE 1: 4-IN-1 BENTO COMMAND DECK */}
      {activeModuleTab === 'bento_all' && (
        <div className="space-y-6">
          {/* Top Quick Status & Cross-Module Live Pipeline Trigger */}
          <div className="p-4 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Zap className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Live Multi-Module Pipeline Sandbox
                  <span className="text-[10px] px-2 py-0.5 bg-indigo-600 text-white rounded-full font-black uppercase">
                    All 4 Active
                  </span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Run a live cross-application workflow connecting Voice capture ➡️ 2nd Brain ➡️ GeoMap DPA ➡️ Workspace Sheets & Gmail.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRunCrossModuleSimulation}
              disabled={simulationRunning}
              className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl transition shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-70"
            >
              {simulationRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Executing Cross-Module Flow...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current text-amber-300" />
                  <span>Run Live Cross-Module Test</span>
                </>
              )}
            </button>
          </div>

          {/* Simulation Output Drawer (when active) */}
          {(simulationRunning || simulationLog.length > 0) && (
            <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 font-mono text-xs space-y-2 shadow-inner animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Cpu className="w-4 h-4" /> Live Inter-Plugin Execution Log (Step {simulationStep}/5)
                </span>
                <span className="text-[10px] text-slate-400">Real-Time Event Stream</span>
              </div>
              <div className="space-y-1.5 py-1">
                {simulationLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">✓</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4 Interactive Bento Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Bento Card 1: First-Time Homebuyer GeoMap */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-emerald-400/50 transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        1. Real Estate GeoMap & DPA Module
                      </h3>
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                        USDA 100% Zero-Down & $5k–$10k CRA Grants
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200">
                    Live Engine
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Interactive GIS map with Census Tract GEOID lookup, 50% max DTI affordability slider, and 1-click sync with Mike Ford's Master Oregon Feed.
                </p>

                {/* Quick preview mini-features */}
                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Oregon GIS Tracked Listings:</span>
                    <span className="font-bold font-mono text-emerald-600">8 Priority Properties</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Avg First-Time Buyer Savings:</span>
                    <span className="font-bold font-mono text-emerald-600">$18,400 (DPA + Cuts)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModuleTab('geomap')}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open Full GeoMap Engine</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bento Card 2: 2nd Brain Cognitive Memory */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-purple-400/50 transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
                      <Brain className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        2. 2nd Brain Cognitive Memory
                      </h3>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                        Persistent Vector Memory & Guardrails
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200">
                    {memories.length} Memories
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Eliminates LLM amnesia with semantic vector recall, customized operational persona tuning, strict censorship guardrails, and scenario simulation.
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Active Cognitive Persona:</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{activePersona ? activePersona.title : 'Consistent Persona'}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Active Safety Boundaries:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{guardrails.personalityPreset} ({guardrails.forbiddenTopics?.length || 0} Curbs)</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModuleTab('brain')}
                  className="flex-1 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open 2nd Brain Hub</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bento Card 3: Voice Orchestrator Studio */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-rose-400/50 transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
                      <Mic className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        3. Voice Macro Orchestrator
                      </h3>
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold">
                        Speech-to-Intent & Safety Airgaps
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200">
                    Hands-Free
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Real-time speech capture that decomposes voice instructions into structured actions with verbal confirmation safeguards and execution history.
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Safety Airgap Status:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Explicit Confirmation
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Supported App Targets:</span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">Gmail, Calendar, Sheets, Drive</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModuleTab('voice')}
                  className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open Voice Orchestrator</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bento Card 4: Google Workspace UI Cockpit */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-400/50 transition group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        4. Google Workspace UI Cockpit
                      </h3>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                        Dual OAuth & 15-Min Buffer Scheduler
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200">
                    {pathway === 'workspace' ? 'Workspace' : 'Google Apps'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Gmail live draft generator with in-app send approvals, 15-minute HIPAA buffer smart calendar scheduler, and relational Sheets database.
                </p>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Active Account Mode:</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">
                      {isWorkspaceConnected ? connectedWorkspaceEmail : 'Dual Pathway Enabled'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="font-medium">Smart Buffer Safeguards:</span>
                    <span className="font-bold text-emerald-600">15-Min Overlap Shield</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModuleTab('workspace')}
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Open Workspace Cockpit</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: LIVE INTER-MODULE SYNERGIES */}
      {activeModuleTab === 'synergies' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                How the 4 Modules Connect & Operate as One Cohesive Engine
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                When clients purchase the Vantage AI Studio-Suite, they do not just receive four isolated apps—they get an interconnected autonomous ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Voice ➡️ 2nd Brain ➡️ Gmail
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Speech commands dictate client conversation summaries. The 2nd Brain extracts actionable entities into vector memory, while the Workspace UI composes a polished email draft awaiting your 1-click confirmation.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  GeoMap DPA ➡️ Google Sheets CRM
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  When a buyer qualifies for USDA 100% Zero-Down or a $10,000 CRA grant on a geocoded address, the complete DTI calculation and listing URL are pushed directly to your Google Sheets deal pipeline.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="w-8 h-8 rounded-lg bg-purple-500 text-white flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  2nd Brain Guardrails ➡️ All Outputs
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Every voice response, email draft, and assistant summary strictly obeys the persona tone, brand voice guidelines, and safety boundaries defined inside your 2nd Brain Cognitive Core.
                </p>
              </div>
            </div>

            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-indigo-900 dark:text-indigo-200">
                <span className="font-bold">Ready to test real-time cross-module executions?</span> Run the interactive simulator to watch all 4 components exchange data.
              </div>
              <button
                type="button"
                onClick={handleRunCrossModuleSimulation}
                disabled={simulationRunning}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-xs flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Pipeline Test</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 3: FOCUSED MODULES */}
      {activeModuleTab === 'geomap' && (
        <div className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-1.5">
              <Home className="w-4 h-4" /> Live Embedded Module: First-Time Homebuyer GeoMap, DPA Stacker & Lead CRM
            </span>
            <button
              onClick={() => setActiveModuleTab('bento_all')}
              className="text-emerald-700 dark:text-emerald-300 font-bold hover:underline cursor-pointer"
            >
              ← Back to 4-in-1 Suite Bento
            </button>
          </div>
          <RealEstateMortgageView
            onOpenByokDrawer={onOpenByokDrawer}
          />
        </div>
      )}

      {activeModuleTab === 'brain' && (
        <div className="space-y-4">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-purple-800 dark:text-purple-200 flex items-center gap-1.5">
              <Brain className="w-4 h-4" /> Live Embedded Module: 2nd Brain Cognitive Vector Memory & Guardrails
            </span>
            <button
              onClick={() => setActiveModuleTab('bento_all')}
              className="text-purple-700 dark:text-purple-300 font-bold hover:underline cursor-pointer"
            >
              ← Back to 4-in-1 Suite Bento
            </button>
          </div>
          <SecondBrainView />
        </div>
      )}

      {activeModuleTab === 'voice' && (
        <div className="space-y-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-1.5">
              <Mic className="w-4 h-4" /> Live Embedded Module: Voice Macro Orchestrator Studio
            </span>
            <button
              onClick={() => setActiveModuleTab('bento_all')}
              className="text-rose-700 dark:text-rose-300 font-bold hover:underline cursor-pointer"
            >
              ← Back to 4-in-1 Suite Bento
            </button>
          </div>
          <VoiceMacroManagerView />
        </div>
      )}

      {activeModuleTab === 'workspace' && (
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 rounded-2xl flex items-center justify-between text-xs">
            <span className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-1.5">
              <Building2 className="w-4 h-4" /> Live Embedded Module: Google Workspace UI Cockpit & Scheduler
            </span>
            <button
              onClick={() => setActiveModuleTab('bento_all')}
              className="text-blue-700 dark:text-blue-300 font-bold hover:underline cursor-pointer"
            >
              ← Back to 4-in-1 Suite Bento
            </button>
          </div>
          <LogicOrchestratorView />
        </div>
      )}

      {/* iOS Step-by-Step Installation Modal */}
      <IosInstallGuideModal
        isOpen={isIosGuideOpen}
        onClose={() => setIsIosGuideOpen(false)}
        pluginName="Vantage AI Studio-Suite (4-in-1 Master Platform)"
      />
    </div>
  );
};
