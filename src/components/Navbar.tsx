import React, { useState, useEffect } from 'react';
import { WorkspaceTab } from '../types';
import { 
  Sparkles, Mail, Calendar, FileText, Table, CheckSquare, Users, LogOut, 
  Bot, Brain, Send, Cpu, Clock, Mic, Moon, Sun, Monitor, Building2, RefreshCw, CheckCircle2,
  Database, Shield, Lock, Home, Code, FileCode, Layers, TrendingUp, Megaphone, Key,
  Smartphone, Share2, Globe, LayoutGrid
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { useMemory } from '../context/MemoryContext';
import { isMikeFordAdmin } from '../utils/adminAuth';
import { getWorkspaceNotificationCounts, ModuleNotificationCounts } from '../utils/workspaceNotifications';
import { BatterySaverNavbarToggle } from './BatterySaverNavbarToggle';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';
import { IosInstallGuideModal } from './IosInstallGuideModal';
import { ChevronDown, ChevronUp, Sliders } from 'lucide-react';

interface NavbarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  user: User | null;
  onLogout: () => void;
  onOpenVoiceModal: () => void;
  onOpenMobileAdmin?: () => void;
  onOpenWizard?: () => void;
  onOpenSalesAssistant?: () => void;
  onOpenScaffolding?: () => void;
  onOpenLicenseStudio?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenByokDrawer?: () => void;
  onOpenByokChecklist?: () => void;
  onOpenShareLinksModal?: () => void;
  onOpenPublicWebsite?: () => void;
  onToggleLauncher?: () => void;
  isLauncherOpen?: boolean;
  isSidebarPinned?: boolean;
  onTogglePinSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  onOpenVoiceModal,
  onOpenMobileAdmin,
  onOpenWizard,
  onOpenSalesAssistant,
  onOpenScaffolding,
  onOpenLicenseStudio,
  onOpenPitchDeck,
  onOpenByokDrawer,
  onOpenByokChecklist,
  onOpenShareLinksModal,
  onOpenPublicWebsite,
  onToggleLauncher,
  isLauncherOpen = false,
  isSidebarPinned = false,
  onTogglePinSidebar
}) => {
  const { theme, setTheme, toggleTheme, resolvedTheme } = useTheme();
  const {
    pathway,
    isWorkspaceConnected,
    connectedWorkspaceEmail,
    setIsWorkspaceModalOpen,
    syncData,
    isSyncing,
    lastSynced,
    syncStatusMsg
  } = useAccountPathway();

  const { 
    setIsKnowledgeBaseOpen, 
    setIsMemoryExplorerOpen, 
    setIsGuardrailsModalOpen,
    guardrails,
    memories 
  } = useMemory();

  const {
    isInstallable,
    isInstalled,
    isIOS,
    isMobile,
    isIosGuideOpen,
    setIsIosGuideOpen,
    triggerInstall
  } = usePwaInstallPrompt();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  const handleAddToHomeScreen = async () => {
    if (isIOS) {
      setIsIosGuideOpen(true);
    } else {
      const outcome = await triggerInstall();
      if (outcome === 'ios_guide' || outcome === 'not_supported') {
        if (onOpenShareLinksModal) {
          onOpenShareLinksModal();
        } else {
          setIsIosGuideOpen(true);
        }
      }
    }
  };

  const [notificationCounts, setNotificationCounts] = useState<ModuleNotificationCounts>(getWorkspaceNotificationCounts);

  useEffect(() => {
    const refresh = () => setNotificationCounts(getWorkspaceNotificationCounts());
    refresh();
    const interval = setInterval(refresh, 3000);
    window.addEventListener('storage', refresh);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const isAdmin = isMikeFordAdmin(user) || isMikeFordAdmin({ email: connectedWorkspaceEmail });

  // Prominently featured 7 Google Workspace Apps with Live Counters
  const googleApps = [
    { 
      id: 'gmail' as WorkspaceTab, 
      label: 'Gmail', 
      icon: Mail, 
      color: 'text-red-600 dark:text-red-400', 
      activeClass: 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900', 
      badge: `${notificationCounts.gmail.count} Unread`,
      notificationCount: notificationCounts.gmail.count,
      isUrgent: true
    },
    { 
      id: 'calendar' as WorkspaceTab, 
      label: 'Calendar', 
      icon: Calendar, 
      color: 'text-blue-600 dark:text-blue-400', 
      activeClass: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900', 
      badge: `${notificationCounts.calendar.count} Today`,
      notificationCount: notificationCounts.calendar.count,
      isUrgent: false
    },
    { 
      id: 'drive' as WorkspaceTab, 
      label: 'Drive & Docs', 
      icon: FileText, 
      color: 'text-amber-600 dark:text-amber-400', 
      activeClass: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900', 
      badge: `${notificationCounts.drive.count} Files`,
      notificationCount: notificationCounts.drive.count,
      isUrgent: false
    },
    { 
      id: 'sheets' as WorkspaceTab, 
      label: 'Sheets', 
      icon: Table, 
      color: 'text-emerald-600 dark:text-emerald-400', 
      activeClass: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900', 
      badge: `${notificationCounts.sheets.count} Dups`,
      notificationCount: notificationCounts.sheets.count,
      isUrgent: true
    },
    { 
      id: 'tasks' as WorkspaceTab, 
      label: 'Tasks', 
      icon: CheckSquare, 
      color: 'text-sky-600 dark:text-sky-400', 
      activeClass: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900', 
      badge: `${notificationCounts.tasks.count} Pending`,
      notificationCount: notificationCounts.tasks.count,
      isUrgent: notificationCounts.tasks.count > 0
    },
    { 
      id: 'contacts' as WorkspaceTab, 
      label: 'Contacts', 
      icon: Users, 
      color: 'text-purple-600 dark:text-purple-400', 
      activeClass: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900', 
      badge: `${notificationCounts.contacts.count} Leads`,
      notificationCount: 0,
      isUrgent: false
    },
    { 
      id: 'drafts' as WorkspaceTab, 
      label: 'Drafts', 
      icon: Send, 
      color: 'text-rose-600 dark:text-rose-400', 
      activeClass: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900', 
      badge: `${notificationCounts.drafts.count} Drafts`,
      notificationCount: notificationCounts.drafts.count,
      isUrgent: false
    },
  ];

  // Autonomous AI Engines & Platform Studios
  const studioTabs = [
    { id: 'suite' as WorkspaceTab, label: '💎 Vantage Suite', icon: Sparkles, badge: '4-in-1' },
    { id: 'lo_agent_profiles' as WorkspaceTab, label: '👥 LO & Agent Profiles', icon: Users, badge: 'Kanndice' },
    { id: 'google_apps' as WorkspaceTab, label: '🌐 7 Google Apps Hub', icon: Layers, badge: 'Portal' },
    { id: 'studio' as WorkspaceTab, label: 'Prompt Studio & Copilot', icon: Bot },
    { id: 'brain' as WorkspaceTab, label: '2nd Brain Memory', icon: Brain },
    { id: 'real_estate' as WorkspaceTab, label: 'Real Estate GeoMap', icon: Home },
    { id: 'orchestrator' as WorkspaceTab, label: 'Logic Orchestrator', icon: Cpu },
    { id: 'scheduler' as WorkspaceTab, label: 'Workflow Scheduler', icon: Clock },
    { id: 'voice-macros' as WorkspaceTab, label: 'Voice Macros', icon: Mic },
    { id: 'commercial_strategy' as WorkspaceTab, label: 'Commercial Strategy', icon: TrendingUp },
    { id: 'dev_roadmap' as WorkspaceTab, label: 'Code Architecture', icon: Code },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200 max-w-[100vw] overflow-x-hidden w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 max-w-[100vw] overflow-x-hidden">
        <div className="flex items-center justify-between h-16 gap-2 max-w-[100vw] min-w-0">
          <div className="flex items-center gap-2.5 shrink-0 min-w-0">
            {/* Google Apps 9-Dot "Waffle" Launcher Button */}
            {onToggleLauncher && (
              <button
                type="button"
                onClick={onToggleLauncher}
                className={`relative p-2 rounded-xl border transition-all cursor-pointer shadow-xs flex items-center justify-center shrink-0 ${
                  isLauncherOpen || isSidebarPinned
                    ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30 ring-2 ring-blue-400/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
                }`}
                title="Google Apps & Modules 9-Dot Launcher (Cmd+B)"
                aria-label="Toggle Google Apps Launcher"
              >
                <LayoutGrid className="w-4 h-4" />
                {notificationCounts.totalPending > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-black text-white bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse shadow-sm">
                    {notificationCounts.totalPending}
                  </span>
                )}
              </button>
            )}

            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 leading-tight truncate">Vantage AI Studio</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden md:block truncate">Autonomous Plugin Modules & Commercial Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 min-w-0">
            {/* Prominent "Add to Home Screen" PWA App Install Button */}
            <button
              id="navbar-add-to-home-screen-btn"
              onClick={handleAddToHomeScreen}
              className="hidden lg:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-gradient-to-r from-amber-400 via-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition transform active:scale-95 cursor-pointer shrink-0 border border-amber-300"
              title="Add Vantage AI Studio to your Mobile Home Screen as a native app"
            >
              <Smartphone className="w-3.5 h-3.5 text-slate-950 animate-bounce" />
              <span className="text-xs font-black">Add to Home Screen</span>
              <span className="hidden min-[420px]:inline-block text-[9px] px-1 py-0.2 bg-slate-950 text-amber-300 font-extrabold rounded-xs uppercase tracking-wide">
                PWA
              </span>
            </button>

            {/* In-App BYOK (Bring Your Own Key) Settings Drawer */}
            {onOpenByokDrawer && (
              <button
                id="byok-settings-btn"
                onClick={onOpenByokDrawer}
                className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/70 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer shrink-0"
                title="Bring Your Own Keys (BYOK): Gemini, RentCast, DeepSeek"
              >
                <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">API Keys (BYOK)</span>
                <span className="sm:hidden">Keys</span>
              </button>
            )}

            {/* Global Voice Studio Button */}
            <button
              id="global-voice-studio-btn"
              onClick={onOpenVoiceModal}
              className="hidden md:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer shrink-0"
              title="Open Global Voice-to-Text Studio (Cmd/Ctrl + K)"
            >
              <Mic className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
              <span className="hidden sm:inline">Voice Studio</span>
              <span className="sm:hidden">Voice</span>
              <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-red-100 dark:bg-red-900/70 text-red-700 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800">
                ⌘K
              </kbd>
            </button>

            {/* Mobile Quick Tools Expander Toggle (md:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`md:hidden flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer shrink-0 ${
                isMobileMenuOpen
                  ? 'bg-blue-600 text-white border-blue-500 shadow-md ring-2 ring-blue-400/40'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-700'
              }`}
              title="Toggle Quick Header Tools & Theme Switcher"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="text-[11px] font-bold">{isMobileMenuOpen ? 'Close' : 'Tools'}</span>
              {isMobileMenuOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Desktop Horizontal Header Items (md:flex) */}
            <div 
              className="hidden md:flex items-center gap-2 overflow-x-auto scrollbar-none py-1 touch-pan-x overscroll-x-contain"
              style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
            >
              {/* Dual Pathway Switcher & Workspace Connection Pill */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => setIsWorkspaceModalOpen(true)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    pathway === 'workspace'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                  }`}
                  title="Click to view Dual Google Apps / Workspace settings"
                >
                  {pathway === 'workspace' ? (
                    <>
                      <Building2 className="w-3.5 h-3.5 text-indigo-200" />
                      <span>Workspace Active</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Google Apps (Free)</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setIsWorkspaceModalOpen(true)}
                  className="text-[11px] font-semibold px-2 py-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer flex items-center gap-1"
                  title="Connect paid Google Workspace account"
                >
                  <Building2 className="w-3 h-3" />
                  <span>{isWorkspaceConnected ? 'Workspace Config' : 'Workspace Login'}</span>
                </button>
              </div>

              {/* Sync Workspace / Refresh Button */}
              <button
                onClick={() => syncData()}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-xs font-semibold transition cursor-pointer shadow-xs"
                title={`Sync Workspace Data (Last: ${lastSynced || 'just now'})`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500 dark:text-slate-400'}`} />
                <span className="hidden lg:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
              </button>

              {/* 2nd Brain & Remember Knowledge Base Button */}
              <button
                onClick={() => setIsKnowledgeBaseOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                title="Open 2nd Brain Memory Bank & Ingest Knowledge"
              >
                <Brain className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>2nd Brain</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                  {memories.length}
                </span>
              </button>

              {/* Agent Memory Explorer Button */}
              <button
                onClick={() => setIsMemoryExplorerOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                title="Open Agent Memory Explorer"
              >
                <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Memory Explorer</span>
              </button>

              {/* 2nd Brain Guardrails Studio Button */}
              <button
                onClick={() => setIsGuardrailsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                title="Shape 2nd Brain personality, censorship boundaries & permissible actions"
              >
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Guardrails</span>
              </button>

              {/* Dynamic Theme Mode Switcher */}
              <div
                id="theme-toggle-group"
                className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs"
                role="radiogroup"
                aria-label="Color theme selector"
              >
                <button
                  id="theme-btn-light"
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'light'
                      ? 'bg-white text-amber-600 shadow-xs dark:bg-slate-700 dark:text-amber-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Light Theme"
                >
                  <Sun className={`w-3.5 h-3.5 ${theme === 'light' ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="hidden xl:inline">Light</span>
                </button>

                <button
                  id="theme-btn-dark"
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title="Dark Theme"
                >
                  <Moon className={`w-3.5 h-3.5 ${theme === 'dark' ? 'text-indigo-500 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="hidden xl:inline">Dark</span>
                </button>

                <button
                  id="theme-btn-system"
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    theme === 'system'
                      ? 'bg-white text-blue-600 shadow-xs dark:bg-slate-700 dark:text-blue-400 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                  title={`System Theme (${resolvedTheme})`}
                >
                  <Monitor className={`w-3.5 h-3.5 ${theme === 'system' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span className="hidden xl:inline">Auto</span>
                </button>
              </div>

              {/* Battery Status API Toggle */}
              <BatterySaverNavbarToggle />

              {isAdmin && onOpenWizard && (
                <button
                  onClick={onOpenWizard}
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                  title="Launch Plugin Integration Wizard"
                >
                  <Code className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Wizard</span>
                </button>
              )}

              {isAdmin && onOpenShareLinksModal && (
                <button
                  id="lead-mobile-urls-nav-btn"
                  onClick={onOpenShareLinksModal}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
                  title="Open Live Shareable Mobile & Desktop URLs"
                >
                  <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                  <span>Lead URLs</span>
                </button>
              )}

              {onOpenPublicWebsite && (
                <button
                  onClick={onOpenPublicWebsite}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 text-xs font-bold rounded-xl transition cursor-pointer"
                  title="View Live Public Customer Website"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Public Site</span>
                </button>
              )}

              {user && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
                  <img
                    src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{user.displayName || user.email}</span>
                </div>
              )}

              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-700 rounded-xl border border-rose-200 dark:border-rose-900/50 transition cursor-pointer shadow-xs"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Quick Tools Collapsible Sub-Bar (md:hidden) */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-slate-50/95 dark:bg-slate-900/95 p-3 animate-in slide-in-from-top-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              {/* Theme Switcher */}
              <div className="flex items-center p-0.5 bg-slate-200 dark:bg-slate-800 rounded-xl border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    theme === 'light' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    theme === 'dark' ? 'bg-slate-700 text-indigo-400 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${
                    theme === 'system' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>Auto</span>
                </button>
              </div>

              {/* Pathway */}
              <button
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{pathway === 'workspace' ? 'Workspace Active' : 'Free Google Apps'}</span>
              </button>

              {/* Sync */}
              <button
                onClick={() => syncData()}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : ''}`} />
                <span>Sync</span>
              </button>

              {/* Add to Home Screen PWA */}
              <button
                onClick={handleAddToHomeScreen}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-black flex items-center gap-1.5 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 animate-bounce" />
                <span>Add to Home Screen</span>
              </button>

              {/* Voice Studio */}
              <button
                onClick={onOpenVoiceModal}
                className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                <span>Voice Studio</span>
              </button>

              {/* BYOK Settings */}
              {onOpenByokDrawer && (
                <button
                  onClick={onOpenByokDrawer}
                  className="px-3 py-1.5 bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>API Keys (BYOK)</span>
                </button>
              )}

              {/* 2nd Brain */}
              <button
                onClick={() => setIsKnowledgeBaseOpen(true)}
                className="px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Brain className="w-3.5 h-3.5" />
                <span>2nd Brain ({memories.length})</span>
              </button>

              {/* Guardrails */}
              <button
                onClick={() => setIsGuardrailsModalOpen(true)}
                className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Guardrails</span>
              </button>

              {/* Public Site */}
              {onOpenPublicWebsite && (
                <button
                  onClick={onOpenPublicWebsite}
                  className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Public Site</span>
                </button>
              )}

              {/* Sign out */}
              <button
                onClick={onLogout}
                className="px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* PRIMARY EXECUTIVE CONTROL STRIP (LO Profiles, Mobile Admin, GeoMap, 2nd Brain, Sign Out) */}
        <div 
          className="py-1.5 px-2 bg-slate-900 text-white rounded-xl my-1 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none shadow-md border border-slate-800 touch-pan-x overscroll-x-contain"
          style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab('lo_agent_profiles')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'lo_agent_profiles'
                  ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400/50'
                  : 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
              }`}
              title="Edit Kanndice McLean & LO Contact Profile Cards"
            >
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              <span>👥 LO &amp; Agent Profiles</span>
              <span className="text-[9px] px-1.5 py-0.2 bg-emerald-400 text-slate-950 font-extrabold rounded-full">
                Edit Kanndice
              </span>
            </button>

            {onOpenMobileAdmin && (
              <button
                type="button"
                onClick={onOpenMobileAdmin}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 transition flex items-center gap-1.5 cursor-pointer shrink-0"
                title="Launch Mobile Admin Dashboard"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                <span>📱 Mobile Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab('real_estate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 ${
                activeTab === 'brain'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <Brain className="w-3.5 h-3.5 text-purple-400" />
              <span>🧠 2nd Brain</span>
            </button>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {user && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800/80 rounded-lg text-[11px] text-slate-300 font-medium">
                <img src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'} alt="" className="w-4 h-4 rounded-full" />
                <span className="truncate max-w-[120px]">{user.displayName || user.email}</span>
              </div>
            )}
            <button
              type="button"
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-rose-200 border border-rose-500/50 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shadow-sm"
              title="Sign Out of Vantage AI Studio"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-300" />
              <span>🚪 Sign Out</span>
            </button>
          </div>
        </div>

        {/* Prominent Google Workspace 7-Apps Launcher Bar */}
        <div className="pt-2 pb-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 max-w-full min-w-0">
          <div 
            className="flex items-center gap-1.5 overflow-x-auto scrollbar-none touch-pan-x overscroll-x-contain whitespace-nowrap py-0.5 max-w-full min-w-0"
            style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
          >
            <button
              onClick={() => setActiveTab('google_apps')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all cursor-pointer shadow-2xs border shrink-0 ${
                activeTab === 'google_apps'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-500 shadow-md scale-[1.02]'
                  : 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100'
              }`}
              title="Open Unified 7 Google Workspace Apps Hub & Dual-Pathway Portal"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>7 Apps Hub</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded-md font-black uppercase bg-emerald-500 text-white">
                Live
              </span>
            </button>

            {googleApps.map((app) => {
              const Icon = app.icon;
              const isActive = activeTab === app.id;
              return (
                <button
                  key={app.id}
                  onClick={() => setActiveTab(app.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shadow-2xs border shrink-0 ${
                    isActive
                      ? `${app.activeClass} shadow-xs scale-[1.02]`
                      : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/90 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                  title={`Open Google ${app.label} Workspace`}
                >
                  <div className="relative">
                    <Icon className={`w-3.5 h-3.5 ${app.color}`} />
                    {app.notificationCount > 0 && (
                      <span className={`absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full ${app.isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-blue-600'}`} />
                    )}
                  </div>
                  <span>{app.label}</span>
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold ${
                    isActive 
                      ? 'bg-white/80 dark:bg-slate-900 text-slate-900 dark:text-slate-100' 
                      : app.isUrgent
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-black'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {app.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Secondary Navigation: Autonomous AI Studios & Engines */}
        <nav 
          className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none touch-pan-x overscroll-x-contain whitespace-nowrap border-t border-slate-100/80 dark:border-slate-800/60 pt-1.5 max-w-full min-w-0"
          style={{ overscrollBehaviorX: 'contain', WebkitOverflowScrolling: 'touch' }}
        >
          <span className="hidden xl:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1 my-auto shrink-0">
            <Sparkles className="w-3 h-3 text-blue-500" />
            AI Studios:
          </span>

          {studioTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider ${
                    isActive ? 'bg-white text-blue-700' : 'bg-amber-400 text-slate-950 shadow-xs'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      <IosInstallGuideModal
        isOpen={isIosGuideOpen}
        onClose={() => setIsIosGuideOpen(false)}
        pluginName="Vantage AI Mobile App"
      />
    </header>
  );
};

