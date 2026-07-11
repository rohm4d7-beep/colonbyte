import { useState, useCallback, useRef, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { streamChat } from '../utils/api';
import { loadConversations, saveConversations } from '../utils/storage';

function newConversation() {
  return { id: uuid(), title: 'New Chat', messages: [], createdAt: Date.now() };
}

export function useChat() {
  const [conversations, setConversations] = useState(() => {
    const saved = loadConversations();
    return saved.length ? saved : [newConversation()];
  });
  const [activeId, setActiveId] = useState(() => {
    const saved = loadConversations();
    return saved.length ? saved[0].id : conversations[0]?.id;
  });
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];

  useEffect(() => {
    saveConversations(conversations);
  }, [conversations]);

  const updateConversation = useCallback((id, updater) => {
    setConversations((prev) => prev.map((c) => (c.id === id ? updater(c) : c)));
  }, []);

  const deriveTitle = (content) =>
    content.slice(0, 48).replace(/\s+/g, ' ').trim() + (content.length > 48 ? '…' : '');

  const sendMessage = useCallback(
    async (text) => {
      if (!text.trim() || streaming) return;

      setError(null);
      const userMsg = { id: uuid(), role: 'user', content: text, ts: Date.now() };
      const assistantId = uuid();
      const assistantMsg = { id: assistantId, role: 'assistant', content: '', ts: Date.now() };

      updateConversation(active.id, (c) => ({
        ...c,
        title: c.messages.length === 0 ? deriveTitle(text) : c.title,
        messages: [...c.messages, userMsg, assistantMsg],
      }));

      setStreaming(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const apiMessages = [
        ...active.messages.map(({ role, content }) => ({ role, content })),
        { role: 'user', content: text },
      ];

      try {
        await streamChat(apiMessages, {
          signal: controller.signal,
          onChunk: (chunk) => {
            updateConversation(active.id, (c) => ({
              ...c,
              messages: c.messages.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m
              ),
            }));
          },
          onDone: () => setStreaming(false),
          onError: (msg) => {
            setError(msg);
            updateConversation(active.id, (c) => ({
              ...c,
              messages: c.messages.filter((m) => m.id !== assistantId),
            }));
            setStreaming(false);
          },
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError('Connection lost. Please try again.');
          updateConversation(active.id, (c) => ({
            ...c,
            messages: c.messages.filter((m) => m.id !== assistantId),
          }));
        }
        setStreaming(false);
      }
    },
    [active, streaming, updateConversation]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const startNewChat = useCallback(() => {
    const conv = newConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setError(null);
  }, []);

  const deleteConversation = useCallback(
    (id) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (next.length === 0) {
          const fresh = newConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (id === activeId) setActiveId(next[0].id);
        return next;
      });
    },
    [activeId]
  );

  const selectConversation = useCallback((id) => {
    setActiveId(id);
    setError(null);
  }, []);

  return {
    conversations,
    active,
    streaming,
    error,
    sendMessage,
    stopStreaming,
    startNewChat,
    deleteConversation,
    selectConversation,
    clearError: () => setError(null),
  };
}
