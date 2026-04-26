"use client";
import { useState, useEffect } from "react";
import { X, Loader2, Minus, Plus } from "lucide-react";
import PhotoCapture from "./PhotoCapture";
import SpeechTextarea from "./SpeechTextarea";

interface CompletionData {
  notes: string;
  photoUrl?: string;
  minutes?: number;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CompletionData) => Promise<void>;
  title: string;
  subtitle?: string;
  showTime?: boolean;
  accentColor?: string;
  submitLabel?: string;
}

export default function CompletionSheet({
  isOpen, onClose, onSubmit,
  title, subtitle,
  showTime = false,
  accentColor = "#4ADE80",
  submitLabel = "✓ Mark Done",
}: Props) {
  const [notes, setNotes] = useState("");
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();
  const [minutes, setMinutes] = useState(30);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) { setNotes(""); setPhotoUrl(undefined); setMinutes(30); }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await onSubmit({ notes, photoUrl, minutes: showTime ? minutes : undefined });
    } finally {
      setSubmitting(false);
    }
  };

  const fmtTime = (m: number) => {
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    const rem = m % 60;
    return rem === 0 ? `${h} hr` : `${h}h ${rem}m`;
  };

  const isLight = accentColor === "#FACC15" || accentColor === "#4ADE80";

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end" style={{ background: "rgba(0,0,0,0.8)" }}>
      <div
        className="bg-[#0D1117] rounded-t-3xl overflow-y-auto"
        style={{ maxHeight: "90vh", borderTop: `2px solid ${accentColor}50`, paddingBottom: "env(safe-area-inset-bottom, 24px)" }}
      >
        <div className="p-6">
          {/* Handle */}
          <div className="w-10 h-1 rounded-full bg-[rgba(255,255,255,0.1)] mx-auto mb-5" />

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-white">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="w-11 h-11 rounded-2xl flex items-center justify-center active:scale-90 transition-all"
              style={{ background: "rgba(255,255,255,0.07)" }}
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* ── Time Picker ── */}
          {showTime && (
            <div className="mb-6">
              <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">⏱ Time on Job</p>
              <div
                className="flex items-center gap-4 rounded-3xl p-4"
                style={{ background: "rgba(255,255,255,0.04)", border: "1.5px solid rgba(255,255,255,0.08)" }}
              >
                <button
                  onClick={() => setMinutes(m => Math.max(15, m - 15))}
                  className="w-16 h-16 rounded-2xl text-3xl font-black text-white flex items-center justify-center active:scale-90 transition-all"
                  style={{ background: "rgba(255,255,255,0.1)" }}
                >
                  <Minus size={24} />
                </button>
                <div className="flex-1 text-center">
                  <p className="text-4xl font-black text-white">{fmtTime(minutes)}</p>
                  <p className="text-xs text-gray-600 mt-1">tap +/− to adjust</p>
                </div>
                <button
                  onClick={() => setMinutes(m => Math.min(480, m + 15))}
                  className="w-16 h-16 rounded-2xl text-3xl font-black flex items-center justify-center active:scale-90 transition-all"
                  style={{ background: `${accentColor}20`, color: accentColor }}
                >
                  <Plus size={24} />
                </button>
              </div>
            </div>
          )}

          {/* ── Photo ── */}
          <div className="mb-6">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-3">📸 Photo Proof</p>
            <PhotoCapture
              label="📷 Take a Photo"
              onPhoto={url => setPhotoUrl(url)}
              onClear={() => setPhotoUrl(undefined)}
            />
          </div>

          {/* ── Notes / Speech ── */}
          <div className="mb-8">
            <SpeechTextarea
              label="📝 Notes (optional — tap mic to speak)"
              value={notes}
              onChange={setNotes}
              placeholder="Any notes about this job…"
              rows={3}
              accentColor={accentColor}
            />
          </div>

          {/* ── Submit ── */}
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-5 rounded-3xl text-lg font-black flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
            style={{
              background: submitting ? "rgba(255,255,255,0.1)" : accentColor,
              color: isLight ? "#000" : "#fff",
              boxShadow: submitting ? "none" : `0 4px 20px ${accentColor}40`,
            }}
          >
            {submitting
              ? <><Loader2 size={22} className="animate-spin" /> Saving…</>
              : submitLabel
            }
          </button>
        </div>
      </div>
    </div>
  );
}
