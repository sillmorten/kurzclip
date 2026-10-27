import Link from "next/link";
import Shell from "@/components/Shell";
import VideoCard from "@/components/VideoCard";
import { cardState, getViewer } from "@/lib/access";
import { likedVideos } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Gemerkt() {
  const viewer = await getViewer();
  const videos = viewer.user ? likedVideos(viewer.user.id) : [];
  return (
    <Shell>
      <div className="pagehead"><h1>Gemerkt</h1></div>
      {!viewer.user ? (
        <div className="empty">
          <p>Melde dich an, um Videos mit einem Herz zu merken.</p>
          <Link className="cta" href="/login?next=/gemerkt">Anmelden</Link>
        </div>
      ) : videos.length === 0 ? (
        <div className="empty"><p>Noch nichts gemerkt. Tippe beim Video auf das Herz, dann landet es hier.</p></div>
      ) : (
        <div className="vgrid">{videos.map((v) => <VideoCard key={v.id} v={v} state={cardState(viewer, v.id)} />)}</div>
      )}
    </Shell>
  );
}
