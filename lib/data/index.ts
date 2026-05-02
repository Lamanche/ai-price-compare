import type { DataFetchResult, UnifiedModel } from "@/lib/types";
import { fetchOpenRouter } from "./fetch-openrouter";
import { fetchLiteLLM } from "./fetch-litellm";
import { fetchLLMPrices } from "./fetch-llmprices";
import {
  normalizeOpenRouterModel,
  enrichWithLiteLLM,
  crossValidateWithLLMPrices,
} from "./normalize";

export async function getAllModels(): Promise<DataFetchResult> {
  const [orResult, llResult, lpResult] = await Promise.allSettled([
    fetchOpenRouter(),
    fetchLiteLLM(),
    fetchLLMPrices(),
  ]);

  const or = orResult.status === "fulfilled" ? orResult.value : { models: [], fetchedAt: new Date().toISOString(), error: String((orResult as PromiseRejectedResult).reason) };
  const ll = llResult.status === "fulfilled" ? llResult.value : { data: {}, fetchedAt: new Date().toISOString(), error: String((llResult as PromiseRejectedResult).reason) };
  const lp = lpResult.status === "fulfilled" ? lpResult.value : { current: [], history: [], updatedAt: null, fetchedAt: new Date().toISOString(), error: String((lpResult as PromiseRejectedResult).reason) };

  const errors: DataFetchResult["errors"] = [];
  if (or.error) errors.push({ source: "openrouter", message: or.error });
  if (ll.error) errors.push({ source: "litellm", message: ll.error });
  if (lp.error) errors.push({ source: "llmprices", message: lp.error });

  // Normalize OpenRouter models (primary source)
  let models: UnifiedModel[] = or.models
    .filter((m) => m.id && m.pricing)
    .map(normalizeOpenRouterModel);

  // Enrich with LiteLLM capability flags
  models = enrichWithLiteLLM(models, ll.data);

  // Cross-validate pricing with llm-prices.com
  models = crossValidateWithLLMPrices(models, lp.current);

  // Sort: non-free first, then by provider, then by name
  models.sort((a, b) => {
    if (a.isFree !== b.isFree) return a.isFree ? 1 : -1;
    if (a.provider !== b.provider) return a.provider.localeCompare(b.provider);
    return a.name.localeCompare(b.name);
  });

  return {
    models,
    history: lp.history,
    fetchedAt: new Date().toISOString(),
    sourceTimestamps: {
      openrouter: or.error ? null : or.fetchedAt,
      litellm: ll.error ? null : ll.fetchedAt,
      llmprices: lp.error ? null : lp.fetchedAt,
    },
    sourceModelCounts: {
      openrouter: or.models.length,
      litellm: Object.keys(ll.data).length,
      llmprices: lp.current.length,
      merged: models.length,
    },
    errors,
  };
}
