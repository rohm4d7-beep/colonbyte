import { useState, useMemo } from 'react'
import ProductCard from '../components/ProductCard'
import { products, categories } from '../data/products'

export default function ProductListing() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortBy, setSortBy] = useState('default')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let result = products

    if (activeCategory !== 'All') {
      result = result.filter((p) => p.category === activeCategory)
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
      )
    }

    switch (sortBy) {
      case 'price-asc':
        return [...result].sort((a, b) => a.price - b.price)
      case 'price-desc':
        return [...result].sort((a, b) => b.price - a.price)
      case 'rating':
        return [...result].sort((a, b) => b.rating - a.rating)
      default:
        return result
    }
  }, [activeCategory, sortBy, search])

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Hero */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
          Discover Our Collection
        </h1>
        <p className="mt-2 text-gray-500 text-lg">Handpicked products, minimal prices.</p>
      </div>

      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
          </svg>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="default">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Product grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No products found.</p>
          <button
            onClick={() => { setSearch(''); setActiveCategory('All') }}
            className="mt-4 text-indigo-600 text-sm hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
