/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  Send, 
  HelpCircle, 
  ListPlus, 
  Tag, 
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  Zap
} from 'lucide-react';
import { useMemory } from '../context/MemoryContext';
import { IndustryCareerTemplate } from '../data/industryCareerTemplates';

interface TrainMyBrainQuickInputProps {
  activeTemplate?: IndustryCareerTemplate | null;
  onTrainingComplete?: (count: number) => void;
  className?: string;
}

export const TrainMyBrainQuickInput: React.FC<TrainMyBrainQuickInputProps> = ({
  activeTemplate,
  onTrainingComplete,
  className = ''
}) => {
  const { saveMemory, recordGuardrailCustomization } = useMemory();
  const [inputText, setInputText] = useState<string>('');
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [learnedCount, setLearnedCount] = useState<number | null>(null);
  const [recentRules, setRecentRules] = useState<string[]>([]);

  // Parse comma-separated sentences up to 10 rules
  const parsedRules = useMemo(() => {
    if (!inputText.trim()) return [];
    return inputText
      .split(',')
      .map(r => r.trim())
      .filter(r => r.length > 3)
      .slice(0, 10);
  }, [inputText]);

  const handlePopulateSampleRules = () => {
    if (activeTemplate && activeTemplate.sampleTrainingRules.length > 0) {
      setInputText(activeTemplate.sampleTrainingRules.join(', '));
    } else {
      setInputText(
        'We only accept borrower credit scores above 620, Prioritize USDA zero-down programs for rural buyers, Always draft client emails in an executive concise tone, Escalate title defect issues to legal immediately'
      );
    }
  };

  const handleTrainBrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parsedRules.length === 0) return;

    setIsTraining(true);
    setLearnedCount(null);

    try {
      const industryTag = activeTemplate?.industryId || 'general-training';
      const careerTag = activeTemplate?.careerId || 'custom-career';

      // Persist each rule as a discrete instruction memory and guardrail record
      for (let i = 0; i < parsedRules.length; i++) {
        const rule = parsedRules[i];
        
        // 1. Save to 2nd Brain Firestore Knowledge Memory
        await saveMemory({
          title: `Trained Rule #${i + 1}: ${rule.slice(0, 40)}`,
          content: rule,
          type: 'instruction',
          tags: ['brain-training', 'career-rule', industryTag, careerTag]
        });

        // 2. Audit to Guardrails Customization
        await recordGuardrailCustomization({
          category: 'rule',
          label: `Brain Rule: ${rule.slice(0, 30)}...`,
          field: 'customBoundaryRules',
          value: rule,
          description: `User bulk trained AI 2nd Brain rule: "${rule}"`
        });
      }

      setLearnedCount(parsedRules.length);
      setRecentRules(parsedRules);
      setInputText('');
      if (onTrainingComplete) {
        onTrainingComplete(parsedRules.length);
      }
    } catch (err: any) {
      console.error('Error training 2nd brain:', err);
      alert('Training error: ' + (err.message || 'Failed to save rules'));
    } finally {
      setIsTraining(false);
    }
  };

  return (
    <div className={`bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30 dark:from-slate-900 dark:via-slate-900/90 dark:to-indigo-950/40 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 shadow-sm space-y-5 ${className}`}>
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Train My Brain (AI)
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold uppercase tracking-wider">
                Rapid Knowledge Ingestion
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Teach your 2nd Brain custom rules, underwriting guidelines, and career-specific operating habits.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePopulateSampleRules}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/80 dark:hover:bg-indigo-900/80 rounded-xl border border-indigo-200 dark:border-indigo-800 transition cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 text-indigo-600" />
          <span>Load {activeTemplate ? activeTemplate.careerTitle : 'Sample'} Rules</span>
        </button>
      </div>

      {/* Success Notification */}
      {learnedCount !== null && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex flex-col gap-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Successfully trained Vantage 2nd Brain on {learnedCount} custom industry/career rules!</span>
          </div>
          <div className="text-[11px] text-emerald-700 dark:text-emerald-300 pl-6">
            All rules are indexed in persistent Firestore memory and actively guide every future recall and reasoning query.
          </div>
        </div>
      )}

      {/* Main Training Input Form */}
      <form onSubmit={handleTrainBrain} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Enter Comma-Separated Training Sentences</span>
              <span className="text-[11px] font-normal text-slate-400">
                ({parsedRules.length} / 10 rules detected)
              </span>
            </label>
            {inputText && (
              <button
                type="button"
                onClick={() => setInputText('')}
                className="text-[11px] text-slate-400 hover:text-rose-500 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" /> Clear
              </button>
            )}
          </div>

          <div className="relative">
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Separate each sentence or lesson by comma. Give up to 10 key guidelines, rules, or preferences for your AI 2nd Brain to learn (e.g., 'We only accept borrower credit scores above 620, Prioritize USDA zero-down programs for rural buyers, Always draft client emails in an executive concise tone, Escalate title defect issues to legal immediately')."
              className="w-full text-xs p-3.5 rounded-xl border border-indigo-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none leading-relaxed transition resize-y"
            />
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            <HelpCircle className="w-3 h-3 text-indigo-500 shrink-0" />
            <span>Tip: Each comma (,) creates an individual vectorized instruction card in your 2nd Brain knowledge base.</span>
          </div>
        </div>

        {/* Live Parsed Rules Preview Badges */}
        {parsedRules.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-indigo-100 dark:border-slate-800">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Parsed Training Directives ({parsedRules.length}):</span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">Ready to Embed</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {parsedRules.map((rule, idx) => (
                <div
                  key={idx}
                  className="p-2.5 bg-indigo-50/70 dark:bg-indigo-950/50 rounded-xl border border-indigo-100 dark:border-indigo-900/60 text-xs text-slate-800 dark:text-slate-200 flex items-start gap-2"
                >
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="leading-snug text-[11px] flex-1">{rule}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={parsedRules.length === 0 || isTraining}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-40 cursor-pointer"
          >
            {isTraining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Vectorizing & Training Brain...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Train & Embed {parsedRules.length > 0 ? `(${parsedRules.length} Rules)` : ''}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
