import { describe, it, expect } from 'vitest';
import { PolicyGate } from '../src/gate.js';
import { TreasurySnapshot, ProposedAction } from '../src/types.js';

describe('PolicyGate Rules G1-G14', () => {
  const mockSnapshot: TreasurySnapshot = {
    businessId: 'test-biz',
    liquidBalance: 10_000_000_000n, // $10,000
    reserveFloor: 3_000_000_000n, // $3,000
    venues: [
      {
        id: 'v1',
        name: 'SimYield',
        adapterAddress: '0x1111111111111111111111111111111111111111',
        aprBps: 500,
        redemptionLatencyDays: 1,
        capacityCap: 50_000_000_000n,
        maxShareBps: 5000,
        enabled: true,
        principalDeployed: 0n,
        isSimulated: true
      }
    ],
    obligations: [
      {
        id: '0x1111111111111111111111111111111111111111111111111111111111111111',
        businessId: 'test-biz',
        vendorId: 'v-aws',
        payeeAddress: '0x2222222222222222222222222222222222222222',
        amount: 500_000_000n, // $500
        dueDay: 10,
        requiresReceipt: true,
        received: true,
        kind: 'DISCRETIONARY',
        documentHash: '0x3333333333333333333333333333333333333333333333333333333333333333',
        paid: false,
        createdAt: 0
      }
    ],
    receivables: [],
    vendors: {
      'v-aws': {
        id: 'v-aws',
        businessId: 'test-biz',
        name: 'AWS',
        payeeAddress: '0x2222222222222222222222222222222222222222',
        score: 95,
        status: 'Active',
        activeAfterDay: 0,
        historicalDeliveries: 10,
        disputeCount: 0
      }
    },
    policy: {
      perTxCap: 2_500_000_000n,
      dailyCap: 6_000_000_000n,
      minLiquidReserve: 3_000_000_000n,
      newPayeeCooldownDays: 1,
      minTicket: 250_000_000n,
      epsilonShortfall: 0.02,
      maxGasFeeShareOfBenefit: 0.10,
      minConfidenceThreshold: 0.80
    },
    simulatedDay: 10,
    spentToday: 0n,
    isPaused: false
  };

  it('passes valid due-date payment', () => {
    const action: ProposedAction = {
      id: 'act-1',
      type: 'PAY_OBLIGATION',
      businessId: 'test-biz',
      obligationId: mockSnapshot.obligations[0].id,
      amount: 500_000_000n,
      expectedValueUsd: 0,
      alternatives: [],
      rationale: 'Pay invoice on due date',
      confidence: 0.95,
      evidenceRefs: [mockSnapshot.obligations[0].id],
      idempotencyKey: 'key-1'
    };

    const result = PolicyGate.evaluate(action, mockSnapshot);
    expect(result.passed).toBe(true);
    expect(result.escalate).toBe(false);
  });

  it('rejects action when vault is paused (G13)', () => {
    const action: ProposedAction = {
      id: 'act-1',
      type: 'PAY_OBLIGATION',
      businessId: 'test-biz',
      obligationId: mockSnapshot.obligations[0].id,
      amount: 500_000_000n,
      expectedValueUsd: 0,
      alternatives: [],
      rationale: 'Pay invoice',
      confidence: 0.95,
      evidenceRefs: [],
      idempotencyKey: 'key-1'
    };

    const result = PolicyGate.evaluate(action, { ...mockSnapshot, isPaused: true });
    expect(result.passed).toBe(false);
    expect(result.ruleResults.find(r => r.ruleId === 'G13')?.passed).toBe(false);
  });

  it('rejects action exceeding per-transaction cap (G5)', () => {
    const action: ProposedAction = {
      id: 'act-big',
      type: 'ALLOCATE',
      businessId: 'test-biz',
      venueId: 'v1',
      amount: 3_000_000_000n, // $3,000 > $2,500 cap
      expectedValueUsd: 10,
      alternatives: [],
      rationale: 'Sweep surplus',
      confidence: 0.95,
      evidenceRefs: [],
      idempotencyKey: 'key-2'
    };

    const result = PolicyGate.evaluate(action, mockSnapshot);
    expect(result.passed).toBe(false);
    expect(result.ruleResults.find(r => r.ruleId === 'G5')?.passed).toBe(false);
  });

  it('rejects duplicate payment on already-paid obligation (G2)', () => {
    const paidSnapshot = {
      ...mockSnapshot,
      obligations: [{ ...mockSnapshot.obligations[0], paid: true }]
    };
    const action: ProposedAction = {
      id: 'act-dup',
      type: 'PAY_OBLIGATION',
      businessId: 'test-biz',
      obligationId: mockSnapshot.obligations[0].id,
      amount: 500_000_000n,
      expectedValueUsd: 0,
      alternatives: [],
      rationale: 'Pay again',
      confidence: 0.95,
      evidenceRefs: [],
      idempotencyKey: 'key-3'
    };

    const result = PolicyGate.evaluate(action, paidSnapshot);
    expect(result.passed).toBe(false);
    expect(result.ruleResults.find(r => r.ruleId === 'G2')?.passed).toBe(false);
  });
});
