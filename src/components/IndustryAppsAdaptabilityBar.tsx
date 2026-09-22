/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Sparkles, 
  Brain, 
  Briefcase, 
  CheckCircle2, 
  ChevronDown, 
  Mail, 
  FileText, 
  Table, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  Sliders,
  ExternalLink,
  Layers,
  Building2,
  Code,
  Activity,
  DollarSign,
  Shield,
  Megaphone,
  BookOpen,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { 
  ALL_10_INDUSTRY_GOOGLE_PROFILES, 
  getProfileForIndustry,
  IndustryGoogleAppsProfile 
} from '../data/industryGoogleAppsIntelligence';
import { INDUSTRY_CAREER_TEMPLATES } from '../data/industryCareerTemplates';

interface IndustryAppsAdaptabilityBarProps {
  onOpenSmartStudio?: () => void;
  onOpenDraftModal?: (subject?: string, body?: string) => void;
  onOpenSheetsEngine?: () => void;
  className?: string;
}

export const IndustryAppsAdaptabilityBar: React.FC<IndustryAppsAdaptabilityBarProps> = ({
  onOpenSmartStudio,
  onOpenDraftModal,
  onOpenSheetsEngine,
  className = ''
}) => {
  const { guardrails, updateGuardrails, saveMemory } = useMemory();
  const { pathway, setPathway, isWorkspaceConnected, connectedWorkspaceEmail, syncData, isSyncing } = useAccountPathway();

  const [isIndustryDropdownOpen, setIsIndustryDropdownOpen] = useState(false);
  const [activeNotification, setActiveNotification] = useState<string | null>(null);

  // Detect current active industry from guardrails personality or custom persona
  const activeIndustryId = INDUSTRY_CAREER_TEMPLATES.find(g => 
    guardrails.customPersonaDirective?.toLowerCase().includes(g.id) ||
    guardrails.customPersonaDirective?.toLowerCase().includes(g.name.toLowerCase()) ||
    g.careers.some(c => c.morphedPersonaTitle === guardrails.personalityPreset)
  )?.id || 'mortgage_real_estate';

  const currentProfile = getProfileForIndustry(activeIndustryId);

  const handleSwitchIndustry = async (newIndustryGroup: typeof INDUSTRY_CAREER_TEMPLATES[0]) => {
    setIsIndustryDropdownOpen(false);
    const primaryCareer = newIndustryGroup.careers[0];

    try {
      // 1. Morph 2nd Brain Guardrail persona directives
      await updateGuardrails({
        personalityPreset: primaryCareer.personalityPreset,
        customPersonaDirective: primaryCareer.morphedPersonaDirective,
        toneDemeanor: primaryCareer.toneDemeanor,
        verbosity: primaryCareer.verbosity,
        actionExecutionBoundary: primaryCareer.actionExecutionBoundary,
        customGuardrailDirectives: primaryCareer.customGuardrailDirectives
      });

      // 2. Ingest domain seed memories
      for (const seed of primaryCareer.domainKnowledgeSeeds) {
        await saveMemory({
          title: `[${primaryCareer.careerTitle}] ${seed.title}`,
          content: seed.content,
          type: seed.category as any,
          tags: [...seed.tags, primaryCareer.industryId, primaryCareer.careerId]
        });
      }

      await syncData();

      setActiveNotification(`Workspace UI Google Apps successfully adapted to ${newIndustryGroup.name} (${primaryCareer.careerTitle})!`);
      setTimeout(() => setActiveNotification(null), 5000);
    } catch (err: any) {
      console.error('Failed to adapt Industry Specialty:', err);
    }
  };

  const handleExecuteQuickAction = (btn: IndustryGoogleAppsProfile['smartAppButtons'][0]) => {
    if (btn.appTarget === 'gmail' || btn.appTarget === 'docs') {
      const templateMatch = currentProfile.commonEmailTemplates[0];
      if (onOpenDraftModal && templateMatch) {
        onOpenDraftModal(templateMatch.subject, templateMatch.bodyPattern);
      } else if (onOpenSmartStudio) {
        onOpenSmartStudio();
      }
    } else if (btn.appTarget === 'sheets') {
      if (onOpenSheetsEngine) {
        onOpenSheetsEngine();
      } else if (onOpenSmartStudio) {
        onOpenSmartStudio();
      }
    } else if (onOpenSmartStudio) {
      onOpenSmartStudio();
    }
  };

  return (
    <div className={`bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 shadow-xl text-white relative overflow-hidden ${className}`}>
      {/* Background Subtle Accent Glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Bar Top Level Info */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
        
        {/* Left: Active Pathway & Connected Brain Info */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Pathway Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>
              {pathway === 'workspace' ? 'Pathway B: Google Workspace Enterprise' : 'Pathway A: Standard Free Google Apps'}
            </span>
            {isWorkspaceConnected && connectedWorkspaceEmail && (
              <span className="text-[10px] text-emerald-300 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                {connectedWorkspaceEmail}
              </span>
            )}
          </div>

          <span className="text-slate-600 hidden sm:inline">•</span>

          {/* Connected Industry & Career Specialty Brain */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsIndustryDropdownOpen(!isIndustryDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 border border-indigo-400/40 text-xs font-black shadow-md transition cursor-pointer"
            >
              <Brain className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>2nd Brain: {currentProfile.industryName}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isIndustryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu for 10 Industry Specialty Brains */}
            {isIndustryDropdownOpen && (
              <div className="absolute left-0 mt-2 w-80 bg-slate-900 border border-indigo-500/40 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                <div className="px-3 py-2 text-[10px] font-extrabold uppercase text-indigo-300 tracking-wider border-b border-slate-800 flex items-center justify-between">
                  <span>Switch 2nd Brain Industry Specialty</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <div className="max-h-80 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                  {INDUSTRY_CAREER_TEMPLATES.map((indGroup) => {
                    const isSelected = indGroup.id === activeIndustryId;
                    return (
                      <button
                        key={indGroup.id}
                        type="button"
                        onClick={() => handleSwitchIndustry(indGroup)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white font-bold'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{indGroup.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Career Title Tag */}
          <span className="text-xs text-indigo-200 bg-indigo-950/80 px-2.5 py-1 rounded-lg border border-indigo-800/60 font-semibold">
            🎯 {currentProfile.careerTitle}
          </span>
        </div>

        {/* Right: Quick Action Trigger Buttons for Active Industry */}
        <div className="flex flex-wrap items-center gap-2">
          {currentProfile.smartAppButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={() => handleExecuteQuickAction(btn)}
              className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-indigo-600/80 border border-slate-700 hover:border-indigo-400 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title={btn.actionDescription}
            >
              {btn.appTarget === 'gmail' && <Mail className="w-3.5 h-3.5 text-amber-400" />}
              {btn.appTarget === 'docs' && <FileText className="w-3.5 h-3.5 text-blue-400" />}
              {btn.appTarget === 'sheets' && <Table className="w-3.5 h-3.5 text-emerald-400" />}
              {btn.appTarget === 'calendar' && <Calendar className="w-3.5 h-3.5 text-purple-400" />}
              <span>{btn.label}</span>
            </button>
          ))}

          {onOpenSmartStudio && (
            <button
              type="button"
              onClick={onOpenSmartStudio}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 text-xs font-black shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Apps Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Notification Toast */}
      {activeNotification && (
        <div className="mt-3 p-2.5 bg-emerald-950/90 border border-emerald-500/50 rounded-xl text-xs font-bold text-emerald-200 flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{activeNotification}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setActiveNotification(null)}
            className="text-emerald-400 hover:text-white text-xs underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Footer Info Banner on How Google Apps Adapt */}
      <div className="mt-3 pt-2.5 border-t border-indigo-900/40 text-[11px] text-indigo-300/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>
            <strong>Behavioral Adaptation Active:</strong> Gmail, Docs & Sheets now enforce <strong>{currentProfile.industryName}</strong> regulatory disclaimers, formula templates, and AI writing prompts.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
          <span>{isSyncing ? 'Syncing Workspace...' : '2nd Brain Live Connection'}</span>
          <RefreshCw className={`w-3 h-3 text-indigo-400 ${isSyncing ? 'animate-spin' : ''}`} />
        </div>
      </div>
    </div>
  );
};
