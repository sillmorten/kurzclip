import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { getViewer, mayStream } from "@/lib/access";
import { UPLOAD_DIR, getVideo } from "@/lib/db";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const video = getVideo(Number((await params).id));
  if (!video) return new Response("Nicht gefunden", { status: 404 });
  const viewer = await getViewer();
  if (!mayStream(viewer, video.id)) return new Response("Dieses Video ist nur mit Abo verfügbar", { status: 402 });

  const file = path.join(UPLOAD_DIR, video.file);
  const size = fs.statSync(file).size;
  const range = req.headers.get("range");
  const headers: Record<string, string> = {
    "content-type": video.mime,
    "accept-ranges": "bytes",
    "cache-control": "private, no-store",
  };

  if (range) {
    const m = /bytes=(\d*)-(\d*)/.exec(range);
    let start = m && m[1] ? Number(m[1]) : 0;
    let end = m && m[2] ? Number(m[2]) : size - 1;
    if (m && !m[1] && m[2]) { start = size - Number(m[2]); end = size - 1; }
    if (start >= size || end >= size || start > end) {
      return new Response(null, { status: 416, headers: { "content-range": `bytes */${size}` } });
    }
    const stream = fs.createReadStream(file, { start, end });
    return new Response(Readable.toWeb(stream) as ReadableStream, {
      status: 206,
      headers: { ...headers, "content-range": `bytes ${start}-${end}/${size}`, "content-length": String(end - start + 1) },
    });
  }
  const stream = fs.createReadStream(file);
  return new Response(Readable.toWeb(stream) as ReadableStream, { headers: { ...headers, "content-length": String(size) } });
}
