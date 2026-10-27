import { notFound } from "next/navigation";
import Player from "@/components/Player";
import Paywall from "@/components/Paywall";
import { FREE_VIDEOS, getViewer, grantAccess } from "@/lib/access";
import { getVideo, hasLiked, listVideos } from "@/lib/db";
import { gradientFor } from "@/lib/format";
import { stripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function VideoPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const video = Number.isInteger(id) ? getVideo(id) : undefined;
  if (!video) notFound();

  const viewer = await getViewer();
  const allowed = grantAccess(viewer, video.id);

  const order = listVideos("neu").map((v) => v.id);
  const idx = order.indexOf(video.id);
  const prevId = idx > 0 ? order[idx - 1] : null;
  const nextId = idx >= 0 && idx < order.length - 1 ? order[idx + 1] : null;

  if (!allowed) {
    return (
      <Paywall
        videoId={video.id}
        poster={video.poster ? `/api/poster/${video.id}` : null}
        gradient={gradientFor(video.id)}
        position={viewer.watchedIds.size + 1}
        freeVideos={FREE_VIDEOS}
        loggedIn={!!viewer.user}
        testMode={!stripeEnabled()}
      />
    );
  }

  const chip = viewer.unlimited
    ? null
    : `Gratis ${[...viewer.watchedIds].length} / ${FREE_VIDEOS}`;

  return (
    <Player
      video={{
        id: video.id,
        title: video.title,
        description: video.description,
        creator: video.creator_name,
        duration: video.duration,
        likes: video.likes,
        poster: video.poster ? `/api/poster/${video.id}` : null,
      }}
      liked={viewer.user ? hasLiked(viewer.user.id, video.id) : false}
      loggedIn={!!viewer.user}
      chip={chip}
      prevId={prevId}
      nextId={nextId}
    />
  );
}
