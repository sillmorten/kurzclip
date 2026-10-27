export function fmtDuration(sec: number) {
  const s = Math.round(sec);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function fmtCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toLocaleString("de-DE", { maximumFractionDigits: 1 })} Tsd.`;
  return String(n);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const GRADIENTS = ["g1", "g2", "g3", "g4", "g5", "g6"];
export function gradientFor(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

export function plural(n: number, one: string, many: string) {
  return `${fmtCount(n)} ${n === 1 ? one : many}`;
}
