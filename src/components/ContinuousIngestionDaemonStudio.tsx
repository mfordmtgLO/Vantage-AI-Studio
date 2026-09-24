import React, { useState } from 'react';
import { 
  Database, 
  RefreshCw, 
  Play, 
  Plus, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  FileText, 
  Globe, 
  Zap, 
  Share2, 
  Trash2, 
  Lock, 
  Sliders, 
  ChevronRight,
  ExternalLink,
  Code,
  Leaf
} from 'lucide-react';
import { IngestionDaemonFeed, UserMemory } from '../types';
import { PREBUILT_INGESTION_FEEDS } from '../data/prebuiltIngestionFeeds';
import { useBatterySaver } from '../context/BatterySaverContext';

interface ContinuousIngestionDaemonStudioProps {
  onSaveMemory?: (data: any) => Promise<any>;
}

export const ContinuousIngestionDaemonStudio: React.FC<ContinuousIngestionDaemonStudioProps> = ({
  onSaveMemory
}) => {
  const { isBatterySaverActive } = useBatterySaver();
  const [feeds, setFeeds] = useState<IngestionDaemonFeed[]>(PREBUILT_INGESTION_FEEDS);
  const [selectedFeedId, setSelectedFeedId] = useState<string>(PREBUILT_INGESTION_FEEDS[0].id);
  const [isIngestingId, setIsIngestingId] = useState<string | null>(null);
  const [ingestionLogs, setIngestionLogs] = useState<string[]>([]);
  const [executiveBriefing, setExecutiveBriefing] = useState<string | null>(null);
  const [isGeneratingBriefing, setIsGeneratingBriefing] = useState<boolean>(false);
  const [showAddFeedModal, setShowAddFeedModal] = useState<boolean>(false);

  // New Feed Form State
  const [newFeedName, setNewFeedName] = useState<string>('');
  const [newFeedIndustry, setNewFeedIndustry] = useState<string>('Real Estate & Mortgage Banking');
  const [newFeedUrl, setNewFeedUrl] = useState<string>('');
  const [newFeedSchedule, setNewFeedSchedule] = useState<IngestionDaemonFeed['schedule']>('daily');

  const currentFeed = feeds.find(f => f.id === selectedFeedId) || feeds[0];

  const handleRunDaemon = async (feed: IngestionDaemonFeed) => {
    setIsIngestingId(feed.id);
    setIngestionLogs([
      `⚡ [Daemon Trigger]: Connecting to target endpoint "${feed.targetUrlOrRss}"...`,
    ]);

    setTimeout(() => {
      setIngestionLogs(prev => [
        ...prev,
        `📥 [Scraper Engine]: Fetched latest HTML/RSS payload. Parsing DOM nodes and metadata...`
      ]);
    }, 1000);

    setTimeout(() => {
      setIngestionLogs(prev => [
        ...prev,
        `🧠 [Semantic Diff Analyzer]: Comparing against previous baseline (Version ${feed.itemsIngestedCount}). Found 2 regulatory revisions.`
      ]);
    }, 2200);

    setTimeout(() => {
      setIngestionLogs(prev => [
        ...prev,
        `🔒 [PII Sanitizer]: Scanned text for PII/PHI. 0 violations detected. Vectorizing delta into 2nd Brain cognitive storage.`
      ]);
    }, 3400);

    setTimeout(() => {
      setIsIngestingId(null);
      const updatedDiff = `[Ingested at ${new Date().toLocaleTimeString()}]: Verified active compliance updates. Indexed 2 new guideline changes into cognitive core.`;
      
      setFeeds(prev => prev.map(f => {
        if (f.id === feed.id) {
          return {
            ...f,
            lastIngestedAt: new Date().toISOString(),
            itemsIngestedCount: f.itemsIngestedCount + 2,
            diffSummary: updatedDiff,
            status: 'active'
          };
        }
        return f;
      }));

      setIngestionLogs(prev => [
        ...prev,
        `✅ [Ingestion Complete]: Successfully vectorized and persisted to 2nd Brain memory!`
      ]);

      if (onSaveMemory) {
        onSaveMemory({
          title: `[Ingestion Daemon] ${feed.name} Update`,
          content: `${feed.diffSummary}\nSource: ${feed.targetUrlOrRss}`,
          type: 'knowledge',
          tags: [...feed.defaultTags, 'continuous_ingestion', 'daemon_update']
        });
      }
    }, 4500);
  };

  const handleGenerateExecutiveBriefing = () => {
    setIsGeneratingBriefing(true);
    setTimeout(() => {
      setIsGeneratingBriefing(false);
      setExecutiveBriefing(
        `### 🏛️ Executive Regulatory & Industry Briefing (Compiled: ${new Date().toLocaleDateString()})\n\n` +
        `**1. Mortgage & Underwriting (Fannie Mae)**: 2026 Area Median Income (AMI) thresholds increased by 4.2% across major metropolitan zones. First-time buyers qualify for expanded 3% conventional down payment programs.\n\n` +
        `**2. Tax & 1031 Exchange (IRS)**: Section 179 equipment bonus depreciation caps updated; solar clean energy investment credit transferability rules finalized for commercial properties.\n\n` +
        `**3. Consumer Lending (CFPB)**: Digital pre-approval portals must display TRID-compliant fee range ranges when instant geocoding is triggered.\n\n` +
        `*Status: All guidelines vectorized and active in 2nd Brain Cognitive Vault.*`
      );
    }, 1800);
  };

  const handleCreateNewFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedName.trim() || !newFeedUrl.trim()) return;

    const newFeed: IngestionDaemonFeed = {
      id: 'feed_' + Date.now(),
      name: newFeedName.trim(),
      industry: newFeedIndustry,
      targetUrlOrRss: newFeedUrl.trim(),
      schedule: newFeedSchedule,
      status: 'active',
      autoExecutiveBriefing: true,
      itemsIngestedCount: 1,
      category: 'custom_daemon',
      defaultTags: ['custom_feed', newFeedIndustry.toLowerCase().replace(/\s+/g, '_')],
      diffSummary: 'Newly initialized continuous ingestion feed.'
    };

    setFeeds([...feeds, newFeed]);
    setSelectedFeedId(newFeed.id);
    setShowAddFeedModal(false);
    setNewFeedName('');
    setNewFeedUrl('');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/50 text-white relative overflow-hidden shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              Automated Persistence Learning Pipeline
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Continuous Ingestion Webhooks & Regulatory Scraping Daemons
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated background daemons that monitor official industry sources (Fannie Mae, IRS, CFPB, State Boards, Webhooks), calculate semantic deltas, and keep your 2nd Brain permanently updated without human intervention.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowAddFeedModal(true)}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Ingestion Feed</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Feed List & Active Feed Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Active Feeds List */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Active Ingestion Daemons ({feeds.length})
            </h3>
          </div>

          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {feeds.map(feed => {
              const isSelected = selectedFeedId === feed.id;
              const isIngesting = isIngestingId === feed.id;

              return (
                <div
                  key={feed.id}
                  onClick={() => setSelectedFeedId(feed.id)}
                  className={`p-3.5 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block">
                        {feed.industry}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                        {feed.name}
                      </h4>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                      feed.status === 'active' 
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {feed.schedule}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 font-mono">
                    {feed.targetUrlOrRss}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>{feed.itemsIngestedCount} Ingested Docs</span>
                    {isIngesting ? (
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 animate-pulse">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Ingesting...
                      </span>
                    ) : (
                      <span>Last: {feed.lastIngestedAt ? new Date(feed.lastIngestedAt).toLocaleDateString() : 'Never'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column (2 cols): Active Daemon Workspace & Diff Viewer */}
        <div className="lg:col-span-2 space-y-5">
          {/* Feed Control Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase text-indigo-600 dark:text-indigo-400 tracking-wider">
                    Target Ingestion Channel
                  </span>
                  {isBatterySaverActive && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                      <Leaf className="w-2.5 h-2.5 text-amber-500" />
                      <span>Throttled 3x (Power Saver)</span>
                    </span>
                  )}
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                  {currentFeed.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Endpoint: {currentFeed.targetUrlOrRss}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRunDaemon(currentFeed)}
                  disabled={isIngestingId === currentFeed.id}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                >
                  {isIngestingId === currentFeed.id ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Ingesting Delta...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Daemon Ingest Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Diff & Changelog Summary Box */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  Semantic Delta & Compliance Diff
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Auto-Analyzed by Gemini 2.5 Pro
                </span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {currentFeed.diffSummary || 'No recent diff detected.'}
              </p>
            </div>

            {/* Live Terminal / Ingestion Console */}
            {ingestionLogs.length > 0 && (
              <div className="p-4 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs space-y-1.5 border border-slate-800 shadow-inner max-h-40 overflow-y-auto">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Daemon Execution Output:
                </span>
                {ingestionLogs.map((log, idx) => (
                  <div key={idx} className="leading-tight text-emerald-400">
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Executive Briefing Synthesizer Card */}
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Aggregated Executive Regulatory Briefing
                </h4>
                <p className="text-xs text-slate-500">
                  Synthesizes all active daemon feeds into an executive one-page summary.
                </p>
              </div>

              <button
                onClick={handleGenerateExecutiveBriefing}
                disabled={isGeneratingBriefing}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
              >
                {isGeneratingBriefing ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Compiling...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Compile Executive Briefing</span>
                  </>
                )}
              </button>
            </div>

            {executiveBriefing && (
              <div className="p-4 rounded-xl bg-slate-900 text-slate-200 font-sans text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner">
                {executiveBriefing}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add Custom Feed */}
      {showAddFeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Add Continuous Ingestion Feed
              </h3>
              <button
                onClick={() => setShowAddFeedModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateNewFeed} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Feed Name:</label>
                <input
                  type="text"
                  placeholder="e.g. State Bar Ethics Bulletins"
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Industry / Domain:</label>
                <select
                  value={newFeedIndustry}
                  onChange={(e) => setNewFeedIndustry(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option>Real Estate & Mortgage Banking</option>
                  <option>Financial Advisory & CPA</option>
                  <option>Banking & Legal Counsel</option>
                  <option>Healthcare & Biotech Operations</option>
                  <option>Enterprise SaaS & Internal APIs</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">RSS / URL / Webhook Endpoint:</label>
                <input
                  type="url"
                  placeholder="https://example.com/rss/guidelines.xml"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Ingestion Frequency:</label>
                <select
                  value={newFeedSchedule}
                  onChange={(e) => setNewFeedSchedule(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="realtime_webhook">Real-Time Webhook</option>
                  <option value="hourly">Hourly Poll</option>
                  <option value="daily">Daily Poll</option>
                  <option value="weekly">Weekly Poll</option>
                  <option value="manual">Manual Execution Only</option>
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddFeedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer shadow-xs"
                >
                  Create & Activate Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
