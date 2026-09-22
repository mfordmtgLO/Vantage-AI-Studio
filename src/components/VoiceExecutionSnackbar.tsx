/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Undo2, X, CheckCircle2, Zap, AlertTriangle, RotateCcw, ArrowRight, Sparkles } from 'lucide-react';
import { VoiceMacroStep } from '../types/voiceMacro';

interface VoiceExecutionSnackbarProps {
  workflowName: string;
  steps?: VoiceMacroStep[];
  activeStepIndex?: number;
  totalSteps?: number;
  currentStepLabel?: string;
  status?: 'executing' | 'undo_window' | 'completed' | 'reverted' | 'error';
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export const VoiceExecutionSnackbar: React.FC<VoiceExecutionSnackbarProps> = ({
  workflowName,
  steps = [],
  activeStepIndex = 1,
  totalSteps = 1,
  currentStepLabel,
  status = 'undo_window',
  onUndo,
  onDismiss,
  duration = 10000,
}) => {
  const [progress, setProgress] = useState(100);
  const [isUndone, setIsUndone] = useState(false);

  useEffect(() => {
    if (status === 'reverted') {
      setIsUndone(true);
      return;
    }

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss, status]);

  const handleQuickUndo = () => {
    setIsUndone(true);
    onUndo();
  };

  const currentStep = steps[activeStepIndex - 1] || null;
  const displayLabel = currentStepLabel || currentStep?.label || workflowName;

  return (
    <aside
      id="voice-command-snackbar"
      aria-label="Voice command notification"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 max-w-lg w-auto sm:w-full bg-slate-900/95 dark:bg-slate-950/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-slate-700/80 p-4 sm:p-5 overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isUndone
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : status === 'executing'
              ? 'bg-blue-600/30 border-blue-500/40 text-blue-400 animate-pulse'
              : 'bg-emerald-600/30 border-emerald-500/40 text-emerald-400'
          }`}>
            {isUndone ? (
              <RotateCcw className="w-4 h-4" />
            ) : status === 'executing' ? (
              <Zap className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-bold text-slate-200">
                {isUndone ? 'Voice Macro Execution Reverted' : status === 'executing' ? 'Executing Compound Voice Intent' : 'Voice Macro Executed'}
              </p>
              {totalSteps > 1 && !isUndone && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Step {activeStepIndex}/{totalSteps}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 font-medium truncate mt-0.5">
              &ldquo;{displayLabel}&rdquo;
            </p>
            {totalSteps > 1 && steps.length > 0 && !isUndone && (
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {steps.map(s => s.label).join(' → ')}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!isUndone && (
            <button
              id="voice-quick-undo-btn"
              onClick={handleQuickUndo}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-sm cursor-pointer active:scale-95"
              title="Revert this execution during the 10-second safety window"
            >
              <Undo2 className="w-3.5 h-3.5" />
              <span>Quick Undo</span>
            </button>
          )}
          <button
            id="voice-dismiss-snackbar-btn"
            onClick={onDismiss}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition cursor-pointer"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress countdown indicator */}
      {!isUndone && (
        <div className="w-full bg-slate-800 h-1.5 mt-3.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-blue-400 h-full transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </aside>
  );
};
