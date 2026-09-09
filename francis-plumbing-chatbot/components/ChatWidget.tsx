"use client";

import { useEffect, useRef, useState } from "react";
import { classifyMessage } from "@/lib/chatEngine";
import {
  BUSINESS_NAME,
  SUBMIT_ERROR_RESPONSE,
  confirmationResponse,
} from "@/lib/businessData";
import { OPEN_CHAT_EVENT } from "@/lib/chatEvents";
import { interpretFlowMessage } from "@/lib/conversationEngine";
import {
  bridgeBackToStep,
  isAffirmative,
  isNegative,
  promptForStep,
} from "@/lib/quoteFlow";
import type { ChatMessage, CorrectableField, QuoteDraft, QuoteStep } from "@/lib/types";
import { ChatBubbleIcon, CloseIcon, SendIcon } from "./icons";
import { MessageBubble } from "./MessageBubble";

const QUICK_ACTIONS = [
  { label: "Get a quote", value: "Get a quote" },
  { label: "Emergency plumbing", value: "Emergency plumbing" },
  { label: "Ask about services", value: "Ask about services" },
  { label: "Service area", value: "Service area" },
  { label: "Pricing", value: "Pricing" },
];

function makeId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function initialMessages(): ChatMessage[] {
  return [
    {
      id: makeId(),
      role: "bot",
      text: "Hi! How can we help today?",
      quickReplies: QUICK_ACTIONS,
    },
  ];
}

type PendingCta = { action: "startQuote" | "startEmergencyQuote"; label: string } | null;

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [step, setStep] = useState<QuoteStep | "idle">("idle");
  const [draft, setDraft] = useState<QuoteDraft>({ isEmergency: false });
  const [lastCollectedField, setLastCollectedField] = useState<CorrectableField | null>(null);
  const [pendingCta, setPendingCta] = useState<PendingCta>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(OPEN_CHAT_EVENT, handler);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, handler);
  }, []);

  useEffect(() => {
    if (open) {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [messages, open]);

  function pushBot(text: string, quickReplies?: ChatMessage["quickReplies"], isError = false) {
    setMessages((prev) => [...prev, { id: makeId(), role: "bot", text, quickReplies, isError }]);
  }

  function pushUser(text: string) {
    setMessages((prev) => [...prev, { id: makeId(), role: "user", text }]);
  }

  function startQuoteFlow(isEmergency: boolean) {
    setDraft({ isEmergency });
    setLastCollectedField(null);
    setPendingCta(null);
    setStep("name");
    const prompt = promptForStep("name", isEmergency);
    pushBot(prompt.text, prompt.quickReplies);
  }

  async function submitLead(finalDraft: QuoteDraft) {
    setStep("submitting");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: finalDraft.name,
          phone: finalDraft.phone ?? null,
          service: finalDraft.service,
          description: finalDraft.description,
          preferredCallbackTime: finalDraft.preferredCallbackTime ?? "No preference",
          isEmergency: finalDraft.isEmergency,
        }),
      });

      if (!res.ok) throw new Error("submit failed");

      pushBot(confirmationResponse(finalDraft.name ?? "there", finalDraft.isEmergency, Boolean(finalDraft.phone)));
    } catch {
      pushBot(SUBMIT_ERROR_RESPONSE, undefined, true);
    } finally {
      setStep("idle");
      setDraft({ isEmergency: false });
      setLastCollectedField(null);
    }
  }

  function advanceQuoteFlow(rawInput: string) {
    const text = rawInput.trim();
    const action = interpretFlowMessage(text, step as QuoteStep, lastCollectedField);

    switch (action.type) {
      case "cancel": {
        setStep("idle");
        setDraft({ isEmergency: false });
        setLastCollectedField(null);
        pushBot("No problem — let me know if you need anything else.", QUICK_ACTIONS);
        return;
      }

      case "correction": {
        const nextDraft = { ...draft, [action.field]: action.value };
        setDraft(nextDraft);
        const bridge = bridgeBackToStep(step as QuoteStep);
        const fieldLabel = action.field === "name" ? "name" : "phone number";
        pushBot(`Got it — I've updated your ${fieldLabel} to ${action.value}.\n\n${bridge.text}`, bridge.quickReplies);
        return;
      }

      case "phoneRefusal": {
        const nextDraft = { ...draft, phone: undefined };
        setDraft(nextDraft);
        setStep("service");
        const prompt = promptForStep("service", nextDraft.isEmergency);
        pushBot(
          `A phone number helps the Francis team follow up on your request, but you can continue without providing one.\n\n${prompt.text}`,
          prompt.quickReplies
        );
        return;
      }

      case "tangent": {
        if (action.markEmergency && !draft.isEmergency) {
          setDraft((d) => ({ ...d, isEmergency: true }));
        }
        const bridge = bridgeBackToStep(step as QuoteStep);
        pushBot(`${action.answerText}\n\n${bridge.text}`, bridge.quickReplies);
        return;
      }

      case "filler": {
        const bridge = bridgeBackToStep(step as QuoteStep);
        pushBot(`Sure — ${bridge.text}`, bridge.quickReplies);
        return;
      }

      case "fieldError": {
        pushBot(action.message);
        return;
      }

      case "nameValue": {
        const nextDraft = { ...draft, name: action.value };
        setDraft(nextDraft);
        setLastCollectedField("name");
        setStep("phone");
        const prompt = promptForStep("phone", nextDraft.isEmergency);
        pushBot(prompt.text, prompt.quickReplies);
        return;
      }

      case "phoneValue": {
        const nextDraft = { ...draft, phone: action.value };
        setDraft(nextDraft);
        setLastCollectedField("phone");
        setStep("service");
        const prompt = promptForStep("service", nextDraft.isEmergency);
        pushBot(prompt.text, prompt.quickReplies);
        return;
      }

      case "serviceValue": {
        const nextDraft = { ...draft, service: action.value };
        setDraft(nextDraft);
        setStep("description");
        const prompt = promptForStep("description", nextDraft.isEmergency);
        pushBot(prompt.text, prompt.quickReplies);
        return;
      }

      case "descriptionValue": {
        const nextDraft = {
          ...draft,
          description: action.value,
          isEmergency: draft.isEmergency || action.markEmergency,
        };
        setDraft(nextDraft);
        setStep("callbackTime");
        const prompt = promptForStep("callbackTime", nextDraft.isEmergency);
        pushBot(prompt.text, prompt.quickReplies);
        return;
      }

      case "callbackValue": {
        const nextDraft = { ...draft, preferredCallbackTime: action.value };
        setDraft(nextDraft);
        void submitLead(nextDraft);
        return;
      }
    }
  }

  function handleUserText(rawText: string) {
    const text = rawText.trim();
    if (!text) return;
    pushUser(text);

    if (step !== "idle" && step !== "submitting") {
      advanceQuoteFlow(text);
      return;
    }

    // At idle, a bot message may have just offered a CTA ("Request a
    // quote" / "Request emergency service"). A typed "yeah sure" or "no
    // thanks" should be understood as answering that offer, not routed
    // through the general classifier.
    if (pendingCta) {
      if (isAffirmative(text)) {
        const cta = pendingCta;
        setPendingCta(null);
        startQuoteFlow(cta.action === "startEmergencyQuote");
        return;
      }
      if (isNegative(text)) {
        setPendingCta(null);
        pushBot("No problem — let me know if you'd like to get a quote later.", QUICK_ACTIONS);
        return;
      }
      setPendingCta(null);
    }

    const result = classifyMessage(text);
    if (result.intent === "quoteRequest") {
      startQuoteFlow(false);
      return;
    }
    if (result.cta) {
      setPendingCta({ action: result.cta.action, label: result.cta.label });
      pushBot(result.text, [
        { label: result.cta.label, value: result.cta.action, variant: "primary" },
      ]);
      return;
    }
    setPendingCta(null);
    pushBot(result.text);
  }

  function handleQuickReply(label: string, value: string) {
    if (value === "startQuote") {
      pushUser(label);
      setPendingCta(null);
      startQuoteFlow(false);
      return;
    }
    if (value === "startEmergencyQuote") {
      pushUser(label);
      setPendingCta(null);
      startQuoteFlow(true);
      return;
    }
    // Quick-action chips and in-flow option buttons carry their own value text.
    handleUserText(value);
  }

  function handleSubmitInput(e: React.FormEvent) {
    e.preventDefault();
    const text = input;
    setInput("");
    handleUserText(text);
  }

  return (
    <>
      {/* Hidden on mobile: the sticky Book/Call/Chat bar is the entry point there instead,
          so a second bubble stacked on top of it would be a redundant, overlapping control. */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open chat"}
        className="fixed bottom-5 right-5 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-francis-green-dark text-francis-gold shadow-lg ring-2 ring-francis-gold/40 hover:ring-francis-gold transition-all sm:flex"
      >
        {open ? <CloseIcon className="h-6 w-6" /> : <ChatBubbleIcon className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[min(600px,calc(100vh-140px))] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-francis-green-dark/10 bg-francis-cream shadow-2xl francis-fade-up max-sm:inset-x-4 max-sm:bottom-[4.5rem] max-sm:w-auto">
          <div className="flex items-center justify-between bg-francis-green-dark px-4 py-3.5">
            <div>
              <p className="font-heading font-bold text-francis-gold text-sm">{BUSINESS_NAME}</p>
              <p className="text-[11px] text-francis-gold-light/80">Usually replies in a few minutes</p>
            </div>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="text-francis-gold-light/70 hover:text-francis-gold"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} onQuickReply={handleQuickReply} />
            ))}
            {step === "submitting" && (
              <div className="text-xs text-francis-text-muted px-1">Sending your request…</div>
            )}
          </div>

          <form onSubmit={handleSubmitInput} className="flex items-center gap-2 border-t border-francis-green-dark/10 bg-white px-3 py-3">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              className="flex-1 rounded-full border border-francis-green-dark/15 bg-francis-cream px-4 py-2 text-sm text-francis-green-dark placeholder:text-francis-text-muted/60 focus:outline-none focus:ring-2 focus:ring-francis-gold/50"
            />
            <button
              type="submit"
              aria-label="Send"
              disabled={!input.trim() || step === "submitting"}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-francis-green-dark text-francis-gold disabled:opacity-40"
            >
              <SendIcon className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
