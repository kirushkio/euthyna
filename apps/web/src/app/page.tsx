'use client';

import React, { useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
import { EuthynaLogo } from '../components/EuthynaLogo';
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between selection:bg-blue-100 selection:text-blue-900">
      {/* Clean Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <EuthynaLogo size="md" showWordmark={true} showTagline={false} />
          </Link>

          {/* Network Label & Status */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-mono text-slate-600">
              <span className={`w-2 h-2 rounded-full ${isConnected && isArcTestnet ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <span>Arc Testnet #5042002</span>
            </div>

            {isConnected ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/dashboard"
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs flex items-center gap-1 transition-all"
                >
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={disconnect}
                  title="Disconnect Wallet"
                  className="p-1.5 rounded-xl border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-slate-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-2xs transition-all disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Connecting...</span>
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

      {/* Main Hero & Action Section */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-16 flex flex-col items-center text-center">
        {/* Brand Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>Intelligent Treasury. Protected Decisions.</span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.12] max-w-3xl">
          Make Every Treasury Decision Count.
        </h1>

        {/* Short Plain-English Explanation */}
        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Euthyna helps businesses evaluate early-payment discounts, keep idle cash earning yield, and enforce on-chain reserve floors to protect payroll.
        </p>

        {/* Primary Action Area */}
        <div className="mt-8 flex flex-col items-center gap-3 w-full max-w-md">
          {isConnected ? (
            <div className="w-full p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Connected Wallet</span>
                <span className="font-mono font-bold text-slate-800">
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </span>
              </div>

              {!isArcTestnet ? (
                <button
                  onClick={switchToArc}
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>Switch to Arc Testnet (#5042002)</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <Link
                    href="/dashboard"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Enter Treasury Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={disconnect}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
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
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 disabled:opacity-50"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Connecting MetaMask...</span>
                </>
              ) : (
                <>
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </>
              )}
            </button>
          )}

          {/* Simple Error Banner if connection was rejected */}
          {connectError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 text-left animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{connectError}</span>
            </div>
          )}

          {/* Small Network Note */}
          <span className="text-[11px] text-slate-400">
            Settled on Arc Testnet in native USDC · Non-custodial smart contracts
          </span>
        </div>

        {/* Three Concise Feature Points */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full">
          {/* Feature 1 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">1. Intelligent Cash Decisions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Captures up to 2% discounts on vendor bills (37.2% annualized return) and keeps cash earning 5.2% yield until optimal pay dates.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">2. Policy-Enforced Payments</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mathematical smart contract rules physically block payments that would breach your protected payroll reserve floor.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <GitCommit className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">3. Verifiable Audit Trail</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Every invoice approval, timing calculus, and transaction hash is cryptographically anchored to Arc Testnet blocks.
            </p>
          </div>
        </div>
      </main>

      {/* Clean Compact Footer */}
      <footer className="py-6 bg-white border-t border-slate-200 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <EuthynaLogo size="sm" showWordmark={true} />
            <span className="text-slate-300">·</span>
            <span>Intelligent Treasury. Protected Decisions.</span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Arc Testnet #5042002</span>
            <span>·</span>
            <a
              href="https://explorer.testnet.arc.io/address/0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline flex items-center gap-0.5"
            >
              <span>Verified Vault (0x6ffd...ab01)</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
