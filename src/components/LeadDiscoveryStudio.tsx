/**
 * @file LeadDiscoveryStudio.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Oregon First-Time Homebuyer Lead Discovery Studio
 * Aggregates automated sweep results from Reddit, Oregon forums, chat boards, and mortgage blogs.
 */

import React, { useState } from 'react';
import { 
  Search, 
  MessageSquare, 
  ExternalLink, 
  Sparkles, 
  Filter, 
  CheckCircle2, 
  Share2, 
  Send, 
  MapPin, 
  Users, 
  Globe, 
  FileText, 
  ShieldCheck, 
  Zap,
  Clock,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';
import { executeCircadianJob, CircadianExecutionLog } from '../services/cronScheduler';

export interface LeadItem {
  id: string;
  sourceType: 'forum' | 'chat_board' | 'blog';
  platform: string;
  title: string;
  authorOrUser: string;
  snippet: string;
  intentScore: number; // 1-100
  location: string;
  matchedProgram: string;
  discoveredAt: string;
  url: string;
  status: 'new' | 'contacted' | 'saved' | 'ignored';
  timestamp: number; // for sorting
}

const INITIAL_OREGON_LEADS: LeadItem[] = [
  {
    id: 'lead_1',
    sourceType: 'forum',
    platform: 'Reddit (r/Portland)',
    title: 'First-time home buyer in Portland with $65k salary - Is zero down or OHCS DPA realistic right now?',
    authorOrUser: 'u/PDX_Renter_99',
    snippet: 'Looking to stop paying $2,100 in rent in inner SE Portland. I heard about Oregon Housing and Community Services (OHCS) down payment assistance and Lakeview zero-down programs. Anyone successfully used these with under 700 credit?',
    intentScore: 94,
    location: 'Portland, OR',
    matchedProgram: 'OHCS Flex Lending & DPA / Lakeview Zero-Down',
    discoveredAt: 'Today at 9:15 PM',
    url: 'https://reddit.com/r/Portland/comments/oregon_homebuyer_help',
    status: 'new',
    timestamp: Date.now() - 1000 * 60 * 30
  },
  {
    id: 'lead_2',
    sourceType: 'chat_board',
    platform: 'BiggerPockets Oregon Board',
    title: 'Beaverton / Hillsboro tech workers looking for 2-1 buydowns or seller concessions',
    authorOrUser: 'SarahM_Hillsboro',
    snippet: 'Interest rates feel brutal for our first home purchase. Sellers are starting to offer price concessions and 2-1 rate buydowns in Washington County. Can someone explain how gift funds work for closing costs?',
    intentScore: 89,
    location: 'Beaverton, OR',
    matchedProgram: '2-1 Rate Buydowns & Seller Concessions',
    discoveredAt: 'Today at 7:42 PM',
    url: 'https://biggerpockets.com/forums/oregon-first-time-buyers',
    status: 'new',
    timestamp: Date.now() - 1000 * 60 * 120
  },
  {
    id: 'lead_3',
    sourceType: 'blog',
    platform: 'Pacific Northwest Real Estate Blog',
    title: 'Comment on: "Rural Development (USDA RD) Zero-Down Loans in Marion & Clackamas County"',
    authorOrUser: 'DaveK_Salem',
    snippet: 'We want to buy near Woodburn or Silverton. Does the USDA zero-down loan apply to modular homes or just traditional single family? Trying to avoid PMI while renting an overpriced apartment.',
    intentScore: 91,
    location: 'Salem / Woodburn, OR',
    matchedProgram: 'USDA Rural Development 0% Down',
    discoveredAt: 'Yesterday at 4:20 PM',
    url: 'https://pnwrealestateblog.org/oregon-usda-zones',
    status: 'contacted',
    timestamp: Date.now() - 1000 * 60 * 60 * 24
  },
  {
    id: 'lead_4',
    sourceType: 'forum',
    platform: 'Reddit (r/FirstTimeHomeBuyer)',
    title: 'Eugene/Springfield area - FHA vs Conventional with down payment gift from parents',
    authorOrUser: 'u/DuckFan_2026',
    snippet: 'My parents are gifting $10k for our first home near Eugene. We want to know if FHA DPA combined with gift funds covers closing costs entirely so we keep our savings intact.',
    intentScore: 88,
    location: 'Eugene, OR',
    matchedProgram: 'FHA Loan + DPA + Gift Funds',
    discoveredAt: 'Yesterday at 2:10 PM',
    url: 'https://reddit.com/r/FirstTimeHomeBuyer/comments/eugene_fha_dpa',
    status: 'new',
    timestamp: Date.now() - 1000 * 60 * 60 * 28
  },
  {
    id: 'lead_5',
    sourceType: 'chat_board',
    platform: 'Oregon Local Chat (Discord)',
    title: 'Bend housing market for nurses and first-time buyers - any zero down options?',
    authorOrUser: 'BendNurse91',
    snippet: 'Rents in Bend are out of control. Are there any physician or healthcare worker zero down mortgage programs in Deschutes County or do we need 20% down?',
    intentScore: 86,
    location: 'Bend, OR',
    matchedProgram: 'Physician / Healthcare Zero Down & VA Loans',
    discoveredAt: '2 days ago',
    url: 'https://discord.gg/oregon-homebuyers',
    status: 'saved',
    timestamp: Date.now() - 1000 * 60 * 60 * 48
  }
];

export const LeadDiscoveryStudio: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_OREGON_LEADS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'forum' | 'chat_board' | 'blog'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'intent_desc' | 'intent_asc'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepLog, setSweepLog] = useState<CircadianExecutionLog | null>(null);
  const [selectedLeadForReply, setSelectedLeadForReply] = useState<LeadItem | null>(null);
  const [customDraftReply, setCustomDraftReply] = useState('');
  const [replySuccessMsg, setReplySuccessMsg] = useState('');

  const handleRunManualSweep = async () => {
    setIsSweeping(true);
    try {
      const res = await executeCircadianJob('job_oregon_homebuyer_lead_sweep');
      setSweepLog(res.log);
      const newLead: LeadItem = {
        id: `lead_${Date.now()}`,
        sourceType: 'forum',
        platform: 'Reddit (r/Portland)',
        title: 'Gresham first-time buyer asking about down payment assistance and credit score minimums',
        authorOrUser: 'u/GreshamHomeSeeker',
        snippet: 'Just spoke with a lender who mentioned 620 credit score is enough for OHCS DPA. Looking for second opinions or recommendations from experienced LOs in Oregon.',
        intentScore: 97,
        location: 'Gresham, OR',
        matchedProgram: 'OHCS DPA & 620 Credit FHA/Conventional',
        discoveredAt: 'Just now',
        url: 'https://reddit.com/r/Portland/comments/gresham_dpa_inquiry',
        status: 'new',
        timestamp: Date.now()
      };
      setLeads([newLead, ...leads]);
    } catch (err) {
      console.error('Sweep failed:', err);
    } finally {
      setIsSweeping(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: LeadItem['status']) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handleSendDraftReply = () => {
    if (!selectedLeadForReply) return;
    setReplySuccessMsg(`✓ Professional mortgage response drafted and queued for "${selectedLeadForReply.authorOrUser}" on ${selectedLeadForReply.platform}!`);
    setTimeout(() => {
      handleStatusChange(selectedLeadForReply.id, 'contacted');
      setSelectedLeadForReply(null);
      setCustomDraftReply('');
      setReplySuccessMsg('');
    }, 1800);
  };

  // Filter & Sort Logic
  const filteredLeads = leads
    .filter(lead => {
      if (activeFilter !== 'all' && lead.sourceType !== activeFilter) return false;
      
      if (programFilter !== 'all') {
        const p = programFilter.toLowerCase();
        const matched = lead.matchedProgram.toLowerCase();
        if (p === 'dpa' && !matched.includes('dpa')) return false;
        if (p === 'zero_down' && !matched.includes('zero') && !matched.includes('0')) return false;
        if (p === 'usda' && !matched.includes('usda')) return false;
        if (p === 'fha' && !matched.includes('fha')) return false;
        if (p === 'buydowns' && !matched.includes('buydown')) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          lead.title.toLowerCase().includes(q) ||
          lead.snippet.toLowerCase().includes(q) ||
          lead.location.toLowerCase().includes(q) ||
          lead.matchedProgram.toLowerCase().includes(q) ||
          lead.platform.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return b.timestamp - a.timestamp;
      if (sortBy === 'intent_desc') return b.intentScore - a.intentScore;
      if (sortBy === 'intent_asc') return a.intentScore - b.intentScore;
      return 0;
    });

  const forumCount = leads.filter(l => l.sourceType === 'forum').length;
  const chatCount = leads.filter(l => l.sourceType === 'chat_board').length;
  const blogCount = leads.filter(l => l.sourceType === 'blog').length;

  return (
    <div className="space-y-6">
      {/* Hero Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 p-6 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Globe className="w-48 h-48 text-emerald-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Oregon Renter-to-Homeowner Intelligence Feed</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Lead Discovery &amp; Renter Intent Sweep
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Automated daily 10:20 PM PST scan of Oregon forums, Reddit communities, and housing chat boards powered by Gemini 3.0 SDK and Live Google Search Grounding. Connect instantly with renters looking to stop renting and buy a home.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunManualSweep}
              disabled={isSweeping}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isSweeping ? 'animate-spin' : ''}`} />
              <span>{isSweeping ? 'Scanning Oregon Sources...' : 'Run Sweep Now'}</span>
            </button>
          </div>
        </div>

        {sweepLog && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              {sweepLog.summary}
            </span>
            <span className="text-[10px] font-mono text-emerald-300 shrink-0">
              {new Date(sweepLog.executedAt).toLocaleTimeString()}
            </span>
          </div>
        )}
      </div>

      {/* Advanced Filter & Sort Bar */}
      <div className="flex flex-col gap-4 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Source Type Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Sources ({leads.length})
            </button>
            <button
              onClick={() => setActiveFilter('forum')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'forum'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Forums ({forumCount})
            </button>
            <button
              onClick={() => setActiveFilter('chat_board')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'chat_board'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Chat Boards ({chatCount})
            </button>
            <button
              onClick={() => setActiveFilter('blog')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'blog'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Blogs ({blogCount})
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads, DPA, cities..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Secondary Filter & Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Program Tag:</span>
            </span>
            <select
              value={programFilter}
              onChange={(e) => setProgramFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Mortgage Programs</option>
              <option value="dpa">OHCS / Down Payment Assistance (DPA)</option>
              <option value="zero_down">Zero-Down / 0% Down</option>
              <option value="usda">USDA Rural Development</option>
              <option value="fha">FHA &amp; Gift Funds</option>
              <option value="buydowns">2-1 Buydowns &amp; Concessions</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 flex items-center gap-1 font-semibold">
              <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sort By:</span>
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="newest">Newest Discovered First</option>
              <option value="intent_desc">Highest Intent Score (97% → 80%)</option>
              <option value="intent_asc">Lowest Intent Score</option>
            </select>
          </div>
        </div>
      </div>

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredLeads.map((lead) => (
          <div
            key={lead.id}
            className="rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 p-5 shadow-lg transition space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wider ${
                    lead.sourceType === 'forum'
                      ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                      : lead.sourceType === 'chat_board'
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {lead.sourceType.replace('_', ' ')} • {lead.platform}
                  </span>
                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {lead.discoveredAt}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
                  <Sparkles className="w-3 h-3" />
                  {lead.intentScore}% Intent
                </div>
              </div>

              <h3 className="text-white font-bold text-sm leading-snug hover:text-emerald-400 transition">
                {lead.title}
              </h3>

              <p className="text-slate-300 text-xs leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                &ldquo;{lead.snippet}&rdquo;
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
                <div className="flex items-center gap-1.5 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="truncate"><strong>Market:</strong> {lead.location}</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate"><strong>Program:</strong> {lead.matchedProgram}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400">By <strong className="text-slate-200">{lead.authorOrUser}</strong></span>
                <select
                  value={lead.status}
                  onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadItem['status'])}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none ${
                    lead.status === 'contacted' ? 'text-emerald-400' : lead.status === 'saved' ? 'text-blue-400' : 'text-slate-300'
                  }`}
                >
                  <option value="new">Status: New</option>
                  <option value="contacted">Status: Contacted</option>
                  <option value="saved">Status: Saved</option>
                  <option value="ignored">Status: Ignored</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedLeadForReply(lead)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs shadow transition cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Join Conversation</span>
                </button>
                <a
                  href={lead.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                  title="Open Source Link"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Search className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-white font-bold text-base">No matching Oregon leads found</h3>
          <p className="text-slate-400 text-xs">Try adjusting your filters or search query, or click &ldquo;Run Sweep Now&rdquo;.</p>
        </div>
      )}

      {/* Join Conversation / Reply Modal */}
      {selectedLeadForReply && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  {selectedLeadForReply.platform} • {selectedLeadForReply.location}
                </span>
                <h3 className="text-white font-bold text-base leading-snug mt-0.5">
                  Join Discussion: {selectedLeadForReply.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLeadForReply(null)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
                <span className="text-emerald-400 font-semibold">Original Renter Query ({selectedLeadForReply.authorOrUser}):</span>
                <p className="italic">&ldquo;{selectedLeadForReply.snippet}&rdquo;</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AI-Generated 26-Year Mortgage Expert Reply Draft</span>
                </label>
                <textarea
                  rows={5}
                  value={customDraftReply || `Hi ${selectedLeadForReply.authorOrUser}! As a 26-year mortgage loan officer here in Oregon, I help first-time buyers navigate ${selectedLeadForReply.matchedProgram} every day. You don't necessarily need a massive down payment to stop renting in ${selectedLeadForReply.location}. With OHCS Flex Lending and local DPA grants, we frequently bridge closing costs and down payments for borrowers in your exact income bracket. Let's connect if you'd like a quick no-pressure breakdown of what it takes to own your own home!`}
                  onChange={(e) => setCustomDraftReply(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
              </div>

              {replySuccessMsg && (
                <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-semibold">
                  {replySuccessMsg}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedLeadForReply(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSendDraftReply}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold text-xs shadow-lg transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send &amp; Mark Contacted</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
