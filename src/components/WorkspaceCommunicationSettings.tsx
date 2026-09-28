/**
 * ============================================================================
 * VANTAGE AI STUDIO • WORKSPACE COMMUNICATION SETTINGS SUB-COMPONENT
 * Copyright (c) 2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Provides a dedicated configuration interface within Workspace Settings for:
 * 1. Email-to-SMS Gateway Address configuration (e.g. [phone]@vtext.com)
 * 2. Enabling/disabling the two-way relay for scraped high-intent conversations
 * 3. Setting intent score thresholds and county market filters
 * 4. Testing real-time dispatch and verifying Firestore synchronization
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Mail, 
  Send, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  Sliders, 
  Copy, 
  Check, 
  RotateCcw,
  Sparkles,
  MessageSquare,
  Radio,
  Filter,
  Link2,
  Activity,
  Globe,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { 
  CommunicationSettings, 
  getCommunicationSettings, 
  saveCommunicationSettings, 
  CARRIER_GATEWAY_DOMAINS 
} from '../utils/communicationSettingsStorage';

export interface TestSourceThread {
  id: string;
  sourceType: 'forum' | 'chat_board' | 'community_board' | 'blog';
  sourceName: string;
  platform: string;
  badgeColor: string;
  author: string;
  title: string;
  snippet: string;
  matchedProgram: string;
  location: string;
  intentScore: number;
}

export const TEST_DISCOVERY_SOURCES: TestSourceThread[] = [
  {
    id: 'source_reddit',
    sourceType: 'forum',
    sourceName: 'Reddit Forum (r/Bend)',
    platform: 'Reddit (r/Bend)',
    badgeColor: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    author: 'u/BendOutdoorBuyer',
    title: 'Deschutes County DPA & first-time buyer grants vs cash buyers',
    snippet: 'Struggle to compete with cash buyers in Bend. Looking to pair local employer housing assistance with OHCS Flex Lending. Any LOs specialized in this?',
    matchedProgram: 'OHCS Flex Lending & Deschutes DPA',
    location: 'Bend, OR (Deschutes County)',
    intentScore: 96
  },
  {
    id: 'source_discord',
    sourceType: 'chat_board',
    sourceName: 'Housing Chat Board (Oregon Discord)',
    platform: 'Oregon Housing Discord #first-time-buyers',
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    author: 'RenterLane99',
    title: 'Lane County down payment assistance grants for Eugene starter home',
    snippet: 'Does anyone have experience using local Lane County down payment grants with 3% down conventional loans in Eugene?',
    matchedProgram: 'Lane County DPA + Conventional 97%',
    location: 'Eugene, OR (Lane County)',
    intentScore: 94
  },
  {
    id: 'source_community',
    sourceType: 'community_board',
    sourceName: 'Community Board (PDX Homebuyers Club)',
    platform: 'PDX First-Time Buyer Guild',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    author: 'SarahM_PDX',
    title: 'FHA vs Conventional zero-down loan comparison in Multnomah County',
    snippet: 'Tired of paying $2,400 rent in Portland. Looking for an Oregon LO to review if OHCS zero-down loan makes sense for our $75k income.',
    matchedProgram: 'OHCS Flex 100% Financing',
    location: 'Portland, OR (Multnomah County)',
    intentScore: 95
  },
  {
    id: 'source_blog',
    sourceType: 'blog',
    sourceName: 'Real Estate Blog (Oregon Mortgage Pros)',
    platform: 'PNW Housing Watch / Blog Comments',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    author: 'Chris_SalemBuyer',
    title: 'Salem starter home with Oregon Bond Residential Loan Program',
    snippet: 'Looking for advice on qualifying for the Oregon Bond Program below Marion County purchase price limits.',
    matchedProgram: 'Oregon Bond Loan Program',
    location: 'Salem, OR (Marion County)',
    intentScore: 92
  }
];

interface WorkspaceCommunicationSettingsProps {
  onSaved?: (settings: CommunicationSettings) => void;
  className?: string;
}

export const WorkspaceCommunicationSettings: React.FC<WorkspaceCommunicationSettingsProps> = ({
  onSaved,
  className = ''
}) => {
  const [settings, setSettings] = useState<CommunicationSettings>(getCommunicationSettings);
  const [phoneInput, setPhoneInput] = useState<string>(settings.phoneNumber);
  const [carrierInput, setCarrierInput] = useState<CommunicationSettings['carrier']>(settings.carrier);
  const [gatewayInput, setGatewayInput] = useState<string>(settings.emailToSmsGateway);
  const [relayEnabled, setRelayEnabled] = useState<boolean>(settings.relayEnabled);
  const [threshold, setThreshold] = useState<number>(settings.minIntentThreshold);
  const [autoReactivate, setAutoReactivate] = useState<boolean>(settings.autoReactivationAlerts);
  
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [copiedGateway, setCopiedGateway] = useState<boolean>(false);
  
  // Multi-source testing state
  const [selectedSourceId, setSelectedSourceId] = useState<string>('source_reddit');
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
    latencyMs?: number;
    dispatchedTo?: string;
    targetPhone?: string;
    sourceTested?: TestSourceThread;
    smsAlertText?: string;
    appleMessagesUrl?: string;
    freeGmailWebUrl?: string;
    threadId?: string;
  } | null>(null);

  const activeTestSource = TEST_DISCOVERY_SOURCES.find(s => s.id === selectedSourceId) || TEST_DISCOVERY_SOURCES[0];

  // Sync state if external changes happen
  useEffect(() => {
    const handleUpdate = (e: any) => {
      if (e.detail) {
        setSettings(e.detail);
        setPhoneInput(e.detail.phoneNumber);
        setGatewayInput(e.detail.emailToSmsGateway);
        setCarrierInput(e.detail.carrier);
        setRelayEnabled(e.detail.relayEnabled);
        setThreshold(e.detail.minIntentThreshold);
      }
    };
    window.addEventListener('vantage-communication-settings-updated', handleUpdate);
    return () => window.removeEventListener('vantage-communication-settings-updated', handleUpdate);
  }, []);

  // Auto-generate gateway address when phone or carrier changes (if using standard carrier)
  const handlePhoneChange = (newPhone: string) => {
    setPhoneInput(newPhone);
    const cleanDigits = newPhone.replace(/[^0-9]/g, '');
    const tenDigits = cleanDigits.length === 11 && cleanDigits.startsWith('1') ? cleanDigits.slice(1) : cleanDigits;
    if (carrierInput !== 'custom' && tenDigits.length >= 10) {
      const domain = CARRIER_GATEWAY_DOMAINS[carrierInput]?.domain || 'vtext.com';
      setGatewayInput(`${tenDigits}@${domain}`);
    }
  };

  const handleCarrierChange = (newCarrier: CommunicationSettings['carrier']) => {
    setCarrierInput(newCarrier);
    const cleanDigits = phoneInput.replace(/[^0-9]/g, '');
    const tenDigits = cleanDigits.length === 11 && cleanDigits.startsWith('1') ? cleanDigits.slice(1) : cleanDigits;
    if (newCarrier !== 'custom' && tenDigits.length >= 10) {
      const domain = CARRIER_GATEWAY_DOMAINS[newCarrier]?.domain || 'vtext.com';
      setGatewayInput(`${tenDigits}@${domain}`);
    }
  };

  const handleSave = () => {
    const updated = saveCommunicationSettings({
      emailToSmsGateway: gatewayInput.trim() || '5417292097@vtext.com',
      phoneNumber: phoneInput.trim() || '541-729-2097',
      carrier: carrierInput,
      relayEnabled,
      minIntentThreshold: threshold,
      autoReactivationAlerts: autoReactivate
    });
    setSettings(updated);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
    if (onSaved) onSaved(updated);
  };

  const handleCopyGateway = () => {
    navigator.clipboard.writeText(gatewayInput);
    setCopiedGateway(true);
    setTimeout(() => setCopiedGateway(false), 2000);
  };

  // Test Gateway Connection handler for the chosen discovery source
  const handleTestGatewayConnection = async (sourceToTest?: TestSourceThread) => {
    const src = sourceToTest || activeTestSource;
    setIsTesting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const resp = await fetch('/api/lead-discovery/dispatch-high-intent-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadId: `test_comm_${src.id}_${Date.now()}`,
          author: src.author,
          platform: src.platform,
          title: src.title,
          snippet: src.snippet,
          matchedProgram: src.matchedProgram,
          location: src.location,
          intentScore: src.intentScore,
          toCellNumber: phoneInput || '541-729-2097',
          carrier: carrierInput
        })
      });

      const elapsedMs = Math.round(performance.now() - startTime);
      const data = await resp.json();

      if (data.success) {
        setTestResult({
          success: true,
          message: `✓ Gateway Reachability Verified! Test alert for ${src.sourceName} reached ${data.dispatchedTo} in ${elapsedMs}ms.`,
          latencyMs: elapsedMs,
          dispatchedTo: data.dispatchedTo,
          targetPhone: data.targetPhone,
          sourceTested: src,
          smsAlertText: data.smsAlertText,
          appleMessagesUrl: data.appleMessagesUrl,
          freeGmailWebUrl: data.freeGmailWebUrl,
          threadId: data.leadId
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to dispatch test notification.',
          latencyMs: elapsedMs,
          sourceTested: src
        });
      }
    } catch (err: any) {
      const elapsedMs = Math.round(performance.now() - startTime);
      setTestResult({
        success: false,
        message: err.message || 'Network error executing gateway test.',
        latencyMs: elapsedMs,
        sourceTested: src
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overview Banner */}
      <div className="p-4.5 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/40 rounded-2xl space-y-2 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-emerald-300 font-extrabold text-sm">
            <Smartphone className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Communication &amp; Email-to-SMS Gateway Settings</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Active Gateway: {gatewayInput || '5417292097@vtext.com'}</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-mono font-bold">
              $0.00 Twilio Fees
            </span>
          </div>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Configure your personal email-to-SMS gateway address (e.g. <strong>[phone]@vtext.com</strong>). When the AI agent scrapes high-intent homebuyer conversations across Oregon forums and chat boards, alerts are dispatched directly to your physical phone text messages. You can reply from your native text app to participate in the conversation without logging into any CRM!
        </p>
      </div>

      {/* Main Configuration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Gateway Address & Carrier Setup */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1. Email-to-SMS Gateway Address
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-500 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded font-bold">
              Configured Route
            </span>
          </div>

          {/* Primary Gateway Address Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Direct Gateway Address:</span>
              <button
                type="button"
                onClick={handleCopyGateway}
                className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedGateway ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedGateway ? 'Copied' : 'Copy'}</span>
              </button>
            </label>
            <div className="relative">
              <input
                type="text"
                value={gatewayInput}
                onChange={(e) => setGatewayInput(e.target.value)}
                placeholder="5417292097@vtext.com"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Format: <code>[10-digit-phone]@[carrier-domain]</code>. Used by the inbound webhook to route replies.
            </p>
          </div>

          {/* Assistant: Phone Number + Carrier Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                Cell Phone Number:
              </label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="541-729-2097"
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block">
                Cellular Carrier:
              </label>
              <select
                value={carrierInput}
                onChange={(e) => handleCarrierChange(e.target.value as any)}
                className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {Object.entries(CARRIER_GATEWAY_DOMAINS).map(([key, item]) => (
                  <option key={key} value={key} className="dark:bg-slate-900">
                    {item.name} {item.domain ? `(@${item.domain})` : '(Custom)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-600 dark:text-slate-400 space-y-1">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>How Inbound Texts Return to the CRM:</span>
            </span>
            <p>
              When you hit Send in Apple Messages, your carrier relays the message back to <code>/api/lead-discovery/inbound-sms-reply</code>, appending your response directly to the scraped chat thread in Firestore.
            </p>
          </div>
        </div>

        {/* Card 2: High-Intent Conversation Scrape Relay Triggers */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  2. High-Intent Conversation Relay Triggers
                </h4>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                relayEnabled
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {relayEnabled ? 'Relay Active' : 'Relay Paused'}
              </span>
            </div>

            {/* Master Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-900 dark:text-white block">
                  Scrape-to-SMS Auto Relay
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically forward newly scraped high-intent buyer posts to your phone
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRelayEnabled(!relayEnabled)}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  relayEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span className={`block w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${
                  relayEnabled ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Minimum Intent Threshold Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Minimum Intent Score Threshold:
                </span>
                <span className="font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {threshold}% Intent or Higher
                </span>
              </div>
              <input
                type="range"
                min="80"
                max="99"
                step="1"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>80% (Broad Inquiries)</span>
                <span>90% (Standard)</span>
                <span>99% (Urgent Pre-Approvals Only)</span>
              </div>
            </div>

            {/* Stale Thread Reactivation Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="space-y-0.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                  Stale Lead Reactivation Alerts
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                  Buzz phone if a dormant lead (&gt;7 days) posts new comments
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoReactivate}
                onChange={(e) => setAutoReactivate(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleSave}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSaved ? 'Settings Saved & Synced!' : 'Save Communication Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comprehensive Multi-Source Lead Thread Test & Reachability Verification */}
      <div className="p-5 bg-slate-900 border border-indigo-500/40 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-[10px] font-black uppercase">
                Gateway Reachability Verification
              </span>
              <span className="text-xs text-slate-400">• Multi-Source Thread Testing</span>
            </div>
            <h4 className="text-sm font-black text-white flex items-center gap-2 mt-0.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Test Each Lead Discovery Source Thread Chat</span>
            </h4>
          </div>

          {/* Explicit 'Test Gateway Connection' Button */}
          <button
            type="button"
            onClick={() => handleTestGatewayConnection()}
            disabled={isTesting}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 hover:from-emerald-400 hover:to-indigo-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            title="Trigger a dummy test message to the configured SMS gateway to verify reachability"
          >
            {isTesting ? (
              <RotateCcw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Radio className="w-4 h-4 text-slate-950 animate-pulse" />
            )}
            <span>{isTesting ? 'Testing Reachability...' : '⚡ Test Gateway Connection'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Select any of the 4 discovery source thread archetypes below to trigger an authentic dummy test message to your configured gateway (<strong>{gatewayInput || '5417292097@vtext.com'}</strong>). This validates carrier reachability, formatting, and two-way sync with Firestore.
        </p>

        {/* Source Thread Selector Tabs */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Select Lead Discovery Source Thread to Test:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {TEST_DISCOVERY_SOURCES.map((source) => {
              const isSelected = selectedSourceId === source.id;
              return (
                <button
                  key={source.id}
                  type="button"
                  onClick={() => setSelectedSourceId(source.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-950 border-emerald-500 ring-1 ring-emerald-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${source.badgeColor}`}>
                      {source.sourceType === 'forum' ? '💬 Forum' : source.sourceType === 'chat_board' ? '🎮 Discord' : source.sourceType === 'community_board' ? '👥 Community' : '📰 Blog'}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-emerald-400">
                      {source.intentScore}% Intent
                    </span>
                  </div>
                  <div className="text-xs font-bold text-slate-200 truncate">
                    {source.sourceName}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 italic">
                    &ldquo;{source.snippet}&rdquo;
                  </p>
                  <div className="text-[10px] text-indigo-300 font-medium">
                    Program: {source.matchedProgram}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Test Target Summary */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Target SMS Gateway:</span>
            <span className="font-mono font-bold text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/30">
              {gatewayInput}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Test Persona:</span>
            <span className="font-bold text-white">
              {activeTestSource.author} on {activeTestSource.platform}
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleTestGatewayConnection(activeTestSource)}
            disabled={isTesting}
            className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs transition cursor-pointer shadow disabled:opacity-50 flex items-center gap-1.5"
          >
            <Send className="w-3 h-3" />
            <span>Test This Source ({activeTestSource.sourceName.split(' ')[0]})</span>
          </button>
        </div>

        {/* Test Result & Reachability Report */}
        {testResult && (
          <div className={`p-4 rounded-xl border text-xs space-y-3 animate-in fade-in ${
            testResult.success
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/40 border-red-500/50 text-red-200'
          }`}>
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-500/30 pb-2">
              <div className="flex items-center gap-2 font-black text-sm text-white">
                {testResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
              {testResult.latencyMs && (
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold">
                  Latency: {testResult.latencyMs}ms • Gateway Online
                </span>
              )}
            </div>

            {testResult.smsAlertText && (
              <div className="space-y-1.5">
                <span className="font-bold text-emerald-400 block text-xs">
                  Delivered 160-Char Carrier SMS Payload:
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-emerald-500/30 font-mono text-[11px] text-slate-200 whitespace-pre-wrap leading-relaxed">
                  {testResult.smsAlertText}
                </div>
              </div>
            )}

            {/* Verification Links */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-300 text-[11px]">
                  ✓ Verified: Thread synchronized in Firestore <code>lead_conversations</code>.
                </span>
              </div>

              <div className="flex items-center gap-2">
                {testResult.appleMessagesUrl && (
                  <a
                    href={testResult.appleMessagesUrl}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow"
                    title="Launch Apple Messages directly to test 1-tap compose"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>📱 Launch Apple Messages</span>
                  </a>
                )}
                {testResult.freeGmailWebUrl && (
                  <a
                    href={testResult.freeGmailWebUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/40 font-bold text-xs transition"
                    title="Open pre-filled Gmail compose addressed to this carrier gateway"
                  >
                    <Mail className="w-3.5 h-3.5 text-rose-400" />
                    <span>✉️ Open Gmail Compose</span>
                    <ExternalLink className="w-3 h-3 opacity-70" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
