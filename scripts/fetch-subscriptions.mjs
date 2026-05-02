/**
 * Daily subscription price updater.
 * Fetches provider pricing pages via Jina AI Reader and extracts
 * subscription prices using targeted regex patterns per provider.
 * Updates data/subscriptions.json if prices have changed.
 *
 * Run: node scripts/fetch-subscriptions.mjs
 * CI:  Triggered daily by .github/workflows/update-subscriptions.yml
 */

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = join(__dirname, "../data/subscriptions.json");

const JINA_KEY = process.env.JINA_API_KEY;

async function fetchMarkdown(url) {
  const jinaUrl = `https://r.jina.ai/${url}`;
  const headers = { "Accept": "text/plain" };
  if (JINA_KEY) headers["Authorization"] = `Bearer ${JINA_KEY}`;

  const res = await fetch(jinaUrl, { headers });
  if (!res.ok) throw new Error(`Jina fetch failed for ${url}: ${res.status}`);
  return res.text();
}

/** Extract first USD price matching $N or $N.N /month patterns */
function extractPrice(text, planName) {
  // Look for the plan name followed nearby by a dollar amount
  const escaped = planName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const nearbyPattern = new RegExp(
    `${escaped}[\\s\\S]{0,300}?\\$([0-9]+(?:\\.[0-9]+)?)(?:\\s*/\\s*(?:month|mo|monthly))?`,
    "i"
  );
  const nearby = text.match(nearbyPattern);
  if (nearby) return parseFloat(nearby[1]);

  // Fallback: find any price in a section mentioning the plan
  const lines = text.split("\n");
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].toLowerCase().includes(planName.toLowerCase())) {
      const window = lines.slice(i, i + 5).join(" ");
      const priceMatch = window.match(/\$([0-9]+(?:\.[0-9]+)?)/);
      if (priceMatch) return parseFloat(priceMatch[1]);
    }
  }
  return null;
}

const TARGETS = [
  {
    provider: "openai",
    url: "https://openai.com/chatgpt/pricing",
    plans: [
      { name: "ChatGPT Plus", keywords: ["Plus"] },
      { name: "ChatGPT Pro", keywords: ["Pro"] },
    ],
  },
  {
    provider: "anthropic",
    url: "https://anthropic.com/claude/pricing",
    plans: [
      { name: "Claude Pro", keywords: ["Pro"] },
      { name: "Claude Max (5×)", keywords: ["Max", "5x", "5×"] },
      { name: "Claude Max (20×)", keywords: ["Max", "20x", "20×"] },
    ],
  },
  {
    provider: "google",
    url: "https://one.google.com/about/ai-premium",
    plans: [
      { name: "Gemini Advanced", keywords: ["Advanced", "Premium"] },
    ],
  },
  {
    provider: "x-ai",
    url: "https://x.ai/grok",
    plans: [
      { name: "X Premium", keywords: ["Premium"] },
      { name: "X Premium+", keywords: ["Premium+", "Premium Plus"] },
    ],
  },
  {
    provider: "mistralai",
    url: "https://mistral.ai/pricing",
    plans: [
      { name: "Le Chat Pro", keywords: ["Pro"] },
    ],
  },
];

async function run() {
  const data = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const today = new Date().toISOString().slice(0, 10);
  let changed = false;

  for (const target of TARGETS) {
    console.log(`Fetching ${target.provider} prices from ${target.url}…`);
    let markdown;
    try {
      markdown = await fetchMarkdown(target.url);
    } catch (err) {
      console.warn(`  ⚠ Fetch failed: ${err.message} — keeping existing prices`);
      continue;
    }

    const providerData = data[target.provider];
    if (!providerData?.plans) continue;

    for (const planTarget of target.plans) {
      const existingPlan = providerData.plans.find((p) => p.name === planTarget.name);
      if (!existingPlan) continue;

      let extracted = null;
      for (const keyword of planTarget.keywords) {
        extracted = extractPrice(markdown, keyword);
        if (extracted !== null) break;
      }

      if (extracted === null) {
        console.log(`  ⚠ Could not extract price for "${planTarget.name}" — keeping $${existingPlan.price}`);
        continue;
      }

      if (extracted !== existingPlan.price) {
        console.log(`  ✓ ${planTarget.name}: $${existingPlan.price} → $${extracted}`);
        existingPlan.price = extracted;
        changed = true;
      } else {
        console.log(`  ✓ ${planTarget.name}: $${existingPlan.price} (unchanged)`);
      }

      // Always update lastVerified if extraction succeeded
      existingPlan.lastVerified = today;
      existingPlan.url = target.url;
    }
  }

  writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
  console.log(changed ? "\nPrices updated and saved." : "\nNo price changes. Verification dates updated.");
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
