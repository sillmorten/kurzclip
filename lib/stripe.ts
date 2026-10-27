import Stripe from "stripe";

export const PLANS = {
  monatlich: { label: "Monatlich", price: "4,99 €", per: "pro Monat", note: "jederzeit kündbar", months: 1 },
  jaehrlich: { label: "Jährlich", price: "39,99 €", per: "pro Jahr", note: "2 Monate geschenkt", months: 12 },
} as const;
export type PlanKey = keyof typeof PLANS;

export const stripeEnabled = () => !!process.env.STRIPE_SECRET_KEY;

let client: Stripe | null = null;
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY fehlt");
  client ??= new Stripe(process.env.STRIPE_SECRET_KEY);
  return client;
}

export function priceFor(plan: PlanKey) {
  const id = plan === "jaehrlich" ? process.env.STRIPE_PRICE_YEARLY : process.env.STRIPE_PRICE_MONTHLY;
  if (!id) throw new Error(`Stripe-Preis für ${plan} fehlt in der .env-Datei`);
  return id;
}

export function appUrl() {
  return (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
}
