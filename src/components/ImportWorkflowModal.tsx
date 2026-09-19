import React, { useState } from 'react';
import { Download, ArrowRight, Sparkles, CheckCircle2, User, Clock, Layers, X, Cpu } from 'lucide-react';
import { ShareableWorkflowData } from './ShareWorkflowModal';

interface ImportWorkflowModalProps {
  workflowData: ShareableWorkflowData;
  onImport: (workflowData: ShareableWorkflowData) => void;
  onClose: () => void;
}

export const ImportWorkflowModal: React.FC<ImportWorkflowModalProps> = ({
  workflowData,
  onImport,
  onClose,
}) => {
  const [customName, setCustomName] = useState(workflowData.name);

  return (
    <div
      id="import-workflow-modal"
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-900/60 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Import Shared Workflow
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You received a shared automation pipeline
              </p>
            </div>
          </div>
          <button
            id="close-import-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Meta info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Workflow Title:</label>
            <input
              id="import-workflow-title-input"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {workflowData.description}
          </p>

          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/60 dark:border-slate-800">
            {workflowData.authorEmail && (
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Shared by: <strong className="text-slate-700 dark:text-slate-200">{workflowData.authorEmail}</strong>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-purple-500" />
              {workflowData.steps?.length || 0} Pipeline Steps
            </span>
          </div>
        </div>

        {/* Step Preview list */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Pipeline Steps Sequence:
          </span>
          <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
            {workflowData.steps?.map((step, idx) => (
              <div
                key={step.id || idx}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between shadow-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{step.name}</h4>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{step.type}</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-md">
                  Configured
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            id="cancel-import-btn"
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="confirm-import-btn"
            type="button"
            onClick={() => onImport({ ...workflowData, name: customName })}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold shadow-md transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Import into My Studio</span>
          </button>
        </div>
      </div>
    </div>
  );
};
