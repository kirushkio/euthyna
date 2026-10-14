import { recoverAddress, hashMessage, toHex, Address } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { DecisionRecord } from '@euthyna/engine';

/**
 * Signs a decision record hash using an agent private key
 */
export async function signDecisionRecord(
  record: DecisionRecord,
  agentPrivateKey: `0x${string}`
): Promise<DecisionRecord> {
  const account = privateKeyToAccount(agentPrivateKey);
  const signature = await account.signMessage({
    message: { raw: record.hash as `0x${string}` }
  });

  return {
    ...record,
    signature
  };
}

/**
 * Recovers signer address from a signed decision record
 */
export async function recoverSignerAddress(record: DecisionRecord): Promise<Address> {
  if (!record.signature) {
    throw new Error('Record has no signature');
  }

  const recoveredAddress = await recoverAddress({
    hash: hashMessage({ raw: record.hash as `0x${string}` }),
    signature: record.signature as `0x${string}`
  });

  return recoveredAddress;
}
