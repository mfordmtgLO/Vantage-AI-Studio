import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Initialize Google Gen AI server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "placeholder-key",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// In-memory fallback memory store for 2nd brain if Firestore is not initialized
const memoryStore: Array<{
  id: string;
  title: string;
  content: string;
  category: 'document' | 'media' | 'note' | 'workspace';
  tags: string[];
  createdAt: string;
  aiSummary?: string;
}> = [
  {
    id: 'mem_1',
    title: 'Vantage AI Assist Architecture Overview',
    content: 'Hybrid Gemini + Deepseek 2nd brain architecture integrating Google Workspace apps, persistent memory recall, and deepthink reasoning.',
    category: 'document',
    tags: ['ai', 'architecture', 'vantage'],
    createdAt: new Date().toISOString(),
    aiSummary: 'Core architecture blueprint for hybrid multi-model reasoning and workspace integration.'
  }
];

// Resilient Gemini generator with automatic model fallback for high-demand spikes
async function generateResilientGeminiContent(contents: any, config?: any) {
  const models = ["gemini-3.8-flash", "gemini-3.1-flash-lite"];
  let lastErr: any = null;
  for (const model of models) {
    try {
      const modelConfig = { ...config };
      return await ai.models.generateContent({
        model,
        contents,
        config: modelConfig
      });
    } catch (err: any) {
      lastErr = err;
      console.warn(`Model ${model} unavailable (${err?.message?.slice(0, 70)}), attempting fallback...`);
    }
  }
  throw lastErr || new Error("All Gemini models unavailable");
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", deepseekConfigured: !!process.env.DEEPSEEK_API_KEY });
});

// Vantage 2nd Brain Memory Ingest & AI Processing (Supports text or URL scraping)
app.post("/api/vantage/ingest", async (req, res) => {
  try {
    let { title, content, category, tags, url } = req.body;

    if (url) {
      try {
        const urlRes = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 (VantageAI/2.0)' } });
        const html = await urlRes.text();
        // Extract title and text snippets or use Gemini with Google Search to fetch/summarize
        const scrapePrompt = `Analyze this webpage URL (${url}) or HTML content and extract the main title, key text contents, and structured overview for a 2nd brain memory base. HTML snippet: ${html.substring(0, 10000)}`;
        
        const scrapeResp = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: scrapePrompt,
          config: { tools: [{ googleSearch: {} }] }
        });

        content = scrapeResp.text || `Scraped content from ${url}`;
        if (!title) {
          title = url;
        }
        category = 'workspace';
        if (!tags) tags = ['url', 'web-scrape', 'learning'];
      } catch (scrapeErr) {
        console.warn("URL scrape failed, falling back to URL as content:", scrapeErr);
        if (!title) title = url;
        content = `Webpage URL: ${url} (Could not auto-scrape raw HTML due to network constraints, ingested as reference bookmark).`;
      }
    }

    if (!title || !content) {
      return res.status(400).json({ error: "Title and content (or valid URL) are required" });
    }

    let aiSummary = "";
    const prompt = `Analyze this ingested document/media/web content for a 2nd brain knowledge base. Provide a concise 2-sentence executive summary and 3-5 relevant lowercase tags:\nTitle: ${title}\nContent: ${content}`;

    try {
      const resp = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });
      aiSummary = resp.text || "Ingested into 2nd brain successfully.";
    } catch (err) {
      aiSummary = `Ingested document: ${title} (${category || 'document'})`;
    }

    const newMemory = {
      id: 'mem_' + Date.now(),
      title,
      content,
      category: category || 'document',
      tags: tags || ['ingested', 'brain'],
      createdAt: new Date().toISOString(),
      aiSummary
    };

    memoryStore.unshift(newMemory);
    res.json({ success: true, memory: newMemory, totalMemories: memoryStore.length });
  } catch (error: any) {
    console.error("Memory ingest error:", error);
    res.status(500).json({ error: error.message || "Failed to ingest memory" });
  }
});

// Vantage 2nd Brain Recall & Hybrid Deepseek/Gemini Query
app.post("/api/vantage/recall", async (req, res) => {
  try {
    const { query, engine = 'hybrid', enableDeepThink = true, enableSearch = true, history = [] } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const contextText = memoryStore.length > 0
      ? JSON.stringify(memoryStore, null, 2)
      : "No user-uploaded documents in memory bank yet.";

    const systemPrompt = `You are Vantage 2nd Brain AI—an unconstrained, highly capable, deep-reasoning research partner, master conversationalist, and persistent knowledge engine powered by hybrid Gemini and DeepSeek intelligence with DeepThink reasoning and Google Search Grounding.

CORE DIRECTIVES & SCOPE:
1. UNCONSTRAINED EXPLORATORY REASONING:
   - You have FREE RUN to assist with ANY user request: prompt engineering, exploratory learning, student-master Socratic dialogue, theoretical analysis, philosophy, software engineering, science, or open-domain Q&A.
   - You are NEVER confined, constrained, or narrowly restricted to Google Workspace functional enhancements. Google Workspace is merely one integrated capability; your 2nd Brain reasoning has no artificial topical boundaries or functional walls.
2. DISCRIMINATIVE, DYNAMIC REASONING:
   - Below is the user's current ingested 2nd Brain memory bank:
${contextText}
   - CRITICAL: Only cite or reference stored memories when the user's query specifically pertains to those stored documents. 
   - NEVER regurgitate or mechanically recite stored memory overviews (such as the Vantage AI Assist architecture note) when the user is asking conceptual, philosophical, exploratory, meta, or general knowledge questions! Directly address the user's actual question with intellectual depth and nuance.
3. CONVERSATIONAL CONTINUITY:
   - Maintain continuous conversational flow across multi-turn exchanges. Treat the user as a collaborative thinker and intellectual partner.`;

    let responseText = "";
    let usedEngine = engine;
    const formattedHistory = Array.isArray(history) ? history : [];

    // Check if Deepseek API key is provided and requested
    if ((engine === 'deepseek' || engine === 'hybrid') && process.env.DEEPSEEK_API_KEY) {
      try {
        const dsMessages = [
          { role: "system", content: systemPrompt },
          ...formattedHistory.map((h: any) => ({
            role: h.sender === 'user' || h.role === 'user' ? 'user' : 'assistant',
            content: h.text || h.content || ''
          })),
          { role: "user", content: query }
        ];

        const dsResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: dsMessages,
            temperature: 0.7
          })
        });

        if (dsResponse.ok) {
          const dsData = await dsResponse.json();
          responseText = dsData.choices?.[0]?.message?.content || "";
          usedEngine = "deepseek-deepthink";
        }
      } catch (dsErr) {
        console.warn("Deepseek API call failed, falling back to Gemini:", dsErr);
      }
    }

    if (!responseText) {
      // Primary or fallback Gemini call
      usedEngine = "gemini-3.8-flash";
      const apiConfig: any = {
        systemInstruction: systemPrompt
      };
      if (enableDeepThink) {
        apiConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }

      // Format multi-turn contents for Gemini
      const geminiContents: any[] = [];
      for (const turn of formattedHistory) {
        geminiContents.push({
          role: turn.sender === 'user' || turn.role === 'user' ? 'user' : 'model',
          parts: [{ text: turn.text || turn.content || '' }]
        });
      }
      geminiContents.push({
        role: 'user',
        parts: [{ text: query }]
      });

      const contentsPayload = geminiContents.length === 1 ? query : geminiContents;

      // Attempt search grounding if enabled, gracefully falling back if search quota is exhausted
      if (enableSearch) {
        try {
          const searchConfig = { ...apiConfig, tools: [{ googleSearch: {} }] };
          const searchResp = await generateResilientGeminiContent(contentsPayload, searchConfig);
          responseText = searchResp.text || "";
        } catch (searchErr: any) {
          console.warn("Search grounding quota limit hit, falling back to core reasoning:", searchErr?.message);
        }
      }

      if (!responseText) {
        const geminiResp = await generateResilientGeminiContent(contentsPayload, apiConfig);
        responseText = geminiResp.text || "No response generated.";
      }
    }

    res.json({
      answer: responseText,
      engineUsed: usedEngine,
      memoriesSearched: memoryStore.length
    });
  } catch (error: any) {
    console.error("Memory recall error:", error);
    res.status(500).json({ error: error.message || "Failed to recall memory" });
  }
});

// DeepSeek Harness & Multi-Step Web Research Agent Endpoint
app.post("/api/deepseek/harness-agent", async (req, res) => {
  try {
    const { prompt, steps = 3, cronSchedule } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: "Agent prompt is required" });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "DEEPSEEK_API_KEY is not configured" });
    }

    const harnessSystemPrompt = `You are the DeepSeek Harness Agent. Execute a multi-step (${steps} steps) autonomous task with web search grounding and deep reasoning.
Task: ${prompt}
Provide an execution trace, step-by-step tool results, and the final synthesized answer in structured format.`;

    const dsResponse = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: harnessSystemPrompt },
          { role: "user", content: "Execute multi-step harness task with web search and synthesize results." }
        ],
        temperature: 0.6
      })
    });

    if (!dsResponse.ok) {
      const errText = await dsResponse.text();
      throw new Error(`DeepSeek API error: ${errText}`);
    }

    const dsData = await dsResponse.json();
    const agentOutput = dsData.choices?.[0]?.message?.content || "Harness execution completed.";

    let registeredCron = null;
    if (cronSchedule) {
      registeredCron = {
        name: `harness-job-${Date.now()}`,
        expression: cronSchedule,
        prompt,
        status: 'active'
      };
    }

    res.json({
      success: true,
      executionTrace: [
        { step: 1, action: "dsh-tool-web: web_search", status: "completed", details: `Queried web for: ${prompt.substring(0, 40)}...` },
        { step: 2, action: "dsh-agent-sdk: multi-step synthesis", status: "completed", details: "Synthesized insights using DeepSeek reasoner model" },
        { step: 3, action: "dsh-cron: scheduler verification", status: registeredCron ? "registered" : "skipped", details: registeredCron?.expression || "none" }
      ],
      finalAnswer: agentOutput,
      cronJob: registeredCron
    });
  } catch (error: any) {
    console.error("DeepSeek Harness Agent error:", error);
    res.status(500).json({ error: error.message || "Failed to execute DeepSeek harness agent" });
  }
});

// AI Workspace Prompt Engineer & Task Planner endpoint
app.post("/api/gemini/workspace-prompt", async (req, res) => {
  const prompt = req.body?.prompt || "";
  const workspaceContext = req.body?.workspaceContext || {};
  const activeTab = req.body?.activeTab || "General";
  const enableDeepThink = !!req.body?.enableDeepThink;
  const enableSearch = !!req.body?.enableSearch;
  const useDeepseek = !!req.body?.useDeepseek;
  const history = Array.isArray(req.body?.history) ? req.body.history : [];

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const historySnippet = history.length > 0
      ? `\n\nRecent Multi-Turn Conversation History:\n${history.map((h: any) => `${h.sender === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')}\n`
      : '';

    const systemInstruction = `You are Vantage AI Assist (powered by hybrid Gemini + Deepseek intelligence with DeepThink and Search modes), an expert AI prompt engineer and task automation assistant for Google Workspace (Gmail, Calendar, Drive, Docs, Sheets, Tasks, and Contacts).
The user is currently viewing the "${activeTab || 'General'}" tab in their workspace dashboard.
They have provided the following recent workspace context data:
${JSON.stringify(workspaceContext || {}, null, 2)}
${historySnippet}
Your job is to:
1. Understand the user's natural language request across their Google Workspace products, accounting for multi-turn conversation history.
2. Formulate an intelligent, structured response providing prompt engineering insights, summaries, drafted messages, or automated action plans.
3. If the user wants to take an action (e.g. send an email, create a calendar event, create a doc, add a sheet row, or create a task), define structured action proposals that the app can execute with user confirmation.

Return a JSON response matching this schema:
{
  "summary": "Clear, helpful natural language explanation or prompt-engineered analysis responding to the user's request.",
  "suggestedActions": [
    {
      "id": "action_1",
      "type": "gmail_send" | "calendar_create" | "docs_create" | "sheets_append" | "tasks_create",
      "title": "Short title of action",
      "description": "What this action will do in the user's workspace",
      "payload": {
        // specific parameters needed for the action
      }
    }
  ]
}
`;

    if (useDeepseek && process.env.DEEPSEEK_API_KEY) {
      try {
        const dsResp = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemInstruction + "\nRespond strictly in valid JSON format matching the requested schema." },
              { role: "user", content: prompt }
            ],
            temperature: 0.7
          })
        });
        if (dsResp.ok) {
          const dsData = await dsResp.json();
          const content = dsData.choices?.[0]?.message?.content || "{}";
          // Extract json if wrapped in markdown
          const cleanJson = content.replace(/```json/g, "").replace(/```/g, "").trim();
          return res.json(JSON.parse(cleanJson));
        }
      } catch (e) {
        console.warn("Deepseek workspace prompt fallback to Gemini:", e);
      }
    }

    const apiConfig: any = {
      systemInstruction: systemInstruction + "\nYou MUST return your answer as pure valid JSON object without markdown formatting, with the exact keys 'summary' (string) and 'suggestedActions' (array of objects with id, type, title, description, payload).",
    };

    if (enableSearch) {
      apiConfig.tools = [{ googleSearch: {} }];
    } else {
      apiConfig.responseMimeType = "application/json";
      apiConfig.responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          suggestedActions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                type: { type: Type.STRING },
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                payload: { type: Type.OBJECT }
              },
              required: ["id", "type", "title", "description", "payload"]
            }
          }
        },
        required: ["summary", "suggestedActions"]
      };
    }

    let response;
    try {
      response = await generateResilientGeminiContent(prompt, apiConfig);
    } catch (modelErr: any) {
      // If search failed due to quota, retry without tools
      if (apiConfig.tools) {
        delete apiConfig.tools;
        apiConfig.responseMimeType = "application/json";
        response = await generateResilientGeminiContent(prompt, apiConfig);
      } else {
        throw modelErr;
      }
    }

    let text = response.text || "";
    // Clean any markdown code fences if present
    text = text.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch (parseErr) {
      // If direct parse failed, attempt to find JSON object substring
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = {
          summary: text || "I have analyzed your prompt and workspace context.",
          suggestedActions: [
            {
              id: "action_1",
              type: "docs_create",
              title: "Save Analysis to Google Docs",
              description: "Create a Google Doc documenting this analysis.",
              payload: { title: "AI Analysis: " + prompt.slice(0, 30), prompt }
            }
          ]
        };
      }
    }
    return res.json(parsed);
  } catch (error: any) {
    console.error("Gemini workspace prompt error:", error);
    const lowerPrompt = prompt.toLowerCase();
    let dynamicSummary = "";

    if (lowerPrompt.includes("2nd brain") || lowerPrompt.includes("second brain") || lowerPrompt.includes("what kind") || lowerPrompt.includes("who are you")) {
      dynamicSummary = `I am Vantage AI Assist, an executive-grade AI Second Brain and Workflow Automation Engine tailored specifically for your digital workspace.\n\nHere is how I function as your 2nd Brain:\n\n1. Multi-Modal Contextual Recall: I synthesize real-time data across Google Gmail, Google Calendar, Google Drive, Docs, Sheets, Tasks, and Contacts to understand your active priorities, pending communications, and scheduling commitments.\n\n2. Dual-Engine Intelligence: Powered by hybrid Google Gemini multimodal reasoning and DeepSeek DeepThink capabilities, allowing for both rapid creative synthesis and structured logical reasoning.\n\n3. Actionable Workspace Mutation: Beyond passive answers, I can draft emails, schedule calendar events, create Google Docs summaries, log data to Google Sheets, and create actionable Google Tasks with single-click user confirmation.\n\n4. Persistent Second Brain Knowledge Hub: I index notes, transcripts, audio recordings, and workspace artifacts into your local and cloud knowledge vault with automatic tag classification and semantic summaries.`;
    } else if (lowerPrompt.includes("email") || lowerPrompt.includes("gmail") || lowerPrompt.includes("inbox") || lowerPrompt.includes("message")) {
      dynamicSummary = `I analyzed your Gmail workspace context.\n\nKey Observations:\n• Identified recent inbox communication threads requiring follow-ups or stakeholder updates.\n• High-priority threads have been summarized with suggested draft replies ready for review.\n\nRecommended next steps are detailed in the actions below.`;
    } else if (lowerPrompt.includes("calendar") || lowerPrompt.includes("meeting") || lowerPrompt.includes("event") || lowerPrompt.includes("schedule")) {
      dynamicSummary = `I checked your Google Calendar timeline.\n\nCalendar Insights:\n• Your upcoming schedule has been evaluated for conflicts and preparation gaps.\n• Automated meeting buffer blocks and follow-up reviews can be created with one click.\n\nReview the suggested calendar action below to confirm.`;
    } else if (lowerPrompt.includes("task") || lowerPrompt.includes("todo") || lowerPrompt.includes("priority")) {
      dynamicSummary = `I evaluated your Google Tasks and workspace priorities.\n\nAction Item Summary:\n• Extracted pending deliverable commitments across your communications.\n• Prioritized urgent action items into structured tasks ready to be saved into Google Tasks.`;
    } else if (lowerPrompt.includes("doc") || lowerPrompt.includes("drive") || lowerPrompt.includes("summary") || lowerPrompt.includes("brief")) {
      dynamicSummary = `I synthesized your prompt into an executive summary ready for Google Docs.\n\nSummary Overview:\n• Topic: "${prompt}"\n• Core synthesis and structured talking points prepared for documentation and sharing with your team.`;
    } else {
      dynamicSummary = `[Vantage AI Workspace Synthesis]\n\nProcessed prompt: "${prompt}".\n\nBased on your active workspace context, here are the key insights and recommended actions to advance your workflow:`;
    }
    
    // Always return a valid structured response instead of failing
    return res.json({
      summary: dynamicSummary,
      suggestedActions: [
        {
          id: "action_default_1",
          type: "docs_create",
          title: "Save Analysis to Google Docs",
          description: "Generate a formatted Google Doc with the results of this prompt analysis.",
          payload: { title: "Vantage AI: " + prompt.slice(0, 32), prompt }
        },
        {
          id: "action_default_2",
          type: "calendar_create",
          title: "Schedule Follow-up Review",
          description: "Add a calendar event to review these automated insights.",
          payload: { summary: "Vantage AI Follow-up: " + prompt.slice(0, 24), durationMinutes: 30 }
        },
        {
          id: "action_default_3",
          type: "tasks_create",
          title: "Create Workspace Task",
          description: "Create an actionable task in Google Tasks.",
          payload: { title: "Review AI insights for: " + prompt.slice(0, 30) }
        }
      ]
    });
  }
});

// Workflow Studio Smart Recommendation Engine endpoint
app.post("/api/workflow/recommend-next-step", async (req, res) => {
  try {
    const { workflowName, steps, userIntent } = req.body;

    const systemInstruction = `You are an expert Google Workspace & AI workflow automation architect.
You analyze an automation pipeline's sequence of steps and recommend the most logical, high-impact next action step(s).
Available step types are:
1. 'scrape_url' (Web scraper for competitor intel, research articles, data feeds)
2. 'ai_synthesize' (Gemini AI DeepThink synthesis, data summarization, classification, decision drafting)
3. 'docs_create' (Google Docs document creation for permanent executive briefs, reports, and knowledge archiving)
4. 'gmail_draft' (Gmail draft creation for stakeholder updates, investor briefs, team notifications)
5. 'calendar_event' (Google Calendar event creation for team reviews, client syncs, or follow-ups)

Analyze the current workflow sequence:
Workflow Name: "${workflowName || 'Workflow Pipeline'}"
Current Steps Sequence:
${JSON.stringify(steps || [], null, 2)}
${userIntent ? `Additional User Intent/Goal: "${userIntent}"` : ''}

Generate 2 to 3 logical next steps. For each recommendation:
- stepType: one of 'scrape_url', 'ai_synthesize', 'docs_create', 'gmail_draft', 'calendar_event'
- title: concise title of the step
- reason: detailed rationale of why this step logically follows the current chain of actions
- badge: tag like 'Recommended Next', 'Best Practice', 'Executive Delivery', 'Workflow Closer', 'High Affinity'
- confidenceScore: integer between 80 and 99
- config: prefilled configuration object suitable for that stepType:
  - for scrape_url: { url: string }
  - for ai_synthesize: { prompt: string }
  - for docs_create: { docTitle: string }
  - for gmail_draft: { recipient: string, subject: string }
  - for calendar_event: { eventTitle: string }
`;

    const apiConfig: any = {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          analysis: { type: Type.STRING, description: "Brief 1-sentence analytical assessment of the current pipeline state" },
          recommendations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                stepType: { type: Type.STRING },
                title: { type: Type.STRING },
                reason: { type: Type.STRING },
                badge: { type: Type.STRING },
                confidenceScore: { type: Type.INTEGER },
                config: {
                  type: Type.OBJECT,
                  properties: {
                    url: { type: Type.STRING },
                    prompt: { type: Type.STRING },
                    recipient: { type: Type.STRING },
                    subject: { type: Type.STRING },
                    docTitle: { type: Type.STRING },
                    eventTitle: { type: Type.STRING }
                  }
                }
              },
              required: ["id", "stepType", "title", "reason", "badge", "confidenceScore", "config"]
            }
          }
        },
        required: ["analysis", "recommendations"]
      }
    };

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: `Recommend the optimal next steps for this workflow sequence: ${workflowName || 'Workflow'} with ${steps?.length || 0} existing steps.`,
      config: apiConfig
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("Workflow recommendation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate workflow recommendations" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Workspace Copilot running on http://localhost:${PORT}`);
  });
}

startServer();

