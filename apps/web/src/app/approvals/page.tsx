'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Clock, ShieldCheck } from 'lucide-react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge';

interface EscalatedItem {
  id: string;
  businessName: string;
  simulatedDay: number;
  actionType: string;
  amountUsdc: string;
  vendor: string;
  reason: string;
  agentCalculus: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

const INITIAL_APPROVALS: EscalatedItem[] = [
  {
    id: 'appr-01',
    businessName: 'Studio A (Creative Agency)',
    simulatedDay: 10,
    actionType: 'PAY_OBLIGATION',
    amountUsdc: '1,200.00',
    vendor: 'Design Agency Partner',
    reason: 'Payee address was updated 2 hours ago. Cooldown period is active.',
    agentCalculus: 'Discount of 2% ($24.00) expires today, but vendor payee address was changed. Per Rule G3, changed addresses require explicit Owner confirmation to prevent BEC phishing.',
    status: 'PENDING'
  },
  {
    id: 'appr-02',
    businessName: 'Dev Guild (Engineering Collective)',
    simulatedDay: 7,
    actionType: 'PAY_OBLIGATION',
    amountUsdc: '2,200.00',
    vendor: 'Hardware Supplier Ltd',
    reason: 'Three-way match incomplete: warehouse goods receipt not yet attested.',
    agentCalculus: 'Invoice received for physical server hardware, but warehouse attestation receipt is missing. Agent escalated with extension request draft instead of paying blind.',
    status: 'PENDING'
  }
];

export default function ApprovalsPage() {
  const [items, setItems] = useState<EscalatedItem[]>(INITIAL_APPROVALS);

  const handleDecision = (id: string, decision: 'APPROVED' | 'REJECTED') => {
    setItems(prev =>
      prev.map(item => (item.id === id ? { ...item, status: decision } : item))
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white">Owner Approvals & Escalation Queue</h1>
            <ProvenanceBadge type="ONCHAIN" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Separation of duties: The Agent key cannot approve payees, override cooldowns, or waive receipts. Only the human Owner wallet can authorize escalated proposals.
          </p>
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-4">
        {items.map(item => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-gray-900 border border-gray-800 shadow-md space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-bold">
                  {item.id}
                </span>
                <span className="text-white font-semibold">{item.businessName}</span>
                <span className="text-purple-400">· Sim Day {item.simulatedDay}</span>
              </div>

              <div>
                {item.status === 'PENDING' && (
                  <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-400 border border-amber-800 text-xs font-mono font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Awaiting Owner Signature
                  </span>
                )}
                {item.status === 'APPROVED' && (
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-mono font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Approved by Owner
                  </span>
                )}
                {item.status === 'REJECTED' && (
                  <span className="px-2.5 py-1 rounded bg-rose-950 text-rose-400 border border-rose-800 text-xs font-mono font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Rejected by Owner
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                <div className="text-gray-400">Target Vendor:</div>
                <div className="text-sm font-bold text-white mt-1">{item.vendor}</div>
              </div>
              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                <div className="text-gray-400">Escalated Action:</div>
                <div className="text-sm font-bold text-blue-400 mt-1">
                  {item.actionType} (${item.amountUsdc} USDC)
                </div>
              </div>
              <div className="p-3 rounded-lg bg-gray-950 border border-gray-800">
                <div className="text-gray-400">Trigger Reason:</div>
                <div className="text-xs font-semibold text-amber-300 mt-1">{item.reason}</div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-gray-950/80 border border-gray-800/80 text-xs text-gray-300">
              <span className="font-mono font-bold text-white">Agent Reasoning: </span>
              {item.agentCalculus}
            </div>

            {item.status === 'PENDING' && (
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleDecision(item.id, 'REJECTED')}
                  className="px-4 py-2 rounded-lg bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-mono text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject Proposal
                </button>
                <button
                  onClick={() => handleDecision(item.id, 'APPROVED')}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-colors flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Approve with Owner Wallet
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
