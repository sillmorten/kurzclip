import Link from "next/link";
import { redirect } from "next/navigation";
import DeleteButton from "@/components/DeleteButton";
import Shell from "@/components/Shell";
import { db, videosByCreator } from "@/lib/db";
import { fmtCount, fmtDuration, gradientFor, initials, plural } from "@/lib/format";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Studio() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/studio");
  if (!user.is_creator) redirect("/profil");
  const videos = videosByCreator(user.id);
  const views = videos.reduce((n, v) => n + v.views, 0);
  const subs = (db()
    .prepare("SELECT COUNT(*) AS n FROM subscriptions WHERE status IN ('active','trialing') AND (current_period_end IS NULL OR current_period_end > ?)")
    .get(new Date().toISOString()) as { n: number }).n;

  return (
    <Shell>
      <div className="pagehead"><span className="logo">Studio</span><span className="av">{initials(user.name)}</span></div>
      <div className="pad">
        <div className="stats">
          <div className="stat"><b>{videos.length}</b><small>Videos</small></div>
          <div className="stat"><b>{fmtCount(views)}</b><small>Aufrufe</small></div>
          <div className="stat"><b>{subs}</b><small>Abos</small></div>
        </div>
        <Link className="cta" href="/studio/neu">+ Neues Video aufnehmen</Link>
        <div>
          <div className="lbl">Meine Videos</div>
          {videos.length === 0 ? (
            <p className="muted">Noch keine Videos. Lade dein erstes hoch, es darf höchstens eine Minute lang sein.</p>
          ) : (
            videos.map((v) => (
              <div className="lrow" key={v.id}>
                <Link href={`/v/${v.id}`} prefetch={false} className={`mini ${v.poster ? "" : gradientFor(v.id)}`}>
                  {v.poster ? <img src={`/api/poster/${v.id}`} alt="" /> : null}
                </Link>
                <div className="meta">
                  <b>{v.title}</b>
                  <small>{fmtDuration(v.duration)} · {plural(v.views, "Aufruf", "Aufrufe")} · {plural(v.likes, "Herz", "Herzen")}</small>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
                  <span className="st">live</span>
                  <DeleteButton id={v.id} />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Shell>
  );
}
