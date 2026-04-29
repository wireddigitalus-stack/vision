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

/** GET — fetch all overrides (hero_url + all_urls) */
export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/property_image_overrides`,
    { headers: H }
  );
  const data = await res.json();
  return NextResponse.json({ overrides: Array.isArray(data) ? data : [] });
}

/** POST — upload a single image file for a property, append to its gallery */
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

  // Fetch existing record to merge all_urls
  const existingRes = await fetch(
    `${SUPABASE_URL}/rest/v1/property_image_overrides?property_id=eq.${encodeURIComponent(propertyId)}`,
    { headers: H }
  );
  const existing = await existingRes.json();
  const existingRow = Array.isArray(existing) ? existing[0] : null;

  const existingAllUrls: string[] = existingRow?.all_urls || (existingRow?.image_url ? [existingRow.image_url] : []);
  const newAllUrls = [...existingAllUrls, publicUrl];
  const heroUrl = existingRow?.hero_url || existingRow?.image_url || publicUrl;

  // Upsert with merged all_urls + preserve/set hero_url
  await fetch(`${SUPABASE_URL}/rest/v1/property_image_overrides`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({
      property_id: propertyId,
      image_url:   heroUrl,       // legacy compat field
      hero_url:    heroUrl,
      all_urls:    newAllUrls,
      updated_at:  new Date().toISOString(),
    }),
  });

  return NextResponse.json({ success: true, url: publicUrl });
}

/** PATCH — update hero_url and/or all_urls for a property (no file upload) */
export async function PATCH(req: NextRequest) {
  const { propertyId, heroUrl, allUrls } = await req.json();

  if (!propertyId)
    return NextResponse.json({ error: "propertyId required" }, { status: 400 });

  const body: Record<string, unknown> = {
    property_id: propertyId,
    updated_at: new Date().toISOString(),
  };

  if (heroUrl !== undefined) {
    body.hero_url  = heroUrl;
    body.image_url = heroUrl; // legacy compat
  }
  if (allUrls !== undefined) {
    body.all_urls = allUrls;
  }

  await fetch(`${SUPABASE_URL}/rest/v1/property_image_overrides`, {
    method: "POST",
    headers: { ...H, Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(body),
  });

  return NextResponse.json({ success: true });
}
