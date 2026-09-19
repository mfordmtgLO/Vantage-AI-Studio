import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Eye, 
  X, 
  Bookmark, 
  MessageSquare, 
  Sparkles, 
  Globe, 
  Mail, 
  Calendar, 
  FileText, 
  ArrowDown, 
  Layers, 
  CheckCircle2 
} from 'lucide-react';
import { WorkflowTemplate, WorkflowStep, ServiceNodeInfo } from './LogicOrchestratorView';

export interface TemplateQuickPeekPopoverProps {
  template: WorkflowTemplate;
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: WorkflowTemplate) => void;
  getServiceNodeInfo: (type: WorkflowStep['type']) => ServiceNodeInfo;
  getServiceHandoffLabel: (currentType: WorkflowStep['type'], nextType?: WorkflowStep['type']) => string;
}

export const TemplateQuickPeekPopover: React.FC<TemplateQuickPeekPopoverProps> = ({
  template,
  isOpen,
  onClose,
  onLoadTemplate,
  getServiceNodeInfo,
  getServiceHandoffLabel
}) => {
  if (!isOpen) return null;

  const firstThreeSteps = template.steps.slice(0, 3);
  const totalSteps = template.steps.length;
  const remainingStepsCount = Math.max(0, totalSteps - 3);

  return (
    <AnimatePresence>
      <motion.div
        id={`quick-peek-popover-${template.id}`}
        initial={{ opacity: 0, scale: 0.96, y: -4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -4 }}
        transition={{ duration: 0.16, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-x-2 top-2 bottom-2 z-40 bg-white/98 dark:bg-slate-900/98 backdrop-blur-xl rounded-2xl border-2 border-blue-500/50 dark:border-blue-500/60 shadow-2xl shadow-blue-950/20 dark:shadow-blue-950/50 p-4.5 flex flex-col justify-between overflow-hidden"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
              <Eye className="w-3.5 h-3.5" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">Quick Peek: Sequence</h5>
                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  {totalSteps <= 3 ? `${totalSteps} Steps` : `Steps 1–3 of ${totalSteps}`}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[220px]">
                {template.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close Quick Peek"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps List (First 3 Steps) */}
        <div className="my-2.5 space-y-2.5 overflow-y-auto pr-1 flex-1">
          {firstThreeSteps.map((step, idx) => {
            const serviceInfo = getServiceNodeInfo(step.type);
            const isLastOfThree = idx === firstThreeSteps.length - 1;
            const nextStep = firstThreeSteps[idx + 1];

            return (
              <div key={step.id || idx} className="relative">
                <div className="flex items-start gap-2.5">
                  {/* Step Number Circle */}
                  <div className="flex flex-col items-center">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                      idx === 0 
                        ? 'bg-blue-600 text-white shadow-xs' 
                        : idx === 1 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-purple-600 text-white shadow-xs'
                    }`}>
                      {idx + 1}
                    </span>
                    {!isLastOfThree && (
                      <div className="w-0.5 h-full min-h-[16px] bg-slate-200 dark:bg-slate-700/80 my-1 rounded-full" />
                    )}
                  </div>

                  {/* Step Content Card */}
                  <div className="flex-1 bg-slate-50/90 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200/70 dark:border-slate-700/70 space-y-1.5">
                    {/* Step Title & Service Badge */}
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span className="truncate max-w-[180px]">{step.name}</span>
                      </span>
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-semibold border flex items-center gap-1 ${serviceInfo.badgeBg} ${serviceInfo.textColor} ${serviceInfo.badgeBorder}`}>
                        {serviceInfo.icon('w-2.5 h-2.5')}
                        <span>{serviceInfo.badgeLabel}</span>
                      </span>
                    </div>

                    {/* Step Configuration Parameter Summary */}
                    {step.type === 'scrape_url' && step.config.url && (
                      <div className="flex items-center gap-1 text-[11px] text-sky-700 dark:text-sky-300 font-mono bg-sky-50 dark:bg-sky-950/50 px-2 py-1 rounded-lg border border-sky-100 dark:border-sky-900/50 truncate">
                        <Globe className="w-3 h-3 text-sky-500 shrink-0" />
                        <span className="truncate">{step.config.url}</span>
                      </div>
                    )}

                    {step.type === 'ai_synthesize' && step.config.prompt && (
                      <div className="text-[11px] text-purple-800 dark:text-purple-200 italic bg-purple-50 dark:bg-purple-950/50 px-2 py-1 rounded-lg border border-purple-100 dark:border-purple-900/50 line-clamp-2">
                        <span className="font-semibold text-purple-600 dark:text-purple-400 not-italic mr-1">Prompt:</span>
                        &ldquo;{step.config.prompt}&rdquo;
                      </div>
                    )}

                    {step.type === 'gmail_draft' && (
                      <div className="text-[11px] text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900/50 truncate space-y-0.5">
                        <div className="truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-emerald-500 shrink-0" />
                          <span className="text-slate-500 dark:text-slate-400">To:</span>
                          <span className="font-semibold">{step.config.recipient || 'Recipient'}</span>
                        </div>
                        {step.config.subject && (
                          <div className="truncate text-[10px] text-slate-600 dark:text-slate-400 pl-4">
                            Subject: &ldquo;{step.config.subject}&rdquo;
                          </div>
                        )}
                      </div>
                    )}

                    {step.type === 'docs_create' && step.config.docTitle && (
                      <div className="flex items-center gap-1 text-[11px] text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-900/50 truncate">
                        <FileText className="w-3 h-3 text-amber-500 shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400">Doc:</span>
                        <span className="font-semibold truncate">{step.config.docTitle}</span>
                      </div>
                    )}

                    {step.type === 'calendar_event' && step.config.eventTitle && (
                      <div className="flex items-center gap-1 text-[11px] text-indigo-800 dark:text-indigo-200 bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 rounded-lg border border-indigo-100 dark:border-indigo-900/50 truncate">
                        <Calendar className="w-3 h-3 text-indigo-500 shrink-0" />
                        <span className="text-slate-500 dark:text-slate-400">Event:</span>
                        <span className="font-semibold truncate">{step.config.eventTitle}</span>
                      </div>
                    )}

                    {/* Step Comments Indicator if available */}
                    {step.comments && step.comments.length > 0 && (
                      <div className="flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-400 pt-0.5">
                        <MessageSquare className="w-2.5 h-2.5" />
                        <span>{step.comments.length} team note{step.comments.length > 1 ? 's' : ''}:</span>
                        <span className="italic truncate max-w-[160px] text-slate-500 dark:text-slate-400">
                          &ldquo;{step.comments[0].text}&rdquo;
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Handoff transition hint */}
                {!isLastOfThree && nextStep && (
                  <div className="ml-7 my-0.5 text-[9px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 opacity-80">
                    <ArrowDown className="w-2.5 h-2.5" />
                    <span>{getServiceHandoffLabel(step.type, nextStep.type)}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer & Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 shrink-0 space-y-2">
          {remainingStepsCount > 0 ? (
            <div className="flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400 px-1">
              <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>+{remainingStepsCount} more step{remainingStepsCount > 1 ? 's' : ''} in sequence</span>
              </span>
              <div className="flex items-center gap-1">
                {template.steps.slice(3).map((remStep, remIdx) => {
                  const sInfo = getServiceNodeInfo(remStep.type);
                  return (
                    <span 
                      key={remIdx} 
                      className={`p-1 rounded-md border text-[9px] ${sInfo.badgeBg} ${sInfo.textColor} ${sInfo.badgeBorder}`}
                      title={`${remIdx + 4}. ${remStep.name} (${sInfo.serviceName})`}
                    >
                      {sInfo.icon('w-2.5 h-2.5')}
                    </span>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 font-medium py-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>Complete sequence ({totalSteps} steps total)</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              id={`quick-peek-load-btn-${template.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onLoadTemplate(template);
              }}
              className="flex-1 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Load into Studio</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="py-1.5 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
