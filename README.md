# kurzclip

Eine Plattform für kurze Videos (höchstens 1 Minute). Creator laden Videos hoch, Zuschauer sehen die ersten 4 Videos gratis, ab dem fünften brauchen sie ein Abo.

## Was die App kann

- **Feed** mit den Reitern „Neu“ und „Beliebt“. Oben steht, wie viele Gratis-Videos noch übrig sind. Gesperrte Videos sind unscharf und tragen ein Schloss.
- **Video-Player** im Vollbild hochkant: Herz, Teilen, Fortschrittsbalken. Zum nächsten Video wischt man nach oben (am Computer mit den Pfeiltasten).
- **Paywall ab Video 5** mit Monats- oder Jahresabo über Stripe. Die Sperre gilt auch auf dem Server: Ohne Freigabe liefert er die Videodatei nicht aus.
- **Gratis-Zähler** auch ohne Konto (per Cookie). Wer sich anmeldet, nimmt die schon gesehenen Videos ins Konto mit.
- **Login** mit E-Mail und Passwort.
- **Upload** für Creator: Vorschau, Filmstreifen und eine 60-Sekunden-Prüfung im Browser. Bei MP4 und MOV prüft der Server die Länge noch einmal selbst.
- **Creator-Studio** mit Videos, Aufrufen und Abos. Videos lassen sich dort auch löschen.
- **Gemerkt**: alle Videos, die man mit einem Herz markiert hat.
- **Profil**: Abo-Status, Abo verwalten (Stripe-Kundenportal), Abmelden.

## Klick-Demo auf GitHub Pages

Im Ordner `demo/` liegt eine klickbare Demo der App, die ohne Server läuft. Bei jeder Änderung auf `main` veröffentlicht GitHub sie automatisch unter `https://sillmorten.github.io/kurzclip/app/`. Dort lässt sie sich auf dem Handy auch über „App installieren“ bzw. „Zum Home-Bildschirm“ installieren.

Einmalig einschalten: im Repo unter **Settings → Pages** bei „Source“ **GitHub Actions** wählen.

## Lokal starten

Voraussetzung ist Node.js 20 oder neuer.

```bash
npm install
cp .env.example .env      # Werte eintragen, mindestens AUTH_SECRET
npm run dev
```

Dann <http://localhost:3000> öffnen. **Das erste Konto, das du registrierst, wird automatisch zum Creator** und darf Videos hochladen. Möchtest du das festlegen, trag die E-Mail-Adressen in `CREATOR_EMAILS` ein.

Ohne Stripe-Schlüssel läuft die Bezahlung im **Testmodus**: Ein Klick auf „Weiter zur Zahlung“ schaltet das Abo ohne Zahlung frei. So lässt sich alles ausprobieren.

## Stripe einrichten (echte Zahlungen)

1. Konto auf <https://dashboard.stripe.com> anlegen.
2. Unter **Produktkatalog** ein Produkt „kurzclip Abo“ mit zwei wiederkehrenden Preisen anlegen: 4,99 € monatlich und 39,99 € jährlich. Die beiden Preis-IDs (`price_…`) in `STRIPE_PRICE_MONTHLY` und `STRIPE_PRICE_YEARLY` eintragen.
3. Unter **Entwickler → API-Schlüssel** den geheimen Schlüssel (`sk_…`) in `STRIPE_SECRET_KEY` eintragen.
4. Unter **Entwickler → Webhooks** einen Endpunkt `https://deine-domain.de/api/stripe/webhook` anlegen, mit den Ereignissen `checkout.session.completed`, `customer.subscription.updated` und `customer.subscription.deleted`. Das Signatur-Geheimnis (`whsec_…`) in `STRIPE_WEBHOOK_SECRET` eintragen.
5. Unter **Einstellungen → Billing → Kundenportal** das Portal aktivieren, damit Abonnenten selbst kündigen können.

Zum Testen erst mit den Test-Schlüsseln arbeiten (Testkarte `4242 4242 4242 4242`). Lokal leitet `stripe listen --forward-to localhost:3000/api/stripe/webhook` die Webhooks weiter.

Wenn du die Preise änderst, pass auch die Anzeige in `components/PlanPicker.tsx` und `lib/stripe.ts` an.

## Online stellen

Die App speichert Datenbank (SQLite) und Videos im Ordner `DATA_DIR`. Sie braucht deshalb einen Server mit **dauerhaftem Speicher**. Vercel passt dafür nicht, gut geeignet sind zum Beispiel:

- **Railway** oder **Render**: Repo verbinden, ein Volume unter `/data` einhängen und `DATA_DIR=/data` setzen. Das `Dockerfile` wird automatisch erkannt.
- **Eigener Server (VPS)**, z. B. Hetzner: `docker build -t kurzclip .` und `docker run -p 3000:3000 -v kurzclip-data:/data --env-file .env kurzclip`

In der Produktion müssen `AUTH_SECRET` und `APP_URL` gesetzt sein, und die Seite muss über HTTPS laufen.

## Aufbau

| Ordner | Inhalt |
| --- | --- |
| `app/` | Seiten und API-Routen (Next.js App Router) |
| `app/api/media/[id]` | liefert Videos aus und prüft dabei die Paywall |
| `app/api/checkout`, `app/api/stripe/webhook` | Bezahlung |
| `components/` | Player, Paywall, Upload, Feed-Karten, Navigation |
| `lib/access.ts` | die Paywall-Regel: gratis, solange weniger als 4 Videos gesehen, sonst nur mit Abo |
| `lib/db.ts` | Datenbank-Tabellen `users`, `videos`, `views`, `likes`, `subscriptions` |

## Wenn es größer wird

Für viele Zuschauer lohnt es sich, die Videos zu einem Streaming-Dienst wie Mux oder Cloudflare Stream auszulagern und die Datenbank auf Postgres umzustellen. Die Paywall-Regel in `lib/access.ts` bleibt dabei gleich.
