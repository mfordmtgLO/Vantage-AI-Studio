/**
 * ============================================================================
 * VANTAGE AI STUDIO • GOOGLE APPS STYLE 9-DOT LAUNCHER & PERSISTENT SIDEBAR
 * Copyright (c) 2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Provides:
 * 1. Google Apps "Waffle" (9-Dot) Grid Overlay Menu
 * 2. Persistent / Collapsible Docked Side-Panel (Left or Right dock)
 * 3. Fast Interactive Filter & Keyboard Shortcut Dispatcher (Cmd/Ctrl + B)
 * 4. Direct 1-click access to all 4-in-1 Suite Modules, 7 Google Workspace Apps,
 *    Executive Calculators (DTI, TRID, Cron), BYOK, and Commercial Pitch Deck.
 * ============================================================================
 */

import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceTab } from '../types';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { useMemory } from '../context/MemoryContext';
import { useTheme } from '../context/ThemeContext';
import { getWorkspaceNotificationCounts, ModuleNotificationCounts } from '../utils/workspaceNotifications';
import { 
  Sparkles, Mail, Calendar, FileText, Table, CheckSquare, Users, 
  Bot, Brain, Home, Mic, Layers, LayoutGrid, X, Search, Pin, 
  PinOff, ChevronRight, ChevronLeft, ExternalLink, Zap, Key, 
  Building2, CheckCircle2, Sliders, Shield, ArrowRight, Globe,
  Briefcase, Code, Compass, FolderOpen, Send, DollarSign, Calculator,
  Columns, Bell, GripVertical, RotateCcw, ArrowUp, ArrowDown, Check,
  Sun, Moon, Target
} from 'lucide-react';

const DEFAULT_FLAGSHIP_ORDER: string[] = ['suite', 'google_apps', 'studio', 'brain', 'real_estate', 'orchestrator'];
const DEFAULT_GOOGLE_APPS_ORDER: string[] = ['gmail', 'calendar', 'drive', 'docs', 'sheets', 'tasks', 'contacts'];
const DEFAULT_TOOLS_ORDER: string[] = ['drafts', 'commercial_strategy', 'dev_roadmap', 'admin_plugins'];

function getSavedOrder(key: string, defaultOrder: string[]): string[] {
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const valid = parsed.filter(id => defaultOrder.includes(id));
        const missing = defaultOrder.filter(id => !valid.includes(id));
        return [...valid, ...missing];
      }
    }
  } catch {}
  return defaultOrder;
}

export interface GoogleAppsSidebarLauncherProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  isOpen: boolean;
  onClose: () => void;
  isPinned: boolean;
  onTogglePin: () => void;
  dockSide?: 'left' | 'right';
  onToggleDockSide?: () => void;
  sidebarWidth?: number;
  onSidebarWidthChange?: (width: number) => void;
  onResizeStateChange?: (isResizing: boolean) => void;
  onOpenVoiceModal?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenByokDrawer?: () => void;
  onOpenLicenseStudio?: () => void;
  onOpenScaffolding?: () => void;
  onOpenPublicWebsite?: () => void;
}

export const GoogleAppsSidebarLauncher: React.FC<GoogleAppsSidebarLauncherProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
  isPinned,
  onTogglePin,
  dockSide = 'left',
  onToggleDockSide,
  sidebarWidth = 336,
  onSidebarWidthChange,
  onResizeStateChange,
  onOpenVoiceModal,
  onOpenPitchDeck,
  onOpenByokDrawer,
  onOpenLicenseStudio,
  onOpenScaffolding,
  onOpenPublicWebsite
}) => {
  const { pathway, setIsWorkspaceModalOpen, connectedWorkspaceEmail } = useAccountPathway();
  const { guardrails } = useMemory();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'flagship' | 'google_apps' | 'tools'>('all');
  const [notificationCounts, setNotificationCounts] = useState<ModuleNotificationCounts>(getWorkspaceNotificationCounts);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Resize Handle Dragging State
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(sidebarWidth);

  const handleResizeStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    startXRef.current = clientX;
    startWidthRef.current = sidebarWidth;
    setIsResizing(true);
    if (onResizeStateChange) onResizeStateChange(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!isResizing) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const deltaX = clientX - startXRef.current;
      let newWidth = dockSide === 'left' 
        ? startWidthRef.current + deltaX 
        : startWidthRef.current - deltaX;

      const minWidth = 240;
      const maxWidth = Math.min(650, window.innerWidth - 200);
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));

      if (onSidebarWidthChange) {
        onSidebarWidthChange(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
        if (onResizeStateChange) onResizeStateChange(false);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isResizing, dockSide, onSidebarWidthChange]);

  // Drag-and-Drop Ordered State with localStorage Persistence
  const [flagshipOrder, setFlagshipOrder] = useState<string[]>(() => 
    getSavedOrder('vantage_sidebar_flagship_order', DEFAULT_FLAGSHIP_ORDER)
  );
  const [googleAppsOrder, setGoogleAppsOrder] = useState<string[]>(() => 
    getSavedOrder('vantage_sidebar_google_apps_order', DEFAULT_GOOGLE_APPS_ORDER)
  );
  const [toolsOrder, setToolsOrder] = useState<string[]>(() => 
    getSavedOrder('vantage_sidebar_tools_order', DEFAULT_TOOLS_ORDER)
  );

  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [draggedCategory, setDraggedCategory] = useState<'flagship' | 'google_apps' | 'tools' | null>(null);
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState<boolean>(false);
  const [showSavedFeedback, setShowSavedFeedback] = useState<boolean>(false);

  // Auto-refresh notification counts
  useEffect(() => {
    const refreshCounts = () => {
      setNotificationCounts(getWorkspaceNotificationCounts());
    };
    refreshCounts();
    const interval = setInterval(refreshCounts, 3000);
    window.addEventListener('storage', refreshCounts);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', refreshCounts);
    };
  }, []);

  // Focus search input when overlay opens
  useEffect(() => {
    if (isOpen && !isPinned) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen, isPinned]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isPinned) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isPinned, onClose]);

  // 1. Flagship 4-in-1 Suite Modules
  const flagshipModules = [
    {
      id: 'suite' as WorkspaceTab,
      name: 'Vantage AI Suite',
      subtitle: 'Unified 4-in-1 Platform Pack',
      category: 'flagship',
      icon: Sparkles,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-950/60',
      badge: '4-in-1',
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
      notificationCount: 0,
      isUrgent: false,
      description: 'Master control dashboard integrating Studio, 2nd Brain, Real Estate & Voice Orchestration.'
    },
    {
      id: 'google_apps' as WorkspaceTab,
      name: '7 Google Apps Hub',
      subtitle: 'Dual-Pathway Portal & Feeds',
      category: 'flagship',
      icon: Layers,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/60',
      badge: `${notificationCounts.totalPending} Pending`,
      badgeColor: 'bg-indigo-600 text-white font-bold',
      notificationCount: notificationCounts.totalPending,
      isUrgent: notificationCounts.totalPending > 0,
      description: 'All 7 Google Workspace apps (Gmail, Calendar, Drive, Docs, Sheets, Tasks, Contacts) in one hub.'
    },
    {
      id: 'studio' as WorkspaceTab,
      name: 'Prompt Studio & Copilot',
      subtitle: 'AI Multi-Persona Engine',
      category: 'flagship',
      icon: Bot,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-950/60',
      badge: 'AI Studio',
      badgeColor: 'bg-blue-600 text-white font-bold',
      notificationCount: 0,
      isUrgent: false,
      description: 'Zero-shot prompt templates, autonomous multi-turn reasoning, and customizable guardrails.'
    },
    {
      id: 'brain' as WorkspaceTab,
      name: '2nd Brain Memory',
      subtitle: 'Vector Store & Knowledge Base',
      category: 'flagship',
      icon: Brain,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-950/60',
      badge: `${notificationCounts.brain.count} Vectors`,
      badgeColor: 'bg-purple-600 text-white font-bold',
      notificationCount: notificationCounts.brain.count,
      isUrgent: false,
      description: 'Persistent context graphs, career persona adaptations, and organizational intelligence memory.'
    },
    {
      id: 'lead_discovery' as WorkspaceTab,
      name: 'Lead Discovery',
      subtitle: 'Oregon Homebuyer Intent Feed',
      category: 'flagship',
      icon: Target,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/60',
      badge: 'Oregon',
      badgeColor: 'bg-emerald-600 text-slate-950 font-black',
      notificationCount: 5,
      isUrgent: true,
      description: 'Automated daily sweeps of Reddit, Oregon forums, and chat boards for renter-to-homeowner intent.'
    },
    {
      id: 'real_estate' as WorkspaceTab,
      name: 'Real Estate GeoMap',
      subtitle: 'Zillow Swarm & DPA Scanner',
      category: 'flagship',
      icon: Home,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/60',
      badge: 'GeoMap',
      badgeColor: 'bg-emerald-600 text-white font-bold',
      notificationCount: 0,
      isUrgent: false,
      description: 'Interactive property map, Oregon DPA grant stacking calculator, RentCast comps, and lead capture.'
    },
    {
      id: 'orchestrator' as WorkspaceTab,
      name: 'Voice Orchestrator',
      subtitle: 'Speech-to-Intent Macro Hub',
      category: 'flagship',
      icon: Mic,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-950/60',
      badge: '⌘K Voice',
      badgeColor: 'bg-rose-600 text-white font-bold',
      notificationCount: 0,
      isUrgent: false,
      description: 'Real-time microphone transcription with automated workspace action routing and workflow playback.'
    }
  ];

  // 2. 7 Google Workspace Apps with Live Badges
  const googleApps = [
    {
      id: 'gmail' as WorkspaceTab,
      name: 'Gmail & Smart Inbox',
      subtitle: 'Priority AI Summaries & Drafts',
      category: 'google_apps',
      icon: Mail,
      iconBg: 'bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-950/60',
      badge: `${notificationCounts.gmail.count} Unread`,
      badgeColor: 'bg-red-500 text-white font-black',
      notificationCount: notificationCounts.gmail.count,
      isUrgent: true,
      description: 'Priority inbox screening, multi-turn AI email drafting, and thread synthesis.'
    },
    {
      id: 'calendar' as WorkspaceTab,
      name: 'Google Calendar',
      subtitle: 'Autonomous Concierge',
      category: 'google_apps',
      icon: Calendar,
      iconBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 dark:bg-blue-950/60',
      badge: `${notificationCounts.calendar.count} Today`,
      badgeColor: 'bg-blue-600 text-white font-bold',
      notificationCount: notificationCounts.calendar.count,
      isUrgent: false,
      description: 'Smart conflict resolution, 1-click meeting scheduling, and agenda time blocking.'
    },
    {
      id: 'drive' as WorkspaceTab,
      name: 'Google Drive',
      subtitle: 'Cloud File Discovery',
      category: 'google_apps',
      icon: FolderOpen,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-950/60',
      badge: `${notificationCounts.drive.count} Files`,
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
      notificationCount: notificationCounts.drive.count,
      isUrgent: false,
      description: 'High-speed search across PDFs, contracts, underwriting dossiers, and shared assets.'
    },
    {
      id: 'drive' as WorkspaceTab,
      name: 'Google Docs',
      subtitle: 'Smart Contracts & Letters',
      category: 'google_apps',
      icon: FileText,
      iconBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-950/60',
      badge: `${notificationCounts.docs.count} Docs`,
      badgeColor: 'bg-indigo-600 text-white font-bold',
      notificationCount: 0,
      isUrgent: false,
      description: 'Zero-shot executive summaries, TRID pre-approval letters, and proposals.'
    },
    {
      id: 'sheets' as WorkspaceTab,
      name: 'Google Sheets',
      subtitle: 'Relational SQL & Lead Purge',
      category: 'google_apps',
      icon: Table,
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-950/60',
      badge: `${notificationCounts.sheets.count} Dups`,
      badgeColor: 'bg-amber-500 text-slate-950 font-black',
      notificationCount: notificationCounts.sheets.count,
      isUrgent: true,
      description: 'Natural language to SQL query engine, fuzzy duplicate deduplication, and financial formulas.'
    },
    {
      id: 'tasks' as WorkspaceTab,
      name: 'Google Tasks',
      subtitle: 'Priorities & Action Dispatcher',
      category: 'google_apps',
      icon: CheckSquare,
      iconBg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 dark:bg-sky-950/60',
      badge: `${notificationCounts.tasks.count} Pending`,
      badgeColor: 'bg-rose-500 text-white font-black',
      notificationCount: notificationCounts.tasks.count,
      isUrgent: notificationCounts.tasks.count > 0,
      description: 'Auto-synthesizes action items from meeting notes into live synchronized to-do checklists.'
    },
    {
      id: 'contacts' as WorkspaceTab,
      name: 'Google Contacts',
      subtitle: 'Client CRM & Relationship Map',
      category: 'google_apps',
      icon: Users,
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-950/60',
      badge: `${notificationCounts.contacts.count} Leads`,
      badgeColor: 'bg-purple-600 text-white font-bold',
      notificationCount: 0,
      isUrgent: false,
      description: 'Integrated address book with lead engagement history and automated communication tracking.'
    }
  ];

  // 3. Platform & Executive Accelerators
  const platformTools = [
    {
      id: 'drafts' as WorkspaceTab,
      name: 'Gmail Drafts Studio',
      subtitle: 'Review & Send Queue (18)',
      category: 'tools',
      icon: Send,
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-950/60',
      badge: `${notificationCounts.drafts.count} Drafts`,
      badgeColor: 'bg-rose-500 text-white font-bold',
      notificationCount: notificationCounts.drafts.count,
      isUrgent: false,
      action: () => setActiveTab('drafts')
    },
    {
      id: 'commercial_strategy' as WorkspaceTab,
      name: 'Commercial Strategy',
      subtitle: 'Monetization & Sales Copy',
      category: 'tools',
      icon: Briefcase,
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-950/60',
      badge: 'Pitch',
      badgeColor: 'bg-amber-600 text-white',
      notificationCount: 0,
      isUrgent: false,
      action: () => {
        if (onOpenPitchDeck) onOpenPitchDeck();
        else setActiveTab('commercial_strategy');
      }
    },
    {
      id: 'dev_roadmap' as WorkspaceTab,
      name: 'Dev Architecture & Roadmap',
      subtitle: 'Cloud Run & Specs',
      category: 'tools',
      icon: Code,
      iconBg: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 dark:bg-cyan-950/60',
      badge: 'DevHub',
      badgeColor: 'bg-cyan-600 text-white',
      notificationCount: 0,
      isUrgent: false,
      action: () => setActiveTab('dev_roadmap')
    },
    {
      id: 'admin_plugins' as WorkspaceTab,
      name: 'Admin Plugin Vault',
      subtitle: 'Commercial Scaffolding',
      category: 'tools',
      icon: Shield,
      iconBg: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 dark:bg-violet-950/60',
      badge: 'Vault',
      badgeColor: 'bg-violet-600 text-white',
      notificationCount: 0,
      isUrgent: false,
      action: () => setActiveTab('admin_plugins')
    }
  ];

  // Sorted Modules based on persisted User Preference Orders
  const sortedFlagship = [...flagshipModules].sort((a, b) => {
    const indexA = flagshipOrder.indexOf(a.id);
    const indexB = flagshipOrder.indexOf(b.id);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const sortedGoogleApps = [...googleApps].sort((a, b) => {
    const indexA = googleAppsOrder.indexOf(a.id);
    const indexB = googleAppsOrder.indexOf(b.id);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  const sortedPlatformTools = [...platformTools].sort((a, b) => {
    const indexA = toolsOrder.indexOf(a.id);
    const indexB = toolsOrder.indexOf(b.id);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  // Drag and Drop Event Handlers
  const handleDragStart = (e: React.DragEvent, id: string, category: 'flagship' | 'google_apps' | 'tools') => {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.setData('category', category);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemId(id);
    setDraggedCategory(category);
  };

  const handleDragOver = (e: React.DragEvent, id: string, category: 'flagship' | 'google_apps' | 'tools') => {
    if (draggedCategory && draggedCategory !== category) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverItemId !== id) {
      setDragOverItemId(id);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string, category: 'flagship' | 'google_apps' | 'tools') => {
    e.preventDefault();
    const sourceId = draggedItemId || e.dataTransfer.getData('text/plain');
    if (!sourceId || sourceId === targetId) {
      setDraggedItemId(null);
      setDragOverItemId(null);
      setDraggedCategory(null);
      return;
    }

    if (category === 'flagship') {
      setFlagshipOrder(prev => {
        const from = prev.indexOf(sourceId);
        const to = prev.indexOf(targetId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        try { localStorage.setItem('vantage_sidebar_flagship_order', JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (category === 'google_apps') {
      setGoogleAppsOrder(prev => {
        const from = prev.indexOf(sourceId);
        const to = prev.indexOf(targetId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        try { localStorage.setItem('vantage_sidebar_google_apps_order', JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (category === 'tools') {
      setToolsOrder(prev => {
        const from = prev.indexOf(sourceId);
        const to = prev.indexOf(targetId);
        if (from === -1 || to === -1) return prev;
        const next = [...prev];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        try { localStorage.setItem('vantage_sidebar_tools_order', JSON.stringify(next)); } catch {}
        return next;
      });
    }

    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2200);
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDraggedCategory(null);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverItemId(null);
    setDraggedCategory(null);
  };

  const handleMoveItem = (id: string, direction: 'up' | 'down', category: 'flagship' | 'google_apps' | 'tools') => {
    const moveInArray = (arr: string[]) => {
      const idx = arr.indexOf(id);
      if (idx === -1) return arr;
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= arr.length) return arr;
      const next = [...arr];
      const [moved] = next.splice(idx, 1);
      next.splice(targetIdx, 0, moved);
      return next;
    };

    if (category === 'flagship') {
      setFlagshipOrder(prev => {
        const next = moveInArray(prev);
        try { localStorage.setItem('vantage_sidebar_flagship_order', JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (category === 'google_apps') {
      setGoogleAppsOrder(prev => {
        const next = moveInArray(prev);
        try { localStorage.setItem('vantage_sidebar_google_apps_order', JSON.stringify(next)); } catch {}
        return next;
      });
    } else if (category === 'tools') {
      setToolsOrder(prev => {
        const next = moveInArray(prev);
        try { localStorage.setItem('vantage_sidebar_tools_order', JSON.stringify(next)); } catch {}
        return next;
      });
    }
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2200);
  };

  const handleResetAllOrders = () => {
    setFlagshipOrder(DEFAULT_FLAGSHIP_ORDER);
    setGoogleAppsOrder(DEFAULT_GOOGLE_APPS_ORDER);
    setToolsOrder(DEFAULT_TOOLS_ORDER);
    try {
      localStorage.removeItem('vantage_sidebar_flagship_order');
      localStorage.removeItem('vantage_sidebar_google_apps_order');
      localStorage.removeItem('vantage_sidebar_tools_order');
    } catch {}
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 2200);
  };

  const isCustomOrder = 
    JSON.stringify(flagshipOrder) !== JSON.stringify(DEFAULT_FLAGSHIP_ORDER) ||
    JSON.stringify(googleAppsOrder) !== JSON.stringify(DEFAULT_GOOGLE_APPS_ORDER) ||
    JSON.stringify(toolsOrder) !== JSON.stringify(DEFAULT_TOOLS_ORDER);

  const allItems = [...sortedFlagship, ...sortedGoogleApps, ...sortedPlatformTools];

  const filteredItems = allItems.filter(item => {
    const itemDesc = (item as any).description || '';
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      itemDesc.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeCategory === 'all') return matchesSearch;
    return item.category === activeCategory && matchesSearch;
  });

  const handleItemClick = (item: any) => {
    if (item.action) {
      item.action();
    } else {
      setActiveTab(item.id);
    }
    if (!isPinned) {
      onClose();
    }
  };

  if (!isOpen && !isPinned) return null;

  return (
    <>
      {/* Resize Overlay Backdrop to prevent dropping drag when moving fast */}
      {isResizing && (
        <div className="fixed inset-0 z-[100] cursor-col-resize select-none bg-blue-500/5 backdrop-blur-[1px]">
          <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 text-white text-xs font-mono px-3 py-1.5 rounded-full border border-blue-500/50 shadow-2xl flex items-center gap-2 font-bold z-[101]">
            <GripVertical className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>Sidebar Width: {sidebarWidth}px</span>
          </div>
        </div>
      )}

      {/* Background Dim Backdrop (Only when NOT pinned) */}
      {isOpen && !isPinned && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-150"
          aria-hidden="true"
        />
      )}

      {/* Main Container: Handles both Floating Grid Overlay and Persistent Docked Sidebar */}
      <aside
        className={`fixed top-0 ${dockSide === 'left' ? 'left-0' : 'right-0'} h-full z-50 flex flex-col bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-slate-200 dark:border-slate-800 shadow-2xl max-w-[95vw] ${
          isResizing ? 'transition-none select-none' : 'transition-all duration-300 ease-out'
        } ${dockSide === 'left' ? 'border-r' : 'border-l'}`}
        style={{
          width: `${sidebarWidth}px`,
          boxShadow: isPinned 
            ? '0 0 25px -5px rgba(0,0,0,0.1)' 
            : '0 25px 50px -12px rgba(0, 0, 0, 0.35)'
        }}
      >
        {/* Draggable Resize Handle on the outer edge of persistent/floating sidebar */}
        <div
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
          className={`absolute top-0 bottom-0 ${
            dockSide === 'left' ? '-right-2.5 translate-x-0' : '-left-2.5 translate-x-0'
          } w-5 hover:w-6 cursor-col-resize z-[60] flex items-center justify-center group transition-all select-none`}
          title={`Drag to adjust sidebar width (${sidebarWidth}px)`}
        >
          {/* Edge Glow Highlight Line */}
          <div
            className={`h-full transition-all duration-200 rounded-full ${
              isResizing
                ? 'w-1.5 bg-blue-500 shadow-[0_0_16px_rgba(59,130,246,1)]'
                : 'w-1 group-hover:w-1.5 bg-slate-300/80 dark:bg-slate-700/80 group-hover:bg-blue-500 group-hover:shadow-[0_0_12px_rgba(59,130,246,0.8)]'
            }`}
          />

          {/* Center Tactile Grip Knob with Dots & Glowing Hover Effect */}
          <div
            className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all duration-200 shadow-xl border flex items-center justify-center ${
              isResizing
                ? 'bg-blue-600 text-white scale-125 border-blue-300 ring-4 ring-blue-500/30 shadow-blue-500/50'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-300 dark:border-slate-600 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-400 group-hover:scale-115 group-hover:shadow-blue-500/40'
            }`}
          >
            {/* Visual Dot Array & Grip Icon */}
            <div className="flex items-center gap-0.5">
              <div className="w-0.5 h-3 bg-current opacity-40 rounded-full hidden group-hover:block transition-all"></div>
              <GripVertical className="w-3.5 h-3.5 shrink-0" />
              <div className="w-0.5 h-3 bg-current opacity-40 rounded-full hidden group-hover:block transition-all"></div>
            </div>

            {/* Hover Tooltip Badge showing live width */}
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${
                dockSide === 'left' ? 'left-full ml-2.5' : 'right-full mr-2.5'
              } opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none text-[10px] bg-slate-900/95 text-white px-2.5 py-1 rounded-lg border border-blue-500/60 shadow-xl flex items-center gap-1.5 font-mono whitespace-nowrap font-bold z-[70]`}
            >
              <GripVertical className="w-3 h-3 text-blue-400 animate-pulse" />
              <span>Resize ({sidebarWidth}px)</span>
            </div>
          </div>
        </div>
        {/* Header Bar */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0 bg-slate-50/50 dark:bg-slate-950/50">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/30 shrink-0">
              <LayoutGrid className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight">
                  Google Apps & Workspace Hub
                </h2>
              </div>
              <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                {isPinned ? 'Persistent Docked Sidebar' : 'Quick 9-Dot Launcher Overlay'}
              </p>
            </div>
          </div>

          {/* Action Icons: Dark/Light Mode, Pin/Unpin, Close */}
          <div className="flex items-center gap-1">
            
            {/* Global Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer flex items-center justify-center"
              title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600" />
              )}
            </button>

            {/* Pin / Unpin Button */}
            <button
              type="button"
              onClick={onTogglePin}
              className={`p-1.5 rounded-lg transition cursor-pointer ${
                isPinned 
                  ? 'bg-blue-600 text-white shadow-xs' 
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
              title={isPinned ? 'Collapse Sidebar' : 'Pin Left Sidebar (Cmd+B)'}
            >
              {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close Panel (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dual-Pathway & Global Theme Status Ribbon */}
        <div className="px-4 py-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white text-xs flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
            <span className="text-[11px] font-bold text-slate-200 truncate">
              {pathway === 'workspace' ? 'Pathway B: Google Workspace' : 'Pathway A: Free Google Apps'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Global Theme Mode Segmented Switcher */}
            <div className="flex items-center gap-0.5 bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/80">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-1 rounded transition ${
                  resolvedTheme === 'light' 
                    ? 'bg-amber-500 text-slate-950 shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Light Theme"
              >
                <Sun className="w-3 h-3" />
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-1 rounded transition ${
                  resolvedTheme === 'dark' 
                    ? 'bg-indigo-600 text-white shadow-xs' 
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Switch to Dark Theme"
              >
                <Moon className="w-3 h-3" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsWorkspaceModalOpen(true)}
              className="text-[10px] font-bold text-indigo-300 hover:text-white uppercase tracking-wider underline cursor-pointer"
            >
              Switch
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search apps, tools, memory, workflows..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Category Filter Chips & Reorder Toolbar */}
          <div className="flex items-center justify-between gap-1.5 mt-2">
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5 min-w-0">
              {[
                { id: 'all', label: 'All Items' },
                { id: 'flagship', label: '💎 4-in-1' },
                { id: 'google_apps', label: '🌐 7 Apps' },
                { id: 'tools', label: '⚡ Tools' }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg transition whitespace-nowrap cursor-pointer shrink-0 ${
                    activeCategory === cat.id
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Reorder Mode / Reset Controls */}
            <div className="flex items-center gap-1 shrink-0">
              {isCustomOrder && (
                <button
                  type="button"
                  onClick={handleResetAllOrders}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Reset to Default Module Order"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsReorderMode(prev => !prev)}
                className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition cursor-pointer flex items-center gap-1 ${
                  isReorderMode
                    ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                title="Toggle Drag-and-Drop Reorder Mode"
              >
                <GripVertical className="w-3 h-3" />
                <span>{isReorderMode ? 'Done' : 'Reorder'}</span>
              </button>
            </div>
          </div>

          {/* Floating Order Saved Feedback Toast */}
          {showSavedFeedback && (
            <div className="mt-2 p-1.5 bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-800 rounded-lg flex items-center justify-between text-[10px] text-emerald-700 dark:text-emerald-300 font-bold animate-in fade-in slide-in-from-top-1">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Custom sidebar layout saved</span>
              </div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-emerald-600 dark:text-emerald-400">
                localStorage
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Module Grid & List View - High Visibility Scrollbar with dedicated gutter */}
        <div className={`flex-1 overflow-y-auto sidebar-scrollbar p-3 space-y-4 min-h-0 ${
          dockSide === 'left' ? 'mr-3.5 pr-1.5' : 'ml-3.5 pl-1.5'
        }`}>
          
          {/* SECTION 1: 4-IN-1 FLAGSHIP MODULES */}
          {(activeCategory === 'all' || activeCategory === 'flagship') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    💎 Vantage AI Flagship 4-in-1 Suite
                  </span>
                  {isReorderMode && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1 rounded">
                      Drag to reorder
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">6 Modules</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {sortedFlagship.map((module) => {
                  const Icon = module.icon;
                  const isActive = activeTab === module.id;
                  const isBeingDragged = draggedItemId === module.id;
                  const isDragTarget = dragOverItemId === module.id;

                  return (
                    <div
                      key={module.id}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, module.id, 'flagship')}
                      onDragOver={(e) => handleDragOver(e, module.id, 'flagship')}
                      onDrop={(e) => handleDrop(e, module.id, 'flagship')}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleItemClick(module)}
                      className={`relative text-left p-3 rounded-2xl border transition-all duration-150 flex flex-col justify-between cursor-grab active:cursor-grabbing group ${
                        isBeingDragged
                          ? 'opacity-40 scale-95 border-dashed border-blue-500 bg-blue-50/20'
                          : isDragTarget
                            ? 'ring-2 ring-blue-500 bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-md scale-[1.02]'
                            : isActive
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500 shadow-sm'
                              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-blue-400/60 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5">
                          <div className="relative">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs ${module.iconBg}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            {module.notificationCount > 0 && (
                              <span className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-sm ${
                                module.isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-blue-600'
                              }`}>
                                {module.notificationCount}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {isReorderMode ? (
                            <div className="flex items-center gap-0.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md p-0.5" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleMoveItem(module.id, 'up', 'flagship')}
                                className="p-0.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                                title="Move Up"
                              >
                                <ArrowUp className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveItem(module.id, 'down', 'flagship')}
                                className="p-0.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                                title="Move Down"
                              >
                                <ArrowDown className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${module.badgeColor}`}>
                              {module.badge}
                            </span>
                          )}
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>

                      <div>
                        <p className={`text-xs font-bold leading-tight ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                          {module.name}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {module.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: 7 GOOGLE WORKSPACE APPS */}
          {(activeCategory === 'all' || activeCategory === 'google_apps') && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    🌐 7 Official Google Workspace Apps
                  </span>
                  {isReorderMode && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1 rounded">
                      Drag to reorder
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-semibold">Live Feeds</span>
              </div>

              <div className="space-y-1.5">
                {sortedGoogleApps.map((app) => {
                  const Icon = app.icon;
                  const isActive = activeTab === app.id;
                  const isBeingDragged = draggedItemId === app.id;
                  const isDragTarget = dragOverItemId === app.id;

                  return (
                    <div
                      key={app.name}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, app.id, 'google_apps')}
                      onDragOver={(e) => handleDragOver(e, app.id, 'google_apps')}
                      onDrop={(e) => handleDrop(e, app.id, 'google_apps')}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleItemClick(app)}
                      className={`w-full text-left p-2.5 rounded-xl border flex items-center justify-between transition-all duration-150 cursor-grab active:cursor-grabbing group ${
                        isBeingDragged
                          ? 'opacity-40 scale-98 border-dashed border-blue-500 bg-blue-50/20'
                          : isDragTarget
                            ? 'ring-2 ring-blue-500 bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-md translate-x-1'
                            : isActive
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 shadow-xs ring-1 ring-blue-500'
                              : 'bg-white dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity shrink-0" />
                        <div className="relative shrink-0">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${app.iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          {app.notificationCount > 0 && (
                            <span className={`absolute -top-1.5 -right-1.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[9px] font-black text-white ring-2 ring-white dark:ring-slate-900 shadow-sm ${
                              app.isUrgent ? 'bg-rose-500 animate-pulse' : 'bg-blue-600'
                            }`}>
                              {app.notificationCount}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-bold truncate ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`}>
                            {app.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                            {app.subtitle}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isReorderMode ? (
                          <div className="flex items-center gap-0.5 bg-slate-200/80 dark:bg-slate-700/80 rounded-md p-0.5" onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(app.id, 'up', 'google_apps')}
                              className="p-0.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                              title="Move Up"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMoveItem(app.id, 'down', 'google_apps')}
                              className="p-0.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                              title="Move Down"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${app.badgeColor}`}>
                            {app.badge}
                          </span>
                        )}
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: PLATFORM ACCELERATORS & COMMERCIAL */}
          {(activeCategory === 'all' || activeCategory === 'tools') && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    ⚡ Executive & Platform Accelerators
                  </span>
                  {isReorderMode && (
                    <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 px-1 rounded">
                      Drag to reorder
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {sortedPlatformTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTab === tool.id;
                  const isBeingDragged = draggedItemId === tool.id;
                  const isDragTarget = dragOverItemId === tool.id;

                  return (
                    <div
                      key={tool.name}
                      draggable={true}
                      onDragStart={(e) => handleDragStart(e, tool.id, 'tools')}
                      onDragOver={(e) => handleDragOver(e, tool.id, 'tools')}
                      onDrop={(e) => handleDrop(e, tool.id, 'tools')}
                      onDragEnd={handleDragEnd}
                      onClick={() => handleItemClick(tool)}
                      className={`relative text-left p-2.5 rounded-xl border flex flex-col justify-between transition cursor-grab active:cursor-grabbing group ${
                        isBeingDragged
                          ? 'opacity-40 scale-95 border-dashed border-blue-500 bg-blue-50/20'
                          : isDragTarget
                            ? 'ring-2 ring-blue-500 bg-blue-50/80 dark:bg-blue-950/60 border-blue-500 shadow-md scale-[1.02]'
                            : isActive
                              ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
                              : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${tool.iconBg}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex items-center gap-1">
                          {isReorderMode ? (
                            <div className="flex items-center gap-0.5 bg-slate-200/80 dark:bg-slate-700/80 rounded p-0.5" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => handleMoveItem(tool.id, 'up', 'tools')}
                                className="p-0.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                                title="Move Up"
                              >
                                <ArrowUp className="w-2.5 h-2.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleMoveItem(tool.id, 'down', 'tools')}
                                className="p-0.5 hover:bg-white dark:hover:bg-slate-600 rounded text-slate-600 dark:text-slate-300"
                                title="Move Down"
                              >
                                <ArrowDown className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          ) : (
                            <span className={`text-[8px] font-black px-1.5 py-0.2 rounded ${tool.badgeColor}`}>
                              {tool.badge}
                            </span>
                          )}
                          <GripVertical className="w-3 h-3 text-slate-400 opacity-30 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                          {tool.name}
                        </p>
                        <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate">
                          {tool.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: QUICK ACTION TILES */}
          <div className="p-3 bg-gradient-to-br from-indigo-950/90 to-slate-900 rounded-2xl border border-indigo-500/30 text-white space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-indigo-300">
                Quick Shortcuts
              </span>
              <kbd className="text-[9px] px-1.5 py-0.5 bg-indigo-900/80 rounded border border-indigo-700 text-indigo-200">
                Cmd+K
              </kbd>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {onOpenByokDrawer && (
                <button
                  type="button"
                  onClick={onOpenByokDrawer}
                  className="p-2 bg-indigo-900/60 hover:bg-indigo-800/80 rounded-xl text-left transition cursor-pointer border border-indigo-500/20"
                >
                  <div className="flex items-center gap-1.5">
                    <Key className="w-3 h-3 text-amber-400" />
                    <span className="text-[11px] font-bold">API Keys (BYOK)</span>
                  </div>
                  <p className="text-[9px] text-indigo-200 mt-0.5">Gemini, RentCast</p>
                </button>
              )}

              {onOpenVoiceModal && (
                <button
                  type="button"
                  onClick={onOpenVoiceModal}
                  className="p-2 bg-indigo-900/60 hover:bg-indigo-800/80 rounded-xl text-left transition cursor-pointer border border-indigo-500/20"
                >
                  <div className="flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-rose-400" />
                    <span className="text-[11px] font-bold">Voice Studio</span>
                  </div>
                  <p className="text-[9px] text-indigo-200 mt-0.5">Speech-to-Intent</p>
                </button>
              )}

              {onOpenPitchDeck && (
                <button
                  type="button"
                  onClick={onOpenPitchDeck}
                  className="p-2 bg-indigo-900/60 hover:bg-indigo-800/80 rounded-xl text-left transition cursor-pointer border border-indigo-500/20"
                >
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span className="text-[11px] font-bold">Pitch Deck</span>
                  </div>
                  <p className="text-[9px] text-indigo-200 mt-0.5">4-in-1 Export</p>
                </button>
              )}

              {onOpenPublicWebsite && (
                <button
                  type="button"
                  onClick={onOpenPublicWebsite}
                  className="p-2 bg-indigo-900/60 hover:bg-indigo-800/80 rounded-xl text-left transition cursor-pointer border border-indigo-500/20"
                >
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <span className="text-[11px] font-bold">Public Web</span>
                  </div>
                  <p className="text-[9px] text-indigo-200 mt-0.5">Consumer View</p>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Footer: Attribution & Version */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 shrink-0">
          <span>Vantage AI Studio v4.2</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Mike Ford © 2026</span>
        </div>
      </aside>
    </>
  );
};
