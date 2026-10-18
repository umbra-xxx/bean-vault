import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { COOKIE, signSession } from "@/lib/auth";
import { registerSchema, fieldErrors } from "@/lib/validation";

export async function POST(req: Request) {
  const p = registerSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json(fieldErrors(p.error), { status: 400 });
  if (await prisma.user.findUnique({ where: { email: p.data.email } }))
    return NextResponse.json({ error: "อีเมลนี้ถูกใช้แล้ว" }, { status: 409 });
  const user = await prisma.user.create({
    data: { ...p.data, password: await bcrypt.hash(p.data.password, 10) },
  });
  const res = NextResponse.json({ id: user.id, name: user.name }, { status: 201 });
  res.cookies.set(COOKIE, await signSession(user.id), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 604800 });
  return res;
}
