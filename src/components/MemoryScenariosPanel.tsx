import React, { useState } from 'react';
import { useMemory } from '../context/MemoryContext';
import { MemoryType } from '../types';
import { 
  MEMORY_SCENARIOS, 
  MEMORY_SCENARIOS_TABS, 
  MemoryScenario 
} from '../data/memoryScenariosData';
import { 
  Brain, 
  Sparkles, 
  Shield, 
  FileText, 
  Copy, 
  Check, 
  ArrowRight, 
  Tag, 
  CheckCircle2, 
  ExternalLink, 
  Plus, 
  Search, 
  HelpCircle, 
  MessageSquare,
  Zap,
  Sliders,
  Send,
  Loader2,
  BookOpen
} from 'lucide-react';

interface MemoryScenariosPanelProps {
  onClose?: () => void;
  isModal?: boolean;
}

export const MemoryScenariosPanel: React.FC<MemoryScenariosPanelProps> = ({
  onClose,
  isModal = false
}) => {
  const { saveMemory, openRememberModal, memories } = useMemory();
  const [activeTab, setActiveTab] = useState<'project_context' | 'communication_preferences' | 'process_rules'>('project_context');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<string | null>(null);

  // Custom Scenario Form State
  const [customTitle, setCustomTitle] = useState('');
  const [customPayload, setCustomPayload] = useState('');
  const [customType, setCustomType] = useState<MemoryType>('knowledge');
  const [customTags, setCustomTags] = useState('custom, rule');
  const [isCustomSaving, setIsCustomSaving] = useState(false);
  const [customSaveSuccess, setCustomSaveSuccess] = useState(false);

  const activeTabMeta = MEMORY_SCENARIOS_TABS.find(t => t.id === activeTab) || MEMORY_SCENARIOS_TABS[0];

  const filteredScenarios = MEMORY_SCENARIOS.filter(s => {
    const matchesTab = s.category === activeTab;
    if (!matchesTab) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.payload.toLowerCase().includes(q) ||
      s.tags.some(t => t.toLowerCase().includes(q)) ||
      s.testPrompt.toLowerCase().includes(q)
    );
  });

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleApplyDirectly = async (scenario: MemoryScenario) => {
    setSavingId(scenario.id);
    try {
      await saveMemory({
        title: scenario.title,
        content: scenario.payload,
        type: scenario.memoryType,
        tags: scenario.tags,
        source: 'chat_remember_this'
      });
      setSavedSuccessId(scenario.id);
      setTimeout(() => setSavedSuccessId(null), 3000);
    } catch (err) {
      console.error('Failed to save scenario memory:', err);
    } finally {
      setSavingId(null);
    }
  };

  const handleLoadIntoRememberModal = (scenario: MemoryScenario) => {
    openRememberModal({
      title: scenario.title,
      content: scenario.payload,
      type: scenario.memoryType,
      tags: scenario.tags
    });
    if (onClose) onClose();
  };

  const handleSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customPayload.trim()) return;

    setIsCustomSaving(true);
    try {
      const parsedTags = customTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
      await saveMemory({
        title: customTitle.trim(),
        content: customPayload.trim(),
        type: customType,
        tags: parsedTags.length > 0 ? parsedTags : [customType],
        source: 'chat_remember_this'
      });
      setCustomSaveSuccess(true);
      setTimeout(() => {
        setCustomSaveSuccess(false);
        setCustomTitle('');
        setCustomPayload('');
      }, 2500);
    } catch (err) {
      console.error('Failed to save custom memory:', err);
    } finally {
      setIsCustomSaving(false);
    }
  };

  const getCategoryIcon = (type: MemoryType) => {
    switch (type) {
      case 'instruction':
        return <Shield className="w-3.5 h-3.5 text-emerald-500" />;
      case 'persona':
        return <Sparkles className="w-3.5 h-3.5 text-purple-500" />;
      case 'agent_workflow':
        return <Brain className="w-3.5 h-3.5 text-indigo-500" />;
      case 'knowledge':
      default:
        return <FileText className="w-3.5 h-3.5 text-blue-500" />;
    }
  };

  const getCategoryLabel = (type: MemoryType) => {
    switch (type) {
      case 'instruction':
        return 'Instruction (Safety & Rules)';
      case 'persona':
        return 'Persona (Tone & Style)';
      case 'agent_workflow':
        return 'Workflow (Cron & Routine)';
      case 'knowledge':
      default:
        return 'Knowledge (Facts & Context)';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-bold border border-blue-400/30 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 2nd Brain Training Playbook
              </span>
              <span className="text-[11px] text-slate-300">
                {memories.length} Active Memories in Knowledge Base
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Memory Scenarios & Prompt Engineering Guide
            </h2>
            <p className="text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Explore step-by-step example inputs and user prompts across 3 core categories to teach your 2nd Brain how to retain business facts, executive tone, and operational safety rules.
            </p>
          </div>

          <button
            onClick={() => openRememberModal()}
            className="self-start md:self-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <Brain className="w-4 h-4" /> Open 'Remember This' Modal
          </button>
        </div>
      </div>

      {/* 3 Categorized Navigation Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MEMORY_SCENARIOS_TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition relative cursor-pointer ${
                isActive
                  ? 'bg-white dark:bg-slate-900 border-blue-600 dark:border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-900 text-slate-600 dark:text-slate-400'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  {tab.id === 'project_context' && <FileText className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />}
                  {tab.id === 'communication_preferences' && <Sparkles className={`w-4 h-4 ${isActive ? 'text-purple-600' : 'text-slate-400'}`} />}
                  {tab.id === 'process_rules' && <Shield className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />}
                  <span className={`text-xs font-bold ${isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                    {tab.label}
                  </span>
                </div>
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Active Tab Explanation & Search Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            Category: {activeTabMeta.label} ({filteredScenarios.length} Scenarios)
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {activeTabMeta.description}
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter scenarios or keywords..."
            className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Scenarios List */}
      <div className="space-y-6">
        {filteredScenarios.map((scenario, index) => {
          const isSaving = savingId === scenario.id;
          const isSavedSuccess = savedSuccessId === scenario.id;
          const isCopied = copiedId === scenario.id;

          return (
            <div
              key={scenario.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition hover:shadow-md"
            >
              {/* Scenario Header Bar */}
              <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      {scenario.title}
                    </h4>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      {getCategoryIcon(scenario.memoryType)}
                      <span>{getCategoryLabel(scenario.memoryType)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopyText(scenario.id, scenario.payload)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copied' : 'Copy Payload'}</span>
                  </button>

                  <button
                    onClick={() => handleLoadIntoRememberModal(scenario)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-[11px] font-semibold text-slate-800 dark:text-slate-200 transition cursor-pointer"
                    title="Load into Remember This Modal to customize"
                  >
                    <Sliders className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Customize in Modal</span>
                  </button>

                  <button
                    onClick={() => handleApplyDirectly(scenario)}
                    disabled={isSaving}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                  >
                    {isSavedSuccess ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                        <span>Saved to 2nd Brain!</span>
                      </>
                    ) : isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Save to 2nd Brain</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Scenario Body: Inputs Preview & Testing Guide */}
              <div className="p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
                {/* Left Side (8 cols): The Exact Fields to Enter in "Remember This" */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                      Modal Input Payload
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                      Type: {scenario.memoryType}
                    </span>
                  </div>

                  {/* Title Preview */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Guideline Title
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={scenario.title}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-medium text-slate-800 dark:text-slate-200"
                    />
                  </div>

                  {/* Text / Prompt Payload */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Remembered Text / Prompt Instruction
                    </label>
                    <textarea
                      readOnly
                      rows={5}
                      value={scenario.payload}
                      className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-slate-200 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1 flex items-center gap-1">
                      <Tag className="w-3 h-3" /> Tags
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {scenario.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Side (5 cols): Real-World Testing & Rationale */}
                <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-slate-100">
                      <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                      How to Test in Chat Afterwards
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">User Prompt to Try:</div>
                      <div className="font-semibold text-slate-800 dark:text-slate-200 italic text-[11px]">
                        "{scenario.testPrompt}"
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Expected 2nd Brain Result:
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                        {scenario.expectedBehavior}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <span><strong>Why this works:</strong> {scenario.whyItWorks}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive "Try Your Own Custom Scenario" Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-600" />
              Practice: Add Your Own Custom Memory Scenario
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Apply what you've learned to teach your 2nd Brain custom instructions, preferences, or domain rules right now.
            </p>
          </div>

          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Live Interactive
          </span>
        </div>

        <form onSubmit={handleSaveCustom} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Memory Category
              </label>
              <select
                value={customType}
                onChange={(e) => setCustomType(e.target.value as MemoryType)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="knowledge">📄 Knowledge (Context & facts)</option>
                <option value="persona">🌟 Persona (Tone & style)</option>
                <option value="instruction">🛡️ Instruction (Behavior & safety)</option>
                <option value="agent_workflow">🧠 Workflow (Cron & automation)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Memory Title / Guideline Name
              </label>
              <input
                type="text"
                required
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="e.g. VIP Client Email Protocol, or Weekly Monday Scan"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Remembered Text / Prompt Payload
            </label>
            <textarea
              required
              rows={3}
              value={customPayload}
              onChange={(e) => setCustomPayload(e.target.value)}
              placeholder="Write the exact rule, context, or persona instructions for the 2nd Brain to remember..."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 resize-none font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" /> Tags (comma-separated)
              </label>
              <input
                type="text"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="custom, executive, client"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={isCustomSaving || !customTitle.trim() || !customPayload.trim()}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer disabled:opacity-50"
              >
                {customSaveSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-300" /> Saved to 2nd Brain!
                  </>
                ) : isCustomSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving Memory...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Save Practice Scenario to 2nd Brain
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
