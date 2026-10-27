type P = { className?: string };
const s = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const LockIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const HeartIcon = ({ filled, ...p }: P & { filled?: boolean }) => (
  <svg viewBox="0 0 24 24" fill={filled ? "currentColor" : "#fff"} {...p}>
    <path d="M12 21s-7.5-4.6-9.5-9.2C1 8.3 3.3 5 6.6 5c2 0 3.6 1.1 4.4 2.6h2C13.8 6.1 15.4 5 17.4 5c3.3 0 5.6 3.3 4.1 6.8C19.5 16.4 12 21 12 21z" />
  </svg>
);
export const ShareIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} stroke="#fff" strokeWidth={2.2} {...p}><path d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M12 3v12M7 8l5-5 5 5" /></svg>
);
export const PlayIcon = (p: P) => (
  <svg viewBox="0 0 24 24" fill="#fff" width="30" height="30" {...p}><path d="M8 5v14l11-7z" /></svg>
);
export const HomeIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} {...p}><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
);
export const FlameIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} {...p}><path d="M12 22c4 0 7-2.7 7-7 0-4-3-6-4-9-1 2-2 3-4 3 0-2-1-4-2-6-2 3-4 6-4 12 0 4.3 3 7 7 7z" /></svg>
);
export const BookmarkIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} {...p}><path d="M6 3h12v18l-6-4-6 4z" /></svg>
);
export const UserIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4-6 8-6s7 2 8 6" /></svg>
);
export const PlusIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} strokeWidth={2.6} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const BackIcon = (p: P) => (
  <svg viewBox="0 0 24 24" {...s} width="20" height="20" {...p}><path d="M15 5l-7 7 7 7" /></svg>
);
