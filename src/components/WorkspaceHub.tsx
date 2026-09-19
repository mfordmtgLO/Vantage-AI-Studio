import React, { useState, useEffect } from 'react';
import { WorkspaceTab, GmailMessage, CalendarEvent, DriveFile, GoogleTask, GoogleContact, CopilotResponse, SuggestedAction } from '../types';
import { getAccessToken } from '../services/firebase';
import { ActionConfirmationModal } from './ActionConfirmationModal';
import { SecondBrainView } from './SecondBrainView';
import { GmailDraftsView } from './GmailDraftsView';
import { LogicOrchestratorView } from './LogicOrchestratorView';
import { WorkflowSchedulerView } from './WorkflowSchedulerView';
import { DriveExplorerView } from './DriveExplorerView';
import { VoiceMacroManagerView } from './VoiceMacroManagerView';
import { AppAIPromptAndTemplateManager } from './AppAIPromptAndTemplateManager';
import { LeadDatabaseCleanupTool } from './LeadDatabaseCleanupTool';
import { PushNotificationManager } from './PushNotificationManager';
import { LiveTwoWayNotesModal } from './LiveTwoWayNotesModal';
import { Bot, Mail, Calendar, FileText, Table, CheckSquare, Users, Send, Plus, RefreshCw, Sparkles, CheckCircle2, AlertCircle, Bell, MessageSquare } from 'lucide-react';


import { ShareableWorkflowData } from './ShareWorkflowModal';

interface WorkspaceHubProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  initialWorkflowName?: string | null;
  revertedWorkflowName?: string | null;
  onClearRevert?: () => void;
  onExecuteVoiceWorkflow?: (name: string) => void;
  importedWorkflow?: ShareableWorkflowData | null;
  onClearImport?: () => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({
  activeTab,
  setActiveTab,
  initialWorkflowName,
  revertedWorkflowName,
  onClearRevert,
  onExecuteVoiceWorkflow,
  importedWorkflow,
  onClearImport,
}) => {
  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Prompt Studio state
  const [prompt, setPrompt] = useState<string>('');
  const [enableDeepThink, setEnableDeepThink] = useState<boolean>(true);
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [copilotResult, setCopilotResult] = useState<CopilotResponse | null>(null);
  const [isPrompting, setIsPrompting] = useState<boolean>(false);

  // Action confirmation state
  const [pendingAction, setPendingAction] = useState<SuggestedAction | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState<boolean>(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Quick form states for individual tabs
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const [eventSummary, setEventSummary] = useState('');
  const [eventStart, setEventStart] = useState('');
  const [eventEnd, setEventEnd] = useState('');

  const [docTitle, setDocTitle] = useState('');
  const [docContent, setDocContent] = useState('');

  const [taskTitle, setTaskTitle] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [showPushModal, setShowPushModal] = useState<boolean>(false);
  const [showNotesModal, setShowNotesModal] = useState<boolean>(false);
  const [notifyOnPush, setNotifyOnPush] = useState<boolean>(true);

  const triggerPushAlert = (title: string, body: string) => {
    if (notifyOnPush && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.ready.then(reg => {
          reg.showNotification(title, {
            body,
            icon: '/assets/icon-192.png',
            badge: '/assets/icon-192.png'
          });
        });
      } else {
        new Notification(title, { body, icon: '/assets/icon-192.png' });
      }
    }
  };

  const fetchWorkspaceData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) {
        throw new Error('No access token available. Please sign in again.');
      }

      // Fetch Gmail messages
      const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=10', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (gmailRes.ok) {
        const gmailData = await gmailRes.json();
        if (gmailData.messages) {
          const detailedMessages = await Promise.all(
            gmailData.messages.slice(0, 5).map(async (m: any) => {
              const msgRes = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${m.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              const msgData = await msgRes.json();
              const headers = msgData.payload?.headers || {};
              const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
              const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown Sender';
              const date = headers.find((h: any) => h.name === 'Date')?.value || '';
              return { id: m.id, threadId: m.threadId, snippet: msgData.snippet, subject, from, date };
            })
          );
          setMessages(detailedMessages);
        }
      }

      // Fetch Calendar events
      const calRes = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&singleEvents=true&orderBy=startTime', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (calRes.ok) {
        const calData = await calRes.json();
        setEvents(calData.items || []);
      }

      // Fetch Drive files
      const driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType,webViewLink,modifiedTime)', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (driveRes.ok) {
        const driveData = await driveRes.json();
        setFiles(driveData.files || []);
      }

      // Fetch Google Tasks
      const taskListsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (taskListsRes.ok) {
        const taskListsData = await taskListsRes.json();
        if (taskListsData.items && taskListsData.items.length > 0) {
          const listId = taskListsData.items[0].id;
          const tasksRes = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tasksRes.ok) {
            const tasksData = await tasksRes.json();
            setTasks(tasksData.items || []);
          }
        }
      }

      // Fetch Contacts
      const contactsRes = await fetch('https://people.googleapis.com/v1/people/me/connections?personFields=names,emailAddresses,phoneNumbers', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (contactsRes.ok) {
        const contactsData = await contactsRes.json();
        const formattedContacts = (contactsData.connections || []).map((c: any) => ({
          resourceName: c.resourceName,
          name: c.names?.[0]?.displayName || 'Unnamed',
          email: c.emailAddresses?.[0]?.value || 'No email',
          phone: c.phoneNumbers?.[0]?.value || 'No phone',
        }));
        setContacts(formattedContacts);
      }

    } catch (err: any) {
      console.error('Error fetching workspace data:', err);
      setError(err.message || 'Failed to fetch workspace data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const handleRunCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsPrompting(true);
    setCopilotResult(null);
    setError(null);
    setActionSuccessMsg(null);

    try {
      const contextData = {
        messages: messages.slice(0, 5),
        events: events.slice(0, 5),
        files: files.slice(0, 5),
        tasks: tasks.slice(0, 5),
        contacts: contacts.slice(0, 5)
      };

      const res = await fetch('/api/gemini/workspace-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, workspaceContext: contextData, activeTab, enableDeepThink, enableSearch }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to process Gemini prompt');
      }

      const data = await res.json();
      setCopilotResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsPrompting(false);
    }
  };

  // Execution of Workspace Mutating Actions with mandatory user confirmation
  const executeWorkspaceAction = async (action: SuggestedAction) => {
    setIsExecutingAction(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error('Not authenticated');

      if (action.type === 'gmail_send') {
        const { to, subject, body } = action.payload;
        const rawMessage = [
          `To: ${to}`,
          `Subject: ${subject}`,
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          body,
        ].join('\n');
        const encodedMessage = btoa(unescape(encodeURIComponent(rawMessage)))
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '');

        const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ raw: encodedMessage }),
        });
        if (!res.ok) throw new Error('Failed to send email via Gmail API');
        setActionSuccessMsg('Email successfully sent via Gmail!');
        triggerPushAlert('Gmail Email Sent', `Successfully sent email to ${to}`);
      } else if (action.type === 'calendar_create') {
        const { summary, startDateTime, endDateTime, description } = action.payload;
        const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            summary,
            description,
            start: { dateTime: startDateTime || new Date().toISOString() },
            end: { dateTime: endDateTime || new Date(Date.now() + 3600000).toISOString() },
          }),
        });
        if (!res.ok) throw new Error('Failed to create calendar event');
        setActionSuccessMsg('Calendar event successfully created!');
        triggerPushAlert('Calendar Event Created', `Event "${summary}" successfully scheduled.`);
      } else if (action.type === 'tasks_create') {
        const { title, notes } = action.payload;
        // get default task list
        const listsRes = await fetch('https://tasks.googleapis.com/tasks/v1/users/@me/lists', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const listsData = await listsRes.json();
        const listId = listsData.items?.[0]?.id || '@default';

        const res = await fetch(`https://tasks.googleapis.com/tasks/v1/lists/${listId}/tasks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, notes }),
        });
        if (!res.ok) throw new Error('Failed to create Google Task');
        setActionSuccessMsg('Task successfully created in Google Tasks!');
        triggerPushAlert('Google Task Created', `Task "${title}" added to your list.`);
      } else if (action.type === 'docs_create') {
        const { title } = action.payload;
        const res = await fetch('https://docs.googleapis.com/v1/documents', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title }),
        });
        if (!res.ok) throw new Error('Failed to create Google Doc');
        setActionSuccessMsg('Google Doc successfully created!');
        triggerPushAlert('Google Doc Created', `Document "${title}" generated successfully.`);
      }

      setPendingAction(null);
      fetchWorkspaceData();
    } catch (err: any) {
      setError(err.message || 'Failed to execute action');
    } finally {
      setIsExecutingAction(false);
    }
  };

  // Manual actions
  const handleSendManualEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailTo || !emailSubject) return;
    setPendingAction({
      id: 'manual_email',
      type: 'gmail_send',
      title: `Send Email to ${emailTo}`,
      description: `Draft and send an email with subject "${emailSubject}"`,
      payload: { to: emailTo, subject: emailSubject, body: emailBody },
    });
  };

  const handleCreateManualEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventSummary) return;
    setPendingAction({
      id: 'manual_event',
      type: 'calendar_create',
      title: `Create Event: ${eventSummary}`,
      description: `Schedule a calendar event`,
      payload: { summary: eventSummary, startDateTime: eventStart || new Date().toISOString(), endDateTime: eventEnd || new Date(Date.now() + 3600000).toISOString() },
    });
  };

  const handleCreateManualTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) return;
    setPendingAction({
      id: 'manual_task',
      type: 'tasks_create',
      title: `Create Task: ${taskTitle}`,
      description: `Add a new task to Google Tasks`,
      payload: { title: taskTitle, notes: taskNotes },
    });
  };

  const handleLoadAppTemplateToStudio = (template: any) => {
    try {
      const existing = localStorage.getItem('vantage_workflow_templates');
      let parsed = existing ? JSON.parse(existing) : [];
      if (!parsed.some((p: any) => p.id === template.id)) {
        parsed = [template, ...parsed];
        localStorage.setItem('vantage_workflow_templates', JSON.stringify(parsed));
      }
    } catch (e) {}
    setActiveTab('orchestrator');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 text-red-800 dark:text-red-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <span className="text-xs font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold text-sm">×</button>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-xs font-medium">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 font-bold text-sm">×</button>
        </div>
      )}

      {/* PROMPT STUDIO TAB */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Workspace Prompt Studio</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Prompt engineer tasks and actions across your connected Google Workspace</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition cursor-pointer border border-emerald-200 dark:border-emerald-900/60"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Live Visitor Notes & SMS
                </button>
                <button
                  onClick={() => setShowPushModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition cursor-pointer border border-blue-200 dark:border-blue-900/60"
                >
                  <Bell className="w-3.5 h-3.5" />
                  iPhone Push Alerts
                </button>
                <button
                  onClick={fetchWorkspaceData}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Sync Workspace Data
                </button>
              </div>
            </div>

            <form onSubmit={handleRunCopilot} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableDeepThink}
                      onChange={(e) => setEnableDeepThink(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Vantage DeepThink Mode
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableSearch}
                      onChange={(e) => setEnableSearch(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                      Google Search Grounding
                    </span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">Hybrid Gemini + Deepseek</span>
              </div>
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Analyze my recent emails and calendar, summarize action items, and draft follow-up tasks or emails...'"
                  rows={3}
                  className="w-full p-4 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  Context synced: {messages.length} emails, {events.length} events, {files.length} files, {tasks.length} tasks
                </div>
                <button
                  type="submit"
                  disabled={isPrompting || !prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isPrompting ? 'animate-spin' : ''}`} />
                  {isPrompting ? 'Prompt Engineering...' : 'Run Copilot Prompt'}
                </button>
              </div>
            </form>
          </div>

          {copilotResult && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 animate-in fade-in duration-300 transition-colors">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Gemini Prompt Analysis & Summary
                </h3>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  {copilotResult.summary}
                </p>
              </div>

              {copilotResult.suggestedActions && copilotResult.suggestedActions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Suggested Workspace Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {copilotResult.suggestedActions.map((action) => (
                      <div key={action.id} className="bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-md">
                            {action.type.replace('_', ' ')}
                          </span>
                          <h5 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{action.title}</h5>
                          <p className="text-xs text-slate-600 dark:text-slate-400">{action.description}</p>
                        </div>
                        <button
                          onClick={() => setPendingAction(action)}
                          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                        >
                          Review & Execute Action
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* GMAIL TAB */}
      {activeTab === 'gmail' && (
        <div className="space-y-8">
          <AppAIPromptAndTemplateManager
            appId="gmail"
            appName="Gmail"
            appDescription="Supercharge email triage, VIP thread summarization, and automated draft routines."
            appIcon={<Mail className="w-5 h-5 text-white" />}
            contextData={{ messages: messages.slice(0, 10), contacts: contacts.slice(0, 10) }}
            onExecuteAction={(action) => setPendingAction(action)}
            onLoadTemplateToStudio={handleLoadAppTemplateToStudio}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Recent Gmail Messages ({messages.length})
              </h2>
              <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                No messages found or access restricted.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-1 shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">{m.from}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">{m.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{m.subject}</h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{m.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Compose & Send Email
              </h3>
              <form onSubmit={handleSendManualEmail} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">To</label>
                  <input
                    type="email"
                    required
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line"
                    className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your email body..."
                    className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Send Email (Requires Confirmation)
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="space-y-8">
          <AppAIPromptAndTemplateManager
            appId="calendar"
            appName="Google Calendar"
            appDescription="Supercharge batch meeting scheduling, agenda generation, and time-blocking routines."
            appIcon={<Calendar className="w-5 h-5 text-white" />}
            contextData={{ events: events.slice(0, 10) }}
            onExecuteAction={(action) => setPendingAction(action)}
            onLoadTemplateToStudio={handleLoadAppTemplateToStudio}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Upcoming Calendar Events ({events.length})
              </h2>
              <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400">Loading calendar...</div>
            ) : events.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                No upcoming calendar events found.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => {
                  const startTime = ev.start?.dateTime || ev.start?.date || '';
                  return (
                    <div key={ev.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition space-y-1 shadow-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{ev.summary || 'Untitled Event'}</h4>
                        <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md border border-blue-100 dark:border-blue-900/60">
                          {new Date(startTime).toLocaleString()}
                        </span>
                      </div>
                      {ev.description && <p className="text-xs text-slate-600 dark:text-slate-400">{ev.description}</p>}
                      {ev.location && <p className="text-[11px] text-slate-400 dark:text-slate-500">📍 {ev.location}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Schedule Event
              </h3>
              <form onSubmit={handleCreateManualEvent} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                    placeholder="Sync with team"
                    className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Create Event (Requires Confirmation)
                </button>
              </form>
            </div>
          </div>
        </div>
        </div>
      )}

      {/* DRIVE & DOCS TAB */}
      {activeTab === 'drive' && (
        <div className="space-y-8">
          <AppAIPromptAndTemplateManager
            appId="drive"
            appName="Google Drive & Docs"
            appDescription="Supercharge file organization, document summarization, and PDF archival routines."
            appIcon={<FileText className="w-5 h-5 text-white" />}
            contextData={{ files: files.slice(0, 10) }}
            onExecuteAction={(action) => setPendingAction(action)}
            onLoadTemplateToStudio={handleLoadAppTemplateToStudio}
          />
          <DriveExplorerView />
        </div>
      )}

      {/* SHEETS TAB */}
      {activeTab === 'sheets' && (
        <div className="space-y-8">
          <AppAIPromptAndTemplateManager
            appId="sheets"
            appName="Google Sheets"
            appDescription="Supercharge tabular metric aggregation, financial analysis, and automated sheet feeds."
            appIcon={<Table className="w-5 h-5 text-white" />}
            onExecuteAction={(action) => setPendingAction(action)}
            onLoadTemplateToStudio={handleLoadAppTemplateToStudio}
          />
          <LeadDatabaseCleanupTool />
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Google Tasks ({tasks.length})
              </h2>
              <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                No tasks found.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div key={t.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold ${t.status === 'completed' ? 'line-through text-slate-400 dark:text-slate-600' : 'text-slate-900 dark:text-slate-100'}`}>
                        {t.title}
                      </h4>
                      {t.notes && <p className="text-[11px] text-slate-500 dark:text-slate-400">{t.notes}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Add Google Task
              </h3>
              <form onSubmit={handleCreateManualTask} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Review contract draft"
                    className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 uppercase mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full p-2.5 text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Create Task (Requires Confirmation)
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Google Contacts ({contacts.length})
            </h2>
            <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500 dark:text-slate-400">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              No contacts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((c) => (
                <div key={c.resourceName} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{c.name}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400">✉️ {c.email}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">📞 {c.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2ND BRAIN TAB */}
      {activeTab === 'brain' && <SecondBrainView />}

      {/* LOGIC ORCHESTRATOR TAB */}
      {activeTab === 'orchestrator' && (
        <LogicOrchestratorView
          initialWorkflowName={initialWorkflowName}
          revertedWorkflowName={revertedWorkflowName}
          onClearRevert={onClearRevert}
          importedWorkflow={importedWorkflow}
          onClearImport={onClearImport}
        />
      )}

      {/* WORKFLOW SCHEDULER TAB */}
      {activeTab === 'scheduler' && <WorkflowSchedulerView />}

      {/* VOICE MACROS TAB */}
      {activeTab === 'voice-macros' && (
        <VoiceMacroManagerView
          onExecuteWorkflow={(name) => {
            if (onExecuteVoiceWorkflow) {
              onExecuteVoiceWorkflow(name);
            } else {
              setActiveTab('orchestrator');
            }
          }}
        />
      )}

      {/* GMAIL DRAFTS TAB */}
      {activeTab === 'drafts' && <GmailDraftsView />}

      {/* MANDATORY ACTION CONFIRMATION MODAL */}
      <ActionConfirmationModal
        action={pendingAction}
        onConfirm={executeWorkspaceAction}
        onCancel={() => setPendingAction(null)}
        isExecuting={isExecutingAction}
      />

      {/* IPHONE & WEB PUSH NOTIFICATION MANAGER */}
      <PushNotificationManager
        isOpen={showPushModal}
        onClose={() => setShowPushModal(false)}
      />

      {/* LIVE TWO-WAY VISITOR NOTES & SMS MODAL */}
      <LiveTwoWayNotesModal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
      />
    </div>
  );
};
