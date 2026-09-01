import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { Hero } from '@/components/landing/hero'
import { Facts } from '@/components/landing/facts'
import { Features } from '@/components/landing/features'
import { DashboardShowcase } from '@/components/landing/dashboard-showcase'
import { AIFeatures } from '@/components/landing/ai-features'
import { PricingSection } from '@/components/landing/pricing-section'
import { FAQ } from '@/components/landing/faq'
import { CTASection } from '@/components/landing/cta-section'

export default function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Facts />
        <Features />
        <DashboardShowcase />
        <AIFeatures />
        <PricingSection />
        <FAQ />
        <CTASection />
      </main>
      <Footer />
    </>
  )
}
