import fs from "fs";
import path from "path";
import { Lead } from "./schema";

const DB_PATH = path.join(process.cwd(), "leads.json");

function readLeads(): Lead[] {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
    return [];
  }
  const raw = fs.readFileSync(DB_PATH, "utf-8");
  return JSON.parse(raw) as Lead[];
}

export function saveLead(lead: Lead): void {
  const leads = readLeads();
  leads.push(lead);
  fs.writeFileSync(DB_PATH, JSON.stringify(leads, null, 2));
}

export function getAllLeads(): Lead[] {
  return readLeads();
}

export function deleteLead(id: string): boolean {
  const leads = readLeads();
  const filtered = leads.filter((l) => l.id !== id);
  if (filtered.length === leads.length) return false;
  fs.writeFileSync(DB_PATH, JSON.stringify(filtered, null, 2));
  return true;
}

export function deleteAllLeads(): void {
  fs.writeFileSync(DB_PATH, JSON.stringify([], null, 2));
}
