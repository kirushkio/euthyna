import { createHash } from 'crypto';
import { DecisionRecord, ProposedAction, GateRuleResult } from '@euthyna/engine';

/**
 * Deterministic JSON stringifier (canonical alphabetical key order)
 */
export function canonicalJsonStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    if (typeof obj === 'bigint') {
      return JSON.stringify(obj.toString());
    }
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map(canonicalJsonStringify).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map(
    key => `${JSON.stringify(key)}:${canonicalJsonStringify(obj[key])}`
  );
  return '{' + entries.join(',') + '}';
}

/**
 * Computes sha256 hash of (canonical JSON of the record without its hash + prev_hash)
 */
export function computeRecordHash(recordWithoutHash: Omit<DecisionRecord, 'hash' | 'signature'>, prevHash: string): string {
  const canonicalJson = canonicalJsonStringify(recordWithoutHash);
  const dataToHash = canonicalJson + prevHash;
  return createHash('sha256').update(dataToHash, 'utf8').digest('hex');
}

export const GENESIS_HASH = '0x0000000000000000000000000000000000000000000000000000000000000000';

/**
 * Creates a fully hashed DecisionRecord
 */
export function createDecisionRecord(
  params: {
    seq: number;
    timestamp: number;
    simulatedDay: number;
    businessId: string;
    snapshotDigest: string;
    evidenceFlags: Record<string, boolean>;
    forecastSummary: {
      P5Liquid: string;
      P50Liquid: string;
      shortfallProbability: number;
    };
    candidateActions: {
      type: any;
      expectedValue: number;
      description: string;
    }[];
    chosenAction: ProposedAction;
    rationale: string;
    modelId: string;
    promptVersion: string;
    gateResults: GateRuleResult[];
    transactionHash?: string;
    anchoredTx?: string;
    injectionFlags?: {
      detected: boolean;
      flaggedSpan?: string;
    };
  },
  prevHash: string = GENESIS_HASH
): DecisionRecord {
  const recordWithoutHash: Omit<DecisionRecord, 'hash' | 'signature'> = {
    ...params,
    prevHash
  };

  const hash = '0x' + computeRecordHash(recordWithoutHash, prevHash);

  return {
    ...recordWithoutHash,
    hash
  };
}
