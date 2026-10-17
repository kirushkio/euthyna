'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  LogOut,
  HelpCircle,
  X,
  ChevronRight
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import {
  readVaultState,
  type VaultOnchainState
} from '../../lib/contracts';
import { InteractiveHowItWorks } from '../../components/InteractiveHowItWorks';
import type { Address } from 'viem';

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, address, disconnect, isArcTestnet, switchToArc } = useWallet();
  const [liveVaultState, setLiveVaultState] = useState<VaultOnchainState | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [paymentExecuted, setPaymentExecuted] = useState(false);

  const vaultAddress = '0xbef6a5ba928fd377fe9add0f516effcc50e0b3f6' as Address;

  useEffect(() => {
    let isMounted = true;
    readVaultState(vaultAddress).then((state) => {
      if (isMounted) setLiveVaultState(state);
    });
    return () => {
      isMounted = false;
    };
  }, [vaultAddress]);

  const handleDisconnect = async () => {
    await disconnect();
    router.replace('/');
  };

  const formatAddr = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Top Welcome & Compact Wallet Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Treasury Overview
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time cash liquidity, policy reserve floors, and automated early discount optimization.
          </p>
        </div>

        {/* Compact Wallet & Disconnect Option */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-xs">
            <span className={`w-2 h-2 rounded-full ${isArcTestnet ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-mono text-slate-800 font-semibold">
              {address ? formatAddr(address) : 'Connected'}
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-[11px] text-slate-500">Arc #5042002</span>
          </div>

          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold shadow-2xs transition-all"
            title="Disconnect wallet and return to home page"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Disconnect</span>
          </button>
        </div>
      </div>

      {/* Network Warning if not on Arc Testnet */}
      {!isArcTestnet && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Wallet is connected to the wrong network. Switch to Arc Testnet to interact with your vault.</span>
          </div>
          <button
            onClick={switchToArc}
            className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Switch to Arc Testnet
          </button>
        </div>
      )}

      {/* Optional Interactive How-It-Works Explainer */}
      {showExplainer && (
        <div className="relative animate-in fade-in">
          <button
            onClick={() => setShowExplainer(false)}
            className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
          <InteractiveHowItWorks />
        </div>
      )}

      {/* Four Key Treasury Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Available Liquidity */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Available Liquidity</span>
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">$5,500.00 USDC</div>
          <div className="text-[11px] text-slate-400">
            55% of treasury liquid for upcoming obligations
          </div>
        </div>

        {/* Card 2: Protected Reserves */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Protected Reserves</span>
            <Shield className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">$3,000.00 USDC</div>
          <div className="text-[11px] text-teal-700 font-medium flex items-center gap-1">
            <span>Hard payroll floor enforced on-chain</span>
          </div>
        </div>

        {/* Card 3: Pending Obligations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500">
            <span>Pending Obligations</span>
            <FileText className="w-4 h-4 text-slate-600" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">$1,950.00 USDC</div>
          <div className="text-[11px] text-slate-400">
            2 vendor invoices (Figma & AWS)
          </div>
        </div>

        {/* Card 4: Recommended Actions */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-2xs space-y-1.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-medium text-blue-200">
              <span>Recommended Action</span>
              <Sparkles className="w-4 h-4 text-cyan-300" />
            </div>
            <div className="text-sm font-bold mt-1">
              {paymentExecuted ? 'Discount Captured!' : 'Capture 2% Figma Discount'}
            </div>
            <div className="text-[11px] text-blue-100 mt-0.5">
              {paymentExecuted ? 'Saved $30.00 cash' : 'Pay $1,470 today to save $30.00'}
            </div>
          </div>

          <div className="pt-2">
            {paymentExecuted ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Settled at $1,470</span>
              </span>
            ) : (
              <Link
                href="/decision-feed"
                onClick={() => setPaymentExecuted(true)}
                className="inline-flex items-center gap-1 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg backdrop-blur-xs transition-colors"
              >
                <span>Execute & Save $30</span>
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Cash Overview Chart / Visual Allocation */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-bold text-slate-900">Treasury Cash Allocation</span>
            <span className="text-slate-400 ml-2">Total Treasury: $10,000.00 USDC</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
              <span>Liquid Cash: $5,500 (55%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
              <span>Yield Vault: $4,500 (45% at 5.2% APY)</span>
            </span>
          </div>
        </div>

        {/* Allocation Bar */}
        <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex">
          <div style={{ width: '55%' }} className="h-full bg-blue-600" title="Liquid Cash: $5,500" />
          <div style={{ width: '45%' }} className="h-full bg-teal-500" title="Yield Vault: $4,500" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
          <span>$0</span>
          <span className="text-teal-700 font-semibold flex items-center gap-1">
            <Shield className="w-3 h-3 text-teal-600" />
            <span>$3,000 Payroll Reserve Floor</span>
          </span>
          <span>$10,000 USDC</span>
        </div>
      </div>

      {/* Upcoming Obligations & Recent Decisions Side-by-Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Short List of Upcoming Obligations */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-bold text-slate-900">Upcoming Obligations</h3>
            </div>
            <Link href="/intake" className="text-xs text-blue-600 hover:underline font-semibold">
              Add Invoice +
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Figma Enterprise</div>
                <div className="text-[11px] text-blue-700 mt-0.5">2% discount if paid today ($30 off)</div>
              </div>
              <div className="text-right">
                <div className="font-mono font-bold text-slate-900">$1,500.00</div>
                <div className="text-[10px] text-emerald-700 font-semibold font-mono">Pay: $1,470.00</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">AWS Cloud Hosting</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Due in 3 days (Net 30)</div>
              </div>
              <div className="text-right font-mono font-bold text-slate-800">
                $450.00
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-800">Bi-Weekly Contractor Payroll</div>
                <div className="text-[11px] text-teal-700 mt-0.5 font-medium">Covered by $3,000 reserve</div>
              </div>
              <div className="text-right font-mono font-bold text-slate-800">
                $4,000.00
              </div>
            </div>
          </div>
        </div>

        {/* Short List of Recent Decisions */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Decisions</h3>
            </div>
            <Link href="/decision-feed" className="text-xs text-blue-600 hover:underline font-semibold">
              View All →
            </Link>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Capture Figma Discount</span>
                <span className="text-emerald-700 font-mono font-bold">+$30.00 Saved</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Paid on final eligible discount day (Day 10) to maximize yield before early settlement.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Yield Sweep ($4,500 USDC)</span>
                <span className="text-purple-700 font-mono font-bold">5.20% APY</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Swept surplus cash above liquid buffer into Arc yield vault.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1">
              <div className="flex items-center justify-between font-semibold text-slate-800">
                <span>Reserve Floor Verified</span>
                <span className="text-teal-700 font-semibold font-mono">$3,000 Safe</span>
              </div>
              <p className="text-[11px] text-slate-500">
                Confirmed upcoming payroll buffer is 100% protected on Arc Testnet.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Non-Custodial Vault Contract Footer */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Onchain Vault:</span>
          <a
            href="https://testnet.arcscan.app/address/0xbef6a5ba928fd377fe9add0f516effcc50e0b3f6"
            target="_blank"
            rel="noreferrer"
            className="text-blue-600 hover:underline font-mono font-medium flex items-center gap-0.5"
          >
            <span>0xbef6a5ba928fd377fe9add0f516effcc50e0b3f6</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
        <span className="text-[11px] text-slate-400">Non-custodial smart contracts · Settled in native USDC</span>
      </div>
    </div>
  );
}
