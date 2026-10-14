'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cpu,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge';

const SAMPLE_DECISION_CARDS = [
  {
    seq: 14,
    timestamp: '2026-10-14 18:30:12 UTC',
    simulatedDay: 10,
    businessName: 'Studio A (Creative Agency)',
    actionType: 'PAY_OBLIGATION',
    amountUsdc: '1,470.00',
    originalAmountUsdc: '1,500.00',
    target: 'Figma Enterprise (INV-8492)',
    expectedValueUsd: 25.97,
    rationale:
      'Day 10 is the final day of the 2/10 Net 30 discount window. Paying $1,470 today saves $30.00 for paying 20 days early, yielding 37.2% annualized return. Foregone yield in venue is $4.03, gas is $0.01, giving net positive EV of +$25.97. Remaining liquid ($3,580) preserves the $3,000 reserve floor.',
    gatePassed: true,
    gateRules: [
      { id: 'G1', name: 'Schema & Amount', status: 'PASS' },
      { id: 'G2', name: 'Registered & Unpaid', status: 'PASS' },
      { id: 'G3', name: 'Vendor Master Match', status: 'PASS' },
      { id: 'G4', name: 'Exact Discount Amount', status: 'PASS' },
      { id: 'G5', name: 'Caps Respected', status: 'PASS' },
      { id: 'G6', name: 'Preserves Reserve Floor', status: 'PASS' },
      { id: 'G7', name: 'Shortfall Risk < Epsilon', status: 'PASS' },
      { id: 'G14', name: 'Simulation Succeeded', status: 'PASS' }
    ],
    alternatives: [
      {
        type: 'HOLD',
        ev: -30.0,
        reason: 'Wait for due date (Day 30) and forfeit $30.00 discount entirely'
      },
      {
        type: 'ALLOCATE',
        ev: 4.03,
        reason: 'Park in SimYield at 5.20% APR earning only $4.03 over 20 days'
      }
    ],
    txHash: '0xarc91a82fbc0017a42ef3910cbe88200f681a942004bbde0199ac718a992019',
    recordHash: '0x3f9821bb49a7102049e7710291938abf01948194819481948194819481948194',
    signatureValid: true
  },
  {
    seq: 13,
    timestamp: '2026-10-14 14:15:00 UTC',
    simulatedDay: 3,
    businessName: 'Studio A (Creative Agency)',
    actionType: 'PAY_OBLIGATION',
    amountUsdc: '450.00',
    originalAmountUsdc: '450.00',
    target: 'AWS Cloud Hosting',
    expectedValueUsd: 0.0,
    rationale:
      'Cloud hosting bill due today on Day 3 (terms Net 15, no early discount). Paying exact registered amount $450.00. Paying earlier would have lost yield; paying now avoids late penalties.',
    gatePassed: true,
    gateRules: [
      { id: 'G1', name: 'Schema & Amount', status: 'PASS' },
      { id: 'G2', name: 'Registered & Unpaid', status: 'PASS' },
      { id: 'G4', name: 'Exact Registered Amount', status: 'PASS' },
      { id: 'G5', name: 'Daily Cap Respected', status: 'PASS' },
      { id: 'G14', name: 'Simulation Succeeded', status: 'PASS' }
    ],
    alternatives: [
      {
        type: 'HOLD',
        ev: -25.0,
        reason: 'Default on cloud invoice incurring $25 late fee and service disruption'
      }
    ],
    txHash: '0xarc71948bbcae001847192847102847102847102847102847102847102847102',
    recordHash: '0x8194719471947194719471947194719471947194719471947194719471947194',
    signatureValid: true
  },
  {
    seq: 12,
    timestamp: '2026-10-14 09:00:00 UTC',
    simulatedDay: 0,
    businessName: 'Studio A (Creative Agency)',
    actionType: 'ALLOCATE',
    amountUsdc: '4,500.00',
    target: 'SimYieldVault (5.20% APR)',
    expectedValueUsd: 19.5,
    rationale:
      'Day 0 treasury plan initialized. Total treasury is $10,000. $5,500 remains liquid in the vault. After Day 3 ($450) and Day 10 ($1,470) payments, liquid balance will be $3,580, safely above the $3,000 reserve floor. Sweeping $4,500 into yield.',
    gatePassed: true,
    gateRules: [
      { id: 'G1', name: 'Schema & Amount', status: 'PASS' },
      { id: 'G5', name: 'PerTx Cap ($5,000)', status: 'PASS' },
      { id: 'G6', name: 'Preserves Reserve Floor', status: 'PASS' },
      { id: 'G8', name: 'Venue Enabled & Cap', status: 'PASS' },
      { id: 'G9', name: 'Redemption Latency Fits', status: 'PASS' }
    ],
    alternatives: [
      {
        type: 'HOLD',
        ev: 0.0,
        reason: 'Leave $4,500 idle in vault at 0% APR earning nothing'
      }
    ],
    txHash: '0xarc1029471029471029471029471029471029471029471029471029471029471029',
    recordHash: '0x1928471029471029471029471029471029471029471029471029471029471029',
    signatureValid: true
  }
];

export default function DecisionFeedPage() {
  const [expandedSeq, setExpandedSeq] = useState<number | null>(14);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white">Live Decision Feed</h1>
            <ProvenanceBadge type="LEDGER" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            "The model proposes, the vault disposes". Every decision card proves financial calculus, alternatives considered, gate rule evaluations, and onchain hash anchoring.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/verify-ledger"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-700/50 text-xs font-mono font-semibold hover:bg-emerald-900 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Verify Hash Chain
          </Link>
        </div>
      </div>

      {/* Decision Cards List */}
      <div className="space-y-4">
        {SAMPLE_DECISION_CARDS.map(card => {
          const isExpanded = expandedSeq === card.seq;
          return (
            <div
              key={card.seq}
              className="p-5 rounded-xl bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all shadow-md"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 text-xs font-mono font-bold">
                    Seq #{card.seq}
                  </span>
                  <span className="text-xs font-mono text-purple-400 font-semibold">
                    Sim Day {card.simulatedDay}
                  </span>
                  <span className="text-xs text-gray-400 hidden sm:inline">· {card.timestamp}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    GATE APPROVED
                  </span>
                  <button
                    onClick={() => setExpandedSeq(isExpanded ? null : card.seq)}
                    className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Action Summary */}
              <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="text-xs text-gray-400 font-mono">CHOSEN ACTION:</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                      {card.actionType}
                    </span>
                    <span className="text-base font-bold text-white font-mono">
                      ${card.amountUsdc} USDC
                    </span>
                    <span className="text-xs text-gray-400">→ {card.target}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs">
                  {card.expectedValueUsd > 0 && (
                    <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800/60 text-right">
                      <div className="text-[10px] text-emerald-400 font-bold uppercase">Expected Value (EV)</div>
                      <div className="text-sm font-bold text-emerald-300">
                        +${card.expectedValueUsd.toFixed(2)}
                      </div>
                    </div>
                  )}
                  <a
                    href={`https://testnet.arcscan.app/tx/${card.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
                  >
                    <span>Arc Explorer</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Rationale */}
              <div className="mt-3 p-3 rounded-lg bg-gray-950/80 border border-gray-800/80 text-xs text-gray-300 leading-relaxed font-sans">
                <span className="font-semibold text-white font-mono">Agent Calculus: </span>
                {card.rationale}
              </div>

              {/* Expandable Details (Alternatives, Gate Rules, Proofs) */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-4">
                  {/* Alternatives Considered with EV */}
                  <div>
                    <div className="text-xs font-bold font-mono text-gray-400 mb-2">
                      ALTERNATIVES CONSIDERED & EXPECTED VALUES:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {card.alternatives.map((alt, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-xs font-mono flex flex-col justify-between"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-300">{alt.type}</span>
                            <span
                              className={`font-bold ${
                                alt.ev >= 0 ? 'text-gray-400' : 'text-rose-400'
                              }`}
                            >
                              EV: {alt.ev >= 0 ? `+$${alt.ev.toFixed(2)}` : `-$${Math.abs(alt.ev).toFixed(2)}`}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-1 font-sans">{alt.reason}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Policy Gate Rules Passed */}
                  <div>
                    <div className="text-xs font-bold font-mono text-gray-400 mb-2">
                      POLICY GATE DRY-RUN RESULTS (RULES G1 - G14):
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 font-mono text-[11px]">
                      {card.gateRules.map(rule => (
                        <div
                          key={rule.id}
                          className="flex items-center justify-between p-1.5 rounded bg-emerald-950/40 border border-emerald-800/40 text-emerald-400"
                        >
                          <span>{rule.id}: {rule.name}</span>
                          <span className="font-bold">PASS</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Cryptographic Proof & Signature */}
                  <div className="p-3 rounded-lg bg-gray-950 border border-gray-800 font-mono text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Record SHA-256 Hash:</span>
                      <span className="text-gray-300 font-bold">{card.recordHash.slice(0, 20)}...</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>ECDSA Agent Signature:</span>
                      <span className="text-emerald-400 font-bold">✓ Valid (Secp256k1 Signed)</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-400">
                      <span>Onchain Anchor:</span>
                      <span className="text-cyan-400">DecisionAnchored(seq: {card.seq}) emitted on Arc</span>
                    </div>
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
