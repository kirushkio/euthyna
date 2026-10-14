import type { Metadata } from 'next';
import './globals.css';
import { JudgeModeBanner } from '../components/JudgeModeBanner';
import { Navigation } from '../components/Navigation';

export const metadata: Metadata = {
  title: 'Euthyna Treasury | AI Treasurer on Arc Settled in USDC',
  description: 'AI treasurer for small businesses: captures early-payment discounts, sweeps surplus into yield, and proves safety via an onchain vault on Arc and an independent witness ledger.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0B0F17] text-gray-100 min-h-screen flex flex-col">
        <JudgeModeBanner />
        <Navigation />
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="border-t border-gray-900 bg-gray-950/80 py-4 px-6 text-xs text-gray-500 font-mono text-center">
          Euthyna Treasury · Tameion Agents Hackathon 2026 · Circle x Canteen · Arc Testnet Chain #5042002
        </footer>
      </body>
    </html>
  );
}
