import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, db, getVideo } from "@/lib/db";
import { currentUser } from "@/lib/session";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await currentUser();
  const video = getVideo(Number((await params).id));
  if (!video) return Response.json({ error: "Video nicht gefunden." }, { status: 404 });
  if (!user || video.creator_id !== user.id) return Response.json({ error: "Das ist nicht dein Video." }, { status: 403 });
  db().prepare("DELETE FROM videos WHERE id = ?").run(video.id);
  for (const f of [video.file, video.poster]) if (f) fs.rmSync(path.join(UPLOAD_DIR, f), { force: true });
  return Response.json({ ok: true });
}
