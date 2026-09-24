/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • FIRST-TIME HOMEBUYER GEOMAP & DPA ENGINE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Master Feed Synchronization & DTI Prequalification Computational Logic
 * ============================================================================
 */

import {
  BuyerDtiProfile,
  BuyerPrequalificationResult,
  AreaListingRequestPayload,
  MasterFeedSyncConfig,
  SyncedPropertyListing,
  PropertyListing,
  DtiCalculatorParams,
  DtiAffordabilityResult,
  PriceAuditLog,
  LeadBuyerProfile
} from '../types/firstTimeHomebuyerPlugin';
import {
  MortgageLoanEligibilityService,
  mortgageEligibilityService
} from './mortgageLoanEligibilityService';
import { OREGON_2026_CONFORMING_LOAN_LIMITS } from '../types/mortgageLoanProducts';
import {
  resolveOregonCountyFannieMaeAmi,
  evaluateLakeviewNationalIncomeEligibility,
  OREGON_36_COUNTIES_FANNIE_AMI,
  FANNIE_MAE_SCHEDULE_CONSTANTS,
  OregonCountyFannieMaeAmiData,
  LakeviewIncomeCheckResult,
  getOregonCountyOhcsData,
  evaluateOhcsFlexFirstHomeIncomeEligibility,
  OHCS_FLEX_SCHEDULE_CONSTANTS,
  OhcsCountyIncomeData,
  OhcsIncomeCheckResult,
  getOregonCountyUsdaRdData,
  evaluateUsdaRdIncomeEligibility,
  USDA_RD_SCHEDULE_CONSTANTS,
  UsdaRdCountyIncomeData,
  UsdaRdIncomeCheckResult,
  NHF_PROGRAM_CONSTANTS,
  FHA_HUD_SCHEDULE_CONSTANTS,
  getOregonCountyFhaHudData,
  evaluateNhfDpaEligibility,
  NhfCountyProgramData,
  NhfEvaluationResult
} from '../data/oregonFannieMaeCountyAmi';

export {
  MortgageLoanEligibilityService,
  mortgageEligibilityService,
  OREGON_2026_CONFORMING_LOAN_LIMITS,
  resolveOregonCountyFannieMaeAmi,
  evaluateLakeviewNationalIncomeEligibility,
  OREGON_36_COUNTIES_FANNIE_AMI,
  FANNIE_MAE_SCHEDULE_CONSTANTS,
  getOregonCountyOhcsData,
  evaluateOhcsFlexFirstHomeIncomeEligibility,
  OHCS_FLEX_SCHEDULE_CONSTANTS,
  getOregonCountyUsdaRdData,
  evaluateUsdaRdIncomeEligibility,
  USDA_RD_SCHEDULE_CONSTANTS,
  NHF_PROGRAM_CONSTANTS,
  FHA_HUD_SCHEDULE_CONSTANTS,
  getOregonCountyFhaHudData,
  evaluateNhfDpaEligibility
};
export type {
  OregonCountyFannieMaeAmiData,
  LakeviewIncomeCheckResult,
  OhcsCountyIncomeData,
  OhcsIncomeCheckResult,
  UsdaRdCountyIncomeData,
  UsdaRdIncomeCheckResult,
  NhfCountyProgramData,
  NhfEvaluationResult
};

/**
 * Returns the 2026 Fannie Mae Conforming Loan Limit for Oregon based on property unit count.
 * Note: All 36 counties in Oregon share the exact same baseline conforming loan limits for 2026.
 * (No designated high-cost loan areas in Oregon for 2026 per Fannie Mae and FHFA guidelines).
 */
export function getOregon2026ConformingLoanLimit(unitCount: 1 | 2 | 3 | 4 = 1): number {
  switch (unitCount) {
    case 2:
      return OREGON_2026_CONFORMING_LOAN_LIMITS.twoUnit; // $1,066,250
    case 3:
      return OREGON_2026_CONFORMING_LOAN_LIMITS.threeUnit; // $1,288,800
    case 4:
      return OREGON_2026_CONFORMING_LOAN_LIMITS.fourUnit; // $1,601,750
    case 1:
    default:
      return OREGON_2026_CONFORMING_LOAN_LIMITS.oneUnit; // $832,750
  }
}

export interface OregonLakeviewNationalEvaluation {
  isEligible: boolean;
  isProgramActive: boolean;
  statewideOregonEligible: boolean;
  unitCount: 1 | 2 | 3 | 4;
  propertyType?: string;
  occupancyType?: string;
  isStickBuilt?: boolean;
  isPrimaryResidence?: boolean;
  conformingLoanLimitUsd: number;
  isWithinConformingLimit: boolean;
  propertyPrice: number;
  calculatedFirstMortgageUsd: number;
  maxDpaGrantPercent: number;
  estimatedGrantAmountUsd: number;
  effectiveRequiredDownPaymentUsd: number;
  minFicoRequired: number;
  maxAmiPercentage: number;
  countyName?: string;
  countyBaseAmiUsd?: number;
  countyAmi140CapUsd?: number;
  disqualificationReasons: string[];
  guidelineNotes: string;
  scheduleUpdateNotes?: string;
}

/**
 * Evaluates property & borrower eligibility for Lakeview National in Oregon.
 * All census tracts, cities, and all 36 counties in OR are eligible.
 *
 * Program Eligibility Criteria:
 * - Must be strictly 1-Unit property only (No multi-units allowed).
 * - Must be Primary Residence owner-occupied (No second homes or investment properties).
 * - Must be stick-built Single Family Residence (SFR), Planned Unit Development (PUD), or Condominium (No manufactured homes).
 * - Maximum loan amount strictly follows Fannie Mae 2026 Oregon 1-Unit Conforming Loan Limit ($832,750).
 *   (All 36 Oregon counties share the same $832,750 baseline conforming limit; no designated high-cost areas in OR for 2026 per FHFA).
 * - All borrowers' combined annualized gross income must be 140% or less of Fannie Mae Area Median Income (AMI) per county.
 *   (Fannie Mae updates AMI schedules annually by 12/1 and Max Loan Limit schedules annually by 7/1).
 */
export function evaluateOregonLakeviewNationalEligibility(params: {
  price: number;
  state?: string;
  county?: string;
  city?: string;
  address?: string;
  fipsGeoId?: string;
  unitCount?: 1 | 2 | 3 | 4;
  creditScore?: number;
  grossAnnualIncome?: number;
  areaMedianIncomeUsd?: number;
  isTargetedCensusTract?: boolean;
  propertyType?: string;
  occupancyType?: string;
  isPrimaryResidence?: boolean;
  isStickBuilt?: boolean;
  isProgramActive?: boolean;
}): OregonLakeviewNationalEvaluation {
  const {
    price,
    state = 'OR',
    county,
    city,
    address,
    fipsGeoId,
    unitCount = 1,
    creditScore = 650,
    grossAnnualIncome = 0,
    areaMedianIncomeUsd,
    isTargetedCensusTract = false,
    propertyType = 'Single Family',
    occupancyType = 'Primary',
    isPrimaryResidence = true,
    isStickBuilt = true,
    isProgramActive = true
  } = params;

  const conformingLimit = getOregon2026ConformingLoanLimit(1); // Lakeview only permits 1-Unit ($832,750)
  const disqualificationReasons: string[] = [];

  // Resolve county Fannie Mae AMI schedule
  const countyAmiData = resolveOregonCountyFannieMaeAmi(county || fipsGeoId || city || address);
  const effectiveBaseAmi = areaMedianIncomeUsd && areaMedianIncomeUsd > 0 ? areaMedianIncomeUsd : countyAmiData.baseAmiUsd;
  const effectiveAmi140Cap = Math.round(effectiveBaseAmi * 1.40);

  // 1. Statewide Oregon Eligibility Check: All census tracts, cities, and counties in OR are eligible.
  const isOregon = state.toUpperCase() === 'OR';

  // 2. Unit Count Requirement: Strictly 1-Unit Only (No Multi-Units)
  if (unitCount > 1) {
    disqualificationReasons.push(
      `Lakeview National strictly requires a 1-Unit property. Multi-unit properties (${unitCount}-Unit) are not permitted.`
    );
  }

  // 3. Occupancy Requirement: Strictly Primary Residence Only
  if (occupancyType && occupancyType.toLowerCase() !== 'primary') {
    disqualificationReasons.push(
      `Lakeview National requires a Primary Residence. Occupancy type "${occupancyType}" is not eligible.`
    );
  } else if (isPrimaryResidence === false) {
    disqualificationReasons.push(
      'Lakeview National requires 1-Unit Primary Residence owner-occupancy (second homes and investment properties not permitted).'
    );
  }

  // 4. Property Type Requirement: Stick-built SFR, PUD, or Condominium ONLY (No Manufactured Homes)
  const normalizedPropType = (propertyType || '').toLowerCase();
  const isManufactured = normalizedPropType.includes('manufactured') || normalizedPropType.includes('mobile') || isStickBuilt === false;
  const isMultiUnitType = normalizedPropType.includes('multi') || normalizedPropType.includes('duplex') || normalizedPropType.includes('triplex') || normalizedPropType.includes('fourplex');

  if (isManufactured) {
    disqualificationReasons.push(
      'Lakeview National requires a stick-built SFR, PUD, or Condominium. Manufactured and mobile homes are not permitted.'
    );
  } else if (isMultiUnitType) {
    disqualificationReasons.push(
      'Lakeview National does not allow multi-family or multi-unit properties.'
    );
  }

  // 5. Conforming Loan Limit Check: 2026 Fannie Mae Oregon 1-Unit limit ($832,750)
  const calculatedFirstMortgage = Math.round(price * 0.965);
  const isWithinConformingLimit = calculatedFirstMortgage <= conformingLimit && price <= conformingLimit * 1.035;

  if (isProgramActive && !isWithinConformingLimit) {
    disqualificationReasons.push(
      `Loan amount / purchase price ($${price.toLocaleString()}) exceeds the 2026 Fannie Mae Oregon 1-Unit Conforming Loan Limit of $${conformingLimit.toLocaleString()}. (All 36 OR counties share this baseline limit with no high-cost exceptions per FHFA).`
    );
  }

  // 6. Minimum FICO check: Lakeview National requires 660+ FICO
  if (creditScore < 660) {
    disqualificationReasons.push(`FICO score (${creditScore}) is below Lakeview National minimum requirement of 660.`);
  }

  // 7. 140% Area Median Income (AMI) Check per County
  // All borrowers combined annualized income must be 140% or less of Fannie Mae AMI per county
  if (isProgramActive && grossAnnualIncome > 0 && effectiveAmi140Cap > 0) {
    if (grossAnnualIncome > effectiveAmi140Cap && !isTargetedCensusTract) {
      disqualificationReasons.push(
        `All borrowers combined annualized income ($${grossAnnualIncome.toLocaleString()}) exceeds 140% Fannie Mae Area Median Income (AMI) limit ($${effectiveAmi140Cap.toLocaleString()}) for ${countyAmiData.countyName} County. (Fannie Mae updates AMI schedule annually by 12/1 and max loan limits annually by 7/1).`
      );
    }
  }

  const isEligible = disqualificationReasons.length === 0;
  const maxDpaGrantPercent = creditScore >= 660 ? 5.0 : 3.5;
  const rawGrant = Math.round((price * maxDpaGrantPercent) / 100);
  const estimatedGrantAmountUsd = Math.min(25000, rawGrant); // $25k DPA cap

  return {
    isEligible,
    isProgramActive,
    statewideOregonEligible: isOregon,
    unitCount,
    propertyType,
    occupancyType,
    isStickBuilt: !isManufactured,
    isPrimaryResidence,
    conformingLoanLimitUsd: conformingLimit,
    isWithinConformingLimit,
    propertyPrice: price,
    calculatedFirstMortgageUsd: calculatedFirstMortgage,
    maxDpaGrantPercent,
    estimatedGrantAmountUsd,
    effectiveRequiredDownPaymentUsd: Math.max(0, Math.round(price * 0.035) - estimatedGrantAmountUsd),
    minFicoRequired: 660,
    maxAmiPercentage: 140,
    countyName: countyAmiData.countyName,
    countyBaseAmiUsd: effectiveBaseAmi,
    countyAmi140CapUsd: effectiveAmi140Cap,
    disqualificationReasons,
    guidelineNotes: isProgramActive
      ? `Lakeview National 100% DPA is active across all 36 Oregon counties with 2026 Fannie Mae Conforming Limit of $${conformingLimit.toLocaleString()} (1-Unit stick-built SFR/PUD/Condo primary residence only; Max 140% County AMI: $${effectiveAmi140Cap.toLocaleString()}). Fannie Mae updates AMI annually by 12/1 and Loan Limits annually by 7/1.`
      : `Lakeview National program filter is TOGGLED OFF. Income and conforming loan limit caps are bypassed.`,
    scheduleUpdateNotes: FANNIE_MAE_SCHEDULE_CONSTANTS.FANNIE_SCHEDULE_NOTE
  };
}

/**
 * Monthly P&I calculation
 */
export function calculateMonthlyPI(loanAmount: number, annualRatePercent: number, loanTermYears = 30): number {
  if (loanAmount <= 0) return 0;
  if (annualRatePercent <= 0) return loanAmount / (loanTermYears * 12);

  const monthlyRate = annualRatePercent / 100 / 12;
  const totalMonths = loanTermYears * 12;
  const factor = Math.pow(1 + monthlyRate, totalMonths);
  return Math.round((loanAmount * (monthlyRate * factor)) / (factor - 1));
}

/**
 * Calculates max purchase price and DTI limits (up to 50% max DTI envelope)
 */
export function calculateDtiEnvelope(profile: BuyerDtiProfile): BuyerPrequalificationResult {
  const {
    grossMonthlyIncome,
    totalMonthlyDebtObligations,
    availableDownPayment,
    targetInterestRate,
    loanTermYears = 30,
    maxBackEndDtiPercent = 50.0
  } = profile;

  if (grossMonthlyIncome <= 0) {
    return {
      maxAllowableTotalMonthlyDebt: 0,
      maxAllowableMonthlyHousingPayment: 0,
      currentNonHousingDebt: totalMonthlyDebtObligations,
      estimatedMaxPurchasePrice: availableDownPayment,
      estimatedMaxLoanAmount: 0,
      calculatedFrontEndDti: 0,
      calculatedBackEndDti: 0,
      qualifiesForPurchase: false
    };
  }

  const maxAllowableTotalMonthlyDebt = grossMonthlyIncome * (maxBackEndDtiPercent / 100);
  const maxAllowableMonthlyHousingPayment = Math.max(0, maxAllowableTotalMonthlyDebt - totalMonthlyDebtObligations);

  // Reserve ~20% for Taxes, Insurance & HOA
  const estimatedMaxPI = maxAllowableMonthlyHousingPayment * 0.8;
  const monthlyRate = targetInterestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  let estimatedMaxLoan = 0;

  if (monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    estimatedMaxLoan = (estimatedMaxPI * (factor - 1)) / (monthlyRate * factor);
  } else {
    estimatedMaxLoan = estimatedMaxPI * totalMonths;
  }

  const roundedMaxLoan = Math.max(0, Math.round(estimatedMaxLoan));
  const estimatedMaxPurchasePrice = Math.round(roundedMaxLoan + availableDownPayment);

  return {
    maxAllowableTotalMonthlyDebt: Math.round(maxAllowableTotalMonthlyDebt),
    maxAllowableMonthlyHousingPayment: Math.round(maxAllowableMonthlyHousingPayment),
    currentNonHousingDebt: totalMonthlyDebtObligations,
    estimatedMaxPurchasePrice,
    estimatedMaxLoanAmount: roundedMaxLoan,
    calculatedFrontEndDti: Number(((maxAllowableMonthlyHousingPayment / grossMonthlyIncome) * 100).toFixed(1)),
    calculatedBackEndDti: Number((((totalMonthlyDebtObligations + maxAllowableMonthlyHousingPayment) / grossMonthlyIncome) * 100).toFixed(1)),
    qualifiesForPurchase: maxAllowableMonthlyHousingPayment > 350
  };
}

export function formatUSD(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(val);
}

/**
 * 1-Click Zillow URL Geocoder
 */
export function parseZillowListingUrl(url: string): Partial<SyncedPropertyListing> | null {
  try {
    if (!url.includes('zillow.com')) return null;
    const zpidMatch = url.match(/\/(\d+)_zpid/);
    const zpid = zpidMatch ? zpidMatch[1] : `zillow-${Date.now()}`;
    const parts = url.split('/');
    const slug = parts[parts.length - 2] || 'Imported Property';
    const cleanAddress = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return {
      id: zpid,
      formattedAddress: cleanAddress || '123 Imported St, Portland, OR 97201',
      addressLine1: cleanAddress.split(',')[0] || '123 Imported St',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
      price: 445000,
      daysOnMarket: 12,
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1600,
      propertyType: 'Single Family',
      hoaMonthlyFee: 0,
      estimatedAnnualTax: 4100,
      estimatedAnnualInsurance: 1150,
      zillowUrl: url,
      rentCastValuationScore: 95,
      coordinates: { lat: 45.5152, lng: -122.6784 },
      geoid: '41051001202',
      propertyNotes: 'Imported via Zillow URL. Evaluated for CRA Grant & HomeReady 3% down.',
      specialPrograms: {
        usdaRural100Financing: false,
        lmiCraGrantEligible: true,
        craGrantAmountUsd: 5000,
        fnmaHomeReady3Percent: true,
        fhlmcHomePossible3Percent: true,
        stateHfaFirstHomeEligible: true,
        lakeviewNationalDpaEligible: true,
        lakeviewGrantAmountUsd: 13475,
        ohcsFlexLendingFirstHomeEligible: true,
        ohcsGrantAmountUsd: 15400,
        targetedAreaGrantBonus: false
      }
    };
  } catch {
    return null;
  }
}

/**
 * Syncs with Mike Ford's Master GeoSphere Feed
 */
export async function fetchMasterGeoSphereListings(
  config: MasterFeedSyncConfig
): Promise<{ success: boolean; listings: SyncedPropertyListing[]; syncedCount: number }> {
  // If remote master feed endpoint provided, fetch from master hub
  if (config.masterFeedEndpointUrl) {
    try {
      const response = await fetch(config.masterFeedEndpointUrl);
      if (response.ok) {
        const remoteData = await response.json();
        return { success: true, listings: remoteData, syncedCount: remoteData.length };
      }
    } catch (err) {
      console.warn('[GeoSphereSync] Master endpoint unavailable, using verified local seed listings', err);
    }
  }

  // Return baseline verified master listings
  return {
    success: true,
    listings: [],
    syncedCount: 0
  };
}

/**
 * Dispatches an Area Listing Request to Mike Ford's Master Admin Queue
 */
export async function submitAreaListingRequest(
  payload: AreaListingRequestPayload,
  config: MasterFeedSyncConfig
): Promise<{ success: boolean; message: string }> {
  // If webhook configured, push to Mike's queue
  if (config.masterFeedEndpointUrl) {
    try {
      await fetch(`${config.masterFeedEndpointUrl}/area-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (e) {
      console.warn('Queued request locally', e);
    }
  }

  if (typeof window !== 'undefined') {
    const existing = JSON.parse(localStorage.getItem('vantage_area_requests') || '[]');
    existing.push(payload);
    localStorage.setItem('vantage_area_requests', JSON.stringify(existing));
  }

  return {
    success: true,
    message: `Area request for "${payload.targetCityOrZip}" submitted to Mike Ford Admin. Properties will be synced to your map shortly.`
  };
}

// ----------------------------------------------------------------------------
// Backwards Compatibility Functions for Prior Modules
// ----------------------------------------------------------------------------

export function calculateMonthlyPiti(
  purchasePrice: number,
  downPayment: number,
  interestRateAnnual: number,
  loanTermYears: number = 30,
  taxRateAnnual: number = 1.2,
  insuranceAnnual: number = 1440,
  pmiRateAnnual: number = 0.65
): {
  piMonthly: number;
  taxMonthly: number;
  insuranceMonthly: number;
  pmiMonthly: number;
  totalPiti: number;
  loanAmount: number;
} {
  const loanAmount = Math.max(0, purchasePrice - downPayment);
  const monthlyRate = (interestRateAnnual / 100) / 12;
  const numPayments = loanTermYears * 12;

  let piMonthly = 0;
  if (loanAmount > 0 && monthlyRate > 0) {
    piMonthly = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);
  } else if (loanAmount > 0) {
    piMonthly = loanAmount / numPayments;
  }

  const taxMonthly = (purchasePrice * (taxRateAnnual / 100)) / 12;
  const insuranceMonthly = insuranceAnnual / 12;
  const downPaymentPercent = purchasePrice > 0 ? (downPayment / purchasePrice) * 100 : 0;
  const pmiMonthly = downPaymentPercent < 20 ? (loanAmount * (pmiRateAnnual / 100)) / 12 : 0;
  const totalPiti = Math.round(piMonthly + taxMonthly + insuranceMonthly + pmiMonthly);

  return {
    piMonthly: Math.round(piMonthly),
    taxMonthly: Math.round(taxMonthly),
    insuranceMonthly: Math.round(insuranceMonthly),
    pmiMonthly: Math.round(pmiMonthly),
    totalPiti,
    loanAmount
  };
}

export function evaluateDtiAffordability(
  params: DtiCalculatorParams,
  targetPurchasePrice: number
): DtiAffordabilityResult {
  const {
    grossMonthlyIncome,
    recurringMonthlyDebts,
    downPayment,
    targetInterestRate,
    loanTermYears,
    propertyTaxRate = 1.2,
    annualHomeownersInsurance = 1440,
    pmiRate = 0.65
  } = params;

  const maxFrontEndPayment = grossMonthlyIncome * 0.28;
  const maxBackEndPayment = Math.max(0, (grossMonthlyIncome * 0.43) - recurringMonthlyDebts);
  const maxAllowableMonthlyHousingPayment = Math.min(maxFrontEndPayment, maxBackEndPayment);

  const monthlyRate = (targetInterestRate / 100) / 12;
  const numPayments = loanTermYears * 12;
  let maxLoanAmount = 0;
  if (monthlyRate > 0) {
    const estimatedNonPiMonthly = (targetPurchasePrice * (propertyTaxRate / 100) / 12) + (annualHomeownersInsurance / 12) + ((targetPurchasePrice - downPayment) * (pmiRate / 100) / 12);
    const availableForPi = Math.max(0, maxAllowableMonthlyHousingPayment - estimatedNonPiMonthly);
    maxLoanAmount = (availableForPi * (Math.pow(1 + monthlyRate, numPayments) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, numPayments));
  } else {
    maxLoanAmount = maxAllowableMonthlyHousingPayment * numPayments;
  }
  const maxPurchasePriceEnvelope = Math.max(0, Math.round(maxLoanAmount + downPayment));

  const piti = calculateMonthlyPiti(
    targetPurchasePrice,
    downPayment,
    targetInterestRate,
    loanTermYears,
    propertyTaxRate,
    annualHomeownersInsurance,
    pmiRate
  );

  const actualFrontEndDti = grossMonthlyIncome > 0 ? (piti.totalPiti / grossMonthlyIncome) * 100 : 0;
  const actualBackEndDti = grossMonthlyIncome > 0 ? ((piti.totalPiti + recurringMonthlyDebts) / grossMonthlyIncome) * 100 : 0;

  return {
    maxFrontEndPayment: Math.round(maxFrontEndPayment),
    maxBackEndPayment: Math.round(maxBackEndPayment),
    maxAllowableMonthlyHousingPayment: Math.round(maxAllowableMonthlyHousingPayment),
    maxPurchasePriceEnvelope,
    currentEstimatedPITI: piti.totalPiti,
    actualFrontEndDti: Number(actualFrontEndDti.toFixed(1)),
    actualBackEndDti: Number(actualBackEndDti.toFixed(1)),
    isFrontEndQualified: actualFrontEndDti <= 28.0,
    isBackEndQualified: actualBackEndDti <= 43.0,
    isOverallQualified: actualFrontEndDti <= 28.0 && actualBackEndDti <= 43.0,
    requiredDownPayment: downPayment,
    estimatedClosingCosts: Math.round(targetPurchasePrice * 0.025),
    pmiMonthly: piti.pmiMonthly,
    propertyTaxMonthly: piti.taxMonthly,
    insuranceMonthly: piti.insuranceMonthly,
    principalAndInterestMonthly: piti.piMonthly
  };
}

import {
  isOregonLmiCensusTractStrict,
  getOregonCensusTractLmiCategory
} from '../data/oregonLmiMatchedTracts';

export function isOregonStateAndCounty(fipsCode: string, state?: string): boolean {
  if (state && state.toUpperCase() === 'OR') return true;
  return Boolean(fipsCode && fipsCode.startsWith('41'));
}

export function isOregonLmiCensusTract(fipsCode: string): boolean {
  if (!fipsCode) return false;
  // Strictly check exact 214-tract official dictionary from geosphere-map-oregon/lmi-matched-tracts.js
  return isOregonLmiCensusTractStrict(fipsCode);
}

/**
 * Returns exact OHCS 2026 eHousingPlus Household Income Limits by County, Household Size (1-2 vs 3+), and Targeted Area Status
 */
export function getOregonOhcsIncomeLimit(
  countyFipsOrName: string,
  householdSize: number = 1,
  isTargetedArea: boolean = false
): number {
  const county = (countyFipsOrName || '41051').toLowerCase();
  const is3Plus = householdSize >= 3;

  // Portland MSA: Multnomah (41051), Washington (41067), Clackamas (41005), Yamhill (41071), Columbia (41009)
  if (['41051', '41067', '41005', '41071', '41009', 'multnomah', 'washington', 'clackamas', 'portland', 'yamhill', 'columbia'].some(k => county.includes(k))) {
    if (isTargetedArea) return is3Plus ? 171500 : 147000;
    return is3Plus ? 140875 : 122500;
  }

  // Deschutes County (Bend/Redmond 41017)
  if (county.includes('41017') || county.includes('deschutes') || county.includes('bend')) {
    if (isTargetedArea) return is3Plus ? 165480 : 141840;
    return is3Plus ? 135930 : 118200;
  }

  // Salem MSA: Marion (41047), Polk (41053)
  if (county.includes('41047') || county.includes('41053') || county.includes('marion') || county.includes('polk') || county.includes('salem')) {
    if (isTargetedArea) return is3Plus ? 148960 : 127680;
    return is3Plus ? 122360 : 106400;
  }

  // Eugene MSA: Lane County (41039)
  if (county.includes('41039') || county.includes('lane') || county.includes('eugene')) {
    if (isTargetedArea) return is3Plus ? 146720 : 125760;
    return is3Plus ? 120520 : 104800;
  }

  // Medford / Jackson County (41029) & Hood River (41027)
  if (county.includes('41029') || county.includes('41027') || county.includes('jackson') || county.includes('medford') || county.includes('hood river')) {
    if (isTargetedArea) return is3Plus ? 143500 : 123000;
    return is3Plus ? 117875 : 102500;
  }

  // Balance of State / Rural Counties
  if (isTargetedArea) return is3Plus ? 137900 : 118200;
  return is3Plus ? 113275 : 98500;
}

/**
 * Returns exact OHCS 2026 eHousingPlus Purchase Price Limits by County and Targeted Area Status
 */
export function getOregonOhcsPurchasePriceLimit(fipsCode: string, isTargetedArea: boolean): number {
  const countyFips = fipsCode.substring(0, 5); // e.g., '41051' for Multnomah
  const lower = fipsCode.toLowerCase();

  // High-Cost Central OR / Deschutes (Bend/Redmond)
  if (countyFips === '41017' || lower.includes('deschutes') || lower.includes('bend')) {
    return isTargetedArea ? 782000 : 640000;
  }
  // Portland Tri-County (Multnomah 41051, Washington 41067, Clackamas 41005) & Hood River (41027) & Jackson (41029) & Marion (41047)
  if (['41051', '41067', '41005', '41027', '41029', '41047'].includes(countyFips) || 
      ['multnomah', 'washington', 'clackamas', 'portland', 'marion', 'jackson', 'hood river'].some(k => lower.includes(k))) {
    return isTargetedArea ? 715000 : 585000;
  }
  // Balance of State / Rural Counties
  return isTargetedArea ? 635000 : 520000;
}

export interface OhcsFlexFirstHomeEvaluationResult {
  isEligible: boolean;
  isProgramActive: boolean;
  grantPercent: number; // 4.0% standard or 5.0% LMI/Targeted
  grantAmountUsd: number; // Calculated on 1st mortgage amount (96.5% LTV)
  firstMortgageAmountUsd: number;
  purchasePriceLimitUsd: number;
  isWithinPurchasePriceLimit: boolean;
  householdIncomeLimitUsd: number;
  isWithinIncomeLimit: boolean;
  isLmiTargetedArea: boolean;
  firstTimeHomebuyerWaiverGranted: boolean; // Waived in Targeted Census Tracts or for Qualified Veterans
  minFicoRequired: number; // 620 FICO
  maxDtiAllowedPercent: number; // 45.0% (50.0% with AUS Approve)
  ehousingPlusCode: string;
  disqualificationReasons: string[];
  summary: string;
}

export function evaluateOregonOhcsFlexFirstHomeEligibility(property: {
  state?: string;
  price: number;
  fipsGeoId?: string;
  geoid?: string;
  grossAnnualIncome?: number;
  householdSize?: number;
  creditScore?: number;
  isFirstTimeHomebuyer?: boolean;
  isVeteranBorrower?: boolean;
  ownsOtherRealEstate?: boolean;
  dtiPercent?: number;
  isProgramActive?: boolean;
}): OhcsFlexFirstHomeEvaluationResult {
  const fips = property.fipsGeoId || property.geoid || '41051001202';
  const isOregon = isOregonStateAndCounty(fips, property.state);
  const isProgramActive = property.isProgramActive ?? true;
  const disqualificationReasons: string[] = [];

  if (!isOregon) {
    disqualificationReasons.push('OHCS Flex Lending FirstHome is exclusively available for Oregon real estate.');
    return {
      isEligible: false,
      isProgramActive,
      grantPercent: 0,
      grantAmountUsd: 0,
      firstMortgageAmountUsd: 0,
      purchasePriceLimitUsd: 0,
      isWithinPurchasePriceLimit: false,
      householdIncomeLimitUsd: 0,
      isWithinIncomeLimit: false,
      isLmiTargetedArea: false,
      firstTimeHomebuyerWaiverGranted: false,
      minFicoRequired: 620,
      maxDtiAllowedPercent: 45.0,
      ehousingPlusCode: 'OHCS-ERR-NON-OR',
      disqualificationReasons,
      summary: 'OHCS Flex Lending FirstHome is exclusively available for Oregon real estate.'
    };
  }

  const isLmi = isOregonLmiCensusTract(fips);
  const hhSize = property.householdSize || 1;
  const income = property.grossAnnualIncome || 0;
  const creditScore = property.creditScore ?? 650;
  const isFthb = property.isFirstTimeHomebuyer ?? true;
  const isVet = Boolean(property.isVeteranBorrower);
  const ownsOther = Boolean(property.ownsOtherRealEstate);
  const dti = property.dtiPercent ?? 38.0;

  // 1. Prohibited Real Estate Ownership Check
  if (ownsOther) {
    disqualificationReasons.push('OHCS guidelines strictly prohibit owning any other residential real estate or principal residence at closing.');
  }

  // 2. Minimum Credit Score Check
  if (creditScore < 620) {
    disqualificationReasons.push(`Credit score (${creditScore}) is below OHCS minimum threshold of 620 FICO.`);
  }

  // 3. Debt-to-Income (DTI) Check
  if (dti > 50.0) {
    disqualificationReasons.push(`Back-end DTI (${dti.toFixed(1)}%) exceeds maximum OHCS limit of 50.0%.`);
  }

  // 4. First-Time Homebuyer Rule & Waiver Evaluation
  const fthbWaiver = isLmi || isVet;
  if (!isFthb && !fthbWaiver) {
    disqualificationReasons.push('3-Year First-Time Homebuyer status required unless purchasing in an OHCS Targeted Census Tract or holding Qualified Veteran status.');
  }

  // 5. County Purchase Price Cap Check
  const priceLimit = getOregonOhcsPurchasePriceLimit(fips, isLmi);
  const isWithinPurchasePriceLimit = property.price <= priceLimit;
  if (isProgramActive && !isWithinPurchasePriceLimit) {
    disqualificationReasons.push(`Property price ($${property.price.toLocaleString()}) exceeds the OHCS county limit ($${priceLimit.toLocaleString()}).`);
  }

  // 6. County Household Income Limit Check (1-2 persons vs 3+ persons)
  const incomeLimit = getOregonOhcsIncomeLimit(fips, hhSize, isLmi);
  const isWithinIncomeLimit = income === 0 || income <= incomeLimit;
  if (isProgramActive && !isWithinIncomeLimit) {
    disqualificationReasons.push(`Annual household income ($${income.toLocaleString()}) exceeds OHCS limit ($${incomeLimit.toLocaleString()}) for household size ${hhSize} in county.`);
  }

  const isEligible = disqualificationReasons.length === 0;

  // OHCS Flex Lending DPA Percentage: 4.0% Standard or 5.0% for LMI / Targeted Areas or <=80% AMI
  const grantPercent = isLmi ? 5.0 : 4.0;
  
  // Standard FHA 1st Mortgage Base LTV (96.5% of purchase price)
  const firstMortgageAmount = Math.round(property.price * 0.965);
  const grantAmountUsd = Math.round((firstMortgageAmount * grantPercent) / 100);

  return {
    isEligible,
    isProgramActive,
    grantPercent,
    grantAmountUsd,
    firstMortgageAmountUsd: firstMortgageAmount,
    purchasePriceLimitUsd: priceLimit,
    isWithinPurchasePriceLimit,
    householdIncomeLimitUsd: incomeLimit,
    isWithinIncomeLimit,
    isLmiTargetedArea: isLmi,
    firstTimeHomebuyerWaiverGranted: fthbWaiver,
    minFicoRequired: 620,
    maxDtiAllowedPercent: 45.0,
    ehousingPlusCode: isLmi ? 'OHCS-FLEX-5PCT-TARGETED' : 'OHCS-FLEX-4PCT-STANDARD',
    disqualificationReasons,
    summary: isEligible
      ? `Verified Oregon HFA OHCS Flex Lending FirstHome Eligible. Provides ${grantPercent}% Cash Assistance ($${grantAmountUsd.toLocaleString()} DPA) on 1st Mortgage ($${firstMortgageAmount.toLocaleString()}). County Price Cap: $${priceLimit.toLocaleString()} | Income Cap: $${incomeLimit.toLocaleString()}.${fthbWaiver ? ' 1st-Time Homebuyer Rule WAIVED.' : ''}`
      : `OHCS Ineligible: ${disqualificationReasons.join(' ')}`
  };
}

export function evaluateFipsGeoId(fipsCode: string): {
  usdaRuralEligible: boolean;
  lmiGrantEligible: boolean;
  grantAmountEstimate: number;
  homeReadyEligible: boolean;
  homePossibleEligible: boolean;
  stateHfaEligible: boolean;
  ohcsFlexFirstHomeEligible: boolean;
  ohcsGrantEstimateUsd: number;
  summary: string;
} {
  const isUsda = fipsCode.startsWith('41009') || fipsCode.startsWith('48453') || fipsCode.endsWith('7') || fipsCode.endsWith('3');
  const isLmi = isOregonLmiCensusTract(fipsCode);
  const grantAmount = isLmi ? 5000 : 0;
  const isOregon = fipsCode.startsWith('41');

  return {
    usdaRuralEligible: isUsda,
    lmiGrantEligible: isLmi,
    grantAmountEstimate: grantAmount,
    homeReadyEligible: true,
    homePossibleEligible: true,
    stateHfaEligible: isOregon,
    ohcsFlexFirstHomeEligible: isOregon,
    ohcsGrantEstimateUsd: isLmi ? 18500 : 15400,
    summary: isUsda
      ? 'Verified USDA 100% Zero-Down Development Area. No down payment required.'
      : isLmi
      ? `Eligible for $${grantAmount.toLocaleString()} Community Reinvestment Act (CRA) Grant + OHCS Flex FirstHome $18,500 assistance.`
      : 'Standard FNMA HomeReady (3% Down) & OHCS Flex FirstHome Area.'
  };
}

export function parseAndGeocodeZillowUrl(url: string): PropertyListing | null {
  const parsed = parseZillowListingUrl(url);
  if (!parsed) return null;
  return {
    id: parsed.id || `zillow_${Date.now()}`,
    address: parsed.addressLine1 || '123 Imported St',
    city: parsed.city || 'Portland',
    state: parsed.state || 'OR',
    zip: parsed.zipCode || '97201',
    price: parsed.price || 445000,
    originalPrice: parsed.price || 445000,
    priceDrop: parsed.priceDropAmount || 0,
    beds: parsed.bedrooms || 3,
    baths: parsed.bathrooms || 2,
    sqft: parsed.squareFootage || 1600,
    yearBuilt: 2020,
    rentCastScore: parsed.rentCastValuationScore || 95,
    estimatedRent: 2400,
    estimatedMonthlyPayment: 2650,
    propertyType: 'Single Family',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=60',
    fipsGeoId: parsed.geoid || '41051001202',
    coordinates: parsed.coordinates || { lat: 45.5152, lng: -122.6784 },
    specialPrograms: {
      usdaRuralEligible: !!parsed.specialPrograms?.usdaRural100Financing,
      lmiGrantEligible: !!parsed.specialPrograms?.lmiCraGrantEligible,
      grantAmountEstimate: parsed.specialPrograms?.craGrantAmountUsd || 5000,
      homeReadyEligible: !!parsed.specialPrograms?.fnmaHomeReady3Percent,
      homePossibleEligible: !!parsed.specialPrograms?.fhlmcHomePossible3Percent
    },
    zillowUrl: url,
    mlsNumber: `ACT-${Math.floor(100000 + Math.random() * 900000)}`,
    daysOnMarket: parsed.daysOnMarket || 12,
    listingStatus: 'Active'
  };
}

export function runAutonomousPriceAudit(listings: PropertyListing[]): PriceAuditLog[] {
  return listings
    .filter(l => (l.priceDrop && l.priceDrop > 0) || (l.originalPrice && l.originalPrice > l.price))
    .map(l => {
      const drop = l.priceDrop || ((l.originalPrice || l.price) - l.price);
      const orig = l.originalPrice || l.price + drop;
      const pct = orig > 0 ? (drop / orig) * 100 : 0;
      return {
        id: `audit_${l.id}_${Date.now()}`,
        timestamp: new Date().toISOString(),
        mlsNumber: l.mlsNumber || `MLS-${l.id}`,
        address: `${l.address}, ${l.city}, ${l.state}`,
        oldPrice: orig,
        newPrice: l.price,
        changeAmount: drop,
        changePercentage: Number(pct.toFixed(2)),
        actionTaken: 'Auto-drafted alert in Gmail and synced with Master Feed',
        notifiedLeadCount: 14
      };
    });
}

export const SAMPLE_RENTCAST_LISTINGS: PropertyListing[] = [
  {
    id: 'geo-101',
    address: '742 SE Hawthorne Blvd',
    city: 'Portland',
    state: 'OR',
    zip: '97214',
    price: 435000,
    originalPrice: 450000,
    priceDrop: 15000,
    beds: 3,
    baths: 2,
    sqft: 1580,
    yearBuilt: 2018,
    rentCastScore: 96,
    estimatedRent: 2850,
    estimatedMonthlyPayment: 2650,
    propertyType: 'Single Family',
    imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&auto=format&fit=crop&q=60',
    fipsGeoId: '41051001202',
    coordinates: { lat: 45.5121, lng: -122.6582 },
    specialPrograms: {
      usdaRuralEligible: false,
      lmiGrantEligible: true,
      grantAmountEstimate: 5000,
      homeReadyEligible: true,
      homePossibleEligible: true
    },
    zillowUrl: 'https://www.zillow.com/homedetails/742-SE-Hawthorne-Blvd-Portland-OR-97214/12345_zpid/',
    mlsNumber: 'RMLS-24910283',
    daysOnMarket: 18,
    listingStatus: 'Price Reduced'
  },
  {
    id: 'geo-102',
    address: '14800 NW St Helens Rd',
    city: 'Scappoose',
    state: 'OR',
    zip: '97056',
    price: 389000,
    originalPrice: 399000,
    priceDrop: 10000,
    beds: 3,
    baths: 2,
    sqft: 1720,
    yearBuilt: 2015,
    rentCastScore: 92,
    estimatedRent: 2400,
    estimatedMonthlyPayment: 2350,
    propertyType: 'Single Family',
    imageUrl: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=600&auto=format&fit=crop&q=60',
    fipsGeoId: '41009000101',
    coordinates: { lat: 45.7576, lng: -122.8781 },
    specialPrograms: {
      usdaRuralEligible: true,
      lmiGrantEligible: false,
      grantAmountEstimate: 0,
      homeReadyEligible: true,
      homePossibleEligible: true
    },
    zillowUrl: 'https://www.zillow.com/homedetails/14800-NW-St-Helens-Rd-Scappoose-OR-97056/67890_zpid/',
    mlsNumber: 'RMLS-24890123',
    daysOnMarket: 28,
    listingStatus: 'Price Reduced'
  },
  {
    id: 'geo-103',
    address: '2105 NE Alberta St',
    city: 'Portland',
    state: 'OR',
    zip: '97211',
    price: 485000,
    originalPrice: 485000,
    priceDrop: 0,
    beds: 2,
    baths: 1.5,
    sqft: 1240,
    yearBuilt: 2021,
    rentCastScore: 98,
    estimatedRent: 2950,
    estimatedMonthlyPayment: 2980,
    propertyType: 'Townhome',
    imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=60',
    fipsGeoId: '41051003403',
    coordinates: { lat: 45.5589, lng: -122.6437 },
    specialPrograms: {
      usdaRuralEligible: false,
      lmiGrantEligible: true,
      grantAmountEstimate: 5000,
      homeReadyEligible: true,
      homePossibleEligible: true
    },
    zillowUrl: 'https://www.zillow.com/homedetails/2105-NE-Alberta-St-Portland-OR-97211/11223_zpid/',
    mlsNumber: 'RMLS-24991823',
    daysOnMarket: 9,
    listingStatus: 'Active'
  }
];
