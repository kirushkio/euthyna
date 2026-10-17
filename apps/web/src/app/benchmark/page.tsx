'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Copy,
  Check,
  Info,
  ShieldCheck,
  Layers,
  ArrowUpRight
} from 'lucide-react';

const BENCHMARK_METRICS = [
  {
    strategy: 'B0 (Hold)',
    badge: 'Baseline 0',
    description: 'Keep 100% liquid at 0% APR in vault, pay all invoices on due date',
    meanNevBps: -3,
    medianNevBps: 0,
    discountCapture: '0.0%',
    meanYield: '$0.00',
    mandatoryMisses: 13,
    color: 'slate'
  },
  {
    strategy: 'B1 (Fixed Rule Baseline)',
    badge: 'Baseline 1',
    description: 'Sweep surplus into yield daily, redeem on breach, pay on due date',
    meanNevBps: -7,
    medianNevBps: -10,
    discountCapture: '0.0%',
    meanYield: '$37.79',
    mandatoryMisses: 179,
    color: 'amber'
  },
  {
    strategy: 'E0 (Euthyna Planner)',
    badge: 'Euthyna (Proposed)',
    description: 'Deterministic planner + policy gate: captures discounts on final day, maintains safety buffer',
    meanNevBps: 58,
    medianNevBps: 57,
    discountCapture: '74.8%',
    meanYield: '$6.42',
    mandatoryMisses: 5,
    color: 'blue'
  }
];

export default function BenchmarkPage() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText('pnpm bench --seeds 200');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Reproducible Benchmark Suite (200 Seeds)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Empirical simulation across 200 independent business treasury seeds comparing passive holding, naive yield sweeping, and Euthyna's policy-gated planning.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-mono font-medium transition-colors shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>pnpm bench --seeds 200</span>
          </button>
        </div>
      </div>

      {/* 3 Strategy Highlight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {BENCHMARK_METRICS.map((item) => {
          const isEuthyna = item.strategy.startsWith('E0');

          return (
            <div
              key={item.strategy}
              className={`p-6 rounded-xl bg-white border shadow-subtle flex flex-col justify-between space-y-4 ${
                isEuthyna ? 'border-blue-300 ring-1 ring-blue-300/50' : 'border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border uppercase ${
                      isEuthyna
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {item.badge}
                  </span>
                  {isEuthyna && (
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Best Performance
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 mt-2">{item.strategy}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Net EV (bps)</div>
                  <div
                    className={`text-lg font-bold font-mono mt-0.5 ${
                      item.meanNevBps > 0 ? 'text-blue-600' : 'text-slate-600'
                    }`}
                  >
                    {item.meanNevBps > 0 ? `+${item.meanNevBps} bps` : `${item.meanNevBps} bps`}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Discount Captured</div>
                  <div className="text-lg font-bold font-mono text-slate-900 mt-0.5">
                    {item.discountCapture}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Payroll Misses</div>
                  <div
                    className={`text-sm font-bold font-mono mt-0.5 ${
                      item.mandatoryMisses > 10 ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {item.mandatoryMisses} Misses
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Yield Earned</div>
                  <div className="text-sm font-bold font-mono text-slate-800 mt-0.5">
                    {item.meanYield}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparative Analysis Table */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Comparative Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Treasury Strategy</th>
                <th className="py-3 px-4">Mean Net EV</th>
                <th className="py-3 px-4">Median Net EV</th>
                <th className="py-3 px-4">Early Discount Capture</th>
                <th className="py-3 px-4">Mandatory Payroll Misses</th>
                <th className="py-3 px-4">Shortfall Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-900">B0 (Passive Hold)</td>
                <td className="py-3 px-4 text-slate-600">-3 bps</td>
                <td className="py-3 px-4">0 bps</td>
                <td className="py-3 px-4">0.0%</td>
                <td className="py-3 px-4 text-amber-700">13</td>
                <td className="py-3 px-4 text-emerald-700">0</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-sans font-medium text-slate-900">B1 (Naive Yield Sweep)</td>
                <td className="py-3 px-4 text-rose-600">-7 bps</td>
                <td className="py-3 px-4">-10 bps</td>
                <td className="py-3 px-4">0.0%</td>
                <td className="py-3 px-4 text-rose-600 font-bold">179 (Dangerous)</td>
                <td className="py-3 px-4 text-emerald-700">0</td>
              </tr>
              <tr className="bg-blue-50/50 font-bold text-blue-900">
                <td className="py-3 px-4 font-sans text-blue-950 flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                  <span>E0 (Euthyna Planner)</span>
                </td>
                <td className="py-3 px-4 text-blue-700">+58 bps</td>
                <td className="py-3 px-4 text-blue-700">+57 bps</td>
                <td className="py-3 px-4 text-blue-700">74.8%</td>
                <td className="py-3 px-4 text-emerald-700 font-bold">5 (Safest)</td>
                <td className="py-3 px-4 text-emerald-700">0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
