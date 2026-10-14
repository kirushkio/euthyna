export type ObligationKind = 'MANDATORY' | 'DISCRETIONARY';

export type PayeeStatus = 'None' | 'Pending' | 'Active' | 'Revoked';

export interface DiscountTerms {
  p: number; // percent discount, e.g. 2 for 2%
  n: number; // discount window in days, e.g. 10
  N: number; // full term in days, e.g. 30
}

export interface Obligation {
  id: `0x${string}`; // bytes32 hex
  businessId: string;
  vendorId: string;
  payeeAddress: `0x${string}`;
  amount: bigint; // 6-decimal integer base units
  dueDay: number; // simulated day or timestamp
  discountTerms?: DiscountTerms;
  requiresReceipt: boolean;
  received: boolean;
  kind: ObligationKind;
  documentHash: `0x${string}`;
  paid: boolean;
  paidAmount?: bigint;
  paidTx?: string;
  createdAt: number;
}

export interface Receivable {
  id: string;
  businessId: string;
  customer: string;
  amount: bigint; // 6-decimal base units
  expectedDay: number;
  meanDelayDays: number; // lognormal mean
  sigmaDelay: number;
  actualArrivalDay?: number;
  arrived: boolean;
}

export interface Vendor {
  id: string;
  businessId: string;
  name: string;
  payeeAddress: `0x${string}`;
  score: number; // 0 to 100
  status: PayeeStatus;
  activeAfterDay: number;
  historicalDeliveries: number;
  disputeCount: number;
}

export interface Policy {
  perTxCap: bigint; // in base units
  dailyCap: bigint; // in base units
  minLiquidReserve: bigint; // R in base units
  newPayeeCooldownDays: number; // e.g. 1 day in prod, 0.01 in demo
  minTicket: bigint; // minimum allocate amount
  epsilonShortfall: number; // default 0.02 (2%)
  maxGasFeeShareOfBenefit: number; // default 0.10 (10%)
  minConfidenceThreshold: number; // default 0.80
}

export interface YieldVenue {
  id: string;
  name: string;
  adapterAddress: `0x${string}`;
  aprBps: number; // basis points, e.g. 500 = 5.00%
  redemptionLatencyDays: number; // 0 for instant, 1 for T+1
  capacityCap: bigint;
  maxShareBps: number; // e.g. 5000 = 50% max treasury share
  enabled: boolean;
  principalDeployed: bigint;
  isSimulated: boolean;
}

export interface TreasurySnapshot {
  businessId: string;
  liquidBalance: bigint; // L in vault
  reserveFloor: bigint; // R
  venues: YieldVenue[];
  obligations: Obligation[];
  receivables: Receivable[];
  vendors: Record<string, Vendor>;
  policy: Policy;
  simulatedDay: number;
  spentToday: bigint;
  isPaused: boolean;
}

export type ActionType = 'PAY_OBLIGATION' | 'ALLOCATE' | 'REDEEM' | 'HOLD' | 'ESCALATE';

export interface ActionAlternative {
  type: ActionType;
  expectedValueUsd: number;
  reason: string;
}

export interface ProposedAction {
  id: string;
  type: ActionType;
  businessId: string;
  obligationId?: `0x${string}`;
  venueId?: string;
  amount: bigint; // base units
  expectedValueUsd: number;
  alternatives: ActionAlternative[];
  rationale: string;
  confidence: number; // 0 to 1
  evidenceRefs: string[];
  idempotencyKey: string;
}

export interface GateRuleResult {
  ruleId: string;
  ruleName: string;
  passed: boolean;
  reason?: string;
}

export interface GateEvaluation {
  actionId: string;
  passed: boolean;
  escalate: boolean;
  ruleResults: GateRuleResult[];
  rejectionReason?: string;
}

export interface DecisionRecord {
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
    type: ActionType;
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
  prevHash: string;
  hash: string;
  signature?: string;
}
