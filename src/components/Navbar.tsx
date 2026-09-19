import React from 'react';
import { WorkspaceTab } from '../types';
import { Sparkles, Mail, Calendar, FileText, Table, CheckSquare, Users, LogOut, Bot, Brain, Send, Cpu, Clock, Mic, Moon, Sun } from 'lucide-react';
import { User } from 'firebase/auth';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  user: User | null;
  onLogout: () => void;
  onOpenVoiceModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onLogout, onOpenVoiceModal }) => {
  const { theme, toggleTheme } = useTheme();

  const tabs = [
    { id: 'studio' as WorkspaceTab, label: 'Prompt Studio', icon: Bot },
    { id: 'brain' as WorkspaceTab, label: '2nd Brain & Memory', icon: Brain },
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
              <h1 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">AI Workspace Copilot</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Gemini Prompt Engineering Across Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Theme Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition cursor-pointer text-xs font-semibold shadow-xs bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700"
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden sm:inline">Light Mode</span>
                </>
              )}
            </button>

            <button
              onClick={onOpenVoiceModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 text-xs font-semibold rounded-xl transition shadow-xs cursor-pointer"
              title="Open Global Voice-to-Text Studio"
            >
              <Mic className="w-3.5 h-3.5 text-red-600 dark:text-red-400 animate-pulse" />
              <span>Voice Studio</span>
            </button>

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
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

