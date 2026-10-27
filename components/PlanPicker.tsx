"use client";
import Link from "next/link";
import { useState } from "react";

const PLANS = [
  { key: "monatlich", label: "Monatlich", note: "jederzeit kündbar", price: "4,99 €", per: "pro Monat" },
  { key: "jaehrlich", label: "Jährlich", note: "2 Monate geschenkt", price: "39,99 €", per: "pro Jahr", badge: "−33 %" },
] as const;

export default function PlanPicker({ next, loggedIn, testMode }: { next: string; loggedIn: boolean; testMode: boolean }) {
  const [plan, setPlan] = useState<"monatlich" | "jaehrlich">("monatlich");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function checkout() {
    setBusy(true);
    setError(null);
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ plan, next }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok && data.url) { window.location.href = data.url; return; }
    setError(data.error ?? "Die Zahlung konnte nicht gestartet werden. Versuch es gleich noch einmal.");
    setBusy(false);
  }

  return (
    <>
      {PLANS.map((p) => (
        <button key={p.key} type="button" className="plan" aria-pressed={plan === p.key} onClick={() => setPlan(p.key)}>
          <div><b>{p.label}{"badge" in p ? <span className="badge">{p.badge}</span> : null}</b><small>{p.note}</small></div>
          <div className="pr">{p.price}<small>{p.per}</small></div>
        </button>
      ))}
      {error ? <p className="err" role="alert">{error}</p> : null}
      {loggedIn ? (
        <button className="cta" onClick={checkout} disabled={busy}>{busy ? "Einen Moment …" : "Weiter zur Zahlung"}</button>
      ) : (
        <>
          <Link className="cta" href={`/registrieren?next=${encodeURIComponent(next)}`}>Konto erstellen und freischalten</Link>
          <Link className="cta alt" href={`/login?next=${encodeURIComponent(next)}`}>Schon ein Konto? Anmelden</Link>
        </>
      )}
      <p className="fine">
        {testMode
          ? "Testmodus: Stripe ist noch nicht eingerichtet, das Abo wird ohne Zahlung freigeschaltet."
          : "Sicher bezahlen über Stripe · Karte, Apple Pay, Google Pay"}
      </p>
    </>
  );
}
