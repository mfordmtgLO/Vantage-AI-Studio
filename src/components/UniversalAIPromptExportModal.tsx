import React, { useState, useMemo } from 'react';
import {
  Download,
  Copy,
  Check,
  FileText,
  Code,
  Layers,
  MessageSquare,
  Sparkles,
  X,
  Sliders,
  CheckCircle2,
  FolderArchive
} from 'lucide-react';
import { WorkflowStep } from './LogicOrchestratorView';
import {
  generateWorkflowMarkdown,
  generateWorkflowJSON,
  downloadWorkflowAsMarkdown,
  downloadWorkflowAsJSON,
  generateMultiWorkflowMarkdown,
  generateMultiWorkflowJSON,
  downloadMultiWorkflowAsMarkdown,
  downloadMultiWorkflowAsJSON,
  ExportableWorkflowTemplate
} from '../utils/workflowExport';

interface UniversalAIPromptExportModalProps {
  workflowName?: string;
  workflowDescription?: string;
  steps?: WorkflowStep[];
  templates?: ExportableWorkflowTemplate[];
  tags?: string[];
  onClose: () => void;
}

export type ExportViewMode = 'markdown' | 'json';

export const UniversalAIPromptExportModal: React.FC<UniversalAIPromptExportModalProps> = ({
  workflowName = 'Custom Workflow Pipeline',
  workflowDescription = 'Automated multi-step pipeline powered by AI and Google Workspace.',
  steps = [],
  templates,
  tags,
  onClose
}) => {
  const [viewMode, setViewMode] = useState<ExportViewMode>('markdown');
  const [includeComments, setIncludeComments] = useState<boolean>(true);
  const [useVariablePlaceholders, setUseVariablePlaceholders] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccessMsg, setDownloadSuccessMsg] = useState<string | null>(null);

  const isCollection = Boolean(templates && templates.length > 0);
  const activeTemplates: ExportableWorkflowTemplate[] = useMemo(() => {
    if (templates && templates.length > 0) return templates;
    return [{
      id: 'current_workflow',
      name: workflowName,
      description: workflowDescription,
      steps,
      tags
    }];
  }, [templates, workflowName, workflowDescription, steps, tags]);

  // Count total team comments across all steps
  const totalCommentsCount = useMemo(() => {
    return activeTemplates.reduce((acc, t) => {
      return acc + t.steps.reduce((sAcc, step) => sAcc + (step.comments?.length || 0), 0);
    }, 0);
  }, [activeTemplates]);

  const totalTasksCount = useMemo(() => {
    return activeTemplates.reduce((acc, t) => acc + t.steps.length, 0);
  }, [activeTemplates]);

  // Generated Markdown content with lightweight XML & blockquote delimiters
  const generatedMarkdown = useMemo(() => {
    if (activeTemplates.length > 1) {
      return generateMultiWorkflowMarkdown(activeTemplates, {
        includeComments,
        useVariablePlaceholders
      });
    }
    const single = activeTemplates[0];
    return generateWorkflowMarkdown(single.name, single.description, single.steps, {
      includeComments,
      useVariablePlaceholders,
      tags: single.tags
    });
  }, [activeTemplates, includeComments, useVariablePlaceholders]);

  // Generated Structured JSON
  const generatedJSON = useMemo(() => {
    if (activeTemplates.length > 1) {
      return generateMultiWorkflowJSON(activeTemplates);
    }
    const single = activeTemplates[0];
    return generateWorkflowJSON(single.name, single.description, single.steps, single.tags);
  }, [activeTemplates]);

  const activeContent = viewMode === 'markdown' ? generatedMarkdown : generatedJSON;

  // Copy active preview to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(activeContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy content: ', err);
    }
  };

  // Download Markdown file (.md)
  const handleDownloadMD = () => {
    if (activeTemplates.length > 1) {
      downloadMultiWorkflowAsMarkdown(activeTemplates, 'workflow_collection', {
        includeComments,
        useVariablePlaceholders
      });
      setDownloadSuccessMsg(`Downloaded collection of ${activeTemplates.length} templates as Markdown (.md)!`);
    } else {
      const single = activeTemplates[0];
      downloadWorkflowAsMarkdown(single.name, single.description, single.steps, {
        includeComments,
        useVariablePlaceholders
      });
      setDownloadSuccessMsg('Downloaded Markdown (.md) task specification!');
    }
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  // Download JSON file (.json)
  const handleDownloadJSON = () => {
    if (activeTemplates.length > 1) {
      downloadMultiWorkflowAsJSON(activeTemplates, 'workflow_collection');
      setDownloadSuccessMsg(`Downloaded collection of ${activeTemplates.length} templates as JSON (.json)!`);
    } else {
      const single = activeTemplates[0];
      downloadWorkflowAsJSON(single.name, single.description, single.steps);
      setDownloadSuccessMsg('Downloaded Structured JSON (.json) workflow configuration!');
    }
    setTimeout(() => setDownloadSuccessMsg(null), 3000);
  };

  const displayName = activeTemplates.length > 1 
    ? `${activeTemplates.length} Workflow Templates Collection` 
    : (activeTemplates[0]?.name || workflowName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="universal-ai-prompt-modal"
        className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-purple-50/30 to-transparent dark:from-blue-950/20 dark:via-purple-950/10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              {activeTemplates.length > 1 ? <FolderArchive className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {activeTemplates.length > 1 ? `Export ${activeTemplates.length} Workflow Templates` : 'Workflow Export & Task Specification'}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                  Universal AI Ingestion
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeTemplates.length > 1
                  ? 'Export your selected multi-step templates into a unified Markdown task suite with XML/blockquote delimiters, or download machine-readable JSON.'
                  : 'Export your multi-step sequence as structured Markdown with XML/blockquote delimiters, or download machine-readable JSON.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* View Mode & Configuration Bar */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Format Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/70 dark:bg-slate-800/70 rounded-xl">
            <button
              id="export-tab-markdown"
              onClick={() => setViewMode('markdown')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                viewMode === 'markdown'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs ring-1 ring-blue-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-blue-500" />
              <span>Markdown Task List (.md)</span>
            </button>

            <button
              id="export-tab-json"
              onClick={() => setViewMode('json')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-2 cursor-pointer ${
                viewMode === 'json'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-xs ring-1 ring-purple-500/20'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-purple-500" />
              <span>Structured JSON (.json)</span>
            </button>
          </div>

          {/* Quick Options (Comments & Placeholders) */}
          <div className="flex items-center gap-4 text-xs flex-wrap">
            {viewMode === 'markdown' && (
              <>
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={includeComments}
                    onChange={(e) => setIncludeComments(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                  />
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <span>Include Team Notes ({totalCommentsCount})</span>
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={useVariablePlaceholders}
                    onChange={(e) => setUseVariablePlaceholders(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
                  />
                  <span>Variable Placeholders</span>
                </label>
              </>
            )}

            {viewMode === 'json' && (
              <span className="text-slate-500 dark:text-slate-400 text-xs font-mono">
                Schema v1.0.0 • {activeTemplates.length} {activeTemplates.length === 1 ? 'Workflow' : 'Workflows'} • {totalTasksCount} Steps
              </span>
            )}
          </div>
        </div>

        {/* Content Body: Preview & Stats */}
        <div className="flex-1 overflow-hidden flex flex-col p-6 space-y-4">
          {/* Metadata banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-wrap">
              {activeTemplates.length > 1 ? (
                <>
                  <span className="px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-lg font-bold flex items-center gap-1.5 border border-blue-200 dark:border-blue-900/60">
                    <FolderArchive className="w-3.5 h-3.5" />
                    <span>{activeTemplates.length} Workflows Selected</span>
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span>{totalTasksCount} Total Tasks</span>
                  </span>
                </>
              ) : (
                <>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-blue-500" />
                    <span>{totalTasksCount} Sequential Tasks</span>
                  </span>
                  <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-medium">
                    Workflow: <strong className="text-slate-900 dark:text-slate-100">{displayName}</strong>
                  </span>
                </>
              )}
              {viewMode === 'markdown' && (
                <span className="px-2 py-0.5 rounded-md text-[11px] font-mono bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Markdown + XML/Blockquote Delimiters
                </span>
              )}
            </div>

            {downloadSuccessMsg && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in duration-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{downloadSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* Code Block Preview */}
          <div className="flex-1 min-h-[300px] relative rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-900 text-slate-100 flex flex-col font-mono text-xs shadow-inner">
            {/* Terminal bar */}
            <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block"></span>
                </div>
                <span className="text-[11px] text-slate-400 ml-2">
                  {viewMode === 'markdown'
                    ? `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_tasks.md`
                    : `${displayName.toLowerCase().replace(/[^a-z0-9]/g, '_')}_config.json`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500">
                  {activeContent.length} characters • {activeContent.split('\n').length} lines
                </span>
              </div>
            </div>

            {/* Code Content */}
            <div className="flex-1 overflow-y-auto p-4 select-text leading-relaxed whitespace-pre-wrap font-mono text-slate-200 text-xs">
              {activeContent}
            </div>
          </div>
        </div>

        {/* Footer Actions: Download MD, Download JSON, Copy */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
            <span>
              {viewMode === 'markdown'
                ? 'Structured with Markdown headers, lightweight XML tags & blockquotes for universal AI ingestion.'
                : 'Validated JSON configuration ready for programmatic import or automated agent pipelines.'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap sm:flex-nowrap justify-end">
            {/* Copy Button */}
            <button
              id="copy-export-content-btn"
              onClick={handleCopy}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer ${
                copied
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 shadow-xs'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
              title="Copy active view content to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy {viewMode === 'markdown' ? 'Markdown' : 'JSON'}</span>
                </>
              )}
            </button>

            {/* Download MD Button */}
            <button
              id="modal-download-md-btn"
              onClick={handleDownloadMD}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition flex items-center gap-2 cursor-pointer"
              title="Download structured Markdown (.md) task specification"
            >
              <Download className="w-4 h-4" />
              <span>Download MD</span>
            </button>

            {/* Download JSON Button */}
            <button
              id="modal-download-json-btn"
              onClick={handleDownloadJSON}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition flex items-center gap-2 cursor-pointer"
              title="Download structured JSON (.json) workflow configuration"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
