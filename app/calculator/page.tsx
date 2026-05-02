import type { Metadata } from "next";
import { getAllModels } from "@/lib/data/index";
import { SITE_CONFIG } from "@/config/site";
import { buildMetadata } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CostCalculator from "@/components/calculator/CostCalculator";

export const revalidate = 3600;

export const metadata: Metadata = buildMetadata({
  title: "API Cost Calculator — With Caching & Batch Pricing",
  description:
    "Calculate your real AI API costs including prompt caching discounts and batch API savings. Compare 300+ models side by side.",
});

export default async function CalculatorPage() {
  const data = await getAllModels();

  return (
    <>
      <Header
        fetchedAt={data.fetchedAt}
        sourceTimestamps={data.sourceTimestamps}
        errorCount={data.errors.length}
      />
      <main id="main-content" className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6 flex flex-col gap-1">
          <h1
            className="text-2xl font-bold tracking-tight"
            style={{ color: "var(--color-text)" }}
          >
            API Cost Calculator
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Estimate your real monthly API costs, including prompt caching and batch discounts.
          </p>
        </div>
        <CostCalculator models={data.models.filter((m) => !m.isFree)} />
      </main>
      <Footer />
    </>
  );
}
