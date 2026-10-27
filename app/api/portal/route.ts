import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/session";
import { appUrl, stripe, stripeEnabled } from "@/lib/stripe";

export async function POST() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (!stripeEnabled() || !user.stripe_customer_id) {
    // Testmodus: Abo einfach beenden.
    db().prepare("UPDATE subscriptions SET status = 'canceled' WHERE user_id = ?").run(user.id);
    redirect("/profil");
  }
  const session = await stripe().billingPortal.sessions.create({ customer: user.stripe_customer_id, return_url: `${appUrl()}/profil` });
  redirect(session.url);
}
