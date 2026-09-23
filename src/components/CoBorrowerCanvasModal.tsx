/**
 * @file CoBorrowerCanvasModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * VANTAGE GEOMAP 3.0: REAL-TIME COLLABORATIVE CO-BORROWER CANVAS
 */

import React, { useState } from 'react';
import { 
  Users, 
  DollarSign, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  Sliders, 
  Sparkles, 
  ShieldCheck,
  Building,
  Activity
} from 'lucide-react';
import { CoBorrowerCanvasProfile, calculateCoBorrowerEnvelope } from '../services/geomapCognitiveEngine';
import { formatUSD } from '../services/geomapMortgageEngine';

interface CoBorrowerCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyProfile?: (combinedMaxPrice: number, combinedDown: number) => void;
}

export const CoBorrowerCanvasModal: React.FC<CoBorrowerCanvasModalProps> = ({
  isOpen,
  onClose,
  onApplyProfile
}) => {
  const [profile, setProfile] = useState<CoBorrowerCanvasProfile>({
    primaryBorrowerName: 'Marcus Brooks',
    primaryGrossMonthlyIncome: 5500,
    primaryMonthlyDebts: 450,
    hasCoBorrower: true,
    coBorrowerName: 'Elena Brooks',
    coBorrowerGrossMonthlyIncome: 4200,
    coBorrowerMonthlyDebts: 320,
    combinedDownPayment: 15000,
    targetInterestRate: 6.5
  });

  if (!isOpen) return null;

  const result = calculateCoBorrowerEnvelope(profile);
  const soloResult = calculateCoBorrowerEnvelope({ ...profile, hasCoBorrower: false });

  const purchasingPowerBoost = Math.max(0, result.estimatedMaxPurchasePrice - soloResult.estimatedMaxPurchasePrice);

  const handleApply = () => {
    if (onApplyProfile) {
      onApplyProfile(result.estimatedMaxPurchasePrice, profile.combinedDownPayment);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              Real-Time Collaborative Co-Borrower Canvas
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Joint Purchasing Power & DTI Synchronizer
            </h3>
            <p className="text-xs text-blue-200/80">
              Model combined gross incomes, shared liabilities, and expanded housing payment envelopes in real time.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-100">
          {/* Hero Comparison Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Solo Purchasing Power</span>
              <span className="text-xl font-black text-slate-700 dark:text-slate-300">{formatUSD(soloResult.estimatedMaxPurchasePrice)}</span>
              <span className="text-[10px] text-slate-500 block">Primary borrower only</span>
            </div>

            <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
              <span className="text-[10px] uppercase font-bold text-indigo-500 dark:text-indigo-300 block">Joint Purchasing Power</span>
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{formatUSD(result.estimatedMaxPurchasePrice)}</span>
              <span className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 block">Combined Co-Borrower DTI</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">Expansion Boost</span>
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">+{formatUSD(purchasingPowerBoost)}</span>
              <span className="text-[10px] text-emerald-700/80 dark:text-emerald-300/80 block">Additional listing inventory unlocked</span>
            </div>
          </div>

          {/* Toggle Co-Borrower */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2.5">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Include Co-Borrower / Co-Signer Income</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={profile.hasCoBorrower} 
                onChange={(e) => setProfile(prev => ({ ...prev, hasCoBorrower: e.target.checked }))} 
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Borrower Sliders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Primary Borrower */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Primary Borrower ({profile.primaryBorrowerName})
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gross Monthly Income:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatUSD(profile.primaryGrossMonthlyIncome)}/mo</span>
                </div>
                <input 
                  type="range"
                  min="2000"
                  max="15000"
                  step="250"
                  value={profile.primaryGrossMonthlyIncome}
                  onChange={(e) => setProfile(prev => ({ ...prev, primaryGrossMonthlyIncome: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Monthly Debts (Car, Cards, Student):</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatUSD(profile.primaryMonthlyDebts)}/mo</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={profile.primaryMonthlyDebts}
                  onChange={(e) => setProfile(prev => ({ ...prev, primaryMonthlyDebts: Number(e.target.value) }))}
                  className="w-full accent-blue-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Co-Borrower */}
            <div className={`p-4 rounded-2xl border space-y-4 transition-opacity ${
              profile.hasCoBorrower 
                ? 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 opacity-100' 
                : 'bg-slate-50 dark:bg-slate-900/40 border-dashed border-slate-300 dark:border-slate-800 opacity-40 pointer-events-none'
            }`}>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                  Co-Borrower ({profile.coBorrowerName})
                </h4>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Gross Monthly Income:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatUSD(profile.coBorrowerGrossMonthlyIncome)}/mo</span>
                </div>
                <input 
                  type="range"
                  min="1000"
                  max="15000"
                  step="250"
                  value={profile.coBorrowerGrossMonthlyIncome}
                  onChange={(e) => setProfile(prev => ({ ...prev, coBorrowerGrossMonthlyIncome: Number(e.target.value) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Monthly Debts:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{formatUSD(profile.coBorrowerMonthlyDebts)}/mo</span>
                </div>
                <input 
                  type="range"
                  min="0"
                  max="3000"
                  step="50"
                  value={profile.coBorrowerMonthlyDebts}
                  onChange={(e) => setProfile(prev => ({ ...prev, coBorrowerMonthlyDebts: Number(e.target.value) }))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* DTI Summary Metrics */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Combined Total Qualifying Monthly Income:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatUSD(result.combinedGrossIncome)}/mo</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Combined Monthly Non-Housing Debts:</span>
              <span className="font-bold text-slate-900 dark:text-slate-100">{formatUSD(result.combinedMonthlyDebts)}/mo</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Max Allowable Total Monthly Housing Payment (PITI):</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatUSD(result.maxAllowableMonthlyHousingPayment)}/mo</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-indigo-600 dark:text-indigo-400">
              <span>Back-End Debt-to-Income Ratio:</span>
              <span>{result.backEndDtiPercent}% (Max Cap: 50.0%)</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Apply Joint Co-Borrower Purchasing Power ({formatUSD(result.estimatedMaxPurchasePrice)})
          </button>
        </div>
      </div>
    </div>
  );
};
