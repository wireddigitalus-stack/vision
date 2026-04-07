import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clock, Tag, BookOpen } from "lucide-react";
import { BLOG_POSTS } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "Commercial Real Estate Insights | Vision LLC Blog",
  description:
    "Expert insights on commercial real estate in Bristol TN, the Tri-Cities market, coworking, historic adaptive reuse, and executive business consulting from Vision LLC.",
  alternates: {
    canonical: "https://teamvisionllc.com/blog",
  },
  openGraph: {
    title: "Commercial Real Estate Insights | Vision LLC Blog",
    description:
      "Expert insights on commercial real estate in Bristol TN, the Tri-Cities market, coworking, historic adaptive reuse, and executive business consulting.",
    url: "https://teamvisionllc.com/blog",
  },
};

const categoryColors: Record<string, string> = {
  "Market Reports": "bg-[rgba(74,222,128,0.1)] text-[#4ADE80] border-[rgba(74,222,128,0.25)]",
  "Business Insights": "bg-[rgba(96,165,250,0.1)] text-[#60A5FA] border-[rgba(96,165,250,0.25)]",
  "Development": "bg-[rgba(250,204,21,0.1)] text-[#FACC15] border-[rgba(250,204,21,0.25)]",
  "Executive Advisement": "bg-[rgba(167,139,250,0.1)] text-[#A78BFA] border-[rgba(167,139,250,0.25)]",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function BlogPage() {
  const [featured, ...rest] = BLOG_POSTS;

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(74,222,128,0.07)_0%,transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[rgba(74,222,128,0.08)] border border-[rgba(74,222,128,0.2)] text-[#4ADE80] text-xs font-bold mb-6 tracking-wider uppercase">
            <BookOpen size={12} />
            Vision LLC Insights
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-tight mb-4">
            Commercial Real Estate{" "}
            <span className="gradient-text-green">Intelligence</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Expert market analysis, business insights, and development news from
            the Tri-Cities region — written by the team that owns and operates it.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Link
            href={`/blog/${featured.slug}`}
            id={`blog-featured-${featured.slug}`}
            className="group block glass rounded-3xl border border-[rgba(74,222,128,0.1)] hover:border-[rgba(74,222,128,0.3)] overflow-hidden transition-all duration-300 property-card"
          >
            <div className="grid lg:grid-cols-5 gap-0">
              {/* Color accent panel */}
              <div className="lg:col-span-2 min-h-[220px] bg-gradient-to-br from-[rgba(74,222,128,0.12)] via-[rgba(74,222,128,0.04)] to-transparent flex items-center justify-center p-10">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-[rgba(74,222,128,0.15)] border border-[rgba(74,222,128,0.25)] flex items-center justify-center mx-auto mb-4">
                    <BookOpen size={28} className="text-[#4ADE80]" />
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold border ${categoryColors[featured.category] || categoryColors["Market Reports"]}`}>
                    {featured.category}
                  </span>
                </div>
              </div>
              {/* Content */}
              <div className="lg:col-span-3 p-8 lg:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5">
                    <Clock size={11} />
                    {featured.readTime} min read
                  </span>
                  <span>{formatDate(featured.publishedAt)}</span>
                  <span className="text-[#4ADE80] font-semibold uppercase tracking-widest text-[10px]">
                    Featured
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-3 group-hover:text-[#4ADE80] transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-400 text-base leading-relaxed mb-6">
                  {featured.excerpt}
                </p>
                <div className="flex flex-wrap gap-2 mb-6">
                  {featured.tags.slice(0, 4).map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] text-gray-500">
                      <Tag size={9} />
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="inline-flex items-center gap-2 text-sm font-bold text-[#4ADE80] group-hover:gap-4 transition-all">
                  Read Article <ArrowRight size={15} />
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Article Grid */}
      <section className="pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-sm font-black text-white uppercase tracking-widest mb-8">
            All Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {rest.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                id={`blog-card-${post.slug}`}
                className="group glass rounded-2xl border border-[rgba(74,222,128,0.08)] hover:border-[rgba(74,222,128,0.3)] p-6 flex flex-col property-card transition-all duration-300"
              >
                {/* Category badge */}
                <span className={`inline-flex items-center self-start px-2.5 py-1 rounded-lg text-[11px] font-bold border mb-4 ${categoryColors[post.category] || categoryColors["Market Reports"]}`}>
                  {post.category}
                </span>
                <h3 className="text-base font-bold text-white mb-3 group-hover:text-[#4ADE80] transition-colors leading-snug flex-1">
                  {post.title}
                </h3>
                <p className="text-xs text-gray-500 leading-relaxed mb-5 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-auto pt-4 border-t border-[rgba(255,255,255,0.05)]">
                  <span className="flex items-center gap-1.5">
                    <Clock size={10} />
                    {post.readTime} min
                  </span>
                  <span className="flex items-center gap-1 text-[#4ADE80] font-semibold group-hover:gap-2 transition-all">
                    Read <ArrowRight size={11} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-[rgba(74,222,128,0.08)]">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
            Ready to explore commercial real estate in the{" "}
            <span className="gradient-text-green">Tri-Cities?</span>
          </h2>
          <p className="text-gray-400 mb-8">
            Our team lives and works in this market. Let's find your space.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/contact" id="blog-cta-contact" className="btn-primary py-4 px-8">
              Schedule a Consultation <ArrowRight size={17} />
            </Link>
            <Link href="/markets" id="blog-cta-markets" className="btn-secondary py-4 px-8">
              Explore Our Markets
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
