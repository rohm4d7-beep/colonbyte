import { NextResponse } from "next/server";
import { getAllLeads, deleteAllLeads } from "@/lib/leads-db";

export async function GET() {
  try {
    const leads = getAllLeads();
    return NextResponse.json({ leads });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return NextResponse.json({ error: "Failed to fetch leads" }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    deleteAllLeads();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting all leads:", error);
    return NextResponse.json({ error: "Failed to delete leads" }, { status: 500 });
  }
}
