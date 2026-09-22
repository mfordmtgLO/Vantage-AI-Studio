/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>
 */

import React, { useState } from 'react';
import { WorkspaceTab } from '../types';
import { 
  Mail, Calendar, FileText, Table, CheckSquare, Users, Send, 
  Sparkles, ArrowRight, ExternalLink, RefreshCw, CheckCircle2,
  FolderOpen, Layers, Bot, Zap, Plus, Search, ShieldCheck
} from 'lucide-react';
import { useAccountPathway } from '../context/AccountPathwayContext';

interface GoogleAppsCommandDeckProps {
  activeTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  messageCount?: number;
  eventCount?: number;
  fileCount?: number;
  taskCount?: number;
  contactCount?: number;
  draftCount?: number;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export const GoogleAppsCommandDeck: React.FC<GoogleAppsCommandDeckProps> = ({
  activeTab,
  onSelectTab,
  messageCount = 0,
  eventCount = 0,
  fileCount = 0,
  taskCount = 0,
  contactCount = 0,
  draftCount = 18,
  onRefresh,
  isRefreshing = false
}) => {
  const { pathway, isWorkspaceConnected } = useAccountPathway();
  const [filterCategory, setFilterCategory] = useState<'all' | 'communication' | 'content' | 'productivity'>('all');

  const googleApps = [
    {
      id: 'gmail' as WorkspaceTab,
      name: 'Gmail',
      category: 'communication',
      tagline: 'Inbox & Smart Email Compose',
      description: 'AI email summaries, automated drafting, thread synthesis, and priority inbox scanning.',
      count: messageCount || 3,
      countLabel: 'emails',
      badgeColor: 'bg-red-500 text-white',
      borderGlow: 'hover:border-red-500/60 dark:hover:border-red-500/60',
      activeBorder: 'border-red-500 ring-2 ring-red-500/20 bg-red-50/40 dark:bg-red-950/30',
      iconBg: 'bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-950/60',
      accentColor: 'text-red-600 dark:text-red-400',
      icon: Mail,
      quickActions: [
        { label: 'Smart Inbox', tab: 'gmail' as WorkspaceTab },
        { label: 'Drafts (18)', tab: 'drafts' as WorkspaceTab }
      ],
      webUrl: 'https://mail.google.com'
    },
    {
      id: 'calendar' as WorkspaceTab,
      name: 'Google Calendar',
      category: 'communication',
      tagline: 'Schedule & Autonomous Concierge',
      description: 'Smart conflict resolution, 1-click meeting scheduling, attendee intelligence & time blocking.',
      count: eventCount || 3,
      countLabel: 'upcoming events',
      badgeColor: 'bg-blue-500 text-white',
      borderGlow: 'hover:border-blue-500/60 dark:hover:border-blue-500/60',
      activeBorder: 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/40 dark:bg-blue-950/30',
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-950/60',
      accentColor: 'text-blue-600 dark:text-blue-400',
      icon: Calendar,
      quickActions: [
        { label: 'Schedule Concierge', tab: 'calendar' as WorkspaceTab },
        { label: 'Sync Calendar', tab: 'calendar' as WorkspaceTab }
      ],
      webUrl: 'https://calendar.google.com'
    },
    {
      id: 'drive' as WorkspaceTab,
      name: 'Google Drive',
      category: 'content',
      tagline: 'Cloud Storage & File Discovery',
      description: 'Instant indexing of PDFs, proposals, spreadsheets, and shared team assets.',
      count: fileCount || 3,
      countLabel: 'indexed files',
      badgeColor: 'bg-amber-500 text-white',
      borderGlow: 'hover:border-amber-500/60 dark:hover:border-amber-500/60',
      activeBorder: 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/40 dark:bg-amber-950/30',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-950/60',
      accentColor: 'text-amber-600 dark:text-amber-400',
      icon: FolderOpen,
      quickActions: [
        { label: 'Drive Explorer', tab: 'drive' as WorkspaceTab },
        { label: 'Browse Storage', tab: 'drive' as WorkspaceTab }
      ],
      webUrl: 'https://drive.google.com'
    },
    {
      id: 'drive' as WorkspaceTab,
      name: 'Google Docs',
      category: 'content',
      tagline: 'Smart Contracts & Proposals',
      description: 'Zero-shot executive summaries, pre-approval letters, proposal authoring, and template library.',
      count: 12,
      countLabel: 'templates & docs',
      badgeColor: 'bg-indigo-500 text-white',
      borderGlow: 'hover:border-indigo-500/60 dark:hover:border-indigo-500/60',
      activeBorder: 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/40 dark:bg-indigo-950/30',
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/60',
      accentColor: 'text-indigo-600 dark:text-indigo-400',
      icon: FileText,
      quickActions: [
        { label: 'AI Docs Studio', tab: 'drive' as WorkspaceTab },
        { label: 'Contracts & Letters', tab: 'drive' as WorkspaceTab }
      ],
      webUrl: 'https://docs.google.com'
    },
    {
      id: 'sheets' as WorkspaceTab,
      name: 'Google Sheets',
      category: 'productivity',
      tagline: 'Relational SQL & Lead Purge',
      description: 'Natural language to SQL query engine, fuzzy duplicate deduplication, and financial calculators.',
      count: 240,
      countLabel: 'rows & datasets',
      badgeColor: 'bg-emerald-500 text-white',
      borderGlow: 'hover:border-emerald-500/60 dark:hover:border-emerald-500/60',
      activeBorder: 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/40 dark:bg-emerald-950/30',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/60',
      accentColor: 'text-emerald-600 dark:text-emerald-400',
      icon: Table,
      quickActions: [
        { label: 'Relational SQL Engine', tab: 'sheets' as WorkspaceTab },
        { label: 'Fuzzy Purge & Dedupe', tab: 'sheets' as WorkspaceTab }
      ],
      webUrl: 'https://sheets.google.com'
    },
    {
      id: 'tasks' as WorkspaceTab,
      name: 'Google Tasks',
      category: 'productivity',
      tagline: 'Priorities & Action Dispatcher',
      description: 'Auto-synthesize deliverables from meeting transcripts and emails into actionable to-do lists.',
      count: taskCount || 3,
      countLabel: 'pending tasks',
      badgeColor: 'bg-sky-500 text-white',
      borderGlow: 'hover:border-sky-500/60 dark:hover:border-sky-500/60',
      activeBorder: 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/40 dark:bg-sky-950/30',
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 dark:bg-sky-950/60',
      accentColor: 'text-sky-600 dark:text-sky-400',
      icon: CheckSquare,
      quickActions: [
        { label: '+ Add Priority Task', tab: 'tasks' as WorkspaceTab },
        { label: 'Organize Deliverables', tab: 'tasks' as WorkspaceTab }
      ],
      webUrl: 'https://tasks.google.com'
    },
    {
      id: 'contacts' as WorkspaceTab,
      name: 'Google Contacts',
      category: 'productivity',
      tagline: 'Client CRM & Relationship Map',
      description: 'Integrated address book, lead engagement logs, automated contact discovery, and phone CRM.',
      count: contactCount || 3,
      countLabel: 'contacts',
      badgeColor: 'bg-purple-500 text-white',
      borderGlow: 'hover:border-purple-500/60 dark:hover:border-purple-500/60',
      activeBorder: 'border-purple-500 ring-2 ring-purple-500/20 bg-purple-50/40 dark:bg-purple-950/30',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-950/60',
      accentColor: 'text-purple-600 dark:text-purple-400',
      icon: Users,
      quickActions: [
        { label: 'View Contact Book', tab: 'contacts' as WorkspaceTab },
        { label: 'Lead CRM Lookup', tab: 'contacts' as WorkspaceTab }
      ],
      webUrl: 'https://contacts.google.com'
    }
  ];

  const filteredApps = googleApps.filter(app => {
    if (filterCategory === 'all') return true;
    return app.category === filterCategory;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
      {/* Top Header & Fast Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                7 Google Workspace Apps Hub
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Connected
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any of the 7 official Google Apps below to launch autonomous workflows, manage data, or run Gemini AI copilot actions.
            </p>
          </div>
        </div>

        {/* Quick Filter Buttons & Sync */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterCategory === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All 7 Apps
            </button>
            <button
              onClick={() => setFilterCategory('communication')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterCategory === 'communication'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Inbox & Cal
            </button>
            <button
              onClick={() => setFilterCategory('content')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterCategory === 'content'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Drive & Docs
            </button>
            <button
              onClick={() => setFilterCategory('productivity')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition cursor-pointer ${
                filterCategory === 'productivity'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Sheets, Tasks, CRM
            </button>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              title="Refresh Google Workspace App Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Sync All</span>
            </button>
          )}
        </div>
      </div>

      {/* 7-App Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
        {filteredApps.map((app, index) => {
          const Icon = app.icon;
          const isSelected = activeTab === app.id;

          return (
            <div
              key={`${app.name}-${index}`}
              onClick={() => onSelectTab(app.id)}
              className={`group relative rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md ${
                isSelected
                  ? app.activeBorder
                  : `bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 ${app.borderGlow}`
              }`}
            >
              {/* Top Row: App Icon & Count Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs ${app.iconBg}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.badgeColor} shadow-2xs`}>
                    {app.count}
                  </span>
                </div>

                {/* Name & Tagline */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {app.name}
                    <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all text-blue-600 dark:text-blue-400" />
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 leading-snug">
                    {app.tagline}
                  </p>
                </div>

                {/* Description snippet */}
                <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {app.description}
                </p>
              </div>

              {/* Bottom: 1-Click Launch Button */}
              <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className={isSelected ? app.accentColor : 'text-slate-700 dark:text-slate-300'}>
                    {isSelected ? '● Active View' : 'Launch View'}
                  </span>
                  <a
                    href={app.webUrl}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-[10px] text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition p-0.5"
                    title={`Open ${app.name} in browser`}
                  >
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Quick Action Chips */}
                <div className="flex flex-wrap gap-1">
                  {app.quickActions.map((qa, qi) => (
                    <button
                      key={qi}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTab(qa.tab);
                      }}
                      className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 border border-slate-200 dark:border-slate-700 transition cursor-pointer truncate max-w-full"
                    >
                      {qa.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
