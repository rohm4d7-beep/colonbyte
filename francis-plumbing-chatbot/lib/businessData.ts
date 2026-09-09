export const BUSINESS_NAME = "Francis Plumbing, Heating & Cooling";
export const BUSINESS_PHONE = "(613) 224-0041";
export const BUSINESS_PHONE_TEL = "+16132240041";

export const SERVICE_AREAS = [
  "Ottawa",
  "Nepean",
  "Barrhaven",
  "Kanata",
  "Stittsville",
  "Orléans",
  "Gloucester",
  "Manotick",
  "Carleton Place",
] as const;

export type ServiceCategory =
  | "plumbing"
  | "heating"
  | "coolingHotWater";

export interface ServiceItem {
  label: string;
  keywords: string[];
  blurb: string;
}

export const SERVICES: Record<ServiceCategory, { title: string; items: ServiceItem[] }> = {
  plumbing: {
    title: "Plumbing",
    items: [
      {
        label: "Drainage",
        keywords: ["drain", "drainage", "clogged", "clog", "sewer", "backwater"],
        blurb:
          "Yes, we handle drainage work — from clogged drains to full sewer line issues.",
      },
      {
        label: "Leak repair",
        keywords: ["leak", "leaking", "drip", "dripping", "pipe burst", "burst pipe"],
        blurb: "Yes, we handle leak repairs, including pipe leaks and burst pipes.",
      },
      {
        label: "Backwater valves",
        keywords: ["backwater valve", "backwater"],
        blurb: "Yes, we install and service backwater valves.",
      },
      {
        label: "Renovations",
        keywords: ["renovation", "reno", "remodel"],
        blurb: "Yes, we handle plumbing for renovations.",
      },
      {
        label: "Emergency plumbing",
        keywords: ["emergency plumbing", "emergency plumber"],
        blurb: "Yes, we handle urgent plumbing requests.",
      },
    ],
  },
  heating: {
    title: "Heating & Heat Pumps",
    items: [
      {
        label: "Furnaces",
        keywords: ["furnace", "furnaces"],
        blurb: "Yes, we install and repair furnaces.",
      },
      {
        label: "Heat pumps",
        keywords: ["heat pump", "heat pumps"],
        blurb: "Yes, we install and service heat pumps.",
      },
      {
        label: "Boilers",
        keywords: ["boiler", "boilers"],
        blurb: "Yes, we work on boilers.",
      },
      {
        label: "Radiant systems",
        keywords: ["radiant", "radiant heat", "in-floor heating"],
        blurb: "Yes, we handle radiant heating systems.",
      },
      {
        label: "Gas lines",
        keywords: ["gas line", "gas lines", "gas fitting"],
        blurb: "Yes, we handle gas line work.",
      },
    ],
  },
  coolingHotWater: {
    title: "Cooling & Hot Water",
    items: [
      {
        label: "Air conditioners",
        keywords: ["air condition", "ac unit", " ac ", "a/c", "air conditioner", "cooling"],
        blurb: "Yes, we install and repair air conditioners.",
      },
      {
        label: "Duct cleaning",
        keywords: ["duct cleaning", "ducts", "air ducts"],
        blurb: "Yes, we offer duct cleaning.",
      },
      {
        label: "Hot water systems",
        keywords: ["hot water", "water heater", "tankless"],
        blurb: "Yes, we install and service hot water systems, including tankless units.",
      },
    ],
  },
};

export const PRICING_RESPONSE =
  "Pricing depends on the specific job and the work required. If you'd like, I can collect a few details and have the Francis Plumbing team follow up with you.";

export const EMERGENCY_RESPONSE =
  "We handle urgent plumbing requests and prioritize them when possible. Same-day service isn't guaranteed, but I can collect your details so the team can follow up with you.";

export const UNKNOWN_LOCATION_RESPONSE =
  "Could you share your municipality or postal code? I can help determine whether it's within the service area.";

export const FALLBACK_RESPONSE = `I'd be happy to help with that. For the most accurate answer, you can contact the Francis Plumbing team at ${BUSINESS_PHONE}.`;

export const SUBMIT_ERROR_RESPONSE = `We couldn't submit your request right now. Please call Francis Plumbing at ${BUSINESS_PHONE}.`;

export function confirmationResponse(name: string, isEmergency: boolean, hasPhone: boolean): string {
  const followUp = hasPhone
    ? "The Francis Plumbing team can follow up with you using the phone number you provided."
    : `The Francis Plumbing team will review your request. If you'd like a callback, feel free to reach out at ${BUSINESS_PHONE}.`;
  const base = `Thanks, ${name}. We've received your request.\n\n${followUp}`;
  if (isEmergency) {
    return `${base}\n\nYour request has been marked as urgent. Urgent requests are prioritized when possible, but same-day service isn't guaranteed.`;
  }
  return base;
}
