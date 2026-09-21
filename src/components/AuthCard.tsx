import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Shield, Cpu, Zap, AlertCircle, RefreshCw, Smartphone, 
  ExternalLink, X, Globe, Copy, Check, UserCircle2, ArrowRight
} from 'lucide-react';
import { isMobileOrSafariDevice } from '../services/firebase';
import firebaseConfig from '../../firebase-applet-config.json';

interface AuthCardProps {
  onLogin: (method?: 'auto' | 'popup' | 'redirect') => void;
  onGuestLogin?: () => void;
  onCancelLogin: () => void;
  isLoggingIn: boolean;
  error: string | null;
  onClearError: () => void;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  onLogin,
  onGuestLogin,
  onCancelLogin,
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
      // Fallback
      setHasCopiedDomain(true);
      setTimeout(() => setHasCopiedDomain(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 text-center space-y-6 transition-colors">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Vantage AI Workspace
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Prompt engineer tasks, analyze data, and automate workflows with Gemini.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left py-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <Cpu className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Smart Prompting</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Cross-product AI workflows</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <Zap className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200">Safe Actions</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Explicit user confirmation</p>
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          isUnauthorizedDomain ? (
            <div className="bg-amber-50/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/80 rounded-xl p-4 text-left space-y-3 animate-in fade-in duration-200 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2.5">
                  <Globe className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                      Firebase Domain Authorization Required
                    </h4>
                    <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5 leading-snug">
                      Firebase Auth restricts logins to authorized domains. This app is running on a domain that hasn't been added yet.
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
                  Domain to Authorize:
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

              {/* 3 Step Instructions */}
              <div className="text-[11px] text-amber-800 dark:text-amber-300/90 space-y-1 bg-white/60 dark:bg-slate-900/40 p-2.5 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                <p className="font-semibold text-amber-900 dark:text-amber-200">How to fix in 30 seconds:</p>
                <ol className="list-decimal pl-4 space-y-0.5 text-[11px]">
                  <li>Open the Firebase Authentication Settings tab.</li>
                  <li>Scroll to <strong>Authorized domains</strong> and click <strong>Add domain</strong>.</li>
                  <li>Paste the domain above and click <strong>Save</strong>.</li>
                </ol>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <a
                  href={firebaseSettingsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer text-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Firebase Authorized Domains Settings</span>
                </a>

                {onGuestLogin && (
                  <button
                    type="button"
                    onClick={onGuestLogin}
                    className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                  >
                    <UserCircle2 className="w-3.5 h-3.5 text-blue-600" />
                    <span>Continue in Guest Mode (Explore Now)</span>
                    <ArrowRight className="w-3 h-3 text-slate-400" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl p-3.5 text-left space-y-2.5 animate-in fade-in duration-200">
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
              <button
                onClick={() => onLogin('redirect')}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Continue with Direct Sign-In (No Popups)</span>
              </button>
            </div>
          )
        )}

        {/* Main Sign-In Controls */}
        <div className="space-y-3 pt-1">
          <button
            onClick={() => onLogin('auto')}
            disabled={isLoggingIn}
            className="gsi-material-button w-full flex items-center justify-center py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 shadow-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium text-slate-700 dark:text-slate-200 disabled:opacity-75 cursor-pointer"
          >
            <div className="gsi-material-button-icon mr-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '20px', height: '20px', display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              {isLoggingIn ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                  <span>Signing in with Google... ({elapsedSeconds}s)</span>
                </>
              ) : (
                'Sign in with Google'
              )}
            </span>
          </button>

          {/* If sign-in is taking time, display fallback actions so user is never stuck */}
          {isLoggingIn && (
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-xl p-3 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {elapsedSeconds > 4
                  ? 'If the Google sign-in window did not appear, tap "Direct Sign-In" to authenticate directly:'
                  : 'Opening Google authentication window...'}
              </p>
              <div className="flex flex-col sm:flex-row items-stretch gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onLogin('redirect')}
                  className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-center transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Direct Sign-In</span>
                </button>
                <button
                  type="button"
                  onClick={onCancelLogin}
                  className="py-1.5 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-semibold text-center transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Direct Redirect Alternative for Mobile / Safari */}
          {!isLoggingIn && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => onLogin('redirect')}
                className="w-full text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 py-2 px-3 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/40 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Sign in with Direct Full-Page Redirect (Recommended for Safari & iPhone)</span>
              </button>
            </div>
          )}

          {/* Guest / Demo Mode option */}
          {!isLoggingIn && onGuestLogin && (
            <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onGuestLogin}
                className="w-full text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 py-2 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UserCircle2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Explore in Demo / Guest Mode</span>
              </button>
            </div>
          )}
        </div>

        {isMobile && (
          <div className="bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 rounded-xl p-2.5 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2 text-left">
            <Smartphone className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>
              <strong>iPhone / iPad Notice:</strong> Direct sign-in runs directly in your active tab without triggering iOS Safari pop-up blockers.
            </span>
          </div>
        )}

        <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          Secure Google account authentication
        </p>
      </div>
    </div>
  );
};


