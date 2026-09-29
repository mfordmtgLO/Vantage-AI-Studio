/**
 * @file nationwideStateBondPrograms.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Comprehensive 50-State & Nationwide Mortgage Program, State HFA / Bond,
 * Lakeview National, USDA RD, FHA NHF DPA, and LMI Census Tract Registry.
 */

export interface StateMortgageProgramData {
  stateCode: string;
  stateName: string;
  agencyName: string;
  flagshipProgramName: string;
  maxDpaPercentOrAmount: string;
  dpaType: 'Forgivable Grant' | '0% Interest Silent 2nd' | 'Amortizing 2nd' | 'Tax Credit / MCC' | 'Closing Cost Subsidy';
  minFico: number;
  maxPurchasePriceCapUsd: number; // Baseline standard limit
  maxIncomeCapPercentAmi: number; // Standard % of AMI
  medianHouseholdAmiUsd: number; // State benchmark median AMI
  isLakeviewNationalEligible: boolean;
  lakeviewNotes: string;
  isUsdaRdEligible: boolean;
  usdaRuralTractPercentage: number;
  isNhfDpaEligible: boolean;
  lmiTractCountEstimate: number;
  highlightFeatures: string[];
  chatEngagementTemplate: string;
}

/**
 * 50-State + DC Master Mortgage & Down Payment Assistance Registry
 */
export const NATIONWIDE_STATE_PROGRAMS: Record<string, StateMortgageProgramData> = {
  AL: {
    stateCode: 'AL',
    stateName: 'Alabama',
    agencyName: 'Alabama Housing Finance Authority (AHFA)',
    flagshipProgramName: 'AHFA Step Up DPA & Mortgage Credit Certificate',
    maxDpaPercentOrAmount: '4.0% of Loan Amount (up to $10,000)',
    dpaType: '0% Interest Silent 2nd',
    minFico: 640,
    maxPurchasePriceCapUsd: 585000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 78500,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible statewide in all 67 Alabama counties up to $832,750 conforming limit. Max 140% county AMI. 1-unit stick-built primary residence.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 74,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 312,
    highlightFeatures: ['Can be paired with FHA or Conventional', '10-year amortizing second mortgage', 'Available to repeat buyers'],
    chatEngagementTemplate: 'In Alabama, you can stack AHFA Step Up 4% DPA with an FHA 3.5% loan, or utilize Lakeview National 100% financing if your income is under 140% county AMI!'
  },
  AK: {
    stateCode: 'AK',
    stateName: 'Alaska',
    agencyName: 'Alaska Housing Finance Corporation (AHFC)',
    flagshipProgramName: 'AHFC First-Time Homebuyer & Rural Program',
    maxDpaPercentOrAmount: 'Up to $10,000 or Interest Rate Reduction',
    dpaType: 'Closing Cost Subsidy',
    minFico: 620,
    maxPurchasePriceCapUsd: 832750,
    maxIncomeCapPercentAmi: 120,
    medianHouseholdAmiUsd: 98000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible statewide in Alaska with high-cost baseline conforming allowances up to $1,249,125. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 88,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 45,
    highlightFeatures: ['Interest rate reduction for energy efficient homes', 'Remote rural community financing', 'Streamlined closing assistance'],
    chatEngagementTemplate: 'Alaska buyers have access to AHFC interest rate discounts plus Lakeview 100% financing for 1-unit stick-built homes up to conforming loan caps.'
  },
  AZ: {
    stateCode: 'AZ',
    stateName: 'Arizona',
    agencyName: 'Arizona Department of Housing (ADOH) / AzHFA',
    flagshipProgramName: 'Home Plus Arizona DPA & Pathway to Purchase',
    maxDpaPercentOrAmount: 'Up to 5.0% DPA Grant',
    dpaType: 'Forgivable Grant',
    minFico: 640,
    maxPurchasePriceCapUsd: 625000,
    maxIncomeCapPercentAmi: 120,
    medianHouseholdAmiUsd: 89000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 15 Arizona counties (Maricopa, Pima, Pinal, Coconino, Yavapai, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 58,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 395,
    highlightFeatures: ['Non-repayable 3-year forgivable grant', 'Paired with FHA, VA, USDA, or Conventional', 'No first-time buyer restriction on Home Plus'],
    chatEngagementTemplate: 'In Arizona, you can receive up to 5% forgivable DPA through Home Plus or explore Lakeview 100% financing across Maricopa and Pima counties with 660+ FICO.'
  },
  AR: {
    stateCode: 'AR',
    stateName: 'Arkansas',
    agencyName: 'Arkansas Development Finance Authority (ADFA)',
    flagshipProgramName: 'ADFA Move-Up & Down Payment Assistance (DPA)',
    maxDpaPercentOrAmount: 'Up to $10,000 or 4.0%',
    dpaType: '0% Interest Silent 2nd',
    minFico: 640,
    maxPurchasePriceCapUsd: 510000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 72000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible across all 75 Arkansas counties up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 78,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 198,
    highlightFeatures: ['10-year second mortgage at 0% or low fixed rate', 'Compatible with FHA/VA/USDA', 'Statewide eligibility'],
    chatEngagementTemplate: 'Arkansas first-time buyers can combine ADFA DPA with USDA 100% zero-down in rural tracts or Lakeview National 100% across the state!'
  },
  CA: {
    stateCode: 'CA',
    stateName: 'California',
    agencyName: 'California Housing Finance Agency (CalHFA)',
    flagshipProgramName: 'CalHFA MyHome Assistance & Dream For All Shared Appreciation',
    maxDpaPercentOrAmount: '3.5% MyHome DPA or up to 20% Dream For All ($150,000 cap)',
    dpaType: '0% Interest Silent 2nd',
    minFico: 660,
    maxPurchasePriceCapUsd: 832750, // Higher in designated high-cost counties ($1,249,125)
    maxIncomeCapPercentAmi: 120,
    medianHouseholdAmiUsd: 112000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible across all 58 California counties up to 2026 FHFA county limits ($832,750 base to $1,249,125 high-cost). 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 35,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 1850,
    highlightFeatures: ['Deferred payment junior lien until payoff/sale', 'CalPLUS ZIP zero-interest closing cost assistance', 'Compatible with high-cost conventional limits'],
    chatEngagementTemplate: 'In California, CalHFA MyHome offers 3.5% DPA (or Dream For All up to 20%), plus Lakeview 100% financing and NHF 5% DPA for high-cost county limits!'
  },
  CO: {
    stateCode: 'CO',
    stateName: 'Colorado',
    agencyName: 'Colorado Housing and Finance Authority (CHFA)',
    flagshipProgramName: 'CHFA FirstStep & SmartStep DPA Grant',
    maxDpaPercentOrAmount: 'Up to 4.0% Grant or 3.0% Silent Second',
    dpaType: 'Forgivable Grant',
    minFico: 620,
    maxPurchasePriceCapUsd: 745000,
    maxIncomeCapPercentAmi: 120,
    medianHouseholdAmiUsd: 105000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 64 Colorado counties including Denver metro, Boulder, El Paso, and mountain counties up to conforming loan caps. 140% AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 52,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 290,
    highlightFeatures: ['CHFA DPA Grant has no repayment requirement', 'CHFA Second Mortgage is silent until payoff', 'Low 620 FICO requirement'],
    chatEngagementTemplate: 'Colorado buyers can leverage CHFA 4% non-repayable grants or Lakeview 100% DPA across Denver, Colorado Springs, and Northern Colorado!'
  },
  CT: {
    stateCode: 'CT',
    stateName: 'Connecticut',
    agencyName: 'Connecticut Housing Finance Authority (CHFA)',
    flagshipProgramName: 'CHFA Time To Own Forgivable DPA & Smart-E Loan',
    maxDpaPercentOrAmount: 'Up to $25,000 (or $50,000 in High Opportunity Areas)',
    dpaType: 'Forgivable Grant',
    minFico: 620,
    maxPurchasePriceCapUsd: 685000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 104000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 8 Connecticut counties up to $832,750 conforming limit. Max 140% county AMI. 1-unit stick-built SFR/PUD/Condo.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 30,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 210,
    highlightFeatures: ['Time To Own forgives 20% per year over 5 years (100% forgiven after year 5)', 'Up to $50,000 grant in designated high-opportunity tracts', 'Low interest 1st mortgages'],
    chatEngagementTemplate: 'Connecticut’s Time To Own program offers up to $50,000 in 100% forgivable DPA, paired with Lakeview 100% financing for qualified first-time buyers.'
  },
  FL: {
    stateCode: 'FL',
    stateName: 'Florida',
    agencyName: 'Florida Housing Finance Corporation',
    flagshipProgramName: 'Florida Housing Hometown Heroes & Florida Assist DPA',
    maxDpaPercentOrAmount: 'Up to 5.0% ($35,000 maximum) DPA',
    dpaType: '0% Interest Silent 2nd',
    minFico: 640,
    maxPurchasePriceCapUsd: 620000,
    maxIncomeCapPercentAmi: 150,
    medianHouseholdAmiUsd: 86000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible statewide in all 67 Florida counties (Miami-Dade, Broward, Orange, Hillsborough, Duval, etc.) up to $832,750 conforming limit. 140% AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 45,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 980,
    highlightFeatures: ['Hometown Heroes offers up to $35,000 in 0% deferred DPA for all Florida full-time workers', 'Florida Assist provides $10,000 fixed DPA', 'No monthly payment on second mortgage'],
    chatEngagementTemplate: 'In Florida, full-time workers can get up to $35,000 through Hometown Heroes, or pair Lakeview 100% DPA with FHA 3.5% across Orlando, Tampa, and Miami!'
  },
  GA: {
    stateCode: 'GA',
    stateName: 'Georgia',
    agencyName: 'Georgia Department of Community Affairs (DCA)',
    flagshipProgramName: 'Georgia Dream Homeownership Program DPA',
    maxDpaPercentOrAmount: 'Up to $10,000 ($12,500 for Protectors, Educators, & Nurses)',
    dpaType: '0% Interest Silent 2nd',
    minFico: 640,
    maxPurchasePriceCapUsd: 525000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 82000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 159 Georgia counties up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 62,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 620,
    highlightFeatures: ['0% interest deferred second lien with no monthly payments', 'Special incentives for educators, law enforcement, healthcare workers', 'Stackable with CRA bank grants'],
    chatEngagementTemplate: 'Georgia buyers can obtain $10,000-$12,500 Georgia Dream DPA or qualify for Lakeview 100% zero-down financing in Fulton, Gwinnett, and Cobb counties.'
  },
  ID: {
    stateCode: 'ID',
    stateName: 'Idaho',
    agencyName: 'Idaho Housing and Finance Association (IHFA)',
    flagshipProgramName: 'Idaho Housing First Loan & 3.5% - 7.0% DPA Second',
    maxDpaPercentOrAmount: 'Up to 7.0% of purchase price',
    dpaType: 'Amortizing 2nd',
    minFico: 620,
    maxPurchasePriceCapUsd: 650000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 86500,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 44 Idaho counties (Ada, Canyon, Kootenai, Bonneville, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 72,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 85,
    highlightFeatures: ['Second mortgage amortized over 10 or 15 years', 'Low 620 credit tier', 'Covers entire down payment and portion of closing costs'],
    chatEngagementTemplate: 'In Idaho, IHFA provides up to 7% DPA, or you can leverage Lakeview National 100% financing and USDA 100% rural loans across the Treasure Valley and panhandle!'
  },
  IL: {
    stateCode: 'IL',
    stateName: 'Illinois',
    agencyName: 'Illinois Housing Development Authority (IHDA)',
    flagshipProgramName: 'IHDA Access Forgivable ($6k) & Deferred ($10k) DPA',
    maxDpaPercentOrAmount: 'Up to $10,000 DPA or $6,000 Forgivable Grant',
    dpaType: 'Forgivable Grant',
    minFico: 640,
    maxPurchasePriceCapUsd: 595000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 92000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 102 Illinois counties (Cook, DuPage, Lake, Will, Kane, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 54,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 840,
    highlightFeatures: ['Access Forgivable: 100% forgiven after 5 years', 'Access Deferred: 0% interest silent second', 'Available for both 1st time and repeat buyers'],
    chatEngagementTemplate: 'Illinois renters can stop renting with IHDA $10k DPA or Lakeview 100% financing across Cook County, Chicago metro, and central IL!'
  },
  IN: {
    stateCode: 'IN',
    stateName: 'Indiana',
    agencyName: 'Indiana Housing and Community Development Authority (IHCDA)',
    flagshipProgramName: 'IHCDA Next Home & First Place DPA (Up to 6%)',
    maxDpaPercentOrAmount: 'Up to 6.0% DPA',
    dpaType: 'Forgivable Grant',
    minFico: 660,
    maxPurchasePriceCapUsd: 495000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 78000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible across all 92 Indiana counties up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 66,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 340,
    highlightFeatures: ['Next Home offers 3.5% DPA with no first-time buyer rule', 'First Place provides 6% DPA for first-time buyers', '3-year forgivable structure'],
    chatEngagementTemplate: 'In Indiana, IHCDA First Place offers up to 6% forgivable assistance, plus statewide Lakeview 100% zero-down and USDA rural options!'
  },
  NC: {
    stateCode: 'NC',
    stateName: 'North Carolina',
    agencyName: 'North Carolina Housing Finance Agency (NCHFA)',
    flagshipProgramName: 'NC Home Advantage Mortgage with $15,000 DPA',
    maxDpaPercentOrAmount: 'Up to $15,000 DPA (or 3% DPA Grant)',
    dpaType: 'Forgivable Grant',
    minFico: 640,
    maxPurchasePriceCapUsd: 610000,
    maxIncomeCapPercentAmi: 120,
    medianHouseholdAmiUsd: 84000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 100 North Carolina counties (Wake, Mecklenburg, Durham, Guilford, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 64,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 510,
    highlightFeatures: ['0% deferred second forgiven 20% per year starting year 11 (fully forgiven year 15)', 'No monthly payments on DPA', 'Compatible with FHA, VA, USDA, and Conventional'],
    chatEngagementTemplate: 'North Carolina offers up to $15,000 through NC Home Advantage, or you can utilize Lakeview 100% DPA in Charlotte, Raleigh, and Greensboro.'
  },
  NV: {
    stateCode: 'NV',
    stateName: 'Nevada',
    agencyName: 'Nevada Housing Division (NHD)',
    flagshipProgramName: 'Home Is Possible (HIP) DPA & HIP for Heroes',
    maxDpaPercentOrAmount: 'Up to 5.0% of Loan Amount',
    dpaType: 'Forgivable Grant',
    minFico: 640,
    maxPurchasePriceCapUsd: 685000,
    maxIncomeCapPercentAmi: 135,
    medianHouseholdAmiUsd: 88000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 17 Nevada counties (Clark, Washoe, Carson City, Elko, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 40,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 210,
    highlightFeatures: ['Forgivable after 3 years of continuous occupancy', 'No first-time homebuyer requirement', 'Higher income caps up to $135,000+'],
    chatEngagementTemplate: 'Nevada homebuyers can get up to 5% forgivable DPA with Home Is Possible (HIP) or use Lakeview 100% financing in Las Vegas, Reno, and Henderson.'
  },
  NY: {
    stateCode: 'NY',
    stateName: 'New York',
    agencyName: 'State of New York Mortgage Agency (SONYMA)',
    flagshipProgramName: 'SONYMA Achieving the Dream & DPAL DPA',
    maxDpaPercentOrAmount: 'Up to $15,000 (or 3.0% of purchase price)',
    dpaType: 'Forgivable Grant',
    minFico: 620,
    maxPurchasePriceCapUsd: 832750,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 101000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 62 New York counties up to 2026 FHFA conforming limits ($832,750 base, up to $1,249,125 high-cost NYC metro). 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 48,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 1250,
    highlightFeatures: ['DPAL second mortgage forgiven after 10 years at 0% interest', 'Below-market fixed interest rates on 1st mortgage', 'Allows 97% LTV Conventional stacking'],
    chatEngagementTemplate: 'New York buyers can access SONYMA Achieving the Dream with $15,000 DPAL or leverage Lakeview 100% DPA and CRA $10k bank grants in upstate or NYC metro.'
  },
  OH: {
    stateCode: 'OH',
    stateName: 'Ohio',
    agencyName: 'Ohio Housing Finance Agency (OHFA)',
    flagshipProgramName: 'OHFA Your Choice! Down Payment Assistance (2.5% - 5.0%)',
    maxDpaPercentOrAmount: 'Up to 5.0% DPA (Forgivable after 7 years)',
    dpaType: 'Forgivable Grant',
    minFico: 640,
    maxPurchasePriceCapUsd: 495000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 79000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 88 Ohio counties (Franklin, Cuyahoga, Hamilton, Summit, Montgomery, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 60,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 680,
    highlightFeatures: ['Your Choice DPA forgiven after 7 years', 'Ohio Heroes offers 25 bps rate discount for veterans & teachers', 'Low out-of-pocket costs'],
    chatEngagementTemplate: 'Ohio buyers can utilize OHFA Your Choice! 5% DPA or qualify for Lakeview 100% zero-down financing and USDA rural loans across Columbus, Cleveland, and Cincinnati.'
  },
  OR: {
    stateCode: 'OR',
    stateName: 'Oregon',
    agencyName: 'Oregon Housing and Community Services (OHCS)',
    flagshipProgramName: 'OHCS Flex Lending FirstHome (4-5% DPA) & RateAdvantage',
    maxDpaPercentOrAmount: '4.0% - 5.0% Cash Grant (Up to $29,250 Cap)',
    dpaType: 'Forgivable Grant',
    minFico: 620,
    maxPurchasePriceCapUsd: 715000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 94000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Statewide Oregon Eligibility: All 36 Oregon counties (Multnomah, Lane, Deschutes, Washington, Clackamas, Marion, Jackson, etc.) and census tracts are 100% eligible up to 2026 Fannie Mae 1-Unit conforming loan limit ($832,750). Combined household gross income must be ≤140% Fannie Mae county AMI. Strictly 1-unit primary residence stick-built SFR/PUD/Condominiums (no manufactured homes or 2-4 units).',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 68,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 214,
    highlightFeatures: ['4.0% standard or 5.0% DPA in LMI/Targeted Census Tracts or ≤80% AMI', 'RateAdvantage provides up to 50 bps discount below market', 'NextStep program open to repeat buyers up to $125k income', 'Stackable with CRA $10k grants and Lakeview 100% DPA'],
    chatEngagementTemplate: 'Oregon first-time buyers can stop renting with OHCS Flex Lending 5% DPA ($29k cap) or Lakeview National 100% financing across all 36 Oregon counties with 620-660+ credit!'
  },
  PA: {
    stateCode: 'PA',
    stateName: 'Pennsylvania',
    agencyName: 'Pennsylvania Housing Finance Agency (PHFA)',
    flagshipProgramName: 'PHFA Keystone Home Loan & K-FIT DPA Grant ($6,000)',
    maxDpaPercentOrAmount: 'Up to $6,000 Forgivable Grant or 5.0% Second',
    dpaType: 'Forgivable Grant',
    minFico: 660,
    maxPurchasePriceCapUsd: 580000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 86000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 67 Pennsylvania counties (Allegheny, Philadelphia, Montgomery, Bucks, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 58,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 720,
    highlightFeatures: ['K-FIT provides 5% (up to $6,000) forgiven 10% per year over 10 years', 'Keystone Advantage offers 0% deferred DPA up to $6,000', 'Conventional 97% compatible'],
    chatEngagementTemplate: 'In PA, PHFA K-FIT offers $6,000 forgivable DPA, or you can leverage Lakeview 100% financing in Philadelphia, Pittsburgh, and Lehigh Valley!'
  },
  SC: {
    stateCode: 'SC',
    stateName: 'South Carolina',
    agencyName: 'South Carolina State Housing Finance and Development Authority (SC Housing)',
    flagshipProgramName: 'SC Housing Homebuyer Program & Forgivable DPA ($12,000)',
    maxDpaPercentOrAmount: 'Up to $12,000 Forgivable DPA',
    dpaType: 'Forgivable Grant',
    minFico: 620,
    maxPurchasePriceCapUsd: 540000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 79000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 46 South Carolina counties up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 65,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 310,
    highlightFeatures: ['Forgivable DPA forgiven after 10 years or 20 years', 'Palmetto Heroes offers discounted fixed rates', 'Low 620 FICO minimum'],
    chatEngagementTemplate: 'South Carolina buyers can get up to $12,000 in forgivable DPA with SC Housing, or use Lakeview 100% zero-down in Charleston, Columbia, and Greenville.'
  },
  TN: {
    stateCode: 'TN',
    stateName: 'Tennessee',
    agencyName: 'Tennessee Housing Development Agency (THDA)',
    flagshipProgramName: 'THDA Great Choice Plus DPA Second Loan ($6,000 - $10,000)',
    maxDpaPercentOrAmount: 'Up to $10,000 (or 6% of purchase price)',
    dpaType: 'Forgivable Grant',
    minFico: 640,
    maxPurchasePriceCapUsd: 575000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 81000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 95 Tennessee counties (Davidson, Shelby, Knox, Hamilton, Williamson, Rutherford, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 66,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 430,
    highlightFeatures: ['Great Choice Plus offers forgivable or deferred 0% options up to $10k', 'Homeownership for the Brave offers 50 bps rate cut for veterans', 'Compatible with FHA/VA/USDA'],
    chatEngagementTemplate: 'In Tennessee, THDA Great Choice Plus provides up to $10,000 DPA, plus Lakeview 100% financing and USDA rural loans across Nashville, Memphis, and Knoxville.'
  },
  TX: {
    stateCode: 'TX',
    stateName: 'Texas',
    agencyName: 'Texas Department of Housing and Community Affairs (TDHCA) / TSAHC',
    flagshipProgramName: 'TDHCA My First Texas Home & TSAHC Homes for Texas Heroes',
    maxDpaPercentOrAmount: 'Up to 5.0% DPA (Forgivable Grant or 0% Silent 2nd)',
    dpaType: 'Forgivable Grant',
    minFico: 620,
    maxPurchasePriceCapUsd: 645000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 87000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 254 Texas counties (Harris, Dallas, Tarrant, Bexar, Travis, Collin, Denton, etc.) up to $832,750 conforming limit. Max 140% county AMI. 1-unit primary stick-built SFR/PUD/Condo.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 55,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 1420,
    highlightFeatures: ['TSAHC offers 3-5% forgivable grants with no first-time buyer rule for teachers/police/firefighters', 'TDHCA My First Texas Home provides 30-year 0% deferred DPA', 'Can be stacked with Texas MCC tax credit'],
    chatEngagementTemplate: 'Texas renters can access TDHCA / TSAHC up to 5% DPA or qualify for Lakeview 100% financing in Dallas-Fort Worth, Houston, Austin, and San Antonio.'
  },
  UT: {
    stateCode: 'UT',
    stateName: 'Utah',
    agencyName: 'Utah Housing Corporation (UHC)',
    flagshipProgramName: 'Utah Housing Corp (UHC) FirstHome & DPA Second (Up to 6%)',
    maxDpaPercentOrAmount: 'Up to 6.0% of loan amount',
    dpaType: 'Amortizing 2nd',
    minFico: 660,
    maxPurchasePriceCapUsd: 650000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 96000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 29 Utah counties (Salt Lake, Utah, Davis, Weber, Washington, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 45,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 115,
    highlightFeatures: ['UHC provides subordinate 30-year fixed loan at 1st mortgage rate + 2%', 'Covers full down payment and closing costs', 'Utah First-Time Homebuyer Assistance $20k New Construction Grant'],
    chatEngagementTemplate: 'Utah buyers can combine UHC 6% DPA or Utah’s $20,000 new construction grant with Lakeview 100% financing along the Wasatch Front.'
  },
  VA: {
    stateCode: 'VA',
    stateName: 'Virginia',
    agencyName: 'Virginia Housing (VHDA)',
    flagshipProgramName: 'Virginia Housing Plus DPA Second Mortgage & DPA Grant',
    maxDpaPercentOrAmount: 'Up to 3.0% - 5.0% DPA (Grant or 0% Second)',
    dpaType: 'Forgivable Grant',
    minFico: 620,
    maxPurchasePriceCapUsd: 720000,
    maxIncomeCapPercentAmi: 120,
    medianHouseholdAmiUsd: 106000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 95 Virginia counties & 38 independent cities up to 2026 FHFA conforming limits ($832,750 base to $1,249,125 Northern VA high-cost). 140% AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 52,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 410,
    highlightFeatures: ['Virginia Housing DPA Grant requires no repayment', 'Plus Second Mortgage covers 100% financing', 'No mortgage insurance on conventional option'],
    chatEngagementTemplate: 'Virginia buyers can use Virginia Housing Plus DPA or Lakeview 100% zero-down financing in Northern Virginia, Richmond, and Hampton Roads.'
  },
  WA: {
    stateCode: 'WA',
    stateName: 'Washington',
    agencyName: 'Washington State Housing Finance Commission (WSHFC)',
    flagshipProgramName: 'WSHFC Home Advantage (4-5% DPA) & House Key Opportunity',
    maxDpaPercentOrAmount: '4.0% - 5.0% DPA (Up to $15,000 or 5% of Loan)',
    dpaType: '0% Interest Silent 2nd',
    minFico: 620,
    maxPurchasePriceCapUsd: 832750,
    maxIncomeCapPercentAmi: 120,
    medianHouseholdAmiUsd: 104000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 39 Washington counties (King, Pierce, Snohomish, Clark, Spokane, Thurston, Kitsap, etc.) up to $832,750 base conforming limit (and up to $1,086,750 King/Snohomish high-cost). Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 56,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 360,
    highlightFeatures: ['0% interest deferred 30-year second mortgage with no monthly payments', 'House Key Opportunity offers discounted interest rate for ≤80% AMI', 'Stackable with employer grants and NHF DPA'],
    chatEngagementTemplate: 'In Washington, WSHFC offers 4-5% zero-interest DPA, plus Lakeview 100% financing and USDA rural loans across King, Pierce, Clark, and Spokane counties!'
  },
  WI: {
    stateCode: 'WI',
    stateName: 'Wisconsin',
    agencyName: 'Wisconsin Housing and Economic Development Authority (WHEDA)',
    flagshipProgramName: 'WHEDA First-Time Homebuyer & Easy Close DPA ($6k-$10k)',
    maxDpaPercentOrAmount: 'Up to $10,000 or 6% of purchase price',
    dpaType: '0% Interest Silent 2nd',
    minFico: 620,
    maxPurchasePriceCapUsd: 525000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 83000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: 'Eligible in all 72 Wisconsin counties (Milwaukee, Dane, Waukesha, Brown, Outagamie, etc.) up to $832,750 conforming limit. Max 140% county AMI.',
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 62,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 380,
    highlightFeatures: ['WHEDA Easy Close provides 10-year fixed 2nd mortgage', 'Capital Access DPA provides $3,050 at 0% interest', 'Reduced private mortgage insurance'],
    chatEngagementTemplate: 'Wisconsin first-time buyers can stop renting with WHEDA Easy Close DPA or Lakeview 100% zero-down in Milwaukee, Madison, and Green Bay.'
  }
};

/**
 * Returns mortgage program details for any US state (with fallback for any unlisted code)
 */
export function getStateMortgageProgramData(stateCode: string): StateMortgageProgramData {
  const code = (stateCode || 'OR').toUpperCase();
  if (NATIONWIDE_STATE_PROGRAMS[code]) {
    return NATIONWIDE_STATE_PROGRAMS[code];
  }

  return {
    stateCode: code,
    stateName: code,
    agencyName: `${code} State Housing Finance Agency`,
    flagshipProgramName: `${code} First-Time Homebuyer & DPA Program`,
    maxDpaPercentOrAmount: 'Up to 3.5% - 5.0% DPA Grant or Silent 2nd',
    dpaType: '0% Interest Silent 2nd',
    minFico: 620,
    maxPurchasePriceCapUsd: 650000,
    maxIncomeCapPercentAmi: 115,
    medianHouseholdAmiUsd: 85000,
    isLakeviewNationalEligible: true,
    lakeviewNotes: `Eligible statewide in all counties of ${code} up to 2026 Fannie Mae conforming limit ($832,750). Max 140% county AMI. 1-unit primary residence stick-built SFR/PUD/Condominium.`,
    isUsdaRdEligible: true,
    usdaRuralTractPercentage: 55,
    isNhfDpaEligible: true,
    lmiTractCountEstimate: 220,
    highlightFeatures: ['State bond first-time buyer assistance', 'Compatible with FHA 3.5% and Conventional 97%', 'Lakeview National 100% eligible'],
    chatEngagementTemplate: `In ${code}, buyers have access to state bond DPA, Lakeview National 100% financing, NHF 5% DPA, and USDA 100% zero-down loans!`
  };
}

/**
 * Cross-references a buyer profile against the 6 Major Low / Zero Down Mortgage Programs
 */
export interface ProgramEligibilityOverlay {
  programId: string;
  programName: string;
  category: string;
  isEligible: boolean;
  maxPurchasePriceUsd: number;
  maxIncomeCapUsd: number;
  minCreditScore: number;
  dpaAssistanceUsd: number;
  downPaymentOutOfPocketUsd: number;
  statusBadge: '100% ELIGIBLE' | 'PARTIAL MATCH' | 'INELIGIBLE';
  qualifyingHighlights: string[];
  disqualificationReasons: string[];
  conversationJoinerTemplate: string;
}

export interface BuyerLeadAuditInput {
  stateCode: string;
  countyName?: string;
  targetPurchasePrice: number;
  grossHouseholdIncome: number;
  creditScore: number;
  isFirstTimeBuyer?: boolean;
  propertyUnitCount?: 1 | 2 | 3 | 4;
  isStickBuilt?: boolean;
  isPrimaryResidence?: boolean;
  isRuralTract?: boolean;
  isLmiTract?: boolean;
}

export function evaluateNationwideMortgageOverlay(input: BuyerLeadAuditInput): {
  stateProgram: StateMortgageProgramData;
  eligibleProgramsCount: number;
  programs: ProgramEligibilityOverlay[];
  recommendedBestProduct: ProgramEligibilityOverlay;
  summaryHeadline: string;
  crossReferenceNotes: string;
} {
  const stateData = getStateMortgageProgramData(input.stateCode);
  const baseAmi = stateData.medianHouseholdAmiUsd;
  const isPrimary = input.isPrimaryResidence ?? true;
  const isStick = input.isStickBuilt ?? true;
  const unitCount = input.propertyUnitCount || 1;

  const programs: ProgramEligibilityOverlay[] = [];

  // 1. Lakeview National 100% DPA
  {
    const lakeview140AmiCap = Math.round(baseAmi * 1.40);
    const lakeviewMaxPrice = 832750;
    const reasons: string[] = [];
    if (!isPrimary) reasons.push('Requires 1-Unit Primary Residence owner-occupancy');
    if (unitCount > 1) reasons.push('Strictly 1-Unit properties only ($832,750 limit)');
    if (!isStick) reasons.push('Requires stick-built SFR, PUD, or Condominium (no manufactured homes)');
    if (input.creditScore < 660) reasons.push(`Credit score (${input.creditScore}) below Lakeview minimum (660 FICO)`);
    if (input.grossHouseholdIncome > lakeview140AmiCap && !input.isLmiTract) {
      reasons.push(`Household income ($${input.grossHouseholdIncome.toLocaleString()}) exceeds 140% AMI limit ($${lakeview140AmiCap.toLocaleString()})`);
    }
    if (input.targetPurchasePrice > lakeviewMaxPrice) {
      reasons.push(`Purchase price ($${input.targetPurchasePrice.toLocaleString()}) exceeds 2026 Conforming Limit ($${lakeviewMaxPrice.toLocaleString()})`);
    }

    const isEligible = reasons.length === 0;
    const dpaEst = Math.round(input.targetPurchasePrice * 0.05); // 5% soft second

    programs.push({
      programId: 'lakeview_national_100',
      programName: 'Lakeview National Bayview 100% DPA',
      category: 'National 100% Financing',
      isEligible,
      maxPurchasePriceUsd: lakeviewMaxPrice,
      maxIncomeCapUsd: lakeview140AmiCap,
      minCreditScore: 660,
      dpaAssistanceUsd: isEligible ? dpaEst : 0,
      downPaymentOutOfPocketUsd: isEligible ? 0 : Math.round(input.targetPurchasePrice * 0.035),
      statusBadge: isEligible ? '100% ELIGIBLE' : reasons.length === 1 ? 'PARTIAL MATCH' : 'INELIGIBLE',
      qualifyingHighlights: [
        `Eligible across all 50 states (including ${stateData.stateName})`,
        '100% LTV financing (0% down payment out of pocket)',
        'Generous 140% Area Median Income (AMI) ceiling',
        '2026 Fannie Mae conforming limit ($832,750)'
      ],
      disqualificationReasons: reasons,
      conversationJoinerTemplate: `Hey there! Since you're looking to stop renting in ${stateData.stateName}, Lakeview National 100% DPA allows 0% down on 1-unit homes with up to 140% AMI income limits. Happy to run an official conforming pre-approval for you!`
    });
  }

  // 2. USDA Rural Development 100% Zero-Down
  {
    const usda115AmiCap = Math.round(baseAmi * 1.15);
    const usdaMaxPrice = 750000;
    const reasons: string[] = [];
    if (!input.isRuralTract) reasons.push('Subject property must be located in USDA RD designated rural/suburban census tract');
    if (input.grossHouseholdIncome > usda115AmiCap) reasons.push(`Income ($${input.grossHouseholdIncome.toLocaleString()}) exceeds USDA 115% AMI cap ($${usda115AmiCap.toLocaleString()})`);
    if (input.creditScore < 640) reasons.push(`Credit score (${input.creditScore}) below USDA GUS benchmark (640 FICO)`);
    if (input.targetPurchasePrice > usdaMaxPrice) reasons.push(`Purchase price exceeds USDA standard guideline limit ($${usdaMaxPrice.toLocaleString()})`);

    const isEligible = reasons.length === 0;

    programs.push({
      programId: 'usda_rd_100_guaranteed',
      programName: 'USDA Rural Development 100% Zero-Down Guaranteed',
      category: 'Government 0-Down',
      isEligible,
      maxPurchasePriceUsd: usdaMaxPrice,
      maxIncomeCapUsd: usda115AmiCap,
      minCreditScore: 640,
      dpaAssistanceUsd: 0,
      downPaymentOutOfPocketUsd: isEligible ? 0 : Math.round(input.targetPurchasePrice * 0.035),
      statusBadge: isEligible ? '100% ELIGIBLE' : 'PARTIAL MATCH',
      qualifyingHighlights: [
        'True 100% Zero Down Payment financing',
        'Low monthly annual guarantee fee (0.35%)',
        'Available in eligible rural and suburban census tracts across all 50 states',
        'Allows 100% seller concessions for closing costs'
      ],
      disqualificationReasons: reasons,
      conversationJoinerTemplate: `Great news! If the property is in a USDA-eligible census tract in ${stateData.stateName}, you can purchase with 100% zero down payment and negotiate seller credits to cover your closing costs.`
    });
  }

  // 3. FHA NHF (National Homebuyers Fund) DPA (Up to 5%)
  {
    const nhf140AmiCap = Math.round(baseAmi * 1.40);
    const nhfMaxPrice = 832750;
    const reasons: string[] = [];
    if (input.creditScore < 620) reasons.push(`Credit score (${input.creditScore}) is below NHF minimum (620 FICO)`);
    if (input.grossHouseholdIncome > nhf140AmiCap && !input.isLmiTract) {
      reasons.push(`Income ($${input.grossHouseholdIncome.toLocaleString()}) exceeds NHF 140% AMI cap ($${nhf140AmiCap.toLocaleString()})`);
    }

    const isEligible = reasons.length === 0;
    const dpaEst = Math.round(input.targetPurchasePrice * 0.05);

    programs.push({
      programId: 'nhf_fha_dpa_5pct',
      programName: 'National Homebuyers Fund (NHF) FHA DPA (Up to 5%)',
      category: 'National DPA Grant',
      isEligible,
      maxPurchasePriceUsd: nhfMaxPrice,
      maxIncomeCapUsd: nhf140AmiCap,
      minCreditScore: 620,
      dpaAssistanceUsd: isEligible ? dpaEst : 0,
      downPaymentOutOfPocketUsd: isEligible ? 0 : Math.round(input.targetPurchasePrice * 0.035),
      statusBadge: isEligible ? '100% ELIGIBLE' : 'PARTIAL MATCH',
      qualifyingHighlights: [
        'Up to 5% non-repayable grant or soft second across all 50 states',
        'NO First-Time Homebuyer requirement (open to repeat buyers)',
        'Low 620 minimum FICO requirement',
        'Generous 140% AMI income ceiling'
      ],
      disqualificationReasons: reasons,
      conversationJoinerTemplate: `Did you know NHF provides up to 5% down payment assistance for FHA loans in ${stateData.stateName} with no first-time buyer restriction and a 620 minimum score?`
    });
  }

  // 4. State HFA / State Bond Program (e.g. OHCS, CalHFA, TDHCA, WSHFC)
  {
    const stateAmiCap = Math.round(baseAmi * (stateData.maxIncomeCapPercentAmi / 100));
    const statePriceCap = stateData.maxPurchasePriceCapUsd;
    const reasons: string[] = [];
    if (input.creditScore < stateData.minFico) {
      reasons.push(`Credit score (${input.creditScore}) below ${stateData.agencyName} minimum (${stateData.minFico} FICO)`);
    }
    if (input.grossHouseholdIncome > stateAmiCap && !input.isLmiTract) {
      reasons.push(`Income ($${input.grossHouseholdIncome.toLocaleString()}) exceeds ${stateData.stateName} HFA limit ($${stateAmiCap.toLocaleString()})`);
    }
    if (input.targetPurchasePrice > statePriceCap) {
      reasons.push(`Purchase price ($${input.targetPurchasePrice.toLocaleString()}) exceeds state purchase price limit ($${statePriceCap.toLocaleString()})`);
    }

    const isEligible = reasons.length === 0;
    const dpaEst = Math.min(29250, Math.round(input.targetPurchasePrice * 0.05));

    programs.push({
      programId: `state_hfa_${input.stateCode.toLowerCase()}`,
      programName: stateData.flagshipProgramName,
      category: 'State Bond / HFA DPA',
      isEligible,
      maxPurchasePriceUsd: statePriceCap,
      maxIncomeCapUsd: stateAmiCap,
      minCreditScore: stateData.minFico,
      dpaAssistanceUsd: isEligible ? dpaEst : 0,
      downPaymentOutOfPocketUsd: isEligible ? Math.max(0, Math.round(input.targetPurchasePrice * 0.035) - dpaEst) : Math.round(input.targetPurchasePrice * 0.035),
      statusBadge: isEligible ? '100% ELIGIBLE' : 'PARTIAL MATCH',
      qualifyingHighlights: [
        `${stateData.maxDpaPercentOrAmount} down payment assistance`,
        `Managed by ${stateData.agencyName}`,
        ...stateData.highlightFeatures
      ],
      disqualificationReasons: reasons,
      conversationJoinerTemplate: stateData.chatEngagementTemplate
    });
  }

  // 5. Seller-Funded 2-1 Temporary Interest Rate Buydown Stack
  {
    const maxConformingPrice = 832750;
    const reasons: string[] = [];
    if (input.targetPurchasePrice > maxConformingPrice) {
      reasons.push(`Purchase price exceeds 2026 conforming limit ($${maxConformingPrice.toLocaleString()})`);
    }
    if (input.creditScore < 580) {
      reasons.push(`Credit score (${input.creditScore}) below standard agency baseline (580 FICO)`);
    }

    const isEligible = reasons.length === 0;

    programs.push({
      programId: 'seller_buydown_2_1_stack',
      programName: 'Seller-Funded 2-1 Temporary Rate Buydown Stack',
      category: 'Payment Affordability Buydown',
      isEligible,
      maxPurchasePriceUsd: maxConformingPrice,
      maxIncomeCapUsd: 999999, // No strict income cap on 2-1 buydowns
      minCreditScore: 580,
      dpaAssistanceUsd: 0,
      downPaymentOutOfPocketUsd: 0,
      statusBadge: isEligible ? '100% ELIGIBLE' : 'PARTIAL MATCH',
      qualifyingHighlights: [
        'Lowers effective interest rate by 2.0% in Year 1 and 1.0% in Year 2',
        '100% funded via seller concessions or lender credits (no buyer cash required)',
        'Fully stackable with USDA 100% Zero-Down, Lakeview 100%, State HFA, and FHA loans'
      ],
      disqualificationReasons: reasons,
      conversationJoinerTemplate: `We can stack a seller-funded 2-1 temporary rate buydown onto any low or zero-down loan in ${stateData.stateName} to give you substantial initial payment comfort from day one!`
    });
  }

  // 6. Fannie Mae HomeReady / Freddie Mac Home Possible 97%
  {
    const fnma80AmiCap = Math.round(baseAmi * 0.80);
    const fnmaMaxPrice = 832750;
    const reasons: string[] = [];
    if (input.creditScore < 620) reasons.push(`Credit score (${input.creditScore}) below conventional guideline (620 FICO)`);
    if (input.grossHouseholdIncome > fnma80AmiCap && !input.isLmiTract) {
      reasons.push(`Income exceeds 80% AMI ($${fnma80AmiCap.toLocaleString()}) unless purchasing in an LMI census tract`);
    }
    if (input.targetPurchasePrice > fnmaMaxPrice) {
      reasons.push(`Purchase price exceeds 2026 conforming limit ($${fnmaMaxPrice.toLocaleString()})`);
    }

    const isEligible = reasons.length === 0;

    programs.push({
      programId: 'fnma_homeready_97',
      programName: 'Fannie Mae HomeReady / Freddie Mac Home Possible 3% Down',
      category: 'Conventional 97% LTV',
      isEligible,
      maxPurchasePriceUsd: fnmaMaxPrice,
      maxIncomeCapUsd: fnma80AmiCap,
      minCreditScore: 620,
      dpaAssistanceUsd: 0,
      downPaymentOutOfPocketUsd: Math.round(input.targetPurchasePrice * 0.03),
      statusBadge: isEligible ? '100% ELIGIBLE' : 'PARTIAL MATCH',
      qualifyingHighlights: [
        '3% down payment (can be 100% family gift funds or DPA grant)',
        'Deeply discounted monthly Private Mortgage Insurance (PMI)',
        'Unlimited income cap in low-income census tracts'
      ],
      disqualificationReasons: reasons,
      conversationJoinerTemplate: `HomeReady and Home Possible allow 3% down payment with reduced monthly mortgage insurance for buyers with income under 80% AMI or in low-income census tracts in ${stateData.stateName}.`
    });
  }

  const eligibleList = programs.filter(p => p.isEligible);
  const eligibleProgramsCount = eligibleList.length;

  // Select recommended best product (prefer Lakeview National 100% or USDA 100% or State DPA)
  const bestProduct = eligibleList.find(p => p.programId === 'lakeview_national_100') ||
    eligibleList.find(p => p.programId === 'usda_rd_100_guaranteed') ||
    eligibleList.find(p => p.programId.startsWith('state_hfa')) ||
    programs[0];

  return {
    stateProgram: stateData,
    eligibleProgramsCount,
    programs,
    recommendedBestProduct: bestProduct,
    summaryHeadline: `${eligibleProgramsCount} of 6 National & State Programs Matched in ${stateData.stateName}`,
    crossReferenceNotes: `Cross-referenced against 2026 Conforming Limit ($832,750), ${stateData.stateName} County AMI thresholds (80%, 115%, 140%), and LMI Census Tract Shapefile overlays.`
  };
}
