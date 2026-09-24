/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • ZILLOW SWEEP TARGET CITIES, CRON SCHEDULE & COST CONTROL MODAL
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Provides:
 * 1. Target Cities Queue Manager:
 *    - Add, delete, toggle, and customize target cities queued for daily sweeps.
 *    - Automatically retains the queued lineup across days if untouched.
 * 2. Swarm Cron Scheduler & Cadence Deck:
 *    - Pause, Resume, or Disable (Delete) automated daily morning cron sweeps.
 *    - Flexible Frequency: Daily, Every Other Day, Specific Days of Week, Weekly, Monthly.
 *    - Configurable PST Time of Day (e.g. 6:00 AM PST, 7:30 AM PST, etc.).
 * 3. Batch Processing & API Consumption Cost Controller:
 *    - Group multiple city properties per single DeepSeek API call (Batch Size: 3, 5, 10, 15).
 *    - Request Caching with configurable TTL (1h, 6h, 12h, 24h) and instant cache purge.
 *    - Monthly budget limiter and token expenditure tracker.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Settings2,
  Clock,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  PauseCircle,
  PlayCircle,
  PowerOff,
  RotateCcw,
  Sparkles,
  MapPin,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Database,
  Coins,
  SlidersHorizontal,
  TrendingDown,
  Gauge,
  Check
} from 'lucide-react';
import {
  zillowSwarmSweepService,
  TargetCityItem,
  ZillowSweepScheduleConfig,
  ZillowSweepCadence,
  SwarmBatchConfig,
  SwarmCostMetrics
} from '../services/zillowSwarmSweepService';

interface ZillowSweepConfigModalProps {
  isOpen: boolean;
  initialTab?: 'cities' | 'schedule' | 'batch_costs';
  onClose: () => void;
  onConfigUpdated?: () => void;
}

export const ZillowSweepConfigModal: React.FC<ZillowSweepConfigModalProps> = ({
  isOpen,
  initialTab = 'cities',
  onClose,
  onConfigUpdated
}) => {
  const [activeTab, setActiveTab] = useState<'cities' | 'schedule' | 'batch_costs'>(initialTab);
  const [targetCities, setTargetCities] = useState<TargetCityItem[]>([]);
  const [newCityInput, setNewCityInput] = useState('');
  const [scheduleConfig, setScheduleConfig] = useState<ZillowSweepScheduleConfig>(
    zillowSwarmSweepService.getScheduleConfig()
  );
  const [batchConfig, setBatchConfig] = useState<SwarmBatchConfig>(
    zillowSwarmSweepService.getBatchConfig()
  );
  const [costMetrics, setCostMetrics] = useState<SwarmCostMetrics>(
    zillowSwarmSweepService.getCostMetrics()
  );
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setTargetCities(zillowSwarmSweepService.getTargetCities());
      setScheduleConfig(zillowSwarmSweepService.getScheduleConfig());
      setBatchConfig(zillowSwarmSweepService.getBatchConfig());
      setCostMetrics(zillowSwarmSweepService.getCostMetrics());
      setSaveToast(null);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => setSaveToast(null), 3500);
  };

  // --- Target City Actions ---
  const handleAddCity = (cityName?: string) => {
    const toAdd = cityName || newCityInput;
    if (!toAdd.trim()) return;
    try {
      zillowSwarmSweepService.addTargetCity(toAdd);
      setTargetCities(zillowSwarmSweepService.getTargetCities());
      setNewCityInput('');
      showToast(`Added "${toAdd}" to tomorrow's sweep queue!`);
      onConfigUpdated?.();
    } catch (err: any) {
      showToast(err.message || 'Error adding city');
    }
  };

  const handleToggleCity = (id: string) => {
    zillowSwarmSweepService.toggleTargetCity(id);
    setTargetCities(zillowSwarmSweepService.getTargetCities());
    onConfigUpdated?.();
  };

  const handleRemoveCity = (id: string, name: string) => {
    zillowSwarmSweepService.removeTargetCity(id);
    setTargetCities(zillowSwarmSweepService.getTargetCities());
    showToast(`Removed "${name}" from target queue.`);
    onConfigUpdated?.();
  };

  const handleResetDefaults = () => {
    const defaults = zillowSwarmSweepService.resetDefaultTargetCities();
    setTargetCities(defaults);
    showToast('Reset target city queue to 10 recommended Pacific NW markets.');
    onConfigUpdated?.();
  };

  // --- Schedule Config Actions ---
  const handleUpdateSchedule = (updates: Partial<ZillowSweepScheduleConfig>) => {
    const updated = zillowSwarmSweepService.saveScheduleConfig(updates);
    setScheduleConfig(updated);
    showToast('Updated Swarm Cron Schedule!');
    onConfigUpdated?.();
  };

  // --- Batch Config Actions ---
  const handleUpdateBatchConfig = (updates: Partial<SwarmBatchConfig>) => {
    const updated = zillowSwarmSweepService.saveBatchConfig(updates);
    setBatchConfig(updated);
    showToast('Updated Swarm Batch & Cache Settings!');
    onConfigUpdated?.();
  };

  const handlePurgeCache = async () => {
    const res = await zillowSwarmSweepService.clearCache();
    setCostMetrics(zillowSwarmSweepService.getCostMetrics());
    showToast(res.message);
    onConfigUpdated?.();
  };

  const handleResetCostMetrics = () => {
    const reset = zillowSwarmSweepService.resetCostMetrics();
    setCostMetrics(reset);
    showToast('Reset Swarm API cost counters.');
    onConfigUpdated?.();
  };

  const handleToggleDayOfWeek = (dayIndex: number) => {
    const currentDays = scheduleConfig.specificDaysOfWeek || [1, 2, 3, 4, 5];
    let newDays: number[];
    if (currentDays.includes(dayIndex)) {
      if (currentDays.length === 1) {
        showToast('Must have at least one day selected.');
        return;
      }
      newDays = currentDays.filter((d) => d !== dayIndex);
    } else {
      newDays = [...currentDays, dayIndex].sort((a, b) => a - b);
    }
    handleUpdateSchedule({ specificDaysOfWeek: newDays });
  };

  const activeCitiesCount = targetCities.filter((c) => c.isActive).length;

  const quickPicks = [
    'Bend, OR',
    'Corvallis, OR',
    'Medford, OR',
    'Vancouver, WA',
    'Clackamas, OR',
    'Tigard, OR',
    'Tualatin, OR',
    'West Linn, OR',
    'Lake Oswego, OR'
  ];

  const daysLabels = [
    { idx: 0, label: 'Sun' },
    { idx: 1, label: 'Mon' },
    { idx: 2, label: 'Tue' },
    { idx: 3, label: 'Wed' },
    { idx: 4, label: 'Thu' },
    { idx: 5, label: 'Fri' },
    { idx: 6, label: 'Sat' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-900/90 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Zillow Swarm Sweep Configuration
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  DeepSeek Wave Engine
                </span>
              </h2>
              <p className="text-xs text-stone-400">
                Customize target cities, automated cadence, request caching, and batched API limits
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-4 pt-2 overflow-x-auto gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('cities')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'cities'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Building className="w-4 h-4" />
            Cities Queue ({activeCitiesCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('schedule')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'schedule'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            Schedule & Cadence ({scheduleConfig.status === 'active' ? '🟢 Active' : scheduleConfig.status === 'paused' ? '⏸️ Paused' : '🚫 Disabled'})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('batch_costs')}
            className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-semibold border-b-2 whitespace-nowrap transition cursor-pointer ${
              activeTab === 'batch_costs'
                ? 'border-amber-500 text-amber-400 bg-amber-500/10 rounded-t-lg'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <Coins className="w-4 h-4" />
            ⚡ Batch & Cost Limits ({batchConfig.batchSize}/call • {costMetrics.cacheHitRatePercent}% Cache)
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* Toast Notification */}
          {saveToast && (
            <div className="p-3 bg-emerald-950/90 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-200 shadow-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveToast}</span>
            </div>
          )}

          {/* TAB 1: TARGET CITIES QUEUE */}
          {activeTab === 'cities' && (
            <div className="space-y-4">
              {/* Notice Card */}
              <div className="p-3 bg-stone-950/70 border border-stone-800 rounded-xl flex items-start gap-2.5 text-xs text-stone-300">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-stone-200">How the Cities Queue Works:</p>
                  <p className="text-stone-400 mt-0.5">
                    Your active city lineup remains stored and ready. When the automated Swarm Sweep runs each morning (or when you click Run Sweep), it scans all checked cities in Wave 2. If you never change it, it reliably continues sweeping these exact cities.
                  </p>
                </div>
              </div>

              {/* Add City Input */}
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    value={newCityInput}
                    onChange={(e) => setNewCityInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCity();
                      }
                    }}
                    placeholder="Enter city & state (e.g. Bend, OR or 97701)..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleAddCity()}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add City</span>
                </button>
              </div>

              {/* Quick Picks */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Quick Add Recommended Pacific NW Markets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPicks.map((qp) => (
                    <button
                      key={qp}
                      type="button"
                      onClick={() => handleAddCity(qp)}
                      className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/40 text-[11px] text-stone-300 hover:text-white transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3 text-amber-400" />
                      <span>{qp}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cities List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-300">
                    Active Pipeline Lineup ({activeCitiesCount} of {targetCities.length} active)
                  </span>
                  <button
                    type="button"
                    onClick={handleResetDefaults}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 transition cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1.5 pr-1">
                  {targetCities.map((city) => (
                    <div
                      key={city.id}
                      className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                        city.isActive
                          ? 'bg-stone-950/80 border-stone-800'
                          : 'bg-stone-950/30 border-stone-900 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={city.isActive}
                          onChange={() => handleToggleCity(city.id)}
                          className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <div>
                          <span className={`text-xs font-semibold block ${city.isActive ? 'text-white' : 'text-stone-500 line-through'}`}>
                            {city.name}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">
                            {city.isCustom ? 'Custom City' : 'Default Preset'} • Added {city.addedAt}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveCity(city.id, city.name)}
                        className="p-1.5 text-stone-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                        title="Remove city from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CRON SCHEDULE & CADENCE */}
          {activeTab === 'schedule' && (
            <div className="space-y-4">
              {/* Schedule Status Controller */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
                <span className="text-xs font-bold text-stone-300 block">
                  Automated Swarm Sweep Status
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateSchedule({ status: 'active' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      scheduleConfig.status === 'active'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    <PlayCircle className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">Active / Running</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateSchedule({ status: 'paused' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      scheduleConfig.status === 'paused'
                        ? 'bg-amber-950/60 border-amber-500 text-amber-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    <PauseCircle className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Pause Sweep</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleUpdateSchedule({ status: 'disabled' })}
                    className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition cursor-pointer ${
                      scheduleConfig.status === 'disabled'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300 font-bold'
                        : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                    }`}
                  >
                    <PowerOff className="w-5 h-5 text-rose-400" />
                    <span className="text-xs">Disable / Delete</span>
                  </button>
                </div>
              </div>

              {/* Frequency Cadence Selector */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-stone-300 block">
                  Sweep Execution Cadence
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'daily', label: 'Daily (Every Morning)', desc: 'Standard morning audit' },
                    { id: 'every_other_day', label: 'Every Other Day', desc: '48hr refresh rate' },
                    { id: 'specific_days', label: 'Specific Days', desc: 'Custom weekdays/weekends' },
                    { id: 'weekly', label: 'Weekly', desc: 'Once per week' },
                    { id: 'monthly', label: 'Monthly', desc: 'Once per month' }
                  ].map((freq) => (
                    <div
                      key={freq.id}
                      onClick={() => handleUpdateSchedule({ frequency: freq.id as ZillowSweepCadence })}
                      className={`p-2.5 rounded-xl border cursor-pointer transition ${
                        scheduleConfig.frequency === freq.id
                          ? 'bg-amber-500/15 border-amber-500 text-white'
                          : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                      }`}
                    >
                      <span className="text-xs font-bold block">{freq.label}</span>
                      <span className="text-[10px] text-stone-500">{freq.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Specific Days Picker */}
              {scheduleConfig.frequency === 'specific_days' && (
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                  <span className="text-xs font-semibold text-stone-300 block">
                    Select Active Days of Week:
                  </span>
                  <div className="flex gap-1.5 flex-wrap">
                    {daysLabels.map((d) => {
                      const isSelected = (scheduleConfig.specificDaysOfWeek || [1, 2, 3, 4, 5]).includes(d.idx);
                      return (
                        <button
                          key={d.idx}
                          type="button"
                          onClick={() => handleToggleDayOfWeek(d.idx)}
                          className={`w-10 h-10 rounded-xl text-xs font-bold border transition cursor-pointer ${
                            isSelected
                              ? 'bg-amber-500 border-amber-400 text-stone-950'
                              : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                          }`}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Execution Time (PST) */}
              <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <span className="text-xs font-semibold text-stone-300 block flex items-center justify-between">
                  <span>Execution Time (Pacific Standard Time)</span>
                  <span className="text-[10px] text-amber-400 font-mono">PST / Oregon Time</span>
                </span>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-1">Hour (PST):</span>
                    <select
                      value={scheduleConfig.timeHour}
                      onChange={(e) => {
                        const h = parseInt(e.target.value, 10);
                        handleUpdateSchedule({
                          timeHour: h,
                          timePst: `${h < 10 ? `0${h}` : h}:${scheduleConfig.timeMinute < 10 ? `0${scheduleConfig.timeMinute}` : scheduleConfig.timeMinute}`
                        });
                      }}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl text-xs text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value={5}>5:00 AM PST</option>
                      <option value={6}>6:00 AM PST (Recommended)</option>
                      <option value={7}>7:00 AM PST</option>
                      <option value={8}>8:00 AM PST</option>
                      <option value={9}>9:00 AM PST</option>
                      <option value={12}>12:00 PM PST</option>
                      <option value={18}>6:00 PM PST</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 block mb-1">Minute:</span>
                    <select
                      value={scheduleConfig.timeMinute}
                      onChange={(e) => {
                        const m = parseInt(e.target.value, 10);
                        handleUpdateSchedule({
                          timeMinute: m,
                          timePst: `${scheduleConfig.timeHour < 10 ? `0${scheduleConfig.timeHour}` : scheduleConfig.timeHour}:${m < 10 ? `0${m}` : m}`
                        });
                      }}
                      className="w-full bg-stone-950 border border-stone-700 rounded-xl text-xs text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    >
                      <option value={0}>:00</option>
                      <option value={15}>:15</option>
                      <option value={30}>:30</option>
                      <option value={45}>:45</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="p-3.5 bg-gradient-to-r from-amber-950/40 via-stone-950 to-stone-950 border border-amber-500/30 rounded-xl space-y-1.5">
                <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
                  Configured Swarm Schedule Summary:
                </span>
                <p className="text-xs text-white font-semibold flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  {zillowSwarmSweepService.computeNextRunDescription(scheduleConfig)}
                </p>
                <p className="text-[11px] text-stone-400">
                  Target Pipeline: {activeCitiesCount} active queued cities ready for discovery
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: BATCH PROCESSING & API CONSUMPTION COST MONITOR */}
          {activeTab === 'batch_costs' && (
            <div className="space-y-4">
              
              {/* Cost & Savings Summary Stats Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Month Cost</span>
                    <Coins className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-base font-extrabold text-white font-mono">
                    ${costMetrics.totalEstimatedCostUsd.toFixed(4)}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    of ${costMetrics.monthlyBudgetCapUsd.toFixed(2)} limit ({costMetrics.budgetUsedPercent}%)
                  </div>
                </div>

                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Calls Saved</span>
                    <Layers className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-base font-extrabold text-amber-300 font-mono">
                    {costMetrics.totalBatchedRequestsSaved}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Via multi-city batching
                  </div>
                </div>

                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Cache Hit Rate</span>
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-base font-extrabold text-cyan-300 font-mono">
                    {costMetrics.cacheHitRatePercent}%
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    {costMetrics.totalCacheHits} Hits / {costMetrics.totalCacheMisses} Misses
                  </div>
                </div>

                <div className="p-3 bg-stone-950 border border-stone-800 rounded-xl">
                  <div className="flex items-center justify-between text-stone-500 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Cost Saved</span>
                    <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-base font-extrabold text-emerald-400 font-mono">
                    ${costMetrics.totalCostSavedUsd.toFixed(3)}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-0.5">
                    Tokens conserved
                  </div>
                </div>
              </div>

              {/* Monthly Budget Consumption Progress Bar */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-stone-300 flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-amber-400" />
                    Monthly API Budget Cap Utilization
                  </span>
                  <span className={`font-mono ${costMetrics.budgetUsedPercent > 80 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ${costMetrics.totalEstimatedCostUsd.toFixed(4)} / ${costMetrics.monthlyBudgetCapUsd.toFixed(2)} ({costMetrics.budgetUsedPercent}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-stone-900 rounded-full overflow-hidden border border-stone-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      costMetrics.budgetUsedPercent > 90
                        ? 'bg-rose-500'
                        : costMetrics.budgetUsedPercent > 70
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(3, costMetrics.budgetUsedPercent))}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-stone-500">
                  <span>$0.00 Minimum</span>
                  <span>DeepSeek Wholesale Rates ($0.27/1M input • $1.10/1M output)</span>
                  <span>${costMetrics.monthlyBudgetCapUsd.toFixed(2)} Cap</span>
                </div>
              </div>

              {/* Batch Processing Settings */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Properties Per Consolidated API Call (Batch Size)
                    </span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Groups multiple city properties into a single DeepSeek prompt, eliminating per-call token setup overhead and avoiding rate limits.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[
                    { size: 3, label: '3 Props', efficiency: '66% fewer calls' },
                    { size: 5, label: '5 Props', efficiency: '80% fewer calls (Recommended)' },
                    { size: 10, label: '10 Props', efficiency: '90% fewer calls' },
                    { size: 15, label: '15 Props', efficiency: '93% fewer calls (Max)' }
                  ].map((item) => (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => handleUpdateBatchConfig({ batchSize: item.size })}
                      className={`p-2.5 rounded-xl border text-center transition cursor-pointer ${
                        batchConfig.batchSize === item.size
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                          : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold block">{item.label}</span>
                      <span className="text-[9px] text-stone-500 block mt-0.5">{item.efficiency}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Request-Caching Settings */}
              <div className="p-3.5 bg-stone-950 border border-stone-800 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Smart Request Caching & TTL Expiration
                    </span>
                    <p className="text-[11px] text-stone-400 mt-0.5">
                      Caches analyzed properties and status audits to prevent redundant API calls for unchanged listings.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={batchConfig.enableCache}
                      onChange={(e) => handleUpdateBatchConfig({ enableCache: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-stone-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[10px] text-stone-500 block mb-1">Cache Expiration (TTL):</span>
                    <select
                      value={batchConfig.cacheTtlMinutes}
                      onChange={(e) => handleUpdateBatchConfig({ cacheTtlMinutes: parseInt(e.target.value, 10) })}
                      disabled={!batchConfig.enableCache}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl text-xs text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-50"
                    >
                      <option value={60}>1 Hour (60 min)</option>
                      <option value={360}>6 Hours (Recommended)</option>
                      <option value={720}>12 Hours (Half-Day)</option>
                      <option value={1440}>24 Hours (Full Day)</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-500 block mb-1">Monthly Cost Ceiling ($ USD):</span>
                    <input
                      type="number"
                      step="1"
                      min="1"
                      max="100"
                      value={batchConfig.monthlyBudgetCapUsd}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 10;
                        handleUpdateBatchConfig({ monthlyBudgetCapUsd: val });
                        setCostMetrics(zillowSwarmSweepService.saveCostMetrics({ monthlyBudgetCapUsd: val }));
                      }}
                      className="w-full bg-stone-900 border border-stone-700 rounded-xl text-xs text-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-800/80">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="rateLimitCheck"
                      checked={batchConfig.rateLimitDailyManual}
                      onChange={(e) => handleUpdateBatchConfig({ rateLimitDailyManual: e.target.checked })}
                      className="w-4 h-4 rounded border-stone-700 bg-stone-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="rateLimitCheck" className="text-xs text-stone-300 cursor-pointer">
                      Enforce strict 1 manual execution per day safeguard
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handlePurgeCache}
                    className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white text-[11px] font-semibold transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-stone-400" />
                    <span>Purge Cache</span>
                  </button>
                </div>
              </div>

              {/* Reset Counters Action */}
              <div className="flex items-center justify-between text-xs text-stone-500 px-1">
                <span>Want to restart your billing cycle statistics?</span>
                <button
                  type="button"
                  onClick={handleResetCostMetrics}
                  className="text-amber-400 hover:text-amber-300 underline font-semibold cursor-pointer"
                >
                  Reset Cost Counters
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-900 flex items-center justify-between">
          <span className="text-[11px] text-stone-500 font-mono">
            Vantage Swarm Supervisor • DeepSeek Harness & Caching
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
          >
            Done & Save Changes
          </button>
        </div>

      </div>
    </div>
  );
};
