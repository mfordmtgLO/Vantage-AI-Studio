import { PluginPackagingConfig } from './pluginArchetypeService';

/**
 * Generates the master LLM Build Mode Prompt for the Vantage AI Studio-Workspace UI Plugin Module
 */
export function generateWorkplaceUIPrompt(config: PluginPackagingConfig): string {
  return `<!-- ========================================================================= -->
<!-- 🏢 VANTAGE AI STUDIO-WORKSPACE UI PLUGIN MODULE -->
<!-- Transferable Modular Workspace Cockpit & Multi-App Orchestrator Architecture -->
<!-- Inject this prompt into Claude / ChatGPT / Gemini / DeepSeek / Cursor -->
<!-- ========================================================================= -->

<instructions_for_ai_builder>
You are an expert enterprise frontend and full-stack systems architect. You must build, containerize, and integrate
the complete "${config.pluginName}" transferable plugin archetype into the target website or application.

This plugin delivers a plug-and-play **Vantage AI Studio-Workspace UI Plugin Module** featuring:
1. Unified Multi-App Cockpit: Logic Orchestrator, Gmail Drafts & Review, Google Drive Explorer, Google Sheets Automation, Calendar & Tasks, and Contacts.
2. Embeddable Standalone React Widget (\`<${config.pluginName} />\`) with responsive light/dark theme support and customizable container branding.
3. Headless Workspace State Hook (\`useVantageWorkplace\`) providing reactive tab switching, workflow run dispatching, connected workspace accounts, and activity telemetry.
4. Backend API Integration Router (\`${config.apiBasePath}\`) proxying workflow automation, draft synchronization, and Drive file lookups.
5. Role-Based Access Control (RBAC) supporting Admin, Operator, and Auditor roles.
</instructions_for_ai_builder>

<plugin_configuration_metadata>
{
  "pluginName": "${config.pluginName}",
  "apiBasePath": "${config.apiBasePath}",
  "targetFramework": "${config.targetFramework}",
  "persistenceAdapter": "${config.persistenceAdapter}",
  "tabs": ["orchestrator", "drafts", "drive", "sheets", "tasks", "calendar", "contacts"],
  "themeSync": true,
  "defaultView": "orchestrator"
}
</plugin_configuration_metadata>

<system_architecture>
The Workplace UI Plugin operates as an independent, modular portal that can be embedded into any dashboard:

┌────────────────────────────────────────────────────────────────────────┐
│                        TARGET HOST APPLICATION                         │
│                                                                        │
│  ┌─────────────────────────────┐    ┌────────────────────────────────┐ │
│  │ <${config.pluginName} />    │    │  const { activeTab, runTask }  │ │
│  │ Embeddable Workspace Cockpit│    │  = useVantageWorkplace()       │ │
│  └──────────────┬──────────────┘    └───────────────┬────────────────┘ │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │         HTTP / JSON-RPC / SSE     │
┌─────────────────▼───────────────────────────────────▼──────────────────┐
│             STANDALONE BACKEND ROUTER (${config.apiBasePath})                  │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌─────────────┐  │
│  │ Workflow Orchestration│  │ Gmail & Drive Sync   │  │ Audit Logs  │  │
│  │ (/workflows/execute)  │  │ (/workspace/sync)    │  │ (/telemetry)│  │
│  └───────────────────────┘  └──────────────────────┘  └─────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
</system_architecture>

<implementation_specifications>
### 1. STANDALONE REACT COMPONENT (\`<${config.pluginName} />\`):
Include:
- Tab strip with icons: Logic Orchestrator, Gmail Drafts, Drive Explorer, Sheets Sync, Tasks, Contacts.
- Workspace Connection status pill with one-click re-auth.
- Interactive workflow card runner with live progress bar and status indicator.
- Action confirmation modal before triggering sensitive destructive actions.

### 2. HEADLESS HOOK (\`useVantageWorkplace\`):
Provide state management for:
- \`activeTab\`: Current selected workplace module.
- \`connectedAccount\`: Email and connection status.
- \`executeWorkflow(workflowId, inputParams)\`: Async workflow execution.
- \`recentActivities\`: Real-time telemetry feed of all workflow runs.

### 3. BACKEND ROUTER (\`${config.apiBasePath}\`):
Expose:
- \`POST ${config.apiBasePath}/workflows/execute\`: Runs workflow pipeline steps.
- \`GET ${config.apiBasePath}/workspace/status\`: Returns connected credentials & quota status.
- \`GET ${config.apiBasePath}/drive/recent\`: Fetches recent files.
- \`POST ${config.apiBasePath}/gmail/drafts\`: Creates or stages email drafts.
</implementation_specifications>
<!-- ========================================================================= -->`;
}

/**
 * Generates Standalone React Component Code for VantageWorkplaceUIPlugin
 */
export function generateWorkplaceUIReactCode(config: PluginPackagingConfig): string {
  return `import React, { useState } from 'react';
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
  Search,
  Activity,
  AlertCircle
} from 'lucide-react';

export interface VantageWorkplaceUIProps {
  apiBasePath?: string;
  theme?: 'light' | 'dark' | 'auto';
  initialTab?: 'orchestrator' | 'drafts' | 'drive' | 'sheets' | 'tasks';
  connectedUserEmail?: string;
  onWorkflowTrigger?: (workflowName: string) => void;
  className?: string;
}

export const ${config.pluginName}: React.FC<VantageWorkplaceUIProps> = ({
  apiBasePath = '${config.apiBasePath}',
  theme = 'auto',
  initialTab = 'orchestrator',
  connectedUserEmail = 'user@workspace.com',
  onWorkflowTrigger,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'orchestrator' | 'drafts' | 'drive' | 'sheets' | 'tasks'>(initialTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [executionLog, setExecutionLog] = useState<string[]>([]);

  const workflows = [
    { id: 'wf_1', name: 'AI Market Research & Executive Brief', desc: 'Scrapes web sources, synthesizes with Gemini, and drafts Gmail summary.', tags: ['Research', 'Gmail'], runs: 142 },
    { id: 'wf_2', name: 'Drive Proposal Generator & Sheets Logger', desc: 'Builds proposal Google Doc from template and appends record to Google Sheets CRM.', tags: ['Drive', 'Sheets'], runs: 89 },
    { id: 'wf_3', name: 'Competitor Intelligence Digest', desc: 'Monitors competitor updates and creates scheduled Google Calendar review session.', tags: ['Calendar', 'AI'], runs: 64 },
    { id: 'wf_4', name: 'Lead Cleanup & Contacts Enrichment', desc: 'Identifies stale leads in Google Contacts and stages re-engagement campaign.', tags: ['Contacts', 'Tasks'], runs: 38 }
  ];

  const filteredWorkflows = workflows.filter(w => 
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    w.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRun = (name: string) => {
    setIsRunning(true);
    setActiveWorkflow(name);
    setExecutionLog([
      \`[1/3] Initializing \${name} pipeline...\`,
      \`[2/3] Querying connected Google Workspace APIs...\`
    ]);

    setTimeout(() => {
      setExecutionLog(prev => [...prev, \`[3/3] Execution completed successfully!\`]);
      setIsRunning(false);
      if (onWorkflowTrigger) onWorkflowTrigger(name);
    }, 1800);
  };

  return (
    <div className={\`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden \${className}\`}>
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
                Workspace Cockpit
              </span>
            </div>
            <p className="text-xs text-slate-400">Connected: <span className="text-slate-200 font-medium">{connectedUserEmail}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold border border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Connected
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 gap-1.5">
        {[
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
        {activeTab === 'orchestrator' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Automated Workflows</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Trigger multi-step AI tasks integrated across your Google Workspace suite.</p>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl w-60 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Workflow List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorkflows.map(wf => (
                <div 
                  key={wf.id}
                  className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4.5 hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-md">
                        {wf.runs} runs recorded
                      </span>
                      <div className="flex gap-1">
                        {wf.tags.map(tag => (
                          <span key={tag} className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <h5 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{wf.name}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{wf.desc}</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Ready
                    </span>
                    <button
                      onClick={() => handleRun(wf.name)}
                      disabled={isRunning}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      {isRunning && activeWorkflow === wf.name ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                      <span>Run Workflow</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Execution Status Log Console */}
            {executionLog.length > 0 && (
              <div className="bg-slate-950 text-emerald-400 p-4 rounded-2xl font-mono text-xs space-y-1.5 border border-slate-800">
                <div className="flex items-center justify-between text-slate-400 text-[11px] pb-1 border-b border-slate-800 font-sans font-bold">
                  <span>Live Workflow Telemetry</span>
                  <span>{activeWorkflow}</span>
                </div>
                {executionLog.map((log, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px]">{new Date().toLocaleTimeString()}</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            )}
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

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  lastRun?: string;
  status: 'idle' | 'running' | 'completed' | 'failed';
}

export function useVantageWorkplace(options?: { apiBasePath?: string }) {
  const apiBase = options?.apiBasePath || '${config.apiBasePath}';
  const [activeTab, setActiveTab] = useState<'orchestrator' | 'drafts' | 'drive' | 'sheets' | 'tasks'>('orchestrator');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<any>(null);

  const executeWorkflow = useCallback(async (workflowName: string, payload?: any) => {
    setIsExecuting(true);
    try {
      const res = await fetch(\`\${apiBase}/workflows/execute\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowName, payload })
      });
      const data = await res.json();
      setLastResult(data);
      return data;
    } catch (err) {
      console.error('Workflow execution failed:', err);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [apiBase]);

  return {
    activeTab,
    setActiveTab,
    isExecuting,
    lastResult,
    executeWorkflow
  };
}`;
}

/**
 * Generates Backend Router Code for Workplace UI Plugin
 */
export function generateWorkplaceUIBackendCode(config: PluginPackagingConfig): string {
  return `import express from 'express';

export const vantageWorkplaceRouter = express.Router();

// 1. Workflow Execution Endpoint
vantageWorkplaceRouter.post('/workflows/execute', async (req, res) => {
  try {
    const { workflowName, payload } = req.body;
    if (!workflowName) return res.status(400).json({ error: 'Workflow name is required' });

    // Execute orchestrated logic (Google Workspace calls or AI synthesis)
    const executionId = 'run_' + Date.now();
    res.json({
      success: true,
      executionId,
      workflowName,
      status: 'completed',
      executedAt: new Date().toISOString(),
      summary: \`Successfully executed \${workflowName}\`
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Workplace Status & Health
vantageWorkplaceRouter.get('/status', (req, res) => {
  res.json({
    status: 'operational',
    service: '${config.pluginName}',
    connectedAPIs: ['gmail', 'drive', 'sheets', 'calendar', 'tasks'],
    timestamp: new Date().toISOString()
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
    initialTab: 'orchestrator'
  });
</script>`;
}
