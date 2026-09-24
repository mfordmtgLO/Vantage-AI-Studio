/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • ZILLOW SWEEP 1-CLICK LEAD & AGENT MATCHING MODAL
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Allows Loan Officers to match 1 or more swept property listing cards to
 * CRM leads or Realtor partners, dispatching native system default email drafts
 * (preserving local corporate email signatures), pre-filled SMS text templates,
 * and 1-click batch note appends with LO + Agent co-branded profile footers.
 * ============================================================================
 */

import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  MessageSquare, 
  Check, 
  Copy, 
  Users, 
  Sparkles, 
  ExternalLink, 
  FileText, 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Send,
  Zap,
  Tag
} from 'lucide-react';
import { SyncedPropertyListing } from '../types/firstTimeHomebuyerPlugin';
import { zillowSwarmSweepService } from '../services/zillowSwarmSweepService';

interface ZillowSweepMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperties: SyncedPropertyListing[];
  hasPairedAgent: boolean;
  onAppendNotesToProperties?: (propertyIds: string[], noteText: string) => void;
}

interface MockCrmLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  targetCity: string;
  maxBudget: number;
  loanProgram: string;
}

const PRESET_CRM_LEADS: MockCrmLead[] = [
  {
    id: 'lead_01',
    name: 'Sarah & David Miller',
    email: 'sarah.miller@example.com',
    phone: '(503) 555-8392',
    targetCity: 'Portland / Beaverton',
    maxBudget: 425000,
    loanProgram: 'OHCS Flex 5% DPA Grant'
  },
  {
    id: 'lead_02',
    name: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    phone: '(503) 555-1948',
    targetCity: 'Hillsboro / Washington Co.',
    maxBudget: 400000,
    loanProgram: 'HomeReady 3% Down'
  },
  {
    id: 'lead_03',
    name: 'Jessica Reynolds',
    email: 'jess.reynolds@example.com',
    phone: '(541) 555-4029',
    targetCity: 'Salem / Albany / Rural',
    maxBudget: 350000,
    loanProgram: 'USDA 100% No-Down'
  },
  {
    id: 'lead_04',
    name: 'Elena Rostova',
    email: 'elena.rostova@example.com',
    phone: '(503) 555-6671',
    targetCity: 'Gresham / Clackamas',
    maxBudget: 380000,
    loanProgram: 'Lakeview 100% National DPA'
  }
];

export const ZillowSweepMatchModal: React.FC<ZillowSweepMatchModalProps> = ({
  isOpen,
  onClose,
  selectedProperties,
  hasPairedAgent,
  onAppendNotesToProperties
}) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string>(PRESET_CRM_LEADS[0].id);
  const [customLeadName, setCustomLeadName] = useState<string>('');
  const [customLeadEmail, setCustomLeadEmail] = useState<string>('');
  const [customLeadPhone, setCustomLeadPhone] = useState<string>('');
  const [useCustomLead, setUseCustomLead] = useState<boolean>(false);
  const [coBrandWithAgent, setCoBrandWithAgent] = useState<boolean>(hasPairedAgent);
  const [agentName, setAgentName] = useState<string>('Kanndice McLean (Principal Broker)');
  const [copiedSms, setCopiedSms] = useState<boolean>(false);
  const [customCardNote, setCustomCardNote] = useState<string>(
    '⚡ Special LO Match Note: Reviewed property against current DPA grant matrices. Eligible for up to 100% financing or state first-time homebuyer subsidy.'
  );
  const [notesAppendedFeedback, setNotesAppendedFeedback] = useState<boolean>(false);

  if (!isOpen || selectedProperties.length === 0) return null;

  const currentLead = useCustomLead
    ? {
        name: customLeadName || 'Homebuyer',
        email: customLeadEmail || '',
        phone: customLeadPhone || ''
      }
    : PRESET_CRM_LEADS.find((l) => l.id === selectedLeadId) || PRESET_CRM_LEADS[0];

  const mailtoUrl = zillowSwarmSweepService.generateMailtoDraft(
    currentLead.email,
    currentLead.name,
    selectedProperties,
    coBrandWithAgent,
    agentName
  );

  const smsText = zillowSwarmSweepService.generateSmsDraft(
    currentLead.phone,
    currentLead.name,
    selectedProperties
  );

  const handleCopySms = () => {
    navigator.clipboard.writeText(smsText);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 3000);
  };

  const handleApplyNotesToCards = () => {
    if (!customCardNote.trim()) return;
    const propertyIds = selectedProperties.map((p) => p.id);
    const stampedFooter = coBrandWithAgent
      ? `\n\n[Advisory Team: Mike Ford, LO (NMLS #288455) & ${agentName}]`
      : `\n\n[Managing LO: Mike Ford, NMLS #288455]`;
    const fullNote = customCardNote + stampedFooter;

    if (onAppendNotesToProperties) {
      onAppendNotesToProperties(propertyIds, fullNote);
    }
    setNotesAppendedFeedback(true);
    setTimeout(() => setNotesAppendedFeedback(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-amber-500/40 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 text-stone-100 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Zillow Sweep Match & Outreach Dispatcher</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {selectedProperties.length} {selectedProperties.length === 1 ? 'Card' : 'Cards'} Selected
                </span>
              </h3>
              <p className="text-xs text-stone-400">
                Match swept listings to buyers, generate native signature email drafts, SMS texts & card notes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Properties Chips */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Selected For-Sale Properties ({selectedProperties.length})</span>
          </label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 bg-stone-950 rounded-xl border border-stone-800">
            {selectedProperties.map((p) => (
              <div
                key={p.id}
                className="px-2.5 py-1 rounded-lg bg-stone-900 border border-stone-700 text-xs flex items-center gap-2"
              >
                <span className="font-semibold text-stone-200">{p.addressLine1}</span>
                <span className="font-mono text-amber-400 font-bold">${p.price.toLocaleString()}</span>
                {p.priceDropAmount ? (
                  <span className="text-[10px] text-rose-400 font-bold">(-${p.priceDropAmount.toLocaleString()})</span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        {/* Target Lead Selection */}
        <div className="space-y-2 p-3.5 bg-stone-950/60 rounded-2xl border border-stone-800">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-stone-300 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Target CRM Homebuyer / Lead</span>
            </label>
            <button
              type="button"
              onClick={() => setUseCustomLead(!useCustomLead)}
              className="text-[11px] text-amber-400 hover:text-amber-300 underline cursor-pointer"
            >
              {useCustomLead ? '← Select Preset Lead' : '+ Enter Custom Buyer Info'}
            </button>
          </div>

          {!useCustomLead ? (
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
            >
              {PRESET_CRM_LEADS.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} — {lead.email} | Budget: ${lead.maxBudget.toLocaleString()} ({lead.loanProgram})
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Buyer Full Name"
                value={customLeadName}
                onChange={(e) => setCustomLeadName(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
              <input
                type="email"
                placeholder="buyer@email.com"
                value={customLeadEmail}
                onChange={(e) => setCustomLeadEmail(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
              <input
                type="tel"
                placeholder="(503) 555-0100"
                value={customLeadPhone}
                onChange={(e) => setCustomLeadPhone(e.target.value)}
                className="bg-stone-900 border border-stone-700 rounded-xl px-3 py-1.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          )}
        </div>

        {/* Co-Branding Toggle */}
        <div className="flex items-center justify-between p-3 bg-stone-950/60 rounded-2xl border border-stone-800 text-xs">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <div>
              <span className="font-bold text-stone-200 block">
                {coBrandWithAgent ? 'Co-Branded Advisory Mode' : 'Solo Loan Officer Mode'}
              </span>
              <span className="text-[10px] text-stone-400">
                {coBrandWithAgent
                  ? 'Includes Mike Ford (LO) + Kanndice McLean (Realtor) in all draft signatures & card footers'
                  : 'Displays exclusively Mike Ford, Managing Loan Officer (NMLS #288455)'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCoBrandWithAgent(!coBrandWithAgent)}
            className={`px-3 py-1 rounded-xl font-bold text-xs border transition cursor-pointer ${
              coBrandWithAgent
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500/50'
                : 'bg-stone-800 text-stone-400 border-stone-700'
            }`}
          >
            {coBrandWithAgent ? 'Co-Branded (LO + Agent)' : 'Solo LO'}
          </button>
        </div>

        {/* Action Channels (Email Draft, SMS, Card Notes) */}
        <div className="space-y-3 pt-1">
          {/* Action 1: Native Mail Client Draft Link */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-amber-300 text-xs flex items-center gap-1.5">
                <Mail className="w-4 h-4" />
                <span>1-Click Native Email Draft (Preserves Work Signature)</span>
              </span>
              <span className="text-[10px] font-mono text-amber-400/80">
                Launches Apple Mail / Outlook
              </span>
            </div>
            <p className="text-[11px] text-stone-300 leading-relaxed">
              Clicking below executes a local system <code className="text-amber-300 font-mono">mailto:</code> trigger. Your default desktop/mobile email client opens immediately with pre-filled addresses, monthly numbers, and DPA breakdowns—<strong>with your official corporate work email signature already attached</strong>.
            </p>
            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>🚀 Launch Default System Email Client Draft</span>
            </a>
          </div>

          {/* Action 2: 1-Click SMS Draft */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Pre-Formatted SMS Text Draft</span>
              </span>
              <button
                type="button"
                onClick={handleCopySms}
                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-[10px] transition flex items-center gap-1 cursor-pointer"
              >
                {copiedSms ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSms ? 'Copied SMS Text!' : 'Copy SMS'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-400 font-mono bg-stone-900 p-2.5 rounded-xl border border-stone-800 leading-relaxed">
              {smsText}
            </p>
          </div>

          {/* Action 3: Batch Append Note to Selected Property Cards */}
          <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-stone-200 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>Batch Append Advisory Note to {selectedProperties.length} Selected Cards</span>
              </span>
              {notesAppendedFeedback && (
                <span className="text-emerald-400 font-bold text-[10px] flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Notes Applied to All Selected Cards!</span>
                </span>
              )}
            </div>
            <textarea
              value={customCardNote}
              onChange={(e) => setCustomCardNote(e.target.value)}
              rows={2}
              className="w-full bg-stone-900 border border-stone-700 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-500 font-sans"
              placeholder="Enter strategy note to batch-stamp onto these property cards..."
            />
            <button
              type="button"
              onClick={handleApplyNotesToCards}
              className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer border border-stone-700"
            >
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Apply / Append Note to All {selectedProperties.length} Property Cards</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-800">
          <span className="text-[10px] text-stone-500">
            Pushing to leads updates their installed Mobile PWA app feed automatically.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition cursor-pointer"
          >
            Done / Close
          </button>
        </div>
      </div>
    </div>
  );
};
