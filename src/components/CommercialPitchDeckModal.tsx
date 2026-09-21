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
  Home, 
  Mic, 
  Table, 
  CheckCircle2, 
  ExternalLink,
  ShieldCheck,
  Building2,
  ChevronRight
} from 'lucide-react';
import { 
  COMMERCIAL_SALES_PITCH_DECK_MARKDOWN,
  COMMERCIAL_PRICING_TIERS,
  SUITE_MODULE_PITCHES,
  STACKED_SUPERPOWERS,
  AD_CAMPAIGN_ANGLES,
  EXECUTIVE_MASTER_HOOK
} from '../data/commercialSalesPitchDeck';
import { ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';

interface CommercialPitchDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLicenseStudio?: () => void;
  onOpenSalesAssistant?: () => void;
}

export const CommercialPitchDeckModal: React.FC<CommercialPitchDeckModalProps> = ({
  isOpen,
  onClose,
  onOpenLicenseStudio,
  onOpenSalesAssistant
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'modules' | 'superpowers' | 'ads' | 'full_markdown'>('overview');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('real_estate_geo');
  const [selectedAdId, setSelectedAdId] = useState<string>('real_estate_agents');
  const [copiedState, setCopiedState] = useState<string | null>(null);

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
    a.download = 'COMMERCIAL_RETAIL_SOFTWARE_SUITE_SALES_PITCH_DECK.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  const currentModule = SUITE_MODULE_PITCHES.find(m => m.id === selectedModuleId) || SUITE_MODULE_PITCHES[0];
  const currentAd = AD_CAMPAIGN_ANGLES.find(a => a.id === selectedAdId) || AD_CAMPAIGN_ANGLES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-inner">
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Commercial Retail Software Suite Sales Pitch Deck
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Master Reference
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: '1. Executive Model & Core Hook', icon: Sparkles },
            { id: 'pricing', label: 'Pricing & Licensing Tiers', icon: DollarSign },
            { id: 'modules', label: 'Modules 1–4 Detailed Pitches', icon: Layers },
            { id: 'superpowers', label: '4-in-1 Stacked Superpowers', icon: Brain },
            { id: 'ads', label: 'Ad Campaigns & Copy', icon: Megaphone },
            { id: 'full_markdown', label: 'Full Markdown (.md)', icon: FileText }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl transition whitespace-nowrap cursor-pointer ${
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
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 dark:bg-slate-950/40">
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
                    Transforming Stateless AI into Permanent, Autonomous Business Powerhouses
                  </h2>
                  <p className="text-slate-300 text-sm leading-relaxed max-w-3xl">
                    Commercial marketing copy, ad hooks, individual module pitches, multi-module stacked benefits, and turnkey domain-locked licensing architectures for modern AI founders and agencies.
                  </p>
                </div>
              </div>

              {/* The Big Problem & Solution Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-950/60 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-sm">
                    <X className="w-4 h-4" />
                    <span>The Big Problem: Goldfish Amnesia & Execution Paralysis</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {EXECUTIVE_MASTER_HOOK.problem}
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-950/60 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>The Vantage AI Solution: Autonomous Cognitive Suite</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {EXECUTIVE_MASTER_HOOK.solution}
                  </p>
                </div>
              </div>

              {/* Quick Jump Buttons to Modules & Pricing */}
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

          {/* TAB 2: PRICING & LICENSING TIERS */}
          {activeTab === 'pricing' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Recommended Subscription & Commercial Licensing Models
                  </h3>
                  <p className="text-xs text-slate-500">
                    Engineered for high-margin MRR or instant digital download sales on Gumroad, Etsy, and GitHub.
                  </p>
                </div>
                {onOpenLicenseStudio && (
                  <button
                    onClick={onOpenLicenseStudio}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Open License Key Generator</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {COMMERCIAL_PRICING_TIERS.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition relative ${
                      tier.id === 'enterprise_saas'
                        ? 'border-indigo-400 dark:border-indigo-600 bg-white dark:bg-slate-900 shadow-lg ring-2 ring-indigo-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
                    }`}
                  >
                    {tier.id === 'enterprise_saas' && (
                      <span className="absolute -top-2.5 right-4 px-2 py-0.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider">
                        Most Lucrative
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {tier.name}
                        </h4>
                        <div className="mt-2">
                          <span className="text-xl font-extrabold text-slate-900 dark:text-slate-100">
                            {tier.priceMonthly}
                          </span>
                          <span className="text-[11px] text-slate-500 block">
                            {tier.priceYearly}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Ideal Customer
                        </span>
                        <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                          {tier.idealCustomer}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                          Deliverables & Rights
                        </span>
                        {tier.deliverables.map((d, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                            <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                            <span>{d}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopy(`## ${tier.name}\nPrice: ${tier.priceMonthly} (${tier.priceYearly})\nIdeal For: ${tier.idealCustomer}\n\nDeliverables:\n` + tier.deliverables.map(d => `- ${d}`).join('\n'), tier.id)}
                      className="mt-5 w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      {copiedState === tier.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-600">Copied Tier Info</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Tier Spec</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DETAILED MODULE PITCHES */}
          {activeTab === 'modules' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
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

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-6 shadow-xs">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                      {currentModule.title}
                    </h3>
                    <div className="mt-2 p-3 bg-indigo-50/70 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
                      <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider">
                        Master Marketing Hook
                      </span>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                        "{currentModule.hook}"
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleCopy(`## ${currentModule.title}\n> "${currentModule.hook}"\n\n### What It Does:\n${currentModule.summary}\n\n### Core Capabilities:\n` + currentModule.coreCapabilities.map(c => `- ${c}`).join('\n') + `\n\n### Stacked Benefits:\n` + currentModule.stackedBenefits.map(b => `- Stack with ${b.target}: **${b.headline}** - ${b.description}`).join('\n'), currentModule.id)}
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

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Executive Summary
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {currentModule.summary}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Core Capabilities
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {currentModule.coreCapabilities.map((cap, i) => (
                      <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Power-User Stacked Benefits (Why Pair With the Vantage Suite?)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {currentModule.stackedBenefits.map((benefit, i) => (
                      <div key={i} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-1.5">
                        <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 block tracking-wider">
                          Stack with {benefit.target}
                        </span>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {benefit.headline}
                        </h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                          {benefit.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STACKED SUPERPOWERS */}
          {activeTab === 'superpowers' && (
            <div className="space-y-6">
              <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Brain className="w-4 h-4 text-purple-400" />
                    <span>The Full Cognitive Feedback Loop (Vantage AI Studio-Suite Combo Pack)</span>
                  </h3>
                  <button
                    onClick={() => handleCopy(`## Top 3 Power-User Stacked Superpowers:\n\n` + STACKED_SUPERPOWERS.map(s => `### ${s.title}\n${s.description}`).join('\n\n'), 'superpowers')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    {copiedState === 'superpowers' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied Superpowers</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Superpowers</span>
                      </>
                    )}
                  </button>
                </div>

                {/* ASCII Diagram Card */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
                  <pre>{`[Vantage AI Studio-Voice Orchestrator] 🎙️
         │
         ▼
[Vantage AI Studio-2nd Brain Core] 🧠 ◄──► [Two-Way Cross-Session Persistence]
         │
         ├───────────────────────────────────────────────┐
         ▼                                               ▼
[Vantage AI Studio-Workspace UI] 📂            [Vantage AI Studio-Real Estate GeoMap] 🏡
(Gmail Drafts, Sheets SQL,                     (USDA 0%-Down, CRA Grants,
 Targeted String/Domain Purge)                  Live DTI Affordability Math)
         │                                               │
         └───────────────────────┬───────────────────────┘
                                 ▼
              [Autonomous dsh-cron Background Audits] ⏰`}</pre>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {STACKED_SUPERPOWERS.map((sp, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {sp.title}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {sp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: AD CAMPAIGNS & COPY */}
          {activeTab === 'ads' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {AD_CAMPAIGN_ANGLES.map(ad => (
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
                      Channel: {currentAd.channel}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                      {currentAd.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleCopy(`### ${currentAd.name} (${currentAd.channel})\n\n**Headline**: "${currentAd.headline}"\n\n**Body Copy**:\n"${currentAd.bodyCopy}"\n\n**CTA**: "${currentAd.cta}"`, currentAd.id)}
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
                        <span>Copy Ad Copy</span>
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
                    Body Copy
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    "{currentAd.bodyCopy}"
                  </p>
                </div>

                <div className="space-y-1.5 p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60">
                  <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 tracking-wider">
                    Call To Action (CTA)
                  </span>
                  <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                    "{currentAd.cta}"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FULL MARKDOWN */}
          {activeTab === 'full_markdown' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  File Reference: <code className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-md font-mono text-[11px]">/COMMERCIAL_RETAIL_SOFTWARE_SUITE_SALES_PITCH_DECK.md</code>
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

              <div className="bg-slate-900 text-slate-200 p-5 rounded-2xl border border-slate-800 font-mono text-xs overflow-x-auto max-h-[55vh] leading-relaxed shadow-inner">
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
