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
  ExternalLink,
  ChevronRight,
  LogOut,
  HelpCircle,
  AlertTriangle,
  Loader2
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

  // Home page and Login page are public
  const isPublicPage = pathname === '/' || pathname === '/login';

  // Guard protected pages: if user disconnects, immediately return to home page
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

  // Prevent flash of protected content while disconnected or redirecting
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <EuthynaLogo size="md" showWordmark={true} />
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
          <span>Please connect wallet to access treasury...</span>
        </div>
      </div>
    );
  }

  // 8 Compact Sidebar Items requested: Overview, Decisions, Invoice Intake, Approvals, Security, Audit Trail, Reports, Ask Euthyna
  const navItems = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Decisions', href: '/decision-feed', icon: Sparkles },
    { name: 'Invoice Intake', href: '/intake', icon: FileText },
    { name: 'Approvals', href: '/approvals', icon: CheckCircle2 },
    { name: 'Security', href: '/attack-lab', icon: Shield },
    { name: 'Audit Trail', href: '/verify-ledger', icon: GitCommit },
    { name: 'Reports', href: '/traction', icon: BarChart3 },
    { name: 'Ask Euthyna', href: '/ask-treasurer', icon: MessageSquare },
  ];

  const getPageTitle = (path: string) => {
    if (path.startsWith('/dashboard')) return 'Treasury Overview';
    if (path.startsWith('/decision-feed')) return 'Decisions';
    if (path.startsWith('/intake')) return 'Invoice Intake';
    if (path.startsWith('/approvals')) return 'Approvals';
    if (path.startsWith('/attack-lab')) return 'Security Lab';
    if (path.startsWith('/verify-ledger')) return 'Audit Trail';
    if (path.startsWith('/traction')) return 'Reports';
    if (path.startsWith('/benchmark')) return 'Benchmark';
    if (path.startsWith('/ask-treasurer')) return 'Ask Euthyna';
    return 'Treasury';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row text-slate-900 font-sans">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-50">
        <Link href="/dashboard" className="flex items-center gap-2">
          <EuthynaLogo size="sm" showWordmark={true} />
        </Link>
        <div className="flex items-center gap-2">
          <WalletButton />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Compact Sidebar for Desktop & Mobile Overlay */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="p-4 flex flex-col h-full">
          {/* Logo Header */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
              <EuthynaLogo size="md" showWordmark={true} showTagline={true} />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="mt-4 space-y-1 flex-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-blue-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Sidebar: Network and Disconnect Wallet */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            {!isArcTestnet ? (
              <button
                onClick={switchToArc}
                className="w-full py-2 px-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-semibold flex items-center justify-center gap-1.5 hover:bg-amber-100 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Switch to Arc Testnet</span>
              </button>
            ) : (
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center justify-between text-[11px] font-medium text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Arc Testnet
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">#5042002</span>
                </div>
              </div>
            )}

            <button
              onClick={handleDisconnect}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect Wallet</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3 bg-white border-b border-slate-200/80 sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Link href="/dashboard" className="hover:text-slate-600 transition-colors">
                Treasury
              </Link>
              <span>/</span>
              <span className="text-slate-700 font-semibold">{getPageTitle(pathname)}</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900 mt-0.5 tracking-tight">
              {getPageTitle(pathname)}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHowItWorksModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>How It Works</span>
            </button>

            <WalletButton />

            <button
              onClick={handleDisconnect}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
              title="Disconnect and return to home page"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

        {/* Compact Clean Footer */}
        <footer className="py-3 px-8 border-t border-slate-200/80 bg-white text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Euthyna Treasury</span>
            <span>·</span>
            <span>Intelligent Treasury. Protected Decisions.</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Arc Testnet Chain #5042002 · Settled in Native USDC
          </div>
        </footer>
      </div>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* "How Euthyna Works" Interactive Modal */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowHowItWorksModal(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors"
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
