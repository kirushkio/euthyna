'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWallet } from '../context/WalletContext';
import {
  Wallet,
  Shield,
  Zap,
  GitCommit,
  AlertTriangle,
  Loader2,
  ExternalLink,
  KeyRound,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const {
    isConnected,
    isConnecting,
    hasMetaMask,
    connectError,
    connect,
    clearConnectError,
  } = useWallet();

  // If already connected, immediately take them into the treasury dashboard
  useEffect(() => {
    if (isConnected) {
      router.replace('/dashboard');
    }
  }, [isConnected, router]);

  const handleConnectMetaMask = async () => {
    const success = await connect(false);
    if (success) {
      router.replace('/dashboard');
    }
  };

  const handleConnectDemo = async () => {
    const success = await connect(true);
    if (success) {
      router.replace('/dashboard');
    }
  };

  if (isConnected) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 text-center py-20">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-sm font-medium text-slate-300">Wallet Connected. Entering Treasury Workspace…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center py-8 px-4 animate-fade-in">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center space-y-3 mb-6">
        <div className="relative">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-white text-2xl shadow-xl transition-transform hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)',
              boxShadow: '0 0 35px rgba(139,92,246,0.35)',
            }}
          >
            E
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#101522] animate-pulse" />
        </div>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Euthyna</span>
            <span
              className="text-xs uppercase tracking-wider font-mono px-2 py-0.5 rounded-full font-bold"
              style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}
            >
              Vault
            </span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Autonomous corporate treasury & invoice orchestration on Arc Testnet.
          </p>
        </div>

        {/* Network indicator pill */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono"
          style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#34D399' }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Arc Testnet #5042002 · Settled in Native USDC</span>
        </div>
      </div>

      {/* Main Connect Wallet Card */}
      <div
        className="w-full rounded-2xl p-6 sm:p-7 space-y-5 card-interactive"
        style={{
          background: 'rgba(20,26,39,0.85)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="text-center space-y-1">
          <h2 className="text-base font-bold text-white tracking-tight">Connect Treasury Wallet</h2>
          <p className="text-xs text-slate-400">
            Connect your Web3 wallet to authorize payments, review AI recommendations, and inspect cryptographic ledgers.
          </p>
        </div>

        {/* Connection Notice / Error if any */}
        {connectError && (
          <div
            className="p-3.5 rounded-xl text-xs space-y-2 animate-fade-in"
            style={{
              background: connectError === 'METAMASK_NOT_FOUND' ? 'rgba(245,158,11,0.10)' : 'rgba(239,68,68,0.10)',
              border: `1px solid ${connectError === 'METAMASK_NOT_FOUND' ? 'rgba(245,158,11,0.25)' : 'rgba(239,68,68,0.25)'}`,
              color: connectError === 'METAMASK_NOT_FOUND' ? '#FCD34D' : '#F87171',
            }}
          >
            <div className="flex items-center justify-between font-semibold">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {connectError === 'METAMASK_NOT_FOUND' ? 'MetaMask Not Detected' : 'Connection Notice'}
              </span>
              <button onClick={clearConnectError} className="opacity-75 hover:opacity-100 text-xs">✕</button>
            </div>
            <p className="text-[11px] leading-relaxed opacity-90">
              {connectError === 'METAMASK_NOT_FOUND'
                ? 'MetaMask extension was not detected in this browser. You can install MetaMask or explore instantly with our simulated Owner demo wallet.'
                : connectError}
            </p>
            {connectError === 'METAMASK_NOT_FOUND' && (
              <div className="pt-1 flex items-center gap-2">
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 text-center rounded-lg font-bold text-[11px] flex items-center justify-center gap-1"
                  style={{ background: '#F59E0B', color: '#000' }}
                >
                  <span>Install MetaMask</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Primary Action: Connect MetaMask */}
        <div className="space-y-3">
          <button
            onClick={handleConnectMetaMask}
            disabled={isConnecting}
            className="w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
              boxShadow: '0 0 20px rgba(139,92,246,0.35)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Connecting to MetaMask…</span>
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 text-violet-200" />
                <span>Connect with MetaMask</span>
                <ArrowRight className="w-4 h-4 ml-auto text-violet-200 opacity-75" />
              </>
            )}
          </button>

          {/* Secondary Action: Demo Wallet (Simulated Owner) */}
          <button
            onClick={handleConnectDemo}
            disabled={isConnecting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:bg-white/[0.06] active:scale-[0.98]"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: '#F0F4FF',
            }}
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span>Launch Demo Mode (Owner Role)</span>
          </button>
        </div>

        {/* Security Pill Badges */}
        <div
          className="pt-4 grid grid-cols-3 gap-2 text-center"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Shield className="w-3.5 h-3.5 text-violet-400 mx-auto mb-1" />
            <div className="text-[10px] font-semibold text-slate-300">Least Privilege</div>
            <div className="text-[9px] text-slate-500">4 Enforced Roles</div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <Zap className="w-3.5 h-3.5 text-cyan-400 mx-auto mb-1" />
            <div className="text-[10px] font-semibold text-slate-300">Native USDC</div>
            <div className="text-[9px] text-slate-500">Zero Token Wrap</div>
          </div>
          <div className="p-2 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <GitCommit className="w-3.5 h-3.5 text-emerald-400 mx-auto mb-1" />
            <div className="text-[10px] font-semibold text-slate-300">Hashchain</div>
            <div className="text-[9px] text-slate-500">Cryptographic Proof</div>
          </div>
        </div>
      </div>

      {/* Footer disclaimer */}
      <p className="text-[11px] text-slate-500 text-center mt-5">
        Non-custodial Web3 architecture · Private keys never leave your browser
      </p>
    </div>
  );
}
