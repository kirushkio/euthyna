import { TreasurySnapshot, ProposedAction, Obligation, YieldVenue, ActionAlternative } from './types.js';
import { formatBaseUnits } from './money.js';

export interface DiscountAnalysis {
  annualizedApr: number;
  discountDollars: number;
  foregoneYieldDollars: number;
  gasFeeDollars: number;
  liquidityCostDollars: number;
  prepayRiskDollars: number;
  netExpectedValueUsd: number;
  recommendEarlyPay: boolean;
  explanation: string;
}

export class TreasuryPlanner {
  /**
   * Calculates annualized return of early payment discount term
   * Formula: (p / (100 - p)) * (365 / (N - n))
   */
  public static calculateDiscountApr(p: number, n: number, N: number): number {
    if (N <= n || p <= 0) return 0;
    const rate = p / (100 - p);
    const annualized = rate * (365 / (N - n));
    return annualized;
  }

  /**
   * Analyzes an obligation with discount terms and evaluates Expected Value (EV)
   */
  public static evaluateEarlyPaymentEV(
    obligation: Obligation,
    snapshot: TreasurySnapshot,
    bestVenueApr: number = 0.05
  ): DiscountAnalysis {
    if (!obligation.discountTerms) {
      return {
        annualizedApr: 0,
        discountDollars: 0,
        foregoneYieldDollars: 0,
        gasFeeDollars: 0,
        liquidityCostDollars: 0,
        prepayRiskDollars: 0,
        netExpectedValueUsd: 0,
        recommendEarlyPay: false,
        explanation: 'No discount terms available'
      };
    }

    const { p, n, N } = obligation.discountTerms;
    const daysAccelerated = N - n;
    const annualizedApr = this.calculateDiscountApr(p, n, N);

    const fullAmountUsd = Number(obligation.amount) / 1e6;
    const discountFraction = p / 100;
    const discountDollars = fullAmountUsd * discountFraction;
    const amountPaidUsd = fullAmountUsd - discountDollars;

    // Foregone yield if cash remained in yield venue for the accelerated window
    const foregoneYieldDollars = (amountPaidUsd * bestVenueApr * daysAccelerated) / 365;

    // Gas fee on Arc Testnet is ~0.01 USDC
    const gasFeeDollars = 0.01;

    // Liquidity cost: risk of bumping into mandatory obligations or reserve floor
    const vendor = snapshot.vendors[obligation.vendorId];
    const vendorReliability = vendor ? vendor.score / 100 : 0.8;
    const prepayRiskDollars = amountPaidUsd * (1 - vendorReliability) * 0.05;

    const liquidSurplusAfterPayment = snapshot.liquidBalance - obligation.amount - snapshot.policy.minLiquidReserve;
    const liquidityCostDollars = liquidSurplusAfterPayment < 0n ? 15.0 : 0.0;

    const netExpectedValueUsd =
      discountDollars - foregoneYieldDollars - gasFeeDollars - liquidityCostDollars - prepayRiskDollars;

    const recommendEarlyPay =
      netExpectedValueUsd > 0 &&
      snapshot.simulatedDay === n && // Pay on the LAST day of the discount window!
      obligation.received &&
      liquidSurplusAfterPayment >= 0n;

    let explanation = `Discount saves $${discountDollars.toFixed(2)} (${(annualizedApr * 100).toFixed(1)}% annualized APR). `;
    explanation += `Yield given up: $${foregoneYieldDollars.toFixed(2)}. Gas: $${gasFeeDollars.toFixed(2)}. `;
    explanation += `Net EV: +$${netExpectedValueUsd.toFixed(2)}. `;
    if (snapshot.simulatedDay < n) {
      explanation += `Waiting until Day ${n} (last discount day) to keep earning yield until the window closes.`;
    } else if (snapshot.simulatedDay === n) {
      explanation += `Executing today (Day ${n}) to capture discount before expiration.`;
    }

    return {
      annualizedApr,
      discountDollars,
      foregoneYieldDollars,
      gasFeeDollars,
      liquidityCostDollars,
      prepayRiskDollars,
      netExpectedValueUsd,
      recommendEarlyPay,
      explanation
    };
  }

  /**
   * Plans the optimal set of actions for the current simulated tick (E0 deterministic strategy)
   */
  public static plan(snapshot: TreasurySnapshot): ProposedAction[] {
    const actions: ProposedAction[] = [];
    const currentDay = snapshot.simulatedDay;

    // Sort venues by APR descending
    const activeVenues = snapshot.venues
      .filter(v => v.enabled)
      .sort((a, b) => b.aprBps - a.aprBps);
    const bestVenue = activeVenues[0];
    const bestApr = bestVenue ? bestVenue.aprBps / 10000 : 0.05;

    // 1. Check upcoming mandatory obligations due soon to see if we need redemptions (Just-in-time redemption)
    const upcomingMandatory = snapshot.obligations.filter(o => !o.paid && o.kind === 'MANDATORY');
    for (const ob of upcomingMandatory) {
      const daysUntilDue = ob.dueDay - currentDay;
      const venueLatency = bestVenue ? bestVenue.redemptionLatencyDays : 1;
      // If due within latency + 1 day and liquid is below payment amount + reserve
      if (daysUntilDue <= venueLatency + 1 && snapshot.liquidBalance < ob.amount + snapshot.policy.minLiquidReserve) {
        // We need to redeem from venue!
        const shortfall = ob.amount + snapshot.policy.minLiquidReserve - snapshot.liquidBalance;
        const totalDeployed = activeVenues.reduce((acc, v) => acc + v.principalDeployed, 0n);
        if (totalDeployed > 0n && shortfall > 0n) {
          const redeemAmount = shortfall > totalDeployed ? totalDeployed : shortfall;
          actions.push({
            id: `act-redeem-${currentDay}-${Date.now()}`,
            type: 'REDEEM',
            businessId: snapshot.businessId,
            venueId: bestVenue?.id,
            amount: redeemAmount,
            expectedValueUsd: 0,
            alternatives: [
              { type: 'HOLD', expectedValueUsd: -50, reason: 'Risk defaulting on payroll / mandatory payment' }
            ],
            rationale: `Redeeming $${(Number(redeemAmount) / 1e6).toFixed(2)} to ensure liquid buffer for upcoming mandatory payment of $${(Number(ob.amount) / 1e6).toFixed(2)} on Day ${ob.dueDay} respecting T+${venueLatency} delay.`,
            confidence: 0.98,
            evidenceRefs: [ob.id],
            idempotencyKey: `redeem-${snapshot.businessId}-${currentDay}-${ob.id}`
          });
          return actions; // Prioritize liquidity safety
        }
      }
    }

    // 2. Check obligations due today or on their last discount day
    const pendingObligations = snapshot.obligations.filter(o => !o.paid);
    let simulatedLiquid = snapshot.liquidBalance;
    let simulatedSpentToday = snapshot.spentToday;

    // First, process mandatory due-date obligations
    for (const ob of pendingObligations) {
      if (ob.dueDay === currentDay) {
        if (simulatedSpentToday + ob.amount <= snapshot.policy.dailyCap) {
          actions.push({
            id: `act-pay-due-${ob.id}-${currentDay}`,
            type: 'PAY_OBLIGATION',
            businessId: snapshot.businessId,
            obligationId: ob.id,
            amount: ob.amount,
            expectedValueUsd: 0,
            alternatives: [
              { type: 'HOLD', expectedValueUsd: -25, reason: 'Late payment penalties and vendor relationship damage' }
            ],
            rationale: `Invoice due today (Day ${currentDay}). Paying exact registered amount $${(Number(ob.amount) / 1e6).toFixed(2)}.`,
            confidence: 0.99,
            evidenceRefs: [ob.id, ob.documentHash],
            idempotencyKey: `pay-due-${ob.id}`
          });
          simulatedLiquid = simulatedLiquid >= ob.amount ? simulatedLiquid - ob.amount : 0n;
          simulatedSpentToday += ob.amount;
        }
      }
    }

    // Next, process eligible early discount opportunities
    for (const ob of pendingObligations) {
      if (ob.dueDay !== currentDay && ob.discountTerms) {
        const analysis = this.evaluateEarlyPaymentEV(ob, snapshot, bestApr);
        if (currentDay === ob.discountTerms.n && analysis.netExpectedValueUsd > 0) {
          if (!ob.requiresReceipt || ob.received) {
            const discountedAmount = (ob.amount * BigInt(10000 - Math.round(ob.discountTerms.p * 100))) / 10000n;
            // Check if paying preserves liquid reserve floor and daily cap
            if (
              simulatedLiquid >= discountedAmount + snapshot.policy.minLiquidReserve &&
              simulatedSpentToday + discountedAmount <= snapshot.policy.dailyCap
            ) {
              actions.push({
                id: `act-pay-discount-${ob.id}-${currentDay}`,
                type: 'PAY_OBLIGATION',
                businessId: snapshot.businessId,
                obligationId: ob.id,
                amount: discountedAmount,
                expectedValueUsd: analysis.netExpectedValueUsd,
                alternatives: [
                  {
                    type: 'HOLD',
                    expectedValueUsd: -analysis.discountDollars,
                    reason: `Wait for due date (Day ${ob.discountTerms.N}) and forfeit $${analysis.discountDollars.toFixed(2)} discount`
                  },
                  {
                    type: 'ALLOCATE',
                    expectedValueUsd: analysis.foregoneYieldDollars,
                    reason: `Park in yield venue instead at ${(bestApr * 100).toFixed(1)}% APR earning $${analysis.foregoneYieldDollars.toFixed(2)}`
                  }
                ],
                rationale: `Capturing ${(ob.discountTerms.p)}% early payment discount on final eligible day (Day ${currentDay}). ${analysis.explanation}`,
                confidence: 0.95,
                evidenceRefs: [ob.id, ob.documentHash],
                idempotencyKey: `pay-discount-${ob.id}`
              });
              simulatedLiquid -= discountedAmount;
              simulatedSpentToday += discountedAmount;
            }
          }
        }
      }
    }

    if (actions.length > 0) {
      return actions;
    }

    // 3. Surplus Sweep into Yield Venues (PRD 6.4)
    // S = L - R - mandatory_due_within_lambda_plus_1 - P95_unexpected_bills
    const lambdaDays = bestVenue ? bestVenue.redemptionLatencyDays : 1;
    let mandatoryNearHorizon = 0n;
    for (const ob of pendingObligations) {
      if (ob.kind === 'MANDATORY' && ob.dueDay <= currentDay + lambdaDays + 1) {
        mandatoryNearHorizon += ob.amount;
      }
    }

    // P95 buffer for unexpected bills (~$250)
    const p95Buffer = 250_000_000n; // $250
    const safetyFloor = snapshot.policy.minLiquidReserve + mandatoryNearHorizon + p95Buffer;

    if (snapshot.liquidBalance > safetyFloor) {
      const surplus = snapshot.liquidBalance - safetyFloor;
      if (surplus >= snapshot.policy.minTicket && bestVenue) {
        const currentDeployed = bestVenue.principalDeployed;
        const totalTreasury = snapshot.liquidBalance + activeVenues.reduce((acc, v) => acc + v.principalDeployed, 0n);
        const maxVenueShare = (totalTreasury * BigInt(bestVenue.maxShareBps)) / 10000n;
        const availableVenueCapacity = maxVenueShare > currentDeployed ? maxVenueShare - currentDeployed : 0n;

        const allocAmount = surplus < availableVenueCapacity ? surplus : availableVenueCapacity;
        if (allocAmount >= snapshot.policy.minTicket) {
          const expectedAnnualYieldUsd = (Number(allocAmount) / 1e6) * bestApr;
          actions.push({
            id: `act-alloc-${bestVenue.id}-${currentDay}`,
            type: 'ALLOCATE',
            businessId: snapshot.businessId,
            venueId: bestVenue.id,
            amount: allocAmount,
            expectedValueUsd: expectedAnnualYieldUsd / 12, // monthly EV
            alternatives: [
              {
                type: 'HOLD',
                expectedValueUsd: 0,
                reason: 'Keep cash liquid at 0% APR in vault'
              }
            ],
            rationale: `Sweeping surplus $${(Number(allocAmount) / 1e6).toFixed(2)} into ${bestVenue.name} at ${(bestApr * 100).toFixed(2)}% APR. Preserves liquid reserve $${(Number(snapshot.policy.minLiquidReserve) / 1e6).toFixed(2)} plus upcoming mandatory commitments.`,
            confidence: 0.95,
            evidenceRefs: [],
            idempotencyKey: `alloc-${bestVenue.id}-${currentDay}`
          });
          return actions;
        }
      }
    }

    // Default action: HOLD
    actions.push({
      id: `act-hold-${currentDay}`,
      type: 'HOLD',
      businessId: snapshot.businessId,
      amount: 0n,
      expectedValueUsd: 0,
      alternatives: [],
      rationale: `Current liquid position is optimal. Holding liquid cash of $${(Number(snapshot.liquidBalance) / 1e6).toFixed(2)} above reserve floor with no urgent payments or eligible discount windows today.`,
      confidence: 1.0,
      evidenceRefs: [],
      idempotencyKey: `hold-${snapshot.businessId}-${currentDay}`
    });

    return actions;
  }
}
