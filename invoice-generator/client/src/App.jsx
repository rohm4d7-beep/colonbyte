import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Header from "./components/Header";
import InvoiceForm from "./components/InvoiceForm";
import InvoicePreview from "./components/InvoicePreview";
import EmailModal from "./components/EmailModal";
import { useInvoice } from "./hooks/useInvoice";

function mapFormToPayload(form) {
  return {
    invoiceNumber: form.invoiceNumber,
    date: form.date,
    dueDate: form.dueDate,
    currency: form.currency,
    from: form.from,
    to: form.to,
    items: form.items.map((i) => ({
      description: i.description,
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unitPrice) || 0,
    })),
    tax: Number(form.tax) || 0,
    discount: Number(form.discount) || 0,
    notes: form.notes,
  };
}

export default function App() {
  const { form, update, updateFrom, updateTo, updateItem, addItem, removeItem, totals } = useInvoice();
  const [emailOpen, setEmailOpen] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const { data } = await axios.post("/api/invoice/generate", mapFormToPayload(form));
      const byteChars = atob(data.pdf);
      const arr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) arr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([arr], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${form.invoiceNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Invoice downloaded!");
    } catch {
      toast.error("Failed to generate invoice");
    } finally {
      setDownloading(false);
    }
  };

  const handleSend = async (recipientEmail) => {
    try {
      await axios.post("/api/invoice/send", {
        ...mapFormToPayload(form),
        recipientEmail,
      });
      toast.success("Invoice sent successfully!");
    } catch {
      toast.error("Failed to send invoice");
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-300">
      <Toaster position="top-right" toastOptions={{ className: "text-sm" }} />
      <Header />
      <EmailModal open={emailOpen} onClose={() => setEmailOpen(false)} onSend={handleSend} />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left — Form */}
          <div className="card border rounded-xl p-5 shadow-sm">
            <InvoiceForm
              form={form}
              update={update}
              updateFrom={updateFrom}
              updateTo={updateTo}
              updateItem={updateItem}
              addItem={addItem}
              removeItem={removeItem}
              totals={totals}
            />

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="flex-1 py-2 px-4 text-sm font-medium rounded-lg bg-accent-600 text-white hover:bg-accent-700 disabled:opacity-50 transition"
              >
                {downloading ? "Generating..." : "⬇ Generate & Download PDF"}
              </button>
              <button
                onClick={() => setEmailOpen(true)}
                className="flex-1 py-2 px-4 text-sm font-medium rounded-lg border border-accent-600 text-accent-600 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition"
              >
                ✉ Send via Email
              </button>
            </div>
          </div>

          {/* Right — Live Preview */}
          <div className="lg:sticky lg:top-20 self-start">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Invoice Preview</p>
            <InvoicePreview form={form} totals={totals} />
          </div>
        </div>
      </main>
    </div>
  );
}
