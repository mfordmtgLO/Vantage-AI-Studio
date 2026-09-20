/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { WorkspaceTab } from './types';
import { initAuth, googleSignIn, logout, checkRedirectSignIn } from './services/firebase';
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
import { AccountPathwayProvider } from './context/AccountPathwayContext';
import { MemoryProvider } from './context/MemoryContext';
import { ConnectWorkspaceModal } from './components/ConnectWorkspaceModal';
import { RememberThisModal } from './components/RememberThisModal';
import { RememberKnowledgeBaseModal } from './components/RememberKnowledgeBaseModal';
import { AgentMemoryExplorerModal } from './components/AgentMemoryExplorerModal';
import { GuardrailsModal } from './components/GuardrailsModal';
import { safeAtob } from './utils/base64';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
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
        try {
          const decoded = JSON.parse(decodeURIComponent(safeAtob(importParam)));
          if (decoded && decoded.steps) {
            setPendingImportWorkflow(decoded);
          }
        } catch (decodeErr) {
          console.warn('Invalid base64 workflow import payload:', decodeErr);
        }
        // Clean URL without refresh
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    } catch (err) {
      console.warn('Could not parse workflow_import param:', err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      try {
        const redirectResult = await checkRedirectSignIn();
        if (redirectResult && isMounted) {
          setUser(redirectResult.user);
          setNeedsAuth(false);
          return;
        }
      } catch (err: any) {
        console.warn('Redirect sign-in inspection:', err);
        if (isMounted) {
          setAuthError(err?.message || 'Error processing Google sign-in redirect.');
        }
      }

      if (!isMounted) return;

      const unsubscribe = initAuth(
        (currentUser) => {
          if (isMounted) {
            setUser(currentUser);
            setNeedsAuth(false);
          }
        },
        () => {
          if (isMounted) {
            setUser(null);
            setNeedsAuth(true);
          }
        }
      );

      return unsubscribe;
    }

    const authPromise = initializeAuth();

    return () => {
      isMounted = false;
      authPromise.then((unsub) => {
        if (typeof unsub === 'function') unsub();
      });
    };
  }, []);

  const handleLogin = async (method: 'auto' | 'popup' | 'redirect' = 'auto') => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn({ method });
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err: any) {
      console.error('Login failed:', err);
      let message = err?.message || 'Google sign-in could not be completed.';
      if (err?.code === 'auth/popup-timeout') {
        message = 'Safari or your browser took too long to open the sign-in pop-up. Tap "Continue with Direct Sign-In" below to sign in directly.';
      } else if (err?.code === 'auth/popup-blocked') {
        message = 'Safari blocked the sign-in pop-up window. Tap "Continue with Direct Sign-In" below to sign in without pop-ups.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        message = 'The sign-in window was closed before completing. Please try again.';
      } else if (err?.code === 'auth/cancelled-popup-request') {
        message = 'The sign-in request was cancelled. Please try again.';
      }
      setAuthError(message);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCancelLogin = () => {
    setIsLoggingIn(false);
    setAuthError(null);
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
        <AccountPathwayProvider>
          <MobileAdminDashboard 
            onOpenDesktopView={() => {
              const newUrl = window.location.pathname;
              window.history.replaceState({}, document.title, newUrl);
              setIsMobileAdminMode(false);
            }} 
          />
          <ConnectWorkspaceModal />
        </AccountPathwayProvider>
      </ThemeProvider>
    );
  }

  if (needsAuth) {
    return (
      <ThemeProvider>
        <AuthCard
          onLogin={handleLogin}
          onCancelLogin={handleCancelLogin}
          isLoggingIn={isLoggingIn}
          error={authError}
          onClearError={() => setAuthError(null)}
        />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <AccountPathwayProvider>
        <MemoryProvider>
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

            <ConnectWorkspaceModal />
            <RememberThisModal />
            <RememberKnowledgeBaseModal />
            <AgentMemoryExplorerModal />
            <GuardrailsModal />

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
        </MemoryProvider>
      </AccountPathwayProvider>
    </ThemeProvider>
  );
}
