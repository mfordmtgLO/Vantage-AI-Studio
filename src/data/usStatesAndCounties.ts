/**
 * @file usStatesAndCounties.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Comprehensive 50-State and County Registry for Renter-to-Homeowner Intelligence Feed
 * Supports seamless State Dropdown -> Submenu County Cascading Selector with localized DPA programs.
 */

export interface UsStateInfo {
  code: string;
  name: string;
  dpaProgramName: string;
  majorCounties: string[];
  allCounties: Array<{ id: string; name: string; majorCities?: string }>;
}

export const US_STATES: Array<{ code: string; name: string; dpaProgram: string }> = [
  { code: 'AL', name: 'Alabama', dpaProgram: 'AHFA Step Up DPA & Mortgage Credit Certificate' },
  { code: 'AK', name: 'Alaska', dpaProgram: 'AHFC First-Time Homebuyer & Rural Program' },
  { code: 'AZ', name: 'Arizona', dpaProgram: 'Home Plus Arizona DPA & Pathway to Purchase' },
  { code: 'AR', name: 'Arkansas', dpaProgram: 'ADFA Move-Up & Down Payment Assistance' },
  { code: 'CA', name: 'California', dpaProgram: 'CalHFA MyHome Assistance & Dream For All' },
  { code: 'CO', name: 'Colorado', dpaProgram: 'CHFA FirstStep & SmartStep DPA Grant' },
  { code: 'CT', name: 'Connecticut', dpaProgram: 'CHFA Time To Own & Smart-E Mortgage' },
  { code: 'DE', name: 'Delaware', dpaProgram: 'DSHA Home Sweet Home DPA & Kiss Your Landlord Goodbye' },
  { code: 'FL', name: 'Florida', dpaProgram: 'Florida Housing Hometown Heroes & FL Assist DPA' },
  { code: 'GA', name: 'Georgia', dpaProgram: 'Georgia Dream Homeownership Program DPA' },
  { code: 'HI', name: 'Hawaii', dpaProgram: 'Hula Mae First-Time Homebuyer Loan Program' },
  { code: 'ID', name: 'Idaho', dpaProgram: 'Idaho Housing (IHFA) First Loan & 3.5% DPA Second' },
  { code: 'IL', name: 'Illinois', dpaProgram: 'IHDA Access Forgivable & Opening Doors DPA' },
  { code: 'IN', name: 'Indiana', dpaProgram: 'IHCDA Next Home & First Place DPA' },
  { code: 'IA', name: 'Iowa', dpaProgram: 'IFA FirstHome & Homes for Iowans DPA Plus' },
  { code: 'KS', name: 'Kansas', dpaProgram: 'KHRC First Time Homebuyer DPA Program' },
  { code: 'KY', name: 'Kentucky', dpaProgram: 'KHC Regular DPA & Affordable DPA Loan' },
  { code: 'LA', name: 'Louisiana', dpaProgram: 'LHC Market Rate DPA & Preferred Conventional' },
  { code: 'ME', name: 'Maine', dpaProgram: 'MaineHousing First Home Loan & Advantage DPA' },
  { code: 'MD', name: 'Maryland', dpaProgram: 'Maryland Mortgage Program (MMP) 1st Time Advantage DPA' },
  { code: 'MA', name: 'Massachusetts', dpaProgram: 'MassHousing Down Payment Assistance & ONE Mortgage' },
  { code: 'MI', name: 'Michigan', dpaProgram: 'MSHDA MI DPA $10,000 Loan & MI Home Loan' },
  { code: 'MN', name: 'Minnesota', dpaProgram: 'Minnesota Housing Start Up & Monthly Payment DPA' },
  { code: 'MS', name: 'Mississippi', dpaProgram: 'MRB7 First-Time Homebuyer & Smart Solution DPA' },
  { code: 'MO', name: 'Missouri', dpaProgram: 'MHDC First Place & Next Step DPA Grant' },
  { code: 'MT', name: 'Montana', dpaProgram: 'Montana Housing Regular Bond & MBOH Plus DPA' },
  { code: 'NE', name: 'Nebraska', dpaProgram: 'NIFA Homebuyer Program & First Home DPA' },
  { code: 'NV', name: 'Nevada', dpaProgram: 'Home Is Possible (HIP) DPA & Nevada Rural Housing DPA' },
  { code: 'NH', name: 'New Hampshire', dpaProgram: 'NH Housing Home Preferred & $10,000 Cash DPA' },
  { code: 'NJ', name: 'New Jersey', dpaProgram: 'NJHMFA First-Time Homebuyer $15,000 DPA Grant' },
  { code: 'NM', name: 'New Mexico', dpaProgram: 'MFA FirstHome & FirstDown Plus DPA' },
  { code: 'NY', name: 'New York', dpaProgram: 'SONYMA Achieving the Dream & DPAL DPA' },
  { code: 'NC', name: 'North Carolina', dpaProgram: 'NC Home Advantage Mortgage & $15,000 DPA' },
  { code: 'ND', name: 'North Dakota', dpaProgram: 'NDHFA FirstHome & DCA Downpayment Assistance' },
  { code: 'OH', name: 'Ohio', dpaProgram: 'OHFA Your Choice! DPA & Ohio Heroes Grant' },
  { code: 'OK', name: 'Oklahoma', dpaProgram: 'OHFA Homebuyer Down Payment Assistance 3.5%' },
  { code: 'OR', name: 'Oregon', dpaProgram: 'OHCS Flex Lending (FirstHome 4-5% DPA / Rate Advantage / NextStep)' },
  { code: 'PA', name: 'Pennsylvania', dpaProgram: 'PHFA Keystone Home Loan & K-FIT DPA Grant' },
  { code: 'RI', name: 'Rhode Island', dpaProgram: 'RIHousing FirstHomes & $17,500 Spring DPA' },
  { code: 'SC', name: 'South Carolina', dpaProgram: 'SC Housing Homebuyer Program & Forgivable DPA' },
  { code: 'SD', name: 'South Dakota', dpaProgram: 'SDHDA First-Time Homebuyer & Fixed DPA' },
  { code: 'TN', name: 'Tennessee', dpaProgram: 'THDA Great Choice Plus DPA Second Loan' },
  { code: 'TX', name: 'Texas', dpaProgram: 'TDHCA My First Texas Home & TSAHC Homes for Heroes' },
  { code: 'UT', name: 'Utah', dpaProgram: 'Utah Housing Corp (UHC) FirstHome & DPA Second' },
  { code: 'VT', name: 'Vermont', dpaProgram: 'VHFA First Generation & ASSIST DPA 0% Loan' },
  { code: 'VA', name: 'Virginia', dpaProgram: 'Virginia Housing Plus DPA & DPA Grant' },
  { code: 'WA', name: 'Washington', dpaProgram: 'WSHFC Home Advantage & House NW DPA' },
  { code: 'WV', name: 'West Virginia', dpaProgram: 'WVHDF Homeownership Program & Low Down DPA' },
  { code: 'WI', name: 'Wisconsin', dpaProgram: 'WHEDA First-Time Homebuyer & Easy Close DPA' },
  { code: 'WY', name: 'Wyoming', dpaProgram: 'WCDA Standard First-Time Homebuyer & DPA' },
  { code: 'DC', name: 'District of Columbia', dpaProgram: 'DC Open Doors & DC HPAP $202,000 Assistance' }
];

export const STATE_COUNTIES_MAP: Record<string, Array<{ id: string; name: string; majorCities?: string }>> = {
  // WASHINGTON STATE (39 Counties)
  WA: [
    { id: 'all_counties_wa', name: '🌟 All Washington Counties (Statewide Sweep)' },
    { id: 'king', name: 'King County', majorCities: 'Seattle, Bellevue, Renton, Kent, Federal Way' },
    { id: 'pierce', name: 'Pierce County', majorCities: 'Tacoma, Puyallup, Lakewood, Gig Harbor' },
    { id: 'snohomish', name: 'Snohomish County', majorCities: 'Everett, Lynnwood, Marysville, Edmonds' },
    { id: 'spokane', name: 'Spokane County', majorCities: 'Spokane, Spokane Valley, Liberty Lake, Cheney' },
    { id: 'clark', name: 'Clark County', majorCities: 'Vancouver, Camas, Battle Ground, Ridgefield' },
    { id: 'thurston', name: 'Thurston County', majorCities: 'Olympia, Lacey, Tumwater, Yelm' },
    { id: 'kitsap', name: 'Kitsap County', majorCities: 'Bremerton, Silverdale, Port Orchard, Bainbridge' },
    { id: 'yakima', name: 'Yakima County', majorCities: 'Yakima, Sunnyside, Grandview, Selah' },
    { id: 'whatcom', name: 'Whatcom County', majorCities: 'Bellingham, Ferndale, Lynden, Blaine' },
    { id: 'benton_wa', name: 'Benton County', majorCities: 'Kennewick, Richland, Prosser, West Richland' },
    { id: 'franklin_wa', name: 'Franklin County', majorCities: 'Pasco, Connell, Mesa' },
    { id: 'cowlitz', name: 'Cowlitz County', majorCities: 'Longview, Kelso, Woodland, Castle Rock' },
    { id: 'skagit', name: 'Skagit County', majorCities: 'Mount Vernon, Anacortes, Sedro-Woolley, Burlington' },
    { id: 'island', name: 'Island County', majorCities: 'Oak Harbor, Coupeville, Langley, Camano' },
    { id: 'lewis_wa', name: 'Lewis County', majorCities: 'Centralia, Chehalis, Winlock, Morton' },
    { id: 'clallam', name: 'Clallam County', majorCities: 'Port Angeles, Sequim, Forks' },
    { id: 'grays_harbor', name: 'Grays Harbor County', majorCities: 'Aberdeen, Hoquiam, Ocean Shores, Montesano' },
    { id: 'mason_wa', name: 'Mason County', majorCities: 'Shelton, Allyn, Belfair, Hoodsport' },
    { id: 'walla_walla', name: 'Walla Walla County', majorCities: 'Walla Walla, College Place, Waitsburg' },
    { id: 'whitman', name: 'Whitman County', majorCities: 'Pullman, Colfax, Palouse' },
    { id: 'stevens', name: 'Stevens County', majorCities: 'Colville, Chewelah, Kettle Falls' },
    { id: 'kittitas', name: 'Kittitas County', majorCities: 'Ellensburg, Cle Elum, Roslyn' },
    { id: 'grant_wa', name: 'Grant County', majorCities: 'Moses Lake, Ephrata, Quincy, Soap Lake' },
    { id: 'douglas_wa', name: 'Douglas County', majorCities: 'East Wenatchee, Bridgeport, Waterville' },
    { id: 'chelan', name: 'Chelan County', majorCities: 'Wenatchee, Chelan, Leavenworth, Cashmere' },
    { id: 'okanogan', name: 'Okanogan County', majorCities: 'Omak, Okanogan, Brewster, Tonasket' },
    { id: 'pacific', name: 'Pacific County', majorCities: 'Long Beach, Raymond, South Bend, Ilwaco' },
    { id: 'jefferson_wa', name: 'Jefferson County', majorCities: 'Port Townsend, Port Hadlock, Chimacum' },
    { id: 'asotin', name: 'Asotin County', majorCities: 'Clarkston, Asotin' },
    { id: 'adams_wa', name: 'Adams County', majorCities: 'Othello, Ritzville, Lind' },
    { id: 'klickitat', name: 'Klickitat County', majorCities: 'Goldendale, White Salmon, Bingen' },
    { id: 'pend_oreille', name: 'Pend Oreille County', majorCities: 'Newport, Cusick, Ione' },
    { id: 'lincoln_wa', name: 'Lincoln County', majorCities: 'Davenport, Reardan, Wilbur' },
    { id: 'skamania', name: 'Skamania County', majorCities: 'Stevenson, Carson, North Bonneville' },
    { id: 'ferry', name: 'Ferry County', majorCities: 'Republic, Inchelium, Curlew' },
    { id: 'columbia_wa', name: 'Columbia County', majorCities: 'Dayton, Starbuck' },
    { id: 'wahkiakum', name: 'Wahkiakum County', majorCities: 'Cathlamet, Puget Island, Skamokawa' },
    { id: 'garfield_wa', name: 'Garfield County', majorCities: 'Pomeroy' },
    { id: 'san_juan', name: 'San Juan County', majorCities: 'Friday Harbor, Orcas Island, Lopez Island' }
  ],

  // OREGON (36 Counties)
  OR: [
    { id: 'all_8_counties', name: '🌟 All 8 Core Oregon Counties (Default Sweep)' },
    { id: 'all_counties_or', name: '🌲 All 36 Oregon Counties (Statewide)' },
    { id: 'deschutes', name: 'Deschutes County', majorCities: 'Bend, Redmond, Sisters, Sunriver' },
    { id: 'lane', name: 'Lane County', majorCities: 'Eugene, Springfield, Florence, Cottage Grove' },
    { id: 'marion', name: 'Marion County', majorCities: 'Salem, Keizer, Woodburn, Silverton' },
    { id: 'clackamas', name: 'Clackamas County', majorCities: 'Lake Oswego, Oregon City, West Linn, Milwaukie' },
    { id: 'multnomah', name: 'Multnomah County', majorCities: 'Portland, Gresham, Troutdale, Fairview' },
    { id: 'washington_or', name: 'Washington County', majorCities: 'Beaverton, Hillsboro, Tigard, Tualatin' },
    { id: 'benton', name: 'Benton County', majorCities: 'Corvallis, Philomath, Monroe' },
    { id: 'linn', name: 'Linn County', majorCities: 'Albany, Lebanon, Sweet Home, Brownsville' },
    { id: 'douglas', name: 'Douglas County', majorCities: 'Roseburg, Sutherlin, Winston, Reedsport' },
    { id: 'coos', name: 'Coos County', majorCities: 'Coos Bay, North Bend, Bandon, Coquille' },
    { id: 'jackson_or', name: 'Jackson County', majorCities: 'Medford, Ashland, Central Point, Jacksonville' },
    { id: 'josephine', name: 'Josephine County', majorCities: 'Grants Pass, Cave Junction' },
    { id: 'klamath', name: 'Klamath County', majorCities: 'Klamath Falls, Merrill, Malin' },
    { id: 'yamhill', name: 'Yamhill County', majorCities: 'McMinnville, Newberg, Dundee, Sheridan' },
    { id: 'polk', name: 'Polk County', majorCities: 'Dallas, Monmouth, Independence' },
    { id: 'columbia_or', name: 'Columbia County', majorCities: 'St. Helens, Scappoose, Rainier, Vernonia' },
    { id: 'clatsop', name: 'Clatsop County', majorCities: 'Astoria, Seaside, Cannon Beach, Warrenton' },
    { id: 'lincoln_or', name: 'Lincoln County', majorCities: 'Newport, Lincoln City, Toledo, Waldport' },
    { id: 'tillamook', name: 'Tillamook County', majorCities: 'Tillamook, Pacific City, Rockaway Beach' },
    { id: 'curry', name: 'Curry County', majorCities: 'Brookings, Gold Beach, Port Orford' },
    { id: 'umatilla', name: 'Umatilla County', majorCities: 'Hermiston, Pendleton, Milton-Freewater' },
    { id: 'union_or', name: 'Union County', majorCities: 'La Grande, Island City, Union' },
    { id: 'wasco', name: 'Wasco County', majorCities: 'The Dalles, Dufur, Maupin' },
    { id: 'hood_river', name: 'Hood River County', majorCities: 'Hood River, Cascade Locks, Odell' },
    { id: 'crook', name: 'Crook County', majorCities: 'Prineville, Powell Butte' },
    { id: 'jefferson_or', name: 'Jefferson County', majorCities: 'Madras, Culver, Metolius' },
    { id: 'malheur', name: 'Malheur County', majorCities: 'Ontario, Vale, Nyssa' },
    { id: 'baker', name: 'Baker County', majorCities: 'Baker City, Huntington, Haines' }
  ],

  // CALIFORNIA (Major Counties)
  CA: [
    { id: 'all_counties_ca', name: '🌟 All California Counties (Statewide Sweep)' },
    { id: 'los_angeles', name: 'Los Angeles County', majorCities: 'Los Angeles, Long Beach, Pasadena, Glendale' },
    { id: 'san_diego', name: 'San Diego County', majorCities: 'San Diego, Chula Vista, Oceanside, Escondido' },
    { id: 'orange_ca', name: 'Orange County', majorCities: 'Anaheim, Santa Ana, Irvine, Huntington Beach' },
    { id: 'riverside', name: 'Riverside County', majorCities: 'Riverside, Moreno Valley, Corona, Temecula' },
    { id: 'san_bernardino', name: 'San Bernardino County', majorCities: 'San Bernardino, Fontana, Ontario, Rancho Cucamonga' },
    { id: 'santa_clara', name: 'Santa Clara County', majorCities: 'San Jose, Sunnyvale, Santa Clara, Mountain View' },
    { id: 'alameda', name: 'Alameda County', majorCities: 'Oakland, Fremont, Berkeley, Hayward' },
    { id: 'sacramento', name: 'Sacramento County', majorCities: 'Sacramento, Elk Grove, Roseville area, Folsom' },
    { id: 'contra_costa', name: 'Contra Costa County', majorCities: 'Concord, Richmond, Antioch, Walnut Creek' },
    { id: 'fresno', name: 'Fresno County', majorCities: 'Fresno, Clovis, Sanger, Reedley' },
    { id: 'kern', name: 'Kern County', majorCities: 'Bakersfield, Delano, Ridgecrest' },
    { id: 'san_francisco', name: 'San Francisco County', majorCities: 'San Francisco' },
    { id: 'ventura', name: 'Ventura County', majorCities: 'Oxnard, Thousand Oaks, Simi Valley, Ventura' },
    { id: 'san_mateo', name: 'San Mateo County', majorCities: 'Daly City, San Mateo, Redwood City' },
    { id: 'san_joaquin', name: 'San Joaquin County', majorCities: 'Stockton, Tracy, Manteca, Lodi' },
    { id: 'stanislaus', name: 'Stanislaus County', majorCities: 'Modesto, Turlock, Ceres' },
    { id: 'sonoma', name: 'Sonoma County', majorCities: 'Santa Rosa, Petaluma, Rohnert Park' },
    { id: 'placer', name: 'Placer County', majorCities: 'Roseville, Rocklin, Lincoln, Auburn' }
  ],

  // TEXAS (Major Counties)
  TX: [
    { id: 'all_counties_tx', name: '🌟 All Texas Counties (Statewide Sweep)' },
    { id: 'harris', name: 'Harris County', majorCities: 'Houston, Pasadena, Baytown' },
    { id: 'dallas', name: 'Dallas County', majorCities: 'Dallas, Irving, Garland, Grand Prairie' },
    { id: 'tarrant', name: 'Tarrant County', majorCities: 'Fort Worth, Arlington, Grapevine' },
    { id: 'bexar', name: 'Bexar County', majorCities: 'San Antonio, Schertz, Universal City' },
    { id: 'travis', name: 'Travis County', majorCities: 'Austin, Pflugerville, Manor' },
    { id: 'collin', name: 'Collin County', majorCities: 'Plano, McKinney, Frisco, Allen' },
    { id: 'denton', name: 'Denton County', majorCities: 'Denton, Lewisville, Flower Mound' },
    { id: 'el_paso', name: 'El Paso County', majorCities: 'El Paso, Socorro, Horizon City' },
    { id: 'fort_bend', name: 'Fort Bend County', majorCities: 'Sugar Land, Missouri City, Richmond' },
    { id: 'williamson', name: 'Williamson County', majorCities: 'Round Rock, Cedar Park, Georgetown' },
    { id: 'montgomery_tx', name: 'Montgomery County', majorCities: 'Conroe, The Woodlands, Spring' },
    { id: 'hidalgo', name: 'Hidalgo County', majorCities: 'McAllen, Edinburg, Mission' }
  ],

  // FLORIDA
  FL: [
    { id: 'all_counties_fl', name: '🌟 All Florida Counties (Statewide Sweep)' },
    { id: 'miami_dade', name: 'Miami-Dade County', majorCities: 'Miami, Hialeah, Miami Gardens' },
    { id: 'broward', name: 'Broward County', majorCities: 'Fort Lauderdale, Pembroke Pines, Hollywood' },
    { id: 'palm_beach', name: 'Palm Beach County', majorCities: 'West Palm Beach, Boca Raton, Boynton Beach' },
    { id: 'hillsborough', name: 'Hillsborough County', majorCities: 'Tampa, Plant City, Brandon' },
    { id: 'orange_fl', name: 'Orange County', majorCities: 'Orlando, Winter Park, Apopka' },
    { id: 'duval', name: 'Duval County', majorCities: 'Jacksonville, Jacksonville Beach' },
    { id: 'pinellas', name: 'Pinellas County', majorCities: 'St. Petersburg, Clearwater, Largo' },
    { id: 'lee_fl', name: 'Lee County', majorCities: 'Cape Coral, Fort Myers, Bonita Springs' },
    { id: 'polk_fl', name: 'Polk County', majorCities: 'Lakeland, Winter Haven, Haines City' }
  ],

  // IDAHO
  ID: [
    { id: 'all_counties_id', name: '🌟 All Idaho Counties (Statewide Sweep)' },
    { id: 'ada', name: 'Ada County', majorCities: 'Boise, Meridian, Eagle, Kuna' },
    { id: 'canyon', name: 'Canyon County', majorCities: 'Nampa, Caldwell, Middleton' },
    { id: 'kootenai', name: 'Kootenai County', majorCities: 'Coeur d\'Alene, Post Falls, Hayden' },
    { id: 'bonneville', name: 'Bonneville County', majorCities: 'Idaho Falls, Ammon' },
    { id: 'twin_falls', name: 'Twin Falls County', majorCities: 'Twin Falls, Kimberly, Buhl' },
    { id: 'bannock', name: 'Bannock County', majorCities: 'Pocatello, Chubbuck' }
  ],

  // ARIZONA
  AZ: [
    { id: 'all_counties_az', name: '🌟 All Arizona Counties (Statewide Sweep)' },
    { id: 'maricopa', name: 'Maricopa County', majorCities: 'Phoenix, Mesa, Chandler, Scottsdale, Glendale, Tempe' },
    { id: 'pima', name: 'Pima County', majorCities: 'Tucson, Oro Valley, Marana' },
    { id: 'pinal', name: 'Pinal County', majorCities: 'Casa Grande, Maricopa, San Tan Valley' },
    { id: 'yavapai', name: 'Yavapai County', majorCities: 'Prescott, Prescott Valley, Sedona' },
    { id: 'yuma', name: 'Yuma County', majorCities: 'Yuma, San Luis, Somerton' },
    { id: 'mohave', name: 'Mohave County', majorCities: 'Lake Havasu City, Bullhead City, Kingman' },
    { id: 'coconino', name: 'Coconino County', majorCities: 'Flagstaff, Sedona, Page' }
  ],

  // COLORADO
  CO: [
    { id: 'all_counties_co', name: '🌟 All Colorado Counties (Statewide Sweep)' },
    { id: 'denver', name: 'Denver County', majorCities: 'Denver' },
    { id: 'el_paso_co', name: 'El Paso County', majorCities: 'Colorado Springs, Fountain, Monument' },
    { id: 'arapahoe', name: 'Arapahoe County', majorCities: 'Aurora, Centennial, Littleton' },
    { id: 'jefferson_co', name: 'Jefferson County', majorCities: 'Lakewood, Arvada, Golden' },
    { id: 'adams_co', name: 'Adams County', majorCities: 'Thornton, Westminster, Brighton' },
    { id: 'douglas_co', name: 'Douglas County', majorCities: 'Highlands Ranch, Castle Rock, Parker' },
    { id: 'larimer', name: 'Larimer County', majorCities: 'Fort Collins, Loveland' },
    { id: 'boulder', name: 'Boulder County', majorCities: 'Boulder, Longmont, Lafayette' },
    { id: 'weld', name: 'Weld County', majorCities: 'Greeley, Windsor, Evans' }
  ],

  // NEVADA
  NV: [
    { id: 'all_counties_nv', name: '🌟 All Nevada Counties (Statewide Sweep)' },
    { id: 'clark_nv', name: 'Clark County', majorCities: 'Las Vegas, Henderson, North Las Vegas, Summerlin' },
    { id: 'washoe', name: 'Washoe County', majorCities: 'Reno, Sparks, Incline Village' },
    { id: 'carson_city', name: 'Carson City', majorCities: 'Carson City' },
    { id: 'douglas_nv', name: 'Douglas County', majorCities: 'Minden, Gardnerville, Stateline' },
    { id: 'elko', name: 'Elko County', majorCities: 'Elko, Spring Creek' },
    { id: 'lyon', name: 'Lyon County', majorCities: 'Fernley, Yerington, Dayton' }
  ],

  // NEW YORK
  NY: [
    { id: 'all_counties_ny', name: '🌟 All New York Counties (Statewide Sweep)' },
    { id: 'kings', name: 'Kings County (Brooklyn)', majorCities: 'Brooklyn, Williamsburg, Flatbush' },
    { id: 'queens', name: 'Queens County', majorCities: 'Astoria, Flushing, Long Island City' },
    { id: 'new_york_co', name: 'New York County (Manhattan)', majorCities: 'Manhattan, Harlem, Lower East Side' },
    { id: 'bronx', name: 'Bronx County', majorCities: 'The Bronx, Riverdale, Pelham' },
    { id: 'richmond', name: 'Richmond County (Staten Island)', majorCities: 'Staten Island' },
    { id: 'nassau', name: 'Nassau County', majorCities: 'Hempstead, Oyster Bay, Long Beach' },
    { id: 'suffolk', name: 'Suffolk County', majorCities: 'Islip, Brookhaven, Huntington' },
    { id: 'westchester', name: 'Westchester County', majorCities: 'Yonkers, New Rochelle, White Plains' },
    { id: 'erie', name: 'Erie County', majorCities: 'Buffalo, Amherst, Cheektowaga' },
    { id: 'monroe_ny', name: 'Monroe County', majorCities: 'Rochester, Greece, Irondequoit' }
  ]
};

/**
 * Fallback county generator for any other state
 */
export function getCountiesByState(stateCode: string): Array<{ id: string; name: string; majorCities?: string }> {
  const upper = (stateCode || 'OR').toUpperCase();
  if (STATE_COUNTIES_MAP[upper]) {
    return STATE_COUNTIES_MAP[upper];
  }

  const st = US_STATES.find(s => s.code === upper);
  const stateName = st ? st.name : upper;

  // Provide robust standard county breakdown for all other US states
  return [
    { id: `all_counties_${upper.toLowerCase()}`, name: `🌟 All ${stateName} Counties (Statewide Sweep)` },
    { id: `central_${upper.toLowerCase()}`, name: `Central ${stateName} County Metro Area`, majorCities: 'Metro Core, Capital City, Suburbs' },
    { id: `north_${upper.toLowerCase()}`, name: `Northern ${stateName} County Region`, majorCities: 'North Cities, Regional Hubs' },
    { id: `south_${upper.toLowerCase()}`, name: `Southern ${stateName} County Region`, majorCities: 'South Cities, Coast / Valley' },
    { id: `east_${upper.toLowerCase()}`, name: `Eastern ${stateName} Rural Housing Tracts`, majorCities: 'USDA Eligible Rural Communities' },
    { id: `west_${upper.toLowerCase()}`, name: `Western ${stateName} County Region`, majorCities: 'West Towns & Expansion Areas' }
  ];
}

/**
 * Get state object details by code
 */
export function getStateDetails(stateCode: string): { code: string; name: string; dpaProgram: string } {
  const upper = (stateCode || 'OR').toUpperCase();
  const st = US_STATES.find(s => s.code === upper);
  if (st) return st;
  return { code: 'OR', name: 'Oregon', dpaProgram: 'OHCS Flex Lending & Rate Advantage DPA' };
}

/**
 * Helper to generate synthetic high-intent leads tailored to any selected State, County, or Statewide sweep
 */
export function generateLocalizedLeadsForSweep(stateCode: string, countyId: string, isStateWide: boolean = false): any[] {
  const st = getStateDetails(stateCode);
  const counties = getCountiesByState(stateCode);
  const isAllOrStatewide = isStateWide || countyId.includes('all') || countyId.startsWith('all_');

  if (isAllOrStatewide) {
    const validCounties = counties.filter(c => !c.id.includes('all'));
    const now = Date.now();

    // Specific Oregon Multi-County Fanout (Lane, Multnomah, Washington, Clackamas, Deschutes, Marion, Jackson, Benton, Linn, Douglas, Coos, Yamhill)
    if (stateCode === 'OR') {
      const oregonMultiCountyTemplates = [
        {
          county: 'Lane County',
          city: 'Eugene',
          sourceType: 'forum',
          platform: 'Reddit (r/Eugene & r/FirstTimeHomeBuyer)',
          title: 'Eugene/Springfield starter homes vs Lane County DPA & 620 credit minimums',
          author: 'u/EugeneHomeSeeker_26',
          snippet: 'Tired of paying $2,100 in rent near South Eugene. Heard there are Lane County IDA matching grants paired with 3.5% down FHA loans. Any Oregon loan officers familiar with Eugene limits?',
          intentScore: 98,
          sentiment: 'Urgent',
          matched: 'Lane County IDA & FHA 3.5% First-Time Buyer'
        },
        {
          county: 'Deschutes County',
          city: 'Bend',
          sourceType: 'chat_board',
          platform: 'Bend Outdoor Recreation & Housing Guild',
          title: 'Bend housing prices vs Deschutes County employer assistance grants & zero down',
          author: 'u/BendOutdoorBuyer',
          snippet: 'Struggle to compete with cash buyers in Bend. Heard about local employer housing assistance paired with OHCS Flex Lending. Any LOs specialized in this?',
          intentScore: 97,
          sentiment: 'Urgent',
          matched: 'OHCS Flex Lending & Employer Grant'
        },
        {
          county: 'Multnomah County',
          city: 'Portland',
          sourceType: 'forum',
          platform: 'Reddit (r/Portland)',
          title: 'First-time home buyer in Portland with $65k salary - Is zero down or OHCS DPA realistic right now?',
          author: 'u/PDX_Renter_99',
          snippet: 'Looking to stop paying $2,100 in rent in inner SE Portland. I heard about Oregon Housing and Community Services (OHCS) down payment assistance and Lakeview zero-down programs. Anyone successfully used these with under 700 credit?',
          intentScore: 96,
          sentiment: 'Urgent',
          matched: 'OHCS Flex Lending & DPA / Lakeview Zero-Down'
        },
        {
          county: 'Washington County',
          city: 'Beaverton',
          sourceType: 'chat_board',
          platform: 'BiggerPockets Oregon Board',
          title: 'Beaverton / Hillsboro tech workers looking for 2-1 buydowns or seller concessions',
          author: 'SarahM_Hillsboro',
          snippet: 'Interest rates feel brutal for our first home purchase. Sellers are starting to offer price concessions and 2-1 rate buydowns in Washington County. Can someone explain how gift funds work for closing costs?',
          intentScore: 95,
          sentiment: 'Positive',
          matched: '2-1 Rate Buydowns & Seller Concessions'
        },
        {
          county: 'Marion County',
          city: 'Salem',
          sourceType: 'blog',
          platform: 'Pacific Northwest Real Estate Blog',
          title: 'Comment on: "Rural Development (USDA RD) Zero-Down Loans in Marion & Clackamas County"',
          author: 'DaveK_Salem',
          snippet: 'We want to buy near Woodburn or Silverton. Does the USDA zero-down loan apply to modular homes or just traditional single family? Trying to avoid PMI while renting an overpriced apartment.',
          intentScore: 94,
          sentiment: 'Urgent',
          matched: 'USDA Rural Development 0% Down'
        },
        {
          county: 'Clackamas County',
          city: 'Lake Oswego',
          sourceType: 'forum',
          platform: 'Public Facebook Group (Oregon First-Time Homebuyers)',
          title: 'Lake Oswego & Oregon City buyers inquiring about Clackamas County DPA grants',
          author: 'Sarah Jenkins (FB Member)',
          snippet: 'Looking for a lender who understands Clackamas County down payment assistance programs and how they stack with state OHCS funds for teachers.',
          intentScore: 96,
          sentiment: 'Urgent',
          matched: 'Clackamas County DPA & OHCS Stack'
        },
        {
          county: 'Jackson County',
          city: 'Medford',
          sourceType: 'chat_board',
          platform: 'Oregon Housing Discord (#rogue-valley)',
          title: 'Medford & Ashland starter home search - can we combine USDA zero-down with seller paid closing costs?',
          author: 'u/MedfordFirstTime',
          snippet: 'We found a great 3-bed in Jackson County listed at $340k. Sellers are motivated. Wondering if USDA loan rules allow seller concessions to cover closing costs entirely.',
          intentScore: 93,
          sentiment: 'Positive',
          matched: 'USDA Rural Development & Seller Concessions'
        },
        {
          county: 'Benton County',
          city: 'Corvallis',
          sourceType: 'blog',
          platform: 'PNW Real Estate Investor & Buyer Blog',
          title: 'Corvallis & Albany tech workers looking to stop renting and buy near OSU campus',
          author: 'u/CorvallisTechBuyer',
          snippet: 'Tired of paying $2,300 in rent near Corvallis (Benton County). Looking into conventional 3% down options and whether gift funds from parents count towards reserves.',
          intentScore: 92,
          sentiment: 'Neutral',
          matched: 'Conventional 3% Down & Gift Funds'
        },
        {
          county: 'Linn County',
          city: 'Albany',
          sourceType: 'forum',
          platform: 'Reddit (r/AlbanyOR)',
          title: 'Albany / Lebanon first-time buyer with 630 credit score looking for zero-down options',
          author: 'u/LinnCountyBuyer',
          snippet: 'Looking for a single-family home in Lebanon or Albany. Can we use Lakeview zero-down or OHCS Flex Lending with a 630 credit score? Rent is climbing to $1,950.',
          intentScore: 95,
          sentiment: 'Urgent',
          matched: 'OHCS Flex Lending & 620+ Credit Tier'
        },
        {
          county: 'Douglas County',
          city: 'Roseburg',
          sourceType: 'chat_board',
          platform: 'Douglas County Homebuyer Community Forum',
          title: 'Roseburg & Sutherlin USDA 100% rural development loan eligibility question',
          author: 'u/RoseburgDreamer',
          snippet: 'Looking at rural properties near Sutherlin and Winston. Does USDA 100% financing have income limits for a family of 4 in Douglas County? Ready to schedule pre-approval.',
          intentScore: 91,
          sentiment: 'Positive',
          matched: 'USDA 100% Zero-Down Rural Financing'
        },
        {
          county: 'Coos County',
          city: 'Coos Bay',
          sourceType: 'blog',
          platform: 'Pacific Northwest Real Estate Podcast Notes',
          title: 'Coos Bay & Bandon coastal relocation and USDA zero-down rural housing tracts',
          author: 'Podcast Listener #4482',
          snippet: 'Heard episode on South Coast Oregon housing. Wondering if Bandon and Coos Bay qualify for USDA rural zero-down loans for self-employed remote workers.',
          intentScore: 92,
          sentiment: 'Positive',
          matched: 'USDA Rural Zero-Down & Self-Employed W2'
        },
        {
          county: 'Yamhill County',
          city: 'McMinnville',
          sourceType: 'forum',
          platform: 'Reddit (r/YamhillCounty)',
          title: 'McMinnville & Newberg wine country first-time buyers looking for DPA grants',
          author: 'u/WineCountryBuyer',
          snippet: 'Moving to McMinnville to be closer to family. Looking for an experienced Oregon loan officer who can structure a 3% down loan with down payment assistance.',
          intentScore: 94,
          sentiment: 'Urgent',
          matched: 'OHCS Rate Advantage & 3% Down'
        }
      ];

      return oregonMultiCountyTemplates.map((item, idx) => ({
        id: `lead_or_sweep_${idx + 1}_${now}`,
        sourceType: item.sourceType as any,
        platform: item.platform,
        title: item.title,
        authorOrUser: item.author,
        snippet: item.snippet,
        intentScore: item.intentScore,
        sentimentScore: item.sentiment as any,
        location: `${item.city}, OR (${item.county})`,
        matchedProgram: item.matched,
        discoveredAt: idx === 0 ? 'Just now' : `${(idx + 1) * 3} mins ago`,
        url: `https://reddit.com/r/Oregon/comments/lead_${idx + 101}`,
        status: 'new',
        timestamp: now - (idx * 1500)
      }));
    }

    // Generic Multi-Region Statewide Batch for any other US State
    const statewideTemplates = [
      {
        county: validCounties[0] || { name: 'Metro County', majorCities: `${st.name} Metro` },
        sourceType: 'forum',
        platform: `Reddit (r/${st.name.replace(/\s+/g, '')} & r/FirstTimeHomeBuyer)`,
        title: `Tired of paying $2,400 rent - how do ${st.dpaProgram} grants work with 3.5% FHA?`,
        author: `u/${st.code}RenterToOwner`,
        snippet: `Lease is ending in 60 days. We have steady W-2 income ($85k) but only $7k in savings. Looking for an experienced local LO who can verify if we qualify for ${st.dpaProgram} to cover the down payment without draining reserves.`,
        intentScore: 98,
        sentiment: 'Urgent',
        matched: `${st.dpaProgram} & FHA 3.5% Down`
      },
      {
        county: validCounties[1] || { name: 'Lakeview Metro', majorCities: `${st.name} Suburbs` },
        sourceType: 'forum',
        platform: `Reddit (r/${st.name.replace(/\s+/g, '')}Housing)`,
        title: `Lakeview National 100% Zero-Down loan eligibility in ${st.name} with 660 credit`,
        author: `u/${st.code}ZeroDownSeeker`,
        snippet: `Want to buy a $425,000 single family home. Our combined household income is $95k (well under 140% county AMI). Can we use Lakeview National 100% financing to avoid paying any down payment out of pocket?`,
        intentScore: 97,
        sentiment: 'Urgent',
        matched: `Lakeview National 100% Zero-Down (140% AMI Cap)`
      },
      {
        county: validCounties[2] || { name: 'Valley County', majorCities: `${st.name} Valley` },
        sourceType: 'chat_board',
        platform: `${st.name} Regional Homebuyer Guild & Discord`,
        title: `0% down USDA Rural Development vs Conventional 3% - DTI limits question`,
        author: `u/${st.code}RuralDreamer`,
        snippet: `Looking at homes on the outskirts. Our realtor mentioned USDA offers 100% zero-down financing with no monthly PMI if the house is in an eligible census tract. Does USDA allow a 48% DTI if we have a 680 credit score?`,
        intentScore: 96,
        sentiment: 'Urgent',
        matched: `USDA 100% Rural Zero-Down & ${st.name} DPA Stack`
      },
      {
        county: validCounties[3] || { name: 'Central Region', majorCities: `${st.name} Central` },
        sourceType: 'blog',
        platform: `${st.name} Real Estate & Loan Forum`,
        title: `Stop renting with 620 credit score: FHA NHF 5% DPA Grant roadmap`,
        author: `u/${st.code}CreditBuilder`,
        snippet: `My score just bumped to 635 after paying down credit cards. Rent just went up another $180. Want to know if National Homebuyers Fund (NHF) 5% DPA is available in ${st.name} with no first-time buyer restriction.`,
        intentScore: 95,
        sentiment: 'Positive',
        matched: `FHA NHF 5% DPA Grant (620+ FICO)`
      },
      {
        county: validCounties[4] || { name: 'LMI District', majorCities: `${st.name} Urban Core` },
        sourceType: 'chat_board',
        platform: `${st.name} Community First-Time Buyer Board`,
        title: `Zero Down Payment USDA / Lakeview + 2-1 Rate Buydown Stacking Strategy`,
        author: `u/${st.code}ZeroDownBuydown`,
        snippet: `Found a starter home listed at $340k. Our loan officer mentioned we can stack zero down payment financing with a seller-funded 2-1 temporary rate buydown so we pay $0 down and get substantial payment relief for the first two years!`,
        intentScore: 97,
        sentiment: 'Urgent',
        matched: `Zero-Down + 2-1 Rate Buydown Stack`
      },
      {
        county: validCounties[5] || { name: 'South Region', majorCities: `${st.name} South` },
        sourceType: 'chat_board',
        platform: `First-Time Buyer Discussion Board (#relocation-${st.code.toLowerCase()})`,
        title: `Can we combine seller concessions for closing costs with zero-down financing?`,
        author: `u/${st.code}FamilyRelo`,
        snippet: `Moving our family to ${st.name}. Found a great 3-bed home and the seller is open to giving 3% in concessions. Can we combine this with state housing DPA so our total out-of-pocket cash is basically $0? Need an official loan officer pre-approval.`,
        intentScore: 95,
        sentiment: 'Urgent',
        matched: `Zero-Down Financing & Seller Concessions`
      },
      {
        county: validCounties[0] || { name: 'East Region', majorCities: `${st.name} East` },
        sourceType: 'forum',
        platform: `Reddit (r/${(validCounties[0]?.name || 'Local').replace(/\s+/g, '')})`,
        title: `Self-employed 1099 & W2 co-borrower qualifying for first starter home under conforming limit`,
        author: `u/${st.code}SelfEmployedBuyer`,
        snippet: `I run an LLC with 2 years of solid tax returns and my partner is full-time W2. We want to stop paying rent to private landlords and buy our first property. Looking for a loan officer who actually understands self-employment write-offs and Lakeview / ${st.name} DPA.`,
        intentScore: 93,
        sentiment: 'Positive',
        matched: `Conventional HomeReady & 1099/W2 Blend`
      },
      {
        county: validCounties[1] || { name: 'West Region', majorCities: `${st.name} West` },
        sourceType: 'blog',
        platform: `${st.name} Housing Transition Community Blog`,
        title: `Gift funds from parents paired with ${st.dpaProgram} & Lakeview rules`,
        author: `u/${st.code}FirstHome2026`,
        snippet: `My parents are willing to gift $5,000 towards our home purchase reserves. Can this be stacked with state grant programs for our earnest money deposit? Ready to apply for pre-approval this week.`,
        intentScore: 97,
        sentiment: 'Urgent',
        matched: `${st.dpaProgram} & Family Gift Reserves`
      }
    ];

    return statewideTemplates.map((item, idx) => {
      const countyName = item.county.name.replace('🌟 ', '').replace('🌲 ', '');
      const cityName = item.county.majorCities ? item.county.majorCities.split(',')[0].trim() : `${st.name} City`;

      return {
        id: `lead_${stateCode.toLowerCase()}_statewide_${idx + 1}_${now}`,
        sourceType: item.sourceType,
        platform: item.platform,
        title: item.title,
        authorOrUser: item.author,
        snippet: item.snippet,
        intentScore: item.intentScore,
        sentimentScore: item.sentiment,
        location: `${cityName}, ${st.code} (${countyName})`,
        matchedProgram: item.matched,
        discoveredAt: idx === 0 ? 'Just now' : `${(idx + 1) * 2} mins ago`,
        url: `https://discussion.${st.code.toLowerCase()}housing.org/thread/${idx + 101}`,
        status: 'new',
        timestamp: now - (idx * 2000)
      };
    });
  }

  // Single county focus
  const selectedCounty = counties.find(c => c.id === countyId) || counties[0];
  const countyLabel = selectedCounty.name.replace('🌟 ', '').replace('🌲 ', '');
  const cities = selectedCounty.majorCities ? selectedCounty.majorCities.split(',')[0].trim() : `${st.name} City`;

  return [
    {
      id: `lead_${stateCode.toLowerCase()}_1_${Date.now()}`,
      sourceType: 'forum',
      platform: `Reddit (r/${cities.replace(/\s+/g, '')} & r/${st.name.replace(/\s+/g, '')})`,
      title: `${cities} starter homes vs ${st.dpaProgram} & 620 credit minimums`,
      authorOrUser: `u/${cities.replace(/\s+/g, '')}Renter`,
      snippet: `Tired of paying $2,450/mo rent in ${cities} (${countyLabel}). Heard there are ${st.dpaProgram} grants paired with 3.5% down FHA loans. Any local mortgage loan officers familiar with county loan limits?`,
      intentScore: 98,
      sentimentScore: 'Urgent',
      location: `${cities}, ${st.code} (${countyLabel})`,
      matchedProgram: `${st.dpaProgram} & FHA 3.5% Down`,
      discoveredAt: 'Just now',
      url: `https://reddit.com/r/${cities.toLowerCase()}/comments/homebuyer_dpa_limits`,
      status: 'new',
      timestamp: Date.now()
    },
    {
      id: `lead_${stateCode.toLowerCase()}_2_${Date.now()}`,
      sourceType: 'chat_board',
      platform: `${st.name} Regional Housing Forum & Renter Community`,
      title: `${countyLabel} renter transition to homeownership grant program`,
      authorOrUser: `u/${st.code}Buyer2026`,
      snippet: `Looking to stop renting in ${countyLabel}. Can we combine employer assistance with ${st.dpaProgram} zero-down programs? Need a pre-approval this week for an offer.`,
      intentScore: 96,
      sentimentScore: 'Urgent',
      location: `${cities}, ${st.code} (${countyLabel})`,
      matchedProgram: `${st.dpaProgram} & Rate Advantage`,
      discoveredAt: 'Just now',
      url: `https://${st.code.toLowerCase()}housing.org/forum/transition_grants`,
      status: 'new',
      timestamp: Date.now() - 1000
    },
    {
      id: `lead_${stateCode.toLowerCase()}_3_${Date.now()}`,
      sourceType: 'chat_board',
      platform: `${st.name} Rural Homebuyers Discord (#${countyId})`,
      title: `${countyLabel} USDA 100% rural development zero-down eligibility`,
      authorOrUser: `u/${cities.replace(/\s+/g, '')}RuralBuyer`,
      snippet: `Found a great 3-bed home in ${countyLabel}. The real estate agent says it is in a USDA rural-eligible tract. Does USDA allow 0% down with 50% max DTI for W2 workers in ${st.name}?`,
      intentScore: 94,
      sentimentScore: 'Positive',
      location: `${cities}, ${st.code} (${countyLabel})`,
      matchedProgram: `USDA Rural 100% Zero-Down & ${st.name} DPA Stack`,
      discoveredAt: 'Just now',
      url: `https://discord.gg/${st.code.toLowerCase()}-housing/rural`,
      status: 'new',
      timestamp: Date.now() - 2000
    }
  ];
}
