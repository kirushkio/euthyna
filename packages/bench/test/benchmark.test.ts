import { describe, it, expect } from 'vitest';
import { simulate30Days } from '../src/runner.js';
import { ATTACK_SCENARIOS } from '../src/attack_lab.js';
import { generateSeededScenario } from '../src/generator.js';

describe('Treasury Benchmark & Attack Lab', () => {
  it('E0 outperforms B0 and B1 in Net Economic Value on Seed 1', () => {
    const b0 = simulate30Days(1, 'B0');
    const b1 = simulate30Days(1, 'B1');
    const e0 = simulate30Days(1, 'E0');

    expect(e0.netEconomicValueBps).toBeGreaterThan(b0.netEconomicValueBps);
    expect(e0.netEconomicValueBps).toBeGreaterThan(b1.netEconomicValueBps);
    expect(e0.mandatoryMisses).toBe(0);
    expect(e0.discountCaptureRate).toBeGreaterThanOrEqual(0.75);
  });

  it('Euthyna blocks 10 of 10 attack vectors in the Attack Lab (0 of 10 move money wrongly)', () => {
    const scenario = generateSeededScenario(42);
    let euthynaBlockedCount = 0;
    let naiveVulnerableCount = 0;

    for (const attack of ATTACK_SCENARIOS) {
      const eResult = attack.runEuthyna(scenario.initialSnapshot);
      if (eResult.blocked) euthynaBlockedCount++;

      const nResult = attack.runNaive(scenario.initialSnapshot);
      if (!nResult.blocked) naiveVulnerableCount++;
    }

    expect(euthynaBlockedCount).toBe(10); // 100% defense!
    expect(naiveVulnerableCount).toBe(10); // Naive agent vulnerable to all attacks!
  });
});
