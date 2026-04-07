import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import { Phone, ArrowRight, Check, Wifi, Coffee, Users, Clock, Monitor, Lock } from "lucide-react";
import { COMPANY } from "@/lib/data";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Bristol CoWork | Premium Coworking Space | Vision LLC",
  description:
    "Bristol CoWork at 620 State Street offers private offices, dedicated desks & conference rooms in the heart of Bristol, TN. All-inclusive memberships. Call 423-573-1022.",
};

const plans = [
  {
    name: "Hot Desk",
    price: "Contact Us",
    period: "/ month",
    description: "Flexible open workspace. Drop in when you need it.",
    features: ["Shared Workspace Access", "High-Speed Wi-Fi", "Coffee & Beverages", "Business Address Use", "Community Lounge"],
    cta: "Inquire",
    highlight: false,
  },
  {
    name: "Dedicated Desk",
    price: "Contact Us",
    period: "/ month",
    description: "Your own reserved desk. Locked storage. Always ready.",
    features: ["Reserved Dedicated Desk", "Locked File Cabinet", "24/7 Building Access", "High-Speed Wi-Fi", "Business Address", "Mail Handling", "Conference Room Hours"],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Private Office",
    price: "Contact Us",
    period: "/ month",
    description: "Fully furnished, lockable private office. Move in tomorrow.",
    features: ["Private Lockable Office", "Furnished & Ready", "All Utilities Included", "Dedicated Internet", "Business Address", "Conference Rooms Included", "24/7 Access", "Signage Options"],
    cta: "Schedule Tour",
    highlight: false,
  },
];

const amenities = [
  { icon: <Wifi size={20} />, label: "Gigabit Internet" },
  { icon: <Coffee size={20} />, label: "Coffee & Beverages" },
  { icon: <Users size={20} />, label: "Conference Rooms" },
  { icon: <Clock size={20} />, label: "24/7 Access" },
  { icon: <Monitor size={20} />, label: "Printing & Scanning" },
  { icon: <Lock size={20} />, label: "Secure Building" },
];

const gallery = [
  { src: "/property-images/cowork-shared-office.jpg", alt: "Bristol CoWork shared workspace area" },
  { src: "/property-images/cowork-conference-room.jpg", alt: "Bristol CoWork conference room" },
  { src: "/property-images/cowork-lobby-waiting.jpg", alt: "Bristol CoWork lobby and reception" },
  { src: "/property-images/cowork-private-office.jpg", alt: "Bristol CoWork private office suite" },
];

export default function CoWorkPage() {
  return (
    <>
      <Navigation />
      <main>
        {/* Hero */}
        <section className="pt-32 pb-0 px-4 sm:px-6 lg:px-8 bg-[#0D1117] relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(250,204,21,0.06)_0%,transparent_60%)]" />
          <div className="max-w-7xl mx-auto relative grid lg:grid-cols-2 gap-12 items-center pb-16">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(250,204,21,0.1)] border border-[rgba(250,204,21,0.2)] text-[#FACC15] text-xs font-bold mb-6 tracking-wider uppercase">
                Now Open · 620 State Street
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
                Bristol<br />
                <span className="text-[#FACC15]">CoWork</span>
              </h1>
              <p className="text-xl text-gray-400 mb-4">
                Downtown Bristol's premier professional workspace — built for entrepreneurs,
                remote teams, and growing businesses that need more than a coffee shop.
              </p>
              <p className="text-gray-500 mb-8">
                620 State Street, Bristol, TN · All-inclusive memberships · Private offices available today
              </p>
              <div className="flex flex-wrap gap-4">
                <a href={COMPANY.phoneHref} className="btn-primary" style={{ background: "#FACC15", color: "#000", borderColor: "#FACC15" }}>
                  <Phone size={16} /> Call to Book a Tour
                </a>
                <Link href="/contact" className="btn-secondary">
                  Send an Inquiry <ArrowRight size={16} />
                </Link>
              </div>
            </div>
            {/* Hero image */}
            <div className="relative h-80 lg:h-[500px] rounded-2xl overflow-hidden">
              <Image
                src="/property-images/cowork-shared-office.jpg"
                alt="Bristol CoWork interior workspace"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D1117]/40 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                {gallery.slice(1).map((img) => (
                  <div key={img.src} className="relative flex-1 h-16 rounded-lg overflow-hidden">
                    <Image src={img.src} alt={img.alt} fill className="object-cover" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Amenities Bar */}
        <div className="bg-[rgba(250,204,21,0.04)] border-y border-[rgba(250,204,21,0.1)] py-6 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-3 sm:grid-cols-6 gap-4">
            {amenities.map((a) => (
              <div key={a.label} className="flex flex-col items-center gap-2 text-center">
                <div className="text-[#FACC15]">{a.icon}</div>
                <span className="text-xs text-gray-400 font-medium">{a.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Membership Plans */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="section-line mx-auto mb-4" />
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-3">
                Membership <span className="text-[#FACC15]">Plans</span>
              </h2>
              <p className="text-gray-400">
                All plans include Wi-Fi, coffee, and access to communal areas. Contact us for current rates.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`glass rounded-2xl p-6 border flex flex-col ${
                    plan.highlight
                      ? "border-[#FACC15] bg-[rgba(250,204,21,0.04)]"
                      : "border-[rgba(255,255,255,0.08)]"
                  }`}
                >
                  {plan.highlight && (
                    <div className="text-[10px] font-black text-black bg-[#FACC15] px-2 py-0.5 rounded-lg self-start mb-3 tracking-wider uppercase">
                      Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{plan.name}</h3>
                  <p className="text-3xl font-black text-[#FACC15] mb-1">{plan.price}</p>
                  <p className="text-xs text-gray-500 mb-4">{plan.period}</p>
                  <p className="text-sm text-gray-400 mb-6">{plan.description}</p>
                  <ul className="space-y-2.5 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-300">
                        <Check size={14} className="text-[#FACC15] mt-0.5 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={COMPANY.phoneHref}
                    className={`text-center py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                      plan.highlight
                        ? "bg-[#FACC15] text-black hover:opacity-90"
                        : "border border-[rgba(250,204,21,0.3)] text-[#FACC15] hover:bg-[rgba(250,204,21,0.08)]"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Location */}
        <section className="py-16 px-4 bg-[rgba(74,222,128,0.03)] border-t border-[rgba(74,222,128,0.08)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-black text-white mb-4">
              Prime Downtown <span className="gradient-text-green">Location</span>
            </h2>
            <p className="text-gray-400 mb-2 text-lg">620 State Street · Bristol, TN 37620</p>
            <p className="text-gray-500 mb-8">
              Located on Bristol's iconic State Street — right on the TN/VA state line, steps from restaurants,
              hotels, and the region's most active commercial corridor.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href={COMPANY.phoneHref} className="btn-primary">
                <Phone size={16} /> {COMPANY.phone}
              </a>
              <Link href="/contact" className="btn-secondary">
                Get Directions & Availability <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
