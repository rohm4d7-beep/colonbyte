import { ChatWidget } from "@/components/ChatWidget";
import { Hero } from "@/components/Hero";
import { PrototypeBanner } from "@/components/PrototypeBanner";
import { ServiceAreaSection } from "@/components/ServiceAreaSection";
import { ServicesSection } from "@/components/ServicesSection";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StickyCtaBar } from "@/components/StickyCtaBar";

export default function Home() {
  return (
    <>
      <PrototypeBanner />
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <ServicesSection />
        <ServiceAreaSection />
      </main>
      <SiteFooter />
      <StickyCtaBar />
      <ChatWidget />
    </>
  );
}
