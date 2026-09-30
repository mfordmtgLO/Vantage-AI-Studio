/**
 * @file CopySignatureButton.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * 1-Click Copy Signature Action & Lead Generation Agents Dropdown Menu
 * Enables instant one-click copying of 'Mike Ford (Senior Loan Officer)' signatures
 * as well as dynamic switching between signature templates for different Lead Generation Agents
 * (Intake Specialists, USDA Directors, Community Coordinators, and 50-State Loan Officers)
 * to ensure 100% two-way sync attribution when posting into live web comment threads.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  BookmarkCheck,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  Share2,
  Search,
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  LeadGenAgentsService,
  LeadGenAgent,
  DEFAULT_LEAD_GEN_AGENTS
} from '../services/leadGenAgentsService';
import { PeerLoanOfficer } from '../services/peerLoanOfficersService';
import { US_STATES, getStateDetails } from '../data/usStatesAndCounties';

export interface CopySignatureButtonProps {
  /** Current state code (e.g., 'OR', 'WA', 'CA', etc.) */
  currentState?: string;
  /** Explicit peer loan officer override if selected on a specific lead */
  selectedLoanOfficer?: PeerLoanOfficer | null;
  /** Optional thread ID to inject into the reference tag (defaults to live sweep ref) */
  threadId?: string;
  /** Visual display style */
  variant?: 'toolbar' | 'compact' | 'badge' | 'full-card';
  /** Additional styling classes */
  className?: string;
  /** Callback when state is switched inside the menu */
  onStateChange?: (stateCode: string) => void;
  /** Callback when agent is switched */
  onAgentChange?: (agent: LeadGenAgent) => void;
  /** Whether to show state picker in dropdown */
  showStatePicker?: boolean;
  /** Whether to show agent picker in dropdown (defaults to true) */
  showAgentPicker?: boolean;
}

export const CopySignatureButton: React.FC<CopySignatureButtonProps> = ({
  currentState = 'OR',
  selectedLoanOfficer = null,
  threadId,
  variant = 'toolbar',
  className = '',
  onStateChange,
  onAgentChange,
  showStatePicker = true,
  showAgentPicker = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeState, setActiveState] = useState<string>(currentState || 'OR');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [agentSearchQuery, setAgentSearchQuery] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => LeadGenAgentsService.getActiveAgentId());
  const menuRef = useRef<HTMLDivElement>(null);

  // Load all available agents (team lead + intake specialists + regional LOs + synced peers)
  const allAgents = useMemo(() => LeadGenAgentsService.getAllAgents(), [isOpen]);

  // Sync active state when prop changes
  useEffect(() => {
    if (currentState && currentState !== activeState) {
      setActiveState(currentState);
    }
  }, [currentState]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Resolve current active agent based on selection or fallback
  const resolvedAgent: LeadGenAgent = useMemo(() => {
    // If an explicit peer LO is passed in from a lead card override
    if (selectedLoanOfficer) {
      return {
        id: `peer_${selectedLoanOfficer.id}`,
        name: selectedLoanOfficer.name,
        title: selectedLoanOfficer.title || 'Senior Mortgage Specialist',
        roleCategory: 'state_loan_officer',
        roleBadge: `👤 ${selectedLoanOfficer.licensedStates?.[0] || 'Partner'} Loan Officer`,
        company: selectedLoanOfficer.company || 'Churchill Mortgage',
        nmlsNumber: selectedLoanOfficer.nmlsNumber,
        phone: selectedLoanOfficer.phone || '(541) 729-2097',
        email: selectedLoanOfficer.email || 'fordmj@gmail.com',
        primaryState: selectedLoanOfficer.licensedStates?.[0] || 'OR',
        licensedStates: selectedLoanOfficer.licensedStates || ['OR'],
        specialty: selectedLoanOfficer.localDpaProgram || 'State Down Payment Assistance',
        experience: selectedLoanOfficer.branchLocation || 'Churchill Mortgage Partner',
        applicationUrl: selectedLoanOfficer.applicationUrl
      };
    }

    // Otherwise get by selectedAgentId
    const found = allAgents.find(a => a.id === selectedAgentId);
    if (found) return found;

    // Default fallback
    return LeadGenAgentsService.getAgentById('agent_mike_ford');
  }, [selectedLoanOfficer, selectedAgentId, allAgents]);

  const isMikeFord = resolvedAgent.name.toLowerCase().includes('mike ford');
  const agentNameAndTitle = `${resolvedAgent.name} (${resolvedAgent.title})`;

  // Generate reference tag
  const refTag = threadId ? `[Ref: #${threadId}]` : `[Ref: #th_${resolvedAgent.primaryState.toLowerCase()}_live_sweep]`;

  // Version 1: Full Professional Signature
  const fullSignature = useMemo(() => {
    return LeadGenAgentsService.generateFullSignature(resolvedAgent, refTag);
  }, [resolvedAgent, refTag]);

  // Version 2: Compact Social Signature
  const compactSignature = useMemo(() => {
    return LeadGenAgentsService.generateCompactSignature(resolvedAgent);
  }, [resolvedAgent]);

  // Version 3: Single Line Canonical
  const singleLineSignature = useMemo(() => {
    return LeadGenAgentsService.generateSingleLineSignature(resolvedAgent);
  }, [resolvedAgent]);

  // Copy helper with animated toast
  const handleCopy = (text: string, type: string, label: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopiedType(type);
      setToastMessage(`✓ Copied ${label} to clipboard!`);
      setTimeout(() => setCopiedType(null), 3000);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  // 1-Click Primary Quick Copy
  const handleQuickCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Copy compact signature by default on quick 1-click
    handleCopy(compactSignature, 'primary-quick', `'${agentNameAndTitle}' Signature`);
  };

  // Switch active agent
  const handleAgentSelect = (agentId: string) => {
    setSelectedAgentId(agentId);
    LeadGenAgentsService.setActiveAgentId(agentId);
    const agent = allAgents.find(a => a.id === agentId);
    if (agent) {
      setActiveState(agent.primaryState);
      if (onAgentChange) onAgentChange(agent);
      if (onStateChange) onStateChange(agent.primaryState);
    }
  };

  // Switch target state (updates to the best agent for that state)
  const handleStateSelect = (st: string) => {
    setActiveState(st);
    const matchingAgent = LeadGenAgentsService.getAgentForState(st);
    if (matchingAgent) {
      setSelectedAgentId(matchingAgent.id);
      LeadGenAgentsService.setActiveAgentId(matchingAgent.id);
      if (onAgentChange) onAgentChange(matchingAgent);
    }
    if (onStateChange) onStateChange(st);
  };

  // Filter agents for search
  const filteredAgents = useMemo(() => {
    if (!agentSearchQuery.trim()) return allAgents;
    const q = agentSearchQuery.toLowerCase();
    return allAgents.filter(a => 
      a.name.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.specialty.toLowerCase().includes(q) ||
      a.primaryState.toLowerCase().includes(q) ||
      a.roleBadge.toLowerCase().includes(q)
    );
  }, [allAgents, agentSearchQuery]);

  return (
    <div className={`relative inline-block ${className}`} ref={menuRef}>
      {/* Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-950 border-2 border-emerald-400 text-emerald-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="w-7 h-7 rounded-xl bg-emerald-500/30 flex items-center justify-center text-emerald-300 shrink-0">
            <Check className="w-4 h-4 text-emerald-300 font-black" />
          </div>
          <div>
            <p className="text-xs font-black text-white">{toastMessage}</p>
            <p className="text-[10px] text-emerald-300/90 font-medium">
              Pasting in live comment sections ensures 2-way sync attribution.
            </p>
          </div>
        </div>
      )}

      {/* RENDER VARIANT: Toolbar Button (Default in Lead Discovery Studio & Dashboards) */}
      {variant === 'toolbar' && (
        <div className="inline-flex items-stretch rounded-xl shadow-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 p-[1px] hover:from-emerald-500 hover:to-indigo-500 transition">
          {/* Main 1-Click Copy Signature Button */}
          <button
            type="button"
            onClick={handleQuickCopy}
            className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-l-xl bg-slate-900/95 hover:bg-slate-900 text-white font-extrabold text-xs transition cursor-pointer group"
            title={`1-Click: Copy '${agentNameAndTitle}' to clipboard for live web comments`}
          >
            {copiedType === 'primary-quick' ? (
              <Check className="w-4 h-4 text-emerald-400 font-bold" />
            ) : (
              <Copy className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            )}
            <span className="tracking-tight">
              {copiedType === 'primary-quick' ? 'Copied!' : 'Copy Signature'}
            </span>
            <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 font-bold max-w-[200px] truncate">
              {isMikeFord ? 'Mike Ford (Senior Loan Officer)' : `${resolvedAgent.name} (${resolvedAgent.title})`}
            </span>
          </button>

          {/* Dropdown Chevron for Lead Gen Agent & State Switcher */}
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="px-2.5 py-2.5 rounded-r-xl bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer border-l border-emerald-500/30 flex items-center justify-center gap-1"
            title="Switch Lead Generation Agent or state signature templates"
          >
            <Users className="w-3.5 h-3.5 text-indigo-300" />
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
          </button>
        </div>
      )}

      {/* RENDER VARIANT: Compact (In Modal Address Bars & Action Rows) */}
      {variant === 'compact' && (
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={handleQuickCopy}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-500/40 text-xs font-bold transition cursor-pointer shadow-sm"
            title={`1-Click: Copy '${agentNameAndTitle}' signature`}
          >
            {copiedType === 'primary-quick' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400 font-bold" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{copiedType === 'primary-quick' ? 'Copied!' : 'Copy Signature'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700 flex items-center gap-0.5"
            title="Switch Lead Generation Agent or format"
          >
            <Users className="w-3 h-3 text-indigo-300" />
            <ChevronDown className={`w-3 h-3 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
          </button>
        </div>
      )}

      {/* RENDER VARIANT: Badge (For Lead Cards) */}
      {variant === 'badge' && (
        <button
          type="button"
          onClick={handleQuickCopy}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition cursor-pointer"
          title={`Copy signature for ${agentNameAndTitle}`}
        >
          {copiedType === 'primary-quick' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400" />}
          <span>{copiedType === 'primary-quick' ? 'Copied!' : 'Copy Sig'}</span>
        </button>
      )}

      {/* FLOATING DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 sm:w-[420px] bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl z-50 p-4 text-slate-100 overflow-hidden ring-1 ring-emerald-500/30 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-md">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white leading-tight">Lead Gen Agents &amp; Signatures</h4>
                <p className="text-[10px] text-emerald-400 font-mono">1-Click Live Web Attribution Signatures</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
              {resolvedAgent.primaryState} • {resolvedAgent.roleBadge}
            </span>
          </div>

          {/* Scrollable controls container */}
          <div className="overflow-y-auto space-y-3.5 pr-1 flex-1">

            {/* SECTION 1: DROPDOWN SELECTOR FOR LEAD GENERATION AGENTS */}
            {showAgentPicker && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-indigo-950/70 via-slate-950 to-slate-950 border border-indigo-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Select Lead Generation Agent / Team Member:</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    Active: {resolvedAgent.name}
                  </span>
                </div>

                {/* Primary Agent Dropdown Selector */}
                <select
                  value={resolvedAgent.id}
                  onChange={(e) => handleAgentSelect(e.target.value)}
                  aria-label="Select Lead Generation Agent"
                  className="w-full bg-slate-900 border-2 border-indigo-500/60 text-white text-xs rounded-xl px-3 py-2 font-bold focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
                >
                  <optgroup label="👑 Master Team Lead">
                    <option value="agent_mike_ford">
                      ⭐ Mike Ford — Senior Loan Officer (Branch Team Lead, OR/WA)
                    </option>
                  </optgroup>

                  <optgroup label="🎯 Dedicated Lead Generation & Outreach Specialists">
                    <option value="agent_jessica_vance">
                      🎯 Jessica Vance — Lead Generation Specialist (Buyer Intake, OR)
                    </option>
                    <option value="agent_marcus_brody">
                      🌾 Marcus Brody — Rural Housing Outreach Director (USDA Zero-Down, OR/ID)
                    </option>
                    <option value="agent_alex_rivera">
                      💬 Alex Rivera — Homebuyer Concierge Specialist (Social/Forums, OR)
                    </option>
                  </optgroup>

                  <optgroup label="🌲 Regional State Loan Officers">
                    <option value="agent_david_miller">🌲 David Miller — Senior Mortgage Specialist (Portland/Bend OR)</option>
                    <option value="agent_sarah_jenkins">🌲 Sarah Jenkins — Senior Mortgage Specialist (Washington WA)</option>
                    <option value="agent_brad_callahan">🥔 Brad Callahan — Senior VP of Lending (Idaho ID)</option>
                    <option value="agent_elena_vasquez">☀️ Elena Vasquez — Executive Loan Consultant (California CA)</option>
                    <option value="agent_jason_mercer">🎰 Jason Mercer — Senior Loan Officer (Nevada NV)</option>
                    <option value="agent_rachel_holloway">🤠 Rachel Holloway — Senior Mortgage Director (Texas TX)</option>
                    <option value="agent_travis_dunbar">🏔️ Travis Dunbar — Senior Loan Specialist (Colorado CO)</option>
                    <option value="agent_david_sterling">🌴 David Sterling — Senior Lending Specialist (Florida FL)</option>
                    <option value="agent_mark_reynolds">🌵 Mark Reynolds — Area Lending Manager (Arizona AZ)</option>
                    <option value="agent_spencer_nielsen">⛷️ Spencer Nielsen — Senior Loan Officer (Utah UT)</option>
                  </optgroup>

                  {allAgents.filter(a => !DEFAULT_LEAD_GEN_AGENTS.some(d => d.id === a.id)).length > 0 && (
                    <optgroup label="👥 Synced Colleague Roster">
                      {allAgents
                        .filter(a => !DEFAULT_LEAD_GEN_AGENTS.some(d => d.id === a.id))
                        .map(a => (
                          <option key={a.id} value={a.id}>
                            👤 {a.name} — {a.title} ({a.primaryState})
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>

                {/* Selected Agent Quick Metadata Pill */}
                <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white">{resolvedAgent.name}</span>
                    <span className="text-slate-400">({resolvedAgent.title})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px] text-indigo-300">
                    <span>📞 {resolvedAgent.phone}</span>
                    <span>✉️ {resolvedAgent.email}</span>
                  </div>
                </div>
              </div>
            )}

            {/* SECTION 2: FAST STATE FILTER (OPTIONAL SHORTCUT) */}
            {showStatePicker && (
              <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2 text-xs">
                <span className="text-slate-400 font-medium flex items-center gap-1 shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>State Market:</span>
                </span>
                <select
                  value={activeState}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  aria-label="Select Target State for Loan Officer Signature"
                  className="bg-slate-900 border border-slate-700 text-emerald-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-emerald-500 font-bold cursor-pointer"
                >
                  <option value="OR">Oregon (OR)</option>
                  <option value="WA">Washington (WA)</option>
                  <option value="ID">Idaho (ID)</option>
                  <option value="CA">California (CA)</option>
                  <option value="NV">Nevada (NV)</option>
                  <option value="AZ">Arizona (AZ)</option>
                  <option value="TX">Texas (TX)</option>
                  <option value="CO">Colorado (CO)</option>
                  <option value="FL">Florida (FL)</option>
                  <option value="UT">Utah (UT)</option>
                  {US_STATES.filter(st => !['OR','WA','ID','CA','NV','AZ','TX','CO','FL','UT'].includes(st.code)).map(st => (
                    <option key={st.code} value={st.code}>
                      {st.name} ({st.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* SIGNATURE OPTION 1: Full Professional Format */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition space-y-2 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Version 1: Full Professional ({resolvedAgent.name})</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(fullSignature, 'sig-full', `Full Professional Signature (${resolvedAgent.name})`)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow"
                >
                  {copiedType === 'sig-full' ? <Check className="w-3 h-3 text-white font-black" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'sig-full' ? 'Copied Full!' : 'Copy Full'}</span>
                </button>
              </div>
              
              <pre className="p-2.5 rounded-lg bg-slate-900 text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800 select-all">
                {fullSignature}
              </pre>
              <p className="text-[9px] text-slate-400 italic">
                Best for housing forums, blogs, &amp; external threads requiring credentials &amp; thread Ref.
              </p>
            </div>

            {/* SIGNATURE OPTION 2: Compact Social Format */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition space-y-2 group">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Version 2: Compact Social ({resolvedAgent.name})</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(compactSignature, 'sig-compact', `Compact Social Signature (${resolvedAgent.name})`)}
                  className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow"
                >
                  {copiedType === 'sig-compact' ? <Check className="w-3 h-3 text-white font-black" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedType === 'sig-compact' ? 'Copied Compact!' : 'Copy Compact'}</span>
                </button>
              </div>
              
              <pre className="p-2.5 rounded-lg bg-slate-900 text-[10px] font-mono text-indigo-200 whitespace-pre-wrap leading-relaxed border border-slate-800 select-all">
                {compactSignature}
              </pre>
              <p className="text-[9px] text-slate-400 italic">
                Ideal for Reddit r/Bend, r/Portland, Discord, and short chat boards.
              </p>
            </div>

            {/* SIGNATURE OPTION 3: Canonical Single Line */}
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-2">
              <div className="overflow-hidden">
                <span className="text-[10px] text-slate-400 block font-medium">Canonical Single Line:</span>
                <code className="text-xs font-mono font-bold text-emerald-300 truncate block">
                  {singleLineSignature}
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(singleLineSignature, 'sig-single', `Single Line Signature (${resolvedAgent.name})`)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0"
              >
                {copiedType === 'sig-single' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'sig-single' ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Scrape Engine Two-Way Sync Ready</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white underline cursor-pointer font-bold"
            >
              Close
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
