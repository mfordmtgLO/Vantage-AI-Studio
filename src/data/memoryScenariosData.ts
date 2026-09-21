import { MemoryType } from '../types';

export interface MemoryScenario {
  id: string;
  category: 'project_context' | 'communication_preferences' | 'process_rules';
  memoryType: MemoryType;
  title: string;
  payload: string;
  tags: string[];
  testPrompt: string;
  expectedBehavior: string;
  whyItWorks: string;
  badgeColor: string;
}

export const MEMORY_SCENARIOS_TABS = [
  {
    id: 'project_context' as const,
    label: 'Project Context',
    description: 'Teach facts, pricing, domain rules, tech stack & team roles so the 2nd Brain never hallucinates company details.',
    iconName: 'FileText',
    color: 'blue'
  },
  {
    id: 'communication_preferences' as const,
    label: 'Communication Preferences',
    description: 'Tune voice, tone, executive brevity, email styling & response formats across all threads.',
    iconName: 'Sparkles',
    color: 'purple'
  },
  {
    id: 'process_rules' as const,
    label: 'Process Rules',
    description: 'Set rigid operational guardrails, approval gates, deletion safety redlines & cron automations.',
    iconName: 'Shield',
    color: 'emerald'
  }
];

export const MEMORY_SCENARIOS: MemoryScenario[] = [
  // ================= PROJECT CONTEXT =================
  {
    id: 'proj_pricing_sla',
    category: 'project_context',
    memoryType: 'knowledge',
    title: 'Vantage Tier Pricing & Enterprise SLAs',
    payload: `Vantage AI Workspace product pricing structure:
1. Starter Tier ($29/mo): Up to 1,000 hybrid reasoning queries, local state memory, single workspace integration.
2. Professional Tier ($99/mo): Unlimited queries, full 2nd Brain vector search, multi-device Firestore sync, DeepSeek R1 reasoning.
3. Enterprise Tier ($499/mo): Custom Google Workspace OAuth setup, dedicated Firestore database isolation, 99.9% uptime SLA, priority live agent webhook routing.

Key Contacts:
- Primary Administrator: Mike Ford (fordmj@gmail.com)
- Official Support: support@vantageai.workspace`,
    tags: ['pricing', 'sla', 'tiers', 'sales', 'enterprise'],
    testPrompt: 'A prospective enterprise client is asking for our SLAs and pricing for 50 seats with custom OAuth. Draft a response.',
    expectedBehavior: 'Automatically references the $499/mo tier, 99.9% SLA, and directs outreach to Mike Ford without needing to look up pricing sheets.',
    whyItWorks: 'Permanently establishes business facts in the 2nd Brain knowledge base, preventing the AI from guessing or making up inaccurate pricing tiers.',
    badgeColor: 'blue'
  },
  {
    id: 'proj_tech_stack',
    category: 'project_context',
    memoryType: 'knowledge',
    title: 'Workspace Tech Stack & API Key Security Architecture',
    payload: `Engineering Architecture Guidelines:
- Frontend: React 18 + Vite + TypeScript + Tailwind CSS (lucide-react icons exclusively).
- Backend Server: Express.js (mounted on port 3000) with @google/genai SDK for server-side Gemini 2.5 Flash / Pro.
- Database: Cloud Firestore for cross-device persistence with RBAC rules.
- Security Directive: Third-party API keys (e.g. Gemini, DeepSeek) MUST remain server-side only in server.ts. Google Workspace OAuth uses client-side GIS token client.`,
    tags: ['architecture', 'security', 'apis', 'engineering', 'fullstack'],
    testPrompt: 'How should I implement a new AI feature that needs an external secret API key?',
    expectedBehavior: 'Instructs you to proxy the request via Express server-side routes (/api/*) rather than embedding the secret key in the client React code.',
    whyItWorks: 'Enforces your engineering principles and prevents junior developers or AI coding assistants from exposing secrets in client bundles.',
    badgeColor: 'blue'
  },
  {
    id: 'proj_client_milestones',
    category: 'project_context',
    memoryType: 'knowledge',
    title: 'Acme Health Q3 Telehealth Integration Milestones',
    payload: `Client: Acme Health Systems (Target Domain: portal.acmehealth.com)
Key Stakeholders: Dr. Sarah Jenkins (VP Operations), Dave Miller (Lead Architect)
Current Q3 Milestones:
- Milestone 1 (Target: Oct 15): Google Calendar HIPAA appointment sync pipeline.
- Milestone 2 (Target: Nov 01): Real-time voice transcription ingestion into patient notes.
- Milestone 3 (Target: Nov 15): 2nd Brain diagnostic summary guardrails audit.`,
    tags: ['client_acme', 'milestones', 'q3', 'telehealth', 'roadmap'],
    testPrompt: 'What is the status and next upcoming deadline for the Acme Health rollout?',
    expectedBehavior: 'Immediately pulls the October 15 Calendar sync milestone and lists Dr. Sarah Jenkins and Dave Miller as project leads.',
    whyItWorks: 'Maintains continuity across client accounts so the 2nd Brain acts as an instant briefing assistant for meetings.',
    badgeColor: 'blue'
  },

  // ================= COMMUNICATION PREFERENCES =================
  {
    id: 'comm_exec_brevity',
    category: 'communication_preferences',
    memoryType: 'persona',
    title: 'Executive Brevity & Structured 3-Bullet Rule',
    payload: `Executive Communication Persona:
1. Zero Fluff: Never use preamble phrases like "Sure! Here is what you asked for" or "I'd be happy to assist."
2. Structure: Every strategic answer must start with a bold 1-sentence Executive Summary followed by:
   - 3 Key Takeaways (bulleted, prioritized by ROI)
   - Action Item with Owner & Deadline
   - Identified Blockers or Risks
3. Tone: Crisp, objective, analytical, and professional.`,
    tags: ['persona', 'executive', 'brevity', 'formatting', 'structure'],
    testPrompt: 'Review our quarterly marketing analytics report and tell me how we performed.',
    expectedBehavior: 'Outputs a sharp 1-sentence executive summary and 3 prioritized bullet points without generic filler conversational intros.',
    whyItWorks: 'Eliminates repetitive AI boilerplate and forces the reasoning engine into a clean, scannable format optimized for busy executives.',
    badgeColor: 'purple'
  },
  {
    id: 'comm_support_empathy',
    category: 'communication_preferences',
    memoryType: 'persona',
    title: 'Warm & Reassuring VIP Customer Care Voice',
    payload: `Customer Support Persona Guidelines:
- Tone: Empathetic, calm, solution-oriented, and reassuring.
- Greeting: Warm and personalized ("Hi [Name], thank you for reaching out").
- Resolution Steps: Numbered step-by-step instructions with clear troubleshooting actions.
- Sign-off: "Warm regards, The Vantage Support Team | support@vantageai.workspace".
- Never argue or place blame on the customer; validate their experience first.`,
    tags: ['persona', 'support', 'customer_care', 'empathy', 'email_template'],
    testPrompt: 'Draft a reply to a user whose workflow failed due to a Google OAuth token expiration.',
    expectedBehavior: 'Generates an empathetic apology, provides simple 2-step re-authentication instructions, and includes the official support sign-off.',
    whyItWorks: 'Calibrates the tone for external customer engagement to ensure consistency, warmth, and brand trust.',
    badgeColor: 'purple'
  },
  {
    id: 'comm_tech_architect',
    category: 'communication_preferences',
    memoryType: 'persona',
    title: 'Senior Architect Code Review Persona',
    payload: `Code Review & Technical Persona:
- Persona: Principal Software Architect specializing in TypeScript, React, and distributed cloud systems.
- Focus Areas: Time & space complexity, defensive typing, edge-case resilience, and anti-pattern detection.
- Format: Present findings with [Severity: High/Med/Low], pinpoint exact lines, explain the architectural hazard, and provide the clean idiomatic refactor.`,
    tags: ['persona', 'code_review', 'architect', 'typescript', 'best_practices'],
    testPrompt: 'Review this React useEffect hook that fetches Firestore documents on every render.',
    expectedBehavior: 'Flags the re-render loop with [Severity: High], explains dependency array pitfalls, and provides a memoized useCallback fix.',
    whyItWorks: 'Directs the AI to act with the depth and rigor of a senior engineer rather than a surface-level generic chatbot.',
    badgeColor: 'purple'
  },

  // ================= PROCESS RULES =================
  {
    id: 'proc_safe_deletion',
    category: 'process_rules',
    memoryType: 'instruction',
    title: 'Strict Safe-Deletion & Confirmation Guardrail',
    payload: `OPERATIONAL SAFETY DIRECTIVE:
Whenever requested to perform destructive actions (such as deleting Gmail drafts, batch-removing Google Drive documents, or purging database records):
1. HALT immediately and do NOT execute the deletion.
2. List all affected record IDs, names, and timestamps in a structured review table.
3. Explicitly ask the user for confirmation: "Please confirm you wish to permanently delete these [X] items."`,
    tags: ['safety', 'redlines', 'operations', 'deletion_rule', 'guardrail'],
    testPrompt: 'Delete all draft emails with the subject "Draft Test" right now.',
    expectedBehavior: 'Stops before executing, lists the draft email IDs and subjects in a table, and requests your explicit confirmation.',
    whyItWorks: 'Creates a fail-safe airgap protecting your real Google Workspace and Firestore data from unintended bulk deletions.',
    badgeColor: 'emerald'
  },
  {
    id: 'proc_monday_intel_cron',
    category: 'process_rules',
    memoryType: 'agent_workflow',
    title: 'Weekly AI Intelligence Market Scan Routine',
    payload: `Automated Weekly Briefing Workflow:
1. Search Engine: Execute dsh-tool-web search querying "Google Workspace Gemini enterprise agent advancements past 7 days".
2. Synthesis: DeepThink reasoning pass comparing findings against existing Vantage 2nd Brain memories.
3. Output: 5-bullet executive intelligence brief with direct citation links.
Cron Schedule: Every Monday at 8:00 AM (0 8 * * 1).`,
    tags: ['workflow', 'cron', 'deepseek', 'web_search', 'weekly_brief'],
    testPrompt: 'Run our automated weekly intelligence market scan.',
    expectedBehavior: 'Dispatches the multi-step web search tool, synthesizes latest developments, and formats the 5-bullet brief.',
    whyItWorks: 'Instructs the 2nd Brain on exact multi-step execution procedures and cron scheduling parameters.',
    badgeColor: 'emerald'
  },
  {
    id: 'proc_calendar_protocol',
    category: 'process_rules',
    memoryType: 'instruction',
    title: 'Executive Calendar Scheduling & Double-Booking Check',
    payload: `Calendar Management Process Rule:
- Buffer Time: Always ensure a 15-minute buffer between back-to-back client meetings.
- Double-Booking Check: Before scheduling any new event, query Google Calendar free/busy slots across all attendees.
- High Priority Hours: Never schedule external client calls on Friday afternoons after 2:00 PM unless marked urgent by Mike Ford.`,
    tags: ['process', 'calendar', 'scheduling', 'rules', 'google_workspace'],
    testPrompt: 'Schedule a 45-minute demo with client Acme next Friday at 3:00 PM.',
    expectedBehavior: 'Warns that Friday after 2:00 PM is reserved, and suggests Friday morning or Monday morning alternatives.',
    whyItWorks: 'Guards your personal work boundaries and ensures calendar automation respects your scheduling rules.',
    badgeColor: 'emerald'
  }
];
