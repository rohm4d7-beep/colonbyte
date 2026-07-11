import { useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import MessageBubble from './MessageBubble';

function EmptyState() {
  const starters = [
    'Explain quantum computing in simple terms',
    'Write a Python script to sort a JSON file',
    'What are the best practices for React hooks?',
    'Help me debug this error message',
  ];

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-[#1e1b4b] border border-violet-800/50 flex items-center justify-center">
          <Bot size={32} className="text-violet-400" />
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-100 mb-2">How can I help you?</h2>
          <p className="text-slate-500 text-sm">Ask me anything — I can code, explain, brainstorm, and more.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
        {starters.map((s) => (
          <button
            key={s}
            className="text-left text-sm text-slate-400 bg-[#1e1e2e] hover:bg-[#252535] border border-white/5 hover:border-violet-700/30 rounded-xl px-4 py-3 transition-colors leading-snug"
            onClick={() => {
              const ev = new CustomEvent('starter-click', { detail: s });
              window.dispatchEvent(ev);
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, streaming }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) return <EmptyState />;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">
        {messages.map((msg, i) => {
          const isLast = i === messages.length - 1;
          const isStreamingThis = streaming && isLast && msg.role === 'assistant';
          return (
            <MessageBubble key={msg.id} message={msg} isStreaming={isStreamingThis} />
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
