'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

const DECISIONS = [
  {
    id: 'dec-1',
    title: 'Captured Early Discount: Figma Enterprise',
    vendor: 'Figma Enterprise',
    savedText: '+$30.00 Saved',
    actionBadge: 'Early Discount Captured',
    actionBadgeStyle: { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' },
    amountPaid: '$1,470.00 USDC',
    originalBill: '$1,500.00 USDC',
    explanation:
      'Figma offers a 2% discount if paid within 10 days (2/10 Net 30). By keeping cash compounding in yield until Day 10 and paying today, Euthyna captured the full $30.00 savings while keeping the $3,000 payroll reserve 100% safe.',
    technicalProof: {
      rule: 'Rule G4 (Exact Discount Calculation) & Rule G6 (Reserve Floor Preserved)',
      hash: '0x3f9821bb49a7102049e7710291938abf01948194819481948194819481948194',
      txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd'
    }
  },
  {
    id: 'dec-2',
    title: 'Settled On-Time: AWS Cloud Hosting',
    vendor: 'AWS Cloud Hosting',
    savedText: 'Zero Late Fees',
    actionBadge: 'Paid On Due Date',
    actionBadgeStyle: { background: 'rgba(34,211,238,0.10)', color: '#67E8F9', border: '1px solid rgba(34,211,238,0.20)' },
    amountPaid: '$450.00 USDC',
    originalBill: '$450.00 USDC',
    explanation:
      'AWS bills do not offer an early payment discount. Paying before the due date would lose yield interest. Euthyna waited until the exact due date to pay $450.00, satisfying the bill with zero late penalties.',
    technicalProof: {
      rule: 'Rule G2 (Unpaid Due Date) & Rule G5 (Daily Limit Respected)',
      hash: '0x8194719471947194719471947194719471947194719471947194719471947194',
      txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd'
    }
  },
  {
    id: 'dec-3',
    title: 'Yield Sweep: SimYield Vault',
    vendor: 'Yield Vault (Arc)',
    savedText: '+5.20% APY Earned',
    actionBadge: 'Yield Sweep',
    actionBadgeStyle: { background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' },
    amountPaid: '$4,500.00 USDC',
    originalBill: 'Surplus Cash',
    explanation:
      'After reserving $5,500 liquid cash to cover all upcoming invoices, the remaining $4,500 surplus cash was deposited into the yield vault to generate 5.2% interest instead of sitting idle.',
    technicalProof: {
      rule: 'Rule G8 (Venue Enabled & 50% Safe Cap Respected)',
      hash: '0x1928471029471029471029471029471029471029471029471029471029471029',
      txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd'
    }
  }
];

export default function DecisionFeedPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" style={{ color: '#A78BFA' }} />
            <h2 className="text-base font-bold" style={{ color: '#F0F4FF' }}>
              Decisions & Savings Feed
            </h2>
          </div>
          <p className="text-xs mt-0.5" style={{ color: '#8B95B0' }}>
            Autonomous ledger records of early discounts captured, reserve floor protections, and yield sweeps.
          </p>
        </div>

        <Link
          href="/verify-ledger"
          className="text-xs font-semibold flex items-center gap-1 self-start sm:self-auto transition-colors"
          style={{ color: '#8B5CF6' }}
        >
          <span>Verify Blockchain Audit Trail</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Decision Cards */}
      <div className="space-y-4">
        {DECISIONS.map((dec) => {
          const isExpanded = expandedId === dec.id;

          return (
            <div
              key={dec.id}
              className="p-6 rounded-2xl space-y-4 transition-all"
              style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Top Row: Title, Badge, Savings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={dec.actionBadgeStyle}
                    >
                      {dec.actionBadge}
                    </span>
                    <span className="text-xs font-medium" style={{ color: '#4A5568' }}>· {dec.vendor}</span>
                  </div>
                  <h3 className="text-base font-bold" style={{ color: '#F0F4FF' }}>{dec.title}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold font-mono" style={{ color: '#34D399' }}>{dec.savedText}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color: '#8B95B0' }}>
                    Paid: <strong style={{ color: '#F0F4FF' }}>{dec.amountPaid}</strong>
                  </div>
                </div>
              </div>

              {/* Plain English Explanation */}
              <div
                className="p-4 rounded-xl text-xs leading-relaxed"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', color: '#8B95B0' }}
              >
                {dec.explanation}
              </div>

              {/* Technical Audit Dropdown */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : dec.id)}
                  className="font-medium flex items-center gap-1 transition-colors"
                  style={{ color: '#8B95B0' }}
                >
                  <span>{isExpanded ? 'Hide cryptographic proof' : 'View onchain proof & policy rules'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <a
                  href={`https://explorer.testnet.arc.io/tx/${dec.technicalProof.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 font-medium font-mono text-[11px] transition-colors"
                  style={{ color: '#8B5CF6' }}
                >
                  <span>Arc Explorer Receipt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Expandable Technical Box */}
              {isExpanded && (
                <div
                  className="p-3.5 rounded-xl text-[11px] font-mono space-y-1.5 animate-in fade-in"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', color: '#8B95B0' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-sans" style={{ color: '#4A5568' }}>Rules Enforced:</span>
                    <span className="font-semibold" style={{ color: '#F0F4FF' }}>{dec.technicalProof.rule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-sans" style={{ color: '#4A5568' }}>Audit Hash:</span>
                    <span className="truncate max-w-xs" style={{ color: '#22D3EE' }}>{dec.technicalProof.hash.slice(0, 24)}...</span>
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
