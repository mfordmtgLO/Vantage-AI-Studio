/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • LISTING NOTES PROFESSIONAL PROFILE CARDS FOOTER
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Renders verified Loan Officer profile card (Solo Mode) or LO + Agent
 * co-branded profile cards (Co-Branded Pair Mode) at the bottom of the
 * notes section for every property listing card across desktop and mobile
 * "Add to Home Screen" installations.
 * ============================================================================
 */

import React, { useState } from 'react';
import {
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Award,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  MapPin,
  HelpCircle
} from 'lucide-react';
import ProfileCardSyncService from '../services/profileCardSyncService';

interface ListingNotesProfileFooterProps {
  assignedLoanOfficerName?: string;
  assignedAgentName?: string;
  hasPairedAgent?: boolean;
  propertyAddress?: string;
  compact?: boolean;
  onRequestTour?: () => void;
  onAskQuestion?: (topic: string) => void;
}

export const ListingNotesProfileFooter: React.FC<ListingNotesProfileFooterProps> = ({
  assignedLoanOfficerName = 'Mike Ford',
  assignedAgentName,
  hasPairedAgent = false,
  propertyAddress,
  compact = false,
  onRequestTour,
  onAskQuestion
}) => {
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const loProfiles = typeof window !== 'undefined' ? ProfileCardSyncService.getLoanOfficers() : [];
  const agentProfiles = typeof window !== 'undefined' ? ProfileCardSyncService.getAgents() : [];

  const lo = loProfiles.find(p => p.name.toLowerCase() === assignedLoanOfficerName.toLowerCase()) || loProfiles[0] || {
    id: 'lo-mike-ford',
    name: assignedLoanOfficerName || 'Mike Ford',
    nmlsNumber: '288455',
    company: 'Vantage AI Mortgage & Loan Services',
    title: 'Managing Loan Officer & Principal Architect',
    email: 'fordmj@gmail.com',
    phone: '+1 (503) 555-0192',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80',
    specialties: ['USDA 100% Rural', 'Lakeview National DPA', 'OHCS Flex FirstHome', 'CRA Grants'],
    primaryState: 'OR',
    rating: 5.0
  };

  const agent = assignedAgentName
    ? (agentProfiles.find(a => a.name.toLowerCase() === assignedAgentName.toLowerCase()) || agentProfiles[0] || {
        id: 'agent-kanndice-mclean',
        name: assignedAgentName || 'Kanndice McLean',
        licenseNumber: 'OR-201889423',
        brokerage: 'Cascade Premier Realty & Associates',
        title: 'Principal Broker & Lead Buyer Strategist',
        email: 'kanndice@cascadepremier.com',
        phone: '+1 (503) 555-0188',
        photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
        targetMarkets: ['Portland Metro', 'Scappoose', 'Columbia County', 'Beaverton'],
        primaryState: 'OR'
      })
    : null;

  const triggerFeedback = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  return (
    <div className="mt-3 pt-3 border-t border-stone-800/90 space-y-2">
      {/* Header bar indicating paired vs solo */}
      <div className="flex items-center justify-between gap-2 flex-wrap text-[10px]">
        <div className="flex items-center gap-1.5 font-bold">
          {hasPairedAgent && agent ? (
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Co-Branded Advisory Pair ({lo.name} & {agent.name})</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-amber-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Solo Loan Officer Desk ({lo.name} • 0 Agent Relay)</span>
            </span>
          )}
        </div>
        <span className="text-stone-400 font-mono text-[9px]">
          Direct 2-Way Notes & Response
        </span>
      </div>

      {actionFeedback && (
        <div className="p-2 rounded-xl bg-emerald-950/90 border border-emerald-500 text-emerald-200 text-[11px] font-bold flex items-center gap-1.5 animate-in fade-in">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Profile Cards Layout: Dual Grid if Paired, Single Card if Solo */}
      <div className={`grid gap-2 ${hasPairedAgent && agent ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Loan Officer Profile Card */}
        <div className="bg-stone-950/90 p-2.5 rounded-xl border border-stone-800 shadow-sm flex flex-col justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <img
              src={lo.photoUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80'}
              alt={lo.name}
              className="w-11 h-11 rounded-xl object-cover border border-amber-500/40 shadow-xs shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h5 className="text-xs font-bold text-white truncate">{lo.name}</h5>
                <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  NMLS #{lo.nmlsNumber}
                </span>
              </div>
              <p className="text-[10px] text-stone-300 truncate">{lo.title || 'Managing Loan Officer'}</p>
              <p className="text-[9px] text-stone-400 truncate">{lo.company || 'Vantage AI Mortgage & Loan Services'}</p>
            </div>
          </div>

          {/* Quick Specialties */}
          {!compact && (
            <div className="flex flex-wrap gap-1 text-[8px] font-mono">
              <span className="px-1.5 py-0.5 rounded bg-stone-900 text-emerald-300 border border-stone-800">
                USDA 100% Rural
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-900 text-amber-300 border border-stone-800">
                Lakeview 100% DPA
              </span>
              <span className="px-1.5 py-0.5 rounded bg-stone-900 text-teal-300 border border-stone-800">
                OHCS $15.4k
              </span>
            </div>
          )}

          {/* Action Buttons for LO */}
          <div className="flex items-center gap-1.5 pt-1 border-t border-stone-900 flex-wrap">
            <a
              href={`tel:${lo.phone.replace(/[^0-9+]/g, '')}`}
              onClick={() => triggerFeedback(`Calling ${lo.name}...`)}
              className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition text-[10px] font-bold flex items-center gap-1"
              title={`Call ${lo.name} at ${lo.phone}`}
            >
              <Phone className="w-3 h-3 text-amber-400" />
              <span>Call LO</span>
            </a>

            <a
              href={`sms:${lo.phone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(`Hi ${lo.name}, I'm reviewing ${propertyAddress || 'curated listings'} in the GeoMap app and have a question regarding down payment financing.`)}`}
              onClick={() => triggerFeedback(`Opening SMS to ${lo.name}...`)}
              className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition text-[10px] font-bold flex items-center gap-1"
              title={`Text ${lo.name} at ${lo.phone}`}
            >
              <MessageSquare className="w-3 h-3 text-emerald-400" />
              <span>Text LO</span>
            </a>

            <a
              href={`mailto:${lo.email}?subject=${encodeURIComponent(`Mortgage Inquiry: ${propertyAddress || 'Curated Listing'}`)}&body=${encodeURIComponent(`Hi ${lo.name},\n\nI am reviewing ${propertyAddress || 'this property'} in your GeoMap portal and would like to ask a prequalification question.`)}`}
              onClick={() => triggerFeedback(`Opening email to ${lo.name}...`)}
              className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition text-[10px] font-bold flex items-center gap-1"
              title={`Email ${lo.email}`}
            >
              <Mail className="w-3 h-3 text-indigo-400" />
              <span>Email</span>
            </a>

            {onAskQuestion && (
              <button
                type="button"
                onClick={() => onAskQuestion('Prequalification Question')}
                className="px-2 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 transition text-[10px] font-bold flex items-center gap-1 cursor-pointer ml-auto"
                title="Ask a prequalification or payment scenario question"
              >
                <HelpCircle className="w-3 h-3 text-amber-400" />
                <span>Ask Prequal</span>
              </button>
            )}
          </div>
        </div>

        {/* Agent Profile Card (if Co-Branded Pair) */}
        {hasPairedAgent && agent && (
          <div className="bg-stone-950/90 p-2.5 rounded-xl border border-stone-800 shadow-sm flex flex-col justify-between gap-2">
            <div className="flex items-start gap-2.5">
              <img
                src={agent.photoUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'}
                alt={agent.name}
                className="w-11 h-11 rounded-xl object-cover border border-emerald-500/40 shadow-xs shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h5 className="text-xs font-bold text-white truncate">{agent.name}</h5>
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    License {agent.licenseNumber}
                  </span>
                </div>
                <p className="text-[10px] text-stone-300 truncate">{agent.title || 'Principal Realtor®'}</p>
                <p className="text-[9px] text-stone-400 truncate">{agent.brokerage || 'Cascade Premier Realty & Associates'}</p>
              </div>
            </div>

            {/* Target Markets */}
            {!compact && agent.targetMarkets && (
              <div className="flex flex-wrap gap-1 text-[8px] font-mono">
                {agent.targetMarkets.slice(0, 3).map((m, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 rounded bg-stone-900 text-stone-300 border border-stone-800">
                    {m}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons for Agent */}
            <div className="flex items-center gap-1.5 pt-1 border-t border-stone-900 flex-wrap">
              <a
                href={`tel:${agent.phone.replace(/[^0-9+]/g, '')}`}
                onClick={() => triggerFeedback(`Calling ${agent.name}...`)}
                className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition text-[10px] font-bold flex items-center gap-1"
                title={`Call ${agent.name} at ${agent.phone}`}
              >
                <Phone className="w-3 h-3 text-emerald-400" />
                <span>Call Agent</span>
              </a>

              <a
                href={`sms:${agent.phone.replace(/[^0-9+]/g, '')}?body=${encodeURIComponent(`Hi ${agent.name}, I'm reviewing ${propertyAddress || 'this property'} in your GeoMap app and would like to request a private tour/showing.`)}`}
                onClick={() => triggerFeedback(`Opening SMS to ${agent.name}...`)}
                className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition text-[10px] font-bold flex items-center gap-1"
                title={`Text ${agent.name} at ${agent.phone}`}
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>Text</span>
              </a>

              <a
                href={`mailto:${agent.email}?subject=${encodeURIComponent(`Tour Request: ${propertyAddress || 'Curated Listing'}`)}&body=${encodeURIComponent(`Hi ${agent.name},\n\nI'm reviewing ${propertyAddress || 'this property'} in your GeoMap portal and would like to schedule a showing/tour.`)}`}
                onClick={() => triggerFeedback(`Opening email to ${agent.name}...`)}
                className="px-2 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 transition text-[10px] font-bold flex items-center gap-1"
                title={`Email ${agent.email}`}
              >
                <Mail className="w-3 h-3 text-indigo-400" />
                <span>Email</span>
              </a>

              {onRequestTour && (
                <button
                  type="button"
                  onClick={onRequestTour}
                  className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition text-[10px] font-bold flex items-center gap-1 cursor-pointer ml-auto shadow-xs"
                  title="Request a private in-person or video tour"
                >
                  <Calendar className="w-3 h-3" />
                  <span>Request Tour</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <p className="text-[9px] text-stone-400 italic text-center pt-0.5">
        Responses to notes are synchronized in real time with our live originations desk.
      </p>
    </div>
  );
};
