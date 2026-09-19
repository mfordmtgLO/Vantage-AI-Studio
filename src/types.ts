export type WorkspaceTab = 'studio' | 'gmail' | 'calendar' | 'drive' | 'sheets' | 'tasks' | 'contacts' | 'brain';

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet?: string;
  subject?: string;
  from?: string;
  date?: string;
}

export interface CalendarEvent {
  id: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
  description?: string;
  location?: string;
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  modifiedTime?: string;
}

export interface GoogleTask {
  id: string;
  title: string;
  notes?: string;
  status: 'needsAction' | 'completed';
  due?: string;
}

export interface GoogleContact {
  resourceName: string;
  name?: string;
  email?: string;
  phone?: string;
}

export interface SuggestedAction {
  id: string;
  type: 'gmail_send' | 'calendar_create' | 'docs_create' | 'sheets_append' | 'tasks_create';
  title: string;
  description: string;
  payload: any;
}

export interface CopilotResponse {
  summary: string;
  suggestedActions: SuggestedAction[];
}
