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
  UserCheck
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

  const getRoleBadge = (role: TreasuryRole) => {
    switch (role) {
      case 'OWNER':
        return {
          bg: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <KeyRound className="w-3 h-3 text-amber-600" />
        };
      case 'REGISTRAR':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: <UserCheck className="w-3 h-3 text-blue-600" />
        };
      case 'AGENT':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Bot className="w-3 h-3 text-emerald-600" />
        };
      case 'GUARDIAN':
        return {
          bg: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <Shield className="w-3 h-3 text-rose-600" />
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200',
          icon: null
        };
    }
  };

  if (!isConnected) {
    return (
      <button
        onClick={connect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-sm transition-all active:scale-95 disabled:opacity-50"
      >
        <Wallet className="w-3.5 h-3.5" />
        <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
      </button>
    );
  }

  const roleMeta = getRoleBadge(activeRole);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2">
        {/* Network Warning Pill if not on Arc Testnet */}
        {!isArcTestnet ? (
          <button
            onClick={switchToArc}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium hover:bg-amber-100 transition-colors shadow-sm"
            title="Click to switch wallet to Arc Testnet"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            <span>Switch to Arc</span>
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Arc #5042002</span>
          </div>
        )}

        {/* Main Wallet Pill with Dropdown Trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all shadow-2xs ${
            isArcTestnet
              ? 'bg-white border-slate-200 text-slate-800 hover:bg-slate-50'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono text-slate-800 font-semibold">
            {address ? formatAddress(address) : ''}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-4 z-50 space-y-3.5 font-sans animate-in fade-in slide-in-from-top-1 text-slate-800">
          {/* Header & Account */}
          <div>
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
              <span>Connected Account</span>
              <span className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Arc Testnet
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <span className="font-mono text-xs text-slate-800 font-semibold">
                {address ? formatAddress(address) : ''}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
                  className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                  title="Copy full address"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                {address && (
                  <a
                    href={`https://explorer.testnet.arc.io/address/${address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
                    title="View on Arc Explorer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* USDC Balance */}
          <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-blue-600 uppercase font-semibold">
                Gas / Wallet Balance
              </div>
              <div className="text-sm font-bold text-blue-950 font-mono">
                {usdcBalance} USDC
              </div>
            </div>
            <span className="text-[10px] font-medium text-blue-600 bg-white px-2 py-0.5 rounded border border-blue-200">
              Native Gas
            </span>
          </div>

          {/* Demo Role Switcher */}
          <div className="pt-1 border-t border-slate-100">
            <div className="text-[11px] text-slate-400 font-medium mb-1.5">
              Simulate Role (Demo Mode):
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {(['OWNER', 'REGISTRAR', 'AGENT', 'GUARDIAN'] as TreasuryRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => {
                    setDemoRole(r);
                    setIsOpen(false);
                  }}
                  className={`px-2 py-1.5 rounded-md text-[11px] font-medium text-left border transition-all ${
                    activeRole === r
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Disconnect Action */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">MetaMask Session</span>
            <button
              onClick={async () => {
                setIsOpen(false);
                await disconnect();
                router.replace('/');
              }}
              className="flex items-center gap-1 text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
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
