import type { Metadata } from "next";
import { SITE_CONFIG } from "@/config/site";

export function buildMetadata(override: Partial<Metadata> = {}): Metadata {
  const { title: overrideTitle, description: overrideDescription, keywords: overrideKeywords, openGraph: overrideOG, ...rest } = override;

  const title = overrideTitle
    ? `${overrideTitle} | ${SITE_CONFIG.name}`
    : `${SITE_CONFIG.tagline} | ${SITE_CONFIG.name}`;
  const description = (overrideDescription as string) ?? SITE_CONFIG.description;
  const extraKeywords = Array.isArray(overrideKeywords) ? (overrideKeywords as string[]) : [];

  return {
    ...rest,
    title,
    description,
    metadataBase: new URL(SITE_CONFIG.url),
    openGraph: {
      title: title as string,
      description,
      url: SITE_CONFIG.url,
      siteName: SITE_CONFIG.name,
      type: "website",
      ...(typeof overrideOG === "object" ? overrideOG : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: title as string,
      description,
    },
    keywords: [
      "AI API pricing",
      "LLM token cost",
      "ChatGPT pricing",
      "Claude pricing",
      "Gemini pricing",
      "AI subscription comparison",
      "prompt caching pricing",
      "cheapest AI model",
      ...extraKeywords,
    ],
  };
}

export function buildDatasetJsonLd(fetchedAt: string, totalModels: number) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "AI Language Model API Pricing",
    description: `Real-time pricing comparison for ${totalModels}+ AI models from OpenAI, Anthropic, Google, DeepSeek, and more.`,
    url: SITE_CONFIG.url,
    dateModified: fetchedAt,
    creator: { "@type": "Organization", name: SITE_CONFIG.name },
    distribution: [
      {
        "@type": "DataDownload",
        encodingFormat: "application/json",
        contentUrl: `${SITE_CONFIG.url}/api/models`,
      },
    ],
    keywords: ["AI pricing", "LLM API", "token cost", "machine learning"],
  };
}

export function buildBreadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
