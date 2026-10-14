'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Wallet,
  Check,
  Copy,
  ExternalLink,
  ChevronDown,
  ShieldAlert,
  AlertTriangle,
  LogOut,
  UserCheck,
  KeyRound,
  Shield,
  Bot
} from 'lucide-react';
import { useWallet, TreasuryRole } from '../context/WalletContext';

export const WalletButton: React.FC = () => {
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

  // Close dropdown on outside click
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

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const getRoleColor = (role: TreasuryRole) => {
    switch (role) {
      case 'OWNER':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'REGISTRAR':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'AGENT':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'GUARDIAN':
        return 'bg-red-500/20 text-red-300 border-red-500/40';
      default:
        return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  const getRoleIcon = (role: TreasuryRole) => {
    switch (role) {
      case 'OWNER':
        return <KeyRound className="w-3 h-3 text-amber-400" />;
      case 'REGISTRAR':
        return <UserCheck className="w-3 h-3 text-blue-400" />;
      case 'AGENT':
        return <Bot className="w-3 h-3 text-emerald-400" />;
      case 'GUARDIAN':
        return <Shield className="w-3 h-3 text-red-400" />;
      default:
        return null;
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow transition-all active:scale-95 disabled:opacity-50"
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-1.5">
        {/* Network Warning Pill if not on Arc Testnet */}
        {!isArcTestnet ? (
          <button
            onClick={switchToArc}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-red-950/80 border border-red-700/60 text-red-300 text-xs font-mono hover:bg-red-900 transition-colors"
            title="Click to switch wallet to Arc Testnet"
          >
            <AlertTriangle className="w-3 h-3 animate-pulse text-red-400" />
            <span>Switch to Arc</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded bg-gray-900 border border-gray-800 text-xs font-mono text-gray-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] text-gray-300">Arc #5042002</span>
          </div>
        )}

        {/* Main Wallet Pill with Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-mono transition-all hover:bg-gray-900/90 ${
            isArcTestnet ? 'bg-gray-950 border-gray-800 text-gray-200' : 'bg-red-950/40 border-red-800/50 text-red-200'
          }`}
        >
          {/* Active Role Indicator */}
          <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getRoleColor(activeRole)}`}>
            {getRoleIcon(activeRole)}
            <span>{activeRole}</span>
          </span>

          <span className="font-semibold">{address ? formatAddress(address) : ''}</span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-gray-950 border border-gray-800 shadow-2xl p-4 z-50 space-y-3.5 font-sans animate-in fade-in slide-in-from-top-2">
          {/* Header & Balance */}
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>Connected Account</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Arc Testnet
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-between">
              <span className="font-mono text-xs text-gray-200 font-semibold">{address ? formatAddress(address) : ''}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                  title="Copy full address"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                {address && (
                  <a
                    href={`https://testnet.arcscan.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
                    title="View on ArcScan"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* USDC Balance */}
          <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 flex items-center justify-between">
            <span className="text-xs text-blue-300 font-medium">Arc USDC Balance</span>
            <span className="font-mono text-sm font-bold text-white">${usdcBalance}</span>
          </div>

          {/* Judge Mode Role Switcher */}
          <div className="pt-2 border-t border-gray-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <span className="font-semibold text-gray-300">Simulate Role (Judge Mode)</span>
              <span className="text-[10px] text-blue-400 font-mono">Separation of Duties</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(['OWNER', 'REGISTRAR', 'AGENT', 'GUARDIAN'] as TreasuryRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setDemoRole(r)}
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[11px] font-mono font-medium transition-all text-left ${
                    activeRole === r
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-gray-900 text-gray-400 hover:text-gray-200 hover:bg-gray-850 border border-gray-800'
                  }`}
                >
                  {getRoleIcon(r)}
                  <span>{r}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-500 leading-tight">
              Test onchain role access: Owner authorizes policy, Registrar inputs obligations, Agent sweeps yield, Guardian pauses vault.
            </p>
          </div>

          {/* Disconnect Action */}
          <div className="pt-2 border-t border-gray-800">
            <button
              onClick={() => {
                disconnect();
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 text-red-300 text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
