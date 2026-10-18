import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { COOKIE, signSession } from "@/lib/auth";
import { loginSchema, fieldErrors } from "@/lib/validation";

export async function POST(req: Request) {
  const p = loginSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json(fieldErrors(p.error), { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: p.data.email } });
  if (!user || !(await bcrypt.compare(p.data.password, user.password)))
    return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  const res = NextResponse.json({ id: user.id, name: user.name });
  res.cookies.set(COOKIE, await signSession(user.id), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 604800 });
  return res;
}
