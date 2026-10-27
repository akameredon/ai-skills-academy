import type { MetadataRoute } from "next";

const siteUrl = "https://ai-skills-academy-eosin.vercel.app";
const courseSlugs = ["prompting", "video", "graphics", "websites", "digital-products"];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-10-27");
  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...courseSlugs.map((slug) => ({
      url: `${siteUrl}/courses/${slug}`,
      lastModified,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
  ];
}
