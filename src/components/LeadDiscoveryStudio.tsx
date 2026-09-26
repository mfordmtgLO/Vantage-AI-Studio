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
  Trash2,
  BrainCircuit
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
  isFilteredOut?: boolean;
  filterReason?: string;
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
  },
  {
    id: 'lead_lane_1',
    sourceType: 'forum',
    platform: 'Oregon Housing Forum (Lane)',
    title: 'Florence coast first-time buyer - can we use USDA zero-down in coastal Lane County?',
    authorOrUser: 'u/FlorenceCoastBuyer',
    snippet: 'Looking for a starter home in Florence or near the Siuslaw river. We want to know if USDA rural housing zero-down applies here or if we need conventional 3% down.',
    intentScore: 93,
    sentimentScore: 'Urgent',
    location: 'Florence, OR (Lane County)',
    matchedProgram: 'USDA Rural Development & OHCS DPA',
    discoveredAt: 'Today at 6:20 AM',
    url: 'https://oregonhousingforum.org/florence-lane',
    status: 'new',
    timestamp: Date.now() - 1000 * 60 * 90
  },
  {
    id: 'lead_coos_1',
    sourceType: 'chat_board',
    platform: 'Coos Bay / North Bend Housing Discord',
    title: 'Coos Bay waterfront starter home - USDA 100% financing income limits',
    authorOrUser: 'u/CoosBayWaterfront',
    snippet: 'Found a great 3-bed fixer-upper in Coos Bay. As first-time buyers in Coos County, we are exploring USDA rural development zero-down and local county assistance grants.',
    intentScore: 95,
    sentimentScore: 'Urgent',
    location: 'Coos Bay, OR (Coos County)',
    matchedProgram: 'USDA 0% Down & Coos County DPA',
    discoveredAt: 'Today at 5:10 AM',
    url: 'https://discord.gg/coos-bay-housing',
    status: 'new',
    timestamp: Date.now() - 1000 * 60 * 180
  },
  {
    id: 'lead_coos_2',
    sourceType: 'blog',
    platform: 'South Coast Oregon Real Estate Journal',
    title: 'Bandon and Coquille real estate demand for remote workers and local families',
    authorOrUser: 'u/BandonBeachBuyer',
    snippet: 'Relocating to Bandon and trying to secure a mortgage with low down payment. Does Bandon qualify for USDA zero-down census tracts?',
    intentScore: 90,
    sentimentScore: 'Positive',
    location: 'Bandon, OR (Coos County)',
    matchedProgram: 'USDA Rural Housing & FHA',
    discoveredAt: 'Yesterday at 3:15 PM',
    url: 'https://southcoastoregonre.org/bandon',
    status: 'new',
    timestamp: Date.now() - 1000 * 60 * 360
  },
  { id: 'raw_6', sourceType: 'forum', platform: 'Reddit (r/Portland)', title: 'Moving to Vancouver WA - mortgage rules?', authorOrUser: 'u/WaCommuter', snippet: 'Moving just across the river to Washington state. Do Oregon OHCS DPA programs apply?', intentScore: 68, sentimentScore: 'Neutral', location: 'Vancouver, WA', matchedProgram: 'Washington State Housing Finance', discoveredAt: '10 hrs ago', url: 'https://reddit.com/r/Portland/comments/vancouver', status: 'ignored', timestamp: Date.now() - 3600000, isFilteredOut: true, filterReason: 'Filtered out: Out of State / Washington Market' },
  { id: 'raw_7', sourceType: 'chat_board', platform: 'Oregon Real Estate Discord', title: 'Commercial apartment building 12 units in Salem', authorOrUser: 'u/MultifamilyKing', snippet: 'Looking for commercial portfolio financing for 12-unit apartment complex in Salem.', intentScore: 54, sentimentScore: 'Neutral', location: 'Salem, OR', matchedProgram: 'Commercial Portfolio Loan', discoveredAt: '11 hrs ago', url: 'https://discord.gg/oregon/commercial', status: 'ignored', timestamp: Date.now() - 7200000, isFilteredOut: true, filterReason: 'Filtered out: Commercial Real Estate Multifamily' },
  { id: 'raw_8', sourceType: 'blog', platform: 'Oregon Finance Blog', title: 'General musings on interest rate trends for Q4', authorOrUser: 'AdminBlog', snippet: 'Interest rates might fluctuate over the next two quarters. Stay tuned for updates.', intentScore: 42, sentimentScore: 'Neutral', location: 'Statewide, OR', matchedProgram: 'General Info', discoveredAt: '12 hrs ago', url: 'https://blog.com/rates', status: 'ignored', timestamp: Date.now() - 10000000, isFilteredOut: true, filterReason: 'Filtered out: Low Intent Score (<75) - Exploratory discussion' },
  { id: 'raw_9', sourceType: 'forum', platform: 'Reddit (r/Eugene)', title: 'Any good local coffee shops near downtown Eugene?', authorOrUser: 'u/CoffeeLover99', snippet: 'Just visiting Eugene for the weekend. Any recommendations for espresso near 5th St?', intentScore: 12, sentimentScore: 'Positive', location: 'Eugene, OR', matchedProgram: 'N/A', discoveredAt: '14 hrs ago', url: 'https://reddit.com/r/Eugene/coffee', status: 'ignored', timestamp: Date.now() - 15000000, isFilteredOut: true, filterReason: 'Filtered out: Non-Mortgage / Off-Topic Content' },
  { id: 'raw_10', sourceType: 'chat_board', platform: 'Oregon Homebuyer Chat', title: 'Already closed on my mortgage in Bend - thanks!', authorOrUser: 'u/BendHomeowner2025', snippet: 'Just wanted to say thanks for the advice last month. We closed on our Bend home!', intentScore: 30, sentimentScore: 'Positive', location: 'Bend, OR', matchedProgram: 'Conventional 3%', discoveredAt: '15 hrs ago', url: 'https://discord.gg/bend/closed', status: 'ignored', timestamp: Date.now() - 20000000, isFilteredOut: true, filterReason: 'Filtered out: Already Closed / Financing Completed' },
  { id: 'raw_11', sourceType: 'forum', platform: 'Reddit (r/Portland)', title: 'Landlord tenant laws regarding security deposits in Oregon', authorOrUser: 'u/RenterRightsPDX', snippet: 'Can my landlord keep my deposit for normal wear and tear in Multnomah County?', intentScore: 45, sentimentScore: 'Urgent', location: 'Portland, OR', matchedProgram: 'Tenant Legal Aid', discoveredAt: '16 hrs ago', url: 'https://reddit.com/r/Portland/deposit', status: 'ignored', timestamp: Date.now() - 25000000, isFilteredOut: true, filterReason: 'Filtered out: Landlord-Tenant Law (Non-Purchase)' },
  { id: 'raw_12', sourceType: 'blog', platform: 'Oregon Real Estate News', title: 'Portland housing inventory slightly up in September', authorOrUser: 'EditorNews', snippet: 'Active listings in the Portland metro area saw a minor 3% bump this month.', intentScore: 50, sentimentScore: 'Neutral', location: 'Portland, OR', matchedProgram: 'Market Report', discoveredAt: '18 hrs ago', url: 'https://news.org/pdx', status: 'ignored', timestamp: Date.now() - 30000000, isFilteredOut: true, filterReason: 'Filtered out: General Market News Article' },
  { id: 'raw_13', sourceType: 'chat_board', platform: 'Oregon Housing Discord', title: 'Refinance existing 6.8% mortgage in Medford', authorOrUser: 'u/MedfordRefi', snippet: 'Looking to refinance my current home loan in Medford to drop mortgage insurance.', intentScore: 62, sentimentScore: 'Neutral', location: 'Medford, OR', matchedProgram: 'Conventional Refinance', discoveredAt: '1 day ago', url: 'https://discord.gg/refi', status: 'ignored', timestamp: Date.now() - 40000000, isFilteredOut: true, filterReason: 'Filtered out: Refinance Inquiry (Not First-Time Buyer Lead)' },
  { id: 'raw_14', sourceType: 'forum', platform: 'Reddit (r/Corvallis)', title: 'OSU football ticket exchange thread', authorOrUser: 'u/BeaverFan', snippet: 'Selling 2 tickets for this Saturdays game vs Washington State.', intentScore: 10, sentimentScore: 'Neutral', location: 'Corvallis, OR', matchedProgram: 'N/A', discoveredAt: '1 day ago', url: 'https://reddit.com/r/corvallis/tickets', status: 'ignored', timestamp: Date.now() - 50000000, isFilteredOut: true, filterReason: 'Filtered out: Spam / Off-Topic Classifieds' },
  { id: 'raw_15', sourceType: 'blog', platform: 'Oregon Mortgage Pros', title: 'Understanding debt-to-income (DTI) ratios', authorOrUser: 'LoanExpert', snippet: 'Educational guide on how lenders calculate gross monthly income versus monthly liabilities.', intentScore: 48, sentimentScore: 'Neutral', location: 'Statewide, OR', matchedProgram: 'Educational Resource', discoveredAt: '1 day ago', url: 'https://mortgagepros.org/dti', status: 'ignored', timestamp: Date.now() - 60000000, isFilteredOut: true, filterReason: 'Filtered out: Educational Blog Post (No Direct Buyer Intent)' },
  { id: 'raw_16', sourceType: 'forum', platform: 'Reddit (r/Bend)', title: 'Short term rental permits in Deschutes County', authorOrUser: 'u/BendAirbnbHost', snippet: 'Questions about STR zoning rules near Sunriver for investment properties.', intentScore: 58, sentimentScore: 'Neutral', location: 'Bend, OR', matchedProgram: 'Investment Loan', discoveredAt: '2 days ago', url: 'https://reddit.com/r/bend/str', status: 'ignored', timestamp: Date.now() - 70000000, isFilteredOut: true, filterReason: 'Filtered out: Short-Term Rental / Investment Property' },
  { id: 'raw_17', sourceType: 'chat_board', platform: 'Oregon Homebuyers Chat', title: 'Home insurance quotes in wildfire risk zones near Ashland', authorOrUser: 'u/AshlandHome', snippet: 'Struggling to find affordable HO-3 property insurance for a home near Ashland.', intentScore: 65, sentimentScore: 'Urgent', location: 'Ashland, OR', matchedProgram: 'Property Insurance', discoveredAt: '2 days ago', url: 'https://discord.gg/ashland/insurance', status: 'ignored', timestamp: Date.now() - 80000000, isFilteredOut: true, filterReason: 'Filtered out: Insurance Inquiry (Missing Loan Intent)' },
  { id: 'raw_18', sourceType: 'forum', platform: 'Reddit (r/Portland)', title: 'Best local credit unions for auto loans in PDX', authorOrUser: 'u/CarBuyerPDX', snippet: 'Looking to finance a used car with a local credit union in Oregon.', intentScore: 25, sentimentScore: 'Neutral', location: 'Portland, OR', matchedProgram: 'Auto Loan', discoveredAt: '2 days ago', url: 'https://reddit.com/r/pdx/auto', status: 'ignored', timestamp: Date.now() - 90000000, isFilteredOut: true, filterReason: 'Filtered out: Auto Loan (Non-Mortgage)' },
  { id: 'raw_19', sourceType: 'blog', platform: 'PNW Housing Watch', title: 'Oregon property tax exemptions for seniors', authorOrUser: 'TaxSpecialist', snippet: 'Overview of Oregon property tax deferral programs for senior citizens.', intentScore: 35, sentimentScore: 'Neutral', location: 'Statewide, OR', matchedProgram: 'Tax Exemption', discoveredAt: '3 days ago', url: 'https://pnwhousing.org/taxes', status: 'ignored', timestamp: Date.now() - 100000000, isFilteredOut: true, filterReason: 'Filtered out: Senior Tax Deferral (Non-First Time Buyer)' },
  { id: 'raw_20', sourceType: 'chat_board', platform: 'Oregon Real Estate Discord', title: 'Home inspection recommendations in Hillsboro', authorOrUser: 'u/HillsboroBuyer', snippet: 'Need a licensed structural engineer and home inspector in Washington County.', intentScore: 69, sentimentScore: 'Neutral', location: 'Hillsboro, OR', matchedProgram: 'Home Inspection', discoveredAt: '3 days ago', url: 'https://discord.gg/hillsboro/inspect', status: 'ignored', timestamp: Date.now() - 110000000, isFilteredOut: true, filterReason: 'Filtered out: Home Inspection Service (Vendor Inquiry)' },
  { id: 'raw_21', sourceType: 'forum', platform: 'Reddit (r/Salem)', title: 'Moving boxes and packing supplies giveaway in Salem', authorOrUser: 'u/SalemMoving', snippet: 'Free cardboard boxes pickup near Keizer Station.', intentScore: 15, sentimentScore: 'Positive', location: 'Salem, OR', matchedProgram: 'N/A', discoveredAt: '3 days ago', url: 'https://reddit.com/r/salem/boxes', status: 'ignored', timestamp: Date.now() - 120000000, isFilteredOut: true, filterReason: 'Filtered out: Moving Supplies Classified' },
  { id: 'raw_22', sourceType: 'blog', platform: 'Oregon Financial Literacy', title: 'Credit score myths debunked', authorOrUser: 'CreditCoach', snippet: 'Does checking your own credit report lower your FICO score? Here is what to know.', intentScore: 52, sentimentScore: 'Neutral', location: 'Statewide, OR', matchedProgram: 'Credit Repair', discoveredAt: '4 days ago', url: 'https://finlit.org/credit', status: 'ignored', timestamp: Date.now() - 130000000, isFilteredOut: true, filterReason: 'Filtered out: General Credit Advice Article' },
  { id: 'raw_23', sourceType: 'chat_board', platform: 'Oregon First Time Buyers', title: 'Down payment gift tax limits IRS rules', authorOrUser: 'u/GiftTaxQ', snippet: 'What is the annual gift tax exclusion limit for parents gifting house down payments?', intentScore: 64, sentimentScore: 'Neutral', location: 'Portland, OR', matchedProgram: 'IRS Gift Guidelines', discoveredAt: '4 days ago', url: 'https://discord.gg/giftq', status: 'ignored', timestamp: Date.now() - 140000000, isFilteredOut: true, filterReason: 'Filtered out: Tax Question Only (Low Intent Score)' },
  { id: 'raw_24', sourceType: 'forum', platform: 'Reddit (r/Eugene)', title: 'Landscaping services for new home build in Springfield', authorOrUser: 'u/SpringfieldYard', snippet: 'Looking for sod installation and sprinkler system quotes in Lane County.', intentScore: 40, sentimentScore: 'Neutral', location: 'Springfield, OR', matchedProgram: 'Landscaping', discoveredAt: '4 days ago', url: 'https://reddit.com/r/eugene/yard', status: 'ignored', timestamp: Date.now() - 150000000, isFilteredOut: true, filterReason: 'Filtered out: Landscaping Vendor Inquiry' },
  { id: 'raw_25', sourceType: 'blog', platform: 'Oregon Business Journal', title: 'Construction employment numbers in Pacific Northwest', authorOrUser: 'JournalistBiz', snippet: 'State employment data shows steady growth in residential construction trades.', intentScore: 28, sentimentScore: 'Neutral', location: 'Statewide, OR', matchedProgram: 'Economic Data', discoveredAt: '5 days ago', url: 'https://bizjournals.com/oregon', status: 'ignored', timestamp: Date.now() - 160000000, isFilteredOut: true, filterReason: 'Filtered out: Macroeconomic Employment Report' },
  { id: 'raw_26', sourceType: 'chat_board', platform: 'Oregon Housing Discord', title: 'HOA fees dispute in new Bend subdivision', authorOrUser: 'u/BendHOAIssue', snippet: 'Can our HOA increase monthly dues by 20% without a homeowner vote in Deschutes County?', intentScore: 44, sentimentScore: 'Urgent', location: 'Bend, OR', matchedProgram: 'HOA Legal', discoveredAt: '5 days ago', url: 'https://discord.gg/bend/hoa', status: 'ignored', timestamp: Date.now() - 170000000, isFilteredOut: true, filterReason: 'Filtered out: HOA Dispute (Non-Purchase Inquiry)' },
  { id: 'raw_27', sourceType: 'forum', platform: 'Reddit (r/Portland)', title: 'Home security camera installation in Beaverton', authorOrUser: 'u/SecurePDX', snippet: 'Recommendations for hardwired PoE security cameras for a new construction home.', intentScore: 33, sentimentScore: 'Neutral', location: 'Beaverton, OR', matchedProgram: 'Smart Home', discoveredAt: '5 days ago', url: 'https://reddit.com/r/pdx/security', status: 'ignored', timestamp: Date.now() - 180000000, isFilteredOut: true, filterReason: 'Filtered out: Smart Home / Security Vendor Inquiry' }
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
  const [showScrapeAnalyticsModal, setShowScrapeAnalyticsModal] = useState(false);
  const [autoStaleAlertsEnabled, setAutoStaleAlertsEnabled] = useState(true);
  const [showRawResults, setShowRawResults] = useState(false);
  const [selectedSweepCounty, setSelectedSweepCounty] = useState<string>('all_8_counties');
  const [sweepMode, setSweepMode] = useState<'hybrid' | 'gemini_only' | 'deepseek_only'>('hybrid');
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
      const countyNameMap: Record<string, string> = {
        'all_8_counties': 'All 8 Core Counties (Deschutes, Marion, Benton, Linn, Clackamas, Douglas, Lane, Coos)',
        'deschutes': 'Deschutes County (Bend, Redmond, Sisters)',
        'marion': 'Marion County (Salem, Keizer, Silverton)',
        'benton': 'Benton County (Corvallis, Philomath)',
        'linn': 'Linn County (Albany, Lebanon, Sweet Home)',
        'clackamas': 'Clackamas County (Lake Oswego, Oregon City, Milwaukie)',
        'douglas': 'Douglas County (Roseburg, Sutherlin)',
        'lane': 'Lane County (Eugene, Springfield, Florence)',
        'coos': 'Coos County (Coos Bay, North Bend, Bandon)'
      };
      const targetName = countyNameMap[selectedSweepCounty] || 'All 8 Core Counties';
      const modeLabel = sweepMode === 'hybrid' ? 'Hybrid Auto-Balanced' : sweepMode === 'gemini_only' ? 'Gemini-Only Grounding' : 'DeepSeek-Only Swarm';
      if (res.log) {
        res.log.summary = `[${modeLabel}] Target County Sweep (${targetName}): ${res.log.summary}`;
      }
      setSweepLog(res.log);
      
      const newlyDiscoveredBatch: LeadItem[] = [
        {
          id: `lead_sweep_1_${Date.now()}`,
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
        },
        {
          id: `lead_sweep_2_${Date.now()}`,
          sourceType: 'chat_board',
          platform: 'Oregon Housing Discord (#rogue-valley)',
          title: 'Medford starter home search - can we combine USDA zero-down with seller paid closing costs?',
          authorOrUser: 'u/MedfordFirstTime',
          snippet: 'We found a great 3-bed in Medford listed at $340k. Sellers are motivated. Wondering if USDA loan rules allow seller concessions to cover closing costs entirely.',
          intentScore: 94,
          sentimentScore: 'Positive',
          location: 'Medford, OR',
          matchedProgram: 'USDA Rural Development & Seller Concessions',
          discoveredAt: 'Just now',
          url: 'https://discord.gg/oregon-housing/medford',
          status: 'new',
          timestamp: Date.now() - 1000
        },
        {
          id: `lead_sweep_3_${Date.now()}`,
          sourceType: 'blog',
          platform: 'PNW Real Estate Investor Forum',
          title: 'Corvallis tech worker looking to stop renting and buy near OSU campus',
          authorOrUser: 'u/CorvallisTechBuyer',
          snippet: 'Tired of paying $2,300 in rent near Corvallis. Looking into conventional 3% down options and whether gift funds from parents count towards reserves.',
          intentScore: 91,
          sentimentScore: 'Neutral',
          location: 'Corvallis, OR',
          matchedProgram: 'Conventional 3% Down & Gift Funds',
          discoveredAt: 'Just now',
          url: 'https://pnwrealestateblog.org/corvallis-osu',
          status: 'new',
          timestamp: Date.now() - 2000
        },
        {
          id: `lead_sweep_4_${Date.now()}`,
          sourceType: 'forum',
          platform: 'Reddit (r/Oregon)',
          title: 'Salem duplex or single family with FHA 203k renovation loan?',
          authorOrUser: 'u/SalemFamily2026',
          snippet: 'Wanting to buy a fixer-upper in Salem with FHA 203k to roll renovation costs into the mortgage. Are local Salem contractors familiar with this?',
          intentScore: 89,
          sentimentScore: 'Urgent',
          location: 'Salem, OR',
          matchedProgram: 'FHA 203(k) Renovation Loan',
          discoveredAt: 'Just now',
          url: 'https://reddit.com/r/Oregon/comments/salem_fha_203k',
          status: 'new',
          timestamp: Date.now() - 3000
        },
        {
          id: `lead_sweep_5_${Date.now()}`,
          sourceType: 'chat_board',
          platform: 'Bend Outdoor Recreation Guild',
          title: 'Bend housing prices vs Deschutes County employer assistance grants',
          authorOrUser: 'u/BendOutdoorBuyer',
          snippet: 'Struggle to compete with cash buyers in Bend. Heard about local employer housing assistance paired with OHCS Flex Lending. Any LOs specialized in this?',
          intentScore: 95,
          sentimentScore: 'Urgent',
          location: 'Bend, OR',
          matchedProgram: 'OHCS Flex Lending & Employer Grant',
          discoveredAt: 'Just now',
          url: 'https://discord.gg/bend-housing',
          status: 'new',
          timestamp: Date.now() - 4000
        }
      ];

      setLeads(prev => [...newlyDiscoveredBatch, ...prev]);
    } catch (err) {
      console.error('Sweep failed:', err);
    } finally {
      setIsSweeping(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: LeadItem['status']) => {
    setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
  };

  const handlePromoteFilteredLead = (id: string) => {
    setLeads(leads.map(l => l.id === id ? { ...l, isFilteredOut: false, filterReason: undefined, status: 'new' } : l));
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
      if (!showRawResults && lead.isFilteredOut) return false;
      if (activeFilter === 'stale_alert' && (!autoStaleAlertsEnabled || !lead.isStaleReactivated)) return false;
      if (activeFilter === 'contacted' && lead.status !== 'contacted') return false;
      if (activeFilter === 'saved' && lead.status !== 'saved') return false;
      if (activeFilter !== 'all' && activeFilter !== 'contacted' && activeFilter !== 'saved' && activeFilter !== 'stale_alert' && lead.sourceType !== activeFilter) return false;
      
      if (programFilter !== 'all') {
        const p = programFilter.toLowerCase();
        const loc = lead.location.toLowerCase();
        const matched = lead.matchedProgram.toLowerCase();
        const titleSnippet = (lead.title + ' ' + lead.snippet).toLowerCase();

        if (p === 'lane_county') {
          const laneCities = ['eugene', 'springfield', 'florence', 'creswell', 'cottage grove', 'junction city', 'oakridge', 'veneta', 'lowell', 'dunes city', 'lane'];
          const isLane = laneCities.some(c => loc.includes(c) || titleSnippet.includes(c));
          if (!isLane) return false;
        } else if (p === 'coos_county') {
          const coosCities = ['coos bay', 'north bend', 'coquille', 'bandon', 'powers', 'lakeside', 'myrtle point', 'coos'];
          const isCoos = coosCities.some(c => loc.includes(c) || titleSnippet.includes(c));
          if (!isCoos) return false;
        } else if (p === 'dpa' && !matched.includes('dpa')) return false;
        else if (p === 'zero_down' && !matched.includes('zero') && !matched.includes('0')) return false;
        else if (p === 'usda' && !matched.includes('usda')) return false;
        else if (p === 'fha' && !matched.includes('fha')) return false;
        else if (p === 'buydowns' && !matched.includes('buydown')) return false;
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950/80 px-3 py-2 rounded-xl border border-indigo-500/40 shadow-inner">
              <span className="text-[11px] font-bold text-slate-300">Sweep Target:</span>
              <select
                value={selectedSweepCounty}
                onChange={(e) => setSelectedSweepCounty(e.target.value)}
                className="bg-transparent text-xs text-emerald-300 font-extrabold focus:outline-none cursor-pointer"
              >
                <option value="all_8_counties" className="bg-slate-900 text-white">🌟 All 8 Core Counties (Default)</option>
                <option value="deschutes" className="bg-slate-900 text-white">🏔️ Deschutes County (Bend, Redmond, Sisters)</option>
                <option value="marion" className="bg-slate-900 text-white">🏛️ Marion County (Salem, Keizer, Silverton)</option>
                <option value="benton" className="bg-slate-900 text-white">🔬 Benton County (Corvallis, Philomath)</option>
                <option value="linn" className="bg-slate-900 text-white">🌾 Linn County (Albany, Lebanon, Sweet Home)</option>
                <option value="clackamas" className="bg-slate-900 text-white">🌲 Clackamas County (Lake Oswego, Oregon City)</option>
                <option value="douglas" className="bg-slate-900 text-white">🌲 Douglas County (Roseburg, Sutherlin)</option>
                <option value="lane" className="bg-slate-900 text-white">🌲 Lane County (Eugene, Springfield, Florence)</option>
                <option value="coos" className="bg-slate-900 text-white">🌊 Coos County (Coos Bay, North Bend, Bandon)</option>
              </select>
            </div>

            <button
              onClick={() => setShowOutreachHistoryModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Outreach Tracker ({outreachHistory.length})</span>
            </button>
            <button
              onClick={() => setShowScrapeAnalyticsModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs shadow-lg transition cursor-pointer"
            >
              <BrainCircuit className="w-4 h-4" />
              <span>Scrape Analytics</span>
            </button>
            <button
              onClick={handleRunManualSweep}
              disabled={isSweeping}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-extrabold text-xs shadow-lg transition cursor-pointer disabled:opacity-50"
            >
              <Zap className={`w-4 h-4 ${isSweeping ? 'animate-spin' : ''}`} />
              <span>{isSweeping ? 'Scanning Target County...' : 'Run Sweep Now'}</span>
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

      {/* Source Performance Summary Card */}
      {(() => {
        const activeLeads = leads.filter(l => !l.isFilteredOut);
        
        const statsMap: Record<string, { total: number; highIntentSum: number; intentSum: number }> = {};
        activeLeads.forEach(l => {
          const key = l.platform.includes('Reddit') ? 'Reddit Communities' : l.platform.includes('Discord') || l.sourceType === 'chat_board' ? 'Housing Chat Boards & Discord' : 'Curated Real Estate Blogs';
          if (!statsMap[key]) statsMap[key] = { total: 0, highIntentSum: 0, intentSum: 0 };
          statsMap[key].total += 1;
          statsMap[key].intentSum += l.intentScore;
          if (l.intentScore >= 90) statsMap[key].highIntentSum += 1;
        });

        const sources = Object.entries(statsMap).map(([name, data]) => ({
          name,
          total: data.total,
          highIntent: data.highIntentSum,
          avgIntent: Math.round(data.intentSum / (data.total || 1))
        })).sort((a, b) => b.total - a.total);

        return (
          <div className="rounded-2xl bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 p-5 shadow-lg space-y-4 animate-in fade-in">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">📊 Intelligence Analytics</span>
                <h3 className="text-white font-bold text-sm">Source Performance &amp; High-Intent Yield</h3>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                🔥 Top Yielding: {sources[0]?.name || 'Reddit'} ({sources[0]?.total || 0} active leads)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sources.map((src, idx) => (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 truncate">{src.name}</span>
                    <span className="text-xs font-mono font-black text-emerald-400">{src.total} Leads</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Avg Intent Score:</span>
                      <strong className="text-slate-200">{src.avgIntent}%</strong>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${src.avgIntent}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-900">
                    <span>🔥 High-Intent (&gt;90%):</span>
                    <strong className="text-emerald-300 font-mono">{src.highIntent} leads</strong>
                  </div>
                </div>
              ))}
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
            <button
              onClick={() => setShowRawResults(!showRawResults)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                showRawResults
                  ? 'bg-purple-600 text-white shadow-md font-extrabold'
                  : 'bg-slate-800 text-purple-300 hover:bg-slate-700 border border-purple-500/30'
              }`}
            >
              <span>🔬 Show Raw Results ({leads.length} Scraped)</span>
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
              <option value="all">All Mortgage Programs &amp; Counties</option>
              <option value="lane_county">🌲 Lane County (Eugene, Springfield, Florence, etc.)</option>
              <option value="coos_county">🌊 Coos County (Coos Bay, North Bend, Bandon, etc.)</option>
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

              {lead.isFilteredOut && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-purple-950/40 border border-purple-500/40 text-purple-200 text-xs">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-extrabold text-purple-400">🛡️ Guardrail Filter:</span>
                    <span className="truncate">{lead.filterReason || 'Filtered out by automated criteria'}</span>
                  </div>
                  <button
                    onClick={() => handlePromoteFilteredLead(lead.id)}
                    type="button"
                    className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-extrabold transition shadow shrink-0 cursor-pointer whitespace-nowrap"
                  >
                    Override &amp; Promote
                  </button>
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

      {/* Scrape Analytics & Hybrid 2nd Brain Logic Modal */}
      {showScrapeAnalyticsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-3xl rounded-2xl bg-slate-900 border border-purple-500/40 p-6 shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">
                  Hybrid 2nd Brain Architecture &amp; Scrape Transparency
                </span>
                <h3 className="text-white font-bold text-lg leading-snug mt-0.5 flex items-center gap-2">
                  <BrainCircuit className="w-5 h-5 text-purple-400" />
                  <span>Scrape Analytics &amp; Execution Distribution</span>
                </h3>
              </div>
              <button
                onClick={() => setShowScrapeAnalyticsModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto pr-1 flex-1">
              {/* Scrape Execution Mode Settings Toggle */}
              <div className="p-4 rounded-xl bg-slate-950 border border-purple-500/30 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">⚙️ Sweep Execution Mode Control</span>
                    <h4 className="text-white font-bold text-sm">Active Scrape Strategy &amp; Model Configuration</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[11px] font-mono font-bold">
                    Mode: {sweepMode === 'hybrid' ? 'Hybrid (Auto-Balanced)' : sweepMode === 'gemini_only' ? 'Gemini-Only' : 'DeepSeek-Only'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={() => setSweepMode('hybrid')}
                    type="button"
                    className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1 ${
                      sweepMode === 'hybrid'
                        ? 'bg-purple-600/20 border-purple-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>⚡ Hybrid (Auto-Balanced)</span>
                      {sweepMode === 'hybrid' && <CheckCircle2 className="w-3.5 h-3.5 text-purple-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400">Gemini sensory ingestion + DeepSeek motor audit.</p>
                  </button>

                  <button
                    onClick={() => setSweepMode('gemini_only')}
                    type="button"
                    className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1 ${
                      sweepMode === 'gemini_only'
                        ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>🤖 Gemini-Only Sweep</span>
                      {sweepMode === 'gemini_only' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400">Pure Gemini 3.0 SDK grounding &amp; NLP scoring.</p>
                  </button>

                  <button
                    onClick={() => setSweepMode('deepseek_only')}
                    type="button"
                    className={`p-3 rounded-xl border text-left transition cursor-pointer space-y-1 ${
                      sweepMode === 'deepseek_only'
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>🧠 DeepSeek-Only Sweep</span>
                      {sweepMode === 'deepseek_only' && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400">Pure DeepSeek harness swarm listing audit.</p>
                  </button>
                </div>
              </div>

              {/* Summary Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">📡 Total Raw Ingestion</span>
                  <div className="text-2xl font-black text-white font-mono">49 Items</div>
                  <p className="text-[11px] text-slate-400">Scanned across 8 Oregon counties &amp; 35+ cities</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">✨ Qualified Active Leads</span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">27 Leads</div>
                  <p className="text-[11px] text-slate-400">High-intent first-time buyers &amp; DPA prospects</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400">🛡️ Guardrail Filtered</span>
                  <div className="text-2xl font-black text-purple-300 font-mono">22 Items</div>
                  <p className="text-[11px] text-slate-400">Archived or inspectable via Raw Results</p>
                </div>
              </div>

              {/* Hybrid 2nd Brain Distribution Breakdown */}
              <div className="space-y-3">
                <h4 className="text-white font-bold text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Hybrid 2nd Brain Model Distribution &amp; Task Allocation</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Gemini Side */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-300 uppercase tracking-wide">🤖 Gemini (Sensory &amp; Grounding)</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">100% Ingestion</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Live Web &amp; Social Grounding:</strong> Executed searches across Reddit (r/Portland, r/Eugene, r/Bend, r/Salem), regional real estate forums, and housing chat boards.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Multi-County NLP Sweep:</strong> Scanned Deschutes, Marion, Benton, Linn, Clackamas, Douglas, Lane, and Coos counties for USDA rural zero-down and OHCS DPA discussions.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span><strong>Intent &amp; Sentiment Scorer:</strong> Classified urgency, extracted buyer demographics, and assigned intent scores (0-100%).</span>
                      </li>
                    </ul>
                  </div>

                  {/* DeepSeek Side */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-purple-300 uppercase tracking-wide">🧠 DeepSeek (Motor &amp; Harness Swarm)</span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">100% Pipeline &amp; Audit</span>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span><strong>Listing &amp; Property Audits:</strong> Ran automated swarms to verify price deltas and zero-down eligibility across active GeoMap inventory.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span><strong>Pipeline Synchronization:</strong> Managed state transitions (New → Contacted → Saved → Archived) and staleness decay timers.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-400 font-bold">•</span>
                        <span><strong>Outreach Draft Generation:</strong> Synthesized custom SMS and email templates tailored to each borrower's county and loan program.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Per-County Hybrid Processing & Success Rate Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>Per-County Hybrid Scrape Execution &amp; Success Rate Breakdown</span>
                  </h4>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/30">
                    Gemini Sensory vs. DeepSeek Motor
                  </span>
                </div>

                <div className="space-y-3">
                  {[
                    { county: 'Lane County (Eugene, Springfield, Florence)', ingested: 10, qualified: 7, successRate: 94, topProgram: 'USDA & OHCS DPA' },
                    { county: 'Coos County (Coos Bay, Bandon, North Bend)', ingested: 8, qualified: 6, successRate: 91, topProgram: 'USDA Zero-Down' },
                    { county: 'Deschutes County (Bend, Redmond, Sisters)', ingested: 9, qualified: 5, successRate: 88, topProgram: 'FHA & Buydowns' },
                    { county: 'Marion County (Salem, Keizer, Silverton)', ingested: 7, qualified: 4, successRate: 86, topProgram: 'OHCS DPA' },
                    { county: 'Clackamas County (Lake Oswego, Oregon City)', ingested: 6, qualified: 3, successRate: 83, topProgram: 'Conventional 3%' },
                    { county: 'Benton, Linn & Douglas Counties', ingested: 9, qualified: 2, successRate: 79, topProgram: 'USDA Rural Housing' },
                  ].map((row, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{row.county}</span>
                        <div className="flex items-center gap-3 font-mono text-[11px]">
                          <span className="text-blue-400">Ingested: {row.ingested}</span>
                          <span className="text-emerald-400">Qualified: {row.qualified}</span>
                          <span className="text-purple-300 font-bold">Success: {row.successRate}%</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden flex">
                          <div
                            className="h-full bg-emerald-500 rounded-l-full transition-all duration-500"
                            style={{ width: `${row.successRate}%` }}
                            title={`Gemini Success Rate: ${row.successRate}%`}
                          />
                          <div
                            className="h-full bg-purple-500 rounded-r-full transition-all duration-500"
                            style={{ width: `${100 - row.successRate}%` }}
                            title={`Guardrail Filtered / Optimized`}
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                        <span>🔥 Top Yielding Program: <strong className="text-emerald-300">{row.topProgram}</strong></span>
                        <span>Gemini 🤖 (Ingestion) + DeepSeek 🧠 (Motor)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guardrail Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h5 className="text-white font-bold text-xs">🛡️ Automated Guardrail Filter Breakdown (22 Filtered Items)</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-purple-400">1 Item</div>
                    <div>Out of State / WA Market</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-purple-400">1 Item</div>
                    <div>Commercial Real Estate</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-purple-400">1 Item</div>
                    <div>Low Intent Score (&lt;75)</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <div className="font-bold text-purple-400">19 Items</div>
                    <div>Closed / Vendor / Classifieds</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-800 shrink-0">
              <button
                onClick={() => setShowScrapeAnalyticsModal(false)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition cursor-pointer"
              >
                Close Analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
