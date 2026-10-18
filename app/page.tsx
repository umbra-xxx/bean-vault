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
    <main className="mx-auto max-w-5xl px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Bean Vault</h1>
        <div className="flex gap-2"><button className="btn" onClick={() => setEditing({ roast: "MEDIUM" })}>เพิ่มเมล็ดกาแฟ</button>
          <button className="btn-ghost" onClick={logout}>ออกจากระบบ</button></div>
      </header>

      <div className="mt-6 grid gap-2 sm:grid-cols-[1fr_auto_auto_auto]">
        <input className="input" placeholder="ค้นหาชื่อ แหล่งปลูก โรงคั่ว โน้ต…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={roast} onChange={(e) => setRoast(e.target.value)}>
          <option value="">ทุกระดับการคั่ว</option>{Object.entries(ROAST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="createdAt">ล่าสุด</option><option value="name">ชื่อ</option><option value="price">ราคา</option><option value="remainingG">คงเหลือ</option></select>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} />มีของเหลือ</label>
      </div>

      {beans.length === 0 ? (
        <p className="mt-16 text-center text-ink/60">ยังไม่พบเมล็ดกาแฟ ลองเพิ่มถุงแรกของคุณ หรือเปลี่ยนคำค้นหา</p>
      ) : (
        <ul className="mt-6 divide-y divide-ink/10 rounded-lg border border-ink/10 bg-white">
          {beans.map((b) => {
            const pct = Math.round((b.remainingG / b.weightG) * 100);
            return (
              <li key={b.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_180px_auto] sm:items-center">
                <div>
                  <p className="font-medium">{b.name}</p>
                  <p className="text-sm text-ink/70">{b.origin}{b.roaster && ` · ${b.roaster}`} · {ROAST[b.roast]}{b.process && ` · ${b.process}`}</p>
                  {b.notes && <p className="mt-1 text-sm text-ink/60">{b.notes}</p>}
                </div>
                <div>
                  <p className="text-sm">{b.remainingG}/{b.weightG} g · ฿{b.price.toLocaleString()}</p>
                  <div className="mt-1 h-1.5 rounded bg-ink/10"><div className="h-full rounded bg-moss" style={{ width: `${pct}%` }} /></div>
                </div>
                <div className="flex gap-2">
                  <button className="btn-ghost" onClick={() => setLogFor(b)}>ประวัติ</button>
                  <button className="btn-ghost" onClick={() => setEditing(b)}>แก้ไข</button>
                  <button className="btn-ghost text-red-700" onClick={() => remove(b)}>ลบ</button>
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
      <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-lg bg-white p-5" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex justify-between"><h2 className="text-lg font-bold">{title}</h2><button onClick={onClose} aria-label="ปิด">✕</button></div>
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
