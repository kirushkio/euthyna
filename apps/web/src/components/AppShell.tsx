'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useWallet } from '../context/WalletContext';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  CheckCircle2,
  Shield,
  GitCommit,
  BarChart3,
  MessageSquare,
  Menu,
  X,
  LogOut,
  HelpCircle,
  AlertTriangle,
  Loader2,
  Zap,
} from 'lucide-react';
import { EuthynaLogo } from './EuthynaLogo';
import { WalletButton } from './WalletButton';
import { InteractiveHowItWorks } from './InteractiveHowItWorks';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isConnected, isConnecting, isArcTestnet, address, disconnect, switchToArc } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);

  const isPublicPage = pathname === '/' || pathname === '/login';

  useEffect(() => {
    if (!isConnecting && !isConnected && !isPublicPage) {
      router.replace('/');
    }
  }, [isConnected, isConnecting, isPublicPage, router]);

  const handleDisconnect = async () => {
    await disconnect();
    router.replace('/');
  };

  if (isPublicPage) {
    return <>{children}</>;
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: '#080B12' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white text-xl" style={{ background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)' }}>
            E
          </div>
          <div className="flex items-center gap-2 text-xs" style={{ color: '#8B95B0' }}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: '#8B5CF6' }} />
            <span>Connect wallet to access treasury…</span>
          </div>
        </div>
      </div>
    );
  }

  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Decisions', href: '/decision-feed', icon: Sparkles },
    { name: 'Invoices', href: '/intake', icon: FileText },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle2 },
    { name: 'Security', href: '/attack-lab', icon: Shield },
    { name: 'Audit Trail', href: '/verify-ledger', icon: GitCommit },
    { name: 'Reports', href: '/traction', icon: BarChart3 },
    { name: 'Ask Euthyna', href: '/ask-treasurer', icon: MessageSquare },
  ];

  const getPageTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Treasury Overview';
    if (path.startsWith('/decision-feed')) return 'AI Decisions';
    if (path.startsWith('/intake')) return 'Invoices';
    if (path.startsWith('/approvals')) return 'Approvals';
    if (path.startsWith('/attack-lab')) return 'Security Lab';
    if (path.startsWith('/verify-ledger')) return 'Audit Trail';
    if (path.startsWith('/traction')) return 'Reports';
    if (path.startsWith('/benchmark')) return 'Benchmark';
    if (path.startsWith('/ask-treasurer')) return 'Ask Euthyna';
    return 'Treasury';
  };

  const formatAddr = (addr: string) => `${addr.slice(0, 6)}…${addr.slice(-4)}`;

  return (
    <div className="min-h-screen flex flex-col md:flex-row" style={{ background: '#080B12', color: '#F0F4FF' }}>

      {/* ── Mobile Top Bar ── */}
      <div
        className="md:hidden flex items-center justify-between px-4 py-3 sticky top-0 z-50"
        style={{ background: '#101522', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg, #8B5CF6, #22D3EE)' }}>
            E
          </div>
          <span className="font-bold text-sm tracking-tight" style={{ color: '#F0F4FF' }}>Euthyna</span>
        </Link>
        <div className="flex items-center gap-2">
          <WalletButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg"
            style={{ border: '1px solid rgba(255,255,255,0.10)', color: '#8B95B0' }}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-56 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
        style={{ background: '#101522', borderRight: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="p-4 flex flex-col h-full">

          {/* Logo */}
          <div className="pb-4 flex items-center gap-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-white text-base shrink-0"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)' }}
            >
              E
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight" style={{ color: '#F0F4FF' }}>Euthyna</div>
              <div className="text-[10px] font-mono" style={{ color: '#4A5568' }}>Arc USDC Vault</div>
            </div>
          </div>

          {/* Nav links */}
          <nav className="mt-4 space-y-0.5 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                  style={
                    isActive
                      ? {
                          background: 'rgba(139,92,246,0.15)',
                          color: '#A78BFA',
                          borderLeft: '2px solid #8B5CF6',
                          paddingLeft: '10px',
                        }
                      : {
                          color: '#8B95B0',
                        }
                  }
                  onMouseEnter={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#F0F4FF';
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.color = '#8B95B0';
                      (e.currentTarget as HTMLElement).style.background = '';
                    }
                  }}
                >
                  <Icon
                    className="w-4 h-4 shrink-0"
                    style={{ color: isActive ? '#8B5CF6' : '#4A5568' }}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom — network + disconnect */}
          <div className="pt-3 space-y-2" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {!isArcTestnet ? (
              <button
                onClick={switchToArc}
                className="w-full py-2 px-2.5 rounded-xl text-[11px] font-semibold flex items-center justify-center gap-1.5"
                style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>Switch to Arc Testnet</span>
              </button>
            ) : (
              <div
                className="p-2 rounded-xl text-xs flex items-center justify-between"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}
              >
                <span className="flex items-center gap-1.5 text-[11px]" style={{ color: '#34D399' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Arc Testnet
                </span>
                <span className="text-[10px] font-mono" style={{ color: '#4A5568' }}>#5042002</span>
              </div>
            )}

            <button
              onClick={handleDisconnect}
              className="w-full py-2 px-3 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.08)', color: '#8B95B0' }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#F87171';
                (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.20)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = '#8B95B0';
                (e.currentTarget as HTMLElement).style.background = '';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Workspace ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Desktop Top Header */}
        <header
          className="hidden md:flex items-center justify-between px-8 py-3 sticky top-0 z-30"
          style={{ background: 'rgba(16,21,34,0.85)', borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)' }}
        >
          {/* Breadcrumb + Page Title */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#4A5568' }}>
              <Link href="/dashboard" className="hover:text-violet-400 transition-colors">Treasury</Link>
              <span>/</span>
              <span style={{ color: '#A78BFA' }}>{getPageTitle(pathname)}</span>
            </div>
            <h1 className="text-base font-bold mt-0.5 tracking-tight" style={{ color: '#F0F4FF' }}>
              {getPageTitle(pathname)}
            </h1>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2.5">
            {/* Network pill */}
            {isArcTestnet ? (
              <div
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', color: '#34D399' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Arc Testnet
              </div>
            ) : (
              <button
                onClick={switchToArc}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                style={{ background: 'rgba(245,158,11,0.10)', border: '1px solid rgba(245,158,11,0.25)', color: '#FCD34D' }}
              >
                <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />
                Switch to Arc
              </button>
            )}

            {/* Gas sponsored pill */}
            <div
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono"
              style={{ background: 'rgba(34,211,238,0.06)', border: '1px solid rgba(34,211,238,0.12)', color: '#67E8F9' }}
            >
              <Zap className="w-3 h-3" />
              Gas Sponsored
            </div>

            {/* How It Works */}
            <button
              onClick={() => setShowHowItWorksModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#8B95B0' }}
            >
              <HelpCircle className="w-3.5 h-3.5" style={{ color: '#8B5CF6' }} />
              <span>How It Works</span>
            </button>

            <WalletButton />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Footer */}
        <footer
          className="py-3 px-8 text-xs flex flex-col sm:flex-row items-center justify-between gap-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: '#4A5568' }}
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold" style={{ color: '#8B95B0' }}>Euthyna Treasury</span>
            <span>·</span>
            <span>AI proposes. Policy validates. Smart contracts enforce.</span>
          </div>
          <div className="text-[11px]">
            Arc Testnet Chain #5042002 · Settled in Native USDC
          </div>
        </footer>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-30 md:hidden"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        />
      )}

      {/* How It Works Modal */}
      {showHowItWorksModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.70)', backdropFilter: 'blur(8px)' }}
        >
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowHowItWorksModal(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full transition-colors"
              style={{ background: 'rgba(255,255,255,0.10)', color: '#F0F4FF' }}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <InteractiveHowItWorks />
          </div>
        </div>
      )}
    </div>
  );
};
