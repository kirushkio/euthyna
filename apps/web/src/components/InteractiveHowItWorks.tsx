'use client';

import React, { useState } from 'react';
import {
  FileText,
  TrendingUp,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Clock,
  ChevronRight
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
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Figma Enterprise Bill</div>
              <div className="text-[11px] text-slate-500">Terms: 2/10 Net 30 (2% off if paid in 10 days)</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold font-mono text-slate-900">$1,500.00</div>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Eligible for $30.00 off
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Most businesses miss this because they are afraid of running out of payroll cash, or the invoice sits in an email inbox. Paying 20 days early for 2% off is mathematically equal to earning <strong>37.2% annual interest</strong> on your cash!
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
            <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200">
              <div className="text-[11px] font-bold text-emerald-900 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>5.2% USDC Yield</span>
              </div>
              <div className="text-xs text-emerald-800 mt-1">
                Money stays earning daily interest right up until the final discount deadline.
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-50/80 border border-blue-200">
              <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>$3,000 Payroll Floor</span>
              </div>
              <div className="text-xs text-blue-800 mt-1">
                Smart contract physically rejects payments if liquid reserves would drop below payroll.
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Euthyna does <strong>not</strong> pay immediately on Day 1. It waits until the exact last day (Day 10) so your money earns maximum yield in the vault before settling.
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
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950">Final Settlement on Day 10</span>
              <span className="text-sm font-mono font-bold text-emerald-700">+$30.00 Saved</span>
            </div>
            <div className="mt-2 text-xs text-slate-700 flex items-center justify-between pt-2 border-t border-emerald-200/60 font-mono">
              <span>Full Invoice: $1,500.00</span>
              <span className="font-bold text-slate-900">You Paid: $1,470.00</span>
            </div>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            The smart contract executes the $1,470 payment automatically to Figma's verified wallet on Arc Testnet. The vendor is satisfied, your discount is locked in, and your payroll remains untouched.
          </p>
        </div>
      )
    }
  ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Top Banner Header */}
      <div className="p-5 sm:p-6 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>How Euthyna Works in 3 Steps</span>
          </div>
          <h3 className="text-lg font-bold">Autopilot for Business Cash & Vendor Bills</h3>
          <p className="text-xs text-slate-300 mt-0.5">
            Understand how Euthyna captures 2% discounts and earns 5% yield without risking payroll.
          </p>
        </div>

        {/* Step Selector Pills */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700 shrink-0">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => setActiveStep(step)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeStep === step
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Step {step}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Step Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 border-b border-slate-200/80 bg-slate-50/50">
        {steps.map((s) => {
          const Icon = s.icon;
          const isCurrent = activeStep === s.num;
          return (
            <button
              key={s.num}
              onClick={() => setActiveStep(s.num)}
              className={`p-4 text-left border-b-2 sm:border-b-0 sm:border-r last:border-r-0 border-slate-200/80 transition-all ${
                isCurrent
                  ? 'bg-white border-b-2 sm:border-b-2 sm:border-b-blue-600'
                  : 'hover:bg-slate-100/60 opacity-80'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {s.num}
                </span>
                <div>
                  <div className={`text-xs font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>
                    {s.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{s.summary}</div>
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
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
            disabled={activeStep === 1}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ← Previous Step
          </button>

          <span className="text-xs text-slate-400 font-medium">Step {activeStep} of 3</span>

          {activeStep < 3 ? (
            <button
              onClick={() => setActiveStep(activeStep + 1)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            >
              <span>Next: {steps[activeStep].title}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => setActiveStep(1)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
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
