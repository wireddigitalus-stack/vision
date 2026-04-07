import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Phone, ArrowRight, Award, Clock, Building2, TrendingUp } from "lucide-react";
import { COMPANY } from "@/lib/data";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Vision LLC | Commercial Real Estate Bristol TN | J. Allen Hurley II",
  description:
    "Vision LLC is Downtown Bristol's largest private commercial property owner. Led by CEO J. Allen Hurley II. 20+ years building the Tri-Cities. Call 423-573-1022.",
  alternates: {
    canonical: "https://teamvisionllc.com/about",
  },
  openGraph: {
    title: "About Vision LLC | J. Allen Hurley II, CEO",
    description: "Downtown Bristol's largest private commercial property owner. 20+ years, 50+ properties.",
    url: "https://teamvisionllc.com/about",
  },
};


const timeline = [
  { year: "2002", event: "Vision LLC founded in Bristol, TN" },
  { year: "2005", event: "First major Downtown Bristol acquisition" },
  { year: "2010", event: "Launched historic adaptive reuse program" },
  { year: "2015", event: "Became #1 private CRE owner in Downtown Bristol" },
  { year: "2018", event: "Opened Bristol CoWork at 620 State Street" },
  { year: "2022", event: "Expanded Executive Advisement division" },
  { year: "2024", event: "50+ commercial properties under management" },
];

const values = [
  {
    icon: <Building2 size={24} />,
    title: "Downtown First",
    desc: "We invest in main streets and historic cores — not suburban sprawl. Every dollar we deploy strengthens the urban core of the Tri-Cities.",
  },
  {
    icon: <Award size={24} />,
    title: "Historic Stewardship",
    desc: "We specialize in adaptive reuse — breathing new economic life into historic structures while preserving the character that makes Bristol unique.",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Integrated Strategy",
    desc: "From site selection to lease execution to long-term advisement, we offer one team for every stage of your commercial real estate journey.",
  },
  {
    icon: <Clock size={24} />,
    title: "Long-Term Thinking",
    desc: "We're not flippers. We're builders. We've been investing in the same blocks for 20+ years because we believe in the long-term trajectory of this region.",
  },
];

export default function AboutPage() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 bg-[#0D1117] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(74,222,128,0.07)_0%,transparent_60%)]" />
          <div className="max-w-7xl mx-auto relative">
            <div className="section-line mb-4" />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              20+ Years Building<br />
              <span className="gradient-text-green">Downtown Bristol</span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl">
              Vision LLC is the largest private commercial property owner in Downtown Bristol, TN —
              and the most integrated commercial real estate firm in the Tri-Cities.
            </p>
          </div>
        </section>

        {/* Stats */}
        <div className="border-y border-[rgba(74,222,128,0.1)] bg-[rgba(74,222,128,0.03)]">
          <div className="max-w-7xl mx-auto py-10 px-4 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { n: "20+", label: "Years in the Tri-Cities" },
              { n: "50+", label: "Commercial Properties" },
              { n: "#1", label: "Private CRE Owner, Downtown Bristol" },
              { n: "3", label: "Integrated Business Divisions" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-4xl font-black text-[#4ADE80]">{s.n}</div>
                <div className="text-sm text-gray-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Leadership */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-line mb-4" />
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-6">
                Led by <span className="gradient-text-green">J. Allen Hurley II</span>
              </h2>
              <p className="text-gray-300 text-lg mb-4">
                J. Allen Hurley II is the CEO of Vision LLC and one of the most respected commercial
                real estate leaders in the Tri-Cities region. With 30+ years of executive experience
                spanning development, construction, and corporate strategy, Allen has shaped the
                commercial landscape of Downtown Bristol more than any other private individual.
              </p>
              <p className="text-gray-400 mb-4">
                Under his leadership, Vision LLC has reactivated millions of square feet of dormant
                commercial space, preserved some of Bristol's most iconic historic buildings, and
                delivered measurable economic impact across Northeast Tennessee and Southwest Virginia.
              </p>
              <p className="text-gray-400 mb-8">
                Beyond real estate, Allen serves as an executive advisor to C-suite leaders, boards,
                and government entities — bringing the same strategic rigor to Fortune 500 challenges
                that he applies to Main Street development.
              </p>
              <div className="flex gap-4">
                <a href={COMPANY.phoneHref} className="btn-primary">
                  <Phone size={16} /> {COMPANY.phone}
                </a>
                <Link href="/contact" className="btn-secondary">
                  Connect <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            <div className="relative h-96 lg:h-[520px] rounded-2xl overflow-hidden">
              <Image
                src="/property-images/commercial-city-centre-exterior.jpg"
                alt="Vision LLC Downtown Bristol portfolio"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/70 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="glass rounded-xl p-4 border border-[rgba(74,222,128,0.2)]">
                  <p className="text-sm text-gray-300 italic">
                    "We don't just own buildings. We invest in communities. Every block we restore
                    is a statement that Downtown Bristol has a future worth fighting for."
                  </p>
                  <p className="text-xs text-[#4ADE80] mt-2 font-semibold">— J. Allen Hurley II, CEO</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#0D1117]/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <div className="section-line mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                Our Core <span className="gradient-text-green">Values</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((v) => (
                <div key={v.title} className="glass rounded-2xl p-6 border border-[rgba(74,222,128,0.1)]">
                  <div className="text-[#4ADE80] mb-4">{v.icon}</div>
                  <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                  <p className="text-sm text-gray-400">{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <div className="section-line mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-black text-white">
                20 Years of <span className="gradient-text-green">Downtown Investment</span>
              </h2>
            </div>
            <div className="relative">
              <div className="absolute left-[72px] top-0 bottom-0 w-px bg-[rgba(74,222,128,0.15)]" />
              <div className="space-y-8">
                {timeline.map((item) => (
                  <div key={item.year} className="flex gap-6 items-start">
                    <div className="w-16 flex-shrink-0 text-right">
                      <span className="text-sm font-bold text-[#4ADE80]">{item.year}</span>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-[#4ADE80] mt-1.5 flex-shrink-0 relative z-10 ring-4 ring-[#0D1117]" />
                    <p className="text-gray-300 pt-0.5">{item.event}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-[rgba(74,222,128,0.04)] border-t border-[rgba(74,222,128,0.08)]">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black text-white mb-4">
              Ready to Work With Vision?
            </h2>
            <p className="text-gray-400 mb-8">
              Whether you need a lease, a development partner, or an executive advisor — our team is ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={COMPANY.phoneHref} className="btn-primary">
                <Phone size={16} /> {COMPANY.phone}
              </a>
              <Link href="/contact" className="btn-secondary">
                Start the Conversation <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
