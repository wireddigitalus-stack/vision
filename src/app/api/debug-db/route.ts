import { NextResponse } from "next/server";

// Temporary debug endpoint — tests Supabase connectivity and returns diagnostics.
// DELETE THIS FILE after fixing the insert issue.
export async function GET() {
  const SUPABASE_URL = process.env.SUPABASE_URL || "";
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  const diag: Record<string, unknown> = {
    url_set: !!SUPABASE_URL,
    url_value: SUPABASE_URL.slice(0, 30) + "...",
    key_set: !!SUPABASE_KEY,
    key_prefix: SUPABASE_KEY.slice(0, 20) + "...",
    key_length: SUPABASE_KEY.length,
  };

  // Test 1: read leads
  try {
    const readRes = await fetch(`${SUPABASE_URL}/rest/v1/leads?select=id,name&order=timestamp.desc&limit=5`, {
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    });
    diag.read_status = readRes.status;
    diag.read_body = await readRes.json();
  } catch (e) {
    diag.read_error = String(e);
  }

  // Test 2: insert a test lead
  try {
    const testId = `debug_${Date.now()}`;
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/leads`, {
      method: "POST",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        id: testId,
        timestamp: new Date().toISOString(),
        name: "DEBUG TEST",
        score: 50,
        score_label: "Warm Lead",
        space_type: "Office",
        budget: 1000,
        timeline: "Testing",
        team_size: "1",
        reasoning: "Debug test insert",
        matched_properties: [],
      }),
    });
    diag.insert_status = insertRes.status;
    diag.insert_body = await insertRes.text();

    // Clean up
    await fetch(`${SUPABASE_URL}/rest/v1/leads?id=eq.${testId}`, {
      method: "DELETE",
      headers: {
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
      },
    });
    diag.cleanup = "done";
  } catch (e) {
    diag.insert_error = String(e);
  }

  return NextResponse.json(diag, { status: 200 });
}
