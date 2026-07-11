import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import { useChat } from './hooks/useChat';

export default function App() {
  const {
    conversations,
    active,
    streaming,
    error,
    sendMessage,
    stopStreaming,
    startNewChat,
    deleteConversation,
    selectConversation,
    clearError,
  } = useChat();

  return (
    <div className="flex h-screen bg-[#13131f] text-slate-200 overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeId={active?.id}
        onSelect={selectConversation}
        onNew={startNewChat}
        onDelete={deleteConversation}
      />

      <div className="flex flex-col flex-1 min-w-0">
        <header className="flex items-center justify-between px-6 py-3.5 border-b border-white/5 bg-[#13131f]">
          <h1 className="text-sm font-medium text-slate-300 truncate">
            {active?.title || 'New Chat'}
          </h1>
          <div className="flex items-center gap-2">
            {streaming && (
              <span className="text-xs text-violet-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                Generating
              </span>
            )}
          </div>
        </header>

        <ChatWindow messages={active?.messages ?? []} streaming={streaming} />

        <InputBar
          onSend={sendMessage}
          onStop={stopStreaming}
          streaming={streaming}
          error={error}
          onClearError={clearError}
        />
      </div>
    </div>
  );
}
