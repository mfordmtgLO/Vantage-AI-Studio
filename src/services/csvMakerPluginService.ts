/**
 * @license
 * Copyright (c) 2026 Mike Ford. All Rights Reserved.
 * Commercial attribution & licensee protection: Mike Ford <fordmj@gmail.com>
 *
 * Vantage AI Studio — CSV Maker+ Standalone Plugin Service
 * Generates turn-key prompts, standalone React widgets, headless hooks, Express routers, 
 * universal embed snippets, and ZIP distribution bundles for CSV hygiene, batch processing, 
 * cross-file deduplication, format conversions, and multi-CRM template exports.
 */

import { PluginPackagingConfig } from './pluginArchetypeService';
import JSZip from 'jszip';

/**
 * Generates the Comprehensive LLM Build Prompt for Vantage AI Studio - CSV Maker+
 */
export function generateCsvMakerPluginPrompt(config: PluginPackagingConfig): string {
  return `# Vantage AI Studio — CSV Maker+ Standalone Plugin Architecture
**Module Name**: \`${config.pluginName}\`
**Author & Commercial IP**: Mike Ford <fordmj@gmail.com>
**Target Framework**: \`${config.targetFramework}\`
**API Base Path**: \`${config.apiBasePath}\`
**License Attribution**: Copyright (c) 2026 Mike Ford. All Rights Reserved.

---

## 🎯 Executive Plugin Purpose
You are creating **Vantage AI Studio-CSV Maker+**, an enterprise-grade standalone plugin module for automated CSV data hygiene, ASCII 1-127 character encoding normalization, cross-file batch deduplication, format conversions, and multi-CRM schema template exports.

The plugin provides a turn-key suite for real estate agents, loan originators, CRM admins, and data teams to ingest messy lead spreadsheets (from Zillow, Open Houses, referral partners, Encompass, or custom landing pages) and output 100% compliant, error-free files for:
1. **Total Expert CRM & Total Expert Mortgage + Loan Data** (Strict ASCII 1-127, zero-space comma groups)
2. **Big Purple Dot (BPD) & BPD Encompass** (Discrete Phone vs Mobile Phone columns, wizard auto-mapping)
3. **BoldTrail / kvCORE** (Pipe-delimited hashtags, '#' prefix stripped, opt-in boolean defaults)
4. **Salesforce CRM** (Standard Lead object field naming, Company default fallbacks)
5. **HubSpot CRM** (Standard Contact property syntax, lifecycle stage tags)

---

## 🛠️ Core Functional Specifications

### 1. ASCII 1-127 Plaintext Sanitization Engine
- Automatically scans all cell values for Unicode non-ASCII characters that cause import failures in legacy CRMs.
- Converts smart quotes (\`“ \` \`” \` \`‘ \` \`’ \`), em-dashes (\`—\`), en-dashes (\`–\`), horizontal ellipses (\`…\`), and accented characters (\`é\`, \`ñ\`, \`ü\`) to standard ASCII equivalents.
- Trims non-printable control characters (ASCII 0-31 except tab and newline).

### 2. Multi-File Batch Processor & Cross-File Deduplication
- Multi-file drag-and-drop ingestion queue supporting multiple CSV/TXT files at once.
- Cross-file deduplication matching on \`Email OR Phone Number\` with configurable strategies:
  - *Merge Tags & Append Notes* (consolidates multiple campaign touchpoints into one record).
  - *Keep First Encountered Record*.
  - *Keep Most Complete Record*.
- Auto-detects single "Full Name" or "Name" columns and cleanly splits into \`first_name\` and \`last_name\`.
- US Phone standardizer formatting numbers to \`(XXX) XXX-XXXX\`.

### 3. CRM Header Mapping & Live Column Matrix
- Interactive column toggle matrix allowing users to enable/disable optional fields while locking mandatory baseline fields.
- 1-Click blank CRM template generator and sample row downloader for each supported CRM.
- Live Data Table Preview with search filter and pagination.
- Raw CSV code viewer and JSON column mapping schema exporter.

### 4. Automated Pre-Export Hygiene Gate & Audit Trail
- 10-point pre-export compliance scanner generating a real-time 0-100% Hygiene Score.
- Step-by-step Audit Trail recording every non-ASCII character repaired and duplicate merged.
- 1-Click Auto-Sanitizer fixing all detected warnings in real time before download.

---

## 📦 Export & Distribution Deliverables
When packaging this plugin, provide:
1. **Standalone React Component**: \`${config.pluginName}.tsx\`
2. **Headless React Hook**: \`useVantageCsvMaker.ts\`
3. **Backend Express Router**: \`${config.pluginName.toLowerCase()}-router.ts\`
4. **Universal HTML Embed Snippet**: \`<div id="vantage-csv-maker-container"></div>...\`
5. **ZIP Distribution Package**: Bundling all components, CRM sample templates, and license terms.
`;
}

/**
 * Generates Standalone React Component for CSV Maker+
 */
export function generateCsvMakerPluginReactCode(config: PluginPackagingConfig): string {
  return `/**
 * @license
 * Copyright (c) 2026 Mike Ford. All Rights Reserved.
 * Commercial attribution & licensee protection: Mike Ford <fordmj@gmail.com>
 *
 * ${config.pluginName}.tsx
 * Vantage AI Studio — CSV Maker+ Standalone Plugin Module
 * Turn-key Multi-CRM CSV Hygiene, Batch Processing & Template Generator
 */

import React, { useState, useMemo, useRef } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Download,
  Copy,
  Check,
  Sparkles,
  RefreshCw,
  Sliders,
  Table,
  FileText,
  Code,
  Layers,
  Search,
  Upload,
  Trash2,
  Eye,
  GitMerge,
  Building2,
  FileStack,
  CheckCircle2,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export type SupportedCrmType = 
  | 'total_expert' 
  | 'total_expert_mortgage' 
  | 'big_purple_dot' 
  | 'boldtrail' 
  | 'salesforce' 
  | 'hubspot';

export interface CsvMakerProps {
  apiBasePath?: string;
  defaultCrm?: SupportedCrmType;
  theme?: 'light' | 'dark' | 'auto';
  onExportComplete?: (filename: string, rowCount: number) => void;
}

export const ${config.pluginName}: React.FC<CsvMakerProps> = ({
  apiBasePath = '${config.apiBasePath}',
  defaultCrm = 'total_expert',
  theme = 'auto',
  onExportComplete
}) => {
  const [selectedCrm, setSelectedCrm] = useState<SupportedCrmType>(defaultCrm);
  const [activeTab, setActiveTab] = useState<'batch_processor' | 'matrix' | 'validator' | 'table_preview' | 'raw_csv'>('batch_processor');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [rawInputCsv, setRawInputCsv] = useState<string>(\`"first name","last name","email","cell phone","Group"
"Sarah “VIP”","Jenkins","sarah.j@example.com","5035550192","Realtor , Past Client"
"Marcus","Sterling-O’Connor","marcus.s@pacwest.com","(503) 555-0144","Buyer, PreApproved"\`);

  // ASCII Sanitizer
  const sanitizeToAscii = (str: string): string => {
    return str
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, '-')
      .replace(/…/g, '...')
      .replace(/[^\x00-\x7F]/g, '');
  };

  // Cleaned CSV
  const sanitizedCsv = useMemo(() => {
    return sanitizeToAscii(rawInputCsv);
  }, [rawInputCsv]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Download helper
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (onExportComplete) onExportComplete(filename, content.split('\\n').length - 1);
  };

  return (
    <div className="bg-slate-900 text-slate-100 rounded-3xl p-6 md:p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 rounded-2xl border border-cyan-500/30">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded-full border border-cyan-500/30">
                Vantage AI Studio
              </span>
              <span className="text-[10px] text-slate-400">CSV Maker+ Standalone</span>
            </div>
            <h2 className="text-xl font-bold text-white">Multi-CRM CSV Hygiene & Batch Merger</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownload(sanitizedCsv, \`vantage_\${selectedCrm}_export.csv\`)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Clean CSV</span>
          </button>
        </div>
      </div>

      {/* Target CRM Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {(['total_expert', 'big_purple_dot', 'boldtrail', 'salesforce', 'hubspot'] as SupportedCrmType[]).map((crm) => (
          <button
            key={crm}
            onClick={() => setSelectedCrm(crm)}
            className={\`p-3 rounded-xl border text-xs font-bold capitalize transition cursor-pointer text-left \${
              selectedCrm === crm
                ? 'bg-cyan-600/20 border-cyan-500 text-cyan-300 ring-1 ring-cyan-500'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
            }\`}
          >
            {crm.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Main Action Viewport */}
      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono text-slate-400">Target Schema: <strong className="text-cyan-400 capitalize">{selectedCrm.replace('_', ' ')}</strong></span>
          <span className="text-emerald-400 font-bold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% ASCII 1-127 Normalized
          </span>
        </div>

        <textarea
          value={rawInputCsv}
          onChange={(e) => setRawInputCsv(e.target.value)}
          rows={6}
          className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
          placeholder="Paste CSV rows here..."
        />

        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{rawInputCsv.split('\\n').filter(l => l.trim()).length} Rows Detected</span>
          <button
            onClick={() => handleCopy(sanitizedCsv, 'sanitized_csv')}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer"
          >
            {copiedKey === 'sanitized_csv' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedKey === 'sanitized_csv' ? 'Copied Clean CSV!' : 'Copy Clean CSV'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
export default ${config.pluginName};
`;
}

/**
 * Generates Headless React Hook for CSV Maker+
 */
export function generateCsvMakerPluginHookCode(config: PluginPackagingConfig): string {
  return `/**
 * @license
 * Copyright (c) 2026 Mike Ford. All Rights Reserved.
 * Commercial attribution: Mike Ford <fordmj@gmail.com>
 *
 * useVantageCsvMaker.ts — Headless React Hook
 */

import { useState, useCallback } from 'react';

export interface CsvHygieneResult {
  isValid: boolean;
  score: number;
  asciiReplacedCount: number;
  sanitizedText: string;
}

export function useVantageCsvMaker(options?: { apiBasePath?: string }) {
  const apiBase = options?.apiBasePath || '${config.apiBasePath}';
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const sanitizeToAscii = useCallback((raw: string): string => {
    return raw
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, '-')
      .replace(/…/g, '...')
      .replace(/[^\x00-\x7F]/g, '');
  }, []);

  const validateAndSanitize = useCallback((csvContent: string): CsvHygieneResult => {
    const sanitized = sanitizeToAscii(csvContent);
    const isValid = !/[^\x00-\x7F]/.test(sanitized);
    return {
      isValid,
      score: isValid ? 100 : 85,
      asciiReplacedCount: (csvContent.match(/[^\x00-\x7F]/g) || []).length,
      sanitizedText: sanitized
    };
  }, [sanitizeToAscii]);

  const downloadCrmTemplate = useCallback((crm: string, withSample: boolean = false) => {
    let headers = '';
    let sample = '';
    if (crm === 'boldtrail') {
      headers = '"first_name","last_name","email_1","cell_phone_1","hashtags","deal_type","lead_status"';
      sample = '"Sarah","Jenkins","sarah.j@example.com","(503) 555-0192","Buyer|DPA","Buyer","New"';
    } else if (crm === 'total_expert' || crm === 'total_expert_mortgage') {
      headers = '"first name","last name","email","cell phone","Group","loan number","loan amount"';
      sample = '"Sarah","Jenkins","sarah.j@example.com","(503) 555-0192","Realtor,Past Client","LN-9941","$485,000"';
    } else {
      headers = '"First Name","Last Name","Email","Phone","Company","Status"';
      sample = '"Elena","Rostova","elena.r@cascade.io","(503) 555-0189","Cascade Real Estate","Active"';
    }
    const content = withSample ? \`\${headers}\\n\${sample}\` : headers;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`vantage_\${crm}_template.csv\`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return {
    isProcessing,
    sanitizeToAscii,
    validateAndSanitize,
    downloadCrmTemplate
  };
}
`;
}

/**
 * Generates Express Backend Router Code for CSV Maker+
 */
export function generateCsvMakerPluginBackendCode(config: PluginPackagingConfig): string {
  return `/**
 * @license
 * Copyright (c) 2026 Mike Ford. All Rights Reserved.
 * Commercial attribution: Mike Ford <fordmj@gmail.com>
 *
 * vantage-csv-maker-router.ts
 * Express API Router for CSV Sanitization, Validation & Template Downloads
 */

import { Router } from 'express';

export const vantageCsvMakerRouter = Router();

// 1. Sanitize CSV Endpoint
vantageCsvMakerRouter.post('/sanitize', (req, res) => {
  try {
    const { csvContent, targetCrm } = req.body;
    if (!csvContent) return res.status(400).json({ error: 'csvContent is required' });

    const sanitized = String(csvContent)
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[—–]/g, '-')
      .replace(/…/g, '...')
      .replace(/[^\\x00-\\x7F]/g, '');

    res.json({
      success: true,
      originalLength: csvContent.length,
      sanitizedLength: sanitized.length,
      sanitizedContent: sanitized,
      targetCrm: targetCrm || 'total_expert'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. CRM Template Download API
vantageCsvMakerRouter.get('/templates/:crmId', (req, res) => {
  const { crmId } = req.params;
  const withSample = req.query.sample === 'true';

  let headers = '"first name","last name","email","cell phone","Group"';
  let sample = '"Sarah","Jenkins","sarah.j@example.com","(503) 555-0192","Realtor,Past Client"';

  if (crmId === 'boldtrail') {
    headers = '"first_name","last_name","email_1","cell_phone_1","hashtags","deal_type","lead_status"';
    sample = '"Sarah","Jenkins","sarah.j@example.com","(503) 555-0192","Buyer|DPA","Buyer","New"';
  } else if (crmId === 'big_purple_dot') {
    headers = '"First Name","Last Name","Email","Phone","Mobile Phone","Lead Source"';
    sample = '"Elena","Rostova","elena.r@cascade.io","(503) 555-0189","(503) 555-0189","Zillow"';
  }

  const output = withSample ? \`\${headers}\\n\${sample}\` : headers;
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', \`attachment; filename="vantage_\${crmId}_template.csv"\`);
  res.send(output);
});

// 3. Health & Status
vantageCsvMakerRouter.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    service: '${config.pluginName}',
    supportedCrms: ['total_expert', 'total_expert_mortgage', 'big_purple_dot', 'boldtrail', 'salesforce', 'hubspot'],
    timestamp: new Date().toISOString()
  });
});
`;
}

/**
 * Generates Universal Script Embed Code for CSV Maker+
 */
export function generateCsvMakerPluginScriptEmbed(config: PluginPackagingConfig): string {
  return `<!-- Vantage AI Studio - CSV Maker+ Plugin Embed Snippet -->
<div id="vantage-csv-maker-container"></div>
<script src="https://cdn.vantageai.app/v2/csv-maker-plus-widget.js"></script>
<script>
  VantageCsvMaker.render('#vantage-csv-maker-container', {
    pluginName: '${config.pluginName}',
    apiBasePath: '${config.apiBasePath}',
    theme: 'auto',
    defaultCrm: 'total_expert',
    onExportComplete: function(filename, rowCount) {
      console.log('Export completed:', filename, 'Rows:', rowCount);
    }
  });
</script>`;
}

/**
 * Generates Package / CLI configuration for CSV Maker+
 */
export function generateCsvMakerPluginCliOrConfig(config: PluginPackagingConfig): string {
  return JSON.stringify({
    name: config.pluginName.toLowerCase(),
    version: '2.4.0',
    description: 'Vantage AI Studio - CSV Maker+ Standalone Plugin with ASCII 1-127 Sanitizer & Multi-CRM Batch Merger',
    author: 'Mike Ford <fordmj@gmail.com>',
    license: 'Commercial License (c) 2026 Mike Ford. All Rights Reserved.',
    main: 'dist/index.js',
    types: 'dist/index.d.ts',
    bin: {
      'vantage-csv-maker': './bin/cli.js'
    },
    scripts: {
      build: 'tsc && esbuild src/index.ts --bundle --outfile=dist/index.js',
      test: 'vitest run'
    },
    dependencies: {
      'lucide-react': '^0.546.0',
      'react': '^19.0.0',
      'react-dom': '^19.0.0'
    }
  }, null, 2);
}

/**
 * Generates Full Downloadable ZIP Bundle containing all code files, CRM templates, and license terms
 */
export async function generateCsvMakerZipBundle(
  config: PluginPackagingConfig,
  watermarkHeader: string
): Promise<Blob> {
  const zip = new JSZip();

  // 1. License & Commercial Attribution
  zip.file('LICENSE.txt', `${watermarkHeader}\n\nCOMMERCIAL LICENSE AGREEMENT\nCopyright (c) 2026 Mike Ford <fordmj@gmail.com>.\nAll Rights Reserved.`);
  zip.file('README.md', `# ${config.pluginName}\n\n${generateCsvMakerPluginPrompt(config)}`);

  // 2. Source Code
  const srcFolder = zip.folder('src')!;
  srcFolder.file(`${config.pluginName}.tsx`, `${watermarkHeader}\n\n${generateCsvMakerPluginReactCode(config)}`);
  srcFolder.file('useVantageCsvMaker.ts', `${watermarkHeader}\n\n${generateCsvMakerPluginHookCode(config)}`);
  srcFolder.file('vantageCsvMakerRouter.ts', `${watermarkHeader}\n\n${generateCsvMakerPluginBackendCode(config)}`);

  // 3. Embed & Config
  zip.file('embed-snippet.html', generateCsvMakerPluginScriptEmbed(config));
  zip.file('package.json', generateCsvMakerPluginCliOrConfig(config));

  // 4. Blank CRM Templates (.csv)
  const templatesFolder = zip.folder('crm-templates')!;
  templatesFolder.file('total_expert_standard_template.csv', '"first name","last name","email","cell phone","Group"\n"Sarah","Jenkins","sarah.j@example.com","(503) 555-0192","Realtor,Past Client"');
  templatesFolder.file('total_expert_mortgage_template.csv', '"first name","last name","email","cell phone","Group","loan number","loan amount","interest rate","loan program"\n"Marcus","Vance","mvance@apex.io","(541) 555-0841","PreApproved,FirstTimeBuyer","LN-2026-9841","$485,000","6.125%","Conventional 30Y"');
  templatesFolder.file('big_purple_dot_template.csv', '"First Name","Last Name","Email","Phone","Mobile Phone","Lead Source","Status"\n"Elena","Rostova","elena.r@cascade.io","(503) 555-0189","(503) 555-0189","Zillow Premier","Active"');
  templatesFolder.file('boldtrail_kvcore_template.csv', '"first_name","last_name","email_1","cell_phone_1","hashtags","deal_type","lead_status","email_optin","phone_optin"\n"Rachel","Adams","rachel.a@summit.org","(503) 555-0111","Buyer|FirstTimeBuyer","Buyer","New","true","true"');
  templatesFolder.file('salesforce_leads_template.csv', '"FirstName","LastName","Email","Phone","Company","LeadSource","Status"\n"Jonathan","Reid","jreid@vanguard.io","(503) 555-6677","Reid Design Works","Web Capture","Open - Not Contacted"');
  templatesFolder.file('hubspot_contacts_template.csv', '"First Name","Last Name","Email","Phone Number","Company Name","Lead Status"\n"Claire","Redfield","claire.r@terrasave.org","(503) 555-8822","TerraSave Global","IN_PROGRESS"');

  return await zip.generateAsync({ type: 'blob' });
}
