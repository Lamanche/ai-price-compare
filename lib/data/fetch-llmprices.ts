import type { LLMPricesEntry, PriceSnapshot } from "@/lib/types";

interface FetchResult {
  current: LLMPricesEntry[];
  history: PriceSnapshot[];
  updatedAt: string | null;
  fetchedAt: string;
  error?: string;
}

const CURRENT_URL = "https://www.llm-prices.com/current-v1.json";
const HISTORICAL_URL = "https://www.llm-prices.com/historical-v1.json";

export async function fetchLLMPrices(): Promise<FetchResult> {
  const fetchedAt = new Date().toISOString();

  try {
    const [currentRes, histRes] = await Promise.allSettled([
      fetch(CURRENT_URL, { next: { revalidate: 3600 } }),
      fetch(HISTORICAL_URL, { next: { revalidate: 3600 } }),
    ]);

    let current: LLMPricesEntry[] = [];
    let updatedAt: string | null = null;
    let error: string | undefined;

    if (currentRes.status === "fulfilled" && currentRes.value.ok) {
      const json = await currentRes.value.json();
      current = Array.isArray(json?.prices) ? json.prices : [];
      updatedAt = json?.updated_at ?? null;
    } else {
      error = currentRes.status === "rejected" ? String(currentRes.reason) : "HTTP error";
    }

    const history: PriceSnapshot[] = [];
    if (histRes.status === "fulfilled" && histRes.value.ok) {
      const raw = await histRes.value.json();
      const entries: Array<{
        id: string;
        vendor?: string;
        input?: number;
        output?: number;
        from_date?: string;
        to_date?: string;
      }> = Array.isArray(raw) ? raw : Array.isArray(raw?.prices) ? raw.prices : [];

      for (const entry of entries) {
        if (!entry.id || entry.input == null || entry.output == null) continue;
        const date = entry.from_date ?? entry.to_date;
        if (!date) continue;
        history.push({
          modelId: `${entry.vendor ?? ""}/${entry.id}`.replace(/^\//, ""),
          date,
          inputPerMillion: entry.input,
          outputPerMillion: entry.output,
        });
      }
    }

    return { current, history, updatedAt, fetchedAt, error };
  } catch (err) {
    return { current: [], history: [], updatedAt: null, fetchedAt, error: String(err) };
  }
}
