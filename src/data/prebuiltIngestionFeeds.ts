import { IngestionDaemonFeed } from '../types';

export const PREBUILT_INGESTION_FEEDS: IngestionDaemonFeed[] = [
  {
    id: 'fannie_mae_selling_guide',
    name: 'Fannie Mae Selling Guide & Policy Updates',
    industry: 'Real Estate & Mortgage Banking',
    targetUrlOrRss: 'https://singlefamily.fanniemae.com/news-insights/announcements',
    schedule: 'daily',
    status: 'active',
    autoExecutiveBriefing: true,
    lastIngestedAt: '2026-09-20T14:30:00Z',
    itemsIngestedCount: 42,
    category: 'compliance_guidelines',
    defaultTags: ['fannie_mae', 'mortgage_underwriting', 'dti_limits', 'cra_grants'],
    diffSummary: 'Updated Section B3-4: 2026 Area Median Income (AMI) thresholds increased by 4.2% in coastal MSAs.'
  },
  {
    id: 'irs_tax_code_revisions',
    name: 'IRS Corporate & 1031 Exchange Bulletins',
    industry: 'Financial Advisory & CPA',
    targetUrlOrRss: 'https://www.irs.gov/newsroom/news-releases-for-current-month',
    schedule: 'weekly',
    status: 'active',
    autoExecutiveBriefing: true,
    lastIngestedAt: '2026-09-18T09:00:00Z',
    itemsIngestedCount: 18,
    category: 'tax_statutes',
    defaultTags: ['irs', '1031_exchange', 'depreciation', 'capital_gains'],
    diffSummary: 'Published 2026 Section 179 expensing cap adjustments and updated solar tax credit transferability.'
  },
  {
    id: 'cfpb_regulatory_updates',
    name: 'CFPB Truth-in-Lending & TRID Compliance',
    industry: 'Banking & Legal Counsel',
    targetUrlOrRss: 'https://www.consumerfinance.gov/about-us/newsroom/',
    schedule: 'daily',
    status: 'active',
    autoExecutiveBriefing: true,
    lastIngestedAt: '2026-09-21T06:15:00Z',
    itemsIngestedCount: 31,
    category: 'consumer_protection',
    defaultTags: ['cfpb', 'trid', 'tila_respa', 'loan_estimates'],
    diffSummary: 'Clarified fee disclosure safe harbors for automated digital pre-approval portals.'
  },
  {
    id: 'hipaa_hhs_privacy_rule',
    name: 'HHS Health Information Privacy & AI Rules',
    industry: 'Healthcare & Biotech Operations',
    targetUrlOrRss: 'https://www.hhs.gov/hipaa/for-professionals/privacy/guidance/index.html',
    schedule: 'weekly',
    status: 'paused',
    autoExecutiveBriefing: false,
    lastIngestedAt: '2026-09-15T11:20:00Z',
    itemsIngestedCount: 12,
    category: 'hipaa_privacy',
    defaultTags: ['hipaa', 'phi_masking', 'patient_privacy', 'telehealth'],
    diffSummary: 'Enforced strict zero-retention logging guidelines for LLM ambient medical scribes.'
  },
  {
    id: 'custom_webhook_stream',
    name: 'Real-Time Enterprise Webhook Ingestion Pipe',
    industry: 'Enterprise SaaS & Internal APIs',
    targetUrlOrRss: 'https://api.vantageai.app/v1/brain/webhook/ingest-live',
    schedule: 'realtime_webhook',
    status: 'active',
    autoExecutiveBriefing: true,
    lastIngestedAt: '2026-09-21T18:44:12Z',
    itemsIngestedCount: 156,
    category: 'webhook_stream',
    defaultTags: ['api_payload', 'realtime_sync', 'client_crm'],
    diffSummary: 'Listening on secure endpoint. Auto-vectorizes inbound JSON payloads into client vector vaults.'
  }
];
