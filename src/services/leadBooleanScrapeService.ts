/**
 * @file leadBooleanScrapeService.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Boolean Operator (AND, OR, NOT) Scrape Query Engine & Scrape Result Count Monitor
 * Empowers Loan Officers to refine intent-based forum scraping with phrase inclusion/exclusion
 * and automatically triggers in-dashboard geographic radius expansion recommendations on low yield.
 */

export interface BooleanScrapeConfig {
  enabled: boolean;
  activePresetId: string;
  andTerms: string[];     // Require ALL (e.g. "first-time buyer", "pre-approval")
  orTerms: string[];      // Include ANY (e.g. "0% down", "OHCS", "DPA", "USDA")
  notTerms: string[];     // Exclude / NOT (e.g. "cash buyer", "wholesaler", "commercial", "landlord")
  rawQuery?: string;
  useRawQueryMode?: boolean;
}

export interface BooleanQueryPreset {
  id: string;
  name: string;
  icon: string;
  description: string;
  andTerms: string[];
  orTerms: string[];
  notTerms: string[];
}

export interface YieldMonitorConfig {
  enabled: boolean;
  minLeadYieldThreshold: number; // e.g. 5 leads minimum
  autoSuggestBroadening: boolean;
}

export interface YieldEvaluationResult {
  isLowYield: boolean;
  currentCount: number;
  threshold: number;
  recommendedRadius: number;
  recommendationType: 'expand_radius' | 'statewide_mode' | 'relax_boolean' | 'optimal';
  headline: string;
  suggestionMessage: string;
  suggestedScopeLabel: string;
}

export const DEFAULT_BOOLEAN_PRESETS: BooleanQueryPreset[] = [
  {
    id: 'oregon_dpa',
    name: 'Oregon DPA & First-Time Buyers',
    icon: '🌲',
    description: 'Target first-time buyers seeking OHCS Flex Lending, down payment assistance, and rate advantages while excluding cash investors.',
    andTerms: ['first-time buyer'],
    orTerms: ['OHCS', 'down payment assistance', 'DPA', 'zero down', '0% down', 'grant'],
    notTerms: ['cash buyer', 'wholesaler', 'commercial', 'landlord', 'hard money']
  },
  {
    id: 'usda_zero_down',
    name: 'USDA 100% Zero-Down Rural',
    icon: '🚜',
    description: 'Find prospective buyers looking for USDA rural tracts, zero-down options, and seller concessions outside metro city centers.',
    andTerms: ['USDA'],
    orTerms: ['0% down', 'zero down', 'rural housing', '100% financing', 'seller concessions'],
    notTerms: ['commercial', 'investor portfolio', 'cash only']
  },
  {
    id: 'credit_buydowns',
    name: 'Credit Transition & 2-1 Buydowns',
    icon: '💳',
    description: 'Capture renters with 620–680 credit scores, rate sensitivity, or inquiries on seller-paid 2-1 temporary buydowns.',
    andTerms: ['pre-approval'],
    orTerms: ['620 credit', 'credit score', '2-1 buydown', 'seller credit', 'closing costs', 'gift funds'],
    notTerms: ['refinance only', 'commercial lender']
  },
  {
    id: 'low_no_down',
    name: 'Low & No Down Payment Programs',
    icon: '🏡',
    description: 'Broad search for anyone asking how to stop renting with minimal or zero out-of-pocket savings.',
    andTerms: ['rent'],
    orTerms: ['no down payment', 'low down', 'FHA 3.5%', 'Lakeview 100%', 'first home'],
    notTerms: ['cash buyer', 'apartment complex', 'commercial property']
  }
];

export const DEFAULT_BOOLEAN_CONFIG: BooleanScrapeConfig = {
  enabled: true,
  activePresetId: 'oregon_dpa',
  andTerms: ['first-time buyer'],
  orTerms: ['OHCS', 'down payment assistance', 'DPA', 'zero down', '0% down', 'grant'],
  notTerms: ['cash buyer', 'wholesaler', 'commercial', 'landlord'],
  useRawQueryMode: false
};

export const DEFAULT_YIELD_MONITOR_CONFIG: YieldMonitorConfig = {
  enabled: true,
  minLeadYieldThreshold: 6,
  autoSuggestBroadening: true
};

const STORAGE_KEY_BOOLEAN = 'vantage_scrape_boolean_config';
const STORAGE_KEY_YIELD = 'vantage_scrape_yield_monitor_config';

export class LeadBooleanScrapeService {
  /**
   * Fetch saved Boolean configuration from localStorage or defaults
   */
  static getBooleanConfig(): BooleanScrapeConfig {
    if (typeof window === 'undefined') return DEFAULT_BOOLEAN_CONFIG;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BOOLEAN);
      if (saved) {
        return { ...DEFAULT_BOOLEAN_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_BOOLEAN_CONFIG;
  }

  /**
   * Persist Boolean configuration to localStorage
   */
  static saveBooleanConfig(config: BooleanScrapeConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_BOOLEAN, JSON.stringify(config));
    } catch {}
  }

  /**
   * Fetch saved Yield Monitor configuration
   */
  static getYieldMonitorConfig(): YieldMonitorConfig {
    if (typeof window === 'undefined') return DEFAULT_YIELD_MONITOR_CONFIG;
    try {
      const saved = localStorage.getItem(STORAGE_KEY_YIELD);
      if (saved) {
        return { ...DEFAULT_YIELD_MONITOR_CONFIG, ...JSON.parse(saved) };
      }
    } catch {}
    return DEFAULT_YIELD_MONITOR_CONFIG;
  }

  /**
   * Persist Yield Monitor configuration
   */
  static saveYieldMonitorConfig(config: YieldMonitorConfig): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_YIELD, JSON.stringify(config));
    } catch {}
  }

  /**
   * Compiles the configuration into a human-readable and queryable Boolean expression
   */
  static compileToBooleanExpression(config: BooleanScrapeConfig): string {
    if (config.useRawQueryMode && config.rawQuery?.trim()) {
      return config.rawQuery.trim();
    }

    const parts: string[] = [];

    if (config.orTerms.length > 0) {
      const orBlock = config.orTerms.map(t => `"${t}"`).join(' OR ');
      parts.push(`(${orBlock})`);
    }

    if (config.andTerms.length > 0) {
      const andBlock = config.andTerms.map(t => `"${t}"`).join(' AND ');
      parts.push(`(${andBlock})`);
    }

    if (config.notTerms.length > 0) {
      const notBlock = config.notTerms.map(t => `NOT "${t}"`).join(' AND ');
      parts.push(`(${notBlock})`);
    }

    return parts.join(' AND ') || 'ALL_INTENT_LEADS';
  }

  /**
   * Compiles search arguments for live search engines (Google Search Grounding, Reddit, Discords)
   */
  static compileToSearchGroundingQuery(
    config: BooleanScrapeConfig,
    stateName: string,
    countyOrArea: string,
    radiusMiles: number
  ): string {
    const geoClause = radiusMiles >= 200 
      ? `"${stateName}" ("statewide" OR "all counties")`
      : `"${countyOrArea}" "${stateName}"`;

    const orClauses = config.orTerms.length > 0 
      ? `(${config.orTerms.map(t => `"${t}"`).join(' OR ')})`
      : '("down payment assistance" OR "first-time buyer" OR "0% down")';

    const andClauses = config.andTerms.length > 0
      ? config.andTerms.map(t => `"${t}"`).join(' ')
      : '';

    const notClauses = config.notTerms.length > 0
      ? config.notTerms.map(t => `-${t.replace(/\s+/g, '')}`).join(' ')
      : '-commercial -wholesaler -investor';

    return `${geoClause} ${orClauses} ${andClauses} ${notClauses}`.trim();
  }

  /**
   * Evaluates whether a lead item satisfies the Boolean rules
   */
  static evaluateLeadMatch(
    lead: { title: string; snippet: string; matchedProgram: string; location: string; authorOrUser: string },
    config: BooleanScrapeConfig
  ): { matches: boolean; matchedTerms: string[]; excludedTerms: string[]; reason?: string } {
    if (!config.enabled) {
      return { matches: true, matchedTerms: [], excludedTerms: [] };
    }

    const searchableText = `${lead.title} ${lead.snippet} ${lead.matchedProgram} ${lead.location} ${lead.authorOrUser}`.toLowerCase();

    // 1. Check NOT terms (Immediate disqualification)
    const matchedNotTerms = config.notTerms.filter(term => {
      const cleanTerm = term.trim().toLowerCase();
      return cleanTerm && searchableText.includes(cleanTerm);
    });

    if (matchedNotTerms.length > 0) {
      return {
        matches: false,
        matchedTerms: [],
        excludedTerms: matchedNotTerms,
        reason: `Filtered out by NOT operator: "${matchedNotTerms.join(', ')}"`
      };
    }

    // 2. Check AND terms (ALL must be present if any are specified)
    const missingAndTerms = config.andTerms.filter(term => {
      const cleanTerm = term.trim().toLowerCase();
      return cleanTerm && !searchableText.includes(cleanTerm);
    });

    if (config.andTerms.length > 0 && missingAndTerms.length > 0) {
      return {
        matches: false,
        matchedTerms: [],
        excludedTerms: [],
        reason: `Missing required AND operator term: "${missingAndTerms.join(', ')}"`
      };
    }

    // 3. Check OR terms (At least ONE must be present if specified)
    const matchedOrTerms = config.orTerms.filter(term => {
      const cleanTerm = term.trim().toLowerCase();
      return cleanTerm && searchableText.includes(cleanTerm);
    });

    if (config.orTerms.length > 0 && matchedOrTerms.length === 0) {
      return {
        matches: false,
        matchedTerms: [],
        excludedTerms: [],
        reason: `Did not match any active OR operator keywords (${config.orTerms.slice(0, 3).join(', ')}...)`
      };
    }

    const allMatched = [...config.andTerms, ...matchedOrTerms];
    return {
      matches: true,
      matchedTerms: Array.from(new Set(allMatched)),
      excludedTerms: []
    };
  }

  /**
   * Evaluates the scrape result count against the threshold and suggests optimal radius expansions
   */
  static evaluateYield(
    leadCount: number,
    threshold: number,
    currentRadiusMiles: number,
    isStateWide: boolean,
    stateName: string,
    countyName: string
  ): YieldEvaluationResult {
    const isLowYield = leadCount < threshold;

    if (!isLowYield) {
      return {
        isLowYield: false,
        currentCount: leadCount,
        threshold,
        recommendedRadius: currentRadiusMiles,
        recommendationType: 'optimal',
        headline: `High Yield Achieved (${leadCount} Leads Discovered)`,
        suggestionMessage: `Current geographic search scope produced a healthy lead volume above your threshold of ${threshold} leads.`,
        suggestedScopeLabel: isStateWide ? '🌲 State-Wide' : `${currentRadiusMiles}mi Radius`
      };
    }

    // Determine the smart expansion step
    if (currentRadiusMiles <= 35) {
      return {
        isLowYield: true,
        currentCount: leadCount,
        threshold,
        recommendedRadius: 85,
        recommendationType: 'expand_radius',
        headline: `⚠️ Low Lead Yield Detected (${leadCount} of ${threshold} Min Leads)`,
        suggestionMessage: `Single-county search in ${countyName} returned only ${leadCount} leads. Broaden to an 85-mile Metro Hub radius to capture commuting first-time buyers and suburb DPA discussions.`,
        suggestedScopeLabel: '85mi Metro Hub Scope'
      };
    }

    if (currentRadiusMiles <= 90) {
      return {
        isLowYield: true,
        currentCount: leadCount,
        threshold,
        recommendedRadius: 160,
        recommendationType: 'expand_radius',
        headline: `⚠️ Limited Metro Yield (${leadCount} Leads Discovered)`,
        suggestionMessage: `Metro scan in ${countyName} yielded only ${leadCount} results. Expand to a 160-mile Multi-County Regional Corridor to pull in adjacent valley/coastal buyer threads.`,
        suggestedScopeLabel: '160mi Regional Corridor'
      };
    }

    if (!isStateWide && currentRadiusMiles < 200) {
      return {
        isLowYield: true,
        currentCount: leadCount,
        threshold,
        recommendedRadius: 250,
        recommendationType: 'statewide_mode',
        headline: `⚠️ Regional Search Below Minimum Target (${leadCount} Leads)`,
        suggestionMessage: `Regional radius produced fewer than ${threshold} leads. Switch to State-Wide Mode (250mi) across all ${stateName} counties to maximize discovery volume.`,
        suggestedScopeLabel: '🌲 250mi State-Wide Mode'
      };
    }

    return {
      isLowYield: true,
      currentCount: leadCount,
      threshold,
      recommendedRadius: 250,
      recommendationType: 'relax_boolean',
      headline: `⚠️ State-Wide Yield Constrained (${leadCount} Leads)`,
      suggestionMessage: `Even in State-Wide mode, only ${leadCount} leads matched. Consider relaxing strict Boolean NOT exclusions or adding broader OR keywords like "first home" or "credit".`,
      suggestedScopeLabel: 'Relax Boolean Filters'
    };
  }
}
