import { DecisionRecord, formatBaseUnits, TreasurySnapshot } from '@euthyna/engine';

export interface BeancountExportOptions {
  businessName: string;
  startDate: string; // YYYY-MM-DD
  records: DecisionRecord[];
  dailySnapshots: TreasurySnapshot[];
}

/**
 * Generates strict Beancount format double-entry ledger text with zero-tolerance balance assertions
 */
export function generateBeancountLedger(options: BeancountExportOptions): string {
  const lines: string[] = [];

  // Header & Commodity declaration
  lines.push(';; ========================================================');
  lines.push(`;; Euthyna Treasury Beancount Export: ${options.businessName}`);
  lines.push(';; Independent Accounting Witness - Double-Entry Ledger');
  lines.push(';; ========================================================');
  lines.push('');
  lines.push('option "title" "Euthyna Treasury Ledger"');
  lines.push('option "operating_currency" "USDC"');
  lines.push('');

  // Account Declarations
  const openDate = options.startDate;
  lines.push(`${openDate} open Equity:Opening`);
  lines.push(`${openDate} open Assets:Vault:USDC USDC`);
  lines.push(`${openDate} open Assets:Venue:SimYield USDC`);
  lines.push(`${openDate} open Assets:Venue:MorphoEarn USDC`);
  lines.push(`${openDate} open Assets:Venue:USYC USDC`);
  lines.push(`${openDate} open Liabilities:Payables:General USDC`);
  lines.push(`${openDate} open Income:Discounts USDC`);
  lines.push(`${openDate} open Income:Yield USDC`);
  lines.push(`${openDate} open Expenses:Gas USDC`);
  lines.push('');

  // Opening balance from day 0 snapshot
  if (options.dailySnapshots.length > 0) {
    const s0 = options.dailySnapshots[0];
    const initialUsdc = formatBaseUnits(s0.liquidBalance);
    lines.push(`${openDate} * "Opening Balance"`);
    lines.push(`  Assets:Vault:USDC         ${initialUsdc} USDC`);
    lines.push(`  Equity:Opening           -${initialUsdc} USDC`);
    lines.push('');
  }

  // Transactions derived from decision records
  for (const record of options.records) {
    const action = record.chosenAction;
    const simDay = record.simulatedDay;
    // Map simDay to ISO date string starting from startDate
    const dateObj = new Date(options.startDate);
    dateObj.setDate(dateObj.getDate() + simDay);
    const dateStr = dateObj.toISOString().slice(0, 10);

    if (action.type === 'PAY_OBLIGATION' && action.amount > 0n) {
      const amountStr = formatBaseUnits(action.amount);
      const gasFeeStr = '0.010000'; // $0.01
      lines.push(`${dateStr} * "Paid obligation: ${action.obligationId || 'due'}" "Seq #${record.seq}"`);
      lines.push(`  Liabilities:Payables:General   ${amountStr} USDC`);
      lines.push(`  Assets:Vault:USDC             -${amountStr} USDC`);
      lines.push(`  Expenses:Gas                   ${gasFeeStr} USDC`);
      lines.push(`  Assets:Vault:USDC             -${gasFeeStr} USDC`);

      // If early discount was captured
      if (record.chosenAction.expectedValueUsd > 0) {
        const discountEarned = record.chosenAction.expectedValueUsd.toFixed(6);
        lines.push(`  Income:Discounts              -${discountEarned} USDC`);
        lines.push(`  Assets:Vault:USDC              ${discountEarned} USDC`);
      }
      lines.push('');
    } else if (action.type === 'ALLOCATE' && action.amount > 0n) {
      const amountStr = formatBaseUnits(action.amount);
      const venueAccount = action.venueId?.includes('morpho')
        ? 'Assets:Venue:MorphoEarn'
        : 'Assets:Venue:SimYield';
      lines.push(`${dateStr} * "Allocate to yield venue: ${action.venueId}" "Seq #${record.seq}"`);
      lines.push(`  ${venueAccount}                ${amountStr} USDC`);
      lines.push(`  Assets:Vault:USDC             -${amountStr} USDC`);
      lines.push('');
    } else if (action.type === 'REDEEM' && action.amount > 0n) {
      const amountStr = formatBaseUnits(action.amount);
      const venueAccount = action.venueId?.includes('morpho')
        ? 'Assets:Venue:MorphoEarn'
        : 'Assets:Venue:SimYield';
      lines.push(`${dateStr} * "Redeem from yield venue: ${action.venueId}" "Seq #${record.seq}"`);
      lines.push(`  Assets:Vault:USDC              ${amountStr} USDC`);
      lines.push(`  ${venueAccount}               -${amountStr} USDC`);
      lines.push('');
    }
  }

  // Daily balance assertions (Zero Tolerance: 0.000001)
  lines.push(';; Daily Balance Assertions directly from onchain reads');
  for (const snap of options.dailySnapshots) {
    const dateObj = new Date(options.startDate);
    dateObj.setDate(dateObj.getDate() + snap.simulatedDay);
    const dateStr = dateObj.toISOString().slice(0, 10);
    const liquidStr = formatBaseUnits(snap.liquidBalance);

    lines.push(`${dateStr} balance Assets:Vault:USDC ${liquidStr} USDC ~ 0.000001 USDC`);
  }

  return lines.join('\n');
}
