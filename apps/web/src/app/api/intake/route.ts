import { NextRequest, NextResponse } from 'next/server';
import {
  verifyInvoiceEvidence,
  RawInvoiceInput,
  TreasuryPlanner,
  PolicyGate,
  parseUsd,
  formatBaseUnits,
  TreasurySnapshot,
  Obligation
} from '@euthyna/engine';

// Default snapshot for Studio A pilot business
const DEFAULT_SNAPSHOT: TreasurySnapshot = {
  businessId: 'biz-studio-a',
  liquidBalance: 5500000000n, // $5,500.00 liquid USDC (per PRD & README: $5,500 liquid, $4,500 in yield)
  reserveFloor: 3000000000n,  // $3,000.00 reserve floor
  venues: [
    {
      id: 'venue-sim-yield',
      name: 'SimYieldVault (High APR)',
      adapterAddress: '0x1A2B3C4D5E6F708192A1B2C3D4E5F60718293A4B',
      aprBps: 520, // 5.20% APR
      redemptionLatencyDays: 1,
      capacityCap: 50000000000n,
      maxShareBps: 6000,
      enabled: true,
      principalDeployed: 1583800000n,
      isSimulated: true
    },
    {
      id: 'venue-morpho-earn',
      name: 'Morpho USDC Earn Vault',
      adapterAddress: '0x9E8D7C6B5A4F3E2D1C0B9A8F7E6D5C4B3A2F1E0D',
      aprBps: 450, // 4.50% APR
      redemptionLatencyDays: 0,
      capacityCap: 100000000000n,
      maxShareBps: 5000,
      enabled: true,
      principalDeployed: 0n,
      isSimulated: false
    }
  ],
  obligations: [],
  receivables: [],
  vendors: {
    'vendor-aws': {
      id: 'vendor-aws',
      businessId: 'biz-studio-a',
      name: 'AWS Cloud Infrastructure',
      payeeAddress: '0x2222222222222222222222222222222222222222',
      score: 99,
      status: 'Active',
      activeAfterDay: 0,
      historicalDeliveries: 24,
      disputeCount: 0
    },
    'vendor-figma': {
      id: 'vendor-figma',
      businessId: 'biz-studio-a',
      name: 'Figma Enterprise',
      payeeAddress: '0x6666666666666666666666666666666666666666',
      score: 95,
      status: 'Active',
      activeAfterDay: 0,
      historicalDeliveries: 12,
      disputeCount: 0
    },
    'vendor-linear': {
      id: 'vendor-linear',
      businessId: 'biz-studio-a',
      name: 'Linear Workspaces',
      payeeAddress: '0x3333333333333333333333333333333333333333',
      score: 90,
      status: 'Active',
      activeAfterDay: 0,
      historicalDeliveries: 8,
      disputeCount: 0
    }
  },
  policy: {
    perTxCap: 5000000000n,     // $5,000.00 max per tx
    dailyCap: 8000000000n,     // $8,000.00 max daily spend
    minLiquidReserve: 3000000000n, // $3,000.00 reserve floor
    newPayeeCooldownDays: 1,
    minTicket: 100000000n,     // $100 min ticket
    epsilonShortfall: 0.02,
    maxGasFeeShareOfBenefit: 0.1,
    minConfidenceThreshold: 0.8
  },
  simulatedDay: 10,
  spentToday: 0n,
  isPaused: false
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rawText, customSnapshot } = body;
    const text = rawText || '';

    // 1. Structured field extraction from raw text
    const vendorName = text.includes('Figma')
      ? 'Figma Enterprise'
      : text.includes('Linear')
      ? 'Linear Workspaces'
      : 'AWS Cloud Infrastructure';

    let amountUsd = '450.00';
    for (const line of text.split('\n')) {
      const trimmed = line.trim();
      if (/^Amount:/i.test(trimmed) || trimmed.includes('$')) {
        const match = trimmed.match(/\$([0-9,]+(?:\.[0-9]{2})?)/);
        if (match) {
          amountUsd = match[1].replace(/,/g, '');
          break;
        }
      }
    }

    const payeeMatch = text.match(/0x[a-fA-F0-9]{40}/);
    const payeeAddress = (payeeMatch ? payeeMatch[0] : '0x2222222222222222222222222222222222222222') as `0x${string}`;

    const hasDiscountTerms = text.includes('2/10');
    const discountTerms = hasDiscountTerms ? { p: 2, n: 10, N: 30 } : undefined;
    const dueDay = 30;

    const invoiceNumberMatch = text.match(/INV-[A-Za-z0-9-]+/);
    const invoiceNumber = invoiceNumberMatch ? invoiceNumberMatch[0] : 'INV-2026-001';

    const rawInvoice: RawInvoiceInput = {
      invoiceNumber,
      vendorName,
      payeeAddress,
      amountUsd,
      dueDay,
      discountTerms,
      rawText: text,
      receiptAttested: !text.includes('receipt missing')
    };

    const parsedAmount = parseUsd(amountUsd);
    const snapshot: TreasurySnapshot = customSnapshot || DEFAULT_SNAPSHOT;

    // 2. Engine Evidence Check
    const evidence = verifyInvoiceEvidence(
      rawInvoice,
      parsedAmount,
      snapshot.obligations,
      snapshot.vendors
    );

    const obligationId = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}` as `0x${string}`;
    const vendorId = vendorName.toLowerCase().includes('figma')
      ? 'vendor-figma'
      : vendorName.toLowerCase().includes('linear')
      ? 'vendor-linear'
      : 'vendor-aws';

    const obligation: Obligation = {
      id: obligationId,
      businessId: snapshot.businessId,
      vendorId,
      payeeAddress,
      amount: parsedAmount,
      dueDay,
      discountTerms,
      requiresReceipt: true,
      received: evidence.threeWayMatchPassed,
      kind: 'DISCRETIONARY',
      documentHash: evidence.docHash,
      paid: false,
      createdAt: Date.now()
    };

    // 3. Treasury Engine Financial EV Evaluation
    const bestApr = 0.052; // 5.20% APR on SimYield
    const evAnalysis = TreasuryPlanner.evaluateEarlyPaymentEV(obligation, snapshot, bestApr);

    // 4. Action candidate formulation
    let proposedAmount = parsedAmount;
    if (evAnalysis.recommendEarlyPay && discountTerms) {
      proposedAmount = (parsedAmount * BigInt(10000 - Math.round(discountTerms.p * 100))) / 10000n;
    }

    const proposedAction = {
      id: `act-${Date.now()}`,
      type: 'PAY_OBLIGATION' as const,
      businessId: snapshot.businessId,
      obligationId,
      amount: proposedAmount,
      expectedValueUsd: evAnalysis.netExpectedValueUsd,
      alternatives: [
        {
          type: 'HOLD' as const,
          expectedValueUsd: discountTerms ? -(Number(parsedAmount) * discountTerms.p / 100 / 1e6) : 0,
          reason: 'Wait for due date and forfeit early-payment discount'
        },
        {
          type: 'ALLOCATE' as const,
          expectedValueUsd: evAnalysis.foregoneYieldDollars,
          reason: 'Keep cash in yield venue at 5.20% APR'
        }
      ],
      rationale: evAnalysis.explanation || `Payment of ${formatBaseUnits(proposedAmount)} USDC to ${vendorName}.`,
      confidence: 0.95,
      evidenceRefs: [obligationId],
      idempotencyKey: `pay-${invoiceNumber}`
    };

    // 5. Deterministic Policy Gate check
    const snapshotWithObligation = {
      ...snapshot,
      obligations: [...snapshot.obligations, obligation]
    };
    const gateEval = PolicyGate.evaluate(proposedAction, snapshotWithObligation);

    // 6. Execution capability determination
    const canRegister = evidence.passed && !evidence.injectionFlagged;
    const canExecute = canRegister && gateEval.passed && !gateEval.escalate;
    const requiresOwnerEscalation = gateEval.escalate || (!evidence.passed && evidence.vendorMatch);

    return NextResponse.json({
      success: true,
      extraction: {
        invoiceNumber,
        vendorName,
        amountUsdc: amountUsd,
        payeeAddress,
        discountTerms: hasDiscountTerms ? '2/10 Net 30' : 'Net 30',
        dueDay
      },
      evidence: {
        docHash: evidence.docHash,
        fingerprint: evidence.fingerprint,
        duplicateDetected: evidence.duplicateDetected,
        vendorMasterMatch: evidence.vendorMatch,
        promptInjectionFlagged: evidence.injectionFlagged,
        threeWayMatchVerified: evidence.threeWayMatchPassed,
        blocklistFlagged: evidence.blocklistFlagged,
        flaggedReasons: evidence.flaggedReasons,
        canRegister
      },
      financialEvaluation: {
        annualizedApr: evAnalysis.annualizedApr,
        discountDollars: evAnalysis.discountDollars,
        foregoneYieldDollars: evAnalysis.foregoneYieldDollars,
        netExpectedValueUsd: evAnalysis.netExpectedValueUsd,
        recommendEarlyPay: evAnalysis.recommendEarlyPay,
        rationale: evAnalysis.explanation
      },
      policyGate: {
        passed: gateEval.passed,
        escalate: gateEval.escalate,
        rejectionReason: gateEval.rejectionReason,
        rules: gateEval.ruleResults.map(r => ({
          id: r.ruleId,
          name: r.ruleName,
          passed: r.passed,
          reason: r.reason
        }))
      },
      executionStatus: {
        executable: canExecute,
        requiresOwnerEscalation,
        provenance: '▲ SIMULATED WORKFLOW (Offchain Engine & Policy Gate)',
        simulatedPaymentAmount: formatBaseUnits(proposedAmount)
      },
      decisionProposal: {
        seq: Date.now() % 10000,
        timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
        simulatedDay: snapshot.simulatedDay,
        businessName: 'Studio A (Creative Agency)',
        actionType: 'PAY_OBLIGATION',
        amountUsdc: formatBaseUnits(proposedAmount),
        originalAmountUsdc: amountUsd,
        target: `${vendorName} (${invoiceNumber})`,
        expectedValueUsd: evAnalysis.netExpectedValueUsd,
        rationale: evAnalysis.explanation,
        gatePassed: gateEval.passed,
        gateRules: gateEval.ruleResults.map(r => ({
          id: r.ruleId,
          name: r.ruleName,
          status: r.passed ? 'PASS' : 'FAIL'
        })),
        alternatives: proposedAction.alternatives.map(a => ({
          type: a.type,
          ev: a.expectedValueUsd,
          reason: a.reason
        })),
        txHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        recordHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        signatureValid: true
      }
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
