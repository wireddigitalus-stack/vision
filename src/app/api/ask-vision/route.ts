import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyA9UMB9Z7PeGWURP6wDUacctKpSzoOa9cQ";

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(ts).toLocaleDateString();
}

export async function POST(req: NextRequest) {
  try {
    const { question, leads } = await req.json();

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

    const leadsContext = (leads || [])
      .map((l: { name: string; spaceType: string; budget: number; score: number; scoreLabel: string; timeline: string; teamSize: string; timestamp: string; phone?: string }, i: number) =>
        `${i + 1}. ${l.name} | ${l.spaceType} | $${l.budget.toLocaleString()}/mo | Score: ${l.score}/100 (${l.scoreLabel}) | Timeline: ${l.timeline} | Team: ${l.teamSize} | Submitted: ${timeAgo(l.timestamp)}${l.phone ? ` | Phone: ${l.phone}` : ""}`
      )
      .join("\n");

    const prompt = `You are Ask VISION — the AI lead intelligence advisor for Vision LLC's private CRM dashboard. Vision LLC is the largest private commercial property owner in Downtown Bristol, TN/VA.

TODAY: ${today}

CURRENT LEAD PIPELINE:
${leadsContext || "No leads in the system yet."}

SCORING REFERENCE:
- Hot Lead = score ≥ 70 (priority action required)
- Warm Lead = score 40–69 (nurture sequence)
- Nurture = score < 40 (long-term follow-up)

CEO QUESTION: "${question}"

INSTRUCTIONS:
- Be direct, concise, and actionable. The CEO is busy — no filler words.
- Reference specific lead names, scores, and dollar amounts when relevant.
- If recommending a call, say who, why, and when.
- Keep your response under 150 words unless the question genuinely requires more detail.
- Do not use bullet points unless listing more than 3 items. Prefer flowing sentences.
- Do not start with "I" or "As an AI". Just answer directly.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
    });

    const result = await model.generateContent(prompt);
    const response = result.response.text().trim();

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Ask VISION analysis error:", error);
    return NextResponse.json(
      { error: "Analysis failed — please try again" },
      { status: 500 }
    );
  }
}
