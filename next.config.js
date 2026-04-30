/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "www.teamvisionllc.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      // Supabase storage — property gallery images
      { protocol: "https", hostname: "jjbswcdsssthqecrcafl.supabase.co" },
    ],
    unoptimized: false,
  },

  // ── Security headers applied to every response ─────────────────────────────
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prevent clickjacking — only our own domain can frame the site
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Stop browsers from MIME-sniffing the content-type
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Referrer info: send origin on same-site, only origin on cross-site HTTPS
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Disable browser features we don't need
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // Enable browser XSS protection (legacy browsers)
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // DNS prefetch for performance without leaking
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      // ── No-cache for API routes — never serve stale auth responses ──────────
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
