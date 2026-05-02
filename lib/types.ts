// ── Raw API types ──────────────────────────────────────────────────────────

export interface OpenRouterModel {
  id: string;
  canonical_slug: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string;
    completion: string;
    input_cache_read?: string;
    input_cache_write?: string;
    web_search?: string;
    image?: string;
    audio?: string;
    internal_reasoning?: string;
  };
  top_provider: {
    context_length: number | null;
    max_completion_tokens: number | null;
    is_moderated: boolean;
  };
  supported_parameters: string[];
}

export interface OpenRouterResponse {
  data: OpenRouterModel[];
}

export interface LiteLLMModelEntry {
  litellm_provider: string;
  input_cost_per_token: number;
  output_cost_per_token: number;
  cache_creation_input_token_cost?: number;
  cache_read_input_token_cost?: number;
  max_tokens?: number;
  max_input_tokens?: number;
  max_output_tokens?: number;
  supports_vision?: boolean;
  supports_function_calling?: boolean;
  supports_reasoning?: boolean;
  supports_prompt_caching?: boolean;
  supports_response_schema?: boolean;
  supports_tool_choice?: boolean;
  mode?: string;
  deprecation_date?: string | null;
}

export type LiteLLMData = Record<string, LiteLLMModelEntry>;

export interface LLMPricesEntry {
  id: string;
  vendor: string;
  name: string;
  input: number;
  output: number;
  input_cached: number | null;
}

export interface LLMPricesResponse {
  updated_at: string;
  prices: LLMPricesEntry[];
}

// ── Unified canonical model ────────────────────────────────────────────────

export type DataSource = "openrouter" | "litellm" | "llmprices";

export interface ModelPricing {
  inputPerMillion: number;
  outputPerMillion: number;
  cacheReadPerMillion: number | null;
  cacheWritePerMillion: number | null;
  webSearchPerCall: number | null;
  imagePerCall: number | null;
}

export interface ModelCapabilities {
  supportsVision: boolean;
  supportsReasoning: boolean;
  supportsFunctionCalling: boolean;
  supportsPromptCaching: boolean;
  supportsResponseSchema: boolean;
  supportsStreaming: boolean;
}

export interface UnifiedModel {
  id: string;
  slug: string;
  name: string;
  provider: string;
  providerSlug: string;
  pricing: ModelPricing;
  contextWindow: number | null;
  maxOutputTokens: number | null;
  capabilities: ModelCapabilities;
  sources: DataSource[];
  priceVerified: boolean;
  createdAt: number | null;
  isDeprecated: boolean;
  isFree: boolean;
  inputModalities: string[];
  tokenizer: string | null;
}

export interface PriceSnapshot {
  modelId: string;
  date: string;
  inputPerMillion: number;
  outputPerMillion: number;
}

export interface DataFetchResult {
  models: UnifiedModel[];
  history: PriceSnapshot[];
  fetchedAt: string;
  sourceTimestamps: {
    openrouter: string | null;
    litellm: string | null;
    llmprices: string | null;
  };
  sourceModelCounts: {
    openrouter: number;
    litellm: number;
    llmprices: number;
    merged: number;
  };
  errors: { source: DataSource; message: string }[];
}

// ── Subscription types ─────────────────────────────────────────────────────

export interface SubscriptionPlan {
  name: string;
  price: number;
  period: "month" | "year";
  lastVerified: string;
  url: string;
  note?: string;
}

export interface ProviderSubscriptions {
  plans: SubscriptionPlan[];
}

export type SubscriptionsData = Record<string, ProviderSubscriptions>;
