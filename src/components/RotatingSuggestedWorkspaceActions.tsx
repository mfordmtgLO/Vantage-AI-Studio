/**
 * ============================================================================
 * VANTAGE AI WORKSPACE STUDIO • INDUSTRY-CENTRIC ROTATING SUGGESTED ACTIONS
 * Copyright (c) 2025-2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 * Dynamically displays 1 high-productivity suggested action for each of the
 * 7 free Google Apps (Gmail, Calendar, Drive, Docs, Sheets, Tasks, Contacts),
 * strictly tailored to the active 2nd Brain Industry + Career focus.
 * Powered by Gemini SDK Agent & Gemini Ground Search internet research across all 10 industries.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Mail,
  Calendar as CalendarIcon,
  HardDrive,
  FileText,
  Table,
  CheckSquare,
  Users,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
  RotateCw,
  Play,
  Pause,
  Brain,
  ChevronDown,
  Globe2,
  Check,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { SuggestedAction } from '../types';
import { useMemory } from '../context/MemoryContext';
import {
  ALL_10_INDUSTRIES_META,
  getIndustryActionsForApp,
  getIndustryMeta,
  normalizeIndustryId,
  GoogleAppKey,
  IndustryAppActionDef,
  IndustryMetaDef
} from '../data/industryRotatingActionsData';
import { INDUSTRY_CAREER_TEMPLATES } from '../data/industryCareerTemplates';

export const ALL_GOOGLE_APPS: GoogleAppKey[] = [
  'Gmail',
  'Calendar',
  'Drive',
  'Docs',
  'Sheets',
  'Tasks',
  'Contacts'
];

interface AppMeta {
  name: string;
  icon: React.ElementType;
  colorClass: string;
  badgeClass: string;
  borderClass: string;
}

const APP_METADATA: Record<GoogleAppKey, AppMeta> = {
  Gmail: {
    name: 'Gmail',
    icon: Mail,
    colorClass: 'text-red-600 dark:text-red-400',
    badgeClass: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/70 dark:text-red-300 dark:border-red-800',
    borderClass: 'hover:border-red-400/60 dark:hover:border-red-500/40'
  },
  Calendar: {
    name: 'Calendar',
    icon: CalendarIcon,
    colorClass: 'text-blue-600 dark:text-blue-400',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/70 dark:text-blue-300 dark:border-blue-800',
    borderClass: 'hover:border-blue-400/60 dark:hover:border-blue-500/40'
  },
  Drive: {
    name: 'Drive',
    icon: HardDrive,
    colorClass: 'text-amber-600 dark:text-amber-400',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800',
    borderClass: 'hover:border-amber-400/60 dark:hover:border-amber-500/40'
  },
  Docs: {
    name: 'Docs',
    icon: FileText,
    colorClass: 'text-sky-600 dark:text-sky-400',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800',
    borderClass: 'hover:border-sky-400/60 dark:hover:border-sky-500/40'
  },
  Sheets: {
    name: 'Sheets',
    icon: Table,
    colorClass: 'text-emerald-600 dark:text-emerald-400',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800',
    borderClass: 'hover:border-emerald-400/60 dark:hover:border-emerald-500/40'
  },
  Tasks: {
    name: 'Tasks',
    icon: CheckSquare,
    colorClass: 'text-indigo-600 dark:text-indigo-400',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/70 dark:text-indigo-300 dark:border-indigo-800',
    borderClass: 'hover:border-indigo-400/60 dark:hover:border-indigo-500/40'
  },
  Contacts: {
    name: 'Contacts',
    icon: Users,
    colorClass: 'text-violet-600 dark:text-violet-400',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/70 dark:text-violet-300 dark:border-violet-800',
    borderClass: 'hover:border-violet-400/60 dark:hover:border-violet-500/40'
  }
};

interface RotatingSuggestedWorkspaceActionsProps {
  onExecuteAction: (action: SuggestedAction) => void;
  className?: string;
}

export const RotatingSuggestedWorkspaceActions: React.FC<RotatingSuggestedWorkspaceActionsProps> = ({
  onExecuteAction,
  className = ''
}) => {
  const { guardrails, updateGuardrails, saveMemory } = useMemory();

  // Determine currently active industry from Guardrails, local storage, or default
  const activeIndustryId = useMemo(() => {
    // 1. Check local storage override first
    try {
      const saved = localStorage.getItem('vantage_active_industry_id');
      if (saved) return normalizeIndustryId(saved);
    } catch {}

    // 2. Check guardrails custom persona
    if (guardrails.customPersonaDirective) {
      const found = ALL_10_INDUSTRIES_META.find(m => 
        guardrails.customPersonaDirective?.toLowerCase().includes(m.id) ||
        guardrails.customPersonaDirective?.toLowerCase().includes(m.shortName.toLowerCase()) ||
        guardrails.customPersonaDirective?.toLowerCase().includes(m.name.toLowerCase())
      );
      if (found) return found.id;
    }

    // 3. Check persona preset
    const presetMatch = INDUSTRY_CAREER_TEMPLATES.find(g => 
      g.careers.some(c => c.morphedPersonaTitle === guardrails.personalityPreset)
    );
    if (presetMatch) return normalizeIndustryId(presetMatch.id);

    return 'mortgage_real_estate';
  }, [guardrails.customPersonaDirective, guardrails.personalityPreset]);

  const activeMeta = useMemo(() => getIndustryMeta(activeIndustryId), [activeIndustryId]);

  // Industry Dropdown state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSwitchingIndustry, setIsSwitchingIndustry] = useState(false);

  // Per-app index tracker (0 to N-1 for each Google App)
  const [appIndices, setAppIndices] = useState<Record<GoogleAppKey, number>>({
    Gmail: 0,
    Calendar: 0,
    Drive: 0,
    Docs: 0,
    Sheets: 0,
    Tasks: 0,
    Contacts: 0
  });

  // 30-Second Rotation Countdown Timer (30 down to 0)
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Sync action indices whenever active industry changes
  useEffect(() => {
    setAppIndices({
      Gmail: 0,
      Calendar: 0,
      Drive: 0,
      Docs: 0,
      Sheets: 0,
      Tasks: 0,
      Contacts: 0
    });
    setTimeLeft(30);
  }, [activeIndustryId]);

  // Get active actions for each app based on active industry
  const currentAppActions = useMemo(() => {
    const map: Record<GoogleAppKey, IndustryAppActionDef[]> = {
      Gmail: getIndustryActionsForApp(activeIndustryId, 'Gmail'),
      Calendar: getIndustryActionsForApp(activeIndustryId, 'Calendar'),
      Drive: getIndustryActionsForApp(activeIndustryId, 'Drive'),
      Docs: getIndustryActionsForApp(activeIndustryId, 'Docs'),
      Sheets: getIndustryActionsForApp(activeIndustryId, 'Sheets'),
      Tasks: getIndustryActionsForApp(activeIndustryId, 'Tasks'),
      Contacts: getIndustryActionsForApp(activeIndustryId, 'Contacts')
    };
    return map;
  }, [activeIndustryId]);

  // 30-Second Auto-Rotation Timer Effect
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Advance each Google App to its next suggestion
          setAppIndices((current) => {
            const next: Record<GoogleAppKey, number> = { ...current };
            ALL_GOOGLE_APPS.forEach((app) => {
              const totalActions = currentAppActions[app].length;
              next[app] = (current[app] + 1) % totalActions;
            });
            return next;
          });
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, currentAppActions]);

  // Handle switching industry directly from the dropdown
  const handleSelectIndustry = async (industryMeta: IndustryMetaDef) => {
    setIsDropdownOpen(false);
    setIsSwitchingIndustry(true);

    try {
      // 1. Save to local storage
      try {
        localStorage.setItem('vantage_active_industry_id', industryMeta.id);
      } catch {}

      // 2. Find matching career template group
      const targetGroup = INDUSTRY_CAREER_TEMPLATES.find(g => 
        g.id === industryMeta.id || 
        g.name.toLowerCase().includes(industryMeta.shortName.toLowerCase())
      ) || INDUSTRY_CAREER_TEMPLATES[0];

      const primaryCareer = targetGroup.careers[0];

      // 3. Update 2nd Brain Guardrails in MemoryContext
      await updateGuardrails({
        personalityPreset: primaryCareer.personalityPreset,
        customPersonaDirective: primaryCareer.morphedPersonaDirective,
        toneDemeanor: primaryCareer.toneDemeanor,
        verbosity: primaryCareer.verbosity,
        actionExecutionBoundary: primaryCareer.actionExecutionBoundary,
        customGuardrailDirectives: primaryCareer.customGuardrailDirectives
      });

      // 4. Ingest seed memories if not already present
      if (primaryCareer.domainKnowledgeSeeds && primaryCareer.domainKnowledgeSeeds.length > 0) {
        for (const seed of primaryCareer.domainKnowledgeSeeds) {
          await saveMemory({
            title: `[${primaryCareer.careerTitle}] ${seed.title}`,
            content: seed.content,
            type: seed.category as any,
            tags: [...seed.tags, industryMeta.id]
          });
        }
      }

      // Reset timer & indices
      setTimeLeft(30);
      setAppIndices({
        Gmail: 0,
        Calendar: 0,
        Drive: 0,
        Docs: 0,
        Sheets: 0,
        Tasks: 0,
        Contacts: 0
      });
    } catch (err) {
      console.warn('Error switching 2nd brain industry:', err);
    } finally {
      setIsSwitchingIndustry(false);
    }
  };

  // Manual Navigation for a specific Google App
  const handlePrevAction = (app: GoogleAppKey, e: React.MouseEvent) => {
    e.stopPropagation();
    const count = currentAppActions[app].length;
    setAppIndices((prev) => ({
      ...prev,
      [app]: (prev[app] - 1 + count) % count
    }));
  };

  const handleNextAction = (app: GoogleAppKey, e: React.MouseEvent) => {
    e.stopPropagation();
    const count = currentAppActions[app].length;
    setAppIndices((prev) => ({
      ...prev,
      [app]: (prev[app] + 1) % count
    }));
  };

  // Trigger Action Execution with full payload
  const handleTriggerAction = (app: GoogleAppKey) => {
    const activeIndex = appIndices[app];
    const actionDef = currentAppActions[app][activeIndex];
    const fullAction: SuggestedAction = {
      id: `${actionDef.id}_${Date.now()}`,
      type: actionDef.type,
      title: actionDef.title,
      description: actionDef.description,
      payload: actionDef.payload,
      appName: app
    };
    onExecuteAction(fullAction);
  };

  // Calculate progress bar percentage (0% to 100%)
  const progressPercent = ((30 - timeLeft) / 30) * 100;

  return (
    <div className={`pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3.5 ${className}`}>
      {/* Header Bar with Active 2nd Brain Selector, 30s Countdown & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900/60 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        {/* Left: 2nd Brain Status & Interactive Dropdown Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 shadow-xs transition cursor-pointer"
              title="Click to switch active 2nd Brain Industry & Career"
            >
              <Brain className="w-4 h-4 text-purple-600 dark:text-purple-400 animate-pulse" />
              <span className="text-base">{activeMeta.emoji}</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{activeMeta.shortName}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-mono">
                2nd Brain Active
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu of All 10 Industry + Career Options */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute left-0 mt-1.5 w-80 max-h-96 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 p-1.5 space-y-1">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Select Active 2nd Brain Industry ({ALL_10_INDUSTRIES_META.length})
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Instantly morphs Gemini Agent skills & Google Apps rotating actions
                    </p>
                  </div>

                  {ALL_10_INDUSTRIES_META.map((ind) => {
                    const isSelected = ind.id === activeMeta.id;
                    return (
                      <button
                        key={ind.id}
                        type="button"
                        onClick={() => handleSelectIndustry(ind)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl text-xs flex items-start gap-2.5 transition cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50 dark:bg-purple-950/70 text-purple-900 dark:text-purple-200 font-semibold border border-purple-200 dark:border-purple-800'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="text-lg leading-none mt-0.5">{ind.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-bold truncate">{ind.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {ind.careerTitle}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Gemini Ground Search Assimilation Chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/80 rounded-xl text-[11px] font-medium text-emerald-800 dark:text-emerald-300">
            <Globe2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="truncate max-w-xs">Gemini Grounded: {activeMeta.geminiResearchFocus}</span>
          </div>
        </div>

        {/* Right: 30s Countdown Indicator & Play/Pause */}
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700/80 rounded-full text-[11px] font-mono text-slate-700 dark:text-slate-300 shadow-2xs">
            <Clock className={`w-3.5 h-3.5 text-blue-500 ${isPaused ? '' : 'animate-spin'}`} />
            <span>{isPaused ? 'Rotation Paused' : `Next in ${timeLeft}s`}</span>
          </div>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs transition cursor-pointer"
            title={isPaused ? 'Resume 30s auto-rotation' : 'Pause auto-rotation'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500" /> : <Pause className="w-3.5 h-3.5 text-amber-500" />}
          </button>
        </div>
      </div>

      {/* 30-Second Progress Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800/80 h-1.5 rounded-full overflow-hidden shadow-inner">
        <div
          className="bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 h-full transition-all duration-1000 ease-linear rounded-full"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Grid of 7 Google App Suggested Action Cards (1 per Free Google App) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {ALL_GOOGLE_APPS.map((app) => {
          const appMeta = APP_METADATA[app];
          const actions = currentAppActions[app];
          const activeIndex = appIndices[app] || 0;
          const action = actions[activeIndex] || actions[0];
          const Icon = appMeta.icon;

          return (
            <div
              key={app}
              className={`bg-white dark:bg-slate-850 border border-slate-200/90 dark:border-slate-750 rounded-2xl p-4 shadow-sm hover:shadow-md space-y-3 flex flex-col justify-between transition-all duration-300 ${appMeta.borderClass}`}
            >
              <div className="space-y-2.5">
                {/* Top App Header with App Name, 2nd Brain Focus Pill, and Pagination Arrows */}
                <div className="flex items-center justify-between gap-1 border-b border-slate-100 dark:border-slate-750 pb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`p-1.5 rounded-xl bg-slate-100 dark:bg-slate-900/90 ${appMeta.colorClass}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {appMeta.name}
                        </span>
                        <span className="text-xs" title={`Tied to active ${activeMeta.name} 2nd Brain`}>
                          {activeMeta.emoji}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Manual Arrow Controls & Pagination Count */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => handlePrevAction(app, e)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Previous action"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>

                    <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 px-1">
                      {activeIndex + 1}/{actions.length}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleNextAction(app, e)}
                      className="p-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                      title="Next action"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 2nd Brain Focus Indicator & Action Badge */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${activeMeta.badgeClass}`}>
                    <Brain className="w-2.5 h-2.5" />
                    <span>{activeMeta.shortName}</span>
                  </span>
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${appMeta.badgeClass}`}>
                    {action.badgeLabel}
                  </span>
                </div>

                {/* Title and Description */}
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                    {action.title}
                  </h5>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {action.description}
                  </p>
                </div>

                {/* Grounded Research Note */}
                {action.geminiResearchNote && (
                  <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800/80">
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic flex items-center gap-1 line-clamp-2">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500 shrink-0" />
                      <span>{action.geminiResearchNote}</span>
                    </p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => handleTriggerAction(app)}
                className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition duration-150 cursor-pointer"
              >
                <span>Review & Execute Action</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
