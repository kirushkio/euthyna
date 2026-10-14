import { describe, it, expect } from 'vitest';
import { createDecisionRecord, GENESIS_HASH } from '../src/hashchain.js';
import { verifyLedgerChain } from '../src/verify.js';
import { generateBeancountLedger } from '../src/beancount.js';

describe('Audit Ledger & Hash Chain', () => {
  it('creates valid chained decision records', async () => {
    const record1 = createDecisionRecord(
      {
        seq: 1,
        timestamp: 1000,
        simulatedDay: 0,
        businessId: 'biz-1',
        snapshotDigest: 'digest-1',
        evidenceFlags: { test: true },
        forecastSummary: { P5Liquid: '10000.00', P50Liquid: '10000.00', shortfallProbability: 0 },
        candidateActions: [],
        chosenAction: {
          id: 'act-1',
          type: 'HOLD',
          businessId: 'biz-1',
          amount: 0n,
          expectedValueUsd: 0,
          alternatives: [],
          rationale: 'Holding liquid',
          confidence: 1,
          evidenceRefs: [],
          idempotencyKey: 'k-1'
        },
        rationale: 'Holding',
        modelId: 'test',
        promptVersion: '1',
        gateResults: []
      },
      GENESIS_HASH
    );

    const record2 = createDecisionRecord(
      {
        seq: 2,
        timestamp: 2000,
        simulatedDay: 1,
        businessId: 'biz-1',
        snapshotDigest: 'digest-2',
        evidenceFlags: { test: true },
        forecastSummary: { P5Liquid: '10000.00', P50Liquid: '10000.00', shortfallProbability: 0 },
        candidateActions: [],
        chosenAction: {
          id: 'act-2',
          type: 'HOLD',
          businessId: 'biz-1',
          amount: 0n,
          expectedValueUsd: 0,
          alternatives: [],
          rationale: 'Holding',
          confidence: 1,
          evidenceRefs: [],
          idempotencyKey: 'k-2'
        },
        rationale: 'Holding',
        modelId: 'test',
        promptVersion: '1',
        gateResults: []
      },
      record1.hash
    );

    const report = await verifyLedgerChain([record1, record2]);
    expect(report.allValid).toBe(true);
    expect(report.totalRecords).toBe(2);
  });

  it('detects tampering in record data or broken link', async () => {
    const record1 = createDecisionRecord(
      {
        seq: 1,
        timestamp: 1000,
        simulatedDay: 0,
        businessId: 'biz-1',
        snapshotDigest: 'digest-1',
        evidenceFlags: {},
        forecastSummary: { P5Liquid: '10000.00', P50Liquid: '10000.00', shortfallProbability: 0 },
        candidateActions: [],
        chosenAction: {
          id: 'act-1',
          type: 'HOLD',
          businessId: 'biz-1',
          amount: 0n,
          expectedValueUsd: 0,
          alternatives: [],
          rationale: 'Original text',
          confidence: 1,
          evidenceRefs: [],
          idempotencyKey: 'k-1'
        },
        rationale: 'Original',
        modelId: 'test',
        promptVersion: '1',
        gateResults: []
      },
      GENESIS_HASH
    );

    // Tampered copy
    const tamperedRecord = { ...record1, rationale: 'TAMPERED RATIONALE' };
    const report = await verifyLedgerChain([tamperedRecord]);
    expect(report.allValid).toBe(false);
    expect(report.firstFailingSeq).toBe(1);
  });

  it('generates well-formatted Beancount export', () => {
    const text = generateBeancountLedger({
      businessName: 'Studio A',
      startDate: '2026-10-01',
      records: [],
      dailySnapshots: []
    });
    expect(text).toContain('option "operating_currency" "USDC"');
    expect(text).toContain('Assets:Vault:USDC');
  });
});
