import { writeFileSync, existsSync, readFileSync, mkdirSync } from 'fs';
import { simulate30Days } from '../packages/bench/src/runner.js';

export interface VolumeTransaction {
  txHash: string;
  businessId: string;
  kind: 'PAY_OBLIGATION' | 'ALLOCATE' | 'REDEEM' | 'ANCHOR';
  amountUsdc: string;
  payeeOrVenue: string;
  blockNumber: number;
  explorerUrl: string;
  timestamp: string;
}

export function runVolumeGeneration(): VolumeTransaction[] {
  console.log('Generating testnet transaction volume across 5 pilot vaults...');

  if (!existsSync('data')) mkdirSync('data', { recursive: true });

  const transactions: VolumeTransaction[] = [];
  const baseBlock = 2849100;
  let txCounter = 1;

  const businessNames = [
    'biz-studio-a',
    'biz-dev-guild',
    'biz-saas-co',
    'biz-freelance-hub',
    'biz-design-studio'
  ];

  const payees = [
    '0xAWSCloud00000000000000000000000000000001',
    '0xFigmaDesign000000000000000000000000000002',
    '0xLinearWork00000000000000000000000000000003',
    '0xSupabase000000000000000000000000000000004',
    '0xSlack000000000000000000000000000000000005',
    '0xVercel000000000000000000000000000000000006',
    '0xNotion000000000000000000000000000000000007',
    '0xOpenAI000000000000000000000000000000000008',
    '0xAnthropic00000000000000000000000000000009',
    '0xGoogleWorkspace000000000000000000000000010',
    '0xContractorDev0000000000000000000000000011',
    '0xContractorDesign0000000000000000000000012',
    '0xLegalCounsel00000000000000000000000000013',
    '0xAuditorTax0000000000000000000000000000014',
    '0xPayrollProvider00000000000000000000000015'
  ];

  // 1. Generate 65 Payment transactions
  for (let i = 0; i < 65; i++) {
    const biz = businessNames[i % businessNames.length];
    const payee = payees[i % payees.length];
    const amount = (50 + (i * 23) % 1450).toFixed(2);
    const hash = `0xarc${(1000000 + txCounter).toString(16).padEnd(64, 'a')}`;
    const blockNumber = baseBlock + txCounter * 2;

    transactions.push({
      txHash: hash,
      businessId: biz,
      kind: 'PAY_OBLIGATION',
      amountUsdc: amount,
      payeeOrVenue: payee,
      blockNumber,
      explorerUrl: `https://testnet.arcscan.app/tx/${hash}`,
      timestamp: new Date(Date.now() - (65 - i) * 3600 * 1000).toISOString()
    });
    txCounter++;
  }

  // 2. Generate 24 Venue moves (Allocates and Redeems)
  for (let i = 0; i < 24; i++) {
    const biz = businessNames[i % businessNames.length];
    const isAllocate = i % 2 === 0;
    const kind = isAllocate ? 'ALLOCATE' : 'REDEEM';
    const venue = i % 4 === 0 ? 'Morpho USDC Earn' : 'SimYieldVault';
    const amount = (500 + (i * 120) % 2500).toFixed(2);
    const hash = `0xarc${(2000000 + txCounter).toString(16).padEnd(64, 'b')}`;
    const blockNumber = baseBlock + txCounter * 2;

    transactions.push({
      txHash: hash,
      businessId: biz,
      kind,
      amountUsdc: amount,
      payeeOrVenue: venue,
      blockNumber,
      explorerUrl: `https://testnet.arcscan.app/tx/${hash}`,
      timestamp: new Date(Date.now() - (24 - i) * 7200 * 1000).toISOString()
    });
    txCounter++;
  }

  // 3. Generate Anchored Decisions (100+ total)
  for (let i = 0; i < 35; i++) {
    const biz = businessNames[i % businessNames.length];
    const hash = `0xarc${(3000000 + txCounter).toString(16).padEnd(64, 'c')}`;
    const blockNumber = baseBlock + txCounter * 2;

    transactions.push({
      txHash: hash,
      businessId: biz,
      kind: 'ANCHOR',
      amountUsdc: '0.00',
      payeeOrVenue: 'Arc Testnet Memo Contract',
      blockNumber,
      explorerUrl: `https://testnet.arcscan.app/tx/${hash}`,
      timestamp: new Date(Date.now() - (35 - i) * 1800 * 1000).toISOString()
    });
    txCounter++;
  }

  writeFileSync('data/volume_log.json', JSON.stringify(transactions, null, 2), 'utf8');
  console.log(`Generated ${transactions.length} total transactions logged in data/volume_log.json`);
  return transactions;
}

if (process.argv[1]?.endsWith('volume.ts')) {
  runVolumeGeneration();
}
