import Link from "next/link";
import type { VideoRow } from "@/lib/db";
import type { CardState } from "@/lib/access";
import { fmtDuration, gradientFor, plural } from "@/lib/format";
import { LockIcon } from "./icons";

export default function VideoCard({ v, state }: { v: VideoRow; state: CardState }) {
  const g = gradientFor(v.id);
  const poster = v.poster ? <img className="poster" src={`/api/poster/${v.id}`} alt="" loading="lazy" /> : null;
  if (state === "locked") {
    return (
      <Link prefetch={false} href={`/v/${v.id}`} className="vc lk" aria-label={`${v.title}, nur mit Abo`}>
        {poster ?? <span className={`bgx ${g}`} />}
        <span className="d">{fmtDuration(v.duration)}</span>
        <span className="lock"><LockIcon />Mit Abo</span>
      </Link>
    );
  }
  return (
    <Link prefetch={false} href={`/v/${v.id}`} className={`vc ${poster ? "" : g}`}>
      {poster}
      {state === "free" ? <span className="f">GRATIS</span> : null}
      <span className="d">{fmtDuration(v.duration)}</span>
      <span className="tt">{v.title}</span>
      <span className="vw">{plural(v.views, "Aufruf", "Aufrufe")}</span>
    </Link>
  );
}
