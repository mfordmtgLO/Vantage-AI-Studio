import React, { useState, useMemo } from 'react';
import { useMemory } from '../context/MemoryContext';
import { 
  Shield, 
  Sparkles, 
  Sliders, 
  Volume2, 
  Ban, 
  CheckCircle2, 
  RotateCcw, 
  AlertTriangle, 
  Lock, 
  FileText, 
  Code, 
  Globe, 
  Zap, 
  Plus, 
  Trash2, 
  X, 
  Copy, 
  Eye, 
  MessageSquare, 
  BookOpen, 
  HeartHandshake, 
  Check, 
  Download,
  History,
  Search,
  Filter,
  Unlock,
  CheckSquare,
  Square,
  Flame,
  Layers,
  ArrowRight,
  FileDown,
  ChevronDown
} from 'lucide-react';
import { 
  GuardrailSettings, 
  PersonalityPreset, 
  ToneDemeanor, 
  VerbosityLevel, 
  HumorLevel, 
  CensorshipMode, 
  SensitiveTopicPolicy, 
  ActionExecutionBoundary,
  CustomizationInputRecord
} from '../types';
import { 
  compileGuardrailPromptDirectives,
  DEFAULT_CUSTOMIZATION_HISTORY 
} from '../services/guardrailService';

interface GuardrailsStudioProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const GuardrailsAndBoundariesStudio: React.FC<GuardrailsStudioProps> = ({ isModal = false, onClose }) => {
  const { 
    guardrails, 
    updateGuardrails, 
    resetGuardrailsToDefault, 
    applyGuardrailPreset,
    recordGuardrailCustomization,
    deleteGuardrailInput,
    deleteMultipleGuardrailInputs,
    cleanWipeGuardrails,
    cloudSyncStatus 
  } = useMemory();

  const [activeTab, setActiveTab] = useState<'history' | 'personality' | 'boundaries' | 'scope' | 'alignment' | 'preview'>('history');
  const [newForbiddenTopic, setNewForbiddenTopic] = useState('');
  const [newCustomRule, setNewCustomRule] = useState('');
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [saveToast, setSaveToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Historical Inputs Filter & Multi-select State
  const [historySearch, setHistorySearch] = useState('');
  const [historyCategoryFilter, setHistoryCategoryFilter] = useState<string>('all');
  const [selectedInputIds, setSelectedInputIds] = useState<string[]>([]);
  const [showCleanWipeConfirm, setShowCleanWipeConfirm] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const presets: { id: PersonalityPreset; label: string; icon: any; desc: string }[] = [
    { id: 'adaptive', label: 'Adaptive Partner', icon: Sparkles, desc: 'Balances depth, speed, and analytical tone dynamically' },
    { id: 'executive', label: 'Chief of Staff', icon: Shield, desc: 'High-signal, decisive, executive brevity with zero fluff' },
    { id: 'academic', label: 'Academic & Socratic', icon: BookOpen, desc: 'Deep rigor, historical foundations, peer-level depth' },
    { id: 'direct_minimalist', label: 'Direct Minimalist', icon: Zap, desc: 'Raw technical signal, zero preamble, no conversational pleasantries' },
    { id: 'creative', label: 'Creative Writer', icon: HeartHandshake, desc: 'Orthogonal brainstorms, rich narrative metaphors' },
    { id: 'unconstrained', label: '⚡ Unconstrained Freedom', icon: Unlock, desc: 'Zero curbs, zero boundaries, zero censorship. Full prompt engineering freedom' }
  ];

  const triggerSaveToast = (message = 'Saved & Applied to 2nd Brain!') => {
    setSaveToast({ message, visible: true });
    setTimeout(() => setSaveToast({ message: '', visible: false }), 2400);
  };

  const handlePresetClick = async (presetId: PersonalityPreset) => {
    await applyGuardrailPreset(presetId);
    if (presetId === 'unconstrained') {
      await cleanWipeGuardrails();
      triggerSaveToast('Clean Wipe Applied: Unconstrained Freedom Active');
    } else {
      await recordGuardrailCustomization({
        category: 'preset',
        label: `Archetype Preset: ${presetId}`,
        field: 'personalityPreset',
        value: presetId,
        description: `Applied preset archetype configuration for ${presetId}`
      });
      triggerSaveToast(`Applied ${presetId} archetype preset`);
    }
  };

  const handleUpdate = async (patch: Partial<GuardrailSettings>, recordEntry?: Omit<CustomizationInputRecord, 'id' | 'timestamp'>) => {
    await updateGuardrails(patch);
    if (recordEntry) {
      await recordGuardrailCustomization(recordEntry);
    }
    triggerSaveToast();
  };

  // Forbidden Topics Management
  const handleAddForbiddenTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    const topic = newForbiddenTopic.trim();
    if (!topic) return;
    const current = guardrails.forbiddenTopics || [];
    if (!current.includes(topic)) {
      const updatedTopics = [...current, topic];
      await updateGuardrails({ forbiddenTopics: updatedTopics, unconstrainedMode: false });
      await recordGuardrailCustomization({
        category: 'topic',
        label: `Forbidden Topic: ${topic}`,
        field: 'forbiddenTopics',
        value: topic,
        description: `Restricts 2nd Brain speculation and advice regarding ${topic}`
      });
      triggerSaveToast(`Added topic restriction: "${topic}"`);
    }
    setNewForbiddenTopic('');
  };

  const handleRemoveForbiddenTopic = async (topic: string) => {
    const updated = (guardrails.forbiddenTopics || []).filter(t => t !== topic);
    await updateGuardrails({ forbiddenTopics: updated });
    // Also remove from customization history if matches
    const matchingHist = (guardrails.customizationHistory || []).find(
      h => h.category === 'topic' && String(h.value).toLowerCase() === topic.toLowerCase()
    );
    if (matchingHist) {
      await deleteGuardrailInput(matchingHist.id);
    }
    triggerSaveToast(`Removed topic restriction: "${topic}"`);
  };

  // Custom Directives Management
  const handleAddCustomRule = async (e: React.FormEvent) => {
    e.preventDefault();
    const rule = newCustomRule.trim();
    if (!rule) return;
    const current = guardrails.customGuardrailDirectives || [];
    if (!current.includes(rule)) {
      const updatedRules = [...current, rule];
      await updateGuardrails({ customGuardrailDirectives: updatedRules, unconstrainedMode: false });
      await recordGuardrailCustomization({
        category: 'rule',
        label: `Custom Directive: ${rule.slice(0, 45)}...`,
        field: 'customGuardrailDirectives',
        value: rule,
        description: `Operational directive injected into system prompts`
      });
      triggerSaveToast('Added custom operational directive');
    }
    setNewCustomRule('');
  };

  const handleRemoveCustomRule = async (rule: string) => {
    const updated = (guardrails.customGuardrailDirectives || []).filter(r => r !== rule);
    await updateGuardrails({ customGuardrailDirectives: updated });
    const matchingHist = (guardrails.customizationHistory || []).find(
      h => h.category === 'rule' && h.value === rule
    );
    if (matchingHist) {
      await deleteGuardrailInput(matchingHist.id);
    }
    triggerSaveToast('Removed operational directive');
  };

  // Single Input Deletion from Historical inputs
  const handleDeleteSingleInput = async (record: CustomizationInputRecord) => {
    await deleteGuardrailInput(record.id);
    setSelectedInputIds(prev => prev.filter(id => id !== record.id));
    triggerSaveToast(`Deleted input "${record.label}" — 2nd Brain updated`);
  };

  // Multi-select Deletion from Historical inputs
  const handleDeleteSelectedInputs = async () => {
    if (selectedInputIds.length === 0) return;
    const count = selectedInputIds.length;
    await deleteMultipleGuardrailInputs(selectedInputIds);
    setSelectedInputIds([]);
    triggerSaveToast(`Deleted ${count} past customization inputs — 2nd Brain updated`);
  };

  // Clean Wipe / Freedom Mode Execution
  const handlePerformCleanWipe = async () => {
    await cleanWipeGuardrails();
    setSelectedInputIds([]);
    setShowCleanWipeConfirm(false);
    triggerSaveToast('⚡ Clean Wipe complete! 2nd Brain is now in 100% Unconstrained Freedom Mode');
  };

  const isUnconstrainedActive = guardrails.unconstrainedMode || guardrails.personalityPreset === 'unconstrained';

  // Historical inputs list & filtering
  const allHistoryRecords = useMemo(() => {
    return Array.isArray(guardrails.customizationHistory)
      ? guardrails.customizationHistory
      : DEFAULT_CUSTOMIZATION_HISTORY;
  }, [guardrails.customizationHistory]);

  const customizationHistoryList = useMemo(() => {
    return allHistoryRecords.filter(item => {
      const matchesSearch = !historySearch.trim() || 
        item.label.toLowerCase().includes(historySearch.toLowerCase()) ||
        String(item.value).toLowerCase().includes(historySearch.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(historySearch.toLowerCase()));
      
      const matchesCategory = historyCategoryFilter === 'all' || item.category === historyCategoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [allHistoryRecords, historySearch, historyCategoryFilter]);

  const allFilteredSelected = customizationHistoryList.length > 0 && 
    customizationHistoryList.every(item => selectedInputIds.includes(item.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      const filteredIds = new Set(customizationHistoryList.map(i => i.id));
      setSelectedInputIds(prev => prev.filter(id => !filteredIds.has(id)));
    } else {
      const filteredIds = customizationHistoryList.map(i => i.id);
      setSelectedInputIds(prev => Array.from(new Set([...prev, ...filteredIds])));
    }
  };

  const toggleSelectInput = (id: string) => {
    setSelectedInputIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // ----------------------------------------------------
  // EXPORT BUILDERS: MARKDOWN & JSON
  // ----------------------------------------------------
  const generateGuardrailsMarkdown = (items: CustomizationInputRecord[], scopeLabel: string): string => {
    const dateStr = new Date().toLocaleString();
    const unconstrainedStatus = isUnconstrainedActive
      ? '⚡ UNCONSTRAINED FREEDOM (Clean Wiped - Zero Curbs)'
      : 'Active Guardrails & Boundaries Enforced';

    let md = `# 🛡️ Vantage 2nd Brain Guardrails & Boundaries Specification\n\n`;
    md += `> **Generated:** ${dateStr}  \n`;
    md += `> **Export Scope:** ${scopeLabel}  \n`;
    md += `> **Total Rules/Curbs:** ${items.length}  \n`;
    md += `> **Operating Mode:** ${unconstrainedStatus}  \n`;
    md += `> **Active Archetype:** ${guardrails.personalityPreset || 'adaptive'}\n\n`;

    md += `---\n\n`;
    md += `## 📋 Overview\n\n`;
    md += `This specification exports the configured guardrails, content moderation boundaries, language curbs, and operational directives governing the Vantage AI 2nd Brain reasoning engine.\n\n`;

    // Group items by category
    const categories: Record<string, CustomizationInputRecord[]> = {};
    for (const item of items) {
      const cat = item.category || 'other';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(item);
    }

    const categoryTitles: Record<string, string> = {
      topic: '🚫 Forbidden Subjects & Sensitive Topic Curbs',
      rule: '📜 Custom Operational Directives & Behavioral Contracts',
      language_curb: '🗣️ Language Curbs & Expression Filters',
      boundary: '🔒 Content Censorship & Moderation Policies',
      action_scope: '⚡ Permissible Action & Capability Boundaries',
      persona: '🧠 Core Persona Directives & Demeanor Stance',
      preset: '🎭 Archetype Presets & Configurations'
    };

    for (const [catKey, catItems] of Object.entries(categories)) {
      const title = categoryTitles[catKey] || `📌 ${catKey.toUpperCase()} Rules`;
      md += `### ${title} (${catItems.length})\n\n`;
      for (const item of catItems) {
        md += `#### ${item.label}\n`;
        if (item.description) {
          md += `- **Description:** ${item.description}\n`;
        }
        const formattedVal = typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value);
        md += `- **Configured Value:** \`${formattedVal}\`\n`;
        md += `- **Date Added:** ${new Date(item.timestamp).toLocaleString()}\n\n`;
      }
    }

    md += `---\n\n`;
    md += `## 📊 Complete Audit Table\n\n`;
    md += `| # | Category | Rule / Label | Value | Description | Added Date |\n`;
    md += `|---|---|---|---|---|---|\n`;
    items.forEach((item, idx) => {
      const cleanLabel = item.label.replace(/\|/g, '\\|');
      const cleanVal = (typeof item.value === 'object' ? JSON.stringify(item.value) : String(item.value)).replace(/\|/g, '\\|');
      const cleanDesc = (item.description || '-').replace(/\|/g, '\\|');
      const time = new Date(item.timestamp).toLocaleDateString() + ' ' + new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      md += `| ${idx + 1} | \`${item.category}\` | **${cleanLabel}** | \`${cleanVal}\` | ${cleanDesc} | ${time} |\n`;
    });

    md += `\n\n---\n*Exported securely from Vantage AI 2nd Brain Studio.*`;
    return md;
  };

  const generateGuardrailsJSON = (items: CustomizationInputRecord[], scopeLabel: string): string => {
    const payload = {
      exportMetadata: {
        title: "Vantage 2nd Brain Guardrails & Boundaries Export",
        exportedAt: new Date().toISOString(),
        scope: scopeLabel,
        totalExportedRules: items.length,
        searchFilterApplied: historySearch ? historySearch : null,
        categoryFilterApplied: historyCategoryFilter,
        unconstrainedMode: isUnconstrainedActive,
        personalityPreset: guardrails.personalityPreset
      },
      activeGuardrailContext: {
        personalityPreset: guardrails.personalityPreset,
        toneDemeanor: guardrails.toneDemeanor,
        verbosity: guardrails.verbosity,
        censorshipMode: guardrails.censorshipMode,
        forbiddenTopics: guardrails.forbiddenTopics,
        languageCurbs: guardrails.languageCurbs,
        actionExecutionBoundary: guardrails.actionExecutionBoundary,
        customGuardrailDirectives: guardrails.customGuardrailDirectives
      },
      exportedGuardrailsAndBoundaries: items
    };

    return JSON.stringify(payload, null, 2);
  };

  // Download dispatchers
  const exportItemsAsMarkdown = (targetItems: CustomizationInputRecord[], isSpecificSelection: boolean) => {
    if (targetItems.length === 0) return;
    const scopeLabel = isSpecificSelection 
      ? `${targetItems.length} Selected Input(s)`
      : `Filtered Search List (${targetItems.length} rules${historySearch ? ` for query "${historySearch}"` : ''})`;
    
    const markdownText = generateGuardrailsMarkdown(targetItems, scopeLabel);
    const blob = new Blob([markdownText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage_guardrails_${targetItems.length}_rules_${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    triggerSaveToast(`Exported ${targetItems.length} guardrails as Markdown (.md)`);
  };

  const exportItemsAsJSON = (targetItems: CustomizationInputRecord[], isSpecificSelection: boolean) => {
    if (targetItems.length === 0) return;
    const scopeLabel = isSpecificSelection 
      ? `${targetItems.length} Selected Input(s)`
      : `Filtered Search List (${targetItems.length} rules${historySearch ? ` for query "${historySearch}"` : ''})`;
    
    const jsonText = generateGuardrailsJSON(targetItems, scopeLabel);
    const blob = new Blob([jsonText], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage_guardrails_${targetItems.length}_rules_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
    triggerSaveToast(`Exported ${targetItems.length} guardrails as JSON (.json)`);
  };

  // Items currently selected by user
  const selectedItemsList = useMemo(() => {
    return allHistoryRecords.filter(item => selectedInputIds.includes(item.id));
  }, [allHistoryRecords, selectedInputIds]);

  const compiledPrompt = compileGuardrailPromptDirectives(guardrails);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(compiledPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleExportFullJSON = () => {
    exportItemsAsJSON(allHistoryRecords, false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden">
      {/* Studio Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-2xl border shadow-xs ${
            isUnconstrainedActive 
              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/60'
              : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/60'
          }`}>
            {isUnconstrainedActive ? <Unlock className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center flex-wrap gap-2">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                2nd Brain Boundary & Guardrail Studio
              </h2>
              {isUnconstrainedActive ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  <Flame className="w-3 h-3 text-amber-500 animate-pulse" />
                  Clean Wiped (Zero Curbs & Full Freedom)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Active Curbs & Rules Synced
                </span>
              )}
              {saveToast.visible && (
                <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold animate-in fade-in flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  {saveToast.message}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit and export past customization inputs, search and export boundaries to Markdown / JSON, or execute a clean wipe.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Clean Wipe Trigger Button in Header */}
          <button
            type="button"
            onClick={() => setShowCleanWipeConfirm(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition cursor-pointer border ${
              isUnconstrainedActive
                ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                : 'bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
            }`}
            title="Clean wipe all past inputs and open 2nd brain to unrestricted freedom"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" /> 
            {isUnconstrainedActive ? 'Freedom Mode Active' : 'Clean Wipe & Reset'}
          </button>

          <button
            type="button"
            onClick={handleExportFullJSON}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Export all guardrails to JSON"
          >
            <Code className="w-3.5 h-3.5" /> Export JSON
          </button>

          <button
            type="button"
            onClick={() => exportItemsAsMarkdown(allHistoryRecords, false)}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700"
            title="Export all guardrails to Markdown"
          >
            <FileText className="w-3.5 h-3.5" /> Export .MD
          </button>

          <button
            type="button"
            onClick={resetGuardrailsToDefault}
            className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer"
            title="Reset to recommended standard defaults"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Archetype Preset Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 shrink-0 overflow-x-auto">
        <div className="flex items-center gap-2 min-w-max">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Archetypes:
          </span>
          {presets.map(p => {
            const Icon = p.icon;
            const isSelected = guardrails.personalityPreset === p.id;
            const isFreedom = p.id === 'unconstrained';
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handlePresetClick(p.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                  isSelected
                    ? isFreedom
                      ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                      : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : isFreedom
                      ? 'bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60 hover:bg-amber-100'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                }`}
                title={p.desc}
              >
                <Icon className="w-3.5 h-3.5" />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 bg-white dark:bg-slate-900 shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'history'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4 text-blue-500" />
          Search & Export Guardrails ({(guardrails.customizationHistory || DEFAULT_CUSTOMIZATION_HISTORY).length})
        </button>
        <button
          onClick={() => setActiveTab('boundaries')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'boundaries'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Ban className="w-4 h-4" /> Censorship & Sensitive Topics ({guardrails.forbiddenTopics?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('alignment')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'alignment'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Custom Rules & Directives ({guardrails.customGuardrailDirectives?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('personality')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'personality'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" /> Personality & Demeanor
        </button>
        <button
          onClick={() => setActiveTab('scope')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'scope'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Lock className="w-4 h-4" /> Scope & Action Boundaries
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition cursor-pointer whitespace-nowrap ${
            activeTab === 'preview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" /> Live Prompt Inspector
        </button>
      </div>

      {/* Main Tab Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {/* TAB 0: HISTORICAL USER CUSTOMIZATION INPUTS, SEARCH, AND EXPORT */}
        {activeTab === 'history' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            
            {/* CLEAN WIPE & UNCONSTRAINED MASTER CONTROL CARD */}
            <div className={`p-5 rounded-2xl border shadow-xs transition ${
              isUnconstrainedActive 
                ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    isUnconstrainedActive 
                      ? 'bg-amber-600 text-white' 
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60'
                  }`}>
                    <Flame className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        Clean Wipe & Reset: Open 2nd Brain to Original Unconstrained State
                      </h3>
                      {isUnconstrainedActive && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-full uppercase tracking-wide">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      Deletes all past user customization inputs, clears language curbs, removes forbidden topic blocks, and lifts content censorship boundaries. Opens the 2nd Brain to <strong>unrestricted conversational & prompt engineering freedom</strong> in whatever direction requested.
                    </p>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 sm:self-center">
                  <label className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-300 dark:border-slate-700 cursor-pointer text-xs font-bold transition select-none">
                    <input
                      type="checkbox"
                      checked={isUnconstrainedActive}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setShowCleanWipeConfirm(true);
                        } else {
                          resetGuardrailsToDefault();
                          triggerSaveToast('Restored standard guardrails');
                        }
                      }}
                      className="w-4 h-4 accent-amber-600 rounded-sm cursor-pointer"
                    />
                    <span>Unconstrained Freedom Mode</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => setShowCleanWipeConfirm(true)}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs whitespace-nowrap"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Perform Clean Wipe
                  </button>
                </div>
              </div>
            </div>

            {/* CONFIRMATION MODAL FOR CLEAN WIPE */}
            {showCleanWipeConfirm && (
              <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 shadow-md animate-in fade-in space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-rose-800 dark:text-rose-200">
                      Confirm Clean Wipe & Reset to Unconstrained 2nd Brain?
                    </h4>
                    <p className="text-xs text-rose-700 dark:text-rose-300 leading-relaxed">
                      This will delete all past customization inputs, disable profanity and tone curbs, remove all forbidden topics, and configure the 2nd Brain with zero censorship boundaries or moralizing disclaimers. It will be free to follow any prompt engineering direction.
                    </p>
                  </div>
                </div>
                <div className="flex justify-end items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCleanWipeConfirm(false)}
                    className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handlePerformCleanWipe}
                    className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Flame className="w-3.5 h-3.5" />
                    Yes, Clean Wipe All Inputs & Open 2nd Brain
                  </button>
                </div>
              </div>
            )}

            {/* HISTORICAL INPUTS SEARCH, AUDIT & EXPORT LIST VIEW */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-500" />
                    Boundaries & Guardrails Search & Export List
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Search and select one, multiple, or all showing boundaries and guardrails to export as a Markdown (.md) or JSON (.json) file.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {customizationHistoryList.length} inputs showing
                  </span>
                  {selectedInputIds.length > 0 && (
                    <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {selectedInputIds.length} selected
                    </span>
                  )}
                </div>
              </div>

              {/* Search, Filter & Export Toolbar */}
              <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
                {/* Search input & category selector */}
                <div className="flex flex-1 gap-2 flex-wrap sm:flex-nowrap">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={historySearch}
                      onChange={(e) => setHistorySearch(e.target.value)}
                      placeholder="Search boundaries by keyword, topic, label, rule..."
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="relative shrink-0">
                    <select
                      value={historyCategoryFilter}
                      onChange={(e) => setHistoryCategoryFilter(e.target.value)}
                      className="py-2 pl-3 pr-8 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:outline-hidden focus:ring-2 focus:ring-blue-500 font-medium cursor-pointer"
                    >
                      <option value="all">All Categories</option>
                      <option value="topic">Forbidden Topics</option>
                      <option value="rule">Custom Directives</option>
                      <option value="language_curb">Language Curbs</option>
                      <option value="boundary">Boundaries & Policies</option>
                      <option value="action_scope">Action Scope</option>
                      <option value="persona">Persona Stance</option>
                      <option value="preset">Presets</option>
                    </select>
                  </div>
                </div>

                {/* Bulk selection and Export action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {/* Select All Toggle */}
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    className="px-2.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-slate-200 dark:border-slate-700"
                    title={allFilteredSelected ? 'Deselect all visible items' : 'Select all visible items'}
                  >
                    {allFilteredSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  </button>

                  {/* Dynamic Export as Markdown Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const targets = selectedInputIds.length > 0 ? selectedItemsList : customizationHistoryList;
                      exportItemsAsMarkdown(targets, selectedInputIds.length > 0);
                    }}
                    disabled={customizationHistoryList.length === 0}
                    className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-blue-200 dark:border-blue-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                    title="Export selected or all showing guardrails as Markdown document"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {selectedInputIds.length > 0
                      ? `Export (${selectedInputIds.length}) as .MD`
                      : `Export Showing (${customizationHistoryList.length}) .MD`}
                  </button>

                  {/* Dynamic Export as JSON Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const targets = selectedInputIds.length > 0 ? selectedItemsList : customizationHistoryList;
                      exportItemsAsJSON(targets, selectedInputIds.length > 0);
                    }}
                    disabled={customizationHistoryList.length === 0}
                    className="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 rounded-xl flex items-center gap-1.5 transition cursor-pointer border border-emerald-200 dark:border-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                    title="Export selected or all showing guardrails as JSON file"
                  >
                    <Code className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {selectedInputIds.length > 0
                      ? `Export (${selectedInputIds.length}) as .JSON`
                      : `Export Showing (${customizationHistoryList.length}) .JSON`}
                  </button>

                  {/* Delete Selected (if any selected) */}
                  {selectedInputIds.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDeleteSelectedInputs}
                      className="px-3 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs animate-in fade-in"
                      title="Delete selected customization inputs immediately"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete ({selectedInputIds.length})
                    </button>
                  )}
                </div>
              </div>

              {/* Items List View */}
              <div className="space-y-2.5 pt-2">
                {customizationHistoryList.length === 0 ? (
                  <div className="p-8 text-center rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
                    <History className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      No matching historical customization inputs found
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {isUnconstrainedActive 
                        ? 'Clean wipe is active. The 2nd Brain is currently in unconstrained mode with zero past curbs.'
                        : 'Add new forbidden topics, custom rules, or change demeanor in the other tabs to log customizations.'}
                    </p>
                  </div>
                ) : (
                  customizationHistoryList.map((record) => {
                    const isSelected = selectedInputIds.includes(record.id);
                    
                    const categoryColors: Record<string, string> = {
                      topic: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900/60',
                      rule: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60',
                      language_curb: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/60',
                      boundary: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/60',
                      action_scope: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/60',
                      persona: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-900/60',
                      preset: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-900/60'
                    };

                    const badgeClass = categoryColors[record.category] || 'bg-slate-100 text-slate-700';

                    return (
                      <div
                        key={record.id}
                        className={`flex items-start justify-between gap-3 p-3.5 rounded-xl border transition ${
                          isSelected
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                            : 'bg-slate-50/80 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectInput(record.id)}
                            className="mt-1 w-4 h-4 accent-blue-600 rounded-sm cursor-pointer shrink-0"
                          />
                          <div className="space-y-1 flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${badgeClass}`}>
                                {record.category.replace('_', ' ')}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {record.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono ml-auto shrink-0">
                                {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(record.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                            
                            {record.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                {record.description}
                              </p>
                            )}

                            <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-white/70 dark:bg-slate-900/70 px-2 py-1 rounded-md border border-slate-200/60 dark:border-slate-800/60 truncate">
                              Value: {typeof record.value === 'object' ? JSON.stringify(record.value) : String(record.value)}
                            </div>
                          </div>
                        </div>

                        {/* Individual Item Actions */}
                        <div className="shrink-0 flex items-center gap-1 self-center">
                          <button
                            type="button"
                            onClick={() => exportItemsAsMarkdown([record], true)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition cursor-pointer"
                            title="Export this rule as Markdown (.md)"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => exportItemsAsJSON([record], true)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 rounded-lg transition cursor-pointer"
                            title="Export this rule as JSON (.json)"
                          >
                            <Code className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSingleInput(record)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition cursor-pointer"
                            title="Delete this past customization input (immediately updates 2nd Brain)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: CENSORSHIP & SENSITIVE TOPICS */}
        {activeTab === 'boundaries' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Censorship Mode Selector */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ban className="w-4 h-4 text-rose-500" />
                2nd Brain Content Moderation & Censorship Policy
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose the baseline guardrail rigor for discussions touching sensitive, speculative, or high-risk content.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {[
                  {
                    id: 'unconstrained',
                    label: '⚡ Unconstrained Freedom',
                    desc: 'Zero censorship, zero topic blocks. Free for all prompt engineering and theoretical exploration.'
                  },
                  {
                    id: 'standard',
                    label: 'Standard Professional',
                    desc: 'Balanced boundaries suitable for collaborative enterprise and executive research.'
                  },
                  {
                    id: 'relaxed_research',
                    label: 'Relaxed Research',
                    desc: 'Permits deep theoretical analysis, code reverse-engineering, and hypothetical evaluations.'
                  },
                  {
                    id: 'strict_enterprise',
                    label: 'Strict Enterprise',
                    desc: 'Strictly blocks speculation, personal health inquiries, and financial forecasts.'
                  }
                ].map(m => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      if (m.id === 'unconstrained') {
                        handlePerformCleanWipe();
                      } else {
                        handleUpdate(
                          { censorshipMode: m.id as CensorshipMode, unconstrainedMode: false },
                          {
                            category: 'boundary',
                            label: `Censorship Mode: ${m.label}`,
                            field: 'censorshipMode',
                            value: m.id,
                            description: `Changed censorship policy to ${m.label}`
                          }
                        );
                      }
                    }}
                    className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      (guardrails.censorshipMode === m.id || (m.id === 'unconstrained' && isUnconstrainedActive))
                        ? m.id === 'unconstrained'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-500 text-amber-900 dark:text-amber-200'
                          : 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-900 dark:text-rose-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold mb-1">{m.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Forbidden Subjects Tag Manager */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Ban className="w-4 h-4 text-rose-500" />
                    Forbidden Subjects & Sensitive Boundary Curbs
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Topics the 2nd Brain must never speculate on or generate unverified advice for.
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-full border border-rose-200 dark:border-rose-900/60">
                  {guardrails.forbiddenTopics?.length || 0} active
                </span>
              </div>

              {/* Add form */}
              <form onSubmit={handleAddForbiddenTopic} className="flex gap-2">
                <input
                  type="text"
                  value={newForbiddenTopic}
                  onChange={(e) => setNewForbiddenTopic(e.target.value)}
                  placeholder="e.g. Unverified crypto investments, workplace gossip, unsolicited medical advice..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Curb
                </button>
              </form>

              {/* Tags Display */}
              <div className="flex flex-wrap gap-2 pt-2">
                {(guardrails.forbiddenTopics || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No forbidden topics configured (Open research mode)</p>
                ) : (
                  (guardrails.forbiddenTopics || []).map((topic, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-800 dark:text-slate-200"
                    >
                      <span>{topic}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveForbiddenTopic(topic)}
                        className="text-slate-400 hover:text-rose-500 transition cursor-pointer p-0.5"
                        title="Remove curb"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Language Curbs & Voice Polishing */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-500" />
                Language Curbs & Expression Filters
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardrails.languageCurbs?.filterProfanity ?? true}
                    onChange={(e) => handleUpdate({
                      languageCurbs: { ...(guardrails.languageCurbs || {}), filterProfanity: e.target.checked } as any,
                      unconstrainedMode: false
                    }, {
                      category: 'language_curb',
                      label: `Profanity Filter: ${e.target.checked ? 'Enabled' : 'Disabled'}`,
                      field: 'languageCurbs.filterProfanity',
                      value: e.target.checked,
                      description: 'Toggles vulgarity and profanity filtering'
                    })}
                    className="mt-0.5 accent-blue-600 rounded-sm"
                  />
                  <div>
                    <div className="text-xs font-bold">Filter Profanity</div>
                    <div className="text-[10px] text-slate-400">Strictly omit coarse vulgarities</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardrails.languageCurbs?.suppressJargon ?? false}
                    onChange={(e) => handleUpdate({
                      languageCurbs: { ...(guardrails.languageCurbs || {}), suppressJargon: e.target.checked } as any,
                      unconstrainedMode: false
                    }, {
                      category: 'language_curb',
                      label: `Suppress Jargon: ${e.target.checked ? 'Enabled' : 'Disabled'}`,
                      field: 'languageCurbs.suppressJargon',
                      value: e.target.checked,
                      description: 'Suppresses complex jargon in favor of plain phrasing'
                    })}
                    className="mt-0.5 accent-blue-600 rounded-sm"
                  />
                  <div>
                    <div className="text-xs font-bold">Suppress Jargon</div>
                    <div className="text-[10px] text-slate-400">Favor clear, plain English phrasing</div>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={guardrails.languageCurbs?.avoidSpeculation ?? true}
                    onChange={(e) => handleUpdate({
                      languageCurbs: { ...(guardrails.languageCurbs || {}), avoidSpeculation: e.target.checked } as any,
                      unconstrainedMode: false
                    }, {
                      category: 'language_curb',
                      label: `Avoid Speculation: ${e.target.checked ? 'Enabled' : 'Disabled'}`,
                      field: 'languageCurbs.avoidSpeculation',
                      value: e.target.checked,
                      description: 'Restricts unfounded speculation without disclaimers'
                    })}
                    className="mt-0.5 accent-blue-600 rounded-sm"
                  />
                  <div>
                    <div className="text-xs font-bold">Avoid Speculation</div>
                    <div className="text-[10px] text-slate-400">Acknowledge unverified points directly</div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Brand Voice & Communication Style Guide
                </label>
                <input
                  type="text"
                  value={guardrails.languageCurbs?.brandAlignmentVoice || ''}
                  onChange={(e) => handleUpdate({
                    languageCurbs: { ...(guardrails.languageCurbs || {}), brandAlignmentVoice: e.target.value } as any,
                    unconstrainedMode: false
                  })}
                  placeholder="e.g. Polished Fortune 500 corporate tone, highly structured and authoritative..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM RULES & DIRECTIVES */}
        {activeTab === 'alignment' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Custom Directives Builder */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    Custom Operational Directives & Behavioral Contract
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Specific, non-negotiable rules the AI must obey during every response.
                  </p>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-200 dark:border-emerald-900/60">
                  {guardrails.customGuardrailDirectives?.length || 0} active
                </span>
              </div>

              <form onSubmit={handleAddCustomRule} className="flex gap-2">
                <input
                  type="text"
                  value={newCustomRule}
                  onChange={(e) => setNewCustomRule(e.target.value)}
                  placeholder="e.g. When generating code, always write TypeScript with strict interfaces and zero 'any'..."
                  className="flex-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Directive
                </button>
              </form>

              <div className="space-y-2 pt-2">
                {(guardrails.customGuardrailDirectives || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No custom rules active (Default unconstrained behavioral flow)</p>
                ) : (
                  (guardrails.customGuardrailDirectives || []).map((rule, idx) => (
                    <div
                      key={idx}
                      className="flex items-start justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200"
                    >
                      <div className="flex items-start gap-2">
                        <span className="font-mono text-[10px] text-emerald-600 font-bold mt-0.5">#{idx + 1}</span>
                        <span className="leading-relaxed">{rule}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveCustomRule(rule)}
                        className="text-slate-400 hover:text-red-500 transition cursor-pointer p-1"
                        title="Delete directive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Reliability & Hallucination Strictness */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Citation Requirement
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'strict', label: 'Strict Citation Enforcement', desc: 'Must explicitly cite 2nd Brain memory document or search link' },
                    { id: 'when_applicable', label: 'When Applicable (Standard)', desc: 'Cite memory sources when synthesizing ingested knowledge' },
                    { id: 'none', label: 'Unconstrained Conversational', desc: 'Synthesize naturally without footnote citations' }
                  ].map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleUpdate({ citationRequirement: c.id as any, unconstrainedMode: false })}
                      className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        guardrails.citationRequirement === c.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{c.label}</div>
                      <div className="text-[10px] text-slate-400">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Hallucination Handling
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'strict_uncertainty', label: 'Acknowledge Uncertainty ("I do not know")', desc: 'Refuse to invent answers when knowledge is absent or unverified' },
                    { id: 'balanced', label: 'Balanced Extrapolation', desc: 'Use probabilistic reasoning with clear cautionary qualifiers' }
                  ].map(h => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => handleUpdate({ hallucinationStrictness: h.id as any, unconstrainedMode: false })}
                      className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        guardrails.hallucinationStrictness === h.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{h.label}</div>
                      <div className="text-[10px] text-slate-400">{h.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PERSONALITY & DEMEANOR */}
        {activeTab === 'personality' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Custom Bio / Directives */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white">
                Core Persona Directive & Stance
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Define the high-level voice, intellectual background, and identity of your Vantage 2nd Brain.
              </p>
              <textarea
                rows={3}
                value={guardrails.customPersonaDirective || ''}
                onChange={(e) => handleUpdate({ customPersonaDirective: e.target.value, unconstrainedMode: false })}
                placeholder="e.g. Act as an elite Chief of Staff and strategic technologist. Be direct, articulate, insightful, and structure outputs with clean markdown..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs leading-relaxed focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Demeanor & Tone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Conversational Demeanor
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'balanced', label: 'Balanced & Adaptive', desc: 'Calibrated warmth and professional clarity' },
                    { id: 'formal_executive', label: 'Formal Executive', desc: 'Polished, corporate-ready, zero informal colloquialisms' },
                    { id: 'candid_pragmatic', label: 'Candid & Direct', desc: 'Zero pleasantries, unvarnished constructive critique' },
                    { id: 'playful_witty', label: 'Playful & Witty', desc: 'Lighthearted metaphors with clever conceptual banter' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleUpdate({ toneDemeanor: t.id as ToneDemeanor, unconstrainedMode: false })}
                      className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        guardrails.toneDemeanor === t.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-slate-400">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <label className="block text-sm font-bold text-slate-900 dark:text-white">
                  Response Verbosity
                </label>
                <div className="space-y-2">
                  {[
                    { id: 'concise', label: 'High-Density Concise', desc: 'Bullet points, minimal prose, maximum signal' },
                    { id: 'balanced', label: 'Balanced Synthesis', desc: 'Concise executive summaries with optional expanded context' },
                    { id: 'comprehensive', label: 'Deep Exhaustive Breakdown', desc: 'Full multi-dimensional exploration with edge cases' },
                    { id: 'step_by_step', label: 'Socratic Step-by-Step', desc: 'Paced pedagogical breakdown with intermediate check-ins' }
                  ].map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleUpdate({ verbosity: v.id as VerbosityLevel, unconstrainedMode: false })}
                      className={`w-full p-2.5 rounded-xl text-left border transition cursor-pointer ${
                        guardrails.verbosity === v.id
                          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-500 text-blue-700 dark:text-blue-300'
                          : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="text-xs font-bold">{v.label}</div>
                      <div className="text-[10px] text-slate-400">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SCOPE & ACTION BOUNDARIES */}
        {activeTab === 'scope' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            {/* Agent Action Execution Level */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <label className="block text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-500" />
                Permissible Agent Action Boundary
              </label>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Determine whether the 2nd Brain can stage workspace mutations, schedule background cron routines, or remain strictly advisory.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {[
                  {
                    id: 'require_confirmation',
                    label: 'Require Confirmation (Recommended)',
                    desc: 'Prepares draft emails, calendar events, or tasks but requires your explicit click to send or execute.'
                  },
                  {
                    id: 'autonomous',
                    label: 'Autonomous Acceleration',
                    desc: 'Grants permission to automatically queue and run safe multi-step actions without extra confirmation dialogs.'
                  },
                  {
                    id: 'read_only_advisory',
                    label: 'Read-Only Advisory',
                    desc: 'Prevents the AI from drafting or altering workspace items. Generates purely theoretical answers.'
                  }
                ].map(a => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => handleUpdate({ actionExecutionBoundary: a.id as ActionExecutionBoundary, unconstrainedMode: false })}
                    className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                      guardrails.actionExecutionBoundary === a.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold mb-1">{a.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{a.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Permissible Sub-features */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Permissible Capability Whitelist
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { key: 'allowWorkspaceDrafting', label: 'Google Workspace Action Drafting', icon: MessageSquare, desc: 'Draft Gmail emails, Calendar events, and Tasks' },
                  { key: 'allowCodeGeneration', label: 'Production Code Generation', icon: Code, desc: 'Provide executable scripts, algorithms, and architectural snippets' },
                  { key: 'allowWebSearchGrounding', label: 'Live Google Search Grounding', icon: Globe, desc: 'Permit queries to fetch live web results when facts are needed' },
                  { key: 'allowDocumentIngestion', label: 'File & Web Ingestion', icon: FileText, desc: 'Permit scraping URLs and ingesting uploaded files to memory' },
                  { key: 'allowScheduledCronAgents', label: 'Scheduled Cron Workflows', icon: Zap, desc: 'Permit autonomous background recurring agent triggers' }
                ].map(f => {
                  const Icon = f.icon;
                  const enabled = (guardrails.permissibleFeatures as any)?.[f.key] ?? true;
                  return (
                    <label
                      key={f.key}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleUpdate({
                          permissibleFeatures: {
                            ...(guardrails.permissibleFeatures || {}),
                            [f.key]: e.target.checked
                          } as any,
                          unconstrainedMode: false
                        })}
                        className="mt-1 accent-indigo-600 rounded-sm"
                      />
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <Icon className="w-3.5 h-3.5 text-indigo-500" />
                          {f.label}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{f.desc}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: LIVE PROMPT INSPECTOR */}
        {activeTab === 'preview' && (
          <div className="space-y-4 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="w-4 h-4 text-blue-500" />
                    Live Compiled 2nd Brain Guardrail Prompt
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    This exact system block is injected into Gemini reasoning calls to enforce your boundaries or grant unconstrained freedom.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border border-blue-200 dark:border-blue-900/60"
                >
                  {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedPrompt ? 'Copied' : 'Copy Block'}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-[11px] rounded-xl overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre-wrap max-h-[500px]">
                {compiledPrompt}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
