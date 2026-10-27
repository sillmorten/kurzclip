"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { fmtDuration } from "@/lib/format";

const MAX = 60;
const FRAMES = 8;

type Picked = { file: File; url: string; duration: number; frames: string[]; poster: Blob | null };

/** Liest Länge, Vorschaubild und Filmstreifen im Browser aus. */
async function inspect(file: File): Promise<Picked> {
  const url = URL.createObjectURL(file);
  const v = document.createElement("video");
  v.muted = true;
  v.playsInline = true;
  v.preload = "auto";
  v.src = url;
  await new Promise<void>((res, rej) => {
    v.onloadedmetadata = () => res();
    v.onerror = () => rej(new Error("Dieses Video kann der Browser nicht lesen."));
  });
  // Manche Browser kennen die Länge von WebM erst nach einem Sprung ans Ende.
  if (!Number.isFinite(v.duration)) {
    v.currentTime = 1e7;
    await new Promise((r) => (v.ondurationchange = r));
  }
  const duration = v.duration;
  const canvas = document.createElement("canvas");
  const w = 180;
  const h = Math.round((w * (v.videoHeight || 320)) / (v.videoWidth || 180));
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const seek = (t: number) =>
    new Promise<void>((r) => {
      v.onseeked = () => r();
      v.currentTime = t;
    });
  const frames: string[] = [];
  for (let i = 0; i < FRAMES; i++) {
    await seek(Math.min(duration - 0.05, (duration / FRAMES) * (i + 0.5)));
    ctx.drawImage(v, 0, 0, w, h);
    frames.push(canvas.toDataURL("image/jpeg", 0.6));
  }
  // Vorschaubild in besserer Qualität
  await seek(Math.min(duration * 0.15, 1.5));
  const pc = document.createElement("canvas");
  pc.width = 540;
  pc.height = Math.round((540 * (v.videoHeight || 960)) / (v.videoWidth || 540));
  pc.getContext("2d")!.drawImage(v, 0, 0, pc.width, pc.height);
  const poster = await new Promise<Blob | null>((r) => pc.toBlob(r, "image/jpeg", 0.82));
  return { file, url, duration, frames, poster };
}

export default function Uploader() {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [picked, setPicked] = useState<Picked | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [over, setOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reading, setReading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);

  useEffect(() => () => { if (picked) URL.revokeObjectURL(picked.url); }, [picked]);

  async function choose(file: File | undefined) {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith("video/")) { setError("Das ist keine Videodatei."); return; }
    setReading(true);
    try {
      const p = await inspect(file);
      setPicked(p);
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, "").slice(0, 80));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Das Video ließ sich nicht öffnen.");
    } finally {
      setReading(false);
    }
  }

  const tooLong = !!picked && picked.duration > MAX + 0.5;

  function upload() {
    if (!picked || tooLong) return;
    if (!title.trim()) { setError("Bitte gib dem Video einen Titel."); return; }
    setError(null);
    const fd = new FormData();
    fd.append("video", picked.file);
    if (picked.poster) fd.append("poster", picked.poster, "poster.jpg");
    fd.append("title", title.trim());
    fd.append("description", desc.trim());
    fd.append("duration", String(picked.duration));
    // XHR statt fetch, damit wir einen Fortschrittsbalken zeigen können.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/videos");
    xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(e.loaded / e.total);
    xhr.onload = () => {
      let data: { id?: number; error?: string } = {};
      try { data = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status === 200 && data.id) { router.push("/studio"); router.refresh(); return; }
      setProgress(null);
      setError(data.error ?? "Das Hochladen hat nicht geklappt. Versuch es noch einmal.");
    };
    xhr.onerror = () => { setProgress(null); setError("Keine Verbindung zum Server. Prüfe dein Internet und versuch es noch einmal."); };
    setProgress(0);
    xhr.send(fd);
  }

  return (
    <div className="app">
      <div className="top">
        <Link href="/studio" aria-label="Abbrechen" style={{ fontWeight: 700, fontSize: 18 }}>✕</Link>
        <b>Neues Video</b>
        <span className="chip r">max. 1:00</span>
      </div>
      <div className="pad">
        {!picked ? (
          <label
            className={`drop ${over ? "over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); choose(e.dataTransfer.files[0]); }}
          >
            <b>{reading ? "Video wird gelesen …" : "Video auswählen oder hierher ziehen"}</b>
            <span>Auf dem Handy kannst du auch direkt aufnehmen.</span>
            <span className="chip r">höchstens 60 Sekunden · MP4, MOV oder WebM</span>
            <input ref={input} id="video" type="file" accept="video/mp4,video/quicktime,video/webm,video/*" hidden onChange={(e) => choose(e.target.files?.[0])} />
          </label>
        ) : (
          <>
            <div className="prev"><video src={picked.url} controls playsInline poster={picked.frames[1]} /></div>
            <div>
              <div className={`trimbar ${tooLong ? "bad" : ""}`}>
                {picked.frames.map((f, i) => <img key={i} src={f} alt="" />)}
              </div>
              <div className="trimrow">
                <span>0:00</span>
                <b className={tooLong ? "bad" : ""}>{fmtDuration(picked.duration)} · {tooLong ? "zu lang" : "passt"}</b>
                <span>1:00</span>
              </div>
            </div>
            {tooLong ? (
              <p className="err">Das Video ist {Math.round(picked.duration)} Sekunden lang. Kürze es auf höchstens eine Minute, zum Beispiel in der Fotos-App, und wähle es dann neu aus.</p>
            ) : null}
            <button className="del" style={{ alignSelf: "flex-start" }} onClick={() => { setPicked(null); setError(null); }}>Anderes Video wählen</button>
          </>
        )}

        <div className="field">
          <label className="lbl" htmlFor="title">Titel</label>
          <input className="inp" id="title" value={title} maxLength={80} onChange={(e) => setTitle(e.target.value)} placeholder="Worum geht es?" />
        </div>
        <div className="field">
          <label className="lbl" htmlFor="desc">Beschreibung (optional)</label>
          <textarea className="inp" id="desc" value={desc} maxLength={300} onChange={(e) => setDesc(e.target.value)} placeholder="Ein, zwei Sätze zum Video" />
        </div>
        {error ? <p className="err" role="alert">{error}</p> : null}
        {progress !== null ? (
          <div>
            <div className="bar"><i style={{ width: `${Math.round(progress * 100)}%` }} /></div>
            <p className="fine" style={{ marginTop: 6 }}>{progress < 1 ? `Wird hochgeladen … ${Math.round(progress * 100)} %` : "Wird gespeichert …"}</p>
          </div>
        ) : null}
        <button className="cta" onClick={upload} disabled={!picked || tooLong || progress !== null}>Veröffentlichen</button>
      </div>
    </div>
  );
}
