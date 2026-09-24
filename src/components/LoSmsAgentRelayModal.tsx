/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • LO SMS NOTE RELAY & AGENT REPLY WEBHOOK MODAL
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Allows Loan Officer (Mike Ford) to dispatch an SMS note to paired Realtor
 * (Kanndice McLean) re: lead buyer (e.g. John Jones) & property (1234 Fake St).
 * Simulates Agent SMS text reply back, auto-saving the note into property
 * listing card NOTES and firing push notifications to lead contact + LO:
 * "[Property Address] has a NEW note from Kanndice"
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import {
  X,
  Send,
  MessageSquare,
  Smartphone,
  CheckCircle2,
  Bell,
  Sparkles,
  ShieldCheck,
  User,
  Building,
  ArrowRight,
  ExternalLink,
  PhoneCall,
  Clock,
  Settings,
  Key,
  Globe
} from 'lucide-react';
import { SyncedPropertyListing } from '../types/firstTimeHomebuyerPlugin';
import TwilioSmsRelayService, { TwilioConfig } from '../services/twilioSmsRelayService';

interface LoSmsAgentRelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  property: SyncedPropertyListing | null;
  leadName?: string;
  loanOfficerName?: string;
  agentName?: string;
  agentPhone?: string;
  onSendSmsRelay: (
    propertyId: string,
    leadName: string,
    propertyAddress: string,
    outboundText: string,
    agentReplyText: string
  ) => void;
}

export const LoSmsAgentRelayModal: React.FC<LoSmsAgentRelayModalProps> = ({
  isOpen,
  onClose,
  property,
  leadName = 'John Jones',
  loanOfficerName = 'Mike Ford',
  agentName = 'Kanndice McLean',
  agentPhone = '+1 (503) 555-0188',
  onSendSmsRelay
}) => {
  const [activeTab, setActiveTab] = useState<'draft_outbound' | 'agent_reply_simulator' | 'twilio_settings' | 'email_webhook_wizard'>('draft_outbound');
  const [currentLeadName, setCurrentLeadName] = useState<string>(leadName);
  const [currentAgentPhone, setCurrentAgentPhone] = useState<string>(agentPhone);
  const [destinationEmail, setDestinationEmail] = useState<string>('kanndice@realty.com');
  const [selectedCarrier, setSelectedCarrier] = useState<'verizon' | 'att' | 'tmobile'>('verizon');
  const [outboundSmsBody, setOutboundSmsBody] = useState<string>('');
  const [agentReplyText, setAgentReplyText] = useState<string>('');
  const [isSuccessDispatched, setIsSuccessDispatched] = useState<boolean>(false);
  const [twilioConfig, setTwilioConfig] = useState<TwilioConfig>(() => TwilioSmsRelayService.getConfig());
  const [testEmailStatus, setTestEmailStatus] = useState<null | 'testing' | 'success' | 'error'>(null);
  const [testEmailMessage, setTestEmailMessage] = useState<string>('');

  const address = property?.formattedAddress || property?.addressLine1 || '1234 Fake St';

  const cleanDigits = currentAgentPhone.replace(/[^0-9]/g, '');
  const carrierGateways = {
    verizon: `${cleanDigits}@vtext.com`,
    att: `${cleanDigits}@txt.att.net`,
    tmobile: `${cleanDigits}@tmomail.net`
  };

  const handleSendTestEmailWebhook = async () => {
    setTestEmailStatus('testing');
    setTestEmailMessage('Transmitting test payload to /api/email/inbound-notes...');
    try {
      const resp = await fetch('/api/email/inbound-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromEmail: destinationEmail,
          subject: `[Test Email Webhook] Realtor Note for ${address}`,
          textBody: `Listing agent confirmed seller contribution of $${Math.round((property?.price || 400000) * 0.03).toLocaleString()} on ${address}.`,
          propertyAddress: address
        })
      });
      const data = await resp.json();
      if (data.success) {
        setTestEmailStatus('success');
        setTestEmailMessage(`✓ Email Webhook Test Success! Gemini AI parsed note & saved directly to Firestore database for ${address}.`);
      } else {
        setTestEmailStatus('error');
        setTestEmailMessage(`❌ Error: ${data.error || 'Failed to process email webhook'}`);
      }
    } catch (err: any) {
      setTestEmailStatus('error');
      setTestEmailMessage(`❌ Connection Error: ${err.message}`);
    }
  };

  // Pre-fill outbound text and agent reply when property or leadName changes
  useEffect(() => {
    if (property) {
      const propAddr = property.addressLine1 || property.formattedAddress || '1234 Fake St';
      setCurrentLeadName(leadName || 'John Jones');
      setOutboundSmsBody(
        `Hey ${leadName || 'John Jones'} would like you to review ${propAddr} and ask listing agent if open to seller contributions towards closing costs.`
      );
      setAgentReplyText(
        `Listing agent confirmed seller is willing to contribute up to 3% ($${Math.round(property.price * 0.03).toLocaleString()}) towards buyer closing costs on ${propAddr}!`
      );
      setIsSuccessDispatched(false);
      setActiveTab('draft_outbound');
    }
  }, [property, leadName]);

  if (!isOpen || !property) return null;

  const handleLaunchNativeSms = () => {
    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(outboundSmsBody);
      }
    } catch (e) {}

    const cleanPhone = currentAgentPhone.replace(/[^0-9+]/g, '');
    const encodedBody = encodeURIComponent(outboundSmsBody);
    
    // Standard SMS URI format supporting iOS & Android
    const smsUrl = `sms:${cleanPhone}?body=${encodedBody}`;
    window.location.href = smsUrl;
  };

  const handleDispatchSmsRelay = () => {
    setActiveTab('agent_reply_simulator');
  };

  const handleSubmitAgentReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agentReplyText.trim()) return;

    onSendSmsRelay(
      property.id,
      currentLeadName,
      address,
      outboundSmsBody,
      agentReplyText.trim()
    );

    setIsSuccessDispatched(true);
    setTimeout(() => {
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-stone-900 border border-stone-800 text-stone-100 shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 border-b border-stone-800 bg-stone-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white">LO ↔ Realtor 2-Way Text Note Relay</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                  Co-Branded SMS Engine
                </span>
              </div>
              <p className="text-[11px] text-stone-400">
                Send text note to Realtor <strong className="text-stone-200">{agentName}</strong> re: <strong className="text-amber-300">{address}</strong>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-stone-800 text-stone-400 hover:text-white hover:bg-stone-700 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Co-Branded Pair Banner */}
        <div className="px-4 py-2.5 bg-stone-950/90 border-b border-stone-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
                alt={loanOfficerName}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-amber-500 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80"
                alt={agentName}
                className="inline-block h-8 w-8 rounded-full ring-2 ring-emerald-500 object-cover"
              />
            </div>
            <div>
              <span className="font-bold text-stone-200 block text-[11px]">{loanOfficerName} (LO) ↔ {agentName} (Realtor®)</span>
              <span className="text-[9px] text-stone-400">Cascade Premier Realty &amp; Vantage AI Mortgage</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-stone-900 px-2.5 py-1 rounded-lg border border-stone-800 text-[10px] text-stone-300 font-mono">
            <PhoneCall className="w-3 h-3 text-emerald-400 shrink-0" />
            <input
              type="text"
              value={currentAgentPhone}
              onChange={(e) => setCurrentAgentPhone(e.target.value)}
              className="bg-transparent text-emerald-300 font-mono font-bold focus:outline-none w-32"
              placeholder="Kanndice Mobile Cell #"
              title="Kanndice's cellular mobile number for direct carrier SMS delivery"
            />
          </div>
        </div>

        {/* Success Overlay Banner */}
        {isSuccessDispatched ? (
          <div className="p-8 space-y-4 text-center my-auto animate-fadeIn">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 border-2 border-emerald-500 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-8 h-8 animate-bounce" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-black text-white">Agent Custom Note Saved &amp; Push Notifications Fired!</h4>
              <p className="text-xs text-emerald-300 font-mono">
                🔔 "{address} has a NEW note from Kanndice"
              </p>
              <p className="text-xs text-stone-400 max-w-md mx-auto pt-2">
                Note auto-appended to property card NOTES for lead contact <strong>{currentLeadName}</strong> and Loan Officer <strong>{loanOfficerName}</strong>.
              </p>
            </div>
          </div>
        ) : (
          /* Main Tabbed Content */
          <div className="p-4 overflow-y-auto space-y-4 flex-1">
            {/* Step Navigation Pill */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-stone-950 p-1.5 rounded-xl border border-stone-800 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('draft_outbound')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'draft_outbound'
                    ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>1. Draft SMS</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('agent_reply_simulator')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'agent_reply_simulator'
                    ? 'bg-emerald-500 text-stone-950 shadow-md font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <span>2. Reply Simulator</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('twilio_settings')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'twilio_settings'
                    ? 'bg-blue-600 text-white shadow-md font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Settings className="w-3 h-3 text-blue-300" />
                <span>3. Twilio Setup</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('email_webhook_wizard')}
                className={`py-2 rounded-lg transition flex items-center justify-center gap-1 cursor-pointer ${
                  activeTab === 'email_webhook_wizard'
                    ? 'bg-purple-600 text-white shadow-md font-black'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Globe className="w-3 h-3 text-purple-300" />
                <span>4. Email Webhook</span>
              </button>
            </div>

            {activeTab === 'draft_outbound' ? (
              /* TAB 1: DRAFT OUTBOUND SMS */
              <div className="space-y-4 animate-fadeIn">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Lead Buyer Contact
                    </label>
                    <div className="flex items-center gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs font-bold text-white">
                      <User className="w-4 h-4 text-amber-400 shrink-0" />
                      <input
                        type="text"
                        value={currentLeadName}
                        onChange={(e) => setCurrentLeadName(e.target.value)}
                        className="bg-transparent w-full focus:outline-hidden text-white font-bold"
                        placeholder="Lead Name (e.g. John Jones)"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Subject Property Address
                    </label>
                    <div className="flex items-center gap-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800 text-xs font-mono font-bold text-amber-300">
                      <Building className="w-4 h-4 text-amber-400 shrink-0" />
                      <span className="truncate">{address} (${property.price.toLocaleString()})</span>
                    </div>
                  </div>
                </div>

                {/* Text Message Content Editor */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-stone-300 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>SMS Text Message to Realtor {agentName}:</span>
                    </label>
                    <span className="text-[10px] text-stone-500 font-mono">
                      {outboundSmsBody.length} chars
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={outboundSmsBody}
                    onChange={(e) => setOutboundSmsBody(e.target.value)}
                    className="w-full p-3 rounded-xl bg-stone-950 border border-stone-800 text-xs text-stone-100 focus:border-amber-500 focus:outline-hidden leading-relaxed font-sans"
                    placeholder="Type SMS text message..."
                  />
                </div>

                {/* Quick Prompt Presets */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Quick LO Text Prompt Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      `Hey ${currentLeadName} would like you to review ${address} and ask listing agent if open to seller contributions towards closing costs.`,
                      `Hi ${agentName}, ${currentLeadName} is interested in ${address}. Can you check if seller will consider a 2/1 rate buydown credit?`,
                      `Hey ${agentName}! ${currentLeadName} pre-qualified for ${address}. Please confirm listing agent showing availability.`
                    ].map((presetText, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setOutboundSmsBody(presetText)}
                        className="px-2.5 py-1 rounded-lg bg-stone-950 hover:bg-stone-800 border border-stone-800 hover:border-amber-500/50 text-[10px] text-stone-300 hover:text-white transition text-left line-clamp-1 cursor-pointer"
                      >
                        {presetText.slice(0, 60)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Carrier SMS Delivery Notice Box */}
                <div className="p-3.5 rounded-xl bg-stone-950 border border-emerald-500/40 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-bold text-emerald-300 text-[11px]">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>How Kanndice Receives This Text Message On Her Cell Phone:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[9.5px] font-mono border border-emerald-800">
                      Bypasses Twilio A2P 10DLC Suspension
                    </span>
                  </div>

                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    1. Click <strong className="text-amber-300">"📱 Send Direct Carrier SMS to Kanndice's Cell"</strong> below to launch your phone or desktop Messages app (iMessage / Android SMS) pre-addressed to <strong>{currentAgentPhone}</strong>.
                  </p>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    2. Kanndice receives the SMS text message directly on her cellular mobile phone over standard carrier networks!
                  </p>
                  <p className="text-[11px] text-stone-300 leading-relaxed">
                    3. Click <strong className="text-emerald-300">"Proceed to Agent Text Reply Simulator →"</strong> to test her text reply, which auto-appends her response to the property card <strong>NOTES</strong> and triggers live push notifications!
                  </p>

                  {/* Email-to-SMS Carrier Gateway Helper */}
                  <div className="pt-2 border-t border-stone-800 text-[10.5px] text-stone-400 space-y-1 font-mono">
                    <span className="text-amber-300 font-bold block">💡 Carrier Email-to-SMS Gateway Addresses (100% Free - No Twilio Required):</span>
                    <div className="flex flex-wrap gap-1.5 text-[9.5px]">
                      <span className="px-1.5 py-0.5 bg-stone-900 rounded border border-stone-800">Verizon: {currentAgentPhone.replace(/[^0-9]/g, '')}@vtext.com</span>
                      <span className="px-1.5 py-0.5 bg-stone-900 rounded border border-stone-800">AT&amp;T: {currentAgentPhone.replace(/[^0-9]/g, '')}@txt.att.net</span>
                      <span className="px-1.5 py-0.5 bg-stone-900 rounded border border-stone-800">T-Mobile: {currentAgentPhone.replace(/[^0-9]/g, '')}@tmomail.net</span>
                    </div>
                  </div>
                </div>

                {/* Action Footer Buttons */}
                <div className="pt-3 border-t border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleLaunchNativeSms}
                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 text-emerald-200 hover:text-white border border-emerald-600 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>📱 Send Direct Carrier SMS to Kanndice's Cell ({currentAgentPhone})</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDispatchSmsRelay}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition cursor-pointer"
                  >
                    <span>Proceed to Agent Text Reply Simulator →</span>
                  </button>
                </div>
              </div>
            ) : activeTab === 'agent_reply_simulator' ? (
              /* TAB 2: AGENT REPLY SIMULATOR */
              <form onSubmit={handleSubmitAgentReply} className="space-y-4 animate-fadeIn">
                {/* Outbound Text Recap Box */}
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span className="flex items-center gap-1">
                      <Send className="w-3 h-3 text-amber-400" />
                      <span>Outbound Text Sent to Realtor {agentName}:</span>
                    </span>
                    <span className="text-[10px] font-mono text-stone-400">Just Now</span>
                  </div>
                  <p className="text-stone-200 italic font-mono text-[11px] leading-relaxed">
                    "{outboundSmsBody}"
                  </p>
                </div>

                {/* Simulated Incoming Text Response Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <label className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-emerald-400" />
                      <span>Realtor {agentName}'s Text Message Reply:</span>
                    </label>
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[9px] font-mono font-bold">
                      Simulated SMS Reply
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={agentReplyText}
                    onChange={(e) => setAgentReplyText(e.target.value)}
                    className="w-full p-3 rounded-xl bg-stone-950 border border-emerald-500/50 text-xs text-emerald-100 focus:border-emerald-400 focus:outline-hidden leading-relaxed font-sans font-medium"
                    placeholder="Type agent reply..."
                    required
                  />
                </div>

                {/* Preset Agent Responses */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Quick Realtor Reply Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      `Listing agent confirmed seller is willing to contribute up to 3% ($${Math.round(property.price * 0.03).toLocaleString()}) towards buyer closing costs on ${address}!`,
                      `Spoke with listing agent on ${address}. Seller is open to $10,000 credit in exchange for full-price offer.`,
                      `Listing agent confirmed ${address} has no other offers yet; seller will consider $7,500 seller contribution.`
                    ].map((presetReply, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAgentReplyText(presetReply)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-800/60 hover:border-emerald-400 text-[10px] text-emerald-200 transition text-left line-clamp-1 cursor-pointer"
                      >
                        {presetReply.slice(0, 65)}...
                      </button>
                    ))}
                  </div>
                </div>

                {/* Push Notification Callout Notice */}
                <div className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-[11px]">
                    <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse shrink-0" />
                    <span>Automated Push Notification Trigger:</span>
                  </div>
                  <div className="p-2 rounded-lg bg-stone-900 border border-stone-800 font-mono text-[10px] text-emerald-300">
                    "{address} has a NEW note from Kanndice"
                  </div>
                  <p className="text-[10px] text-stone-400 leading-snug">
                    Submitting this text reply automatically updates the property card <strong>NOTES</strong> and dispatches push notification alerts to lead contact <strong>{currentLeadName}</strong> and Loan Officer <strong>{loanOfficerName}</strong>.
                  </p>
                </div>

                {/* Action Submit Button */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('draft_outbound')}
                    className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition cursor-pointer"
                  >
                    ← Edit Outbound Text
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-stone-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Reply &amp; Fire Push Notifications</span>
                  </button>
                </div>
              </form>
            ) : activeTab === 'twilio_settings' ? (
              /* TAB 3: TWILIO SINGLE-ACCOUNT CONFIGURATION */
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-blue-950/40 border border-blue-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-blue-300 font-black text-sm">
                    <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                    <span>Single Twilio API Account Architecture (Zero Agent Overhead)</span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    <strong>NO, Realtor Kanndice McLean NEVER needs her own Twilio account!</strong> As the Loan Officer and Platform Owner, <strong>YOUR single Twilio API Account</strong> handles 100% of outbound text dispatches and inbound text reply routing for all paired real estate agents and lead borrowers.
                  </p>
                </div>

                {/* Twilio A2P 10DLC Suspension Status Banner & Workarounds */}
                <div className="p-3.5 bg-amber-950/40 border border-amber-500/50 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-amber-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Twilio Account A2P 10DLC "Suspended" or Pending Status Guidance:</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono text-[10px]">
                      A2P 10DLC Bypass Active
                    </span>
                  </div>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    If your Twilio console shows <strong>A2P 10DLC Campaign "Suspended"</strong> or pending brand registration approval (required by US cell carriers for 10-digit numbers), <strong>you do NOT need to wait!</strong>
                  </p>
                  <div className="pt-1 text-[11px] text-stone-300 space-y-1.5 font-mono">
                    <div>• <strong>Method 3 ⭐ AUTOMATED WEBHOOK (Toll-Free Number +1 833 / +1 888)</strong>: In Twilio console, provision a <strong>Toll-Free Number</strong> (e.g. <span className="text-amber-300 font-bold">+1 833-826-8243</span>). If Twilio asks for a <strong>Compliance Profile</strong>: Go to <strong>Twilio Console → Trust Hub → Customer Profiles → Create Primary Customer Profile</strong>. Select <i>Sole Proprietorship / Small Business / Individual</i>, enter business name &amp; address (takes ~2 minutes for automated instant approval)!</div>
                    <div>• <strong>Method 1 (Instant Native SMS - ZERO Twilio Required)</strong>: Click <strong>"📱 Send Direct Carrier SMS to Kanndice's Cell"</strong> in Tab 1. Launches your phone/Mac's native Messages app (iMessage / Android SMS) directly. 100% free, zero Twilio, zero compliance wait!</div>
                    <div>• <strong>Method 2 (Email-to-SMS Gateway - ZERO Twilio Required)</strong>: Send email to Kanndice's cell gateway (<span className="text-amber-300 font-bold">{currentAgentPhone.replace(/[^0-9]/g, '')}@vtext.com</span>, <span className="text-amber-300 font-bold">@txt.att.net</span>, <span className="text-amber-300 font-bold">@tmomail.net</span>). Delivered directly to her cell phone as an SMS!</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                    <span className="font-bold text-amber-300 block uppercase text-[10px] tracking-wider">
                      1. Outbound SMS Flow
                    </span>
                    <p className="text-stone-300 leading-relaxed">
                      Your single Twilio virtual number dispatches the SMS text directly to Kanndice's mobile phone (<strong className="text-white">{currentAgentPhone}</strong>). Kanndice receives a standard text message on her personal cell phone.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-1">
                    <span className="font-bold text-emerald-300 block uppercase text-[10px] tracking-wider">
                      2. Inbound SMS Reply Webhook
                    </span>
                    <p className="text-stone-300 leading-relaxed">
                      When Kanndice replies on her phone, Twilio routes her text to your server endpoint (<strong className="text-emerald-300 font-mono text-[10px]">/api/twilio/inbound-sms</strong>), which matches her reply to <strong className="text-white">{address}</strong>, appends it to property card NOTES, and fires dual push notifications!
                    </p>
                  </div>
                </div>

                {/* Twilio Credentials Form */}
                <div className="p-4 bg-stone-950 rounded-2xl border border-stone-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-400" />
                    <span>Your Twilio API Credentials Configuration:</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Twilio Account SID
                      </label>
                      <input
                        type="text"
                        value={twilioConfig.accountSid}
                        onChange={(e) => setTwilioConfig(prev => ({ ...prev, accountSid: e.target.value }))}
                        placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxx"
                        className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Twilio Auth Token
                      </label>
                      <input
                        type="password"
                        value={twilioConfig.authToken}
                        onChange={(e) => setTwilioConfig(prev => ({ ...prev, authToken: e.target.value }))}
                        placeholder="••••••••••••••••••••••••"
                        className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-100 font-mono focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Your Twilio Toll-Free Phone Number
                      </label>
                      <input
                        type="text"
                        value={twilioConfig.twilioPhoneNumber}
                        onChange={(e) => setTwilioConfig(prev => ({ ...prev, twilioPhoneNumber: e.target.value }))}
                        placeholder="+18338268243"
                        className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-amber-300 font-mono font-bold focus:border-blue-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                        Twilio Inbound SMS Webhook URL
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/twilio/inbound-sms`}
                        className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-emerald-300 font-mono font-bold select-all focus:outline-hidden"
                        title="Paste into Twilio Console -> Messaging -> A Message Comes In Webhook"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Inbound Email Notes Webhook URL (Carrier &amp; Forwarded Email Relay)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/email/inbound-notes`}
                      className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-blue-300 font-mono font-bold select-all focus:outline-hidden"
                      title="Paste into SendGrid / Postmark / Mailgun Inbound Parse Webhook"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-[10px] text-stone-400 font-mono">
                      {twilioConfig.isConfigured ? '✓ Twilio Gateway Connected' : 'ℹ️ Interactive preview mode active (works out-of-the-box)'}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        TwilioSmsRelayService.saveConfig(twilioConfig);
                        alert('Twilio credentials saved successfully to GeoMap plugin configuration!');
                      }}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition cursor-pointer shadow-md"
                    >
                      Save Twilio Settings
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 4: EMAIL WEBHOOK & CARRIER GATEWAY INTEGRATION WIZARD */
              <div className="space-y-4 animate-fadeIn">
                <div className="p-4 bg-purple-950/40 border border-purple-500/40 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-purple-300 font-black text-sm">
                      <Globe className="w-5 h-5 text-purple-400 shrink-0" />
                      <span>Email Webhook &amp; Carrier Gateway Integration Wizard</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono">
                      Firestore Linked
                    </span>
                  </div>
                  <p className="text-xs text-stone-300 leading-relaxed">
                    Configure your destination Realtor/LO email address and cell carrier email-to-SMS gateway. Forwarded email threads, seller disclosures, and MLS flyers are automatically summarized by <strong>Gemini 3.8 Flash AI</strong> and saved directly to property card notes in <strong>Firestore</strong>!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Destination Realtor / LO Email Address
                    </label>
                    <input
                      type="email"
                      value={destinationEmail}
                      onChange={(e) => setDestinationEmail(e.target.value)}
                      placeholder="kanndice@realty.com"
                      className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-purple-300 font-bold focus:border-purple-500 focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                      Select Cell Carrier Gateway
                    </label>
                    <select
                      value={selectedCarrier}
                      onChange={(e) => setSelectedCarrier(e.target.value as any)}
                      className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-stone-200 font-bold focus:border-purple-500 focus:outline-hidden cursor-pointer"
                    >
                      <option value="verizon">Verizon (@vtext.com)</option>
                      <option value="att">AT&amp;T (@txt.att.net)</option>
                      <option value="tmobile">T-Mobile (@tmomail.net)</option>
                    </select>
                  </div>
                </div>

                {/* Computed Carrier Address Box */}
                <div className="p-3.5 bg-stone-950 border border-purple-500/30 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-purple-300">
                    <span>📱 Kanndice's Carrier Text-to-Email Gateway Address:</span>
                    <span className="text-[10px] text-stone-400 font-mono">100% Free - Zero Twilio</span>
                  </div>
                  <div className="p-2.5 bg-stone-900 border border-stone-800 rounded-lg font-mono text-xs text-emerald-300 font-bold flex items-center justify-between">
                    <span>{carrierGateways[selectedCarrier]}</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(carrierGateways[selectedCarrier]);
                        alert(`Copied ${carrierGateways[selectedCarrier]} to clipboard!`);
                      }}
                      className="text-[10px] px-2 py-1 bg-purple-900/60 hover:bg-purple-800 text-purple-200 rounded transition cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-[10.5px] text-stone-400 leading-relaxed">
                    Any email sent or forwarded to <strong className="text-stone-200">{carrierGateways[selectedCarrier]}</strong> arrives directly on Kanndice's cell phone lock screen as an SMS text message!
                  </p>
                </div>

                {/* Copyable Webhook URL */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Inbound Email Parse Webhook Endpoint URL
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/api/email/inbound-notes`}
                    className="w-full p-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs text-purple-300 font-mono font-bold select-all focus:outline-hidden"
                  />
                </div>

                {/* Live Webhook Tester Button & Status Box */}
                <div className="pt-2 border-t border-stone-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-stone-300 font-bold">Test Email Webhook Integration Live:</span>
                    <button
                      type="button"
                      onClick={handleSendTestEmailWebhook}
                      disabled={testEmailStatus === 'testing'}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs transition cursor-pointer shadow-md flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                      <span>{testEmailStatus === 'testing' ? 'Transmitting...' : '🧪 Send Test Email Webhook Payload'}</span>
                    </button>
                  </div>

                  {testEmailMessage && (
                    <div className={`p-3 rounded-xl border text-xs font-mono leading-relaxed animate-fadeIn ${
                      testEmailStatus === 'success'
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : testEmailStatus === 'error'
                        ? 'bg-rose-950/60 border-rose-500/50 text-rose-300'
                        : 'bg-stone-900 border-stone-800 text-stone-300'
                    }`}>
                      {testEmailMessage}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
