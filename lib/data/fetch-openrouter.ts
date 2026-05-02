import type { OpenRouterModel } from "@/lib/types";

interface FetchResult {
  models: OpenRouterModel[];
  fetchedAt: string;
  error?: string;
}

export async function fetchOpenRouter(): Promise<FetchResult> {
  const fetchedAt = new Date().toISOString();
  const key = process.env.OPENROUTER_API_KEY;

  if (!key) {
    return { models: [], fetchedAt, error: "OPENROUTER_API_KEY not set" };
  }

  try {
    const res = await fetch("https://openrouter.ai/api/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      return { models: [], fetchedAt, error: `HTTP ${res.status}` };
    }

    const json = await res.json();
    const models: OpenRouterModel[] = Array.isArray(json?.data) ? json.data : [];
    return { models, fetchedAt };
  } catch (err) {
    return { models: [], fetchedAt, error: String(err) };
  }
}
