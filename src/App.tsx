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
import { BatterySaverProvider } from './context/BatterySaverContext';
import { VoiceIntentPayload } from './types/voiceMacro';
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
import { PublicFacingWebsiteView } from './components/PublicFacingWebsiteView';
import { GoogleAppsSidebarLauncher } from './components/GoogleAppsSidebarLauncher';
import { FirstTimeHomebuyerGeoPlugin } from './components/FirstTimeHomebuyerGeoPlugin';
import { Users, Smartphone, Home, Brain, LogOut, Monitor } from 'lucide-react';
import { safeAtob } from './utils/base64';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [needsAuth, setNeedsAuth] = useState<boolean>(true);
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Dedicated view separation between Public Consumer Website and Back-End Dashboard
  const [viewMode, setViewMode] = useState<'public' | 'dashboard' | 'auth'>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === '1' || urlParams.get('signin') === '1') return 'auth';
      if (urlParams.get('mode') === 'public' || urlParams.get('view') === 'public' || urlParams.get('public') === '1') return 'public';
      if (
        urlParams.get('mobile_admin') === 'true' || 
        urlParams.get('mobile_admin') === '1' ||
        urlParams.get('mobile') === 'true' ||
        urlParams.get('mobile') === '1' ||
        urlParams.get('admin') === 'true' || 
        urlParams.get('tab') || 
        urlParams.get('plugin') || 
        urlParams.get('view') === 'dashboard' || 
        urlParams.get('mode') === 'dashboard' ||
        urlParams.get('lead') === '1' ||
        urlParams.get('prop') ||
        urlParams.get('listing') ||
        urlParams.get('propertyId')
      ) {
        return 'dashboard';
      }
      const savedMode = localStorage.getItem('vantage_view_mode');
      if (savedMode === 'public' || savedMode === 'dashboard') return savedMode as any;
    } catch {}
    return 'public';
  });
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const pluginParam = urlParams.get('plugin');
      if (pluginParam === 'suite' || pluginParam === 'all' || urlParams.get('suite') === '1') return 'suite';
      if (pluginParam === 'geomap' || pluginParam === 'real_estate' || urlParams.get('prop') || urlParams.get('listing') || urlParams.get('propertyId')) return 'real_estate';
      if (pluginParam === 'brain') return 'brain';
      if (pluginParam === 'voice' || pluginParam === 'orchestrator') return 'orchestrator';
      if (pluginParam === 'workspace') return 'studio';
      if (pluginParam === 'profiles' || pluginParam === 'lo_agent_profiles' || pluginParam === 'kanndice') return 'lo_agent_profiles';

      const tabParam = urlParams.get('tab');
      if (tabParam === 'profiles' || tabParam === 'lo_agent_profiles' || tabParam === 'agents') return 'lo_agent_profiles';

      const isAdminQuery = urlParams.get('admin_vault') === 'true';
      if (isAdminQuery || tabParam === 'admin' || tabParam === 'admin_plugins') {
        return 'admin_plugins';
      }
      if (tabParam && ['suite', 'studio', 'brain', 'real_estate', 'orchestrator', 'scheduler', 'drafts', 'gmail', 'calendar', 'drive', 'sheets', 'tasks', 'contacts', 'voice-macros', 'admin_plugins', 'lo_agent_profiles'].includes(tabParam)) {
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
  const [shareLinksPropertyId, setShareLinksPropertyId] = useState<string | undefined>(undefined);
  const [isMobileAdminMode, setIsMobileAdminMode] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        urlParams.get('mobile_admin') === 'true' ||
        urlParams.get('mobile_admin') === '1' ||
        urlParams.get('mobile') === 'true' ||
        urlParams.get('mobile') === '1' ||
        urlParams.get('admin') === 'mobile'
      );
    } catch {
      return false;
    }
  });

  // Client / Homebuyer dedicated standalone state (when 'lead=1' or similar parameter is matched)
  const [isConsumerLeadMode] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return (
        urlParams.get('lead') === '1' ||
        urlParams.get('lead_mode') === '1' ||
        urlParams.get('client') === '1'
      );
    } catch {
      return false;
    }
  });

  // Diagnostic state for desktop device using mobile URL parameters
  const [showDesktopDiagnostic, setShowDesktopDiagnostic] = useState<boolean>(false);

  useEffect(() => {
    if (isMobileAdminMode) {
      const isDesktopScreen = window.innerWidth >= 1024;
      const isDesktopUA = !/Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
      if (isDesktopScreen || isDesktopUA) {
        setShowDesktopDiagnostic(true);
      }
    }
  }, [isMobileAdminMode]);

  const handleSwitchToDesktop = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('mobile_admin');
      url.searchParams.delete('mobile');
      url.searchParams.delete('admin');
      window.history.replaceState({}, document.title, url.pathname + url.search);
      setIsMobileAdminMode(false);
      setViewMode('dashboard');
      setShowDesktopDiagnostic(false);
    } catch {
      window.location.href = window.location.pathname;
    }
  };

  // Google Apps 9-Dot Launcher and Persistent Sidebar State
  const [isLauncherOpen, setIsLauncherOpen] = useState<boolean>(false);
  const [isSidebarPinned, setIsSidebarPinned] = useState<boolean>(() => {
    try {
      return localStorage.getItem('vantage_sidebar_pinned') === 'true';
    } catch {
      return false;
    }
  });
  const [sidebarDockSide, setSidebarDockSide] = useState<'left' | 'right'>(() => {
    try {
      const saved = localStorage.getItem('vantage_sidebar_dock');
      if (saved === 'left' || saved === 'right') return saved;
    } catch {}
    return 'left';
  });

  // Quick Undo and Voice Execution State
  const [activeVoiceWorkflow, setActiveVoiceWorkflow] = useState<string | null>(null);
  const [snackbarWorkflow, setSnackbarWorkflow] = useState<string | null>(null);
  const [revertedWorkflow, setRevertedWorkflow] = useState<string | null>(null);
  const [executedVoiceIntent, setExecutedVoiceIntent] = useState<VoiceIntentPayload | null>(null);

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

  // Global Keyboard Shortcuts: Cmd/Ctrl + K (Voice Studio) & Cmd/Ctrl + B (Apps Launcher)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd + K (Mac) or Ctrl + K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setIsVoiceModalOpen((prev) => !prev);
      }
      // Check for Cmd + B (Mac) or Ctrl + B (Windows/Linux) to toggle Google Apps launcher
      if ((e.metaKey || e.ctrlKey) && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        setIsLauncherOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Ensure website always starts snapped to the very top on initial load and tab navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [activeTab]);

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
          urlParams.get('prop') !== null ||
          urlParams.get('listing') !== null ||
          urlParams.get('propertyId') !== null ||
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
      localStorage.setItem('vantage_view_mode', 'dashboard');
    } catch {}
    setUser(createGuestUser());
    setNeedsAuth(false);
    setViewMode('dashboard');
    setAuthError(null);
  };

  const handleCancelLogin = () => {
    setIsLoggingIn(false);
    setAuthError(null);
    setViewMode('public');
  };

  const handleLogout = async () => {
    try {
      localStorage.removeItem('vantage_guest_mode');
      localStorage.removeItem('vantage_view_mode');
    } catch {}
    await logout();
    setUser(null);
    setNeedsAuth(true);
    setViewMode('public');
    setIsMobileAdminMode(false);
    try {
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch {}
  };

  const handleExecuteVoiceWorkflow = (workflowName: string) => {
    setActiveVoiceWorkflow(workflowName);
    setSnackbarWorkflow(workflowName);
    setExecutedVoiceIntent(null);
    setActiveTab('orchestrator');
  };

  const handleExecuteVoiceIntent = (intent: VoiceIntentPayload) => {
    setExecutedVoiceIntent(intent);
    const primaryLabel = intent.matchedMacroName || (intent.steps.length > 1 ? `${intent.steps.length}-Step Compound Voice Macro` : intent.steps[0]?.label) || 'Voice Macro Directive';
    setActiveVoiceWorkflow(primaryLabel);
    setSnackbarWorkflow(primaryLabel);

    // Contextual intelligent tab routing
    if (intent.steps.some(s => s.category === 'real_estate_filter' || s.category === 'real_estate_prequal')) {
      setActiveTab('real_estate');
    } else if (intent.steps.some(s => s.category === 'memory_ingest')) {
      setActiveTab('brain');
    } else if (intent.matchedMacroName || intent.steps.some(s => s.category === 'workflow_macro')) {
      setActiveTab('orchestrator');
    } else if (intent.steps.some(s => s.category === 'workspace_gmail' || s.category === 'workspace_calendar')) {
      setActiveTab('studio');
    }
  };

  const handleQuickUndo = () => {
    if (snackbarWorkflow) {
      setRevertedWorkflow(snackbarWorkflow);
      setSnackbarWorkflow(null);
      setExecutedVoiceIntent(null);
    }
  };

  // 1. Standalone Consumer/Client Lead Portal View
  if (isConsumerLeadMode) {
    return (
      <ThemeProvider>
        <BatterySaverProvider>
          <AccountPathwayProvider>
            <MemoryProvider>
              <div className="min-h-screen max-w-[100vw] w-full bg-slate-950 text-slate-100 font-sans antialiased overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
                  <FirstTimeHomebuyerGeoPlugin 
                    onOpenByokDrawer={() => {}} 
                    onOpenShareLinksModal={() => {}}
                  />
                </div>
              </div>
            </MemoryProvider>
          </AccountPathwayProvider>
        </BatterySaverProvider>
      </ThemeProvider>
    );
  }

  // 2. Mobile Admin Dashboard Mode
  if (isMobileAdminMode) {
    return (
      <ThemeProvider>
        <BatterySaverProvider>
          <AccountPathwayProvider>
            <MemoryProvider>
              <div className="max-w-[100vw] w-full overflow-x-hidden min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
                <MobileAdminDashboard 
                  onOpenDesktopView={handleSwitchToDesktop}
                  onOpenPluginVault={() => {
                    const newUrl = window.location.pathname + '?tab=admin_plugins';
                    window.history.replaceState({}, document.title, newUrl);
                    setActiveTab('admin_plugins');
                    setIsMobileAdminMode(false);
                    setViewMode('dashboard');
                  }} 
                  onOpenShareLinksModal={() => setIsShareLinksModalOpen(true)}
                  onOpenPublicWebsite={() => {
                    setIsMobileAdminMode(false);
                    setViewMode('public');
                    try {
                      localStorage.setItem('vantage_view_mode', 'public');
                      window.history.replaceState({}, document.title, window.location.pathname + '?view=public');
                    } catch {}
                  }}
                  onLogout={handleLogout}
                />
                
                {/* Desktop Device with Mobile Parameters Diagnostic Banner */}
                {showDesktopDiagnostic && (
                  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/30 rounded-2xl p-4 shadow-2xl max-w-md w-[92vw] backdrop-blur-md flex flex-col gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl shrink-0 border border-amber-500/20">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-amber-200 flex items-center gap-1.5">
                          <span>Desktop Screen Detected</span>
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-medium bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            Diagnostic
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                          You are viewing the <strong className="text-amber-400">Mobile Layout</strong> on a desktop device. Would you like to automatically transition to our full Desktop Interface?
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-800/80 pt-2.5">
                      <button
                        onClick={() => setShowDesktopDiagnostic(false)}
                        className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-300 hover:bg-slate-800/60 rounded-xl transition cursor-pointer"
                      >
                        Keep Mobile View
                      </button>
                      <button
                        onClick={handleSwitchToDesktop}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-amber-500/10 transition cursor-pointer flex items-center gap-1.5 border border-amber-300"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Switch to Desktop Layout</span>
                      </button>
                    </div>
                  </div>
                )}
                <ConnectWorkspaceModal />
                <LeadMobileShareLinksModal
                  isOpen={isShareLinksModalOpen}
                  onClose={() => {
                    setIsShareLinksModalOpen(false);
                    setShareLinksPropertyId(undefined);
                  }}
                  initialPropertyId={shareLinksPropertyId}
                />
              </div>
            </MemoryProvider>
          </AccountPathwayProvider>
        </BatterySaverProvider>
      </ThemeProvider>
    );
  }

  // 2. Authentication View
  if (viewMode === 'auth' || (viewMode === 'dashboard' && needsAuth && !user)) {
    return (
      <ThemeProvider>
        <AuthCard
          onLogin={handleLogin}
          onGuestLogin={handleGuestLogin}
          onCancelLogin={handleCancelLogin}
          onBackToPublic={() => setViewMode('public')}
          isLoggingIn={isLoggingIn}
          error={authError}
          onClearError={() => setAuthError(null)}
        />
      </ThemeProvider>
    );
  }

  // 3. Public-Facing Consumer Website Mode
  if (viewMode === 'public') {
    return (
      <ThemeProvider>
        <AccountPathwayProvider>
          <PublicFacingWebsiteView
            onEnterGuestDemo={handleGuestLogin}
            onOpenSignIn={() => setViewMode('auth')}
            onOpenDashboard={() => {
              setViewMode('dashboard');
              try {
                localStorage.setItem('vantage_view_mode', 'dashboard');
                window.history.replaceState({}, document.title, window.location.pathname + '?view=dashboard');
              } catch {}
            }}
            onLogout={handleLogout}
            currentUser={user}
            onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
          />
          <CommercialPitchDeckModal
            isOpen={isPitchDeckOpen}
            onClose={() => setIsPitchDeckOpen(false)}
            onOpenLicenseStudio={() => setIsLicenseStudioOpen(true)}
            onOpenSalesAssistant={() => setIsSalesAssistantOpen(true)}
          />
        </AccountPathwayProvider>
      </ThemeProvider>
    );
  }

  const getCurrentPluginTitle = (): string => {
    switch (activeTab) {
      case 'suite':
        return 'Vantage AI Studio-Suite (4-in-1 Master Platform)';
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
      <BatterySaverProvider>
        <AccountPathwayProvider>
          <MemoryProvider>
          <div className="min-h-screen max-w-[100vw] w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
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
              onOpenMobileAdmin={() => setIsMobileAdminMode(true)}
              onOpenWizard={() => setIsWizardOpen(true)}
              onOpenSalesAssistant={() => setIsSalesAssistantOpen(true)}
              onOpenScaffolding={() => setIsScaffoldingOpen(true)}
              onOpenLicenseStudio={() => setIsLicenseStudioOpen(true)}
              onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
              onOpenByokDrawer={() => setIsByokDrawerOpen(true)}
              onOpenByokChecklist={() => setIsByokChecklistOpen(true)}
              onOpenShareLinksModal={() => setIsShareLinksModalOpen(true)}
              onOpenPublicWebsite={() => {
                setViewMode('public');
                try {
                  localStorage.setItem('vantage_view_mode', 'public');
                  window.history.replaceState({}, document.title, window.location.pathname + '?view=public');
                } catch {}
              }}
              onToggleLauncher={() => setIsLauncherOpen((prev) => !prev)}
              isLauncherOpen={isLauncherOpen}
              isSidebarPinned={isSidebarPinned}
              onTogglePinSidebar={() => {
                setIsSidebarPinned((prev) => {
                  const next = !prev;
                  try { localStorage.setItem('vantage_sidebar_pinned', String(next)); } catch {}
                  return next;
                });
              }}
            />

            {/* Google Apps 9-Dot Grid Overlay & Persistent Docked Sidebar */}
            <GoogleAppsSidebarLauncher
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              isOpen={isLauncherOpen}
              onClose={() => setIsLauncherOpen(false)}
              isPinned={isSidebarPinned}
              onTogglePin={() => {
                setIsSidebarPinned((prev) => {
                  const next = !prev;
                  try { localStorage.setItem('vantage_sidebar_pinned', String(next)); } catch {}
                  return next;
                });
              }}
              dockSide={sidebarDockSide}
              onToggleDockSide={() => {
                setSidebarDockSide((prev) => {
                  const next = prev === 'left' ? 'right' : 'left';
                  try { localStorage.setItem('vantage_sidebar_dock', next); } catch {}
                  return next;
                });
              }}
              onOpenVoiceModal={() => setIsVoiceModalOpen(true)}
              onOpenPitchDeck={() => setIsPitchDeckOpen(true)}
              onOpenByokDrawer={() => setIsByokDrawerOpen(true)}
              onOpenLicenseStudio={() => setIsLicenseStudioOpen(true)}
              onOpenScaffolding={() => setIsScaffoldingOpen(true)}
              onOpenPublicWebsite={() => {
                setViewMode('public');
                try {
                  localStorage.setItem('vantage_view_mode', 'public');
                  window.history.replaceState({}, document.title, window.location.pathname + '?view=public');
                } catch {}
              }}
            />

            <main className={`transition-all duration-300 ${
              isSidebarPinned 
                ? (sidebarDockSide === 'left' ? 'lg:pl-80 xl:pl-88' : 'lg:pr-80 xl:pr-88') 
                : ''
            }`}>
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
                onOpenByokChecklist={() => setIsByokChecklistOpen(true)}
                onOpenShareLinksModal={(propId?: string) => {
                  setShareLinksPropertyId(propId);
                  setIsShareLinksModalOpen(true);
                }}
              />
            </main>

            {/* STICKY FLOATING EXECUTIVE CONTROL DOCK */}
            <div 
              className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl flex items-center gap-1.5 max-w-[95vw] overflow-x-auto scrollbar-none touch-pan-x overscroll-x-contain"
              style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('lo_agent_profiles')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'lo_agent_profiles'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                    : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
                }`}
                title="Edit Kanndice McLean & LO Contact Info"
              >
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>👥 LO &amp; Agent Profiles</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-extrabold rounded-full">
                  Edit Kanndice
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsMobileAdminMode(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Launch Mobile Admin Dashboard"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>📱 Mobile Admin</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('real_estate')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'real_estate'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <Home className="w-3.5 h-3.5 text-blue-400" />
                <span>🏠 GeoMap</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('brain')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                  activeTab === 'brain'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>🧠 2nd Brain</span>
              </button>

              <div className="h-4 w-px bg-slate-700 mx-0.5 shrink-0" />

              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-xl bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-500/50 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 shadow-sm"
                title="Sign Out of Vantage AI Studio"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300" />
                <span>🚪 Sign Out</span>
              </button>
            </div>

            {/* Lead Mobile Share URLs & Add-to-Home-Screen Modal */}
            <LeadMobileShareLinksModal
              isOpen={isShareLinksModalOpen}
              onClose={() => {
                setIsShareLinksModalOpen(false);
                setShareLinksPropertyId(undefined);
              }}
              initialPropertyId={shareLinksPropertyId}
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
              onExecuteVoiceIntent={handleExecuteVoiceIntent}
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
                steps={executedVoiceIntent?.steps}
                totalSteps={executedVoiceIntent?.steps?.length || 1}
                currentStepLabel={executedVoiceIntent?.steps?.[0]?.label || snackbarWorkflow}
                status={executedVoiceIntent ? 'undo_window' : 'undo_window'}
                duration={10000}
                onUndo={handleQuickUndo}
                onDismiss={() => {
                  setSnackbarWorkflow(null);
                  setExecutedVoiceIntent(null);
                }}
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
    </BatterySaverProvider>
  </ThemeProvider>
  );
}
