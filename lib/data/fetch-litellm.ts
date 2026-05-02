import type { LiteLLMData } from "@/lib/types";

interface FetchResult {
  data: LiteLLMData;
  fetchedAt: string;
  error?: string;
}

const LITELLM_URL =
  "https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json";

export async function fetchLiteLLM(): Promise<FetchResult> {
  const fetchedAt = new Date().toISOString();

  try {
    const res = await fetch(LITELLM_URL, { next: { revalidate: 3600 } });

    if (!res.ok) {
      return { data: {}, fetchedAt, error: `HTTP ${res.status}` };
    }

    const raw: LiteLLMData = await res.json();

    // Filter to only chat-mode, non-cloud-variant entries
    const EXCLUDED_PROVIDERS = new Set([
      "bedrock",
      "bedrock_converse",
      "azure",
      "azure_ai",
      "aiml",
      "anyscale",
      "together_ai",
      "aleph_alpha",
      "palm",
      "vertex_ai",
      "vertex_ai_beta",
      "sagemaker",
    ]);

    const filtered: LiteLLMData = {};
    for (const [key, val] of Object.entries(raw)) {
      if (key.startsWith("sample_spec")) continue;
      if (val.mode && val.mode !== "chat" && val.mode !== "completion") continue;
      if (EXCLUDED_PROVIDERS.has(val.litellm_provider)) continue;
      filtered[key] = val;
    }

    return { data: filtered, fetchedAt };
  } catch (err) {
    return { data: {}, fetchedAt, error: String(err) };
  }
}
