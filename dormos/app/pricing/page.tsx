import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQ } from '@/components/landing/faq'
import { CTASection } from '@/components/landing/cta-section'

export const metadata = {
  title: 'Pricing — DormOS',
  description: 'Simple, transparent pricing for every hostel. Start free for 14 days.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main className="pt-8">
        <PricingSection />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
