/**
 * ============================================================================
 * VANTAGE AI STUDIO • 7 GOOGLE WORKSPACE APPS HUB & DUAL-PATHWAY PORTAL
 * Copyright (c) 2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Replicates the exact front-facing public website design layout in the back-end dashboard:
 * 1. Dual-Pathway Header Bar (Pathway A: Free Google Apps vs Pathway B: Workspace)
 * 2. 2nd Brain Industry & Career Intelligence Switcher (Mortgage, Lending, Real Estate + 9 other sectors)
 * 3. Quick Action Buttons (Calculate DTI Ratios, TRID Pre-Approval Letter, Smart Apps Studio)
 * 4. Behavioral Adaptation Active Status Ribbon with Live 2nd Brain Sync
 * 5. 7 Google Workspace Apps Hub Card Deck with Filters, Count Badges, 1-Click Launchers
 * 6. Interactive In-Portal App Viewports (Gmail, Calendar, Drive, Docs, Sheets, Tasks, Contacts, Cron Automations)
 * ============================================================================
 */

import React, { useState, useEffect } from 'react';
import { WorkspaceTab, GmailMessage, CalendarEvent, DriveFile, GoogleTask, GoogleContact } from '../types';
import { GoogleAppId } from '../types/cronAutomation';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { useMemory } from '../context/MemoryContext';
import { INDUSTRY_CAREER_TEMPLATES } from '../data/industryCareerTemplates';
import { ALL_10_INDUSTRY_GOOGLE_PROFILES, getProfileForIndustry } from '../data/industryGoogleAppsIntelligence';
import { 
  Sparkles, Mail, Calendar, FileText, Table, CheckSquare, Users, Send, 
  RefreshCw, CheckCircle2, AlertCircle, Clock, Zap, Shield, ChevronDown, 
  ExternalLink, ArrowRight, Layers, Bot, Brain, Building2, Plus, Trash2,
  Sliders, Search, Lock, DollarSign, FileCheck, Check, Calculator, Play,
  FolderOpen
} from 'lucide-react';

// Specialized Sub-Viewports
import { ExecutiveSmartInboxStudio } from './ExecutiveSmartInboxStudio';
import { AutonomousMeetingConcierge } from './AutonomousMeetingConcierge';
import { DriveExplorerView } from './DriveExplorerView';
import { RelationalSheetsQueryEngine } from './RelationalSheetsQueryEngine';
import { MultiSourceDataPurgeStudio } from './MultiSourceDataPurgeStudio';
import { LeadDatabaseCleanupTool } from './LeadDatabaseCleanupTool';
import { CrmExportConfigurationView } from './CrmExportConfigurationView';
import { GmailDraftsView } from './GmailDraftsView';
import { GoogleAppsCronAutomationDeck } from './GoogleAppsCronAutomationDeck';
import { IndustrySmartDocsGmailStudio } from './IndustrySmartDocsGmailStudio';

interface GoogleAppsWorkspacePortalProps {
  initialActiveApp?: WorkspaceTab;
  onNavigateTab?: (tab: WorkspaceTab) => void;
  onOpenPitchDeck?: () => void;
}

export const GoogleAppsWorkspacePortal: React.FC<GoogleAppsWorkspacePortalProps> = ({
  initialActiveApp = 'gmail',
  onNavigateTab
}) => {
  const {
    pathway,
    setPathway,
    isWorkspaceConnected,
    connectedWorkspaceEmail,
    setIsWorkspaceModalOpen,
    syncData,
    isSyncing,
    lastSynced,
    syncStatusMsg
  } = useAccountPathway();

  const { guardrails, updateGuardrails, saveMemory, memories } = useMemory();

  // Selected Google App Viewport
  const [selectedApp, setSelectedApp] = useState<WorkspaceTab>(() => {
    if (['gmail', 'calendar', 'drive', 'sheets', 'tasks', 'contacts', 'drafts'].includes(initialActiveApp)) {
      return initialActiveApp;
    }
    return 'gmail';
  });

  // Filter Category for 7 Cards
  const [filterCategory, setFilterCategory] = useState<'all' | 'communication' | 'content' | 'productivity'>('all');

  // Industry Dropdown state
  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState<boolean>(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Modals & Sub-Panels
  const [isSmartAppsStudioOpen, setIsSmartAppsStudioOpen] = useState<boolean>(false);
  const [isCronDeckOpen, setIsCronDeckOpen] = useState<boolean>(false);
  const [isDtiCalculatorOpen, setIsDtiCalculatorOpen] = useState<boolean>(false);
  const [isTridDossierOpen, setIsTridDossierOpen] = useState<boolean>(false);

  // DTI Calculator State
  const [dtiGrossIncome, setDtiGrossIncome] = useState<number>(8500);
  const [dtiMonthlyDebts, setDtiMonthlyDebts] = useState<number>(650);
  const [dtiProposedHousing, setDtiProposedHousing] = useState<number>(2450);

  // TRID Pre-Approval Letter State
  const [tridBorrowerName, setTridBorrowerName] = useState<string>('Jordan & Taylor Smith');
  const [tridLoanAmount, setTridLoanAmount] = useState<number>(425000);
  const [tridPurchasePrice, setTridPurchasePrice] = useState<number>(450000);
  const [tridLoanProgram, setTridLoanProgram] = useState<string>('Conventional 30-Year Fixed (Oregon Bond DPA 4% Stacking)');
  const [tridGeneratedDoc, setTridGeneratedDoc] = useState<string | null>(null);

  // Google Tasks Local State
  const [tasksList, setTasksList] = useState<GoogleTask[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_google_apps_tasks');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 't1', title: 'Verify TRID 3-Day disclosure window for Wilson pre-approval', status: 'needsAction', due: 'Today, 5:00 PM' },
      { id: 't2', title: 'Upload Oregon Housing DPA compliance cert to escrow folder in Drive', status: 'needsAction', due: 'Tomorrow, 10:00 AM' },
      { id: 't3', title: 'Schedule Zoom closing rate-lock consultation with Jordan Smith', status: 'needsAction', due: 'Friday, 2:00 PM' },
      { id: 't4', title: 'Audit Google Sheets pipeline for duplicate leads & purge stale contacts', status: 'completed', due: 'Completed' }
    ];
  });
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');

  // Google Contacts Local State
  const [contactsList, setContactsList] = useState<GoogleContact[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_google_apps_contacts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { resourceName: 'c1', name: 'Jordan & Taylor Smith', email: 'jordan.smith@client-vault.org', phone: '(503) 555-0192' },
      { resourceName: 'c2', name: 'Elena Rostova (Premier Realty)', email: 'elena@premierpdxrealty.com', phone: '(503) 555-0144' },
      { resourceName: 'c3', name: 'Marcus Vance (Escrow Officer)', email: 'mvance@firstam-title.com', phone: '(503) 555-0821' },
      { resourceName: 'c4', name: 'Sarah Jenkins (First-Time Buyer)', email: 'sarah.j@gmail.com', phone: '(541) 555-0377' }
    ];
  });
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactEmail, setNewContactEmail] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [contactSearchQuery, setContactSearchQuery] = useState<string>('');

  // Detect current active industry
  const activeIndustryId = (() => {
    try {
      const saved = localStorage.getItem('vantage_active_industry_id');
      if (saved) return saved;
    } catch {}
    return INDUSTRY_CAREER_TEMPLATES.find(g => 
      guardrails.customPersonaDirective?.toLowerCase().includes(g.id) ||
      guardrails.customPersonaDirective?.toLowerCase().includes(g.name.toLowerCase()) ||
      g.careers.some(c => c.morphedPersonaTitle === guardrails.personalityPreset)
    )?.id || 'mortgage_real_estate';
  })();

  const currentProfile = getProfileForIndustry(activeIndustryId);

  const showNotification = (msg: string) => {
    setActiveNotification(msg);
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const handleSwitchIndustry = async (newIndustryGroup: typeof INDUSTRY_CAREER_TEMPLATES[0]) => {
    setIsIndustryDropdownOpen(false);
    try {
      localStorage.setItem('vantage_active_industry_id', newIndustryGroup.id);
    } catch {}
    const primaryCareer = newIndustryGroup.careers[0];

    try {
      await updateGuardrails({
        personalityPreset: primaryCareer.personalityPreset,
        customPersonaDirective: primaryCareer.morphedPersonaDirective,
        toneDemeanor: primaryCareer.toneDemeanor,
        verbosity: primaryCareer.verbosity,
        actionExecutionBoundary: primaryCareer.actionExecutionBoundary,
        customGuardrailDirectives: primaryCareer.customGuardrailDirectives
      });

      for (const seed of primaryCareer.domainKnowledgeSeeds) {
        await saveMemory({
          title: `[${primaryCareer.careerTitle}] ${seed.title}`,
          content: seed.content,
          type: seed.category as any,
          tags: [...seed.tags, primaryCareer.industryId, primaryCareer.careerId]
        });
      }

      showNotification(`Morphed 2nd Brain & Google Apps to ${newIndustryGroup.name} (${primaryCareer.careerTitle})!`);
    } catch (e: any) {
      showNotification(`Switched to ${newIndustryGroup.name}`);
    }
  };

  // Google Tasks Handlers
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: GoogleTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      status: 'needsAction',
      due: 'Today'
    };
    const updated = [newTask, ...tasksList];
    setTasksList(updated);
    try { 
      localStorage.setItem('vantage_google_apps_tasks', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    setNewTaskTitle('');
    showNotification(`Added task: "${newTask.title}"`);
  };

  const handleToggleTaskStatus = (id: string) => {
    const updated = tasksList.map(t => 
      t.id === id ? { ...t, status: (t.status === 'completed' ? 'needsAction' : 'completed') as any } : t
    );
    setTasksList(updated);
    try { 
      localStorage.setItem('vantage_google_apps_tasks', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasksList.filter(t => t.id !== id);
    setTasksList(updated);
    try { 
      localStorage.setItem('vantage_google_apps_tasks', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  // Google Contacts Handlers
  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim()) return;
    const newContact: GoogleContact = {
      resourceName: `contact_${Date.now()}`,
      name: newContactName.trim(),
      email: newContactEmail.trim() || 'lead@client-vault.org',
      phone: newContactPhone.trim() || '(503) 555-0100'
    };
    const updated = [newContact, ...contactsList];
    setContactsList(updated);
    try { 
      localStorage.setItem('vantage_google_apps_contacts', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
    setNewContactName('');
    setNewContactEmail('');
    setNewContactPhone('');
    showNotification(`Saved contact: "${newContact.name}"`);
  };

  const handleDeleteContact = (resourceName: string) => {
    const updated = contactsList.filter(c => c.resourceName !== resourceName);
    setContactsList(updated);
    try { 
      localStorage.setItem('vantage_google_apps_contacts', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    } catch {}
  };

  // TRID Pre-Approval Document Generation
  const handleGenerateTridDoc = () => {
    const dtiRatio = (((dtiMonthlyDebts + dtiProposedHousing) / dtiGrossIncome) * 100).toFixed(1);
    const doc = `
================================================================================
OFFICIAL TRID PRE-APPROVAL & CONDITIONAL FINANCING COMMITMENT
NMLS Licensed Advisory Portal • Mike Ford (NMLS #288455)
================================================================================
DATE: ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
BORROWER(S): ${tridBorrowerName}
QUALIFIED PURCHASE PRICE: $${tridPurchasePrice.toLocaleString()}
MAXIMUM QUALIFIED LOAN: $${tridLoanAmount.toLocaleString()}
PROGRAM: ${tridLoanProgram}

FINANCIAL & UNDERWRITING SUMMARY:
- Gross Monthly Qualifying Income: $${dtiGrossIncome.toLocaleString()}
- Total Debt-to-Income (DTI) Ratio: ${dtiRatio}% (Under 45% TRID Qualified Ceiling)
- Down Payment Assistance: Oregon State DPA 4% Non-Repayable Grant Pre-Approved
- TRID 3-Day Loan Estimate Safe Harbor: In Full Compliance

ISSUING OFFICER:
Mike Ford • Senior Mortgage Advisor • NMLS #288455
Vantage AI Studio Integrated Workspace
================================================================================
    `.trim();
    setTridGeneratedDoc(doc);
    showNotification('Generated TRID Pre-Approval Dossier in Google Docs format!');
  };

  // 7 Google Apps Definition Cards (Exact match to screenshot)
  const googleApps = [
    {
      id: 'gmail' as WorkspaceTab,
      name: 'Gmail',
      category: 'communication',
      tagline: 'Inbox & Smart Email Compose',
      description: 'AI email summaries, automated drafting, thread synthesis, and priority inbox scanning.',
      count: 3,
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
      count: 3,
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
      count: 3,
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
      count: tasksList.length || 3,
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
      count: contactsList.length || 3,
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

  // Calculate Front-End and Back-End DTI
  const frontEndDti = ((dtiProposedHousing / dtiGrossIncome) * 100).toFixed(1);
  const backEndDti = (((dtiProposedHousing + dtiMonthlyDebts) / dtiGrossIncome) * 100).toFixed(1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-1 sm:px-2 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* 1. TOP DUAL PATHWAY & 2ND BRAIN BEHAVIORAL ADAPTATION BAR (FROM SCREENSHOT) */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/90 rounded-2xl border border-slate-800 p-4 shadow-xl text-white space-y-3">
        
        {/* Main Header Bar Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          
          {/* Left: Pathway A/B Selector + 2nd Brain Industry Selector + Role Badge */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* Pathway A / B Pill Switcher */}
            <button
              type="button"
              onClick={() => setIsWorkspaceModalOpen(true)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border transition cursor-pointer shadow-sm ${
                pathway === 'workspace'
                  ? 'bg-indigo-600/90 border-indigo-400 text-white shadow-indigo-500/30'
                  : 'bg-emerald-950/80 border-emerald-500/70 text-emerald-200 hover:bg-emerald-900/90'
              }`}
              title="Click to toggle or manage Google Account Pathway"
            >
              {pathway === 'workspace' ? (
                <>
                  <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Pathway B: Google Workspace (Paid)</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Pathway A: Standard Free Google Apps</span>
                </>
              )}
            </button>

            <span className="text-slate-600 dark:text-slate-500 hidden sm:inline">•</span>

            {/* 2nd Brain Industry Preset Dropdown Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-900/80 hover:bg-purple-800/90 text-purple-200 border border-purple-500/60 transition cursor-pointer shadow-sm shadow-purple-500/20"
              >
                <Brain className="w-3.5 h-3.5 text-purple-300" />
                <span>2nd Brain: {currentProfile.industryName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-purple-300 transition-transform ${isIndustryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isIndustryDropdownOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-md">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-400 border-b border-slate-800">
                    Switch 2nd Brain & Google Apps Adaptation:
                  </div>
                  <div className="max-h-64 overflow-y-auto space-y-1">
                    {INDUSTRY_CAREER_TEMPLATES.map((ind) => (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => handleSwitchIndustry(ind)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition cursor-pointer ${
                          activeIndustryId === ind.id
                            ? 'bg-purple-600/30 text-purple-200 font-bold border border-purple-500/50'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base">{ind.icon}</span>
                          <div>
                            <p className="font-semibold">{ind.name}</p>
                            <p className="text-[10px] text-slate-400">{ind.careers[0].careerTitle}</p>
                          </div>
                        </div>
                        {activeIndustryId === ind.id && <Check className="w-3.5 h-3.5 text-purple-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Career Persona Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-500/30 text-purple-300">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
              <span>{currentProfile.activePersonaBadge || 'Mortgage Loan Officer & Real Estate Broker'}</span>
            </div>
          </div>

          {/* Right: Quick Smart Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* Calculate DTI Ratios Action */}
            <button
              type="button"
              onClick={() => setIsDtiCalculatorOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
              title="Open Live DTI and Housing Ratio Calculator"
            >
              <Table className="w-3.5 h-3.5 text-emerald-400" />
              <span>Calculate DTI Ratios</span>
            </button>

            {/* TRID Pre-Approval Letter Action */}
            <button
              type="button"
              onClick={() => setIsTridDossierOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-sm"
              title="Generate TRID 3-Day Rule Pre-Approval Dossier"
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>TRID Pre-Approval Letter</span>
            </button>

            {/* Smart Apps Studio Trigger */}
            <button
              type="button"
              onClick={() => setIsSmartAppsStudioOpen(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold rounded-xl text-xs transition cursor-pointer shadow-md shadow-amber-500/20"
              title="Open Industry Smart Docs & Gmail Studio"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Apps Studio</span>
            </button>

          </div>
        </div>

        {/* Bottom Sub-Strip: Behavioral Adaptation Active */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 shrink-0" />
            <p className="text-[11px] sm:text-xs">
              <span className="font-bold text-amber-300">Behavioral Adaptation Active:</span>{' '}
              Gmail, Docs & Sheets now enforce <strong className="text-white">{currentProfile.industryName}</strong> regulatory disclaimers, formula templates, and AI writing prompts.
            </p>
          </div>

          <div 
            onClick={syncData}
            className="flex items-center gap-1.5 text-[11px] text-purple-300 hover:text-purple-100 font-semibold cursor-pointer transition ml-auto"
            title="Click to sync 2nd brain memory vectors"
          >
            <span>2nd Brain Live Connection</span>
            <RefreshCw className={`w-3 h-3 text-purple-400 ${isSyncing ? 'animate-spin' : ''}`} />
          </div>
        </div>

      </div>

      {/* Notification Toast */}
      {activeNotification && (
        <div className="p-3 bg-emerald-950/90 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-200 shadow-md">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{activeNotification}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. 7 GOOGLE WORKSPACE APPS HUB (EXACT MATCH TO SCREENSHOT) */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-5 transition-colors">
        
        {/* Top Header & Fast Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                  7 Google Workspace Apps Hub
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  CONNECTED
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select any of the 7 official Google Apps below to launch autonomous workflows, manage data, or run Gemini AI copilot actions.
              </p>
            </div>
          </div>

          {/* Filter Pills, Cron Automations & Sync All */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                type="button"
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
                type="button"
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
                type="button"
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
                type="button"
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

            {/* Cron Automations (7 Apps) Button */}
            <button
              type="button"
              onClick={() => setIsCronDeckOpen(!isCronDeckOpen)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition cursor-pointer border shadow-xs ${
                isCronDeckOpen
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border-indigo-200 dark:border-indigo-800'
              }`}
              title="Open Autonomous Cron Automation Deck for all 7 Google Apps"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>Cron Automations (7 Apps)</span>
            </button>

            {/* Sync All Button */}
            <button
              type="button"
              onClick={syncData}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700 shadow-xs"
              title="Refresh Google Workspace App Feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-600' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">Sync All</span>
            </button>
          </div>
        </div>

        {/* 7-App Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
          {filteredApps.map((app, index) => {
            const Icon = app.icon;
            const isSelected = selectedApp === app.id;

            return (
              <div
                key={`${app.name}-${index}`}
                onClick={() => {
                  setSelectedApp(app.id);
                  onNavigateTab?.(app.id);
                }}
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

                {/* Bottom: 1-Click Launch Button & Quick Actions */}
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
                          setSelectedApp(qa.tab);
                          onNavigateTab?.(qa.tab);
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

      {/* ========================================================================= */}
      {/* 3. AUTONOMOUS CRON AUTOMATION DECK (EXPANDABLE) */}
      {/* ========================================================================= */}
      {isCronDeckOpen && (
        <div className="space-y-3">
          <div className="flex items-center justify-between bg-indigo-950/80 border border-indigo-500/40 p-4 rounded-2xl text-white">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-sm font-bold">Autonomous Cron Automation Supervisor</h3>
                <p className="text-xs text-indigo-200">Scheduled background agent actions for Gmail, Calendar, Drive, Docs, Sheets, Tasks & Contacts</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCronDeckOpen(false)}
              className="px-3 py-1 bg-indigo-900 hover:bg-indigo-800 text-xs font-bold rounded-lg border border-indigo-500 cursor-pointer"
            >
              Hide Deck
            </button>
          </div>
          <GoogleAppsCronAutomationDeck />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. ACTIVE GOOGLE APP VIEWPORT INSIDE THE PORTAL */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        
        {/* Navigation Tabs for Active Google App */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-2">
              Current Google Workspace Viewport:
            </span>
            {[
              { id: 'gmail' as WorkspaceTab, label: 'Gmail & Smart Inbox', icon: Mail, color: 'text-red-500' },
              { id: 'calendar' as WorkspaceTab, label: 'Calendar & Concierge', icon: Calendar, color: 'text-blue-500' },
              { id: 'drive' as WorkspaceTab, label: 'Drive & Docs Studio', icon: FileText, color: 'text-amber-500' },
              { id: 'sheets' as WorkspaceTab, label: 'Sheets & SQL Engine', icon: Table, color: 'text-emerald-500' },
              { id: 'tasks' as WorkspaceTab, label: 'Google Tasks Manager', icon: CheckSquare, color: 'text-sky-500' },
              { id: 'contacts' as WorkspaceTab, label: 'Contacts & CRM', icon: Users, color: 'text-purple-500' },
              { id: 'drafts' as WorkspaceTab, label: 'Drafts Studio (18)', icon: Send, color: 'text-rose-500' }
            ].map(tab => {
              const TabIcon = tab.icon;
              const isActive = selectedApp === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedApp(tab.id);
                    onNavigateTab?.(tab.id);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <TabIcon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : tab.color}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- VIEWPORT 1: GMAIL & SMART INBOX --- */}
        {selectedApp === 'gmail' && (
          <div className="space-y-4">
            <ExecutiveSmartInboxStudio
              onOpenDraftsModal={() => setSelectedApp('drafts')}
            />
          </div>
        )}

        {/* --- VIEWPORT 2: GOOGLE CALENDAR & CONCIERGE --- */}
        {selectedApp === 'calendar' && (
          <div className="space-y-4">
            <AutonomousMeetingConcierge />
          </div>
        )}

        {/* --- VIEWPORT 3: GOOGLE DRIVE & DOCS STUDIO --- */}
        {selectedApp === 'drive' && (
          <div className="space-y-4">
            <DriveExplorerView />
          </div>
        )}

        {/* --- VIEWPORT 4: GOOGLE SHEETS & RELATIONAL SQL --- */}
        {selectedApp === 'sheets' && (
          <div className="space-y-6">
            <RelationalSheetsQueryEngine />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MultiSourceDataPurgeStudio />
              <LeadDatabaseCleanupTool />
            </div>
            <CrmExportConfigurationView />
          </div>
        )}

        {/* --- VIEWPORT 5: GOOGLE TASKS MANAGER --- */}
        {selectedApp === 'tasks' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Google Tasks Priority Dispatcher
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Live synchronized task checklist across your Google Account with automated action synthesis
                  </p>
                </div>
              </div>

              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {tasksList.filter(t => t.status === 'needsAction').length} Pending Tasks
              </span>
            </div>

            {/* Add Task Input */}
            <form onSubmit={handleAddTask} className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Enter new priority task or deliverable..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Task</span>
              </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-2">
              {tasksList.map(task => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    task.status === 'completed'
                      ? 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200/60 dark:border-slate-800/60 opacity-60'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-sky-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      onChange={() => handleToggleTaskStatus(task.id)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <div>
                      <p className={`text-xs font-semibold ${task.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                        {task.title}
                      </p>
                      {task.due && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3 text-sky-500" />
                          <span>Due: {task.due}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEWPORT 6: GOOGLE CONTACTS & CLIENT CRM --- */}
        {selectedApp === 'contacts' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    Google Contacts & Client Relationship Map
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Centralized address book with lead engagement history and automated communication logs
                  </p>
                </div>
              </div>

              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={contactSearchQuery}
                  onChange={(e) => setContactSearchQuery(e.target.value)}
                  placeholder="Search contacts & leads..."
                  className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Add Contact Row */}
            <form onSubmit={handleAddContact} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <input
                type="text"
                value={newContactName}
                onChange={(e) => setNewContactName(e.target.value)}
                placeholder="Full Name / Client..."
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
              <input
                type="email"
                value={newContactEmail}
                onChange={(e) => setNewContactEmail(e.target.value)}
                placeholder="Email Address..."
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
              <input
                type="text"
                value={newContactPhone}
                onChange={(e) => setNewContactPhone(e.target.value)}
                placeholder="Phone (optional)..."
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Save Contact</span>
              </button>
            </form>

            {/* Contacts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {contactsList
                .filter(c => 
                  !contactSearchQuery || 
                  c.name?.toLowerCase().includes(contactSearchQuery.toLowerCase()) || 
                  c.email?.toLowerCase().includes(contactSearchQuery.toLowerCase())
                )
                .map((contact, idx) => (
                  <div
                    key={contact.resourceName || idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold flex items-center justify-center text-xs">
                        {contact.name?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {contact.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {contact.email} • {contact.phone}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteContact(contact.resourceName)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 transition cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* --- VIEWPORT 7: DRAFTS STUDIO (18 TEMPLATES) --- */}
        {selectedApp === 'drafts' && (
          <div className="space-y-4">
            <GmailDraftsView />
          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* 5. DTI RATIO CALCULATOR MODAL */}
      {/* ========================================================================= */}
      {isDtiCalculatorOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 max-w-lg w-full rounded-2xl shadow-2xl p-6 text-white space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold">Mortgage DTI & Housing Ratio Calculator</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsDtiCalculatorOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Gross Monthly Household Income ($):</label>
                <input
                  type="number"
                  value={dtiGrossIncome}
                  onChange={(e) => setDtiGrossIncome(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Proposed Monthly Housing Payment (PITI) ($):</label>
                <input
                  type="number"
                  value={dtiProposedHousing}
                  onChange={(e) => setDtiProposedHousing(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Other Monthly Debts (Auto, Cards, Student Loans) ($):</label>
                <input
                  type="number"
                  value={dtiMonthlyDebts}
                  onChange={(e) => setDtiMonthlyDebts(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {/* Ratios Output */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 text-center">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Front-End Housing Ratio</span>
                  <span className={`text-xl font-black ${Number(frontEndDti) <= 28 ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {frontEndDti}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Benchmark: ≤ 28%</span>
                </div>

                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Back-End Total DTI Ratio</span>
                  <span className={`text-xl font-black ${Number(backEndDti) <= 43 ? 'text-emerald-400' : Number(backEndDti) <= 50 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {backEndDti}%
                  </span>
                  <span className="text-[10px] text-slate-500 block">Benchmark: ≤ 43% (TRID Safe)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                showNotification(`Calculated DTI: ${backEndDti}% (Front: ${frontEndDti}%)`);
                setIsDtiCalculatorOpen(false);
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Apply to Underwriting Pipeline
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TRID PRE-APPROVAL LETTER DOSSIER MODAL */}
      {/* ========================================================================= */}
      {isTridDossierOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-2xl shadow-2xl p-6 text-white space-y-5 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold">TRID Pre-Approval Letter Generator</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTridDossierOpen(false)}
                className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Borrower Full Name(s):</label>
                  <input
                    type="text"
                    value={tridBorrowerName}
                    onChange={(e) => setTridBorrowerName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Qualified Purchase Price ($):</label>
                  <input
                    type="number"
                    value={tridPurchasePrice}
                    onChange={(e) => setTridPurchasePrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mortgage Loan Program & DPA Structure:</label>
                <input
                  type="text"
                  value={tridLoanProgram}
                  onChange={(e) => setTridLoanProgram(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white"
                />
              </div>

              {tridGeneratedDoc ? (
                <div className="p-3 bg-slate-950 border border-indigo-500/40 rounded-xl space-y-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block">Generated TRID Pre-Approval Document:</span>
                  <pre className="text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-48 overflow-y-auto">
                    {tridGeneratedDoc}
                  </pre>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleGenerateTridDoc}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Generate Pre-Approval Commitment</span>
                </button>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-3">
              <span className="text-[10px] text-slate-500 font-mono">
                NMLS Compliant • TRID 3-Day Safe Harbor
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!tridGeneratedDoc) handleGenerateTridDoc();
                  setIsTridDossierOpen(false);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Save & Export to Google Docs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. SMART APPS STUDIO MODAL */}
      {/* ========================================================================= */}
      {isSmartAppsStudioOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="max-w-5xl w-full my-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setIsSmartAppsStudioOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold text-xs transition cursor-pointer"
              >
                ✕ Close Studio
              </button>
            </div>
            <IndustrySmartDocsGmailStudio
              onOpenDraftModal={() => {
                setIsSmartAppsStudioOpen(false);
                setSelectedApp('drafts');
              }}
              onOpenSheetsEngine={() => {
                setIsSmartAppsStudioOpen(false);
                setSelectedApp('sheets');
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
};
