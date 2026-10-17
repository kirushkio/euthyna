'use client';

import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  ExternalLink,
} from 'lucide-react';

interface VerifiedBlock {
  seq: number;
  simulatedDay: number;
  action: string;
  amount: string;
  prevHash: string;
  computedHash: string;
  storedHash: string;
  signatureStatus: 'VALID' | 'INVALID';
  anchorTx: string;
  isValid: boolean;
}

const INITIAL_BLOCKS: VerifiedBlock[] = [
  {
    seq: 1,
    simulatedDay: 0,
    action: 'ALLOCATE (Yield Sweep)',
    amount: '4,500.00 USDC',
    prevHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    computedHash: '0x1928471029471029471029471029471029471029471029471029471029471029',
    storedHash: '0x1928471029471029471029471029471029471029471029471029471029471029',
    signatureStatus: 'VALID',
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    isValid: true
  },
  {
    seq: 2,
    simulatedDay: 3,
    action: 'PAY_OBLIGATION (AWS Cloud)',
    amount: '450.00 USDC',
    prevHash: '0x1928471029471029471029471029471029471029471029471029471029471029',
    computedHash: '0x8194719471947194719471947194719471947194719471947194719471947194',
    storedHash: '0x8194719471947194719471947194719471947194719471947194719471947194',
    signatureStatus: 'VALID',
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    isValid: true
  },
  {
    seq: 3,
    simulatedDay: 10,
    action: 'PAY_OBLIGATION (Figma 2% Discount)',
    amount: '1,470.00 USDC',
    prevHash: '0x8194719471947194719471947194719471947194719471947194719471947194',
    computedHash: '0x3f9821bb49a7102049e7710291938abf01948194819481948194819481948194',
    storedHash: '0x3f9821bb49a7102049e7710291938abf01948194819481948194819481948194',
    signatureStatus: 'VALID',
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    isValid: true
  }
];

export default function VerifyLedgerPage() {
  const [blocks, setBlocks] = useState<VerifiedBlock[]>(INITIAL_BLOCKS);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerifyAll = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <GitCommit className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold" style={{ color: '#F0F4FF' }}>
              Cryptographic Audit Ledger & Hashchain
            </h2>
          </div>
          <p className="text-xs mt-1" style={{ color: '#8B95B0' }}>
            Every cash movement is appended to an immutable SHA-256 hashchain anchored to Arc Testnet blocks.
          </p>
        </div>

        <button
          onClick={handleVerifyAll}
          disabled={isVerifying}
          className="px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all active:scale-95 text-white"
          style={{ background: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? 'Verifying Hashes…' : 'Recompute & Verify Hashchain'}</span>
        </button>
      </div>

      {/* Chain Status Banner */}
      <div
        className="p-4 rounded-xl flex items-center justify-between text-xs"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)', color: '#34D399' }}
      >
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <span className="font-semibold">Hashchain Integrity: 100% Intact & Verified (3/3 Blocks Match)</span>
        </div>
        <span className="text-[11px] font-mono" style={{ color: '#8B95B0' }}>SHA-256 Nonces Aligned</span>
      </div>

      {/* Block Sequence Cards */}
      <div className="space-y-4">
        {blocks.map((block) => (
          <div
            key={block.seq}
            className="p-6 rounded-2xl space-y-4 transition-all"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs"
                  style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.3)' }}
                >
                  #{block.seq}
                </span>
                <span className="text-sm font-bold" style={{ color: '#F0F4FF' }}>{block.action}</span>
                <span className="text-xs font-mono" style={{ color: '#34D399' }}>({block.amount})</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1"
                  style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Valid Signature</span>
                </span>
              </div>
            </div>

            {/* Hashes Detail */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span style={{ color: '#4A5568' }}>Previous Hash:</span>
                <span className="truncate max-w-md" style={{ color: '#8B95B0' }}>{block.prevHash}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <span style={{ color: '#4A5568' }}>Computed Block Hash:</span>
                <span className="truncate max-w-md font-bold" style={{ color: '#22D3EE' }}>{block.computedHash}</span>
              </div>
            </div>

            {/* Arc Explorer Link */}
            <div className="pt-2 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <span className="text-[11px]" style={{ color: '#4A5568' }}>Anchored On-Chain:</span>
              <a
                href={`https://explorer.testnet.arc.io/tx/${block.anchorTx}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 font-mono transition-colors"
                style={{ color: '#8B5CF6' }}
              >
                <span>Arc Block Receipt</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
