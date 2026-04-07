import { STATS } from "@/lib/data";

export default function StatsBar() {
  return (
    <section
      aria-label="Vision LLC at a glance"
      className="relative border-y border-[rgba(74,222,128,0.1)] bg-[#0D1117]/80 backdrop-blur-sm overflow-hidden"
    >
      {/* Green shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ADE80]/50 to-transparent" />

      {/* Ticker on mobile, grid on desktop */}
      <div className="hidden md:grid md:grid-cols-4 divide-x divide-[rgba(74,222,128,0.1)]">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center py-8 px-6 text-center"
          >
            <span className="text-3xl lg:text-4xl font-black gradient-text-green glow-green-text mb-1">
              {stat.value}
            </span>
            <span className="text-xs text-gray-500 font-medium leading-snug max-w-[150px]">
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Mobile ticker */}
      <div className="md:hidden overflow-hidden py-5">
        <div className="ticker-track">
          {[...STATS, ...STATS].map((stat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-8 flex-shrink-0"
            >
              <span className="text-xl font-black text-[#4ADE80]">{stat.value}</span>
              <span className="text-xs text-gray-500 max-w-[120px] leading-snug">{stat.label}</span>
              <div className="w-px h-6 bg-[rgba(74,222,128,0.2)] ml-8" />
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4ADE80]/30 to-transparent" />
    </section>
  );
}
