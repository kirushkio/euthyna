'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export const ARC_TESTNET_CHAIN_ID = 5042002;
export const ARC_TESTNET_HEX = '0x4cef12';

export const ARC_CHAIN_CONFIG = {
  chainId: ARC_TESTNET_HEX,
  chainName: 'Arc Testnet',
  nativeCurrency: {
    name: 'USDC',
    symbol: 'USDC',
    decimals: 6,
  },
  rpcUrls: ['https://rpc.testnet.arc.network'],
  blockExplorerUrls: ['https://testnet.arcscan.io'],
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
  connect: () => Promise<void>;
  disconnect: () => void;
  switchToArc: () => Promise<void>;
  setDemoRole: (role: TreasuryRole) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<TreasuryRole>('OWNER');
  const [usdcBalance, setUsdcBalance] = useState<string>('24,500.00');

  const isConnected = !!address;
  const isArcTestnet = chainId === ARC_TESTNET_CHAIN_ID;

  // Determine role based on address or override
  const detectRole = useCallback((addr: string): TreasuryRole => {
    const lower = addr.toLowerCase();
    if (lower === ROLE_ADDRESSES.OWNER.toLowerCase()) return 'OWNER';
    if (lower === ROLE_ADDRESSES.REGISTRAR.toLowerCase()) return 'REGISTRAR';
    if (lower === ROLE_ADDRESSES.AGENT.toLowerCase()) return 'AGENT';
    if (lower === ROLE_ADDRESSES.GUARDIAN.toLowerCase()) return 'GUARDIAN';
    return 'VISITOR';
  }, []);

  // Sync chainId and accounts if window.ethereum exists
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const ethereum = (window as unknown as { ethereum?: any }).ethereum;

    if (!ethereum) {
      // Restore previously saved demo session if any
      const savedAddress = localStorage.getItem('euthyna_wallet_address');
      const savedRole = localStorage.getItem('euthyna_wallet_role') as TreasuryRole;
      if (savedAddress) {
        setAddress(savedAddress);
        setChainId(ARC_TESTNET_CHAIN_ID);
        if (savedRole) setActiveRole(savedRole);
      }
      return;
    }

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        const addr = accounts[0];
        setAddress(addr);
        localStorage.setItem('euthyna_wallet_address', addr);
        const role = detectRole(addr);
        setActiveRole(role);
      } else {
        setAddress(null);
        localStorage.removeItem('euthyna_wallet_address');
      }
    };

    const handleChainChanged = (hexChain: string) => {
      const parsedId = parseInt(hexChain, 16);
      setChainId(parsedId);
    };

    ethereum.on?.('accountsChanged', handleAccountsChanged);
    ethereum.on?.('chainChanged', handleChainChanged);

    // Initial check
    ethereum
      .request?.({ method: 'eth_accounts' })
      .then((accs: string[]) => {
        if (accs && accs.length > 0) {
          handleAccountsChanged(accs);
        }
      })
      .catch(() => {});

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
  }, [detectRole]);

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

  const connect = async () => {
    setIsConnecting(true);
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
            await switchToArc();
          }

          setActiveRole(detectRole(addr));
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
      }
    } catch (err) {
      console.error('User rejected or wallet error:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAddress(null);
    setChainId(null);
    setActiveRole('VISITOR');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('euthyna_wallet_address');
      localStorage.removeItem('euthyna_wallet_role');
    }
  };

  const setDemoRole = (role: TreasuryRole) => {
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
        connect,
        disconnect,
        switchToArc,
        setDemoRole,
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
