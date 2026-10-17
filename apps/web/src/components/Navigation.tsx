'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Shield,
  GitCommit,
  BarChart3,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';

import { WalletButton } from './WalletButton';

export const Navigation: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Decisions', href: '/decision-feed', icon: Sparkles },
    { name: 'Invoices', href: '/intake', icon: FileText },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle2 },
    { name: 'Security', href: '/attack-lab', icon: Shield },
    { name: 'Audit Trail', href: '/verify-ledger', icon: GitCommit },
    { name: 'Reports', href: '/traction', icon: BarChart3 },
    { name: 'Ask Euthyna', href: '/ask-treasurer', icon: MessageSquare }
  ];

  return (
    <header
      className="sticky top-0 z-40 backdrop-blur-md"
      style={{ background: 'rgba(16,21,34,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
    >
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">
        {/* Logo and Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-base shadow-md"
            style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)' }}
          >
            E
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold tracking-tight" style={{ color: '#F0F4FF' }}>Euthyna</span>
              <span
                className="text-[10px] uppercase font-mono px-1.5 py-0.2 rounded"
                style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}
              >
                Treasury
              </span>
            </div>
            <div className="text-[10px] font-mono -mt-0.5" style={{ color: '#4A5568' }}>Arc USDC Vault</div>
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
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                style={
                  isActive
                    ? { background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }
                    : { color: '#8B95B0' }
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right Info Pill & Wallet Connection */}
        <div className="flex items-center gap-2.5 text-xs font-mono">
          <div
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#34D399' }}
          >
            <span style={{ color: '#4A5568' }}>Gas:</span>
            <span>Sponsored</span>
          </div>

          <WalletButton />
        </div>
      </div>
    </header>
  );
};
