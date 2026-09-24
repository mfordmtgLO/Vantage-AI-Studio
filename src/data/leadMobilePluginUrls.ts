/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • MOBILE FRIENDLY LEAD URLS & PWA LAUNCHER DATA
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Direct Add-to-Home-Screen Lead Share Endpoints & High-Converting Pitch Hooks
 * ============================================================================
 */

export interface LeadPluginModuleUrlInfo {
  id: string;
  pluginParam: string;
  tabTarget: string;
  name: string;
  shortName: string;
  badge: string;
  iconName: 'Home' | 'Building2' | 'Brain' | 'Mic' | 'Sparkles';
  tagline: string;
  description: string;
  targetAudience: string;
  highlights: string[];
  smsPitchTemplate: string;
  emailPitchTemplate: {
    subject: string;
    body: string;
  };
}

export const DEV_BASE_URL = 'https://ais-dev-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app';
export const SHARED_BASE_URL = 'https://ais-pre-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app';

export function getDefaultLiveBaseUrl(): string {
  if (typeof window !== 'undefined' && window.location && window.location.origin) {
    return window.location.origin;
  }
  return DEV_BASE_URL;
}

export const LEAD_MOBILE_PLUGIN_MODULES: LeadPluginModuleUrlInfo[] = [
  {
    id: 'plugin_cobranded_agent_pack',
    pluginParam: 'geomap&lo=lo-mike-ford&agent=agent-kanndice-mclean&pack=geomap_brain_combo',
    tabTarget: 'real_estate',
    name: 'Co-Branded LO+Agent GeoMap & 2nd Brain Combo Pack',
    shortName: 'Mike Ford + Kanndice McLean Pack',
    badge: 'Agent Attraction • Co-Branded PWA',
    iconName: 'Home',
    tagline: 'Dual LO + Agent Co-Branded Portal with 2-Way Live SMS Relay & $0-Down Radar',
    description: 'Turnkey co-branded partnership portal featuring Mike Ford (NMLS #288455) and Kanndice McLean (Realtor®). Includes interactive DPA grant waterfall, proactive geofence alerts, live 2-way text note relays with reply response function, and 2nd Brain cognitive mortgage/real estate memory.',
    targetAudience: 'Top-Producing Realtors, Referral Agent Partners, First-Time Homebuyer Clients',
    highlights: [
      '🤝 Co-Branded LO (Mike Ford) & Realtor (Kanndice McLean) Dual Header HUD',
      '📱 2-Way SMS Lead Notes Relay with In-App Text Reply Function',
      '🚗 Proactive Geofence Proximity Radar (Alerts when lead drives near listings)',
      '📊 Real-Time DTI, Max Payment, and $0-Down Grant Waterfall Simulations',
      '🗺️ 1-Click Custom Low/No-Down Payment Saved Zillow Map Generation',
      '🧠 2nd Brain AI Ingestion of Kanndice\'s MLS Listings & Showing Rules'
    ],
    smsPitchTemplate: 'Hi Kanndice! I customized our co-branded First-Time Homebuyer AI GeoMap & 2nd Brain Portal with your name, photo, and brokerage. All our listings have zero-down grant checkers and live 2-way text alert routing for both of us. Open this link and tap "Add to Home Screen" to install it: {URL}',
    emailPitchTemplate: {
      subject: 'Your Co-Branded AI Homebuyer & $0-Down Grant Portal is Live (Kanndice McLean + Mike Ford)',
      body: 'Hi Kanndice,\n\nI built a custom-branded First-Time Homebuyer AI GeoMap & 2nd Brain Portal for you and your buyers:\n{URL}\n\nKey Capabilities Loaded for Your Business:\n• Co-Branded with your headshot, brokerage license, and direct showing buttons\n• Live USDA 100% Zero-Down and $5,000-$15,400 State DPA Grant Calculators\n• Instant 2-way SMS notification whenever a lead favorites a home, runs a DTI simulation, or drives near your listings\n• Text-back reply feature that posts your response straight into the buyer\'s app screen\n• 24/7 AI 2nd Brain answering buyer questions on your active inventory\n\nOpen the link on your phone to install it in 1 tap, or embed it on your website!\n\nBest regards,\nMike Ford (NMLS #288455)\nVantage AI Mortgage Services | fordmj@gmail.com'
    }
  },
  {
    id: 'plugin_suite_combo',
    pluginParam: 'suite',
    tabTarget: 'suite',
    name: 'Vantage AI Studio-Suite Plugin Module Combo Pack',
    shortName: 'Vantage AI Studio-Suite',
    badge: '4-in-1 Master Hub • Turnkey Pack',
    iconName: 'Sparkles',
    tagline: 'Complete 4-in-1 Autonomous Commercial AI Platform & Mobile PWA Suite',
    description: 'The master all-in-one suite unifying Workspace UI, 2nd Brain, Real Estate GeoMap, and Voice Orchestrator into a turnkey production cockpit with live cross-module data flow, zero-shot scaffolding, and 1-tap mobile installation.',
    targetAudience: 'Enterprise Clients, Commercial License Buyers, Agency Teams, SaaS Builders, Real Estate Firms',
    highlights: [
      '💎 All 4 Commercial Plugin Modules Live & Connected in One Master Hub',
      '📱 1-Click Mobile PWA "Add to Home Screen" on iOS & Android',
      '⚡ Real-Time Cross-Module Synergies (Voice ↔ 2nd Brain ↔ GeoMap ↔ Google Workspace)',
      '🚀 Zero-Shot Full Website Scaffolding Generator',
      '🛡️ Cryptographic SHA256-MF Anti-Tamper Perpetual Licensing',
      '👥 Managed Master Hub Sync for Lead Contacts (Zero BYOK)'
    ],
    smsPitchTemplate: 'Hey! Here is the live link to the complete Vantage AI Studio-Suite (4-in-1 Combo Pack). All 4 autonomous AI modules are live connected together. Open on your phone or laptop and tap "Add to Home Screen" to install it: {URL}',
    emailPitchTemplate: {
      subject: 'Live Access: Vantage AI Studio-Suite 4-in-1 Commercial Platform',
      body: 'Hi [Name],\n\nI am pleased to share the live Vantage AI Studio-Suite 4-in-1 Combo Pack with you:\n{URL}\n\nThis unified platform integrates all 4 commercial modules live connected together:\n1. Vantage AI Studio-Real Estate GeoMap & DPA Plugin Module\n2. Vantage AI Studio-2nd Brain Cognitive Vector Memory\n3. Vantage AI Studio-Voice Orchestrator Plugin Module\n4. Vantage AI Studio-Workspace UI Plugin Module\n\nYou can access it on any desktop browser or open it on your mobile phone and tap "Add to Home Screen" to install it as a full standalone app.\n\nBest regards,\nMike Ford | fordmj@gmail.com'
    }
  },
  {
    id: 'plugin_real_estate',
    pluginParam: 'geomap',
    tabTarget: 'real_estate',
    name: 'Vantage AI Studio-Real Estate GeoMap & DPA Plugin Module',
    shortName: 'GeoMap DPA',
    badge: 'Zero BYOK • Real Estate GIS',
    iconName: 'Home',
    tagline: 'Instant USDA 100% Zero-Down & $5k–$10k CRA Grant Match on Mobile & Desktop',
    description: 'Autonomous spatial real estate portal featuring Census Tract GEOID lookup, USDA Rural Development zero-down screening, live front/back-end DTI affordability sliders up to a 50% max DTI ceiling, 1-click Zillow URL geocoding, and 1-click sync with Mike Ford\'s Master Feed.',
    targetAudience: 'Mortgage Loan Officers, First-Time Homebuyers, Realtors, Real Estate Investors',
    highlights: [
      '🌾 USDA 100% Rural Development Zero-Down Verification',
      '🏛️ LMI Census Tract CRA $5,000–$10,000 Grant Match',
      '📊 Interactive Front/Back-End DTI Sliders (50% max envelope)',
      '📍 1-Click Zillow Property URL Geocoder',
      '🔄 1-Click Sync with Mike Ford\'s Master Oregon GIS Feed',
      '📱 1-Tap "Add to Home Screen" Mobile App Installation'
    ],
    smsPitchTemplate: 'Hey! Check out this interactive First-Time Homebuyer GeoMap & DPA Grant Calculator on your phone or laptop. Tap the link to explore zero-down properties and calculate your monthly budget, or tap "Add to Home Screen" to install it as a 1-tap mobile app: {URL}',
    emailPitchTemplate: {
      subject: 'Interactive Homebuyer Tool: Zero-Down & $5k-$10k Grant Search',
      body: 'Hi [Name],\n\nI wanted to share our interactive First-Time Homebuyer GeoMap & DPA Grant Match tool with you.\n\nYou can access it instantly on desktop or open it on your mobile device and tap "Add to Home Screen" to install it as a lightweight standalone app:\n{URL}\n\nKey Capabilities:\n• Live USDA 100% Zero-Down Eligibility Checker\n• Census Tract CRA $5,000–$10,000 Down Payment Grant Lookups\n• Real-Time DTI Budget & Monthly Payment Envelope\n• 1-Click Zillow Link Geocoding\n\nFeel free to test it with any address or monthly income to see what programs you qualify for!\n\nBest regards,\nMike Ford | fordmj@gmail.com'
    }
  },
  {
    id: 'plugin_workspace',
    pluginParam: 'workspace',
    tabTarget: 'studio',
    name: 'Vantage AI Studio-Workspace UI Plugin Module',
    shortName: 'Workspace UI',
    badge: 'Dual-Pathway • Google Automation',
    iconName: 'Building2',
    tagline: 'Modular Google Workspace Cockpit with Live Drafts & 15-Min Buffer Scheduler',
    description: 'Commercial UI component module providing dual Google OAuth pathway support, Gmail live drafts with in-app approval, 15-minute HIPAA buffered calendar scheduling, and relational Sheets database with domain/string purge filters.',
    targetAudience: 'SaaS Builders, Agency Founders, Executive Assistants, Operations Leads',
    highlights: [
      '✉️ Gmail Live Drafts & In-App One-Click Send Approvals',
      '📅 15-Minute HIPAA Buffer Smart Calendar Scheduler',
      '📊 Relational Sheets Engine with Domain Purge Filters',
      '🔑 Dual Google Account / Enterprise Workspace OAuth',
      '⚡ Zero-Friction React Component Drop-In Architecture',
      '📱 Standalone Desktop & Mobile PWA Cockpit'
    ],
    smsPitchTemplate: 'Hey! Here is the live link to the Vantage AI Workspace UI Cockpit. You can test live Gmail drafts, 15-min buffered scheduling, and sheets automation directly on desktop or install it on mobile: {URL}',
    emailPitchTemplate: {
      subject: 'Live Demo: Vantage AI Studio-Workspace UI Plugin Cockpit',
      body: 'Hi [Name],\n\nHere is your direct access link to test the Vantage AI Studio-Workspace UI Plugin Module on desktop or mobile:\n{URL}\n\nFeatures Included:\n• Seamless Dual Google Account / Workspace Authentication\n• Live Gmail Draft Generation with Safety Review Airgaps\n• Intelligent 15-Minute HIPAA Buffer Meeting Scheduling\n• Relational Google Sheets Database with Domain Purge Filters\n\nOpen the link on your mobile phone to install the full PWA web app in 1-tap!\n\nBest,\nMike Ford'
    }
  },
  {
    id: 'plugin_2nd_brain',
    pluginParam: 'brain',
    tabTarget: 'brain',
    name: 'Vantage AI Studio-2nd Brain Plugin Module',
    shortName: '2nd Brain',
    badge: 'Vector Memory • Guardrails',
    iconName: 'Brain',
    tagline: 'Cognitive Vector Memory Core with Persona Profiles & Simulation Studio',
    description: 'Long-term cognitive memory bank that eliminates LLM amnesia. Features semantic vector memory recall, operational guardrails and censorship boundaries, persona tone tuning, and real-time scenario simulation testing.',
    targetAudience: 'AI Developers, Executive Consultants, Knowledge Workers, Researchers',
    highlights: [
      '🧠 Long-Term Semantic Vector Memory & Context Retention',
      '🛡️ Operational Guardrails & Persona Censorship Studio',
      '🎭 Custom Tone, Personality & Formality Presets',
      '🧪 Real-Time Memory Scenario & Conflict Testing',
      '🔒 Domain-Locked License Key Protection (SHA256-MF)',
      '📱 Mobile-Ready Knowledge Search & Instant Capture'
    ],
    smsPitchTemplate: 'Hey! Here is the live 2nd Brain Cognitive Memory Module. Test persistent memory recall, personality guardrails, and simulation scenarios right on your phone or desktop: {URL}',
    emailPitchTemplate: {
      subject: 'Live Demo: Vantage AI Studio-2nd Brain Cognitive Memory Plugin',
      body: 'Hi [Name],\n\nCheck out the live 2nd Brain Cognitive Memory Plugin Module on desktop or mobile:\n{URL}\n\nThis module equips any AI agent with persistent long-term vector memory, customizable operational guardrails, and automated persona indexing.\n\nOpen on your mobile phone and tap "Add to Home Screen" for instant offline/online access.\n\nBest,\nMike Ford'
    }
  },
  {
    id: 'plugin_voice',
    pluginParam: 'voice',
    tabTarget: 'orchestrator',
    name: 'Vantage AI Studio-Voice Orchestrator Plugin Module',
    shortName: 'Voice Macro',
    badge: 'Voice-to-Intent • Safety Airgap',
    iconName: 'Mic',
    tagline: 'Hands-Free Speech-to-Intent Decomposition with Multi-App Macro Workflows',
    description: 'Real-time voice assistant module that captures natural speech, verifies verbal safety airgaps, decomposes requests into structured tool executions, and automates multi-application workflow macros.',
    targetAudience: 'Mobile Field Workers, Busy Executives, Real Estate Agents, Tech Power-Users',
    highlights: [
      '🎙️ Real-Time Speech-to-Intent Decomposition',
      '🛑 Verbal Safety Airgap & Explicit Confirmation Checks',
      '⚡ Multi-Product Cross-Application Voice Macros',
      '📱 Mobile PWA Voice Studio with 1-Tap Microphone',
      '🔄 Instant Undo & Execution History Logging',
      '🧩 Standalone Embeddable React Modal & Floating Trigger'
    ],
    smsPitchTemplate: 'Hey! Try the Vantage Voice Orchestrator on your mobile phone or laptop. Speak natural voice commands and watch it decompose into automated safe workflows in real time: {URL}',
    emailPitchTemplate: {
      subject: 'Live Demo: Vantage AI Studio-Voice Orchestrator Plugin Module',
      body: 'Hi [Name],\n\nHere is your live link to test the Vantage Voice Orchestrator Plugin Module:\n{URL}\n\nExperience hands-free voice automation with built-in verbal safety airgaps and multi-step Google Workspace execution.\n\nInstall it to your mobile Home Screen for instant 1-tap voice workflows while on the go!\n\nBest,\nMike Ford'
    }
  }
];

export function buildLeadPluginUrl(
  pluginParam: string,
  baseUrl?: string,
  options: {
    leadMode?: boolean;
    standalone?: boolean;
    bypassAuth?: boolean;
    lo?: string;
    agent?: string;
    pack?: string;
    prop?: string;
    props?: string[] | string;
    city?: string;
  } = {}
): string {
  const targetBase = baseUrl || getDefaultLiveBaseUrl();
  const cleanBase = targetBase.replace(/\/+$/, '');
  const params = new URLSearchParams();

  // If pluginParam contains multiple query arguments (e.g. 'geomap&lo=lo-mike-ford&agent=agent-kanndice-mclean')
  if (pluginParam.includes('&') || pluginParam.includes('=')) {
    const rawParts = pluginParam.split('&');
    rawParts.forEach((part, idx) => {
      if (idx === 0 && !part.includes('=')) {
        params.set('plugin', part);
      } else if (part.includes('=')) {
        const [k, ...vParts] = part.split('=');
        params.set(k, vParts.join('='));
      }
    });
  } else {
    params.set('plugin', pluginParam);
  }

  // Explicit LO / Agent / Pack / Prop / Props / City overrides take precedence
  if (options.lo) {
    params.set('lo', options.lo);
  }
  if (options.agent) {
    params.set('agent', options.agent);
  }
  if (options.pack) {
    params.set('pack', options.pack);
  }
  if (options.prop) {
    params.set('prop', options.prop);
  }
  if (options.props) {
    const propsVal = Array.isArray(options.props) ? options.props.join(',') : options.props;
    if (propsVal) {
      params.set('props', propsVal);
    }
  }
  if (options.city) {
    params.set('city', options.city);
  }

  if (options.leadMode ?? true) {
    params.set('lead', '1');
  }
  if (options.standalone) {
    params.set('standalone', '1');
  }
  if (options.bypassAuth ?? true) {
    params.set('guest', '1');
  }
  return `${cleanBase}/?${params.toString()}`;
}

