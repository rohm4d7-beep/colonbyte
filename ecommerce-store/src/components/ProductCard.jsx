import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3.5 h-3.5 ${star <= Math.round(rating) ? 'text-amber-400' : 'text-gray-200'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs text-gray-500 ml-1">{rating}</span>
    </div>
  )
}

export default function ProductCard({ product }) {
  const { addToCart, items } = useCart()
  const inCart = items.some((i) => i.id === product.id)

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
      <Link to={`/product/${product.id}`} className="block overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </Link>
      <div className="p-4">
        <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
          {product.category}
        </span>
        <Link to={`/product/${product.id}`}>
          <h3 className="mt-2 font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-indigo-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mt-1.5">
          <StarRating rating={product.rating} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-gray-900">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
            )}
          </div>
          <button
            onClick={() => addToCart(product)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              inCart
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {inCart ? '✓ Added' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  )
}
