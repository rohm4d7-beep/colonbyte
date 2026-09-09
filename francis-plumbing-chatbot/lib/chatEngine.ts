import {
  EMERGENCY_RESPONSE,
  FALLBACK_RESPONSE,
  PRICING_RESPONSE,
  SERVICES,
  SERVICE_AREAS,
  UNKNOWN_LOCATION_RESPONSE,
} from "./businessData";

export type Intent =
  | "greeting"
  | "pricing"
  | "serviceArea"
  | "emergency"
  | "serviceQuestion"
  | "quoteRequest"
  | "fallback";

export interface IntentResult {
  intent: Intent;
  text: string;
  cta?: { label: string; action: "startQuote" | "startEmergencyQuote" };
}

// Intents worth answering as a side-question mid-flow (pricing, coverage,
// service info, emergency). "quoteRequest", "greeting" and "fallback" are
// deliberately excluded — they either don't make sense as an interruption
// mid-flow or are the signal that a message probably IS the field answer.
const TANGENT_INTENTS: Intent[] = ["pricing", "serviceArea", "emergency", "serviceQuestion"];

export function isTangentIntent(intent: Intent): boolean {
  return TANGENT_INTENTS.includes(intent);
}

const EMERGENCY_KEYWORDS = [
  "flood",
  "flooding",
  "flooded",
  "burst pipe",
  "burst",
  "emergency",
  "urgent",
  "urgently",
  "asap",
  "no heat",
  "no water",
  "gas smell",
  "smell gas",
  "sewage",
  "sewage backup",
  "water everywhere",
  "basement is flooding",
];

const PRICING_KEYWORDS = [
  "price",
  "prices",
  "pricing",
  "cost",
  "costs",
  "how much",
  "charge",
  "charges",
  "rate",
  "rates",
  "expensive",
];

const SERVICE_AREA_TRIGGERS = [
  "service area",
  "service ottawa",
  "do you service",
  "do you cover",
  "do you come to",
  "are you available in",
  "you serve",
  "you cover",
  "coverage area",
  "postal code",
  "zip code",
];

const GREETING_KEYWORDS = ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"];

const SERVICES_OVERVIEW_TRIGGERS = [
  "ask about services",
  "what services",
  "what do you offer",
  "do you offer",
  "services do you offer",
  "what kind of services",
  "what can you help",
];

const SERVICES_OVERVIEW_RESPONSE = [
  "We handle three main areas:",
  "",
  "• Plumbing — drainage, leak repair, backwater valves, renovations, emergency plumbing",
  "• Heating & Heat Pumps — furnaces, heat pumps, boilers, radiant systems, gas lines",
  "• Cooling & Hot Water — air conditioners, duct cleaning, hot water systems",
  "",
  "What would you like to know more about?",
].join("\n");

const QUOTE_TRIGGERS = [
  "get a quote",
  "request a quote",
  "request service",
  "book a service",
  "book an appointment",
  "schedule",
  "want a quote",
  "need a quote",
  "sign me up",
];

function normalize(text: string): string {
  return text.toLowerCase().trim();
}

function includesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => haystack.includes(n));
}

function findServiceArea(haystack: string): string | undefined {
  return SERVICE_AREAS.find((area) => haystack.includes(area.toLowerCase()));
}

function findServiceMatch(haystack: string) {
  for (const category of Object.values(SERVICES)) {
    for (const item of category.items) {
      if (includesAny(haystack, item.keywords)) {
        return item;
      }
    }
  }
  return undefined;
}

export function classifyMessage(raw: string): IntentResult {
  const text = normalize(raw);

  // Emergency takes priority over everything else.
  if (includesAny(text, EMERGENCY_KEYWORDS)) {
    return {
      intent: "emergency",
      text: EMERGENCY_RESPONSE,
      cta: { label: "Request emergency service", action: "startEmergencyQuote" },
    };
  }

  // Explicit request to start a quote/booking.
  if (includesAny(text, QUOTE_TRIGGERS)) {
    return {
      intent: "quoteRequest",
      text: "Happy to help. Let's get a few details so the team can follow up with you.",
      cta: { label: "Start request", action: "startQuote" },
    };
  }

  if (includesAny(text, SERVICE_AREA_TRIGGERS)) {
    const area = findServiceArea(text);
    if (area) {
      return {
        intent: "serviceArea",
        text: `Yes, we serve ${area} and the surrounding Ottawa area.`,
      };
    }
    return { intent: "serviceArea", text: UNKNOWN_LOCATION_RESPONSE };
  }

  // A bare area name mentioned without a trigger phrase, e.g. "Barrhaven?"
  const bareArea = findServiceArea(text);
  if (bareArea && text.length < 40) {
    return {
      intent: "serviceArea",
      text: `Yes, we serve ${bareArea} and the surrounding Ottawa area.`,
    };
  }

  if (includesAny(text, PRICING_KEYWORDS)) {
    return {
      intent: "pricing",
      text: PRICING_RESPONSE,
      cta: { label: "Request a quote", action: "startQuote" },
    };
  }

  const serviceMatch = findServiceMatch(text);
  if (serviceMatch) {
    return { intent: "serviceQuestion", text: serviceMatch.blurb };
  }

  if (includesAny(text, SERVICES_OVERVIEW_TRIGGERS)) {
    return { intent: "serviceQuestion", text: SERVICES_OVERVIEW_RESPONSE };
  }

  if (includesAny(text, GREETING_KEYWORDS) && text.length < 30) {
    return {
      intent: "greeting",
      text: "Hi! How can we help today?",
    };
  }

  return { intent: "fallback", text: FALLBACK_RESPONSE };
}
