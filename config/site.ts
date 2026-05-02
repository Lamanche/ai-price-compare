export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://ai-price-compare.vercel.app",
  name: "AI Price Compare",
  tagline: "Live AI Model Pricing — Subscriptions & API Costs",
  description:
    "Compare subscription plans and API token prices for ChatGPT, Claude, Gemini, and 300+ AI models. Real-time data, updated hourly. No stale prices.",
  defaultView: "users" as "users" | "devs",
  defaultTableRows: 50,
  showFreeModels: false,
  showDeprecated: false,
  enableHistoricalChart: true,
  revalidateSeconds: 3600,
  twitterHandle: "",
} as const;
