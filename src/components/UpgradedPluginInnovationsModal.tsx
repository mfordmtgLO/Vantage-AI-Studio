/**
 * Commercial Ownership Header
 * Module: UpgradedPluginInnovationsModal.tsx
 * Description: Interactive AI Innovation Matrix showcasing 1 high-impact upgraded Gemini & DeepSeek implementation idea for each of our 7 plugin modules.
 * Author: Mike Ford <fordmj@gmail.com>
 * Copyright (c) 2025-2026 Mike Ford. All Rights Reserved.
 */

import React, { useState } from 'react';
import { 
  Brain, 
  Map, 
  Mic, 
  Layout, 
  Package, 
  Smartphone, 
  FileSpreadsheet, 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  ExternalLink, 
  ArrowRight, 
  X, 
  ShieldCheck, 
  Play, 
  Copy, 
  Check, 
  Layers, 
  Bot, 
  Zap, 
  Terminal, 
  Building, 
  FileText
} from 'lucide-react';

interface UpgradedPluginInnovationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectArchetype?: (archetypeId: string) => void;
}

export interface PluginInnovationIdea {
  id: string;
  moduleName: string;
  badge: string;
  iconName: 'brain' | 'map' | 'mic' | 'layout' | 'package' | 'smartphone' | 'file-spreadsheet';
  ideaTitle: string;
  geminiPower: string;
  deepseekPower: string;
  loBusinessImpact: string;
  technicalArchitecture: string;
  sampleInput: string;
  sampleOutputJson: string;
}

export const PLUGIN_INNOVATION_IDEAS: PluginInnovationIdea[] = [
  {
    id: 'second_brain',
    moduleName: '1. Vantage 2nd Brain Plugin Module',
    badge: 'Cognitive Core & Agent',
    iconName: 'brain',
    ideaTitle: 'DeepSeek-R1 & Gemini 2.5 "Pre-Mortem Underwriting Risk & Deal-Doctor Swarm"',
    geminiPower: 'Uses Gemini 2.5 Multimodal Search Grounding to query live FHA, VA, Fannie Mae, and county-specific AMI/income limits in real time.',
    deepseekPower: 'Runs a 5-step DeepSeek-R1 chain-of-thought "Pre-Mortem Stress Test" inspecting DTI cliff limits, tax return income calculations, reserve gaps, appraisal buffer risks, and OHCS/LMI grant stacking compliance.',
    loBusinessImpact: 'Eliminates hidden deal-killers before loan submission, saving at-risk contracts and auto-generating a 1-click "Deal Doctor Salvage Blueprint" for edge-case buyers.',
    technicalArchitecture: 'Hybrid Gemini + DeepSeek R1 agent swarm executing parallel validation calls against Firestore memory vectors and live underwriting guidelines.',
    sampleInput: 'Buyer gross income $7,200/mo, total debt $2,850/mo, purchasing $480k home in Multnomah County with 5.0% OHCS DPA grant.',
    sampleOutputJson: JSON.stringify({
      preMortemRiskScore: 'LOW_RISK',
      dtiAnalysis: { frontEnd: '28.4%', backEnd: '41.2%', maxAllowed: '45.0%' },
      ohcsGrantEligibility: { status: 'QUALIFIED', grantAmountUsd: 24000, percentage: '5.0%' },
      identifiedRisks: ['Self-employment schedule C write-offs require 2-yr tax transcript verification'],
      dealDoctorActionPlan: ['Request 2024 & 2025 IRS W-2s', 'Apply 5.0% OHCS DPA grant toward closing costs to preserve $12k buyer cash reserves']
    }, null, 2)
  },
  {
    id: 'real_estate_geomap',
    moduleName: '2. Real Estate GeoMap & MLS Intelligence',
    badge: 'Geospatial Property & MLS',
    iconName: 'map',
    ideaTitle: 'Gemini Spatial Grounding & FFIEC 11-Digit GEOID Auto-Prequalifier',
    geminiPower: 'Uses Google Maps Platform Spatial Grounding to geocode any street address, verify parcel boundaries, and compute satellite map context.',
    deepseekPower: 'Cross-references 214 official Oregon LMI census tracts, determines 11-digit GEOID FIPS match, evaluates USDA RD rural boundary status, and auto-calculates maximum purchase power.',
    loBusinessImpact: 'Instantly identifies if a property unlocks $15,400–$18,500 in OHCS FirstHome cash grants, waives the 3-Year First-Time Homebuyer rule, or qualifies for 100% USDA Zero Down.',
    technicalArchitecture: '1:1 lookup engine bound to geosphere-map-oregon data layer with official FFIEC Geocoding lookup links (https://geomap.ffiec.gov/ffiecgeomap/).',
    sampleInput: '7412 SE 84th Ave, Portland, OR 97266 (GEOID: 41051009201)',
    sampleOutputJson: JSON.stringify({
      address: '7412 SE 84th Ave, Portland, OR 97266',
      geoid: '41051009201',
      countyName: 'Multnomah County',
      lmiCategory: 'Moderate (50-80% AMI)',
      ohcsFirstHomeBenefits: {
        grantPercentage: '5.0%',
        estimatedGrantCashUsd: 18500,
        fthbThreeYearRule: 'WAIVED (Targeted LMI Tract)',
        countyPriceCapUsd: 715000
      },
      usdaRdEligibility: { isEligible: false, reason: 'Inside Portland Metro Shaded Urban Core' },
      officialFfiecLookupUrl: 'https://geomap.ffiec.gov/ffiecgeomap/'
    }, null, 2)
  },
  {
    id: 'voice_plugin',
    moduleName: '3. Voice Orchestrator Plugin Module',
    badge: 'Real-Time Voice Assistant',
    iconName: 'mic',
    ideaTitle: 'Gemini Live Audio "Drive-Time Loan Officer Briefing & Voice Dispatcher"',
    geminiPower: 'Streams natural, multi-modal Gemini Live Audio to synthesize a hands-free 60-second morning briefing summarizing overnight Zillow price drops, DPA matches, and urgent leads.',
    deepseekPower: 'Parses complex spoken voice macros while driving (e.g., "Copilot, text Kanndice the $16k price drop Redmond home with USDA 0% financing"), converting voice into structured JSON workflows.',
    loBusinessImpact: 'Enables Loan Officers to execute CRM lead outreach, generate pre-approval cards, and message real estate agents completely hands-free while driving.',
    technicalArchitecture: 'WebAudio WebSocket pipeline connecting SpeechToIntentChiefOfStaffStudio to background dispatch queue.',
    sampleInput: 'Audio stream: "Hey Copilot, send the Redmond USDA listing to buyer Sarah with a note about the $16k price drop."',
    sampleOutputJson: JSON.stringify({
      parsedIntent: 'DISPATCH_PROPERTY_OUTREACH',
      targetLead: 'Sarah Jenkins',
      matchedProperty: '1425 SW Rimrock Way, Redmond, OR',
      loanProgram: 'USDA Rural Development 100% Zero-Down',
      proactiveNote: 'USDA 100% Zero Down + $16,000 price reduction in Redmond! Est PITI ~$2,310/mo.',
      actionsTaken: ['SMS Draft Created', 'Email Dispatch Scheduled', 'Activity Logged in CRM']
    }, null, 2)
  },
  {
    id: 'workplace_ui',
    moduleName: '4. Workspace UI Plugin Module',
    badge: 'Multi-App Cockpit',
    iconName: 'layout',
    ideaTitle: 'Gemini 2.5 Smart Workspace Task & Co-Branded Gmail Auto-Draft Orchestrator',
    geminiPower: 'Scans incoming homebuyer emails via Gmail API, extracting buyer timeline, credit profile, and paired real estate agent details.',
    deepseekPower: 'Drafts co-branded Loan Officer + Agent outreach emails with embedded mortgage calculation cards, DPA grant breakdowns, and auto-created Google Calendar/Tasks reminders.',
    loBusinessImpact: 'Automates 90% of routine client follow-up while strengthening co-branded real estate agent partnerships.',
    technicalArchitecture: 'Integrated Gmail Drafts Studio + Google Tasks/Calendar REST API wrapper driven by DeepSeek template synthesis.',
    sampleInput: 'Inquiry email from Agent Kanndice regarding buyer John asking for $450k home pre-approval options in Salem.',
    sampleOutputJson: JSON.stringify({
      recipientEmail: 'john.buyer@gmail.com',
      ccEmail: 'kanndice.realty@gmail.com',
      emailSubject: 'Your $450k Salem Pre-Approval Options & OHCS $15.4k Grant Breakdown',
      draftedBodySummary: 'Includes P&I payment breakdown at 6.125%, 5.0% OHCS DPA cash grant, and 1-click interactive loan calculator link.',
      googleTaskCreated: 'Follow up with John on tax return docs by Friday 2:00 PM'
    }, null, 2)
  },
  {
    id: 'full_suite',
    moduleName: '5. Commercial Enterprise Suite (All-in-One)',
    badge: 'Enterprise All-in-One Suite',
    iconName: 'package',
    ideaTitle: 'DeepSeek-R1 Powered Commercial White-Label License & Multi-Tenant Security Vault',
    geminiPower: 'Monitors multi-tenant API token usage, model latency, and token budgets across enterprise teams in real time.',
    deepseekPower: 'Generates cryptographic commercial license keys (VNTG-SUITE-XXXX), enforces Mike Ford copyright headers, manages RBAC permissions, and performs multi-tenant database isolation.',
    loBusinessImpact: 'Allows mortgage brokerages and financial institutions to license and white-label the entire AI Studio platform securely.',
    technicalArchitecture: 'Cryptographic HMAC-SHA256 license validator with multi-tenant Firestore rule enforcement.',
    sampleInput: 'Issue Commercial Brokerage License for Pacific Northwest Mortgage Group (15 Loan Officers).',
    sampleOutputJson: JSON.stringify({
      licenseKey: 'VNTG-SUITE-PNW2026-9942A8',
      licensee: 'Pacific Northwest Mortgage Group',
      authorizedSeats: 15,
      copyrightHolder: 'Mike Ford (fordmj@gmail.com)',
      featuresEnabled: ['SecondBrain', 'GeoMapMLS', 'VoiceOrchestrator', 'WorkplaceCockpit', 'CsvMakerPlus'],
      expirationDate: '2027-09-24T00:00:00Z'
    }, null, 2)
  },
  {
    id: 'mobile_microapps',
    moduleName: '6. Mobile Micro-Apps & Add-to-Home-Screen PWA',
    badge: 'Zero-Install Mobile PWA',
    iconName: 'smartphone',
    ideaTitle: 'Instant QR "On-The-Go Open House DPA Calculator" Micro-PWA',
    geminiPower: 'Generates dynamic property QR codes and mobile magic share links with embedded loan parameters.',
    deepseekPower: 'Powers a zero-install Progressive Web App (PWA) optimized for open houses where prospective buyers scan a QR code on their phone to calculate exact monthly payments using OHCS FirstHome or USDA financing.',
    loBusinessImpact: 'Captures high-intent open house buyer leads on the spot with instant pre-qualification cards sent directly to the LO and paired Agent.',
    technicalArchitecture: 'PWA Web Manifest + Service Worker offline cache + dynamic URL parameter pre-hydrator.',
    sampleInput: 'Open House QR scan for 2104 NE 45th Ave, Portland, OR ($525,000).',
    sampleOutputJson: JSON.stringify({
      propertyAddress: '2104 NE 45th Ave, Portland, OR',
      listingPriceUsd: 525000,
      ohcsGrantAvailable: 21000,
      estimatedOutofPocketDown: 5250,
      estimatedMonthlyPiti: 2840,
      leadCaptured: true,
      instantSmsNotificationSentToLo: true
    }, null, 2)
  },
  {
    id: 'csv_maker',
    moduleName: '7. CSV Maker+ & CRM Hygiene Engine',
    badge: 'CSV Hygiene & CRM Exporter',
    iconName: 'file-spreadsheet',
    ideaTitle: 'DeepSeek-R1 Multi-CRM ASCII 1-127 Sanitizer & AI Schema Mapper',
    geminiPower: 'Auto-classifies lead contact types and maps custom spreadsheet headers to enterprise CRM schemas.',
    deepseekPower: 'Cleans raw real estate CSV files, auto-repairs non-ASCII characters (smart quotes, em-dashes, accented characters), splits full names into First/Last, deduplicates cross-file lists, and builds ZIP export bundles.',
    loBusinessImpact: 'Guarantees zero CSV import rejections across Total Expert, Big Purple Dot, BoldTrail, Salesforce, and HubSpot.',
    technicalArchitecture: 'Client-side ASCII 1-127 regex sanitization pipeline + multi-schema transformer.',
    sampleInput: 'Raw CSV containing 500 leads with smart quotes, combined full names ("John & Mary Smith"), and unformatted phone numbers.',
    sampleOutputJson: JSON.stringify({
      totalRowsProcessed: 500,
      asciiCorruptionsRepaired: 142,
      namesSplitCount: 488,
      duplicatesRemoved: 12,
      exportTargetsReady: ['Total Expert (Standard)', 'Big Purple Dot', 'BoldTrail', 'Salesforce Financial Services Cloud']
    }, null, 2)
  }
];

export const UpgradedPluginInnovationsModal: React.FC<UpgradedPluginInnovationsModalProps> = ({
  isOpen,
  onClose,
  onSelectArchetype
}) => {
  const [activeIdeaId, setActiveIdeaId] = useState<string>('second_brain');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeIdea = PLUGIN_INNOVATION_IDEAS.find(i => i.id === activeIdeaId) || PLUGIN_INNOVATION_IDEAS[0];

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain': return <Brain className="w-5 h-5 text-purple-400" />;
      case 'map': return <Map className="w-5 h-5 text-emerald-400" />;
      case 'mic': return <Mic className="w-5 h-5 text-amber-400" />;
      case 'layout': return <Layout className="w-5 h-5 text-blue-400" />;
      case 'package': return <Package className="w-5 h-5 text-teal-400" />;
      case 'smartphone': return <Smartphone className="w-5 h-5 text-indigo-400" />;
      case 'file-spreadsheet': return <FileSpreadsheet className="w-5 h-5 text-green-400" />;
      default: return <Sparkles className="w-5 h-5 text-amber-400" />;
    }
  };

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-stone-900 border border-emerald-500/40 rounded-3xl max-w-5xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-gradient-to-r from-emerald-950 via-stone-900 to-purple-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-r from-emerald-500 to-purple-600 text-white rounded-2xl shadow-lg border border-white/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <span>7 Upgraded Plugin Innovation Implementations</span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono">
                  Gemini 2.5 + DeepSeek-R1 Powered
                </span>
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Strategic blueprint showcasing 1 high-impact AI innovation for every standalone plugin module in Vantage AI Studio.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Module Selector Navigation Sidebar */}
          <div className="lg:col-span-4 bg-stone-950 border-r border-stone-800 p-3 overflow-y-auto space-y-1.5 max-h-[40vh] lg:max-h-none">
            <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block px-2 py-1 font-mono">
              Select Plugin Module (7 Total):
            </span>
            {PLUGIN_INNOVATION_IDEAS.map((idea) => {
              const isActive = idea.id === activeIdeaId;
              return (
                <button
                  key={idea.id}
                  type="button"
                  onClick={() => setActiveIdeaId(idea.id)}
                  className={`w-full text-left p-3 rounded-2xl transition border flex items-start gap-2.5 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-950/80 to-stone-900 border-emerald-500/60 text-white shadow-md ring-1 ring-emerald-500/40'
                      : 'bg-stone-900/50 border-stone-800/80 text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                  }`}
                >
                  <div className="p-1.5 rounded-xl bg-stone-950 border border-stone-800 shrink-0 mt-0.5">
                    {renderIcon(idea.iconName)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold block text-white truncate">{idea.moduleName}</span>
                    <span className="text-[10px] text-stone-400 line-clamp-1 mt-0.5 font-mono">{idea.badge}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Innovation Showcase Panel */}
          <div className="lg:col-span-8 p-5 overflow-y-auto space-y-4 max-h-[50vh] lg:max-h-none">
            {/* Active Idea Header Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-stone-900 via-stone-900 to-emerald-950/40 border border-emerald-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold">
                  {activeIdea.badge}
                </span>
                <span className="text-[10px] text-purple-300 font-mono flex items-center gap-1">
                  <Bot className="w-3 h-3 text-purple-400" /> Multi-Model Intelligence
                </span>
              </div>

              <h4 className="text-base font-black text-white">{activeIdea.ideaTitle}</h4>
              <p className="text-xs text-stone-300 leading-relaxed">{activeIdea.loBusinessImpact}</p>
            </div>

            {/* Model Breakdown: Upgraded Gemini vs Upgraded DeepSeek */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Gemini Upgraded Feature */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-blue-500/30 space-y-1.5">
                <span className="font-bold text-blue-400 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  <span>Upgraded Gemini 2.5 Power:</span>
                </span>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  {activeIdea.geminiPower}
                </p>
              </div>

              {/* DeepSeek Upgraded Feature */}
              <div className="p-3.5 rounded-2xl bg-stone-950 border border-purple-500/30 space-y-1.5">
                <span className="font-bold text-purple-400 flex items-center gap-1.5 text-[11px]">
                  <Zap className="w-4 h-4 text-purple-400" />
                  <span>Upgraded DeepSeek-R1 Power:</span>
                </span>
                <p className="text-stone-300 leading-relaxed text-[11px]">
                  {activeIdea.deepseekPower}
                </p>
              </div>
            </div>

            {/* Technical Architecture */}
            <div className="p-3.5 rounded-2xl bg-stone-950 border border-stone-800 space-y-1 text-xs">
              <span className="font-bold text-amber-400 flex items-center gap-1.5 text-[11px]">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Technical Architecture &amp; Integration:</span>
              </span>
              <p className="text-stone-300 text-[11px] font-mono leading-relaxed">
                {activeIdea.technicalArchitecture}
              </p>
            </div>

            {/* Live Interactive Simulation Trace */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-stone-300 flex items-center gap-1">
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Sample Execution Trace &amp; Output JSON:</span>
                </span>

                <button
                  type="button"
                  onClick={() => handleCopyCode(activeIdea.sampleOutputJson, activeIdea.id)}
                  className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-lg text-[10px] font-mono transition flex items-center gap-1 cursor-pointer"
                >
                  {copiedId === activeIdea.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-stone-400" />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-stone-950 border border-stone-800 font-mono text-[10px] space-y-2">
                <div className="text-stone-400">
                  <span className="text-emerald-400 font-bold">Input Context: </span>
                  <span>"{activeIdea.sampleInput}"</span>
                </div>
                <pre className="text-emerald-300 max-h-40 overflow-y-auto p-2 bg-stone-900/80 rounded-xl border border-stone-800">
                  {activeIdea.sampleOutputJson}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-stone-400 font-mono text-[11px]">
            Master Commercial Plugin Architecture • Managed by Mike Ford (fordmj@gmail.com)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold rounded-xl transition cursor-pointer"
            >
              Close Matrix
            </button>
            {onSelectArchetype && (
              <button
                type="button"
                onClick={() => {
                  onSelectArchetype(activeIdea.id);
                  onClose();
                }}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black rounded-xl transition flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <span>Launch Plugin Exporter</span>
                <ArrowRight className="w-4 h-4 text-stone-950" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
