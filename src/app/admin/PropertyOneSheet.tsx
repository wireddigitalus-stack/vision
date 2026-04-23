"use client";
import React, { useState } from "react";
import { FileText, Printer, Building2, MapPin, Ruler, CheckCircle2, ChevronDown } from "lucide-react";
import { PROPERTIES, COMPANY } from "@/lib/data";

// ─── Types ────────────────────────────────────────────────────────────────────

type Property = (typeof PROPERTIES)[number];

// ─── Image → base64 helper ───────────────────────────────────────────────────
// Fetches an image by URL and returns it as a data URI so it's embedded
// directly in the popup HTML — the PDF always shows it regardless of timing.
async function toDataUri(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    return await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch {
    return ""; // shows placeholder emoji if fetch fails
  }
}

// ─── One-Sheet HTML Builder ───────────────────────────────────────────────────

function buildOneSheetHTML(property: Property, baseUrl: string, imageDataUri: string = ""): string {
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

  // Use the embedded base64 URI if available, otherwise fall back to the absolute URL
  const imageUrl = imageDataUri
    || ((property as Property & { image?: string }).image
      ? `${baseUrl}${(property as Property & { image?: string }).image}`
      : null);

  const imageSrc = imageUrl
    ? `<div style="height:180px;overflow:hidden;border-radius:10px;margin-bottom:14px;position:relative">
        <img src="${imageUrl}" alt="${property.imageAlt ?? property.name}"
          style="width:100%;height:100%;object-fit:cover" />
        <div style="position:absolute;inset:0;background:linear-gradient(to top,rgba(0,0,0,0.35) 0%,transparent 60%)"></div>
        <div style="position:absolute;bottom:10px;left:12px">
          <span style="background:rgba(0,0,0,0.55);color:#fff;font-size:8.5pt;font-weight:700;padding:3px 9px;border-radius:20px;letter-spacing:.5px">
            ${(property as Property & { badge?: string }).badge ?? property.type}
          </span>
        </div>
      </div>`
    : `<div style="height:120px;border-radius:10px;margin-bottom:14px;background:#f3f4f6;display:flex;align-items:center;justify-content:center;font-size:48px">🏢</div>`;

  // Second image suppressed — keeps content to one page
  const secondImageSrc = "";

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8"/>
      <title>${property.name} — Vision LLC Property One-Sheet</title>
      <style>
        @page { margin: 0; size: letter portrait; }
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
          background: #0a1628; /* matches header/footer so no bare white strip */
          color: #111;
          width: 100%;
          height: 100%;
          margin: 0;
          overflow: hidden;
        }

        /* ── Page wrapper: fills the window, 8.5in only matters at print time ── */
        .page {
          width: 100%;
          height: 100vh;
          min-height: 100%;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        /* ── Header bar ── */
        .header {
          background: #0a1628;
          padding: 14px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .header-brand .company { font-size: 16pt; font-weight: 900; letter-spacing: -0.5px; color:#fff }
        .header-brand .tagline { font-size: 7pt; color: #94a3b8; margin-top: 2px; letter-spacing:.5px; text-transform:uppercase }
        .header-contact { text-align: right; }
        .header-contact p { font-size: 8.5pt; color: #94a3b8; line-height: 1.5 }
        .header-contact a { color: #4ade80; text-decoration: none; font-weight: 700 }

        /* ── Accent bar ── */
        .accent-bar { height: 3px; background: linear-gradient(90deg, #4ade80 0%, #22c55e 50%, #16a34a 100%); flex-shrink: 0 }

        /* ── Property name banner ── */
        .property-banner {
          padding: 12px 28px 10px;
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          flex-shrink: 0;
        }
        .property-type { font-size: 7.5pt; font-weight: 800; color: #4ade80; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 2px; }
        .property-name { font-size: 18pt; font-weight: 900; color: #0f172a; line-height: 1.1; margin-bottom: 5px; }
        .property-meta { display: flex; gap: 16px; flex-wrap: wrap; align-items: center; }
        .meta-item { display: flex; align-items: center; gap: 4px; font-size: 9pt; color: #64748b; }
        .status-badge {
          display: inline-block; padding: 2px 9px; border-radius: 20px;
          background: #dcfce7; color: #15803d; font-size: 7.5pt; font-weight: 800;
          border: 1px solid #bbf7d0;
        }

        /* ── Body: fills remaining vertical space ── */
        .body {
          display: flex;
          flex: 1;
          overflow: hidden;
          min-height: 0;
        }
        .left-col {
          width: 58%;
          padding: 16px 20px 16px 28px;
          border-right: 1px solid #e5e7eb;
          overflow: hidden;
        }
        .right-col {
          width: 42%;
          padding: 16px 28px 16px 20px;
          background: #f8fafc;
          overflow: hidden;
        }
        .section-label {
          font-size: 7pt; font-weight: 800; text-transform: uppercase;
          letter-spacing: 1.5px; color: #94a3b8;
          margin-bottom: 7px; padding-bottom: 5px; border-bottom: 2px solid #e5e7eb;
        }
        .description {
          font-size: 9.5pt; line-height: 1.6; color: #374151; margin-bottom: 12px;
        }
        .highlights {
          background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
          padding: 10px 13px; margin-bottom: 12px;
        }
        .highlights-title { font-size: 8.5pt; font-weight: 800; color: #0f172a; margin-bottom: 6px; }

        /* ── Features rows ── */
        .feat-row { display:flex; align-items:center; gap:7px; padding:5px 0; border-bottom:1px solid #f0f0f0ь }

        /* ── CTA box ── */
        .cta-box {
          background: #0a1628; border-radius: 10px; padding: 13px 16px; margin-top: 10px; color: #fff;
        }
        .cta-box h3 { font-size: 10.5pt; font-weight: 900; margin-bottom: 8px; color: #fff; }
        .cta-row { display: flex; align-items: center; gap: 7px; margin-bottom: 5px; }
        .cta-icon { font-size: 11pt; flex-shrink: 0 }
        .cta-text { font-size: 9.5pt; color: #cbd5e1 }
        .cta-value { color: #4ade80; font-weight: 800 }

        /* ── Specs table ── */
        .specs-table { width: 100%; border-collapse: collapse; margin-bottom: 12px }
        .specs-table td { padding: 5px 0; border-bottom: 1px solid #e5e7eb; font-size: 9pt }
        .specs-table td:first-child { color: #94a3b8; font-weight: 600; width: 45% }
        .specs-table td:last-child { color: #0f172a; font-weight: 700 }

        /* ── Footer: pinned to bottom of the page wrapper ── */
        .footer {
          padding: 9px 28px;
          background: #0a1628;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
        }
        .footer p { font-size: 7.5pt; color: #64748b; line-height: 1.4 }
        .footer .web { color: #4ade80; font-weight: 700 }
        .footer .disclaimer { font-size: 6.5pt; color: #475569; text-align: right; max-width: 55% }

        @media print {
          html, body { -webkit-print-color-adjust: exact; print-color-adjust: exact }
          .page, .header, .footer, .cta-box, .accent-bar, .property-banner {
            -webkit-print-color-adjust: exact; print-color-adjust: exact
          }
        }
      </style>
    </head>
    <body>
      <div class="page">

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
            <div class="meta-item">📍 ${property.city}</div>
            ${(property as Property & { address?: string }).address ? `<div class="meta-item">🏢 ${(property as Property & { address?: string }).address}</div>` : ""}
            <div class="meta-item">📐 ${property.sqft} sqft</div>
            <span class="status-badge">● ${property.status}</span>
          </div>
        </div>

        <!-- Body: fills remaining space between banner and footer -->
        <div class="body">

          <!-- Left: image + description -->
          <div class="left-col">
            ${imageSrc}
            <div class="section-label">About This Property</div>
            <p class="description">${property.description}</p>
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
              <div style="margin-top:10px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.1)">
                <p style="font-size:8pt;color:#94a3b8;line-height:1.5">
                  Vision LLC — Downtown Bristol's #1 commercial property owner for 20+ years.
                  Our team will personally walk you through every available space.
                </p>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer: pinned inside .page flex column at the bottom -->
        <div class="footer">
          <div>
            <p class="web">teamvisionllc.com</p>
            <p>${COMPANY.fullAddress} · ${COMPANY.phone}</p>
          </div>
          <p class="disclaimer">
            Information subject to change without notice. All square footages approximate.<br/>
            Contact Vision LLC to confirm availability &amp; lease terms.<br/>
            Generated ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.
          </p>
        </div>

      </div><!-- /.page -->
    </body>
    </html>`;  
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PropertyOneSheet() {
  const [selected, setSelected] = useState<Property | null>(null);
  const [previewing, setPreviewing] = useState(false);

  const handleGenerate = async () => {
    if (!selected) return;
    setPreviewing(true);

    const baseUrl =
      typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : "https://teamvisionllc.com";

    // Fetch the image and embed it as base64 so the PDF always shows it
    const imgPath = (selected as Property & { image?: string }).image;
    const imageDataUri = imgPath ? await toDataUri(`${baseUrl}${imgPath}`) : "";

    const html = buildOneSheetHTML(selected, baseUrl, imageDataUri);

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
      }, 800);
    };

    setTimeout(() => {
      if (!win.closed) {
        win.focus();
        win.print();
      }
      setPreviewing(false);
    }, 1400);
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
