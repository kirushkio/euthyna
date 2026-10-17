import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createPublicClient, createWalletClient, http, defineChain, type Address } from 'viem';
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
export const ARC_EXPLORER_URL = 'https://testnet.arcscan.io';

export const arcTestnetChain = defineChain({
  id: ARC_TESTNET_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: { decimals: 6, name: 'USDC', symbol: 'USDC' },
  rpcUrls: { default: { http: [ARC_RPC] } },
  blockExplorers: { default: { name: 'ArcScan', url: ARC_EXPLORER_URL } },
});

async function main() {
  console.log('='.repeat(65));
  console.log('     EUTHYNA TREASURY — ONCHAIN ROLE SEPARATION UTILITY       ');
  console.log('='.repeat(65));

  if (!existsSync('deployments.json')) {
    console.error('✗ deployments.json not found. Run "pnpm deploy:arc" first.');
    process.exit(1);
  }

  const deployments = JSON.parse(readFileSync('deployments.json', 'utf8'));
  const vaultAddress = deployments.businesses[0]?.vaultAddress as Address;
  if (!vaultAddress) {
    console.error('✗ No vault address found in deployments.json');
    process.exit(1);
  }

  console.log(`\nTarget Vault: ${vaultAddress}`);
  console.log(`Current isRealBroadcast: ${deployments.isRealBroadcast}`);

  const privateKey = process.env.OWNER_PRIVATE_KEY || process.env.DEPLOYER_PRIVATE_KEY;
  if (!privateKey || !privateKey.startsWith('0x') || privateKey.length !== 66) {
    console.log('\n[DRY RUN / INSTRUCTION MODE]');
    console.log('To establish onchain role separation, provide:');
    console.log('  OWNER_PRIVATE_KEY=0x... (must be the owner wallet of the vault)');
    console.log('  REGISTRAR_ADDRESS=0x... (Intake service key)');
    console.log('  AGENT_ADDRESS=0x...     (Circle SCA key / Agent execution key)');
    console.log('  GUARDIAN_ADDRESS=0x...  (Emergency multisig or secondary account)');
    console.log('\nExample execution:');
    console.log('  REGISTRAR_ADDRESS=0x2222... AGENT_ADDRESS=0x3333... GUARDIAN_ADDRESS=0x4444... pnpm set-roles');
    return;
  }

  const registrar = (process.env.REGISTRAR_ADDRESS || deployments.businesses[0]?.registrar) as Address;
  const agent = (process.env.AGENT_ADDRESS || deployments.businesses[0]?.agent) as Address;
  const guardian = (process.env.GUARDIAN_ADDRESS || deployments.businesses[0]?.guardian) as Address;

  console.log(`\nProposed Role Separation:`);
  console.log(`  Registrar: ${registrar}`);
  console.log(`  Agent:     ${agent}`);
  console.log(`  Guardian:  ${guardian}`);

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  const publicClient = createPublicClient({ chain: arcTestnetChain, transport: http(ARC_RPC) });
  const walletClient = createWalletClient({ account, chain: arcTestnetChain, transport: http(ARC_RPC) });

  const artifact = JSON.parse(readFileSync('contracts/artifacts/artifacts.json', 'utf8'));

  console.log('\nBroadcasting setRoles transaction to Arc Testnet...');
  const hash = await walletClient.writeContract({
    address: vaultAddress,
    abi: artifact.EuthynaVault.abi,
    functionName: 'setRoles',
    args: [registrar, agent, guardian]
  });

  console.log(`Transaction broadcast: ${hash}`);
  console.log('Waiting for receipt on Arc Testnet...');
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  console.log(`✓ Roles successfully updated onchain in block #${receipt.blockNumber}!`);
  console.log(`✓ Explorer: ${ARC_EXPLORER_URL}/tx/${hash}`);

  // Update deployments.json
  deployments.businesses[0].registrar = registrar;
  deployments.businesses[0].agent = agent;
  deployments.businesses[0].guardian = guardian;
  writeFileSync('deployments.json', JSON.stringify(deployments, null, 2), 'utf8');
  console.log('✓ deployments.json updated with newly assigned role addresses.');
}

main().catch(console.error);
