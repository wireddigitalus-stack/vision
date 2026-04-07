import { MetadataRoute } from "next";
import { GEO_PAGES, PROPERTIES } from "@/lib/data";
import { BLOG_POSTS } from "@/lib/blog-data";

const BASE_URL = "https://teamvisionllc.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/commercial-real-estate`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/markets`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/cowork`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/executive-advisement`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Geo landing pages — highest local SEO priority
  const geoRoutes: MetadataRoute.Sitemap = GEO_PAGES.map((geo) => ({
    url: `${BASE_URL}/markets/${geo.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: geo.isPrimary ? 0.95 : 0.85,
  }));

  // Property detail pages
  const propertyRoutes: MetadataRoute.Sitemap = PROPERTIES.map((p) => ({
    url: `${BASE_URL}/properties/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.75,
  }));

  // Blog posts — fresh content signal
  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...geoRoutes, ...propertyRoutes, ...blogRoutes];
}
