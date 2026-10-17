import { NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

function getRepoRoot() {
  if (existsSync(path.resolve(process.cwd(), 'contracts/artifacts/artifacts.json'))) {
    return process.cwd();
  }
  return path.resolve(process.cwd(), '../..');
}

export async function GET() {
  try {
    const artifactPath = path.resolve(getRepoRoot(), 'contracts/artifacts/artifacts.json');
    if (!existsSync(artifactPath)) {
      return NextResponse.json({ error: 'artifacts.json not found' }, { status: 404 });
    }
    const artifacts = JSON.parse(readFileSync(artifactPath, 'utf8'));
    return NextResponse.json({
      vaultBytecode: artifacts.EuthynaVault.bytecode,
      simYieldBytecode: artifacts.SimYieldVault?.bytecode
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
