# Bean Vault – คลังเมล็ดกาแฟ

Next.js 15 (App Router) · React 19 · Tailwind · Prisma + Postgres · JWT cookie auth · Zod validation

## รันในเครื่อง
1. `cp .env.example .env` แล้วใส่ `DATABASE_URL` (Neon pooled URL), `DATABASE_URL_UNPOOLED` (Neon direct URL) และ `AUTH_SECRET`
2. `npm install`
3. `npm run db:push` เพื่อสร้าง/อัปเดตตารางในฐานข้อมูล
4. `npm run dev`

## Deploy บน Vercel
1. Push โค้ดขึ้น GitHub แล้ว Import เข้า Vercel
2. ที่ Storage เลือกเพิ่ม Postgres (Neon) หรือใส่ connection strings เอง
3. ตั้ง Environment Variables: `DATABASE_URL` เป็น pooled URL, `DATABASE_URL_UNPOOLED` เป็น direct URL และ `AUTH_SECRET`
4. รัน `npm run db:push` จากเครื่องที่ตั้งค่า URL ทั้งสองแล้ว เพื่อสร้าง/อัปเดตตารางก่อน deploy
5. Deploy (build จะสร้าง Prisma Client และ build Next.js โดยไม่เชื่อมฐานข้อมูล)

## API (ต้องล็อกอิน – ใช้คุกกี้ `bv_session`)
| Method | Path | หน้าที่ |
|---|---|---|
| POST | /api/auth/register, /login, /logout | สมัคร / เข้าสู่ระบบ / ออก |
| GET | /api/beans?q=&roast=&inStock=1&sort=&order= | รายการ + ค้นหา + กรอง |
| POST | /api/beans | เพิ่ม |
| GET / PUT / DELETE | /api/beans/:id | ดู / แก้ไข / ลบ |
| GET / POST | /api/beans/:id/logs | ประวัติการชง (POST หักน้ำหนักคงเหลือ) |
