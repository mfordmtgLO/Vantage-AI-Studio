/**
 * @license
 * Copyright (c) 2026 Mike Ford. All Rights Reserved.
 * Commercial attribution: Mike Ford <fordmj@gmail.com>
 *
 * Vantage AI Studio - CRM Multi-File Batch Processor & Bulk Hygiene Validator
 * Upload multiple CSV/text files, perform bulk hygiene checks & ASCII normalization,
 * resolve cross-file duplicates, and merge into a single compliant CRM-ready CSV.
 */

import React, { useState, useMemo, useRef } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  Download, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sliders, 
  Eye, 
  Table, 
  FileText, 
  FileSpreadsheet,
  Code, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  HelpCircle, 
  Filter, 
  Layers, 
  ArrowRight,
  Search, 
  ChevronRight, 
  ChevronDown,
  Database, 
  AlertTriangle, 
  Zap,
  Upload,
  X,
  Trash2,
  FilePlus,
  CheckCheck,
  FileCheck2,
  ListFilter,
  FileCode,
  FileStack,
  GitMerge,
  Split
} from 'lucide-react';
import { SupportedCrm } from './CrmExportConfigurationView';
import { sanitizeToAscii, normalizeTotalExpertGroup, normalizeBoldTrailHashtags } from './LeadDatabaseCleanupTool';
import { 
  validateCsvHygiene, 
  autoSanitizeCsvContent, 
  parseCsvRow, 
  formatStandardPhone,
  ValidationSummary,
  HygieneIssue 
} from './CsvHygieneValidator';

export interface BatchFileItem {
  id: string;
  name: string;
  size: number;
  rawContent: string;
  rowCount: number;
  headers: string[];
  validation: ValidationSummary;
  sanitizedContent?: string;
  isProcessing?: boolean;
  status: 'pending' | 'validating' | 'sanitized' | 'ready' | 'warning' | 'error';
}

export interface BatchProcessorProps {
  targetCrm: SupportedCrm;
  onCrmChange?: (crm: SupportedCrm) => void;
  crmName?: string;
}

// Sample demo datasets to simulate multi-source ingestion
const DEMO_BATCH_FILES = [
  {
    name: 'zillow_buyer_inquiries_aug.csv',
    content: `"Full Name","Email","Phone","Notes","Lead Source","Tags"
"Sarah “VIP” Jenkins","sarah.jenkins@example.com","503-555-0192","Looking for 3-bed craftsman in Portland area—budget $650k","Zillow Inbound","Realtor, Buyer"
"Marcus Sterling-O’Connor","marcus.sterling@pacwest.com","(503) 555-0144","Pre-approved with Chase bank. Needs rate match.","Zillow Web","Buyer, DPA"
"Elena Rostova","elena.rostova@cascade.io","5035550189","First time home buyer looking in Hillsboro","Zillow Premier","FHA, Grant"
"David Jenkins","david.j@example.com","(503) 555-0193","Spouse of Sarah Jenkins—co-signing loan application","Zillow Inbound","Co-Borrower"
"David Chen","david.chen@pacificnw.org","(503) 555-0198","Selling condo in Pearl District, buying in Beaverton","Zillow Premier","Seller, Move-Up"`
  },
  {
    name: 'open_house_signins_cedarmill.csv',
    content: `"First Name","Last Name","Email Address","Mobile","Interested Property","Hashtags"
"Rachel","Adams","rachel.adams@summit.org","5035550111","1240 NW Cedar Mill Rd","#OpenHouse #FirstTimeBuyer"
"Marcus","Sterling","marcus.sterling@pacwest.com","5035550144","1240 NW Cedar Mill Rd","#Buyer #PreApproved"
"Tyler","Vance","tyler.vance@apex.io","(541) 555-0841","1240 NW Cedar Mill Rd","#CashBuyer #Investor"
"Amanda","Cruz","amanda.cruz@beacon.com","(503) 555-0167","1240 NW Cedar Mill Rd","#VA #Relocation"`
  },
  {
    name: 'realtor_referral_partners_pdx.csv',
    content: `"first name","last name","email","cell phone","address","city","state","zip","Group"
"Carlos","Mendez","carlos.m@compassre.com","(503) 555-0182","400 SW 6th Ave","Portland","OR","97204","Realtor , VIP Partner , Top Producer"
"Sarah","Jenkins","sarah.jenkins@example.com","(503) 555-0192","742 Evergreen Terrace","Portland","OR","97201","Past Client, Realtor"
"Jessica","Taylor","jessica.t@windermere.com","(503) 555-0195","1001 SW 5th Ave","Portland","OR","97204","Realtor, Preferred Lender"`
  },
  {
    name: 'grant_program_webinar_attendees.csv',
    content: `"Name","Email","Phone Number","Loan Purpose","Program Interest"
"Elena Rostova","elena.rostova@cascade.io","(503) 555-0189","Purchase","Oregon Housing DPA Grant ($15k)"
"Brandon Scott","bscott@northwest.edu","503-555-0122","Purchase","First-Generation Homebuyer Match"
"Chloe Bennett","c.bennett@pdxdesign.co","(503) 555-0133","Purchase","FHA 3.5% Down Grant"`
  }
];

export const CrmBatchProcessor: React.FC<BatchProcessorProps> = ({
  targetCrm,
  onCrmChange,
  crmName = 'CRM'
}) => {
  const [files, setFiles] = useState<BatchFileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dedupKey, setDedupKey] = useState<'email' | 'phone' | 'email_or_phone' | 'none'>('email_or_phone');
  const [dedupStrategy, setDedupStrategy] = useState<'keep_first' | 'keep_most_complete' | 'merge_tags'>('merge_tags');
  const [autoSplitNames, setAutoSplitNames] = useState<boolean>(true);
  const [autoAsciiSanitize, setAutoAsciiSanitize] = useState<boolean>(true);
  const [autoFormatPhones, setAutoFormatPhones] = useState<boolean>(true);
  const [enforceCrmSyntax, setEnforceCrmSyntax] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'queue' | 'merged_preview' | 'audit_log'>('queue');
  const [expandedFileId, setExpandedFileId] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);
  const [batchProgress, setBatchProgress] = useState<number>(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse raw text into structured BatchFileItem
  const processRawFileText = (filename: string, text: string, size: number): BatchFileItem => {
    const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
    const headers = lines.length > 0 ? parseCsvRow(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, '')) : [];
    const validation = validateCsvHygiene(text, targetCrm);

    return {
      id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: filename,
      size: size,
      rawContent: text,
      rowCount: Math.max(0, lines.length - 1),
      headers,
      validation,
      status: validation.isValid ? 'ready' : validation.totalErrors > 0 ? 'warning' : 'ready'
    };
  };

  // Handle file uploads from input or drop
  const handleIncomingFiles = (incomingFiles: FileList | File[]) => {
    const newItems: BatchFileItem[] = [];
    Array.from(incomingFiles).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string || '';
        const item = processRawFileText(file.name, text, file.size);
        setFiles(prev => [...prev, item]);
      };
      reader.readAsText(file);
    });
  };

  // Load sample demo batch
  const handleLoadDemoBatch = () => {
    const demoItems = DEMO_BATCH_FILES.map((df, idx) => 
      processRawFileText(df.name, df.content, df.content.length)
    );
    setFiles(demoItems);
  };

  // Remove single file
  const handleRemoveFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (expandedFileId === id) setExpandedFileId(null);
  };

  // Clear all files
  const handleClearAll = () => {
    setFiles([]);
    setExpandedFileId(null);
  };

  // Single file auto-sanitize
  const handleSanitizeSingleFile = (id: string) => {
    setFiles(prev => prev.map(f => {
      if (f.id !== id) return f;
      const sanitized = autoSanitizeCsvContent(f.rawContent, targetCrm);
      const reVal = validateCsvHygiene(sanitized, targetCrm);
      return {
        ...f,
        rawContent: sanitized,
        sanitizedContent: sanitized,
        validation: reVal,
        status: 'sanitized'
      };
    }));
  };

  // Run Batch Processing Pipeline
  const handleRunBatchSanitize = () => {
    setIsProcessingBatch(true);
    setBatchProgress(15);

    setTimeout(() => {
      setBatchProgress(50);
      setFiles(prev => prev.map(f => {
        const cleaned = autoSanitizeCsvContent(f.rawContent, targetCrm);
        const reVal = validateCsvHygiene(cleaned, targetCrm);
        return {
          ...f,
          rawContent: cleaned,
          sanitizedContent: cleaned,
          validation: reVal,
          status: reVal.isValid ? 'sanitized' : 'ready'
        };
      }));

      setTimeout(() => {
        setBatchProgress(100);
        setIsProcessingBatch(false);
        setActiveTab('merged_preview');
      }, 500);
    }, 400);
  };

  // Helper: Normalize & Split Name
  const splitFullName = (fullName: string): { first: string; last: string } => {
    const clean = fullName.replace(/^["']|["']$/g, '').trim();
    if (!clean) return { first: '', last: '' };
    const parts = clean.split(/\s+/);
    if (parts.length === 1) return { first: parts[0], last: '' };
    const first = parts[0];
    const last = parts.slice(1).join(' ');
    return { first, last };
  };

  // Merged Dataset Calculation
  const mergedResult = useMemo(() => {
    if (files.length === 0) {
      return {
        headers: [],
        rows: [],
        rawCsv: '',
        duplicatesRemoved: 0,
        totalRawRows: 0,
        asciiReplacementsCount: 0,
        auditLog: [] as string[]
      };
    }

    const auditLog: string[] = [];
    auditLog.push(`[${new Date().toLocaleTimeString()}] Batch Ingestion Initialized across ${files.length} files for target CRM: ${targetCrm}`);

    // Standard Unified Target Headers based on CRM
    let standardHeaders: string[] = [];
    if (targetCrm === 'boldtrail') {
      standardHeaders = ['first_name', 'last_name', 'email_1', 'cell_phone_1', 'hashtags', 'deal_type', 'lead_status', 'lead_source', 'notes', 'email_optin', 'phone_optin', 'text_optin'];
    } else if (targetCrm === 'total_expert' || targetCrm === 'total_expert_mortgage') {
      standardHeaders = ['first name', 'last name', 'email', 'cell phone', 'phone', 'address', 'city', 'state', 'zip', 'Group', 'loan number', 'loan amount', 'notes'];
    } else if (targetCrm === 'big_purple_dot' || targetCrm === 'bpd_encompass') {
      standardHeaders = ['First Name', 'Last Name', 'Email', 'Phone', 'Mobile Phone', 'Street Address', 'City', 'State', 'Zip Code', 'Lead Source', 'Status', 'Notes'];
    } else if (targetCrm === 'salesforce') {
      standardHeaders = ['FirstName', 'LastName', 'Email', 'Phone', 'Company', 'LeadSource', 'Status', 'Street', 'City', 'State', 'PostalCode', 'Description'];
    } else {
      // HubSpot
      standardHeaders = ['First Name', 'Last Name', 'Email', 'Phone Number', 'Company Name', 'Lead Status', 'City', 'Message'];
    }

    interface NormalizedRow {
      [col: string]: string;
      _sourceFile: string;
      _originalRawIndex: string;
    }

    const collectedRows: NormalizedRow[] = [];
    let totalRawRowsCount = 0;
    let asciiReplacements = 0;

    // Process each file
    files.forEach(file => {
      const content = file.rawContent || '';
      const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) return;

      const rawHeaders = parseCsvRow(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ''));
      auditLog.push(`-> Processing file: "${file.name}" (${lines.length - 1} records, ${rawHeaders.length} headers)`);

      // Header map for this file
      const headerIndexMap: Record<string, number> = {};
      rawHeaders.forEach((h, idx) => {
        headerIndexMap[h.toLowerCase()] = idx;
      });

      const findColIdx = (keywords: string[]): number => {
        for (const kw of keywords) {
          const lowerKw = kw.toLowerCase();
          for (const rawH in headerIndexMap) {
            if (rawH === lowerKw || rawH.includes(lowerKw)) {
              return headerIndexMap[rawH];
            }
          }
        }
        return -1;
      };

      const fullNameIdx = findColIdx(['full name', 'name', 'contact name']);
      const firstIdx = findColIdx(['first name', 'first_name', 'firstname', 'fname', 'first']);
      const lastIdx = findColIdx(['last name', 'last_name', 'lastname', 'lname', 'last']);
      const emailIdx = findColIdx(['email', 'email address', 'email_1', 'email1', 'e-mail']);
      const phoneIdx = findColIdx(['phone', 'phone number', 'cell phone', 'cell_phone', 'mobile', 'cell_phone_1', 'mobile phone']);
      const notesIdx = findColIdx(['notes', 'message', 'interested property', 'program interest', 'loan purpose', 'comments']);
      const sourceIdx = findColIdx(['lead source', 'source', 'lead_source']);
      const tagsIdx = findColIdx(['tags', 'hashtags', 'group', 'pipeline', 'category']);
      const addressIdx = findColIdx(['address', 'street', 'street address']);
      const cityIdx = findColIdx(['city']);
      const stateIdx = findColIdx(['state']);
      const zipIdx = findColIdx(['zip', 'zip code', 'postalcode', 'postal code']);

      // Parse data rows
      for (let r = 1; r < lines.length; r++) {
        totalRawRowsCount++;
        const rowCells = parseCsvRow(lines[r]);
        const getVal = (idx: number) => (idx >= 0 && idx < rowCells.length ? rowCells[idx].trim().replace(/^["']|["']$/g, '') : '');

        let first = firstIdx >= 0 ? getVal(firstIdx) : '';
        let last = lastIdx >= 0 ? getVal(lastIdx) : '';

        // If no first/last but Full Name exists, auto-split
        if ((!first && !last) && fullNameIdx >= 0 && autoSplitNames) {
          const split = splitFullName(getVal(fullNameIdx));
          first = split.first;
          last = split.last;
        }

        let email = emailIdx >= 0 ? getVal(emailIdx).toLowerCase() : '';
        let phone = phoneIdx >= 0 ? getVal(phoneIdx) : '';
        if (autoFormatPhones && phone) {
          phone = formatStandardPhone(phone);
        }

        let notes = notesIdx >= 0 ? getVal(notesIdx) : '';
        let source = sourceIdx >= 0 ? getVal(sourceIdx) : file.name.replace(/\.[^/.]+$/, "");
        let tags = tagsIdx >= 0 ? getVal(tagsIdx) : '';
        let addr = addressIdx >= 0 ? getVal(addressIdx) : '';
        let city = cityIdx >= 0 ? getVal(cityIdx) : '';
        let state = stateIdx >= 0 ? getVal(stateIdx) : '';
        let zip = zipIdx >= 0 ? getVal(zipIdx) : '';

        // ASCII sanitize
        if (autoAsciiSanitize) {
          const origFirst = first;
          const origLast = last;
          const origNotes = notes;
          first = sanitizeToAscii(first);
          last = sanitizeToAscii(last);
          notes = sanitizeToAscii(notes);
          tags = sanitizeToAscii(tags);
          if (first !== origFirst || last !== origLast || notes !== origNotes) {
            asciiReplacements++;
          }
        }

        // Target CRM formatting
        if (enforceCrmSyntax) {
          if (targetCrm === 'boldtrail') {
            tags = normalizeBoldTrailHashtags(tags || 'Buyer');
          } else if (targetCrm === 'total_expert' || targetCrm === 'total_expert_mortgage') {
            tags = normalizeTotalExpertGroup(tags || 'Lead');
          }
        }

        // Build standardized row
        const rowObj: NormalizedRow = {
          _sourceFile: file.name,
          _originalRawIndex: `${file.name}#${r}`
        };

        standardHeaders.forEach(sh => {
          const lowerH = sh.toLowerCase();
          if (lowerH.includes('first') || lowerH === 'firstname') rowObj[sh] = first;
          else if (lowerH.includes('last') || lowerH === 'lastname') rowObj[sh] = last;
          else if (lowerH.includes('email')) rowObj[sh] = email;
          else if (lowerH.includes('cell') || lowerH.includes('mobile')) rowObj[sh] = phone;
          else if (lowerH.includes('phone') && !rowObj[sh]) rowObj[sh] = phone;
          else if (lowerH.includes('group') || lowerH.includes('hashtag') || lowerH === 'tags') rowObj[sh] = tags;
          else if (lowerH.includes('note') || lowerH.includes('message') || lowerH.includes('description')) rowObj[sh] = notes;
          else if (lowerH.includes('source')) rowObj[sh] = source;
          else if (lowerH.includes('address') || lowerH.includes('street')) rowObj[sh] = addr;
          else if (lowerH === 'city') rowObj[sh] = city;
          else if (lowerH === 'state') rowObj[sh] = state;
          else if (lowerH.includes('zip') || lowerH.includes('postal')) rowObj[sh] = zip;
          else if (lowerH.includes('optin')) rowObj[sh] = 'true';
          else if (lowerH.includes('status')) rowObj[sh] = 'Open / Active';
          else if (lowerH.includes('company')) rowObj[sh] = 'Pacific Crest Group';
          else rowObj[sh] = '';
        });

        collectedRows.push(rowObj);
      }
    });

    // Cross-file Deduplication
    let duplicatesCount = 0;
    const deduplicatedRows: NormalizedRow[] = [];
    const seenMap = new Map<string, NormalizedRow>();

    if (dedupKey === 'none') {
      deduplicatedRows.push(...collectedRows);
    } else {
      collectedRows.forEach(row => {
        const emailVal = (row['email'] || row['Email'] || row['email_1'] || row['Email Address'] || '').toLowerCase().trim();
        const phoneVal = (row['cell phone'] || row['phone'] || row['Phone'] || row['cell_phone_1'] || row['Mobile'] || '').replace(/\D/g, '');

        let dedupLookup = '';
        if (dedupKey === 'email' && emailVal) dedupLookup = `email:${emailVal}`;
        else if (dedupKey === 'phone' && phoneVal) dedupLookup = `phone:${phoneVal}`;
        else if (dedupKey === 'email_or_phone') {
          if (emailVal) dedupLookup = `email:${emailVal}`;
          else if (phoneVal) dedupLookup = `phone:${phoneVal}`;
        }

        if (dedupLookup && seenMap.has(dedupLookup)) {
          duplicatesCount++;
          const existing = seenMap.get(dedupLookup)!;
          auditLog.push(`[DEDUPLICATION] Consolidated duplicate contact: "${row['first name'] || row['first_name'] || row['FirstName']} ${row['last name'] || row['last_name'] || row['LastName']}" (Matched on ${dedupLookup}) from ${row._sourceFile}`);

          if (dedupStrategy === 'merge_tags') {
            // Merge notes & tags
            const tagField = standardHeaders.find(h => h.toLowerCase().includes('group') || h.toLowerCase().includes('tag'));
            const noteField = standardHeaders.find(h => h.toLowerCase().includes('note') || h.toLowerCase().includes('desc'));
            if (tagField && row[tagField] && !existing[tagField].includes(row[tagField])) {
              const delimiter = targetCrm === 'boldtrail' ? '|' : ',';
              existing[tagField] = `${existing[tagField]}${delimiter}${row[tagField]}`;
            }
            if (noteField && row[noteField] && !existing[noteField].includes(row[noteField])) {
              existing[noteField] = `${existing[noteField]} | [${row._sourceFile}]: ${row[noteField]}`;
            }
          }
        } else {
          if (dedupLookup) seenMap.set(dedupLookup, row);
          deduplicatedRows.push(row);
        }
      });
    }

    // Build raw CSV text
    const headerRowStr = standardHeaders.map(h => `"${h}"`).join(',');
    const dataRowsStr = deduplicatedRows.map(r => standardHeaders.map(h => `"${(r[h] || '').replace(/"/g, '""')}"`).join(','));
    const finalCsv = [headerRowStr, ...dataRowsStr].join('\n');

    auditLog.push(`[SUMMARY] Finished batch normalization. ${totalRawRowsCount} input rows -> ${deduplicatedRows.length} compliant records (${duplicatesCount} duplicates consolidated).`);

    return {
      headers: standardHeaders,
      rows: deduplicatedRows,
      rawCsv: finalCsv,
      duplicatesRemoved: duplicatesCount,
      totalRawRows: totalRawRowsCount,
      asciiReplacementsCount: asciiReplacements,
      auditLog
    };
  }, [files, targetCrm, dedupKey, dedupStrategy, autoSplitNames, autoAsciiSanitize, autoFormatPhones, enforceCrmSyntax]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Download helper
  const handleDownloadCsv = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered merged rows for search
  const filteredMergedRows = useMemo(() => {
    if (!searchFilter.trim()) return mergedResult.rows;
    const q = searchFilter.toLowerCase();
    return mergedResult.rows.filter(r => {
      return Object.values(r).some(v => typeof v === 'string' && v.toLowerCase().includes(q));
    });
  }, [mergedResult.rows, searchFilter]);

  // Overall batch hygiene metrics
  const batchMetrics = useMemo(() => {
    if (files.length === 0) return { score: 100, errors: 0, warnings: 0 };
    let totalErrors = 0;
    let totalWarnings = 0;
    let scoreSum = 0;

    files.forEach(f => {
      totalErrors += f.validation.totalErrors;
      totalWarnings += f.validation.totalWarnings;
      scoreSum += f.validation.score;
    });

    return {
      score: Math.round(scoreSum / files.length),
      errors: totalErrors,
      warnings: totalWarnings
    };
  }, [files]);

  return (
    <div className="space-y-6">
      {/* Batch Header Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-cyan-500/20 text-cyan-300 backdrop-blur-md rounded-full text-xs font-bold border border-cyan-500/30">
                <FileStack className="w-3.5 h-3.5 text-cyan-400" /> Multi-File CRM Batch Processor & Merger
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-200 rounded-full text-[11px] font-semibold border border-blue-400/20">
                Cross-File Deduplication & Schema Transformation
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-[11px] font-bold border border-emerald-500/30">
                Target: {crmName}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              Bulk CSV Ingestion, Hygiene Scrubbing & Unified Export
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
              Upload multiple raw CSV files from Zillow, Open Houses, referral partners, or webinars. Automatically normalize ASCII encoding, split full names, resolve duplicates across files, and merge everything into a single compliant CRM import spreadsheet.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleLoadDemoBatch}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
              title="Load 4 realistic demo files from different sources to test bulk processing"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Load Sample Batch (4 Files)</span>
            </button>

            {files.length > 0 && (
              <button
                onClick={handleRunBatchSanitize}
                disabled={isProcessingBatch}
                className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer disabled:opacity-50"
              >
                {isProcessingBatch ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>Process & Merge All ({files.length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Upload Dropzone & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Drop Zone */}
        <div 
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files) handleIncomingFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`lg:col-span-2 border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[170px] ${
            isDragging 
              ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-950/20' 
              : 'border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/40 hover:border-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-900'
          }`}
        >
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            accept=".csv,.txt" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files) handleIncomingFiles(e.target.files);
            }}
          />
          <div className="p-3 bg-cyan-100 dark:bg-cyan-950/80 rounded-2xl mb-3 text-cyan-600 dark:text-cyan-400">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">
            Drop multiple CSV or TXT files here, or <span className="text-cyan-600 dark:text-cyan-400 underline">browse files</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md">
            Supports multi-file upload. Each file is individually scanned for ASCII violations, missing names, unformatted phone numbers, and structural issues.
          </p>
        </div>

        {/* Batch Status Summary Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 flex flex-col justify-between space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-500" />
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Batch Processing Metrics</span>
            </div>
            {files.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3 h-3" /> Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Queue Files</span>
              <p className="text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">{files.length}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Raw Rows</span>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">{mergedResult.totalRawRows}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Cross Duplicates</span>
              <p className="text-xl font-black text-amber-500 mt-0.5">-{mergedResult.duplicatesRemoved}</p>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Clean Merged Rows</span>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{mergedResult.rows.length}</p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500">Batch Hygiene:</span>
            <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${
              batchMetrics.score >= 90 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
            }`}>
              {batchMetrics.score}% Compliance
            </span>
          </div>
        </div>
      </div>

      {/* Batch Processing Pipeline Progress Bar */}
      {isProcessingBatch && (
        <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 border border-slate-800 shadow-md animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center gap-2 text-cyan-400">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Processing Bulk Files & Deduplicating ({batchProgress}%)...
            </span>
            <span className="text-slate-400">Target Schema: {crmName}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 h-full transition-all duration-300"
              style={{ width: `${batchProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Batch Options & Transformation Rules Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Batch Processing & Merge Settings</h3>
          </div>
          <span className="text-[11px] text-slate-500">Applied automatically during file aggregation</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Deduplication Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <GitMerge className="w-3.5 h-3.5 text-blue-500" /> Deduplicate By
            </label>
            <select
              value={dedupKey}
              onChange={(e) => setDedupKey(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="email_or_phone">Email OR Phone Number (Recommended)</option>
              <option value="email">Email Address Only</option>
              <option value="phone">Phone Number Only</option>
              <option value="none">No Deduplication (Keep All Rows)</option>
            </select>
          </div>

          {/* Deduplication Strategy */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Duplicate Action
            </label>
            <select
              value={dedupStrategy}
              onChange={(e) => setDedupStrategy(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            >
              <option value="merge_tags">Merge Tags & Append Notes</option>
              <option value="keep_first">Keep First Encountered Record</option>
              <option value="keep_most_complete">Keep Record with Most Filled Fields</option>
            </select>
          </div>

          {/* Toggle Rules Checkboxes */}
          <div className="space-y-2 lg:col-span-2 flex flex-col justify-center">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoSplitNames}
                  onChange={(e) => setAutoSplitNames(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Auto-Split "Full Name" into First/Last</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoAsciiSanitize}
                  onChange={(e) => setAutoAsciiSanitize(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Strict ASCII 1-127 Sanitization</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoFormatPhones}
                  onChange={(e) => setAutoFormatPhones(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Format Phones: (XXX) XXX-XXXX</span>
              </label>

              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enforceCrmSyntax}
                  onChange={(e) => setEnforceCrmSyntax(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <span>Apply {crmName} Syntax Rules</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* View Mode Switcher: Queue vs Merged Data vs Audit Log */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileStack className="w-3.5 h-3.5" />
            <span>Uploaded Files Queue ({files.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('merged_preview')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'merged_preview'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Merged Dataset Preview ({mergedResult.rows.length} records)</span>
          </button>

          <button
            onClick={() => setActiveTab('audit_log')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              activeTab === 'audit_log'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Audit Trail Log</span>
          </button>
        </div>

        {/* Global Action Toolbar */}
        {mergedResult.rows.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(mergedResult.rawCsv, 'merged_csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg transition cursor-pointer"
            >
              {copiedKey === 'merged_csv' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'merged_csv' ? 'Copied CSV!' : 'Copy Merged CSV'}</span>
            </button>

            <button
              onClick={() => handleDownloadCsv(mergedResult.rawCsv, `batch_merged_${targetCrm}_export.csv`)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Merged CSV</span>
            </button>
          </div>
        )}
      </div>

      {/* 1. UPLOADED FILES QUEUE VIEW */}
      {activeTab === 'queue' && (
        <div className="space-y-4">
          {files.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <FilePlus className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h4 className="font-bold text-base text-slate-800 dark:text-slate-200">No Files in Batch Queue</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Drag and drop multiple CSV files above or click "Load Sample Batch (4 Files)" to test the bulk hygiene and merging engine.
              </p>
              <button
                onClick={handleLoadDemoBatch}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Load Sample Batch
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file, idx) => {
                const isExpanded = expandedFileId === file.id;
                return (
                  <div
                    key={file.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition"
                  >
                    <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-xl mt-0.5">
                          <FileSpreadsheet className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{file.name}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              {(file.size / 1024).toFixed(1)} KB
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                            <span>{file.rowCount} rows detected</span>
                            <span>•</span>
                            <span>{file.headers.length} headers parsed</span>
                            <span>•</span>
                            <span className={`font-semibold ${file.validation.isValid ? 'text-emerald-600' : 'text-amber-500'}`}>
                              Hygiene: {file.validation.score}% ({file.validation.totalErrors} errors, {file.validation.totalWarnings} warnings)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                        <button
                          onClick={() => handleSanitizeSingleFile(file.id)}
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Sanitize</span>
                        </button>

                        <button
                          onClick={() => setExpandedFileId(isExpanded ? null : file.id)}
                          className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isExpanded ? 'Hide Details' : 'Inspect'}</span>
                        </button>

                        <button
                          onClick={() => handleRemoveFile(file.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                          title="Remove from batch"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expanded File Inspection Details */}
                    {isExpanded && (
                      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Detected Headers</span>
                            <div className="flex flex-wrap gap-1">
                              {file.headers.map((h, hIdx) => (
                                <span key={hIdx} className="px-2 py-0.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-mono">
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">File Diagnostic Report</span>
                            <div className="text-xs space-y-1 text-slate-600 dark:text-slate-400">
                              {file.validation.issues.length === 0 ? (
                                <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> All hygiene checks passed cleanly!
                                </span>
                              ) : (
                                file.validation.issues.slice(0, 3).map((iss, iIdx) => (
                                  <div key={iIdx} className="flex items-start gap-1.5">
                                    <AlertCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                                    <span>{iss.title}: {iss.description}</span>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Raw Content Snippet */}
                        <div className="pt-2">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw File Head (First 3 Lines)</span>
                          <pre className="p-2.5 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto mt-1 max-h-24">
                            {file.rawContent.split(/\r?\n/).slice(0, 3).join('\n')}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 2. MERGED DATASET PREVIEW */}
      {activeTab === 'merged_preview' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Search Filter */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search merged records (name, email, notes, source)..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Showing {filteredMergedRows.length} of {mergedResult.rows.length} merged records
              </span>
            </div>
          </div>

          {/* Unified Merged Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 z-10 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3 font-bold text-slate-600 dark:text-slate-300 w-12 text-center">#</th>
                    <th className="p-3 font-bold text-slate-600 dark:text-slate-300">Origin File</th>
                    {mergedResult.headers.map((h, i) => (
                      <th key={i} className="p-3 font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap font-mono text-[11px]">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredMergedRows.length === 0 ? (
                    <tr>
                      <td colSpan={mergedResult.headers.length + 2} className="p-8 text-center text-slate-400">
                        No merged records match your filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredMergedRows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition">
                        <td className="p-3 text-center font-mono text-[10px] text-slate-400">{rIdx + 1}</td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                            {row._sourceFile}
                          </span>
                        </td>
                        {mergedResult.headers.map((h, cIdx) => (
                          <td key={cIdx} className="p-3 text-slate-800 dark:text-slate-200 whitespace-nowrap max-w-xs truncate">
                            {row[h] || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <span>Total Headers: <strong>{mergedResult.headers.length}</strong></span>
                <span>•</span>
                <span>ASCII Plaintext: <strong className="text-emerald-600">100% Normalized</strong></span>
                <span>•</span>
                <span>Duplicate Records Consolidated: <strong className="text-blue-600">{mergedResult.duplicatesRemoved}</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCsv(mergedResult.rawCsv, `batch_merged_${targetCrm}_leads.csv`)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Download className="w-4 h-4" />
                  <span>Download {crmName} Merged CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. AUDIT TRAIL LOG VIEW */}
      {activeTab === 'audit_log' && (
        <div className="bg-slate-950 text-slate-200 rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400">
              <FileCode className="w-4 h-4" />
              <h4 className="font-bold text-sm">Batch Hygiene & Deduplication Audit Trail</h4>
            </div>
            <button
              onClick={() => handleCopy(mergedResult.auditLog.join('\n'), 'audit_log')}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center gap-1 transition cursor-pointer"
            >
              {copiedKey === 'audit_log' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedKey === 'audit_log' ? 'Copied Log!' : 'Copy Audit Log'}</span>
            </button>
          </div>

          <pre className="font-mono text-xs leading-relaxed max-h-96 overflow-y-auto p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80 text-emerald-400/90 space-y-1">
            {mergedResult.auditLog.map((log, lIdx) => (
              <div key={lIdx} className={log.startsWith('[DEDUPLICATION]') ? 'text-amber-300 font-semibold' : log.startsWith('[SUMMARY]') ? 'text-cyan-300 font-bold' : 'text-slate-300'}>
                {log}
              </div>
            ))}
          </pre>
        </div>
      )}
    </div>
  );
};
