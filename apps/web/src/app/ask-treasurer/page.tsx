'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Sparkles,
} from 'lucide-react';

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
      replyText = 'The AWS Cloud hosting invoice ($450.00) carries standard Net 30 terms with 0% early discount. Paying early would forfeit treasury yield interest. Euthyna waited until the exact due date (Day 3) to disburse payment, maximizing vault yield with zero late fees.';
      citations = ['Ledger Seq #18', 'Rule G2 (Unpaid Due Date)'];
    } else if (lower.includes('reserve') || lower.includes('floor') || lower.includes('3,000')) {
      replyText = 'The $3,000 reserve floor is a hard mathematical constraint enforced by Rule G6 in the EuthynaVault smart contract. Any outbound transaction that would drop the available treasury balance below $3,000 is physically reverted on Arc Testnet.';
      citations = ['EuthynaVault Contract #5042002', 'Rule G6 (Hard Reserve Floor)'];
    } else if (lower.includes('figma') || lower.includes('day 10')) {
      replyText = 'Figma terms 2/10 Net 30 offered $30 discount. Paying on Day 10 instead of Day 0 kept the cash compounding in yield for 10 full days while capturing the 2% discount right before expiration.';
      citations = ['Rule G4 (Discount Optimization)'];
    } else {
      replyText = `Based on your treasury state, all obligations are validated against the 14 deterministic policy gates before execution. Outbound payments require either full allowlist verification or Owner signoff.`;
    }

    const aiMsg: ChatMessage = {
      sender: 'TREASURER',
      text: replyText,
      citations
    };

    setMessages(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div
        className="p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold" style={{ color: '#F0F4FF' }}>
              Ask Euthyna AI Treasurer
            </h2>
          </div>
          <p className="text-xs mt-1" style={{ color: '#8B95B0' }}>
            Auditable plain-English explanations backed by cryptographic ledger citations and policy proofs.
          </p>
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="text-[11px] px-3 py-1.5 rounded-xl text-left transition-all hover:bg-white/[0.04]"
            style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)', color: '#8B95B0' }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Chat Messages */}
      <div
        className="p-6 rounded-2xl space-y-4 min-h-[420px] max-h-[560px] overflow-y-auto"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        {messages.map((m, idx) => {
          const isUser = m.sender === 'USER';

          return (
            <div
              key={idx}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
            >
              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed ${
                  isUser
                    ? 'text-white'
                    : 'text-slate-200'
                }`}
                style={
                  isUser
                    ? { background: '#8B5CF6', boxShadow: '0 0 16px rgba(139,92,246,0.25)' }
                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 font-bold mb-1.5" style={{ color: '#22D3EE' }}>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Euthyna Policy Engine</span>
                  </div>
                )}
                <p>{m.text}</p>

                {m.citations && (
                  <div className="mt-2.5 pt-2 flex items-center gap-1.5 flex-wrap" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px] font-semibold" style={{ color: '#4A5568' }}>Citations:</span>
                    {m.citations.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(139,92,246,0.12)', color: '#A78BFA', border: '1px solid rgba(139,92,246,0.25)' }}
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2 p-2 rounded-2xl"
        style={{ background: '#141A27', border: '1px solid rgba(255,255,255,0.08)' }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask why a payment was timed, delayed, or swept..."
          className="flex-1 bg-transparent px-4 py-2 text-xs focus:outline-none"
          style={{ color: '#F0F4FF' }}
        />
        <button
          type="submit"
          disabled={!input.trim()}
          className="p-2.5 rounded-xl text-white transition-all disabled:opacity-30 active:scale-95"
          style={{ background: '#8B5CF6', boxShadow: '0 0 12px rgba(139,92,246,0.3)' }}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
