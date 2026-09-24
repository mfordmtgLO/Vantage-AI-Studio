import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, CheckCircle2, RefreshCw, Server, MapPin, Zap, ExternalLink, ShieldCheck, Radio, AlertCircle, Loader2, Play, AlertTriangle, Leaf } from 'lucide-react';
import { useBatterySaver } from '../context/BatterySaverContext';

interface SyncStatusData {
  status: string;
  connected: boolean;
  repository: string;
  branch: string;
  cloudRunService: string;
  targetRegion: string;
  triggerName: string;
  buildConfig: string;
  deploymentMode: string;
  latestCommit: {
    sha: string;
    message: string;
    author: string;
    date: string;
    htmlUrl: string;
  };
  lastWebhookPingLog: {
    timestamp: string;
    event: string;
    status: string;
    commitSha?: string;
  };
  buildState?: 'SUCCESS' | 'BUILDING' | 'FAILED';
  buildStep?: string;
  buildStartedAt?: string;
  buildCompletedAt?: string;
  cloudRunSyncVerified: boolean;
  verifiedAt: string;
}

export const GitHubCloudRunSyncStatusCard: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  const [data, setData] = useState<SyncStatusData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [pinging, setPinging] = useState<boolean>(false);
  const [simulatingMode, setSimulatingMode] = useState<string | null>(null);

  const fetchStatus = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/github/sync-status');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      if (!isBackground) setError(err.message || 'Failed to fetch GitHub sync status');
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const { isBatterySaverActive, getAdjustedInterval } = useBatterySaver();

  // Poll status dynamically: 3000ms normal, 9000ms on battery saver
  useEffect(() => {
    fetchStatus(false);
    const intervalMs = getAdjustedInterval(3000);
    const interval = setInterval(() => {
      fetchStatus(true);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [getAdjustedInterval, isBatterySaverActive]);

  const handleSimulateBuild = async (mode: 'success' | 'fail') => {
    setSimulatingMode(mode);
    try {
      await fetch('/api/github/simulate-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      await fetchStatus(false);
    } catch (err) {
      console.error('Simulation trigger failed:', err);
    } finally {
      setSimulatingMode(null);
    }
  };

  const handleSendTestPing = async () => {
    setPinging(true);
    try {
      await fetch('/api/github/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-github-event': 'push',
          'x-github-delivery': `test-push-${Date.now().toString().slice(-6)}`
        },
        body: JSON.stringify({
          ref: 'refs/heads/main',
          after: data?.latestCommit?.sha || '0874c12',
          head_commit: {
            id: data?.latestCommit?.sha || '0874c12',
            message: 'feat: live test push deployment'
          }
        })
      });
      await fetchStatus(false);
    } catch (err) {
      console.error('Test ping failed:', err);
    } finally {
      setPinging(false);
    }
  };

  const isBuilding = data?.buildState === 'BUILDING';
  const isFailed = data?.buildState === 'FAILED';

  if (compact) {
    return (
      <div className={`border rounded-xl p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 transition-all duration-300 w-full max-w-full min-w-0 overflow-hidden ${
        isBuilding 
          ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10' 
          : isFailed 
            ? 'bg-rose-950/40 border-rose-500/60 shadow-lg shadow-rose-500/10' 
            : 'bg-slate-900/90 border-slate-800'
      }`}>
        <div className="flex items-center gap-2.5 min-w-0 w-full sm:w-auto max-w-full overflow-hidden">
          <div className="relative flex h-3 w-3 shrink-0 items-center justify-center">
            {isBuilding ? (
              <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            ) : isFailed ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            ) : (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1 max-w-full overflow-hidden">
            <div className="flex items-center gap-1.5 font-bold text-slate-200 flex-wrap min-w-0">
              <div className="flex items-center gap-1 truncate min-w-0 max-w-[160px] xs:max-w-none">
                <GitBranch className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span className="truncate font-mono text-[11px] sm:text-xs">{data?.repository || 'mfordmtgLO/Vantage-AI-Workspace'}</span>
              </div>
              
              {/* Dynamic Status Pill */}
              {isBuilding ? (
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono text-[10px] font-bold flex items-center gap-1 animate-pulse shrink-0">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" />
                  BUILDING...
                </span>
              ) : isFailed ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <AlertCircle className="w-2.5 h-2.5" />
                  FAILED
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-mono text-[10px] font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                  HEALTHY
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap min-w-0 truncate">
              <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
              <span className="truncate">
                Target: <strong className="text-slate-200">{data?.cloudRunService || 'vantage-ai-workspace'}</strong> ({data?.targetRegion || 'us-west1 Oregon'})
              </span>
              {data?.buildStep && (
                <span className="text-slate-300 font-mono text-[10px] hidden sm:inline-block border-l border-slate-700 pl-1.5 ml-1 truncate">
                  {data.buildStep}
                </span>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => fetchStatus(false)}
          disabled={loading}
          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition text-[11px] font-semibold flex items-center gap-1 cursor-pointer border border-slate-700 shrink-0 self-end sm:self-auto"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-400' : ''}`} />
          {loading ? 'Refreshing...' : 'Live Poll'}
        </button>
      </div>
    );
  }

  return (
    <div className={`border rounded-2xl p-4 sm:p-5 shadow-2xl relative overflow-hidden transition-all duration-300 ${
      isBuilding 
        ? 'bg-slate-900/95 border-amber-500/60 ring-1 ring-amber-500/30' 
        : isFailed 
          ? 'bg-slate-900/95 border-rose-500/60 ring-1 ring-rose-500/30' 
          : 'bg-slate-900/95 border-slate-800/90'
    }`}>
      {/* Dynamic Background Accent Blurs */}
      <div className={`absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
        isBuilding ? 'bg-amber-500/20' : isFailed ? 'bg-rose-500/20' : 'bg-emerald-500/10'
      }`} />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/90 pb-3.5">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-all ${
            isBuilding 
              ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20' 
              : isFailed 
                ? 'bg-gradient-to-br from-rose-600 to-red-700 shadow-rose-500/20' 
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
          }`}>
            {isBuilding ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isFailed ? (
              <AlertTriangle className="w-5 h-5 animate-bounce" />
            ) : (
              <Zap className="w-5 h-5" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white tracking-tight">
                Cloud Run & GitHub Live Deployment Tracker
              </h3>

              {/* Status Badge */}
              {isBuilding ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin text-amber-400" />
                  BUILDING & DEPLOYING
                </span>
              ) : isFailed ? (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold">
                  <AlertCircle className="w-3 h-3 text-rose-400" />
                  DEPLOYMENT FAILED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE & HEALTHY IN OREGON
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
              Target Service: <strong className="text-slate-200">{data?.cloudRunService || 'vantage-ai-workspace'}</strong> 
              <span className="text-amber-400 font-semibold font-mono">({data?.targetRegion || 'us-west1 Oregon'})</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          <button
            onClick={() => handleSimulateBuild('success')}
            disabled={simulatingMode !== null || isBuilding}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-700/80 text-emerald-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Simulate push commit to see live amber spinning building indicator -> green completion"
          >
            <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
            <span>Simulate Build Push</span>
          </button>

          <button
            onClick={() => handleSimulateBuild('fail')}
            disabled={simulatingMode !== null || isBuilding}
            className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            title="Simulate failed build to watch the status indicator turn red"
          >
            <AlertTriangle className="w-3 h-3 text-rose-400" />
            <span>Test Failure State</span>
          </button>

          <button
            onClick={handleSendTestPing}
            disabled={pinging || isBuilding}
            className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-200 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className={`w-3 h-3 ${pinging ? 'animate-ping text-blue-400' : 'text-blue-400'}`} />
            <span>Push Webhook</span>
          </button>
        </div>
      </div>

      {/* Live Building Progress Banner */}
      {isBuilding && (
        <div className="mt-4 p-3.5 bg-amber-950/60 border border-amber-500/60 rounded-xl text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-2.5">
            <Loader2 className="w-5 h-5 animate-spin text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-amber-100 flex items-center gap-1.5">
                <span>Executing Cloud Build Pipeline in us-west1 (Oregon)...</span>
              </div>
              <p className="text-amber-300/80 font-mono text-[11px] mt-0.5">
                {data?.buildStep || 'gcloud run deploy vantage-ai-workspace --source . --region us-west1'}
              </p>
            </div>
          </div>
          <span className="text-[10px] text-amber-300/70 font-mono shrink-0">
            Started: {data?.buildStartedAt ? new Date(data.buildStartedAt).toLocaleTimeString() : 'Just now'}
          </span>
        </div>
      )}

      {/* Failure State Banner */}
      {isFailed && (
        <div className="mt-4 p-3.5 bg-rose-950/70 border border-rose-500/70 rounded-xl text-rose-200 text-xs flex items-center justify-between gap-2 shadow-inner">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 animate-pulse" />
            <div>
              <div className="font-bold text-rose-100">Build / Deploy Failed</div>
              <p className="text-rose-300 font-mono text-[11px] mt-0.5">
                {data?.buildStep || 'ERROR: Deployment step exited with status 1'}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleSimulateBuild('success')}
            className="px-2.5 py-1 rounded bg-rose-900/80 hover:bg-rose-800 text-rose-100 text-[11px] font-bold border border-rose-700 cursor-pointer shrink-0"
          >
            Retry Fix
          </button>
        </div>
      )}

      {error ? (
        <div className="mt-4 p-3.5 bg-rose-950/50 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Box 1: GitHub Repository & Branch */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-blue-400" />
                  Source Code Repository
                </span>
                <span className="px-1.5 py-0.5 bg-blue-500/20 text-blue-300 rounded font-mono text-[10px]">
                  {data?.branch || 'main'}
                </span>
              </div>
              <div className="font-bold text-sm text-slate-100 font-mono break-all flex items-center justify-between">
                <span>{data?.repository || 'mfordmtgLO/Vantage-AI-Workspace'}</span>
                <a
                  href={`https://github.com/${data?.repository || 'mfordmtgLO/Vantage-AI-Workspace'}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-blue-400 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                <div className="flex items-start justify-between text-slate-300">
                  <span className="text-slate-400">Latest Sync Commit:</span>
                  <a
                    href={data?.latestCommit?.htmlUrl || '#'}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <GitCommit className="w-3 h-3 text-blue-400" />
                    {data?.latestCommit?.sha || '0874c12'}
                  </a>
                </div>
                <p className="text-slate-300 font-medium line-clamp-1 italic text-[11px]">
                  "{data?.latestCommit?.message || 'align Cloud Run deployment to us-west1 Oregon'}"
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  By {data?.latestCommit?.author || 'Mike Ford <fordmj@gmail.com>'}
                </p>
              </div>
            </div>
          </div>

          {/* Box 2: Google Cloud Run & Trigger Config */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="font-semibold text-[11px] uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-emerald-400" />
                  Cloud Run Oregon Deployment
                </span>
                <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-semibold text-[10px] flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 text-amber-400" />
                  {data?.targetRegion || 'us-west1 (Oregon)'}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cloud Run Service:</span>
                  <span className="font-bold text-slate-100 font-mono">{data?.cloudRunService || 'vantage-ai-workspace'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Cloud Build Trigger:</span>
                  <span className="font-semibold text-indigo-300 font-mono">{data?.triggerName || 'vantage-ai-git-autodeploy'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Build Specification:</span>
                  <span className="font-semibold text-amber-300 font-mono">{data?.buildConfig || 'cloudbuild.yaml'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Deployment Type:</span>
                  <span className="text-slate-200 font-medium text-[11px]">{data?.deploymentMode || 'Native Source Build'}</span>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-slate-400">Last Webhook Listener:</span>
                <span className="text-emerald-400 font-semibold font-mono flex items-center gap-1 text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {data?.lastWebhookPingLog?.status || '200 OK - GitHub Connected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Verification Bar */}
      <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          {isBatterySaverActive ? (
            <>
              <Leaf className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-300 font-semibold">
                Battery-Saver Eco Polling (every {getAdjustedInterval(3000) / 1000}s) | Target: <strong>us-west1 (Oregon)</strong>
              </span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              <span>Real-time polling active (every 3s) | Target: <strong>us-west1 (Oregon)</strong></span>
            </>
          )}
        </div>
        <div className="text-[10px] font-mono text-slate-400">
          Last poll: {data?.verifiedAt ? new Date(data.verifiedAt).toLocaleTimeString() : 'Just now'}
        </div>
      </div>
    </div>
  );
};
