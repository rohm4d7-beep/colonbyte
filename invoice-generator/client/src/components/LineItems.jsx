export default function LineItems({ items, currency, updateItem, addItem, removeItem }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-gray-500">Line Items</label>
        <button
          type="button"
          onClick={addItem}
          className="text-xs text-accent-600 hover:text-accent-700 font-medium"
        >
          + Add Item
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            <input
              placeholder="Description"
              value={item.description}
              onChange={(e) => updateItem(idx, "description", e.target.value)}
              className="flex-1 min-w-0 px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
            <input
              type="number"
              min="0"
              placeholder="Qty"
              value={item.quantity}
              onChange={(e) => updateItem(idx, "quantity", e.target.value)}
              className="w-16 px-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500 text-center"
            />
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">{currency}</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                value={item.unitPrice}
                onChange={(e) => updateItem(idx, "unitPrice", e.target.value)}
                className="w-28 pl-6 pr-2 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:outline-none focus:ring-2 focus:ring-accent-500"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(idx)}
              disabled={items.length === 1}
              className="px-2 py-1.5 text-red-400 hover:text-red-600 disabled:opacity-20 disabled:cursor-not-allowed text-lg leading-none"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
