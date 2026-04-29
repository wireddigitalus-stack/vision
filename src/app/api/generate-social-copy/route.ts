import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
  try {
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ error: "Gemini API key not configured." }, { status: 500 });
    }

    const { property, tone, customContext, goal } = await req.json();
    if (!property?.name) {
      return NextResponse.json({ error: "Property is required." }, { status: 400 });
    }

    const toneGuide: Record<string, string> = {
      professional: "formal and polished, ideal for business owners and executives",
      friendly:     "warm and approachable, welcoming to small business owners and entrepreneurs",
      exciting:     "energetic and enthusiastic with urgency — limited opportunity, act now!",
      luxury:       "aspirational and premium — speak to success, prestige, and exclusivity",
    };

    const goalGuide: Record<string, string> = {
      awareness:  "Build brand awareness. Focus on Vision LLC reputation, location prestige, and the Bristol market story.",
      leads:      "Drive direct inquiries. Include phone 423-573-1022 and teamvisionllc.com. Push the reader to contact us today.",
      tour:       "Schedule a property tour. Create urgency and excitement. Make them want to physically see the space.",
      promo:      "Highlight a specific promotion or deal. Make the value proposition crystal clear and time-sensitive.",
    };

    const contextNote = customContext?.trim()
      ? `\nSpecial angle / hook to highlight: ${customContext.trim()}`
      : "";

    const goalNote = goal && goalGuide[goal]
      ? `\nContent Goal: ${goalGuide[goal]}`
      : "";

    const prompt = `You are a top-tier social media strategist for Vision LLC, Downtown Bristol TN/VA's premier commercial real estate firm (20+ years, largest private CRE owner downtown).

PROPERTY: ${property.name}
TYPE: ${property.type}
LOCATION: ${property.city ?? "Bristol, TN/VA"}
SIZE: ${property.sqft} sqft
STATUS: ${property.status}
DESCRIPTION: ${property.description ?? ""}
FEATURES: ${(property.features ?? []).join(", ") || "N/A"}
TONE: ${toneGuide[tone] ?? toneGuide.professional}${contextNote}${goalNote}

Generate ALL sections below. Use EXACTLY these section headers on their own line, nothing else before or after:

FACEBOOK:
[2-3 sentences. Warm, informative. Mention Bristol TN/VA. End with CTA to call 423-573-1022 or teamvisionllc.com. Max 2 emojis.]

INSTAGRAM:
[1-2 punchy sentences. Strong hook. NO hashtags here. Max 150 chars.]

INSTAGRAM_ALT_1:
[Alternative IG caption — different angle, same property. Max 150 chars. No hashtags.]

INSTAGRAM_ALT_2:
[Second alternative IG caption — playful or bold approach. Max 150 chars. No hashtags.]

LINKEDIN:
[Professional B2B. 2-3 sentences on investment/opportunity angle. Mention Vision LLC 20+ years. Include CTA.]

STORY:
[Max 10 words. Ultra-punchy overlay text for Stories. Example: "Prime downtown office — available now 🏢"]

TIKTOK:
[Conversational, energetic script. Max 150 chars. Start with a hook question or bold statement. TikTok-native voice.]

EMAIL_SUBJECT:
[One punchy email subject line. Max 60 chars. No emojis. High open-rate style.]

GOOGLE_POST:
[Google Business profile post. 1-2 sentences. Local focus. Include phone 423-573-1022.]

HASHTAGS_LOCATION:
[Exactly 8 hashtags for Bristol TN/VA location and Tri-Cities area. Space separated.]

HASHTAGS_INDUSTRY:
[Exactly 8 hashtags for commercial real estate industry. Space separated. Must include #CommercialRealEstate #CRE #VisionLLC.]

HASHTAGS_PROPERTY:
[Exactly 8 hashtags specific to this property type, features, and local market. Space separated.]

SCHEDULE_FACEBOOK:
[One sentence: best day + time to post on Facebook for CRE in Eastern US, with brief reason.]

SCHEDULE_INSTAGRAM:
[One sentence: best day + time for Instagram.]

SCHEDULE_LINKEDIN:
[One sentence: best day + time for LinkedIn.]`;

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.8, maxOutputTokens: 2000 },
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

    const LABELS = [
      "FACEBOOK", "INSTAGRAM", "INSTAGRAM_ALT_1", "INSTAGRAM_ALT_2",
      "LINKEDIN", "STORY", "TIKTOK", "EMAIL_SUBJECT", "GOOGLE_POST",
      "HASHTAGS_LOCATION", "HASHTAGS_INDUSTRY", "HASHTAGS_PROPERTY",
      "SCHEDULE_FACEBOOK", "SCHEDULE_INSTAGRAM", "SCHEDULE_LINKEDIN",
    ];

    const extract = (label: string) => {
      const escapedLabel = label.replace(/_/g, "_");
      const pattern = new RegExp(
        `${escapedLabel}:\\s*([\\s\\S]*?)(?=${LABELS.filter(l => l !== label).join("|")}:|$)`,
        "i"
      );
      return text.match(pattern)?.[1]?.trim() ?? "";
    };

    const hashtagsLocation = extract("HASHTAGS_LOCATION");
    const hashtagsIndustry = extract("HASHTAGS_INDUSTRY");
    const hashtagsProperty = extract("HASHTAGS_PROPERTY");

    // Full combined hashtag bank
    const allHashtags = [hashtagsLocation, hashtagsIndustry, hashtagsProperty]
      .join(" ")
      .split(/\s+/)
      .filter(h => h.startsWith("#"))
      .filter((h, i, arr) => arr.indexOf(h) === i) // dedupe
      .join(" ");

    return NextResponse.json({
      facebook:         extract("FACEBOOK"),
      instagram:        extract("INSTAGRAM"),
      instagramAlt1:    extract("INSTAGRAM_ALT_1"),
      instagramAlt2:    extract("INSTAGRAM_ALT_2"),
      linkedin:         extract("LINKEDIN"),
      storyCaption:     extract("STORY"),
      tiktok:           extract("TIKTOK"),
      emailSubject:     extract("EMAIL_SUBJECT"),
      googlePost:       extract("GOOGLE_POST"),
      hashtagsLocation,
      hashtagsIndustry,
      hashtagsProperty,
      hashtags:         allHashtags,
      scheduleFacebook: extract("SCHEDULE_FACEBOOK"),
      scheduleInstagram:extract("SCHEDULE_INSTAGRAM"),
      scheduleLinkedIn: extract("SCHEDULE_LINKEDIN"),
    });
  } catch (err) {
    console.error("Social copy generation error:", err);
    return NextResponse.json({ error: "Generation failed. Please try again." }, { status: 500 });
  }
}
