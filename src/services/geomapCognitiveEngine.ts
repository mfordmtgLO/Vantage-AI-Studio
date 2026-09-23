/**
 * @file geomapCognitiveEngine.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * VANTAGE GEOMAP 3.0: HYBRID COGNITIVE REAL ESTATE & MORTGAGE ENGINE
 * - Multi-Layer DPA Grant Waterfall Stacking Solver
 * - Climate, FEMA Flood & Hazard Insurance Escrow Envelope
 * - Fannie Mae ADU "House-Hack" 75% Qualifying Rent Simulator
 * - Isochrone Commute & Transit Envelope Calculation
 * - Co-Borrower Collaborative DTI Matrix
 * - DeepThink Adversarial Property Pre-Mortem Risk Audit
 * - Proactive Geofenced Interest Radius Alert Radar
 */

import { SyncedPropertyListing, BuyerDtiProfile } from '../types/firstTimeHomebuyerPlugin';
import { UserMemory } from '../types';

export interface DpaGrantWaterfallResult {
  propertyId: string;
  purchasePrice: number;
  requiredMinimumDownPayment: number;
  minimumDownPaymentPercent: number;
  estimatedClosingCostsAndPrepaids: number;
  totalCashRequirementBeforeGrants: number;
  stackedGrants: {
    programName: string;
    grantType: 'CRA_Bank_Grant' | 'State_HFA_DPA' | 'County_Bond' | 'Seller_Concession' | 'USDA_Zero_Down';
    amountUsd: number;
    isRepayable: boolean;
    description: string;
  }[];
  totalGrantAssistanceUsd: number;
  netOutOfPocketCashRequired: number;
  qualifiesForTrueZeroOutOfPocket: boolean;
  savingsVsTraditionalDownPayment: number;
}

export interface ClimateHazardRiskEnvelope {
  floodZone: string; // 'Zone X (Minimal)' | 'Zone AE (100-Year High Risk)' | 'Zone A'
  wildfireRiskTier: 'Low' | 'Moderate' | 'High (WUI)';
  annualBaseHazardInsurance: number;
  annualFloodInsuranceSurcharge: number;
  annualWildfireSurcharge: number;
  totalAnnualInsurance: number;
  totalMonthlyInsuranceEscrow: number;
  insuranceImpactOnMonthlyPaymentDelta: number; // vs generic 0.35%
  hazardRiskSummary: string;
}

export interface AduHouseHackOffsetResult {
  baseGrossMonthlyIncome: number;
  projectedMonthlyAduRent: number;
  fannieMaeEffectiveRentalIncome: number; // 75% rule
  effectiveTotalQualifyingIncome: number;
  additionalMonthlyHousingCapacity: number;
  expandedMaxPurchasePrice: number;
  purchasingPowerExpansionUsd: number;
}

export interface IsochroneCommuteFilter {
  originName: string;
  travelMode: 'driving' | 'transit' | 'bicycling';
  maxDurationMinutes: number; // 15, 30, 45, 60
  timeOfDay: 'morning_rush_8am' | 'evening_rush_5pm' | 'off_peak';
}

export interface CoBorrowerCanvasProfile {
  primaryBorrowerName: string;
  primaryGrossMonthlyIncome: number;
  primaryMonthlyDebts: number;
  hasCoBorrower: boolean;
  coBorrowerName: string;
  coBorrowerGrossMonthlyIncome: number;
  coBorrowerMonthlyDebts: number;
  combinedDownPayment: number;
  targetInterestRate: number;
}

export interface DeepThinkPreMortemAudit {
  propertyId: string;
  overallRiskScore: number; // 0 to 100 (lower is safer)
  riskLevel: 'Low Risk' | 'Moderate Risk' | 'Elevated Risk' | 'High Risk';
  preMortemThesis: string;
  potentialPitfalls: {
    category: 'Tax Escalation' | 'Insurance Spike' | 'CapEx / Aging Systems' | 'School Boundary Shift' | 'HOA Health';
    severity: 'High' | 'Medium' | 'Low';
    finding: string;
    mitigationStrategy: string;
  }[];
  recommendedOfferDiscountUsd: number;
}

export interface GeofencedRadiusAlert {
  id: string;
  alertType: 'sunday_drive_geofence' | 'cra_grant_unlock' | 'lo_field_ping';
  targetCityOrArea: string;
  title: string;
  body: string;
  timestamp: string;
  matchingListingsCount: number;
  highlightedGrantAmountUsd: number;
  isRead: boolean;
  coordinates?: { lat: number; lng: number };
}

/**
 * 1. MULTI-LAYER DPA GRANT WATERFALL STACKING SOLVER
 */
export function calculateDpaGrantWaterfall(
  listing: SyncedPropertyListing,
  profile: BuyerDtiProfile,
  sellerConcessionPercent: number = 0
): DpaGrantWaterfallResult {
  const price = listing.price;
  const isUsda = !!listing.specialPrograms?.usdaRural100Financing;
  const minDownPct = isUsda ? 0 : 3.0; // 3% for HomeReady/HomePossible
  const requiredMinDown = Math.round(price * (minDownPct / 100));

  // Closing costs estimated at 2.75% of price + $1,200 prepaids
  const closingCosts = Math.round(price * 0.0275 + 1200);
  const totalCashNeededBefore = requiredMinDown + closingCosts;

  const stackedGrants: DpaGrantWaterfallResult['stackedGrants'] = [];

  // 1. Bank CRA Grant ($5,000 to $10,000)
  if (listing.specialPrograms?.lmiCraGrantEligible) {
    const craAmt = listing.specialPrograms.craGrantAmountUsd || 5000;
    stackedGrants.push({
      programName: 'Bank CRA Community Opportunity Grant',
      grantType: 'CRA_Bank_Grant',
      amountUsd: craAmt,
      isRepayable: false,
      description: 'Non-repayable direct closing credit for buying in low-to-moderate income Census Tract.'
    });
  }

  // 2. State HFA First-Home Assistance ($10,000 - $15,400)
  if (listing.specialPrograms?.ohcsFlexLendingFirstHomeEligible) {
    const hfaAmt = listing.specialPrograms.ohcsGrantAmountUsd || 15400;
    stackedGrants.push({
      programName: 'State Housing Finance Agency Flex DPA',
      grantType: 'State_HFA_DPA',
      amountUsd: hfaAmt,
      isRepayable: false,
      description: '3.5% - 4.0% forgivable second lien or outright grant for qualifying first-time buyers.'
    });
  } else if (listing.specialPrograms?.lakeviewNationalDpaEligible) {
    const nationalAmt = listing.specialPrograms.lakeviewGrantAmountUsd || Math.round(price * 0.035);
    stackedGrants.push({
      programName: 'National Tier-1 Community DPA Assistance',
      grantType: 'State_HFA_DPA',
      amountUsd: nationalAmt,
      isRepayable: false,
      description: 'Standard nationwide down payment grant for qualifying conventional or FHA buyers.'
    });
  }

  // 3. County / Regional Bond
  if (listing.county === 'Multnomah' || listing.county === 'Columbia' || listing.county === 'Marion') {
    stackedGrants.push({
      programName: `${listing.county} County First-Key DPA Fund`,
      grantType: 'County_Bond',
      amountUsd: 5000,
      isRepayable: false,
      description: 'County-level down payment bond support for target revitalization areas.'
    });
  }

  // 4. Seller Concession credit
  if (sellerConcessionPercent > 0) {
    const concessionAmt = Math.round(price * (sellerConcessionPercent / 100));
    stackedGrants.push({
      programName: `Negotiated Seller Closing Credit (${sellerConcessionPercent}%)`,
      grantType: 'Seller_Concession',
      amountUsd: concessionAmt,
      isRepayable: false,
      description: 'Seller-paid closing cost concession negotiated into purchase contract.'
    });
  }

  // Calculate Total Stacked Grants
  const totalGrants = stackedGrants.reduce((acc, g) => acc + g.amountUsd, 0);
  const netOutOfPocket = Math.max(0, totalCashNeededBefore - totalGrants);
  const traditionalDownRequirement = Math.round(price * 0.20 + closingCosts);
  const totalSavings = Math.max(0, traditionalDownRequirement - netOutOfPocket);

  return {
    propertyId: listing.id,
    purchasePrice: price,
    requiredMinimumDownPayment: requiredMinDown,
    minimumDownPaymentPercent: minDownPct,
    estimatedClosingCostsAndPrepaids: closingCosts,
    totalCashRequirementBeforeGrants: totalCashNeededBefore,
    stackedGrants,
    totalGrantAssistanceUsd: totalGrants,
    netOutOfPocketCashRequired: netOutOfPocket,
    qualifiesForTrueZeroOutOfPocket: netOutOfPocket === 0,
    savingsVsTraditionalDownPayment: totalSavings
  };
}

/**
 * 2. CLIMATE, FEMA FLOOD & HAZARD INSURANCE ENVELOPE
 */
export function calculateClimateHazardEnvelope(listing: SyncedPropertyListing): ClimateHazardRiskEnvelope {
  const price = listing.price;
  const isFloodZone = listing.county === 'Columbia' || listing.county === 'Marion' || listing.formattedAddress.toLowerCase().includes('river') || listing.formattedAddress.toLowerCase().includes('creek');
  const isWildfireZone = listing.specialPrograms?.usdaRural100Financing || listing.county === 'Deschutes' || listing.county === 'Jackson';

  const floodZone = isFloodZone ? 'Zone AE (100-Year High Risk)' : 'Zone X (Minimal Risk)';
  const wildfireRiskTier = isWildfireZone ? 'High (WUI)' : 'Low';

  // Base hazard: ~0.30% of price
  const baseHazard = Math.round(price * 0.0030);
  const floodSurcharge = isFloodZone ? 1800 : 0;
  const wildfireSurcharge = isWildfireZone ? 950 : 0;
  const totalAnnual = baseHazard + floodSurcharge + wildfireSurcharge;
  const totalMonthly = Math.round(totalAnnual / 12);

  // Generic 0.35% comparison
  const genericMonthly = Math.round((price * 0.0035) / 12);
  const delta = totalMonthly - genericMonthly;

  let summary = 'Standard climate risk profile. Standard HO-3 hazard insurance policy applies.';
  if (isFloodZone && isWildfireZone) {
    summary = 'Dual-risk zone: FEMA mandatory flood insurance policy + Wildland Urban Interface (WUI) wildfire surcharge required in escrow.';
  } else if (isFloodZone) {
    summary = 'FEMA Special Flood Hazard Area (SFHA). Mandatory NFIP flood policy (~$150/mo) required by federal mortgage guidelines.';
  } else if (isWildfireZone) {
    summary = 'High WUI Wildfire Zone. Insurance carrier underwriting review recommended to lock acceptable premium quotes.';
  }

  return {
    floodZone,
    wildfireRiskTier,
    annualBaseHazardInsurance: baseHazard,
    annualFloodInsuranceSurcharge: floodSurcharge,
    annualWildfireSurcharge: wildfireSurcharge,
    totalAnnualInsurance: totalAnnual,
    totalMonthlyInsuranceEscrow: totalMonthly,
    insuranceImpactOnMonthlyPaymentDelta: delta,
    hazardRiskSummary: summary
  };
}

/**
 * 3. ADU & HOUSE-HACK 75% QUALIFYING RENT SIMULATOR
 */
export function calculateAduHouseHackOffset(
  baseGrossMonthlyIncome: number,
  projectedMonthlyAduRent: number,
  targetInterestRate: number = 6.5,
  loanTermYears: number = 30
): AduHouseHackOffsetResult {
  // Fannie Mae 75% rental offset rule (25% vacancy/maintenance reserve)
  const fannieEffectiveRent = Math.round(projectedMonthlyAduRent * 0.75);
  const effectiveTotalQualifyingIncome = baseGrossMonthlyIncome + fannieEffectiveRent;

  // Extra monthly housing payment capacity at 45% back-end DTI
  const additionalMonthlyCapacity = Math.round(fannieEffectiveRent * 0.45);

  // Convert additional monthly payment capacity into expanded loan capacity
  const monthlyRate = targetInterestRate / 100 / 12;
  const totalMonths = loanTermYears * 12;
  let expandedLoan = 0;
  if (monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    expandedLoan = (additionalMonthlyCapacity * 0.8 * (factor - 1)) / (monthlyRate * factor);
  }

  const roundedExpansion = Math.max(0, Math.round(expandedLoan));

  return {
    baseGrossMonthlyIncome,
    projectedMonthlyAduRent,
    fannieMaeEffectiveRentalIncome: fannieEffectiveRent,
    effectiveTotalQualifyingIncome,
    additionalMonthlyHousingCapacity: additionalMonthlyCapacity,
    expandedMaxPurchasePrice: roundedExpansion,
    purchasingPowerExpansionUsd: roundedExpansion
  };
}

/**
 * 4. CO-BORROWER COLLABORATIVE DTI MATRIX
 */
export function calculateCoBorrowerEnvelope(profile: CoBorrowerCanvasProfile) {
  const {
    primaryGrossMonthlyIncome,
    primaryMonthlyDebts,
    hasCoBorrower,
    coBorrowerGrossMonthlyIncome,
    coBorrowerMonthlyDebts,
    combinedDownPayment,
    targetInterestRate
  } = profile;

  const totalIncome = primaryGrossMonthlyIncome + (hasCoBorrower ? coBorrowerGrossMonthlyIncome : 0);
  const totalDebts = primaryMonthlyDebts + (hasCoBorrower ? coBorrowerMonthlyDebts : 0);

  const maxBackEndDtiPercent = 50.0;
  const maxAllowableTotalDebt = totalIncome * (maxBackEndDtiPercent / 100);
  const maxHousingPayment = Math.max(0, maxAllowableTotalDebt - totalDebts);

  const estimatedPI = maxHousingPayment * 0.8;
  const monthlyRate = targetInterestRate / 100 / 12;
  const totalMonths = 30 * 12;
  let maxLoan = 0;
  if (monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, totalMonths);
    maxLoan = (estimatedPI * (factor - 1)) / (monthlyRate * factor);
  }

  const roundedMaxLoan = Math.max(0, Math.round(maxLoan));
  const maxPurchasePrice = Math.round(roundedMaxLoan + combinedDownPayment);

  return {
    combinedGrossIncome: totalIncome,
    combinedMonthlyDebts: totalDebts,
    maxAllowableMonthlyHousingPayment: Math.round(maxHousingPayment),
    estimatedMaxLoanAmount: roundedMaxLoan,
    estimatedMaxPurchasePrice: maxPurchasePrice,
    frontEndDtiPercent: Number(((maxHousingPayment / (totalIncome || 1)) * 100).toFixed(1)),
    backEndDtiPercent: Number((((totalDebts + maxHousingPayment) / (totalIncome || 1)) * 100).toFixed(1))
  };
}

/**
 * 5. DEEPTHINK ADVERSARIAL PROPERTY PRE-MORTEM AUDIT
 */
export function runDeepThinkPreMortemAudit(listing: SyncedPropertyListing): DeepThinkPreMortemAudit {
  const isOlder = (listing.squareFootage || 1500) > 2000;
  const hasHoa = listing.hoaMonthlyFee > 0;
  const isColumbia = listing.county === 'Columbia';

  const pitfalls: DeepThinkPreMortemAudit['potentialPitfalls'] = [];

  // 1. Property Tax Assessment Step-Up
  pitfalls.push({
    category: 'Tax Escalation',
    severity: 'Medium',
    finding: `Current assessed property taxes ($${listing.estimatedAnnualTax}/yr) may reset upon sale, potentially increasing monthly escrow payments by $65-$110/mo in year 2.`,
    mitigationStrategy: 'Model budget using post-sale statutory reassessment caps rather than seller historical tax receipts.'
  });

  // 2. CapEx / Aging Systems Reserve
  if (isOlder) {
    pitfalls.push({
      category: 'CapEx / Aging Systems',
      severity: 'High',
      finding: 'Square footage and age indicate HVAC and roof may be midway through lifecycle. Anticipate $8,000-$14,000 capital expenditure reserve within 4-7 years.',
      mitigationStrategy: 'Request 1-year home warranty from seller and inspect roof flashing/furnace heat exchanger during contingency period.'
    });
  }

  // 3. HOA Reserve Health
  if (hasHoa) {
    pitfalls.push({
      category: 'HOA Health',
      severity: 'Medium',
      finding: `Active HOA fee of $${listing.hoaMonthlyFee}/mo. Risk of special assessments if structural reserve fund is underfunded (<70% funded).`,
      mitigationStrategy: 'Require HOA Form 27 (Financial Reserve Study & Balance Sheet) review prior to closing.'
    });
  }

  // 4. Insurance & Hazard
  if (isColumbia) {
    pitfalls.push({
      category: 'Insurance Spike',
      severity: 'High',
      finding: 'Property is in river-adjacent county subject to FEMA flood insurance premium adjustments upon policy transfer.',
      mitigationStrategy: 'Request seller current NFIP Elevation Certificate to grandfather base flood elevation rates.'
    });
  }

  const highSeverityCount = pitfalls.filter(p => p.severity === 'High').length;
  const overallRisk = Math.min(85, Math.max(15, 20 + highSeverityCount * 25 + (hasHoa ? 15 : 0)));
  const riskLevel: DeepThinkPreMortemAudit['riskLevel'] = 
    overallRisk > 60 ? 'Elevated Risk' : overallRisk > 40 ? 'Moderate Risk' : 'Low Risk';

  const discountUsd = Math.round(listing.price * (overallRisk > 60 ? 0.05 : 0.025));

  return {
    propertyId: listing.id,
    overallRiskScore: overallRisk,
    riskLevel,
    preMortemThesis: `Adversarial stress-test completed. If this transaction fails or causes buyer remorse, the primary catalyst will be ${pitfalls[0]?.category.toLowerCase() || 'post-close liquidity compression'}. Recommended offer strategy accounts for contingencies.`,
    potentialPitfalls: pitfalls,
    recommendedOfferDiscountUsd: discountUsd
  };
}

/**
 * 6. 2ND BRAIN SITUATIONAL CONTEXTUAL RECALL
 */
export function checkSituationalMemoryContext(
  listing: SyncedPropertyListing, 
  memories: UserMemory[]
): { matchedNotes: string[]; recommendation: string | null } {
  const notes: string[] = [];

  for (const m of memories) {
    const text = (m.title + ' ' + m.content).toLowerCase();
    
    // Check HOA preference
    if (text.includes('hoa') || text.includes('association fee')) {
      if (listing.hoaMonthlyFee > 250) {
        notes.push(`Memory Reminder: You noted a strict preference to keep HOA fees under $250/mo. This listing has a $${listing.hoaMonthlyFee}/mo fee.`);
      } else if (listing.hoaMonthlyFee === 0) {
        notes.push(`Memory Match: Zero HOA fees matches your goal of minimizing recurring non-equity fees.`);
      }
    }

    // Check USDA / 0 down preference
    if (text.includes('usda') || text.includes('zero down') || text.includes('0% down')) {
      if (listing.specialPrograms?.usdaRural100Financing) {
        notes.push(`Memory Match: 100% USDA Zero-Down financing available in this area.`);
      }
    }

    // Check Single Family preference
    if (text.includes('single family') || text.includes('yard')) {
      if (listing.propertyType === 'Single Family') {
        notes.push(`Memory Match: Detached single-family layout provides private yard space.`);
      }
    }
  }

  return {
    matchedNotes: notes,
    recommendation: notes.length > 0 ? '2nd Brain has active constraints mapped to this property.' : null
  };
}

/**
 * 7. PROACTIVE GEOFENCED RADIUS ALERT GENERATOR
 */
export function generateProactiveGeofenceAlerts(): GeofencedRadiusAlert[] {
  return [
    {
      id: 'alert_sunday_drive_1',
      alertType: 'sunday_drive_geofence',
      targetCityOrArea: 'Scappoose & St. Helens, OR',
      title: '📍 USDA 100% Zero-Down Boundary Detected!',
      body: 'You just crossed into the Columbia County rural financing corridor. 3 active homes in your saved $2,800/mo budget qualify for $0 down.',
      timestamp: 'Just now (Physical Proximity)',
      matchingListingsCount: 3,
      highlightedGrantAmountUsd: 15400,
      isRead: false,
      coordinates: { lat: 45.7537, lng: -122.8778 }
    },
    {
      id: 'alert_cra_grant_2',
      alertType: 'cra_grant_unlock',
      targetCityOrArea: 'Portland SE Hawthorne (FIPS 41051001202)',
      title: '🏷️ $5,000 Bank CRA Down Payment Grant Unlocked',
      body: 'Your search is centered in an 80% AMI low-to-moderate income Census Tract eligible for direct non-repayable CRA closing grant credits.',
      timestamp: '12 minutes ago',
      matchingListingsCount: 1,
      highlightedGrantAmountUsd: 5000,
      isRead: false,
      coordinates: { lat: 45.5121, lng: -122.6582 }
    },
    {
      id: 'alert_lo_field_3',
      alertType: 'lo_field_ping',
      targetCityOrArea: 'Silverton & Salem East',
      title: '🔔 Lead Field Ping: Marcus Brooks Active in Target Area',
      body: 'Marcus Brooks is currently reviewing 2 USDA rural properties in Marion County. Pre-approval dossier text draft ready in Workspace.',
      timestamp: '45 minutes ago',
      matchingListingsCount: 2,
      highlightedGrantAmountUsd: 13475,
      isRead: true,
      coordinates: { lat: 45.0051, lng: -122.7831 }
    }
  ];
}
