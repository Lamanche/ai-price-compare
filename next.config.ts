import type { NextConfig } from "next";

const config: NextConfig = {
  async headers() {
    return [
      {
        source: "/api/models",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Cache-Control",
            value: "public, s-maxage=3600, stale-while-revalidate=7200",
          },
        ],
      },
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      { source: "/gpt", destination: "/openai", permanent: true },
      { source: "/claude", destination: "/anthropic", permanent: true },
      { source: "/gemini", destination: "/google", permanent: true },
    ];
  },
};

export default config;
