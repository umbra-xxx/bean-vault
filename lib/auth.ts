import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me");
export const COOKIE = "bv_session";

export async function signSession(userId: string) {
  return new SignJWT({ sub: userId }).setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d").sign(secret());
}
export async function verifySession(token?: string) {
  if (!token) return null;
  try { return (await jwtVerify(token, secret())).payload.sub as string; } catch { return null; }
}
export async function currentUserId() {
  return verifySession((await cookies()).get(COOKIE)?.value);
}
export const unauthorized = () => NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
