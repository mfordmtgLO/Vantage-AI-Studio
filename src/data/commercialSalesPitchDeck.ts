/**
 * Master Point of Reference for Commercial Retail Software Suite Sales Pitch Deck
 * Author & Copyright: Mike Ford (fordmj@gmail.com)
 * License: Vantage AI Commercial License (SHA256-MF Anti-Tamper Protected)
 */

export interface PricingTier {
  id: string;
  name: string;
  priceMonthly: string;
  priceYearly: string;
  idealCustomer: string;
  deliverables: string[];
  badge?: string;
}

export interface ModulePitch {
  id: string;
  title: string;
  hook: string;
  summary: string;
  coreCapabilities: string[];
  stackedBenefits: {
    target: string;
    headline: string;
    description: string;
  }[];
}

export interface AdCampaignAngle {
  id: string;
  name: string;
  channel: string;
  targetAudience: string;
  headline: string;
  bodyCopy: string;
  cta: string;
  creativeNotes?: string;
}

export interface SocialMediaPost {
  id: string;
  platform: 'LinkedIn' | 'Twitter / X' | 'Instagram / Reels' | 'TikTok / Short Video';
  title: string;
  hook: string;
  content: string;
  hashtags: string[];
  callToAction: string;
}

export interface GoogleAdGroup {
  id: string;
  campaignName: string;
  targetKeywords: string[];
  headlines: string[];
  descriptions: string[];
  sitelinks: { title: string; desc: string }[];
  callouts: string[];
}

export interface WebsiteHookCategory {
  category: string;
  hooks: {
    headline: string;
    subheadline: string;
    badge?: string;
    targetAudience: string;
  }[];
}

export const EXECUTIVE_MASTER_HOOK = {
  problem: "Every popular AI chatbot suffers from 'Goldfish Amnesia,' 'Tab Fatigue,' 'Messy Data Corruption,' and 'Execution Paralysis.' The moment you close the browser tab, the AI forgets who your clients are, what your preferences were, and what projects you're working on. Worse, they live in isolated silos—forcing you to constantly copy-paste back and forth between ChatGPT, Gmail, Google Sheets, messy CSV spreadsheets, and your CRM while risking non-ASCII encoding crashes, data leaks, and lost leads.",
  solution: "Vantage AI Workspace UI + 7-in-1 Suite powered by the Gemini 3.0 Hybrid Brain transforms stateless LLMs into an autonomous, interconnected operating system. It embeds permanent vector memory, sub-second reasoning, multi-million token context recall, CSV Maker+ batch hygiene & cross-file deduplication, dual-pathway Google Workspace execution, hands-free voice orchestration, and specialized real estate & mortgage DTI math directly into your daily workflow—eliminating manual context switching and data corruption forever."
};

export const WORKSPACE_UI_DEEP_DIVE = {
  title: "Vantage AI Workspace UI: The Autonomous Google Workspace Operating System",
  tagline: "Stop Copy-Pasting AI Outputs. Execute Directly Inside Gmail, Calendar, Drive, and Sheets with Zero API Key Exposure.",
  overview: "Vantage AI Workspace UI is a containerized, production-ready interface and API bridge that connects AI models directly to Google Workspace using Dual-Pathway Authentication. It eliminates tab fatigue by allowing users to draft real Gmail messages, enforce 15-minute HIPAA/focus buffers on Google Calendar, query Google Sheets as relational databases, clean messy lead lists, and synthesize Drive documents in seconds.",
  corePillars: [
    {
      title: "1. Dual-Pathway Authentication Engine",
      subtitle: "Instant Personal Access (GIS) + Enterprise Domain-Wide OAuth",
      description: "Supports instant 1-click personal Google Identity Services (Pathway A) for solo operators with zero backend setup, plus Enterprise Cloud OAuth 2.0 (Pathway B) for brokerages, teams, and multi-user organizations with secure token refreshes and RBAC permissions."
    },
    {
      title: "2. Zero-Prompt Live Gmail Draft Studio",
      subtitle: "Context-Aware Executive Email Generation",
      description: "Automatically analyzes unread threads, pulls prior client history and commitments from vector memory, and formats polished executive drafts directly in Gmail with 1-click review. Never sends blindly without human airgapped confirmation."
    },
    {
      title: "3. Calendar 15-Minute Focus & HIPAA Compliance Buffer Engine",
      subtitle: "Automated Transition Protection",
      description: "Automatically detects and injects non-negotiable 15-minute transitional buffers around confidential meetings and high-stakes client calls, preventing back-to-back calendar fatigue and maintaining strict compliance boundaries."
    },
    {
      title: "4. Google Sheets Relational Database & Purge Filter Engine",
      subtitle: "SQL-Style Queries, Multi-File Consolidations & Domain Cleanup",
      description: "Treats standard Google Sheets as structured relational tables with atomic writes. Includes a targeted String/Domain Purge Filter (instantly removing competitors or spam domains) and a Multi-File CSV/XLSX pipeline that merges messy databases into clean master sheets."
    },
    {
      title: "5. Drive Explorer & Docs AI Synthesizer",
      subtitle: "Instant Multi-Doc Summarization & Drafting",
      description: "Search, organize, and synthesize files across Google Drive into structured executive briefings, proposals, or project plans in Google Docs with a single command."
    }
  ],
  timeSavingsMetrics: [
    { metric: "14.5 Hours / Week", label: "Average Time Saved per Executive & Solo Pro" },
    { metric: "100%", label: "Zero API Key Browser Exposure (Server-Side Proxy)" },
    { metric: "60 Seconds", label: "Time to Connect & Deploy to Any Existing Website" },
    { metric: "Zero Tab Switching", label: "Unified Operating Canvas for All 6 Google Apps" }
  ]
};

export const COMMERCIAL_PRICING_TIERS: PricingTier[] = [
  {
    id: 'individual_pro',
    name: 'Individual Pro Edition',
    priceMonthly: '$49 / month',
    priceYearly: '$490 / year (2 months free)',
    idealCustomer: 'Solo Realtors, Loan Officers, Freelance Devs, Consultants, Busy Executives',
    badge: 'Most Popular for Solos',
    deliverables: [
      '1 Production Domain / Landing Page Authorization',
      'Gemini 3.0 Hybrid Brain Core Intelligence Engine',
      'Up to 250 Active User 2nd Brain Memory Profiles with Industry Modalities',
      'Full Vantage AI Workspace UI + Chosen Standalone Plugin Container',
      'CSV Maker+ Standalone Hygiene & CRM Exporter Widget',
      'Dual-Pathway Google Workspace Integration (Pathway A & B)',
      'Live Gmail Drafts, Calendar 15-Min Buffer & Sheets Cleanup Tool',
      'Standard API & Tool Schema Updates'
    ]
  },
  {
    id: 'team_agency',
    name: 'Team / Agency Edition',
    priceMonthly: '$149 / month',
    priceYearly: '$1,490 / year',
    idealCustomer: 'Producing Real Estate Teams (3-10 agents), Digital Agencies, Consultancies',
    badge: 'Best Value for Teams',
    deliverables: [
      'Up to 5 Production Domains / Client Sites',
      'Gemini 3.0 Multi-Token Context & Sub-Second Reasoning Upgrade',
      'Unlimited Active 2nd Brain Profiles across team members with Industry Modalities',
      'Co-branded paired partner bridges (Agent + Loan Officer)',
      'CSV Maker+ Cross-File Multi-Source Batch Processor & Deduplicator',
      'Automated weekly dsh-cron background audits & alert drafts',
      'Multi-File Lead Database Consolidation & Purge Engine',
      'Priority Email & Slack Integration Support'
    ]
  },
  {
    id: 'enterprise_saas',
    name: 'Enterprise SaaS Edition (7-in-1 Suite)',
    priceMonthly: '$499 / month',
    priceYearly: '$4,990 / year',
    idealCustomer: 'Full Brokerages, Regional Lenders, Enterprise SaaS Founders',
    badge: 'Enterprise Flagship',
    deliverables: [
      'Complete Vantage AI Workspace Suite (All 7 Standalone Modules Included)',
      'Gemini 3.0 Hybrid Brain Multimodal Core with Autonomous Agentic Loops',
      'Unlimited Domains & Full Whitelabel Embedding Rights',
      'Full Obfuscated/Unbundled Source Code Access (.ts / .js)',
      'Multi-LLM Gateway (Gemini 3.0, Claude 3.7, ChatGPT-4o, DeepSeek-V4.1-Flash, Cursor)',
      'CSV Maker+ Enterprise Exporter with ZIP Distribution Package Builder',
      'Dedicated Custom Webhook & CRM Sync (Salesforce, HubSpot, Total Expert, BoldTrail, BPD)',
      'Airgapped Guardrails & Boundary Verification Engine',
      '1-on-1 Dedicated Integration & Launch Engineering Support'
    ]
  },
  {
    id: 'instant_buyout',
    name: 'Perpetual Commercial Buyout (Turnkey Package)',
    priceMonthly: '$297 - $997 One-Time',
    priceYearly: 'Perpetual Ownership License',
    idealCustomer: 'Etsy, Gumroad & GitHub Marketplace Buyers wanting self-hosting',
    badge: '1-Time Purchase',
    deliverables: [
      'Complete Vantage AI Suite Combo Pack (.zip with all 7 standalone plugin modules)',
      'Vantage AI Studio - CSV Maker+ Multi-CRM Hygiene & Export Package',
      '.md scaffolding prompts for zero-shot replication across AI IDEs',
      'OpenAPI tool .json schemas & standalone React component widgets',
      'Domain-locked license generator with SHA256-MF tamper verification',
      'Commercial distribution rights with attribution for Mike Ford (fordmj@gmail.com)'
    ]
  }
];

export const PROFESSIONAL_SERVICES_ADDONS = [
  {
    id: 'custom_install_fee',
    name: '1-Time Customization & Installation Flat Fee',
    price: '$2,500 Flat Fee',
    deliverables: [
      'Full white-glove setup and deployment on client cloud infrastructure (Cloud Run / Vercel)',
      'Custom branding, color palette, logo embedding, and domain mapping',
      'Google Workspace OAuth App verification and API scopes configuration',
      'Custom CRM / Webhook synchronization and database seed migration'
    ]
  },
  {
    id: 'teams_training_series',
    name: 'Teams Training Video Call Series',
    price: '$1,500 Flat Fee (3 Live Video Calls)',
    deliverables: [
      'Session 1: Executive & Admin Onboarding, Permissions & Guardrail Boundaries',
      'Session 2: Daily Workflow Mastery (Gmail Drafts, Calendar Buffers, Voice Macros)',
      'Session 3: Advanced Lead Database Cleanup, Sheets SQL & 2nd Brain Knowledge Training',
      'Full high-definition recordings, PDF cheat sheets, and step-by-step SOP documents'
    ]
  },
  {
    id: 'persistence_learning_upgrade',
    name: 'Bi-Annual "Train the Brain" Ingestion Upgrade Subscription',
    price: '$1,200 / year (Billed Semi-Annually at $600)',
    deliverables: [
      'Scheduled bi-annual vector knowledge base re-indexing and document ingestion',
      'Regulatory, underwriting, compliance, and corporate playbook updates',
      'Fine-tuning memory prompt weights and operational guardrails',
      'Quarterly system performance audit and token optimization'
    ]
  }
];

export const SUITE_MODULE_PITCHES: ModulePitch[] = [
  {
    id: 'workspace_ui',
    title: 'Module 1: Vantage AI Workspace UI Plugin Module',
    hook: 'Turn Google Workspace into an Autonomous AI Operating System. Dual-Pathway Auth, Live Gmail Draft Studios, 15-Minute HIPAA Calendar Buffers & Relational Sheets Cleanup.',
    summary: 'A turnkey, containerized UI & API engine connecting any web app or LLM to Google Workspace using Dual-Pathway Architecture—supporting both instant personal Google Identity Services (Pathway A) and enterprise-grade domain OAuth (Pathway B).',
    coreCapabilities: [
      'Gmail Live Draft Studio: Generates and formats real Google Drafts using Google REST APIs, complete with tone optimization and executive summaries.',
      'Calendar 15-Minute Focus/HIPAA Buffer Engine: Automatically reserves 15-minute transitional buffers around confidential meetings to prevent back-to-back calendar fatigue.',
      'Drive Explorer & Docs Synthesizer: Browse, search, and synthesize Google Drive files into new Google Docs with 1 click.',
      'Google Sheets Relational Database Engine: Treats standard Google Sheets as relational SQL databases with atomic writes and schema enforcement.',
      'Targeted String/Domain Purge Filter: Enter any keyword or domain (e.g. @spam.com, unsubscribe) to instantly scan and purge matching rows across every column.',
      'Multi-File CSV/XLSX Consolidation Pipeline: Upload multiple disparate lead lists to either merge them into 1 unified master database or output separate cleaned files.'
    ],
    stackedBenefits: [
      {
        target: 'Vantage 2nd Brain',
        headline: 'Permanent Lead Suppression & Context Memory',
        description: 'Whenever the String/Domain Purge Filter cleans a bad domain or competitor from a sheet, the 2nd Brain permanently memorizes that domain so all future automated lead captures are filtered automatically.'
      },
      {
        target: 'Voice Orchestrator',
        headline: 'Compound Hands-Free Workplace Execution',
        description: 'Say "Check my unread VIP emails, draft a reply to John, and block 15 minutes after our meeting tomorrow"—the Voice Macro decomposes and executes the compound workflow across Gmail and Calendar simultaneously.'
      },
      {
        target: 'Real Estate GeoMap',
        headline: 'Automated One-Click Lead CRM Pipelines',
        description: 'Export prequalified buyer records with their AMI income %, CRA grant eligibility, and calculated DTI limits directly into formatted Google Sheets tables.'
      }
    ]
  },
  {
    id: 'second_brain',
    title: 'Module 2: Vantage 2nd Brain Plugin Module & Memory Harness (Gemini 3.0 Hybrid Edition)',
    hook: 'Stop Building AI Chatbots That Forget Everything. Give Your AI a Permanent, Vector-Indexed Brain with Gemini 3.0 Hybrid Reasoning in 60 Seconds.',
    summary: 'A drop-in memory infrastructure powered by the Gemini 3.0 Hybrid Brain that adds multi-million token vector recall, deep industry + career persona modalities (Mortgage, Real Estate, Enterprise Sales, Wealth Management, Legal, SaaS), procedural workflow execution, and autonomous circadian knowledge pruning.',
    coreCapabilities: [
      'Gemini 3.0 Hybrid Brain Core Engine: Sub-second reasoning latency paired with multi-million token context windows for zero-loss long-term conversation recall.',
      'Industry + Career Knowledge Modalities: Pre-seeded professional persona profiles (Mortgage Officer, Real Estate Broker, SaaS Architect, Wealth Advisor) with built-in regulatory rules and domain terminology.',
      'Autonomous Circadian Memory Hygiene: Background consolidation jobs automatically prune outdated guidelines, resolve conflicting instructions, and calculate memory confidence weights.',
      'Airgapped Boundary & Safety Guardrails: Evaluates actions before external dispatch, preventing unauthorized sends, non-ASCII crashes, or data leaks.',
      'Scenario Simulator Testing Studio: Benchmark industry persona recall across simulated client interactions before going live.'
    ],
    stackedBenefits: [
      {
        target: 'Workspace UI',
        headline: 'Hyper-Contextual Zero-Prompt Executive Email',
        description: 'When drafting messages in Gmail, the AI automatically pulls historical conversation context, client preferences, and past commitments from the 2nd Brain without typing a prompt instruction.'
      },
      {
        target: 'Voice Orchestrator',
        headline: 'Verbal Knowledge Base Ingestion on the Fly',
        description: 'Speak freeform thoughts or client updates into your microphone; the Voice Macro router automatically transcribes, categorizes, and embeds them directly into your 2nd Brain vector vault.'
      },
      {
        target: 'Real Estate GeoMap',
        headline: 'Cross-Session Lead Memory Persistence',
        description: 'When home buyers enter their email, all their favorited listings, custom notes, and calculated DTI affordability envelopes are permanently stored in their 2nd Brain profile.'
      },
      {
        target: 'CSV Maker+',
        headline: 'Automated CRM Tagging & Memory Logging',
        description: 'Cleaned lead attributes and suppressed spam domains are automatically indexed in the 2nd Brain to ensure perpetual clean database ingestions.'
      }
    ]
  },
  {
    id: 'voice_macro',
    title: 'Module 3: Vantage Voice Orchestrator Plugin Module',
    hook: 'Talk to Your AI Like a Senior Chief of Staff. Compound Voice Commands, Speech-to-Intent Routing, and Verbal Safety Airgaps.',
    summary: 'Replaces clunky manual typing with an intelligent speech-to-intent pipeline that accepts compound verbal instructions, breaks them into sequential sub-tasks, and executes them with a spoken confirmation airgap.',
    coreCapabilities: [
      'Speech-to-Intent Decomposition: Automatically parses complex, compound sentences containing "and then", "after that", or "also" into discrete tool execution steps.',
      'Verbal Safety Airgap: Spoken audio feedback requires explicit verbal confirmation before executing external dispatches (sending emails, deleting records, transferring funds).',
      'Execution Snackbar with Quick-Undo: Persistent visual snackbar provides real-time progress indicators and a 10-second instant rollback window.',
      'Multi-Modal Execution Engine: Supports Web Speech API for zero-cost browser execution or server-side Whisper/Gemini models for studio-grade transcription.'
    ],
    stackedBenefits: [
      {
        target: '2nd Brain',
        headline: 'Hands-Free Guardrail Protection',
        description: 'Voice commands are checked against the 2nd Brain’s active operational boundaries before execution, preventing accidental voice-triggered actions.'
      },
      {
        target: 'Workspace UI',
        headline: 'Hands-Free Drive & Gmail Management',
        description: 'Dictate notes while driving or walking; the orchestrator routes the text into structured Google Docs or queues priority Gmail drafts.'
      },
      {
        target: 'Real Estate GeoMap',
        headline: 'Natural Voice Property Search',
        description: 'Say "Show me single-family homes in rural zones with zero down under $350k" to automatically filter interactive GeoMap pins and DTI calculations.'
      }
    ]
  },
  {
    id: 'real_estate_geo',
    title: 'Module 4: Flagship Real Estate GeoMap & DPA Mortgage Plugin (GeoMap 3.0)',
    hook: 'Turn Renters into Homebuyers on Your Website. The Only AI Plugin with Multi-Layer DPA Grant Stacking, AI 2nd Brain Lead Triage, Proactive Geofence Driving Radar & Co-Branded Tablet Kiosks.',
    summary: 'The ultimate real estate and mortgage technology engine. Instantly geocodes properties, matches 11-digit FIPS Census Tracts with LMI grants, checks USDA Rural Development (RD) 100% financing boundaries, computes real-time buyer DTI affordability envelopes, and features an AI 2nd Brain Lead Triage engine that automatically decomposes visitor inquiries into LO vs. Agent domains while simultaneously emailing both professionals.',
    coreCapabilities: [
      'Customizable Lead Capture Form with AI 2nd Brain Triage: Decomposes buyer questions into Loan Officer domains (loan programs, DPA, credit scores, pre-approval, monthly payments, DTI, underwriting, income, taxes, interest rates) vs. Realtor Agent domains (property address, beds/baths/sqft, DOM, pricing trends, private tours, walk-throughs, meetup/coffee, search criteria, seller concessions).',
      'GeoMap Plugin Default Property Listing & Front-and-Center View: Check the "GeoMap Plugin default" box on any property listing card to feature that listing as the first to view front and center in all plugin exports, social links, emails, texts, messaging, and QR codes with live AI notes chat bot & scenario Q&A.',
      'Simultaneous Dual-Email Dispatch: Instantly notifies both the Loan Officer (fordmj@gmail.com) and paired Realtor Agent (kanndice@cascadepremier.com) with pre-drafted 1-click replies and actionable urgency ratings.',
      'Dynamic Solo LO Mode vs. Co-Branded Combo Pack: Easily pairs an LO with a top-producing agent for co-branded lead attraction; if no agent is selected, it cleanly degrades to Solo LO Mode with zero external agent intermediary.',
      'Co-Branded 1-Tap Agent Contact Card: Copies a pre-formatted contact card with name, license #, broker, headshot, and co-branded link ready to paste into Instagram, TikTok, LinkedIn bios, and email signatures.',
      'Native Mobile Share via SMS Intent: Triggers native mobile SMS sharing pre-populated with the co-branded property link, listing specs, and dual contact info.',
      'Live Showing QR Code & Tablet Kiosk Presenter: Interactive Open House / Showing Kiosk mode with high-contrast QR code for instant phone scanning and offline PWA saving.',
      'Multi-Layer DPA Grant Waterfall Stacking Solver: Stacks Lakeview National 100% DPA, OHCS Flex Lending ($15,400), CRA $5k-$10k Grants, USDA 100% 0-down, and Fannie Mae HomeReady (3% down) to solve for True Zero Out-of-Pocket closing cash.',
      'Proactive Geofenced Interest Radius Alert Radar: Real-time mobility radar triggers cross-platform mobile alerts when a buyer physically drives within 0.5 miles of a favorited listing or enters a USDA 100% zero-down corridor.',
      'Real-Time Collaborative Co-Borrower Canvas: Sliders for joint co-borrower gross income and liabilities dynamically recalculate front/back-end DTI limits with live visual comparisons.',
      'DeepThink Pre-Mortem Modal: Analyzes property vulnerability, tax reassessment resets, aging capital expenditure reserves, and underwriting flags.',
      '1-Click Executive Pre-Approval Dossier: Generates official PDF/print pre-approval certificates complete with census tract grant qualification badges and LO+Agent credentials.',
      '1-Click Zillow URL Geocoder: Buyers paste any Zillow listing link to import specs, geocode coordinates, and place an interactive map pin with pre-qualification indicators.'
    ],
    stackedBenefits: [
      {
        target: '2nd Brain',
        headline: 'Automated Cognitive Lead Decomposition',
        description: 'When a visitor submits notes or questions, the AI 2nd Brain segments the text into distinct LO and Agent domains, drafting separate tailored responses for each professional.'
      },
      {
        target: 'Workspace UI',
        headline: 'Simultaneous Dual-Inbox Notification & Gmail Drafts',
        description: 'Dispatches instant notifications to the LO and Agent inboxes simultaneously, generating ready-to-review Gmail drafts with the lead\'s specific financial constraints.'
      },
      {
        target: 'Voice Orchestrator',
        headline: 'Conversational Pre-Qualification & Hands-Free Tour Requests',
        description: 'Buyers can verbally state their financial profile ("I make $8,500/mo with $400 in debts and $10k saved") to instantly see their purchasing power envelope on screen.'
      }
    ]
  },
  {
    id: 'enterprise_suite',
    title: 'Module 5: Commercial Enterprise All-in-One Master Suite',
    hook: 'Deploy the Entire 6-Module Cognitive Ecosystem Under Your Own Brand with Domain-Locked Multi-Tenant Security.',
    summary: 'The master enterprise framework that bundles and orchestrates all standalone Vantage plugin modules into a single, cohesive SaaS command center with tenant isolation, cryptographic watermark protection, and centralized license validation.',
    coreCapabilities: [
      'Centralized Multi-Tenant Gateway: Manage client organizations, seats, and domain authorizations from one master admin panel.',
      'SHA256-MF Anti-Tamper Security: Verifies commercial license integrity and prevents unauthorized code reuse across unapproved domains.',
      'Unified Modular Navigation: Switch effortlessly between Cognitive Memory, Geospatial MLS, Voice Macros, Workspace Cockpit, and Mobile PWAs with synchronized user state.',
      'Turnkey Whitelabel Embedding: Embed the full suite on client portals with customized branding, color schemes, and domain routing.'
    ],
    stackedBenefits: [
      {
        target: 'All Modules',
        headline: 'Unified Ecosystem State Synchronization',
        description: 'User preferences, active leads, and AI memory persist across all modules seamlessly under one commercial license.'
      }
    ]
  },
  {
    id: 'mobile_pwa',
    title: 'Module 6: Mobile Micro-Apps & Add-to-Home-Screen PWA Plugin',
    hook: 'Zero App Store Friction. Turn Web Visitors into Mobile Power-Users with 1-Tap Home Screen Installation.',
    summary: 'A zero-install Progressive Web App (PWA) client portal engine that enables real estate agents, loan officers, and clients to save lightweight mobile micro-apps directly to their iOS and Android home screens without downloading from the App Store or Google Play.',
    coreCapabilities: [
      'Zero-Install Add-to-Home-Screen Prompts: Native install banners and step-by-step installation guides for Safari (iOS) and Chrome (Android).',
      'Biometric & Passwordless Client Access: Instant, friction-free login with Face ID or WebAuthn.',
      'Offline Cache Resilience: Access saved property portfolios, loan rate cards, and 2nd Brain memos even without cellular signal.',
      'Shareable Magic Lead Links: Generate personalized micro-app invite links for clients via SMS or WhatsApp in 1 click.',
      'Tablet Kiosk Presenter: Turn any iPad or Android tablet into a high-converting Open House lead generation kiosk with camera QR scan.'
    ],
    stackedBenefits: [
      {
        target: 'Real Estate GeoMap',
        headline: 'Turnkey Field Client Portal',
        description: 'Homebuyers install the co-branded micro-app on iPhone/Android, enabling offline DPA lookups, Sunday Drive geofence alerts, and live showing requests during open house tours.'
      }
    ]
  },
  {
    id: 'csv_maker',
    title: 'Module 7: Vantage AI Studio - CSV Maker+ Multi-CRM Hygiene & Export Plugin',
    hook: 'Clean Messy Lead Lists, Eliminate Non-ASCII 1-127 Encoding Errors, Deduplicate Multi-Source Databases & Export Pre-Formatted CSVs for 5 Top CRMs in 1 Click.',
    summary: 'A high-performance batch data processing and hygiene engine designed to clean, normalize, and format lead databases for Total Expert, Big Purple Dot, BoldTrail/kvCORE, Salesforce, and HubSpot with instant 1-click ZIP distribution downloads.',
    coreCapabilities: [
      'ASCII 1-127 Unicode Character Sanitizer: Automatically strips illegal, invisible, or corrupted non-ASCII control characters that cause CRM import crashes.',
      'Multi-Source Batch Deduplication Engine: Cross-references multiple lead sheets simultaneously to detect and merge duplicate email addresses and phone numbers.',
      'Automated Full Name Splitter & Phone Normalizer: Converts composite "John & Jane Doe" full name strings into standardized First Name, Last Name, and E.164 phone formats.',
      '5 Pre-Configured CRM Schema Exporters: 1-click export templates specifically formatted for Total Expert, Big Purple Dot, BoldTrail, Salesforce, and HubSpot.',
      'ZIP Distribution Package Builder: Generates complete standalone plugin bundles (.zip) with embedded React dropzone components, Express router code, OpenAPI schemas, and commercial license documentation.'
    ],
    stackedBenefits: [
      {
        target: '2nd Brain Memory',
        headline: 'Automated Database Suppression Ingestion',
        description: 'Purged spam domains and competitor records are immediately passed to the 2nd Brain to permanently block future bad lead entries.'
      },
      {
        target: 'Workspace UI',
        headline: 'Seamless Google Sheets & Drive Export',
        description: 'Sanitized CSV lists can be pushed directly into Google Sheets relational databases or saved to Google Drive folders in 1 click.'
      }
    ]
  }
];

export const STACKED_SUPERPOWERS = [
  {
    title: '1. The Autonomous "Lead-to-Closing" Feedback Loop',
    description: 'A first-time buyer visits your website, calculates their DTI affordability envelope, and favorites two USDA 0%-down eligible homes. The Vantage 2nd Brain indexes their budget. When a price cut occurs, the Autonomous Cron Agent flags the reduction, updates the buyer\'s profile, and drafts a personalized email in Gmail Live Drafts for the assigned Realtor and Loan Officer.'
  },
  {
    title: '2. Hands-Free, Voice-Driven Workspace Operating System',
    description: 'Execute multi-tool workflows across your entire Vantage Workspace UI and CRM with natural speech, protected by explicit verbal confirmation airgaps and active guardrails stored in the Vantage 2nd Brain.'
  },
  {
    title: '3. Complete Data Hygiene & Permanent Suppression Lists',
    description: 'Clean thousands of messy leads across multiple CSV/XLSX files using the Targeted String/Domain Purge Filter, with purged spam domains permanently logged into the Vantage 2nd Brain so your databases remain pristine forever.'
  },
  {
    title: '4. The Co-Branded LO+Agent AI 2nd Brain Triage Engine',
    description: 'Visitors submit comments, questions, or showing requests on any property listing. The AI 2nd Brain instantly decomposes the inquiry into Loan Officer domains (loan programs, DPA, credit, pre-approval, monthly payments, underwriting, income, interest rate) vs. Realtor Agent domains (property address, specs, pricing trends, private tours, walk-throughs, offer strategy, seller concessions), simultaneously emailing both professionals with 1-click pre-drafted responses.'
  },
  {
    title: '5. Sunday Drive Geofenced Mobility Radar & Open House Tablet Kiosk',
    description: 'Homebuyers driving on weekends receive real-time proximity alerts when entering USDA 100% zero-down zones or within 0.5 miles of favorited listings. At open houses, agents present a 1-tap tablet kiosk with high-contrast QR codes and native SMS intent sharing, allowing visitors to save the co-branded portal directly to their phone home screen in 2 seconds.'
  }
];

export const SOCIAL_MEDIA_CAMPAIGNS: SocialMediaPost[] = [
  {
    id: 'linkedin_tab_fatigue',
    platform: 'LinkedIn',
    title: 'The Death of "Tab Fatigue" (Why We Rebuilt Google Workspace with AI)',
    hook: 'You do not have an productivity problem. You have a "14-open-browser-tabs" problem.',
    content: `Here is the average executive workday in 2026:
1. Open ChatGPT or Claude to write an email.
2. Copy the output.
3. Switch tabs to Gmail.
4. Paste the text and spend 5 minutes fixing weird markdown spacing.
5. Switch to Google Calendar to check availability.
6. Switch to Google Sheets to cross-check client numbers.
7. Repeat this 35 times a day.

That is NOT an AI workflow. That is manual labor with extra steps.

We built the Vantage AI Workspace UI to solve this once and for all:
✅ Dual-Pathway Google Authentication (1-click personal or enterprise domain OAuth)
✅ Live Gmail Draft Studio that writes directly inside your inbox with full client memory
✅ Automatic 15-Minute HIPAA & Focus buffer reservations around high-stakes meetings
✅ Google Sheets Relational Database Engine with 1-click domain purging & CSV cleanup
✅ Zero API key exposure to the browser

When AI lives INSIDE your tools rather than in a separate chat tab, you get 2+ hours back every single day.

How many browser tabs do you currently have open right now? 👇`,
    hashtags: ['#ArtificialIntelligence', '#Productivity', '#GoogleWorkspace', '#ExecutiveTech', '#SaaS', '#Automation'],
    callToAction: 'Try the live interactive demo or get the commercial plugin: [Link]'
  },
  {
    id: 'twitter_thread_ai_os',
    platform: 'Twitter / X',
    title: 'How to Turn Google Workspace into an Autonomous AI OS (Thread 🧵)',
    hook: 'Most people use AI like a toy chatbot. Smart teams use it like a Chief of Staff. Here is the exact architecture we used to turn Google Workspace into an autonomous AI operating system 🧵👇',
    content: `1/7 Most AI assistants suffer from Goldfish Amnesia. The moment you close the tab, they forget your clients, your pricing rules, and your tone of voice.

2/7 To fix this, we created the Vantage 2nd Brain Cognitive Core. It indexes client personas and past decisions using hybrid vector recall across DeepSeek, Claude, and Gemini.

3/7 Next: The Workspace UI Bridge. Instead of copying and pasting, our Dual-Pathway Auth allows the AI to draft real emails inside Gmail, create calendar events, and query Google Sheets like SQL.

4/7 Our favorite feature? The 15-Minute Focus Buffer. The AI automatically blocks 15-minute recovery intervals around confidential meetings to eliminate calendar exhaustion.

5/7 For data cleanup, the Targeted String/Domain Purge Filter cleans 10,000 messy CSV rows in 3 seconds—and permanently remembers purged spam domains so they never return.

6/7 Best of all: It's available as a drop-in, containerized React/Next.js plugin with domain-locked commercial licensing.

7/7 Want the full code or live demo? Check out the GitHub repo or grab the instant commercial package: [Link]`,
    hashtags: ['#BuildInPublic', '#AI', '#TypeScript', '#React', '#DevTools', '#GoogleCloud'],
    callToAction: 'Retweet & bookmark if you want to eliminate tab switching in 2026!'
  },
  {
    id: 'reels_tiktok_script',
    platform: 'Instagram / Reels',
    title: '30-Second Script: "Why I Stopped Copy-Pasting from ChatGPT"',
    hook: '[VISUAL: Show screen with 18 messy tabs, frustratingly clicking back and forth]',
    content: `[SPEAKER ON CAMERA]:
"If you are still copy-pasting text from ChatGPT into your Gmail and Google Sheets... you are doing AI completely wrong.

[CUT TO SCREEN RECORDING OF VANTAGE WORKSPACE UI]:
Look at this. This is Vantage AI Workspace.
I just speak one sentence: 'Summarize John's proposal in Drive, draft a reply in Gmail with our updated Q3 pricing, and block 15 minutes after our call tomorrow.'

[WATCH SCREEN EXECUTE]:
Watch what happens:
1. It pulls the doc from Google Drive.
2. It drafts a real formatted email in Gmail Drafts with John's previous notes recalled from memory.
3. It blocks the 15-minute buffer on Google Calendar.

Zero copy-pasting. Zero tab switching. 

[SPEAKER BACK ON CAMERA]:
Grab the commercial plugin for your site or team in my bio link!"`,
    hashtags: ['#AItools', '#TechHacks', '#ProductivityHacks', '#WorkflowAutomation', '#SmallBizTech'],
    callToAction: 'Link in bio for instant commercial access.'
  }
];

export const FACEBOOK_META_ADS: AdCampaignAngle[] = [
  {
    id: 'meta_executive_pain',
    name: 'Facebook Ad 1: "The 14-Tab Nightmare" (Direct Response for Executives & Solos)',
    channel: 'Facebook & Instagram Feed Ads',
    targetAudience: 'Business Owners, Consultants, Executives, Realtors, Agency Founders (Ages 28–55)',
    headline: 'Stop Copy-Pasting from ChatGPT into Gmail. Run Your Entire Business in One AI Workspace.',
    bodyCopy: `How much time did you waste today switching between ChatGPT, Gmail, Google Drive, and your Calendar?

Most AI tools live in a separate browser tab with zero connection to your real files, clients, or spreadsheets.

Meet Vantage AI Workspace UI:
🚀 Live Gmail Draft Studio: Drafts high-converting, context-aware emails directly inside your inbox.
📅 15-Minute Calendar Buffer Engine: Automatically guards your schedule against back-to-back meeting fatigue.
📊 Google Sheets SQL & Purge Tool: Cleans thousands of messy lead rows and removes spam domains in seconds.
🧠 Permanent 2nd Brain: Remembers your clients, preferences, and past decisions across sessions.
🔒 Dual-Pathway Security: Zero browser API key exposure with enterprise OAuth protection.

Drop this turnkey plugin onto your website or client portal in under 60 seconds.

👉 Click below to see the interactive live preview and claim your commercial license before pricing increases.`,
    cta: 'Get Turnkey Commercial License ($49/mo or $297 Buyout)',
    creativeNotes: 'Clean split-screen visual showing "Old Way: 14 messy tabs" vs "New Way: Unified Vantage AI Workspace with 1-click execution".'
  },
  {
    id: 'meta_saas_builders',
    name: 'Facebook Ad 2: For AI Developers, SaaS Founders & Agency Owners',
    channel: 'Facebook Feed & Audience Network',
    targetAudience: 'Software Engineers, Next.js / React Developers, No-Code Builders, Agency Owners',
    headline: 'Embed Google Workspace AI & 2nd Brain Vector Memory into Your Web App with 1 Line of Code.',
    bodyCopy: `Tired of spending 3 weeks building OAuth flows, vector memory state machines, and Google API integrations from scratch?

Vantage AI Workspace UI gives you:
⚡ Turnkey Dual-Pathway Auth (Google Identity Services + Domain OAuth)
⚡ Pre-built Live Gmail Draft Studio, Drive Explorer, and Calendar Buffer components
⚡ AST-Obfuscated, domain-locked distribution scripts with SHA-256 tamper protection
⚡ Drop-in React widgets and headless TypeScript hooks ready for Claude, ChatGPT-4o, and Cursor

Stop reinventing the wheel. Ship enterprise-grade Google Workspace automation to your clients this weekend.`,
    cta: 'Download Source Code & OpenAPI Specs',
    creativeNotes: 'High-contrast code editor mockup showing simple `<VantageWorkspaceUI />` embed alongside running UI.'
  },
  {
    id: 'meta_real_estate_brokerage',
    name: 'Facebook Ad 3: For Real Estate Brokers & Mortgage Team Leads',
    channel: 'Facebook & Instagram B2B',
    targetAudience: 'Real Estate Brokers, Producing Agents, Mortgage Branch Managers, Loan Officers',
    headline: 'Turn Renters into Pre-Approved Buyers on Your Website with USDA 100% & $10K Grant AI Matching.',
    bodyCopy: `74% of first-time homebuyers abandon real estate websites because they think they need 20% down.

The Vantage Real Estate GeoMap plugin automatically:
🏡 Checks 11-digit Census Tracts for $5,000–$10,000 down payment assistance grants
🌲 Identifies USDA 100% Zero-Down financing eligibility zones in real time
💰 Computes front-end & back-end DTI affordability envelopes on active listings
📬 Syncs prequalified buyer records directly into your Google Sheets and Gmail Drafts

Add it to your existing agent website in 60 seconds and start capturing pre-qualified purchase leads today.`,
    cta: 'Test the Interactive Grant Map Demo',
    creativeNotes: 'Interactive map mockup showing blue/green grant pins and instant DTI calculator sliders.'
  },
  {
    id: 'meta_carousel_story',
    name: 'Facebook Ad 4: Short-Form Carousel & Instagram Stories Ad',
    channel: 'Instagram Stories & Reels Ads',
    targetAudience: 'Productivity Enthusiasts, Remote Workers, Small Business Owners',
    headline: 'Your AI is missing 4 superpowers. Swipe to see how to unlock them 👉',
    bodyCopy: `Card 1: 🧠 A 2nd Brain that never forgets past client notes.
Card 2: 📧 A Gmail Draft Studio that writes in your exact tone.
Card 3: 📅 A Calendar Buffer that stops back-to-back meeting burnout.
Card 4: 📊 A Google Sheets Purge tool that cleans messy lead databases in 1 click.
Card 5: 🚀 All 4 in one containerized plugin. Link below!`,
    cta: 'Swipe Up / Click to Unlock',
    creativeNotes: '5-card swipeable carousel with crisp 3D icons on dark indigo background.'
  },
  {
    id: 'meta_agent_attraction_machine',
    name: 'Facebook Ad 5: "The Ultimate Agent Attraction Machine for Loan Officers"',
    channel: 'Facebook & Instagram B2B (Targeting Mortgage Originators & Branch Managers)',
    targetAudience: 'Mortgage Loan Officers, Producing Originators, NMLS Licensees, Branch Managers',
    headline: 'Stop Begging Agents for Referrals. Hand Them a Co-Branded AI GeoMap & Open House Kiosk.',
    bodyCopy: `Top real estate agents are tired of loan officers offering "great rates and fast turn times."

Instead, hand them a turnkey, co-branded technology asset:
🤝 Co-Branded Portal: Highlights your LO credentials side-by-side with their headshot, license, and active listings.
📱 1-Tap Tablet Kiosk Presenter: Turn any iPad into an Open House registration kiosk with live QR codes and offline PWA saving.
💬 Native Mobile SMS Sharing: Agents text properties with 1 tap—pre-populating your co-branded financing link.
🧠 AI 2nd Brain Lead Triage: When a buyer submits notes, AI automatically separates financing questions for you from showing/property questions for the agent—emailing both simultaneously!
🛡️ Solo LO Mode: Works standalone with zero agent intermediaries whenever you want direct borrower control.

Win 3-5 new exclusive Realtor partners this month with modern technology.`,
    cta: 'Claim Your Co-Branded LO+Agent License ($49/mo)',
    creativeNotes: 'Sleek visual mockup showing Mike Ford + Kanndice McLean co-branded HUD, tablet kiosk QR code, and AI lead triage breakdown.'
  },
  {
    id: 'meta_ai_lead_triage',
    name: 'Facebook Ad 6: "AI 2nd Brain Lead Triage: Stop Fighting Over Web Leads"',
    channel: 'Facebook Feed & LinkedIn Sponsored Content',
    targetAudience: 'Real Estate Brokers, Team Leads, Mortgage Branch Managers',
    headline: 'AI Now Separates Mortgage Questions from Property Tours in Real-Time.',
    bodyCopy: `When a homebuyer submits questions on your website, who should respond first?

If they ask: "What are the HOA fees, can we see it Saturday, and do I qualify for the 0% down USDA grant?"
Normally, the lead gets lost in email chains or one party forgets to reply.

The Vantage AI 2nd Brain Lead Triage Engine solves this automatically:
⚡ Decomposes the text using Gemini 3.8 Flash.
📋 Routes loan programs, credit, DTI, and DPA questions directly to the Loan Officer.
🏡 Routes showing requests, property specs, and offer questions directly to the Realtor.
📬 Simultaneously emails both professionals with 1-click pre-drafted replies and urgency ratings.

Double your speed-to-lead and convert more web visitors into closed escrows.`,
    cta: 'Test Live AI Lead Triage Demo',
    creativeNotes: 'Split-screen UI showing visitor comment on left and AI cognitive decomposition into LO vs. Agent columns on right.'
  }
];

export const AD_CAMPAIGN_ANGLES = FACEBOOK_META_ADS;

export const GOOGLE_ADS_CAMPAIGNS: GoogleAdGroup[] = [
  {
    id: 'google_workspace_ai_search',
    campaignName: 'Campaign 1: High-Intent Google Workspace AI & Productivity',
    targetKeywords: [
      'google workspace ai automation',
      'ai gmail draft assistant',
      'ai for google calendar scheduling',
      'google sheets ai database plugin',
      'autonomous workspace operating system',
      'ai copilot for google drive'
    ],
    headlines: [
      'Vantage AI Workspace UI',
      'Turn Workspace into AI OS',
      'AI Gmail Draft Studio',
      'Autonomous Calendar Buffers',
      'Google Sheets SQL AI Tool',
      'Zero Tab Fatigue AI',
      'Embed AI in 60 Seconds',
      'Try Interactive Live Demo'
    ],
    descriptions: [
      'Stop copy-pasting from ChatGPT. Execute drafts, calendar buffers, and sheet cleanups directly.',
      'Dual-Pathway Google Auth, 15-min focus buffers, and permanent 2nd brain memory in one plugin.',
      'Deploy the turnkey Google Workspace AI operating system on your domain today. Instant setup.',
      'Protected with enterprise OAuth, server-side API keys, and airgapped safety guardrails.'
    ],
    sitelinks: [
      { title: 'Live Interactive Demo', desc: 'Test Gmail drafts & calendar buffer engine in real time.' },
      { title: 'Pricing & Licensing', desc: 'Solo pro, team edition, and perpetual buyout packages.' },
      { title: 'Google Sheets Purge Tool', desc: 'Clean messy CSV lists and remove spam domains instantly.' },
      { title: '2nd Brain Memory Specs', desc: 'Permanent vector memory harness for Claude & ChatGPT.' }
    ],
    callouts: [
      'Dual-Pathway Google Auth',
      'Zero Browser API Key Exposure',
      '15-Min Meeting Buffer Automation',
      'Permanent 2nd Brain Memory',
      'Instant Commercial License',
      'AST-Obfuscated Code'
    ]
  },
  {
    id: 'google_real_estate_search',
    campaignName: 'Campaign 2: Real Estate & Mortgage Lead Automation',
    targetKeywords: [
      'real estate website grant calculator',
      'usda 100 zero down area checker',
      'dti affordability calculator plugin',
      'census tract cra grant widget',
      'mortgage lead capture ai tool',
      'ai lead capture form real estate',
      'co-branded real estate lead portal'
    ],
    headlines: [
      'Real Estate AI GeoMap Plugin',
      'USDA 0% Down Area Checker',
      '$10K CRA Grant Matcher',
      'AI 2nd Brain Lead Triage',
      'Live DTI Affordability Tool',
      'Turn Renters into Buyers',
      'Drop-In Real Estate Plugin'
    ],
    descriptions: [
      'Embed USDA 100% financing and $10K CRA grant checkers on your real estate website in 60 seconds.',
      'AI 2nd Brain segments buyer questions for LO and Agent, simultaneously emailing both with 1-click replies.'
    ],
    sitelinks: [
      { title: 'Grant Map Demo', desc: 'Check 11-digit Census Tract CRA grant eligibility.' },
      { title: 'AI Lead Triage Demo', desc: 'Automatic LO vs Agent cognitive inquiry decomposition.' },
      { title: 'USDA Zone Checker', desc: 'Instant 100% zero-down rural boundary matching.' },
      { title: 'Open House Kiosk', desc: 'Interactive tablet kiosk with instant QR code scanning.' }
    ],
    callouts: ['RentCast Integration', 'Census Tract FIPS Matching', 'AI 2nd Brain Triage', 'Dual LO+Agent Dispatch']
  },
  {
    id: 'google_agent_attraction_search',
    campaignName: 'Campaign 3: Loan Officer Agent Attraction & Co-Branded Tech',
    targetKeywords: [
      'loan officer agent attraction tool',
      'co-branded real estate mortgage app',
      'open house sign in sheet app ipad',
      'open house qr code lead capture',
      'mortgage technology for realtor partners'
    ],
    headlines: [
      'Attract Top Realtor Partners',
      'Co-Branded LO + Agent Portal',
      'Open House Tablet Kiosk App',
      'Native SMS Listing Share',
      'Instant Pre-Approval Dossier',
      'Dual-Dispatch Lead Engine'
    ],
    descriptions: [
      'Offer your Realtor partners a branded GeoMap portal, 1-tap iPad open house kiosk, and instant AI lead triage.',
      'Solo LO mode and paired partner bridges. Text listings via native SMS with zero app store friction.'
    ],
    sitelinks: [
      { title: 'Tablet Kiosk Presenter', desc: 'High-contrast QR code open house presenter for iPad.' },
      { title: 'Agent Contact Card Copy', desc: '1-tap bio copy formatted for Instagram, TikTok & LinkedIn.' }
    ],
    callouts: ['Co-Branded HUD', 'Native SMS Sharing', 'Solo LO Toggle', '1-Tap Bio Cards']
  }
];

export const WEBSITE_SHORT_HOOKS: WebsiteHookCategory[] = [
  {
    category: 'High-Tech & Authority Hooks',
    hooks: [
      {
        headline: "Turn Google Workspace into an Autonomous AI Operating System.",
        subheadline: "Execute real Gmail drafts, 15-minute calendar buffers, and relational sheets cleanups without ever leaving your workflow.",
        badge: "Next-Gen AI OS",
        targetAudience: "General Business & Executives"
      },
      {
        headline: "The First AI Workspace with Zero-Prompt Contextual Recall.",
        subheadline: "Powered by a permanent 2nd Brain that remembers your clients, past decisions, and corporate boundaries across sessions.",
        badge: "Permanent Memory",
        targetAudience: "Tech Leaders & AI Builders"
      },
      {
        headline: "Dual-Pathway Google Authentication: Enterprise Power, Zero Friction.",
        subheadline: "Seamlessly switch between 1-click personal Google Identity popups and enterprise domain OAuth 2.0.",
        badge: "Enterprise Security",
        targetAudience: "IT Directors & Security Officers"
      }
    ]
  },
  {
    category: 'Pain-Relief & Time-Saving Hooks',
    hooks: [
      {
        headline: "Stop the 14-Tab Nightmare. Give Your AI Real Hands.",
        subheadline: "No more copying from ChatGPT and pasting into Gmail. One click executes across your entire Google suite.",
        badge: "Eliminate Tab Fatigue",
        targetAudience: "Busy Professionals"
      },
      {
        headline: "Save 14.5 Hours Every Single Week on Administrative Busywork.",
        subheadline: "Let autonomous agents draft follow-ups, guard your calendar with recovery buffers, and purge dirty databases.",
        badge: "14.5 Hrs/Wk Saved",
        targetAudience: "Solopreneurs & Executives"
      },
      {
        headline: "End Back-to-Back Meeting Exhaustion with Automated 15-Minute Buffers.",
        subheadline: "Our smart calendar scheduler automatically reserves breathing room around confidential client meetings.",
        badge: "HIPAA & Focus Buffer",
        targetAudience: "Consultants, Clinicians & Lawyers"
      }
    ]
  },
  {
    category: 'Commercial & Developer Hooks',
    hooks: [
      {
        headline: "Embed a Production-Ready AI Workspace into Any Website in 60 Seconds.",
        subheadline: "Complete with AST-obfuscated domain locking, SHA-256 tamper verification, and full commercial redistribution rights.",
        badge: "Turnkey Plugin",
        targetAudience: "SaaS Founders & Agency Owners"
      },
      {
        headline: "Monetize AI in Your Niche with Pre-Trained Industry Specialty Brains.",
        subheadline: "From mortgage loan officers to corporate counsel—distribute customized cognitive plugins with recurring revenue.",
        badge: "Turnkey Agency MRR",
        targetAudience: "Agencies & Digital Product Sellers"
      }
    ]
  },
  {
    category: 'Real Estate & Mortgage Hooks',
    hooks: [
      {
        headline: "Turn Renters into Pre-Approved Homebuyers on Your Agent Website.",
        subheadline: "The only plugin with USDA 100% zero-down area checkers, $10,000 CRA grant finders, and live DTI affordability math.",
        badge: "Lead Conversion Engine",
        targetAudience: "Realtors & Loan Officers"
      },
      {
        headline: "Most Buyers Think They Need 20% Down. Show Them the Truth in Seconds.",
        subheadline: "Our 11-digit Census Tract scanner instantly flags government grants and low-down financing programs on every listing.",
        badge: "Grant Qualifier",
        targetAudience: "Mortgage Brokers"
      }
    ]
  }
];

export const COLD_OUTBOUND_EMAIL_TEMPLATES = [
  {
    id: 'exec_tab_fatigue_cold_email',
    target: 'C-Suite Executives & Business Owners',
    subject: 'quick question about your team\'s Google Workspace + AI setup',
    body: `Hi {{firstName}},

Quick observation: most leadership teams are spending 2+ hours a day copying and pasting AI outputs back and forth between ChatGPT, Gmail, Sheets, and their Calendar.

We built Vantage AI Workspace UI to turn Google Workspace into an autonomous operating system:
- Real Gmail Draft Studio with zero-prompt client memory
- Automated 15-minute calendar focus buffers to prevent back-to-back meeting fatigue
- Google Sheets relational cleanup that removes spam domains in 1 click
- 100% server-side security with zero browser API key exposure

Are you open to a 3-minute video showing how this eliminates tab fatigue across your team?

Best regards,

Mike Ford
Vantage AI Workspace Hub (fordmj@gmail.com)`
  },
  {
    id: 'realtor_lender_cold_email',
    target: 'Real Estate Brokerage Owners & Top Producing Teams',
    subject: 'adding a USDA 0%-down & $10k grant calculator to {{brokerageName}}\'s site?',
    body: `Hi {{firstName}},

Most first-time buyers leave real estate websites because they mistakenly believe they need a 20% down payment.

We built a plug-and-play React/Next.js plugin called the Vantage Real Estate GeoMap:
1. Instantly checks 11-digit Census Tracts for $5,000–$10,000 CRA buyer grants
2. Identifies USDA 100% zero-down financing zones in real time
3. Calculates interactive DTI affordability math on active listings
4. Syncs prequalified leads directly into your Google Sheets & Gmail Drafts

It installs on any website in under 60 seconds.

Would you be against me sending over a 2-minute live demo link tailored for {{city}}?

Cheers,

Mike Ford
Vantage AI Workspace Hub (fordmj@gmail.com)`
  }
];

export const COMMERCIAL_SALES_PITCH_DECK_MARKDOWN = `
# 🚀 VANTAGE AI WORKSPACE SUITE: MASTER COMMERCIAL SALES PITCH DECK & MULTI-CHANNEL AD VAULT
> **Author & Copyright Holder**: Mike Ford (\`fordmj@gmail.com\`)  
> **Licensing**: Vantage AI Commercial License (Domain-Locked, SHA256-MF Anti-Tamper Protected)  
> **Core Offerings**: Vantage AI Workspace UI, 2nd Brain Cognitive Core, Voice Orchestrator & Real Estate GeoMap  
> **Target Audiences**: Executives, Real Estate Brokers, Loan Officers, Agency Owners, SaaS Founders & AI Developers  
> **Distribution Channels**: SaaS Landing Pages, LinkedIn, Twitter/X, Facebook/Meta Ads, Google Search Ads, Etsy & GitHub Marketplace

---

## 📑 TABLE OF CONTENTS
1. [Executive Master Hook & Value Proposition](#1-executive-master-hook--value-proposition)
2. [Vantage AI Workspace UI: Deep-Dive Sales Pitch](#2-vantage-ai-workspace-ui-deep-dive-sales-pitch)
3. [4-in-1 Suite Modules & Stacked Superpowers](#3-4-in-1-suite-modules--stacked-superpowers)
4. [Commercial Pricing Tiers & Professional Services](#4-commercial-pricing-tiers--professional-services)
5. [Multi-Channel Social Media Campaigns (LinkedIn, X, Reels)](#5-multi-channel-social-media-campaigns)
6. [Ready-to-Run Facebook / Meta Ad Campaigns](#6-ready-to-run-facebook--meta-ad-campaigns)
7. [High-Intent Google Ads Search Campaigns](#7-high-intent-google-ads-search-campaigns)
8. [High-Converting Website Short Hooks & Micro-Copy](#8-high-converting-website-short-hooks--micro-copy)
9. [Cold Outbound Executive Email Sequences](#9-cold-outbound-executive-email-sequences)
10. [Copyright, Anti-Theft & Distribution License](#10-copyright-anti-theft--distribution-license)

---

## 1. EXECUTIVE MASTER HOOK & VALUE PROPOSITION

### 🎯 The Big Problem: "Goldfish Amnesia" & "The 14-Tab Nightmare"
Every popular AI chatbot suffers from three fatal bottlenecks:
1. **Goldfish Amnesia**: The moment you close the browser tab, the AI forgets who your clients are, what your preferences were, and what projects you're working on.
2. **Tab Fatigue**: Professionals waste 14+ hours every week constantly copy-pasting text between ChatGPT, Gmail, Google Drive, and Google Sheets.
3. **Execution Paralysis**: Generic chatbots can only generate text—they cannot take real, audited business actions safely.

### 💡 The Vantage AI Solution:
**Vantage AI Workspace UI + 7-in-1 Suite** transforms stateless LLMs (Claude 3.7, ChatGPT-4o, Gemini 3.0, DeepSeek-V4.1-Flash) into an **autonomous, interconnected operating system**. It embeds permanent vector memory, dual-pathway Google Workspace execution, hands-free voice orchestration, and specialized real estate DTI math directly into your daily workflow.

---

## 2. VANTAGE AI WORKSPACE UI: DEEP-DIVE SALES PITCH

### 🪝 The Hook:
> **"Turn Google Workspace into an Autonomous AI Operating System. Dual-Pathway Auth, Live Gmail Draft Studios, 15-Minute HIPAA Calendar Buffers & Relational Sheets Cleanup."**

### 📦 What It Does:
Vantage AI Workspace UI is a containerized, production-ready interface and API bridge that connects AI models directly to Google Workspace using Dual-Pathway Authentication.

### 🌟 The 5 Core Pillars:
1. **Dual-Pathway Authentication Engine**:
   - *Pathway A (Instant Personal GIS)*: 1-click Google Identity Services client popup for solo users with zero backend configuration.
   - *Pathway B (Enterprise Domain OAuth)*: Full Google Cloud OAuth 2.0 with domain-wide delegation for multi-seat brokerages and teams.
2. **Zero-Prompt Live Gmail Draft Studio**:
   - Analyzes incoming email threads and pulls historical context from the 2nd Brain.
   - Formats real, ready-to-review Google Drafts inside Gmail via official REST APIs.
   - Strictly enforces a human-in-the-loop review airgap (never sends blindly).
3. **Calendar 15-Minute Focus & HIPAA Compliance Buffer Engine**:
   - Automatically detects confidential client meetings and inserts 15-minute transitional recovery buffers.
   - Eliminates back-to-back meeting fatigue while maintaining strict compliance boundaries.
4. **Google Sheets Relational Database & Purge Filter Engine**:
   - Queries standard Google Sheets like relational SQL databases with atomic writes.
   - Includes a targeted String/Domain Purge Filter to remove competitor emails, unsubscribe domains, and spam rows across all columns.
   - Multi-File CSV/XLSX pipeline merges messy lead files into clean master databases.
5. **Drive Explorer & Docs AI Synthesizer**:
   - 1-click semantic search and summarization across Drive files into structured Google Docs.

---

## 3. 6-IN-1 SUITE MODULES & STACKED SUPERPOWERS

### 🧩 The 6 Core Plugin Modules:
1. **Vantage AI Workspace UI**: Gmail Drafts, Calendar Buffers, Drive Explorer, Sheets Relational SQL Engine, Targeted String/Domain Purge Filter.
2. **Vantage 2nd Brain Cognitive Core**: Hierarchical vector memory, DeepSeek/Gemini recall, client personas, airgapped guardrails, circadian memory consolidation.
3. **Vantage Voice Orchestrator**: Speech-to-intent decomposition, compound multi-step execution, spoken confirmation airgap.
4. **Flagship Real Estate GeoMap & DPA Mortgage Plugin (GeoMap 3.0)**:
   - **Customizable Lead Capture Form with AI 2nd Brain Triage**: Automatically decomposes buyer questions into Loan Officer domains (loan programs, DPA, credit scores, pre-approval, monthly payments, DTI, underwriting, income, taxes, interest rates) vs. Realtor Agent domains (property address, beds/baths/sqft, DOM, pricing trends, private tours, walk-throughs, meetup/coffee, search criteria, seller concessions).
   - **Simultaneous Dual-Email Dispatch**: Instantly notifies both the Loan Officer (fordmj@gmail.com) and paired Realtor Agent (kanndice@cascadepremier.com) with pre-drafted 1-click replies and actionable urgency ratings.
   - **Dynamic Solo LO Mode vs. Co-Branded Combo Pack**: Easily pairs an LO with a top-producing agent for co-branded lead attraction; if no agent is selected, it cleanly degrades to Solo LO Mode with zero external agent intermediary.
   - **Co-Branded 1-Tap Agent Contact Card**: Copies a pre-formatted contact card with name, license #, broker, headshot, and co-branded link ready to paste into Instagram, TikTok, LinkedIn bios, and email signatures.
   - **Native Mobile Share via SMS Intent**: Triggers native mobile SMS sharing pre-populated with the co-branded property link, listing specs, and dual contact info.
   - **Live Showing QR Code & Tablet Kiosk Presenter**: Interactive Open House / Showing Kiosk mode with high-contrast QR code for instant phone scanning and offline PWA saving.
   - **Multi-Layer DPA Grant Waterfall Stacking Solver**: Stacks Lakeview National 100% DPA, OHCS Flex Lending ($15,400), CRA $5k-$10k Grants, USDA 100% 0-down, and Fannie Mae HomeReady (3% down) to solve for True Zero Out-of-Pocket closing cash.
   - **Proactive Geofenced Interest Radius Alert Radar**: Real-time mobility radar triggers cross-platform mobile alerts when a buyer physically drives within 0.5 miles of a favorited listing or enters a USDA 100% zero-down corridor.
   - **Real-Time Collaborative Co-Borrower Canvas**: Sliders for joint co-borrower gross income and liabilities dynamically recalculate front/back-end DTI limits with live visual comparisons.
   - **DeepThink Pre-Mortem Modal**: Analyzes property vulnerability, tax reassessment resets, aging capital expenditure reserves, and underwriting flags.
5. **Commercial Enterprise All-in-One Master Suite**: Centralized multi-tenant admin gateway, SHA256-MF anti-tamper security, unified state synchronization, and whitelabel embedding rights.
6. **Mobile Micro-Apps & Add-to-Home-Screen PWA Plugin**: Zero-install PWA client portal, biometric login, offline cache resilience, shareable magic lead links, and Open House tablet kiosk mode.

### ⚡ Top 5 Stacked Superpowers:
- **1. The Autonomous Lead-to-Closing Loop**: A homebuyer calculates their DTI envelope on your website and favorites two USDA homes. The 2nd Brain indexes their budget. When a price cut occurs, background cron agents flag the reduction, update the profile, and draft an outreach email in Gmail Live Drafts for the assigned Realtor and Loan Officer.
- **2. Hands-Free Voice-Driven Workspace OS**: Execute multi-tool workflows across Gmail, Calendar, and CRM with natural speech, protected by spoken confirmation airgaps and active guardrails.
- **3. Complete Data Hygiene & Permanent Suppression**: Clean thousands of messy leads across CSV/XLSX files, with purged spam domains permanently memorized by the 2nd Brain so they never re-enter your CRM.
- **4. The Co-Branded LO+Agent AI 2nd Brain Triage Engine**: Visitor comments on any listing are automatically decomposed by AI and simultaneously emailed to the LO and Agent, eliminating lead handoff friction.
- **5. Sunday Drive Geofenced Mobility Radar & Open House Tablet Kiosk**: Real-time proximity alerts when driving near grant-eligible homes + 1-tap tablet kiosk for weekend open houses with instant camera QR scanning and 1-tap SMS intent sharing.

---

## 4. COMMERCIAL PRICING TIERS & PROFESSIONAL SERVICES

| Tier | Price | Ideal Customer | Deliverables & Rights |
| :--- | :--- | :--- | :--- |
| **Individual Pro Edition** | **$49 / mo** *(or $490/yr)* | Solo Realtors, Loan Officers, Freelance Devs, Consultants | • 1 Production Domain / Landing Page<br>• Up to 250 Active User 2nd Brain Profiles<br>• Full access to Workspace UI + chosen plugin<br>• Dual-Pathway Google Integration |
| **Team / Agency Edition** | **$149 / mo** *(or $1,490/yr)* | Producing Real Estate Teams (3-10 agents), Agencies | • Up to 5 Production Domains / Client Sites<br>• Unlimited Active 2nd Brain Profiles<br>• Co-branded paired partner bridges (Agent + Loan Officer)<br>• Automated weekly \`dsh-cron\` audits & alert drafts |
| **Enterprise SaaS Edition (4-in-1 Suite)** | **$499 / mo** *(or $4,990/yr)* | Full Brokerages, Regional Lenders, SaaS Founders | • **Complete Vantage AI Suite Combo Pack (All 4 Modules)**<br>• Unlimited Domains & Whitelabel Rights<br>• Full Source Code Access (.ts / .js)<br>• Multi-LLM Gateway (Claude, ChatGPT, Gemini, DeepSeek)<br>• Dedicated Custom CRM Sync (Salesforce, HubSpot)<br>• 1-on-1 Dedicated Integration Engineering |
| **Perpetual Commercial Buyout** | **$297 - $997 One-Time** | Etsy, Gumroad & GitHub Marketplace Buyers | • Full \`.zip\` containing all 4 modules, \`.md\` scaffolding prompts, OpenAPI tool schemas, and perpetual SHA256-MF license key |

### 🛠️ High-Value Professional Add-Ons:
- **1-Time Customization & Installation Flat Fee**: **$2,500** (Full cloud setup, branding, OAuth verification & CRM seed sync)
- **Teams Training Video Call Series**: **$1,500** (3 live interactive training calls + recordings, PDF SOP cheat sheets)
- **Bi-Annual "Train the Brain" Ingestion Upgrade Subscription**: **$1,200 / year** (Scheduled vector re-indexing & regulatory updates)

---

## 5. MULTI-CHANNEL SOCIAL MEDIA CAMPAIGNS

### 📱 LinkedIn Viral Post: "The Death of Tab Fatigue"
> **Hook**: You do not have a productivity problem. You have a "14-open-browser-tabs" problem.  
> **Content**: Break down how jumping between ChatGPT, Gmail, Sheets, and Calendar wastes 14.5 hours a week. Introduce Vantage AI Workspace UI's unified operating canvas.  
> **CTA**: Try the live interactive demo or claim your commercial plugin license.

### 🐦 Twitter / X Thread: "How to Turn Google Workspace into an Autonomous AI OS"
> **Hook**: Most people use AI like a toy chatbot. Smart teams use it like a Chief of Staff. Here is the exact architecture 🧵👇  
> **Content**: 7-tweet breakdown covering Vector Memory, Dual-Pathway Auth, 15-min Focus Buffers, Sheets SQL & Purge Filters, and 1-line React embeds.

### 🎬 Instagram / Reels / TikTok 30-Second Video Script:
> **Visual**: Frustrated executive clicking between 18 messy tabs $\rightarrow$ transition to unified Vantage Workspace UI.  
> **Spoken**: *"I just speak one sentence: 'Summarize John's proposal in Drive, draft a reply in Gmail with our updated Q3 pricing, and block 15 minutes after our call tomorrow.' Watch it execute all 3 in seconds. Zero copy-pasting. Link in bio!"*

---

## 6. READY-TO-RUN FACEBOOK / META AD CAMPAIGNS

### 🎯 Ad 1: "The 14-Tab Nightmare" (Direct Response for Executives)
- **Headline**: *"Stop Copy-Pasting from ChatGPT into Gmail. Run Your Entire Business in One AI Workspace."*
- **Body Copy**: *"How much time did you waste today switching between ChatGPT, Gmail, Google Drive, and your Calendar? Vantage AI Workspace UI gives you a Live Gmail Draft Studio, 15-Minute Focus Buffers, and Google Sheets Purge tools with zero browser API key exposure."*
- **CTA**: *"Get Turnkey Commercial License ($49/mo or $297 Buyout)"*

### 🎯 Ad 2: For AI Developers & SaaS Founders
- **Headline**: *"Embed Google Workspace AI & 2nd Brain Vector Memory into Your Web App with 1 Line of Code."*
- **Body Copy**: *"Tired of building OAuth flows and vector memory state machines from scratch? Vantage gives you turnkey Dual-Pathway Auth, Live Gmail Draft Studios, and domain-locked AST-obfuscated distribution scripts ready for Claude, ChatGPT, and Cursor."*
- **CTA**: *"Download Source Code & OpenAPI Specs"*

### 🎯 Ad 3: For Real Estate Brokers & Loan Officers
- **Headline**: *"Turn Renters into Pre-Approved Buyers on Your Website with USDA 100% & $10K Grant AI Matching."*
- **Body Copy**: *"74% of first-time buyers abandon agent websites because they think they need 20% down. Our drop-in plugin checks 11-digit Census Tracts for $5,000–$10,000 grants and USDA 0%-down zones while calculating real-time DTI limits."*
- **CTA**: *"Test the Interactive Grant Map Demo"*

### 🎯 Ad 4: "The Ultimate Agent Attraction Machine for Loan Officers"
- **Headline**: *"Stop Begging Agents for Referrals. Hand Them a Co-Branded AI GeoMap & Open House Kiosk."*
- **Body Copy**: *"Top agents don't want another rate sheet. Hand them a co-branded portal with their headshot and active listings, a 1-tap iPad Open House kiosk, native SMS sharing, and AI 2nd Brain lead triage that emails both of you simultaneously."*
- **CTA**: *"Claim Your Co-Branded LO+Agent License ($49/mo)"*

### 🎯 Ad 5: "AI 2nd Brain Lead Triage: Stop Fighting Over Web Leads"
- **Headline**: *"AI Now Separates Mortgage Questions from Property Tours in Real-Time."*
- **Body Copy**: *"When a buyer asks about loan programs, DPA, and Saturday open houses, our AI segments the text instantly—emailing underwriting questions to the LO and tour requests to the Realtor with 1-click pre-drafted replies."*
- **CTA**: *"Test Live AI Lead Triage Demo"*

---

## 7. HIGH-INTENT GOOGLE ADS SEARCH CAMPAIGNS

### 🔍 Campaign 1: Google Workspace AI & Productivity
- **Target Keywords**: \`google workspace ai automation\`, \`ai gmail draft assistant\`, \`ai for google calendar scheduling\`, \`google sheets ai database plugin\`, \`autonomous workspace operating system\`
- **Headlines**: *"Vantage AI Workspace UI"*, *"Turn Workspace into AI OS"*, *"AI Gmail Draft Studio"*, *"Autonomous Calendar Buffers"*
- **Descriptions**: *"Stop copy-pasting from ChatGPT. Execute drafts, calendar buffers, and sheet cleanups directly in Google Workspace."*
- **Callout Extensions**: *Dual-Pathway Google Auth*, *Zero Browser API Key Exposure*, *15-Min Meeting Buffer Automation*, *Permanent 2nd Brain Memory*

### 🔍 Campaign 2: Real Estate & Mortgage Lead Automation
- **Target Keywords**: \`real estate website grant calculator\`, \`usda 100 zero down area checker\`, \`dti affordability calculator plugin\`, \`census tract cra grant widget\`, \`ai lead capture form real estate\`
- **Headlines**: *"Real Estate AI GeoMap Plugin"*, *"USDA 0% Down Area Checker"*, *"$10K CRA Grant Matcher"*, *"AI 2nd Brain Lead Triage"*
- **Descriptions**: *"Embed USDA 100% financing and $10K CRA grant checkers on your real estate website in 60 seconds. Simultaneous LO+Agent email dispatch with 2nd Brain cognitive parsing."*

### 🔍 Campaign 3: Loan Officer Agent Attraction & Co-Branded Tech
- **Target Keywords**: \`loan officer agent attraction tool\`, \`co-branded real estate mortgage app\`, \`open house tablet kiosk app\`, \`open house qr code lead capture\`
- **Headlines**: *"Attract Top Realtor Partners"*, *"Co-Branded LO + Agent Portal"*, *"Open House Tablet Kiosk App"*, *"Native SMS Listing Share"*
- **Descriptions**: *"Offer your Realtor partners a branded GeoMap portal, 1-tap iPad open house kiosk, and instant AI lead triage with solo LO mode fallback."*

---

## 8. HIGH-CONVERTING WEBSITE SHORT HOOKS & MICRO-COPY

### ⚡ Punchy Hero Headlines:
1. *"Turn Google Workspace into an Autonomous AI Operating System."*
2. *"Stop the 14-Tab Nightmare. Give Your AI Real Hands."*
3. *"The First AI Workspace with Zero-Prompt Contextual Recall."*
4. *"Dual-Pathway Google Authentication: Enterprise Power, Zero Friction."*
5. *"Save 14.5 Hours Every Single Week on Administrative Busywork."*
6. *"Turn Renters into Pre-Approved Homebuyers on Your Agent Website."*

### 🛡️ Feature Micro-Pills & Badges:
- \`⚡ Dual-Pathway Auth (GIS + OAuth)\`
- \`🛡️ HIPAA & Focus 15-Min Buffer\`
- \`🧠 Permanent 2nd Brain Recall\`
- \`📊 1-Click Domain Purge & CSV Cleaner\`
- \`🔒 Zero Browser API Key Exposure\`

---

## 9. COLD OUTBOUND EXECUTIVE EMAIL SEQUENCES

### ✉️ Email 1: C-Suite Tab Fatigue Outreach
\`\`\`
Subject: quick question about your team's Google Workspace + AI setup

Hi {{firstName}},

Quick observation: most leadership teams are spending 2+ hours a day copying and pasting AI outputs back and forth between ChatGPT, Gmail, Sheets, and their Calendar.

We built Vantage AI Workspace UI to turn Google Workspace into an autonomous operating system:
- Real Gmail Draft Studio with zero-prompt client memory
- Automated 15-minute calendar focus buffers to prevent back-to-back meeting fatigue
- Google Sheets relational cleanup that removes spam domains in 1 click
- 100% server-side security with zero browser API key exposure

Are you open to a 3-minute video showing how this eliminates tab fatigue across your team?

Best regards,
Mike Ford (fordmj@gmail.com)
\`\`\`

---

## 10. COPYRIGHT, ANTI-THEFT & DISTRIBUTION LICENSE
All modules, architectures, tool schemas, and copy within this document are protected under commercial license by:  
**Mike Ford** (\`fordmj@gmail.com\`) • *All Rights Reserved.*  
*Commercial redistribution or sublicensing requires an active Vantage AI Enterprise SaaS License or verified Commercial License Signature (SHA256-MF).*
`;
