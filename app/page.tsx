import type { Metadata } from "next";
import subscriptionsRaw from "@/data/subscriptions.json";
import type { SubscriptionsData } from "@/lib/types";
import { getAllModels } from "@/lib/data/index";
import { SITE_CONFIG } from "@/config/site";
import { buildMetadata, buildDatasetJsonLd } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/hero/HeroSection";
import ModelTableClient from "@/components/table/ModelTableClient";
import JsonLd from "@/components/seo/JsonLd";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "AI API Pricing — Live Model Costs",
  description: SITE_CONFIG.description,
});

export default async function HomePage() {
  const data = await getAllModels();
  const subscriptions = subscriptionsRaw as SubscriptionsData;

  return (
    <>
      <JsonLd schema={buildDatasetJsonLd(data.fetchedAt, data.models.length)} />
      <Header
        fetchedAt={data.fetchedAt}
        sourceTimestamps={data.sourceTimestamps}
        errorCount={data.errors.length}
      />
      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto max-w-7xl px-4 pt-10 pb-6">
          <div className="mb-6 flex flex-col gap-1">
            <h1
              className="text-2xl font-bold tracking-tight sm:text-3xl"
              style={{ color: "var(--color-text)" }}
            >
              AI Pricing — Live
            </h1>
            <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
              Subscription plans &amp; API token costs for the biggest AI models.
              Updated every hour automatically.
            </p>
          </div>

          <HeroSection
            models={data.models}
            history={data.history}
            subscriptions={subscriptions}
          />
        </section>

        {/* Divider */}
        <div className="mx-auto max-w-7xl px-4">
          <div
            className="flex items-center gap-3 py-4"
            style={{ borderTop: "1px solid var(--color-border)" }}
          >
            <span className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
              All Models
            </span>
            <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
              {data.models.filter((m) => !m.isFree).length} paid models from{" "}
              {new Set(data.models.map((m) => m.provider)).size} providers
            </span>
          </div>
        </div>

        {/* Comparison table */}
        <section
          className="mx-auto max-w-7xl px-4 pb-12"
          aria-label="Model pricing comparison table"
        >
          <ModelTableClient models={data.models} />
        </section>
      </main>
      <Footer />
    </>
  );
}
