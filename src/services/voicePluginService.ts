import { PluginPackagingConfig } from './pluginArchetypeService';

/**
 * Generates the master LLM Build Mode Prompt for the Vantage AI Studio-Voice Orchestrator Plugin Module
 */
export function generateVoicePluginPrompt(config: PluginPackagingConfig): string {
  return `<!-- ========================================================================= -->
<!-- 🎙️ VANTAGE AI STUDIO-VOICE ORCHESTRATOR PLUGIN MODULE -->
<!-- Transferable Speech-to-Action Voice Macro Engine Architecture -->
<!-- Inject this prompt into Claude / ChatGPT / Gemini / DeepSeek / Cursor -->
<!-- ========================================================================= -->

<instructions_for_ai_builder>
You are an expert voice AI and audio systems architect. You must build, containerize, and integrate
the complete "${config.pluginName}" transferable plugin archetype into the target website or application.

This plugin delivers a plug-and-play **Speech-to-Action Voice Assistant & Macro Engine** featuring:
1. Speech-to-Action Macro Matcher: Trigger phrases ("Hey Copilot, run weekly status update", "Good morning briefing") matched to automated workflows.
2. Embeddable Floating Voice Widget (\`<${config.pluginName} />\`) with animated audio waveform visualizer and reactive listening feedback.
3. Headless Voice Hook (\`useVantageVoice\`) with browser Web Speech API & MediaRecorder streaming with Gemini audio fallback.
4. Voice Macro Management Studio for users to create, test, and toggle custom trigger phrases and target workflows.
5. Backend Audio Processing Router (\`${config.apiBasePath}\`) for Whisper transcription and Gemini multimodal voice synthesis.
</instructions_for_ai_builder>

<plugin_configuration_metadata>
{
  "pluginName": "${config.pluginName}",
  "apiBasePath": "${config.apiBasePath}",
  "targetFramework": "${config.targetFramework}",
  "persistenceAdapter": "${config.persistenceAdapter}",
  "hotwords": ["Hey Copilot", "Good morning briefing", "Execute workflow"],
  "audioVisualizer": true,
  "ttsFeedback": true
}
</plugin_configuration_metadata>

<system_architecture>
The Voice Plugin captures speech, detects matching macro patterns, and dispatches actions:

┌────────────────────────────────────────────────────────────────────────┐
│                        TARGET HOST APPLICATION                         │
│                                                                        │
│  ┌─────────────────────────────┐    ┌────────────────────────────────┐ │
│  │ <${config.pluginName} />    │    │  const { isListening, transcript│
│  │ Floating Voice Pill & Modal │    │  } = useVantageVoice()         │ │
│  └──────────────┬──────────────┘    └───────────────┬────────────────┘ │
└─────────────────┼───────────────────────────────────┼──────────────────┘
                  │         Audio Stream / Events     │
┌─────────────────▼───────────────────────────────────▼──────────────────┐
│             STANDALONE BACKEND ROUTER (${config.apiBasePath})                  │
│                                                                        │
│  ┌───────────────────────┐  ┌──────────────────────┐  ┌─────────────┐  │
│  │ Speech-to-Text        │  │ Macro Dispatcher     │  │ Voice TTS   │  │
│  │ (/transcribe)         │  │ (/macros/execute)    │  │ (/synthesize│  │
│  └───────────────────────┘  └──────────────────────┘  └─────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
</system_architecture>

<implementation_specifications>
### 1. STANDALONE REACT COMPONENT (\`<${config.pluginName} />\`):
Include:
- Floating microphone action button with pulse animation when listening.
- Live audio waveform canvas or bar equalizer visualizer.
- Real-time speech transcript caption popover.
- Macro Manager modal displaying active triggers, target workflows, and an 'Add Trigger' form.
- Audio execution snackbar confirming voice action dispatch.

### 2. HEADLESS HOOK (\`useVantageVoice\`):
Provide state management for:
- \`isListening\`: boolean flag.
- \`transcript\`: live speech recognition text.
- \`startListening()\`: initiates microphone capture.
- \`stopListening()\`: stops capture and evaluates triggers.
- \`macros\`: registered voice trigger phrases.

### 3. BACKEND ROUTER (\`${config.apiBasePath}\`):
Expose:
- \`POST ${config.apiBasePath}/transcribe\`: Processes raw audio binary.
- \`POST ${config.apiBasePath}/macros/execute\`: Matches transcribed phrase to registered workflow.
- \`POST ${config.apiBasePath}/synthesize\`: Generates speech audio response.
</implementation_specifications>
<!-- ========================================================================= -->`;
}

/**
 * Generates Standalone React Component Code for VantageVoiceAssistantPlugin
 */
export function generateVoicePluginReactCode(config: PluginPackagingConfig): string {
  return `import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Volume2, 
  Play, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Settings, 
  X, 
  Radio, 
  Command, 
  ArrowRight
} from 'lucide-react';

export interface VoiceMacroItem {
  id: string;
  triggerPhrase: string;
  workflowName: string;
  enabled: boolean;
}

export interface VantageVoiceProps {
  apiBasePath?: string;
  initialMacros?: VoiceMacroItem[];
  onExecuteWorkflow?: (workflowName: string) => void;
  position?: 'bottom-right' | 'bottom-left' | 'inline';
  className?: string;
}

export const ${config.pluginName}: React.FC<VantageVoiceProps> = ({
  apiBasePath = '${config.apiBasePath}',
  initialMacros = [
    { id: 'm1', triggerPhrase: 'Hey Copilot, run weekly status update', workflowName: 'AI Market Research & Executive Brief', enabled: true },
    { id: 'm2', triggerPhrase: 'Good morning briefing', workflowName: 'Competitor Intelligence Digest', enabled: true },
    { id: 'm3', triggerPhrase: 'Clean up stale leads', workflowName: 'Lead Cleanup & Contacts Enrichment', enabled: true }
  ],
  onExecuteWorkflow,
  position = 'bottom-right',
  className = ''
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [macros, setMacros] = useState<VoiceMacroItem[]>(initialMacros);
  const [showMacroModal, setShowMacroModal] = useState(false);
  const [newTrigger, setNewTrigger] = useState('');
  const [newWorkflow, setNewWorkflow] = useState('AI Market Research & Executive Brief');
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);

  // Simulation of speech recognition for demo/standalone preview
  useEffect(() => {
    let timeout: any;
    if (isListening) {
      setTranscript('Listening for voice triggers...');
      timeout = setTimeout(() => {
        const sampleTrigger = 'Hey Copilot, run weekly status update';
        setTranscript(\`Recognized: "\${sampleTrigger}"\`);
        handleTriggerMatched(sampleTrigger);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [isListening]);

  const handleToggleListening = () => {
    if (isListening) {
      setIsListening(false);
      setTranscript('');
    } else {
      setIsListening(true);
    }
  };

  const handleTriggerMatched = (phrase: string) => {
    const matched = macros.find(m => m.enabled && phrase.toLowerCase().includes(m.triggerPhrase.toLowerCase()));
    if (matched) {
      setLastExecuted(matched.workflowName);
      if (onExecuteWorkflow) onExecuteWorkflow(matched.workflowName);
      setTimeout(() => {
        setIsListening(false);
        setTranscript('');
      }, 1500);
      setTimeout(() => setLastExecuted(null), 5000);
    }
  };

  const handleAddMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrigger.trim()) return;
    const item: VoiceMacroItem = {
      id: 'macro_' + Date.now(),
      triggerPhrase: newTrigger.trim(),
      workflowName: newWorkflow,
      enabled: true
    };
    setMacros([...macros, item]);
    setNewTrigger('');
  };

  const handleDeleteMacro = (id: string) => {
    setMacros(macros.filter(m => m.id !== id));
  };

  return (
    <div className={\`\${position !== 'inline' ? 'fixed bottom-6 right-6 z-40' : ''} \${className}\`}>
      {/* Voice Notification Toast */}
      {lastExecuted && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl border border-indigo-500/30 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">Voice Macro Dispatched</div>
            <div className="text-xs font-semibold text-emerald-300">{lastExecuted}</div>
          </div>
        </div>
      )}

      {/* Floating Control Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 flex items-center gap-3">
        <button
          onClick={handleToggleListening}
          className={\`w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-all shadow-lg cursor-pointer \${
            isListening 
              ? 'bg-rose-500 animate-pulse ring-4 ring-rose-500/30' 
              : 'bg-indigo-600 hover:bg-indigo-500'
          }\`}
          title={isListening ? 'Stop Listening' : 'Activate Voice Assistant'}
        >
          {isListening ? <Radio className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
        </button>

        <div className="min-w-40 max-w-64">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" /> ${config.pluginName}
            </span>
            <button
              onClick={() => setShowMacroModal(true)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
              title="Configure Voice Macros"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
            {isListening ? transcript : \`\${macros.filter(m => m.enabled).length} active voice macros\`}
          </p>

          {isListening && (
            <div className="flex items-center gap-1 mt-1.5 h-2">
              <span className="w-1.5 h-2 bg-indigo-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-3.5 bg-indigo-500 rounded-full animate-bounce delay-75" />
              <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce delay-150" />
              <span className="w-1.5 h-3 bg-indigo-500 rounded-full animate-bounce delay-200" />
            </div>
          )}
        </div>
      </div>

      {/* Macro Studio Modal */}
      {showMacroModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                  <Command className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Voice Macro Manager</h4>
                  <p className="text-xs text-slate-400">Map custom speech phrases to automated AI workflows.</p>
                </div>
              </div>
              <button
                onClick={() => setShowMacroModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {macros.map(m => (
                <div key={m.id} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-3">
                  <div className="space-y-0.5 min-w-0">
                    <div className="text-xs font-bold text-indigo-600 dark:text-indigo-400 truncate">"{m.triggerPhrase}"</div>
                    <div className="text-[11px] text-slate-500 truncate flex items-center gap-1">
                      <ArrowRight className="w-3 h-3 text-slate-400" /> {m.workflowName}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteMacro(m.id)}
                    className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Form */}
            <form onSubmit={handleAddMacro} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="font-semibold text-xs text-slate-700 dark:text-slate-300">Add New Trigger Phrase</div>
              <input
                type="text"
                placeholder='e.g. "Hey Copilot, summarize today'\''s meetings"'
                value={newTrigger}
                onChange={(e) => setNewTrigger(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Add Voice Macro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};`;
}

/**
 * Generates Headless React Hook code for Voice Plugin
 */
export function generateVoicePluginHookCode(config: PluginPackagingConfig): string {
  return `import { useState, useCallback, useRef } from 'react';

export function useVantageVoice(options?: { apiBasePath?: string }) {
  const apiBase = options?.apiBasePath || '${config.apiBasePath}';
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');

  const startListening = useCallback(() => {
    setIsListening(true);
    // Initialize Web Speech API or MediaRecorder stream
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const executeMacro = useCallback(async (phrase: string) => {
    const res = await fetch(\`\${apiBase}/macros/execute\`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phrase })
    });
    return res.json();
  }, [apiBase]);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    executeMacro
  };
}`;
}

/**
 * Generates Backend Router Code for Voice Plugin
 */
export function generateVoicePluginBackendCode(config: PluginPackagingConfig): string {
  return `import express from 'express';

export const vantageVoiceRouter = express.Router();

// 1. Process Voice Macro Trigger
vantageVoiceRouter.post('/macros/execute', async (req, res) => {
  try {
    const { phrase } = req.body;
    if (!phrase) return res.status(400).json({ error: 'Phrase is required' });

    res.json({
      success: true,
      phrase,
      matched: true,
      executedAt: new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Transcribe Audio
vantageVoiceRouter.post('/transcribe', async (req, res) => {
  res.json({
    text: 'Transcribed speech text from audio buffer',
    confidence: 0.98
  });
});
`;
}

/**
 * Generates Universal Script Embed Code for Voice Plugin
 */
export function generateVoicePluginScriptEmbed(config: PluginPackagingConfig): string {
  return `<!-- Vantage AI Voice Plugin Universal Embed Snippet -->
<script src="https://cdn.vantageai.app/v2/voice-assistant-widget.js"></script>
<script>
  VantageVoice.init({
    pluginName: '${config.pluginName}',
    apiBasePath: '${config.apiBasePath}',
    position: 'bottom-right'
  });
</script>`;
}
