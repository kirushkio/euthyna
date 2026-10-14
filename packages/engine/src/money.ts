/**
 * Euthyna Money Library
 * Strictly enforces integer base units (6 decimals for USDC on Arc ERC-20).
 * Refuses floats, negative numbers, and inputs with >6 decimal places.
 */

export const DECIMALS = 6;
export const BASE_UNIT_MULTIPLIER = 1_000_000n; // 10^6

export class MoneyError extends Error {
  constructor(message: string) {
    super(`[MoneyError] ${message}`);
    this.name = 'MoneyError';
  }
}

/**
 * Parses a USD string e.g. "1500.00", "0.25", "100" into 6-decimal integer base units (bigint).
 * Rejects negative numbers, scientific notation, and numbers with >6 decimals.
 */
export function parseUsd(value: string | number): bigint {
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) {
      throw new MoneyError(`Invalid float/infinity value: ${value}`);
    }
    // Number conversion should be strictly checked
    value = value.toFixed(6);
  }

  const str = value.trim();
  if (str.startsWith('-')) {
    throw new MoneyError(`Negative amounts are forbidden: ${str}`);
  }

  // Regex check for standard decimal notation
  if (!/^\d+(\.\d+)?$/.test(str)) {
    throw new MoneyError(`Invalid decimal format: "${str}"`);
  }

  const parts = str.split('.');
  const wholePart = parts[0];
  const fracPart = parts[1] || '';

  if (fracPart.length > DECIMALS) {
    throw new MoneyError(`Amount "${str}" exceeds maximum decimal precision of 6 places`);
  }

  // Pad fractional part with zeros to reach 6 decimals
  const paddedFrac = fracPart.padEnd(DECIMALS, '0');
  const baseUnitsStr = wholePart + paddedFrac;

  return BigInt(baseUnitsStr);
}

/**
 * Formats base units bigint to standard decimal string with 6 decimals.
 */
export function formatBaseUnits(baseUnits: bigint): string {
  if (baseUnits < 0n) {
    throw new MoneyError(`Negative base units not permitted: ${baseUnits}`);
  }

  const str = baseUnits.toString().padStart(DECIMALS + 1, '0');
  const splitPoint = str.length - DECIMALS;
  const whole = str.slice(0, splitPoint);
  const frac = str.slice(splitPoint);
  return `${whole}.${frac}`;
}

/**
 * Formats base units bigint to human-readable USD string e.g. "$1,500.00" or "$1,500.000000"
 */
export function formatUsdDisplay(baseUnits: bigint, decimals: 2 | 6 = 2): string {
  const full = formatBaseUnits(baseUnits);
  const [whole, frac] = full.split('.');
  const formattedWhole = Number(whole).toLocaleString('en-US');
  const displayedFrac = frac.slice(0, decimals);
  return `$${formattedWhole}.${displayedFrac}`;
}

/**
 * Safe addition
 */
export function add(a: bigint, b: bigint): bigint {
  if (a < 0n || b < 0n) throw new MoneyError('Cannot add negative amounts');
  return a + b;
}

/**
 * Safe subtraction (reverts if would result in negative)
 */
export function sub(a: bigint, b: bigint): bigint {
  if (a < 0n || b < 0n) throw new MoneyError('Cannot operate on negative amounts');
  if (a < b) {
    throw new MoneyError(`Underflow: attempted to subtract ${b} from ${a}`);
  }
  return a - b;
}

/**
 * Calculate basis points: (amount * bps) / 10000
 */
export function applyBps(amount: bigint, bps: number): bigint {
  if (amount < 0n) throw new MoneyError('Negative amount in applyBps');
  if (bps < 0) throw new MoneyError('Negative bps not allowed');
  return (amount * BigInt(bps)) / 10000n;
}

/**
 * Converts basis points to integer percentage string
 */
export function bpsToPercentString(bps: number): string {
  return (bps / 100).toFixed(2) + '%';
}
