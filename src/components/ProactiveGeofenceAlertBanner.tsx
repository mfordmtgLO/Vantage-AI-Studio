/**
 * @file ProactiveGeofenceAlertBanner.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * VANTAGE GEOMAP 3.0: PROACTIVE GEOFENCED INTEREST RADIUS NOTIFICATION BANNER
 */

import React, { useState } from 'react';
import { 
  Bell, 
  MapPin, 
  Sparkles, 
  X, 
  ShieldCheck, 
  ChevronRight, 
  Radio, 
  Smartphone,
  Eye,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign
} from 'lucide-react';
import { GeofencedRadiusAlert, generateProactiveGeofenceAlerts } from '../services/geomapCognitiveEngine';
import { formatUSD } from '../services/geomapMortgageEngine';

interface ProactiveGeofenceAlertBannerProps {
  onSelectAlertArea?: (areaName: string) => void;
}

export const ProactiveGeofenceAlertBanner: React.FC<ProactiveGeofenceAlertBannerProps> = ({
  onSelectAlertArea
}) => {
  const [alerts, setAlerts] = useState<GeofencedRadiusAlert[]>(generateProactiveGeofenceAlerts());
  const [activeAlertIndex, setActiveAlertIndex] = useState<number>(0);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isRadarActive, setIsRadarActive] = useState<boolean>(true);

  if (isDismissed || alerts.length === 0 || !isRadarActive) {
    return (
      <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Radio className="w-3.5 h-3.5 text-indigo-500" />
          <span>Geofenced Zero-Down Radar: <strong>{isRadarActive ? 'Monitoring Active Viewport' : 'Paused'}</strong></span>
        </div>
        <button
          onClick={() => {
            setIsDismissed(false);
            setIsRadarActive(true);
          }}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          Re-open Live Alerts
        </button>
      </div>
    );
  }

  const currentAlert = alerts[activeAlertIndex] || alerts[0];

  const handleNextAlert = () => {
    setActiveAlertIndex((prev) => (prev + 1) % alerts.length);
  };

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-emerald-500/15 border border-amber-400/30 dark:border-indigo-500/30 text-slate-900 dark:text-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs shrink-0 mt-0.5">
          <Radio className="w-4 h-4 animate-pulse" />
        </div>
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              Proactive Geofence Alert
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {currentAlert.timestamp}
            </span>
          </div>

          <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
            {currentAlert.title}
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {currentAlert.body}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {alerts.length > 1 && (
          <button
            onClick={handleNextAlert}
            className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition cursor-pointer"
          >
            Next ({activeAlertIndex + 1}/{alerts.length})
          </button>
        )}

        {onSelectAlertArea && (
          <button
            onClick={() => onSelectAlertArea(currentAlert.targetCityOrArea)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <span>Focus Area</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
          title="Dismiss Alert Banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
