import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Sparkles, Copy, CheckCircle2, Volume2, X, Play, Zap } from 'lucide-react';

interface GlobalVoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunWorkflowCommand?: (workflowName: string) => void;
}

export const GlobalVoiceRecorderModal: React.FC<GlobalVoiceRecorderModalProps> = ({ isOpen, onClose, onRunWorkflowCommand }) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [detectedCommand, setDetectedCommand] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setDetectedCommand(null);
      setErrorMessage(null);
      startListening();
    } else {
      stopListening();
    }
    return () => {
      stopListening();
    };
  }, [isOpen]);

  const startListening = () => {
    setErrorMessage(null);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari, or open in a full browser tab.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        
        const fullText = (transcript + ' ' + currentTranscript).trim();
        setTranscript(fullText);

        // Load custom macros from localStorage if available
        let customMacros: Array<{ triggerPhrase: string; workflowName: string; enabled: boolean }> = [];
        try {
          const stored = localStorage.getItem('vantage_voice_macros');
          if (stored) customMacros = JSON.parse(stored);
        } catch (e) {
          // ignore
        }

        const lower = fullText.toLowerCase();
        let matchedWorkflow: string | null = null;

        // First check custom macros
        for (const macro of customMacros) {
          if (macro.enabled && lower.includes(macro.triggerPhrase.toLowerCase())) {
            matchedWorkflow = macro.workflowName;
            break;
          }
        }

        // Fallback default trigger checks
        if (!matchedWorkflow) {
          if (lower.includes('hey copilot run') || lower.includes('copilot execute') || lower.includes('run workflow')) {
            if (lower.includes('competitor') || lower.includes('analysis')) {
              matchedWorkflow = 'Competitor URL Scraper & Calendar Review';
            } else if (lower.includes('status') || lower.includes('update')) {
              matchedWorkflow = 'Weekly Status Update Pipeline';
            } else {
              matchedWorkflow = 'AI Market Research & Executive Brief';
            }
          }
        }

        if (matchedWorkflow) {
          setDetectedCommand(matchedWorkflow);
        }
      };

      recognition.onerror = (e: any) => {
        setIsRecording(false);
        if (e.error === 'not-allowed') {
          setErrorMessage('Microphone access was blocked or denied. Please grant microphone permissions in your browser.');
        }
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setIsRecording(false);
      setErrorMessage('Unable to initialize voice input: ' + (err?.message || 'unknown error'));
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'bg-blue-600 text-white'}`}>
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Global Voice-to-Text & Copilot</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Say &quot;Hey Copilot, run [workflow]&quot; to execute commands</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Live Transcription</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${isRecording ? 'bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
              <span className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-600 animate-ping' : 'bg-slate-400'}`}></span>
              {isRecording ? 'Listening Live...' : 'Paused'}
            </span>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 rounded-xl flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
              <span className="font-bold">Notice:</span>
              <p className="flex-1">{errorMessage}</p>
            </div>
          )}

          <div className="w-full h-32 p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-y-auto font-sans text-xs text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
            {transcript || 'Try saying: "Hey Copilot, run weekly status update"...'}
          </div>

          {detectedCommand && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl flex items-center justify-between animate-bounce">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-semibold text-blue-900 dark:text-blue-200">Trigger Command Detected: &quot;{detectedCommand}&quot;</span>
              </div>
              <button
                onClick={() => {
                  if (onRunWorkflowCommand) onRunWorkflowCommand(detectedCommand);
                  onClose();
                }}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" /> Execute Now
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => {
              if (isRecording) {
                stopListening();
              } else {
                startListening();
              }
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer ${
              isRecording ? 'bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white' : 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'Stop Recording' : 'Resume Recording'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              disabled={!transcript}
              className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition disabled:opacity-50 cursor-pointer"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-500" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
