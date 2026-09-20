import React from 'react';
import { useMemory } from '../context/MemoryContext';
import { GuardrailsAndBoundariesStudio } from './GuardrailsAndBoundariesStudio';

export const GuardrailsModal: React.FC = () => {
  const { isGuardrailsModalOpen, setIsGuardrailsModalOpen } = useMemory();

  if (!isGuardrailsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl h-[90vh] max-h-[880px] rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <GuardrailsAndBoundariesStudio
          isModal={true}
          onClose={() => setIsGuardrailsModalOpen(false)}
        />
      </div>
    </div>
  );
};
