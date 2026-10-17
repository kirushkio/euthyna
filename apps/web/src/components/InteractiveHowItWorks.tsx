'use client';

import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const InteractiveHowItWorks: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);

  const steps = [
    {
      num: 1,
      title: '1. Bill Arrives with Discount',
      summary: 'Vendor offers "2/10 Net 30"',
      icon: FileText,
      detail: (
        <div className="space-y-3">
          <div
            className="p-3.5 rounded-xl flex items-center justify-between"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            <div>
              <div className="text-xs font-bold" style={{ color: '#F0F4FF' }}>Figma Enterprise Bill</div>
              <div className="text-[11px]" style={{ color: '#8B95B0' }}>Terms: 2/10 Net 30 (2% off if paid in 10 days)</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono" style={{ color: '#F0F4FF' }}>$1,500.00</div>
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded"
                style={{ background: 'rgba(16,185,129,0.12)', color: '#34D399', border: '1px solid rgba(16,185,129,0.25)' }}
              >
                Eligible for $30.00 off
              </span>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#8B95B0' }}>
            Most businesses miss this because they are afraid of running out of payroll cash, or the invoice sits in an email inbox. Paying 20 days early for 2% off is mathematically equal to earning <strong style={{ color: '#F0F4FF' }}>37.2% annual interest</strong> on your cash!
          </p>
        </div>
      )
    },
    {
      num: 2,
      title: '2. Earn Yield & Guard Payroll',
      summary: 'Keep cash in 5.2% vault until Day 10',
      icon: TrendingUp,
      detail: (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.20)' }}
            >
              <div className="text-[11px] font-bold flex items-center gap-1" style={{ color: '#34D399' }}>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                <span>5.2% USDC Yield</span>
              </div>
              <div className="text-xs mt-1" style={{ color: '#8B95B0' }}>
                Money stays earning daily interest right up until the final discount deadline.
              </div>
            </div>
            <div
              className="p-3 rounded-xl"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.20)' }}
            >
              <div className="text-[11px] font-bold flex items-center gap-1" style={{ color: '#A78BFA' }}>
                <Shield className="w-3.5 h-3.5 text-violet-400" />
                <span>$3,000 Payroll Floor</span>
              </div>
              <div className="text-xs mt-1" style={{ color: '#8B95B0' }}>
                Smart contract physically rejects payments if liquid reserves would drop below payroll.
              </div>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#8B95B0' }}>
            Euthyna does <strong style={{ color: '#F0F4FF' }}>not</strong> pay prematurely on Day 1. It waits until the exact last day (Day 10) so your cash earns maximum yield in the vault before settling.
          </p>
        </div>
      )
    },
    {
      num: 3,
      title: '3. Auto-Pay & Capture Savings',
      summary: 'Pay $1,470 on Day 10 → Save $30',
      icon: Sparkles,
      detail: (
        <div className="space-y-3">
          <div
            className="p-4 rounded-xl"
            style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(34,211,238,0.08) 100%)', border: '1px solid rgba(16,185,129,0.25)' }}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: '#F0F4FF' }}>Final Settlement on Day 10</span>
              <span className="text-sm font-mono font-bold" style={{ color: '#34D399' }}>+$30.00 Saved</span>
            </div>
            <div
              className="mt-2 text-xs flex items-center justify-between pt-2 font-mono"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)', color: '#8B95B0' }}
            >
              <span>Full Invoice: $1,500.00</span>
              <span className="font-bold" style={{ color: '#F0F4FF' }}>You Paid: $1,470.00</span>
            </div>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#8B95B0' }}>
            The smart contract executes the $1,470 payment automatically to Figma's verified wallet on Arc Testnet. The vendor is satisfied, your discount is locked in, and your payroll remains untouched.
          </p>
        </div>
      )
    }
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl"
      style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.10)', color: '#F0F4FF' }}
    >
      {/* Top Banner Header */}
      <div
        className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: '#101522', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-1"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.30)' }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>How Euthyna Works in 3 Steps</span>
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#F0F4FF' }}>Autopilot for Business Cash & Vendor Bills</h3>
          <p className="text-xs mt-0.5" style={{ color: '#8B95B0' }}>
            Understand how Euthyna captures 2% discounts and earns 5% yield without risking payroll.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div
          className="flex items-center p-1 rounded-xl shrink-0"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
              style={
                activeStep === step
                  ? { background: '#8B5CF6', color: '#FFFFFF', boxShadow: '0 0 12px rgba(139,92,246,0.4)' }
                  : { color: '#8B95B0' }
              }
            >
              Step {step}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Step Bar */}
      <div
        className="grid grid-cols-1 sm:grid-cols-3"
        style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        {steps.map((s) => {
          const isCurrent = activeStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className="p-4 text-left transition-all sm:border-r last:border-r-0"
              style={{
                borderColor: 'rgba(255,255,255,0.06)',
                background: isCurrent ? 'rgba(139,92,246,0.10)' : 'transparent',
                borderBottom: isCurrent ? '2px solid #8B5CF6' : '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all"
                  style={
                    isCurrent
                      ? { background: '#8B5CF6', color: '#FFFFFF', boxShadow: '0 0 10px rgba(139,92,246,0.4)' }
                      : { background: 'rgba(255,255,255,0.08)', color: '#8B95B0' }
                  }
                >
                  {s.num}
                </span>
                <div>
                  <div className="text-xs font-bold" style={{ color: isCurrent ? '#F0F4FF' : '#8B95B0' }}>
                    {s.title}
                  </div>
                  <div className="text-[11px] truncate" style={{ color: '#4A5568' }}>{s.summary}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Step Content Card */}
      <div className="p-6 sm:p-7 space-y-4">
        {steps[activeStep - 1].detail}

        {/* Step Next / Previous Navigation */}
        <div className="pt-4 flex items-center justify-between" style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="text-xs font-semibold transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ color: '#8B95B0' }}
          >
            ← Previous Step
          </button>

          <span className="text-xs font-medium" style={{ color: '#4A5568' }}>Step {activeStep} of 3</span>

          {activeStep < 3 ? (
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className="px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              style={{ background: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.3)' }}
            >
              <span>Next: {steps[activeStep].title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
              style={{ background: '#10B981', boxShadow: '0 0 16px rgba(16,185,129,0.3)' }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Replay Flow</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
