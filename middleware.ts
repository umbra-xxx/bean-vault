import { NextRequest, NextResponse } from "next/server";
import { verifySession, COOKIE } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  const ok = await verifySession(req.cookies.get(COOKIE)?.value);
  const { pathname } = req.nextUrl;
  if (!ok && pathname === "/") return NextResponse.redirect(new URL("/login", req.url));
  if (ok && pathname === "/login") return NextResponse.redirect(new URL("/", req.url));
  return NextResponse.next();
}
export const config = { matcher: ["/", "/login"] };
