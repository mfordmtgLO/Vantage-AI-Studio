/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • DEFAULT MORTGAGE LOAN PRODUCTS DATASET
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Preset Programs featuring Lakeview National and OHCS Flex Lending
 * ============================================================================
 */

import {
  evaluateOregonOhcsFlexFirstHomeEligibility,
  getOregon2026ConformingLoanLimit,
  OREGON_2026_CONFORMING_LOAN_LIMITS,
  resolveOregonCountyFannieMaeAmi
} from '../services/geomapMortgageEngine';
import { MortgageLoanProduct, BuyerEligibilityCheckInput, BuyerEligibilityProductResult } from '../types/mortgageLoanProducts';

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
    minCreditScore: 660,
    maxAmiPercentage: 140,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    interestRateAdjustmentBps: 0,
    maxConformingLoanLimit2026: 832750,
    description: 'National 100% LTV financing pairing a Lakeview 1st mortgage with a 3.5% or 5.0% soft second DPA loan. All 36 counties and census tracts in Oregon are 100% eligible up to 2026 Fannie Mae 1-Unit conforming limit ($832,750). Strictly 1-unit primary residence stick-built SFR, PUD, or Condominium (no manufactured homes or multi-units). All borrowers combined annualized income must be 140% or less of Fannie Mae Area Median Income (AMI) per county.',
    underwritingGuidelines: [
      'Allows 96.5% FHA 1st + 3.5% or 5.0% Soft Second lien (or 97% Conventional + DPA)',
      'Statewide Oregon Eligibility: All 36 counties, cities, and census tracts in Oregon are 100% eligible',
      'Combined Annual Income Limit: All borrowers combined annualized income must be 140% or less of Fannie Mae Area Median Income (AMI) for the county where the subject property is located',
      'Fannie Mae Regulatory Update Cycle: AMI schedules updated annually by 12/1; Maximum Loan Amount schedules updated annually by 7/1',
      'Eligible Property Types: Strictly 1-Unit Primary Residence only — stick-built Single Family Residence (SFR), Planned Unit Development (PUD), or Condominium',
      'Ineligible Property Types: Manufactured homes, mobile homes, and multi-unit properties (2-4 units) are NOT permitted',
      'Maximum Loan Amount: Follows 2026 Fannie Mae Oregon 1-Unit Conforming Loan Limit ($832,750)',
      'No designated high-cost loan areas in Oregon for 2026 per Fannie Mae and FHFA guidelines (All 36 counties share baseline limits)',
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
    maxDpaCapUsd: 29250,
    dpaType: 'Forgivable Grant',
    minCreditScore: 620,
    maxAmiPercentage: 115,
    eligibleStates: ['OR'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    interestRateAdjustmentBps: -12.5,
    description: 'Oregon HFA flagship FirstHome program providing 4.0% to 5.0% cash assistance on the 1st mortgage for down payment and closing costs via eHousingPlus.',
    underwritingGuidelines: [
      'Available statewide across Oregon with county purchase price limits ($520k–$715k)',
      'Provides 4.0% standard DPA or 5.0% DPA for LMI/Targeted Census Tracts or ≤80% AMI',
      'Minimum credit score: 620 FICO (FHA/VA) or 640 (Conventional)',
      '1st-time homebuyer requirement is WAIVED in OHCS Targeted Census Tracts or for Qualified Veterans',
      'Must be primary residence 1-unit property, PUD, qualified condo, or manufactured home'
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
    minCreditScore: 660,
    maxAmiPercentage: 80,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    maxConformingLoanLimit2026: 832750,
    description: 'Conventional 97% 1st mortgage with a 3% or 4% Lakeview Community Smart grant. Statewide Oregon eligibility across all 36 counties up to 2026 Fannie Mae 1-Unit conforming limit ($832,750). Strictly 1-unit primary residence stick-built SFR, PUD, or Condominium (no manufactured homes or multi-units).',
    underwritingGuidelines: [
      'Conventional 97% LTV + 3% or 4% Grant',
      'Statewide Oregon Eligibility: All 36 counties and census tracts eligible',
      'Eligible Property Types: Strictly 1-Unit Primary Residence only — stick-built Single Family Residence (SFR), Planned Unit Development (PUD), or Condominium',
      'Ineligible Property Types: Manufactured homes, mobile homes, and multi-unit properties (2-4 units) are NOT permitted',
      '2026 Fannie Mae Oregon 1-Unit Conforming Loan Limit ($832,750) strictly applies (All 36 counties share baseline limits)',
      'No high-cost designated loan areas in Oregon for 2026 per FHFA',
      'Forgivable after 3 years of on-time primary residence occupancy',
      'Reduced PMI coverage requirements',
      'Min credit score: 660 FICO'
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
    minCreditScore: 680,
    maxAmiPercentage: 115,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: false,
    isEligibleActive: true,
    description: '100% zero down payment federal mortgage program for designated rural and suburban geographic areas with low annual guarantee fees.',
    underwritingGuidelines: [
      'Property must fall inside USDA RD geographic eligibility map',
      'Household income must not exceed 115% of Area Median Income',
      'Minimum credit score: 680 FICO (Standard GUS determination)',
      '1.0% upfront guarantee fee + 0.35% annual fee'
    ],
    requiredDocumentation: [
      'USDA GUS Underwriting Determination',
      'Household Income Verification (all adult occupants)'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'rate_buydown_stack_strategy',
    name: 'Seller-Funded 2-1 Rate Buydown Stack (Zero-Down / Low-Down)',
    agencyOrSponsor: 'Conventional / FHA / USDA Approved Buydown Suite',
    category: '2-1 Buydown & Stacked Benefit',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 3.0,
    maxDpaCapUsd: 18000,
    dpaType: 'Closing Cost Subsidy',
    minCreditScore: 620,
    maxAmiPercentage: 160,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'Stackable seller concession or lender credit financing a 2% lower rate in year 1 and 1% lower in year 2, stackable on USDA 100% Zero Down or conventional/FHA down payment programs.',
    underwritingGuidelines: [
      'Allows stacking benefits like USDA RD 100% zero down payment + 2-1 temporary rate buydown',
      'Stackable with Lakeview National DPA, OHCS FirstHome, or HomeReady 3%',
      'Requires seller-paid concessions or seller credits per agency guidelines (3% to 6% allowable limits)'
    ],
    requiredDocumentation: [
      'Seller Concession Addendum to Purchase Contract',
      'Buydown Agreement & Escrow Subsidy Schedule'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'nhf_fha_zero_down_dpa',
    name: 'National Homebuyers Fund (NHF) FHA DPA (Up to 5%)',
    agencyOrSponsor: 'National Homebuyers Fund (NHF)',
    category: 'National DPA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 5.0,
    maxDpaCapUsd: 35000,
    dpaType: 'Forgivable Grant',
    minCreditScore: 620,
    maxAmiPercentage: 140,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'National Homebuyers Fund (NHF) Down Payment Assistance up to 5% of loan amount for FHA 1st mortgages. Non-repayable grant or soft second with NO first-time homebuyer requirement.',
    underwritingGuidelines: [
      'Official URL: https://www.nhfloan.org/programs.html',
      'Provides up to 5% non-repayable gift / grant or 0% interest soft second',
      'NO first-time homebuyer requirement (open to repeat buyers)',
      'Min credit score 620 FICO (640 for specific loan tiers)',
      'Flexible DTI ratios up to 50%; generous income limits up to 140% AMI',
      'Eligible on 1-4 unit SFR, PUD, Townhome, and approved Condominiums'
    ],
    requiredDocumentation: [
      'NHF DPA Reservation Confirmation',
      'FHA Total Scorecard Approve/Eligible Certificate',
      'Borrower Income Verification'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'nhf_conventional_dpa',
    name: 'National Homebuyers Fund (NHF) Conventional DPA (Up to 5%)',
    agencyOrSponsor: 'National Homebuyers Fund (NHF)',
    category: 'National DPA',
    maxLtvPercent: 97,
    maxDpaAssistancePercent: 5.0,
    maxDpaCapUsd: 35000,
    dpaType: 'Forgivable Grant',
    minCreditScore: 620,
    maxAmiPercentage: 140,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'NHF Down Payment & Closing Cost Assistance up to 5% paired with Fannie Mae / Freddie Mac Conventional 1st mortgages with no first-time homebuyer restriction.',
    underwritingGuidelines: [
      'Official URL: https://www.nhfloan.org/programs.html',
      'Up to 5% of loan amount for down payment and/or closing costs',
      'Paired with Conventional 97% LTV (covers full 3% down payment + closing costs)',
      'No First-Time Homebuyer requirement',
      'Min credit score 620 FICO; DU / LPA Approve/Eligible'
    ],
    requiredDocumentation: [
      'NHF Conventional DPA Commitment Certificate',
      'Fannie Mae DU / Freddie Mac LPA Automated Approval'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'nhf_va_closing_cost_dpa',
    name: 'National Homebuyers Fund (NHF) VA DPA & Closing Cost Subsidy',
    agencyOrSponsor: 'National Homebuyers Fund (NHF)',
    category: 'National DPA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 5.0,
    maxDpaCapUsd: 30000,
    dpaType: 'Closing Cost Subsidy',
    minCreditScore: 620,
    maxAmiPercentage: 140,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: false,
    isEligibleActive: true,
    description: 'NHF assistance up to 5% for eligible military service members and Veterans utilizing VA 100% financing to offset closing costs, prepaids, and VA funding fees.',
    underwritingGuidelines: [
      'Official URL: https://www.nhfloan.org/programs.html',
      'Up to 5% assistance toward closing costs, prepaid escrows, and funding fees',
      'Paired with 100% VA financing for $0 total out-of-pocket home purchase',
      'No first-time homebuyer restriction'
    ],
    requiredDocumentation: [
      'Certificate of Eligibility (COE)',
      'NHF VA Assistance Reservation'
    ],
    isFeaturedSpecialtyProduct: false
  },
  {
    id: 'nhf_usda_rd_dpa',
    name: 'National Homebuyers Fund (NHF) USDA RD DPA (Up to 5%)',
    agencyOrSponsor: 'National Homebuyers Fund (NHF)',
    category: 'National DPA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 5.0,
    maxDpaCapUsd: 30000,
    dpaType: 'Closing Cost Subsidy',
    minCreditScore: 620,
    maxAmiPercentage: 115,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: false,
    isEligibleActive: true,
    description: 'NHF assistance up to 5% combined with USDA Rural Development Guaranteed 100% loans to cover closing costs, escrow setup, and upfront guarantee fees.',
    underwritingGuidelines: [
      'Official URL: https://www.nhfloan.org/programs.html',
      'Up to 5% assistance for rural homebuyers',
      'Covers 1.0% upfront guarantee fee and initial escrow reserves',
      'Property must meet USDA rural area eligibility'
    ],
    requiredDocumentation: [
      'USDA GUS Determination',
      'NHF USDA DPA Reservation'
    ],
    isFeaturedSpecialtyProduct: false
  },
  {
    id: 'nhf_gsfa_platinum_dpa',
    name: 'NHF / GSFA Platinum® DPA Program (Up to 7%)',
    agencyOrSponsor: 'Golden State Finance Authority / NHF',
    category: 'National DPA',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 7.0,
    maxDpaCapUsd: 45000,
    dpaType: 'Forgivable Grant',
    minCreditScore: 640,
    maxAmiPercentage: 140,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'GSFA Platinum Program managed by NHF providing up to 7% down payment and closing cost assistance for FHA, VA, USDA, and Conventional loans.',
    underwritingGuidelines: [
      'Official URL: https://www.nhfloan.org/programs.html',
      'Up to 7% total assistance (gift/grant or amortizing 2nd)',
      'No first-time homebuyer requirement',
      'Can be used for purchase or rate-and-term refinance'
    ],
    requiredDocumentation: [
      'GSFA Platinum Reservation Certificate',
      'Agency AUS Approval'
    ],
    isFeaturedSpecialtyProduct: true
  },
  {
    id: 'nhf_mcc_tax_credit',
    name: 'NHF Mortgage Credit Certificate (MCC) 20% Tax Credit',
    agencyOrSponsor: 'National Homebuyers Fund (NHF)',
    category: 'Tax Credit / MCC',
    maxLtvPercent: 100,
    maxDpaAssistancePercent: 0,
    dpaType: 'Closing Cost Subsidy',
    minCreditScore: 620,
    maxAmiPercentage: 115,
    eligibleStates: ['ALL'],
    isTargetedAreaBonusEligible: true,
    isEligibleActive: true,
    description: 'Federal income tax credit providing up to 20% of annual mortgage interest paid directly as a dollar-for-dollar tax credit.',
    underwritingGuidelines: [
      'Official URL: https://www.nhfloan.org/programs.html',
      'Dollar-for-dollar federal income tax reduction up to $2,000/year',
      'Can be combined with 1st mortgage and DPA programs',
      'Qualifying income calculation factor reduces buyer qualifying DTI'
    ],
    requiredDocumentation: [
      'NHF MCC Application & Tax Returns (3 years)',
      'Lender MCC Underwriting Certification'
    ],
    isFeaturedSpecialtyProduct: false
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
  },
  {
    id: 'ohcs_flex_nextstep',
    name: 'OHCS Flex Lending NextStep',
    agencyOrSponsor: 'Oregon Housing & Community Services (OHCS)',
    category: 'State HFA',
    maxLtvPercent: 97,
    maxDpaAssistancePercent: 3.0,
    maxDpaCapUsd: 18000,
    dpaType: 'Deferred Repayable 2nd',
    minCreditScore: 620,
    maxAmiPercentage: 0,
    eligibleStates: ['OR'],
    isTargetedAreaBonusEligible: false,
    isEligibleActive: true,
    description: 'Oregon HFA program for non-first-time homebuyers or repeat buyers with qualifying income up to $125,000, offering 3.0% down payment assistance.',
    underwritingGuidelines: [
      'No first-time homebuyer requirement (open to repeat buyers)',
      'Qualifying annual income cap of $125,000 statewide',
      'Provides 3.0% cash assistance as a silent second mortgage',
      'Primary residence in Oregon required'
    ],
    requiredDocumentation: [
      'OHCS NextStep Application Worksheet',
      'eHousingPlus Registration Confirmation'
    ],
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
  isTargetedTract: boolean,
  extraInput?: Partial<BuyerEligibilityCheckInput>
): BuyerEligibilityProductResult {
  if (product.id.startsWith('ohcs_flex_lending_firsthome')) {
    const ohcsEval = evaluateOregonOhcsFlexFirstHomeEligibility({
      state,
      price,
      grossAnnualIncome: income,
      householdSize: extraInput?.householdSize || 1,
      creditScore,
      isFirstTimeHomebuyer: extraInput?.isFirstTimeHomebuyer ?? true,
      isVeteranBorrower: extraInput?.isVeteranBorrower ?? false,
      ownsOtherRealEstate: extraInput?.ownsOtherRealEstate ?? false,
      dtiPercent: extraInput?.dtiPercent ?? 38.0
    });

    const isEligible = product.isEligibleActive && ohcsEval.isEligible;
    const disqualificationReasons = [...ohcsEval.disqualificationReasons];
    if (!product.isEligibleActive) disqualificationReasons.push('Program disabled in configuration manager');

    return {
      product,
      isEligible,
      disqualificationReasons,
      maxEstimatedGrantUsd: ohcsEval.grantAmountUsd,
      effectiveRequiredDownPaymentUsd: Math.max(0, Math.round(price * 0.035) - ohcsEval.grantAmountUsd),
      ehousingPlusCode: ohcsEval.ehousingPlusCode,
      firstHomeWaiverApplied: ohcsEval.firstTimeHomebuyerWaiverGranted,
      countyPriceLimitUsd: ohcsEval.purchasePriceLimitUsd,
      countyIncomeLimitUsd: ohcsEval.householdIncomeLimitUsd,
      grantPercentApplied: ohcsEval.grantPercent,
      isForgivableDpa: ohcsEval.isLmiTargetedArea || (amiUsd > 0 && income <= amiUsd * 0.8)
    };
  }

  const reasons: string[] = [];
  if (!product.isEligibleActive) {
    reasons.push('Program disabled in configuration manager');
  }

  if (creditScore < product.minCreditScore) {
    reasons.push(`Credit score (${creditScore}) is below minimum requirement (${product.minCreditScore})`);
  }

  if (product.maxAmiPercentage > 0 && amiUsd > 0 && !product.id.includes('lakeview')) {
    const amiCap = (amiUsd * product.maxAmiPercentage) / 100;
    if (income > amiCap && !(isTargetedTract && product.isTargetedAreaBonusEligible)) {
      reasons.push(`Annual income ($${income.toLocaleString()}) exceeds ${product.maxAmiPercentage}% AMI limit ($${Math.round(amiCap).toLocaleString()})`);
    }
  }

  if (!product.eligibleStates.includes('ALL') && !product.eligibleStates.includes(state.toUpperCase())) {
    reasons.push(`Program only available in ${product.eligibleStates.join(', ')} (property state is ${state})`);
  }

  // Lakeview National Property & Borrower Guideline Rules:
  // - Must be strictly 1-Unit property only ($832,750 conforming limit). Multi-units (2-4 units) not permitted.
  // - Must be Primary Residence owner-occupied (no second homes or investment properties).
  // - Must be stick-built SFR, PUD, or Condominium (no manufactured homes).
  // - Max loan limit follows 2026 Fannie Mae Oregon 1-Unit Conforming Loan Limit ($832,750). All 36 OR counties share this baseline limit with no high-cost exceptions.
  // - All borrowers combined annualized income must be 140% or less of Fannie Mae Area Median Income (AMI) per county.
  const unitCount = extraInput?.propertyUnitCount || 1;
  const conformingLimit = product.id.includes('lakeview') ? 832750 : getOregon2026ConformingLoanLimit(unitCount);
  let isWithinConforming = true;

  if (product.id.includes('lakeview')) {
    // 1. 140% County AMI validation
    const countyAmiData = resolveOregonCountyFannieMaeAmi(state);
    const resolvedBaseAmi = amiUsd > 0 ? amiUsd : countyAmiData.baseAmiUsd;
    const max140Cap = Math.round(resolvedBaseAmi * 1.40);
    if (income > max140Cap && !isTargetedTract) {
      reasons.push(
        `All borrowers combined annualized income ($${income.toLocaleString()}) exceeds 140% Fannie Mae Area Median Income (AMI) limit ($${max140Cap.toLocaleString()}) for ${countyAmiData.countyName} County. (Fannie Mae updates AMI schedules annually by 12/1 and max loan limits annually by 7/1).`
      );
    }

    // 2. Unit Count validation
    if (unitCount > 1) {
      reasons.push(
        `Lakeview National strictly requires a 1-Unit property ($832,750 limit). Multi-unit properties (${unitCount}-Unit) are not permitted.`
      );
    }

    // 3. Primary Residence validation
    const occupancy = extraInput?.occupancyType || (extraInput?.isPrimaryResidence === false ? 'Investment' : 'Primary');
    if (occupancy && occupancy.toLowerCase() !== 'primary') {
      reasons.push(
        `Lakeview National requires a Primary Residence. Occupancy type "${occupancy}" is not eligible.`
      );
    } else if (extraInput?.isPrimaryResidence === false) {
      reasons.push(
        'Lakeview National requires 1-Unit Primary Residence owner-occupancy.'
      );
    }

    // 4. Property Type validation (Stick-built SFR, PUD, or Condominium ONLY)
    const propType = (extraInput?.propertyType || '').toLowerCase();
    const isManufactured = propType.includes('manufactured') || propType.includes('mobile') || extraInput?.isStickBuilt === false;
    const isMultiUnit = propType.includes('multi') || propType.includes('duplex') || propType.includes('triplex') || propType.includes('fourplex');

    if (isManufactured) {
      reasons.push(
        'Lakeview National requires a stick-built SFR, PUD, or Condominium. Manufactured and mobile homes are not permitted.'
      );
    } else if (isMultiUnit) {
      reasons.push(
        'Lakeview National does not allow multi-family or multi-unit properties.'
      );
    }

    // 5. 2026 Fannie Mae 1-Unit Conforming Loan Limit check ($832,750)
    const estimatedFirstMortgage = Math.round(price * 0.965);
    isWithinConforming = estimatedFirstMortgage <= 832750 && price <= 832750 * 1.035;

    if (!isWithinConforming) {
      reasons.push(
        `Property price ($${price.toLocaleString()}) exceeds Fannie Mae 2026 Oregon 1-Unit Conforming Loan Limit ($832,750). All 36 OR counties share this baseline limit with no high-cost exceptions.`
      );
    }
  } else {
    // Other conventional programs
    const estimatedFirstMortgage = Math.round(price * 0.965);
    isWithinConforming = estimatedFirstMortgage <= conformingLimit && price <= conformingLimit * 1.035;
    if (!isWithinConforming && product.category === 'Conventional Specialty') {
      reasons.push(
        `Property price ($${price.toLocaleString()}) exceeds Fannie Mae 2026 Oregon Conforming Loan Limit ($${conformingLimit.toLocaleString()}) for ${unitCount}-Unit property.`
      );
    }
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
    effectiveRequiredDownPaymentUsd: Math.round(effectiveRequiredDownPaymentUsd),
    conformingLoanLimitUsd: conformingLimit,
    isWithinConformingLimit: isWithinConforming
  };
}
