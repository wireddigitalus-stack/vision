import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

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
    const { type, topic, details } = await req.json();

    if (!topic?.trim()) {
      return NextResponse.json({ error: "Topic is required." }, { status: 400 });
    }

    const typeLabel = TYPE_LABELS[type] || "Press Release";
    const companyName = "Vision LLC";
    const location = "Bristol, Tennessee";

    const prompt = `You are a professional commercial real estate PR copywriter.

Write a polished, professional press release for ${companyName}, a commercial real estate firm based in ${location}.

Release Type: ${typeLabel}
Topic / Property: ${topic}
${details ? `Additional Details: ${details}` : ""}

REQUIREMENTS:
- Write in AP Style (standard press release format)
- Start with the dateline: ${location.toUpperCase()} — [Month Day, Year] —
- Include a strong headline (return it separately on the first line prefixed with "HEADLINE: ")
- 3–5 paragraphs of professional body copy
- Include a boilerplate "About Vision LLC" paragraph at the end:
  "About Vision LLC: Vision LLC is a commercial real estate firm specializing in office, retail, and industrial space in the Tri-Cities region of Tennessee and Virginia. Powered by AI-driven property intelligence, Vision LLC connects businesses with premium commercial spaces and delivers exceptional client service. For more information, visit teamvisionllc.com."
- End with: ### (standard PR end marker)
- Tone: confident, professional, newsworthy — avoid fluff
- Do NOT use placeholder text like [contact name] — write realistic copy
- Contact info: ahurley1474@gmail.com | Vision LLC | Bristol, TN

Write the full press release now.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Extract headline if present
    const headlineMatch = text.match(/^HEADLINE:\s*(.+)$/m);
    const title = headlineMatch ? headlineMatch[1].trim() : topic;
    const content = text.replace(/^HEADLINE:\s*.+\n?/m, "").trim();

    return NextResponse.json({ title, content });
  } catch (err) {
    console.error("Press release generation error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
