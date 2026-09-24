/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • ZILLOW SWEEP CONTROL DECK & 30-DAY DATE FILTER
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Provides:
 * 1. Manual "⚡ Run Zillow Sweep" button triggering the DeepSeek Harness Swarm
 *    on-demand with strict 1/day rate limiting and soft toast feedback.
 * 2. 30-day historical date dropdown filter (single day, multi-day, or select all).
 * 3. Multi-selection batch match & dispatch triggers for loan officers.
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Zap, 
  Calendar, 
  ChevronDown, 
  Check, 
  RefreshCw, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  Filter, 
  Layers, 
  ArrowRight,
  TrendingDown,
  Building,
  Mail,
  Send,
  SlidersHorizontal,
  Settings2,
  Clock,
  MapPin,
  X,
  Coins,
  Database,
  Gauge
} from 'lucide-react';
import { SyncedPropertyListing } from '../types/firstTimeHomebuyerPlugin';
import { 
  zillowSwarmSweepService, 
  ZillowSweepBatchSummary, 
  ZillowSwarmSweepResult,
  SwarmBatchConfig,
  SwarmCostMetrics
} from '../services/zillowSwarmSweepService';
import { ZillowSweepConfigModal } from './ZillowSweepConfigModal';

interface ZillowSweepControlDeckProps {
  currentListings: SyncedPropertyListing[];
  selectedDates: string[];
  onSelectedDatesChange: (dates: string[]) => void;
  selectedPropertyIds: string[];
  onToggleSelectProperty: (propId: string) => void;
  onSelectAllVisible: (propIds: string[]) => void;
  onClearSelectedProperties: () => void;
  onOpenMatchModal: () => void;
  onSweepExecuted?: (result: ZillowSwarmSweepResult) => void;
}

export const ZillowSweepControlDeck: React.FC<ZillowSweepControlDeckProps> = ({
  currentListings,
  selectedDates,
  onSelectedDatesChange,
  selectedPropertyIds,
  onToggleSelectProperty,
  onSelectAllVisible,
  onClearSelectedProperties,
  onOpenMatchModal,
  onSweepExecuted
}) => {
  const [isExecutingSweep, setIsExecutingSweep] = useState<boolean>(false);
  const [showConfigModal, setShowConfigModal] = useState<boolean>(false);
  const [modalTab, setModalTab] = useState<'cities' | 'schedule' | 'batch_costs'>('cities');
  const [scheduleConfig, setScheduleConfig] = useState(zillowSwarmSweepService.getScheduleConfig());
  const [targetCities, setTargetCities] = useState(zillowSwarmSweepService.getTargetCities());
  const [batchConfig, setBatchConfig] = useState<SwarmBatchConfig>(zillowSwarmSweepService.getBatchConfig());
  const [costMetrics, setCostMetrics] = useState<SwarmCostMetrics>(zillowSwarmSweepService.getCostMetrics());
  const [sweepFeedback, setSweepFeedback] = useState<{
    type: 'success' | 'rate_limited' | 'info';
    message: string;
  } | null>(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const refreshConfigState = () => {
    setScheduleConfig(zillowSwarmSweepService.getScheduleConfig());
    setTargetCities(zillowSwarmSweepService.getTargetCities());
    setBatchConfig(zillowSwarmSweepService.getBatchConfig());
    setCostMetrics(zillowSwarmSweepService.getCostMetrics());
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const batches = zillowSwarmSweepService.getPast30DaysSweepBatches(currentListings);
  const todayBatch = batches.find((b) => b.isToday) || batches[0];
  const activeCitiesCount = targetCities.filter((c) => c.isActive).length;

  // Active dates label
  const isAllSelected = selectedDates.length === 0 || selectedDates.length === batches.length;
  const isOnlyToday = selectedDates.length === 1 && selectedDates[0] === todayBatch.dateStr;

  let activeDateLabel = "Today's Sweep";
  if (isAllSelected && selectedDates.length > 1) {
    activeDateLabel = `All 30 Days (${batches.length} Sweeps)`;
  } else if (isOnlyToday) {
    activeDateLabel = `Today's Sweep (${todayBatch.formattedDate})`;
  } else if (selectedDates.length === 1) {
    const b = batches.find((x) => x.dateStr === selectedDates[0]);
    activeDateLabel = b ? b.formattedDate : selectedDates[0];
  } else if (selectedDates.length > 1) {
    activeDateLabel = `${selectedDates.length} Days Selected`;
  }

  // Handle Manual "⚡ Run Zillow Sweep" Click
  const handleExecuteManualSweep = async () => {
    setIsExecutingSweep(true);
    try {
      const res = await zillowSwarmSweepService.executeZillowSwarmSweep({ 
        isManual: true,
        existingProperties: currentListings 
      });
      refreshConfigState();
      if (res.isRateLimited) {
        setSweepFeedback({
          type: 'rate_limited',
          message: res.message
        });
      } else {
        setSweepFeedback({
          type: 'success',
          message: res.message
        });
        if (onSweepExecuted) {
          onSweepExecuted(res);
        }
      }
    } catch (err) {
      setSweepFeedback({
        type: 'rate_limited',
        message: 'Sweep request encountered a transient error. Please try again.'
      });
    } finally {
      setIsExecutingSweep(false);
      setTimeout(() => {
        setSweepFeedback(null);
      }, 7000);
    }
  };

  const handleSelectDateSingle = (dateStr: string) => {
    onSelectedDatesChange([dateStr]);
    setIsDropdownOpen(false);
  };

  const handleToggleDateMulti = (dateStr: string) => {
    if (selectedDates.includes(dateStr)) {
      const next = selectedDates.filter((d) => d !== dateStr);
      onSelectedDatesChange(next.length === 0 ? [todayBatch.dateStr] : next);
    } else {
      onSelectedDatesChange([...selectedDates, dateStr]);
    }
  };

  const handleSelectAllDays = () => {
    onSelectedDatesChange(batches.map((b) => b.dateStr));
    setIsDropdownOpen(false);
  };

  const handleResetToToday = () => {
    onSelectedDatesChange([todayBatch.dateStr]);
    setIsDropdownOpen(false);
  };

  return (
    <div className="space-y-3">
      {/* Top Banner Toolbar */}
      <div className="p-3.5 bg-stone-900/90 rounded-2xl border border-amber-500/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* Left: Swarm Title & Status */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-white text-xs">
                DeepSeek Swarm Market Intelligence
              </span>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                scheduleConfig.status === 'active'
                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                  : scheduleConfig.status === 'paused'
                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                  : 'bg-red-950/80 text-red-300 border-red-500/40'
              }`}>
                {scheduleConfig.status === 'active'
                  ? `🟢 ${scheduleConfig.timePst} PST (${activeCitiesCount} Cities Queued)`
                  : scheduleConfig.status === 'paused'
                  ? '⏸️ Sweep Paused'
                  : '🚫 Sweep Disabled'}
              </span>
            </div>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Wave 1 audits saved dashboard addresses; Wave 2 discovers 0-down & DPA listings across queued cities.
            </p>
          </div>
        </div>

        {/* Right: Actions (Settings Modal, Date Dropdown, Manual Sweep) */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-start md:justify-end">
          
          {/* Target Cities & Schedule Settings Button */}
          <button
            type="button"
            onClick={() => {
              setModalTab('cities');
              setShowConfigModal(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-700 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Configure target cities lineup & customize automated cron schedule/cadence"
          >
            <Settings2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Target Cities & Schedule</span>
            <span className="ml-0.5 px-1.5 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-bold font-mono">
              {activeCitiesCount}
            </span>
          </button>

          {/* 30-Day Date Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1.5 rounded-xl bg-stone-950 hover:bg-stone-800 text-stone-200 border border-stone-700 font-semibold text-xs flex items-center gap-2 transition cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeDateLabel}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-stone-900 border border-stone-700 rounded-2xl shadow-2xl z-50 p-2 text-xs space-y-1 animate-in fade-in">
                <div className="p-2 border-b border-stone-800 flex items-center justify-between">
                  <span className="font-bold text-stone-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>Select Past 30 Days of Sweeps</span>
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleResetToToday}
                      className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-amber-400 text-[10px] font-bold"
                    >
                      Today
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllDays}
                      className="px-2 py-0.5 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold"
                    >
                      Select All
                    </button>
                  </div>
                </div>

                <div className="space-y-0.5 pt-1">
                  {batches.map((batch) => {
                    const isSelected = selectedDates.includes(batch.dateStr);
                    return (
                      <div
                        key={batch.dateStr}
                        onClick={() => handleToggleDateMulti(batch.dateStr)}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer transition ${
                          isSelected
                            ? 'bg-amber-500/20 border border-amber-500/40 text-white'
                            : 'hover:bg-stone-800 text-stone-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center border ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-stone-950'
                                : 'border-stone-700 bg-stone-950'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <div>
                            <span className="font-semibold block text-[11px]">
                              {batch.formattedDate}
                            </span>
                            <span className="text-[10px] text-stone-400">
                              {batch.totalListingsCount} {batch.totalListingsCount === 1 ? 'listing' : 'listings'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {batch.priceDropCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 text-[9px] font-bold font-mono border border-rose-800">
                              {batch.priceDropCount} Cuts
                            </span>
                          )}
                          {batch.newListingsCount > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 text-[9px] font-bold font-mono border border-emerald-800">
                              {batch.newListingsCount} New
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Manual "⚡ Run Zillow Sweep" Button (1 Max Run/Day Rate Limit) */}
          <button
            type="button"
            onClick={handleExecuteManualSweep}
            disabled={isExecutingSweep}
            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-stone-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
            title="Initiate on-demand DeepSeek Swarm audit & discovery (Limit: 1 manual run per calendar day)"
          >
            {isExecutingSweep ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Running Swarm...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>⚡ Run Zillow Sweep</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Swarm Cost Monitoring & Request-Caching Metric Bar */}
      <div className="px-3.5 py-2 bg-stone-900/60 rounded-xl border border-stone-800/80 flex flex-wrap items-center justify-between gap-2.5 text-[11px] text-stone-400">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800 text-stone-300">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-stone-400">Batch Engine:</span>
            <span className="font-bold text-amber-300 font-mono">
              {batchConfig.batchSize} props/call
            </span>
            {costMetrics.totalBatchedRequestsSaved > 0 && (
              <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                ({costMetrics.totalBatchedRequestsSaved} calls saved)
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800 text-stone-300">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-stone-400">Request Cache:</span>
            <span className={`font-bold font-mono ${costMetrics.cacheHitRatePercent > 50 ? 'text-emerald-300' : 'text-cyan-300'}`}>
              {batchConfig.enableCache ? `${costMetrics.cacheHitRatePercent}% Hit Rate` : 'Disabled'}
            </span>
            <span className="text-[10px] text-stone-500 font-mono">
              ({costMetrics.totalCacheHits} Hits / {costMetrics.totalCacheMisses} Misses)
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800 text-stone-300">
            <Coins className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-stone-400">API Cost:</span>
            <span className="font-bold text-stone-100 font-mono">
              ${costMetrics.totalEstimatedCostUsd.toFixed(4)}
            </span>
            <span className="text-stone-500 font-mono">/</span>
            <span className="text-stone-400 font-mono">${costMetrics.monthlyBudgetCapUsd.toFixed(2)} cap</span>
            {costMetrics.totalCostSavedUsd > 0 && (
              <span className="text-[10px] text-emerald-400 font-bold font-mono">
                (Saved ${costMetrics.totalCostSavedUsd.toFixed(3)})
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setModalTab('batch_costs');
            setShowConfigModal(true);
          }}
          className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 hover:text-amber-300 transition cursor-pointer hover:underline"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Batch & Cost Controls</span>
        </button>
      </div>

      {/* Target Cities & Cron Schedule Config Modal */}
      <ZillowSweepConfigModal
        isOpen={showConfigModal}
        initialTab={modalTab}
        onClose={() => setShowConfigModal(false)}
        onConfigUpdated={refreshConfigState}
      />

      {/* Soft Feedback Toast Banner (Success vs 1/day Rate Limited) */}
      {sweepFeedback && (
        <div
          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs animate-in fade-in ${
            sweepFeedback.type === 'success'
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              : 'bg-amber-950/70 border-amber-500/50 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {sweepFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span className="font-semibold">{sweepFeedback.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setSweepFeedback(null)}
            className="text-stone-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Multi-Select Action Bar when 1 or more property cards are checked */}
      {selectedPropertyIds.length > 0 && (
        <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold font-mono">
              {selectedPropertyIds.length} {selectedPropertyIds.length === 1 ? 'Listing' : 'Listings'} Selected
            </span>
            <span className="text-indigo-200">
              Ready for 1-click buyer outreach & note stamping
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenMatchModal}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>🚀 Match to Lead (Native Email/SMS/Notes)</span>
            </button>
            <button
              type="button"
              onClick={onClearSelectedProperties}
              className="px-2.5 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-[11px] font-semibold transition cursor-pointer"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

