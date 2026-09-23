import React, { useState } from 'react';
import { 
  X, Copy, Check, ExternalLink, Smartphone, Share2, QrCode, 
  MessageSquare, Mail, Home, Building2, Brain, Mic, Sparkles, 
  ShieldCheck, Globe, CheckCircle2, ChevronDown, ChevronUp, Link as LinkIcon
} from 'lucide-react';
import { 
  LEAD_MOBILE_PLUGIN_MODULES, 
  SHARED_BASE_URL, 
  DEV_BASE_URL, 
  buildLeadPluginUrl, 
  LeadPluginModuleUrlInfo 
} from '../data/leadMobilePluginUrls';

interface LeadMobileShareLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPluginId?: string;
}

export const LeadMobileShareLinksModal: React.FC<LeadMobileShareLinksModalProps> = ({
  isOpen,
  onClose,
  initialPluginId
}) => {
  const [selectedBaseUrlType, setSelectedBaseUrlType] = useState<'current' | 'dev' | 'custom'>('current');
  const [customBaseUrl, setCustomBaseUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('vantage_custom_cloudrun_url') || '';
    } catch {
      return '';
    }
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [expandedQrId, setExpandedQrId] = useState<string | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<string>(initialPluginId || 'all');

  if (!isOpen) return null;

  const liveOrigin = typeof window !== 'undefined' && window.location && window.location.origin
    ? window.location.origin
    : DEV_BASE_URL;

  const currentBaseUrl = selectedBaseUrlType === 'current' 
    ? liveOrigin 
    : selectedBaseUrlType === 'dev' 
    ? DEV_BASE_URL 
    : (customBaseUrl.trim() || liveOrigin);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2500);
  };


  const getIcon = (iconName: LeadPluginModuleUrlInfo['iconName']) => {
    switch (iconName) {
      case 'Home': return Home;
      case 'Building2': return Building2;
      case 'Brain': return Brain;
      case 'Mic': return Mic;
      case 'Sparkles': return Sparkles;
      default: return Sparkles;
    }
  };

  const filteredModules = activeTabFilter === 'all'
    ? LEAD_MOBILE_PLUGIN_MODULES
    : LEAD_MOBILE_PLUGIN_MODULES.filter(m => m.id === activeTabFilter);

  // Simple clean SVG QR Code generator component
  const SimpleQrCodeSvg: React.FC<{ value: string }> = ({ value }) => {
    // Generate an encoded Google Chart API / QR Server compatible SVG or image fallback
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(value)}&margin=6`;
    return (
      <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-inner">
        <img 
          src={qrUrl} 
          alt="QR Code for Mobile Add to Home Screen" 
          className="w-36 h-36 rounded-lg object-contain bg-white p-1"
          loading="lazy"
        />
        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 font-medium text-center">
          Scan with phone camera to open & install PWA
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shadow-inner shrink-0">
              <Smartphone className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Mobile "Add to Home Screen" Live URLs
                </h2>
                <span className="px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md uppercase tracking-wider">
                  Lead Ready
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-100 mt-0.5">
                Share direct live links with lead contacts. Automatically opens in desktop view or prompts 1-click mobile app install on phones.
              </p>
            </div>
          </div>

          {/* Environment Domain Selector */}
          <div className="mt-4 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 font-medium text-blue-100">
              <Globe className="w-4 h-4 text-blue-300" />
              <span>Target Base URL:</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl border border-white/20">
              <button
                onClick={() => setSelectedBaseUrlType('current')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer flex items-center gap-1.5 ${
                  selectedBaseUrlType === 'current' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Current Live URL (Active)
              </button>
              <button
                onClick={() => setSelectedBaseUrlType('dev')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedBaseUrlType === 'dev' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Dev App
              </button>
              <button
                onClick={() => setSelectedBaseUrlType('custom')}
                className={`px-2.5 py-1 rounded-lg font-semibold transition cursor-pointer ${
                  selectedBaseUrlType === 'custom' 
                    ? 'bg-white text-slate-900 shadow-xs' 
                    : 'text-white hover:bg-white/10'
                }`}
              >
                Cloud Run / Custom Domain
              </button>
            </div>
          </div>

          {selectedBaseUrlType === 'custom' && (
            <div className="mt-2.5 flex items-center gap-2">
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => {
                  setCustomBaseUrl(e.target.value);
                  try { localStorage.setItem('vantage_custom_cloudrun_url', e.target.value); } catch {}
                }}
                placeholder="https://vantage-ai-workspace-xxxx-uw.a.run.app or https://yourdomain.com"
                className="w-full px-3 py-1.5 bg-white/10 border border-white/30 rounded-xl text-xs text-white placeholder-blue-200/60 focus:outline-none focus:ring-2 focus:ring-white"
              />
            </div>
          )}

        </div>

        {/* Filter Pills */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTabFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
              activeTabFilter === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
            }`}
          >
            All 5 Modules
          </button>
          {LEAD_MOBILE_PLUGIN_MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveTabFilter(mod.id)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                activeTabFilter === mod.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {mod.shortName}
            </button>
          ))}
        </div>

        {/* Modules List */}
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-4">
          {filteredModules.map((module) => {
            const Icon = getIcon(module.iconName);
            const liveUrl = buildLeadPluginUrl(module.pluginParam, currentBaseUrl, { leadMode: true });
            const isQrExpanded = expandedQrId === module.id;

            return (
              <div 
                key={module.id}
                className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 sm:p-5 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 shadow-xs">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-tight">
                          {module.name}
                        </h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                          {module.badge}
                        </span>
                      </div>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-0.5">
                        {module.tagline}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Live URL Bar */}
                <div className="mt-3.5 p-2.5 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1 px-1">
                    <LinkIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    <code className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate select-all">
                      {liveUrl}
                    </code>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleCopy(liveUrl, `url_${module.id}`)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shadow-xs"
                      title="Copy live link to clipboard"
                    >
                      {copiedKey === `url_${module.id}` ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Live URL</span>
                        </>
                      )}
                    </button>

                    <a
                      href={liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1 px-2.5 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Open and test live link in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Test Link</span>
                    </a>

                    <button
                      onClick={() => setExpandedQrId(isQrExpanded ? null : module.id)}
                      className={`p-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                        isQrExpanded
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 border-blue-300'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                      }`}
                      title="Show Mobile QR Code"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* QR Code Expansion Drawer */}
                {isQrExpanded && (
                  <div className="mt-3 p-4 bg-slate-100 dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-4 animate-in fade-in">
                    <SimpleQrCodeSvg value={liveUrl} />
                    <div className="flex-1 space-y-2 text-center sm:text-left">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
                        <Smartphone className="w-4 h-4 text-blue-500" />
                        Live Mobile Add-to-Home-Screen QR Code
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Have your lead open their phone camera, point it at this QR code, and tap the notification. When the page opens in mobile browser, they can tap <strong className="text-blue-600 dark:text-blue-400 font-semibold">"Add to Home Screen"</strong> to install the standalone mobile app.
                      </p>
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(liveUrl, `qr_url_${module.id}`)}
                          className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 cursor-pointer"
                        >
                          {copiedKey === `qr_url_${module.id}` ? '✓ Copied' : 'Copy Direct Link'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Pitch Templates for SMS & Email */}
                <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Includes Zero BYOK Guest Bypass & 1-Tap A2HS</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const smsText = module.smsPitchTemplate.replace('{URL}', liveUrl);
                        handleCopy(smsText, `sms_${module.id}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Copy pre-written SMS pitch text with live URL"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{copiedKey === `sms_${module.id}` ? '✓ Copied SMS' : 'Copy Lead SMS'}</span>
                    </button>

                    <button
                      onClick={() => {
                        const emailBody = module.emailPitchTemplate.body.replace('{URL}', liveUrl);
                        const fullEmail = `Subject: ${module.emailPitchTemplate.subject}\n\n${emailBody}`;
                        handleCopy(fullEmail, `email_${module.id}`);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/50 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold transition cursor-pointer"
                      title="Copy pre-written Email pitch with subject and live URL"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>{copiedKey === `email_${module.id}` ? '✓ Copied Email' : 'Copy Lead Email'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary / Quick Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Managed Master Hub Architecture:</span> All lead entries bypass API key configuration and connect directly to Mike Ford's master pipeline.
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const allLinks = LEAD_MOBILE_PLUGIN_MODULES.map(m => {
                  const url = buildLeadPluginUrl(m.pluginParam, currentBaseUrl, { leadMode: true });
                  return `${m.name}:\n${url}\n`;
                }).join('\n');
                handleCopy(allLinks, 'copy_all');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedKey === 'copy_all' ? '✓ All 5 URLs Copied' : 'Copy All 5 URLs'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
