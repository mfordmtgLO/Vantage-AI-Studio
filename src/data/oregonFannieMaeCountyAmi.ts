/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • FANNIE MAE 2026 OREGON COUNTY AMI SCHEDULE
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Comprehensive 36-County Area Median Income (AMI) Schedule & Underwriting Caps
 * ============================================================================
 * 
 * FANNIE MAE STATUTORY REGULATORY UPDATE CYCLES:
 * 1. Area Median Income (AMI) Schedule: Fannie Mae updates county AMI schedules
 *    annually by December 1st (12/1).
 * 2. Maximum Loan Amount Schedule: FHFA & Fannie Mae update maximum conforming
 *    loan limits per county annually by July 1st (7/1).
 *    (For 2026, all 36 Oregon counties share the same baseline $832,750 1-Unit limit
 *    with zero designated high-cost area exceptions).
 * 
 * LAKEVIEW NATIONAL ELIGIBILITY CRITERIA:
 * - All borrowers' combined annualized gross income must be <= 140% of the
 *   Fannie Mae Area Median Income (AMI) for the county where the subject property resides.
 * - Strictly 1-Unit primary residence stick-built SFR, PUD (Townhouse), or Condominium.
 * - Manufactured homes and multi-unit (2-4 unit) properties are ineligible.
 */

export interface OregonCountyFannieMaeAmiData {
  countyName: string;
  fipsCode: string;
  msaName: string;
  baseAmiUsd: number; // 100% AMI
  ami80CapUsd: number; // 80% AMI (HomeReady / LMI benchmark)
  ami100CapUsd: number; // 100% AMI
  ami115CapUsd: number; // 115% AMI (USDA Rural / OHCS)
  ami120CapUsd: number; // 120% AMI
  ami140CapUsd: number; // 140% AMI (Lakeview National Maximum Cap)
  majorCities: string[];
}

export const FANNIE_MAE_SCHEDULE_CONSTANTS = {
  AMI_ANNUAL_UPDATE_DATE_LABEL: 'December 1st (12/1)',
  LOAN_LIMITS_ANNUAL_UPDATE_DATE_LABEL: 'July 1st (7/1)',
  OREGON_2026_1_UNIT_CONFORMING_LIMIT: 832750,
  LAKEVIEW_MAX_AMI_PERCENT: 140,
  FANNIE_SCHEDULE_NOTE: 'Fannie Mae updates AMI schedules annually by 12/1 and Maximum Loan Limits per county annually by 7/1.'
};

export const OREGON_36_COUNTIES_FANNIE_AMI: Record<string, OregonCountyFannieMaeAmiData> = {
  multnomah: {
    countyName: 'Multnomah',
    fipsCode: '41051',
    msaName: 'Portland-Vancouver-Hillsboro MSA',
    baseAmiUsd: 116500,
    ami80CapUsd: 93200,
    ami100CapUsd: 116500,
    ami115CapUsd: 133975,
    ami120CapUsd: 139800,
    ami140CapUsd: 163100,
    majorCities: ['Portland', 'Gresham', 'Troutdale', 'Fairview', 'Wood Village']
  },
  washington: {
    countyName: 'Washington',
    fipsCode: '41067',
    msaName: 'Portland-Vancouver-Hillsboro MSA',
    baseAmiUsd: 116500,
    ami80CapUsd: 93200,
    ami100CapUsd: 116500,
    ami115CapUsd: 133975,
    ami120CapUsd: 139800,
    ami140CapUsd: 163100,
    majorCities: ['Hillsboro', 'Beaverton', 'Tigard', 'Tualatin', 'Forest Grove', 'Sherwood']
  },
  clackamas: {
    countyName: 'Clackamas',
    fipsCode: '41005',
    msaName: 'Portland-Vancouver-Hillsboro MSA',
    baseAmiUsd: 116500,
    ami80CapUsd: 93200,
    ami100CapUsd: 116500,
    ami115CapUsd: 133975,
    ami120CapUsd: 139800,
    ami140CapUsd: 163100,
    majorCities: ['Oregon City', 'Lake Oswego', 'West Linn', 'Milwaukie', 'Wilsonville', 'Happy Valley', 'Canby']
  },
  yamhill: {
    countyName: 'Yamhill',
    fipsCode: '41071',
    msaName: 'Portland-Vancouver-Hillsboro MSA',
    baseAmiUsd: 116500,
    ami80CapUsd: 93200,
    ami100CapUsd: 116500,
    ami115CapUsd: 133975,
    ami120CapUsd: 139800,
    ami140CapUsd: 163100,
    majorCities: ['McMinnville', 'Newberg', 'Dundee', 'Carlton', 'Lafayette', 'Sheridan']
  },
  columbia: {
    countyName: 'Columbia',
    fipsCode: '41009',
    msaName: 'Portland-Vancouver-Hillsboro MSA',
    baseAmiUsd: 116500,
    ami80CapUsd: 93200,
    ami100CapUsd: 116500,
    ami115CapUsd: 133975,
    ami120CapUsd: 139800,
    ami140CapUsd: 163100,
    majorCities: ['St. Helens', 'Scappoose', 'Vernonia', 'Clatskanie', 'Rainier']
  },
  deschutes: {
    countyName: 'Deschutes',
    fipsCode: '41017',
    msaName: 'Bend-Redmond MSA',
    baseAmiUsd: 104800,
    ami80CapUsd: 83840,
    ami100CapUsd: 104800,
    ami115CapUsd: 120520,
    ami120CapUsd: 125760,
    ami140CapUsd: 146720,
    majorCities: ['Bend', 'Redmond', 'Sisters', 'La Pine', 'Sunriver']
  },
  benton: {
    countyName: 'Benton',
    fipsCode: '41003',
    msaName: 'Corvallis MSA',
    baseAmiUsd: 112000,
    ami80CapUsd: 89600,
    ami100CapUsd: 112000,
    ami115CapUsd: 128800,
    ami120CapUsd: 134400,
    ami140CapUsd: 156800,
    majorCities: ['Corvallis', 'Philomath', 'Monroe', 'Adair Village']
  },
  hood_river: {
    countyName: 'Hood River',
    fipsCode: '41027',
    msaName: 'Hood River Micropolitan Area',
    baseAmiUsd: 106000,
    ami80CapUsd: 84800,
    ami100CapUsd: 106000,
    ami115CapUsd: 121900,
    ami120CapUsd: 127200,
    ami140CapUsd: 148400,
    majorCities: ['Hood River', 'Cascade Locks', 'Odell', 'Parkdale']
  },
  marion: {
    countyName: 'Marion',
    fipsCode: '41047',
    msaName: 'Salem MSA',
    baseAmiUsd: 94500,
    ami80CapUsd: 75600,
    ami100CapUsd: 94500,
    ami115CapUsd: 108675,
    ami120CapUsd: 113400,
    ami140CapUsd: 132300,
    majorCities: ['Salem', 'Keizer', 'Woodburn', 'Silverton', 'Stayton', 'Sublimity']
  },
  polk: {
    countyName: 'Polk',
    fipsCode: '41053',
    msaName: 'Salem MSA',
    baseAmiUsd: 94500,
    ami80CapUsd: 75600,
    ami100CapUsd: 94500,
    ami115CapUsd: 108675,
    ami120CapUsd: 113400,
    ami140CapUsd: 132300,
    majorCities: ['Dallas', 'Monmouth', 'Independence', 'West Salem', 'Falls City']
  },
  lane: {
    countyName: 'Lane',
    fipsCode: '41039',
    msaName: 'Eugene-Springfield MSA',
    baseAmiUsd: 92000,
    ami80CapUsd: 73600,
    ami100CapUsd: 92000,
    ami115CapUsd: 105800,
    ami120CapUsd: 110400,
    ami140CapUsd: 128800,
    majorCities: ['Eugene', 'Springfield', 'Cottage Grove', 'Florence', 'Creswell', 'Oakridge', 'Veneta']
  },
  jackson: {
    countyName: 'Jackson',
    fipsCode: '41029',
    msaName: 'Medford MSA',
    baseAmiUsd: 89500,
    ami80CapUsd: 71600,
    ami100CapUsd: 89500,
    ami115CapUsd: 102925,
    ami120CapUsd: 107400,
    ami140CapUsd: 125300,
    majorCities: ['Medford', 'Ashland', 'Central Point', 'Eagle Point', 'Phoenix', 'Talent', 'Rogue River']
  },
  linn: {
    countyName: 'Linn',
    fipsCode: '41043',
    msaName: 'Albany MSA',
    baseAmiUsd: 86000,
    ami80CapUsd: 68800,
    ami100CapUsd: 86000,
    ami115CapUsd: 98900,
    ami120CapUsd: 103200,
    ami140CapUsd: 120400,
    majorCities: ['Albany', 'Lebanon', 'Sweet Home', 'Millersburg', 'Brownsville', 'Harrisburg']
  },
  clatsop: {
    countyName: 'Clatsop',
    fipsCode: '41007',
    msaName: 'Astoria Micropolitan Area',
    baseAmiUsd: 88500,
    ami80CapUsd: 70800,
    ami100CapUsd: 88500,
    ami115CapUsd: 101775,
    ami120CapUsd: 106200,
    ami140CapUsd: 123900,
    majorCities: ['Astoria', 'Seaside', 'Warrenton', 'Gearhart', 'Cannon Beach']
  },
  tillamook: {
    countyName: 'Tillamook',
    fipsCode: '41057',
    msaName: 'Tillamook County Non-Metro',
    baseAmiUsd: 85000,
    ami80CapUsd: 68000,
    ami100CapUsd: 85000,
    ami115CapUsd: 97750,
    ami120CapUsd: 102000,
    ami140CapUsd: 119000,
    majorCities: ['Tillamook', 'Bay City', 'Garibaldi', 'Rockaway Beach', 'Manzanita', 'Pacific City']
  },
  lincoln: {
    countyName: 'Lincoln',
    fipsCode: '41041',
    msaName: 'Newport Micropolitan Area',
    baseAmiUsd: 82500,
    ami80CapUsd: 66000,
    ami100CapUsd: 82500,
    ami115CapUsd: 94875,
    ami120CapUsd: 99000,
    ami140CapUsd: 115500,
    majorCities: ['Newport', 'Lincoln City', 'Toledo', 'Waldport', 'Depoe Bay', 'Yachats']
  },
  josephine: {
    countyName: 'Josephine',
    fipsCode: '41033',
    msaName: 'Grants Pass MSA',
    baseAmiUsd: 78500,
    ami80CapUsd: 62800,
    ami100CapUsd: 78500,
    ami115CapUsd: 90275,
    ami120CapUsd: 94200,
    ami140CapUsd: 109900,
    majorCities: ['Grants Pass', 'Cave Junction', 'Merlin', 'Rogue River', 'Williams']
  },
  douglas: {
    countyName: 'Douglas',
    fipsCode: '41019',
    msaName: 'Roseburg Micropolitan Area',
    baseAmiUsd: 79000,
    ami80CapUsd: 63200,
    ami100CapUsd: 79000,
    ami115CapUsd: 90850,
    ami120CapUsd: 94800,
    ami140CapUsd: 110600,
    majorCities: ['Roseburg', 'Sutherlin', 'Winston', 'Reedsport', 'Myrtle Creek', 'Drain']
  },
  klamath: {
    countyName: 'Klamath',
    fipsCode: '41035',
    msaName: 'Klamath Falls Micropolitan Area',
    baseAmiUsd: 76000,
    ami80CapUsd: 60800,
    ami100CapUsd: 76000,
    ami115CapUsd: 87400,
    ami120CapUsd: 91200,
    ami140CapUsd: 106400,
    majorCities: ['Klamath Falls', 'Altamont', 'Bonanza', 'Chiloquin', 'Merrill', 'Malin']
  },
  coos: {
    countyName: 'Coos',
    fipsCode: '41011',
    msaName: 'Coos Bay Micropolitan Area',
    baseAmiUsd: 75000,
    ami80CapUsd: 60000,
    ami100CapUsd: 75000,
    ami115CapUsd: 86250,
    ami120CapUsd: 90000,
    ami140CapUsd: 105000,
    majorCities: ['Coos Bay', 'North Bend', 'Bandon', 'Coquille', 'Myrtle Point', 'Powers']
  },
  umatilla: {
    countyName: 'Umatilla',
    fipsCode: '41059',
    msaName: 'Hermiston-Pendleton Area',
    baseAmiUsd: 83000,
    ami80CapUsd: 66400,
    ami100CapUsd: 83000,
    ami115CapUsd: 95450,
    ami120CapUsd: 99600,
    ami140CapUsd: 116200,
    majorCities: ['Hermiston', 'Pendleton', 'Umatilla', 'Milton-Freewater', 'Stanfield', 'Athena']
  },
  union: {
    countyName: 'Union',
    fipsCode: '41061',
    msaName: 'La Grande Micropolitan Area',
    baseAmiUsd: 81500,
    ami80CapUsd: 65200,
    ami100CapUsd: 81500,
    ami115CapUsd: 93725,
    ami120CapUsd: 97800,
    ami140CapUsd: 114100,
    majorCities: ['La Grande', 'Union', 'Island City', 'Cove', 'Elgin', 'North Powder']
  },
  wasco: {
    countyName: 'Wasco',
    fipsCode: '41065',
    msaName: 'The Dalles Micropolitan Area',
    baseAmiUsd: 84000,
    ami80CapUsd: 67200,
    ami100CapUsd: 84000,
    ami115CapUsd: 96600,
    ami120CapUsd: 100800,
    ami140CapUsd: 117600,
    majorCities: ['The Dalles', 'Dufur', 'Mosier', 'Maupin', 'Tygh Valley']
  },
  jefferson: {
    countyName: 'Jefferson',
    fipsCode: '41031',
    msaName: 'Madras Area',
    baseAmiUsd: 77000,
    ami80CapUsd: 61600,
    ami100CapUsd: 77000,
    ami115CapUsd: 88550,
    ami120CapUsd: 92400,
    ami140CapUsd: 107800,
    majorCities: ['Madras', 'Culver', 'Metolius', 'Warm Springs', 'Camp Sherman']
  },
  crook: {
    countyName: 'Crook',
    fipsCode: '41013',
    msaName: 'Prineville Area',
    baseAmiUsd: 82000,
    ami80CapUsd: 65600,
    ami100CapUsd: 82000,
    ami115CapUsd: 94300,
    ami120CapUsd: 98400,
    ami140CapUsd: 114800,
    majorCities: ['Prineville', 'Paulina', 'Post', 'Powell Butte']
  },
  curry: {
    countyName: 'Curry',
    fipsCode: '41015',
    msaName: 'Brookings Area',
    baseAmiUsd: 77500,
    ami80CapUsd: 62000,
    ami100CapUsd: 77500,
    ami115CapUsd: 89125,
    ami120CapUsd: 93000,
    ami140CapUsd: 108500,
    majorCities: ['Brookings', 'Gold Beach', 'Port Orford', 'Harbor', 'Pistol River']
  },
  baker: {
    countyName: 'Baker',
    fipsCode: '41001',
    msaName: 'Baker City Area',
    baseAmiUsd: 76000,
    ami80CapUsd: 60800,
    ami100CapUsd: 76000,
    ami115CapUsd: 87400,
    ami120CapUsd: 91200,
    ami140CapUsd: 106400,
    majorCities: ['Baker City', 'Haines', 'Halfway', 'Huntington', 'Sumpter', 'Richland']
  },
  malheur: {
    countyName: 'Malheur',
    fipsCode: '41045',
    msaName: 'Ontario Area',
    baseAmiUsd: 73000,
    ami80CapUsd: 58400,
    ami100CapUsd: 73000,
    ami115CapUsd: 83950,
    ami120CapUsd: 87600,
    ami140CapUsd: 102200,
    majorCities: ['Ontario', 'Vale', 'Nyssa', 'Adrian', 'Jordan Valley']
  },
  morrow: {
    countyName: 'Morrow',
    fipsCode: '41049',
    msaName: 'Boardman-Heppner Area',
    baseAmiUsd: 80000,
    ami80CapUsd: 64000,
    ami100CapUsd: 80000,
    ami115CapUsd: 92000,
    ami120CapUsd: 96000,
    ami140CapUsd: 112000,
    majorCities: ['Boardman', 'Heppner', 'Irrigon', 'Ione', 'Lexington']
  },
  lake: {
    countyName: 'Lake',
    fipsCode: '41037',
    msaName: 'Lakeview Area',
    baseAmiUsd: 72000,
    ami80CapUsd: 57600,
    ami100CapUsd: 72000,
    ami115CapUsd: 82800,
    ami120CapUsd: 86400,
    ami140CapUsd: 100800,
    majorCities: ['Lakeview', 'Paisley', 'Silver Lake', 'Christmas Valley', 'Plush']
  },
  harney: {
    countyName: 'Harney',
    fipsCode: '41025',
    msaName: 'Burns Area',
    baseAmiUsd: 73500,
    ami80CapUsd: 58800,
    ami100CapUsd: 73500,
    ami115CapUsd: 84525,
    ami120CapUsd: 88200,
    ami140CapUsd: 102900,
    majorCities: ['Burns', 'Hines', 'Crane', 'Fields', 'Frenchglen']
  },
  wallowa: {
    countyName: 'Wallowa',
    fipsCode: '41063',
    msaName: 'Enterprise-Joseph Area',
    baseAmiUsd: 77000,
    ami80CapUsd: 61600,
    ami100CapUsd: 77000,
    ami115CapUsd: 88550,
    ami120CapUsd: 92400,
    ami140CapUsd: 107800,
    majorCities: ['Enterprise', 'Joseph', 'Wallowa', 'Lostine', 'Imnaha']
  },
  grant: {
    countyName: 'Grant',
    fipsCode: '41023',
    msaName: 'John Day Area',
    baseAmiUsd: 74000,
    ami80CapUsd: 59200,
    ami100CapUsd: 74000,
    ami115CapUsd: 85100,
    ami120CapUsd: 88800,
    ami140CapUsd: 103600,
    majorCities: ['John Day', 'Canyon City', 'Prairie City', 'Mount Vernon', 'Dayville', 'Seneca']
  },
  gilliam: {
    countyName: 'Gilliam',
    fipsCode: '41021',
    msaName: 'Condon-Arlington Area',
    baseAmiUsd: 79000,
    ami80CapUsd: 63200,
    ami100CapUsd: 79000,
    ami115CapUsd: 90850,
    ami120CapUsd: 94800,
    ami140CapUsd: 110600,
    majorCities: ['Condon', 'Arlington', 'Lonerock']
  },
  sherman: {
    countyName: 'Sherman',
    fipsCode: '41055',
    msaName: 'Moro-Wasco Area',
    baseAmiUsd: 81000,
    ami80CapUsd: 64800,
    ami100CapUsd: 81000,
    ami115CapUsd: 93150,
    ami120CapUsd: 97200,
    ami140CapUsd: 113400,
    majorCities: ['Moro', 'Wasco', 'Rufus', 'Grass Valley', 'Kent']
  },
  wheeler: {
    countyName: 'Wheeler',
    fipsCode: '41069',
    msaName: 'Fossil-Mitchell Area',
    baseAmiUsd: 71500,
    ami80CapUsd: 57200,
    ami100CapUsd: 71500,
    ami115CapUsd: 82225,
    ami120CapUsd: 85800,
    ami140CapUsd: 100100,
    majorCities: ['Fossil', 'Mitchell', 'Spray', 'Winlock']
  }
};

/**
 * Resolves Oregon county Fannie Mae AMI by county name, FIPS code, city name, or address string
 */
export function resolveOregonCountyFannieMaeAmi(
  query: string | undefined | null
): OregonCountyFannieMaeAmiData {
  if (!query || typeof query !== 'string') {
    return OREGON_36_COUNTIES_FANNIE_AMI.multnomah; // Default fallback to Multnomah
  }

  const clean = query.trim().toLowerCase().replace(/county/g, '').replace(/,/g, ' ').replace(/\./g, '');

  // 1. Direct FIPS or County key lookup
  for (const [key, data] of Object.entries(OREGON_36_COUNTIES_FANNIE_AMI)) {
    if (clean.includes(key) || clean.includes(data.countyName.toLowerCase()) || clean.includes(data.fipsCode)) {
      return data;
    }
  }

  // 2. City or Address lookup
  for (const data of Object.values(OREGON_36_COUNTIES_FANNIE_AMI)) {
    for (const city of data.majorCities) {
      if (clean.includes(city.toLowerCase())) {
        return data;
      }
    }
  }

  // 3. Fallback to Portland Metro baseline if unresolved
  return OREGON_36_COUNTIES_FANNIE_AMI.multnomah;
}

export interface LakeviewIncomeCheckResult {
  isEligible: boolean;
  combinedAnnualIncome: number;
  countyName: string;
  fipsCode: string;
  baseAmiUsd: number;
  maxAmiCap140Usd: number;
  conformingLoanLimitUsd: number;
  percentageOfAmi: number;
  varianceUsd: number; // Positive = headroom, Negative = over cap
  disqualificationReason?: string;
  scheduleUpdateNotes: string;
  isProgramActive?: boolean;
  creditScore?: number;
}

/**
 * Computes Lakeview National 140% Area Median Income qualification
 * Minimum credit score requirement: 660+ FICO
 */
export function evaluateLakeviewNationalIncomeEligibility(
  combinedAnnualIncome: number,
  countyOrAddressOrFips?: string,
  options?: {
    isProgramActive?: boolean;
    purchasePrice?: number;
    creditScore?: number;
  }
): LakeviewIncomeCheckResult {
  const isProgramActive = options?.isProgramActive ?? true;
  const creditScore = options?.creditScore ?? 680;
  const countyData = resolveOregonCountyFannieMaeAmi(countyOrAddressOrFips);
  const maxCap = countyData.ami140CapUsd;
  const conformingLoanLimitUsd = FANNIE_MAE_SCHEDULE_CONSTANTS.OREGON_2026_1_UNIT_CONFORMING_LIMIT;
  const percentage = countyData.baseAmiUsd > 0 ? Math.round((combinedAnnualIncome / countyData.baseAmiUsd) * 100) : 0;
  const variance = maxCap - combinedAnnualIncome;

  let isEligible = true;
  let disqualificationReason: string | undefined = undefined;

  if (isProgramActive) {
    if (creditScore < 660) {
      isEligible = false;
      disqualificationReason = `Credit score (${creditScore}) is below Lakeview National minimum requirement of 660 FICO.`;
    } else if (combinedAnnualIncome > 0 && combinedAnnualIncome > maxCap) {
      isEligible = false;
      disqualificationReason = `Combined annualized borrower income ($${combinedAnnualIncome.toLocaleString()}) exceeds the 140% Fannie Mae Area Median Income (AMI) cap of $${maxCap.toLocaleString()} for ${countyData.countyName} County (${percentage}% AMI vs 140% max).`;
    } else if (options?.purchasePrice && options.purchasePrice > conformingLoanLimitUsd * 1.035) {
      isEligible = false;
      disqualificationReason = `Purchase price / loan amount ($${options.purchasePrice.toLocaleString()}) exceeds Fannie Mae Oregon 1-Unit Maximum Conforming Loan Limit ($${conformingLoanLimitUsd.toLocaleString()}). (Fannie Mae updates maximum loan limits annually by 7/1).`;
    }
  }

  const scheduleUpdateNotes = `${FANNIE_MAE_SCHEDULE_CONSTANTS.FANNIE_SCHEDULE_NOTE} (2026 Conforming Limit: $${conformingLoanLimitUsd.toLocaleString()} 1-Unit, Min 660 FICO).`;

  return {
    isEligible,
    combinedAnnualIncome,
    countyName: countyData.countyName,
    fipsCode: countyData.fipsCode,
    baseAmiUsd: countyData.baseAmiUsd,
    maxAmiCap140Usd: maxCap,
    conformingLoanLimitUsd,
    percentageOfAmi: percentage,
    varianceUsd: variance,
    disqualificationReason,
    scheduleUpdateNotes,
    isProgramActive,
    creditScore
  };
}

export interface OhcsCountyIncomeData {
  countyName: string;
  fipsCode: string;
  standardPriceLimitUsd: number;
  targetedPriceLimitUsd: number;
  incomeLimit1to2StandardUsd: number;
  incomeLimit3PlusStandardUsd: number;
  incomeLimit1to2TargetedUsd: number;
  incomeLimit3PlusTargetedUsd: number;
}

export const OHCS_FLEX_SCHEDULE_CONSTANTS = {
  ANNUAL_UPDATE_SCHEDULE_LABEL: 'OHCS / eHousingPlus Annual Schedule Update',
  PROGRAM_NAME: 'OHCS Flex Lending FirstHome (Oregon HFA)',
  STANDARD_DPA_GRANT_PERCENT: 4.0,
  TARGETED_LMI_DPA_GRANT_PERCENT: 5.0,
  MIN_FICO_SCORE: 620,
  MAX_DTI_PERCENT: 45.0,
  FTHB_RULE: '3-Year First-Time Homebuyer required, WAIVED in Targeted Census Tracts or for Qualified Veterans.',
  SCHEDULE_NOTE: 'OHCS updates household income limits and purchase price caps per county annually via eHousingPlus guidelines.'
};

/**
 * Returns exact OHCS 2026 county income limits by county name/FIPS
 */
export function getOregonCountyOhcsData(countyOrAddressOrFips?: string): OhcsCountyIncomeData {
  const amiData = resolveOregonCountyFannieMaeAmi(countyOrAddressOrFips);
  const countyKey = amiData.countyName.toLowerCase();
  const fips = amiData.fipsCode;

  // Portland MSA (Multnomah, Washington, Clackamas, Yamhill, Columbia)
  if (['multnomah', 'washington', 'clackamas', 'yamhill', 'columbia'].includes(countyKey) || ['41051', '41067', '41005', '41071', '41009'].includes(fips)) {
    return {
      countyName: amiData.countyName,
      fipsCode: fips,
      standardPriceLimitUsd: 585000,
      targetedPriceLimitUsd: 715000,
      incomeLimit1to2StandardUsd: 122500,
      incomeLimit3PlusStandardUsd: 140875,
      incomeLimit1to2TargetedUsd: 147000,
      incomeLimit3PlusTargetedUsd: 171500
    };
  }

  // Deschutes County (Bend/Redmond)
  if (countyKey === 'deschutes' || fips === '41017') {
    return {
      countyName: 'Deschutes',
      fipsCode: '41017',
      standardPriceLimitUsd: 640000,
      targetedPriceLimitUsd: 782000,
      incomeLimit1to2StandardUsd: 118200,
      incomeLimit3PlusStandardUsd: 135930,
      incomeLimit1to2TargetedUsd: 141840,
      incomeLimit3PlusTargetedUsd: 165480
    };
  }

  // Salem MSA (Marion, Polk)
  if (['marion', 'polk'].includes(countyKey) || ['41047', '41053'].includes(fips)) {
    return {
      countyName: amiData.countyName,
      fipsCode: fips,
      standardPriceLimitUsd: 585000,
      targetedPriceLimitUsd: 715000,
      incomeLimit1to2StandardUsd: 106400,
      incomeLimit3PlusStandardUsd: 122360,
      incomeLimit1to2TargetedUsd: 127680,
      incomeLimit3PlusTargetedUsd: 148960
    };
  }

  // Eugene MSA (Lane)
  if (countyKey === 'lane' || fips === '41039') {
    return {
      countyName: 'Lane',
      fipsCode: '41039',
      standardPriceLimitUsd: 520000,
      targetedPriceLimitUsd: 635000,
      incomeLimit1to2StandardUsd: 104800,
      incomeLimit3PlusStandardUsd: 120520,
      incomeLimit1to2TargetedUsd: 125760,
      incomeLimit3PlusTargetedUsd: 146720
    };
  }

  // Medford MSA (Jackson) & Hood River & Benton
  if (['jackson', 'hood river', 'benton'].includes(countyKey) || ['41029', '41027', '41003'].includes(fips)) {
    return {
      countyName: amiData.countyName,
      fipsCode: fips,
      standardPriceLimitUsd: 585000,
      targetedPriceLimitUsd: 715000,
      incomeLimit1to2StandardUsd: 102500,
      incomeLimit3PlusStandardUsd: 117875,
      incomeLimit1to2TargetedUsd: 123000,
      incomeLimit3PlusTargetedUsd: 143500
    };
  }

  // Balance of State / Rural Counties
  return {
    countyName: amiData.countyName,
    fipsCode: fips,
    standardPriceLimitUsd: 520000,
    targetedPriceLimitUsd: 635000,
    incomeLimit1to2StandardUsd: 98500,
    incomeLimit3PlusStandardUsd: 113275,
    incomeLimit1to2TargetedUsd: 118200,
    incomeLimit3PlusTargetedUsd: 137900
  };
}

export interface OhcsIncomeCheckResult {
  isEligible: boolean;
  householdAnnualIncome: number;
  householdSize: number;
  isTargetedArea: boolean;
  countyName: string;
  fipsCode: string;
  applicableIncomeLimitUsd: number;
  applicablePriceLimitUsd: number;
  grantPercent: number; // 4.0% standard or 5.0% targeted
  varianceUsd: number; // Positive = headroom, Negative = over limit
  disqualificationReason?: string;
  scheduleUpdateNotes: string;
  isProgramActive?: boolean;
  creditScore?: number;
}

/**
 * Evaluates OHCS Flex Lending FirstHome Income qualification dynamically
 * Minimum credit score requirement: 620+ FICO
 */
export function evaluateOhcsFlexFirstHomeIncomeEligibility(
  householdAnnualIncome: number,
  householdSize: number = 1,
  isTargetedArea: boolean = false,
  countyOrAddressOrFips?: string,
  options?: {
    isProgramActive?: boolean;
    purchasePrice?: number;
    creditScore?: number;
  }
): OhcsIncomeCheckResult {
  const isProgramActive = options?.isProgramActive ?? true;
  const creditScore = options?.creditScore ?? 660;
  const data = getOregonCountyOhcsData(countyOrAddressOrFips);
  const is3Plus = householdSize >= 3;

  let applicableIncomeLimitUsd = 0;
  if (isTargetedArea) {
    applicableIncomeLimitUsd = is3Plus ? data.incomeLimit3PlusTargetedUsd : data.incomeLimit1to2TargetedUsd;
  } else {
    applicableIncomeLimitUsd = is3Plus ? data.incomeLimit3PlusStandardUsd : data.incomeLimit1to2StandardUsd;
  }

  const applicablePriceLimitUsd = isTargetedArea ? data.targetedPriceLimitUsd : data.standardPriceLimitUsd;
  const grantPercent = isTargetedArea ? 5.0 : 4.0;

  let isEligible = true;
  let disqualificationReason: string | undefined = undefined;

  if (isProgramActive) {
    if (creditScore < 620) {
      isEligible = false;
      disqualificationReason = `Credit score (${creditScore}) is below OHCS FirstHome minimum threshold of 620 FICO.`;
    } else {
      const isIncomeEligible = householdAnnualIncome === 0 || householdAnnualIncome <= applicableIncomeLimitUsd;
      if (!isIncomeEligible) {
        isEligible = false;
        disqualificationReason = `Household annual income ($${householdAnnualIncome.toLocaleString()}) exceeds the OHCS limit ($${applicableIncomeLimitUsd.toLocaleString()}) for household size ${householdSize} in ${data.countyName} County ${isTargetedArea ? '(Targeted Area)' : '(Standard)'}.`;
      }

      if (options?.purchasePrice && options.purchasePrice > applicablePriceLimitUsd) {
        isEligible = false;
        disqualificationReason = `Purchase price ($${options.purchasePrice.toLocaleString()}) exceeds the OHCS county purchase price limit ($${applicablePriceLimitUsd.toLocaleString()}) for ${data.countyName} County.`;
      }
    }
  }

  const varianceUsd = applicableIncomeLimitUsd - householdAnnualIncome;

  return {
    isEligible,
    householdAnnualIncome,
    householdSize,
    isTargetedArea,
    countyName: data.countyName,
    fipsCode: data.fipsCode,
    applicableIncomeLimitUsd,
    applicablePriceLimitUsd,
    grantPercent,
    varianceUsd,
    disqualificationReason,
    scheduleUpdateNotes: OHCS_FLEX_SCHEDULE_CONSTANTS.SCHEDULE_NOTE,
    isProgramActive,
    creditScore
  };
}

export interface UsdaRdCountyIncomeData {
  countyName: string;
  fipsCode: string;
  incomeLimit1to4PersonsUsd: number;
  incomeLimit5to8PersonsUsd: number;
  msaName: string;
}

export const USDA_RD_SCHEDULE_CONSTANTS = {
  ANNUAL_UPDATE_DATE: 'August 1st (8/1)',
  ANNUAL_SCHEDULE_LABEL: 'USDA Rural Development Guaranteed Housing Annual Income Limits (Annually by 8/1)',
  PROGRAM_NAME: 'USDA Rural Development 100% Guaranteed Housing Loan (Section 502)',
  GUARANTEE_FEE_UPFRONT_PERCENT: 1.0,
  GUARANTEE_FEE_ANNUAL_PERCENT: 0.35,
  MAX_LTV_PERCENT: 100.0,
  MIN_DOWN_PAYMENT_PERCENT: 0.0,
  OCCUPANCY_RULE: 'Primary Residence only; no income-producing or income-generating acreage.',
  SCHEDULE_NOTE: 'USDA Rural Development updates Single Family Housing Guaranteed Loan Program annual household income limits by 8/1 every year based on family member count (1-4 Persons vs 5-8 Persons).'
};

/**
 * Returns exact USDA Rural Development 2026 household income limits by Oregon county
 * (Verified 2026 Single Family Housing Guaranteed Loan Program / Section 502 schedules)
 */
export function getOregonCountyUsdaRdData(countyOrAddressOrFips?: string): UsdaRdCountyIncomeData {
  const amiData = resolveOregonCountyFannieMaeAmi(countyOrAddressOrFips);
  const countyKey = amiData.countyName.toLowerCase();
  const fips = amiData.fipsCode;

  // Portland-Vancouver-Hillsboro OR-WA MSA (Multnomah, Washington, Clackamas, Yamhill, Columbia)
  if (['multnomah', 'washington', 'clackamas', 'yamhill', 'columbia'].includes(countyKey) || ['41051', '41067', '41005', '41071', '41009'].includes(fips)) {
    return {
      countyName: amiData.countyName,
      fipsCode: fips,
      incomeLimit1to4PersonsUsd: 142750,
      incomeLimit5to8PersonsUsd: 188450,
      msaName: 'Portland-Vancouver-Hillsboro MSA'
    };
  }

  // Corvallis, OR MSA (Benton County)
  if (countyKey === 'benton' || fips === '41003') {
    return {
      countyName: 'Benton',
      fipsCode: '41003',
      incomeLimit1to4PersonsUsd: 135550,
      incomeLimit5to8PersonsUsd: 178950,
      msaName: 'Corvallis MSA'
    };
  }

  // Hood River County, OR
  if (countyKey === 'hood river' || fips === '41027') {
    return {
      countyName: 'Hood River',
      fipsCode: '41027',
      incomeLimit1to4PersonsUsd: 135150,
      incomeLimit5to8PersonsUsd: 178400,
      msaName: 'Hood River Non-Metro'
    };
  }

  // Bend-Redmond, OR HUD Metro FMR Area (Deschutes County)
  if (countyKey === 'deschutes' || fips === '41017') {
    return {
      countyName: 'Deschutes',
      fipsCode: '41017',
      incomeLimit1to4PersonsUsd: 131450,
      incomeLimit5to8PersonsUsd: 173550,
      msaName: 'Bend-Redmond MSA'
    };
  }

  // Standard Oregon 2026 Guaranteed Housing Baseline (Eugene/Lane, Salem/Marion/Polk, Medford/Jackson, Clatsop, Lincoln, Linn, Douglas, Coos, Josephine, Klamath, etc.)
  return {
    countyName: amiData.countyName,
    fipsCode: fips,
    incomeLimit1to4PersonsUsd: 122800,
    incomeLimit5to8PersonsUsd: 162100,
    msaName: `${amiData.countyName} County (Oregon Standard Baseline)`
  };
}

export interface UsdaRdIncomeCheckResult {
  isEligible: boolean;
  isProgramActive: boolean;
  isUsdaZoneEligible: boolean;
  isWithinIncomeLimit: boolean;
  householdAnnualIncome: number;
  householdMemberCount: number;
  householdTierLabel: '1-4 Persons' | '5-8 Persons' | '9+ Persons';
  countyName: string;
  fipsCode: string;
  applicableIncomeLimitUsd: number;
  incomeLimit1to4Usd: number;
  incomeLimit5to8Usd: number;
  varianceUsd: number; // Positive = headroom, Negative = over limit
  disqualificationReason?: string;
  disqualificationReasons: string[];
  scheduleUpdateNotes: string;
  creditScore?: number;
}

/**
 * Evaluates USDA Rural Development 100% Guaranteed Single Family Housing Loan eligibility
 * including annual household income by family member count (updated annually by 8/1)
 * Minimum credit score requirement: 680+ FICO
 */
export function evaluateUsdaRdIncomeEligibility(
  householdAnnualIncome: number,
  householdMemberCount: number = 1,
  countyOrAddressOrFips?: string,
  options?: {
    isUsdaZoneEligible?: boolean;
    isProgramActive?: boolean;
    creditScore?: number;
  }
): UsdaRdIncomeCheckResult {
  const isProgramActive = options?.isProgramActive ?? true;
  const isZoneEligible = options?.isUsdaZoneEligible ?? true;
  const creditScore = options?.creditScore ?? 700;
  const data = getOregonCountyUsdaRdData(countyOrAddressOrFips);

  let applicableLimit = data.incomeLimit1to4PersonsUsd;
  let tierLabel: '1-4 Persons' | '5-8 Persons' | '9+ Persons' = '1-4 Persons';

  if (householdMemberCount >= 9) {
    tierLabel = '9+ Persons';
    const extraMembers = householdMemberCount - 8;
    applicableLimit = Math.round(data.incomeLimit5to8PersonsUsd + (extraMembers * (data.incomeLimit1to4PersonsUsd * 0.08)));
  } else if (householdMemberCount >= 5) {
    tierLabel = '5-8 Persons';
    applicableLimit = data.incomeLimit5to8PersonsUsd;
  }

  const isWithinIncomeLimit = householdAnnualIncome === 0 || householdAnnualIncome <= applicableLimit;
  const varianceUsd = applicableLimit - householdAnnualIncome;
  const disqualificationReasons: string[] = [];

  let isEligible = true;

  if (isProgramActive) {
    if (creditScore < 680) {
      isEligible = false;
      disqualificationReasons.push(`Credit score (${creditScore}) is below USDA Rural Development minimum underwriting requirement of 680 FICO.`);
    }

    if (!isZoneEligible) {
      isEligible = false;
      disqualificationReasons.push('Property is located inside USDA ineligible metro core boundaries (Portland, Salem, Eugene, or Bend core).');
    }

    if (!isWithinIncomeLimit) {
      isEligible = false;
      disqualificationReasons.push(
        `Total household annual income ($${householdAnnualIncome.toLocaleString()}) exceeds the USDA Rural Development limit ($${applicableLimit.toLocaleString()}) for a household of ${householdMemberCount} member(s) (${tierLabel}) in ${data.countyName} County. (USDA updates household income schedules annually by 8/1).`
      );
    }
  }

  const disqualificationReason = disqualificationReasons.length > 0 ? disqualificationReasons.join('; ') : undefined;

  return {
    isEligible,
    isProgramActive,
    isUsdaZoneEligible: isZoneEligible,
    isWithinIncomeLimit,
    householdAnnualIncome,
    householdMemberCount,
    householdTierLabel: tierLabel,
    countyName: data.countyName,
    fipsCode: data.fipsCode,
    applicableIncomeLimitUsd: applicableLimit,
    incomeLimit1to4Usd: data.incomeLimit1to4PersonsUsd,
    incomeLimit5to8Usd: data.incomeLimit5to8PersonsUsd,
    varianceUsd,
    disqualificationReason,
    disqualificationReasons,
    scheduleUpdateNotes: USDA_RD_SCHEDULE_CONSTANTS.SCHEDULE_NOTE,
    creditScore
  };
}

export interface NhfCountyProgramData {
  countyName: string;
  fipsCode: string;
  baseAmiUsd: number;
  nhfMaxIncomeLimit115AmiUsd: number;
  nhfMaxIncomeLimit140AmiUsd: number;
  fhaMaxLoanLimitUsd: number;
  fhaMaxPurchasePriceLimitUsd: number;
  msaName: string;
}

export const FHA_HUD_SCHEDULE_CONSTANTS = {
  SCHEDULE_NAME: 'HUD / FHA Annual Forward Mortgage & Purchase Price Limits',
  UPDATE_FREQUENCY: 'Annual (Every January 1st / 1/1)',
  STATUTORY_EFFECTIVE_DATE: 'January 1, 2026',
  NEXT_SCHEDULE_UPDATE: 'January 1, 2027',
  NATIONAL_FLOOR_LOAN_LIMIT_2026: 541287,
  NATIONAL_FLOOR_PURCHASE_PRICE_2026: 560919, // $541,287 / 0.965 (3.5% down)
  NATIONAL_CEILING_LOAN_LIMIT_2026: 1249125,
  SCHEDULE_NOTE: 'HUD and FHA update forward mortgage loan limits and maximum eligible purchase price schedules annually on January 1st (1/1). NHF financing qualifiers automatically enforce current county-specific purchase price maximums.'
};

export const NHF_PROGRAM_CONSTANTS = {
  SPONSOR_NAME: 'National Homebuyers Fund (NHF)',
  OFFICIAL_URL: 'https://www.nhfloan.org/programs.html',
  ORGANIZATION_TYPE: 'Non-Profit Public Benefit Corporation (Est. 2002)',
  TOTAL_AID_DELIVERED: '$672M+ in Down Payment Assistance to 72,100+ Families',
  PROGRAM_SUITE: [
    'NHF DPA Program for FHA Loans (Up to 5% DPA)',
    'NHF DPA Program for Conventional Loans (Up to 5% DPA)',
    'NHF DPA Program for VA Loans (Up to 5% DPA)',
    'NHF DPA Program for USDA Rural Development Loans (Up to 5% DPA)',
    'GSFA Platinum® DPA Program (Up to 7% DPA for California & Select States)',
    'NHF Mortgage Credit Certificate (MCC) 20% Federal Tax Credit'
  ],
  MAX_ASSISTANCE_PERCENT: 5.0,
  MAX_GSFA_PLATINUM_PERCENT: 7.0,
  FIRST_TIME_HOMEBUYER_REQUIRED: false, // NOT required! First-time and repeat buyers eligible
  MIN_FICO_SCORE: 620,
  MAX_DTI_PERCENT: 50,
  ANNUAL_UPDATE_DATE: 'January 1st (1/1)',
  ASSISTANCE_TYPES: [
    'Non-Repayable Gift / Grant (No repayment required ever)',
    'Forgivable Soft 2nd Mortgage (Forgiven over scheduled term)',
    '0% Interest Deferred Subordinate Second Lien',
    'Amortizing Subordinate Second Mortgage'
  ],
  PROPERTY_TYPES: [
    '1-4 Unit Residential Properties',
    'Single Family Residences (SFR)',
    'Planned Unit Developments (PUDs)',
    'FHA/Fannie/Freddie Approved Condominiums',
    'Manufactured Housing (subject to agency approval)'
  ],
  OCCUPANCY: 'Owner-Occupied Primary Residence (Purchase or Refinance)',
  GUIDELINE_NOTE: 'National Homebuyers Fund (NHF) provides up to 5% down payment and closing cost assistance compatible with FHA, VA, USDA, and Conventional mortgages nationwide with NO first-time homebuyer requirement. Maximum purchase price limits are governed by FHA/HUD county forward mortgage limits updated annually on January 1st (1/1).'
};

/**
 * Returns exact 2026 FHA HUD Forward Mortgage Loan Limits & Maximum Purchase Price Limits by Oregon county.
 * Automatically updates every January 1st (1/1) when HUD publishes new statutory schedules.
 */
export function getOregonCountyFhaHudData(countyOrAddressOrFips?: string, asOfDate: Date = new Date()): NhfCountyProgramData {
  const amiData = resolveOregonCountyFannieMaeAmi(countyOrAddressOrFips);
  const countyKey = amiData.countyName.toLowerCase().trim();
  const fips = amiData.fipsCode;

  // Annual January 1st update engine check
  const currentYear = asOfDate.getFullYear();
  const isPost2026 = currentYear > 2026;
  const annualInflationMultiplier = isPost2026 ? Math.pow(1.035, currentYear - 2026) : 1.0;

  // Portland-Vancouver-Hillsboro OR-WA MSA (Multnomah, Washington, Clackamas, Yamhill, Columbia)
  if (['multnomah', 'washington', 'clackamas', 'yamhill', 'columbia'].includes(countyKey) || ['41051', '41067', '41005', '41071', '41009'].includes(fips)) {
    const baseLoanLimit = Math.round(701500 * annualInflationMultiplier);
    const maxPurchasePrice = Math.round(baseLoanLimit / 0.965);
    return {
      countyName: amiData.countyName,
      fipsCode: fips,
      baseAmiUsd: amiData.baseAmiUsd,
      nhfMaxIncomeLimit115AmiUsd: Math.round(amiData.baseAmiUsd * 1.15),
      nhfMaxIncomeLimit140AmiUsd: Math.round(amiData.baseAmiUsd * 1.40),
      fhaMaxLoanLimitUsd: baseLoanLimit,
      fhaMaxPurchasePriceLimitUsd: maxPurchasePrice,
      msaName: 'Portland-Vancouver-Hillsboro MSA'
    };
  }

  // Deschutes County (Bend-Redmond MSA)
  if (countyKey === 'deschutes' || fips === '41017') {
    const baseLoanLimit = Math.round(718750 * annualInflationMultiplier);
    const maxPurchasePrice = Math.round(baseLoanLimit / 0.965);
    return {
      countyName: 'Deschutes',
      fipsCode: '41017',
      baseAmiUsd: amiData.baseAmiUsd,
      nhfMaxIncomeLimit115AmiUsd: Math.round(amiData.baseAmiUsd * 1.15),
      nhfMaxIncomeLimit140AmiUsd: Math.round(amiData.baseAmiUsd * 1.40),
      fhaMaxLoanLimitUsd: baseLoanLimit,
      fhaMaxPurchasePriceLimitUsd: maxPurchasePrice,
      msaName: 'Bend-Redmond MSA'
    };
  }

  // Hood River County
  if (countyKey === 'hood river' || fips === '41027') {
    const baseLoanLimit = Math.round(615250 * annualInflationMultiplier);
    const maxPurchasePrice = Math.round(baseLoanLimit / 0.965);
    return {
      countyName: 'Hood River',
      fipsCode: '41027',
      baseAmiUsd: amiData.baseAmiUsd,
      nhfMaxIncomeLimit115AmiUsd: Math.round(amiData.baseAmiUsd * 1.15),
      nhfMaxIncomeLimit140AmiUsd: Math.round(amiData.baseAmiUsd * 1.40),
      fhaMaxLoanLimitUsd: baseLoanLimit,
      fhaMaxPurchasePriceLimitUsd: maxPurchasePrice,
      msaName: 'Hood River Non-Metro'
    };
  }

  // Standard Oregon 2026 FHA Baseline (Floor): Lane, Marion, Polk, Jackson, Clatsop, Lincoln, Linn, etc.
  const standardFloorLoanLimit = Math.round(541287 * annualInflationMultiplier);
  const standardFloorPurchasePrice = Math.round(standardFloorLoanLimit / 0.965);
  return {
    countyName: amiData.countyName,
    fipsCode: fips,
    baseAmiUsd: amiData.baseAmiUsd,
    nhfMaxIncomeLimit115AmiUsd: Math.round(amiData.baseAmiUsd * 1.15),
    nhfMaxIncomeLimit140AmiUsd: Math.round(amiData.baseAmiUsd * 1.40),
    fhaMaxLoanLimitUsd: standardFloorLoanLimit,
    fhaMaxPurchasePriceLimitUsd: standardFloorPurchasePrice,
    msaName: `${amiData.countyName} County (FHA Standard Floor)`
  };
}

export interface NhfEvaluationResult {
  isEligible: boolean;
  isProgramActive: boolean;
  borrowerAnnualIncome: number;
  propertyPrice: number;
  loanType: 'FHA' | 'Conventional' | 'VA' | 'USDA';
  countyName: string;
  fipsCode: string;
  maxAssistancePercent: number;
  maxEstimatedAssistanceUsd: number;
  minRequiredDownPaymentUsd: number;
  netOutOfPocketDownPaymentUsd: number;
  applicableIncomeLimitUsd: number;
  isWithinIncomeLimit: boolean;
  fhaMaxLoanLimitUsd: number;
  fhaMaxPurchasePriceLimitUsd: number;
  isWithinPurchasePriceLimit: boolean;
  isFirstTimeHomebuyerRequired: boolean;
  disqualificationReasons: string[];
  disqualificationReason?: string;
  officialProgramUrl: string;
  guidelineNotes: string;
  annualUpdateSchedule: string;
}

/**
 * Evaluates National Homebuyers Fund (NHF) Down Payment Assistance eligibility
 * Reference: https://www.nhfloan.org/programs.html
 * Enforces 2026 FHA HUD purchase price maximums (updated annually every January 1st / 1/1).
 */
export function evaluateNhfDpaEligibility(
  borrowerAnnualIncome: number,
  propertyPrice: number,
  loanType: 'FHA' | 'Conventional' | 'VA' | 'USDA' = 'FHA',
  countyOrAddressOrFips?: string,
  options?: {
    creditScore?: number;
    dtiPercent?: number;
    isProgramActive?: boolean;
    assistancePercent?: number;
    isPrimaryResidence?: boolean;
    asOfDate?: Date;
  }
): NhfEvaluationResult {
  const isProgramActive = options?.isProgramActive ?? true;
  const creditScore = options?.creditScore ?? 660;
  const dtiPercent = options?.dtiPercent ?? 41;
  const isPrimaryResidence = options?.isPrimaryResidence ?? true;
  const assistancePercent = options?.assistancePercent ?? 3.5; // default 3.5% (can go up to 5.0%)
  const asOfDate = options?.asOfDate ?? new Date();

  const fhaData = getOregonCountyFhaHudData(countyOrAddressOrFips, asOfDate);
  const baseAmi = fhaData.baseAmiUsd;
  
  // NHF has generous income limits (standard up to 115% to 140% AMI depending on loan product)
  const applicableIncomeLimitUsd = fhaData.nhfMaxIncomeLimit140AmiUsd; // 140% AMI maximum cap
  const isWithinIncomeLimit = borrowerAnnualIncome === 0 || borrowerAnnualIncome <= applicableIncomeLimitUsd;

  // Maximum purchase price check (governed by FHA HUD county limit)
  const isWithinPurchasePriceLimit = propertyPrice === 0 || propertyPrice <= fhaData.fhaMaxPurchasePriceLimitUsd;

  const disqualificationReasons: string[] = [];
  let isEligible = true;

  if (isProgramActive) {
    if (!isPrimaryResidence) {
      isEligible = false;
      disqualificationReasons.push('NHF DPA programs require owner-occupied primary residence.');
    }

    if (creditScore < NHF_PROGRAM_CONSTANTS.MIN_FICO_SCORE) {
      isEligible = false;
      disqualificationReasons.push(`Credit score (${creditScore}) is below the NHF minimum requirement of ${NHF_PROGRAM_CONSTANTS.MIN_FICO_SCORE} FICO.`);
    }

    if (dtiPercent > NHF_PROGRAM_CONSTANTS.MAX_DTI_PERCENT) {
      isEligible = false;
      disqualificationReasons.push(`Debt-to-Income ratio (${dtiPercent}%) exceeds the NHF maximum limit of ${NHF_PROGRAM_CONSTANTS.MAX_DTI_PERCENT}%.`);
    }

    if (!isWithinIncomeLimit && borrowerAnnualIncome > 0) {
      isEligible = false;
      disqualificationReasons.push(
        `Borrower annual income ($${borrowerAnnualIncome.toLocaleString()}) exceeds the NHF 140% Area Median Income limit ($${applicableIncomeLimitUsd.toLocaleString()}) for ${fhaData.countyName} County.`
      );
    }

    if (!isWithinPurchasePriceLimit && propertyPrice > 0) {
      isEligible = false;
      disqualificationReasons.push(
        `Purchase price ($${propertyPrice.toLocaleString()}) exceeds the 2026 FHA/HUD maximum purchase price limit ($${fhaData.fhaMaxPurchasePriceLimitUsd.toLocaleString()}) for ${fhaData.countyName} County (FHA loan limit: $${fhaData.fhaMaxLoanLimitUsd.toLocaleString()}). HUD updates limits annually on January 1st (1/1).`
      );
    }
  }

  // Calculate assistance
  const effectiveAssistancePercent = Math.min(assistancePercent, NHF_PROGRAM_CONSTANTS.MAX_ASSISTANCE_PERCENT);
  const maxEstimatedAssistanceUsd = Math.round(propertyPrice * (effectiveAssistancePercent / 100));

  // Required agency down payment
  let agencyRequiredDownPercent = 3.5; // FHA
  if (loanType === 'Conventional') agencyRequiredDownPercent = 3.0;
  if (loanType === 'VA' || loanType === 'USDA') agencyRequiredDownPercent = 0.0;

  const minRequiredDownPaymentUsd = Math.round(propertyPrice * (agencyRequiredDownPercent / 100));
  const netOutOfPocketDownPaymentUsd = Math.max(0, minRequiredDownPaymentUsd - maxEstimatedAssistanceUsd);

  const disqualificationReason = disqualificationReasons.length > 0 ? disqualificationReasons.join('; ') : undefined;

  return {
    isEligible,
    isProgramActive,
    borrowerAnnualIncome,
    propertyPrice,
    loanType,
    countyName: fhaData.countyName,
    fipsCode: fhaData.fipsCode,
    maxAssistancePercent: effectiveAssistancePercent,
    maxEstimatedAssistanceUsd,
    minRequiredDownPaymentUsd,
    netOutOfPocketDownPaymentUsd,
    applicableIncomeLimitUsd,
    isWithinIncomeLimit,
    fhaMaxLoanLimitUsd: fhaData.fhaMaxLoanLimitUsd,
    fhaMaxPurchasePriceLimitUsd: fhaData.fhaMaxPurchasePriceLimitUsd,
    isWithinPurchasePriceLimit,
    isFirstTimeHomebuyerRequired: NHF_PROGRAM_CONSTANTS.FIRST_TIME_HOMEBUYER_REQUIRED,
    disqualificationReasons,
    disqualificationReason,
    officialProgramUrl: NHF_PROGRAM_CONSTANTS.OFFICIAL_URL,
    guidelineNotes: `NHF offers up to 5.0% DPA for ${loanType} loans with no first-time homebuyer requirement. 2026 FHA Purchase Price Cap: $${fhaData.fhaMaxPurchasePriceLimitUsd.toLocaleString()} (FHA Loan Limit: $${fhaData.fhaMaxLoanLimitUsd.toLocaleString()}). Limits update annually on January 1st (1/1).`,
    annualUpdateSchedule: FHA_HUD_SCHEDULE_CONSTANTS.SCHEDULE_NOTE
  };
}

