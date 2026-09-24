/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Calendar, 
  Volume2, 
  Sparkles, 
  Radio, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Save, 
  Sliders, 
  Building2, 
  Users, 
  TrendingDown, 
  Zap, 
  Send, 
  Smartphone, 
  MapPin, 
  ShieldCheck, 
  Bot, 
  Info,
  ChevronRight,
  RefreshCw,
  Award,
  Bell,
  FileText
} from 'lucide-react';
import { DriveTimeBriefingScheduleConfig, DriveTimeBriefingLog } from '../types/voiceMacro';

const DEFAULT_CONFIG: DriveTimeBriefingScheduleConfig = {
  enabled: true,
  scheduledTime: '07:30',
  timezone: 'America/Los_Angeles',
  repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  voicePersona: 'Puck',
  speakingSpeed: 1.15,
  maxDurationSeconds: 60,
  includeZillowPriceDrops: true,
  minPriceDropAmount: 10000,
  targetCounties: ['Multnomah', 'Deschutes', 'Marion', 'Lane', 'Washington'],
  includeOhcsTargetedAreaHomes: true,
  includeUsdaZeroDownHomes: true,
  includeHotCrmLeads: true,
  minCrmLeadScore: 8,
  includeUnreadRealtorInquiries: true,
  includeRateLockExpirations: true,
  includeDpaGrantWaterfalls: true,
  customPromptInstructions: 'Focus first on Zillow price cuts over $15,000 in Bend and Redmond, then announce OHCS targeted area listings with waived 1st-time homebuyer rules.',
  deliveryChannels: {
    carPlayPush: true,
    inAppAutoPlay: true,
    smsAudioMemo: false,
    calendarAttachment: true,
  },
  recipientPhone: '(503) 555-0199',
  lastRunAt: new Date().toISOString()
};

const DEFAULT_LOGS: DriveTimeBriefingLog[] = [
  {
    id: 'log_1',
    timestamp: new Date(Date.now() - 86400000 * 0.1).toISOString(),
    durationSeconds: 58,
    transcript: "Good morning Copilot! Today's 30Y Fixed benchmark holds steady at 6.625%. Zillow overnight sweep flagged 3 price drops in Redmond, including a $16,000 price drop in an OHCS Targeted Census Tract eligible for 1st-time homebuyer waivers. CRM alert: Realtor Marcus Vance submitted an urgent pre-approval request for buyer Kanndice. You have 2 rate locks expiring in 5 days.",
    zillowPriceDropCount: 3,
    hotLeadCount: 2,
    ohcsTargetedMatchCount: 1,
    currentMortgageRate30Y: '6.625%',
    status: 'delivered',
    voicePersonaUsed: 'Puck'
  },
  {
    id: 'log_2',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    durationSeconds: 54,
    transcript: "Drive-time briefing for Wednesday. Portland Metro market saw 5 price reductions overnight averaging $12,500. DPA Grant Waterfall updated: Oregon Flex Lending now offers up to 5% cash assistance for qualified buyers. Lead Sarah Jenkins left a voice memo regarding USDA zero-down eligibility in Marion County.",
    zillowPriceDropCount: 5,
    hotLeadCount: 1,
    ohcsTargetedMatchCount: 2,
    currentMortgageRate30Y: '6.650%',
    status: 'delivered',
    voicePersonaUsed: 'Puck'
  }
];

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const DriveTimeBriefingScheduler: React.FC = () => {
  const [config, setConfig] = useState<DriveTimeBriefingScheduleConfig>(() => {
    try {
      const saved = localStorage.getItem('vantage_drive_time_briefing_config');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_CONFIG;
  });

  const [logs, setLogs] = useState<DriveTimeBriefingLog[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_drive_time_briefing_logs');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_LOGS;
  });

  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackProgress, setPlaybackProgress] = useState<number>(0);
  const [activeTranscript, setActiveTranscript] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState<string | null>(null);

  const playbackTimerRef = useRef<any>(null);

  useEffect(() => {
    try {
      localStorage.setItem('vantage_drive_time_briefing_config', JSON.stringify(config));
    } catch {}
  }, [config]);

  useEffect(() => {
    try {
      localStorage.setItem('vantage_drive_time_briefing_logs', JSON.stringify(logs));
    } catch {}
  }, [logs]);

  // Clean up audio simulation timers
  useEffect(() => {
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    };
  }, []);

  const handleDayToggle = (day: string) => {
    const exists = config.repeatDays.includes(day);
    const newDays = exists 
      ? config.repeatDays.filter(d => d !== day) 
      : [...config.repeatDays, day];
    setConfig({ ...config, repeatDays: newDays });
  };

  const handleSelectPresetDays = (preset: 'weekdays' | 'everyday' | 'weekends') => {
    if (preset === 'weekdays') setConfig({ ...config, repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] });
    else if (preset === 'everyday') setConfig({ ...config, repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] });
    else if (preset === 'weekends') setConfig({ ...config, repeatDays: ['Sat', 'Sun'] });
  };

  const handleSaveConfig = () => {
    setSaveSuccessMsg('Drive-Time Briefing schedule & Gemini synthesis preferences saved!');
    setTimeout(() => setSaveSuccessMsg(null), 3500);
  };

  const handleSynthesizeBriefingNow = () => {
    setIsSynthesizing(true);
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setIsPlayingAudio(false);
    setPlaybackProgress(0);

    setTimeout(() => {
      setIsSynthesizing(false);
      
      const generatedTranscript = `Good morning Copilot! Today's 30Y Fixed rate sits at 6.625%. Overnight Zillow sweep found ${
        config.includeZillowPriceDrops ? '4 price cuts averaging $' + (config.minPriceDropAmount + 2500).toLocaleString() : 'market stability'
      } across ${config.targetCounties.slice(0, 3).join(', ')} counties.${
        config.includeOhcsTargetedAreaHomes ? ' OHCS Targeted Tract Alert: 1 listing in Deschutes County has waived 1st-time homebuyer restrictions!' : ''
      }${
        config.includeHotCrmLeads ? ' CRM Lead Priority: 2 hot buyers requested pre-approval revisions.' : ''
      } Ready for drive-time dispatch.`;

      setActiveTranscript(generatedTranscript);

      const newLog: DriveTimeBriefingLog = {
        id: 'log_' + Date.now(),
        timestamp: new Date().toISOString(),
        durationSeconds: config.maxDurationSeconds,
        transcript: generatedTranscript,
        zillowPriceDropCount: config.includeZillowPriceDrops ? 4 : 0,
        hotLeadCount: config.includeHotCrmLeads ? 2 : 0,
        ohcsTargetedMatchCount: config.includeOhcsTargetedAreaHomes ? 1 : 0,
        currentMortgageRate30Y: '6.625%',
        status: 'delivered',
        voicePersonaUsed: config.voicePersona
      };

      setLogs([newLog, ...logs]);
      setConfig({ ...config, lastRunAt: new Date().toISOString() });

      // Start simulated speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(generatedTranscript);
        utterance.rate = config.speakingSpeed;
        utterance.pitch = config.voicePersona === 'Fenrir' ? 0.8 : config.voicePersona === 'Puck' ? 1.1 : 1.0;
        utterance.onend = () => {
          setIsPlayingAudio(false);
          setPlaybackProgress(100);
          if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
        };
        window.speechSynthesis.speak(utterance);
      }

      setIsPlayingAudio(true);
      let progress = 0;
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
      playbackTimerRef.current = setInterval(() => {
        progress += 2;
        if (progress >= 100) {
          clearInterval(playbackTimerRef.current);
          setIsPlayingAudio(false);
          setPlaybackProgress(100);
        } else {
          setPlaybackProgress(progress);
        }
      }, (config.maxDurationSeconds * 1000) / 50);

    }, 1800);
  };

  const handleTogglePlayPause = () => {
    if (isPlayingAudio) {
      if ('speechSynthesis' in window) window.speechSynthesis.pause();
      setIsPlayingAudio(false);
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    } else {
      if ('speechSynthesis' in window) {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else if (activeTranscript) {
          const utterance = new SpeechSynthesisUtterance(activeTranscript);
          utterance.rate = config.speakingSpeed;
          window.speechSynthesis.speak(utterance);
        }
      }
      setIsPlayingAudio(true);
      playbackTimerRef.current = setInterval(() => {
        setPlaybackProgress(prev => {
          if (prev >= 100) {
            clearInterval(playbackTimerRef.current);
            setIsPlayingAudio(false);
            return 100;
          }
          return prev + 2;
        });
      }, (config.maxDurationSeconds * 1000) / 50);
    }
  };

  const handleDispatchToCarPlayNow = () => {
    setDispatchSuccessMsg('🚗 Sent live Drive-Time audio briefing to mobile push & CarPlay audio queue!');
    setTimeout(() => setDispatchSuccessMsg(null), 4000);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Status Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-2xl border border-blue-800/60 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-300">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span>Gemini Live Audio Dispatcher</span>
              <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 border border-blue-400/30 rounded-full text-[10px] font-mono">
                Hands-Free LO Edition
              </span>
            </div>
            
            <h3 className="text-2xl font-extrabold text-white">
              Drive-Time Morning Briefing Scheduler
            </h3>

            <p className="text-sm text-slate-300 leading-relaxed">
              Automate your 60-second morning audio briefing synthesized by Gemini Live Audio. Streams overnight Zillow market price cuts, OHCS Targeted Area matches, and high-intent CRM leads directly to your car speakers while driving.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Next Scheduled Run:</span>
                <strong className="text-amber-300">{config.enabled ? `Tomorrow at ${config.scheduledTime} (${config.timezone.split('/')[1] || 'PT'})` : 'Paused'}</strong>
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                <span>Persona:</span>
                <strong className="text-blue-200">{config.voicePersona} ({config.speakingSpeed}x speed)</strong>
              </div>

              <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>OHCS & DPA Sweeps:</span>
                <strong className="text-emerald-300">Active</strong>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 shrink-0">
            <button
              onClick={handleSynthesizeBriefingNow}
              disabled={isSynthesizing}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer disabled:opacity-50"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Gemini Audio...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-200" />
                  <span>Synthesize &amp; Listen Now</span>
                </>
              )}
            </button>

            <button
              onClick={() => setConfig({ ...config, enabled: !config.enabled })}
              className={`flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                config.enabled
                  ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-800'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${config.enabled ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span>{config.enabled ? 'Schedule Active' : 'Schedule Paused'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {saveSuccessMsg && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        </div>
      )}

      {dispatchSuccessMsg && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-xl flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>{dispatchSuccessMsg}</span>
          </div>
        </div>
      )}

      {/* Live Briefing Audio Simulator Card */}
      {(isPlayingAudio || activeTranscript || isSynthesizing) && (
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white p-6 rounded-2xl border border-blue-500/40 shadow-xl space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Gemini Live Audio Player Simulation
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/30 text-blue-300 rounded-full border border-blue-400/30">
                  {config.voicePersona} ({config.speakingSpeed}x)
                </span>
              </h4>
            </div>

            <button
              onClick={handleDispatchToCarPlayNow}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send to CarPlay</span>
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              onClick={handleTogglePlayPause}
              disabled={isSynthesizing}
              className="w-12 h-12 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0 shadow-lg transition cursor-pointer"
            >
              {isPlayingAudio ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-0.5" />}
            </button>

            <div className="flex-1 w-full space-y-1.5">
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>{isPlayingAudio ? 'Playing Live Speech...' : 'Audio Ready'}</span>
                <span>{Math.round((playbackProgress / 100) * config.maxDurationSeconds)}s / {config.maxDurationSeconds}s</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-300"
                  style={{ width: `${playbackProgress}%` }}
                />
              </div>
            </div>

            {/* Audio Waveform Graphic */}
            <div className="flex items-center gap-1 h-8 shrink-0 px-2">
              {[40, 75, 30, 90, 60, 100, 45, 80, 50, 95, 35, 70].map((h, i) => (
                <div 
                  key={i} 
                  className={`w-1 rounded-full transition-all duration-300 ${
                    isPlayingAudio ? 'bg-emerald-400 animate-pulse' : 'bg-slate-700'
                  }`}
                  style={{ height: isPlayingAudio ? `${Math.max(20, (h * (playbackProgress % 30 + 70)) / 100)}%` : '25%' }}
                />
              ))}
            </div>
          </div>

          {activeTranscript && (
            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-blue-400" /> Live Spoken Briefing Transcript
              </div>
              <p className="text-xs text-slate-200 font-serif leading-relaxed italic">
                &ldquo;{activeTranscript}&rdquo;
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Grid: Scheduler Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Schedule & Data Scope Configuration */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Time, Days & Recurrence */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                1. Recurrence & Execution Schedule
              </h4>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Local device time sync
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Scheduled Morning Briefing Time
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="time"
                    value={config.scheduledTime}
                    onChange={(e) => setConfig({ ...config, scheduledTime: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Timezone
                </label>
                <select
                  value={config.timezone}
                  onChange={(e) => setConfig({ ...config, timezone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="America/Los_Angeles">Pacific Time (US/Los Angeles)</option>
                  <option value="America/Denver">Mountain Time (US/Denver)</option>
                  <option value="America/Chicago">Central Time (US/Chicago)</option>
                  <option value="America/New_York">Eastern Time (US/New York)</option>
                </select>
              </div>
            </div>

            {/* Day Selector */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Repeat Days
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleSelectPresetDays('weekdays')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Weekdays
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">|</span>
                  <button
                    type="button"
                    onClick={() => handleSelectPresetDays('everyday')}
                    className="text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    Everyday
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {DAYS_OF_WEEK.map((day) => {
                  const isSelected = config.repeatDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Zillow & Market Ingestion Filters */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                2. Overnight Zillow Market &amp; Rate Ingestion
              </h4>
              <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] rounded-full">
                Real-Time API Sync
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Include Zillow Overnight Price Drops
                  </span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Scan listings updated in last 12 hours with price drops exceeding threshold
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.includeZillowPriceDrops}
                  onChange={(e) => setConfig({ ...config, includeZillowPriceDrops: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                />
              </div>

              {config.includeZillowPriceDrops && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-2 border-l-2 border-blue-500">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Min Price Drop Cutoff ($)
                    </label>
                    <select
                      value={config.minPriceDropAmount}
                      onChange={(e) => setConfig({ ...config, minPriceDropAmount: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value={5000}>$5,000+ Price Cut</option>
                      <option value={10000}>$10,000+ Price Cut</option>
                      <option value={15000}>$15,000+ Price Cut</option>
                      <option value={25000}>$25,000+ Price Cut</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Targeted Counties
                    </label>
                    <input
                      type="text"
                      value={config.targetCounties.join(', ')}
                      onChange={(e) => setConfig({ ...config, targetCounties: e.target.value.split(',').map(s => s.trim()) })}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                      placeholder="Multnomah, Deschutes, Marion"
                    />
                  </div>
                </div>
              )}

              {/* Special Flags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      OHCS Targeted Areas
                    </span>
                    <p className="text-[10px] text-purple-700 dark:text-purple-300">
                      Flag homes in waived 1st-time buyer tracts
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.includeOhcsTargetedAreaHomes}
                    onChange={(e) => setConfig({ ...config, includeOhcsTargetedAreaHomes: e.target.checked })}
                    className="w-4 h-4 text-purple-600 rounded cursor-pointer"
                  />
                </div>

                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      USDA 0% Down Rural
                    </span>
                    <p className="text-[10px] text-emerald-700 dark:text-emerald-300">
                      Highlight 100% rural eligible homes
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.includeUsdaZeroDownHomes}
                    onChange={(e) => setConfig({ ...config, includeUsdaZeroDownHomes: e.target.checked })}
                    className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: CRM Lead & Rate Digest */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                3. CRM Lead Digest &amp; Rate Locks
              </h4>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Hot CRM Leads (Score &ge; {config.minCrmLeadScore}/10)
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Inbound pre-approvals &amp; active buyers
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.includeHotCrmLeads}
                  onChange={(e) => setConfig({ ...config, includeHotCrmLeads: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Rate Lock Expirations (&lt;7 Days)
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Urgent rate lock expiration alerts
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={config.includeRateLockExpirations}
                  onChange={(e) => setConfig({ ...config, includeRateLockExpirations: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
            </div>

            {/* Custom AI Instructions */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Custom Gemini AI Audio System Instructions
              </label>
              <textarea
                rows={3}
                value={config.customPromptInstructions}
                onChange={(e) => setConfig({ ...config, customPromptInstructions: e.target.value })}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="Instruct Gemini how to tone or prioritize the drive-time audio..."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Schedule &amp; Preferences
            </button>
          </div>
        </div>

        {/* Right Col: Persona, Channels & Log History */}
        <div className="space-y-6">
          
          {/* Persona & Audio Tuning Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                Gemini Voice Persona Tuning
              </h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Voice Persona
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { name: 'Puck', desc: 'Energetic LO Partner' },
                    { name: 'Fenrir', desc: 'Executive Strategist' },
                    { name: 'Kore', desc: 'Smooth Morning Cadence' },
                    { name: 'Aoede', desc: 'Client Concierge' }
                  ].map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() => setConfig({ ...config, voicePersona: p.name as any })}
                      className={`p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        config.voicePersona === p.name
                          ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-500 text-purple-900 dark:text-purple-100 ring-2 ring-purple-400/40'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Speaking Speed</span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono">{config.speakingSpeed}x</span>
                </div>
                <input
                  type="range"
                  min="0.9"
                  max="1.4"
                  step="0.05"
                  value={config.speakingSpeed}
                  onChange={(e) => setConfig({ ...config, speakingSpeed: parseFloat(e.target.value) })}
                  className="w-full accent-purple-600 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Max Briefing Duration
                </label>
                <select
                  value={config.maxDurationSeconds}
                  onChange={(e) => setConfig({ ...config, maxDurationSeconds: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100"
                >
                  <option value={60}>60 Seconds (Express Drive-Time)</option>
                  <option value={90}>90 Seconds (Standard Brief)</option>
                  <option value={180}>3 Minutes (Deep Executive Dive)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Delivery Channels Card */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Delivery Channels
            </h4>

            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Apple CarPlay / Mobile Push</span>
                <input
                  type="checkbox"
                  checked={config.deliveryChannels.carPlayPush}
                  onChange={(e) => setConfig({
                    ...config,
                    deliveryChannels: { ...config.deliveryChannels, carPlayPush: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200">In-App Auto-Play (7-9 AM)</span>
                <input
                  type="checkbox"
                  checked={config.deliveryChannels.inAppAutoPlay}
                  onChange={(e) => setConfig({
                    ...config,
                    deliveryChannels: { ...config.deliveryChannels, inAppAutoPlay: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl cursor-pointer">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Google Calendar Audio Attach</span>
                <input
                  type="checkbox"
                  checked={config.deliveryChannels.calendarAttachment}
                  onChange={(e) => setConfig({
                    ...config,
                    deliveryChannels: { ...config.deliveryChannels, calendarAttachment: e.target.checked }
                  })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>

          {/* Past Briefings Execution History */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                Briefing Execution History ({logs.length})
              </h4>
            </div>

            <div className="space-y-3">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(log.timestamp).toLocaleDateString()}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-bold text-[10px]">
                      {log.status}
                    </span>
                  </div>

                  <p className="text-slate-600 dark:text-slate-300 text-[11px] line-clamp-2 italic">
                    &ldquo;{log.transcript}&rdquo;
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500">
                    <span>⚡ {log.zillowPriceDropCount} Drops | 🔥 {log.hotLeadCount} Leads</span>
                    <button
                      onClick={() => {
                        setActiveTranscript(log.transcript);
                        setIsPlayingAudio(true);
                        if ('speechSynthesis' in window) {
                          const u = new SpeechSynthesisUtterance(log.transcript);
                          window.speechSynthesis.speak(u);
                        }
                      }}
                      className="text-blue-600 dark:text-blue-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" /> Replay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
