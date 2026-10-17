'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wallet,
  Shield,
  Clock,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  ExternalLink,
  TrendingUp,
  FileText,
  AlertTriangle,
  XCircle,
  ChevronRight,
  Zap,
  Lock,
  Users,
  Activity,
  BarChart2,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import {
  readVaultState,
  type VaultOnchainState,
} from '../../lib/contracts';
import type { Address } from 'viem';

/* ─────────────────────────────────────────
   CSS 3D Vault Component
───────────────────────────────────────── */
function VaultVisual() {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ perspective: '800px', width: '200px', height: '200px' }}
      aria-hidden="true"
    >
      {/* Outer glow */}
      <div
        className="absolute inset-0 rounded-full blur-3xl opacity-30"
        style={{ background: 'radial-gradient(circle, #8B5CF6 0%, transparent 70%)' }}
      />

      {/* Orbit ring 1 */}
      <div
        className="absolute rounded-full vault-ring"
        style={{
          width: '170px',
          height: '170px',
          border: '1px solid rgba(139,92,246,0.30)',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Orbit ring 2 */}
      <div
        className="absolute rounded-full vault-ring-2"
        style={{
          width: '140px',
          height: '140px',
          border: '1px solid rgba(34,211,238,0.20)',
          transformStyle: 'preserve-3d',
        }}
      />

      {/* Vault body */}
      <div
        className="vault-float relative flex flex-col items-center justify-center rounded-2xl"
        style={{
          width: '90px',
          height: '90px',
          background: 'linear-gradient(145deg, #1B2236 0%, #141A27 60%, #0F1520 100%)',
          border: '1px solid rgba(139,92,246,0.35)',
          boxShadow: '0 0 40px rgba(139,92,246,0.20), 0 0 80px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.06)',
          transformStyle: 'preserve-3d',
        }}
      >
        {/* Vault door circle */}
        <div
          className="rounded-full flex items-center justify-center mb-1"
          style={{
            width: '44px',
            height: '44px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
            boxShadow: '0 0 16px rgba(139,92,246,0.40)',
          }}
        >
          <Lock className="w-5 h-5 text-white" />
        </div>
        {/* Handle bars */}
        <div className="flex gap-1 mt-1">
          <div className="w-5 h-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.50)' }} />
          <div className="w-1.5 h-0.5 rounded-full" style={{ background: 'rgba(139,92,246,0.30)' }} />
        </div>
      </div>

      {/* Floating token badges */}
      <div
        className="absolute text-[9px] font-bold font-mono px-2 py-0.5 rounded-full"
        style={{
          top: '16px', right: '12px',
          background: 'rgba(16,185,129,0.18)',
          border: '1px solid rgba(16,185,129,0.35)',
          color: '#34D399',
          boxShadow: '0 0 10px rgba(16,185,129,0.2)',
          animation: 'vaultFloat 5s ease-in-out infinite 1s',
        }}
      >
        USDC
      </div>
      <div
        className="absolute text-[9px] font-bold font-mono px-2 py-0.5 rounded-full"
        style={{
          bottom: '20px', left: '6px',
          background: 'rgba(34,211,238,0.15)',
          border: '1px solid rgba(34,211,238,0.30)',
          color: '#67E8F9',
          boxShadow: '0 0 10px rgba(34,211,238,0.2)',
          animation: 'vaultFloat 7s ease-in-out infinite 0.5s',
        }}
      >
        ARC #5042002
      </div>
      <div
        className="absolute text-[9px] font-bold font-mono px-2 py-0.5 rounded-full"
        style={{
          bottom: '12px', right: '18px',
          background: 'rgba(139,92,246,0.18)',
          border: '1px solid rgba(139,92,246,0.35)',
          color: '#C4B5FD',
          boxShadow: '0 0 10px rgba(139,92,246,0.2)',
          animation: 'vaultFloat 6s ease-in-out infinite 2s',
        }}
      >
        5.2% YIELD
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   MetricCard
───────────────────────────────────────── */
interface MetricCardProps {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  isDemo?: boolean;
}

function MetricCard({ label, value, sub, icon, iconBg, isDemo }: MetricCardProps) {
  return (
    <div
      className="p-5 rounded-2xl flex flex-col gap-2 card-interactive"
      style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: '#8B95B0' }}>{label}</span>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: iconBg }}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold font-mono" style={{ color: '#F0F4FF' }}>{value}</div>
      <div className="flex items-center justify-between">
        <span className="text-[11px]" style={{ color: '#4A5568' }}>{sub}</span>
        {isDemo && (
          <span
            className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded"
            style={{ background: 'rgba(245,158,11,0.10)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            DEMO
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   AI Recommendation Card
───────────────────────────────────────── */
type RecStatus = 'AI_PROPOSED' | 'POLICY_APPROVED' | 'SUBMITTED' | 'CONFIRMED' | 'REJECTED';
interface Recommendation {
  id: string;
  title: string;
  description: string;
  amount?: string;
  impact?: string;
  status: RecStatus;
  riskLevel: 'low' | 'medium' | 'high';
  action: 'Review' | 'Approve' | 'Reject';
}

const STATUS_CONFIG: Record<RecStatus, { label: string; color: string; bg: string; border: string }> = {
  AI_PROPOSED: { label: 'AI Proposed', color: '#A78BFA', bg: 'rgba(139,92,246,0.10)', border: 'rgba(139,92,246,0.20)' },
  POLICY_APPROVED: { label: 'Policy Approved', color: '#67E8F9', bg: 'rgba(34,211,238,0.08)', border: 'rgba(34,211,238,0.18)' },
  SUBMITTED: { label: 'Submitted', color: '#FCD34D', bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.20)' },
  CONFIRMED: { label: 'Confirmed On-Chain', color: '#34D399', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)' },
  REJECTED: { label: 'Rejected', color: '#F87171', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)' },
};

const RISK_COLORS = {
  low: '#34D399',
  medium: '#FCD34D',
  high: '#F87171',
};

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const status = STATUS_CONFIG[rec.status];
  return (
    <div
      className="p-4 rounded-xl flex flex-col gap-3 card-interactive"
      style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold" style={{ color: '#F0F4FF' }}>{rec.title}</span>
            <span
              className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}
            >
              {status.label}
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#8B95B0' }}>{rec.description}</p>
        </div>
        {rec.amount && (
          <div className="text-right shrink-0">
            <div className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>{rec.amount}</div>
            {rec.impact && (
              <div className="text-[11px] font-semibold font-mono" style={{ color: '#34D399' }}>{rec.impact}</div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[11px]" style={{ color: '#4A5568' }}>
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: RISK_COLORS[rec.riskLevel] }} />
          Risk: <span style={{ color: RISK_COLORS[rec.riskLevel] }}>{rec.riskLevel}</span>
        </div>
        <Link
          href="/approvals"
          className="flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-lg transition-all"
          style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.20)' }}
        >
          {rec.action}
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Policy Status Panel
───────────────────────────────────────── */
interface PolicyItem {
  label: string;
  status: 'ok' | 'warning' | 'breached';
  detail: string;
}
function PolicyPanel({ items }: { items: PolicyItem[] }) {
  const statusConfig = {
    ok: { dot: '#10B981', text: '#34D399', label: 'OK' },
    warning: { dot: '#F59E0B', text: '#FCD34D', label: 'AT RISK' },
    breached: { dot: '#EF4444', text: '#F87171', label: 'BREACHED' },
  };
  return (
    <div
      className="p-5 rounded-2xl card-interactive"
      style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div className="flex items-center gap-2 mb-4">
        <Shield className="w-4 h-4" style={{ color: '#A78BFA' }} />
        <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Policy Status</h3>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => {
          const cfg = statusConfig[item.status];
          return (
            <div key={i} className="flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                <span style={{ color: '#8B95B0' }} className="truncate">{item.label}</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-semibold text-[11px]" style={{ color: cfg.text }}>{cfg.label}</span>
                <div className="text-[10px]" style={{ color: '#374151' }}>{item.detail}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Main Dashboard Page
───────────────────────────────────────── */
export default function DashboardPage() {
  const { isConnected, address, isArcTestnet, switchToArc } = useWallet();
  const [liveVaultState, setLiveVaultState] = useState<VaultOnchainState | null>(null);

  const vaultAddress = (process.env.NEXT_PUBLIC_VAULT_ADDRESS || '0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01') as Address;

  useEffect(() => {
    let isMounted = true;
    readVaultState(vaultAddress)
      .then((state) => {
        if (isMounted) setLiveVaultState(state);
      })
      .catch((err) => {
        console.warn('Could not read vault state from RPC:', err);
      });
    return () => { isMounted = false; };
  }, [vaultAddress]);

  const recommendations: Recommendation[] = [
    {
      id: '1',
      title: 'Capture Figma 2% Early-Payment Discount',
      description: 'Pay $1,470 today (Day 10 of 30) instead of $1,500. Final eligible discount day — yields 37.2% annualised equivalent on working capital.',
      amount: '$1,470.00',
      impact: '+$30.00 saved',
      status: 'AI_PROPOSED',
      riskLevel: 'low',
      action: 'Review',
    },
    {
      id: '2',
      title: 'Sweep Surplus to Arc Yield Vault',
      description: 'After Figma payment, $4,030 surplus remains above liquid buffer and reserve floor. Eligible for yield vault at 5.2% APY.',
      amount: '$4,030.00',
      impact: '+$209.56/yr',
      status: 'POLICY_APPROVED',
      riskLevel: 'low',
      action: 'Approve',
    },
    {
      id: '3',
      title: 'Hold AWS Payment — Reserve Floor at Risk',
      description: 'Executing AWS $450 payment now would bring liquid cash to $3,080 — dangerously close to the $3,000 payroll reserve floor. Wait until next inflow.',
      amount: '$450.00',
      status: 'AI_PROPOSED',
      riskLevel: 'medium',
      action: 'Review',
    },
    {
      id: '4',
      title: 'Flag Unusual Duplicate Detection',
      description: 'Invoice INV-2024-441 from CloudVendor for $900 appears twice. Potential duplicate — requires human approval before processing.',
      status: 'AI_PROPOSED',
      riskLevel: 'high',
      action: 'Review',
    },
  ];

  const policyItems: PolicyItem[] = [
    { label: 'Reserve Floor ($3,000)', status: 'ok', detail: '$5,500 liquid' },
    { label: 'Vendor Allowlist', status: 'ok', detail: '12 vendors active' },
    { label: 'Duplicate Protection', status: 'warning', detail: '1 flag pending' },
    { label: 'Daily Spend Cap', status: 'ok', detail: '$0 / $5,000 used' },
    { label: 'Human Approval Gate', status: 'ok', detail: '>$2,000 required' },
  ];

  const recentActivity = [
    { type: 'confirmed', label: 'Vault Deployed', detail: 'Arc Testnet · tx 0x604f…8fd', time: '2d ago', color: '#34D399' },
    { type: 'confirmed', label: 'Reserve Floor Set', detail: '$3,000 USDC minimum enforced', time: '2d ago', color: '#34D399' },
    { type: 'ai', label: 'AI Recommendation', detail: 'Capture Figma 2% discount', time: '2h ago', color: '#A78BFA' },
    { type: 'blocked', label: 'Payment Blocked', detail: 'Reserve floor would breach', time: '1h ago', color: '#F87171' },
  ];

  return (
    <div className="space-y-6 max-w-6xl">

      {/* Network Warning */}
      {!isArcTestnet && (
        <div
          className="p-3.5 rounded-2xl text-xs flex items-center justify-between gap-3"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.20)' }}
        >
          <div className="flex items-center gap-2" style={{ color: '#FCD34D' }}>
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Wallet is on the wrong network. Switch to Arc Testnet to interact with the vault.</span>
          </div>
          <button
            onClick={switchToArc}
            className="px-3 py-1.5 rounded-xl font-semibold text-xs shrink-0 transition-all"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.25)' }}
          >
            Switch to Arc Testnet
          </button>
        </div>
      )}

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight" style={{ color: '#F0F4FF' }}>Treasury Overview</h2>
          <p className="text-xs mt-0.5" style={{ color: '#4A5568' }}>
            Real-time liquidity · AI recommendations · Policy enforcement
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Demo data badge */}
          <span
            className="text-[10px] font-semibold uppercase tracking-wide px-2 py-1 rounded-lg"
            style={{ background: 'rgba(245,158,11,0.10)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.15)' }}
          >
            Demo Data
          </span>
          <Link
            href="/intake"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.20)' }}
          >
            <FileText className="w-3.5 h-3.5" />
            Add Invoice
          </Link>
        </div>
      </div>

      {/* ── Four Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Available Treasury"
          value="$5,500"
          sub="55% of total liquid"
          icon={<Wallet className="w-3.5 h-3.5 text-violet-400" />}
          iconBg="rgba(139,92,246,0.15)"
          isDemo
        />
        <MetricCard
          label="Protected Reserve"
          value="$3,000"
          sub="Payroll floor · On-chain enforced"
          icon={<Shield className="w-3.5 h-3.5 text-cyan-400" />}
          iconBg="rgba(34,211,238,0.10)"
          isDemo
        />
        <MetricCard
          label="Pending Obligations"
          value="$1,950"
          sub="2 vendor invoices"
          icon={<FileText className="w-3.5 h-3.5 text-slate-400" />}
          iconBg="rgba(255,255,255,0.06)"
          isDemo
        />
        <MetricCard
          label="Surplus Available"
          value="$3,550"
          sub="Eligible for yield strategies"
          icon={<TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
          iconBg="rgba(16,185,129,0.12)"
          isDemo
        />
      </div>

      {/* ── Main Content: Left = AI Recs, Right = Vault + Policy ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* AI Recommendations — 2/3 width */}
        <div className="lg:col-span-2 space-y-4">
          <div
            className="p-5 rounded-2xl"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: '#A78BFA' }} />
                <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>AI Recommendations</h3>
              </div>
              <Link
                href="/decision-feed"
                className="text-xs font-medium flex items-center gap-0.5 transition-colors"
                style={{ color: '#8B95B0' }}
              >
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {recommendations.map(rec => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          </div>
        </div>

        {/* Right column: Vault + Policy */}
        <div className="space-y-5">

          {/* 3D Vault */}
          <div
            className="p-5 rounded-2xl flex flex-col items-center"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <VaultVisual />
            <div className="mt-3 text-center">
              <div className="text-xs font-bold" style={{ color: '#F0F4FF' }}>Arc USDC Vault</div>
              <div className="text-[10px] mt-1 font-mono" style={{ color: '#4A5568' }}>
                {vaultAddress.slice(0, 10)}…{vaultAddress.slice(-6)}
              </div>
              <a
                href={`https://explorer.testnet.arc.io/address/${vaultAddress}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-[11px] mt-2 transition-colors"
                style={{ color: '#8B5CF6' }}
              >
                View on Arc Explorer
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>

          {/* Policy Panel */}
          <PolicyPanel items={policyItems} />
        </div>
      </div>

      {/* ── Cash Allocation Bar ── */}
      <div
        className="p-5 rounded-2xl space-y-3"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Treasury Cash Allocation</span>
            <span className="text-xs ml-2" style={{ color: '#4A5568' }}>Total: $10,000 USDC</span>
            <span
              className="ml-2 text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
              style={{ background: 'rgba(245,158,11,0.10)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.15)' }}
            >
              Demo
            </span>
          </div>
          <div className="flex items-center gap-4 text-[11px]" style={{ color: '#4A5568' }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }} />
              Liquid: $5,500 (55%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full" style={{ background: '#22D3EE' }} />
              Yield: $4,500 (45% @ 5.2% APY)
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="w-full h-2.5 rounded-full overflow-hidden flex" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <div style={{ width: '55%', background: '#8B5CF6' }} className="h-full" title="Liquid: $5,500" />
          <div style={{ width: '45%', background: '#22D3EE' }} className="h-full" title="Yield: $4,500" />
        </div>

        <div className="flex items-center justify-between text-[11px]" style={{ color: '#4A5568' }}>
          <span>$0</span>
          <span className="flex items-center gap-1" style={{ color: '#34D399' }}>
            <Shield className="w-3 h-3" />
            $3,000 Payroll Reserve Floor
          </span>
          <span>$10,000 USDC</span>
        </div>
      </div>

      {/* ── Recent Activity + Invoice Preview ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Recent Activity */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4" style={{ color: '#22D3EE' }} />
              <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Recent Activity</h3>
            </div>
            <Link href="/verify-ledger" className="text-xs flex items-center gap-0.5" style={{ color: '#8B95B0' }}>
              Audit Trail <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-xs">
                <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate" style={{ color: '#F0F4FF' }}>{item.label}</div>
                  <div className="text-[11px] truncate" style={{ color: '#4A5568' }}>{item.detail}</div>
                </div>
                <span className="shrink-0 text-[11px]" style={{ color: '#374151' }}>{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invoice Preview */}
        <div
          className="p-5 rounded-2xl"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#A78BFA' }} />
              <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Upcoming Invoices</h3>
            </div>
            <Link href="/intake" className="text-xs flex items-center gap-0.5" style={{ color: '#8B95B0' }}>
              View All <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { vendor: 'Figma Enterprise', amount: '$1,500', due: 'Today', discount: '2% off → $1,470', discountColor: '#34D399' },
              { vendor: 'AWS Cloud Hosting', amount: '$450', due: 'In 3 days', discount: null, discountColor: undefined },
              { vendor: 'Payroll Reserve', amount: '$4,000', due: 'On-chain protected', discount: 'Reserve: $3,000', discountColor: '#67E8F9' },
            ].map((inv, i) => (
              <div
                key={i}
                className="p-3 rounded-xl flex items-center justify-between gap-2"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div>
                  <div className="font-semibold" style={{ color: '#F0F4FF' }}>{inv.vendor}</div>
                  <div className="text-[11px]" style={{ color: inv.discountColor || '#4A5568' }}>
                    {inv.discount || inv.due}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold font-mono" style={{ color: '#F0F4FF' }}>{inv.amount}</div>
                  {inv.discount && (
                    <div className="text-[10px]" style={{ color: '#4A5568' }}>{inv.due}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Onchain Vault Footer ── */}
      <div
        className="p-3.5 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
        style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span style={{ color: '#4A5568' }}>Onchain Vault:</span>
          <a
            href={`https://explorer.testnet.arc.io/address/${vaultAddress}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-0.5 font-mono font-medium transition-colors"
            style={{ color: '#8B5CF6' }}
          >
            {vaultAddress}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <span className="text-[11px]" style={{ color: '#374151' }}>
          Non-custodial · Settled in native USDC · Arc Testnet Chain #5042002
        </span>
      </div>
    </div>
  );
}
