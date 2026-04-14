import type { Metadata } from "next";
import AIChatWidget from "@/components/AIChatWidget";

export const metadata: Metadata = {
  title: "Find Commercial Space in Bristol, TN | Vision LLC",
  description: "Looking for office, retail, or coworking space in the Tri-Cities area? Vision LLC has premium commercial spaces in Downtown Bristol. Get your AI match score in 90 seconds.",
  robots: { index: false, follow: false }, // keep social landing pages off search index
};

export default function FacebookLandingPage() {
  return (
    <main className="min-h-screen bg-[#080C0F] flex flex-col">
      {/* Background glow effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#4ADE80] opacity-[0.04] blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#3B82F6] opacity-[0.05] blur-[100px]" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 py-16 text-center">

        {/* Logo mark */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#4ADE80] to-[#22C55E] flex items-center justify-center shadow-[0_0_40px_rgba(74,222,128,0.3)] mb-8">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
        </div>

        {/* Source tag */}
        <div className="flex items-center gap-2 text-[11px] font-bold text-[#60A5FA] bg-[rgba(59,130,246,0.1)] border border-[rgba(59,130,246,0.25)] px-3 py-1.5 rounded-full mb-6">
          <span>📘</span> You came from Facebook
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight mb-4 max-w-lg">
          Find Your Perfect<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#4ADE80] to-[#22C55E]">
            Commercial Space
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-md mb-10 leading-relaxed">
          Office suites, coworking, and retail in Downtown Bristol, TN.
          Get your <span className="text-white font-semibold">AI Match Score</span> in 90 seconds — no phone calls required.
        </p>

        {/* Trust signals */}
        <div className="flex flex-wrap items-center justify-center gap-6 mb-12">
          {[
            { icon: "🏢", label: "Premium Downtown Spaces" },
            { icon: "⚡", label: "AI-Matched to Your Needs" },
            { icon: "🔒", label: "No Obligation" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex items-center gap-2 text-sm text-gray-400">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* The bot opens automatically — this is a fallback CTA */}
        <p className="text-xs text-gray-600 mt-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse inline-block" />
          VISION Space Advisor is opening now…
        </p>

        {/* Property visual grid */}
        <div className="grid grid-cols-3 gap-3 mt-12 max-w-xs w-full opacity-40">
          {["Executive Suites", "CoWork", "Retail"].map((type) => (
            <div
              key={type}
              className="aspect-square rounded-xl bg-gradient-to-br from-[rgba(74,222,128,0.08)] to-[rgba(74,222,128,0.02)] border border-[rgba(74,222,128,0.12)] flex items-center justify-center text-[10px] text-gray-600 font-medium text-center p-2"
            >
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 text-[11px] text-gray-700">
        Vision LLC · Downtown Bristol, TN · All rights reserved
      </footer>

      {/* The chat widget — UTM params are read from ?utm_source=facebook in the URL */}
      <AIChatWidget />
    </main>
  );
}
