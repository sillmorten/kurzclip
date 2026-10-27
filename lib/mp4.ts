/** Liest die Dauer (Sekunden) aus dem mvhd-Block einer MP4/MOV-Datei. Gibt null zurück, wenn nicht gefunden. */
export function mp4Duration(buf: Buffer): number | null {
  const tag = Buffer.from("mvhd");
  let i = buf.indexOf(tag);
  while (i !== -1) {
    const p = i + 4;
    if (p + 32 <= buf.length) {
      const version = buf[p];
      if (version === 0) {
        const timescale = buf.readUInt32BE(p + 12);
        const duration = buf.readUInt32BE(p + 16);
        if (timescale > 0) return duration / timescale;
      } else if (version === 1) {
        const timescale = buf.readUInt32BE(p + 20);
        const duration = Number(buf.readBigUInt64BE(p + 24));
        if (timescale > 0) return duration / timescale;
      }
    }
    i = buf.indexOf(tag, i + 4);
  }
  return null;
}
