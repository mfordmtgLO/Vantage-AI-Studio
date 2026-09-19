import React from 'react';
import { AlertTriangle, X, Check, ShieldAlert } from 'lucide-react';
import { SuggestedAction } from '../types';

interface ActionConfirmationModalProps {
  action: SuggestedAction | null;
  onConfirm: (action: SuggestedAction) => void;
  onCancel: () => void;
  isExecuting: boolean;
}

export const ActionConfirmationModal: React.FC<ActionConfirmationModalProps> = ({
  action,
  onConfirm,
  onCancel,
  isExecuting,
}) => {
  if (!action) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-md shadow-amber-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-amber-900">Confirm Workspace Action</h3>
              <p className="text-xs text-amber-700">Required security confirmation before modifying data</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-amber-700 hover:text-amber-900 p-1 rounded-lg hover:bg-amber-100/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-900">{action.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed">{action.description}</p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 font-mono text-xs text-slate-700 overflow-x-auto max-h-48">
            <pre>{JSON.stringify(action.payload, null, 2)}</pre>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              onClick={onCancel}
              disabled={isExecuting}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(action)}
              disabled={isExecuting}
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              {isExecuting ? 'Executing in Workspace...' : 'Confirm & Execute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
