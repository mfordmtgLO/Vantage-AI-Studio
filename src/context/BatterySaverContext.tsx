/**
 * ============================================================================
 * VANTAGE AI ECOSYSTEM • BATTERY STATUS & POWER MANAGEMENT CONTEXT
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Implements Web Battery Status API (navigator.getBattery) with real-time
 * event listeners (levelchange, chargingchange). Detects low power states
 * (<=20% battery while discharging) and provides dynamic throttling for
 * background AI polling, agent telemetry, and cognitive sync intervals.
 * ============================================================================
 */

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';

// Battery Status API TypeScript Interface
export interface BatteryManager extends EventTarget {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number; // 0.0 to 1.0
  onchargingchange: ((this: BatteryManager, ev: Event) => any) | null;
  onlevelchange: ((this: BatteryManager, ev: Event) => any) | null;
  onchargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
  ondischargingtimechange: ((this: BatteryManager, ev: Event) => any) | null;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?: () => Promise<BatteryManager>;
}

export interface BatterySaverContextType {
  batterySupported: boolean;
  batteryLevel: number; // 0 to 100 percentage
  isCharging: boolean;
  isLowPowerDetected: boolean;
  isBatterySaverActive: boolean;
  pollingMultiplier: number; // 1.0 (normal) or 3.0 (throttled battery saver)
  isSimulatedLowPower: boolean;
  toggleBatterySaver: () => void;
  setBatterySaverActive: (active: boolean) => void;
  toggleSimulateLowPower: () => void;
  getAdjustedInterval: (baseIntervalMs: number) => number;
}

const BATTERY_SAVER_STORAGE_KEY = 'vantage_battery_saver_active_v1';
const SIMULATED_LOW_POWER_STORAGE_KEY = 'vantage_simulated_low_power_v1';
const LOW_POWER_THRESHOLD = 0.20; // 20% battery level
const BATTERY_SAVER_THROTTLE_FACTOR = 3.0; // 3x slower polling frequency

const BatterySaverContext = createContext<BatterySaverContextType | undefined>(undefined);

export const BatterySaverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batterySupported, setBatterySupported] = useState<boolean>(false);
  const [batteryLevel, setBatteryLevel] = useState<number>(100);
  const [isCharging, setIsCharging] = useState<boolean>(true);
  const [isSimulatedLowPower, setIsSimulatedLowPower] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(SIMULATED_LOW_POWER_STORAGE_KEY) === 'true';
      }
    } catch {}
    return false;
  });

  const [isBatterySaverActive, setIsBatterySaverActiveState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(BATTERY_SAVER_STORAGE_KEY);
        if (saved !== null) {
          return saved === 'true';
        }
      }
    } catch {}
    return false;
  });

  // Calculate if the device is running low on power (or simulated)
  const isLowPowerDetected = useMemo(() => {
    if (isSimulatedLowPower) return true;
    // Low power when <= 20% and not charging
    return batteryLevel <= LOW_POWER_THRESHOLD * 100 && !isCharging;
  }, [batteryLevel, isCharging, isSimulatedLowPower]);

  // If low power is detected and user hasn't explicitly disabled it, automatically enable battery saver
  useEffect(() => {
    if (isLowPowerDetected) {
      try {
        const userOverride = localStorage.getItem(BATTERY_SAVER_STORAGE_KEY);
        // Only auto-enable if not explicitly turned off
        if (userOverride === null || userOverride === 'true') {
          setIsBatterySaverActiveState(true);
        }
      } catch {
        setIsBatterySaverActiveState(true);
      }
    }
  }, [isLowPowerDetected]);

  // Hook into Navigator Battery Status API
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const nav = navigator as NavigatorWithBattery;
    if (typeof nav.getBattery === 'function') {
      setBatterySupported(true);
      let batteryRef: BatteryManager | null = null;

      const handleBatteryUpdate = () => {
        if (!batteryRef) return;
        const pct = Math.round(batteryRef.level * 100);
        const charging = batteryRef.charging;
        setBatteryLevel(pct);
        setIsCharging(charging);

        // Notify global listeners
        window.dispatchEvent(new CustomEvent('vantage:battery-status-changed', {
          detail: { level: pct, charging }
        }));
      };

      nav.getBattery()
        .then((battery) => {
          batteryRef = battery;
          handleBatteryUpdate();

          battery.addEventListener('levelchange', handleBatteryUpdate);
          battery.addEventListener('chargingchange', handleBatteryUpdate);
        })
        .catch((err) => {
          console.warn('Battery Status API initialization notice:', err);
          setBatterySupported(false);
        });

      return () => {
        if (batteryRef) {
          batteryRef.removeEventListener('levelchange', handleBatteryUpdate);
          batteryRef.removeEventListener('chargingchange', handleBatteryUpdate);
        }
      };
    } else {
      setBatterySupported(false);
    }
  }, []);

  const setBatterySaverActive = useCallback((active: boolean) => {
    setIsBatterySaverActiveState(active);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(BATTERY_SAVER_STORAGE_KEY, active ? 'true' : 'false');
        window.dispatchEvent(new CustomEvent('vantage:battery-saver-changed', {
          detail: { active, multiplier: active ? BATTERY_SAVER_THROTTLE_FACTOR : 1.0 }
        }));
      }
    } catch {}
  }, []);

  const toggleBatterySaver = useCallback(() => {
    setBatterySaverActive(!isBatterySaverActive);
  }, [isBatterySaverActive, setBatterySaverActive]);

  const toggleSimulateLowPower = useCallback(() => {
    setIsSimulatedLowPower((prev) => {
      const next = !prev;
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem(SIMULATED_LOW_POWER_STORAGE_KEY, next ? 'true' : 'false');
          if (next) {
            setBatteryLevel(14); // Simulate 14%
            setIsCharging(false);
            setBatterySaverActive(true);
          } else {
            setBatteryLevel(92);
            setIsCharging(true);
          }
        }
      } catch {}
      return next;
    });
  }, [setBatterySaverActive]);

  const pollingMultiplier = isBatterySaverActive ? BATTERY_SAVER_THROTTLE_FACTOR : 1.0;

  const getAdjustedInterval = useCallback((baseIntervalMs: number): number => {
    return Math.round(baseIntervalMs * (isBatterySaverActive ? BATTERY_SAVER_THROTTLE_FACTOR : 1.0));
  }, [isBatterySaverActive]);

  return (
    <BatterySaverContext.Provider
      value={{
        batterySupported,
        batteryLevel: isSimulatedLowPower ? 14 : batteryLevel,
        isCharging: isSimulatedLowPower ? false : isCharging,
        isLowPowerDetected,
        isBatterySaverActive,
        pollingMultiplier,
        isSimulatedLowPower,
        toggleBatterySaver,
        setBatterySaverActive,
        toggleSimulateLowPower,
        getAdjustedInterval
      }}
    >
      {children}
    </BatterySaverContext.Provider>
  );
};

export const useBatterySaver = (): BatterySaverContextType => {
  const context = useContext(BatterySaverContext);
  if (!context) {
    // Fallback safe values if used outside of provider
    return {
      batterySupported: false,
      batteryLevel: 100,
      isCharging: true,
      isLowPowerDetected: false,
      isBatterySaverActive: false,
      pollingMultiplier: 1.0,
      isSimulatedLowPower: false,
      toggleBatterySaver: () => {},
      setBatterySaverActive: () => {},
      toggleSimulateLowPower: () => {},
      getAdjustedInterval: (ms: number) => ms
    };
  }
  return context;
};

/**
 * Custom Hook to compute dynamically adjusted interval based on Battery Saver state
 */
export function useAdjustedPollingInterval(baseIntervalMs: number): number {
  const { isBatterySaverActive } = useBatterySaver();
  return isBatterySaverActive ? Math.round(baseIntervalMs * BATTERY_SAVER_THROTTLE_FACTOR) : baseIntervalMs;
}
