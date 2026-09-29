/**
 * @file censusTractLeadDensityService.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Census Tract Lead Density, Property Pinning, & Eligible LMI Hotspot Intelligence Service.
 * Computes spatial lead concentration, FFIEC LMI bracket overlays, DPA program stacking,
 * and 100% APR-compliant smart CTA outreach responses (focusing on zero-down USDA RD + 2-1 rate buydown,
 * Lakeview 100% + 2-1 rate buydown, and State HFA DPA stacking).
 */

export interface GeoMapPinnedProperty {
  id: string;
  address: string;
  cityName: string;
  stateCode: string;
  zipCode: string;
  priceUsd: number;
  beds: number;
  baths: number;
  sqft: number;
  propertyType: 'Single Family' | 'Townhome' | 'Condo' | 'Multi-Family (2-4 Units)';
  tractGeoId: string;
  tractName: string;
  countyName: string;
  lmiCategory: 'Low' | 'Moderate' | 'Middle' | 'Upper';
  amiPercentage: number;
  // DPA & Mortgage Program Eligibility
  isLmiEligible: boolean;
  isLakeviewEligible: boolean;
  isUsdaRuralEligible: boolean;
  isStateBondEligible: boolean;
  allowsRateBuydownStacking: boolean; // Stacking 2-1 rate buydown with low/no down payment
  topProgramStack: string;
  downPaymentRequiredUsd: number; // 0 with Lakeview/USDA or 3% HomeReady
  netOutofPocketEstimateUsd: number; // Down Payment + Closing Costs (after DPA and seller credits)
  // Payment Affordability & Smart CTAs (100% APR-Compliant: No ungrounded rate/payment quotes)
  affordabilityStrategies: string[];
  smartCallToAction: string;
  suggestedOutreachScript: string;
  microScrapeQuery: {
    andTerms: string[];
    orTerms: string[];
    notTerms: string[];
  };
  matchedLeadsCount: number;
  savedToWorkspaceMemory: boolean;
  savedAtTimestamp?: number;
  customNotes?: string;
  pinStatus: 'lead_matched' | 'ready_to_outreach' | 'active_thread' | 'watching';
  coordinates?: { xPercent: number; yPercent: number };
}

export interface CensusTractLeadCluster {
  tractGeoId: string; // 11-digit FIPS e.g. '41039000500'
  tractName: string; // e.g. 'Census Tract 5.00'
  countyName: string; // e.g. 'Lane County'
  stateCode: string; // e.g. 'OR'
  cityName: string; // e.g. 'Eugene'
  primaryZipCode: string; // e.g. '97402'
  zipCodes: string[]; // e.g. ['97402', '97401']
  lmiCategory: 'Low' | 'Moderate' | 'Middle' | 'Upper';
  isLmiEligible: boolean; // true if Low or Moderate (<80% AMI)
  isUsdaRuralEligible: boolean;
  isLakeviewEligible: boolean; // true if <=140% AMI and 1-unit conforming
  allowsRateBuydownStacking: boolean; // true for all eligible low/no down payment tracts
  leadCount: number;
  highIntentCount: number;
  leadDensityScore: number; // 0 to 100
  thermalColorHex: string; // for heatmap rendering
  medianHouseholdIncomeUsd: number;
  areaMedianIncomeUsd: number;
  amiPercentage: number;
  avgTargetHomePriceUsd: number;
  topMatchedProgram: string;
  sampleProperties: GeoMapPinnedProperty[];
  activeLeadsSample: Array<{
    title: string;
    author: string;
    snippet: string;
    intentScore: number;
    platform: string;
  }>;
  recommendedCampaignQuery: {
    andTerms: string[];
    orTerms: string[];
    notTerms: string[];
  };
}

export type HeatmapMetricMode = 'lead_density' | 'household_income' | 'property_value';

export interface HeatmapFilterOptions {
  stateCode: string;
  countyId?: string;
  countyName?: string;
  zipCode?: string;
  metricMode?: HeatmapMetricMode;
  activeLayer: 'all_density' | 'lmi_only' | 'usda_only' | 'lakeview_only' | 'buydown_stack_only';
  minLeadCountThreshold: number;
  minDensityScore: number;
}

/**
 * Palette generator for thermal lead density
 */
export function getDensityColor(score: number, isLmi: boolean): string {
  if (score >= 80) return isLmi ? '#ec4899' : '#f43f5e'; // Flame Hot Pink/Red
  if (score >= 60) return isLmi ? '#a855f7' : '#f97316'; // High Purple/Orange
  if (score >= 40) return isLmi ? '#6366f1' : '#eab308'; // Medium Indigo/Amber
  if (score >= 20) return isLmi ? '#06b6d4' : '#10b981'; // Moderate Cyan/Emerald
  return '#3b82f6'; // Low Blue
}

/**
 * Dynamic Heatmap Palette Resolver for all 3 Visualization Modes
 */
export function getHeatmapMetricColor(cluster: CensusTractLeadCluster, mode: HeatmapMetricMode): string {
  if (mode === 'household_income') {
    const amiPct = cluster.amiPercentage;
    if (amiPct <= 50) return '#f43f5e'; // Low Income (<50% AMI) - Red/Rose DPA Priority
    if (amiPct <= 80) return '#ec4899'; // Moderate Income (50-80% AMI) - Pink/Magenta Prime First-Time Buyer
    if (amiPct <= 115) return '#a855f7'; // Moderate-to-Middle (80-115% AMI) - Purple USDA/Bond
    if (amiPct <= 140) return '#06b6d4'; // Middle (115-140% AMI) - Cyan Lakeview 100%
    return '#10b981'; // Upper (>140% AMI) - Emerald
  }

  if (mode === 'property_value') {
    const price = cluster.avgTargetHomePriceUsd;
    if (price <= 350000) return '#10b981'; // Deep Emerald: High Affordability Starter Homes
    if (price <= 425000) return '#06b6d4'; // Cyan: Prime FHA 3.5% & DPA Target
    if (price <= 550000) return '#eab308'; // Amber: Median Single Family
    if (price <= 750000) return '#f97316'; // Orange: Upper Mid-Tier Conforming
    return '#ec4899'; // Pink/Rose: High-Cost Conforming Ceiling ($832k+)
  }

  return getDensityColor(cluster.leadDensityScore, cluster.isLmiEligible);
}

const PINNED_PROPERTIES_STORAGE_KEY = 'vantage_geomap_pinned_properties_v1';

/**
 * Generate synthetic realistic Census Tract Clusters with Sample High-Interest Properties
 */
export function generateCensusTractClustersForRegion(stateCode: string, countyName?: string): CensusTractLeadCluster[] {
  const code = (stateCode || 'OR').toUpperCase();
  
  if (code === 'OR') {
    return [
      {
        tractGeoId: '41039000500',
        tractName: 'Census Tract 5.00 (Bethel / West Eugene)',
        countyName: 'Lane County',
        stateCode: 'OR',
        cityName: 'Eugene',
        primaryZipCode: '97402',
        zipCodes: ['97402', '97401', '97404'],
        lmiCategory: 'Moderate',
        isLmiEligible: true,
        isUsdaRuralEligible: false,
        isLakeviewEligible: true,
        allowsRateBuydownStacking: true,
        leadCount: 18,
        highIntentCount: 16,
        leadDensityScore: 96,
        thermalColorHex: '#ec4899',
        medianHouseholdIncomeUsd: 54200,
        areaMedianIncomeUsd: 87500,
        amiPercentage: 62,
        avgTargetHomePriceUsd: 365000,
        topMatchedProgram: 'Lakeview National 100% Zero-Down + 2-1 Rate Buydown Stack',
        sampleProperties: [
          {
            id: 'prop_eug_01',
            address: '1420 W 11th Ave',
            cityName: 'Eugene',
            stateCode: 'OR',
            zipCode: '97402',
            priceUsd: 359000,
            beds: 3,
            baths: 2,
            sqft: 1340,
            propertyType: 'Single Family',
            tractGeoId: '41039000500',
            tractName: 'Census Tract 5.00',
            countyName: 'Lane County',
            lmiCategory: 'Moderate',
            amiPercentage: 62,
            isLmiEligible: true,
            isLakeviewEligible: true,
            isUsdaRuralEligible: false,
            isStateBondEligible: true,
            allowsRateBuydownStacking: true,
            topProgramStack: 'Lakeview National 100% Zero-Down + 2-1 Rate Buydown',
            downPaymentRequiredUsd: 0,
            netOutofPocketEstimateUsd: 1450,
            affordabilityStrategies: [
              'Lakeview National 100% Zero-Down Financing (Under 140% County AMI)',
              '2-1 Temporary Interest Rate Buydown (Seller-Funded Concession)',
              'Seller Concession Credits to Cover Closing Costs & Escrow Reserves'
            ],
            smartCallToAction: 'Connect for a complimentary 10-minute seller-concession & 2-1 buydown scenario map for Bethel homes.',
            suggestedOutreachScript: 'Hi there! Regarding homes in West Eugene (97402): This property qualifies for Lakeview National 100% zero-down financing. We can also structure a seller-funded 2-1 temporary rate buydown directly into your purchase contract to give you substantial payment comfort during your first two years. Would you like to connect for a quick 10-minute strategy session to review custom numbers?',
            microScrapeQuery: {
              andTerms: ['Eugene', '97402', 'first time buyer'],
              orTerms: ['Bethel', 'W 11th', 'starter home', 'renting', 'zero down', 'rate buydown'],
              notTerms: ['cash buyer', 'commercial']
            },
            matchedLeadsCount: 12,
            savedToWorkspaceMemory: false,
            pinStatus: 'lead_matched',
            coordinates: { xPercent: 28, yPercent: 44 }
          },
          {
            id: 'prop_eug_02',
            address: '2845 Barger Dr',
            cityName: 'Eugene',
            stateCode: 'OR',
            zipCode: '97402',
            priceUsd: 379000,
            beds: 3,
            baths: 2,
            sqft: 1480,
            propertyType: 'Single Family',
            tractGeoId: '41039000500',
            tractName: 'Census Tract 5.00',
            countyName: 'Lane County',
            lmiCategory: 'Moderate',
            amiPercentage: 62,
            isLmiEligible: true,
            isLakeviewEligible: true,
            isUsdaRuralEligible: false,
            isStateBondEligible: true,
            allowsRateBuydownStacking: true,
            topProgramStack: 'OHCS Flex Lending 5% DPA + 2-1 Rate Buydown Stack',
            downPaymentRequiredUsd: 0,
            netOutofPocketEstimateUsd: 1980,
            affordabilityStrategies: [
              'OHCS Flex Lending 5% Down Payment Assistance Stack',
              '2-1 Temporary Rate Buydown Funded by Seller Concessions',
              'Seller Credit Structuring for Closing Reserves'
            ],
            smartCallToAction: 'Let’s look at how seller credits and 2-1 rate buydowns stack with OHCS DPA to eliminate upfront cash.',
            suggestedOutreachScript: 'Great news for Barger Dr area buyers: this 3-bed home qualifies for 100% combined financing via OHCS Flex DPA paired with a seller-funded 2-1 rate buydown. As a local loan officer, I can help you structure these benefits directly in your offer for maximum initial payment relief. Happy to share our 1-page Eugene buyer blueprint if helpful!',
            microScrapeQuery: {
              andTerms: ['Eugene', 'Barger', '97402'],
              orTerms: ['OHCS', 'down payment assistance', 'starter home', 'buydown'],
              notTerms: ['wholesaler']
            },
            matchedLeadsCount: 8,
            savedToWorkspaceMemory: false,
            pinStatus: 'ready_to_outreach',
            coordinates: { xPercent: 32, yPercent: 38 }
          }
        ],
        activeLeadsSample: [
          {
            title: 'West Eugene starter homes vs Lakeview 100% zero down',
            author: 'u/EugeneHomeSeeker_26',
            snippet: 'Tired of paying high rent near Bethel (ZIP 97402). Looking for LOs who know how to stack Lakeview 100% zero down with a 2-1 rate buydown.',
            intentScore: 98,
            platform: 'Reddit (r/Eugene)'
          },
          {
            title: 'Pre-approval with 630 credit in Eugene',
            author: 'u/EugeneRenter99',
            snippet: 'Can we buy near Barger Dr with 0% down and seller credits for a 2-1 buydown in 97402?',
            intentScore: 94,
            platform: 'Oregon Housing Forum'
          }
        ],
        recommendedCampaignQuery: {
          andTerms: ['Eugene', '97402', 'first-time buyer'],
          orTerms: ['Bethel', 'OHCS Flex', 'Lakeview 100%', '2-1 buydown', 'zero down'],
          notTerms: ['cash buyer', 'wholesaler', 'commercial']
        }
      },
      {
        tractGeoId: '41051004902',
        tractName: 'Census Tract 49.02 (Lents / SE Portland)',
        countyName: 'Multnomah County',
        stateCode: 'OR',
        cityName: 'Portland',
        primaryZipCode: '97266',
        zipCodes: ['97266', '97206', '97236'],
        lmiCategory: 'Low',
        isLmiEligible: true,
        isUsdaRuralEligible: false,
        isLakeviewEligible: true,
        allowsRateBuydownStacking: true,
        leadCount: 22,
        highIntentCount: 20,
        leadDensityScore: 98,
        thermalColorHex: '#ec4899',
        medianHouseholdIncomeUsd: 48900,
        areaMedianIncomeUsd: 114400,
        amiPercentage: 43,
        avgTargetHomePriceUsd: 385000,
        topMatchedProgram: 'Lakeview National 100% Zero-Down + 2-1 Rate Buydown',
        sampleProperties: [
          {
            id: 'prop_pdx_01',
            address: '5620 SE 87th Ave',
            cityName: 'Portland',
            stateCode: 'OR',
            zipCode: '97266',
            priceUsd: 389000,
            beds: 3,
            baths: 2,
            sqft: 1280,
            propertyType: 'Single Family',
            tractGeoId: '41051004902',
            tractName: 'Census Tract 49.02 (Lents)',
            countyName: 'Multnomah County',
            lmiCategory: 'Low',
            amiPercentage: 43,
            isLmiEligible: true,
            isLakeviewEligible: true,
            isUsdaRuralEligible: false,
            isStateBondEligible: true,
            allowsRateBuydownStacking: true,
            topProgramStack: 'Lakeview National 100% + 2-1 Rate Buydown Stack',
            downPaymentRequiredUsd: 0,
            netOutofPocketEstimateUsd: 1200,
            affordabilityStrategies: [
              'Lakeview National 100% Financing (Under 140% AMI Cap)',
              '2-1 Temporary Rate Buydown Funded by Seller Concessions',
              'HomeReady 3% Down Payment Assistance Alternative'
            ],
            smartCallToAction: 'Schedule a 10-minute loan consultation to model seller credits & 2-1 rate buydown stacking.',
            suggestedOutreachScript: 'For buyers exploring SE Portland (97266): This property qualifies for 100% zero-down Lakeview financing. We also specialize in structuring seller-paid 2-1 temporary rate buydowns to substantially ease initial monthly cash flow during your first two years. Let’s connect for a brief 10-minute strategy call to run your custom scenario!',
            microScrapeQuery: {
              andTerms: ['Portland', '97266', 'Lents'],
              orTerms: ['first time buyer', 'starter home', 'renting', 'SE Portland', '2-1 buydown'],
              notTerms: ['investor']
            },
            matchedLeadsCount: 15,
            savedToWorkspaceMemory: false,
            pinStatus: 'active_thread',
            coordinates: { xPercent: 55, yPercent: 25 }
          }
        ],
        activeLeadsSample: [
          {
            title: 'Lents / SE 82nd starter home search under $400k (ZIP 97266)',
            author: 'u/PDX_Renter_99',
            snippet: 'Trying to stop paying high rent in SE Portland. Heard Lents (97266) qualifies for Lakeview 100% zero down and 2-1 seller rate buydowns.',
            intentScore: 97,
            platform: 'Reddit (r/Portland)'
          }
        ],
        recommendedCampaignQuery: {
          andTerms: ['Portland', '97266', 'first-time buyer'],
          orTerms: ['Lents', 'Lakeview 100%', 'OHCS FirstHome', '2-1 buydown', 'down payment assistance'],
          notTerms: ['investor', 'cash buyer']
        }
      },
      {
        tractGeoId: '41017001801',
        tractName: 'Census Tract 18.01 (Redmond North / Central)',
        countyName: 'Deschutes County',
        stateCode: 'OR',
        cityName: 'Redmond',
        primaryZipCode: '97756',
        zipCodes: ['97756', '97759'],
        lmiCategory: 'Moderate',
        isLmiEligible: true,
        isUsdaRuralEligible: true,
        isLakeviewEligible: true,
        allowsRateBuydownStacking: true,
        leadCount: 14,
        highIntentCount: 12,
        leadDensityScore: 84,
        thermalColorHex: '#a855f7',
        medianHouseholdIncomeUsd: 68400,
        areaMedianIncomeUsd: 96300,
        amiPercentage: 71,
        avgTargetHomePriceUsd: 420000,
        topMatchedProgram: 'USDA Rural 100% Zero-Down + 2-1 Rate Buydown Stack',
        sampleProperties: [
          {
            id: 'prop_rdm_01',
            address: '742 NW Birch Ave',
            cityName: 'Redmond',
            stateCode: 'OR',
            zipCode: '97756',
            priceUsd: 415000,
            beds: 3,
            baths: 2,
            sqft: 1520,
            propertyType: 'Single Family',
            tractGeoId: '41017001801',
            tractName: 'Census Tract 18.01',
            countyName: 'Deschutes County',
            lmiCategory: 'Moderate',
            amiPercentage: 71,
            isLmiEligible: true,
            isLakeviewEligible: true,
            isUsdaRuralEligible: true,
            isStateBondEligible: true,
            allowsRateBuydownStacking: true,
            topProgramStack: 'USDA 100% Zero-Down Rural Loan + 2-1 Rate Buydown',
            downPaymentRequiredUsd: 0,
            netOutofPocketEstimateUsd: 1850,
            affordabilityStrategies: [
              'USDA 100% Zero-Down Financing (Eligible Rural Census Tract)',
              '2-1 Temporary Rate Buydown Funded by Seller Concessions',
              'Reduced Monthly Mortgage Insurance Guarantee vs Conventional/FHA'
            ],
            smartCallToAction: 'Request a Central Oregon USDA 0% down + 2-1 buydown comparison strategy sheet with a local loan officer.',
            suggestedOutreachScript: 'Exploring Central Oregon options outside Bend? Redmond (97756) is 100% USDA RD zero-down eligible with reduced monthly mortgage insurance. By pairing zero down with a seller-funded 2-1 rate buydown, you get the double benefit of zero down payment and reduced initial monthly interest rates. Let’s jump on a quick 10-minute review to see how this fits your budget goals!',
            microScrapeQuery: {
              andTerms: ['Redmond', '97756', 'homebuyer'],
              orTerms: ['USDA', 'zero down', 'Bend commuter', '2-1 buydown', 'first time buyer'],
              notTerms: ['cash']
            },
            matchedLeadsCount: 9,
            savedToWorkspaceMemory: false,
            pinStatus: 'ready_to_outreach',
            coordinates: { xPercent: 70, yPercent: 62 }
          }
        ],
        activeLeadsSample: [
          {
            title: 'Buying in Redmond to commute to Bend with 0% down',
            author: 'u/CentralOR_Commuter',
            snippet: 'Looking at Redmond (97756) for USDA 100% zero down or Lakeview DPA paired with seller-paid 2-1 rate buydowns.',
            intentScore: 95,
            platform: 'BiggerPockets (Central Oregon)'
          }
        ],
        recommendedCampaignQuery: {
          andTerms: ['Redmond', '97756', '0% down'],
          orTerms: ['USDA Rural', 'OHCS', 'Lakeview', '2-1 buydown', 'Deschutes', 'starter home'],
          notTerms: ['commercial', 'short term rental']
        }
      },
      {
        tractGeoId: '41047001200',
        tractName: 'Census Tract 12.00 (Four Corners / East Salem)',
        countyName: 'Marion County',
        stateCode: 'OR',
        cityName: 'Salem',
        primaryZipCode: '97301',
        zipCodes: ['97301', '97317'],
        lmiCategory: 'Low',
        isLmiEligible: true,
        isUsdaRuralEligible: false,
        isLakeviewEligible: true,
        allowsRateBuydownStacking: true,
        leadCount: 16,
        highIntentCount: 14,
        leadDensityScore: 92,
        thermalColorHex: '#ec4899',
        medianHouseholdIncomeUsd: 51200,
        areaMedianIncomeUsd: 82100,
        amiPercentage: 62,
        avgTargetHomePriceUsd: 345000,
        topMatchedProgram: 'Lakeview National 100% Zero-Down + 2-1 Rate Buydown Stack',
        sampleProperties: [
          {
            id: 'prop_slm_01',
            address: '2150 State St',
            cityName: 'Salem',
            stateCode: 'OR',
            zipCode: '97301',
            priceUsd: 339000,
            beds: 3,
            baths: 1.5,
            sqft: 1220,
            propertyType: 'Single Family',
            tractGeoId: '41047001200',
            tractName: 'Census Tract 12.00',
            countyName: 'Marion County',
            lmiCategory: 'Low',
            amiPercentage: 62,
            isLmiEligible: true,
            isLakeviewEligible: true,
            isUsdaRuralEligible: false,
            isStateBondEligible: true,
            allowsRateBuydownStacking: true,
            topProgramStack: 'Lakeview 100% Zero-Down + 2-1 Rate Buydown Stack',
            downPaymentRequiredUsd: 0,
            netOutofPocketEstimateUsd: 950,
            affordabilityStrategies: [
              'Lakeview National 100% Zero-Down Financing',
              '2-1 Temporary Rate Buydown via Seller Credits',
              'FHA 3.5% + State Bond DPA Alternative'
            ],
            smartCallToAction: 'Reach out to model out 2-1 buydowns and check your Marion County zero-down eligibility.',
            suggestedOutreachScript: 'In East Salem (97301): Homes in this census tract qualify for 100% financing options. In addition, we can help you structure seller concessions to implement a 2-1 rate buydown for immediate payment comfort. Let’s do a quick numbers check to review your exact options!',
            microScrapeQuery: {
              andTerms: ['Salem', '97301', 'buyer'],
              orTerms: ['Four Corners', 'State St', 'first time home buyer', '2-1 buydown', 'zero down'],
              notTerms: ['landlord']
            },
            matchedLeadsCount: 11,
            savedToWorkspaceMemory: false,
            pinStatus: 'lead_matched',
            coordinates: { xPercent: 42, yPercent: 48 }
          }
        ],
        activeLeadsSample: [
          {
            title: 'Salem first time buyer assistance in 97301',
            author: 'u/SalemWorker_2026',
            snippet: 'State worker looking for zero down payment and 2-1 buydown options in East Salem.',
            intentScore: 92,
            platform: 'Reddit (r/SALEM)'
          }
        ],
        recommendedCampaignQuery: {
          andTerms: ['Salem', '97301', 'first time buyer'],
          orTerms: ['Marion County', 'OHCS', 'Lakeview 100%', '2-1 buydown', 'zero down'],
          notTerms: ['flippers', 'wholesale']
        }
      },
      {
        tractGeoId: '41029000800',
        tractName: 'Census Tract 8.00 (West Medford / Jackson)',
        countyName: 'Jackson County',
        stateCode: 'OR',
        cityName: 'Medford',
        primaryZipCode: '97501',
        zipCodes: ['97501', '97504'],
        lmiCategory: 'Low',
        isLmiEligible: true,
        isUsdaRuralEligible: false,
        isLakeviewEligible: true,
        allowsRateBuydownStacking: true,
        leadCount: 11,
        highIntentCount: 9,
        leadDensityScore: 76,
        thermalColorHex: '#a855f7',
        medianHouseholdIncomeUsd: 49800,
        areaMedianIncomeUsd: 79900,
        amiPercentage: 62,
        avgTargetHomePriceUsd: 325000,
        topMatchedProgram: 'FHA NHF 3.5% DPA + 2-1 Rate Buydown Stack',
        sampleProperties: [
          {
            id: 'prop_med_01',
            address: '810 W 10th St',
            cityName: 'Medford',
            stateCode: 'OR',
            zipCode: '97501',
            priceUsd: 319000,
            beds: 3,
            baths: 2,
            sqft: 1250,
            propertyType: 'Single Family',
            tractGeoId: '41029000800',
            tractName: 'Census Tract 8.00',
            countyName: 'Jackson County',
            lmiCategory: 'Low',
            amiPercentage: 62,
            isLmiEligible: true,
            isLakeviewEligible: true,
            isUsdaRuralEligible: false,
            isStateBondEligible: true,
            allowsRateBuydownStacking: true,
            topProgramStack: 'Jackson County FHA NHF DPA + 2-1 Rate Buydown',
            downPaymentRequiredUsd: 0,
            netOutofPocketEstimateUsd: 1100,
            affordabilityStrategies: [
              'FHA NHF 3.5% Down Payment Assistance',
              '2-1 Temporary Interest Rate Buydown (Seller-Funded)',
              'Seller-Paid Closing Cost Concessions'
            ],
            smartCallToAction: 'Let’s review how to pair Southern Oregon DPA with 2-1 buydowns for maximum affordability.',
            suggestedOutreachScript: 'In West Medford (97501): Homes qualify for 100% combined DPA financing. To keep monthly housing expenses comfortable, we can also assist in negotiating seller credits for a 2-1 temporary rate buydown. Happy to do a quick 10-minute numbers review whenever you’re ready!',
            microScrapeQuery: {
              andTerms: ['Medford', '97501', 'housing'],
              orTerms: ['first time buyer', 'Rogue Valley', '2-1 buydown', 'DPA'],
              notTerms: ['cash']
            },
            matchedLeadsCount: 7,
            savedToWorkspaceMemory: false,
            pinStatus: 'ready_to_outreach',
            coordinates: { xPercent: 38, yPercent: 82 }
          }
        ],
        activeLeadsSample: [
          {
            title: 'Medford starter home affordability (ZIP 97501)',
            author: 'u/RogueValleyFamily',
            snippet: 'Looking for 0% down programs and 2-1 rate buydowns in Medford Jackson County area under $350k.',
            intentScore: 89,
            platform: 'Facebook (Rogue Valley Housing)'
          }
        ],
        recommendedCampaignQuery: {
          andTerms: ['Medford', '97501', 'home purchase'],
          orTerms: ['Jackson County', 'FHA DPA', 'NHF Grant', '2-1 buydown', 'starter home'],
          notTerms: ['cash only']
        }
      }
    ];
  }

  // Generic generator for any other US state
  const baseTracts = [
    { tract: 'Tract 101.00', city: `${code} Metro Core`, zip: `${code}1001`, lmi: 'Low' as const, ami: 48, price: 340000, count: 17 },
    { tract: 'Tract 204.02', city: `${code} West Corridor`, zip: `${code}1002`, lmi: 'Moderate' as const, ami: 66, price: 375000, count: 14 },
    { tract: 'Tract 310.01', city: `${code} Rural North`, zip: `${code}1003`, lmi: 'Moderate' as const, ami: 74, price: 395000, count: 12 },
    { tract: 'Tract 405.00', city: `${code} East Heights`, zip: `${code}1004`, lmi: 'Middle' as const, ami: 92, price: 440000, count: 8 }
  ];

  return baseTracts.map((t, idx) => {
    const isLmi = t.ami <= 80;
    const isUsda = idx === 2;
    const density = Math.min(100, Math.round(t.count * 5.5));
    const tractId = `${code}999000${idx + 1}00`;

    return {
      tractGeoId: tractId,
      tractName: `Census ${t.tract} (${t.city})`,
      countyName: `${countyName || `${code} Central County`}`,
      stateCode: code,
      cityName: t.city,
      primaryZipCode: t.zip,
      zipCodes: [t.zip],
      lmiCategory: t.lmi,
      isLmiEligible: isLmi,
      isUsdaRuralEligible: isUsda,
      isLakeviewEligible: t.ami <= 140,
      allowsRateBuydownStacking: true,
      leadCount: t.count,
      highIntentCount: t.count - 2,
      leadDensityScore: density,
      thermalColorHex: getDensityColor(density, isLmi),
      medianHouseholdIncomeUsd: Math.round(t.ami * 850),
      areaMedianIncomeUsd: 85000,
      amiPercentage: t.ami,
      avgTargetHomePriceUsd: t.price,
      topMatchedProgram: isUsda
        ? 'USDA Rural 100% Zero-Down + 2-1 Rate Buydown'
        : isLmi
        ? 'Lakeview National 100% Zero-Down + 2-1 Rate Buydown'
        : 'State Bond HFA DPA + 2-1 Rate Buydown Stack',
      sampleProperties: [
        {
          id: `prop_${code.toLowerCase()}_0${idx + 1}`,
          address: `${100 * (idx + 1) + 24} Main St`,
          cityName: t.city,
          stateCode: code,
          zipCode: t.zip,
          priceUsd: t.price - 10000,
          beds: 3,
          baths: 2,
          sqft: 1350,
          propertyType: 'Single Family',
          tractGeoId: tractId,
          tractName: `Census ${t.tract}`,
          countyName: `${countyName || `${code} County`}`,
          lmiCategory: t.lmi,
          amiPercentage: t.ami,
          isLmiEligible: isLmi,
          isLakeviewEligible: t.ami <= 140,
          isUsdaRuralEligible: isUsda,
          isStateBondEligible: true,
          allowsRateBuydownStacking: true,
          topProgramStack: isUsda
            ? 'USDA 100% Zero-Down Rural + 2-1 Buydown'
            : isLmi
            ? 'Lakeview 100% Zero-Down + 2-1 Buydown'
            : 'HomeReady 3% Down + 2-1 Buydown',
          downPaymentRequiredUsd: (isUsda || isLmi) ? 0 : Math.round(t.price * 0.03),
          netOutofPocketEstimateUsd: isLmi ? 1250 : 2500,
          affordabilityStrategies: [
            isUsda ? 'USDA 100% Financing & Reduced Guarantee Fee' : 'State HFA Down Payment Assistance & Zero-Down Stack',
            '2-1 Temporary Rate Buydown Funded by Seller Concessions',
            'Custom Loan Officer Affordability Strategy'
          ],
          smartCallToAction: `Schedule a 10-minute consultation with a licensed mortgage loan officer to map out ${t.city} 2-1 buydown & DPA options.`,
          suggestedOutreachScript: `In ${t.city} (ZIP ${t.zip}): Buyers qualify for ${isLmi ? '100% zero-down financing options' : 'State HFA low down payment assistance'}. As a loan officer, I can help you structure a 2-1 rate buydown with seller credits to maximize your payment affordability from day one. Let’s do a quick 10-minute review!`,
          microScrapeQuery: {
            andTerms: [t.city, t.zip, 'first time buyer'],
            orTerms: ['down payment', 'starter home', '2-1 buydown', 'zero down'],
            notTerms: ['investor']
          },
          matchedLeadsCount: t.count - 3,
          savedToWorkspaceMemory: false,
          pinStatus: 'ready_to_outreach',
          coordinates: { xPercent: 20 + idx * 22, yPercent: 30 + idx * 15 }
        }
      ],
      activeLeadsSample: [
        {
          title: `${t.city} first-time homebuyer financing in ${t.zip}`,
          author: `u/${code}_Buyer_${idx + 1}`,
          snippet: `Looking for low down payment options and 2-1 rate buydown programs in ${t.city}. Can we qualify with low upfront cash?`,
          intentScore: 91,
          platform: 'Housing Forum'
        }
      ],
      recommendedCampaignQuery: {
        andTerms: [t.city, t.zip, 'first-time homebuyer'],
        orTerms: ['down payment assistance', 'zero down', '2-1 buydown'],
        notTerms: ['commercial', 'investor']
      }
    };
  });
}

/**
 * Service class with filtering, summary, and Pinned Properties management
 */
export class CensusTractLeadDensityService {
  /**
   * Filter clusters according to search query, layer, and mode
   */
  static filterTractClusters(
    clusters: CensusTractLeadCluster[],
    options: HeatmapFilterOptions
  ): CensusTractLeadCluster[] {
    return clusters
      .filter(c => {
        if (options.countyName && options.countyName !== 'all') {
          if (c.countyName.toLowerCase() !== options.countyName.toLowerCase()) return false;
        }

        if (options.zipCode && options.zipCode !== 'all') {
          if (!c.zipCodes.includes(options.zipCode) && c.primaryZipCode !== options.zipCode) return false;
        }

        if (c.leadCount < options.minLeadCountThreshold) return false;
        if (c.leadDensityScore < options.minDensityScore) return false;

        switch (options.activeLayer) {
          case 'lmi_only':
            return c.isLmiEligible;
          case 'usda_only':
            return c.isUsdaRuralEligible;
          case 'lakeview_only':
            return c.isLakeviewEligible;
          case 'buydown_stack_only':
            return c.allowsRateBuydownStacking;
          case 'all_density':
          default:
            return true;
        }
      })
      .sort((a, b) => b.leadDensityScore - a.leadDensityScore);
  }

  /**
   * Get unique counties and ZIP codes available for quick autocomplete chips
   */
  static getAvailableCountiesAndZips(clusters: CensusTractLeadCluster[]): {
    counties: string[];
    zipCodes: string[];
  } {
    const counties = Array.from(new Set(clusters.map(c => c.countyName))).sort();
    const zipCodes = Array.from(new Set(clusters.flatMap(c => c.zipCodes))).sort();
    return { counties, zipCodes };
  }

  /**
   * Calculate summary statistics for the heatmap viewport
   */
  static computeHeatmapSummary(clusters: CensusTractLeadCluster[]): {
    totalTracts: number;
    lmiTractsCount: number;
    totalLeadsInClusters: number;
    totalHighIntentLeads: number;
    highestDensityTract: CensusTractLeadCluster | null;
    avgAmiPercentage: number;
  } {
    if (clusters.length === 0) {
      return {
        totalTracts: 0,
        lmiTractsCount: 0,
        totalLeadsInClusters: 0,
        totalHighIntentLeads: 0,
        highestDensityTract: null,
        avgAmiPercentage: 0
      };
    }

    const lmiCount = clusters.filter(c => c.isLmiEligible).length;
    const totalLeads = clusters.reduce((acc, c) => acc + c.leadCount, 0);
    const totalHighIntent = clusters.reduce((acc, c) => acc + c.highIntentCount, 0);
    const avgAmi = Math.round(clusters.reduce((acc, c) => acc + c.amiPercentage, 0) / clusters.length);
    const highest = [...clusters].sort((a, b) => b.leadDensityScore - a.leadDensityScore)[0] || null;

    return {
      totalTracts: clusters.length,
      lmiTractsCount: lmiCount,
      totalLeadsInClusters: totalLeads,
      totalHighIntentLeads: totalHighIntent,
      highestDensityTract: highest,
      avgAmiPercentage: avgAmi
    };
  }

  /**
   * PINNED PROPERTIES PERSISTENCE & WORKSPACE MEMORY HELPERS
   */

  /**
   * Fetch all pinned properties from storage
   */
  static getPinnedProperties(stateCode?: string): GeoMapPinnedProperty[] {
    try {
      const raw = localStorage.getItem(PINNED_PROPERTIES_STORAGE_KEY);
      if (!raw) return [];
      const list: GeoMapPinnedProperty[] = JSON.parse(raw);
      if (stateCode) {
        return list.filter(p => p.stateCode.toUpperCase() === stateCode.toUpperCase());
      }
      return list;
    } catch (e) {
      console.warn('Failed to load pinned properties from storage', e);
      return [];
    }
  }

  /**
   * Save a property pin to local storage and return updated list
   */
  static savePinnedProperty(property: GeoMapPinnedProperty): GeoMapPinnedProperty[] {
    try {
      const existing = this.getPinnedProperties();
      const updatedProp = {
        ...property,
        savedToWorkspaceMemory: true,
        savedAtTimestamp: property.savedAtTimestamp || Date.now()
      };

      const filtered = existing.filter(p => p.id !== property.id);
      const next = [updatedProp, ...filtered];
      localStorage.setItem(PINNED_PROPERTIES_STORAGE_KEY, JSON.stringify(next));
      return next;
    } catch (e) {
      console.error('Failed to save pinned property', e);
      return [];
    }
  }

  /**
   * Remove a pinned property
   */
  static removePinnedProperty(propertyId: string): GeoMapPinnedProperty[] {
    try {
      const existing = this.getPinnedProperties();
      const next = existing.filter(p => p.id !== propertyId);
      localStorage.setItem(PINNED_PROPERTIES_STORAGE_KEY, JSON.stringify(next));
      return next;
    } catch (e) {
      console.error('Failed to remove pinned property', e);
      return [];
    }
  }

  /**
   * Format pinned property into Workspace Memory content block for Second Brain synchronization
   * 100% APR-Compliant: No rate quotes or payment estimates; focuses on 2-1 buydowns and loan officer affordability strategies.
   */
  static formatPropertyToWorkspaceMemory(prop: GeoMapPinnedProperty): {
    title: string;
    content: string;
    tags: string[];
  } {
    const content = `PROPERTY GEO-PIN INTELLIGENCE (100% APR-COMPLIANT):
Address: ${prop.address}, ${prop.cityName}, ${prop.stateCode} ${prop.zipCode} (${prop.countyName})
Listing Price: $${prop.priceUsd.toLocaleString()} (${prop.beds} Beds, ${prop.baths} Baths, ${prop.sqft.toLocaleString()} SqFt)
Property Type: ${prop.propertyType}
Census Tract: ${prop.tractName} (FIPS: ${prop.tractGeoId})
Income & LMI Bracket: ${prop.lmiCategory} LMI (${prop.amiPercentage}% AMI)
Mortgage & DPA Stack: ${prop.topProgramStack}
Down Payment Requirement: ${prop.downPaymentRequiredUsd === 0 ? '$0 Down Payment Required' : `$${prop.downPaymentRequiredUsd.toLocaleString()} Down Payment`}
2-1 Rate Buydown Stacking: ${prop.allowsRateBuydownStacking ? 'Eligible (Seller-Funded Temporary Rate Buydown)' : 'N/A'}

PAYMENT AFFORDABILITY STRATEGIES:
${prop.affordabilityStrategies.map(s => `• ${s}`).join('\n')}

COMPLIANT HIGH-CONVERTING CALL-TO-ACTION:
"${prop.smartCallToAction}"

AI TWO-WAY OUTREACH SCRIPT:
"${prop.suggestedOutreachScript}"

TARGETED BOOLEAN SCRAPE MATRIX:
AND: [${prop.microScrapeQuery.andTerms.join(', ')}]
OR: [${prop.microScrapeQuery.orTerms.join(', ')}]
NOT: [${prop.microScrapeQuery.notTerms.join(', ')}]

Saved to 2nd Brain Workspace Memory for loan officer lead discovery, conversational recall, and compliant thread replies without quoting rates/APRs.`;

    return {
      title: `Pinned Property: ${prop.address}, ${prop.cityName} (${prop.topProgramStack})`,
      content,
      tags: ['pinned-property', 'geomap', prop.zipCode, prop.countyName, prop.lmiCategory.toLowerCase() + '-lmi', '2-1-buydown', 'dpa-stack']
    };
  }
}
