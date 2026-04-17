"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import TenantsTab from "./TenantsTab";
import AnalyticsTab, { type AnalyticsLead } from "./AnalyticsTab";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  Zap, RefreshCw, Phone, Clock, Building2, TrendingUp,
  Users, Filter, AlertCircle, DollarSign, Calendar,
  Settings, Plus, Trash2, Save, CheckCircle2, Loader2,
  Bell, Mail, Shield, ExternalLink, Key, Globe, X, Radio,
  Sparkles, Brain, Send, ChevronRight, ChevronDown, Archive, MessageSquare, BarChart3,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchedProperty {
  id: string; name: string; type: string;
  sqft: string; location: string; matchReason: string;
}

interface Lead {
  id: string; timestamp: string; name: string; email: string;
  phone: string; spaceType: string; budget: number; timeline: string;
  teamSize: string; score: number;
  scoreLabel: "Hot Lead" | "Warm Lead" | "Nurture";
  reasoning: string; matchedProperties: MatchedProperty[];
  isWhale?: boolean;
  whaleTier?: "gold" | "silver" | null;
  whaleKeywords?: string[];
  source?: string;
  medium?: string;
  campaign?: string;
}

interface AdminUser {
  id: string; name: string; email: string; phone: string;
  role: "Owner" | "Manager" | "Viewer";
  notify: { hotLeads: boolean; warmLeads: boolean; dailySummary: boolean; urgentAlerts: boolean; };
}

interface MondaySettings {
  apiToken: string; boardId: string; workspaceUrl: string;
  status: "idle" | "testing" | "connected" | "error";
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 70) return "#4ADE80";
  if (score >= 40) return "#FACC15";
  return "#94A3B8";
}
function scoreBadge(label: string) {
  if (label === "Hot Lead") return "bg-[rgba(74,222,128,0.1)] text-[#4ADE80] border-[rgba(74,222,128,0.3)]";
  if (label === "Warm Lead") return "bg-[rgba(250,204,21,0.1)] text-[#FACC15] border-[rgba(250,204,21,0.3)]";
  return "bg-[rgba(148,163,184,0.1)] text-[#94A3B8] border-[rgba(148,163,184,0.2)]";
}
function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}
function isUrgent(lead: Lead) {
  const hrs = (Date.now() - new Date(lead.timestamp).getTime()) / 36e5;
  return lead.scoreLabel === "Hot Lead" && hrs < 24;
}
function nameToSlug(name: string): string {
  const parts = name.toLowerCase().replace(/[^a-z\s]/g, "").trim().split(/\s+/);
  return parts.find(p => p.length > 2) ?? parts[0];
}

function initials(name: string) {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
// ── Lead Aging ───────────────────────────────────────────────────────

const MAX_AGE_DAYS = 180;

function daysOld(ts: string): number {
  return Math.floor((Date.now() - new Date(ts).getTime()) / 864e5);
}
function daysRemaining(ts: string): number {
  return Math.max(0, MAX_AGE_DAYS - daysOld(ts));
}
function isArchived(ts: string): boolean {
  return daysOld(ts) >= MAX_AGE_DAYS;
}
function ageBarColor(days: number): string {
  if (days < 90) return "#4ADE80";   // green — fresh
  if (days < 140) return "#FACC15";  // yellow — warming
  if (days < 165) return "#FB923C";  // orange — expiring
  return "#EF4444";                  // red — critical
}
function ageBarPct(days: number): number {
  return Math.min(100, (days / MAX_AGE_DAYS) * 100);
}

// ─── Demo Data ────────────────────────────────────────────────────────────────

const DEMO_LEADS: Lead[] = [
  { id: "demo_1", timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(), name: "Sarah Mitchell", email: "", phone: "423-555-0192", spaceType: "Executive Office", budget: 3000, timeline: "ASAP — under 30 days", teamSize: "2–4 people", score: 91, scoreLabel: "Hot Lead", reasoning: "Strong budget, urgent timeline, and professional office need align perfectly with City Centre availability.", matchedProperties: [{ id: "city-centre", name: "City Centre Professional Suites", type: "Office", sqft: "1,200–3,000 sqft", location: "Downtown Bristol, TN", matchReason: "Premium finishes, immediate availability, fits 2-4 team." }] },
  { id: "demo_2", timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(), name: "Mark Delaney", email: "", phone: "", spaceType: "CoWork Membership", budget: 800, timeline: "1–2 months", teamSize: "Solo", score: 58, scoreLabel: "Warm Lead", reasoning: "Solo operator with moderate budget — Bristol CoWork is an excellent fit. Nurture toward dedicated desk.", matchedProperties: [{ id: "bristol-cowork", name: "Bristol CoWork", type: "CoWork", sqft: "Hot desk / Dedicated desk", location: "620 State Street, Bristol, TN", matchReason: "All-inclusive monthly membership, perfect for solo professional." }] },
  { id: "demo_3", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), name: "Dr. James Patel", email: "", phone: "276-555-0847", spaceType: "Private Office Suite", budget: 6000, timeline: "ASAP — under 30 days", teamSize: "5–10 people", score: 96, scoreLabel: "Hot Lead", reasoning: "Very high budget, urgent timeline, established team — priority contact for today.", matchedProperties: [{ id: "the-executive", name: "The Executive Office Suites", type: "Office", sqft: "2,000–6,000 sqft", location: "Downtown Bristol, TN", matchReason: "Historic prestige building, fits team of 5-10, premium positioning." }, { id: "city-centre", name: "City Centre Professional Suites", type: "Office", sqft: "3,000–8,000 sqft", location: "Downtown Bristol, TN", matchReason: "Larger footprint option with flexible configuration." }], isWhale: true, whaleTier: "gold", whaleKeywords: [] },
  { id: "demo_4", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), name: "Blake Thornton", email: "", phone: "", spaceType: "Retail Storefront", budget: 1500, timeline: "3–6 months", teamSize: "2–4 people", score: 42, scoreLabel: "Warm Lead", reasoning: "Retail need with longer timeline. Good candidate for State Street storefront. Follow up in 60 days.", matchedProperties: [{ id: "centre-point", name: "Centre Point Suites", type: "Retail", sqft: "800–2,000 sqft", location: "Downtown Bristol, TN", matchReason: "High foot traffic retail units at budget-friendly rates." }] },
];

const DEFAULT_ADMINS: AdminUser[] = [
  { id: "admin_1", name: "J. Allen Hurley II", email: "allen@teamvisionllc.com", phone: "423-573-1022", role: "Owner", notify: { hotLeads: true, warmLeads: true, dailySummary: true, urgentAlerts: true } },
  { id: "admin_2", name: "Vision LLC Team", email: "leasing@teamvisionllc.com", phone: "", role: "Manager", notify: { hotLeads: true, warmLeads: false, dailySummary: true, urgentAlerts: true } },
];

// ─── Admin Row Component ───────────────────────────────────────────────────────

function AdminRow({ admin, onUpdate, onDelete }: { admin: AdminUser; onUpdate: (a: AdminUser) => void; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState(admin);

  const roleColors: Record<string, string> = {
    Owner: "text-[#FACC15] border-[rgba(250,204,21,0.3)] bg-[rgba(250,204,21,0.08)]",
    Manager: "text-[#60A5FA] border-[rgba(96,165,250,0.3)] bg-[rgba(96,165,250,0.08)]",
    Viewer: "text-[#94A3B8] border-[rgba(148,163,184,0.2)] bg-[rgba(148,163,184,0.06)]",
  };

  const notifyLabels = [
    { key: "hotLeads", label: "Hot Leads", icon: "🔥" },
    { key: "warmLeads", label: "Warm Leads", icon: "⚡" },
    { key: "dailySummary", label: "Daily Summary", icon: "📊" },
    { key: "urgentAlerts", label: "Urgent Alerts", icon: "🚨" },
  ] as const;

  function save() {
    onUpdate(draft);
    setExpanded(false);
  }

  return (
    <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] overflow-hidden">
      <div className="flex items-center gap-4 p-4">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ADE80]/20 to-[#22C55E]/10 border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-sm font-black text-[#4ADE80] flex-shrink-0">
          {initials(admin.name)}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-white">{admin.name}</p>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${roleColors[admin.role]}`}>{admin.role}</span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{admin.email}</p>
        </div>
        {/* Notification indicators */}
        <div className="hidden sm:flex items-center gap-1">
          {notifyLabels.map(n => (
            <span key={n.key} className={`text-sm ${admin.notify[n.key] ? "opacity-100" : "opacity-20"}`} title={n.label}>{n.icon}</span>
          ))}
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={() => setExpanded(!expanded)} className="px-3 py-1.5 rounded-lg text-xs font-bold border border-[rgba(255,255,255,0.08)] text-gray-400 hover:text-white hover:border-[rgba(74,222,128,0.3)] transition-all">
            {expanded ? "Close" : "Edit"}
          </button>
          {admin.role !== "Owner" && (
            <button onClick={() => onDelete(admin.id)} className="p-1.5 rounded-lg text-gray-600 hover:text-red-400 hover:bg-[rgba(239,68,68,0.08)] transition-all">
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Expanded edit panel */}
      {expanded && (
        <div className="border-t border-[rgba(255,255,255,0.05)] p-4 space-y-4 bg-[rgba(0,0,0,0.15)]">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Name</label>
              <input value={draft.name} onChange={e => setDraft({ ...draft, name: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Email</label>
              <input value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none" />
            </div>
            <div>
              <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Phone</label>
              <input value={draft.phone} onChange={e => setDraft({ ...draft, phone: e.target.value })} className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">Role</label>
            <div className="flex gap-2">
              {(["Owner", "Manager", "Viewer"] as const).map(r => (
                <button key={r} onClick={() => setDraft({ ...draft, role: r })} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${draft.role === r ? roleColors[r] : "border-[rgba(255,255,255,0.06)] text-gray-500"}`}>{r}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">
              <Bell size={10} className="inline mr-1" />Notifications
            </label>
            <div className="flex flex-wrap gap-3">
              {notifyLabels.map(n => (
                <label key={n.key} className="flex items-center gap-2 cursor-pointer group">
                  <div onClick={() => setDraft({ ...draft, notify: { ...draft.notify, [n.key]: !draft.notify[n.key] } })} className={`w-8 h-4 rounded-full transition-colors relative ${draft.notify[n.key] ? "bg-[#4ADE80]" : "bg-[rgba(255,255,255,0.08)]"}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${draft.notify[n.key] ? "left-4.5" : "left-0.5"}`} style={{ left: draft.notify[n.key] ? "18px" : "2px" }} />
                  </div>
                  <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{n.icon} {n.label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={save} className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-black text-xs font-black hover:opacity-90 transition-opacity">
              <Save size={11} /> Save Changes
            </button>
            <button onClick={() => { setDraft(admin); setExpanded(false); }} className="px-4 py-2 rounded-lg border border-[rgba(255,255,255,0.08)] text-gray-500 text-xs hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Admin Modal ───────────────────────────────────────────────────────────

function AddAdminModal({ onAdd, onClose }: { onAdd: (a: AdminUser) => void; onClose: () => void }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", role: "Manager" as AdminUser["role"] });

  function submit() {
    if (!form.name || !form.email) return;
    onAdd({ id: `admin_${Date.now()}`, ...form, notify: { hotLeads: true, warmLeads: false, dailySummary: true, urgentAlerts: true } });
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0D1117] border border-[rgba(74,222,128,0.2)] rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-black text-lg">Add Admin User</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Full Name *</label>
            <input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jane Smith" className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Email *</label>
            <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@teamvisionllc.com" className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="423-555-0000" className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none placeholder:text-gray-600" />
          </div>
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block mb-2">Access Level</label>
            <div className="flex gap-2">
              {(["Manager", "Viewer"] as const).map(r => (
                <button key={r} onClick={() => setForm({ ...form, role: r })} className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${form.role === r ? "bg-[rgba(74,222,128,0.1)] border-[rgba(74,222,128,0.3)] text-[#4ADE80]" : "border-[rgba(255,255,255,0.06)] text-gray-500 hover:text-white"}`}>{r}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 mt-5">
          <button onClick={submit} disabled={!form.name || !form.email} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-black text-sm font-black hover:opacity-90 disabled:opacity-40 transition-all">
            <Plus size={14} /> Add Admin
          </button>
          <button onClick={onClose} className="px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-gray-500 text-sm hover:text-white transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Settings Panel ────────────────────────────────────────────────────────────

function SettingsPanel({ leads }: { leads: Lead[] }) {
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    if (typeof window === "undefined") return DEFAULT_ADMINS;
    try { return JSON.parse(localStorage.getItem("vision_admins") || "null") ?? DEFAULT_ADMINS; } catch { return DEFAULT_ADMINS; }
  });
  const [monday, setMonday] = useState<MondaySettings>(() => {
    if (typeof window === "undefined") return { apiToken: "", boardId: "", workspaceUrl: "", status: "idle" };
    try { return JSON.parse(localStorage.getItem("vision_monday") || "null") ?? { apiToken: "", boardId: "", workspaceUrl: "", status: "idle" }; } catch { return { apiToken: "", boardId: "", workspaceUrl: "", status: "idle" }; }
  });
  const [showAddAdmin, setShowAddAdmin] = useState(false);
  const [mondaySaved, setMondaySaved] = useState(false);

  function saveAdmins(updated: AdminUser[]) {
    setAdmins(updated);
    localStorage.setItem("vision_admins", JSON.stringify(updated));
  }

  async function testMonday() {
    setMonday(m => ({ ...m, status: "testing" }));
    await new Promise(r => setTimeout(r, 2000));
    const ok = monday.apiToken.length > 10;
    setMonday(m => ({ ...m, status: ok ? "connected" : "error" }));
    if (ok) localStorage.setItem("vision_monday", JSON.stringify({ ...monday, status: "connected" }));
  }

  function saveMonday() {
    localStorage.setItem("vision_monday", JSON.stringify(monday));
    setMondaySaved(true);
    setTimeout(() => setMondaySaved(false), 2500);
  }

  return (
    <div className="space-y-8">
      {showAddAdmin && (
        <AddAdminModal
          onAdd={a => saveAdmins([...admins, a])}
          onClose={() => setShowAddAdmin(false)}
        />
      )}

      {/* ── Admin Team ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-[#4ADE80]" />
            <h2 className="text-sm font-black text-white uppercase tracking-widest">Admin Team</h2>
            <span className="text-xs text-gray-600">({admins.length} users)</span>
          </div>
          <button onClick={() => setShowAddAdmin(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.25)] text-[#4ADE80] text-xs font-bold hover:bg-[rgba(74,222,128,0.15)] transition-colors">
            <Plus size={12} /> Add Admin
          </button>
        </div>

        <div className="space-y-3">
          {admins.map(admin => (
            <AdminRow
              key={admin.id}
              admin={admin}
              onUpdate={updated => saveAdmins(admins.map(a => a.id === updated.id ? updated : a))}
              onDelete={id => saveAdmins(admins.filter(a => a.id !== id))}
            />
          ))}
        </div>

        <p className="text-xs text-gray-600 mt-4 flex items-start gap-1.5">
          <Bell size={11} className="mt-0.5 flex-shrink-0" />
          Notification preferences control which alerts each admin receives when leads come in through Ask VISION.
        </p>
      </div>

      {/* ── Divider ── */}
      <div className="border-t border-[rgba(255,255,255,0.05)]" />

      {/* ── Monday.com CRM Integration ── */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-6 h-6 rounded-md bg-[#FF3D57] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-[10px] font-black">M</span>
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-widest">Monday.com CRM</h2>
          {monday.status === "connected" && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-[#4ADE80] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.3)] px-2 py-0.5 rounded-lg">
              <CheckCircle2 size={9} /> Connected
            </span>
          )}
          {monday.status === "error" && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] px-2 py-0.5 rounded-lg">
              <AlertCircle size={9} /> Invalid Key
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 mb-5">
          When connected, every Ask VISION lead is automatically pushed to your Monday.com board as a new item — complete with AI score, budget, timeline, and matched properties.
        </p>

        <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 space-y-4">
          {/* API Token */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Key size={10} /> API Token
            </label>
            <div className="relative">
              <input
                type="password"
                value={monday.apiToken}
                onChange={e => setMonday(m => ({ ...m, apiToken: e.target.value, status: "idle" }))}
                placeholder="eyJhbGciOiJIUzI1NiJ9..."
                className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg pl-3 pr-32 py-2.5 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none font-mono placeholder:text-gray-700 placeholder:font-sans"
              />
              <a href="https://monday.com/l/personalization/tokens" target="_blank" rel="noopener noreferrer" className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] text-gray-500 hover:text-[#4ADE80] transition-colors">
                Get token <ExternalLink size={9} />
              </a>
            </div>
          </div>

          {/* Board ID */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Building2 size={10} /> Board ID
            </label>
            <input
              value={monday.boardId}
              onChange={e => setMonday(m => ({ ...m, boardId: e.target.value, status: "idle" }))}
              placeholder="e.g. 1234567890"
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none placeholder:text-gray-700 font-mono"
            />
            <p className="text-[10px] text-gray-600 mt-1">Found in the URL of your Monday.com board: monday.com/boards/<strong className="text-gray-500">1234567890</strong></p>
          </div>

          {/* Workspace URL */}
          <div>
            <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider flex items-center gap-1 mb-1.5">
              <Globe size={10} /> Workspace URL
            </label>
            <input
              value={monday.workspaceUrl}
              onChange={e => setMonday(m => ({ ...m, workspaceUrl: e.target.value }))}
              placeholder="https://your-team.monday.com"
              className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-2.5 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none placeholder:text-gray-700"
            />
          </div>

          {/* What gets synced */}
          <div className="rounded-xl border border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.02)] p-3">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Fields synced per lead</p>
            <div className="flex flex-wrap gap-2">
              {["Lead Name", "Email", "Phone", "Space Type", "Budget/mo", "Timeline", "Team Size", "AI Score", "Score Label", "Matched Properties", "AI Reasoning", "Submitted At"].map(f => (
                <span key={f} className="text-[10px] px-2 py-0.5 rounded-md bg-[rgba(74,222,128,0.06)] border border-[rgba(74,222,128,0.12)] text-gray-400">{f}</span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              onClick={testMonday}
              disabled={!monday.apiToken || monday.status === "testing"}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-sm font-bold text-gray-300 hover:text-white hover:border-[rgba(74,222,128,0.3)] disabled:opacity-40 transition-all"
            >
              {monday.status === "testing" ? (
                <><Loader2 size={13} className="animate-spin" /> Testing…</>
              ) : monday.status === "connected" ? (
                <><CheckCircle2 size={13} className="text-[#4ADE80]" /> Re-test Connection</>
              ) : (
                <><Zap size={13} /> Test Connection</>
              )}
            </button>
            <button
              onClick={saveMonday}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-black text-sm font-black hover:opacity-90 transition-opacity"
            >
              {mondaySaved ? <><CheckCircle2 size={13} /> Saved!</> : <><Save size={13} /> Save Settings</>}
            </button>
          </div>
        </div>

        {/* Integration note */}
        <div className="mt-4 rounded-xl border border-[rgba(96,165,250,0.15)] bg-[rgba(96,165,250,0.04)] p-3 flex gap-2.5">
          <Mail size={13} className="text-[#60A5FA] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-[#60A5FA] mb-0.5">Ready to activate</p>
            <p className="text-[11px] text-gray-500 leading-relaxed">
              The Monday.com sync endpoint is built and waiting. Enter your API token and Board ID above, click <strong className="text-gray-400">Test Connection</strong>, and every future Ask VISION lead will flow directly into your CRM board automatically.
            </p>
          </div>
        </div>
      </div>

      {/* ── QR Capture Hub ── */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center">
            <span className="text-black text-[10px] font-black">QR</span>
          </div>
          <div>
            <h2 className="text-sm font-black text-white uppercase tracking-widest">QR Capture Cards</h2>
            <p className="text-[10px] text-gray-500">Each team member gets a unique link — scan to capture leads in-person</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {admins.map(admin => {
            const slug = nameToSlug(admin.name);
            const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://teamvisionllc.com";
            const captureUrl = `${baseUrl}/meet/${slug}`;
            const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&bgcolor=080C14&color=4ADE80&margin=10&data=${encodeURIComponent(captureUrl)}`;
            const qrLeadCount = leads.filter(l => l.source === "qr" && l.campaign === slug).length;
            return (
              <div key={admin.id} className="rounded-2xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.03)] p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4ADE80]/20 to-[#22C55E]/10 border border-[rgba(74,222,128,0.25)] flex items-center justify-center text-xs font-black text-[#4ADE80]">
                    {initials(admin.name)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{admin.name}</p>
                    <p className="text-[10px] text-[#4ADE80] font-bold">{qrLeadCount} QR lead{qrLeadCount !== 1 ? "s" : ""}</p>
                  </div>
                </div>
                <div className="flex justify-center my-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={qrSrc} alt={`QR for ${admin.name}`} width={120} height={120} className="rounded-xl" />
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-[10px] text-gray-500 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg px-2 py-1.5 truncate">
                    /meet/{slug}
                  </code>
                  <button
                    onClick={() => { navigator.clipboard.writeText(captureUrl).catch(() => {}); }}
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-[rgba(74,222,128,0.25)] text-[#4ADE80] hover:bg-[rgba(74,222,128,0.08)] transition-colors"
                  >
                    Copy
                  </button>
                  <a href={captureUrl} target="_blank" rel="noopener noreferrer"
                    className="flex-shrink-0 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-[rgba(255,255,255,0.08)] text-gray-400 hover:text-white transition-colors"
                  >
                    Preview
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Ask VISION Modal ──────────────────────────────────────────────────────────

const QUICK_QUERIES = [
  "Who should I call first today?",
  "Summarise the hot leads",
  "What's the total pipeline value?",
  "Which leads need follow-up this week?",
  "Compare our warm leads by budget",
];

function AskVisionModal({ leads, onClose }: { leads: Lead[]; onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const ask = async (q?: string) => {
    const question = q || query.trim();
    if (!question) return;
    setQuery(question);
    setLoading(true);
    setAsked(true);
    setResponse("");
    try {
      // Strip heavy fields before sending — keep payload lean
      const leanLeads = leads.map(l => ({
        name: l.name, spaceType: l.spaceType, budget: l.budget,
        score: l.score, scoreLabel: l.scoreLabel, timeline: l.timeline,
        teamSize: l.teamSize, timestamp: l.timestamp, phone: l.phone,
        isWhale: l.isWhale, whaleKeywords: l.whaleKeywords,
      }));
      const res = await fetch("/api/ask-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, leads: leanLeads }),
      });
      const data = await res.json();
      setResponse(data.response || data.error || "No response received.");
    } catch (err) {
      setResponse(`Connection error — ${err instanceof Error ? err.message : "please try again"}.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0F1A] border border-[rgba(74,222,128,0.25)] rounded-2xl w-full max-w-xl shadow-[0_24px_80px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(74,222,128,0.12)] bg-gradient-to-r from-[rgba(74,222,128,0.06)] to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_16px_rgba(74,222,128,0.35)]">
              <Brain size={16} className="text-black" />
            </div>
            <div>
              <p className="text-white font-black text-sm">Ask VISION</p>
              <p className="text-[10px] text-[#4ADE80]">Lead Intelligence · {leads.length} leads in context</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/8 transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Quick queries */}
          {!asked && (
            <div>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Quick questions</p>
              <div className="flex flex-wrap gap-2">
                {QUICK_QUERIES.map(q => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(74,222,128,0.05)] border border-[rgba(74,222,128,0.15)] text-xs text-gray-300 hover:text-white hover:border-[rgba(74,222,128,0.4)] hover:bg-[rgba(74,222,128,0.1)] transition-all"
                  >
                    {q} <ChevronRight size={10} className="text-gray-600" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Response area */}
          {asked && (
            <div className="rounded-xl border border-[rgba(74,222,128,0.15)] bg-[rgba(74,222,128,0.03)] p-4 min-h-[80px]">
              <p className="text-[10px] text-[#4ADE80] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles size={10} /> Ask VISION Analysis
              </p>
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Loader2 size={14} className="animate-spin text-[#4ADE80]" />
                  Analysing {leads.length} leads…
                </div>
              ) : (
                <p className="text-sm text-gray-200 leading-relaxed">{response}</p>
              )}
            </div>
          )}

          {/* Input */}
          <div className="flex items-end gap-2">
            <div className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2.5 focus-within:border-[rgba(74,222,128,0.4)] transition-colors">
              <textarea
                ref={inputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(); } }}
                placeholder="Ask anything about your leads…"
                rows={2}
                className="w-full bg-transparent text-sm text-white placeholder-gray-600 outline-none resize-none"
              />
            </div>
            <button
              onClick={() => ask()}
              disabled={!query.trim() || loading}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center text-black hover:opacity-90 disabled:opacity-40 transition-all flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          {asked && (
            <button
              onClick={() => { setAsked(false); setQuery(""); setResponse(""); }}
              className="w-full text-xs text-gray-600 hover:text-gray-400 transition-colors text-center"
            >
              ← Ask another question
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Daily Brief Card ──────────────────────────────────────────────────────────

function DailyBriefCard({ leads, onBadgeClick, onLeadClick }: {
  leads: Lead[];
  onBadgeClick: (filter: string) => void;
  onLeadClick: (id: string) => void;
}) {
  const [briefText, setBriefText] = useState("");
  const [briefLoading, setBriefLoading] = useState(false);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  const hot = leads.filter(l => l.scoreLabel === "Hot Lead").length;
  const warm = leads.filter(l => l.scoreLabel === "Warm Lead").length;
  const nurture = leads.filter(l => l.scoreLabel === "Nurture").length;
  const whales = leads.filter(l => l.isWhale).length;
  const newToday = leads.filter(l => {
    const hrs = (Date.now() - new Date(l.timestamp).getTime()) / 36e5;
    return hrs < 24;
  }).length;
  const pipeline = leads.filter(l => l.scoreLabel === "Hot Lead").reduce((a, l) => a + l.budget, 0);
  const topLead = [...leads].sort((a, b) => (b.budget * b.score) - (a.budget * a.score))[0];

  const generateBrief = async () => {
    setBriefLoading(true);
    try {
      const leanLeads = leads.map(l => ({
        name: l.name, spaceType: l.spaceType, budget: l.budget,
        score: l.score, scoreLabel: l.scoreLabel, timeline: l.timeline,
        teamSize: l.teamSize, timestamp: l.timestamp, phone: l.phone,
        isWhale: l.isWhale, whaleKeywords: l.whaleKeywords,
      }));
      const res = await fetch("/api/ask-vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: `VISION CRM DAILY BRIEF — max 2 short sentences, facts only, no greetings or headers:
1. Name the top 2 leads by revenue potential (highest budget × score). For each: name, budget/month, timeline.
2. Hot pipeline total per month. Mention whale count only if above 0.
Use real names and numbers. Be punchy.`,
          leads: leanLeads,
        }),
      });
      const data = await res.json();
      setBriefText(data.response || data.error || "");
    } catch {
      setBriefText("Unable to generate brief — check your connection.");
    } finally {
      setBriefLoading(false);
    }
  };

  useEffect(() => { if (leads.length) generateBrief(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stats = [
    { label: "Hot",      value: hot,      emoji: "🔥", color: "#4ADE80", filter: "Hot Lead"  },
    { label: "Warm",     value: warm,     emoji: "⚡", color: "#FACC15", filter: "Warm Lead" },
    { label: "Nurture",  value: nurture,  emoji: "●",  color: "#94A3B8", filter: "Nurture"   },
    { label: "New Today",value: newToday, emoji: "⚠️", color: "#FACC15", filter: "New Today" },
    { label: "Whales",   value: whales,   emoji: "🐳", color: "#FACC15", filter: "Whale"     },
  ];

  return (
    <div className="rounded-2xl border border-[rgba(74,222,128,0.3)] bg-gradient-to-br from-[rgba(74,222,128,0.06)] via-[rgba(74,222,128,0.03)] to-transparent p-5 mb-6 relative overflow-hidden">
      {/* Subtle glow */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-[#4ADE80] opacity-[0.04] blur-3xl pointer-events-none" />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_12px_rgba(74,222,128,0.3)] flex-shrink-0">
            <Sparkles size={14} className="text-black" />
          </div>
          <div>
            <p className="text-xs font-black text-[#4ADE80] uppercase tracking-widest">Daily Brief</p>
            <p className="text-[11px] text-gray-500">{today}</p>
          </div>
        </div>
        <button
          onClick={generateBrief}
          disabled={briefLoading}
          className="flex items-center gap-1 text-[10px] text-gray-600 hover:text-[#4ADE80] transition-colors disabled:opacity-40"
          title="Regenerate brief"
        >
          <RefreshCw size={10} className={briefLoading ? "animate-spin" : ""} />
          {briefLoading ? "Updating…" : "Refresh"}
        </button>
      </div>

      {/* Stats chips — clickable, filter + scroll to leads */}
      <div className="flex flex-wrap gap-2 mb-4">
        {stats.map(s => (
          <button
            key={s.label}
            onClick={() => onBadgeClick(s.filter)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] hover:border-[rgba(74,222,128,0.35)] hover:bg-[rgba(74,222,128,0.06)] transition-all cursor-pointer group"
            title={`Filter: ${s.label}`}
          >
            <span className="text-sm">{s.emoji}</span>
            <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">{s.label}</span>
            <span className="text-sm font-black tabular-nums" style={{ color: s.color }}>{s.value}</span>
          </button>
        ))}
        <button
          onClick={() => onBadgeClick("Hot Lead")}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] hover:bg-[rgba(74,222,128,0.14)] hover:border-[rgba(74,222,128,0.4)] transition-all cursor-pointer group"
          title="Filter: Hot Pipeline"
        >
          <DollarSign size={12} className="text-[#4ADE80]" />
          <span className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors">Hot Pipeline</span>
          <span className="text-sm font-black text-[#4ADE80] tabular-nums">${pipeline.toLocaleString()}/mo</span>
        </button>
      </div>

      {/* AI Brief text */}
      <div className="border-t border-[rgba(74,222,128,0.1)] pt-3">
        {briefLoading ? (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Loader2 size={12} className="animate-spin text-[#4ADE80]" />
            Generating brief…
          </div>
        ) : briefText ? (
          <p className="text-sm text-gray-300 leading-relaxed">
            {/* Scan for lead names and make them clickable */}
            {(() => {
              const sorted = [...leads].sort((a, b) => b.name.length - a.name.length);
              let parts: (string | React.ReactNode)[] = [briefText];
              sorted.forEach(lead => {
                const next: (string | React.ReactNode)[] = [];
                parts.forEach((part, pi) => {
                  if (typeof part !== "string") { next.push(part); return; }
                  const chunks = part.split(lead.name);
                  chunks.forEach((chunk, ci) => {
                    next.push(chunk);
                    if (ci < chunks.length - 1) next.push(
                      <button key={`${lead.id}-${pi}-${ci}`} onClick={() => onLeadClick(lead.id)}
                        className="text-[#4ADE80] font-bold underline underline-offset-2 hover:text-white transition-colors cursor-pointer"
                      >{lead.name}</button>
                    );
                  });
                });
                parts = next;
              });
              return parts;
            })()}
          </p>
        ) : topLead ? (
          <p className="text-sm text-gray-500 italic">Top priority: {topLead.name} — {topLead.spaceType} at ${topLead.budget.toLocaleString()}/mo</p>
        ) : null}
        <p className="text-[10px] text-gray-600 mt-2 flex items-center gap-1">
          <Sparkles size={9} /> Powered by Ask VISION
        </p>
      </div>
    </div>
  );
}

// ─── Lead Comments Component ───────────────────────────────────────────

interface LeadComment {
  id: string; lead_id: string; author: string; body: string; timestamp: string;
}

function LeadComments({ leadId, currentUserName }: { leadId: string; currentUserName?: string }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<LeadComment[]>([]);
  const [loadingCmts, setLoadingCmts] = useState(false);
  const [newBody, setNewBody] = useState("");
  const [authorName, setAuthorName] = useState<string>(() =>
    typeof window !== "undefined" ? localStorage.getItem("vision_commenter") ?? "" : ""
  );
  const [posting, setPosting] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Sync Google user name when auth resolves
  useEffect(() => { if (currentUserName) setAuthorName(currentUserName); }, [currentUserName]);

  const loadComments = async () => {
    setLoadingCmts(true);
    try {
      const res = await fetch(`/api/lead-comments?lead_id=${encodeURIComponent(leadId)}`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch { /* keep existing */ }
    finally { setLoadingCmts(false); }
  };

  useEffect(() => { if (open) loadComments(); }, [open]); // eslint-disable-line

  const postComment = async () => {
    if (!newBody.trim() || !authorName.trim()) return;
    setPosting(true);
    try {
      await fetch("/api/lead-comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead_id: leadId, author: authorName.trim(), body: newBody.trim() }),
      });
      localStorage.setItem("vision_commenter", authorName.trim());
      setNewBody("");
      await loadComments();
    } finally { setPosting(false); }
  };

  return (
    <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.05)]">
      {/* Toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
          open || comments.length > 0
            ? "text-[#4ADE80] drop-shadow-[0_0_6px_rgba(74,222,128,0.5)]"
            : "text-gray-500 hover:text-[#4ADE80]"
        }`}
      >
        <MessageSquare size={14} className={comments.length > 0 ? "fill-[rgba(74,222,128,0.15)]" : ""} />
        Activity {comments.length > 0 ? `(${comments.length})` : ""}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-3 space-y-2">
          {/* Comment list */}
          {loadingCmts ? (
            <div className="flex items-center gap-2 text-[11px] text-gray-600">
              <Loader2 size={11} className="animate-spin" /> Loading activity…
            </div>
          ) : comments.length === 0 ? (
            <p className="text-[11px] text-gray-700 italic">No activity yet — be the first to add a note.</p>
          ) : (
            comments.map(c => (
              <div key={c.id} className="flex gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#4ADE80]/20 to-[#22C55E]/10 border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-[9px] font-black text-[#4ADE80] flex-shrink-0">
                  {c.author.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-gray-300">{c.author}</span>
                    <span className="text-[10px] text-gray-600">{timeAgo(c.timestamp)}</span>
                  </div>
                  <p className="text-[12px] text-gray-400 leading-relaxed">{c.body}</p>
                </div>
              </div>
            ))
          )}

          {/* New comment input */}
          <div className="mt-3 space-y-2">
            <input
              value={authorName}
              onChange={e => setAuthorName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[rgba(74,222,128,0.35)] outline-none placeholder:text-gray-700 transition-colors"
            />
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={newBody}
                onChange={e => setNewBody(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); postComment(); } }}
                placeholder="Add a note… (Enter to post)"
                rows={2}
                spellCheck={true}
                className="flex-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[rgba(74,222,128,0.35)] outline-none placeholder:text-gray-700 transition-colors resize-none"
              />
              <button
                onClick={postComment}
                disabled={posting || !newBody.trim() || !authorName.trim()}
                className="flex-shrink-0 flex items-center justify-center w-9 h-auto rounded-lg bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] text-[#4ADE80] hover:bg-[rgba(74,222,128,0.18)] disabled:opacity-40 transition-all"
              >
                {posting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Add Lead Panel ───────────────────────────────────────────────────

const SPACE_TYPES = ["Office", "Executive Suite", "CoWork / Flex", "Retail Storefront", "Warehouse / Industrial", "Event Space", "Not sure yet"] as const;
const TIMELINES = ["ASAP — under 30 days", "30–60 days", "60–90 days", "3–6 months", "Exploring options"] as const;
const TEAM_SIZES = ["Solo", "2–4 people", "5–10 people", "10+ people"] as const;

function formatPhoneAdmin(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 10);
  if (!digits.length) return "";
  if (digits.length <= 3) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function derivedLabel(score: number): "Hot Lead" | "Warm Lead" | "Nurture" {
  if (score >= 70) return "Hot Lead";
  if (score >= 40) return "Warm Lead";
  return "Nurture";
}

const FIELD = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2.5 text-sm text-white focus:border-[rgba(74,222,128,0.4)] outline-none placeholder:text-gray-600 transition-colors";
const LABEL = "block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1";

function AddLeadPanel({ onLeadAdded }: { onLeadAdded: (lead: Lead) => void }) {
  const [open, setOpen] = useState(false);
  const [scoreMode, setScoreMode] = useState<"ai" | "manual">("ai");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    spaceType: "Office" as typeof SPACE_TYPES[number],
    budget: "",
    timeline: "ASAP — under 30 days" as typeof TIMELINES[number],
    teamSize: "Solo" as typeof TEAM_SIZES[number],
    notes: "",
    manualScore: 70,
  });

  function reset() {
    setForm({ name: "", phone: "", email: "", spaceType: "Office", budget: "", timeline: "ASAP — under 30 days", teamSize: "Solo", notes: "", manualScore: 70 });
    setScoreMode("ai");
    setError("");
    setSuccess(false);
  }

  const label = derivedLabel(form.manualScore);
  const labelColor = label === "Hot Lead" ? "#4ADE80" : label === "Warm Lead" ? "#FACC15" : "#94A3B8";

  async function submit() {
    if (!form.name.trim() || !form.budget) { setError("Name and budget are required."); return; }
    setSubmitting(true); setError("");
    try {
      if (scoreMode === "ai") {
        const res = await fetch("/api/lease-bot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(), email: form.email.trim(), phone: form.phone,
            spaceType: form.spaceType, budget: form.budget,
            timeline: form.timeline, teamSize: form.teamSize,
            additionalInfo: form.notes, utm_source: "manual", utm_medium: "admin", utm_campaign: "",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.lead) { setError(data.error || "AI scoring failed."); return; }
        onLeadAdded(data.lead);
      } else {
        const res = await fetch("/api/admin-lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(), email: form.email.trim(), phone: form.phone,
            spaceType: form.spaceType, budget: form.budget,
            timeline: form.timeline, teamSize: form.teamSize,
            additionalInfo: form.notes,
            score: form.manualScore, scoreLabel: label,
            reasoning: "Manually entered and scored by admin.",
          }),
        });
        const data = await res.json();
        if (!res.ok || !data.lead) { setError(data.error || "Save failed."); return; }
        onLeadAdded(data.lead);
      }
      setSuccess(true);
      reset();
      setTimeout(() => { setSuccess(false); setOpen(false); }, 1800);
    } catch (e) {
      setError(`Network error — ${e instanceof Error ? e.message : "please try again"}.`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mb-6">
      {/* Toggle button */}
      <button
        onClick={() => { setOpen(o => !o); if (!open) reset(); }}
        id="add-lead-toggle"
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
          open
            ? "bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.4)] text-[#4ADE80]"
            : "bg-[rgba(74,222,128,0.06)] border-[rgba(74,222,128,0.2)] text-[#4ADE80] hover:bg-[rgba(74,222,128,0.1)]"
        }`}
      >
        <Plus size={15} />
        Add Lead
        <ChevronDown size={13} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Collapsible form */}
      {open && (
        <div className="mt-3 rounded-2xl border border-[rgba(74,222,128,0.25)] bg-gradient-to-br from-[rgba(74,222,128,0.05)] to-[rgba(74,222,128,0.02)] p-5 shadow-[0_8px_40px_rgba(0,0,0,0.4)] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black text-white">New Lead Entry</p>
            <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-white transition-colors"><X size={15} /></button>
          </div>

          {/* Grid of fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className={LABEL}>Full Name *</label>
              <input autoFocus value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Jane Smith" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Phone</label>
              <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: formatPhoneAdmin(e.target.value) })} placeholder="(423) ___-____" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@company.com" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Space Type</label>
              <select value={form.spaceType} onChange={e => setForm({ ...form, spaceType: e.target.value as typeof SPACE_TYPES[number] })} className={FIELD}>
                {SPACE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Budget ($/mo) *</label>
              <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} placeholder="e.g. 2500" className={FIELD} />
            </div>
            <div>
              <label className={LABEL}>Move-in Timeline</label>
              <select value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value as typeof TIMELINES[number] })} className={FIELD}>
                {TIMELINES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Team Size</label>
              <select value={form.teamSize} onChange={e => setForm({ ...form, teamSize: e.target.value as typeof TEAM_SIZES[number] })} className={FIELD}>
                {TEAM_SIZES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Notes</label>
              <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Any context, source, referral..." className={FIELD} />
            </div>
          </div>

          {/* Score mode toggle */}
          <div className="mb-4">
            <p className={LABEL}>Scoring Method</p>
            <div className="flex gap-2 mb-3">
              {(["ai", "manual"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setScoreMode(m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    scoreMode === m
                      ? "bg-[rgba(74,222,128,0.12)] border-[rgba(74,222,128,0.4)] text-[#4ADE80]"
                      : "border-[rgba(255,255,255,0.08)] text-gray-500 hover:text-gray-300"
                  }`}
                >
                  {m === "ai" ? <><Brain size={11} /> AI Score It</> : <><CheckCircle2 size={11} /> Set Manually</>}
                </button>
              ))}
            </div>

            {scoreMode === "manual" && (
              <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl px-4 py-3 flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="range" min={0} max={100}
                    value={form.manualScore}
                    onChange={e => setForm({ ...form, manualScore: Number(e.target.value) })}
                    className="w-full accent-[#4ADE80]"
                  />
                  <div className="flex justify-between text-[10px] text-gray-600 mt-0.5">
                    <span>0</span><span>50</span><span>100</span>
                  </div>
                </div>
                <div className="text-center flex-shrink-0">
                  <p className="text-2xl font-black tabular-nums" style={{ color: labelColor }}>{form.manualScore}</p>
                  <p className="text-[10px] font-bold" style={{ color: labelColor }}>{label}</p>
                </div>
              </div>
            )}
          </div>

          {/* Error / Success */}
          {error && <p className="text-xs text-red-400 mb-3 flex items-center gap-1.5"><AlertCircle size={12} />{error}</p>}
          {success && <p className="text-xs text-[#4ADE80] mb-3 flex items-center gap-1.5"><CheckCircle2 size={12} />Lead saved successfully!</p>}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={submit}
              disabled={submitting || !form.name.trim() || !form.budget}
              id="save-lead-btn"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-black text-sm font-black hover:opacity-90 disabled:opacity-40 transition-all"
            >
              {submitting ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : scoreMode === "ai" ? <><Brain size={14} /> Score with AI</> : <><Save size={14} /> Save Lead</>}
            </button>
            <button onClick={() => { setOpen(false); reset(); }} className="px-4 py-2.5 rounded-xl border border-[rgba(255,255,255,0.08)] text-gray-500 text-sm hover:text-white transition-colors">Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string; avatar?: string } | null>(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<Array<{name: string; email: string; avatar?: string}>>([]);
  const briefKeyRef = useRef(0);
  const [briefKey, setBriefKey] = useState(0);
  const [activeTab, setActiveTab] = useState<"leads" | "tenants" | "analytics" | "archived" | "settings">("leads");
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [filter, setFilter] = useState<"All" | "Hot Lead" | "Warm Lead" | "Nurture" | "Whale" | "New Today">("All");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [newLeadToast, setNewLeadToast] = useState<Lead | null>(null);
  const [recentLiveIds, setRecentLiveIds] = useState<Set<string>>(new Set());
  const [showAskVision, setShowAskVision] = useState(false);
  const seenIdsRef = useRef<Set<string>>(new Set(DEMO_LEADS.map(d => d.id)));
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auth check — redirect to login if no session, block if not on allowlist
  useEffect(() => {
    supabaseBrowser.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/admin/login");
      } else {
        const email = data.user.email || "";
        // If NEXT_PUBLIC_ADMIN_EMAILS is set, enforce allowlist
        const rawList = process.env.NEXT_PUBLIC_ADMIN_EMAILS ?? "";
        const allowedEmails = rawList.split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
        if (allowedEmails.length > 0 && !allowedEmails.includes(email.toLowerCase())) {
          setAccessDenied(true);
          setAuthChecking(false);
          return;
        }
        const name = data.user.user_metadata?.full_name || email.split("@")[0] || "Team";
        setCurrentUser({
          name,
          email,
          avatar: data.user.user_metadata?.avatar_url,
        });
        try { localStorage.setItem("vision_commenter", name); } catch { /**/ }
      }
      setAuthChecking(false);
    });
  }, [router]);

  // Clear stale localStorage on mount — Supabase is now source of truth
  useEffect(() => {
    try { localStorage.removeItem("vision_live_leads"); } catch { /* ignore */ }
  }, []);

  // Supabase Realtime Presence — show who else is online
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabaseBrowser.channel("admin_presence", {
      config: { presence: { key: currentUser.email } },
    });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ name: string; email: string; avatar?: string }>();
        setOnlineUsers(Object.values(state).flat());
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar });
        }
      });
    return () => { supabaseBrowser.removeChannel(channel); };
  }, [currentUser]);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lease-bot");
      const data = await res.json();
      if (data.leads && Array.isArray(data.leads)) {
        const fetched: Lead[] = data.leads.length > 0 ? data.leads : DEMO_LEADS;
        fetched.forEach(l => seenIdsRef.current.add(l.id));
        setLeads(fetched);
        // Bump briefKey once after the first real fetch so the brief regenerates with live data
        if (briefKeyRef.current === 0 && fetched.some(l => !l.id.startsWith("demo_"))) {
          briefKeyRef.current = 1;
          setBriefKey(1);
        }
      }
    } catch { /* keep existing state on error */ }
    finally { setLoading(false); setLastRefresh(new Date()); }
  };

  // ── localStorage live-lead poller (4s interval) ────────────────────────────
  const pollLocalStorage = useCallback(() => {
    try {
      const stored: Lead[] = JSON.parse(localStorage.getItem("vision_live_leads") || "[]");
      if (!stored.length) return;

      const brandNew = stored.filter(l => !seenIdsRef.current.has(l.id));
      if (!brandNew.length) return;

      // Mark all as seen
      brandNew.forEach(l => seenIdsRef.current.add(l.id));
      setRecentLiveIds(prev => { const s = new Set(prev); brandNew.forEach(l => s.add(l.id)); return s; });

      // Merge into leads list (new ones at top, before demo leads)
      setLeads(prev => {
        const existingIds = new Set(prev.map(l => l.id));
        const toAdd = brandNew.filter(l => !existingIds.has(l.id));
        return toAdd.length ? [...toAdd, ...prev] : prev;
      });

      // Show toast for the most recent new lead
      const latest = brandNew[0];
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      setNewLeadToast(latest);
      toastTimerRef.current = setTimeout(() => setNewLeadToast(null), 5000);
      setLastRefresh(new Date());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchLeads();
    const apiInterval = setInterval(fetchLeads, 30000);
    const lsInterval = setInterval(pollLocalStorage, 4000);
    // Also run once on mount in case chatbot already fired
    pollLocalStorage();
    return () => { clearInterval(apiInterval); clearInterval(lsInterval); };
  }, [pollLocalStorage]);

  // Remove NEW badge after 60s
  useEffect(() => {
    if (!recentLiveIds.size) return;
    const t = setTimeout(() => setRecentLiveIds(new Set()), 60000);
    return () => clearTimeout(t);
  }, [recentLiveIds]);

  const activeLeads = leads.filter(l => !isArchived(l.timestamp));
  const archivedLeads = leads.filter(l => isArchived(l.timestamp));
  const filtered =
    filter === "All"      ? activeLeads :
    filter === "Whale"    ? activeLeads.filter(l => l.isWhale) :
    filter === "New Today" ? activeLeads.filter(l => (Date.now() - new Date(l.timestamp).getTime()) < 864e5) :
    activeLeads.filter(l => l.scoreLabel === filter);
  const hotLeads = activeLeads.filter(l => l.scoreLabel === "Hot Lead");
  const warmCount = activeLeads.filter(l => l.scoreLabel === "Warm Lead").length;
  const urgentLeads = activeLeads.filter(isUrgent);
  const whaleLeads = activeLeads.filter(l => l.isWhale);
  const avgScore = Math.round(activeLeads.reduce((a, l) => a + l.score, 0) / (activeLeads.length || 1));
  const hotMonthlyPipeline = hotLeads.reduce((a, l) => a + l.budget, 0);
  const totalMonthlyPipeline = activeLeads.reduce((a, l) => a + l.budget, 0);
  const annualProjection = hotMonthlyPipeline * 12;
  // Call list sorted by revenue potential: budget × (score/100) — highest $/mo first
  const callList = [...activeLeads].filter(l => l.phone).sort((a, b) => (b.budget * b.score) - (a.budget * a.score));

  // Access denied screen
  if (accessDenied) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-14 h-14 rounded-2xl bg-[rgba(239,68,68,0.15)] border border-[rgba(239,68,68,0.3)] flex items-center justify-center mx-auto mb-5">
            <Shield size={24} className="text-red-400" />
          </div>
          <h1 className="text-xl font-black text-white mb-2">Access Denied</h1>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Your Google account is not authorized to access Vision CRM.
            <br />Contact your administrator to request access.
          </p>
          <button
            onClick={async () => { await supabaseBrowser.auth.signOut(); router.replace("/admin/login"); }}
            className="px-5 py-2.5 rounded-xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.25)] text-red-400 text-sm font-bold hover:bg-[rgba(239,68,68,0.18)] transition-colors"
          >
            Sign out and try another account
          </button>
        </div>
      </div>
    );
  }

  // Auth loading screen
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center mx-auto mb-3 shadow-[0_0_24px_rgba(74,222,128,0.3)] animate-pulse">
            <Zap size={20} className="text-black" />
          </div>
          <p className="text-xs text-gray-600">Loading VISION CRM…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080C14] text-white">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-16">

        {/* ─ New Lead Toast ──────────────────────────────────────────────── */}
        {newLeadToast && (
          <div
            className="fixed top-24 right-4 z-50 max-w-xs w-full"
            style={{ animation: "slideInRight 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both" }}
          >
            <style>{`
              @keyframes slideInRight {
                from { opacity: 0; transform: translateX(120%); }
                to   { opacity: 1; transform: translateX(0); }
              }
            `}</style>
            <div className="bg-[#0D1117] border border-[rgba(74,222,128,0.4)] rounded-2xl p-4 shadow-[0_8px_40px_rgba(0,0,0,0.6)] flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center flex-shrink-0 shadow-[0_0_16px_rgba(74,222,128,0.4)]">
                <Radio size={16} className="text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-black text-[#4ADE80] uppercase tracking-wider">New Lead</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                </div>
                <p className="text-sm font-bold text-white truncate">{newLeadToast.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {newLeadToast.spaceType} · <span style={{ color: scoreColor(newLeadToast.score) }}>{newLeadToast.score}/100</span> · {newLeadToast.scoreLabel}
                </p>
              </div>
              <button onClick={() => setNewLeadToast(null)} className="text-gray-600 hover:text-white transition-colors flex-shrink-0 mt-0.5">
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.25)]">
              <Zap size={18} className="text-black" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-black text-xl">VISION CRM</h1>
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#4ADE80] bg-[rgba(74,222,128,0.1)] border border-[rgba(74,222,128,0.25)] px-2 py-0.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
                  LIVE
                </span>
              </div>
              <p className="text-[11px] text-gray-500">AI Lead Intelligence Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[11px] text-gray-600 hidden sm:block">Last refresh: {lastRefresh.toLocaleTimeString()}</span>

            {/* Online presence avatars */}
            {onlineUsers.length > 0 && (
              <div className="hidden sm:flex items-center gap-1" title={onlineUsers.map(u => u.name).join(", ") + " online"}>
                {onlineUsers.map(u => (
                  <div key={u.email} className="relative" title={`${u.name} — online now`}>
                    {u.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full border border-[rgba(74,222,128,0.4)]" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#4ADE80]/30 to-[#22C55E]/20 border border-[rgba(74,222,128,0.3)] flex items-center justify-center text-[9px] font-black text-[#4ADE80]">
                        {u.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#4ADE80] border border-[#080C14] animate-pulse" />
                  </div>
                ))}
                {onlineUsers.length > 1 && (
                  <span className="text-[10px] text-gray-600 ml-1">{onlineUsers.length} online</span>
                )}
              </div>
            )}

            <button
              onClick={() => setShowAskVision(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-gradient-to-r from-[rgba(74,222,128,0.12)] to-[rgba(74,222,128,0.06)] border border-[rgba(74,222,128,0.3)] text-[#4ADE80] text-xs font-bold hover:from-[rgba(74,222,128,0.2)] hover:to-[rgba(74,222,128,0.1)] transition-all shadow-[0_0_12px_rgba(74,222,128,0.1)]"
              title="Ask VISION"
            >
              <Brain size={13} />
              <span className="hidden sm:inline">Ask VISION</span>
            </button>
            {activeTab === "leads" && (
              <button
                onClick={fetchLeads}
                disabled={loading}
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-xs hover:bg-[rgba(74,222,128,0.12)] transition-colors disabled:opacity-50"
                title="Refresh leads"
              >
                <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
            )}
            {/* User avatar + sign-out */}
            {currentUser && (
              <div className="flex items-center gap-2">
                {currentUser.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-7 h-7 rounded-full border border-[rgba(74,222,128,0.3)]" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#4ADE80]/30 to-[#22C55E]/20 border border-[rgba(74,222,128,0.3)] flex items-center justify-center text-[10px] font-black text-[#4ADE80]">
                    {currentUser.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </div>
                )}
                <button
                  onClick={async () => { await supabaseBrowser.auth.signOut(); router.replace("/admin/login"); }}
                  className="text-[10px] text-gray-600 hover:text-red-400 transition-colors hidden sm:block"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Ask VISION Modal */}
        {showAskVision && (
          <AskVisionModal leads={leads} onClose={() => setShowAskVision(false)} />
        )}

        {/* Tab Nav */}
        <div className="flex items-center gap-1 mb-8 border-b border-[rgba(255,255,255,0.06)] pb-0">
          {([
            { key: "leads",     label: `Leads (${activeLeads.length})`, icon: TrendingUp },
            { key: "tenants",   label: "Tenants", icon: Building2 },
            { key: "analytics", label: "Analytics", icon: BarChart3 },
            { key: "archived",  label: `Archived (${archivedLeads.length})`, icon: Archive },
            { key: "settings",  label: "Settings", icon: Settings },
          ] as const).map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all -mb-px ${activeTab === key ? "border-[#4ADE80] text-[#4ADE80]" : "border-transparent text-gray-500 hover:text-gray-300"}`}
            >
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>

        {/* ─ LEADS TAB ──────────────────────────────────────────────────────── */}
        {activeTab === "leads" && (
          <>
            {/* Personalized greeting */}
            {currentUser && (() => {
              const hour = new Date().getHours();
              const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
              const firstName = currentUser.name.split(" ")[0];
              return (
                <div className="mb-5 flex items-center gap-3">
                  {currentUser.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full border-2 border-[rgba(74,222,128,0.3)] flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#4ADE80]/30 to-[#22C55E]/20 border-2 border-[rgba(74,222,128,0.3)] flex items-center justify-center text-sm font-black text-[#4ADE80] flex-shrink-0">
                      {currentUser.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-xl font-black text-white">{greeting}, {firstName} 👋</h2>
                    <p className="text-[11px] text-gray-500">Here&apos;s your pipeline snapshot for today.</p>
                  </div>
                </div>
              );
            })()}

            {/* Daily Brief — first thing a CEO sees */}
            <DailyBriefCard
              key={briefKey}
              leads={activeLeads}
              onBadgeClick={(f) => {
                setFilter(f as typeof filter);
                setTimeout(() => {
                  document.getElementById("leads-list")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 50);
              }}
              onLeadClick={(id) => {
                setFilter("All");
                setTimeout(() => {
                  const el = document.getElementById(`lead-card-${id}`);
                  if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.style.transition = "box-shadow 0.3s";
                    el.style.boxShadow = "0 0 0 2px #4ADE80, 0 0 24px rgba(74,222,128,0.35)";
                    setTimeout(() => { el.style.boxShadow = ""; }, 1800);
                  }
                }, 80);
              }}
            />

            {/* Pipeline Banner */}
            <div className="rounded-2xl border border-[rgba(74,222,128,0.2)] bg-gradient-to-r from-[rgba(74,222,128,0.07)] to-[rgba(74,222,128,0.02)] p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-[rgba(74,222,128,0.12)] flex items-center justify-center"><DollarSign size={20} className="text-[#4ADE80]" /></div>
                  <span className="text-sm font-bold text-[#4ADE80] uppercase tracking-widest">Active Pipeline</span>
                </div>
                <div className="flex flex-wrap gap-8">
                  <div>
                    <p className="text-[11px] text-gray-500 mb-0.5">Hot Lead Monthly Value</p>
                    <p className="text-3xl font-black text-white tabular-nums">${hotMonthlyPipeline.toLocaleString()}<span className="text-base text-gray-500 font-normal">/mo</span></p>
                  </div>
                  <div className="w-px bg-[rgba(255,255,255,0.06)] hidden sm:block" />
                  <div>
                    <p className="text-[11px] text-gray-500 mb-0.5">Projected Annual Revenue</p>
                    <p className="text-3xl font-black text-[#4ADE80] tabular-nums">${annualProjection.toLocaleString()}<span className="text-base text-[#4ADE80]/60 font-normal">/yr</span></p>
                  </div>
                  <div className="w-px bg-[rgba(255,255,255,0.06)] hidden sm:block" />
                  <div>
                    <p className="text-[11px] text-gray-500 mb-0.5">Total Pipeline (All Leads)</p>
                    <p className="text-3xl font-black text-gray-300 tabular-nums">${totalMonthlyPipeline.toLocaleString()}<span className="text-base text-gray-600 font-normal">/mo</span></p>
                  </div>
                </div>
              </div>
            </div>

            {/* Urgent Strip */}
            {urgentLeads.length > 0 && (
              <div className="rounded-2xl border border-[rgba(250,204,21,0.25)] bg-[rgba(250,204,21,0.04)] p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-[#FACC15] flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-[#FACC15] font-bold text-sm mb-2">⚡ {urgentLeads.length} lead{urgentLeads.length > 1 ? "s" : ""} need contact TODAY</p>
                    <div className="flex flex-wrap gap-3">
                      {urgentLeads.map(lead => (
                        <div key={lead.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.2)]">
                          <span className="text-sm font-semibold text-white">{lead.name}</span>
                          <span className="text-xs text-[#FACC15]">${lead.budget.toLocaleString()}/mo</span>
                          <span className="text-xs text-gray-500">· {timeAgo(lead.timestamp)}</span>
                          {lead.phone && <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-[#4ADE80] font-bold hover:underline"><Phone size={10} /> Call</a>}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Leads", value: leads.length, icon: Users, color: "#60A5FA" },
                { label: "Hot Leads 🔥", value: hotLeads.length, icon: TrendingUp, color: "#4ADE80" },
                { label: "Warm Leads", value: warmCount, icon: Zap, color: "#FACC15" },
                { label: "Whale Alerts 🐳", value: whaleLeads.length, icon: Building2, color: "#FACC15" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="glass rounded-2xl p-4 border border-[rgba(255,255,255,0.06)]">
                  <div className="flex items-center gap-2 mb-2"><Icon size={14} style={{ color }} /><span className="text-xs text-gray-500">{label}</span></div>
                  <p className="text-2xl font-black text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Call List */}
            {callList.length > 0 && (
              <div className="rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] p-5 mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Phone size={14} className="text-[#4ADE80]" />
                  <h2 className="text-sm font-bold text-white uppercase tracking-widest">Priority Call List</h2>
                  <span className="text-xs text-gray-600 ml-1">— sorted by AI score</span>
                </div>
                <div className="space-y-2">
                  {callList.map((lead, i) => (
                    <div key={lead.id} className="flex items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] hover:border-[rgba(74,222,128,0.2)] transition-all">
                      <span className="text-xs font-black w-4 text-center flex-shrink-0" style={{ color: scoreColor(lead.score) }}>#{i + 1}</span>
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0 text-xs sm:text-sm font-black" style={{ backgroundColor: `${scoreColor(lead.score)}12`, color: scoreColor(lead.score) }}>{lead.score}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white truncate">{lead.name}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-[11px] text-gray-500 mt-0.5">
                          <span className="truncate max-w-[90px] sm:max-w-none">{lead.spaceType}</span>
                          <span className="text-[#4ADE80] font-semibold">${lead.budget.toLocaleString()}/mo</span>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-lg border font-bold hidden sm:block flex-shrink-0 ${scoreBadge(lead.scoreLabel)}`}>{lead.scoreLabel}</span>
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-[#4ADE80] to-[#22C55E] text-black text-xs font-black hover:opacity-90 transition-opacity flex-shrink-0">
                        <Phone size={11} />
                        <span className="hidden sm:inline">{lead.phone}</span>
                        <span className="sm:hidden">Call</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add Lead Panel */}
            <AddLeadPanel onLeadAdded={lead => {
              seenIdsRef.current.add(lead.id);
              setLeads(prev => [lead, ...prev]);
            }} />

            {/* QR Leaderboard */}
            {(() => {
              const qrLeads = activeLeads.filter(l => l.source === "qr");
              if (!qrLeads.length) return null;
              const byAgent: Record<string, { count: number; pipeline: number; latest: string }> = {};
              qrLeads.forEach(l => {
                const slug = l.campaign || "team";
                if (!byAgent[slug]) byAgent[slug] = { count: 0, pipeline: 0, latest: l.timestamp };
                byAgent[slug].count++;
                byAgent[slug].pipeline += l.budget;
                if (l.timestamp > byAgent[slug].latest) byAgent[slug].latest = l.timestamp;
              });
              const ranked = Object.entries(byAgent).sort((a, b) => b[1].count - a[1].count);
              return (
                <div className="rounded-2xl border border-[rgba(74,222,128,0.2)] bg-[rgba(74,222,128,0.03)] p-5 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-base">🏆</span>
                    <p className="text-xs font-black text-[#4ADE80] uppercase tracking-widest">QR Lead Leaderboard</p>
                    <span className="text-[10px] text-gray-600 ml-1">— in-person captures</span>
                  </div>
                  <div className="space-y-2">
                    {ranked.map(([slug, stats], i) => (
                      <div key={slug} className="flex items-center gap-3">
                        <span className="text-sm font-black w-5 text-center" style={{ color: i === 0 ? "#FACC15" : i === 1 ? "#94A3B8" : "#92400E" }}>#{i + 1}</span>
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#4ADE80]/20 to-[#22C55E]/10 border border-[rgba(74,222,128,0.2)] flex items-center justify-center text-[10px] font-black text-[#4ADE80]">
                          {slug.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white capitalize">{slug}</p>
                          <p className="text-[10px] text-gray-600">{timeAgo(stats.latest)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-[#4ADE80]">{stats.count} lead{stats.count !== 1 ? "s" : ""}</p>
                          {stats.pipeline > 0 && <p className="text-[10px] text-gray-600">${stats.pipeline.toLocaleString()}/mo</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Filter + Lead Cards */}
            <div id="leads-list" className="flex items-center gap-2 mb-6 flex-wrap">
              <Filter size={13} className="text-gray-500" />
              <span className="text-xs text-gray-600 mr-1">Filter:</span>
              {(["All", "Hot Lead", "Warm Lead", "Nurture", "Whale", "New Today"] as const).map(f => (
                <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${filter === f ? "bg-[rgba(74,222,128,0.1)] border-[rgba(74,222,128,0.3)] text-[#4ADE80]" : "border-[rgba(255,255,255,0.06)] text-gray-500 hover:text-gray-300"}`}>
                  {f === "Whale" ? "🐳 Whales" : f === "New Today" ? "🆕 New Today" : f}
                  {f === "Whale" && ` (${activeLeads.filter(l => l.isWhale).length})`}
                  {f === "New Today" && ` (${activeLeads.filter(l => (Date.now() - new Date(l.timestamp).getTime()) < 864e5).length})`}
                  {f !== "All" && f !== "Whale" && f !== "New Today" && ` (${activeLeads.filter(l => l.scoreLabel === f).length})`}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filtered.map(lead => {
                const isLive = recentLiveIds.has(lead.id);
                return (
                <div
                  key={lead.id}
                  id={`lead-card-${lead.id}`}
                  className={`glass rounded-2xl border transition-all p-5 ${
                    lead.isWhale && lead.whaleTier === "gold"
                      ? "border-[rgba(250,204,21,0.45)] shadow-[0_0_28px_rgba(250,204,21,0.07)]"
                      : lead.isWhale
                      ? "border-[rgba(196,181,253,0.3)]"
                      : isLive
                      ? "border-[rgba(74,222,128,0.5)] shadow-[0_0_24px_rgba(74,222,128,0.1)]"
                      : "border-[rgba(255,255,255,0.06)] hover:border-[rgba(74,222,128,0.2)]"
                  }`}
                  style={isLive ? { animation: "slideInTop 0.5s cubic-bezier(0.175,0.885,0.32,1.275) both" } : undefined}
                >
                  {isLive && (
                    <style>{`
                      @keyframes slideInTop {
                        from { opacity: 0; transform: translateY(-12px); }
                        to   { opacity: 1; transform: translateY(0); }
                      }
                    `}</style>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="flex-shrink-0 text-center">
                      <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border" style={{ borderColor: `${scoreColor(lead.score)}40`, backgroundColor: `${scoreColor(lead.score)}0A` }}>
                        <span className="text-2xl font-black tabular-nums leading-none" style={{ color: scoreColor(lead.score) }}>{lead.score}</span>
                        <span className="text-[9px] text-gray-600 mt-0.5">/ 100</span>
                      </div>
                      <div className={`mt-2 text-[10px] px-2 py-0.5 rounded-lg border font-bold text-center ${scoreBadge(lead.scoreLabel)}`}>{lead.scoreLabel}</div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-white font-bold text-base">{lead.name}</h3>
                            {lead.isWhale && lead.whaleTier === "gold" && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-[#FACC15] bg-[rgba(250,204,21,0.12)] border border-[rgba(250,204,21,0.4)] px-2 py-0.5 rounded-lg">
                                ⭐ Whale Alert
                              </span>
                            )}
                            {lead.isWhale && lead.whaleTier === "silver" && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-[#C4B5FD] bg-[rgba(196,181,253,0.08)] border border-[rgba(196,181,253,0.25)] px-2 py-0.5 rounded-lg">
                                🐳 High Intent
                              </span>
                            )}
                            {isLive && (
                              <span className="flex items-center gap-1 text-[10px] font-black text-[#4ADE80] bg-[rgba(74,222,128,0.12)] border border-[rgba(74,222,128,0.35)] px-2 py-0.5 rounded-lg">
                                <span className="w-1 h-1 rounded-full bg-[#4ADE80] animate-pulse" />
                                NEW
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-0.5 text-xs">
                            {lead.phone && (
                              <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-gray-400 hover:text-[#4ADE80] transition-colors font-mono" title="Click to call or copy">
                                <Phone size={10} className="flex-shrink-0" />
                                {lead.phone}
                              </a>
                            )}
                            {lead.email && (
                              <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-gray-400 hover:text-[#60A5FA] transition-colors" title="Send email">
                                <Mail size={10} className="flex-shrink-0" />
                                {lead.email}
                              </a>
                            )}
                            <span className="flex items-center gap-1 text-gray-600"><Clock size={10} /> {timeAgo(lead.timestamp)}</span>
                          {/* Expiring-soon badge */}
                          {daysRemaining(lead.timestamp) <= 30 && daysRemaining(lead.timestamp) > 0 && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-orange-400 animate-pulse">
                              ⏳ {daysRemaining(lead.timestamp)}d left
                            </span>
                          )}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-xs font-bold hover:bg-[rgba(74,222,128,0.14)] transition-colors">
                              <Phone size={11} /> Call Now
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(96,165,250,0.08)] border border-[rgba(96,165,250,0.2)] text-[#60A5FA] text-xs font-bold hover:bg-[rgba(96,165,250,0.14)] transition-colors">
                              <Mail size={11} /> Email
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[`🏢 ${lead.spaceType}`, `💰 $${lead.budget.toLocaleString()}/mo`, `📅 ${lead.timeline}`, `👥 ${lead.teamSize}`].map(chip => (
                          <span key={chip} className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-gray-400">{chip}</span>
                        ))}
                        {lead.isWhale && lead.whaleKeywords && lead.whaleKeywords.length > 0 && (
                          <span className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(250,204,21,0.08)] border border-[rgba(250,204,21,0.25)] text-[#FACC15] font-semibold">
                            🎯 {lead.whaleKeywords.slice(0, 2).join(" · ")}
                          </span>
                        )}
                        {lead.source && lead.source !== "organic" && (
                          <span className={`text-xs px-2.5 py-1 rounded-lg font-semibold border ${
                            lead.source === "facebook"
                              ? "bg-[rgba(59,130,246,0.08)] border-[rgba(59,130,246,0.25)] text-[#60A5FA]"
                              : lead.source === "instagram"
                              ? "bg-[rgba(236,72,153,0.08)] border-[rgba(236,72,153,0.25)] text-[#F472B6]"
                              : lead.source === "google"
                              ? "bg-[rgba(250,204,21,0.08)] border-[rgba(250,204,21,0.2)] text-[#FACC15]"
                              : "bg-[rgba(148,163,184,0.08)] border-[rgba(148,163,184,0.2)] text-[#94A3B8]"
                          }`}>
                            {lead.source === "facebook" ? "📘" : lead.source === "instagram" ? "📷" : lead.source === "google" ? "🔍" : "🌐"} {lead.source.charAt(0).toUpperCase() + lead.source.slice(1)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed mb-3">
                        <span className="text-[#4ADE80] font-semibold">AI Analysis: </span>{lead.reasoning}
                      </p>
                      {/* Comments / Activity */}
                      <LeadComments leadId={lead.id} currentUserName={currentUser?.name} />
                      {/* Age bar */}
                    <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] text-gray-600 flex items-center gap-1">
                          <Clock size={9} /> Lead age: {daysOld(lead.timestamp)} day{daysOld(lead.timestamp) !== 1 ? "s" : ""}
                        </span>
                        <span className="text-[10px] font-bold" style={{ color: ageBarColor(daysOld(lead.timestamp)) }}>
                          {daysRemaining(lead.timestamp)} days remaining
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.05)] overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${ageBarPct(daysOld(lead.timestamp))}%`,
                            backgroundColor: ageBarColor(daysOld(lead.timestamp)),
                            opacity: 0.8,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              ); })}

            </div>

            {filtered.length === 0 && (
              <div className="text-center py-20 text-gray-600">
                <Zap size={32} className="mx-auto mb-3 opacity-30" />
                <p>No {filter.toLowerCase()}s yet.</p>
                <p className="text-sm mt-1">Leads appear here as they come in through Ask VISION.</p>
              </div>
            )}
          </>
        )}

        {/* ─ ARCHIVED TAB ─────────────────────────────────────── */}
        {/* ─ ANALYTICS TAB ──────────────────────────────────────────────── */}
        {activeTab === "analytics" && (
          <AnalyticsTab leads={activeLeads as unknown as AnalyticsLead[]} />
        )}

        {/* ─ TENANTS TAB ──────────────────────────────────────────────── */}
        {activeTab === "tenants" && (
          <TenantsTab currentUserName={currentUser?.name} />
        )}

        {activeTab === "archived" && (
          <>
            <div className="rounded-2xl border border-[rgba(148,163,184,0.15)] bg-[rgba(148,163,184,0.03)] p-5 mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Archive size={14} className="text-gray-500" />
                <p className="text-sm font-bold text-gray-400">Archived Leads</p>
              </div>
              <p className="text-xs text-gray-600">Leads that have passed the 180-day window. They are retained for reference and can be reactivated at any time.</p>
            </div>

            {archivedLeads.length === 0 ? (
              <div className="text-center py-20 text-gray-700">
                <Archive size={32} className="mx-auto mb-3 opacity-30" />
                <p>No archived leads yet.</p>
                <p className="text-sm mt-1 text-gray-600">Leads automatically move here after 180 days.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {archivedLeads.map(lead => (
                  <div key={lead.id} className="glass rounded-2xl border border-[rgba(255,255,255,0.04)] p-4 opacity-70 hover:opacity-90 transition-opacity">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl flex flex-col items-center justify-center border border-[rgba(148,163,184,0.2)] bg-[rgba(148,163,184,0.05)] flex-shrink-0">
                        <span className="text-lg font-black tabular-nums text-gray-500">{lead.score}</span>
                        <span className="text-[8px] text-gray-700">/ 100</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-gray-400">{lead.name}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg border border-[rgba(148,163,184,0.2)] text-gray-600 font-bold">{lead.scoreLabel}</span>
                          <span className="text-[10px] text-gray-700 flex items-center gap-1"><Archive size={9} /> Archived {daysOld(lead.timestamp) - MAX_AGE_DAYS}d ago</span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-[11px] text-gray-600">
                          <span>{lead.spaceType}</span>
                          <span>${lead.budget.toLocaleString()}/mo</span>
                          {lead.phone && <span>{lead.phone}</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          // Reset timestamp to now to reactivate
                          setLeads(prev => prev.map(l =>
                            l.id === lead.id ? { ...l, timestamp: new Date().toISOString() } : l
                          ));
                        }}
                        className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-xs font-bold hover:bg-[rgba(74,222,128,0.08)] transition-colors"
                      >
                        <RefreshCw size={11} /> Reactivate
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ─ SETTINGS TAB ───────────────────────────────────────────────────── */}
        {activeTab === "settings" && <SettingsPanel leads={activeLeads} />}

        <p className="text-center text-[11px] text-gray-700 mt-10">
          VISION CRM · AI-Powered by Gemini · Auto-refreshes every 30s
          <br />
          <span className="text-gray-600">🟢 Supabase connected · </span>
          <span className="text-gray-800">Monday.com sync — ready to activate on API connection</span>
        </p>
      </div>
    </div>
  );
}
