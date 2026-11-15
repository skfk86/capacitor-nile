// وظيفة الشهادات: اختبار نهائي يُصحَّح على الخادم، تحقق من مشروع المتعلم على GitHub، إصدار شهادة موقّعة، والتحقق العام منها
import { createClient } from "npm:@supabase/supabase-js@2";

const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type", "Access-Control-Allow-Methods": "POST, GET, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
const EXAM_N = 20, PASS = 80, MINUTES = 25, MAX_PER_DAY = 3;
const EXTRA: [string, string[], number][] = [["أي ملف يجب أن يحتوي عليه مجلد www ليعمل npx cap add android؟",["app.json","index.html","main.js"],1],["ما نتيجة الأمر mkdir -p a/b/c إذا لم يكن a موجوداً؟",["يُنشأ c فقط","خطأ: المجلد غير موجود","تُنشأ المجلدات الثلاثة"],2],["ماذا يطبع الكود: console.log([1,2,3].length)؟",["3","undefined","2"],0],["أي خاصية CSS توسّط العناصر أفقياً داخل حاوية flex باتجاه row؟",["text-indent","align-items","justify-content"],2],["أي قيمة صحيحة لـ appId؟",["com.myapp.test","com.my-app.test","My App"],0],["لماذا يُكتب android/ في ملف .gitignore في مشروع الأتمتة؟",["لأنه يحتوي كلمات المرور","لأن Git لا يقبل المجلدات","لأنه يُنشأ أثناء البناء على GitHub"],2],["ما الذي يحدث إذا رفعت تحديثاً على Play بنفس versionCode؟",["يُقبل عادياً","يُحذف التطبيق القديم","يُرفض الرفع"],2],["أي سطر YAML صحيح؟",["runs-on: ubuntu-latest","runs-on = ubuntu-latest","runs-on ubuntu-latest"],0],["ما وظيفة needs: check في job البناء؟",["حذف job الفحص","انتظار نجاح job الفحص أولاً","تشغيل البناء قبل الفحص"],1],["أين تُخزّن القيم السرية بأمان في GitHub Actions؟",["في Secrets المستودع","في README","داخل ملف YAML"],0],["ما نوع الملف الذي ينتجه ./gradlew bundleRelease؟",["AAB","ZIP للويب","APK"],0],["أي دالة تحوّل نص JSON إلى كائن؟",["JSON.stringify","JSON.parse","JSON.object"],1],["ماذا يعيد localStorage.getItem لمفتاح غير موجود؟",["0","خطأ","null"],2],["أي حدث يناسب التقاط زر Enter في نموذج؟",["scroll","resize","submit"],2],["ماذا يفعل e.preventDefault() داخل حدث submit؟",["يرسل النموذج مرتين","يحذف الحقول","يمنع إعادة تحميل الصفحة"],2],["أي أمر يعرض الملفات المخفية أيضاً في Termux؟",["ls -h","ls hidden","ls -a"],2],["ما معنى ~ في مسارات Termux؟",["مجلد الجذر /","المجلد الرئيسي للمستخدم","المجلد السابق"],1],["أي أمر يغيّر المجلد الحالي؟",["cd","pwd","mv"],0],["ما الذي يحتاجه git commit لأول مرة إذا لم تُعرّف هويتك؟",["pkg install git مرة ثانية","حساب Play Console","git config user.name و user.email"],2],["ماذا يعني الخطأ: src refspec main does not match any؟",["الإنترنت مقطوع","لا يوجد commit بعد على الفرع","كلمة المرور خاطئة"],1],["أي صلاحية يحتاجها سير العمل لنشر Release؟",["actions: none","contents: write","pages: read"],1],["ما فائدة الوحدة dvh مقارنة بـ vh على الهاتف؟",["أصغر دائماً","تحسب الارتفاع الفعلي مع أشرطة المتصفح","تعمل فقط في الحاسوب"],1],["أي وسم يضع عنوان التطبيق في شريط المهام؟",["<title>","<h1>","<header>"],0],["ماذا يحدث إذا نسيت وسم viewport؟",["تظهر الصفحة مصغّرة على الهاتف","لا يُبنى APK","لا يعمل JavaScript"],0],["أي أمر يثبّت حزم package.json على خادم البناء بدقة وسرعة؟",["npm ci","npm open","npm delete"],0],["لماذا نرفع وسماً مثل v1.0؟",["لتشغيل سير عمل نشر الإصدار","لحذف الفرع","لتغيير اسم التطبيق"],0],["ما الذي يحدد اسم التطبيق تحت الأيقونة في Capacitor؟",["appName","versionCode","webDir"],0],["أي خطوة تولّد أيقونات Android من صورة واحدة؟",["npx cap doctor","npm init","npx capacitor-assets generate"],2],["ماذا يعني فشل الخطوة Build APK مع خطأ في Java version؟",["خطأ في CSS","إصدار Java غير مناسب في setup-java","الرمز منتهي"],1],["أفضل طريقة للبحث عن سبب فشل البناء؟",["حذف المستودع","إعادة التشغيل عشر مرات","أول سطر error في سجل الخطوة الحمراء"],2]];

async function gh(path: string, token: string) {
  const r = await fetch("https://api.github.com" + path, { headers: { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "User-Agent": "capacitor-nile" } });
  return { ok: r.ok, status: r.status, data: r.ok ? await r.json() : null };
}
async function whoami(token: string) {
  if (!token || token.length < 20) throw new Error("token");
  const r = await gh("/user", token);
  if (!r.ok) throw new Error("token");
  return String(r.data.login).toLowerCase();
}
async function project(login: string, token: string) {
  const r = await gh(`/repos/${login}/my-nile-app/releases/latest`, token);
  if (!r.ok) return null;
  const a = (r.data.assets || []).find((x: any) => /\.apk$/.test(x.name));
  if (!a) return null;
  return { repo_url: `https://github.com/${login}/my-nile-app`, apk_url: a.browser_download_url };
}
async function ensureBank() {
  const { count } = await db.from("exam_questions").select("id", { count: "exact", head: true });
  if (count && count > 0) return;
  const src = await (await fetch("https://raw.githubusercontent.com/skfk86/capacitor-nile/main/www/quiz.js")).text();
  const Q = new Function(src + ";return Q")() as Record<string, [string, string[], number][]>;
  const rows: any[] = [];
  for (const k in Q) for (const [q, o, a] of Q[k]) rows.push({ q, options: o, answer: a });
  for (const [q, o, a] of EXTRA) rows.push({ q, options: o, answer: a });
  await db.from("exam_questions").insert(rows);
}
async function sign(text: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const s = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(text));
  return Array.from(new Uint8Array(s)).map(b => b.toString(16).padStart(2, "0")).join("").slice(0, 32);
}
const certId = () => { const A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; const b = crypto.getRandomValues(new Uint8Array(8)); let s = ""; b.forEach(x => s += A[x % A.length]); return "CN-" + s.slice(0, 4) + "-" + s.slice(4); };
const pub = (c: any) => ({ valid: true, id: c.id, name: c.name, login: c.login, repo_url: c.repo_url, apk_url: c.apk_url, score: c.score, issued_at: c.issued_at, sig: c.sig });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    if (req.method === "GET") {
      const id = (new URL(req.url).searchParams.get("id") || "").toUpperCase().trim();
      if (!/^CN-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(id)) return json({ valid: false });
      const { data } = await db.from("certificates").select("*").eq("id", id).maybeSingle();
      return json(data ? pub(data) : { valid: false });
    }
    const b = await req.json();
    if (b.action === "verify") {
      const { data } = await db.from("certificates").select("*").eq("id", String(b.id || "").toUpperCase()).maybeSingle();
      return json(data ? pub(data) : { valid: false });
    }
    let login: string;
    try { login = await whoami(b.token); } catch { return json({ error: "token", message: "رمز GitHub غير صالح أو منتهي." }, 401); }

    const { data: had } = await db.from("certificates").select("*").eq("login", login).maybeSingle();
    if (had) return json({ certificate: pub(had) });

    if (b.action === "status") {
      const p = await project(login, b.token);
      const since = new Date(Date.now() - 864e5).toISOString();
      const { count } = await db.from("exam_sessions").select("id", { count: "exact", head: true }).eq("login", login).gte("created_at", since);
      return json({ login, project: p, attempts_left: Math.max(0, MAX_PER_DAY - (count || 0)) });
    }

    if (b.action === "start") {
      const p = await project(login, b.token);
      if (!p) return json({ error: "project", message: "ابنِ تطبيقك أولاً من «مشروعي»؛ نحتاج نسخة APK منشورة في مستودعك my-nile-app." }, 400);
      const since = new Date(Date.now() - 864e5).toISOString();
      const { count } = await db.from("exam_sessions").select("id", { count: "exact", head: true }).eq("login", login).gte("created_at", since);
      if ((count || 0) >= MAX_PER_DAY) return json({ error: "limit", message: `استنفدت ${MAX_PER_DAY} محاولات اليوم. حاول بعد 24 ساعة.` }, 429);
      await ensureBank();
      const { data: all } = await db.from("exam_questions").select("id,q,options");
      const pick = (all || []).sort(() => Math.random() - .5).slice(0, EXAM_N);
      const expires = new Date(Date.now() + MINUTES * 60e3).toISOString();
      const { data: s } = await db.from("exam_sessions").insert({ login, question_ids: pick.map(x => x.id), expires_at: expires }).select("id").single();
      return json({ session: s!.id, expires_at: expires, minutes: MINUTES, pass: PASS, questions: pick });
    }

    if (b.action === "submit") {
      const name = String(b.name || "").replace(/\s+/g, " ").trim();
      if (name.length < 3 || name.length > 60) return json({ error: "name", message: "اكتب اسمك الكامل (3 إلى 60 حرفاً)." }, 400);
      const { data: s } = await db.from("exam_sessions").select("*").eq("id", b.session).maybeSingle();
      if (!s || s.login !== login) return json({ error: "session", message: "جلسة الاختبار غير صالحة." }, 400);
      if (s.used) return json({ error: "used", message: "سُلّم هذا الاختبار من قبل." }, 400);
      if (Date.now() > new Date(s.expires_at).getTime() + 60e3) { await db.from("exam_sessions").update({ used: true, score: 0 }).eq("id", s.id); return json({ error: "expired", message: "انتهى وقت الاختبار." }, 400); }
      const { data: qs } = await db.from("exam_questions").select("id,answer").in("id", s.question_ids);
      const ans = b.answers || {};
      const right = (qs || []).filter(q => Number(ans[q.id]) === q.answer).length;
      const score = Math.round(right / s.question_ids.length * 100);
      await db.from("exam_sessions").update({ used: true, score }).eq("id", s.id);
      if (score < PASS) return json({ passed: false, score, right, total: s.question_ids.length, pass: PASS });
      const p = await project(login, b.token);
      if (!p) return json({ error: "project", message: "لم نجد نسخة APK في مستودعك my-nile-app." }, 400);
      const id = certId(), issued = new Date().toISOString();
      const sig = await sign([id, name, login, issued].join("|"));
      const row = { id, name, login, repo_url: p.repo_url, apk_url: p.apk_url, score, issued_at: issued, sig };
      const { error } = await db.from("certificates").insert(row);
      if (error) { const { data: c } = await db.from("certificates").select("*").eq("login", login).maybeSingle(); if (c) return json({ passed: true, score, certificate: pub(c) }); throw error; }
      return json({ passed: true, score, right, total: s.question_ids.length, certificate: pub(row) });
    }
    return json({ error: "action" }, 400);
  } catch (e) {
    return json({ error: "server", message: "خطأ في الخادم. حاول لاحقاً." }, 500);
  }
});
