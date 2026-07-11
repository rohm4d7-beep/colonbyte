import { useState, useMemo } from "react";

const emptyItem = () => ({ description: "", quantity: 1, unitPrice: 0 });

const initialState = {
  invoiceNumber: "INV-001",
  date: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
  currency: "USD",
  from: { name: "DevsAura", email: "hello@devsaura.com", address: "123 AI Street, Tech City", phone: "+1-555-0001" },
  to: { name: "", email: "", address: "", phone: "" },
  items: [emptyItem()],
  tax: 0,
  discount: 0,
  notes: "",
};

export function useInvoice() {
  const [form, setForm] = useState(initialState);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const updateFrom = (key, val) => setForm((f) => ({ from: { ...f.from, [key]: val } }));
  const updateTo = (key, val) => setForm((f) => ({ to: { ...f.to, [key]: val } }));

  const updateItem = (idx, key, val) => {
    setForm((f) => {
      const items = f.items.map((it, i) => (i === idx ? { ...it, [key]: val } : it));
      return { ...f, items };
    });
  };

  const addItem = () => setForm((f) => ({ ...f, items: [...f.items, emptyItem()] }));
  const removeItem = (idx) =>
    setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const totals = useMemo(() => {
    const subtotal = form.items.reduce((s, i) => s + (Number(i.quantity) || 0) * (Number(i.unitPrice) || 0), 0);
    const taxAmt = subtotal * (Number(form.tax) || 0) / 100;
    const discAmt = subtotal * (Number(form.discount) || 0) / 100;
    return {
      subtotal,
      taxAmt,
      discAmt,
      total: subtotal + taxAmt - discAmt,
    };
  }, [form.items, form.tax, form.discount]);

  const reset = () => setForm(initialState);
  const setInvoice = (data) => setForm(data);

  return { form, update, updateFrom, updateTo, updateItem, addItem, removeItem, totals, reset, setInvoice };
}
