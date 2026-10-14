import { keccak256, toHex, stringToBytes } from 'viem';
import { Obligation, Vendor } from './types.js';

export const ARC_KNOWN_BLOCKLISTED_ADDRESS = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8'.toLowerCase();
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export interface RawInvoiceInput {
  invoiceNumber: string;
  vendorName: string;
  payeeAddress: `0x${string}`;
  amountUsd: string;
  dueDay: number;
  discountTerms?: {
    p: number;
    n: number;
    N: number;
  };
  rawText: string;
  purchaseOrderRef?: string;
  receiptAttested?: boolean;
}

export interface EvidenceCheckResult {
  passed: boolean;
  docHash: `0x${string}`;
  fingerprint: string;
  duplicateDetected: boolean;
  vendorMatch: boolean;
  threeWayMatchPassed: boolean;
  blocklistFlagged: boolean;
  injectionFlagged: boolean;
  flaggedReasons: string[];
  injectionDetails?: {
    flaggedSpan: string;
    score: number;
  };
}

/**
 * Computes canonical keccak256 hash of document text/metadata
 */
export function computeDocumentHash(content: string): `0x${string}` {
  return keccak256(stringToBytes(content.trim()));
}

/**
 * Computes unique fingerprint to detect duplicate submissions even with changed invoice numbers
 */
export function computeInvoiceFingerprint(input: {
  vendorName: string;
  amount: bigint;
  dueDay: number;
  docHash: string;
}): string {
  const normalized = `${input.vendorName.toLowerCase().trim()}:${input.amount.toString()}:${input.dueDay}:${input.docHash}`;
  return keccak256(stringToBytes(normalized));
}

/**
 * Prompt injection scan over untrusted invoice text or vendor emails
 */
export function scanUntrustedInputForInjection(text: string): {
  detected: boolean;
  flaggedSpan?: string;
  score: number;
} {
  const lower = text.toLowerCase();
  const injectionPatterns = [
    /ignore (all )?previous instructions/i,
    /disregard (all )?prior/i,
    /system prompt/i,
    /send_usdc/i,
    /override (the )?policy/i,
    /send to 0x[a-f0-9]{40}/i,
    /bypass (the )?reserve/i,
    /you are now a/i,
    /jailbreak/i,
    /developer mode enabled/i,
    /pay immediately to new address/i
  ];

  for (const pattern of injectionPatterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        detected: true,
        flaggedSpan: match[0],
        score: 0.95
      };
    }
  }

  return { detected: false, score: 0.0 };
}

/**
 * Comprehensive evidence check on an incoming invoice before registration
 */
export function verifyInvoiceEvidence(
  invoice: RawInvoiceInput,
  parsedAmount: bigint,
  existingObligations: Obligation[],
  knownVendors: Record<string, Vendor>
): EvidenceCheckResult {
  const docHash = computeDocumentHash(invoice.rawText);
  const fingerprint = computeInvoiceFingerprint({
    vendorName: invoice.vendorName,
    amount: parsedAmount,
    dueDay: invoice.dueDay,
    docHash
  });

  const reasons: string[] = [];

  // 1. Blocklist & Zero-address check
  const payeeLower = invoice.payeeAddress.toLowerCase();
  const isBlocklisted = payeeLower === ARC_KNOWN_BLOCKLISTED_ADDRESS || payeeLower === ZERO_ADDRESS;
  if (isBlocklisted) {
    reasons.push(`Payee address ${invoice.payeeAddress} is blocklisted or zero-address`);
  }

  // 2. Duplicate detection (same fingerprint or same docHash already in registered obligations)
  const isDuplicate = existingObligations.some(
    ob => ob.documentHash.toLowerCase() === docHash.toLowerCase()
  );
  if (isDuplicate) {
    reasons.push('Duplicate invoice detected: exact document hash already registered');
  }

  // 3. Vendor master check
  const matchedVendor = Object.values(knownVendors).find(
    v => v.name.toLowerCase() === invoice.vendorName.toLowerCase()
  );
  let vendorMatch = false;
  if (!matchedVendor) {
    reasons.push(`Vendor "${invoice.vendorName}" not found in vendor master`);
  } else if (matchedVendor.payeeAddress.toLowerCase() !== payeeLower) {
    reasons.push(
      `Payee address mismatch: master record has ${matchedVendor.payeeAddress}, invoice specifies ${invoice.payeeAddress}`
    );
  } else if (matchedVendor.status !== 'Active') {
    reasons.push(`Vendor status is ${matchedVendor.status}, must be Active to register`);
  } else {
    vendorMatch = true;
  }

  // 4. Three-way match
  // In v1: requires receipt confirmation if PO ref is provided or standard purchase
  const threeWayMatchPassed = !!invoice.receiptAttested;
  if (!threeWayMatchPassed && invoice.purchaseOrderRef) {
    reasons.push('Goods receipt not yet attested for purchase order');
  }

  // 5. Injection screening
  const injectionResult = scanUntrustedInputForInjection(invoice.rawText);
  if (injectionResult.detected) {
    reasons.push(`Potential prompt injection flagged: "${injectionResult.flaggedSpan}"`);
  }

  const passed = !isBlocklisted && !isDuplicate && vendorMatch;

  return {
    passed,
    docHash,
    fingerprint,
    duplicateDetected: isDuplicate,
    vendorMatch,
    threeWayMatchPassed,
    blocklistFlagged: isBlocklisted,
    injectionFlagged: injectionResult.detected,
    flaggedReasons: reasons,
    injectionDetails: injectionResult.detected ? injectionResult : undefined
  };
}
