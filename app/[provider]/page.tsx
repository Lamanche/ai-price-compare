import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllModels } from "@/lib/data/index";
import { PROVIDERS, getProviderConfig } from "@/config/providers";
import { SITE_CONFIG } from "@/config/site";
import { buildMetadata, buildBreadcrumbJsonLd } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ModelTableClient from "@/components/table/ModelTableClient";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600;

export async function generateStaticParams() {
  return Object.keys(PROVIDERS).map((p) => ({ provider: p }));
}

interface PageProps {
  params: Promise<{ provider: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { provider } = await params;
  const cfg = getProviderConfig(provider);
  return buildMetadata({
    title: `${cfg.name} API Pricing ${new Date().getFullYear()}`,
    description: cfg.description,
  });
}

export default async function ProviderPage({ params }: PageProps) {
  const { provider } = await params;
  const cfg = getProviderConfig(provider);

  const data = await getAllModels();
  const models = data.models.filter((m) => m.providerSlug === provider || m.provider === provider);

  if (!models.length) notFound();

  const breadcrumb = buildBreadcrumbJsonLd([
    { name: "AI Price Compare", url: SITE_CONFIG.url },
    { name: `${cfg.name} Pricing`, url: `${SITE_CONFIG.url}/${provider}` },
  ]);

  return (
    <>
      <JsonLd schema={breadcrumb} />
      <Header
        fetchedAt={data.fetchedAt}
        sourceTimestamps={data.sourceTimestamps}
        errorCount={data.errors.length}
      />
      <main id="main-content" className="mx-auto max-w-7xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-1">
          <div className="mb-2 flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: cfg.color }}
              aria-hidden="true"
            />
            <span className="text-xs font-medium" style={{ color: cfg.color }}>
              {cfg.name}
            </span>
          </div>
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            {cfg.name} API Pricing {new Date().getFullYear()}
          </h1>
          <p className="max-w-2xl text-sm" style={{ color: "var(--color-text-muted)" }}>
            {cfg.description}
          </p>
          {cfg.officialPricingUrl && (
            <a
              href={cfg.officialPricingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 self-start text-xs underline underline-offset-2 transition-colors hover:text-white"
              style={{ color: "var(--color-text-dim)" }}
            >
              Official {cfg.name} pricing page ↗
            </a>
          )}
        </div>
        <ModelTableClient models={models} />
      </main>
      <Footer />
    </>
  );
}
