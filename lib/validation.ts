import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "ชื่อต้องมีอย่างน้อย 2 ตัวอักษร").max(60),
  email: z.string().trim().toLowerCase().email("อีเมลไม่ถูกต้อง"),
  password: z.string().min(8, "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร").max(100),
});
export const loginSchema = registerSchema.pick({ email: true }).extend({ password: z.string().min(1, "กรอกรหัสผ่าน") });

export const beanSchema = z.object({
  name: z.string().trim().min(1, "กรอกชื่อเมล็ดกาแฟ").max(100),
  origin: z.string().trim().min(1, "กรอกแหล่งปลูก").max(100),
  roaster: z.string().trim().max(100).optional().nullable(),
  roast: z.enum(["LIGHT", "MEDIUM", "DARK"], { message: "เลือกระดับการคั่ว" }),
  process: z.string().trim().max(50).optional().nullable(),
  weightG: z.coerce.number().int("ต้องเป็นจำนวนเต็ม").min(1, "น้ำหนักต้องมากกว่า 0").max(100000),
  remainingG: z.coerce.number().int().min(0, "ห้ามติดลบ").optional(),
  price: z.coerce.number().min(0, "ราคาห้ามติดลบ").max(1000000),
  roastDate: z.coerce.date().optional().nullable().or(z.literal("").transform(() => null)),
  notes: z.string().trim().max(1000).optional().nullable(),
});

export const logSchema = z.object({
  usedG: z.coerce.number().int().min(1, "ใช้อย่างน้อย 1 กรัม").max(5000),
  method: z.string().trim().min(1, "ระบุวิธีชง").max(50),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  note: z.string().trim().max(500).optional().nullable(),
});

export const fieldErrors = (e: z.ZodError) => ({ error: "ข้อมูลไม่ถูกต้อง", fields: e.flatten().fieldErrors });
