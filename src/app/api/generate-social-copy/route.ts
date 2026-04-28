import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const { property, tone, customContext } = await req.json();
    if (!property?.name) {
      return NextResponse.json({ error: "Property is required." }, { status: 400 });
    }

    const toneGuide: Record<string, string> = {
      professional: "formal and polished, ideal for business owners and executives",
      friendly:     "warm and approachable, welcoming to small business owners",
      exciting:     "energetic and enthusiastic with urgency — great opportunity!",
    };

    const contextNote = customContext?.trim()
      ? `\nSpecial angle to highlight: ${customContext.trim()}`
      : "";

    const prompt = `You are a social media expert for Vision LLC, Downtown Bristol TN/VA's premier commercial real estate firm (20+ years).

PROPERTY: ${property.name}
TYPE: ${property.type}
LOCATION: ${property.city}
SIZE: ${property.sqft} sqft
STATUS: ${property.status}
DESCRIPTION: ${property.description ?? ""}
FEATURES: ${(property.features ?? []).join(", ") || "N/A"}
TONE: ${toneGuide[tone] ?? "professional"}${contextNote}

Generate ALL sections below. Use EXACTLY these headers, nothing else before or after:

FACEBOOK:
[2-3 sentences. Warm, informative. Mention Bristol TN/VA. End with CTA to call 423-573-1022 or teamvisionllc.com. Max 2 emojis.]

INSTAGRAM:
[1-2 punchy sentences. Strong hook. NO hashtags here. Max 150 chars.]

LINKEDIN:
[Professional B2B. 2-3 sentences on investment/opportunity angle. Mention Vision LLC 20+ years. Include CTA.]

STORY:
[Max 10 words. Ultra-punchy overlay text for Stories. Example: "Prime downtown office — available now 🏢"]

HASHTAGS:
[Exactly 20 hashtags separated by spaces. Must include: #BristolTN #TriCitiesTN #VisionLLC #CommercialRealEstate. Fill rest with relevant location, industry, and property-type tags.]

BEST_TIME:
[One sentence: best day + time to post on Instagram/Facebook for CRE in Eastern US, with brief reason.]`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 1200 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini error:", errText);
      return NextResponse.json({ error: `Gemini API error ${geminiRes.status}` }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const parts = geminiData.candidates?.[0]?.content?.parts || [];
    const text = parts.map((p: { text?: string }) => p.text || "").join("").trim();

    if (!text) {
      return NextResponse.json({ error: "No content generated. Please try again." }, { status: 500 });
    }

    const extract = (label: string) => {
      const m = text.match(new RegExp(`${label}:\\s*([\\s\\S]*?)(?=FACEBOOK:|INSTAGRAM:|LINKEDIN:|STORY:|HASHTAGS:|BEST_TIME:|$)`, "i"));
      return m?.[1]?.trim() ?? "";
    };

    return NextResponse.json({
      facebook:     extract("FACEBOOK"),
      instagram:    extract("INSTAGRAM"),
      linkedin:     extract("LINKEDIN"),
      storyCaption: extract("STORY"),
      hashtags:     extract("HASHTAGS"),
      bestTime:     extract("BEST_TIME"),
    });
  } catch (err) {
    console.error("Social copy generation error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
