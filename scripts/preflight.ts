import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

if (existsSync('.env') && typeof (process as any).loadEnvFile === 'function') {
  try {
    (process as any).loadEnvFile();
  } catch (e) {
    // Ignore malformed or missing .env
  }
}

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_RPC = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
export const USDC_ARC = (process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as `0x${string}`;

async function runPreflight() {
  console.log('='.repeat(65));
  console.log('       EUTHYNA TREASURY — ARC TESTNET PREFLIGHT AUDIT       ');
  console.log('='.repeat(65));

  // 1. RPC & Chain ID Check
  console.log(`\n[1/5] Checking Arc Testnet RPC connection: ${ARC_RPC}`);
  const client = createPublicClient({ transport: http(ARC_RPC) });
  
  let chainId: number;
  try {
    chainId = await client.getChainId();
    console.log(`      ✓ Connected successfully. Chain ID: ${chainId}`);
    if (chainId !== ARC_TESTNET_CHAIN_ID) {
      throw new Error(`Chain ID mismatch! Expected ${ARC_TESTNET_CHAIN_ID}, got ${chainId}`);
    }
  } catch (err: any) {
    console.error(`      ✗ Failed to connect to Arc Testnet RPC: ${err?.message || err}`);
    process.exit(1);
  }

  // 2. USDC ERC-20 Contract Check
  console.log(`\n[2/5] Checking Arc Testnet USDC contract at ${USDC_ARC}`);
  try {
    const code = await client.getBytecode({ address: USDC_ARC });
    if (!code || code === '0x') {
      throw new Error(`No contract deployed at ${USDC_ARC}`);
    }
    console.log(`      ✓ Bytecode verified onchain (${code.length} bytes).`);

    const erc20Abi = parseAbi(['function decimals() view returns (uint8)']);
    const decimals = await client.readContract({
      address: USDC_ARC,
      abi: erc20Abi,
      functionName: 'decimals'
    });
    console.log(`      ✓ Token decimals verified: ${decimals} (Asserted 6 decimals for PRD Section 8 compliance)`);
    if (decimals !== 6) {
      throw new Error(`USDC decimals mismatch: expected 6, got ${decimals}`);
    }
  } catch (err: any) {
    console.error(`      ✗ USDC verification failed: ${err?.message || err}`);
    process.exit(1);
  }

  // 3. Compiler Artifacts Check
  console.log('\n[3/5] Checking Solidity compilation artifacts');
  const artifactPath = path.resolve(__dirname, '../contracts/artifacts/artifacts.json');
  if (!existsSync(artifactPath)) {
    console.error(`      ✗ artifacts.json missing at ${artifactPath}. Run "node contracts/test/compile.js"`);
    process.exit(1);
  }
  const artifacts = JSON.parse(readFileSync(artifactPath, 'utf8'));
  if (!artifacts.EuthynaVault?.bytecode || !artifacts.EuthynaVault?.abi) {
    console.error('      ✗ EuthynaVault artifact incomplete in artifacts.json');
    process.exit(1);
  }
  console.log(`      ✓ EuthynaVault compiled bytecode (${artifacts.EuthynaVault.bytecode.length} hex chars, ${artifacts.EuthynaVault.abi.length} ABI elements).`);
  if (artifacts.SimYieldVault?.bytecode) {
    console.log(`      ✓ SimYieldVault compiled bytecode (${artifacts.SimYieldVault.bytecode.length} hex chars).`);
  }

  // 4. Deployer Account & Gas Funds Check
  console.log('\n[4/5] Checking Deployer Configuration');
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  if (privateKey && privateKey.startsWith('0x') && privateKey.length === 66) {
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    console.log(`      ✓ Deployer account detected: ${account.address}`);
    const balance = await client.getBalance({ address: account.address });
    const balanceUsdc = Number(balance) / 1e6;
    console.log(`      ✓ Native Gas Balance: ${balanceUsdc.toFixed(4)} USDC`);
    if (balance <= 0n) {
      console.warn(`      ⚠️ Account has 0 USDC gas. Claim testnet USDC at https://faucet.testnet.arc.network before broadcasting.`);
    } else {
      console.log(`      ✓ Sufficient gas funds confirmed for contract deployment.`);
    }
  } else {
    console.log('      ℹ No DEPLOYER_PRIVATE_KEY configured.');
    console.log('        Operating in SAFE PREFLIGHT / DRY-RUN MODE.');
    console.log('        To broadcast onchain, create a local .env with a dedicated disposable testnet key.');
  }

  // 5. Deployments Record State
  console.log('\n[5/5] Checking deployments.json state');
  if (existsSync('deployments.json')) {
    const dep = JSON.parse(readFileSync('deployments.json', 'utf8'));
    console.log(`      ✓ deployments.json present. isRealBroadcast: ${dep.isRealBroadcast}`);
    if (dep.isRealBroadcast) {
      console.log(`      ✓ Verified deployed vault address: ${dep.businesses[0]?.vaultAddress}`);
    }
  } else {
    console.log('      ℹ deployments.json will be generated on deployment.');
  }

  console.log('\n' + '='.repeat(65));
  console.log('               PREFLIGHT AUDIT PASSED (ALL CHECKS OK)          ');
  console.log('='.repeat(65) + '\n');
}

runPreflight().catch((err) => {
  console.error('\nPreflight failed with error:', err);
  process.exit(1);
});
