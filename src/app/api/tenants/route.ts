import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const HEADERS = {
  "apikey": SUPABASE_SERVICE_KEY,
  "Authorization": `Bearer ${SUPABASE_SERVICE_KEY}`,
  "Content-Type": "application/json",
};

// GET /api/tenants
export async function GET() {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/tenants?order=created_at.desc`,
    { headers: HEADERS }
  );
  if (!res.ok) {
    console.error("tenants GET error:", await res.text());
    return NextResponse.json({ tenants: [] });
  }
  const tenants = await res.json();
  return NextResponse.json({ tenants });
}

// POST /api/tenants — create
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const tenant = {
      id: `tenant_${Date.now()}`,
      name: body.name?.trim() || "",
      contact_name: body.contactName?.trim() || "",
      email: body.email?.trim() || "",
      phone: body.phone?.trim() || "",
      building: body.building?.trim() || "",
      unit: body.unit?.trim() || "",
      rep: body.rep?.trim() || "",
      monthly_rent: Number(body.monthlyRent) || 0,
      lease_start: body.leaseStart || null,
      lease_end: body.leaseEnd || null,
      renewal_date: body.renewalDate || null,
      lease_alert_days: body.leaseAlertDays ?? null,
      escalation_pct: Number(body.escalationPct) || 0,
      escalation_date: body.escalationDate || null,
      status: body.status || "active",
      notes: body.notes?.trim() || "",
      source_lead_id: body.sourceLeadId || "",
      created_at: new Date().toISOString(),
    };

    const res = await fetch(`${SUPABASE_URL}/rest/v1/tenants`, {
      method: "POST",
      headers: { ...HEADERS, "Prefer": "return=representation" },
      body: JSON.stringify(tenant),
    });

    if (!res.ok) {
      console.error("tenants POST error:", await res.text());
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true, tenant });
  } catch (err) {
    console.error("tenants POST catch:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

// PATCH /api/tenants?id=xxx — update fields
export async function PATCH(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();

  const patch: Record<string, unknown> = {};
  const map: Record<string, string> = {
    name: "name", contactName: "contact_name", email: "email", phone: "phone",
    building: "building", unit: "unit", rep: "rep", monthlyRent: "monthly_rent",
    leaseStart: "lease_start", leaseEnd: "lease_end", renewalDate: "renewal_date",
    leaseAlertDays: "lease_alert_days",
    escalationPct: "escalation_pct", escalationDate: "escalation_date",
    status: "status", notes: "notes",
  };
  Object.entries(map).forEach(([js, db]) => {
    if (body[js] !== undefined) patch[db] = body[js];
  });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/tenants?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { ...HEADERS, "Prefer": "return=representation" },
    body: JSON.stringify(patch),
  });

  if (!res.ok) {
    console.error("tenants PATCH error:", await res.text());
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}

// DELETE /api/tenants?id=xxx
export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const res = await fetch(`${SUPABASE_URL}/rest/v1/tenants?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: HEADERS,
  });

  if (!res.ok) {
    console.error("tenants DELETE error:", await res.text());
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
