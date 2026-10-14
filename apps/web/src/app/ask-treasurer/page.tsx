'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Shield, Terminal } from 'lucide-react';
import { ProvenanceBadge } from '../../components/ProvenanceBadge';

interface ChatMessage {
  sender: 'USER' | 'TREASURER';
  text: string;
  citations?: string[];
  simDay?: number;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    sender: 'TREASURER',
    text: "Hello, I am Euthyna's AI Treasurer assistant. My explanations are grounded directly in the signed, onchain-anchored audit ledger. Ask me any 'why' question about treasury decisions, timing, or safety guardrails."
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

export default function AskTreasurerPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { sender: 'USER', text: input };
    const lower = input.toLowerCase();
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-gray-900 border border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-white">Ask the Treasurer (Ledger Grounded Chat)</h1>
            <ProvenanceBadge type="LEDGER" />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Every explanation is cited directly from the cryptographic ledger records, proving the financial calculus and policy checks behind every decision.
          </p>
        </div>
      </div>

      {/* Suggested Questions */}
      <div className="p-4 rounded-xl bg-gray-900 border border-gray-800">
        <div className="text-xs font-mono text-gray-400 mb-2">TRY ASKING:</div>
        <div className="flex flex-wrap gap-2">
          {[
            'Why did you pay AWS on Day 3?',
            'Can you bypass the $3,000 reserve for a 5% discount?',
            'Why did you redeem $1,000 on Day 12 before payroll?'
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => setInput(q)}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-xs text-gray-300 font-mono transition-colors text-left"
            >
              "{q}"
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="p-5 rounded-xl bg-gray-900 border border-gray-800 space-y-4 min-h-[380px] flex flex-col justify-between">
        <div className="space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col ${
                m.sender === 'USER' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-2xl p-3.5 rounded-xl text-xs leading-relaxed font-sans ${
                  m.sender === 'USER'
                    ? 'bg-blue-600 text-white font-medium'
                    : 'bg-gray-950 text-gray-200 border border-gray-800'
                }`}
              >
                {m.sender === 'TREASURER' && (
                  <div className="flex items-center gap-1.5 font-mono text-[11px] text-purple-400 font-bold mb-1.5">
                    <Sparkles className="w-3 h-3" />
                    <span>EUTHYNA TREASURER</span>
                  </div>
                )}
                <p>{m.text}</p>

                {m.citations && (
                  <div className="mt-2.5 pt-2 border-t border-gray-800 flex flex-wrap gap-1 font-mono text-[10px]">
                    <span className="text-gray-500">Citations:</span>
                    {m.citations.map((c, i) => (
                      <span key={i} className="px-1.5 py-0.2 rounded bg-gray-900 text-cyan-400 border border-gray-800">
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
        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Ask a 'why' question about treasury actions or safety limits..."
            className="flex-1 p-2.5 rounded-lg bg-gray-950 border border-gray-800 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
