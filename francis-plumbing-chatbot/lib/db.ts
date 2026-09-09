import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { LeadRecord } from "./types";

interface Env {
  DB: D1Database;
}

export async function getDb(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  const typedEnv = env as unknown as Env;
  return typedEnv.DB;
}

export interface NewLead {
  name: string;
  phone: string | null;
  service: string;
  description: string;
  preferredCallbackTime: string | null;
  isEmergency: boolean;
  ip: string | null;
}

// Durable, cross-isolate rate-limit check — Workers spread requests across
// multiple isolates, so an in-memory counter can't be trusted; this counts
// real rows in D1 instead.
export async function countRecentSubmissionsByIp(ip: string, windowMs: number): Promise<number> {
  const db = await getDb();
  const since = new Date(Date.now() - windowMs).toISOString();
  const row = await db
    .prepare(`SELECT COUNT(*) as count FROM leads WHERE ip = ? AND created_at > ?`)
    .bind(ip, since)
    .first<{ count: number }>();
  return row?.count ?? 0;
}

export async function insertLead(lead: NewLead): Promise<LeadRecord> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO leads (id, name, phone, service, description, preferred_callback_time, is_emergency, created_at, status, ip)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'new', ?)`
    )
    .bind(
      id,
      lead.name,
      lead.phone,
      lead.service,
      lead.description,
      lead.preferredCallbackTime,
      lead.isEmergency ? 1 : 0,
      createdAt,
      lead.ip
    )
    .run();

  return {
    id,
    name: lead.name,
    phone: lead.phone,
    service: lead.service,
    description: lead.description,
    preferred_callback_time: lead.preferredCallbackTime,
    is_emergency: lead.isEmergency ? 1 : 0,
    created_at: createdAt,
    status: "new",
  };
}

export async function listLeads(): Promise<LeadRecord[]> {
  const db = await getDb();
  const { results } = await db
    .prepare(`SELECT * FROM leads ORDER BY created_at DESC LIMIT 100`)
    .all<LeadRecord>();
  return results;
}
