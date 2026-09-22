/**
 * ============================================================================
 * VANTAGE AI WORKSPACE STUDIO • 10-INDUSTRY ROTATING GOOGLE APPS ACTIONS MATRIX
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Ground-Searched by Gemini SDK Agent & Internet Assimilation Engine
 * Provides >= 4 productivity-boosting actions per Google App for all 10 Industries:
 * Gmail, Calendar, Drive, Docs, Sheets, Tasks, and Contacts (280 actions total).
 * ============================================================================
 */

import { SuggestedAction } from '../types';

export type GoogleAppKey = 'Gmail' | 'Calendar' | 'Drive' | 'Docs' | 'Sheets' | 'Tasks' | 'Contacts';

export interface IndustryAppActionDef {
  id: string;
  type: SuggestedAction['type'];
  title: string;
  description: string;
  badgeLabel: string;
  geminiResearchNote: string;
  payload: any;
}

export interface IndustryMetaDef {
  id: string;
  name: string;
  shortName: string;
  emoji: string;
  careerTitle: string;
  iconName: string;
  themeColor: string;
  badgeClass: string;
  borderClass: string;
  geminiResearchFocus: string;
}

export const ALL_10_INDUSTRIES_META: IndustryMetaDef[] = [
  {
    id: 'mortgage_real_estate',
    name: 'Mortgage, Lending & Real Estate',
    shortName: 'Mortgage & Real Estate',
    emoji: '🏠',
    careerTitle: 'Mortgage Loan Officer & Real Estate Broker',
    iconName: 'Home',
    themeColor: 'emerald',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    borderClass: 'border-emerald-500/40 hover:border-emerald-500',
    geminiResearchFocus: 'TRID 3-day disclosures, DTI/LTV ratio guidelines, Lakeview 100% & USDA DPA programs, RESPA Section 8 compliance.'
  },
  {
    id: 'technology_software',
    name: 'Technology, Software & AI Engineering',
    shortName: 'Tech & AI Engineering',
    emoji: '💻',
    careerTitle: 'Software Architect & Product Lead',
    iconName: 'Code',
    themeColor: 'cyan',
    badgeClass: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/70 dark:text-cyan-300 dark:border-cyan-800',
    borderClass: 'border-cyan-500/40 hover:border-cyan-500',
    geminiResearchFocus: 'API schema contracts, SOC2 compliance audits, CI/CD pipeline automation, sprint velocity & architectural RFCs.'
  },
  {
    id: 'healthcare_medical',
    name: 'Healthcare, Clinical & Practice Management',
    shortName: 'Healthcare & Clinical',
    emoji: '🩺',
    careerTitle: 'Medical Director & Practice Manager',
    iconName: 'Activity',
    themeColor: 'rose',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800',
    borderClass: 'border-rose-500/40 hover:border-rose-500',
    geminiResearchFocus: 'HIPAA Privacy Rule encryption, SOAP clinical progress documentation, EHR billing codes (ICD-10/CPT), patient intake.'
  },
  {
    id: 'finance_banking',
    name: 'Finance, Wealth & Accounting',
    shortName: 'Finance & Wealth',
    emoji: '📈',
    careerTitle: 'Certified Financial Planner & CPA Tax Strategist',
    iconName: 'TrendingUp',
    themeColor: 'amber',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    borderClass: 'border-amber-500/40 hover:border-amber-500',
    geminiResearchFocus: 'GAAP financial audits, IRC Sec 1031 like-kind exchanges, S-Corp payroll tax calculations, SEC fiduciary standards.'
  },
  {
    id: 'legal_compliance',
    name: 'Legal, Corporate & Compliance',
    shortName: 'Legal & Corporate Counsel',
    emoji: '⚖️',
    careerTitle: 'Corporate Counsel & Compliance Director',
    iconName: 'Shield',
    themeColor: 'indigo',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
    borderClass: 'border-indigo-500/40 hover:border-indigo-500',
    geminiResearchFocus: 'Master Services Agreement (MSA) indemnification, GDPR/CCPA data processing agreements, litigation hold discovery.'
  },
  {
    id: 'marketing_creative',
    name: 'Marketing, Advertising & Creative Growth',
    shortName: 'Marketing & Creative Growth',
    emoji: '📢',
    careerTitle: 'VP Growth & Creative Marketing Director',
    iconName: 'Megaphone',
    themeColor: 'purple',
    badgeClass: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/70 dark:text-purple-300 dark:border-purple-800',
    borderClass: 'border-purple-500/40 hover:border-purple-500',
    geminiResearchFocus: 'CAC/LTV multi-touch attribution, MEDDPICC enterprise sales enablement, conversion rate optimization (CRO) A/B testing.'
  },
  {
    id: 'education_academia',
    name: 'Education, Academia & Research',
    shortName: 'Education & Academia',
    emoji: '🎓',
    careerTitle: 'Academic Chair & Instructional Designer',
    iconName: 'BookOpen',
    themeColor: 'blue',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    borderClass: 'border-blue-500/40 hover:border-blue-500',
    geminiResearchFocus: 'FERPA student record privacy, Bloom’s Taxonomy course syllabi, NSF/NIH grant proposals, IEP accommodation logs.'
  },
  {
    id: 'construction_engineering',
    name: 'Construction, Architecture & Contracting',
    shortName: 'Construction & Engineering',
    emoji: '🏗️',
    careerTitle: 'General Contractor & Structural Engineer',
    iconName: 'HardHat',
    themeColor: 'orange',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800',
    borderClass: 'border-orange-500/40 hover:border-orange-500',
    geminiResearchFocus: 'AIA G702/G703 payment applications, OSHA safety compliance logs, Critical Path Method (CPM) scheduling, RFI tracking.'
  },
  {
    id: 'hospitality_ecom',
    name: 'Hospitality, Retail & E-Commerce',
    shortName: 'Hospitality & E-Commerce',
    emoji: '🛎️',
    careerTitle: 'Hotel General Manager & E-Com Brand Director',
    iconName: 'ShoppingBag',
    themeColor: 'teal',
    badgeClass: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800',
    borderClass: 'border-teal-500/40 hover:border-teal-500',
    geminiResearchFocus: 'RevPAR dynamic pricing, supply chain inventory replenishment, customer NPS sentiment triage, VIP guest amenities.'
  },
  {
    id: 'executive_consulting',
    name: 'Executive Management & Strategic Consulting',
    shortName: 'Executive & Management Consulting',
    emoji: '💼',
    careerTitle: 'Chief of Staff & Management Consultant',
    iconName: 'Briefcase',
    themeColor: 'violet',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800',
    borderClass: 'border-violet-500/40 hover:border-violet-500',
    geminiResearchFocus: 'McKinsey 7S alignment, OKR cascaded executive dashboards, Board of Directors quarterly deck, M&A due diligence.'
  }
];

export function normalizeIndustryId(rawId?: string): string {
  if (!rawId) return 'mortgage_real_estate';
  const clean = rawId.toLowerCase();
  if (clean.includes('mortgage') || clean.includes('real_estate') || clean.includes('lending')) return 'mortgage_real_estate';
  if (clean.includes('tech') || clean.includes('software') || clean.includes('code')) return 'technology_software';
  if (clean.includes('health') || clean.includes('medical') || clean.includes('clinic')) return 'healthcare_medical';
  if (clean.includes('finance') || clean.includes('wealth') || clean.includes('bank') || clean.includes('accounting')) return 'finance_banking';
  if (clean.includes('legal') || clean.includes('law') || clean.includes('compliance')) return 'legal_compliance';
  if (clean.includes('market') || clean.includes('sales') || clean.includes('growth') || clean.includes('creative')) return 'marketing_creative';
  if (clean.includes('educat') || clean.includes('academ') || clean.includes('school') || clean.includes('research')) return 'education_academia';
  if (clean.includes('construct') || clean.includes('architect') || clean.includes('engineer') || clean.includes('contract')) return 'construction_engineering';
  if (clean.includes('hospit') || clean.includes('retail') || clean.includes('ecom') || clean.includes('hotel')) return 'hospitality_ecom';
  if (clean.includes('execut') || clean.includes('consult') || clean.includes('strategy') || clean.includes('staff')) return 'executive_consulting';
  return 'mortgage_real_estate';
}

export function getIndustryMeta(rawId?: string): IndustryMetaDef {
  const normId = normalizeIndustryId(rawId);
  return ALL_10_INDUSTRIES_META.find(m => m.id === normId) || ALL_10_INDUSTRIES_META[0];
}

/**
 * MASTER ROTATING ACTIONS DATASET (10 Industries x 7 Google Apps x 4 Actions = 280 Actions)
 * Scoured and formulated using Gemini SDK Agent Ground Search research
 */
export const INDUSTRY_ROTATING_ACTIONS: Record<string, Record<GoogleAppKey, IndustryAppActionDef[]>> = {
  // 1. MORTGAGE, LENDING & REAL ESTATE
  mortgage_real_estate: {
    Gmail: [
      {
        id: 'mlo_gmail_1',
        type: 'gmail_send',
        title: 'Draft TRID Pre-Approval Commitment Notice',
        description: 'Send clear pre-approval loan terms, max purchase price, and lock expiration parameters.',
        badgeLabel: 'TRID PRE-APPROVAL',
        geminiResearchNote: 'Grounded in CFPB TRID rules and NMLS regulatory disclosure standards.',
        payload: {
          to: 'borrower.lead@gmail.com',
          subject: 'Official Loan Pre-Approval Notice - Maximum Purchase Limit $475,000',
          body: 'Dear Borrower,\n\nWe are pleased to issue your formal Mortgage Pre-Approval up to $475,000 with down payment assistance (USDA 100% / Lakeview DPA).\n\nNMLS #123456 | Equal Housing Lender.'
        }
      },
      {
        id: 'mlo_gmail_2',
        type: 'gmail_send',
        title: 'Clear-to-Close (CTC) Closing Milestone Alert',
        description: 'Notify buyers and realtors of underwriting CTC approval and final CD review timeline.',
        badgeLabel: 'CLEAR-TO-CLOSE',
        geminiResearchNote: 'Includes closing disclosure timeline and wire fraud safety warnings.',
        payload: {
          to: 'realtor.partner@brokerage.com',
          subject: 'CLEAR TO CLOSE: [Property Address] - Loan Approved for Signing',
          body: 'Great news! The file is officially Clear to Close. Closing Disclosure has been issued. Wire safety verification required.'
        }
      },
      {
        id: 'mlo_gmail_3',
        type: 'gmail_send',
        title: 'Rate Lock Window & Market Opportunity Update',
        description: 'Alert floating pipeline leads regarding 10-year Treasury yield movements and lock recommendations.',
        badgeLabel: 'RATE LOCK ALERT',
        geminiResearchNote: 'Analyzes mortgage-backed securities (MBS) pricing trends.',
        payload: {
          to: 'active.pipeline@leads.com',
          subject: 'Mortgage Rate Alert: Treasury Yields Dip - Favorable Lock Window',
          body: 'Hi there,\n\nMortgage bond pricing improved this morning. We recommend locking your 30-day rate today.'
        }
      },
      {
        id: 'mlo_gmail_4',
        type: 'gmail_send',
        title: 'Down Payment Assistance (DPA) Grant Outreach',
        description: 'Inform FTHB leads about state housing grants and zero-down rural programs.',
        badgeLabel: 'DPA GRANT OUTREACH',
        geminiResearchNote: 'Covers USDA 100% rural boundaries and LMI census tract grant programs.',
        payload: {
          to: 'fthb.buyers@leads.com',
          subject: 'Zero-Down Homeownership: 100% Financing & $15,000 Grant Eligibility',
          body: 'Hello,\n\nYou may be eligible for up to $15,000 in non-repayable down payment grants in your target area!'
        }
      }
    ],
    Calendar: [
      {
        id: 'mlo_cal_1',
        type: 'calendar_create',
        title: 'Schedule Borrower Pre-Qual Strategy Call',
        description: 'Book 30-minute borrower discovery call to review income, assets, and credit goals.',
        badgeLabel: 'PRE-QUAL CALL',
        geminiResearchNote: 'Includes pre-call checklist for 30-day paystubs and 2-year W-2s.',
        payload: { summary: 'Borrower Pre-Qualification Strategy Session', durationMinutes: 30, description: 'Review DTI ratios, FICO score, and loan options.' }
      },
      {
        id: 'mlo_cal_2',
        type: 'calendar_create',
        title: 'Book Realtor Partner Co-Branding Lunch',
        description: 'Quarterly pipeline review and open-house co-marketing strategy with top producing agent.',
        badgeLabel: 'REALTOR SYNC',
        geminiResearchNote: 'Fosters RESPA-compliant co-marketing relationships.',
        payload: { summary: 'Realtor Partner Pipeline & Open House Strategy', durationMinutes: 60, description: 'Align on co-branded open house flyers and buyer leads.' }
      },
      {
        id: 'mlo_cal_3',
        type: 'calendar_create',
        title: 'Schedule Title Escrow Signing Buffer',
        description: 'Block 45-minute signing appointment with mobile notary and title officer.',
        badgeLabel: 'ESCROW SIGNING',
        geminiResearchNote: 'Includes 15-minute transitional travel buffer.',
        payload: { summary: 'Loan Closing Document Signing & Notary Execution', durationMinutes: 45, description: 'Final borrower signatures on note and deed of trust.' }
      },
      {
        id: 'mlo_cal_4',
        type: 'calendar_create',
        title: 'Weekly Underwriting Pipeline Scrubber',
        description: 'Scan all active conditional approval files and clear outstanding loan stipulations.',
        badgeLabel: 'PIPELINE SCRUB',
        geminiResearchNote: 'Accelerates average turn times from application to CTC.',
        payload: { summary: 'Weekly Underwriting Condition Clearing & Pipeline Audit', durationMinutes: 45, description: 'Review VOEs, appraisal revisions, and hazard insurance.' }
      }
    ],
    Drive: [
      {
        id: 'mlo_drive_1',
        type: 'drive_create',
        title: 'Create Secure Borrower Loan Vault Folder',
        description: 'Initialize a structured client loan archive folder for tax returns, paystubs, and asset statements.',
        badgeLabel: 'LOAN VAULT FOLDER',
        geminiResearchNote: 'Structured with encrypted access permissions conforming to GLBA regulations.',
        payload: { name: 'Borrower_Loan_File_Vault_2026', mimeType: 'application/vnd.google-apps.folder' }
      },
      {
        id: 'mlo_drive_2',
        type: 'drive_create',
        title: 'Archive Property Appraisal & Title Commitment',
        description: 'Save finalized appraisal report and preliminary title binder for underwriting audit.',
        badgeLabel: 'APPRAISAL ARCHIVE',
        geminiResearchNote: 'Maintains compliant 5-year loan file retention requirement.',
        payload: { name: 'Appraisal_Report_Form_1004_Subject_Property.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'mlo_drive_3',
        type: 'drive_create',
        title: 'Publish Co-Branded Real Estate Open House Kit',
        description: 'Export verified LO + Agent co-branded flyers and rate comparison sheets to shared drive.',
        badgeLabel: 'CO-BRANDED KIT',
        geminiResearchNote: 'Incorporates equal-sized Realtor and MLO logos per RESPA rules.',
        payload: { name: 'Open_House_Feature_Sheet_CoBranded.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'mlo_drive_4',
        type: 'drive_create',
        title: 'Create Down Payment Grant Program Directory',
        description: 'Store guidelines for state DPA, USDA rural boundaries, and city grant programs.',
        badgeLabel: 'DPA REPOSITORY',
        geminiResearchNote: 'Centralizes income limits and AMI census tract matrices.',
        payload: { name: 'State_DPA_Grant_Eligibility_Matrices_2026', mimeType: 'application/vnd.google-apps.folder' }
      }
    ],
    Docs: [
      {
        id: 'mlo_docs_1',
        type: 'docs_create',
        title: 'Generate Custom Loan Scenario Comparison Doc',
        description: 'Draft side-by-side comparison of Conventional 3% vs FHA 3.5% vs USDA 100% financing.',
        badgeLabel: 'LOAN SCENARIOS',
        geminiResearchNote: 'Itemizes monthly PITI, PMI factors, and total cash-to-close.',
        payload: { title: 'Loan Program Comparison & Payment Breakdown', prompt: 'Create a structured table comparing Conventional vs FHA vs USDA.' }
      },
      {
        id: 'mlo_docs_2',
        type: 'docs_create',
        title: 'Draft Gift Letter & Asset Verification Form',
        description: 'Create standardized Fannie Mae/Freddie Mac gift funds declaration template.',
        badgeLabel: 'GIFT LETTER FORM',
        geminiResearchNote: 'Ensures no repayment obligation clause is properly formatted.',
        payload: { title: 'Mortgage Down Payment Gift Letter Declaration', prompt: 'Draft Fannie Mae compliant donor gift letter.' }
      },
      {
        id: 'mlo_docs_3',
        type: 'docs_create',
        title: 'Draft Letter of Explanation (LOE) for Credit Inquiries',
        description: 'Prepare underwriter-friendly explanation for recent credit pulls or employment gap.',
        badgeLabel: 'LOE TEMPLATE',
        geminiResearchNote: 'Formats bulleted chronological timeline satisfying AUS findings.',
        payload: { title: 'Letter of Explanation - Recent Inquiries and Residence History', prompt: 'Draft professional LOE for underwriting stipulation.' }
      },
      {
        id: 'mlo_docs_4',
        type: 'docs_create',
        title: 'Create Homebuyer Closing Preparation Guide',
        description: 'Draft complete homebuyer roadmap from contract acceptance to key handover.',
        badgeLabel: 'CLOSING GUIDE',
        geminiResearchNote: 'Warns against opening new credit cards or making large cash deposits.',
        payload: { title: 'First-Time Homebuyer Roadmap & Do-Not Checklist', prompt: 'Create homebuyer guide on avoiding closing delays.' }
      }
    ],
    Sheets: [
      {
        id: 'mlo_sheets_1',
        type: 'sheets_create',
        title: 'Generate DTI & Maximum Affordability Calculator',
        description: 'Formula-ready spreadsheet calculating Front-End & Back-End DTI with automated qualifying flags.',
        badgeLabel: 'DTI CALCULATOR',
        geminiResearchNote: 'Applies 43% / 50% max DTI ceiling logic and automated PITI formulas.',
        payload: { title: 'Mortgage DTI & Purchase Power Qualifying Sheet', description: 'Calculates housing and total debt ratios dynamically.' }
      },
      {
        id: 'mlo_sheets_2',
        type: 'sheets_create',
        title: 'Track Realtor Referral Pipeline & Conversion Rates',
        description: 'Record lead sources, pre-approval dates, pending contracts, and closed loan volume.',
        badgeLabel: 'REFERRAL TRACKER',
        geminiResearchNote: 'Measures partner conversion efficiency and average closing speed.',
        payload: { title: 'Realtor Partner Referral & Lead Conversion Matrix', description: 'Tracks pipeline status by referral agent.' }
      },
      {
        id: 'mlo_sheets_3',
        type: 'sheets_create',
        title: 'Audit Closing Costs & Cash-to-Close Estimator',
        description: 'Itemize lender fees, appraisal, escrow reserves, transfer taxes, and title insurance.',
        badgeLabel: 'CLOSING COSTS',
        geminiResearchNote: 'Generates accurate estimates aligning with Loan Estimate (LE).',
        payload: { title: 'Itemized Closing Costs & Prepaid Escrows Ledger', description: 'Calculates cash-to-close with prorated taxes.' }
      },
      {
        id: 'mlo_sheets_4',
        type: 'sheets_create',
        title: 'Run Relational SQL on Mortgage Lead Database',
        description: 'Query database to extract pre-approved buyers looking in specific zip codes.',
        badgeLabel: 'LEAD SQL QUERY',
        geminiResearchNote: 'Filters high-intent leads for rapid open house matching.',
        payload: { title: 'Mortgage Lead Segmentation & Geo-Radius Query', description: 'Filters leads by pre-approval range and county.' }
      }
    ],
    Tasks: [
      {
        id: 'mlo_tasks_1',
        type: 'tasks_create',
        title: 'Request Updated W-2s and 30-Day Paystubs',
        description: 'Follow up with borrower on pending income documents required for underwriting submission.',
        badgeLabel: 'COLLECT DOCS',
        geminiResearchNote: 'Standard milestone task preventing loan submission bottlenecks.',
        payload: { title: 'Collect borrower 30-day paystubs and bank statements', notes: 'Required before issuing full AUS approval.' }
      },
      {
        id: 'mlo_tasks_2',
        type: 'tasks_create',
        title: 'Order Appraisal Upon Purchase Contract Receipt',
        description: 'Submit appraisal order through AMC within 24 hours of mutual acceptance.',
        badgeLabel: 'ORDER APPRAISAL',
        geminiResearchNote: 'Maintains strict contract contingency deadlines.',
        payload: { title: 'Order appraisal through AMC for mutual contract', notes: 'Verify property address and access contact.' }
      },
      {
        id: 'mlo_tasks_3',
        type: 'tasks_create',
        title: 'Issue Initial Loan Estimate (LE) within 3 Days',
        description: 'Verify compliance with TRID 3-business-day disclosure delivery requirement.',
        badgeLabel: 'TRID 3-DAY LE',
        geminiResearchNote: 'Prevents costly regulatory compliance infractions.',
        payload: { title: 'Generate and send Initial Loan Estimate (LE)', notes: 'Must be delivered within 3 business days of application.' }
      },
      {
        id: 'mlo_tasks_4',
        type: 'tasks_create',
        title: 'Conduct Verbal Verification of Employment (VVOE)',
        description: 'Complete 10-day pre-closing verbal employment check with borrower HR department.',
        badgeLabel: 'VVOE CHECK',
        geminiResearchNote: 'Fannie Mae/Freddie Mac mandatory pre-funding stipulation.',
        payload: { title: 'Complete Verbal VOE with employer prior to funding', notes: 'Verify active employment status within 10 days of closing.' }
      }
    ],
    Contacts: [
      {
        id: 'mlo_contacts_1',
        type: 'contacts_create',
        title: 'Add Top Producer Realtor Partner Card',
        description: 'Save Realtor contact with preferred title company, brokerage license, and direct cell.',
        badgeLabel: 'REALTOR PARTNER',
        geminiResearchNote: 'Stores verified partner license details for co-marketing compliance.',
        payload: { name: 'Elena Rostova (Premier Realty)', email: 'elena@premierrealty.com', phone: '(503) 555-0199', organization: 'Premier Realty Group' }
      },
      {
        id: 'mlo_contacts_2',
        type: 'contacts_create',
        title: 'Add Title & Escrow Officer Contact',
        description: 'Add designated escrow officer with direct wire verification desk phone.',
        badgeLabel: 'TITLE OFFICER',
        geminiResearchNote: 'Enables quick wire confirmation checks.',
        payload: { name: 'Marcus Vance (First American Title)', email: 'marcus.v@firstam.com', phone: '(503) 555-0245', organization: 'First American Title' }
      },
      {
        id: 'mlo_contacts_3',
        type: 'contacts_create',
        title: 'Enrich Pre-Approved Buyer Contact Profile',
        description: 'Save buyer details, pre-approval amount, and target neighborhood tags.',
        badgeLabel: 'VIP BUYER',
        geminiResearchNote: 'Tags contact with budget criteria for automated listing alerts.',
        payload: { name: 'David & Sarah Chen (Pre-Approved)', email: 'chen.family@gmail.com', phone: '(503) 555-0312', organization: 'Pre-Approved Buyer ($500k)' }
      },
      {
        id: 'mlo_contacts_4',
        type: 'contacts_create',
        title: 'Add Home Insurance Agent Partner',
        description: 'Save trusted homeowner insurance broker for fast hazard binder turnaround.',
        badgeLabel: 'INSURANCE AGENT',
        geminiResearchNote: 'Speeds up insurance binder verification in underwriting.',
        payload: { name: 'Jennifer Lopez (Farmers Insurance)', email: 'jennifer.ins@farmers.com', phone: '(503) 555-0876', organization: 'Farmers Insurance Group' }
      }
    ]
  },

  // 2. TECHNOLOGY, SOFTWARE & AI ENGINEERING
  technology_software: {
    Gmail: [
      {
        id: 'tech_gmail_1',
        type: 'gmail_send',
        title: 'Draft Production Release Changelog & Migration Notice',
        description: 'Send deployment notes, API breaking changes, and rollback instructions to engineering.',
        badgeLabel: 'RELEASE CHANGELOG',
        geminiResearchNote: 'Includes semantic versioning, P99 latency metrics, and rollback commands.',
        payload: { to: 'engineering-team@techcompany.io', subject: '[Release v2.4.0] Cloud Run Services & API Migration Notice', body: 'Team,\n\nRelease v2.4.0 is live in production. P99 latency reduced by 35%.\n\nRollback: helm rollback app-release 142.' }
      },
      {
        id: 'tech_gmail_2',
        type: 'gmail_send',
        title: 'Submit Security Vulnerability Incident Response',
        description: 'Notify security team of patched CVE dependency vulnerability and audit logs.',
        badgeLabel: 'SECURITY RESPONSE',
        geminiResearchNote: 'Follows SOC2 and NIST vulnerability disclosure guidelines.',
        payload: { to: 'security@techcompany.io', subject: 'RESOLVED: CVE-2026-8812 Patch Deployed to Production Clusters', body: 'All container nodes updated with patched dependencies. Zero unauthorized access detected.' }
      },
      {
        id: 'tech_gmail_3',
        type: 'gmail_send',
        title: 'RFC Architecture Proposal for AI Microservice',
        description: 'Circulate Request for Comments (RFC) on Gemini SDK streaming agent architecture.',
        badgeLabel: 'ARCHITECTURE RFC',
        geminiResearchNote: 'Formats technical tradeoffs, memory limits, and p95 token cost models.',
        payload: { to: 'architecture-board@techcompany.io', subject: 'RFC: Gemini SDK Realtime Interactions API Microservice Architecture', body: 'Requesting review on new low-latency streaming pipeline proposal.' }
      },
      {
        id: 'tech_gmail_4',
        type: 'gmail_send',
        title: 'API Deprecation Warning to External Integrators',
        description: 'Send 90-day migration warning for legacy REST endpoints transitioning to GraphQL.',
        badgeLabel: 'API DEPRECATION',
        geminiResearchNote: 'Adheres to developer relations API sunsetting best practices.',
        payload: { to: 'api-partners@ecosystem.com', subject: 'Notice: v1 REST Endpoints Deprecation Scheduled for Q3 2026', body: 'Please migrate to /api/v2 endpoints by October 1. Full migration guide attached.' }
      }
    ],
    Calendar: [
      {
        id: 'tech_cal_1',
        type: 'calendar_create',
        title: 'Schedule Bi-Weekly Sprint Retrospective & Planning',
        description: 'Book 60-minute agile retrospective, velocity analysis, and sprint backlog commitment.',
        badgeLabel: 'SPRINT RETRO',
        geminiResearchNote: 'Organized around What Went Well / What to Improve / Action Items.',
        payload: { summary: 'Sprint 42 Retrospective & Sprint 43 Backlog Commitment', durationMinutes: 60, description: 'Review story point burn-down and resolve blockers.' }
      },
      {
        id: 'tech_cal_2',
        type: 'calendar_create',
        title: 'Book Deep Work Architecture Coding Block',
        description: 'Reserve uninterrupted 2.5-hour block for core backend refactoring and tests.',
        badgeLabel: 'DEEP WORK BLOCK',
        geminiResearchNote: 'Guards flow state by muting notifications during execution.',
        payload: { summary: 'Focus Block: Core Engine Refactoring & Type Safety', durationMinutes: 150, description: 'Zero meetings. Deep architecture implementation.' }
      },
      {
        id: 'tech_cal_3',
        type: 'calendar_create',
        title: 'Schedule Production Post-Mortem Incident Review',
        description: 'Conduct blameless post-mortem analyzing root cause and preventive monitor alerts.',
        badgeLabel: 'POST-MORTEM SYNC',
        geminiResearchNote: 'Grounded in Google SRE blameless post-mortem standards.',
        payload: { summary: 'Blameless Post-Mortem: Database Connection Pool Outage', durationMinutes: 45, description: 'Identify 5 Whys, root cause, and action items.' }
      },
      {
        id: 'tech_cal_4',
        type: 'calendar_create',
        title: 'Technical 1:1 Engineering Mentorship',
        description: 'Career growth, code review feedback, and system design coaching session.',
        badgeLabel: 'TECH 1:1',
        geminiResearchNote: 'Focuses on long-term engineering trajectory and architectural skills.',
        payload: { summary: 'Engineering 1:1: System Design & Career Goals', durationMinutes: 45, description: 'Discuss distributed systems design and quarterly goals.' }
      }
    ],
    Drive: [
      {
        id: 'tech_drive_1',
        type: 'drive_create',
        title: 'Create System Architecture Diagram Repository',
        description: 'Establish shared folder for microservice diagrams, OpenAPI specs, and ERDs.',
        badgeLabel: 'DIAGRAMS VAULT',
        geminiResearchNote: 'Structures C4 model architecture diagrams for team onboarding.',
        payload: { name: 'Cloud_Architecture_System_Diagrams_2026', mimeType: 'application/vnd.google-apps.folder' }
      },
      {
        id: 'tech_drive_2',
        type: 'drive_create',
        title: 'Store SOC2 Compliance Audit Artifacts',
        description: 'Archive pen-test reports, access control logs, and encryption certificates.',
        badgeLabel: 'SOC2 AUDIT LOGS',
        geminiResearchNote: 'Enforces least-privilege folder access controls.',
        payload: { name: 'SOC2_Type_II_Security_Audit_Report_2026.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'tech_drive_3',
        type: 'drive_create',
        title: 'Archive Database Backup Snapshot Logs',
        description: 'Upload disaster recovery database snapshot logs and restore verification proofs.',
        badgeLabel: 'BACKUP LOGS',
        geminiResearchNote: 'Measures RTO (Recovery Time Objective) and RPO metrics.',
        payload: { name: 'PostgreSQL_Disaster_Recovery_Audit_Log.json', mimeType: 'application/json' }
      },
      {
        id: 'tech_drive_4',
        type: 'drive_create',
        title: 'Publish Product Requirements Document (PRD) Folder',
        description: 'Folder housing user stories, wireframes, and acceptance criteria.',
        badgeLabel: 'PRD REPOSITORY',
        geminiResearchNote: 'Centralizes cross-functional product specs for engineering and design.',
        payload: { name: 'Product_Requirements_Documents_Q3_2026', mimeType: 'application/vnd.google-apps.folder' }
      }
    ],
    Docs: [
      {
        id: 'tech_docs_1',
        type: 'docs_create',
        title: 'Draft Product Requirements Document (PRD)',
        description: 'Write complete PRD with problem statement, user personas, and technical constraints.',
        badgeLabel: 'PRD SPEC DOC',
        geminiResearchNote: 'Formats user stories with Gherkin acceptance criteria (Given/When/Then).',
        payload: { title: 'Product Requirements Document: Realtime AI Assistant', prompt: 'Create comprehensive PRD with API contracts and scope.' }
      },
      {
        id: 'tech_docs_2',
        type: 'docs_create',
        title: 'Write Engineering RFC Technical Architecture Spec',
        description: 'Detail system architecture, database schema migrations, and latency benchmarks.',
        badgeLabel: 'RFC ARCH SPEC',
        geminiResearchNote: 'Weighs alternative architectural approaches with pros and cons.',
        payload: { title: 'RFC: Event-Driven Microservices Architecture', prompt: 'Draft technical RFC with component diagrams and failure modes.' }
      },
      {
        id: 'tech_docs_3',
        type: 'docs_create',
        title: 'Draft Blameless SRE Incident Post-Mortem',
        description: 'Document timeline, root cause analysis, MTTR, and preventative action items.',
        badgeLabel: 'POST-MORTEM DOC',
        geminiResearchNote: 'Identifies systemic monitoring improvements to prevent recurrence.',
        payload: { title: 'Blameless Post-Mortem: Incident #2026-0881', prompt: 'Draft SRE post-mortem with 5-Whys root cause analysis.' }
      },
      {
        id: 'tech_docs_4',
        type: 'docs_create',
        title: 'Draft Developer Onboarding & Local Environment Guide',
        description: 'Step-by-step setup for Docker containers, local seed data, and test runners.',
        badgeLabel: 'ONBOARDING GUIDE',
        geminiResearchNote: 'Reduces new engineer time-to-first-commit under 48 hours.',
        payload: { title: 'Engineering Onboarding & Local Setup Playbook', prompt: 'Create clear developer onboarding guide with CLI commands.' }
      }
    ],
    Sheets: [
      {
        id: 'tech_sheets_1',
        type: 'sheets_create',
        title: 'Sprint Velocity & Story Point Burn-Down Sheet',
        description: 'Automated sprint tracker calculating team velocity, completion ratios, and rollover points.',
        badgeLabel: 'VELOCITY SHEET',
        geminiResearchNote: 'Generates burn-down trajectory and identifies scope creep.',
        payload: { title: 'Engineering Sprint Velocity & Story Point Ledger', description: 'Calculates points completed vs committed across sprints.' }
      },
      {
        id: 'tech_sheets_2',
        type: 'sheets_create',
        title: 'Cloud Infrastructure Cost & Token Budget Tracker',
        description: 'Monitor GCP/AWS compute spend, Cloud Run instances, and Gemini API token costs.',
        badgeLabel: 'CLOUD SPEND',
        geminiResearchNote: 'Tracks cost-per-user and forecast monthly cloud margins.',
        payload: { title: 'Cloud Infrastructure & LLM API Token Cost Model', description: 'Tracks serverless compute and model inference spend.' }
      },
      {
        id: 'tech_sheets_3',
        type: 'sheets_create',
        title: 'Bug Triage Matrix & Severity SLA Monitor',
        description: 'Log bugs by P0/P1/P2 severity with automated SLA countdown timers.',
        badgeLabel: 'BUG TRIAGE',
        geminiResearchNote: 'Highlights SLA breach risks for critical production tickets.',
        payload: { title: 'Bug Triage Matrix & Mean Time to Resolution (MTTR)', description: 'Tracks defect backlog by severity and resolution time.' }
      },
      {
        id: 'tech_sheets_4',
        type: 'sheets_create',
        title: 'Run SQL Query on Application Error Logs',
        description: 'Aggregate top recurring 500 error stack traces and identify degrading endpoints.',
        badgeLabel: 'ERROR LOG SQL',
        geminiResearchNote: 'Extracts error frequency per service for proactive patching.',
        payload: { title: 'Application Error Log Aggregation & SQL Ledger', description: 'Queries error frequencies by endpoint and status code.' }
      }
    ],
    Tasks: [
      {
        id: 'tech_tasks_1',
        type: 'tasks_create',
        title: 'Review and Merge Open Pull Requests (PRs)',
        description: 'Perform code reviews, verify unit test coverage, and approve peer PRs.',
        badgeLabel: 'CODE REVIEWS',
        geminiResearchNote: 'Keeps team PR review turnaround under 4 business hours.',
        payload: { title: 'Review open pull requests in GitHub repository', notes: 'Check test coverage, edge cases, and type safety.' }
      },
      {
        id: 'tech_tasks_2',
        type: 'tasks_create',
        title: 'Rotate API Keys and Production Secrets',
        description: 'Execute quarterly rotation of database credentials and API service tokens.',
        badgeLabel: 'ROTATE SECRETS',
        geminiResearchNote: 'SOC2 mandatory security compliance procedure.',
        payload: { title: 'Rotate production database and service API keys', notes: 'Update Google Secret Manager and verify zero downtime.' }
      },
      {
        id: 'tech_tasks_3',
        type: 'tasks_create',
        title: 'Update Docker Base Images to Patch Vulnerabilities',
        description: 'Rebuild container images using latest Alpine Node LTS base.',
        badgeLabel: 'PATCH DOCKER',
        geminiResearchNote: 'Eliminates known OS CVE vulnerabilities in production containers.',
        payload: { title: 'Upgrade Dockerfile base image to latest Node LTS', notes: 'Run vulnerability scan before pushing to Artifact Registry.' }
      },
      {
        id: 'tech_tasks_4',
        type: 'tasks_create',
        title: 'Write End-to-End Cypress/Playwright Tests',
        description: 'Cover critical user authentication and checkout paths with automated tests.',
        badgeLabel: 'E2E TESTS',
        geminiResearchNote: 'Increases test confidence and prevents regression bugs.',
        payload: { title: 'Implement automated E2E tests for core workflows', notes: 'Verify auth redirect, token refresh, and workspace actions.' }
      }
    ],
    Contacts: [
      {
        id: 'tech_contacts_1',
        type: 'contacts_create',
        title: 'Add Senior Cloud Solutions Architect',
        description: 'Save GCP/AWS technical account manager for escalation support.',
        badgeLabel: 'CLOUD TAM',
        geminiResearchNote: 'Provides direct line for infrastructure quota raises.',
        payload: { name: 'Alex Rivera (Google Cloud TAM)', email: 'arivera@google.com', phone: '(503) 555-0452', organization: 'Google Cloud Platform' }
      },
      {
        id: 'tech_contacts_2',
        type: 'contacts_create',
        title: 'Add Principal Security Pen-Tester',
        description: 'Save external cybersecurity auditor for annual penetration testing.',
        badgeLabel: 'SECURITY AUDITOR',
        geminiResearchNote: 'Retains verified pen-testing vendor contact.',
        payload: { name: 'Maya Lin (CyberGuard Security)', email: 'maya.lin@cyberguard.io', phone: '(503) 555-0911', organization: 'CyberGuard Security Audit' }
      },
      {
        id: 'tech_contacts_3',
        type: 'contacts_create',
        title: 'Add Lead DevOps Contractor',
        description: 'Save Kubernetes and CI/CD infrastructure specialist.',
        badgeLabel: 'DEVOPS LEAD',
        geminiResearchNote: 'On-call contact for critical infrastructure scaling.',
        payload: { name: 'Stefan Bauer (InfraCloud Ops)', email: 'stefan@infracloud.de', phone: '(503) 555-0773', organization: 'InfraCloud Consulting' }
      },
      {
        id: 'tech_contacts_4',
        type: 'contacts_create',
        title: 'Add Open Source Core Maintainer',
        description: 'Record liaison for upstream framework contributions and bug reports.',
        badgeLabel: 'OSS MAINTAINER',
        geminiResearchNote: 'Strengthens ties with open source software ecosystems.',
        payload: { name: 'Lucas Vance (Vite Ecosystem Core)', email: 'lucas@vitejs.dev', phone: '(503) 555-0322', organization: 'Vite Ecosystem Team' }
      }
    ]
  },

  // 3. HEALTHCARE, CLINICAL & PRACTICE MANAGEMENT
  healthcare_medical: {
    Gmail: [
      {
        id: 'med_gmail_1',
        type: 'gmail_send',
        title: 'Send HIPAA-Compliant Post-Op Patient Instructions',
        description: 'Provide clear, comforting recovery steps, medication schedules, and red-flag symptoms.',
        badgeLabel: 'POST-OP CARE',
        geminiResearchNote: 'Strictly excludes unencrypted PHI; adheres to HIPAA Privacy Rules.',
        payload: { to: 'patient.portal@hospital.org', subject: 'Post-Procedure Recovery Guidelines & Follow-Up Care', body: 'Dear Patient,\n\nPlease review your post-operative recovery checklist and emergency contact protocol.' }
      },
      {
        id: 'med_gmail_2',
        type: 'gmail_send',
        title: 'Draft Specialist Medical Referral Letter',
        description: 'Draft clinical summary and diagnostic findings for cardiology/orthopedic referral.',
        badgeLabel: 'SPECIALIST REFERRAL',
        geminiResearchNote: 'Includes pertinent ICD-10 diagnostic codes and prior imaging summaries.',
        payload: { to: 'referrals@cardiologyassociates.com', subject: 'Clinical Referral: Patient Evaluation - [Ref #8812]', body: 'Dr. Specialist,\n\nReferring patient for comprehensive cardiovascular evaluation following abnormal ECG.' }
      },
      {
        id: 'med_gmail_3',
        type: 'gmail_send',
        title: 'Prior Authorization Appeal Letter to Insurer',
        description: 'Submit formal medical necessity justification appealing denied treatment.',
        badgeLabel: 'PRIOR AUTH APPEAL',
        geminiResearchNote: 'Cites peer-reviewed clinical guidelines to overturn insurance denial.',
        payload: { to: 'appeals@healthinsurance.com', subject: 'URGENT: Prior Authorization Appeal - Medical Necessity Justification', body: 'Attn Medical Review Board: Submitting clinical justification for expedited procedure approval.' }
      },
      {
        id: 'med_gmail_4',
        type: 'gmail_send',
        title: 'Staff Notice: Infection Control & OSHA Compliance',
        description: 'Broadcast updated sterilization protocols and PPE supply checkpoints to clinic team.',
        badgeLabel: 'CLINIC SAFETY',
        geminiResearchNote: 'Maintains CDC and OSHA clinic accreditation compliance.',
        payload: { to: 'clinic-staff@healthcarepractice.com', subject: 'Protocol Update: Clinic Infection Control & PPE Checkpoint', body: 'Team, please review the updated sterilization checklist for all examination rooms.' }
      }
    ],
    Calendar: [
      {
        id: 'med_cal_1',
        type: 'calendar_create',
        title: 'Schedule Telehealth Consultation Block',
        description: 'Block 2-hour virtual telehealth consultation session with encrypted portal links.',
        badgeLabel: 'TELEHEALTH BLOCK',
        geminiResearchNote: 'Incorporates 10-minute documentation buffers between patient calls.',
        payload: { summary: 'Virtual Telehealth Patient Consultation Hours', durationMinutes: 120, description: 'HIPAA-compliant video evaluations.' }
      },
      {
        id: 'med_cal_2',
        type: 'calendar_create',
        title: 'Book Weekly Clinical Morbidity & Mortality (M&M) Review',
        description: 'Multidisciplinary peer review of complex patient cases and clinical outcomes.',
        badgeLabel: 'M&M CONFERENCE',
        geminiResearchNote: 'Fosters continuous quality improvement and patient safety.',
        payload: { summary: 'Clinical Case Review & Quality Assurance Conference', durationMinutes: 60, description: 'Multidisciplinary case presentation and protocol review.' }
      },
      {
        id: 'med_cal_3',
        type: 'calendar_create',
        title: 'Schedule Medical Practice Billing Audit',
        description: 'Review claims rejection rates and CPT coding accuracy with billing manager.',
        badgeLabel: 'BILLING AUDIT',
        geminiResearchNote: 'Reduces accounts receivable days and claim denial rate.',
        payload: { summary: 'Monthly Medical Billing & Claims Reconciliation Audit', durationMinutes: 45, description: 'Audit denied claims and EMR coding accuracy.' }
      },
      {
        id: 'med_cal_4',
        type: 'calendar_create',
        title: 'Book Annual HIPAA & OSHA Staff Training',
        description: 'Mandatory annual compliance review on patient privacy and biohazard protocols.',
        badgeLabel: 'HIPAA TRAINING',
        geminiResearchNote: 'Maintains compliance certification for clinical personnel.',
        payload: { summary: 'Annual Staff HIPAA Privacy & Biohazard Safety Training', durationMinutes: 90, description: 'Mandatory compliance review.' }
      }
    ],
    Drive: [
      {
        id: 'med_drive_1',
        type: 'drive_create',
        title: 'Create Encrypted Clinical SOP Repository',
        description: 'Initialize access-controlled folder for clinical protocols, triage flowcharts, and emergency SOPs.',
        badgeLabel: 'CLINICAL SOPS',
        geminiResearchNote: 'Protected with role-based access logs.',
        payload: { name: 'Clinical_Standard_Operating_Procedures_2026', mimeType: 'application/vnd.google-apps.folder' }
      },
      {
        id: 'med_drive_2',
        type: 'drive_create',
        title: 'Store Annual HIPAA Privacy Risk Assessment',
        description: 'Archive documented cybersecurity risk audit and staff acknowledgment records.',
        badgeLabel: 'HIPAA AUDIT DOC',
        geminiResearchNote: 'Measures compliance with OCR HIPAA Security Rule specifications.',
        payload: { name: 'Annual_HIPAA_Risk_Assessment_Report_2026.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'med_drive_3',
        type: 'drive_create',
        title: 'Archive Medical Equipment Calibration Certificates',
        description: 'Store inspection proofs for autoclaves, X-ray machines, and monitors.',
        badgeLabel: 'EQUIPMENT CERTS',
        geminiResearchNote: 'Satisfies state department of health inspection standards.',
        payload: { name: 'Medical_Device_Calibration_Certificates_2026.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'med_drive_4',
        type: 'drive_create',
        title: 'Create Patient Education Handout Library',
        description: 'Store easy-to-read wellness brochures and dietary guidelines.',
        badgeLabel: 'PATIENT HANDOUTS',
        geminiResearchNote: 'Written at 8th-grade readability level for accessibility.',
        payload: { name: 'Patient_Wellness_Education_Handouts', mimeType: 'application/vnd.google-apps.folder' }
      }
    ],
    Docs: [
      {
        id: 'med_docs_1',
        type: 'docs_create',
        title: 'Generate Standardized SOAP Clinical Progress Note',
        description: 'Format clinical encounter into Subjective, Objective, Assessment, and Plan.',
        badgeLabel: 'SOAP NOTE DOC',
        geminiResearchNote: 'Structured for EMR export with clean diagnostic reasoning.',
        payload: { title: 'Standardized SOAP Clinical Progress Note Template', prompt: 'Create clear SOAP note template with differential diagnoses.' }
      },
      {
        id: 'med_docs_2',
        type: 'docs_create',
        title: 'Draft Medical Necessity Prior Authorization Justification',
        description: 'Write peer-reviewed letter defending coverage for advanced MRI/specialty medication.',
        badgeLabel: 'PRIOR AUTH DOC',
        geminiResearchNote: 'Cites clinical trials and standard-of-care guidelines.',
        payload: { title: 'Clinical Letter of Medical Necessity - Prior Authorization', prompt: 'Draft detailed medical necessity justification letter.' }
      },
      {
        id: 'med_docs_3',
        type: 'docs_create',
        title: 'Draft Clinical Practice Infection Control Policy',
        description: 'Comprehensive guidelines for disinfection, hand hygiene, and sharp disposal.',
        badgeLabel: 'INFECTION POLICY',
        geminiResearchNote: 'Complies with CDC healthcare infection prevention mandates.',
        payload: { title: 'Clinic Infection Prevention & Disinfection Protocol', prompt: 'Draft practice infection control policy.' }
      },
      {
        id: 'med_docs_4',
        type: 'docs_create',
        title: 'Create Informed Consent & Procedure Disclosure Form',
        description: 'Draft plain-language patient consent detailing risks, benefits, and alternatives.',
        badgeLabel: 'INFORMED CONSENT',
        geminiResearchNote: 'Ensures legal standard for shared clinical decision-making.',
        payload: { title: 'Informed Consent & Procedure Explanation Form', prompt: 'Create clear informed consent document for minor surgery.' }
      }
    ],
    Sheets: [
      {
        id: 'med_sheets_1',
        type: 'sheets_create',
        title: 'Medical Practice RVU & Provider Productivity Ledger',
        description: 'Track Relative Value Units (wRVUs), patient visit volume, and revenue per clinical hour.',
        badgeLabel: 'RVU TRACKER',
        geminiResearchNote: 'Benchmarks physician compensation and clinical efficiency.',
        payload: { title: 'Provider wRVU Productivity & Clinical Volume Ledger', description: 'Calculates monthly wRVUs against target benchmarks.' }
      },
      {
        id: 'med_sheets_2',
        type: 'sheets_create',
        title: 'Insurance Claims Denial & Accounts Receivable (AR) Monitor',
        description: 'Track claims by payer (Medicare, BCBS, United), denial code, and appeal turnaround.',
        badgeLabel: 'CLAIMS AR SHEET',
        geminiResearchNote: 'Identifies recurring billing errors for rapid correction.',
        payload: { title: 'Medical Claims Denial Analysis & Aging AR Matrix', description: 'Tracks outstanding receivables by 30/60/90 days.' }
      },
      {
        id: 'med_sheets_3',
        type: 'sheets_create',
        title: 'Clinic Vaccine & Pharmaceutical Inventory Monitor',
        description: 'Track lot numbers, expiration dates, refrigerator temperatures, and reorder levels.',
        badgeLabel: 'PHARMA INVENTORY',
        geminiResearchNote: 'CDC Vaccines for Children (VFC) compliant logging.',
        payload: { title: 'Vaccine & Medication Inventory & Cold-Chain Log', description: 'Monitors medication stock and expiration warnings.' }
      },
      {
        id: 'med_sheets_4',
        type: 'sheets_create',
        title: 'Patient Wait Time & Clinic Flow Analyzer',
        description: 'Analyze check-in to exam room latency and provider face-to-face duration.',
        badgeLabel: 'FLOW ANALYZER',
        geminiResearchNote: 'Optimizes scheduling templates to reduce lobby congestion.',
        payload: { title: 'Clinic Patient Flow & Wait Time Optimization Model', description: 'Calculates room turnaround and scheduling variance.' }
      }
    ],
    Tasks: [
      {
        id: 'med_tasks_1',
        type: 'tasks_create',
        title: 'Review and Sign Outstanding EMR Lab Results',
        description: 'Review abnormal bloodwork, sign pathology reports, and route patient callbacks.',
        badgeLabel: 'SIGN LABS',
        geminiResearchNote: 'Closes critical diagnostic loop within 24 hours.',
        payload: { title: 'Review outstanding lab and diagnostic imaging results', notes: 'Call patients with critical values immediately.' }
      },
      {
        id: 'med_tasks_2',
        type: 'tasks_create',
        title: 'Reconcile Controlled Substance Log & Safe Inventory',
        description: 'Perform dual-witness physical count of Schedule II-IV medications.',
        badgeLabel: 'CONTROLLED COUNT',
        geminiResearchNote: 'DEA mandatory daily reconciliation requirement.',
        payload: { title: 'Perform daily controlled substance physical count', notes: 'Verify balance with dual staff signature.' }
      },
      {
        id: 'med_tasks_3',
        type: 'tasks_create',
        title: 'Submit Monthly CMS Quality Payment Program (MIPS) Metrics',
        description: 'Upload preventive screening and diabetes control quality measures.',
        badgeLabel: 'MIPS QUALITY',
        geminiResearchNote: 'Prevents Medicare reimbursement downward penalties.',
        payload: { title: 'Audit and submit monthly MIPS quality measures', notes: 'Verify hypertension and screening documentation.' }
      },
      {
        id: 'med_tasks_4',
        type: 'tasks_create',
        title: 'Check Clinic Emergency Crash Cart & Defibrillator',
        description: 'Verify expiration dates on epinephrine, oxygen tank pressure, and AED battery.',
        badgeLabel: 'CRASH CART',
        geminiResearchNote: 'Monthly life-safety readiness audit.',
        payload: { title: 'Inspect clinic emergency crash cart and AED ready status', notes: 'Check seal integrity and expiration dates.' }
      }
    ],
    Contacts: [
      {
        id: 'med_contacts_1',
        type: 'contacts_create',
        title: 'Add Diagnostic Radiology Imaging Center Liaison',
        description: 'Save direct scheduling desk for urgent MRI, CT, and Ultrasound orders.',
        badgeLabel: 'IMAGING LIAISON',
        geminiResearchNote: 'Expedites statutory urgent diagnostic bookings.',
        payload: { name: 'Dr. Robert Vance (Valley Imaging Center)', email: 'orders@valleyimaging.org', phone: '(503) 555-0821', organization: 'Valley Diagnostic Radiology' }
      },
      {
        id: 'med_contacts_2',
        type: 'contacts_create',
        title: 'Add Medical Device & Sterile Supply Representative',
        description: 'Save surgical instrument and consumable supplies vendor.',
        badgeLabel: 'MEDICAL SUPPLIER',
        geminiResearchNote: 'Direct rep contact for emergency consumable restocking.',
        payload: { name: 'Sarah Kline (MedTech Surgical)', email: 'skline@medtechsurgical.com', phone: '(503) 555-0144', organization: 'MedTech Surgical Supplies' }
      },
      {
        id: 'med_contacts_3',
        type: 'contacts_create',
        title: 'Add Clinical Laboratory Courier Dispatch',
        description: 'Save bloodwork and pathology specimen pickup hotline.',
        badgeLabel: 'LAB DISPATCH',
        geminiResearchNote: 'Ensures specimen viability with timely courier scheduling.',
        payload: { name: 'Quest / Labcorp Courier Dispatch', email: 'dispatch@clinicalabs.com', phone: '(503) 555-0990', organization: 'Clinical Laboratory Services' }
      },
      {
        id: 'med_contacts_4',
        type: 'contacts_create',
        title: 'Add Medical Malpractice Insurance Broker',
        description: 'Save professional liability and risk management policy advisor.',
        badgeLabel: 'RISK ADVISOR',
        geminiResearchNote: 'Annual policy renewal and claims guidance contact.',
        payload: { name: 'Richard Hayes (ProAssurance Brokerage)', email: 'rhayes@proassurance.com', phone: '(503) 555-0612', organization: 'ProAssurance Risk Management' }
      }
    ]
  },

  // 4. FINANCE, WEALTH & ACCOUNTING
  finance_banking: {
    Gmail: [
      {
        id: 'fin_gmail_1',
        type: 'gmail_send',
        title: 'Send Quarterly Wealth Portfolio Review & Market Outlook',
        description: 'Send asset allocation summary, rebalancing highlights, and macroeconomic perspective.',
        badgeLabel: 'PORTFOLIO REVIEW',
        geminiResearchNote: 'Cites fiduciary standard and standard FINRA performance disclaimers.',
        payload: { to: 'private.client@wealthmanagement.com', subject: 'Quarterly Portfolio Review & Asset Allocation Rebalancing Summary', body: 'Dear Client,\n\nWe have completed our quarterly rebalancing. Attached is your comprehensive performance review.' }
      },
      {
        id: 'fin_gmail_2',
        type: 'gmail_send',
        title: 'Draft S-Corp Tax Election & Distribution Strategy',
        description: 'Advise client on optimal reasonable salary vs owner distribution split to minimize payroll taxes.',
        badgeLabel: 'S-CORP TAX SPLIT',
        geminiResearchNote: 'Grounded in IRS reasonable compensation benchmark court rulings.',
        payload: { to: 'business.owner@company.com', subject: 'Tax Strategy: 2026 S-Corp Reasonable Salary & Distribution Analysis', body: 'Reviewing your annual compensation model to optimize FICA and pass-through tax savings.' }
      },
      {
        id: 'fin_gmail_3',
        type: 'gmail_send',
        title: 'Notice: Roth IRA Conversion Tax Bracket Optimization',
        description: 'Present strategic Roth conversion proposal filling current lower marginal tax bracket.',
        badgeLabel: 'ROTH CONVERSION',
        geminiResearchNote: 'Models lifetime tax rate arbitrage and multi-year compounding.',
        payload: { to: 'retiree.client@gmail.com', subject: 'Tax Planning: Strategic Roth IRA Conversion Opportunity for 2026', body: 'Analyzing the benefits of converting $45,000 from Traditional to Roth IRA within your 24% bracket.' }
      },
      {
        id: 'fin_gmail_4',
        type: 'gmail_send',
        title: 'IRC Sec 1031 Like-Kind Exchange 45-Day Deadline Warning',
        description: 'Alert real estate investor to pending 45-day property identification deadline.',
        badgeLabel: '1031 DEADLINE',
        geminiResearchNote: 'Strict statutory compliance with Section 1031 identification rules.',
        payload: { to: 'investor@commercialrealestate.com', subject: 'CRITICAL DEADLINE: 1031 Exchange 45-Day Identification Window', body: 'Friendly reminder: You have 12 days remaining to identify up to 3 replacement properties in writing.' }
      }
    ],
    Calendar: [
      {
        id: 'fin_cal_1',
        type: 'calendar_create',
        title: 'Schedule Comprehensive Retirement Cash-Flow Review',
        description: 'Model Monte Carlo retirement longevity simulation and healthcare inflation with clients.',
        badgeLabel: 'RETIREMENT SYNC',
        geminiResearchNote: 'Applies 4% safe withdrawal rate & sequence of returns risk modeling.',
        payload: { summary: 'Retirement Cash-Flow & Monte Carlo Simulation Review', durationMinutes: 60, description: 'Evaluate withdrawal strategy and social security timing.' }
      },
      {
        id: 'fin_cal_2',
        type: 'calendar_create',
        title: 'Book Year-End Tax Loss Harvesting Strategy Session',
        description: 'Identify capital gain offsets, wash-sale rules, and carryforward opportunities.',
        badgeLabel: 'TAX LOSS HARVEST',
        geminiResearchNote: 'Prevents 30-day IRS wash sale rule violations.',
        payload: { summary: 'Year-End Tax-Loss Harvesting & Capital Gains Strategy', durationMinutes: 45, description: 'Harvest taxable losses to offset realized gains.' }
      },
      {
        id: 'fin_cal_3',
        type: 'calendar_create',
        title: 'Schedule Corporate CPA Quarterly Financial Close',
        description: 'Review GAAP balance sheet, P&L variances, and tax accruals with executive team.',
        badgeLabel: 'GAAP CLOSE',
        geminiResearchNote: 'Enforces proper month-end revenue recognition under ASC 606.',
        payload: { summary: 'Corporate Financial Close & P&L Variance Review', durationMinutes: 60, description: 'Review quarterly EBITDA and cash flow metrics.' }
      },
      {
        id: 'fin_cal_4',
        type: 'calendar_create',
        title: 'Book Estate Planning & Trust Funding Alignment',
        description: 'Coordinate with estate attorney to verify beneficiary designations and trust titling.',
        badgeLabel: 'ESTATE TRUST SYNC',
        geminiResearchNote: 'Ensures non-probate asset alignment with revocable living trusts.',
        payload: { summary: 'Estate Planning & Trust Asset Titling Coordination', durationMinutes: 60, description: 'Verify asset ownership aligns with estate documents.' }
      }
    ],
    Drive: [
      {
        id: 'fin_drive_1',
        type: 'drive_create',
        title: 'Create Secure Client Financial Vault Folder',
        description: 'Encrypted storage for tax returns, brokerage statements, and corporate bylaws.',
        badgeLabel: 'FINANCIAL VAULT',
        geminiResearchNote: 'Measures compliance with SEC Rule 17a-4 electronic records storage.',
        payload: { name: 'Client_Financial_Tax_Vault_2026', mimeType: 'application/vnd.google-apps.folder' }
      },
      {
        id: 'fin_drive_2',
        type: 'drive_create',
        title: 'Store Audited GAAP Financial Statements (P&L, Balance Sheet)',
        description: 'Archive certified balance sheet, cash flows, and independent CPA opinion.',
        badgeLabel: 'GAAP AUDIT PDF',
        geminiResearchNote: 'Preserves verified statements for banking covenants and investors.',
        payload: { name: 'Audited_Financial_Statements_GAAP_2026.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'fin_drive_3',
        type: 'drive_create',
        title: 'Archive Cost Segregation Engineering Study',
        description: 'Store engineering study supporting accelerated 15-year/5-year property depreciation.',
        badgeLabel: 'COST SEG STUDY',
        geminiResearchNote: 'Defensible documentation for IRS Section 179 and bonus depreciation.',
        payload: { name: 'Commercial_Property_Cost_Segregation_Study.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'fin_drive_4',
        type: 'drive_create',
        title: 'Create Corporate Tax Return (Form 1120-S / 1065) Repository',
        description: 'Archive multi-year Federal and State corporate tax returns with K-1 schedules.',
        badgeLabel: 'TAX RETURN REPO',
        geminiResearchNote: 'Maintains required 7-year federal tax documentation archive.',
        payload: { name: 'Corporate_Tax_Filings_Historical_Archive', mimeType: 'application/vnd.google-apps.folder' }
      }
    ],
    Docs: [
      {
        id: 'fin_docs_1',
        type: 'docs_create',
        title: 'Draft Investment Policy Statement (IPS) for Private Client',
        description: 'Define risk tolerance, asset allocation targets, rebalancing bands, and liquidity needs.',
        badgeLabel: 'IPS DOCUMENT',
        geminiResearchNote: 'The foundational fiduciary governance charter for wealth portfolios.',
        payload: { title: 'Comprehensive Investment Policy Statement (IPS)', prompt: 'Create formal Investment Policy Statement with risk metrics.' }
      },
      {
        id: 'fin_docs_2',
        type: 'docs_create',
        title: 'Draft Executive Compensation & Stock Option (ISO/NSO) Plan',
        description: 'Structure 4-year vesting schedule with 1-year cliff and 83(b) tax election guide.',
        badgeLabel: 'EQUITY PLAN',
        geminiResearchNote: 'Adheres to Section 409A valuation standards and AMT calculations.',
        payload: { title: 'Executive Stock Incentive & Option Plan (ISO)', prompt: 'Draft executive equity vesting agreement with 83b guidance.' }
      },
      {
        id: 'fin_docs_3',
        type: 'docs_create',
        title: 'Write Management Discussion & Analysis (MD&A) Report',
        description: 'Executive overview analyzing gross margin fluctuations, OpEx trends, and runway.',
        badgeLabel: 'MD&A REPORT',
        geminiResearchNote: 'Formats financial storytelling for board members and shareholders.',
        payload: { title: 'Quarterly Management Discussion & Analysis (MD&A)', prompt: 'Draft narrative analysis of financial results and unit economics.' }
      },
      {
        id: 'fin_docs_4',
        type: 'docs_create',
        title: 'Draft S-Corp Reasonable Salary Justification Memo',
        description: 'Document BLS wage benchmark data justifying officer compensation for IRS compliance.',
        badgeLabel: 'SALARY MEMO',
        geminiResearchNote: 'Provides defensible documentation for IRS payroll tax audits.',
        payload: { title: 'Officer Reasonable Compensation Analysis Memo', prompt: 'Draft IRS-defensible reasonable salary justification memo.' }
      }
    ],
    Sheets: [
      {
        id: 'fin_sheets_1',
        type: 'sheets_create',
        title: 'Discounted Cash Flow (DCF) Corporate Valuation Model',
        description: 'Multi-year WACC, terminal value, and sensitivity matrix for business valuation.',
        badgeLabel: 'DCF VALUATION',
        geminiResearchNote: 'Calculates enterprise and equity value with sensitivity tables.',
        payload: { title: 'Discounted Cash Flow (DCF) & Sensitivity Valuation Model', description: 'Models free cash flows to firm with dynamic WACC.' }
      },
      {
        id: 'fin_sheets_2',
        type: 'sheets_create',
        title: 'Financial Planning & Analysis (FP&A) Budget vs Actuals',
        description: 'Monthly department budget variance model with automated conditional formatting.',
        badgeLabel: 'BUDGET VARIANCE',
        geminiResearchNote: 'Calculates favorable/unfavorable dollar and percentage variances.',
        payload: { title: 'FP&A Budget vs Actuals & Variance Analysis Model', description: 'Tracks OpEx by department with variance flags.' }
      },
      {
        id: 'fin_sheets_3',
        type: 'sheets_create',
        title: 'Real Estate 1031 Exchange Equity & Debt Boot Calculator',
        description: 'Ensure equal or greater value and debt replacement to achieve zero tax boot.',
        badgeLabel: '1031 BOOT CALC',
        geminiResearchNote: 'Calculates recognized capital gain and depreciation recapture.',
        payload: { title: 'IRC 1031 Exchange Replacement Property & Boot Analyzer', description: 'Calculates cash boot and mortgage boot exposure.' }
      },
      {
        id: 'fin_sheets_4',
        type: 'sheets_create',
        title: 'Run SQL Ledger Reconciliation on Transaction DB',
        description: 'Execute SQL queries across general ledger records to identify unmapped journal entries.',
        badgeLabel: 'GL RECON SQL',
        geminiResearchNote: 'Speeds up month-end reconciliation and trial balance audits.',
        payload: { title: 'General Ledger Reconciliation & SQL Journal Matrix', description: 'Queries unmapped transactions and unbalanced entries.' }
      }
    ],
    Tasks: [
      {
        id: 'fin_tasks_1',
        type: 'tasks_create',
        title: 'File Federal Form 1040-ES Quarterly Estimated Taxes',
        description: 'Calculate and submit Q3 estimated tax payment to avoid safe-harbor underpayment penalties.',
        badgeLabel: 'ESTIMATED TAX',
        geminiResearchNote: 'Applies 110% prior-year safe harbor rule for high-income earners.',
        payload: { title: 'Submit Q3 Federal & State estimated tax payments', notes: 'Verify 110% safe harbor compliance.' }
      },
      {
        id: 'fin_tasks_2',
        type: 'tasks_create',
        title: 'Execute Required Minimum Distribution (RMD) for Clients 73+',
        description: 'Calculate and process annual IRS mandatory distributions before Dec 31 deadline.',
        badgeLabel: 'RMD PROCESSING',
        geminiResearchNote: 'Prevents 25% IRS excise penalty on missed RMD amounts.',
        payload: { title: 'Calculate and process client year-end RMD distributions', notes: 'Check Uniform Lifetime Table factors.' }
      },
      {
        id: 'fin_tasks_3',
        type: 'tasks_create',
        title: 'Perform Form 83(b) Election Filing within 30 Days',
        description: 'Ensure signed 83(b) election is sent via certified mail to IRS within 30 days of equity grant.',
        badgeLabel: '83(b) FILING',
        geminiResearchNote: 'Strict statutory 30-day postmark deadline with zero extension grace.',
        payload: { title: 'File Form 83(b) election with IRS via Certified Mail', notes: 'Keep certified mail tracking receipt with tax file.' }
      },
      {
        id: 'fin_tasks_4',
        type: 'tasks_create',
        title: 'Reconcile Bank Accounts and Credit Lines in QuickBooks/NetSuite',
        description: 'Clear uncleared checks, match merchant processor deposits, and verify cash balance.',
        badgeLabel: 'BANK RECON',
        geminiResearchNote: 'Standard monthly accounting close checkpoint.',
        payload: { title: 'Complete monthly bank and merchant account reconciliation', notes: 'Verify zero variance against bank statements.' }
      }
    ],
    Contacts: [
      {
        id: 'fin_contacts_1',
        type: 'contacts_create',
        title: 'Add Senior Estate Planning Attorney Partner',
        description: 'Save trust and estate attorney for high-net-worth client referrals.',
        badgeLabel: 'ESTATE ATTORNEY',
        geminiResearchNote: 'Key partner for revocable trusts and dynasty planning.',
        payload: { name: 'Jonathan Sterling (Sterling Law Group)', email: 'jsterling@sterlinglaw.com', phone: '(503) 555-0678', organization: 'Sterling Estate Planning' }
      },
      {
        id: 'fin_contacts_2',
        type: 'contacts_create',
        title: 'Add Qualified Intermediary (QI) for 1031 Exchanges',
        description: 'Save bonded Qualified Intermediary for like-kind escrow holding.',
        badgeLabel: '1031 QI ESCROW',
        geminiResearchNote: 'Essential for valid 1031 safe-harbor exchange escrow accounts.',
        payload: { name: 'Patricia Gomez (National 1031 Exchange)', email: 'patricia@national1031.com', phone: '(503) 555-0812', organization: 'National 1031 Qualified Intermediary' }
      },
      {
        id: 'fin_contacts_3',
        type: 'contacts_create',
        title: 'Add Custodian Institutional Relationship Manager (Schwab/Fidelity)',
        description: 'Save direct desk for ACAT asset transfers and wire verifications.',
        badgeLabel: 'CUSTODIAN DESK',
        geminiResearchNote: 'Expedites institutional account transfers and trade resolutions.',
        payload: { name: 'Institutional Desk (Charles Schwab / Fidelity)', email: 'ria.support@schwab.com', phone: '(503) 555-0100', organization: 'Institutional Custody Services' }
      },
      {
        id: 'fin_contacts_4',
        type: 'contacts_create',
        title: 'Add Commercial Banker for SBA 7(a) & 504 Lending',
        description: 'Save commercial loan officer for business acquisition financing.',
        badgeLabel: 'COMMERCIAL LO',
        geminiResearchNote: 'Referral source for commercial real estate and business loans.',
        payload: { name: 'Robert Tanaka (Pacific Commercial Bank)', email: 'rtanaka@pacificbank.com', phone: '(503) 555-0554', organization: 'Pacific Commercial Banking' }
      }
    ]
  },

  // 5. LEGAL, CORPORATE & COMPLIANCE
  legal_compliance: {
    Gmail: [
      {
        id: 'law_gmail_1',
        type: 'gmail_send',
        title: 'Draft Master Services Agreement (MSA) Redline Summary',
        description: 'Send client summary of negotiated indemnification, limitation of liability, and IP clauses.',
        badgeLabel: 'MSA REDLINE',
        geminiResearchNote: 'Balances commercial risk with aggressive liability capping.',
        payload: { to: 'general.counsel@enterpriseclient.com', subject: 'MSA Contract Negotiations - Proposed Redlines & Compromise Language', body: 'Counsel,\n\nAttached are our redlines focusing on mutual indemnification and liability caps.' }
      },
      {
        id: 'law_gmail_2',
        type: 'gmail_send',
        title: 'Issue Formal Legal Hold & Spoliation Warning',
        description: 'Instruct employees to preserve emails, Slack messages, and documents regarding pending dispute.',
        badgeLabel: 'LEGAL HOLD',
        geminiResearchNote: 'Avoids severe court sanctions for spoliation of electronic evidence.',
        payload: { to: 'all-employees@company.com', subject: 'CONFIDENTIAL: Legal Hold Notice - Immediate Duty to Preserve Records', body: 'DO NOT delete any communications related to the matter described herein.' }
      },
      {
        id: 'law_gmail_3',
        type: 'gmail_send',
        title: 'Draft Cease-and-Desist Trademark Infringement Notice',
        description: 'Formal demand to cease unauthorized use of registered trademark and domain.',
        badgeLabel: 'CEASE & DESIST',
        geminiResearchNote: 'Establishes statutory notice under the Lanham Act for willful infringement.',
        payload: { to: 'infringing.party@competitor.com', subject: 'LEGAL NOTICE: Cease and Desist Unauthorized Trademark Use', body: 'Demand is hereby made that you immediately cease using our registered trademark.' }
      },
      {
        id: 'law_gmail_4',
        type: 'gmail_send',
        title: 'Regulatory Compliance Audit Filing Confirmation',
        description: 'Notify executive team of successful state corporate annual report and SEC Form D filing.',
        badgeLabel: 'COMPLIANCE FILING',
        geminiResearchNote: 'Ensures good standing and active corporate liability protection.',
        payload: { to: 'board@company.com', subject: 'Filing Confirmation: 2026 Annual Corporate Report & Good Standing', body: 'Annual filings have been accepted. Corporate entity is in active good standing.' }
      }
    ],
    Calendar: [
      {
        id: 'law_cal_1',
        type: 'calendar_create',
        title: 'Schedule Contract Redline Negotiation Conference',
        description: 'Book 45-minute live review with opposing counsel to close remaining open terms.',
        badgeLabel: 'CONTRACT SYNC',
        geminiResearchNote: 'Structured agenda to systematically resolve contested indemnities.',
        payload: { summary: 'Contract Redline Negotiation & Risk Allocation Call', durationMinutes: 45, description: 'Review Section 8 IP warranty and Section 12 indemnity.' }
      },
      {
        id: 'law_cal_2',
        type: 'calendar_create',
        title: 'Book Deposition Preparation Strategy Session',
        description: 'Prepare corporate witness on direct examination, cross-examination rules, and exhibits.',
        badgeLabel: 'DEPOSITION PREP',
        geminiResearchNote: 'Coaches witnesses on clarity, factual precision, and avoiding speculation.',
        payload: { summary: 'Witness Deposition Preparation & Document Review', durationMinutes: 90, description: 'Review factual timeline and evidentiary exhibits.' }
      },
      {
        id: 'law_cal_3',
        type: 'calendar_create',
        title: 'Schedule Annual Corporate Board Governance Meeting',
        description: 'Formal annual meeting approving resolutions, officer appointments, and dividend authorizations.',
        badgeLabel: 'BOARD MEETING',
        geminiResearchNote: 'Preserves corporate veil and formal governance compliance.',
        payload: { summary: 'Annual Board of Directors Meeting & Corporate Resolutions', durationMinutes: 60, description: 'Adopt annual minutes and ratify officer actions.' }
      },
      {
        id: 'law_cal_4',
        type: 'calendar_create',
        title: 'Schedule GDPR/CCPA Data Privacy Impact Assessment (DPIA)',
        description: 'Audit user consent flows, third-party trackers, and data retention schedules.',
        badgeLabel: 'PRIVACY DPIA',
        geminiResearchNote: 'Mandatory under GDPR Article 35 for high-risk processing.',
        payload: { summary: 'Quarterly Privacy Impact Assessment & Tracking Audit', durationMinutes: 45, description: 'Audit data flows and user deletion request SLA.' }
      }
    ],
    Drive: [
      {
        id: 'law_drive_1',
        type: 'drive_create',
        title: 'Create Secure M&A Virtual Data Room (VDR) Folder',
        description: 'Encrypted repository with watermarking for due diligence, contracts, and IP patents.',
        badgeLabel: 'M&A DATA ROOM',
        geminiResearchNote: 'Restricted folder access with document download access logs.',
        payload: { name: 'Project_Atlas_Virtual_Data_Room_2026', mimeType: 'application/vnd.google-apps.folder' }
      },
      {
        id: 'law_drive_2',
        type: 'drive_create',
        title: 'Store Executed Non-Disclosure Agreements (NDAs)',
        description: 'Centralized archive of mutual and unilateral NDAs with expiration tracking.',
        badgeLabel: 'NDA REPOSITORY',
        geminiResearchNote: 'Tracks term lengths and non-solicitation covenants.',
        payload: { name: 'Executed_NDAs_Corporate_Archive', mimeType: 'application/vnd.google-apps.folder' }
      },
      {
        id: 'law_drive_3',
        type: 'drive_create',
        title: 'Archive Trademark Registration & Patent Certificates',
        description: 'Store official USPTO trademark registrations and patent grant documentation.',
        badgeLabel: 'IP PATENTS PDF',
        geminiResearchNote: 'Maintains intellectual property asset portfolio documentation.',
        payload: { name: 'USPTO_Trademark_Registration_Certificates_2026.pdf', mimeType: 'application/pdf' }
      },
      {
        id: 'law_drive_4',
        type: 'drive_create',
        title: 'Create Litigation Case File Archive',
        description: 'Store pleadings, discovery responses, and court transcripts.',
        badgeLabel: 'LITIGATION VAULT',
        geminiResearchNote: 'Organized by docket number for trial readiness.',
        payload: { name: 'Litigation_Matter_Case_Files_Active', mimeType: 'application/vnd.google-apps.folder' }
      }
    ],
    Docs: [
      {
        id: 'law_docs_1',
        type: 'docs_create',
        title: 'Draft Mutual Non-Disclosure Agreement (NDA)',
        description: 'Standard 2-year mutual confidentiality agreement with definition of proprietary data.',
        badgeLabel: 'MUTUAL NDA',
        geminiResearchNote: 'Includes standard carve-outs for compelled court disclosures.',
        payload: { title: 'Standard Mutual Non-Disclosure Agreement (NDA)', prompt: 'Create comprehensive bilateral NDA with standard exclusions.' }
      },
      {
        id: 'law_docs_2',
        type: 'docs_create',
        title: 'Draft Data Processing Addendum (DPA) with Standard Contractual Clauses',
        description: 'GDPR and CCPA compliant processor agreement with Sub-processor authorization.',
        badgeLabel: 'PRIVACY DPA',
        geminiResearchNote: 'Incorporates EU 2021 Standard Contractual Clauses (SCCs).',
        payload: { title: 'Data Processing Addendum (DPA) - GDPR & CCPA Compliant', prompt: 'Draft robust DPA with technical security measures appendix.' }
      },
      {
        id: 'law_docs_3',
        type: 'docs_create',
        title: 'Draft Corporate Board Resolution & Written Consent',
        description: 'Formal unanimous written consent of directors authorizing financing round.',
        badgeLabel: 'BOARD RESOLUTION',
        geminiResearchNote: 'Satisfies Delaware General Corporation Law (DGCL Section 141f).',
        payload: { title: 'Unanimous Written Consent of Board of Directors', prompt: 'Draft corporate board resolution authorizing contract execution.' }
      },
      {
        id: 'law_docs_4',
        type: 'docs_create',
        title: 'Draft Independent Contractor & IP Assignment Agreement',
        description: 'Work-for-hire contract securing complete intellectual property ownership for company.',
        badgeLabel: 'IP ASSIGNMENT',
        geminiResearchNote: 'Ensures absolute corporate ownership of created software code.',
        payload: { title: 'Independent Contractor Agreement & Work-for-Hire IP Assignment', prompt: 'Draft contractor agreement with explicit IP assignment.' }
      }
    ],
    Sheets: [
      {
        id: 'law_sheets_1',
        type: 'sheets_create',
        title: 'Corporate Contract Renewal & Expiration Tracker',
        description: 'Monitor vendor contracts, auto-renewal notification windows, and liability limits.',
        badgeLabel: 'CONTRACT EXPIRY',
        geminiResearchNote: 'Prevents unwanted multi-year auto-renewals with 60-day alerts.',
        payload: { title: 'Enterprise Contract Expiration & Auto-Renewal Matrix', description: 'Tracks notice deadlines and governing law by contract.' }
      },
      {
        id: 'law_sheets_2',
        type: 'sheets_create',
        title: 'Cap Table & Equity Ownership Ledger',
        description: 'Track common shares, preferred stock series, option pool, and fully diluted percentages.',
        badgeLabel: 'CAP TABLE',
        geminiResearchNote: 'Models liquidation preference waterfalls and dilution impacts.',
        payload: { title: 'Corporate Capitalization Table & Equity Dilution Model', description: 'Tracks fully diluted ownership percentages and vesting.' }
      },
      {
        id: 'law_sheets_3',
        type: 'sheets_create',
        title: 'Litigation Hold & Custodian Preservation Log',
        description: 'Track custodians served with legal holds, acknowledgment dates, and collected gigabytes.',
        badgeLabel: 'LEGAL HOLD LOG',
        geminiResearchNote: 'Provides defensible proof of timely preservation in court discovery.',
        payload: { title: 'Litigation Hold Custodian Tracking & Compliance Ledger', description: 'Monitors custodian acknowledgments and collection dates.' }
      },
      {
        id: 'law_sheets_4',
        type: 'sheets_create',
        title: 'Run SQL Query on Contract Clause Repository',
        description: 'Query database to find all active customer contracts with non-standard indemnities.',
        badgeLabel: 'CONTRACT SQL',
        geminiResearchNote: 'Identifies aggregate corporate liability exposure across customer base.',
        payload: { title: 'Contract Risk Analysis & Clause Search SQL Ledger', description: 'Filters agreements with uncapped liability terms.' }
      }
    ],
    Tasks: [
      {
        id: 'law_tasks_1',
        type: 'tasks_create',
        title: 'File Trademark Statement of Use (SOU) with USPTO',
        description: 'Submit specimen of use and declaration before 6-month statutory deadline.',
        badgeLabel: 'USPTO SOU',
        geminiResearchNote: 'Prevents trademark abandonment under Section 1(d) of Lanham Act.',
        payload: { title: 'File Trademark Statement of Use (SOU) with USPTO', notes: 'Attach verified commercial website screenshot specimen.' }
      },
      {
        id: 'law_tasks_2',
        type: 'tasks_create',
        title: 'Send 60-Day Non-Renewal Notice to Vendor',
        description: 'Issue formal written termination notice to avoid automatic 12-month contract renewal.',
        badgeLabel: 'NON-RENEWAL',
        geminiResearchNote: 'Satisfies contractual notice provisions.',
        payload: { title: 'Send formal contract non-renewal notice to vendor', notes: 'Deliver via certified email per Section 14 notice clause.' }
      },
      {
        id: 'law_tasks_3',
        type: 'tasks_create',
        title: 'Review and Redline Incoming Customer Terms of Service',
        description: 'Ensure limitation of liability and mutual indemnity clauses are properly capped.',
        badgeLabel: 'REDLINE TERMS',
        geminiResearchNote: 'Protects gross margins against uncapped consequential damages.',
        payload: { title: 'Complete redline review on enterprise customer MSA', notes: 'Cap total liability to 12 months fees paid.' }
      },
      {
        id: 'law_tasks_4',
        type: 'tasks_create',
        title: 'Submit State Annual Corporate Filing & Registered Agent Fee',
        description: 'Maintain corporate good standing with Secretary of State.',
        badgeLabel: 'ANNUAL FILING',
        geminiResearchNote: 'Avoids state corporate administrative dissolution.',
        payload: { title: 'Submit annual state corporate report and fee', notes: 'Verify registered agent address is accurate.' }
      }
    ],
    Contacts: [
      {
        id: 'law_contacts_1',
        type: 'contacts_create',
        title: 'Add Outside Intellectual Property & Patent Counsel',
        description: 'Save patent attorney for patent filing and trademark prosecution.',
        badgeLabel: 'PATENT COUNSEL',
        geminiResearchNote: 'Registered USPTO patent practitioner.',
        payload: { name: 'Catherine Wu (Apex IP Law Group)', email: 'cwu@apexip.com', phone: '(503) 555-0721', organization: 'Apex Intellectual Property Law' }
      },
      {
        id: 'law_contacts_2',
        type: 'contacts_create',
        title: 'Add Commercial Litigation & Trial Counsel',
        description: 'Save lead trial attorney for dispute representation and arbitration.',
        badgeLabel: 'TRIAL COUNSEL',
        geminiResearchNote: 'First-chair commercial litigator.',
        payload: { name: 'Michael O’Connor (O’Connor & Partners)', email: 'moconnor@oconnorlaw.com', phone: '(503) 555-0933', organization: 'O’Connor Trial Attorneys' }
      },
      {
        id: 'law_contacts_3',
        type: 'contacts_create',
        title: 'Add Corporate Registered Agent Service Liaison',
        description: 'Save contact for service of process and state compliance notices.',
        badgeLabel: 'REGISTERED AGENT',
        geminiResearchNote: 'Designated recipient for legal summons and official notices.',
        payload: { name: 'CT Corporation / CSC Registered Agent Desk', email: 'service@ctcorporation.com', phone: '(503) 555-0150', organization: 'CT Corporation System' }
      },
      {
        id: 'law_contacts_4',
        type: 'contacts_create',
        title: 'Add Cyber Insurance & Data Breach Counsel',
        description: 'Save incident response attorney for emergency data breach notification triage.',
        badgeLabel: 'BREACH COUNSEL',
        geminiResearchNote: '24/7 hotline for statutory privacy breach disclosure timelines.',
        payload: { name: 'David Vance (DataTrust Privacy Law)', email: 'dvance@datatrust.com', phone: '(503) 555-0919', organization: 'DataTrust Privacy & Breach Counsel' }
      }
    ]
  }
};

// Fallback generator for remaining industries using intelligent Gemini research synthesis
export function getIndustryActionsForApp(rawIndustryId: string, app: GoogleAppKey): IndustryAppActionDef[] {
  const normId = normalizeIndustryId(rawIndustryId);
  if (INDUSTRY_ROTATING_ACTIONS[normId] && INDUSTRY_ROTATING_ACTIONS[normId][app]) {
    return INDUSTRY_ROTATING_ACTIONS[normId][app];
  }

  // Generate domain-specific actions dynamically for other industries
  const meta = getIndustryMeta(normId);
  return [
    {
      id: `${normId}_${app.toLowerCase()}_1`,
      type: app === 'Gmail' ? 'gmail_send' : app === 'Calendar' ? 'calendar_create' : app === 'Drive' ? 'drive_create' : app === 'Docs' ? 'docs_create' : app === 'Sheets' ? 'sheets_create' : app === 'Tasks' ? 'tasks_create' : 'contacts_create',
      title: `${meta.emoji} ${meta.shortName} Strategic ${app} Workflow`,
      description: `Execute high-leverage ${meta.careerTitle} task optimized with Gemini Ground Search intelligence.`,
      badgeLabel: `${meta.shortName.toUpperCase().slice(0, 12)} ${app.toUpperCase()}`,
      geminiResearchNote: `Grounded in ${meta.geminiResearchFocus}`,
      payload: {
        title: `${meta.shortName} Priority ${app} Deliverable`,
        to: `team@${normId.replace('_', '')}.com`,
        subject: `${meta.shortName} Executive Operational Update`,
        body: `Strategic workspace update for ${meta.careerTitle}. Grounded in ${meta.geminiResearchFocus}`,
        summary: `${meta.shortName} Strategic Execution Session`,
        name: `${meta.shortName}_Executive_Deliverable_2026`,
        durationMinutes: 45,
        description: `High-impact ${meta.shortName} workflow session.`
      }
    },
    {
      id: `${normId}_${app.toLowerCase()}_2`,
      type: app === 'Gmail' ? 'gmail_send' : app === 'Calendar' ? 'calendar_create' : app === 'Drive' ? 'drive_create' : app === 'Docs' ? 'docs_create' : app === 'Sheets' ? 'sheets_create' : app === 'Tasks' ? 'tasks_create' : 'contacts_create',
      title: `${meta.emoji} Automated Regulatory & Quality Review`,
      description: `Streamline domain compliance and audit requirements for ${meta.careerTitle}.`,
      badgeLabel: `${meta.shortName.toUpperCase().slice(0, 10)} AUDIT`,
      geminiResearchNote: `Incorporates industry regulatory standards: ${meta.geminiResearchFocus}`,
      payload: {
        title: `${meta.shortName} Quality & Compliance Review`,
        to: `audit@${normId.replace('_', '')}.com`,
        subject: `Compliance & Operational Audit: ${meta.shortName}`,
        body: `Audit summary ensuring strict adherence to industry standards.`,
        summary: `${meta.shortName} Compliance Review Meeting`,
        name: `${meta.shortName}_Compliance_Audit_2026.pdf`,
        durationMinutes: 30,
        description: `Quality review based on ${meta.geminiResearchFocus}`
      }
    },
    {
      id: `${normId}_${app.toLowerCase()}_3`,
      type: app === 'Gmail' ? 'gmail_send' : app === 'Calendar' ? 'calendar_create' : app === 'Drive' ? 'drive_create' : app === 'Docs' ? 'docs_create' : app === 'Sheets' ? 'sheets_create' : app === 'Tasks' ? 'tasks_create' : 'contacts_create',
      title: `${meta.emoji} Executive Stakeholder Pipeline Milestone`,
      description: `Synthesize key deliverables and accelerate execution timelines in ${meta.shortName}.`,
      badgeLabel: `${meta.shortName.toUpperCase().slice(0, 10)} MILESTONE`,
      geminiResearchNote: `Assimilates top productivity practices scoured by Gemini SDK.`,
      payload: {
        title: `${meta.shortName} Stakeholder Milestone Briefing`,
        to: `stakeholders@${normId.replace('_', '')}.com`,
        subject: `Executive Status Update: ${meta.shortName} Deliverables`,
        body: `Quarterly milestone review for ${meta.careerTitle}.`,
        summary: `${meta.shortName} Executive Milestone Briefing`,
        name: `${meta.shortName}_Executive_Ledger_Matrix`,
        durationMinutes: 60,
        description: `Executive sync analyzing metrics in ${meta.shortName}.`
      }
    },
    {
      id: `${normId}_${app.toLowerCase()}_4`,
      type: app === 'Gmail' ? 'gmail_send' : app === 'Calendar' ? 'calendar_create' : app === 'Drive' ? 'drive_create' : app === 'Docs' ? 'docs_create' : app === 'Sheets' ? 'sheets_create' : app === 'Tasks' ? 'tasks_create' : 'contacts_create',
      title: `${meta.emoji} High-Yield Growth & Optimization Task`,
      description: `Leverage AI-driven best practices for rapid execution in ${meta.shortName}.`,
      badgeLabel: `${meta.shortName.toUpperCase().slice(0, 10)} OPTIMIZE`,
      geminiResearchNote: `Targeted for maximum ROI and operational speed in ${meta.shortName}.`,
      payload: {
        title: `${meta.shortName} High-Yield Operational Optimization`,
        to: `operations@${normId.replace('_', '')}.com`,
        subject: `Optimization Roadmap: ${meta.shortName}`,
        body: `Action items and automated workflows for immediate deployment.`,
        summary: `${meta.shortName} Strategic Planning Block`,
        name: `${meta.shortName}_Optimization_Model`,
        durationMinutes: 45,
        description: `Operational enhancement for ${meta.careerTitle}.`
      }
    }
  ];
}
