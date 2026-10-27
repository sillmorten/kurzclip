import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { getUserById, type User } from "./db";

const COOKIE = "kc_session";
export const ANON_COOKIE = "kc_anon";

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") throw new Error("AUTH_SECRET fehlt in der .env-Datei");
    return new TextEncoder().encode("dev-secret-nur-lokal-verwenden");
  }
  return new TextEncoder().encode(s);
}

export async function createSession(userId: number) {
  const token = await new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return getUserById(Number(payload.uid)) ?? null;
  } catch {
    return null;
  }
}

export async function anonId() {
  return (await cookies()).get(ANON_COOKIE)?.value ?? null;
}
