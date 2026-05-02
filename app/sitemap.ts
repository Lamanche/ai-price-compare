import type { MetadataRoute } from "next";
import { getAllModels } from "@/lib/data/index";
import { PROVIDERS } from "@/config/providers";
import { SITE_CONFIG } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await getAllModels();
  const providers = Object.keys(PROVIDERS);

  const providerUrls: MetadataRoute.Sitemap = providers.map((p) => ({
    url: `${SITE_CONFIG.url}/${p}`,
    changeFrequency: "hourly",
    priority: 0.8,
  }));

  return [
    {
      url: SITE_CONFIG.url,
      changeFrequency: "hourly",
      priority: 1.0,
      lastModified: data.fetchedAt,
    },
    {
      url: `${SITE_CONFIG.url}/calculator`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...providerUrls,
  ];
}
