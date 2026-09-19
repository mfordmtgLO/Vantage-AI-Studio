import React from 'react';
import { Sparkles, Shield, Cpu, Zap } from 'lucide-react';

interface AuthCardProps {
  onLogin: () => void;
  isLoggingIn: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({ onLogin, isLoggingIn }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Vantage AI Workspace</h1>
          <p className="text-sm text-slate-600">
            Prompt engineer tasks, analyze data, and automate workflows across your Google Workspace with Gemini.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-left py-2">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <Cpu className="w-5 h-5 text-blue-600" />
            <h3 className="text-xs font-semibold text-slate-800">Smart Prompting</h3>
            <p className="text-[11px] text-slate-500">Cross-product AI workflows</p>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1">
            <Zap className="w-5 h-5 text-amber-600" />
            <h3 className="text-xs font-semibold text-slate-800">Safe Actions</h3>
            <p className="text-[11px] text-slate-500">Explicit user confirmation</p>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={onLogin}
            disabled={isLoggingIn}
            className="gsi-material-button w-full flex items-center justify-center py-3 px-4 rounded-xl border border-slate-300 shadow-sm bg-white hover:bg-slate-50 transition font-medium text-slate-700 disabled:opacity-50 cursor-pointer"
          >
            <div className="gsi-material-button-icon mr-3">
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '20px', height: '20px', display: 'block' }}>
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
            </div>
            <span className="gsi-material-button-contents text-sm font-semibold text-slate-700">
              {isLoggingIn ? 'Connecting to Workspace...' : 'Sign in with Google'}
            </span>
          </button>
        </div>

        <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          Secure OAuth connection with least-privilege scopes
        </p>
      </div>
    </div>
  );
};
