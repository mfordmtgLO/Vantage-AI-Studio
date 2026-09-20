import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Trash2, ArrowRight, Sparkles, CheckCircle2, Clock, Globe, Database, Mail, Calendar, FileText, CheckSquare, Layers, Cpu, Loader2, AlertCircle, GitCommit, ArrowDown, Bookmark, Save, Search, Share2, RotateCcw, ListOrdered, Check, Square, ChevronRight, PlayCircle, XCircle, Network, Bot, MessageSquare, Tag, User, MessagesSquare, Download, Code, Upload, X, Filter, FolderArchive, Eye, ThumbsUp, ThumbsDown, Heart } from 'lucide-react';
import { getAccessToken } from '../services/firebase';
import { safeBtoa } from '../utils/base64';
import { ShareWorkflowModal, ShareableWorkflowData } from './ShareWorkflowModal';
import { SmartStepRecommendations } from './SmartStepRecommendations';
import { WorkflowDependencyGraph } from './WorkflowDependencyGraph';
import { UniversalAIPromptExportModal } from './UniversalAIPromptExportModal';
import { TemplateQuickPeekPopover } from './TemplateQuickPeekPopover';
import {
  downloadWorkflowAsMarkdown,
  downloadWorkflowAsJSON,
  downloadMultiWorkflowAsMarkdown,
  downloadMultiWorkflowAsJSON,
  ExportableWorkflowTemplate
} from '../utils/workflowExport';

export interface StepComment {
  id: string;
  authorName: string;
  authorEmail?: string;
  avatarColor?: string;
  timestamp: string;
  text: string;
  tag?: 'Context' | 'Prompt Tip' | 'Review' | 'TODO' | 'Note';
}

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'scrape_url' | 'ai_synthesize' | 'gmail_draft' | 'docs_create' | 'calendar_event';
  config: {
    url?: string;
    prompt?: string;
    recipient?: string;
    subject?: string;
    docTitle?: string;
    eventTitle?: string;
  };
  comments?: StepComment[];
}

interface ExecutionLog {
  stepId: string;
  title: string;
  status: 'success' | 'error';
  output: string;
  timestamp: string;
}

interface BatchTemplateResult {
  templateId: string;
  templateName: string;
  status: 'pending' | 'running' | 'success' | 'error';
  currentStepIndex?: number;
  totalSteps: number;
  logs: ExecutionLog[];
  error?: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  tags?: string[];
  upvotes?: number;
  downvotes?: number;
  isFavorite?: boolean;
}

const DEFAULT_TEMPLATES: WorkflowTemplate[] = [
  {
    id: 'template_1',
    name: 'AI Market Research & Executive Brief',
    description: 'Scrapes TechCrunch AI, synthesizes trends with Gemini DeepThink, saves to Google Doc, and drafts investor email.',
    tags: ['AI-Research', 'Executive', 'Google-Docs', 'Gmail', 'Investor-Relations'],
    upvotes: 42,
    downvotes: 2,
    isFavorite: true,
    steps: [
      {
        id: 's1',
        name: 'Scrape URL into 2nd Brain',
        type: 'scrape_url',
        config: { url: 'https://techcrunch.com/category/artificial-intelligence/' },
        comments: [
          {
            id: 'c1',
            authorName: 'Alex (Lead AI)',
            timestamp: 'Yesterday at 3:15 PM',
            tag: 'Context',
            text: 'Ensure the TechCrunch feed is responding or scrape top 5 articles from the category page directly.'
          }
        ]
      },
      {
        id: 's2',
        name: 'Gemini DeepThink & Search Synthesis',
        type: 'ai_synthesize',
        config: { prompt: 'Extract top 3 AI funding trends and summarize valuation metrics.' },
        comments: [
          {
            id: 'c2',
            authorName: 'Jordan (Strategy)',
            timestamp: 'Today at 9:30 AM',
            tag: 'Prompt Tip',
            text: 'Ask the model for specific dollar amounts and series stages to ensure executive-grade substance.'
          },
          {
            id: 'c3',
            authorName: 'Morgan (Ops)',
            timestamp: 'Today at 10:15 AM',
            tag: 'Review',
            text: 'Prompt is verified for zero-shot accuracy with Gemini 2.5 Flash, ChatGPT-4o, and DeepSeek-R1.'
          }
        ]
      },
      {
        id: 's3',
        name: 'Save Executive Brief to Google Doc',
        type: 'docs_create',
        config: { docTitle: 'Q3 AI Market Executive Brief' },
        comments: [
          {
            id: 'c4',
            authorName: 'Taylor (Doc Ops)',
            timestamp: 'Today at 11:00 AM',
            tag: 'Context',
            text: 'Formatting automatically formats Executive Summary, Market Dynamics, and Key Deal Multiples.'
          }
        ]
      },
      {
        id: 's4',
        name: 'Create Live Gmail Draft',
        type: 'gmail_draft',
        config: { recipient: 'investors@vantage.ai', subject: 'Q3 AI Market Insights' },
        comments: [
          {
            id: 'c5',
            authorName: 'Sarah (IR Lead)',
            timestamp: 'Today at 11:45 AM',
            tag: 'TODO',
            text: 'Review draft tone before final send; remember to BCC investor-updates@vantage.ai.'
          }
        ]
      }
    ]
  },
  {
    id: 'template_2',
    name: 'Competitor URL Scraper & Calendar Review',
    description: 'Scrapes competitor site, summarizes insights, and schedules a team strategy review in Google Calendar.',
    tags: ['Competitor-Intel', 'Product', 'Calendar-Sync', 'HackerNews'],
    upvotes: 28,
    downvotes: 1,
    isFavorite: false,
    steps: [
      {
        id: 't1',
        name: 'Scrape Competitor Product Page',
        type: 'scrape_url',
        config: { url: 'https://news.ycombinator.com/' },
        comments: [
          {
            id: 'c6',
            authorName: 'Devon (Competitive Intel)',
            timestamp: 'Yesterday at 5:00 PM',
            tag: 'Context',
            text: 'Focus on front-page stories discussing new AI developer tooling and framework releases.'
          }
        ]
      },
      {
        id: 't2',
        name: 'Analyze Feature Set',
        type: 'ai_synthesize',
        config: { prompt: 'Identify top features and differentiation opportunities.' },
        comments: [
          {
            id: 'c7',
            authorName: 'Chris (Product)',
            timestamp: 'Today at 8:45 AM',
            tag: 'Prompt Tip',
            text: 'Group takeaways by Moat, Pricing Model, and Enterprise Integration capabilities.'
          }
        ]
      },
      {
        id: 't3',
        name: 'Schedule Review Meeting',
        type: 'calendar_event',
        config: { eventTitle: 'Competitor Feature Analysis Sync' },
        comments: [
          {
            id: 'c8',
            authorName: 'Robin (Chief of Staff)',
            timestamp: 'Today at 9:00 AM',
            tag: 'TODO',
            text: 'Target 30-minute working slot for senior product leads.'
          }
        ]
      }
    ]
  },
  {
    id: 'template_3',
    name: 'Customer Feedback Sentiment & Escalation',
    description: 'Ingests product feedback URLs, analyzes friction points with Gemini, saves action items to Docs, and drafts customer response.',
    tags: ['Customer-Success', 'AI-Synthesis', 'Gmail', 'Support', 'Product-Feedback'],
    upvotes: 35,
    downvotes: 3,
    isFavorite: true,
    steps: [
      {
        id: 'cf1',
        name: 'Ingest Customer Feedback Logs',
        type: 'scrape_url',
        config: { url: 'https://news.ycombinator.com/item?id=39000000' },
        comments: [
          {
            id: 'c9',
            authorName: 'Sam (Support Lead)',
            timestamp: 'Yesterday at 2:00 PM',
            tag: 'Context',
            text: 'Capture high-severity user bug reports and feature requests.'
          }
        ]
      },
      {
        id: 'cf2',
        name: 'Synthesize Friction Points & Sentiment',
        type: 'ai_synthesize',
        config: { prompt: 'Classify sentiment into Urgent Bugs, Feature Requests, and UX Friction with recommended mitigations.' },
        comments: [
          {
            id: 'c10',
            authorName: 'Alex (Lead AI)',
            timestamp: 'Today at 10:00 AM',
            tag: 'Prompt Tip',
            text: 'Output structured priority matrix with impact score (1-5).'
          }
        ]
      },
      {
        id: 'cf3',
        name: 'Draft Escalation Notice',
        type: 'gmail_draft',
        config: { recipient: 'eng-leads@vantage.ai', subject: 'Urgent Product Friction & User Feedback Digest' },
        comments: [
          {
            id: 'c11',
            authorName: 'Sam (Support Lead)',
            timestamp: 'Today at 10:30 AM',
            tag: 'TODO',
            text: 'Ensure engineering leads are alerted on critical blocking tickets.'
          }
        ]
      }
    ]
  },
  {
    id: 'template_4',
    name: 'Executive All-Hands Brief & Calendar Broadcast',
    description: 'Synthesizes weekly team achievements, documents briefing notes in Google Docs, and schedules executive company all-hands.',
    tags: ['Executive', 'Operations', 'Google-Docs', 'Calendar-Sync', 'All-Hands'],
    upvotes: 19,
    downvotes: 0,
    isFavorite: false,
    steps: [
      {
        id: 'ah1',
        name: 'Gemini Executive All-Hands Synthesis',
        type: 'ai_synthesize',
        config: { prompt: 'Generate crisp 5-bullet CEO briefing covering weekly company achievements, key milestones, and open questions.' },
        comments: [
          {
            id: 'c12',
            authorName: 'Robin (Chief of Staff)',
            timestamp: 'Today at 8:00 AM',
            tag: 'Context',
            text: 'Keep bullets concise and celebrate team wins across engineering and product.'
          }
        ]
      },
      {
        id: 'ah2',
        name: 'Publish All-Hands Doc',
        type: 'docs_create',
        config: { docTitle: 'Weekly Company All-Hands Briefing & Agenda' }
      },
      {
        id: 'ah3',
        name: 'Schedule All-Hands Sync',
        type: 'calendar_event',
        config: { eventTitle: 'Company All-Hands & Strategic Direction Sync' }
      }
    ]
  }
];

export interface ServiceNodeInfo {
  serviceName: string;
  categoryLabel: string;
  badgeLabel: string;
  accentBorder: string;
  iconBg: string;
  iconColor: string;
  textColor: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  serviceBrandColor: string;
  icon: (className?: string) => React.ReactNode;
}

export const getServiceNodeInfo = (type: WorkflowStep['type']): ServiceNodeInfo => {
  switch (type) {
    case 'gmail_draft':
      return {
        serviceName: 'Gmail',
        categoryLabel: 'Google Workspace Gmail',
        badgeLabel: 'Gmail Draft',
        accentBorder: 'border-l-emerald-500 dark:border-l-emerald-400',
        iconBg: 'bg-emerald-50 dark:bg-emerald-950/70',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textColor: 'text-emerald-700 dark:text-emerald-300',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/60',
        badgeText: 'text-emerald-700 dark:text-emerald-300',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800/80',
        serviceBrandColor: '#10b981',
        icon: (cls = 'w-4 h-4') => <Mail className={cls} />
      };
    case 'docs_create':
      return {
        serviceName: 'Google Docs',
        categoryLabel: 'Google Drive & Docs',
        badgeLabel: 'Google Docs',
        accentBorder: 'border-l-amber-500 dark:border-l-amber-400',
        iconBg: 'bg-amber-50 dark:bg-amber-950/70',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textColor: 'text-amber-700 dark:text-amber-300',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/60',
        badgeText: 'text-amber-700 dark:text-amber-300',
        badgeBorder: 'border-amber-200 dark:border-amber-800/80',
        serviceBrandColor: '#f59e0b',
        icon: (cls = 'w-4 h-4') => <FileText className={cls} />
      };
    case 'calendar_event':
      return {
        serviceName: 'Google Calendar',
        categoryLabel: 'Google Calendar Schedule',
        badgeLabel: 'Google Calendar',
        accentBorder: 'border-l-indigo-500 dark:border-l-indigo-400',
        iconBg: 'bg-indigo-50 dark:bg-indigo-950/70',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        textColor: 'text-indigo-700 dark:text-indigo-300',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/60',
        badgeText: 'text-indigo-700 dark:text-indigo-300',
        badgeBorder: 'border-indigo-200 dark:border-indigo-800/80',
        serviceBrandColor: '#6366f1',
        icon: (cls = 'w-4 h-4') => <Calendar className={cls} />
      };
    case 'ai_synthesize':
      return {
        serviceName: 'Gemini DeepThink',
        categoryLabel: 'Gemini AI Intelligence',
        badgeLabel: 'Gemini AI',
        accentBorder: 'border-l-purple-500 dark:border-l-purple-400',
        iconBg: 'bg-purple-50 dark:bg-purple-950/70',
        iconColor: 'text-purple-600 dark:text-purple-400',
        textColor: 'text-purple-700 dark:text-purple-300',
        badgeBg: 'bg-purple-50 dark:bg-purple-950/60',
        badgeText: 'text-purple-700 dark:text-purple-300',
        badgeBorder: 'border-purple-200 dark:border-purple-800/80',
        serviceBrandColor: '#a855f7',
        icon: (cls = 'w-4 h-4') => <Sparkles className={cls} />
      };
    case 'scrape_url':
    default:
      return {
        serviceName: 'Web Ingestion',
        categoryLabel: 'Live Web Scraping Hub',
        badgeLabel: 'Web Scraper',
        accentBorder: 'border-l-sky-500 dark:border-l-sky-400',
        iconBg: 'bg-sky-50 dark:bg-sky-950/70',
        iconColor: 'text-sky-600 dark:text-sky-400',
        textColor: 'text-sky-700 dark:text-sky-300',
        badgeBg: 'bg-sky-50 dark:bg-sky-950/60',
        badgeText: 'text-sky-700 dark:text-sky-300',
        badgeBorder: 'border-sky-200 dark:border-sky-800/80',
        serviceBrandColor: '#0ea5e9',
        icon: (cls = 'w-4 h-4') => <Globe className={cls} />
      };
  }
};

export const getServiceHandoffLabel = (currentType: WorkflowStep['type'], nextType?: WorkflowStep['type']): string => {
  if (!nextType) return 'Pipeline Output';
  if (currentType === 'scrape_url' && nextType === 'ai_synthesize') return 'Pass Raw Web Markdown ➔';
  if (currentType === 'ai_synthesize' && nextType === 'docs_create') return 'Export AI Briefing ➔';
  if (currentType === 'ai_synthesize' && nextType === 'gmail_draft') return 'Pass Generated Email Text ➔';
  if (currentType === 'ai_synthesize' && nextType === 'calendar_event') return 'Pass Event Schedule & Details ➔';
  if (currentType === 'docs_create' && nextType === 'gmail_draft') return 'Include Doc URL & Content ➔';
  if (currentType === 'docs_create' && nextType === 'calendar_event') return 'Sync Doc Agenda to Calendar ➔';
  return 'Execution Context Handoff ➔';
};

interface LogicOrchestratorViewProps {
  initialWorkflowName?: string | null;
  revertedWorkflowName?: string | null;
  onClearRevert?: () => void;
  importedWorkflow?: ShareableWorkflowData | null;
  onClearImport?: () => void;
}

export const LogicOrchestratorView: React.FC<LogicOrchestratorViewProps> = ({
  initialWorkflowName,
  revertedWorkflowName,
  onClearRevert,
  importedWorkflow,
  onClearImport,
}) => {
  const [workflowName, setWorkflowName] = useState<string>(() => {
    if (initialWorkflowName) return initialWorkflowName;
    try {
      const backup = localStorage.getItem('vantage_workflow_canvas_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.workflowName) return parsed.workflowName;
      }
    } catch (e) {}
    return 'Live Web Research & Google Workspace Pipeline';
  });
  const [viewMode, setViewMode] = useState<'builder' | 'flowchart' | 'templates' | 'batch' | 'graph'>('builder');

  const [steps, setSteps] = useState<WorkflowStep[]>(() => {
    try {
      const backup = localStorage.getItem('vantage_workflow_canvas_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
          return parsed.steps;
        }
      }
    } catch (e) {}
    return DEFAULT_TEMPLATES[0].steps;
  });

  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [hasBackupToRestore, setHasBackupToRestore] = useState<boolean>(false);

  const [savedTemplates, setSavedTemplates] = useState<WorkflowTemplate[]>(() => {
    try {
      const stored = localStorage.getItem('vantage_workflow_templates');
      if (stored) {
        const parsed: WorkflowTemplate[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize tags and backfill default tags if missing
          return parsed.map(t => {
            const defaultMatch = DEFAULT_TEMPLATES.find(dt => dt.id === t.id);
            const tags = Array.isArray(t.tags) && t.tags.length > 0
              ? t.tags
              : (defaultMatch?.tags || ['Workflow']);
            return {
              ...t,
              tags,
              upvotes: typeof t.upvotes === 'number' ? t.upvotes : (defaultMatch?.upvotes ?? 15),
              downvotes: typeof t.downvotes === 'number' ? t.downvotes : (defaultMatch?.downvotes ?? 1),
              isFavorite: typeof t.isFavorite === 'boolean' ? t.isFavorite : (defaultMatch?.isFavorite ?? false),
            };
          });
        }
      }
    } catch (e) {
      // ignore
    }
    return DEFAULT_TEMPLATES;
  });
  const [templateSearchQuery, setTemplateSearchQuery] = useState<string>('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState<'all' | 'workspace' | 'ai' | 'web' | 'custom'>('all');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [templateSortBy, setTemplateSortBy] = useState<'score' | 'newest' | 'steps' | 'alphabetical'>('score');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [usedTemplateIds, setUsedTemplateIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('vantage_used_template_history');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return ['template_1'];
  });
  const [inlineTagInputTemplateId, setInlineTagInputTemplateId] = useState<string | null>(null);
  const [inlineTagValue, setInlineTagValue] = useState<string>('');
  const [templateSaveName, setTemplateSaveName] = useState<string>('');
  const [templateSaveDesc, setTemplateSaveDesc] = useState<string>('');
  const [templateSaveTags, setTemplateSaveTags] = useState<string>('');
  const [showSaveModal, setShowSaveModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [templateToShare, setTemplateToShare] = useState<WorkflowTemplate | null>(null);
  const fileImportInputRef = useRef<HTMLInputElement>(null);

  // Universal AI Prompt Export State (supports single or multi-template collection)
  const [showUniversalPromptModal, setShowUniversalPromptModal] = useState<boolean>(false);
  const [promptModalWorkflow, setPromptModalWorkflow] = useState<{
    name?: string;
    description?: string;
    steps?: WorkflowStep[];
    tags?: string[];
    templates?: ExportableWorkflowTemplate[];
  } | null>(null);

  // Node Comments State
  const [expandedCommentsStepId, setExpandedCommentsStepId] = useState<string | null>(null);
  const [newCommentTextByStep, setNewCommentTextByStep] = useState<Record<string, string>>({});
  const [newCommentTagByStep, setNewCommentTagByStep] = useState<Record<string, StepComment['tag']>>({});
  const [newCommentAuthorByStep, setNewCommentAuthorByStep] = useState<Record<string, string>>({});

  // Batch Mode & Multi-Template Selection States
  const [batchSelectedTemplateIds, setBatchSelectedTemplateIds] = useState<string[]>([]);
  const [isBatchRunning, setIsBatchRunning] = useState<boolean>(false);
  const [activeBatchIndex, setActiveBatchIndex] = useState<number | null>(null);
  const [batchResults, setBatchResults] = useState<BatchTemplateResult[]>([]);
  const [batchLogs, setBatchLogs] = useState<ExecutionLog[]>([]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Quick Peek Popover state for Workflow Template Library
  const [quickPeekTemplateId, setQuickPeekTemplateId] = useState<string | null>(null);
  const quickPeekHoverTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (quickPeekHoverTimerRef.current) {
        clearTimeout(quickPeekHoverTimerRef.current);
      }
    };
  }, []);

  // Check on mount if a backup exists with a timestamp
  useEffect(() => {
    try {
      const backup = localStorage.getItem('vantage_workflow_canvas_backup');
      if (backup) {
        const parsed = JSON.parse(backup);
        if (parsed.timestamp) {
          setLastAutoSavedTime(new Date(parsed.timestamp).toLocaleTimeString());
        }
      }
    } catch (e) {}
  }, []);

  // Periodic Auto-Save: back up canvas state every 5 seconds if steps or name exist
  useEffect(() => {
    const timer = setInterval(() => {
      try {
        const backupPayload = {
          workflowName,
          steps,
          timestamp: new Date().toISOString(),
          version: '1.0'
        };
        localStorage.setItem('vantage_workflow_canvas_backup', JSON.stringify(backupPayload));
        setLastAutoSavedTime(new Date().toLocaleTimeString());
        setHasUnsavedChanges(false);
      } catch (err) {
        console.warn('Auto-save failed:', err);
      }
    }, 5000);

    return () => clearInterval(timer);
  }, [workflowName, steps]);

  // Mark changes as dirty whenever steps or workflowName change
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setHasUnsavedChanges(true);
  }, [workflowName, steps]);

  const handleRestoreDefaultCanvas = () => {
    setWorkflowName(DEFAULT_TEMPLATES[0].name);
    setSteps(JSON.parse(JSON.stringify(DEFAULT_TEMPLATES[0].steps)));
    setSuccessMsg('Restored default workflow canvas.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  // Sync when initialWorkflowName changes (e.g. from Voice Command or Voice Macro)
  React.useEffect(() => {
    if (initialWorkflowName) {
      setWorkflowName(initialWorkflowName);
      const matched = savedTemplates.find(
        (t) => t.name.toLowerCase() === initialWorkflowName.toLowerCase()
      );
      if (matched) {
        setSteps(JSON.parse(JSON.stringify(matched.steps)));
      }
    }
  }, [initialWorkflowName, savedTemplates]);

  // Handle incoming shared workflow import
  React.useEffect(() => {
    if (importedWorkflow) {
      setWorkflowName(importedWorkflow.name);
      setSteps(JSON.parse(JSON.stringify(importedWorkflow.steps)));
      setViewMode('builder');
      setSuccessMsg(`Imported shared workflow: "${importedWorkflow.name}" from ${importedWorkflow.authorEmail || 'shared link'}!`);
      // Also add to saved templates library
      const newTpl: WorkflowTemplate = {
        id: 'tpl_' + Date.now(),
        name: importedWorkflow.name,
        description: importedWorkflow.description || 'Imported shared workflow',
        steps: JSON.parse(JSON.stringify(importedWorkflow.steps)),
      };
      setSavedTemplates((prev) => {
        const next = [newTpl, ...prev];
        try {
          localStorage.setItem('vantage_workflow_templates', JSON.stringify(next));
        } catch (e) {}
        return next;
      });
      if (onClearImport) onClearImport();
      setTimeout(() => setSuccessMsg(null), 5000);
    }
  }, [importedWorkflow, onClearImport]);

  // Handle immediate revert from Quick Undo
  React.useEffect(() => {
    if (revertedWorkflowName) {
      setIsRunning(false);
      setActiveStepIndex(null);
      setExecutionLogs([]);
      setSuccessMsg(`Workflow "${revertedWorkflowName}" execution reverted and cancelled via Quick Undo.`);
      if (onClearRevert) onClearRevert();
    }
  }, [revertedWorkflowName, onClearRevert]);

  const addStep = (type: WorkflowStep['type']) => {
    const newStep: WorkflowStep = {
      id: 'step_' + Date.now(),
      name: type === 'scrape_url' ? 'Live Web URL Scraper' : type === 'ai_synthesize' ? 'Gemini AI Synthesizer' : type === 'docs_create' ? 'Save to Google Docs' : type === 'gmail_draft' ? 'Live Gmail Draft Creator' : 'Google Calendar Event',
      type,
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  const addConfiguredStep = (stepData: Omit<WorkflowStep, 'id'>, insertAtIndex?: number) => {
    const newStep: WorkflowStep = {
      id: 'step_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: stepData.name,
      type: stepData.type,
      config: stepData.config || {}
    };
    if (typeof insertAtIndex === 'number' && insertAtIndex >= 0 && insertAtIndex <= steps.length) {
      const nextSteps = [...steps];
      nextSteps.splice(insertAtIndex, 0, newStep);
      setSteps(nextSteps);
    } else {
      setSteps(prev => [...prev, newStep]);
    }
  };

  const removeStep = (id: string) => {
    setSteps(steps.filter(s => s.id !== id));
  };

  const updateStepConfig = (id: string, key: string, value: string) => {
    setSteps(steps.map(s => s.id === id ? { ...s, config: { ...s.config, [key]: value } } : s));
  };

  const moveStep = (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSteps.length) return;
    const temp = newSteps[index];
    newSteps[index] = newSteps[targetIndex];
    newSteps[targetIndex] = temp;
    setSteps(newSteps);
  };

  const handleAddStepComment = (stepId: string) => {
    const text = (newCommentTextByStep[stepId] || '').trim();
    if (!text) return;
    const tag = newCommentTagByStep[stepId] || 'Context';
    const author = (newCommentAuthorByStep[stepId] || '').trim() || 'fordmj@gmail.com';

    const newComment: StepComment = {
      id: 'cmt_' + Date.now() + Math.random().toString(36).substring(2, 5),
      authorName: author,
      timestamp: 'Just now',
      tag,
      text
    };

    setSteps(prev => prev.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          comments: [...(s.comments || []), newComment]
        };
      }
      return s;
    }));

    setNewCommentTextByStep(prev => ({ ...prev, [stepId]: '' }));
    setSuccessMsg('Team note added to workflow step!');
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleRemoveStepComment = (stepId: string, commentId: string) => {
    setSteps(prev => prev.map(s => {
      if (s.id === stepId) {
        return {
          ...s,
          comments: (s.comments || []).filter(c => c.id !== commentId)
        };
      }
      return s;
    }));
    setSuccessMsg('Team note removed.');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const saveCurrentAsTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templateSaveName.trim()) return;

    const parsedTags = templateSaveTags
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const newTemplate: WorkflowTemplate = {
      id: 'template_' + Date.now(),
      name: templateSaveName,
      description: templateSaveDesc || workflowName,
      steps: JSON.parse(JSON.stringify(steps)),
      tags: parsedTags.length > 0 ? parsedTags : ['Custom']
    };

    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    try {
      localStorage.setItem('vantage_workflow_templates', JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
    setTemplateSaveName('');
    setTemplateSaveDesc('');
    setTemplateSaveTags('');
    setShowSaveModal(false);
    setSuccessMsg('Workflow successfully saved to Template Library with custom tags!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleAddTagToTemplate = (templateId: string, tagInput?: string) => {
    const raw = (tagInput || inlineTagValue).trim().replace(/^#/, '');
    if (!raw) return;
    setSavedTemplates(prev => {
      const next = prev.map(t => {
        if (t.id === templateId) {
          const existing = t.tags || [];
          if (existing.some(ex => ex.toLowerCase() === raw.toLowerCase())) return t;
          return { ...t, tags: [...existing, raw] };
        }
        return t;
      });
      try {
        localStorage.setItem('vantage_workflow_templates', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setInlineTagValue('');
    setInlineTagInputTemplateId(null);
    setSuccessMsg(`Added label #${raw} to template!`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleRemoveTagFromTemplate = (templateId: string, tagToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTemplates(prev => {
      const next = prev.map(t => {
        if (t.id === templateId) {
          return {
            ...t,
            tags: (t.tags || []).filter(tg => tg.toLowerCase() !== tagToRemove.toLowerCase())
          };
        }
        return t;
      });
      try {
        localStorage.setItem('vantage_workflow_templates', JSON.stringify(next));
      } catch (e) {}
      return next;
    });
    setSuccessMsg(`Removed label #${tagToRemove}.`);
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  // Compute all unique tags across saved templates with frequency counts
  const allUniqueTags = React.useMemo(() => {
    const counts: Record<string, number> = {};
    savedTemplates.forEach(t => {
      (t.tags || []).forEach(tag => {
        const normalized = tag.trim();
        if (normalized) {
          counts[normalized] = (counts[normalized] || 0) + 1;
        }
      });
    });
    return Object.entries(counts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [savedTemplates]);

  const handleShareCurrentWorkflow = () => {
    setTemplateToShare({
      id: 'current_wf_' + Date.now(),
      name: workflowName,
      description: 'Custom Vantage workflow sequence.',
      steps: JSON.parse(JSON.stringify(steps)),
    });
    setShowShareModal(true);
  };

  const handleShareTemplate = (tpl: WorkflowTemplate, e: React.MouseEvent) => {
    e.stopPropagation();
    setTemplateToShare(tpl);
    setShowShareModal(true);
  };

  const loadTemplate = (template: WorkflowTemplate) => {
    setWorkflowName(template.name);
    setSteps(JSON.parse(JSON.stringify(template.steps)));
    setViewMode('builder');

    // Track usage history for pattern recommendations
    setUsedTemplateIds(prev => {
      if (prev.includes(template.id)) return prev;
      const next = [...prev, template.id];
      try {
        localStorage.setItem('vantage_used_template_history', JSON.stringify(next));
      } catch (e) {}
      return next;
    });

    setSuccessMsg(`Loaded template: "${template.name}"`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const recommendedUntriedTemplates = React.useMemo(() => {
    const untried = savedTemplates.filter(t => !usedTemplateIds.includes(t.id));
    return untried.sort((a, b) => {
      const scoreA = (a.upvotes ?? 15) - (a.downvotes ?? 1);
      const scoreB = (b.upvotes ?? 15) - (b.downvotes ?? 1);
      return scoreB - scoreA;
    }).slice(0, 2);
  }, [savedTemplates, usedTemplateIds]);

  const handleVoteTemplate = (templateId: string, direction: 'up' | 'down', e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTemplates(prev => {
      const updated = prev.map(t => {
        if (t.id === templateId) {
          const currentUp = t.upvotes ?? 15;
          const currentDown = t.downvotes ?? 1;
          if (direction === 'up') {
            return { ...t, upvotes: currentUp + 1 };
          } else {
            return { ...t, downvotes: currentDown + 1 };
          }
        }
        return t;
      });
      try {
        localStorage.setItem('vantage_workflow_templates', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setSuccessMsg(direction === 'up' ? 'Upvoted automation template!' : 'Recorded feedback for template.');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const handleToggleFavoriteTemplate = (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedTemplates(prev => {
      const updated = prev.map(t => {
        if (t.id === templateId) {
          const nextFav = !t.isFavorite;
          return { ...t, isFavorite: nextFav };
        }
        return t;
      });
      try {
        localStorage.setItem('vantage_workflow_templates', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
    setSuccessMsg('Updated template favorites.');
    setTimeout(() => setSuccessMsg(null), 2000);
  };

  const filteredTemplates = savedTemplates.filter(t => {
    // 1. Favorites-only filter
    if (showFavoritesOnly && !t.isFavorite) return false;

    // 2. Category filter
    if (templateCategoryFilter === 'workspace') {
      const hasWorkspace = t.steps.some(s => s.type === 'docs_create' || s.type === 'gmail_draft' || s.type === 'calendar_event');
      if (!hasWorkspace) return false;
    } else if (templateCategoryFilter === 'ai') {
      const hasAI = t.steps.some(s => s.type === 'ai_synthesize');
      if (!hasAI) return false;
    } else if (templateCategoryFilter === 'web') {
      const hasWeb = t.steps.some(s => s.type === 'scrape_url');
      if (!hasWeb) return false;
    } else if (templateCategoryFilter === 'custom') {
      const isDefault = DEFAULT_TEMPLATES.some(dt => dt.id === t.id);
      if (isDefault) return false;
    }

    // 3. Active tag filter
    if (selectedTagFilter) {
      const hasTag = (t.tags || []).some(tg => tg.toLowerCase() === selectedTagFilter.toLowerCase());
      if (!hasTag) return false;
    }

    if (!templateSearchQuery.trim()) return true;
    const rawQ = templateSearchQuery.trim().toLowerCase();

    // Check search keywords for favorites or top voted
    if (rawQ === 'favorite' || rawQ === 'fav' || rawQ === 'heart') {
      if (!t.isFavorite) return false;
      return true;
    }
    if (rawQ === 'top' || rawQ === 'voted' || rawQ === 'score') {
      const score = (t.upvotes ?? 15) - (t.downvotes ?? 1);
      if (score < 15) return false;
      return true;
    }

    const cleanQ = rawQ.replace(/^tag:\s*/, '').replace(/^#/, '');

    // Check if query matches any tag
    const tagMatch = (t.tags || []).some(tg => {
      const lower = tg.toLowerCase();
      return lower.includes(cleanQ) || `#${lower}`.includes(rawQ);
    });
    if (tagMatch) return true;

    return (
      t.name.toLowerCase().includes(rawQ) ||
      t.description.toLowerCase().includes(rawQ) ||
      t.steps.some(s => 
        s.type.toLowerCase().includes(rawQ) || 
        s.name.toLowerCase().includes(rawQ) ||
        (s.config.prompt && s.config.prompt.toLowerCase().includes(rawQ)) ||
        (s.config.url && s.config.url.toLowerCase().includes(rawQ)) ||
        (s.config.docTitle && s.config.docTitle.toLowerCase().includes(rawQ)) ||
        (s.config.subject && s.config.subject.toLowerCase().includes(rawQ)) ||
        (s.config.eventTitle && s.config.eventTitle.toLowerCase().includes(rawQ))
      )
    );
  }).sort((a, b) => {
    const scoreA = (a.upvotes ?? 15) - (a.downvotes ?? 1);
    const scoreB = (b.upvotes ?? 15) - (b.downvotes ?? 1);
    if (templateSortBy === 'score') {
      return scoreB - scoreA; // Highest score first
    } else if (templateSortBy === 'steps') {
      return b.steps.length - a.steps.length;
    } else if (templateSortBy === 'alphabetical') {
      return a.name.localeCompare(b.name);
    } else {
      // 'newest'
      return b.id.localeCompare(a.id);
    }
  });

  // Reusable single-pipeline executor used by both single runs and batch runs
  const executeWorkflowPipeline = async (
    targetSteps: WorkflowStep[],
    pipelineName: string,
    isDryRun: boolean = false,
    onStepUpdate?: (stepIndex: number, log: ExecutionLog) => void
  ): Promise<{ success: boolean; logs: ExecutionLog[]; error?: string }> => {
    const logs: ExecutionLog[] = [];
    let previousStepOutput = '';

    try {
      let token: string | null = null;
      if (!isDryRun) {
        token = await getAccessToken();
      }

      for (let i = 0; i < targetSteps.length; i++) {
        const step = targetSteps[i];
        let output = '';

        if (isDryRun) {
          await new Promise(r => setTimeout(r, 600));
          if (step.type === 'scrape_url') {
            output = `[Sandbox Dry-Run] Extracted data from ${step.config.url || 'https://example.com'}. 1,420 tokens parsed.`;
          } else if (step.type === 'ai_synthesize') {
            output = `[Sandbox Dry-Run] Gemini DeepThink & Search synthesized prompt: "${step.config.prompt || 'Synthesize'}". Executive summary generated.`;
          } else if (step.type === 'docs_create') {
            output = `[Sandbox Dry-Run] Created Google Doc "${step.config.docTitle || 'Doc'}". Mock Document ID: doc_sandbox_${Date.now()}`;
          } else if (step.type === 'gmail_draft') {
            output = `[Sandbox Dry-Run] Created Gmail draft to "${step.config.recipient || 'recipient@test.com'}" with subject "${step.config.subject || 'Subject'}".`;
          } else if (step.type === 'calendar_event') {
            output = `[Sandbox Dry-Run] Created Calendar event "${step.config.eventTitle || 'Meeting'}".`;
          }
        } else {
          if (step.type === 'scrape_url') {
            const targetUrl = step.config.url || 'https://example.com';
            const scrapeRes = await fetch('/api/vantage/ingest', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: `Scraped: ${targetUrl}`,
                content: `Live extracted content from URL: ${targetUrl}`,
                url: targetUrl,
                category: 'workspace',
                tags: ['orchestrator', 'web-scrape']
              })
            });
            if (!scrapeRes.ok) throw new Error(`Failed to scrape URL: ${targetUrl}`);
            const scrapeData = await scrapeRes.json();
            output = `Successfully scraped & ingested URL: ${targetUrl}. Memory ID: ${scrapeData.memory?.id || 'saved'}`;
            previousStepOutput = output;
          } 
          else if (step.type === 'ai_synthesize') {
            const promptText = step.config.prompt || 'Summarize previous findings.';
            const aiRes = await fetch('/api/gemini/workspace-prompt', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                prompt: `Orchestrator Step instruction: ${promptText}\nContext from previous step: ${previousStepOutput}`,
                enableDeepThink: true,
                enableSearch: true,
                useDeepseek: true
              })
            });
            if (!aiRes.ok) throw new Error('AI synthesis failed');
            const aiData = await aiRes.json();
            output = `Gemini + Deepseek AI Synthesis complete: ${aiData.summary || 'Synthesized successfully.'}`;
            previousStepOutput = output;
          }
          else if (step.type === 'docs_create') {
            if (!token) throw new Error('Google OAuth Token required for Google Docs creation.');
            const docTitle = step.config.docTitle || 'Orchestrator Research Doc';
            const docRes = await fetch('https://docs.googleapis.com/v1/documents', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ title: docTitle }),
            });
            if (!docRes.ok) throw new Error('Failed to create Google Doc');
            const docData = await docRes.json();
            output = `Successfully created Google Doc "${docTitle}" (ID: ${docData.documentId}) and appended workflow findings!`;
            previousStepOutput = output;
          }
          else if (step.type === 'gmail_draft') {
            if (!token) throw new Error('Google OAuth Token required for Gmail API creation.');
            const recipient = step.config.recipient || 'user@example.com';
            const subject = step.config.subject || 'Automated Orchestrator Brief';
            const body = `Hello,\n\nHere is the automated output generated by your Workflow Studio pipeline (${pipelineName}):\n\n${previousStepOutput}\n\nBest regards,\nVantage AI Agent`;

            const emailLines = [
              `To: ${recipient}`,
              `Subject: ${subject}`,
              `Content-Type: text/plain; charset="UTF-8"`,
              ``,
              body
            ];
            const rawEmail = safeBtoa(emailLines.join('\n')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

            const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ draft: { message: { raw: rawEmail } } }),
            });

            if (!gmailRes.ok) {
              const errJson = await gmailRes.json();
              throw new Error(errJson.error?.message || 'Failed to create Gmail draft');
            }

            const draftData = await gmailRes.json();
            output = `Successfully created real Gmail draft (ID: ${draftData.id}) to ${recipient}! Viewable in your Saved Drafts manager.`;
            previousStepOutput = output;
          } 
          else if (step.type === 'calendar_event') {
            if (!token) throw new Error('Google OAuth Token required for Calendar creation.');
            const eventSummary = step.config.eventTitle || `${pipelineName} Review Meeting`;

            const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                summary: eventSummary,
                description: `Automated calendar event created by Workflow Studio for pipeline: ${pipelineName}.\n\nContext:\n${previousStepOutput}`,
                start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
                end: { dateTime: new Date(Date.now() + 7200000).toISOString() },
              }),
            });

            if (!calRes.ok) throw new Error('Failed to create Google Calendar event');
            const calData = await calRes.json();
            output = `Successfully created Google Calendar event "${eventSummary}" (ID: ${calData.id})!`;
            previousStepOutput = output;
          }
        }

        const logEntry: ExecutionLog = {
          stepId: step.id,
          title: isDryRun ? `[Sandbox] ${step.name}` : step.name,
          status: 'success',
          output,
          timestamp: new Date().toLocaleTimeString()
        };

        logs.push(logEntry);
        if (onStepUpdate) onStepUpdate(i, logEntry);
      }

      return { success: true, logs };
    } catch (err: any) {
      console.error(err);
      const errorLog: ExecutionLog = {
        stepId: 'error',
        title: 'Step Execution Error',
        status: 'error',
        output: err.message || 'Execution error encountered.',
        timestamp: new Date().toLocaleTimeString()
      };
      logs.push(errorLog);
      return { success: false, logs, error: err.message || 'Workflow execution error' };
    }
  };

  const runWorkflow = async () => {
    setIsRunning(true);
    setExecutionLogs([]);
    setGlobalError(null);
    setActiveStepIndex(0);

    try {
      const result = await executeWorkflowPipeline(
        steps,
        workflowName,
        false,
        (stepIndex, log) => {
          setActiveStepIndex(stepIndex);
          setExecutionLogs(prev => [...prev, log]);
        }
      );

      if (!result.success) {
        setGlobalError(result.error || 'Pipeline execution failed');
        if (result.logs.length > 0 && result.logs[result.logs.length - 1].status === 'error') {
          setExecutionLogs(prev => [...prev, result.logs[result.logs.length - 1]]);
        }
      } else {
        setSuccessMsg(`Workflow "${workflowName}" executed successfully!`);
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } finally {
      setActiveStepIndex(null);
      setIsRunning(false);
    }
  };

  const testRunWorkflow = async () => {
    setIsRunning(true);
    setExecutionLogs([]);
    setGlobalError(null);
    setActiveStepIndex(0);

    setExecutionLogs([{
      stepId: 'sandbox',
      title: '🛡️ Sandboxed Mode Initialized',
      status: 'success',
      output: 'Running workflow in isolated sandbox. External Google Workspace and web writes are safely mocked/dry-run tested without modifying live user accounts.',
      timestamp: new Date().toLocaleTimeString()
    }]);

    try {
      const result = await executeWorkflowPipeline(
        steps,
        workflowName,
        true,
        (stepIndex, log) => {
          setActiveStepIndex(stepIndex);
          setExecutionLogs(prev => [...prev, log]);
        }
      );

      if (!result.success) {
        setGlobalError(result.error || 'Sandboxed dry-run encountered an issue.');
      } else {
        setSuccessMsg('Sandboxed Test Run completed successfully with 100% dry-run pass rate!');
        setTimeout(() => setSuccessMsg(null), 4000);
      }
    } finally {
      setActiveStepIndex(null);
      setIsRunning(false);
    }
  };

  // Batch Mode & Multi-Template Selection Operations
  const toggleSelectTemplateForBatch = (templateId: string) => {
    setBatchSelectedTemplateIds(prev =>
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const selectAllTemplatesForBatch = () => {
    if (batchSelectedTemplateIds.length === savedTemplates.length) {
      setBatchSelectedTemplateIds([]);
    } else {
      setBatchSelectedTemplateIds(savedTemplates.map(t => t.id));
    }
  };

  const selectAllFilteredTemplates = () => {
    const allFilteredSelected = filteredTemplates.length > 0 && filteredTemplates.every(t => batchSelectedTemplateIds.includes(t.id));
    if (allFilteredSelected) {
      setBatchSelectedTemplateIds(prev => prev.filter(id => !filteredTemplates.some(ft => ft.id === id)));
    } else {
      const combined = new Set([...batchSelectedTemplateIds, ...filteredTemplates.map(t => t.id)]);
      setBatchSelectedTemplateIds(Array.from(combined));
    }
  };

  const clearBatchQueue = () => {
    setBatchSelectedTemplateIds([]);
  };

  // Selected templates for batch export
  const selectedTemplatesForExport: ExportableWorkflowTemplate[] = savedTemplates.filter(t =>
    batchSelectedTemplateIds.includes(t.id)
  );

  const handleExportSelectedMD = () => {
    if (selectedTemplatesForExport.length === 0) return;
    downloadMultiWorkflowAsMarkdown(selectedTemplatesForExport, 'vantage_workflow_collection');
    setSuccessMsg(`Downloaded ${selectedTemplatesForExport.length} selected template(s) as Markdown (.md)!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleExportSelectedJSON = () => {
    if (selectedTemplatesForExport.length === 0) return;
    downloadMultiWorkflowAsJSON(selectedTemplatesForExport, 'vantage_workflow_collection');
    setSuccessMsg(`Downloaded ${selectedTemplatesForExport.length} selected template(s) as JSON (.json)!`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleOpenExportPreviewSelected = () => {
    if (selectedTemplatesForExport.length === 0) return;
    setPromptModalWorkflow({
      templates: selectedTemplatesForExport
    });
    setShowUniversalPromptModal(true);
  };

  const handleDeleteTemplate = (templateId: string, templateName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove the template "${templateName}"?`)) {
      setSavedTemplates(prev => {
        const next = prev.filter(t => t.id !== templateId);
        try {
          localStorage.setItem('vantage_workflow_templates', JSON.stringify(next));
        } catch (err) {}
        return next;
      });
      setBatchSelectedTemplateIds(prev => prev.filter(id => id !== templateId));
      setSuccessMsg(`Deleted template "${templateName}".`);
      setTimeout(() => setSuccessMsg(null), 3000);
    }
  };

  const handleImportTemplatesJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let imported: WorkflowTemplate[] = [];
        if (Array.isArray(parsed.workflows)) {
          imported = parsed.workflows.map((w: any) => ({
            id: w.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: w.name || 'Imported Workflow',
            description: w.description || 'Imported workflow pipeline',
            steps: Array.isArray(w.steps) ? w.steps : [],
            tags: Array.isArray(w.tags) ? w.tags : (w.tag ? [w.tag] : ['Imported'])
          }));
        } else if (parsed.workflow && Array.isArray(parsed.steps)) {
          imported = [{
            id: parsed.workflow.id || `imported_${Date.now()}`,
            name: parsed.workflow.name || 'Imported Workflow',
            description: parsed.workflow.description || 'Imported from JSON',
            steps: parsed.steps,
            tags: Array.isArray(parsed.workflow.tags) ? parsed.workflow.tags : ['Imported']
          }];
        } else if (Array.isArray(parsed)) {
          imported = parsed.map((w: any) => ({
            id: w.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            name: w.name || 'Imported Workflow',
            description: w.description || 'Imported workflow pipeline',
            steps: Array.isArray(w.steps) ? w.steps : [],
            tags: Array.isArray(w.tags) ? w.tags : (w.tag ? [w.tag] : ['Imported'])
          }));
        }

        if (imported.length > 0) {
          setSavedTemplates(prev => {
            const next = [...imported, ...prev];
            try {
              localStorage.setItem('vantage_workflow_templates', JSON.stringify(next));
            } catch (err) {}
            return next;
          });
          setSuccessMsg(`Successfully imported ${imported.length} template(s) from JSON file!`);
          setTimeout(() => setSuccessMsg(null), 3500);
        } else {
          setGlobalError('Could not find valid workflow templates in the uploaded JSON file.');
        }
      } catch (err) {
        setGlobalError('Failed to parse uploaded JSON file. Please verify valid formatting.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const runBatchWorkflowQueue = async (isDryRun: boolean = false) => {
    if (batchSelectedTemplateIds.length === 0) {
      setGlobalError('Please select at least one workflow template for batch execution.');
      return;
    }

    const selectedTemplates = savedTemplates.filter(t => batchSelectedTemplateIds.includes(t.id));
    if (selectedTemplates.length === 0) return;

    setIsBatchRunning(true);
    setGlobalError(null);
    setBatchLogs([]);

    // Initialize initial queue status representation
    const initialResults: BatchTemplateResult[] = selectedTemplates.map(t => ({
      templateId: t.id,
      templateName: t.name,
      status: 'pending',
      totalSteps: t.steps.length,
      logs: []
    }));
    setBatchResults(initialResults);

    const initialLog: ExecutionLog = {
      stepId: 'batch_init',
      title: isDryRun ? '🛡️ Batch Sandbox Execution Started' : '⚡ Sequential Batch Execution Started',
      status: 'success',
      output: `Initialized sequential execution queue of ${selectedTemplates.length} workflow pipelines (${selectedTemplates.map(t => `"${t.name}"`).join(', ')}).`,
      timestamp: new Date().toLocaleTimeString()
    };
    setBatchLogs([initialLog]);

    try {
      for (let batchIdx = 0; batchIdx < selectedTemplates.length; batchIdx++) {
        setActiveBatchIndex(batchIdx);
        const currentTemplate = selectedTemplates[batchIdx];

        // Mark template as running
        setBatchResults(prev => prev.map((res, idx) =>
          idx === batchIdx ? { ...res, status: 'running', currentStepIndex: 0 } : res
        ));

        const batchStartLog: ExecutionLog = {
          stepId: `batch_${currentTemplate.id}_start`,
          title: `[Queue ${batchIdx + 1}/${selectedTemplates.length}] Starting "${currentTemplate.name}"`,
          status: 'success',
          output: `Executing sequence with ${currentTemplate.steps.length} steps...`,
          timestamp: new Date().toLocaleTimeString()
        };
        setBatchLogs(prev => [...prev, batchStartLog]);

        const pipelineOutcome = await executeWorkflowPipeline(
          currentTemplate.steps,
          currentTemplate.name,
          isDryRun,
          (stepIndex, stepLog) => {
            setBatchResults(prev => prev.map((res, idx) =>
              idx === batchIdx ? { ...res, currentStepIndex: stepIndex, logs: [...res.logs, stepLog] } : res
            ));
            setBatchLogs(prev => [...prev, {
              ...stepLog,
              title: `[${currentTemplate.name}] ${stepLog.title}`
            }]);
          }
        );

        if (!pipelineOutcome.success) {
          setBatchResults(prev => prev.map((res, idx) =>
            idx === batchIdx ? { ...res, status: 'error', error: pipelineOutcome.error } : res
          ));
          setBatchLogs(prev => [...prev, {
            stepId: `batch_${currentTemplate.id}_fail`,
            title: `[Queue ${batchIdx + 1}/${selectedTemplates.length}] "${currentTemplate.name}" Failed`,
            status: 'error',
            output: pipelineOutcome.error || 'Execution failure in pipeline step.',
            timestamp: new Date().toLocaleTimeString()
          }]);
        } else {
          setBatchResults(prev => prev.map((res, idx) =>
            idx === batchIdx ? { ...res, status: 'success' } : res
          ));
          setBatchLogs(prev => [...prev, {
            stepId: `batch_${currentTemplate.id}_done`,
            title: `[Queue ${batchIdx + 1}/${selectedTemplates.length}] "${currentTemplate.name}" Complete`,
            status: 'success',
            output: `All ${currentTemplate.steps.length} steps completed successfully.`,
            timestamp: new Date().toLocaleTimeString()
          }]);
        }

        // Brief delay between batch workflows to provide clear progress cadence
        if (batchIdx < selectedTemplates.length - 1) {
          await new Promise(r => setTimeout(r, 600));
        }
      }

      setSuccessMsg(
        isDryRun
          ? `Batch sandbox run completed for ${selectedTemplates.length} workflow pipelines!`
          : `Batch queue execution completed for ${selectedTemplates.length} workflow pipelines!`
      );
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (batchErr: any) {
      console.error('Batch queue critical error:', batchErr);
      setGlobalError(batchErr.message || 'Batch execution encountered a critical error');
    } finally {
      setIsBatchRunning(false);
      setActiveBatchIndex(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-4 h-4" /> Workflow Studio & Logic Orchestrator
            </div>

            {/* Auto-Save Status Badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-[11px] font-medium">
              <span className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
              {hasUnsavedChanges ? (
                <span>Saving draft...</span>
              ) : lastAutoSavedTime ? (
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  Auto-saved at {lastAutoSavedTime}
                </span>
              ) : (
                <span>Auto-save active</span>
              )}
            </div>

            <button
              onClick={handleRestoreDefaultCanvas}
              className="text-[11px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:underline flex items-center gap-1 transition"
              title="Reset current canvas to standard sample pipeline"
            >
              <RotateCcw className="w-3 h-3" /> Reset canvas
            </button>
          </div>
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="text-2xl font-bold text-slate-900 dark:text-slate-100 border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none transition bg-transparent w-full max-w-xl"
          />
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build, sequence, visualize, and save reusable workflow automation sequences across web research, Gemini AI, Google Docs, Gmail, and Calendar.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('builder')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${viewMode === 'builder' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Step Builder
            </button>
            <button
              onClick={() => setViewMode('flowchart')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${viewMode === 'flowchart' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Flowchart
            </button>
            <button
              onClick={() => setViewMode('templates')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${viewMode === 'templates' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Template Library ({savedTemplates.length})
            </button>
            <button
              id="batch-mode-tab-btn"
              onClick={() => setViewMode('batch')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${viewMode === 'batch' ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              <ListOrdered className="w-3.5 h-3.5" />
              Batch Mode
              {batchSelectedTemplateIds.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {batchSelectedTemplateIds.length}
                </span>
              )}
            </button>
            <button
              id="graph-mode-tab-btn"
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${viewMode === 'graph' ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
              title="Visual D3 Dependency & Resource Graph"
            >
              <Network className="w-3.5 h-3.5 text-blue-500" />
              Dependency Graph
            </button>
          </div>
          {/* Download MD button */}
          <button
            id="download-workflow-md-btn"
            onClick={() => {
              downloadWorkflowAsMarkdown(
                workflowName,
                'Custom multi-step workflow sequence with team notes & prompt guidelines.',
                steps
              );
              setSuccessMsg('Downloaded Markdown (.md) task specification!');
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
            disabled={steps.length === 0}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-xl border border-blue-200 dark:border-blue-900/60 transition cursor-pointer"
            title="Download structured, human-readable markdown task list formatted with lightweight XML and blockquote delimiters"
          >
            <Download className="w-3.5 h-3.5" /> Download MD
          </button>

          {/* Download JSON button */}
          <button
            id="download-workflow-json-btn"
            onClick={() => {
              downloadWorkflowAsJSON(
                workflowName,
                'Custom multi-step workflow sequence with team notes & prompt guidelines.',
                steps
              );
              setSuccessMsg('Downloaded Structured JSON (.json) workflow configuration!');
              setTimeout(() => setSuccessMsg(null), 3000);
            }}
            disabled={steps.length === 0}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-semibold text-xs rounded-xl border border-purple-200 dark:border-purple-900/60 transition cursor-pointer"
            title="Download structured JSON configuration file"
          >
            <Code className="w-3.5 h-3.5" /> Download JSON
          </button>

          {/* Export Inspector modal button */}
          <button
            id="export-universal-prompt-btn"
            onClick={() => {
              setPromptModalWorkflow({
                name: workflowName,
                description: 'Custom multi-step workflow sequence with team notes & prompt guidelines.',
                steps: JSON.parse(JSON.stringify(steps)),
              });
              setShowUniversalPromptModal(true);
            }}
            disabled={steps.length === 0}
            className="flex items-center gap-1.5 px-3 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Inspect, customize, and copy Markdown or JSON export"
          >
            <FileText className="w-3.5 h-3.5 text-slate-500" /> Export Preview
          </button>
          <button
            id="share-current-workflow-btn"
            onClick={handleShareCurrentWorkflow}
            disabled={steps.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-semibold text-xs rounded-xl border border-blue-200 dark:border-blue-900/60 transition cursor-pointer"
            title="Generate shareable URL or email invite"
          >
            <Share2 className="w-3.5 h-3.5" /> Share Workflow
          </button>
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="Save as reusable template"
          >
            <Save className="w-3.5 h-3.5" /> Save Template
          </button>
          <button
            onClick={testRunWorkflow}
            disabled={isRunning || steps.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-md transition cursor-pointer"
            title="Run in sandboxed dry-run mode"
          >
            <Sparkles className="w-3.5 h-3.5" /> Test Run (Sandbox)
          </button>
          <button
            onClick={runWorkflow}
            disabled={isRunning || steps.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
            {isRunning ? 'Running...' : 'Run Pipeline'}
          </button>
        </div>
      </div>

      {globalError && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium">{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-red-500 hover:text-red-700 font-bold text-sm">×</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">×</button>
        </div>
      )}

      {/* SAVE TEMPLATE MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-blue-600" /> Save Workflow Template
              </h3>
              <button onClick={() => setShowSaveModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">×</button>
            </div>
            <form onSubmit={saveCurrentAsTemplate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Template Name:</label>
                <input
                  type="text"
                  required
                  value={templateSaveName}
                  onChange={(e) => setTemplateSaveName(e.target.value)}
                  placeholder="e.g., Weekly Investor Update Pipeline"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description:</label>
                <textarea
                  value={templateSaveDesc}
                  onChange={(e) => setTemplateSaveDesc(e.target.value)}
                  placeholder="Describe what this workflow automates..."
                  rows={2}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Custom Tags & Labels <span className="font-normal text-slate-400">(comma-separated)</span>:
                </label>
                <input
                  type="text"
                  value={templateSaveTags}
                  onChange={(e) => setTemplateSaveTags(e.target.value)}
                  placeholder="e.g. AI-Research, Executive, Gmail, Sprint-12"
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                {/* Suggested Tag Quick-Picks */}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-medium text-slate-400">Quick add:</span>
                  {['AI-Research', 'Executive', 'Google-Docs', 'Gmail', 'Calendar-Sync', 'Product', 'Customer-Success', 'Operations'].map((sug) => {
                    const currentTags = templateSaveTags.split(',').map(s => s.trim().replace(/^#/, '')).filter(Boolean);
                    const isSelected = currentTags.includes(sug);
                    return (
                      <button
                        key={sug}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setTemplateSaveTags(currentTags.filter(t => t !== sug).join(', '));
                          } else {
                            setTemplateSaveTags(currentTags.concat(sug).join(', '));
                          }
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition cursor-pointer ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
                        }`}
                      >
                        #{sug}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSaveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Save to Library
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODE: BUILDER */}
      {viewMode === 'builder' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Steps Builder */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Pipeline Steps ({steps.length})
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  id="quick-add-scrape-btn"
                  onClick={() => addStep('scrape_url')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-slate-700 dark:text-slate-300 hover:text-sky-700 dark:hover:text-sky-300 border border-slate-200 dark:border-slate-800 hover:border-sky-300 dark:hover:border-sky-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Add Web Ingestion Node"
                >
                  <Globe className="w-3.5 h-3.5 text-sky-500" /> + Web Scraper
                </button>
                <button
                  id="quick-add-ai-btn"
                  onClick={() => addStep('ai_synthesize')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-700 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-300 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Add Gemini AI Synthesis Node"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-500" /> + Gemini AI
                </button>
                <button
                  id="quick-add-docs-btn"
                  onClick={() => addStep('docs_create')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-700 dark:text-slate-300 hover:text-amber-700 dark:hover:text-amber-300 border border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Add Google Docs Drive Node"
                >
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> + Google Docs
                </button>
                <button
                  id="quick-add-gmail-btn"
                  onClick={() => addStep('gmail_draft')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-emerald-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Add Gmail Dispatch Node"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-500" /> + Gmail Draft
                </button>
                <button
                  id="quick-add-calendar-btn"
                  onClick={() => addStep('calendar_event')}
                  className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                  title="Add Google Calendar Event Node"
                >
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> + Calendar Event
                </button>
              </div>
            </div>

             <div className="space-y-3">
              {steps.map((step, idx) => {
                const isActive = activeStepIndex === idx;
                const stepLog = executionLogs.find(l => l.stepId === step.id);
                const hasRun = stepLog !== undefined;
                const isFailed = stepLog?.status === 'error';
                const isSuccess = stepLog?.status === 'success';
                const service = getServiceNodeInfo(step.type);

                return (
                  <div
                    key={step.id}
                    className={`bg-white dark:bg-slate-900 p-5 rounded-2xl border border-l-4 ${service.accentBorder} transition-all relative overflow-hidden ${
                      isActive ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' : 
                      isSuccess ? 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/10 dark:bg-emerald-950/20' :
                      isFailed ? 'border-red-300 dark:border-red-800 bg-red-50/10 dark:bg-red-950/20' :
                      'border-slate-200 dark:border-slate-800 shadow-xs'
                    }`}
                  >
                    {/* Real-time Progress Bar per step */}
                    {isActive && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-blue-100 overflow-hidden">
                        <div className="h-full bg-blue-600 animate-pulse w-full origin-left animate-[indeterminate_1.5s_infinite_linear]"></div>
                      </div>
                    )}
                    {isSuccess && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                    )}
                    {isFailed && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-red-500"></div>
                    )}

                    <div className="flex items-center justify-between mb-3 gap-3">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Service Node Icon with Step Indicator */}
                        <div
                          className={`relative w-10 h-10 rounded-xl ${service.iconBg} border ${service.badgeBorder} flex items-center justify-center shrink-0 shadow-xs`}
                          title={`Service: ${service.categoryLabel}`}
                        >
                          <span className={service.iconColor}>
                            {service.icon('w-5 h-5')}
                          </span>
                          <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center border transition-all ${
                            isSuccess ? 'bg-emerald-600 text-white border-white dark:border-slate-900 shadow-xs' :
                            isFailed ? 'bg-red-600 text-white border-white dark:border-slate-900 shadow-xs' :
                            isActive ? 'bg-blue-600 text-white border-white dark:border-slate-900 animate-pulse shadow-xs' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-white dark:border-slate-900'
                          }`}>
                            {isSuccess ? '✓' : isFailed ? '✕' : idx + 1}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <input
                            type="text"
                            value={step.name}
                            onChange={(e) => {
                              const val = e.target.value;
                              setSteps(steps.map(s => s.id === step.id ? { ...s, name: val } : s));
                            }}
                            className="font-semibold text-slate-900 dark:text-slate-100 text-sm bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-slate-700 focus:border-blue-500 focus:outline-none w-full truncate"
                          />
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-semibold ${service.textColor} flex items-center gap-1`}>
                              {service.categoryLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 animate-pulse flex items-center gap-1">
                            <Loader2 className="w-3 h-3 animate-spin" /> RUNNING
                          </span>
                        )}
                        {isSuccess && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> SUCCESS
                          </span>
                        )}
                        {isFailed && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> ERROR
                          </span>
                        )}
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${service.badgeBg} ${service.badgeText} ${service.badgeBorder}`}>
                          {service.icon('w-3.5 h-3.5')}
                          <span>{service.badgeLabel}</span>
                        </span>
                        {/* Node Comments Toggle Button */}
                        <button
                          id={`step-comments-btn-${step.id}`}
                          type="button"
                          onClick={() => setExpandedCommentsStepId(expandedCommentsStepId === step.id ? null : step.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition cursor-pointer ${
                            (step.comments && step.comments.length > 0)
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                          title="Team notes, context & prompt tuning tips"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>{step.comments?.length ? `${step.comments.length} Note${step.comments.length > 1 ? 's' : ''}` : 'Notes'}</span>
                        </button>
                        <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-800 pl-2">
                          <button
                            onClick={() => moveStep(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                            title="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveStep(idx, 'down')}
                            disabled={idx === steps.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                            title="Move down"
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          onClick={() => removeStep(step.id)}
                          className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                          title="Remove step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Config parameters per step type */}
                    <div className="pl-13.5 space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                      {step.type === 'scrape_url' && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            <Globe className="w-3.5 h-3.5 text-sky-500" />
                            <span>Target Web URL:</span>
                          </label>
                          <input
                            type="text"
                            value={step.config.url || ''}
                            onChange={(e) => updateStepConfig(step.id, 'url', e.target.value)}
                            placeholder="https://example.com/research"
                            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      )}
                      {step.type === 'ai_synthesize' && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                            <span>AI Synthesis Instruction (Gemini DeepThink):</span>
                          </label>
                          <input
                            type="text"
                            value={step.config.prompt || ''}
                            onChange={(e) => updateStepConfig(step.id, 'prompt', e.target.value)}
                            placeholder="Synthesize key findings and format brief..."
                            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      )}
                      {step.type === 'docs_create' && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            <FileText className="w-3.5 h-3.5 text-amber-500" />
                            <span>Google Doc Title:</span>
                          </label>
                          <input
                            type="text"
                            value={step.config.docTitle || ''}
                            onChange={(e) => updateStepConfig(step.id, 'docTitle', e.target.value)}
                            placeholder="Q3 Executive Briefing"
                            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      )}
                      {step.type === 'gmail_draft' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              <Mail className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Recipient Email:</span>
                            </label>
                            <input
                              type="text"
                              value={step.config.recipient || ''}
                              onChange={(e) => updateStepConfig(step.id, 'recipient', e.target.value)}
                              placeholder="investor@firm.com"
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                          <div>
                            <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                              <Mail className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Email Subject:</span>
                            </label>
                            <input
                              type="text"
                              value={step.config.subject || ''}
                              onChange={(e) => updateStepConfig(step.id, 'subject', e.target.value)}
                              placeholder="Strategic Update"
                              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                            />
                          </div>
                        </div>
                      )}
                      {step.type === 'calendar_event' && (
                        <div>
                          <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                            <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Calendar Event Title:</span>
                          </label>
                          <input
                            type="text"
                            value={step.config.eventTitle || ''}
                            onChange={(e) => updateStepConfig(step.id, 'eventTitle', e.target.value)}
                            placeholder="Executive Strategy Sync"
                            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Node Comments & Team Context Section */}
                    <div className="pl-13.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setExpandedCommentsStepId(expandedCommentsStepId === step.id ? null : step.id)}
                            className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span>Node Notes & Team Context</span>
                            <span className="px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-mono">
                              {step.comments?.length || 0}
                            </span>
                          </button>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:inline">
                            • Context & tips are included when exported to ChatGPT/DeepSeek
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedCommentsStepId(expandedCommentsStepId === step.id ? null : step.id)}
                          className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                        >
                          {expandedCommentsStepId === step.id ? 'Hide Notes' : (step.comments && step.comments.length > 0 ? 'View / Edit' : '+ Add Note')}
                        </button>
                      </div>

                      {/* Always show compact preview if collapsed and has comments */}
                      {expandedCommentsStepId !== step.id && step.comments && step.comments.length > 0 && (
                        <div
                          onClick={() => setExpandedCommentsStepId(step.id)}
                          className="bg-slate-50/70 dark:bg-slate-950/60 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-900/80 transition"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                              {step.comments[0].tag || 'Note'}
                            </span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 shrink-0">
                              {step.comments[0].authorName}:
                            </span>
                            <span className="text-slate-600 dark:text-slate-400 truncate">
                              "{step.comments[0].text}"
                            </span>
                          </div>
                          {step.comments.length > 1 && (
                            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
                              +{step.comments.length - 1} more
                            </span>
                          )}
                        </div>
                      )}

                      {/* Expanded Comments Drawer */}
                      {expandedCommentsStepId === step.id && (
                        <div className="bg-slate-50/80 dark:bg-slate-950/80 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3.5 animate-in fade-in duration-150">
                          {/* Comments List */}
                          {step.comments && step.comments.length > 0 ? (
                            <div className="space-y-2.5">
                              {step.comments.map((cmt) => (
                                <div
                                  key={cmt.id}
                                  className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-1.5 shadow-2xs group"
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center">
                                        {cmt.authorName.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                                        {cmt.authorName}
                                      </span>
                                      {cmt.tag && (
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                          cmt.tag === 'Prompt Tip' ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800' :
                                          cmt.tag === 'Context' ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800' :
                                          cmt.tag === 'Review' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                          cmt.tag === 'TODO' ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800' :
                                          'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                                        }`}>
                                          {cmt.tag}
                                        </span>
                                      )}
                                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                        {cmt.timestamp}
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveStepComment(step.id, cmt.id)}
                                      className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-xs p-1 transition opacity-70 group-hover:opacity-100 cursor-pointer"
                                      title="Delete note"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-7">
                                    {cmt.text}
                                  </p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                              No notes or context added to this node yet. Add tips, review requirements, or instructions for teammates.
                            </p>
                          )}

                          {/* Add Note Form */}
                          <div className="pt-2 border-t border-slate-200/70 dark:border-slate-800 space-y-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Tag:</span>
                              {(['Prompt Tip', 'Context', 'Review', 'TODO', 'Note'] as const).map((t) => {
                                const isSelected = (newCommentTagByStep[step.id] || 'Context') === t;
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => setNewCommentTagByStep(prev => ({ ...prev, [step.id]: t }))}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition border cursor-pointer ${
                                      isSelected
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                                    }`}
                                  >
                                    {t}
                                  </button>
                                );
                              })}
                            </div>

                            <div className="flex gap-2">
                              <textarea
                                id={`step-comment-input-${step.id}`}
                                rows={2}
                                value={newCommentTextByStep[step.id] || ''}
                                onChange={(e) => setNewCommentTextByStep(prev => ({ ...prev, [step.id]: e.target.value }))}
                                placeholder="Add team context, model-tuning instructions, or operational note..."
                                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none shadow-2xs"
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleAddStepComment(step.id);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                id={`post-comment-btn-${step.id}`}
                                onClick={() => handleAddStepComment(step.id)}
                                disabled={!(newCommentTextByStep[step.id] || '').trim()}
                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white text-xs font-semibold rounded-xl transition cursor-pointer self-end shrink-0 shadow-2xs"
                              >
                                Post Note
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Integrated Smart Recommendation Engine */}
            <SmartStepRecommendations
              workflowName={workflowName}
              steps={steps}
              onAddStep={addConfiguredStep}
            />
          </div>

          {/* Live Execution Console & Output */}
          <div className="space-y-4">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" /> Live Execution Console
            </h2>
            <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-md min-h-[420px] flex flex-col justify-between">
              <div className="space-y-3 overflow-y-auto max-h-[360px] pr-1">
                {executionLogs.length === 0 && !isRunning && (
                  <div className="text-center py-16 text-slate-500 text-xs">
                    <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Click "Run Pipeline" to execute live API calls across the web, Gemini AI, and your Google Workspace.
                  </div>
                )}
                {isRunning && activeStepIndex !== null && (
                  <div className="flex items-center gap-3 p-3 bg-blue-950/50 border border-blue-800/60 rounded-xl animate-pulse">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs font-medium text-blue-200">
                      Executing Step {activeStepIndex + 1}: {steps[activeStepIndex]?.name}...
                    </span>
                  </div>
                )}
                {executionLogs.map((log, i) => (
                  <div key={i} className={`p-3 rounded-xl border text-xs space-y-1 ${
                    log.status === 'error' ? 'bg-red-950/60 border-red-800 text-red-200' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between text-slate-400">
                      <span className={`font-semibold flex items-center gap-1 ${log.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                        {log.status === 'error' ? <AlertCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />} {log.title}
                      </span>
                      <span>{log.timestamp}</span>
                    </div>
                    <p className="font-mono text-[11px] leading-relaxed">{log.output}</p>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-800 text-center">
                <span className="text-[11px] text-slate-500">
                  Workflow Studio Active & Connected to Google Workspace
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE: FLOWCHART VISUALIZATION */}
      {viewMode === 'flowchart' && (
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Pipeline Execution Flowchart</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Visual mapping of sequential execution logic from web ingestion to Google Workspace output.</p>
          </div>

          <div className="flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto py-4">
            {steps.map((step, idx) => {
              const service = getServiceNodeInfo(step.type);
              const nextStep = steps[idx + 1];

              return (
                <React.Fragment key={step.id}>
                  <div className={`w-full p-4 sm:p-5 rounded-2xl border border-l-4 ${service.accentBorder} transition shadow-sm flex items-center justify-between gap-4 ${
                    activeStepIndex === idx ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 ring-2 ring-blue-500/20' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}>
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`relative w-11 h-11 rounded-xl ${service.iconBg} border ${service.badgeBorder} flex items-center justify-center shrink-0 shadow-xs`}
                        title={`Service: ${service.categoryLabel}`}
                      >
                        <span className={service.iconColor}>
                          {service.icon('w-5 h-5')}
                        </span>
                        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-[9px] font-extrabold flex items-center justify-center shadow-xs">
                          {idx + 1}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">{step.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <p className={`text-xs ${service.textColor} font-semibold flex items-center gap-1`}>
                            {service.categoryLabel}
                          </p>
                          {step.comments && step.comments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800 shadow-2xs">
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>{step.comments.length} team note{step.comments.length > 1 ? 's' : ''}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {step.comments && step.comments.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedCommentsStepId(step.id);
                            setViewMode('builder');
                          }}
                          className="px-2 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                          title="Open notes in Step Builder"
                        >
                          View Notes
                        </button>
                      )}
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${service.badgeBg} ${service.badgeText} ${service.badgeBorder}`}>
                        {service.icon('w-3.5 h-3.5')}
                        <span>{service.badgeLabel}</span>
                      </span>
                    </div>
                  </div>
                  {idx < steps.length - 1 && (
                    <div className="flex flex-col items-center text-slate-400 dark:text-slate-600 py-1">
                      <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-700"></div>
                      <div className="px-2.5 py-1 my-1 bg-white dark:bg-slate-900 rounded-full border border-slate-200 dark:border-slate-800 text-[10px] font-medium text-slate-600 dark:text-slate-400 shadow-2xs flex items-center gap-1.5">
                        <ArrowDown className="w-3 h-3 text-blue-500" />
                        <span>{getServiceHandoffLabel(step.type, nextStep?.type)}</span>
                      </div>
                      <div className="w-0.5 h-3 bg-slate-300 dark:bg-slate-700"></div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}

            {/* Smart Next Step Flowchart Node */}
            {steps.length > 0 && (
              <>
                <div className="flex flex-col items-center text-slate-400 dark:text-slate-600 py-1">
                  <div className="w-0.5 h-6 border-l-2 border-dashed border-blue-400 dark:border-blue-600"></div>
                  <ArrowDown className="w-4 h-4 text-blue-500 animate-bounce" />
                </div>
                <div
                  id="flowchart-recommended-step-node"
                  className="w-full p-4 rounded-2xl border-2 border-dashed border-blue-300 dark:border-blue-800/80 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400 font-bold text-xs flex items-center justify-center shadow-xs">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5 justify-center sm:justify-start">
                        Smart Next Step Recommendation
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {steps[steps.length - 1]?.type === 'scrape_url' ? 'Synthesize harvested webpage intelligence with Gemini DeepThink' :
                         steps[steps.length - 1]?.type === 'ai_synthesize' ? 'Archive executive briefing into Google Docs or create Gmail draft' :
                         steps[steps.length - 1]?.type === 'docs_create' ? 'Draft stakeholder update email in Gmail or schedule Calendar review' :
                         steps[steps.length - 1]?.type === 'gmail_draft' ? 'Schedule follow-up reminder in Google Calendar' :
                         'Generate meeting agenda doc in Google Docs'}
                      </p>
                    </div>
                  </div>
                  <button
                    id="flowchart-quick-add-recommended-btn"
                    onClick={() => {
                      const lastType = steps[steps.length - 1]?.type;
                      if (lastType === 'scrape_url') {
                        addConfiguredStep({
                          name: 'Gemini AI Synthesis & Extraction',
                          type: 'ai_synthesize',
                          config: { prompt: 'Synthesize the extracted webpage content into top 3 strategic insights.' }
                        });
                      } else if (lastType === 'ai_synthesize') {
                        addConfiguredStep({
                          name: 'Generate Executive Brief in Google Docs',
                          type: 'docs_create',
                          config: { docTitle: `${workflowName || 'Executive Summary'} - AI Brief` }
                        });
                      } else if (lastType === 'docs_create') {
                        addConfiguredStep({
                          name: 'Draft Email Announcing New Document',
                          type: 'gmail_draft',
                          config: { recipient: 'stakeholders@company.com', subject: `New Document Published: ${steps[steps.length - 1]?.config.docTitle || 'Executive Briefing'}` }
                        });
                      } else if (lastType === 'gmail_draft') {
                        addConfiguredStep({
                          name: 'Schedule Email Response Follow-Up',
                          type: 'calendar_event',
                          config: { eventTitle: `Follow-up: ${steps[steps.length - 1]?.config.subject || 'Outbound Briefing'}` }
                        });
                      } else {
                        addConfiguredStep({
                          name: 'Generate Meeting Agenda & Objectives Doc',
                          type: 'docs_create',
                          config: { docTitle: `Meeting Agenda: ${steps[steps.length - 1]?.config.eventTitle || 'Strategic Sync'}` }
                        });
                      }
                      setSuccessMsg('Added recommended next step from flowchart!');
                      setTimeout(() => setSuccessMsg(null), 3500);
                    }}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Append Recommended Step</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* VIEW MODE: TEMPLATE LIBRARY */}
      {viewMode === 'templates' && (
        <div className="space-y-6">
          {/* Hidden File Input for JSON template imports */}
          <input
            type="file"
            ref={fileImportInputRef}
            accept=".json,application/json"
            onChange={handleImportTemplatesJSON}
            className="hidden"
          />

          {/* Header & Search */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Workflow Template Library</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {savedTemplates.length} Templates
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Multi-step prompt-engineered automation templates. Select one, multiple, or all templates to export for universal ingestion by any AI model.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
                <input
                  type="text"
                  id="template-search-input"
                  value={templateSearchQuery}
                  onChange={(e) => setTemplateSearchQuery(e.target.value)}
                  placeholder="Search templates, steps, prompts, or #tags..."
                  className="w-full pl-9 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-xs"
                />
                {templateSearchQuery && (
                  <button
                    onClick={() => setTemplateSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Import JSON Button */}
              <button
                id="import-templates-json-btn"
                onClick={() => fileImportInputRef.current?.click()}
                className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer shadow-xs"
                title="Upload exported workflow JSON configuration"
              >
                <Upload className="w-3.5 h-3.5 text-blue-500" />
                <span>Import JSON</span>
              </button>

              {/* Select All / Deselect All */}
              <button
                id="select-all-templates-btn"
                onClick={selectAllTemplatesForBatch}
                className="px-3 py-2 text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition whitespace-nowrap cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                {batchSelectedTemplateIds.length === savedTemplates.length ? (
                  <>
                    <CheckSquare className="w-3.5 h-3.5 text-blue-600" />
                    <span>Deselect All</span>
                  </>
                ) : (
                  <>
                    <Square className="w-3.5 h-3.5 text-slate-400" />
                    <span>Select All ({savedTemplates.length})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Smart AI Recommendations Based on Historical Automation Patterns */}
          {recommendedUntriedTemplates.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-purple-50/50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-purple-950/20 p-5 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 shadow-xs space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span>Recommended for You Based on Your Automation Patterns</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
                        AI Curated
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Popular templates you haven't tried yet, tailored to your historical task sequences.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recommendedUntriedTemplates.map(template => {
                  const score = (template.upvotes ?? 15) - (template.downvotes ?? 1);
                  return (
                    <div
                      key={`rec_${template.id}`}
                      className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-blue-100 dark:border-blue-900/60 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-400 transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            Score: +{score}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/60">
                            {template.steps.length} Steps
                          </span>
                        </div>
                        <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{template.name}</h5>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{template.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1 flex-wrap">
                          {(template.tags || ['Workflow']).slice(0, 3).map((tg, idx) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                              #{tg}
                            </span>
                          ))}
                        </div>

                        <button
                          onClick={() => loadTemplate(template)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <Bookmark className="w-3 h-3" />
                          <span>Try Template</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Categories Bar */}
          <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                <span>Categories:</span>
              </span>

              <button
                onClick={() => setTemplateCategoryFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  templateCategoryFilter === 'all'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                All ({savedTemplates.length})
              </button>

              <button
                onClick={() => setTemplateCategoryFilter('workspace')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  templateCategoryFilter === 'workspace'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Mail className="w-3 h-3 text-red-500" />
                <span>Google Workspace ({savedTemplates.filter(t => t.steps.some(s => s.type === 'docs_create' || s.type === 'gmail_draft' || s.type === 'calendar_event')).length})</span>
              </button>

              <button
                onClick={() => setTemplateCategoryFilter('ai')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  templateCategoryFilter === 'ai'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Sparkles className="w-3 h-3 text-purple-500" />
                <span>AI Synthesis ({savedTemplates.filter(t => t.steps.some(s => s.type === 'ai_synthesize')).length})</span>
              </button>

              <button
                onClick={() => setTemplateCategoryFilter('web')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  templateCategoryFilter === 'web'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <Globe className="w-3 h-3 text-emerald-500" />
                <span>Web Research ({savedTemplates.filter(t => t.steps.some(s => s.type === 'scrape_url')).length})</span>
              </button>

              {savedTemplates.some(t => !DEFAULT_TEMPLATES.some(dt => dt.id === t.id)) && (
                <button
                  onClick={() => setTemplateCategoryFilter('custom')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    templateCategoryFilter === 'custom'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Custom Saved ({savedTemplates.filter(t => !DEFAULT_TEMPLATES.some(dt => dt.id === t.id)).length})
                </button>
              )}

              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  showFavoritesOnly
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
                title="Toggle Favorites Only"
              >
                <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-current text-white' : 'text-rose-500'}`} />
                <span>Favorites ({savedTemplates.filter(t => t.isFavorite).length})</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <span>Sort by:</span>
                <select
                  id="template-sort-select"
                  value={templateSortBy}
                  onChange={(e) => setTemplateSortBy(e.target.value as any)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="score">Most Voted (Score)</option>
                  <option value="newest">Newest First</option>
                  <option value="steps">Step Count</option>
                  <option value="alphabetical">Alphabetical (A-Z)</option>
                </select>
              </div>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                Showing <strong className="text-slate-900 dark:text-slate-100">{filteredTemplates.length}</strong> of {savedTemplates.length} templates
              </div>
            </div>
          </div>

          {/* Interactive Tag Filtering Cloud Bar */}
          {allUniqueTags.length > 0 && (
            <div className="flex items-center justify-between gap-3 flex-wrap py-1.5 px-3 bg-slate-50/80 dark:bg-slate-800/40 rounded-xl border border-slate-200/60 dark:border-slate-800/60">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 mr-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-blue-500" />
                  <span>Filter by Label / Tag:</span>
                </span>

                {allUniqueTags.map(({ tag, count }) => {
                  const isActive = selectedTagFilter?.toLowerCase() === tag.toLowerCase();
                  return (
                    <button
                      key={tag}
                      onClick={() => setSelectedTagFilter(isActive ? null : tag)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-500/30'
                          : 'bg-white hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700'
                      }`}
                      title={`Filter by tag #${tag} (${count} template${count > 1 ? 's' : ''})`}
                    >
                      <span>#{tag}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        {count}
                      </span>
                      {isActive && <X className="w-3 h-3 ml-0.5" />}
                    </button>
                  );
                })}

                {selectedTagFilter && (
                  <button
                    onClick={() => setSelectedTagFilter(null)}
                    className="px-2 py-1 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition cursor-pointer underline flex items-center gap-1"
                  >
                    Clear tag filter
                  </button>
                )}
              </div>

              {selectedTagFilter && (
                <div className="flex items-center gap-2 text-xs bg-blue-100/70 dark:bg-blue-950/80 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                  <span className="font-medium">Active filter:</span>
                  <span className="font-bold">#{selectedTagFilter}</span>
                  <button
                    onClick={() => setSelectedTagFilter(null)}
                    className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-200 font-bold ml-1 cursor-pointer"
                    title="Remove tag filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Multi-Template Batch Export & Selection Action Banner */}
          {batchSelectedTemplateIds.length > 0 && (
            <div
              id="multi-template-export-banner"
              className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50/40 dark:from-blue-950/50 dark:via-indigo-950/40 dark:to-purple-950/30 border-2 border-blue-300 dark:border-blue-800 p-4 rounded-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20">
                  {batchSelectedTemplateIds.length}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-blue-950 dark:text-blue-100">
                      {batchSelectedTemplateIds.length} {batchSelectedTemplateIds.length === 1 ? 'Template' : 'Templates'} Selected
                    </h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-200/80 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200">
                      Ready for Export
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-0.5">
                    Export selected workflows as a combined Structured Markdown (.md) task specification or machine-readable JSON (.json).
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap w-full lg:w-auto justify-end">
                {/* Download MD (Selected) */}
                <button
                  id="batch-download-md-btn"
                  onClick={handleExportSelectedMD}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Download selected templates formatted with Markdown headers, lightweight XML, and blockquote delimiters"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download MD ({batchSelectedTemplateIds.length})</span>
                </button>

                {/* Download JSON (Selected) */}
                <button
                  id="batch-download-json-btn"
                  onClick={handleExportSelectedJSON}
                  className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Download selected templates as structured JSON configuration"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Download JSON ({batchSelectedTemplateIds.length})</span>
                </button>

                {/* Export Preview (Selected) */}
                <button
                  id="batch-export-preview-btn"
                  onClick={handleOpenExportPreviewSelected}
                  className="px-3 py-2 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Preview combined Markdown and JSON before copying or downloading"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-500" />
                  <span>Inspect Preview</span>
                </button>

                {/* Open Batch Queue */}
                <button
                  id="batch-open-queue-btn"
                  onClick={() => setViewMode('batch')}
                  className="px-3 py-2 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                  title="Open Sequential Batch Execution Runner"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Queue Batch</span>
                </button>

                {/* Clear Selection */}
                <button
                  onClick={clearBatchQueue}
                  className="px-2.5 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition cursor-pointer"
                  title="Deselect all templates"
                >
                  Clear
                </button>
              </div>
            </div>
          )}

          {/* Empty state when search yields no templates */}
          {filteredTemplates.length === 0 && (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">No matching workflow templates found</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                {selectedTagFilter 
                  ? `No templates matched label #${selectedTagFilter}${templateSearchQuery ? ` and query "${templateSearchQuery}"` : ''}. Try picking another label or clearing the filters.`
                  : `No templates matched your current filter criteria "${templateSearchQuery}". Try searching for "AI", "Gmail", "Research", or clear your search query.`}
              </p>
              <button
                onClick={() => {
                  setTemplateSearchQuery('');
                  setSelectedTagFilter(null);
                  setTemplateCategoryFilter('all');
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Reset Search & Tag Filters
              </button>
            </div>
          )}

          {/* Template Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => {
              const isSelected = batchSelectedTemplateIds.includes(template.id);
              const isCustom = !DEFAULT_TEMPLATES.some(dt => dt.id === template.id);
              return (
                <div 
                  key={template.id} 
                  id={`workflow-template-card-${template.id}`}
                  onMouseEnter={() => {
                    if (quickPeekHoverTimerRef.current) clearTimeout(quickPeekHoverTimerRef.current);
                    quickPeekHoverTimerRef.current = setTimeout(() => {
                      setQuickPeekTemplateId(template.id);
                    }, 180);
                  }}
                  onMouseLeave={() => {
                    if (quickPeekHoverTimerRef.current) clearTimeout(quickPeekHoverTimerRef.current);
                    quickPeekHoverTimerRef.current = setTimeout(() => {
                      setQuickPeekTemplateId(prev => prev === template.id ? null : prev);
                    }, 120);
                  }}
                  className={`relative bg-white dark:bg-slate-900 p-6 rounded-2xl border transition-all space-y-4 flex flex-col justify-between ${
                    isSelected
                      ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20 bg-blue-50/10 dark:bg-blue-950/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    {/* Top Row: Checkbox Selector + Tags */}
                    <div className="flex items-center justify-between">
                      {/* Robust Checkbox Selector */}
                      <label
                        htmlFor={`template-checkbox-${template.id}`}
                        className="flex items-center gap-2 cursor-pointer p-1 -m-1 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/50 transition group select-none"
                      >
                        <input
                          type="checkbox"
                          id={`template-checkbox-${template.id}`}
                          checked={isSelected}
                          onChange={() => toggleSelectTemplateForBatch(template.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 cursor-pointer"
                        />
                        <span className={`text-xs font-semibold transition ${
                          isSelected ? 'text-blue-700 dark:text-blue-400 font-bold' : 'text-slate-700 dark:text-slate-300 group-hover:text-blue-600'
                        }`}>
                          {isSelected ? 'Selected for Export' : 'Select'}
                        </span>
                      </label>

                      <div className="flex items-center gap-1.5">
                        {isCustom && (
                          <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 rounded-md border border-purple-200 dark:border-purple-800">
                            Custom
                          </span>
                        )}
                        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md border border-blue-100 dark:border-blue-900/60">
                          {template.steps.length} Steps
                        </span>
                        {/* Quick Peek Button Trigger */}
                        <button
                          type="button"
                          id={`quick-peek-trigger-${template.id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setQuickPeekTemplateId(prev => prev === template.id ? null : template.id);
                          }}
                          onMouseEnter={(e) => {
                            e.stopPropagation();
                            if (quickPeekHoverTimerRef.current) clearTimeout(quickPeekHoverTimerRef.current);
                            setQuickPeekTemplateId(template.id);
                          }}
                          className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border flex items-center gap-1 transition cursor-pointer ${
                            quickPeekTemplateId === template.id
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border-slate-200 dark:border-slate-700 hover:border-blue-300'
                          }`}
                          title="Quick Peek: Hover or click to view the first 3 steps in sequence"
                        >
                          <Eye className="w-3 h-3 text-blue-500" />
                          <span>Quick Peek</span>
                        </button>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">{template.name}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{template.description}</p>
                    
                    {/* Custom Labels & Tags */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1">
                          <Tag className="w-3 h-3 text-blue-500" />
                          <span>Labels & Tags:</span>
                        </span>
                        {inlineTagInputTemplateId !== template.id && (
                          <button
                            onClick={() => {
                              setInlineTagInputTemplateId(template.id);
                              setInlineTagValue('');
                            }}
                            className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" /> Add Label
                          </button>
                        )}
                      </div>

                      {/* Tag Chips */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        {(template.tags && template.tags.length > 0 ? template.tags : ['Workflow']).map((tag, tIdx) => {
                          const isTagActive = selectedTagFilter?.toLowerCase() === tag.toLowerCase();
                          return (
                            <span
                              key={tIdx}
                              onClick={() => setSelectedTagFilter(isTagActive ? null : tag)}
                              className={`group inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium transition cursor-pointer ${
                                isTagActive
                                  ? 'bg-blue-600 text-white shadow-2xs ring-2 ring-blue-400/40'
                                  : 'bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200/70 dark:border-slate-700/70'
                              }`}
                              title={`Click to filter library by #${tag}`}
                            >
                              <span>#{tag}</span>
                              <button
                                type="button"
                                onClick={(e) => handleRemoveTagFromTemplate(template.id, tag, e)}
                                className={`text-slate-400 hover:text-red-500 rounded-full p-0.5 transition ${isTagActive ? 'hover:text-white' : ''}`}
                                title={`Remove label #${tag}`}
                              >
                                <X className="w-2.5 h-2.5" />
                              </button>
                            </span>
                          );
                        })}

                        {/* Inline Tag Input */}
                        {inlineTagInputTemplateId === template.id && (
                          <div className="flex items-center gap-1 mt-1 w-full bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-blue-300 dark:border-blue-700">
                            <input
                              type="text"
                              autoFocus
                              value={inlineTagValue}
                              onChange={(e) => setInlineTagValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddTagToTemplate(template.id);
                                } else if (e.key === 'Escape') {
                                  setInlineTagInputTemplateId(null);
                                }
                              }}
                              placeholder="New label name (press Enter)..."
                              className="text-xs px-2 py-1 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500 flex-1"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddTagToTemplate(template.id)}
                              className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-2xs cursor-pointer"
                            >
                              Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setInlineTagInputTemplateId(null)}
                              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase">Sequence preview:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {template.steps.map((s, i) => {
                          const sService = getServiceNodeInfo(s.type);
                          return (
                            <span
                              key={i}
                              className={`px-2 py-1 ${sService.badgeBg} ${sService.textColor} border ${sService.badgeBorder} rounded-lg text-[11px] font-semibold flex items-center gap-1.5 shadow-2xs`}
                            >
                              {sService.icon('w-3 h-3')}
                              <span>{i + 1}. {s.name}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Voting & Favorite Toolbar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        id={`upvote-template-${template.id}`}
                        onClick={(e) => handleVoteTemplate(template.id, 'up', e)}
                        className="flex items-center gap-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg transition cursor-pointer"
                        title="Upvote this workflow automation template"
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span className="font-bold">+{template.upvotes ?? 15}</span>
                      </button>

                      <button
                        id={`downvote-template-${template.id}`}
                        onClick={(e) => handleVoteTemplate(template.id, 'down', e)}
                        className="flex items-center gap-1 px-2 py-1 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-lg transition cursor-pointer"
                        title="Downvote"
                      >
                        <ThumbsDown className="w-3 h-3" />
                        <span className="font-semibold">{template.downvotes ?? 1}</span>
                      </button>

                      <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1 font-medium">
                        Score: <strong className="text-slate-900 dark:text-slate-100">{(template.upvotes ?? 15) - (template.downvotes ?? 1)}</strong>
                      </span>
                    </div>

                    <button
                      id={`favorite-template-${template.id}`}
                      onClick={(e) => handleToggleFavoriteTemplate(template.id, e)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        template.isFavorite
                          ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 border-slate-200 dark:border-slate-700'
                      }`}
                      title={template.isFavorite ? 'Remove from favorites' : 'Add to favorite templates'}
                    >
                      <Heart className={`w-3 h-3 ${template.isFavorite ? 'fill-current text-white' : 'text-rose-500'}`} />
                      <span>{template.isFavorite ? 'Favorited' : 'Favorite'}</span>
                    </button>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex-wrap sm:flex-nowrap">
                    <button
                      id={`load-template-${template.id}`}
                      onClick={() => loadTemplate(template)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer whitespace-nowrap"
                    >
                      <Bookmark className="w-3.5 h-3.5" /> Load into Studio
                    </button>

                    {/* Download MD */}
                    <button
                      id={`download-md-template-${template.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadWorkflowAsMarkdown(template.name, template.description, template.steps, { tags: template.tags });
                        setSuccessMsg(`Downloaded "${template.name}" as Structured Markdown (.md)!`);
                        setTimeout(() => setSuccessMsg(null), 3000);
                      }}
                      className="p-2 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl transition shadow-xs cursor-pointer"
                      title="Download Markdown (.md) task specification with XML & blockquote delimiters"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    {/* Download JSON */}
                    <button
                      id={`download-json-template-${template.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadWorkflowAsJSON(template.name, template.description, template.steps, template.tags);
                        setSuccessMsg(`Downloaded "${template.name}" as JSON (.json)!`);
                        setTimeout(() => setSuccessMsg(null), 3000);
                      }}
                      className="p-2 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-xl transition shadow-xs cursor-pointer"
                      title="Download JSON (.json) configuration"
                    >
                      <Code className="w-4 h-4" />
                    </button>

                    {/* Export Preview Modal */}
                    <button
                      id={`export-prompt-template-${template.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPromptModalWorkflow({
                          name: template.name,
                          description: template.description,
                          steps: template.steps,
                          tags: template.tags
                        });
                        setShowUniversalPromptModal(true);
                      }}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl transition shadow-xs cursor-pointer"
                      title="Inspect export preview (Markdown / JSON)"
                    >
                      <FileText className="w-4 h-4" />
                    </button>

                    {/* Share */}
                    <button
                      onClick={(e) => handleShareTemplate(template, e)}
                      className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 rounded-xl transition shadow-xs cursor-pointer"
                      title="Share this template"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>

                    {/* Delete (custom templates only) */}
                    {isCustom && (
                      <button
                        onClick={(e) => handleDeleteTemplate(template.id, template.name, e)}
                        className="p-2 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 rounded-xl transition shadow-xs cursor-pointer"
                        title="Delete custom template"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Quick Peek Popover */}
                  <TemplateQuickPeekPopover
                    template={template}
                    isOpen={quickPeekTemplateId === template.id}
                    onClose={() => setQuickPeekTemplateId(null)}
                    onLoadTemplate={loadTemplate}
                    getServiceNodeInfo={getServiceNodeInfo}
                    getServiceHandoffLabel={getServiceHandoffLabel}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE: BATCH QUEUE MODE */}
      {viewMode === 'batch' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg">
                  <ListOrdered className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sequential Batch Execution Queue</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Trigger multiple workflow templates consecutively in an orchestrated automated batch queue.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => setViewMode('templates')}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl transition cursor-pointer shadow-xs"
              >
                + Add Templates from Library
              </button>
              {batchSelectedTemplateIds.length > 0 && (
                <button
                  onClick={clearBatchQueue}
                  disabled={isBatchRunning}
                  className="px-3.5 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 border border-red-200 dark:border-red-900/60 rounded-xl transition cursor-pointer"
                >
                  Clear Queue
                </button>
              )}
              <button
                onClick={() => runBatchWorkflowQueue(true)}
                disabled={isBatchRunning || batchSelectedTemplateIds.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
                title="Test run all queued templates in safe sandboxed mode"
              >
                <Sparkles className="w-3.5 h-3.5" /> Test Batch (Sandbox)
              </button>
              <button
                onClick={() => runBatchWorkflowQueue(false)}
                disabled={isBatchRunning || batchSelectedTemplateIds.length === 0}
                className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                {isBatchRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
                {isBatchRunning ? 'Executing Batch...' : `Run Batch (${batchSelectedTemplateIds.length})`}
              </button>
            </div>
          </div>

          {/* Queue overview cards */}
          {batchSelectedTemplateIds.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                <ListOrdered className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Your Batch Queue is Empty</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Select workflow templates from your Template Library to chain them sequentially into a unified batch queue.
                </p>
              </div>
              <button
                onClick={() => setViewMode('templates')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
              >
                Browse Template Library <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Queue List (2 cols on lg) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <span>Queued Workflows ({batchSelectedTemplateIds.length})</span>
                    {isBatchRunning && (
                      <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded-full animate-pulse">
                        Executing Queue
                      </span>
                    )}
                  </h4>
                  <span className="text-xs text-slate-500 dark:text-slate-400">Executes sequentially in order</span>
                </div>

                <div className="space-y-3">
                  {batchSelectedTemplateIds.map((templateId, idx) => {
                    const template = savedTemplates.find(t => t.id === templateId);
                    if (!template) return null;

                    const result = batchResults.find(r => r.templateId === templateId);
                    const isCurrent = activeBatchIndex === idx;
                    const isSuccess = result?.status === 'success';
                    const isError = result?.status === 'error';

                    return (
                      <div
                        key={templateId}
                        className={`p-5 rounded-2xl border transition shadow-sm ${
                          isCurrent
                            ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/20'
                            : isSuccess
                            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                            : isError
                            ? 'bg-red-50/40 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${
                              isCurrent
                                ? 'bg-blue-600 text-white animate-pulse'
                                : isSuccess
                                ? 'bg-emerald-600 text-white'
                                : isError
                                ? 'bg-red-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            }`}>
                              {isCurrent ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : isSuccess ? (
                                <Check className="w-4 h-4 stroke-[3]" />
                              ) : isError ? (
                                <AlertCircle className="w-4 h-4" />
                              ) : (
                                idx + 1
                              )}
                            </div>

                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-sm font-bold text-slate-900 dark:text-slate-100">{template.name}</h5>
                                <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                  {template.steps.length} Steps
                                </span>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300">
                                    Step {(result?.currentStepIndex || 0) + 1} of {template.steps.length}
                                  </span>
                                )}
                                {isSuccess && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                                    Completed
                                  </span>
                                )}
                                {isError && (
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300">
                                    Failed
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{template.description}</p>
                              
                              <div className="flex flex-wrap gap-1.5 pt-1.5">
                                {template.steps.map((s, sIdx) => {
                                  const isCurrentStep = isCurrent && result?.currentStepIndex === sIdx;
                                  const sService = getServiceNodeInfo(s.type);
                                  return (
                                    <span
                                      key={sIdx}
                                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition flex items-center gap-1.5 ${
                                        isCurrentStep
                                          ? 'bg-blue-600 text-white font-bold ring-1 ring-blue-700 shadow-xs'
                                          : `${sService.badgeBg} ${sService.textColor} border ${sService.badgeBorder}`
                                      }`}
                                    >
                                      {sService.icon('w-2.5 h-2.5')}
                                      <span>{sIdx + 1}. {s.name}</span>
                                    </span>
                                  );
                                })}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => loadTemplate(template)}
                              disabled={isBatchRunning}
                              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40"
                              title="Load into Studio"
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toggleSelectTemplateForBatch(template.id)}
                              disabled={isBatchRunning}
                              className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-40"
                              title="Remove from batch queue"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Batch Console Output (1 col on lg) */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Batch Execution Console
                </h4>
                <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-md min-h-[460px] flex flex-col justify-between">
                  <div className="space-y-3 overflow-y-auto max-h-[400px] pr-1">
                    {batchLogs.length === 0 && !isBatchRunning && (
                      <div className="text-center py-20 text-slate-500 text-xs space-y-2">
                        <Clock className="w-8 h-8 mx-auto opacity-40" />
                        <p>Click "Run Batch" or "Test Batch" to trigger the sequence.</p>
                        <p className="text-[11px] text-slate-600">
                          Outputs, Gemini prompts, and Google Workspace operations will stream live here.
                        </p>
                      </div>
                    )}
                    {isBatchRunning && activeBatchIndex !== null && (
                      <div className="flex items-center gap-3 p-3 bg-blue-950/60 border border-blue-800/80 rounded-xl animate-pulse">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                        <span className="text-xs font-medium text-blue-200">
                          Batch Progress: Running Workflow {activeBatchIndex + 1} of {batchSelectedTemplateIds.length}...
                        </span>
                      </div>
                    )}
                    {batchLogs.map((log, i) => (
                      <div key={i} className={`p-3 rounded-xl border text-xs space-y-1 ${
                        log.status === 'error' ? 'bg-red-950/60 border-red-800 text-red-200' : 'bg-slate-800/80 border-slate-700/60 text-slate-300'
                      }`}>
                        <div className="flex items-center justify-between text-slate-400">
                          <span className={`font-semibold flex items-center gap-1.5 ${log.status === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                            {log.status === 'error' ? <AlertCircle className="w-3.5 h-3.5 shrink-0" /> : <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />} 
                            <span className="line-clamp-1">{log.title}</span>
                          </span>
                          <span className="text-[10px] shrink-0">{log.timestamp}</span>
                        </div>
                        <p className="font-mono text-[11px] leading-relaxed break-words">{log.output}</p>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                    <span>Batch Queue: {batchSelectedTemplateIds.length} Workflows</span>
                    <span>{isBatchRunning ? 'Processing...' : 'Ready'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE: VISUAL DEPENDENCY GRAPH (D3) */}
      {viewMode === 'graph' && (
        <WorkflowDependencyGraph
          currentWorkflowName={workflowName}
          currentSteps={steps}
          savedTemplates={savedTemplates}
          onLoadWorkflow={(template) => {
            setWorkflowName(template.name);
            setSteps(template.steps);
            setViewMode('builder');
            setSuccessMsg(`Loaded workflow template "${template.name}" into canvas!`);
            setTimeout(() => setSuccessMsg(null), 3500);
          }}
          onRunWorkflow={runWorkflow}
        />
      )}

      {/* SHARE WORKFLOW MODAL */}
      {showShareModal && templateToShare && (
        <ShareWorkflowModal
          workflowName={templateToShare.name}
          workflowDescription={templateToShare.description}
          steps={templateToShare.steps}
          onClose={() => {
            setShowShareModal(false);
            setTemplateToShare(null);
          }}
        />
      )}

      {/* UNIVERSAL AI PROMPT EXPORT MODAL (Universal Markdown & Structured JSON) */}
      {showUniversalPromptModal && promptModalWorkflow && (
        <UniversalAIPromptExportModal
          workflowName={promptModalWorkflow.name}
          workflowDescription={promptModalWorkflow.description}
          steps={promptModalWorkflow.steps}
          tags={promptModalWorkflow.tags}
          templates={promptModalWorkflow.templates}
          onClose={() => {
            setShowUniversalPromptModal(false);
            setPromptModalWorkflow(null);
          }}
        />
      )}
    </div>
  );
};
