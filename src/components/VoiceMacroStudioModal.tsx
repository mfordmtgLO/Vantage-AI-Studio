import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mic, 
  Square, 
  Play, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Volume2, 
  Radio, 
  ArrowRight,
  Shield,
  Layers,
  Check,
  Loader2
} from 'lucide-react';

interface VoiceMacroStudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunWorkflowCommand: (workflowName: string) => void;
}

export const VoiceMacroStudioModal: React.FC<VoiceMacroStudioModalProps> = ({
  isOpen,
  onClose,
  onRunWorkflowCommand
}) => {
  const [isListening, setIsListening] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const [decomposedSteps, setDecomposedSteps] = useState<string[]>([]);
  const [isVerbalAirgapActive, setIsVerbalAirgapActive] = useState<boolean>(true);
  const [airgapConfirmed, setAirgapConfirmed] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [selectedMacro, setSelectedMacro] = useState<string>('Check unread emails from Sarah and then draft a meeting request for 2 PM');

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscript(current);
        decomposeCommand(current);
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  if (!isOpen) return null;

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setDecomposedSteps([]);
      setAirgapConfirmed(false);
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (err) {
        console.warn('Could not start recognition directly, simulating listening:', err);
        setIsListening(true);
        setTimeout(() => {
          setTranscript(selectedMacro);
          decomposeCommand(selectedMacro);
          setIsListening(false);
        }, 1800);
      }
    }
  };

  const decomposeCommand = (text: string) => {
    if (!text.trim()) return;
    // Compound Intent Decomposition: split by "and then", "then", "and", "after that"
    const rawSteps = text.split(/\b(?:and then|then|after that|followed by)\b/i);
    const steps = rawSteps.map(s => s.trim()).filter(Boolean);
    setDecomposedSteps(steps.length > 0 ? steps : [text]);

    // Verbal safety prompt
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(`Detected ${steps.length} sequential steps. Say confirm or click dispatch to execute.`);
        msg.rate = 1.0;
        window.speechSynthesis.speak(msg);
        setIsSpeaking(true);
        msg.onend = () => setIsSpeaking(false);
      } catch (e) {}
    }
  };

  const handleSelectPreset = (preset: string) => {
    setSelectedMacro(preset);
    setTranscript(preset);
    decomposeCommand(preset);
  };

  const handleDispatch = () => {
    const finalCmd = transcript || selectedMacro;
    onRunWorkflowCommand(finalCmd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Voice Macro Orchestration & Intent Router
              </h3>
              <p className="text-xs text-slate-500">
                Speech-to-Intent pipeline with Compound Instruction Decomposition and Verbal Safety Airgap.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Waveform & Microphone Controls */}
          <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 text-center space-y-4">
            <div className="flex items-center justify-center gap-1.5 h-12">
              {[40, 75, 100, 60, 30, 85, 95, 45, 80, 60, 90, 40].map((h, i) => (
                <div
                  key={i}
                  className={`w-1.5 rounded-full transition-all duration-150 ${
                    isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-700'
                  }`}
                  style={{ height: isListening ? `${h}%` : '20%' }}
                />
              ))}
            </div>

            <div>
              <button
                type="button"
                onClick={toggleListening}
                className={`p-4 rounded-full text-white shadow-xl transition-all hover:scale-105 cursor-pointer ${
                  isListening 
                    ? 'bg-red-600 animate-pulse ring-8 ring-red-500/20' 
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {isListening ? <Square className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>
            </div>

            <div className="text-xs font-mono text-slate-400">
              {isListening ? 'Listening for speech input...' : 'Click microphone or choose a macro preset below'}
            </div>
          </div>

          {/* Preset Compounds */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Sample Compound Voice Commands:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                'Check unread emails from Sarah and then draft a meeting request for 2 PM',
                'Scan MLS feed for price drops and then draft an alert email in Gmail',
                'Synthesize executive briefing doc and then schedule calendar focus buffer'
              ].map((cmd) => (
                <button
                  key={cmd}
                  type="button"
                  onClick={() => handleSelectPreset(cmd)}
                  className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs text-slate-700 dark:text-slate-300 hover:border-indigo-500 transition cursor-pointer"
                >
                  "{cmd}"
                </button>
              ))}
            </div>
          </div>

          {/* Spoken Transcript & Compound Intent Decomposition */}
          {(transcript || decomposedSteps.length > 0) && (
            <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" /> Decomposed Execution Sequence ({decomposedSteps.length} Steps)
                </span>
                {isSpeaking && (
                  <span className="text-[11px] text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 animate-pulse" /> Verbal Feedback Speaking...
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {decomposedSteps.map((step, idx) => (
                  <div key={idx} className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{step}</span>
                  </div>
                ))}
              </div>

              {/* Verbal Safety Airgap Indicator */}
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-medium">
                  <Shield className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Verbal Safety Airgap: Explicit authorization required before dispatch.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAirgapConfirmed(!airgapConfirmed)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition ${
                    airgapConfirmed ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-amber-300'
                  }`}
                >
                  {airgapConfirmed ? '✓ Airgap Approved' : 'Authorize Dispatch'}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDispatch}
                disabled={isVerbalAirgapActive && !airgapConfirmed}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md shadow-indigo-600/20"
              >
                <Play className="w-4 h-4" />
                <span>Execute Sequential Intent Pipeline</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
