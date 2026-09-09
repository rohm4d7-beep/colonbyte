"use client";

import { BUSINESS_PHONE_TEL } from "@/lib/businessData";
import { OPEN_CHAT_EVENT } from "@/lib/chatEvents";
import { CalendarIcon, ChatBubbleIcon, PhoneIcon } from "./icons";

export function StickyCtaBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-30 grid grid-cols-3 sm:hidden">
      <button className="flex items-center justify-center gap-1.5 bg-francis-red py-3 text-sm font-semibold text-white">
        <CalendarIcon className="h-4 w-4" />
        Book
      </button>
      <a
        href={`tel:${BUSINESS_PHONE_TEL}`}
        className="flex items-center justify-center gap-1.5 bg-francis-call-green py-3 text-sm font-semibold text-white"
      >
        <PhoneIcon className="h-4 w-4" />
        Call
      </a>
      <button
        onClick={() => window.dispatchEvent(new Event(OPEN_CHAT_EVENT))}
        className="flex items-center justify-center gap-1.5 bg-francis-blue py-3 text-sm font-semibold text-white"
      >
        <ChatBubbleIcon className="h-4 w-4" />
        Chat
      </button>
    </div>
  );
}
