"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Bean = { id: string; name: string; origin: string; roaster?: string | null; roast: string; process?: string | null;
  weightG: number; remainingG: number; price: number; roastDate?: string | null; notes?: string | null };
type Log = { id: string; usedG: number; method: string; rating?: number | null; note?: string | null; createdAt: string };
type Errs = { error?: string; fields?: Record<string, string[]> };
const ROAST: Record<string, string> = { LIGHT: "คั่วอ่อน", MEDIUM: "คั่วกลาง", DARK: "คั่วเข้ม" };
const json = (method: string, body: unknown) => ({ method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function Home() {
  const router = useRouter();
  const [beans, setBeans] = useState<Bean[]>([]);
  const [q, setQ] = useState(""); const [roast, setRoast] = useState(""); const [inStock, setInStock] = useState(false);
  const [sort, setSort] = useState("createdAt");
  const [editing, setEditing] = useState<Partial<Bean> | null>(null);
  const [logFor, setLogFor] = useState<Bean | null>(null);

  const load = useCallback(async () => {
    const p = new URLSearchParams({ sort, order: sort === "name" ? "asc" : "desc" });
    if (q) p.set("q", q); if (roast) p.set("roast", roast); if (inStock) p.set("inStock", "1");
    const r = await fetch(`/api/beans?${p}`);
    if (r.status === 401) return router.replace("/login");
    setBeans(await r.json());
  }, [q, roast, inStock, sort, router]);
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t); }, [load]);

  async function remove(b: Bean) {
    if (!confirm(`ลบ "${b.name}" และประวัติทั้งหมด?`)) return;
    await fetch(`/api/beans/${b.id}`, { method: "DELETE" }); load();
  }
  async function logout() { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); }

  return (
    <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-6 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3" aria-label="Bean Vault หน้าคลังเมล็ดกาแฟ">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-moss text-xl text-white shadow-sm">☕</span>
          <span><span className="block text-lg font-bold leading-tight tracking-tight">Bean Vault</span><span className="text-xs text-ink/55">คลังเมล็ดกาแฟของคุณ</span></span>
        </a>
        <div className="flex gap-2"><button className="btn" onClick={() => setEditing({ roast: "MEDIUM" })}><span className="mr-1">＋</span>เพิ่มเมล็ดกาแฟ</button>
          <button className="btn-ghost hidden sm:block" onClick={logout}>ออกจากระบบ</button>
          <button className="btn-ghost px-2 sm:hidden" onClick={logout} aria-label="ออกจากระบบ">↗</button></div>
      </header>

      <section className="forest-hero relative isolate overflow-hidden rounded-[1.75rem] px-6 py-8 text-white shadow-lg sm:px-10 sm:py-11">
        <div className="relative z-[1] max-w-xl">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[.22em] text-white/70">Your little coffee forest</p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">เมล็ดดี ๆ เติบโต<br className="sm:hidden" />ในทุกแก้ว</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/75">เก็บเรื่องราวของเมล็ดกาแฟจากทั่วโลก พร้อมบันทึกทุกแก้วโปรดของคุณ</p>
        </div>
        <span className="absolute bottom-5 right-7 hidden text-7xl opacity-20 sm:block" aria-hidden="true">🌿</span>
      </section>

      <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-ink/5 bg-white/80 p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium text-ink/55">รายการที่พบ</p><p className="mt-1 text-2xl font-bold">{beans.length}<span className="ml-1 text-sm font-medium text-ink/50">รายการ</span></p>
        </div>
        <div className="rounded-2xl border border-ink/5 bg-white/80 p-4 shadow-sm sm:p-5">
          <p className="text-xs font-medium text-ink/55">เมล็ดที่ยังมี</p><p className="mt-1 text-2xl font-bold">{beans.filter((b) => b.remainingG > 0).length}<span className="ml-1 text-sm font-medium text-ink/50">รายการ</span></p>
        </div>
        <div className="col-span-2 rounded-2xl border border-ink/5 bg-white/80 p-4 shadow-sm sm:col-span-1 sm:p-5">
          <p className="text-xs font-medium text-ink/55">กาแฟพร้อมชง</p><p className="mt-1 text-2xl font-bold">{beans.reduce((sum, b) => sum + b.remainingG, 0).toLocaleString()}<span className="ml-1 text-sm font-medium text-ink/50">กรัม</span></p>
        </div>
      </section>

      <section className="mt-7 rounded-2xl border border-ink/5 bg-white/65 p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center gap-2"><span className="text-roast">⌕</span><h2 className="text-sm font-bold">ค้นหาเมล็ดกาแฟ</h2></div>
        <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
          <input className="input" placeholder="ค้นหาชื่อ แหล่งปลูก โรงคั่ว โน้ต…" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className="input sm:w-48" value={roast} onChange={(e) => setRoast(e.target.value)}>
            <option value="">ทุกระดับการคั่ว</option>{Object.entries(ROAST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          <select className="input sm:w-36" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="createdAt">ล่าสุด</option><option value="name">ชื่อ</option><option value="price">ราคา</option><option value="remainingG">คงเหลือ</option></select>
          <label className="flex min-h-11 items-center gap-2 px-1 text-sm text-ink/75"><input className="accent-moss" type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />มีของเหลือ</label>
        </div>
      </section>

      {beans.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-ink/20 bg-white/50 px-5 py-14 text-center">
          <span className="text-4xl" aria-hidden="true">🫘</span>
          <p className="mt-3 font-semibold">ยังไม่พบเมล็ดกาแฟ</p>
          <p className="mt-1 text-sm text-ink/60">ลองเพิ่มถุงแรกของคุณ หรือเปลี่ยนคำค้นหา</p>
          <button className="btn mt-5" onClick={() => setEditing({ roast: "MEDIUM" })}>เพิ่มเมล็ดกาแฟ</button>
        </div>
      ) : (
        <ul className="mt-5 grid gap-3 md:grid-cols-2">
          {beans.map((b) => {
            const pct = Math.max(0, Math.min(100, Math.round((b.remainingG / b.weightG) * 100)));
            return (
              <li key={b.id} className="rounded-2xl border border-ink/5 bg-white/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5">
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-leaf/70 text-lg" aria-hidden="true">🫘</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2"><p className="font-bold">{b.name}</p><span className="rounded-full bg-roast/10 px-2.5 py-1 text-[11px] font-semibold text-roast">{ROAST[b.roast]}</span></div>
                    <p className="mt-1 text-sm text-ink/65">{b.origin}{b.roaster && ` · ${b.roaster}`}{b.process && ` · ${b.process}`}</p>
                    {b.notes && <p className="mt-2 line-clamp-2 text-sm text-ink/55">{b.notes}</p>}
                  </div>
                </div>
                <div className="mt-5">
                  <div className="flex justify-between text-xs"><span className="font-medium">{b.remainingG.toLocaleString()} / {b.weightG.toLocaleString()} g</span><span className="text-ink/55">฿{b.price.toLocaleString()}</span></div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink/10"><div className="h-full rounded-full bg-moss transition-all" style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="mt-4 flex gap-2 border-t border-ink/5 pt-3">
                  <button className="btn-ghost" onClick={() => setLogFor(b)}>ประวัติ</button>
                  <button className="btn-ghost" onClick={() => setEditing(b)}>แก้ไข</button>
                  <button className="btn-ghost ml-auto text-red-700 hover:border-red-200 hover:bg-red-50" onClick={() => remove(b)}>ลบ</button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
      {editing && <BeanForm bean={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {logFor && <LogPanel bean={logFor} onClose={() => { setLogFor(null); load(); }} />}
    </main>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 grid place-items-center bg-ink/40 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl border border-ink/5 bg-cream p-5 shadow-xl sm:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">{title}</h2><button className="grid h-9 w-9 place-items-center rounded-xl text-ink/60 transition hover:bg-ink/5 hover:text-ink" onClick={onClose} aria-label="ปิด">✕</button></div>
        {children}
      </div>
    </div>
  );
}

function BeanForm({ bean, onClose, onSaved }: { bean: Partial<Bean>; onClose: () => void; onSaved: () => void }) {
  const [err, setErr] = useState<Errs>({});
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.currentTarget));
    const r = await fetch(bean.id ? `/api/beans/${bean.id}` : "/api/beans", json(bean.id ? "PUT" : "POST", body));
    r.ok ? onSaved() : setErr(await r.json());
  }
  const f = (k: string) => err.fields?.[k]?.[0] && <p className="err">{err.fields[k][0]}</p>;
  const date = bean.roastDate ? bean.roastDate.slice(0, 10) : "";
  return (
    <Modal title={bean.id ? "แก้ไขเมล็ดกาแฟ" : "เพิ่มเมล็ดกาแฟ"} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-2 gap-3">
        <div className="col-span-2"><input name="name" placeholder="ชื่อ *" defaultValue={bean.name} className="input" />{f("name")}</div>
        <div><input name="origin" placeholder="แหล่งปลูก *" defaultValue={bean.origin} className="input" />{f("origin")}</div>
        <div><input name="roaster" placeholder="โรงคั่ว" defaultValue={bean.roaster ?? ""} className="input" />{f("roaster")}</div>
        <div><select name="roast" defaultValue={bean.roast} className="input">{Object.entries(ROAST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>{f("roast")}</div>
        <div><input name="process" placeholder="กระบวนการ (Washed, Natural…)" defaultValue={bean.process ?? ""} className="input" />{f("process")}</div>
        <div><input name="weightG" type="number" placeholder="น้ำหนัก (g) *" defaultValue={bean.weightG} className="input" />{f("weightG")}</div>
        <div><input name="price" type="number" step="0.01" placeholder="ราคา (฿) *" defaultValue={bean.price} className="input" />{f("price")}</div>
        {bean.id && <div><input name="remainingG" type="number" placeholder="คงเหลือ (g)" defaultValue={bean.remainingG} className="input" />{f("remainingG")}</div>}
        <div><input name="roastDate" type="date" defaultValue={date} className="input" />{f("roastDate")}</div>
        <div className="col-span-2"><textarea name="notes" rows={2} placeholder="โน้ตรสชาติ" defaultValue={bean.notes ?? ""} className="input" />{f("notes")}</div>
        {err.error && !err.fields && <p className="err col-span-2">{err.error}</p>}
        <button className="btn col-span-2">บันทึก</button>
      </form>
    </Modal>
  );
}

function LogPanel({ bean, onClose }: { bean: Bean; onClose: () => void }) {
  const [logs, setLogs] = useState<Log[]>([]); const [err, setErr] = useState<Errs>({});
  const load = useCallback(async () => setLogs(await (await fetch(`/api/beans/${bean.id}/logs`)).json()), [bean.id]);
  useEffect(() => { load(); }, [load]);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); const form = e.currentTarget;
    const r = await fetch(`/api/beans/${bean.id}/logs`, json("POST", Object.fromEntries(new FormData(form))));
    if (r.ok) { form.reset(); setErr({}); load(); } else setErr(await r.json());
  }
  const f = (k: string) => err.fields?.[k]?.[0] && <p className="err">{err.fields[k][0]}</p>;
  return (
    <Modal title={`ประวัติการใช้: ${bean.name}`} onClose={onClose}>
      <form onSubmit={submit} className="grid grid-cols-3 gap-2">
        <div><input name="usedG" type="number" placeholder="ใช้ (g)" className="input" />{f("usedG")}</div>
        <div><input name="method" placeholder="วิธีชง" className="input" />{f("method")}</div>
        <div><input name="rating" type="number" min={1} max={5} placeholder="คะแนน 1-5" className="input" />{f("rating")}</div>
        <input name="note" placeholder="โน้ต" className="input col-span-3" />
        {err.error && !err.fields && <p className="err col-span-3">{err.error}</p>}
        <button className="btn col-span-3">บันทึกการใช้</button>
      </form>
      <ul className="mt-4 divide-y divide-ink/10 text-sm">
        {logs.length === 0 && <li className="py-3 text-ink/60">ยังไม่มีประวัติการชง</li>}
        {logs.map((l) => (
          <li key={l.id} className="py-2">
            <b>{l.usedG} g</b> · {l.method}{l.rating && ` · ★${l.rating}`}
            <span className="float-right text-ink/50">{new Date(l.createdAt).toLocaleDateString("th-TH")}</span>
            {l.note && <p className="text-ink/60">{l.note}</p>}
          </li>
        ))}
      </ul>
    </Modal>
  );
}
