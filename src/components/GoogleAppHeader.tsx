import React from 'react';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { WorkspaceTab } from '../types';
import { Building2, ExternalLink, RefreshCw, CheckCircle2, Sparkles, ShieldCheck, Mail, Calendar, FileText, Table, CheckSquare, Users, Send } from 'lucide-react';

interface GoogleAppHeaderProps {
  appName: string;
  appDescription: string;
  appWebUrl: string;
  appIcon: React.ReactNode;
  itemCount?: number;
  itemLabel?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  activeTab?: WorkspaceTab;
  onNavigateTab?: (tab: WorkspaceTab) => void;
}

export const GoogleAppHeader: React.FC<GoogleAppHeaderProps> = ({
  appName,
  appDescription,
  appWebUrl,
  appIcon,
  itemCount,
  itemLabel,
  onRefresh,
  isRefreshing,
  activeTab,
  onNavigateTab,
}) => {
  const {
    pathway,
    isWorkspaceConnected,
    connectedWorkspaceEmail,
    setIsWorkspaceModalOpen,
    syncData,
    isSyncing,
    lastSynced,
    syncStatusMsg,
  } = useAccountPathway();

  const handleSync = async () => {
    if (onRefresh) {
      onRefresh();
    }
    await syncData();
  };

  const quickGoogleApps = [
    { id: 'gmail' as WorkspaceTab, label: 'Gmail', icon: Mail, color: 'text-red-500' },
    { id: 'calendar' as WorkspaceTab, label: 'Calendar', icon: Calendar, color: 'text-blue-500' },
    { id: 'drive' as WorkspaceTab, label: 'Drive & Docs', icon: FileText, color: 'text-amber-500' },
    { id: 'sheets' as WorkspaceTab, label: 'Sheets', icon: Table, color: 'text-emerald-500' },
    { id: 'tasks' as WorkspaceTab, label: 'Tasks', icon: CheckSquare, color: 'text-sky-500' },
    { id: 'contacts' as WorkspaceTab, label: 'Contacts', icon: Users, color: 'text-purple-500' },
    { id: 'drafts' as WorkspaceTab, label: 'Drafts', icon: Send, color: 'text-rose-500' },
  ];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 transition-colors">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: App Identity */}
        <div className="flex items-start gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 shadow-2xs">
            {appIcon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {appName}
              </h2>
              {itemCount !== undefined && itemLabel && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {itemCount} {itemLabel}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              {appDescription}
            </p>
          </div>
        </div>

        {/* Right: Pathway Status, Sync & Actions */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          {/* Active Pathway Badge */}
          <div
            onClick={() => setIsWorkspaceModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition ${
              pathway === 'workspace'
                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
            }`}
            title="Click to view or switch Google Account Pathway"
          >
            {pathway === 'workspace' ? (
              <>
                <Building2 className="w-3.5 h-3.5" />
                <span>Workspace Active</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Google Apps Mode (Free)</span>
              </>
            )}
          </div>

          {/* Sync / Refresh Button */}
          <button
            onClick={handleSync}
            disabled={isSyncing || isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition cursor-pointer shadow-2xs disabled:opacity-50"
            title={`Sync with ${pathway === 'workspace' ? 'Google Workspace' : 'Google Apps'}`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing || isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{isSyncing || isRefreshing ? 'Syncing...' : 'Sync Workspace'}</span>
          </button>

          {/* Connect Workspace Button (if not connected or for quick config) */}
          <button
            onClick={() => setIsWorkspaceModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-semibold transition cursor-pointer"
            title="Connect or configure Google Workspace account"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isWorkspaceConnected ? 'Workspace Account' : 'Workspace Login'}</span>
            <span className="sm:hidden">Workspace</span>
          </button>

          {/* Direct Launch in Real Google Web App */}
          <a
            href={appWebUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition shadow-xs cursor-pointer"
            title={`Open official ${appName} in a new tab (uses your signed-in Google account)`}
          >
            <span>Open in Web</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* 7 Google Apps Fast-Switching Quick Bar */}
      {onNavigateTab && (
        <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 shrink-0">
            Switch App:
          </span>
          {quickGoogleApps.map((qApp) => {
            const Icon = qApp.icon;
            const isCurrent = activeTab === qApp.id;
            return (
              <button
                key={qApp.id}
                onClick={() => onNavigateTab(qApp.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200/60 dark:border-slate-700'
                }`}
              >
                <Icon className={`w-3 h-3 ${isCurrent ? 'text-white' : qApp.color}`} />
                <span>{qApp.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Pathway Informational Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span>
            {pathway === 'workspace'
              ? `Connected via Google Workspace (${connectedWorkspaceEmail || 'Enterprise'}). Live multi-account sync active.`
              : 'Google Apps Free Pathway active. You have full innate access to all Google apps with your Google sign-in. No paid subscription needed.'}
          </span>
        </div>
        {lastSynced && (
          <span className="text-[10px] text-slate-400 font-medium">
            Last synced: {lastSynced}
          </span>
        )}
      </div>

      {syncStatusMsg && (
        <div className="p-2.5 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-200 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>{syncStatusMsg}</span>
        </div>
      )}
    </div>
  );
};
