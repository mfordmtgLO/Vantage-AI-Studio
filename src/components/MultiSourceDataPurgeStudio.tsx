/**
 * Vantage AI Workspace - Multi-Source CSV/XLSX De-Duplication & Permanent Domain Purge Engine
 * Fuzzy Levenshtein Clustering, Canonical Email Standardizer, and 2nd Brain Blacklist Synchronizer
 * 
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All rights reserved.
 */

import React, { useState } from 'react';
import { 
  FileSpreadsheet, Upload, Trash2, ShieldAlert, Sparkles, 
  CheckCircle2, Download, RefreshCw, AlertTriangle, Filter, 
  Layers, Database, Sliders, Check, Copy, Brain, ArrowRight
} from 'lucide-react';
import { 
  FuzzyDeduplicationEngine, 
  RawLeadRecord, 
  CleanedUnifiedLead, 
  DEFAULT_BLACKISTED_DOMAINS 
} from '../utils/fuzzyDeduplicator';
import { useMemory } from '../context/MemoryContext';

interface UploadedSourceFile {
  id: string;
  name: string;
  size: number;
  rowCount: number;
  records: RawLeadRecord[];
}

export const MultiSourceDataPurgeStudio: React.FC = () => {
  const { memories, saveMemory } = useMemory();

  const [uploadedFiles, setUploadedFiles] = useState<UploadedSourceFile[]>([]);
  const [similarityThreshold, setSimilarityThreshold] = useState<number>(0.85);
  const [combineMode, setCombineMode] = useState<boolean>(true);
  const [newBlacklistDomain, setNewBlacklistDomain] = useState<string>('');

  // Extract blacklisted domains from 2nd Brain memories
  const brainBlacklist = memories
    .filter((m) => m.category === 'domain_purge_blacklist' || m.tags.includes('blacklist_domain'))
    .map((m) => {
      const match = m.title.match(/Blacklist Domain:\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
      return match ? match[1].toLowerCase().trim() : '';
    })
    .filter(Boolean);

  const [customBlacklist, setCustomBlacklist] = useState<string[]>(brainBlacklist);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [cleanedResults, setCleanedResults] = useState<{
    uniqueLeads: CleanedUnifiedLead[];
    duplicates: CleanedUnifiedLead[];
    purgedBlacklist: CleanedUnifiedLead[];
    duplicateClustersCount: number;
    auditSummary: {
      totalIngested: number;
      uniqueRetained: number;
      duplicatesEliminated: number;
      spamDomainsPurged: number;
      phonesStandardized: number;
    };
  } | null>(null);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'unique' | 'duplicates' | 'blacklist_vault'>('upload');

  // Sample data loader for quick testing
  const handleLoadSampleBatch = () => {
    const sampleRecords: RawLeadRecord[] = [
      {
        id: 's1',
        fullName: 'Marcus Vance',
        email: 'marcus.vance+lead@gmail.com',
        phone: '5125558921',
        company: 'Vance Holdings LLC',
        sourceFile: 'Austin_Commercial_Leads_Q3.csv'
      },
      {
        id: 's2',
        fullName: 'Marcus Vance',
        email: 'marcus.vance@gmail.com',
        phone: '(512) 555-8921',
        company: 'Vance Holdings',
        sourceFile: 'Secondary_Mortgage_Inbound.csv'
      },
      {
        id: 's3',
        fullName: 'Sarah Jenkins',
        email: 'sjenkins@oregonhealth.org',
        phone: '5035551284',
        company: 'Oregon Health Network',
        sourceFile: 'Austin_Commercial_Leads_Q3.csv'
      },
      {
        id: 's4',
        fullName: 'Bot Spammer',
        email: 'spammer@coldleads-scraper.biz',
        phone: '8005550199',
        company: 'Scraper Bot Network',
        sourceFile: 'Web_Form_Submissions.csv'
      },
      {
        id: 's5',
        fullName: 'Sara Jenkyns',
        email: 'sara.jenkyns@oregonhealth.org',
        phone: '(503) 555-1284',
        company: 'Oregon Health Network Inc',
        sourceFile: 'Web_Form_Submissions.csv'
      }
    ];

    setUploadedFiles([
      {
        id: 'f-sample-1',
        name: 'Austin_Commercial_Leads_Q3.csv',
        size: 14200,
        rowCount: 2,
        records: sampleRecords.slice(0, 2)
      },
      {
        id: 'f-sample-2',
        name: 'Web_Form_Submissions.csv',
        size: 28400,
        rowCount: 3,
        records: sampleRecords.slice(2)
      }
    ]);

    setNotificationMsg('Loaded multi-source sample leads files for instant deduplication & purge testing.');
    setTimeout(() => setNotificationMsg(null), 3500);
  };

  // Process Deduplication & Purge
  const handleRunProcessing = () => {
    setIsProcessing(true);
    const allRecords: RawLeadRecord[] = uploadedFiles.flatMap((f) => f.records);

    setTimeout(() => {
      const results = FuzzyDeduplicationEngine.processLeadVault(
        allRecords,
        [...DEFAULT_BLACKISTED_DOMAINS, ...customBlacklist],
        similarityThreshold
      );
      setCleanedResults(results);
      setIsProcessing(false);
      setActiveTab('unique');
      setNotificationMsg(
        `Consolidation Complete: ${results.auditSummary.uniqueRetained} unique retained, ${results.auditSummary.duplicatesEliminated} duplicates removed, ${results.auditSummary.spamDomainsPurged} blacklisted spam purged.`
      );
      setTimeout(() => setNotificationMsg(null), 5000);
    }, 600);
  };

  // Add Domain to Permanent Blacklist and sync to 2nd Brain
  const handleAddDomainToBlacklist = async () => {
    if (!newBlacklistDomain.trim()) return;
    const cleanDomain = newBlacklistDomain.toLowerCase().trim().replace(/https?:\/\//, '').replace(/\/.*$/, '');

    if (!customBlacklist.includes(cleanDomain)) {
      setCustomBlacklist((prev) => [...prev, cleanDomain]);

      // Save to 2nd Brain Memory
      await saveMemory({
        title: `Blacklist Domain: ${cleanDomain}`,
        content: `Permanent CRM exclusion rule: Any inbound lead with email domain @${cleanDomain} is purged automatically before CRM or Google Sheets insertion.`,
        type: 'knowledge',
        category: 'domain_purge_blacklist',
        tags: ['blacklist_domain', 'crm_purge', cleanDomain],
        source: 'manual'
      });

      setNotificationMsg(`Domain "${cleanDomain}" permanently blacklisted and synchronized to 2nd Brain cognitive memory.`);
      setTimeout(() => setNotificationMsg(null), 4000);
    }
    setNewBlacklistDomain('');
  };

  // Export Cleaned Records
  const handleExportCleanedCsv = () => {
    if (!cleanedResults) return;
    const headers = 'Full Name,First Name,Last Name,Canonical Email,Formatted Phone,Company,Source File,Confidence Score';
    const rows = cleanedResults.uniqueLeads.map(
      (l) => `"${l.fullName}","${l.firstName}","${l.lastName}","${l.canonicalEmail}","${l.phone}","${l.company}","${l.sourceFile}","${l.confidenceScore}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Vantage_Cleaned_Consolidated_Leads.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-red-600/10 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Multi-Source Lead De-Duplication & Permanent Domain Purge Engine
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-purple-600 text-white rounded-full">
                Fuzzy Levenshtein
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Consolidate messy CSV/XLSX lead databases, eliminate fuzzy duplicates, and permanently purge blacklisted scraper domains into 2nd Brain.
            </p>
          </div>
        </div>

        <button
          onClick={handleLoadSampleBatch}
          className="px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load Multi-File Test Sample</span>
        </button>
      </div>

      {/* Notification */}
      {notificationMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 p-3 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-200 flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'upload'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>1. Upload & Ingest Files ({uploadedFiles.length})</span>
          </button>

          {cleanedResults && (
            <>
              <button
                onClick={() => setActiveTab('unique')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'unique'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>2. Cleaned & Retained ({cleanedResults.uniqueLeads.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('duplicates')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'duplicates'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Duplicates Removed ({cleanedResults.duplicates.length})</span>
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('blacklist_vault')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'blacklist_vault'
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>2nd Brain Blacklist Vault ({customBlacklist.length + DEFAULT_BLACKISTED_DOMAINS.length})</span>
          </button>
        </div>

        {cleanedResults && (
          <button
            onClick={handleExportCleanedCsv}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Cleaned Master CSV</span>
          </button>
        )}
      </div>

      {/* Tab: Upload & Ingest Files */}
      {activeTab === 'upload' && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5 text-purple-600" />
                  Fuzzy Similarity Sensitivity
                </span>
                <span className="text-xs font-mono font-bold text-purple-600">{Math.round(similarityThreshold * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.60"
                max="0.99"
                step="0.01"
                value={similarityThreshold}
                onChange={(e) => setSimilarityThreshold(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Higher threshold requires closer string match for names & companies.
              </p>
            </div>

            <div className="flex items-center justify-end">
              <button
                onClick={handleRunProcessing}
                disabled={uploadedFiles.length === 0 || isProcessing}
                className="w-full md:w-auto px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-500/20 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
                <span>{isProcessing ? 'Running Fuzzy Matching...' : 'Run Consolidation & Domain Purge'}</span>
              </button>
            </div>
          </div>

          {/* Files List */}
          {uploadedFiles.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Staged Source Files for Cross-File Deduplication ({uploadedFiles.length})
              </h4>
              <div className="space-y-2">
                {uploadedFiles.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileSpreadsheet className="w-4 h-4 text-purple-600" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{f.name}</h5>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {f.rowCount} records • {(f.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setUploadedFiles((prev) => prev.filter((item) => item.id !== f.id))}
                      className="p-1.5 text-slate-400 hover:text-red-500 transition cursor-pointer"
                      title="Remove file"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Cleaned Records */}
      {activeTab === 'unique' && cleanedResults && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-emerald-50/40 dark:bg-emerald-950/20">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Cleaned & Retained Master Leads ({cleanedResults.uniqueLeads.length})
            </h4>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
              Canonical emails & (XXX) XXX-XXXX phones enforced
            </span>
          </div>

          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 dark:bg-slate-800/80 sticky top-0 z-10 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Canonical Email</th>
                  <th className="p-3">Formatted Phone</th>
                  <th className="p-3">Company</th>
                  <th className="p-3">Source File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cleanedResults.uniqueLeads.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-slate-100">{l.fullName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.canonicalEmail}</td>
                    <td className="p-3 font-mono text-slate-700 dark:text-slate-300">{l.phone}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{l.company || '—'}</td>
                    <td className="p-3 text-[11px] text-slate-400">{l.sourceFile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Blacklist Vault */}
      {activeTab === 'blacklist_vault' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-red-600" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  2nd Brain Persistent Blacklist Vault
                </h4>
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Synchronized across all CRM ingestion pipelines
              </span>
            </div>

            {/* Add Domain input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newBlacklistDomain}
                onChange={(e) => setNewBlacklistDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddDomainToBlacklist()}
                placeholder="Enter domain to permanently blacklist (e.g. competitor.com, spambot.net)..."
                className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-slate-900 dark:text-slate-100"
              />
              <button
                onClick={handleAddDomainToBlacklist}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shrink-0 transition cursor-pointer flex items-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Add & Sync to 2nd Brain</span>
              </button>
            </div>

            {/* Blacklist Badges Grid */}
            <div className="pt-2">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Active Blacklisted Domains ({customBlacklist.length + DEFAULT_BLACKISTED_DOMAINS.length})
              </h5>
              <div className="flex flex-wrap gap-2">
                {[...DEFAULT_BLACKISTED_DOMAINS, ...customBlacklist].map((dom, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 text-xs bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-1 font-mono"
                  >
                    <span>{dom}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
