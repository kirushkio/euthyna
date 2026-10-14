import { SeededRandom, TreasurySnapshot, Obligation, Receivable, Vendor, Policy, YieldVenue } from '@euthyna/engine';

export interface GeneratedScenario {
  seed: number;
  initialSnapshot: TreasurySnapshot;
  receivablesSchedule: { day: number; receivable: Receivable }[];
  incomingObligations: { day: number; obligation: Obligation }[];
}

export function generateSeededScenario(seed: number): GeneratedScenario {
  const rng = new SeededRandom(seed);
  const businessId = `biz-sim-${seed}`;

  // Default $10,000 treasury
  const liquidBalance = 10_000_000_000n; // 10,000 USDC

  const policy: Policy = {
    perTxCap: 5_000_000_000n, // $5,000 (accommodates payroll up to $4,000)
    dailyCap: 8_000_000_000n, // $8,000
    minLiquidReserve: 3_000_000_000n, // $3,000
    newPayeeCooldownDays: 1,
    minTicket: 250_000_000n, // $250
    epsilonShortfall: 0.02,
    maxGasFeeShareOfBenefit: 0.10,
    minConfidenceThreshold: 0.80
  };

  const venues: YieldVenue[] = [
    {
      id: 'venue-sim-yield',
      name: 'SimYieldVault (High APR)',
      adapterAddress: '0x1111111111111111111111111111111111111111',
      aprBps: 520, // 5.20%
      redemptionLatencyDays: 1, // T+1
      capacityCap: 50_000_000_000n,
      maxShareBps: 6000, // 60%
      enabled: true,
      principalDeployed: 0n,
      isSimulated: true
    },
    {
      id: 'venue-morpho-earn',
      name: 'Morpho USDC Earn Vault',
      adapterAddress: '0x2222222222222222222222222222222222222222',
      aprBps: 450, // 4.50%
      redemptionLatencyDays: 0, // T+0 instant
      capacityCap: 100_000_000_000n,
      maxShareBps: 5000,
      enabled: true,
      principalDeployed: 0n,
      isSimulated: false
    }
  ];

  // Draw 8 to 14 obligations
  const numObligations = 8 + Math.floor(rng.next() * 7);
  const obligations: Obligation[] = [];
  const vendors: Record<string, Vendor> = {};

  const vendorNames = [
    'AWS Cloud Services',
    'Figma Design Suite',
    'Linear Workspaces',
    'Supabase Cloud',
    'Slack Enterprise',
    'Vercel Hosting',
    'Notion Teams',
    'OpenAI API Services',
    'Anthropic Claude API',
    'Google Workspace'
  ];

  // Seed vendors
  for (let i = 0; i < vendorNames.length; i++) {
    const vId = `vendor-${i + 1}`;
    const hex = (i + 1).toString(16).padStart(40, '0');
    vendors[vId] = {
      id: vId,
      businessId,
      name: vendorNames[i],
      payeeAddress: `0x${hex}` as `0x${string}`,
      score: 85 + Math.floor(rng.next() * 15),
      status: 'Active',
      activeAfterDay: 0,
      historicalDeliveries: 12 + Math.floor(rng.next() * 20),
      disputeCount: 0
    };
  }

  // Mandatory payroll obligation at Day 14
  const payrollObligation: Obligation = {
    id: `0x${('payroll-14-' + seed).padEnd(64, '0').slice(0, 64)}` as `0x${string}`,
    businessId,
    vendorId: 'vendor-payroll',
    payeeAddress: '0x9999999999999999999999999999999999999999',
    amount: 4_000_000_000n, // $4,000
    dueDay: 14,
    requiresReceipt: false,
    received: true,
    kind: 'MANDATORY',
    documentHash: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    paid: false,
    createdAt: 0
  };
  vendors['vendor-payroll'] = {
    id: 'vendor-payroll',
    businessId,
    name: 'Payroll Provider',
    payeeAddress: '0x9999999999999999999999999999999999999999',
    score: 100,
    status: 'Active',
    activeAfterDay: 0,
    historicalDeliveries: 24,
    disputeCount: 0
  };
  obligations.push(payrollObligation);

  // Generate other invoices
  const termsList = [
    { p: 2, n: 10, N: 30 }, // 2/10 net 30
    { p: 1, n: 10, N: 45 }, // 1/10 net 45
    { p: 0.5, n: 15, N: 30 }, // 0.5/15 net 30
    undefined // net 30 no discount
  ];

  for (let i = 0; i < numObligations - 1; i++) {
    const vIndex = Math.floor(rng.next() * vendorNames.length);
    const v = vendors[`vendor-${vIndex + 1}`];
    const amountDollars = 150 + Math.floor(rng.next() * 1200);
    const amount = BigInt(amountDollars) * 1_000_000n;
    const term = termsList[Math.floor(rng.next() * termsList.length)];
    const dueDay = term ? term.N : 5 + Math.floor(rng.next() * 25);
    const obId = `0x${(seed.toString(16) + 'ob' + i).padStart(64, '0')}` as `0x${string}`;

    obligations.push({
      id: obId,
      businessId,
      vendorId: v.id,
      payeeAddress: v.payeeAddress,
      amount,
      dueDay,
      discountTerms: term,
      requiresReceipt: true,
      received: true,
      kind: dueDay === 14 || amountDollars > 2000 ? 'MANDATORY' : 'DISCRETIONARY',
      documentHash: `0x${(seed.toString(16) + 'doc' + i).padStart(64, '0')}` as `0x${string}`,
      paid: false,
      createdAt: 0
    });
  }

  // Draw 1 to 3 customer receivables
  const numReceivables = 1 + Math.floor(rng.next() * 3);
  const receivables: Receivable[] = [];
  for (let r = 0; r < numReceivables; r++) {
    const recAmountDollars = 1000 + Math.floor(rng.next() * 2500);
    const expectedDay = 7 + Math.floor(rng.next() * 12);
    receivables.push({
      id: `rec-${seed}-${r}`,
      businessId,
      customer: `Client ${String.fromCharCode(65 + r)}`,
      amount: BigInt(recAmountDollars) * 1_000_000n,
      expectedDay,
      meanDelayDays: 3,
      sigmaDelay: 0.8,
      arrived: false
    });
  }

  const initialSnapshot: TreasurySnapshot = {
    businessId,
    liquidBalance,
    reserveFloor: policy.minLiquidReserve,
    venues,
    obligations,
    receivables,
    vendors,
    policy,
    simulatedDay: 0,
    spentToday: 0n,
    isPaused: false
  };

  return {
    seed,
    initialSnapshot,
    receivablesSchedule: receivables.map(r => ({ day: r.expectedDay, receivable: r })),
    incomingObligations: []
  };
}
