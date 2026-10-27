import { db, setSubscription } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { PLANS, appUrl, priceFor, stripe, stripeEnabled, type PlanKey } from "@/lib/stripe";

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Bitte melde dich zuerst an." }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const plan: PlanKey = body.plan === "jaehrlich" ? "jaehrlich" : "monatlich";
  const next = typeof body.next === "string" && body.next.startsWith("/") && !body.next.startsWith("//") ? body.next : "/";

  if (!stripeEnabled()) {
    // Testmodus ohne Stripe-Konto: Abo direkt freischalten.
    const end = new Date();
    end.setMonth(end.getMonth() + PLANS[plan].months);
    setSubscription({ user_id: user.id, status: "active", plan, current_period_end: end.toISOString(), stripe_subscription_id: null });
    return Response.json({ url: `/abo/erfolg?next=${encodeURIComponent(next)}` });
  }

  try {
    const s = stripe();
    let customer = user.stripe_customer_id;
    if (!customer) {
      customer = (await s.customers.create({ email: user.email, name: user.name, metadata: { user_id: String(user.id) } })).id;
      db().prepare("UPDATE users SET stripe_customer_id = ? WHERE id = ?").run(customer, user.id);
    }
    const session = await s.checkout.sessions.create({
      mode: "subscription",
      customer,
      line_items: [{ price: priceFor(plan), quantity: 1 }],
      client_reference_id: String(user.id),
      metadata: { user_id: String(user.id), plan },
      subscription_data: { metadata: { user_id: String(user.id), plan } },
      success_url: `${appUrl()}/abo/erfolg?session_id={CHECKOUT_SESSION_ID}&next=${encodeURIComponent(next)}`,
      cancel_url: `${appUrl()}${next}`,
      locale: "de",
    });
    return Response.json({ url: session.url });
  } catch (e) {
    console.error(e);
    return Response.json({ error: "Stripe hat die Zahlung abgelehnt. Prüfe die Stripe-Einstellungen in der .env-Datei." }, { status: 500 });
  }
}
