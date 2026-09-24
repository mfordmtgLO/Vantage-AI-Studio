/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • BATTERY SAVER NAVBAR TOGGLE COMPONENT
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Displays a small battery-saver toggle in the Navbar when the device is
 * running low on power (<=20% battery), allowing users to dynamically
 * throttle background AI polling frequency (3x slower) to conserve power.
 * ============================================================================
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  BatteryLow, 
  BatteryMedium, 
  BatteryCharging, 
  Zap, 
  ZapOff, 
  Leaf, 
  Sparkles, 
  Info, 
  X,
  Gauge
} from 'lucide-react';
import { useBatterySaver } from '../context/BatterySaverContext';

export const BatterySaverNavbarToggle: React.FC = () => {
  const {
    batterySupported,
    batteryLevel,
    isCharging,
    isLowPowerDetected,
    isBatterySaverActive,
    pollingMultiplier,
    isSimulatedLowPower,
    toggleBatterySaver,
    toggleSimulateLowPower
  } = useBatterySaver();

  const [showPopover, setShowPopover] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  // Display the toggle when low power is detected, when battery saver is active, or if simulated
  const shouldDisplay = isLowPowerDetected || isBatterySaverActive || isSimulatedLowPower;

  // Render a fallback subtle button on desktop if not low power so user can easily test
  if (!shouldDisplay) {
    return (
      <div className="relative flex items-center">
        <button
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs flex items-center gap-1 cursor-pointer"
          title={`Battery: ${batteryLevel}% ${isCharging ? '(Charging)' : '(On Battery)'}. Click to test Battery Saver.`}
        >
          {isCharging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-500" />
          ) : (
            <BatteryMedium className="w-3.5 h-3.5 text-slate-400" />
          )}
          <span className="text-[10px] font-mono hidden xl:inline">{batteryLevel}%</span>
        </button>

        {showPopover && (
          <div
            ref={popoverRef}
            className="absolute right-0 top-full mt-2 w-72 p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl z-50 text-xs space-y-2 animate-in fade-in"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Gauge className="w-3.5 h-3.5 text-blue-500" />
                <span>Battery & AI Polling</span>
              </span>
              <button
                type="button"
                onClick={() => setShowPopover(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Power Level</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                {batteryLevel}% {isCharging ? '⚡ Charging' : 'Discharging'}
              </span>
            </div>

            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
              When device battery drops below 20% while discharging, the Battery Saver toggle appears automatically in the Navbar to throttle background AI operations.
            </p>

            <button
              type="button"
              onClick={() => {
                toggleSimulateLowPower();
                setShowPopover(false);
              }}
              className="w-full py-1.5 px-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/70 font-semibold text-[11px] transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BatteryLow className="w-3.5 h-3.5 text-amber-500" />
              <span>Simulate Low Power (14% Battery)</span>
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative flex items-center" ref={popoverRef}>
      {/* Small Battery-Saver Navbar Toggle Pill */}
      <div 
        className={`flex items-center gap-1.5 px-2 py-1 rounded-xl border transition-all shadow-xs ${
          isBatterySaverActive
            ? 'bg-amber-500/15 dark:bg-amber-950/50 border-amber-500/50 text-amber-900 dark:text-amber-200'
            : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-900/60 text-rose-800 dark:text-rose-200'
        }`}
      >
        {/* Battery Status Indicator */}
        <button
          type="button"
          onClick={() => setShowPopover(!showPopover)}
          className="flex items-center gap-1 cursor-pointer"
          title="Click for Power & AI Polling Status"
        >
          {isCharging ? (
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
          ) : (
            <BatteryLow className="w-3.5 h-3.5 text-amber-500 animate-bounce" />
          )}
          <span className="text-[11px] font-mono font-bold">
            {batteryLevel}%
          </span>
        </button>

        <span className="h-3 w-px bg-slate-300 dark:bg-slate-700" />

        {/* Small Toggle Switch */}
        <button
          type="button"
          onClick={toggleBatterySaver}
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-[10px] font-bold transition cursor-pointer ${
            isBatterySaverActive
              ? 'bg-amber-500 text-stone-950 shadow-xs'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700'
          }`}
          title={isBatterySaverActive ? 'Battery Saver is ON (Background AI polling slowed 3x)' : 'Turn ON Battery Saver to reduce AI polling'}
        >
          {isBatterySaverActive ? (
            <>
              <Leaf className="w-3 h-3 text-stone-950" />
              <span>Saver ON</span>
            </>
          ) : (
            <>
              <ZapOff className="w-3 h-3 text-slate-400" />
              <span>Saver OFF</span>
            </>
          )}
        </button>
      </div>

      {/* Detail Popover */}
      {showPopover && (
        <div className="absolute right-0 top-full mt-2 w-80 p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 text-xs space-y-2.5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-lg bg-amber-500/20 text-amber-500">
                <Leaf className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Battery Saver Mode
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowPopover(false)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Battery Level:</span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                {batteryLevel}% {isCharging ? '(Charging)' : '(Low Power)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">AI Background Polling:</span>
              <span className={`font-mono font-bold ${isBatterySaverActive ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {isBatterySaverActive ? 'Reduced (3.0x Slower)' : 'Normal Frequency (1.0x)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">Cloud Run Polling:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {isBatterySaverActive ? 'Every 9.0s (Power Saved)' : 'Every 3.0s'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400">GeoMap Auto-Rotation:</span>
              <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
                {isBatterySaverActive ? 'Every 24.0s' : 'Every 8.0s'}
              </span>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
            {isBatterySaverActive
              ? '🌿 Battery Saver is actively conserving device battery by reducing AI telemetry, geofence polling, and background cognitive synchronizations.'
              : '⚡ Turn ON Battery Saver to extend battery life by throttling autonomous AI loops and background intervals.'}
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={toggleBatterySaver}
              className={`flex-1 py-1.5 px-3 rounded-xl font-bold text-[11px] transition cursor-pointer flex items-center justify-center gap-1.5 ${
                isBatterySaverActive
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-300'
                  : 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs'
              }`}
            >
              {isBatterySaverActive ? (
                <>
                  <Zap className="w-3 h-3" />
                  <span>Disable Saver</span>
                </>
              ) : (
                <>
                  <Leaf className="w-3 h-3" />
                  <span>Enable Battery Saver</span>
                </>
              )}
            </button>

            {isSimulatedLowPower ? (
              <button
                type="button"
                onClick={() => {
                  toggleSimulateLowPower();
                  setShowPopover(false);
                }}
                className="py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-400 text-[10px] font-semibold transition"
                title="Reset simulation back to real hardware battery"
              >
                Reset Sim
              </button>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
