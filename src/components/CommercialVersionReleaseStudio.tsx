import React, { useState, useEffect } from 'react';
import { 
  Package, Shield, Key, Download, Copy, Check, Sparkles, Building2, 
  Layers, Code, ArrowRight, CheckCircle2, Clock, Globe, Lock, Trash2,
  Calendar, FileText, AlertCircle, RefreshCw, Smartphone
} from 'lucide-react';
import { 
  isMikeFordAdmin, 
  ADMIN_PRIMARY_EMAIL, 
  ADMIN_PRIMARY_NAME,
  getSavedPluginDistributions,
  savePluginDistribution,
  deletePluginDistribution,
  PluginDistributionRecord
} from '../utils/adminAuth';
import { INDUSTRY_CAREER_TEMPLATES } from '../data/industryCareerTemplates';
import { auth } from '../services/firebase';

export const CommercialVersionReleaseStudio: React.FC = () => {
  const [distributions, setDistributions] = useState<PluginDistributionRecord[]>(() => getSavedPluginDistributions());
  const [clientName, setClientName] = useState('');
  const [targetDomain, setTargetDomain] = useState('');
  const [versionTag, setVersionTag] = useState('v2.4.0');
  const [selectedIndustry, setSelectedIndustry] = useState('mortgage_real_estate');
  const [selectedCareer, setSelectedCareer] = useState('mlo_loan_officer');
  const [distributionType, setDistributionType] = useState<'full_hybrid' | 'react_widget' | 'headless_hook' | 'llm_prompt_spec'>('full_hybrid');
  const [priceTier, setPriceTier] = useState<'$1,499 (Standard Commercial)' | '$3,999 (Enterprise Pro)' | '$7,500+ (White-Label Source)'>('$3,999 (Enterprise Pro)');
  const [releaseNotes, setReleaseNotes] = useState('Includes DeepSeek R1 + Gemini Hybrid Reasoning, Real-Time Guardrail Alignment, and Comma-Separated Training Input Engine.');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const activeUser = auth.currentUser;
  const isAdmin = isMikeFordAdmin(activeUser);

  const handleCreateRelease = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !targetDomain.trim()) return;

    const licenseKey = `VNTG-${versionTag.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${new Date().getFullYear()}`;
    
    const newRecord: PluginDistributionRecord = {
      id: `rel_${Date.now()}`,
      clientName: clientName.trim(),
      targetDomain: targetDomain.trim(),
      licenseKey,
      distributionType,
      archetypeId: 'second_brain',
      pluginTitle: `Vantage 2nd Brain ${versionTag} [${selectedIndustry.toUpperCase()}]`,
      distributedAt: new Date().toISOString(),
      notes: `${priceTier} • Notes: ${releaseNotes.trim()}`,
      status: 'active'
    };

    savePluginDistribution(newRecord);
    setDistributions(getSavedPluginDistributions());
    setClientName('');
    setTargetDomain('');
    setToastMessage(`Created Commercial Release License ${licenseKey} for ${newRecord.clientName}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleDelete = (id: string) => {
    deletePluginDistribution(id);
    setDistributions(getSavedPluginDistributions());
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-3xl text-white flex flex-col md:flex-row md:items-center justify-between gap-4 border border-indigo-900/50 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-300 font-bold text-[10px] uppercase tracking-wider border border-indigo-400/30">
              Admin Commercial Hub
            </span>
            <span className="text-xs text-slate-300 font-medium">
              Architect: <strong>{ADMIN_PRIMARY_NAME}</strong> ({ADMIN_PRIMARY_EMAIL})
            </span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            Commercial Upgraded Version Release Manager
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            Package, license, and issue standalone plugin releases (2nd Brain, Voice Macro Router, Real Estate GeoMap) with copyright watermarks and domain authorization keys for periodic client sales.
          </p>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-3 text-emerald-800 dark:text-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid: Create Release Form + Active Licenses Registry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Release Creator Card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Issue New Commercial Release
          </h3>

          <form onSubmit={handleCreateRelease} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Client / Company Name
              </label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="e.g. Apex Mortgage Group"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Authorized Target Domain
              </label>
              <input
                type="text"
                value={targetDomain}
                onChange={(e) => setTargetDomain(e.target.value)}
                placeholder="e.g. apexmortgage.com"
                required
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Version Release Tag
                </label>
                <input
                  type="text"
                  value={versionTag}
                  onChange={(e) => setVersionTag(e.target.value)}
                  placeholder="v2.4.0"
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Distribution Tier
                </label>
                <select
                  value={priceTier}
                  onChange={(e: any) => setPriceTier(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none"
                >
                  <option value="$1,499 (Standard Commercial)">$1,499 (Standard)</option>
                  <option value="$3,999 (Enterprise Pro)">$3,999 (Enterprise)</option>
                  <option value="$7,500+ (White-Label Source)">$7,500+ (White-Label)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pre-Packaged Industry Persona
              </label>
              <select
                value={selectedIndustry}
                onChange={(e) => setSelectedIndustry(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none"
              >
                {INDUSTRY_CAREER_TEMPLATES.map((ind) => (
                  <option key={ind.id} value={ind.id}>
                    {ind.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Release Notes & Inclusions
              </label>
              <textarea
                value={releaseNotes}
                onChange={(e) => setReleaseNotes(e.target.value)}
                rows={3}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Key className="w-4 h-4" />
              <span>Generate Commercial License Key</span>
            </button>
          </form>
        </div>

        {/* Issued Releases Registry */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              Active Commercial Distribution Registry ({distributions.length})
            </h3>
            <span className="text-xs text-slate-400">
              Commercial Rights Holder: Mike Ford
            </span>
          </div>

          {distributions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No commercial releases issued yet. Use the form to package a version release.
            </div>
          ) : (
            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {distributions.map((dist) => (
                <div
                  key={dist.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                        {dist.clientName}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px] font-bold">
                        {dist.targetDomain}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        {dist.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-indigo-600 dark:text-indigo-400">
                      <span>License: <strong>{dist.licenseKey}</strong></span>
                      <button
                        type="button"
                        onClick={() => handleCopyKey(dist.licenseKey)}
                        className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded transition cursor-pointer"
                        title="Copy License Key"
                      >
                        {copiedKey === dist.licenseKey ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-slate-500" />
                        )}
                      </button>
                    </div>

                    {dist.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {dist.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleDelete(dist.id)}
                      className="p-2 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                      title="Revoke / Delete Release"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
