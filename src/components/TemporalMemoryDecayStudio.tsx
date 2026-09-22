import React, { useState, useMemo } from 'react';
import { 
  Activity, 
  Clock, 
  Zap, 
  ShieldCheck, 
  Lock, 
  Unlock, 
  Sliders, 
  RotateCcw, 
  Sparkles, 
  TrendingDown, 
  AlertCircle,
  Eye,
  CheckCircle2,
  Calendar,
  Flame,
  Search,
  Filter
} from 'lucide-react';
import { UserMemory } from '../types';
import { calculateTemporalDecayScore, getHalfLifeDays, getLambdaForHalfLife } from '../utils/temporalMemoryEngine';

interface TemporalMemoryDecayStudioProps {
  memories: UserMemory[];
  onSaveMemory?: (updated: UserMemory) => Promise<any>;
}

export const TemporalMemoryDecayStudio: React.FC<TemporalMemoryDecayStudioProps> = ({
  memories,
  onSaveMemory
}) => {
  const [globalHalfLifeDays, setGlobalHalfLifeDays] = useState<number>(14);
  const [simulatedTimeOffsetDays, setSimulatedTimeOffsetDays] = useState<number>(0);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedMemoryId, setSelectedMemoryId] = useState<string | null>(null);
  const [localMemoryState, setLocalMemoryState] = useState<UserMemory[]>(memories);

  // Keep in sync with incoming memories if length changes
  React.useEffect(() => {
    setLocalMemoryState(memories);
  }, [memories]);

  const globalLambda = useMemo(() => getLambdaForHalfLife(globalHalfLifeDays), [globalHalfLifeDays]);

  // Compute simulated scores for all memories
  const scoredMemories = useMemo(() => {
    const simulatedNow = new Date(Date.now() + simulatedTimeOffsetDays * 24 * 60 * 60 * 1000);

    return localMemoryState.map(m => {
      const stats = calculateTemporalDecayScore(m, {
        lambdaOverride: globalLambda,
        nowDate: simulatedNow
      });
      return {
        ...m,
        temporalStats: stats
      };
    });
  }, [localMemoryState, globalLambda, simulatedTimeOffsetDays]);

  const filteredMemories = useMemo(() => {
    return scoredMemories.filter(m => {
      const matchesSearch = !searchFilter || 
        m.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(searchFilter.toLowerCase()));
      const matchesCat = categoryFilter === 'all' || m.type === categoryFilter;
      return matchesSearch && matchesCat;
    });
  }, [scoredMemories, searchFilter, categoryFilter]);

  const selectedMemory = useMemo(() => {
    return scoredMemories.find(m => m.id === selectedMemoryId) || scoredMemories[0];
  }, [scoredMemories, selectedMemoryId]);

  const handleToggleImmortalPin = async (memoryId: string) => {
    const updatedList = localMemoryState.map(m => {
      if (m.id === memoryId) {
        const isCurrentPinned = !!m.temporal?.isPinnedImmortal;
        return {
          ...m,
          temporal: {
            accessCount: m.temporal?.accessCount || 1,
            lastAccessedAt: m.temporal?.lastAccessedAt || new Date().toISOString(),
            decayLambda: m.temporal?.decayLambda || globalLambda,
            importanceScore: m.temporal?.importanceScore || 5,
            synapticStrength: isCurrentPinned ? 50 : 100,
            isPinnedImmortal: !isCurrentPinned
          }
        };
      }
      return m;
    });

    setLocalMemoryState(updatedList);
    const updatedMem = updatedList.find(m => m.id === memoryId);
    if (updatedMem && onSaveMemory) {
      await onSaveMemory(updatedMem);
    }
  };

  const handleBoostSynapse = async (memoryId: string) => {
    const updatedList = localMemoryState.map(m => {
      if (m.id === memoryId) {
        const newCount = (m.temporal?.accessCount || 1) + 1;
        return {
          ...m,
          temporal: {
            accessCount: newCount,
            lastAccessedAt: new Date().toISOString(),
            decayLambda: m.temporal?.decayLambda || globalLambda,
            importanceScore: Math.min(10, (m.temporal?.importanceScore || 5) + 1),
            synapticStrength: 100,
            isPinnedImmortal: !!m.temporal?.isPinnedImmortal
          }
        };
      }
      return m;
    });

    setLocalMemoryState(updatedList);
    const updatedMem = updatedList.find(m => m.id === memoryId);
    if (updatedMem && onSaveMemory) {
      await onSaveMemory(updatedMem);
    }
  };

  // Generate 10-point decay curve coordinates for preview
  const curvePoints = useMemo(() => {
    const points = [];
    for (let day = 0; day <= 60; day += 5) {
      const pct = Math.exp(-globalLambda * day) * 100;
      points.push({ day, pct: Math.max(5, Math.round(pct)) });
    }
    return points;
  }, [globalLambda]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 border border-indigo-800/50 text-white relative overflow-hidden shadow-xl">
        <div className="absolute right-0 top-0 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-bold uppercase tracking-wider">
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
              Cognitive Synaptic Weighting & Retention Math
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Temporal Memory Decay & Recency Reinforcement Engine
            </h2>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-3xl leading-relaxed">
              Formula: <span className="font-mono bg-black/40 px-2 py-0.5 rounded-md text-amber-300 font-bold">Score = SemanticSimilarity × e^(-λ·Δt) × (1 + ln(1 + AccessCount)) × (Importance/5)</span>. Frequently recalled memories grow stronger synaptic pathways; transactional noise gently decays without manual curation.
            </p>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <div className="p-3 rounded-2xl bg-black/40 border border-indigo-700/40 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Default Half-Life</span>
              <span className="text-xl font-black text-amber-400">{globalHalfLifeDays} Days</span>
            </div>
            <div className="p-3 rounded-2xl bg-black/40 border border-indigo-700/40 text-center">
              <span className="text-[10px] uppercase font-bold text-indigo-300 block">Active Memories</span>
              <span className="text-xl font-black text-emerald-400">{localMemoryState.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Sliders & Curve Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Half-Life & Simulation Controls */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Synaptic Decay Controls
            </h3>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Memory Half-Life (t½):</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400">{globalHalfLifeDays} Days (λ = {globalLambda.toFixed(4)})</span>
            </div>
            <input
              type="range"
              min="1"
              max="60"
              value={globalHalfLifeDays}
              onChange={(e) => setGlobalHalfLifeDays(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>1 Day (Aggressive)</span>
              <span>14 Days (Standard)</span>
              <span>60 Days (Prolonged)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Simulate Future Time Lapse:</span>
              <span className="font-bold text-amber-600 dark:text-amber-400">+{simulatedTimeOffsetDays} Days Ahead</span>
            </div>
            <input
              type="range"
              min="0"
              max="90"
              value={simulatedTimeOffsetDays}
              onChange={(e) => setSimulatedTimeOffsetDays(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>Now (0d)</span>
              <span>30 Days</span>
              <span>90 Days Ahead</span>
            </div>
          </div>

          {simulatedTimeOffsetDays > 0 && (
            <button
              onClick={() => setSimulatedTimeOffsetDays(0)}
              className="w-full py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Time Simulation
            </button>
          )}
        </div>

        {/* Real-Time Exponential Decay Curve Visualizer */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Retention Probability Curve (60-Day Horizon)
              </h3>
            </div>
            <span className="text-[11px] text-slate-500">
              Unreinforced memory strength over time
            </span>
          </div>

          {/* Bar / Step Chart */}
          <div className="h-32 flex items-end gap-1.5 pt-4 px-2 bg-slate-50 dark:bg-slate-950/50 rounded-xl border border-slate-100 dark:border-slate-800">
            {curvePoints.map((pt, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <div 
                  style={{ height: `${pt.pct}%` }} 
                  className={`w-full rounded-t-sm transition-all duration-300 ${
                    pt.pct > 60 
                      ? 'bg-emerald-500 dark:bg-emerald-400 group-hover:bg-emerald-600' 
                      : pt.pct > 30 
                        ? 'bg-amber-500 dark:bg-amber-400 group-hover:bg-amber-600' 
                        : 'bg-indigo-400 dark:bg-indigo-600 group-hover:bg-indigo-500'
                  }`}
                />
                <span className="text-[9px] font-mono text-slate-400">
                  {pt.day}d
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> High Synaptic Recall (&gt;60%)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Moderate (30-60%)
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Graceful Archival (&lt;30%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Node List & Synaptic Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Filterable List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search memories..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none text-xs">
              {['all', 'knowledge', 'instruction', 'persona', 'workflow'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition capitalize cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {filteredMemories.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No memories match your query.
              </div>
            ) : (
              filteredMemories.map(m => {
                const isSelected = selectedMemory?.id === m.id;
                const stats = m.temporalStats;
                const isImmortal = stats.isImmortal;

                return (
                  <div
                    key={m.id}
                    onClick={() => setSelectedMemoryId(m.id)}
                    className={`p-4 rounded-xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {m.title}
                        </h4>
                        <span className="px-2 py-0.5 rounded-md text-[10px] uppercase font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {m.type}
                        </span>
                        {isImmortal && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Immortal
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">
                        {m.content}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      {/* Synaptic Strength Meter */}
                      <div className="w-24 text-right">
                        <div className="flex items-center justify-between text-[10px] font-bold">
                          <span className="text-slate-400">Synapse</span>
                          <span className={stats.synapticStrength > 60 ? 'text-emerald-600' : stats.synapticStrength > 30 ? 'text-amber-600' : 'text-indigo-600'}>
                            {stats.synapticStrength}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1">
                          <div
                            style={{ width: `${stats.synapticStrength}%` }}
                            className={`h-full ${
                              stats.synapticStrength > 60 ? 'bg-emerald-500' : stats.synapticStrength > 30 ? 'bg-amber-500' : 'bg-indigo-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => handleBoostSynapse(m.id)}
                          title="Reinforce memory with simulated recall"
                          className="p-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 transition cursor-pointer"
                        >
                          <Flame className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleImmortalPin(m.id)}
                          title={isImmortal ? 'Unlock from immortality' : 'Lock as immortal (exempt from decay)'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isImmortal 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-500'
                          }`}
                        >
                          {isImmortal ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Node Deep-Dive Inspector */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs flex flex-col justify-between">
          {selectedMemory ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Synaptic Node Diagnostics
                </span>
                <span className="text-xs text-slate-400">
                  ID: {selectedMemory.id.slice(0, 8)}...
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  {selectedMemory.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 max-h-24 overflow-y-auto leading-relaxed p-2 bg-slate-50 dark:bg-slate-800/40 rounded-lg">
                  {selectedMemory.content}
                </p>
              </div>

              {/* Stats Matrix */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Access Frequency</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedMemory.temporal?.accessCount || 1} Recalls
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Days Since Access</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedMemory.temporalStats?.daysSinceAccess} Days
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Importance Scalar</span>
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    {selectedMemory.temporal?.importanceScore || 5} / 10
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-medium">Net Temporal Score</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {selectedMemory.temporalStats?.effectiveScore}x
                  </span>
                </div>
              </div>

              {/* Tags */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                  Associated Vector Tags
                </span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {selectedMemory.tags.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a memory to inspect its neural metrics.
            </div>
          )}

          {selectedMemory && (
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
              <button
                onClick={() => handleBoostSynapse(selectedMemory.id)}
                className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Flame className="w-3.5 h-3.5" />
                Boost Synapse Recall (+1)
              </button>
              <button
                onClick={() => handleToggleImmortalPin(selectedMemory.id)}
                className={`p-2 rounded-xl border text-xs font-semibold transition cursor-pointer ${
                  selectedMemory.temporalStats?.isImmortal
                    ? 'border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 text-slate-700 dark:text-slate-300'
                }`}
                title="Toggle Immortal Lock"
              >
                {selectedMemory.temporalStats?.isImmortal ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
