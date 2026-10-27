import Link from "next/link";

export default function NotFound() {
  return (
    <div className="app">
      <div className="empty" style={{ paddingTop: 120 }}>
        <h1 style={{ color: "var(--fg)" }}>Dieses Video gibt es nicht mehr.</h1>
        <Link className="cta" href="/">Zum Feed</Link>
      </div>
    </div>
  );
}
