import {
  TreasurySnapshot,
  ProposedAction,
  PolicyGate,
  GateEvaluation,
  TreasuryPlanner,
  DecisionRecord,
  formatBaseUnits
} from '@euthyna/engine';
import { createDecisionRecord, signDecisionRecord, GENESIS_HASH } from '@euthyna/ledger';
import { AgentTools, AgentContext } from './tools.js';

export interface TickResult {
  simulatedDay: number;
  roundsCount: number;
  proposedAction: ProposedAction;
  gateEvaluation: GateEvaluation;
  executed: boolean;
  escalated: boolean;
  decisionRecord: DecisionRecord;
  updatedSnapshot: TreasurySnapshot;
  receiptTxHash?: string;
}

export class AgentOrchestrator {
  private prevRecordHash: string = GENESIS_HASH;
  private currentSeq: number = 1;

  constructor(
    private agentPrivateKey?: `0x${string}`,
    private agentAddress?: `0x${string}`
  ) {}

  /**
   * Runs one agent cycle (Tick) for a business snapshot
   * Implements the 3-round Propose -> Dry-Run -> Revise loop
   */
  public async tick(
    snapshot: TreasurySnapshot,
    overrideAction?: ProposedAction
  ): Promise<TickResult> {
    const context: AgentContext = {
      snapshot,
      humanReviewRequests: []
    };
    const tools = new AgentTools(context);

    let round = 1;
    const maxRounds = 3;
    let currentProposal: ProposedAction =
      overrideAction || TreasuryPlanner.plan(snapshot)[0];

    let gateEval: GateEvaluation = tools.dryRunAction(currentProposal);

    // Revise loop if gate fails and action is not already escalated
    while (!gateEval.passed && !gateEval.escalate && round < maxRounds) {
      round++;
      // Attempt to revise action: fall back to safe HOLD or REDEEM
      const fallbackActions = TreasuryPlanner.plan({
        ...snapshot,
        // Suppress offending action
        obligations: snapshot.obligations.filter(o => o.id !== currentProposal.obligationId)
      });
      currentProposal = fallbackActions[0] || {
        id: `act-revised-hold-${Date.now()}`,
        type: 'HOLD',
        businessId: snapshot.businessId,
        amount: 0n,
        expectedValueUsd: 0,
        alternatives: [],
        rationale: `Revised in Round ${round} to HOLD after gate rejected previous proposal: ${gateEval.rejectionReason}`,
        confidence: 0.95,
        evidenceRefs: [],
        idempotencyKey: `revised-hold-${round}-${Date.now()}`
      };
      gateEval = tools.dryRunAction(currentProposal);
    }

    // If still failing after max rounds, escalate
    let isEscalated = gateEval.escalate;
    if (!gateEval.passed && !gateEval.escalate) {
      isEscalated = true;
      currentProposal = {
        ...currentProposal,
        type: 'ESCALATE',
        rationale: `Auto-escalated after ${maxRounds} failed revision rounds. Gate rejection reason: ${gateEval.rejectionReason}`
      };
      tools.requestHumanReview(`Gate rejected proposal: ${gateEval.rejectionReason}`, currentProposal);
    }

    // Execution phase (state transition in snapshot)
    let executed = false;
    let receiptTxHash: string | undefined;
    const updatedSnapshot: TreasurySnapshot = structuredClone(snapshot);

    if (gateEval.passed && !isEscalated) {
      executed = true;
      receiptTxHash = `0xarc${Math.random().toString(16).slice(2).padStart(64, '0')}`;

      if (currentProposal.type === 'PAY_OBLIGATION') {
        const target = updatedSnapshot.obligations.find(o => o.id === currentProposal.obligationId);
        if (target) {
          target.paid = true;
          target.paidAmount = currentProposal.amount;
          target.paidTx = receiptTxHash;
        }
        updatedSnapshot.liquidBalance -= currentProposal.amount;
        updatedSnapshot.spentToday += currentProposal.amount;
      } else if (currentProposal.type === 'ALLOCATE') {
        const venue = updatedSnapshot.venues.find(v => v.id === currentProposal.venueId);
        if (venue) {
          venue.principalDeployed += currentProposal.amount;
          updatedSnapshot.liquidBalance -= currentProposal.amount;
        }
      } else if (currentProposal.type === 'REDEEM') {
        const venue = updatedSnapshot.venues.find(v => v.id === currentProposal.venueId);
        if (venue && venue.principalDeployed >= currentProposal.amount) {
          venue.principalDeployed -= currentProposal.amount;
          updatedSnapshot.liquidBalance += currentProposal.amount;
        }
      }
    }

    // Generate signed, hash-chained DecisionRecord
    const forecast = tools.forecastLiquidity(14);
    let record = createDecisionRecord(
      {
        seq: this.currentSeq++,
        timestamp: Date.now(),
        simulatedDay: snapshot.simulatedDay,
        businessId: snapshot.businessId,
        snapshotDigest: `L=${formatBaseUnits(snapshot.liquidBalance)},R=${formatBaseUnits(snapshot.policy.minLiquidReserve)}`,
        evidenceFlags: {
          gatePassed: gateEval.passed,
          isEscalated,
          threeWayMatchChecked: true
        },
        forecastSummary: {
          P5Liquid: forecast.minP5LiquidUsdc,
          P50Liquid: formatBaseUnits(snapshot.liquidBalance),
          shortfallProbability: parseFloat(forecast.overallShortfallProbability) / 100
        },
        candidateActions: [
          {
            type: currentProposal.type,
            expectedValue: currentProposal.expectedValueUsd,
            description: currentProposal.rationale
          },
          ...currentProposal.alternatives.map(a => ({
            type: a.type,
            expectedValue: a.expectedValueUsd,
            description: a.reason
          }))
        ],
        chosenAction: currentProposal,
        rationale: currentProposal.rationale,
        modelId: 'claude-sonnet-5-5-adapter',
        promptVersion: '1.0-euthyna',
        gateResults: gateEval.ruleResults,
        transactionHash: receiptTxHash,
        anchoredTx: receiptTxHash || `0xanchor${Math.random().toString(16).slice(2).padStart(64, '0')}`
      },
      this.prevRecordHash
    );

    // Cryptographic signature
    if (this.agentPrivateKey) {
      record = await signDecisionRecord(record, this.agentPrivateKey);
    }

    this.prevRecordHash = record.hash;

    return {
      simulatedDay: snapshot.simulatedDay,
      roundsCount: round,
      proposedAction: currentProposal,
      gateEvaluation: gateEval,
      executed,
      escalated: isEscalated,
      decisionRecord: record,
      updatedSnapshot,
      receiptTxHash
    };
  }
}
