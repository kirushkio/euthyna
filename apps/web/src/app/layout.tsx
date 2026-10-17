import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '../components/Providers';
import { AppShell } from '../components/AppShell';

export const metadata: Metadata = {
  title: 'Euthyna Treasury | Intelligent Treasury. Protected Decisions.',
  description:
    'Autonomous AI treasury for modern businesses: captures early-payment discounts, protects liquidity with mathematical reserve floors, and proves execution via onchain Arc Testnet vaults.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 min-h-screen antialiased selection:bg-blue-100 selection:text-blue-900">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
