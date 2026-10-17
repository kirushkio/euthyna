'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  ArrowRight,
  Shield,
  TrendingUp,
  GitCommit,
  AlertCircle,
  ExternalLink,
  Loader2,
  AlertTriangle,
  LogOut,
  Sparkles,
  Zap,
  Lock,
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';

export default function HomePage() {
  const router = useRouter();
  const {
    isConnected,
    isConnecting,
    isArcTestnet,
    address,
    connect,
    disconnect,
    switchToArc,
    connectError,
    clearConnectError,
  } = useWallet();

  const handleConnect = async () => {
    clearConnectError();
    const success = await connect();
    if (success && isArcTestnet) {
      router.push('/dashboard');
    }
  };

  const formatAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#080B12', color: '#F0F4FF' }}
    >
      {/* ── Header ── */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'rgba(8,11,18,0.85)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-lg"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)' }}
            >
              E
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight" style={{ color: '#F0F4FF' }}>Euthyna</div>
              <div className="text-[10px] font-mono" style={{ color: '#4A5568' }}>Treasury · Arc Testnet</div>
            </div>
          </Link>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Network badge */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono"
              style={{
                background: isConnected && isArcTestnet
                  ? 'rgba(16,185,129,0.08)'
                  : 'rgba(255,255,255,0.04)',
                border: isConnected && isArcTestnet
                  ? '1px solid rgba(16,185,129,0.20)'
                  : '1px solid rgba(255,255,255,0.08)',
                color: isConnected && isArcTestnet ? '#34D399' : '#4A5568',
              }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isConnected && isArcTestnet ? '#10B981' : '#374151' }}
              />
              <span>Arc Testnet #5042002</span>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
                  style={{ background: '#8B5CF6' }}
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={disconnect}
                  title="Disconnect Wallet"
                  className="p-1.5 rounded-xl transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#8B95B0' }}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all disabled:opacity-50"
                style={{ background: '#8B5CF6' }}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting…</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Connect Wallet</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Hero ── */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-20 flex flex-col items-center text-center">

        {/* Tagline pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-8"
          style={{
            background: 'rgba(139,92,246,0.12)',
            border: '1px solid rgba(139,92,246,0.25)',
            color: '#A78BFA',
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligent Treasury. Protected Decisions.</span>
        </div>

        {/* Heading */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.10] max-w-3xl"
          style={{ color: '#F0F4FF' }}
        >
          AI proposes.{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #A78BFA 0%, #22D3EE 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Policy validates.
          </span>
          {' '}Smart contracts enforce.
        </h1>

        <p
          className="mt-6 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed"
          style={{ color: '#8B95B0' }}
        >
          Euthyna helps businesses capture early-payment discounts, keep idle cash earning yield,
          and enforce on-chain reserve floors to protect payroll — with every decision cryptographically proven.
        </p>

        {/* CTA area */}
        <div className="mt-10 flex flex-col items-center gap-3 w-full max-w-sm">
          {isConnected ? (
            <div
              className="w-full p-4 rounded-2xl space-y-3"
              style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-between text-xs">
                <span style={{ color: '#4A5568' }}>Connected Wallet</span>
                <span className="font-mono font-bold" style={{ color: '#F0F4FF' }}>
                  {address ? formatAddr(address) : ''}
                </span>
              </div>

              {!isArcTestnet ? (
                <button
                  onClick={switchToArc}
                  className="w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  style={{ background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Switch to Arc Testnet (#5042002)</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-1.5 transition-all"
                    style={{ background: '#8B5CF6' }}
                  >
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={disconnect}
                    className="px-3 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B95B0' }}
                  >
                    Disconnect
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2.5 disabled:opacity-50 transition-all active:scale-95"
              style={{ background: '#8B5CF6', boxShadow: '0 4px 24px rgba(139,92,246,0.30)' }}
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting MetaMask…</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect MetaMask</span>
                </>
              )}
            </button>
          )}

          {/* Error banner */}
          {connectError === 'METAMASK_NOT_FOUND' ? (
            <div
              className="p-4 rounded-2xl text-xs space-y-2 text-left w-full animate-in fade-in"
              style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}
            >
              <div className="flex items-center gap-1.5 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>MetaMask Not Detected</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: '#FDE68A' }}>
                We couldn't detect the MetaMask browser extension. Install MetaMask to connect your real wallet, or test with the Simulated Demo Wallet.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl font-semibold text-xs flex items-center gap-1 transition-all"
                  style={{ background: '#F59E0B', color: '#000' }}
                >
                  <span>Install MetaMask</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  onClick={async () => {
                    const ok = await connect(true);
                    if (ok) router.push('/dashboard');
                  }}
                  className="px-3 py-1.5 rounded-xl font-semibold text-xs transition-colors"
                  style={{ background: 'rgba(255,255,255,0.06)', color: '#F0F4FF', border: '1px solid rgba(255,255,255,0.12)' }}
                >
                  Use Demo Wallet
                </button>
              </div>
            </div>
          ) : connectError ? (
            <div
              className="p-3 rounded-xl text-xs flex items-center gap-2 text-left w-full"
              style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.20)', color: '#F87171' }}
            >
              <AlertCircle className="w-4 h-4 shrink-0" style={{ color: '#EF4444' }} />
              <span>{connectError}</span>
            </div>
          ) : null}

          <span className="text-[11px]" style={{ color: '#374151' }}>
            Non-custodial · Arc Testnet · Native USDC
          </span>
        </div>

        {/* Feature Cards */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 text-left w-full">
          {/* Feature 1 */}
          <div
            className="p-6 rounded-2xl space-y-3 transition-all"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.20)' }}
            >
              <TrendingUp className="w-4 h-4" style={{ color: '#A78BFA' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Intelligent Cash Decisions</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
              Captures up to 2% discounts on vendor bills (37.2% annualised return) and keeps cash earning 5.2% yield until optimal pay dates.
            </p>
          </div>

          {/* Feature 2 */}
          <div
            className="p-6 rounded-2xl space-y-3 transition-all"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(34,211,238,0.10)', border: '1px solid rgba(34,211,238,0.15)' }}
            >
              <Shield className="w-4 h-4" style={{ color: '#67E8F9' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Policy-Enforced Payments</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
              Mathematical smart contract rules physically block payments that would breach your protected payroll reserve floor.
            </p>
          </div>

          {/* Feature 3 */}
          <div
            className="p-6 rounded-2xl space-y-3 transition-all"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.10)', border: '1px solid rgba(16,185,129,0.15)' }}
            >
              <GitCommit className="w-4 h-4" style={{ color: '#34D399' }} />
            </div>
            <h3 className="text-sm font-bold" style={{ color: '#F0F4FF' }}>Verifiable Audit Trail</h3>
            <p className="text-xs leading-relaxed" style={{ color: '#4A5568' }}>
              Every invoice approval, timing calculus, and transaction hash is cryptographically anchored to Arc Testnet blocks.
            </p>
          </div>
        </div>

        {/* Principle banner */}
        <div
          className="mt-12 w-full p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(34,211,238,0.08) 100%)', border: '1px solid rgba(139,92,246,0.20)' }}
        >
          <div className="text-left">
            <div className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#A78BFA' }}>Core Principle</div>
            <div className="text-sm font-bold" style={{ color: '#F0F4FF' }}>
              "AI proposes. Policy validates. Smart contracts enforce."
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#4A5568' }}>
              <Zap className="w-3.5 h-3.5" style={{ color: '#22D3EE' }} />
              Gas Sponsored
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: '#4A5568' }}>
              <Lock className="w-3.5 h-3.5" style={{ color: '#34D399' }} />
              Non-Custodial
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer
        className="py-6 text-xs"
        style={{ background: '#101522', borderTop: '1px solid rgba(255,255,255,0.06)', color: '#4A5568' }}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded flex items-center justify-center font-bold text-white text-xs"
              style={{ background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)' }}
            >
              E
            </div>
            <span style={{ color: '#8B95B0' }}>Euthyna Treasury</span>
            <span>·</span>
            <span>Intelligent Treasury. Protected Decisions.</span>
          </div>

          <div className="text-[11px] flex items-center gap-2" style={{ color: '#374151' }}>
            <span>Arc Testnet #5042002</span>
            <span>·</span>
            <a
              href="https://explorer.testnet.arc.io/address/0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-0.5 transition-colors"
              style={{ color: '#8B5CF6' }}
            >
              <span>Verified Vault</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
