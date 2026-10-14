'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldCheck, Play, ArrowRight, Activity, Terminal } from 'lucide-react';

export const JudgeModeBanner: React.FC = () => {
  const pathname = usePathname();

  const clickPath = [
    { name: '1. Overview', href: '/' },
    { name: '2. Decision Feed', href: '/decision-feed' },
    { name: '3. Intake Queue', href: '/intake' },
    { name: '4. Attack Lab', href: '/attack-lab' },
    { name: '5. Verify Ledger', href: '/verify-ledger' },
    { name: '6. Benchmark', href: '/benchmark' },
    { name: '7. Traction', href: '/traction' },
    { name: '8. Ask Treasurer', href: '/ask-treasurer' }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-950/90 via-slate-900 to-indigo-950/90 border-b border-blue-500/30 px-4 py-2.5 sticky top-0 z-50 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Judge Mode status indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            JUDGE MODE ACTIVE
          </div>
          <span className="text-xs text-gray-300 hidden sm:inline">
            Tameion Hackathon (Canteen x Circle) · Arc Testnet <span className="font-mono text-blue-300">#5042002</span>
          </span>
        </div>

        {/* Middle: Recommended Click Path */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-full py-1 text-xs font-mono">
          <span className="text-gray-400 text-[11px] mr-1 hidden lg:inline">Tour:</span>
          {clickPath.map((step, idx) => {
            const isActive = pathname === step.href;
            return (
              <React.Fragment key={step.href}>
                <Link
                  href={step.href}
                  className={`px-2 py-1 rounded transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-blue-600 text-white font-bold shadow-sm'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {step.name}
                </Link>
                {idx < clickPath.length - 1 && (
                  <span className="text-gray-500 text-[10px]">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Quick scenario triggers */}
        <div className="flex items-center gap-2">
          <Link
            href="/attack-lab"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold rounded bg-rose-950 text-rose-300 border border-rose-700/50 hover:bg-rose-900 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Attack Lab (10/10)
          </Link>
          <Link
            href="/verify-ledger"
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold rounded bg-emerald-950 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            Verify Chain
          </Link>
        </div>
      </div>
    </div>
  );
};
