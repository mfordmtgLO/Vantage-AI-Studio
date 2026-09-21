/**
 * ============================================================================
 * PWA INSTALL PROMPT & MOBILE ENVIRONMENT HOOK
 * Handles native browser beforeinstallprompt, iOS Safari detection,
 * standalone mode verification, and mobile app installation triggers.
 * ============================================================================
 */

import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function usePwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isIosGuideOpen, setIsIosGuideOpen] = useState(false);

  useEffect(() => {
    // Detect environment
    if (typeof window === 'undefined' || typeof navigator === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(userAgent);
    const isMobileDevice = isIOSDevice || isAndroidDevice || /mobile|tablet|silk|kindle/.test(userAgent);

    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);
    setIsMobile(isMobileDevice);

    // Check if already running in standalone mode (installed PWA)
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(isStandaloneMode);

    // Capture standard Chromium beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'ios_guide' | 'not_supported'> => {
    if (isInstalled) {
      return 'accepted';
    }

    if (isIOS) {
      setIsIosGuideOpen(true);
      return 'ios_guide';
    }

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          return 'accepted';
        } else {
          return 'dismissed';
        }
      } catch (err) {
        console.warn('Error during PWA install prompt:', err);
        return 'not_supported';
      }
    }

    // Fallback: If no prompt is available (e.g. mobile Safari or Firefox), open the manual guide
    setIsIosGuideOpen(true);
    return 'ios_guide';
  }, [deferredPrompt, isInstalled, isIOS]);

  return {
    isInstallable: isInstallable || isIOS || isMobile,
    isInstalled,
    isIOS,
    isAndroid,
    isMobile,
    isIosGuideOpen,
    setIsIosGuideOpen,
    triggerInstall
  };
}
