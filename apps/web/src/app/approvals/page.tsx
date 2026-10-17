'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  Clock,
  ShieldCheck,
  KeyRound,
  AlertTriangle,
  ExternalLink,
  ShieldAlert,
  Loader2,
  RefreshCw,
  Lock,
  Unlock
} from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import {
  getBrowserWalletClient,
  readVaultState,
  executeApprovePayee,
  executeRevokePayee,
  executePauseVault,
  executeUnpauseVault,
  ARC_EXPLORER_URL,
  type VaultOnchainState
} from '../../lib/contracts';
import type { Address } from 'viem';

interface EscalatedItem {
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
}

const INITIAL_APPROVALS: EscalatedItem[] = [
  {
    id: 'appr-01',
    businessName: 'Studio A (Creative Agency)',
    simulatedDay: 10,
    actionType: 'PAYEE_MODIFICATION',
    amountUsdc: '1,200.00',
    vendor: 'Design Agency Partner',
    payeeAddress: '0x71C8364675A74F674482BC9D40455B2E8B991F24',
    reason: 'Payee address was updated recently. Active cooldown requires explicit Owner confirmation.',
    agentCalculus: 'A 2% discount ($24.00) expires today, but the vendor payout address was changed. Per Rule G3, modified addresses require Owner confirmation to protect against Business Email Compromise (BEC).',
    status: 'PENDING'
  },
  {
    id: 'appr-02',
    businessName: 'Dev Guild (Engineering Collective)',
    simulatedDay: 7,
    actionType: 'THREE_WAY_MATCH_OVERRIDE',
    amountUsdc: '2,200.00',
    vendor: 'Hardware Supplier Ltd',
    payeeAddress: '0x82D9475765B84F674482BC9D40455B2E8B992A35',
    reason: 'Three-way match incomplete: warehouse physical goods receipt has not yet been attested.',
    agentCalculus: 'Invoice received for physical server hardware, but delivery attestation receipt is missing. Agent escalated with extension request draft instead of disbursing blind payment.',
    status: 'PENDING'
  }
];

export default function ApprovalsPage() {
  const [items, setItems] = useState<EscalatedItem[]>(INITIAL_APPROVALS);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txState, setTxState] = useState<{
    itemId: string | null;
    status: 'idle' | 'prompting' | 'mining' | 'confirmed' | 'failed';
    txHash?: string;
    msg?: string;
  }>({ itemId: null, status: 'idle' });

  const [vaultState, setVaultState] = useState<VaultOnchainState | null>(null);
  const [isRefreshingVault, setIsRefreshingVault] = useState(false);

  const { isConnected, activeRole, address, isArcTestnet, switchToArc, setDemoRole } = useWallet();

  const primaryVaultAddress = (process.env.NEXT_PUBLIC_VAULT_ADDRESS ||
    '0xbef6a5ba928fd377fe9add0f516effcc50e0b3f6') as Address;

  // Load vault state
  const refreshVault = async () => {
    setIsRefreshingVault(true);
    try {
      const state = await readVaultState(primaryVaultAddress);
      setVaultState(state);
    } catch (e) {
      console.error('Failed to load onchain vault state:', e);
    } finally {
      setIsRefreshingVault(false);
    }
  };

  useEffect(() => {
    refreshVault();
  }, [primaryVaultAddress]);

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

  const handleDecision = async (id: string, decision: 'APPROVED' | 'REJECTED') => {
    if (!isConnected) {
      setErrorMsg('Please connect your Web3 wallet first to sign the decision.');
      return;
    }

    if (activeRole !== 'OWNER') {
      setErrorMsg(`Access Denied: Current role is "${activeRole}". The onchain EuthynaVault contract requires the Owner role to approve escalated payee modifications.`);
      return;
    }

    setErrorMsg(null);
    const targetItem = items.find(i => i.id === id);
    if (!targetItem) return;

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
          status: 'mining',
          txHash: res.hash,
          msg: `Mined on Arc block #${res.blockNumber}. Receipt verified!`
        });

        setItems(prev =>
          prev.map(item =>
            item.id === id
              ? {
                  ...item,
                  status: decision,
                  approvedBy: `${address.slice(0, 6)}...${address.slice(-4)}`,
                  txHash: res.hash,
                  isRealTx: true
                }
              : item
          )
        );

        setTimeout(() => {
          setTxState({ itemId: null, status: 'idle' });
        }, 8000);
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
    setItems(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              status: decision,
              approvedBy: address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Owner',
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

    // Simulated Toggle
    if (vaultState) {
      setVaultState({ ...vaultState, paused: !vaultState.paused });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Owner Governance & Escalated Approvals
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Deterministic policy rules escalate anomalies—such as recently modified payees or incomplete goods attestations—to the business owner for explicit onchain signoff.
          </p>
        </div>

        {/* Emergency Circuit Breaker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <span className="text-slate-500">Vault Circuit Breaker:</span>
            <span className={`font-semibold ${vaultState?.paused ? 'text-rose-600' : 'text-emerald-600'}`}>
              {vaultState?.paused ? 'PAUSED' : 'NORMAL'}
            </span>
          </div>

          <button
            onClick={handleTogglePause}
            disabled={txState.status === 'prompting' || txState.status === 'mining'}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 ${
              vaultState?.paused
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
            }`}
          >
            {vaultState?.paused ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5 text-rose-600" />}
            <span>{vaultState?.paused ? 'Unpause Vault' : 'Emergency Pause'}</span>
          </button>
        </div>
      </div>

      {/* Error or Notice Alert */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-xs text-rose-600 hover:underline shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Transaction Progress Banner */}
      {txState.status !== 'idle' && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            {txState.status === 'prompting' || txState.status === 'mining' ? (
              <Loader2 className="w-4 h-4 animate-spin text-blue-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div>
              <div className="font-semibold">{txState.msg}</div>
              {txState.txHash && (
                <div className="text-[11px] font-mono text-blue-700 mt-0.5">
                  Tx: {txState.txHash}
                </div>
              )}
            </div>
          </div>

          {txState.txHash && (
            <a
              href={`https://testnet.arcscan.app/tx/${txState.txHash}`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-semibold flex items-center gap-1 self-start sm:self-auto shrink-0 shadow-xs"
            >
              <span>View Receipt</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      {/* Escalated Items List */}
      <div className="space-y-4">
        {items.map((item) => {
          const isPending = item.status === 'PENDING';
          const isApproved = item.status === 'APPROVED';
          const isRejected = item.status === 'REJECTED';

          return (
            <div
              key={item.id}
              className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {item.id}
                  </span>
                  <span className="text-xs font-semibold text-slate-800">{item.vendor}</span>
                  <span className="text-xs text-slate-400">· {item.businessName}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : isApproved
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}
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
                </div>
              </div>

              {/* Main Info Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Payment Amount</div>
                  <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
                    ${item.amountUsdc} USDC
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Payee Address</div>
                  <div className="font-mono text-slate-700 mt-0.5 truncate" title={item.payeeAddress}>
                    {item.payeeAddress}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">Escalation Trigger</div>
                  <div className="font-semibold text-slate-800 mt-0.5 truncate">
                    {item.actionType}
                  </div>
                </div>
              </div>

              {/* Reason & Agent Calculus */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs space-y-1.5 leading-relaxed">
                <div>
                  <strong className="text-slate-800">Anomaly Reason: </strong>
                  <span className="text-slate-600">{item.reason}</span>
                </div>
                <div>
                  <strong className="text-slate-800 font-mono">Agent Calculus: </strong>
                  <span className="text-slate-600">{item.agentCalculus}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400">
                  {item.approvedBy && (
                    <span>
                      Signed by: <strong className="text-slate-700 font-mono">{item.approvedBy}</strong>
                      {item.isRealTx && <span className="ml-1 text-emerald-600 font-semibold">(Onchain Arc Transaction)</span>}
                    </span>
                  )}
                </div>

                {isPending && (
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                      onClick={() => handleDecision(item.id, 'REJECTED')}
                      className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors"
                    >
                      Reject Payee
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, 'APPROVED')}
                      className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Payee (MetaMask)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
