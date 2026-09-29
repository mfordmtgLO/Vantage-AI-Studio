/**
 * @file AutoArchiveRuleModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Auto-Archive Rule Configuration & Dormant Threshold Studio Modal
 * Allows Loan Officers to define a 'Max Dormant Days' threshold after which the AI
 * automatically migrates stale or unresponsive leads into Firestore's 'Stored Archives' collection.
 */

import React, { useState, useMemo } from 'react';
import {
  Archive,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Zap,
  RotateCcw,
  X,
  Sparkles,
  ShieldCheck,
  Check,
  ChevronRight,
  Database,
  Bell
} from 'lucide-react';
import {
  AutoArchiveRuleConfig,
  DEFAULT_AUTO_ARCHIVE_RULE,
  LeadAutoArchiveService,
  calculateLeadDormantDays
} from '../services/leadAutoArchiveService';

interface LeadCandidate {
  id: string;
  authorOrUser: string;
  platform: string;
  location: string;
  matchedProgram: string;
  status: string;
  timestamp?: number;
  discoveredAt?: string;
  snippet?: string;
}

interface AutoArchiveRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  leads: LeadCandidate[];
  onExecuteAutoArchiveNow: (config: AutoArchiveRuleConfig) => Promise<{ count: number; summary: string }>;
  onConfigSaved?: (config: AutoArchiveRuleConfig) => void;
}

const PRESET_THRESHOLDS = [
  { days: 3, label: '3 Days', desc: 'Hyper-Fresh (Fast Pace)' },
  { days: 7, label: '7 Days', desc: 'Weekly (Standard)' },
  { days: 14, label: '14 Days', desc: 'Bi-Weekly (Recommended)', badge: 'Recommended' },
  { days: 21, label: '21 Days', desc: '3-Week Window' },
  { days: 30, label: '30 Days', desc: 'Monthly Review' },
  { days: 60, label: '60 Days', desc: 'Extended Pipeline' }
];

export const AutoArchiveRuleModal: React.FC<AutoArchiveRuleModalProps> = ({
  isOpen,
  onClose,
  leads,
  onExecuteAutoArchiveNow,
  onConfigSaved
}) => {
  const [config, setConfig] = useState<AutoArchiveRuleConfig>(() => LeadAutoArchiveService.getRuleConfig());
  const [isRunningSweep, setIsRunningSweep] = useState(false);
  const [executionFeedback, setExecutionFeedback] = useState<string | null>(null);
  const [savedSuccessMsg, setSavedSuccessMsg] = useState<string | null>(null);

  // Synchronize config when opened
  React.useEffect(() => {
    if (isOpen) {
      const current = LeadAutoArchiveService.getRuleConfig();
      setConfig(current);
      setExecutionFeedback(null);
      setSavedSuccessMsg(null);
    }
  }, [isOpen]);

  // Real-time calculation of eligible leads based on the current threshold setting
  const { eligibleLeads, safeLeads, alreadyArchivedCount } = useMemo(() => {
    const eligible: (LeadCandidate & { dormantDays: number })[] = [];
    const safe: (LeadCandidate & { dormantDays: number })[] = [];
    let archived = 0;

    leads.forEach((l) => {
      if (l.status === 'archived_discovery') {
        archived++;
        return;
      }
      const days = calculateLeadDormantDays(l);
      if (days >= config.maxDormantDays) {
        eligible.push({ ...l, dormantDays: days });
      } else {
        safe.push({ ...l, dormantDays: days });
      }
    });

    return {
      eligibleLeads: eligible.sort((a, b) => b.dormantDays - a.dormantDays),
      safeLeads: safe,
      alreadyArchivedCount: archived
    };
  }, [leads, config.maxDormantDays]);

  if (!isOpen) return null;

  const handleSave = async () => {
    await LeadAutoArchiveService.saveRuleConfig(config);
    if (onConfigSaved) {
      onConfigSaved(config);
    }
    setSavedSuccessMsg(`✓ Auto-Archive rule saved! Threshold set to ${config.maxDormantDays} dormant days.`);
    setTimeout(() => {
      setSavedSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_AUTO_ARCHIVE_RULE);
    setExecutionFeedback('Reset to default recommended rule (14 days threshold). Click Save to apply.');
  };

  const handleTriggerSweepNow = async () => {
    setIsRunningSweep(true);
    setExecutionFeedback('Analyzing lead dormancy thresholds and moving matching leads to Firestore stored_archives collection...');
    try {
      const result = await onExecuteAutoArchiveNow(config);
      setExecutionFeedback(`✓ Success: ${result.summary}`);
      const updated = LeadAutoArchiveService.getRuleConfig();
      setConfig(updated);
    } catch (err: any) {
      setExecutionFeedback(`❌ Error executing auto-archive sweep: ${err.message || err}`);
    } finally {
      setIsRunningSweep(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-emerald-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Auto-Archive Rule &amp; Dormant Threshold
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  config.enabled 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {config.enabled ? '● Rule Active' : '○ Rule Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Automatically transitions leads exceeding your &apos;Max Dormant Days&apos; threshold to the Firestore <code className="text-emerald-300 bg-slate-900 px-1 py-0.5 rounded font-mono">stored_archives</code> collection.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Master Enable Toggle Card */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-sm font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Autonomous Dormant Lead Archiving Engine</span>
              </span>
              <p className="text-xs text-slate-400">
                When enabled, the AI automatically identifies prospects with no conversation activity exceeding your chosen threshold and parks them into Stored Archives.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
              className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                config.enabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  config.enabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Section 1: Define 'Max Dormant Days' Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Define &apos;Max Dormant Days&apos; Threshold</span>
              </label>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-slate-400">Current Threshold:</span>
                <span className="font-extrabold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  {config.maxDormantDays} Days
                </span>
              </div>
            </div>

            {/* Threshold Preset Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PRESET_THRESHOLDS.map((preset) => {
                const isSelected = config.maxDormantDays === preset.days;
                return (
                  <button
                    key={preset.days}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, maxDormantDays: preset.days }))}
                    className={`p-3 rounded-2xl text-left border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/30 text-white'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    {preset.badge && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase tracking-wider">
                        {preset.badge}
                      </span>
                    )}
                    <div className="font-black text-sm text-white flex items-center gap-1.5">
                      <span>{preset.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {preset.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Custom Slider & Numeric Input */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex-1 space-y-1">
                <span className="text-[11px] font-bold text-slate-300">Custom Day Threshold Slider:</span>
                <input
                  type="range"
                  min={1}
                  max={90}
                  value={config.maxDormantDays}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxDormantDays: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>1 day</span>
                  <span>14 days</span>
                  <span>30 days</span>
                  <span>60 days</span>
                  <span>90 days</span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <span className="text-xs text-slate-400">Custom Days:</span>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={config.maxDormantDays}
                  onChange={(e) => setConfig(prev => ({ ...prev, maxDormantDays: Math.max(1, parseInt(e.target.value) || 1) }))}
                  className="w-20 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-center font-mono font-black text-amber-400 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Real-Time Audit Metrics & Impact Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Live Impact Audit on Current Pipeline</span>
              </span>
              <span className="text-[11px] text-slate-400">
                Destination: <strong className="text-emerald-300 font-mono">/stored_archives</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 space-y-1">
                <span className="text-[11px] font-bold text-amber-300">Qualifying for Auto-Archive:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-amber-400">{eligibleLeads.length}</span>
                  <span className="text-xs text-amber-300/80">leads &ge; {config.maxDormantDays} days</span>
                </div>
                <p className="text-[10px] text-amber-300/70">
                  Will move to Stored Archives upon sweep
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 space-y-1">
                <span className="text-[11px] font-bold text-emerald-300">Safe Active Leads:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-emerald-400">{safeLeads.length}</span>
                  <span className="text-xs text-emerald-300/80">leads &lt; {config.maxDormantDays} days</span>
                </div>
                <p className="text-[10px] text-emerald-300/70">
                  Stay in active discovery queue
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="text-[11px] font-bold text-slate-400">Total Lifetime Auto-Archived:</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">{config.totalArchivedCount || 0}</span>
                  <span className="text-xs text-slate-400">({alreadyArchivedCount} in portal)</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Stored persistently in Firestore
                </p>
              </div>
            </div>

            {/* List of Qualifying Leads Preview */}
            {eligibleLeads.length > 0 && (
              <div className="rounded-2xl border border-amber-500/30 bg-slate-950/90 p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Leads Meeting Auto-Archive Threshold ({eligibleLeads.length}):</span>
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Will be isolated from daily noise &amp; kept searchable
                  </span>
                </div>

                <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                  {eligibleLeads.slice(0, 6).map((lead) => (
                    <div
                      key={lead.id}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                        <span className="font-bold text-white truncate">{lead.authorOrUser}</span>
                        <span className="text-[11px] text-slate-400 truncate">• {lead.location}</span>
                        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">({lead.platform})</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono font-black border border-amber-500/30">
                          {lead.dormantDays}d inactive
                        </span>
                        <span className="text-[10px] text-slate-400">
                          &ge; {config.maxDormantDays}d
                        </span>
                      </div>
                    </div>
                  ))}
                  {eligibleLeads.length > 6 && (
                    <p className="text-[10px] text-center text-slate-400 pt-1">
                      + {eligibleLeads.length - 6} more leads matching this threshold
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Execution Settings Checkboxes */}
          <div className="space-y-2.5 p-4 rounded-2xl bg-slate-950/70 border border-slate-800">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-purple-400" />
              <span>Autonomous Trigger Settings</span>
            </span>

            <div className="space-y-2 text-xs text-slate-300 pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoRunOnSweep}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoRunOnSweep: e.target.checked }))}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white">Auto-evaluate and move dormant leads during Target County Sweeps</span>
                  <p className="text-[11px] text-slate-400">
                    Whenever you or the cron scheduler runs a county lead sweep, automatically archive leads exceeding {config.maxDormantDays} days.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.autoRunOnMount}
                  onChange={(e) => setConfig(prev => ({ ...prev, autoRunOnMount: e.target.checked }))}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white">Auto-evaluate on Lead Discovery Studio launch</span>
                  <p className="text-[11px] text-slate-400">
                    Performs a silent background audit when the portal opens to keep the active feed clean.
                  </p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.notifyOnArchive}
                  onChange={(e) => setConfig(prev => ({ ...prev, notifyOnArchive: e.target.checked }))}
                  className="mt-0.5 rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    <span>Display notification banner when leads are automatically archived</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Shows summary toast and updates the Stored Archives counter badge in real-time.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Feedback & Status Messages */}
          {executionFeedback && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-semibold animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{executionFeedback}</span>
            </div>
          )}

          {savedSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{savedSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
            title="Reset rule to recommended 14-day threshold"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset to Default (14d)</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Immediate Action: Trigger Sweep Now */}
            <button
              type="button"
              onClick={handleTriggerSweepNow}
              disabled={isRunningSweep || !config.enabled}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md disabled:opacity-50"
              title={`Move all ${eligibleLeads.length} qualifying leads to Stored Archives now`}
            >
              <Zap className={`w-3.5 h-3.5 ${isRunningSweep ? 'animate-spin' : ''}`} />
              <span>
                {isRunningSweep ? 'Executing Sweep...' : `⚡ Run Auto-Archive Now (${eligibleLeads.length})`}
              </span>
            </button>

            {/* Save Settings */}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg ring-1 ring-emerald-400"
            >
              <Check className="w-4 h-4" />
              <span>Save Rule Configuration</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
