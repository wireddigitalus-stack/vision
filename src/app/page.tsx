import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import ServicesSection from "@/components/home/ServicesSection";
import PropertiesSection from "@/components/home/PropertiesSection";
import GeoMarketsSection from "@/components/home/GeoMarketsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FAQSection from "@/components/home/FAQSection";
import CTASection from "@/components/home/CTASection";
import { HOMEPAGE_FAQ_SCHEMA } from "@/lib/faq-data";

export const metadata: Metadata = {
  title: "Vision LLC | Commercial Real Estate Bristol TN | Tri-Cities CRE Leader",
  description:
    "Vision LLC is the largest private commercial property owner in Downtown Bristol, TN/VA. Award-winning commercial real estate, development & executive consulting across the Tri-Cities. Call 423-573-1022.",
  alternates: {
    canonical: "https://teamvisionllc.com",
  },
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(HOMEPAGE_FAQ_SCHEMA) }}
      />
      <HeroSection />
      <StatsBar />
      <ServicesSection />
      <PropertiesSection />
      <GeoMarketsSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
    </>
  );
}
