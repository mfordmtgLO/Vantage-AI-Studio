/**
 * Vantage AI Workspace - Executive Inbox Urgency Engine
 * 4-Quadrant Urgency Classifier, Commitment/Deadline Extractor, and SLA Tracker
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

export type UrgencyQuadrant = 'q1_urgent_revenue' | 'q2_urgent_operational' | 'q3_low_informational' | 'q4_spam_purge';

export interface ExtractedCommitment {
  id: string;
  type: 'deadline' | 'promise' | 'document_due' | 'wire_funds' | 'rate_lock';
  text: string;
  targetDateTime: string; // ISO or formatted date
  targetDateFormatted: string;
  hasCalendarConflict: boolean;
  conflictingEventTitle?: string;
  status: 'pending' | 'scheduled_calendar' | 'task_created' | 'completed';
}

export interface SmartEmailThread {
  id: string;
  threadId: string;
  from: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  receivedDate: string;
  quadrant: UrgencyQuadrant;
  urgencyScore: number; // 0 - 100
  financialValue?: string;
  slaHoursRemaining: number;
  sentiment: 'anxious' | 'urgent' | 'professional' | 'routine' | 'spam';
  tags: string[];
  commitments: ExtractedCommitment[];
  suggestedAction: string;
  isRead: boolean;
  isPurged: boolean;
  draftResponse?: string;
}

export const PRESET_SMART_INBOX_THREADS: SmartEmailThread[] = [
  {
    id: 'th-101',
    threadId: 't-101',
    from: 'Marcus Vance <m.vance@vanceholdings.com>',
    senderName: 'Marcus Vance',
    senderEmail: 'm.vance@vanceholdings.com',
    subject: 'URGENT: $1.45M Rate Lock Expiration & Final Closing Disclosure',
    snippet: 'Our rate lock on the Northlake Commercial Property expires Wednesday at 5:00 PM EST. Need the signed CD and wire instructions immediately...',
    body: 'Hi Mike,\n\nOur 30-day rate lock on the Northlake Commercial Property ($1.45M at 5.875%) will expire Wednesday at 5:00 PM EST. The escrow officer has prepared the final Closing Disclosure. We need your executed sign-off and wire instructions confirmation by tomorrow (Tuesday) at 3:00 PM EST to avoid a $4,200 lock extension fee.\n\nPlease confirm you received the attached closing package.\n\nBest,\nMarcus Vance\nManaging Director, Vance Holdings',
    receivedDate: 'Today, 08:24 AM',
    quadrant: 'q1_urgent_revenue',
    urgencyScore: 98,
    financialValue: '$1,450,000 Deal',
    slaHoursRemaining: 4,
    sentiment: 'urgent',
    tags: ['Rate Lock', 'P0 Closing', '$1.45M', 'High Revenue'],
    commitments: [
      {
        id: 'cm-1',
        type: 'deadline',
        text: 'Executed sign-off and wire instructions confirmation due',
        targetDateTime: new Date(Date.now() + 86400000).toISOString(),
        targetDateFormatted: 'Tomorrow at 3:00 PM EST',
        hasCalendarConflict: true,
        conflictingEventTitle: 'Executive AI Architecture Sync',
        status: 'pending'
      },
      {
        id: 'cm-2',
        type: 'rate_lock',
        text: '30-Day Rate Lock Expiration (5.875%)',
        targetDateTime: new Date(Date.now() + 172800000).toISOString(),
        targetDateFormatted: 'Wednesday at 5:00 PM EST',
        hasCalendarConflict: false,
        status: 'pending'
      }
    ],
    suggestedAction: 'Execute Closing Disclosure Review & Place 15m Calendar Buffer Hold for Wire Signing',
    isRead: false,
    isPurged: false,
    draftResponse: 'Hi Marcus,\n\nConfirming receipt of the $1.45M Northlake Commercial closing package. I have reviewed the final Closing Disclosure (5.875% locked rate) and will deliver the signed confirmation prior to Tuesday 3:00 PM EST deadline to protect the lock.\n\nOur wire confirmation protocol is being dispatched securely through the portal.\n\nWarm regards,\nMike Ford\nVantage AI Executive Workspace'
  },
  {
    id: 'th-102',
    threadId: 't-102',
    from: 'Jessica Sterling <jsterling@fidelityfirsttitle.com>',
    senderName: 'Jessica Sterling',
    senderEmail: 'jsterling@fidelityfirsttitle.com',
    subject: 'Title Commitment Exception #4 - Survey Requirement for Escrow #88419',
    snippet: 'Underwriting flagged boundary easement discrepancy on Schedule B. Need updated plat map by Thursday noon...',
    body: 'Hello Mike,\n\nFidelity Title underwriting has issued a conditional approval for Escrow #88419, but raised a flag on Schedule B Exception #4 regarding a utility easement along the southern boundary.\n\nWe will need the certified boundary survey or an endorsement waiver signed by Thursday at 12:00 PM PST to maintain our scheduled Friday funding.\n\nSincerely,\nJessica Sterling\nSenior Escrow Officer',
    receivedDate: 'Today, 09:12 AM',
    quadrant: 'q2_urgent_operational',
    urgencyScore: 89,
    financialValue: 'Escrow #88419',
    slaHoursRemaining: 18,
    sentiment: 'anxious',
    tags: ['Title Exception', 'Compliance', 'Underwriting Flag'],
    commitments: [
      {
        id: 'cm-3',
        type: 'document_due',
        text: 'Provide certified boundary survey or endorsement waiver for Schedule B Exception #4',
        targetDateTime: new Date(Date.now() + 259200000).toISOString(),
        targetDateFormatted: 'Thursday at 12:00 PM PST',
        hasCalendarConflict: false,
        status: 'pending'
      }
    ],
    suggestedAction: 'Dispatch survey request to civil engineering partner & update escrow milestones',
    isRead: false,
    isPurged: false,
    draftResponse: 'Hi Jessica,\n\nThank you for the prompt notice regarding Schedule B Exception #4. I am pulling the updated boundary plat survey from our Drive repository and will deliver the certified copy by Wednesday afternoon, well ahead of the Thursday noon deadline.\n\nBest,\nMike Ford'
  },
  {
    id: 'th-103',
    threadId: 't-103',
    from: 'Secondary Marketing Desk <updates@fanniemae-bulletins.org>',
    senderName: 'Fannie Mae Bulletin Desk',
    senderEmail: 'updates@fanniemae-bulletins.org',
    subject: 'Weekly Yield Curve & HomeReady DPA Area Median Income (AMI) Limits for 2026',
    snippet: 'New county-level income caps published for Fannie Mae HomeReady and Freddie Mac Home Possible programs...',
    body: 'Dear Mortgage Professional,\n\nFannie Mae has updated the Area Median Income (AMI) lookup tables for Q3 2026. Key changes include an upward revision of 4.2% across major metropolitan statistical areas (MSAs), expanding first-time buyer eligibility for 3% down conventional financing.\n\nReview the full bulletin in your lender portal.\n\nFannie Mae Secondary Marketing',
    receivedDate: 'Yesterday, 03:45 PM',
    quadrant: 'q3_low_informational',
    urgencyScore: 42,
    financialValue: 'Industry Update',
    slaHoursRemaining: 72,
    sentiment: 'routine',
    tags: ['Fannie Mae', 'AMI Limits', 'DPA Guidelines', 'Informational'],
    commitments: [],
    suggestedAction: 'Vectorize AMI changes into 2nd Brain Knowledge Base for GeoMap DPA calculations',
    isRead: true,
    isPurged: false,
    draftResponse: ''
  },
  {
    id: 'th-104',
    threadId: 't-104',
    from: 'Outbound Growth Bot <growth@coldlead-scraper.biz>',
    senderName: 'Cold Lead Scraper Bot',
    senderEmail: 'growth@coldlead-scraper.biz',
    subject: 'Buy 50,000 Unverified Mortgage Lead Lists for $299! Instant CSV Export',
    snippet: 'Special discount on non-compliant scraper leads. Boost your pipeline overnight with scraped phone numbers...',
    body: 'Hey Mike,\n\nAre you looking to scale your mortgage lending volume? We have 50k scraped homeowner records with phone numbers and emails ready to blast. No opt-in required.\n\nClick here to buy now for $299!',
    receivedDate: 'Today, 04:10 AM',
    quadrant: 'q4_spam_purge',
    urgencyScore: 8,
    financialValue: 'SPAM / Low Quality',
    slaHoursRemaining: 0,
    sentiment: 'spam',
    tags: ['Cold Solicit', 'TCPA Risk', 'Purge Candidate', 'Blacklist Domain'],
    commitments: [],
    suggestedAction: 'Purge domain coldlead-scraper.biz and permanently sync to 2nd Brain Blacklist',
    isRead: false,
    isPurged: false,
    draftResponse: ''
  },
  {
    id: 'th-105',
    threadId: 't-105',
    from: 'Elena Rostova <erostova@pacificcrestcapital.com>',
    senderName: 'Elena Rostova',
    senderEmail: 'erostova@pacificcrestcapital.com',
    subject: 'Commercial Construction Draw Request #3 - $320,000 Inspection Passed',
    snippet: 'City building inspection passed for Phase 2 framing. Contractor invoices attached for funding signoff...',
    body: 'Hi Mike,\n\nPhase 2 framing inspection on the Sunset Heights development passed Friday afternoon. We are requesting release of Construction Draw #3 ($320,000) against the approved loan facility.\n\nInvoices and AIA G702/G703 payment certificates are attached for your signoff.\n\nThanks,\nElena Rostova\nVP Development, Pacific Crest',
    receivedDate: 'Today, 07:50 AM',
    quadrant: 'q1_urgent_revenue',
    urgencyScore: 92,
    financialValue: '$320,000 Draw',
    slaHoursRemaining: 6,
    sentiment: 'professional',
    tags: ['Draw Request', 'Commercial', '$320k', 'Inspection Passed'],
    commitments: [
      {
        id: 'cm-4',
        type: 'wire_funds',
        text: 'Review AIA G702/G703 payment certificate and approve $320,000 Draw #3',
        targetDateTime: new Date(Date.now() + 129600000).toISOString(),
        targetDateFormatted: 'Tomorrow at 5:00 PM EST',
        hasCalendarConflict: false,
        status: 'pending'
      }
    ],
    suggestedAction: 'Review AIA G702 contractor invoices & verify title lien waivers before wire approval',
    isRead: false,
    isPurged: false,
    draftResponse: 'Hi Elena,\n\nReceived the passed inspection certificates and Draw #3 paperwork ($320,000). I am cross-referencing the title lien waivers now and will have the funding authorization released to escrow by tomorrow morning.\n\nBest,\nMike Ford'
  }
];

export const QUADRANT_DEFINITIONS = {
  q1_urgent_revenue: {
    label: 'Q1: Urgent & High Revenue (P0)',
    color: 'border-red-500 bg-red-50/50 dark:bg-red-950/20 text-red-700 dark:text-red-300',
    badge: 'bg-red-600 text-white',
    description: 'Rate Locks, Wire Sign-offs, Contract Expirations & High Dollar Closings',
    iconName: 'Flame'
  },
  q2_urgent_operational: {
    label: 'Q2: Urgent & Operational / Compliance',
    color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-300',
    badge: 'bg-amber-600 text-white',
    description: 'Title Exceptions, Underwriting Conditions, Audits & API Webhook Failures',
    iconName: 'AlertTriangle'
  },
  q3_low_informational: {
    label: 'Q3: Low Urgency & Informational',
    color: 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300',
    badge: 'bg-blue-600 text-white',
    description: 'Fannie Mae Bulletins, Yield Curves, Market Indices & Team Newsletters',
    iconName: 'Info'
  },
  q4_spam_purge: {
    label: 'Q4: Spam & Purge Candidates',
    color: 'border-slate-400 bg-slate-100/50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400',
    badge: 'bg-slate-600 text-white',
    description: 'Cold Scraper Inbound, TCPA Risks, Competitor Crawlers & Junk Solicitations',
    iconName: 'Trash2'
  }
};
