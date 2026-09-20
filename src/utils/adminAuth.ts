import { User } from 'firebase/auth';

export const ADMIN_PRIMARY_EMAIL = 'fordmj@gmail.com';
export const ADMIN_PRIMARY_NAME = 'Mike Ford';

export interface PluginDistributionRecord {
  id: string;
  clientName: string;
  targetDomain: string;
  licenseKey: string;
  distributionType: 'full_hybrid' | 'react_widget' | 'headless_hook' | 'llm_prompt_spec';
  distributedAt: string;
  notes?: string;
  status: 'active' | 'revoked';
}

/**
 * Checks if the given user is the authorized administrator (Mike Ford).
 */
export function isMikeFordAdmin(user: User | { email?: string | null } | null | undefined): boolean {
  if (!user || !user.email) return false;
  const email = user.email.toLowerCase().trim();
  return email === ADMIN_PRIMARY_EMAIL.toLowerCase();
}

/**
 * Retrieves the list of authorized plugin distributions recorded by Mike Ford.
 */
export function getSavedPluginDistributions(): PluginDistributionRecord[] {
  try {
    const saved = localStorage.getItem('vantage_admin_plugin_distributions');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Could not read saved plugin distributions:', e);
  }
  return [
    {
      id: 'dist_sample_1',
      clientName: 'Enterprise Client Alpha',
      targetDomain: 'alpha-enterprise.com',
      licenseKey: 'VNTG-2NDBRAIN-AF89-2026',
      distributionType: 'full_hybrid',
      distributedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      notes: 'Initial customized deployment with DeepSeek R1 + Gemini hybrid pipeline',
      status: 'active'
    }
  ];
}

/**
 * Saves a new or updated distribution record to storage.
 */
export function savePluginDistribution(record: PluginDistributionRecord): void {
  try {
    const current = getSavedPluginDistributions();
    const existingIndex = current.findIndex(r => r.id === record.id);
    let updated: PluginDistributionRecord[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = record;
    } else {
      updated = [record, ...current];
    }
    localStorage.setItem('vantage_admin_plugin_distributions', JSON.stringify(updated));
  } catch (e) {
    console.warn('Could not save plugin distribution record:', e);
  }
}

/**
 * Deletes a distribution record.
 */
export function deletePluginDistribution(id: string): void {
  try {
    const current = getSavedPluginDistributions();
    const filtered = current.filter(r => r.id !== id);
    localStorage.setItem('vantage_admin_plugin_distributions', JSON.stringify(filtered));
  } catch (e) {
    console.warn('Could not delete plugin distribution record:', e);
  }
}

/**
 * Generates an authorized distribution watermark header for exported code and files.
 */
export function generateDistributionWatermarkHeader(
  clientName: string = 'Authorized Client',
  domain: string = 'authorized-domain.com',
  licenseKey: string = 'VNTG-PROPRIETARY-2026'
): string {
  return `/**
 * ============================================================================
 * VANTAGE HYBRID 2ND BRAIN & HARNESS AGENT PROPRIETARY PLUGIN MODULE
 * ============================================================================
 * Copyright (c) ${new Date().getFullYear()} Vantage AI Workspace. All Rights Reserved.
 * Authored & Distributed Exclusively by: ${ADMIN_PRIMARY_NAME} (${ADMIN_PRIMARY_EMAIL})
 * 
 * LICENSED TO: ${clientName}
 * AUTHORIZED DOMAIN: ${domain}
 * LICENSE KEY: ${licenseKey}
 * ISSUED AT: ${new Date().toISOString()}
 * 
 * PROPRIETARY ARCHITECTURE - UNLAWFUL REDISTRIBUTION OR REPLICATION STRICTLY PROHIBITED
 * ============================================================================
 */\n\n`;
}
