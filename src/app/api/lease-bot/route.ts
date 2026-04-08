import { NextRequest, NextResponse } from "next/server";
import { LEADS_STORE, type Lead } from "@/lib/leads-store";


const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY environment variable is not set");


const PROPERTIES_CONTEXT = `
Available Vision LLC Properties:
1. City Centre Professional Suites — 1,200–18,000+ sqft, downtown office, State Street Bristol TN, mixed-use building, premium finishes
2. The Executive — 500–12,000 sqft, private executive office suites, historic building, downtown Bristol TN
3. Bristol CoWork — 620 State Street, private offices, dedicated desks, conference rooms, monthly memberships, all-inclusive pricing, downtown Bristol TN
4. Centre Point Suites — 800–5,000 sqft, high-traffic retail/office, multiple units available, Bristol TN
5. Foundation Event Facility — 3,000–8,000 sqft, historic adaptive reuse, event & commercial space, downtown Bristol TN
6. Commercial Warehouse — 2,000–25,000 sqft, loading docks, highway access, Bristol metro area
`;

const SCORING_PROMPT = (lead: Partial<Lead>) => `
You are a commercial real estate lead scoring AI for Vision LLC in Bristol, TN.

Score this lead from 0-100 based on these criteria:
- Budget > $2,000/mo = strong signal (+25 pts)
- Budget $1,000–$2,000/mo = moderate signal (+15 pts)
- Budget < $1,000/mo = weak signal (+5 pts)
- Move-in timeline < 30 days = very hot (+30 pts)
- Move-in timeline 30–60 days = warm (+20 pts)
- Move-in timeline 60–90 days = cool (+10 pts)
- Move-in timeline > 90 days = cold (+5 pts)
- Space type = Office or Executive Suite = high fit (+20 pts)
- Space type = CoWork = good fit (+15 pts)
- Space type = Retail or Warehouse = moderate fit (+10 pts)
- Team size 5+ = strong need (+15 pts)
- Team size 2–4 = moderate need (+10 pts)
- Solo = solo (+5 pts)

LEAD DATA:
- Name: ${lead.name}
- Space Type Requested: ${lead.spaceType}
- Monthly Budget: $${lead.budget}
- Move-in Timeline: ${lead.timeline}
- Team Size: ${lead.teamSize}
- Additional Info: ${lead.additionalInfo || "None provided"}

${PROPERTIES_CONTEXT}

Respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "score": <number 0-100>,
  "scoreLabel": "<Hot Lead|Warm Lead|Nurture>",
  "reasoning": "<2-sentence max explanation of score>",
  "matchedProperties": [
    {
      "id": "<property-id-slug>",
      "name": "<property name>",
      "type": "<Office|CoWork|Retail|Warehouse|Event>",
      "sqft": "<size range>",
      "location": "Downtown Bristol, TN",
      "matchReason": "<one sentence why this property fits>"
    }
  ]
}

Rules for scoreLabel:
- score >= 70 = "Hot Lead"
- score 40–69 = "Warm Lead"
- score < 40 = "Nurture"

Include 1-2 best matching properties only.
`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, spaceType, budget, timeline, teamSize, additionalInfo } = body;

    if (!name || !spaceType || !budget) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const leadData: Partial<Lead> = {
      name, email, phone,
      spaceType, budget: Number(budget),
      timeline, teamSize, additionalInfo,
    };

    // Direct fetch to v1 REST API — gemini-2.0-flash confirmed available for this key
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: SCORING_PROMPT(leadData) }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return NextResponse.json({ error: "Scoring failed — please try again" }, { status: 500 });
    }

    const geminiData = await geminiRes.json();
    const rawText = (geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "").trim();

    // Strip markdown fences if present
    const jsonText = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const aiResult = JSON.parse(jsonText);

    const lead: Lead = {
      id: `lead_${Date.now()}`,
      timestamp: new Date().toISOString(),
      name,
      email: email || "",
      phone: phone || "",
      spaceType,
      budget: Number(budget),
      timeline,
      teamSize,
      additionalInfo: additionalInfo || "",
      score: aiResult.score,
      scoreLabel: aiResult.scoreLabel,
      reasoning: aiResult.reasoning,
      matchedProperties: aiResult.matchedProperties || [],
    };

    LEADS_STORE.unshift(lead);
    if (LEADS_STORE.length > 50) LEADS_STORE.pop();

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Lease-Bot scoring error:", error);
    return NextResponse.json(
      { error: "Scoring failed — please try again" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ leads: LEADS_STORE });
}
