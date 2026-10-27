import type Stripe from "stripe";
import { setSubscription } from "./db";

/** Überträgt den Stand eines Stripe-Abos in die eigene Datenbank. */
export function syncSubscription(sub: Stripe.Subscription) {
  const userId = Number(sub.metadata?.user_id);
  if (!userId) return;
  const periodEnd = sub.items.data[0]?.current_period_end;
  setSubscription({
    user_id: userId,
    status: sub.status,
    plan: sub.metadata?.plan || "monatlich",
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    stripe_subscription_id: sub.id,
  });
}
