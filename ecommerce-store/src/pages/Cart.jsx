import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useState } from 'react'

export default function Cart() {
  const { items, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const [checkedOut, setCheckedOut] = useState(false)

  if (checkedOut) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Order Placed!</h2>
        <p className="mt-2 text-gray-500">Thank you for your purchase. Your order is being processed.</p>
        <Link
          to="/"
          className="mt-8 inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-bold text-gray-900">Your cart is empty</h2>
        <p className="mt-2 text-gray-500">Add some products to get started.</p>
        <Link
          to="/"
          className="mt-6 inline-block bg-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-indigo-700 transition-colors"
        >
          Shop Now
        </Link>
      </div>
    )
  }

  const shipping = totalPrice >= 100 ? 0 : 9.99
  const tax = totalPrice * 0.08
  const orderTotal = totalPrice + shipping + tax

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Shopping Cart <span className="text-lg font-normal text-gray-400">({totalItems} items)</span>
        </h1>
        <button
          onClick={clearCart}
          className="text-sm text-red-400 hover:text-red-600 transition-colors"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <Link to={`/product/${item.id}`} className="shrink-0">
                <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/product/${item.id}`} className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                    {item.name}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="shrink-0 text-gray-300 hover:text-red-400 transition-colors"
                    aria-label="Remove item"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="text-sm text-gray-400 mt-0.5">{item.category}</p>
                <div className="mt-3 flex items-center justify-between">
                  {/* Quantity */}
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors text-lg font-medium"
                    >
                      +
                    </button>
                  </div>
                  <span className="font-bold text-gray-900">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal ({totalItems} items)</span>
                <span className="font-medium text-gray-900">${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={`font-medium ${shipping === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-gray-400">Free shipping on orders over $100</p>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Tax (8%)</span>
                <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
              </div>
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 flex justify-between font-bold text-gray-900">
              <span>Total</span>
              <span className="text-xl">${orderTotal.toFixed(2)}</span>
            </div>
            <button
              onClick={() => { clearCart(); setCheckedOut(true) }}
              className="w-full mt-6 bg-indigo-600 text-white font-semibold py-3 rounded-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              Checkout
            </button>
            <Link
              to="/"
              className="block text-center mt-3 text-sm text-indigo-600 hover:underline"
            >
              ← Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
