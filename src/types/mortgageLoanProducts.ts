/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • MORTGAGE LOAN PRODUCT MANAGEMENT TYPES
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Commercial Module: Mortgage Loan Product Tracking & Eligibility Engine
 * ============================================================================
 */

export type MortgageProductCategory = 
  | 'National DPA'
  | 'State HFA'
  | 'Government 0-Down'
  | 'Conventional Specialty'
  | '2-1 Buydown & Stacked Benefit'
  | 'Tax Credit / MCC';

export type DpaAssistanceType = 
  | 'Forgivable Grant'
  | '0% Interest Silent 2nd'
  | 'Deferred Repayable 2nd'
  | 'Closing Cost Subsidy'
  | 'Matched Savings Grant';

/**
 * 2026 Fannie Mae & FHFA Oregon Conforming Loan Limits
 * All 36 counties in Oregon share the exact same baseline conforming loan limits for 2026.
 * There are no designated high-cost loan areas in Oregon for 2026.
 */
export const OREGON_2026_CONFORMING_LOAN_LIMITS = {
  year: 2026,
  state: 'OR',
  hasHighCostAreas: false,
  oneUnit: 832750,
  twoUnit: 1066250,
  threeUnit: 1288800,
  fourUnit: 1601750,
  notes: 'All 36 counties in Oregon share the exact same baseline conforming loan limits for 2026 per Fannie Mae and FHFA guidelines (No designated high-cost loan areas in OR).'
} as const;

export interface MortgageLoanProduct {
  id: string;
  name: string;
  agencyOrSponsor: string;
  category: MortgageProductCategory;
  maxLtvPercent: number; // e.g. 100 for 0-down
  maxDpaAssistancePercent: number; // e.g. 3.5, 4.0, 5.0
  maxDpaCapUsd?: number; // e.g. 10000
  dpaType: DpaAssistanceType;
  minCreditScore: number;
  maxAmiPercentage: number; // e.g. 80, 100, 120, 0 = unlimited
  eligibleStates: string[]; // ['OR', 'WA', 'CA'] or ['ALL']
  isTargetedAreaBonusEligible: boolean;
  isEligibleActive: boolean; // Configuration toggle
  interestRateAdjustmentBps?: number; // -25 bps, 0, etc
  description: string;
  underwritingGuidelines: string[];
  requiredDocumentation: string[];
  isFeaturedSpecialtyProduct?: boolean;
  maxConformingLoanLimit2026?: number;
}

export interface BuyerEligibilityCheckInput {
  grossAnnualIncome: number;
  creditScore: number;
  areaMedianIncomeUsd: number;
  propertyState: string;
  propertyPrice: number;
  liquidDownPayment: number;
  isTargetedCensusTract: boolean;
  householdSize?: number; // 1 to 8+ persons (OHCS 1-2 vs 3+ income tiering)
  isFirstTimeHomebuyer?: boolean; // Default true (3-year prior ownership rule)
  isVeteranBorrower?: boolean; // Default false (Waives FTHB rule in OHCS)
  ownsOtherRealEstate?: boolean; // Default false (Prohibited in OHCS Flex Lending)
  countyFipsOrName?: string; // e.g. '41051' or 'Multnomah'
  dtiPercent?: number; // e.g. 43.5%
  propertyUnitCount?: 1 | 2 | 3 | 4; // Default 1-Unit
  propertyType?: 'Single Family' | 'Townhouse' | 'Condo' | 'SFR' | 'PUD' | 'Manufactured' | 'Multi-Family' | 'MultiUnit' | string;
  occupancyType?: 'Primary' | 'Secondary' | 'Investment' | string;
  isStickBuilt?: boolean;
  isPrimaryResidence?: boolean;
}

export interface BuyerEligibilityProductResult {
  product: MortgageLoanProduct;
  isEligible: boolean;
  disqualificationReasons: string[];
  maxEstimatedGrantUsd: number;
  effectiveRequiredDownPaymentUsd: number;
  ehousingPlusCode?: string;
  firstHomeWaiverApplied?: boolean;
  countyPriceLimitUsd?: number;
  countyIncomeLimitUsd?: number;
  grantPercentApplied?: number;
  isForgivableDpa?: boolean;
  conformingLoanLimitUsd?: number;
  isWithinConformingLimit?: boolean;
}
