/**
 * @file CopySignatureButton.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * 1-Click Copy Signature Action & Dynamic Loan Officer State Signature Menu
 * Enables instant one-click copying of 'Mike Ford (Senior Loan Officer)' signatures
 * (both Full Professional and Compact Social versions) as well as dynamic signatures
 * for any peer loan officer selected in Oregon or any of the 50 US states,
 * guaranteeing 100% two-way sync attribution when posting to live web comment threads.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  ChevronDown,
  Sparkles,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  BookmarkCheck,
  Globe,
  Award,
  Zap,
  CheckCircle2,
  Share2
} from 'lucide-react';
import {
  PeerLoanOfficersService,
  PeerLoanOfficer,
  DEFAULT_PEER_LO_ROSTER
} from '../services/peerLoanOfficersService';
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
  /** Whether to show state picker in dropdown */
  showStatePicker?: boolean;
}

export const CopySignatureButton: React.FC<CopySignatureButtonProps> = ({
  currentState = 'OR',
  selectedLoanOfficer = null,
  threadId,
  variant = 'toolbar',
  className = '',
  onStateChange,
  showStatePicker = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeState, setActiveState] = useState<string>(currentState || 'OR');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  // Resolve current active loan officer
  const resolvedOfficer: PeerLoanOfficer = React.useMemo(() => {
    if (selectedLoanOfficer) return selectedLoanOfficer;
    
    // Check directory for current state
    const dir = PeerLoanOfficersService.getDirectory();
    if (dir[activeState]) {
      return dir[activeState];
    }
    
    // Check default roster
    if (DEFAULT_PEER_LO_ROSTER[activeState]) {
      return DEFAULT_PEER_LO_ROSTER[activeState];
    }

    // Default fallback to Mike Ford (OR)
    return {
      id: 'peer_or_mford',
      name: 'Mike Ford',
      nmlsNumber: '102938',
      company: 'Churchill Mortgage',
      title: 'Senior Mortgage Advisor / Team Lead',
      email: 'fordmj@gmail.com',
      phone: '(541) 729-2097',
      licensedStates: ['OR', 'WA'],
      defaultStates: ['OR'],
      applicationUrl: 'https://cfmtg.com/mford/',
      branchLocation: 'Eugene / Willamette Valley Branch, OR',
      localDpaProgram: 'Oregon Housing and Community Services (OHCS) Flex 97 Grant'
    };
  }, [selectedLoanOfficer, activeState]);

  const isMikeFord = resolvedOfficer.name.toLowerCase().includes('mike ford') || activeState === 'OR';

  // Format canonical title badge
  const officerTitle = isMikeFord ? 'Senior Loan Officer' : (resolvedOfficer.title || 'Senior Loan Officer');
  const officerNameAndTitle = `${resolvedOfficer.name} (${officerTitle})`;

  // Generate reference tag
  const refTag = threadId ? `[Ref: #${threadId}]` : `[Ref: #th_${activeState.toLowerCase()}_live_sweep]`;

  // Version 1: Full Professional Signature
  const fullSignature = React.useMemo(() => {
    if (isMikeFord) {
      return `— Mike Ford (Senior Loan Officer)\nSenior Mortgage Loan Officer | 26 Yrs Oregon Experience\nDirect / SMS: (541) 729-2097 | Email: fordmj@gmail.com\n${refTag}`;
    }
    const company = resolvedOfficer.company || 'Churchill Mortgage';
    const nmls = resolvedOfficer.nmlsNumber ? ` | NMLS #${resolvedOfficer.nmlsNumber}` : '';
    const stateName = getStateDetails(activeState)?.name || activeState;
    return `— ${resolvedOfficer.name} (${officerTitle})\n${company}${nmls} | ${stateName} Specialist\nDirect / SMS: ${resolvedOfficer.phone} | Email: ${resolvedOfficer.email}\n${refTag}`;
  }, [resolvedOfficer, isMikeFord, officerTitle, activeState, refTag]);

  // Version 2: Compact Social Signature
  const compactSignature = React.useMemo(() => {
    if (isMikeFord) {
      return `— Mike Ford (Senior Loan Officer) | Direct / SMS: (541) 729-2097`;
    }
    return `— ${resolvedOfficer.name} (${officerTitle}) | Direct / SMS: ${resolvedOfficer.phone}`;
  }, [resolvedOfficer, isMikeFord, officerTitle]);

  // Version 3: Single Line Canonical
  const singleLineSignature = `— ${officerNameAndTitle}`;

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
    handleCopy(compactSignature, 'primary-quick', `'${officerNameAndTitle}' Signature`);
  };

  const handleStateSelect = (st: string) => {
    setActiveState(st);
    if (onStateChange) {
      onStateChange(st);
    }
  };

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
            title={`1-Click: Copy '${officerNameAndTitle}' to clipboard for live web comments`}
          >
            {copiedType === 'primary-quick' ? (
              <Check className="w-4 h-4 text-emerald-400 font-bold" />
            ) : (
              <Copy className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition" />
            )}
            <span className="tracking-tight">
              {copiedType === 'primary-quick' ? 'Copied!' : 'Copy Signature'}
            </span>
            <span className="hidden xl:inline-block px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono border border-emerald-500/30 font-bold">
              {isMikeFord ? 'Mike Ford (Senior Loan Officer)' : `${resolvedOfficer.name} (${activeState})`}
            </span>
          </button>

          {/* Dropdown Chevron for Full / Compact / State selection */}
          <button
            type="button"
            onClick={() => setIsOpen(prev => !prev)}
            className="px-2 py-2.5 rounded-r-xl bg-slate-900/95 hover:bg-slate-800 text-slate-300 hover:text-white transition cursor-pointer border-l border-emerald-500/30 flex items-center justify-center"
            title="Choose Full or Compact signature versions, or select a peer loan officer for another state"
          >
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
            title={`1-Click: Copy '${officerNameAndTitle}' signature`}
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
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer border border-slate-700"
            title="Open signature options"
          >
            <ChevronDown className={`w-3.5 h-3.5 ${isOpen ? 'rotate-180 text-emerald-400' : ''}`} />
          </button>
        </div>
      )}

      {/* RENDER VARIANT: Badge (For Lead Cards) */}
      {variant === 'badge' && (
        <button
          type="button"
          onClick={handleQuickCopy}
          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30 transition cursor-pointer"
          title={`Copy signature for ${officerNameAndTitle}`}
        >
          {copiedType === 'primary-quick' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-emerald-400" />}
          <span>{copiedType === 'primary-quick' ? 'Copied!' : 'Copy Sig'}</span>
        </button>
      )}

      {/* FLOATING DROPDOWN MENU */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border-2 border-emerald-500/50 rounded-2xl shadow-2xl z-50 p-4 text-slate-100 overflow-hidden ring-1 ring-emerald-500/30 animate-in fade-in zoom-in-95 duration-150">
          
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/40">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-white leading-tight">1-Click Signature Copier</h4>
                <p className="text-[10px] text-emerald-400 font-mono">Ensures 2-Way Live Web Attribution</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono font-bold">
              {activeState} State
            </span>
          </div>

          {/* Active State / Loan Officer Selector */}
          {showStatePicker && (
            <div className="mb-3.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400" />
                  <span>Target State / Loan Officer:</span>
                </span>
                <span className="text-emerald-300 font-bold font-mono">
                  {isMikeFord ? 'Mike Ford (Default)' : resolvedOfficer.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <select
                  value={activeState}
                  onChange={(e) => handleStateSelect(e.target.value)}
                  aria-label="Select Target State for Loan Officer Signature"
                  className="flex-1 bg-slate-900 border border-slate-700 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-emerald-500 font-bold"
                >
                  <optgroup label="Primary Pacific Northwest States">
                    <option value="OR">Oregon (OR) — Mike Ford (Senior Loan Officer)</option>
                    <option value="WA">Washington (WA) — Sarah Jenkins</option>
                    <option value="ID">Idaho (ID) — Brad Callahan</option>
                    <option value="CA">California (CA) — Elena Vasquez</option>
                    <option value="NV">Nevada (NV) — Jason Mercer</option>
                    <option value="AZ">Arizona (AZ) — Mark Reynolds</option>
                    <option value="TX">Texas (TX) — Rachel Holloway</option>
                    <option value="CO">Colorado (CO) — Travis Dunbar</option>
                    <option value="FL">Florida (FL) — David Sterling</option>
                    <option value="UT">Utah (UT) — Spencer Nielsen</option>
                  </optgroup>
                  <optgroup label="All Other States">
                    {US_STATES.filter(st => !['OR','WA','ID','CA','NV','AZ','TX','CO','FL','UT'].includes(st.code)).map(st => (
                      <option key={st.code} value={st.code}>
                        {st.name} ({st.code})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>
          )}

          {/* SIGNATURE OPTION 1: Full Professional Format */}
          <div className="mb-3 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Version 1: Full Professional</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(fullSignature, 'sig-full', 'Full Professional Signature')}
                className="px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow"
              >
                {copiedType === 'sig-full' ? <Check className="w-3 h-3 text-white font-black" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'sig-full' ? 'Copied Full!' : 'Copy Full'}</span>
              </button>
            </div>
            
            <pre className="p-2 rounded-lg bg-slate-900 text-[10px] font-mono text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-800 select-all">
              {fullSignature}
            </pre>
            <p className="text-[9px] text-slate-400 italic">
              Best for housing forums, blogs, &amp; threads requiring contact info &amp; reference ID.
            </p>
          </div>

          {/* SIGNATURE OPTION 2: Compact Social Format */}
          <div className="mb-3 p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/40 transition space-y-2 group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <BookmarkCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Version 2: Compact Social</span>
              </span>
              <button
                type="button"
                onClick={() => handleCopy(compactSignature, 'sig-compact', 'Compact Social Signature')}
                className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow"
              >
                {copiedType === 'sig-compact' ? <Check className="w-3 h-3 text-white font-black" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'sig-compact' ? 'Copied Compact!' : 'Copy Compact'}</span>
              </button>
            </div>
            
            <pre className="p-2 rounded-lg bg-slate-900 text-[10px] font-mono text-indigo-200 whitespace-pre-wrap leading-relaxed border border-slate-800 select-all">
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
              onClick={() => handleCopy(singleLineSignature, 'sig-single', 'Single Line Signature')}
              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-semibold border border-slate-700 transition flex items-center gap-1 cursor-pointer shrink-0"
            >
              {copiedType === 'sig-single' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'sig-single' ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>Scrape Engine Compatible</span>
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white underline cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>
      )}
    </div>
  );
};
