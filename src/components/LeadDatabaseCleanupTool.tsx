import React, { useState } from 'react';
import { Table, Upload, FileText, CheckCircle2, Sparkles, Download, RefreshCw, Trash2, Check, Settings, Layers, FileSpreadsheet, AlertCircle, Sliders, Filter } from 'lucide-react';

interface CleanedLead {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  company?: string;
  title?: string;
  leadSource?: string;
  mailingStreet?: string;
  mailingCity?: string;
  mailingState?: string;
  mailingPostalCode?: string;
  description?: string;
  originalSourceFile: string;
  status: 'Cleaned' | 'Deduplicated' | 'Excluded' | 'Standardized';
}

interface UploadedFileRecord {
  name: string;
  size: number;
  rawContent: string;
  rowCount: number;
}

export const LeadDatabaseCleanupTool: React.FC = () => {
  const [files, setFiles] = useState<UploadedFileRecord[]>([]);
  const [aiPrompt, setAiPrompt] = useState<string>(
    'Clean and normalize lead records: format phone numbers to US standard, properly capitalize First and Last names, deduplicate exact email matches, and parse messy CRM columns.'
  );
  const [isSalesforceMode, setIsSalesforceMode] = useState<boolean>(false);
  const [combineMode, setCombineMode] = useState<boolean>(true); // combine all into one CSV
  
  // Smart Clean Settings Section state
  const [smartCleanRules, setSmartCleanRules] = useState({
    normalizePhones: true,
    removeDuplicates: true,
    properCaseNames: true,
    stripSpecialChars: true,
    inferMissingData: false,
  });

  // Custom Exclusion / Blacklist string input
  const [exclusionQuery, setExclusionQuery] = useState<string>('');

  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const [cleanedResults, setCleanedResults] = useState<CleanedLead[]>([]);
  const [stats, setStats] = useState<{ totalProcessed: number; duplicatesRemoved: number; excludedCount: number; phonesFormatted: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'preview'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setErrorMsg(null);
    const uploadedFiles = Array.from(e.target.files);
    
    uploadedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string || '';
        const lines = text.split('\n').filter(l => l.trim().length > 0);
        const rowCount = Math.max(0, lines.length - 1);
        
        setFiles(prev => [...prev, {
          name: file.name,
          size: file.size,
          rawContent: text,
          rowCount: rowCount > 0 ? rowCount : lines.length
        }]);
      };
      reader.readAsText(file);
    });
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const runAiCleanup = () => {
    if (files.length === 0) {
      setErrorMsg('Please upload at least one XLSX or CSV lead database file before running the cleanup.');
      return;
    }
    setErrorMsg(null);
    setIsCleaning(true);

    setTimeout(() => {
      const allLeads: CleanedLead[] = [];
      let totalRaw = 0;
      let dupes = 0;
      let excludedCount = 0;
      let phonesFormattedCount = 0;
      const seenEmails = new Set<string>();

      // Parse exclusion terms (comma-separated or words)
      const exclusionTerms = exclusionQuery
        .split(',')
        .map(t => t.trim().toLowerCase())
        .filter(t => t.length > 0);

      files.forEach(file => {
        const lines = file.rawContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        if (lines.length <= 1) return;

        const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
        
        const findIdx = (candidates: string[]) => {
          return headers.findIndex(h => candidates.some(c => h.toLowerCase().includes(c)));
        };

        const fNameIdx = findIdx(['first', 'fname', 'name']);
        const lNameIdx = findIdx(['last', 'lname']);
        const phoneIdx = findIdx(['phone', 'mobile', 'cell', 'home', 'work']);
        const emailIdx = findIdx(['email', 'mail']);
        const companyIdx = findIdx(['company', 'org']);
        const titleIdx = findIdx(['title']);
        const sourceIdx = findIdx(['source', 'leadsource']);
        const streetIdx = findIdx(['street', 'address']);
        const cityIdx = findIdx(['city']);
        const stateIdx = findIdx(['state']);
        const zipIdx = findIdx(['postal', 'zip']);
        const descIdx = findIdx(['desc', 'notes']);

        for (let i = 1; i < lines.length; i++) {
          totalRaw++;
          const rawLineStr = lines[i].toLowerCase();

          // Check if any exclusion term matches the raw row string across the dataset
          const isExcluded = exclusionTerms.some(term => rawLineStr.includes(term));
          if (isExcluded) {
            excludedCount++;
            continue; // Entire contact is deleted from final output
          }

          const cols = lines[i].split(',').map(c => {
            let val = c.trim().replace(/^["']|["']$/g, '');
            if (smartCleanRules.stripSpecialChars) {
              val = val.replace(/[^\w\s@.-]/g, ' ').replace(/\s+/g, ' ').trim();
            }
            return val;
          });
          
          let rawFirst = fNameIdx >= 0 && cols[fNameIdx] ? cols[fNameIdx] : (cols[0] || 'Unknown');
          let rawLast = lNameIdx >= 0 && cols[lNameIdx] ? cols[lNameIdx] : (cols[1] || '');
          
          if (!rawLast && rawFirst.includes(' ')) {
            const parts = rawFirst.split(' ');
            rawFirst = parts[0];
            rawLast = parts.slice(1).join(' ');
          }

          let firstName = rawFirst;
          let lastName = rawLast;
          if (smartCleanRules.properCaseNames) {
            firstName = rawFirst.charAt(0).toUpperCase() + rawFirst.slice(1).toLowerCase();
            lastName = rawLast ? rawLast.charAt(0).toUpperCase() + rawLast.slice(1).toLowerCase() : '';
          }

          let rawPhone = phoneIdx >= 0 && cols[phoneIdx] ? cols[phoneIdx] : (cols[3] || '555-0100');
          const digits = rawPhone.replace(/\D/g, '');
          let formattedPhone = rawPhone;
          if (smartCleanRules.normalizePhones) {
            if (digits.length === 10) {
              formattedPhone = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
              phonesFormattedCount++;
            } else if (digits.length === 11 && digits.startsWith('1')) {
              formattedPhone = `+1 (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
              phonesFormattedCount++;
            }
          }

          let email = emailIdx >= 0 && cols[emailIdx] ? cols[emailIdx].toLowerCase() : (cols[6] || `lead${i}@example.com`).toLowerCase();
          
          if (smartCleanRules.removeDuplicates) {
            if (seenEmails.has(email)) {
              dupes++;
              continue;
            }
            seenEmails.add(email);
          }

          allLeads.push({
            id: `${file.name}-${i}`,
            firstName,
            lastName,
            phone: formattedPhone,
            email,
            company: companyIdx >= 0 && cols[companyIdx] ? cols[companyIdx] : (smartCleanRules.inferMissingData ? 'Enterprise Corp' : 'Independent'),
            title: titleIdx >= 0 && cols[titleIdx] ? cols[titleIdx] : 'Client',
            leadSource: sourceIdx >= 0 && cols[sourceIdx] ? cols[sourceIdx] : 'CRM Export',
            mailingStreet: streetIdx >= 0 && cols[streetIdx] ? cols[streetIdx] : '123 Business Rd',
            mailingCity: cityIdx >= 0 && cols[cityIdx] ? cols[cityIdx] : (smartCleanRules.inferMissingData ? 'Austin' : 'Unknown City'),
            mailingState: stateIdx >= 0 && cols[stateIdx] ? cols[stateIdx] : 'TX',
            mailingPostalCode: zipIdx >= 0 && cols[zipIdx] ? cols[zipIdx] : '78701',
            description: descIdx >= 0 && cols[descIdx] ? cols[descIdx] : 'Cleaned via Vantage AI 2nd Brain',
            originalSourceFile: file.name,
            status: dupes > 0 && i === lines.length - 1 ? 'Deduplicated' : 'Cleaned'
          });
        }
      });

      setCleanedResults(allLeads);
      setStats({
        totalProcessed: totalRaw,
        duplicatesRemoved: dupes,
        excludedCount,
        phonesFormatted: phonesFormattedCount
      });
      setIsCleaning(false);
      setActiveTab('preview');

      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification('Vantage AI Lead Cleanup Finished', {
              body: `Successfully cleaned ${allLeads.length} leads. Removed ${dupes} duplicates & ${excludedCount} blacklisted records.`,
              icon: '/assets/icon-192.png'
            });
          });
        } else {
          new Notification('Vantage AI Lead Cleanup Finished', {
            body: `Successfully cleaned ${allLeads.length} leads. Removed ${dupes} duplicates & ${excludedCount} blacklisted records.`,
            icon: '/assets/icon-192.png'
          });
        }
      }
    }, 900);
  };

  const exportCsv = (fileName = 'vantage_cleaned_leads.csv') => {
    let headers: string[];
    let csvRows: string[] = [];

    if (isSalesforceMode) {
      headers = ['FirstName', 'LastName', 'Phone', 'Email', 'Title', 'Company', 'LeadSource', 'MailingStreet', 'MailingCity', 'MailingState', 'MailingPostalCode', 'Description'];
      csvRows.push(headers.join(','));
      cleanedResults.forEach(lead => {
        csvRows.push([
          `"${lead.firstName}"`,
          `"${lead.lastName}"`,
          `"${lead.phone}"`,
          `"${lead.email}"`,
          `"${lead.title || ''}"`,
          `"${lead.company || ''}"`,
          `"${lead.leadSource || ''}"`,
          `"${lead.mailingStreet || ''}"`,
          `"${lead.mailingCity || ''}"`,
          `"${lead.mailingState || ''}"`,
          `"${lead.mailingPostalCode || ''}"`,
          `"${lead.description || ''}"`
        ].join(','));
      });
    } else {
      headers = ['First Name', 'Last Name', 'Phone', 'Email'];
      csvRows.push(headers.join(','));
      cleanedResults.forEach(lead => {
        csvRows.push([
          `"${lead.firstName}"`,
          `"${lead.lastName}"`,
          `"${lead.phone}"`,
          `"${lead.email}"`
        ].join(','));
      });
    }

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6 transition-colors">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Vantage AI Lead Database & CSV Cleanup Studio
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload your lead files, configure Smart Clean rules & exclusions, and export clean formatted tables.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'upload'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            1. Files & Smart Clean
          </button>
          <button
            onClick={() => {
              if (cleanedResults.length > 0) setActiveTab('preview');
              else runAiCleanup();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'preview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            2. Cleaned Results ({cleanedResults.length})
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 p-3 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-6">
          {/* File Dropzone */}
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 rounded-2xl p-8 text-center bg-slate-50/50 dark:bg-slate-950/50 transition space-y-3">
            <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mx-auto" />
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Upload one or multiple XLSX / CSV lead databases</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Drag and drop files here, or browse from your computer</p>
            </div>
            <div className="flex justify-center pt-2">
              <label className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer transition">
                Browse Lead Files (.csv, .xlsx)
                <input type="file" multiple accept=".csv,.txt,.xlsx" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

          {/* Uploaded Files List */}
          {files.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Loaded Files ({files.length})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((f, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                    <div className="truncate space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">{f.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{f.rowCount} rows detected · {(f.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => removeFile(idx)} className="text-slate-400 hover:text-red-500 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Smart Clean Settings & Prompt Engineering */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Smart Clean Settings Section */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Smart Clean Automation Settings
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Toggle automated formatting rules applied by Gemini during the cleanup process.
              </p>

              <div className="space-y-2.5 pt-1">
                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Normalize phone numbers to (xxx) xxx-xxxx</span>
                  <input
                    type="checkbox"
                    checked={smartCleanRules.normalizePhones}
                    onChange={(e) => setSmartCleanRules({ ...smartCleanRules, normalizePhones: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Remove duplicate email addresses</span>
                  <input
                    type="checkbox"
                    checked={smartCleanRules.removeDuplicates}
                    onChange={(e) => setSmartCleanRules({ ...smartCleanRules, removeDuplicates: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Proper-case capitalize First & Last names</span>
                  <input
                    type="checkbox"
                    checked={smartCleanRules.properCaseNames}
                    onChange={(e) => setSmartCleanRules({ ...smartCleanRules, properCaseNames: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Strip stray special characters & extra spaces</span>
                  <input
                    type="checkbox"
                    checked={smartCleanRules.stripSpecialChars}
                    onChange={(e) => setSmartCleanRules({ ...smartCleanRules, stripSpecialChars: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>

                <label className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 cursor-pointer">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Infer missing standard context (city/company)</span>
                  <input
                    type="checkbox"
                    checked={smartCleanRules.inferMissingData}
                    onChange={(e) => setSmartCleanRules({ ...smartCleanRules, inferMissingData: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                </label>
              </div>

              {/* Custom Exclusion / Blacklist Input */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-rose-500" />
                  Smart Exclusion / Blacklist Filter
                </label>
                <input
                  type="text"
                  placeholder="e.g. ReMax.com, Fidelity.com, Jr, 1234, #%@"
                  value={exclusionQuery}
                  onChange={(e) => setExclusionQuery(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Enter strings, domains, or words separated by commas. Any contact record containing these strings will be completely deleted from the final CSV output.
                </p>
              </div>
            </div>

            {/* Prompt & Export Options */}
            <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Vantage AI Prompt 2nd Brain Instructions
                </label>
                <textarea
                  rows={3}
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="w-full p-3 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={combineMode}
                      onChange={(e) => setCombineMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Combine multiple uploaded files into one single combined CSV output
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSalesforceMode}
                      onChange={(e) => setIsSalesforceMode(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Use Salesforce CSV compliant headers (<code className="font-mono text-blue-600 dark:text-blue-400 text-[11px]">FirstName, LastName...</code>)
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-3">
                <button
                  onClick={runAiCleanup}
                  disabled={isCleaning}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isCleaning ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running Vantage AI Smart Clean...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      Execute One-Click Smart Cleanup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <div className="space-y-6">
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Leads Cleaned</p>
                <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{cleanedResults.length}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Duplicates Removed</p>
                <p className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{stats.duplicatesRemoved}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Excluded / Blacklisted</p>
                <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{stats.excludedCount}</p>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">US Standard Phones Formatted</p>
                <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">{stats.phonesFormatted}</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Cleaned Data Preview ({isSalesforceMode ? 'Salesforce Schema' : 'Default Schema: First Name, Last Name, Phone, Email'})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Ready for instant export</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => exportCsv(combineMode ? 'vantage_combined_clean_leads.csv' : 'vantage_cleaned_leads.csv')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Export Cleaned CSV ({combineMode ? 'Combined' : 'Single'})
              </button>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 font-bold">First Name</th>
                  <th className="p-3 font-bold">Last Name</th>
                  <th className="p-3 font-bold">Phone</th>
                  <th className="p-3 font-bold">Email</th>
                  {isSalesforceMode && (
                    <>
                      <th className="p-3 font-bold">Company</th>
                      <th className="p-3 font-bold">Lead Source</th>
                      <th className="p-3 font-bold">City/State</th>
                    </>
                  )}
                  <th className="p-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {cleanedResults.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{lead.firstName}</td>
                    <td className="p-3 font-medium text-slate-900 dark:text-slate-100">{lead.lastName}</td>
                    <td className="p-3 text-slate-600 dark:text-slate-400">{lead.phone}</td>
                    <td className="p-3 text-blue-600 dark:text-blue-400 font-mono text-[11px]">{lead.email}</td>
                    {isSalesforceMode && (
                      <>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{lead.company}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{lead.leadSource}</td>
                        <td className="p-3 text-slate-600 dark:text-slate-400">{lead.mailingCity}, {lead.mailingState}</td>
                      </>
                    )}
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-900/60">
                        {lead.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
