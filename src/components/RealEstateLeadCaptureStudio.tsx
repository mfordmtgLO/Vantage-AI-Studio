/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Sparkles, 
  DollarSign, 
  Mail, 
  Phone, 
  MapPin, 
  Award, 
  FileText, 
  Send, 
  ShieldCheck, 
  Brain, 
  Clock, 
  Download, 
  Copy, 
  Check, 
  ChevronRight, 
  TrendingUp, 
  Home,
  Sliders,
  Database,
  Share2
} from 'lucide-react';
import { calculateDtiEnvelope, formatUSD } from '../services/geomapMortgageEngine';
import { useMemory } from '../context/MemoryContext';

export interface CapturedBuyerLead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  targetCity: string;
  grossMonthlyIncome: number;
  monthlyDebtObligations: number;
  availableDownPayment: number;
  creditScoreTier: '740+' | '680-739' | '620-679' | 'Under 620';
  targetLoanProgram: 'USDA 100%' | 'FHA 3.5%' | 'Conventional 3%' | 'VA Loan';
  calculatedMaxPurchase: number;
  calculatedFrontEndDti: number;
  calculatedBackEndDti: number;
  timestamp: string;
  status: 'new_inquiry' | 'prequalified' | 'contract_pending' | 'closed';
  notes?: string;
}

export const RealEstateLeadCaptureStudio: React.FC = () => {
  const { saveMemory } = useMemory();

  // 3-Step Intake Wizard State
  const [wizardStep, setWizardStep] = useState<number>(1);
  
  // Step 1: Financials
  const [income, setIncome] = useState<number>(8500);
  const [debt, setDebt] = useState<number>(550);
  const [downPayment, setDownPayment] = useState<number>(12000);
  const [creditTier, setCreditTier] = useState<'740+' | '680-739' | '620-679' | 'Under 620'>('740+');
  const [loanProgram, setLoanProgram] = useState<'USDA 100%' | 'FHA 3.5%' | 'Conventional 3%' | 'VA Loan'>('USDA 100%');

  // Step 2: Location & Preferences
  const [targetCity, setTargetCity] = useState<string>('Portland & Willamette Valley, OR');
  const [targetBedrooms, setTargetBedrooms] = useState<number>(3);
  const [timeframe, setTimeframe] = useState<string>('Within 30-60 Days');

  // Step 3: Contact Info
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Captured Leads State
  const [capturedLeads, setCapturedLeads] = useState<CapturedBuyerLead[]>([
    {
      id: 'lead-1',
      fullName: 'Marcus & Jessica Vance',
      email: 'marcus.vance@example.com',
      phone: '(503) 555-0192',
      targetCity: 'Scappoose & St. Helens, OR',
      grossMonthlyIncome: 9200,
      monthlyDebtObligations: 650,
      availableDownPayment: 15000,
      creditScoreTier: '740+',
      targetLoanProgram: 'USDA 100%',
      calculatedMaxPurchase: 425000,
      calculatedFrontEndDti: 28.4,
      calculatedBackEndDti: 35.5,
      timestamp: '2026-09-21T18:30:00Z',
      status: 'prequalified',
      notes: 'Interested in zero down payment USDA rural eligible properties with 3+ bedrooms.'
    },
    {
      id: 'lead-2',
      fullName: 'Elena Rostova',
      email: 'elena.rostova@techcorp.io',
      phone: '(503) 555-8841',
      targetCity: 'SE Portland (Hawthorne / Division)',
      grossMonthlyIncome: 11000,
      monthlyDebtObligations: 400,
      availableDownPayment: 25000,
      creditScoreTier: '740+',
      targetLoanProgram: 'Conventional 3%',
      calculatedMaxPurchase: 510000,
      calculatedFrontEndDti: 25.1,
      calculatedBackEndDti: 28.7,
      timestamp: '2026-09-20T14:15:00Z',
      status: 'new_inquiry',
      notes: 'Eligible for $5,000 Bank CRA LMI Grant in Multnomah County tract.'
    }
  ]);

  const [notification, setNotification] = useState<string | null>(null);
  const [copiedLeadId, setCopiedLeadId] = useState<string | null>(null);
  const [selectedLead, setSelectedLead] = useState<CapturedBuyerLead | null>(null);

  // Live Prequalification Envelope Calculation
  const livePrequal = useMemo(() => {
    return calculateDtiEnvelope({
      grossMonthlyIncome: income,
      totalMonthlyDebtObligations: debt,
      availableDownPayment: downPayment,
      targetInterestRate: 6.25,
      loanTermYears: 30,
      maxBackEndDtiPercent: 45.0,
      maxFrontEndDtiPercent: 36.0
    });
  }, [income, debt, downPayment]);

  // Submit Lead Submission
  const handleSubmitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email) return;

    const newLead: CapturedBuyerLead = {
      id: 'lead-' + Date.now(),
      fullName,
      email,
      phone: phone || 'N/A',
      targetCity,
      grossMonthlyIncome: income,
      monthlyDebtObligations: debt,
      availableDownPayment: downPayment,
      creditScoreTier: creditTier,
      targetLoanProgram: loanProgram,
      calculatedMaxPurchase: livePrequal.estimatedMaxPurchasePrice,
      calculatedFrontEndDti: livePrequal.calculatedFrontEndDti,
      calculatedBackEndDti: livePrequal.calculatedBackEndDti,
      timestamp: new Date().toISOString(),
      status: 'prequalified',
      notes: notes || `Prequalified for ~${formatUSD(livePrequal.estimatedMaxPurchasePrice)} with ${loanProgram}.`
    };

    setCapturedLeads([newLead, ...capturedLeads]);

    // Commit to 2nd Brain Cognitive Vault
    await saveMemory({
      title: `Buyer Lead: ${fullName} (${formatUSD(livePrequal.estimatedMaxPurchasePrice)} Prequal)`,
      content: `Prequalified Buyer Lead: ${fullName}\nEmail: ${email} | Phone: ${phone}\nTarget Area: ${targetCity}\nMonthly Income: ${formatUSD(income)} | Debt: ${formatUSD(debt)} | Down Payment: ${formatUSD(downPayment)}\nCredit Tier: ${creditTier} | Program: ${loanProgram}\nMax Purchase Envelope: ${formatUSD(livePrequal.estimatedMaxPurchasePrice)} (DTI: ${livePrequal.calculatedBackEndDti}%)\nNotes: ${notes || 'None'}`,
      type: 'knowledge',
      category: 'crm_buyer_lead',
      tags: ['buyer_lead', 'crm_prequal', 'first_time_homebuyer', targetCity.toLowerCase().replace(/\s+/g, '-')],
      source: 'manual'
    });

    setNotification(`Successfully prequalified and captured ${fullName}! Synchronized to CRM & 2nd Brain.`);
    setTimeout(() => setNotification(null), 5000);

    // Reset Form
    setWizardStep(1);
    setFullName('');
    setEmail('');
    setPhone('');
    setNotes('');
  };

  // Export Leads to CSV
  const handleExportCsv = () => {
    const headers = 'Full Name,Email,Phone,Target City,Monthly Income,Monthly Debt,Down Payment,Credit Tier,Program,Max Purchase,DTI Back-End,Status,Date\n';
    const rows = capturedLeads.map(l => 
      `"${l.fullName}","${l.email}","${l.phone}","${l.targetCity}",${l.grossMonthlyIncome},${l.monthlyDebtObligations},${l.availableDownPayment},"${l.creditScoreTier}","${l.targetLoanProgram}",${l.calculatedMaxPurchase},${l.calculatedBackEndDti},"${l.status}","${l.timestamp}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Vantage_Prequalified_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy Lead Card to Clipboard
  const handleCopyLead = (lead: CapturedBuyerLead) => {
    const card = `VANTAGE BUYER PREQUALIFICATION SCORECARD
Buyer: ${lead.fullName}
Email: ${lead.email} | Phone: ${lead.phone}
Target Area: ${lead.targetCity}
Prequalified Purchase Envelope: ${formatUSD(lead.calculatedMaxPurchase)}
Monthly Income: ${formatUSD(lead.grossMonthlyIncome)} | Monthly Debt: ${formatUSD(lead.monthlyDebtObligations)}
Down Payment: ${formatUSD(lead.availableDownPayment)} | Credit: ${lead.creditScoreTier}
Loan Program: ${lead.targetLoanProgram} (DTI: ${lead.calculatedBackEndDti}%)
Status: ${lead.status.toUpperCase()}`;

    navigator.clipboard.writeText(card);
    setCopiedLeadId(lead.id);
    setTimeout(() => setCopiedLeadId(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-full border border-blue-400/30">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>MODULE 4 &bull; AUTONOMOUS LEAD CAPTURE & PREQUAL INTAKE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
              Real Estate Lead Capture & DTI Scorecard Studio
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              3-step high-converting lead qualification wizard that computes real-time purchase power envelopes, generates instant shareable pre-qual cards, and synchronizes leads directly with Google Sheets and the 2nd Brain CRM vault.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition border border-slate-700 cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Export CRM CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-2xl flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* 2-Column Grid: Lead Intake Wizard vs CRM Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 1 Col: 3-Step Lead Intake Form */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            
            {/* Wizard Step Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Buyer Prequal Intake Wizard</span>
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
                Step {wizardStep} of 3
              </span>
            </div>

            {/* Live Calculated Envelope Preview */}
            <div className="p-4 bg-blue-50/70 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-900/60 text-center space-y-1">
              <span className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400">
                Live Calculated Purchase Power
              </span>
              <div className="text-2xl font-black text-blue-900 dark:text-blue-100 font-mono">
                {formatUSD(livePrequal.estimatedMaxPurchasePrice)}
              </div>
              <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
                <span>Front DTI: {livePrequal.calculatedFrontEndDti}%</span>
                <span>&bull;</span>
                <span>Back DTI: {livePrequal.calculatedBackEndDti}%</span>
              </div>
            </div>

            {/* Step 1: Financial Details */}
            {wizardStep === 1 && (
              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    <span>Gross Monthly Income</span>
                    <span className="font-mono font-bold">{formatUSD(income)}</span>
                  </div>
                  <input
                    type="range"
                    min={2500}
                    max={25000}
                    step={250}
                    value={income}
                    onChange={(e) => setIncome(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    <span>Monthly Recurring Debt (Auto, Student, Cards)</span>
                    <span className="font-mono font-bold">{formatUSD(debt)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={4000}
                    step={50}
                    value={debt}
                    onChange={(e) => setDebt(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-slate-700 dark:text-slate-300 font-semibold mb-1">
                    <span>Available Down Payment / Savings</span>
                    <span className="font-mono font-bold">{formatUSD(downPayment)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={60000}
                    step={1000}
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseInt(e.target.value, 10))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Credit Score Tier</label>
                  <select
                    value={creditTier}
                    onChange={(e) => setCreditTier(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-medium"
                  >
                    <option value="740+">Excellent (740+) - Best Rates</option>
                    <option value="680-739">Good (680 - 739) - Standard Conventional/FHA</option>
                    <option value="620-679">Fair (620 - 679) - USDA & FHA Eligible</option>
                    <option value="Under 620">Needs Credit Boost (Under 620)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => setWizardStep(2)}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5 mt-2"
                >
                  <span>Next: Property Preferences</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 2: Property Preferences */}
            {wizardStep === 2 && (
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Target Search Location</label>
                  <input
                    type="text"
                    value={targetCity}
                    onChange={(e) => setTargetCity(e.target.value)}
                    placeholder="e.g. Scappoose, OR / Rural Clackamas"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Preferred Loan Program</label>
                  <select
                    value={loanProgram}
                    onChange={(e) => setLoanProgram(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-medium"
                  >
                    <option value="USDA 100%">USDA 100% Zero Down Rural Financing</option>
                    <option value="FHA 3.5%">FHA 3.5% Low Down Payment</option>
                    <option value="Conventional 3%">Conventional 3% HomeReady / Home Possible</option>
                    <option value="VA Loan">VA Loan (100% Veteran Financing)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Target Bedrooms</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[2, 3, 4, 5].map((beds) => (
                      <button
                        key={beds}
                        type="button"
                        onClick={() => setTargetBedrooms(beds)}
                        className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          targetBedrooms === beds
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {beds}+ Beds
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(1)}
                    className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => setWizardStep(3)}
                    className="w-2/3 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <span>Next: Contact Details</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Contact & Submit */}
            {wizardStep === 3 && (
              <form onSubmit={handleSubmitLead} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Buyer Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. David & Sarah Miller"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="david.miller@example.com"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(503) 555-0182"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">Notes / Preferences</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special requirements (e.g., USDA zero-down only, acreage preferred)..."
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl outline-none text-xs font-medium resize-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setWizardStep(2)}
                    className="w-1/3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Complete Prequal & Capture</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>

        {/* Right 2 Cols: CRM Pipeline & Prequalified Buyer Leads */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-0.5">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Database className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Captured Buyer Lead Pipeline ({capturedLeads.length})</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time DTI scorecards synced with Vantage CRM & 2nd Brain
                </p>
              </div>

              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Auto-synced with Google Sheets
              </span>
            </div>

            <div className="space-y-4">
              {capturedLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:bg-white dark:hover:bg-slate-900 transition-all space-y-3.5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {lead.fullName}
                        </h4>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                          {lead.targetLoanProgram}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                          Credit: {lead.creditScoreTier}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-slate-400" /> {lead.email}</span>
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-slate-400" /> {lead.phone}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {lead.targetCity}</span>
                      </div>
                    </div>

                    <div className="text-right sm:pl-4 shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Approved Purchase Power</span>
                      <span className="text-lg font-black text-blue-600 dark:text-blue-400 font-mono">
                        {formatUSD(lead.calculatedMaxPurchase)}
                      </span>
                    </div>
                  </div>

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Income</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatUSD(lead.grossMonthlyIncome)}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Monthly Debt</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatUSD(lead.monthlyDebtObligations)}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Down Payment</span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatUSD(lead.availableDownPayment)}</span>
                    </div>
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Back-End DTI</span>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{lead.calculatedBackEndDti}%</span>
                    </div>
                  </div>

                  {lead.notes && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-400 italic bg-white/60 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                      &ldquo;{lead.notes}&rdquo;
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Captured on {new Date(lead.timestamp).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLead(lead)}
                        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-[11px] font-semibold transition border border-slate-200 dark:border-slate-700 cursor-pointer flex items-center gap-1"
                      >
                        {copiedLeadId === lead.id ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLeadId === lead.id ? 'Copied' : 'Scorecard'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
