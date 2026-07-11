import { NextRequest, NextResponse } from "next/server";
import { leadFormSchema } from "@/lib/schema";
import { saveLead } from "@/lib/leads-db";
import { sendAutoReplyEmail } from "@/lib/email";
import { generateWhatsAppLink } from "@/lib/whatsapp";
import { generateAndSendQuote } from "@/services/invoiceIntegration";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = leadFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const lead = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    saveLead(lead);

    const [emailResult, invoiceResult] = await Promise.allSettled([
      sendAutoReplyEmail(data.email, data.fullName, data.service),
      generateAndSendQuote(data),
    ]);

    const agencyNumber = process.env.AGENCY_WHATSAPP ?? "+923710747627";
    const whatsappUrl = generateWhatsAppLink(
      agencyNumber,
      data.fullName,
      data.service,
      data.message
    );

    const adminWhatsappNumber = process.env.ADMIN_WHATSAPP ?? agencyNumber;
    const invoiceSent = invoiceResult.status === "fulfilled" && invoiceResult.value.success;
    const adminMsg = `New lead from *${data.fullName}* — Quote/Invoice sent to *${data.email}* ✅`;
    const adminWhatsappUrl = `https://wa.me/${adminWhatsappNumber.replace(/[^\d]/g, "")}?text=${encodeURIComponent(adminMsg)}`;

    return NextResponse.json({
      success: true,
      message: "Lead captured successfully",
      whatsappUrl,
      adminWhatsappUrl,
      notifications: {
        email: emailResult.status === "fulfilled" ? "sent" : "failed",
        invoice: invoiceSent ? "sent" : "failed",
      },
    });
  } catch (error) {
    console.error("Lead submission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
