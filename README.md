# Bean Vault – คลังเมล็ดกาแฟ นายภราดา สว่างไพศาลกุล 673450198-8

Next.js 15 (App Router) · React 19 · Tailwind · Prisma + Postgres · JWT cookie auth · Zod validation

## รันในเครื่อง
1. `cp .env.example .env` แล้วใส่ `DATABASE_URL` (Postgres เช่น Neon) และ `AUTH_SECRET`
2. `npm install`
3. `npx prisma db push`
4. `npm run dev`

## Deploy บน Vercel
1. Push โค้ดขึ้น GitHub แล้ว Import เข้า Vercel
2. ที่ Storage เลือกเพิ่ม Postgres (Neon) หรือใส่ `DATABASE_URL` เอง
3. ตั้ง Environment Variables: `DATABASE_URL`, `AUTH_SECRET`
4. Deploy (สคริปต์ build จะสร้างตารางให้อัตโนมัติด้วย `prisma db push`)

## API (ต้องล็อกอิน – ใช้คุกกี้ `bv_session`)
| Method | Path | หน้าที่ |
|---|---|---|
| POST | /api/auth/register, /login, /logout | สมัคร / เข้าสู่ระบบ / ออก |
| GET | /api/beans?q=&roast=&inStock=1&sort=&order= | รายการ + ค้นหา + กรอง |
| POST | /api/beans | เพิ่ม |
| GET / PUT / DELETE | /api/beans/:id | ดู / แก้ไข / ลบ |
| GET / POST | /api/beans/:id/logs | ประวัติการชง (POST หักน้ำหนักคงเหลือ) |
