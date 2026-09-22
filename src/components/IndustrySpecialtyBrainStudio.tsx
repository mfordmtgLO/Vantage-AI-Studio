import React, { useState, useMemo, useEffect } from 'react';
import { 
  Package, Shield, Key, Download, Copy, Check, Sparkles, Building2, 
  Layers, Code, ArrowRight, CheckCircle2, Clock, Globe, Lock, Trash2,
  Calendar, FileText, AlertCircle, RefreshCw, Smartphone, QrCode,
  DollarSign, Briefcase, ChevronRight, Plus, ExternalLink, Sliders,
  Share2, MessageSquare, Mail, Terminal, Search, Filter, Eye, Cpu,
  Flame, TrendingUp, BookOpen, Brain, Play, CheckSquare, ShieldCheck
} from 'lucide-react';
import { 
  isMikeFordAdmin, 
  ADMIN_PRIMARY_EMAIL, 
  ADMIN_PRIMARY_NAME,
  SpecialtyBrainPackage,
  SpecialtyBrainPricingMatrix,
  DEFAULT_PRICING_MATRIX,
  PeriodicIngestRecord,
  getSavedSpecialtyBrainPackages,
  saveSpecialtyBrainPackage,
  deleteSpecialtyBrainPackage,
  generateSpecialtyBrainSalesPitch,
  generateAntiTheftDomainWrapper,
  generateDistributionWatermarkHeader
} from '../utils/adminAuth';
import { 
  getAllIndustryGroups, 
  IndustryGroup, 
  IndustryCareerTemplate,
  saveCustomIndustryGroup,
  saveCustomCareerTemplate
} from '../data/industryCareerTemplates';
import { auth } from '../services/firebase';

interface IndustrySpecialtyBrainStudioProps {
  onApplyTemplateToLiveSession?: (template: IndustryCareerTemplate) => void;
  onOpenDesktopView?: () => void;
}

export const IndustrySpecialtyBrainStudio: React.FC<IndustrySpecialtyBrainStudioProps> = ({
  onApplyTemplateToLiveSession,
  onOpenDesktopView
}) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'builder' | 'continuous_learning' | 'sales_engine' | 'pricing_matrices' | 'qr_marketing'>('inventory');
  const [packages, setPackages] = useState<SpecialtyBrainPackage[]>(() => getSavedSpecialtyBrainPackages());
  const [industryGroups, setIndustryGroups] = useState<IndustryGroup[]>(() => getAllIndustryGroups());
  
  // Selected package for details/actions
  const [selectedPkgId, setSelectedPkgId] = useState<string>(() => packages[0]?.id || 'pkg_mlo_real_estate');
  const selectedPackage = useMemo(() => packages.find(p => p.id === selectedPkgId) || packages[0], [packages, selectedPkgId]);

  // Builder Form State
  const [builderIndustryId, setBuilderIndustryId] = useState<string>(industryGroups[0]?.id || 'mortgage_real_estate');
  const [builderCareerId, setBuilderCareerId] = useState<string>(industryGroups[0]?.careers[0]?.id || 'mlo_loan_officer');
  const [builderTitle, setBuilderTitle] = useState<string>('Custom Specialty 2nd Brain Pro v2.5');
  const [builderSummary, setBuilderSummary] = useState<string>('');
  const [builderPersonaTitle, setBuilderPersonaTitle] = useState<string>('');
  const [builderDirective, setBuilderDirective] = useState<string>('');
  const [builderTrainingRules, setBuilderTrainingRules] = useState<string>('');
  const [builderCustomGuardrails, setBuilderCustomGuardrails] = useState<string>('');
  const [builderDomainKnowledge, setBuilderDomainKnowledge] = useState<string>('');
  const [isCreatingNewIndustry, setIsCreatingNewIndustry] = useState<boolean>(false);
  const [newIndustryName, setNewIndustryName] = useState<string>('');
  const [newCareerTitle, setNewCareerTitle] = useState<string>('');
  
  // Export & Code Modal State
  const [exportModalType, setExportModalType] = useState<'all' | 'prompt' | 'react' | 'hook' | 'router' | 'json' | 'obfuscated' | null>(null);
  const [clientDomainLock, setClientDomainLock] = useState<string>('clientportal.com');
  const [clientName, setClientName] = useState<string>('Enterprise Client Alpha');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ingestion update form state
  const [newIngestVersion, setNewIngestVersion] = useState<string>('v2.6.0');
  const [newIngestSources, setNewIngestSources] = useState<string>('');
  const [newIngestSkillGains, setNewIngestSkillGains] = useState<string>('');

  // QR Code base URL state
  const [qrBaseUrlType, setQrBaseUrlType] = useState<'shared' | 'dev' | 'custom'>('shared');
  const [customQrUrl, setCustomQrUrl] = useState<string>('');

  const activeUser = auth.currentUser;
  const isAdmin = isMikeFordAdmin(activeUser);

  const sharedAppUrl = 'https://ais-pre-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app';
  const devAppUrl = 'https://ais-dev-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app';
  const effectiveBaseUrl = qrBaseUrlType === 'shared' ? sharedAppUrl : qrBaseUrlType === 'dev' ? devAppUrl : (customQrUrl || sharedAppUrl);

  const activeLiveDemoUrl = `${effectiveBaseUrl}/?tab=second_brain&specialty=${selectedPackage?.careerId || 'mlo_loan_officer'}&industry=${selectedPackage?.industryId || 'mortgage_real_estate'}&leadMode=true`;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Populate Builder when changing selections
  useEffect(() => {
    const group = industryGroups.find(g => g.id === builderIndustryId);
    if (!group) return;
    const career = group.careers.find(c => c.id === builderCareerId) || group.careers[0];
    if (career) {
      setBuilderTitle(`${career.careerTitle} 2nd Brain Pro v2.5`);
      setBuilderSummary(career.summary);
      setBuilderPersonaTitle(career.morphedPersonaTitle);
      setBuilderDirective(career.morphedPersonaDirective);
      setBuilderTrainingRules((career.sampleTrainingRules || []).join(', '));
      setBuilderCustomGuardrails((career.customGuardrailDirectives || []).join('\n'));
      setBuilderDomainKnowledge((career.domainKnowledgeSeeds || []).map(s => `[${s.title}]\n${s.content}`).join('\n\n'));
    }
  }, [builderIndustryId, builderCareerId, industryGroups]);

  // Handle Save New Specialty 2nd Brain Package
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!builderTitle.trim()) return;

    let finalIndustryId = builderIndustryId;
    let finalIndustryName = industryGroups.find(g => g.id === builderIndustryId)?.name || 'Custom Industry';
    let finalCareerId = builderCareerId;
    let finalCareerTitle = industryGroups.find(g => g.id === builderIndustryId)?.careers.find(c => c.id === builderCareerId)?.careerTitle || 'Specialist';

    // If adding a brand new industry or career persona
    if (isCreatingNewIndustry) {
      if (!newIndustryName.trim() || !newCareerTitle.trim()) {
        showToast('Please enter both New Industry and New Career title.');
        return;
      }
      finalIndustryId = newIndustryName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      finalIndustryName = newIndustryName.trim();
      finalCareerId = newCareerTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
      finalCareerTitle = newCareerTitle.trim();

      const newTemplate: IndustryCareerTemplate = {
        id: finalCareerId,
        industryId: finalIndustryId,
        industryName: finalIndustryName,
        industryIcon: 'Briefcase',
        careerId: finalCareerId,
        careerTitle: finalCareerTitle,
        summary: builderSummary.trim() || `Specialized AI cognitive copilot for ${finalCareerTitle}.`,
        morphedPersonaTitle: builderPersonaTitle.trim() || `Master ${finalCareerTitle}`,
        morphedPersonaDirective: builderDirective.trim() || `You are an elite ${finalCareerTitle}.`,
        toneDemeanor: 'formal_executive',
        personalityPreset: 'executive',
        verbosity: 'balanced',
        actionExecutionBoundary: 'require_confirmation',
        domainKnowledgeSeeds: [
          {
            title: `${finalCareerTitle} Core Workflow Protocols`,
            content: builderDomainKnowledge.trim() || 'Master protocols and industry frameworks.',
            category: 'knowledge',
            tags: [finalIndustryId, finalCareerId]
          }
        ],
        customGuardrailDirectives: builderCustomGuardrails.split('\n').filter(Boolean),
        suggestedPromptQuestions: [
          `What are the top 3 priorities for a ${finalCareerTitle} today?`,
          `Analyze our current workflow compliance in ${finalIndustryName}.`
        ],
        sampleTrainingRules: builderTrainingRules.split(',').map(r => r.trim()).filter(Boolean)
      };

      saveCustomCareerTemplate(finalIndustryId, newTemplate);
      setIndustryGroups(getAllIndustryGroups());
    }

    const rulesArray = builderTrainingRules.split(',').map(r => r.trim()).filter(Boolean);
    const guardrailsArray = builderCustomGuardrails.split('\n').map(g => g.trim()).filter(Boolean);

    const newPkg: SpecialtyBrainPackage = {
      id: `pkg_${finalCareerId}_${Date.now()}`,
      title: builderTitle.trim(),
      industryId: finalIndustryId,
      industryName: finalIndustryName,
      careerId: finalCareerId,
      careerTitle: finalCareerTitle,
      version: 'v2.5.0',
      createdAt: new Date().toISOString(),
      lastTrainedAt: new Date().toISOString(),
      status: 'active',
      summary: builderSummary.trim(),
      personaTitle: builderPersonaTitle.trim(),
      personaDirective: builderDirective.trim(),
      toneDemeanor: 'formal_executive',
      personalityPreset: 'executive',
      pricing: DEFAULT_PRICING_MATRIX,
      trainingRules: rulesArray,
      knowledgeSeeds: [
        {
          title: `${finalCareerTitle} Master Domain Framework`,
          content: builderDomainKnowledge.trim(),
          category: 'knowledge',
          tags: [finalIndustryId, finalCareerId]
        }
      ],
      customGuardrails: guardrailsArray,
      periodicIngestRoadmap: [
        {
          id: `ing_${Date.now()}`,
          version: 'v2.5.0',
          releaseDate: new Date().toISOString().split('T')[0],
          focusSources: `Initial ${finalIndustryName} Core Knowledge Ingestion & Training Rules`,
          cognitiveSkillGains: `Initial cognitive base calibrated with ${rulesArray.length} domain rules`,
          status: 'active'
        }
      ],
      salesPitch: generateSpecialtyBrainSalesPitch(finalIndustryName, finalCareerTitle)
    };

    saveSpecialtyBrainPackage(newPkg);
    const updated = getSavedSpecialtyBrainPackages();
    setPackages(updated);
    setSelectedPkgId(newPkg.id);
    setIsCreatingNewIndustry(false);
    setNewIndustryName('');
    setNewCareerTitle('');
    setActiveTab('inventory');
    showToast(`Successfully packaged and saved "${newPkg.title}" into Specialty Brain Inventory!`);
  };

  // Add Periodic "Train the Brain" Ingestion Update to the Selected Package
  const handleAddIngestUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage || !newIngestSources.trim() || !newIngestSkillGains.trim()) return;

    const newRecord: PeriodicIngestRecord = {
      id: `ing_${Date.now()}`,
      version: newIngestVersion.trim() || 'v2.6.0',
      releaseDate: new Date().toISOString().split('T')[0],
      focusSources: newIngestSources.trim(),
      cognitiveSkillGains: newIngestSkillGains.trim(),
      status: 'active'
    };

    const updatedRoadmap = [newRecord, ...(selectedPackage.periodicIngestRoadmap || [])];
    const updatedPackage: SpecialtyBrainPackage = {
      ...selectedPackage,
      version: newIngestVersion.trim() || selectedPackage.version,
      lastTrainedAt: new Date().toISOString(),
      periodicIngestRoadmap: updatedRoadmap
    };

    saveSpecialtyBrainPackage(updatedPackage);
    setPackages(getSavedSpecialtyBrainPackages());
    setNewIngestSources('');
    setNewIngestSkillGains('');
    showToast(`Added Periodic Learning Ingestion Update ${newRecord.version} to ${selectedPackage.title}!`);
  };

  const handleDeletePackage = (id: string) => {
    if (confirm('Are you sure you want to delete this specialty 2nd brain package from inventory?')) {
      deleteSpecialtyBrainPackage(id);
      const remaining = getSavedSpecialtyBrainPackages();
      setPackages(remaining);
      if (selectedPkgId === id && remaining.length > 0) {
        setSelectedPkgId(remaining[0].id);
      }
      showToast('Specialty 2nd Brain package removed.');
    }
  };

  // Generated Artifacts for Selected Package
  const generatedPrompt = useMemo(() => {
    if (!selectedPackage) return '';
    const watermark = generateDistributionWatermarkHeader(clientName, clientDomainLock, `VAN-BRN-${selectedPackage.careerId.toUpperCase()}-2026`, selectedPackage.title);
    return `${watermark}
# 🧠 ${selectedPackage.title}
**Domain**: ${selectedPackage.industryName} | **Specialty Role**: ${selectedPackage.careerTitle}
**Version**: ${selectedPackage.version} | **Architect**: ${ADMIN_PRIMARY_NAME} (${ADMIN_PRIMARY_EMAIL})

## SYSTEM DIRECTIVE & PERSONA
${selectedPackage.personaDirective}

## DOMAIN KNOWLEDGE BASES & REASONING RULES (${selectedPackage.trainingRules.length} Active Rules)
${selectedPackage.trainingRules.map((r, i) => `${i + 1}. ${r}`).join('\n')}

## GUARDRAIL DIRECTIVES & EXECUTION BOUNDARIES
${(selectedPackage.customGuardrails || []).map((g, i) => `- [GUARDRAIL ${i + 1}]: ${g}`).join('\n')}

## CONTINUOUS LEARNING AGGREGATION & INGESTION ROADMAP
${(selectedPackage.periodicIngestRoadmap || []).map(r => `• ${r.version} (${r.releaseDate}): ${r.focusSources} -> ${r.cognitiveSkillGains}`).join('\n')}
`;
  }, [selectedPackage, clientName, clientDomainLock]);

  const generatedReactWidget = useMemo(() => {
    if (!selectedPackage) return '';
    const watermark = generateDistributionWatermarkHeader(clientName, clientDomainLock, `VAN-BRN-${selectedPackage.careerId.toUpperCase()}-2026`, selectedPackage.title);
    const antiTheft = generateAntiTheftDomainWrapper(clientName, clientDomainLock, `VAN-BRN-${selectedPackage.careerId.toUpperCase()}-2026`, selectedPackage.title);
    return `${watermark}
${antiTheft}

import React, { useState } from 'react';
import { Brain, Sparkles, Send, Shield, CheckCircle2 } from 'lucide-react';

export interface SpecialtyBrainWidgetProps {
  apiKey?: string;
  theme?: 'dark' | 'light';
}

export const ${selectedPackage.careerId.replace(/(^|_)([a-z])/g, (_, a, b) => b.toUpperCase())}SecondBrainWidget: React.FC<SpecialtyBrainWidgetProps> = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleAskBrain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setIsThinking(true);
    // Dispatches to Vantage Specialty Reasoning Endpoint
    setTimeout(() => {
      setResponse(\`[${selectedPackage.personaTitle}]: Processed with ${selectedPackage.trainingRules.length} domain rules. Response formulated for ${selectedPackage.careerTitle}.\`);
      setIsThinking(false);
    }, 1200);
  };

  return (
    <div className="w-full max-w-2xl bg-slate-900 text-slate-100 rounded-3xl p-6 border border-slate-800 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">${selectedPackage.title}</h3>
            <p className="text-[11px] text-purple-300">${selectedPackage.industryName}</p>
          </div>
        </div>
        <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-full border border-purple-400/30">
          ${selectedPackage.version} Continuous
        </span>
      </div>

      <div className="min-h-[140px] bg-slate-950 p-4 rounded-2xl border border-slate-800/80 mb-4 text-xs leading-relaxed text-slate-300">
        {response || 'Ask a specialized ${selectedPackage.careerTitle} workflow question or provide new data...'}
      </div>

      <form onSubmit={handleAskBrain} className="flex gap-2">
        <input 
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask ${selectedPackage.careerTitle} 2nd Brain..."
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-purple-500"
        />
        <button 
          type="submit" 
          disabled={isThinking}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          {isThinking ? 'Reasoning...' : <><Send className="w-3.5 h-3.5" /> Ask</>}
        </button>
      </form>
    </div>
  );
};
`;
  }, [selectedPackage, clientName, clientDomainLock]);

  const handleDownloadSingle = (filename: string, content: string, mime: string = 'text/plain') => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}!`);
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 p-6 md:p-8 rounded-3xl text-white flex flex-col lg:flex-row lg:items-center justify-between gap-6 border border-purple-900/40 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-purple-500/30 text-purple-200 font-black text-[10px] uppercase tracking-wider border border-purple-400/30 flex items-center gap-1.5">
              <Brain className="w-3.5 h-3.5 text-purple-300" /> Commercial Specialty 2nd Brain Hub
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-200 text-[10px] font-bold border border-indigo-400/30">
              Continuous Learning Persistence
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Architect: <strong>{ADMIN_PRIMARY_NAME}</strong> ({ADMIN_PRIMARY_EMAIL})
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            Industry + Career Specialty 2nd Brain Studio
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Tailor, train, and package out-of-the-box dialed-in 2nd Brain plugins for target industries and career roles. Sold with periodic <strong>"Train the Brain"</strong> aggregated source learning ingestion so the brain's knowledge base expands over time—developing new AI skills and tasks as your clients' businesses grow.
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[100px]">
            <span className="block text-2xl font-black text-purple-300">{packages.length}</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Packages</span>
          </div>
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[100px]">
            <span className="block text-2xl font-black text-indigo-300">{industryGroups.length}+</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Industries</span>
          </div>
          <div className="p-3.5 bg-white/10 rounded-2xl border border-white/15 text-center min-w-[100px]">
            <span className="block text-2xl font-black text-emerald-300">Active</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold tracking-wider">Learning Ingest</span>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Studio Navigation Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto scrollbar-none text-xs font-bold">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'inventory' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Package className="w-4 h-4" /> Specialty Brain Inventory ({packages.length})
        </button>

        <button
          onClick={() => setActiveTab('builder')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'builder' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Sparkles className="w-4 h-4" /> Build & Train Specialty Brain
        </button>

        <button
          onClick={() => setActiveTab('continuous_learning')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'continuous_learning' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <RefreshCw className="w-4 h-4" /> "Train the Brain" Ingestion Feeds
        </button>

        <button
          onClick={() => setActiveTab('sales_engine')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'sales_engine' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <Briefcase className="w-4 h-4" /> Sales Decks & Ad Campaigns
        </button>

        <button
          onClick={() => setActiveTab('pricing_matrices')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'pricing_matrices' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <DollarSign className="w-4 h-4" /> Solo & Enterprise Pricing
        </button>

        <button
          onClick={() => setActiveTab('qr_marketing')}
          className={`px-4 py-2.5 rounded-xl transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
            activeTab === 'qr_marketing' 
              ? 'bg-purple-600 text-white shadow-sm' 
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
          }`}
        >
          <QrCode className="w-4 h-4" /> QR Codes & Mobile Demos
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVENTORY & CATALOG OF PRE-TRAINED SPECIALTY BRAINS               */}
      {/* ========================================================================= */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List of Specialty Brains */}
          <div className="lg:col-span-1 space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Packaged Specialty Brains
              </h3>
              <button
                onClick={() => setActiveTab('builder')}
                className="text-xs text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Build New
              </button>
            </div>

            <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
              {packages.map((pkg) => {
                const isSelected = pkg.id === selectedPkgId;
                return (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPkgId(pkg.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 shadow-sm'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                            {pkg.careerTitle}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold">
                            {pkg.version}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                          {pkg.industryName}
                        </p>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                        ${pkg.pricing.solo.monthly}/mo
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{pkg.trainingRules.length} Dialed Rules</span>
                      <span>{(pkg.periodicIngestRoadmap || []).length} Ingest Updates</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Package Details & Export Hub */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            {selectedPackage ? (
              <>
                {/* Header & Meta */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {selectedPackage.title}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-bold">
                        {selectedPackage.version} Continuous
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                      Sector: {selectedPackage.industryName} • Position: {selectedPackage.careerTitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const template = industryGroups.flatMap(g => g.careers).find(c => c.id === selectedPackage.careerId);
                        if (template && onApplyTemplateToLiveSession) {
                          onApplyTemplateToLiveSession(template);
                          showToast(`Activated ${selectedPackage.careerTitle} persona into live session!`);
                        }
                      }}
                      className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Morph Live Session
                    </button>

                    <button
                      onClick={() => handleDeletePackage(selectedPackage.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition cursor-pointer"
                      title="Delete Package"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Domain Locking & Client Watermark Configuration */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Client Anti-Theft Domain Lock & License Security
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      Mike Ford Ownership Certified
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Licensed Client / Company
                      </label>
                      <input
                        type="text"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Authorized Domain Lock
                      </label>
                      <input
                        type="text"
                        value={clientDomainLock}
                        onChange={(e) => setClientDomainLock(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Export Format Action Grid */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Instant Code, Prompt & Package Distribution Exports
                  </h3>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => handleDownloadSingle(`${selectedPackage.careerId}-system-prompt.md`, generatedPrompt, 'text/markdown')}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-2xl text-left transition flex flex-col justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <FileText className="w-5 h-5 text-purple-600 group-hover:scale-110 transition" />
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">LLM Prompt Spec</div>
                        <div className="text-[10px] text-slate-500">Claude, GPT-4, DeepSeek .md</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDownloadSingle(`${selectedPackage.careerId}SecondBrain.tsx`, generatedReactWidget, 'text/typescript')}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-2xl text-left transition flex flex-col justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <Code className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition" />
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">React Widget .tsx</div>
                        <div className="text-[10px] text-slate-500">Self-contained UI component</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const pkgJson = JSON.stringify(selectedPackage, null, 2);
                        handleDownloadSingle(`vantage-specialty-brain-${selectedPackage.careerId}.json`, pkgJson, 'application/json');
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-2xl text-left transition flex flex-col justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <Layers className="w-5 h-5 text-blue-600 group-hover:scale-110 transition" />
                        <Download className="w-3.5 h-3.5 text-slate-400" />
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Complete JSON Package</div>
                        <div className="text-[10px] text-slate-500">Full schema & metadata</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCopy(generatedPrompt, 'copy_prompt')}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-2xl text-left transition flex flex-col justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <Copy className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
                        <span className="text-[10px] font-bold text-emerald-600">{copiedKey === 'copy_prompt' ? 'Copied!' : '1-Click'}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Copy Full Prompt</div>
                        <div className="text-[10px] text-slate-500">Paste directly into AI chat</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleCopy(generatedReactWidget, 'copy_react')}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-2xl text-left transition flex flex-col justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <Terminal className="w-5 h-5 text-amber-600 group-hover:scale-110 transition" />
                        <span className="text-[10px] font-bold text-amber-600">{copiedKey === 'copy_react' ? 'Copied!' : '1-Click'}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Copy React TSX</div>
                        <div className="text-[10px] text-slate-500">Embed in client web portal</div>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        const wrapper = generateAntiTheftDomainWrapper(clientName, clientDomainLock, `VAN-BRN-${selectedPackage.careerId.toUpperCase()}-2026`, selectedPackage.title);
                        handleCopy(wrapper, 'copy_wrapper');
                      }}
                      className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200 dark:border-slate-700 hover:border-purple-400 rounded-2xl text-left transition flex flex-col justify-between gap-2 cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <Lock className="w-5 h-5 text-rose-600 group-hover:scale-110 transition" />
                        <span className="text-[10px] font-bold text-rose-600">{copiedKey === 'copy_wrapper' ? 'Copied!' : 'Lock'}</span>
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Domain Lock Script</div>
                        <div className="text-[10px] text-slate-500">AST runtime security check</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Dialed Training Rules & Cognitive Seeds Preview */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Dialed-In Domain Training Rules ({selectedPackage.trainingRules.length})
                    </h3>
                    <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold">
                      Out of the Box Pre-Trained
                    </span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 max-h-[160px] overflow-y-auto">
                    {selectedPackage.trainingRules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <Check className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-slate-400 text-xs">
                Select a specialty 2nd brain package or build a new one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BUILD & TRAIN NEW SPECIALTY BRAIN (EXPAND BEYOND 10 INDUSTRIES)   */}
      {/* ========================================================================= */}
      {activeTab === 'builder' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Build & Calibrate Industry + Career Specialty 2nd Brain
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Engineer custom domain knowledge seeds, guardrails, and rapid training rules for any profession.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsCreatingNewIndustry(!isCreatingNewIndustry)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                isCreatingNewIndustry
                  ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              {isCreatingNewIndustry ? 'Cancel New Industry' : 'Expand New Industry'}
            </button>
          </div>

          <form onSubmit={handleSavePackage} className="space-y-5">
            {/* Industry and Career Pickers or New Industry Inputs */}
            {!isCreatingNewIndustry ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Target Industry Group
                  </label>
                  <select
                    value={builderIndustryId}
                    onChange={(e) => {
                      setBuilderIndustryId(e.target.value);
                      const group = industryGroups.find(g => g.id === e.target.value);
                      if (group && group.careers.length > 0) {
                        setBuilderCareerId(group.careers[0].id);
                      }
                    }}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    {industryGroups.map((group) => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Select Specific Career Role
                  </label>
                  <select
                    value={builderCareerId}
                    onChange={(e) => setBuilderCareerId(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    {(industryGroups.find(g => g.id === builderIndustryId)?.careers || []).map((career) => (
                      <option key={career.id} value={career.id}>
                        {career.careerTitle}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
                <div>
                  <label className="block text-xs font-bold text-purple-900 dark:text-purple-200 mb-1">
                    New Industry Category Name
                  </label>
                  <input
                    type="text"
                    value={newIndustryName}
                    onChange={(e) => setNewIndustryName(e.target.value)}
                    placeholder="e.g. Aviation, Aerospace & Defense Logistics"
                    className="w-full text-xs p-3 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-purple-900 dark:text-purple-200 mb-1">
                    New Career Persona Title
                  </label>
                  <input
                    type="text"
                    value={newCareerTitle}
                    onChange={(e) => setNewCareerTitle(e.target.value)}
                    placeholder="e.g. Chief Flight Operations Officer"
                    className="w-full text-xs p-3 rounded-xl border border-purple-300 dark:border-purple-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>
            )}

            {/* Package Title & Persona Directive */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Product Package Title
                </label>
                <input
                  type="text"
                  value={builderTitle}
                  onChange={(e) => setBuilderTitle(e.target.value)}
                  placeholder="e.g. Aviation Logistics 2nd Brain Pro v2.5"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Morphed Persona Title
                </label>
                <input
                  type="text"
                  value={builderPersonaTitle}
                  onChange={(e) => setBuilderPersonaTitle(e.target.value)}
                  placeholder="e.g. Senior Aerospace Logistics Director"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cognitive Persona Directive (Core System Prompt)
              </label>
              <textarea
                value={builderDirective}
                onChange={(e) => setBuilderDirective(e.target.value)}
                rows={3}
                placeholder="Explain the persona's role, behavioral boundaries, and analytical methodology..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Rapid Comma-Separated Training Rules (Ingested Out of the Box)
                </label>
                <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">
                  Separate each rule with a comma
                </span>
              </div>
              <textarea
                value={builderTrainingRules}
                onChange={(e) => setBuilderTrainingRules(e.target.value)}
                rows={3}
                placeholder="Rule 1, Rule 2, Rule 3..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-mono"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Industry Guardrails (One per line)
                </label>
                <textarea
                  value={builderCustomGuardrails}
                  onChange={(e) => setBuilderCustomGuardrails(e.target.value)}
                  rows={3}
                  placeholder="Enforce FAA compliance regulations&#10;Never approve flight routes without weather check"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Domain Knowledge Seeds
                </label>
                <textarea
                  value={builderDomainKnowledge}
                  onChange={(e) => setBuilderDomainKnowledge(e.target.value)}
                  rows={3}
                  placeholder="[Title] Knowledge reference details..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none text-[11px]"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Package className="w-4 h-4" />
                <span>Save to Specialty 2nd Brain Inventory & Generate Commercial Artifacts</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: PERIODIC "TRAIN THE BRAIN" INGESTION ROADMAP & PERSISTENCE          */}
      {/* ========================================================================= */}
      {activeTab === 'continuous_learning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Roadmap Details */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  Continuous "Train the Brain" Persistence Ingestion Pipeline
                </h2>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tracking periodic source updates for: <strong>{selectedPackage?.title}</strong>. As data sources are ingested by the dev team, the brain develops expanded skills and automated task execution.
              </p>
            </div>

            {/* Timeline of Ingestion Releases */}
            <div className="space-y-3">
              {(selectedPackage?.periodicIngestRoadmap || []).map((record, index) => (
                <div
                  key={record.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-bold text-xs">
                        {record.version}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {record.releaseDate}
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                      record.status === 'active' 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : record.status === 'completed'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                    }`}>
                      {record.status}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Aggregated Sources: <span className="font-normal text-slate-600 dark:text-slate-300">{record.focusSources}</span>
                  </div>

                  <div className="text-xs text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 p-2.5 rounded-xl border border-purple-200 dark:border-purple-800 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span><strong>Cognitive Skill Gain:</strong> {record.cognitiveSkillGains}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue New Periodic Training Ingestion Release */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-purple-600" />
              Dispatch New Periodic Ingestion Release
            </h3>
            <p className="text-xs text-slate-500">
              Log new industry guidelines, regulatory changes, or task playbooks into this specialty brain package.
            </p>

            <form onSubmit={handleAddIngestUpdate} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Release Version Tag
                </label>
                <input
                  type="text"
                  value={newIngestVersion}
                  onChange={(e) => setNewIngestVersion(e.target.value)}
                  placeholder="v2.6.0"
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aggregated Ingestion Sources & Data
                </label>
                <textarea
                  value={newIngestSources}
                  onChange={(e) => setNewIngestSources(e.target.value)}
                  rows={3}
                  placeholder="e.g. Q4 Federal Regulatory Updates & 2026 Conforming Limit Shifts..."
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Resulting AI Skills & Task Capabilities
                </label>
                <textarea
                  value={newIngestSkillGains}
                  onChange={(e) => setNewIngestSkillGains(e.target.value)}
                  rows={3}
                  placeholder="e.g. Automated debt-to-income stress testing and rate renegotiation macro..."
                  required
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Deploy Ingestion Update</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SALES DECKS, EXECUTIVE PROPOSALS & AD CAMPAIGNS                     */}
      {/* ========================================================================= */}
      {activeTab === 'sales_engine' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-purple-600" />
                  Tailored Sales Pitch Deck & Executive Proposal Generator
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Pre-generated contracts, C-Suite proposals, and social ad campaigns for <strong>{selectedPackage?.careerTitle}</strong> ({selectedPackage?.industryName}).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(selectedPackage?.salesPitch.executiveProposal || '', 'copy_proposal')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'copy_proposal' ? '✓ Copied Proposal' : 'Copy Executive Proposal'}</span>
                </button>
              </div>
            </div>

            {/* Proposal Markdown Preview */}
            <div className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 max-h-[380px] overflow-y-auto">
              <pre className="text-xs text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {selectedPackage?.salesPitch.executiveProposal}
              </pre>
            </div>

            {/* Social Ad Campaign Copy & Hooks Grid */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Advertising Angles & Executive Outreach Hooks
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Facebook Ads */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Facebook / Instagram Ads Angle</span>
                    <button 
                      onClick={() => handleCopy(selectedPackage?.salesPitch.socialAdHooks.facebook || '', 'fb_ad')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedKey === 'fb_ad' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedPackage?.salesPitch.socialAdHooks.facebook}
                  </p>
                </div>

                {/* Google Search Ads */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Google Search Ads Headline</span>
                    <button 
                      onClick={() => handleCopy(selectedPackage?.salesPitch.socialAdHooks.googleAds || '', 'google_ad')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedKey === 'google_ad' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-semibold">
                    {selectedPackage?.salesPitch.socialAdHooks.googleAds}
                  </p>
                </div>

                {/* LinkedIn B2B Direct Message */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">LinkedIn B2B Outreach</span>
                    <button 
                      onClick={() => handleCopy(selectedPackage?.salesPitch.socialAdHooks.linkedinB2B || '', 'li_ad')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedKey === 'li_ad' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {selectedPackage?.salesPitch.socialAdHooks.linkedinB2B}
                  </p>
                </div>

                {/* Cold Executive Email */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-600 dark:text-purple-400">C-Suite Cold Email Template</span>
                    <button 
                      onClick={() => handleCopy(selectedPackage?.salesPitch.socialAdHooks.coldEmail || '', 'email_ad')}
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                    >
                      {copiedKey === 'email_ad' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-wrap max-h-[100px] overflow-y-auto">
                    {selectedPackage?.salesPitch.socialAdHooks.coldEmail}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: SOLO & ENTERPRISE PRICING MATRICES                                  */}
      {/* ========================================================================= */}
      {activeTab === 'pricing_matrices' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solo / Individual Career Pro Matrix */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="px-2.5 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                    Individual Career Professional
                  </span>
                  <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                    Solo Career 2nd Brain Pro
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Monthly Pro Subscription</div>
                    <div className="text-[11px] text-slate-500">Includes live model reasoning & continuous learning</div>
                  </div>
                  <span className="text-lg font-black text-blue-600">${selectedPackage?.pricing.solo.monthly} <span className="text-xs font-normal text-slate-400">/mo</span></span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Annual Saver (Best Value)</div>
                    <div className="text-[11px] text-slate-500">2 Months Free + priority model routing</div>
                  </div>
                  <span className="text-lg font-black text-emerald-600">${selectedPackage?.pricing.solo.annual} <span className="text-xs font-normal text-slate-400">/yr</span></span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Lifetime Solo License</div>
                    <div className="text-[11px] text-slate-500">Perpetual standalone license + prompt exports</div>
                  </div>
                  <span className="text-lg font-black text-purple-600">${selectedPackage?.pricing.solo.lifetime} <span className="text-xs font-normal text-slate-400">one-time</span></span>
                </div>
              </div>
            </div>

            {/* Enterprise Multi-Seat Tier & Services Matrix */}
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-purple-500/30 dark:border-purple-500/40 shadow-sm space-y-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-bl-2xl">
                Enterprise Turnkey
              </div>

              <div>
                <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  B2B Corporate & Agency
                </span>
                <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">
                  Enterprise Specialty 2nd Brain Solution
                </h3>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-purple-950 dark:text-purple-100">Multi-Seat Base License (10 Seats)</div>
                    <div className="text-[11px] text-purple-700 dark:text-purple-300">Domain-locked runtime execution & AST security</div>
                  </div>
                  <span className="text-base font-black text-purple-700 dark:text-purple-300">${selectedPackage?.pricing.enterprise.baseLicense.toLocaleString()}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">One-Time Customization & Install Flat Fee</div>
                    <div className="text-[11px] text-slate-500">Domain lock, white-glove webhook configuration</div>
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100">${selectedPackage?.pricing.enterprise.customizationInstallFee.toLocaleString()}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Series of Teams Training Video Calls</div>
                    <div className="text-[11px] text-slate-500">3 Live sessions with Mike Ford & engineering team</div>
                  </div>
                  <span className="text-base font-black text-slate-900 dark:text-slate-100">${selectedPackage?.pricing.enterprise.teamsTrainingCallsFlatFee.toLocaleString()}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Bi-Annual "Train the Brain" Ingestion Upgrade</div>
                    <div className="text-[11px] text-slate-500">Continuous aggregated industry knowledge updates</div>
                  </div>
                  <span className="text-base font-black text-emerald-600">${selectedPackage?.pricing.enterprise.biAnnualTrainBrainUpgradeFee.toLocaleString()} <span className="text-xs font-normal text-slate-400">/yr</span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: QR CODES & MOBILE SHARING SUITE FOR MARKETING                       */}
      {/* ========================================================================= */}
      {activeTab === 'qr_marketing' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <QrCode className="w-5 h-5 text-purple-600" />
              Marketing QR Code & Mobile "Add to Home Screen" Share Suite
            </h2>
            <p className="text-xs text-slate-500">
              Generate camera-scannable QR codes and live demo links for: <strong>{selectedPackage?.title}</strong>.
            </p>
          </div>

          {/* Environment Domain Selector */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300">
              <Globe className="w-4 h-4 text-purple-600" />
              <span>Target Base URL for QR Codes:</span>
            </div>
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setQrBaseUrlType('shared')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  qrBaseUrlType === 'shared' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Shared App (Production)
              </button>
              <button
                onClick={() => setQrBaseUrlType('dev')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                  qrBaseUrlType === 'dev' ? 'bg-purple-600 text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Dev App
              </button>
            </div>
          </div>

          {/* QR Code and Live Links Display */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-6">
            <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(activeLiveDemoUrl)}&margin=6`}
                alt="QR Code for Specialty 2nd Brain"
                className="w-40 h-40 rounded-xl bg-white p-1"
              />
              <p className="text-[10px] text-slate-400 mt-2 font-medium text-center">
                Scan with camera to install PWA on iPhone/Android
              </p>
            </div>

            <div className="flex-1 space-y-4 text-center sm:text-left">
              <div>
                <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                  Lead & Client Ready
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  Live Mobile Demo & PWA URL
                </h3>
                <code className="block mt-1.5 text-xs font-mono text-purple-600 dark:text-purple-400 bg-white dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 truncate select-all">
                  {activeLiveDemoUrl}
                </code>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1">
                <button
                  onClick={() => handleCopy(activeLiveDemoUrl, 'qr_url')}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'qr_url' ? '✓ Copied Live Link' : 'Copy Live Demo URL'}</span>
                </button>

                <a
                  href={activeLiveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open & Test Demo</span>
                </a>

                <button
                  onClick={() => {
                    const sms = `Hey! Check out this tailored 2nd Brain AI Copilot for ${selectedPackage?.careerTitle}s: ${activeLiveDemoUrl}`;
                    handleCopy(sms, 'sms_demo');
                  }}
                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{copiedKey === 'sms_demo' ? '✓ Copied SMS' : 'Copy SMS Pitch'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
