import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const { property, platform, tone } = await req.json();
    if (!property?.name) {
      return NextResponse.json({ error: "Property is required." }, { status: 400 });
    }

    const toneGuide: Record<string, string> = {
      professional: "formal and polished, ideal for business owners and executives",
      friendly:     "warm and approachable, welcoming to small business owners",
      exciting:     "energetic and enthusiastic with urgency — great opportunity!",
    };

    const prompt = `Generate social media post copy for a commercial real estate listing.

Company: Vision LLC — Downtown Bristol, TN/VA's premier commercial real estate firm (20+ years)
Property: ${property.name}
Type: ${property.type}
Location: ${property.city}
Size: ${property.sqft} sqft
Status: ${property.status}
Description: ${property.description ?? ""}
Key Features: ${(property.features ?? []).join(", ") || "N/A"}
Tone: ${toneGuide[tone] ?? "professional"}

Write ${platform === "both" ? "TWO posts" : "ONE post"} for ${platform === "both" ? "Facebook AND Instagram" : platform}.

Rules:
- Facebook: 2–3 sentences, warm/informative, include "Bristol, TN/VA", end with CTA to call Vision LLC or visit teamvisionllc.com. Use 1–2 emojis max. 150–200 characters.
- Instagram: Short punchy 1–2 sentence hook, then line break, then 8–10 relevant hashtags including #BristolTN #TriCitiesTN #CommercialRealEstate. 100–150 characters + hashtags.

Format your response EXACTLY like this (no extra text before or after):

FACEBOOK:
[facebook post text here]

INSTAGRAM:
[instagram caption here]
[hashtags here]`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 1024 },
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

    // Parse Facebook and Instagram sections
    const fbMatch  = text.match(/FACEBOOK:\s*([\s\S]*?)(?=INSTAGRAM:|$)/i);
    const igMatch  = text.match(/INSTAGRAM:\s*([\s\S]*?)$/i);

    const facebook  = fbMatch  ? fbMatch[1].trim()  : (platform === "facebook"  ? text : "");
    const instagram = igMatch  ? igMatch[1].trim()  : (platform === "instagram" ? text : "");

    return NextResponse.json({ facebook, instagram });
  } catch (err) {
    console.error("Social copy generation error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
