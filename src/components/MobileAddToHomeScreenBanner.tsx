import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Plus, X, Sparkles, Check, Share2 } from 'lucide-react';
import { usePwaInstallPrompt } from '../hooks/usePwaInstallPrompt';
import { IosInstallGuideModal } from './IosInstallGuideModal';

interface MobileAddToHomeScreenBannerProps {
  currentPluginName?: string;
  onOpenShareModal?: () => void;
}

export const MobileAddToHomeScreenBanner: React.FC<MobileAddToHomeScreenBannerProps> = ({
  currentPluginName = 'Vantage AI Studio-Suite',
  onOpenShareModal
}) => {
  const {
    isInstallable,
    isInstalled,
    isIOS,
    isMobile,
    isIosGuideOpen,
    setIsIosGuideOpen,
    triggerInstall
  } = usePwaInstallPrompt();

  const [isDismissed, setIsDismissed] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // Auto-detect if lead query is present
  const isLeadMode = typeof window !== 'undefined' && 
    (new URLSearchParams(window.location.search).get('lead') === '1' ||
     new URLSearchParams(window.location.search).get('lead_mode') === '1');

  if (isInstalled || isDismissed) {
    return (
      <IosInstallGuideModal
        isOpen={isIosGuideOpen}
        onClose={() => setIsIosGuideOpen(false)}
        pluginName={currentPluginName}
      />
    );
  }

  const handleInstallClick = async () => {
    const outcome = await triggerInstall();
    if (outcome === 'accepted') {
      setInstallSuccess(true);
      setTimeout(() => setInstallSuccess(false), 4000);
    }
  };

  return (
    <>
      <aside 
        aria-label="Mobile App Installation Banner"
        className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-800 text-white px-3 py-2 sm:py-2.5 shadow-md border-b border-blue-500/30 sticky top-0 z-40 transition-all duration-200"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Smartphone className="w-4 h-4 text-white animate-bounce" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-white truncate">
                  {currentPluginName}
                </span>
                {isLeadMode && (
                  <span className="text-[10px] uppercase font-black bg-amber-400 text-slate-900 px-1.5 py-0.2 rounded-sm shadow-xs">
                    Lead Live Preview
                  </span>
                )}
              </div>
              <p className="text-[11px] text-blue-100 hidden sm:block truncate">
                {isIOS
                  ? 'Tap below for quick instructions to save to your iPhone/iPad Home Screen.'
                  : 'Install as a fast, standalone mobile/desktop app with 1-click.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {onOpenShareModal && (
              <button
                onClick={onOpenShareModal}
                className="hidden md:flex items-center gap-1 px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition cursor-pointer border border-white/20"
                title="View all 5 Shareable Lead Live URLs"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden lg:inline">Share Module Links</span>
              </button>
            )}

            <button
              id="install-mobile-app-btn"
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition transform active:scale-95 cursor-pointer whitespace-nowrap"
            >
              {installSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-950" />
                  <span>Installed!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5" />
                  <span>Add to Home Screen</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 transition cursor-pointer"
              title="Dismiss"
              aria-label="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <IosInstallGuideModal
        isOpen={isIosGuideOpen}
        onClose={() => setIsIosGuideOpen(false)}
        pluginName={currentPluginName}
      />
    </>
  );
};
