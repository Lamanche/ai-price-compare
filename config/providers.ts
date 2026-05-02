export interface ProviderConfig {
  slug: string;
  name: string;
  displayName: string;
  color: string;
  openRouterPrefix: string;
  pricingPageUrl: string;
  officialPricingUrl: string;
  apiDocsUrl: string;
  description: string;
}

export const PROVIDERS: Record<string, ProviderConfig> = {
  openai: {
    slug: "openai",
    name: "OpenAI",
    displayName: "OpenAI ChatGPT",
    color: "#10b981",
    openRouterPrefix: "openai/",
    pricingPageUrl: "https://openai.com/chatgpt/pricing",
    officialPricingUrl: "https://openai.com/api/pricing/",
    apiDocsUrl: "https://platform.openai.com/docs",
    description:
      "OpenAI GPT model API pricing — compare input, output, and caching costs for GPT-4o, o3, and all GPT models. Updated hourly.",
  },
  anthropic: {
    slug: "anthropic",
    name: "Anthropic",
    displayName: "Anthropic Claude",
    color: "#f59e0b",
    openRouterPrefix: "anthropic/",
    pricingPageUrl: "https://anthropic.com/claude/pricing",
    officialPricingUrl: "https://anthropic.com/claude/pricing",
    apiDocsUrl: "https://docs.anthropic.com",
    description:
      "Anthropic Claude API pricing — compare input, output, and prompt caching costs for Claude Opus, Sonnet, and Haiku. Updated hourly.",
  },
  google: {
    slug: "google",
    name: "Google",
    displayName: "Google Gemini",
    color: "#3b82f6",
    openRouterPrefix: "google/",
    pricingPageUrl: "https://ai.google.dev/pricing",
    officialPricingUrl: "https://ai.google.dev/pricing",
    apiDocsUrl: "https://ai.google.dev/docs",
    description:
      "Google Gemini API pricing — compare input, output, and caching costs for Gemini 2.5 Pro, Flash, and all Gemini models. Updated hourly.",
  },
  deepseek: {
    slug: "deepseek",
    name: "DeepSeek",
    displayName: "DeepSeek",
    color: "#8b5cf6",
    openRouterPrefix: "deepseek/",
    pricingPageUrl: "https://api-docs.deepseek.com/quick_start/pricing",
    officialPricingUrl: "https://api-docs.deepseek.com/quick_start/pricing",
    apiDocsUrl: "https://api-docs.deepseek.com",
    description:
      "DeepSeek API pricing — compare input and output token costs for DeepSeek V3 and DeepSeek R1. Updated hourly.",
  },
  "x-ai": {
    slug: "x-ai",
    name: "xAI",
    displayName: "xAI Grok",
    color: "#6366f1",
    openRouterPrefix: "x-ai/",
    pricingPageUrl: "https://x.ai/api",
    officialPricingUrl: "https://x.ai/api",
    apiDocsUrl: "https://docs.x.ai",
    description:
      "xAI Grok API pricing — compare input and output token costs for Grok models. Updated hourly.",
  },
  "meta-llama": {
    slug: "meta-llama",
    name: "Meta",
    displayName: "Meta Llama",
    color: "#06b6d4",
    openRouterPrefix: "meta-llama/",
    pricingPageUrl: "https://llama.meta.com",
    officialPricingUrl: "https://openrouter.ai/meta-llama",
    apiDocsUrl: "https://llama.meta.com/docs",
    description:
      "Meta Llama API pricing via OpenRouter — compare input and output token costs for Llama 3.x and Llama 4 models. Updated hourly.",
  },
  mistralai: {
    slug: "mistralai",
    name: "Mistral",
    displayName: "Mistral AI",
    color: "#f97316",
    openRouterPrefix: "mistralai/",
    pricingPageUrl: "https://mistral.ai/pricing",
    officialPricingUrl: "https://mistral.ai/pricing",
    apiDocsUrl: "https://docs.mistral.ai",
    description:
      "Mistral AI API pricing — compare input and output token costs for Mistral Large, Codestral, and all Mistral models. Updated hourly.",
  },
  cohere: {
    slug: "cohere",
    name: "Cohere",
    displayName: "Cohere",
    color: "#0ea5e9",
    openRouterPrefix: "cohere/",
    pricingPageUrl: "https://cohere.com/pricing",
    officialPricingUrl: "https://cohere.com/pricing",
    apiDocsUrl: "https://docs.cohere.com",
    description:
      "Cohere API pricing — compare input and output token costs for Command R and Command R+ models. Updated hourly.",
  },
};

export function getProviderConfig(slug: string): ProviderConfig {
  return (
    PROVIDERS[slug] ?? {
      slug,
      name: slug.charAt(0).toUpperCase() + slug.slice(1),
      displayName: slug.charAt(0).toUpperCase() + slug.slice(1),
      color: "#94a3b8",
      openRouterPrefix: `${slug}/`,
      pricingPageUrl: "",
      officialPricingUrl: "",
      apiDocsUrl: "",
      description: `${slug} API pricing — compare model costs. Updated hourly.`,
    }
  );
}
