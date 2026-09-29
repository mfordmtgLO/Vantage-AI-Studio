/**
 * @file leadAutoArchiveService.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Lead Discovery Autonomous AI Auto-Archive Rule Service
 * Governs the 'Max Dormant Days' threshold setting, automated dormant lead evaluation,
 * and bulk persistence to Firestore's 'stored_archives' collection.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface AutoArchiveRuleConfig {
  id: string;
  enabled: boolean;
  maxDormantDays: number; // Threshold in days (e.g. 7, 14, 30)
  autoRunOnSweep: boolean;
  autoRunOnMount: boolean;
  notifyOnArchive: boolean;
  destinationCollection: 'stored_archives';
  lastRunAt?: string;
  lastRunSummary?: string;
  totalArchivedCount: number;
  updatedAt?: string;
}

export const STORAGE_AUTO_ARCHIVE_KEY = 'vantage_lead_auto_archive_rule_v1';

export const DEFAULT_AUTO_ARCHIVE_RULE: AutoArchiveRuleConfig = {
  id: 'auto_archive_dormant_leads',
  enabled: true,
  maxDormantDays: 14, // Recommended 14-day threshold
  autoRunOnSweep: true,
  autoRunOnMount: true,
  notifyOnArchive: true,
  destinationCollection: 'stored_archives',
  totalArchivedCount: 0
};

/**
 * Calculate the number of days a lead has been dormant/inactive based on timestamp or discoveredAt.
 */
export function calculateLeadDormantDays(lead: {
  timestamp?: number;
  discoveredAt?: string;
  status?: string;
}): number {
  let refTime = lead.timestamp;
  if (!refTime && lead.discoveredAt) {
    const parsed = Date.parse(lead.discoveredAt);
    if (!isNaN(parsed)) {
      refTime = parsed;
    }
  }

  if (!refTime) {
    // If status indicates dormant 7+, return at least 7 days
    if (lead.status === 'dormant_7_days') return 7;
    return 0;
  }

  const diffMs = Date.now() - refTime;
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));

  // If labeled dormant_7_days but timestamp was simulated recently, ensure at least 7 days
  if (lead.status === 'dormant_7_days' && days < 7) {
    return 7;
  }

  return days;
}

export class LeadAutoArchiveService {
  /**
   * Retrieve active Auto-Archive Rule configuration from localStorage.
   */
  static getRuleConfig(): AutoArchiveRuleConfig {
    try {
      const raw = localStorage.getItem(STORAGE_AUTO_ARCHIVE_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_AUTO_ARCHIVE_KEY, JSON.stringify(DEFAULT_AUTO_ARCHIVE_RULE));
        return DEFAULT_AUTO_ARCHIVE_RULE;
      }
      return { ...DEFAULT_AUTO_ARCHIVE_RULE, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_AUTO_ARCHIVE_RULE;
    }
  }

  /**
   * Save and persist Auto-Archive Rule configuration to localStorage and Firestore.
   */
  static async saveRuleConfig(config: AutoArchiveRuleConfig): Promise<void> {
    const payload = {
      ...config,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_AUTO_ARCHIVE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.warn('Failed to cache auto-archive config to localStorage:', err);
    }

    try {
      const docRef = doc(db, 'lead_auto_archive_rules', config.id);
      await setDoc(docRef, payload, { merge: true });
    } catch (err) {
      console.warn('Failed to persist auto-archive config to Firestore:', err);
    }
  }

  /**
   * Fetch saved rule from Firestore if available, otherwise return local cache.
   */
  static async fetchRemoteRuleConfig(): Promise<AutoArchiveRuleConfig> {
    try {
      const docRef = doc(db, 'lead_auto_archive_rules', DEFAULT_AUTO_ARCHIVE_RULE.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const remoteData = snap.data() as AutoArchiveRuleConfig;
        const merged = { ...DEFAULT_AUTO_ARCHIVE_RULE, ...remoteData };
        localStorage.setItem(STORAGE_AUTO_ARCHIVE_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Could not read remote auto-archive rule from Firestore:', err);
    }
    return this.getRuleConfig();
  }

  /**
   * Check if a specific lead qualifies for auto-archiving under the active rule.
   */
  static shouldAutoArchiveLead(
    lead: {
      id: string;
      status: string;
      timestamp?: number;
      discoveredAt?: string;
    },
    config: AutoArchiveRuleConfig
  ): { qualify: boolean; dormantDays: number; reason: string } {
    if (!config.enabled) {
      return { qualify: false, dormantDays: 0, reason: 'Auto-archive rule is currently disabled.' };
    }

    // Never re-archive leads that are already archived
    if (lead.status === 'archived_discovery') {
      return { qualify: false, dormantDays: 0, reason: 'Lead is already in Stored Archives.' };
    }

    const dormantDays = calculateLeadDormantDays(lead);
    const qualify = dormantDays >= config.maxDormantDays;

    return {
      qualify,
      dormantDays,
      reason: qualify
        ? `Lead has been dormant for ${dormantDays} days, exceeding the threshold of ${config.maxDormantDays} days.`
        : `Lead has only been dormant for ${dormantDays} days (below threshold of ${config.maxDormantDays} days).`
    };
  }

  /**
   * Execute auto-archive evaluation over an array of leads, moving matching items to 'stored_archives'.
   */
  static async runAutoArchiveSweep<T extends {
    id: string;
    status: string;
    sourceType?: string;
    platform?: string;
    title?: string;
    authorOrUser?: string;
    snippet?: string;
    intentScore?: number;
    sentimentScore?: string;
    location?: string;
    matchedProgram?: string;
    discoveredAt?: string;
    url?: string;
    timestamp?: number;
    archivedAt?: string;
    archivedReason?: string;
    dormantDaysCount?: number;
  }>(
    leads: T[],
    customConfig?: AutoArchiveRuleConfig
  ): Promise<{
    updatedLeads: T[];
    archivedLeads: T[];
    archivedCount: number;
    summary: string;
  }> {
    const config = customConfig || this.getRuleConfig();

    if (!config.enabled) {
      return {
        updatedLeads: leads,
        archivedLeads: [],
        archivedCount: 0,
        summary: 'Auto-Archive rule is disabled. No leads were moved.'
      };
    }

    const nowIso = new Date().toISOString();
    const toArchive: T[] = [];
    const updatedLeads: T[] = leads.map((lead) => {
      const evalResult = this.shouldAutoArchiveLead(lead, config);
      if (evalResult.qualify) {
        const archivedItem: T = {
          ...lead,
          status: 'archived_discovery',
          archivedAt: nowIso,
          archivedReason: `Auto-Archived by AI Rule (Dormant ${evalResult.dormantDays}d >= threshold ${config.maxDormantDays}d)`,
          dormantDaysCount: evalResult.dormantDays
        };
        toArchive.push(archivedItem);
        return archivedItem;
      }
      return lead;
    });

    // Write all qualified leads to Firestore stored_archives collection
    if (toArchive.length > 0) {
      try {
        await Promise.all(
          toArchive.map(async (lead) => {
            const archiveDocRef = doc(db, 'stored_archives', lead.id);
            return setDoc(
              archiveDocRef,
              {
                id: lead.id,
                sourceType: lead.sourceType || 'forum',
                platform: lead.platform || 'General Discussion',
                title: lead.title || 'Archived Inquiry',
                authorOrUser: lead.authorOrUser || 'Prospect',
                snippet: lead.snippet || '',
                intentScore: lead.intentScore || 50,
                sentimentScore: lead.sentimentScore || 'Neutral',
                location: lead.location || 'Oregon',
                matchedProgram: lead.matchedProgram || 'Housing Program',
                discoveredAt: lead.discoveredAt || nowIso,
                url: lead.url || '',
                status: 'archived_discovery',
                archivedAt: nowIso,
                archivedReason: lead.archivedReason,
                dormantDaysCount: lead.dormantDaysCount,
                autoArchivedByRule: true,
                thresholdAppliedDays: config.maxDormantDays
              },
              { merge: true }
            );
          })
        );
      } catch (err) {
        console.warn('Failed to bulk write auto-archived leads to Firestore stored_archives:', err);
      }
    }

    const summary = toArchive.length > 0
      ? `AI Auto-Archive moved ${toArchive.length} dormant leads (>= ${config.maxDormantDays} days) to the 'Stored Archives' collection.`
      : `Audit complete: All active leads are under the ${config.maxDormantDays}-day dormancy threshold. Zero leads archived.`;

    // Persist updated execution status
    const updatedConfig: AutoArchiveRuleConfig = {
      ...config,
      totalArchivedCount: (config.totalArchivedCount || 0) + toArchive.length,
      lastRunAt: nowIso,
      lastRunSummary: summary
    };
    await this.saveRuleConfig(updatedConfig);

    return {
      updatedLeads,
      archivedLeads: toArchive,
      archivedCount: toArchive.length,
      summary
    };
  }
}
