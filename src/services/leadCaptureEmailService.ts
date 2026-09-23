/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • REAL ESTATE LEAD CAPTURE & AI 2ND BRAIN TRIAGE SERVICE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Automated Email Dispatch to LO + Agent Pair with Cognitive Domain Breakdown
 * ============================================================================
 */

import { SyncedPropertyListing } from '../types/firstTimeHomebuyerPlugin';

export interface LeadCaptureFormData {
  visitorName: string;
  visitorEmail: string;
  visitorPhone?: string;
  preferredContactMethod: 'email' | 'phone' | 'text';
  timeframe: string; // e.g., "Immediately (0-30 days)", "1-3 Months", "3-6 Months", "Just Browsing"
  preApprovalStatus: 'need_preapproval' | 'prequalified_elsewhere' | 'not_sure' | 'cash_buyer';
  interestedInGrants: boolean;
  tourRequested: boolean;
  preferredTourDate?: string;
  preferredTourTime?: string;
  notesAndQuestions: string;
}

export interface LeadCaptureFormConfig {
  formTitle: string;
  formSubtitle: string;
  requirePhone: boolean;
  enableTourScheduling: boolean;
  enableGrantCheckboxes: boolean;
  loRecipientEmail: string;
  loRecipientName: string;
  loRecipientPhone: string;
  loCompany: string;
  loNmls: string;
  agentRecipientEmail: string;
  agentRecipientName: string;
  agentRecipientPhone: string;
  agentBrokerage: string;
  agentLicense: string;
  isSoloLoMode: boolean;
  autoDispatchEmail: boolean;
}

export interface LoResponsibilityBreakdown {
  category: string;
  identifiedTopics: string[];
  extractedSnippets: string[];
  recommendedResponsePoints: string[];
  draftResponse: string;
}

export interface AgentResponsibilityBreakdown {
  category: string;
  identifiedTopics: string[];
  extractedSnippets: string[];
  recommendedResponsePoints: string[];
  draftResponse: string;
}

export interface AiLeadTriageResult {
  summary: string;
  urgencyLevel: 'high' | 'medium' | 'low';
  firstContactRecommendation: 'Loan Officer' | 'Realtor Agent' | 'Joint / Simultaneous';
  firstContactRationale: string;
  loResponsibilities: LoResponsibilityBreakdown;
  agentResponsibilities: AgentResponsibilityBreakdown;
  jointCoordinationNote: string;
  emailSubject: string;
  emailHtml: string;
  emailText: string;
  analyzedAt: string;
  modelUsed: string;
}

export interface DispatchedLeadRecord {
  id: string;
  timestamp: string;
  lead: LeadCaptureFormData;
  property: {
    id: string;
    address: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    squareFootage: number;
    daysOnMarket: number;
    specialPrograms?: any;
    zillowUrl?: string;
  };
  triage: AiLeadTriageResult;
  recipients: {
    loEmail: string;
    agentEmail?: string;
    isSoloLoMode: boolean;
  };
  deliveryStatus: 'dispatched_simulated' | 'delivered_smtp' | 'client_drafted';
}

const STORAGE_KEY = 'vantage_realestate_dispatched_leads';
const CONFIG_STORAGE_KEY = 'vantage_lead_capture_form_config';

export const DEFAULT_FORM_CONFIG: LeadCaptureFormConfig = {
  formTitle: 'Connect with the Co-Branded Property & Loan Team',
  formSubtitle: 'Submit your questions or request a private tour. Our AI 2nd Brain instantly routes your inquiry to both Mike Ford and Kanndice McLean for a coordinated response.',
  requirePhone: false,
  enableTourScheduling: true,
  enableGrantCheckboxes: true,
  loRecipientEmail: 'fordmj@gmail.com',
  loRecipientName: 'Mike Ford',
  loRecipientPhone: '+1 (503) 555-0192',
  loCompany: 'Vantage AI Mortgage & Loan Services',
  loNmls: '288455',
  agentRecipientEmail: 'kanndice@cascadepremier.com',
  agentRecipientName: 'Kanndice McLean',
  agentRecipientPhone: '+1 (503) 555-0188',
  agentBrokerage: 'Cascade Premier Realty & Associates',
  agentLicense: 'OR-201889423',
  isSoloLoMode: false,
  autoDispatchEmail: true
};

/**
 * Heuristic fallback triage engine used if server-side AI endpoint is unreachable
 */
export function generateLocalCognitiveTriage(
  lead: LeadCaptureFormData,
  property: SyncedPropertyListing,
  config: LeadCaptureFormConfig
): AiLeadTriageResult {
  const text = lead.notesAndQuestions || '';
  const lower = text.toLowerCase();

  // Keyword classifications for LO domain
  const loKeywords = [
    { word: 'grant', label: 'DPA Grants' },
    { word: 'down payment', label: 'Down Payment Assistance' },
    { word: 'dpa', label: 'DPA Program' },
    { word: 'credit', label: 'Credit Score & Qualification' },
    { word: 'pre-approval', label: 'Pre-Approval Process' },
    { word: 'preapproval', label: 'Pre-Approval Process' },
    { word: 'monthly payment', label: 'Monthly Payment Breakdown' },
    { word: 'rate', label: 'Interest Rate & APR' },
    { word: 'interest', label: 'Interest Rate' },
    { word: 'mortgage', label: 'Mortgage Loan Program' },
    { word: 'usda', label: 'USDA 100% Rural Loan' },
    { word: 'fha', label: 'FHA 3.5% Loan' },
    { word: 'lakeview', label: 'Lakeview 100% DPA' },
    { word: 'ohcs', label: 'OHCS Flex Lending' },
    { word: 'chenoa', label: 'Chenoa Fund DPA' },
    { word: 'cra', label: 'CRA Census Tract Grant' },
    { word: 'income', label: 'Income Verification' },
    { word: 'debt', label: 'Debt-to-Income (DTI)' },
    { word: 'dti', label: 'Debt-to-Income (DTI)' },
    { word: 'underwriting', label: 'Loan Underwriting' },
    { word: 'taxes', label: 'Property Tax Escrow' },
    { word: 'insurance', label: 'Homeowners Insurance Escrow' },
    { word: 'w2', label: 'Documentation (W-2s / Tax Returns)' },
    { word: 'closing cost', label: 'Closing Costs Financing' }
  ];

  // Keyword classifications for Agent domain
  const agentKeywords = [
    { word: 'tour', label: 'Property Showing / Tour' },
    { word: 'showing', label: 'Property Showing' },
    { word: 'walk-through', label: 'Physical Walk-Through' },
    { word: 'walkthrough', label: 'Physical Walk-Through' },
    { word: 'see the house', label: 'In-Person Tour' },
    { word: 'meetup', label: 'Client Meetup' },
    { word: 'coffee', label: 'Buyer Consultation / Coffee' },
    { word: 'bed', label: 'Bedrooms & Floorplan' },
    { word: 'bath', label: 'Bathrooms' },
    { word: 'sqft', label: 'Square Footage & Layout' },
    { word: 'square feet', label: 'Square Footage' },
    { word: 'lot', label: 'Lot Size & Yard' },
    { word: 'yard', label: 'Backyard & Condition' },
    { word: 'days on market', label: 'Days on Market Strategy' },
    { word: 'price', label: 'List Price & Valuation' },
    { word: 'price cut', label: 'Price History / Reductions' },
    { word: 'offer', label: 'Offer Strategy & Negotiation' },
    { word: 'seller credit', label: 'Seller Concessions / Credits' },
    { word: 'seller contribution', label: 'Seller Contributions' },
    { word: 'seller concession', label: 'Seller Concessions' },
    { word: 'inspection', label: 'Home Inspection & Contingencies' },
    { word: 'hoa', label: 'HOA Regulations & Fees' },
    { word: 'school', label: 'School District & Neighborhood' }
  ];

  const matchedLoTopics = new Set<string>();
  const loSnippets: string[] = [];
  loKeywords.forEach(k => {
    if (lower.includes(k.word)) {
      matchedLoTopics.add(k.label);
    }
  });

  const matchedAgentTopics = new Set<string>();
  const agentSnippets: string[] = [];
  agentKeywords.forEach(k => {
    if (lower.includes(k.word)) {
      matchedAgentTopics.add(k.label);
    }
  });

  // Extract sentences to appropriate domains
  const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 0);
  sentences.forEach(sentence => {
    const sLower = sentence.toLowerCase();
    const hasLo = loKeywords.some(k => sLower.includes(k.word));
    const hasAgent = agentKeywords.some(k => sLower.includes(k.word));

    if (hasLo) loSnippets.push(sentence.trim());
    if (hasAgent) agentSnippets.push(sentence.trim());
  });

  // Defaults if empty or broad
  if (matchedLoTopics.size === 0) {
    matchedLoTopics.add('Purchase Financing & Monthly Payment');
    matchedLoTopics.add('DPA Grant Eligibility Check');
  }
  if (lead.interestedInGrants) {
    matchedLoTopics.add('Down Payment Assistance ($15,400+ Max Grant)');
  }
  if (lead.preApprovalStatus === 'need_preapproval') {
    matchedLoTopics.add('Pre-Approval Intake & Credit Profile');
  }

  if (matchedAgentTopics.size === 0) {
    matchedAgentTopics.add('Property Listing Details & Neighborhood Info');
    if (lead.tourRequested) {
      matchedAgentTopics.add('In-Person Tour Scheduling');
    }
  }
  if (lead.tourRequested) {
    matchedAgentTopics.add('Private Showing / Walk-Through Request');
  }

  const urgency: 'high' | 'medium' | 'low' =
    lead.tourRequested || lower.includes('asap') || lower.includes('ready to make offer') || lower.includes('this weekend')
      ? 'high'
      : lower.includes('soon') || lead.timeframe.includes('Immediately')
      ? 'medium'
      : 'low';

  const firstContact: 'Loan Officer' | 'Realtor Agent' | 'Joint / Simultaneous' =
    lead.tourRequested
      ? 'Realtor Agent'
      : lead.preApprovalStatus === 'need_preapproval' || matchedLoTopics.size > matchedAgentTopics.size
      ? 'Loan Officer'
      : 'Joint / Simultaneous';

  const firstRationale =
    firstContact === 'Realtor Agent'
      ? `${config.agentRecipientName} should confirm the tour schedule and home access first, while ${config.loRecipientName} prepares the pre-approval payment dossier.`
      : firstContact === 'Loan Officer'
      ? `${config.loRecipientName} should verify the financing and grant options first so the buyer is fully confident in their budget before touring.`
      : `${config.loRecipientName} and ${config.agentRecipientName} should coordinate an immediate dual introduction via email and SMS text thread.`;

  const loResponsePoints = [
    `Provide estimated monthly P&I + escrow payment on ${property.formattedAddress} ($${property.price.toLocaleString()}).`,
    property.specialPrograms?.usdaRuralEligible
      ? 'Confirm USDA 100% Zero-Down financing eligibility for this specific location.'
      : 'Review conventional 3% HomeReady or FHA 3.5% with down payment grant stacking.',
    'Issue a tailored Digital Pre-Approval Letter verified with automated AUS findings.'
  ];

  const agentResponsePoints = [
    lead.tourRequested
      ? `Confirm showing availability for ${lead.preferredTourDate || 'this upcoming weekend'} with the listing office.`
      : `Provide seller disclosure details, days on market history (${property.daysOnMarket} days), and HOA rules.`,
    'Evaluate seller concessions / seller credit room to cover closing costs on the offer.',
    `Highlight comparable sales in ${property.city} to formulate competitive offer strategy.`
  ];

  const loDraft = `Hi ${lead.visitorName},\n\nThis is ${config.loRecipientName} with ${config.loCompany} (NMLS #${config.loNmls}). I saw your inquiry on ${property.formattedAddress}!\n\nI’m running your numbers through our Down Payment Grant Engine. Based on the listing price of $${property.price.toLocaleString()}, you may qualify for $0 down financing and up to $15,400 in regional homebuyer assistance.\n\nAre you free for a quick 5-minute call today to review your pre-approval options and verify your target monthly payment?\n\nBest regards,\n${config.loRecipientName}\n${config.loRecipientPhone}`;

  const agentDraft = `Hi ${lead.visitorName}!\n\nThank you for reaching out regarding ${property.formattedAddress}. I'm ${config.agentRecipientName}, Principal Broker with ${config.agentBrokerage}.\n\n${
    lead.tourRequested
      ? `I'd be thrilled to take you through for a private walk-through. Let's lock in a time that suits you best!`
      : `This home features ${property.bedrooms} beds, ${property.bathrooms} baths, and ${property.squareFootage} sqft. It has been on the market for ${property.daysOnMarket} days.`
  }\n\nMy lending partner ${config.loRecipientName} and I work hand-in-hand so you have both total financial clarity and strong offer negotiation. Looking forward to connecting!\n\nWarmly,\n${config.agentRecipientName}\n${config.agentRecipientPhone}`;

  const summary = `${lead.visitorName} submitted an inquiry for ${property.formattedAddress} (${property.bedrooms}bd/${property.bathrooms}ba • $${property.price.toLocaleString()}) requesting ${
    lead.tourRequested ? 'a private tour and ' : ''
  }financing clarification.`;

  const jointNote = `${config.agentRecipientName} handles showing scheduling, physical inspection criteria, and seller credit negotiations. ${config.loRecipientName} handles loan qualification, DPA grant stacking, and issuing the pre-approval letter.`;

  const emailSubject = `[LEAD TRIAGE ALERT] 📍 ${property.formattedAddress} — ${lead.visitorName} (${urgency.toUpperCase()} Urgency)`;

  const emailText = `
VANTAGE AI STUDIO • CO-BRANDED PROPERTY LEAD & 2ND BRAIN INQUIRY
================================================================

NEW VISITOR SUBMISSION:
-----------------------
Name: ${lead.visitorName}
Email: ${lead.visitorEmail}
Phone: ${lead.visitorPhone || 'Not provided'}
Preferred Contact: ${lead.preferredContactMethod.toUpperCase()}
Timeframe: ${lead.timeframe}
Pre-Approval Status: ${lead.preApprovalStatus}
Tour Requested: ${lead.tourRequested ? `YES (Target Date: ${lead.preferredTourDate || 'Flexible'})` : 'No'}
Grants Interest: ${lead.interestedInGrants ? 'YES ($15,400+ DPA Match)' : 'Standard'}

PROPERTY DETAILS:
-----------------
Address: ${property.formattedAddress}
List Price: $${property.price.toLocaleString()}
Layout: ${property.bedrooms} Beds • ${property.bathrooms} Baths • ${property.squareFootage} SqFt
Days on Market: ${property.daysOnMarket} Days
${property.zillowUrl ? `Zillow Listing: ${property.zillowUrl}` : ''}

VISITOR'S RAW COMMENTS & QUESTIONS:
-----------------------------------
"${lead.notesAndQuestions || '(No additional note submitted)'}"

================================================================
🧠 AI 2ND BRAIN COGNITIVE LEAD TRIAGE & DOMAIN BREAKDOWN
================================================================
Urgency Level: ${urgency.toUpperCase()}
First Contact Recommended: ${firstContact}
Strategy Rationale: ${firstRationale}

🏦 LOAN OFFICER RESPONSIBILITIES (${config.loRecipientName} • NMLS #${config.loNmls}):
- Identified Topics: ${Array.from(matchedLoTopics).join(', ')}
${loSnippets.length > 0 ? `- Visitor Questions for LO:\n  * "${loSnippets.join('"\n  * "')}"` : '- Standard financing & monthly payment review required.'}
- Recommended Action Points:
  1. ${loResponsePoints[0]}
  2. ${loResponsePoints[1]}
  3. ${loResponsePoints[2]}
- LO Draft Reply:
${loDraft}

🏡 REALTOR AGENT RESPONSIBILITIES (${config.agentRecipientName} • Lic #${config.agentLicense}):
- Identified Topics: ${Array.from(matchedAgentTopics).join(', ')}
${agentSnippets.length > 0 ? `- Visitor Questions for Agent:\n  * "${agentSnippets.join('"\n  * "')}"` : '- Property availability and tour scheduling.'}
- Recommended Action Points:
  1. ${agentResponsePoints[0]}
  2. ${agentResponsePoints[1]}
  3. ${agentResponsePoints[2]}
- Agent Draft Reply:
${agentDraft}

🤝 TEAM COORDINATION:
${jointNote}

Dispatched simultaneously to:
LO: ${config.loRecipientEmail}
Agent: ${config.isSoloLoMode ? 'Deactivated (Solo LO Mode)' : config.agentRecipientEmail}
Generated by Vantage AI 2nd Brain Engine
`.trim();

  const emailHtml = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 650px; margin: 0 auto; background-color: #0f172a; color: #f8fafc; border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
  <div style="background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%); padding: 24px; border-bottom: 1px solid #334155;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; background: rgba(56, 189, 248, 0.15); padding: 4px 10px; rounded: 8px;">
        Vantage AI 2nd Brain • Co-Branded Lead Alert
      </span>
      <span style="font-size: 11px; font-weight: 700; color: ${urgency === 'high' ? '#f43f5e' : urgency === 'medium' ? '#fbbf24' : '#10b981'}; background: rgba(0,0,0,0.4); padding: 4px 8px; border-radius: 6px;">
        ${urgency.toUpperCase()} URGENCY
      </span>
    </div>
    <h1 style="font-size: 20px; font-weight: 800; color: #ffffff; margin: 12px 0 4px 0;">
      📍 ${property.formattedAddress}
    </h1>
    <p style="font-size: 13px; color: #94a3b8; margin: 0;">
      $${property.price.toLocaleString()} • ${property.bedrooms} Beds • ${property.bathrooms} Baths • ${property.squareFootage} SqFt • ${property.daysOnMarket} DOM
    </p>
  </div>

  <div style="padding: 24px; space-y: 20px;">
    <!-- Lead Overview Box -->
    <div style="background-color: #1e293b; padding: 18px; border-radius: 12px; border: 1px solid #475569; margin-bottom: 20px;">
      <h3 style="font-size: 13px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin: 0 0 10px 0;">
        👤 Visitor Contact Information
      </h3>
      <table style="width: 100%; font-size: 13px; color: #e2e8f0; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #94a3b8; width: 35%;">Name:</td><td style="font-weight: 700; color: #ffffff;">${lead.visitorName}</td></tr>
        <tr><td style="padding: 4px 0; color: #94a3b8;">Email:</td><td style="font-weight: 600; color: #38bdf8;"><a href="mailto:${lead.visitorEmail}" style="color: #38bdf8; text-decoration: none;">${lead.visitorEmail}</a></td></tr>
        <tr><td style="padding: 4px 0; color: #94a3b8;">Phone:</td><td style="font-weight: 600;"><a href="tel:${lead.visitorPhone || ''}" style="color: #4ade80; text-decoration: none;">${lead.visitorPhone || 'Not provided'}</a></td></tr>
        <tr><td style="padding: 4px 0; color: #94a3b8;">Preferred Contact:</td><td style="font-weight: 600; text-transform: uppercase;">${lead.preferredContactMethod}</td></tr>
        <tr><td style="padding: 4px 0; color: #94a3b8;">Tour Requested:</td><td style="font-weight: 700; color: ${lead.tourRequested ? '#4ade80' : '#94a3b8'};">${lead.tourRequested ? `YES (Preferred Date: ${lead.preferredTourDate || 'Flexible'})` : 'No'}</td></tr>
        <tr><td style="padding: 4px 0; color: #94a3b8;">Pre-Approval:</td><td style="font-weight: 600;">${lead.preApprovalStatus}</td></tr>
      </table>
    </div>

    <!-- Visitor Comment Box -->
    <div style="background-color: #020617; padding: 18px; border-radius: 12px; border-left: 4px solid #a855f7; margin-bottom: 20px;">
      <div style="font-size: 11px; font-weight: 700; color: #c084fc; text-transform: uppercase; margin-bottom: 6px;">
        💬 Visitor Comments & Inquired Questions:
      </div>
      <p style="font-size: 14px; line-height: 1.5; color: #f1f5f9; margin: 0; font-style: italic;">
        "${lead.notesAndQuestions || '(No comments provided)'}"
      </p>
    </div>

    <!-- AI 2nd Brain Triage Section -->
    <div style="background: linear-gradient(135deg, rgba(30, 27, 75, 0.6) 0%, rgba(15, 23, 42, 0.8) 100%); padding: 20px; border-radius: 14px; border: 1px solid #6366f1; margin-bottom: 20px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <span style="font-size: 12px; font-weight: 800; color: #818cf8; text-transform: uppercase; letter-spacing: 0.5px;">
          🧠 AI 2nd Brain Task Allocation & Triage
        </span>
        <span style="font-size: 11px; color: #cbd5e1; background: rgba(99, 102, 241, 0.2); padding: 3px 8px; border-radius: 6px;">
          First Contact: <strong>${firstContact}</strong>
        </span>
      </div>
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 16px 0;">
        ${firstRationale}
      </p>

      <!-- LO Action Box -->
      <div style="background-color: rgba(15, 23, 42, 0.9); padding: 14px; border-radius: 10px; border-left: 4px solid #38bdf8; margin-bottom: 14px;">
        <h4 style="font-size: 13px; font-weight: 800; color: #38bdf8; margin: 0 0 6px 0;">
          🏦 Loan Officer Action Items (${config.loRecipientName} • NMLS #${config.loNmls})
        </h4>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
          Topics: <strong>${Array.from(matchedLoTopics).join(' • ')}</strong>
        </div>
        <ul style="font-size: 12px; color: #cbd5e1; margin: 0 0 10px 0; padding-left: 18px; line-height: 1.4;">
          <li>${loResponsePoints[0]}</li>
          <li>${loResponsePoints[1]}</li>
          <li>${loResponsePoints[2]}</li>
        </ul>
        <div style="background-color: #0f172a; padding: 10px; border-radius: 8px; font-size: 11px; color: #94a3b8; border: 1px solid #334155;">
          <strong style="color: #38bdf8;">Draft Response:</strong><br/>
          ${loDraft.replace(/\n/g, '<br/>')}
        </div>
      </div>

      <!-- Agent Action Box -->
      <div style="background-color: rgba(15, 23, 42, 0.9); padding: 14px; border-radius: 10px; border-left: 4px solid #ec4899;">
        <h4 style="font-size: 13px; font-weight: 800; color: #ec4899; margin: 0 0 6px 0;">
          🏡 Realtor Agent Action Items (${config.agentRecipientName} • Lic #${config.agentLicense})
        </h4>
        <div style="font-size: 11px; color: #64748b; margin-bottom: 6px;">
          Topics: <strong>${Array.from(matchedAgentTopics).join(' • ')}</strong>
        </div>
        <ul style="font-size: 12px; color: #cbd5e1; margin: 0 0 10px 0; padding-left: 18px; line-height: 1.4;">
          <li>${agentResponsePoints[0]}</li>
          <li>${agentResponsePoints[1]}</li>
          <li>${agentResponsePoints[2]}</li>
        </ul>
        <div style="background-color: #0f172a; padding: 10px; border-radius: 8px; font-size: 11px; color: #94a3b8; border: 1px solid #334155;">
          <strong style="color: #ec4899;">Draft Response:</strong><br/>
          ${agentDraft.replace(/\n/g, '<br/>')}
        </div>
      </div>
    </div>

    <!-- Quick Action Links -->
    <div style="text-align: center; padding-top: 10px; border-top: 1px solid #334155;">
      <a href="mailto:${lead.visitorEmail}?subject=${encodeURIComponent(`Follow-up regarding ${property.formattedAddress}`)}" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 12px; padding: 10px 18px; border-radius: 8px; margin: 4px;">
        ✉️ Reply to ${lead.visitorName}
      </a>
      <a href="tel:${lead.visitorPhone || ''}" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 12px; padding: 10px 18px; border-radius: 8px; margin: 4px;">
        📞 Call Lead (${lead.visitorPhone || 'No Phone'})
      </a>
    </div>
  </div>

  <div style="background-color: #020617; padding: 14px 24px; text-align: center; font-size: 10px; color: #64748b; border-top: 1px solid #1e293b;">
    Dispatched via Vantage AI 2nd Brain Engine for Mike Ford (fordmj@gmail.com) & Kanndice McLean (kanndice@cascadepremier.com).
  </div>
</div>
  `.trim();

  return {
    summary,
    urgencyLevel: urgency,
    firstContactRecommendation: firstContact,
    firstContactRationale: firstRationale,
    loResponsibilities: {
      category: 'Loan Officer (Financing & Underwriting)',
      identifiedTopics: Array.from(matchedLoTopics),
      extractedSnippets: loSnippets,
      recommendedResponsePoints: loResponsePoints,
      draftResponse: loDraft
    },
    agentResponsibilities: {
      category: 'Realtor Agent (Property & Showing)',
      identifiedTopics: Array.from(matchedAgentTopics),
      extractedSnippets: agentSnippets,
      recommendedResponsePoints: agentResponsePoints,
      draftResponse: agentDraft
    },
    jointCoordinationNote: jointNote,
    emailSubject,
    emailHtml,
    emailText,
    analyzedAt: new Date().toISOString(),
    modelUsed: 'heuristic-cognitive-fallback'
  };
}

export class LeadCaptureEmailService {
  /**
   * Submit lead inquiry, analyze via AI 2nd brain, send simulated/live email, and persist lead
   */
  public static async submitAndTriageLead(
    lead: LeadCaptureFormData,
    property: SyncedPropertyListing,
    config: LeadCaptureFormConfig = DEFAULT_FORM_CONFIG
  ): Promise<DispatchedLeadRecord> {
    let triageResult: AiLeadTriageResult;

    try {
      const response = await fetch('/api/realestate/lead-capture-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead,
          property: {
            id: property.id,
            formattedAddress: property.formattedAddress,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            squareFootage: property.squareFootage,
            daysOnMarket: property.daysOnMarket,
            zillowUrl: property.zillowUrl,
            specialPrograms: property.specialPrograms
          },
          config
        })
      });

      if (response.ok) {
        const data = await response.json();
        triageResult = data.triage;
      } else {
        console.warn('Server API error on lead-capture-email, generating local cognitive triage fallback');
        triageResult = generateLocalCognitiveTriage(lead, property, config);
      }
    } catch (err) {
      console.warn('Network error reaching lead-capture-email API, generating local cognitive triage fallback:', err);
      triageResult = generateLocalCognitiveTriage(lead, property, config);
    }

    const record: DispatchedLeadRecord = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      lead,
      property: {
        id: property.id,
        address: property.formattedAddress,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFootage: property.squareFootage,
        daysOnMarket: property.daysOnMarket,
        specialPrograms: property.specialPrograms,
        zillowUrl: property.zillowUrl
      },
      triage: triageResult,
      recipients: {
        loEmail: config.loRecipientEmail,
        agentEmail: config.isSoloLoMode ? undefined : config.agentRecipientEmail,
        isSoloLoMode: config.isSoloLoMode
      },
      deliveryStatus: 'dispatched_simulated'
    };

    // Save to local storage cache
    LeadCaptureEmailService.saveLeadRecord(record);

    return record;
  }

  /**
   * Save a dispatched lead record to localStorage
   */
  public static saveLeadRecord(record: DispatchedLeadRecord): void {
    try {
      const existing = LeadCaptureEmailService.getSavedLeads();
      const updated = [record, ...existing.filter(l => l.id !== record.id)].slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to cache dispatched lead in localStorage:', e);
    }
  }

  /**
   * Retrieve all saved dispatched leads
   */
  public static getSavedLeads(): DispatchedLeadRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  /**
   * Load stored form customization config
   */
  public static loadConfig(): LeadCaptureFormConfig {
    try {
      const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
      if (!raw) return DEFAULT_FORM_CONFIG;
      return { ...DEFAULT_FORM_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_FORM_CONFIG;
    }
  }

  /**
   * Save customized form configuration
   */
  public static saveConfig(config: LeadCaptureFormConfig): void {
    try {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    } catch (e) {
      console.error('Failed to save lead capture form config:', e);
    }
  }

  /**
   * Open native Gmail web compose draft with pre-filled LO+Agent notification
   */
  public static openGmailWebDraft(
    toEmail: string,
    subject: string,
    body: string,
    ccEmail?: string
  ): void {
    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: toEmail,
      su: subject,
      body
    });
    if (ccEmail) {
      params.set('cc', ccEmail);
    }
    const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  }

  /**
   * Open mailto URL with pre-filled content
   */
  public static openMailtoDraft(
    toEmail: string,
    subject: string,
    body: string,
    ccEmail?: string
  ): void {
    const params: string[] = [];
    if (ccEmail) params.push(`cc=${encodeURIComponent(ccEmail)}`);
    params.push(`subject=${encodeURIComponent(subject)}`);
    params.push(`body=${encodeURIComponent(body)}`);

    const mailtoUrl = `mailto:${encodeURIComponent(toEmail)}?${params.join('&')}`;
    window.location.href = mailtoUrl;
  }
}
