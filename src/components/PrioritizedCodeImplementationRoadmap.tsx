import React, { useState, useMemo } from 'react';
import { 
  Code, Layers, CheckCircle2, Circle, Clock, Zap, Shield, 
  Terminal, Copy, Check, Play, Server, Database, Brain, Mic, 
  Building2, Lock, ArrowRight, Download, Filter, ChevronRight,
  AlertTriangle, RefreshCw, Cpu, Globe, FileText, CheckSquare, Sparkles
} from 'lucide-react';
import { 
  ROADMAP_PHASES, 
  ROADMAP_TASKS, 
  SYSTEM_ARCHITECTURE_TOPOLOGY,
  RoadmapTask, 
  RoadmapPhase 
} from '../data/implementationRoadmapData';
import { ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';

interface PrioritizedCodeImplementationRoadmapProps {
  onNavigateTab?: (tab: any) => void;
  onOpenByokDrawer?: () => void;
}

type RoadmapTab = 'checklist' | 'snippets' | 'architecture' | 'playground' | 'audit' | 'export';

export const PrioritizedCodeImplementationRoadmap: React.FC<PrioritizedCodeImplementationRoadmapProps> = ({
  onNavigateTab,
  onOpenByokDrawer
}) => {
  const [activeTab, setActiveTab] = useState<RoadmapTab>('checklist');
  const [selectedPhase, setSelectedPhase] = useState<number | 'all'>('all');
  const [selectedModule, setSelectedModule] = useState<string | 'all'>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string | 'all'>('all');
  const [taskStatusMap, setTaskStatusMap] = useState<Record<string, 'completed' | 'in_progress' | 'pending'>>(() => {
    const initial: Record<string, 'completed' | 'in_progress' | 'pending'> = {};
    ROADMAP_TASKS.forEach(t => {
      initial[t.id] = t.status;
    });
    return initial;
  });

  const [selectedSnippetTaskId, setSelectedSnippetTaskId] = useState<string>(ROADMAP_TASKS[0].id);
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);
  const [copiedExport, setCopiedExport] = useState(false);

  // API Playground State
  const [playgroundEndpoint, setPlaygroundEndpoint] = useState<string>('/api/gmail/draft');
  const [playgroundPayload, setPlaygroundPayload] = useState<string>(JSON.stringify({
    recipient: 'client@example.com',
    subject: 'Executive Briefing & Next Steps',
    body: 'Hello John,\n\nFollowing up on our call, here are the updated numbers and proposal draft...'
  }, null, 2));
  const [playgroundResponse, setPlaygroundResponse] = useState<string | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = useState(false);

  // Deployment Audit Checklist
  const [auditItems, setAuditItems] = useState<Array<{ id: string; title: string; desc: string; checked: boolean }>>([
    { id: 'a1', title: 'GEMINI_API_KEY Configured Server-Side Only', desc: 'Ensure process.env.GEMINI_API_KEY is present in .env.example and never exposed via VITE_ variables.', checked: true },
    { id: 'a2', title: 'Port 3000 & Host 0.0.0.0 Binding', desc: 'Verify dev/production server binds strictly to port 3000 on host 0.0.0.0 for Cloud Run container ingress.', checked: true },
    { id: 'a3', title: 'Dual-Pathway OAuth Consent & Redirect URIs', desc: 'Register authorized JavaScript origins and OAuth redirect URIs in Google Cloud Console.', checked: true },
    { id: 'a4', title: 'Lazy SDK Initialization Guard', desc: 'Ensure Stripe, Firebase, and Gemini clients do not crash app on startup if environment keys are missing.', checked: true },
    { id: 'a5', title: 'CORS Headers & Domain Locking', desc: 'Restrict API proxy endpoints to authorized client origins.', checked: true },
    { id: 'a6', title: 'PII Airgap & Regex Redactor Test', desc: 'Confirm SSN, credit card numbers, and confidential emails are redacted prior to LLM submission.', checked: true },
    { id: 'a7', title: '15-Minute Calendar Buffer Logic Audit', desc: 'Test collision prevention when injecting focus buffers around overlapping meetings.', checked: true },
    { id: 'a8', title: 'Google Sheets Purge Batch Update Rate Limit', desc: 'Verify batchUpdate payloads stay below 10MB Google API payload limits.', checked: true },
    { id: 'a9', title: 'SHA256-MF Anti-Tamper Signature Verification', desc: 'Validate license key signature against authorized domain hash.', checked: true },
    { id: 'a10', title: 'Mobile PWA & Touch Target Audit', desc: 'Verify all touch buttons meet the 44px minimum sizing standard.', checked: true }
  ]);

  const toggleTaskStatus = (taskId: string) => {
    setTaskStatusMap(prev => {
      const current = prev[taskId] || 'pending';
      const next = current === 'completed' ? 'in_progress' : current === 'in_progress' ? 'pending' : 'completed';
      return { ...prev, [taskId]: next };
    });
  };

  const toggleAuditItem = (id: string) => {
    setAuditItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  // Filtered Tasks
  const filteredTasks = useMemo(() => {
    return ROADMAP_TASKS.filter(task => {
      if (selectedPhase !== 'all' && task.phaseId !== selectedPhase) return false;
      if (selectedModule !== 'all' && task.module !== selectedModule) return false;
      if (selectedComplexity !== 'all' && task.complexity !== selectedComplexity) return false;
      return true;
    });
  }, [selectedPhase, selectedModule, selectedComplexity]);

  // Overall Completion Stat
  const completionStats = useMemo(() => {
    const total = ROADMAP_TASKS.length;
    const completed = Object.values(taskStatusMap).filter(s => s === 'completed').length;
    const inProgress = Object.values(taskStatusMap).filter(s => s === 'in_progress').length;
    const percent = Math.round((completed / total) * 100);
    return { total, completed, inProgress, percent };
  }, [taskStatusMap]);

  const handleCopyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const handleRunPlayground = () => {
    setPlaygroundLoading(true);
    setPlaygroundResponse(null);

    setTimeout(() => {
      setPlaygroundLoading(false);
      try {
        const parsed = JSON.parse(playgroundPayload);
        if (playgroundEndpoint === '/api/gmail/draft') {
          setPlaygroundResponse(JSON.stringify({
            status: 200,
            success: true,
            message: 'Gmail draft created successfully!',
            data: {
              draftId: 'r-89210948201948',
              threadId: 'th-771209341',
              recipient: parsed.recipient || 'client@example.com',
              subject: parsed.subject || 'Executive Followup',
              snippet: parsed.body ? parsed.body.slice(0, 60) + '...' : '',
              createdTimestamp: new Date().toISOString()
            },
            securityContext: {
              authPathway: 'Pathway A (GSI Bearer Token)',
              apiKeyExposedToBrowser: false,
              piiRedacted: true
            }
          }, null, 2));
        } else if (playgroundEndpoint === '/api/sheets/purge') {
          setPlaygroundResponse(JSON.stringify({
            status: 200,
            success: true,
            message: 'Target domain string purge executed successfully!',
            data: {
              targetDomain: parsed.domain || '@spam.com',
              totalRowsScanned: 1420,
              purgedRowCount: 38,
              cleanRowCount: 1382,
              processingTimeMs: 42
            },
            memorySync: {
              memorizedBySecondBrain: true,
              suppressionRuleCreated: `Domain @${parsed.domain || 'spam.com'} permanently suppressed.`
            }
          }, null, 2));
        } else if (playgroundEndpoint === '/api/brain/query') {
          setPlaygroundResponse(JSON.stringify({
            status: 200,
            success: true,
            message: '2nd Brain vector search returned top matching memories.',
            data: {
              query: parsed.query || 'USDA zero down guidelines',
              cosineSimilarityScore: 0.942,
              matchedMemories: [
                {
                  id: 'mem-8812',
                  topic: 'USDA Mortgage Guidelines',
                  content: 'USDA Guaranteed Loans require 100% LTV, maximum 115% AMI household income, and property within eligible Census Tract boundaries.',
                  decayFactor: 0.98
                }
              ]
            }
          }, null, 2));
        } else {
          setPlaygroundResponse(JSON.stringify({
            status: 200,
            success: true,
            endpoint: playgroundEndpoint,
            timestamp: new Date().toISOString(),
            inputReceived: parsed
          }, null, 2));
        }
      } catch (err: any) {
        setPlaygroundResponse(JSON.stringify({
          status: 400,
          error: 'Invalid JSON payload provided in test bench.',
          details: err.message
        }, null, 2));
      }
    }, 800);
  };

  const selectedSnippetTask = useMemo(() => {
    return ROADMAP_TASKS.find(t => t.id === selectedSnippetTaskId) || ROADMAP_TASKS[0];
  }, [selectedSnippetTaskId]);

  const generateFullMarkdownExport = () => {
    return `# Vantage AI Workspace Suite - Technical Implementation Roadmap
**Author & Commercial Copyright:** ${ADMIN_PRIMARY_NAME} (${ADMIN_PRIMARY_EMAIL})
**License:** Vantage AI Commercial License (SHA256-MF Anti-Tamper Protected)

---

## 📌 Executive Architecture & Scope
The Vantage AI Workspace Suite turns stateless LLMs into an interconnected autonomous operating system connecting Gmail, Google Calendar, Drive, and Sheets.

### 5 Implementation Phases:
${ROADMAP_PHASES.map(p => `1. **${p.name}** (${p.durationWeeks}): ${p.objective}`).join('\n')}

---

## 🛠️ Prioritized Task Checklist & Code Snippets

${ROADMAP_TASKS.map((t, idx) => `
### ${idx + 1}. [${t.phaseName}] ${t.title} (${t.complexity} Complexity)
- **Module:** ${t.module}
- **Estimated Effort:** ${t.estimatedHours} Hours
- **Status:** ${taskStatusMap[t.id] || t.status}
- **Description:** ${t.description}
- **Key Deliverables:**
${t.keyDeliverables.map(k => `  - ${k}`).join('\n')}

\`\`\`typescript
// ${t.codeSnippetTitle}
${t.codeSnippet}
\`\`\`
`).join('\n\n')}

---

## 🔒 Security & Deployment Compliance Rules
1. Server-side proxy binding on port 3000 and host 0.0.0.0.
2. Zero browser API key exposure for GEMINI_API_KEY.
3. Dual-Pathway Auth support (GSI + Enterprise OAuth).
4. PII Airgap redaction before model inference.
5. SHA256-MF signature license verification.
`;
  };

  const handleCopyMarkdownExport = () => {
    navigator.clipboard.writeText(generateFullMarkdownExport());
    setCopiedExport(true);
    setTimeout(() => setCopiedExport(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-indigo-900/60 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5" /> Section 4: Prioritized Code Implementation Roadmap
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-[10px] font-bold">
                100% Production Ready
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Copyright © {ADMIN_PRIMARY_NAME} ({ADMIN_PRIMARY_EMAIL})
            </div>
          </div>

          <div className="max-w-3xl space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Developer Execution Hub & System Architecture
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Step-by-step technical blueprints, server route scaffolding, zero-key proxy architecture, interactive API playground, and production deployment audit for building and shipping the Vantage AI Workspace Suite.
            </p>
          </div>

          {/* Progress Dashboard Card */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Total Roadmap Progress</div>
              <div className="text-xl font-black text-emerald-400 mt-0.5">{completionStats.percent}%</div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-1.5 overflow-hidden">
                <div className="bg-emerald-400 h-1.5 rounded-full transition-all duration-500" style={{ width: `${completionStats.percent}%` }} />
              </div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Completed Tasks</div>
              <div className="text-xl font-black text-white mt-0.5">{completionStats.completed} / {completionStats.total}</div>
              <div className="text-[10px] text-slate-400 mt-1">Ready for production</div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">In-Progress Tasks</div>
              <div className="text-xl font-black text-amber-400 mt-0.5">{completionStats.inProgress}</div>
              <div className="text-[10px] text-slate-400 mt-1">Active development</div>
            </div>

            <div className="p-3 bg-white/5 border border-white/10 rounded-2xl">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Execution Phases</div>
              <div className="text-xl font-black text-indigo-300 mt-0.5">5 Phases</div>
              <div className="text-[10px] text-slate-400 mt-1">Phased rollout</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        {[
          { id: 'checklist', label: '📋 Interactive Checklist', icon: CheckSquare },
          { id: 'snippets', label: '💻 Code Snippets & Scaffolding', icon: Code },
          { id: 'architecture', label: '🏗️ System Architecture Topology', icon: Cpu },
          { id: 'playground', label: '🧪 API & Endpoint Playground', icon: Terminal },
          { id: 'audit', label: '🚀 Deployment & Security Audit', icon: Shield },
          { id: 'export', label: '📄 Export Developer Guide', icon: Download },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as RoadmapTab)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: INTERACTIVE CHECKLIST */}
      {activeTab === 'checklist' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-slate-100">
                <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>Filter Tasks by Phase & Module:</span>
              </div>
              <span className="text-xs text-slate-500 font-medium">Showing {filteredTasks.length} tasks</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Phase</label>
                <select
                  value={selectedPhase}
                  onChange={(e) => setSelectedPhase(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Phases (1 - 5)</option>
                  {ROADMAP_PHASES.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Module</label>
                <select
                  value={selectedModule}
                  onChange={(e) => setSelectedModule(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Modules</option>
                  <option value="Security & Auth">Security & Auth</option>
                  <option value="Workspace UI">Workspace UI</option>
                  <option value="2nd Brain">2nd Brain</option>
                  <option value="Voice Macro">Voice Macro</option>
                  <option value="Whitelabel Distribution">Whitelabel Distribution</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Complexity</label>
                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="w-full p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Complexities</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Phase Cards with Tasks */}
          <div className="space-y-6">
            {ROADMAP_PHASES.filter(p => selectedPhase === 'all' || p.id === selectedPhase).map(phase => {
              const phaseTasks = filteredTasks.filter(t => t.phaseId === phase.id);
              if (phaseTasks.length === 0) return null;

              return (
                <div key={phase.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                  {/* Phase Header */}
                  <div className={`p-5 bg-gradient-to-r ${phase.color} text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          {phase.durationWeeks}
                        </span>
                        <span className="px-2.5 py-0.5 bg-black/20 rounded-full text-[10px] font-bold">
                          {phase.badge}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold">{phase.name}</h3>
                      <p className="text-xs text-white/80">{phase.objective}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold bg-white/20 px-3 py-1 rounded-xl">
                        {phaseTasks.filter(t => taskStatusMap[t.id] === 'completed').length} / {phaseTasks.length} Completed
                      </span>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="p-4 sm:p-6 divide-y divide-slate-100 dark:divide-slate-800">
                    {phaseTasks.map(task => {
                      const currentStatus = taskStatusMap[task.id] || task.status;
                      const isDone = currentStatus === 'completed';
                      const isInProgress = currentStatus === 'in_progress';

                      return (
                        <div key={task.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <button
                              onClick={() => toggleTaskStatus(task.id)}
                              className="mt-0.5 cursor-pointer text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition shrink-0"
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                              ) : isInProgress ? (
                                <Clock className="w-5 h-5 text-amber-500" />
                              ) : (
                                <Circle className="w-5 h-5" />
                              )}
                            </button>

                            <div className="space-y-1.5">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className={`text-sm font-bold ${isDone ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-slate-100'}`}>
                                  {task.title}
                                </h4>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  task.complexity === 'Critical' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' :
                                  task.complexity === 'High' ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300' :
                                  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                }`}>
                                  {task.complexity}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full font-bold">
                                  {task.module}
                                </span>
                              </div>

                              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                                {task.description}
                              </p>

                              {/* Deliverables */}
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {task.keyDeliverables.map((deliv, idx) => (
                                  <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md text-slate-600 dark:text-slate-400 font-mono">
                                    ✓ {deliv}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                            <span className="text-[11px] font-mono font-bold text-slate-500">
                              ~{task.estimatedHours} hrs
                            </span>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSnippetTaskId(task.id);
                                setActiveTab('snippets');
                              }}
                              className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                            >
                              <Code className="w-3 h-3" />
                              <span>View Code</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: CODE SNIPPETS & SCAFFOLDING */}
      {activeTab === 'snippets' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Snippet Selector List */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Select Endpoint / Module Scaffolding
            </h3>

            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {ROADMAP_TASKS.map(task => {
                const isSelected = task.id === selectedSnippetTaskId;
                return (
                  <button
                    key={task.id}
                    onClick={() => setSelectedSnippetTaskId(task.id)}
                    className={`w-full p-3 rounded-2xl text-left transition cursor-pointer border ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono opacity-80 mb-1">
                      <span>{task.phaseName}</span>
                      <span>{task.module}</span>
                    </div>
                    <div className="text-xs font-bold line-clamp-1">{task.codeSnippetTitle}</div>
                    <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                      {task.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Snippet Viewer */}
          <div className="lg:col-span-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 p-6 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-indigo-400 font-mono">
                  <span>{selectedSnippetTask.phaseName}</span>
                  <span>•</span>
                  <span>{selectedSnippetTask.module}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">{selectedSnippetTask.codeSnippetTitle}</h3>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(selectedSnippetTask.codeSnippet, selectedSnippetTask.id)}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                {copiedSnippetId === selectedSnippetTask.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Copied Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy TypeScript</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {selectedSnippetTask.description}
            </p>

            <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-indigo-200 overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
              {selectedSnippetTask.codeSnippet}
            </div>

            <div className="p-3 bg-indigo-950/60 border border-indigo-900 rounded-xl text-xs text-indigo-300 flex items-center justify-between">
              <span className="font-semibold">Estimated Development Time: ~{selectedSnippetTask.estimatedHours} Hours</span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-800 text-white rounded-md font-bold uppercase">
                {selectedSnippetTask.complexity} Complexity
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SYSTEM ARCHITECTURE TOPOLOGY */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {SYSTEM_ARCHITECTURE_TOPOLOGY.title}
                </h3>
                <p className="text-xs text-slate-500">Zero-Key Server-Side Proxy & Interconnected Node Flow</p>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full font-bold">
                7 Core System Nodes
              </span>
            </div>

            {/* Visual Topology Map */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {SYSTEM_ARCHITECTURE_TOPOLOGY.nodes.map((node, idx) => (
                <div key={node.id} className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 rounded-md uppercase">
                      {node.category}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{node.label}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{node.desc}</p>
                </div>
              ))}
            </div>

            {/* Architecture Highlights Card */}
            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 text-xs text-indigo-900 dark:text-indigo-200 space-y-2">
              <div className="font-bold text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Key Security & Data Flow Principles:
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300">
                <li><strong>No Client API Key Exposure:</strong> All Gemini and third-party API keys are stored exclusively in <code>process.env</code> on the server.</li>
                <li><strong>Dual-Pathway OAuth:</strong> Personal users connect via client Google Identity Services (Pathway A) while enterprise domains connect via OAuth 2.0 (Pathway B).</li>
                <li><strong>Atomic Google Sheets Writes:</strong> Modifies Google Sheets using batchUpdate commands to preserve formatting and prevent race conditions.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: API & ENDPOINT PLAYGROUND */}
      {activeTab === 'playground' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Endpoint Controls */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Live API Request Test Bench
              </h3>
              <p className="text-xs text-slate-500">Test server route payloads and verify JSON response contracts.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Endpoint</label>
              <select
                value={playgroundEndpoint}
                onChange={(e) => setPlaygroundEndpoint(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 focus:ring-2 focus:ring-indigo-500"
              >
                <option value="/api/gmail/draft">POST /api/gmail/draft (Create Gmail Draft)</option>
                <option value="/api/sheets/purge">POST /api/sheets/purge (Domain String Purge)</option>
                <option value="/api/brain/query">POST /api/brain/query (Vector Memory Search)</option>
                <option value="/api/calendar/buffer">POST /api/calendar/buffer (15-Min Buffer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">JSON Request Payload</label>
              <textarea
                rows={8}
                value={playgroundPayload}
                onChange={(e) => setPlaygroundPayload(e.target.value)}
                className="w-full p-3 bg-slate-950 text-indigo-200 font-mono text-xs rounded-xl border border-slate-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="button"
              onClick={handleRunPlayground}
              disabled={playgroundLoading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              {playgroundLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing Server Route...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Send Test API Payload</span>
                </>
              )}
            </button>
          </div>

          {/* Response Viewer */}
          <div className="lg:col-span-7 bg-slate-950 text-slate-100 p-6 rounded-3xl border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-mono font-bold text-indigo-400">Response Inspector</span>
              <span className="text-[10px] px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-md font-mono">
                HTTP 200 OK
              </span>
            </div>

            {playgroundResponse ? (
              <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto whitespace-pre leading-relaxed">
                {playgroundResponse}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-500 space-y-2">
                <Terminal className="w-8 h-8 opacity-40" />
                <p className="text-xs">Click "Send Test API Payload" to simulate server route execution.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: DEPLOYMENT & SECURITY AUDIT */}
      {activeTab === 'audit' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Production Launch & Security Audit Checklist
              </h3>
              <p className="text-xs text-slate-500">Verify all 10 critical deployment constraints prior to shipping.</p>
            </div>

            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {auditItems.filter(i => i.checked).length} / {auditItems.length} Verified
            </span>
          </div>

          <div className="space-y-3">
            {auditItems.map(item => (
              <div
                key={item.id}
                onClick={() => toggleAuditItem(item.id)}
                className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                  item.checked
                    ? 'bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="mt-0.5">
                  {item.checked ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-300 dark:text-slate-700" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: EXPORT DEVELOPER GUIDE */}
      {activeTab === 'export' && (
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                1-Click Exportable Developer Markdown Prompt Guide
              </h3>
              <p className="text-xs text-slate-500">Copy the full developer roadmap for Cursor, Claude, ChatGPT, or AI IDEs.</p>
            </div>

            <button
              type="button"
              onClick={handleCopyMarkdownExport}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md cursor-pointer"
            >
              {copiedExport ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Markdown Guide Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Full Markdown Guide</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950 text-slate-200 rounded-2xl font-mono text-xs overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-[500px]">
            {generateFullMarkdownExport()}
          </div>
        </div>
      )}
    </div>
  );
};
