import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUserId, unauthorized } from "@/lib/auth";
import { beanSchema, fieldErrors } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };
const find = async (id: string, uid: string) => prisma.bean.findFirst({ where: { id, userId: uid } });
const notFound = () => NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });

export async function GET(_: Request, { params }: Ctx) {
  const uid = await currentUserId(); if (!uid) return unauthorized();
  const bean = await prisma.bean.findFirst({ where: { id: (await params).id, userId: uid }, include: { logs: { orderBy: { createdAt: "desc" } } } });
  return bean ? NextResponse.json(bean) : notFound();
}

export async function PUT(req: Request, { params }: Ctx) {
  const uid = await currentUserId(); if (!uid) return unauthorized();
  const { id } = await params;
  if (!(await find(id, uid))) return notFound();
  const p = beanSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json(fieldErrors(p.error), { status: 400 });
  return NextResponse.json(await prisma.bean.update({ where: { id }, data: p.data }));
}

export async function DELETE(_: Request, { params }: Ctx) {
  const uid = await currentUserId(); if (!uid) return unauthorized();
  const { id } = await params;
  if (!(await find(id, uid))) return notFound();
  await prisma.bean.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
