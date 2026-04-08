import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY =
  process.env.GEMINI_API_KEY || "AIzaSyA9UMB9Z7PeGWURP6wDUacctKpSzoOa9cQ";

// Lean lead type — only the fields needed for analysis (avoids oversized payloads)
type LeanLead = {
  name: string;
  spaceType: string;
  budget: number;
  score: number;
  scoreLabel: string;
  timeline: string;
  teamSize: string;
  timestamp: string;
  phone?: string;
};

function timeAgo(ts: string) {
  const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function buildLeadsContext(leads: LeanLead[]) {
  return leads
    .slice(0, 15) // cap at 15 to keep prompt lean
    .map(
      (l, i) =>
        `${i + 1}. ${l.name} | ${l.spaceType} | $${l.budget}/mo | Score: ${l.score} (${l.scoreLabel}) | Timeline: ${l.timeline} | Team: ${l.teamSize} | ${timeAgo(l.timestamp)}${l.phone ? " | ☎" : ""}`
    )
    .join("\n");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { question, leads } = body;

    if (!question) {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const leadsContext = buildLeadsContext(leads || []);
    const today = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric",
    });

    const prompt = `You are Ask VISION — AI lead advisor for Vision LLC's CRM in Bristol, TN.
Today: ${today}
Total leads in pipeline: ${(leads || []).length}

LEAD PIPELINE:
${leadsContext || "No leads in system yet."}

SCORING KEY: Hot Lead = 70+, Warm Lead = 40-69, Nurture = <40

CEO QUESTION: "${question}"

Instructions: Be direct and actionable. Name specific people. Reference budgets and scores. Under 120 words. No filler.`;

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 300 },
    });

    const response = result.response.text().trim();
    return NextResponse.json({ response });

  } catch (error: unknown) {
    console.error("Ask VISION error:", error);
    // Return real error message so we can debug in the UI
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      { error: `Analysis failed: ${message}` },
      { status: 500 }
    );
  }
}
