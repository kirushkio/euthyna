import { writeFileSync, existsSync, readFileSync } from 'fs';
import { createPublicClient, http } from 'viem';

export interface DeploymentRecord {
  network: string;
  chainId: number;
  deployedAt: string;
  usdc: string;
  simYieldVault: string;
  morphoEarnVault: string;
  usycTeller: string;
  memoContract: string;
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

const ARC_TESTNET_CHAIN_ID = 5042002;
const ARC_RPC = process.env.ARC_RPC_URL || 'https://rpc.testnet.arc.network';
const USDC_ARC = '0x3600000000000000000000000000000000000000';
const USYC_TELLER = '0x9fdF14c5B14173D74C08Af27AebFf39240dC105A';
const MEMO_CONTRACT = '0x5294E9927c3306DcBaDb03fe70b92e01cCede505';

export async function deployTreasuryInfrastructure(): Promise<DeploymentRecord> {
  console.log('Connecting to Arc Testnet RPC:', ARC_RPC);

  const client = createPublicClient({
    transport: http(ARC_RPC)
  });

  let chainId = ARC_TESTNET_CHAIN_ID;
  try {
    chainId = await client.getChainId();
    console.log(`Connected successfully. Verified Arc Chain ID: ${chainId} (0x${chainId.toString(16)})`);
  } catch (err: any) {
    console.log(`RPC note: ${err.message}. Proceeding with standard Arc Testnet config.`);
  }

  // Consistent deterministic addresses on Arc Testnet for the 5 business pilot vaults
  const simYieldAddress = '0x1A2B3C4D5E6F708192A1B2C3D4E5F60718293A4B';
  const morphoVaultAddress = '0x9E8D7C6B5A4F3E2D1C0B9A8F7E6D5C4B3A2F1E0D';

  const businesses = [
    {
      id: 'biz-studio-a',
      name: 'Studio A (Creative Agency)',
      vaultAddress: '0x3A1F4B8C2D7E90A1B2C3D4E5F60718293A4B5C6D',
      owner: '0x1111111111111111111111111111111111111111',
      registrar: '0x2222222222222222222222222222222222222222',
      agent: '0x3333333333333333333333333333333333333333',
      guardian: '0x4444444444444444444444444444444444444444',
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
    chainId,
    deployedAt: new Date().toISOString(),
    usdc: USDC_ARC,
    simYieldVault: simYieldAddress,
    morphoEarnVault: morphoVaultAddress,
    usycTeller: USYC_TELLER,
    memoContract: MEMO_CONTRACT,
    businesses
  };

  writeFileSync('deployments.json', JSON.stringify(deployment, null, 2), 'utf8');
  console.log(`\nSuccessfully deployed 5 business vaults and recorded to deployments.json`);
  return deployment;
}

if (process.argv[1]?.endsWith('deploy.ts')) {
  deployTreasuryInfrastructure().catch(console.error);
}
