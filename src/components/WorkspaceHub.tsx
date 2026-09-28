import React, { useState, useEffect, useRef } from 'react';
import { WorkspaceTab, GmailMessage, CalendarEvent, DriveFile, GoogleTask, GoogleContact, CopilotResponse, SuggestedAction } from '../types';
import { getAccessToken } from '../services/firebase';
import { safeBtoa } from '../utils/base64';
import { getByokHttpHeaders } from '../utils/byokStorage';
import { ActionConfirmationModal } from './ActionConfirmationModal';
import { RotatingSuggestedWorkspaceActions } from './RotatingSuggestedWorkspaceActions';
import { SecondBrainView } from './SecondBrainView';
import { GmailDraftsView } from './GmailDraftsView';
import { LogicOrchestratorView } from './LogicOrchestratorView';
import { WorkflowSchedulerView } from './WorkflowSchedulerView';
import { DriveExplorerView } from './DriveExplorerView';
import { VoiceMacroManagerView } from './VoiceMacroManagerView';
import { StandalonePluginArchetypeGenerator } from './StandalonePluginArchetypeGenerator';
import { RealEstateMortgageView } from './RealEstateMortgageView';
import { GeomapDeveloperModeGate } from './GeomapDeveloperModeGate';
import { SuiteMasterUnifiedView } from './SuiteMasterUnifiedView';
import { TopTierCommercialStrategyHub } from './TopTierCommercialStrategyHub';
import { PrioritizedCodeImplementationRoadmap } from './PrioritizedCodeImplementationRoadmap';
import { AppAIPromptAndTemplateManager } from './AppAIPromptAndTemplateManager';
import { LeadDatabaseCleanupTool } from './LeadDatabaseCleanupTool';
import { ExecutiveSmartInboxStudio } from './ExecutiveSmartInboxStudio';
import { RelationalSheetsQueryEngine } from './RelationalSheetsQueryEngine';
import { AutonomousMeetingConcierge } from './AutonomousMeetingConcierge';
import { MultiSourceDataPurgeStudio } from './MultiSourceDataPurgeStudio';
import { PushNotificationManager } from './PushNotificationManager';
import { LiveTwoWayNotesModal } from './LiveTwoWayNotesModal';
import { ProfileCardsAdminPortal } from './ProfileCardsAdminPortal';
import { LeadDiscoveryStudio } from './LeadDiscoveryStudio';
import { GoogleAppHeader } from './GoogleAppHeader';
import { GoogleAppsCommandDeck } from './GoogleAppsCommandDeck';
import { GoogleAppsWorkspacePortal } from './GoogleAppsWorkspacePortal';
import { IndustryAppsAdaptabilityBar } from './IndustryAppsAdaptabilityBar';
import { IndustrySmartDocsGmailStudio } from './IndustrySmartDocsGmailStudio';
import { useAccountPathway } from '../context/AccountPathwayContext';
import { useMemory } from '../context/MemoryContext';
import { Bot, Mail, Calendar, FileText, Table, CheckSquare, Users, Send, Plus, RefreshCw, Sparkles, CheckCircle2, AlertCircle, Bell, MessageSquare, User, Copy, Check, RotateCcw, ArrowRight, CornerDownLeft, X, Layers, Brain, Shield, Megaphone, BookOpen, Smartphone, Flame } from 'lucide-react';


import { ShareableWorkflowData } from './ShareWorkflowModal';

export interface ChatTurn {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text: string;
  deepThink?: boolean;
  searchGrounding?: boolean;
  suggestedActions?: SuggestedAction[];
}

interface WorkspaceHubProps {
  activeTab: WorkspaceTab;
  setActiveTab: (tab: WorkspaceTab) => void;
  initialWorkflowName?: string | null;
  revertedWorkflowName?: string | null;
  onClearRevert?: () => void;
  onExecuteVoiceWorkflow?: (name: string) => void;
  importedWorkflow?: ShareableWorkflowData | null;
  onClearImport?: () => void;
  onOpenPitchDeck?: () => void;
  onOpenByokDrawer?: () => void;
  onOpenByokChecklist?: () => void;
  onOpenShareLinksModal?: (propertyId?: string) => void;
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
  onOpenPitchDeck,
  onOpenByokDrawer,
  onOpenByokChecklist,
  onOpenShareLinksModal,
}) => {
  const {
    pathway,
    setPathway,
    isWorkspaceConnected,
    connectedWorkspaceEmail,
    setIsWorkspaceModalOpen,
    syncData: pathwaySync,
    isSyncing,
    lastSynced,
    syncStatusMsg,
  } = useAccountPathway();

  const { 
    memories, 
    openRememberModal, 
    setIsKnowledgeBaseOpen, 
    activePersona,
    guardrails,
    setIsGuardrailsModalOpen
  } = useMemory();

  const [messages, setMessages] = useState<GmailMessage[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [contacts, setContacts] = useState<GoogleContact[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Autonomous OS Sub-Tab Navigation
  const [gmailSubTab, setGmailSubTab] = useState<'smart_inbox' | 'messages'>('smart_inbox');
  const [calendarSubTab, setCalendarSubTab] = useState<'concierge' | 'events'>('concierge');
  const [sheetsSubTab, setSheetsSubTab] = useState<'relational_sql' | 'fuzzy_purge' | 'cleanup_tool'>('relational_sql');
  const [isSmartAppsStudioOpen, setIsSmartAppsStudioOpen] = useState<boolean>(false);

  // Prompt Studio & Multi-Turn Chat state
  const [prompt, setPrompt] = useState<string>('');
  const [enableDeepThink, setEnableDeepThink] = useState<boolean>(true);
  const [enableSearch, setEnableSearch] = useState<boolean>(true);
  const [copilotResult, setCopilotResult] = useState<CopilotResponse | null>(null);
  const [isPrompting, setIsPrompting] = useState<boolean>(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  const [chatHistory, setChatHistory] = useState<ChatTurn[]>(() => {
    try {
      const saved = localStorage.getItem('vantage_workspace_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return [
      {
        id: 'welcome_init',
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: "Welcome to Vantage AI Workspace Studio! I am your 2nd Brain and Google Workspace Copilot.\n\nI can analyze your connected Gmail, Calendar, Drive, Docs, Sheets, Tasks, and Contacts to answer questions, synthesize executive summaries, and generate actionable workspace automations. How can I help you right now?",
        deepThink: true,
        searchGrounding: true,
        suggestedActions: [
          {
            id: "welcome_action_tasks",
            type: "tasks_create",
            title: "Organize Priority Workspace Tasks",
            description: "Scan recent emails and meetings to synthesize and create top priority tasks in Google Tasks.",
            payload: { title: "Review daily priority workspace deliverables" }
          },
          {
            id: "welcome_action_doc",
            type: "docs_create",
            title: "Create Executive Briefing Doc",
            description: "Initialize an executive briefing document with current workspace highlights in Google Docs.",
            payload: { title: "Vantage AI Workspace Briefing", prompt: "Executive workspace summary" }
          }
        ]
      }
    ];
  });

  useEffect(() => {
    try {
      localStorage.setItem('vantage_workspace_chat_history', JSON.stringify(chatHistory));
    } catch (e) {}
  }, [chatHistory]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLTextAreaElement>(null);
  const isInitialMount = useRef<boolean>(true);

  const scrollToBottom = (smooth = true) => {
    // Prevent scrolling during initial load or tab switches to ensure page starts snapped to top
    if (isInitialMount.current) return;
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'nearest' });
  };

  useEffect(() => {
    // Mark initial load complete after initial render
    const timer = setTimeout(() => {
      isInitialMount.current = false;
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Only scroll to new messages if user actively added a new chat interaction and not on initial render
    if (activeTab === 'studio' && !isInitialMount.current) {
      scrollToBottom(true);
    }
  }, [chatHistory.length, isPrompting]);

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
      if (!token || pathway === 'google_apps') {
        // Standard Google Apps mode (Free Google account - no paid workspace required)
        // Retrieve persistent user data or initialize with rich starter data
        let savedTasks: GoogleTask[] = [];
        let savedEvents: CalendarEvent[] = [];
        let savedMessages: GmailMessage[] = [];
        let savedFiles: DriveFile[] = [];
        let savedContacts: GoogleContact[] = [];

        try {
          const t = localStorage.getItem('vantage_google_apps_tasks');
          if (t) savedTasks = JSON.parse(t);
          const e = localStorage.getItem('vantage_google_apps_events');
          if (e) savedEvents = JSON.parse(e);
          const m = localStorage.getItem('vantage_google_apps_messages');
          if (m) savedMessages = JSON.parse(m);
          const f = localStorage.getItem('vantage_google_apps_files');
          if (f) savedFiles = JSON.parse(f);
          const c = localStorage.getItem('vantage_google_apps_contacts');
          if (c) savedContacts = JSON.parse(c);
        } catch {}

        if (savedMessages.length === 0) {
          savedMessages = [
            {
              id: 'm1',
              threadId: 't1',
              subject: 'Q3 Product Strategy Alignment & Next Steps',
              from: 'Sarah Chen <sarah.chen@vantageai.internal>',
              date: 'Today, 09:15 AM',
              snippet: 'Following up on our review of Gemini 2.5 Flash and DeepThink orchestration for enterprise accounts...'
            },
            {
              id: 'm2',
              threadId: 't2',
              subject: 'Investor Update & Growth Projections',
              from: 'Dave McClure <dave@ventures.capital>',
              date: 'Yesterday, 04:30 PM',
              snippet: 'Great metrics on user retention and cross-workflow automation features. Ready for Friday review.'
            },
            {
              id: 'm3',
              threadId: 't3',
              subject: 'Security Review & API Integration Guidelines',
              from: 'SecOps Team <security@internal.io>',
              date: 'Sep 18, 2026',
              snippet: 'All Gemini API endpoints proxy securely via server-side routes with zero client secret exposure.'
            }
          ];
          try { localStorage.setItem('vantage_google_apps_messages', JSON.stringify(savedMessages)); } catch {}
        }

        if (savedEvents.length === 0) {
          savedEvents = [
            {
              id: 'e1',
              summary: 'Executive AI Architecture & Copilot Sync',
              start: { dateTime: new Date(Date.now() + 3600000).toISOString() },
              end: { dateTime: new Date(Date.now() + 7200000).toISOString() }
            },
            {
              id: 'e2',
              summary: 'Weekly Product Roadmap Review',
              start: { dateTime: new Date(Date.now() + 86400000).toISOString() },
              end: { dateTime: new Date(Date.now() + 90000000).toISOString() }
            },
            {
              id: 'e3',
              summary: 'Gemini DeepThink & Search Grounding Deep Dive',
              start: { dateTime: new Date(Date.now() + 172800000).toISOString() },
              end: { dateTime: new Date(Date.now() + 176400000).toISOString() }
            }
          ];
          try { localStorage.setItem('vantage_google_apps_events', JSON.stringify(savedEvents)); } catch {}
        }

        if (savedFiles.length === 0) {
          savedFiles = [
            {
              id: 'f1',
              name: 'Q3_Market_Overview.docx',
              mimeType: 'application/vnd.google-apps.document',
              webViewLink: 'https://docs.google.com'
            },
            {
              id: 'f2',
              name: 'AI_Funding_Metrics_2026.xlsx',
              mimeType: 'application/vnd.google-apps.spreadsheet',
              webViewLink: 'https://sheets.google.com'
            },
            {
              id: 'f3',
              name: 'Vantage_Strategy_Deck_Final.pdf',
              mimeType: 'application/pdf',
              webViewLink: 'https://drive.google.com'
            }
          ];
          try { localStorage.setItem('vantage_google_apps_files', JSON.stringify(savedFiles)); } catch {}
        }

        if (savedTasks.length === 0) {
          savedTasks = [
            { id: 'tk1', title: 'Complete Gemini latency benchmarking', status: 'needsAction' },
            { id: 'tk2', title: 'Publish multi-step logic orchestrator template', status: 'needsAction' },
            { id: 'tk3', title: 'Verify Google authentication flows', status: 'completed' }
          ];
          try { localStorage.setItem('vantage_google_apps_tasks', JSON.stringify(savedTasks)); } catch {}
        }

        if (savedContacts.length === 0) {
          savedContacts = [
            { resourceName: 'c1', name: 'Sarah Chen', email: 'sarah.chen@vantageai.internal', phone: '+1 (555) 234-5678' },
            { resourceName: 'c2', name: 'Dave McClure', email: 'dave@ventures.capital', phone: '+1 (555) 876-5432' },
            { resourceName: 'c3', name: 'Alex Rivera', email: 'alex.rivera@techlead.dev', phone: '+1 (555) 345-6789' }
          ];
          try { localStorage.setItem('vantage_google_apps_contacts', JSON.stringify(savedContacts)); } catch {}
        }

        setMessages(savedMessages);
        setEvents(savedEvents);
        setFiles(savedFiles);
        setTasks(savedTasks);
        setContacts(savedContacts);
        setLoading(false);
        return;
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
      console.warn('Workspace data fetch notice:', err);
      // Fallback silently to sample data if network/token fails
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkspaceData();
  }, []);

  const handleRunCopilot = async (e?: React.FormEvent, customPrompt?: string) => {
    if (e) e.preventDefault();
    const promptToSend = (customPrompt || prompt).trim();
    if (!promptToSend || isPrompting) return;

    // Immediately clear prompt input field so the user gets a fresh prompt window for follow-up questions!
    setPrompt('');
    setIsPrompting(true);
    setError(null);
    setActionSuccessMsg(null);

    const userMessageId = `user_${Date.now()}`;
    const userTurn: ChatTurn = {
      id: userMessageId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: promptToSend,
      deepThink: enableDeepThink,
      searchGrounding: enableSearch,
    };

    setChatHistory(prev => [...prev, userTurn]);

    // Keep textarea ready for follow-up
    setTimeout(() => {
      promptInputRef.current?.focus();
    }, 50);

    try {
      const contextData = {
        messages: messages.slice(0, 5),
        events: events.slice(0, 5),
        files: files.slice(0, 5),
        tasks: tasks.slice(0, 5),
        contacts: contacts.slice(0, 5)
      };

      const recentHistory = chatHistory.slice(-6).map(m => ({
        sender: m.sender,
        text: m.text.slice(0, 250)
      }));

      const res = await fetch('/api/gemini/workspace-prompt', {
        method: 'POST',
        headers: getByokHttpHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          prompt: promptToSend,
          workspaceContext: contextData,
          activeTab,
          enableDeepThink,
          enableSearch,
          history: recentHistory,
          userMemories: memories,
          guardrails: guardrails
        }),
      });

      const rawText = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.warn('Could not parse response as JSON:', rawText);
        data = {
          summary: rawText.length > 0 && !rawText.startsWith('<') ? rawText : `Analyzed prompt: "${promptToSend}". Here are the synthesized workspace insights and recommended next actions:`,
          suggestedActions: [
            {
              id: "action_default_1",
              type: "docs_create",
              title: "Save Analysis to Google Docs",
              description: "Generate a formatted Google Doc with the results of this prompt analysis.",
              payload: { title: "AI Prompt Analysis: " + promptToSend.slice(0, 25), prompt: promptToSend }
            },
            {
              id: "action_default_2",
              type: "calendar_create",
              title: "Schedule Follow-up Review",
              description: "Add a calendar event to review these automated insights.",
              payload: { summary: "AI Workspace Follow-up: " + promptToSend.slice(0, 20), durationMinutes: 30 }
            }
          ]
        };
      }

      if (data && data.error && !data.summary) {
        throw new Error(data.error);
      }

      const assistantTurn: ChatTurn = {
        id: `assistant_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: data.summary || 'I analyzed your request and prepared recommended actions below.',
        deepThink: enableDeepThink,
        searchGrounding: enableSearch,
        suggestedActions: data.suggestedActions || [],
      };

      setChatHistory(prev => [...prev, assistantTurn]);
      setCopilotResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to process prompt. Please try again.');
      const errTurn: ChatTurn = {
        id: `err_${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `Error processing prompt: ${err.message || 'Please try again.'}`,
        suggestedActions: [],
      };
      setChatHistory(prev => [...prev, errTurn]);
    } finally {
      setIsPrompting(false);
      setTimeout(() => {
        promptInputRef.current?.focus();
      }, 50);
    }
  };

  const handleClearChatHistory = () => {
    const freshTurn: ChatTurn = {
      id: `welcome_${Date.now()}`,
      sender: 'assistant',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: "Started a fresh workspace chat session! How can I assist you across your Google Workspace?",
      deepThink: enableDeepThink,
      searchGrounding: enableSearch,
      suggestedActions: [
        {
          id: "fresh_action_1",
          type: "tasks_create",
          title: "Prioritize Today's Deliverables",
          description: "Scan calendar & unread emails to create organized Google Tasks.",
          payload: { title: "Review daily deliverables" }
        }
      ]
    };
    setChatHistory([freshTurn]);
    setCopilotResult(null);
    setPrompt('');
    setTimeout(() => {
      promptInputRef.current?.focus();
    }, 50);
  };

  const handleCopyText = (id: string, text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedMessageId(id);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }
  };

  // Execution of Workspace Mutating Actions with mandatory user confirmation
  const executeWorkspaceAction = async (action: SuggestedAction) => {
    setIsExecutingAction(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token || pathway === 'google_apps') {
        // Execution for Google Apps pathway (standard Google account)
        if (action.type === 'gmail_send') {
          const { to, subject } = action.payload;
          const newMsg: GmailMessage = {
            id: 'm_' + Date.now(),
            threadId: 't_' + Date.now(),
            subject: subject || 'Draft Message',
            from: 'You (Google Account)',
            date: 'Just now',
            snippet: `Sent/Drafted to ${to}: ${subject}`
          };
          setMessages(prev => {
            const updated = [newMsg, ...prev];
            try { localStorage.setItem('vantage_google_apps_messages', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActionSuccessMsg(`Email draft prepared and verified for ${to} in Google Apps!`);
          triggerPushAlert('Email Prepared', `Draft ready for ${to}: "${subject}"`);
        } else if (action.type === 'calendar_create') {
          const { summary, startDateTime } = action.payload;
          const newEvent: CalendarEvent = {
            id: 'event_' + Date.now(),
            summary,
            start: { dateTime: startDateTime || new Date().toISOString() },
            end: { dateTime: new Date(Date.now() + 3600000).toISOString() }
          };
          setEvents(prev => {
            const updated = [newEvent, ...prev];
            try { localStorage.setItem('vantage_google_apps_events', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActionSuccessMsg(`Calendar event "${summary}" successfully scheduled!`);
          triggerPushAlert('Calendar Event Scheduled', `"${summary}" added to schedule.`);
        } else if (action.type === 'tasks_create') {
          const { title } = action.payload;
          const newTask: GoogleTask = { id: 'tk_' + Date.now(), title, status: 'needsAction' };
          setTasks(prev => {
            const updated = [newTask, ...prev];
            try { localStorage.setItem('vantage_google_apps_tasks', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActionSuccessMsg(`Task "${title}" added successfully!`);
          triggerPushAlert('Task Created', `"${title}" added to your task list.`);
        } else if (action.type === 'docs_create') {
          const { title } = action.payload;
          const newFile: DriveFile = {
            id: 'doc_' + Date.now(),
            name: `${title}.docx`,
            mimeType: 'application/vnd.google-apps.document',
            webViewLink: 'https://docs.google.com'
          };
          setFiles(prev => {
            const updated = [newFile, ...prev];
            try { localStorage.setItem('vantage_google_apps_files', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActionSuccessMsg(`Document "${title}" created successfully!`);
          triggerPushAlert('Document Created', `"${title}" added to your files.`);
        } else if (action.type === 'drive_create') {
          const { name, mimeType } = action.payload;
          const newFile: DriveFile = {
            id: 'drive_' + Date.now(),
            name: name || 'Project_Asset_Folder',
            mimeType: mimeType || 'application/vnd.google-apps.folder',
            webViewLink: 'https://drive.google.com'
          };
          setFiles(prev => {
            const updated = [newFile, ...prev];
            try { localStorage.setItem('vantage_google_apps_files', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActionSuccessMsg(`Google Drive asset "${name}" created successfully!`);
          triggerPushAlert('Drive Asset Created', `"${name}" added to Google Drive.`);
        } else if (action.type === 'sheets_create' || action.type === 'sheets_append') {
          const { title } = action.payload;
          const newFile: DriveFile = {
            id: 'sheet_' + Date.now(),
            name: `${title || 'Spreadsheet'}.xlsx`,
            mimeType: 'application/vnd.google-apps.spreadsheet',
            webViewLink: 'https://sheets.google.com'
          };
          setFiles(prev => {
            const updated = [newFile, ...prev];
            try { localStorage.setItem('vantage_google_apps_files', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActionSuccessMsg(`Google Sheet "${title}" created successfully!`);
          triggerPushAlert('Spreadsheet Created', `"${title}" generated in Google Sheets.`);
        } else if (action.type === 'contacts_create') {
          const { name, email, phone } = action.payload;
          const newContact: GoogleContact = {
            resourceName: 'people/c_' + Date.now(),
            name: name || 'New Contact',
            email: email || 'contact@example.com',
            phone: phone || ''
          };
          setContacts(prev => {
            const updated = [newContact, ...prev];
            try { localStorage.setItem('vantage_google_apps_contacts', JSON.stringify(updated)); } catch {}
            return updated;
          });
          setActionSuccessMsg(`Contact "${name}" added to Google Contacts!`);
          triggerPushAlert('Contact Added', `"${name}" saved to Google Contacts.`);
        }
        setPendingAction(null);
        return;
      }

      if (action.type === 'gmail_send') {
        const { to, subject, body } = action.payload;
        const rawMessage = [
          `To: ${to}`,
          `Subject: ${subject}`,
          'Content-Type: text/plain; charset="UTF-8"',
          '',
          body,
        ].join('\n');
        const encodedMessage = safeBtoa(rawMessage)
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
      } else if (action.type === 'drive_create') {
        const { name, mimeType } = action.payload;
        const res = await fetch('https://www.googleapis.com/drive/v3/files', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: name || 'New Drive Asset',
            mimeType: mimeType || 'application/vnd.google-apps.folder'
          }),
        });
        if (!res.ok) throw new Error('Failed to create Drive asset');
        setActionSuccessMsg('Drive asset successfully created!');
        triggerPushAlert('Drive Asset Created', `"${name}" added to Google Drive.`);
      } else if (action.type === 'sheets_create') {
        const { title } = action.payload;
        const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: { title: title || 'New Spreadsheet' }
          }),
        });
        if (!res.ok) throw new Error('Failed to create Google Sheet');
        setActionSuccessMsg('Google Sheet successfully created!');
        triggerPushAlert('Spreadsheet Created', `"${title}" created in Google Sheets.`);
      } else if (action.type === 'contacts_create') {
        const { name, email, phone } = action.payload;
        const res = await fetch('https://people.googleapis.com/v1/people:createContact', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            names: [{ givenName: name }],
            emailAddresses: email ? [{ value: email }] : [],
            phoneNumbers: phone ? [{ value: phone }] : []
          }),
        });
        if (!res.ok) throw new Error('Failed to create contact in Google Contacts');
        setActionSuccessMsg('Contact successfully created in Google Contacts!');
        triggerPushAlert('Contact Created', `"${name}" added to Google Contacts.`);
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

      {/* SMART APPS STUDIO MODAL */}
      {isSmartAppsStudioOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="max-w-5xl w-full my-auto">
            <div className="flex justify-end mb-2">
              <button
                type="button"
                onClick={() => setIsSmartAppsStudioOpen(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white font-bold text-xs transition cursor-pointer"
              >
                ✕ Close Studio
              </button>
            </div>
            <IndustrySmartDocsGmailStudio
              onOpenDraftModal={() => {
                setIsSmartAppsStudioOpen(false);
                setActiveTab('drafts');
              }}
              onOpenSheetsEngine={() => {
                setIsSmartAppsStudioOpen(false);
                setActiveTab('sheets');
              }}
            />
          </div>
        </div>
      )}

      {/* VANTAGE AI STUDIO-SUITE (4-IN-1 MASTER COMBO) TAB */}
      {activeTab === 'suite' && (
        <SuiteMasterUnifiedView
          onOpenShareLinksModal={onOpenShareLinksModal}
          onOpenPitchDeck={onOpenPitchDeck}
          onOpenByokDrawer={onOpenByokDrawer}
          onOpenByokChecklist={onOpenByokChecklist}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* TOP-TIER BEST-SELLING COMMERCIAL STRATEGY & ROI TAB */}
      {activeTab === 'commercial_strategy' && (
        <TopTierCommercialStrategyHub
          onOpenLicenseStudio={onOpenPitchDeck}
          onOpenPitchDeck={onOpenPitchDeck}
          onOpenShareLinksModal={onOpenShareLinksModal}
          onNavigateTab={setActiveTab}
        />
      )}

      {/* PRIORITIZED CODE IMPLEMENTATION ROADMAP TAB */}
      {activeTab === 'dev_roadmap' && (
        <PrioritizedCodeImplementationRoadmap
          onNavigateTab={setActiveTab}
          onOpenByokDrawer={onOpenByokDrawer}
        />
      )}

      {/* 7 GOOGLE WORKSPACE APPS HUB & DUAL-PATHWAY PORTAL (FULL WEBSITE PARITY) */}
      {activeTab === 'google_apps' && (
        <GoogleAppsWorkspacePortal
          initialActiveApp="gmail"
          onNavigateTab={setActiveTab}
          onOpenPitchDeck={onOpenPitchDeck}
        />
      )}

      {/* PROMPT STUDIO TAB */}
      {activeTab === 'studio' && (
        <div className="space-y-6">
          {/* ULTRA-PROMINENT 7 GOOGLE WORKSPACE APPS COMMAND DECK */}
          <GoogleAppsCommandDeck
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            messageCount={messages.length}
            eventCount={events.length}
            fileCount={files.length}
            taskCount={tasks.length}
            contactCount={contacts.length}
            draftCount={18}
            onRefresh={fetchWorkspaceData}
            isRefreshing={loading}
          />

          {/* Studio Header Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Workspace Copilot & Prompt Studio</h2>
                    <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-md border border-blue-200 dark:border-blue-900">
                      Multi-Turn Chat
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Interactive multi-turn conversation & autonomous workspace agent across Gmail, Calendar, Drive, Docs, Sheets, and Tasks
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleClearChatHistory}
                  title="Start a fresh conversation thread"
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                  New Chat
                </button>
                <button
                  onClick={() => setShowNotesModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition cursor-pointer border border-emerald-200 dark:border-emerald-900/60"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Visitor Notes & SMS
                </button>
                <button
                  onClick={() => setShowPushModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-xl transition cursor-pointer border border-blue-200 dark:border-blue-900/60"
                >
                  <Bell className="w-3.5 h-3.5" />
                  Push Alerts
                </button>
                <button
                  onClick={() => setIsKnowledgeBaseOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-xl transition cursor-pointer border border-purple-200 dark:border-purple-900/60"
                  title="Manage 2nd Brain Memory & Ingested Knowledge"
                >
                  <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                  <span>2nd Brain ({memories.length})</span>
                </button>
                <button
                  onClick={() => setIsGuardrailsModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-xl transition cursor-pointer border border-emerald-200 dark:border-emerald-900/60"
                  title="Customize 2nd Brain personality, censorship boundaries & permissible scope"
                >
                  <Shield className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Guardrails ({guardrails.personalityPreset})</span>
                </button>
                <button
                  onClick={fetchWorkspaceData}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Sync Workspace
                </button>
              </div>
            </div>
          </div>

          {/* Active Persona & Situational Memory Banner */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gradient-to-r from-purple-50/90 via-indigo-50/80 to-blue-50/90 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-blue-950/40 border border-purple-200/80 dark:border-purple-900/60 rounded-2xl text-xs shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-slate-100 mr-2">
                  2nd Brain Memory & Persona Recall Active:
                </span>
                <span className="text-purple-800 dark:text-purple-300 font-medium">
                  {activePersona ? activePersona.title : 'Consistent Persona'} • {memories.length} memories • <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{guardrails.personalityPreset} Guardrails ({guardrails.forbiddenTopics?.length || 0} curbs)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsGuardrailsModalOpen(true)}
                className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] font-semibold transition cursor-pointer flex items-center gap-1"
                title="Configure Censorship Boundaries & Guardrails"
              >
                <Shield className="w-3 h-3 text-emerald-600" />
                <span>Boundaries</span>
              </button>
              <button
                onClick={() => openRememberModal({ title: 'New Custom Instruction', content: '', type: 'instruction' })}
                className="px-2.5 py-1 bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 border border-purple-200 dark:border-purple-800 rounded-xl text-[11px] font-semibold transition cursor-pointer"
              >
                + Remember New
              </button>
              <button
                onClick={() => setIsKnowledgeBaseOpen(true)}
                className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                View Knowledge Base &rarr;
              </button>
            </div>
          </div>

          {/* Chat Conversation Thread */}
          <div className="space-y-4">
            {chatHistory.map((turn) => (
              <div
                key={turn.id}
                className={`flex flex-col ${turn.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-3xl w-full rounded-2xl p-5 shadow-sm space-y-3 transition-colors ${
                    turn.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-xs'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-xs'
                  }`}
                >
                  {/* Message Header */}
                  <div className="flex items-center justify-between gap-3 text-xs border-b pb-2.5 border-white/20 dark:border-slate-800">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                          turn.sender === 'user'
                            ? 'bg-white/20 text-white'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {turn.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>
                      <span className="font-semibold">
                        {turn.sender === 'user' ? 'You' : 'Vantage AI Assist'}
                      </span>
                      <span className={`text-[11px] ${turn.sender === 'user' ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>
                        {turn.timestamp}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {turn.deepThink && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            turn.sender === 'user'
                              ? 'bg-white/20 text-white'
                              : 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                          }`}
                        >
                          DeepThink
                        </span>
                      )}
                      {turn.searchGrounding && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            turn.sender === 'user'
                              ? 'bg-white/20 text-white'
                              : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                          }`}
                        >
                          Search
                        </span>
                      )}
                      
                      {/* Remember This Button */}
                      <button
                        onClick={() => openRememberModal({
                          title: turn.sender === 'user' ? `Learned Instruction: ${turn.text.slice(0, 35)}` : `Copilot Insight: ${turn.text.slice(0, 35)}`,
                          content: turn.text,
                          type: 'instruction'
                        })}
                        className={`flex items-center gap-1 text-[11px] transition cursor-pointer px-2 py-0.5 rounded-md ${
                          turn.sender === 'user'
                            ? 'text-white/90 hover:text-white bg-white/15 hover:bg-white/25'
                            : 'text-purple-600 dark:text-purple-400 hover:text-purple-700 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80'
                        }`}
                        title="Remember this context in 2nd Brain & Firestore"
                      >
                        <Brain className="w-3 h-3" />
                        <span>Remember this</span>
                      </button>

                      {turn.sender === 'assistant' && (
                        <button
                          onClick={() => handleCopyText(turn.id, turn.text)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                          title="Copy text"
                        >
                          {copiedMessageId === turn.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          <span className="hidden sm:inline">{copiedMessageId === turn.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Message Content */}
                  <div className={`text-sm leading-relaxed whitespace-pre-wrap ${turn.sender === 'user' ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                    {turn.text}
                  </div>

                  {/* Interactive Suggested Actions - 1 Per Free Google App Rotating Every 30 Seconds */}
                  {turn.id.startsWith('welcome') || turn.id.startsWith('fresh') ? (
                    <RotatingSuggestedWorkspaceActions
                      onExecuteAction={(action) => setPendingAction(action)}
                    />
                  ) : turn.suggestedActions && turn.suggestedActions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            Synthesized Query Actions ({turn.suggestedActions.length})
                          </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {turn.suggestedActions.map((action) => (
                            <div
                              key={action.id}
                              className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/70 p-3.5 rounded-xl space-y-2.5 flex flex-col justify-between"
                            >
                              <div className="space-y-1">
                                <span className="inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded">
                                  {action.type.replace('_', ' ')}
                                </span>
                                <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100">{action.title}</h5>
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">{action.description}</p>
                              </div>
                              <button
                                onClick={() => setPendingAction(action)}
                                className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
                              >
                                <span>Review & Execute Action</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Rotating 7-App Actions Palette for ongoing workflows */}
                      <RotatingSuggestedWorkspaceActions
                        onExecuteAction={(action) => setPendingAction(action)}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {/* Thinking / Loading Indicator */}
            {isPrompting && (
              <div className="flex items-start">
                <div className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-50 dark:bg-blue-950 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Sparkles className="w-4 h-4 animate-spin text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Vantage AI is synthesizing workspace data...</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Analyzing context and formulating action proposals</p>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Follow-Up Prompt Suggestions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                Quick Follow-Up Prompts:
              </span>
              <span className="text-[11px] text-slate-400">Click to ask instantly</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "What kind of AI 2nd brain are you?",
                "Summarize my recent unread Gmail messages",
                "What events and meetings do I have scheduled?",
                "Draft an executive summary in Google Docs",
                "Extract priority tasks into Google Tasks"
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleRunCopilot(undefined, suggestion)}
                  disabled={isPrompting}
                  className="px-3 py-1.5 text-xs bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/50 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-800 rounded-xl transition cursor-pointer shadow-2xs text-left"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* FRESH NEW CHAT PROMPT WINDOW */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-md space-y-3 transition-colors sticky bottom-4 z-10">
            {/* Mode toggles & context status */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center gap-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={enableDeepThink}
                    onChange={(e) => setEnableDeepThink(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                  />
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Vantage DeepThink
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
                    Google Search
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium px-2 py-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
                  Context: {messages.length} msgs, {events.length} events, {tasks.length} tasks
                </span>
              </div>
            </div>

            {/* Prompt input field */}
            <form onSubmit={(e) => handleRunCopilot(e)} className="space-y-2">
              <div className="relative">
                <textarea
                  ref={promptInputRef}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleRunCopilot();
                    }
                  }}
                  placeholder="Ask a follow-up question or enter a workspace instruction... (Press Enter to send, Shift+Enter for new line)"
                  rows={2}
                  className="w-full p-3 pr-10 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {prompt.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setPrompt('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" />
                  <span>Press <strong className="font-semibold">Enter ↵</strong> to send • <strong className="font-semibold">Shift + Enter</strong> for new line</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={isPrompting || !prompt.trim()}
                    className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
                  >
                    <Send className={`w-3.5 h-3.5 ${isPrompting ? 'animate-pulse' : ''}`} />
                    <span>{isPrompting ? 'Thinking...' : 'Send Prompt'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* GMAIL TAB */}
      {activeTab === 'gmail' && (
        <div className="space-y-6">
          <GoogleAppHeader
            appName="Gmail"
            appDescription="Supercharge email triage, VIP thread summarization, and automated draft routines."
            appWebUrl="https://mail.google.com"
            appIcon={<Mail className="w-5 h-5" />}
            itemCount={messages.length}
            itemLabel="messages"
            onRefresh={fetchWorkspaceData}
            isRefreshing={loading}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />

          <AppAIPromptAndTemplateManager
            appId="gmail"
            appName="Gmail"
            appDescription="Supercharge email triage, VIP thread summarization, and automated draft routines."
            appIcon={<Mail className="w-5 h-5 text-white" />}
            contextData={{ messages: messages.slice(0, 10), contacts: contacts.slice(0, 10) }}
            onExecuteAction={(action) => setPendingAction(action)}
            onLoadTemplateToStudio={handleLoadAppTemplateToStudio}
          />

          {/* Sub-Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setGmailSubTab('smart_inbox')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                gmailSubTab === 'smart_inbox'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-300" />
              <span>Executive Smart Inbox & Urgency Heatmap</span>
            </button>
            <button
              onClick={() => setGmailSubTab('messages')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                gmailSubTab === 'messages'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Recent Gmail Messages & Compose ({messages.length})</span>
            </button>
          </div>

          {gmailSubTab === 'smart_inbox' ? (
            <ExecutiveSmartInboxStudio
              existingEvents={events}
              onScheduleCalendarHold={(title, startIso, duration) => {
                setPendingAction({
                  id: `act-cal-hold-${Date.now()}`,
                  type: 'calendar_create',
                  title: `Provisional Hold: ${title}`,
                  description: `Create Google Calendar soft-hold starting at ${new Date(startIso).toLocaleTimeString()} with 15-minute protected focus buffer.`,
                  payload: { summary: title, startTime: startIso }
                });
              }}
              onCreateTask={(title, notes) => {
                setPendingAction({
                  id: `act-task-${Date.now()}`,
                  type: 'tasks_create',
                  title: `Add Task: ${title}`,
                  description: `Create action milestone in Google Tasks with cross-referenced thread notes.`,
                  payload: { title, notes }
                });
              }}
              onSendDraftEmail={(to, subject, body) => {
                setEmailTo(to);
                setEmailSubject(subject);
                setEmailBody(body);
                setPendingAction({
                  id: `act-send-email-${Date.now()}`,
                  type: 'gmail_send',
                  title: `Send Draft: ${subject}`,
                  description: `Dispatch synthesized VIP email to ${to} via Gmail API.`,
                  payload: { to, subject, body }
                });
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Recent Gmail Messages ({messages.length})
                  </h2>
                  <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
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
          )}
        </div>
      )}

      {/* CALENDAR TAB */}
      {activeTab === 'calendar' && (
        <div className="space-y-6">
          <GoogleAppHeader
            appName="Google Calendar"
            appDescription="Supercharge batch meeting scheduling, agenda generation, and time-blocking routines."
            appWebUrl="https://calendar.google.com"
            appIcon={<Calendar className="w-5 h-5" />}
            itemCount={events.length}
            itemLabel="upcoming events"
            onRefresh={fetchWorkspaceData}
            isRefreshing={loading}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />

          <AppAIPromptAndTemplateManager
            appId="calendar"
            appName="Google Calendar"
            appDescription="Supercharge batch meeting scheduling, agenda generation, and time-blocking routines."
            appIcon={<Calendar className="w-5 h-5 text-white" />}
            contextData={{ events: events.slice(0, 10) }}
            onExecuteAction={(action) => setPendingAction(action)}
            onLoadTemplateToStudio={handleLoadAppTemplateToStudio}
          />

          {/* Sub-Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setCalendarSubTab('concierge')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                calendarSubTab === 'concierge'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Autonomous Meeting Negotiation & Concierge</span>
            </button>
            <button
              onClick={() => setCalendarSubTab('events')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                calendarSubTab === 'events'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Upcoming Events & Schedule Planner ({events.length})</span>
            </button>
          </div>

          {calendarSubTab === 'concierge' ? (
            <AutonomousMeetingConcierge
              existingEvents={events}
              onCreateCalendarHold={(title, startIso, duration) => {
                setPendingAction({
                  id: `act-concierge-hold-${Date.now()}`,
                  type: 'calendar_create',
                  title: `Provisional Hold: ${title}`,
                  description: `Create 15-minute protected hold on Google Calendar at ${new Date(startIso).toLocaleString()}.`,
                  payload: { summary: title, startTime: startIso }
                });
              }}
              onSendEmailDraft={(to, subject, body) => {
                setEmailTo(to);
                setEmailSubject(subject);
                setEmailBody(body);
                setPendingAction({
                  id: `act-concierge-send-${Date.now()}`,
                  type: 'gmail_send',
                  title: `Send Negotiation Email: ${subject}`,
                  description: `Dispatch 3 non-overlapping slot proposals to ${to} via Gmail.`,
                  payload: { to, subject, body }
                });
              }}
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Upcoming Calendar Events ({events.length})
                  </h2>
                  <button onClick={fetchWorkspaceData} className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer">
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
          )}
        </div>
      )}

      {/* DRIVE & DOCS TAB */}
      {activeTab === 'drive' && (
        <div className="space-y-6">
          <GoogleAppHeader
            appName="Google Drive & Docs"
            appDescription="Supercharge file organization, document summarization, and PDF archival routines."
            appWebUrl="https://drive.google.com"
            appIcon={<FileText className="w-5 h-5" />}
            itemCount={files.length}
            itemLabel="files"
            onRefresh={fetchWorkspaceData}
            isRefreshing={loading}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />
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
        <div className="space-y-6">
          <GoogleAppHeader
            appName="Google Sheets"
            appDescription="Supercharge tabular metric aggregation, financial analysis, and automated sheet feeds."
            appWebUrl="https://sheets.google.com"
            appIcon={<Table className="w-5 h-5" />}
            onRefresh={fetchWorkspaceData}
            isRefreshing={loading}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />
          <AppAIPromptAndTemplateManager
            appId="sheets"
            appName="Google Sheets"
            appDescription="Supercharge tabular metric aggregation, financial analysis, and automated sheet feeds."
            appIcon={<Table className="w-5 h-5 text-white" />}
            onExecuteAction={(action) => setPendingAction(action)}
            onLoadTemplateToStudio={handleLoadAppTemplateToStudio}
          />

          {/* Sheets Sub-Tab Selector */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            <button
              onClick={() => setSheetsSubTab('relational_sql')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                sheetsSubTab === 'relational_sql'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>Relational SQL & Schema Drift Engine</span>
            </button>
            <button
              onClick={() => setSheetsSubTab('fuzzy_purge')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                sheetsSubTab === 'fuzzy_purge'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-300" />
              <span>Multi-Source Fuzzy De-Duplication & Purge</span>
            </button>
            <button
              onClick={() => setSheetsSubTab('cleanup_tool')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                sheetsSubTab === 'cleanup_tool'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Standard Pipeline Cleaner</span>
            </button>
          </div>

          {sheetsSubTab === 'relational_sql' && <RelationalSheetsQueryEngine />}
          {sheetsSubTab === 'fuzzy_purge' && <MultiSourceDataPurgeStudio />}
          {sheetsSubTab === 'cleanup_tool' && <LeadDatabaseCleanupTool />}
        </div>
      )}

      {/* TASKS TAB */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <GoogleAppHeader
            appName="Google Tasks"
            appDescription="Supercharge daily action items, priority tracking, and execution flows."
            appWebUrl="https://tasks.google.com"
            appIcon={<CheckSquare className="w-5 h-5" />}
            itemCount={tasks.length}
            itemLabel="tasks"
            onRefresh={fetchWorkspaceData}
            isRefreshing={loading}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />
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
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === 'contacts' && (
        <div className="space-y-6">
          <GoogleAppHeader
            appName="Google Contacts"
            appDescription="Manage clients, partners, and lead contacts directly across your workflow."
            appWebUrl="https://contacts.google.com"
            appIcon={<Users className="w-5 h-5" />}
            itemCount={contacts.length}
            itemLabel="contacts"
            onRefresh={fetchWorkspaceData}
            isRefreshing={loading}
            activeTab={activeTab}
            onNavigateTab={setActiveTab}
          />
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

      {/* REAL ESTATE & MORTGAGE GEOMAP ENGINE TAB */}
      {activeTab === 'real_estate' && (
        <GeomapDeveloperModeGate onBackToPublic={() => setActiveTab('studio')}>
          <RealEstateMortgageView
            onOpenPluginVault={() => setActiveTab('admin_plugins')}
            onOpenByokDrawer={onOpenByokDrawer}
            onOpenShareLinksModal={onOpenShareLinksModal}
          />
        </GeomapDeveloperModeGate>
      )}

      {/* GMAIL DRAFTS TAB */}
      {activeTab === 'drafts' && <GmailDraftsView />}

      {/* LO & AGENT PROFILE CARDS ADMIN PORTAL TAB */}
      {activeTab === 'lo_agent_profiles' && <ProfileCardsAdminPortal />}

      {/* OREGON LEAD DISCOVERY TAB */}
      {activeTab === 'lead_discovery' && <LeadDiscoveryStudio />}

      {/* ADMIN PLUGINS & CODE GENERATORS TAB */}
      {activeTab === 'admin_plugins' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-blue-200 dark:border-blue-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Live Mobile Add-to-Home-Screen Endpoints
                  <span className="text-[10px] px-2 py-0.5 bg-blue-600 text-white rounded-full font-extrabold uppercase">
                    5 Live URLs
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Direct shareable URLs for Real Estate GeoMap, 2nd Brain, Workspace UI, Voice Macro, and Master Suite.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onOpenShareLinksModal && (
                <button
                  onClick={() => onOpenShareLinksModal()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Smartphone className="w-4 h-4 text-amber-300" />
                  <span>Get Live Mobile URLs</span>
                </button>
              )}
              {onOpenPitchDeck && (
                <button
                  onClick={onOpenPitchDeck}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Pitch Deck</span>
                </button>
              )}
            </div>
          </div>
          <StandalonePluginArchetypeGenerator currentUserEmail={connectedWorkspaceEmail} />
        </div>
      )}

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
