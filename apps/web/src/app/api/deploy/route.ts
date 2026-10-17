import { NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import { createPublicClient, http } from 'viem';
import { arcTestnetChain, ARC_RPC_URL } from '../../../lib/contracts';

function getRepoRoot() {
  if (existsSync(path.resolve(process.cwd(), 'deployments.json'))) {
    return process.cwd();
  }
  return path.resolve(process.cwd(), '../..');
}

export async function GET() {
  try {
    const depPath = path.resolve(getRepoRoot(), 'deployments.json');
    if (existsSync(depPath)) {
      const dep = JSON.parse(readFileSync(depPath, 'utf8'));
      return NextResponse.json(dep);
    }
    return NextResponse.json({ error: 'deployments.json not found' }, { status: 404 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vaultAddress, txHash, deployerAddress, simYieldVaultAddress } = body;

    if (!vaultAddress || !vaultAddress.startsWith('0x') || vaultAddress.length !== 42) {
      return NextResponse.json({ error: 'Invalid vaultAddress' }, { status: 400 });
    }

    // Verify on Arc Testnet via RPC
    const client = createPublicClient({ chain: arcTestnetChain, transport: http(ARC_RPC_URL) });
    const code = await client.getBytecode({ address: vaultAddress });
    if (!code || code === '0x') {
      return NextResponse.json({ error: `No contract bytecode found on Arc Testnet at ${vaultAddress}` }, { status: 400 });
    }

    const depPath = path.resolve(getRepoRoot(), 'deployments.json');
    let deployments: any = {};
    if (existsSync(depPath)) {
      deployments = JSON.parse(readFileSync(depPath, 'utf8'));
    }

    deployments.network = 'Arc Testnet';
    deployments.chainId = 5042002;
    deployments.deployedAt = new Date().toISOString();
    deployments.deployerAddress = deployerAddress || deployments.deployerAddress;
    deployments.isRealBroadcast = true;
    deployments.vaultDeploymentTx = txHash;

    if (simYieldVaultAddress) {
      deployments.simYieldVault = simYieldVaultAddress;
    }

    if (deployments.businesses && deployments.businesses[0]) {
      deployments.businesses[0].vaultAddress = vaultAddress;
      if (deployerAddress) {
        deployments.businesses[0].owner = deployerAddress;
        deployments.businesses[0].registrar = deployerAddress;
        deployments.businesses[0].agent = deployerAddress;
        deployments.businesses[0].guardian = deployerAddress;
      }
    }

    writeFileSync(depPath, JSON.stringify(deployments, null, 2), 'utf8');

    return NextResponse.json({
      success: true,
      vaultAddress,
      txHash,
      isRealBroadcast: true,
      explorerUrl: `https://explorer.testnet.arc.io/address/${vaultAddress}`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
