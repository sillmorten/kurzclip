import Link from "next/link";
import { BackIcon } from "./icons";
import PlanPicker from "./PlanPicker";

type Props = {
  videoId: number;
  poster: string | null;
  gradient: string;
  position: number;
  freeVideos: number;
  loggedIn: boolean;
  testMode: boolean;
};

export default function Paywall({ videoId, poster, gradient, position, freeVideos, loggedIn, testMode }: Props) {
  return (
    <div className="player">
      {poster ? <img className="bgfill blur" src={poster} alt="" /> : <div className={`bgfill blur ${gradient}`} />}
      <div className="shade" />
      <div className="top">
        <Link href="/" className="back"><BackIcon />Feed</Link>
        <span className="chip r">Video {position}</span>
      </div>
      <div className="sheet" role="dialog" aria-labelledby="pw-title">
        <div className="grab" />
        <div className="dots" aria-hidden="true">
          {Array.from({ length: freeVideos }, (_, i) => <i key={i} />)}
          <i className="x" />
        </div>
        <h2 id="pw-title">Deine {freeVideos} Gratis-Videos sind aufgebraucht</h2>
        <p>Mit einem Abo siehst du alle Videos ohne Grenze und unterstützt die Creator.</p>
        <PlanPicker next={`/v/${videoId}`} loggedIn={loggedIn} testMode={testMode} />
      </div>
    </div>
  );
}
