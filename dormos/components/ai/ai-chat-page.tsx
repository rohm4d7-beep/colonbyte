'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bot,
  Copy,
  RefreshCw,
  Send,
  Sparkles,
  Pin,
  Search,
  Plus,
  MessageSquare,
  Check,
} from 'lucide-react'
import { PageHeader } from '@/components/shared/page-header'
import { AITabs } from './ai-tabs'
import { AIMarkdown } from './ai-markdown'
import { AI_SUGGESTED_PROMPTS, AI_CONVERSATIONS, AI_MESSAGES_BY_PROMPT, AI_FALLBACK_ANSWER } from '@/lib/mock-data/ai'
import type { AIMessage } from '@/types/enterprise'
import { cn } from '@/lib/utils'

const CONVERSATION_ICON: Record<string, string> = {
  Finance: 'bg-accent text-primary',
  Operations: 'bg-violet-50 text-violet-600',
  Reports: 'bg-amber-50 text-amber-600',
  Mess: 'bg-rose-50 text-rose-600',
  Students: 'bg-emerald-50 text-emerald-600',
}

export function AIChatPage() {
  const [activeConvId, setActiveConvId] = useState('new')
  const [messages, setMessages] = useState<AIMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamText, setStreamText] = useState('')
  const [conversationQuery, setConversationQuery] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const conversations = useMemo(() => {
    const q = conversationQuery.trim().toLowerCase()
    return AI_CONVERSATIONS.filter(
      (c) => c.title.toLowerCase().includes(q) || c.preview.toLowerCase().includes(q),
    ).slice(0, 40)
  }, [conversationQuery])

  const pinnedConversations = useMemo(() => conversations.filter((c) => c.pinned), [conversations])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streamText, isStreaming])

  useEffect(() => {
    return () => {
      if (streamRef.current) clearTimeout(streamRef.current)
    }
  }, [])

  const runStream = useCallback((answer: string, onDone: (text: string) => void) => {
    setIsStreaming(true)
    setStreamText('')
    let idx = 0
    const tick = () => {
      idx += 2 + Math.floor(Math.random() * 4)
      if (idx >= answer.length) {
        setStreamText(answer)
        setIsStreaming(false)
        onDone(answer)
        streamRef.current = null
        return
      }
      setStreamText(answer.slice(0, idx))
      streamRef.current = setTimeout(tick, 14)
    }
    tick()
  }, [])

  const send = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim()
      if (!trimmed || isStreaming) return
      setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', content: trimmed, time: 'Just now' }])
      setInput('')
      const answer = AI_MESSAGES_BY_PROMPT[trimmed]?.answer ?? AI_FALLBACK_ANSWER
      runStream(answer, (text) => {
        setMessages((prev) => [
          ...prev,
          { id: `a-${Date.now()}`, role: 'assistant', content: text, time: 'Just now' },
        ])
      })
    },
    [isStreaming, runStream],
  )

  const regenerate = useCallback(() => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user')
    if (!lastUser || isStreaming) return
    setMessages((prev) => prev.filter((m, i) => !(i === prev.length - 1 && m.role === 'assistant')))
    const answer = AI_MESSAGES_BY_PROMPT[lastUser.content]?.answer ?? AI_FALLBACK_ANSWER
    runStream(answer, (text) => {
      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: 'assistant', content: text, time: 'Just now' },
      ])
    })
  }, [messages, isStreaming, runStream])

  const copyMessage = useCallback(async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch {
      // clipboard unavailable — still flash the check
    }
    setCopied(id)
    setTimeout(() => setCopied(null), 1600)
  }, [])

  const loadConversation = useCallback(
    (id: string) => {
      setActiveConvId(id)
      if (id === 'new') {
        setMessages([])
        return
      }
      const conv = AI_CONVERSATIONS.find((c) => c.id === id)
      if (conv) {
        setMessages([
          { id: `${id}-q`, role: 'user', content: conv.title, time: conv.updated },
          { id: `${id}-a`, role: 'assistant', content: conv.preview, time: conv.updated },
        ])
      }
    },
    [],
  )

  const lastUserPrompt = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="AI Assistant"
        description="Ask questions about your hostel and get instant, data-backed answers."
        icon={Bot}
        crumbs={[{ label: 'AI Assistant' }]}
        actions={
          <>
            <AITabs active="chat" />
            <button
              onClick={() => loadConversation('new')}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-white shadow-sm shadow-primary/30 transition-colors hover:bg-primary/80 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
            >
              <Plus className="h-4 w-4" />
              New chat
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[290px_1fr]">
        {/* Conversation history */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm lg:max-h-[680px]">
          <div className="border-b border-gray-100 p-3">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50/70 px-3 py-2 focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/20">
              <Search className="h-3.5 w-3.5 shrink-0 text-gray-400" />
              <input
                value={conversationQuery}
                onChange={(e) => setConversationQuery(e.target.value)}
                placeholder="Search conversations…"
                aria-label="Search conversations"
                className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {pinnedConversations.length > 0 && (
              <>
                <p className="flex items-center gap-1.5 px-2 pt-1 pb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
                  <Pin className="h-3 w-3" /> Pinned
                </p>
                {pinnedConversations.map((conv) => (
                  <ConversationRow
                    key={conv.id}
                    title={conv.title}
                    preview={conv.preview}
                    updated={conv.updated}
                    active={activeConvId === conv.id}
                    onSelect={() => loadConversation(conv.id)}
                    pinned
                  />
                ))}
              </>
            )}

            <p className="flex items-center gap-1.5 px-2 pt-2 pb-1.5 text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              <MessageSquare className="h-3 w-3" /> Recent
            </p>
            {conversations
              .filter((c) => !c.pinned)
              .map((conv) => (
                <ConversationRow
                  key={conv.id}
                  title={conv.title}
                  preview={conv.preview}
                  updated={conv.updated}
                  active={activeConvId === conv.id}
                  onSelect={() => loadConversation(conv.id)}
                />
              ))}
            {conversations.length === 0 && (
              <p className="px-3 py-8 text-center text-xs text-gray-400">No conversations match your search.</p>
            )}
          </div>
        </div>

        {/* Chat window */}
        <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200/70 bg-white shadow-sm">
          {/* Chat header */}
          <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-3.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/30">
              <Bot className="h-4 w-4 text-white" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-900">
                {activeConvId === 'new' ? 'New conversation' : AI_CONVERSATIONS.find((c) => c.id === activeConvId)?.title ?? 'Conversation'}
              </p>
              <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                DormOS Intelligence · v2.4
              </p>
            </div>
            <span className="hidden items-center gap-1 rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-500 sm:flex">
              <Sparkles className="h-3 w-3 text-primary" />
              Context: Sunrise Hostel
            </span>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex max-h-[520px] min-h-[420px] flex-1 flex-col gap-4 overflow-y-auto px-5 py-5">
            {messages.length === 0 && !isStreaming ? (
              <EmptyChat onPrompt={(p) => send(p)} />
            ) : (
              <>
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onCopy={() => copyMessage(message.id, message.content)}
                    copied={copied === message.id}
                    onRegenerate={regenerate}
                    canRegenerate={message.role === 'assistant' && message.id === messages[messages.length - 1].id}
                    isStreaming={message.id === messages[messages.length - 1].id && isStreaming}
                  />
                ))}
                {isStreaming && messages[messages.length - 1].role === 'user' && (
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/30">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-gray-200/70 bg-gray-50/50 px-4 py-3">
                      <AIMarkdown content={streamText} />
                      {streamText.length < (AI_MESSAGES_BY_PROMPT[lastUserPrompt]?.answer ?? AI_FALLBACK_ANSWER).length - 2 && (
                        <span className="mt-1 inline-block">
                          <BlinkingCursor />
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50/70 px-3 py-2 transition-colors focus-within:border-primary/50 focus-within:ring-3 focus-within:ring-primary/20"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about payments, occupancy, reports, mess…"
                aria-label="Ask the AI assistant"
                className="w-full bg-transparent text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!input.trim() || isStreaming}
                aria-label="Send message"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/80 disabled:opacity-40 focus-visible:ring-3 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-gray-400">
              AI may make mistakes. Verify important figures before acting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function BlinkingCursor() {
  return <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse rounded bg-primary align-middle" />
}

function ConversationRow({
  title,
  preview,
  updated,
  active,
  onSelect,
  pinned,
}: {
  title: string
  preview: string
  updated: string
  active: boolean
  onSelect: () => void
  pinned?: boolean
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        'group flex w-full items-start gap-2.5 rounded-xl px-2 py-2 text-left transition-colors focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none',
        active ? 'bg-accent/70' : 'hover:bg-gray-50',
      )}
    >
      <span
        className={cn(
          'mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
          active ? 'bg-accent text-primary' : 'bg-gray-100 text-gray-400',
        )}
      >
        {pinned ? <Pin className="h-3.5 w-3.5" /> : <MessageSquare className="h-3.5 w-3.5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className={cn('truncate text-[13px] font-medium', active ? 'text-primary' : 'text-gray-800')}>
            {title}
          </span>
          <span className="shrink-0 text-[10px] text-gray-400">{updated.slice(5)}</span>
        </span>
        <span className="block truncate text-xs text-gray-400">{preview}</span>
      </span>
    </button>
  )
}

function ChatBubble({
  message,
  onCopy,
  copied,
  onRegenerate,
  canRegenerate,
  isStreaming,
}: {
  message: AIMessage
  onCopy: () => void
  copied: boolean
  onRegenerate: () => void
  canRegenerate: boolean
  isStreaming: boolean
}) {
  const isUser = message.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-semibold text-white',
          isUser ? 'bg-gray-800' : 'bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/30',
        )}
      >
        {isUser ? 'R' : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn('min-w-0 max-w-[85%]', isUser && 'text-right')}>
        <div
          className={cn(
            'inline-block rounded-2xl px-4 py-3 text-left',
            isUser ? 'rounded-tr-sm bg-primary text-white' : 'rounded-tl-sm border border-gray-200/70 bg-gray-50/50',
          )}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed">{message.content}</p>
          ) : (
            <AIMarkdown content={message.content} />
          )}
          {isStreaming && <span className="mt-1 inline-block"><BlinkingCursor /></span>}
        </div>
        <div className={cn('mt-1.5 flex items-center gap-2', isUser ? 'justify-end' : 'justify-start')}>
          <span className="text-[10px] text-gray-400">{message.time}</span>
          {!isUser && (
            <div className="flex items-center gap-1">
              <button
                onClick={onCopy}
                aria-label="Copy response"
                className="flex h-6 w-6 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
              {canRegenerate && (
                <button
                  onClick={onRegenerate}
                  aria-label="Regenerate response"
                  className="flex h-6 items-center gap-1 rounded-md px-1.5 text-[11px] font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none"
                >
                  <RefreshCw className="h-3 w-3" />
                  Regenerate
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

function EmptyChat({ onPrompt }: { onPrompt: (prompt: string) => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
      <div className="text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-violet-500 shadow-lg shadow-primary/30">
          <Bot className="h-7 w-7 text-white" />
        </div>
        <h3 className="text-base font-semibold text-gray-900">What can I help you with?</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-gray-400">
          Ask about payments, occupancy, reports, mess expenses and more — answered instantly from your hostel data.
        </p>
      </div>
      <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        <AnimatePresence>
          {AI_SUGGESTED_PROMPTS.map((suggestion, i) => {
            const Icon = suggestion.icon
            return (
              <motion.button
                key={suggestion.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                onClick={() => onPrompt(suggestion.prompt)}
                className="group flex items-center gap-3 rounded-xl border border-gray-200/70 bg-white px-3.5 py-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md focus-visible:ring-3 focus-visible:ring-primary/30 focus-visible:outline-none"
              >
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', CONVERSATION_ICON[suggestion.category])}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[13px] font-medium text-gray-700 group-hover:text-gray-900">
                  {suggestion.label}
                </span>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
