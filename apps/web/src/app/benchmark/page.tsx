'use client';

import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle,
  Copy,
  Check,
  ShieldCheck,
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
    badgeStyle: { background: 'rgba(255,255,255,0.05)', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.10)' },
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
    badgeStyle: { background: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.25)' },
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
    badgeStyle: { background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.30)' },
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
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold" style={{ color: '#F0F4FF' }}>
              Deterministic Monte Carlo Benchmark (200 Seeds)
            </h2>
          </div>
          <p className="text-xs mt-1" style={{ color: '#8B95B0' }}>
            Multi-seed empirical comparison against naive baselines across working capital constraints.
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-white text-xs font-semibold transition-all active:scale-95"
          style={{ background: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied CLI Command!' : 'Run Benchmark CLI'}</span>
        </button>
      </div>

      {/* Summary Highlight */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(34,211,238,0.08) 100%)', border: '1px solid rgba(139,92,246,0.25)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0" style={{ background: '#8B5CF6' }}>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold" style={{ color: '#A78BFA' }}>Key Performance Summary</div>
            <div className="text-sm font-bold mt-0.5" style={{ color: '#F0F4FF' }}>
              Euthyna delivers +58 bps Mean NEV with 74.8% Early-Discount Capture
            </div>
          </div>
        </div>
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-mono font-semibold"
          style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}
        >
          Zero Missed Inflows
        </div>
      </div>

      {/* Benchmark Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {BENCHMARK_METRICS.map((m, idx) => (
          <div
            key={idx}
            className="p-6 rounded-2xl space-y-4 transition-all"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold" style={{ color: '#F0F4FF' }}>{m.strategy}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold" style={m.badgeStyle}>
                {m.badge}
              </span>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: '#8B95B0' }}>{m.description}</p>

            <div className="space-y-2 pt-2 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between">
                <span style={{ color: '#4A5568' }}>Mean Net Economic Value:</span>
                <span className="font-mono font-bold" style={{ color: m.meanNevBps > 0 ? '#34D399' : '#F87171' }}>
                  {m.meanNevBps > 0 ? `+${m.meanNevBps}` : m.meanNevBps} bps
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#4A5568' }}>Early Discount Capture:</span>
                <span className="font-mono font-bold" style={{ color: '#F0F4FF' }}>{m.discountCapture}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#4A5568' }}>Mean Yield Earned:</span>
                <span className="font-mono" style={{ color: '#22D3EE' }}>{m.meanYield}</span>
              </div>
              <div className="flex items-center justify-between">
                <span style={{ color: '#4A5568' }}>Breaches / Late Misses:</span>
                <span className="font-mono font-bold" style={{ color: m.mandatoryMisses <= 5 ? '#34D399' : '#F87171' }}>
                  {m.mandatoryMisses}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
