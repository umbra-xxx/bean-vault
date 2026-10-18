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
    <main className="mx-auto grid min-h-screen max-w-sm content-center px-5">
      <h1 className="text-3xl font-bold">Bean Vault</h1>
      <p className="mb-6 mt-1 text-sm text-ink/70">เก็บเมล็ดกาแฟ จดทุกการชง</p>
      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && <div><input name="name" placeholder="ชื่อของคุณ" className="input" />{f("name")}</div>}
        <div><input name="email" type="email" placeholder="อีเมล" className="input" />{f("email")}</div>
        <div><input name="password" type="password" placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" className="input" />{f("password")}</div>
        {err.error && !err.fields && <p className="err">{err.error}</p>}
        <button className="btn w-full" disabled={busy}>{mode === "login" ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</button>
      </form>
      <button className="mt-4 text-sm text-moss underline" onClick={() => { setMode(mode === "login" ? "register" : "login"); setErr({}); }}>
        {mode === "login" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ"}
      </button>
    </main>
  );
}
