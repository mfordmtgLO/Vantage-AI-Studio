/**
 * @file TwoWaySyncIntegrationGuideModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Two-Way Comment Sync & Signature Attribution Integration Guide Modal
 * Explains how bi-directional synchronization works between live web comment sections
 * (Reddit, real estate blogs, chat boards, forums) and the Vantage AI Dashboard,
 * with explicit instructions on signature formatting as 'Mike Ford (Senior Loan Officer)'.
 */

import React, { useState } from 'react';
import {
  Globe,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Zap,
  ArrowRight,
  Sparkles,
  Smartphone,
  Mail,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Code2,
  Terminal,
  BookmarkCheck,
  Clock,
  Layers,
  HelpCircle,
  MapPin,
  User,
  Users,
  X
} from 'lucide-react';
import {
  PeerLoanOfficersService,
  PeerLoanOfficer,
  DEFAULT_PEER_LO_ROSTER
} from '../services/peerLoanOfficersService';
import {
  LeadGenAgentsService,
  LeadGenAgent,
  DEFAULT_LEAD_GEN_AGENTS
} from '../services/leadGenAgentsService';
import { US_STATES, getStateDetails } from '../data/usStatesAndCounties';

interface TwoWaySyncIntegrationGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  sampleThreadId?: string;
}

export const TwoWaySyncIntegrationGuideModal: React.FC<TwoWaySyncIntegrationGuideModalProps> = ({
  isOpen,
  onClose,
  sampleThreadId = 'th_bend_buyer_92'
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'how-it-works' | 'signature-rules' | 'validator'>('how-it-works');
  const [selectedAgentId, setSelectedAgentId] = useState<string>(() => LeadGenAgentsService.getActiveAgentId());
  
  const allAgents = React.useMemo(() => LeadGenAgentsService.getAllAgents(), [isOpen]);
  const currentAgent: LeadGenAgent = React.useMemo(() => {
    return allAgents.find(a => a.id === selectedAgentId) || LeadGenAgentsService.getAgentById('agent_mike_ford');
  }, [allAgents, selectedAgentId]);

  // Interactive Signature Playground state
  const [testSignatureInput, setTestSignatureInput] = useState<string>(
    `Hi! As an Oregon lender with 26 years experience, you can definitely combine the OHCS Flex grant with USDA zero down.\n\n— Mike Ford (Senior Loan Officer)\nDirect / SMS: (541) 729-2097 | fordmj@gmail.com\n[Ref: #${sampleThreadId}]`
  );

  const isMikeFord = currentAgent.name.toLowerCase().includes('mike ford');
  const canonicalSignatureLine = `— ${currentAgent.name} (${currentAgent.title})`;

  const fullSigTemplate = React.useMemo(() => {
    return LeadGenAgentsService.generateFullSignature(currentAgent, `[Ref: #${sampleThreadId}]`);
  }, [currentAgent, sampleThreadId]);

  const compactSigTemplate = React.useMemo(() => {
    return LeadGenAgentsService.generateCompactSignature(currentAgent);
  }, [currentAgent]);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Signature validation logic matching the scrape engine rules
  const hasExactOfficerName = new RegExp(currentAgent.name.replace(/[^a-zA-Z]/g, '\\s*'), 'i').test(testSignatureInput) || /mike\s+ford/i.test(testSignatureInput);
  const hasOfficerTitle = /\(?senior\s+loan\s+officer\)?/i.test(testSignatureInput) || /loan\s+officer/i.test(testSignatureInput) || new RegExp(currentAgent.title.replace(/[^a-zA-Z]/g, '\\s*'), 'i').test(testSignatureInput);
  const hasThreadRef = /\[?ref:\s*#?th_[a-z0-9_]+\]?/i.test(testSignatureInput);
  const hasPhoneOrEmail = /541|729|2097|fordmj@gmail\.com/i.test(testSignatureInput) || (currentAgent.phone && testSignatureInput.includes(currentAgent.phone.replace(/[^0-9]/g, '').slice(-4)));
  
  const isSignatureValid = hasExactOfficerName && hasOfficerTitle;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-3xl bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh] text-slate-100 ring-1 ring-emerald-500/30">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950/80 to-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-indigo-950/80 shrink-0">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-extrabold border border-emerald-500/40">
                  SYSTEM INTEGRATION GUIDE
                </span>
                <span className="text-[11px] text-indigo-300 font-mono">
                  v2.5 • Bi-Directional Web Sync
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white tracking-tight mt-0.5">
                Two-Way Web Comment Sync &amp; Signature Attribution
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer shrink-0"
            title="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 pt-3 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`px-4 py-2 font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'how-it-works'
                ? 'text-emerald-400 border-emerald-400 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>1. How Two-Way Sync Works</span>
          </button>

          <button
            onClick={() => setActiveTab('signature-rules')}
            className={`px-4 py-2 font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'signature-rules'
                ? 'text-indigo-400 border-indigo-400 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>2. Signature Format &amp; Attribution Rules</span>
          </button>

          <button
            onClick={() => setActiveTab('validator')}
            className={`px-4 py-2 font-bold rounded-t-xl transition flex items-center gap-2 border-b-2 cursor-pointer ${
              activeTab === 'validator'
                ? 'text-cyan-400 border-cyan-400 bg-slate-900'
                : 'text-slate-400 hover:text-slate-200 border-transparent'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Live Signature Validator</span>
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* TAB 1: HOW TWO-WAY SYNC WORKS */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Executive Summary Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-indigo-950/70 border border-indigo-500/40 space-y-2">
                <div className="flex items-center gap-2 text-indigo-300 font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>The Autonomous Bi-Directional Sync Engine</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When you engage with a prospect whose post was scraped from Reddit, BiggerPockets, or local housing boards, Vantage AI maintains a <strong>persistent conversation anchor</strong>. Whether you post in the dashboard or externally on the actual website, your replies and incoming borrower responses stay synchronized in your CRM.
                </p>
              </div>

              {/* 4-Step Diagram */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Bi-Directional Synchronization Workflow
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {/* Step 1 */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-black text-xs flex items-center justify-center border border-emerald-500/30">
                        1
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Circadian Daily Sweep</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">Lead Discovery &amp; Anchor Creation</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      At 10:20 PM PST, the cron engine sweeps monitored forums. Each qualifying post receives a unique <code className="text-indigo-300 font-mono">MessageThreadID</code> and <code className="text-emerald-300 font-mono">TargetCommentID</code>, pinning the exact inquiry to Mike Ford&apos;s workspace.
                    </p>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 font-mono font-black text-xs flex items-center justify-center border border-indigo-500/30">
                        2
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Outbound Engagement</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">Posting Your Reply Online</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      You post your expert advice either directly via the in-app viewer (100% automated) or on the live online site using the <strong className="text-slate-200">Mike Ford (Senior Loan Officer)</strong> signature format.
                    </p>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 font-mono font-black text-xs flex items-center justify-center border border-purple-500/30">
                        3
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Pattern Recognition</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">Scrape Engine Signature Attribution</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      On subsequent passes, the crawler parses thread comments. When it detects your signature, it flags the thread as <strong className="text-indigo-300">Outreach Initiated by Loan Officer</strong> and attributes the comment history to your CRM.
                    </p>
                  </div>

                  {/* Step 4 */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-mono font-black text-xs flex items-center justify-center border border-amber-500/30">
                        4
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">Inbound Response Alert</span>
                    </div>
                    <h5 className="text-xs font-bold text-white">Borrower Reply &amp; Priority Push Alert</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      When the prospect replies to your comment online, the sync engine promotes the lead to <strong className="text-emerald-400">💬 Active Two-Way</strong>, sends an iPhone push alert, and updates the <code className="text-slate-300 font-mono">SMS / Conversation History</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Two Posting Pathways Comparison */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span>Choose Your Preferred Posting Pathway</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px] uppercase">
                      Pathway A: In-App Viewer Modal (Recommended)
                    </span>
                    <h5 className="font-bold text-white text-xs">Zero Manual Configuration</h5>
                    <p className="text-slate-400 text-[11px]">
                      Click <strong className="text-white">↗ (External Link)</strong> on the lead card &rarr; scroll to bottom &rarr; type comment &rarr; Click <strong className="text-emerald-400">Post Comment</strong>. Identity is already validated and written to Firestore instantly.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900 border border-indigo-500/30 space-y-1.5">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-[10px] uppercase">
                      Pathway B: Live External Web Browser
                    </span>
                    <h5 className="font-bold text-white text-xs">External Browser / Reddit App</h5>
                    <p className="text-slate-400 text-[11px]">
                      Open live URL in Safari or Chrome &rarr; paste your answer with the canonical signature <strong className="text-white">&ldquo;— Mike Ford (Senior Loan Officer)&rdquo;</strong> &rarr; crawler recognizes the signature and links it back to your dashboard.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SIGNATURE RULES & TEMPLATES */}
          {activeTab === 'signature-rules' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Lead Generation Agent Selector Dropdown */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-950 to-indigo-950/80 border border-indigo-500/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-indigo-300 uppercase font-black tracking-wider block">
                      Active Lead Generation Agent:
                    </span>
                    <span className="text-xs font-black text-white">
                      {currentAgent.name} ({currentAgent.title})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="guide-agent-select" className="text-xs text-slate-300 font-bold whitespace-nowrap">Switch Agent:</label>
                  <select
                    id="guide-agent-select"
                    value={selectedAgentId}
                    onChange={(e) => {
                      setSelectedAgentId(e.target.value);
                      LeadGenAgentsService.setActiveAgentId(e.target.value);
                    }}
                    className="bg-slate-900 border border-indigo-500/50 text-indigo-200 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-400 cursor-pointer shadow-inner"
                  >
                    <optgroup label="👑 Master Team Lead">
                      <option value="agent_mike_ford">
                        ⭐ Mike Ford — Senior Loan Officer (Branch Lead, OR)
                      </option>
                    </optgroup>
                    <optgroup label="🎯 Dedicated Lead Generation Specialists">
                      <option value="agent_jessica_vance">🎯 Jessica Vance — Lead Generation Specialist (Buyer Intake, OR)</option>
                      <option value="agent_marcus_brody">🌾 Marcus Brody — Rural Housing Outreach Director (USDA Zero-Down, OR)</option>
                      <option value="agent_alex_rivera">💬 Alex Rivera — Homebuyer Concierge Specialist (Forums, OR)</option>
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
                  </select>
                </div>
              </div>

              {/* Highlight Rule Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-indigo-950/80 border-2 border-emerald-500/60 shadow-xl space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h4 className="text-sm font-black text-white tracking-tight">
                    Canonical Attribution Signature Standard
                  </h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The automated ingestion crawler scans comment bodies for your exact identity token. To guarantee 100% attribution accuracy, always format your closing signature line with:
                </p>
                <div className="p-3 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold flex items-center justify-between gap-3">
                  <span>{canonicalSignatureLine}</span>
                  <button
                    onClick={() => handleCopy(canonicalSignatureLine, 'sig-minimal')}
                    className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 transition text-[11px] flex items-center gap-1 font-sans cursor-pointer"
                  >
                    {copiedKey === 'sig-minimal' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'sig-minimal' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Ready-to-Use Signature Templates */}
              <div className="space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Copy-Ready Signature Templates for Live Online Posting ({currentAgent.name})
                </h4>

                {/* Template 1: Full Professional Format */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-emerald-400" />
                      <span>Template 1: Full Professional ({currentAgent.roleBadge})</span>
                    </span>
                    <button
                      onClick={() => handleCopy(fullSigTemplate, 'sig-full')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'sig-full' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sig-full' ? 'Copied Full Sig' : 'Copy Full Signature'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
{fullSigTemplate}
                  </pre>
                  <p className="text-[11px] text-slate-400 italic">
                    Includes contact numbers for direct phone / SMS routing and the unique Ref tag for automated thread binding.
                  </p>
                </div>

                {/* Template 2: Compact Social Format */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <BookmarkCheck className="w-4 h-4 text-indigo-400" />
                      <span>Template 2: Compact Social ({currentAgent.name})</span>
                    </span>
                    <button
                      onClick={() => handleCopy(compactSigTemplate, 'sig-compact')}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5 cursor-pointer"
                    >
                      {copiedKey === 'sig-compact' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sig-compact' ? 'Copied Compact Sig' : 'Copy Compact Signature'}</span>
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-slate-900/90 border border-slate-800/80 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
{compactSigTemplate}
                  </pre>
                  <p className="text-[11px] text-slate-400 italic">
                    Compact, high-response format ideal for short-form discussion platforms like Reddit r/Bend, r/Portland, or Discord channels.
                  </p>
                </div>
              </div>

              {/* Crawler Detection Rules Matrix */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">
                  Crawler Attribution Engine Logic &amp; Rules
                </h4>

                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Rule 1: Name &amp; Title Exact Match</strong>
                      <p className="text-[11px] text-slate-400">
                        The crawler searches for <code className="text-emerald-300 font-mono">Mike Ford (Senior Loan Officer)</code> or <code className="text-emerald-300 font-mono">Mike Ford (Loan Officer)</code>. Case-insensitive matching is supported.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Rule 2: Direct Comment Anchor Mapping</strong>
                      <p className="text-[11px] text-slate-400">
                        Including <code className="text-indigo-300 font-mono">[Ref: #th_...]</code> guarantees immediate 1:1 attribution even if posted from a non-registered secondary forum profile.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="text-white">Rule 3: Automatic CRM Promotion</strong>
                      <p className="text-[11px] text-slate-400">
                        Upon attribution, the lead status changes to <strong className="text-emerald-400">💬 Active Two-Way Conversation</strong> and enters your persistent dialogue tracker.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LIVE SIGNATURE VALIDATOR */}
          {activeTab === 'validator' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Live Signature Validator Playground</span>
                  </h4>
                  <span className="text-[10px] text-slate-400">Test your signature format in real time</span>
                </div>
                <p className="text-xs text-slate-300">
                  Paste or draft your online comment below. The validator will inspect your text using the identical regex patterns deployed in the live scrape engine to verify if your post will be automatically attributed back to your dashboard.
                </p>
              </div>

              {/* Textarea Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Draft Comment Text:</span>
                  <button
                    onClick={() => setTestSignatureInput(
                      `Hi! As an Oregon lender with 26 years experience, you can definitely combine the OHCS Flex grant with USDA zero down.\n\n— Mike Ford (Senior Loan Officer)\nDirect / SMS: (541) 729-2097 | fordmj@gmail.com\n[Ref: #${sampleThreadId}]`
                    )}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline font-semibold"
                  >
                    Reset to Canonical Example
                  </button>
                </label>
                <textarea
                  rows={5}
                  value={testSignatureInput}
                  onChange={(e) => setTestSignatureInput(e.target.value)}
                  placeholder="Paste your comment and signature here..."
                  className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 leading-relaxed resize-none shadow-inner"
                />
              </div>

              {/* Validation Result Badge */}
              <div className={`p-4 rounded-2xl border transition-all ${
                isSignatureValid
                  ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 shadow-lg shadow-emerald-950/40'
                  : 'bg-rose-950/60 border-rose-500/60 text-rose-200 shadow-lg shadow-rose-950/40'
              }`}>
                <div className="flex items-start gap-3">
                  {isSignatureValid ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
                  )}
                  <div>
                    <h5 className="font-bold text-xs sm:text-sm text-white flex items-center gap-2">
                      <span>
                        {isSignatureValid
                          ? '✅ Valid Signature: Scrape Engine Will Successfully Attribute Comment'
                          : '⚠️ Invalid Signature: Scrape Engine Cannot Verify Attribution'}
                      </span>
                    </h5>
                    <p className="text-xs mt-1 leading-relaxed">
                      {isSignatureValid
                        ? 'Your signature meets all crawler requirements. When posted online, the circadian sweep will detect your name and title, attribute the dialogue to your workspace, and track borrower replies in your dashboard.'
                        : 'Your text is missing the canonical "Mike Ford (Senior Loan Officer)" signature token. Without this signature, the crawler will treat your comment as general forum noise and will not update your CRM.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Checklist Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasExactOfficerName ? 'bg-slate-950 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    {hasExactOfficerName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                    <span>Officer Name: &ldquo;Mike Ford&rdquo;</span>
                  </span>
                  <span className="text-[10px] font-bold">{hasExactOfficerName ? 'MATCHED' : 'MISSING'}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasOfficerTitle ? 'bg-slate-950 border-emerald-500/40 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    {hasOfficerTitle ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <X className="w-3.5 h-3.5 text-rose-400" />}
                    <span>Title: &ldquo;(Senior Loan Officer)&rdquo;</span>
                  </span>
                  <span className="text-[10px] font-bold">{hasOfficerTitle ? 'MATCHED' : 'MISSING'}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasThreadRef ? 'bg-slate-950 border-indigo-500/40 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    {hasThreadRef ? <Check className="w-3.5 h-3.5 text-indigo-400" /> : <span className="w-3.5 h-3.5 rounded-full bg-slate-700 text-slate-400 text-[9px] flex items-center justify-center font-bold">opt</span>}
                    <span>Thread Ref: &ldquo;[Ref: #th_...]&rdquo;</span>
                  </span>
                  <span className="text-[10px] font-bold">{hasThreadRef ? 'PINNED' : 'OPTIONAL'}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  hasPhoneOrEmail ? 'bg-slate-950 border-cyan-500/40 text-cyan-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    {hasPhoneOrEmail ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <span className="w-3.5 h-3.5 rounded-full bg-slate-700 text-slate-400 text-[9px] flex items-center justify-center font-bold">opt</span>}
                    <span>Direct Cell / Email Contact</span>
                  </span>
                  <span className="text-[10px] font-bold">{hasPhoneOrEmail ? 'ATTACHED' : 'OPTIONAL'}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-950 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Master LO Attribution: <strong>Mike Ford (fordmj@gmail.com)</strong></span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <button
              onClick={() => handleCopy('— Mike Ford (Senior Loan Officer)\nSenior Mortgage Loan Officer | 26 Yrs Oregon Experience\nDirect / SMS: (541) 729-2097 | Email: fordmj@gmail.com', 'footer-sig')}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 cursor-pointer"
            >
              {copiedKey === 'footer-sig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'footer-sig' ? 'Signature Copied' : 'Copy Canonical Signature'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black shadow-lg transition cursor-pointer"
            >
              Done &amp; Close Guide
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
