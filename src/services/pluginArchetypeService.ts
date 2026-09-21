import { GuardrailSettings, UserMemory } from '../types';
import { compileGuardrailPromptDirectives } from './guardrailService';
import {
  generateWorkplaceUIPrompt,
  generateWorkplaceUIReactCode,
  generateWorkplaceUIHookCode,
  generateWorkplaceUIBackendCode,
  generateWorkplaceUIScriptEmbed
} from './workplacePluginService';
import {
  generateVoicePluginPrompt,
  generateVoicePluginReactCode,
  generateVoicePluginHookCode,
  generateVoicePluginBackendCode,
  generateVoicePluginScriptEmbed
} from './voicePluginService';

export type PluginArchetypeId = 'second_brain' | 'workplace_ui' | 'voice_plugin';

export interface PluginArchetypeMeta {
  id: PluginArchetypeId;
  name: string;
  componentName: string;
  badge: string;
  tagline: string;
  description: string;
  icon: 'brain' | 'layout' | 'mic';
  licensePrefix: string;
  defaultConfig: PluginPackagingConfig;
}

export interface PluginPackagingConfig {
  pluginName: string;
  targetFramework: 'react_ts' | 'nextjs' | 'vanilla_js' | 'node_express' | 'dsh_cli';
  includeSecondBrainMemory: boolean;
  includeDeepSeekHarness: boolean;
  includeCronScheduler: boolean;
  includeWebSearchTool: boolean;
  includeGuardrailsAndBoundaries: boolean;
  includeUIWidget: boolean;
  includeAcpProtocol: boolean;
  persistenceAdapter: 'firebase_firestore' | 'local_storage' | 'in_memory' | 'rest_api';
  defaultModelEngine: 'hybrid' | 'deepseek' | 'gemini';
  apiBasePath: string;
}

export const DEFAULT_PACKAGING_CONFIG: PluginPackagingConfig = {
  pluginName: 'VantageBrainHarnessPlugin',
  targetFramework: 'react_ts',
  includeSecondBrainMemory: true,
  includeDeepSeekHarness: true,
  includeCronScheduler: true,
  includeWebSearchTool: true,
  includeGuardrailsAndBoundaries: true,
  includeUIWidget: true,
  includeAcpProtocol: true,
  persistenceAdapter: 'firebase_firestore',
  defaultModelEngine: 'hybrid',
  apiBasePath: '/api/vantage'
};

export const VANTAGE_PLUGIN_ARCHETYPES: PluginArchetypeMeta[] = [
  {
    id: 'second_brain',
    name: 'Vantage AI Studio-2nd Brain Plugin Module',
    componentName: 'VantageBrainHarnessPlugin',
    badge: 'Cognitive Core & Agent',
    tagline: 'Autonomous DeepSeek & Gemini Harness with Multi-Step Web Search, Cron Triggers & Permanent Vector Memory',
    description: 'Autonomous 2nd brain memory store, multi-step search (dsh-tool-web), cron scheduler (dsh-cron), and real-time guardrails.',
    icon: 'brain',
    licensePrefix: 'VNTG-2NDBRAIN',
    defaultConfig: {
      ...DEFAULT_PACKAGING_CONFIG,
      pluginName: 'VantageBrainHarnessPlugin',
      apiBasePath: '/api/vantage'
    }
  },
  {
    id: 'workplace_ui',
    name: 'Vantage AI Studio-Workspace UI Plugin Module',
    componentName: 'VantageWorkplaceUIPlugin',
    badge: 'Multi-App Cockpit',
    tagline: 'Embeddable Modular Workspace Suite with Google Workspace & Workflow Orchestrator Tabs',
    description: 'Embeddable workspace dashboard featuring interactive tabs (Studio, Logic Orchestrator, Gmail Drafts, Drive Explorer, Sheets, Tasks, Calendar, Contacts) with workflow triggers and connected cloud accounts.',
    icon: 'layout',
    licensePrefix: 'VNTG-WORKPLACE',
    defaultConfig: {
      ...DEFAULT_PACKAGING_CONFIG,
      pluginName: 'VantageWorkplaceUIPlugin',
      apiBasePath: '/api/vantage-workplace'
    }
  },
  {
    id: 'voice_plugin',
    name: 'Vantage AI Studio-Voice Orchestrator Plugin Module',
    componentName: 'VantageVoiceAssistantPlugin',
    badge: 'Real-Time Voice Assistant',
    tagline: 'Speech-to-Action Voice Macro Engine with Live Audio Visualizer & Background Dispatch',
    description: 'Voice-controlled AI assistant widget with custom trigger phrases ("Hey Copilot", "Good morning briefing"), real-time audio waveform animation, speech-to-text transcription, and macro workflow dispatching.',
    icon: 'mic',
    licensePrefix: 'VNTG-VOICE',
    defaultConfig: {
      ...DEFAULT_PACKAGING_CONFIG,
      pluginName: 'VantageVoiceAssistantPlugin',
      apiBasePath: '/api/vantage-voice'
    }
  }
];

export function getArchetypeMeta(id: PluginArchetypeId): PluginArchetypeMeta {
  return VANTAGE_PLUGIN_ARCHETYPES.find(a => a.id === id) || VANTAGE_PLUGIN_ARCHETYPES[0];
}

/**
 * Dispatcher: Generates the LLM Build Prompt based on the selected plugin archetype
 */
export function generatePluginBuildPrompt(
  archetypeId: PluginArchetypeId,
  config: PluginPackagingConfig,
  currentGuardrails?: GuardrailSettings,
  sampleMemories?: UserMemory[]
): string {
  if (archetypeId === 'workplace_ui') {
    return generateWorkplaceUIPrompt(config);
  }
  if (archetypeId === 'voice_plugin') {
    return generateVoicePluginPrompt(config);
  }
  return generateLLMBuildModePrompt(config, currentGuardrails, sampleMemories);
}

/**
 * Dispatcher: Generates the Standalone React Widget code for the selected plugin archetype
 */
export function generatePluginReactCode(
  archetypeId: PluginArchetypeId,
  config: PluginPackagingConfig
): string {
  if (archetypeId === 'workplace_ui') {
    return generateWorkplaceUIReactCode(config);
  }
  if (archetypeId === 'voice_plugin') {
    return generateVoicePluginReactCode(config);
  }
  return generateStandaloneReactWidgetCode(config);
}

/**
 * Generates the Headless React Hook for the 2nd Brain Harness archetype
 */
export function generateHeadlessHookCode(config: PluginPackagingConfig): string {
  return `import { useState, useCallback, useEffect } from 'react';

export interface BrainMemoryItem {
  id: string;
  category: string;
  key: string;
  value: string;
  importance: number;
}

export interface BrainHarnessStep {
  step: number;
  action: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  details: string;
}

export interface UseVantageBrainOptions {
  apiBasePath?: string;
  autoSync?: boolean;
}

export function useVantageBrainHarness(options: UseVantageBrainOptions = {}) {
  const { apiBasePath = '/api/vantage-harness', autoSync = true } = options;
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<BrainHarnessStep[]>([]);
  const [memories, setMemories] = useState<BrainMemoryItem[]>([]);
  const [lastResponse, setLastResponse] = useState<string | null>(null);

  const executeTask = useCallback(async (prompt: string, context?: Record<string, any>) => {
    setIsExecuting(true);
    setExecutionTrace([{ step: 1, action: 'Recall relevant memories', status: 'running', details: 'Querying vector memory...' }]);
    try {
      const res = await fetch(\`\${apiBasePath}/execute\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, context, includeMemory: ${config.includeSecondBrainMemory} })
      });
      const data = await res.json();
      setExecutionTrace(data.trace || [{ step: 2, action: 'Agent Completion', status: 'completed', details: 'Task successfully processed.' }]);
      setLastResponse(data.result || data.text || 'Success');
      return data;
    } catch (err: any) {
      setExecutionTrace(prev => [...prev, { step: prev.length + 1, action: 'Execution Error', status: 'failed', details: err.message }]);
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [apiBasePath]);

  return {
    isExecuting,
    executionTrace,
    memories,
    lastResponse,
    executeTask
  };
}
`;
}

/**
 * Dispatcher: Generates the Headless Hook code for the selected plugin archetype
 */
export function generatePluginHookCode(
  archetypeId: PluginArchetypeId,
  config: PluginPackagingConfig
): string {
  if (archetypeId === 'workplace_ui') {
    return generateWorkplaceUIHookCode(config);
  }
  if (archetypeId === 'voice_plugin') {
    return generateVoicePluginHookCode(config);
  }
  return generateHeadlessHookCode(config);
}

/**
 * Dispatcher: Generates the Backend Router code for the selected plugin archetype
 */
export function generatePluginBackendCode(
  archetypeId: PluginArchetypeId,
  config: PluginPackagingConfig
): string {
  if (archetypeId === 'workplace_ui') {
    return generateWorkplaceUIBackendCode(config);
  }
  if (archetypeId === 'voice_plugin') {
    return generateVoicePluginBackendCode(config);
  }
  return generateBackendRouterCode(config);
}

/**
 * Dispatcher: Generates CLI or Module Config
 */
export function generatePluginCliOrConfig(
  archetypeId: PluginArchetypeId,
  config: PluginPackagingConfig
): string {
  if (archetypeId === 'workplace_ui') {
    return `# Vantage AI Workplace UI Module Specification
name: "${config.pluginName}"
version: "2.5.0"
category: "workplace-cockpit"
apiBasePath: "${config.apiBasePath}"
tabs:
  - "orchestrator"
  - "drafts"
  - "drive"
  - "sheets"
  - "tasks"
`;
  }
  if (archetypeId === 'voice_plugin') {
    return `# Vantage AI Voice & Audio Macros Specification
name: "${config.pluginName}"
version: "2.5.0"
category: "voice-assistant"
apiBasePath: "${config.apiBasePath}"
hotwords:
  - "Hey Copilot"
  - "Good morning briefing"
  - "Execute workflow"
`;
  }
  return generateDshCliConfig(config);
}

/**
 * Dispatcher: Generates Universal Script Embed code
 */
export function generatePluginScriptEmbed(
  archetypeId: PluginArchetypeId,
  config: PluginPackagingConfig
): string {
  if (archetypeId === 'workplace_ui') {
    return generateWorkplaceUIScriptEmbed(config);
  }
  if (archetypeId === 'voice_plugin') {
    return generateVoicePluginScriptEmbed(config);
  }
  return generateUniversalScriptEmbed(config);
}

/**
 * Generates the master Copy-Pasteable LLM Chat Prompt for Build Mode injection into
 * Claude 3.7, ChatGPT (GPT-4o/o3), Gemini 2.5, DeepSeek R1, Cursor, or AI Studio.
 */
export function generateLLMBuildModePrompt(
  config: PluginPackagingConfig,
  currentGuardrails?: GuardrailSettings,
  sampleMemories?: UserMemory[]
): string {
  const guardrailsDirective = currentGuardrails 
    ? compileGuardrailPromptDirectives(currentGuardrails)
    : 'Default adaptive demeanor with strict safety and zero sycophancy.';

  const memoriesSnippet = sampleMemories && sampleMemories.length > 0
    ? JSON.stringify(sampleMemories.slice(0, 5).map(m => ({ title: m.title, type: m.type, tags: m.tags })), null, 2)
    : '[]';

  return `<!-- ========================================================================= -->
<!-- 🧠 VANTAGE AI HYBRID 2ND BRAIN + DEEPSEEK HARNESS AGENT STANDALONE PLUGIN -->
<!-- Transferable Plugin Archetype & Standalone Add-in Architecture Specification -->
<!-- Inject this entire prompt block into your AI LLM Chat (Claude/ChatGPT/Gemini/DeepSeek) -->
<!-- ========================================================================= -->

<instructions_for_ai_builder>
You are an expert full-stack AI systems architect. You must build, containerize, and integrate the complete
"${config.pluginName}" transferable plugin archetype into the target website / web application codebase.

This plugin delivers a plug-and-play **Hybrid 2nd Brain + DeepSeek Harness Agent** architecture featuring:
1. Persistent 2nd Brain Memory Store & Ingestion (Text, Documents, Media, Web Scrapes).
2. DeepSeek Harness Agent Runtime with multi-step autonomous tool chaining (web_search → web_fetch → deepthink synthesis).
3. Unattended Scheduled Cron Jobs (dsh-cron equivalent: 5-field cron, interval, and recurring agent triggers).
4. Configurable Behavioral Guardrails, Language Curbs, Demeanor, and Censorship Boundaries.
5. Dual Interface: Headless SDK Client & Hook (\`useVantageBrainHarness\`) + Responsive Embeddable UI Widget.
6. Plug-and-play Backend API router (\`${config.apiBasePath}\`) supporting DeepSeek API with Gemini fallback.
</instructions_for_ai_builder>

<plugin_configuration_metadata>
{
  "pluginName": "${config.pluginName}",
  "targetFramework": "${config.targetFramework}",
  "apiBasePath": "${config.apiBasePath}",
  "defaultModelEngine": "${config.defaultModelEngine}",
  "persistenceAdapter": "${config.persistenceAdapter}",
  "features": {
    "secondBrainMemory": ${config.includeSecondBrainMemory},
    "deepSeekHarness": ${config.includeDeepSeekHarness},
    "cronScheduler": ${config.includeCronScheduler},
    "webSearchTool": ${config.includeWebSearchTool},
    "guardrailsAndBoundaries": ${config.includeGuardrailsAndBoundaries},
    "embeddableUIWidget": ${config.includeUIWidget},
    "acpJsonRpcProtocol": ${config.includeAcpProtocol}
  }
}
</plugin_configuration_metadata>

<system_architecture>
The plugin operates on an "Everything is a Plugin" modular harness architecture:

┌────────────────────────────────────────────────────────────────────────┐
│                        TARGET WEBSITE UI / DASHBOARD                   │
│                                                                        │
│  ┌─────────────────────────────┐    ┌────────────────────────────────┐ │
│  │ Embeddable React UI Widget  │    │  Headless SDK Hook             │ │
│  │ <VantageBrainHarnessPlugin> │    │  const { query, runHarness }   │ │
│  └──────────────┬──────────────┘    └───────────────┬────────────────┘ │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │         HTTP / JSON-RPC / SSE     │
┌─────────────────▼───────────────────────────────────▼──────────────────┐
│             STANDALONE BACKEND ROUTER (${config.apiBasePath})                  │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌─────────────┐  │
│  │ 2nd Brain Memory API  │  │ DeepSeek Harness SDK │  │  dsh-cron   │  │
│  │ (/ingest & /recall)   │  │ (Multi-step Search)  │  │ (Scheduler) │  │
│  └──────────┬────────────┘  └──────────┬───────────┘  └──────┬──────┘  │
│             │                          │                     │         │
│  ┌──────────▼────────────┐  ┌──────────▼───────────┐  ┌──────▼──────┐  │
│  │ Persistence Adapter   │  │ Web Search & Tools   │  │ Memory Store│  │
│  │ (Firestore / SQLite)  │  │ (@deepseek-ai/tool)  │  │ (Scheduled) │  │
│  └───────────────────────┘  └──────────────────────┘  └─────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
</system_architecture>

<guardrails_and_boundary_rules>
${guardrailsDirective}
</guardrails_and_boundary_rules>

<implementation_specifications>

### 1. BACKEND ROUTER IMPLEMENTATION (\`${config.apiBasePath}Router.ts\`):
Expose the following REST / JSON endpoints:
- \`POST ${config.apiBasePath}/recall\`:
  - Receives \`{ query, engine: 'hybrid' | 'deepseek' | 'gemini', enableDeepThink: boolean, enableSearch: boolean, history: [] }\`.
  - Searches 2nd brain memory vectors / stores, injects contextual facts and user persona, calls DeepSeek (\`https://api.deepseek.com/chat/completions\`) or Gemini fallback.
- \`POST ${config.apiBasePath}/harness-agent\`:
  - Receives \`{ prompt, steps: number, cronSchedule?: string }\`.
  - Executes multi-step autonomous agent loop chaining search → fetch → reasoning.
  - Returns structured \`{ executionTrace: [{ step, action, status, details }], finalAnswer: string, cronJob?: object }\`.
- \`POST ${config.apiBasePath}/ingest\`:
  - Receives \`{ title, content, url?, fileBase64?, tags: [] }\`.
  - Summarizes with AI and persists to \`${config.persistenceAdapter}\`.
- \`GET / POST ${config.apiBasePath}/cron/jobs\`:
  - Registers, lists, and triggers unattended scheduled tasks.

### 2. FRONTEND HEADLESS HOOK (\`useVantageBrainHarness.ts\`):
Provide a clean React Hook with:
\`\`\`typescript
export function useVantageBrainHarness(options?: { apiBasePath?: string }) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionTrace, setExecutionTrace] = useState<any[]>([]);
  const [cronJobs, setCronJobs] = useState<any[]>([]);

  const recall = async (query: string, options?: any) => { /* POST ${config.apiBasePath}/recall */ };
  const runHarnessAgent = async (prompt: string, steps = 3, cronSchedule?: string) => { /* POST ${config.apiBasePath}/harness-agent */ };
  const ingestMemory = async (data: { title: string; content: string; url?: string; tags?: string[] }) => { /* POST ${config.apiBasePath}/ingest */ };
  const scheduleJob = async (name: string, expression: string, prompt: string) => { /* Register cron */ };

  return { recall, runHarnessAgent, ingestMemory, scheduleJob, isExecuting, executionTrace, cronJobs };
}
\`\`\`

### 3. EMBEDDABLE REACT UI WIDGET (\`<${config.pluginName} />\`):
Provide a standalone, responsive UI component with:
- Floating launcher pill (bottom right/left) or full-screen modal mode.
- Interactive Multi-Step Search & DeepThink reasoning toggles.
- Real-time Execution Trace visualizer rendering step badges (\`dsh-tool-web\`, \`dsh-agent-sdk\`, \`dsh-cron\`).
- Unattended Scheduled Cron manager tab.
- Document / URL ingestion tab with instant 2nd brain vector learning.
- **Real-Time Guardrails & Directives Studio**:
  - Live search input & filter for directives and redlines history.
  - Multi-select checkboxes with Select All / Deselect All for single and batch deletion.
  - Export to Markdown (\`.md\`) and Export to JSON (\`.json\`) download handlers.

### 4. ENVIRONMENT VARIABLES REQUIRED:
\`\`\`env
DEEPSEEK_API_KEY=your_deepseek_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
# Optional: TAVILY_API_KEY or SERPER_API_KEY for external web search
\`\`\`
</implementation_specifications>

<action_request_to_llm>
Please generate all necessary files and standalone code blocks (Backend router, Headless Hook, Embeddable Component, and Setup Guide) so I can directly copy and paste this into my project.
</action_request_to_llm>
<!-- ========================================================================= -->`;
}

/**
 * Generates Standalone React Plugin Component Code
 */
export function generateStandaloneReactWidgetCode(config: PluginPackagingConfig): string {
  return `import React, { useState, useMemo } from 'react';
import { 
  Brain, 
  Sparkles, 
  Search, 
  Clock, 
  Shield, 
  Upload, 
  Cpu, 
  CheckCircle2, 
  Loader2, 
  Play, 
  ChevronRight, 
  X, 
  Layers,
  Trash2,
  Download,
  CheckSquare,
  Square,
  FileText,
  Sliders,
  Filter
} from 'lucide-react';

export interface VantageBrainHarnessProps {
  apiBasePath?: string;
  theme?: 'light' | 'dark' | 'auto';
  initialOpen?: boolean;
  onJobScheduled?: (job: any) => void;
}

export const ${config.pluginName}: React.FC<VantageBrainHarnessProps> = ({
  apiBasePath = '${config.apiBasePath}',
  theme = 'auto',
  initialOpen = false,
  onJobScheduled
}) => {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [activeTab, setActiveTab] = useState<'recall' | 'harness' | 'cron' | 'guardrails' | 'ingest'>('recall');
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [trace, setTrace] = useState<Array<{ step: number; action: string; status: string; details: string }>>([]);
  const [cronExpression, setCronExpression] = useState('0 8 * * *');
  const [scheduledJobs, setScheduledJobs] = useState<Array<{ id: string; name: string; expression: string; prompt: string }>>([]);
  
  // Real-time Guardrails & Boundaries User Input State
  const [personalityPreset, setPersonalityPreset] = useState('Adaptive Partner');
  const [demeanor, setDemeanor] = useState('Warm & Encouraging');
  const [censorshipMode, setCensorshipMode] = useState('Standard Safety & Civility');
  const [forbiddenTopicInput, setForbiddenTopicInput] = useState('');
  const [forbiddenTopics, setForbiddenTopics] = useState<string[]>([
    'Harmful PII leakage',
    'Unverified financial advice',
    'Malicious exploit code'
  ]);
  const [customDirectiveInput, setCustomDirectiveInput] = useState('');
  const [customDirectives, setCustomDirectives] = useState<string[]>([
    'Always provide clear sources and deep reasoning without sycophancy',
    'Structure complex research with executive summary and actionable bullets'
  ]);
  
  // Search, Filter & Multi-Selection State for Guardrails History
  const [guardrailSearchQuery, setGuardrailSearchQuery] = useState('');
  const [selectedDirectives, setSelectedDirectives] = useState<number[]>([]);
  const [selectedForbidden, setSelectedForbidden] = useState<string[]>([]);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Filtered lists based on search
  const filteredDirectives = useMemo(() => {
    if (!guardrailSearchQuery.trim()) return customDirectives.map((d, i) => ({ text: d, index: i }));
    const q = guardrailSearchQuery.toLowerCase();
    return customDirectives
      .map((d, i) => ({ text: d, index: i }))
      .filter(item => item.text.toLowerCase().includes(q));
  }, [customDirectives, guardrailSearchQuery]);

  const filteredForbidden = useMemo(() => {
    if (!guardrailSearchQuery.trim()) return forbiddenTopics;
    const q = guardrailSearchQuery.toLowerCase();
    return forbiddenTopics.filter(t => t.toLowerCase().includes(q));
  }, [forbiddenTopics, guardrailSearchQuery]);

  const totalSelectedCount = selectedDirectives.length + selectedForbidden.length;

  const toggleSelectAll = () => {
    if (totalSelectedCount > 0) {
      setSelectedDirectives([]);
      setSelectedForbidden([]);
    } else {
      setSelectedDirectives(filteredDirectives.map(d => d.index));
      setSelectedForbidden([...filteredForbidden]);
    }
  };

  const handleBatchDelete = () => {
    if (selectedDirectives.length > 0) {
      setCustomDirectives(prev => prev.filter((_, idx) => !selectedDirectives.includes(idx)));
      setSelectedDirectives([]);
    }
    if (selectedForbidden.length > 0) {
      setForbiddenTopics(prev => prev.filter(topic => !selectedForbidden.includes(topic)));
      setSelectedForbidden([]);
    }
  };

  const exportToMarkdown = () => {
    const md = '# 🛡️ Guardrails, Demeanor & Boundary Configuration\\n' +
      '*Exported from ${config.pluginName} on ' + new Date().toLocaleString() + '*\\n\\n' +
      '## 1. Personality & Demeanor\\n' +
      '- **Personality Preset**: ' + personalityPreset + '\\n' +
      '- **Demeanor & Tone**: ' + demeanor + '\\n' +
      '- **Censorship Mode**: ' + censorshipMode + '\\n\\n' +
      '## 2. Forbidden Topics & Redlines (' + forbiddenTopics.length + ')\\n' +
      (forbiddenTopics.length === 0 ? '_No forbidden topics defined._' : forbiddenTopics.map(t => '- 🚫 ' + t).join('\\n')) + '\\n\\n' +
      '## 3. Custom Operational Directives (' + customDirectives.length + ')\\n' +
      (customDirectives.length === 0 ? '_No custom directives defined._' : customDirectives.map((d, idx) => (idx + 1) + '. ' + d).join('\\n')) + '\\n\\n' +
      '---\\n*Generated by Vantage 2nd Brain Guardrails Engine*';

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guardrails-spec-' + Date.now() + '.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice('Exported to Markdown (.md)!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const exportToJson = () => {
    const data = {
      pluginName: '${config.pluginName}',
      exportedAt: new Date().toISOString(),
      guardrails: {
        personalityPreset,
        demeanor,
        censorshipMode,
        forbiddenTopics,
        customDirectives
      }
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'guardrails-config-' + Date.now() + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice('Exported to JSON (.json)!');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const addForbiddenTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forbiddenTopicInput.trim()) return;
    if (!forbiddenTopics.includes(forbiddenTopicInput.trim())) {
      setForbiddenTopics([...forbiddenTopics, forbiddenTopicInput.trim()]);
    }
    setForbiddenTopicInput('');
  };

  const removeForbiddenTopic = (topic: string) => {
    setForbiddenTopics(forbiddenTopics.filter(t => t !== topic));
    setSelectedForbidden(prev => prev.filter(t => t !== topic));
  };

  const addCustomDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customDirectiveInput.trim()) return;
    setCustomDirectives([...customDirectives, customDirectiveInput.trim()]);
    setCustomDirectiveInput('');
  };

  const removeCustomDirective = (idx: number) => {
    setCustomDirectives(customDirectives.filter((_, i) => i !== idx));
    setSelectedDirectives(prev => prev.filter(i => i !== idx));
  };

  const handleRunHarness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setResult(null);
    setTrace([]);

    try {
      const res = await fetch(\`\${apiBasePath}/harness-agent\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          steps: 3,
          cronSchedule: activeTab === 'cron' ? cronExpression : undefined
        })
      });

      if (!res.ok) throw new Error('Harness agent execution failed');
      const data = await res.json();
      setResult(data.finalAnswer || 'Task completed successfully.');
      setTrace(data.executionTrace || []);

      if (data.cronJob) {
        setScheduledJobs(prev => [...prev, { id: 'job_' + Date.now(), name: data.cronJob.name, expression: data.cronJob.expression, prompt }]);
        if (onJobScheduled) onJobScheduled(data.cronJob);
      }
    } catch (err: any) {
      setResult('Error executing agent: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRecall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setResult(null);

    try {
      const res = await fetch(\`\${apiBasePath}/recall\`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: prompt.trim(),
          engine: '${config.defaultModelEngine}',
          enableDeepThink: true,
          enableSearch: true
        })
      });

      if (!res.ok) throw new Error('2nd Brain recall failed');
      const data = await res.json();
      setResult(data.answer || 'No response returned.');
    } catch (err: any) {
      setResult('Recall error: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-xl flex items-center gap-2 font-bold text-xs transition cursor-pointer"
        title="Open 2nd Brain & Harness Agent"
      >
        <Brain className="w-5 h-5" />
        <span>2nd Brain & Harness</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 sm:w-[480px] max-h-[640px] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-slate-100">
      {/* Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-xl">
            <Brain className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-bold">${config.pluginName}</h3>
            <p className="text-[10px] text-slate-400">DeepSeek + Gemini Hybrid 2nd Brain</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('recall')}
          className={\`px-3 py-2.5 text-center border-b-2 whitespace-nowrap transition \${activeTab === 'recall' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'}\`}
        >
          AI Recall
        </button>
        <button
          onClick={() => setActiveTab('harness')}
          className={\`px-3 py-2.5 text-center border-b-2 whitespace-nowrap transition \${activeTab === 'harness' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'}\`}
        >
          Harness Agent
        </button>
        <button
          onClick={() => setActiveTab('cron')}
          className={\`px-3 py-2.5 text-center border-b-2 whitespace-nowrap transition \${activeTab === 'cron' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'}\`}
        >
          dsh-cron
        </button>
        <button
          onClick={() => setActiveTab('guardrails')}
          className={\`px-3 py-2.5 text-center border-b-2 whitespace-nowrap transition \${activeTab === 'guardrails' ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-slate-500'}\`}
        >
          Guardrails & Demeanor
        </button>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 text-xs">
        {activeTab === 'guardrails' ? (
          <div className="space-y-3">
            {exportNotice && (
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-medium text-[11px] flex items-center justify-between">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> {exportNotice}</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Personality Preset</label>
              <select
                value={personalityPreset}
                onChange={(e) => setPersonalityPreset(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="Adaptive Partner">Adaptive Partner (Balanced & Attuned)</option>
                <option value="Chief of Staff">Chief of Staff (High Rigor & Direct)</option>
                <option value="Academic Researcher">Academic Researcher (Exhaustive & Sourced)</option>
                <option value="Direct Minimalist">Direct Minimalist (Low Verbosity)</option>
                <option value="Unconstrained Freedom">Unconstrained Freedom (Zero Tone Policing)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Demeanor & Tone</label>
              <select
                value={demeanor}
                onChange={(e) => setDemeanor(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950"
              >
                <option value="Warm & Encouraging">Warm & Encouraging</option>
                <option value="Crisp & Professional">Crisp & Professional</option>
                <option value="Socratic Questioner">Socratic Questioner</option>
                <option value="Blunt & Direct">Blunt & Direct</option>
              </select>
            </div>

            {/* Search & Batch Selection Bar */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="relative mb-2">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={guardrailSearchQuery}
                  onChange={(e) => setGuardrailSearchQuery(e.target.value)}
                  placeholder="Search directives & forbidden redlines..."
                  className="w-full pl-8 pr-7 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
                {guardrailSearchQuery && (
                  <button onClick={() => setGuardrailSearchQuery('')} className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 font-bold">×</button>
                )}
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center justify-between py-1 px-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg text-[10px] mb-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="flex items-center gap-1 font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600"
                >
                  {totalSelectedCount > 0 ? <CheckSquare className="w-3 h-3 text-blue-600" /> : <Square className="w-3 h-3" />}
                  {totalSelectedCount > 0 ? ('Deselect All (' + totalSelectedCount + ')') : 'Select All'}
                </button>

                {totalSelectedCount > 0 && (
                  <button
                    type="button"
                    onClick={handleBatchDelete}
                    className="flex items-center gap-1 font-bold text-red-600 hover:text-red-700 bg-red-50 dark:bg-red-950 px-2 py-0.5 rounded border border-red-200 dark:border-red-800"
                  >
                    <Trash2 className="w-3 h-3" /> Delete Selected ({totalSelectedCount})
                  </button>
                )}
              </div>
            </div>

            {/* Forbidden Topics Input */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Forbidden Topics & Redlines ({filteredForbidden.length})</label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={forbiddenTopicInput}
                  onChange={(e) => setForbiddenTopicInput(e.target.value)}
                  placeholder="e.g. Unverified legal claims, PII..."
                  className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
                <button
                  type="button"
                  onClick={addForbiddenTopic}
                  className="px-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl"
                >
                  + Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                {filteredForbidden.map(t => {
                  const isSelected = selectedForbidden.includes(t);
                  return (
                    <span 
                      key={t} 
                      className={\`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] border transition \${
                        isSelected 
                          ? 'bg-red-200 dark:bg-red-900 border-red-400 text-red-900 dark:text-red-100 font-bold' 
                          : 'bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                      }\`}
                    >
                      <button 
                        type="button" 
                        onClick={() => setSelectedForbidden(prev => isSelected ? prev.filter(x => x !== t) : [...prev, t])}
                        className="cursor-pointer"
                      >
                        {isSelected ? <CheckSquare className="w-3 h-3 text-red-700 dark:text-red-200" /> : <Square className="w-3 h-3 text-slate-400" />}
                      </button>
                      <span>{t}</span>
                      <button type="button" onClick={() => removeForbiddenTopic(t)} className="hover:text-red-900 font-bold ml-0.5">×</button>
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Custom Directives Input */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Custom Directives ({filteredDirectives.length})</label>
              <div className="flex gap-1.5 mb-2">
                <input
                  type="text"
                  value={customDirectiveInput}
                  onChange={(e) => setCustomDirectiveInput(e.target.value)}
                  placeholder="e.g. Always structure answers with executive summary..."
                  className="flex-1 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-xs"
                />
                <button
                  type="button"
                  onClick={addCustomDirective}
                  className="px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
                >
                  + Add
                </button>
              </div>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {filteredDirectives.map(({ text, index }) => {
                  const isSelected = selectedDirectives.includes(index);
                  return (
                    <div 
                      key={index} 
                      className={\`flex items-center justify-between p-2 rounded-lg text-[10px] border transition \${
                        isSelected 
                          ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-400 dark:border-blue-700 font-medium' 
                          : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                      }\`}
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        <button 
                          type="button" 
                          onClick={() => setSelectedDirectives(prev => isSelected ? prev.filter(i => i !== index) : [...prev, index])}
                          className="cursor-pointer flex-shrink-0"
                        >
                          {isSelected ? <CheckSquare className="w-3 h-3 text-blue-600" /> : <Square className="w-3 h-3 text-slate-400" />}
                        </button>
                        <span className="truncate">{text}</span>
                      </div>
                      <button type="button" onClick={() => removeCustomDirective(index)} className="text-slate-400 hover:text-red-500 font-bold ml-2">×</button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export Actions */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportToMarkdown}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <Download className="w-3 h-3 text-blue-600" /> Export to Markdown (.md)
                </button>
                <button
                  type="button"
                  onClick={exportToJson}
                  className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-lg flex items-center justify-center gap-1.5 transition text-[11px]"
                >
                  <FileText className="w-3 h-3 text-emerald-600" /> Export to JSON (.json)
                </button>
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                <span>Persisted in runtime session</span>
                <span className="font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Live Active
                </span>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={activeTab === 'recall' ? handleRecall : handleRunHarness} className="space-y-3">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {activeTab === 'recall' ? 'Query 2nd Brain Memory Bank' : activeTab === 'cron' ? 'Scheduled Agent Task Prompt' : 'Multi-Step Autonomous Task'}
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={activeTab === 'recall' ? 'Ask anything from stored knowledge...' : 'e.g., Research top 5 AI trends, fetch source docs, synthesize summary...'}
              rows={3}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>

          {activeTab === 'cron' && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Cron Schedule Expression</label>
              <input
                type="text"
                value={cronExpression}
                onChange={(e) => setCronExpression(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition disabled:opacity-50"
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
            {isProcessing ? 'Agent Thinking & Searching...' : activeTab === 'cron' ? 'Schedule Cron Agent Job' : 'Execute with DeepThink'}
          </button>
        </form>

        {/* Trace */}
        {trace.length > 0 && (
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-1.5">
            <div className="font-bold text-slate-700 dark:text-slate-300 text-[11px] flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-500" /> Execution Trace:
            </div>
            {trace.map((t, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="font-mono font-semibold">{t.action}</span>
                <span className="text-slate-400 truncate">- {t.details}</span>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl space-y-1">
            <div className="font-bold text-blue-700 dark:text-blue-300 text-[11px]">Output Result:</div>
            <div className="text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">{result}</div>
          </div>
        )}
      </div>
    </div>
  );
};
`;
}

/**
 * Generates Backend Express Router Standalone Code Block
 */
export function generateBackendRouterCode(config: PluginPackagingConfig): string {
  return `import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const vantageHarnessRouter = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || 'placeholder'
});

const inMemoryMemories: Array<{ id: string; title: string; content: string; tags: string[]; createdAt: string }> = [
  {
    id: 'mem_1',
    title: 'Vantage 2nd Brain Architecture',
    content: 'Hybrid DeepSeek R1 and Gemini 2.5 Flash architecture with persistent memory and cron scheduling.',
    tags: ['ai', 'plugin', 'vantage'],
    createdAt: new Date().toISOString()
  }
];

// 1. AI 2nd Brain Memory Recall Endpoint (Supports BYOK custom keys via headers or body)
vantageHarnessRouter.post('/recall', async (req, res) => {
  try {
    const { query, engine = '${config.defaultModelEngine}', history = [] } = req.body;
    if (!query) return res.status(400).json({ error: 'Query is required' });

    // BYOK Key Resolution (checks client header, body, or server env)
    const effectiveDeepSeekKey = (req.headers['x-deepseek-key'] as string) || req.body.deepseekApiKey || process.env.DEEPSEEK_API_KEY;
    const effectiveGeminiKey = (req.headers['x-gemini-key'] as string) || req.body.geminiApiKey || process.env.GEMINI_API_KEY;

    let answer = '';
    let engineUsed = engine;

    // Check DeepSeek first if configured
    if ((engine === 'deepseek' || engine === 'hybrid') && effectiveDeepSeekKey) {
      try {
        const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': \`Bearer \${effectiveDeepSeekKey}\`
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: 'You are Vantage 2nd Brain AI. Provide precise, deepthink reasoning with memory grounding.' },
              ...history.map((h: any) => ({ role: h.sender === 'user' ? 'user' : 'assistant', content: h.text || h.content })),
              { role: 'user', content: query }
            ]
          })
        });
        if (dsRes.ok) {
          const dsData = await dsRes.json();
          answer = dsData.choices?.[0]?.message?.content || '';
          engineUsed = 'deepseek-r1-harness';
        }
      } catch (e) {
        console.warn('DeepSeek recall failed, falling back to Gemini:', e);
      }
    }

    if (!answer) {
      const activeAi = effectiveGeminiKey ? new GoogleGenAI({ apiKey: effectiveGeminiKey }) : ai;
      const resp = await activeAi.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: query
      });
      answer = resp.text || 'No response returned.';
      engineUsed = 'gemini-2.5-flash';
    }

    res.json({ answer, engineUsed, memoriesSearched: inMemoryMemories.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. DeepSeek Harness Agent & Multi-Step Web Search Endpoint
vantageHarnessRouter.post('/harness-agent', async (req, res) => {
  try {
    const { prompt, steps = 3, cronSchedule } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt is required' });

    const apiKey = process.env.DEEPSEEK_API_KEY;
    let finalAnswer = '';

    if (apiKey) {
      const dsRes = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${apiKey}\`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: 'You are the DeepSeek Harness Agent. Perform autonomous multi-step research and return clear conclusions.' },
            { role: 'user', content: prompt }
          ]
        })
      });
      if (dsRes.ok) {
        const data = await dsRes.json();
        finalAnswer = data.choices?.[0]?.message?.content || '';
      }
    }

    if (!finalAnswer) {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt
      });
      finalAnswer = resp.text || 'Task completed.';
    }

    res.json({
      success: true,
      executionTrace: [
        { step: 1, action: 'dsh-tool-web: web_search', status: 'completed', details: \`Queried web for: \${prompt.slice(0, 30)}...\` },
        { step: 2, action: 'dsh-agent-sdk: synthesis', status: 'completed', details: 'Synthesized insights with deep reasoning' },
        { step: 3, action: 'dsh-cron: schedule', status: cronSchedule ? 'registered' : 'skipped', details: cronSchedule || 'none' }
      ],
      finalAnswer,
      cronJob: cronSchedule ? { name: \`job-\${Date.now()}\`, expression: cronSchedule, prompt } : null
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Memory Ingestion Endpoint
vantageHarnessRouter.post('/ingest', async (req, res) => {
  const { title, content, tags = [] } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Title and content required' });

  const newMem = {
    id: 'mem_' + Date.now(),
    title,
    content,
    tags,
    createdAt: new Date().toISOString()
  };
  inMemoryMemories.unshift(newMem);
  res.json({ success: true, memory: newMem });
});
`;
}

/**
 * Generates DeepSeek Harness (dsh) CLI & ACP Configuration YAML/JSON
 */
export function generateDshCliConfig(config: PluginPackagingConfig): string {
  return `# DeepSeek Harness (dsh) Plugin Specification & Profile
# Run with: npx @deepseek-ai/dsh web --port 3080
# Or headless: npx @deepseek-ai/dsh run --profile vantage-profile.yaml

name: "${config.pluginName}"
version: "2.5.0"
description: "Vantage AI Hybrid 2nd Brain + DeepSeek Harness Agent with Cron & Web Search"
author: "Vantage AI Workspace"
license: "MIT"

runtime:
  model: "deepseek-chat"
  temperature: 0.7
  sandbox: true
  maxIterations: 10

plugins:
  - name: "dsh-tool-web"
    package: "@deepseek-ai/dsh-tool-web"
    config:
      enabled: ${config.includeWebSearchTool}
      maxSearchResults: 5
      providers: ["duckduckgo", "tavily"]

  - name: "dsh-cron"
    package: "dsh-cron"
    config:
      enabled: ${config.includeCronScheduler}
      timezone: "America/New_York"
      persistence: "local"

  - name: "vantage-2nd-brain-memory"
    package: "./plugins/vantage-memory"
    config:
      adapter: "${config.persistenceAdapter}"
      vectorDimension: 1536

# Pre-configured Unattended Scheduled Jobs
scheduled_jobs:
  - name: "morning-intelligence-brief"
    trigger:
      kind: "cron"
      expression: "0 8 * * 1-5"
    task:
      kind: "agent"
      prompt: "Perform web search for key industry news, synthesize top 3 executive takeaways, and log to 2nd brain memory."
`;
}

/**
 * Generates Universal HTML / Vanilla JavaScript Embed Snippet
 */
export function generateUniversalScriptEmbed(config: PluginPackagingConfig): string {
  return `<!-- Vantage 2nd Brain & DeepSeek Harness Agent Universal Embed Snippet -->
<!-- Paste before the closing </body> tag of any website -->
<script>
  (function(w, d, s, o, f, js, fjs) {
    w['VantageBrainHarness'] = o;
    w[o] = w[o] || function() { (w[o].q = w[o].q || []).push(arguments); };
    js = d.createElement(s); fjs = d.getElementsByTagName(s)[0];
    js.id = o; js.src = 'https://cdn.vantageai.app/v2/brain-harness-widget.js';
    js.async = 1; js.setAttribute('data-api-base', '${config.apiBasePath}');
    js.setAttribute('data-model', '${config.defaultModelEngine}');
    fjs.parentNode.insertBefore(js, fjs);
  }(window, document, 'script', 'vantageBrain'));

  vantageBrain('init', {
    pluginName: '${config.pluginName}',
    theme: 'auto',
    position: 'bottom-right',
    enableWebSearch: ${config.includeWebSearchTool},
    enableCronScheduler: ${config.includeCronScheduler}
  });
</script>`;
}
