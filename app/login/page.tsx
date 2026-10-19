"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [err, setErr] = useState<{ error?: string; fields?: Record<string, string[]> }>({});
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); setBusy(true); setErr({});
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch(`/api/auth/${mode}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    setBusy(false);
    if (r.ok) { router.replace("/"); router.refresh(); } else setErr(await r.json());
  }
  const f = (k: string) => err.fields?.[k]?.[0] && <p className="err">{err.fields[k][0]}</p>;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-8 sm:px-6">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-ink/5 bg-cream shadow-xl md:min-h-[520px] md:grid-cols-[.9fr_1.1fr]">
        <aside className="auth-art relative isolate hidden overflow-hidden p-10 text-white md:flex md:flex-col md:justify-between">
          <div className="relative z-[1] flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/15 text-xl">☕</span><span className="text-lg font-bold">Bean Vault</span></div>
          <div className="relative z-[1] pb-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-white/65">Coffee, collected with care</p>
            <h1 className="text-4xl font-bold leading-tight">เก็บเมล็ดกาแฟ<br />บันทึกทุกความทรงจำ</h1>
            <p className="mt-4 max-w-xs text-sm leading-6 text-white/70">พื้นที่เล็ก ๆ สำหรับคนรักกาแฟและเรื่องราวจากผืนป่า</p>
          </div>
          <span className="relative z-[1] text-xs text-white/50">Cultivating your daily ritual · 🌿</span>
          <span className="absolute bottom-24 right-8 text-8xl opacity-20" aria-hidden="true">🌱</span>
        </aside>
        <section className="flex flex-col justify-center px-6 py-10 sm:px-12 md:px-14">
          <div className="mb-8 md:hidden">
            <span className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-moss text-xl text-white">☕</span>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-moss">Coffee, collected with care</p>
          </div>
          <p className="text-sm font-semibold text-moss">{mode === "login" ? "ยินดีต้อนรับกลับมา" : "เริ่มต้นบันทึกกาแฟของคุณ"}</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight">{mode === "login" ? "เข้าสู่ Bean Vault" : "สร้างบัญชีใหม่"}</h2>
          <p className="mb-7 mt-2 text-sm text-ink/60">เก็บเมล็ดกาแฟ จดทุกการชง</p>
          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && <div><label className="mb-1.5 block text-sm font-medium" htmlFor="name">ชื่อของคุณ</label><input id="name" name="name" placeholder="เช่น คุณกาแฟ" className="input" />{f("name")}</div>}
            <div><label className="mb-1.5 block text-sm font-medium" htmlFor="email">อีเมล</label><input id="email" name="email" type="email" placeholder="you@example.com" className="input" />{f("email")}</div>
            <div><label className="mb-1.5 block text-sm font-medium" htmlFor="password">รหัสผ่าน</label><input id="password" name="password" type="password" placeholder="อย่างน้อย 8 ตัว" className="input" />{f("password")}</div>
            {err.error && !err.fields && <p className="err">{err.error}</p>}
            <button className="btn w-full !py-3" disabled={busy}>{busy ? "กำลังดำเนินการ…" : mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button>
          </form>
          <button className="mt-5 text-sm font-medium text-moss hover:underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr({}); }}>
            {mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
          </button>
        </section>
      </div>
    </main>
  );
}
