import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// POST — insert a manually-scored lead directly to Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email, phone, spaceType, budget,
      timeline, teamSize, additionalInfo,
      score, scoreLabel, reasoning,
    } = body;

    if (!name || !spaceType || !budget) {
      return NextResponse.json({ error: "name, spaceType, and budget are required" }, { status: 400 });
    }

    const derivedLabel =
      score >= 70 ? "Hot Lead" : score >= 40 ? "Warm Lead" : "Nurture";

    const lead = {
      id: `manual_${Date.now()}`,
      timestamp: new Date().toISOString(),
      name: name.trim(),
      email: email?.trim() || "",
      phone: phone?.trim() || "",
      space_type: spaceType,
      budget: Number(budget),
      timeline: timeline || "Exploring options",
      team_size: teamSize || "Solo",
      additional_info: additionalInfo?.trim() || "",
      score: Number(score) || 50,
      score_label: scoreLabel || derivedLabel,
      reasoning: reasoning?.trim() || "Manually entered lead.",
      matched_properties: [],
      source: "manual",
      medium: "admin",
      campaign: "",
    };

    const dbRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_SERVICE_KEY,
        "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify(lead),
    });

    if (!dbRes.ok) {
      const err = await dbRes.text();
      console.error("Supabase insert error:", err);
      return NextResponse.json({ error: "Database insert failed" }, { status: 500 });
    }

    // Return in the same shape as lease-bot so AdminPage can use it uniformly
    const returned = {
      id: lead.id,
      timestamp: lead.timestamp,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      spaceType: lead.space_type,
      budget: lead.budget,
      timeline: lead.timeline,
      teamSize: lead.team_size,
      score: lead.score,
      scoreLabel: lead.score_label,
      reasoning: lead.reasoning,
      matchedProperties: [],
      source: lead.source,
      medium: lead.medium,
    };

    return NextResponse.json({ success: true, lead: returned });
  } catch (err) {
    console.error("admin-lead error:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
