'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Wallet,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building2,
  Lock,
  Loader2
} from 'lucide-react';
import { EuthynaLogo } from '../../components/EuthynaLogo';
import { useWallet } from '../../context/WalletContext';

export default function LoginPage() {
  const router = useRouter();
  const { connect, isConnected, address } = useWallet();

  const [email, setEmail] = useState('treasurer@studio-a.agency');
  const [password, setPassword] = useState('Euthyna2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !email.includes('@')) {
      setError('Please enter a valid corporate email address.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    // Save demo user session to localStorage (No plaintext secret stored)
    try {
      const sessionData = {
        email: email.trim(),
        role: 'OWNER',
        businessId: 'biz-studio-a',
        businessName: 'Studio A (Creative Agency)',
        loggedInAt: new Date().toISOString(),
        isDemoAccess: true
      };
      localStorage.setItem('euthyna_user_session', JSON.stringify(sessionData));
    } catch {
      // localStorage may fail in restricted iframes
    }

    setTimeout(() => {
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleWalletSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const success = await connect();
      if (success) {
        // Save session
        const sessionData = {
          email: 'wallet-authenticated@arc.network',
          role: 'OWNER',
          businessId: 'biz-studio-a',
          businessName: 'Studio A (Creative Agency)',
          loggedInAt: new Date().toISOString(),
          isDemoAccess: true,
          authMethod: 'METAMASK'
        };
        localStorage.setItem('euthyna_user_session', JSON.stringify(sessionData));
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Wallet connection was cancelled.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Top Brand Link */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block">
          <EuthynaLogo size="lg" showWordmark={true} showTagline={true} />
        </Link>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-slate-200 shadow-card">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-slate-950 tracking-tight">
              Sign In to Treasury
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Select demo credentials or connect your MetaMask wallet.
            </p>
          </div>

          {/* Hackathon Demo Access Badge */}
          <div className="mb-6 p-3 rounded-xl bg-blue-50/80 border border-blue-200/80 text-xs text-blue-950 flex items-start gap-2.5">
            <Shield className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <span className="font-semibold text-blue-900">Hackathon Demo Access Mode</span>
              <p className="text-[11px] text-blue-800/80 mt-0.5">
                Pre-configured for the Tameion Agents Hackathon. Demo session persists locally with Owner role privileges on Arc Testnet.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Corporate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                required
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">Demo password prefilled</span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-200 text-xs text-slate-900 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In as Treasurer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center">
            <div className="flex-1 border-t border-slate-200" />
            <span className="px-3 text-[11px] text-slate-400 uppercase font-medium">Or</span>
            <div className="flex-1 border-t border-slate-200" />
          </div>

          {/* Web3 MetaMask Action */}
          <div className="space-y-2">
            <button
              onClick={handleWalletSignIn}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Wallet className="w-4 h-4 text-amber-600" />
              <span>
                {isConnected && address
                  ? `Continue as ${address.slice(0, 6)}...${address.slice(-4)}`
                  : 'Connect with MetaMask'}
              </span>
            </button>

            {/* Quick 1-Click Guest Access */}
            <button
              onClick={() => {
                router.push('/dashboard');
              }}
              className="w-full py-2 px-3 text-[11px] text-slate-500 hover:text-slate-800 transition-colors text-center"
            >
              Continue as Guest / Judge (1-Click)
            </button>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium"
          >
            ← Back to Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}
