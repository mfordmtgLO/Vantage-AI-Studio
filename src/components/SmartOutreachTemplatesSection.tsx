/**
 * @file SmartOutreachTemplatesSection.tsx
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Smart Outreach Templates Section for Dashboard
 * Provides pre-written, 100% APR-compliant scripts focusing on 2-1 buydowns,
 * seller credit strategies, and zero-down benefit stacking with instant category refinement.
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Smartphone,
  Mail,
  Users,
  Copy,
  Check,
  Search,
  Filter,
  Sparkles,
  ShieldCheck,
  Zap,
  Tag,
  Star,
  Plus,
  Trash2,
  Send,
  Edit3,
  BookOpen,
  Info,
  Layers,
  Flame,
  ArrowRight,
  Brain,
  CheckCircle2,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import {
  SMART_OUTREACH_TEMPLATES,
  SmartOutreachTemplate,
  StrategyFilterKey,
  STRATEGY_FILTER_OPTIONS
} from '../data/smartOutreachTemplatesData';
import { useMemory } from '../context/MemoryContext';

interface SmartOutreachTemplatesSectionProps {
  onOpenGmailDraft?: (subject: string, body: string, recipient?: string) => void;
  defaultCity?: string;
  defaultProspectName?: string;
  defaultPropertyAddress?: string;
  isCompact?: boolean;
}

export const SmartOutreachTemplatesSection: React.FC<SmartOutreachTemplatesSectionProps> = ({
  onOpenGmailDraft,
  defaultCity = 'Beaverton, OR',
  defaultProspectName = 'Sarah',
  defaultPropertyAddress = '1420 SW Farmington Rd',
  isCompact = false
}) => {
  const { saveMemory } = useMemory();

  // Personalization Variables
  const [buyerName, setBuyerName] = useState<string>(defaultProspectName);
  const [city, setCity] = useState<string>(defaultCity);
  const [propertyAddress, setPropertyAddress] = useState<string>(defaultPropertyAddress);
  const [loName, setLoName] = useState<string>('Mike Ford');
  const [loPhone, setLoPhone] = useState<string>('(541) 729-2097');
  const [nmls, setNmls] = useState<string>('288455');
  const [realtorPartner, setRealtorPartner] = useState<string>('Jessica Miller');
  const [showVariableEditor, setShowVariableEditor] = useState<boolean>(false);

  // Strategy Filter System (2-1 Buydowns, Seller Credits, Zero Down Payment)
  const [activeStrategyFilter, setActiveStrategyFilter] = useState<StrategyFilterKey>('all');

  // Sub-Filters & Search
  const [selectedChannel, setSelectedChannel] = useState<'all' | 'sms' | 'email' | 'forum' | 'realtor'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [favoritesOnly, setFavoritesOnly] = useState<boolean>(false);

  // Custom User Templates & Favorites (LocalStorage)
  const [customTemplates, setCustomTemplates] = useState<SmartOutreachTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_custom_outreach_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_favorite_outreach_templates');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return ['sms_21_buydown_intro', 'email_21_buydown_master', 'sms_usda_buydown_stack'];
    }
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [memorySavedId, setMemorySavedId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  // New Custom Template Form State
  const [newTitle, setNewTitle] = useState('');
  const [newScenario, setNewScenario] = useState('');
  const [newChannel, setNewChannel] = useState<'sms' | 'email' | 'forum' | 'realtor'>('sms');
  const [newStrategy, setNewStrategy] = useState<'2-1 Buydown Strategies' | 'Seller Credit Tactics' | 'Zero Down Payment Options'>('2-1 Buydown Strategies');
  const [newHook, setNewHook] = useState('');
  const [newBody, setNewBody] = useState('');
  const [newTip, setNewTip] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('vantage_custom_outreach_templates', JSON.stringify(customTemplates));
  }, [customTemplates]);

  useEffect(() => {
    localStorage.setItem('vantage_favorite_outreach_templates', JSON.stringify(favoriteIds));
  }, [favoriteIds]);

  // Combine Default & Custom Templates
  const allTemplates = useMemo(() => {
    return [...customTemplates, ...SMART_OUTREACH_TEMPLATES];
  }, [customTemplates]);

  // Counts by strategy for instant visual badges
  const strategyCounts = useMemo(() => {
    const counts = {
      all: allTemplates.length,
      '2-1 Buydown Strategies': 0,
      'Seller Credit Tactics': 0,
      'Zero Down Payment Options': 0
    };
    allTemplates.forEach(t => {
      if (t.strategyFilter in counts) {
        counts[t.strategyFilter]++;
      }
    });
    return counts;
  }, [allTemplates]);

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    return allTemplates.filter((tmpl) => {
      // 1. Strategy Filter
      if (activeStrategyFilter !== 'all' && tmpl.strategyFilter !== activeStrategyFilter) {
        return false;
      }

      // 2. Channel Filter
      if (selectedChannel !== 'all' && tmpl.channel !== selectedChannel) {
        return false;
      }

      // 3. Favorites Only
      if (favoritesOnly && !favoriteIds.includes(tmpl.id)) {
        return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = tmpl.title.toLowerCase().includes(query);
        const matchesBody = tmpl.templateBody.toLowerCase().includes(query);
        const matchesScenario = tmpl.scenario.toLowerCase().includes(query);
        const matchesStrategy = tmpl.strategyFilter.toLowerCase().includes(query);
        const matchesTags = tmpl.tags?.some(t => t.toLowerCase().includes(query));
        if (!matchesTitle && !matchesBody && !matchesScenario && !matchesStrategy && !matchesTags) return false;
      }

      return true;
    });
  }, [allTemplates, activeStrategyFilter, selectedChannel, favoritesOnly, favoriteIds, searchQuery]);

  // Replace placeholders helper
  const personalizeText = (rawText: string) => {
    return rawText
      .replace(/\{\{buyerName\}\}/g, buyerName || 'there')
      .replace(/\{\{city\}\}/g, city || 'your target area')
      .replace(/\{\{propertyAddress\}\}/g, propertyAddress || 'your target home')
      .replace(/\{\{loName\}\}/g, loName || 'Mike Ford')
      .replace(/\{\{loPhone\}\}/g, loPhone || '(541) 729-2097')
      .replace(/\{\{nmls\}\}/g, nmls || '288455')
      .replace(/\{\{realtorPartner\}\}/g, realtorPartner || 'Partner Agent');
  };

  const handleCopy = (template: SmartOutreachTemplate) => {
    const textToCopy = personalizeText(template.templateBody);
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(template.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2500);
  };

  const toggleFavorite = (id: string) => {
    setFavoriteIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSaveToWorkspaceMemory = async (template: SmartOutreachTemplate) => {
    try {
      setMemorySavedId(template.id);
      await saveMemory({
        title: `Outreach Script: ${template.title}`,
        content: `Personalized Outreach Script (${template.strategyFilter} - ${template.channel.toUpperCase()}):\n\n${personalizeText(template.templateBody)}\n\nCompliance & Strategy Notes: ${template.complianceNotes}\nTip: ${template.strategicTip}`,
        type: 'knowledge',
        tags: ['outreach-template', 'buydown-script', template.strategyFilter, template.channel, 'compliance-approved'],
        category: 'Real Estate & Mortgage Intelligence'
      });
      setTimeout(() => setMemorySavedId(null), 3000);
    } catch {
      setMemorySavedId(null);
    }
  };

  const handleCreateCustomTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      setValidationError('Please enter a title and message body.');
      return;
    }

    // 100% APR Compliance Check
    const lowerBody = newBody.toLowerCase();
    const bannedPatterns = [
      /\$\d{1,3}(,\d{3})*(\.\d{2})?\s*\/\s*mo/i, // $X,XXX/mo
      /\d+\.\d+%\s*(apr|interest|rate)/i,        // 6.5% interest
      /fixed rate of \d+/i,
      /payment of \$/i
    ];

    for (const pattern of bannedPatterns) {
      if (pattern.test(lowerBody)) {
        setValidationError('Compliance Warning: Please do not quote specific interest rates, APRs, or monthly dollar payments. Focus instead on 2-1 buydown mechanics, seller concessions, and personal strategy consultations.');
        return;
      }
    }

    const custom: SmartOutreachTemplate = {
      id: `custom_tmpl_${Date.now()}`,
      title: newTitle.trim(),
      scenario: newScenario.trim() || 'Custom Loan Officer Outreach',
      channel: newChannel,
      strategyFilter: newStrategy,
      complianceCategory: newStrategy,
      hookSummary: newHook.trim() || 'Custom seller buydown & credit strategy script',
      templateBody: newBody.trim(),
      complianceNotes: '100% APR Compliant Custom Script (Audited for safe consultative messaging).',
      strategicTip: newTip.trim() || 'Custom script saved to local LO library.',
      recommendedAudience: 'Targeted borrower segment',
      tags: ['Custom', newStrategy, newChannel.toUpperCase()]
    };

    setCustomTemplates(prev => [custom, ...prev]);
    setIsCreateModalOpen(false);
    setNewTitle('');
    setNewScenario('');
    setNewHook('');
    setNewBody('');
    setNewTip('');
    setValidationError(null);
  };

  const handleDeleteCustom = (id: string) => {
    setCustomTemplates(prev => prev.filter(t => t.id !== id));
  };

  const getChannelBadge = (channel: SmartOutreachTemplate['channel']) => {
    switch (channel) {
      case 'sms':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">📱 SMS Quick Hit</span>;
      case 'email':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">📧 In-Depth Email</span>;
      case 'forum':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">💬 Forum / Social</span>;
      case 'realtor':
        return <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">🤝 Realtor Co-Pitch</span>;
    }
  };

  const getStrategyBadge = (strategy: SmartOutreachTemplate['strategyFilter']) => {
    switch (strategy) {
      case '2-1 Buydown Strategies':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">⚡ 2-1 Buydown</span>;
      case 'Seller Credit Tactics':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">🏷️ Seller Credits</span>;
      case 'Zero Down Payment Options':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">🌾 Zero Down (0%)</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-indigo-400" />
        </div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-emerald-400 text-slate-950 uppercase tracking-wider shadow">
                ⚡ 100% APR Compliant
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Loan Officer Outreach Hub
              </span>
              <span className="text-xs text-slate-400">
                • {filteredTemplates.length} of {allTemplates.length} Scripts Visible
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Smart Outreach Strategy Filter &amp; Script Library</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Instantly toggle between <strong>2-1 Buydown Strategies</strong>, <strong>Seller Credit Tactics</strong>, and <strong>Zero Down Payment Options</strong> to copy compliant scripts that guide prospects into a strategy consultation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setShowVariableEditor(!showVariableEditor)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 border border-slate-700 shadow cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
              <span>{showVariableEditor ? 'Hide Lead Variables' : '⚙️ Personalize Variables'}</span>
            </button>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950" />
              <span>New Custom Script</span>
            </button>
          </div>
        </div>

        {/* Live Personalization Variables Editor Bar */}
        {showVariableEditor && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                Live Personalization Tokens (Replaced dynamically across all scripts)
              </span>
              <span className="text-[11px] text-slate-500">Auto-saved for session</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Prospect / Buyer Name</label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Sarah"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">City / Target Market</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Beaverton, OR"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Property Address / Area</label>
                <input
                  type="text"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="e.g. 1420 SW Farmington Rd"
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:border-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">Loan Officer Name &amp; Phone</label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={loName}
                    onChange={(e) => setLoName(e.target.value)}
                    placeholder="Mike Ford"
                    className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:border-indigo-500 outline-none"
                  />
                  <input
                    type="text"
                    value={loPhone}
                    onChange={(e) => setLoPhone(e.target.value)}
                    placeholder="(541) 729-2097"
                    className="w-1/2 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3-WAY STRATEGY FILTER TOGGLE SYSTEM (Core Feature) */}
      {/* ========================================================================= */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            Strategy Filter System (1-Click List Refinement)
          </span>
          <span className="text-[11px] text-slate-400">
            Selected: <strong className="text-white">{activeStrategyFilter === 'all' ? 'All Strategies' : activeStrategyFilter}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STRATEGY_FILTER_OPTIONS.map((opt) => {
            const count = strategyCounts[opt.id as keyof typeof strategyCounts] || 0;
            const isActive = activeStrategyFilter === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setActiveStrategyFilter(opt.id)}
                className={`p-3.5 rounded-2xl text-left transition relative cursor-pointer border flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950/90 border-indigo-400 ring-2 ring-indigo-500/50 shadow-xl'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{opt.icon}</span>
                    <span className={`text-xs font-black ${isActive ? 'text-white' : 'text-slate-200'}`}>
                      {opt.label}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                    isActive
                      ? 'bg-indigo-500 text-white shadow'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count} {count === 1 ? 'Script' : 'Scripts'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {opt.description}
                </p>
                {isActive && (
                  <div className="mt-2 pt-2 border-t border-indigo-500/30 flex items-center gap-1 text-[10px] font-extrabold text-indigo-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Active Filter Applied</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Compliance Rule Strip */}
      <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-emerald-300 font-medium">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>TILA-RESPA Safe Harbor Guarantee:</strong> Scripts focus on seller concessions and escrow subsidies without quoting APR or fixed payments.
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1 text-amber-300 font-bold">⚡ 2-1 Stepped Discounts</span>
          <span className="flex items-center gap-1 text-cyan-300 font-bold">🏷️ Seller Closing Credits</span>
          <span className="flex items-center gap-1 text-emerald-300 font-bold">🌾 100% Zero-Down Benefit Stacks</span>
        </div>
      </div>

      {/* Search & Channel Filters Sub-Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeStrategyFilter === 'all' ? 'all' : activeStrategyFilter} scripts (keywords, address, audience)...`}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-indigo-500 outline-none shadow-inner"
          />
        </div>

        {/* Channel Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs shrink-0">
          {[
            { id: 'all', label: 'All Channels' },
            { id: 'sms', label: '📱 SMS' },
            { id: 'email', label: '📧 Email' },
            { id: 'forum', label: '💬 Forum' },
            { id: 'realtor', label: '🤝 Realtor' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedChannel(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
                selectedChannel === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}

          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1 ${
              favoritesOnly
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>Favorites</span>
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredTemplates.map((template) => {
          const personalizedBody = personalizeText(template.templateBody);
          const isFavorited = favoriteIds.includes(template.id);
          const isCustom = template.id.startsWith('custom_tmpl_');

          return (
            <div
              key={template.id}
              className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between transition group shadow-xl relative"
            >
              <div>
                {/* Header Meta */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {getChannelBadge(template.channel)}
                    {getStrategyBadge(template.strategyFilter)}
                    {isCustom && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        Custom LO Script
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleFavorite(template.id)}
                      className={`p-1.5 rounded-lg transition cursor-pointer ${
                        isFavorited ? 'text-amber-400 hover:text-amber-300' : 'text-slate-500 hover:text-slate-300'
                      }`}
                      title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    </button>
                    {isCustom && (
                      <button
                        onClick={() => handleDeleteCustom(template.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        title="Delete custom script"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Title & Scenario */}
                <h3 className="text-base font-bold text-white mb-1 group-hover:text-indigo-200 transition flex items-center gap-1.5">
                  {template.title}
                </h3>
                <p className="text-xs text-slate-400 mb-3 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{template.scenario}</span>
                </p>

                {/* Personalized Script Body Box */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-200 font-mono whitespace-pre-line leading-relaxed mb-3 relative group/box">
                  {personalizedBody}
                  <button
                    onClick={() => handleCopy(template)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600 text-slate-300 hover:text-white transition shadow opacity-80 group-hover/box:opacity-100 flex items-center gap-1 text-[11px] font-sans cursor-pointer"
                    title="Copy to clipboard"
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Compliance & Tip Notes */}
                <div className="space-y-1.5 text-[11px] mb-4">
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-500/20 text-emerald-300 flex items-start gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{template.complianceNotes}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-indigo-950/30 border border-indigo-500/20 text-indigo-300 flex items-start gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>Strategy Tip:</strong> {template.strategicTip}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleCopy(template)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
                  >
                    {copiedId === template.id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Copy Script</span>
                      </>
                    )}
                  </button>

                  {template.channel === 'sms' && (
                    <a
                      href={`sms:+15417292097?body=${encodeURIComponent(personalizedBody)}`}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>SMS App</span>
                    </a>
                  )}

                  {template.channel === 'email' && (
                    <button
                      onClick={() => {
                        const lines = personalizedBody.split('\n');
                        const subjectLine = lines[0].startsWith('Subject: ')
                          ? lines[0].replace('Subject: ', '')
                          : `${city} Homebuyer Financing Strategy: ${template.strategyFilter}`;
                        const emailBody = lines[0].startsWith('Subject: ')
                          ? lines.slice(2).join('\n')
                          : personalizedBody;

                        if (onOpenGmailDraft) {
                          onOpenGmailDraft(subjectLine, emailBody);
                        } else {
                          const mailtoUrl = `mailto:?subject=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(emailBody)}`;
                          window.open(mailtoUrl, '_blank');
                        }
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Gmail Draft</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleSaveToWorkspaceMemory(template)}
                  disabled={memorySavedId === template.id}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-indigo-950 text-indigo-300 border border-indigo-500/30 text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  title="Save this script to your Workspace 2nd Brain Memory for AI contextual assistance"
                >
                  <Brain className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{memorySavedId === template.id ? 'Saved to Brain!' : 'Sync to 2nd Brain'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No matching outreach templates</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            No scripts match the current filter selection ({activeStrategyFilter !== 'all' ? activeStrategyFilter : ''} {selectedChannel !== 'all' ? `• ${selectedChannel.toUpperCase()}` : ''}).
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveStrategyFilter('all');
              setSelectedChannel('all');
              setFavoritesOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer"
          >
            Show All Strategies
          </button>
        </div>
      )}

      {/* Create Custom Template Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Compliant Custom Script</h3>
                  <span className="text-xs text-slate-400">Categorize under 2-1 Buydown, Seller Credits, or Zero-Down</span>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {validationError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{validationError}</span>
              </div>
            )}

            <form onSubmit={handleCreateCustomTemplate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Script Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. 📱 SMS: Oregon First-Time Buydown Hook"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Target Scenario / Context</label>
                  <input
                    type="text"
                    value={newScenario}
                    onChange={(e) => setNewScenario(e.target.value)}
                    placeholder="e.g. Responding to buyer on Facebook community page"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Channel</label>
                  <select
                    value={newChannel}
                    onChange={(e) => setNewChannel(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 outline-none"
                  >
                    <option value="sms">📱 SMS / Text Message</option>
                    <option value="email">📧 Detailed Email / InMail</option>
                    <option value="forum">💬 Forum / Reddit / Social</option>
                    <option value="realtor">🤝 Realtor Co-Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Strategy Category Filter *</label>
                  <select
                    value={newStrategy}
                    onChange={(e) => setNewStrategy(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-indigo-500 outline-none"
                  >
                    <option value="2-1 Buydown Strategies">⚡ 2-1 Buydown Strategies</option>
                    <option value="Seller Credit Tactics">🏷️ Seller Credit Tactics</option>
                    <option value="Zero Down Payment Options">🌾 Zero Down Payment Options</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Message Script Body * (Use placeholders like {'{{buyerName}}'}, {'{{city}}'}, {'{{propertyAddress}}'}, {'{{loPhone}}'})
                </label>
                <textarea
                  required
                  rows={6}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Hi {{buyerName}}, instead of waiting on market rates, have you looked into a seller-paid 2-1 temporary rate buydown?..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Strategic Advice / LO Tip</label>
                <input
                  type="text"
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="e.g. Best sent within 5 minutes of new lead discovery"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-bold text-amber-400 block mb-1">Compliance Guardrail:</span>
                Never quote exact monthly payment figures ($/mo) or fixed APR terms in initial outreach. Always focus on seller concession mechanics and offer a 1-on-1 strategy review.
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black transition shadow-lg cursor-pointer"
                >
                  Save to My Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
