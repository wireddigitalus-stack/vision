import { NextRequest, NextResponse } from "next/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const H = {
  "Content-Type": "application/json",
  "apikey": KEY,
  "Authorization": `Bearer ${KEY}`,
};

// ── Guard: write operations require x-admin-secret header ────────────────────
function requireAdminSecret(req: NextRequest): NextResponse | null {
  const secret = req.headers.get("x-admin-secret");
  if (!process.env.ADMIN_SECRET || secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}

// GET — read users (open; needed by the client-side auth guard)
export async function GET(req: NextRequest) {
  const role  = req.nextUrl.searchParams.get("role");
  const email = req.nextUrl.searchParams.get("email");

  let url = `${SUPABASE_URL}/rest/v1/allowed_users?order=created_at.asc`;
  if (role)  url += `&role=eq.${encodeURIComponent(role)}`;
  if (email) url += `&email=eq.${encodeURIComponent(email.toLowerCase())}`;

  const res = await fetch(url, { headers: H });
  if (!res.ok) return NextResponse.json({ users: [], allowed: false });
  const users = await res.json();

  // Single-email access check (used by auth guard)
  if (email) {
    const allowed = Array.isArray(users) && users.some(
      (u: { email: string; active: boolean }) =>
        u.email.toLowerCase() === email.toLowerCase() && u.active !== false
    );
    return NextResponse.json({ users, allowed });
  }
  return NextResponse.json({ users: Array.isArray(users) ? users : [] });
}

// POST — add a user (requires ADMIN_SECRET)
export async function POST(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const { email, name, role } = await req.json();
  if (!email || !role) return NextResponse.json({ error: "email and role required" }, { status: 400 });

  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const res = await fetch(`${SUPABASE_URL}/rest/v1/allowed_users`, {
    method: "POST",
    headers: { ...H, "Prefer": "return=representation" },
    body: JSON.stringify({ id, email: email.toLowerCase().trim(), name: name?.trim() || "", role, active: true }),
  });
  if (!res.ok) return NextResponse.json({ error: await res.text() }, { status: res.status });
  return NextResponse.json({ success: true });
}

// PATCH — update a user (requires ADMIN_SECRET)
export async function PATCH(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();
  const res = await fetch(`${SUPABASE_URL}/rest/v1/allowed_users?id=eq.${id}`, {
    method: "PATCH",
    headers: { ...H, "Prefer": "return=representation" },
    body: JSON.stringify(body),
  });
  if (!res.ok) return NextResponse.json({ error: "update failed" }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE — remove a user (requires ADMIN_SECRET)
export async function DELETE(req: NextRequest) {
  const guard = requireAdminSecret(req);
  if (guard) return guard;

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await fetch(`${SUPABASE_URL}/rest/v1/allowed_users?id=eq.${id}`, { method: "DELETE", headers: H });
  return NextResponse.json({ success: true });
}
