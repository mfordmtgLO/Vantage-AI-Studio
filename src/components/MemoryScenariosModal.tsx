import React, { useEffect } from 'react';
import { useMemory } from '../context/MemoryContext';
import { MemoryScenariosPanel } from './MemoryScenariosPanel';
import { X, BookOpen } from 'lucide-react';

export const MemoryScenariosModal: React.FC = () => {
  const { isMemoryScenariosOpen, setIsMemoryScenariosOpen } = useMemory();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMemoryScenariosOpen) {
        setIsMemoryScenariosOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMemoryScenariosOpen, setIsMemoryScenariosOpen]);

  if (!isMemoryScenariosOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Memory Scenarios Playbook
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  3 Categorized Tabs
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Interactive step-by-step scenarios for Project Context, Communication Preferences, and Process Rules.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMemoryScenariosOpen(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <MemoryScenariosPanel 
            isModal={true} 
            onClose={() => setIsMemoryScenariosOpen(false)} 
          />
        </div>
      </div>
    </div>
  );
};
