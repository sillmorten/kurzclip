import { redirect } from "next/navigation";
import Uploader from "@/components/Uploader";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function Neu() {
  const user = await currentUser();
  if (!user) redirect("/login?next=/studio/neu");
  if (!user.is_creator) redirect("/profil");
  return <Uploader />;
}
