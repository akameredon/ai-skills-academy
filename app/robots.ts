import type { MetadataRoute } from "next";

const siteUrl = "https://ai-skills-academy-eosin.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin/", "/dashboard/", "/member/", "/api/"] },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
