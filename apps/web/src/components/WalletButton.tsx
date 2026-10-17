'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Wallet,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  AlertTriangle,
  LogOut,
  KeyRound,
  Shield,
  Bot,
  UserCheck,
  Loader2,
} from 'lucide-react';
import { useWallet, TreasuryRole } from '../context/WalletContext';

export const WalletButton: React.FC = () => {
  const router = useRouter();
  const {
    address,
    isConnected,
    isConnecting,
    isArcTestnet,
    activeRole,
    usdcBalance,
    connect,
    disconnect,
    switchToArc,
    setDemoRole,
  } = useWallet();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopy = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  const getRoleBadge = (role: TreasuryRole) => {
    switch (role) {
      case 'OWNER':
        return { color: '#FCD34D', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', icon: <KeyRound className="w-3 h-3" /> };
      case 'REGISTRAR':
        return { color: '#67E8F9', bg: 'rgba(34,211,238,0.10)', border: 'rgba(34,211,238,0.20)', icon: <UserCheck className="w-3 h-3" /> };
      case 'AGENT':
        return { color: '#34D399', bg: 'rgba(16,185,129,0.10)', border: 'rgba(16,185,129,0.20)', icon: <Bot className="w-3 h-3" /> };
      case 'GUARDIAN':
        return { color: '#F87171', bg: 'rgba(239,68,68,0.10)', border: 'rgba(239,68,68,0.20)', icon: <Shield className="w-3 h-3" /> };
      default:
        return { color: '#8B95B0', bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.10)', icon: null };
    }
  };

  const { clearConnectError, connectError } = useWallet();

  /* ── Not connected ── */
  if (!isConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => connect()}
          disabled={isConnecting}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-sm font-semibold text-white transition-all active:scale-95 disabled:opacity-50"
          style={{ background: '#8B5CF6' }}
          onMouseEnter={e => { if (!isConnecting) (e.currentTarget as HTMLElement).style.background = '#7C3AED'; }}
          onMouseLeave={e => { if (!isConnecting) (e.currentTarget as HTMLElement).style.background = '#8B5CF6'; }}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span className="text-xs">Connecting…</span>
            </>
          ) : (
            <>
              <Wallet className="w-3.5 h-3.5" />
              <span className="text-xs">Connect Wallet</span>
            </>
          )}
        </button>

        {connectError && (
          <div
            className="absolute right-0 mt-2 w-72 rounded-2xl p-4 z-50 text-xs space-y-2.5 animate-fade-in"
            style={{
              background: '#141A27',
              border: '1px solid rgba(245,158,11,0.3)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {connectError === 'METAMASK_NOT_FOUND' ? (
              <>
                <div className="flex items-center justify-between font-bold text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    MetaMask Not Found
                  </span>
                  <button onClick={clearConnectError} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: '#8B95B0' }}>
                  MetaMask extension was not detected in this browser. Install MetaMask to connect your real wallet, or use a simulated demo wallet.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <a
                    href="https://metamask.io/download/"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-1.5 text-center rounded-xl font-semibold text-xs transition-all"
                    style={{ background: '#F59E0B', color: '#000' }}
                  >
                    Install MetaMask
                  </a>
                  <button
                    onClick={() => connect(true)}
                    className="flex-1 py-1.5 rounded-xl font-semibold text-xs transition-colors"
                    style={{ background: 'rgba(255,255,255,0.06)', color: '#F0F4FF', border: '1px solid rgba(255,255,255,0.12)' }}
                  >
                    Demo Wallet
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between font-bold text-rose-400">
                  <span className="flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Connection Notice
                  </span>
                  <button onClick={clearConnectError} className="text-slate-400 hover:text-white text-xs">✕</button>
                </div>
                <p className="text-[11px] leading-relaxed" style={{ color: '#8B95B0' }}>
                  {connectError}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  const roleMeta = getRoleBadge(activeRole);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">

        {/* Wrong network warning */}
        {!isArcTestnet && (
          <button
            onClick={switchToArc}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all"
            style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}
            title="Click to switch wallet to Arc Testnet"
          >
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
            <span>Switch to Arc</span>
          </button>
        )}

        {/* Connected wallet pill */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.10)',
            color: '#F0F4FF',
          }}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-semibold">{address ? formatAddress(address) : ''}</span>
          {/* Role badge */}
          <span
            className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
            style={{ background: roleMeta.bg, color: roleMeta.color, border: `1px solid ${roleMeta.border}` }}
          >
            {roleMeta.icon}
            {activeRole}
          </span>
          <ChevronDown
            className="w-3.5 h-3.5 transition-transform"
            style={{ color: '#4A5568', transform: isOpen ? 'rotate(180deg)' : 'none' }}
          />
        </button>
      </div>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-76 rounded-2xl p-4 z-50 space-y-3 animate-fade-in"
          style={{
            background: '#141A27',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            minWidth: '280px',
          }}
        >
          {/* Header */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2" style={{ color: '#4A5568' }}>
              <span>Connected Account</span>
              {isArcTestnet ? (
                <span className="flex items-center gap-1 text-[11px]" style={{ color: '#34D399' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Arc Testnet
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px]" style={{ color: '#FCD34D' }}>
                  <AlertTriangle className="w-3 h-3" />
                  Wrong Network
                </span>
              )}
            </div>

            {/* Address row */}
            <div
              className="p-2.5 rounded-xl flex items-center justify-between"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="font-mono text-xs font-semibold" style={{ color: '#F0F4FF' }}>
                {address || ''}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded transition-colors"
                  style={{ color: '#4A5568' }}
                  title="Copy full address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {address && (
                  <a
                    href={`https://explorer.testnet.arc.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded transition-colors"
                    style={{ color: '#4A5568' }}
                    title="View on Arc Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* USDC balance */}
          <div
            className="p-2.5 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}
          >
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#A78BFA' }}>
                Wallet Balance
              </div>
              <div className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>
                {usdcBalance} USDC
              </div>
            </div>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.06)', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              Native Gas
            </span>
          </div>

          {/* Demo Role Switcher */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <div className="text-[11px] font-medium mb-2" style={{ color: '#4A5568' }}>
              Simulate Role (Demo Mode):
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(['OWNER', 'REGISTRAR', 'AGENT', 'GUARDIAN'] as TreasuryRole[]).map(r => {
                const meta = getRoleBadge(r);
                const isActive = activeRole === r;
                const roleDesc: Record<TreasuryRole, string> = {
                  OWNER: 'Governance & Limits',
                  REGISTRAR: 'Invoice Intake',
                  AGENT: 'AI Execution',
                  GUARDIAN: 'Emergency Freeze',
                  VISITOR: 'Observer Access',
                };
                return (
                  <button
                    key={r}
                    onClick={() => { setDemoRole(r); setIsOpen(false); }}
                    className="px-2.5 py-1.5 rounded-lg text-left transition-all"
                    style={
                      isActive
                        ? { background: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }
                        : { background: 'rgba(255,255,255,0.04)', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.08)' }
                    }
                    title={roleDesc[r]}
                  >
                    <div className="flex items-center gap-1 font-bold text-[11px]">
                      {meta.icon}
                      <span>{r}</span>
                    </div>
                    <div className="text-[9px] opacity-75 mt-0.5 truncate">
                      {roleDesc[r]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disconnect */}
          <div className="flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
            <span className="text-[11px]" style={{ color: '#4A5568' }}>MetaMask Session</span>
            <button
              onClick={async () => {
                setIsOpen(false);
                await disconnect();
                router.replace('/');
              }}
              className="flex items-center gap-1 text-xs font-medium transition-colors"
              style={{ color: '#F87171' }}
            >
              <LogOut className="w-3 h-3" />
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
