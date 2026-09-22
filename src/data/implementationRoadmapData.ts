/**
 * Prioritized Code Implementation Roadmap Data
 * Author & Copyright: Mike Ford (fordmj@gmail.com)
 * License: Vantage AI Commercial License (SHA256-MF Anti-Tamper Protected)
 */

export interface RoadmapTask {
  id: string;
  phaseId: number;
  phaseName: string;
  module: 'Workspace UI' | '2nd Brain' | 'Voice Macro' | 'GeoMap DPA' | 'Security & Auth' | 'Whitelabel Distribution';
  title: string;
  description: string;
  estimatedHours: number;
  complexity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'completed' | 'in_progress' | 'pending';
  codeSnippetTitle: string;
  codeSnippet: string;
  keyDeliverables: string[];
}

export interface RoadmapPhase {
  id: number;
  name: string;
  subtitle: string;
  objective: string;
  durationWeeks: string;
  badge: string;
  color: string;
}

export const ROADMAP_PHASES: RoadmapPhase[] = [
  {
    id: 1,
    name: "Phase 1: Foundation & Dual-Pathway Google Security",
    subtitle: "Server-Side Proxy, Environment Secrets & Dual Google Auth",
    objective: "Establish zero-browser-exposure backend proxies, process process.env credentials safely, and implement Dual-Pathway Authentication (Personal GIS + Enterprise OAuth 2.0).",
    durationWeeks: "Week 1",
    badge: "Security & Infrastructure",
    color: "from-blue-600 to-cyan-600"
  },
  {
    id: 2,
    name: "Phase 2: Core Workspace UI Engine & REST Handlers",
    subtitle: "Gmail Drafts, Calendar Buffers, Drive & Sheets Relational Cleaner",
    objective: "Build turnkey Express/Node API proxy routes for Gmail Draft creation, Calendar 15-minute HIPAA focus buffers, Drive synthesis, and Google Sheets domain purge tool.",
    durationWeeks: "Week 2",
    badge: "Core Workspace Engine",
    color: "from-emerald-600 to-teal-600"
  },
  {
    id: 3,
    name: "Phase 3: 2nd Brain Cognitive Memory Vector Store",
    subtitle: "Vector Memory, Zero-Prompt Context Injector & Temporal Decay",
    objective: "Implement client memory indexing, cosine vector similarity search, automatic memory decay, and strict PII airgap guardrails for zero-prompt LLM context enhancement.",
    durationWeeks: "Week 3",
    badge: "Cognitive Memory Engine",
    color: "from-purple-600 to-indigo-600"
  },
  {
    id: 4,
    name: "Phase 4: Voice Orchestrator & Compound Macro Engine",
    subtitle: "Web Speech Intent Decomposer & Multi-App Workflow Scheduler",
    objective: "Build speech-to-intent speech parser, compound macro runner across Gmail/Calendar/Sheets, and automated background workflow scheduler.",
    durationWeeks: "Week 4",
    badge: "Voice & Automation",
    color: "from-rose-600 to-pink-600"
  },
  {
    id: 5,
    name: "Phase 5: Commercial Whitelabel Distribution & Obfuscation",
    subtitle: "AST Obfuscation, SHA256 Anti-Tamper & Drop-In React Widgets",
    objective: "Package the suite into drop-in React components (`<VantageWorkspaceUI />`), standalone script embeds (`vantage-suite.js`), and SHA256-MF license signature validation.",
    durationWeeks: "Week 5",
    badge: "Monetization & Whitelabel",
    color: "from-amber-500 to-orange-600"
  }
];

export const ROADMAP_TASKS: RoadmapTask[] = [
  // PHASE 1
  {
    id: 'task-1-1',
    phaseId: 1,
    phaseName: 'Phase 1: Security & Auth',
    module: 'Security & Auth',
    title: 'Initialize Express Proxy Server with Zero Browser API Exposure',
    description: 'Set up Express server with CORS controls, rate limiting, and lazy SDK initialization to ensure process.env.GEMINI_API_KEY and process.env.GOOGLE_CLIENT_SECRET are never sent to client browsers.',
    estimatedHours: 6,
    complexity: 'High',
    status: 'completed',
    codeSnippetTitle: 'server.ts - Express Proxy Scaffolding',
    codeSnippet: `import express from 'express';
import cors from 'cors';

const app = express();
app.use(express.json());
app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(',') || '*' }));

// Server-Side Lazy Gemini & OAuth Client Initialization
export function getGeminiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error('GEMINI_API_KEY missing from environment.');
  return key;
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});`,
    keyDeliverables: [
      'Server-side Express proxy setup on port 3000',
      'Lazy loading helper functions for Gemini and Google APIs',
      'CORS security middleware and rate limiter'
    ]
  },
  {
    id: 'task-1-2',
    phaseId: 1,
    phaseName: 'Phase 1: Security & Auth',
    module: 'Security & Auth',
    title: 'Implement Dual-Pathway Google Authentication (GIS + Enterprise OAuth)',
    description: 'Build client-side Google Identity Services (Pathway A) token client and server-side OAuth bearer token validator (Pathway B) for domain-wide enterprise access.',
    estimatedHours: 8,
    complexity: 'Critical',
    status: 'completed',
    codeSnippetTitle: 'useGoogleAuth.ts - Dual-Pathway Hook',
    codeSnippet: `import { useState, useEffect } from 'react';

export function useDualPathwayAuth() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authPathway, setAuthPathway] = useState<'pathway_a' | 'pathway_b' | null>(null);

  // Pathway A: Instant GIS Client-side OAuth token acquisition
  const initGsiClient = () => {
    // @ts-ignore
    const client = google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/gmail.compose https://www.googleapis.com/auth/calendar.events',
      callback: (res: any) => {
        if (res.access_token) {
          setAccessToken(res.access_token);
          setAuthPathway('pathway_a');
        }
      }
    });
    client.requestAccessToken();
  };

  return { accessToken, authPathway, initGsiClient };
}`,
    keyDeliverables: [
      'Google Identity Services token client integration',
      'Bearer token pass-through in HTTP Authorization headers',
      'Stateful auth pathway toggle with session renewal'
    ]
  },

  // PHASE 2
  {
    id: 'task-2-1',
    phaseId: 2,
    phaseName: 'Phase 2: Core Workspace UI Engine',
    module: 'Workspace UI',
    title: 'Build Live Gmail Draft Studio Endpoint & REST Bridge',
    description: 'Construct `/api/gmail/draft` endpoint that receives email intent, generates formatted body copy via Gemini API server-side, and writes directly to Gmail Drafts API.',
    estimatedHours: 10,
    complexity: 'High',
    status: 'completed',
    codeSnippetTitle: 'server.ts - /api/gmail/draft REST Route',
    codeSnippet: `app.post('/api/gmail/draft', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: 'Missing bearer token' });

    const { recipient, subject, body } = req.body;
    const rawMessage = createMimeEmail({ to: recipient, subject, body });
    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    const draftRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/drafts', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ message: { raw: encodedMessage } })
    });

    const data = await draftRes.json();
    res.json({ success: true, draftId: data.id, message: 'Draft created in Gmail!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});`,
    keyDeliverables: [
      'RFC 2822 MIME email encoder for UTF-8 compatibility',
      'Gmail REST API v1 Drafts creation integration',
      'UI preview card with 1-click open in Gmail web'
    ]
  },
  {
    id: 'task-2-2',
    phaseId: 2,
    phaseName: 'Phase 2: Core Workspace UI Engine',
    module: 'Workspace UI',
    title: 'Develop Calendar 15-Minute Focus & HIPAA Buffer Injector',
    description: 'Create automated scheduling service that scans Google Calendar events and inserts non-overlapping 15-minute transitional buffers around confidential meetings.',
    estimatedHours: 8,
    complexity: 'Medium',
    status: 'completed',
    codeSnippetTitle: 'calendarBufferService.ts - Focus Buffer Injector',
    codeSnippet: `export async function inject15MinCalendarBuffer(accessToken: string, eventId: string, eventStart: string) {
  const bufferStart = new Date(new Date(eventStart).getTime() - 15 * 60 * 1000).toISOString();
  const bufferEnd = eventStart;

  const bufferEvent = {
    summary: '🛡️ 15-Min Focus & Confidentiality Buffer',
    description: 'Automated transitional buffer injected by Vantage Workspace UI.',
    start: { dateTime: bufferStart },
    end: { dateTime: bufferEnd },
    colorId: '8' // Graphite gray
  };

  return fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: { 'Authorization': \`Bearer \${accessToken}\`, 'Content-Type': 'application/json' },
    body: JSON.stringify(bufferEvent)
  });
}`,
    keyDeliverables: [
      'Calendar REST API v3 event creation module',
      'Buffer collision prevention algorithm',
      'HIPAA / Privacy boundary toggle'
    ]
  },
  {
    id: 'task-2-3',
    phaseId: 2,
    phaseName: 'Phase 2: Core Workspace UI Engine',
    module: 'Workspace UI',
    title: 'Build Google Sheets Relational Database & String Purge Engine',
    description: 'Implement SQL-like query interface over Google Sheets API and a multi-row targeted string/domain filter to purge bad lead records across all columns.',
    estimatedHours: 12,
    complexity: 'High',
    status: 'completed',
    codeSnippetTitle: 'sheetsPurgeTool.ts - Domain & String Filter',
    codeSnippet: `export function purgeRowsByDomain(rows: string[][], targetDomain: string): { cleanedRows: string[][]; purgedCount: number } {
  const cleanDomain = targetDomain.toLowerCase().replace('@', '').trim();
  let purgedCount = 0;

  const cleanedRows = rows.filter(row => {
    const isMatch = row.some(cell => cell.toLowerCase().includes(cleanDomain));
    if (isMatch) purgedCount++;
    return !isMatch;
  });

  return { cleanedRows, purgedCount };
}`,
    keyDeliverables: [
      'Google Sheets v4 API batchUpdate integration',
      'Targeted string/domain purge engine',
      'Multi-file CSV/XLSX consolidation pipeline'
    ]
  },

  // PHASE 3
  {
    id: 'task-3-1',
    phaseId: 3,
    phaseName: 'Phase 3: 2nd Brain Cognitive Memory',
    module: '2nd Brain',
    title: 'Construct Vector Memory Indexer & Cosine Similarity Engine',
    description: 'Build local and cloud-based vector indexing pipeline with TF-IDF / Gemini embedding calculation, cosine similarity scoring, and top-K context retrieval.',
    estimatedHours: 12,
    complexity: 'High',
    status: 'completed',
    codeSnippetTitle: 'secondBrainVector.ts - Cosine Similarity Search',
    codeSnippet: `export function searchMemoriesByVector(queryVector: number[], memories: VectorMemory[], topK = 5) {
  return memories
    .map(mem => ({
      memory: mem,
      similarity: cosineSimilarity(queryVector, mem.vector)
    }))
    .filter(item => item.similarity >= 0.70)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK)
    .map(item => item.memory);
}

function cosineSimilarity(vecA: number[], vecB: number[]) {
  const dot = vecA.reduce((sum, val, i) => sum + val * (vecB[i] || 0), 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val * val, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}`,
    keyDeliverables: [
      'Vector memory indexing & LocalStorage / Firestore sync',
      'Cosine similarity ranking with threshold filtering',
      'Zero-prompt context injection into LLM system prompts'
    ]
  },
  {
    id: 'task-3-2',
    phaseId: 3,
    phaseName: 'Phase 3: 2nd Brain Cognitive Memory',
    module: '2nd Brain',
    title: 'Implement PII Airgap Redactor & Temporal Memory Decay',
    description: 'Add client-side Regex redactor for SSN, credit cards, and confidential emails, alongside temporal decay algorithms that downweight stale memories over time.',
    estimatedHours: 8,
    complexity: 'Medium',
    status: 'completed',
    codeSnippetTitle: 'memoryGuardrails.ts - PII Redactor',
    codeSnippet: `export function redactPii(text: string): string {
  return text
    .replace(/\\b\\d{3}-\\d{2}-\\d{4}\\b/g, '[REDACTED SSN]')
    .replace(/\\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14})\\b/g, '[REDACTED CREDIT CARD]')
    .replace(/\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b/g, '[REDACTED EMAIL]');
}`,
    keyDeliverables: [
      'Client-side PII sanitization pre-flight check',
      'Exponential temporal decay weighting function',
      'Airgapped compliance audit logger'
    ]
  },

  // PHASE 4
  {
    id: 'task-4-1',
    phaseId: 4,
    phaseName: 'Phase 4: Voice & Automation',
    module: 'Voice Macro',
    title: 'Build Web Speech Intent Decomposer & Speech-to-Intent Engine',
    description: 'Integrate Web Speech API recognition listener with server-side LLM intent parser to convert raw voice macros into structured multi-action JSON commands.',
    estimatedHours: 10,
    complexity: 'High',
    status: 'completed',
    codeSnippetTitle: 'voiceIntentParser.ts - Speech Decomposer',
    codeSnippet: `export async function parseVoiceMacroToIntent(transcript: string): Promise<{ actions: Array<{ app: string; action: string; params: any }> }> {
  const prompt = \`Decompose the following spoken macro into structured executable commands for Gmail, Calendar, Sheets, or 2nd Brain:
Transcript: "\${transcript}"
Output valid JSON only matching schema { actions: [{ app, action, params }] }\`;

  const response = await fetch('/api/gemini/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, responseSchema: 'json' })
  });
  return response.json();
}`,
    keyDeliverables: [
      'Web Speech API speech recognition listener hook',
      'Structured action decomposition engine',
      'Sequential multi-action executor with visual feedback'
    ]
  },

  // PHASE 5
  {
    id: 'task-5-1',
    phaseId: 5,
    phaseName: 'Phase 5: Monetization & Whitelabel',
    module: 'Whitelabel Distribution',
    title: 'Package Drop-In React Widget & Standalone Script Scaffolding',
    description: 'Export unbundled React component `<VantageWorkspaceUI />` and standalone `<script src="https://vantage-ai.com/embed.js">` script wrapper for 1-click customer embedding.',
    estimatedHours: 8,
    complexity: 'Medium',
    status: 'completed',
    codeSnippetTitle: 'embed.ts - Standalone Script Wrapper',
    codeSnippet: `export class VantageWorkspaceEmbed {
  static init(config: { apiKey: string; domain: string; containerId: string }) {
    const container = document.getElementById(config.containerId);
    if (!container) throw new Error('Container element not found');

    const iframe = document.createElement('iframe');
    iframe.src = \`https://ais-dev-ytqtpwssj6gdvjvqbsrbyo-427099073161.us-east5.run.app?embed=true&domain=\${config.domain}\`;
    iframe.style.width = '100%';
    iframe.style.height = '750px';
    iframe.style.border = 'none';
    container.appendChild(iframe);
  }
}`,
    keyDeliverables: [
      'Drop-in `<VantageWorkspaceUI />` React export',
      'Standalone iframe/JS embed loader',
      'SHA256-MF signature license check'
    ]
  }
];

export const SYSTEM_ARCHITECTURE_TOPOLOGY = {
  title: "Vantage AI Workspace Suite - System Architecture Topology",
  nodes: [
    { id: "client_ui", label: "Client Browser / Embedded Widget", category: "Frontend", desc: "React 18 + Tailwind CSS single-page component rendering UI controls." },
    { id: "gsi_auth", label: "Google Identity Services (Pathway A)", category: "Auth", desc: "Client-side OAuth token client for instant 1-click personal auth." },
    { id: "express_proxy", label: "Server-Side Express API Proxy", category: "Backend", desc: "Binds port 3000. Holds secrets, proxies requests, enforces CORS." },
    { id: "gemini_sdk", label: "Gemini 2.5 / 3.8 LLM Engine", category: "AI Logic", desc: "Server-side @google/genai SDK for draft generation & intent parsing." },
    { id: "vector_brain", label: "2nd Brain Cognitive Memory", category: "State", desc: "Vector memory store with cosine similarity, decay & PII redactor." },
    { id: "workspace_rest", label: "Google Workspace REST APIs", category: "Integration", desc: "Direct REST calls to Gmail v1, Calendar v3, Sheets v4, Drive v3." },
    { id: "licensing_engine", label: "SHA256-MF License Validator", category: "Security", desc: "Domain locking, tamper detection & commercial license authorization." }
  ]
};
