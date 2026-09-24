/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • FIRST-TIME HOMEBUYER GEOMAP & DPA PLUGIN MODULE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Commercial Plugin Module (Zero BYOK Required - Master Feed Sync Architecture)
 * ============================================================================
 */

export interface GeoCoordinate {
  lat: number;
  lng: number;
}

export interface SpecialLoanProgramBadges {
  usdaRural100Financing: boolean;
  usdaRuralEligible?: boolean;
  lmiCraGrantEligible: boolean;
  craGrantAmountUsd: number;
  fnmaHomeReady3Percent: boolean;
  fhlmcHomePossible3Percent: boolean;
  stateHfaFirstHomeEligible: boolean;
  lakeviewNationalDpaEligible?: boolean;
  lakeviewGrantAmountUsd?: number;
  ohcsFlexLendingFirstHomeEligible?: boolean;
  ohcsGrantAmountUsd?: number;
  nhfDpaEligible?: boolean;
  targetedAreaGrantBonus: boolean;
}

export interface SyncedPropertyListing {
  id: string;
  formattedAddress: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  county?: string;
  geoid: string;
  coordinates: GeoCoordinate;
  price: number;
  originalPrice?: number;
  priceDropAmount?: number;
  priceDropPercent?: number;
  daysOnMarket: number;
  bedrooms: number;
  bathrooms: number;
  squareFootage: number;
  propertyType: 'Single Family' | 'Townhouse' | 'Condo' | 'Multi-Family' | 'Manufactured';
  hoaMonthlyFee: number;
  estimatedAnnualTax: number;
  estimatedAnnualInsurance: number;
  zillowUrl?: string;
  rentCastValuationScore?: number;
  specialPrograms: SpecialLoanProgramBadges;
  propertyNotes: string;
  isFavorite?: boolean;
  isGeoMapPluginDefault?: boolean;
  isCuratedForLead?: boolean;
  proactiveLoNote?: string;
  sellerConcessionSuggestedUsd?: number;
  sourceMasterFeedId?: string;
  lastSyncedTimestamp?: string;
  zillowStatus?: 'Active' | 'Pending' | 'Off-Market' | 'Price Change';
  zillowSweepDate?: string; // YYYY-MM-DD
  isZillowSweepNew?: boolean;
  zillowSweepBatchId?: string;
  zillowSweepNotes?: string[];
}

export interface BuyerDtiProfile {
  grossMonthlyIncome: number;
  totalMonthlyDebtObligations: number;
  availableDownPayment: number;
  targetInterestRate: number; // e.g., 6.25
  loanTermYears: number; // 30
  maxBackEndDtiPercent: number; // Default: 50.0%
  maxFrontEndDtiPercent: number; // Default: 36.0%
}

export interface BuyerPrequalificationResult {
  maxAllowableTotalMonthlyDebt: number;
  maxAllowableMonthlyHousingPayment: number;
  currentNonHousingDebt: number;
  estimatedMaxPurchasePrice: number;
  estimatedMaxLoanAmount: number;
  calculatedFrontEndDti: number;
  calculatedBackEndDti: number;
  qualifiesForPurchase: boolean;
}

export interface AreaListingRequestPayload {
  requestId: string;
  buyerName?: string;
  buyerEmail: string;
  buyerPhone?: string;
  targetCityOrZip: string;
  targetState: string;
  maxTargetMonthlyPayment: number;
  preferredDownPaymentProgram: 'USDA 100%' | 'LMI CRA Grant' | 'HomeReady 3%' | 'Lakeview National DPA' | 'OHCS Flex Lending FirstHome' | 'Any Low/No Down';
  buyerGrossMonthlyIncome: number;
  submittedAt: string;
  status: 'Pending Admin Review' | 'RentCast Pull Scheduled' | 'Synced To Map';
}

export interface MasterFeedSyncConfig {
  masterFeedEndpointUrl?: string;
  adminContactEmail: string; // fordmj@gmail.com
  assignedLoanOfficerName?: string;
  assignedAgentName?: string;
  autoSyncOnLoad: boolean;
  enableAreaListingRequests: boolean;
}

export interface FirstTimeHomebuyerGeoPluginProps {
  initialProperties?: SyncedPropertyListing[];
  initialBuyerProfile?: Partial<BuyerDtiProfile>;
  masterConfig?: Partial<MasterFeedSyncConfig>;
  defaultPropertyId?: string;
  onSetDefaultProperty?: (propertyId: string) => void;
  onOpenShareLinksModal?: (propertyId?: string) => void;
  onPropertySelect?: (property: SyncedPropertyListing) => void;
  onPrequalRecalculated?: (result: BuyerPrequalificationResult) => void;
  onAreaRequestSubmitted?: (request: AreaListingRequestPayload) => void;
  className?: string;
  isStandalone?: boolean;
  onOpenByokDrawer?: () => void;
  onOpenByokChecklist?: () => void;
}

// Backwards compatibility interfaces for existing codebase consumers
export interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  originalPrice?: number;
  priceDrop?: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt?: number;
  rentCastScore: number;
  estimatedRent?: number;
  estimatedMonthlyPayment: number;
  propertyType: 'Single Family' | 'Condo' | 'Townhome' | 'Multi-Family';
  imageUrl?: string;
  fipsGeoId: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  specialPrograms: {
    usdaRuralEligible: boolean;
    lmiGrantEligible: boolean;
    grantAmountEstimate: number;
    homeReadyEligible: boolean;
    homePossibleEligible: boolean;
  };
  zillowUrl?: string;
  mlsNumber?: string;
  daysOnMarket: number;
  listingStatus?: 'Active' | 'Price Reduced' | 'Pending';
}

export interface DtiCalculatorParams {
  grossMonthlyIncome: number;
  recurringMonthlyDebts: number;
  downPayment: number;
  targetInterestRate: number;
  loanTermYears: number;
  propertyTaxRate?: number;
  annualHomeownersInsurance?: number;
  pmiRate?: number;
}

export interface DtiAffordabilityResult {
  maxFrontEndPayment: number;
  maxBackEndPayment: number;
  maxAllowableMonthlyHousingPayment: number;
  maxPurchasePriceEnvelope: number;
  currentEstimatedPITI: number;
  actualFrontEndDti: number;
  actualBackEndDti: number;
  isFrontEndQualified: boolean;
  isBackEndQualified: boolean;
  isOverallQualified: boolean;
  requiredDownPayment: number;
  estimatedClosingCosts: number;
  pmiMonthly: number;
  propertyTaxMonthly: number;
  insuranceMonthly: number;
  principalAndInterestMonthly: number;
}

export interface LeadBuyerProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  preApprovalBudget: number;
  grossMonthlyIncome: number;
  monthlyDebts: number;
  savedDownPayment: number;
  preferredTargetZip?: string;
  favoritePropertyIds: string[];
  propertyNotes: Record<string, string>;
  lastUpdated: string;
}

export interface PriceAuditLog {
  id: string;
  timestamp: string;
  mlsNumber: string;
  address: string;
  oldPrice: number;
  newPrice: number;
  changeAmount: number;
  changePercentage: number;
  actionTaken: string;
  notifiedLeadCount: number;
}
