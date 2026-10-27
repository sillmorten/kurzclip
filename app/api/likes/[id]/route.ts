import { db, getVideo } from "@/lib/db";
import { currentUser } from "@/lib/session";

async function handle(add: boolean, params: Promise<{ id: string }>) {
  const user = await currentUser();
  if (!user) return Response.json({ error: "Bitte melde dich an." }, { status: 401 });
  const video = getVideo(Number((await params).id));
  if (!video) return Response.json({ error: "Video nicht gefunden." }, { status: 404 });
  if (add) db().prepare("INSERT OR IGNORE INTO likes (user_id, video_id) VALUES (?, ?)").run(user.id, video.id);
  else db().prepare("DELETE FROM likes WHERE user_id = ? AND video_id = ?").run(user.id, video.id);
  return Response.json({ ok: true });
}

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(true, params);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  return handle(false, params);
}
