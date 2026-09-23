/**
 * @file DpaGrantWaterfallModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * VANTAGE GEOMAP 3.0: DPA GRANT WATERFALL STACKING MODAL
 */

import React, { useState } from 'react';
import { 
  DollarSign, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  HelpCircle, 
  ArrowRight,
  TrendingDown,
  Gift,
  Building,
  Award
} from 'lucide-react';
import { SyncedPropertyListing, BuyerDtiProfile } from '../types/firstTimeHomebuyerPlugin';
import { calculateDpaGrantWaterfall, formatUSD } from '../services/geomapMortgageEngine';
import { calculateDpaGrantWaterfall as calcWaterfall } from '../services/geomapCognitiveEngine';

interface DpaGrantWaterfallModalProps {
  listing: SyncedPropertyListing;
  buyerProfile: BuyerDtiProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const DpaGrantWaterfallModal: React.FC<DpaGrantWaterfallModalProps> = ({
  listing,
  buyerProfile,
  isOpen,
  onClose
}) => {
  const [sellerConcessionPct, setSellerConcessionPct] = useState<number>(0);

  if (!isOpen) return null;

  const waterfall = calcWaterfall(listing, buyerProfile, sellerConcessionPct);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 text-white relative flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Multi-Layer DPA Grant Waterfall Solver
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {listing.formattedAddress}
            </h3>
            <p className="text-xs text-emerald-200/80">
              List Price: <span className="font-bold text-white">{formatUSD(listing.price)}</span> • FIPS GeoID: {listing.geoid || 'N/A'}
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
          {/* Status Badge Hero */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between ${
            waterfall.qualifiesForTrueZeroOutOfPocket
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-100'
              : 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-100'
          }`}>
            <div className="space-y-1">
              <span className="text-xs uppercase font-bold tracking-wider opacity-80">
                Net Out-of-Pocket Cash at Closing
              </span>
              <div className="text-2xl sm:text-3xl font-black">
                {waterfall.qualifiesForTrueZeroOutOfPocket ? '$0.00 (True Zero Out-of-Pocket)' : formatUSD(waterfall.netOutOfPocketCashRequired)}
              </div>
              <p className="text-xs opacity-90">
                Total Grant Assistance Stacked: <strong className="text-emerald-600 dark:text-emerald-400">{formatUSD(waterfall.totalGrantAssistanceUsd)}</strong>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold opacity-70 block">Total Buyer Savings</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {formatUSD(waterfall.savingsVsTraditionalDownPayment)}
              </span>
              <span className="text-[10px] opacity-75 block">vs. 20% Traditional</span>
            </div>
          </div>

          {/* Interactive Seller Concession Slider */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-xs font-semibold">
              <span>Negotiated Seller Concession Closing Credit:</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">{sellerConcessionPct}% ({formatUSD(listing.price * (sellerConcessionPct / 100))})</span>
            </div>
            <input 
              type="range"
              min="0"
              max="6"
              step="1"
              value={sellerConcessionPct}
              onChange={(e) => setSellerConcessionPct(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0% (Standard)</span>
              <span>3% (Conventional Max)</span>
              <span>6% (FHA/USDA Max)</span>
            </div>
          </div>

          {/* Stacked Grant Line Items */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              Legally Stackable Grant & Credit Waterfall ({waterfall.stackedGrants.length} Programs)
            </h4>

            <div className="space-y-2">
              {waterfall.stackedGrants.map((grant, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3 shadow-2xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {grant.programName}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                        {grant.description}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">
                      +{formatUSD(grant.amountUsd)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      {grant.isRepayable ? 'Soft Second' : '100% Forgivable'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Required Down Payment ({waterfall.minimumDownPaymentPercent}%):</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatUSD(waterfall.requiredMinimumDownPayment)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Estimated Closing Costs, Title & Escrow Prepaids:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{formatUSD(waterfall.estimatedClosingCostsAndPrepaids)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-slate-100">
              <span>Total Closing Cash Needed:</span>
              <span>{formatUSD(waterfall.totalCashRequirementBeforeGrants)}</span>
            </div>
            <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
              <span>Less Stacked Grant & Seller Credits:</span>
              <span>-{formatUSD(waterfall.totalGrantAssistanceUsd)}</span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-sm font-black text-indigo-600 dark:text-indigo-400">
              <span>Final Out-of-Pocket Cash to Close:</span>
              <span>{formatUSD(waterfall.netOutOfPocketCashRequired)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <span className="text-[11px] text-slate-500">
            NMLS-compliant mathematical grant stack computation.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
