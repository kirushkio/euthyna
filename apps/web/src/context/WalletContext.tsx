'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_TESTNET_HEX = '0x4cef52';

export const ARC_CHAIN_CONFIG = {
  chainId: ARC_TESTNET_HEX,
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 18,
  },
  rpcUrls: [
    'https://arc-testnet.drpc.org',
    'https://arc-testnet-rpc.publicnode.com'
  ],
  blockExplorerUrls: ['https://explorer.testnet.arc.io'],
};

// Known demo role addresses from deployments.json
export const ROLE_ADDRESSES = {
  OWNER: '0x1111111111111111111111111111111111111111',
  REGISTRAR: '0x2222222222222222222222222222222222222222',
  AGENT: '0x3333333333333333333333333333333333333333',
  GUARDIAN: '0x4444444444444444444444444444444444444444',
} as const;

export type TreasuryRole = 'OWNER' | 'REGISTRAR' | 'AGENT' | 'GUARDIAN' | 'VISITOR';

interface WalletContextType {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isArcTestnet: boolean;
  activeRole: TreasuryRole;
  usdcBalance: string;
  connectError: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  switchToArc: () => Promise<void>;
  setDemoRole: (role: TreasuryRole) => void;
  clearConnectError: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [activeRole, setActiveRole] = useState<TreasuryRole>('OWNER');
  const [usdcBalance, setUsdcBalance] = useState<string>('24,500.00');

  const clearConnectError = () => setConnectError(null);

  const isConnected = !!address;
  const isArcTestnet = chainId === ARC_TESTNET_CHAIN_ID;

  // Determine role based on address or override
  const detectRole = useCallback((addr: string): TreasuryRole => {
    const lower = addr.toLowerCase();
    if (lower === ROLE_ADDRESSES.OWNER.toLowerCase()) return 'OWNER';
    if (lower === ROLE_ADDRESSES.REGISTRAR.toLowerCase()) return 'REGISTRAR';
    if (lower === ROLE_ADDRESSES.AGENT.toLowerCase()) return 'AGENT';
    if (lower === ROLE_ADDRESSES.GUARDIAN.toLowerCase()) return 'GUARDIAN';
    return 'OWNER'; // Default connected user to Owner in demo environment so they can test features
  }, []);

  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const ethereum = (window as unknown as { ethereum?: any }).ethereum;
      if (ethereum && chainId === ARC_TESTNET_CHAIN_ID) {
        const balHex = await ethereum.request({
          method: 'eth_getBalance',
          params: [addr, 'latest'],
        });
        if (balHex) {
          const bal = parseInt(balHex, 16);
          const usdc = (bal / 1e6).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          setUsdcBalance(usdc);
        }
      }
    } catch (e) {
      console.warn('Could not refresh onchain balance:', e);
    }
  }, [chainId]);

  const addressRef = React.useRef<string | null>(address);
  addressRef.current = address;

  // Sync chainId and accounts if window.ethereum exists
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as unknown as { ethereum?: any }).ethereum;

    const isManuallyDisconnected = localStorage.getItem('euthyna_wallet_disconnected') === 'true';

    if (!ethereum) {
      if (!isManuallyDisconnected) {
        // Restore previously saved demo session if any
        const savedAddress = localStorage.getItem('euthyna_wallet_address');
        const savedRole = localStorage.getItem('euthyna_wallet_role') as TreasuryRole;
        if (savedAddress) {
          setAddress(savedAddress);
          setChainId(ARC_TESTNET_CHAIN_ID);
          if (savedRole) setActiveRole(savedRole);
        }
      }
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        // User actively selected/switched account in MetaMask
        localStorage.removeItem('euthyna_wallet_disconnected');
        const addr = accounts[0];
        setAddress(addr);
        localStorage.setItem('euthyna_wallet_address', addr);
        const role = detectRole(addr);
        setActiveRole(role);
        refreshBalance(addr);
      } else {
        setAddress(null);
        localStorage.removeItem('euthyna_wallet_address');
      }
    };

    const handleChainChanged = (hexChain: string) => {
      const parsedId = parseInt(hexChain, 16);
      setChainId(parsedId);
      if (addressRef.current) refreshBalance(addressRef.current);
    };

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);

    // Initial check: only auto-connect if user has not explicitly clicked disconnect
    if (!isManuallyDisconnected) {
      ethereum
        .request?.({ method: 'eth_accounts' })
        .then((accs: string[]) => {
          if (accs && accs.length > 0) {
            handleAccountsChanged(accs);
          }
        })
        .catch(() => {});
    }

    ethereum
      .request?.({ method: 'eth_chainId' })
      .then((cid: string) => {
        if (cid) setChainId(parseInt(cid, 16));
      })
      .catch(() => {});

    return () => {
      ethereum.removeListener?.('accountsChanged', handleAccountsChanged);
      ethereum.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [detectRole, refreshBalance]);

  const switchToArc = async () => {
    const ethereum = (window as unknown as { ethereum?: any }).ethereum;
    if (!ethereum) {
      // Simulate switch in demo mode
      setChainId(ARC_TESTNET_CHAIN_ID);
      return;
    }

    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ARC_TESTNET_HEX }],
      });
      setChainId(ARC_TESTNET_CHAIN_ID);
    } catch (switchError: any) {
      // Error code 4902 indicates chain not yet added to wallet
      if (switchError.code === 4902 || switchError?.message?.includes('Unrecognized')) {
        try {
          await ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [ARC_CHAIN_CONFIG],
          });
          setChainId(ARC_TESTNET_CHAIN_ID);
        } catch (addError) {
          console.error('Failed to add Arc Testnet:', addError);
        }
      } else {
        console.error('Failed to switch to Arc Testnet:', switchError);
      }
    }
  };

  const connect = async (): Promise<boolean> => {
    setIsConnecting(true);
    setConnectError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('euthyna_wallet_disconnected');
    }
    const ethereum = (window as unknown as { ethereum?: any }).ethereum;

    try {
      if (ethereum) {
        const accounts: string[] = await ethereum.request({
          method: 'eth_requestAccounts',
        });
        if (accounts && accounts.length > 0) {
          const addr = accounts[0];
          setAddress(addr);
          localStorage.setItem('euthyna_wallet_address', addr);

          const cidHex: string = await ethereum.request({ method: 'eth_chainId' });
          const currentCid = parseInt(cidHex, 16);
          setChainId(currentCid);

          if (currentCid !== ARC_TESTNET_CHAIN_ID) {
            try {
              await switchToArc();
            } catch {
              // Non-fatal: wallet connected, user can click Switch to Arc
            }
          }

          setActiveRole(detectRole(addr));
          refreshBalance(addr);
          return true;
        } else {
          setConnectError('No accounts returned by MetaMask.');
          return false;
        }
      } else {
        // Fallback for browsers/environments without Web3 extensions (MetaMask not installed)
        // Auto-connect to Arc Owner role wallet with full demo capabilities
        const demoAddr = ROLE_ADDRESSES.OWNER;
        setAddress(demoAddr);
        setChainId(ARC_TESTNET_CHAIN_ID);
        setActiveRole('OWNER');
        localStorage.setItem('euthyna_wallet_address', demoAddr);
        localStorage.setItem('euthyna_wallet_role', 'OWNER');
        return true;
      }
    } catch (err: any) {
      console.warn('Wallet connection error:', err);
      if (err.code === 4001 || err?.message?.toLowerCase().includes('reject') || err?.message?.toLowerCase().includes('user denied')) {
        setConnectError('MetaMask connection request was rejected. Click Connect Wallet to try again.');
      } else {
        setConnectError(err?.message || 'Failed to connect MetaMask.');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    setAddress(null);
    setChainId(null);
    setActiveRole('VISITOR');
    setUsdcBalance('0.00');
    setConnectError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('euthyna_wallet_address');
      localStorage.removeItem('euthyna_wallet_role');
      localStorage.removeItem('euthyna_user_session');
      localStorage.setItem('euthyna_wallet_disconnected', 'true');
    }

    const ethereum = (window as unknown as { ethereum?: any }).ethereum;
    if (ethereum) {
      try {
        await ethereum.request({
          method: 'wallet_revokePermissions',
          params: [{ eth_accounts: {} }],
        });
      } catch {
        // wallet_revokePermissions is supported on modern MetaMask, safe to ignore if unsupported
      }
    }
  };

  const setDemoRole = (role: TreasuryRole) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('euthyna_wallet_disconnected');
    }
    setActiveRole(role);
    if (role === 'OWNER') setAddress(ROLE_ADDRESSES.OWNER);
    else if (role === 'REGISTRAR') setAddress(ROLE_ADDRESSES.REGISTRAR);
    else if (role === 'AGENT') setAddress(ROLE_ADDRESSES.AGENT);
    else if (role === 'GUARDIAN') setAddress(ROLE_ADDRESSES.GUARDIAN);
    else setAddress('0x71C8364675A74F674482BC9D40455B2E8B991F24');

    if (!chainId) setChainId(ARC_TESTNET_CHAIN_ID);
    if (typeof window !== 'undefined') {
      localStorage.setItem('euthyna_wallet_role', role);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        chainId,
        isConnected,
        isConnecting,
        isArcTestnet,
        activeRole,
        usdcBalance,
        connectError,
        connect,
        disconnect,
        switchToArc,
        setDemoRole,
        clearConnectError,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
