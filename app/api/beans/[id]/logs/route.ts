import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUserId, unauthorized } from "@/lib/auth";
import { logSchema, fieldErrors } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Ctx) {
  const uid = await currentUserId(); if (!uid) return unauthorized();
  const logs = await prisma.beanLog.findMany({
    where: { beanId: (await params).id, bean: { userId: uid } }, orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(logs);
}

// บันทึกการใช้เมล็ด -> หักน้ำหนักคงเหลืออัตโนมัติ
export async function POST(req: Request, { params }: Ctx) {
  const uid = await currentUserId(); if (!uid) return unauthorized();
  const { id } = await params;
  const bean = await prisma.bean.findFirst({ where: { id, userId: uid } });
  if (!bean) return NextResponse.json({ error: "ไม่พบข้อมูล" }, { status: 404 });
  const p = logSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json(fieldErrors(p.error), { status: 400 });
  if (p.data.usedG > bean.remainingG)
    return NextResponse.json({ error: `เหลือเพียง ${bean.remainingG} กรัม` }, { status: 400 });
  const [log] = await prisma.$transaction([
    prisma.beanLog.create({ data: { ...p.data, beanId: id } }),
    prisma.bean.update({ where: { id }, data: { remainingG: { decrement: p.data.usedG } } }),
  ]);
  return NextResponse.json(log, { status: 201 });
}
