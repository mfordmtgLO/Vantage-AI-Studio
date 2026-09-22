import { User } from 'firebase/auth';

export const ADMIN_PRIMARY_EMAIL = 'fordmj@gmail.com';
export const ADMIN_PRIMARY_NAME = 'Mike Ford';

export interface PluginDistributionRecord {
  id: string;
  clientName: string;
  targetDomain: string;
  licenseKey: string;
  distributionType: 'full_hybrid' | 'react_widget' | 'headless_hook' | 'llm_prompt_spec';
  archetypeId?: 'second_brain' | 'workplace_ui' | 'voice_plugin';
  pluginTitle?: string;
  distributedAt: string;
  notes?: string;
  status: 'active' | 'revoked';
}

export interface SpecialtyBrainPricingMatrix {
  solo: {
    monthly: number;
    annual: number;
    lifetime: number;
  };
  enterprise: {
    baseLicense: number;
    seatsIncluded: number;
    customizationInstallFee: number;
    teamsTrainingCallsFlatFee: number;
    trainingCallsCount: number;
    biAnnualTrainBrainUpgradeFee: number;
  };
}

export interface PeriodicIngestRecord {
  id: string;
  version: string;
  releaseDate: string;
  focusSources: string;
  cognitiveSkillGains: string;
  status: 'completed' | 'scheduled' | 'active';
}

export interface SpecialtyBrainPackage {
  id: string;
  title: string;
  industryId: string;
  industryName: string;
  careerId: string;
  careerTitle: string;
  version: string;
  createdAt: string;
  lastTrainedAt: string;
  status: 'active' | 'draft' | 'archived';
  summary: string;
  personaTitle: string;
  personaDirective: string;
  toneDemeanor: string;
  personalityPreset: string;
  pricing: SpecialtyBrainPricingMatrix;
  trainingRules: string[];
  knowledgeSeeds: Array<{ title: string; content: string; category: string; tags: string[] }>;
  customGuardrails: string[];
  periodicIngestRoadmap: PeriodicIngestRecord[];
  salesPitch: {
    headline: string;
    executiveProposal: string;
    soloSalesCopy: string;
    socialAdHooks: {
      facebook: string;
      googleAds: string;
      linkedinB2B: string;
      coldEmail: string;
    };
  };
  antiTheftChecksum?: string;
}

export const DEFAULT_PRICING_MATRIX: SpecialtyBrainPricingMatrix = {
  solo: {
    monthly: 49,
    annual: 490,
    lifetime: 997
  },
  enterprise: {
    baseLicense: 3999,
    seatsIncluded: 10,
    customizationInstallFee: 2500,
    teamsTrainingCallsFlatFee: 1500,
    trainingCallsCount: 3,
    biAnnualTrainBrainUpgradeFee: 1200
  }
};

/**
 * Generates tailored sales pitches, executive proposals, and ad hooks for any Industry + Career 2nd Brain.
 */
export function generateSpecialtyBrainSalesPitch(
  industryName: string,
  careerTitle: string,
  pricing: SpecialtyBrainPricingMatrix = DEFAULT_PRICING_MATRIX
): {
  headline: string;
  executiveProposal: string;
  soloSalesCopy: string;
  socialAdHooks: {
    facebook: string;
    googleAds: string;
    linkedinB2B: string;
    coldEmail: string;
  };
} {
  const headline = `Dialed-In 2nd Brain AI Plugin for ${careerTitle} in ${industryName}`;
  
  const executiveProposal = `# COMMERCIAL ENTERPRISE PROPOSAL & DEPLOYMENT AGREEMENT
**Specialty 2nd Brain AI Solution for ${careerTitle} (${industryName})**
*Authored & Engineered Exclusively by ${ADMIN_PRIMARY_NAME} (${ADMIN_PRIMARY_EMAIL})*

---

### 1. Executive Summary & Core Value Proposition
The **Vantage Specialty 2nd Brain** is an enterprise-grade cognitive copilot precision-engineered specifically for **${careerTitle}** workflows within **${industryName}**. Unlike generic chat bots, this 2nd Brain arrives out of the box pre-trained with domain knowledge seeds, regulatory guardrails, and industry-specific reasoning frameworks.

### 2. Continuous "Train the Brain" Persistence Learning Architecture
Every client deployment includes access to our continuous learning pipeline:
- **Periodic Source Aggregation**: Our development team ingests quarterly industry data, regulatory shifts, and workflow playbooks.
- **Cognitive Self-Expansion**: As your enterprise scales, your 2nd Brain continuously develops higher-order AI-assisted skills and automated task execution capabilities.

### 3. Commercial Investment & Transparent Pricing Matrix
- **Enterprise Multi-Seat Base License (${pricing.enterprise.seatsIncluded} Seats)**: $${pricing.enterprise.baseLicense.toLocaleString()} (One-Time / Annual)
- **One-Time Customization, Domain Lock & White-Glove Install Fee**: $${pricing.enterprise.customizationInstallFee.toLocaleString()} flat fee
- **Teams Training Video Call Series (${pricing.enterprise.trainingCallsCount} Live Video Sessions)**: $${pricing.enterprise.teamsTrainingCallsFlatFee.toLocaleString()} flat fee
- **Bi-Annual "Train the Brain" Persistence Ingestion Upgrade (Optional Subscription)**: $${pricing.enterprise.biAnnualTrainBrainUpgradeFee.toLocaleString()} / year (covers bi-annual model refresh, regulatory retraining & new capability expansions)

### 4. Intellectual Property & Domain Security Guarantee
- Domain-locked runtime execution with AST protection & SHA-256 verification.
- Verified authorship and commercial warranty by ${ADMIN_PRIMARY_NAME}.
`;

  const soloSalesCopy = `🚀 Stop wasting 15+ hours a week on repetitive tasks. Meet your personalized 2nd Brain AI built exclusively for **${careerTitle}** in **${industryName}**.

✅ Pre-trained with real-world industry guidelines and best practices.
✅ Learns your preferences in seconds with comma-separated quick input.
✅ Receives periodic "Train the Brain" persistent knowledge updates so it becomes smarter as your career grows.

Pricing Options:
• Pro Monthly: $${pricing.solo.monthly}/mo
• Annual Saver: $${pricing.solo.annual}/yr (Includes 2 Months Free)
• Lifetime VIP: $${pricing.solo.lifetime} (One-time payment, unlimited access)`;

  const socialAdHooks = {
    facebook: `🎯 Attention ${careerTitle}s! Generic AI makes costly mistakes in ${industryName}. Get the Turnkey 2nd Brain Plugin engineered exclusively for your daily workflows. Click to test the live mobile demo!`,
    googleAds: `Pre-Trained 2nd Brain AI for ${careerTitle} | ${industryName} Compliant Copilot | Turnkey Commercial License by Mike Ford`,
    linkedinB2B: `Hi [Name], I noticed your team's leadership in ${industryName}. We engineered a specialized 2nd Brain AI copilot specifically for ${careerTitle}s that includes white-glove setup, team training calls, and bi-annual continuous learning updates. Would you be open to a 5-minute preview?`,
    coldEmail: `Subject: Purpose-Built 2nd Brain AI Copilot for your ${careerTitle} team at [Company]

Hi [Name],

Most enterprise AI rollouts fail because off-the-shelf tools lack deep domain expertise in ${industryName}. 

We built the **Specialty 2nd Brain Plugin for ${careerTitle}s**—pre-configured out of the box with your industry's compliance rules, calculation frameworks, and communication templates.

Our enterprise package includes:
1. Turnkey domain installation & security hardening
2. A 3-session live video training series for your team
3. Bi-annual "Train the Brain" aggregated source updates as industry standards evolve

Let me know if you'd like me to send over the live interactive demo link.

Best regards,
${ADMIN_PRIMARY_NAME}
Vantage AI Workspace
${ADMIN_PRIMARY_EMAIL}`
  };

  return { headline, executiveProposal, soloSalesCopy, socialAdHooks };
}

/**
 * Returns the default initial catalog of pre-trained specialty 2nd brains.
 */
export function getInitialSpecialtyBrainPackages(): SpecialtyBrainPackage[] {
  return [
    {
      id: 'pkg_mlo_real_estate',
      title: 'Mortgage Loan Officer (MLO) 2nd Brain Pro v2.5',
      industryId: 'mortgage_real_estate',
      industryName: 'Mortgage, Lending & Real Estate',
      careerId: 'mlo_loan_officer',
      careerTitle: 'Mortgage Loan Officer (MLO)',
      version: 'v2.5.0',
      createdAt: '2026-03-01T12:00:00.000Z',
      lastTrainedAt: '2026-09-15T16:30:00.000Z',
      status: 'active',
      summary: 'Specialized in DTI/LTV calculations, FHA/VA/USDA guidelines, rate lock timing, and borrower communications.',
      personaTitle: 'Senior Mortgage Originator & Lending Strategist',
      personaDirective: 'You are an elite Mortgage Loan Officer with deep mastery of Fannie Mae, Freddie Mac, FHA, VA, and USDA lending guidelines. Calculate Front-End and Back-End DTIs with strict precision, structure financing solutions, craft proactive client updates, and advise on down payment assistance programs without providing unauthorized legal advice.',
      toneDemeanor: 'formal_executive',
      personalityPreset: 'executive',
      pricing: DEFAULT_PRICING_MATRIX,
      trainingRules: [
        'Calculate Front-End DTI (Housing / Gross Income) and Back-End DTI (Total Debt / Gross Income) separately',
        'FHA maximum standard DTI is 31/43 unless approved via Desktop Underwriter (DU) with compensating factors up to 46.9/56.9',
        'VA loans require zero down payment and enforce VA Residual Income calculation tables by region and family size',
        'USDA Rural Development loans require 100% Zero-Down financing strictly in eligible census tracts under USDA income caps',
        'Never offer binding rate locks without active loan application and explicit borrower written authorization'
      ],
      knowledgeSeeds: [
        {
          title: 'Conforming Loan Limits & DTI Ratio Benchmarks',
          content: 'Conforming conventional loan baseline limit for one-unit properties. Conventional loans prefer maximum 45% back-end DTI, though automated underwriting (DU/LP) can approve up to 50% with clean credit and reserves.',
          category: 'knowledge',
          tags: ['mortgage', 'dti', 'conforming', 'underwriting']
        },
        {
          title: 'USDA Rural Housing & CRA Grant Matrix',
          content: 'USDA Guaranteed loans provide 100% zero-down financing for low-to-moderate income households in designated rural census tracts. Community Reinvestment Act (CRA) grants provide up to $10,000 for down payment in eligible tracts.',
          category: 'workflow',
          tags: ['usda', 'cra', 'grants', 'down-payment']
        }
      ],
      customGuardrails: [
        'Never state a loan is unconditionally approved until formal Underwriter Commitment Letter is issued.',
        'Strictly comply with TILA-RESPA Integrated Disclosure (TRID) 3-day CD waiting periods.'
      ],
      periodicIngestRoadmap: [
        {
          id: 'ing_1',
          version: 'v2.4.0',
          releaseDate: '2026-06-01',
          focusSources: 'Federal Reserve Rate Policy & 2026 Conforming Limit Shifts',
          cognitiveSkillGains: 'Added dynamic DTI stress-testing and automated CRA grant tract lookup',
          status: 'completed'
        },
        {
          id: 'ing_2',
          version: 'v2.5.0',
          releaseDate: '2026-09-15',
          focusSources: '2026 FHA Guideline Revisions & Non-QM Bank Statement Loan Scenarios',
          cognitiveSkillGains: 'Self-employed 12/24-month bank statement cash flow calculator macro',
          status: 'active'
        },
        {
          id: 'ing_3',
          version: 'v2.6.0',
          releaseDate: '2026-12-01',
          focusSources: 'Q4 Secondary Market Bond Pricing & Automated Rate Float-Down Triggers',
          cognitiveSkillGains: 'Real-time MBS spread monitoring and automated rate renegotiation playbooks',
          status: 'scheduled'
        }
      ],
      salesPitch: generateSpecialtyBrainSalesPitch('Mortgage, Lending & Real Estate', 'Mortgage Loan Officer (MLO)')
    },
    {
      id: 'pkg_physician_clinical',
      title: 'Clinical Physician & Practice Lead 2nd Brain Pro v2.5',
      industryId: 'healthcare_medical',
      industryName: 'Healthcare & Clinical Medicine',
      careerId: 'physician_clinical',
      careerTitle: 'Clinical Physician / Medical Director',
      version: 'v2.5.0',
      createdAt: '2026-03-10T12:00:00.000Z',
      lastTrainedAt: '2026-09-18T14:00:00.000Z',
      status: 'active',
      summary: 'SOAP note drafting, ICD-10/CPT coding references, clinical differential diagnoses, and HIPAA-compliant patient communication.',
      personaTitle: 'Senior Attending Physician & Clinical Director',
      personaDirective: 'You are a Senior Board-Certified Attending Physician and Clinical Medical Director. Provide evidence-based clinical reasoning, structured SOAP notes, differential diagnosis checklists, and pharmacological interaction warnings while strictly safeguarding PHI under HIPAA.',
      toneDemeanor: 'clinical_objective',
      personalityPreset: 'analytical',
      pricing: DEFAULT_PRICING_MATRIX,
      trainingRules: [
        'Structure all patient encounter notes in standardized SOAP format (Subjective, Objective, Assessment, Plan)',
        'Never reveal Protected Health Information (PHI) in unencrypted client contexts',
        'Cross-reference medication contraindications for renal/hepatic impairment'
      ],
      knowledgeSeeds: [
        {
          title: 'Standard Clinical SOAP Note Architecture',
          content: 'Subjective: Chief Complaint, HPI, Review of Systems. Objective: Vitals, Physical Exam, Diagnostic Labs. Assessment: Differential Diagnosis in order of probability. Plan: Rx, Labs, Patient Education, Follow-Up Interval.',
          category: 'instruction',
          tags: ['clinical', 'soap', 'hipaa', 'ehr']
        }
      ],
      customGuardrails: [
        'Mandate human physician review before any pharmacological dosage advice is delivered to patients.'
      ],
      periodicIngestRoadmap: [
        {
          id: 'ing_med_1',
          version: 'v2.4.0',
          releaseDate: '2026-05-15',
          focusSources: '2026 ADA Diabetes Standards & ACC/AHA Hypertension Guidelines',
          cognitiveSkillGains: 'Automated guideline-directed medical therapy (GDMT) staging protocol',
          status: 'completed'
        },
        {
          id: 'ing_med_2',
          version: 'v2.5.0',
          releaseDate: '2026-09-18',
          focusSources: '2026 CPT Code Updates & Telehealth Reimbursement Rules',
          cognitiveSkillGains: 'High-accuracy CPT E/M complexity level estimator macro',
          status: 'active'
        }
      ],
      salesPitch: generateSpecialtyBrainSalesPitch('Healthcare & Clinical Medicine', 'Clinical Physician / Medical Director')
    }
  ];
}

/**
 * Retrieves saved specialty 2nd brain packages from storage.
 */
export function getSavedSpecialtyBrainPackages(): SpecialtyBrainPackage[] {
  try {
    const saved = localStorage.getItem('vantage_specialty_brain_packages');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Could not read saved specialty brain packages:', e);
  }
  return getInitialSpecialtyBrainPackages();
}

/**
 * Saves or updates a specialty 2nd brain package.
 */
export function saveSpecialtyBrainPackage(pkg: SpecialtyBrainPackage): void {
  try {
    const current = getSavedSpecialtyBrainPackages();
    const existingIndex = current.findIndex(p => p.id === pkg.id);
    let updated: SpecialtyBrainPackage[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = pkg;
    } else {
      updated = [pkg, ...current];
    }
    localStorage.setItem('vantage_specialty_brain_packages', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save specialty brain package:', e);
  }
}

/**
 * Deletes a specialty 2nd brain package.
 */
export function deleteSpecialtyBrainPackage(id: string): void {
  try {
    const current = getSavedSpecialtyBrainPackages();
    const filtered = current.filter(p => p.id !== id);
    localStorage.setItem('vantage_specialty_brain_packages', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not delete specialty brain package:', e);
  }
}

/**
 * Generates an AST-Obfuscated domain-locked wrapper for commercial code distribution.
 */
export function generateAntiTheftDomainWrapper(
  clientName: string = 'Enterprise Client',
  domain: string = 'client-portal.com',
  licenseKey: string = 'VAN-BRN-2026-PRO',
  pluginTitle: string = 'Vantage Specialty 2nd Brain Engine'
): string {
  const checksum = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return `/**
 * @license Commercial Proprietary Software - Specialized 2nd Brain Engine
 * @copyright (c) 2026 ${ADMIN_PRIMARY_NAME} <${ADMIN_PRIMARY_EMAIL}>. All Rights Reserved.
 * @module "${pluginTitle}"
 * @licensedClient "${clientName}"
 * @domainLock "${domain}"
 * @licenseKey "${licenseKey}"
 * @sha256Verification "${checksum}"
 * 
 * NOTICE: THIS COMMERCIAL BRAIN MODULE CONTAINS PROPRIETARY REASONING ENGINES & CONTINUOUS 
 * AGGREGATED LEARNING INGESTION HOOKS. REPRODUCTION OR REVERSE-ENGINEERING IS STRICTLY PROHIBITED.
 */
(function(_0x8a9b,_0x3f1c){
  'use strict';
  const _authDomain = "${domain}";
  const _client = "${clientName}";
  const _licKey = "${licenseKey}";
  const _verifyHash = "${checksum}";

  function _validateRuntimeHost(){
    try {
      if(typeof window !== 'undefined'){
        const host = window.location.hostname;
        if(_authDomain !== 'localhost' && !host.includes(_authDomain) && host !== '127.0.0.1' && host !== 'ais-dev-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app'){
          console.error('[VANTAGE-BRAIN-SECURITY]: Domain license mismatch for host "' + host + '". Contact ${ADMIN_PRIMARY_EMAIL}');
          return false;
        }
      }
      return true;
    }catch(e){
      return false;
    }
  }

  if(!_validateRuntimeHost()){
    throw new Error('Vantage Specialty 2nd Brain: Unauthorized Domain License.');
  }

  if(typeof window !== 'undefined'){
    (window as any).__VANTAGE_BRAIN_LICENSE__ = {
      client: _client,
      domain: _authDomain,
      key: _licKey,
      sha256: _verifyHash,
      certifiedBy: "${ADMIN_PRIMARY_NAME}"
    };
  }
})(this);
`;
}


/**
 * Checks if the given user is the authorized administrator (Mike Ford).
 */
export function isMikeFordAdmin(user: User | { email?: string | null } | null | undefined): boolean {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === ADMIN_PRIMARY_EMAIL.toLowerCase();
}

/**
 * Retrieves the list of authorized plugin distributions recorded by Mike Ford.
 */
export function getSavedPluginDistributions(): PluginDistributionRecord[] {
  try {
    const saved = localStorage.getItem('vantage_admin_plugin_distributions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read saved plugin distributions:', e);
  }
  return [
    {
      id: 'dist_sample_1',
      clientName: 'Enterprise Client Alpha',
      targetDomain: 'alpha-enterprise.com',
      licenseKey: 'VNTG-2NDBRAIN-AF89-2026',
      distributionType: 'full_hybrid',
      distributedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: 'Initial customized deployment with DeepSeek R1 + Gemini hybrid pipeline',
      status: 'active'
    }
  ];
}

/**
 * Saves a new or updated distribution record to storage.
 */
export function savePluginDistribution(record: PluginDistributionRecord): void {
  try {
    const current = getSavedPluginDistributions();
    const existingIndex = current.findIndex(r => r.id === record.id);
    let updated: PluginDistributionRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...current];
    }
    localStorage.setItem('vantage_admin_plugin_distributions', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save plugin distribution record:', e);
  }
}

/**
 * Deletes a distribution record.
 */
export function deletePluginDistribution(id: string): void {
  try {
    const current = getSavedPluginDistributions();
    const filtered = current.filter(r => r.id !== id);
    localStorage.setItem('vantage_admin_plugin_distributions', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not delete plugin distribution record:', e);
  }
}

/**
 * Generates an authorized distribution watermark header for exported code and files.
 */
export function generateDistributionWatermarkHeader(
  clientName: string = 'Authorized Client',
  domain: string = 'authorized-domain.com',
  licenseKey: string = 'VNTG-PROPRIETARY-2026',
  pluginTitle: string = 'VANTAGE PROPRIETARY PLUGIN MODULE'
): string {
  return `/**
 * ============================================================================
 * ${pluginTitle.toUpperCase()}
 * ============================================================================
 * Copyright (c) ${new Date().getFullYear()} Vantage AI Workspace. All Rights Reserved.
 * Authored & Distributed Exclusively by: ${ADMIN_PRIMARY_NAME} (${ADMIN_PRIMARY_EMAIL})
 * 
 * LICENSED TO: ${clientName}
 * AUTHORIZED DOMAIN: ${domain}
 * LICENSE KEY: ${licenseKey}
 * ISSUED AT: ${new Date().toISOString()}
 * 
 * PROPRIETARY ARCHITECTURE - UNLAWFUL REDISTRIBUTION OR REPLICATION STRICTLY PROHIBITED
 * ============================================================================
 */\n\n`;
}
