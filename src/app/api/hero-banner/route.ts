import { NextRequest, NextResponse } from "next/server";
import { PROPERTIES } from "@/lib/data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const H = { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" };

interface SlideConfig {
  type: "property" | "custom";
  propertyId?: string;
  imageUrl?: string;
  label?: string;
  location?: string;
  enabled: boolean;
  order: number;
}
interface HeroConfig { slides: SlideConfig[]; videoUrl: string | null; videoEnabled: boolean; }

const MAIN_IDS = ["city-centre","bristol-cowork","the-executive","centre-point-suites","foundation-event-facility","warehouse"];

async function getRaw(): Promise<HeroConfig | null> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings?key=eq.hero_config&select=value`, { headers: H, cache: "no-store" });
  if (!res.ok) return null;
  const rows = await res.json();
  return rows[0]?.value || null;
}

async function getOverrides(): Promise<Record<string, string>> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/property_image_overrides`, { headers: H, cache: "no-store" });
  if (!res.ok) return {};
  const data = await res.json();
  const map: Record<string, string> = {};
  if (Array.isArray(data)) data.forEach((r: { property_id: string; image_url: string }) => { map[r.property_id] = r.image_url; });
  return map;
}

function resolve(config: HeroConfig, overrides: Record<string, string>) {
  return config.slides
    .filter(s => s.enabled)
    .sort((a, b) => a.order - b.order)
    .map(s => {
      if (s.type === "property" && s.propertyId) {
        const p = PROPERTIES.find(p => p.id === s.propertyId);
        if (!p) return null;
        return { src: overrides[s.propertyId] || p.image, label: s.label || p.name, location: s.location || `${p.city}, ${p.state}` };
      }
      if (s.type === "custom" && s.imageUrl) {
        return { src: s.imageUrl, label: s.label || "Banner", location: s.location || "Bristol, TN" };
      }
      return null;
    })
    .filter(Boolean) as { src: string; label: string; location: string }[];
}

export async function GET() {
  try {
    const [raw, overrides] = await Promise.all([getRaw(), getOverrides()]);
    if (!raw) {
      const defaultConfig: HeroConfig = {
        slides: MAIN_IDS.map((id, i) => {
          const p = PROPERTIES.find(pr => pr.id === id)!;
          return { type: "property", propertyId: id, label: p?.name, location: `${p?.city}, ${p?.state}`, enabled: true, order: i };
        }),
        videoUrl: null, videoEnabled: false,
      };
      return NextResponse.json({ raw: defaultConfig, resolved: resolve(defaultConfig, overrides), isDefault: true });
    }
    return NextResponse.json({ raw, resolved: resolve(raw, overrides), isDefault: false });
  } catch (e) { console.error(e); return NextResponse.json({ raw: null, resolved: null }, { status: 500 }); }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const config: HeroConfig = { slides: body.slides || [], videoUrl: body.videoUrl || null, videoEnabled: !!body.videoEnabled };
    const res = await fetch(`${SUPABASE_URL}/rest/v1/site_settings`, {
      method: "POST",
      headers: { ...H, Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({ key: "hero_config", value: config, updated_at: new Date().toISOString() }),
    });
    if (!res.ok) { const err = await res.text(); return NextResponse.json({ error: err }, { status: 500 }); }
    return NextResponse.json({ success: true });
  } catch (e) { console.error(e); return NextResponse.json({ error: "Save failed" }, { status: 500 }); }
}
