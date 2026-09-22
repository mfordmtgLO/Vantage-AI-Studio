import React from 'react';
import { WorkspaceTab } from '../types';
import { 
  Sparkles, Mail, Calendar, FileText, Table, CheckSquare, Users, LogOut, 
  Bot, Brain, Send, Cpu, Clock, Mic, Moon, Sun, Monitor, Building2, RefreshCw, CheckCircle2,
  Database, Shield, Lock, Home, Code, FileCode, Layers, TrendingUp, Megaphone, Key,
  Smartphone, Share2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { useMemory } from '../context/MemoryContext';
import { isMikeFordAdmin } from '../utils/adminAuth';

interface NavbarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  user: User | null;
  onLogout: () => void;
  onOpenVoiceModal: () => void;
  onOpenWizard?: () => void;
  onOpenSalesAssistant?: () => void;
  onOpenScaffolding?: () => void;
  onOpenLicenseStudio?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenByokDrawer?: () => void;
  onOpenByokChecklist?: () => void;
  onOpenShareLinksModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  activeTab, 
  setActiveTab, 
  user, 
  onLogout, 
  onOpenVoiceModal,
  onOpenWizard,
  onOpenSalesAssistant,
  onOpenScaffolding,
  onOpenLicenseStudio,
  onOpenPitchDeck,
  onOpenByokDrawer,
  onOpenByokChecklist,
  onOpenShareLinksModal
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

  const isAdmin = isMikeFordAdmin(user) || isMikeFordAdmin({ email: connectedWorkspaceEmail });

  const tabs = [
    { id: 'suite' as WorkspaceTab, label: '💎 Vantage Suite', icon: Sparkles },
    { id: 'commercial_strategy' as WorkspaceTab, label: '🚀 Commercial Strategy & ROI', icon: TrendingUp },
    { id: 'dev_roadmap' as WorkspaceTab, label: '🛠️ Code Roadmap & System Architecture', icon: Code },
    { id: 'studio' as WorkspaceTab, label: 'Prompt Studio', icon: Bot },
    { id: 'brain' as WorkspaceTab, label: '2nd Brain & Memory', icon: Brain },
    { id: 'real_estate' as WorkspaceTab, label: 'Real Estate GeoMap', icon: Home },
    { id: 'orchestrator' as WorkspaceTab, label: 'Logic Orchestrator', icon: Cpu },
    { id: 'scheduler' as WorkspaceTab, label: 'Workflow Scheduler', icon: Clock },
    { id: 'drafts' as WorkspaceTab, label: 'Saved Drafts (18)', icon: Send },
    { id: 'gmail' as WorkspaceTab, label: 'Gmail', icon: Mail },
    { id: 'calendar' as WorkspaceTab, label: 'Calendar', icon: Calendar },
    { id: 'drive' as WorkspaceTab, label: 'Drive & Docs', icon: FileText },
    { id: 'sheets' as WorkspaceTab, label: 'Sheets', icon: Table },
    { id: 'tasks' as WorkspaceTab, label: 'Tasks', icon: CheckSquare },
    { id: 'contacts' as WorkspaceTab, label: 'Contacts', icon: Users },
    { id: 'voice-macros' as WorkspaceTab, label: 'Voice Macros', icon: Mic },
  ];

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">Vantage AI Studio</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Autonomous Plugin Modules & Commercial Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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
                    <span className="hidden sm:inline">Workspace Active</span>
                    <span className="sm:hidden">Workspace</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden sm:inline">Google Apps (Free)</span>
                    <span className="sm:hidden">Apps</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsWorkspaceModalOpen(true)}
                className="text-[11px] font-semibold px-2 py-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline cursor-pointer hidden md:flex items-center gap-1"
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
              <span className="hidden sm:inline">2nd Brain</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-200/70 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                {memories.length}
              </span>
            </button>

            {/* Agent Memory Explorer Button */}
            <button
              onClick={() => setIsMemoryExplorerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
              title="Open Agent Memory Explorer (View, Edit, Delete Learned Context)"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span className="hidden sm:inline">Memory Explorer</span>
            </button>

            {/* 2nd Brain Guardrails & Boundaries Studio Button */}
            <button
              onClick={() => setIsGuardrailsModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
              title="Shape 2nd Brain personality, censorship boundaries & permissible actions"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">Guardrails</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-full bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                {guardrails.personalityPreset}
              </span>
            </button>

            {/* Dynamic Theme Mode Switcher (Light / Dark / System) */}
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
                role="radio"
                aria-checked={theme === 'light'}
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
                role="radio"
                aria-checked={theme === 'dark'}
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
                title={`System Theme (Matches OS: ${resolvedTheme})`}
                role="radio"
                aria-checked={theme === 'system'}
              >
                <Monitor className={`w-3.5 h-3.5 ${theme === 'system' ? 'text-blue-500 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="hidden xl:inline">Auto</span>
              </button>
            </div>

            {/* In-App BYOK (Bring Your Own Key) Settings Drawer */}
            {onOpenByokDrawer && (
              <button
                id="byok-settings-btn"
                onClick={onOpenByokDrawer}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800/70 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                title="Bring Your Own Keys (BYOK): Gemini, RentCast, DeepSeek"
              >
                <Key className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>API Keys (BYOK)</span>
              </button>
            )}

            <button
              id="global-voice-studio-btn"
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
              title="Open Global Voice-to-Text Studio (Cmd/Ctrl + K)"
            >
              <Mic className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
              <span>Voice Studio</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-red-100 dark:bg-red-900/70 text-red-700 dark:text-red-200 rounded-md border border-red-200 dark:border-red-800">
                ⌘K
              </kbd>
            </button>

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

            {isAdmin && onOpenSalesAssistant && (
              <button
                onClick={onOpenSalesAssistant}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/40 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                title="Generate Digital Product Sales Copy"
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>Sales Copy</span>
              </button>
            )}

            {isAdmin && onOpenScaffolding && (
              <button
                onClick={onOpenScaffolding}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                title="1-Click Zero-Shot Full Website Scaffolding Prompt"
              >
                <Layers className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                <span>Scaffold</span>
              </button>
            )}

            {isAdmin && onOpenLicenseStudio && (
              <button
                onClick={onOpenLicenseStudio}
                className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
                title="Commercial Domain-Locking & License Keys"
              >
                <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>License Key</span>
              </button>
            )}

            {/* Shareable Live Mobile URLs & PWA Launcher Button (Admin Only) */}
            {isAdmin && onOpenShareLinksModal && (
              <button
                id="lead-mobile-urls-nav-btn"
                onClick={onOpenShareLinksModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-blue-500/20 cursor-pointer"
                title="Open Live Shareable Mobile & Desktop URLs with 1-Click Add-to-Home-Screen for Leads (Admin Only)"
              >
                <Smartphone className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Lead Mobile URLs</span>
                <span className="sm:hidden">URLs</span>
                <span className="text-[9px] px-1.5 py-0.2 bg-amber-400 text-slate-950 font-black rounded-sm uppercase tracking-wide">
                  PWA
                </span>
              </button>
            )}

            {isAdmin && onOpenPitchDeck && (
              <button
                onClick={onOpenPitchDeck}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                title="Commercial Retail Software Suite Sales Pitch Deck Reference (Admin Only)"
              >
                <Megaphone className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Pitch Deck</span>
                <span className="hidden sm:inline text-[9px] px-1.5 py-0.5 bg-indigo-600 text-white rounded-md font-extrabold uppercase tracking-wide">
                  Master
                </span>
              </button>
            )}

            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full border border-slate-200 dark:border-slate-700">
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
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>

        <nav className="flex space-x-1 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg whitespace-nowrap transition cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/80 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.id === 'suite' && (
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 uppercase tracking-wider shadow-xs">
                    4-in-1
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

