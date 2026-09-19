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

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", deepseekConfigured: !!process.env.DEEPSEEK_API_KEY });
});

// Vantage 2nd Brain Memory Ingest & AI Processing
app.post("/api/vantage/ingest", async (req, res) => {
  try {
    const { title, content, category, tags } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    let aiSummary = "";
    const prompt = `Analyze this ingested document/media content for a 2nd brain knowledge base. Provide a concise 2-sentence executive summary and 3-5 relevant lowercase tags:\nTitle: ${title}\nContent: ${content}`;

    try {
      const resp = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: prompt
      });
      aiSummary = resp.text || "Ingested into 2nd brain successfully.";
    } catch (err) {
      // Fallback if Gemini quota/error occurs
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
    const { query, engine = 'hybrid', enableDeepThink = true, enableSearch = true } = req.body;
    if (!query) {
      return res.status(400).json({ error: "Query is required" });
    }

    const contextText = JSON.stringify(memoryStore, null, 2);
    const systemPrompt = `You are Vantage AI Assist, a true persistence learning memory recall document and media ingesting AI 2nd brain.
You have access to the user's ingested 2nd brain memories and notes:
${contextText}

Answer the user's recall query comprehensively, citing relevant stored memories, synthesizing insights, and providing actionable recommendations.`;

    let responseText = "";
    let usedEngine = engine;

    // Check if Deepseek API key is provided and requested
    if ((engine === 'deepseek' || engine === 'hybrid') && process.env.DEEPSEEK_API_KEY) {
      try {
        const dsResponse = await fetch("https://api.deepseek.com/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: query }
            ],
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
      // Fallback or primary Gemini call
      usedEngine = "gemini-flash-latest";
      const apiConfig: any = {
        systemInstruction: systemPrompt
      };
      if (enableDeepThink) {
        apiConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
      }
      if (enableSearch) {
        apiConfig.tools = [{ googleSearch: {} }];
      }

      const geminiResp = await ai.models.generateContent({
        model: "gemini-flash-latest",
        contents: query,
        config: apiConfig
      });
      responseText = geminiResp.text || "No insights found.";
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

// AI Workspace Prompt Engineer & Task Planner endpoint
app.post("/api/gemini/workspace-prompt", async (req, res) => {
  try {
    const { prompt, workspaceContext, activeTab, enableDeepThink, enableSearch, useDeepseek } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const systemInstruction = `You are Vantage AI Assist (powered by hybrid Gemini + Deepseek intelligence with DeepThink and Search modes), an expert AI prompt engineer and task automation assistant for Google Workspace (Gmail, Calendar, Drive, Docs, Sheets, Tasks, and Contacts).
The user is currently viewing the "${activeTab || 'General'}" tab in their workspace dashboard.
They have provided the following recent workspace context data:
${JSON.stringify(workspaceContext || {}, null, 2)}

Your job is to:
1. Understand the user's natural language request across their Google Workspace products.
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
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
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
      }
    };

    if (enableDeepThink) {
      apiConfig.thinkingConfig = { thinkingLevel: ThinkingLevel.HIGH };
    }

    if (enableSearch) {
      apiConfig.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: apiConfig
    });

    const text = response.text || "{}";
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini workspace prompt error:", error);
    res.status(500).json({ error: error.message || "Failed to process prompt with Gemini" });
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

