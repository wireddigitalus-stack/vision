import { Star, Quote } from "lucide-react";
import { TESTIMONIALS } from "@/lib/data";

export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      aria-label="Client Reviews and Testimonials"
      className="py-20 lg:py-28 px-4 sm:px-6 lg:px-8 bg-[#0D1117]/50 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="max-w-xl mb-12">
          <div className="section-line mb-4" />
          <h2 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            What Our{" "}
            <span className="gradient-text-green">Clients Say</span>
          </h2>
          <p className="text-gray-400 mt-3">
            Businesses across the Tri-Cities trust Vision LLC to put them in the right space
            and set them up for long-term success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, idx) => (
            <blockquote
              key={idx}
              className="glass rounded-2xl p-7 border border-[rgba(74,222,128,0.1)] hover:border-[rgba(74,222,128,0.25)] transition-colors relative"
            >
              {/* Large quote mark */}
              <Quote
                size={36}
                className="absolute top-5 right-5 text-[rgba(74,222,128,0.1)]"
              />

              {/* Stars */}
              <div className="flex gap-1 mb-5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-[#FACC15] fill-[#FACC15]" />
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed mb-6 italic">
                &ldquo;{t.quote}&rdquo;
              </p>

              <footer className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#4ADE80]/20 to-[#22C55E]/20 border border-[rgba(74,222,128,0.3)] flex items-center justify-center">
                  <span className="text-[#4ADE80] font-bold text-sm">
                    {t.author.charAt(0)}
                  </span>
                </div>
                <div>
                  <cite className="not-italic text-sm font-semibold text-white">{t.author}</cite>
                  <p className="text-xs text-gray-500">{t.location}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>

        {/* Google Review prompt */}
        <div className="mt-10 glass rounded-xl p-6 border border-[rgba(74,222,128,0.1)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {[1,2,3,4,5].map(i => (
                <Star key={i} size={18} className="text-[#FACC15] fill-[#FACC15]" />
              ))}
            </div>
            <p className="text-sm text-gray-400">
              <span className="text-white font-bold">5.0 stars</span> · Trusted by Tri-Cities businesses since 2002
            </p>
          </div>
          <a
            href="https://g.page/r/review"
            target="_blank"
            rel="noopener noreferrer"
            id="google-review-cta"
            className="btn-secondary text-sm px-5 py-2.5 flex-shrink-0"
          >
            Leave a Google Review
          </a>
        </div>
      </div>
    </section>
  );
}
