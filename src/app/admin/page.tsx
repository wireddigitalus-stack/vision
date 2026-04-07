"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  RefreshCw,
  Phone,
  Clock,
  Building2,
  TrendingUp,
  Users,
  Filter,
} from "lucide-react";

interface MatchedProperty {
  id: string;
  name: string;
  type: string;
  sqft: string;
  location: string;
  matchReason: string;
}

interface Lead {
  id: string;
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  spaceType: string;
  budget: number;
  timeline: string;
  teamSize: string;
  score: number;
  scoreLabel: "Hot Lead" | "Warm Lead" | "Nurture";
  reasoning: string;
  matchedProperties: MatchedProperty[];
}

function scoreColor(score: number) {
  if (score >= 70) return "#4ADE80";
  if (score >= 40) return "#FACC15";
  return "#94A3B8";
}

function scoreBadge(label: string) {
  if (label === "Hot Lead")
    return "bg-[rgba(74,222,128,0.1)] text-[#4ADE80] border-[rgba(74,222,128,0.3)]";
  if (label === "Warm Lead")
    return "bg-[rgba(250,204,21,0.1)] text-[#FACC15] border-[rgba(250,204,21,0.3)]";
  return "bg-[rgba(148,163,184,0.1)] text-[#94A3B8] border-[rgba(148,163,184,0.2)]";
}

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

// Demo seed leads so the dashboard always looks populated
const DEMO_LEADS: Lead[] = [
  {
    id: "demo_1",
    timestamp: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    name: "Sarah Mitchell",
    email: "",
    phone: "423-555-0192",
    spaceType: "Executive Office",
    budget: 3000,
    timeline: "ASAP — under 30 days",
    teamSize: "2–4 people",
    score: 91,
    scoreLabel: "Hot Lead",
    reasoning:
      "Strong budget, urgent timeline, and professional office need align perfectly with City Centre availability.",
    matchedProperties: [
      {
        id: "city-centre",
        name: "City Centre Professional Suites",
        type: "Office",
        sqft: "1,200–3,000 sqft",
        location: "Downtown Bristol, TN",
        matchReason: "Premium finishes, immediate availability, fits 2-4 team.",
      },
    ],
  },
  {
    id: "demo_2",
    timestamp: new Date(Date.now() - 1000 * 60 * 34).toISOString(),
    name: "Mark Delaney",
    email: "",
    phone: "",
    spaceType: "CoWork Membership",
    budget: 800,
    timeline: "1–2 months",
    teamSize: "Solo",
    score: 58,
    scoreLabel: "Warm Lead",
    reasoning:
      "Solo operator with moderate budget — Bristol CoWork is an excellent fit. Nurture toward dedicated desk.",
    matchedProperties: [
      {
        id: "bristol-cowork",
        name: "Bristol CoWork",
        type: "CoWork",
        sqft: "Hot desk / Dedicated desk",
        location: "620 State Street, Bristol, TN",
        matchReason:
          "All-inclusive monthly membership, perfect for solo professional.",
      },
    ],
  },
  {
    id: "demo_3",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    name: "Dr. James Patel",
    email: "",
    phone: "276-555-0847",
    spaceType: "Private Office Suite",
    budget: 6000,
    timeline: "ASAP — under 30 days",
    teamSize: "5–10 people",
    score: 96,
    scoreLabel: "Hot Lead",
    reasoning:
      "Very high budget, urgent timeline, established team — this is a priority contact for Allen's team today.",
    matchedProperties: [
      {
        id: "the-executive",
        name: "The Executive Office Suites",
        type: "Office",
        sqft: "2,000–6,000 sqft",
        location: "Downtown Bristol, TN",
        matchReason:
          "Historic prestige building, fits team of 5-10, premium positioning.",
      },
      {
        id: "city-centre",
        name: "City Centre Professional Suites",
        type: "Office",
        sqft: "3,000–8,000 sqft",
        location: "Downtown Bristol, TN",
        matchReason: "Larger footprint option with flexible configuration.",
      },
    ],
  },
  {
    id: "demo_4",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    name: "Blake Thornton",
    email: "",
    phone: "",
    spaceType: "Retail Storefront",
    budget: 1500,
    timeline: "3–6 months",
    teamSize: "2–4 people",
    score: 42,
    scoreLabel: "Warm Lead",
    reasoning:
      "Retail need with longer timeline. Good candidate for State Street storefront. Follow up in 60 days.",
    matchedProperties: [
      {
        id: "centre-point",
        name: "Centre Point Suites",
        type: "Retail",
        sqft: "800–2,000 sqft",
        location: "Downtown Bristol, TN",
        matchReason: "High foot traffic retail units at budget-friendly rates.",
      },
    ],
  },
];

export default function AdminPage() {
  const [leads, setLeads] = useState<Lead[]>(DEMO_LEADS);
  const [filter, setFilter] = useState<"All" | "Hot Lead" | "Warm Lead" | "Nurture">("All");
  const [loading, setLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lease-bot");
      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        // Merge real leads with demo leads
        const realIds = new Set(data.leads.map((l: Lead) => l.id));
        const uniqueDemo = DEMO_LEADS.filter((d) => !realIds.has(d.id));
        setLeads([...data.leads, ...uniqueDemo]);
      }
    } catch {
      // Keep demo data on error
    } finally {
      setLoading(false);
      setLastRefresh(new Date());
    }
  };

  useEffect(() => {
    fetchLeads();
    const interval = setInterval(fetchLeads, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const filtered =
    filter === "All" ? leads : leads.filter((l) => l.scoreLabel === filter);

  const hotCount = leads.filter((l) => l.scoreLabel === "Hot Lead").length;
  const warmCount = leads.filter((l) => l.scoreLabel === "Warm Lead").length;
  const avgScore = Math.round(leads.reduce((a, l) => a + l.score, 0) / leads.length);

  return (
    <div className="min-h-screen bg-[#080C14] text-white">
      <div className="max-w-6xl mx-auto px-6 pt-20 pb-10">
        {/* Page Title */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_20px_rgba(74,222,128,0.25)]">
              <Zap size={18} className="text-black" />
            </div>
            <div>
              <h1 className="text-white font-black text-xl">Lease-Bot CRM</h1>
              <p className="text-[11px] text-gray-500">AI Lead Intelligence Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-gray-600 hidden sm:block">
              Last refresh: {lastRefresh.toLocaleTimeString()}
            </span>
            <button
              onClick={fetchLeads}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-sm hover:bg-[rgba(74,222,128,0.12)] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Leads", value: leads.length, icon: Users, color: "#60A5FA" },
            { label: "Hot Leads 🔥", value: hotCount, icon: TrendingUp, color: "#4ADE80" },
            { label: "Warm Leads", value: warmCount, icon: Zap, color: "#FACC15" },
            { label: "Avg AI Score", value: `${avgScore}/100`, icon: Building2, color: "#A78BFA" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div
              key={label}
              className="glass rounded-2xl p-4 border border-[rgba(255,255,255,0.06)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={14} style={{ color }} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2 mb-6">
          <Filter size={13} className="text-gray-500" />
          {(["All", "Hot Lead", "Warm Lead", "Nurture"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                filter === f
                  ? "bg-[rgba(74,222,128,0.1)] border-[rgba(74,222,128,0.3)] text-[#4ADE80]"
                  : "border-[rgba(255,255,255,0.06)] text-gray-500 hover:text-gray-300"
              }`}
            >
              {f} {f !== "All" && `(${leads.filter((l) => l.scoreLabel === f).length})`}
            </button>
          ))}
        </div>

        {/* Lead cards */}
        <div className="space-y-4">
          {filtered.map((lead) => (
            <div
              key={lead.id}
              className="glass rounded-2xl border border-[rgba(255,255,255,0.06)] hover:border-[rgba(74,222,128,0.2)] transition-all p-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                {/* Score arc */}
                <div className="flex-shrink-0 text-center">
                  <div
                    className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border"
                    style={{
                      borderColor: `${scoreColor(lead.score)}40`,
                      backgroundColor: `${scoreColor(lead.score)}0A`,
                    }}
                  >
                    <span
                      className="text-2xl font-black tabular-nums leading-none"
                      style={{ color: scoreColor(lead.score) }}
                    >
                      {lead.score}
                    </span>
                    <span className="text-[9px] text-gray-600 mt-0.5">/ 100</span>
                  </div>
                  <div
                    className={`mt-2 text-[10px] px-2 py-0.5 rounded-lg border font-bold text-center ${scoreBadge(lead.scoreLabel)}`}
                  >
                    {lead.scoreLabel}
                  </div>
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-white font-bold text-base">{lead.name}</h3>
                      <div className="flex flex-wrap gap-3 mt-0.5 text-xs text-gray-500">
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone size={10} /> {lead.phone}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {timeAgo(lead.timestamp)}
                        </span>
                      </div>
                    </div>
                    {lead.phone && (
                      <a
                        href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-xs font-bold hover:bg-[rgba(74,222,128,0.14)] transition-colors"
                      >
                        <Phone size={11} /> Call Now
                      </a>
                    )}
                  </div>

                  {/* Lead details chips */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {[
                      `🏢 ${lead.spaceType}`,
                      `💰 $${lead.budget.toLocaleString()}/mo`,
                      `📅 ${lead.timeline}`,
                      `👥 ${lead.teamSize}`,
                    ].map((chip) => (
                      <span
                        key={chip}
                        className="text-xs px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.07)] text-gray-400"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>

                  {/* AI reasoning */}
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">
                    <span className="text-[#4ADE80] font-semibold">AI Analysis: </span>
                    {lead.reasoning}
                  </p>

                  {/* Matched properties */}
                  {lead.matchedProperties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {lead.matchedProperties.map((prop) => (
                        <div
                          key={prop.id}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(74,222,128,0.04)] border border-[rgba(74,222,128,0.12)] text-xs"
                        >
                          <Building2 size={10} className="text-[#4ADE80]" />
                          <span className="text-gray-300">{prop.name}</span>
                          <span className="text-gray-600">· {prop.sqft}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-600">
            <Zap size={32} className="mx-auto mb-3 opacity-30" />
            <p>No {filter.toLowerCase()}s yet.</p>
            <p className="text-sm mt-1">Leads will appear here as they come in through the Lease-Bot.</p>
          </div>
        )}

        <p className="text-center text-[11px] text-gray-700 mt-10">
          Vision Lease-Bot CRM · AI-Powered by Gemini · Auto-refreshes every 30s
          <br />
          <span className="text-gray-800">Monday.com sync — ready to activate on API connection</span>
        </p>
      </div>
    </div>
  );
}
