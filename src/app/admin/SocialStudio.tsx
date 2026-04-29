"use client";
import { useState } from "react";
import { Loader2, Sparkles, Copy, CheckCircle2, Download, Clock, Instagram, RefreshCw, Hash, Mail, Globe, Calendar } from "lucide-react";
import { PROPERTIES } from "@/lib/data";

function CopyBtn({ text, label = "Copy" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border border-[rgba(255,255,255,0.08)] text-gray-400 hover:text-white transition-colors"
    >
      {copied ? <><CheckCircle2 size={10} className="text-[#4ADE80]" /> Copied!</> : <><Copy size={10} /> {label}</>}
    </button>
  );
}

function PlatformCard({ color, icon, label, text, charLimit }: { color: string; icon: React.ReactNode; label: string; text: string; charLimit: number }) {
  const pct = Math.min(100, Math.round((text.length / charLimit) * 100));
  const barColor = pct > 90 ? "#EF4444" : pct > 70 ? "#FACC15" : "#4ADE80";
  return (
    <div className={`glass rounded-2xl border p-4 space-y-3 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">{icon}<p className="text-xs font-black text-white uppercase tracking-widest">{label}</p></div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-600">{text.length}/{charLimit}</span>
          <CopyBtn text={text} />
        </div>
      </div>
      <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{text}</p>
      <div className="h-0.5 rounded-full bg-[rgba(255,255,255,0.06)]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: barColor }} />
      </div>
    </div>
  );
}

export default function SocialStudio() {
  const [propId, setPropId] = useState(PROPERTIES[0]?.id ?? "");
  const [tone, setTone] = useState<"professional"|"friendly"|"exciting"|"luxury">("professional");
  const [goal, setGoal] = useState<"awareness"|"leads"|"tour"|"promo">("leads");
  const [hook, setHook] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeIGAlt, setActiveIGAlt] = useState<0|1|2>(0);
  const [hashFilter, setHashFilter] = useState<"all"|"location"|"industry"|"property">("all");
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<Array<{label:string;ts:string;d:Record<string,string>}>>([]);

  const [fb, setFb] = useState(""); const [ig, setIg] = useState("");
  const [ig1, setIg1] = useState(""); const [ig2, setIg2] = useState("");
  const [li, setLi] = useState(""); const [story, setStory] = useState("");
  const [tiktok, setTiktok] = useState(""); const [email, setEmail] = useState("");
  const [gpost, setGpost] = useState("");
  const [hashAll, setHashAll] = useState(""); const [hashLoc, setHashLoc] = useState("");
  const [hashInd, setHashInd] = useState(""); const [hashProp, setHashProp] = useState("");
  const [schedFB, setSchedFB] = useState(""); const [schedIG, setSchedIG] = useState("");
  const [schedLI, setSchedLI] = useState("");

  const hasOutput = !!(fb || ig || li);
  const igVariants = [ig, ig1, ig2].filter(Boolean);
  const activeIG = igVariants[activeIGAlt] ?? ig;

  const filteredTags = (() => {
    const src = hashFilter === "location" ? hashLoc : hashFilter === "industry" ? hashInd : hashFilter === "property" ? hashProp : hashAll;
    return src.split(/\s+/).filter(h => h.startsWith("#")).filter((h,i,a) => a.indexOf(h) === i);
  })();

  async function generate() {
    const property = PROPERTIES.find(p => p.id === propId);
    if (!property) return;
    setLoading(true); setError("");
    setFb(""); setIg(""); setIg1(""); setIg2(""); setLi(""); setStory(""); setTiktok("");
    setEmail(""); setGpost(""); setHashAll(""); setHashLoc(""); setHashInd(""); setHashProp("");
    setSchedFB(""); setSchedIG(""); setSchedLI(""); setActiveIGAlt(0);
    try {
      const res = await fetch("/api/generate-social-copy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property, tone, customContext: hook, goal }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error);
      setFb(d.facebook||""); setIg(d.instagram||""); setIg1(d.instagramAlt1||""); setIg2(d.instagramAlt2||"");
      setLi(d.linkedin||""); setStory(d.storyCaption||""); setTiktok(d.tiktok||"");
      setEmail(d.emailSubject||""); setGpost(d.googlePost||"");
      setHashAll(d.hashtags||""); setHashLoc(d.hashtagsLocation||"");
      setHashInd(d.hashtagsIndustry||""); setHashProp(d.hashtagsProperty||"");
      setSchedFB(d.scheduleFacebook||""); setSchedIG(d.scheduleInstagram||""); setSchedLI(d.scheduleLinkedIn||"");
      setHistory(prev => [{label:property.name, ts:new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}), d}, ...prev].slice(0,5));
    } catch(e:unknown) { setError(e instanceof Error ? e.message : "Failed"); }
    finally { setLoading(false); }
  }

  function restore(entry: {label:string;ts:string;d:Record<string,string>}) {
    const d = entry.d;
    setFb(d.facebook||""); setIg(d.instagram||""); setIg1(d.instagramAlt1||""); setIg2(d.instagramAlt2||"");
    setLi(d.linkedin||""); setStory(d.storyCaption||""); setTiktok(d.tiktok||"");
    setEmail(d.emailSubject||""); setGpost(d.googlePost||"");
    setHashAll(d.hashtags||""); setHashLoc(d.hashtagsLocation||"");
    setHashInd(d.hashtagsIndustry||""); setHashProp(d.hashtagsProperty||"");
    setSchedFB(d.scheduleFacebook||""); setSchedIG(d.scheduleInstagram||""); setSchedLI(d.scheduleLinkedIn||"");
    setActiveIGAlt(0); setShowHistory(false);
  }

  function exportPack() {
    const prop = PROPERTIES.find(p => p.id === propId);
    const txt = [
      `VISION LLC — SOCIAL CONTENT PACK`,
      `Property: ${prop?.name} | ${new Date().toLocaleString()}`,
      "=".repeat(60),
      `\nFACEBOOK:\n${fb}`,
      `\nINSTAGRAM VARIANTS:\n${igVariants.map((v,i)=>`${i+1}: ${v}`).join("\n")}`,
      `\nLINKEDIN:\n${li}`,
      `\nSTORY CAPTION:\n${story}`,
      `\nTIKTOK:\n${tiktok}`,
      `\nEMAIL SUBJECT:\n${email}`,
      `\nGOOGLE BUSINESS POST:\n${gpost}`,
      `\nHASHTAGS:\n${hashAll}`,
      `  Location: ${hashLoc}\n  Industry: ${hashInd}\n  Property: ${hashProp}`,
      `\nPOSTING SCHEDULE:\nFacebook: ${schedFB}\nInstagram: ${schedIG}\nLinkedIn: ${schedLI}`,
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt],{type:"text/plain"}));
    a.download = `vision-social-${Date.now()}.txt`; a.click();
  }

  function copyAll() {
    const pack = [
      fb ? `📘 FACEBOOK:\n${fb}` : "",
      igVariants.length ? `📸 INSTAGRAM:\n${igVariants.join("\n---\n")}` : "",
      li ? `💼 LINKEDIN:\n${li}` : "",
      story ? `▶ STORY:\n${story}` : "",
      tiktok ? `🎵 TIKTOK:\n${tiktok}` : "",
      email ? `📧 EMAIL SUBJECT:\n${email}` : "",
      gpost ? `🌐 GOOGLE POST:\n${gpost}` : "",
      hashAll ? `#️⃣ HASHTAGS:\n${hashAll}` : "",
    ].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(pack).catch(()=>{});
  }

  const TONES = [
    { key:"professional", label:"💼 Pro" },
    { key:"friendly",     label:"😊 Warm" },
    { key:"exciting",     label:"🔥 Hot" },
    { key:"luxury",       label:"✨ Luxury" },
  ] as const;

  const GOALS = [
    { key:"awareness", label:"📢 Awareness" },
    { key:"leads",     label:"📞 Get Leads" },
    { key:"tour",      label:"🚪 Book Tour" },
    { key:"promo",     label:"🎁 Promo Deal" },
  ] as const;

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E1306C] to-[#833AB4] flex items-center justify-center shadow-[0_0_20px_rgba(225,48,108,0.3)]">
            <Instagram size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-black text-white">Social Content Studio</p>
            <p className="text-[11px] text-gray-500 mt-0.5">FB · IG (3 variants) · LinkedIn · TikTok · Story · Email · Google · Hashtag Bank · Schedule</p>
          </div>
        </div>
        {history.length > 0 && (
          <button onClick={() => setShowHistory(v => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-[rgba(255,255,255,0.08)] text-gray-400 hover:text-white transition-colors">
            <RefreshCw size={11} /> History ({history.length})
          </button>
        )}
      </div>

      {/* History drawer */}
      {showHistory && (
        <div className="glass rounded-2xl border border-[rgba(255,255,255,0.08)] p-4 space-y-2">
          <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Recent Generations</p>
          {history.map((h,i) => (
            <button key={i} onClick={() => restore(h)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.06)] transition-colors text-left">
              <span className="text-xs font-semibold text-white">{h.label}</span>
              <span className="text-[10px] text-gray-600">{h.ts}</span>
            </button>
          ))}
        </div>
      )}

      {/* Controls grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">1. Property</label>
          <select value={propId} onChange={e => setPropId(e.target.value)}
            className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.1)] rounded-xl px-3 py-2.5 text-sm text-white focus:border-[rgba(225,48,108,0.5)] outline-none appearance-none">
            {PROPERTIES.map(p => <option key={p.id} value={p.id} className="bg-[#0a1628]">{p.name}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">2. Goal</label>
          <div className="grid grid-cols-2 gap-1.5">
            {GOALS.map(g => (
              <button key={g.key} onClick={() => setGoal(g.key)}
                className={`py-2 rounded-xl text-[11px] font-black border transition-all ${goal === g.key ? "border-[rgba(74,222,128,0.6)] bg-[rgba(74,222,128,0.1)] text-[#4ADE80]" : "border-[rgba(255,255,255,0.08)] text-gray-500 hover:text-white"}`}>
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">3. Tone</label>
        <div className="flex gap-2">
          {TONES.map(t => (
            <button key={t.key} onClick={() => setTone(t.key)}
              className={`flex-1 py-2.5 rounded-xl text-[11px] font-black border transition-all ${tone === t.key ? "border-[rgba(167,139,250,0.6)] bg-[rgba(167,139,250,0.12)] text-[#A78BFA]" : "border-[rgba(255,255,255,0.08)] text-gray-500 hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
          4. Hook <span className="normal-case font-normal text-gray-600">(optional — promo, angle, event)</span>
        </label>
        <input type="text" value={hook} onChange={e => setHook(e.target.value)}
          placeholder='"First month free" · "Just renovated" · "Limited availability" · "Book a tour this week"'
          className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-xl px-3 py-2.5 text-sm text-white focus:border-[rgba(225,48,108,0.4)] outline-none placeholder:text-gray-700" />
      </div>

      {/* Generate + action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <button onClick={generate} disabled={loading}
          className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#E1306C] to-[#833AB4] text-white font-black text-sm hover:opacity-90 transition-all disabled:opacity-50 shadow-[0_0_24px_rgba(225,48,108,0.3)]">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Generating…</> : <><Sparkles size={15} /> Generate Full Pack</>}
        </button>
        {hasOutput && (
          <>
            <button onClick={copyAll}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-300 text-sm font-bold hover:bg-[rgba(255,255,255,0.05)] transition-all">
              <Copy size={14} /> Copy All
            </button>
            <button onClick={exportPack}
              className="flex items-center gap-2 px-4 py-3.5 rounded-xl border border-[rgba(255,255,255,0.1)] text-gray-300 text-sm font-bold hover:bg-[rgba(255,255,255,0.05)] transition-all">
              <Download size={14} /> Export .txt
            </button>
          </>
        )}
      </div>

      {error && <p className="text-sm text-red-400 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded-xl px-4 py-3">{error}</p>}

      {/* ── Output ── */}
      {hasOutput && (
        <div className="space-y-5">

          {/* FB + LinkedIn row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {fb && <PlatformCard color="border-[rgba(24,119,242,0.25)]" charLimit={63206}
              icon={<div className="w-6 h-6 rounded-lg bg-[#1877F2] flex items-center justify-center"><span className="text-white font-black text-xs">f</span></div>}
              label="Facebook" text={fb} />}
            {li && <PlatformCard color="border-[rgba(10,102,194,0.3)]" charLimit={3000}
              icon={<div className="w-6 h-6 rounded-lg bg-[#0A66C2] flex items-center justify-center"><span className="text-white font-black text-[9px]">in</span></div>}
              label="LinkedIn" text={li} />}
          </div>

          {/* Instagram with variant tabs */}
          {igVariants.length > 0 && (
            <div className="glass rounded-2xl border border-[rgba(225,48,108,0.25)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#E1306C] to-[#833AB4] flex items-center justify-center"><Instagram size={11} className="text-white" /></div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Instagram</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600">{activeIG.length}/2200</span>
                  <CopyBtn text={activeIG} />
                </div>
              </div>
              {/* Variant tabs */}
              <div className="flex gap-1.5">
                {igVariants.map((_, i) => (
                  <button key={i} onClick={() => setActiveIGAlt(i as 0|1|2)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black border transition-all ${activeIGAlt === i ? "border-[rgba(225,48,108,0.6)] bg-[rgba(225,48,108,0.12)] text-[#E1306C]" : "border-[rgba(255,255,255,0.08)] text-gray-500 hover:text-white"}`}>
                    Variant {i+1}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-200 leading-relaxed">{activeIG}</p>
              <div className="h-0.5 rounded-full bg-[rgba(255,255,255,0.06)]">
                <div className="h-full rounded-full bg-gradient-to-r from-[#E1306C] to-[#833AB4] transition-all duration-500" style={{ width: `${Math.min(100, Math.round((activeIG.length/2200)*100))}%` }} />
              </div>
            </div>
          )}

          {/* Story + TikTok */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {story && (
              <div className="glass rounded-2xl border border-[rgba(250,204,21,0.2)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#FACC15] to-[#F97316] flex items-center justify-center"><span className="text-black font-black text-[9px]">▶</span></div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">Story Caption</p>
                  </div>
                  <CopyBtn text={story} />
                </div>
                <p className="text-xl font-black text-[#FACC15] leading-snug">{story}</p>
                <p className="text-[10px] text-gray-600">Paste as text overlay on Story image or video</p>
              </div>
            )}
            {tiktok && (
              <div className="glass rounded-2xl border border-[rgba(255,0,80,0.2)] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-black flex items-center justify-center"><span className="text-white font-black text-[9px]">♪</span></div>
                    <p className="text-xs font-black text-white uppercase tracking-widest">TikTok</p>
                  </div>
                  <CopyBtn text={tiktok} />
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{tiktok}</p>
              </div>
            )}
          </div>

          {/* Email + Google */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {email && (
              <div className="glass rounded-2xl border border-[rgba(96,165,250,0.2)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Mail size={14} className="text-[#60A5FA]" /><p className="text-xs font-black text-white uppercase tracking-widest">Email Subject</p></div>
                  <CopyBtn text={email} />
                </div>
                <p className="text-sm font-bold text-[#60A5FA]">{email}</p>
                <p className="text-[10px] text-gray-600">Paste directly as your email subject line — {email.length}/60 chars</p>
              </div>
            )}
            {gpost && (
              <div className="glass rounded-2xl border border-[rgba(74,222,128,0.2)] p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><Globe size={14} className="text-[#4ADE80]" /><p className="text-xs font-black text-white uppercase tracking-widest">Google Business Post</p></div>
                  <CopyBtn text={gpost} />
                </div>
                <p className="text-sm text-gray-200 leading-relaxed">{gpost}</p>
              </div>
            )}
          </div>

          {/* Hashtag Bank */}
          {hashAll && (
            <div className="glass rounded-2xl border border-[rgba(167,139,250,0.2)] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-[#A78BFA] to-[#7C3AED] flex items-center justify-center"><Hash size={12} className="text-white" /></div>
                  <p className="text-xs font-black text-white uppercase tracking-widest">Hashtag Bank <span className="text-gray-600 font-normal normal-case">({filteredTags.length} tags)</span></p>
                </div>
                <CopyBtn text={filteredTags.join(" ")} label="Copy set" />
              </div>
              {/* Filter tabs */}
              <div className="flex gap-1.5 flex-wrap">
                {(["all","location","industry","property"] as const).map(f => (
                  <button key={f} onClick={() => setHashFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black border transition-all ${hashFilter === f ? "border-[rgba(167,139,250,0.6)] bg-[rgba(167,139,250,0.12)] text-[#A78BFA]" : "border-[rgba(255,255,255,0.06)] text-gray-600 hover:text-gray-300"}`}>
                    {f === "all" ? "All Tags" : f === "location" ? "📍 Location" : f === "industry" ? "🏢 Industry" : "🏠 Property"}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {filteredTags.map(tag => (
                  <button key={tag} title="Click to copy"
                    onClick={() => navigator.clipboard.writeText(tag).catch(()=>{})}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold text-[#A78BFA] bg-[rgba(167,139,250,0.08)] border border-[rgba(167,139,250,0.2)] hover:bg-[rgba(167,139,250,0.18)] transition-colors">
                    {tag}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-gray-600">Click any tag to copy individually · Post hashtags as first IG comment for max reach</p>
            </div>
          )}

          {/* Posting schedule */}
          {(schedFB || schedIG || schedLI) && (
            <div className="glass rounded-2xl border border-[rgba(250,204,21,0.15)] p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#FACC15]" />
                <p className="text-xs font-black text-white uppercase tracking-widest">Optimal Posting Schedule</p>
              </div>
              <div className="space-y-2">
                {[
                  { platform:"Facebook", icon:"📘", sched:schedFB },
                  { platform:"Instagram", icon:"📸", sched:schedIG },
                  { platform:"LinkedIn", icon:"💼", sched:schedLI },
                ].filter(s => s.sched).map(s => (
                  <div key={s.platform} className="flex items-start gap-3 px-3 py-2 rounded-xl bg-[rgba(255,255,255,0.03)]">
                    <span className="text-sm flex-shrink-0 mt-0.5">{s.icon}</span>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{s.platform}</p>
                      <p className="text-xs text-[#FACC15]">{s.sched}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
