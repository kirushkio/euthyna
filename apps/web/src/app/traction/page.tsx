'use client';

import React, { useState } from 'react';
import {
  Flame,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Download,
  Building2,
  FileSpreadsheet,
  Check
} from 'lucide-react';

const SAMPLE_TXS = [
  {
    type: 'PAY_OBLIGATION',
    amount: '$1,470.00',
    target: 'Figma Enterprise',
    txHash: '0xarc91a82fbc0017a42ef3910cbe88200f681a942004bbde0199ac718a992019',
    block: 2849142,
    time: '15m ago',
    status: 'Settled'
  },
  {
    type: 'PAY_OBLIGATION',
    amount: '$450.00',
    target: 'AWS Cloud Services',
    txHash: '0xarc71948bbcae001847192847102847102847102847102847102847102847102',
    block: 2849120,
    time: '42m ago',
    status: 'Settled'
  },
  {
    type: 'ALLOCATE',
    amount: '$4,500.00',
    target: 'SimYieldVault (5.20%)',
    txHash: '0xarc1029471029471029471029471029471029471029471029471029471029471029',
    block: 2849080,
    time: '2h ago',
    status: 'Mined'
  },
  {
    type: 'REDEEM',
    amount: '$1,000.00',
    target: 'SimYieldVault (Payroll buffer)',
    txHash: '0xarc8829471029471029471029471029471029471029471029471029471029471029',
    block: 2849010,
    time: '3h ago',
    status: 'Mined'
  },
  {
    type: 'PAY_OBLIGATION',
    amount: '$4,000.00',
    target: 'Bi-Weekly Contractor Payroll',
    txHash: '0xarc4429471029471029471029471029471029471029471029471029471029471029',
    block: 2848980,
    time: '5h ago',
    status: 'Settled'
  },
  {
    type: 'PAY_OBLIGATION',
    amount: '$320.00',
    target: 'Linear Workspaces',
    txHash: '0xarc3329471029471029471029471029471029471029471029471029471029471029',
    block: 2848920,
    time: '8h ago',
    status: 'Settled'
  }
];

const PILOT_BUSINESSES_DATA = [
  { name: 'Studio A (Creative Agency)', vault: '0xbef6a5ba928fd377fe9add0f516effcc50e0b3f6', totalTreasury: '$10,000.00', floor: '$3,000.00', status: 'Live Vault' },
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
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Treasury Reports & Settled Activity
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated treasury statistics across pilot business vaults and verified Arc Testnet settlements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            {downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            <span>{downloaded ? 'Exported CSV!' : 'Export Report (CSV)'}</span>
          </button>
        </div>
      </div>

      {/* Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="text-xs font-medium text-slate-500">Pilot Businesses Managed</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">5 Accounts</div>
          <div className="text-[11px] text-slate-400 mt-1">1 Live Vault on Arc Testnet</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="text-xs font-medium text-slate-500">Total Settled Volume</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">$11,740.00 USDC</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">100% Onchain Execution</div>
        </div>

        <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle">
          <div className="text-xs font-medium text-slate-500">Annualized Yield Capture</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1">5.20% APR</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">SimYield Venue Allocation</div>
        </div>
      </div>

      {/* Pilot Accounts Table */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Pilot Business Vaults</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Business Name</th>
                <th className="py-3 px-4">Vault Address</th>
                <th className="py-3 px-4">Total Managed</th>
                <th className="py-3 px-4">Reserve Floor</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {PILOT_BUSINESSES_DATA.map((b, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">{b.name}</td>
                  <td className="py-3 px-4 text-slate-500">
                    <a
                      href={`https://testnet.arcscan.app/address/${b.vault}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-mono"
                    >
                      <span>{b.vault.slice(0, 10)}...{b.vault.slice(-8)}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800">{b.totalTreasury}</td>
                  <td className="py-3 px-4">{b.floor}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      b.status === 'Live Vault'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
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
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Recent Settled Activity Log</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Counterparty / Target</th>
                <th className="py-3 px-4">Arc Block</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Explorer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              {SAMPLE_TXS.map((t, i) => (
                <tr key={i}>
                  <td className="py-3 px-4 font-sans font-medium text-slate-900">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {t.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{t.amount}</td>
                  <td className="py-3 px-4 font-sans text-slate-600">{t.target}</td>
                  <td className="py-3 px-4 text-purple-700">#{t.block}</td>
                  <td className="py-3 px-4 font-sans text-slate-400">{t.time}</td>
                  <td className="py-3 px-4 font-sans">
                    <a
                      href={`https://testnet.arcscan.app/tx/${t.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
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
