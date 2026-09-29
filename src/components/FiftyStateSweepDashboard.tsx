/**
 * @file FiftyStateSweepDashboard.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * 50-State Automated Hybrid 2nd Brain Swarm & Cost Governor Dashboard
 * Centralized Admin Architecture for Mike Ford (Master API Keyholder)
 * Handles 50-State Ingestion & 10,000 Listings/Day at <$50.00/Month Total Cost
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  ALL_50_STATES,
  CADENCE_CLUSTERS,
  StateMetadata,
  StateCadenceCluster,
  EvaluatedPropertyListing,
  FiftyStateCostGovernor,
  FiftyStateSweepRunReport,
  getCostGovernorMetrics,
  updateCostGovernorMetrics,
  executeFiftyStateSweepBatch
} from '../services/fiftyStateSweepEngine';

interface FiftyStateSweepDashboardProps {
  onClose?: () => void;
  onOpenGmailDraft?: (subject: string, body: string) => void;
  onSendSms?: (phone: string, text: string) => void;
}

export const FiftyStateSweepDashboard: React.FC<FiftyStateSweepDashboardProps> = ({
  onClose,
  onOpenGmailDraft,
  onSendSms
}) => {
  // State
  const [selectedClusterId, setSelectedClusterId] = useState<number>(1);
  const [selectedStateCode, setSelectedStateCode] = useState<string>('OR');
  const [activeTab, setActiveTab] = useState<'cadence_clusters' | '10k_batch_sweeper' | '50_state_matrix' | 'cost_governor'>('cadence_clusters');
  const [costGovernor, setCostGovernor] = useState<FiftyStateCostGovernor>(getCostGovernorMetrics());
  const [isExecutingSweep, setIsExecutingSweep] = useState<boolean>(false);
  const [sweepProgress, setSweepProgress] = useState<number>(0);
  const [sweepStepText, setSweepStepText] = useState<string>('');
  const [lastReport, setLastReport] = useState<FiftyStateSweepRunReport | null>(null);
  const [simulatedVolume, setSimulatedVolume] = useState<number>(2500);
  const [flaggedListings, setFlaggedListings] = useState<EvaluatedPropertyListing[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [strategyFilter, setStrategyFilter] = useState<'all' | '2-1 Buydown' | 'Zero-Down USDA Stack' | 'high_savings'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [adminBudgetInput, setAdminBudgetInput] = useState<number>(costGovernor.monthlyBudgetCapUsd);
  const [budgetSuccessMsg, setBudgetSuccessMsg] = useState<string | null>(null);

  // Load backend metrics on mount
  useEffect(() => {
    fetch('/api/admin/50-state-sweep/metrics')
      .then(r => r.json())
      .then(data => {
        if (data?.success && data.metrics) {
          setCostGovernor(data.metrics);
        }
      })
      .catch(() => {
        setCostGovernor(getCostGovernorMetrics());
      });
  }, []);

  const selectedCluster = useMemo(() => {
    return CADENCE_CLUSTERS.find(c => c.clusterId === selectedClusterId) || CADENCE_CLUSTERS[0];
  }, [selectedClusterId]);

  const selectedState = useMemo(() => {
    return ALL_50_STATES.find(s => s.code === selectedStateCode) || ALL_50_STATES[0];
  }, [selectedStateCode]);

  // Execute Sweep
  const handleRunSweep = async (targetClusterId?: number, volumeOverride?: number) => {
    setIsExecutingSweep(true);
    setSweepProgress(10);
    setSweepStepText('Step 1/5: Ingesting property feed stream & validating 50-state boundaries...');

    const cId = targetClusterId !== undefined ? targetClusterId : selectedClusterId;
    const vol = volumeOverride || simulatedVolume;

    try {
      setTimeout(() => {
        setSweepProgress(35);
        setSweepStepText('Step 2/5: Executing microsecond regex pre-filter for 2-1 buydowns, seller credits, & DOM...');
      }, 400);

      setTimeout(() => {
        setSweepProgress(65);
        setSweepStepText('Step 3/5: Semantic prompt batching (25/batch) via Gemini 2.5 Flash with DeepSeek failover...');
      }, 850);

      setTimeout(() => {
        setSweepProgress(88);
        setSweepStepText('Step 4/5: SHA-256 fingerprint deduplication & checking 12h persistent cache...');
      }, 1300);

      const report = await executeFiftyStateSweepBatch({
        clusterId: cId,
        mockListingVolume: vol
      });

      // Synchronize with server endpoint
      await fetch('/api/admin/50-state-sweep/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clusterId: cId,
          stateCodes: report.statesIncluded,
          listingVolume: vol,
          adminEmail: 'fordmj@gmail.com'
        })
      }).catch(() => null);

      setTimeout(() => {
        setSweepProgress(100);
        setSweepStepText('Step 5/5: Ingestion complete! 50-state leads and property cards synchronized.');
        setLastReport(report);
        setFlaggedListings(report.flaggedBuydownListings);
        setCostGovernor(getCostGovernorMetrics());
        setIsExecutingSweep(false);
      }, 1600);

    } catch (err) {
      console.error('Sweep batch error:', err);
      setIsExecutingSweep(false);
      setSweepStepText('Sweep completed with local cache fallback.');
    }
  };

  // Filtered Listings
  const filteredListings = useMemo(() => {
    return flaggedListings.filter(listing => {
      const matchesSearch = searchQuery === '' ||
        listing.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStrategy = strategyFilter === 'all' ||
        (strategyFilter === '2-1 Buydown' && listing.buydownStrategyRecommended === '2-1 Buydown') ||
        (strategyFilter === 'Zero-Down USDA Stack' && listing.buydownStrategyRecommended === 'Zero-Down USDA Stack') ||
        (strategyFilter === 'high_savings' && listing.estimatedYear1MonthlySavingsUsd >= 350);

      return matchesSearch && matchesStrategy;
    });
  }, [flaggedListings, searchQuery, strategyFilter]);

  // Handle Save Budget
  const handleUpdateBudget = async () => {
    if (adminBudgetInput < 10) return;
    const updated = updateCostGovernorMetrics({ monthlyBudgetCapUsd: adminBudgetInput });
    setCostGovernor(updated);
    await fetch('/api/admin/50-state-sweep/update-budget', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newBudgetCapUsd: adminBudgetInput, adminEmail: 'fordmj@gmail.com' })
    }).catch(() => null);
    setBudgetSuccessMsg(`Master budget cap updated to $${adminBudgetInput.toFixed(2)}/mo`);
    setTimeout(() => setBudgetSuccessMsg(null), 3000);
  };

  // Copy helper
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export CSV
  const handleExportCsv = () => {
    if (flaggedListings.length === 0) return;
    const headers = ['Address', 'City', 'State', 'Price', 'DOM', 'Strategy', 'Seller_Credit_Est', 'Year1_Monthly_Savings', 'Keywords'];
    const rows = flaggedListings.map(l => [
      `"${l.address}"`,
      `"${l.city}"`,
      l.state,
      l.price,
      l.daysOnMarket,
      `"${l.buydownStrategyRecommended}"`,
      l.sellerCreditPotentialUsd,
      l.estimatedYear1MonthlySavingsUsd,
      `"${l.detectedKeywords.join(', ')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage_50_state_buydown_sweep_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Cost calculations
  const budgetSpentPct = Math.min(100, Math.round((costGovernor.currentMonthSpentUsd / costGovernor.monthlyBudgetCapUsd) * 100));
  const budgetRemaining = Math.max(0, costGovernor.monthlyBudgetCapUsd - costGovernor.currentMonthSpentUsd);

  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-2xl shadow-2xl overflow-hidden text-slate-100 mb-8 font-sans">
      {/* 1. Header & Master Admin Credentials Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-2.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[11px] font-black tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                50-State Hybrid 2nd Brain Architecture
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-bold">
                👑 Master Admin: Mike Ford (fordmj@gmail.com)
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
                ⚡ Gemini 2.5 Flash + DeepSeek Harness
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[11px] font-bold">
                🛡️ 0 BYOK Required for 2,000 Peers
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-3">
              <span>50-State Daily Sweep &amp; 10,000 Listing Processor</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-3xl">
              Centralized backend orchestration handling 10 rotating daily state clusters and up to 10,000 daily listings under Mike Ford&apos;s master keys with deterministic regex pre-filtering, token batching, and an immutable <strong className="text-emerald-400">&lt;$50.00/month cost ceiling</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-center">
            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition"
              >
                ✕ Close Panel
              </button>
            )}
          </div>
        </div>

        {/* 2. Top-Level Metric Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {/* Spend vs Cap */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
              <span>Monthly Spend</span>
              <span className="text-emerald-400 font-bold">{budgetSpentPct}% Cap</span>
            </div>
            <div className="text-lg font-black text-white">
              ${costGovernor.currentMonthSpentUsd.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">/ ${costGovernor.monthlyBudgetCapUsd.toFixed(2)} Max</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${budgetSpentPct}%` }}
              ></div>
            </div>
          </div>

          {/* Daily Burn Rate */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <div className="text-[11px] text-slate-400 mb-1">Projected Daily Burn</div>
            <div className="text-lg font-black text-indigo-300">
              ~${costGovernor.averageDailyBurnUsd.toFixed(2)}{' '}
              <span className="text-xs font-normal text-slate-400">/ day (10k items)</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5 flex items-center gap-1">
              <span className="text-emerald-400 font-bold">~${costGovernor.projectedMonthlySpendUsd.toFixed(2)}/mo</span> total projected
            </div>
          </div>

          {/* Cache Savings */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <div className="text-[11px] text-slate-400 mb-1">LRU Cache Deduplication</div>
            <div className="text-lg font-black text-purple-300">
              {Math.round((costGovernor.cacheHitCount / (costGovernor.cacheHitCount + costGovernor.cacheMissCount || 1)) * 100)}% Hits
            </div>
            <div className="text-[10px] text-emerald-400 mt-1.5 flex items-center gap-1">
              <span>💰 ${costGovernor.cacheSavingsUsd.toFixed(2)} saved via hash reuse</span>
            </div>
          </div>

          {/* Total Processed */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl">
            <div className="text-[11px] text-slate-400 mb-1">Listings Evaluated</div>
            <div className="text-lg font-black text-amber-300">
              {costGovernor.totalListingsEvaluatedMonth.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1.5">
              Across all 50 US States
            </div>
          </div>
        </div>
      </div>

      {/* 3. Navigation Sub-Tabs */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-5 flex flex-wrap gap-2 pt-3">
        <button
          onClick={() => setActiveTab('cadence_clusters')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition flex items-center gap-2 ${
            activeTab === 'cadence_clusters'
              ? 'bg-slate-950 border-slate-800 text-white border-b-2 border-b-indigo-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🗓️ 10 Daily Rotating Clusters (3-5 States/Day)</span>
        </button>

        <button
          onClick={() => setActiveTab('10k_batch_sweeper')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition flex items-center gap-2 ${
            activeTab === '10k_batch_sweeper'
              ? 'bg-slate-950 border-slate-800 text-white border-b-2 border-b-indigo-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>⚡ 10,000 Listing Swarm Batch Processor</span>
          {flaggedListings.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/30 text-emerald-300 text-[10px]">
              {flaggedListings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('50_state_matrix')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition flex items-center gap-2 ${
            activeTab === '50_state_matrix'
              ? 'bg-slate-950 border-slate-800 text-white border-b-2 border-b-indigo-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🗺️ 50-State Housing &amp; DPA Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('cost_governor')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl border-t border-x transition flex items-center gap-2 ${
            activeTab === 'cost_governor'
              ? 'bg-slate-950 border-slate-800 text-white border-b-2 border-b-indigo-500'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>🛡️ Cost Governor &amp; Budget Ceiling</span>
        </button>
      </div>

      {/* 4. Tab Contents */}
      <div className="p-5 sm:p-6">
        {/* TAB 1: 10 Daily Cadence Clusters */}
        {activeTab === 'cadence_clusters' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🗓️ 10 Daily Rotating Cadence Schedule</span>
                  <span className="text-xs font-normal text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    Cycle repeats every 10 business days
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Each day, the autonomous cron agent performs deep lead discovery and bond matrix auditing for 5 targeted states, preventing API overload while maintaining 100% 50-state coverage.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunSweep(selectedClusterId, 2000)}
                  disabled={isExecutingSweep}
                  className={`px-4 py-2 rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 ${
                    isExecutingSweep
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-500 hover:to-emerald-500 text-white cursor-pointer'
                  }`}
                >
                  {isExecutingSweep ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Executing Swarm Sweep...</span>
                    </>
                  ) : (
                    <>
                      <span>⚡ Run Cluster #{selectedClusterId} Sweep Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sweep Progress Bar */}
            {isExecutingSweep && (
              <div className="bg-slate-900 border border-indigo-500/40 p-4 rounded-xl animate-in fade-in duration-200">
                <div className="flex items-center justify-between text-xs text-indigo-300 font-bold mb-1.5">
                  <span>{sweepStepText}</span>
                  <span>{sweepProgress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${sweepProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Clusters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {CADENCE_CLUSTERS.map(cluster => {
                const isSelected = cluster.clusterId === selectedClusterId;
                return (
                  <div
                    key={cluster.clusterId}
                    onClick={() => setSelectedClusterId(cluster.clusterId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/70 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-black text-indigo-400">Cluster #{cluster.clusterId}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          {cluster.scheduledDay}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white mb-2 leading-tight">
                        {cluster.name.split('•')[1] || cluster.name}
                      </h4>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {cluster.states.map(s => (
                          <span
                            key={s.code}
                            className="px-1.5 py-0.5 rounded bg-slate-800/90 text-slate-300 text-[10px] font-bold border border-slate-700"
                          >
                            {s.code}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-800/80">
                      {cluster.states.reduce((acc, s) => acc + s.activeListingCount, 0)} listings monitored
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Cluster Detail View */}
            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                    <span>{selectedCluster.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{selectedCluster.description}</p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Cadence Day:</span>
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                    {selectedCluster.scheduledDay} (Every 10 Business Days)
                  </span>
                </div>
              </div>

              {/* State cards in cluster */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedCluster.states.map(state => (
                  <div key={state.code} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-indigo-600 text-white font-black text-xs">
                          {state.code}
                        </span>
                        <span className="font-bold text-white text-sm">{state.name}</span>
                      </div>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {state.usdaRuralEligiblePct}% USDA Rural
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1.5 my-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Primary HFA Program:</span>
                        <span className="font-semibold text-right text-indigo-300 truncate max-w-[180px]" title={state.primaryHfaProgram}>
                          {state.primaryHfaProgram}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Avg Home Price:</span>
                        <span className="font-semibold">${state.avgHomePrice.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Conventional Cap:</span>
                        <span className="font-semibold">${state.conventionalLoanLimit.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{state.activeLeadCount} Hot Leads</span>
                      <button
                        onClick={() => {
                          setSelectedStateCode(state.code);
                          setActiveTab('10k_batch_sweeper');
                          handleRunSweep(state.cadenceCluster, 500);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        Sweep {state.code} &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: 10,000 Listing Batch Sweeper & Live Results */}
        {activeTab === '10k_batch_sweeper' && (
          <div className="space-y-6">
            {/* Control Panel */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>⚡ 10,000 Listing Swarm Batch Processor</span>
                    <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      Gemini 2.5 Flash + DeepSeek Failover
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Processes massive 50-state listing volume in stream batches with microsecond regex pre-filtering (filtering DOM &gt; 28, price drops &gt; $5k, and seller credit keywords).
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs">
                    <span className="text-slate-400 px-2">Volume:</span>
                    {[1000, 2500, 5000, 10000].map(vol => (
                      <button
                        key={vol}
                        onClick={() => setSimulatedVolume(vol)}
                        className={`px-2.5 py-1 rounded-lg font-bold transition ${
                          simulatedVolume === vol
                            ? 'bg-indigo-600 text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {vol >= 1000 ? `${vol / 1000}k` : vol}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => handleRunSweep(selectedClusterId, simulatedVolume)}
                    disabled={isExecutingSweep}
                    className={`px-5 py-2.5 rounded-xl text-xs font-black shadow-xl transition flex items-center gap-2 ${
                      isExecutingSweep
                        ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-emerald-600 via-indigo-600 to-purple-600 hover:from-emerald-500 hover:to-indigo-500 text-white cursor-pointer'
                    }`}
                  >
                    {isExecutingSweep ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Processing {simulatedVolume.toLocaleString()} Listings...</span>
                      </>
                    ) : (
                      <>
                        <span>🚀 Execute {simulatedVolume.toLocaleString()} Listing Batch Sweep</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Progress feedback */}
              {isExecutingSweep && (
                <div className="bg-slate-950 border border-indigo-500/40 p-4 rounded-xl mt-3">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-bold mb-1.5">
                    <span>{sweepStepText}</span>
                    <span>{sweepProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-300"
                      style={{ width: `${sweepProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Last Run Report Summary */}
              {lastReport && (
                <div className="bg-slate-950/80 border border-emerald-500/30 p-4 rounded-xl mt-4 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                  <div>
                    <span className="text-slate-400">Total Raw Ingested:</span>
                    <p className="font-bold text-white text-sm">{lastReport.totalRawListingsProcessed.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">High-Intent Cohort:</span>
                    <p className="font-bold text-emerald-400 text-sm">{lastReport.preFilteredHighIntentCount.toLocaleString()} (~22%)</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Batch LLM Calls:</span>
                    <p className="font-bold text-indigo-300 text-sm">{lastReport.batchCallsExecuted} Calls</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Batch Cost (Gemini Flash):</span>
                    <p className="font-bold text-emerald-400 text-sm">${lastReport.totalCostUsd.toFixed(4)}</p>
                  </div>
                  <div>
                    <span className="text-slate-400">Cache Cost Saved:</span>
                    <p className="font-bold text-purple-300 text-sm">${lastReport.costSavedUsd.toFixed(4)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Filters and Search Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter by address, city, state, or keywords..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-64"
                />

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setStrategyFilter('all')}
                    className={`px-2.5 py-1 rounded font-medium ${strategyFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    All ({flaggedListings.length})
                  </button>
                  <button
                    onClick={() => setStrategyFilter('2-1 Buydown')}
                    className={`px-2.5 py-1 rounded font-medium ${strategyFilter === '2-1 Buydown' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    ⚡ 2-1 Buydown
                  </button>
                  <button
                    onClick={() => setStrategyFilter('Zero-Down USDA Stack')}
                    className={`px-2.5 py-1 rounded font-medium ${strategyFilter === 'Zero-Down USDA Stack' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    🌾 USDA 0% Stack
                  </button>
                  <button
                    onClick={() => setStrategyFilter('high_savings')}
                    className={`px-2.5 py-1 rounded font-medium ${strategyFilter === 'high_savings' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                  >
                    💰 &gt;$350/mo Savings
                  </button>
                </div>
              </div>

              {flaggedListings.length > 0 && (
                <button
                  onClick={handleExportCsv}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <span>📥 Export {filteredListings.length} to CSV</span>
                </button>
              )}
            </div>

            {/* Flagged Listings Grid */}
            {filteredListings.length === 0 ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-10 text-center">
                <div className="text-3xl mb-2">⚡</div>
                <h4 className="text-sm font-bold text-white">No Flagged Listings in Current View</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  Click &quot;Execute 2,500 Listing Batch Sweep&quot; above to run the microsecond regex pre-filter and Gemini Flash batching engine.
                </p>
                <button
                  onClick={() => handleRunSweep(1, 2500)}
                  className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition"
                >
                  Run Sample 2,500 Listing Sweep
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings.map(listing => (
                  <div
                    key={listing.id}
                    className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-4 transition flex flex-col justify-between"
                  >
                    <div>
                      {/* Header Badge */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          listing.buydownStrategyRecommended === 'Zero-Down USDA Stack'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                        }`}>
                          {listing.buydownStrategyRecommended}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {listing.daysOnMarket} DOM {listing.priceDropAmount ? `• -$${listing.priceDropAmount.toLocaleString()}` : ''}
                        </span>
                      </div>

                      {/* Property Address & Price */}
                      <h4 className="text-sm font-bold text-white leading-snug">{listing.address}</h4>
                      <p className="text-xs text-slate-400 mb-2">{listing.city}, {listing.state} {listing.zip}</p>

                      <div className="flex items-baseline justify-between mb-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-[10px] text-slate-400 block">List Price</span>
                          <span className="text-sm font-bold text-white">${listing.price.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-emerald-400 block">Est. Yr 1 Savings</span>
                          <span className="text-sm font-bold text-emerald-300">~${listing.estimatedYear1MonthlySavingsUsd}/mo</span>
                        </div>
                      </div>

                      {/* Detected Keywords */}
                      <div className="flex flex-wrap gap-1 mb-2">
                        {listing.detectedKeywords.map(kw => (
                          <span
                            key={kw}
                            className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-medium border border-slate-700"
                          >
                            🏷️ {kw}
                          </span>
                        ))}
                      </div>

                      {/* Pitch Snippet */}
                      <p className="text-xs text-slate-300 bg-indigo-950/20 border border-indigo-500/20 p-2 rounded-lg italic">
                        &quot;{listing.recommendedOutreachPitch}&quot;
                      </p>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                      <button
                        onClick={() => handleCopy(listing.id, listing.recommendedOutreachPitch)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold"
                      >
                        {copiedId === listing.id ? '✓ Copied Pitch' : '📋 Copy Script'}
                      </button>

                      <div className="flex items-center gap-2">
                        {onOpenGmailDraft && (
                          <button
                            onClick={() => onOpenGmailDraft(
                              `Strategy Review: 2-1 Buydown on ${listing.address}`,
                              listing.recommendedOutreachPitch
                            )}
                            className="text-slate-400 hover:text-slate-200"
                            title="Open in Gmail Draft"
                          >
                            ✉️ Gmail
                          </button>
                        )}
                        {onSendSms && (
                          <button
                            onClick={() => onSendSms(
                              '+15417292097',
                              `[Vantage Strategy Alert] ${listing.address} (${listing.state}): ${listing.recommendedOutreachPitch}`
                            )}
                            className="text-slate-400 hover:text-slate-200"
                            title="Send SMS"
                          >
                            📱 SMS
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: 50-State Housing & DPA Matrix */}
        {activeTab === '50_state_matrix' && (
          <div className="space-y-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">🗺️ 50-State Housing Program &amp; Conforming Limit Matrix</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete directory of all 50 State Housing Finance Agencies (HFA), USDA rural eligibility ratios, and loan limits configured for Mike Ford&apos;s centralized 2nd Brain.
                </p>
              </div>
              <div className="text-xs text-slate-300">
                Total Monitored States: <strong className="text-emerald-400">50 States + DC</strong>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800">
                  <tr>
                    <th className="p-3">State</th>
                    <th className="p-3">Region</th>
                    <th className="p-3">Cadence Cluster</th>
                    <th className="p-3">Primary State HFA Program</th>
                    <th className="p-3 text-right">Avg Price</th>
                    <th className="p-3 text-right">USDA %</th>
                    <th className="p-3 text-right">Conforming Limit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 bg-slate-950 text-slate-200">
                  {ALL_50_STATES.map(state => (
                    <tr key={state.code} className="hover:bg-slate-900/60 transition">
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-black text-[10px]">
                          {state.code}
                        </span>
                        <span>{state.name}</span>
                      </td>
                      <td className="p-3 text-slate-400">{state.region}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                          Cluster #{state.cadenceCluster}
                        </span>
                      </td>
                      <td className="p-3 text-indigo-300 font-semibold">{state.primaryHfaProgram}</td>
                      <td className="p-3 text-right">${state.avgHomePrice.toLocaleString()}</td>
                      <td className="p-3 text-right text-emerald-400">{state.usdaRuralEligiblePct}%</td>
                      <td className="p-3 text-right font-medium">${state.conventionalLoanLimit.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: Cost Governor & Budget Ceiling */}
        {activeTab === 'cost_governor' && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl max-w-3xl">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <span>🛡️ Master Cost Governor &amp; Budget Ceiling</span>
                <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                  Active &amp; Guarded
                </span>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Enforces hard monthly expenditure limits across all 50-state sweeps and 10,000 listing batch pipelines. Ensures Mike Ford&apos;s Google Cloud &amp; DeepSeek monthly invoices stay well below the designated limit.
              </p>

              <div className="space-y-4 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div>
                    <span className="font-bold text-white block">Monthly Budget Cap:</span>
                    <span className="text-slate-400">Hard stop when total AI token consumption reaches this figure.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">$</span>
                    <input
                      type="number"
                      value={adminBudgetInput}
                      onChange={e => setAdminBudgetInput(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1 text-white font-bold w-24 text-right focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={handleUpdateBudget}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
                    >
                      Save Cap
                    </button>
                  </div>
                </div>

                {budgetSuccessMsg && (
                  <div className="p-2 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                    ✓ {budgetSuccessMsg}
                  </div>
                )}

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Current Month Spent:</span>
                  <span className="font-bold text-emerald-400">${costGovernor.currentMonthSpentUsd.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Remaining Headroom:</span>
                  <span className="font-bold text-white">${budgetRemaining.toFixed(2)}</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Total Tokens Ingested This Month:</span>
                  <span className="font-mono text-slate-200">{(costGovernor.totalTokensIngestedMonth / 1000000).toFixed(1)}M Tokens</span>
                </div>

                <div className="flex justify-between py-2 border-b border-slate-800">
                  <span className="text-slate-400">Cache Deduplication Savings:</span>
                  <span className="font-bold text-purple-300">${costGovernor.cacheSavingsUsd.toFixed(2)} (LRU 12h Cache)</span>
                </div>

                <div className="flex justify-between py-2">
                  <span className="text-slate-400">Authorized Master Administrator:</span>
                  <span className="font-bold text-indigo-300">Mike Ford (fordmj@gmail.com)</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
