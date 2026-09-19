import React from 'react';
import { WorkspaceTab } from '../types';
import { Sparkles, Mail, Calendar, FileText, Table, CheckSquare, Users, LogOut, Bot, Brain } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, user, onLogout }) => {
  const tabs = [
    { id: 'studio' as WorkspaceTab, label: 'Prompt Studio', icon: Bot },
    { id: 'brain' as WorkspaceTab, label: '2nd Brain & Memory', icon: Brain },
    { id: 'gmail' as WorkspaceTab, label: 'Gmail', icon: Mail },
    { id: 'calendar' as WorkspaceTab, label: 'Calendar', icon: Calendar },
    { id: 'drive' as WorkspaceTab, label: 'Drive & Docs', icon: FileText },
    { id: 'sheets' as WorkspaceTab, label: 'Sheets', icon: Table },
    { id: 'tasks' as WorkspaceTab, label: 'Tasks', icon: CheckSquare },
    { id: 'contacts' as WorkspaceTab, label: 'Contacts', icon: Users },
  ];


  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-900 leading-tight">AI Workspace Copilot</h1>
              <p className="text-xs text-slate-500">Gemini Prompt Engineering Across Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                <img
                  src={user.photoURL || 'https://www.gravatar.com/avatar/?d=mp'}
                  alt={user.displayName || 'User'}
                  className="w-6 h-6 rounded-full"
                />
                <span className="text-xs font-medium text-slate-700">{user.displayName || user.email}</span>
              </div>
            )}
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
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
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
