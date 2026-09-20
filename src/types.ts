export type WorkspaceTab = 'studio' | 'brain' | 'orchestrator' | 'scheduler' | 'drafts' | 'gmail' | 'calendar' | 'drive' | 'sheets' | 'tasks' | 'contacts' | 'voice-macros';

export type AccountPathway = 'google_apps' | 'workspace';

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

export type MemoryType =
  | 'persona'
  | 'instruction'
  | 'knowledge'
  | 'file_extracted'
  | 'url_scrape'
  | 'agent_workflow'
  | 'conversation_insight';

export interface UserMemory {
  id: string;
  userId?: string;
  title: string;
  content: string;
  type: MemoryType;
  category?: string;
  tags: string[];
  source: 'chat_remember_this' | 'url_scrape' | 'file_upload' | 'agent_orchestrator' | 'manual';
  sourceUrl?: string;
  fileName?: string;
  metadata?: {
    cronSchedule?: string;
    actionPayload?: any;
    steps?: any[];
    promptEngineered?: boolean;
    extractedAt?: string;
    originalQuery?: string;
    [key: string]: any;
  };
  createdAt: string;
  updatedAt?: string;
  aiSummary?: string;
  syncedToCloud?: boolean;
}

export type PersonalityPreset = 
  | 'adaptive'
  | 'executive'
  | 'academic'
  | 'socratic'
  | 'mentor'
  | 'direct_minimalist'
  | 'creative'
  | 'custom'
  | 'unconstrained';

export type ToneDemeanor =
  | 'balanced'
  | 'formal_executive'
  | 'casual_collegial'
  | 'blunt_analytical'
  | 'diplomatic';

export type VerbosityLevel = 'concise' | 'balanced' | 'comprehensive' | 'step_by_step';
export type HumorLevel = 'none' | 'subtle' | 'playful';

export type CensorshipMode = 'standard' | 'strict_enterprise' | 'relaxed_research' | 'custom' | 'unconstrained';
export type SensitiveTopicPolicy = 'refuse_strictly' | 'redirect_politely' | 'objective_neutrality';

export type ActionExecutionBoundary = 'autonomous' | 'require_confirmation' | 'read_only_advisory';

export interface LanguageCurbs {
  filterProfanity: boolean;
  suppressJargon: boolean;
  avoidSpeculation: boolean;
  brandAlignmentVoice: string;
}

export interface PermissibleFeatures {
  allowWorkspaceDrafting: boolean;
  allowCodeGeneration: boolean;
  allowWebSearchGrounding: boolean;
  allowDocumentIngestion: boolean;
  allowScheduledCronAgents: boolean;
}

export interface CustomizationInputRecord {
  id: string;
  timestamp: string;
  category: 'topic' | 'rule' | 'persona' | 'boundary' | 'language_curb' | 'action_scope' | 'preset' | 'alignment';
  label: string;
  field: string;
  value: any;
  previousValue?: any;
  description?: string;
}

export interface GuardrailSettings {
  id?: string;
  userId?: string;
  updatedAt?: string;

  // 1. Personality & Conversational Demeanor
  personalityPreset: PersonalityPreset;
  customPersonaDirective: string;
  toneDemeanor: ToneDemeanor;
  empathyLevel: number; // 1 (Stoic / Pure Logic) to 5 (Deeply Warm / Empathetic)
  verbosity: VerbosityLevel;
  humorWit: HumorLevel;

  // 2. Content Moderation & Censorship Boundaries
  censorshipMode: CensorshipMode;
  sensitiveTopicPolicy: SensitiveTopicPolicy;
  forbiddenTopics: string[];
  customBoundaryRules: string;
  languageCurbs: LanguageCurbs;

  // 3. Permissible Scope of Functionality & Agent Range
  actionExecutionBoundary: ActionExecutionBoundary;
  permissibleFeatures: PermissibleFeatures;

  // 4. Response Alignment & Behavioral Guardrails
  antiSycophancy: boolean;
  zeroPreamble: boolean;
  citationRequirement: 'strict' | 'when_applicable' | 'none';
  hallucinationStrictness: 'strict_uncertainty' | 'balanced';
  customGuardrailDirectives: string[];
  activeSafetyPresets?: string[];
  syncedToCloud?: boolean;

  // 5. Clean Wipe & Unconstrained Freedom Mode
  unconstrainedMode?: boolean;

  // 6. Historical Customization Inputs Audit Trail & Granular Control
  customizationHistory?: CustomizationInputRecord[];
}

