import { NextResponse } from "next/server";
import { deleteLead } from "@/lib/leads-db";

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    const deleted = deleteLead(params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Lead not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting lead:", error);
    return NextResponse.json({ error: "Failed to delete lead" }, { status: 500 });
  }
}
