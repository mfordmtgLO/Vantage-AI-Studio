/**
 * ============================================================================
 * VANTAGE AI STUDIO • GEOMAP PLUGIN DEVELOPER MODE & PUBLIC OFFLINE CONTROLLER
 * Copyright (c) 2026 Mike Ford (fordmj@gmail.com). All Rights Reserved.
 *
 * Enforces that the First-Time Homebuyer GeoMap Plugin URL is strictly OFFLINE
 * to the public and accessible exclusively in Developer Mode for internal testing.
 * ============================================================================
 */

const STORAGE_KEY = 'vantage_geomap_dev_mode';

/**
 * Checks if the current session has active Developer Testing privileges.
 */
export function isGeomapDevModeActive(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Explicit developer URL override flags
    if (
      urlParams.get('dev') === 'true' ||
      urlParams.get('dev') === '1' ||
      urlParams.get('developer') === '1' ||
      urlParams.get('developer') === 'true' ||
      urlParams.get('test_mode') === 'true' ||
      urlParams.get('admin') === 'true'
    ) {
      return true;
    }

    // Explicit simulate-offline override flag for testing public block screen
    if (urlParams.get('simulate_public') === 'true' || urlParams.get('simulate_offline') === 'true') {
      return false;
    }

    // Saved developer toggle
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      return saved === 'true';
    }

    // Default to developer mode if running in dev environment or admin session
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost) {
      return true;
    }
  } catch (err) {
    console.warn('Error reading geomap dev mode state:', err);
  }

  return false;
}

/**
 * Activates or deactivates Developer Testing Mode.
 */
export function setGeomapDevMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('vantage-geomap-dev-mode-changed', { detail: { enabled } }));
  } catch (err) {
    console.warn('Error saving geomap dev mode state:', err);
  }
}

/**
 * Public status flag. True indicates the GeoMap plugin is not live for public access.
 */
export const IS_GEOMAP_OFFLINE_FOR_PUBLIC = true;
