import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { UPLOAD_DIR, db } from "@/lib/db";
import { mp4Duration } from "@/lib/mp4";
import { currentUser } from "@/lib/session";

const MAX_SECONDS = 60;
const MAX_BYTES = 300 * 1024 * 1024;
const TYPES: Record<string, string> = { "video/mp4": "mp4", "video/quicktime": "mov", "video/webm": "webm" };

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user?.is_creator) return Response.json({ error: "Nur Creator dürfen Videos hochladen." }, { status: 403 });

  const form = await req.formData();
  const file = form.get("video");
  const poster = form.get("poster");
  const title = String(form.get("title") ?? "").trim().slice(0, 80);
  const description = String(form.get("description") ?? "").trim().slice(0, 300);
  const clientDuration = Number(form.get("duration"));

  if (!(file instanceof File) || file.size === 0) return Response.json({ error: "Bitte wähle ein Video aus." }, { status: 400 });
  if (!title) return Response.json({ error: "Bitte gib dem Video einen Titel." }, { status: 400 });
  const ext = TYPES[file.type];
  if (!ext) return Response.json({ error: "Dieses Format geht nicht. Erlaubt sind MP4, MOV und WebM." }, { status: 400 });
  if (file.size > MAX_BYTES) return Response.json({ error: "Das Video ist größer als 300 MB." }, { status: 400 });

  const buf = Buffer.from(await file.arrayBuffer());
  // Bei MP4/MOV lesen wir die Dauer selbst aus der Datei, bei WebM verlassen wir uns auf den Browser.
  const duration = ext === "webm" ? clientDuration : mp4Duration(buf) ?? clientDuration;
  if (!Number.isFinite(duration) || duration <= 0) return Response.json({ error: "Die Länge des Videos ließ sich nicht lesen." }, { status: 400 });
  if (duration > MAX_SECONDS + 0.5) {
    return Response.json({ error: `Das Video ist ${Math.round(duration)} Sekunden lang. Erlaubt ist höchstens 1 Minute.` }, { status: 400 });
  }

  const base = crypto.randomUUID();
  fs.writeFileSync(path.join(UPLOAD_DIR, `${base}.${ext}`), buf);
  let posterName: string | null = null;
  if (poster instanceof File && poster.size > 0 && poster.size < 5 * 1024 * 1024) {
    posterName = `${base}.jpg`;
    fs.writeFileSync(path.join(UPLOAD_DIR, posterName), Buffer.from(await poster.arrayBuffer()));
  }

  const r = db()
    .prepare("INSERT INTO videos (creator_id, title, description, duration, file, mime, poster) VALUES (?, ?, ?, ?, ?, ?, ?)")
    .run(user.id, title, description, duration, `${base}.${ext}`, file.type, posterName);
  return Response.json({ id: Number(r.lastInsertRowid) });
}
