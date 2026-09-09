import type { CallbackTime, CorrectableField, QuickReply, QuoteStep, ServiceChoice } from "./types";

export const SERVICE_CHOICES: ServiceChoice[] = ["Plumbing", "Heating", "Cooling", "Hot Water", "Other"];
export const CALLBACK_CHOICES: CallbackTime[] = ["Morning", "Afternoon", "Evening", "No preference"];

const CANCEL_WORDS = ["cancel", "nevermind", "never mind", "stop", "forget it"];

export function isCancelWord(text: string): boolean {
  const t = text.trim().toLowerCase();
  return CANCEL_WORDS.includes(t);
}

export function promptForStep(
  step: QuoteStep,
  isEmergency: boolean
): { text: string; quickReplies?: QuickReply[] } {
  switch (step) {
    case "name":
      return {
        text: isEmergency
          ? "I'm sorry to hear that. Let's get this to the team right away — what's your name?"
          : "Great — let's get a few details. What's your name?",
      };
    case "phone":
      return { text: "Thanks! What's the best phone number to reach you at?" };
    case "service":
      return {
        text: "What type of service is this for?",
        quickReplies: SERVICE_CHOICES.map((s) => ({ label: s, value: s })),
      };
    case "description":
      return { text: "Got it. Can you briefly describe the problem or what you need done?" };
    case "callbackTime":
      return {
        text: "When's the best time for the team to call you back?",
        quickReplies: CALLBACK_CHOICES.map((c) => ({ label: c, value: c })),
      };
    default:
      return { text: "" };
  }
}

// Short re-ask used when returning from a tangent (question/correction/skip)
// mid-flow — no "Thanks!"/"Great —" lead-in, since that was already said once.
const BARE_QUESTION: Record<QuoteStep, string> = {
  name: "What's your name?",
  phone: "What's the best phone number to reach you at?",
  service: "What type of service is this for?",
  description: "Can you briefly describe the problem or what you need done?",
  callbackTime: "When's the best time for the team to call you back?",
  submitting: "",
  done: "",
};

export function bridgeBackToStep(step: QuoteStep): { text: string; quickReplies?: QuickReply[] } {
  const { quickReplies } = promptForStep(step, false);
  return { text: BARE_QUESTION[step] ?? "", quickReplies };
}

export function validateName(input: string): { value?: string; error?: string } {
  let trimmed = input.trim();
  const prefixMatch = /^(?:my name is|i am|i'm|it'?s|this is|name is)\s+/i.exec(trimmed);
  if (prefixMatch) trimmed = trimmed.slice(prefixMatch[0].length).trim();
  trimmed = trimmed.replace(/[.!]+$/, "").trim();
  if (trimmed.length < 2) {
    return { error: "Could you share your full name?" };
  }
  return { value: trimmed };
}

export function validatePhone(input: string): { value?: string; error?: string } {
  const trimmed = input.trim();
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 7) {
    return { error: "That doesn't look like a valid phone number — could you double check it?" };
  }
  // Prefer just the number itself over a full sentence like "my number is 613...".
  const digitRun = /(\+?\d[\d \-().]{5,}\d)/.exec(trimmed);
  return { value: digitRun ? digitRun[1].trim() : trimmed };
}

// Keyword-matched only — no greedy catch-all. A step that can't resolve the
// service should re-ask, not silently swallow whatever the user typed.
export function resolveService(input: string): ServiceChoice | undefined {
  const normalized = input.trim().toLowerCase();
  const exact = SERVICE_CHOICES.find((s) => s.toLowerCase() === normalized);
  if (exact) return exact;

  if (/hot\s*water|water\s*heater|tankless/.test(normalized)) return "Hot Water";
  if (/duct|air\s*condition|\bac\b|a\/c|\bcool(ing)?\b/.test(normalized)) return "Cooling";
  if (/furnace|heat\s*pump|boiler|radiant|gas\s*line|gas\s*fitting|\bheating\b/.test(normalized)) return "Heating";
  if (
    /plumb|drain|leak|drip|pipe|burst|clog|faucet|tap|toilet|sink|sewer|backwater|renovat|remodel/.test(
      normalized
    )
  )
    return "Plumbing";
  return undefined;
}

export function resolveCallbackTime(input: string): CallbackTime | undefined {
  const normalized = input.trim().toLowerCase();
  const exact = CALLBACK_CHOICES.find((c) => c.toLowerCase() === normalized);
  if (exact) return exact;

  if (/morn/.test(normalized)) return "Morning";
  if (/after/.test(normalized)) return "Afternoon";
  if (/even|night/.test(normalized)) return "Evening";
  if (/no\s*pref|any|whenever|doesn'?t matter/.test(normalized)) return "No preference";
  return undefined;
}

export function describeDescription(input: string): { value?: string; error?: string } {
  const trimmed = input.trim();
  if (trimmed.length < 3) {
    return { error: "Could you add a bit more detail so the team knows what to expect?" };
  }
  return { value: trimmed };
}

// --- Conversational understanding helpers -------------------------------

const QUESTION_STARTERS =
  /^(do|does|did|can|could|will|would|is|are|what|how|when|where|why|who|which)\b/;

export function looksLikeQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return false;
  if (t.endsWith("?")) return true;
  return QUESTION_STARTERS.test(t);
}

const FILLER_ONLY_WORDS = new Set([
  "yes",
  "yeah",
  "yep",
  "sure",
  "ok",
  "okay",
  "alright",
  "no",
  "nope",
  "continue",
  "go ahead",
  "sounds good",
]);

// A bare acknowledgement/filler word carries no field data — it should never
// be accepted as someone's literal name/phone/description.
export function isFillerOnly(text: string): boolean {
  const t = text.trim().toLowerCase().replace(/[.!]+$/, "");
  return FILLER_ONLY_WORDS.has(t);
}

const AFFIRMATIVE_PATTERN =
  /\b(yes|yeah|yep|sure|ok|okay|alright|go ahead|continue|let'?s do it|sounds good)\b/;
const NEGATIVE_PATTERN =
  /\b(no|nope|not really|rather not|don'?t want to|skip it|never ?mind|no thanks|not now)\b/;

// Only meaningful for short replies — a longer unrelated sentence that
// happens to contain "ok" or "no" as a stray word shouldn't count.
function isShortReply(text: string): boolean {
  return text.trim().split(/\s+/).length <= 6;
}

export function isAffirmative(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!isShortReply(t)) return false;
  return AFFIRMATIVE_PATTERN.test(t) && !NEGATIVE_PATTERN.test(t);
}

export function isNegative(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!isShortReply(t)) return false;
  return NEGATIVE_PATTERN.test(t);
}

const PHONE_REFUSAL_PATTERNS = [
  /\bwithout\b.*\b(phone|number)\b/,
  /\b(phone|number)\b.*\bwithout\b/,
  /don'?t want to (give|provide|share)/,
  /rather not (give|provide|share|say)/,
  /don'?t have a (phone|number)/,
  /do i have to (give|provide|share)/,
  /is (it|that) required/,
  /\bskip (this|it|that|the phone)\b/,
  /not comfortable sharing/,
  /can('|no)?t i (skip|continue)/,
  /can we (just )?continue without/,
];

export function isPhoneRefusal(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (PHONE_REFUSAL_PATTERNS.some((re) => re.test(t))) return true;
  // A bare "no"/"nope"/"skip" is only a refusal in the phone step's context —
  // callers must only invoke this while step === "phone".
  return t === "no" || t === "nope" || t === "skip" || t === "skip this";
}

function cleanCorrectionValue(raw: string): string {
  return raw.trim().replace(/^[,:]\s*/, "").replace(/[.!?]+$/, "").trim();
}

// Recognizes explicit corrections ("my name is actually X", "my number is
// 613...") and, when the most recently collected field is known, bare
// corrections like "actually it's X" / "wait, X".
export function detectCorrection(
  text: string,
  lastCollectedField: CorrectableField | null
): { field: CorrectableField; value: string } | null {
  const t = text.trim();
  const lower = t.toLowerCase();

  const nameMatch = /\bname\s*(?:is|:|=)\s*([a-z][a-z' -]{1,40})/i.exec(t);
  if (nameMatch) {
    const value = cleanCorrectionValue(nameMatch[1]);
    if (value.length >= 2) return { field: "name", value };
  }

  if (/\b(phone|number)\b/.test(lower)) {
    const digitsMatch = /(\d[\d \-().]{5,}\d)/.exec(t);
    if (digitsMatch) return { field: "phone", value: cleanCorrectionValue(digitsMatch[1]) };
  }

  const isTriggered = /^(actually|wait|sorry|correction)\b/.test(lower);
  if (isTriggered && lastCollectedField) {
    const stripped = t
      .replace(/^(actually|wait|sorry|correction)[,:]?\s*/i, "")
      .replace(/^(it'?s|it is)\s*/i, "")
      .trim();
    const value = cleanCorrectionValue(stripped);
    if (!value) return null;

    if (lastCollectedField === "name" && value.length >= 2 && value.length <= 40) {
      return { field: "name", value };
    }
    if (lastCollectedField === "phone" && value.replace(/\D/g, "").length >= 7) {
      return { field: "phone", value };
    }
  }

  return null;
}
