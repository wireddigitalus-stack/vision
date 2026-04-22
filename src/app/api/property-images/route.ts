import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const H = {
  apikey: KEY,
  Authorization: `Bearer ${KEY}`,
  "Content-Type": "application/json",
};
const BUCKET = "property-images";

async function ensureBucket() {
  await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: H,
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: true }),
  });
  // Ignore 409 (already exists)
}

export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/property_image_overrides`,
    { headers: H }
  );
  const data = await res.json();
  return NextResponse.json({ overrides: Array.isArray(data) ? data : [] });
}

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const file       = form.get("file") as File | null;
  const propertyId = form.get("propertyId") as string | null;

  if (!file || !propertyId)
    return NextResponse.json({ error: "file and propertyId required" }, { status: 400 });

  await ensureBucket();

  const ext      = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const filename = `${propertyId}-${Date.now()}.${ext}`;
  const buffer   = await file.arrayBuffer();

  const uploadRes = await fetch(
    `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`,
    {
      method: "POST",
      headers: {
        apikey: KEY,
        Authorization: `Bearer ${KEY}`,
        "Content-Type": file.type || "image/jpeg",
        "x-upsert": "true",
      },
      body: buffer,
    }
  );

  if (!uploadRes.ok) {
    const err = await uploadRes.text();
    console.error("Storage upload error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;

  // Upsert override record
  await fetch(`${SUPABASE_URL}/rest/v1/property_image_overrides`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      property_id: propertyId,
      image_url:   publicUrl,
      updated_at:  new Date().toISOString(),
    }),
  });

  return NextResponse.json({ success: true, url: publicUrl });
}
