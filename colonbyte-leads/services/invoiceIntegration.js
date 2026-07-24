const API_URL = process.env.INVOICE_API_URL || "http://localhost:5000";

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

export async function generateAndSendQuote(leadData) {
  try {
    const invoiceData = {
      invoiceNumber: "QUOTE-" + Date.now(),
      date: formatDate(new Date()),
      dueDate: formatDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
      from: {
        name: process.env.DEVS_AURA_NAME || "Devs Aura",
        email: process.env.DEVS_AURA_EMAIL || "",
        address: process.env.DEVS_AURA_ADDRESS || "Lahore, Pakistan",
      },
      to: {
        name: leadData.fullName,
        email: leadData.email,
        phone: leadData.whatsapp,
      },
      items: [
        {
          description: `Web Development / AI Solution — ${leadData.service}`,
          quantity: 1,
          unitPrice: 0,
        },
      ],
      notes: "This is an estimated quote. Final pricing will be discussed.",
    };

    const response = await fetch(`${API_URL}/api/invoice/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...invoiceData, sendTo: leadData.email }),
    });

    if (!response.ok) {
      throw new Error(`Invoice API returned ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error("Invoice API error:", error.message);
    return { success: false, error: error.message };
  }
}
