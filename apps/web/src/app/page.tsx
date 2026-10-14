'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Wallet,
  TrendingUp,
  Shield,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCw
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';

const PILOT_BUSINESSES = [
  {
    id: 'biz-studio-a',
    name: 'Studio A (Creative Agency)',
    vault: '0x3A1F4B8C2D7E90A1B2C3D4E5F60718293A4B5C6D',
    liquid: 5500.0,
    reserveFloor: 3000.0,
    venueDeployed: 4500.0,
    bestApr: '5.20%',
    simulatedDay: 10,
    dailySpent: 1470.0,
    dailyCap: 8000.0,
    perTxCap: 5000.0
  },
  {
    id: 'biz-dev-guild',
    name: 'Dev Guild (Engineering Collective)',
    vault: '0x4B2C5D9E3F8A01B2C3D4E5F60718293A4B5C6D7E',
    liquid: 6200.0,
    reserveFloor: 4000.0,
    venueDeployed: 3800.0,
    bestApr: '4.50%',
    simulatedDay: 8,
    dailySpent: 0.0,
    dailyCap: 10000.0,
    perTxCap: 5000.0
  },
  {
    id: 'biz-saas-co',
    name: 'SaaS Metrics Co (B2B Software)',
    vault: '0x5C3D6E0F4A9B12C3D4E5F60718293A4B5C6D7E8F',
    liquid: 4800.0,
    reserveFloor: 2500.0,
    venueDeployed: 5200.0,
    bestApr: '5.20%',
    simulatedDay: 12,
    dailySpent: 450.0,
    dailyCap: 8000.0,
    perTxCap: 4000.0
  },
  {
    id: 'biz-freelance-hub',
    name: 'Freelance Hub (Contractor Collective)',
    vault: '0x6D4E7F1A5B0C23D4E5F60718293A4B5C6D7E8F90',
    liquid: 3100.0,
    reserveFloor: 2000.0,
    venueDeployed: 2900.0,
    bestApr: '4.50%',
    simulatedDay: 5,
    dailySpent: 0.0,
    dailyCap: 6000.0,
    perTxCap: 2500.0
  },
  {
    id: 'biz-design-studio',
    name: 'Design Studio X (Product & Brand)',
    vault: '0x7E5F8A2B6C1D34E5F60718293A4B5C6D7E8F90A1',
    liquid: 4100.0,
    reserveFloor: 2500.0,
    venueDeployed: 3900.0,
    bestApr: '5.20%',
    simulatedDay: 7,
    dailySpent: 0.0,
    dailyCap: 6000.0,
    perTxCap: 3000.0
  }
];

const SAMPLE_OBLIGATIONS = [
  {
    id: '0xob-aws-01',
    vendor: 'AWS Cloud Services',
    amount: 450.0,
    dueDay: 3,
    status: 'PAID',
    terms: 'Net 15 (No discount)',
    kind: 'DISCRETIONARY',
    paidDay: 3
  },
  {
    id: '0xob-figma-02',
    vendor: 'Figma Enterprise',
    amount: 1500.0,
    discountAmount: 1470.0,
    dueDay: 30,
    discountDeadline: 10,
    status: 'DISCOUNT_CAPTURED',
    terms: '2/10 Net 30 (Saved $30.00)',
    kind: 'DISCRETIONARY',
    paidDay: 10
  },
  {
    id: '0xob-payroll-03',
    vendor: 'Bi-Weekly Contractor Payroll',
    amount: 4000.0,
    dueDay: 14,
    status: 'SCHEDULED',
    terms: 'Mandatory',
    kind: 'MANDATORY'
  },
  {
    id: '0xob-linear-04',
    vendor: 'Linear Workspaces',
    amount: 320.0,
    dueDay: 18,
    status: 'PENDING',
    terms: '1/10 Net 30',
    kind: 'DISCRETIONARY'
  }
];

export default function OverviewPage() {
  const [selectedBizIndex, setSelectedBizIndex] = useState(0);
  const biz = PILOT_BUSINESSES[selectedBizIndex];
  const totalTreasury = biz.liquid + biz.venueDeployed;
  const liquidPercent = ((biz.liquid / totalTreasury) * 100).toFixed(1);
  const venuePercent = ((biz.venueDeployed / totalTreasury) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Banner / Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800">
        <div>
          <div className="text-xs text-gray-400 font-mono flex items-center gap-2">
            SELECT PILOT BUSINESS VAULT:
            <ProvenanceBadge type="ONCHAIN" />
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {PILOT_BUSINESSES.map((b, i) => (
              <button
                key={b.id}
                onClick={() => setSelectedBizIndex(i)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  selectedBizIndex === i
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {b.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/decision-feed"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            View Decision Feed
          </Link>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Treasury */}
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Total Treasury</span>
            <ProvenanceBadge type="ONCHAIN" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-white tracking-tight">
              ${totalTreasury.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <span>Settled in USDC on Arc</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 text-[11px] font-mono text-blue-400 truncate">
            Vault: {biz.vault.slice(0, 10)}...{biz.vault.slice(-8)}
          </div>
        </div>

        {/* Liquid vs Reserve */}
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Liquid USDC Balance</span>
            <ProvenanceBadge type="ONCHAIN" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              ${biz.liquid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <span>{liquidPercent}% liquid in vault</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Reserve Floor:</span>
            <span className="text-amber-400 font-bold">${biz.reserveFloor.toFixed(2)}</span>
          </div>
        </div>

        {/* In-Venue Yield */}
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Deployed in Yield</span>
            <ProvenanceBadge type="SIMULATED" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              ${biz.venueDeployed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
              <span>{venuePercent}% earning {biz.bestApr} APR</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Venue:</span>
            <span className="text-cyan-300">SimYield & Morpho</span>
          </div>
        </div>

        {/* Day & Policy Caps */}
        <div className="p-4 rounded-xl bg-gray-900 border border-gray-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400 font-medium">Policy Caps</span>
            <ProvenanceBadge type="ONCHAIN" />
          </div>
          <div className="mt-2">
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="text-gray-400">Daily Cap:</span>
              <span className="text-white">${biz.dailyCap.toFixed(2)}</span>
            </div>
            <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-blue-500 h-full rounded-full"
                style={{ width: `${(biz.dailySpent / biz.dailyCap) * 100}%` }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-[11px] font-mono mt-1 text-gray-400">
              <span>Spent: ${biz.dailySpent.toFixed(2)}</span>
              <span>Per-Tx: ${biz.perTxCap.toFixed(2)}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400">Simulated Clock:</span>
            <span className="text-purple-400 font-bold">Day {biz.simulatedDay}</span>
          </div>
        </div>
      </div>

      {/* Visual Treasury Split Bar */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex items-center justify-between text-xs mb-2 font-mono">
          <span className="text-gray-300 font-bold">Capital Allocation Composition</span>
          <span className="text-gray-400">
            Liquid: ${biz.liquid.toFixed(2)} | In-Venue: ${biz.venueDeployed.toFixed(2)}
          </span>
        </div>
        <div className="h-4 w-full bg-gray-800 rounded-full overflow-hidden flex">
          <div
            className="bg-emerald-500 h-full transition-all duration-500"
            style={{ width: `${liquidPercent}%` }}
            title={`Liquid: $${biz.liquid.toFixed(2)}`}
          ></div>
          <div
            className="bg-cyan-500 h-full transition-all duration-500"
            style={{ width: `${venuePercent}%` }}
            title={`Yield: $${biz.venueDeployed.toFixed(2)}`}
          ></div>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono mt-2 text-gray-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
            <span>Liquid in Vault (Ready for payroll & discounts)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500"></span>
            <span>Deployed in Yield Venue (Accruing ~5.20% APR)</span>
          </div>
        </div>
      </div>

      {/* Upcoming Obligations Schedule */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Upcoming Obligations & Cash Flow Timeline</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Physical vault enforces exact payment amounts, receipt attestations, and reserve safety.
            </p>
          </div>
          <ProvenanceBadge type="ONCHAIN" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-2.5 px-3">Obligation ID</th>
                <th className="py-2.5 px-3">Payee / Vendor</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3">Terms & Logic</th>
                <th className="py-2.5 px-3">Due Day</th>
                <th className="py-2.5 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/60">
              {SAMPLE_OBLIGATIONS.map(ob => (
                <tr key={ob.id} className="hover:bg-gray-800/40 transition-colors">
                  <td className="py-3 px-3 text-gray-300">{ob.id}</td>
                  <td className="py-3 px-3 font-semibold text-white">{ob.vendor}</td>
                  <td className="py-3 px-3 font-bold text-gray-200">${ob.amount.toFixed(2)}</td>
                  <td className="py-3 px-3 text-gray-400">{ob.terms}</td>
                  <td className="py-3 px-3 text-purple-400 font-bold">Day {ob.dueDay}</td>
                  <td className="py-3 px-3">
                    {ob.status === 'PAID' && (
                      <span className="px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
                        Paid on Day {ob.paidDay}
                      </span>
                    )}
                    {ob.status === 'DISCOUNT_CAPTURED' && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                        Discount Captured ($1,470.00)
                      </span>
                    )}
                    {ob.status === 'SCHEDULED' && (
                      <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-700/50">
                        Scheduled (Day {ob.dueDay})
                      </span>
                    )}
                    {ob.status === 'PENDING' && (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-700/50">
                        Pending Evaluation
                      </span>
                    )}
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
