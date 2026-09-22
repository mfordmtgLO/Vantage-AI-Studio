import React, { useState } from 'react';
import { Mic, Plus, Trash2, Edit2, CheckCircle2, Sparkles, Volume2, Save, Play, Layers } from 'lucide-react';

interface VoiceMacro {
  id: string;
  triggerPhrase: string;
  workflowName: string;
  description: string;
  enabled: boolean;
}

export const VoiceMacroManagerView: React.FC<{ onExecuteWorkflow?: (name: string) => void }> = ({ onExecuteWorkflow }) => {
  const [macros, setMacros] = useState<VoiceMacro[]>(() => {
    try {
      const stored = localStorage.getItem('vantage_voice_macros');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // ignore
    }
    return [
      {
        id: 'm1',
        triggerPhrase: 'Hey Copilot, run weekly status update',
        workflowName: 'AI Market Research & Executive Brief',
        description: 'Scrapes web sources, synthesizes with Gemini, and prepares executive summary.',
        enabled: true
      },
      {
        id: 'm2',
        triggerPhrase: 'Good morning briefing',
        workflowName: 'Competitor URL Scraper & Calendar Review',
        description: 'Scrapes competitor sites and schedules team review.',
        enabled: true
      }
    ];
  });

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [triggerInput, setTriggerInput] = useState<string>('');
  const [workflowInput, setWorkflowInput] = useState<string>('AI Market Research & Executive Brief');
  const [descInput, setDescInput] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const saveMacrosToStorage = (newMacros: VoiceMacro[]) => {
    setMacros(newMacros);
    try {
      localStorage.setItem('vantage_voice_macros', JSON.stringify(newMacros));
    } catch (e) {
      // ignore
    }
  };

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerInput.trim()) return;

    const newMacro: VoiceMacro = {
      id: 'macro_' + Date.now(),
      triggerPhrase: triggerInput,
      workflowName: workflowInput,
      description: descInput || 'Custom user voice macro sequence.',
      enabled: true
    };

    saveMacrosToStorage([newMacro, ...macros]);
    setTriggerInput('');
    setDescInput('');
    setShowAddModal(false);
    setSuccessMsg(`Successfully created voice macro alias "${triggerInput}"!`);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const deleteMacro = (id: string) => {
    saveMacrosToStorage(macros.filter(m => m.id !== id));
    setSuccessMsg('Successfully deleted voice macro.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const toggleMacro = (id: string) => {
    saveMacrosToStorage(macros.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Mic className="w-4 h-4" /> Voice Macro Manager & Aliases
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Custom Voice Commands</h2>
          <p className="text-sm text-slate-500 mt-1">
            Map natural language voice aliases to your complex workflow sequences for intuitive, hands-free automation.
          </p>
        </div>
        <div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Voice Macro
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">×</button>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mic className="w-4 h-4 text-blue-600" /> New Voice Macro Alias
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">×</button>
            </div>
            <form onSubmit={handleAddMacro} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Trigger Voice Phrase:</label>
                <input
                  type="text"
                  required
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  placeholder="e.g., 'Hey Copilot, generate Q3 report'"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Workflow Template:</label>
                <select
                  value={workflowInput}
                  onChange={(e) => setWorkflowInput(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="AI Market Research & Executive Brief">AI Market Research & Executive Brief</option>
                  <option value="Competitor URL Scraper & Calendar Review">Competitor URL Scraper & Calendar Review</option>
                  <option value="Weekly Status Update Pipeline">Weekly Status Update Pipeline</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description:</label>
                <input
                  type="text"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="e.g., Automates web scraping and Gemini summary."
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Save Macro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MACROS LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {macros.map((macro) => (
          <div key={macro.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between hover:border-blue-300 transition">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 rounded-md border border-red-200 flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Voice Alias
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={macro.enabled} onChange={() => toggleMacro(macro.id)} className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">&quot;{macro.triggerPhrase}&quot;</h3>
                <p className="text-xs text-slate-600 mt-1">{macro.description}</p>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs flex items-center gap-2 text-slate-700 font-medium">
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Mapped Workflow: <strong className="text-slate-900">{macro.workflowName}</strong></span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                onClick={() => onExecuteWorkflow?.(macro.workflowName)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Test Macro
              </button>
              <button
                onClick={() => deleteMacro(macro.id)}
                className="p-2 text-slate-400 hover:text-red-600 rounded-lg transition"
                title="Delete Macro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
