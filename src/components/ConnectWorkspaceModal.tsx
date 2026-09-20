import React, { useState } from 'react';
import { useAccountPathway } from '../context/AccountPathwayContext';
import {
  Sparkles,
  CheckCircle2,
  Building2,
  UserCheck,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  X,
  AlertTriangle,
  Loader2,
  Mail,
  Calendar,
  FileText,
  Table,
  CheckSquare,
  Users
} from 'lucide-react';

export const ConnectWorkspaceModal: React.FC = () => {
  const {
    pathway,
    setPathway,
    isWorkspaceConnected,
    connectedWorkspaceEmail,
    connectWorkspace,
    disconnectWorkspace,
    isWorkspaceModalOpen,
    setIsWorkspaceModalOpen,
    syncData,
    isSyncing
  } = useAccountPathway();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isWorkspaceModalOpen) return null;

  const handleConnect = async () => {
    setLoading(true);
    setError(null);
    try {
      await connectWorkspace();
      setIsWorkspaceModalOpen(false);
    } catch (err: any) {
      setError(err?.message || 'Could not connect to Google Workspace. You can continue using Google Apps mode freely.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWorkspace();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/30 dark:from-slate-800/50 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Dual Google Apps & Workspace Pathway
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Seamless free access for everyone + optional enterprise sync
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsWorkspaceModalOpen(false)}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {error && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold mb-0.5">Notice</p>
                <p>{error}</p>
              </div>
            </div>
          )}

          {/* Active Mode Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Option 1: Google Apps (Standard / Free) */}
            <div
              onClick={() => setPathway('google_apps')}
              className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                pathway === 'google_apps'
                  ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/30 dark:border-blue-500 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Active for All Users
                  </span>
                  {pathway === 'google_apps' && (
                    <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Google Apps (Free)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Innately included with your Google sign-in. Use Gmail, Calendar, Drive, Docs, Sheets, Tasks, and Contacts with zero paid subscription.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>No extra login required</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">100% Free</span>
              </div>
            </div>

            {/* Option 2: Google Workspace (Enterprise / Paid) */}
            <div
              onClick={() => {
                if (isWorkspaceConnected) setPathway('workspace');
              }}
              className={`p-4 rounded-2xl border-2 transition flex flex-col justify-between ${
                pathway === 'workspace'
                  ? 'border-indigo-600 bg-indigo-50/40 dark:bg-indigo-950/30 dark:border-indigo-500 shadow-xs cursor-pointer'
                  : isWorkspaceConnected
                  ? 'border-slate-200 dark:border-slate-800 hover:border-slate-300 cursor-pointer'
                  : 'border-slate-200 dark:border-slate-800 opacity-90'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    {isWorkspaceConnected ? 'Connected' : 'Enterprise'}
                  </span>
                  {pathway === 'workspace' && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Google Workspace
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  For users with an organizational Google Workspace account (e.g. company domain). Syncs live API data across enterprise accounts.
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                <span>{isWorkspaceConnected ? connectedWorkspaceEmail || 'Account Linked' : 'Requires Workspace Auth'}</span>
                <span className="font-semibold text-indigo-600 dark:text-indigo-400">Optional</span>
              </div>
            </div>
          </div>

          {/* Innate Google Apps Inclusion Breakdown */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Apps Innately Available to All Users (No Subscription Needed):
            </h5>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'Gmail & Drafts', icon: Mail, color: 'text-red-500' },
                { name: 'Google Calendar', icon: Calendar, color: 'text-blue-500' },
                { name: 'Google Drive & Docs', icon: FileText, color: 'text-amber-500' },
                { name: 'Google Sheets', icon: Table, color: 'text-emerald-500' },
                { name: 'Google Tasks', icon: CheckSquare, color: 'text-blue-600' },
                { name: 'Google Contacts', icon: Users, color: 'text-indigo-500' },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300">
                    <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                    <span className="font-medium truncate">{item.name}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Workspace Connection Actions */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Google Workspace Login & Authorization
                </h5>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Have a paid Google Workspace account? Connect it here to unlock live API syncing.
                </p>
              </div>
            </div>

            {isWorkspaceConnected ? (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-indigo-950 dark:text-indigo-200 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Connected as: <strong className="font-semibold">{connectedWorkspaceEmail || 'Workspace User'}</strong></span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => syncData()}
                    disabled={isSyncing}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 transition cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                    <span>Sync Workspace</span>
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="flex-1 sm:flex-initial px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="pt-2">
                <button
                  onClick={handleConnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connecting to Google Workspace...</span>
                    </>
                  ) : (
                    <>
                      <Building2 className="w-4 h-4" />
                      <span>Sign In with Google Workspace Account</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => syncData()}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Workspace Data'}</span>
            </button>
          </div>

          <button
            onClick={() => setIsWorkspaceModalOpen(false)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
