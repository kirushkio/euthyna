import React from 'react';

export type ProvenanceType = 'ONCHAIN' | 'SIMULATED' | 'PROJECTION' | 'LEDGER';

interface ProvenanceBadgeProps {
  type: ProvenanceType;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({ type, className = '' }) => {
  switch (type) {
    case 'ONCHAIN':
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-600/40 tracking-wider ${className}`}
          title="Onchain-verified via Arc Testnet"
        >
          ● ONCHAIN
        </span>
      );
    case 'SIMULATED':
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/80 text-amber-400 border border-amber-600/40 tracking-wider ${className}`}
          title="Simulated via deterministic local test harness"
        >
          ▲ SIMULATED
        </span>
      );
    case 'PROJECTION':
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-950/80 text-indigo-400 border border-indigo-600/40 tracking-wider ${className}`}
          title="Statistical projection via Monte Carlo forecast"
        >
          ◆ PROJECTION
        </span>
      );
    case 'LEDGER':
      return (
        <span
          className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-600/40 tracking-wider ${className}`}
          title="Anchored in signed double-entry ledger"
        >
          ■ LEDGER
        </span>
      );
  }
};
