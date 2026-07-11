import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check, Bot, User } from 'lucide-react';
import TypingIndicator from './TypingIndicator';

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-md text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-colors"
      title="Copy message"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

function CodeBlock({ children, className }) {
  const [copied, setCopied] = useState(false);
  const lang = className?.replace('language-', '') ?? '';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(children));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0f0f1a] border-b border-white/10">
        <span className="text-xs text-slate-500 font-mono">{lang || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-slate-500 hover:text-slate-300 flex items-center gap-1 transition-colors"
        >
          {copied ? <><Check size={12} className="text-green-400" /> Copied</> : <><Copy size={12} /> Copy</>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed bg-[#0f0f1a]">
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}

export default function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === 'user';
  const isEmpty = !message.content && !isStreaming;

  const time = new Date(message.ts).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`group flex gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm ${
          isUser
            ? 'bg-accent text-white'
            : 'bg-[#1e1b4b] text-violet-400 border border-violet-800/50'
        }`}
      >
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
            isUser
              ? 'bg-accent text-white rounded-tr-sm'
              : 'bg-[#1e1e2e] text-slate-200 border border-white/5 rounded-tl-sm'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{message.content}</p>
          ) : isEmpty ? (
            <TypingIndicator />
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-pre:my-0 prose-pre:bg-transparent prose-pre:p-0">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ inline, className, children }) {
                    if (inline) {
                      return (
                        <code className="text-violet-300 bg-[#1e1b4b] px-1.5 py-0.5 rounded text-xs font-mono">
                          {children}
                        </code>
                      );
                    }
                    return <CodeBlock className={className}>{children}</CodeBlock>;
                  },
                  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-4 my-2 space-y-1">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-4 my-2 space-y-1">{children}</ol>,
                  li: ({ children }) => <li className="text-slate-200">{children}</li>,
                  a: ({ href, children }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:underline">
                      {children}
                    </a>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-2 border-violet-500 pl-3 my-2 text-slate-400 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {message.content}
              </ReactMarkdown>
              {isStreaming && (
                <span className="inline-block w-0.5 h-4 bg-violet-400 ml-0.5 animate-blink align-text-bottom" />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs text-slate-600">{time}</span>
          {message.content && <CopyButton text={message.content} />}
        </div>
      </div>
    </div>
  );
}
