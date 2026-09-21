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
import { MemoryScenariosModal } from './components/MemoryScenariosModal';
import { PluginIntegrationWizardModal } from './components/PluginIntegrationWizardModal';
import { PluginSalesAssistantModal } from './components/PluginSalesAssistantModal';
import { FullWebsiteScaffoldingModal } from './components/FullWebsiteScaffoldingModal';
import { CommercialLicenseProtectionStudio } from './components/CommercialLicenseProtectionStudio';
import { CommercialPitchDeckModal } from './components/CommercialPitchDeckModal';
import { ByokCredentialsModal } from './components/ByokCredentialsModal';
import { ByokChecklistGuideModal } from './components/ByokChecklistGuideModal';
import { MobileAddToHomeScreenBanner } from './components/MobileAddToHomeScreenBanner';
import { LeadMobileShareLinksModal } from './components/LeadMobileShareLinksModal';
import { safeAtob } from './utils/base64';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pluginParam = urlParams.get('plugin');
      if (pluginParam === 'geomap' || pluginParam === 'real_estate') return 'real_estate';
      if (pluginParam === 'brain') return 'brain';
      if (pluginParam === 'voice' || pluginParam === 'orchestrator') return 'orchestrator';
      if (pluginParam === 'workspace' || pluginParam === 'suite') return 'studio';

      const tabParam = urlParams.get('tab');
      const isAdminQuery = urlParams.get('admin') === 'true' || urlParams.get('admin_vault') === 'true';
      if (isAdminQuery || tabParam === 'admin' || tabParam === 'admin_plugins') {
        return 'admin_plugins';
      }
      if (tabParam && ['studio', 'brain', 'real_estate', 'orchestrator', 'scheduler', 'drafts', 'gmail', 'calendar', 'drive', 'sheets', 'tasks', 'contacts', 'voice-macros', 'admin_plugins'].includes(tabParam)) {
        return tabParam as WorkspaceTab;
      }
    } catch {}
    return 'studio';
  });
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);
  const [isSalesAssistantOpen, setIsSalesAssistantOpen] = useState<boolean>(false);
  const [isScaffoldingOpen, setIsScaffoldingOpen] = useState<boolean>(false);
  const [isLicenseStudioOpen, setIsLicenseStudioOpen] = useState<boolean>(false);
  const [isPitchDeckOpen, setIsPitchDeckOpen] = useState<boolean>(false);
  const [isByokDrawerOpen, setIsByokDrawerOpen] = useState<boolean>(false);
  const [isByokChecklistOpen, setIsByokChecklistOpen] = useState<boolean>(false);
  const [isShareLinksModalOpen, setIsShareLinksModalOpen] = useState<boolean>(false);
  const [isMobileAdminMode, setIsMobileAdminMode] = useState<boolean>(() => {
    return new URLSearchParams(window.location.search).get('mobile_admin') === 'true';
  });

  // Quick Undo and Voice Execution State
  const [activeVoiceWorkflow, setActiveVoiceWorkflow] = useState<string | null>(null);
  const [snackbarWorkflow, setSnackbarWorkflow] = useState<string | null>(null);
  const [revertedWorkflow, setRevertedWorkflow] = useState<string | null>(null);

  // Shared workflow import state from URL query
  const [pendingImportWorkflow, setPendingImportWorkflow] = useState<ShareableWorkflowData | null>(null);

  const createGuestUser = (): User => ({
    uid: 'guest_user_vantage',
    displayName: 'Guest Explorer',
    email: 'guest@vantage.workspace',
    photoURL: null,
    emailVerified: true,
    isAnonymous: true,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => '',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: null,
    providerId: 'guest',
  } as unknown as User);

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
      // Check if user previously logged in via guest mode or is opening a lead preview link
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const isLeadQuery = urlParams.get('lead') === '1' || 
          urlParams.get('lead_mode') === '1' || 
          urlParams.get('guest') === '1' ||
          urlParams.get('plugin') !== null;

        if (isLeadQuery || localStorage.getItem('vantage_guest_mode') === 'true') {
          if (isMounted) {
            setUser(createGuestUser());
            setNeedsAuth(false);
          }
          return;
        }
      } catch {}

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
          if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('unauthorized-domain'))) {
            setAuthError('auth/unauthorized-domain');
          } else {
            setAuthError(err?.message || 'Error processing Google sign-in redirect.');
          }
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
      if (err?.code === 'auth/unauthorized-domain' || (err?.message && err.message.includes('unauthorized-domain'))) {
        message = 'auth/unauthorized-domain';
      } else if (err?.code === 'auth/popup-timeout') {
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

  const handleGuestLogin = () => {
    try {
      localStorage.setItem('vantage_guest_mode', 'true');
    } catch {}
    setUser(createGuestUser());
    setNeedsAuth(false);
    setAuthError(null);
  };

  const handleCancelLogin = () => {
    setIsLoggingIn(false);
    setAuthError(null);
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('vantage_guest_mode');
    } catch {}
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
            onOpenPluginVault={() => {
              const newUrl = window.location.pathname + '?tab=admin_plugins';
              window.history.replaceState({}, document.title, newUrl);
              setActiveTab('admin_plugins');
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
          onGuestLogin={handleGuestLogin}
          onCancelLogin={handleCancelLogin}
          isLoggingIn={isLoggingIn}
          error={authError}
          onClearError={() => setAuthError(null)}
        />
      </ThemeProvider>
    );
  }

  const getCurrentPluginTitle = (): string => {
    switch (activeTab) {
      case 'real_estate':
        return 'Vantage AI Studio-Real Estate GeoMap & DPA';
      case 'brain':
        return 'Vantage AI Studio-2nd Brain Vector Memory';
      case 'orchestrator':
      case 'voice-macros':
        return 'Vantage AI Studio-Voice Orchestrator';
      case 'admin_plugins':
        return 'Vantage AI Studio-Plugin Vault & Scaffolding';
      case 'studio':
      default:
        return 'Vantage AI Studio-Workspace UI Cockpit';
    }
  };

  return (
    <ThemeProvider>
      <AccountPathwayProvider>
        <MemoryProvider>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
            {/* Mobile PWA Add-to-Home-Screen Dynamic Header Banner */}
            <MobileAddToHomeScreenBanner
              currentPluginName={getCurrentPluginTitle()}
              onOpenShareModal={() => setIsShareLinksModalOpen(true)}
            />

            <Navbar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              user={user}
              onLogout={handleLogout}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenWizard={() => setIsWizardOpen(true)}
              onOpenSalesAssistant={() => setIsSalesAssistantOpen(true)}
              onOpenScaffolding={() => setIsScaffoldingOpen(true)}
              onOpenLicenseStudio={() => setIsLicenseStudioOpen(true)}
              onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
              onOpenByokDrawer={() => setIsByokDrawerOpen(true)}
              onOpenByokChecklist={() => setIsByokChecklistOpen(true)}
              onOpenShareLinksModal={() => setIsShareLinksModalOpen(true)}
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
                onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
                onOpenByokDrawer={() => setIsByokDrawerOpen(true)}
                onOpenShareLinksModal={() => setIsShareLinksModalOpen(true)}
              />
            </main>

            {/* Lead Mobile Share URLs & Add-to-Home-Screen Modal */}
            <LeadMobileShareLinksModal
              isOpen={isShareLinksModalOpen}
              onClose={() => setIsShareLinksModalOpen(false)}
            />

            {/* BYOK (Bring Your Own Key) In-App Drawer Modal */}
            <ByokCredentialsModal
              isOpen={isByokDrawerOpen}
              onClose={() => setIsByokDrawerOpen(false)}
              onOpenChecklistGuide={() => {
                setIsByokDrawerOpen(false);
                setIsByokChecklistOpen(true);
              }}
            />

            {/* 3-Minute BYOK Customer Checklist / Etsy Onboarding Modal */}
            <ByokChecklistGuideModal
              isOpen={isByokChecklistOpen}
              onClose={() => setIsByokChecklistOpen(false)}
              onOpenByokDrawer={() => {
                setIsByokChecklistOpen(false);
                setIsByokDrawerOpen(true);
              }}
            />

            <GlobalVoiceRecorderModal
              isOpen={isVoiceModalOpen}
              onClose={() => setIsVoiceModalOpen(false)}
              onRunWorkflowCommand={(workflowName) => {
                handleExecuteVoiceWorkflow(workflowName);
              }}
            />

            <PluginIntegrationWizardModal
              isOpen={isWizardOpen}
              onClose={() => setIsWizardOpen(false)}
            />

            <PluginSalesAssistantModal
              isOpen={isSalesAssistantOpen}
              onClose={() => setIsSalesAssistantOpen(false)}
              onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
            />

            <CommercialPitchDeckModal
              isOpen={isPitchDeckOpen}
              onClose={() => setIsPitchDeckOpen(false)}
              onOpenLicenseStudio={() => setIsLicenseStudioOpen(true)}
              onOpenSalesAssistant={() => setIsSalesAssistantOpen(true)}
            />

            <FullWebsiteScaffoldingModal
              isOpen={isScaffoldingOpen}
              onClose={() => setIsScaffoldingOpen(false)}
            />

            {isLicenseStudioOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
                <div className="w-full max-w-3xl">
                  <CommercialLicenseProtectionStudio 
                    onClose={() => setIsLicenseStudioOpen(false)}
                    onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
                  />
                </div>
              </div>
            )}

            <ConnectWorkspaceModal />
            <RememberThisModal />
            <RememberKnowledgeBaseModal />
            <AgentMemoryExplorerModal />
            <GuardrailsModal />
            <MemoryScenariosModal />

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
