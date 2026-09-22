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

export interface PropertyDownPaymentEligibility {
  propertyId: string;
  propertyPrice: number;
  qualifiesZeroDownPayment: boolean; // 100% LTV (USDA, Lakeview National, NHF, etc.)
  qualifiesLakeviewNational: boolean;
  qualifiesOhcsFlexLending: boolean;
  qualifiesUsdaRuralZone: boolean;
  qualifiesFannieMaeHomeReady: boolean;
  qualifiesNhfFallbackDpa: boolean;
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
        input.isTargetedCensusTract
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

    let isBuyerIncomeEligible = true;
    let maxUsdaIncomeCapUsd = 125000;

    if (buyerInput && buyerInput.areaMedianIncomeUsd > 0) {
      maxUsdaIncomeCapUsd = (buyerInput.areaMedianIncomeUsd * 1.15); // 115% AMI cap
      isBuyerIncomeEligible = buyerInput.grossAnnualIncome <= maxUsdaIncomeCapUsd;
    }

    const isEligible = isUsdaZoneEligible && isBuyerIncomeEligible && this.isProductActive('usda_rural_100_guaranteed');

    let reason = 'Qualified USDA RD 100% Rural Financing Zone';
    if (!isUsdaZoneEligible) {
      reason = 'Property location is outside USDA designated rural geographic boundaries';
    } else if (!isBuyerIncomeEligible && buyerInput) {
      reason = `Household income ($${buyerInput.grossAnnualIncome.toLocaleString()}) exceeds USDA 115% AMI limit ($${Math.round(maxUsdaIncomeCapUsd).toLocaleString()})`;
    }

    return {
      isEligible,
      isUsdaZoneEligible,
      isBuyerIncomeEligible,
      maxUsdaIncomeCapUsd: Math.round(maxUsdaIncomeCapUsd),
      reason,
      productName: 'USDA 100% Rural Development Guaranteed'
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
   * Universal Fallback Pre-screen: National Homebuyer Fund (NHF) FHA 0% Down DPA
   */
  public prescreenNationalHomebuyerFund(buyerInput: BuyerEligibilityCheckInput, propertyPrice: number) {
    const isActive = this.isProductActive('nhf_fha_zero_down_dpa');
    const meetsCredit = buyerInput.creditScore >= 620;

    const isEligible = isActive && meetsCredit;
    const estimatedGrantUsd = Math.round(propertyPrice * 0.035); // 3.5% default NHF grant
    const effectiveDownPaymentUsd = Math.max(0, (propertyPrice * 0.035) - estimatedGrantUsd);

    return {
      isEligible,
      estimatedGrantUsd,
      effectiveDownPaymentUsd,
      notes: isEligible
        ? 'NHF FHA 0% Down DPA available as nationwide fallback option (up to 5% assistance).'
        : 'Credit score below 620 or NHF product disabled.'
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
      universalNhfFallbackOption: nhfFallbackResult,
      stackedGrantBreakdownUsd: stackedGrantsUsd,
      recommendationSummary: summary
    };
  }

  /**
   * Evaluates down payment requirements for a specific property listing
   */
  public evaluatePropertyDownPayment(property: SyncedPropertyListing): PropertyDownPaymentEligibility {
    const price = property.price;
    const special = property.specialPrograms;

    const qualifiesLakeview = Boolean(
      special.lakeviewNationalDpaEligible &&
      this.isProductActive('lakeview_national_bayview')
    );

    const qualifiesOhcs = Boolean(
      special.ohcsFlexLendingFirstHomeEligible &&
      this.isProductActive('ohcs_flex_lending_firsthome')
    );

    const qualifiesUsda = Boolean(
      (special.usdaRural100Financing || special.usdaRuralEligible) &&
      this.isProductActive('usda_rural_100_guaranteed')
    );

    const qualifiesNhf = this.isProductActive('nhf_fha_zero_down_dpa');
    const qualifiesHomeReady = this.isProductActive('fnma_homeready_3pct');

    const qualifiesZeroDown = qualifiesLakeview || qualifiesOhcs || qualifiesUsda || qualifiesNhf;

    // Calculate maximum available grant
    let maxGrant = 0;
    if (qualifiesLakeview && special.lakeviewGrantAmountUsd) {
      maxGrant = Math.max(maxGrant, special.lakeviewGrantAmountUsd);
    }
    if (qualifiesOhcs && special.ohcsGrantAmountUsd) {
      maxGrant = Math.max(maxGrant, special.ohcsGrantAmountUsd);
    }
    if (qualifiesNhf) {
      maxGrant = Math.max(maxGrant, price * 0.035); // 3.5% NHF grant
    }
    if (special.lmiCraGrantEligible && special.craGrantAmountUsd) {
      maxGrant += special.craGrantAmountUsd; // CRA Grant stackable
    }

    const minRequiredDown = qualifiesZeroDown ? 0 : price * 0.03; // Standard 3% conv or 3.5% FHA
    const minEffectiveDownPaymentUsd = Math.max(0, minRequiredDown - maxGrant);

    const matchingProductNames: string[] = [];
    if (qualifiesLakeview) matchingProductNames.push('Lakeview National 100% DPA');
    if (qualifiesOhcs) matchingProductNames.push('OHCS Flex Lending FirstHome');
    if (qualifiesUsda) matchingProductNames.push('USDA 100% Rural Development');
    if (qualifiesNhf) matchingProductNames.push('NHF FHA 0% Down DPA (Fallback)');
    if (qualifiesHomeReady) matchingProductNames.push('Fannie Mae HomeReady 3% Down');
    if (special.lmiCraGrantEligible) matchingProductNames.push(`CRA $${(special.craGrantAmountUsd || 5000).toLocaleString()} Grant`);

    return {
      propertyId: property.id,
      propertyPrice: price,
      qualifiesZeroDownPayment: qualifiesZeroDown,
      qualifiesLakeviewNational: qualifiesLakeview,
      qualifiesOhcsFlexLending: qualifiesOhcs,
      qualifiesUsdaRuralZone: qualifiesUsda,
      qualifiesFannieMaeHomeReady: qualifiesHomeReady,
      qualifiesNhfFallbackDpa: qualifiesNhf,
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
    filterType: 'all' | 'zero_down' | 'lakeview_national' | 'ohcs_flex' | 'usda_zone' | 'homeready' | 'nhf_fallback' | 'max_grant' | 'under_5k_down'
  ): SyncedPropertyListing[] {
    return properties.filter((property) => {
      const evalResult = this.evaluatePropertyDownPayment(property);

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
        case 'nhf_fallback':
          return evalResult.qualifiesNhfFallbackDpa;
        case 'max_grant':
          return evalResult.maxAvailableDpaGrantUsd > 5000;
        case 'under_5k_down':
          return evalResult.minEffectiveDownPaymentUsd <= 5000;
        case 'all':
        default:
          return true;
      }
    });
  }

  private isProductActive(productId: string): boolean {
    const p = this.products.find((prod) => prod.id === productId);
    return p ? p.isEligibleActive : true;
  }
}

// Singleton instance export for immediate app-wide usage
export const mortgageEligibilityService = new MortgageLoanEligibilityService();
