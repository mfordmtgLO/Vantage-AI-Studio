import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Copy, 
  Check, 
  Download, 
  Layers, 
  TrendingUp, 
  Globe, 
  DollarSign,
  CheckCircle2,
  RefreshCw,
  FileText,
  Megaphone,
  BookOpen
} from 'lucide-react';
import { ADMIN_PRIMARY_EMAIL, ADMIN_PRIMARY_NAME } from '../utils/adminAuth';
import { 
  COMMERCIAL_SALES_PITCH_DECK_MARKDOWN,
  COMMERCIAL_PRICING_TIERS,
  SUITE_MODULE_PITCHES,
  AD_CAMPAIGN_ANGLES 
} from '../data/commercialSalesPitchDeck';

interface PluginSalesAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPitchDeck?: () => void;
}

export const PluginSalesAssistantModal: React.FC<PluginSalesAssistantModalProps> = ({
  isOpen,
  onClose,
  onOpenPitchDeck
}) => {
  const [targetPlatform, setTargetPlatform] = useState<'gumroad' | 'github_marketplace' | 'etsy' | 'saas_landing'>('gumroad');
  const [selectedPlugin, setSelectedPlugin] = useState<'pitch_deck_master' | 'all_suite' | 'homebuyer_geo' | 'second_brain' | 'workplace_ui' | 'voice_plugin'>('pitch_deck_master');
  const [suggestedPrice, setSuggestedPrice] = useState<number>(297);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState<boolean>(false);

  if (!isOpen) return null;

  const generateSalesCopy = () => {
    if (selectedPlugin === 'pitch_deck_master') {
      return COMMERCIAL_SALES_PITCH_DECK_MARKDOWN;
    }

    if (selectedPlugin === 'homebuyer_geo') {
      return `# 🏡 Vantage AI Studio-Real Estate GeoMap Plugin Module (Turnkey Commercial License)

### Turn Cold Real Estate Leads into Pre-Approved Buyers in 60 Seconds.
**Created by Mike Ford** (\`${ADMIN_PRIMARY_EMAIL}\`)

---

## ⚡ WHAT YOU GET:
- **Instant RentCast Property Intelligence**: Automated 0–100 valuation scoring, cash-flow yields, and price-cut detection.
- **11-Digit FIPS GeoID Program Qualifier**: Instant checker for **USDA Rural 100% Zero-Down Financing** and **$10,000 CRA Down Payment Assistance Grants** based on Federal Census Tract rules.
- **Live Lead DTI Affordability Engine**: Interactive Front-End (28%) & Back-End (43%) Fannie Mae / FHA debt-to-income math.
- **1-Click Zillow URL Geocoder**: Leads simply paste any Zillow listing to get instant affordability checks and pin synchronizations.
- **Two-Way Vantage AI Studio-2nd Brain Memory Persistence**: Saves buyer preferences, income, and favorites directly to persistent memory vaults.

---

## 🎯 PERFECT FOR:
- Mortgage Originators & Loan Officers wanting to capture purchase leads.
- Real Estate Brokers offering automated first-time homebuyer portals.
- AI SaaS Founders looking to embed property valuation tools.

---

## 🔒 COMMERCIAL LICENSE INCLUDED:
- Single-Domain Commercial License Key (\`VAN-RE-8F2A1C04-9E3B\`)
- AST-Obfuscated Production Wrapper with SHA256 Tamper Verification
- Lifetime updates & prompt scaffolding for Claude 3.5 Sonnet, ChatGPT-4o, and Cursor.

**Suggested Price**: $${suggestedPrice} One-Time Commercial License.
`;
    }

    if (selectedPlugin === 'second_brain') {
      return `# 🧠 Vantage AI Studio-2nd Brain Plugin Module & Memory Harness

### Give Any LLM Unforgettable Memory, Guardrails, and Autonomous Cron Execution.
**Created by Mike Ford** (\`${ADMIN_PRIMARY_EMAIL}\`)

---

## ⚡ KEY FEATURES:
- **Hierarchical Vector Memory**: Search memories using Hybrid, DeepSeek R1, or Gemini semantic recall.
- **Guardrails & Boundaries Studio**: Airgapped validation ensuring AI never executes destructive actions without verbal or visual approval.
- **Memory Scenarios Testing**: Built-in test sandbox to verify memory recall accuracy before production deployment.
- **Dual Interface**: Standalone React Widget + Headless TypeScript Hook (\`useVantageBrainHarness\`).

**Suggested Price**: $${suggestedPrice} One-Time Commercial License.
`;
    }

    return `# 🏛️ Vantage AI Studio-Suite Plugin Module Combo Pack
    
### The Complete Autonomous Workspace Suite: Vantage AI Studio-2nd Brain, Workspace UI, Voice Orchestrator & Real Estate GeoMap.
**Copyright (c) 2026 Mike Ford** (\`${ADMIN_PRIMARY_EMAIL}\`)

---

## 📦 INCLUDED PLUGINS (ALL 4 MODULES IN COMBO PACK):
1. **Vantage AI Studio-Real Estate GeoMap Plugin Module** (RentCast, USDA, CRA Grants, DTI Math)
2. **Vantage AI Studio-2nd Brain Plugin Module** (Vector Memory, DeepSeek Harness, Guardrails)
3. **Vantage AI Studio-Workspace UI Plugin Module** (Gmail Drafts, Calendar Buffer, Drive Explorer, Sheets Relational DB)
4. **Vantage AI Studio-Voice Orchestrator Plugin Module** (Speech-to-Intent, Compound Decomposition, Safety Airgap)

---

## 🚀 COMMERCIAL RIGHTS:
- 100% Turnkey code, OpenAPI schemas, and full website scaffolding.
- Unlimited deployment on your verified client domains.

**Suggested Price**: $${suggestedPrice} One-Time Commercial License.
`;
  };

  const currentCopy = generateSalesCopy();

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCopy);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2500);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCopy], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vantage-${selectedPlugin}-${targetPlatform}-listing.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600/10 text-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Plugin Sales Assistant & Copywriting Studio
              </h3>
              <p className="text-xs text-slate-500">
                Gemini-powered high-converting sales listing generator for Etsy, Gumroad, GitHub, and SaaS Landing Pages.
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

        {/* Master Reference Pitch Deck Bar */}
        <div className="px-5 py-2.5 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-amber-500/10 border-b border-indigo-200/50 dark:border-indigo-900/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="text-slate-700 dark:text-slate-200 font-medium">
              Official Master Reference: <strong className="font-bold text-slate-900 dark:text-slate-100">Commercial Retail Software Suite Sales Pitch Deck</strong>
            </span>
          </div>
          {onOpenPitchDeck && (
            <button
              onClick={() => {
                onClose();
                onOpenPitchDeck();
              }}
              className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
            >
              <BookOpen className="w-3 h-3" />
              <span>Open Master Deck Modal</span>
            </button>
          )}
        </div>

        {/* Form Controls */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Target Marketplace:
            </label>
            <select
              value={targetPlatform}
              onChange={(e) => setTargetPlatform(e.target.value as any)}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
            >
              <option value="gumroad">Gumroad Digital Product</option>
              <option value="github_marketplace">GitHub Marketplace / Release</option>
              <option value="etsy">Etsy Developer Tools Shop</option>
              <option value="saas_landing">SaaS High-Converting Landing Page</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Plugin Product / Asset:
            </label>
            <select
              value={selectedPlugin}
              onChange={(e) => {
                const val = e.target.value as any;
                setSelectedPlugin(val);
                setSuggestedPrice(val === 'pitch_deck_master' ? 499 : val === 'all_suite' ? 997 : val === 'homebuyer_geo' ? 297 : 197);
              }}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium"
            >
              <option value="pitch_deck_master">🚀 Complete Commercial Sales Pitch Deck (Master Reference)</option>
              <option value="all_suite">🏛️ Vantage AI Studio-Suite Plugin Module Combo Pack ($997)</option>
              <option value="homebuyer_geo">🏡 Vantage AI Studio-Real Estate GeoMap Plugin Module ($297)</option>
              <option value="second_brain">🧠 Vantage AI Studio-2nd Brain Plugin Module ($197)</option>
              <option value="workplace_ui">📂 Vantage AI Studio-Workspace UI Plugin Module ($197)</option>
              <option value="voice_plugin">🎙️ Vantage AI Studio-Voice Orchestrator Plugin Module ($149)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              License Price ($ USD):
            </label>
            <input
              type="number"
              value={suggestedPrice}
              onChange={(e) => setSuggestedPrice(Number(e.target.value))}
              className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
            />
          </div>
        </div>

        {/* Copy Preview */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-purple-600" /> Generated Sales Copy (Markdown):
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 rounded-lg text-xs font-bold cursor-pointer transition border border-purple-200 dark:border-purple-800"
              >
                {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied' : 'Copy Listing'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold cursor-pointer transition shadow-xs"
              >
                <Download className="w-3.5 h-3.5" /> Download .md
              </button>
            </div>
          </div>

          <pre className="p-4 bg-slate-900 text-slate-200 rounded-2xl border border-slate-800 font-mono text-xs max-h-72 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {currentCopy}
          </pre>
        </div>
      </div>
    </div>
  );
};
