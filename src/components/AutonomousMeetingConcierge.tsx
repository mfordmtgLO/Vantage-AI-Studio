/**
 * Vantage AI Workspace - Autonomous Meeting Negotiation & AI Calendar Concierge
 * 15-Minute Focus/HIPAA Buffer Protection, NLP Inbound Parser, and 3-Slot De-escalator
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

import React, { useState } from 'react';
import { 
  Calendar, Clock, ShieldCheck, Sparkles, CheckCircle2, 
  Send, Copy, Check, Plus, AlertCircle, Users, RefreshCw,
  Layers, Lock, Sliders, ChevronRight
} from 'lucide-react';
import { CalendarEvent } from '../types';
import { 
  CalendarNegotiationEngine, 
  ParsedMeetingRequest, 
  ProposedMeetingSlot 
} from '../utils/calendarNegotiationEngine';

interface AutonomousMeetingConciergeProps {
  existingEvents?: CalendarEvent[];
  onCreateCalendarHold?: (title: string, startIso: string, durationMinutes: number) => void;
  onSendEmailDraft?: (to: string, subject: string, body: string) => void;
}

export const AutonomousMeetingConcierge: React.FC<AutonomousMeetingConciergeProps> = ({
  existingEvents = [],
  onCreateCalendarHold,
  onSendEmailDraft
}) => {
  const [inboundEmailText, setInboundEmailText] = useState<string>(
    "Hi Mike, could we grab 45 minutes on Thursday afternoon or Friday morning to review the closing disclosures and Fannie Mae underwriting checklist for the Oak Ridge escrow? Best, Sarah Miller"
  );
  const [bufferMinutes, setBufferMinutes] = useState<number>(15);
  const [parsedRequest, setParsedRequest] = useState<ParsedMeetingRequest>(() =>
    CalendarNegotiationEngine.parseInboundRequest(inboundEmailText)
  );
  const [proposedSlots, setProposedSlots] = useState<ProposedMeetingSlot[]>(() =>
    CalendarNegotiationEngine.generateThreeOptimalSlots(
      CalendarNegotiationEngine.parseInboundRequest(inboundEmailText),
      existingEvents,
      15
    )
  );
  const [generatedEmail, setGeneratedEmail] = useState<string>(() =>
    CalendarNegotiationEngine.generateNegotiationEmail(
      CalendarNegotiationEngine.parseInboundRequest(inboundEmailText),
      proposedSlots
    )
  );

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // Parse and recompute
  const handleParseAndGenerate = () => {
    const parsed = CalendarNegotiationEngine.parseInboundRequest(inboundEmailText);
    const slots = CalendarNegotiationEngine.generateThreeOptimalSlots(parsed, existingEvents, bufferMinutes);
    const email = CalendarNegotiationEngine.generateNegotiationEmail(parsed, slots);

    setParsedRequest(parsed);
    setProposedSlots(slots);
    setGeneratedEmail(email);

    setNotificationMsg('Parsed meeting request & calculated 3 non-overlapping slots with 15m focus buffers.');
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Place Soft-Holds
  const handlePlaceSoftHolds = () => {
    proposedSlots.forEach((s) => {
      if (onCreateCalendarHold) {
        onCreateCalendarHold(`[Hold] ${parsedRequest.topic} (Opt ${s.slotNumber})`, s.startIso, parsedRequest.requestedDurationMinutes);
      }
    });

    setProposedSlots((prev) => prev.map((s) => ({ ...s, isHeldAsSoftHold: true })));
    setNotificationMsg('3 Provisional Soft-Holds placed on Google Calendar with protected focus buffers.');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(generatedEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  const handleDispatchEmail = () => {
    if (onSendEmailDraft) {
      onSendEmailDraft(
        parsedRequest.clientEmail || 'sarah.miller@partner.com',
        `Re: Scheduling Consultation - ${parsedRequest.topic}`,
        generatedEmail
      );
    }
    setNotificationMsg('Concierge negotiation email drafted and staged in Gmail queue.');
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Autonomous Meeting Negotiation & Calendar Concierge
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-blue-600 text-white rounded-full">
                Zero Overlap
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Enforces 15-minute HIPAA/Focus buffers, parses inbound scheduling emails, and places provisional calendar holds.
            </p>
          </div>
        </div>

        {/* Buffer Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-600 dark:text-slate-400">Buffer Guard:</span>
          <select
            value={bufferMinutes}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBufferMinutes(val);
              const slots = CalendarNegotiationEngine.generateThreeOptimalSlots(parsedRequest, existingEvents, val);
              setProposedSlots(slots);
              setGeneratedEmail(CalendarNegotiationEngine.generateNegotiationEmail(parsedRequest, slots));
            }}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-800 rounded p-1 text-slate-900 dark:text-slate-100 outline-none"
          >
            <option value={10}>10 Min Prep Buffer</option>
            <option value={15}>15 Min Focus / HIPAA Buffer</option>
            <option value={30}>30 Min Deep Prep Buffer</option>
          </select>
        </div>
      </div>

      {/* Notification */}
      {notificationMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* 2-Column Workflow Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Raw Inbound Request Parser & Extracted Requirements */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Inbound Client / Partner Scheduling Inquiry
            </h4>

            <div className="space-y-1.5">
              <textarea
                rows={4}
                value={inboundEmailText}
                onChange={(e) => setInboundEmailText(e.target.value)}
                placeholder="Paste incoming client email requesting a meeting..."
                className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 resize-none font-sans"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleParseAndGenerate}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Parse & Calculate 3 Optimal Windows</span>
                </button>
              </div>
            </div>

            {/* Extracted Meeting Requirements Summary */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Extracted Consultation Parameters
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Identified Sender:</span>
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">{parsedRequest.clientName}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Requested Duration:</span>
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">{parsedRequest.requestedDurationMinutes} Minutes</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Preferred Day Range:</span>
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">{parsedRequest.preferredDays.join(', ')}</strong>
                </div>
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Consultation Topic:</span>
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold truncate block">{parsedRequest.topic}</strong>
                </div>
              </div>
            </div>

            {/* 3 Calculated Proposed Slots */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  3 Optimal Non-Overlapping Meeting Slots
                </h5>
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                  {bufferMinutes}m Focus Buffer Applied
                </span>
              </div>

              <div className="space-y-2">
                {proposedSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-2xs"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold text-xs flex items-center justify-center">
                          {slot.slotNumber}
                        </span>
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {slot.dayOfWeek}, {slot.dateStr}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-400 pl-7">
                        {slot.startTimeFormatted} – {slot.endTimeFormatted} ({slot.timezoneLabel})
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        slot.isHeldAsSoftHold
                          ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {slot.isHeldAsSoftHold ? 'Provisional Hold' : 'Available'}
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={handlePlaceSoftHolds}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5 text-blue-600" />
                <span>Place Provisional Soft-Holds on Google Calendar</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Generated Executive Negotiation Response Draft */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Autonomous Concierge Negotiation Email Draft
              </h4>
              <span className="text-[10px] font-semibold text-slate-400">
                To: {parsedRequest.clientEmail || 'sarah.miller@partner.com'}
              </span>
            </div>

            <textarea
              rows={12}
              value={generatedEmail}
              onChange={(e) => setGeneratedEmail(e.target.value)}
              className="w-full p-3.5 text-xs bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-slate-100 resize-none font-sans leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                onClick={handleCopyEmail}
                className="px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                {copiedEmail ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedEmail ? 'Copied' : 'Copy Email Response'}</span>
              </button>

              <button
                onClick={handleDispatchEmail}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send via Gmail</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
