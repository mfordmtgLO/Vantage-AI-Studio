import React, { useState, useEffect } from 'react';
import { WorkspaceTab, GmailMessage, CalendarEvent, DriveFile, GoogleTask, GoogleContact, CopilotResponse, SuggestedAction } from '../types';
import { getAccessToken } from '../services/firebase';
import { ActionConfirmationModal } from './ActionConfirmationModal';
import { SecondBrainView } from './SecondBrainView';
import { GmailDraftsView } from './GmailDraftsView';
import { Bot, Mail, Calendar, FileText, Table, CheckSquare, Users, Send, Plus, RefreshCw, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';


interface WorkspaceHubProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
}

export const WorkspaceHub: React.FC<WorkspaceHubProps> = ({ activeTab, setActiveTab }) => {
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-xs font-medium">{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700 font-bold text-sm">×</button>
        </div>
      )}

      {actionSuccessMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-xs font-medium">{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 font-bold text-sm">×</button>
        </div>
      )}

      {/* PROMPT STUDIO TAB */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Workspace Prompt Studio</h2>
                  <p className="text-xs text-slate-500">Prompt engineer tasks and actions across your connected Google Workspace</p>
                </div>
              </div>
              <button
                onClick={fetchWorkspaceData}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                Sync Workspace Data
              </button>
            </div>

            <form onSubmit={handleRunCopilot} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableDeepThink}
                      onChange={(e) => setEnableDeepThink(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Vantage DeepThink Mode
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={enableSearch}
                      onChange={(e) => setEnableSearch(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1">
                      Google Search Grounding
                    </span>
                  </label>
                </div>
                <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 bg-white border border-slate-200 rounded-md">Hybrid Gemini + Deepseek</span>
              </div>
              <div>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Analyze my recent emails and calendar, summarize action items, and draft follow-up tasks or emails...'"
                  rows={3}
                  className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none placeholder:text-slate-400"
                />
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
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
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6 animate-in fade-in duration-300">
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  Gemini Prompt Analysis & Summary
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {copilotResult.summary}
                </p>
              </div>

              {copilotResult.suggestedActions && copilotResult.suggestedActions.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">Suggested Workspace Actions</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {copilotResult.suggestedActions.map((action) => (
                      <div key={action.id} className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl space-y-3 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 rounded-md">
                            {action.type.replace('_', ' ')}
                          </span>
                          <h5 className="text-sm font-semibold text-slate-900">{action.title}</h5>
                          <p className="text-xs text-slate-600">{action.description}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Recent Gmail Messages ({messages.length})
              </h2>
              <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 hover:underline">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No messages found or access restricted.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1 shadow-xs">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-semibold text-slate-900">{m.from}</span>
                      <span className="text-[10px] text-slate-400">{m.date}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800">{m.subject}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{m.snippet}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                Compose & Send Email
              </h3>
              <form onSubmit={handleSendManualEmail} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">To</label>
                  <input
                    type="email"
                    required
                    value={emailTo}
                    onChange={(e) => setEmailTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Subject line"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Message</label>
                  <textarea
                    rows={4}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your email body..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Upcoming Calendar Events ({events.length})
              </h2>
              <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 hover:underline">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading calendar...</div>
            ) : events.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No upcoming calendar events found.
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => {
                  const startTime = ev.start?.dateTime || ev.start?.date || '';
                  return (
                    <div key={ev.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-1 shadow-xs">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-slate-900">{ev.summary || 'Untitled Event'}</h4>
                        <span className="text-[11px] font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                          {new Date(startTime).toLocaleString()}
                        </span>
                      </div>
                      {ev.description && <p className="text-xs text-slate-600">{ev.description}</p>}
                      {ev.location && <p className="text-[11px] text-slate-400">📍 {ev.location}</p>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Schedule Event
              </h3>
              <form onSubmit={handleCreateManualEvent} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Event Title</label>
                  <input
                    type="text"
                    required
                    value={eventSummary}
                    onChange={(e) => setEventSummary(e.target.value)}
                    placeholder="Sync with team"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    value={eventStart}
                    onChange={(e) => setEventStart(e.target.value)}
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
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
      )}

      {/* DRIVE & DOCS TAB */}
      {activeTab === 'drive' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Google Drive Files ({files.length})
              </h2>
              <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 hover:underline">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading files...</div>
            ) : files.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No files found in Drive.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((file) => (
                  <div key={file.id} className="bg-white p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition space-y-2 shadow-xs flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{file.name}</h4>
                      <p className="text-[10px] text-slate-400 truncate">{file.mimeType}</p>
                    </div>
                    {file.webViewLink && (
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Open in Google Drive →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Create Google Doc
              </h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!docTitle) return;
                  setPendingAction({
                    id: 'create_doc',
                    type: 'docs_create',
                    title: `Create Doc: ${docTitle}`,
                    description: `Create a new Google Document`,
                    payload: { title: docTitle },
                  });
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Document Title</label>
                  <input
                    type="text"
                    required
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    placeholder="Q3 Project Summary"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                >
                  Create Doc (Requires Confirmation)
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SHEETS TAB */}
      {activeTab === 'sheets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Table className="w-5 h-5 text-blue-600" />
              Google Sheets Manager
            </h2>
            <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 hover:underline">
              Refresh
            </button>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
            <Table className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">Connected to Google Sheets API</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Use the Prompt Studio tab to ask Gemini to analyze spreadsheets, append rows, or generate budgeting and task tracking tables directly in Google Sheets.
            </p>
          </div>
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                Google Tasks ({tasks.length})
              </h2>
              <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 hover:underline">
                Refresh
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-slate-500">Loading tasks...</div>
            ) : tasks.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
                No tasks found.
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((t) => (
                  <div key={t.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                    <div className="space-y-0.5">
                      <h4 className={`text-xs font-bold ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {t.title}
                      </h4>
                      {t.notes && <p className="text-[11px] text-slate-500">{t.notes}</p>}
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {t.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-600" />
                Add Google Task
              </h3>
              <form onSubmit={handleCreateManualTask} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Task Title</label>
                  <input
                    type="text"
                    required
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Review contract draft"
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 uppercase mb-1">Notes</label>
                  <textarea
                    rows={3}
                    value={taskNotes}
                    onChange={(e) => setTaskNotes(e.target.value)}
                    placeholder="Optional notes..."
                    className="w-full p-2.5 text-xs border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
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
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Google Contacts ({contacts.length})
            </h2>
            <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 hover:underline">
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-xs text-slate-500">Loading contacts...</div>
          ) : contacts.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
              No contacts found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contacts.map((c) => (
                <div key={c.resourceName} className="bg-white p-4 rounded-xl border border-slate-200 space-y-1 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-900">{c.name}</h4>
                  <p className="text-xs text-slate-600">✉️ {c.email}</p>
                  <p className="text-xs text-slate-500">📞 {c.phone}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2ND BRAIN TAB */}
      {activeTab === 'brain' && <SecondBrainView />}

      {/* GMAIL DRAFTS TAB */}
      {activeTab === 'drafts' && <GmailDraftsView />}

      {/* MANDATORY ACTION CONFIRMATION MODAL */}
      <ActionConfirmationModal
        action={pendingAction}
        onConfirm={executeWorkspaceAction}
        onCancel={() => setPendingAction(null)}
        isExecuting={isExecutingAction}
      />
    </div>
  );
};
