import { describe, it, expect, beforeAll } from 'vitest';
import { createVM } from '@ethereumjs/vm';
import { createAddressFromString, createAccount } from '@ethereumjs/util';
import {
  encodeDeployData,
  encodeFunctionData,
  decodeFunctionResult,
  toHex,
  keccak256,
  stringToBytes
} from 'viem';
import fs from 'fs';
import path from 'path';

interface Artifacts {
  EuthynaVault: { abi: any[]; bytecode: `0x${string}` };
  MockUSDC: { abi: any[]; bytecode: `0x${string}` };
}

describe('EuthynaVault EVM Smart Contract Safety Tests', () => {
  let vm: any;
  let artifacts: Artifacts;
  let usdcAddress: `0x${string}`;
  let vaultAddress: `0x${string}`;

  // Role addresses
  const OWNER = '0x1111111111111111111111111111111111111111' as const;
  const REGISTRAR = '0x2222222222222222222222222222222222222222' as const;
  const AGENT = '0x3333333333333333333333333333333333333333' as const;
  const GUARDIAN = '0x4444444444444444444444444444444444444444' as const;
  const ATTACKER = '0x9999999999999999999999999999999999999999' as const;
  const VENDOR_PAYEE = '0x6666666666666666666666666666666666666666' as const;
  const ARC_BLOCKLISTED = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as const;

  // Helper to run an EVM call
  async function callContract(params: {
    caller: `0x${string}`;
    to?: `0x${string}`;
    data: `0x${string}`;
  }) {
    const callerAddress = createAddressFromString(params.caller);
    const toAddress = params.to ? createAddressFromString(params.to) : undefined;

    const res = await vm.evm.runCall({
      caller: callerAddress,
      to: toAddress,
      data: Buffer.from(params.data.slice(2), 'hex'),
      gasLimit: 15_000_000n,
    });

    return res;
  }

  beforeAll(async () => {
    // 1. Load compiled artifacts
    const artifactPath = path.resolve(__dirname, '../artifacts/artifacts.json');
    if (!fs.existsSync(artifactPath)) {
      throw new Error('artifacts.json not found. Please compile contracts first.');
    }
    artifacts = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));

    // 2. Initialize fresh EVM instance
    vm = await createVM();

    // 3. Fund accounts with native gas
    for (const addr of [OWNER, REGISTRAR, AGENT, GUARDIAN, ATTACKER]) {
      await vm.stateManager.putAccount(
        createAddressFromString(addr),
        createAccount({ balance: 100n * 10n ** 18n })
      );
    }

    // 4. Deploy MockUSDC
    const usdcDeployData = encodeDeployData({
      abi: artifacts.MockUSDC.abi,
      bytecode: artifacts.MockUSDC.bytecode,
    });
    const usdcRes = await callContract({ caller: OWNER, data: usdcDeployData });
    expect(usdcRes.execResult.exceptionError).toBeUndefined();
    const rawUsdcAddr = usdcRes.createdAddress.toString();
    usdcAddress = (rawUsdcAddr.startsWith('0x') ? rawUsdcAddr : `0x${rawUsdcAddr}`) as `0x${string}`;

    // 5. Deploy EuthynaVault
    const initialPolicy = {
      perTxCap: 5000_000000n, // $5,000 max per tx
      dailyCap: 8000_000000n, // $8,000 max per day
      minLiquidReserve: 3000_000000n, // $3,000 reserve floor
      newPayeeCooldown: 86400n, // 1 day cooldown
      minTicket: 100_000000n, // $100 min ticket
    };

    const vaultDeployData = encodeDeployData({
      abi: artifacts.EuthynaVault.abi,
      bytecode: artifacts.EuthynaVault.bytecode,
      args: [usdcAddress, OWNER, REGISTRAR, AGENT, GUARDIAN, initialPolicy],
    });

    const vaultRes = await callContract({ caller: OWNER, data: vaultDeployData });
    expect(vaultRes.execResult.exceptionError).toBeUndefined();
    const rawVaultAddr = vaultRes.createdAddress.toString();
    vaultAddress = (rawVaultAddr.startsWith('0x') ? rawVaultAddr : `0x${rawVaultAddr}`) as `0x${string}`;

    // 6. Mint $10,000 USDC directly into EuthynaVault
    const mintData = encodeFunctionData({
      abi: artifacts.MockUSDC.abi,
      functionName: 'mint',
      args: [vaultAddress, 10000_000000n],
    });
    const mintRes = await callContract({ caller: OWNER, to: usdcAddress, data: mintData });
    expect(mintRes.execResult.exceptionError).toBeUndefined();
  });

  it('enforces role access control: unauthorized non-Owner cannot set policy or approve payees', async () => {
    const approvePayeeData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'approvePayee',
      args: [VENDOR_PAYEE],
    });

    // Caller is ATTACKER (not OWNER) -> must revert with Unauthorized()
    const res = await callContract({ caller: ATTACKER, to: vaultAddress, data: approvePayeeData });
    expect(res.execResult.exceptionError).toBeDefined();
  });

  it('rejects blocklisted payees from being proposed or approved', async () => {
    // Propose ARC_BLOCKLISTED address -> must revert
    const proposeData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'proposePayee',
      args: [ARC_BLOCKLISTED, keccak256(stringToBytes('metadata'))],
    });

    const res = await callContract({ caller: REGISTRAR, to: vaultAddress, data: proposeData });
    expect(res.execResult.exceptionError).toBeDefined();
  });

  it('rejects registering an obligation for an inactive/unapproved payee', async () => {
    const unapprovedPayee = '0x5555555555555555555555555555555555555555' as const;
    const obligationId = keccak256(stringToBytes('ob-unapproved-1'));

    const registerData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'registerObligation',
      args: [
        obligationId,
        unapprovedPayee,
        1500_000000n,
        1000n, // dueTs
        200,   // discountBps (2%)
        500n,  // discountDeadlineTs
        false, // requiresReceipt
        1,     // kind (DISCRETIONARY)
        keccak256(stringToBytes('docHash'))
      ],
    });

    const res = await callContract({ caller: REGISTRAR, to: vaultAddress, data: registerData });
    expect(res.execResult.exceptionError).toBeDefined();
  });

  it('successfully approves a valid payee and registers a legitimate obligation', async () => {
    // 1. Owner approves VENDOR_PAYEE
    const approveData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'approvePayee',
      args: [VENDOR_PAYEE],
    });
    const approveRes = await callContract({ caller: OWNER, to: vaultAddress, data: approveData });
    expect(approveRes.execResult.exceptionError).toBeUndefined();

    // 2. Registrar registers obligation for VENDOR_PAYEE ($1,500 USDC, 2% discount)
    const obligationId = keccak256(stringToBytes('ob-valid-figma'));
    const registerData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'registerObligation',
      args: [
        obligationId,
        VENDOR_PAYEE,
        1500_000000n,
        10000000000n, // dueTs
        200,          // discountBps (2%)
        5000000000n,  // discountDeadlineTs
        false,        // requiresReceipt
        1,            // kind: DISCRETIONARY
        keccak256(stringToBytes('figma-invoice-doc-hash'))
      ],
    });

    const registerRes = await callContract({ caller: REGISTRAR, to: vaultAddress, data: registerData });
    expect(registerRes.execResult.exceptionError).toBeUndefined();
  });

  it('rejects duplicate obligations with the same ID', async () => {
    const obligationId = keccak256(stringToBytes('ob-valid-figma'));
    const registerData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'registerObligation',
      args: [
        obligationId,
        VENDOR_PAYEE,
        1500_000000n,
        10000000000n,
        200,
        5000000000n,
        false,
        1,
        keccak256(stringToBytes('figma-invoice-doc-hash'))
      ],
    });

    // Submitting duplicate obligation ID -> must revert
    const res = await callContract({ caller: REGISTRAR, to: vaultAddress, data: registerData });
    expect(res.execResult.exceptionError).toBeDefined();
  });

  it('rejects payment with incorrect/manipulated amount (ExactAmountMismatch)', async () => {
    const obligationId = keccak256(stringToBytes('ob-valid-figma'));
    // Attempting to pay $1,200 instead of exact discounted $1,470 or full $1,500
    const manipulatedAmount = 1200_000000n;

    const payData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'payObligation',
      args: [obligationId, manipulatedAmount, keccak256(stringToBytes('decisionHash'))],
    });

    const res = await callContract({ caller: AGENT, to: vaultAddress, data: payData });
    expect(res.execResult.exceptionError).toBeDefined();
  });

  it('rejects payment that would breach the reserve floor', async () => {
    // Register obligation for $7,500 (Vault has $10,000, reserve floor is $3,000)
    // $10,000 - $7,500 = $2,500 < $3,000 floor -> Must revert!
    const largeObId = keccak256(stringToBytes('ob-large-payroll'));
    const registerData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'registerObligation',
      args: [
        largeObId,
        VENDOR_PAYEE,
        4500_000000n,
        10000000000n,
        0, // No discount
        0n,
        false,
        1, // DISCRETIONARY
        keccak256(stringToBytes('large-doc-hash'))
      ],
    });
    await callContract({ caller: REGISTRAR, to: vaultAddress, data: registerData });

    // Drain vault to $3,200 by rescuing $6,800 to owner
    const rescueData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'rescueToOwner',
      args: [usdcAddress, 6800_000000n],
    });
    await callContract({ caller: OWNER, to: vaultAddress, data: rescueData });

    // Vault now has $3,200 USDC. Paying $1,470 leaves $1,730, which violates $3,000 reserve floor!
    const payData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'payObligation',
      args: [largeObId, 4500_000000n, keccak256(stringToBytes('decisionHash'))],
    });

    const res = await callContract({ caller: AGENT, to: vaultAddress, data: payData });
    expect(res.execResult.exceptionError).toBeDefined();
  });

  it('successfully executes a safe payment and prevents double payment (idempotency)', async () => {
    // Fund vault back to $10,000
    const mintData = encodeFunctionData({
      abi: artifacts.MockUSDC.abi,
      functionName: 'mint',
      args: [vaultAddress, 10000_000000n],
    });
    await callContract({ caller: OWNER, to: usdcAddress, data: mintData });

    const obligationId = keccak256(stringToBytes('ob-valid-figma'));
    // Valid discounted payment: $1,500 - 2% ($30) = $1,470.00 USDC
    const exactDiscountedAmount = 1470_000000n;
    const decisionHash = keccak256(stringToBytes('valid-decision-hash'));

    const payData = encodeFunctionData({
      abi: artifacts.EuthynaVault.abi,
      functionName: 'payObligation',
      args: [obligationId, exactDiscountedAmount, decisionHash],
    });

    // 1. Agent executes payment -> Succeeded
    const res = await callContract({ caller: AGENT, to: vaultAddress, data: payData });
    expect(res.execResult.exceptionError).toBeUndefined();

    // 2. Check vendor received exact USDC
    const balanceData = encodeFunctionData({
      abi: artifacts.MockUSDC.abi,
      functionName: 'balanceOf',
      args: [VENDOR_PAYEE],
    });
    const balanceRes = await callContract({ caller: OWNER, to: usdcAddress, data: balanceData });
    const rawHex = Buffer.from(balanceRes.execResult.returnValue).toString('hex');
    const vendorBalance = decodeFunctionResult({
      abi: artifacts.MockUSDC.abi,
      functionName: 'balanceOf',
      data: `0x${rawHex}`,
    });
    expect(vendorBalance).toBe(exactDiscountedAmount);

    // 3. Attempting duplicate payout of same obligation ID -> Must revert with ObligationAlreadyPaid()
    const duplicateRes = await callContract({ caller: AGENT, to: vaultAddress, data: payData });
    expect(duplicateRes.execResult.exceptionError).toBeDefined();
  });
});
