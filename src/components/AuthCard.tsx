/**
 * @file AuthCard.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Master Authentication & Developer Sign-In Card
 * Provides direct 1-click administrator sign-in for Mike Ford, developer testing bypass,
 * and resilient Google OAuth with pop-up and direct redirect support.
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Shield, Cpu, Zap, AlertCircle, RefreshCw, Smartphone, 
  ExternalLink, X, Globe, Copy, Check, UserCircle2, ArrowRight,
  ShieldCheck, Wrench, Key, Lock, CheckCircle2
} from 'lucide-react';
import { isMobileOrSafariDevice } from '../services/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthCardProps {
  onLogin: (method?: 'auto' | 'popup' | 'redirect') => void;
  onDirectAdminLogin?: () => void;
  onGuestLogin?: () => void;
  onCancelLogin: () => void;
  onBackToPublic?: () => void;
  isLoggingIn: boolean;
  error: string | null;
  onClearError: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onLogin,
  onDirectAdminLogin,
  onGuestLogin,
  onCancelLogin,
  onBackToPublic,
  isLoggingIn,
  error,
  onClearError
}) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [hasCopiedDomain, setHasCopiedDomain] = useState<boolean>(false);
  const isMobile = isMobileOrSafariDevice();
  const currentHostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const isUnauthorizedDomain = error === 'auth/unauthorized-domain' || (error && error.includes('unauthorized-domain'));
  const firebaseSettingsUrl = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings`;

  useEffect(() => {
    let timer: any;
    if (isLoggingIn) {
      setElapsedSeconds(0);
      timer = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isLoggingIn]);

  const handleCopyDomain = async () => {
    if (!currentHostname) return;
    try {
      await navigator.clipboard.writeText(currentHostname);
      setHasCopiedDomain(true);
      setTimeout(() => setHasCopiedDomain(false), 2500);
    } catch {
      setHasCopiedDomain(true);
      setTimeout(() => setHasCopiedDomain(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 text-center space-y-5 transition-colors">
        
        {/* Brand Icon & Heading */}
        <div className="space-y-3">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25 text-white">
            <Sparkles className="w-7 h-7 animate-pulse" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
              Vantage AI Workspace
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Developer Dashboard &amp; Master Administration Gateway
            </p>
          </div>
        </div>

        {/* Highlighted Direct Developer & Master Admin Sign-In Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/90 to-purple-950/80 border border-blue-500/40 text-left space-y-2.5 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-black text-white tracking-wide uppercase">
                Direct Master Admin &amp; Dev Access
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[9px] font-black border border-emerald-500/40">
              1-CLICK BYPASS
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">
            Immediate direct access to the full back-end dashboard, 50-state sweeps, API usage metrics, and lead discovery tools without third-party OAuth pop-up blockers.
          </p>

          <div className="space-y-2 pt-1">
            {onDirectAdminLogin && (
              <button
                type="button"
                onClick={onDirectAdminLogin}
                className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Sign In as Master Admin (Mike Ford)</span>
                <ArrowRight className="w-3.5 h-3.5 ml-auto text-slate-900" />
              </button>
            )}

            {onGuestLogin && (
              <button
                type="button"
                onClick={onGuestLogin}
                className="w-full py-2 px-3 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-bold rounded-xl text-xs border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                <span>Developer Sandbox Mode (Guest Explorer)</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          isUnauthorizedDomain ? (
            <div className="bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-2xl p-4 text-left space-y-3 animate-in fade-in duration-200 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Firebase Domain Authorization Info
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-snug">
                      This preview domain has not been added to Firebase Authorized Domains. You can sign in immediately using <strong>Direct Master Admin</strong> above!
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClearError}
                  className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 p-0.5"
                  title="Dismiss message"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Current Domain with Copy button */}
              <div className="bg-amber-100/60 dark:bg-amber-900/40 rounded-lg p-2.5 border border-amber-200 dark:border-amber-800 space-y-1.5">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300">
                  Domain to Authorize in Firebase:
                </div>
                <div className="flex items-center justify-between gap-2">
                  <code className="text-[11px] font-mono font-medium text-slate-800 dark:text-slate-200 break-all select-all">
                    {currentHostname || 'localhost'}
                  </code>
                  <button
                    type="button"
                    onClick={handleCopyDomain}
                    className="shrink-0 flex items-center gap-1 px-2 py-1 rounded bg-white dark:bg-slate-800 hover:bg-amber-50 text-[11px] font-medium text-slate-700 dark:text-slate-200 border border-amber-300 dark:border-amber-700 transition cursor-pointer"
                  >
                    {hasCopiedDomain ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {onDirectAdminLogin && (
                  <button
                    type="button"
                    onClick={onDirectAdminLogin}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-black shadow-xs transition cursor-pointer text-center"
                  >
                    ⚡ Bypass with Direct Master Admin (Mike Ford)
                  </button>
                )}

                <a
                  href={firebaseSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer text-center border border-slate-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Firebase Authorized Domains</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl p-3.5 text-left space-y-2.5 animate-in fade-in duration-200">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-snug font-medium">
                    {error}
                  </p>
                </div>
                <button
                  onClick={onClearError}
                  className="text-amber-500 hover:text-amber-700 dark:hover:text-amber-200 p-0.5"
                  title="Dismiss message"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              
              {onDirectAdminLogin && (
                <button
                  onClick={onDirectAdminLogin}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-black shadow-xs transition cursor-pointer"
                >
                  ⚡ Direct Sign-In (Bypass OAuth)
                </button>
              )}
            </div>
          )
        )}

        {/* Standard Google Sign-In Controls */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 uppercase tracking-wider justify-center">
            <span className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
            <span>Or Sign In with Google</span>
            <span className="w-12 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          <button
            onClick={() => onLogin('auto')}
            disabled={isLoggingIn}
            className="gsi-material-button w-full flex items-center justify-center py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-slate-700 dark:text-slate-200 disabled:opacity-75 cursor-pointer"
          >
            <div className="gsi-material-button-icon mr-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '18px', height: '18px', display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents text-xs font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Connecting Google Account... ({elapsedSeconds}s)</span>
                </>
              ) : (
                'Sign in with Google Account'
              )}
            </span>
          </button>

          {/* If sign-in is taking time, display instant fallback actions */}
          {isLoggingIn && (
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-slate-700 dark:text-slate-200 font-semibold">
                <span>Connecting to Google OAuth...</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{elapsedSeconds}s</span>
              </div>
              <div className="flex flex-col gap-1.5 pt-0.5">
                {onDirectAdminLogin && (
                  <button
                    type="button"
                    onClick={onDirectAdminLogin}
                    className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Direct Master Admin Sign-In (Instant)</span>
                  </button>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onLogin('redirect')}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold text-[11px] text-center transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Full-Page Redirect</span>
                  </button>
                  <button
                    type="button"
                    onClick={onCancelLogin}
                    className="py-1.5 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-[11px] text-center transition cursor-pointer shrink-0"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Direct Redirect Alternative for Mobile / Safari */}
          {!isLoggingIn && (
            <div className="pt-0.5">
              <button
                type="button"
                onClick={() => onLogin('redirect')}
                className="w-full text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-1.5 px-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3 h-3" />
                <span>Direct Full-Page Redirect (For Safari &amp; Mobile)</span>
              </button>
            </div>
          )}

          {/* Back to Public Link */}
          {onBackToPublic && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onBackToPublic}
                className="w-full text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>← Back to Public Website</span>
              </button>
            </div>
          )}
        </div>

        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
          <Shield className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          <span>Vantage Enterprise Security • Copyright &copy; Mike Ford</span>
        </p>
      </div>
    </div>
  );
};
