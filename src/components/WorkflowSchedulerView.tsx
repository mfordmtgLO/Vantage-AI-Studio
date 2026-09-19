import React, { useState, useEffect } from 'react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Clock className="w-4 h-4" /> Autonomous Workflow Scheduler
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Automated Triggers & Cron Schedules</h2>
          <p className="text-sm text-slate-500 mt-1">
            Set recurring schedules (daily, weekly, hourly, or custom cron) for your saved workflow templates to enable fully autonomous Google Workspace task management.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Schedule Workflow
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium">{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">×</button>
        </div>
      )}

      {/* SCHEDULED JOBS LIST */}
      <div className="grid grid-cols-1 gap-4">
        {scheduledJobs.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs space-y-2">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <p>No recurring workflows scheduled yet. Click "Schedule Workflow" to automate your pipelines.</p>
          </div>
        ) : (
          scheduledJobs.map((job) => (
            <div key={job.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 transition hover:border-blue-200">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    job.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {job.status.toUpperCase()}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
                    Frequency: {job.frequency}
                  </span>
                  <span className="text-xs font-mono text-slate-400">Cron: {job.cronExpression}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{job.templateName}</h3>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>⏳ Next run: <strong className="text-slate-700">{job.nextRunTime}</strong></span>
                  {job.lastRunTime && (
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Last run: {job.lastRunTime} ({job.lastRunStatus})
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => triggerManualRun(job.id)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-xl transition cursor-pointer"
                  title="Run now"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Run Now
                </button>
                <button
                  onClick={() => toggleJobStatus(job.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-xl transition ${
                    job.status === 'active' ? 'bg-amber-50 hover:bg-amber-100 text-amber-700' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                  }`}
                >
                  {job.status === 'active' ? 'Pause' : 'Activate'}
                </button>
                <button
                  onClick={() => deleteJob(job.id)}
                  className="p-2 text-slate-400 hover:text-red-600 transition"
                  title="Delete schedule"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ADD SCHEDULE MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Schedule Workflow Trigger
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 text-sm font-bold">×</button>
            </div>
            <form onSubmit={addScheduledJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Workflow Template:</label>
                <select
                  value={selectedTemplateName}
                  onChange={(e) => setSelectedTemplateName(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="AI Market Research & Executive Brief">AI Market Research & Executive Brief</option>
                  <option value="Competitor URL Scraper & Calendar Review">Competitor URL Scraper & Calendar Review</option>
                  <option value="Weekly Lead Generation & Gmail Drafts">Weekly Lead Generation & Gmail Drafts</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Frequency:</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['hourly', 'daily', 'weekly', 'cron'] as const).map((freq) => (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setFrequency(freq)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                        frequency === freq ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {freq.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {frequency === 'cron' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Cron Expression:</label>
                  <input
                    type="text"
                    value={cronExpr}
                    onChange={(e) => setCronExpr(e.target.value)}
                    placeholder="0 9 * * 1-5"
                    className="w-full px-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
