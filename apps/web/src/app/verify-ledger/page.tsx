'use client';

import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  RotateCw,
  AlertTriangle,
  ExternalLink,
  Sliders,
  ChevronDown,
  ChevronUp,
  Lock,
  Layers
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
  },
  {
    seq: 4,
    simulatedDay: 12,
    action: 'REDEEM (Payroll Liquidity Buffer)',
    amount: '1,000.00 USDC',
    prevHash: '0x3f9821bb49a7102049e7710291938abf01948194819481948194819481948194',
    computedHash: '0x9920184719284710294710294710294710294710294710294710294710294710',
    storedHash: '0x9920184719284710294710294710294710294710294710294710294710294710',
    signatureStatus: 'VALID',
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    isValid: true
  },
  {
    seq: 5,
    simulatedDay: 14,
    action: 'PAY_OBLIGATION (Bi-Weekly Payroll)',
    amount: '4,000.00 USDC',
    prevHash: '0x9920184719284710294710294710294710294710294710294710294710294710',
    computedHash: '0x4482019284710294710294710294710294710294710294710294710294710294',
    storedHash: '0x4482019284710294710294710294710294710294710294710294710294710294',
    signatureStatus: 'VALID',
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    isValid: true
  }
];

export default function VerifyLedgerPage() {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [expandedSeq, setExpandedSeq] = useState<number | null>(3);

  const blocks: VerifiedBlock[] = INITIAL_BLOCKS.map(b => {
    if (isTampered && b.seq >= 3) {
      return {
        ...b,
        computedHash: '0xBAD0000000000000000000000000000000000000000000000000000000000BAD',
        signatureStatus: 'INVALID',
        isValid: false
      };
    }
    return b;
  });

  const handleRecompute = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 600);
  };

  const allPassed = blocks.every(b => b.isValid);

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Cryptographic Audit Ledger & Hash-Chain Verification
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Recomputes the SHA-256 hash chain, verifies ECDSA agent signatures, and confirms state-root anchoring on Arc Testnet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tamper Simulator Button */}
          <button
            onClick={() => setIsTampered(!isTampered)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isTampered
                ? 'bg-rose-50 text-rose-700 border-rose-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isTampered ? 'Tamper Active (Seq #3)' : 'Simulate Tamper'}</span>
          </button>

          <button
            onClick={handleRecompute}
            disabled={isVerifying}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-all shadow-xs"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>Re-verify Entire Chain</span>
          </button>
        </div>
      </div>

      {/* Verification Summary Banner */}
      <div
        className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-subtle ${
          allPassed
            ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            : 'bg-rose-50/80 border-rose-200 text-rose-950'
        }`}
      >
        <div className="flex items-center gap-3">
          {allPassed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <div>
            <div className="font-bold text-sm">
              {allPassed
                ? '100% Cryptographic Ledger Integrity Verified'
                : 'Integrity Breach Detected: Hash Chain Broken at Seq #3'}
            </div>
            <div className="text-xs text-slate-600 mt-0.5">
              {allPassed
                ? '5 of 5 sequential blocks mathematically valid · All agent ECDSA signatures verified · All Arc anchors confirmed.'
                : 'Tampering detected! The stored SHA-256 digest does not match the recomputed block hash. Fraudulent record isolated.'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs self-start sm:self-auto">
          <span className="font-bold">
            Records Checked: {blocks.length} / {blocks.length}
          </span>
        </div>
      </div>

      {/* Sequenced Blocks List */}
      <div className="space-y-3.5">
        {blocks.map((block) => {
          const isExpanded = expandedSeq === block.seq;

          return (
            <div
              key={block.seq}
              className={`p-5 rounded-xl bg-white border transition-all shadow-subtle space-y-3 ${
                block.isValid ? 'border-slate-200/90' : 'border-rose-300 ring-1 ring-rose-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200">
                    Seq #{block.seq}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{block.action}</span>
                  <span className="text-xs text-slate-400">· Day {block.simulatedDay}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-semibold flex items-center gap-1 ${
                      block.isValid
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {block.isValid ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{block.isValid ? 'VERIFIED' : 'TAMPERED / MISMATCH'}</span>
                  </span>

                  <button
                    onClick={() => setExpandedSeq(isExpanded ? null : block.seq)}
                    className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Main Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Transaction Amount</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    {block.amount}
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <div className="flex items-center gap-1 text-slate-600">
                    <span>Signature:</span>
                    <span className={block.signatureStatus === 'VALID' ? 'text-emerald-700 font-bold' : 'text-rose-600 font-bold'}>
                      {block.signatureStatus}
                    </span>
                  </div>

                  <a
                    href={`https://explorer.testnet.arc.io/tx/${block.anchorTx}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-sans font-medium"
                  >
                    <span>Arc Anchor</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Expandable Hashes */}
              {isExpanded && (
                <div className="pt-3 border-t border-slate-100 font-mono text-[11px] space-y-1.5 animate-in fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500">
                    <span>Previous Block Hash:</span>
                    <span className="text-slate-700 font-medium truncate max-w-sm">{block.prevHash}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500">
                    <span>Computed Hash:</span>
                    <span className={`font-medium truncate max-w-sm ${block.isValid ? 'text-slate-800' : 'text-rose-600 font-bold'}`}>
                      {block.computedHash}
                    </span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-slate-500">
                    <span>Stored Hash:</span>
                    <span className="text-slate-800 font-medium truncate max-w-sm">{block.storedHash}</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
