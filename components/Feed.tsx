import Link from "next/link";
import { getViewer, cardState, FREE_VIDEOS } from "@/lib/access";
import { listVideos } from "@/lib/db";
import Logo from "./Logo";
import Shell from "./Shell";
import VideoCard from "./VideoCard";

export default async function Feed({ sort }: { sort: "neu" | "beliebt" }) {
  const viewer = await getViewer();
  const videos = listVideos(sort);
  return (
    <Shell>
      <div className="top">
        <Logo />
        {viewer.unlimited ? (
          <span className="chip">{viewer.user?.is_creator ? "Creator" : "Abo aktiv"}</span>
        ) : viewer.freeLeft > 0 ? (
          <span className="chip">{viewer.freeLeft} von {FREE_VIDEOS} gratis übrig</span>
        ) : (
          <Link href="/abo" className="chip r">Gratis-Videos aufgebraucht</Link>
        )}
      </div>
      <div className="tabs">
        <Link href="/" aria-current={sort === "neu" ? "page" : undefined}>Neu</Link>
        <Link href="/beliebt" aria-current={sort === "beliebt" ? "page" : undefined}>Beliebt</Link>
      </div>
      {videos.length === 0 ? (
        <div className="empty">
          <p>Noch keine Videos da.</p>
          {viewer.user?.is_creator ? <Link className="cta sm" href="/studio/neu">Erstes Video hochladen</Link> : null}
        </div>
      ) : (
        <div className="vgrid">
          {videos.map((v) => <VideoCard key={v.id} v={v} state={cardState(viewer, v.id)} />)}
        </div>
      )}
    </Shell>
  );
}
