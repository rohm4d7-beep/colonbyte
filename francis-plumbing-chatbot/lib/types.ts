export type ServiceChoice = "Plumbing" | "Heating" | "Cooling" | "Hot Water" | "Other";
export type CallbackTime = "Morning" | "Afternoon" | "Evening" | "No preference";

export interface QuickReply {
  label: string;
  value: string;
  variant?: "primary" | "default";
}

export interface ChatMessage {
  id: string;
  role: "bot" | "user";
  text: string;
  quickReplies?: QuickReply[];
  isError?: boolean;
}

export type CorrectableField = "name" | "phone";

export type QuoteStep =
  | "name"
  | "phone"
  | "service"
  | "description"
  | "callbackTime"
  | "submitting"
  | "done";

export interface QuoteDraft {
  name?: string;
  phone?: string;
  service?: ServiceChoice;
  description?: string;
  preferredCallbackTime?: CallbackTime;
  isEmergency: boolean;
}

export interface LeadRecord {
  id: string;
  name: string;
  phone: string | null;
  service: string;
  description: string;
  preferred_callback_time: string | null;
  is_emergency: number;
  created_at: string;
  status: string;
}
