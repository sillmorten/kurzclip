import type Stripe from "stripe";
import { syncSubscription } from "@/lib/billing";
import { stripe } from "@/lib/stripe";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) return new Response("STRIPE_WEBHOOK_SECRET fehlt", { status: 500 });
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, req.headers.get("stripe-signature") ?? "", secret);
  } catch {
    return new Response("Ungültige Signatur", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    if (typeof session.subscription === "string") {
      syncSubscription(await stripe().subscriptions.retrieve(session.subscription));
    }
  } else if (event.type.startsWith("customer.subscription.")) {
    syncSubscription(event.data.object as Stripe.Subscription);
  }
  return Response.json({ received: true });
}
