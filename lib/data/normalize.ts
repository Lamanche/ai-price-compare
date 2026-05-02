import type {
  OpenRouterModel,
  LiteLLMData,
  LLMPricesEntry,
  UnifiedModel,
  DataSource,
} from "@/lib/types";

const M = 1_000_000;

function slugify(id: string): string {
  return id.replace(/[^a-zA-Z0-9]+/g, "-").toLowerCase();
}

function extractProvider(openRouterId: string): string {
  // Strip leading ~ (alias models)
  const clean = openRouterId.startsWith("~") ? openRouterId.slice(1) : openRouterId;
  const slash = clean.indexOf("/");
  return slash !== -1 ? clean.slice(0, slash) : clean;
}

export function normalizeOpenRouterModel(raw: OpenRouterModel): UnifiedModel {
  const isFree =
    raw.id.endsWith(":free") ||
    raw.pricing.prompt === "0" ||
    raw.pricing.prompt === "0.0" ||
    raw.pricing.prompt === "0.00";

  const inputPerMillion = parseFloat(raw.pricing.prompt) * M;
  const outputPerMillion = parseFloat(raw.pricing.completion) * M;
  const cacheReadPerMillion =
    raw.pricing.input_cache_read ? parseFloat(raw.pricing.input_cache_read) * M : null;
  const cacheWritePerMillion =
    raw.pricing.input_cache_write ? parseFloat(raw.pricing.input_cache_write) * M : null;

  const params = raw.supported_parameters ?? [];
  const supportsVision = raw.architecture.input_modalities.includes("image");
  const supportsReasoning =
    params.includes("reasoning") || params.includes("include_reasoning");
  const supportsFunctionCalling =
    params.includes("tools") || params.includes("tool_choice");
  const supportsResponseSchema =
    params.includes("response_format") || params.includes("structured_outputs");
  const supportsPromptCaching = cacheReadPerMillion !== null || cacheWritePerMillion !== null;

  const provider = extractProvider(raw.id);

  return {
    id: raw.id,
    slug: slugify(raw.id),
    name: raw.name,
    provider,
    providerSlug: slugify(provider),
    pricing: {
      inputPerMillion,
      outputPerMillion,
      cacheReadPerMillion,
      cacheWritePerMillion,
      webSearchPerCall: raw.pricing.web_search ? parseFloat(raw.pricing.web_search) : null,
      imagePerCall: raw.pricing.image ? parseFloat(raw.pricing.image) : null,
    },
    contextWindow: raw.context_length ?? null,
    maxOutputTokens: raw.top_provider.max_completion_tokens ?? null,
    capabilities: {
      supportsVision,
      supportsReasoning,
      supportsFunctionCalling,
      supportsPromptCaching,
      supportsResponseSchema,
      supportsStreaming: true,
    },
    sources: ["openrouter"],
    priceVerified: false,
    createdAt: raw.created ?? null,
    isDeprecated: false,
    isFree,
    inputModalities: raw.architecture.input_modalities ?? [],
    tokenizer: raw.architecture.tokenizer ?? null,
  };
}

// ── LiteLLM capability enrichment ─────────────────────────────────────────

function normKey(k: string): string {
  return k.toLowerCase().replace(/[-_.:/\s]+/g, "");
}

export function enrichWithLiteLLM(
  models: UnifiedModel[],
  litellm: LiteLLMData
): UnifiedModel[] {
  // Build a lookup of normalized LiteLLM keys
  const lookup = new Map<string, (typeof litellm)[string]>();
  for (const [key, val] of Object.entries(litellm)) {
    lookup.set(normKey(key), val);
  }

  return models.map((model) => {
    // Try to match model id against LiteLLM key
    const modelName = model.id.includes("/") ? model.id.split("/").slice(1).join("/") : model.id;
    const candidates = [normKey(model.id), normKey(modelName)];

    let match: (typeof litellm)[string] | undefined;
    for (const candidate of candidates) {
      if (lookup.has(candidate)) {
        match = lookup.get(candidate);
        break;
      }
    }

    if (!match) return model;

    // Enrich capability flags from LiteLLM (more reliable boolean flags)
    return {
      ...model,
      capabilities: {
        supportsVision: match.supports_vision ?? model.capabilities.supportsVision,
        supportsReasoning: match.supports_reasoning ?? model.capabilities.supportsReasoning,
        supportsFunctionCalling:
          match.supports_function_calling ?? model.capabilities.supportsFunctionCalling,
        supportsPromptCaching:
          match.supports_prompt_caching ?? model.capabilities.supportsPromptCaching,
        supportsResponseSchema:
          match.supports_response_schema ?? model.capabilities.supportsResponseSchema,
        supportsStreaming: model.capabilities.supportsStreaming,
      },
      contextWindow:
        model.contextWindow ?? match.max_input_tokens ?? match.max_tokens ?? null,
      maxOutputTokens: model.maxOutputTokens ?? match.max_output_tokens ?? null,
      sources: [...new Set([...model.sources, "litellm" as DataSource])],
    };
  });
}

// ── llm-prices cross-validation ───────────────────────────────────────────

export function crossValidateWithLLMPrices(
  models: UnifiedModel[],
  llmPrices: LLMPricesEntry[]
): UnifiedModel[] {
  if (!llmPrices.length) return models;

  const lookup = new Map<string, LLMPricesEntry>();
  for (const entry of llmPrices) {
    lookup.set(normKey(entry.id), entry);
    lookup.set(normKey(`${entry.vendor}/${entry.id}`), entry);
  }

  return models.map((model) => {
    const modelName = model.id.includes("/") ? model.id.split("/")[1] : model.id;
    const match =
      lookup.get(normKey(model.id)) ??
      lookup.get(normKey(modelName)) ??
      lookup.get(normKey(`${model.provider}/${modelName}`));

    if (!match) return model;

    // Check if prices agree within 1%
    const llmInput = match.input;
    const ourInput = model.pricing.inputPerMillion;
    const tolerance = 0.01;
    const inputAgreement = Math.abs(llmInput - ourInput) / (ourInput || 1) <= tolerance;

    return {
      ...model,
      priceVerified: inputAgreement,
      sources: [...new Set([...model.sources, "llmprices" as DataSource])],
    };
  });
}
