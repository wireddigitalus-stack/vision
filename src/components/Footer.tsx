import Link from "next/link";
import { Phone, Mail, MapPin, Facebook, Linkedin, Youtube, ArrowRight } from "lucide-react";
import { COMPANY, GEO_PAGES } from "@/lib/data";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#080B0F] border-t border-[rgba(74,222,128,0.1)]">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                <span className="text-black font-black text-xl">V</span>
              </div>
              <div>
                <span className="font-black text-2xl text-white tracking-tight">VISION</span>
                <span className="block text-[10px] text-[#4ADE80] font-bold tracking-[0.2em] uppercase">LLC</span>
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              The Tri-Cities&apos; premier commercial real estate, development & executive advisement firm — rooted in Bristol for 20+ years.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-lg border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-gray-400 hover:text-[#4ADE80] hover:border-[rgba(74,222,128,0.5)] transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-lg border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-gray-400 hover:text-[#4ADE80] hover:border-[rgba(74,222,128,0.5)] transition-colors"
              >
                <Linkedin size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-9 h-9 rounded-lg border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-gray-400 hover:text-[#4ADE80] hover:border-[rgba(74,222,128,0.5)] transition-colors"
              >
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Services</h3>
            <ul className="space-y-3">
              {[
                { label: "Commercial Leasing", href: "/commercial-real-estate" },
                { label: "Office Space", href: "/commercial-real-estate/office" },
                { label: "Retail Storefronts", href: "/commercial-real-estate/retail" },
                { label: "Warehouse Space", href: "/commercial-real-estate/warehouse" },
                { label: "Bristol CoWork", href: "/cowork" },
                { label: "Executive Advisement", href: "/executive-advisement" },
                { label: "Development & Construction", href: "/development" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4ADE80] transition-colors group"
                  >
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity text-[#4ADE80]" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Markets — Geo pages for SEO */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Markets Served</h3>
            <ul className="space-y-3">
              {GEO_PAGES.map((geo) => (
                <li key={geo.slug}>
                  <Link
                    href={`/markets/${geo.slug}`}
                    className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#4ADE80] transition-colors group"
                  >
                    <MapPin size={12} className="text-[#4ADE80] flex-shrink-0" />
                    {geo.city}, {geo.state}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/markets"
                  className="text-sm text-[#4ADE80] hover:text-white transition-colors font-semibold"
                >
                  View All Markets →
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-bold text-sm uppercase tracking-widest mb-5">Contact Us</h3>
            <ul className="space-y-4">
              <li>
                <a
                  href={COMPANY.phoneHref}
                  id="footer-phone"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-[#4ADE80] transition-colors group"
                >
                  <Phone size={15} className="mt-0.5 text-[#4ADE80] flex-shrink-0" />
                  <span>{COMPANY.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  id="footer-email"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-[#4ADE80] transition-colors"
                >
                  <Mail size={15} className="mt-0.5 text-[#4ADE80] flex-shrink-0" />
                  <span className="break-all">{COMPANY.email}</span>
                </a>
              </li>
              <li>
                <a
                  href="https://maps.google.com/?q=100+5th+St+Bristol+TN+37620"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="footer-address"
                  className="flex items-start gap-3 text-sm text-gray-400 hover:text-[#4ADE80] transition-colors"
                >
                  <MapPin size={15} className="mt-0.5 text-[#4ADE80] flex-shrink-0" />
                  <span>{COMPANY.fullAddress}</span>
                </a>
              </li>
            </ul>

            <div className="mt-6 p-4 rounded-xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.05)]">
              <p className="text-xs text-gray-400 mb-3">Ready to find your space?</p>
              <Link
                href="/contact"
                id="footer-contact-cta"
                className="btn-primary w-full justify-center py-2.5 text-sm"
              >
                Schedule a Tour
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[rgba(74,222,128,0.07)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {currentYear} Vision LLC. All rights reserved. | Bristol, TN/VA
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/privacy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
            <Link href="/sitemap.xml" className="hover:text-gray-400 transition-colors">Sitemap</Link>
            <span className="flex items-center gap-1">
              Powered by{" "}
              <span className="text-[#4ADE80] font-semibold">Gemini AI</span>
            </span>
            <Link
              href="/admin"
              id="footer-admin-link"
              className="flex items-center gap-1.5 hover:text-[#4ADE80] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] inline-block" />
              Admin Login
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
