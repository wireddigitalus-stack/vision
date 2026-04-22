"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Upload, ImageIcon, CheckCircle2, Loader2, X, RefreshCw } from "lucide-react";
import { PROPERTIES } from "@/lib/data";

interface Override { property_id: string; image_url: string; updated_at: string }

export default function PropertyImageManager() {
  const [overrides, setOverrides]   = useState<Override[]>([]);
  const [uploading, setUploading]   = useState<string | null>(null);
  const [success, setSuccess]       = useState<string | null>(null);
  const [error, setError]           = useState<string | null>(null);
  const [preview, setPreview]       = useState<{ id: string; url: string } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement>>({});

  useEffect(() => { fetchOverrides(); }, []);

  async function fetchOverrides() {
    const res = await fetch("/api/property-images");
    const d   = await res.json();
    if (Array.isArray(d.overrides)) setOverrides(d.overrides);
  }

  function getImage(prop: typeof PROPERTIES[0]) {
    const ov = overrides.find(o => o.property_id === prop.id);
    return ov?.image_url || prop.image;
  }

  async function handleFileChange(propertyId: string, file: File) {
    if (!file) return;
    // Local preview
    const localUrl = URL.createObjectURL(file);
    setPreview({ id: propertyId, url: localUrl });
    setUploading(propertyId);
    setError(null);

    try {
      const form = new FormData();
      form.append("file", file);
      form.append("propertyId", propertyId);
      const res = await fetch("/api/property-images", { method: "POST", body: form });
      const d   = await res.json();
      if (!res.ok) throw new Error(d.error || "Upload failed");
      setOverrides(prev => {
        const next = prev.filter(o => o.property_id !== propertyId);
        return [...next, { property_id: propertyId, image_url: d.url, updated_at: new Date().toISOString() }];
      });
      setSuccess(propertyId);
      setTimeout(() => setSuccess(null), 3000);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(null);
      setPreview(null);
      URL.revokeObjectURL(localUrl);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs font-black text-[#60A5FA] uppercase tracking-widest">Property Gallery Manager</p>
          <p className="text-[11px] text-gray-600 mt-0.5">Upload new photos for any property. Changes go live on the site immediately.</p>
        </div>
        <button onClick={fetchOverrides} className="p-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-gray-500 hover:text-white transition-colors">
          <RefreshCw size={13} />
        </button>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-xl border border-red-500/30 bg-red-500/10 text-red-400 text-xs">
          <X size={12} />{error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={10} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {PROPERTIES.map(prop => {
          const isUploading = uploading === prop.id;
          const isSuccess   = success   === prop.id;
          const previewUrl  = preview?.id === prop.id ? preview.url : null;
          const imgSrc      = previewUrl || getImage(prop);
          const hasOverride = overrides.some(o => o.property_id === prop.id);

          return (
            <div key={prop.id} className="rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(255,255,255,0.02)] overflow-hidden group">
              {/* Image */}
              <div className="relative h-40 bg-[rgba(255,255,255,0.03)]">
                {imgSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={imgSrc}
                    alt={prop.name}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading ? "opacity-50" : "opacity-100"}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon size={28} className="text-gray-700" />
                  </div>
                )}

                {/* Uploading overlay */}
                {isUploading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <Loader2 size={22} className="animate-spin text-[#60A5FA] mb-2" />
                    <p className="text-xs text-gray-300 font-bold">Uploading…</p>
                  </div>
                )}

                {/* Success overlay */}
                {isSuccess && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60">
                    <CheckCircle2 size={24} className="text-[#4ADE80] mb-1" />
                    <p className="text-xs text-[#4ADE80] font-bold">Photo Updated!</p>
                  </div>
                )}

                {/* Custom photo badge */}
                {hasOverride && !isUploading && !isSuccess && (
                  <span className="absolute top-2 right-2 text-[9px] font-black px-2 py-0.5 rounded-full bg-[rgba(96,165,250,0.9)] text-black">
                    CUSTOM
                  </span>
                )}
              </div>

              {/* Info + upload button */}
              <div className="p-3">
                <p className="text-xs font-bold text-white truncate mb-0.5">{prop.name}</p>
                <p className="text-[10px] text-gray-600 mb-3">{prop.type} · {prop.city}</p>

                <input
                  ref={el => { if (el) fileRefs.current[prop.id] = el; }}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
                  className="hidden"
                  onChange={e => {
                    const f = e.target.files?.[0];
                    if (f) handleFileChange(prop.id, f);
                    e.target.value = "";
                  }}
                />

                <button
                  onClick={() => fileRefs.current[prop.id]?.click()}
                  disabled={isUploading}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[rgba(96,165,250,0.3)] text-[#60A5FA] text-xs font-bold hover:bg-[rgba(96,165,250,0.1)] transition-all disabled:opacity-40"
                >
                  {isUploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
                  {isUploading ? "Uploading…" : hasOverride ? "Change Photo" : "Upload Photo"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-gray-700 mt-3">Supports JPG, PNG, WEBP, HEIC. Photos go live on the website immediately after upload.</p>
    </div>
  );
}
