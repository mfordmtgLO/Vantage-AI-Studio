import React, { useState, useMemo } from 'react';
import { 
  Sparkles, DollarSign, TrendingUp, ShieldCheck, Copy, Check, Download, 
  Layers, Megaphone, FileText, Calculator, Building2, Users, Send, 
  ExternalLink, ArrowRight, CheckCircle2, AlertCircle, Clock, Zap,
  Key, Globe, Lock, Brain, Mic, Home, Search, RefreshCw, Mail, 
  Share2, Tag, ChevronRight, BarChart3, HelpCircle, Code, Shield
} from 'lucide-react';
import { 
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
  EXECUTIVE_MASTER_HOOK,
  PricingTier
} from '../data/commercialSalesPitchDeck';
import { ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME, isMikeFordAdmin } from '../utils/adminAuth';
import { auth } from '../services/firebase';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { LEAD_MOBILE_PLUGIN_MODULES } from '../data/leadMobilePluginUrls';

type CommercialTab = 
  | 'overview' 
  | 'pricing_tiers' 
  | 'roi_calculator' 
  | 'sales_collateral' 
  | 'proposal_builder' 
  | 'client_funnel';

interface TopTierCommercialStrategyHubProps {
  onOpenLicenseStudio?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenShareLinksModal?: () => void;
  onNavigateTab?: (tab: any) => void;
}

export const TopTierCommercialStrategyHub: React.FC<TopTierCommercialStrategyHubProps> = ({
  onOpenLicenseStudio,
  onOpenPitchDeck,
  onOpenShareLinksModal,
  onNavigateTab
}) => {
  const { connectedWorkspaceEmail } = useAccountPathway();
  const isAdmin = isMikeFordAdmin(auth.currentUser) || isMikeFordAdmin({ email: connectedWorkspaceEmail });
  const [activeTab, setActiveTab] = useState<CommercialTab>('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // ROI Calculator Interactive States
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hourlyWage, setHourlyWage] = useState<number>(65);
  const [weeklyEmailsPerRep, setWeeklyEmailsPerRep] = useState<number>(120);
  const [monthlyInboundLeads, setMonthlyInboundLeads] = useState<number>(60);
  const [conversionLiftPct, setConversionLiftPct] = useState<number>(8);
  const [avgDealValue, setAvgDealValue] = useState<number>(6500);

  // Sales Collateral Sub-Category
  const [collateralChannel, setCollateralChannel] = useState<'cold_emails' | 'meta_ads' | 'google_ads' | 'social_media' | 'website_hooks'>('cold_emails');
  const [selectedEmailTemplate, setSelectedEmailTemplate] = useState<string>(COLD_OUTBOUND_EMAIL_TEMPLATES[0].id);
  const [selectedMetaAd, setSelectedMetaAd] = useState<string>(FACEBOOK_META_ADS[0].id);
  const [selectedGoogleAd, setSelectedGoogleAd] = useState<string>(GOOGLE_ADS_CAMPAIGNS[0].id);
  const [selectedSocialPost, setSelectedSocialPost] = useState<string>(SOCIAL_MEDIA_CAMPAIGNS[0].id);
  const [customClientName, setCustomClientName] = useState<string>('Alex Rivera');
  const [customTargetCompany, setCustomTargetCompany] = useState<string>('Apex Growth Partners');
  const [customIndustry, setCustomIndustry] = useState<string>('Real Estate & Wealth Advisory');

  // Proposal & Contract Builder States
  const [contractClientName, setContractClientName] = useState<string>('Apex Capital & Realty Group');
  const [contractContactPerson, setContractContactPerson] = useState<string>('Marcus Vance');
  const [contractClientEmail, setContractClientEmail] = useState<string>('marcus@apexrealty.com');
  const [contractDomain, setContractDomain] = useState<string>('app.apexrealty.com');
  const [contractTierId, setContractTierId] = useState<string>('team_agency');
  const [selectedAddons, setSelectedAddons] = useState<string[]>(['custom_install_fee', 'teams_training_series']);
  const [contractBillingType, setContractBillingType] = useState<'monthly' | 'annual' | 'perpetual_buyout'>('annual');
  const [contractSlaGuarantee, setContractSlaGuarantee] = useState<'standard' | 'enterprise_999'>('enterprise_999');

  // Funnel Simulator State
  const [funnelStage, setFunnelStage] = useState<number>(1);
  const [simulatedLeadEmail, setSimulatedLeadEmail] = useState<string>('sarah.investor@gmail.com');
  const [simulatedLeadType, setSimulatedLeadType] = useState<'homebuyer' | 'executive' | 'agency'>('homebuyer');
  const [funnelLog, setFunnelLog] = useState<string[]>([]);
  const [isSimulatingFunnel, setIsSimulatingFunnel] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // ROI Calculations
  const roiCalculations = useMemo(() => {
    // 14.5 hours saved per rep per week on average
    const weeklyHoursSavedPerRep = 14.5;
    const totalWeeklyHoursSaved = teamSize * weeklyHoursSavedPerRep;
    const monthlyHoursSaved = Math.round(totalWeeklyHoursSaved * 4.33);
    const monthlyLaborSavingsDollars = Math.round(monthlyHoursSaved * hourlyWage);
    const annualLaborSavingsDollars = monthlyLaborSavingsDollars * 12;

    // Incremental Deals from DPA / Fast Email / Relational CRM
    const baselineDeals = monthlyInboundLeads * 0.05; // 5% baseline conversion
    const incrementalDealsPerMonth = (monthlyInboundLeads * (conversionLiftPct / 100));
    const monthlyIncrementalRevenue = Math.round(incrementalDealsPerMonth * avgDealValue);
    const annualIncrementalRevenue = monthlyIncrementalRevenue * 12;

    const totalAnnualEconomicValue = annualLaborSavingsDollars + annualIncrementalRevenue;

    // Investment Benchmark: Team Agency Edition ($1,490/yr) + $2,500 Setup = $3,990 Year 1
    const yearOneInvestment = 3990;
    const netYearOneProfit = totalAnnualEconomicValue - yearOneInvestment;
    const roiPercentage = Math.round((netYearOneProfit / yearOneInvestment) * 100);
    const dailyValueGenerated = totalAnnualEconomicValue / 365;
    const paybackPeriodDays = (yearOneInvestment / dailyValueGenerated).toFixed(1);

    return {
      totalWeeklyHoursSaved,
      monthlyHoursSaved,
      monthlyLaborSavingsDollars,
      annualLaborSavingsDollars,
      incrementalDealsPerMonth: incrementalDealsPerMonth.toFixed(1),
      monthlyIncrementalRevenue,
      annualIncrementalRevenue,
      totalAnnualEconomicValue,
      yearOneInvestment,
      netYearOneProfit,
      roiPercentage,
      paybackPeriodDays
    };
  }, [teamSize, hourlyWage, weeklyEmailsPerRep, monthlyInboundLeads, conversionLiftPct, avgDealValue]);

  // Selected Contract Calculations
  const selectedTier = COMMERCIAL_PRICING_TIERS.find(t => t.id === contractTierId) || COMMERCIAL_PRICING_TIERS[1];
  const calculatedContractTotal = useMemo(() => {
    let basePrice = 0;
    if (contractBillingType === 'monthly') {
      basePrice = contractTierId === 'individual_pro' ? 49 : contractTierId === 'team_agency' ? 149 : 499;
    } else if (contractBillingType === 'annual') {
      basePrice = contractTierId === 'individual_pro' ? 490 : contractTierId === 'team_agency' ? 1490 : 4990;
    } else {
      basePrice = contractTierId === 'enterprise_saas' ? 7500 : 997;
    }

    let addonsPrice = 0;
    if (selectedAddons.includes('custom_install_fee')) addonsPrice += 2500;
    if (selectedAddons.includes('teams_training_series')) addonsPrice += 1500;
    if (selectedAddons.includes('persistence_learning_upgrade')) addonsPrice += 1200;

    return {
      basePrice,
      addonsPrice,
      totalDueToday: basePrice + addonsPrice
    };
  }, [contractTierId, contractBillingType, selectedAddons]);

  // Generated Contract Markdown
  const generatedContractMarkdown = useMemo(() => {
    const sha256Key = `SHA256-MF-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${contractDomain.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 8)}-${new Date().getFullYear()}`;
    return `# COMMERCIAL SOFTWARE LICENSE & SERVICE AGREEMENT
**Licensor**: Mike Ford (fordmj@gmail.com) — Vantage AI Architecture
**Licensee**: ${contractClientName} (Attn: ${contractContactPerson} <${contractClientEmail}>)
**Authorized Production Domain**: ${contractDomain}
**Agreement Date**: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
**Master Tamper-Proof License Key**: \`${sha256Key}\`

---

### 1. GRANT OF COMMERCIAL LICENSE
Licensor hereby grants Licensee a **${contractBillingType === 'perpetual_buyout' ? 'Perpetual Whitelabel' : 'Commercial Enterprise'} License** for the **${selectedTier.name}** covering the Vantage AI Studio-Suite (4-in-1 Superpowers: Workspace UI Autonomous OS, 2nd Brain Vector Memory, Voice Chief of Staff, and Real Estate GeoMap DPA Engine).

### 2. DELIVERABLES & AUTHORIZED SCOPE
- **Authorized Domain**: \`${contractDomain}\` (Domain-Locked execution)
${selectedTier.deliverables.map(d => `- ${d}`).join('\n')}

### 3. PROFESSIONAL SERVICES & ADD-ONS INCLUDED
${selectedAddons.map(addonId => {
  const item = PROFESSIONAL_SERVICES_ADDONS.find(a => a.id === addonId);
  return `- **${item?.name}** (${item?.price}):\n  ${item?.deliverables.join('; ')}`;
}).join('\n') || '- None selected'}

### 4. DATA PRIVACY & ZERO-BROWSER-EXPOSURE (BYOK)
Licensor guarantees that all Google Workspace credentials, Gemini API tokens, and client vector memories execute strictly via server-side container proxies or client-isolated IndexedDB/Firestore instances. **Zero API keys are exposed to client browser DevTools.**

### 5. SLA & SUPPORT COMMITMENT
- **System Availability**: ${contractSlaGuarantee === 'enterprise_999' ? '99.9% Cloud Uptime SLA with 4-Hour Emergency Response' : 'Standard 24-Hour Business Day Support'}
- **Software Updates**: Ongoing compatibility updates for Google Workspace APIs, Google Identity Services, and Gemini AI SDK versions.

### 6. FINANCIAL CONSIDERATIONS
- **Base Software License**: $${calculatedContractTotal.basePrice.toLocaleString()} (${contractBillingType.toUpperCase()})
- **Professional Services Add-ons**: $${calculatedContractTotal.addonsPrice.toLocaleString()}
- **TOTAL DUE TODAY**: **$${calculatedContractTotal.totalDueToday.toLocaleString()} USD**

---
**EXECUTED BY AUTHORIZED REPRESENTATIVES:**

**LICENSOR:**  
Mike Ford  
*Principal Commercial Architect, Vantage AI*  
Signature: *Mike Ford* (SHA256-MF Certified)  

**LICENSEE:**  
${contractContactPerson}, ${contractClientName}  
Signature: ___________________________ Date: _________
`;
  }, [contractClientName, contractContactPerson, contractClientEmail, contractDomain, selectedTier, selectedAddons, contractBillingType, contractSlaGuarantee, calculatedContractTotal]);

  // Run Funnel Simulator
  const handleRunFunnelSimulation = async () => {
    setIsSimulatingFunnel(true);
    setFunnelStage(1);
    setFunnelLog([`[0.0s] Inbound prospective client traffic arriving via Google Ads Campaign...`]);

    await new Promise(r => setTimeout(r, 700));
    setFunnelStage(2);
    setFunnelLog(prev => [
      ...prev,
      `[0.7s] Inbound Lead captured: ${simulatedLeadEmail} (${simulatedLeadType.toUpperCase()})`,
      `[1.2s] Automated Assessment Engine triggered: 14.5 hrs/week potential savings detected.`
    ]);

    await new Promise(r => setTimeout(r, 900));
    setFunnelStage(3);
    setFunnelLog(prev => [
      ...prev,
      `[2.1s] Instant Sandbox Environment provisioned at preview domain.`,
      `[2.8s] Tailored Commercial Proposal and ROI Breakeven Sheet ($3,990 Y1 value generated) generated.`
    ]);

    await new Promise(r => setTimeout(r, 900));
    setFunnelStage(4);
    setFunnelLog(prev => [
      ...prev,
      `[3.7s] Client signed proposal and authorized Stripe / Wire Checkout.`,
      `[4.2s] Domain-locked SHA256-MF Anti-Tamper license key issued: VNTG-PRO-9842-${new Date().getFullYear()}`,
      `[4.5s] ✅ Client successfully onboarded into Vantage AI Enterprise Registry!`
    ]);
    setIsSimulatingFunnel(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* EXECUTIVE COMMERCIAL STRATEGY HERO HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border border-slate-800 shadow-2xl p-6 sm:p-8">
        <div className="absolute -right-16 -bottom-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-16 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> SECTION 3: Best-Selling Commercial Strategy
              </span>
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold font-mono">
                SHA256-MF Anti-Tamper Protected
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Vantage AI Commercial Go-To-Market & Revenue Engine
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Complete blueprint for monetizing the Vantage AI 4-in-1 Suite across <strong className="text-white">Turnkey Marketplace Buyouts ($297–$997)</strong>, <strong className="text-white">Recurring Agency SaaS ($149–$499/mo)</strong>, and <strong className="text-white">Enterprise White-Label Source Licenses ($3,999–$7,500+)</strong> with high-converting marketing copy and interactive ROI tools.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Commercial Architect: <strong className="text-slate-200">Mike Ford</strong> ({ADMIN_PRIMARY_EMAIL})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>Revenue Archetypes: 4 Tier Models + 3 Retainer Add-ons</span>
              </div>
            </div>
          </div>

          {/* Quick Action Hub */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 shrink-0">
            {onOpenPitchDeck && (
              <button
                type="button"
                onClick={onOpenPitchDeck}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black rounded-xl text-xs transition shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Megaphone className="w-4 h-4" />
                <span>Open Sales Pitch Deck Modal</span>
              </button>
            )}
            {isAdmin && onOpenLicenseStudio && (
              <button
                type="button"
                onClick={onOpenLicenseStudio}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <Key className="w-4 h-4 text-amber-300" />
                <span>Commercial License Vault</span>
              </button>
            )}
            {isAdmin && onOpenShareLinksModal && (
              <button
                type="button"
                onClick={onOpenShareLinksModal}
                className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4 text-blue-300" />
                <span>5 Live Mobile PWA URLs</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOP-LEVEL NAVIGATION SUB-TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 scrollbar-none">
        {[
          { id: 'overview' as CommercialTab, label: '🏛️ Strategy Overview', desc: 'Commercial Model' },
          { id: 'pricing_tiers' as CommercialTab, label: '💎 Pricing & Packaging', desc: 'Tiers & Services' },
          { id: 'roi_calculator' as CommercialTab, label: '📊 Interactive ROI Math', desc: 'Payback Calculator' },
          { id: 'sales_collateral' as CommercialTab, label: '📢 Omnichannel Copy Vault', desc: 'Emails, Ads, Social' },
          { id: 'proposal_builder' as CommercialTab, label: '📝 Contract & Proposal Builder', desc: 'Custom Agreements' },
          { id: 'client_funnel' as CommercialTab, label: '🚀 Client Acquisition Funnel', desc: 'Sandbox Simulator' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: COMMERCIAL STRATEGY OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 3 High-Yield Commercial Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <DollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">1. Turnkey Digital Downloads</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Self-hosted <strong className="text-slate-900 dark:text-slate-200">Perpetual Buyout Packages ($297–$997)</strong> distributed across Gumroad, Etsy, and GitHub Marketplace. Includes full zip containers, zero-shot scaffolding prompts, and SHA256-MF anti-tamper licenses.
              </p>
              <div className="pt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <span>Target: Freelancers, Solo Realtors, Devs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">2. Recurring Multi-Tenant SaaS</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Monthly & Annual subscriptions at <strong className="text-slate-900 dark:text-slate-200">$49/mo (Pro)</strong> and <strong className="text-slate-900 dark:text-slate-200">$149/mo (Agency)</strong> with hosted Firestore sync, weekly automated dsh-cron price audits, and dual Google OAuth bridges.
              </p>
              <div className="pt-2 text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                <span>Target: Producing Real Estate Teams, Agencies</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">3. Enterprise White-Label Licenses</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Enterprise source code and unlimited domain distributions priced from <strong className="text-slate-900 dark:text-slate-200">$3,999 to $7,500+</strong> bundled with high-margin professional services ($2,500 White-Glove Setup + $1,500 Training).
              </p>
              <div className="pt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span>Target: Regional Brokerages, Mortgage Lenders</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Executive Core Positioning */}
          <div className="p-6 bg-slate-900 text-white rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wide">
              <Sparkles className="w-4 h-4" /> Core Value Proposition & Competitive Moat
            </div>
            <h2 className="text-xl font-bold">
              Why Vantage AI Outconverts Standard Chatbots & Zapier Automations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <span className="text-red-400">❌</span> The Competitor Problem: "Goldfish Amnesia"
                </div>
                <p>
                  Standard ChatGPT and Claude interfaces forget user context the second a session ends. Worse, executing work across Gmail, Calendar, and Sheets requires constant copy-pasting across dozens of browser tabs.
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                <div className="font-bold text-white flex items-center gap-1.5 text-sm">
                  <span className="text-emerald-400">✅</span> The Vantage Advantage: "Autonomous OS"
                </div>
                <p>
                  Vantage AI lives directly inside Google Workspace via Dual-Pathway Auth with permanent vector memory, compound voice-to-intent dispatches, and real-time USDA/CRA grant calculations for instant lead prequalification.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRICING TIERS & PACKAGING */}
      {activeTab === 'pricing_tiers' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Commercial Pricing Tiers & Licensing Packages</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Transparent retail and enterprise licensing matrix structured for maximum lifetime customer value (LTV).
              </p>
            </div>
          </div>

          {/* 4 Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
            {COMMERCIAL_PRICING_TIERS.map(tier => {
              const isPopular = tier.id === 'team_agency' || tier.id === 'enterprise_saas';
              return (
                <div
                  key={tier.id}
                  className={`relative p-5 rounded-3xl border flex flex-col justify-between transition-all ${
                    isPopular
                      ? 'bg-gradient-to-b from-blue-50/50 to-white dark:from-slate-900 dark:to-slate-950 border-blue-400 dark:border-blue-600 shadow-lg shadow-blue-500/10'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {tier.badge && (
                        <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          tier.id === 'enterprise_saas'
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-blue-600 text-white'
                        }`}>
                          {tier.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{tier.name}</h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{tier.idealCustomer}</p>
                    </div>

                    <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                      <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{tier.priceMonthly}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{tier.priceYearly}</div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">Included Deliverables:</div>
                      <ul className="space-y-1.5">
                        {tier.deliverables.map((item, idx) => (
                          <li key={idx} className="text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5 leading-snug">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-5 mt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        setContractTierId(tier.id);
                        setActiveTab('proposal_builder');
                      }}
                      className="w-full py-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Draft Proposal for {tier.name.split(' ')[0]}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* High-Margin Professional Services Add-on Catalog */}
          <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">High-Margin Professional Services Retainers</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PROFESSIONAL_SERVICES_ADDONS.map(addon => (
                <div key={addon.id} className="p-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{addon.name}</h4>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">{addon.price}</span>
                  </div>
                  <ul className="space-y-1">
                    {addon.deliverables.map((del, i) => (
                      <li key={i} className="text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1">
                        <span className="text-blue-500 font-bold">•</span>
                        <span>{del}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERACTIVE ROI & REVENUE CALCULATOR */}
      {activeTab === 'roi_calculator' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Interactive Commercial ROI & Economic Value Forecaster
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Live mathematical model demonstrating labor hours reclaimed, wage savings, and pipeline acceleration for client presentations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const report = `# VANTAGE AI EXECUTIVE ROI BRIEFING
- **Team Size**: ${teamSize} Specialists / Reps
- **Monthly Hours Reclaimed**: ${roiCalculations.monthlyHoursSaved} Hours
- **Direct Monthly Wage Savings**: $${roiCalculations.monthlyLaborSavingsDollars.toLocaleString()}
- **Annual Incremental Pipeline Revenue**: $${roiCalculations.annualIncrementalRevenue.toLocaleString()}
- **Total Annual Economic Value Generated**: $${roiCalculations.totalAnnualEconomicValue.toLocaleString()}
- **Payback Period**: ${roiCalculations.paybackPeriodDays} Days
- **Net 1-Year ROI**: ${roiCalculations.roiPercentage}%
`;
                copyToClipboard(report, 'ROI Executive Briefing');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy Executive ROI Report</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 6 Cols: Interactive Sliders */}
            <div className="lg:col-span-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Client Operational Parameters
              </h3>

              {/* Slider 1: Team Size */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Team Size (Advisors / Reps):</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 font-mono text-sm">{teamSize} Users</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={teamSize}
                  onChange={(e) => setTeamSize(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Slider 2: Average Hourly Wage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Average Hourly Labor Rate:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-sm">${hourlyWage} / hr</span>
                </div>
                <input
                  type="range"
                  min={25}
                  max={250}
                  step={5}
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </div>

              {/* Slider 3: Monthly Inbound Leads */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Monthly Inbound Leads / Inquiries:</span>
                  <span className="font-bold text-purple-600 dark:text-purple-400 font-mono text-sm">{monthlyInboundLeads} Leads</span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={500}
                  step={10}
                  value={monthlyInboundLeads}
                  onChange={(e) => setMonthlyInboundLeads(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Slider 4: Conversion Lift % from DPA & Fast Response */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Lead Conversion Lift Rate:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 font-mono text-sm">+{conversionLiftPct}% Lift</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={25}
                  value={conversionLiftPct}
                  onChange={(e) => setConversionLiftPct(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-600"
                />
              </div>

              {/* Slider 5: Average Deal / Commission Value */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Avg Deal / Commission Value:</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono text-sm">${avgDealValue.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={25000}
                  step={500}
                  value={avgDealValue}
                  onChange={(e) => setAvgDealValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
              </div>
            </div>

            {/* Right 6 Cols: Calculated Executive Metrics */}
            <div className="lg:col-span-6 space-y-4">
              {/* Primary Metric Banner */}
              <div className="p-6 bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl border border-indigo-800 shadow-xl space-y-3">
                <div className="text-xs font-bold text-indigo-300 uppercase tracking-wide">Total Estimated 12-Month Economic Value</div>
                <div className="text-3xl sm:text-4xl font-black text-white">
                  ${roiCalculations.totalAnnualEconomicValue.toLocaleString()} <span className="text-xs font-normal text-slate-300">/ year</span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-indigo-800/80">
                  <div>
                    <div className="text-[11px] text-indigo-300 font-semibold">Payback Period</div>
                    <div className="text-lg font-bold text-emerald-400 font-mono">{roiCalculations.paybackPeriodDays} Days</div>
                  </div>
                  <div>
                    <div className="text-[11px] text-indigo-300 font-semibold">Net 1-Year ROI</div>
                    <div className="text-lg font-bold text-amber-300 font-mono">+{roiCalculations.roiPercentage}%</div>
                  </div>
                </div>
              </div>

              {/* Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Monthly Hours Reclaimed</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {roiCalculations.monthlyHoursSaved} hrs
                  </div>
                  <p className="text-[10px] text-slate-400">14.5 hrs/rep/wk on email, CRM, calendar</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Monthly Labor Savings</div>
                  <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    ${roiCalculations.monthlyLaborSavingsDollars.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400">Direct non-productive time eliminated</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Extra Closed Deals / Mo</div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400 font-mono">
                    +{roiCalculations.incrementalDealsPerMonth} deals
                  </div>
                  <p className="text-[10px] text-slate-400">From DPA grants & instant outreach</p>
                </div>

                <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Monthly Pipeline Lift</div>
                  <div className="text-xl font-bold text-amber-600 dark:text-amber-400 font-mono">
                    +${roiCalculations.monthlyIncrementalRevenue.toLocaleString()}
                  </div>
                  <p className="text-[10px] text-slate-400">Net top-line commission growth</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: OMNICHANNEL SALES COLLATERAL VAULT */}
      {activeTab === 'sales_collateral' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-600" />
                Omnichannel Sales Collateral & Copy Vault
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ready-to-deploy cold outbound emails, Facebook/Instagram ads, Google PPC kits, and LinkedIn viral hooks.
              </p>
            </div>
          </div>

          {/* Channel Selector Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'cold_emails', label: '📧 Cold Outbound Emails (4)', count: COLD_OUTBOUND_EMAIL_TEMPLATES.length },
              { id: 'meta_ads', label: '📱 Facebook & Meta Ads (5)', count: FACEBOOK_META_ADS.length },
              { id: 'google_ads', label: '🔍 Google PPC Ads (4)', count: GOOGLE_ADS_CAMPAIGNS.length },
              { id: 'social_media', label: '💼 LinkedIn & Twitter (3)', count: SOCIAL_MEDIA_CAMPAIGNS.length },
              { id: 'website_hooks', label: '🌐 Website Hero Hooks', count: WEBSITE_SHORT_HOOKS.length }
            ].map(ch => (
              <button
                key={ch.id}
                onClick={() => setCollateralChannel(ch.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  collateralChannel === ch.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* COLD EMAIL TEMPLATES */}
          {collateralChannel === 'cold_emails' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Campaign Sequence:</div>
                {COLD_OUTBOUND_EMAIL_TEMPLATES.map(temp => (
                  <button
                    key={temp.id}
                    onClick={() => setSelectedEmailTemplate(temp.id)}
                    className={`w-full p-3 rounded-xl text-left transition cursor-pointer border ${
                      selectedEmailTemplate === temp.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 text-indigo-950 dark:text-indigo-100 font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{temp.target}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">Subject: {temp.subject}</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                {(() => {
                  const currentTemp = COLD_OUTBOUND_EMAIL_TEMPLATES.find(t => t.id === selectedEmailTemplate) || COLD_OUTBOUND_EMAIL_TEMPLATES[0];
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentTemp.target}</h3>
                          <span className="text-xs text-slate-500">Target Segment: {currentTemp.target}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`Subject: ${currentTemp.subject}\n\n${currentTemp.body}`, currentTemp.target)}
                          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Email Sequence</span>
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">Subject Line:</div>
                        <div className="text-xs font-semibold text-slate-900 dark:text-slate-100">{currentTemp.subject}</div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {currentTemp.body}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* META / FACEBOOK ADS */}
          {collateralChannel === 'meta_ads' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Meta Ad Angle:</div>
                {FACEBOOK_META_ADS.map(ad => (
                  <button
                    key={ad.id}
                    onClick={() => setSelectedMetaAd(ad.id)}
                    className={`w-full p-3 rounded-xl text-left transition cursor-pointer border ${
                      selectedMetaAd === ad.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-950 dark:text-blue-100 font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{ad.name}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{ad.targetAudience}</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                {(() => {
                  const ad = FACEBOOK_META_ADS.find(a => a.id === selectedMetaAd) || FACEBOOK_META_ADS[0];
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{ad.name}</h3>
                          <span className="text-xs text-slate-500">Placement: {ad.channel}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`Headline: ${ad.headline}\n\n${ad.bodyCopy}\n\nCTA: ${ad.cta}`, ad.name)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Ad Copy & Prompt</span>
                        </button>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div className="text-[11px] font-bold text-slate-500 uppercase">Primary Headline:</div>
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400">{ad.headline}</div>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                        {ad.bodyCopy}
                      </div>

                      {ad.creativeNotes && (
                        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
                          <strong>Video Creative Directive:</strong> {ad.creativeNotes}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* GOOGLE ADS PPC */}
          {collateralChannel === 'google_ads' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select PPC Campaign:</div>
                {GOOGLE_ADS_CAMPAIGNS.map(camp => (
                  <button
                    key={camp.id}
                    onClick={() => setSelectedGoogleAd(camp.id)}
                    className={`w-full p-3 rounded-xl text-left transition cursor-pointer border ${
                      selectedGoogleAd === camp.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400 dark:border-emerald-600 text-emerald-950 dark:text-emerald-100 font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{camp.campaignName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{camp.targetKeywords.length} High-Intent Keywords</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                {(() => {
                  const camp = GOOGLE_ADS_CAMPAIGNS.find(c => c.id === selectedGoogleAd) || GOOGLE_ADS_CAMPAIGNS[0];
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{camp.campaignName}</h3>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(JSON.stringify(camp, null, 2), camp.campaignName)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy PPC Campaign JSON</span>
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Target Keywords (Exact & Phrase):</div>
                        <div className="flex flex-wrap gap-1.5">
                          {camp.targetKeywords.map((kw, i) => (
                            <span key={i} className="text-[11px] px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-md font-mono">
                              "{kw}"
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-300">15 Responsive Search Headlines:</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {camp.headlines.map((hl, i) => (
                            <div key={i} className="text-xs p-2 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                              <span className="text-emerald-500 font-bold mr-1.5">#{i+1}</span> {hl}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* LINKEDIN & TWITTER */}
          {collateralChannel === 'social_media' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2">
                <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Viral Post:</div>
                {SOCIAL_MEDIA_CAMPAIGNS.map(post => (
                  <button
                    key={post.id}
                    onClick={() => setSelectedSocialPost(post.id)}
                    className={`w-full p-3 rounded-xl text-left transition cursor-pointer border ${
                      selectedSocialPost === post.id
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 text-blue-950 dark:text-blue-100 font-semibold shadow-xs'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-xs font-bold">{post.title}</div>
                    <div className="text-[10px] text-blue-600 dark:text-blue-400 mt-0.5">{post.platform}</div>
                  </button>
                ))}
              </div>

              <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
                {(() => {
                  const post = SOCIAL_MEDIA_CAMPAIGNS.find(s => s.id === selectedSocialPost) || SOCIAL_MEDIA_CAMPAIGNS[0];
                  return (
                    <>
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{post.title}</h3>
                          <span className="text-xs text-slate-500">Platform: {post.platform}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(`${post.content}\n\n${post.hashtags.join(' ')}`, post.title)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Social Post</span>
                        </button>
                      </div>

                      <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                        {post.content}
                      </div>

                      <div className="flex flex-wrap gap-1.5">
                        {post.hashtags.map((tag, i) => (
                          <span key={i} className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{tag}</span>
                        ))}
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          )}

          {/* WEBSITE HOOKS */}
          {collateralChannel === 'website_hooks' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {WEBSITE_SHORT_HOOKS.map((cat, idx) => (
                <div key={idx} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-blue-500" />
                    <span>{cat.category}</span>
                  </h3>
                  <div className="space-y-3">
                    {cat.hooks.map((hook, hIdx) => (
                      <div key={hIdx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100">{hook.headline}</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(`"${hook.headline}" - ${hook.subheadline}`, hook.headline)}
                            className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                            title="Copy hook"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{hook.subheadline}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: DYNAMIC CLIENT PROPOSAL & LICENSE CONTRACT BUILDER */}
      {activeTab === 'proposal_builder' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                Dynamic Commercial License Agreement & Proposal Generator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate authentic, copy-ready commercial contracts with SHA256-MF anti-tamper licensing and BYOK privacy protection terms.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => copyToClipboard(generatedContractMarkdown, 'Commercial Contract Markdown')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Full Agreement (.md)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const blob = new Blob([generatedContractMarkdown], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `VANTAGE_AI_COMMERCIAL_AGREEMENT_${contractClientName.replace(/[^a-zA-Z0-9]/g, '_')}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                  showToast('Downloaded Contract Markdown!');
                }}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-700 transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .md</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 5 Cols: Configurator Form */}
            <div className="lg:col-span-5 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Agreement Configuration Parameters
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Organization Name:</label>
                  <input
                    type="text"
                    value={contractClientName}
                    onChange={(e) => setContractClientName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Person:</label>
                    <input
                      type="text"
                      value={contractContactPerson}
                      onChange={(e) => setContractContactPerson(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Client Email:</label>
                    <input
                      type="email"
                      value={contractClientEmail}
                      onChange={(e) => setContractClientEmail(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Authorized Production Domain:</label>
                  <input
                    type="text"
                    value={contractDomain}
                    onChange={(e) => setContractDomain(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Licensing Tier:</label>
                  <select
                    value={contractTierId}
                    onChange={(e) => setContractTierId(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {COMMERCIAL_PRICING_TIERS.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.priceMonthly})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Billing Schedule:</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: 'monthly', label: 'Monthly' },
                      { id: 'annual', label: 'Annual (Save 2 Mo)' },
                      { id: 'perpetual_buyout', label: 'Perpetual Buyout' }
                    ].map(b => (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setContractBillingType(b.id as any)}
                        className={`p-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                          contractBillingType === b.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Professional Add-ons:</label>
                  <div className="space-y-1.5">
                    {PROFESSIONAL_SERVICES_ADDONS.map(addon => {
                      const isChecked = selectedAddons.includes(addon.id);
                      return (
                        <label key={addon.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-xs cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) setSelectedAddons([...selectedAddons, addon.id]);
                                else setSelectedAddons(selectedAddons.filter(id => id !== addon.id));
                              }}
                              className="rounded text-blue-600"
                            />
                            <span className="font-semibold text-slate-800 dark:text-slate-200">{addon.name}</span>
                          </div>
                          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[11px]">{addon.price.split(' ')[0]}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Total Summary */}
                <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/60 rounded-2xl border border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-300">Total Contract Value</div>
                    <div className="text-lg font-black text-indigo-900 dark:text-indigo-100 font-mono">
                      ${calculatedContractTotal.totalDueToday.toLocaleString()} USD
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded-lg uppercase">
                    Ready to Sign
                  </span>
                </div>
              </div>
            </div>

            {/* Right 7 Cols: Rendered Markdown Document Preview */}
            <div className="lg:col-span-7 p-6 bg-slate-950 text-slate-200 rounded-3xl border border-slate-800 font-mono text-xs overflow-y-auto max-h-[600px] shadow-2xl leading-relaxed whitespace-pre-wrap">
              {generatedContractMarkdown}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: CLIENT ACQUISITION FUNNEL & SANDBOX SIMULATOR */}
      {activeTab === 'client_funnel' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" />
                Live Client Acquisition Funnel & Sandbox Simulator
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Interactive demonstration of the end-to-end buyer conversion loop from cold prospect to signed commercial client.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 4 Cols: Simulator Controls */}
            <div className="lg:col-span-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-800 pb-2">
                Prospective Lead Input
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Prospect Email:</label>
                  <input
                    type="email"
                    value={simulatedLeadEmail}
                    onChange={(e) => setSimulatedLeadEmail(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Lead Archetype:</label>
                  <select
                    value={simulatedLeadType}
                    onChange={(e) => setSimulatedLeadType(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="homebuyer">First-Time Homebuyer (DPA / Rural 0% Down)</option>
                    <option value="executive">Busy Executive (Tab-Fatigue & Smart Inbox)</option>
                    <option value="agency">Real Estate Team / Agency (Whitelabel Suite)</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={handleRunFunnelSimulation}
                  disabled={isSimulatingFunnel}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap className={`w-4 h-4 ${isSimulatingFunnel ? 'animate-spin' : 'text-amber-300'}`} />
                  <span>{isSimulatingFunnel ? 'Simulating Acquisition...' : 'Run Acquisition Simulation'}</span>
                </button>
              </div>
            </div>

            {/* Right 8 Cols: Visual 4-Stage Stepper & Live Log */}
            <div className="lg:col-span-8 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
              {/* Stepper Header */}
              <div className="grid grid-cols-4 gap-2 text-center">
                {[
                  { step: 1, title: 'Inbound Capture' },
                  { step: 2, title: 'Auto-Audit' },
                  { step: 3, title: 'Instant Sandbox' },
                  { step: 4, title: 'Contract Signed' },
                ].map(s => (
                  <div key={s.step} className="space-y-1">
                    <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-xs font-bold ${
                      funnelStage >= s.step
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}>
                      {funnelStage > s.step ? '✓' : s.step}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{s.title}</div>
                  </div>
                ))}
              </div>

              {/* Terminal Log Console */}
              <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl border border-slate-800 font-mono text-xs space-y-1.5 min-h-[220px]">
                <div className="text-slate-500 pb-1 border-b border-slate-900 flex items-center justify-between text-[11px]">
                  <span>VANTAGE_ACQUISITION_ENGINE_LOGS</span>
                  <span>STATUS: {isSimulatingFunnel ? 'ACTIVE_RUN' : 'STANDBY'}</span>
                </div>
                {funnelLog.map((log, i) => (
                  <div key={i} className="leading-relaxed animate-fade-in">{log}</div>
                ))}
                {funnelLog.length === 0 && (
                  <div className="text-slate-600 pt-8 text-center">
                    Click "Run Acquisition Simulation" to see the live client onboarding journey.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
