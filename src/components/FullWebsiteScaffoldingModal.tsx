import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  FileCode, 
  CheckCircle2,
  Terminal,
  Cpu
} from 'lucide-react';
import { ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';

interface FullWebsiteScaffoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FullWebsiteScaffoldingModal: React.FC<FullWebsiteScaffoldingModalProps> = ({
  isOpen,
  onClose
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState<boolean>(false);

  if (!isOpen) return null;

  const masterScaffoldPrompt = `# 🏛️ ZERO-SHOT MASTER PROMPT: SCAFFOLD COMPLETE VANTAGE AI WORKSPACE V2 APP

### Instructions for Claude 3.5 Sonnet / ChatGPT-4o / Cursor Composer:
You are an expert full-stack TypeScript architect. Build a complete, responsive React 18+ web application named **"Vantage AI Workspace V2"** by **Mike Ford** (\`${ADMIN_PRIMARY_EMAIL}\`).

---

## 📦 SYSTEM ARCHITECTURE & 4 CORE COMMERCIAL PLUGINS:
1. **Flagship Real Estate & Mortgage GeoMap Engine**:
   - RentCast valuation & investment scoring (0-100), active price reductions.
   - 11-Digit FIPS Census Tract evaluation for USDA 100% Zero-Down financing and $10,000 CRA Low-to-Moderate Income (LMI) down payment grants.
   - Live Lead Buyer DTI Mortgage Affordability Engine with interactive sliders for Gross Monthly Income, Recurring Debts, Down Payment, Interest Rate, calculating Front-End (28%) & Back-End (43%) limits and Max Purchase Price Envelope.
   - 1-Click Zillow URL Geocoder & pin synchronization.
   - Two-Way 2nd Brain Memory Persistence for lead dossiers.
   - Autonomous Cron Agent (\`dsh-cron\`) weekly MLS price audits.

2. **Vantage 2nd Brain Cognitive Core**:
   - Hierarchical Vector Memory with Hybrid, DeepSeek R1, and Gemini semantic search.
   - Interactive Memory Scenarios Testing Sandbox.
   - Guardrails & Boundaries Studio preventing destructive operations.

3. **Google Workspace Dual-Pathway UI Plugin**:
   - Gmail Live Draft Studio with Gemini sentiment synthesis.
   - 15-Minute HIPAA/Focus Meeting Buffer Engine.
   - Drive Explorer & Docs synthesizer.
   - Google Sheets Relational Database & Lead Cleanup Tool with targeted string/domain purging and multi-file lead consolidation.

4. **Voice Macro Orchestration & Intent Router**:
   - Speech-to-Intent pipeline with compound instruction decomposition.
   - Verbal safety airgaps requiring spoken confirmation before external dispatch.
   - Global persistent microphone trigger with execution undo snackbar.

---

## 🛠️ REQUIRED EXPORT STUDIOS:
- **Commercial License & Code Obfuscation Studio**: Domain-locked keys (\`VAN-STA-8F2A1C04-9E3B\`) with SHA256 anti-tamper checksums and Mike Ford copyright notices.
- **Plugin Integration Wizard**: 3-step setup and turnkey \`vantage-init.ts\` generator.
- **Plugin Sales Assistant**: High-converting sales copywriter for Gumroad, GitHub, and Etsy.

Produce clean, fully-typed React components with Tailwind CSS and Lucide icons.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(masterScaffoldPrompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([masterScaffoldPrompt], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vantage-master-scaffold.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Full Website & Chat Scaffolding Generator
              </h3>
              <p className="text-xs text-slate-500">
                1-click zero-shot master prompt (<code className="text-[11px] font-mono">vantage-master-scaffold.md</code>) to regenerate the entire app in 60 seconds with Claude or ChatGPT.
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

        {/* Action Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-indigo-50/50 dark:bg-indigo-950/30 flex items-center justify-between">
          <div className="text-xs text-indigo-900 dark:text-indigo-200 font-medium flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Zero-Shot Master Prompt ready for Claude 3.5 Sonnet, ChatGPT-4o, or Cursor.
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 text-indigo-600 dark:text-indigo-400 rounded-lg text-xs font-bold cursor-pointer transition border border-indigo-200 dark:border-indigo-800 shadow-xs"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? 'Prompt Copied!' : 'Copy Master Prompt'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
            >
              <Download className="w-3.5 h-3.5" /> Download .md
            </button>
          </div>
        </div>

        {/* Content Box */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 font-mono text-xs max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {masterScaffoldPrompt}
          </pre>
        </div>
      </div>
    </div>
  );
};
