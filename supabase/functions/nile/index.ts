// وظيفة nile: مزامنة التقدّم سحابياً، لوحة الصدارة الأسبوعية، وإحصائيات مجهولة الهوية
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, GET, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
const KINDS = new Set(["open", "done", "quiz", "cert", "build"]);
const MAX_WEEK_XP = 5000;

// بداية الأسبوع (الاثنين) بتوقيت الخرطوم
function weekStart() {
  const d = new Date(Date.now() + 2 * 3600e3);
  const day = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - day);
  return d.toISOString().slice(0, 10);
}
async function ghUser(token: string) {
  if (!token || token.length < 20) return null;
  const r = await fetch("https://api.github.com/user", { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "User-Agent": "capacitor-nile" } });
  if (!r.ok) return null;
  const u = await r.json();
  return { login: String(u.login).toLowerCase(), avatar: String(u.avatar_url || "") };
}
const obj = (v: unknown) => (v && typeof v === "object" && !Array.isArray(v) ? v as Record<string, any> : {});
function maxMap(a: any, b: any) { const o: Record<string, number> = { ...obj(a) }; for (const [k, v] of Object.entries(obj(b))) o[k] = Math.max(Number(o[k]) || 0, Number(v) || 0); return o; }
function orMap(a: any, b: any) { const o: Record<string, number> = { ...obj(a) }; for (const [k, v] of Object.entries(obj(b))) if (v) o[k] = 1; return o; }
// دمج بيانات الجهاز مع النسخة السحابية دون أن يضيع تقدّم أي منهما
function merge(server: any, client: any) {
  const s = obj(server), c = obj(client), out: Record<string, any> = { ...s, ...c };
  const ints = (x: any) => (Array.isArray(x) ? x.filter((n) => Number.isInteger(n) && n >= 0 && n < 500) : []);
  out.done = [...new Set([...ints(s.done), ...ints(c.done)])].sort((a, b) => a - b);
  out.xp = Math.max(Number(s.xp) || 0, Number(c.xp) || 0);
  out.copies = Math.max(Number(s.copies) || 0, Number(c.copies) || 0);
  out.xd = maxMap(s.xd, c.xd);
  out.act = maxMap(s.act, c.act);
  out.qp = orMap(s.qp, c.qp);
  out.ch = orMap(s.ch, c.ch);
  out.built = s.built || c.built ? 1 : 0;
  out.cert = c.cert || s.cert || null;
  for (const k of ["name", "goal", "prj", "nt", "rh"]) if (c[k] == null && s[k] != null) out[k] = s[k];
  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const b = req.method === "GET" ? Object.fromEntries(new URL(req.url).searchParams) : await req.json();

    if (b.action === "track") {
      const dev = String(b.dev || "");
      if (!/^[a-z0-9]{8,32}$/.test(dev)) return json({ ok: false }, 400);
      const rows = (Array.isArray(b.events) ? b.events : []).slice(0, 60)
        .filter((e: any) => e && KINDS.has(e.k))
        .map((e: any) => ({ dev, kind: e.k, lesson: Number.isInteger(e.l) ? e.l : null, q: Number.isInteger(e.q) ? e.q : null, ok: typeof e.ok === "boolean" ? e.ok : null }));
      if (rows.length) await db.from("events").insert(rows);
      return json({ ok: true, n: rows.length });
    }

    if (b.action === "board") {
      const week = weekStart();
      const { data } = await db.from("board").select("login,name,avatar,xp").eq("week", week).gt("xp", 0).order("xp", { ascending: false }).limit(20);
      let me = null;
      const login = String(b.login || "").toLowerCase();
      if (login) {
        const { data: m } = await db.from("board").select("xp").eq("week", week).eq("login", login).maybeSingle();
        if (m) { const { count } = await db.from("board").select("login", { count: "exact", head: true }).eq("week", week).gt("xp", m.xp); me = { rank: (count || 0) + 1, xp: m.xp }; }
      }
      const { count: total } = await db.from("board").select("login", { count: "exact", head: true }).eq("week", week).gt("xp", 0);
      return json({ week, top: data || [], me, total: total || 0 });
    }

    if (b.action === "sync") {
      const u = await ghUser(b.token);
      if (!u) return json({ error: "token", message: "رمز GitHub غير صالح أو منتهي." }, 401);
      const client = obj(b.data);
      if (JSON.stringify(client).length > 200000) return json({ error: "size" }, 413);
      const { data: row } = await db.from("progress").select("data").eq("login", u.login).maybeSingle();
      const merged = merge(row?.data, client);
      await db.from("progress").upsert({ login: u.login, data: merged, updated_at: new Date().toISOString() });
      const week = weekStart();
      if (b.show) {
        const xp = Math.min(MAX_WEEK_XP, Math.max(0, Math.round(Number(b.weekXp) || 0)));
        const name = String(b.name || u.login).replace(/\s+/g, " ").trim().slice(0, 30) || u.login;
        await db.from("board").upsert({ login: u.login, week, xp, name, avatar: u.avatar, updated_at: new Date().toISOString() });
      } else {
        await db.from("board").delete().eq("login", u.login).eq("week", week);
      }
      return json({ login: u.login, avatar: u.avatar, data: merged, at: new Date().toISOString() });
    }
    return json({ error: "action" }, 400);
  } catch (_e) {
    return json({ error: "server", message: "خطأ في الخادم. حاول لاحقاً." }, 500);
  }
});
