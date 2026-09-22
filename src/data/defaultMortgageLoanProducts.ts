/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • DEFAULT MORTGAGE LOAN PRODUCTS DATASET
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Preset Programs featuring Lakeview National and OHCS Flex Lending
 * ============================================================================
 */

import { MortgageLoanProduct } from '../types/mortgageLoanProducts';

export const DEFAULT_MORTGAGE_LOAN_PRODUCTS: MortgageLoanProduct[] = [
  {
    id: 'lakeview_national_bayview',
    name: 'Lakeview National Bayview 100% DPA',
    agencyOrSponsor: 'Lakeview Loan Servicing / Bayview',
    category: 'National DPA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 5.0,
    maxDpaCapUsd: 25000,
    dpaType: '0% Interest Silent 2nd',
    minCreditScore: 620,
    maxAmiPercentage: 120,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    interestRateAdjustmentBps: 0,
    description: 'National 100% LTV financing pairing a Lakeview 1st mortgage with a 3.5% or 5.0% soft second DPA loan. No first-time homebuyer requirement in non-targeted tracts.',
    underwritingGuidelines: [
      'Allows 96.5% FHA 1st + 3.5% or 5.0% Soft Second lien',
      'No repayment required until refinance, sale, or payoff if 0% silent 2nd',
      'Non-occupying co-signers permitted up to 96.5% LTV',
      'Min credit score 620 for 3.5% DPA; 640 for 5.0% DPA'
    ],
    requiredDocumentation: [
      'Full 2-year W2/tax return history or 1099 profit & loss',
      'Lakeview DPA Borrower Disclosure Form',
      'Homebuyer Education Completion Certificate'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'ohcs_flex_lending_firsthome',
    name: 'OHCS Flex Lending FirstHome (Oregon HFA)',
    agencyOrSponsor: 'Oregon Housing & Community Services (OHCS)',
    category: 'State HFA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 5.0,
    maxDpaCapUsd: 18000,
    dpaType: 'Forgivable Grant',
    minCreditScore: 640,
    maxAmiPercentage: 100,
    eligibleStates: ['OR'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    interestRateAdjustmentBps: -12.5,
    description: 'Oregon HFA flagship FirstHome program providing 3.5% to 5.0% cash assistance for down payment and closing costs, paired with competitive fixed-rate 1st mortgages.',
    underwritingGuidelines: [
      'Available statewide across Oregon with increased income limits in targeted counties',
      'Provides 3.5% to 5.0% cash assistance grant',
      'Requires 1st-time homebuyer status unless buying in a targeted census tract',
      'Must be primary residence 1-unit property or qualified condo'
    ],
    requiredDocumentation: [
      'OHCS Income Verification Worksheet',
      'Oregon eHousingPlus Reservation Confirmation',
      'Pre-purchase Homebuyer Counseling Certificate'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'ohcs_flex_rateadvantage',
    name: 'OHCS Flex Lending RateAdvantage',
    agencyOrSponsor: 'Oregon Housing & Community Services (OHCS)',
    category: 'State HFA',
    maxLtvPercent: 97,
    maxDpaAssistancePercent: 0,
    dpaType: 'Closing Cost Subsidy',
    minCreditScore: 640,
    maxAmiPercentage: 80,
    eligibleStates: ['OR'],
    isTargetedAreaBonusEligible: false,
    isEligibleActive: true,
    interestRateAdjustmentBps: -50,
    description: 'Oregon HFA rate-discount program trading DPA cash grants for a significantly lower fixed interest rate (up to 50 bps below market) to minimize monthly PITI payments.',
    underwritingGuidelines: [
      'Ideal for buyers with existing down payment funds who seek lowest monthly payment',
      'Up to 50 bps interest rate reduction below standard HFA rates',
      'Max 80% Area Median Income (AMI)',
      'Compatible with HomeReady / Home Possible conventional 97% LTV'
    ],
    requiredDocumentation: [
      'OHCS RateAdvantage Commitment Letter',
      'Standard FNMA/FHLMC Underwriting Approval'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'lakeview_community_smart_conv',
    name: 'Lakeview Community Smart Conventional DPA',
    agencyOrSponsor: 'Lakeview Loan Servicing',
    category: 'National DPA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 4.0,
    maxDpaCapUsd: 15000,
    dpaType: 'Forgivable Grant',
    minCreditScore: 640,
    maxAmiPercentage: 80,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'Conventional 97% 1st mortgage with a 3% or 4% Lakeview Community Smart grant. Eliminates FHA MIP while financing 100% of purchase price.',
    underwritingGuidelines: [
      'Conventional 97% LTV + 3% or 4% Grant',
      'Forgivable after 3 years of on-time primary residence occupancy',
      'Reduced PMI coverage requirements'
    ],
    requiredDocumentation: [
      'Lakeview Smart DPA Grant Agreement',
      'Automated Underwriting System (DU/LPA) Approve/Eligible'
    ],
    isFeaturedSpecialtyProduct: false
  },
  {
    id: 'usda_rural_100_guaranteed',
    name: 'USDA 100% Rural Development Guaranteed',
    agencyOrSponsor: 'USDA Rural Development',
    category: 'Government 0-Down',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 0,
    dpaType: '0% Interest Silent 2nd',
    minCreditScore: 640,
    maxAmiPercentage: 115,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: false,
    isEligibleActive: true,
    description: '100% zero down payment federal mortgage program for designated rural and suburban geographic areas with low annual guarantee fees.',
    underwritingGuidelines: [
      'Property must fall inside USDA RD geographic eligibility map',
      'Household income must not exceed 115% of Area Median Income',
      '1.0% upfront guarantee fee + 0.35% annual fee'
    ],
    requiredDocumentation: [
      'USDA GUS Underwriting Determination',
      'Household Income Verification (all adult occupants)'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'lmi_cra_community_grant',
    name: 'CRA LMI $10,000 Non-Repayable Bank Grant',
    agencyOrSponsor: 'Portfolio CRA Partner Banks',
    category: 'Portfolio CRA Grant',
    maxLtvPercent: 97,
    maxDpaAssistancePercent: 3.0,
    maxDpaCapUsd: 10000,
    dpaType: 'Forgivable Grant',
    minCreditScore: 620,
    maxAmiPercentage: 80,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'Direct lender CRA non-repayable grant up to $10,000 for purchasing homes located in Low-to-Moderate Income (LMI) or majority-minority census tracts.',
    underwritingGuidelines: [
      'No repayment required ever (true grant)',
      'Must be located in qualified LMI census tract OR borrower income <= 80% AMI',
      'Can be stacked with Lakeview or OHCS programs where permitted'
    ],
    requiredDocumentation: [
      'FFIEC Census Tract Geocoding Verification',
      'Lender CRA Grant Attestation'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'nhf_fha_zero_down_dpa',
    name: 'National Homebuyer Fund (NHF) FHA 0% Down DPA',
    agencyOrSponsor: 'National Homebuyer Fund (NHF)',
    category: 'National DPA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 5.0,
    maxDpaCapUsd: 30000,
    dpaType: 'Forgivable Grant',
    minCreditScore: 620,
    maxAmiPercentage: 115,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'Nationwide fallback 0% down payment assistance grant or soft second loan providing up to 5% of purchase price for FHA 1st mortgages.',
    underwritingGuidelines: [
      'Universal nationwide fallback DPA available across all 50 states',
      'Provides up to 5% non-repayable gift or 0% interest soft second',
      'Min credit score 620 FICO (640 for non-warrantable condos)',
      'No first-time homebuyer requirement; flexible debt-to-income caps up to 50%'
    ],
    requiredDocumentation: [
      'NHF DPA Reservation Confirmation',
      'FHA Total Scorecard Approve/Eligible Certificate',
      'Borrower Income Verification'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'fnma_homeready_3pct',
    name: 'Fannie Mae HomeReady 3% Down',
    agencyOrSponsor: 'Fannie Mae',
    category: 'Conventional Specialty',
    maxLtvPercent: 97,
    maxDpaAssistancePercent: 0,
    dpaType: 'Closing Cost Subsidy',
    minCreditScore: 620,
    maxAmiPercentage: 80,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'Low down payment conventional loan with discounted mortgage insurance premiums and flexible income inclusion rules.',
    underwritingGuidelines: [
      'Income limit <= 80% AMI (unlimited AMI in low-income census tracts)',
      'Allows boarder income and non-occupant co-borrower income to qualify',
      'Reduced PMI coverage requirement (25% vs standard 35%)',
      'Requires Fannie Mae Framework homebuyer education course'
    ],
    requiredDocumentation: [
      'Framework or Fannie Mae Homebuyer Education Certificate',
      'Desktop Underwriter (DU) Approve/Eligible'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'fhlmc_homepossible_3pct',
    name: 'Freddie Mac Home Possible 3% Down',
    agencyOrSponsor: 'Freddie Mac',
    category: 'Conventional Specialty',
    maxLtvPercent: 97,
    maxDpaAssistancePercent: 0,
    dpaType: 'Closing Cost Subsidy',
    minCreditScore: 620,
    maxAmiPercentage: 80,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: false,
    isEligibleActive: true,
    description: 'Freddie Mac conventional 97% LTV loan designed for low-to-moderate income borrowers with flexible down payment source rules.',
    underwritingGuidelines: [
      'Income limit <= 80% AMI',
      'Allows 100% gift funds for down payment and closing costs',
      'Sweat equity permitted for eligible property improvements'
    ],
    requiredDocumentation: ['CreditSmart or approved Homebuyer Education Certificate'],
    isFeaturedSpecialtyProduct: false
  }
];

export function checkBuyerProductEligibility(
  product: MortgageLoanProduct,
  income: number,
  creditScore: number,
  amiUsd: number,
  state: string,
  price: number,
  downPayment: number,
  isTargetedTract: boolean
) {
  const reasons: string[] = [];
  if (!product.isEligibleActive) {
    reasons.push('Program disabled in configuration manager');
  }

  if (creditScore < product.minCreditScore) {
    reasons.push(`Credit score (${creditScore}) is below minimum requirement (${product.minCreditScore})`);
  }

  if (product.maxAmiPercentage > 0 && amiUsd > 0) {
    const amiCap = (amiUsd * product.maxAmiPercentage) / 100;
    if (income > amiCap && !(isTargetedTract && product.isTargetedAreaBonusEligible)) {
      reasons.push(`Annual income ($${income.toLocaleString()}) exceeds ${product.maxAmiPercentage}% AMI limit ($${Math.round(amiCap).toLocaleString()})`);
    }
  }

  if (!product.eligibleStates.includes('ALL') && !product.eligibleStates.includes(state.toUpperCase())) {
    reasons.push(`Program only available in ${product.eligibleStates.join(', ')} (property state is ${state})`);
  }

  const isEligible = reasons.length === 0;
  const dpaPercent = product.maxDpaAssistancePercent || 0;
  let estimatedGrantUsd = (price * dpaPercent) / 100;
  if (product.maxDpaCapUsd && estimatedGrantUsd > product.maxDpaCapUsd) {
    estimatedGrantUsd = product.maxDpaCapUsd;
  }

  const minRequiredDown = price * (1 - product.maxLtvPercent / 100);
  const effectiveRequiredDownPaymentUsd = Math.max(0, minRequiredDown - estimatedGrantUsd);

  return {
    product,
    isEligible,
    disqualificationReasons: reasons,
    maxEstimatedGrantUsd: Math.round(estimatedGrantUsd),
    effectiveRequiredDownPaymentUsd: Math.round(effectiveRequiredDownPaymentUsd)
  };
}
