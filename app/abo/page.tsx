import { redirect } from "next/navigation";
import PlanPicker from "@/components/PlanPicker";
import Shell from "@/components/Shell";
import { FREE_VIDEOS, getViewer } from "@/lib/access";
import { stripeEnabled } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function Abo() {
  const viewer = await getViewer();
  if (viewer.subscribed) redirect("/profil");
  return (
    <Shell>
      <div className="pagehead"><h1>Alle Videos freischalten</h1></div>
      <div className="pad">
        <p className="muted" style={{ margin: 0 }}>
          Die ersten {FREE_VIDEOS} Videos sind gratis. Mit einem Abo siehst du alle Videos ohne Grenze und unterstützt die Creator.
        </p>
        <PlanPicker next="/" loggedIn={!!viewer.user} testMode={!stripeEnabled()} />
      </div>
    </Shell>
  );
}
