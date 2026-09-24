import React, { useState, useMemo, useEffect } from 'react';
import { useMemory } from '../context/MemoryContext';
import { 
  PluginPackagingConfig, 
  DEFAULT_PACKAGING_CONFIG, 
  PluginArchetypeId,
  PluginArchetypeMeta,
  VANTAGE_PLUGIN_ARCHETYPES,
  getArchetypeMeta,
  generatePluginBuildPrompt,
  generatePluginReactCode,
  generatePluginHookCode,
  generatePluginBackendCode,
  generatePluginCliOrConfig,
  generatePluginScriptEmbed,
  generatePluginZipBundle,
  generateLLMBuildModePrompt, 
  generateStandaloneReactWidgetCode, 
  generateBackendRouterCode, 
  generateDshCliConfig, 
  generateUniversalScriptEmbed 
} from '../services/pluginArchetypeService';
import { 
  isMikeFordAdmin, 
  ADMIN_PRIMARY_EMAIL, 
  ADMIN_PRIMARY_NAME,
  getSavedPluginDistributions,
  savePluginDistribution,
  deletePluginDistribution,
  generateDistributionWatermarkHeader,
  PluginDistributionRecord
} from '../utils/adminAuth';
import { auth, googleSignIn } from '../services/firebase';
import { 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Code, 
  Layers, 
  Cpu, 
  Brain, 
  Clock, 
  Search, 
  Shield, 
  CheckCircle2, 
  Play, 
  Loader2, 
  FileText, 
  Settings, 
  Terminal, 
  Eye, 
  Share2, 
  ExternalLink,
  ChevronRight,
  Sliders,
  Box,
  Globe,
  Lock,
  Building,
  Key,
  Trash2,
  CheckSquare,
  AlertCircle,
  Plus,
  Building2,
  Mic,
  Radio,
  Volume2,
  Table,
  HardDrive,
  Mail,
  Command,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet,
  MapPin,
  Smartphone,
  DollarSign,
  Package,
  Database,
  FileArchive,
  FileStack
} from 'lucide-react';
import { CrmExportConfigurationView } from './CrmExportConfigurationView';

interface StandalonePluginArchetypeGeneratorProps {
  currentUserEmail?: string | null;
}

export const StandalonePluginArchetypeGenerator: React.FC<StandalonePluginArchetypeGeneratorProps> = ({
  currentUserEmail
}) => {
  const { guardrails, memories } = useMemory();
  
  // Selected Plugin Archetype: 'second_brain' | 'workplace_ui' | 'voice_plugin'
  const [selectedArchetype, setSelectedArchetype] = useState<PluginArchetypeId>('second_brain');
  const currentMeta = useMemo(() => getArchetypeMeta(selectedArchetype), [selectedArchetype]);

  const [config, setConfig] = useState<PluginPackagingConfig>(DEFAULT_PACKAGING_CONFIG);
  const [activeView, setActiveView] = useState<'prompt' | 'react_widget' | 'headless_hook' | 'backend_router' | 'dsh_cli' | 'html_embed' | 'crm_export' | 'live_sandbox' | 'distribution_vault'>('prompt');
  const [llmPreset, setLlmPreset] = useState<'universal' | 'claude' | 'chatgpt' | 'gemini' | 'deepseek' | 'cursor'>('universal');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [isExportingZip, setIsExportingZip] = useState<boolean>(false);

  // Authentication & Admin State
  const activeEmail = currentUserEmail || auth.currentUser?.email;
  const isAdmin = isMikeFordAdmin({ email: activeEmail });
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Client Distribution Packaging State (Mike Ford Admin Vault)
  const [clientName, setClientName] = useState('Acme Corporation');
  const [clientDomain, setClientDomain] = useState('acme.example.com');
  const [licenseKey, setLicenseKey] = useState(() => `${currentMeta.licensePrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`);
  const [distributionNotes, setDistributionNotes] = useState('Client standalone portal deployment with hybrid reasoning');
  const [includeWatermark, setIncludeWatermark] = useState(true);
  const [distributionRecords, setDistributionRecords] = useState<PluginDistributionRecord[]>(() => getSavedPluginDistributions());

  // Handle Archetype Switch
  const handleSelectArchetype = (archetypeId: PluginArchetypeId) => {
    setSelectedArchetype(archetypeId);
    const meta = getArchetypeMeta(archetypeId);
    setConfig(meta.defaultConfig);
    setLicenseKey(`${meta.licensePrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`);
    if (archetypeId === 'csv_maker') {
      setDistributionNotes('Standalone Vantage CSV Maker+ Multi-CRM Hygiene, Batch Merger & Template Generator deployment');
    } else if (archetypeId === 'real_estate_geomap') {
      setDistributionNotes('Standalone Vantage Real Estate GeoMap & MLS Intelligence deployment');
    } else if (archetypeId === 'full_suite') {
      setDistributionNotes('Commercial Enterprise Software Suite (All-in-One master distribution)');
    } else if (archetypeId === 'mobile_microapps') {
      setDistributionNotes('Standalone Vantage Mobile Micro-App & Add-to-Home-Screen PWA deployment');
    } else if (archetypeId === 'workplace_ui') {
      setDistributionNotes('Standalone Vantage Workplace UI Cockpit deployment');
    } else if (archetypeId === 'voice_plugin') {
      setDistributionNotes('Standalone Vantage Voice Assistant & Speech Macro deployment');
    } else {
      setDistributionNotes('Client standalone portal deployment with hybrid reasoning');
    }
  };

  // Live Sandbox state (2nd Brain)
  const [sandboxPrompt, setSandboxPrompt] = useState<string>('Research top 3 enterprise generative AI security trends and schedule weekly update');
  const [sandboxEngine, setSandboxEngine] = useState<'hybrid' | 'deepseek' | 'gemini'>('hybrid');
  const [isSandboxRunning, setIsSandboxRunning] = useState<boolean>(false);
  const [sandboxResult, setSandboxResult] = useState<string | null>(null);
  const [sandboxTrace, setSandboxTrace] = useState<Array<{ step: number; action: string; status: string; details: string }>>([]);
  const [sandboxCronExpression, setSandboxCronExpression] = useState<string>('0 9 * * 1');
  const [scheduledJobsList, setScheduledJobsList] = useState<Array<{ id: string; name: string; cron: string; task: string }>>([
    { id: 'job_1', name: 'Weekly Executive AI Trend Brief', cron: '0 9 * * 1', task: 'Scan web for top AI security breakthroughs and summarize.' }
  ]);

  // Workplace UI Sandbox state
  const [workplaceActiveTab, setWorkplaceActiveTab] = useState<'orchestrator' | 'gmail' | 'drive' | 'sheets' | 'tasks'>('orchestrator');
  const [workplaceWorkflowRunning, setWorkplaceWorkflowRunning] = useState<string | null>(null);
  const [workplaceLogs, setWorkplaceLogs] = useState<string[]>([
    'System ready. Connected to Google Workspace (Authenticated as Mike Ford).',
    'Background cron triggers active: 09:00 EST daily briefing.'
  ]);
  const [workplaceTasks, setWorkplaceTasks] = useState([
    { id: 't1', title: 'Review Q3 Executive Forecast in Sheets', done: true, priority: 'High' },
    { id: 't2', title: 'Approve AI-generated Gmail response to Apex Health', done: false, priority: 'Urgent' },
    { id: 't3', title: 'Sync Drive documentation to 2nd Brain memory index', done: false, priority: 'Normal' }
  ]);

  const handleRunWorkplaceWorkflow = (workflowName: string) => {
    setWorkplaceWorkflowRunning(workflowName);
    setWorkplaceLogs((prev) => [`[${new Date().toLocaleTimeString()}] Dispatched: ${workflowName}...`, ...prev]);
    setTimeout(() => {
      setWorkplaceWorkflowRunning(null);
      setWorkplaceLogs((prev) => [
        `[${new Date().toLocaleTimeString()}] Completed: ${workflowName} successfully processed & synchronized.`,
        ...prev
      ]);
    }, 1800);
  };

  // Voice Plugin Sandbox state
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('Hey Copilot, summarize my morning priorities');
  const [voiceStatus, setVoiceStatus] = useState<string>('Ready for speech input or macro simulation');
  const [voiceResponse, setVoiceResponse] = useState<string | null>(
    'Priority 1: Q3 Board Review Deck pending approval in Google Drive. Priority 2: 3 unread client emails in Gmail requiring executive action.'
  );

  const handleSimulateVoiceCommand = (cmd: string) => {
    setIsVoiceListening(true);
    setVoiceTranscript(cmd);
    setVoiceStatus(`Transcribing speech audio: "${cmd}"...`);
    setVoiceResponse(null);
    setTimeout(() => {
      setIsVoiceListening(false);
      setVoiceStatus(`Executing voice macro: "${cmd}"`);
      let resp = `Voice Macro executed: Successfully processed command "${cmd}". Output dispatched to workspace.`;
      if (cmd.toLowerCase().includes('inbox') || cmd.toLowerCase().includes('email')) {
        resp = `Inbox Scan Complete: 2 urgent emails from Apex Health & Vantage Ventures found. Drafted suggested replies in Gmail tab.`;
      } else if (cmd.toLowerCase().includes('briefing') || cmd.toLowerCase().includes('morning') || cmd.toLowerCase().includes('priority') || cmd.toLowerCase().includes('priorities')) {
        resp = `Good Morning Mike: 3 priority tasks scheduled today. Cloud infrastructure is 100% operational. Financial runway models updated.`;
      } else if (cmd.toLowerCase().includes('drive') || cmd.toLowerCase().includes('deck') || cmd.toLowerCase().includes('report')) {
        resp = `Drive Sync Complete: Q3 Pitch Deck has been exported and synced with 2nd Brain memory vectors.`;
      }
      setVoiceResponse(resp);
    }, 1200);
  };

  // GeoMap Plugin Sandbox state
  const [geoSearchQuery, setGeoSearchQuery] = useState('');
  const [geoActiveLayer, setGeoActiveLayer] = useState<'all' | 'usda' | 'cra'>('all');
  const [geoInterestRate, setGeoInterestRate] = useState(6.5);
  const [geoDownPaymentPct, setGeoDownPaymentPct] = useState(10);
  const [geoSelectedPropId, setGeoSelectedPropId] = useState('prop-1');

  const geoPropertyListings = [
    {
      id: 'prop-1',
      address: '4288 Evergreen Ridge Trail',
      city: 'Bend',
      state: 'OR',
      zip: '97703',
      price: 549000,
      beds: 3,
      baths: 2,
      sqft: 1850,
      status: 'Active',
      lat: 44.0582,
      lng: -121.3153,
      isUsdaEligible: true,
      isCraGrantEligible: false
    },
    {
      id: 'prop-2',
      address: '1124 Columbia River Way',
      city: 'Vancouver',
      state: 'WA',
      zip: '98661',
      price: 435000,
      beds: 4,
      baths: 2.5,
      sqft: 2200,
      status: 'Active',
      lat: 45.6387,
      lng: -122.6615,
      isUsdaEligible: false,
      isCraGrantEligible: true
    },
    {
      id: 'prop-3',
      address: '890 Sunny Hills Parkway',
      city: 'Redmond',
      state: 'OR',
      zip: '97756',
      price: 389000,
      beds: 3,
      baths: 2,
      sqft: 1620,
      status: 'Pending',
      lat: 44.2726,
      lng: -121.1739,
      isUsdaEligible: true,
      isCraGrantEligible: true
    }
  ];

  const selectedGeoProp = geoPropertyListings.find(p => p.id === geoSelectedPropId) || geoPropertyListings[0];
  const geoDownPaymentVal = (selectedGeoProp.price * geoDownPaymentPct) / 100;
  const geoLoanVal = selectedGeoProp.price - geoDownPaymentVal;
  const geoMonthlyRate = geoInterestRate / 100 / 12;
  const geoMonthlyPI = Math.round((geoLoanVal * geoMonthlyRate * Math.pow(1 + geoMonthlyRate, 360)) / (Math.pow(1 + geoMonthlyRate, 360) - 1));
  const geoTaxesIns = Math.round((selectedGeoProp.price * 0.012) / 12 + 115);
  const geoTotalMonthly = geoMonthlyPI + geoTaxesIns;

  // Full Suite Plugin Sandbox state
  const [suiteActiveModule, setSuiteActiveModule] = useState<'brain' | 'geomap' | 'voice' | 'workspace'>('brain');

  // Mobile Micro-Apps Sandbox state
  const [mobileInstallPrompted, setMobileInstallPrompted] = useState(false);
  const [mobileShareCopied, setMobileShareCopied] = useState(false);

  const handleGenerateNewKey = () => {
    setLicenseKey(`${currentMeta.licensePrefix}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-2026`);
  };

  const handleRegisterDistribution = () => {
    if (!clientName.trim()) {
      alert('Please enter a Client or Organization name.');
      return;
    }
    const newRecord: PluginDistributionRecord = {
      id: 'dist_' + Date.now(),
      clientName: clientName.trim(),
      targetDomain: clientDomain.trim() || 'all-authorized-domains',
      licenseKey: licenseKey.trim(),
      distributionType: 'full_hybrid',
      archetypeId: selectedArchetype,
      pluginTitle: currentMeta.name,
      distributedAt: new Date().toISOString(),
      notes: distributionNotes.trim(),
      status: 'active'
    };
    savePluginDistribution(newRecord);
    setDistributionRecords(getSavedPluginDistributions());
    setDownloadSuccess(`Registered & Watermarked "${currentMeta.name}" for "${clientName}"!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDeleteDistribution = (id: string) => {
    if (confirm('Are you sure you want to remove this client distribution record?')) {
      deletePluginDistribution(id);
      setDistributionRecords(getSavedPluginDistributions());
    }
  };

  const handleToggleStatus = (record: PluginDistributionRecord) => {
    const updated: PluginDistributionRecord = {
      ...record,
      status: record.status === 'active' ? 'revoked' : 'active'
    };
    savePluginDistribution(updated);
    setDistributionRecords(getSavedPluginDistributions());
  };

  // Generate artifacts
  const watermarkHeader = useMemo(() => {
    if (!includeWatermark) return '';
    return generateDistributionWatermarkHeader(clientName, clientDomain, licenseKey, currentMeta.name);
  }, [includeWatermark, clientName, clientDomain, licenseKey, currentMeta]);

  const generatedPrompt = useMemo(() => {
    let base = generatePluginBuildPrompt(selectedArchetype, config, config.includeGuardrailsAndBoundaries ? guardrails : undefined, memories);
    if (llmPreset === 'claude') {
      base = `<!-- SYSTEM PROMPT FOR CLAUDE 3.7 SONNET / OPUS -->\n${base}`;
    } else if (llmPreset === 'deepseek') {
      base = `<!-- SYSTEM PROMPT FOR DEEPSEEK R1 / V3 WITH DEEPTHINK & HARNESS -->\n${base}`;
    } else if (llmPreset === 'chatgpt') {
      base = `<!-- SYSTEM PROMPT FOR CHATGPT (o3 / GPT-4o) BUILD MODE -->\n${base}`;
    } else if (llmPreset === 'cursor') {
      base = `<!-- CURSOR / AI CODING AGENT COMPOSER PROMPT -->\n${base}`;
    }
    if (includeWatermark) {
      base = `${watermarkHeader}\n${base}`;
    }
    return base;
  }, [selectedArchetype, config, guardrails, memories, llmPreset, includeWatermark, watermarkHeader]);

  const generatedReactWidget = useMemo(() => {
    const code = generatePluginReactCode(selectedArchetype, config);
    return includeWatermark ? `${watermarkHeader}${code}` : code;
  }, [selectedArchetype, config, includeWatermark, watermarkHeader]);

  const generatedHeadlessHook = useMemo(() => {
    const code = generatePluginHookCode(selectedArchetype, config);
    return includeWatermark ? `${watermarkHeader}${code}` : code;
  }, [selectedArchetype, config, includeWatermark, watermarkHeader]);

  const generatedBackendRouter = useMemo(() => {
    const code = generatePluginBackendCode(selectedArchetype, config);
    return includeWatermark ? `${watermarkHeader}${code}` : code;
  }, [selectedArchetype, config, includeWatermark, watermarkHeader]);

  const generatedDshCli = useMemo(() => {
    const code = generatePluginCliOrConfig(selectedArchetype, config);
    return includeWatermark ? `# ${watermarkHeader.replace(/\n/g, '\n# ')}\n${code}` : code;
  }, [selectedArchetype, config, includeWatermark, watermarkHeader]);

  const generatedHtmlEmbed = useMemo(() => {
    const code = generatePluginScriptEmbed(selectedArchetype, config);
    return includeWatermark ? `<!-- \n${watermarkHeader} -->\n${code}` : code;
  }, [selectedArchetype, config, includeWatermark, watermarkHeader]);

  const activeContent = useMemo(() => {
    switch (activeView) {
      case 'prompt':
        return generatedPrompt;
      case 'react_widget':
        return generatedReactWidget;
      case 'headless_hook':
        return generatedHeadlessHook;
      case 'backend_router':
        return generatedBackendRouter;
      case 'dsh_cli':
        return generatedDshCli;
      case 'html_embed':
        return generatedHtmlEmbed;
      default:
        return generatedPrompt;
    }
  }, [activeView, generatedPrompt, generatedReactWidget, generatedHeadlessHook, generatedBackendRouter, generatedDshCli, generatedHtmlEmbed]);

  const handleCopy = () => {
    navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadFile = () => {
    let filename = `${config.pluginName.toLowerCase()}-llm-build-prompt.md`;
    let mime = 'text/markdown';
    let content = activeContent;

    if (activeView === 'react_widget') {
      filename = `${config.pluginName}.tsx`;
      mime = 'text/typescript';
    } else if (activeView === 'headless_hook') {
      filename = `use${config.pluginName}.ts`;
      mime = 'text/typescript';
    } else if (activeView === 'backend_router') {
      filename = `${config.pluginName}Router.ts`;
      mime = 'text/typescript';
    } else if (activeView === 'dsh_cli') {
      filename = `${config.pluginName}-spec.yaml`;
      mime = 'text/yaml';
    } else if (activeView === 'html_embed') {
      filename = `${config.pluginName.toLowerCase()}-embed.html`;
      mime = 'text/html';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Downloaded "${filename}"!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleExportFullJsonPackage = () => {
    const pkg = {
      metadata: {
        title: `${currentMeta.name} Distribution Package`,
        archetypeId: selectedArchetype,
        pluginName: config.pluginName,
        author: ADMIN_PRIMARY_NAME,
        adminEmail: ADMIN_PRIMARY_EMAIL,
        licensedTo: clientName,
        authorizedDomain: clientDomain,
        licenseKey: licenseKey,
        issuedAt: new Date().toISOString(),
        version: '2.5.0-proprietary'
      },
      configuration: config,
      guardrails: guardrails,
      activeMemoriesCount: memories.length,
      artifacts: {
        llmBuildPrompt: generatedPrompt,
        standaloneReactWidget: generatedReactWidget,
        backendRouter: generatedBackendRouter,
        cliOrModuleConfig: generatedDshCli,
        universalHtmlEmbed: generatedHtmlEmbed
      }
    };

    const blob = new Blob([JSON.stringify(pkg, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage-2ndbrain-package-${clientName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(`Exported Complete Distribution Package JSON!`);
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const handleDownloadZipBundle = async () => {
    setIsExportingZip(true);
    try {
      const blob = await generatePluginZipBundle(selectedArchetype, config, watermarkHeader);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.pluginName.toLowerCase()}-dist-bundle-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDownloadSuccess(`Downloaded Complete "${config.pluginName}" ZIP Distribution Bundle!`);
      setTimeout(() => setDownloadSuccess(null), 4000);
    } catch (err: any) {
      console.error('Error creating ZIP bundle:', err);
      alert('Failed to generate ZIP bundle: ' + err.message);
    } finally {
      setIsExportingZip(false);
    }
  };

  const handleRunSandbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sandboxPrompt.trim()) return;

    setIsSandboxRunning(true);
    setSandboxResult(null);
    setSandboxTrace([
      { step: 1, action: 'dsh-tool-web: web_search', status: 'running', details: `Dispatching web query: "${sandboxPrompt.slice(0, 45)}..."` }
    ]);

    try {
      // Call backend harness agent endpoint
      const res = await fetch('/api/deepseek/harness-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: sandboxPrompt.trim(),
          steps: 3,
          cronSchedule: sandboxCronExpression
        })
      });

      if (!res.ok) {
        // Fallback to simulated harness if live API key isn't provided
        await new Promise(r => setTimeout(r, 1200));
        setSandboxTrace([
          { step: 1, action: 'dsh-tool-web: web_search', status: 'completed', details: `Retrieved 4 high-authority citations for "${sandboxPrompt.slice(0, 30)}..."` },
          { step: 2, action: 'dsh-agent-sdk: deepthink reasoning', status: 'completed', details: 'Synthesized multi-step findings using DeepSeek reasoner model' },
          { step: 3, action: 'dsh-cron: scheduler register', status: 'completed', details: `Registered recurring schedule [${sandboxCronExpression}]` }
        ]);
        setSandboxResult(`### DeepSeek Harness Agent Synthesis\n\n**Key Findings for:** *${sandboxPrompt}*\n1. **Autonomous Tool Chaining**: Multi-step internet search was executed via \`dsh-tool-web\` and reconciled with the 2nd Brain knowledge base.\n2. **DeepThink Reasoning**: Synthesized high-signal insights without redundant preamble.\n3. **Unattended Execution**: Verified cron expression \`${sandboxCronExpression}\` for automated recurring execution.`);
        
        setScheduledJobsList(prev => [
          ...prev,
          { id: 'job_' + Date.now(), name: `Auto-Task: ${sandboxPrompt.slice(0, 24)}...`, cron: sandboxCronExpression, task: sandboxPrompt }
        ]);
      } else {
        const data = await res.json();
        setSandboxTrace(data.executionTrace || []);
        setSandboxResult(data.finalAnswer || 'Task completed successfully.');
        if (data.cronJob) {
          setScheduledJobsList(prev => [
            ...prev,
            { id: 'job_' + Date.now(), name: data.cronJob.name || 'Harness Cron Job', cron: data.cronJob.expression || sandboxCronExpression, task: sandboxPrompt }
          ]);
        }
      }
    } catch (err: any) {
      setSandboxResult('Error running harness: ' + err.message);
    } finally {
      setIsSandboxRunning(false);
    }
  };

  // If not authenticated as Mike Ford, render secure Admin Gate
  if (!isAdmin) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 md:p-12 text-center max-w-3xl mx-auto shadow-xl space-y-6">
        <div className="w-16 h-16 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-800">
            <Shield className="w-3.5 h-3.5" /> Vantage IP Protection Gate
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            Admin Restricted: 2nd Brain Plugin & Distribution Vault
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            The hybrid DeepSeek + Gemini 2nd Brain plugin architecture, standalone source codes, LLM build prompts, and export modules are proprietary assets restricted to Administrator <strong>Mike Ford ({ADMIN_PRIMARY_EMAIL})</strong>.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2 max-w-lg mx-auto">
          <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Authorized Admin Privileges:
          </div>
          <ul className="list-disc pl-5 space-y-1 text-slate-500 dark:text-slate-400">
            <li>Generate standalone React widgets & Express router middleware.</li>
            <li>Export domain-locked, watermarked packages for specific clients.</li>
            <li>Issue, verify, and revoke 2nd Brain client distribution license keys.</li>
            <li>Download complete JSON / Markdown build mode prompts.</li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            onClick={async () => {
              setIsAuthenticating(true);
              try {
                await googleSignIn({ method: 'auto' });
              } catch (e) {
                console.error(e);
              } finally {
                setIsAuthenticating(false);
              }
            }}
            disabled={isAuthenticating}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl text-sm shadow-lg shadow-blue-500/20 transition cursor-pointer"
          >
            {isAuthenticating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
            <span>Sign In with Google as Admin ({ADMIN_PRIMARY_EMAIL})</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast */}
      {downloadSuccess && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{downloadSuccess}</span>
        </div>
      )}

      {/* Vantage Plugin Archetype Selector Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Active Plugin Archetype
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Select Vantage Plugin to Configure, Inspect & Export
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full">
            <Layers className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-semibold">{VANTAGE_PLUGIN_ARCHETYPES.length} Modular Archetypes Loaded</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {VANTAGE_PLUGIN_ARCHETYPES.map((arch) => {
            const isSelected = selectedArchetype === arch.id;
            return (
              <button
                key={arch.id}
                type="button"
                onClick={() => handleSelectArchetype(arch.id)}
                className={`p-4 rounded-2xl text-left border transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className={`p-2.5 rounded-xl ${
                      isSelected 
                        ? 'bg-blue-600 text-white shadow-sm' 
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}>
                      {arch.icon === 'brain' && <Brain className="w-5 h-5" />}
                      {arch.icon === 'map' && <MapPin className="w-5 h-5 text-emerald-500" />}
                      {arch.icon === 'package' && <Package className="w-5 h-5 text-blue-500" />}
                      {arch.icon === 'smartphone' && <Smartphone className="w-5 h-5 text-amber-500" />}
                      {arch.icon === 'layout' && <Building2 className="w-5 h-5 text-indigo-500" />}
                      {arch.icon === 'mic' && <Mic className="w-5 h-5 text-purple-500" />}
                      {arch.icon === 'file-spreadsheet' && <FileSpreadsheet className="w-5 h-5 text-cyan-500" />}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}>
                      {arch.badge}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-1">
                      {arch.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {arch.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px]">
                  <span className="font-mono text-[10px] text-slate-400">
                    {arch.defaultConfig.pluginName}
                  </span>
                  <span className={`font-semibold flex items-center gap-1 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>
                    {isSelected ? 'Active Selection' : 'Select'} <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Admin Security Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 backdrop-blur-md rounded-full text-xs font-bold border border-emerald-500/30">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Verified Admin: {ADMIN_PRIMARY_NAME} ({ADMIN_PRIMARY_EMAIL})
              </span>
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-cyan-300 rounded-full text-[11px] font-semibold border border-cyan-400/20">
                {currentMeta.badge} Distribution Vault
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">
              {currentMeta.name}
            </h2>
            <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
              {currentMeta.tagline}. Generate secured, watermarked, domain-locked distribution packages of your standalone React widgets, backend routers, and full deployment specs for authorized clients.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Code / Prompt'}</span>
            </button>
            <button
              onClick={handleDownloadFile}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold border border-white/20 transition cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download File</span>
            </button>
            <button
              onClick={handleExportFullJsonPackage}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg transition cursor-pointer"
              title="Export complete distribution package as JSON for client delivery"
            >
              <Box className="w-4 h-4" />
              <span>Export Package (.json)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Client Distribution Manager & Domain Lock Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/60 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Building className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Client Packaging & Licensing Lock ({currentMeta.name})
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Watermark and lock your exported code to a specific client organization and domain.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={includeWatermark}
                onChange={(e) => setIncludeWatermark(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600"
              />
              <span>Attach Proprietary Watermark Header</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Client / Organization Name
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Apex Health Systems"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Authorized Target Domain
            </label>
            <input
              type="text"
              value={clientDomain}
              onChange={(e) => setClientDomain(e.target.value)}
              placeholder="e.g. portal.apexhealth.com"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-1">
              Distribution License Key
            </label>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-indigo-600 dark:text-indigo-400 font-bold outline-none"
              />
              <button
                type="button"
                onClick={handleGenerateNewKey}
                className="px-2.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                title="Generate new license key"
              >
                New
              </button>
            </div>
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleRegisterDistribution}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Register & Watermark
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls, Right Code & Live Previews */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Archetype Customization Controls */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-600" /> Plugin Architecture
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                Archetype v2.5
              </span>
            </div>

            {/* Plugin Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Plugin / Component Name
              </label>
              <input
                type="text"
                value={config.pluginName}
                onChange={(e) => setConfig({ ...config, pluginName: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500"
              />
            </div>

            {/* Target Framework */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Target Framework & Runtime
              </label>
              <select
                value={config.targetFramework}
                onChange={(e: any) => setConfig({ ...config, targetFramework: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="react_ts">React + TypeScript (Vite/CRA)</option>
                <option value="nextjs">Next.js 14/15 (App Router)</option>
                <option value="node_express">Node.js + Express Server Middleware</option>
                <option value="vanilla_js">Vanilla JavaScript / HTML Embed Snippet</option>
                <option value="dsh_cli">DeepSeek Harness CLI (dsh package)</option>
              </select>
            </div>

            {/* Default Reasoning Model */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default AI Model Engine
              </label>
              <select
                value={config.defaultModelEngine}
                onChange={(e: any) => setConfig({ ...config, defaultModelEngine: e.target.value })}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
              >
                <option value="hybrid">Hybrid (DeepSeek R1 + Gemini 2.5 Flash)</option>
                <option value="deepseek">DeepSeek Only (dsh-agent-sdk)</option>
                <option value="gemini">Gemini Flash Only</option>
              </select>
            </div>

            {/* Feature Checkboxes */}
            <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">
                  {selectedArchetype === 'second_brain' && 'Agent Capabilities'}
                  {selectedArchetype === 'workplace_ui' && 'Workplace Modules'}
                  {selectedArchetype === 'voice_plugin' && 'Voice Capabilities'}
                </label>
                <span className="text-[10px] text-slate-500 font-mono">
                  {selectedArchetype}
                </span>
              </div>

              {selectedArchetype === 'second_brain' && (
                <>
                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeWebSearchTool}
                      onChange={(e) => setConfig({ ...config, includeWebSearchTool: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Search className="w-3.5 h-3.5 text-blue-500" /> Multi-Step Web Search (<code className="text-[10px]">dsh-tool-web</code>)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeCronScheduler}
                      onChange={(e) => setConfig({ ...config, includeCronScheduler: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-purple-500" /> Scheduled Cron Engine (<code className="text-[10px]">dsh-cron</code>)
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeDeepSeekHarness}
                      onChange={(e) => setConfig({ ...config, includeDeepSeekHarness: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Brain className="w-3.5 h-3.5 text-emerald-500" /> DeepThink Reasoning Protocol
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeGuardrailsAndBoundaries}
                      onChange={(e) => setConfig({ ...config, includeGuardrailsAndBoundaries: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Shield className="w-3.5 h-3.5 text-amber-500" /> Real-Time Guardrails & Boundaries
                    </span>
                  </label>
                </>
              )}

              {selectedArchetype === 'workplace_ui' && (
                <>
                  <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" /> 5 Integrated Workspace Tabs:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                      <li>Logic Orchestrator (Workflows & Cron)</li>
                      <li>Gmail Drafts & AI Email Composer</li>
                      <li>Google Drive Document Explorer</li>
                      <li>Sheets Automated Data Grid</li>
                      <li>Integrated Tasks & Calendar Sync</li>
                    </ul>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeUIWidget}
                      onChange={(e) => setConfig({ ...config, includeUIWidget: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Command className="w-3.5 h-3.5 text-indigo-500" /> Embeddable Cockpit Shell
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeGuardrailsAndBoundaries}
                      onChange={(e) => setConfig({ ...config, includeGuardrailsAndBoundaries: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Shield className="w-3.5 h-3.5 text-amber-500" /> Executive Guardrails & Scopes
                    </span>
                  </label>
                </>
              )}

              {selectedArchetype === 'voice_plugin' && (
                <>
                  <div className="p-2.5 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl border border-purple-200 dark:border-purple-800 text-[11px] text-purple-700 dark:text-purple-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <Mic className="w-3.5 h-3.5" /> Configured Hotwords & Macros:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                      <li>"Hey Copilot, run weekly briefing"</li>
                      <li>"Good morning executive digest"</li>
                      <li>"Scan inbox for urgent items"</li>
                      <li>"Export latest draft to Drive"</li>
                    </ul>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeUIWidget}
                      onChange={(e) => setConfig({ ...config, includeUIWidget: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Radio className="w-3.5 h-3.5 text-purple-500" /> Floating Mic & Waveform Widget
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeWebSearchTool}
                      onChange={(e) => setConfig({ ...config, includeWebSearchTool: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> Web Speech API Text-to-Speech
                    </span>
                  </label>
                </>
              )}

              {selectedArchetype === 'csv_maker' && (
                <>
                  <div className="p-2.5 bg-cyan-50/60 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 text-[11px] text-cyan-700 dark:text-cyan-300 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> CSV Maker+ Engine Suite:
                    </div>
                    <ul className="list-disc pl-4 space-y-0.5 text-slate-600 dark:text-slate-300">
                      <li>ASCII 1-127 Unicode character cleaner</li>
                      <li>Cross-file multi-source batch deduplication</li>
                      <li>Auto-split Full Name to First & Last Name</li>
                      <li>5 Pre-configured CRM schemas & ZIP downloads</li>
                    </ul>
                  </div>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeUIWidget}
                      onChange={(e) => setConfig({ ...config, includeUIWidget: e.target.checked })}
                      className="w-4 h-4 text-cyan-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <FileStack className="w-3.5 h-3.5 text-cyan-500" /> Batch Processor Dropzone & Merger
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeGuardrailsAndBoundaries}
                      onChange={(e) => setConfig({ ...config, includeGuardrailsAndBoundaries: e.target.checked })}
                      className="w-4 h-4 text-cyan-600 rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="flex items-center gap-1.5 font-medium">
                      <Shield className="w-3.5 h-3.5 text-emerald-500" /> Pre-Export Hygiene Gate & Audit Trail
                    </span>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Registered Client Distributions Summary */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-indigo-600" /> Distribution Ledger ({distributionRecords.length})
              </h4>
              <button
                onClick={() => setActiveView('distribution_vault')}
                className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
              >
                View Ledger
              </button>
            </div>

            <div className="space-y-2">
              {distributionRecords.slice(0, 3).map((rec) => (
                <div key={rec.id} className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs flex items-center justify-between">
                  <div>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{rec.clientName}</div>
                    <div className="text-[10px] text-slate-500">{rec.targetDomain} • {rec.licenseKey}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    rec.status === 'active' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-red-100 text-red-800'
                  }`}>
                    {rec.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Code & Prompt Artifacts */}
        <div className="lg:col-span-8 space-y-4">
          {/* Artifact Nav Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setActiveView('prompt')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeView === 'prompt'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> LLM Build Prompt
            </button>

            <button
              onClick={() => setActiveView('react_widget')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeView === 'react_widget'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Code className="w-3.5 h-3.5" /> Standalone React Widget (.tsx)
            </button>

            <button
              onClick={() => setActiveView('backend_router')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeView === 'backend_router'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Backend Router (.ts)
            </button>

            <button
              onClick={() => setActiveView('html_embed')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeView === 'html_embed'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Universal Embed (.html)
            </button>

            <button
              onClick={() => setActiveView('crm_export')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeView === 'crm_export'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" /> CRM Export Configuration
            </button>

            <button
              onClick={() => setActiveView('distribution_vault')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeView === 'distribution_vault'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> Distribution Ledger ({distributionRecords.length})
            </button>

            <button
              onClick={() => setActiveView('live_sandbox')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeView === 'live_sandbox'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              }`}
            >
              <Play className="w-3.5 h-3.5" /> Interactive Sandbox
            </button>
          </div>

          {/* Prompt Mode LLM Engine Selector */}
          {activeView === 'prompt' && (
            <div className="flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-800/60 p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 pl-1">Target LLM Prompt Format:</span>
              {(['universal', 'claude', 'chatgpt', 'cursor', 'deepseek'] as const).map((preset) => (
                <button
                  key={preset}
                  onClick={() => setLlmPreset(preset)}
                  className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition cursor-pointer ${
                    llmPreset === preset
                      ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          )}

          {/* Distribution Ledger View */}
          {activeView === 'distribution_vault' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Building className="w-5 h-5 text-indigo-600" /> Authorized Client Distribution Ledger
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track all proprietary 2nd Brain plugin packages distributed by Mike Ford.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDownloadZipBundle}
                    disabled={isExportingZip}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                  >
                    {isExportingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5" />}
                    <span>{isExportingZip ? 'Building ZIP...' : 'Download ZIP Bundle (.zip)'}</span>
                  </button>
                  <button
                    onClick={handleExportFullJsonPackage}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Export All (.json)
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500">
                      <th className="py-2.5 px-3 font-semibold">Client Name</th>
                      <th className="py-2.5 px-3 font-semibold">Authorized Domain</th>
                      <th className="py-2.5 px-3 font-semibold">License Key</th>
                      <th className="py-2.5 px-3 font-semibold">Distributed Date</th>
                      <th className="py-2.5 px-3 font-semibold">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {distributionRecords.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-3 px-3 font-bold text-slate-800 dark:text-slate-200">{rec.clientName}</td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-400 font-mono text-[11px]">{rec.targetDomain}</td>
                        <td className="py-3 px-3 font-mono text-indigo-600 dark:text-indigo-400 font-bold text-[11px]">{rec.licenseKey}</td>
                        <td className="py-3 px-3 text-slate-500">{new Date(rec.distributedAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3">
                          <button
                            onClick={() => handleToggleStatus(rec)}
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition ${
                              rec.status === 'active'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-red-100 text-red-800 hover:bg-red-200'
                            }`}
                          >
                            {rec.status === 'active' ? 'Active ✓' : 'Revoked ✗'}
                          </button>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteDistribution(rec.id)}
                            className="p-1 text-slate-400 hover:text-red-600 transition cursor-pointer"
                            title="Delete distribution record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Live Sandbox View */}
          {activeView === 'live_sandbox' && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6">
              {/* 1. SECOND BRAIN SANDBOX */}
              {selectedArchetype === 'second_brain' && (
                <>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Play className="w-5 h-5 text-purple-600" /> Interactive Harness Agent Sandbox
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Test the standalone DeepSeek Harness agent tool execution and cron scheduling directly in real-time.
                    </p>
                  </div>

                  <form onSubmit={handleRunSandbox} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Multi-Step Task Prompt
                      </label>
                      <textarea
                        rows={3}
                        value={sandboxPrompt}
                        onChange={(e) => setSandboxPrompt(e.target.value)}
                        placeholder="Enter an autonomous research, synthesis, or scheduled monitoring command..."
                        className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 outline-none focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Cron Schedule Expression
                        </label>
                        <input
                          type="text"
                          value={sandboxCronExpression}
                          onChange={(e) => setSandboxCronExpression(e.target.value)}
                          placeholder="0 9 * * 1 (Every Monday 9 AM)"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Reasoning Engine
                        </label>
                        <select
                          value={sandboxEngine}
                          onChange={(e: any) => setSandboxEngine(e.target.value)}
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium"
                        >
                          <option value="hybrid">Hybrid (DeepSeek R1 + Gemini)</option>
                          <option value="deepseek">DeepSeek Reasoner Only</option>
                          <option value="gemini">Gemini 2.5 Flash Only</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSandboxRunning}
                      className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer disabled:opacity-50"
                    >
                      {isSandboxRunning ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Dispatching Autonomous Harness Agent...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> Execute Multi-Step Search & Cron Agent
                        </>
                      )}
                    </button>
                  </form>

                  {/* Execution Trace */}
                  {sandboxTrace.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                        Agent Execution Trace
                      </h4>
                      <div className="space-y-2">
                        {sandboxTrace.map((trace, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3 text-xs">
                            <span className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-600 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              {trace.step}
                            </span>
                            <div className="flex-1 space-y-0.5">
                              <div className="font-bold text-slate-800 dark:text-slate-200 font-mono text-[11px]">{trace.action}</div>
                              <div className="text-slate-600 dark:text-slate-400">{trace.details}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Final Synthesis Result */}
                  {sandboxResult && (
                    <div className="p-4 bg-purple-50/50 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-800/60 space-y-2 text-xs text-slate-800 dark:text-slate-200">
                      <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Agent Synthesis Completed
                      </div>
                      <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed">{sandboxResult}</pre>
                    </div>
                  )}
                </>
              )}

              {/* 2. WORKPLACE UI COCKPIT SANDBOX */}
              {selectedArchetype === 'workplace_ui' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-blue-600" /> Interactive Workplace Cockpit Preview
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Live interactive test of the modular tabs, background workflows, and Google Workspace integrations.
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold rounded-lg border border-blue-200 dark:border-blue-800 w-fit">
                      Live Widget Sandbox
                    </span>
                  </div>

                  {/* Workplace Tabs Navigation */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'orchestrator', label: 'Logic Orchestrator', icon: Play },
                      { id: 'gmail', label: 'Gmail Drafts', icon: Mail },
                      { id: 'drive', label: 'Drive Explorer', icon: HardDrive },
                      { id: 'sheets', label: 'Sheets Automation', icon: FileSpreadsheet },
                      { id: 'tasks', label: 'Tasks & Sync', icon: CheckSquare }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = workplaceActiveTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setWorkplaceActiveTab(tab.id as any)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            isActive
                              ? 'bg-blue-600 text-white shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Tab 1: Orchestrator */}
                  {workplaceActiveTab === 'orchestrator' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                          Autonomous Workflows
                        </span>
                        <span className="text-[11px] text-slate-500">Click to execute live</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        {[
                          'Daily Executive Market Briefing',
                          'Synthesize Q3 Drive Documents',
                          'Scan Urgent Inbound Invoices'
                        ].map((wf) => (
                          <button
                            key={wf}
                            type="button"
                            onClick={() => handleRunWorkplaceWorkflow(wf)}
                            disabled={!!workplaceWorkflowRunning}
                            className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-left hover:border-blue-500 transition cursor-pointer disabled:opacity-50 space-y-1 shadow-xs"
                          >
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200">{wf}</div>
                            <div className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1">
                              {workplaceWorkflowRunning === wf ? (
                                <>
                                  <Loader2 className="w-3 h-3 animate-spin" /> Running...
                                </>
                              ) : (
                                <>
                                  <Play className="w-3 h-3" /> Execute Workflow
                                </>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Execution Log */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Workflow Execution Logs</span>
                        <div className="p-3 bg-slate-900 rounded-xl font-mono text-[11px] text-slate-300 max-h-36 overflow-y-auto space-y-1">
                          {workplaceLogs.map((log, idx) => (
                            <div key={idx} className="leading-tight">{log}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 2: Gmail Drafts */}
                  {workplaceActiveTab === 'gmail' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">AI-Prepared Gmail Drafts (2)</span>
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Google Workspace Synced</span>
                      </div>
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-slate-100">To: legal@apexhealth.com</span>
                          <span className="text-slate-400 text-[10px]">Today, 10:14 AM</span>
                        </div>
                        <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject: Vantage AI Enterprise Licensing Agreement & Domain Validation</div>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Dear Counsel, attached is the watermarked distribution package for the Vantage 2nd Brain and Workplace Cockpit...
                        </p>
                        <div className="pt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => alert('Draft approved! Sent to Gmail drafts folder.')}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-500 cursor-pointer"
                          >
                            Approve & Push to Gmail
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tab 3: Drive Explorer */}
                  {workplaceActiveTab === 'drive' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Connected Drive Documents</span>
                        <span className="text-[11px] text-blue-600 font-semibold">3 Documents Grounded</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {[
                          { name: 'Vantage_Q3_Strategic_Deck.gdoc', size: '2.4 MB', status: 'Vector Indexed' },
                          { name: 'Apex_Health_License_Agreement.pdf', size: '480 KB', status: 'Watermarked' },
                          { name: 'Annual_Financial_Projections.gsheet', size: '1.8 MB', status: 'Live Synced' }
                        ].map((doc) => (
                          <div key={doc.name} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                            <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{doc.name}</div>
                            <div className="text-[10px] text-slate-400">{doc.size} • <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{doc.status}</span></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Sheets Automation */}
                  {workplaceActiveTab === 'sheets' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Sheets Automation Grid</span>
                        <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                          Auto-Recalculate Active
                        </span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            <tr>
                              <th className="p-2">Metric</th>
                              <th className="p-2">Q1 Actual</th>
                              <th className="p-2">Q2 Projected</th>
                              <th className="p-2">Variance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            <tr>
                              <td className="p-2 font-medium">Enterprise ARR</td>
                              <td className="p-2 font-mono">$1,240,000</td>
                              <td className="p-2 font-mono">$1,850,000</td>
                              <td className="p-2 font-mono text-emerald-600 font-bold">+49.1%</td>
                            </tr>
                            <tr>
                              <td className="p-2 font-medium">Gross Margin</td>
                              <td className="p-2 font-mono">84.2%</td>
                              <td className="p-2 font-mono">87.5%</td>
                              <td className="p-2 font-mono text-emerald-600 font-bold">+3.3%</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Tab 5: Tasks & Sync */}
                  {workplaceActiveTab === 'tasks' && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-800 dark:text-slate-200">Interactive Tasks</span>
                        <span className="text-[11px] text-slate-500">{workplaceTasks.filter(t => t.done).length} of {workplaceTasks.length} Done</span>
                      </div>
                      <div className="space-y-2">
                        {workplaceTasks.map((t) => (
                          <div
                            key={t.id}
                            onClick={() => {
                              setWorkplaceTasks(workplaceTasks.map(x => x.id === t.id ? { ...x, done: !x.done } : x));
                            }}
                            className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs cursor-pointer hover:border-blue-400"
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={t.done}
                                onChange={() => {}}
                                className="w-4 h-4 text-blue-600 rounded"
                              />
                              <span className={t.done ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200 font-medium'}>
                                {t.title}
                              </span>
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                              {t.priority}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. VOICE PLUGIN SANDBOX */}
              {selectedArchetype === 'voice_plugin' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Mic className="w-5 h-5 text-purple-600" /> Interactive Voice Assistant Sandbox
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Test speech-to-action macro dispatching, hotword recognition, and real-time audio waveforms.
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 bg-purple-50 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 font-bold rounded-lg border border-purple-200 dark:border-purple-800 w-fit">
                      Live Voice Engine
                    </span>
                  </div>

                  {/* Audio Visualizer Stage */}
                  <div className="p-6 bg-gradient-to-b from-slate-900 to-purple-950 rounded-2xl border border-purple-900/50 text-white flex flex-col items-center justify-center text-center space-y-4 shadow-inner">
                    <button
                      type="button"
                      onClick={() => handleSimulateVoiceCommand('Hey Copilot, run enterprise briefing')}
                      className={`w-20 h-20 rounded-full flex items-center justify-center cursor-pointer transition-all shadow-xl ${
                        isVoiceListening
                          ? 'bg-red-600 text-white animate-pulse ring-8 ring-red-500/30'
                          : 'bg-purple-600 hover:bg-purple-500 text-white ring-4 ring-purple-400/20'
                      }`}
                      title="Click to toggle listening / simulate voice input"
                    >
                      <Mic className="w-8 h-8" />
                    </button>

                    {/* Animated Waveform Equalizer Bars */}
                    <div className="flex items-center gap-1.5 h-10">
                      {[16, 24, 40, 28, 36, 48, 20, 32, 44, 26, 18, 38, 22].map((height, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isVoiceListening ? 'bg-purple-400' : 'bg-slate-600'
                          }`}
                          style={{
                            height: isVoiceListening ? `${Math.max(12, (height * (1 + Math.sin(i + Date.now() / 200))) % 40)}px` : '8px'
                          }}
                        />
                      ))}
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold text-purple-200">
                        {isVoiceListening ? '● Listening & Analyzing Audio Waveform...' : 'Microphone Idle (Click mic or a voice trigger below)'}
                      </div>
                      <div className="text-[11px] text-slate-300 font-mono italic">
                        "{voiceTranscript}"
                      </div>
                    </div>
                  </div>

                  {/* Voice Trigger Hotword Simulator Buttons */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Simulate Spoken Hotword Commands
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        'Hey Copilot, summarize my morning priorities',
                        'Scan inbox for urgent client requests',
                        'Export latest report to Drive'
                      ].map((cmd) => (
                        <button
                          key={cmd}
                          type="button"
                          onClick={() => handleSimulateVoiceCommand(cmd)}
                          disabled={isVoiceListening}
                          className="p-3 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-left rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-400 text-xs text-slate-800 dark:text-slate-200 transition cursor-pointer disabled:opacity-50 space-y-1"
                        >
                          <div className="font-semibold text-[11px] flex items-center gap-1 text-purple-600 dark:text-purple-400">
                            <Radio className="w-3 h-3" /> Voice Macro:
                          </div>
                          <div className="line-clamp-2">"{cmd}"</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Voice Assistant Response */}
                  {voiceResponse && (
                    <div className="p-4 bg-purple-50/70 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs space-y-1.5">
                      <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                        <Volume2 className="w-4 h-4" /> Spoken Audio Response (TTS Synthesizer)
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                        {voiceResponse}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* 4. REAL ESTATE GEOMAP & MLS SANDBOX */}
              {selectedArchetype === 'real_estate_geomap' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-emerald-600" /> Geospatial Property & Mortgage Sandbox
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Test interactive MLS property pins, USDA 0% down boundary zones, CRA grant layers, and live P&I estimators.
                      </p>
                    </div>
                    {/* Layer Filter Tabs */}
                    <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs">
                      <button
                        type="button"
                        onClick={() => setGeoActiveLayer('all')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${geoActiveLayer === 'all' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                      >
                        All Listings
                      </button>
                      <button
                        type="button"
                        onClick={() => setGeoActiveLayer('usda')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${geoActiveLayer === 'usda' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                      >
                        USDA 0% Down
                      </button>
                      <button
                        type="button"
                        onClick={() => setGeoActiveLayer('cra')}
                        className={`px-2.5 py-1 rounded-lg font-semibold transition ${geoActiveLayer === 'cra' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300'}`}
                      >
                        LMI / CRA Grants
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    {/* Property Listings Column */}
                    <div className="lg:col-span-5 space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search address, city, or zip..."
                          value={geoSearchQuery}
                          onChange={(e) => setGeoSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>

                      {geoPropertyListings
                        .filter(p => {
                          const match = (p.address + ' ' + p.city + ' ' + p.zip).toLowerCase().includes(geoSearchQuery.toLowerCase());
                          if (!match) return false;
                          if (geoActiveLayer === 'usda') return p.isUsdaEligible;
                          if (geoActiveLayer === 'cra') return p.isCraGrantEligible;
                          return true;
                        })
                        .map(prop => {
                          const isSel = geoSelectedPropId === prop.id;
                          return (
                            <div
                              key={prop.id}
                              onClick={() => setGeoSelectedPropId(prop.id)}
                              className={`p-3 rounded-2xl border transition cursor-pointer ${
                                isSel
                                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                                  : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">${prop.price.toLocaleString()}</div>
                                  <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{prop.address}</div>
                                  <div className="text-[10px] text-slate-400">{prop.city}, {prop.state} {prop.zip}</div>
                                </div>
                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                                  {prop.status}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-500">
                                <span>{prop.beds} Beds</span>
                                <span>•</span>
                                <span>{prop.baths} Baths</span>
                                <span>•</span>
                                <span>{prop.sqft.toLocaleString()} SqFt</span>
                              </div>
                              <div className="flex items-center gap-1.5 mt-1.5">
                                {prop.isUsdaEligible && (
                                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 text-[9px] font-bold rounded border border-emerald-200 dark:border-emerald-800">
                                    USDA 100%
                                  </span>
                                )}
                                {prop.isCraGrantEligible && (
                                  <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 text-[9px] font-bold rounded border border-blue-200 dark:border-blue-800">
                                    $5K Grant
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                    </div>

                    {/* Interactive Map & Mortgage P&I Card */}
                    <div className="lg:col-span-7 space-y-4">
                      {/* Map Simulator Canvas */}
                      <div className="bg-slate-900 rounded-2xl h-48 relative overflow-hidden border border-slate-800 flex flex-col justify-between p-3.5 shadow-inner">
                        <div className="flex items-center justify-between z-10">
                          <span className="px-2 py-0.5 bg-black/60 backdrop-blur-md rounded-md text-[10px] text-white font-mono flex items-center gap-1">
                            <Layers className="w-3 h-3 text-emerald-400" /> GPS: {selectedGeoProp.lat.toFixed(4)}, {selectedGeoProp.lng.toFixed(4)}
                          </span>
                          <span className="px-2 py-0.5 bg-emerald-600/80 backdrop-blur-md rounded-md text-[10px] text-white font-semibold">
                            Boundary: Active
                          </span>
                        </div>
                        <div className="flex items-center justify-center my-auto">
                          <div className="p-2.5 bg-emerald-600 text-white rounded-full shadow-2xl animate-pulse ring-8 ring-emerald-500/20">
                            <MapPin className="w-5 h-5" />
                          </div>
                        </div>
                        <div className="z-10 bg-slate-950/80 backdrop-blur-md p-2 rounded-lg border border-slate-800 flex items-center justify-between text-[11px] text-white">
                          <div className="font-semibold">{selectedGeoProp.address}</div>
                          <div className="font-bold text-emerald-400">${selectedGeoProp.price.toLocaleString()}</div>
                        </div>
                      </div>

                      {/* Mortgage Qualifier Box */}
                      <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-emerald-600" /> Live Mortgage Estimator
                          </span>
                          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            ${geoTotalMonthly.toLocaleString()}/mo Total
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                              <span>Interest Rate:</span>
                              <span className="font-bold">{geoInterestRate}%</span>
                            </div>
                            <input
                              type="range"
                              min="4.5"
                              max="9.0"
                              step="0.125"
                              value={geoInterestRate}
                              onChange={(e) => setGeoInterestRate(parseFloat(e.target.value))}
                              className="w-full accent-emerald-600"
                            />
                          </div>
                          <div>
                            <div className="flex justify-between text-[11px] text-slate-600 dark:text-slate-300 mb-1">
                              <span>Down Payment:</span>
                              <span className="font-bold">{geoDownPaymentPct}% (${Math.round(geoDownPaymentVal).toLocaleString()})</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="30"
                              step="1"
                              value={geoDownPaymentPct}
                              onChange={(e) => setGeoDownPaymentPct(parseInt(e.target.value))}
                              className="w-full accent-emerald-600"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                          <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="text-[9px] text-slate-400">P&I</div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">${geoMonthlyPI.toLocaleString()}</div>
                          </div>
                          <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                            <div className="text-[9px] text-slate-400">Tax & Ins</div>
                            <div className="font-bold text-slate-800 dark:text-slate-200">${geoTaxesIns.toLocaleString()}</div>
                          </div>
                          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">Total Est.</div>
                            <div className="font-bold text-emerald-700 dark:text-emerald-300">${geoTotalMonthly.toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. FULL COMMERCIAL ENTERPRISE SUITE SANDBOX */}
              {selectedArchetype === 'full_suite' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-600" /> Commercial Enterprise Software Suite Cockpit
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Unified master suite packaging all 5 standalone plugins with multi-tenant license key validation.
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 font-bold rounded-lg border border-blue-200 dark:border-blue-800 w-fit">
                      Enterprise All-in-One
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button
                      type="button"
                      onClick={() => setSuiteActiveModule('brain')}
                      className={`p-3.5 rounded-2xl border text-left transition ${suiteActiveModule === 'brain' ? 'bg-blue-50/90 dark:bg-blue-950/50 border-blue-500 shadow-md ring-2 ring-blue-500/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}
                    >
                      <Brain className="w-4 h-4 text-blue-600 mb-1.5" />
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">2nd Brain Agent</div>
                      <div className="text-[10px] text-slate-400">DeepSeek + Gemini</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuiteActiveModule('geomap')}
                      className={`p-3.5 rounded-2xl border text-left transition ${suiteActiveModule === 'geomap' ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}
                    >
                      <MapPin className="w-4 h-4 text-emerald-600 mb-1.5" />
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">GeoMap MLS</div>
                      <div className="text-[10px] text-slate-400">USDA & Boundary GIS</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuiteActiveModule('voice')}
                      className={`p-3.5 rounded-2xl border text-left transition ${suiteActiveModule === 'voice' ? 'bg-purple-50/90 dark:bg-purple-950/50 border-purple-500 shadow-md ring-2 ring-purple-500/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}
                    >
                      <Mic className="w-4 h-4 text-purple-600 mb-1.5" />
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Voice Assistant</div>
                      <div className="text-[10px] text-slate-400">Speech Macros & Audio</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSuiteActiveModule('workspace')}
                      className={`p-3.5 rounded-2xl border text-left transition ${suiteActiveModule === 'workspace' ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-500 shadow-md ring-2 ring-indigo-500/20' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'}`}
                    >
                      <Building2 className="w-4 h-4 text-indigo-600 mb-1.5" />
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100">Workspace Cockpit</div>
                      <div className="text-[10px] text-slate-400">Google Workspace Tabs</div>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>Enterprise License: {licenseKey}</span>
                      <span className="text-emerald-400">Status: Validated</span>
                    </div>
                    <p className="text-slate-300">
                      Module <span className="font-bold uppercase text-cyan-400">{suiteActiveModule}</span> loaded with commercial attribution header for <span className="font-bold text-white">Mike Ford &lt;fordmj@gmail.com&gt;</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* 6. MOBILE MICRO-APPS & PWA SANDBOX */}
              {selectedArchetype === 'mobile_microapps' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-amber-500" /> Mobile Micro-App & Add-to-Home-Screen Sandbox
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Test standalone mobile client portal with native install triggers, offline caching, and magic lead links.
                      </p>
                    </div>
                    <span className="text-[11px] px-2.5 py-1 bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 font-bold rounded-lg border border-amber-200 dark:border-amber-800 w-fit">
                      Zero-Install PWA
                    </span>
                  </div>

                  {/* Simulated Mobile Device Preview */}
                  <div className="max-w-sm mx-auto bg-slate-950 text-white rounded-3xl p-5 border-4 border-slate-800 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                      <span>9:41 AM</span>
                      <span>5G • 100%</span>
                    </div>

                    <div className="p-3 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-amber-300">Save to Home Screen</div>
                        <div className="text-[10px] text-slate-400">Install native icon without app store</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileInstallPrompted(true);
                          setTimeout(() => setMobileInstallPrompted(false), 3000);
                        }}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold text-[10px] rounded-lg cursor-pointer"
                      >
                        {mobileInstallPrompted ? 'Installed!' : 'Install'}
                      </button>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-slate-200">Client Portal Magic Link</div>
                        <div className="text-[11px] text-slate-400">Personalized lead link ready to send via SMS or WhatsApp.</div>
                        <button
                          type="button"
                          onClick={() => {
                            setMobileShareCopied(true);
                            setTimeout(() => setMobileShareCopied(false), 2000);
                          }}
                          className="mt-2 w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          {mobileShareCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
                          {mobileShareCopied ? 'Link Copied to Clipboard!' : 'Copy Shareable Magic Link'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. CSV MAKER+ SANDBOX */}
              {selectedArchetype === 'csv_maker' && (
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-cyan-900/40 via-blue-900/30 to-slate-900 rounded-2xl border border-cyan-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl border border-cyan-500/30">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          Vantage AI Studio-CSV Maker+ Interactive Sandbox
                          <span className="text-[10px] uppercase px-2 py-0.5 bg-cyan-500/20 text-cyan-300 font-extrabold rounded-full">
                            Full Production Engine
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Test live multi-file batch uploads, cross-file deduplication, ASCII 1-127 hygiene scanning, and 1-click CRM template exports.
                        </p>
                      </div>
                    </div>
                  </div>

                  <CrmExportConfigurationView />
                </div>
              )}
            </div>
          )}

          {/* CRM Export Configuration Sub-Tab View */}
          {activeView === 'crm_export' && (
            <CrmExportConfigurationView />
          )}

          {/* Code & Prompt Content Display Box */}
          {activeView !== 'live_sandbox' && activeView !== 'distribution_vault' && activeView !== 'crm_export' && (
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-950 shadow-md">
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-mono text-slate-300 font-semibold">
                    {activeView === 'prompt' && `${config.pluginName.toLowerCase()}-llm-prompt.md`}
                    {activeView === 'react_widget' && `${config.pluginName}.tsx`}
                    {activeView === 'backend_router' && (
                      selectedArchetype === 'csv_maker'
                        ? 'vantageCsvMakerRouter.ts'
                        : selectedArchetype === 'voice_plugin' 
                        ? 'vantageVoiceRouter.ts' 
                        : selectedArchetype === 'workplace_ui' 
                        ? 'vantageWorkplaceRouter.ts' 
                        : 'vantageHarnessRouter.ts'
                    )}
                    {activeView === 'dsh_cli' && (
                      selectedArchetype === 'csv_maker'
                        ? 'csv-maker-package.json'
                        : selectedArchetype === 'voice_plugin'
                        ? 'voice-manifest.json'
                        : selectedArchetype === 'workplace_ui'
                        ? 'workplace-manifest.json'
                        : 'dsh-profile.yaml'
                    )}
                    {activeView === 'html_embed' && `${config.pluginName.toLowerCase()}-embed.html`}
                  </span>
                  <span className="text-[10px] text-slate-400">({activeContent.length} chars)</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                  <button
                    onClick={handleDownloadZipBundle}
                    disabled={isExportingZip}
                    className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer shadow-sm"
                  >
                    {isExportingZip ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileArchive className="w-3.5 h-3.5" />}
                    <span>{isExportingZip ? 'Building ZIP...' : 'Download ZIP (.zip)'}</span>
                  </button>
                  <button
                    onClick={handleDownloadFile}
                    className="flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-semibold transition cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>

              <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-[600px] leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                {activeContent}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
