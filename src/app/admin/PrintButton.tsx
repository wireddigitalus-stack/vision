"use client";
import { Printer } from "lucide-react";

interface Props {
  /** Must match the id you put on the printable container: <div id={zoneId}> */
  zoneId: string;
  /** Label shown next to the printer icon */
  label?: string;
  /** Report title printed in the page header */
  title?: string;
}

export default function PrintButton({ zoneId, label = "Print / PDF", title }: Props) {
  const handlePrint = () => {
    // Inject a temporary <style> that scopes @media print to just this zone
    const existing = document.getElementById("__vision-print-style");
    if (existing) existing.remove();

    const style = document.createElement("style");
    style.id = "__vision-print-style";
    style.innerHTML = `
      @media print {
        /* Hide everything */
        body > * { display: none !important; }
        /* Show only our zone */
        #${zoneId} { display: block !important; }
        #${zoneId} * { color: #000 !important; background: #fff !important;
          border-color: #ccc !important; box-shadow: none !important; }
        /* Page meta */
        @page { margin: 18mm 15mm; }
      }
    `;

    // Inject title header into the zone temporarily
    const zone = document.getElementById(zoneId);
    let headerEl: HTMLElement | null = null;
    if (zone && title) {
      headerEl = document.createElement("div");
      headerEl.id = "__vision-print-header";
      headerEl.style.cssText =
        "font-family:sans-serif;font-size:18px;font-weight:900;margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid #000;display:flex;justify-content:space-between;align-items:center";
      headerEl.innerHTML = `
        <span>${title}</span>
        <span style="font-size:11px;font-weight:400;color:#555">
          Printed ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          &nbsp;·&nbsp; Vision LLC
        </span>`;
      zone.prepend(headerEl);
    }

    document.head.appendChild(style);
    window.print();

    // Clean up after print dialog closes
    setTimeout(() => {
      style.remove();
      headerEl?.remove();
    }, 1000);
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-400 hover:text-white hover:border-[rgba(255,255,255,0.25)] text-xs font-bold transition-all"
      title="Print or Save as PDF"
    >
      <Printer size={13} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
