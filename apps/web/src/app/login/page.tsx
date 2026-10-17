'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Eye,
  EyeOff,
  ArrowRight,
  Wallet,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export default function LoginPage() {
  const router = useRouter();
  const { connect, isConnected } = useWallet();

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
    }, 400);
  };

  const handleWalletSignIn = async () => {
    setError(null);
    setIsLoading(true);
    const success = await connect();
    setIsLoading(false);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center p-4"
      style={{ background: '#080B12', color: '#F0F4FF' }}
    >
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Brand */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Link href="/" className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white text-xl"
              style={{ background: 'linear-gradient(135deg, #8B5CF6 0%, #22D3EE 100%)' }}
            >
              E
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ color: '#F0F4FF' }}>Euthyna</span>
          </Link>
          <h1 className="text-xl font-bold tracking-tight" style={{ color: '#F0F4FF' }}>
            Treasury Sign In
          </h1>
          <p className="text-xs" style={{ color: '#8B95B0' }}>
            Access corporate cash positions, invoice approvals, and on-chain vaults.
          </p>
        </div>

        {/* Card */}
        <div
          className="p-6 sm:p-8 rounded-2xl space-y-5"
          style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}
        >
          {/* Web3 Wallet Quick Connect */}
          <div>
            <button
              onClick={handleWalletSignIn}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2.5 transition-all active:scale-95 disabled:opacity-50"
              style={{ background: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}
            >
              <Wallet className="w-4 h-4" />
              <span>{isConnected ? 'Continue with Connected MetaMask' : 'Sign In with MetaMask'}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-[11px] uppercase" style={{ color: '#4A5568' }}>Or with Corporate Email</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            {error && (
              <div
                className="p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in"
                style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#8B95B0' }}>
                Corporate Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none transition-all"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF' }}
                placeholder="treasurer@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#8B95B0' }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none pr-10 transition-all"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF' }}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 transition-colors"
                  style={{ color: '#4A5568' }}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#F0F4FF' }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Signing In…</span>
                </>
              ) : (
                <>
                  <span>Sign In as Treasurer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs transition-colors hover:underline" style={{ color: '#8B95B0' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
