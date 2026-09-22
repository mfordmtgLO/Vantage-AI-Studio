import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  DollarSign, 
  FileText, 
  Layers, 
  Megaphone, 
  Brain, 
  CheckCircle2, 
  ShieldCheck,
  Building2,
  Mail,
  Calendar,
  Search,
  Share2,
  Globe,
  MessageSquare,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  TrendingUp,
  Tag
} from 'lucide-react';
import { 
  COMMERCIAL_SALES_PITCH_DECK_MARKDOWN,
  COMMERCIAL_PRICING_TIERS,
  PROFESSIONAL_SERVICES_ADDONS,
  SUITE_MODULE_PITCHES,
  STACKED_SUPERPOWERS,
  WORKSPACE_UI_DEEP_DIVE,
  SOCIAL_MEDIA_CAMPAIGNS,
  FACEBOOK_META_ADS,
  GOOGLE_ADS_CAMPAIGNS,
  WEBSITE_SHORT_HOOKS,
  COLD_OUTBOUND_EMAIL_TEMPLATES,
  EXECUTIVE_MASTER_HOOK
} from '../data/commercialSalesPitchDeck';
import { ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';

interface CommercialPitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLicenseStudio?: () => void;
  onOpenSalesAssistant?: () => void;
}

type TabType = 
  | 'overview' 
  | 'workspace_ui' 
  | 'pricing' 
  | 'modules' 
  | 'superpowers' 
  | 'social_media' 
  | 'meta_ads' 
  | 'google_ads' 
  | 'website_hooks' 
  | 'cold_emails' 
  | 'full_markdown';

export const CommercialPitchDeckModal: React.FC<CommercialPitchDeckModalProps> = ({
  isOpen,
  onClose,
  onOpenLicenseStudio,
  onOpenSalesAssistant
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('workspace_ui');
  const [selectedAdId, setSelectedAdId] = useState<string>('meta_executive_pain');
  const [selectedSocialId, setSelectedSocialId] = useState<string>('linkedin_tab_fatigue');
  const [selectedGoogleCampaignId, setSelectedGoogleCampaignId] = useState<string>('google_workspace_ai_search');
  const [selectedHookCategory, setSelectedHookCategory] = useState<string>('All');
  const [copiedState, setCopiedState] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedState(label);
    setTimeout(() => setCopiedState(null), 2500);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([COMMERCIAL_SALES_PITCH_DECK_MARKDOWN], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'VANTAGE_AI_WORKSPACE_SUITE_SALES_PITCH_DECK.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentModule = SUITE_MODULE_PITCHES.find(m => m.id === selectedModuleId) || SUITE_MODULE_PITCHES[0];
  const currentAd = FACEBOOK_META_ADS.find(a => a.id === selectedAdId) || FACEBOOK_META_ADS[0];
  const currentSocial = SOCIAL_MEDIA_CAMPAIGNS.find(s => s.id === selectedSocialId) || SOCIAL_MEDIA_CAMPAIGNS[0];
  const currentGoogleCampaign = GOOGLE_ADS_CAMPAIGNS.find(g => g.id === selectedGoogleCampaignId) || GOOGLE_ADS_CAMPAIGNS[0];

  const filteredHookCategories = WEBSITE_SHORT_HOOKS.filter(cat => 
    selectedHookCategory === 'All' || cat.category === selectedHookCategory
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/90 dark:bg-slate-800/80 backdrop-blur-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Vantage AI Workspace Suite & UI Pitch Deck + Ad Vault
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Master Commercial Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Author & Copyright Holder: <span className="font-semibold text-slate-700 dark:text-slate-300">{ADMIN_PRIMARY_NAME}</span> ({ADMIN_PRIMARY_EMAIL}) • SHA256-MF Anti-Tamper Protected
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(COMMERCIAL_SALES_PITCH_DECK_MARKDOWN, 'full_deck')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Copy Entire Pitch Deck Markdown"
            >
              {copiedState === 'full_deck' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600 font-bold">Copied Full Deck!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Markdown</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-md shadow-indigo-500/20"
              title="Download Commercial Deck Markdown File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .md</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-semibold scrollbar-none">
          {[
            { id: 'overview', label: '1. Executive Hook', icon: Sparkles },
            { id: 'workspace_ui', label: '2. Workspace UI Pitch', icon: Globe },
            { id: 'pricing', label: '3. Pricing & Add-ons', icon: DollarSign },
            { id: 'modules', label: '4. Modules 1–4', icon: Layers },
            { id: 'superpowers', label: '5. 4-in-1 Superpowers', icon: Brain },
            { id: 'social_media', label: '6. Social Media Posts', icon: Share2 },
            { id: 'meta_ads', label: '7. Facebook & Meta Ads', icon: Megaphone },
            { id: 'google_ads', label: '8. Google Ads Campaigns', icon: Search },
            { id: 'website_hooks', label: '9. Website Short Hooks', icon: Tag },
            { id: 'cold_emails', label: '10. Cold Email Sequences', icon: Mail },
            { id: 'full_markdown', label: '11. Master Markdown (.md)', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/60 dark:bg-slate-950/50">
          
          {/* TAB 1: OVERVIEW & EXECUTIVE HOOK */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 rounded-2xl p-6 text-white border border-indigo-800/50 shadow-xl relative overflow-hidden">
                <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="relative z-10 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Commercial Retail Software Suite Master Reference
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    Transforming Stateless AI into an Autonomous Business Operating System
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                    Commercial marketing copy, ad hooks, individual module pitches, multi-module stacked benefits, and turnkey domain-locked licensing architectures for modern AI founders, real estate leaders, and executives.
                  </p>
                </div>
              </div>

              {/* The Big Problem & Solution Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/60 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                    <X className="w-4 h-4" />
                    <span>The Big Problem: Goldfish Amnesia & The 14-Tab Nightmare</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {EXECUTIVE_MASTER_HOOK.problem}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-950/60 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>The Vantage AI Solution: Autonomous Connected Hub</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {EXECUTIVE_MASTER_HOOK.solution}
                  </p>
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Suite Architecture at a Glance
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {SUITE_MODULE_PITCHES.map(mod => (
                    <div 
                      key={mod.id}
                      onClick={() => {
                        setSelectedModuleId(mod.id);
                        setActiveTab('modules');
                      }}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-slate-50 dark:bg-slate-800/50 cursor-pointer transition group"
                    >
                      <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 block group-hover:underline">
                        {mod.title.split(':')[0]}
                      </span>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 line-clamp-1">
                        {mod.title.split(':')[1]}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                        {mod.hook}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: VANTAGE AI WORKSPACE UI DEEP-DIVE */}
          {activeTab === 'workspace_ui' && (
            <div className="space-y-6">
              {/* Header Hero */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white border border-blue-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    Flagship Module Deep-Dive
                  </span>
                  <button
                    onClick={() => handleCopy(`### ${WORKSPACE_UI_DEEP_DIVE.title}\n\n**Tagline**: ${WORKSPACE_UI_DEEP_DIVE.tagline}\n\n**Overview**:\n${WORKSPACE_UI_DEEP_DIVE.overview}\n\n**Core Pillars**:\n${WORKSPACE_UI_DEEP_DIVE.corePillars.map(p => `- **${p.title}** (${p.subtitle}): ${p.description}`).join('\n')}`, 'workspace_ui_pitch')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedState === 'workspace_ui_pitch' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Pitch</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Workspace UI Pitch</span>
                      </>
                    )}
                  </button>
                </div>
                <h2 className="text-lg sm:text-xl font-black text-white">
                  {WORKSPACE_UI_DEEP_DIVE.title}
                </h2>
                <p className="text-sm text-blue-200 font-medium">
                  "{WORKSPACE_UI_DEEP_DIVE.tagline}"
                </p>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl pt-2">
                  {WORKSPACE_UI_DEEP_DIVE.overview}
                </p>
              </div>

              {/* Metric Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WORKSPACE_UI_DEEP_DIVE.timeSavingsMetrics.map((item, idx) => (
                  <div key={idx} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-1 shadow-xs">
                    <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 block">
                      {item.metric}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight block">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* The 5 Core Pillars */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  The 5 Core Pillars of Vantage AI Workspace UI
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {WORKSPACE_UI_DEEP_DIVE.corePillars.map((pillar, idx) => (
                    <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-xs font-black flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {pillar.title.replace(/^\d+\.\s*/, '')}
                        </h5>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 block">
                        {pillar.subtitle}
                      </span>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                        {pillar.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICING & PROFESSIONAL ADDONS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Recommended Commercial Subscription & Perpetual Buyout Tiers
                </h3>
                <p className="text-xs text-slate-500">
                  Engineered for high-margin MRR or instant digital download sales on Gumroad, Etsy, and GitHub.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {COMMERCIAL_PRICING_TIERS.map(tier => (
                  <div
                    key={tier.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between shadow-xs relative"
                  >
                    {tier.badge && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-indigo-600 text-white shadow-xs">
                        {tier.badge}
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {tier.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                          {tier.idealCustomer}
                        </p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl space-y-1">
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100 block">
                          {tier.priceMonthly}
                        </span>
                        <span className="text-[11px] text-slate-500 block">
                          {tier.priceYearly}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Deliverables & Rights:
                        </span>
                        <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                          {tier.deliverables.map((deliv, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                              <span className="text-[11px] leading-tight">{deliv}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(`### ${tier.name}\n- Price: ${tier.priceMonthly} (${tier.priceYearly})\n- Target: ${tier.idealCustomer}\n- Includes:\n${tier.deliverables.map(d => `  - ${d}`).join('\n')}`, tier.id)}
                      className="mt-4 w-full py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition cursor-pointer"
                    >
                      {copiedState === tier.id ? 'Copied Tier!' : 'Copy Pricing Tier'}
                    </button>
                  </div>
                ))}
              </div>

              {/* Professional Services Addons */}
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                      High-Value Professional Services & Recurring Add-Ons
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Standardized flat-fee implementation, team onboarding series, and persistence learning subscriptions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {PROFESSIONAL_SERVICES_ADDONS.map(addon => (
                    <div key={addon.id} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {addon.name}
                        </span>
                      </div>
                      <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 block">
                        {addon.price}
                      </span>
                      <ul className="space-y-1 text-[11px] text-slate-600 dark:text-slate-300 pt-1">
                        {addon.deliverables.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1">
                            <span className="text-indigo-600 dark:text-indigo-400">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MODULES 1-4 DETAILED PITCHES */}
          {activeTab === 'modules' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SUITE_MODULE_PITCHES.map(mod => (
                  <button
                    key={mod.id}
                    onClick={() => setSelectedModuleId(mod.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      selectedModuleId === mod.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {mod.title.split(':')[0]}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider">
                      Turnkey Plugin Architecture
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {currentModule.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(`### ${currentModule.title}\n\n**Hook**: "${currentModule.hook}"\n\n**Summary**:\n${currentModule.summary}\n\n**Core Capabilities**:\n${currentModule.coreCapabilities.map(c => `- ${c}`).join('\n')}\n\n**Stacked Benefits**:\n${currentModule.stackedBenefits.map(s => `- **Stack With ${s.target}**: ${s.headline} - ${s.description}`).join('\n')}`, currentModule.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    {copiedState === currentModule.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied Pitch</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Module Pitch</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
                  <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300 tracking-wider block">
                    High-Converting Ad Hook
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-indigo-950 dark:text-indigo-100 mt-1">
                    "{currentModule.hook}"
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Core Capabilities:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {currentModule.coreCapabilities.map((cap, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                        <span className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                    Power-User Stacked Synergy Benefits:
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentModule.stackedBenefits.map((stack, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-700 dark:text-indigo-300">
                          + Pair with {stack.target}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {stack.headline}
                        </h5>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                          {stack.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 4-IN-1 STACKED SUPERPOWERS */}
          {activeTab === 'superpowers' && (
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white border border-indigo-800/60 space-y-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                  The Full Cognitive Feedback Loop
                </span>
                <h3 className="text-lg font-black text-white">
                  Why Customers Buy the Complete 4-in-1 Vantage AI Suite
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                  Individual plugins solve specific pain points, but the interconnected Combo Pack creates an autonomous self-reinforcing flywheel that captures leads, automates workflows, and maintains clean data without human babysitting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STACKED_SUPERPOWERS.map((superpower, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                      {idx + 1}
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {superpower.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {superpower.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SOCIAL MEDIA POSTS */}
          {activeTab === 'social_media' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {SOCIAL_MEDIA_CAMPAIGNS.map(post => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedSocialId(post.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      selectedSocialId === post.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {post.platform}: {post.title.split('(')[0]}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800 inline-block">
                      {currentSocial.platform}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {currentSocial.title}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(`${currentSocial.hook}\n\n${currentSocial.content}\n\n${currentSocial.hashtags.join(' ')}\n\n${currentSocial.callToAction}`, currentSocial.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    {copiedState === currentSocial.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied Post</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Post Content</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Opening Hook
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                    "{currentSocial.hook}"
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
                  {currentSocial.content}
                </div>

                <div className="flex items-center justify-between gap-2 flex-wrap text-xs pt-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentSocial.hashtags.map((tag, idx) => (
                      <span key={idx} className="text-indigo-600 dark:text-indigo-400 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-slate-500 font-medium italic">
                    CTA: {currentSocial.callToAction}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: FACEBOOK & META ADS */}
          {activeTab === 'meta_ads' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {FACEBOOK_META_ADS.map(ad => (
                  <button
                    key={ad.id}
                    onClick={() => setSelectedAdId(ad.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      selectedAdId === ad.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {ad.name.split(':')[0]}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider">
                      Target Channel: {currentAd.channel}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {currentAd.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Audience: <span className="text-slate-700 dark:text-slate-300 font-medium">{currentAd.targetAudience}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(`### ${currentAd.name} (${currentAd.channel})\n**Audience**: ${currentAd.targetAudience}\n\n**Headline**: "${currentAd.headline}"\n\n**Body Copy**:\n${currentAd.bodyCopy}\n\n**CTA**: "${currentAd.cta}"\n\n**Creative Notes**: ${currentAd.creativeNotes}`, currentAd.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    {copiedState === currentAd.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied Ad</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Meta Ad</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    High-Converting Headline
                  </span>
                  <p className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    "{currentAd.headline}"
                  </p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">
                    Primary Body Copy
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {currentAd.bodyCopy}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                    <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider block">
                      Call To Action (CTA) Button
                    </span>
                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                      "{currentAd.cta}"
                    </p>
                  </div>

                  {currentAd.creativeNotes && (
                    <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60">
                      <span className="text-[10px] font-bold uppercase text-indigo-700 dark:text-indigo-300 tracking-wider block">
                        Visual & Creative Angle Notes
                      </span>
                      <p className="text-[11px] text-indigo-950 dark:text-indigo-200 mt-0.5">
                        {currentAd.creativeNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: GOOGLE ADS SEARCH CAMPAIGNS */}
          {activeTab === 'google_ads' && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {GOOGLE_ADS_CAMPAIGNS.map(camp => (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedGoogleCampaignId(camp.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                      selectedGoogleCampaignId === camp.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {camp.campaignName.split(':')[0]}
                  </button>
                ))}
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-5 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider">
                      Google Search Ads Campaign Matrix
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                      {currentGoogleCampaign.campaignName}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(`### ${currentGoogleCampaign.campaignName}\n\n**Keywords**:\n${currentGoogleCampaign.targetKeywords.map(k => `- ${k}`).join('\n')}\n\n**Headlines**:\n${currentGoogleCampaign.headlines.map(h => `- ${h}`).join('\n')}\n\n**Descriptions**:\n${currentGoogleCampaign.descriptions.map(d => `- ${d}`).join('\n')}\n\n**Sitelinks**:\n${currentGoogleCampaign.sitelinks.map(s => `- ${s.title}: ${s.desc}`).join('\n')}\n\n**Callouts**:\n${currentGoogleCampaign.callouts.join(', ')}`, currentGoogleCampaign.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0"
                  >
                    {copiedState === currentGoogleCampaign.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copied Google Ad</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Campaign Assets</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Target Keywords */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                    High-Intent Target Keywords
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {currentGoogleCampaign.targetKeywords.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Headlines & Descriptions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
                      Headline Assets (30 char limit)
                    </span>
                    <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                      {currentGoogleCampaign.headlines.map((h, idx) => (
                        <li key={idx} className="flex items-center justify-between py-0.5 border-b border-slate-200/40 dark:border-slate-800">
                          <span className="font-semibold">{h}</span>
                          <span className="text-[10px] text-slate-400">{h.length} chars</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider block">
                      Description Lines (90 char limit)
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {currentGoogleCampaign.descriptions.map((d, idx) => (
                        <li key={idx} className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <p className="leading-tight">{d}</p>
                          <span className="text-[10px] text-slate-400 block mt-1">{d.length} / 90 chars</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Sitelinks & Callout Extensions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                      Sitelink Extensions
                    </span>
                    <div className="space-y-2">
                      {currentGoogleCampaign.sitelinks.map((site, idx) => (
                        <div key={idx} className="text-xs">
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 block">{site.title}</span>
                          <span className="text-slate-500 text-[11px]">{site.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-2">
                    <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider block">
                      Callout Extensions
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {currentGoogleCampaign.callouts.map((callout, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          {callout}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: WEBSITE SHORT HOOKS */}
          {activeTab === 'website_hooks' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {['All', ...WEBSITE_SHORT_HOOKS.map(c => c.category)].map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedHookCategory(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition whitespace-nowrap cursor-pointer ${
                        selectedHookCategory === cat
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => handleCopy(WEBSITE_SHORT_HOOKS.map(c => `## ${c.category}\n${c.hooks.map(h => `- **${h.headline}**\n  _${h.subheadline}_ (${h.targetAudience})`).join('\n')}`).join('\n\n'), 'all_hooks')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  {copiedState === 'all_hooks' ? 'Copied All Hooks!' : 'Copy All Short Hooks'}
                </button>
              </div>

              <div className="space-y-5">
                {filteredHookCategories.map((cat, idx) => (
                  <div key={idx} className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      {cat.category}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {cat.hooks.map((hook, hIdx) => (
                        <div key={hIdx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-xs relative">
                          <div className="flex items-center justify-between">
                            {hook.badge && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900">
                                {hook.badge}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">
                              For: {hook.targetAudience}
                            </span>
                          </div>

                          <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                            "{hook.headline}"
                          </h5>

                          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                            {hook.subheadline}
                          </p>

                          <button
                            onClick={() => handleCopy(`Headline: "${hook.headline}"\nSub-headline: "${hook.subheadline}"`, `${cat.category}_${hIdx}`)}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer pt-1"
                          >
                            {copiedState === `${cat.category}_${hIdx}` ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>Copied Hook</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy Hook</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 10: COLD EMAIL SEQUENCES */}
          {activeTab === 'cold_emails' && (
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Ready-to-Send Outbound Cold Email Sequences
                </h3>
                <p className="text-xs text-slate-500">
                  Short, high-response outreach scripts designed to book 3-minute executive demos.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {COLD_OUTBOUND_EMAIL_TEMPLATES.map(email => (
                  <div key={email.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
                        Target: {email.target}
                      </span>
                      <button
                        onClick={() => handleCopy(`Subject: ${email.subject}\n\n${email.body}`, email.id)}
                        className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                      >
                        {copiedState === email.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Email</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
                      <span className="text-slate-400 font-mono">Subject: </span>
                      <span className="font-semibold text-slate-900 dark:text-slate-100">{email.subject}</span>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed shadow-inner border border-slate-800">
                      {email.body}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 11: FULL MASTER MARKDOWN */}
          {activeTab === 'full_markdown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  File Reference: <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-[11px]">/src/data/commercialSalesPitchDeck.ts</code>
                </span>
                <button
                  onClick={() => handleCopy(COMMERCIAL_SALES_PITCH_DECK_MARKDOWN, 'full_tab')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
                >
                  {copiedState === 'full_tab' ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy All Markdown</span>
                    </>
                  )}
                </button>
              </div>

              <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-[58vh] leading-relaxed shadow-inner">
                <pre className="whitespace-pre-wrap">{COMMERCIAL_SALES_PITCH_DECK_MARKDOWN}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span>Official Commercial Pitch Deck Reference • Mike Ford (<span className="text-slate-700 dark:text-slate-300 font-medium">{ADMIN_PRIMARY_EMAIL}</span>)</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSalesAssistant && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSalesAssistant();
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-semibold transition cursor-pointer"
              >
                Open Copywriting Studio
              </button>
            )}

            {onOpenLicenseStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenLicenseStudio();
                }}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-xl font-semibold transition cursor-pointer"
              >
                Issue Domain License
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
