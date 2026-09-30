/**
 * @file OregonProgramComparisonModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Oregon Housing and Community Services (OHCS) Program Comparison & 36-County Matrix Modal
 * Authoritative side-by-side comparison between Rate Advantage ($0 Cash / Max Rate Discount),
 * FirstHome (4-5% DPA Cash Assistance), Cash Advantage (3% DPA), and NextStep (No Purchase Price Limit),
 * featuring interactive county limit lookups and buyer scenario recommendation logic.
 */

import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Copy,
  Check,
  ArrowRight,
  TrendingDown,
  DollarSign,
  MapPin,
  Building,
  Layers,
  Sparkles,
  Award,
  Globe,
  Sliders,
  Calculator,
  UserCheck,
  Zap,
  Info
} from 'lucide-react';
import {
  OHCS_PROGRAMS_REGISTRY,
  OREGON_ALL_36_COUNTIES_LIMITS,
  OregonHousingProgramsService,
  OregonCountyLimitTier,
  OhcsProgramComparison
} from '../data/oregonHousingProgramsData';

interface OregonProgramComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCountyId?: string;
}

export const OregonProgramComparisonModal: React.FC<OregonProgramComparisonModalProps> = ({
  isOpen,
  onClose,
  initialCountyId = 'lane'
}) => {
  const [selectedCountyId, setSelectedCountyId] = useState<string>(initialCountyId || 'lane');
  const [activeTab, setActiveTab] = useState<'comparison' | 'counties_36' | 'calculator'>('comparison');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Calculator State
  const [calcPrice, setCalcPrice] = useState<number>(450000);
  const [calcIncome, setCalcIncome] = useState<number>(85000);
  const [calcHouseholdSize, setCalcHouseholdSize] = useState<number>(2);
  const [calcHasSavedCash, setCalcHasSavedCash] = useState<boolean>(false);
  const [calcIsFirstTime, setCalcIsFirstTime] = useState<boolean>(true);
  const [calcIsTargeted, setCalcIsTargeted] = useState<boolean>(false);

  if (!isOpen) return null;

  const currentCounty = useMemo(() => {
    return OregonHousingProgramsService.getCountyLimits(selectedCountyId);
  }, [selectedCountyId]);

  const calcResult = useMemo(() => {
    return OregonHousingProgramsService.evaluateProgramRecommendation({
      countyId: selectedCountyId,
      purchasePrice: calcPrice,
      householdIncome: calcIncome,
      householdSize: calcHouseholdSize,
      hasOwnDownPayment: calcHasSavedCash,
      isFirstTimeBuyer: calcIsFirstTime,
      isTargetedTract: calcIsTargeted
    });
  }, [selectedCountyId, calcPrice, calcIncome, calcHouseholdSize, calcHasSavedCash, calcIsFirstTime, calcIsTargeted]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border-2 border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 flex flex-col max-h-[92vh] ring-1 ring-emerald-500/30">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-slate-950 via-emerald-950/70 to-slate-950 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-emerald-950/80 shrink-0">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-black border border-emerald-500/40">
                  OHCS STATE PROGRAM MATRIX
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Oregon Housing &amp; Community Services • 2026 Guidelines
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                Rate Advantage vs. FirstHome DPA vs. NextStep
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Controls: County Selector & Navigation Tabs */}
        <div className="px-6 py-3 bg-slate-950/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Oregon County:</span>
            </span>
            <select
              value={selectedCountyId}
              onChange={(e) => setSelectedCountyId(e.target.value)}
              className="bg-slate-900 border border-emerald-500/50 text-emerald-300 font-bold text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-400 cursor-pointer"
            >
              {OREGON_ALL_36_COUNTIES_LIMITS.map((c) => (
                <option key={c.countyId} value={c.countyId}>
                  {c.countyName} ({c.regionName})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 Side-by-Side Comparison
            </button>
            <button
              onClick={() => setActiveTab('calculator')}
              className={`px-3 py-1.5 font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'calculator'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🧮 Scenario Recommender
            </button>
            <button
              onClick={() => setActiveTab('counties_36')}
              className={`px-3 py-1.5 font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'counties_36'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🗺️ All 36 County Limits
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* TAB 1: SIDE-BY-SIDE PROGRAM COMPARISON */}
          {activeTab === 'comparison' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-slate-950 to-indigo-950/70 border border-emerald-500/40 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>The Fundamental Strategic Distinction</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs pt-1">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-400 block">📉 Rate Advantage ($0 Cash)</span>
                    <p className="text-slate-300 text-[11px]">
                      <strong>$0 Upfront Cash.</strong> Delivers the lowest below-market interest rate. Best when you have saved down payment and want the smallest monthly payment.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="font-bold text-indigo-400 block">💵 FirstHome Flex (4-5% DPA)</span>
                    <p className="text-slate-300 text-[11px]">
                      <strong>4% to 5% Cash Loan/Grant ($29,250 cap).</strong> Wipes out out-of-pocket cash to close. Best when upfront savings is your primary bottleneck.
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-400 block">🚀 NextStep (No Price Cap)</span>
                    <p className="text-slate-300 text-[11px]">
                      <strong>No Purchase Price Limit!</strong> Flat $125k income cap statewide. Allows repeat buyers and homes exceeding county price caps.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Comparison Table */}
              <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-xl bg-slate-950">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-300">
                        <th className="p-3.5 font-black uppercase text-[10px] tracking-wider text-slate-400 w-1/4">
                          Program Feature
                        </th>
                        <th className="p-3.5 font-black text-emerald-400 border-l border-slate-800 w-1/4">
                          Rate Advantage
                        </th>
                        <th className="p-3.5 font-black text-indigo-400 border-l border-slate-800 w-1/4">
                          FirstHome (Flex DPA)
                        </th>
                        <th className="p-3.5 font-black text-amber-400 border-l border-slate-800 w-1/4">
                          NextStep (No Cap)
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      <tr>
                        <td className="p-3.5 font-bold text-white bg-slate-900/40">Primary Benefit</td>
                        <td className="p-3.5 border-l border-slate-800 text-emerald-300 font-semibold">
                          Lowest possible below-market 30-year fixed rate
                        </td>
                        <td className="p-3.5 border-l border-slate-800 text-indigo-300 font-semibold">
                          Upfront cash assistance to cover total funds needed to close
                        </td>
                        <td className="p-3.5 border-l border-slate-800 text-amber-300 font-semibold">
                          Bypasses purchase price caps with 4-5% cash assistance
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold text-white bg-slate-900/40">Cash Assistance Amount</td>
                        <td className="p-3.5 border-l border-slate-800 font-mono text-rose-300 font-black">
                          $0.00 (Zero upfront cash)
                        </td>
                        <td className="p-3.5 border-l border-slate-800 font-mono text-emerald-400 font-bold">
                          4.0% to 5.0% (up to $29,250 cap)
                        </td>
                        <td className="p-3.5 border-l border-slate-800 font-mono text-emerald-400 font-bold">
                          4.0% to 5.0% of 1st mortgage
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold text-white bg-slate-900/40">How Cash is Repaid</td>
                        <td className="p-3.5 border-l border-slate-800 text-slate-500">
                          N/A (No second loan)
                        </td>
                        <td className="p-3.5 border-l border-slate-800">
                          2nd mortgage; forgivable if income $\le 80\%$ AMI
                        </td>
                        <td className="p-3.5 border-l border-slate-800">
                          Standard Flex Lending 2nd mortgage terms
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold text-white bg-slate-900/40">Purchase Price Limits</td>
                        <td className="p-3.5 border-l border-slate-800">
                          Subject to county limit (${currentCounty.nonTargetedPriceCapUsd.toLocaleString()})
                        </td>
                        <td className="p-3.5 border-l border-slate-800">
                          Subject to county limit (${currentCounty.nonTargetedPriceCapUsd.toLocaleString()})
                        </td>
                        <td className="p-3.5 border-l border-slate-800 text-amber-300 font-bold">
                          ⭐ NO PURCHASE PRICE LIMIT
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold text-white bg-slate-900/40">Household Income Limits</td>
                        <td className="p-3.5 border-l border-slate-800">
                          County cap (${currentCounty.incomeLimit1To2PersonsUsd.toLocaleString()} / ${currentCounty.incomeLimit3PlusPersonsUsd.toLocaleString()})
                        </td>
                        <td className="p-3.5 border-l border-slate-800">
                          County cap (${currentCounty.incomeLimit1To2PersonsUsd.toLocaleString()} / ${currentCounty.incomeLimit3PlusPersonsUsd.toLocaleString()})
                        </td>
                        <td className="p-3.5 border-l border-slate-800 text-amber-300 font-bold">
                          Flat $125,000 Statewide
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold text-white bg-slate-900/40">First-Time Buyer Rule</td>
                        <td className="p-3.5 border-l border-slate-800">
                          Yes (Waived in targeted tracts)
                        </td>
                        <td className="p-3.5 border-l border-slate-800">
                          Yes (Waived in targeted tracts)
                        </td>
                        <td className="p-3.5 border-l border-slate-800 text-amber-300 font-bold">
                          NO (Repeat buyers 100% allowed)
                        </td>
                      </tr>

                      <tr>
                        <td className="p-3.5 font-bold text-white bg-slate-900/40">Target Buyer</td>
                        <td className="p-3.5 border-l border-slate-800 text-slate-300">
                          Has saved down payment; prioritizes lowest monthly payment
                        </td>
                        <td className="p-3.5 border-l border-slate-800 text-slate-300">
                          Lacks cash to close; can afford standard monthly mortgage payment
                        </td>
                        <td className="p-3.5 border-l border-slate-800 text-slate-300">
                          Buying higher-priced home exceeding county limits or repeat buyer
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategic Advice Callout */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  <span>How to Pitch These Programs in Live Comment Threads</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-2">
                    <span className="font-bold text-emerald-300 text-xs">For Prospects with Savings:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      &ldquo;If you already have 3.5% or 5% saved in the bank, skip the cash DPA and choose <strong>OHCS Rate Advantage</strong>. It gives you a below-market 30-year rate with $0 cash assistance, saving you hundreds each month.&rdquo;
                    </p>
                    <button
                      onClick={() => handleCopy(
                        `If you already have your down payment saved, check out the OHCS Rate Advantage program. It gives you a deeply discounted below-market interest rate with $0 cash assistance to maximize monthly savings!\n\n— Mike Ford (Senior Loan Officer)\nDirect / SMS: (541) 729-2097 | fordmj@gmail.com`,
                        'pitch-rate'
                      )}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'pitch-rate' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'pitch-rate' ? 'Copied Pitch' : 'Copy Pitch'}</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-2">
                    <span className="font-bold text-indigo-300 text-xs">For Prospects with Zero Savings:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      &ldquo;If down payment cash is what is keeping you renting, <strong>OHCS FirstHome Flex Lending</strong> provides 4% to 5% cash assistance (up to $29,250) to wipe out your cash needed to close.&rdquo;
                    </p>
                    <button
                      onClick={() => handleCopy(
                        `If upfront cash to close is the bottleneck, the OHCS FirstHome Flex Lending program provides 4% to 5% cash assistance (up to $29,250) to cover down payment and closing costs!\n\n— Mike Ford (Senior Loan Officer)\nDirect / SMS: (541) 729-2097 | fordmj@gmail.com`,
                        'pitch-firsthome'
                      )}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-bold border border-indigo-500/40 transition flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'pitch-firsthome' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'pitch-firsthome' ? 'Copied Pitch' : 'Copy Pitch'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SCENARIO RECOMMENDER */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Input parameters */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Calculator className="w-4 h-4 text-emerald-400" />
                    <span>Buyer Scenario &amp; Eligibility Inputs</span>
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Target Purchase Price:</span>
                        <strong className="text-emerald-400 font-mono">${calcPrice.toLocaleString()}</strong>
                      </div>
                      <input
                        type="range"
                        min={250000}
                        max={950000}
                        step={5000}
                        value={calcPrice}
                        onChange={(e) => setCalcPrice(Number(e.target.value))}
                        className="w-full accent-emerald-500 cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>Gross Household Income:</span>
                        <strong className="text-indigo-400 font-mono">${calcIncome.toLocaleString()} / yr</strong>
                      </div>
                      <input
                        type="range"
                        min={45000}
                        max={160000}
                        step={2500}
                        value={calcIncome}
                        onChange={(e) => setCalcIncome(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="text-slate-400 block mb-1">Household Size:</label>
                        <select
                          value={calcHouseholdSize}
                          onChange={(e) => setCalcHouseholdSize(Number(e.target.value))}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-bold"
                        >
                          <option value={1}>1 Person</option>
                          <option value={2}>2 Persons</option>
                          <option value={3}>3+ Persons</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-slate-400 block mb-1">Down Payment Status:</label>
                        <select
                          value={calcHasSavedCash ? 'saved' : 'need_dpa'}
                          onChange={(e) => setCalcHasSavedCash(e.target.value === 'saved')}
                          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl p-2 font-bold"
                        >
                          <option value="need_dpa">Need DPA Cash ($0 saved)</option>
                          <option value="saved">Has 3.5%+ Saved Cash</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-2 border-t border-slate-800">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={calcIsFirstTime}
                          onChange={(e) => setCalcIsFirstTime(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-emerald-400"
                        />
                        <span className="text-slate-300 text-xs">First-Time Buyer (3 yrs)</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={calcIsTargeted}
                          onChange={(e) => setCalcIsTargeted(e.target.checked)}
                          className="rounded text-emerald-500 focus:ring-emerald-400"
                        />
                        <span className="text-slate-300 text-xs">Targeted Census Tract</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right: Automated Program Match Result */}
                <div className="lg:col-span-6 p-5 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/60 border-2 border-emerald-500/60 flex flex-col justify-between space-y-4 shadow-xl">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-500/40">
                        AUTOMATED PROGRAM MATCH
                      </span>
                      <span className={`font-mono text-xs font-bold ${calcResult.isEligible ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {calcResult.isEligible ? '✓ 100% QUALIFIED' : '⚠️ REVIEW LIMITS'}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-white flex items-center gap-2">
                        <span>{calcResult.recommendedProgram.name}</span>
                      </h3>
                      <p className="text-xs text-indigo-300 font-medium mt-1">
                        {calcResult.recommendedProgram.badge}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-300">
                      {calcResult.reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    {calcResult.canUseNextStepBypass && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span><strong>NextStep Activated:</strong> Bypassed {currentCounty.countyName} price limit of ${currentCounty.nonTargetedPriceCapUsd.toLocaleString()}!</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-[10px] text-slate-400">
                      County Cap: <strong className="text-slate-200">${currentCounty.nonTargetedPriceCapUsd.toLocaleString()}</strong> • Income Limit: <strong className="text-slate-200">${currentCounty.incomeLimit1To2PersonsUsd.toLocaleString()}</strong>
                    </div>
                    <button
                      onClick={() => handleCopy(
                        `For a $${calcPrice.toLocaleString()} home in ${currentCounty.countyName} with $${calcIncome.toLocaleString()} income, the recommended mortgage program is the ${calcResult.recommendedProgram.name}.\n\n— Mike Ford (Senior Loan Officer)\nDirect / SMS: (541) 729-2097 | fordmj@gmail.com`,
                        'calc-summary'
                      )}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                    >
                      {copiedKey === 'calc-summary' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'calc-summary' ? 'Copied Summary' : 'Copy Recommendation'}</span>
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: ALL 36 OREGON COUNTIES REGISTRY */}
          {activeTab === 'counties_36' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-white">
                    2026 Oregon Housing &amp; Community Services Purchase Price &amp; Income Limits
                  </h3>
                  <p className="text-xs text-slate-400">
                    IRS Section 143 County Guidelines for Rate Advantage &amp; FirstHome (NextStep has NO price cap)
                  </p>
                </div>
              </div>

              <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-xl bg-slate-950">
                <div className="overflow-x-auto max-h-[500px]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-slate-300 z-10">
                      <tr>
                        <th className="p-3 font-black text-[10px] uppercase text-slate-400">Region &amp; County</th>
                        <th className="p-3 font-black text-[10px] uppercase text-emerald-400">Non-Targeted Cap</th>
                        <th className="p-3 font-black text-[10px] uppercase text-indigo-400">Targeted Cap</th>
                        <th className="p-3 font-black text-[10px] uppercase text-amber-300">Income (1-2 Pers)</th>
                        <th className="p-3 font-black text-[10px] uppercase text-amber-300">Income (3+ Pers)</th>
                        <th className="p-3 font-black text-[10px] uppercase text-slate-400">Major Cities</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {OREGON_ALL_36_COUNTIES_LIMITS.map((c) => {
                        const isSelected = c.countyId === selectedCountyId;
                        return (
                          <tr
                            key={c.countyId}
                            onClick={() => setSelectedCountyId(c.countyId)}
                            className={`cursor-pointer transition ${
                              isSelected
                                ? 'bg-emerald-950/40 border-l-4 border-l-emerald-500 font-bold text-white'
                                : 'hover:bg-slate-900/60'
                            }`}
                          >
                            <td className="p-3">
                              <span className="text-white font-bold block">{c.countyName}</span>
                              <span className="text-[10px] text-slate-500">{c.regionName}</span>
                            </td>
                            <td className="p-3 font-mono text-emerald-400 font-bold">
                              ${c.nonTargetedPriceCapUsd.toLocaleString()}
                            </td>
                            <td className="p-3 font-mono text-indigo-300">
                              {c.targetedPriceCapUsd ? `$${c.targetedPriceCapUsd.toLocaleString()}` : 'Standard'}
                            </td>
                            <td className="p-3 font-mono">
                              ${c.incomeLimit1To2PersonsUsd.toLocaleString()}
                            </td>
                            <td className="p-3 font-mono">
                              ${c.incomeLimit3PlusPersonsUsd.toLocaleString()}
                            </td>
                            <td className="p-3 text-[11px] text-slate-400 truncate max-w-[180px]">
                              {c.majorCities}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NextStep Statewide Callout */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-950 to-amber-950/60 border border-amber-500/40 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">
                    ⚡
                  </div>
                  <div>
                    <strong className="text-white">Remember: NextStep has NO Purchase Price Limits statewide!</strong>
                    <p className="text-slate-300 text-[11px]">
                      If your client is buying above their county purchase price cap, use NextStep (flat $125k income limit, repeat buyers allowed, 4-5% DPA cash assistance).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>IRS Section 143 &amp; OHCS Flex Lending Master Matrix • 2026 Compliant</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold transition cursor-pointer"
          >
            Close Matrix
          </button>
        </div>

      </div>
    </div>
  );
};
