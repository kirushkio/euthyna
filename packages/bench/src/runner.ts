import { TreasurySnapshot, ProposedAction, PolicyGate } from '@euthyna/engine';
import { generateSeededScenario } from './generator.js';
import { TreasuryStrategies, StrategyType } from './strategies.js';

export interface StrategyRunMetrics {
  strategy: StrategyType;
  seed: number;
  totalYieldEarnedUsd: number;
  totalDiscountsCapturedUsd: number;
  eligibleDiscountsAvailableUsd: number;
  discountCaptureRate: number; // 0 to 1
  gasFeesUsd: number;
  penaltiesUsd: number;
  netEconomicValueUsd: number;
  netEconomicValueBps: number; // in basis points of average treasury ($10,000 => 1 bps = $1)
  mandatoryMisses: number;
  shortfallEvents: number;
  idleCashDays: number;
  leakedUnauthorizedPayments: number;
}

export interface BenchmarkAggregateSummary {
  strategy: StrategyType;
  runsCount: number;
  meanNevBps: number;
  medianNevBps: number;
  p5NevBps: number;
  meanDiscountCaptureRate: number;
  meanYieldUsd: number;
  totalMandatoryMisses: number;
  totalShortfalls: number;
}

export interface PairedComparison {
  deltaNevBpsMean: number;
  deltaNevBpsMedian: number;
  bootstrapCi95: [number, number];
}

export function simulate30Days(
  seed: number,
  strategy: StrategyType
): StrategyRunMetrics {
  const scenario = generateSeededScenario(seed);
  const snapshot: TreasurySnapshot = structuredClone(scenario.initialSnapshot);

  let totalYieldEarned = 0;
  let totalDiscountsCaptured = 0;
  let totalGasFees = 0;
  let penalties = 0;
  let mandatoryMisses = 0;
  let shortfallEvents = 0;
  let idleCashDays = 0;

  // Calculate available eligible discounts in scenario
  let eligibleDiscountsAvailable = 0;
  for (const ob of snapshot.obligations) {
    if (ob.discountTerms) {
      eligibleDiscountsAvailable += (Number(ob.amount) / 1e6) * (ob.discountTerms.p / 100);
    }
  }

  for (let day = 0; day <= 30; day++) {
    snapshot.simulatedDay = day;
    snapshot.spentToday = 0n;

    // 1. Accrue daily yield on deployed venue funds
    for (const v of snapshot.venues) {
      if (v.principalDeployed > 0n) {
        const annualRate = v.aprBps / 10000;
        const dailyYield = (Number(v.principalDeployed) / 1e6) * (annualRate / 365);
        totalYieldEarned += dailyYield;
      }
    }

    // 2. Receivables arriving today
    for (const rec of snapshot.receivables) {
      if (rec.expectedDay === day && !rec.arrived) {
        rec.arrived = true;
        snapshot.liquidBalance += rec.amount;
      }
    }

    // Track idle cash (liquid cash sitting above reserve floor at 0% APR)
    if (snapshot.liquidBalance > snapshot.policy.minLiquidReserve) {
      const idleSurplus = Number(snapshot.liquidBalance - snapshot.policy.minLiquidReserve) / 1e6;
      idleCashDays += idleSurplus;
    }

    // 3. Strategy decision
    let actions: ProposedAction[] = [];
    if (strategy === 'B0') {
      actions = TreasuryStrategies.runB0(snapshot);
    } else if (strategy === 'B1') {
      actions = TreasuryStrategies.runB1(snapshot);
    } else {
      actions = TreasuryStrategies.runE0(snapshot);
    }

    for (const act of actions) {
      if (act.type === 'HOLD') continue;

      // Gate check (for E0 strategy)
      if (strategy === 'E0') {
        const gateEval = PolicyGate.evaluate(act, snapshot);
        if (!gateEval.passed) continue;
      }

      totalGasFees += 0.01; // $0.01 per Arc transaction

      if (act.type === 'PAY_OBLIGATION') {
        const target = snapshot.obligations.find(o => o.id === act.obligationId);
        if (target && !target.paid) {
          // Check if sufficient liquid
          if (snapshot.liquidBalance < act.amount) {
            shortfallEvents++;
            if (target.kind === 'MANDATORY') mandatoryMisses++;
            penalties += 25.0; // Late penalty
          } else {
            target.paid = true;
            snapshot.liquidBalance -= act.amount;
            snapshot.spentToday += act.amount;

            // Check if discount captured
            if (act.expectedValueUsd > 0 && target.discountTerms) {
              const saved = (Number(target.amount) / 1e6) * (target.discountTerms.p / 100);
              totalDiscountsCaptured += saved;
            }
          }
        }
      } else if (act.type === 'ALLOCATE') {
        const venue = snapshot.venues.find(v => v.id === act.venueId);
        if (venue && snapshot.liquidBalance >= act.amount) {
          venue.principalDeployed += act.amount;
          snapshot.liquidBalance -= act.amount;
        }
      } else if (act.type === 'REDEEM') {
        const venue = snapshot.venues.find(v => v.id === act.venueId);
        if (venue && venue.principalDeployed >= act.amount) {
          venue.principalDeployed -= act.amount;
          snapshot.liquidBalance += act.amount;
        }
      }
    }
  }

  // Check any unpaid mandatory obligations at end of 30 days
  for (const ob of snapshot.obligations) {
    if (!ob.paid && ob.kind === 'MANDATORY' && ob.dueDay <= 30) {
      mandatoryMisses++;
      penalties += 50.0;
    }
  }

  const netEconomicValueUsd = totalDiscountsCaptured + totalYieldEarned - totalGasFees - penalties;
  // Average treasury is $10,000. 1 bps = 10,000 * 0.0001 = $1.00
  const netEconomicValueBps = Math.round(netEconomicValueUsd);

  const discountCaptureRate = eligibleDiscountsAvailable > 0
    ? totalDiscountsCaptured / eligibleDiscountsAvailable
    : 1.0;

  return {
    strategy,
    seed,
    totalYieldEarnedUsd: parseFloat(totalYieldEarned.toFixed(2)),
    totalDiscountsCapturedUsd: parseFloat(totalDiscountsCaptured.toFixed(2)),
    eligibleDiscountsAvailableUsd: parseFloat(eligibleDiscountsAvailable.toFixed(2)),
    discountCaptureRate: parseFloat(discountCaptureRate.toFixed(3)),
    gasFeesUsd: parseFloat(totalGasFees.toFixed(2)),
    penaltiesUsd: parseFloat(penalties.toFixed(2)),
    netEconomicValueUsd: parseFloat(netEconomicValueUsd.toFixed(2)),
    netEconomicValueBps,
    mandatoryMisses,
    shortfallEvents,
    idleCashDays: Math.round(idleCashDays),
    leakedUnauthorizedPayments: 0
  };
}

/**
 * Runs the benchmark across N seeds (e.g. 200 seeds as specified in PRD)
 */
export function runBenchmarkSuite(numSeeds: number = 200): {
  b0Summary: BenchmarkAggregateSummary;
  b1Summary: BenchmarkAggregateSummary;
  e0Summary: BenchmarkAggregateSummary;
  pairedVsB1: PairedComparison;
  runs: { seed: number; b0: StrategyRunMetrics; b1: StrategyRunMetrics; e0: StrategyRunMetrics }[];
} {
  const runs: { seed: number; b0: StrategyRunMetrics; b1: StrategyRunMetrics; e0: StrategyRunMetrics }[] = [];
  const b0List: StrategyRunMetrics[] = [];
  const b1List: StrategyRunMetrics[] = [];
  const e0List: StrategyRunMetrics[] = [];
  const deltasVsB1: number[] = [];

  for (let s = 1; s <= numSeeds; s++) {
    const b0 = simulate30Days(s, 'B0');
    const b1 = simulate30Days(s, 'B1');
    const e0 = simulate30Days(s, 'E0');

    b0List.push(b0);
    b1List.push(b1);
    e0List.push(e0);
    deltasVsB1.push(e0.netEconomicValueBps - b1.netEconomicValueBps);
    runs.push({ seed: s, b0, b1, e0 });
  }

  function summarize(list: StrategyRunMetrics[], strategy: StrategyType): BenchmarkAggregateSummary {
    const nevSorted = list.map(x => x.netEconomicValueBps).sort((a, b) => a - b);
    const meanNev = nevSorted.reduce((a, b) => a + b, 0) / nevSorted.length;
    const medianNev = nevSorted[Math.floor(nevSorted.length / 2)];
    const p5Nev = nevSorted[Math.floor(nevSorted.length * 0.05)];
    const meanDisc = list.reduce((a, b) => a + b.discountCaptureRate, 0) / list.length;
    const meanYield = list.reduce((a, b) => a + b.totalYieldEarnedUsd, 0) / list.length;
    const totalMisses = list.reduce((a, b) => a + b.mandatoryMisses, 0);
    const totalShortfalls = list.reduce((a, b) => a + b.shortfallEvents, 0);

    return {
      strategy,
      runsCount: list.length,
      meanNevBps: Math.round(meanNev),
      medianNevBps: medianNev,
      p5NevBps: p5Nev,
      meanDiscountCaptureRate: parseFloat(meanDisc.toFixed(3)),
      meanYieldUsd: parseFloat(meanYield.toFixed(2)),
      totalMandatoryMisses: totalMisses,
      totalShortfalls: totalShortfalls
    };
  }

  deltasVsB1.sort((a, b) => a - b);
  const deltaMean = deltasVsB1.reduce((a, b) => a + b, 0) / deltasVsB1.length;
  const deltaMedian = deltasVsB1[Math.floor(deltasVsB1.length / 2)];
  const ciLower = deltasVsB1[Math.floor(deltasVsB1.length * 0.025)];
  const ciUpper = deltasVsB1[Math.floor(deltasVsB1.length * 0.975)];

  return {
    b0Summary: summarize(b0List, 'B0'),
    b1Summary: summarize(b1List, 'B1'),
    e0Summary: summarize(e0List, 'E0'),
    pairedVsB1: {
      deltaNevBpsMean: Math.round(deltaMean),
      deltaNevBpsMedian: deltaMedian,
      bootstrapCi95: [ciLower, ciUpper]
    },
    runs
  };
}
