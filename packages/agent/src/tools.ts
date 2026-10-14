import {
  TreasurySnapshot,
  Obligation,
  ProposedAction,
  PolicyGate,
  GateEvaluation,
  TreasuryPlanner,
  runLiquidityForecast,
  formatBaseUnits,
  parseUsd
} from '@euthyna/engine';

export interface AgentContext {
  snapshot: TreasurySnapshot;
  humanReviewRequests: { reason: string; action?: ProposedAction }[];
}

export class AgentTools {
  constructor(private context: AgentContext) {}

  /**
   * get_snapshot: Onchain liquid balance, venue positions and latencies, policy, simulated day
   */
  public getSnapshot(): any {
    const s = this.context.snapshot;
    return {
      businessId: s.businessId,
      simulatedDay: s.simulatedDay,
      liquidBalanceUsdc: formatBaseUnits(s.liquidBalance),
      reserveFloorUsdc: formatBaseUnits(s.policy.minLiquidReserve),
      dailyCapUsdc: formatBaseUnits(s.policy.dailyCap),
      perTxCapUsdc: formatBaseUnits(s.policy.perTxCap),
      spentTodayUsdc: formatBaseUnits(s.spentToday),
      isPaused: s.isPaused,
      venues: s.venues.map(v => ({
        id: v.id,
        name: v.name,
        apr: `${(v.aprBps / 100).toFixed(2)}%`,
        redemptionLatencyDays: v.redemptionLatencyDays,
        principalDeployedUsdc: formatBaseUnits(v.principalDeployed),
        enabled: v.enabled
      }))
    };
  }

  /**
   * get_obligations: Registered obligations with evidence flags and due dates
   */
  public getObligations(): any[] {
    return this.context.snapshot.obligations.map(ob => ({
      id: ob.id,
      vendorId: ob.vendorId,
      payeeAddress: ob.payeeAddress,
      amountUsdc: formatBaseUnits(ob.amount),
      dueDay: ob.dueDay,
      kind: ob.kind,
      requiresReceipt: ob.requiresReceipt,
      received: ob.received,
      paid: ob.paid,
      discountTerms: ob.discountTerms
        ? `${ob.discountTerms.p}% if paid within ${ob.discountTerms.n} days, net ${ob.discountTerms.N}`
        : 'None'
    }));
  }

  /**
   * discount_apr: Annualized return of an early-payment term and the best alternative yield
   */
  public discountApr(p: number, n: number, N: number): any {
    const apr = TreasuryPlanner.calculateDiscountApr(p, n, N);
    return {
      annualizedReturn: `${(apr * 100).toFixed(2)}%`,
      annualizedReturnFloat: apr,
      formula: `(${p} / (100 - ${p})) * (365 / (${N} - ${n}))`
    };
  }

  /**
   * forecast_liquidity: P5, P50 liquid path and probability of shortfall for a horizon
   */
  public forecastLiquidity(horizonDays: number = 14): any {
    const forecast = runLiquidityForecast(this.context.snapshot, horizonDays);
    return {
      horizonDays,
      overallShortfallProbability: `${(forecast.overallShortfallProbability * 100).toFixed(2)}%`,
      minP5LiquidUsdc: formatBaseUnits(forecast.minP5Liquid),
      dailyProjection: forecast.days.map(d => ({
        day: d.day,
        p5: formatBaseUnits(d.p5Liquid),
        p50: formatBaseUnits(d.p50Liquid),
        shortfallRisk: `${(d.shortfallProbability * 100).toFixed(1)}%`
      }))
    };
  }

  /**
   * venue_status: APR, redemption latency, capacity and concentration for each venue
   */
  public venueStatus(): any[] {
    return this.context.snapshot.venues.map(v => ({
      id: v.id,
      name: v.name,
      apr: `${(v.aprBps / 100).toFixed(2)}%`,
      redemptionLatencyDays: v.redemptionLatencyDays,
      deployedUsdc: formatBaseUnits(v.principalDeployed),
      capacityUsdc: formatBaseUnits(v.capacityCap),
      maxShare: `${(v.maxShareBps / 100).toFixed(1)}%`,
      enabled: v.enabled
    }));
  }

  /**
   * vendor_history: On-time rate, dispute count, prior payee addresses
   */
  public vendorHistory(vendorId: string): any {
    const v = this.context.snapshot.vendors[vendorId];
    if (!v) return { error: `Vendor ${vendorId} not found` };
    return {
      id: v.id,
      name: v.name,
      payeeAddress: v.payeeAddress,
      reliabilityScore: `${v.score}/100`,
      status: v.status,
      disputeCount: v.disputeCount,
      deliveries: v.historicalDeliveries
    };
  }

  /**
   * dry_run_action: The gate's pass or fail with rule IDs and reasons
   */
  public dryRunAction(action: ProposedAction): GateEvaluation {
    return PolicyGate.evaluate(action, this.context.snapshot);
  }

  /**
   * request_human_review: Opens an approval item with the agent's reasoning
   */
  public requestHumanReview(reason: string, action?: ProposedAction): any {
    this.context.humanReviewRequests.push({ reason, action });
    return {
      status: 'Escalation queued',
      approvalId: `appr-${Date.now()}`,
      reason
    };
  }
}
