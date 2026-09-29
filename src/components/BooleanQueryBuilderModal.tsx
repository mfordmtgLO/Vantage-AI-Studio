/**
 * @file BooleanQueryBuilderModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Boolean Operator (AND, OR, NOT) Query Builder & Low Yield Monitor Modal
 * Gives Loan Officers precise control over scraped lead keyword inclusion and exclusions.
 */

import React, { useState } from 'react';
import { 
  SlidersHorizontal, 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Copy, 
  Check, 
  AlertTriangle, 
  Search,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { 
  BooleanScrapeConfig, 
  BooleanQueryPreset, 
  DEFAULT_BOOLEAN_PRESETS, 
  LeadBooleanScrapeService,
  YieldMonitorConfig
} from '../services/leadBooleanScrapeService';

interface BooleanQueryBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BooleanScrapeConfig;
  onSaveConfig: (newConfig: BooleanScrapeConfig) => void;
  yieldConfig: YieldMonitorConfig;
  onSaveYieldConfig: (newYieldConfig: YieldMonitorConfig) => void;
  stateCode: string;
  stateName: string;
  countyName: string;
  searchRadiusMiles: number;
}

export const BooleanQueryBuilderModal: React.FC<BooleanQueryBuilderModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  yieldConfig,
  onSaveYieldConfig,
  stateCode,
  stateName,
  countyName,
  searchRadiusMiles
}) => {
  const [localConfig, setLocalConfig] = useState<BooleanScrapeConfig>({ ...config });
  const [localYieldConfig, setLocalYieldConfig] = useState<YieldMonitorConfig>({ ...yieldConfig });
  
  const [newAndTerm, setNewAndTerm] = useState('');
  const [newOrTerm, setNewOrTerm] = useState('');
  const [newNotTerm, setNewNotTerm] = useState('');
  const [copiedQuery, setCopiedQuery] = useState(false);
  const [saveToast, setSaveToast] = useState(false);

  if (!isOpen) return null;

  const handleAddAndTerm = () => {
    if (!newAndTerm.trim()) return;
    const term = newAndTerm.trim();
    if (!localConfig.andTerms.includes(term)) {
      setLocalConfig(prev => ({
        ...prev,
        andTerms: [...prev.andTerms, term]
      }));
    }
    setNewAndTerm('');
  };

  const handleRemoveAndTerm = (term: string) => {
    setLocalConfig(prev => ({
      ...prev,
      andTerms: prev.andTerms.filter(t => t !== term)
    }));
  };

  const handleAddOrTerm = () => {
    if (!newOrTerm.trim()) return;
    const term = newOrTerm.trim();
    if (!localConfig.orTerms.includes(term)) {
      setLocalConfig(prev => ({
        ...prev,
        orTerms: [...prev.orTerms, term]
      }));
    }
    setNewOrTerm('');
  };

  const handleRemoveOrTerm = (term: string) => {
    setLocalConfig(prev => ({
      ...prev,
      orTerms: prev.orTerms.filter(t => t !== term)
    }));
  };

  const handleAddNotTerm = () => {
    if (!newNotTerm.trim()) return;
    const term = newNotTerm.trim();
    if (!localConfig.notTerms.includes(term)) {
      setLocalConfig(prev => ({
        ...prev,
        notTerms: [...prev.notTerms, term]
      }));
    }
    setNewNotTerm('');
  };

  const handleRemoveNotTerm = (term: string) => {
    setLocalConfig(prev => ({
      ...prev,
      notTerms: prev.notTerms.filter(t => t !== term)
    }));
  };

  const handleApplyPreset = (preset: BooleanQueryPreset) => {
    setLocalConfig({
      enabled: true,
      activePresetId: preset.id,
      andTerms: [...preset.andTerms],
      orTerms: [...preset.orTerms],
      notTerms: [...preset.notTerms],
      useRawQueryMode: false
    });
  };

  const compiledExpression = LeadBooleanScrapeService.compileToBooleanExpression(localConfig);
  const compiledGroundingQuery = LeadBooleanScrapeService.compileToSearchGroundingQuery(
    localConfig,
    stateName,
    countyName,
    searchRadiusMiles
  );

  const handleSaveAndApply = () => {
    onSaveConfig(localConfig);
    onSaveYieldConfig(localYieldConfig);
    LeadBooleanScrapeService.saveBooleanConfig(localConfig);
    LeadBooleanScrapeService.saveYieldMonitorConfig(localYieldConfig);
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      onClose();
    }, 600);
  };

  const handleCopyCompiled = () => {
    navigator.clipboard.writeText(compiledExpression);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-hidden animate-in fade-in">
      <div className="w-full max-w-3xl max-h-[calc(100vh-2rem)] sm:max-h-[92vh] rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95">
        
        {/* Pinned Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-md">
              <SlidersHorizontal className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Boolean Query Matrix &amp; Keyword Exclusions
                </h2>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-extrabold uppercase tracking-wider border border-emerald-500/30">
                  AND / OR / NOT
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Refine intent search parameters to include target phrases and filter out irrelevant noise.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          
          {/* Engine Master Toggle & Active Preset Selector */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-white text-xs block">
                  Boolean Filter Engine Status
                </span>
                <span className="text-[11px] text-slate-400">
                  {localConfig.enabled 
                    ? 'Active: Filtering incoming scrape threads and Google Search Grounding queries' 
                    : 'Paused: Scrapes match broad geographic radius without keyword filtering'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setLocalConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`w-12 h-6 flex items-center rounded-full p-1 transition cursor-pointer ${
                  localConfig.enabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-4 h-4 rounded-full shadow-md" />
              </button>
            </div>
          </div>

          {/* 1-Click Mortgage Strategy Presets */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Mortgage Strategy Presets</span>
              </label>
              <span className="text-[10px] text-slate-400">Select any preset to auto-load optimal keywords</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEFAULT_BOOLEAN_PRESETS.map((preset) => {
                const isActive = localConfig.activePresetId === preset.id;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className={`p-3.5 rounded-xl text-left border transition cursor-pointer flex flex-col justify-between gap-2 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-950/90 to-purple-950/90 border-indigo-400 ring-1 ring-indigo-400/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{preset.icon}</span>
                        <span className={`text-xs font-extrabold ${isActive ? 'text-white' : 'text-slate-200'}`}>
                          {preset.name}
                        </span>
                      </div>
                      {isActive && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3-Section Visual Keyword Chip Builder */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">
              Visual Keyword Operator Matrix
            </h3>

            {/* 1. Include ANY (OR) Keywords */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black border border-emerald-500/40 uppercase">
                    OR • Include ANY
                  </span>
                  <span className="text-xs font-bold text-white">Target Programs &amp; Loan Questions</span>
                </div>
                <span className="text-[10px] text-slate-400">{localConfig.orTerms.length} active keywords</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Matches discussions containing <strong>at least one</strong> of these assistance or mortgage phrases.
              </p>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5">
                {localConfig.orTerms.map((term, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
                  >
                    <span>"{term}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveOrTerm(term)}
                      className="text-emerald-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newOrTerm}
                  onChange={(e) => setNewOrTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddOrTerm())}
                  placeholder="Add phrase (e.g. 'Lakeview 100%', 'seller credit', 'rate buydown')..."
                  className="grow px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={handleAddOrTerm}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add OR</span>
                </button>
              </div>
            </div>

            {/* 2. Require ALL (AND) Keywords */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-indigo-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-black border border-indigo-500/40 uppercase">
                    AND • Require ALL
                  </span>
                  <span className="text-xs font-bold text-white">Mandatory Intent Signals</span>
                </div>
                <span className="text-[10px] text-slate-400">{localConfig.andTerms.length} required phrases</span>
              </div>
              <p className="text-[11px] text-slate-400">
                The lead discussion <strong>must</strong> contain every phrase specified here.
              </p>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5">
                {localConfig.andTerms.map((term, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 text-xs font-bold"
                  >
                    <span>"{term}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAndTerm(term)}
                      className="text-indigo-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {localConfig.andTerms.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No mandatory AND terms (all buyer inquiries eligible)</span>
                )}
              </div>

              {/* Add Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newAndTerm}
                  onChange={(e) => setNewAndTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAndTerm())}
                  placeholder="Add mandatory phrase (e.g. 'first-time buyer', 'pre-approval')..."
                  className="grow px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddAndTerm}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add AND</span>
                </button>
              </div>
            </div>

            {/* 3. Exclude (NOT) Keywords */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-rose-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[10px] font-black border border-rose-500/40 uppercase">
                    NOT • Exclude Noise
                  </span>
                  <span className="text-xs font-bold text-white">Negative Keyword Blacklist</span>
                </div>
                <span className="text-[10px] text-rose-400">{localConfig.notTerms.length} excluded phrases</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Immediately disqualifies discussions mentioning commercial deals, landlords, or cash buyers.
              </p>

              {/* Tag Chips */}
              <div className="flex flex-wrap gap-1.5">
                {localConfig.notTerms.map((term, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/80 text-rose-300 border border-rose-500/40 text-xs font-bold"
                  >
                    <span>NOT "{term}"</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNotTerm(term)}
                      className="text-rose-400 hover:text-white cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Input */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newNotTerm}
                  onChange={(e) => setNewNotTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNotTerm())}
                  placeholder="Add exclusion (e.g. 'wholesaler', 'commercial', 'landlord', 'hard money')..."
                  className="grow px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  type="button"
                  onClick={handleAddNotTerm}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add NOT</span>
                </button>
              </div>
            </div>
          </div>

          {/* Compiled Live Expression Preview */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">
                Compiled Boolean Expression (Pass-to-Harness)
              </span>
              <button
                type="button"
                onClick={handleCopyCompiled}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition cursor-pointer"
              >
                {copiedQuery ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedQuery ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/90 font-mono text-xs text-emerald-300 break-all border border-slate-800 select-all">
              {compiledExpression}
            </div>
            <p className="text-[10px] text-slate-400">
              Grounding query for Gemini SDK: <code className="text-slate-300 font-mono">{compiledGroundingQuery}</code>
            </p>
          </div>

          {/* Scrape Result Count Monitor & Low-Yield Advisor Configuration */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-950 to-indigo-950/40 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Scrape Result Count Monitor &amp; Radius Expansion Advisor
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setLocalYieldConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`w-9 h-5 flex items-center rounded-full p-1 transition cursor-pointer ${
                  localYieldConfig.enabled ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
                }`}
              >
                <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Monitors the number of high-intent leads returned on every sweep. If a scrape produces fewer leads than your minimum threshold, the dashboard will automatically notify you and suggest broadening your geographic search radius (e.g. from Single County $\rightarrow$ Metro $\rightarrow$ State-Wide) to prevent missing buyers.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-300 font-bold">Minimum Yield Alert Threshold:</span>
                <select
                  value={localYieldConfig.minLeadYieldThreshold}
                  onChange={(e) => setLocalYieldConfig(prev => ({ ...prev, minLeadYieldThreshold: parseInt(e.target.value, 10) }))}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
                >
                  <option value="3">&lt; 3 leads (Conservative)</option>
                  <option value="5">&lt; 5 leads (Standard)</option>
                  <option value="8">&lt; 8 leads (Recommended)</option>
                  <option value="12">&lt; 12 leads (High Volume)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localYieldConfig.autoSuggestBroadening}
                    onChange={(e) => setLocalYieldConfig(prev => ({ ...prev, autoSuggestBroadening: e.target.checked }))}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>1-Click Radius Recovery Advisor</span>
                </label>
              </div>
            </div>
          </div>

        </div>

        {/* Pinned Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {saveToast && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Configuration Saved &amp; Applied!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAndApply}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Apply &amp; Save Matrix</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
