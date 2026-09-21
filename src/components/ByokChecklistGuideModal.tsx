import React, { useState } from 'react';
import { 
  FileText, 
  X, 
  Copy, 
  Check, 
  Download, 
  Key, 
  ExternalLink, 
  CheckCircle2, 
  Brain, 
  Home, 
  Sparkles, 
  ShieldCheck,
  Building2,
  Mic
} from 'lucide-react';

interface ByokChecklistGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenByokDrawer?: () => void;
}

export const ByokChecklistGuideModal: React.FC<ByokChecklistGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenByokDrawer
}) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(label);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleDownload = () => {
    const text = `# ⚡ 3-Minute BYOK API Key Setup Checklist
Author: Mike Ford (fordmj@gmail.com) • Commercial Retail Ready

1. Google Gemini API Key:
   - URL: https://aistudio.google.com/
   - Free Tier Available (Generous rate limits)
   - Powers 2nd Brain Cognitive Core & Document Ingestion

2. RentCast API Key:
   - URL: https://www.rentcast.io/api
   - 50 Free Queries / month
   - Powers Live Nationwide MLS Comps & Valuation Scoring
   - *Zero-Key Fallback*: USDA 100% eligibility math, 11-digit Census Tract FIPS, and DTI sliders operate 100% free out-of-the-box!

3. DeepSeek API Key (Optional):
   - URL: https://platform.deepseek.com/
   - Powers DeepThink R1 logical deduction & dsh-cron automated scheduler

4. Zero-Key Modules:
   - Google Workspace Dual-Pathway UI: 1-Click OAuth Token Client (no vendor fee)
   - Voice Macro Orchestrator: 100% Local Web Speech API (zero API cost)
`;
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '3_MINUTE_BYOK_API_SETUP_CHECKLIST.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  3-Minute BYOK API Setup Checklist
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  Etsy & Marketplace PDF
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Ready-to-deliver customer onboarding document for Etsy, GitHub & direct retail sales.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer shadow-xs"
              title="Download Checklist as Markdown File"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download (.md)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Hero Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Zero-Markup Wholesale Architecture
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                By connecting direct API keys, your customers get 100% data sovereignty, free tier access, and avoid vendor markup subscription fees.
              </p>
            </div>
            {onOpenByokDrawer && (
              <button
                onClick={() => {
                  onClose();
                  onOpenByokDrawer();
                }}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Open BYOK Drawer</span>
              </button>
            )}
          </div>

          {/* Key 1: Google Gemini */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                    <Brain className="w-4 h-4 text-blue-600" /> Google Gemini API Key
                  </h5>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    100% Free Tier on Google AI Studio
                  </span>
                </div>
              </div>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-lg text-xs font-bold border border-blue-200 dark:border-blue-900 flex items-center gap-1"
              >
                <span>Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
              <li>Log in to <strong>Google AI Studio</strong> with any standard Google account.</li>
              <li>Click <strong>"Get API key"</strong> in the left navigation sidebar.</li>
              <li>Click <strong>"Create API key in new project"</strong> and copy your key (<code className="font-mono text-[11px] text-blue-600">AIzaSy...</code>).</li>
              <li>Paste into the Vantage BYOK Drawer or save to <code className="font-mono text-[11px]">.env</code> as <code className="font-mono text-[11px]">GEMINI_API_KEY</code>.</li>
            </ol>
          </div>

          {/* Key 2: RentCast */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600" /> RentCast API Key (MLS Comps & Comps Valuation)
                  </h5>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    50 Free Property Comps / Month
                  </span>
                </div>
              </div>
              <a
                href="https://www.rentcast.io/api"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 rounded-lg text-xs font-bold border border-emerald-200 dark:border-emerald-900 flex items-center gap-1"
              >
                <span>RentCast Developer Portal</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
              <li>Create a free developer account at <strong>RentCast.io/api</strong>.</li>
              <li>Under API Keys, generate a personal key.</li>
              <li>Paste into the Vantage BYOK Drawer or into <code className="font-mono text-[11px]">RENTCAST_API_KEY</code> in <code className="font-mono text-[11px]">.env</code>.</li>
              <li><strong>Zero-Key Fallback:</strong> Even without a key, your buyers get instant access to verified MLS benchmark properties with live USDA 100% zero-down calculations and $10,000 CRA grant tags!</li>
            </ol>
          </div>

          {/* Key 3: DeepSeek */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" /> DeepSeek API Key (Optional R1 Reasoning)
                  </h5>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-semibold">
                    Optional DeepThink & dsh-cron Autonomous Agent
                  </span>
                </div>
              </div>
              <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1 bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-300 rounded-lg text-xs font-bold border border-purple-200 dark:border-purple-900 flex items-center gap-1"
              >
                <span>DeepSeek Platform</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <ol className="list-decimal list-inside text-xs text-slate-600 dark:text-slate-400 space-y-1 pl-1">
              <li>Sign up at <strong>platform.deepseek.com</strong> and generate an API key (<code className="font-mono text-[11px]">sk-...</code>).</li>
              <li>Paste into the Vantage BYOK Drawer or save as <code className="font-mono text-[11px]">DEEPSEEK_API_KEY</code>.</li>
              <li>Enables DeepThink multi-step research and unattended cron scheduling.</li>
            </ol>
          </div>

          {/* Zero-Key Modules Box */}
          <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/70 dark:bg-slate-800/40 space-y-3">
            <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              100% Zero-Key Modules (Included in Suite)
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> Google Workspace UI
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Connects seamlessly via Google Identity Services Token Client popup. Zero secret keys required!
                </p>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5" /> Voice Macro Orchestrator
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">
                  Executes 100% client-side via native Web Speech API. Completely offline capable with zero API billing.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60">
          <span className="text-xs text-slate-500 dark:text-slate-400">
            Engineered by Mike Ford (<a href="mailto:fordmj@gmail.com" className="text-blue-600 underline">fordmj@gmail.com</a>)
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
          >
            Got It, Close Checklist
          </button>
        </div>
      </div>
    </div>
  );
};
