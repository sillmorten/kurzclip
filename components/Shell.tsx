import BottomNav from "./BottomNav";
import { currentUser } from "@/lib/session";

export default async function Shell({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  return (
    <div className="app">
      <main className="main">{children}</main>
      <BottomNav isCreator={!!user?.is_creator} />
    </div>
  );
}
