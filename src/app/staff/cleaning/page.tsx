"use client";
import { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, Clock, Plus, X, Send, Loader2,
  MapPin, User, AlertTriangle, Sparkles, ChevronRight,
} from "lucide-react";


// ─── Types ───────────────────────────────────────────────────────────────────

interface Assignment {
  id: string;
  workerName: string;
  property: string;
  area: string;
  scheduledDate: string;
  startTime: string | null;
  endTime: string | null;
  completedAt: string | null;
  notes: string;
  status: "pending" | "in_progress" | "done";
}

function rowToAssignment(r: Record<string, unknown>): Assignment {
  return {
    id: r.id as string,
    workerName: (r.worker_name as string) || "",
    property: (r.property as string) || "",
    area: (r.area as string) || "",
    scheduledDate: (r.scheduled_date as string) || "",
    startTime: (r.start_time as string) || null,
    endTime: (r.end_time as string) || null,
    completedAt: (r.completed_at as string) || null,
    notes: (r.notes as string) || "",
    status: (r.status as Assignment["status"]) || "pending",
  };
}

const FALLBACK_CLEANERS = ["Sarah M.", "Linda K.", "Priya R.", "Jess T.", "Other"];
const ISSUE_TYPES = ["Damage", "Biohazard", "Equipment", "Pest", "Plumbing", "Other"];


// ─── Report Issue Modal ───────────────────────────────────────────────────────

function ReportIssueModal({ workerName, onClose, onSubmit }: { workerName: string; onClose: () => void; onSubmit: () => void }) {
  const [type, setType] = useState("Other");
  const [location, setLocation] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!location.trim()) return;
    setSaving(true);
    await fetch("/api/maintenance", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: `${type} — ${location}`,
        category: type, priority: 2,
        building: location, description: desc,
        reportedBy: workerName, status: "open", source: "cleaning",
      }),
    });
    setSaving(false);
    onSubmit();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col justify-end">
      <div className="bg-[#0D1117] border-t border-[rgba(239,68,68,0.35)] rounded-t-3xl p-6 pb-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-black text-white">Report Issue</h2>
            <p className="text-xs text-gray-500">Goes straight to maintenance queue</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-[rgba(255,255,255,0.06)] flex items-center justify-center"><X size={18} /></button>
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Type of Issue</p>
        <div className="flex flex-wrap gap-2 mb-5">
          {ISSUE_TYPES.map(t => (
            <button key={t} onClick={() => setType(t)}
              className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${type === t ? "bg-[rgba(239,68,68,0.12)] border-[rgba(239,68,68,0.45)] text-red-400" : "border-[rgba(255,255,255,0.08)] text-gray-500"}`}>
              {t}
            </button>
          ))}
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Location *</p>
        <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Building A, Room 102"
          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl px-4 py-3.5 text-base text-white outline-none focus:border-[rgba(239,68,68,0.5)] placeholder:text-gray-600 mb-4" />

        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Details</p>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={3} placeholder="What did you find?"
          className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl px-4 py-3 text-sm text-white outline-none focus:border-[rgba(239,68,68,0.4)] placeholder:text-gray-600 resize-none mb-6" />

        <button onClick={submit} disabled={saving || !location.trim()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-base font-black flex items-center justify-center gap-2 disabled:opacity-40">
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {saving ? "Submitting…" : "Send to Maintenance"}
        </button>
      </div>
    </div>
  );
}

// ─── Assignment Card ──────────────────────────────────────────────────────────

function AssignmentCard({ a, onComplete }: { a: Assignment; onComplete: (id: string) => Promise<void> }) {
  const [updating, setUpdating] = useState(false);
  const isDone = a.status === "done";

  const complete = async () => {
    setUpdating(true);
    await onComplete(a.id);
    setUpdating(false);
  };

  return (
    <div className={`rounded-3xl border p-5 transition-all ${
      isDone ? "bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.3)] opacity-70" : "bg-[rgba(255,255,255,0.04)] border-[rgba(255,255,255,0.09)]"
    }`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <MapPin size={14} className={isDone ? "text-[#4ADE80]" : "text-[#60A5FA]"} />
            <span className="text-white font-bold text-base">{a.property}</span>
          </div>
          <p className="text-gray-400 text-sm ml-5">{a.area}</p>
          {(a.startTime || a.endTime) && (
            <p className="text-gray-600 text-xs ml-5 mt-1 flex items-center gap-1">
              <Clock size={10} /> {a.startTime || "—"} {a.endTime ? `→ ${a.endTime}` : ""}
            </p>
          )}
        </div>
        {isDone && (
          <div className="flex-shrink-0">
            <CheckCircle2 size={28} className="text-[#4ADE80]" />
          </div>
        )}
      </div>

      {!isDone && (
        <button onClick={complete} disabled={updating}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-black text-base font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50">
          {updating ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
          {updating ? "Marking done…" : "✓ Mark Cleaned"}
        </button>
      )}
      {isDone && (
        <p className="text-xs text-[#4ADE80] mt-1 flex items-center gap-1">
          <CheckCircle2 size={11} /> Completed {a.completedAt ? new Date(a.completedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : ""}
        </p>
      )}
    </div>
  );
}

// ─── Name Selector ────────────────────────────────────────────────────────────

function NameSelector({ onSelect }: { onSelect: (name: string) => void }) {
  const [cleaners, setCleaners] = useState<string[]>(FALLBACK_CLEANERS);
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  useEffect(() => {
    fetch("/api/allowed-users?role=cleaning")
      .then(r => r.json())
      .then(d => {
        const names = (d.users || []).map((u: { name: string }) => u.name).filter(Boolean) as string[];
        if (names.length > 0) setCleaners([...names, "Other"]);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-[#080C14] flex flex-col items-center justify-center px-6 py-12">
      <div className="text-5xl mb-4">🧹</div>
      <h1 className="text-3xl font-black text-white text-center mb-2">Cleaning Portal</h1>
      <p className="text-gray-500 text-center mb-10">Who are you?</p>
      <div className="w-full max-w-sm space-y-3">
        {cleaners.map(w => (
          <button key={w} onClick={() => w === "Other" ? setShowCustom(true) : onSelect(w)}
            className="w-full py-5 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.09)] text-white text-lg font-bold text-left px-6 flex items-center gap-3 hover:bg-[rgba(255,255,255,0.09)] transition-all active:scale-95">
            <User size={20} className="text-[#4ADE80]" /> {w}
          </button>
        ))}
        {showCustom && (
          <div className="flex gap-2">
            <input value={custom} onChange={e => setCustom(e.target.value)} placeholder="Your name"
              className="flex-1 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.12)] rounded-2xl px-4 py-4 text-white outline-none text-lg focus:border-[rgba(74,222,128,0.5)]" />
            <button onClick={() => custom.trim() && onSelect(custom.trim())}
              className="px-5 py-4 rounded-2xl bg-[#4ADE80] text-black font-black">Go</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CleaningStaffPage() {
  const [workerName, setWorkerName] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const todayFormatted = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  useEffect(() => {
    const saved = localStorage.getItem("vision_cleaning_name");
    if (saved) setWorkerName(saved);
  }, []);

  const handleSelectName = (name: string) => {
    localStorage.setItem("vision_cleaning_name", name);
    setWorkerName(name);
  };

  const fetchAssignments = useCallback(async () => {
    if (!workerName) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cleaning?date=${today}&worker=${encodeURIComponent(workerName)}`);
      const data = await res.json();
      if (Array.isArray(data.assignments)) {
        setAssignments(data.assignments.map(rowToAssignment));
      }
    } finally { setLoading(false); }
  }, [workerName, today]);

  useEffect(() => { fetchAssignments(); }, [fetchAssignments]);

  const handleComplete = async (id: string) => {
    await fetch(`/api/cleaning?id=${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "done", completedAt: new Date().toISOString() }),
    });
    setAssignments(prev => prev.map(a => a.id === id ? { ...a, status: "done", completedAt: new Date().toISOString() } : a));
  };

  if (!workerName) return <NameSelector onSelect={handleSelectName} />;

  const pending = assignments.filter(a => a.status !== "done");
  const done = assignments.filter(a => a.status === "done");
  const allDone = assignments.length > 0 && pending.length === 0;

  return (
    <div className="min-h-screen bg-[#080C14] text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[rgba(8,12,20,0.95)] backdrop-blur-sm border-b border-[rgba(255,255,255,0.06)] px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center text-xl">
            🧹
          </div>
          <div>
            <p className="text-xs text-gray-500 font-semibold">Cleaning</p>
            <p className="text-sm font-black text-white">{workerName}</p>
          </div>
        </div>
        <button onClick={() => { localStorage.removeItem("vision_cleaning_name"); setWorkerName(null); }}
          className="text-xs text-gray-600 px-3 py-2 rounded-xl border border-[rgba(255,255,255,0.07)]">Switch</button>
      </div>

      {/* Date + progress */}
      <div className="px-4 pt-5 pb-2">
        <p className="text-gray-500 text-sm mb-1">{todayFormatted}</p>
        {allDone ? (
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-[#4ADE80]" />
            <h1 className="text-2xl font-black text-[#4ADE80]">All done today! 🎉</h1>
          </div>
        ) : (
          <h1 className="text-2xl font-black text-white">
            {pending.length} location{pending.length !== 1 ? "s" : ""} remaining
          </h1>
        )}
      </div>

      {/* Progress bar */}
      {assignments.length > 0 && (
        <div className="px-4 mb-4">
          <div className="h-2 rounded-full bg-[rgba(255,255,255,0.07)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#4ADE80] to-[#22C55E] transition-all duration-500"
              style={{ width: `${Math.round((done.length / assignments.length) * 100)}%` }} />
          </div>
          <p className="text-xs text-gray-600 mt-1">{done.length} of {assignments.length} complete</p>
        </div>
      )}

      {/* Cards */}
      <div className="px-4 pb-36 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#4ADE80]" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-white font-bold text-lg">No assignments today</p>
            <p className="text-gray-600 text-sm mt-2">Your supervisor will add your schedule here.</p>
          </div>
        ) : (
          <>
            {pending.map(a => <AssignmentCard key={a.id} a={a} onComplete={handleComplete} />)}
            {done.length > 0 && (
              <>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-widest pt-3">Completed</p>
                {done.map(a => <AssignmentCard key={a.id} a={a} onComplete={handleComplete} />)}
              </>
            )}
          </>
        )}
      </div>

      {/* Submitted toast */}
      {submitted && (
        <div className="fixed top-20 left-4 right-4 z-50 bg-red-500 text-white rounded-2xl px-5 py-3 font-bold text-center text-sm">
          ⚠️ Issue reported to maintenance team
        </div>
      )}

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[rgba(8,12,20,0.97)] border-t border-[rgba(255,255,255,0.07)] p-4 pb-8 flex gap-3">
        <button onClick={fetchAssignments}
          className="flex-1 py-4 rounded-2xl bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.1)] text-white font-bold flex items-center justify-center gap-2">
          <ChevronRight size={16} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
        <button onClick={() => setShowReport(true)}
          className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 text-white text-base font-black flex items-center justify-center gap-2">
          <AlertTriangle size={18} /> Report Issue
        </button>
      </div>

      {showReport && (
        <ReportIssueModal workerName={workerName} onClose={() => setShowReport(false)} onSubmit={() => {
          setSubmitted(true);
          setTimeout(() => setSubmitted(false), 3000);
        }} />
      )}
    </div>
  );
}
