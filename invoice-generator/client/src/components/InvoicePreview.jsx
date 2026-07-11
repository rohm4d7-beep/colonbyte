export default function InvoicePreview({ form, totals }) {
  return (
    <div className="card border rounded-xl p-6 shadow-sm text-sm">
      <div className="flex items-start justify-between mb-6">
        <div>
          <img src="/logo.png" alt="DevsAura" className="w-14 h-14 rounded-lg object-cover mb-2" />
          <p className="font-semibold">DevsAura</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-accent-600">INVOICE</p>
          <p className="text-gray-500 text-xs mt-1">{form.invoiceNumber}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">From</p>
          <p className="font-medium">{form.from.name}</p>
          <p className="text-gray-500 text-xs">{form.from.email}</p>
          <p className="text-gray-500 text-xs">{form.from.address}</p>
          <p className="text-gray-500 text-xs">{form.from.phone}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">To</p>
          <p className="font-medium">{form.to.name || "—"}</p>
          <p className="text-gray-500 text-xs">{form.to.email || "—"}</p>
          <p className="text-gray-500 text-xs">{form.to.address || "—"}</p>
          <p className="text-gray-500 text-xs">{form.to.phone || "—"}</p>
        </div>
      </div>

      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>Date: <strong className="text-gray-700 dark:text-gray-300">{form.date}</strong></span>
        <span>Due: <strong className="text-gray-700 dark:text-gray-300">{form.dueDate}</strong></span>
      </div>

      <table className="w-full mb-4">
        <thead>
          <tr className="bg-accent-600 text-white text-xs">
            <th className="text-left py-2 px-2 rounded-l">Description</th>
            <th className="text-center py-2 px-2">Qty</th>
            <th className="text-right py-2 px-2">Unit Price</th>
            <th className="text-right py-2 px-2 rounded-r">Amount</th>
          </tr>
        </thead>
        <tbody>
          {form.items.map((item, i) => {
            const amt = (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0);
            return (
              <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                <td className="py-2 px-2 text-xs">{item.description || "—"}</td>
                <td className="py-2 px-2 text-xs text-center">{item.quantity}</td>
                <td className="py-2 px-2 text-xs text-right">{form.currency} {Number(item.unitPrice).toFixed(2)}</td>
                <td className="py-2 px-2 text-xs text-right font-medium">{form.currency} {amt.toFixed(2)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="space-y-1 text-sm ml-auto w-48">
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

      {form.notes && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold mb-1">Notes</p>
          <p className="text-xs text-gray-500">{form.notes}</p>
        </div>
      )}
    </div>
  );
}
