/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Briefcase, 
  ChevronDown, 
  Sparkles, 
  CheckCircle2, 
  Search, 
  ArrowRight, 
  Shield, 
  Sliders, 
  Brain, 
  RotateCcw,
  Zap,
  BookOpen,
  Info
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { 
  INDUSTRY_CAREER_TEMPLATES, 
  IndustryCareerTemplate, 
  IndustryGroup,
  getTemplateById
} from '../data/industryCareerTemplates';
import { IndustryMorphConfirmationModal } from './IndustryMorphConfirmationModal';

interface IndustryCareerTemplateSelectorProps {
  onTemplateApplied?: (template: IndustryCareerTemplate) => void;
  onOpenRecallWithQuestion?: (question: string) => void;
  onOpenTrainWindow?: () => void;
  onOpenIngestDocs?: () => void;
  className?: string;
}

export const IndustryCareerTemplateSelector: React.FC<IndustryCareerTemplateSelectorProps> = ({
  onTemplateApplied,
  onOpenRecallWithQuestion,
  onOpenTrainWindow,
  onOpenIngestDocs,
  className = ''
}) => {
  const { 
    guardrails, 
    updateGuardrails, 
    saveMemory, 
    recordGuardrailCustomization 
  } = useMemory();

  const [selectedIndustryId, setSelectedIndustryId] = useState<string>('mortgage_real_estate');
  const [selectedCareerId, setSelectedCareerId] = useState<string>('mlo_loan_officer');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [morphedModalTemplate, setMorphedModalTemplate] = useState<IndustryCareerTemplate | null>(null);
  const [isMorphModalOpen, setIsMorphModalOpen] = useState<boolean>(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Active industry group
  const activeIndustryGroup = INDUSTRY_CAREER_TEMPLATES.find(g => g.id === selectedIndustryId) || INDUSTRY_CAREER_TEMPLATES[0];

  // Active template selected
  const activeTemplate = activeIndustryGroup.careers.find(c => c.id === selectedCareerId) || activeIndustryGroup.careers[0];

  // All templates filtered by search
  const filteredTemplates = searchQuery.trim()
    ? INDUSTRY_CAREER_TEMPLATES.flatMap(g => g.careers).filter(c => 
        c.careerTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.industryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleApplyTemplate = async (templateToApply: IndustryCareerTemplate) => {
    setIsApplying(true);
    setSuccessBanner(null);

    try {
      // 1. Update Guardrails with Morphed Persona & Settings
      await updateGuardrails({
        personalityPreset: templateToApply.personalityPreset,
        customPersonaDirective: templateToApply.morphedPersonaDirective,
        toneDemeanor: templateToApply.toneDemeanor,
        verbosity: templateToApply.verbosity,
        actionExecutionBoundary: templateToApply.actionExecutionBoundary,
        customGuardrailDirectives: templateToApply.customGuardrailDirectives
      });

      // 2. Ingest Seed Knowledge into 2nd Brain Persistent Memories
      for (const seed of templateToApply.domainKnowledgeSeeds) {
        await saveMemory({
          title: `[${templateToApply.careerTitle}] ${seed.title}`,
          content: seed.content,
          type: seed.category as any,
          tags: [...seed.tags, templateToApply.industryId, templateToApply.careerId]
        });
      }

      // 3. Record Guardrail Customization Audit Entry
      await recordGuardrailCustomization({
        category: 'persona',
        label: `Morphed to ${templateToApply.careerTitle}`,
        field: 'personalityPreset',
        value: templateToApply.morphedPersonaTitle,
        description: `Morphed AI 2nd Brain to ${templateToApply.industryName} - ${templateToApply.careerTitle}.`
      });

      // 4. Open Morph Confirmation & Instructions Modal
      setMorphedModalTemplate(templateToApply);
      setIsMorphModalOpen(true);
      setSuccessBanner(`2nd Brain successfully morphed into ${templateToApply.careerTitle}!`);

      if (onTemplateApplied) {
        onTemplateApplied(templateToApply);
      }
    } catch (err: any) {
      console.error('Error applying template:', err);
      alert('Failed to morph 2nd brain: ' + (err.message || 'Unknown error'));
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 ${className}`}>
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Briefcase className="w-4 h-4" /> Industry & Career Pre-Fabricated Morph Templates
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Tailor Your Hybrid 2nd Brain to Your Profession
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Select an industry and career archetype to instantly morph your AI 2nd Brain with specialized vernacular, underwriting formulas, compliance standards, and operating personas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            Current Demeanor:
          </span>
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 capitalize">
            {guardrails.personalityPreset}
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successBanner && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center justify-between gap-2 text-xs text-emerald-800 dark:text-emerald-200 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-bold">{successBanner}</span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (activeTemplate) {
                setMorphedModalTemplate(activeTemplate);
                setIsMorphModalOpen(true);
              }
            }}
            className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:underline cursor-pointer"
          >
            View Morph Summary & Instructions
          </button>
        </div>
      )}

      {/* Dropdown Menu Selectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        
        {/* Dropdown 1: Industry Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            1. Select Industry
          </label>
          <div className="relative">
            <select
              value={selectedIndustryId}
              onChange={(e) => {
                const newIndId = e.target.value;
                setSelectedIndustryId(newIndId);
                const group = INDUSTRY_CAREER_TEMPLATES.find(g => g.id === newIndId);
                if (group && group.careers.length > 0) {
                  setSelectedCareerId(group.careers[0].id);
                }
              }}
              className="w-full text-xs p-3 pr-8 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            >
              {INDUSTRY_CAREER_TEMPLATES.map((ind) => (
                <option key={ind.id} value={ind.id}>
                  {ind.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3.5 pointer-events-none" />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1">
            {activeIndustryGroup.description}
          </p>
        </div>

        {/* Dropdown 2: Career Position Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            2. Select Career Position
          </label>
          <div className="relative">
            <select
              value={selectedCareerId}
              onChange={(e) => setSelectedCareerId(e.target.value)}
              className="w-full text-xs p-3 pr-8 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/40 dark:bg-slate-950 text-indigo-900 dark:text-indigo-200 font-bold focus:ring-2 focus:ring-indigo-500 outline-none appearance-none cursor-pointer"
            >
              {activeIndustryGroup.careers.map((career) => (
                <option key={career.id} value={career.id}>
                  {career.careerTitle}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-indigo-500 absolute right-3 top-3.5 pointer-events-none" />
          </div>
          <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">
            {activeTemplate.morphedPersonaTitle}
          </p>
        </div>

        {/* Search Filter Across All Industries */}
        <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Quick Career Search
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. Underwriter, CPA, Realtor..."
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

      </div>

      {/* Filtered Search Results Popover if searching */}
      {searchQuery.trim() && (
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase">
            Found {filteredTemplates.length} matching career archetypes:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {filteredTemplates.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedIndustryId(item.industryId);
                  setSelectedCareerId(item.id);
                  setSearchQuery('');
                }}
                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-indigo-500 transition cursor-pointer text-xs"
              >
                <div className="font-bold text-slate-900 dark:text-slate-100">{item.careerTitle}</div>
                <div className="text-[10px] text-slate-400">{item.industryName}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected Template Deep-Dive Preview Card */}
      {activeTemplate && (
        <div className="bg-gradient-to-br from-slate-50 to-indigo-50/40 dark:from-slate-800/60 dark:to-indigo-950/30 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold text-[11px]">
                  {activeTemplate.industryName}
                </span>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {activeTemplate.careerTitle}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Persona: {activeTemplate.morphedPersonaTitle}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-3xl">
                {activeTemplate.summary}
              </p>
            </div>

            <button
              type="button"
              disabled={isApplying}
              onClick={() => handleApplyTemplate(activeTemplate)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isApplying ? 'Morphing 2nd Brain...' : `Morph 2nd Brain to ${activeTemplate.careerTitle}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Morph Highlights & Parameters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Tone & Demeanor</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {activeTemplate.toneDemeanor.replace('_', ' ')}
              </span>
            </div>
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Verbosity</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {activeTemplate.verbosity}
              </span>
            </div>
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Action Boundary</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                {activeTemplate.actionExecutionBoundary.replace('_', ' ')}
              </span>
            </div>
            <div className="p-2 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Domain Seeds</span>
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                {activeTemplate.domainKnowledgeSeeds.length} Knowledge Blocks
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Morph Confirmation Modal */}
      <IndustryMorphConfirmationModal
        template={morphedModalTemplate}
        isOpen={isMorphModalOpen}
        onClose={() => setIsMorphModalOpen(false)}
        onOpenTrainWindow={onOpenTrainWindow}
        onOpenRecallWithQuestion={onOpenRecallWithQuestion}
        onOpenIngestDocs={onOpenIngestDocs}
      />

    </div>
  );
};
