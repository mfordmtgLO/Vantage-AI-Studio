import React, { useState } from 'react';
import { Shield, Lock, Sparkles, CheckCircle2, UserCheck, AlertTriangle, ExternalLink, ArrowRight, Building, Award, Mail, Cpu, Brain, Layers } from 'lucide-react';
import { isMikeFordAdmin, ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';
import { auth, provider } from '../services/firebase';
import { signInWithPopup } from 'firebase/auth';

interface AdminCommercialAccessGateProps {
  title: string;
  featureDescription: string;
  onUnlocked?: () => void;
}

export const AdminCommercialAccessGate: React.FC<AdminCommercialAccessGateProps> = ({
  title,
  featureDescription,
  onUnlocked
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const currentUser = auth.currentUser;
  const isAdmin = isMikeFordAdmin(currentUser);

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setErrorMsg(null);
    try {
      const result = await signInWithPopup(auth, provider);
      if (result.user && isMikeFordAdmin(result.user)) {
        if (onUnlocked) onUnlocked();
      } else {
        setErrorMsg(`Signed in as ${result.user?.email || 'user'}, but this backend feature is strictly restricted to Mike Ford (${ADMIN_PRIMARY_EMAIL}).`);
      }
    } catch (err: any) {
      console.error('Admin authentication error:', err);
      setErrorMsg(err.message || 'Google authentication failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="w-48 h-48 text-indigo-400" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Lock className="w-3.5 h-3.5" />
            <span>Proprietary Admin & Commercial Release Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            {title}
          </h2>
          <p className="text-slate-300 text-sm max-w-xl leading-relaxed">
            {featureDescription}
          </p>
        </div>
      </div>

      <div className="p-8 space-y-6">
        {/* Ownership & Commercial Release Policy */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Commercial Ownership & Version Upgrade Distribution</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            This module is part of the <strong>Vantage AI Studio-Suite</strong> core engineering back end. All Industry & Career morph architectures, deep guardrail training systems, and standalone plugin generation pipelines are authored and exclusively owned by <strong>{ADMIN_PRIMARY_NAME} (<span className="text-indigo-600 dark:text-indigo-400 font-mono">{ADMIN_PRIMARY_EMAIL}</span>)</strong> for periodic upgraded version releases (v2.0, v2.5, v3.0, etc.) and commercial client deployments.
          </p>
        </div>

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Authentication Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {currentUser ? (
              <span>Currently signed in as: <strong className="text-slate-800 dark:text-slate-200">{currentUser.email}</strong></span>
            ) : (
              <span>Sign in with authorized Google administrator credentials to unlock.</span>
            )}
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isAuthenticating}
            className="w-full sm:w-auto px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md hover:shadow-indigo-500/20 transition flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50"
          >
            {isAuthenticating ? (
              <>
                <Shield className="w-4 h-4 animate-spin" />
                <span>Verifying Admin Credentials...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Sign In as Mike Ford ({ADMIN_PRIMARY_EMAIL})</span>
              </>
            )}
          </button>
        </div>

        {/* Commercial Licensing & Custom Upgraded Releases Notice */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
              <Building className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Commercial Enterprise Licensing</span>
            </div>
            <p className="text-[11px] text-blue-700 dark:text-blue-400">
              Customized standalone plugin releases (2nd Brain, Voice Macro Router, Real Estate GeoMap) can be packaged for your enterprise domain.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/60 space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 dark:text-purple-300">
              <Mail className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Contact for Upgrades & Sales</span>
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-400">
              Inquire directly with Mike Ford at <strong className="font-mono">{ADMIN_PRIMARY_EMAIL}</strong> for custom version releases, API keys, and SLA deployments.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
