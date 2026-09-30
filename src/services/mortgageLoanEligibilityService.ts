/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • MORTGAGE LOAN ELIGIBILITY SERVICE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Service module for querying Lakeview National & OHCS Flex Lending criteria
 * and filtering GeoMap property listings based on down payment requirements.
 * ============================================================================
 */

import {
  MortgageLoanProduct,
  BuyerEligibilityCheckInput,
  BuyerEligibilityProductResult
} from '../types/mortgageLoanProducts';
import {
  DEFAULT_MORTGAGE_LOAN_PRODUCTS,
  checkBuyerProductEligibility
} from '../data/defaultMortgageLoanProducts';
import { SyncedPropertyListing } from '../types/firstTimeHomebuyerPlugin';
import {
  evaluateOregonOhcsFlexFirstHomeEligibility,
  resolveOregonCountyFannieMaeAmi,
  evaluateLakeviewNationalIncomeEligibility,
  evaluateUsdaRdIncomeEligibility,
  getOregonCountyUsdaRdData,
  USDA_RD_SCHEDULE_CONSTANTS,
  evaluateNhfDpaEligibility,
  NHF_PROGRAM_CONSTANTS
} from './geomapMortgageEngine';

export interface PropertyDownPaymentEligibility {
  propertyId: string;
  propertyPrice: number;
  qualifiesZeroDownPayment: boolean; // 100% LTV (USDA, Lakeview National, NHF, etc.)
  qualifiesLakeviewNational: boolean;
  lakeviewCountyName?: string;
  lakeviewCountyAmiUsd?: number;
  lakeviewCountyAmi140CapUsd?: number;
  lakeviewIncomeQualified?: boolean;
  lakeviewIneligibilityReason?: string;
  qualifiesOhcsFlexLending: boolean;
  ohcsCountyIncomeCapUsd?: number;
  ohcsCountyPriceCapUsd?: number;
  ohcsIncomeQualified?: boolean;
  ohcsGrantPercent?: number;
  ohcsGrantAmountUsd?: number;
  ohcsIneligibilityReason?: string;
  qualifiesUsdaRuralZone: boolean;
  usdaCountyName?: string;
  usdaIncomeCapUsd?: number;
  usdaIncomeQualified?: boolean;
  usdaIneligibilityReason?: string;
  qualifiesFannieMaeHomeReady: boolean;
  qualifiesFannieMae97Ltv: boolean;
  qualifiesNhfFallbackDpa: boolean;
  nhfCountyName?: string;
  nhfMaxPurchasePriceCapUsd?: number;
  nhfMaxLoanLimitUsd?: number;
  nhfIncomeCapUsd?: number;
  nhfIncomeQualified?: boolean;
  nhfPriceQualified?: boolean;
  nhfIneligibilityReason?: string;
  maxAvailableDpaGrantUsd: number;
  minEffectiveDownPaymentUsd: number;
  matchingProductNames: string[];
}

export interface ComprehensiveDpaPrescreenReport {
  propertyId?: string;
  propertyPrice: number;
  isZeroDownEligible: boolean;
  primaryDpaOption?: BuyerEligibilityProductResult;
  usdaRuralOption?: {
    isEligible: boolean;
    reason: string;
    productName: string;
  };
  homeReadyOption?: {
    isEligible: boolean;
    requiredDownPaymentUsd: number;
    reducedPmiSavingsUsdPerMonth: number;
    disqualificationReasons: string[];
  };
  fannie97Option?: {
    isEligible: boolean;
    requiredDownPaymentUsd: number;
    disqualificationReasons: string[];
  };
  universalNhfFallbackOption: {
    isEligible: boolean;
    estimatedGrantUsd: number;
    effectiveDownPaymentUsd: number;
    notes: string;
  };
  stackedGrantBreakdownUsd: number;
  recommendationSummary: string;
}

/**
 * Mortgage Loan Eligibility Service
 * Can be queried by the Real Estate GeoMap module, CRM lead pipelines, and DPA stackers.
 */
export class MortgageLoanEligibilityService {
  private products: MortgageLoanProduct[];

  constructor(initialProducts: MortgageLoanProduct[] = DEFAULT_MORTGAGE_LOAN_PRODUCTS) {
    this.products = initialProducts;
  }

  /**
   * Returns all registered loan products
   */
  public getProducts(): MortgageLoanProduct[] {
    return this.products;
  }

  /**
   * Returns active/eligible products only
   */
  public getActiveProducts(): MortgageLoanProduct[] {
    return this.products.filter((p) => p.isEligibleActive);
  }

  /**
   * Updates product configuration
   */
  public updateProducts(newProducts: MortgageLoanProduct[]): void {
    this.products = newProducts;
  }

  /**
   * Evaluates buyer eligibility against all active mortgage loan products
   */
  public evaluateBuyer(input: BuyerEligibilityCheckInput): BuyerEligibilityProductResult[] {
    return this.getActiveProducts().map((product) =>
      checkBuyerProductEligibility(
        product,
        input.grossAnnualIncome,
        input.creditScore,
        input.areaMedianIncomeUsd,
        input.propertyState,
        input.propertyPrice,
        input.liquidDownPayment,
        input.isTargetedCensusTract,
        input
      )
    );
  }

  /**
   * Pre-screens property & buyer for USDA Rural Development 100% Zero Down Program
   */
  public prescreenUsdaRuralZone(property: SyncedPropertyListing, buyerInput?: BuyerEligibilityCheckInput) {
    const isUsdaZoneEligible = Boolean(
      property.specialPrograms.usdaRural100Financing ||
      property.specialPrograms.usdaRuralEligible
    );

    const isProgramActive = this.isProductActive('usda_rural_100_guaranteed');
    const hhCount = buyerInput?.householdSize || 1;
    const grossIncome = buyerInput?.grossAnnualIncome || 0;
    const usdaEval = evaluateUsdaRdIncomeEligibility(
      grossIncome,
      hhCount,
      property.county || property.fipsGeoId || property.city || property.formattedAddress,
      {
        isUsdaZoneEligible,
        isProgramActive
      }
    );

    let reason = 'Qualified USDA RD 100% Rural Financing Zone';
    if (!isUsdaZoneEligible) {
      reason = 'Property location is outside USDA designated rural geographic boundaries (ineligible metro core)';
    } else if (!usdaEval.isWithinIncomeLimit && grossIncome > 0) {
      reason = `Total household income ($${grossIncome.toLocaleString()}) exceeds USDA limit ($${usdaEval.applicableIncomeLimitUsd.toLocaleString()}) for household of ${hhCount} member(s) in ${usdaEval.countyName} County. (USDA updates schedules annually by 8/1).`;
    }

    return {
      isEligible: usdaEval.isEligible,
      isUsdaZoneEligible,
      isBuyerIncomeEligible: usdaEval.isWithinIncomeLimit,
      maxUsdaIncomeCapUsd: usdaEval.applicableIncomeLimitUsd,
      householdMemberCount: hhCount,
      householdTierLabel: usdaEval.householdTierLabel,
      countyName: usdaEval.countyName,
      reason,
      productName: 'USDA 100% Rural Development Guaranteed',
      scheduleUpdateNotes: usdaEval.scheduleUpdateNotes
    };
  }

  /**
   * Pre-screens borrower for Fannie Mae HomeReady 3% Down Conventional Program
   */
  public prescreenFannieMaeHomeReady(buyerInput: BuyerEligibilityCheckInput, propertyPrice: number = 400000) {
    const disqualificationReasons: string[] = [];

    if (!this.isProductActive('fnma_homeready_3pct')) {
      disqualificationReasons.push('Fannie Mae HomeReady program is disabled in configuration manager');
    }

    if (buyerInput.creditScore < 620) {
      disqualificationReasons.push(`FICO score (${buyerInput.creditScore}) is below 620 HomeReady threshold`);
    }

    const maxHomeReadyAmiCapUsd = buyerInput.areaMedianIncomeUsd > 0 
      ? (buyerInput.areaMedianIncomeUsd * 0.80) // 80% AMI cap
      : 85000;

    if (buyerInput.areaMedianIncomeUsd > 0 && buyerInput.grossAnnualIncome > maxHomeReadyAmiCapUsd && !buyerInput.isTargetedCensusTract) {
      disqualificationReasons.push(`Annual income ($${buyerInput.grossAnnualIncome.toLocaleString()}) exceeds HomeReady 80% AMI cap ($${Math.round(maxHomeReadyAmiCapUsd).toLocaleString()})`);
    }

    const isEligible = disqualificationReasons.length === 0;
    const requiredDownPaymentUsd = propertyPrice * 0.03; // 3% conventional down payment

    // Reduced PMI savings calculation (approx 25% coverage vs 35% standard = ~$85/mo savings on $400k)
    const estimatedPmiSavingsUsdPerMonth = isEligible ? Math.round((propertyPrice * 0.0025) / 12) : 0;

    return {
      isEligible,
      requiredDownPaymentUsd: Math.round(requiredDownPaymentUsd),
      reducedPmiSavingsUsdPerMonth: estimatedPmiSavingsUsdPerMonth,
      maxHomeReadyAmiCapUsd: Math.round(maxHomeReadyAmiCapUsd),
      disqualificationReasons
    };
  }

  /**
   * Pre-screens borrower for Fannie Mae Standard 97% LTV Conventional Program (First-Time Buyer, No Income Cap)
   */
  public prescreenFannieMae97Ltv(buyerInput: BuyerEligibilityCheckInput, propertyPrice: number = 400000) {
    const disqualificationReasons: string[] = [];

    if (!this.isProductActive('fnma_standard_97_ltv')) {
      disqualificationReasons.push('Fannie Mae Standard 97% LTV program is disabled in configuration manager');
    }

    if (buyerInput.creditScore < 620) {
      disqualificationReasons.push(`FICO score (${buyerInput.creditScore}) is below 620 threshold`);
    }

    const isFthb = buyerInput.isFirstTimeHomebuyer ?? true;
    if (!isFthb) {
      disqualificationReasons.push('At least one borrower must be a first-time homebuyer for Fannie Mae Standard 97% LTV');
    }

    const isEligible = disqualificationReasons.length === 0;
    const requiredDownPaymentUsd = propertyPrice * 0.03; // 3% conventional down payment

    return {
      isEligible,
      requiredDownPaymentUsd: Math.round(requiredDownPaymentUsd),
      disqualificationReasons
    };
  }

  /**
   * Universal Fallback Pre-screen: National Homebuyer Fund (NHF) Down Payment Assistance
   * Official programs: https://www.nhfloan.org/programs.html
   */
  public prescreenNationalHomebuyerFund(buyerInput: BuyerEligibilityCheckInput, propertyPrice: number) {
    const isActive = this.isProductActive('nhf_fha_zero_down_dpa');
    const nhfEval = evaluateNhfDpaEligibility(
      buyerInput.grossAnnualIncome,
      propertyPrice,
      'FHA',
      buyerInput.propertyState,
      {
        creditScore: buyerInput.creditScore,
        isProgramActive: isActive
      }
    );

    return {
      isEligible: nhfEval.isEligible,
      estimatedGrantUsd: nhfEval.maxEstimatedAssistanceUsd,
      effectiveDownPaymentUsd: nhfEval.netOutOfPocketDownPaymentUsd,
      applicableIncomeLimitUsd: nhfEval.applicableIncomeLimitUsd,
      maxAssistancePercent: nhfEval.maxAssistancePercent,
      officialUrl: nhfEval.officialProgramUrl,
      notes: nhfEval.isEligible
        ? `NHF FHA DPA available nationwide (up to 5% assistance, no FTHB requirement). Source: ${nhfEval.officialProgramUrl}`
        : (nhfEval.disqualificationReason || 'NHF product disabled or criteria not met.')
    };
  }

  /**
   * Generates a comprehensive pre-screen report evaluating primary DPA, USDA RD zone, HomeReady, and NHF Fallback
   */
  public getComprehensiveDpaPrescreenReport(
    buyerInput: BuyerEligibilityCheckInput,
    property?: SyncedPropertyListing
  ): ComprehensiveDpaPrescreenReport {
    const price = property ? property.price : buyerInput.propertyPrice;

    // 1. Primary DPA evaluation
    const buyerEvalResults = this.evaluateBuyer({ ...buyerInput, propertyPrice: price });
    const primaryDpaOption = buyerEvalResults.find(
      (r) => r.isEligible && (r.product.id === 'lakeview_national_bayview' || r.product.id === 'ohcs_flex_lending_firsthome')
    );

    // 2. USDA RD Zone evaluation
    const usdaResult = property ? this.prescreenUsdaRuralZone(property, buyerInput) : undefined;

    // 3. Fannie Mae HomeReady evaluation
    const homeReadyResult = this.prescreenFannieMaeHomeReady(buyerInput, price);

    // Fannie Mae Standard 97% LTV evaluation
    const fannie97Result = this.prescreenFannieMae97Ltv(buyerInput, price);

    // 4. Universal Fallback NHF DPA evaluation
    const nhfFallbackResult = this.prescreenNationalHomebuyerFund(buyerInput, price);

    const isZeroDown = Boolean(
      (primaryDpaOption && primaryDpaOption.product.maxLtvPercent >= 100) ||
      (usdaResult && usdaResult.isEligible) ||
      nhfFallbackResult.isEligible
    );

    let stackedGrantsUsd = (primaryDpaOption?.maxEstimatedGrantUsd || 0);
    if (property?.specialPrograms.lmiCraGrantEligible && property.specialPrograms.craGrantAmountUsd) {
      stackedGrantsUsd += property.specialPrograms.craGrantAmountUsd;
    }

    let summary = 'Standard financing required.';
    if (primaryDpaOption) {
      summary = `Qualified for ${primaryDpaOption.product.name} ($${primaryDpaOption.maxEstimatedGrantUsd.toLocaleString()} assistance).`;
    } else if (usdaResult?.isEligible) {
      summary = `Qualified for 100% Zero-Down USDA Rural Development Loan.`;
    } else if (nhfFallbackResult.isEligible) {
      summary = `Primary programs unavailable. Fallback to National Homebuyer Fund (NHF) FHA 0% Down DPA ($${nhfFallbackResult.estimatedGrantUsd.toLocaleString()} assistance).`;
    } else if (homeReadyResult.isEligible) {
      summary = `Qualified for Fannie Mae HomeReady 3% Down Conventional ($${homeReadyResult.requiredDownPaymentUsd.toLocaleString()} down) with reduced PMI.`;
    } else if (fannie97Result.isEligible) {
      summary = `Qualified for Fannie Mae Standard 97% LTV Conventional ($${fannie97Result.requiredDownPaymentUsd.toLocaleString()} down) for First-Time Buyers.`;
    }

    return {
      propertyId: property?.id,
      propertyPrice: price,
      isZeroDownEligible: isZeroDown,
      primaryDpaOption,
      usdaRuralOption: usdaResult ? {
        isEligible: usdaResult.isEligible,
        reason: usdaResult.reason,
        productName: usdaResult.productName
      } : undefined,
      homeReadyOption: {
        isEligible: homeReadyResult.isEligible,
        requiredDownPaymentUsd: homeReadyResult.requiredDownPaymentUsd,
        reducedPmiSavingsUsdPerMonth: homeReadyResult.reducedPmiSavingsUsdPerMonth,
        disqualificationReasons: homeReadyResult.disqualificationReasons
      },
      fannie97Option: {
        isEligible: fannie97Result.isEligible,
        requiredDownPaymentUsd: fannie97Result.requiredDownPaymentUsd,
        disqualificationReasons: fannie97Result.disqualificationReasons
      },
      universalNhfFallbackOption: nhfFallbackResult,
      stackedGrantBreakdownUsd: stackedGrantsUsd,
      recommendationSummary: summary
    };
  }

  /**
   * Evaluates down payment requirements for a specific property listing
   */
  public evaluatePropertyDownPayment(
    property: SyncedPropertyListing,
    borrowerIncomeOrInput?: number | BuyerEligibilityCheckInput
  ): PropertyDownPaymentEligibility {
    const price = property.price;
    const special = property.specialPrograms;

    // Resolve county and Fannie Mae AMI
    const countyIdentifier = property.county || property.fipsGeoId || property.geoid || property.city || property.formattedAddress;
    const countyAmiData = resolveOregonCountyFannieMaeAmi(countyIdentifier);
    const countyName = property.county || countyAmiData.countyName;
    const baseAmi = countyAmiData.baseAmiUsd;
    const maxAmiCap140 = countyAmiData.ami140CapUsd;

    // Extract annual income and credit score if supplied
    let annualIncome = 0;
    let borrowerCreditScore = 680;
    if (typeof borrowerIncomeOrInput === 'number') {
      annualIncome = borrowerIncomeOrInput;
    } else if (borrowerIncomeOrInput && typeof borrowerIncomeOrInput === 'object') {
      annualIncome = borrowerIncomeOrInput.grossAnnualIncome || 0;
      if (typeof borrowerIncomeOrInput.creditScore === 'number' && borrowerIncomeOrInput.creditScore > 0) {
        borrowerCreditScore = borrowerIncomeOrInput.creditScore;
      }
    }

    // Lakeview National 2026 Oregon Rules:
    // - All census tracts, cities, and all 36 counties in OR are eligible up to 2026 Fannie Mae 1-Unit conforming limit ($832,750).
    // - No designated high-cost areas in Oregon for 2026 per FHFA (all 36 counties share $832,750 baseline).
    // - Strictly requires: 1-Unit, Primary Residence, stick-built SFR, PUD (Townhouse), or Condominium.
    // - Disqualifies: Manufactured homes and Multi-Family (multi-unit) properties.
    // - Minimum credit score: 660+ FICO.
    // - All borrowers' combined annualized gross income must be <= 140% Fannie Mae Area Median Income (AMI) for the county.
    const isOregon = !property.state || property.state.toUpperCase() === 'OR' || property.formattedAddress?.includes(', OR');
    const isWithin2026ConformingLimit = price <= 832750;
    const isStickBuilt1Unit = property.propertyType === 'Single Family' || property.propertyType === 'Townhouse' || property.propertyType === 'Condo';
    const isNotManufacturedOrMulti = property.propertyType !== 'Manufactured' && property.propertyType !== 'Multi-Family';

    let lakeviewIncomeQualified = true;
    let lakeviewIneligibilityReason: string | undefined = undefined;

    if (borrowerCreditScore < 660) {
      lakeviewIncomeQualified = false;
      lakeviewIneligibilityReason = `Credit score (${borrowerCreditScore}) is below Lakeview National minimum requirement of 660 FICO.`;
    } else if (annualIncome > 0 && annualIncome > maxAmiCap140) {
      lakeviewIncomeQualified = false;
      lakeviewIneligibilityReason = `Combined annualized income ($${annualIncome.toLocaleString()}) exceeds 140% Fannie Mae AMI cap ($${maxAmiCap140.toLocaleString()}) for ${countyName} County.`;
    }

    const qualifiesLakeview = Boolean(
      (special.lakeviewNationalDpaEligible || isOregon) &&
      isWithin2026ConformingLimit &&
      isStickBuilt1Unit &&
      isNotManufacturedOrMulti &&
      lakeviewIncomeQualified &&
      this.isProductActive('lakeview_national_bayview')
    );

    const hhSize = typeof borrowerIncomeOrInput === 'object' && borrowerIncomeOrInput?.householdSize ? borrowerIncomeOrInput.householdSize : 1;
    const isVet = typeof borrowerIncomeOrInput === 'object' && borrowerIncomeOrInput?.isVeteranBorrower ? borrowerIncomeOrInput.isVeteranBorrower : false;
    const ohcsEval = evaluateOregonOhcsFlexFirstHomeEligibility({
      state: property.state,
      price: property.price,
      grossAnnualIncome: annualIncome,
      householdSize: hhSize,
      creditScore: borrowerCreditScore,
      isVeteranBorrower: isVet,
      fipsGeoId: property.fipsGeoId || property.geoid,
      geoid: property.geoid
    });

    const qualifiesOhcs = Boolean(
      isOregon &&
      ohcsEval.isEligible &&
      this.isProductActive('ohcs_flex_lending_firsthome')
    );

    const isUsdaZone = Boolean(
      special.usdaRural100Financing ||
      special.usdaRuralEligible
    );
    const isUsdaActive = this.isProductActive('usda_rural_100_guaranteed');
    const usdaEval = evaluateUsdaRdIncomeEligibility(
      annualIncome,
      hhSize,
      countyName || property.county || property.fipsGeoId || property.city || property.formattedAddress,
      {
        isUsdaZoneEligible: isUsdaZone,
        isProgramActive: isUsdaActive,
        creditScore: borrowerCreditScore
      }
    );

    const qualifiesUsda = Boolean(
      usdaEval.isEligible && isUsdaActive
    );

    const isNhfActive = this.isProductActive('nhf_fha_zero_down_dpa');
    const nhfEval = evaluateNhfDpaEligibility(
      annualIncome,
      price,
      'FHA',
      countyName || property.county || property.fipsGeoId || property.city || property.formattedAddress,
      {
        creditScore: borrowerCreditScore,
        isProgramActive: isNhfActive
      }
    );

    const qualifiesNhf = Boolean(
      nhfEval.isEligible && isNhfActive
    );
    const qualifiesHomeReady = this.isProductActive('fnma_homeready_3pct');
    const qualifiesFannieMae97Ltv = this.isProductActive('fnma_standard_97_ltv') && borrowerCreditScore >= 620;

    const qualifiesZeroDown = qualifiesLakeview || qualifiesOhcs || qualifiesUsda || qualifiesNhf;

    // Calculate maximum available grant
    let maxGrant = 0;
    if (qualifiesLakeview) {
      const lakeviewGrant = special.lakeviewGrantAmountUsd || Math.min(25000, Math.round(price * 0.05));
      maxGrant = Math.max(maxGrant, lakeviewGrant);
    }
    if (qualifiesOhcs) {
      const ohcsGrant = ohcsEval.grantAmountUsd || special.ohcsGrantAmountUsd || Math.round(price * 0.965 * 0.04);
      maxGrant = Math.max(maxGrant, ohcsGrant);
    }
    if (qualifiesNhf) {
      maxGrant = Math.max(maxGrant, nhfEval.maxEstimatedAssistanceUsd || Math.round(price * 0.035)); // 3.5%-5.0% NHF grant
    }
    if (special.lmiCraGrantEligible && special.craGrantAmountUsd) {
      maxGrant += special.craGrantAmountUsd; // CRA Grant stackable
    }

    const minRequiredDown = qualifiesZeroDown ? 0 : price * 0.03; // Standard 3% conv or 3.5% FHA
    const minEffectiveDownPaymentUsd = Math.max(0, minRequiredDown - maxGrant);

    const matchingProductNames: string[] = [];
    if (qualifiesLakeview) matchingProductNames.push('Lakeview National 100% DPA');
    if (qualifiesOhcs) matchingProductNames.push(`OHCS Flex FirstHome (${ohcsEval.grantPercent}% Grant)`);
    if (qualifiesUsda) matchingProductNames.push('USDA 100% Rural Development');
    if (qualifiesNhf) matchingProductNames.push('NHF DPA (Up to 5% Assistance)');
    if (qualifiesHomeReady) matchingProductNames.push('Fannie Mae HomeReady 3% Down');
    if (qualifiesFannieMae97Ltv) matchingProductNames.push('Fannie Mae Standard 97% LTV');
    if (special.lmiCraGrantEligible) matchingProductNames.push(`CRA $${(special.craGrantAmountUsd || 5000).toLocaleString()} Grant`);

    return {
      propertyId: property.id,
      propertyPrice: price,
      qualifiesZeroDownPayment: qualifiesZeroDown,
      qualifiesLakeviewNational: qualifiesLakeview,
      lakeviewCountyName: countyName,
      lakeviewCountyAmiUsd: baseAmi,
      lakeviewCountyAmi140CapUsd: maxAmiCap140,
      lakeviewIncomeQualified,
      lakeviewIneligibilityReason,
      qualifiesOhcsFlexLending: qualifiesOhcs,
      ohcsCountyIncomeCapUsd: ohcsEval.householdIncomeLimitUsd,
      ohcsCountyPriceCapUsd: ohcsEval.purchasePriceLimitUsd,
      ohcsIncomeQualified: ohcsEval.isWithinIncomeLimit,
      ohcsGrantPercent: ohcsEval.grantPercent,
      ohcsGrantAmountUsd: ohcsEval.grantAmountUsd,
      ohcsIneligibilityReason: ohcsEval.disqualificationReasons.length > 0 ? ohcsEval.disqualificationReasons.join('; ') : undefined,
      qualifiesUsdaRuralZone: qualifiesUsda,
      usdaCountyName: usdaEval.countyName,
      usdaIncomeCapUsd: usdaEval.applicableIncomeLimitUsd,
      usdaIncomeQualified: usdaEval.isWithinIncomeLimit,
      usdaIneligibilityReason: usdaEval.disqualificationReason,
      qualifiesFannieMaeHomeReady: qualifiesHomeReady,
      qualifiesFannieMae97Ltv: qualifiesFannieMae97Ltv,
      qualifiesNhfFallbackDpa: qualifiesNhf,
      nhfCountyName: nhfEval.countyName,
      nhfMaxPurchasePriceCapUsd: nhfEval.fhaMaxPurchasePriceLimitUsd,
      nhfMaxLoanLimitUsd: nhfEval.fhaMaxLoanLimitUsd,
      nhfIncomeCapUsd: nhfEval.applicableIncomeLimitUsd,
      nhfIncomeQualified: nhfEval.isWithinIncomeLimit,
      nhfPriceQualified: nhfEval.isWithinPurchasePriceLimit,
      nhfIneligibilityReason: nhfEval.disqualificationReason,
      maxAvailableDpaGrantUsd: maxGrant,
      minEffectiveDownPaymentUsd,
      matchingProductNames
    };
  }

  /**
   * Queries and filters property listings for GeoMap based on down payment criteria
   */
  public filterGeoMapPropertiesByDownPayment(
    properties: SyncedPropertyListing[],
    filterType: 'all' | 'zero_down' | 'lakeview_national' | 'ohcs_flex' | 'usda_zone' | 'homeready' | 'fannie97' | 'nhf_fallback' | 'max_grant' | 'under_5k_down',
    borrowerIncomeOrInput?: number | BuyerEligibilityCheckInput
  ): SyncedPropertyListing[] {
    return properties.filter((property) => {
      const evalResult = this.evaluatePropertyDownPayment(property, borrowerIncomeOrInput);

      switch (filterType) {
        case 'zero_down':
          return evalResult.qualifiesZeroDownPayment;
        case 'lakeview_national':
          return evalResult.qualifiesLakeviewNational;
        case 'ohcs_flex':
          return evalResult.qualifiesOhcsFlexLending;
        case 'usda_zone':
          return evalResult.qualifiesUsdaRuralZone;
        case 'homeready':
          return evalResult.qualifiesFannieMaeHomeReady;
        case 'fannie97':
          return evalResult.qualifiesFannieMae97Ltv;
        case 'nhf_fallback':
          return evalResult.qualifiesNhfFallbackDpa;
        case 'max_grant':
          return evalResult.maxAvailableDpaGrantUsd >= 10000;
        case 'under_5k_down':
          return evalResult.minEffectiveDownPaymentUsd <= 5000;
        case 'all':
        default:
          return true;
      }
    });
  }

  public setProductActive(productId: string, isActive: boolean): void {
    const p = this.products.find((prod) => prod.id === productId);
    if (p) {
      p.isEligibleActive = isActive;
    }
  }

  public isProductActive(productId: string): boolean {
    const p = this.products.find((prod) => prod.id === productId);
    return p ? p.isEligibleActive : true;
  }
}

// Singleton instance export for immediate app-wide usage
export const mortgageEligibilityService = new MortgageLoanEligibilityService();
