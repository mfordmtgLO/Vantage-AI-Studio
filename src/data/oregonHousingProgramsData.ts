/**
 * @file oregonHousingProgramsData.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Comprehensive Oregon Housing and Community Services (OHCS) Program Registry
 * Authoritative comparison between Rate Advantage, FirstHome (Flex Lending DPA),
 * Cash Advantage, and NextStep (No Purchase Price Limit) programs, with exact IRS Section 143
 * purchase price caps and household income limits across all 36 Oregon counties.
 */

export interface OregonCountyLimitTier {
  countyId: string;
  countyName: string;
  regionName: string;
  nonTargetedPriceCapUsd: number;
  targetedPriceCapUsd: number | null; // null if standard caps apply (e.g. Portland Metro)
  incomeLimit1To2PersonsUsd: number;
  incomeLimit3PlusPersonsUsd: number;
  targetedIncomeLimit1To2PersonsUsd: number;
  targetedIncomeLimit3PlusPersonsUsd: number;
  targetedAreaNotes?: string;
  majorCities: string;
}

export interface OhcsProgramComparison {
  id: 'rate_advantage' | 'first_home' | 'cash_advantage' | 'next_step';
  name: string;
  shortName: string;
  badge: string;
  category: 'Rate Discount' | 'Upfront Cash Assistance' | 'No Price Cap Flex';
  primaryBenefit: string;
  cashAssistanceAmount: string;
  cashRepaymentStructure: string;
  interestRateStructure: string;
  firstTimeBuyerRequirement: string;
  purchasePriceCapRule: string;
  incomeLimitRule: string;
  targetAudience: string;
  strategicSummary: string;
  idealScenario: string;
}

/**
 * The 4 Core OHCS State Mortgage Programs
 */
export const OHCS_PROGRAMS_REGISTRY: Record<string, OhcsProgramComparison> = {
  rate_advantage: {
    id: 'rate_advantage',
    name: 'OHCS Rate Advantage Program',
    shortName: 'Rate Advantage',
    badge: '📉 Max Rate Discount • $0 Cash Assistance',
    category: 'Rate Discount',
    primaryBenefit: 'Deeply discounted, below-market 30-year fixed interest rate on first mortgage to lower monthly payments over the life of the loan.',
    cashAssistanceAmount: '$0 Cash. Borrower must provide their own down payment and closing costs.',
    cashRepaymentStructure: 'N/A (No secondary loan or grant issued).',
    interestRateStructure: 'Lowest possible below-market fixed rate (typically 37.5 to 50 bps below standard agency rates).',
    firstTimeBuyerRequirement: 'Yes (No homeownership in past 3 years; waived for qualified veterans or targeted census tracts).',
    purchasePriceCapRule: 'Subject to IRS Section 143 county purchase price limits ($566,354 to $752,036 non-targeted / up to $919,155 targeted).',
    incomeLimitRule: 'Subject to county 1-2 person ($99,200 - $112,200) and 3+ person ($114,080 - $129,030) income caps.',
    targetAudience: 'Buyers with saved down payment cash who want the lowest monthly payment and maximum long-term interest savings.',
    strategicSummary: 'Choose Rate Advantage if your bottleneck is monthly payment affordability. Trading cash assistance for the cheapest possible interest rate saves the most money over a 30-year timeframe.',
    idealScenario: 'Buyer with $20,000 - $35,000 in personal savings purchasing a $450k home in Lane or Deschutes county wanting lowest P&I bill.'
  },

  first_home: {
    id: 'first_home',
    name: 'OHCS FirstHome Program (Flex Lending DPA)',
    shortName: 'FirstHome DPA',
    badge: '💵 4% to 5% Cash DPA Assistance',
    category: 'Upfront Cash Assistance',
    primaryBenefit: 'Upfront cash assistance (4% to 5% of first mortgage loan amount) to wipe out cash needed to close.',
    cashAssistanceAmount: '4.0% standard or 5.0% in targeted areas / income ≤ 80% AMI (up to $29,250 cap).',
    cashRepaymentStructure: 'Issued as a second mortgage; fully forgivable after required tenure if household income is ≤ 80% AMI.',
    interestRateStructure: 'Standard competitive state fixed rate (trades rate discount for upfront cash).',
    firstTimeBuyerRequirement: 'Yes (No homeownership in past 3 years; waived in targeted areas or for qualified veterans).',
    purchasePriceCapRule: 'Subject to IRS Section 143 county purchase price limits ($566,354 to $752,036 non-targeted / up to $919,155 targeted).',
    incomeLimitRule: 'Subject to county 1-2 person ($99,200 - $112,200) and 3+ person ($114,080 - $129,030) income caps.',
    targetAudience: 'Buyers who lack upfront cash to close but can afford standard monthly mortgage payments.',
    strategicSummary: 'Choose FirstHome if your bottleneck is upfront capital. It bridges the immediate capital gap by providing secondary funds that eliminate out-of-pocket cash requirements at closing.',
    idealScenario: 'Renter with good income ($85k) and 660 credit who lacks $15k-$20k in savings to cover down payment and closing costs.'
  },

  cash_advantage: {
    id: 'cash_advantage',
    name: 'OHCS Cash Advantage Program',
    shortName: 'Cash Advantage (3% DPA)',
    badge: '💰 3% Down Payment Cash Assistance',
    category: 'Upfront Cash Assistance',
    primaryBenefit: 'Provides 3.0% upfront cash assistance towards down payment and closing costs.',
    cashAssistanceAmount: '3.0% of first mortgage loan amount.',
    cashRepaymentStructure: 'Grant or subordinate silent loan based on servicing pathway.',
    interestRateStructure: 'Slightly higher interest rate than Rate Advantage in exchange for upfront cash assistance.',
    firstTimeBuyerRequirement: 'Yes (No homeownership in past 3 years; waived in targeted areas).',
    purchasePriceCapRule: 'Subject to IRS Section 143 county purchase price limits.',
    incomeLimitRule: 'Subject to county 1-2 person and 3+ person income caps.',
    targetAudience: 'Borrowers wanting moderate upfront cash assistance with flexible closing timelines.',
    strategicSummary: 'Offers a middle-ground 3% cash boost for borrowers who have a small down payment saved but need assistance with closing costs.',
    idealScenario: 'Borrower buying a home with 1-2% saved who needs a 3% boost to fulfill 3.5% FHA requirement plus prepaid escrows.'
  },

  next_step: {
    id: 'next_step',
    name: 'OHCS NextStep Program (No Price Cap Flex Lending)',
    shortName: 'NextStep (No Price Cap)',
    badge: '🚀 NO Purchase Price Limit • $125k Income Cap',
    category: 'No Price Cap Flex',
    primaryBenefit: 'Bypasses all county purchase price limits entirely while still providing 4% to 5% cash assistance for down payment/closing costs.',
    cashAssistanceAmount: '4.0% to 5.0% of first mortgage loan amount.',
    cashRepaymentStructure: 'Issued as a second mortgage (standard Flex Lending terms).',
    interestRateStructure: 'Competitive market-linked fixed interest rate.',
    firstTimeBuyerRequirement: 'NO. Repeat buyers and prior homeowners are 100% eligible.',
    purchasePriceCapRule: 'NO PURCHASE PRICE LIMIT. Zero cap on maximum home purchase price.',
    incomeLimitRule: 'Flat $125,000 household income limit statewide across all 36 Oregon counties regardless of family size.',
    targetAudience: 'Buyers purchasing homes above standard county price caps (e.g., $750k+ in Bend or Portland) or repeat buyers needing DPA.',
    strategicSummary: 'The "No Cap" Loophole. If a home exceeds your county purchase price limit, switch immediately from FirstHome to NextStep. Keeps DPA while removing purchase price restrictions.',
    idealScenario: 'Buyer purchasing an $820,000 home in Bend or Portland with $115,000 household income needing $32,000 in DPA assistance.'
  }
};

/**
 * All 36 Oregon Counties: 2026 Purchase Price Limits & Income Caps by Region
 */
export const OREGON_ALL_36_COUNTIES_LIMITS: OregonCountyLimitTier[] = [
  // 1. Portland Metro Area
  {
    countyId: 'multnomah',
    countyName: 'Multnomah County',
    regionName: 'Portland Metro Area',
    nonTargetedPriceCapUsd: 733987,
    targetedPriceCapUsd: null,
    incomeLimit1To2PersonsUsd: 112200,
    incomeLimit3PlusPersonsUsd: 129030,
    targetedIncomeLimit1To2PersonsUsd: 134640,
    targetedIncomeLimit3PlusPersonsUsd: 157080,
    targetedAreaNotes: 'Standard caps apply across Portland metro core',
    majorCities: 'Portland, Gresham, Troutdale, Fairview'
  },
  {
    countyId: 'washington_or',
    countyName: 'Washington County',
    regionName: 'Portland Metro Area',
    nonTargetedPriceCapUsd: 733987,
    targetedPriceCapUsd: null,
    incomeLimit1To2PersonsUsd: 112200,
    incomeLimit3PlusPersonsUsd: 129030,
    targetedIncomeLimit1To2PersonsUsd: 134640,
    targetedIncomeLimit3PlusPersonsUsd: 157080,
    targetedAreaNotes: 'Standard caps apply across Silicon Forest corridor',
    majorCities: 'Beaverton, Hillsboro, Tigard, Tualatin, Forest Grove'
  },
  {
    countyId: 'clackamas',
    countyName: 'Clackamas County',
    regionName: 'Portland Metro Area',
    nonTargetedPriceCapUsd: 733987,
    targetedPriceCapUsd: null,
    incomeLimit1To2PersonsUsd: 112200,
    incomeLimit3PlusPersonsUsd: 129030,
    targetedIncomeLimit1To2PersonsUsd: 134640,
    targetedIncomeLimit3PlusPersonsUsd: 157080,
    targetedAreaNotes: 'Standard caps apply across Clackamas corridor',
    majorCities: 'Oregon City, Lake Oswego, West Linn, Milwaukie, Wilsonville'
  },

  // 2. Central Oregon (Bend Metro)
  {
    countyId: 'deschutes',
    countyName: 'Deschutes County',
    regionName: 'Central Oregon (Bend Metro)',
    nonTargetedPriceCapUsd: 752036,
    targetedPriceCapUsd: 919155,
    incomeLimit1To2PersonsUsd: 110300,
    incomeLimit3PlusPersonsUsd: 126845,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Targeted tracts in designated rural and opportunity zones allow up to $919,155 price cap',
    majorCities: 'Bend, Redmond, Sisters, La Pine'
  },
  {
    countyId: 'crook',
    countyName: 'Crook County',
    regionName: 'Central Oregon (Bend Metro)',
    nonTargetedPriceCapUsd: 752036,
    targetedPriceCapUsd: 919155,
    incomeLimit1To2PersonsUsd: 110300,
    incomeLimit3PlusPersonsUsd: 126845,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Prineville and high-growth technology corridor',
    majorCities: 'Prineville, Powell Butte, Post'
  },

  // 3. Willamette Valley & Mid-Coast
  {
    countyId: 'lane',
    countyName: 'Lane County',
    regionName: 'Willamette Valley & Mid-Coast',
    nonTargetedPriceCapUsd: 643743,
    targetedPriceCapUsd: 786797,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Targeted tracts in West Eugene, Bethel, and Springfield allow up to $786,797 cap',
    majorCities: 'Eugene, Springfield, Cottage Grove, Florence, Veneta'
  },
  {
    countyId: 'benton_or',
    countyName: 'Benton County',
    regionName: 'Willamette Valley & Mid-Coast',
    nonTargetedPriceCapUsd: 643743,
    targetedPriceCapUsd: 786797,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Corvallis university and research corridor',
    majorCities: 'Corvallis, Philomath, Monroe, Adair Village'
  },
  {
    countyId: 'marion',
    countyName: 'Marion County',
    regionName: 'Willamette Valley & Mid-Coast',
    nonTargetedPriceCapUsd: 643743,
    targetedPriceCapUsd: 786797,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Salem state capital and Woodburn agricultural hub',
    majorCities: 'Salem, Keizer, Woodburn, Silverton, Stayton'
  },
  {
    countyId: 'linn',
    countyName: 'Linn County',
    regionName: 'Willamette Valley & Mid-Coast',
    nonTargetedPriceCapUsd: 643743,
    targetedPriceCapUsd: 786797,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Albany and Lebanon corridor',
    majorCities: 'Albany, Lebanon, Sweet Home, Harrisburg'
  },
  {
    countyId: 'polk',
    countyName: 'Polk County',
    regionName: 'Willamette Valley & Mid-Coast',
    nonTargetedPriceCapUsd: 643743,
    targetedPriceCapUsd: 786797,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'West Salem and Dallas wine country',
    majorCities: 'Dallas, Monmouth, Independence, West Salem'
  },
  {
    countyId: 'yamhill',
    countyName: 'Yamhill County',
    regionName: 'Willamette Valley & Mid-Coast',
    nonTargetedPriceCapUsd: 643743,
    targetedPriceCapUsd: 786797,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'McMinnville and Newberg wine corridor',
    majorCities: 'McMinnville, Newberg, Dundee, Sheridan'
  },
  {
    countyId: 'lincoln_or',
    countyName: 'Lincoln County',
    regionName: 'Willamette Valley & Mid-Coast',
    nonTargetedPriceCapUsd: 643743,
    targetedPriceCapUsd: 786797,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Central Oregon coastal corridor',
    majorCities: 'Newport, Lincoln City, Toledo, Waldport'
  },

  // 4. North Coast & Gorge
  {
    countyId: 'clatsop',
    countyName: 'Clatsop County',
    regionName: 'North Coast & Gorge',
    nonTargetedPriceCapUsd: 733987,
    targetedPriceCapUsd: 720617,
    incomeLimit1To2PersonsUsd: 110300,
    incomeLimit3PlusPersonsUsd: 126845,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Entire county targeted / designated coastal tracts',
    majorCities: 'Astoria, Seaside, Cannon Beach, Warrenton'
  },
  {
    countyId: 'columbia_or',
    countyName: 'Columbia County',
    regionName: 'North Coast & Gorge',
    nonTargetedPriceCapUsd: 733987,
    targetedPriceCapUsd: 897096,
    incomeLimit1To2PersonsUsd: 110300,
    incomeLimit3PlusPersonsUsd: 126845,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Vernonia city limits qualify for $897,096 targeted cap',
    majorCities: 'St. Helens, Scappoose, Vernonia, Clatskanie'
  },
  {
    countyId: 'hood_river',
    countyName: 'Hood River County',
    regionName: 'North Coast & Gorge',
    nonTargetedPriceCapUsd: 733987,
    targetedPriceCapUsd: 897096,
    incomeLimit1To2PersonsUsd: 110300,
    incomeLimit3PlusPersonsUsd: 126845,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Columbia River Gorge scenic area',
    majorCities: 'Hood River, Cascade Locks, Odell, Parkdale'
  },
  {
    countyId: 'tillamook',
    countyName: 'Tillamook County',
    regionName: 'North Coast & Gorge',
    nonTargetedPriceCapUsd: 733987,
    targetedPriceCapUsd: 897096,
    incomeLimit1To2PersonsUsd: 110300,
    incomeLimit3PlusPersonsUsd: 126845,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'North coast dairy and coastal communities',
    majorCities: 'Tillamook, Pacific City, Rockaway Beach, Manzanita'
  },

  // 5. Southern Oregon
  {
    countyId: 'jackson',
    countyName: 'Jackson County',
    regionName: 'Southern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Medford and Rogue Valley designated census tracts',
    majorCities: 'Medford, Ashland, Central Point, Jacksonville'
  },
  {
    countyId: 'josephine',
    countyName: 'Josephine County',
    regionName: 'Southern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Grants Pass and Cave Junction areas',
    majorCities: 'Grants Pass, Cave Junction, Merlin'
  },
  {
    countyId: 'douglas_or',
    countyName: 'Douglas County',
    regionName: 'Southern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Roseburg and Umpqua Valley targeted tracts',
    majorCities: 'Roseburg, Sutherlin, Winston, Reedsport'
  },

  // 6. Rural & Eastern Oregon (Remaining 16 Counties)
  {
    countyId: 'baker',
    countyName: 'Baker County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Entire county targeted',
    majorCities: 'Baker City, Haines, Halfway'
  },
  {
    countyId: 'coos',
    countyName: 'Coos County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Coos Bay and North Bend port communities',
    majorCities: 'Coos Bay, North Bend, Bandon, Coquille'
  },
  {
    countyId: 'curry',
    countyName: 'Curry County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'South coast Brookings and Gold Beach',
    majorCities: 'Brookings, Gold Beach, Port Orford'
  },
  {
    countyId: 'gilliam',
    countyName: 'Gilliam County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Condon, Arlington'
  },
  {
    countyId: 'grant_or',
    countyName: 'Grant County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'John Day, Canyon City, Prairie City'
  },
  {
    countyId: 'harney',
    countyName: 'Harney County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Entire county targeted / 100% USDA eligible',
    majorCities: 'Burns, Hines, Crane'
  },
  {
    countyId: 'jefferson_or',
    countyName: 'Jefferson County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Madras, Culver, Metolius'
  },
  {
    countyId: 'klamath',
    countyName: 'Klamath County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Klamath Falls, Altamont, Chiloquin'
  },
  {
    countyId: 'lake_or',
    countyName: 'Lake County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    targetedAreaNotes: 'Entire county targeted / 100% USDA eligible',
    majorCities: 'Lakeview, Paisley, Plush'
  },
  {
    countyId: 'malheur',
    countyName: 'Malheur County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Ontario, Vale, Nyssa'
  },
  {
    countyId: 'morrow',
    countyName: 'Morrow County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Boardman, Heppner, Ione'
  },
  {
    countyId: 'sherman',
    countyName: 'Sherman County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Moro, Wasco, Rufus'
  },
  {
    countyId: 'umatilla',
    countyName: 'Umatilla County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Hermiston, Pendleton, Umatilla, Milton-Freewater'
  },
  {
    countyId: 'union_or',
    countyName: 'Union County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'La Grande, Union, Cove, Elgin'
  },
  {
    countyId: 'wallowa',
    countyName: 'Wallowa County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Enterprise, Joseph, Wallowa'
  },
  {
    countyId: 'wasco',
    countyName: 'Wasco County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'The Dalles, Dufur, Maupin'
  },
  {
    countyId: 'wheeler',
    countyName: 'Wheeler County',
    regionName: 'Rural & Eastern Oregon',
    nonTargetedPriceCapUsd: 566354,
    targetedPriceCapUsd: 692211,
    incomeLimit1To2PersonsUsd: 99200,
    incomeLimit3PlusPersonsUsd: 114080,
    targetedIncomeLimit1To2PersonsUsd: 132360,
    targetedIncomeLimit3PlusPersonsUsd: 154420,
    majorCities: 'Fossil, Mitchell, Spray'
  }
];

export class OregonHousingProgramsService {
  /**
   * Retrieves all 36 Oregon county limits and tiers.
   */
  static getAllCountyLimits(): OregonCountyLimitTier[] {
    return OREGON_ALL_36_COUNTIES_LIMITS;
  }

  /**
   * Retrieves specific limits for an Oregon county by ID or name.
   */
  static getCountyLimits(countyIdOrName: string): OregonCountyLimitTier {
    const q = countyIdOrName.toLowerCase().replace(/county/g, '').trim();
    const found = OREGON_ALL_36_COUNTIES_LIMITS.find(c => 
      c.countyId.toLowerCase().includes(q) || 
      c.countyName.toLowerCase().includes(q) ||
      c.majorCities.toLowerCase().includes(q)
    );
    // Default fallback to Lane / Multnomah
    return found || OREGON_ALL_36_COUNTIES_LIMITS[0];
  }

  /**
   * Evaluates best program match based on borrower cash vs monthly priority.
   */
  static evaluateProgramRecommendation(params: {
    countyId: string;
    purchasePrice: number;
    householdIncome: number;
    householdSize: number; // 1, 2, 3+
    hasOwnDownPayment: boolean;
    isFirstTimeBuyer: boolean;
    isTargetedTract?: boolean;
  }): {
    recommendedProgram: OhcsProgramComparison;
    isEligible: boolean;
    reasons: string[];
    priceCap: number;
    incomeCap: number;
    canUseNextStepBypass: boolean;
  } {
    const county = this.getCountyLimits(params.countyId);
    const isTargeted = params.isTargetedTract && county.targetedPriceCapUsd !== null;
    const priceCap = isTargeted && county.targetedPriceCapUsd ? county.targetedPriceCapUsd : county.nonTargetedPriceCapUsd;
    const is3Plus = params.householdSize >= 3;
    const incomeCap = isTargeted
      ? (is3Plus ? county.targetedIncomeLimit3PlusPersonsUsd : county.targetedIncomeLimit1To2PersonsUsd)
      : (is3Plus ? county.incomeLimit3PlusPersonsUsd : county.incomeLimit1To2PersonsUsd);

    const exceedsStandardPriceCap = params.purchasePrice > priceCap;
    const exceedsStandardIncomeCap = params.householdIncome > incomeCap;

    // NextStep Loophole check
    if (exceedsStandardPriceCap) {
      if (params.householdIncome <= 125000) {
        return {
          recommendedProgram: OHCS_PROGRAMS_REGISTRY.next_step,
          isEligible: true,
          reasons: [
            `Purchase price ($${params.purchasePrice.toLocaleString()}) exceeds standard county cap ($${priceCap.toLocaleString()}).`,
            `Activated OHCS NextStep: Zero purchase price limit applies!`,
            `Household income ($${params.householdIncome.toLocaleString()}) is within the flat $125,000 NextStep statewide cap.`
          ],
          priceCap: 9999999, // Uncapped
          incomeCap: 125000,
          canUseNextStepBypass: true
        };
      } else {
        return {
          recommendedProgram: OHCS_PROGRAMS_REGISTRY.next_step,
          isEligible: false,
          reasons: [
            `Purchase price ($${params.purchasePrice.toLocaleString()}) exceeds county cap ($${priceCap.toLocaleString()}).`,
            `Household income ($${params.householdIncome.toLocaleString()}) exceeds the NextStep $125,000 cap.`
          ],
          priceCap: priceCap,
          incomeCap: 125000,
          canUseNextStepBypass: false
        };
      }
    }

    // Within standard price cap
    if (params.hasOwnDownPayment) {
      return {
        recommendedProgram: OHCS_PROGRAMS_REGISTRY.rate_advantage,
        isEligible: Boolean(!exceedsStandardIncomeCap && (params.isFirstTimeBuyer || isTargeted)),
        reasons: [
          `Borrower has personal down payment saved ($0 upfront cash needed).`,
          `Rate Advantage provides the lowest 30-year fixed rate to maximize monthly savings.`,
          exceedsStandardIncomeCap ? `Income ($${params.householdIncome.toLocaleString()}) exceeds county cap ($${incomeCap.toLocaleString()}).` : `Income qualifies under county limit.`
        ],
        priceCap,
        incomeCap,
        canUseNextStepBypass: false
      };
    } else {
      return {
        recommendedProgram: OHCS_PROGRAMS_REGISTRY.first_home,
        isEligible: Boolean(!exceedsStandardIncomeCap && (params.isFirstTimeBuyer || isTargeted)),
        reasons: [
          `Borrower needs upfront capital to close.`,
          `FirstHome Flex Lending provides 4% to 5% cash assistance ($29,250 cap) to wipe out cash out-of-pocket.`,
          exceedsStandardIncomeCap ? `Income ($${params.householdIncome.toLocaleString()}) exceeds county cap ($${incomeCap.toLocaleString()}).` : `Income qualifies under county limit.`
        ],
        priceCap,
        incomeCap,
        canUseNextStepBypass: false
      };
    }
  }
}
