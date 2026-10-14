import { describe, it, expect } from 'vitest';
import { parseUsd, formatBaseUnits, formatUsdDisplay, add, sub, MoneyError } from '../src/money.js';

describe('Euthyna Money Library', () => {
  it('converts valid USD strings to integer 6-decimal base units', () => {
    expect(parseUsd('100')).toBe(100_000_000n);
    expect(parseUsd('100.5')).toBe(100_500_000n);
    expect(parseUsd('100.50')).toBe(100_500_000n);
    expect(parseUsd('0.000001')).toBe(1n);
    expect(parseUsd('1500.250000')).toBe(1_500_250_000n);
  });

  it('rejects numbers with more than 6 decimal places', () => {
    expect(() => parseUsd('10.1234567')).toThrow(MoneyError);
    expect(() => parseUsd('0.0000001')).toThrow(MoneyError);
  });

  it('rejects negative numbers and invalid formats', () => {
    expect(() => parseUsd('-100')).toThrow(MoneyError);
    expect(() => parseUsd('abc')).toThrow(MoneyError);
    expect(() => parseUsd('10.20.30')).toThrow(MoneyError);
  });

  it('formats base units to standard string and USD display', () => {
    expect(formatBaseUnits(100_000_000n)).toBe('100.000000');
    expect(formatBaseUnits(1_500_250_000n)).toBe('1500.250000');
    expect(formatUsdDisplay(1_500_250_000n, 2)).toBe('$1,500.25');
  });

  it('performs exact addition and subtraction without rounding errors', () => {
    const a = 1_500_000_000n;
    const b = 500_000_000n;
    expect(add(a, b)).toBe(2_000_000_000n);
    expect(sub(a, b)).toBe(1_000_000_000n);
    expect(() => sub(b, a)).toThrow(MoneyError);
  });
});
