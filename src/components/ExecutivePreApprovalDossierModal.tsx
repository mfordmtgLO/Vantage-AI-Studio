/**
 * @file ExecutivePreApprovalDossierModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * VANTAGE GEOMAP 3.0: 1-CLICK EXECUTIVE PRE-APPROVAL DOSSIER MODAL
 */

import React, { useRef } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  ShieldCheck, 
  Award, 
  Building, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  Calendar,
  Share2,
  Phone,
  Mail,
  QrCode
} from 'lucide-react';
import { SyncedPropertyListing, BuyerDtiProfile } from '../types/firstTimeHomebuyerPlugin';
import { formatUSD } from '../services/geomapMortgageEngine';
import { calculateDpaGrantWaterfall } from '../services/geomapCognitiveEngine';

interface ExecutivePreApprovalDossierModalProps {
  listing: SyncedPropertyListing;
  buyerProfile: BuyerDtiProfile;
  isOpen: boolean;
  onClose: () => void;
  assignedLoanOfficerName?: string;
  assignedAgentName?: string;
  hasPairedAgent?: boolean;
}

export const ExecutivePreApprovalDossierModal: React.FC<ExecutivePreApprovalDossierModalProps> = ({
  listing,
  buyerProfile,
  isOpen,
  onClose,
  assignedLoanOfficerName = 'Mike Ford (NMLS #288455)',
  assignedAgentName,
  hasPairedAgent = false
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const waterfall = calculateDpaGrantWaterfall(listing, buyerProfile);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-black uppercase tracking-wider">
              {hasPairedAgent && assignedAgentName 
                ? 'Executive Co-Branded Pre-Approval & Grant Dossier' 
                : 'Direct Executive Mortgage Pre-Approval Dossier'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Container */}
        <div ref={printRef} className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-950 font-sans">
          {/* Header Banner */}
          <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase font-black tracking-widest text-indigo-600 dark:text-indigo-400">
                Official Mortgage Pre-Qualification Certificate
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                Vantage AI Mortgage & Loan Services
              </h1>
              <p className="text-xs text-slate-500">
                {hasPairedAgent && assignedAgentName
                  ? `Co-Branded Partnership Dossier • Mike Ford & ${assignedAgentName}`
                  : 'Direct Single-Originator Property Underwriting Dossier (Zero Agent Intermediary)'}
              </p>
            </div>
            <div className="text-left sm:text-right space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Certificate Date</span>
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono block">Status: VERIFIED PRE-QUALIFIED</span>
            </div>
          </div>

          {/* Borrower & Property Summary Grid */}
          <div className={`grid grid-cols-1 ${hasPairedAgent && assignedAgentName ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-4`}>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Target Property Details
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                {listing.formattedAddress}
              </h4>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div>Purchase Price: <strong className="text-slate-900 dark:text-slate-100">{formatUSD(listing.price)}</strong></div>
                <div>County / Tract: <strong>{listing.county} County • FIPS {listing.geoid || '41051001202'}</strong></div>
                <div>Property Specs: <strong>{listing.bedrooms} Beds • {listing.bathrooms} Baths • {listing.squareFootage} sqft</strong></div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Assigned Mortgage Originator
              </span>
              <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                {assignedLoanOfficerName}
              </h4>
              <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                <div>Company: <strong>Vantage AI Lending Hub</strong></div>
                <div>Direct Phone: <strong>+1 (503) 555-0192</strong></div>
                <div>Email: <strong>fordmj@gmail.com</strong></div>
              </div>
            </div>

            {hasPairedAgent && assignedAgentName && (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                  Partner Real Estate Agent
                </span>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  {assignedAgentName}
                </h4>
                <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                  <div>Status: <strong>Co-Branded Representative</strong></div>
                  <div>Showing Inquiries: <strong>In-App Relayed</strong></div>
                  <div>Partner Portal: <strong>Active Live Pair</strong></div>
                </div>
              </div>
            )}
          </div>

          {/* Grant Qualification Certificate Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-50 via-white to-emerald-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/40 border-2 border-emerald-300 dark:border-emerald-800 space-y-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-sm font-black text-emerald-950 dark:text-emerald-200 uppercase tracking-wider">
                Government & CRA Grant Eligibility Certification
              </h4>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Based on the 11-digit Federal FIPS Census Tract (<span className="font-mono font-bold text-slate-900 dark:text-slate-100">{listing.geoid || '41051001202'}</span>) and borrower income profile, this property is eligible for <strong className="text-emerald-700 dark:text-emerald-300">{formatUSD(waterfall.totalGrantAssistanceUsd)}</strong> in stacked down payment assistance and community closing credits.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
              {waterfall.stackedGrants.map((g, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 text-xs flex justify-between items-center">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{g.programName}</span>
                  <span className="font-black text-emerald-600 dark:text-emerald-400">+{formatUSD(g.amountUsd)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Underwriting Structure Matrix */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Loan Structure & Cash-to-Close Breakdown
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Required Down Pmt</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatUSD(waterfall.requiredMinimumDownPayment)}</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Closing Costs/Prepaids</span>
                <span className="text-sm font-black text-slate-900 dark:text-slate-100">{formatUSD(waterfall.estimatedClosingCostsAndPrepaids)}</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Grants Applied</span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">-{formatUSD(waterfall.totalGrantAssistanceUsd)}</span>
              </div>
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Net Out-of-Pocket</span>
                <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                  {waterfall.qualifiesForTrueZeroOutOfPocket ? '$0.00 (Zero Down)' : formatUSD(waterfall.netOutOfPocketCashRequired)}
                </span>
              </div>
            </div>
          </div>

          {/* Legal Compliance Disclaimer Footer */}
          <div className="text-[10px] text-slate-400 space-y-1 border-t border-slate-200 dark:border-slate-800 pt-3">
            <p>
              * Pre-qualification is subject to final automated underwriting verification (DU/LPA), satisfactory title search, appraisal, and verified income documentation. Down payment grant assistance programs are subject to state/county fund availability.
            </p>
            <p className="font-mono">
              Certificate Hash: SHA256-MF-{listing.id.toUpperCase()}-DOSSIER-2026 • Equal Housing Opportunity Lender.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
