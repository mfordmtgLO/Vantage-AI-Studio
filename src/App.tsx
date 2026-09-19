/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WorkspaceTab } from './types';
import { initAuth, googleSignIn, logout } from './services/firebase';
import { AuthCard } from './components/AuthCard';
import { Navbar } from './components/Navbar';
import { WorkspaceHub } from './components/WorkspaceHub';
import { GlobalVoiceRecorderModal } from './components/GlobalVoiceRecorderModal';
import { VoiceExecutionSnackbar } from './components/VoiceExecutionSnackbar';
import { ImportWorkflowModal } from './components/ImportWorkflowModal';
import { ShareableWorkflowData } from './components/ShareWorkflowModal';
import { MobileAdminDashboard } from './components/MobileAdminDashboard';
import { User } from 'firebase/auth';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('studio');
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isMobileAdminMode, setIsMobileAdminMode] = useState<boolean>(() => {
    return new URLSearchParams(window.location.search).get('mobile_admin') === 'true';
  });

  // Quick Undo and Voice Execution State
  const [activeVoiceWorkflow, setActiveVoiceWorkflow] = useState<string | null>(null);
  const [snackbarWorkflow, setSnackbarWorkflow] = useState<string | null>(null);
  const [revertedWorkflow, setRevertedWorkflow] = useState<string | null>(null);

  // Shared workflow import state from URL query
  const [pendingImportWorkflow, setPendingImportWorkflow] = useState<ShareableWorkflowData | null>(null);

  useEffect(() => {
    // Check if a shared workflow query is present in the URL
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const importParam = urlParams.get('workflow_import');
      if (importParam) {
        const decoded = JSON.parse(decodeURIComponent(atob(importParam)));
        if (decoded && decoded.steps) {
          setPendingImportWorkflow(decoded);
          // Clean URL without refresh
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    } catch (err) {
      console.warn('Could not parse workflow_import param:', err);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    setNeedsAuth(true);
  };

  const handleExecuteVoiceWorkflow = (workflowName: string) => {
    setActiveVoiceWorkflow(workflowName);
    setSnackbarWorkflow(workflowName);
    setActiveTab('orchestrator');
  };

  const handleQuickUndo = () => {
    if (snackbarWorkflow) {
      setRevertedWorkflow(snackbarWorkflow);
      setSnackbarWorkflow(null);
    }
  };

  if (isMobileAdminMode) {
    return (
      <ThemeProvider>
        <MobileAdminDashboard 
          onOpenDesktopView={() => {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, document.title, newUrl);
            setIsMobileAdminMode(false);
          }} 
        />
      </ThemeProvider>
    );
  }

  if (needsAuth) {
    return (
      <ThemeProvider>
        <AuthCard onLogin={handleLogin} isLoggingIn={isLoggingIn} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          user={user}
          onLogout={handleLogout}
          onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
        />
        <main>
          <WorkspaceHub
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            initialWorkflowName={activeVoiceWorkflow}
            revertedWorkflowName={revertedWorkflow}
            onClearRevert={() => setRevertedWorkflow(null)}
            onExecuteVoiceWorkflow={handleExecuteVoiceWorkflow}
            importedWorkflow={pendingImportWorkflow}
            onClearImport={() => setPendingImportWorkflow(null)}
          />
        </main>

        <GlobalVoiceRecorderModal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          onRunWorkflowCommand={(workflowName) => {
            handleExecuteVoiceWorkflow(workflowName);
          }}
        />

        {snackbarWorkflow && (
          <VoiceExecutionSnackbar
            workflowName={snackbarWorkflow}
            onUndo={handleQuickUndo}
            onDismiss={() => setSnackbarWorkflow(null)}
          />
        )}

        {pendingImportWorkflow && (
          <ImportWorkflowModal
            workflowData={pendingImportWorkflow}
            onImport={(importedData) => {
              setPendingImportWorkflow(importedData);
              setActiveTab('orchestrator');
            }}
            onClose={() => setPendingImportWorkflow(null)}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
