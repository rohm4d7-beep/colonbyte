import { BrainCircuit } from 'lucide-react'

export default function Navbar() {
  return (
    <header className="border-b border-[#22222e] bg-[#0f0f17]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <BrainCircuit className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-white">
            Resume<span className="gradient-text">AI</span>
          </span>
        </a>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
          Powered by Claude
        </div>
      </div>
    </header>
  )
}
