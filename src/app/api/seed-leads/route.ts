import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// One-shot seed endpoint — protected by ADMIN_SECRET to prevent public access.
// GET /api/seed-leads?secret=<ADMIN_SECRET>
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = Date.now();

  const DEMO_ROWS = [
    {
      id: "demo_1",
      timestamp: new Date(now - 1000 * 60 * 8).toISOString(),
      name: "Sarah Mitchell",
      email: "",
      phone: "423-555-0192",
      space_type: "Executive Office",
      budget: 3000,
      timeline: "ASAP — under 30 days",
      team_size: "2–4 people",
      score: 91,
      score_label: "Hot Lead",
      reasoning: "Strong budget, urgent timeline, and professional office need align perfectly with City Centre availability.",
      matched_properties: [{ id: "city-centre", name: "City Centre Professional Suites", type: "Office", sqft: "1,200–3,000 sqft", location: "Downtown Bristol, TN", matchReason: "Premium finishes, immediate availability, fits 2-4 team." }],
      is_whale: false, whale_tier: null, whale_keywords: [],
      source: "organic", medium: "direct", campaign: "",
    },
    {
      id: "demo_2",
      timestamp: new Date(now - 1000 * 60 * 34).toISOString(),
      name: "Mark Delaney",
      email: "", phone: "",
      space_type: "CoWork Membership",
      budget: 800,
      timeline: "1–2 months",
      team_size: "Solo",
      score: 58,
      score_label: "Warm Lead",
      reasoning: "Solo operator with moderate budget — Bristol CoWork is an excellent fit. Nurture toward dedicated desk.",
      matched_properties: [{ id: "bristol-cowork", name: "Bristol CoWork", type: "CoWork", sqft: "Hot desk / Dedicated desk", location: "620 State Street, Bristol, TN", matchReason: "All-inclusive monthly membership, perfect for solo professional." }],
      is_whale: false, whale_tier: null, whale_keywords: [],
      source: "organic", medium: "direct", campaign: "",
    },
    {
      id: "demo_3",
      timestamp: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
      name: "Dr. James Patel",
      email: "",
      phone: "276-555-0847",
      space_type: "Private Office Suite",
      budget: 6000,
      timeline: "ASAP — under 30 days",
      team_size: "5–10 people",
      score: 96,
      score_label: "Hot Lead",
      reasoning: "Very high budget, urgent timeline, established team — priority contact for today.",
      matched_properties: [
        { id: "the-executive", name: "The Executive Office Suites", type: "Office", sqft: "2,000–6,000 sqft", location: "Downtown Bristol, TN", matchReason: "Historic prestige building, fits team of 5-10, premium positioning." },
        { id: "city-centre", name: "City Centre Professional Suites", type: "Office", sqft: "3,000–8,000 sqft", location: "Downtown Bristol, TN", matchReason: "Larger footprint option with flexible configuration." },
      ],
      is_whale: true, whale_tier: "gold", whale_keywords: ["1031 exchange", "triple net"],
      source: "organic", medium: "direct", campaign: "",
    },
    {
      id: "demo_4",
      timestamp: new Date(now - 1000 * 60 * 60 * 5).toISOString(),
      name: "Blake Thornton",
      email: "", phone: "",
      space_type: "Retail Storefront",
      budget: 1500,
      timeline: "3–6 months",
      team_size: "2–4 people",
      score: 42,
      score_label: "Warm Lead",
      reasoning: "Retail need with longer timeline. Good candidate for State Street storefront. Follow up in 60 days.",
      matched_properties: [{ id: "centre-point", name: "Centre Point Suites", type: "Retail", sqft: "800–2,000 sqft", location: "Downtown Bristol, TN", matchReason: "High foot traffic retail units at budget-friendly rates." }],
      is_whale: false, whale_tier: null, whale_keywords: [],
      source: "organic", medium: "direct", campaign: "",
    },
  ];

  // Upsert so it's safe to run multiple times
  const { error, count } = await supabaseAdmin
    .from("leads")
    .upsert(DEMO_ROWS, { onConflict: "id" });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ seeded: count ?? DEMO_ROWS.length, message: "Demo leads seeded successfully." });
}
