import { NextRequest, NextResponse } from "next/server";
import { countRecentSubmissionsByIp, insertLead, listLeads } from "@/lib/db";

const ALLOWED_SERVICES = ["Plumbing", "Heating", "Cooling", "Hot Water", "Other"];
const ALLOWED_CALLBACK_TIMES = ["Morning", "Afternoon", "Evening", "No preference"];

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 30;
const MAX_DESCRIPTION_LENGTH = 2000;

// Backed by a real D1 count, not an in-memory map — Workers spread requests
// across multiple isolates, so in-memory state isn't reliably shared and
// can't be trusted as a rate limit.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

export async function POST(request: NextRequest) {
  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  if (ip !== "unknown") {
    const recentCount = await countRecentSubmissionsByIp(ip, RATE_LIMIT_WINDOW_MS);
    if (recentCount >= RATE_LIMIT_MAX) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { name, phone, service, description, preferredCallbackTime, isEmergency } =
    (body ?? {}) as Record<string, unknown>;

  if (typeof name !== "string" || name.trim().length === 0 || name.trim().length > MAX_NAME_LENGTH) {
    return NextResponse.json({ error: "A valid name is required." }, { status: 400 });
  }
  const hasPhone = typeof phone === "string" && phone.trim().length > 0;
  if (hasPhone && (phone as string).trim().length > MAX_PHONE_LENGTH) {
    return NextResponse.json({ error: "That phone number doesn't look valid." }, { status: 400 });
  }
  if (hasPhone && (phone as string).replace(/\D/g, "").length < 7) {
    return NextResponse.json({ error: "That phone number doesn't look valid." }, { status: 400 });
  }
  if (typeof service !== "string" || !ALLOWED_SERVICES.includes(service)) {
    return NextResponse.json({ error: "A valid service is required." }, { status: 400 });
  }
  if (
    typeof description !== "string" ||
    description.trim().length === 0 ||
    description.trim().length > MAX_DESCRIPTION_LENGTH
  ) {
    return NextResponse.json({ error: "A valid description is required." }, { status: 400 });
  }
  if (
    preferredCallbackTime !== undefined &&
    preferredCallbackTime !== null &&
    !ALLOWED_CALLBACK_TIMES.includes(preferredCallbackTime as string)
  ) {
    return NextResponse.json({ error: "Invalid callback time." }, { status: 400 });
  }

  try {
    const lead = await insertLead({
      name: name.trim(),
      phone: hasPhone ? (phone as string).trim() : null,
      service,
      description: description.trim(),
      preferredCallbackTime: (preferredCallbackTime as string | undefined) ?? null,
      isEmergency: Boolean(isEmergency),
      ip: ip === "unknown" ? null : ip,
    });
    return NextResponse.json({ lead }, { status: 201 });
  } catch (err) {
    console.error("Failed to insert lead", err);
    return NextResponse.json({ error: "Could not save the request." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const leads = await listLeads();
    return NextResponse.json({ leads });
  } catch (err) {
    console.error("Failed to list leads", err);
    return NextResponse.json({ error: "Could not load requests." }, { status: 500 });
  }
}
