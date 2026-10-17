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
    <html lang="en" className="dark">
      <body className="bg-bg-base text-[#F0F4FF] min-h-screen antialiased">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
