import type { Metadata } from "next";
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import ServicesSection from "@/components/home/ServicesSection";
import PropertiesSection from "@/components/home/PropertiesSection";
import GeoMarketsSection from "@/components/home/GeoMarketsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

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
      <HeroSection />
      <StatsBar />
      <ServicesSection />
      <PropertiesSection />
      <GeoMarketsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
