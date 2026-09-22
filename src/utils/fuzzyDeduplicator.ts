/**
 * Vantage AI Workspace - Multi-Source Fuzzy De-Duplication & Permanent Domain Purge Engine
 * Levenshtein Distance Matrix, Canonical Email Normalization, and 2nd Brain Blacklist Sync
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

export interface RawLeadRecord {
  id: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  company?: string;
  sourceFile: string;
  rawText?: string;
  [key: string]: any;
}

export interface CleanedUnifiedLead {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  canonicalEmail: string;
  domain: string;
  phone: string;
  rawPhone: string;
  company: string;
  sourceFile: string;
  matchClusterId?: string;
  isDuplicate: boolean;
  isBlacklistedDomain: boolean;
  blacklistReason?: string;
  confidenceScore: number;
}

export const DEFAULT_BLACKISTED_DOMAINS = [
  'coldleads-scraper.biz',
  'junkmail-leadgen.xyz',
  'tempmail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'mailinator.com',
  'spambot.net',
  'sharklasers.com',
  'dispostable.com',
  '10minutemail.com',
  'fakeleads-direct.co'
];

export class FuzzyDeduplicationEngine {
  /**
   * Calculate Levenshtein edit distance between two strings
   */
  static levenshteinDistance(a: string, b: string): number {
    const s1 = a.toLowerCase().trim();
    const s2 = b.toLowerCase().trim();

    if (s1 === s2) return 0;
    if (s1.length === 0) return s2.length;
    if (s2.length === 0) return s1.length;

    const matrix: number[][] = [];

    for (let i = 0; i <= s1.length; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= s2.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= s1.length; i++) {
      for (let j = 1; j <= s2.length; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1, // deletion
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j - 1] + cost // substitution
        );
      }
    }

    return matrix[s1.length][s2.length];
  }

  /**
   * Similarity score between 0.0 and 1.0
   */
  static similarityRatio(a: string, b: string): number {
    const s1 = a.trim();
    const s2 = b.trim();
    if (!s1 && !s2) return 1.0;
    if (!s1 || !s2) return 0.0;

    const maxLen = Math.max(s1.length, s2.length);
    if (maxLen === 0) return 1.0;

    const dist = this.levenshteinDistance(s1, s2);
    return Math.max(0, 1 - dist / maxLen);
  }

  /**
   * Normalize and format US phone numbers to (XXX) XXX-XXXX
   */
  static formatPhoneNumber(raw: string): { formatted: string; digits: string } {
    const digits = String(raw || '').replace(/\D/g, '');
    if (digits.length === 10) {
      return {
        formatted: `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`,
        digits
      };
    }
    if (digits.length === 11 && digits.startsWith('1')) {
      const ten = digits.slice(1);
      return {
        formatted: `(${ten.slice(0, 3)}) ${ten.slice(3, 6)}-${ten.slice(6)}`,
        digits: ten
      };
    }
    return { formatted: raw || '', digits };
  }

  /**
   * Canonicalize email: strip plus-addressing (e.g. mike+tag@gmail.com -> mike@gmail.com), trim, lowercase
   */
  static canonicalizeEmail(email: string): { canonical: string; domain: string } {
    const cleaned = String(email || '').trim().toLowerCase();
    if (!cleaned.includes('@')) return { canonical: cleaned, domain: '' };

    const parts = cleaned.split('@');
    let user = parts[0];
    const domain = parts[1] || '';

    // Strip +tags in gmail/google/outlook addresses
    if (user.includes('+')) {
      user = user.split('+')[0];
    }
    // Remove dots for gmail
    if (domain === 'gmail.com' || domain === 'googlemail.com') {
      user = user.replace(/\./g, '');
    }

    return {
      canonical: `${user}@${domain}`,
      domain
    };
  }

  /**
   * Process raw leads with fuzzy matching and permanent domain blacklist purge
   */
  static processLeadVault(
    records: RawLeadRecord[],
    customBlacklistDomains: string[] = [],
    similarityThreshold: number = 0.85
  ): {
    uniqueLeads: CleanedUnifiedLead[];
    duplicates: CleanedUnifiedLead[];
    purgedBlacklist: CleanedUnifiedLead[];
    duplicateClustersCount: number;
    auditSummary: {
      totalIngested: number;
      uniqueRetained: number;
      duplicatesEliminated: number;
      spamDomainsPurged: number;
      phonesStandardized: number;
    };
  } {
    const allBlacklist = new Set([
      ...DEFAULT_BLACKISTED_DOMAINS.map((d) => d.toLowerCase().trim()),
      ...customBlacklistDomains.map((d) => d.toLowerCase().trim())
    ]);

    const cleanedList: CleanedUnifiedLead[] = [];
    const duplicates: CleanedUnifiedLead[] = [];
    const purgedBlacklist: CleanedUnifiedLead[] = [];
    let phonesStandardized = 0;

    const seenCanonicalEmails = new Map<string, CleanedUnifiedLead>();
    const seenPhoneDigits = new Map<string, CleanedUnifiedLead>();
    let clusterCounter = 1;

    for (let i = 0; i < records.length; i++) {
      const r = records[i];
      const { canonical, domain } = this.canonicalizeEmail(r.email || '');
      const { formatted: formattedPhone, digits: phoneDigits } = this.formatPhoneNumber(r.phone || '');

      if (phoneDigits.length === 10 && formattedPhone !== r.phone) {
        phonesStandardized++;
      }

      const firstName = r.firstName || (r.fullName ? r.fullName.split(' ')[0] : 'Unknown');
      const lastName = r.lastName || (r.fullName ? r.fullName.split(' ').slice(1).join(' ') : '');
      const fullName = r.fullName || `${firstName} ${lastName}`.trim();
      const company = r.company || '';

      const leadItem: CleanedUnifiedLead = {
        id: `lead-${i + 1}`,
        firstName,
        lastName,
        fullName,
        email: r.email || '',
        canonicalEmail: canonical,
        domain,
        phone: formattedPhone,
        rawPhone: r.phone || '',
        company,
        sourceFile: r.sourceFile,
        isDuplicate: false,
        isBlacklistedDomain: false,
        confidenceScore: 0.98
      };

      // 1. Check Permanent Blacklist Domain
      if (domain && allBlacklist.has(domain)) {
        leadItem.isBlacklistedDomain = true;
        leadItem.blacklistReason = `Domain "${domain}" matches persistent 2nd Brain blacklist rules.`;
        purgedBlacklist.push(leadItem);
        continue;
      }

      // 2. Check Exact Canonical Email Duplicate
      if (canonical && seenCanonicalEmails.has(canonical)) {
        const parent = seenCanonicalEmails.get(canonical)!;
        leadItem.isDuplicate = true;
        leadItem.matchClusterId = parent.matchClusterId || `cluster-${clusterCounter++}`;
        parent.matchClusterId = leadItem.matchClusterId;
        duplicates.push(leadItem);
        continue;
      }

      // 3. Check Exact Phone Duplicate
      if (phoneDigits.length === 10 && seenPhoneDigits.has(phoneDigits)) {
        const parent = seenPhoneDigits.get(phoneDigits)!;
        leadItem.isDuplicate = true;
        leadItem.matchClusterId = parent.matchClusterId || `cluster-${clusterCounter++}`;
        parent.matchClusterId = leadItem.matchClusterId;
        duplicates.push(leadItem);
        continue;
      }

      // 4. Check Fuzzy Name & Company Match against existing cleaned leads
      let isFuzzyDuplicate = false;
      for (const existing of cleanedList) {
        const nameSim = this.similarityRatio(existing.fullName, leadItem.fullName);
        const compSim = existing.company && leadItem.company ? this.similarityRatio(existing.company, leadItem.company) : 0;

        if (nameSim >= similarityThreshold && (compSim >= 0.7 || !existing.company || !leadItem.company)) {
          leadItem.isDuplicate = true;
          leadItem.matchClusterId = existing.matchClusterId || `cluster-${clusterCounter++}`;
          existing.matchClusterId = leadItem.matchClusterId;
          leadItem.confidenceScore = nameSim;
          duplicates.push(leadItem);
          isFuzzyDuplicate = true;
          break;
        }
      }

      if (isFuzzyDuplicate) continue;

      // Retained as Unique
      if (canonical) seenCanonicalEmails.set(canonical, leadItem);
      if (phoneDigits.length === 10) seenPhoneDigits.set(phoneDigits, leadItem);
      cleanedList.push(leadItem);
    }

    return {
      uniqueLeads: cleanedList,
      duplicates,
      purgedBlacklist,
      duplicateClustersCount: clusterCounter - 1,
      auditSummary: {
        totalIngested: records.length,
        uniqueRetained: cleanedList.length,
        duplicatesEliminated: duplicates.length,
        spamDomainsPurged: purgedBlacklist.length,
        phonesStandardized
      }
    };
  }
}
