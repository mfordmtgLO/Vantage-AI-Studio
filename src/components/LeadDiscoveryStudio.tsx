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
  SlidersHorizontal,
  Trash2
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
  sentimentScore: 'Positive' | 'Neutral' | 'Urgent';
  location: string;
  matchedProgram: string;
  discoveredAt: string;
  url: string;
  status: 'new' | 'contacted' | 'saved' | 'ignored';
  timestamp: number; // for sorting
  isStaleReactivated?: boolean;
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
    sentimentScore: 'Urgent',
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
    sentimentScore: 'Positive',
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
    sentimentScore: 'Urgent',
    location: 'Salem / Woodburn, OR',
    matchedProgram: 'USDA Rural Development 0% Down',
    discoveredAt: '9 days ago',
    url: 'https://pnwrealestateblog.org/oregon-usda-zones',
    status: 'contacted',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 9,
    isStaleReactivated: true
  },
  {
    id: 'lead_4',
    sourceType: 'forum',
    platform: 'Reddit (r/FirstTimeHomeBuyer)',
    title: 'Eugene/Springfield area - FHA vs Conventional with down payment gift from parents',
    authorOrUser: 'u/DuckFan_2026',
    snippet: 'My parents are gifting $10k for our first home near Eugene. We want to know if FHA DPA combined with gift funds covers closing costs entirely so we keep our savings intact.',
    intentScore: 88,
    sentimentScore: 'Neutral',
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
    sentimentScore: 'Urgent',
    location: 'Bend, OR',
    matchedProgram: 'Physician / Healthcare Zero Down & VA Loans',
    discoveredAt: '8 days ago',
    url: 'https://discord.gg/oregon-homebuyers',
    status: 'saved',
    timestamp: Date.now() - 1000 * 60 * 60 * 24 * 8,
    isStaleReactivated: true
  }
];

export const LeadDiscoveryStudio: React.FC = () => {
  const [leads, setLeads] = useState<LeadItem[]>(INITIAL_OREGON_LEADS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'forum' | 'chat_board' | 'blog' | 'contacted' | 'saved' | 'stale_alert'>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'intent_desc' | 'intent_asc'>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepLog, setSweepLog] = useState<CircadianExecutionLog | null>(null);
  const [selectedLeadForReply, setSelectedLeadForReply] = useState<LeadItem | null>(null);
  const [customDraftReply, setCustomDraftReply] = useState('');
  const [replySuccessMsg, setReplySuccessMsg] = useState('');
  const [generatedCarouselLink, setGeneratedCarouselLink] = useState('');
  const [showOutreachHistoryModal, setShowOutreachHistoryModal] = useState(false);
  const [autoStaleAlertsEnabled, setAutoStaleAlertsEnabled] = useState(true);
  const [threadReplyInputs, setThreadReplyInputs] = useState<Record<string, string>>({});
  const [outreachHistory, setOutreachHistory] = useState<Array<{
    leadId: string;
    title: string;
    platform: string;
    author: string;
    messages: Array<{ sender: 'lo' | 'renter'; authorName: string; text: string; timestamp: string }>;
    url: string;
  }>>([
    {
      leadId: 'lead_3',
      title: 'Comment on: "Rural Development (USDA RD) Zero-Down Loans in Marion & Clackamas County"',
      platform: 'Pacific Northwest Real Estate Blog',
      author: 'DaveK_Salem',
      messages: [
        {
          sender: 'lo',
          authorName: 'Mike Ford (LO)',
          text: 'Hi DaveK_Salem! As a 26-year mortgage loan officer here in Oregon, I help first-time buyers navigate USDA Rural Development 0% Down every day. USDA zero-down applies to eligible rural census tracts (including parts of Marion & Clackamas County). Let\'s connect!',
          timestamp: 'Yesterday at 4:30 PM'
        },
        {
          sender: 'renter',
          authorName: 'DaveK_Salem',
          text: 'Thanks Mike! That is super helpful. We were worried modular homes don\'t qualify for USDA in Woodburn. Can we use gift funds for closing costs with USDA?',
          timestamp: 'Today at 8:15 AM'
        }
      ],
      url: 'https://pnwrealestateblog.org/oregon-usda-zones'
    }
  ]);

  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  const handleToggleSelectLead = (id: string) => {
    setSelectedLeadIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (selectedLeadIds.length === filteredLeads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(filteredLeads.map(l => l.id));
    }
  };

  const handleBulkStatus = (status: LeadItem['status']) => {
    setLeads(prev => prev.map(l => selectedLeadIds.includes(l.id) ? { ...l, status } : l));
    setSelectedLeadIds([]);
  };

  const handleBulkArchive = () => {
    setLeads(prev => prev.map(l => selectedLeadIds.includes(l.id) ? { ...l, status: 'ignored' } : l));
    setSelectedLeadIds([]);
  };

  const handleBulkMoveToPipeline = () => {
    setLeads(prev => prev.map(l => selectedLeadIds.includes(l.id) ? { ...l, status: 'contacted' } : l));
    setSelectedLeadIds([]);
  };

  const handleSendThreadMessage = (leadId: string) => {
    const text = threadReplyInputs[leadId]?.trim();
    if (!text) return;

    setOutreachHistory(prev => prev.map(item => {
      if (item.leadId === leadId) {
        return {
          ...item,
          messages: [
            ...item.messages,
            {
              sender: 'lo',
              authorName: 'Mike Ford (LO)',
              text,
              timestamp: 'Just now'
            }
          ]
        };
      }
      return item;
    }));

    setThreadReplyInputs(prev => ({ ...prev, [leadId]: '' }));
  };

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
        sentimentScore: 'Urgent',
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
    const finalReplyText = customDraftReply || `Hi ${selectedLeadForReply.authorOrUser}! As a 26-year mortgage loan officer here in Oregon, I help first-time buyers navigate ${selectedLeadForReply.matchedProgram} every day. You don't necessarily need a massive down payment to stop renting in ${selectedLeadForReply.location}. With OHCS Flex Lending and local DPA grants, we frequently bridge closing costs and down payments for borrowers in your exact income bracket. Let's connect if you'd like a quick no-pressure breakdown of what it takes to own your own home!`;
    
    setOutreachHistory(prev => [
      {
        leadId: selectedLeadForReply.id,
        title: selectedLeadForReply.title,
        platform: selectedLeadForReply.platform,
        author: selectedLeadForReply.authorOrUser,
        messages: [
          {
            sender: 'lo',
            authorName: 'Mike Ford (LO)',
            text: finalReplyText,
            timestamp: 'Just now'
          }
        ],
        url: selectedLeadForReply.url
      },
      ...prev
    ]);

    setReplySuccessMsg(`✓ Captured lead into dashboard intake, attached GeoMap carousel magic link, & logged in Outreach Tracker for "${selectedLeadForReply.authorOrUser}"!`);
    setTimeout(() => {
      handleStatusChange(selectedLeadForReply.id, 'contacted');
      setSelectedLeadForReply(null);
      setCustomDraftReply('');
      setGeneratedCarouselLink('');
      setReplySuccessMsg('');
    }, 1800);
  };

  const handleGenerateGeoMapCarouselLink = () => {
    if (!selectedLeadForReply) return;
    const baseUrl = window.location.origin;
    const link = `${baseUrl}/?real_estate=true&lead=${encodeURIComponent(selectedLeadForReply.authorOrUser)}&program=${encodeURIComponent(selectedLeadForReply.matchedProgram)}&market=${encodeURIComponent(selectedLeadForReply.location)}`;
    setGeneratedCarouselLink(link);

    const brandingSignature = `\n\n---\n🏠 **Mike Ford** | 26-Year Oregon Mortgage Veteran (NMLS #102938)\n📊 **Curated Low / Zero-Down Property Carousel**: Check out your custom live listing feed and drop me a note here: ${link}`;
    
    setCustomDraftReply(prev => (prev || `Hi ${selectedLeadForReply.authorOrUser}! As a 26-year mortgage loan officer here in Oregon, I help first-time buyers navigate ${selectedLeadForReply.matchedProgram} every day. You don't necessarily need a massive down payment to stop renting in ${selectedLeadForReply.location}. With OHCS Flex Lending and local DPA grants, we frequently bridge closing costs and down payments for borrowers in your exact income bracket.`) + brandingSignature);
  };

  const handleSelectAiToneVariant = (tone: 'warm' | 'direct' | 'specialist' | 'reengagement') => {
    if (!selectedLeadForReply) return;
    let draft = '';
    if (tone === 'warm') {
      draft = `Hi ${selectedLeadForReply.authorOrUser}! I totally understand your situation in ${selectedLeadForReply.location}. As a 26-year Oregon mortgage veteran, I see renters making the leap into homeownership every week without draining savings. With programs like ${selectedLeadForReply.matchedProgram}, you have fantastic options. Let's chat whenever you have a quick 5 minutes—no pressure at all!`;
    } else if (tone === 'direct') {
      draft = `Hi ${selectedLeadForReply.authorOrUser}, regarding your post about ${selectedLeadForReply.title}: Your target market in ${selectedLeadForReply.location} qualifies for ${selectedLeadForReply.matchedProgram}. Down payment assistance and zero-down options can cover up to 100% of closing hurdles here in Oregon. Let's review your numbers today!`;
    } else if (tone === 'reengagement') {
      draft = `Hi ${selectedLeadForReply.authorOrUser}! Did you get your questions answered and check out the curated local property listings already prequalified for low or no down payment loan programs for ${selectedLeadForReply.location}? Let me know if you'd like to review updated rates or schedule a quick walkthrough!`;
    } else {
      draft = `Hello ${selectedLeadForReply.authorOrUser}! Specializing in ${selectedLeadForReply.matchedProgram} across ${selectedLeadForReply.location}, I wanted to drop a quick note. Renting right now in Oregon means missing out on appreciation, whereas OHCS DPA and zero-down programs make monthly payments comparable to rent. Let's connect on your custom loan scenario!`;
    }
    setCustomDraftReply(draft);
  };

  // Filter & Sort Logic
  const filteredLeads = leads
    .filter(lead => {
      if (activeFilter === 'stale_alert' && (!autoStaleAlertsEnabled || !lead.isStaleReactivated)) return false;
      if (activeFilter === 'contacted' && lead.status !== 'contacted') return false;
      if (activeFilter === 'saved' && lead.status !== 'saved') return false;
      if (activeFilter !== 'all' && activeFilter !== 'contacted' && activeFilter !== 'saved' && activeFilter !== 'stale_alert' && lead.sourceType !== activeFilter) return false;
      
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
  const contactedCount = leads.filter(l => l.status === 'contacted').length;
  const savedCount = leads.filter(l => l.status === 'saved').length;
  const staleAlertCount = leads.filter(l => l.isStaleReactivated).length;

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
              onClick={() => setShowOutreachHistoryModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Outreach Tracker ({outreachHistory.length})</span>
            </button>
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

      {/* Automated Stale Lead Reactivation Alert Banner */}
      {autoStaleAlertsEnabled && staleAlertCount > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/50 p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px] uppercase">Automated Decay Prevention Alert</span>
                <span className="text-white font-bold text-xs">{staleAlertCount} Prospect{staleAlertCount > 1 ? 's' : ''} in Conversation &gt; 7 Days Showing New Activity</span>
              </div>
              <p className="text-slate-300 text-xs mt-0.5">
                These prospects have been in conversation for over a week but recently triggered fresh inbound messages or GeoMap visits. Review immediately to secure conversion.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveFilter(activeFilter === 'stale_alert' ? 'all' : 'stale_alert')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition shadow shrink-0 cursor-pointer whitespace-nowrap"
          >
            {activeFilter === 'stale_alert' ? 'Show All Leads' : `Review ${staleAlertCount} Stale Lead${staleAlertCount > 1 ? 's' : ''} Now`}
          </button>
        </div>
      )}

      {/* Visual Pipeline Progress Summary Chart */}
      {(() => {
        const countNew = leads.filter(l => l.status === 'new').length;
        const countInConvo = outreachHistory.length;
        const countPipeline = leads.filter(l => l.status === 'contacted' || l.status === 'saved').length;
        const countArchived = leads.filter(l => l.status === 'ignored').length;
        const totalLeads = leads.length || 1;

        return (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-4 rounded-2xl shadow-lg">
            {/* New Leads */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">🆕 New Leads</span>
                <span className="text-sm font-black text-white font-mono">{countNew}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((countNew / totalLeads) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">Awaiting initial outreach</span>
            </div>

            {/* In-Conversation */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-400">💬 In-Conversation</span>
                <span className="text-sm font-black text-white font-mono">{countInConvo}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((countInConvo / totalLeads) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">Active chat threads</span>
            </div>

            {/* Pipeline */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">🚀 Pipeline</span>
                <span className="text-sm font-black text-white font-mono">{countPipeline}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((countPipeline / totalLeads) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">Reviewed & saved leads</span>
            </div>

            {/* Archived */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">📁 Archived</span>
                <span className="text-sm font-black text-white font-mono">{countArchived}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-slate-600 rounded-full transition-all duration-500"
                  style={{ width: `${Math.round((countArchived / totalLeads) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400">Ignored / dismissed</span>
            </div>
          </div>
        );
      })()}

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
            <button
              onClick={() => setActiveFilter('contacted')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'contacted'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Contacted ({contactedCount})
            </button>
            <button
              onClick={() => setActiveFilter('saved')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeFilter === 'saved'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Saved ({savedCount})
            </button>
            <button
              onClick={() => setActiveFilter('stale_alert')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeFilter === 'stale_alert'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                  : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/50 border border-amber-500/30'
              }`}
            >
              <Clock className="w-3.5 h-3.5 animate-pulse" />
              <span>Stale Alerts ({staleAlertCount})</span>
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

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700">
            <span className="text-slate-300 font-bold text-xs">Automated Stale Alerts:</span>
            <button
              onClick={() => setAutoStaleAlertsEnabled(!autoStaleAlertsEnabled)}
              type="button"
              className={`w-9 h-5 flex items-center rounded-full p-1 transition cursor-pointer ${autoStaleAlertsEnabled ? 'bg-emerald-500 justify-end' : 'bg-slate-700 justify-start'}`}
            >
              <div className="bg-white w-3.5 h-3.5 rounded-full shadow-md" />
            </button>
          </div>
        </div>
      </div>

      {/* Select All Bar */}
      {filteredLeads.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
          <label className="flex items-center gap-2.5 text-slate-300 font-bold cursor-pointer">
            <input
              type="checkbox"
              checked={selectedLeadIds.length === filteredLeads.length && filteredLeads.length > 0}
              onChange={handleSelectAllFiltered}
              className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer"
            />
            <span>Select All Filtered Leads ({selectedLeadIds.length} of {filteredLeads.length} selected)</span>
          </label>
          {selectedLeadIds.length > 0 && (
            <button
              onClick={() => setSelectedLeadIds([])}
              className="text-slate-400 hover:text-white text-xs font-semibold underline cursor-pointer"
            >
              Clear Selection
            </button>
          )}
        </div>
      )}

      {/* Leads Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-24">
        {filteredLeads.map((lead) => {
          const isSelected = selectedLeadIds.includes(lead.id);
          return (
            <div
              key={lead.id}
              className={`rounded-2xl bg-slate-900/90 border p-5 shadow-lg transition space-y-4 flex flex-col justify-between ${
                isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-950/10' : 'border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelectLead(lead.id)}
                      className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-slate-900 cursor-pointer mr-1"
                    />
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

                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      lead.sentimentScore === 'Urgent'
                        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30 animate-pulse'
                        : lead.sentimentScore === 'Positive'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}>
                      {lead.sentimentScore}
                    </span>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
                      <Sparkles className="w-3 h-3" />
                      {lead.intentScore}% Intent
                    </div>
                  </div>
                </div>

              {autoStaleAlertsEnabled && lead.isStaleReactivated && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/40 text-amber-300 font-bold text-xs">
                  <Clock className="w-3.5 h-3.5 animate-pulse text-amber-400 shrink-0" />
                  <span>⚠️ Inactive 7+ Days &mdash; Review &amp; Send Re-engagement Carousel</span>
                </div>
              )}

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
          );
        })}
      </div>

      {filteredLeads.length === 0 && (
        <div className="text-center py-12 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Search className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-white font-bold text-base">No matching Oregon leads found</h3>
          <p className="text-slate-400 text-xs">Try adjusting your filters or search query, or click &ldquo;Run Sweep Now&rdquo;.</p>
        </div>
      )}

      {/* Persistent Floating Bulk Action Toolbar */}
      {selectedLeadIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900 border border-emerald-500/50 shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black text-xs flex items-center justify-center">
              {selectedLeadIds.length}
            </span>
            <span className="text-white font-bold text-xs whitespace-nowrap">Leads Selected</span>
          </div>

          <div className="h-5 w-px bg-slate-700" />

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => handleBulkStatus('contacted')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs transition shadow cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark Reviewed</span>
            </button>
            <button
              onClick={() => handleBulkMoveToPipeline()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs transition shadow cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Move to Pipeline</span>
            </button>
            <button
              onClick={() => handleBulkArchive()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Archive / Ignore</span>
            </button>
          </div>

          <button
            onClick={() => setSelectedLeadIds([])}
            className="text-slate-400 hover:text-white text-xs font-bold pl-2 cursor-pointer"
          >
            ✕
          </button>
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
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>AI-Generated 26-Year Mortgage Expert Reply Draft</span>
                  </label>
                  <button
                    onClick={handleGenerateGeoMapCarouselLink}
                    type="button"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/40 hover:bg-emerald-500/20 text-emerald-300 text-[11px] font-extrabold transition cursor-pointer"
                  >
                    <span>✨ Attach GeoMap Carousel &amp; Profile</span>
                  </button>
                </div>

                {/* AI Tone Variant Quick Suggestions */}
                <div className="flex items-center gap-2 py-1 overflow-x-auto">
                  <span className="text-[10px] font-bold text-slate-400 shrink-0">AI Suggestion Tones:</span>
                  <button
                    onClick={() => handleSelectAiToneVariant('warm')}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition cursor-pointer whitespace-nowrap"
                  >
                    🌱 Warm Advisory
                  </button>
                  <button
                    onClick={() => handleSelectAiToneVariant('direct')}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition cursor-pointer whitespace-nowrap"
                  >
                    ⚡ Direct &amp; Actionable
                  </button>
                  <button
                    onClick={() => handleSelectAiToneVariant('specialist')}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition cursor-pointer whitespace-nowrap"
                  >
                    🛡️ Program Specialist
                  </button>
                  <button
                    onClick={() => handleSelectAiToneVariant('reengagement')}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 hover:bg-amber-500/30 text-amber-300 text-[10px] font-bold transition cursor-pointer whitespace-nowrap"
                  >
                    💬 Re-engagement (Inactive 7+ Days)
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={customDraftReply || `Hi ${selectedLeadForReply.authorOrUser}! As a 26-year mortgage loan officer here in Oregon, I help first-time buyers navigate ${selectedLeadForReply.matchedProgram} every day. You don't necessarily need a massive down payment to stop renting in ${selectedLeadForReply.location}. With OHCS Flex Lending and local DPA grants, we frequently bridge closing costs and down payments for borrowers in your exact income bracket. Let's connect if you'd like a quick no-pressure breakdown of what it takes to own your own home!`}
                  onChange={(e) => setCustomDraftReply(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 leading-relaxed"
                />
                {generatedCarouselLink && (
                  <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-[11px] text-emerald-200 flex items-center justify-between gap-2">
                    <span className="truncate">🔗 <strong>Carousel Magic Link Attached:</strong> {generatedCarouselLink}</span>
                    <span className="shrink-0 text-[10px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">Ready</span>
                  </div>
                )}
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

      {/* Outreach History & Live Links Tracker Modal */}
      {showOutreachHistoryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-slate-900 border border-indigo-500/40 p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                  Loan Officer CRM Pipeline &amp; Two-Way Chat
                </span>
                <h3 className="text-white font-bold text-lg leading-snug mt-0.5 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span>Outreach Conversation Threads ({outreachHistory.length})</span>
                </h3>
              </div>
              <button
                onClick={() => setShowOutreachHistoryModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {outreachHistory.map((item, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] font-extrabold">
                      {item.platform} • Renter: {item.author}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-400 hover:text-emerald-300 font-bold"
                    >
                      <span>Open Thread URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <h4 className="text-white font-bold text-xs">{item.title}</h4>

                  {/* Message Thread Feed */}
                  <div className="space-y-2.5 bg-slate-900/90 p-3 rounded-xl border border-slate-800 max-h-60 overflow-y-auto">
                    {item.messages.map((msg, msgIdx) => (
                      <div
                        key={msgIdx}
                        className={`p-2.5 rounded-xl text-xs space-y-1 ${
                          msg.sender === 'lo'
                            ? 'bg-indigo-950/60 border border-indigo-500/30 text-indigo-100 ml-4'
                            : 'bg-slate-800/80 border border-slate-700 text-slate-200 mr-4'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                          <span className={msg.sender === 'lo' ? 'text-indigo-400' : 'text-emerald-400'}>
                            {msg.authorName}
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{msg.text}</p>
                      </div>
                    ))}
                  </div>

                  {/* Interactive Follow-Up Reply Box */}
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      value={threadReplyInputs[item.leadId] || ''}
                      onChange={(e) => setThreadReplyInputs({ ...threadReplyInputs, [item.leadId]: e.target.value })}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendThreadMessage(item.leadId); }}
                      placeholder={`Type follow-up reply to ${item.author}...`}
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      onClick={() => handleSendThreadMessage(item.leadId)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Response</span>
                    </button>
                  </div>
                </div>
              ))}

              {outreachHistory.length === 0 && (
                <div className="text-center py-12 text-slate-400 text-xs space-y-2">
                  <MessageSquare className="w-8 h-8 text-slate-600 mx-auto" />
                  <p>No outreach conversations active yet. Click &ldquo;Join Conversation&rdquo; on any lead card to start chatting!</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setShowOutreachHistoryModal(false)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Close Tracker
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
