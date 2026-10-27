"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fmtDuration, initials } from "@/lib/format";
import { BackIcon, HeartIcon, PlayIcon, ShareIcon } from "./icons";

type Props = {
  video: { id: number; title: string; description: string; creator: string; duration: number; likes: number; poster: string | null };
  liked: boolean;
  loggedIn: boolean;
  chip: string | null;
  prevId: number | null;
  nextId: number | null;
};

export default function Player({ video, liked: initialLiked, loggedIn, chip, prevId, nextId }: Props) {
  const router = useRouter();
  const ref = useRef<HTMLVideoElement>(null);
  const [t, setT] = useState(0);
  const [dur, setDur] = useState(video.duration);
  const [paused, setPaused] = useState(false);
  const [liked, setLiked] = useState(initialLiked);
  const [likes, setLikes] = useState(video.likes);
  const [note, setNote] = useState<string | null>(null);
  const touchY = useRef<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.play().catch(() => {
      // Autoplay mit Ton wird oft blockiert: stumm weiterprobieren.
      el.muted = true;
      el.play().catch(() => setPaused(true));
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" && nextId) router.push(`/v/${nextId}`);
      if (e.key === "ArrowUp" && prevId) router.push(`/v/${prevId}`);
      if (e.key === " ") { e.preventDefault(); toggle(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  function toggle() {
    const el = ref.current;
    if (!el) return;
    if (el.paused) { el.muted = false; el.play(); setPaused(false); } else { el.pause(); setPaused(true); }
  }

  async function like() {
    if (!loggedIn) { router.push(`/login?next=/v/${video.id}`); return; }
    const next = !liked;
    setLiked(next);
    setLikes((n) => n + (next ? 1 : -1));
    await fetch(`/api/likes/${video.id}`, { method: next ? "POST" : "DELETE" });
  }

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) { await navigator.share({ title: video.title, url }); return; }
      await navigator.clipboard.writeText(url);
      setNote("Link kopiert");
    } catch {
      setNote(url);
    }
    setTimeout(() => setNote(null), 2500);
  }

  function seek(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || !dur) return;
    const r = e.currentTarget.getBoundingClientRect();
    el.currentTime = ((e.clientX - r.left) / r.width) * dur;
  }

  return (
    <div
      className="player"
      onTouchStart={(e) => { touchY.current = e.touches[0].clientY; }}
      onTouchEnd={(e) => {
        if (touchY.current === null) return;
        const dy = e.changedTouches[0].clientY - touchY.current;
        touchY.current = null;
        if (dy < -70 && nextId) router.push(`/v/${nextId}`);
        if (dy > 70 && prevId) router.push(`/v/${prevId}`);
      }}
    >
      <video
        ref={ref}
        src={`/api/media/${video.id}`}
        poster={video.poster ?? undefined}
        playsInline
        loop
        preload="auto"
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => Number.isFinite(e.currentTarget.duration) && setDur(e.currentTarget.duration)}
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
      />
      <div className="shade" />
      <div className="tap" onClick={toggle} aria-hidden="true" />
      {paused ? <div className="paused"><span><PlayIcon /></span></div> : null}

      <div className="top">
        <Link href="/" className="back"><BackIcon />Feed</Link>
        {chip ? <span className="chip dk">{chip}</span> : null}
      </div>

      <div className="side">
        <button onClick={like} className={liked ? "liked" : ""} aria-pressed={liked} aria-label="Gefällt mir">
          <HeartIcon filled={liked} />{likes}
        </button>
        <button onClick={share} aria-label="Teilen"><ShareIcon />Teilen</button>
      </div>

      <div className="cap">
        <div className="who"><span className="av">{initials(video.creator)}</span>{video.creator}</div>
        <div className="title">{video.title}</div>
        {video.description ? <div className="desc">{video.description}</div> : null}
        {note ? <div className="chip dk" style={{ alignSelf: "flex-start" }}>{note}</div> : null}
      </div>

      <div className="prog" onClick={seek} role="slider" aria-label="Fortschritt" aria-valuemin={0} aria-valuemax={Math.round(dur)} aria-valuenow={Math.round(t)}>
        <i style={{ width: `${dur ? Math.min(100, (t / dur) * 100) : 0}%` }} />
      </div>
      <div className="time"><span>{fmtDuration(t)}</span><span>{fmtDuration(dur)}</span></div>
      {nextId ? <div className="swipehint">Nach oben wischen für das nächste Video</div> : null}
    </div>
  );
}
