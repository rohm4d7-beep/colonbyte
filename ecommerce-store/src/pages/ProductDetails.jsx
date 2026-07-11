import { useParams, useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { products } from '../data/products'
import { useCart } from '../context/CartContext'

function StarRating({ rating, reviews }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">{rating}</span>
      <span className="text-sm text-gray-400">({reviews.toLocaleString()} reviews)</span>
    </div>
  )
}

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const product = products.find((p) => p.id === Number(id))
  const { addToCart, items } = useCart()
  const [added, setAdded] = useState(false)

  if (!product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-xl">Product not found.</p>
        <Link to="/" className="mt-4 inline-block text-indigo-600 hover:underline">
          Back to Products
        </Link>
      </div>
    )
  }

  const inCart = items.some((i) => i.id === product.id)
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null

  function handleAddToCart() {
    addToCart(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 3)

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
        <Link to="/" className="hover:text-indigo-600 transition-colors">Products</Link>
        <span>/</span>
        <span className="text-gray-600">{product.name}</span>
      </nav>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-96 lg:h-full object-cover"
          />
          {discount && (
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col">
          <span className="text-sm font-medium text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full">
            {product.category}
          </span>
          <h1 className="mt-3 text-3xl font-bold text-gray-900 leading-snug">{product.name}</h1>

          <div className="mt-3">
            <StarRating rating={product.rating} reviews={product.reviews} />
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-xl text-gray-400 line-through">${product.originalPrice}</span>
                <span className="text-sm font-semibold text-red-500">Save {discount}%</span>
              </>
            )}
          </div>

          <p className="mt-5 text-gray-600 leading-relaxed">{product.description}</p>

          {/* Features */}
          <ul className="mt-5 space-y-2">
            {product.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-700">
                <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>

          {/* Stock */}
          <p className={`mt-5 text-sm font-medium ${product.stock < 5 ? 'text-red-500' : 'text-green-600'}`}>
            {product.stock < 5 ? `Only ${product.stock} left in stock!` : `In stock (${product.stock} available)`}
          </p>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleAddToCart}
              className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {added ? '✓ Added to Cart' : inCart ? 'Add One More' : 'Add to Cart'}
            </button>
            <button
              onClick={() => { addToCart(product); navigate('/cart') }}
              className="flex-1 py-3 px-6 rounded-xl font-semibold text-sm bg-gray-900 text-white hover:bg-gray-800 active:scale-95 transition-all"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link key={p.id} to={`/product/${p.id}`} className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-md transition-shadow">
                <img src={p.image} alt={p.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="p-4">
                  <p className="font-semibold text-gray-900 line-clamp-1">{p.name}</p>
                  <p className="text-indigo-600 font-bold mt-1">${p.price}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  )
}
