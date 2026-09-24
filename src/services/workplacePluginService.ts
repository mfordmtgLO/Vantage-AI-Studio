import { PluginPackagingConfig } from './pluginArchetypeService';

/**
 * Generates the master LLM Build Mode Prompt for the Vantage AI Studio-Workspace UI Plugin Module
 */
export function generateWorkplaceUIPrompt(config: PluginPackagingConfig): string {
  return `<!-- ========================================================================= -->
<!-- 🏢 VANTAGE AI STUDIO-WORKSPACE UI PLUGIN MODULE -->
<!-- Transferable Modular Workspace Cockpit, CSV Hygiene & Multi-CRM Exporter -->
<!-- Author: Mike Ford <fordmj@gmail.com> -->
<!-- ========================================================================= -->

<instructions_for_ai_builder>
You are an expert enterprise frontend and full-stack systems architect. You must build, containerize, and integrate
the complete "${config.pluginName}" transferable plugin archetype into the target website or application.

This plugin delivers a plug-and-play **Vantage AI Studio-Workspace UI Plugin Module** featuring:
1. Unified Multi-App Cockpit: Logic Orchestrator, Gmail Drafts & Review, Google Drive Explorer, Google Sheets Automation, Calendar & Tasks, Contacts, and Multi-CRM Export Studio.
2. Enterprise CSV Cleanup & Hygiene Validator:
   - Real-time ASCII (1–127) compliance verification (flags smart quotes, em-dashes, accented characters, emojis).
   - Mandatory header verification (First Name / Last Name split enforcement).
   - Format normalization (US phone numbers, RFC emails, row length consistency).
   - 1-Click Auto-Sanitize remediation engine.
3. Multi-CRM Column Header Mapping & Blank Template Downloader:
   - Total Expert (ASCII strict, zero-space comma tags, mortgage schemas).
   - Big Purple Dot (Discrete phone/mobile, Encompass ERDB alignment).
   - BoldTrail / kvCORE (Pipe-delimited hashtags '#' free, explicit opt-in booleans).
   - Salesforce & HubSpot (Company name requirements, lifecycle stages).
   - 1-Click "Download CRM Template" button for blank CSV files matching exact CRM importer requirements.
4. Embeddable Standalone React Widget (\`<${config.pluginName} />\`) with responsive theme support.
5. Headless Workspace State Hook (\`useVantageWorkplace\`) with CRM validation and template helpers.
6. Backend API Integration Router (\`${config.apiBasePath}\`) with CRM validation endpoints.
</instructions_for_ai_builder>

<plugin_configuration_metadata>
{
  "pluginName": "${config.pluginName}",
  "apiBasePath": "${config.apiBasePath}",
  "targetFramework": "${config.targetFramework}",
  "persistenceAdapter": "${config.persistenceAdapter}",
  "tabs": ["orchestrator", "crm_export", "drafts", "drive", "sheets", "tasks", "calendar", "contacts"],
  "themeSync": true,
  "defaultView": "crm_export",
  "supportedCrms": ["total_expert", "big_purple_dot", "boldtrail", "salesforce", "hubspot"]
}
</plugin_configuration_metadata>
`;
}

/**
 * Generates Standalone React Component Code for VantageWorkplaceUIPlugin
 */
export function generateWorkplaceUIReactCode(config: PluginPackagingConfig): string {
  return `/**
 * ${config.pluginName}.tsx
 * Vantage AI Studio — Workspace UI Plugin Module with CSV Hygiene & Multi-CRM Exporter
 * Copyright (c) 2026 Mike Ford <fordmj@gmail.com>. All Rights Reserved.
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Layers, 
  Mail, 
  HardDrive, 
  Calendar, 
  Table, 
  CheckSquare, 
  Users, 
  Play, 
  CheckCircle2, 
  Clock, 
  RefreshCw, 
  ChevronRight, 
  ExternalLink,
  Shield,
  ShieldCheck,
  Search,
  Activity,
  AlertCircle,
  Download,
  FileSpreadsheet,
  FileText,
  Sliders,
  Sparkles,
  Zap
} from 'lucide-react';

export type TargetCrm = 'total_expert' | 'big_purple_dot' | 'boldtrail' | 'salesforce' | 'hubspot';

export interface VantageWorkplaceUIProps {
  apiBasePath?: string;
  theme?: 'light' | 'dark' | 'auto';
  initialTab?: 'orchestrator' | 'crm_export' | 'drafts' | 'drive' | 'sheets' | 'tasks';
  connectedUserEmail?: string;
  onWorkflowTrigger?: (workflowName: string) => void;
  className?: string;
}

const CRM_DEFINITIONS: Record<TargetCrm, { name: string; filename: string; headers: string[] }> = {
  total_expert: {
    name: 'Total Expert CRM',
    filename: 'total_expert_export.csv',
    headers: ['first name', 'last name', 'email', 'cell phone', 'address', 'city', 'state', 'zip', 'Group', 'loan number', 'loan amount']
  },
  big_purple_dot: {
    name: 'Big Purple Dot CRM',
    filename: 'big_purple_dot_export.csv',
    headers: ['First Name', 'Last Name', 'Email', 'Phone', 'Mobile Phone', 'Street Address', 'City', 'State', 'Zip Code', 'Lead Source', 'Status']
  },
  boldtrail: {
    name: 'BoldTrail (kvCORE)',
    filename: 'boldtrail_lead_dropbox.csv',
    headers: ['first_name', 'last_name', 'email_1', 'cell_phone_1', 'hashtags', 'deal_type', 'lead_status', 'lead_source', 'email_optin', 'phone_optin', 'text_optin']
  },
  salesforce: {
    name: 'Salesforce CRM',
    filename: 'salesforce_lead_export.csv',
    headers: ['FirstName', 'LastName', 'Email', 'Phone', 'Company', 'LeadSource', 'Status', 'Street', 'City', 'State', 'PostalCode']
  },
  hubspot: {
    name: 'HubSpot CRM',
    filename: 'hubspot_contact_export.csv',
    headers: ['First Name', 'Last Name', 'Email', 'Phone Number', 'Company Name', 'Lead Status', 'City']
  }
};

export const ${config.pluginName}: React.FC<VantageWorkplaceUIProps> = ({
  apiBasePath = '${config.apiBasePath}',
  theme = 'auto',
  initialTab = 'crm_export',
  connectedUserEmail = 'user@workspace.com',
  onWorkflowTrigger,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'orchestrator' | 'crm_export' | 'drafts' | 'drive' | 'sheets' | 'tasks'>(initialTab);
  const [selectedCrm, setSelectedCrm] = useState<TargetCrm>('total_expert');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const crmConfig = CRM_DEFINITIONS[selectedCrm];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Helper: Download Blank CSV Template
  const handleDownloadCrmTemplate = (crmKey: TargetCrm, includeSample: boolean = false) => {
    const config = CRM_DEFINITIONS[crmKey];
    const headerRow = config.headers.map(h => \`"\${h}"\`).join(',');
    let content = headerRow;

    if (includeSample) {
      const sampleValues: Record<string, string> = {
        'first name': 'Claire', 'last name': 'Redfield', 'First Name': 'Claire', 'Last Name': 'Redfield',
        'first_name': 'Claire', 'last_name': 'Redfield', 'FirstName': 'Claire', 'LastName': 'Redfield',
        'email': 'claire.r@terrasave.org', 'Email': 'claire.r@terrasave.org', 'email_1': 'claire.r@terrasave.org',
        'cell phone': '(503) 555-0144', 'Phone': '(503) 555-0144', 'Mobile Phone': '(503) 555-0144',
        'cell_phone_1': '(503) 555-0144', 'Phone Number': '(503) 555-0144',
        'Group': 'Realtor,Past Client', 'hashtags': 'Realtor|Buyer|DPA-Grant',
        'email_optin': 'true', 'phone_optin': 'true', 'text_optin': 'true',
        'Company': 'TerraSave Global', 'Company Name': 'TerraSave Global', 'Status': 'Open - Not Contacted'
      };
      const sampleRow = config.headers.map(h => \`"\${sampleValues[h] || 'Sample Data'}"\`).join(',');
      content = \`\${headerRow}\\n\${sampleRow}\`;
    }

    const filename = includeSample ? \`sample_\${config.filename}\` : \`template_\${config.filename}\`;
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(\`Downloaded \${config.name} \${includeSample ? 'Sample' : 'Blank'} Template (.csv)\`);
  };

  return (
    <div className={\`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden \${className}\`}>
      {/* Toast */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white p-3 text-xs font-bold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{toastMessage}</span>
          </div>
          <span className="text-[10px] bg-emerald-700 px-2 py-0.5 rounded-full">ASCII Compliant</span>
        </div>
      )}

      {/* Header Cockpit Strip */}
      <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">${config.pluginName}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-400/20">
                Workspace UI & CRM Studio
              </span>
            </div>
            <p className="text-xs text-slate-400">Connected: <span className="text-slate-200 font-medium">{connectedUserEmail}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleDownloadCrmTemplate(selectedCrm, false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Download CRM Template</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 gap-1.5">
        {[
          { id: 'crm_export', label: 'CRM Export & Hygiene', icon: FileSpreadsheet },
          { id: 'orchestrator', label: 'Logic Orchestrator', icon: Layers },
          { id: 'drafts', label: 'Gmail Drafts', icon: Mail },
          { id: 'drive', label: 'Drive Explorer', icon: HardDrive },
          { id: 'sheets', label: 'Sheets Automation', icon: Table },
          { id: 'tasks', label: 'Tasks & Calendar', icon: Calendar }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={\`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer \${
                isActive 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
              }\`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="p-6">
        {activeTab === 'crm_export' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                  <ShieldCheck className="w-4 h-4" /> Multi-CRM Header Mapper & Pre-Export Validator
                </div>
                <h4 className="text-lg font-bold">1-Click CRM Importer Compliance</h4>
                <p className="text-xs text-slate-300">Format lead columns for Total Expert, Big Purple Dot, BoldTrail, Salesforce, and HubSpot.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadCrmTemplate(selectedCrm, false)}
                  className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md cursor-pointer transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Blank Template</span>
                </button>
                <button
                  onClick={() => handleDownloadCrmTemplate(selectedCrm, true)}
                  className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/20 cursor-pointer transition"
                >
                  With Sample Row
                </button>
              </div>
            </div>

            {/* Target CRM Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(CRM_DEFINITIONS) as TargetCrm[]).map(key => {
                const def = CRM_DEFINITIONS[key];
                const isSel = selectedCrm === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedCrm(key)}
                    className={\`p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between \${
                      isSel ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                    }\`}
                  >
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100">{def.name}</h5>
                      <p className="text-[11px] font-mono text-slate-400 mt-1">{def.filename}</p>
                    </div>
                    <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">{def.headers.length} headers</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadCrmTemplate(key, false);
                        }}
                        className="px-2 py-0.5 bg-white dark:bg-slate-700 text-cyan-600 dark:text-cyan-300 font-bold rounded border border-slate-200 dark:border-slate-600 flex items-center gap-1 hover:bg-cyan-50"
                      >
                        <Download className="w-2.5 h-2.5" /> Template
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Header Preview Table */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="p-3 bg-slate-100 dark:bg-slate-800/80 font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Exact System Headers for {crmConfig.name}</span>
                <span className="text-[11px] font-mono text-slate-500">ASCII Enforced</span>
              </div>
              <div className="p-4 flex flex-wrap gap-1.5 bg-slate-50 dark:bg-slate-950">
                {crmConfig.headers.map((h, i) => (
                  <span key={i} className="px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono font-semibold">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orchestrator' && (
          <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Layers className="w-8 h-8 text-blue-500 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Logic Orchestrator</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Trigger multi-step AI tasks across Google Workspace and CRM destinations.</p>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Mail className="w-8 h-8 text-blue-500 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Gmail Drafts Review</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">AI staged drafts are prepared with guardrail validation before delivery.</p>
          </div>
        )}

        {activeTab === 'drive' && (
          <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <HardDrive className="w-8 h-8 text-indigo-500 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Google Drive Explorer</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Real-time Drive document search, template injection, and PDF summary exports.</p>
          </div>
        )}

        {activeTab === 'sheets' && (
          <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Table className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Google Sheets Automation</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Automated row appending, CRM sync, and financial calculation formulas.</p>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="p-8 text-center space-y-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Calendar className="w-8 h-8 text-amber-500 mx-auto" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Tasks & Calendar Sync</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">Two-way synchronization for scheduled team briefings and milestone tasks.</p>
          </div>
        )}
      </div>
    </div>
  );
};`;
}

/**
 * Generates Headless React Hook code for Workplace UI Plugin
 */
export function generateWorkplaceUIHookCode(config: PluginPackagingConfig): string {
  return `import { useState, useCallback } from 'react';

export function useVantageWorkplace(options?: { apiBasePath?: string }) {
  const apiBase = options?.apiBasePath || '${config.apiBasePath}';
  const [activeTab, setActiveTab] = useState<'crm_export' | 'orchestrator' | 'drafts' | 'drive' | 'sheets' | 'tasks'>('crm_export');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);

  const validateCsvHygiene = useCallback(async (csvText: string, targetCrm: string) => {
    const res = await fetch(\`\${apiBase}/crm/validate-hygiene\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ csvText, targetCrm })
    });
    return res.json();
  }, [apiBase]);

  const downloadCrmTemplate = useCallback((targetCrm: string, includeSample: boolean = false) => {
    window.location.href = \`\${apiBase}/crm/templates/\${targetCrm}?sample=\${includeSample}\`;
  }, [apiBase]);

  return {
    activeTab,
    setActiveTab,
    isExecuting,
    validateCsvHygiene,
    downloadCrmTemplate
  };
}`;
}

/**
 * Generates Backend Router Code for Workplace UI Plugin
 */
export function generateWorkplaceUIBackendCode(config: PluginPackagingConfig): string {
  return `import express from 'express';

export const vantageWorkplaceRouter = express.Router();

// 1. CRM Template Download Endpoint
vantageWorkplaceRouter.get('/crm/templates/:crm', (req, res) => {
  const { crm } = req.params;
  const sample = req.query.sample === 'true';
  
  const headersMap: Record<string, string[]> = {
    total_expert: ['first name', 'last name', 'email', 'cell phone', 'address', 'city', 'state', 'zip', 'Group'],
    big_purple_dot: ['First Name', 'Last Name', 'Email', 'Phone', 'Mobile Phone', 'Street Address', 'City', 'State', 'Zip Code'],
    boldtrail: ['first_name', 'last_name', 'email_1', 'cell_phone_1', 'hashtags', 'deal_type', 'lead_status', 'email_optin', 'phone_optin', 'text_optin']
  };

  const headers = headersMap[crm] || headersMap.total_expert;
  const headerRow = headers.map(h => \`"\${h}"\`).join(',');
  let csv = headerRow;

  if (sample) {
    const sampleRow = headers.map(() => '"Sample Value"').join(',');
    csv = \`\${headerRow}\\n\${sampleRow}\`;
  }

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', \`attachment; filename="\${crm}_template.csv"\`);
  res.send(csv);
});

// 2. CSV Hygiene Validation Endpoint
vantageWorkplaceRouter.post('/crm/validate-hygiene', (req, res) => {
  const { csvText, targetCrm } = req.body;
  if (!csvText) return res.status(400).json({ error: 'csvText is required' });

  // Deep hygiene checks
  const lines = csvText.split(/\\r?\\n/).filter(Boolean);
  const issues = [];
  let nonAsciiCount = 0;

  lines.forEach((line: string, rIdx: number) => {
    for (let cIdx = 0; cIdx < line.length; cIdx++) {
      const code = line.charCodeAt(cIdx);
      if (code > 127) {
        nonAsciiCount++;
      }
    }
  });

  res.json({
    isValid: nonAsciiCount === 0,
    score: nonAsciiCount === 0 ? 100 : Math.max(50, 100 - nonAsciiCount * 5),
    nonAsciiCount,
    rowCount: lines.length
  });
});
`;
}

/**
 * Generates Universal Script Embed Code for Workplace UI Plugin
 */
export function generateWorkplaceUIScriptEmbed(config: PluginPackagingConfig): string {
  return `<!-- Vantage AI Workplace UI Plugin Embed Snippet -->
<div id="vantage-workplace-container"></div>
<script src="https://cdn.vantageai.app/v2/workplace-ui-widget.js"></script>
<script>
  VantageWorkplace.render('#vantage-workplace-container', {
    pluginName: '${config.pluginName}',
    apiBasePath: '${config.apiBasePath}',
    theme: 'auto',
    initialTab: 'crm_export'
  });
</script>`;
}

