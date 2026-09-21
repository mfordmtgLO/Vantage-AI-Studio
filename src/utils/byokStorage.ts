/**
 * Centralized Client-Side BYOK (Bring Your Own Key) Storage & Header Utility
 * Allows buyers on Etsy, Gumroad, and GitHub to enter their own API keys via an in-app drawer.
 */

export interface UserByokKeys {
  geminiApiKey: string;
  rentcastApiKey: string;
  deepseekApiKey: string;
}

const STORAGE_KEY = 'vantage_byok_credentials';

export function getClientByokKeys(): UserByokKeys {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        geminiApiKey: parsed.geminiApiKey?.trim() || '',
        rentcastApiKey: parsed.rentcastApiKey?.trim() || '',
        deepseekApiKey: parsed.deepseekApiKey?.trim() || ''
      };
    }
  } catch (e) {
    console.warn('Could not retrieve local BYOK keys:', e);
  }
  return {
    geminiApiKey: '',
    rentcastApiKey: '',
    deepseekApiKey: ''
  };
}

export function saveClientByokKeys(keys: Partial<UserByokKeys>): void {
  try {
    const current = getClientByokKeys();
    const updated: UserByokKeys = {
      geminiApiKey: keys.geminiApiKey !== undefined ? keys.geminiApiKey.trim() : current.geminiApiKey,
      rentcastApiKey: keys.rentcastApiKey !== undefined ? keys.rentcastApiKey.trim() : current.rentcastApiKey,
      deepseekApiKey: keys.deepseekApiKey !== undefined ? keys.deepseekApiKey.trim() : current.deepseekApiKey
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    // Dispatch storage event so all mounted components react immediately
    window.dispatchEvent(new Event('vantage_byok_updated'));
  } catch (e) {
    console.warn('Could not save local BYOK keys:', e);
  }
}

export function clearClientByokKeys(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('vantage_byok_updated'));
  } catch (e) {
    console.warn('Could not clear local BYOK keys:', e);
  }
}

/**
 * Returns HTTP headers containing the active client BYOK credentials
 */
export function getByokHttpHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
  const keys = getClientByokKeys();
  const headers: Record<string, string> = { ...additionalHeaders };

  if (keys.geminiApiKey) {
    headers['x-gemini-key'] = keys.geminiApiKey;
  }
  if (keys.rentcastApiKey) {
    headers['x-rentcast-key'] = keys.rentcastApiKey;
  }
  if (keys.deepseekApiKey) {
    headers['x-deepseek-key'] = keys.deepseekApiKey;
  }

  return headers;
}
