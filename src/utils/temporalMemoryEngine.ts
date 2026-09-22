import { UserMemory } from '../types';

/**
 * Calculates temporal score based on:
 * Score = SemanticSimilarity * exp(-lambda * delta_days) * (1 + ln(1 + AccessCount)) * (Importance / 5)
 */
export function calculateTemporalDecayScore(
  memory: UserMemory,
  options: {
    lambdaOverride?: number;
    nowDate?: Date;
    baseSemanticSimilarity?: number;
  } = {}
): {
  temporalMultiplier: number;
  synapticStrength: number; // 0 - 100%
  effectiveScore: number;
  daysSinceAccess: number;
  isImmortal: boolean;
} {
  const now = options.nowDate || new Date();
  const baseSim = options.baseSemanticSimilarity ?? 1.0;

  const isImmortal = !!memory.temporal?.isPinnedImmortal;
  if (isImmortal) {
    return {
      temporalMultiplier: 1.5,
      synapticStrength: 100,
      effectiveScore: baseSim * 1.5,
      daysSinceAccess: 0,
      isImmortal: true,
    };
  }

  const lastAccessedStr = memory.temporal?.lastAccessedAt || memory.updatedAt || memory.createdAt;
  const lastAccessedDate = new Date(lastAccessedStr);
  const diffMs = Math.max(0, now.getTime() - lastAccessedDate.getTime());
  const daysSinceAccess = diffMs / (1000 * 60 * 60 * 24);

  const lambda = options.lambdaOverride ?? memory.temporal?.decayLambda ?? 0.05; // 0.05 ~ half life of ~14 days
  const accessCount = memory.temporal?.accessCount ?? 1;
  const importance = memory.temporal?.importanceScore ?? 5;

  // Exponential decay curve: e^(-lambda * t)
  const decayFactor = Math.exp(-lambda * daysSinceAccess);

  // Reinforcement bonus from repeated access: 1 + ln(1 + accessCount)
  const accessBonus = 1 + Math.log(1 + accessCount);

  // Importance scalar normalized around 1.0
  const importanceScalar = Math.max(0.2, importance / 5);

  const temporalMultiplier = decayFactor * accessBonus * importanceScalar;

  // Synaptic strength 0-100%
  const rawStrength = Math.min(100, Math.max(5, decayFactor * 100 + Math.min(30, accessCount * 4)));

  return {
    temporalMultiplier: parseFloat(temporalMultiplier.toFixed(3)),
    synapticStrength: Math.round(rawStrength),
    effectiveScore: parseFloat((baseSim * temporalMultiplier).toFixed(3)),
    daysSinceAccess: parseFloat(daysSinceAccess.toFixed(1)),
    isImmortal: false,
  };
}

/**
 * Returns half-life in days for a given lambda decay constant: t_1/2 = ln(2) / lambda
 */
export function getHalfLifeDays(lambda: number): number {
  if (lambda <= 0) return Infinity;
  return parseFloat((Math.LN2 / lambda).toFixed(1));
}

/**
 * Returns lambda for a requested half-life in days: lambda = ln(2) / half_life_days
 */
export function getLambdaForHalfLife(days: number): number {
  if (days <= 0) return 0.001;
  return parseFloat((Math.LN2 / days).toFixed(4));
}
