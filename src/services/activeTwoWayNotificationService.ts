/**
 * @file activeTwoWayNotificationService.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Intelligent Notification Service for 'Active Two-Way' Lead Responses
 * Dispatches distinct high-priority mobile push notifications whenever an
 * active two-way lead responds, completely isolated from standard Gmail draft alerts.
 */

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export interface ActiveTwoWayNotificationConfig {
  id: string;
  enabled: boolean;
  priorityLevel: 'urgent' | 'high' | 'normal';
  soundEnabled: boolean;
  audioChime: 'urgent_chime' | 'subtle_ping' | 'marimba' | 'sonar';
  vibratePatternEnabled: boolean;
  vibratePattern: number[];
  carrierSmsRelayEnabled: boolean;
  targetMobileNumber: string;
  separateFromGmailDrafts: boolean; // Enforces distinct notification channel & tags
  customPrefix: string;
  requireImmediateAck: boolean;
  notifyOnForumComment: boolean;
  totalAlertsDelivered: number;
  lastAlertSentAt?: string;
  lastLeadAuthor?: string;
  updatedAt?: string;
}

export interface ActiveTwoWayResponsePayload {
  leadId: string;
  author: string;
  location?: string;
  matchedProgram?: string;
  replyText: string;
  platform?: string;
  messageThreadId?: string;
  targetCommentId?: string;
}

export const STORAGE_ACTIVE_2WAY_NOTIF_KEY = 'vantage_active_two_way_notif_config_v1';

export const DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG: ActiveTwoWayNotificationConfig = {
  id: 'active_two_way_alerts',
  enabled: true,
  priorityLevel: 'urgent',
  soundEnabled: true,
  audioChime: 'urgent_chime',
  vibratePatternEnabled: true,
  vibratePattern: [300, 100, 300, 100, 300], // Urgent double-pulse pattern
  carrierSmsRelayEnabled: true,
  targetMobileNumber: '+1 (541) 729-2097',
  separateFromGmailDrafts: true, // Guarantees isolation from Gmail draft notifications
  customPrefix: '⚡ [PRIORITY ACTIVE 2-WAY RESPONSE]',
  requireImmediateAck: true,
  notifyOnForumComment: true,
  totalAlertsDelivered: 0
};

/**
 * Web Audio API synthesizer for priority alert chimes.
 * Works natively across Safari on iOS and modern browsers without external audio assets.
 */
export function playPriorityAudioChime(chimeType: string = 'urgent_chime'): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    
    if (chimeType === 'urgent_chime') {
      // Ascending triple-burst high-priority alert (880Hz -> 1320Hz -> 1760Hz)
      const freqs = [880, 1320, 1760];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.11);
        gain.gain.setValueAtTime(0.25, now + idx * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.11 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.11);
        osc.stop(now + idx * 0.11 + 0.2);
      });
    } else if (chimeType === 'subtle_ping') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1046.5, now);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } else {
      // Marimba / Sonar style
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(1318.5, now + 0.15);
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    }
  } catch (err) {
    console.warn('AudioContext playback error:', err);
  }
}

export class ActiveTwoWayNotificationService {
  /**
   * Load current configuration from localStorage with defaults fallback.
   */
  static getConfig(): ActiveTwoWayNotificationConfig {
    if (typeof window === 'undefined') return DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG;
    try {
      const raw = localStorage.getItem(STORAGE_ACTIVE_2WAY_NOTIF_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_ACTIVE_2WAY_NOTIF_KEY, JSON.stringify(DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG));
        return DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG;
      }
      return { ...DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG;
    }
  }

  /**
   * Persist configuration to localStorage and Firestore.
   */
  static async saveConfig(config: ActiveTwoWayNotificationConfig): Promise<void> {
    const payload = {
      ...config,
      updatedAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(STORAGE_ACTIVE_2WAY_NOTIF_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to cache notification config to localStorage:', e);
    }

    try {
      const docRef = doc(db, 'lead_notification_settings', config.id);
      await setDoc(docRef, payload, { merge: true });
    } catch (e) {
      console.warn('Failed to persist notification config to Firestore:', e);
    }
  }

  /**
   * Fetch saved configuration from Firestore if present.
   */
  static async fetchRemoteConfig(): Promise<ActiveTwoWayNotificationConfig> {
    try {
      const docRef = doc(db, 'lead_notification_settings', DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG.id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const remoteData = snap.data() as ActiveTwoWayNotificationConfig;
        const merged = { ...DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG, ...remoteData };
        localStorage.setItem(STORAGE_ACTIVE_2WAY_NOTIF_KEY, JSON.stringify(merged));
        return merged;
      }
    } catch (err) {
      console.warn('Failed to fetch remote notification config:', err);
    }
    return this.getConfig();
  }

  /**
   * Dispatches a Priority Push Notification specifically for an Active Two-Way lead response.
   * Completely isolated from the standard Gmail draft notification stream.
   */
  static async dispatchPriorityResponsePush(
    payload: ActiveTwoWayResponsePayload,
    customConfig?: ActiveTwoWayNotificationConfig
  ): Promise<{
    delivered: boolean;
    channelUsed: string;
    notificationTitle: string;
    timestamp: string;
  }> {
    const config = customConfig || this.getConfig();
    const nowIso = new Date().toISOString();

    if (!config.enabled) {
      return {
        delivered: false,
        channelUsed: 'disabled',
        notificationTitle: '',
        timestamp: nowIso
      };
    }

    // 1. Play priority auditory chime
    if (config.soundEnabled) {
      playPriorityAudioChime(config.audioChime);
    }

    // 2. Hardware vibration on mobile devices
    if (config.vibratePatternEnabled && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(config.vibratePattern || [300, 100, 300, 100, 300]);
      } catch {}
    }

    // 3. Format distinctive priority notification elements
    const cleanDigits = (config.targetMobileNumber || '5417292097').replace(/[^0-9]/g, '');
    const tenDigits = cleanDigits.length === 11 && cleanDigits.startsWith('1') ? cleanDigits.slice(1) : cleanDigits;
    const threadTag = payload.messageThreadId ? ` [Thread: #${payload.messageThreadId}]` : '';
    const smsReplyBody = `[In-Reply-To @${payload.author}${threadTag}]: Hi ${payload.author}! Got your response. Let's run your exact numbers review.`;
    const nativeSmsDeepLink = `sms:+1${tenDigits}?body=${encodeURIComponent(smsReplyBody)}`;

    // Title explicitly indicates an Inbound Response from an Active Lead (distinct from Gmail Draft alerts)
    const notificationTitle = `${config.customPrefix || '⚡ [PRIORITY ACTIVE 2-WAY RESPONSE]'} ${payload.author}${payload.location ? ` (${payload.location})` : ''}`;
    const notificationBody = `💬 "${payload.replyText.slice(0, 180)}"\n👉 1-Tap to respond immediately in Apple Messages!`;

    // Dedicated separate tag to ensure no collision with Gmail draft alerts
    const distinctTag = `vantage-active-2way-priority-${payload.leadId}-${Date.now()}`;

    const notificationOptions: NotificationOptions = {
      body: notificationBody,
      icon: '/assets/icon-192.png',
      badge: '/assets/icon-192.png',
      tag: distinctTag,
      requireInteraction: config.requireImmediateAck, // Stays on screen until LO addresses it
      silent: false,
      data: {
        type: 'active_two_way_priority_response',
        leadId: payload.leadId,
        author: payload.author,
        smsUrl: nativeSmsDeepLink,
        messageThreadId: payload.messageThreadId,
        isSeparateFromGmailDraft: true,
        priorityLevel: config.priorityLevel,
        deliveredAt: nowIso
      }
    };

    let deliveredViaWebPush = false;

    // 4. Trigger Web Push / Service Worker Mobile Lock Screen Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            const reg = await navigator.serviceWorker.ready;
            await reg.showNotification(notificationTitle, notificationOptions);
            deliveredViaWebPush = true;
          } else {
            const fallbackNotif = new Notification(notificationTitle, notificationOptions);
            fallbackNotif.onclick = () => {
              window.focus();
              window.location.href = nativeSmsDeepLink;
            };
            deliveredViaWebPush = true;
          }
        } catch (pushErr) {
          console.warn('Web push delivery fallback:', pushErr);
          try {
            const fallbackNotif = new Notification(notificationTitle, notificationOptions);
            fallbackNotif.onclick = () => {
              window.focus();
              window.location.href = nativeSmsDeepLink;
            };
            deliveredViaWebPush = true;
          } catch {}
        }
      } else if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }

    // 5. Carrier SMS Gateway Dispatch if enabled
    if (config.carrierSmsRelayEnabled) {
      try {
        fetch('/api/lead-discovery/dispatch-high-intent-alert', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            leadId: payload.leadId,
            author: payload.author,
            platform: payload.platform || 'Active 2-Way Conversation',
            title: `[PRIORITY LEAD RESPONSE] from ${payload.author}`,
            snippet: payload.replyText,
            matchedProgram: payload.matchedProgram || '2-Way Loan Consultation',
            location: payload.location || 'Oregon',
            intentScore: 100, // Highest priority
            toCellNumber: config.targetMobileNumber || '+1 (541) 729-2097',
            carrier: 'verizon',
            isPriorityResponse: true
          })
        }).catch(() => {});
      } catch {}
    }

    // 6. Update tracking metrics
    const updatedConfig: ActiveTwoWayNotificationConfig = {
      ...config,
      totalAlertsDelivered: (config.totalAlertsDelivered || 0) + 1,
      lastAlertSentAt: nowIso,
      lastLeadAuthor: payload.author
    };
    await this.saveConfig(updatedConfig);

    return {
      delivered: deliveredViaWebPush || config.carrierSmsRelayEnabled,
      channelUsed: deliveredViaWebPush ? 'web_push_and_sms' : 'carrier_sms',
      notificationTitle,
      timestamp: nowIso
    };
  }
}
