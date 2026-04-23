"use client";

import Link from "next/link";
import { Phone, Mail, MapPin, Clock, ArrowRight, MessageSquare } from "lucide-react";
import { COMPANY } from "@/lib/data";

export default function ContactPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="max-w-2xl mb-14">
          <div className="section-line mb-4" />
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Let&apos;s Find Your{" "}
            <span className="gradient-text-green">Perfect Space</span>
          </h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Whether you&apos;re looking for office space, a retail location, or want to
            discuss a development project — we respond within 24 hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <form
              id="contact-form"
              className="glass rounded-2xl p-8 border border-[rgba(74,222,128,0.1)] space-y-5"
              aria-label="Contact Vision LLC"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Full Name *
                  </label>
                  <input id="contact-name" type="text" name="name" required placeholder="Jane Smith"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(74,222,128,0.15)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[rgba(74,222,128,0.5)] transition-all" />
                </div>
                <div>
                  <label htmlFor="contact-company" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Company</label>
                  <input id="contact-company" type="text" name="company" placeholder="Acme Corp."
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(74,222,128,0.15)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[rgba(74,222,128,0.5)] transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email *</label>
                  <input id="contact-email" type="email" name="email" required placeholder="jane@company.com"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(74,222,128,0.15)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[rgba(74,222,128,0.5)] transition-all" />
                </div>
                <div>
                  <label htmlFor="contact-phone" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                  <input id="contact-phone" type="tel" name="phone" placeholder="(423) 000-0000"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(74,222,128,0.15)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[rgba(74,222,128,0.5)] transition-all" />
                </div>
              </div>
              <div>
                <label htmlFor="contact-interest" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">I&apos;m Interested In *</label>
                <select id="contact-interest" name="interest" required className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(74,222,128,0.15)] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[rgba(74,222,128,0.5)] transition-all">
                  <option value="" className="bg-[#111827]">Select a service...</option>
                  <option value="office" className="bg-[#111827]">Office Space</option>
                  <option value="retail" className="bg-[#111827]">Retail Storefront</option>
                  <option value="warehouse" className="bg-[#111827]">Warehouse / Industrial</option>
                  <option value="cowork" className="bg-[#111827]">Bristol CoWork Membership</option>
                  <option value="development" className="bg-[#111827]">Development / Construction</option>
                  <option value="advisement" className="bg-[#111827]">Executive Advisement</option>
                  <option value="other" className="bg-[#111827]">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-city" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preferred Market</label>
                <select id="contact-city" name="city" className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(74,222,128,0.15)] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[rgba(74,222,128,0.5)] transition-all">
                  <option value="" className="bg-[#111827]">Any / Open to suggestions</option>
                  <option value="bristol-tn" className="bg-[#111827]">Bristol, TN</option>
                  <option value="bristol-va" className="bg-[#111827]">Bristol, VA</option>
                  <option value="kingsport" className="bg-[#111827]">Kingsport, TN</option>
                  <option value="johnson-city" className="bg-[#111827]">Johnson City, TN</option>
                  <option value="abingdon" className="bg-[#111827]">Abingdon, VA</option>
                  <option value="elizabethton" className="bg-[#111827]">Elizabethton, TN</option>
                </select>
              </div>
              <div>
                <label htmlFor="contact-message" className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Tell Us More</label>
                <textarea spellCheck={true} id="contact-message" name="message" rows={4} placeholder="Square footage needed, timeline, budget, special requirements..."
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(74,222,128,0.15)] rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 outline-none focus:border-[rgba(74,222,128,0.5)] transition-all resize-none" />
              </div>
              <button type="submit" id="contact-submit" className="btn-primary w-full py-4 justify-center text-base">
                Send Message — We Respond Within 24hrs <ArrowRight size={18} />
              </button>
              <p className="text-xs text-gray-600 text-center">
                Or call us directly at{" "}
                <a href={COMPANY.phoneHref} className="text-[#4ADE80] font-semibold">{COMPANY.phone}</a>
              </p>
            </form>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-5">
            {[
              { icon: <Phone size={20} />, label: "Call Us", value: COMPANY.phone, href: COMPANY.phoneHref, id: "contact-side-phone" },
              { icon: <Mail size={20} />, label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}`, id: "contact-side-email" },
              { icon: <MapPin size={20} />, label: "Our Office", value: COMPANY.fullAddress, href: "https://maps.google.com/?q=100+5th+St+Bristol+TN+37620", id: "contact-side-address" },
              { icon: <Clock size={20} />, label: "Hours", value: "Mon–Fri: 8:00 AM – 5:00 PM EST", href: null, id: "contact-side-hours" },
            ].map((item) => (
              <div key={item.id} className="glass rounded-xl p-5 border border-[rgba(74,222,128,0.1)]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.1)] flex items-center justify-center text-[#4ADE80] flex-shrink-0">{item.icon}</div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} id={item.id}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-sm font-semibold text-white hover:text-[#4ADE80] transition-colors break-all">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm font-semibold text-white">{item.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <div className="glass rounded-xl p-5 border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.04)]">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare size={18} className="text-[#4ADE80]" />
                <span className="text-sm font-bold text-white">Chat with Vision AI</span>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] pulse-green" />
                  <span className="text-[10px] text-[#4ADE80]">Online</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-3">Get instant answers about our properties, services, and the Tri-Cities CRE market.</p>
              <button
                id="contact-open-chat"
                onClick={() => (document.getElementById("lease-bot-toggle") as HTMLButtonElement)?.click()}
                className="btn-secondary w-full py-2.5 text-sm justify-center"
              >
                Ask VISION
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
