import React from 'react';
import { X, Share, PlusSquare, Smartphone, CheckCircle, Sparkles, ExternalLink } from 'lucide-react';

interface IosInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  pluginName?: string;
}

export const IosInstallGuideModal: React.FC<IosInstallGuideModalProps> = ({
  isOpen,
  onClose,
  pluginName = 'Vantage AI Module'
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mb-3 shadow-inner">
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          
          <h3 className="text-xl font-bold tracking-tight">Install on Mobile Home Screen</h3>
          <p className="text-xs text-blue-100 mt-1">
            Access {pluginName} anytime directly from your phone’s home screen with 1 tap.
          </p>
        </div>

        {/* 3 Step Visual Flow */}
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-sm flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Tap the <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs"><Share className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Share</span> button
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Located in Safari’s bottom toolbar (or Chrome’s top-right menu).
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold text-sm flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Scroll & select <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-xs"><PlusSquare className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Add to Home Screen</span>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Look for the "Add to Home Screen" option in the share sheet.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 font-bold text-sm flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                Tap <span className="inline-flex items-center px-2 py-0.5 bg-blue-600 text-white rounded text-xs font-bold">Add</span> in the top-right
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                The standalone app icon will now appear directly on your phone’s home screen!
              </p>
            </div>
          </div>

          {/* Benefits Callout */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Runs in full-screen standalone mode with ultra-fast startup and instant calculations.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            Got It, Thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
