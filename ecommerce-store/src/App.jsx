import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import Navbar from './components/Navbar'
import ProductListing from './pages/ProductListing'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<ProductListing />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
          <footer className="mt-16 border-t border-gray-100 bg-white">
            <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-gray-400">
              © 2026 ShopMini. Built with React + Tailwind CSS.
            </div>
          </footer>
        </div>
      </CartProvider>
    </BrowserRouter>
  )
}
