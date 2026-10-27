import { listVideos } from "@/lib/db";
import { gradientFor } from "@/lib/format";
import AuthForm from "./AuthForm";
import Logo from "./Logo";

export default async function AuthPage({ mode, next }: { mode: "login" | "register"; next: string }) {
  const videos = listVideos("neu").slice(0, 12);
  const tiles = Array.from({ length: 12 }, (_, i) => videos[i % Math.max(1, videos.length)]);
  return (
    <div className="app">
      <div className="auth">
        <div className="mosaic" aria-hidden="true">
          {tiles.map((v, i) =>
            v?.poster ? (
              <i key={i} style={{ backgroundImage: `url(/api/poster/${v.id})` }} />
            ) : (
              <i key={i} className={gradientFor(v?.id ?? i)} />
            )
          )}
        </div>
        <div className="fade" />
        <div className="hero">
          <Logo size={26} />
          <h1>Gute Ideen in unter einer Minute.</h1>
          <p>
            {mode === "login"
              ? "Melde dich an, damit deine Gratis-Videos und dein Abo auf jedem Gerät gelten."
              : "Erstelle ein Konto, um alle Videos freizuschalten und deine Lieblingsvideos zu merken."}
          </p>
          <AuthForm mode={mode} next={next} />
          <p className="fine">Mit der Anmeldung akzeptierst du die AGB und die Datenschutzerklärung.</p>
        </div>
      </div>
    </div>
  );
}
