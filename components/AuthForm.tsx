"use client";
import Link from "next/link";
import { useActionState } from "react";
import { login, register, type FormState } from "@/lib/actions";

export default function AuthForm({ mode, next }: { mode: "login" | "register"; next: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(mode === "login" ? login : register, {});
  const q = next !== "/" ? `?next=${encodeURIComponent(next)}` : "";
  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input type="hidden" name="next" value={next} />
      {mode === "register" ? (
        <input className="inp" id="name" name="name" placeholder="Dein Name" autoComplete="name" defaultValue={state.name} required />
      ) : null}
      <input className="inp" id="email" name="email" type="email" placeholder="E-Mail-Adresse" autoComplete="email" defaultValue={state.email} required />
      <input
        className="inp" id="password" name="password" type="password" required minLength={mode === "register" ? 8 : undefined}
        placeholder={mode === "register" ? "Passwort (mind. 8 Zeichen)" : "Passwort"}
        autoComplete={mode === "register" ? "new-password" : "current-password"}
      />
      {state.error ? <p className="err" role="alert">{state.error}</p> : null}
      <button className="cta" disabled={pending}>{pending ? "Einen Moment …" : mode === "login" ? "Anmelden" : "Konto erstellen"}</button>
      <div className="or">oder</div>
      {mode === "login" ? (
        <Link className="cta alt" href={`/registrieren${q}`}>Neues Konto erstellen</Link>
      ) : (
        <Link className="cta alt" href={`/login${q}`}>Ich habe schon ein Konto</Link>
      )}
    </form>
  );
}
