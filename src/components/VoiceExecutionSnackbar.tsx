import React, { useEffect, useState } from 'react';
import { Undo2, X, CheckCircle2, Zap } from 'lucide-react';

interface VoiceExecutionSnackbarProps {
  workflowName: string;
  onUndo: () => void;
  onDismiss: () => void;
  duration?: number;
}

export const VoiceExecutionSnackbar: React.FC<VoiceExecutionSnackbarProps> = ({
  workflowName,
  onUndo,
  onDismiss,
  duration = 8000,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
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
  }, [duration, onDismiss]);

  return (
    <aside
      id="voice-command-snackbar"
      aria-label="Voice command notification"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-700/80 p-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-slate-200">Voice Command Executed</p>
            <p className="text-xs text-slate-400 truncate">&ldquo;{workflowName}&rdquo;</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="voice-quick-undo-btn"
            onClick={onUndo}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
            title="Revert this execution"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Quick Undo</span>
          </button>
          <button
            id="voice-dismiss-snackbar-btn"
            onClick={onDismiss}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress countdown indicator */}
      <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
        <div
          className="bg-amber-400 h-full transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </aside>
  );
};
