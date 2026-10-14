import { TreasurySnapshot, Obligation, Receivable } from './types.js';

/**
 * Seeded PRNG using Mulberry32 for 100% reproducible Monte Carlo paths
 */
export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Box-Muller transform for standard normal distribution N(0, 1)
  nextGaussian(): number {
    let u = 0, v = 0;
    while (u === 0) u = this.next();
    while (v === 0) v = this.next();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }

  // Lognormal sample
  nextLognormal(mu: number, sigma: number): number {
    return Math.exp(mu + sigma * this.nextGaussian());
  }

  // Poisson arrival check for rate lambda
  nextPoisson(lambda: number): number {
    let L = Math.exp(-lambda);
    let k = 0;
    let p = 1.0;
    do {
      k++;
      p *= this.next();
    } while (p > L);
    return k - 1;
  }
}

export interface ForecastDayResult {
  day: number;
  p5Liquid: bigint;
  p50Liquid: bigint;
  p95Liquid: bigint;
  shortfallProbability: number; // 0 to 1
}

export interface LiquidityForecast {
  days: ForecastDayResult[];
  overallShortfallProbability: number;
  minP5Liquid: bigint;
  horizonDays: number;
}

/**
 * Deterministic Monte Carlo Liquidity Forecast (1,000 paths)
 */
export function runLiquidityForecast(
  snapshot: TreasurySnapshot,
  horizonDays: number = 30,
  seed: number = 42,
  samplePaths: number = 1000
): LiquidityForecast {
  const rng = new SeededRandom(seed);
  const startDay = snapshot.simulatedDay;
  const initialLiquid = snapshot.liquidBalance;

  // Track liquid balances per day across paths
  // pathsMatrix[dayIndex][pathIndex] = bigint liquid balance
  const dailyPaths: bigint[][] = Array.from({ length: horizonDays }, () =>
    new Array<bigint>(samplePaths)
  );

  const dailyShortfallCount: number[] = new Array(horizonDays).fill(0);

  // Group active mandatory and discretionary obligations
  const pendingObligations = snapshot.obligations.filter(o => !o.paid);
  const pendingReceivables = snapshot.receivables.filter(r => !r.arrived);

  const initialTreasuryFloat = Number(snapshot.liquidBalance) / 1e6;

  for (let path = 0; path < samplePaths; path++) {
    let currentLiquid = initialLiquid;

    // Simulate customer receivable arrival delays for this path
    const receivableArrivals: { day: number; amount: bigint }[] = pendingReceivables.map(r => {
      // Mean delay ~ 3 days, sigma ~ 0.8
      // Convert mean to lognormal mu: mu = ln(mean) - 0.5 * sigma^2
      const mean = r.meanDelayDays > 0 ? r.meanDelayDays : 3.0;
      const sigma = r.sigmaDelay > 0 ? r.sigmaDelay : 0.8;
      const mu = Math.log(mean) - 0.5 * sigma * sigma;
      const delay = Math.round(rng.nextLognormal(mu, sigma));
      return {
        day: r.expectedDay + Math.max(0, delay),
        amount: r.amount
      };
    });

    for (let dayOffset = 0; dayOffset < horizonDays; dayOffset++) {
      const currentDay = startDay + dayOffset;

      // 1. Receivables that land on this day
      for (const rec of receivableArrivals) {
        if (rec.day === currentDay) {
          currentLiquid += rec.amount;
        }
      }

      // 2. Mandatory obligations due on this day (e.g. payroll)
      let mandatoryDueToday = 0n;
      for (const ob of pendingObligations) {
        if (ob.dueDay === currentDay && ob.kind === 'MANDATORY') {
          mandatoryDueToday += ob.amount;
        }
      }

      // 3. Unexpected bills arriving as Poisson process (0.15/day)
      // Lognormal size with median ~ 2% of treasury
      const billsCount = rng.nextPoisson(0.15);
      let unexpectedBillsAmount = 0n;
      if (billsCount > 0) {
        for (let b = 0; b < billsCount; b++) {
          const medianBill = initialTreasuryFloat * 0.02; // 2%
          const mu = Math.log(Math.max(10, medianBill));
          const billUsd = rng.nextLognormal(mu, 0.5);
          unexpectedBillsAmount += BigInt(Math.round(billUsd * 1e6));
        }
      }

      // Check if liquid falls below mandatory payments due
      if (currentLiquid < mandatoryDueToday) {
        dailyShortfallCount[dayOffset]++;
      }

      if (currentLiquid >= mandatoryDueToday) {
        currentLiquid -= mandatoryDueToday;
      } else {
        currentLiquid = 0n;
      }

      // Unexpected bills deduction
      if (currentLiquid >= unexpectedBillsAmount) {
        currentLiquid -= unexpectedBillsAmount;
      } else {
        currentLiquid = 0n;
      }

      dailyPaths[dayOffset][path] = currentLiquid;
    }
  }

  // Calculate percentiles P5, P50, P95 for each day
  const results: ForecastDayResult[] = [];
  let totalShortfallEvents = 0;
  let minP5 = initialLiquid;

  for (let d = 0; d < horizonDays; d++) {
    const sorted = dailyPaths[d].slice().sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    const p5Index = Math.floor(samplePaths * 0.05);
    const p50Index = Math.floor(samplePaths * 0.50);
    const p95Index = Math.floor(samplePaths * 0.95);

    const p5 = sorted[p5Index];
    const p50 = sorted[p50Index];
    const p95 = sorted[p95Index];
    const shortfallProb = dailyShortfallCount[d] / samplePaths;

    if (p5 < minP5) minP5 = p5;
    if (shortfallProb > 0) totalShortfallEvents += dailyShortfallCount[d];

    results.push({
      day: startDay + d,
      p5Liquid: p5,
      p50Liquid: p50,
      p95Liquid: p95,
      shortfallProbability: shortfallProb
    });
  }

  const overallShortfallProb = Math.min(
    1,
    results.reduce((acc, curr) => Math.max(acc, curr.shortfallProbability), 0)
  );

  return {
    days: results,
    overallShortfallProbability: overallShortfallProb,
    minP5Liquid: minP5,
    horizonDays
  };
}
