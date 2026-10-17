'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
  Shield,
  HelpCircle,
  FileText,
  CheckCircle2,
  Bookmark
} from 'lucide-react';
import { EuthynaLogo } from '../../components/EuthynaLogo';

interface ChatMessage {
  sender: 'USER' | 'TREASURER';
  text: string;
  citations?: string[];
  simDay?: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    sender: 'TREASURER',
    text: "Hello, I am Euthyna's AI Treasurer assistant. My explanations are grounded directly in your signed, onchain-anchored audit ledger and contract policies. Ask me any 'why' question about treasury decisions, timing, or safety guardrails."
  },
  {
    sender: 'USER',
    text: 'Why did you pay Figma on Day 10 instead of paying immediately on Day 0?'
  },
  {
    sender: 'TREASURER',
    text: "Figma invoiced $1,500 with terms 2/10 Net 30. Paying 20 days early captures a $30.00 discount (37.2% annualized return). However, paying on Day 0 would forfeit 10 days of yield in the venue (earning 5.20% APR). By waiting until Day 10—the final eligible day of the discount window—we kept the cash compounding in yield for an additional 10 days, capturing the full $30.00 discount at maximum financial efficiency with net EV of +$25.97.",
    citations: ['Ledger Seq #14', 'Obligation 0xob-figma-02', 'Rule G4 (Exact Discount Calculation)'],
    simDay: 10
  }
];

const PROMPT_CHIPS = [
  'Why did you pay Figma on Day 10 instead of Day 0?',
  'Why was AWS Cloud bill paid on Day 3?',
  'How is the $3,000 reserve floor protected?',
  'Why was an early redemption initiated before payroll?'
];

export default function AskTreasurerPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = { sender: 'USER', text: query };
    const lower = query.toLowerCase();
    let replyText = '';
    let citations: string[] = ['Ledger Chain Digest', 'EuthynaVault Arc Policy'];

    if (lower.includes('aws') || lower.includes('cloud')) {
      replyText =
        'AWS Cloud Hosting was paid on its exact due date (Day 3). Its terms were Net 15 with 0% early discount. Paying before Day 3 would only lose yield in the SimYield venue without economic benefit. Paying on Day 3 satisfies the obligation and avoids late fees.';
      citations.push('Ledger Seq #13', 'Rule G2 (Unpaid Due Date)');
    } else if (lower.includes('reserve') || lower.includes('floor')) {
      replyText =
        'The $3,000 reserve floor is physically enforced by the EuthynaVault smart contract on Arc (Rule G6). Even if an LLM is prompt injected or hallucinates, the contract reverts any discretionary payment that would leave liquid USDC below $3,000. Mandatory payments (like payroll) may use the reserve, but early discounts cannot.';
      citations.push('EuthynaVault.sol:line 272', 'Rule G6 (Reserve Protection)');
    } else if (lower.includes('payroll') || lower.includes('redeem')) {
      replyText =
        'On Day 12, the expected customer receivable of $2,500 had not arrived. Because payroll ($4,000) was due on Day 14 and the SimYield venue has a T+1 redemption delay, the planner initiated a proactive $1,000 redemption on Day 12 to guarantee liquidity before the due date.';
      citations.push('Ledger Seq #15', 'Rule G9 (Redemption Lead Time)');
    } else {
      replyText = `Based on the onchain ledger state for Studio A, current liquidity is $5,500.00 USDC, reserve floor is $3,000.00 USDC, and $4,500.00 USDC is earning 5.20% APR. All actions pass the 14 deterministic policy gate rules and are verified against Arc Testnet anchors.`;
      citations.push('Snapshot Digest L=5500, R=3000');
    }

    const botMsg: ChatMessage = {
      sender: 'TREASURER',
      text: replyText,
      citations
    };

    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="p-5 rounded-xl bg-white border border-slate-200/90 shadow-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Ask Euthyna: Natural Language Treasury Explanations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Plain-English reasoning grounded directly in cryptographically signed ledger hashes and onchain contract state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grounded in Audit Ledger</span>
          </span>
        </div>
      </div>

      {/* Suggested Question Chips */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Suggested Questions:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {PROMPT_CHIPS.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium transition-all shadow-2xs hover:border-slate-300 text-left"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-6 rounded-xl bg-white border border-slate-200/90 shadow-subtle min-h-[420px] flex flex-col justify-between space-y-6">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'TREASURER' && (
                <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0 mt-0.5">
                  <EuthynaLogo size="sm" />
                </div>
              )}

              <div
                className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 shadow-xs ${
                  m.sender === 'USER'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-50 text-slate-800 border border-slate-200/80 rounded-bl-sm'
                }`}
              >
                <div className="font-sans whitespace-pre-wrap">{m.text}</div>

                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200/60 flex flex-wrap gap-1.5 text-[10px]">
                    <span className="text-slate-400 font-semibold uppercase flex items-center gap-0.5">
                      <Bookmark className="w-2.5 h-2.5" />
                      Citations:
                    </span>
                    {m.citations.map((c, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-mono font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask why a payment was made, explain discount calculus, or query the reserve floor..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-all flex items-center gap-1.5 shrink-0"
            >
              <span>Ask</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
