/**
 * @file ActiveTwoWayNotificationModal.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Intelligent Notification Settings Modal for 'Active Two-Way' Lead Responses
 * Configures priority push notifications sent directly to the loan officer's mobile device
 * whenever an active prospect replies, distinctly isolated from standard Gmail draft alerts.
 */

import React, { useState } from 'react';
import {
  Bell,
  Smartphone,
  Volume2,
  Vibrate,
  ShieldCheck,
  Check,
  X,
  Sparkles,
  Zap,
  Sliders,
  Send,
  MessageSquare,
  Mail,
  AlertCircle,
  CheckCircle2,
  Radio
} from 'lucide-react';
import {
  ActiveTwoWayNotificationConfig,
  ActiveTwoWayNotificationService,
  DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG,
  playPriorityAudioChime
} from '../services/activeTwoWayNotificationService';

interface ActiveTwoWayNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved?: (config: ActiveTwoWayNotificationConfig) => void;
  onTriggerTestAlert?: () => Promise<void>;
}

export const ActiveTwoWayNotificationModal: React.FC<ActiveTwoWayNotificationModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  onTriggerTestAlert
}) => {
  const [config, setConfig] = useState<ActiveTwoWayNotificationConfig>(() => ActiveTwoWayNotificationService.getConfig());
  const [isTestingPush, setIsTestingPush] = useState(false);
  const [testStatusMsg, setTestStatusMsg] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });

  React.useEffect(() => {
    if (isOpen) {
      const current = ActiveTwoWayNotificationService.getConfig();
      setConfig(current);
      setTestStatusMsg(null);
      setSaveSuccessMsg(null);
      if (typeof window !== 'undefined' && 'Notification' in window) {
        setPermissionState(Notification.permission);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setPermissionState(perm);
        if (perm === 'granted') {
          setTestStatusMsg('✓ Mobile push notification permission granted!');
        } else {
          setTestStatusMsg('⚠️ Notification permission was not granted. Check browser settings.');
        }
      } catch (err: any) {
        setTestStatusMsg(`Error requesting permission: ${err.message}`);
      }
    }
  };

  const handleTestAudio = () => {
    playPriorityAudioChime(config.audioChime);
  };

  const handleTestVibration = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(config.vibratePattern || [300, 100, 300, 100, 300]);
        setTestStatusMsg('📳 Vibration triggered on physical device!');
      } catch {
        setTestStatusMsg('⚠️ Vibration API not supported on this browser/OS.');
      }
    } else {
      setTestStatusMsg('⚠️ Vibration hardware requires physical Android/iOS device.');
    }
  };

  const handleExecuteLiveTest = async () => {
    setIsTestingPush(true);
    setTestStatusMsg('Dispatching priority test push to mobile device and carrier gateway...');

    try {
      if (onTriggerTestAlert) {
        await onTriggerTestAlert();
      } else {
        await ActiveTwoWayNotificationService.dispatchPriorityResponsePush(
          {
            leadId: 'test_active_2way_lead',
            author: 'u/BendOutdoorBuyer',
            location: 'Bend, OR (Deschutes County)',
            matchedProgram: 'OHCS Flex Lending & Employer DPA Grant',
            replyText: 'Thanks for the quick reply Mike! Can we jump on a 10-minute numbers review this afternoon? Rent just went up $250.',
            platform: 'Reddit (r/Bend & Local Housing Forum)',
            messageThreadId: 'th_bend_outdoor_88'
          },
          config
        );
      }
      setTestStatusMsg('✓ Priority Push Delivered! Check lock screen / notification tray for the distinct Active 2-Way alert.');
    } catch (err: any) {
      setTestStatusMsg(`❌ Delivery error: ${err.message || err}`);
    } finally {
      setIsTestingPush(false);
    }
  };

  const handleSave = async () => {
    await ActiveTwoWayNotificationService.saveConfig(config);
    if (onConfigSaved) {
      onConfigSaved(config);
    }
    setSaveSuccessMsg('✓ Intelligent priority notification settings saved to Firestore!');
    setTimeout(() => {
      setSaveSuccessMsg(null);
      onClose();
    }, 1200);
  };

  const handleResetDefaults = () => {
    setConfig(DEFAULT_ACTIVE_2WAY_NOTIF_CONFIG);
    setTestStatusMsg('Reset to recommended default priority settings.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl overflow-hidden font-sans">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-rose-500/20 to-indigo-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
              <Zap className="w-6 h-6 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Intelligent Active Two-Way Response Push Notifications
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  config.enabled 
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                    : 'bg-slate-700 text-slate-300'
                }`}>
                  {config.enabled ? '⚡ Priority Push Active' : '○ Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Sends an urgent priority mobile push whenever an <strong>Active Two-Way</strong> prospect replies, kept completely separate from standard Gmail draft notifications.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Master Enable & Isolation Switch Card */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-400" />
                  <span>Priority Mobile Push Delivery for Inbound Responses</span>
                </span>
                <p className="text-xs text-slate-400">
                  Instantly alerts your iPhone / Android lock screen when an active prospect texts back or answers your proposal.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setConfig(prev => ({ ...prev, enabled: !prev.enabled }))}
                className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  config.enabled ? 'bg-amber-500' : 'bg-slate-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    config.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Browser Push Permission Status Indicator */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Device Push Permission:</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  permissionState === 'granted'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {permissionState === 'granted' ? '✓ Granted (Mobile Lock Screen Ready)' : '⚠️ Action Needed'}
                </span>
              </div>
              {permissionState !== 'granted' && (
                <button
                  type="button"
                  onClick={handleRequestPermission}
                  className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
                >
                  Enable Browser Push Notifications
                </button>
              )}
            </div>
          </div>

          {/* Section 1: Comparison Visual (Distinct Separation from Gmail Draft Alerts) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Isolated Channel Architecture (Draft Alerts vs. Lead Responses)</span>
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-mono border border-emerald-500/30">
                Independent Notification Tags
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Standard Gmail Draft Alert Card */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 opacity-75">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-400 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-rose-400" />
                    <span>Standard Gmail Draft Notification</span>
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">Standard</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-0.5">
                  <div className="font-bold text-slate-200">✉️ [AI GMAIL DRAFT READY] Prospect</div>
                  <div className="text-[10px] text-slate-400 truncate">1-Click to review and send pre-filled draft...</div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Silent notification triggered during outbound formulation for loan officer review.
                </p>
              </div>

              {/* Priority Active Two-Way Response Alert Card */}
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/50 space-y-2 relative overflow-hidden ring-1 ring-amber-500/30">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-amber-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Priority Active Two-Way Response (Silent Dashboard)</span>
                  </span>
                  <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded uppercase tracking-wider">
                    Zero-Popup Mode
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900/90 border border-amber-500/40 font-mono text-[11px] text-amber-200 space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1">
                    <span>⚡ [PRIORITY ACTIVE 2-WAY RESPONSE]</span>
                  </div>
                  <div className="text-[10px] text-amber-300 truncate">&ldquo;Thanks Mike! Can we jump on a call today?&rdquo;</div>
                </div>
                <p className="text-[11px] text-amber-300/80">
                  Zero popups and silent in dashboard. Instantly forwards every initial reply and subsequent reply as a text message to Mike's iPhone (+1 541-729-2097) for remote two-way response.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Priority Level & Audio / Vibration Controls */}
          <div className="space-y-4">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              <span>Priority Level &amp; Hardware Haptic Alerts</span>
            </span>

            {/* Priority Level Segmented Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'urgent',
                  label: '🔥 Urgent VIP',
                  desc: 'Sticky interaction, double chime, triple vibration pattern',
                  badge: 'Recommended'
                },
                {
                  id: 'high',
                  label: '⚡ High Priority',
                  desc: 'Standard chime, vibration pulse, lock screen badge'
                },
                {
                  id: 'normal',
                  label: '💬 Standard Alert',
                  desc: 'Soft ping chime, normal notification tray item'
                }
              ].map((lvl) => {
                const isSelected = config.priorityLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, priorityLevel: lvl.id as any }))}
                    className={`p-3.5 rounded-2xl text-left border transition cursor-pointer relative ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/40 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    {lvl.badge && (
                      <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                        {lvl.badge}
                      </span>
                    )}
                    <div className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{lvl.label}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {lvl.desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Audio & Vibration Hardware Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Audio Chime Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white">Audio Alert Chime</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      config.soundEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.soundEnabled ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={config.audioChime}
                    onChange={(e) => setConfig(prev => ({ ...prev, audioChime: e.target.value as any }))}
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="urgent_chime">Ascending Triple Chime (880-1760Hz)</option>
                    <option value="subtle_ping">High Frequency Ping (1046Hz)</option>
                    <option value="marimba">Warm Sonar Marimba Pulse</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleTestAudio}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold transition cursor-pointer border border-slate-700 shrink-0"
                    title="Play priority audio chime"
                  >
                    🔊 Test
                  </button>
                </div>
              </div>

              {/* Haptic Vibration Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Vibrate className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Haptic Vibration Pulse</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setConfig(prev => ({ ...prev, vibratePatternEnabled: !prev.vibratePatternEnabled }))}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      config.vibratePatternEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {config.vibratePatternEnabled ? 'Active' : 'Off'}
                  </button>
                </div>

                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Pattern: [300ms, 100ms, 300ms]
                  </span>
                  <button
                    type="button"
                    onClick={handleTestVibration}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-bold transition cursor-pointer border border-slate-700"
                    title="Trigger device vibration"
                  >
                    📳 Test Haptic
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Carrier SMS Relay & Mobile Destination */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Cell Carrier SMS Relay &amp; Target Mobile Destination</span>
              </span>
              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.carrierSmsRelayEnabled}
                  onChange={(e) => setConfig(prev => ({ ...prev, carrierSmsRelayEnabled: e.target.checked }))}
                  className="rounded border-slate-700 text-amber-500 focus:ring-0 cursor-pointer"
                />
                <span className="font-bold text-white">Carrier SMS Relay Active</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
              <div className="flex-1 space-y-0.5">
                <span className="text-xs font-bold text-slate-200">Personal Mobile Number for Response Alerts:</span>
                <p className="text-[11px] text-slate-400">
                  Where inbound lead text alerts are forwarded if your browser is closed.
                </p>
              </div>
              <input
                type="text"
                value={config.targetMobileNumber}
                onChange={(e) => setConfig(prev => ({ ...prev, targetMobileNumber: e.target.value }))}
                placeholder="+1 (541) 729-2097"
                className="w-full sm:w-56 p-2 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Feedback Messages */}
          {testStatusMsg && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/80 border border-indigo-500/40 text-indigo-200 text-xs font-semibold animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{testStatusMsg}</span>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 text-xs font-bold animate-in fade-in flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 sm:p-5 border-t border-slate-800 bg-slate-950/90 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer border border-slate-700"
            title="Reset to default recommended settings"
          >
            <span>Reset Defaults</span>
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {/* Live Test Trigger Button */}
            <button
              type="button"
              onClick={handleExecuteLiveTest}
              disabled={isTestingPush}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-md disabled:opacity-50"
              title="Test priority push notification delivery right now"
            >
              <Zap className={`w-3.5 h-3.5 ${isTestingPush ? 'animate-spin' : ''}`} />
              <span>
                {isTestingPush ? 'Firing Mobile Push...' : '⚡ Test Mobile Push Alert Now'}
              </span>
            </button>

            {/* Save Settings Button */}
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-lg ring-1 ring-emerald-400"
            >
              <Check className="w-4 h-4" />
              <span>Save Priority Notification Settings</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
