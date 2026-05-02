import type { SubscriptionsData } from "@/lib/types";
import { PROVIDERS, getProviderConfig } from "@/config/providers";
import { HERO_PROVIDER_SLUGS } from "@/config/hero-models";
import { formatDate } from "@/lib/formatters";

interface SubscriptionPlansProps {
  data: SubscriptionsData;
}

export default function SubscriptionPlans({ data }: SubscriptionPlansProps) {
  const slugs = HERO_PROVIDER_SLUGS.filter((s) => data[s]?.plans?.length);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {slugs.map((slug) => {
        const provider = getProviderConfig(slug);
        const { plans } = data[slug];
        const verified = plans[0]?.lastVerified;

        return (
          <div
            key={slug}
            className="card flex flex-col gap-3 p-5 transition-all duration-200 hover:border-white/20"
            style={{ borderTop: `2px solid ${provider.color}` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium" style={{ color: provider.color }}>
                  {provider.name}
                </p>
                <h3 className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                  {provider.displayName}
                </h3>
              </div>
            </div>

            {/* Plans */}
            <ul className="flex flex-col gap-2" role="list" aria-label={`${provider.name} subscription plans`}>
              {plans.map((plan) => (
                <li key={plan.name} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {plan.name}
                    {plan.note && (
                      <span
                        className="ml-1.5 text-xs"
                        style={{ color: "var(--color-text-dim)" }}
                        title={plan.note}
                      >
                        ·
                      </span>
                    )}
                  </span>
                  <span
                    className="tabular font-mono text-sm font-semibold"
                    style={{ color: plan.price === 0 ? "#22c55e" : "var(--color-text)" }}
                  >
                    {plan.price === 0 ? "Free" : `$${plan.price}/mo`}
                  </span>
                </li>
              ))}
            </ul>

            {/* Footer */}
            <div className="flex items-center justify-between pt-1" style={{ borderTop: "1px solid var(--color-border)" }}>
              <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
                {verified ? (
                  <>
                    <span style={{ color: "#22c55e" }}>✓</span> Verified {formatDate(verified)}
                  </>
                ) : (
                  "Unverified"
                )}
              </span>
              <a
                href={provider.officialPricingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs underline underline-offset-2 transition-colors hover:text-white"
                style={{ color: "var(--color-text-dim)" }}
                aria-label={`Official ${provider.name} pricing page`}
              >
                Official pricing ↗
              </a>
            </div>
          </div>
        );
      })}
    </div>
  );
}
