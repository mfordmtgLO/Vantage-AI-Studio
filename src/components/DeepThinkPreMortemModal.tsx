/**
 * @file DeepThinkPreMortemModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * VANTAGE GEOMAP 3.0: DEEPTHINK ADVERSARIAL PRE-MORTEM RISK AUDIT MODAL
 */

import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  X, 
  CheckCircle2, 
  Brain, 
  TrendingDown, 
  FileText, 
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { SyncedPropertyListing } from '../types/firstTimeHomebuyerPlugin';
import { formatUSD } from '../services/geomapMortgageEngine';
import { runDeepThinkPreMortemAudit } from '../services/geomapCognitiveEngine';

interface DeepThinkPreMortemModalProps {
  listing: SyncedPropertyListing;
  isOpen: boolean;
  onClose: () => void;
}

export const DeepThinkPreMortemModal: React.FC<DeepThinkPreMortemModalProps> = ({
  listing,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  const audit = runDeepThinkPreMortemAudit(listing);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-400/30 text-xs font-bold uppercase tracking-wider">
              <Brain className="w-3.5 h-3.5 text-rose-400" />
              DeepThink Prefrontal Adversarial Pre-Mortem
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {listing.formattedAddress}
            </h3>
            <p className="text-xs text-rose-200/80">
              "What Could Go Wrong?" Objective Risk Stress-Test & Offer Mitigation Strategy
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
        <div className="p-6 overflow-y-auto space-y-5 text-slate-800 dark:text-slate-100">
          {/* Risk Score Hero */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Risk Stress-Test</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl sm:text-3xl font-black text-rose-600 dark:text-rose-400">
                  {audit.overallRiskScore}/100
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                  {audit.riskLevel}
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Suggested Offer Discount</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                -{formatUSD(audit.recommendedOfferDiscountUsd)}
              </span>
              <span className="text-[10px] text-slate-500 block">To offset projected CapEx</span>
            </div>
          </div>

          {/* Adversarial Thesis */}
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
            <strong className="block mb-1 text-indigo-900 dark:text-indigo-300 uppercase tracking-wider text-[10px]">
              Pre-Mortem Failure Hypothesis:
            </strong>
            {audit.preMortemThesis}
          </div>

          {/* Potential Pitfalls List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              Identified Friction Points & Mitigation Checklist
            </h4>

            <div className="space-y-2.5">
              {audit.potentialPitfalls.map((pitfall, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${
                        pitfall.severity === 'High' ? 'bg-rose-500' : 'bg-amber-500'
                      }`} />
                      {pitfall.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pitfall.severity === 'High' 
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400' 
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                    }`}>
                      {pitfall.severity} Severity
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {pitfall.finding}
                  </p>

                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[11px] text-emerald-700 dark:text-emerald-400 flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong>Mitigation:</strong> {pitfall.mitigationStrategy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white text-xs font-bold transition cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
};
