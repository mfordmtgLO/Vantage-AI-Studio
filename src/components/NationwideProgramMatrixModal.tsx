/**
 * @file NationwideProgramMatrixModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * 50-State & Nationwide Mortgage Program, State HFA / Bond, Lakeview National 100%,
 * USDA RD Zero-Down, FHA NHF DPA, and LMI Census Tract Overlay Matrix.
 */

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  Filter,
  DollarSign,
  TrendingUp,
  MapPin,
  Building,
  Layers,
  Sparkles,
  Award,
  Globe,
  Send
} from 'lucide-react';
import {
  NATIONWIDE_STATE_PROGRAMS,
  getStateMortgageProgramData,
  evaluateNationwideMortgageOverlay,
  StateMortgageProgramData,
  ProgramEligibilityOverlay
} from '../data/nationwideStateBondPrograms';
import { US_STATES } from '../data/usStatesAndCounties';

interface NationwideProgramMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStateCode: string;
  onSelectState?: (stateCode: string) => void;
  onApplyBooleanPreset?: (andTerms: string[], orTerms: string[], notTerms: string[]) => void;
}

export const NationwideProgramMatrixModal: React.FC<NationwideProgramMatrixModalProps> = ({
  isOpen,
  onClose,
  selectedStateCode,
  onSelectState,
  onApplyBooleanPreset
}) => {
  const [activeState, setActiveState] = useState<string>(selectedStateCode || 'OR');
  const [testPrice, setTestPrice] = useState<number>(425000);
  const [testIncome, setTestIncome] = useState<number>(85000);
  const [testCredit, setTestCredit] = useState<number>(660);
  const [isRuralTract, setIsRuralTract] = useState<boolean>(true);
  const [isLmiTract, setIsLmiTract] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'programs' | 'calculator' | 'lakeview_status' | 'census_overlay'>('programs');
  const [copiedTemplateIdx, setCopiedTemplateIdx] = useState<number | null>(null);

  if (!isOpen) return null;

  const stateData = getStateMortgageProgramData(activeState);
  const auditResult = evaluateNationwideMortgageOverlay({
    stateCode: activeState,
    targetPurchasePrice: testPrice,
    grossHouseholdIncome: testIncome,
    creditScore: testCredit,
    isRuralTract,
    isLmiTract
  });

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTemplateIdx(idx);
    setTimeout(() => setCopiedTemplateIdx(null), 2500);
  };

  const handleStateChange = (code: string) => {
    setActiveState(code);
    if (onSelectState) onSelectState(code);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-cyan-500 rounded-2xl shadow-lg shadow-indigo-500/20 text-white">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold bg-gradient-to-r from-white via-indigo-200 to-cyan-300 bg-clip-text text-transparent">
                  50-State Low & Zero Down Mortgage Matrix
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  2026 Compliant
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lakeview National 100%, USDA RD 0-Down, FHA NHF DPA, State Bonds & LMI Census Tract Overlays
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State Selector & Navigation Tabs */}
        <div className="px-6 py-3 bg-slate-950/80 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select State:</span>
            <select
              value={activeState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="bg-slate-900 text-indigo-200 font-semibold border border-indigo-500/40 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {US_STATES.map((st) => (
                <option key={st.code} value={st.code}>
                  {st.name} ({st.code})
                </option>
              ))}
            </select>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Agency: <span className="text-slate-200 font-medium">{stateData.agencyName}</span>
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('programs')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'programs'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🏛️ 6 Major Programs
            </button>
            <button
              onClick={() => setActiveTab('lakeview_status')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'lakeview_status'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🌟 Lakeview National (50 States)
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'calculator'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧮 Live Lead Overlay Test
            </button>
            <button
              onClick={() => setActiveTab('census_overlay')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'census_overlay'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ LMI & AMI Limits
            </button>
          </div>
        </div>

        {/* Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: 6 Major Programs in Selected State */}
          {activeTab === 'programs' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{stateData.stateName} Mortgage Assistance Stack</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {stateData.flagshipProgramName}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Max DPA: <span className="font-semibold text-cyan-300">{stateData.maxDpaPercentOrAmount}</span> • Standard Price Cap: <span className="font-semibold text-emerald-300">${stateData.maxPurchasePriceCapUsd.toLocaleString()}</span> • Median AMI: <span className="font-semibold text-amber-300">${stateData.medianHouseholdAmiUsd.toLocaleString()}</span>
                  </p>
                </div>
                {onApplyBooleanPreset && (
                  <button
                    onClick={() => {
                      onApplyBooleanPreset(
                        ['first-time buyer'],
                        ['Lakeview 100%', 'USDA 0% down', 'NHF DPA', stateData.stateName, 'DPA grant'],
                        ['cash buyer', 'wholesaler', 'investor']
                      );
                      onClose();
                    }}
                    className="flex items-center gap-2 px-3.5 py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-md transition shrink-0"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    Apply {stateData.stateCode} Boolean Scrape Filters
                  </button>
                )}
              </div>

              {activeState === 'OR' && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/60 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">
                        Oregon OHCS Specialization: Rate Advantage vs. FirstHome DPA vs. NextStep
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      IRS Section 143 Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 space-y-1">
                      <strong className="text-emerald-300 font-bold block">📉 Rate Advantage ($0 Cash)</strong>
                      <p className="text-[11px] text-slate-300">
                        <strong>$0 Cash Assistance.</strong> Maximum below-market 30-year fixed rate discount. Ideal for buyers with saved down payment wanting the lowest monthly payment.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-indigo-500/40 space-y-1">
                      <strong className="text-indigo-300 font-bold block">💵 FirstHome (4-5% DPA)</strong>
                      <p className="text-[11px] text-slate-300">
                        <strong>4% to 5% Cash DPA ($29,250 cap).</strong> Wipes out required cash to close. Ideal when upfront savings is the buyer's bottleneck.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 space-y-1">
                      <strong className="text-amber-300 font-bold block">🚀 NextStep (NO Price Cap)</strong>
                      <p className="text-[11px] text-slate-300">
                        <strong>Zero Purchase Price Limit!</strong> Flat $125k income limit. Allows repeat buyers and homes exceeding county price caps.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auditResult.programs.map((prog, idx) => (
                  <div
                    key={prog.programId}
                    className="bg-slate-950/70 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between transition group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                          {prog.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {prog.statusBadge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2 group-hover:text-indigo-200 transition">
                        {prog.programName}
                      </h4>
                      <div className="space-y-1 text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Max Purchase Price:</span>
                          <span className="font-semibold text-emerald-400">${prog.maxPurchasePriceUsd.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Max Income Cap:</span>
                          <span className="font-semibold text-amber-400">${prog.maxIncomeCapUsd.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Min Credit Score:</span>
                          <span className="font-semibold text-cyan-400">{prog.minCreditScore} FICO</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Estimated DPA:</span>
                          <span className="font-semibold text-purple-300">${prog.dpaAssistanceUsd.toLocaleString()}</span>
                        </div>
                      </div>
                      <ul className="text-[11px] text-slate-400 space-y-1 mb-3">
                        {prog.qualifyingHighlights.slice(0, 3).map((h, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-slate-400">Join-Conversation Script:</span>
                        <button
                          onClick={() => handleCopy(prog.conversationJoinerTemplate, idx)}
                          className="flex items-center gap-1 text-[10px] text-cyan-400 hover:text-cyan-300"
                        >
                          {copiedTemplateIdx === idx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          {copiedTemplateIdx === idx ? 'Copied!' : 'Copy Script'}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-300 italic bg-slate-900/60 p-2 rounded-lg border border-slate-800 line-clamp-2">
                        "{prog.conversationJoinerTemplate}"
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Lakeview National Program 50-State Status */}
          {activeTab === 'lakeview_status' && (
            <div className="space-y-5">
              <div className="p-5 bg-gradient-to-br from-indigo-950/70 via-slate-900 to-purple-950/50 border border-indigo-500/40 rounded-2xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-indigo-500/20 text-indigo-300 rounded-2xl border border-indigo-500/30">
                    <Award className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      Lakeview National Loan Program State Eligibility: <span className="text-emerald-400">ALL 50 STATES ELIGIBLE</span>
                    </h3>
                    <p className="text-xs text-slate-300">
                      Lakeview Loan Servicing / Bayview correspondent lending covers all 50 states + Washington D.C. + Puerto Rico.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Max LTV & Financing</span>
                    <p className="text-base font-bold text-emerald-400">100% Total LTV</p>
                    <span className="text-[10px] text-slate-400">0% out of pocket down payment</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">2026 Conforming Cap</span>
                    <p className="text-base font-bold text-cyan-400">$832,750</p>
                    <span className="text-[10px] text-slate-400">1-Unit stick-built SFR/PUD/Condo</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">Household Income Limit</span>
                    <p className="text-base font-bold text-amber-400">140% County AMI</p>
                    <span className="text-[10px] text-slate-400">Fannie Mae county median schedule</span>
                  </div>
                  <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">FICO Credit Tier</span>
                    <p className="text-base font-bold text-purple-400">620 / 660 FICO</p>
                    <span className="text-[10px] text-slate-400">620 for 3.5% DPA; 660 for 5.0%</span>
                  </div>
                </div>
              </div>

              {/* Lakeview Guidelines Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Lakeview National Underwriting Strengths
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>Statewide in every state:</strong> All 3,143 counties across the US are eligible without geographic blackout zones.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>Soft Second 0% Lien:</strong> 3.5% or 5.0% assistance lien with no monthly payments due until resale, refinance, or payoff.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>Generous 140% AMI Ceiling:</strong> Enables middle-to-higher income wage earners to preserve liquidity and purchase without 20% down.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span><strong>Non-occupant co-signers permitted:</strong> Parents/family members can co-sign up to 96.5% LTV.</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800">
                  <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    Lakeview Strict Exclusions & Guideline Limits
                  </h4>
                  <ul className="text-xs text-slate-300 space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span><strong>1-Unit Primary Residence Only:</strong> Multi-unit properties (duplexes, triplexes, fourplexes) and investment properties are strictly ineligible.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span><strong>Stick-Built Only:</strong> Manufactured and mobile homes are prohibited. Must be SFR, Townhome, PUD, or warrantable Condo.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span><strong>Schedule Update Cycles:</strong> Fannie Mae AMI schedules update every Dec 1st; Maximum loan limits update July 1st.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-400 font-bold">•</span>
                      <span><strong>Homebuyer Education Required:</strong> Borrowers must complete a HUD-approved or Fannie Mae Framework pre-purchase course.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Live Lead Overlay Test Calculator */}
          {activeTab === 'calculator' && (
            <div className="space-y-5">
              <div className="bg-slate-950/70 p-5 rounded-2xl border border-indigo-500/30">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Lead Scrape Program Qualifier & Overlay Simulator
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Adjust candidate lead parameters below to simulate automated qualification against all 6 major programs for <strong>{stateData.stateName}</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Purchase Price: <span className="text-emerald-400">${testPrice.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min={200000}
                      max={950000}
                      step={5000}
                      value={testPrice}
                      onChange={(e) => setTestPrice(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Household Income: <span className="text-amber-400">${testIncome.toLocaleString()}/yr</span>
                    </label>
                    <input
                      type="range"
                      min={35000}
                      max={180000}
                      step={2500}
                      value={testIncome}
                      onChange={(e) => setTestIncome(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Credit Score: <span className="text-cyan-400">{testCredit} FICO</span>
                    </label>
                    <input
                      type="range"
                      min={580}
                      max={800}
                      step={5}
                      value={testCredit}
                      onChange={(e) => setTestCredit(Number(e.target.value))}
                      className="w-full accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-slate-800 text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isRuralTract}
                      onChange={(e) => setIsRuralTract(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Property in USDA Rural/Suburban Census Tract ({stateData.usdaRuralTractPercentage}% in {stateData.stateCode})</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={isLmiTract}
                      onChange={(e) => setIsLmiTract(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>Property in FFIEC LMI Census Tract (~{stateData.lmiTractCountEstimate} tracts in {stateData.stateCode})</span>
                  </label>
                </div>
              </div>

              {/* Simulation Results Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Overlay Evaluation Matrix ({auditResult.eligibleProgramsCount} of 6 Programs Eligible)
                  </h4>
                  <span className="text-xs text-indigo-300 font-medium">
                    Recommended: <strong>{auditResult.recommendedBestProduct.programName}</strong>
                  </span>
                </div>

                <div className="space-y-2.5">
                  {auditResult.programs.map((p) => (
                    <div
                      key={p.programId}
                      className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition ${
                        p.isEligible
                          ? 'bg-emerald-950/20 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-950/50 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{p.programName}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.isEligible
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {p.isEligible ? 'QUALIFIES (100%)' : 'NOT ELIGIBLE'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {p.category} • Required Down Payment: <strong className="text-cyan-300">${p.downPaymentOutOfPocketUsd.toLocaleString()}</strong> • Assistance: <strong className="text-purple-300">${p.dpaAssistanceUsd.toLocaleString()}</strong>
                        </p>
                        {!p.isEligible && p.disqualificationReasons.length > 0 && (
                          <p className="text-[11px] text-rose-300">
                            Reasons: {p.disqualificationReasons.join(' • ')}
                          </p>
                        )}
                      </div>

                      <div className="shrink-0 flex items-center gap-2">
                        <button
                          onClick={() => handleCopy(p.conversationJoinerTemplate, 99)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 flex items-center gap-1.5 transition"
                        >
                          <Send className="w-3 h-3 text-indigo-400" />
                          Copy Reply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LMI Census Tract & AMI Limits Overlay */}
          {activeTab === 'census_overlay' && (
            <div className="space-y-5">
              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
                <h3 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  {stateData.stateName} Geomap Census Tract & AMI Tier Breakdown
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Every discovered lead is geocoded against FFIEC LMI Census Tract Shapefiles and Fannie Mae AMI benchmark schedules.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">≤80% AMI (Low-Income Cap)</span>
                    <p className="text-base font-bold text-cyan-400">${Math.round(stateData.medianHouseholdAmiUsd * 0.80).toLocaleString()}</p>
                    <span className="text-[10px] text-slate-400">HomeReady, Home Possible, 2-1 Buydown</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">≤115% AMI (Moderate / USDA Cap)</span>
                    <p className="text-base font-bold text-amber-400">${Math.round(stateData.medianHouseholdAmiUsd * 1.15).toLocaleString()}</p>
                    <span className="text-[10px] text-slate-400">USDA RD 100% + 2-1 Buydown Stack</span>
                  </div>
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 uppercase font-semibold">≤140% AMI (Lakeview / NHF Cap)</span>
                    <p className="text-base font-bold text-emerald-400">${Math.round(stateData.medianHouseholdAmiUsd * 1.40).toLocaleString()}</p>
                    <span className="text-[10px] text-slate-400">Lakeview National 100%, NHF 5% DPA</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">State Baseline Conforming Limit (2026):</span>
                    <span className="font-semibold text-white">$832,750 (1-Unit SFR/PUD/Condo)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Estimated LMI Census Tracts:</span>
                    <span className="font-semibold text-cyan-300">{stateData.lmiTractCountEstimate} tracts</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">USDA Rural Geographic Coverage:</span>
                    <span className="font-semibold text-emerald-300">{stateData.usdaRuralTractPercentage}% of land area</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Benefit Stacking Strategy:</span>
                    <span className="font-semibold text-purple-300">USDA RD 100% Zero-Down + Seller 2-1 Buydown</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Cross-referencing Lakeview National (50 States), USDA RD Zero-Down, NHF DPA, State Bonds & 2-1 Buydown Stacks</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl transition"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
