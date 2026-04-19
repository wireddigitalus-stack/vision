import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const TYPE_LABELS: Record<string, string> = {
  new_listing:   "New Property Available",
  lease_signed:  "Lease Signed / Deal Closed",
  market_update: "Market Update",
  company_news:  "Company Announcement",
  expansion:     "Business Expansion",
  award:         "Award / Recognition",
  custom:        "Press Release",
};

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const { type, topic, details } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const typeLabel = TYPE_LABELS[type] || "Press Release";

    const prompt = `You are a professional commercial real estate PR copywriter.

Write a polished, professional press release for Vision LLC, a commercial real estate firm based in Bristol, Tennessee.

Release Type: ${typeLabel}
Topic / Property: ${topic}
${details ? `Additional Details: ${details}` : ""}

REQUIREMENTS:
- Write in AP Style (standard press release format)
- First line must be: HEADLINE: [your headline here]
- Then a blank line
- Then the dateline: BRISTOL, Tenn. — [write today's approximate date] —
- Include 3–5 paragraphs of professional body copy
- End with this boilerplate paragraph: "About Vision LLC: Vision LLC is a commercial real estate firm specializing in office, retail, and industrial space in the Tri-Cities region of Tennessee and Virginia. Powered by AI-driven property intelligence, Vision LLC connects businesses with premium commercial spaces and delivers exceptional client service. For more information, visit teamvisionllc.com."
- Final line: ###
- Tone: confident, professional, newsworthy — avoid filler phrases
- Contact: ahurley1474@gmail.com | Vision LLC | Bristol, TN

Write the full press release now.`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1200 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return NextResponse.json({ error: `Gemini API error ${geminiRes.status}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return NextResponse.json({ error: "No content generated. Please try again." }, { status: 500 });
    }

    // Extract headline
    const headlineMatch = text.match(/^HEADLINE:\s*(.+)$/m);
    const title = headlineMatch ? headlineMatch[1].trim() : topic;
    const content = text.replace(/^HEADLINE:\s*.+\n?/m, "").trim();

    return NextResponse.json({ title, content });
  } catch (err) {
    console.error("Press release generation error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
