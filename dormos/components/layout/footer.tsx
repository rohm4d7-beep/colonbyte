import Link from 'next/link'
import { Building2 } from 'lucide-react'

const FOOTER_LINKS = {
  Product: [
    { label: 'Features', href: '#features' },
    { label: 'AI', href: '#ai' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  Account: [
    { label: 'Login', href: '/login' },
    { label: 'Sign up', href: '/signup' },
    { label: 'Get in touch', href: '#contact' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-background border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
              </div>
              <span className="font-heading text-xl font-semibold text-foreground">DormOS</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              Run smarter hostels with AI. The all-in-one platform for modern hostel management.
            </p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} DormOS. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">Software built for how hostels actually run.</p>
        </div>
      </div>
    </footer>
  )
}
