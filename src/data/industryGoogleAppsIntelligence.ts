/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

export interface IndustryGoogleAppsProfile {
  industryId: string;
  industryName: string;
  careerTitle: string;
  icon: string;
  badgeColor: string;
  
  // Gmail & Docs Intelligence
  writingPersonaDirective: string;
  requiredRegulatoryDisclaimers: string[];
  commonEmailTemplates: {
    id: string;
    title: string;
    type: 'email' | 'doc_letter' | 'brief';
    subject: string;
    bodyPattern: string;
    targetAudience: string;
  }[];
  
  // Google Sheets Intelligence
  sheetsSpreadsheetTemplates: {
    id: string;
    title: string;
    description: string;
    category: string;
    columns: string[];
    sampleData: string[][];
    recommendedFormulas: string[];
    conditionalFormattingRules: string[];
  }[];
  
  // Quick-Action Toolbar Buttons for Google Apps
  smartAppButtons: {
    id: string;
    label: string;
    appTarget: 'gmail' | 'docs' | 'sheets' | 'calendar';
    actionDescription: string;
    promptTemplate: string;
  }[];

  // Specific Google Workspace Workflow Rules
  workspaceRules: {
    gmailRule: string;
    calendarRule: string;
    sheetsRule: string;
    docsRule: string;
  };
}

export const ALL_10_INDUSTRY_GOOGLE_PROFILES: IndustryGoogleAppsProfile[] = [
  // 1. MORTGAGE, LENDING & REAL ESTATE
  {
    industryId: 'mortgage_real_estate',
    industryName: 'Mortgage, Lending & Real Estate',
    careerTitle: 'Mortgage Loan Officer & Real Estate Broker',
    icon: 'Home',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    writingPersonaDirective: 'Draft TRID-compliant, RESPA-aligned correspondence. Emphasize pre-approval parameters, DTI breakdown, down payment assistance options (USDA 100%, Lakeview National DPA, OHCS Flex FirstHome), and clear documentation requests.',
    requiredRegulatoryDisclaimers: [
      'NMLS #123456 | Equal Housing Lender. Rates and loan terms subject to underwriting approval and market lock window.',
      'CONFIDENTIALITY NOTICE: This message contains confidential borrower loan information intended solely for the addressee.'
    ],
    commonEmailTemplates: [
      {
        id: 'mlo-preapproval-letter',
        title: 'Official Borrower Pre-Approval Letter & Loan Summary',
        type: 'doc_letter',
        subject: 'Official Loan Pre-Approval Notice - [Borrower Name]',
        targetAudience: 'Homebuyer & Real Estate Agent',
        bodyPattern: 'Dear [Borrower Name],\n\nWe are pleased to inform you that based on a review of your credit, income, and assets, you have been PRE-APPROVED for a home purchase up to $ [Max Purchase Price] under the [Loan Program Name] program.\n\nLoan Summary Breakdown:\n- Maximum Purchase Price: $[Max Purchase Price]\n- Down Payment Required: [Down Payment %] ($[Down Payment Amount])\n- Estimated Monthly Payment (PITI + MI): $[Monthly Payment]\n- Eligible DPA Programs: [Lakeview 100% DPA / USDA 100% / OHCS Flex FirstHome]\n\nNext Steps:\n1. Provide updated 30-day paystubs and bank statements upon contract execution.\n2. Ensure property passes FHA/VA/USDA appraisal guidelines.\n\nSincerely,\n[Loan Officer Name]\nNMLS #123456'
      },
      {
        id: 'realtor-listing-description',
        title: 'MLS Listing Description & Open House Announcement',
        type: 'email',
        subject: 'New Listing Alert: [Property Address] - Move-in Ready!',
        targetAudience: 'Prospective Buyers & Broker Network',
        bodyPattern: 'Welcome to [Property Address]! This stunning [Bed] bed, [Bath] bath home features [Key Features, e.g., updated quartz kitchen, private backyard, 2-car garage].\n\nHighlights:\n- Price: $[Price]\n- Eligible for 100% Zero-Down Financing (USDA / Lakeview DPA)\n- Open House: This Saturday from 1:00 PM - 4:00 PM\n\nContact us today for a private tour!'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'mlo-lead-dti-pipeline',
        title: 'Mortgage Lead & DTI Qualifying Pipeline Tracker',
        description: 'Track loan prospects, Front-End/Back-End DTI ratios, FICO scores, and down payment assistance eligibility.',
        category: 'Pipeline & Calculations',
        columns: ['Borrower Name', 'Phone', 'Email', 'Gross Monthly Income', 'Proposed PITI', 'Monthly Debt', 'Front DTI %', 'Back DTI %', 'FICO', 'Loan Program', 'DPA Status'],
        sampleData: [
          ['John Doe', '555-0192', 'john@example.com', '$8,500', '$2,200', '$650', '25.88%', '33.53%', '720', 'Conventional 3%', 'Pre-Approved'],
          ['Jane Smith', '555-0143', 'jane@example.com', '$6,200', '$1,750', '$400', '28.23%', '34.68%', '650', 'Lakeview 100% DPA', 'Eligible']
        ],
        recommendedFormulas: [
          '=E2/D2 (Front-End DTI Ratio)',
          '=(E2+F2)/D2 (Back-End DTI Ratio)',
          '=IF(H2<=0.43, "QUALIFIED", "OVER DTI LIMIT")'
        ],
        conditionalFormattingRules: ['Back DTI > 43% -> Red Fill', 'Back DTI <= 36% -> Green Fill']
      }
    ],
    smartAppButtons: [
      { id: 'btn-dti-calc', label: '🧮 Calculate DTI Ratios', appTarget: 'sheets', actionDescription: 'Calculate Front & Back DTI in Sheets', promptTemplate: 'Calculate Front DTI (Housing/Income) and Back DTI ((Housing+Debt)/Income) for these borrower rows.' },
      { id: 'btn-trid-preapp', label: '📄 TRID Pre-Approval Letter', appTarget: 'docs', actionDescription: 'Generate formal pre-approval letter in Docs', promptTemplate: 'Generate a TRID-compliant Pre-Approval Letter in Google Docs format.' }
    ],
    workspaceRules: {
      gmailRule: 'Enforce NMLS licensing footer and RESPA anti-kickback compliance disclosures on all outbound drafts.',
      calendarRule: 'Auto-inject 15-minute transitional focus buffers around closing signing appointments.',
      sheetsRule: 'Treat lead columns as relational schema with atomic DTI calculations and domain purge filtering.',
      docsRule: 'Format pre-approval and commitment letters with structured loan breakdown tables.'
    }
  },

  // 2. TECHNOLOGY & SOFTWARE ENGINEERING
  {
    industryId: 'technology_software',
    industryName: 'Technology & Software Engineering',
    careerTitle: 'Software Architect, Tech Lead & Product Manager',
    icon: 'Code',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    writingPersonaDirective: 'Write concise, technical, bug-free communication. Use clear engineering terminology, API contracts, acceptance criteria, and Markdown code blocks.',
    requiredRegulatoryDisclaimers: [
      'CONFIDENTIAL CODE & ARCHITECTURE SPECIFICATION - Proprietary & Confidential.',
      'Security Notice: Ensure no API keys or access tokens are embedded in plain text.'
    ],
    commonEmailTemplates: [
      {
        id: 'tech-release-notes',
        title: 'Production Software Release Notes & API Migration Guide',
        type: 'email',
        subject: '[Release v2.4.0] Feature Deployment & API Changelog',
        targetAudience: 'Engineering Team & DevOps',
        bodyPattern: 'Team,\n\nWe have successfully deployed Release v2.4.0 to production.\n\nKey Changes:\n- [Feature 1]: Reduced P99 latency by 45% using Redis caching.\n- [API Change]: Endpoint /api/v1/users is deprecated in favor of /api/v2/users.\n- [Bug Fix]: Fixed race condition in transaction handler.\n\nRollback Plan:\nIn case of critical errors, run `helm rollback app-release 142`.\n\nMonitoring Dashboard: Grafana Link Here'
      },
      {
        id: 'tech-prd-document',
        title: 'Product Requirement Document (PRD) & Tech Spec',
        type: 'doc_letter',
        subject: 'PRD: Autonomous AI Workflow Engine v1.0',
        targetAudience: 'Product & Development Teams',
        bodyPattern: '# Product Requirement Document: [Feature Name]\n\n## 1. Executive Summary\n[Brief summary of feature goals and business value]\n\n## 2. Technical Architecture & Endpoints\n- Endpoint: `POST /api/v1/execute`\n- Authentication: Bearer Token (JWT)\n- Rate Limit: 100 req/min\n\n## 3. Acceptance Criteria\n- [ ] Response latency < 200ms\n- [ ] 100% TypeScript type safety\n- [ ] Zero unhandled promise rejections'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'tech-sprint-backlog',
        title: 'Agile Sprint Backlog & Defect Tracking Matrix',
        description: 'Track story points, sprint velocity, bug severity, code owners, and deployment status.',
        category: 'Engineering & Sprint Management',
        columns: ['Issue ID', 'Title', 'Component', 'Priority', 'Story Points', 'Assignee', 'Status', 'PR Link', 'Target Release'],
        sampleData: [
          ['ENG-1042', 'Optimize Gemini API proxy latency', 'Backend/Express', 'P1-High', '5', 'Mike Ford', 'In Review', 'PR #84', 'v2.4.0'],
          ['ENG-1043', 'Add PII redaction regex guard', 'Security Module', 'P0-Critical', '3', 'Dev Team', 'Done', 'PR #82', 'v2.4.0']
        ],
        recommendedFormulas: [
          '=SUMIF(G2:G100, "Done", E2:E100) (Completed Velocity)',
          '=COUNTIF(D2:D100, "P0-Critical") (Open Critical Bugs)'
        ],
        conditionalFormattingRules: ['Status = "Blocked" -> Red Fill', 'Priority = "P0-Critical" -> Bold Red Text']
      }
    ],
    smartAppButtons: [
      { id: 'btn-gen-prd', label: '🚀 Generate Tech PRD', appTarget: 'docs', actionDescription: 'Format technical PRD in Google Docs', promptTemplate: 'Write a comprehensive Product Requirement Document (PRD) with user stories and acceptance criteria.' },
      { id: 'btn-sprint-log', label: '📊 Sprint Backlog Sheet', appTarget: 'sheets', actionDescription: 'Build Agile Sprint Backlog in Sheets', promptTemplate: 'Create an Agile Sprint Backlog table with story points and defect tracking columns.' }
    ],
    workspaceRules: {
      gmailRule: 'Include explicit PR links, commit hashes, and deployment status in all engineering updates.',
      calendarRule: 'Auto-block 2-hour deep work coding blocks without meeting interruptions.',
      sheetsRule: 'Auto-calculate sprint velocity, burn-down totals, and bug resolution rates.',
      docsRule: 'Format specifications with standard Markdown headers, code blocks, and API schemas.'
    }
  },

  // 3. HEALTHCARE & MEDICAL PRACTICE
  {
    industryId: 'healthcare_medical',
    industryName: 'Healthcare & Medical Practice',
    careerTitle: 'Physician, Medical Doctor & Clinical Nurse Specialist',
    icon: 'Activity',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    writingPersonaDirective: 'Write with strict clinical precision, compassionate patient tone, and uncompromising HIPAA privacy guardrails. Never store unencrypted Protected Health Information (PHI).',
    requiredRegulatoryDisclaimers: [
      'HIPAA CONFIDENTIALITY NOTICE: Protected Health Information (PHI) enclosed. Unauthorized access, copying, or distribution is strictly prohibited under 45 CFR § 164.530.',
      'Medical Disclaimer: This correspondence is for clinical consultation purposes and does not replace emergency medical care.'
    ],
    commonEmailTemplates: [
      {
        id: 'med-physician-referral',
        title: 'Clinical Specialist Physician Referral & Chart Summary',
        type: 'doc_letter',
        subject: 'Clinical Referral Consultation Request - [Patient ID #]',
        targetAudience: 'Specialist Physician & Clinical Team',
        bodyPattern: 'Dear Dr. [Specialist Name],\n\nI am referring Patient ID #[Patient ID] for specialized evaluation regarding [Primary Diagnosis / Symptoms].\n\nClinical Summary:\n- Chief Complaint: [Chief Complaint]\n- Relevant Medical History: [History]\n- Current Medications: [Medication List]\n- Recent Diagnostic Test Results: [Labs / Imaging Summary]\n\nThank you for your clinical assistance in co-managing this patient’s care plan.\n\nSincerely,\n[Physician Name], MD'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'med-patient-log',
        title: 'Anonymized Clinical Quality & Appointment Log',
        description: 'Track anonymized patient visit metrics, ICD-10 codes, lab status, and follow-up schedules.',
        category: 'Clinical Operations',
        columns: ['Patient ID', 'Age', 'Gender', 'Visit Date', 'ICD-10 Code', 'Primary Specialty', 'Lab Results Status', 'Follow-up Required'],
        sampleData: [
          ['PT-9041', '54', 'F', '2026-09-20', 'E11.9 (Type 2 Diabetes)', 'Endocrinology', 'Lab Received', 'Yes (3 Weeks)'],
          ['PT-9042', '62', 'M', '2026-09-21', 'I10 (Essential Hypertension)', 'Cardiology', 'Pending MRI', 'Yes (1 Week)']
        ],
        recommendedFormulas: [
          '=COUNTIF(G2:G100, "Pending MRI") (Pending Diagnostics)',
          '=COUNTIF(H2:H100, "Yes*") (Follow-ups Needed)'
        ],
        conditionalFormattingRules: ['Lab Results Status = "Critical" -> Red Alert', 'Follow-up = "Yes" -> Yellow Highlight']
      }
    ],
    smartAppButtons: [
      { id: 'btn-hipaa-referral', label: '🩺 HIPAA Referral Letter', appTarget: 'docs', actionDescription: 'Draft clinical referral in Docs', promptTemplate: 'Draft a HIPAA-compliant specialist referral letter with anonymized patient ID.' },
      { id: 'btn-patient-tracker', label: '📋 Clinical Visit Tracker', appTarget: 'sheets', actionDescription: 'Build clinical quality log in Sheets', promptTemplate: 'Build an anonymized clinical quality spreadsheet with ICD-10 codes and follow-up tracking.' }
    ],
    workspaceRules: {
      gmailRule: 'Automatically redact patient names and SSNs into anonymized Patient IDs before drafting.',
      calendarRule: 'Enforce non-negotiable 15-minute HIPAA transitional buffers around telehealth and in-office consults.',
      sheetsRule: 'Highlight critical lab flags in red and enforce strict anonymized column schemas.',
      docsRule: 'Structure clinical notes using SOAP (Subjective, Objective, Assessment, Plan) format.'
    }
  },

  // 4. FINANCE, BANKING & WEALTH MANAGEMENT
  {
    industryId: 'finance_banking',
    industryName: 'Finance, Banking & Wealth Management',
    careerTitle: 'Financial Advisor, Wealth Manager & Investment Analyst',
    icon: 'DollarSign',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    writingPersonaDirective: 'Write structured, analytical financial advice. Include disclosures on market volatility, asset allocation percentages, portfolio rebalancing, and tax efficiency.',
    requiredRegulatoryDisclaimers: [
      'SEC / FINRA Disclosure: Securities offered through registered broker-dealers. Past performance is no guarantee of future financial results.',
      'Tax & Legal Disclaimer: Investment advice is subject to individual risk tolerance profiles. Consult a CPA for specific tax advice.'
    ],
    commonEmailTemplates: [
      {
        id: 'fin-portfolio-review',
        title: 'Quarterly Wealth Management Portfolio Review Brief',
        type: 'doc_letter',
        subject: 'Q3 Wealth Management Portfolio & Economic Allocation Brief',
        targetAudience: 'High-Net-Worth Client',
        bodyPattern: 'Dear [Client Name],\n\nEnclosed is your Q3 Portfolio Performance Review. Over the past quarter, your portfolio achieved a net return of [Return %], aligned with your Moderate Growth risk profile.\n\nAsset Allocation Summary:\n- Equities (US & Global): [Equities %]\n- Fixed Income / Bonds: [Bonds %]\n- Alternatives & Liquid Cash: [Cash %]\n\nKey Recommendations:\n1. Rebalance 5% from US Large Cap Growth into Fixed Income to capture locked yields.\n2. Maximize tax-deferred IRA contributions prior to year-end.\n\nSincerely,\n[Wealth Manager Name], CFP®'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'fin-asset-allocation',
        title: 'Portfolio Asset Allocation & Rebalancing Model',
        description: 'Track portfolio weights, target vs current asset allocation, yield calculations, and tax-loss harvesting targets.',
        category: 'Wealth Management',
        columns: ['Asset Class', 'Ticker / Fund', 'Current Value ($)', 'Target Weight %', 'Current Weight %', 'Rebalance Delta ($)', 'Yield %', 'Annual Income ($)'],
        sampleData: [
          ['US Equities', 'VTI', '$450,000', '50.0%', '52.9%', '-$25,000', '1.45%', '$6,525'],
          ['Fixed Income', 'BND', '$250,000', '30.0%', '29.4%', '+$5,000', '4.20%', '$10,500']
        ],
        recommendedFormulas: [
          '=C2/SUM(C$2:C$10) (Current Weight)',
          '=(D2-E2)*SUM(C$2:C$10) (Rebalance Delta Dollar)',
          '=C2*G2 (Annual Income)'
        ],
        conditionalFormattingRules: ['ABS(Target - Current) > 5% -> Orange Alert']
      }
    ],
    smartAppButtons: [
      { id: 'btn-fin-rebalance', label: '📊 Portfolio Model Sheet', appTarget: 'sheets', actionDescription: 'Generate rebalancing model in Sheets', promptTemplate: 'Build a financial portfolio asset allocation sheet with target vs current weights and rebalancing delta formulas.' },
      { id: 'btn-fin-summary', label: '📈 Client Review Letter', appTarget: 'docs', actionDescription: 'Format quarterly review in Docs', promptTemplate: 'Write a professional quarterly wealth management client review letter.' }
    ],
    workspaceRules: {
      gmailRule: 'Enforce FINRA/SEC regulatory disclaimers and performance disclosure footers.',
      calendarRule: 'Auto-schedule annual fiduciary review meetings with 15-min prep buffer.',
      sheetsRule: 'Use high-precision currency formatting and automated percentage rebalancing formulas.',
      docsRule: 'Include risk tolerance disclosures and asset pie-chart breakdown sections.'
    }
  },

  // 5. LEGAL, COMPLIANCE & CORPORATE COUNSEL
  {
    industryId: 'legal_compliance',
    industryName: 'Legal, Compliance & Corporate Counsel',
    careerTitle: 'Corporate Attorney, Legal Compliance Officer & Paralegal',
    icon: 'Shield',
    badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    writingPersonaDirective: 'Write authoritative, formal legal communications. Use precise legal citations, contractual indemnification clauses, non-disclosure terms, and privilege assertions.',
    requiredRegulatoryDisclaimers: [
      'ATTORNEY-CLIENT PRIVILEGED & CONFIDENTIAL WORK PRODUCT - SUBJECT TO NON-DISCLOSURE.',
      'Legal Disclaimer: This document contains legal analysis for internal corporate governance and does not constitute a formal binding opinion unless signed.'
    ],
    commonEmailTemplates: [
      {
        id: 'leg-cease-desist',
        title: 'Formal Cease & Desist Demand Letter & Trademark Notice',
        type: 'doc_letter',
        subject: 'LEGAL DEMAND: Formal Cease and Desist - Unauthorized IP Infringement',
        targetAudience: 'Opposing Counsel / Infringing Party',
        bodyPattern: 'VIA CERTIFIED MAIL AND ELECTRONIC TRANSMISSION\n\nTo: [Infringing Entity]\nRe: Formal Notice of Intellectual Property Infringement & Demand to Cease and Desist\n\nDear Sir/Madam,\n\nThis firm represents [Client Name] ("Client"). It has come to our attention that your organization is engaged in the unauthorized commercial use of Client’s registered trademark "[Trademark Name]" (Reg. No. [Reg #]).\n\nDEMAND IS HEREBY MADE THAT YOU:\n1. Immediately cease and desist all unauthorized use, advertising, and sale of infringing materials.\n2. Provide written confirmation of compliance within ten (10) business days.\n\nFailure to comply will leave our client no alternative but to seek immediate injunctive relief and monetary damages in Federal District Court.\n\nSincerely,\n[Attorney Name], Esq.'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'leg-litigation-matrix',
        title: 'Litigation Case Management & Discovery Audit Matrix',
        description: 'Track active lawsuits, court filing deadlines, discovery document counts, statutes of limitations, and settlement exposures.',
        category: 'Case Management',
        columns: ['Case Matter ID', 'Plaintiff / Defendant', 'Court Jurisdiction', 'Lead Attorney', 'Filing Date', 'Statute of Limitation', 'Discovery Status', 'Settlement Exposure ($)'],
        sampleData: [
          ['LIT-2026-08', 'Vantage Corp v. Acme Tech', 'US District Court (OR)', 'J. Miller, Esq.', '2026-03-15', '2028-03-15', 'Motion to Compel Pending', '$250,000'],
          ['LIT-2026-11', 'Doe v. Subsidiary LLC', 'State Circuit Court', 'M. Ford, Esq.', '2026-06-01', '2027-06-01', 'Document Production Done', '$75,000']
        ],
        recommendedFormulas: [
          '=F2-TODAY() (Days Left on Statute)',
          '=SUM(H2:H100) (Total Settlement Exposure)'
        ],
        conditionalFormattingRules: ['Days Left < 30 -> Bold Red Warning', 'Discovery Status = "Overdue" -> Red Fill']
      }
    ],
    smartAppButtons: [
      { id: 'btn-legal-notice', label: '⚖️ Formal Demand Letter', appTarget: 'docs', actionDescription: 'Generate formal legal demand in Docs', promptTemplate: 'Draft a formal legal demand letter asserting attorney-client privilege.' },
      { id: 'btn-case-matrix', label: '📁 Case Docket Matrix', appTarget: 'sheets', actionDescription: 'Build litigation tracking sheet in Sheets', promptTemplate: 'Create a litigation case management sheet with statute of limitation countdowns.' }
    ],
    workspaceRules: {
      gmailRule: 'Automatically append ATTORNEY-CLIENT PRIVILEGED banner to all outbound emails.',
      calendarRule: 'Auto-set court filing deadline alerts 7 days, 3 days, and 24 hours prior.',
      sheetsRule: 'Highlight impending statutes of limitation in red with auto-days remaining calculation.',
      docsRule: 'Format pleadings and contracts with numbered paragraphs and signature blocks.'
    }
  },

  // 6. MARKETING, ADVERTISING & CREATIVE
  {
    industryId: 'marketing_creative',
    industryName: 'Marketing, Advertising & Creative',
    careerTitle: 'Digital Marketing Strategist & Creative Director',
    icon: 'Megaphone',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    writingPersonaDirective: 'Write captivating, high-converting direct-response copy. Focus on hooks, audience emotional drivers, value propositions, and measurable CTA conversions.',
    requiredRegulatoryDisclaimers: [
      'FTC ADVERTISING DISCLOSURE: Sponsored content / affiliate compensation notice included where applicable.',
      'Copyright Notice: Creative assets property of client under work-for-hire contract.'
    ],
    commonEmailTemplates: [
      {
        id: 'mkt-campaign-brief',
        title: 'Omnichannel Launch Campaign Strategy Brief',
        type: 'doc_letter',
        subject: 'Creative Brief: [Product Name] Q4 Omnichannel Marketing Launch',
        targetAudience: 'Creative Team & Brand Manager',
        bodyPattern: '# Creative Campaign Brief: [Product / Campaign Name]\n\n## 1. Core Objective & Target Audience\n- Target ICP: [Ideal Customer Profile]\n- Primary Goal: Generate [Lead Goal #] qualified leads at CPA < $[Target CPA]\n\n## 2. Key Hook & Messaging Pillars\n- Primary Hook: "[Attention Grabber Hook]"\n- Supporting Benefits: 1. [Benefit 1] | 2. [Benefit 2] | 3. [Benefit 3]\n\n## 3. Channel Assets Required\n- Meta/Facebook Ads: 3 Video Reels (9:16) + 5 Static Carousel Banners\n- Google PPC Search: 15 Headlines + 4 Sitelinks\n- Cold Email Sequence: 4-part automated drip sequence'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'mkt-roas-tracker',
        title: 'Omnichannel Ad Spend, ROAS & Conversion Model',
        description: 'Track ad spend across Meta, Google Ads, TikTok, impressions, Clicks, CTR, CPA, and Return on Ad Spend (ROAS).',
        category: 'Analytics & ROI',
        columns: ['Campaign Name', 'Channel', 'Budget ($)', 'Ad Spend ($)', 'Impressions', 'Clicks', 'CTR %', 'Leads / Sales', 'CPA ($)', 'Revenue ($)', 'ROAS (x)'],
        sampleData: [
          ['Q4 Cold Prospecting', 'Meta / FB', '$10,000', '$8,450', '420,000', '12,600', '3.00%', '315', '$26.83', '$38,200', '4.52x'],
          ['Search Intent High-Value', 'Google Ads', '$7,500', '$6,120', '85,000', '5,100', '6.00%', '204', '$30.00', '$32,500', '5.31x']
        ],
        recommendedFormulas: [
          '=F2/E2 (CTR Formula)',
          '=D2/H2 (CPA Formula)',
          '=J2/D2 (ROAS Formula)'
        ],
        conditionalFormattingRules: ['ROAS >= 3.0x -> Bright Green Fill', 'ROAS < 1.5x -> Red Fill Alert']
      }
    ],
    smartAppButtons: [
      { id: 'btn-mkt-brief', label: '📣 Creative Brief Doc', appTarget: 'docs', actionDescription: 'Generate creative campaign brief in Docs', promptTemplate: 'Write a comprehensive creative marketing campaign brief with audience hooks and asset checklists.' },
      { id: 'btn-roas-model', label: '📊 ROAS Tracker Sheet', appTarget: 'sheets', actionDescription: 'Build marketing ROAS sheet in Sheets', promptTemplate: 'Create an ad campaign ROAS tracker sheet with CPA and conversion formulas.' }
    ],
    workspaceRules: {
      gmailRule: 'Ensure FTC compliance disclosures on sponsored or promotional email blasts.',
      calendarRule: 'Auto-schedule campaign milestone review sessions 48 hours prior to launch.',
      sheetsRule: 'Highlight ROAS above 3.0x in green and calculate live cost-per-acquisition (CPA).',
      docsRule: 'Format briefs with visual sections for hooks, audience pain points, and asset deliverables.'
    }
  },

  // 7. EDUCATION, ACADEMIA & RESEARCH
  {
    industryId: 'education_academia',
    industryName: 'Education, Academia & Research',
    careerTitle: 'University Professor, Academic Researcher & Instructional Designer',
    icon: 'BookOpen',
    badgeColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    writingPersonaDirective: 'Write scholarly, rigorously researched academic prose. Include APA/IEEE citations, methodology definitions, grant budget rationale, and curriculum learning outcomes.',
    requiredRegulatoryDisclaimers: [
      'ACADEMIC INTEGRITY NOTICE: Proprietary research data & grant proposal under institutional review.',
      'FERPA COMPLIANCE NOTICE: Student education records protected under 20 U.S.C. § 1232g.'
    ],
    commonEmailTemplates: [
      {
        id: 'edu-grant-proposal',
        title: 'Academic Research Grant Application & Abstract',
        type: 'doc_letter',
        subject: 'Grant Application Submission: [Research Project Title]',
        targetAudience: 'National Science Foundation / University Review Board',
        bodyPattern: '# Research Grant Proposal: [Project Title]\n\n## Executive Abstract\nThis study investigates [Research Question / Hypothesis] using [Methodology, e.g., longitudinal empirical analysis].\n\n## 1. Literature Review & Theoretical Framework\nPrior literature (Smith et al., 2024; Johnson, 2025) demonstrates a gap in [Problem Domain].\n\n## 2. Research Methodology\n- Sample Cohort: N = 1,200 participants\n- Data Collection: Double-blind controlled trials\n- Statistical Model: Multivariable regression analysis (p < 0.05 significance)\n\n## 3. Budget Rationale ($[Total Budget])\n- Personnel & Postdoc Stipends: $[Personnel Amount]\n- Laboratory Equipment & Computing: $[Equipment Amount]'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'edu-grant-budget',
        title: 'Research Grant Budget & Empirical Data Tracking Sheet',
        description: 'Track research grant line items, indirect cost rates (F&A), postdoc stipends, publication fees, and statistical datasets.',
        category: 'Grant Administration',
        columns: ['Budget Line Item', 'Category', 'Year 1 ($)', 'Year 2 ($)', 'F&A Rate %', 'Direct Cost ($)', 'Indirect Cost ($)', 'Total Line Cost ($)'],
        sampleData: [
          ['Principal Investigator (20% Effort)', 'Personnel', '$24,000', '$25,200', '52.5%', '$49,200', '$25,830', '$75,030'],
          ['High-Performance GPU Cluster', 'Equipment', '$18,000', '$2,000', '0.0%', '$20,000', '$0', '$20,000']
        ],
        recommendedFormulas: [
          '=F2*(E2)',
          '=F2+G2',
          '=SUM(H2:H100)'
        ],
        conditionalFormattingRules: ['Over Budget -> Red Alert', 'Direct Cost > $50,000 -> Yellow Highlight']
      }
    ],
    smartAppButtons: [
      { id: 'btn-edu-abstract', label: '🎓 Academic Research Abstract', appTarget: 'docs', actionDescription: 'Format grant proposal in Docs', promptTemplate: 'Write a grant proposal abstract with theoretical framework and methodology.' },
      { id: 'btn-edu-budget', label: '🔬 Grant Budget Sheet', appTarget: 'sheets', actionDescription: 'Build grant budget model in Sheets', promptTemplate: 'Build a research grant budget sheet with direct vs indirect F&A cost calculations.' }
    ],
    workspaceRules: {
      gmailRule: 'Enforce FERPA student privacy compliance warnings on class announcements.',
      calendarRule: 'Auto-reserve office hours and dissertation defense blocks with 15-min prep.',
      sheetsRule: 'Calculate indirect institutional overhead (F&A) rates automatically on grant line items.',
      docsRule: 'Format research documents with formal APA/IEEE citation standards.'
    }
  },

  // 8. CONSTRUCTION, ENGINEERING & CONTRACTING
  {
    industryId: 'construction_engineering',
    industryName: 'Construction, Engineering & Contracting',
    careerTitle: 'General Contractor, Construction PM & Civil Engineer',
    icon: 'Building2',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    writingPersonaDirective: 'Write clear, rigorous construction specifications. Detail material quantities, labor hours, subcontractor scopes, safety OSHA compliance, and change order costs.',
    requiredRegulatoryDisclaimers: [
      'CONTRACTOR LICENSE NOTICE: State Licensed General Contractor CCB #204910. Fully bonded & insured.',
      'OSHA Safety Compliance: Jobsite safety rules strictly enforced under 29 CFR 1926.'
    ],
    commonEmailTemplates: [
      {
        id: 'con-bid-proposal',
        title: 'Commercial Construction Bid Proposal & Scope of Work',
        type: 'doc_letter',
        subject: 'Construction Bid Proposal: [Project Name] - [Site Address]',
        targetAudience: 'Property Owner & Developer',
        bodyPattern: 'OFFICIAL BID PROPOSAL & SCOPE OF WORK\n\nProject: [Project Name]\nSite Address: [Address]\nContractor: [Company Name] (CCB #[CCB Number])\n\nScope of Work Included:\n1. Site Demolition & Excavation: $[Excavation Cost]\n2. Structural Framing & Concrete Foundation: $[Framing Cost]\n3. MEP (Mechanical, Electrical, Plumbing) Rough-in: $[MEP Cost]\n4. Finish Carpentry & Final Cleanup: $[Finish Cost]\n\nTotal Estimated Contract Price: $[Total Contract Price]\nProject Duration: [Estimated Weeks] Weeks\n\nPayment Schedule:\n- 20% Deposit upon contract signing\n- 30% Milestone 1 (Foundation Pass)\n- 30% Milestone 2 (Dry-in Pass)\n- 20% Final Punchlist Completion'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'con-cost-estimator',
        title: 'Construction Line-Item Cost Estimator & Bidding Log',
        description: 'Track material takeoffs, labor hours, subcontractor quotes, contingency buffers, and actual vs estimated costs.',
        category: 'Project Estimating',
        columns: ['CSI Division', 'Description', 'Quantity', 'Unit of Measure', 'Unit Cost ($)', 'Material Total ($)', 'Labor Total ($)', 'Subcontractor ($)', 'Line Total ($)'],
        sampleData: [
          ['Division 03 - Concrete', '3000 PSI Slab Foundation', '120', 'Cubic Yards', '$145.00', '$17,400', '$8,500', '$0', '$25,900'],
          ['Division 26 - Electrical', 'Commercial 200A Service Panel', '1', 'Lump Sum', '$4,500.00', '$0', '$0', '$6,200', '$6,200']
        ],
        recommendedFormulas: [
          '=C2*E2',
          '=F2+G2+H2',
          '=SUM(I2:I100)*1.10 (Total with 10% Contingency)'
        ],
        conditionalFormattingRules: ['Actual > Estimated -> Red Highlight', 'Subcontractor > $20,000 -> Yellow Highlight']
      }
    ],
    smartAppButtons: [
      { id: 'btn-con-bid', label: '🏗️ Construction Bid Proposal', appTarget: 'docs', actionDescription: 'Format bid proposal in Docs', promptTemplate: 'Write a commercial construction bid proposal with scope of work and payment milestones.' },
      { id: 'btn-con-estimate', label: '📐 Cost Estimator Sheet', appTarget: 'sheets', actionDescription: 'Build cost estimator in Sheets', promptTemplate: 'Build a construction cost takeoff estimator sheet with CSI division line items.' }
    ],
    workspaceRules: {
      gmailRule: 'Include contractor license CCB number and bonding disclaimers on all quotes.',
      calendarRule: 'Auto-schedule jobsite inspection milestones with 15-min site safety prep buffer.',
      sheetsRule: 'Calculate 10% contingency buffers automatically on total material and labor line items.',
      docsRule: 'Structure bids with CSI master format divisions and clear payment schedules.'
    }
  },

  // 9. HOSPITALITY, RETAIL & E-COMMERCE
  {
    industryId: 'hospitality_ecom',
    industryName: 'Hospitality, Retail & E-Commerce',
    careerTitle: 'E-Commerce Store Owner & Hotel Operations Manager',
    icon: 'ShoppingBag',
    badgeColor: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    writingPersonaDirective: 'Write customer-centric, brand-building communications. Detail inventory stock levels, fulfillment shipping SLAs, guest VIP experiences, and refund handling protocols.',
    requiredRegulatoryDisclaimers: [
      'CUSTOMER SERVICE SLA: Responses processed within 24 business hours.',
      'Return & Refund Policy: 30-day money-back guarantee on unopened items.'
    ],
    commonEmailTemplates: [
      {
        id: 'ecom-vip-retention',
        title: 'VIP E-Commerce Customer Retention & Win-Back Drip',
        type: 'email',
        subject: 'An Exclusive Gift Just For You, [First Name]! 🎁',
        targetAudience: 'VIP Store Customers',
        bodyPattern: 'Hi [First Name],\n\nWe noticed it’s been a while since your last order, and we miss you! As one of our most valued VIP members, we wanted to give you exclusive early access to our new collection.\n\nEnjoy [Discount %]% OFF your next order with code: VIP[Code].\n\nTop Recommended Items For You:\n1. [Product 1]\n2. [Product 2]\n\nClick here to claim your discount before it expires!'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'ecom-inventory-model',
        title: 'E-Commerce Inventory SKU & Fulfillment Reorder Model',
        description: 'Track SKU stock levels, reorder thresholds, lead times, unit margins, and safety stock alerts.',
        category: 'Inventory & Operations',
        columns: ['SKU ID', 'Product Title', 'Current Stock', 'Safety Stock', 'Reorder Point', 'Unit Cost ($)', 'Retail Price ($)', 'Margin %', 'Reorder Status'],
        sampleData: [
          ['SKU-1049', 'Organic Zen Tea Blend 250g', '42', '50', '100', '$4.20', '$24.99', '83.19%', 'REORDER NOW'],
          ['SKU-1050', 'Ceramic Teapot Matte Black', '180', '30', '50', '$12.50', '$49.00', '74.49%', 'Stock OK']
        ],
        recommendedFormulas: [
          '=(G2-F2)/G2 (Margin % Formula)',
          '=IF(C2<=E2, "REORDER NOW", "Stock OK")'
        ],
        conditionalFormattingRules: ['Reorder Status = "REORDER NOW" -> Bold Red Alert']
      }
    ],
    smartAppButtons: [
      { id: 'btn-ecom-retention', label: '🎁 VIP Win-Back Email', appTarget: 'gmail', actionDescription: 'Draft VIP customer retention email', promptTemplate: 'Draft a high-converting VIP customer retention win-back email with discount codes.' },
      { id: 'btn-ecom-inventory', label: '📦 SKU Inventory Sheet', appTarget: 'sheets', actionDescription: 'Build inventory reorder model in Sheets', promptTemplate: 'Build an e-commerce inventory SKU reorder sheet with automated stock alerts.' }
    ],
    workspaceRules: {
      gmailRule: 'Include customer service tracking links and 30-day refund policy footers.',
      calendarRule: 'Auto-schedule inventory reorder audits bi-weekly.',
      sheetsRule: 'Highlight SKUs below safety stock in red and compute live profit margins.',
      docsRule: 'Format SOPs for warehouse packing and customer refund workflows.'
    }
  },

  // 10. EXECUTIVE MANAGEMENT & STRATEGIC CONSULTING
  {
    industryId: 'executive_consulting',
    industryName: 'Executive Management & Strategic Consulting',
    careerTitle: 'Management Consultant & Executive Chief of Staff',
    icon: 'Briefcase',
    badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    writingPersonaDirective: 'Write executive-level strategic memos. Frame insights using MECE (Mutually Exclusive, Collectively Exhaustive) principles, C-suite KPIs, risk mitigation matrices, and clear action items.',
    requiredRegulatoryDisclaimers: [
      'STRICTLY CONFIDENTIAL - EXECUTIVE COMMITTEE ONLY.',
      'Strategic Advisory Notice: Recommendations based on internal financial analysis and market benchmark data.'
    ],
    commonEmailTemplates: [
      {
        id: 'exec-board-memo',
        title: 'Executive Board Memorandum & Strategic Roadmap',
        type: 'doc_letter',
        subject: 'EXECUTIVE MEMORANDUM: Q4 Strategic Growth & Efficiency Directives',
        targetAudience: 'Board of Directors & Executive Leadership',
        bodyPattern: 'MEMORANDUM\n\nTO: Executive Committee & Board of Directors\nFROM: [Executive Title / Chief of Staff]\nDATE: [Date]\nSUBJECT: Strategic Transformation & Q4 Resource Allocation\n\n1. EXECUTIVE SUMMARY\nOver the past two quarters, organizational initiatives achieved a [Metric %] increase in gross operating margin while reducing customer churn by [Churn Reduction %].\n\n2. STRATEGIC PILLARS\n- Pillar 1: Automation of core Google Workspace operations via Vantage AI.\n- Pillar 2: Expansion into enterprise B2B accounts.\n\n3. ACTION ITEMS & RESPONSIBILITIES\n- CEO / COO: Finalize merger term sheet by Nov 15.\n- CFO: Reallocate $500k into R&D automation.'
      }
    ],
    sheetsSpreadsheetTemplates: [
      {
        id: 'exec-kpi-dashboard',
        title: 'Executive C-Suite KPI Dashboard & Cost Savings Model',
        description: 'Track high-level EBITDA, ARR, gross margin, customer acquisition cost (CAC), LTV, and wage productivity savings.',
        category: 'Executive Dashboard',
        columns: ['KPI Category', 'Metric Name', 'Q1 Target', 'Q1 Actual', 'Variance %', 'Status', 'Owner', 'Strategic Priority'],
        sampleData: [
          ['Revenue', 'Annual Recurring Revenue (ARR)', '$5,000,000', '$5,420,000', '+8.40%', 'Exceeded', 'VP Sales', 'P0-Growth'],
          ['Efficiency', 'Hours Reclaimed / Employee', '10.0 hrs/wk', '14.5 hrs/wk', '+45.0%', 'Exceeded', 'Chief of Staff', 'P0-Automation']
        ],
        recommendedFormulas: [
          '=(D2-C2)/C2 (Variance %)',
          '=IF(E2>=0, "Exceeded", "Below Target")'
        ],
        conditionalFormattingRules: ['Variance < 0% -> Red Highlight', 'Status = "Exceeded" -> Green Highlight']
      }
    ],
    smartAppButtons: [
      { id: 'btn-exec-memo', label: '👔 Board Executive Memo', appTarget: 'docs', actionDescription: 'Format board memorandum in Docs', promptTemplate: 'Write an Executive Board Memorandum following MECE principles with action items.' },
      { id: 'btn-exec-kpi', label: '📈 C-Suite KPI Sheet', appTarget: 'sheets', actionDescription: 'Build executive KPI model in Sheets', promptTemplate: 'Build a C-Suite KPI dashboard sheet with variance percentages and owner assignments.' }
    ],
    workspaceRules: {
      gmailRule: 'Append STRICTLY CONFIDENTIAL C-Suite header to all executive drafts.',
      calendarRule: 'Auto-inject 15-minute preparation buffers before all board meetings.',
      sheetsRule: 'Highlight revenue and variance targets using executive KPI formatting.',
      docsRule: 'Format memos with MECE executive summary headers and actionable owner matrices.'
    }
  }
];

export function getProfileForIndustry(industryId: string): IndustryGoogleAppsProfile {
  return ALL_10_INDUSTRY_GOOGLE_PROFILES.find(p => p.industryId === industryId) || ALL_10_INDUSTRY_GOOGLE_PROFILES[0];
}
