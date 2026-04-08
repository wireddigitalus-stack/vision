import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEMINI_API_KEY;

  if (!key) {
    return NextResponse.json({ error: "GEMINI_API_KEY is NOT set in environment" }, { status: 500 });
  }

  // List available models for this API key
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1/models?key=${key}`
  );
  const data = await res.json();

  return NextResponse.json({
    keyPresent: true,
    keyPreview: `${key.slice(0, 8)}...${key.slice(-4)}`,
    httpStatus: res.status,
    models: data,
  });
}
