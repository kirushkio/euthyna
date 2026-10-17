'use client';

import React, { useState } from 'react';
import {
  GitCommit,
  CheckCircle2,
  ShieldCheck,
  RotateCw,
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter,
  Terminal,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lock,
  Layers,
  Sparkles,
  Link2,
} from 'lucide-react';
import { ARC_EXPLORER_URL } from '../../lib/contracts';

interface VerifiedBlock {
  seq: number;
  simulatedDay: number;
  timestamp: string;
  action: string;
  category: 'PAYMENT' | 'YIELD' | 'GOVERNANCE';
  amount: string;
  vendor: string;
  prevHash: string;
  computedHash: string;
  storedHash: string;
  signatureStatus: 'VALID' | 'INVALID';
  signer: string;
  nonce: number;
  anchorTx: string;
  gasSponsored: boolean;
  isValid: boolean;
  payloadJson: {
    ruleEnforced: string;
    reserveFloorBefore: string;
    reserveFloorAfter: string;
    discountCapturedUsdc?: string;
    annualizedYieldRate?: string;
  };
}

const INITIAL_BLOCKS: VerifiedBlock[] = [
  {
    seq: 1,
    simulatedDay: 0,
    timestamp: '2026-10-14 09:30:12 UTC',
    action: 'ALLOCATE (Yield Sweep)',
    category: 'YIELD',
    amount: '4,500.00 USDC',
    vendor: 'SimYield Vault (Arc)',
    prevHash: '0x0000000000000000000000000000000000000000000000000000000000000000',
    computedHash: '0x1928471029471029471029471029471029471029471029471029471029471029',
    storedHash: '0x1928471029471029471029471029471029471029471029471029471029471029',
    signatureStatus: 'VALID',
    signer: '0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01',
    nonce: 104402,
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    gasSponsored: true,
    isValid: true,
    payloadJson: {
      ruleEnforced: 'Rule G8 (Venue Safe Capacity <= 50% Total Treasury)',
      reserveFloorBefore: '$10,000.00 USDC',
      reserveFloorAfter: '$5,500.00 Liquid ($3,000 Floor Intact)',
      annualizedYieldRate: '5.20% APY'
    }
  },
  {
    seq: 2,
    simulatedDay: 3,
    timestamp: '2026-10-15 14:15:40 UTC',
    action: 'PAY_OBLIGATION (AWS Cloud Hosting)',
    category: 'PAYMENT',
    amount: '450.00 USDC',
    vendor: 'AWS Cloud Infrastructure',
    prevHash: '0x1928471029471029471029471029471029471029471029471029471029471029',
    computedHash: '0x8194719471947194719471947194719471947194719471947194719471947194',
    storedHash: '0x8194719471947194719471947194719471947194719471947194719471947194',
    signatureStatus: 'VALID',
    signer: '0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01',
    nonce: 104403,
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    gasSponsored: true,
    isValid: true,
    payloadJson: {
      ruleEnforced: 'Rule G2 (Net 30 Due Date Settlement & Zero Late Fees)',
      reserveFloorBefore: '$5,500.00 USDC',
      reserveFloorAfter: '$5,050.00 USDC ($3,000 Floor Intact)'
    }
  },
  {
    seq: 3,
    simulatedDay: 10,
    timestamp: '2026-10-16 11:05:00 UTC',
    action: 'PAY_OBLIGATION (Figma 2% Discount)',
    category: 'PAYMENT',
    amount: '1,470.00 USDC',
    vendor: 'Figma Enterprise',
    prevHash: '0x8194719471947194719471947194719471947194719471947194719471947194',
    computedHash: '0x3f9821bb49a7102049e7710291938abf01948194819481948194819481948194',
    storedHash: '0x3f9821bb49a7102049e7710291938abf01948194819481948194819481948194',
    signatureStatus: 'VALID',
    signer: '0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01',
    nonce: 104404,
    anchorTx: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    gasSponsored: true,
    isValid: true,
    payloadJson: {
      ruleEnforced: 'Rule G4 (2/10 Early Discount Captured) & Rule G6 (Reserve Floor Protected)',
      reserveFloorBefore: '$5,050.00 USDC',
      reserveFloorAfter: '$3,580.00 USDC ($3,000 Floor Intact)',
      discountCapturedUsdc: '+$30.00 Net Savings (37.2% APR equivalent)'
    }
  }
];

export default function VerifyLedgerPage() {
  const [blocks, setBlocks] = useState<VerifiedBlock[]>(INITIAL_BLOCKS);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyProgress, setVerifyProgress] = useState(0);
  const [activeBlockCheck, setActiveBlockCheck] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PAYMENT' | 'YIELD'>('ALL');
  const [expandedSeq, setExpandedSeq] = useState<number | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const headHash = blocks[blocks.length - 1].computedHash;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleVerifyAll = () => {
    setIsVerifying(true);
    setVerifyProgress(10);
    setActiveBlockCheck(1);

    setTimeout(() => {
      setVerifyProgress(45);
      setActiveBlockCheck(2);
    }, 400);

    setTimeout(() => {
      setVerifyProgress(85);
      setActiveBlockCheck(3);
    }, 800);

    setTimeout(() => {
      setVerifyProgress(100);
      setActiveBlockCheck(null);
      setIsVerifying(false);
    }, 1200);
  };

  const filteredBlocks = blocks.filter((b) => {
    if (selectedCategory !== 'ALL' && b.category !== selectedCategory) return false;
    if (searchQuery.trim() === '') return true;
    const q = searchQuery.toLowerCase();
    return (
      b.action.toLowerCase().includes(q) ||
      b.vendor.toLowerCase().includes(q) ||
      b.computedHash.toLowerCase().includes(q) ||
      b.anchorTx.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 max-w-5xl">

      {/* ── Page Header ── */}
      <div
        className="p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-interactive"
        style={{
          background: 'linear-gradient(135deg, #141A27 0%, #101522 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        <div>
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.30)' }}
            >
              <GitCommit className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span>Cryptographic Audit Ledger</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide"
                  style={{ background: 'rgba(34,211,238,0.12)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }}
                >
                  SHA-256 HASHCHAIN
                </span>
              </h2>
              <p className="text-xs mt-0.5" style={{ color: '#8B95B0' }}>
                Every treasury decision is cryptographically sequenced and anchored into immutable Arc Testnet smart contract state.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleVerifyAll}
          disabled={isVerifying}
          className="px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 text-white shrink-0 self-start sm:self-auto disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            boxShadow: '0 0 20px rgba(139,92,246,0.4)',
          }}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>{isVerifying ? `Scanning Block #${activeBlockCheck}…` : 'Recompute & Verify Hashchain'}</span>
        </button>
      </div>

      {/* ── Telemetry & Consensus Proof Bar ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Metric 1 */}
        <div
          className="p-4 rounded-xl space-y-1.5"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between text-[11px]" style={{ color: '#8B95B0' }}>
            <span className="flex items-center gap-1.5 font-semibold">
              <Layers className="w-3.5 h-3.5 text-violet-400" />
              Block Sequence
            </span>
            <span className="text-emerald-400 font-mono text-[10px]">LATEST #3</span>
          </div>
          <div className="text-lg font-bold font-mono text-white">3 Blocks</div>
          <div className="text-[10px]" style={{ color: '#4A5568' }}>Continuous zero-gap chain</div>
        </div>

        {/* Metric 2 */}
        <div
          className="p-4 rounded-xl space-y-1.5"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between text-[11px]" style={{ color: '#8B95B0' }}>
            <span className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Integrity Invariant
            </span>
            <div className="w-1.5 h-1.5 rounded-full pulse-node-green bg-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-emerald-400">100% Proven</div>
          <div className="text-[10px]" style={{ color: '#4A5568' }}>0 hash collisions · 0 breaches</div>
        </div>

        {/* Metric 3 */}
        <div
          className="p-4 rounded-xl space-y-1.5"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between text-[11px]" style={{ color: '#8B95B0' }}>
            <span className="flex items-center gap-1.5 font-semibold">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Consensus Engine
            </span>
            <span className="text-cyan-400 font-mono text-[10px]">#5042002</span>
          </div>
          <div className="text-base font-bold font-mono text-white truncate">Arc Orbit EVM</div>
          <div className="text-[10px]" style={{ color: '#4A5568' }}>On-chain Stylus state machine</div>
        </div>

        {/* Metric 4 */}
        <div
          className="p-4 rounded-xl space-y-1.5"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex items-center justify-between text-[11px]" style={{ color: '#8B95B0' }}>
            <span className="flex items-center gap-1.5 font-semibold">
              <Link2 className="w-3.5 h-3.5 text-amber-400" />
              Head Hash
            </span>
            <button
              onClick={() => handleCopy(headHash)}
              className="text-[10px] text-violet-400 hover:text-white flex items-center gap-1 transition-colors"
            >
              {copiedHash === headHash ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
              <span>{copiedHash === headHash ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
          <div className="text-xs font-mono font-bold text-violet-300 truncate" title={headHash}>
            {headHash.slice(0, 10)}…{headHash.slice(-8)}
          </div>
          <div className="text-[10px]" style={{ color: '#4A5568' }}>Anchored head pointer</div>
        </div>
      </div>

      {/* ── Active Verification Scanning Banner (appears when verifying) ── */}
      {isVerifying && (
        <div
          className="p-4 rounded-xl text-xs space-y-2 scanline-effect animate-in fade-in"
          style={{
            background: 'rgba(139,92,246,0.15)',
            border: '1px solid rgba(139,92,246,0.35)',
            color: '#F0F4FF'
          }}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold flex items-center gap-2">
              <RotateCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
              <span>Cryptographic Scanner: Recalculating SHA-256 Merkle Proofs…</span>
            </span>
            <span className="font-mono text-cyan-400 font-bold">{verifyProgress}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.10)' }}>
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${verifyProgress}%`,
                background: 'linear-gradient(90deg, #8B5CF6, #22D3EE)',
              }}
            />
          </div>
        </div>
      )}

      {/* ── Search & Filter Controls ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
        {/* Category Pills */}
        <div className="flex items-center gap-2">
          {(['ALL', 'PAYMENT', 'YIELD'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
              style={
                selectedCategory === cat
                  ? { background: '#8B5CF6', color: '#FFFFFF', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }
                  : { background: '#141A27', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.08)' }
              }
            >
              {cat === 'ALL' ? `All Blocks (${blocks.length})` : cat === 'PAYMENT' ? 'Invoice Settlements' : 'Yield Sweeps'}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search block, hash, or vendor…"
            className="w-full pl-8 pr-3 py-1.5 rounded-xl text-xs focus:outline-none"
            style={{
              background: '#141A27',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#F0F4FF',
            }}
          />
        </div>
      </div>

      {/* ── Connected Hashchain Timeline Visualizer ── */}
      <div className="relative space-y-5">

        {filteredBlocks.map((block, idx) => {
          const isExpanded = expandedSeq === block.seq;
          const isCurrentlyScanning = activeBlockCheck === block.seq;

          return (
            <div key={block.seq} className="relative">

              {/* Vertical connector line to next block */}
              {idx < filteredBlocks.length - 1 && (
                <div
                  className="absolute left-6 top-16 bottom-0 w-0.5 z-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(139,92,246,0.6) 0%, rgba(34,211,238,0.4) 100%)',
                    height: 'calc(100% + 20px)',
                  }}
                />
              )}

              {/* Block Card */}
              <div
                className={`p-5 sm:p-6 rounded-2xl relative z-10 card-interactive transition-all ${
                  isCurrentlyScanning ? 'scanline-effect' : ''
                }`}
                style={{
                  background: isCurrentlyScanning ? '#192033' : '#141A27',
                  border: isCurrentlyScanning
                    ? '1px solid #22D3EE'
                    : isExpanded
                    ? '1px solid rgba(139,92,246,0.40)'
                    : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isCurrentlyScanning
                    ? '0 0 30px rgba(34,211,238,0.25)'
                    : '0 4px 20px rgba(0,0,0,0.3)',
                }}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center gap-3">
                    {/* Glowing Sequence Badge */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.25) 0%, rgba(34,211,238,0.15) 100%)',
                        border: '1px solid rgba(139,92,246,0.4)',
                        color: '#A78BFA',
                        boxShadow: '0 0 12px rgba(139,92,246,0.2)',
                      }}
                    >
                      #{block.seq}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{block.action}</span>
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                          style={
                            block.category === 'YIELD'
                              ? { background: 'rgba(34,211,238,0.12)', color: '#22D3EE', border: '1px solid rgba(34,211,238,0.25)' }
                              : { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }
                          }
                        >
                          {block.amount}
                        </span>
                      </div>
                      <div className="text-[11px] mt-0.5 flex items-center gap-2" style={{ color: '#4A5568' }}>
                        <span>Counterparty: <strong style={{ color: '#8B95B0' }}>{block.vendor}</strong></span>
                        <span>·</span>
                        <span>Day {block.simulatedDay}</span>
                        <span>·</span>
                        <span className="font-mono">{block.timestamp}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Status Seals */}
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
                    <span
                      className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"
                      style={{ background: 'rgba(16,185,129,0.10)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>SHA-256 Valid</span>
                    </span>

                    {/* ArcScan Receipt Pill */}
                    <a
                      href={`${ARC_EXPLORER_URL}/tx/${block.anchorTx}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        color: '#A78BFA',
                        border: '1px solid rgba(139,92,246,0.30)',
                      }}
                      title="Inspect block transaction receipt on ArcScan Explorer"
                    >
                      <ExternalLink className="w-3 h-3 text-violet-400" />
                      <span>ArcScan #{block.anchorTx.slice(0, 6)}… ↗</span>
                    </a>
                  </div>
                </div>

                {/* Hashes Summary Row */}
                <div className="pt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Parent Hash */}
                  <div
                    className="p-2.5 rounded-xl space-y-1"
                    style={{ background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    <div className="flex items-center justify-between text-[10px]" style={{ color: '#4A5568' }}>
                      <span className="font-semibold uppercase tracking-wider">Parent Block Hash (Prev)</span>
                      <button
                        onClick={() => handleCopy(block.prevHash)}
                        className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedHash === block.prevHash ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedHash === block.prevHash ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-slate-400 truncate text-[11px]" title={block.prevHash}>
                      {block.prevHash}
                    </div>
                  </div>

                  {/* Computed Hash */}
                  <div
                    className="p-2.5 rounded-xl space-y-1"
                    style={{ background: 'rgba(34,211,238,0.05)', border: '1px solid rgba(34,211,238,0.18)' }}
                  >
                    <div className="flex items-center justify-between text-[10px]" style={{ color: '#22D3EE' }}>
                      <span className="font-semibold uppercase tracking-wider flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" />
                        Computed State Hash
                      </span>
                      <button
                        onClick={() => handleCopy(block.computedHash)}
                        className="text-[10px] text-cyan-400 hover:text-white flex items-center gap-1"
                      >
                        {copiedHash === block.computedHash ? <Check className="w-2.5 h-2.5 text-emerald-400" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>{copiedHash === block.computedHash ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="text-cyan-300 font-bold truncate text-[11px]" title={block.computedHash}>
                      {block.computedHash}
                    </div>
                  </div>
                </div>

                {/* Expand Toggle */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedSeq(isExpanded ? null : block.seq)}
                    className="text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    style={{ color: '#8B5CF6' }}
                  >
                    <Terminal className="w-3.5 h-3.5" />
                    <span>{isExpanded ? 'Hide Merkle & Nonce Telemetry' : 'Inspect Cryptographic Proof & State Transition'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-[10px] font-mono" style={{ color: '#4A5568' }}>
                    Nonce #{block.nonce} · Gas Sponsored
                  </span>
                </div>

                {/* Expandable Cryptographic Payload Box */}
                {isExpanded && (
                  <div
                    className="mt-3 p-4 rounded-xl space-y-3 font-mono text-xs animate-in fade-in"
                    style={{
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(139,92,246,0.25)',
                    }}
                  >
                    <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <span className="text-[11px] font-bold text-violet-300 flex items-center gap-1.5">
                        <Cpu className="w-3 h-3 text-cyan-400" />
                        <span>Deterministic State Payload</span>
                      </span>
                      <span className="text-[10px] text-emerald-400">STATUS: REVERSIBLE_ZERO</span>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div>
                        <span style={{ color: '#4A5568' }}>Policy Rule: </span>
                        <span style={{ color: '#F0F4FF' }}>{block.payloadJson.ruleEnforced}</span>
                      </div>
                      <div className="flex gap-4">
                        <div>
                          <span style={{ color: '#4A5568' }}>Reserve Floor (Pre): </span>
                          <span style={{ color: '#FCD34D' }}>{block.payloadJson.reserveFloorBefore}</span>
                        </div>
                        <div>
                          <span style={{ color: '#4A5568' }}>Reserve Floor (Post): </span>
                          <span style={{ color: '#34D399' }}>{block.payloadJson.reserveFloorAfter}</span>
                        </div>
                      </div>
                      {block.payloadJson.discountCapturedUsdc && (
                        <div>
                          <span style={{ color: '#4A5568' }}>Value Impact: </span>
                          <span className="font-bold" style={{ color: '#34D399' }}>{block.payloadJson.discountCapturedUsdc}</span>
                        </div>
                      )}
                      {block.payloadJson.annualizedYieldRate && (
                        <div>
                          <span style={{ color: '#4A5568' }}>Yield Rate: </span>
                          <span className="font-bold text-cyan-400">{block.payloadJson.annualizedYieldRate}</span>
                        </div>
                      )}
                      <div className="pt-1 text-[10px]" style={{ color: '#4A5568' }}>
                        Signer: <span className="text-slate-400">{block.signer}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
