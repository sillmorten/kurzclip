import { NextResponse, type NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  if (req.cookies.get("kc_anon")) return NextResponse.next();
  // Damit auch Zuschauer ohne Konto einen Gratis-Zähler haben, bekommt jeder Browser eine zufällige ID.
  const id = crypto.randomUUID();
  req.cookies.set("kc_anon", id);
  const res = NextResponse.next({ request: { headers: req.headers } });
  res.cookies.set("kc_anon", id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

export const config = { matcher: ["/((?!_next/|favicon|api/poster|sw.js|manifest|icon-|apple-touch).*)"] };
