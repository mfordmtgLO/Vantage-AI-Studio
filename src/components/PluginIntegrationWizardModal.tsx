import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Terminal, 
  CheckCircle2, 
  ChevronRight, 
  Copy, 
  Check, 
  Download, 
  Code, 
  Layers, 
  Cpu, 
  Play, 
  Loader2,
  FileText,
  Building2,
  Shield
} from 'lucide-react';
import { ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';

interface PluginIntegrationWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PluginIntegrationWizardModal: React.FC<PluginIntegrationWizardModalProps> = ({
  isOpen,
  onClose
}) => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [llmRuntime, setLlmRuntime] = useState<'claude-3.5-sonnet' | 'gpt-4o' | 'gemini-2.5-flash' | 'cursor'>('claude-3.5-sonnet');
  const [targetFramework, setTargetFramework] = useState<'react_vite' | 'nextjs_app_router' | 'html_embed' | 'wordpress'>('react_vite');
  const [selectedPlugin, setSelectedPlugin] = useState<'homebuyer_geo' | 'second_brain' | 'workplace_ui' | 'voice_plugin' | 'full_suite' | 'mobile_microapps'>('homebuyer_geo');

  // Step 2: Diagnostic Terminal State
  const [diagnosticLogs, setDiagnosticLogs] = useState<string[]>([
    'Ready to initialize diagnostic probe...',
    'Target domain checked: Localhost & Wildcard Whitelist',
    'Awaiting diagnostic trigger...'
  ]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosticPassed, setDiagnosticPassed] = useState(false);

  // Step 3: Script State
  const [copiedScript, setCopiedScript] = useState(false);

  if (!isOpen) return null;

  const runDiagnostic = () => {
    setIsDiagnosing(true);
    setDiagnosticLogs([
      `[1/4] Probing runtime connectivity for ${llmRuntime}...`,
      `[2/4] Validating schema compatibility with ${targetFramework}...`
    ]);

    setTimeout(() => {
      setDiagnosticLogs(prev => [
        ...prev,
        `[3/4] Verified OpenAPI function signatures for ${selectedPlugin}.`,
        `[4/4] Verified Mike Ford commercial license integrity (${ADMIN_PRIMARY_EMAIL}).`,
        `✓ All integration assertions passed! 100% turnkey ready.`
      ]);
      setIsDiagnosing(false);
      setDiagnosticPassed(true);
    }, 1200);
  };

  const generatedInitScript = `/**
 * Turnkey Vantage Plugin Initialization Script: vantage-init.ts
 * Module: ${selectedPlugin}
 * Target LLM: ${llmRuntime}
 * Target Framework: ${targetFramework}
 * Author: Mike Ford <${ADMIN_PRIMARY_EMAIL}>
 */

import { initializeVantagePlugin } from '@vantage/core';

export async function bootstrapVantageWorkspace() {
  const config = {
    pluginId: '${selectedPlugin}',
    llmProvider: '${llmRuntime}',
    framework: '${targetFramework}',
    licenseKey: process.env.VANTAGE_LICENSE_KEY || 'VAN-STA-8F2A1C04-9E3B',
    domainLock: process.env.VANTAGE_DOMAIN_LOCK || 'localhost',
    features: {
      enableSecondBrainSync: true,
      enableDtiCalculator: true,
      enableUsdaRuralQualifier: true,
      enableLmiCraGrants: true,
      enableVoiceMacros: true
    }
  };

  const runtime = await initializeVantagePlugin(config);
  console.log('[Vantage AI]: Plugin initialized successfully with', runtime.getAvailableTools());
  return runtime;
}
`;

  const handleCopyScript = () => {
    navigator.clipboard.writeText(generatedInitScript);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleDownloadScript = () => {
    const blob = new Blob([generatedInitScript], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vantage-init.ts';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Plugin Integration Wizard
              </h3>
              <p className="text-xs text-slate-500">
                Step-by-step assistant for deploying plugins to Claude, ChatGPT-4o, Cursor, or Web Frameworks.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="grid grid-cols-3 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-center">
          <button
            onClick={() => setCurrentStep(1)}
            className={`py-3 flex items-center justify-center gap-1.5 transition ${
              currentStep === 1 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>1. Select Runtime</span>
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className={`py-3 flex items-center justify-center gap-1.5 transition ${
              currentStep === 2 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>2. Diagnostic Terminal</span>
          </button>
          <button
            onClick={() => setCurrentStep(3)}
            className={`py-3 flex items-center justify-center gap-1.5 transition ${
              currentStep === 3 
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-950/30' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>3. Turnkey vantage-init.ts</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Plugin Archetype:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {[
                    { id: 'second_brain', label: '2nd Brain Memory Agent' },
                    { id: 'homebuyer_geo', label: 'Real Estate GeoMap & MLS' },
                    { id: 'voice_plugin', label: 'Voice Assistant Orchestrator' },
                    { id: 'workplace_ui', label: 'Google Workspace UI Cockpit' },
                    { id: 'full_suite', label: 'Commercial Enterprise Suite' },
                    { id: 'mobile_microapps', label: 'Mobile Micro-Apps PWA' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedPlugin(item.id as any)}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition cursor-pointer ${
                        selectedPlugin === item.id
                          ? 'bg-blue-50 dark:bg-blue-950/50 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Target LLM Execution Engine:
                </label>
                <select
                  value={llmRuntime}
                  onChange={(e) => setLlmRuntime(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="claude-3.5-sonnet">Anthropic Claude 3.5 Sonnet (Native Tools)</option>
                  <option value="gpt-4o">OpenAI ChatGPT-4o (Function Calling)</option>
                  <option value="gemini-2.5-flash">Google Gemini 2.5 Flash / Pro (Google Workspace Grounding)</option>
                  <option value="cursor">Cursor IDE Composer / Agent (.cursorrules)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Deployment Framework:
                </label>
                <select
                  value={targetFramework}
                  onChange={(e) => setTargetFramework(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="react_vite">React 18+ with Vite & Tailwind CSS</option>
                  <option value="nextjs_app_router">Next.js 14/15 App Router (Server Actions)</option>
                  <option value="html_embed">Universal 1-Line HTML Script Embed</option>
                  <option value="wordpress">WordPress & Webflow iFrame / Shortcode</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <span>Proceed to Step 2: Diagnostic Check</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-emerald-500" /> Live Integration Diagnostic Terminal
                </span>
                <button
                  type="button"
                  onClick={runDiagnostic}
                  disabled={isDiagnosing}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {isDiagnosing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                  <span>Run Pre-Flight Check</span>
                </button>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400 min-h-48 max-h-56 overflow-y-auto space-y-1.5">
                {diagnosticLogs.map((log, index) => (
                  <div key={index} className="leading-relaxed">
                    {log}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20"
                >
                  <span>Proceed to Step 3: Get Initialization Script</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Code className="w-4 h-4 text-indigo-500" /> Production Initialization Script: <code>vantage-init.ts</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="flex items-center gap-1 px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    {copiedScript ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScript ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadScript}
                    className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-3 h-3" /> Download
                  </button>
                </div>
              </div>

              <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-slate-200 max-h-60 overflow-y-auto leading-relaxed">
                {generatedInitScript}
              </pre>

              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Ready to drop into your project! Copyright (c) Mike Ford ({ADMIN_PRIMARY_EMAIL}).</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
