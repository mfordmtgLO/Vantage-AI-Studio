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
  | 'Portfolio CRA Grant';

export type DpaAssistanceType = 
  | 'Forgivable Grant'
  | '0% Interest Silent 2nd'
  | 'Deferred Repayable 2nd'
  | 'Closing Cost Subsidy'
  | 'Matched Savings Grant';

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
}

export interface BuyerEligibilityCheckInput {
  grossAnnualIncome: number;
  creditScore: number;
  areaMedianIncomeUsd: number;
  propertyState: string;
  propertyPrice: number;
  liquidDownPayment: number;
  isTargetedCensusTract: boolean;
}

export interface BuyerEligibilityProductResult {
  product: MortgageLoanProduct;
  isEligible: boolean;
  disqualificationReasons: string[];
  maxEstimatedGrantUsd: number;
  effectiveRequiredDownPaymentUsd: number;
}
