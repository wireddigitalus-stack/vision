"use client";
import React, { useState } from "react";
import { FileText, Printer, Building2, MapPin, Ruler, CheckCircle2, ChevronDown } from "lucide-react";
import { PROPERTIES, COMPANY } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

type Property = (typeof PROPERTIES)[number];

// ─── One-Sheet HTML Builder ───────────────────────────────────────────────────

function buildOneSheetHTML(property: Property, baseUrl: string): string {
  const features = (property.features ?? [])
    .map(
      (f) => `
      <div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f0f0f0">
        <div style="width:18px;height:18px;border-radius:50%;background:#1a3a2a;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="color:#4ade80;font-size:10px;font-weight:900">✓</span>
        </div>
        <span style="font-size:10pt;color:#374151">${f}</span>
      </div>`
    )
    .join("");

  // Resolve absolute image URL for the popup window
  const imageUrl = (property as Property & { image?: string }).image
    ? `${baseUrl}${(property as Property & { image?: string }).image}`
    : null;

  const imageSrc = imageUrl
    ? `<div style="height:220px;overflow:hidden;border-radius:12px;margin-bottom:24px;position:relative">
        <img src="${imageUrl}" alt="${property.imageAlt ?? property.name}"
          style="width:100%;height:100%;object-fit:cover" />
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 60%)"></div>
        <div style="position:absolute;bottom:12px;left:14px">
          <span style="background:rgba(0,0,0,0.55);color:#fff;font-size:9pt;font-weight:700;padding:4px 10px;border-radius:20px;letter-spacing:.5px">
            ${(property as Property & { badge?: string }).badge ?? property.type}
          </span>
        </div>
      </div>`
    : `<div style="height:160px;border-radius:12px;margin-bottom:24px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:60px">🏢</div>`;

  // Second image if available
  const images = (property as Property & { images?: string[] }).images ?? [];
  const secondImageSrc =
    images[1]
      ? `<div style="margin-top:16px;height:150px;overflow:hidden;border-radius:10px">
          <img src="${baseUrl}${images[1]}" alt="${property.name}"
            style="width:100%;height:100%;object-fit:cover" />
        </div>`
      : "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <title>${property.name} — Vision LLC Property One-Sheet</title>
      <style>
        @page { margin: 0; size: letter; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          background: #fff;
          color: #111;
          width: 8.5in;
          min-height: 11in;
        }
        /* ── Header bar ── */
        .header {
          background: #0a1628;
          padding: 18px 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .header-brand { color: #fff; }
        .header-brand .company { font-size: 18pt; font-weight: 900; letter-spacing: -0.5px; color:#fff }
        .header-brand .tagline { font-size: 7.5pt; color: #94a3b8; margin-top: 2px; letter-spacing:.5px; text-transform:uppercase }
        .header-contact { text-align: right; }
        .header-contact p { font-size: 9pt; color: #94a3b8; line-height: 1.6 }
        .header-contact a { color: #4ade80; text-decoration: none; font-weight: 700 }
        /* ── Accent bar ── */
        .accent-bar { height: 4px; background: linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%) }
        /* ── Property name banner ── */
        .property-banner {
          padding: 22px 32px 18px;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
        }
        .property-type {
          font-size: 8pt;
          font-weight: 800;
          color: #4ade80;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          margin-bottom: 4px;
        }
        .property-name {
          font-size: 22pt;
          font-weight: 900;
          color: #0f172a;
          line-height: 1.1;
          margin-bottom: 6px;
        }
        .property-meta {
          display: flex;
          gap: 20px;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 9.5pt;
          color: #64748b;
        }
        .meta-icon { font-size: 11pt }
        .status-badge {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          background: #dcfce7;
          color: #15803d;
          font-size: 8pt;
          font-weight: 800;
          border: 1px solid #bbf7d0;
          letter-spacing: .3px;
        }
        /* ── Body grid ── */
        .body {
          display: flex;
          gap: 0;
          min-height: calc(11in - 200px);
        }
        .left-col {
          width: 58%;
          padding: 24px 24px 24px 32px;
          border-right: 1px solid #e5e7eb;
        }
        .right-col {
          width: 42%;
          padding: 24px 32px 24px 24px;
          background: #f8fafc;
        }
        .section-label {
          font-size: 7.5pt;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #94a3b8;
          margin-bottom: 10px;
          padding-bottom: 6px;
          border-bottom: 2px solid #e5e7eb;
        }
        .description {
          font-size: 10pt;
          line-height: 1.7;
          color: #374151;
          margin-bottom: 20px;
        }
        .highlights {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 14px 16px;
          margin-bottom: 20px;
        }
        .highlights-title {
          font-size: 9pt;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
        }
        /* ── CTA box ── */
        .cta-box {
          background: #0a1628;
          border-radius: 12px;
          padding: 18px 20px;
          margin-top: 20px;
          color: #fff;
        }
        .cta-box h3 {
          font-size: 12pt;
          font-weight: 900;
          margin-bottom: 10px;
          color: #fff;
        }
        .cta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .cta-icon { font-size: 13pt; flex-shrink: 0 }
        .cta-text { font-size: 10pt; color: #cbd5e1 }
        .cta-value { color: #4ade80; font-weight: 800 }
        /* ── Specs table ── */
        .specs-table { width: 100%; border-collapse: collapse; margin-bottom: 20px }
        .specs-table td { padding: 7px 0; border-bottom: 1px solid #e5e7eb; font-size: 9.5pt }
        .specs-table td:first-child { color: #94a3b8; font-weight: 600; width: 45% }
        .specs-table td:last-child { color: #0f172a; font-weight: 700 }
        /* ── Footer ── */
        .footer {
          padding: 12px 32px;
          background: #0a1628;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .footer p { font-size: 8pt; color: #64748b }
        .footer .web { color: #4ade80; font-weight: 700 }
        .footer .disclaimer { font-size: 7pt; color: #475569; text-align: right; max-width: 50% }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact }
          .header, .footer, .cta-box, .accent-bar, .property-banner { -webkit-print-color-adjust: exact; print-color-adjust: exact }
        }
      </style>
    </head>
    <body>

      <!-- Header -->
      <div class="header">
        <div class="header-brand">
          <div class="company">VISION LLC</div>
          <div class="tagline">Commercial Real Estate · Bristol, TN / VA</div>
        </div>
        <div class="header-contact">
          <p>📞 <a href="tel:${COMPANY.phoneHref}">${COMPANY.phone}</a></p>
          <p>✉ <a href="mailto:${COMPANY.email}">${COMPANY.email}</a></p>
          <p style="color:#64748b">${COMPANY.fullAddress}</p>
        </div>
      </div>
      <div class="accent-bar"></div>

      <!-- Property banner -->
      <div class="property-banner">
        <div class="property-type">${property.type} · ${(property as Property & { badge?: string }).badge ?? "Available"}</div>
        <div class="property-name">${property.name}</div>
        <div class="property-meta">
          <div class="meta-item"><span class="meta-icon">📍</span> ${property.city}</div>
          ${(property as Property & { address?: string }).address ? `<div class="meta-item"><span class="meta-icon">🏢</span> ${(property as Property & { address?: string }).address}</div>` : ""}
          <div class="meta-item"><span class="meta-icon">📐</span> ${property.sqft} sqft</div>
          <span class="status-badge">● ${property.status}</span>
        </div>
      </div>

      <!-- Body -->
      <div class="body">
        <!-- Left: images + description -->
        <div class="left-col">
          ${imageSrc}
          <div class="section-label">About This Property</div>
          <p class="description">${property.description}</p>
          ${secondImageSrc}
        </div>

        <!-- Right: specs + features + CTA -->
        <div class="right-col">
          <div class="section-label">Property Specs</div>
          <table class="specs-table">
            <tr><td>Property Type</td><td>${property.type}</td></tr>
            <tr><td>Available Space</td><td>${property.sqft} sqft</td></tr>
            <tr><td>Location</td><td>${property.city}</td></tr>
            <tr><td>Status</td><td>${property.status}</td></tr>
            ${(property as Property & { address?: string }).address ? `<tr><td>Address</td><td>${(property as Property & { address?: string }).address}</td></tr>` : ""}
          </table>

          <div class="section-label">Features &amp; Amenities</div>
          <div class="highlights">
            <div class="highlights-title">What's Included</div>
            ${features}
          </div>

          <div class="cta-box">
            <h3>Schedule a Showing</h3>
            <div class="cta-row">
              <span class="cta-icon">📞</span>
              <span class="cta-text">Call us: <span class="cta-value">${COMPANY.phone}</span></span>
            </div>
            <div class="cta-row">
              <span class="cta-icon">✉</span>
              <span class="cta-text">Email: <span class="cta-value">${COMPANY.email}</span></span>
            </div>
            <div class="cta-row">
              <span class="cta-icon">🌐</span>
              <span class="cta-text">Web: <span class="cta-value">teamvisionllc.com</span></span>
            </div>
            <div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.1)">
              <p style="font-size:8.5pt;color:#94a3b8;line-height:1.5">
                Vision LLC has been Downtown Bristol's #1 commercial property owner for over 20 years.
                Our team will personally walk you through every available space.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="footer">
        <div>
          <p class="web">teamvisionllc.com</p>
          <p>${COMPANY.fullAddress} · ${COMPANY.phone}</p>
        </div>
        <p class="disclaimer">
          Information is subject to change without notice. All square footages are approximate.
          Contact Vision LLC to confirm current availability and lease terms.
          Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
        </p>
      </div>

    </body>
    </html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertyOneSheet() {
  const [selected, setSelected] = useState<Property | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const handleGenerate = () => {
    if (!selected) return;
    setPreviewing(true);

    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : "https://teamvisionllc.com";

    const html = buildOneSheetHTML(selected, baseUrl);

    const win = window.open("", "_blank", "width=920,height=780,scrollbars=yes");
    if (!win) {
      alert("Pop-up blocked — please allow pop-ups for this site and try again.");
      setPreviewing(false);
      return;
    }

    win.document.write(html);
    win.document.close();

    win.onload = () => {
      setTimeout(() => {
        win.focus();
        win.print();
        setPreviewing(false);
      }, 400);
    };

    setTimeout(() => {
      if (!win.closed) {
        win.focus();
        win.print();
      }
      setPreviewing(false);
    }, 900);
  };

  return (
    <div className="mt-6 max-w-4xl">
      {/* Header */}
      <div className="rounded-2xl border border-[rgba(74,222,128,0.2)] bg-gradient-to-br from-[rgba(74,222,128,0.05)] via-transparent to-transparent p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-[#4ADE80] opacity-[0.03] blur-3xl pointer-events-none" />
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_14px_rgba(74,222,128,0.3)]">
            <FileText size={18} className="text-black" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white">Property One-Sheet Generator</h2>
            <p className="text-xs text-gray-500">Generate a branded, print-ready PDF for any Vision property</p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-3 leading-relaxed">
          Select a property below and click <strong className="text-gray-400">Generate One-Sheet</strong> — a
          professional brochure opens in a new window. Use your browser's&nbsp;
          <strong className="text-gray-400">Save as PDF</strong> option or print directly.
          Great for showings, email attachments, and listing folders.
        </p>
      </div>

      {/* Property grid */}
      <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">
        Select a Property
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {PROPERTIES.map((p) => {
          const isSelected = selected?.id === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className={`text-left rounded-xl border p-4 transition-all group ${
                isSelected
                  ? "border-[rgba(74,222,128,0.5)] bg-[rgba(74,222,128,0.07)] shadow-[0_0_16px_rgba(74,222,128,0.08)]"
                  : "border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] hover:border-[rgba(255,255,255,0.14)] hover:bg-[rgba(255,255,255,0.04)]"
              }`}
            >
              {/* Property image thumbnail */}
              <div className="w-full h-24 rounded-lg overflow-hidden mb-3 bg-[rgba(255,255,255,0.04)] relative">
                {(p as Property & { image?: string }).image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={(p as Property & { image?: string }).image}
                    alt={p.imageAlt ?? p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-3xl text-gray-700">🏢</div>
                )}
                {isSelected && (
                  <div className="absolute inset-0 bg-[rgba(74,222,128,0.15)] flex items-center justify-center">
                    <CheckCircle2 size={24} className="text-[#4ADE80] drop-shadow-lg" />
                  </div>
                )}
              </div>

              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={`text-sm font-bold leading-tight ${isSelected ? "text-[#4ADE80]" : "text-white"}`}>
                  {p.name}
                </p>
                {isSelected && <CheckCircle2 size={14} className="text-[#4ADE80] flex-shrink-0 mt-0.5" />}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1">
                <Building2 size={9} />
                <span>{p.type}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600 mb-1">
                <MapPin size={9} />
                <span>{p.city}</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-gray-600">
                <Ruler size={9} />
                <span>{p.sqft} sqft</span>
              </div>

              <div className={`mt-2 inline-block text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider ${
                p.status.toLowerCase().includes("available")
                  ? "bg-[rgba(74,222,128,0.1)] text-[#4ADE80] border border-[rgba(74,222,128,0.2)]"
                  : "bg-[rgba(250,204,21,0.08)] text-[#FACC15] border border-[rgba(250,204,21,0.15)]"
              }`}>
                {p.status}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected property preview + generate button */}
      {selected ? (
        <div className="rounded-2xl border border-[rgba(74,222,128,0.3)] bg-[rgba(74,222,128,0.04)] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Ready to generate:</p>
            <p className="text-base font-black text-white">{selected.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              {selected.type} · {selected.city} · {selected.sqft} sqft
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={previewing}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-black text-sm font-black hover:opacity-90 disabled:opacity-60 transition-all shadow-[0_0_20px_rgba(74,222,128,0.25)] flex-shrink-0"
          >
            <Printer size={15} />
            {previewing ? "Opening…" : "Generate One-Sheet PDF"}
          </button>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-[rgba(255,255,255,0.08)] p-6 flex items-center justify-center gap-3 text-gray-600">
          <ChevronDown size={14} className="animate-bounce" />
          <p className="text-sm">Select a property above to generate its one-sheet</p>
        </div>
      )}

      {/* Social copy generator teaser */}
      <div className="mt-8 rounded-2xl border border-[rgba(99,102,241,0.2)] bg-[rgba(99,102,241,0.04)] p-5">
        <div className="flex items-center gap-2.5 mb-2">
          <span className="text-lg">📣</span>
          <p className="text-sm font-black text-[#818cf8]">Coming Next: Social Media Copy Generator</p>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed">
          Auto-generate Facebook and Instagram post copy for any property — ready to copy-paste into Meta Business Suite.
          Focused on Bristol, TN/VA with Tri-Cities local keywords baked in.
        </p>
      </div>
    </div>
  );
}
