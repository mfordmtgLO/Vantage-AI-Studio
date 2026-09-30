import { initializeApp, getApps } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const provider = new GoogleAuthProvider();
// Standard Google sign-in (no Google Workspace scopes)
provider.setCustomParameters({
  prompt: 'select_account',
});

// Dedicated Google Workspace Provider for users opting to connect their enterprise/paid Workspace
export const workspaceProvider = new GoogleAuthProvider();
[
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/tasks',
  'https://www.googleapis.com/auth/contacts.readonly',
].forEach((scope) => workspaceProvider.addScope(scope));
workspaceProvider.setCustomParameters({
  prompt: 'consent select_account',
});

let isSigningIn = false;
let isCheckingRedirect = true;
let cachedAccessToken: string | null = (() => {
  try {
    return localStorage.getItem('vantage_workspace_token') || null;
  } catch {
    return null;
  }
})();

// Detect if running on an iPhone, iPad, iOS Safari, or mobile browser
export const isMobileOrSafariDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  return isIOS || isMobile || isSafari;
};

// Detect if running inside an iframe (like AI Studio preview environment)
export const isIframe = (): boolean => {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

/**
 * Checks if the user just returned from a Google OAuth redirect sign-in.
 * This runs on app load and retrieves the OAuth access token if a redirect completed.
 */
export const checkRedirectSignIn = async (): Promise<{ user: User; accessToken?: string } | null> => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
      }
      return { user: result.user, accessToken: cachedAccessToken || undefined };
    }
    return null;
  } catch (error: any) {
    console.warn('getRedirectResult info:', error);
    return null;
  } finally {
    isCheckingRedirect = false;
  }
};

export const initAuth = (
  onAuthSuccess?: (user: User, token?: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken || undefined);
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export interface SignInOptions {
  method?: 'auto' | 'popup' | 'redirect';
}

/**
 * Creates a synthetic authenticated User object for Mike Ford (Master Admin)
 * used for direct sign-in and local development bypass.
 */
export const createDirectAdminUser = (): User => ({
  uid: 'admin_mike_ford_vantage',
  displayName: 'Mike Ford',
  email: 'fordmj@gmail.com',
  photoURL: 'https://lh3.googleusercontent.com/a/ACg8ocISYp5s_placeholder',
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock_admin_token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: '+15417292097',
  providerId: 'google.com',
} as unknown as User);

/**
 * Creates a synthetic authenticated User object for Developer/Guest mode.
 */
export const createGuestDeveloperUser = (): User => ({
  uid: 'dev_guest_user_vantage',
  displayName: 'Developer Guest',
  email: 'developer@vantage.workspace',
  photoURL: null,
  emailVerified: true,
  isAnonymous: true,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'mock_dev_token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  providerId: 'guest',
} as unknown as User);

/**
 * Handles signing in with Google.
 * On mobile/iOS Safari (outside an iframe), defaults to signInWithRedirect to avoid popup blockers and ITP hangs.
 * On desktop or inside an iframe, uses signInWithPopup with a 30-second safety timeout.
 */
export const googleSignIn = async (
  options: SignInOptions = { method: 'auto' }
): Promise<{ user: User; accessToken?: string } | null> => {
  isSigningIn = true;

  const shouldUseRedirect =
    options.method === 'redirect' ||
    (options.method === 'auto' && isMobileOrSafariDevice() && !isIframe());

  if (shouldUseRedirect) {
    // Redirects current page directly to Google accounts authentication
    try {
      await signInWithRedirect(auth, provider);
    } finally {
      isSigningIn = false;
    }
    return null;
  }

  // Pop-up sign-in with generous 30-second timeout guard
  try {
    const popupPromise = signInWithPopup(auth, provider);
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        const err: any = new Error(
          'Sign-in pop-up timed out. Your browser may be blocking pop-ups. Please tap "Direct Sign-In" or "Continue as Guest".'
        );
        err.code = 'auth/popup-timeout';
        reject(err);
      }, 30000);
    });

    const result = await Promise.race([popupPromise, timeoutPromise]);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    return { user: result.user, accessToken: cachedAccessToken || undefined };
  } catch (error: any) {
    console.error('Sign in error:', error);
    // If popup was blocked or timed out and auto mode was requested, trigger direct redirect automatically
    if (
      options.method === 'auto' &&
      (error?.code === 'auth/popup-blocked' || error?.code === 'auth/popup-timeout')
    ) {
      console.log('Popup failed or blocked. Automatically falling back to signInWithRedirect...');
      try {
        await signInWithRedirect(auth, provider);
        return null;
      } catch (redirectErr) {
        console.error('Redirect fallback error:', redirectErr);
      }
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignInRedirect = async (): Promise<void> => {
  isSigningIn = true;
  await signInWithRedirect(auth, provider);
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  try {
    localStorage.removeItem('vantage_workspace_token');
    localStorage.removeItem('vantage_workspace_connected');
    localStorage.removeItem('vantage_workspace_user_email');
  } catch {}
};

/**
 * Explicit Google Workspace OAuth Connector
 * Only called when the user clicks "Connect Google Workspace" to link an enterprise Workspace account.
 */
export const connectGoogleWorkspace = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, workspaceProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
      try {
        localStorage.setItem('vantage_workspace_token', credential.accessToken);
        localStorage.setItem('vantage_workspace_connected', 'true');
        if (result.user.email) {
          localStorage.setItem('vantage_workspace_user_email', result.user.email);
        }
      } catch {}
      return { user: result.user, accessToken: credential.accessToken };
    }
    return null;
  } catch (error: any) {
    console.error('Workspace connect error:', error);
    throw error;
  }
};

export const disconnectGoogleWorkspace = () => {
  cachedAccessToken = null;
  try {
    localStorage.removeItem('vantage_workspace_token');
    localStorage.removeItem('vantage_workspace_connected');
    localStorage.removeItem('vantage_workspace_user_email');
  } catch {}
};

export const isWorkspaceConnected = (): boolean => {
  try {
    return localStorage.getItem('vantage_workspace_connected') === 'true';
  } catch {
    return false;
  }
};

export const getConnectedWorkspaceEmail = (): string | null => {
  try {
    return localStorage.getItem('vantage_workspace_user_email');
  } catch {
    return null;
  }
};

