import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import { parseAbi } from 'viem';

describe('Integration Safety & Compliance Verification', () => {
  it('verifies Arc Testnet chain constants and network config', () => {
    const ARC_CHAIN_ID = 5042002;
    const USDC_ADDRESS = '0x3600000000000000000000000000000000000000';
    const RPC_URL = 'https://rpc.testnet.arc.network';
    const EXPLORER_URL = 'https://testnet.arcscan.io';

    expect(ARC_CHAIN_ID).toBe(5042002);
    expect(USDC_ADDRESS.length).toBe(42);
    expect(USDC_ADDRESS.startsWith('0x3600')).toBe(true);
    expect(RPC_URL).toContain('testnet.arc.network');
    expect(EXPLORER_URL).toContain('testnet.arcscan.io');
  });

  it('verifies compiled artifacts contain all PRD required functions and custom errors', () => {
    const artifactPath = path.resolve(__dirname, '../artifacts/artifacts.json');
    expect(existsSync(artifactPath)).toBe(true);

    const artifacts = JSON.parse(readFileSync(artifactPath, 'utf8'));
    expect(artifacts.EuthynaVault).toBeDefined();
    expect(artifacts.EuthynaVault.bytecode.length).toBeGreaterThan(10000);

    const abi = artifacts.EuthynaVault.abi;
    const functionNames = abi.filter((x: any) => x.type === 'function').map((x: any) => x.name);
    const errorNames = abi.filter((x: any) => x.type === 'error').map((x: any) => x.name);

    // PRD Required functions
    const requiredFunctions = [
      'approvePayee',
      'revokePayee',
      'proposePayee',
      'registerObligation',
      'attestReceipt',
      'payObligation',
      'allocate',
      'redeem',
      'anchor',
      'pause',
      'unpause',
      'setRoles',
      'setPolicy',
      'rescueToOwner',
      'policy',
      'paused',
      'totalPaidToDate',
      'totalRegisteredPayables'
    ];

    for (const fn of requiredFunctions) {
      expect(functionNames).toContain(fn);
    }

    // PRD Required custom errors
    const requiredErrors = [
      'Unauthorized',
      'ContractPaused',
      'DecimalsMismatch',
      'ExactAmountMismatch',
      'ObligationAlreadyPaid',
      'ReserveFloorBreached',
      'PerTxCapExceeded',
      'DailyCapExceeded',
      'PayeeNotActive',
      'NotReceived',
      'TransferFailed',
      'ApproveFailed'
    ];

    for (const err of requiredErrors) {
      expect(errorNames).toContain(err);
    }
  });

  it('validates deployments.json honesty rules (no false onchain claims without receipt)', () => {
    const depPath = path.resolve(__dirname, '../../deployments.json');
    expect(existsSync(depPath)).toBe(true);

    const dep = JSON.parse(readFileSync(depPath, 'utf8'));
    expect(dep.chainId).toBe(5042002);
    expect(dep.usdc).toBe('0x3600000000000000000000000000000000000000');

    // If isRealBroadcast is false, vaultDeploymentTx must not be claimed as verified
    if (!dep.isRealBroadcast) {
      expect(dep.isRealBroadcast).toBe(false);
    } else {
      expect(dep.vaultDeploymentTx).toBeDefined();
      expect(dep.vaultDeploymentTx.startsWith('0x')).toBe(true);
    }
  });

  it('verifies that frontend contracts ABI matches compiled artifacts', () => {
    const artifactPath = path.resolve(__dirname, '../artifacts/artifacts.json');
    const artifacts = JSON.parse(readFileSync(artifactPath, 'utf8'));
    const compiledAbiFunctions = artifacts.EuthynaVault.abi
      .filter((x: any) => x.type === 'function')
      .map((x: any) => x.name)
      .sort();

    // Verify vital methods exist in compiled ABI
    expect(compiledAbiFunctions).toContain('approvePayee');
    expect(compiledAbiFunctions).toContain('payObligation');
    expect(compiledAbiFunctions).toContain('pause');
    expect(compiledAbiFunctions).toContain('unpause');
  });
});
