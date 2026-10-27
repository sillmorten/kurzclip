import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, getVideo } from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const video = getVideo(Number((await params).id));
  if (!video?.poster) return new Response("Nicht gefunden", { status: 404 });
  const buf = fs.readFileSync(path.join(UPLOAD_DIR, video.poster));
  return new Response(buf, { headers: { "content-type": "image/jpeg", "cache-control": "public, max-age=86400" } });
}
