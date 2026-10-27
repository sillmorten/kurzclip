"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteButton({ id }: { id: number }) {
  const router = useRouter();
  const [ask, setAsk] = useState(false);
  if (!ask) return <button className="del" onClick={() => setAsk(true)}>Löschen</button>;
  return (
    <span style={{ display: "flex", gap: 8 }}>
      <button className="del" onClick={() => setAsk(false)}>Abbrechen</button>
      <button
        className="del"
        style={{ color: "var(--rec)" }}
        onClick={async () => {
          await fetch(`/api/videos/${id}`, { method: "DELETE" });
          router.refresh();
        }}
      >
        Endgültig löschen
      </button>
    </span>
  );
}
