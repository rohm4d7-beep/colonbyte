import Link from 'next/link'
import { Building2, Check } from 'lucide-react'

const INCLUDED = [
  'Students, rooms & bed allocation in one dashboard',
  'Finance, fee collection & automated invoicing',
  'Mess planning & maintenance tracking',
  'AI-powered reporting & insights',
]

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#152A1D] flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ffffff]/15 bg-[#ffffff]/10">
            <Building2 className="h-5 w-5 text-[#ffffff]" strokeWidth={2.5} />
          </div>
          <span className="font-heading text-2xl font-semibold text-[#ffffff]">DormOS</span>
        </Link>

        <div className="space-y-6">
          <h2 className="font-heading text-3xl font-semibold text-[#ffffff] leading-tight">
            Everything your hostel needs, in one place.
          </h2>
          <ul className="space-y-3.5">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ffffff]/10">
                  <Check className="h-3 w-3 text-[#ffffff]" strokeWidth={3} />
                </span>
                <span className="text-sm text-[#ffffff]/70 leading-relaxed">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-[#ffffff]/40">
          © {new Date().getFullYear()} DormOS · Run smarter hostels with AI.
        </p>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col justify-center items-center px-6 py-12 bg-background">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-heading text-xl font-semibold text-foreground">DormOS</span>
          </Link>
        </div>

        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}
