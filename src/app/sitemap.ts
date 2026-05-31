// Generates sitemap.xml at build time and refreshes hourly. Includes the
// landing page, /problems, /leaderboard, plus a per-problem entry for every
// seeded problem. Drafts user-only pages out of the sitemap so search
// engines don't try to crawl /profile.

import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://algopath.vercel.app";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const problems = await prisma.problem
    .findMany({ select: { slug: true, createdAt: true }, orderBy: { number: "asc" } })
    .catch(() => [] as { slug: string; createdAt: Date }[]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/problems`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/leaderboard`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.7 },
  ];

  const problemEntries: MetadataRoute.Sitemap = problems.map((p) => ({
    url: `${SITE_URL}/problems/${p.slug}`,
    lastModified: p.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticEntries, ...problemEntries];
}
