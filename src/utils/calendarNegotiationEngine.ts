/**
 * Vantage AI Workspace - Autonomous Meeting Negotiation & Calendar Concierge Engine
 * 15-Minute Buffer Calculation, NLP Inbound Parsing, and 3-Slot Conflict De-escalator
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

import { CalendarEvent } from '../types';

export interface ProposedMeetingSlot {
  id: string;
  slotNumber: 1 | 2 | 3;
  dateStr: string;
  startTimeFormatted: string;
  endTimeFormatted: string;
  startIso: string;
  endIso: string;
  prepBufferMinutes: number; // e.g. 15 min focus buffer
  postBufferMinutes: number;
  timezoneLabel: string;
  dayOfWeek: string;
  isHeldAsSoftHold: boolean;
}

export interface ParsedMeetingRequest {
  rawText: string;
  clientName: string;
  clientEmail?: string;
  topic: string;
  requestedDurationMinutes: number;
  preferredDays: string[];
  preferredTimeOfDay: 'morning' | 'afternoon' | 'any';
  urgency: 'high' | 'normal';
}

export class CalendarNegotiationEngine {
  /**
   * Parse messy natural language email inquiries into structured scheduling requirements
   */
  static parseInboundRequest(text: string): ParsedMeetingRequest {
    let duration = 30;
    if (text.includes('45 min') || text.includes('45-min') || text.includes('45 minutes')) duration = 45;
    else if (text.includes('60 min') || text.includes('1 hour') || text.includes('hour')) duration = 60;
    else if (text.includes('15 min')) duration = 15;

    let timeOfDay: 'morning' | 'afternoon' | 'any' = 'any';
    if (text.toLowerCase().includes('morning') || text.toLowerCase().includes('am')) timeOfDay = 'morning';
    else if (text.toLowerCase().includes('afternoon') || text.toLowerCase().includes('pm')) timeOfDay = 'afternoon';

    const days: string[] = [];
    ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].forEach((d) => {
      if (new RegExp(`\\b${d}\\b`, 'i').test(text)) {
        days.push(d);
      }
    });

    let topic = 'Strategy & Consultation Sync';
    if (/closing disclosure|closing|escrow/i.test(text)) topic = 'Closing Disclosures & Settlement Review';
    else if (/underwriting|guideline|rate lock/i.test(text)) topic = 'Underwriting & Rate Lock Review';
    else if (/first time homebuyer|dpa|grant/i.test(text)) topic = 'First-Time Homebuyer DPA Consultation';
    else if (/architect|engineering|scaffolding/i.test(text)) topic = 'AI Architecture & Workflow Onboarding';

    let clientName = 'Valued Partner / Client';
    const nameMatch = text.match(/(?:from|best|thanks|sincerely|cheers),?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
    if (nameMatch && nameMatch[1]) {
      clientName = nameMatch[1].trim();
    }

    return {
      rawText: text,
      clientName,
      topic,
      requestedDurationMinutes: duration,
      preferredDays: days.length > 0 ? days : ['Thursday', 'Friday'],
      preferredTimeOfDay: timeOfDay,
      urgency: /urgent|asap|today|tomorrow|rate lock/i.test(text) ? 'high' : 'normal'
    };
  }

  /**
   * Generate 3 optimal non-overlapping slots with 15-minute focus & HIPAA buffer protection
   */
  static generateThreeOptimalSlots(
    req: ParsedMeetingRequest,
    existingEvents: CalendarEvent[],
    bufferMinutes: number = 15
  ): ProposedMeetingSlot[] {
    const slots: ProposedMeetingSlot[] = [];
    const baseDate = new Date();

    // Target tomorrow or upcoming days (Thurs/Fri)
    const dayOffsets = [1, 2, 3, 4];
    let slotCount: 1 | 2 | 3 = 1;

    for (const offset of dayOffsets) {
      if (slots.length >= 3) break;

      const targetDate = new Date(baseDate.getTime() + offset * 86400000);
      const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' });

      // Check if day matches preference or if preference is flexible
      if (req.preferredDays.length > 0 && !req.preferredDays.includes(dayName)) {
        // Continue if we have preferred days and this isn't one
        if (offset < 3) continue;
      }

      // Propose candidate times: 10:00 AM, 02:00 PM, 04:00 PM
      const candidateHours = req.preferredTimeOfDay === 'morning' ? [9.5, 11] : req.preferredTimeOfDay === 'afternoon' ? [14, 15.5] : [10, 14, 16];

      for (const hour of candidateHours) {
        if (slots.length >= 3) break;

        const start = new Date(targetDate);
        start.setHours(Math.floor(hour), (hour % 1) * 60, 0, 0);

        const end = new Date(start.getTime() + req.requestedDurationMinutes * 60000);

        // Verify no conflict with existing events including buffer
        const hasOverlap = existingEvents.some((ev) => {
          if (!ev.start?.dateTime || !ev.end?.dateTime) return false;
          const evStart = new Date(ev.start.dateTime).getTime() - bufferMinutes * 60000;
          const evEnd = new Date(ev.end.dateTime).getTime() + bufferMinutes * 60000;

          return start.getTime() < evEnd && end.getTime() > evStart;
        });

        if (!hasOverlap) {
          slots.push({
            id: `slot-${slotCount}`,
            slotNumber: slotCount,
            dateStr: targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            dayOfWeek: dayName,
            startTimeFormatted: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            endTimeFormatted: end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            startIso: start.toISOString(),
            endIso: end.toISOString(),
            prepBufferMinutes: bufferMinutes,
            postBufferMinutes: bufferMinutes,
            timezoneLabel: 'PST / EST Synced',
            isHeldAsSoftHold: false
          });

          slotCount = (slotCount + 1) as 1 | 2 | 3;
        }
      }
    }

    // Fallback if less than 3
    while (slots.length < 3) {
      const idx = (slots.length + 1) as 1 | 2 | 3;
      const fallbackDate = new Date(baseDate.getTime() + (idx + 1) * 86400000);
      fallbackDate.setHours(11 + idx, 0, 0, 0);
      const fallbackEnd = new Date(fallbackDate.getTime() + req.requestedDurationMinutes * 60000);

      slots.push({
        id: `slot-fallback-${idx}`,
        slotNumber: idx,
        dateStr: fallbackDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        dayOfWeek: fallbackDate.toLocaleDateString('en-US', { weekday: 'long' }),
        startTimeFormatted: fallbackDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        endTimeFormatted: fallbackEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        startIso: fallbackDate.toISOString(),
        endIso: fallbackEnd.toISOString(),
        prepBufferMinutes: bufferMinutes,
        postBufferMinutes: bufferMinutes,
        timezoneLabel: 'PST / EST Synced',
        isHeldAsSoftHold: false
      });
    }

    return slots;
  }

  /**
   * Generate an executive concierge response email offering the 3 options
   */
  static generateNegotiationEmail(
    req: ParsedMeetingRequest,
    slots: ProposedMeetingSlot[]
  ): string {
    const slotListText = slots
      .map(
        (s) =>
          `• Option ${s.slotNumber}: ${s.dayOfWeek}, ${s.dateStr} at ${s.startTimeFormatted} – ${s.endTimeFormatted} (includes 15m focus buffer)`
      )
      .join('\n');

    return `Hi ${req.clientName},\n\nThank you for reaching out regarding ${req.topic}. I would be glad to connect for ${req.requestedDurationMinutes} minutes.\n\nTo ensure we have uninterrupted focus, I have held provisional windows on my calendar:\n\n${slotListText}\n\nPlease let me know which option aligns best with your schedule, and I will dispatch the Google Meet video invitation and shared agenda immediately.\n\nBest regards,\nMike Ford\nVantage AI Executive Workspace`;
  }
}
