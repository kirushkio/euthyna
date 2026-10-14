import { TreasurySnapshot, ProposedAction, TreasuryPlanner, PolicyGate } from '@euthyna/engine';

export type StrategyType = 'B0' | 'B1' | 'B2' | 'E0' | 'E1';

export class TreasuryStrategies {
  /**
   * B0 Hold: Keep everything liquid, pay only on due date, no yield
   */
  public static runB0(snapshot: TreasurySnapshot): ProposedAction[] {
    const currentDay = snapshot.simulatedDay;
    const dueObligation = snapshot.obligations.find(o => !o.paid && o.dueDay === currentDay);
    if (dueObligation) {
      return [{
        id: `b0-pay-${dueObligation.id}`,
        type: 'PAY_OBLIGATION',
        businessId: snapshot.businessId,
        obligationId: dueObligation.id,
        amount: dueObligation.amount,
        expectedValueUsd: 0,
        alternatives: [],
        rationale: `B0 Baseline: Paying on due date Day ${currentDay}`,
        confidence: 1.0,
        evidenceRefs: [dueObligation.id],
        idempotencyKey: `b0-${dueObligation.id}`
      }];
    }
    return [{
      id: `b0-hold-${currentDay}`,
      type: 'HOLD',
      businessId: snapshot.businessId,
      amount: 0n,
      expectedValueUsd: 0,
      alternatives: [],
      rationale: 'B0 Baseline: Holding liquid',
      confidence: 1.0,
      evidenceRefs: [],
      idempotencyKey: `b0-hold-${currentDay}`
    }];
  }

  /**
   * B1 Fixed Rule: Maintain floor, sweep surplus above floor daily into highest APR venue,
   * redeem when below floor, pay obligations only on due date (never captures discounts!).
   */
  public static runB1(snapshot: TreasurySnapshot): ProposedAction[] {
    const currentDay = snapshot.simulatedDay;
    const activeVenues = snapshot.venues.filter(v => v.enabled).sort((a, b) => b.aprBps - a.aprBps);
    const bestVenue = activeVenues[0];

    // Check if obligation due today
    const dueObligation = snapshot.obligations.find(o => !o.paid && o.dueDay === currentDay);
    if (dueObligation) {
      // If liquid is insufficient, redeem
      if (snapshot.liquidBalance < dueObligation.amount && bestVenue && bestVenue.principalDeployed > 0n) {
        const shortfall = dueObligation.amount - snapshot.liquidBalance;
        const redeemAmt = shortfall > bestVenue.principalDeployed ? bestVenue.principalDeployed : shortfall;
        return [{
          id: `b1-redeem-${currentDay}`,
          type: 'REDEEM',
          businessId: snapshot.businessId,
          venueId: bestVenue.id,
          amount: redeemAmt,
          expectedValueUsd: 0,
          alternatives: [],
          rationale: 'B1 Fixed Rule: Redeeming shortfall for due obligation',
          confidence: 1.0,
          evidenceRefs: [],
          idempotencyKey: `b1-redeem-${currentDay}`
        }];
      }

      return [{
        id: `b1-pay-${dueObligation.id}`,
        type: 'PAY_OBLIGATION',
        businessId: snapshot.businessId,
        obligationId: dueObligation.id,
        amount: dueObligation.amount,
        expectedValueUsd: 0,
        alternatives: [],
        rationale: `B1 Fixed Rule: Paying on due date Day ${currentDay}`,
        confidence: 1.0,
        evidenceRefs: [dueObligation.id],
        idempotencyKey: `b1-pay-${dueObligation.id}`
      }];
    }

    // Fixed sweep: if liquid > reserve floor, sweep everything into venue
    if (snapshot.liquidBalance > snapshot.policy.minLiquidReserve && bestVenue) {
      const sweepAmount = snapshot.liquidBalance - snapshot.policy.minLiquidReserve;
      if (sweepAmount >= snapshot.policy.minTicket) {
        return [{
          id: `b1-sweep-${currentDay}`,
          type: 'ALLOCATE',
          businessId: snapshot.businessId,
          venueId: bestVenue.id,
          amount: sweepAmount,
          expectedValueUsd: 0,
          alternatives: [],
          rationale: 'B1 Fixed Rule: Sweeping liquid above reserve floor',
          confidence: 1.0,
          evidenceRefs: [],
          idempotencyKey: `b1-sweep-${currentDay}`
        }];
      }
    }

    // If liquid < reserve floor and we have funds in venue, redeem
    if (snapshot.liquidBalance < snapshot.policy.minLiquidReserve && bestVenue && bestVenue.principalDeployed > 0n) {
      const shortfall = snapshot.policy.minLiquidReserve - snapshot.liquidBalance;
      const redeemAmt = shortfall > bestVenue.principalDeployed ? bestVenue.principalDeployed : shortfall;
      return [{
        id: `b1-topup-${currentDay}`,
        type: 'REDEEM',
        businessId: snapshot.businessId,
        venueId: bestVenue.id,
        amount: redeemAmt,
        expectedValueUsd: 0,
        alternatives: [],
        rationale: 'B1 Fixed Rule: Topping up liquid to reserve floor',
        confidence: 1.0,
        evidenceRefs: [],
        idempotencyKey: `b1-topup-${currentDay}`
      }];
    }

    return [{
      id: `b1-hold-${currentDay}`,
      type: 'HOLD',
      businessId: snapshot.businessId,
      amount: 0n,
      expectedValueUsd: 0,
      alternatives: [],
      rationale: 'B1 Fixed Rule: Holding',
      confidence: 1.0,
      evidenceRefs: [],
      idempotencyKey: `b1-hold-${currentDay}`
    }];
  }

  /**
   * E0 Euthyna: Deterministic Planner + Gate
   */
  public static runE0(snapshot: TreasurySnapshot): ProposedAction[] {
    return TreasuryPlanner.plan(snapshot);
  }
}
