'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  KeyRound,
  ExternalLink,
  Loader2,
  Lock,
  Unlock,
  Plus,
  X,
  Filter,
  FileText,
  Shield,
  Zap,
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import {
  getBrowserWalletClient,
  readVaultState,
  executeApprovePayee,
  executeRevokePayee,
  executePauseVault,
  executeUnpauseVault,
  executeLiveUsdcTransfer,
  ARC_EXPLORER_URL,
  type VaultOnchainState
} from '../../lib/contracts';
import { getAddress, type Address } from 'viem';

export interface EscalatedItem {
  id: string;
  businessName: string;
  simulatedDay: number;
  actionType: string;
  amountUsdc: string;
  vendor: string;
  payeeAddress: Address;
  reason: string;
  agentCalculus: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string;
  txHash?: string;
  isRealTx?: boolean;
  blockNumber?: number;
}

const INITIAL_APPROVALS: EscalatedItem[] = [
  {
    id: 'appr-live-1usdc',
    businessName: 'Studio A (Creative Agency)',
    simulatedDay: 16,
    actionType: 'LIVE_TEST_SETTLEMENT',
    amountUsdc: '1.00',
    vendor: 'Arc Testnet Verification (Min 1.00 USDC)',
    payeeAddress: '0x71C8364675A74F674482bC9D40455b2E8B991f24',
    reason: 'Live 1.00 USDC onchain transaction ready for direct settlement from connected MetaMask wallet.',
    agentCalculus: 'Minimum 1.00 USDC obligation approved for live MetaMask execution and verified ArcScan block receipt.',
    status: 'PENDING'
  },
  {
    id: 'appr-01',
    businessName: 'Studio A (Creative Agency)',
    simulatedDay: 10,
    actionType: 'PAYEE_MODIFICATION',
    amountUsdc: '1,470.00',
    vendor: 'Figma Enterprise',
    payeeAddress: '0x71C8364675A74F674482bC9D40455b2E8B991f24',
    reason: 'Payee address updated recently. Active cooldown requires explicit Owner confirmation.',
    agentCalculus: 'A 2% discount ($30.00) expires today. Modified payout address requires Owner signature per Rule G3 to protect against Business Email Compromise (BEC).',
    status: 'PENDING'
  },
  {
    id: 'appr-02',
    businessName: 'Dev Guild (Engineering Collective)',
    simulatedDay: 7,
    actionType: 'THREE_WAY_MATCH_OVERRIDE',
    amountUsdc: '2,200.00',
    vendor: 'Hardware Supplier Ltd',
    payeeAddress: '0x82D9475765b84F674482BC9d40455B2e8B992a35',
    reason: 'Three-way match incomplete: warehouse physical goods receipt has not yet been attested.',
    agentCalculus: 'Invoice received for physical server hardware, but delivery attestation receipt is missing. Agent escalated with extension request draft instead of disbursing blind payment.',
    status: 'PENDING'
  },
  {
    id: 'appr-03',
    businessName: 'CloudScale Inc (SaaS Ops)',
    simulatedDay: 12,
    actionType: 'ALLOWLIST_CONFIRMATION',
    amountUsdc: '450.00',
    vendor: 'AWS Cloud Infrastructure',
    payeeAddress: '0x2222222222222222222222222222222222222222',
    reason: 'First invoice from updated AWS multi-region billing account.',
    agentCalculus: 'Monthly cloud compute bill. Standard Net 30 terms. Requires Owner one-time approval before auto-disbursals begin.',
    status: 'PENDING'
  },
  {
    id: 'appr-04',
    businessName: 'Venture Studio Collective',
    simulatedDay: 14,
    actionType: 'EARLY_DISCOUNT_GATE',
    amountUsdc: '850.00',
    vendor: 'Slack Technologies',
    payeeAddress: '0x3333333333333333333333333333333333333333',
    reason: 'Corporate messaging seats (40 team seats). 1.5% discount if paid within 15 days.',
    agentCalculus: 'Liquid reserve buffer verified at $5,500. Early payment captures $12.75 net return with zero risk to payroll.',
    status: 'PENDING'
  },
  {
    id: 'appr-05',
    businessName: 'Global Design Collective',
    simulatedDay: 15,
    actionType: 'HIGH_VALUE_DISBURSAL',
    amountUsdc: '3,000.00',
    vendor: 'Contractor Payroll Batch #14',
    payeeAddress: '0x5555555555555555555555555555555555555555',
    reason: 'Transaction exceeds standard $2,000 automated policy cap.',
    agentCalculus: 'Bi-weekly payroll distribution. Rule G5 triggers mandatory Owner co-signature for single transfers >= $2,000 USDC.',
    status: 'PENDING'
  },
  {
    id: 'appr-settled-01',
    businessName: 'Core Platform Treasury',
    simulatedDay: 3,
    actionType: 'SETTLED_PAYMENT',
    amountUsdc: '1,850.00',
    vendor: 'Google Cloud Platform',
    payeeAddress: '0x6666666666666666666666666666666666666666',
    reason: 'Cloud cluster annual compute settlement verified & executed on Arc Testnet.',
    agentCalculus: 'Automated policy check passed. Approved onchain via Arc Vault contract.',
    status: 'APPROVED',
    approvedBy: '0x6ffdf10d...ab01',
    txHash: '0x604f311ef11471e1fca60d6d4182d2cda4519f4decc50f806431ef3aa99308fd',
    isRealTx: true,
    blockNumber: 2848910
  }
];

export default function ApprovalsPage() {
  const [items, setItems] = useState<EscalatedItem[]>(INITIAL_APPROVALS);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Invoice Form State
  const [newVendor, setNewVendor] = useState('Datadog Monitoring');
  const [newAmount, setNewAmount] = useState('650.00');
  const [newPayee, setNewPayee] = useState('0x4444444444444444444444444444444444444444');
  const [newReason, setNewReason] = useState('New vendor account addition requires initial Owner approval.');

  const [txState, setTxState] = useState<{
    itemId: string | null;
    status: 'idle' | 'prompting' | 'mining' | 'confirmed' | 'failed';
    txHash?: string;
    msg?: string;
  }>({ itemId: null, status: 'idle' });

  const [vaultState, setVaultState] = useState<VaultOnchainState | null>(null);
  const [isRefreshingVault, setIsRefreshingVault] = useState(false);

  const { isConnected, activeRole, address, isArcTestnet, switchToArc } = useWallet();

  const primaryVaultAddress = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
    '0x6ffdf10d5165510b5dd51f69cce7c52df2eaab01') as Address;

  // Load vault state
  const refreshVault = async () => {
    setIsRefreshingVault(true);
    try {
      const state = await readVaultState(primaryVaultAddress);
      setVaultState(state);
    } catch (e) {
      console.warn('Failed to load onchain vault state:', e);
    } finally {
      setIsRefreshingVault(false);
    }
  };

  useEffect(() => {
    refreshVault();
  }, [primaryVaultAddress]);

  // Live Onchain USDC Payment State
  const [isExecutingLiveTx, setIsExecutingLiveTx] = useState(false);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('euthyna_custom_approvals') || '[]');
      if (stored && stored.length > 0) {
        setItems([...stored, ...INITIAL_APPROVALS]);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formattedAddress = getAddress(newPayee.trim().toLowerCase()) as Address;
      const newItem: EscalatedItem = {
        id: `appr-${Date.now().toString().slice(-4)}`,
        businessName: 'Studio A (Creative Agency)',
        simulatedDay: 16,
        actionType: 'NEW_VENDOR_ONBOARDING',
        amountUsdc: parseFloat(newAmount || '0').toFixed(2),
        vendor: newVendor.trim(),
        payeeAddress: formattedAddress,
        reason: newReason.trim(),
        agentCalculus: 'Invoice submitted. Deterministic allowlist rule triggers initial Owner on-chain signature.',
        status: 'PENDING'
      };

      const updated = [newItem, ...items];
      setItems(updated);
      setShowCreateModal(false);
      try {
        localStorage.setItem('euthyna_custom_approvals', JSON.stringify([newItem]));
      } catch {}
    } catch (err: any) {
      setErrorMsg(`Invalid Ethereum address provided: ${err?.message || 'Check 0x format'}`);
    }
  };

  const handleExecuteLiveTransfer = async (
    targetRecipient: Address,
    targetAmount: string,
    sourceItemId: string
  ) => {
    if (!isConnected || !address) {
      setErrorMsg('Please connect your MetaMask wallet first.');
      return;
    }
    const walletClient = getBrowserWalletClient();
    if (!walletClient) {
      setErrorMsg('MetaMask wallet client not found in browser.');
      return;
    }

    try {
      setIsExecutingLiveTx(true);
      setErrorMsg(null);
      setTxState({
        itemId: sourceItemId,
        status: 'prompting',
        msg: `Confirm ${targetAmount} USDC live payment in MetaMask...`
      });

      const res = await executeLiveUsdcTransfer(walletClient, address as Address, targetRecipient, targetAmount, 'direct_payee');

      setTxState({
        itemId: sourceItemId,
        status: 'confirmed',
        txHash: res.hash,
        msg: `Success! ${targetAmount} USDC confirmed on Arc Testnet block #${res.blockNumber}`
      });

      setItems(prev =>
        prev.map(item =>
          item.id === sourceItemId
            ? {
                ...item,
                status: 'APPROVED',
                approvedBy: `${address.slice(0, 6)}...${address.slice(-4)}`,
                txHash: res.hash,
                isRealTx: true,
                blockNumber: Number(res.blockNumber)
              }
            : item
        )
      );

      await refreshVault();

      setTimeout(() => {
        setTxState({ itemId: null, status: 'idle' });
      }, 12000);
    } catch (err: any) {
      console.error('Live payment failed:', err);
      const isRejection = err?.message?.includes('User rejected') || err?.code === 4001;
      setErrorMsg(isRejection ? 'Transaction rejected in MetaMask.' : `Transaction failed: ${err?.shortMessage || err?.message || 'Unknown error'}`);
      setTxState({ itemId: null, status: 'idle' });
    } finally {
      setIsExecutingLiveTx(false);
    }
  };

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    if (!isConnected) {
      setErrorMsg('Please connect your MetaMask wallet first to sign the decision.');
      return;
    }

    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;

    // Direct routing for live USDC test transactions
    if (targetItem.actionType === 'LIVE_TEST_SETTLEMENT' && decision === 'APPROVED') {
      await handleExecuteLiveTransfer(targetItem.payeeAddress, targetItem.amountUsdc, 'direct_payee', id);
      return;
    }

    if (activeRole !== 'OWNER') {
      setErrorMsg(`Access Denied: Current role is "${activeRole}". The onchain EuthynaVault contract requires the Owner role to approve escalated payee modifications.`);
      return;
    }

    setErrorMsg(null);

    const walletClient = getBrowserWalletClient();
    const isRealOnchainAvailable = isArcTestnet && walletClient && address && vaultState?.isDeployed;

    if (isRealOnchainAvailable && targetItem.payeeAddress) {
      try {
        setTxState({
          itemId: id,
          status: 'prompting',
          msg: `Confirm ${decision === 'APPROVED' ? 'approvePayee' : 'revokePayee'} in MetaMask...`
        });

        let res;
        if (decision === 'APPROVED') {
          res = await executeApprovePayee(walletClient, address as Address, primaryVaultAddress, targetItem.payeeAddress);
        } else {
          res = await executeRevokePayee(walletClient, address as Address, primaryVaultAddress, targetItem.payeeAddress);
        }

        setTxState({
          itemId: id,
          status: 'confirmed',
          txHash: res.hash,
          msg: `Mined on Arc block #${res.blockNumber}. Receipt verified onchain!`
        });

        // Update item with live txHash and receipt link
        setItems(prev =>
          prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  status: decision,
                  approvedBy: `${address.slice(0, 6)}...${address.slice(-4)}`,
                  txHash: res.hash,
                  isRealTx: true,
                  blockNumber: Number(res.blockNumber)
                }
              : item
          )
        );

        setTimeout(() => {
          setTxState({ itemId: null, status: 'idle' });
        }, 12000);
        return;
      } catch (err: any) {
        console.error('Onchain transaction failed or rejected:', err);
        const isUserRejection = err?.message?.includes('User rejected') || err?.code === 4001;
        setErrorMsg(isUserRejection ? 'Transaction cancelled in MetaMask.' : `Contract call reverted: ${err?.shortMessage || err?.message || 'Unknown error'}`);
        setTxState({ itemId: null, status: 'idle' });
        return;
      }
    }

    // Fallback: Simulated / Demo Execution
    const mockHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: decision,
              approvedBy: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Owner',
              txHash: mockHash,
              isRealTx: false
            }
          : item
      )
    );
  };

  const handleTogglePause = async () => {
    if (!isConnected) {
      setErrorMsg('Connect wallet to invoke emergency vault controls.');
      return;
    }

    if (activeRole !== 'OWNER' && activeRole !== 'GUARDIAN') {
      setErrorMsg('Access Denied: Only the Guardian or Owner can pause/unpause the vault.');
      return;
    }

    const walletClient = getBrowserWalletClient();
    if (isArcTestnet && walletClient && address && vaultState?.isDeployed) {
      try {
        setTxState({
          itemId: 'pause-control',
          status: 'prompting',
          msg: `Confirm ${vaultState.paused ? 'unpause' : 'pause'} transaction in MetaMask...`
        });

        let res;
        if (vaultState.paused) {
          res = await executeUnpauseVault(walletClient, address as Address, primaryVaultAddress);
        } else {
          res = await executePauseVault(walletClient, address as Address, primaryVaultAddress);
        }

        setTxState({
          itemId: 'pause-control',
          status: 'confirmed',
          txHash: res.hash,
          msg: `Vault successfully ${vaultState.paused ? 'unpaused' : 'paused'} onchain!`
        });

        await refreshVault();
        setTimeout(() => setTxState({ itemId: null, status: 'idle' }), 6000);
        return;
      } catch (err: any) {
        console.error('Pause transaction failed:', err);
        setErrorMsg(err?.shortMessage || err?.message || 'Emergency pause transaction failed');
        setTxState({ itemId: null, status: 'idle' });
        return;
      }
    }

    if (vaultState) {
      setVaultState({ ...vaultState, paused: !vaultState.paused });
    }
  };

  const filteredItems = items.filter(item => {
    if (filter === 'PENDING') return item.status === 'PENDING';
    if (filter === 'APPROVED') return item.status === 'APPROVED';
    return true;
  });

  const pendingCount = items.filter(i => i.status === 'PENDING').length;
  const approvedCount = items.filter(i => i.status === 'APPROVED').length;

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Bar */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4" style={{ color: '#8B5CF6' }} />
            <h2 className="text-base font-bold" style={{ color: '#F0F4FF' }}>
              Owner Governance & Escalated Approvals
            </h2>
          </div>
          <p className="text-xs mt-1" style={{ color: '#8B95B0' }}>
            Deterministic policy rules escalate anomalies—such as new vendors or modified payees—to the business owner for explicit onchain signoff.
          </p>
        </div>

        {/* Action Controls: Add Invoice + Emergency Pause */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all text-white active:scale-95"
            style={{ background: '#8B5CF6', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Approval Invoice</span>
          </button>

          {/* Circuit Breaker Status */}
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <span style={{ color: '#8B95B0' }}>Circuit Breaker:</span>
            <span
              className="font-bold font-mono"
              style={{ color: vaultState?.paused ? '#F87171' : '#34D399' }}
            >
              {vaultState?.paused ? 'PAUSED' : 'NORMAL'}
            </span>
          </div>

          <button
            onClick={handleTogglePause}
            disabled={txState.status === 'prompting' || txState.status === 'mining'}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
            style={
              vaultState?.paused
                ? { background: '#10B981', color: '#FFFFFF', boxShadow: '0 0 12px rgba(16,185,129,0.3)' }
                : { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }
            }
          >
            {vaultState?.paused ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span>{vaultState?.paused ? 'Unpause' : 'Emergency Pause'}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('ALL')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={
              filter === 'ALL'
                ? { background: '#8B5CF6', color: '#FFFFFF', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }
                : { background: '#141A27', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.08)' }
            }
          >
            All Invoices ({items.length})
          </button>
          <button
            onClick={() => setFilter('PENDING')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={
              filter === 'PENDING'
                ? { background: '#F59E0B', color: '#000000', boxShadow: '0 0 12px rgba(245,158,11,0.3)' }
                : { background: '#141A27', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.2)' }
            }
          >
            Pending Review ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('APPROVED')}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
            style={
              filter === 'APPROVED'
                ? { background: '#10B981', color: '#FFFFFF', boxShadow: '0 0 12px rgba(16,185,129,0.3)' }
                : { background: '#141A27', color: '#34D399', border: '1px solid rgba(16,185,129,0.2)' }
            }
          >
            Approved & Settled ({approvedCount})
          </button>
        </div>

        <span className="text-[11px] font-mono" style={{ color: '#4A5568' }}>
          Arc Testnet USDC Vault: {primaryVaultAddress.slice(0, 8)}...{primaryVaultAddress.slice(-6)}
        </span>
      </div>

      {/* Error or Notice Alert */}
      {errorMsg && (
        <div
          className="p-3.5 rounded-xl text-xs flex items-center justify-between gap-3 animate-in fade-in"
          style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs hover:underline shrink-0"
            style={{ color: '#F87171' }}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Transaction Progress Banner */}
      {txState.status !== 'idle' && (
        <div
          className="p-4 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.30)', color: '#F0F4FF' }}
        >
          <div className="flex items-center gap-2.5">
            {txState.status === 'prompting' || txState.status === 'mining' ? (
              <Loader2 className="w-4 h-4 animate-spin text-violet-400 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            <div>
              <div className="font-semibold">{txState.msg}</div>
              {txState.txHash && (
                <div className="text-[11px] font-mono mt-0.5" style={{ color: '#22D3EE' }}>
                  Tx: {txState.txHash}
                </div>
              )}
            </div>
          </div>

          {txState.txHash && (
            <a
              href={`https://explorer.testnet.arc.io/tx/${txState.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto shrink-0 transition-all hover:scale-105"
              style={{ background: '#8B5CF6', color: '#FFFFFF', boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}
            >
              <span>View Onchain Receipt</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Escalated Items List */}
      <div className="space-y-4">
        {filteredItems.map((item) => {
          const isPending = item.status === 'PENDING';
          const isApproved = item.status === 'APPROVED';

          return (
            <div
              key={item.id}
              className="p-6 rounded-2xl space-y-4 transition-all"
              style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              {/* Card Header with Status & Direct Receipt Link */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className="font-mono text-xs font-bold px-2 py-0.5 rounded"
                    style={{ background: 'rgba(255,255,255,0.05)', color: '#F0F4FF', border: '1px solid rgba(255,255,255,0.10)' }}
                  >
                    {item.id}
                  </span>
                  <span className="text-sm font-bold" style={{ color: '#F0F4FF' }}>{item.vendor}</span>
                  <span className="text-xs" style={{ color: '#4A5568' }}>· {item.businessName}</span>
                </div>

                {/* Right Side: Status Badge + Live Receipt Link */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Status Badge */}
                  <span
                    className="px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1"
                    style={
                      isPending
                        ? { background: 'rgba(245,158,11,0.12)', color: '#FCD34D', border: '1px solid rgba(245,158,11,0.25)' }
                        : isApproved
                        ? { background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }
                        : { background: 'rgba(255,255,255,0.05)', color: '#8B95B0', border: '1px solid rgba(255,255,255,0.10)' }
                    }
                  >
                    {isPending ? (
                      <Clock className="w-3.5 h-3.5" />
                    ) : isApproved ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5" />
                    )}
                    <span>{item.status}</span>
                  </span>

                  {/* PROMINENT RECEIPT LINK NEAR STATUS */}
                  {item.txHash && (
                    <a
                      href={`https://explorer.testnet.arc.io/tx/${item.txHash}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold flex items-center gap-1.5 transition-all hover:scale-105"
                      style={{
                        background: 'rgba(139,92,246,0.15)',
                        color: '#A78BFA',
                        border: '1px solid rgba(139,92,246,0.35)',
                        boxShadow: '0 0 10px rgba(139,92,246,0.15)'
                      }}
                      title="Click to view verified block receipt on Arc Explorer"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-violet-400" />
                      <span>ArcScan Receipt: {item.txHash.slice(0, 6)}...{item.txHash.slice(-4)} ↗</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Main Info Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-[10px] uppercase font-semibold" style={{ color: '#4A5568' }}>Invoice Amount</div>
                  <div className="text-base font-bold font-mono mt-0.5" style={{ color: '#34D399' }}>
                    ${item.amountUsdc} USDC
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-semibold" style={{ color: '#4A5568' }}>Payee Address</div>
                  <div className="font-mono mt-0.5 truncate flex items-center gap-1" style={{ color: '#22D3EE' }} title={item.payeeAddress}>
                    <span>{item.payeeAddress}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] uppercase font-semibold" style={{ color: '#4A5568' }}>Escalation Trigger</div>
                  <div className="font-semibold mt-0.5 truncate" style={{ color: '#A78BFA' }}>
                    {item.actionType}
                  </div>
                </div>
              </div>

              {/* Reason & Agent Calculus */}
              <div
                className="p-3.5 rounded-xl text-xs space-y-1.5 leading-relaxed"
                style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div>
                  <strong style={{ color: '#F0F4FF' }}>Anomaly Reason: </strong>
                  <span style={{ color: '#8B95B0' }}>{item.reason}</span>
                </div>
                <div>
                  <strong className="font-mono" style={{ color: '#22D3EE' }}>Agent Calculus: </strong>
                  <span style={{ color: '#8B95B0' }}>{item.agentCalculus}</span>
                </div>
              </div>

              {/* Card Footer: Signer info + Action Buttons + Receipt Link */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] flex items-center gap-2 flex-wrap" style={{ color: '#4A5568' }}>
                  {item.approvedBy && (
                    <span>
                      Signed by: <strong className="font-mono" style={{ color: '#F0F4FF' }}>{item.approvedBy}</strong>
                      {item.isRealTx && (
                        <span className="ml-1 font-semibold" style={{ color: '#34D399' }}>
                          (Onchain Arc Testnet)
                        </span>
                      )}
                    </span>
                  )}
                  {item.blockNumber && (
                    <span className="font-mono text-[10px]" style={{ color: '#22D3EE' }}>
                      · Block #{item.blockNumber}
                    </span>
                  )}
                </div>

                {isPending ? (
                  <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                    <button
                      onClick={() => handleDecision(item.id, 'REJECTED')}
                      className="px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors active:scale-95"
                      style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)', color: '#F87171' }}
                    >
                      Reject
                    </button>
                    {item.actionType === 'LIVE_TEST_SETTLEMENT' ? (
                      <button
                        onClick={() => handleExecuteLiveTransfer(item.payeeAddress, item.amountUsdc, 'direct_payee', item.id)}
                        disabled={isExecutingLiveTx}
                        className="px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-all flex items-center gap-1.5 active:scale-95 disabled:opacity-40"
                        style={{
                          background: 'linear-gradient(135deg, #8B5CF6 0%, #06B6D4 100%)',
                          boxShadow: '0 0 16px rgba(139,92,246,0.35)'
                        }}
                      >
                        {isExecutingLiveTx && txState.itemId === item.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Zap className="w-3.5 h-3.5" />
                        )}
                        <span>Pay 1.00 USDC (MetaMask)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleDecision(item.id, 'APPROVED')}
                        className="px-4 py-1.5 rounded-xl text-white text-xs font-semibold transition-all flex items-center gap-1.5 active:scale-95"
                        style={{ background: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Approve Payee (MetaMask)</span>
                      </button>
                    )}
                  </div>
                ) : item.txHash ? (
                  <a
                    href={`https://explorer.testnet.arc.io/tx/${item.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold transition-colors hover:underline"
                    style={{ color: '#8B5CF6' }}
                  >
                    <span>View ArcScan Receipt</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create Custom Approval Invoice */}
      {showCreateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        >
          <div
            className="relative max-w-lg w-full p-6 sm:p-7 rounded-2xl space-y-4"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.10)', boxShadow: '0 20px 60px rgba(0,0,0,0.7)' }}
          >
            <div className="flex items-center justify-between pb-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-violet-400" />
                <h3 className="text-base font-bold" style={{ color: '#F0F4FF' }}>Create Approval Invoice</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#8B95B0' }}>
                  Vendor / Counterparty Name
                </label>
                <input
                  type="text"
                  value={newVendor}
                  onChange={(e) => setNewVendor(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#8B95B0' }}>
                  Invoice Amount (USDC)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF' }}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#8B95B0' }}>
                  Payee Ethereum Address
                </label>
                <input
                  type="text"
                  value={newPayee}
                  onChange={(e) => setNewPayee(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs font-mono focus:outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF' }}
                  placeholder="0x..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#8B95B0' }}>
                  Escalation Anomaly Reason
                </label>
                <textarea
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF' }}
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#8B95B0' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all active:scale-95"
                  style={{ background: '#8B5CF6', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}
                >
                  Add to Approvals Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
