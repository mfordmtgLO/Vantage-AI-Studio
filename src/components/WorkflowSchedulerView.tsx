/**
 * @license
 * Copyright 2026 Mike Ford <fordmj@gmail.com> - Vantage AI Studio
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GoogleAppsCronAutomationDeck } from './GoogleAppsCronAutomationDeck';
import { Calendar, Clock, Play, Plus, Trash2, CheckCircle2, AlertCircle, Sparkles, RefreshCw, Layers, Bell } from 'lucide-react';

interface ScheduledWorkflow {
  id: string;
  templateName: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'cron';
  cronExpression: string;
  nextRunTime: string;
  status: 'active' | 'paused';
  lastRunStatus?: 'success' | 'failed';
  lastRunTime?: string;
}

export const WorkflowSchedulerView: React.FC = () => {
  const [scheduledJobs, setScheduledJobs] = useState<ScheduledWorkflow[]>([
    {
      id: 'job_1',
      templateName: 'AI Market Research & Executive Brief',
      frequency: 'daily',
      cronExpression: '0 9 * * *',
      nextRunTime: 'Tomorrow at 09:00 AM',
      status: 'active',
      lastRunStatus: 'success',
      lastRunTime: 'Today at 09:00 AM'
    },
    {
      id: 'job_2',
      templateName: 'Competitor URL Scraper & Calendar Review',
      frequency: 'weekly',
      cronExpression: '0 8 * * 1',
      nextRunTime: 'Monday at 08:00 AM',
      status: 'active'
    }
  ]);

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedTemplateName, setSelectedTemplateName] = useState<string>('AI Market Research & Executive Brief');
  const [frequency, setFrequency] = useState<'hourly' | 'daily' | 'weekly' | 'cron'>('daily');
  const [cronExpr, setCronExpr] = useState<string>('0 9 * * *');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const addScheduledJob = (e: React.FormEvent) => {
    e.preventDefault();
    const newJob: ScheduledWorkflow = {
      id: 'job_' + Date.now(),
      templateName: selectedTemplateName,
      frequency,
      cronExpression: frequency === 'hourly' ? '0 * * * *' : frequency === 'daily' ? '0 9 * * *' : frequency === 'weekly' ? '0 9 * * 1' : (cronExpr || '*/15 * * * *'),
      nextRunTime: 'In ' + (frequency === 'hourly' ? '1 hour' : frequency === 'daily' ? '24 hours' : '7 days'),
      status: 'active'
    };

    setScheduledJobs([newJob, ...scheduledJobs]);
    setShowAddModal(false);
    setSuccessMsg('Successfully scheduled recurring workflow trigger!');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const toggleJobStatus = (id: string) => {
    setScheduledJobs(scheduledJobs.map(job => job.id === id ? { ...job, status: job.status === 'active' ? 'paused' : 'active' } : job));
  };

  const deleteJob = (id: string) => {
    setScheduledJobs(scheduledJobs.filter(job => job.id !== id));
  };

  const triggerManualRun = async (id: string) => {
    setSuccessMsg(`Triggering immediate test execution for scheduled job...`);
    setTimeout(() => {
      setScheduledJobs(scheduledJobs.map(job => job.id === id ? { ...job, lastRunStatus: 'success', lastRunTime: 'Just now' } : job));
      setSuccessMsg(`Autonomous workflow run completed successfully and synced with Google Workspace!`);
      setTimeout(() => setSuccessMsg(null), 4000);
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* 1. PRIMARY GOOGLE APPS AUTONOMOUS CRON AUTOMATION DECK */}
      <GoogleAppsCronAutomationDeck />

      {/* 2. CUSTOM MULTI-STEP WORKFLOW TEMPLATES SECTION */}
      <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Layers className="w-4 h-4" /> Multi-Step Pipeline Schedules
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Custom Multi-Step Studio Workflows</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Recurring schedules for saved compound pipelines built in the Logic Orchestrator Studio.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer dark:bg-indigo-600 dark:hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Schedule Custom Workflow
          </button>
        </div>

        {successMsg && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="text-xs font-medium">{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">×</button>
          </div>
        )}

        {/* SCHEDULED JOBS LIST */}
        <div className="grid grid-cols-1 gap-3">
          {scheduledJobs.map((job) => (
            <div key={job.id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-indigo-200">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5">
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{job.templateName}</h4>
                </div>
                
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Next Run: <strong>{job.nextRunTime}</strong></span>
                  <span className="flex items-center gap-1 font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">Cron: {job.cronExpression}</span>
                  {job.lastRunTime && (
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Last Run: {job.lastRunTime}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerManualRun(job.id)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 text-xs font-semibold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  title="Run now immediately"
                >
                  <Play className="w-3 h-3 fill-current" /> Run Now
                </button>
                <button
                  onClick={() => toggleJobStatus(job.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                    job.status === 'active'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  }`}
                >
                  {job.status === 'active' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                  title="Delete scheduled job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Schedule Workflow Trigger</h3>
            <form onSubmit={addScheduledJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Workflow</label>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  <option value="AI Market Research & Executive Brief">AI Market Research & Executive Brief</option>
                  <option value="Competitor URL Scraper & Calendar Review">Competitor URL Scraper & Calendar Review</option>
                  <option value="Lead Sentiment Analysis & Auto-Draft">Lead Sentiment Analysis & Auto-Draft</option>
                  <option value="Google Sheets DPA Grant Sync">Google Sheets DPA Grant Sync</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value as any)}
                  className="w-full text-xs p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                >
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily (Every Morning at 9:00 AM)</option>
                  <option value="weekly">Weekly (Monday Morning)</option>
                  <option value="cron">Custom Cron Expression</option>
                </select>
              </div>

              {frequency === 'cron' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cron Expression</label>
                  <input
                    type="text"
                    value={cronExpr}
                    onChange={(e) => setCronExpr(e.target.value)}
                    placeholder="0 9 * * *"
                    className="w-full text-xs p-2.5 font-mono bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Schedule Trigger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
