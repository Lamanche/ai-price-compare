import Link from "next/link";
import { SITE_CONFIG } from "@/config/site";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer
      style={{ borderTop: "1px solid var(--color-border)", color: "var(--color-text-dim)" }}
      className="mt-16 py-8 text-xs"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-semibold" style={{ color: "var(--color-text-muted)" }}>
              {SITE_CONFIG.name}
            </span>
            <span>
              Pricing data sourced from{" "}
              <a
                href="https://openrouter.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                OpenRouter
              </a>
              ,{" "}
              <a
                href="https://github.com/BerriAI/litellm"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                LiteLLM
              </a>
              , and{" "}
              <a
                href="https://www.llm-prices.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-white"
              >
                llm-prices.com
              </a>
              . Updated hourly. Verify prices at official provider sites.
            </span>
          </div>
          <nav aria-label="Footer navigation" className="flex items-center gap-4">
            <Link href="/calculator" className="hover:text-white">Calculator</Link>
            <Link href="/api/models" className="hover:text-white">API</Link>
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white"
            >
              API Key
            </a>
          </nav>
        </div>
        <p className="mt-4" style={{ color: "rgba(100,116,139,0.6)" }}>
          © {year} {SITE_CONFIG.name}. Prices may vary. Always verify with official provider pricing pages.
        </p>
      </div>
    </footer>
  );
}
