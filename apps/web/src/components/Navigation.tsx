'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Cpu,
  Inbox,
  ShieldAlert,
  GitCommit,
  BarChart3,
  Flame,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/', icon: LayoutDashboard },
    { name: 'Decision Feed', href: '/decision-feed', icon: Cpu },
    { name: 'Intake Queue', href: '/intake', icon: Inbox },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle2 },
    { name: 'Attack Lab', href: '/attack-lab', icon: ShieldAlert },
    { name: 'Verify Ledger', href: '/verify-ledger', icon: GitCommit },
    { name: 'Benchmark', href: '/benchmark', icon: BarChart3 },
    { name: 'Traction', href: '/traction', icon: Flame },
    { name: 'Ask Treasurer', href: '/ask-treasurer', icon: MessageSquare }
  ];

  return (
    <header className="border-b border-gray-800 bg-gray-950/60 backdrop-blur sticky top-[45px] z-40">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo and Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-md font-bold text-white text-base">
            E
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-white tracking-tight">Euthyna</span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                Treasury
              </span>
            </div>
            <div className="text-[10px] text-gray-400 font-mono -mt-0.5">Arc USDC Vault & Witness</div>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {links.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-900/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Info Pill */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-gray-900 border border-gray-800 text-gray-300">
            <span className="text-gray-500">Gas:</span>
            <span className="text-emerald-400">Sponsored (Circle Gas Station)</span>
          </div>
        </div>
      </div>
    </header>
  );
};
