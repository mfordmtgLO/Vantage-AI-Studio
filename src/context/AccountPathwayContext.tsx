import React, { createContext, useContext, useState, useEffect } from 'react';
import { AccountPathway } from '../types';
import {
  connectGoogleWorkspace,
  disconnectGoogleWorkspace as disconnectService,
  isWorkspaceConnected as checkIsWorkspaceConnected,
  getConnectedWorkspaceEmail
} from '../services/firebase';

interface AccountPathwayContextType {
  pathway: AccountPathway;
  setPathway: (p: AccountPathway) => void;
  isWorkspaceConnected: boolean;
  connectedWorkspaceEmail: string | null;
  connectWorkspace: () => Promise<boolean>;
  disconnectWorkspace: () => void;
  isSyncing: boolean;
  lastSynced: string | null;
  syncData: () => Promise<void>;
  isWorkspaceModalOpen: boolean;
  setIsWorkspaceModalOpen: (open: boolean) => void;
  syncStatusMsg: string | null;
}

const AccountPathwayContext = createContext<AccountPathwayContextType | undefined>(undefined);

export const AccountPathwayProvider: React.FC<{ children: React.ReactNode; onSyncTrigger?: () => Promise<void> }> = ({
  children,
  onSyncTrigger
}) => {
  const [pathway, setPathwayState] = useState<AccountPathway>(() => {
    try {
      const saved = localStorage.getItem('vantage_account_pathway');
      if (saved === 'workspace' || saved === 'google_apps') return saved;
    } catch {}
    return 'google_apps'; // Default to Google Apps (Free / standard Google Account)
  });

  const [isWorkspaceConnected, setIsWorkspaceConnected] = useState<boolean>(() => {
    return checkIsWorkspaceConnected();
  });

  const [connectedWorkspaceEmail, setConnectedWorkspaceEmail] = useState<string | null>(() => {
    return getConnectedWorkspaceEmail();
  });

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<string | null>(() => {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });
  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState<boolean>(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  const setPathway = (p: AccountPathway) => {
    setPathwayState(p);
    try {
      localStorage.setItem('vantage_account_pathway', p);
    } catch {}
  };

  const syncData = async () => {
    setIsSyncing(true);
    setSyncStatusMsg(null);
    try {
      if (onSyncTrigger) {
        await onSyncTrigger();
      } else {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
      const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setLastSynced(nowTime);
      setSyncStatusMsg(
        pathway === 'google_apps'
          ? `Synced with Google Apps at ${nowTime} (Standard Free Account)`
          : `Synced with Google Workspace at ${nowTime} (Live Enterprise Sync)`
      );
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } catch (err: any) {
      setSyncStatusMsg('Sync encountered an issue: ' + (err?.message || 'Unknown error'));
      setTimeout(() => setSyncStatusMsg(null), 5000);
    } finally {
      setIsSyncing(false);
    }
  };

  const connectWorkspace = async (): Promise<boolean> => {
    try {
      const res = await connectGoogleWorkspace();
      if (res) {
        setIsWorkspaceConnected(true);
        setConnectedWorkspaceEmail(res.user.email || null);
        setPathway('workspace');
        await syncData();
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Failed to connect Google Workspace:', err);
      throw err;
    }
  };

  const disconnectWorkspace = () => {
    disconnectService();
    setIsWorkspaceConnected(false);
    setConnectedWorkspaceEmail(null);
    setPathway('google_apps');
  };

  return (
    <AccountPathwayContext.Provider
      value={{
        pathway,
        setPathway,
        isWorkspaceConnected,
        connectedWorkspaceEmail,
        connectWorkspace,
        disconnectWorkspace,
        isSyncing,
        lastSynced,
        syncData,
        isWorkspaceModalOpen,
        setIsWorkspaceModalOpen,
        syncStatusMsg,
      }}
    >
      {children}
    </AccountPathwayContext.Provider>
  );
};

export const useAccountPathway = () => {
  const context = useContext(AccountPathwayContext);
  if (!context) {
    throw new Error('useAccountPathway must be used within an AccountPathwayProvider');
  }
  return context;
};
