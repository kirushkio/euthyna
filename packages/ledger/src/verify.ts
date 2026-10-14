import { DecisionRecord } from '@euthyna/engine';
import { computeRecordHash, GENESIS_HASH } from './hashchain.js';
import { recoverSignerAddress } from './signing.js';

export interface VerificationBlockResult {
  seq: number;
  hash: string;
  expectedHash: string;
  hashValid: boolean;
  prevHashValid: boolean;
  signerAddress?: string;
  expectedSigner?: string;
  signatureValid: boolean;
  onchainAnchored: boolean;
  anchoredTx?: string;
  errorMessage?: string;
}

export interface VerificationReport {
  totalRecords: number;
  allValid: boolean;
  firstFailingSeq: number | null;
  blocks: VerificationBlockResult[];
  errorSummary?: string;
}

/**
 * Recomputes hash chain, checks cryptographic signatures, and matches onchain anchors
 */
export async function verifyLedgerChain(
  records: DecisionRecord[],
  expectedAgentAddress?: string,
  onchainAnchors?: { seq: number; decisionHash: string; txHash: string }[]
): Promise<VerificationReport> {
  const blocks: VerificationBlockResult[] = [];
  let allValid = true;
  let firstFailingSeq: number | null = null;

  let expectedPrevHash = GENESIS_HASH;

  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    let errorMessage: string | undefined;

    // 1. Check prev_hash link
    const prevHashValid = record.prevHash.toLowerCase() === expectedPrevHash.toLowerCase();
    if (!prevHashValid && !errorMessage) {
      errorMessage = `Broken hash chain: expected prev_hash ${expectedPrevHash}, got ${record.prevHash}`;
    }

    // 2. Recompute current hash
    const { hash, signature, ...withoutHash } = record;
    const computed = '0x' + computeRecordHash(withoutHash as any, record.prevHash);
    const hashValid = computed.toLowerCase() === record.hash.toLowerCase();
    if (!hashValid && !errorMessage) {
      errorMessage = `Hash mismatch at seq ${record.seq}: stored ${record.hash}, computed ${computed}`;
    }

    // 3. Verify signature if present
    let signatureValid = false;
    let signerAddress: string | undefined;
    if (record.signature) {
      try {
        signerAddress = await recoverSignerAddress(record);
        if (expectedAgentAddress) {
          signatureValid = signerAddress.toLowerCase() === expectedAgentAddress.toLowerCase();
          if (!signatureValid && !errorMessage) {
            errorMessage = `Signature recovered address ${signerAddress} does not match expected agent ${expectedAgentAddress}`;
          }
        } else {
          signatureValid = true;
        }
      } catch (err: any) {
        signatureValid = false;
        if (!errorMessage) errorMessage = `Signature verification failed: ${err.message}`;
      }
    } else {
      // If no signature is present yet
      signatureValid = !expectedAgentAddress;
    }

    // 4. Verify onchain anchor
    let onchainAnchored = !!record.anchoredTx || !!record.transactionHash;
    let anchoredTx = record.anchoredTx || record.transactionHash;

    if (onchainAnchors && onchainAnchors.length > 0) {
      const match = onchainAnchors.find(a => a.seq === record.seq);
      if (match) {
        onchainAnchored = match.decisionHash.toLowerCase() === record.hash.toLowerCase();
        anchoredTx = match.txHash;
        if (!onchainAnchored && !errorMessage) {
          errorMessage = `Onchain anchor hash mismatch: vault has ${match.decisionHash}, ledger has ${record.hash}`;
        }
      }
    }

    const blockPassed = prevHashValid && hashValid && signatureValid;

    blocks.push({
      seq: record.seq,
      hash: record.hash,
      expectedHash: computed,
      hashValid,
      prevHashValid,
      signerAddress,
      expectedSigner: expectedAgentAddress,
      signatureValid,
      onchainAnchored,
      anchoredTx,
      errorMessage
    });

    if (!blockPassed && allValid) {
      allValid = false;
      firstFailingSeq = record.seq;
    }

    expectedPrevHash = record.hash;
  }

  return {
    totalRecords: records.length,
    allValid,
    firstFailingSeq,
    blocks,
    errorSummary: firstFailingSeq !== null ? `Verification failed starting at block seq ${firstFailingSeq}` : undefined
  };
}
