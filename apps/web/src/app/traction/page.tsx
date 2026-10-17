'use client';

import React, { useState } from 'react';
import {
  ExternalLink,
  Download,
  Check,
  BarChart3,
} from 'lucide-react';

const SAMPLE_TXS = [
  {
    type: 'PAY_OBLIGATION',
    amount: '$1,470.00',
    target: 'Figma Enterprise',
    txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    block: 2849142,
    time: '15m ago',
    status: 'Settled'
  },
  {
    type: 'PAY_OBLIGATION',
    amount: '$450.00',
    target: 'AWS Cloud Services',
    txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    block: 2849120,
    time: '42m ago',
    status: 'Settled'
  },
  {
    type: 'ALLOCATE',
    amount: '$4,500.00',
    target: 'SimYieldVault (5.20%)',
    txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    block: 2849080,
    time: '2h ago',
    status: 'Mined'
  },
  {
    type: 'REDEEM',
    amount: '$1,000.00',
    target: 'SimYieldVault (Payroll buffer)',
    txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    block: 2849010,
    time: '3h ago',
    status: 'Mined'
  },
  {
    type: 'PAY_OBLIGATION',
    amount: '$4,000.00',
    target: 'Bi-Weekly Contractor Payroll',
    txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    block: 2848980,
    time: '5h ago',
    status: 'Settled'
  },
  {
    type: 'PAY_OBLIGATION',
    amount: '$320.00',
    target: 'Linear Workspaces',
    txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    block: 2848920,
    time: '8h ago',
    status: 'Settled'
  }
];

const PILOT_BUSINESSES_DATA = [
  { name: 'Studio A (Creative Agency)', vault: '0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01', totalTreasury: '$10,000.00', floor: '$3,000.00', status: 'Live Vault' },
  { name: 'Dev Guild (Engineering Collective)', vault: '0x4B2C5D9E3F8A01B2C3D4E5F60718293A4B5C6D7E', totalTreasury: '$10,000.00', floor: '$4,000.00', status: 'Simulated' },
  { name: 'SaaS Metrics Co (B2B Software)', vault: '0x5C3D6E0F4A9B12C3D4E5F60718293A4B5C6D7E8F', totalTreasury: '$10,000.00', floor: '$2,500.00', status: 'Simulated' },
  { name: 'Freelance Hub (Contractor Collective)', vault: '0x6D4E7F1A5B0C23D4E5F60718293A4B5C6D7E8F90', totalTreasury: '$6,000.00', floor: '$2,000.00', status: 'Simulated' },
  { name: 'Design Studio X (Product & Brand)', vault: '0x7E5F8A2B6C1D34E5F60718293A4B5C6D7E8F90A1', totalTreasury: '$8,000.00', floor: '$2,500.00', status: 'Simulated' },
];

export default function TractionPage() {
  const [downloaded, setDownloaded] = useState(false);

  const handleExportCSV = () => {
    const headers = 'Type,Amount,Target,TxHash,Block,Time\n';
    const rows = SAMPLE_TXS.map(t => `${t.type},"${t.amount}","${t.target}",${t.txHash},${t.block},${t.time}`).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `euthyna-treasury-report-${Date.now()}.csv`;
    a.click();
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Bar */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold" style={{ color: '#F0F4FF' }}>
              Treasury Reports & Settled Activity
            </h2>
          </div>
          <p className="text-xs mt-1" style={{ color: '#8B95B0' }}>
            Aggregated statistics across business vaults and verified Arc Testnet settlements.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold transition-all active:scale-95"
          style={{ background: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}
        >
          {downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          <span>{downloaded ? 'Exported CSV!' : 'Export Report (CSV)'}</span>
        </button>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          className="p-5 rounded-2xl space-y-1"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs font-medium" style={{ color: '#8B95B0' }}>Pilot Businesses Managed</div>
          <div className="text-2xl font-bold font-mono" style={{ color: '#F0F4FF' }}>5 Accounts</div>
          <div className="text-[11px]" style={{ color: '#4A5568' }}>1 Live Vault on Arc Testnet</div>
        </div>

        <div
          className="p-5 rounded-2xl space-y-1"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs font-medium" style={{ color: '#8B95B0' }}>Total Settled Volume</div>
          <div className="text-2xl font-bold font-mono" style={{ color: '#F0F4FF' }}>$11,740.00 USDC</div>
          <div className="text-[11px] font-medium" style={{ color: '#34D399' }}>100% Onchain Execution</div>
        </div>

        <div
          className="p-5 rounded-2xl space-y-1"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="text-xs font-medium" style={{ color: '#8B95B0' }}>Annualized Yield Capture</div>
          <div className="text-2xl font-bold font-mono" style={{ color: '#F0F4FF' }}>5.20% APR</div>
          <div className="text-[11px] font-medium" style={{ color: '#22D3EE' }}>SimYield Venue Allocation</div>
        </div>
      </div>

      {/* Pilot Accounts Table */}
      <div
        className="p-6 rounded-2xl space-y-4"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Pilot Business Vaults</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead
              className="text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.02)', color: '#8B95B0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <tr>
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-4">Vault Address</th>
                <th className="py-3 px-4">Total Managed</th>
                <th className="py-3 px-4">Reserve Floor</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'rgba(255,255,255,0.04)', color: '#8B95B0' }}>
              {PILOT_BUSINESSES_DATA.map((b, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-sans font-medium" style={{ color: '#F0F4FF' }}>{b.name}</td>
                  <td className="py-3 px-4">
                    <a
                      href={`https://explorer.testnet.arc.io/address/${b.vault}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1 font-mono transition-colors"
                      style={{ color: '#8B5CF6' }}
                    >
                      <span>{b.vault.slice(0, 10)}...{b.vault.slice(-8)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td className="py-3 px-4 font-bold" style={{ color: '#F0F4FF' }}>{b.totalTreasury}</td>
                  <td className="py-3 px-4" style={{ color: '#67E8F9' }}>{b.floor}</td>
                  <td className="py-3 px-4">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={
                        b.status === 'Live Vault'
                          ? { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }
                          : { background: 'rgba(255,255,255,0.04)', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.08)' }
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Activity Table */}
      <div
        className="p-6 rounded-2xl space-y-4"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Recent Settled Activity Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead
              className="text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.02)', color: '#8B95B0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Counterparty / Target</th>
                <th className="py-3 px-4">Arc Block</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: 'rgba(255,255,255,0.04)', color: '#8B95B0' }}>
              {SAMPLE_TXS.map((t, i) => (
                <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-sans font-medium">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}
                    >
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold" style={{ color: '#F0F4FF' }}>{t.amount}</td>
                  <td className="py-3 px-4 font-sans" style={{ color: '#8B95B0' }}>{t.target}</td>
                  <td className="py-3 px-4" style={{ color: '#22D3EE' }}>#{t.block}</td>
                  <td className="py-3 px-4 font-sans" style={{ color: '#4A5568' }}>{t.time}</td>
                  <td className="py-3 px-4 font-sans">
                    <a
                      href={`https://explorer.testnet.arc.io/tx/${t.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline flex items-center gap-1 font-medium transition-colors"
                      style={{ color: '#8B5CF6' }}
                    >
                      <span>ArcScan</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
