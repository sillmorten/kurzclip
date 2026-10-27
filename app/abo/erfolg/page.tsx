import Link from "next/link";
import Shell from "@/components/Shell";
import { syncSubscription } from "@/lib/billing";
import { currentUser } from "@/lib/session";
import { stripe, stripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function Erfolg({ searchParams }: { searchParams: Promise<{ session_id?: string; next?: string }> }) {
  const { session_id, next } = await searchParams;
  const user = await currentUser();
  // Falls der Webhook (noch) nicht eingerichtet ist, holen wir den Stand direkt von Stripe.
  if (user && session_id && stripeEnabled()) {
    try {
      const session = await stripe().checkout.sessions.retrieve(session_id, { expand: ["subscription"] });
      if (session.client_reference_id === String(user.id) && session.subscription && typeof session.subscription !== "string") {
        syncSubscription(session.subscription);
      }
    } catch (e) {
      console.error(e);
    }
  }
  const target = next?.startsWith("/") && !next.startsWith("//") ? next : "/";
  return (
    <Shell>
      <div className="empty" style={{ paddingTop: 96 }}>
        <span className="chip" style={{ fontSize: 13 }}>Abo aktiv</span>
        <h1 style={{ color: "var(--fg)" }}>Danke! Alle Videos sind jetzt freigeschaltet.</h1>
        <Link className="cta" href={target}>Weiter schauen</Link>
      </div>
    </Shell>
  );
}
