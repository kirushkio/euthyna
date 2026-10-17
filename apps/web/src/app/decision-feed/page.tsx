'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

const DECISIONS = [
  {
    id: 'dec-1',
    title: 'Captured Early Discount: Figma Enterprise',
    vendor: 'Figma Enterprise',
    savedText: '+$30.00 Cash Saved',
    actionBadge: 'Early Discount Captured',
    actionBadgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
    actionBadgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
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
    actionBadgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
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
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Decisions & Savings Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Clear records of every automated bill payment, early discount captured, and yield rebalance.
          </p>
        </div>

        <Link
          href="/verify-ledger"
          className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 self-start sm:self-auto hover:underline"
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
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-4"
            >
              {/* Top Row: Title, Badge, Savings */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${dec.actionBadgeColor}`}>
                      {dec.actionBadge}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">· {dec.vendor}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{dec.title}</h3>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-bold text-emerald-700 font-mono">{dec.savedText}</div>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    Paid: <strong className="text-slate-800">{dec.amountPaid}</strong>
                  </div>
                </div>
              </div>

              {/* Plain English Explanation */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed">
                {dec.explanation}
              </div>

              {/* Technical Audit Dropdown */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : dec.id)}
                  className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1"
                >
                  <span>{isExpanded ? 'Hide cryptographic proof' : 'View onchain proof & policy rules'}</span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                <a
                  href={`https://explorer.testnet.arc.io/tx/${dec.technicalProof.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-medium font-mono text-[11px]"
                >
                  <span>ArcScan Receipt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Expandable Technical Box */}
              {isExpanded && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-mono text-slate-600 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Rules Enforced:</span>
                    <span className="font-semibold text-slate-800">{dec.technicalProof.rule}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-sans">Audit Hash:</span>
                    <span className="truncate max-w-xs">{dec.technicalProof.hash.slice(0, 24)}...</span>
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
