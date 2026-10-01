import React, { useState, useEffect } from 'react';
import { 
  Key, 
  X, 
  Check, 
  Eye, 
  EyeOff, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Trash2, 
  Save, 
  Sparkles,
  Home,
  Brain,
  Info,
  Layers,
  CheckCircle2
} from 'lucide-react';
import { 
  getClientByokKeys, 
  saveClientByokKeys, 
  clearClientByokKeys, 
  UserByokKeys 
} from '../utils/byokStorage';

interface ByokCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChecklistGuide?: () => void;
}

export const ByokCredentialsModal: React.FC<ByokCredentialsModalProps> = ({
  isOpen,
  onClose,
  onOpenChecklistGuide
}) => {
  const [keys, setKeys] = useState<UserByokKeys>({
    geminiApiKey: '',
    deepseekApiKey: ''
  });

  const [showGemini, setShowGemini] = useState(false);
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setKeys(getClientByokKeys());
      setSaveStatus(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveClientByokKeys(keys);
    setSaveStatus('API Credentials saved securely in local storage!');
    setTimeout(() => {
      setSaveStatus(null);
      onClose();
    }, 1400);
  };

  const handleClear = () => {
    if (confirm('Are you sure you want to clear your local custom API keys? The system will revert to server environment variables or demo benchmark fallback mode.')) {
      clearClientByokKeys();
      setKeys({
        geminiApiKey: '',
        deepseekApiKey: ''
      });
      setSaveStatus('Cleared custom keys.');
      setTimeout(() => setSaveStatus(null), 2000);
    }
  };

  const hasAnyKey = !!(keys.geminiApiKey || keys.deepseekApiKey);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 backdrop-blur-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  BYOK API Key Credentials Drawer
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  Client Sovereign
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Bring Your Own Keys for direct wholesale pricing, zero markup & standalone plugin deployments.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Close Drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {saveStatus && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{saveStatus}</span>
            </div>
          )}

          {/* Quickstart Callout */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-900/50 flex items-start gap-3">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">
                100% Client-Side Encrypted Storage
              </p>
              <p>
                Keys entered here stay inside your browser's private storage and are forwarded directly to your proxy endpoints. If left blank, plugins automatically utilize server `.env` variables or demo benchmark MLS mode.
              </p>
              {onOpenChecklistGuide && (
                <button
                  type="button"
                  onClick={onOpenChecklistGuide}
                  className="text-blue-600 dark:text-blue-400 font-bold hover:underline inline-flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <span>Open 3-Minute Setup Checklist & Direct Links</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Field 1: Google Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Google Gemini API Key
                <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  Free Tier Available
                </span>
              </label>
              <a
                href="https://aistudio.google.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Get Free Gemini Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showGemini ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={keys.geminiApiKey}
                onChange={(e) => setKeys(prev => ({ ...prev, geminiApiKey: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showGemini ? 'Hide Key' : 'Show Key'}
              >
                {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Powers 2nd Brain multimodal ingestion, Google Search grounding, prompt engineering, and intelligent drafts.
            </p>
          </div>

          {/* Field 2: Architectural Zero BYOK - Property Listings Synced by Admin Mike Ford */}
          <div className="border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/50 dark:bg-emerald-950/30 rounded-2xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  <Home className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    Property Listings: Centralized First-Time Homebuyer Sync
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                      Zero BYOK Required
                    </span>
                  </h4>
                  <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    Admin Mike Ford (fordmj@gmail.com) is in sole charge of all property data pulls.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Synced Feed
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              This application is <strong>not connected directly to rentcast.com by end-users</strong> and requires <strong>zero API keys</strong> for property data. All MLS listing cards, Oregon Bond grants, USDA 100% eligibility, and valuation comps are imported and kept up to date directly from Mike Ford's <strong>"first-time homebuyer"</strong> AI Studio project.
            </p>
          </div>

          {/* Field 3: DeepSeek API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                DeepSeek API Key (Autonomous Harness Agent)
                <span className="text-[10px] font-normal text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 px-2 py-0.5 rounded-full border border-purple-200 dark:border-purple-800">
                  Optional R1 Reasoning
                </span>
              </label>
              <a
                href="https://platform.deepseek.com/"
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 font-semibold"
              >
                <span>Get DeepSeek Key</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showDeepseek ? 'text' : 'password'}
                placeholder="sk-..."
                value={keys.deepseekApiKey}
                onChange={(e) => setKeys(prev => ({ ...prev, deepseekApiKey: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-purple-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowDeepseek(!showDeepseek)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                title={showDeepseek ? 'Hide Key' : 'Show Key'}
              >
                {showDeepseek ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Powers DeepThink R1 logical deduction and multi-step autonomous tool chaining (`dsh-tool-web` → `dsh-agent-sdk` → `dsh-cron`).
            </p>
          </div>

          {/* Zero-Key Services Notice */}
          <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-1.5">
            <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Zero-Key Modules Included
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" />
                <span><strong>Google Workspace:</strong> Free 1-Click OAuth</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3 h-3 text-emerald-600" />
                <span><strong>Voice Macros:</strong> Native Web Speech API</span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
            <div>
              {hasAnyKey && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 hover:underline font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All Custom Keys</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Credentials</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
