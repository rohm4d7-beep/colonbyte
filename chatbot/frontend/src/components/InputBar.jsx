import { useState, useRef, useEffect } from 'react';
import { Send, Square, AlertCircle, X } from 'lucide-react';

export default function InputBar({ onSend, onStop, streaming, error, onClearError }) {
  const [value, setValue] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      setValue(e.detail);
      textareaRef.current?.focus();
    };
    window.addEventListener('starter-click', handler);
    return () => window.removeEventListener('starter-click', handler);
  }, []);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }, [value]);

  const handleSend = () => {
    const text = value.trim();
    if (!text || streaming) return;
    onSend(text);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-white/5 bg-[#13131f] px-4 py-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-2">
        {error && (
          <div className="flex items-start gap-2 text-red-400 bg-red-950/30 border border-red-800/30 rounded-xl px-3 py-2.5 text-sm animate-fade-in">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={onClearError} className="hover:text-red-300 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        <div className="flex items-end gap-3 bg-[#1e1e2e] border border-white/5 rounded-2xl px-4 py-3 focus-within:border-violet-700/50 transition-colors">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message AI..."
            rows={1}
            disabled={streaming}
            className="flex-1 bg-transparent text-slate-200 placeholder-slate-600 text-sm resize-none outline-none leading-6 max-h-[200px] scrollbar-hide disabled:opacity-50"
          />

          {streaming ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors"
              title="Stop generating"
            >
              <Square size={14} fill="white" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!value.trim()}
              className="flex-shrink-0 w-8 h-8 rounded-lg bg-accent hover:bg-accent-hover flex items-center justify-center text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send size={14} />
            </button>
          )}
        </div>

        <p className="text-center text-xs text-slate-700">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
