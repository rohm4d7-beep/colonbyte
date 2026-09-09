import { classifyMessage, isTangentIntent } from "./chatEngine";
import {
  describeDescription,
  detectCorrection,
  isCancelWord,
  isFillerOnly,
  isPhoneRefusal,
  looksLikeQuestion,
  resolveCallbackTime,
  resolveService,
  validateName,
  validatePhone,
} from "./quoteFlow";
import type { CallbackTime, CorrectableField, QuoteStep, ServiceChoice } from "./types";

export type FlowAction =
  | { type: "cancel" }
  | { type: "correction"; field: CorrectableField; value: string }
  | { type: "phoneRefusal" }
  | { type: "tangent"; answerText: string; markEmergency: boolean }
  | { type: "filler" }
  | { type: "fieldError"; message: string }
  | { type: "nameValue"; value: string }
  | { type: "phoneValue"; value: string }
  | { type: "serviceValue"; value: ServiceChoice }
  | { type: "descriptionValue"; value: string; markEmergency: boolean }
  | { type: "callbackValue"; value: CallbackTime };

const STEPS_WITH_UNIVERSAL_TANGENT_CHECK: QuoteStep[] = ["name", "phone", "callbackTime"];

function tangentFromText(text: string): FlowAction | null {
  const classified = classifyMessage(text);
  if (isTangentIntent(classified.intent)) {
    return { type: "tangent", answerText: classified.text, markEmergency: classified.intent === "emergency" };
  }
  return null;
}

/**
 * Decides what a message means during an active quote/request flow, before
 * any field-specific validation runs. This is the fix for the core bug: the
 * old code ran every mid-flow message straight through the current step's
 * validator, so a question, refusal, or correction got misread as a bad
 * attempt at that field instead of being understood on its own terms.
 */
export function interpretFlowMessage(
  text: string,
  step: QuoteStep,
  lastCollectedField: CorrectableField | null
): FlowAction {
  if (isCancelWord(text)) return { type: "cancel" };

  // A correction only makes sense about a field that isn't the one currently
  // being asked — "my number is 613..." while AT the phone step is just the
  // normal answer, not a correction of an earlier one.
  const correction = detectCorrection(text, lastCollectedField);
  if (correction && correction.field !== step) {
    return { type: "correction", field: correction.field, value: correction.value };
  }

  if (step === "phone" && isPhoneRefusal(text)) return { type: "phoneRefusal" };

  if (STEPS_WITH_UNIVERSAL_TANGENT_CHECK.includes(step)) {
    if (isFillerOnly(text)) return { type: "filler" };
    const classified = classifyMessage(text);
    if (isTangentIntent(classified.intent)) {
      return { type: "tangent", answerText: classified.text, markEmergency: classified.intent === "emergency" };
    }
    // Already inside a request flow — "get a quote" / "hi" here are noise,
    // not a fresh trigger or a literal field value.
    if (classified.intent === "quoteRequest" || classified.intent === "greeting") {
      return { type: "filler" };
    }
  }

  // Service/description answers legitimately contain business keywords
  // ("my basement is flooding" as a description, "leaking faucet" as a
  // service) — only treat these as an interruption when clearly phrased as
  // a question, not just because of keyword overlap.
  if ((step === "service" || step === "description") && looksLikeQuestion(text)) {
    const tangent = tangentFromText(text);
    if (tangent) return tangent;
  }

  switch (step) {
    case "name": {
      const { value, error } = validateName(text);
      if (error) return { type: "fieldError", message: error };
      return { type: "nameValue", value: value! };
    }

    case "phone": {
      const { value, error } = validatePhone(text);
      if (error) return { type: "fieldError", message: error };
      return { type: "phoneValue", value: value! };
    }

    case "service": {
      const service = resolveService(text);
      if (service) return { type: "serviceValue", value: service };
      const tangent = tangentFromText(text);
      if (tangent) return tangent;
      return {
        type: "fieldError",
        message: "Which service is this for — Plumbing, Heating, Cooling, Hot Water, or Other?",
      };
    }

    case "description": {
      const { value, error } = describeDescription(text);
      if (error) return { type: "fieldError", message: error };
      const markEmergency = classifyMessage(text).intent === "emergency";
      return { type: "descriptionValue", value: value!, markEmergency };
    }

    case "callbackTime": {
      const callbackTime = resolveCallbackTime(text);
      if (callbackTime) return { type: "callbackValue", value: callbackTime };
      return {
        type: "fieldError",
        message: "Would mornings, afternoons, evenings, or no preference work best?",
      };
    }

    default:
      return { type: "fieldError", message: "" };
  }
}
