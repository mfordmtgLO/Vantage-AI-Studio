/**
 * ============================================================================
 * VANTAGE AI STUDIO • WORKSPACE COMMUNICATION SETTINGS STORAGE & SYNC
 * Copyright (c) 2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Manages user email-to-SMS gateway addresses (e.g. [phone]@vtext.com), carrier
 * configurations, high-intent conversation relay triggers, and automated notification
 * parameters across the entire Workspace.
 * ============================================================================
 */

export interface CommunicationSettings {
  emailToSmsGateway: string; // e.g. "5417292097@vtext.com"
  phoneNumber: string;       // e.g. "541-729-2097"
  carrier: 'verizon' | 'att' | 'tmobile' | 'uscellular' | 'cricket' | 'custom';
  relayEnabled: boolean;     // Enable high-intent conversation scrape relay
  minIntentThreshold: number;// e.g. 90%
  targetCounties: string[];  // e.g. ['all_8_counties'] or ['deschutes', 'lane', 'marion']
  autoReactivationAlerts: boolean;
  quietHoursEnabled: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  updatedAt: string;
}

export const DEFAULT_COMMUNICATION_SETTINGS: CommunicationSettings = {
  emailToSmsGateway: '5417292097@vtext.com',
  phoneNumber: '541-729-2097',
  carrier: 'verizon',
  relayEnabled: true,
  minIntentThreshold: 90,
  targetCounties: ['all_8_counties'],
  autoReactivationAlerts: true,
  quietHoursEnabled: false,
  updatedAt: new Date().toISOString()
};

export const CARRIER_GATEWAY_DOMAINS: Record<string, { name: string; domain: string; example: string }> = {
  verizon: { name: 'Verizon Wireless', domain: 'vtext.com', example: '5417292097@vtext.com' },
  att: { name: 'AT&T Mobility', domain: 'txt.att.net', example: '5417292097@txt.att.net' },
  tmobile: { name: 'T-Mobile', domain: 'tmomail.net', example: '5417292097@tmomail.net' },
  uscellular: { name: 'US Cellular', domain: 'email.uscc.net', example: '5417292097@email.uscc.net' },
  cricket: { name: 'Cricket Wireless', domain: 'mms.cricketwireless.net', example: '5417292097@mms.cricketwireless.net' },
  custom: { name: 'Custom Gateway', domain: '', example: 'user@custom-sms.com' }
};

const STORAGE_KEY = 'vantage_communication_settings';

export const getCommunicationSettings = (): CommunicationSettings => {
  if (typeof window === 'undefined') return DEFAULT_COMMUNICATION_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_COMMUNICATION_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.warn('Failed to load communication settings:', e);
  }
  return DEFAULT_COMMUNICATION_SETTINGS;
};

export const saveCommunicationSettings = (settings: Partial<CommunicationSettings>): CommunicationSettings => {
  const current = getCommunicationSettings();
  const updated: CommunicationSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('vantage-communication-settings-updated', { detail: updated }));
  } catch (e) {
    console.warn('Failed to save communication settings:', e);
  }
  return updated;
};
