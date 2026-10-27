import type { MetadataRoute } from "next";

const siteUrl = "https://ai-skills-academy-eosin.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date("2026-10-27"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
