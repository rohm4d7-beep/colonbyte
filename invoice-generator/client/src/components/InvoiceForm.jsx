import LineItems from "./LineItems";

export default function InvoiceForm({ form, update, updateFrom, updateTo, updateItem, addItem, removeItem, totals }) {
  const input = (key, val, onChange, opts = {}) => (
    <input
      {...opts}
      value={val}
      onChange={onChange}
      className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500"
    />
  );

  const section = (label) => (
    <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 mt-3 first:mt-0">{label}</p>
  );

  return (
    <div className="space-y-4">
      {/* Invoice meta */}
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Invoice #</label>
          {input("invoiceNumber", form.invoiceNumber, (e) => update("invoiceNumber", e.target.value))}
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Date</label>
          {input("date", form.date, (e) => update("date", e.target.value), { type: "date" })}
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Due Date</label>
          {input("dueDate", form.dueDate, (e) => update("dueDate", e.target.value), { type: "date" })}
        </div>
      </div>

      {/* From */}
      {section("From")}
      <div className="grid grid-cols-2 gap-2">
        {input("fromName", form.from.name, (e) => updateFrom("name", e.target.value), { placeholder: "Your name" })}
        {input("fromEmail", form.from.email, (e) => updateFrom("email", e.target.value), { placeholder: "your@email.com", type: "email" })}
        {input("fromAddress", form.from.address, (e) => updateFrom("address", e.target.value), { placeholder: "Address", className: "col-span-2 w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500" })}
        {input("fromPhone", form.from.phone, (e) => updateFrom("phone", e.target.value), { placeholder: "Phone" })}
        <div>
          <select
            value={form.currency}
            onChange={(e) => update("currency", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            {["USD", "EUR", "GBP", "INR", "AUD", "CAD"].map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* To */}
      {section("To")}
      <div className="grid grid-cols-2 gap-2">
        {input("toName", form.to.name, (e) => updateTo("name", e.target.value), { placeholder: "Client name" })}
        {input("toEmail", form.to.email, (e) => updateTo("email", e.target.value), { placeholder: "client@email.com", type: "email" })}
        {input("toAddress", form.to.address, (e) => updateTo("address", e.target.value), { placeholder: "Address" })}
        {input("toPhone", form.to.phone, (e) => updateTo("phone", e.target.value), { placeholder: "Phone" })}
      </div>

      {/* Line items */}
      <LineItems items={form.items} currency={form.currency} updateItem={updateItem} addItem={addItem} removeItem={removeItem} />

      {/* Tax & discount */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Tax (%)</label>
          <input
            type="number" min="0" max="100" step="0.1"
            value={form.tax}
            onChange={(e) => update("tax", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Discount (%)</label>
          <input
            type="number" min="0" max="100" step="0.1"
            value={form.discount}
            onChange={(e) => update("discount", e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Notes</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Payment terms, thank you note..."
          className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500 resize-none"
        />
      </div>

      {/* Totals summary */}
      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-3 space-y-1 text-sm border border-gray-200 dark:border-gray-700">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>{form.currency} {totals.subtotal.toFixed(2)}</span>
        </div>
        {form.tax > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Tax ({form.tax}%)</span>
            <span>{form.currency} {totals.taxAmt.toFixed(2)}</span>
          </div>
        )}
        {form.discount > 0 && (
          <div className="flex justify-between text-gray-500">
            <span>Discount ({form.discount}%)</span>
            <span>-{form.currency} {totals.discAmt.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-accent-600 pt-1 border-t border-gray-300 dark:border-gray-600">
          <span>Total</span>
          <span>{form.currency} {totals.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
