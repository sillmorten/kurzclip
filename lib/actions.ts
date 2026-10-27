"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { mergeAnonViews } from "./access";
import { db, getUserByEmail } from "./db";
import { anonId, createSession, destroySession } from "./session";

export type FormState = { error?: string; email?: string; name?: string };

function safeNext(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/") && !s.startsWith("//") ? s : "/";
}

function creatorEmails() {
  return (process.env.CREATOR_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase()).filter(Boolean);
}

export async function register(_prev: FormState, form: FormData): Promise<FormState> {
  const name = String(form.get("name") ?? "").trim().slice(0, 60);
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!name) return { error: "Bitte gib deinen Namen ein.", email, name };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Diese E-Mail-Adresse sieht nicht richtig aus.", email, name };
  if (password.length < 8) return { error: "Das Passwort braucht mindestens 8 Zeichen.", email, name };
  if (getUserByEmail(email)) return { error: "Mit dieser E-Mail gibt es schon ein Konto. Melde dich an.", email, name };

  const list = creatorEmails();
  const noUsersYet = (db().prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number }).n === 0;
  const isCreator = list.length ? list.includes(email) : noUsersYet;
  const hash = await bcrypt.hash(password, 10);
  const r = db()
    .prepare("INSERT INTO users (email, name, password_hash, is_creator) VALUES (?, ?, ?, ?)")
    .run(email, name, hash, isCreator ? 1 : 0);
  const id = Number(r.lastInsertRowid);
  mergeAnonViews(await anonId(), id);
  await createSession(id);
  redirect(safeNext(form.get("next")));
}

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const user = getUserByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return { error: "E-Mail oder Passwort stimmt nicht.", email };
  }
  if (creatorEmails().includes(email) && !user.is_creator) {
    db().prepare("UPDATE users SET is_creator = 1 WHERE id = ?").run(user.id);
  }
  mergeAnonViews(await anonId(), user.id);
  await createSession(user.id);
  redirect(safeNext(form.get("next")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}
