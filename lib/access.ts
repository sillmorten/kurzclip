import { db, getSubscription, type User } from "./db";
import { anonId, currentUser } from "./session";

export const FREE_VIDEOS = Number(process.env.FREE_VIDEOS || 4);

export type Viewer = {
  user: User | null;
  key: string | null;
  unlimited: boolean;
  subscribed: boolean;
  watchedIds: Set<number>;
  freeLeft: number;
};

export function subscriptionActive(userId: number) {
  const sub = getSubscription(userId);
  if (!sub) return false;
  if (sub.status !== "active" && sub.status !== "trialing") return false;
  return !sub.current_period_end || new Date(sub.current_period_end) > new Date();
}

export async function getViewer(): Promise<Viewer> {
  const user = await currentUser();
  const anon = await anonId();
  const key = user ? `u:${user.id}` : anon ? `a:${anon}` : null;
  const subscribed = !!user && subscriptionActive(user.id);
  const unlimited = !!user?.is_creator || subscribed;
  const rows = key
    ? (db().prepare("SELECT video_id FROM views WHERE viewer_key = ?").all(key) as { video_id: number }[])
    : [];
  const watchedIds = new Set(rows.map((r) => r.video_id));
  return { user, key, unlimited, subscribed, watchedIds, freeLeft: Math.max(0, FREE_VIDEOS - watchedIds.size) };
}

export type CardState = "open" | "free" | "locked";

export function cardState(viewer: Viewer, videoId: number): CardState {
  if (viewer.unlimited || viewer.watchedIds.has(videoId)) return "open";
  return viewer.freeLeft > 0 ? "free" : "locked";
}

/** Prüft die Paywall-Regel und verbraucht dabei ggf. ein Gratis-Video. */
export function grantAccess(viewer: Viewer, videoId: number): boolean {
  if (!viewer.key) return viewer.unlimited;
  if (viewer.unlimited || viewer.watchedIds.has(videoId)) {
    db().prepare("INSERT OR IGNORE INTO views (viewer_key, video_id) VALUES (?, ?)").run(viewer.key, videoId);
    return true;
  }
  if (viewer.freeLeft <= 0) return false;
  db().prepare("INSERT OR IGNORE INTO views (viewer_key, video_id) VALUES (?, ?)").run(viewer.key, videoId);
  viewer.watchedIds.add(videoId);
  viewer.freeLeft -= 1;
  return true;
}

/** Nur lesen: darf dieser Zuschauer die Videodatei laden? */
export function mayStream(viewer: Viewer, videoId: number) {
  return viewer.unlimited || viewer.watchedIds.has(videoId);
}

/** Gesehene Videos aus der Zeit vor dem Login auf das Konto übertragen. */
export function mergeAnonViews(anon: string | null, userId: number) {
  if (!anon) return;
  const d = db();
  d.prepare("INSERT OR IGNORE INTO views (viewer_key, video_id, created_at) SELECT ?, video_id, created_at FROM views WHERE viewer_key = ?")
    .run(`u:${userId}`, `a:${anon}`);
  d.prepare("DELETE FROM views WHERE viewer_key = ?").run(`a:${anon}`);
}
