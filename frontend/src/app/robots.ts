import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/health"],
    },
    sitemap: "https://d71oywvumn06c.cloudfront.net/sitemap.xml",
  };
}
