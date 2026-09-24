/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • TWILIO SMS RELAY & INBOUND WEBHOOK INTEGRATION
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Single-Account Twilio Architecture:
 * - Loan Officer (Mike Ford) owns the single Twilio API Account + Virtual SMS Number.
 * - Realtor (Kanndice McLean) receives standard carrier SMS text messages on her personal phone.
 * - Kanndice replies via standard SMS on her phone -> Twilio Webhook catches reply ->
 *   auto-appends note into Property Listing Card NOTES and fires dual push notifications!
 * ============================================================================
 */

export interface TwilioConfig {
  accountSid: string;
  authToken: string;
  twilioPhoneNumber: string;
  webhookUrl: string;
  isConfigured: boolean;
}

const DEFAULT_TWILIO_CONFIG: TwilioConfig = {
  accountSid: '',
  authToken: '',
  twilioPhoneNumber: '+1 (833) 826-8243', // Default LO Vantage System Number
  webhookUrl: '/api/twilio/inbound-sms',
  isConfigured: false
};

export class TwilioSmsRelayService {
  private static STORAGE_KEY = 'vantage_twilio_config_v1';

  public static getConfig(): TwilioConfig {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(this.STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...DEFAULT_TWILIO_CONFIG,
            ...parsed,
            isConfigured: Boolean(parsed.accountSid && parsed.authToken)
          };
        }
      }
    } catch {}
    return DEFAULT_TWILIO_CONFIG;
  }

  public static saveConfig(config: Partial<TwilioConfig>): TwilioConfig {
    const updated = {
      ...this.getConfig(),
      ...config,
      isConfigured: Boolean(config.accountSid && config.authToken)
    };
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
    return updated;
  }

  public static async dispatchOutboundSms(payload: {
    toPhoneNumber: string;
    messageBody: string;
    propertyAddress: string;
    leadName: string;
  }): Promise<{ success: boolean; messageSid?: string; error?: string; mode: 'twilio' | 'native_sms' }> {
    const config = this.getConfig();

    try {
      const response = await fetch('/api/twilio/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          accountSid: config.accountSid,
          authToken: config.authToken,
          fromPhoneNumber: config.twilioPhoneNumber
        })
      });

      if (response.ok) {
        const result = await response.json();
        return {
          success: true,
          messageSid: result.sid || `SM${Date.now()}`,
          mode: 'twilio'
        };
      }
    } catch (err: any) {
      console.warn('Twilio server dispatch fallback:', err.message);
    }

    return {
      success: true,
      mode: 'native_sms'
    };
  }
}

export default TwilioSmsRelayService;
