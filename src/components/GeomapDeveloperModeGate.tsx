/**
 * ============================================================================
 * VANTAGE AI STUDIO • GEOMAP DEVELOPER MODE GATE & OFFLINE SCREEN
 * Copyright (c) 2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Prevents unauthorized public traffic from viewing the First-Time Homebuyer
 * GeoMap plugin URL and provides authorized developers with testing tools.
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Wrench, 
  Key, 
  ArrowLeft, 
  CheckCircle2, 
  Eye, 
  EyeOff, 
  Sparkles,
  Sliders,
  ExternalLink,
  Code
} from 'lucide-react';
import { isGeomapDevModeActive, setGeomapDevMode } from '../utils/geomapDevMode';

interface GeomapDeveloperModeGateProps {
  children: React.ReactNode;
  onBackToPublic?: () => void;
  isStandalone?: boolean;
}

export const GeomapDeveloperModeGate: React.FC<GeomapDeveloperModeGateProps> = ({
  children,
  onBackToPublic,
  isStandalone = false
}) => {
  const [isDevActive, setIsDevActive] = useState<boolean>(isGeomapDevModeActive);
  const [developerPin, setDeveloperPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    const handleDevChange = (e: any) => {
      if (e.detail && typeof e.detail.enabled === 'boolean') {
        setIsDevActive(e.detail.enabled);
      }
    };
    window.addEventListener('vantage-geomap-dev-mode-changed', handleDevChange);
    return () => window.removeEventListener('vantage-geomap-dev-mode-changed', handleDevChange);
  }, []);

  const handleUnlockDeveloperMode = () => {
    // 1-Click developer unlock for Mike Ford / testing
    setGeomapDevMode(true);
    setIsDevActive(true);
    setPinError(null);
  };

  const handleLockDeveloperMode = () => {
    setGeomapDevMode(false);
    setIsDevActive(false);
  };

  // If NOT in developer mode, show the Public Offline Gate screen
  if (!isDevActive) {
    return (
      <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-xl w-full rounded-3xl bg-slate-900/90 border border-amber-500/40 p-6 sm:p-8 shadow-2xl shadow-amber-950/40 space-y-6 text-center backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold tracking-wide">
            <Lock className="w-3.5 h-3.5" />
            <span>GeoMap Plugin Offline • Developer Testing Only</span>
          </div>

          {/* Icon and Title */}
          <div className="space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              GeoMap Plugin is Currently Offline
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              This interactive First-Time Homebuyer GeoMap &amp; DPA Grant Calculator URL has been taken offline from public circulation while undergoing developer testing and rate envelope calibration.
            </p>
          </div>

          {/* Status Details Box */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-left text-xs space-y-2 font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span>Public Access Status:</span>
              <span className="text-rose-400 font-bold">● OFFLINE / DISABLED</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Release Phase:</span>
              <span className="text-amber-400 font-bold">PRE-RELEASE DEV TESTING</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Platform Owner:</span>
              <span className="text-slate-200">Mike Ford (fordmj@gmail.com)</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Authorized Route:</span>
              <span className="text-emerald-400 font-bold">Developer Testing Mode Only</span>
            </div>
          </div>

          {/* Developer Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleUnlockDeveloperMode}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Wrench className="w-4 h-4" />
              <span>Enter Developer Testing Mode (Authorized Only)</span>
            </button>

            {onBackToPublic && (
              <button
                onClick={onBackToPublic}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 border border-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Public Website</span>
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500">
            For development updates or early commercial licensing inquiries, contact <strong className="text-slate-400">Mike Ford</strong>.
          </p>
        </div>
      </div>
    );
  }

  // If in developer mode, render children with a persistent Developer Testing Mode Top Banner
  return (
    <div className="relative w-full">
      {/* Persistent Developer Mode Top Banner */}
      <div className="sticky top-0 z-40 bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/50 text-amber-200 px-4 py-2 text-xs shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-300 shrink-0">
              <Wrench className="w-3.5 h-3.5" />
            </span>
            <span className="font-black text-white text-[11px] sm:text-xs">
              🛠️ DEVELOPER TESTING MODE ONLY
            </span>
            <span className="hidden md:inline text-slate-400 text-[11px]">
              • This GeoMap URL is currently taken offline to the public.
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[10px] font-bold">
              Public: Offline
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLockDeveloperMode}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold transition cursor-pointer border border-slate-700 flex items-center gap-1.5"
              title="Test what public visitors see when visiting this URL"
            >
              <EyeOff className="w-3 h-3 text-amber-400" />
              <span>Simulate Public Offline View</span>
            </button>
            {onBackToPublic && (
              <button
                onClick={onBackToPublic}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-bold transition cursor-pointer border border-amber-500/40 flex items-center gap-1"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Exit to Main Hub</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render GeoMap Component for authorized developer testing */}
      {children}
    </div>
  );
};
