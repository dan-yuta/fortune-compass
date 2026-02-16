import type { MetadataRoute } from "next";

const BASE_URL = "https://d71oywvumn06c.cloudfront.net";

const fortuneTypes = [
  "zodiac",
  "numerology",
  "blood-type",
  "tarot",
  "eto",
  "kyusei",
  "animal",
  "birth-flower",
  "birthstone",
  "shichuu",
  "weekday",
  "fengshui",
  "omikuji",
  "rune",
  "dream",
  "palm",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/fortune`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...fortuneTypes.map((type) => ({
      url: `${BASE_URL}/fortune/${type}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/fortune/dashboard`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/profile`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/history`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.5,
    },
  ];
}
