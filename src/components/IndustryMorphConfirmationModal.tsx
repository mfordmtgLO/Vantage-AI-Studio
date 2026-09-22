/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Sliders, 
  Mic, 
  Upload, 
  Search, 
  FileText, 
  BookOpen, 
  Zap, 
  X,
  Target,
  Layers,
  MessageSquare
} from 'lucide-react';
import { IndustryCareerTemplate } from '../data/industryCareerTemplates';

interface IndustryMorphConfirmationModalProps {
  template: IndustryCareerTemplate | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenTrainWindow?: () => void;
  onOpenRecallWithQuestion?: (question: string) => void;
  onOpenIngestDocs?: () => void;
}

export const IndustryMorphConfirmationModal: React.FC<IndustryMorphConfirmationModalProps> = ({
  template,
  isOpen,
  onClose,
  onOpenTrainWindow,
  onOpenRecallWithQuestion,
  onOpenIngestDocs
}) => {
  if (!isOpen || !template) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-8 space-y-0">
        
        {/* Top Header with Gradient Accent */}
        <div className="bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 p-6 sm:p-8 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold w-fit mb-3 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>2nd Brain Persona Morphed Successfully</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Morphed into {template.careerTitle}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
            Your hybrid Gemini + DeepSeek 2nd Brain is now custom-tailored for the <strong className="text-white">{template.industryName}</strong> sector with specialized cognitive guardrails, industry underwriting formulas, and domain vernacular.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          
          {/* Section 1: Morphed AI Architecture Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Morphed Archetype</span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{template.morphedPersonaTitle}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Demeanor & Tone</span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>{template.toneDemeanor.replace('_', ' ')} • {template.verbosity}</span>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Action Execution</span>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{template.actionExecutionBoundary.replace('_', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Active Persona Directive */}
          <div className="p-4 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 space-y-2">
            <h4 className="text-xs font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Active System Persona & Operational Instructions
            </h4>
            <p className="text-xs text-indigo-950 dark:text-indigo-100 leading-relaxed font-mono bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60">
              &ldquo;{template.morphedPersonaDirective}&rdquo;
            </p>
          </div>

          {/* Section 3: Ingested Domain Knowledge & Guardrail Seeds */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600" />
              Pre-Loaded Industry Knowledge Seeds & Guardrails ({template.domainKnowledgeSeeds.length + template.customGuardrailDirectives.length})
            </h4>

            <div className="space-y-2">
              {template.domainKnowledgeSeeds.map((seed, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                >
                  <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>{seed.title}</span>
                  </div>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed pl-5">
                    {seed.content}
                  </p>
                </div>
              ))}

              {template.customGuardrailDirectives.map((directive, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1"
                >
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Active Compliance Guardrail #{idx + 1}</span>
                  </div>
                  <p className="text-emerald-800 dark:text-emerald-300 text-[11px] leading-relaxed pl-5">
                    {directive}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Invitation & Guide to Continue Teaching 2nd Brain */}
          <div className="p-5 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-purple-500/10 rounded-2xl border border-blue-200 dark:border-blue-900/60 space-y-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Continue Teaching Your Vantage AI 2nd Brain
              </h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Your 2nd Brain continuously learns as you work. Use our pre-built input tools to inject your real-world client files, custom company underwriting matrices, or voice memos:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenTrainWindow) onOpenTrainWindow();
                }}
                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 text-left space-y-1 transition cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                  <Brain className="w-3.5 h-3.5" />
                  <span>Train My Brain</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Bulk input comma-separated rules & guidelines.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenIngestDocs) onOpenIngestDocs();
                }}
                className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-left space-y-1 transition cursor-pointer shadow-xs group"
              >
                <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Ingest Files</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Upload PDF, DOCX, CSV, audio transcripts (50MB).
                </p>
              </button>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 text-xs font-bold">
                  <Mic className="w-3.5 h-3.5" />
                  <span>Voice Memos</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Say &ldquo;Remember that...&rdquo; to ingest spoken notes.
                </p>
              </div>

              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left space-y-1 shadow-xs">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  <Search className="w-3.5 h-3.5" />
                  <span>URL Scraper</span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                  Index live industry articles and documentation.
                </p>
              </div>
            </div>
          </div>

          {/* Section 5: Suggested Prompt Questions */}
          {template.suggestedPromptQuestions.length > 0 && (
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Try a Sample Recall Prompt for {template.careerTitle}:
              </h4>
              <div className="space-y-1.5">
                {template.suggestedPromptQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onOpenRecallWithQuestion) onOpenRecallWithQuestion(q);
                    }}
                    className="w-full text-left p-2.5 bg-slate-50 hover:bg-indigo-50/70 dark:bg-slate-800/60 dark:hover:bg-indigo-950/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 flex items-center justify-between gap-2 transition cursor-pointer group"
                  >
                    <span className="text-[11px] leading-snug">{q}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Morphed 2nd Brain state active & synced to persistent storage.
          </span>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
            >
              Start Using {template.careerTitle} Brain
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
