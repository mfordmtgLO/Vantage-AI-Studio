import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Sparkles, ArrowRight, Plus, Check, ChevronDown, ChevronUp, RefreshCw, Cpu, Globe, Database, FileText, Mail, Calendar, HelpCircle, Zap, ShieldCheck, X } from 'lucide-react';

export interface WorkflowStep {
  id: string;
  name: string;
  type: 'scrape_url' | 'ai_synthesize' | 'docs_create' | 'gmail_draft' | 'calendar_event';
  config: {
    url?: string;
    prompt?: string;
    recipient?: string;
    subject?: string;
    docTitle?: string;
    eventTitle?: string;
  };
}

export interface SmartRecommendation {
  id: string;
  stepType: WorkflowStep['type'];
  name: string;
  reason: string;
  badge: string;
  confidenceScore: number;
  insertPosition?: 'end' | number;
  config: WorkflowStep['config'];
}

interface SmartStepRecommendationsProps {
  workflowName: string;
  steps: WorkflowStep[];
  onAddStep: (step: Omit<WorkflowStep, 'id'>, insertAtIndex?: number) => void;
}

export const SmartStepRecommendations: React.FC<SmartStepRecommendationsProps> = ({
  workflowName,
  steps,
  onAddStep
}) => {
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [aiRecommendations, setAiRecommendations] = useState<SmartRecommendation[] | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [expandedPreviewId, setExpandedPreviewId] = useState<string | null>(null);
  const [userGoalInput, setUserGoalInput] = useState<string>('');
  const [showGoalInput, setShowGoalInput] = useState<boolean>(false);
  const [addedStepNotice, setAddedStepNotice] = useState<string | null>(null);

  // Generate instant deterministic recommendations based on current sequence analysis
  const heuristicRecommendations = useMemo<SmartRecommendation[]>(() => {
    const list: SmartRecommendation[] = [];
    const stepCount = steps.length;
    const lastStep = stepCount > 0 ? steps[stepCount - 1] : null;
    const hasScrape = steps.some(s => s.type === 'scrape_url');
    const hasAi = steps.some(s => s.type === 'ai_synthesize');
    const hasDocs = steps.some(s => s.type === 'docs_create');
    const hasGmail = steps.some(s => s.type === 'gmail_draft');
    const hasCalendar = steps.some(s => s.type === 'calendar_event');

    // Case 0: Empty sequence
    if (!lastStep) {
      list.push({
        id: 'rec_init_scrape',
        stepType: 'scrape_url',
        name: 'Scrape Web Source or Knowledge Base',
        reason: 'Initiate the pipeline by extracting live web intelligence, news, or competitor product metrics.',
        badge: 'Pipeline Starter',
        confidenceScore: 95,
        config: {
          url: 'https://news.ycombinator.com/'
        }
      });
      list.push({
        id: 'rec_init_ai',
        stepType: 'ai_synthesize',
        name: 'Gemini DeepThink & Strategy Synthesizer',
        reason: 'Start with high-order reasoning to generate research outlines or strategic analyses.',
        badge: 'Prompt Engine',
        confidenceScore: 90,
        config: {
          prompt: `Analyze strategic opportunities and key trends for ${workflowName || 'our project'}.`
        }
      });
      return list;
    }

    // Case 1: Sequence ends with Web Scraping
    if (lastStep.type === 'scrape_url') {
      list.push({
        id: 'rec_scrape_to_ai',
        stepType: 'ai_synthesize',
        name: 'Gemini AI Synthesis & Extraction',
        reason: `Scraped web data contains raw unstructured text. Feeding it to Gemini DeepThink distills key data points, takeaways, and metrics.`,
        badge: 'Recommended Next',
        confidenceScore: 98,
        config: {
          prompt: `Synthesize the extracted webpage content into top 3 strategic insights and actionable action items.`
        }
      });
      list.push({
        id: 'rec_scrape_to_docs',
        stepType: 'docs_create',
        name: 'Archive Raw Scrape into Google Docs',
        reason: 'Create a permanent archive of the harvested web page content in Google Drive for compliance or team review.',
        badge: 'Data Archival',
        confidenceScore: 84,
        config: {
          docTitle: `${workflowName || 'Web Scrape'} - Harvested Data Archive`
        }
      });
    }

    // Case 2: Sequence ends with AI Synthesis
    else if (lastStep.type === 'ai_synthesize') {
      if (!hasDocs) {
        list.push({
          id: 'rec_ai_to_docs',
          stepType: 'docs_create',
          name: 'Generate Executive Brief in Google Docs',
          reason: 'Synthesized insights need a durable home. Generating a formatted Google Doc creates a shareable team asset.',
          badge: 'Best Practice',
          confidenceScore: 97,
          config: {
            docTitle: `${workflowName || 'Executive Summary'} - AI Brief`
          }
        });
      }
      if (!hasGmail) {
        list.push({
          id: 'rec_ai_to_gmail',
          stepType: 'gmail_draft',
          name: 'Draft Stakeholder Update in Gmail',
          reason: 'Deliver the AI synthesized findings directly to leadership or clients as a ready-to-send draft.',
          badge: 'Output Delivery',
          confidenceScore: 93,
          config: {
            recipient: 'team@company.com',
            subject: `Briefing: ${workflowName || 'Strategic AI Findings'}`
          }
        });
      }
      if (!hasCalendar) {
        list.push({
          id: 'rec_ai_to_calendar',
          stepType: 'calendar_event',
          name: 'Schedule Findings Strategy Sync',
          reason: 'Book a 30-minute block on Google Calendar to review the synthesized recommendations with key stakeholders.',
          badge: 'Action Item',
          confidenceScore: 88,
          config: {
            eventTitle: `Strategy Review: ${workflowName || 'Workflow Analysis'}`
          }
        });
      }
    }

    // Case 3: Sequence ends with Google Docs Creation
    else if (lastStep.type === 'docs_create') {
      if (!hasGmail) {
        list.push({
          id: 'rec_docs_to_gmail',
          stepType: 'gmail_draft',
          name: 'Draft Email Announcing New Document',
          reason: 'Notify your collaborators via Gmail that the Google Doc is created, providing summary highlights in the message body.',
          badge: 'Recommended Next',
          confidenceScore: 96,
          config: {
            recipient: 'stakeholders@company.com',
            subject: `New Document Published: ${lastStep.config.docTitle || workflowName || 'Executive Briefing'}`
          }
        });
      }
      if (!hasCalendar) {
        list.push({
          id: 'rec_docs_to_calendar',
          stepType: 'calendar_event',
          name: 'Schedule Document Review Session',
          reason: 'Ensure the created document is reviewed by setting a calendar milestone with team leads.',
          badge: 'Milestone Sync',
          confidenceScore: 90,
          config: {
            eventTitle: `Document Review: ${lastStep.config.docTitle || 'Workflow Artifact'}`
          }
        });
      }
      // Or deeper audit
      list.push({
        id: 'rec_docs_to_ai_critique',
        stepType: 'ai_synthesize',
        name: 'Gemini Executive Quality & Policy Audit',
        reason: 'Perform a secondary evaluation on the documented output to ensure clarity, compliance, and actionable KPIs.',
        badge: 'Quality Gate',
        confidenceScore: 82,
        config: {
          prompt: 'Audit the generated document content for clarity, risk factors, and missing tactical steps.'
        }
      });
    }

    // Case 4: Sequence ends with Gmail Draft
    else if (lastStep.type === 'gmail_draft') {
      if (!hasCalendar) {
        list.push({
          id: 'rec_gmail_to_calendar',
          stepType: 'calendar_event',
          name: 'Schedule Email Response Follow-Up',
          reason: 'Block a calendar reminder 48 hours out to follow up on unread replies or feedback on the drafted message.',
          badge: 'Workflow Closer',
          confidenceScore: 95,
          config: {
            eventTitle: `Follow-up: ${lastStep.config.subject || 'Outbound Briefing'}`
          }
        });
      }
      if (!hasDocs) {
        list.push({
          id: 'rec_gmail_to_docs',
          stepType: 'docs_create',
          name: 'Log Communication Record in Docs',
          reason: 'Preserve an auditable transcript of communications and recipient directives in Google Docs.',
          badge: 'Compliance Record',
          confidenceScore: 85,
          config: {
            docTitle: `Communication Log: ${lastStep.config.subject || workflowName}`
          }
        });
      }
    }

    // Case 5: Sequence ends with Calendar Event
    else if (lastStep.type === 'calendar_event') {
      if (!hasDocs) {
        list.push({
          id: 'rec_cal_to_docs',
          stepType: 'docs_create',
          name: 'Generate Meeting Agenda & Objectives Doc',
          reason: 'Attach an organized meeting agenda and list of objectives in Google Docs to prepare attendees.',
          badge: 'Best Practice',
          confidenceScore: 96,
          config: {
            docTitle: `Meeting Agenda: ${lastStep.config.eventTitle || 'Strategic Sync'}`
          }
        });
      }
      if (!hasGmail) {
        list.push({
          id: 'rec_cal_to_gmail',
          stepType: 'gmail_draft',
          name: 'Draft Pre-Meeting Briefing Email',
          reason: 'Send a calendar companion email with context and pre-reading links so meetings start with full alignment.',
          badge: 'High Affinity',
          confidenceScore: 91,
          config: {
            recipient: 'attendees@company.com',
            subject: `Pre-Meeting Context: ${lastStep.config.eventTitle || 'Upcoming Meeting'}`
          }
        });
      }
    }

    // Structural gap check: If scrape exists and Docs exists, but NO AI in between
    if (hasScrape && hasDocs && !hasAi) {
      list.unshift({
        id: 'rec_gap_ai_transform',
        stepType: 'ai_synthesize',
        name: 'Insert Gemini AI Transformation Layer',
        reason: 'Detected raw web scrape feeding directly into Google Docs without AI synthesis. Inserting Gemini cleans, summarizes, and structures the text.',
        badge: 'Sequence Optimization',
        confidenceScore: 99,
        config: {
          prompt: 'Format, summarize, and extract core findings from the scraped web text.'
        }
      });
    }

    return list;
  }, [steps, workflowName]);

  // Combined recommendations: AI deep recommendations override or supplement heuristic
  const displayRecommendations = useMemo(() => {
    const rawList = aiRecommendations && aiRecommendations.length > 0
      ? aiRecommendations
      : heuristicRecommendations;

    return rawList.filter(r => !dismissedIds.has(r.id));
  }, [aiRecommendations, heuristicRecommendations, dismissedIds]);

  // Request Deep AI Analysis from Gemini
  const handleFetchAiRecommendations = useCallback(async () => {
    setIsAiLoading(true);
    setAiAnalysis(null);
    try {
      const resp = await fetch('/api/workflow/recommend-next-step', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowName,
          steps,
          userIntent: userGoalInput.trim() || undefined
        })
      });

      if (!resp.ok) {
        throw new Error('AI recommendation failed');
      }

      const data = await resp.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
      if (Array.isArray(data.recommendations) && data.recommendations.length > 0) {
        const formatted: SmartRecommendation[] = data.recommendations.map((item: any, idx: number) => ({
          id: item.id || `gemini_rec_${Date.now()}_${idx}`,
          stepType: item.stepType || 'ai_synthesize',
          name: item.title || 'AI Recommended Step',
          reason: item.reason || 'Logical progression based on prior workflow step outputs.',
          badge: item.badge || 'Gemini AI Choice',
          confidenceScore: item.confidenceScore || 95,
          config: item.config || {}
        }));
        setAiRecommendations(formatted);
      }
    } catch (err) {
      console.warn('AI recommendation fetch error, falling back to heuristics:', err);
      // Fallback message
      setAiAnalysis('Gemini analyzed sequence: recommended actions prioritized based on standard Workspace orchestration patterns.');
    } finally {
      setIsAiLoading(false);
    }
  }, [workflowName, steps, userGoalInput]);

  const handleApplyRecommendation = (rec: SmartRecommendation) => {
    onAddStep({
      name: rec.name,
      type: rec.stepType,
      config: rec.config
    });

    setDismissedIds(prev => new Set([...prev, rec.id]));
    setAddedStepNotice(`Added "${rec.name}" to your workflow!`);
    setTimeout(() => setAddedStepNotice(null), 3500);
  };

  const handleDismiss = (id: string) => {
    setDismissedIds(prev => new Set([...prev, id]));
  };

  const getStepIcon = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'scrape_url':
        return <Globe className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'ai_synthesize':
        return <Database className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'docs_create':
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'gmail_draft':
        return <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'calendar_event':
        return <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      default:
        return <Zap className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStepTypeLabel = (type: WorkflowStep['type']) => {
    switch (type) {
      case 'scrape_url': return 'Web Scraper';
      case 'ai_synthesize': return 'Gemini DeepThink';
      case 'docs_create': return 'Google Docs';
      case 'gmail_draft': return 'Gmail Draft';
      case 'calendar_event': return 'Google Calendar';
    }
  };

  return (
    <div
      id="smart-recommendation-engine-container"
      className="mt-6 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-blue-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4"
    >
      {/* Engine Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Smart Recommendation Engine
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                Context Aware
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {steps.length === 0
                ? 'Suggesting optimal pipeline starting actions.'
                : `Analyzing action sequence (${steps.length} steps) to recommend logical follow-ups.`}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            id="toggle-goal-input-btn"
            type="button"
            onClick={() => setShowGoalInput(!showGoalInput)}
            className="text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer flex items-center gap-1"
            title="Provide custom goal to guide AI recommendations"
          >
            <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>{showGoalInput ? 'Hide Goal' : 'Custom Goal'}</span>
          </button>

          <button
            id="ask-gemini-recommendations-btn"
            type="button"
            disabled={isAiLoading}
            onClick={handleFetchAiRecommendations}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? 'animate-spin' : ''}`} />
            <span>{isAiLoading ? 'Analyzing...' : 'Gemini Deep Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Optional Custom Goal Input */}
      {showGoalInput && (
        <div className="p-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 animate-in fade-in duration-150">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Tell the recommendation engine what you want this workflow to achieve:
          </label>
          <div className="flex items-center gap-2">
            <input
              id="recommendation-goal-input"
              type="text"
              placeholder="e.g., Gather competitor pricing, build an investor slide outline, and email findings"
              value={userGoalInput}
              onChange={(e) => setUserGoalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleFetchAiRecommendations();
              }}
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              id="submit-recommendation-goal-btn"
              type="button"
              onClick={handleFetchAiRecommendations}
              disabled={isAiLoading}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
            >
              Analyze Goal
            </button>
          </div>
        </div>
      )}

      {/* Added Step Toast/Notice */}
      {addedStepNotice && (
        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
          <span className="flex items-center gap-1.5 font-medium">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {addedStepNotice}
          </span>
          <button
            onClick={() => setAddedStepNotice(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-200 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* AI Analytical Assessment Banner */}
      {aiAnalysis && (
        <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 rounded-xl text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold">Gemini Sequence Assessment:</span>
            <p className="text-[11px] text-purple-800 dark:text-purple-300 leading-relaxed">
              {aiAnalysis}
            </p>
          </div>
        </div>
      )}

      {/* Sequence Trail Flow Summary */}
      {steps.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 dark:text-slate-400 py-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Sequence Chain:</span>
          {steps.map((step, idx) => (
            <React.Fragment key={step.id}>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md font-mono text-[10px] text-slate-700 dark:text-slate-200">
                {idx + 1}. {step.name}
              </span>
              <ArrowRight className="w-3 h-3 text-slate-400" />
            </React.Fragment>
          ))}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-950/60 border border-dashed border-blue-300 dark:border-blue-700 rounded-md font-semibold text-[10px] text-blue-700 dark:text-blue-300 animate-pulse">
            <Sparkles className="w-2.5 h-2.5" /> Next Recommended Action
          </span>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayRecommendations.length === 0 ? (
          <div className="col-span-full p-6 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <Check className="w-6 h-6 text-emerald-500 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              All recommended steps have been reviewed or applied!
            </p>
            <button
              onClick={() => setDismissedIds(new Set())}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
            >
              Reset dismissed recommendations
            </button>
          </div>
        ) : (
          displayRecommendations.map((rec) => {
            const isPreviewExpanded = expandedPreviewId === rec.id;
            return (
              <div
                key={rec.id}
                id={`recommendation-card-${rec.id}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all p-4 flex flex-col justify-between space-y-3 shadow-xs hover:shadow-md relative group"
              >
                {/* Card Top: Type & Badges */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        {getStepIcon(rec.stepType)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        {getStepTypeLabel(rec.stepType)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80 rounded-full">
                        {rec.confidenceScore}% Match
                      </span>
                      <button
                        onClick={() => handleDismiss(rec.id)}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded transition cursor-pointer"
                        title="Dismiss recommendation"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Badge */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {rec.name}
                    </h4>
                    <span className="inline-block mt-0.5 text-[9px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 px-1.5 py-0.5 rounded">
                      {rec.badge}
                    </span>
                  </div>

                  {/* Rationale / Why it follows */}
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    {rec.reason}
                  </p>
                </div>

                {/* Pre-filled Config Preview Dropdown */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setExpandedPreviewId(isPreviewExpanded ? null : rec.id)}
                    className="w-full flex items-center justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <span>Config Parameters</span>
                    {isPreviewExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </button>

                  {isPreviewExpanded && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-[10px] space-y-1 font-mono text-slate-700 dark:text-slate-300">
                      {rec.config.url && <div><strong className="text-slate-900 dark:text-slate-100">URL:</strong> {rec.config.url}</div>}
                      {rec.config.prompt && <div><strong className="text-slate-900 dark:text-slate-100">Prompt:</strong> {rec.config.prompt}</div>}
                      {rec.config.docTitle && <div><strong className="text-slate-900 dark:text-slate-100">Doc Title:</strong> {rec.config.docTitle}</div>}
                      {rec.config.recipient && <div><strong className="text-slate-900 dark:text-slate-100">Recipient:</strong> {rec.config.recipient}</div>}
                      {rec.config.subject && <div><strong className="text-slate-900 dark:text-slate-100">Subject:</strong> {rec.config.subject}</div>}
                      {rec.config.eventTitle && <div><strong className="text-slate-900 dark:text-slate-100">Event Title:</strong> {rec.config.eventTitle}</div>}
                    </div>
                  )}

                  {/* Add Button */}
                  <button
                    id={`add-recommendation-btn-${rec.id}`}
                    type="button"
                    onClick={() => handleApplyRecommendation(rec)}
                    className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Add to Workflow</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
