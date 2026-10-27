"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookmarkIcon, FlameIcon, HomeIcon, PlusIcon, UserIcon } from "./icons";

export default function BottomNav({ isCreator }: { isCreator: boolean }) {
  const path = usePathname();
  const cur = (href: string) => (path === href ? "page" : undefined);
  return (
    <nav className="nav" aria-label="Hauptnavigation">
      <Link href="/" aria-current={cur("/")}><HomeIcon />Feed</Link>
      <Link href="/beliebt" aria-current={cur("/beliebt")}><FlameIcon />Beliebt</Link>
      {isCreator ? (
        <Link href="/studio/neu" aria-label="Neues Video"><span className="plus"><PlusIcon /></span></Link>
      ) : null}
      <Link href="/gemerkt" aria-current={cur("/gemerkt")}><BookmarkIcon />Gemerkt</Link>
      <Link href="/profil" aria-current={path.startsWith("/profil") || path.startsWith("/studio") ? "page" : undefined}><UserIcon />Profil</Link>
    </nav>
  );
}
