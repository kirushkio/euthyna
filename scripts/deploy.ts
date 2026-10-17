import { writeFileSync, existsSync, readFileSync } from 'fs';
import path from 'path';
import {
  createPublicClient,
  createWalletClient,
  http,
  defineChain
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

if (existsSync('.env') && typeof (process as any).loadEnvFile === 'function') {
  try {
    (process as any).loadEnvFile();
  } catch (e) {
    // Ignore malformed or missing .env
  }
}

export interface DeploymentRecord {
  network: string;
  chainId: number;
  deployedAt: string;
  deployerAddress?: string;
  usdc: string;
  simYieldVault: string;
  morphoEarnVault: string;
  usycTeller: string;
  memoContract: string;
  isRealBroadcast: boolean;
  vaultDeploymentTx?: string;
  businesses: {
    id: string;
    name: string;
    vaultAddress: string;
    owner: string;
    registrar: string;
    agent: string;
    guardian: string;
    policy: {
      perTxCapUsdc: string;
      dailyCapUsdc: string;
      reserveFloorUsdc: string;
    };
  }[];
}

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_RPC = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
export const USDC_ARC = (process.env.USDC_ADDRESS || '0x3600000000000000000000000000000000000000') as `0x${string}`;
export const USYC_TELLER = process.env.USYC_TELLER_ADDRESS || '0x9fdF14c5B14173D74C08Af27AebFf39240dC105A';
export const MEMO_CONTRACT = process.env.MEMO_CONTRACT_ADDRESS || '0x5294E9927c3306DcBaDb03fe70b92e01cCede505';

export const arcTestnetChain = defineChain({
  id: ARC_TESTNET_CHAIN_ID,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 6,
    name: 'USDC',
    symbol: 'USDC',
  },
  rpcUrls: {
    default: { http: [ARC_RPC] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
});

export async function deployTreasuryInfrastructure(): Promise<DeploymentRecord> {
  console.log('Connecting to Arc Testnet RPC:', ARC_RPC);

  const publicClient = createPublicClient({
    chain: arcTestnetChain,
    transport: http(ARC_RPC)
  });

  const verifiedChainId = await publicClient.getChainId();
  console.log(`Connected successfully. Verified Arc Chain ID: ${verifiedChainId}`);

  // Check if a real private key is provided via environment
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  let isRealBroadcast = false;
  let deployedVaultAddress = '0x3A1F4B8C2D7E90A1B2C3D4E5F60718293A4B5C6D';
  let deployedSimYieldAddress = '0x1A2B3C4D5E6F708192A1B2C3D4E5F60718293A4B';
  let deploymentTxHash: string | undefined;
  let deployerAddress: string | undefined;

  if (privateKey && privateKey.startsWith('0x') && privateKey.length === 66) {
    console.log('\n[REAL BROADCAST MODE] Deployer private key detected.');
    const account = privateKeyToAccount(privateKey as `0x${string}`);
    deployerAddress = account.address;
    console.log(`Deployer Account: ${account.address}`);

    const balance = await publicClient.getBalance({ address: account.address });
    const balanceUsdc = Number(balance) / 1e6;
    console.log(`Deployer Balance: ${balanceUsdc.toFixed(4)} USDC`);

    if (balance <= 0n) {
      throw new Error(
        `Insufficient gas funds on Arc Testnet. Account ${account.address} has ${balanceUsdc} USDC. Please obtain testnet USDC from the Arc faucet before deploying.`
      );
    }

    // Load compiled artifact
    const artifactPath = path.resolve(__dirname, '../contracts/artifacts/artifacts.json');
    if (!existsSync(artifactPath)) {
      throw new Error('artifacts.json not found. Run "node contracts/test/compile.js" first.');
    }
    const artifacts = JSON.parse(readFileSync(artifactPath, 'utf8'));

    const walletClient = createWalletClient({
      account,
      chain: arcTestnetChain,
      transport: http(ARC_RPC)
    });

    const initialPolicy = {
      perTxCap: 5000_000000n,
      dailyCap: 8000_000000n,
      minLiquidReserve: 3000_000000n,
      newPayeeCooldown: 86400n,
      minTicket: 100_000000n,
    };

    console.log('Broadcasting EuthynaVault deployment transaction to Arc Testnet...');
    const hash = await walletClient.deployContract({
      abi: artifacts.EuthynaVault.abi,
      bytecode: artifacts.EuthynaVault.bytecode,
      args: [
        USDC_ARC,
        account.address, // owner
        account.address, // registrar
        account.address, // agent
        account.address, // guardian
        initialPolicy
      ]
    });

    console.log(`Deployment Tx broadcast! Tx Hash: ${hash}`);
    console.log('Waiting for transaction receipt on Arc Testnet...');
    const receipt = await publicClient.waitForTransactionReceipt({ hash });

    if (!receipt.contractAddress) {
      throw new Error(`Transaction mined but contractAddress was not returned. Status: ${receipt.status}`);
    }

    deployedVaultAddress = receipt.contractAddress;
    deploymentTxHash = hash;
    isRealBroadcast = true;
    console.log(`✓ EuthynaVault successfully deployed onchain at: ${deployedVaultAddress}`);
    console.log(`✓ Block Number: ${receipt.blockNumber.toString()}`);
    console.log(`✓ Explorer: https://testnet.arcscan.app/address/${deployedVaultAddress}`);

    // Deploy SimYieldVault as live yield venue
    if (artifacts.SimYieldVault) {
      console.log('\nBroadcasting SimYieldVault deployment transaction to Arc Testnet...');
      const yieldHash = await walletClient.deployContract({
        abi: artifacts.SimYieldVault.abi,
        bytecode: artifacts.SimYieldVault.bytecode,
        args: [
          USDC_ARC,
          520n, // 5.20% APR (520 bps)
          86400n // 24h redemption delay (PRD Section 8.4)
        ]
      });
      const yieldReceipt = await publicClient.waitForTransactionReceipt({ hash: yieldHash });
      if (yieldReceipt.contractAddress) {
        deployedSimYieldAddress = yieldReceipt.contractAddress;
        console.log(`✓ SimYieldVault deployed onchain at: ${deployedSimYieldAddress}`);
        console.log(`✓ Explorer: https://testnet.arcscan.app/address/${deployedSimYieldAddress}`);

        // Register venue on EuthynaVault
        console.log('Registering SimYieldVault venue in EuthynaVault (Owner action)...');
        const enableHash = await walletClient.writeContract({
          address: deployedVaultAddress,
          abi: artifacts.EuthynaVault.abi,
          functionName: 'enableVenue',
          args: [deployedSimYieldAddress, 5000, true] // Max 50% concentration cap
        });
        await publicClient.waitForTransactionReceipt({ hash: enableHash });
        console.log(`✓ SimYieldVault enabled in vault (Max 50% concentration cap)`);
      }
    }
  } else {
    console.log('\n[DRY RUN / PREFLIGHT MODE] No deployer private key supplied.');
    console.log('To broadcast real onchain contracts, set DEPLOYER_PRIVATE_KEY in .env');
    
    // Safety check: if deployments.json already has a real broadcast recorded, NEVER overwrite it with placeholder data!
    if (existsSync('deployments.json')) {
      const existing = JSON.parse(readFileSync('deployments.json', 'utf8'));
      if (existing.isRealBroadcast) {
        console.log('Preserving existing verified onchain deployment records in deployments.json.');
        return existing;
      }
    }
  }

  const businesses = [
    {
      id: 'biz-studio-a',
      name: 'Studio A (Creative Agency)',
      vaultAddress: deployedVaultAddress,
      owner: deployerAddress || '0x1111111111111111111111111111111111111111',
      registrar: deployerAddress || '0x2222222222222222222222222222222222222222',
      agent: deployerAddress || '0x3333333333333333333333333333333333333333',
      guardian: deployerAddress || '0x4444444444444444444444444444444444444444',
      policy: {
        perTxCapUsdc: '5,000.00',
        dailyCapUsdc: '8,000.00',
        reserveFloorUsdc: '3,000.00'
      }
    },
    {
      id: 'biz-dev-guild',
      name: 'Dev Guild (Engineering Collective)',
      vaultAddress: '0x4B2C5D9E3F8A01B2C3D4E5F60718293A4B5C6D7E',
      owner: '0x1111111111111111111111111111111111111111',
      registrar: '0x2222222222222222222222222222222222222222',
      agent: '0x3333333333333333333333333333333333333333',
      guardian: '0x4444444444444444444444444444444444444444',
      policy: {
        perTxCapUsdc: '5,000.00',
        dailyCapUsdc: '10,000.00',
        reserveFloorUsdc: '4,000.00'
      }
    },
    {
      id: 'biz-saas-co',
      name: 'SaaS Metrics Co (B2B Software)',
      vaultAddress: '0x5C3D6E0F4A9B12C3D4E5F60718293A4B5C6D7E8F',
      owner: '0x1111111111111111111111111111111111111111',
      registrar: '0x2222222222222222222222222222222222222222',
      agent: '0x3333333333333333333333333333333333333333',
      guardian: '0x4444444444444444444444444444444444444444',
      policy: {
        perTxCapUsdc: '4,000.00',
        dailyCapUsdc: '8,000.00',
        reserveFloorUsdc: '2,500.00'
      }
    },
    {
      id: 'biz-freelance-hub',
      name: 'Freelance Hub (Contractor Collective)',
      vaultAddress: '0x6D4E7F1A5B0C23D4E5F60718293A4B5C6D7E8F90',
      owner: '0x1111111111111111111111111111111111111111',
      registrar: '0x2222222222222222222222222222222222222222',
      agent: '0x3333333333333333333333333333333333333333',
      guardian: '0x4444444444444444444444444444444444444444',
      policy: {
        perTxCapUsdc: '2,500.00',
        dailyCapUsdc: '6,000.00',
        reserveFloorUsdc: '2,000.00'
      }
    },
    {
      id: 'biz-design-studio',
      name: 'Design Studio X (Product & Brand)',
      vaultAddress: '0x7E5F8A2B6C1D34E5F60718293A4B5C6D7E8F90A1',
      owner: '0x1111111111111111111111111111111111111111',
      registrar: '0x2222222222222222222222222222222222222222',
      agent: '0x3333333333333333333333333333333333333333',
      guardian: '0x4444444444444444444444444444444444444444',
      policy: {
        perTxCapUsdc: '3,000.00',
        dailyCapUsdc: '6,000.00',
        reserveFloorUsdc: '2,500.00'
      }
    }
  ];

  const deployment: DeploymentRecord = {
    network: 'Arc Testnet',
    chainId: verifiedChainId,
    deployedAt: new Date().toISOString(),
    deployerAddress,
    usdc: USDC_ARC,
    simYieldVault: deployedSimYieldAddress,
    morphoEarnVault: '0x9E8D7C6B5A4F3E2D1C0B9A8F7E6D5C4B3A2F1E0D',
    usycTeller: USYC_TELLER,
    memoContract: MEMO_CONTRACT,
    isRealBroadcast,
    vaultDeploymentTx: deploymentTxHash,
    businesses
  };

  writeFileSync('deployments.json', JSON.stringify(deployment, null, 2), 'utf8');
  console.log(`\nDeployment state recorded in deployments.json (isRealBroadcast: ${isRealBroadcast})`);
  return deployment;
}

if (process.argv[1]?.endsWith('deploy.ts')) {
  deployTreasuryInfrastructure().catch(console.error);
}
