/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Mic, 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  Sparkles, 
  Volume2, 
  Save, 
  Play, 
  Layers, 
  ShieldCheck, 
  Sliders, 
  Radio, 
  RotateCcw, 
  Zap, 
  Home, 
  Mail, 
  Calendar, 
  FileText, 
  CheckSquare, 
  Brain,
  Info,
  ExternalLink
} from 'lucide-react';
import { VoiceMacroRecipe, VoiceSafetyAirgapConfig } from '../types/voiceMacro';
import { speakSpokenAirgap, DEFAULT_AIRGAP_CONFIG } from '../services/voiceMacroEngine';

interface VoiceMacroManagerViewProps {
  onExecuteWorkflow?: (name: string) => void;
  onExecuteCustomRecipe?: (recipe: VoiceMacroRecipe) => void;
}

export const VoiceMacroManagerView: React.FC<VoiceMacroManagerViewProps> = ({ 
  onExecuteWorkflow,
  onExecuteCustomRecipe 
}) => {
  const [macros, setMacros] = useState<VoiceMacroRecipe[]>(() => {
    try {
      const stored = localStorage.getItem('vantage_voice_macros');
      if (stored) return JSON.parse(stored);
    } catch {}
    return [
      {
        id: 'm1',
        triggerPhrase: 'Hey Copilot, run weekly status update',
        workflowName: 'AI Market Research & Executive Brief',
        description: 'Scrapes market sources, synthesizes with Gemini DeepThink, and prepares executive summary.',
        enabled: true,
        isCompoundRecipe: true,
        chainedActions: [
          { actionType: 'workspace_gmail_triage', label: 'Triage VIP Communications', payload: { filter: 'VIP' } },
          { actionType: 'workspace_docs_create', label: 'Generate Status Brief in Google Docs', payload: { title: 'Executive Status Brief' } },
          { actionType: 'workspace_calendar_buffer', label: 'Reserve 15-min Review Buffer', payload: { durationMinutes: 15 } }
        ]
      },
      {
        id: 'm2',
        triggerPhrase: 'Good morning briefing',
        workflowName: 'Competitor URL Scraper & Calendar Review',
        description: 'Scrapes competitor sites, checks unread messages, and schedules team sync.',
        enabled: true,
        isCompoundRecipe: true,
        chainedActions: [
          { actionType: 'workspace_gmail_triage', label: 'Scan Unread Morning Emails', payload: {} },
          { actionType: 'workspace_calendar_buffer', label: 'Schedule 30-min Strategy Sync', payload: { durationMinutes: 30 } }
        ]
      },
      {
        id: 'm3',
        triggerPhrase: 'Show me rural USDA properties',
        workflowName: 'Real Estate GeoMap Rural Explorer',
        description: 'Filters GeoMap for 100% USDA eligible properties with zero down payment envelope.',
        enabled: true,
        isCompoundRecipe: false,
        chainedActions: [
          { actionType: 'real_estate_filter', label: 'Filter USDA 100% Rural Eligible Pins', payload: { program: 'USDA' } }
        ]
      }
    ];
  });

  const [airgapConfig, setAirgapConfig] = useState<VoiceSafetyAirgapConfig>(() => {
    try {
      const stored = localStorage.getItem('vantage_voice_airgap_config');
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_AIRGAP_CONFIG;
  });

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [triggerInput, setTriggerInput] = useState<string>('');
  const [workflowInput, setWorkflowInput] = useState<string>('AI Market Research & Executive Brief');
  const [descInput, setDescInput] = useState<string>('');
  const [isCompoundRecipeInput, setIsCompoundRecipeInput] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [testingMacroId, setTestingMacroId] = useState<string | null>(null);

  const saveMacrosToStorage = (newMacros: VoiceMacroRecipe[]) => {
    setMacros(newMacros);
    try {
      localStorage.setItem('vantage_voice_macros', JSON.stringify(newMacros));
    } catch {}
  };

  const saveAirgapConfig = (newConfig: VoiceSafetyAirgapConfig) => {
    setAirgapConfig(newConfig);
    try {
      localStorage.setItem('vantage_voice_airgap_config', JSON.stringify(newConfig));
    } catch {}
  };

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerInput.trim()) return;

    const newMacro: VoiceMacroRecipe = {
      id: 'macro_' + Date.now(),
      triggerPhrase: triggerInput,
      workflowName: workflowInput,
      description: descInput || 'Custom autonomous voice macro sequence.',
      enabled: true,
      isCompoundRecipe: isCompoundRecipeInput,
      createdAt: new Date().toISOString()
    };

    saveMacrosToStorage([newMacro, ...macros]);
    setTriggerInput('');
    setDescInput('');
    setShowAddModal(false);
    setSuccessMsg(`Successfully created voice macro alias "${triggerInput}"!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const deleteMacro = (id: string) => {
    saveMacrosToStorage(macros.filter(m => m.id !== id));
    setSuccessMsg('Successfully deleted voice macro.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleMacro = (id: string) => {
    saveMacrosToStorage(macros.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const handleTestSpokenSimulation = (macro: VoiceMacroRecipe) => {
    setTestingMacroId(macro.id);
    const spokenText = `Simulating voice macro "${macro.triggerPhrase}". This triggers ${macro.workflowName} with safety airgap confirmation.`;
    
    speakSpokenAirgap(spokenText, () => {
      setTestingMacroId(null);
      if (onExecuteWorkflow) {
        onExecuteWorkflow(macro.workflowName);
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header Card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <Mic className="w-4 h-4" /> Voice Macro Orchestration & Intent Router
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Autonomous Voice Aliases & Multi-Step Recipes
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-3xl">
            Deconstruct compound spoken voice commands into sequential workspace tool actions, enforce verbal safety airgaps, and bridge seamlessly with our 2nd Brain cognitive vault and GeoMap engines.
          </p>
          <div className="flex items-center gap-2 pt-1 text-xs text-slate-400 dark:text-slate-500">
            <span>Author & Commercial Copyright:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Mike Ford</span>
            <span>(&lt;fordmj@gmail.com&gt;)</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Voice Alias
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2-Column Grid: Macro List + Safety Airgap Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Registered Voice Macros */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Registered Voice Triggers & Compound Recipes ({macros.length})
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Press ⌘K anywhere to trigger voice recognition
            </span>
          </div>

          <div className="space-y-4">
            {macros.map((macro) => (
              <div
                key={macro.id}
                className={`p-5 rounded-2xl border transition-all shadow-xs ${
                  macro.enabled
                    ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                    : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-bold text-xs rounded-lg border border-blue-200 dark:border-blue-900">
                        <Mic className="w-3.5 h-3.5" />
                        &ldquo;{macro.triggerPhrase}&rdquo;
                      </span>
                      {macro.isCompoundRecipe && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300">
                          Compound Multi-Step
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {macro.workflowName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {macro.description}
                    </p>

                    {/* Chained Action Step Badges */}
                    {macro.chainedActions && macro.chainedActions.length > 0 && (
                      <div className="pt-2 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Steps:</span>
                        {macro.chainedActions.map((action, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md border border-slate-200 dark:border-slate-700"
                          >
                            <span className="text-[9px] font-bold text-slate-400">{idx + 1}.</span>
                            <span>{action.label}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                    <button
                      onClick={() => handleTestSpokenSimulation(macro)}
                      disabled={testingMacroId === macro.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer disabled:opacity-50"
                      title="Test Audio Airgap Simulation"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span>{testingMacroId === macro.id ? 'Speaking...' : 'Test Speech'}</span>
                    </button>

                    <button
                      onClick={() => toggleMacro(macro.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        macro.enabled
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {macro.enabled ? 'Enabled' : 'Disabled'}
                    </button>

                    <button
                      onClick={() => deleteMacro(macro.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/60 rounded-lg transition cursor-pointer"
                      title="Delete Macro"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Verbal Safety Airgap & System Architecture */}
        <div className="space-y-6">
          
          {/* Airgap Config Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verbal Safety Airgap Settings
              </h3>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">
                Active
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Enforce spoken confirmation before performing external actions, email dispatches, or mutations.
            </p>

            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <span>Spoken TTS Audio Prompts</span>
                <input
                  type="checkbox"
                  checked={airgapConfig.spokenAudioFeedback}
                  onChange={(e) => saveAirgapConfig({ ...airgapConfig, spokenAudioFeedback: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <span>Require Spoken Affirmation (&ldquo;Yes&rdquo;)</span>
                <input
                  type="checkbox"
                  checked={airgapConfig.requireSpokenAffirmation}
                  onChange={(e) => saveAirgapConfig({ ...airgapConfig, requireSpokenAffirmation: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
                <span>Confirm External Email Drafts</span>
                <input
                  type="checkbox"
                  checked={airgapConfig.requireConfirmationForExternalSends}
                  onChange={(e) => saveAirgapConfig({ ...airgapConfig, requireConfirmationForExternalSends: e.target.checked })}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>

              <div className="pt-2 space-y-1">
                <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
                  <span>Quick-Undo Rollback Window:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-200">{airgapConfig.undoWindowSeconds} seconds</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={20}
                  step={1}
                  value={airgapConfig.undoWindowSeconds}
                  onChange={(e) => saveAirgapConfig({ ...airgapConfig, undoWindowSeconds: parseInt(e.target.value, 10) })}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 2nd Brain Cognitive Bridge Info */}
          <div className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-indigo-500/10 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/60 space-y-3">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                2nd Brain Voice Ingestion Engine
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Say &ldquo;Remember that...&rdquo; to automatically vectorize and embed spoken knowledge into your persistent Firestore memory vault.
            </p>
            <div className="text-[11px] p-2.5 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-purple-100 dark:border-purple-900 text-purple-900 dark:text-purple-200">
              💡 <em>&ldquo;Remember that client John prefers 30-year fixed loans with 5% down&rdquo;</em>
            </div>
          </div>

        </div>

      </div>

      {/* Add Macro Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Mic className="w-4 h-4 text-blue-600" /> Create Voice Alias
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddMacro} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Spoken Trigger Phrase
                </label>
                <input
                  type="text"
                  required
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  placeholder="e.g., Good afternoon review, Run daily scan"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Target Workflow Name
                </label>
                <input
                  type="text"
                  required
                  value={workflowInput}
                  onChange={(e) => setWorkflowInput(e.target.value)}
                  placeholder="e.g., AI Market Research & Executive Brief"
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Describe what this voice sequence accomplishes..."
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition cursor-pointer"
                >
                  Save Voice Alias
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
