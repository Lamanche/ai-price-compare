"use client";

import { useState } from "react";
import type { UnifiedModel, PriceSnapshot, SubscriptionsData } from "@/lib/types";
import { SITE_CONFIG } from "@/config/site";
import ViewToggle from "./ViewToggle";
import ModelCardGrid from "./ModelCardGrid";
import SubscriptionPlans from "./SubscriptionPlans";

interface HeroSectionProps {
  models: UnifiedModel[];
  history: PriceSnapshot[];
  subscriptions: SubscriptionsData;
}

export default function HeroSection({ models, history, subscriptions }: HeroSectionProps) {
  const [view, setView] = useState<"users" | "devs">(SITE_CONFIG.defaultView);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <ViewToggle view={view} onChange={setView} />
        <span className="text-xs" style={{ color: "var(--color-text-dim)" }}>
          {view === "users"
            ? "Monthly subscription plans — what regular users pay"
            : "API token pricing — what developers pay per million tokens"}
        </span>
      </div>

      {view === "users" ? (
        <SubscriptionPlans data={subscriptions} />
      ) : (
        <ModelCardGrid models={models} history={history} />
      )}
    </div>
  );
}
