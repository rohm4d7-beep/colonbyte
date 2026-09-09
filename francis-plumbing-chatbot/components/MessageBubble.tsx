import type { ChatMessage } from "@/lib/types";

export function MessageBubble({
  message,
  onQuickReply,
}: {
  message: ChatMessage;
  onQuickReply: (label: string, value: string) => void;
}) {
  const isBot = message.role === "bot";

  return (
    <div className={`francis-fade-up flex flex-col gap-2 ${isBot ? "items-start" : "items-end"}`}>
      <div
        className={[
          "max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line",
          isBot
            ? message.isError
              ? "bg-francis-red/10 text-francis-red border border-francis-red/30 rounded-tl-sm"
              : "bg-white text-francis-green-dark border border-francis-green-dark/10 rounded-tl-sm shadow-sm"
            : "bg-francis-green-dark text-francis-cream rounded-tr-sm",
        ].join(" ")}
      >
        {message.text}
      </div>

      {message.quickReplies && message.quickReplies.length > 0 && (
        <div className="flex flex-wrap gap-2 max-w-[90%]">
          {message.quickReplies.map((qr) => (
            <button
              key={qr.label}
              onClick={() => onQuickReply(qr.label, qr.value)}
              className={
                qr.variant === "primary"
                  ? "rounded-full bg-francis-red px-4 py-2 text-xs font-semibold text-white hover:bg-francis-red/90 transition-colors"
                  : "rounded-full border border-francis-green-dark/20 bg-white px-3.5 py-1.5 text-xs font-medium text-francis-green-dark hover:border-francis-gold hover:bg-francis-gold-light/20 transition-colors"
              }
            >
              {qr.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
