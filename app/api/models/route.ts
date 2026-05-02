import { getAllModels } from "@/lib/data/index";
import { SITE_CONFIG } from "@/config/site";

export const revalidate = 3600;

export async function GET(request: Request) {
  const data = await getAllModels();
  const url = new URL(request.url);

  const providerParam = url.searchParams.get("provider");
  const capabilityParam = url.searchParams.get("capability");
  const sortParam = url.searchParams.get("sort") ?? "inputPerMillion";
  const orderParam = url.searchParams.get("order") ?? "asc";

  let models = data.models;

  if (providerParam) {
    models = models.filter((m) => m.provider === providerParam || m.providerSlug === providerParam);
  }
  if (capabilityParam) {
    const cap = capabilityParam as keyof (typeof models)[0]["capabilities"];
    models = models.filter((m) => m.capabilities[cap] === true);
  }

  models = [...models].sort((a, b) => {
    let av: number | string = 0;
    let bv: number | string = 0;
    switch (sortParam) {
      case "name": av = a.name; bv = b.name; break;
      case "inputPerMillion": av = a.pricing.inputPerMillion; bv = b.pricing.inputPerMillion; break;
      case "outputPerMillion": av = a.pricing.outputPerMillion; bv = b.pricing.outputPerMillion; break;
      case "contextWindow": av = a.contextWindow ?? 0; bv = b.contextWindow ?? 0; break;
    }
    if (typeof av === "string" && typeof bv === "string") {
      return orderParam === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return orderParam === "asc" ? (av as number) - (bv as number) : (bv as number) - (av as number);
  });

  return Response.json(
    {
      models,
      total: models.length,
      fetchedAt: data.fetchedAt,
      sourceTimestamps: data.sourceTimestamps,
      sourceModelCounts: data.sourceModelCounts,
      errors: data.errors,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200",
        "Access-Control-Allow-Origin": "*",
      },
    }
  );
}
