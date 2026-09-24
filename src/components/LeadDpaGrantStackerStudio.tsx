/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  DollarSign, 
  Shield, 
  Layers, 
  Calculator, 
  TrendingDown, 
  CheckCircle2, 
  Sparkles, 
  Building2, 
  Percent, 
  Home, 
  Award, 
  Sliders, 
  ArrowRight, 
  Copy, 
  Check, 
  Download, 
  FileText,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { calculateMonthlyPI, formatUSD } from '../services/geomapMortgageEngine';
import { useMemory } from '../context/MemoryContext';

export interface DpaProgramOption {
  id: string;
  name: string;
  category: 'usda' | 'cra_grant' | 'state_hfa' | 'seller_credit' | 'fha_fnma' | 'lakeview_national' | 'ohcs_flex_firsthome';
  grantAmount: number;
  isGrantNonRepayable: boolean;
  requiredDownPercent: number;
  interestRate: number;
  description: string;
  eligibilityRequirements: string;
  enabled: boolean;
}

export const LeadDpaGrantStackerStudio: React.FC = () => {
  const { saveMemory } = useMemory();

  // Property & Purchase Inputs
  const [purchasePrice, setPurchasePrice] = useState<number>(385000);
  const [interestRate, setInterestRate] = useState<number>(6.25);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [estimatedAnnualTaxes, setEstimatedAnnualTaxes] = useState<number>(3600);
  const [estimatedAnnualInsurance, setEstimatedAnnualInsurance] = useState<number>(1200);
  const [hoaMonthly, setHoaMonthly] = useState<number>(0);
  const [buyerDownPaymentSavings, setBuyerDownPaymentSavings] = useState<number>(8000);

  // Available DPA Subsidies & Programs
  const [programs, setPrograms] = useState<DpaProgramOption[]>([
    {
      id: 'dpa-1',
      name: 'Bank CRA LMI Census Tract Grant',
      category: 'cra_grant',
      grantAmount: 7500,
      isGrantNonRepayable: true,
      requiredDownPercent: 0,
      interestRate: 0,
      description: 'Direct lender grant for designated Low-to-Moderate Income or Minority Census Tracts. 100% non-repayable with no recapture.',
      eligibilityRequirements: 'Property located in eligible FIPS Census Tract; no first-time homebuyer requirement on select bank programs.',
      enabled: true
    },
    {
      id: 'dpa-2',
      name: 'State Housing Finance Agency (HFA) 2nd Lien DPA',
      category: 'state_hfa',
      grantAmount: 10000,
      isGrantNonRepayable: false,
      requiredDownPercent: 0,
      interestRate: 0,
      description: '0% interest, deferred payment 2nd loan forgiven after 5 years of primary residence occupancy.',
      eligibilityRequirements: 'Income under 120% Area Median Income (AMI); minimum 620 credit score.',
      enabled: true
    },
    {
      id: 'dpa-3',
      name: 'Seller Paid Closing Concessions (3%)',
      category: 'seller_credit',
      grantAmount: Math.round(385000 * 0.03),
      isGrantNonRepayable: true,
      requiredDownPercent: 0,
      interestRate: 0,
      description: 'Contractual seller concession credit applied directly toward buyer escrow, title, appraisal, and prepaid insurance.',
      eligibilityRequirements: 'Negotiated in purchase offer contract (up to 3% on Conventional, up to 6% on FHA/USDA).',
      enabled: true
    },
    {
      id: 'dpa-4',
      name: 'FNMA HomeReady / FHLMC Home Possible 3% DPA Stacker',
      category: 'fha_fnma',
      grantAmount: 2500,
      isGrantNonRepayable: true,
      requiredDownPercent: 3.0,
      interestRate: 0,
      description: 'Lender grant assistance for 3% down payment conventional loans with reduced private mortgage insurance (PMI).',
      eligibilityRequirements: 'Borrower income <= 80% AMI; first-time buyer homebuyer education completed.',
      enabled: false
    },
    {
      id: 'dpa-5',
      name: 'USDA Rural Development 100% Zero-Down Loan',
      category: 'usda',
      grantAmount: 0,
      isGrantNonRepayable: true,
      requiredDownPercent: 0,
      interestRate: 6.125,
      description: '100% financing loan with zero down payment required from the borrower for eligible rural and suburban properties.',
      eligibilityRequirements: 'Property inside USDA Rural Eligibility Boundary; household income under USDA limit.',
      enabled: false
    },
    {
      id: 'dpa-6',
      name: 'Lakeview National 100% DPA & Community Land Trust Option',
      category: 'lakeview_national',
      grantAmount: 13475,
      isGrantNonRepayable: true,
      requiredDownPercent: 0,
      interestRate: 6.25,
      description: 'Lakeview Loan Servicing Community Land Trust & 100% National Down Payment Assistance offering 3.5% - 5% forgivable grant assistance.',
      eligibilityRequirements: 'Minimum 620 FICO score; primary residence purchase; stackable with bank CRA census tract grants.',
      enabled: true
    },
    {
      id: 'dpa-7',
      name: 'OHCS Flex Lending FirstHome (4.0%–5.0% Cash Assistance)',
      category: 'ohcs_flex_firsthome',
      grantAmount: 19300,
      isGrantNonRepayable: true,
      requiredDownPercent: 0,
      interestRate: 6.00,
      description: 'Oregon Housing and Community Services (OHCS) Flex Lending FirstHome offering 4.0% standard or 5.0% LMI/Targeted Area cash assistance.',
      eligibilityRequirements: '620 FICO minimum; primary residence in Oregon; First-Time Homebuyer rule WAIVED in Targeted Census Tracts.',
      enabled: true
    }
  ]);

  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);

  // Program toggler
  const toggleProgram = (id: string) => {
    setPrograms(prev => prev.map(p => p.id === id ? { ...p, enabled: !p.enabled } : p));
  };

  // Calculations
  const calculations = useMemo(() => {
    const activePrograms = programs.filter(p => p.enabled);
    const totalGrantsAndAssistance = activePrograms.reduce((sum, p) => sum + p.grantAmount, 0);

    // Baseline 3% down payment requirement for conventional/FHA baseline
    const isUsdaActive = activePrograms.some(p => p.category === 'usda');
    const standardDownPercent = isUsdaActive ? 0 : 3.5;
    const grossRequiredDownPayment = Math.round(purchasePrice * (standardDownPercent / 100));

    // Estimated closing costs ~ 3% of purchase price
    const estimatedClosingCosts = Math.round(purchasePrice * 0.03);
    const totalFundsNeededBeforeSubsidies = grossRequiredDownPayment + estimatedClosingCosts;

    // Remaining buyer out-of-pocket cash required after applying grants
    const netCashNeededFromBuyer = Math.max(0, totalFundsNeededBeforeSubsidies - totalGrantsAndAssistance);
    const buyerCashSavingsSurplus = Math.max(0, buyerDownPaymentSavings - netCashNeededFromBuyer);

    // Total loan amount calculation
    const baseLoanAmount = isUsdaActive ? purchasePrice : (purchasePrice - grossRequiredDownPayment);
    const monthlyPI = calculateMonthlyPI(baseLoanAmount, interestRate, loanTermYears);
    const monthlyTaxes = Math.round(estimatedAnnualTaxes / 12);
    const monthlyInsurance = Math.round(estimatedAnnualInsurance / 12);
    const monthlyPmi = isUsdaActive ? Math.round((baseLoanAmount * 0.0035) / 12) : Math.round((baseLoanAmount * 0.0055) / 12);

    const totalMonthlyPITI = monthlyPI + monthlyTaxes + monthlyInsurance + monthlyPmi + hoaMonthly;

    return {
      activePrograms,
      totalGrantsAndAssistance,
      grossRequiredDownPayment,
      estimatedClosingCosts,
      totalFundsNeededBeforeSubsidies,
      netCashNeededFromBuyer,
      buyerCashSavingsSurplus,
      baseLoanAmount,
      monthlyPI,
      monthlyTaxes,
      monthlyInsurance,
      monthlyPmi,
      totalMonthlyPITI
    };
  }, [purchasePrice, interestRate, loanTermYears, estimatedAnnualTaxes, estimatedAnnualInsurance, hoaMonthly, buyerDownPaymentSavings, programs]);

  // Copy executive DPA summary
  const handleCopySummary = () => {
    const summaryText = `VANTAGE AI DPA GRANT STACKER SUMMARY
Purchase Price: ${formatUSD(purchasePrice)}
Total Grants & Subsidies Stacked: ${formatUSD(calculations.totalGrantsAndAssistance)}
Gross Required Down & Closing Costs: ${formatUSD(calculations.totalFundsNeededBeforeSubsidies)}
Net Cash Needed from Buyer: ${formatUSD(calculations.netCashNeededFromBuyer)}
Estimated Total Monthly PITI: ${formatUSD(calculations.totalMonthlyPITI)}/mo

Active Subsidies:
${calculations.activePrograms.map(p => `• ${p.name}: ${formatUSD(p.grantAmount)} (${p.description})`).join('\n')}

Generated by Vantage Real Estate GeoMap & Lead DPA Engine (Mike Ford <fordmj@gmail.com>)`;

    navigator.clipboard.writeText(summaryText);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  // Sync to 2nd Brain Cognitive Vault
  const handleSyncTo2ndBrain = async () => {
    await saveMemory({
      title: `DPA Stack Plan: ${formatUSD(purchasePrice)} Property (${formatUSD(calculations.totalGrantsAndAssistance)} Subsidies)`,
      content: `Stacked DPA Grant & Down Payment Assistance Calculation for ${formatUSD(purchasePrice)} home.\nTotal Grants Applied: ${formatUSD(calculations.totalGrantsAndAssistance)}.\nNet Out-of-Pocket Cash: ${formatUSD(calculations.netCashNeededFromBuyer)}.\nMonthly Payment (PITI): ${formatUSD(calculations.totalMonthlyPITI)}/mo.\nPrograms Stacked: ${calculations.activePrograms.map(p => p.name).join(', ')}.`,
      type: 'knowledge',
      category: 'dpa_grant_calculation',
      tags: ['dpa_grant', 'down_payment_assistance', 'mortgage_prequal', 'first_time_homebuyer'],
      source: 'manual'
    });

    setSyncSuccess('DPA Subsidy Stack configuration committed to 2nd Brain cognitive memory vault.');
    setTimeout(() => setSyncSuccess(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-bold rounded-full border border-purple-400/30">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>MODULE 4 &bull; MULTI-PROGRAM DPA SUBSIDY STACKER</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Down Payment Assistance (DPA) & Grant Stacker
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Combine non-repayable CRA census tract grants, State HFA 2nd liens, USDA 100% rural loans, and seller concessions to reduce buyer cash-to-close to near $0.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleCopySummary}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer shadow-xs"
            >
              {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedSummary ? 'Summary Copied!' : 'Copy DPA Breakdown'}</span>
            </button>

            <button
              onClick={handleSyncTo2ndBrain}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/30 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Save to 2nd Brain</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sync Notification */}
      {syncSuccess && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{syncSuccess}</span>
        </div>
      )}

      {/* Key Metrics Comparison Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-purple-600" /> Stacked DPA Grants
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 font-mono">
            {formatUSD(calculations.totalGrantsAndAssistance)}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            {calculations.activePrograms.length} Subsidies Applied
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5 text-emerald-600" /> Net Buyer Cash to Close
          </span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            {formatUSD(calculations.netCashNeededFromBuyer)}
          </div>
          <p className="text-[10px] text-emerald-600 font-medium">
            Reduced from {formatUSD(calculations.totalFundsNeededBeforeSubsidies)}
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-blue-600" /> Total Monthly PITI
          </span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 font-mono">
            {formatUSD(calculations.totalMonthlyPITI)}/mo
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Includes P&I, Taxes, Ins & PMI
          </p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Buyer Savings Surplus
          </span>
          <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
            {formatUSD(calculations.buyerCashSavingsSurplus)}
          </div>
          <p className="text-[10px] text-slate-500 font-medium">
            Remaining In Buyer Bank Account
          </p>
        </div>
      </div>

      {/* 2-Column Core Architecture: Interactive Stacker Adjuster vs Program Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: DPA Program Catalog & Multi-Select Stacker */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Available Down Payment Assistance (DPA) Programs</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Toggle eligible grants to stack and calculate composite closing subsidy
                </p>
              </div>

              <span className="text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-3 py-1 rounded-full border border-purple-200 dark:border-purple-800">
                {calculations.activePrograms.length} Active
              </span>
            </div>

            <div className="space-y-4">
              {programs.map((program) => (
                <div
                  key={program.id}
                  onClick={() => toggleProgram(program.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 ${
                    program.enabled
                      ? 'bg-purple-50/50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 shadow-xs'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={program.enabled}
                        onChange={() => {}} // Handled by parent div
                        className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                          {program.name}
                          {program.isGrantNonRepayable && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold">
                              100% Non-Repayable Grant
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {program.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-right sm:pl-4">
                      <div className="text-base font-black text-purple-600 dark:text-purple-400 font-mono">
                        {program.grantAmount > 0 ? formatUSD(program.grantAmount) : '100% Loan'}
                      </div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        Subsidy Amount
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-slate-100 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
                    <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                    <span><strong>Eligibility:</strong> {program.eligibilityRequirements}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Loan Parameters & Monthly PITI Simulator */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="space-y-1 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                <Calculator className="w-4 h-4" /> Loan & Escrow Parameters
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Property & Financing Inputs
              </h3>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Purchase Price</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{formatUSD(purchasePrice)}</span>
                </div>
                <input
                  type="range"
                  min={200000}
                  max={850000}
                  step={5000}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Interest Rate</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{interestRate}%</span>
                </div>
                <input
                  type="range"
                  min={4.5}
                  max={8.5}
                  step={0.125}
                  value={interestRate}
                  onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                  <span>Buyer Available Savings</span>
                  <span className="font-mono text-slate-900 dark:text-slate-100 font-bold">{formatUSD(buyerDownPaymentSavings)}</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={50000}
                  step={1000}
                  value={buyerDownPaymentSavings}
                  onChange={(e) => setBuyerDownPaymentSavings(parseInt(e.target.value, 10))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Annual Taxes</label>
                  <input
                    type="number"
                    value={estimatedAnnualTaxes}
                    onChange={(e) => setEstimatedAnnualTaxes(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Annual Insurance</label>
                  <input
                    type="number"
                    value={estimatedAnnualInsurance}
                    onChange={(e) => setEstimatedAnnualInsurance(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Monthly Payment Breakdown Box */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase block">
                Monthly Escrow Breakdown
              </span>
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Principal & Interest (P&I):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">{formatUSD(calculations.monthlyPI)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Property Taxes:</span>
                  <span className="font-mono">{formatUSD(calculations.monthlyTaxes)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Homeowners Insurance:</span>
                  <span className="font-mono">{formatUSD(calculations.monthlyInsurance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Mortgage Insurance (PMI/MIP):</span>
                  <span className="font-mono">{formatUSD(calculations.monthlyPmi)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-1.5 font-bold text-slate-900 dark:text-slate-100">
                  <span>Total Monthly Payment:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400">{formatUSD(calculations.totalMonthlyPITI)}/mo</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
