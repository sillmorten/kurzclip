import Link from "next/link";
import Shell from "@/components/Shell";
import { FREE_VIDEOS, getViewer } from "@/lib/access";
import { logout } from "@/lib/actions";
import { getSubscription } from "@/lib/db";
import { initials } from "@/lib/format";
import { stripeEnabled, PLANS, type PlanKey } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function Profil() {
  const viewer = await getViewer();
  const user = viewer.user;
  if (!user) {
    return (
      <Shell>
        <div className="pagehead"><h1>Profil</h1></div>
        <div className="empty">
          <p>Melde dich an, damit dein Gratis-Zähler und dein Abo auf jedem Gerät gelten.</p>
          <Link className="cta" href="/login?next=/profil">Anmelden</Link>
          <Link className="cta alt" href="/registrieren?next=/profil">Konto erstellen</Link>
        </div>
      </Shell>
    );
  }
  const sub = getSubscription(user.id);
  const plan = sub ? PLANS[(sub.plan as PlanKey)] ?? PLANS.monatlich : null;
  return (
    <Shell>
      <div className="pagehead"><h1>Profil</h1><span className="av">{initials(user.name)}</span></div>
      <div className="pad">
        <div className="card">
          <b>{user.name}</b>
          <span className="muted">{user.email}</span>
          {user.is_creator ? <span className="st" style={{ alignSelf: "flex-start" }}>Creator</span> : null}
        </div>

        {user.is_creator ? (
          <Link className="cta" href="/studio">Zum Creator-Studio</Link>
        ) : null}

        <div className="card">
          <span className="lbl">Abo</span>
          {viewer.subscribed && sub && plan ? (
            <>
              <div className="row"><b>{plan.label} · {plan.price}</b><span className="st">aktiv</span></div>
              {sub.current_period_end ? (
                <span className="muted">Läuft bis {new Date(sub.current_period_end).toLocaleDateString("de-DE")}</span>
              ) : null}
              <form action="/api/portal" method="post">
                <button className="cta alt sm">{stripeEnabled() ? "Abo verwalten" : "Test-Abo beenden"}</button>
              </form>
            </>
          ) : (
            <>
              <span className="muted">
                {user.is_creator
                  ? "Als Creator siehst du alle Videos kostenlos."
                  : `Kein Abo. ${viewer.freeLeft} von ${FREE_VIDEOS} Gratis-Videos übrig.`}
              </span>
              {!user.is_creator ? <Link className="cta sm" href="/abo">Alle Videos freischalten</Link> : null}
            </>
          )}
        </div>

        <form action={logout}>
          <button className="cta alt">Abmelden</button>
        </form>
      </div>
    </Shell>
  );
}
