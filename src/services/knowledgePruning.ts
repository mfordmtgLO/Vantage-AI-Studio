/**
 * @file knowledgePruning.ts
 * @author Mike Ford <fordmj@gmail.com>
 * @license Apache-2.0
 * @copyright 2026 Mike Ford. All rights reserved.
 * 
 * Knowledge Hygiene & Memory Consolidation Service
 * Implements circadian "sleep" cycle consolidation, low-salience data pruning,
 * confidence score decay/reinforcement calibration, and contradiction detection
 * across Firebase Firestore user memory stores.
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { UserMemory } from '../types';
import { 
  fetchAllMemories, 
  saveUserMemory, 
  getLocalMemories, 
  saveLocalMemories 
} from './memoryService';
import { calculateTemporalDecayScore } from '../utils/temporalMemoryEngine';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Knowledge Hygiene Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface KnowledgePruningConfig {
  /** Minimum synaptic strength percentage (0-100) below which memory is considered low-salience */
  salienceThreshold: number;
  /** Inactivity threshold in days before non-pinned memories undergo confidence decay */
  inactivityThresholdDays: number;
  /** Rate of confidence reduction per consolidation period (e.g. 0.05 for 5% decay) */
  confidenceDecayStep: number;
  /** Confidence boost when memory is accessed or reinforced (e.g. +0.10) */
  reinforcementBonus: number;
  /** Action to take for low-salience items: 'archive' | 'decay_only' | 'delete' */
  pruneAction: 'archive' | 'decay_only' | 'delete';
  /** Whether to attempt automatic contradiction detection across semantic memories */
  enableContradictionScan: boolean;
  /** Whether to synthesize cross-domain "Dream Report" connections during consolidation */
  generateDreamReport: boolean;
}

export const DEFAULT_PRUNING_CONFIG: KnowledgePruningConfig = {
  salienceThreshold: 18, // Items with <18% synaptic strength are flagged
  inactivityThresholdDays: 21, // 3 weeks without access
  confidenceDecayStep: 0.05,
  reinforcementBonus: 0.08,
  pruneAction: 'archive',
  enableContradictionScan: true,
  generateDreamReport: true
};

export interface ContradictionPair {
  memoryAId: string;
  memoryATitle: string;
  memoryBId: string;
  memoryBTitle: string;
  contradictionReason: string;
  confidenceDifference: number;
  suggestedResolution: 'keep_newer' | 'keep_higher_confidence' | 'human_review';
}

export interface DreamConnection {
  domainA: string;
  domainB: string;
  sourceMemoryId: string;
  targetMemoryId: string;
  synthesizedInsight: string;
  salienceScore: number;
}

export interface KnowledgeHygieneReport {
  id: string;
  timestamp: string;
  userId?: string;
  scannedCount: number;
  activeCount: number;
  lowSalienceCount: number;
  archivedCount: number;
  deletedCount: number;
  confidenceRecalibratedCount: number;
  contradictionsDetected: ContradictionPair[];
  dreamReport: DreamConnection[];
  executiveSummary: string;
  durationMs: number;
}

/**
 * Recalculate confidence score for a memory based on access history, verification, and age.
 */
export function calculateConsolidatedConfidence(
  memory: UserMemory,
  daysInactive: number,
  config: KnowledgePruningConfig
): {
  newConfidence: number;
  previousConfidence: number;
  reason: string;
  confidenceUpdated: boolean;
} {
  const prevConfidence = memory.confidenceScore ?? 0.85;
  const accessCount = memory.temporal?.accessCount ?? 1;
  const isPinned = !!memory.temporal?.isPinnedImmortal;
  const importance = memory.temporal?.importanceScore ?? 5;

  let newConfidence = prevConfidence;
  let reason = 'Confidence maintained at baseline.';

  if (isPinned) {
    newConfidence = Math.min(1.0, prevConfidence + 0.02);
    reason = 'Pinned immortal memory — high certainty invariant.';
  } else if (accessCount > 5) {
    // High reinforcement
    const boost = Math.min(0.15, (accessCount - 5) * config.reinforcementBonus);
    newConfidence = Math.min(0.99, prevConfidence + boost);
    reason = `Reinforced by frequent operational access (x${accessCount}).`;
  } else if (daysInactive > config.inactivityThresholdDays) {
    // Gradual confidence decay for stale memories
    const cyclesInactive = Math.floor(daysInactive / config.inactivityThresholdDays);
    const penalty = Math.min(0.40, cyclesInactive * config.confidenceDecayStep);
    
    // Lower importance memories decay faster
    const importanceShield = Math.max(0.3, importance / 10);
    newConfidence = Math.max(0.10, prevConfidence - (penalty * (1.2 - importanceShield)));
    reason = `Decayed due to ${Math.round(daysInactive)} days of inactivity without validation.`;
  }

  // Round to 2 decimal places
  newConfidence = parseFloat(newConfidence.toFixed(2));
  const confidenceUpdated = Math.abs(newConfidence - prevConfidence) >= 0.01;

  return {
    newConfidence,
    previousConfidence: prevConfidence,
    reason,
    confidenceUpdated
  };
}

/**
 * Lightweight heuristic contradiction scanner between pairs of memories.
 */
export function detectMemoryContradictions(memories: UserMemory[]): ContradictionPair[] {
  const contradictions: ContradictionPair[] = [];
  const activeMemories = memories.filter(m => !m.isArchived);

  // Group by overlapping tags or titles to detect conflicting statements
  for (let i = 0; i < activeMemories.length; i++) {
    for (let j = i + 1; j < activeMemories.length; j++) {
      const a = activeMemories[i];
      const b = activeMemories[j];

      // Check for shared topic/tag overlap
      const commonTags = a.tags.filter(tag => b.tags.includes(tag));
      if (commonTags.length === 0 && a.category !== b.category) continue;

      const aLower = (a.title + ' ' + a.content).toLowerCase();
      const bLower = (b.title + ' ' + b.content).toLowerCase();

      // Check common contradiction patterns (e.g. rate change, guidelines conflict, status difference)
      const hasAntithesisKeywords = 
        (aLower.includes('must not') && bLower.includes('must')) ||
        (aLower.includes('deprecated') && bLower.includes('standard')) ||
        (aLower.includes('inactive') && bLower.includes('active')) ||
        (aLower.includes('disabled') && bLower.includes('enabled')) ||
        (aLower.includes('fha 580') && bLower.includes('fha 620')) ||
        (aLower.includes('dti 43%') && bLower.includes('dti 50%'));

      if (hasAntithesisKeywords) {
        const confA = a.confidenceScore ?? 0.85;
        const confB = b.confidenceScore ?? 0.85;
        const confDiff = parseFloat(Math.abs(confA - confB).toFixed(2));

        contradictions.push({
          memoryAId: a.id,
          memoryATitle: a.title,
          memoryBId: b.id,
          memoryBTitle: b.title,
          contradictionReason: `Divergent guidelines/rules detected across common topic: [${commonTags.join(', ')}]`,
          confidenceDifference: confDiff,
          suggestedResolution: confDiff > 0.25 
            ? 'keep_higher_confidence' 
            : (new Date(a.createdAt).getTime() > new Date(b.createdAt).getTime() ? 'keep_newer' : 'human_review')
        });
      }
    }
  }

  return contradictions;
}

/**
 * Generate serendipitous "Dream Report" synthesis between disparate knowledge domains.
 */
export function generateDreamReportConnections(memories: UserMemory[]): DreamConnection[] {
  const connections: DreamConnection[] = [];
  const validMemories = memories.filter(m => !m.isArchived && m.content.length > 30);

  if (validMemories.length < 2) return connections;

  // Cross-pollinate across distinct memory types or categories
  for (let i = 0; i < Math.min(validMemories.length, 6); i++) {
    for (let j = i + 1; j < Math.min(validMemories.length, 8); j++) {
      const a = validMemories[i];
      const b = validMemories[j];

      if (a.type !== b.type || a.category !== b.category) {
        connections.push({
          domainA: a.type.toUpperCase(),
          domainB: b.type.toUpperCase(),
          sourceMemoryId: a.id,
          targetMemoryId: b.id,
          synthesizedInsight: `Cross-domain synergy identified: Merging ${a.title} with ${b.title} unlocks automated operational leverage for scheduled client pipelines.`,
          salienceScore: Math.round(((a.temporal?.synapticStrength ?? 60) + (b.temporal?.synapticStrength ?? 60)) / 2)
        });
      }
      if (connections.length >= 4) break;
    }
    if (connections.length >= 4) break;
  }

  return connections;
}

/**
 * Core Knowledge Hygiene Routine:
 * Scans Firebase Firestore memory stores for low-salience data,
 * updates confidence scores based on temporal consolidation,
 * archives decayed nodes, and generates a structured hygiene report.
 */
export async function scanAndPruneKnowledge(
  userId?: string,
  customConfig?: Partial<KnowledgePruningConfig>
): Promise<KnowledgeHygieneReport> {
  const startTime = Date.now();
  const config = { ...DEFAULT_PRUNING_CONFIG, ...customConfig };
  const currentUid = userId || auth.currentUser?.uid;
  const now = new Date();
  const nowIso = now.toISOString();

  // 1. Ingest all current memories from Firestore / local storage
  const memories = await fetchAllMemories(currentUid);
  const reportId = `hygiene_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;

  let lowSalienceCount = 0;
  let archivedCount = 0;
  let deletedCount = 0;
  let confidenceRecalibratedCount = 0;
  const updatedMemoriesList: UserMemory[] = [];

  for (const memory of memories) {
    const stats = calculateTemporalDecayScore(memory, { nowDate: now });
    const isPinned = stats.isImmortal;
    const synapticStrength = stats.synapticStrength;
    const daysInactive = stats.daysSinceAccess;

    // Evaluate confidence recalibration
    const confidenceAnalysis = calculateConsolidatedConfidence(memory, daysInactive, config);

    let isArchived = memory.isArchived || false;
    let shouldDelete = false;

    // Check low-salience threshold for non-pinned items
    if (!isPinned && synapticStrength < config.salienceThreshold && daysInactive > config.inactivityThresholdDays) {
      lowSalienceCount++;

      if (config.pruneAction === 'archive' && !isArchived) {
        isArchived = true;
        archivedCount++;
      } else if (config.pruneAction === 'delete') {
        shouldDelete = true;
        deletedCount++;
      }
    }

    if (shouldDelete) {
      // If pruning action is hard delete, remove from cloud and local
      if (currentUid) {
        try {
          const docPath = `users/${currentUid}/memories/${memory.id}`;
          await deleteDoc(doc(db, 'users', currentUid, 'memories', memory.id));
        } catch (err) {
          console.warn(`Could not delete low-salience memory ${memory.id}:`, err);
        }
      }
      continue; // Skip appending to updated list
    }

    // Build consolidated memory payload
    const historyEntry = confidenceAnalysis.confidenceUpdated ? {
      date: nowIso,
      action: isArchived ? 'ARCHIVE_LOW_SALIENCE' : 'CONFIDENCE_RECALIBRATION',
      previousConfidence: confidenceAnalysis.previousConfidence,
      newConfidence: confidenceAnalysis.newConfidence,
      reason: confidenceAnalysis.reason
    } : null;

    const existingHistory = Array.isArray(memory.consolidationHistory) ? memory.consolidationHistory : [];
    const updatedHistory = historyEntry ? [historyEntry, ...existingHistory].slice(0, 10) : existingHistory;

    if (confidenceAnalysis.confidenceUpdated || isArchived !== memory.isArchived) {
      confidenceRecalibratedCount++;
    }

    const updatedMemory: UserMemory = {
      ...memory,
      isArchived,
      confidenceScore: confidenceAnalysis.newConfidence,
      lastConsolidatedAt: nowIso,
      consolidationHistory: updatedHistory,
      temporal: {
        accessCount: memory.temporal?.accessCount ?? 1,
        lastAccessedAt: memory.temporal?.lastAccessedAt || memory.createdAt,
        decayLambda: memory.temporal?.decayLambda ?? 0.05,
        importanceScore: memory.temporal?.importanceScore ?? 5,
        synapticStrength,
        isPinnedImmortal: isPinned,
        calculatedRecencyScore: stats.effectiveScore
      }
    };

    // Update in Firestore if connected
    if (currentUid && (confidenceAnalysis.confidenceUpdated || isArchived !== memory.isArchived)) {
      try {
        const memoryDocRef = doc(db, 'users', currentUid, 'memories', memory.id);
        await setDoc(memoryDocRef, {
          confidenceScore: updatedMemory.confidenceScore,
          isArchived: updatedMemory.isArchived,
          lastConsolidatedAt: updatedMemory.lastConsolidatedAt,
          consolidationHistory: updatedMemory.consolidationHistory,
          temporal: updatedMemory.temporal,
          updatedAt: nowIso
        }, { merge: true });
      } catch (err) {
        console.warn(`Firestore hygiene update error on ${memory.id}:`, err);
      }
    }

    updatedMemoriesList.push(updatedMemory);
  }

  // Update local session storage
  saveLocalMemories(updatedMemoriesList);

  // 2. Run Contradiction Audit
  const contradictions = config.enableContradictionScan 
    ? detectMemoryContradictions(updatedMemoriesList)
    : [];

  // Flag contradictions on matching memory records
  if (contradictions.length > 0) {
    for (const contra of contradictions) {
      const matchA = updatedMemoriesList.find(m => m.id === contra.memoryAId);
      const matchB = updatedMemoriesList.find(m => m.id === contra.memoryBId);
      if (matchA) matchA.contradictionFlags = [contra.contradictionReason];
      if (matchB) matchB.contradictionFlags = [contra.contradictionReason];
    }
  }

  // 3. Generate Dream Report Connections
  const dreamReport = config.generateDreamReport
    ? generateDreamReportConnections(updatedMemoriesList)
    : [];

  const durationMs = Date.now() - startTime;
  const executiveSummary = `Knowledge Hygiene Complete: Scanned ${memories.length} memories. Identified ${lowSalienceCount} low-salience nodes, recalibrated ${confidenceRecalibratedCount} confidence scores, detected ${contradictions.length} potential guideline contradictions, and synthesized ${dreamReport.length} cross-domain dream insights in ${durationMs}ms.`;

  const report: KnowledgeHygieneReport = {
    id: reportId,
    timestamp: nowIso,
    userId: currentUid,
    scannedCount: memories.length,
    activeCount: updatedMemoriesList.filter(m => !m.isArchived).length,
    lowSalienceCount,
    archivedCount,
    deletedCount,
    confidenceRecalibratedCount,
    contradictionsDetected: contradictions,
    dreamReport,
    executiveSummary,
    durationMs
  };

  // Persist hygiene report to Firestore
  if (currentUid) {
    try {
      const reportRef = doc(db, 'users', currentUid, 'hygieneReports', reportId);
      await setDoc(reportRef, report);
    } catch (err) {
      console.warn('Could not persist hygiene report to Firestore:', err);
    }
  }

  return report;
}

/**
 * Schedule a periodic background interval for Knowledge Hygiene scans.
 * Returns a cleanup unsubscribe function.
 */
export function schedulePeriodicKnowledgeHygiene(
  intervalMs: number = 1000 * 60 * 60 * 24, // Default to once every 24 hours
  onReport?: (report: KnowledgeHygieneReport) => void,
  customConfig?: Partial<KnowledgePruningConfig>
): () => void {
  const timer = setInterval(async () => {
    try {
      const report = await scanAndPruneKnowledge(undefined, customConfig);
      if (onReport) onReport(report);
    } catch (err) {
      console.error('Periodic Knowledge Hygiene execution failed:', err);
    }
  }, intervalMs);

  return () => clearInterval(timer);
}
