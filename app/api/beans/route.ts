import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { currentUserId, unauthorized } from "@/lib/auth";
import { beanSchema, fieldErrors } from "@/lib/validation";

// GET /api/beans?q=เอธิโอเปีย&roast=LIGHT&inStock=1&sort=price&order=asc
export async function GET(req: Request) {
  const uid = await currentUserId();
  if (!uid) return unauthorized();
  const sp = new URL(req.url).searchParams;
  const q = sp.get("q")?.trim();
  const roast = sp.get("roast");
  const sort = ["name", "price", "createdAt", "remainingG"].includes(sp.get("sort") ?? "") ? sp.get("sort")! : "createdAt";
  const order = sp.get("order") === "asc" ? "asc" : "desc";
  const beans = await prisma.bean.findMany({
    where: {
      userId: uid,
      ...(roast && ["LIGHT", "MEDIUM", "DARK"].includes(roast) ? { roast } : {}),
      ...(sp.get("inStock") === "1" ? { remainingG: { gt: 0 } } : {}),
      ...(q ? { OR: ["name", "origin", "roaster", "notes"].map((f) => ({ [f]: { contains: q, mode: "insensitive" as const } })) } : {}),
    },
    orderBy: { [sort]: order },
  });
  return NextResponse.json(beans);
}

export async function POST(req: Request) {
  const uid = await currentUserId();
  if (!uid) return unauthorized();
  const p = beanSchema.safeParse(await req.json().catch(() => ({})));
  if (!p.success) return NextResponse.json(fieldErrors(p.error), { status: 400 });
  const bean = await prisma.bean.create({
    data: { ...p.data, remainingG: p.data.remainingG ?? p.data.weightG, userId: uid },
  });
  return NextResponse.json(bean, { status: 201 });
}
