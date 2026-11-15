const L0=[
{t:'كيف يعمل Capacitor',s:'الفكرة والهيكل قبل أول سطر',i:'phone',m:4,b:[
['h','الفكرة في جملة'],
['p','تطبيق Capacitor هو <b>موقع ويب</b> يعمل داخل تطبيق Android جاهز. هذا التطبيق يحتوي متصفحاً مدمجاً اسمه <code>WebView</code> يعرض ملفاتك: HTML للهيكل، وCSS للشكل، وJavaScript للسلوك.'],
['h','ماذا يضيف Capacitor؟'],
['u',['<b>جسر (Bridge)</b> يسمح لـ JavaScript بطلب ميزات الهاتف: الاهتزاز، المشاركة، الكاميرا، الملفات.','<b>أوامر</b> <code>npx cap</code> تنشئ مشروع Android وتنسخ ملفات الويب إليه.','<b>مشروع Android كامل</b> في مجلد <code>android/</code> يُبنى إلى ملف APK.']],
['h','هيكل المشروع'],
['c','المجلدات',`my-app/
├─ www/
│  └─ index.html          تطبيقك
├─ android/               يُولَّد تلقائياً
├─ package.json
└─ capacitor.config.json`],
['t','القاعدة الذهبية: أي تعديل في <code>www</code> لا يظهر في Android إلا بعد <code>npx cap sync android</code> ثم إعادة البناء.']]},
{t:'تجهيز Termux والأدوات',s:'بيئة عمل كاملة على هاتفك',i:'term',m:4,b:[
['p','ستعمل كل الدروس من الهاتف عبر Termux. ثبّته من <b>F-Droid</b> لأن نسخة Google Play قديمة.'],
['h','تثبيت الأدوات'],
['c','bash',`pkg update && pkg upgrade -y
pkg install nodejs git -y
termux-setup-storage
node -v && npm -v && git --version`],
['u',['<code>nodejs</code> يعطيك <code>node</code> و <code>npm</code> لتثبيت Capacitor.','<code>git</code> لرفع المشروع إلى GitHub.','<code>termux-setup-storage</code> يطلب إذن الملفات ويُنشئ مجلد <code>~/storage</code>.']],
['h','إنشاء مجلد المشروع'],
['c','bash',`mkdir -p ~/nile-app/www
cd ~/nile-app
nano www/index.html`],
['t','تأكد أن الأوامر الثلاثة في آخر خطوة أعادت أرقام إصدارات. إن ظهر <code>command not found</code> فأعد تثبيت الحزمة المعنية.']]},
{t:'HTML: هيكل تطبيق الهاتف',s:'ملف واحد يحمل التطبيق كله',i:'layout',m:5,b:[
['p','ملف <code>index.html</code> واحد يكفي. فيه الهيكل في <code>body</code>، والشكل داخل <code>style</code>، والسلوك داخل <code>script</code>.'],
['c','html',`<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport"
    content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>تطبيقي</title>
  <style>/* CSS هنا */</style>
</head>
<body>
  <main>
    <h1>أهلاً بالنيل</h1>
    <button id="btn">اضغط</button>
  </main>
  <script>/* JS هنا */<\/script>
</body>
</html>`],
['h','شرح الأسطر المهمة'],
['u',['<code>dir="rtl"</code>: اتجاه الصفحة من اليمين لليسار للعربية.','<code>viewport</code>: يجعل عرض الصفحة بعرض الهاتف. بدونه يظهر التطبيق مصغّراً.','<code>viewport-fit=cover</code>: يسمح بالرسم خلف شريط الحالة، وتضبطه بمتغيرات <code>safe-area</code> في CSS.','وسوم مثل <code>main</code> و <code>button</code> أفضل من <code>div</code> لأن قارئات الشاشة تفهمها.']]]},
{t:'CSS: تصميم يناسب الإصبع',s:'أحجام لمس وهوامش آمنة وثيم داكن',i:'palette',m:5,b:[
['p','الهاتف يُستخدم بالإصبع لا بالفأرة، لذلك لتصميمه قواعد خاصة.'],
['c','css',`:root { --accent: #0b7a85; }
body {
  margin: 0;
  min-height: 100dvh;
  padding: env(safe-area-inset-top) 16px
           env(safe-area-inset-bottom);
  font-family: system-ui, sans-serif;
}
button {
  min-height: 48px;
  padding: 0 20px;
  border: 0;
  border-radius: 14px;
  background: var(--accent);
  color: #fff;
  font: inherit;
}
button:active { transform: scale(.97); }
@media (prefers-color-scheme: dark) {
  body { background: #051519; color: #e4f1f0; }
}`],
['h','لماذا هذه القواعد؟'],
['u',['<code>min-height: 48px</code>: حجم لمس مريح، أقل منه يسبب أخطاء الضغط.','<code>100dvh</code>: ارتفاع الشاشة الفعلي، أدق من <code>100vh</code> الذي يتجاهل أشرطة الهاتف.','<code>env(safe-area-inset-*)</code>: يبعد المحتوى عن النتوء وشريط التنقل.','<code>:active</code> بدل <code>:hover</code>: لا يوجد مؤشر على الهاتف، فأعطِ المستخدم ردّ فعل عند اللمس.','<code>prefers-color-scheme</code>: يتبع ثيم الهاتف تلقائياً.']]]},
{t:'JavaScript: التفاعل',s:'أحداث اللمس وتحديث الشاشة',i:'zap',m:5,b:[
['p','JavaScript يربط الأزرار بالمنطق. الخطوات دائماً: اختر العنصر، اسمع للحدث، غيّر الحالة، حدّث الشاشة.'],
['c','js',`const btn = document.getElementById('btn');
let count = 0;

function render() {
  btn.textContent = 'ضغطات: ' + count;
}

btn.addEventListener('click', () => {
  count++;
  render();
});

render();`],
['h','ما الذي يحدث؟'],
['u',['<code>getElementById</code> يجلب الزر من الصفحة.','<code>count</code> هو الحالة (State): رقم يتغير مع كل ضغطة.','<code>render()</code> دالة واحدة تعكس الحالة على الشاشة، فلا تنسَ استدعاءها بعد كل تغيير.','<code>addEventListener</code> يجعل الزر ينفذ الدالة عند الضغط.']],
['t','افصل دائماً بين <b>الحالة</b> و<b>العرض</b>. هذه العادة تجعل التطبيقات الكبيرة سهلة التعديل.']]},
{t:'شاشات متعددة وزر الرجوع',s:'تنقل كامل داخل ملف واحد',i:'grid',m:6,b:[
['p','التطبيق الحقيقي له شاشات: رئيسية، تفاصيل، إعدادات. نبنيها كأقسام <code>section</code> ونُظهر واحداً فقط.'],
['c','html + css',`<section id="home" class="screen on">
  <h1>الرئيسية</h1>
  <button onclick="go('about')">حول التطبيق</button>
</section>
<section id="about" class="screen">
  <h1>حول</h1>
  <button onclick="history.back()">رجوع</button>
</section>

<style>
  .screen { display: none; }
  .screen.on { display: block; }
</style>`],
['c','js',`function go(id, push = true) {
  document.querySelectorAll('.screen')
    .forEach(s => s.classList.toggle('on', s.id === id));
  if (push) history.pushState({ id }, '');
}

addEventListener('popstate', e => {
  go(e.state ? e.state.id : 'home', false);
});`],
['t','زر الرجوع في Android يستدعي <code>popstate</code>. لذلك نسجّل كل شاشة بـ <code>pushState</code> حتى يعود المستخدم للشاشة السابقة بدل أن يخرج من التطبيق. تطبيق Capacitor Nile نفسه يعمل بهذه الطريقة.']]},
{t:'حفظ البيانات',s:'localStorage وJSON وخيارات الخادم',i:'db',m:5,b:[
['p','بدون حفظ، تضيع بيانات المستخدم عند إغلاق التطبيق. أبسط حل هو <code>localStorage</code>.'],
['c','js',`const KEY = 'tasks';

function load() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch (e) { return []; }
}
function save(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); }
  catch (e) {}
}

const tasks = load();
tasks.push({ id: Date.now(), text: 'مهمة جديدة', done: false });
save(tasks);`],
['u',['<code>localStorage</code> يحفظ نصوصاً فقط، فنحوّل القوائم بـ <code>JSON.stringify</code> ونعيدها بـ <code>JSON.parse</code>.','<code>try/catch</code> يحميك إذا فشل التخزين أو كانت القيمة تالفة.','<code>Date.now()</code> رقم فريد يصلح معرّفاً لكل عنصر.']],
['t','البيانات تُحذف إذا مسح المستخدم بيانات التطبيق. للبيانات المهمة أو المشتركة بين المستخدمين استخدم خادماً مثل Firebase Firestore.']]},
{t:'إنشاء مشروع Capacitor',s:'من ملف HTML إلى مشروع Android',i:'box',m:6,b:[
['p','نفّذ هذه الأوامر داخل مجلد المشروع بالترتيب.'],
['c','bash',`npm init -y
npm i @capacitor/core @capacitor/cli @capacitor/android
npx cap init "تطبيقي" com.example.myapp --web-dir www
npx cap add android
npx cap sync android`],
['h','ماذا فعل كل أمر؟'],
['u',['<code>npm init -y</code>: ينشئ <code>package.json</code>.','<code>npm i ...</code>: يثبّت Capacitor ومنصة Android.','<code>cap init</code>: يسأل عن اسم التطبيق ومعرّفه ومجلد الويب ويكتب <code>capacitor.config.json</code>.','<code>cap add android</code>: يولّد مجلد <code>android/</code>.','<code>cap sync</code>: ينسخ <code>www</code> إلى مشروع Android.']],
['c','capacitor.config.json',`{
  "appId": "com.example.myapp",
  "appName": "تطبيقي",
  "webDir": "www"
}`],
['t','المعرّف <code>appId</code> هوية تطبيقك الدائمة. لا يمكن تغييره بعد النشر، فاختره بصيغة نطاقك معكوساً، حروف إنجليزية صغيرة ونقاط فقط.']]},
{t:'مزايا الهاتف والأيقونة',s:'إضافات Capacitor وأيقونة التطبيق',i:'plug',m:7,b:[
['h','الإضافات (Plugins)'],
['p','كل ميزة أصلية تأتي في حزمة مستقلة. مثال: الاهتزاز والمشاركة.'],
['c','bash',`npm i @capacitor/haptics @capacitor/share
npx cap sync android`],
['c','js',`const P = window.Capacitor && Capacitor.Plugins;

btn.onclick = async () => {
  if (P && P.Haptics) await P.Haptics.impact({ style: 'MEDIUM' });
  if (P && P.Share) {
    await P.Share.share({ title: 'تطبيقي', text: 'جرّب تطبيقي' });
  }
};`],
['p','الفحص <code>if (P ...)</code> يجعل الكود يعمل في المتصفح أيضاً دون أخطاء، وتفعّل الميزة فقط داخل التطبيق.'],
['h','أيقونة التطبيق'],
['c','bash',`npm i -D @capacitor/assets
mkdir assets
# ضع assets/icon-only.png بحجم 1024x1024
# وضع assets/splash.png بحجم 2732x2732
npx capacitor-assets generate --android`],
['t','اجعل الأيقونة مربعة وبخلفية ملونة واترك هامشاً حول الشكل. الاسم الظاهر تحت الأيقونة يأتي من <code>appName</code>.']]},
{t:'GitHub Actions: ابنِ APK',s:'ملف YAML يبني تطبيقك على السحابة',i:'flow',m:8,b:[
['p','بناء Gradle ثقيل على الهاتف، لذلك يبنيه GitHub على خادمه مجاناً. أنشئ الملف <code>.github/workflows/build.yml</code>.'],
['c','yaml',`name: Build APK
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
      - run: npm ci
      - run: npx cap sync android
      - run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk`],
['h','شرح الملف'],
['u',['<code>on</code>: متى يعمل؟ عند كل <code>push</code> على main، أو يدوياً بـ <code>workflow_dispatch</code>.','<code>runs-on</code>: الجهاز الذي يبني، هنا Ubuntu على سحابة GitHub.','<code>checkout</code> يجلب الكود، و<code>setup-node</code> و<code>setup-java</code> يجهزان الأدوات.','<code>npm ci</code> يثبّت الحزم من <code>package-lock.json</code>.','<code>assembleDebug</code> يبني APK تجريبي، و<code>upload-artifact</code> يحفظه للتنزيل.']],
['h','الرفع والتنزيل'],
['c','bash',`printf "node_modules/\\n" > .gitignore
git init
git add .
git commit -m "first build"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main`],
['p','افتح تبويب <b>Actions</b> في المستودع، وبعد اكتمال التشغيل نزّل <code>app-debug</code> من قسم Artifacts، فك ضغطه وثبّت الـ APK.'],
['h','أخطاء شائعة'],
['u',['فشل <code>npm ci</code>: ملف <code>package-lock.json</code> غير مرفوع.','<code>gradlew: Permission denied</code>: أضف <code>chmod +x gradlew</code> كما في الملف.','خطأ إصدار Java: Capacitor 7 وما بعده يطلب Java 21، والإصدارات الأقدم تعمل مع 17.','<code>android</code> غير موجود: تأكد أنك لم تضعه في <code>.gitignore</code>.']]]},
{t:'النسخة النهائية والنشر',s:'توقيع Release وتجهيز متجر Play',i:'rocket',m:8,b:[
['p','APK التجريبي للاختبار فقط. للنشر تحتاج نسخة <b>موقّعة</b> بمفتاح خاص بك.'],
['h','1. أنشئ المفتاح'],
['c','bash',`pkg install openjdk-17 -y
keytool -genkeypair -v -keystore release.jks \\
  -alias nile -keyalg RSA -keysize 2048 -validity 10000
base64 -w0 release.jks`],
['t','احتفظ بنسخة من <code>release.jks</code> وكلمة مروره في مكانين آمنين. ضياعهما يمنعك من تحديث التطبيق للأبد. لا ترفعهما إلى GitHub أبداً.'],
['h','2. أضف الأسرار'],
['p','في المستودع: Settings ثم Secrets and variables ثم Actions. أضف <code>KEYSTORE_B64</code> (ناتج أمر base64) و<code>KS_PASS</code> و<code>KEY_ALIAS</code>.'],
['h','3. اربط التوقيع بالبناء'],
['c','android/app/build.gradle',`android {
  signingConfigs {
    release {
      storeFile file("release.jks")
      storePassword System.getenv("KS_PASS")
      keyAlias System.getenv("KEY_ALIAS")
      keyPassword System.getenv("KS_PASS")
    }
  }
  buildTypes {
    release {
      signingConfig signingConfigs.release
    }
  }
}`],
['c','yaml',`      - name: Decode keystore
        run: echo "$KEYSTORE_B64" | base64 -d > android/app/release.jks
        env:
          KEYSTORE_B64: \${{ secrets.KEYSTORE_B64 }}
      - name: Build release
        run: cd android && ./gradlew assembleRelease
        env:
          KS_PASS: \${{ secrets.KS_PASS }}
          KEY_ALIAS: \${{ secrets.KEY_ALIAS }}`],
['p','الأوامر تضيفها في ملف <code>build.yml</code> بدل خطوة <code>assembleDebug</code>. الناتج: <code>app/build/outputs/apk/release/app-release.apk</code>.'],
['t','متجر Google Play يطلب ملف <b>AAB</b>: استبدل <code>assembleRelease</code> بـ <code>bundleRelease</code>. وهنا اكتملت الرحلة: من فكرة إلى تطبيق منشور.']]}
];
const N=[
{t:'قبل أن تبدأ',s:'ما تحتاجه لإكمال الدورة',i:'check',m:3,b:[
['p','هذه الدورة تعمل بالكامل من هاتفك. تأكد من وجود ما يلي قبل أول محطة:'],
['u',['هاتف Android بمساحة حرة لا تقل عن 2 جيجابايت.','اتصال إنترنت لتنزيل الأدوات ورفع المشروع.','حساب على <b>GitHub</b> (مجاني). سننشئه في محطة لاحقة إن لم يكن لديك.','تطبيق <b>Termux</b> من F-Droid، وتطبيق محرر أكواد.','وقت قصير يومياً: كل محطة تأخذ بضع دقائق فقط.']],
['t','لا تحتاج حاسوباً ولا خبرة سابقة. تقدّم محطة واحدة كل مرة، وجرّب كل كود بنفسك.']]},
{t:'محرر الأكواد على الهاتف',s:'كيف تكتب الملفات وتنقلها',i:'term',m:4,b:[
['p','تحتاج محرراً تكتب فيه ملف <code>index.html</code>. لديك طريقتان.'],
['h','الطريقة 1: محرر nano داخل Termux'],
['c','bash','nano www/index.html'],
['u',['احفظ بـ <code>Ctrl + O</code> ثم Enter، واخرج بـ <code>Ctrl + X</code>.','مفتاح Ctrl موجود في صف الأزرار الإضافية فوق لوحة مفاتيح Termux.']],
['h','الطريقة 2: محرر أكواد خارجي'],
['p','اكتب الكود في أي محرر يلوّن الأكواد، احفظه في مجلد التنزيلات، ثم انقله إلى المشروع:'],
['c','bash','cp ~/storage/downloads/index.html ~/nile-app/www/'],
['t','هذا الأمر يعمل بعد تنفيذ <code>termux-setup-storage</code> في المحطة السابقة.']]},
{t:'عناصر HTML الأساسية',s:'العناوين والنصوص والصور والمدخلات',i:'layout',m:4,b:[
['p','هذه أكثر العناصر استخداماً في أي تطبيق:'],
['c','html',`<h1>عنوان رئيسي</h1>
<p>فقرة نصية.</p>
<a href="https://example.com">رابط</a>
<img src="img/logo.png" alt="الشعار">
<ul>
  <li>عنصر أول</li>
  <li>عنصر ثان</li>
</ul>
<input id="name" placeholder="اكتب اسمك">
<button>إرسال</button>`],
['u',['<code>h1</code> للعنوان الأهم، واستخدمه مرة واحدة في الشاشة.','<code>alt</code> يصف الصورة لقارئات الشاشة ويظهر إن تعذّر تحميلها.','<code>ul</code> و<code>li</code> لكل قائمة عناصر.','<code>input</code> لإدخال النصوص، و<code>placeholder</code> تلميح يختفي عند الكتابة.']],
['t','ضع صورك داخل مجلد <code>www/img</code> واكتب مسارها بشكل نسبي كما في المثال.']]},
{t:'معاينة التطبيق في المتصفح',s:'جرّب تعديلاتك بسرعة قبل البناء',i:'phone',m:4,b:[
['p','قبل بناء APK، جرّب تطبيقك على متصفح الهاتف. هذا أسرع بكثير.'],
['c','bash',`pkg install python -y
cd ~/nile-app/www
python -m http.server 8080`],
['u',['اترك Termux يعمل، وافتح المتصفح على <code>http://localhost:8080</code>.','بعد كل تعديل حدّث الصفحة فقط.','أوقف الخادم بـ <code>Ctrl + C</code>.']],
['t','المعاينة تُظهر الشكل والمنطق. أما ميزات Capacitor مثل الاهتزاز والمشاركة فتعمل داخل التطبيق فقط.']]},
{t:'Flexbox: ترتيب العناصر',s:'صفوف وأعمدة بسطرين من CSS',i:'grid',m:5,b:[
['p','Flexbox أسهل طريقة لترتيب العناصر في صف أو عمود.'],
['c','css',`.row {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
}
.col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.grow { flex: 1; }`],
['u',['<code>display: flex</code> يفعّل الترتيب لأبناء العنصر.','<code>gap</code> مسافة بين العناصر دون هوامش معقدة.','<code>align-items</code> المحاذاة العمودية، و<code>justify-content</code> التوزيع الأفقي.','<code>flex: 1</code> يجعل العنصر يملأ المساحة المتبقية.']],
['t','مع <code>dir="rtl"</code> يبدأ الصف من اليمين تلقائياً، فلا تحتاج لقلب الاتجاه.']]},
{t:'أساسيات JavaScript',s:'المتغيرات والدوال والمصفوفات',i:'zap',m:5,b:[
['c','js',`const name = 'علي';
let score = 0;
score = score + 1;

function greet(user) {
  return 'مرحباً ' + user;
}

const items = ['خبز', 'حليب'];
items.push('بيض');
items.forEach(item => console.log(item));

if (score > 0) {
  console.log(greet(name));
}`],
['u',['<code>const</code> لقيمة لا تتغير، و<code>let</code> لقيمة ستتغير.','الدالة <code>function</code> تأخذ مدخلات وتعيد نتيجة بـ <code>return</code>.','المصفوفة قائمة: <code>push</code> يضيف عنصراً، و<code>forEach</code> يمر على كل عنصر.','<code>if</code> ينفذ الكود عند تحقق الشرط فقط.']],
['t','ابدأ دائماً بـ <code>const</code>، واستخدم <code>let</code> فقط حين تحتاج تغيير القيمة.']]},
{t:'النماذج والمدخلات',s:'اقرأ ما يكتبه المستخدم واعرض النتيجة',i:'sliders',m:5,b:[
['c','html',`<input id="name" placeholder="اسمك">
<button id="ok">تحية</button>
<p id="out"></p>`],
['c','js',`const input = document.getElementById('name');
const out = document.getElementById('out');

document.getElementById('ok').addEventListener('click', () => {
  const v = input.value.trim();
  out.textContent = v ? 'أهلاً ' + v : 'اكتب اسمك أولاً';
});`],
['u',['<code>input.value</code> يعطيك النص المكتوب.','<code>trim()</code> يحذف الفراغات من الطرفين.','افحص القيمة الفارغة قبل المتابعة.','<code>textContent</code> يعرض النص كما هو.']],
['t','لا تضع نص المستخدم داخل <code>innerHTML</code>، فقد يحتوي شيفرة ضارة. استخدم <code>textContent</code>.']]},
{t:'مشروع: قائمة مهام',s:'تطبيق صغير يجمع كل ما تعلمته',i:'check',m:8,b:[
['p','نجمع الآن HTML وCSS وJavaScript والتخزين في تطبيق حقيقي.'],
['c','html',`<input id="t" placeholder="مهمة جديدة">
<button id="add">إضافة</button>
<ul id="list"></ul>`],
['c','js',`let tasks = JSON.parse(localStorage.getItem('tasks') || '[]');

function render() {
  const ul = document.getElementById('list');
  ul.innerHTML = '';
  tasks.forEach((t, i) => {
    const li = document.createElement('li');
    li.textContent = t;
    li.onclick = () => { tasks.splice(i, 1); save(); };
    ul.appendChild(li);
  });
}
function save() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  render();
}
document.getElementById('add').onclick = () => {
  const el = document.getElementById('t');
  if (el.value.trim()) {
    tasks.push(el.value.trim());
    el.value = '';
    save();
  }
};
render();`],
['u',['<code>tasks</code> هي الحالة، و<code>render</code> ترسمها على الشاشة.','<code>save</code> تحفظ ثم تعيد الرسم.','الضغط على مهمة يحذفها بـ <code>splice</code>.']],
['t','هذا النمط يتكرر في كل تطبيق: حالة، دالة عرض، دالة حفظ. تحدٍّ لك: أضف علامة إنجاز لكل مهمة.']]},
{t:'مجلد android والصلاحيات',s:'أين تعدل اسم التطبيق والصلاحيات',i:'box',m:5,b:[
['p','بعد <code>cap add android</code> يظهر مجلد <code>android/</code>. هذه أهم أجزائه:'],
['c','المجلدات',`android/app/src/main/
├─ AndroidManifest.xml     الصلاحيات
├─ res/values/strings.xml  اسم التطبيق
└─ assets/public/          نسخة من www`],
['h','إضافة صلاحية'],
['p','مثلاً للكاميرا، أضف هذا السطر داخل وسم <code>manifest</code> وقبل وسم <code>application</code>:'],
['c','xml','<uses-permission android:name="android.permission.CAMERA" />'],
['t','اطلب الصلاحيات التي تحتاجها فقط. صلاحية الإنترنت موجودة افتراضياً في قالب Capacitor.']]},
{t:'حساب GitHub ومستودع',s:'مكان رفع مشروعك قبل البناء',i:'book',m:6,b:[
['u',['أنشئ حساباً على github.com.','اضغط <b>New repository</b> واكتب اسماً مثل <code>nile-app</code>.','لا تضف README الآن ليبقى المستودع فارغاً.','انسخ رابط المستودع الذي يظهر لك.']],
['h','الدخول من Termux'],
['p','GitHub لا يقبل كلمة المرور في الأوامر. أنشئ <b>Personal Access Token</b> من Settings ثم Developer settings، وفعّل صلاحيتي <code>repo</code> و<code>workflow</code>.'],
['c','bash',`git config --global user.name "اسمك"
git config --global user.email "you@example.com"`],
['t','عند <code>git push</code> اكتب اسم المستخدم، وفي خانة كلمة المرور الصق الـ Token. احفظه في مكان آمن ولا تشاركه مع أحد.']]},
{t:'تثبيت الـ APK على هاتفك',s:'من الملف المحمّل إلى تطبيق يعمل',i:'phone',m:4,b:[
['u',['نزّل <code>app-debug</code> من Actions، وهو ملف مضغوط.','فك ضغطه من تطبيق ملفات الهاتف.','اضغط على <code>app-debug.apk</code>.','فعّل «السماح بالتثبيت من هذا المصدر» حين يطلب الهاتف.','اضغط تثبيت ثم افتح التطبيق.']],
['t','إن فشل التثبيت فوق نسخة قديمة، احذف القديمة أولاً لأن توقيعها قد يختلف. نسخة debug للتجربة فقط وليست للنشر.']]},
{t:'تحديث التطبيق',s:'رقم الإصدار ورفع نسخة جديدة',i:'rocket',m:4,b:[
['p','عند إصدار نسخة جديدة ارفع رقمي الإصدار في <code>android/app/build.gradle</code>:'],
['c','gradle',`defaultConfig {
    versionCode 2
    versionName "1.1"
}`],
['u',['<code>versionCode</code> رقم صحيح يزيد مع كل نسخة، ويرفض المتجر أي رقم مكرر.','<code>versionName</code> النص الذي يراه المستخدم.']],
['c','bash',`git add .
git commit -m "version 1.1"
git push`],
['t','ملف الـ workflow يشغّل <code>cap sync</code> تلقائياً، لذلك يكفي رفع تعديلاتك وانتظار البناء.']]},
{t:'الأخطاء الشائعة وحلولها',s:'قائمة سريعة تنقذك وقت التعثر',i:'bulb',m:5,b:[
['u',['<b>صفحة بيضاء في التطبيق:</b> الملف ليس داخل <code>www</code>، أو فيه خطأ JavaScript. جرّبه في المتصفح أولاً.','<b>التعديلات لا تظهر:</b> نسيت <code>cap sync</code> أو لم ترفع التعديل إلى GitHub.','<b>فشل البناء في Actions:</b> افتح التشغيل الفاشل واقرأ أول سطر أحمر.','<b>الأزرار لا تستجيب:</b> تأكد أن معرّف العنصر في JavaScript يطابق <code>id</code> في HTML.','<b>الخطوط لا تظهر دون إنترنت:</b> ضمّنها داخل <code>www</code> بدل الروابط الخارجية.','<b>Permission denied في Termux:</b> نفّذ <code>termux-setup-storage</code>.']],
['h','قاعدة الحل'],
['p','اقرأ رسالة الخطأ كاملة، غيّر شيئاً واحداً كل مرة، ثم أعد التجربة. وهكذا تعلّمت كل خطوات الرحلة من الفكرة إلى التطبيق المنشور.']]}
];
const L=[N[0],L0[0],L0[1],N[1],L0[2],N[2],N[3],L0[3],N[4],N[5],L0[4],N[6],L0[5],L0[6],N[7],L0[7],N[8],L0[8],N[9],L0[9],N[10],L0[10],N[11],N[12]];
L.push(
{t:'فكرة الأتمتة الكاملة',s:'اكتب الأوامر مرة واحدة في YAML',i:'flow',m:4,b:[
['p','بدل أن تنفّذ أوامر التثبيت والمزامنة والبناء بنفسك، تكتبها مرة واحدة في ملف YAML، ويتولى GitHub تنفيذها عند كل رفع.'],
['h','ما الذي تفعله أنت؟'],
['u',['تكتب تطبيقك داخل <code>www/index.html</code>.','تحتفظ بثلاثة ملفات صغيرة: <code>package.json</code> و<code>capacitor.config.json</code> وملف الـ workflow.','ترفع المشروع بـ <code>git push</code>. هذا كل شيء.']],
['h','ما الذي يفعله GitHub؟'],
['u',['يثبّت Node وJava.','يثبّت الحزم من <code>package.json</code>.','ينشئ مشروع Android إن لم يكن موجوداً.','يزامن ملفات <code>www</code> إليه.','يبني ملف APK ويضعه جاهزاً للتنزيل.']],
['c','شكل المستودع',`nile-app/
├─ .github/workflows/build.yml
├─ www/index.html
├─ package.json
├─ capacitor.config.json
└─ .gitignore`],
['t','لا تحتاج مجلد <code>android</code> في مشروعك. يُولَّد في كل بناء، فيبقى المستودع صغيراً ونظيفاً.']]},
{t:'الملفات الثلاثة الجاهزة',s:'package.json وconfig و.gitignore',i:'box',m:5,b:[
['p','أنشئها في مجلد المشروع. الحزم مكتوبة في <code>package.json</code>، لذلك لن تحتاج <code>npm install</code> على هاتفك أبداً.'],
['c','package.json',`{
  "name": "nile-app",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "@capacitor/core": "^7.0.0",
    "@capacitor/android": "^7.0.0"
  },
  "devDependencies": {
    "@capacitor/cli": "^7.0.0"
  }
}`],
['c','capacitor.config.json',`{
  "appId": "com.example.myapp",
  "appName": "تطبيقي",
  "webDir": "www"
}`],
['c','.gitignore',`node_modules/
android/`],
['u',['وضع <code>android/</code> في <code>.gitignore</code> يجعل GitHub يولّده من جديد في كل بناء.','<code>^7.0.0</code> يثبّت الإصدار الرئيسي 7 ليبقى البناء مستقراً.','غيّر <code>appId</code> و<code>appName</code> إلى بيانات تطبيقك.']],
['t','عند استخدام إضافة مثل haptics، أضفها هنا داخل <code>dependencies</code> بنفس الإصدار الرئيسي، وستُثبَّت تلقائياً في البناء.']]},
{t:'الـ workflow الكامل',s:'تثبيت ومزامنة وبناء في ملف واحد',i:'flow',m:8,b:[
['p','احفظه باسم <code>.github/workflows/build.yml</code>. كل خطوة فيه تحل مكان أمر كنت ستكتبه بنفسك.'],
['c','yaml',`name: Build Android APK
on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21

      - name: Install dependencies
        run: npm install

      - name: Add Android platform
        run: |
          if [ ! -d android ]; then
            npx cap add android
          fi

      - name: Sync web files
        run: npx cap sync android

      - name: Build APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug

      - uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk`],
['h','ترجمة كل خطوة'],
['u',['<code>Install dependencies</code> هي <code>npm install</code> التي كنت تنفذها.','<code>Add Android platform</code> هي <code>cap add android</code>، وتعمل فقط إن لم يوجد المجلد.','<code>Sync web files</code> هي <code>cap sync</code> وتنسخ <code>www</code> إلى Android.','<code>Build APK</code> هي أوامر Gradle التي تنتج الملف.','<code>upload-artifact</code> يحفظ الـ APK لتنزّله.']],
['t','لا نستخدم <code>cache: npm</code> هنا لأنه يتطلب ملف <code>package-lock.json</code>. إن ظهر خطأ SDK فأضف قبل الخطوات خطوة <code>android-actions/setup-android@v3</code>.']]},
{t:'تخصيص ذكي في الـ YAML',s:'إصدار تلقائي وأيقونات وصلاحيات',i:'sliders',m:7,b:[
['p','أضف هذه الخطوات بعد خطوة <code>Add Android platform</code> وقبل <code>Build APK</code> حسب حاجتك.'],
['h','رقم إصدار يزيد تلقائياً'],
['c','yaml',`      - name: Set version
        env:
          N: \${{ github.run_number }}
        run: |
          sed -i "s/versionCode 1/versionCode $N/" android/app/build.gradle
          sed -i 's/versionName "1.0"/versionName "1.'$N'"/' android/app/build.gradle`],
['h','أيقونات تلقائية'],
['p','ضع <code>assets/icon-only.png</code> في المشروع، وستُولَّد الأيقونات وحدها. إن لم يوجد الملف تُتجاوز الخطوة.'],
['c','yaml',`      - name: Generate icons
        if: \${{ hashFiles('assets/icon-only.png') != '' }}
        run: |
          npm i -D @capacitor/assets
          npx capacitor-assets generate --android`],
['h','صلاحية تلقائية'],
['c','yaml',`      - name: Add camera permission
        run: |
          sed -i 's|<application|<uses-permission android:name="android.permission.CAMERA" />\\n    <application|' android/app/src/main/AndroidManifest.xml`],
['h','نسخة منشورة عند وسم الإصدار'],
['p','غيّر بداية الملف ليعمل عند الوسوم، وأضف الصلاحية وخطوة النشر:'],
['c','yaml',`on:
  push:
    tags: ['v*']
permissions:
  contents: write

# ... وفي نهاية الخطوات:
      - uses: softprops/action-gh-release@v2
        with:
          files: android/app/build/outputs/apk/debug/app-debug.apk`],
['t','بما أن مجلد <code>android</code> يُولَّد في كل بناء، فأي تعديل يدوي فيه سيضيع. اجعل التعديلات خطوات <code>sed</code> في الـ YAML كما في الأمثلة.']]},
{t:'الرفع وتشغيل كل شيء',s:'أمر واحد ويبدأ البناء كاملاً',i:'rocket',m:5,b:[
['p','بعد تجهيز الملفات الخمسة، هذه هي خطوتك الوحيدة:'],
['c','bash',`cd ~/nile-app
git init
git add .
git commit -m "first build"
git branch -M main
git remote add origin https://github.com/USER/REPO.git
git push -u origin main`],
['h','تابع التنفيذ'],
['u',['افتح تبويب <b>Actions</b> في المستودع.','الدائرة الصفراء تعني أن البناء يعمل، والخضراء نجاحه، والحمراء فشله.','عند الفشل افتح التشغيل واقرأ أول سطر أحمر.','عند النجاح نزّل <code>app-debug</code> من قسم Artifacts.']],
['h','كل تحديث بعد ذلك'],
['c','bash',`git add .
git commit -m "update"
git push`],
['t','يمكنك أيضاً تشغيل البناء يدوياً: من تبويب Actions اختر الـ workflow ثم <b>Run workflow</b>. وهكذا صار نظامك كاملاً: تكتب، ترفع، تنزّل.']]}
);
L.push(
{t:'لماذا الأتمتة توفر الإنترنت',s:'ما الذي ينزّله هاتفك فعلاً',i:'flow',m:4,b:[
['p','بناء تطبيق Android يحتاج أدوات ضخمة: Node وJava وAndroid SDK وملفات Gradle. تنزيلها على هاتفك قد يستهلك مئات الميجابايت وربما أكثر. الأتمتة تنقل كل هذا إلى خوادم GitHub.'],
['h','المقارنة'],
['u',['<b>الطريقة التقليدية:</b> تنزّل الأدوات كلها على هاتفك، وتعيد تنزيل الحزم عند كل مشروع.','<b>طريقة الأتمتة:</b> ترفع ملفات نصية صغيرة، ثم تنزّل ملف APK واحداً فقط.','البناء نفسه يتم على خادم سريع بإنترنت قوي، لا على باقتك.']],
['h','كيف توفّر أكثر؟'],
['u',['جرّب تعديلاتك في المتصفح محلياً (محطة المعاينة) قبل الرفع، فلا تحتاج إنترنت أصلاً.','اجمع عدة تعديلات ثم ارفعها مرة واحدة بدل رفع كل تعديل صغير.','نزّل الـ APK عند اكتمال النسخة فقط.','أبقِ <code>node_modules</code> و<code>android</code> في <code>.gitignore</code> حتى لا تُرفع أبداً.']],
['t','المستودعات العامة بناؤها مجاني، وللخاصة حصة شهرية مجانية. لذلك تعلّم في المحطات القادمة كيف تقلل عدد مرات البناء.']]},
{t:'قراءة YAML: الصيغة والمسافات',s:'قواعد بسيطة تمنع معظم الأخطاء',i:'term',m:5,b:[
['p','YAML لغة إعدادات بسيطة، لكنها تعتمد على <b>المسافات</b>. خطأ في مسافة واحدة يفسد الملف كله.'],
['c','yaml',`# هذا تعليق
name: مثال            # مفتاح: قيمة
on: [push]            # قائمة مضغوطة
steps:                # قائمة بعناصر
  - name: الأولى
    run: echo hi
  - name: الثانية
    run: |
      echo سطر 1
      echo سطر 2`],
['h','القواعد'],
['u',['استخدم <b>مسافتين</b> لكل مستوى، ولا تستخدم Tab أبداً.','<code>مفتاح: قيمة</code> مع مسافة بعد النقطتين.','الشرطة <code>-</code> تبدأ عنصراً في قائمة.','العلامة <code>|</code> تبدأ نصاً متعدد الأسطر، وكل سطر فيه أمر مستقل.','ضع القيم الغريبة بين علامات اقتباس مثل <code>\'v*\'</code>.','<code>#</code> يبدأ تعليقاً يتجاهله GitHub.']],
['t','عند كتابة الملف على الهاتف، لوحة المفاتيح تضيف أحياناً مسافات أو علامات اقتباس مائلة. راجع الملف قبل الرفع، وأي علامة اقتباس مائلة تُفسد الأمر.']]},
{t:'المحفزات: متى يبدأ البناء',s:'تحكم في وقت التشغيل لتوفير الدقائق',i:'clock',m:5,b:[
['p','القسم <code>on</code> يحدد ما الذي يشغّل الـ workflow.'],
['c','yaml',`on:
  push:
    branches: [main]
    paths:
      - 'www/**'
      - 'package.json'
      - 'capacitor.config.json'
      - '.github/workflows/**'
  workflow_dispatch:
  schedule:
    - cron: '0 6 * * 5'`],
['u',['<code>push</code> مع <code>branches</code>: يبدأ عند الرفع على الفرع المحدد.','<code>paths</code>: يبدأ فقط إذا تغيّر أحد هذه الملفات، فلا يُهدر بناء على تعديل README مثلاً.','<code>workflow_dispatch</code>: زر <b>Run workflow</b> اليدوي في تبويب Actions.','<code>schedule</code>: تشغيل دوري بتوقيت UTC. المثال: كل جمعة السادسة صباحاً.','<code>tags</code>: يبدأ عند رفع وسم مثل <code>v1.0</code>.']],
['t','احرص على إبقاء <code>.github/workflows/**</code> ضمن <code>paths</code>، وإلا لن يبدأ بناء عند تعديل الـ YAML نفسه.']]},
{t:'الخطوات: uses وrun وwith وenv',s:'تشريح كل سطر في الخطوة',i:'layout',m:6,b:[
['p','كل خطوة في <code>steps</code> إما تستخدم إجراءً جاهزاً (<code>uses</code>) أو تنفذ أمراً (<code>run</code>).'],
['c','yaml',`- uses: actions/setup-node@v4
  with:
    node-version: 20

- name: Build
  working-directory: android
  run: ./gradlew assembleDebug
  env:
    CI: true

- name: Only on main
  if: github.ref == 'refs/heads/main'
  run: echo "main branch"`],
['u',['<code>uses</code>: يشغّل إجراءً جاهزاً من GitHub أو من المجتمع، و<code>@v4</code> هو إصداره.','<code>with</code>: إعدادات ذلك الإجراء.','<code>run</code>: أمر أو عدة أوامر في الطرفية.','<code>name</code>: اسم يظهر في السجل، وهو يسهل قراءة الأخطاء.','<code>working-directory</code>: ينفذ الأمر داخل مجلد محدد بدل <code>cd</code>.','<code>env</code>: متغيرات بيئة لهذه الخطوة.','<code>if</code>: ينفذ الخطوة عند تحقق الشرط فقط.']],
['t','سمِّ كل خطوة اسماً واضحاً. عند الفشل ستعرف فوراً أي مرحلة تعطلت دون قراءة السجل كله.']]},
{t:'المتغيرات والأسرار Secrets',s:'كلمات المرور والمفاتيح خارج الكود',i:'sliders',m:6,b:[
['p','لا تكتب أبداً مفاتيح API أو كلمات مرور داخل الملفات المرفوعة. ضعها في <b>Secrets</b> واقرأها في الـ YAML.'],
['h','إضافة سر'],
['u',['افتح المستودع ثم <b>Settings</b>.','اختر <b>Secrets and variables</b> ثم <b>Actions</b>.','اضغط <b>New repository secret</b>، واكتب الاسم والقيمة.']],
['h','استخدامه في البناء'],
['c','yaml',`- name: Create config
  env:
    API_KEY: \${{ secrets.API_KEY }}
  run: echo "window.APP_CONFIG={key:'$API_KEY'};" > www/config.js`],
['p','ثم حمّل الملف في صفحتك قبل كودك: <code>&lt;script src="config.js"&gt;&lt;/script&gt;</code>. هكذا لا يظهر المفتاح في المستودع.'],
['h','متغيرات جاهزة من GitHub'],
['u',['<code>github.run_number</code>: رقم التشغيل، يزيد مع كل بناء.','<code>github.sha</code>: معرّف آخر تعديل.','<code>github.ref_name</code>: اسم الفرع أو الوسم.']],
['t','المفتاح داخل التطبيق يمكن استخراجه من ملف APK. لا تضع مفاتيح ذات صلاحيات خطيرة، والأفضل أن يمر الطلب عبر خادم وسيط.']]},
{t:'التخزين المؤقت لتسريع البناء',s:'لا تنزّل الحزم نفسها في كل مرة',i:'zap',m:5,b:[
['p','أول بناء يحمّل كل شيء. بالتخزين المؤقت (Cache) تُحفظ الحزم ويستعيدها البناء التالي، فيقصر الوقت ويقل الاستهلاك.'],
['c','yaml',`- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      ~/.gradle/caches
      ~/.gradle/wrapper
    key: deps-\${{ hashFiles('package.json') }}
    restore-keys: deps-`],
['u',['ضعه قبل خطوة <code>npm install</code>.','<code>path</code>: المجلدات التي تُحفظ.','<code>key</code>: اسم الحفظ، ويتغير عند تغيّر <code>package.json</code> فيُبنى كاش جديد.','<code>restore-keys</code>: بديل يُستعاد إن لم يوجد المفتاح الكامل.']],
['t','لا تخزّن مجلد <code>android</code> لأنه يُولَّد في كل بناء. أول تشغيل يبقى بطيئاً، والتشغيلات التالية أسرع بوضوح.']]},
{t:'فحص أولي قبل البناء',s:'jobs وneeds: أخطاؤك تظهر في ثوانٍ',i:'check',m:6,b:[
['p','البناء الكامل يستغرق دقائق. اجعل مهمة صغيرة تفحص ملفاتك أولاً، فإن فشلت لا يبدأ البناء.'],
['c','yaml',`jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate files
        run: |
          test -f www/index.html
          grep -q viewport www/index.html
          node -e "JSON.parse(require('fs').readFileSync('package.json'))"
          node -e "JSON.parse(require('fs').readFileSync('capacitor.config.json'))"

  build:
    needs: check
    runs-on: ubuntu-latest
    steps:
      # خطوات البناء هنا`],
['u',['<code>jobs</code>: كل مهمة تعمل على جهاز مستقل.','<code>needs: check</code>: لا تبدأ مهمة البناء إلا بعد نجاح الفحص.','<code>test -f</code> يتأكد من وجود الملف.','<code>grep -q viewport</code> يتأكد أن وسم viewport موجود.','<code>JSON.parse</code> يكشف أي فاصلة ناقصة في ملفات JSON.']],
['t','فحص يستغرق ثواني يوفر عليك بناءً فاشلاً يستغرق دقائق.']]},
{t:'توقيع APK تلقائياً',s:'نسخة Release موقّعة دون أي عمل يدوي',i:'rocket',m:8,b:[
['p','بعد إنشاء المفتاح وإضافة الأسرار <code>KEYSTORE_B64</code> و<code>KS_PASS</code> و<code>KEY_ALIAS</code> (كما في محطة النسخة النهائية)، يوقّع الـ workflow الملف بنفسه.'],
['c','yaml',`- name: Build release
  run: |
    cd android
    chmod +x gradlew
    ./gradlew assembleRelease

- name: Sign APK
  env:
    KEYSTORE_B64: \${{ secrets.KEYSTORE_B64 }}
    KS_PASS: \${{ secrets.KS_PASS }}
    KEY_ALIAS: \${{ secrets.KEY_ALIAS }}
  run: |
    echo "$KEYSTORE_B64" | base64 -d > release.jks
    BT=$ANDROID_HOME/build-tools/$(ls $ANDROID_HOME/build-tools | sort -V | tail -1)
    cd android/app/build/outputs/apk/release
    $BT/zipalign -p 4 app-release-unsigned.apk aligned.apk
    $BT/apksigner sign --ks $GITHUB_WORKSPACE/release.jks \\
      --ks-key-alias "$KEY_ALIAS" --ks-pass env:KS_PASS \\
      --key-pass env:KS_PASS --out app-release.apk aligned.apk

- uses: actions/upload-artifact@v4
  with:
    name: app-release
    path: android/app/build/outputs/apk/release/app-release.apk`],
['u',['<code>assembleRelease</code> ينتج ملفاً غير موقّع باسم <code>app-release-unsigned.apk</code>.','<code>base64 -d</code> يعيد ملف المفتاح من السر النصي.','<code>zipalign</code> يرتب الملف ليعمل بكفاءة على الهاتف.','<code>apksigner</code> يوقّعه بمفتاحك.']],
['t','تأكد أن كلمة مرور المفتاح هي نفسها كلمة مرور ملف المفاتيح عند إنشائه. ولا ترفع <code>release.jks</code> إلى المستودع إطلاقاً.']]},
{t:'إصدارات GitHub: رابط مباشر',s:'ملف APK جاهز بلا فك ضغط',i:'phone',m:6,b:[
['p','ملفات Artifacts تُنزَّل مضغوطة وتحتاج فك ضغط. أما <b>Releases</b> فتعطيك ملف APK مباشراً، ورابطاً ثابتاً يمكنك مشاركته.'],
['c','yaml',`on:
  push:
    tags: ['v*']

permissions:
  contents: write

# ... وفي نهاية الخطوات:
- name: Rename
  run: cp android/app/build/outputs/apk/debug/app-debug.apk nile-$GITHUB_REF_NAME.apk

- uses: softprops/action-gh-release@v2
  with:
    files: nile-*.apk`],
['p','لإصدار نسخة جديدة، أنشئ وسماً وارفعه:'],
['c','bash',`git tag v1.0
git push origin v1.0`],
['u',['بعد نجاح البناء يظهر الملف في قسم <b>Releases</b> بالمستودع.','تنزيله من متصفح هاتفك يتم بضغطة واحدة وبدون فك ضغط.','لكل نسخة وسمها: <code>v1.1</code> ثم <code>v1.2</code> وهكذا.']],
['t','<code>permissions: contents: write</code> ضرورية، فبدونها لا يستطيع الـ workflow إنشاء الإصدار.']]},
{t:'قراءة السجلات وإصلاح الأخطاء',s:'كيف تجد سبب الفشل بسرعة',i:'bulb',m:6,b:[
['h','كيف تقرأ السجل'],
['u',['افتح <b>Actions</b> ثم التشغيل الفاشل.','اضغط على المهمة ثم على الخطوة التي بجانبها علامة حمراء.','ابحث عن أول سطر فيه <code>error</code>، فهو السبب غالباً وما بعده نتيجة له.','يمكنك إعادة المحاولة بالزر <b>Re-run failed jobs</b> دون رفع جديد.']],
['h','أخطاء شائعة'],
['u',['<b>EJSONPARSE:</b> ملف JSON فيه فاصلة أو قوس ناقص.','<b>Could not find the web assets directory:</b> مجلد <code>www</code> غير موجود أو اسمه مختلف عن <code>webDir</code>.','<b>SDK location not found:</b> أضف خطوة <code>android-actions/setup-android@v3</code>.','<b>Unsupported class file major version:</b> إصدار Java لا يناسب Capacitor، غيّره إلى 21.','<b>workflow scope:</b> الـ Token ينقصه صلاحية <code>workflow</code>.','<b>YAML syntax error:</b> راجع المسافات وعلامات الاقتباس.']],
['h','خطوة تشخيص مؤقتة'],
['c','yaml',`- name: Debug
  run: |
    ls -la
    ls android/app/src/main
    cat capacitor.config.json`],
['t','اطبع ما تشك فيه بخطوة تشخيص، ثم احذفها بعد حل المشكلة. وغيّر شيئاً واحداً في كل محاولة.']]},
{t:'الملف النهائي المتكامل',s:'كل ما تعلمته في workflow واحد',i:'flow',m:8,b:[
['p','هذا الملف يجمع الفحص والتخزين المؤقت والإصدار التلقائي والأيقونات والنشر. احفظه باسم <code>.github/workflows/build.yml</code>.'],
['c','yaml',`name: Build Android APK
on:
  push:
    branches: [main]
    tags: ['v*']
  workflow_dispatch:

permissions:
  contents: write

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Validate files
        run: |
          test -f www/index.html
          grep -q viewport www/index.html
          node -e "JSON.parse(require('fs').readFileSync('package.json'))"
          node -e "JSON.parse(require('fs').readFileSync('capacitor.config.json'))"

  build:
    needs: check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
      - uses: actions/cache@v4
        with:
          path: |
            ~/.npm
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: deps-\${{ hashFiles('package.json') }}
          restore-keys: deps-
      - name: Install dependencies
        run: npm install
      - name: Add Android platform
        run: '[ -d android ] || npx cap add android'
      - name: Set version
        env:
          N: \${{ github.run_number }}
        run: |
          sed -i "s/versionCode 1/versionCode $N/" android/app/build.gradle
          sed -i 's/versionName "1.0"/versionName "1.'$N'"/' android/app/build.gradle
      - name: Generate icons
        if: \${{ hashFiles('assets/icon-only.png') != '' }}
        run: |
          npm i -D @capacitor/assets
          npx capacitor-assets generate --android
      - name: Sync web files
        run: npx cap sync android
      - name: Build APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug
      - uses: actions/upload-artifact@v4
        with:
          name: app-debug
          path: android/app/build/outputs/apk/debug/app-debug.apk
      - name: Publish release
        if: startsWith(github.ref, 'refs/tags/v')
        uses: softprops/action-gh-release@v2
        with:
          files: android/app/build/outputs/apk/debug/app-debug.apk`],
['u',['عند <code>git push</code> على main: فحص ثم بناء ثم Artifact.','عند رفع وسم <code>v1.0</code>: يُنشر أيضاً ملف APK في Releases.','للتوقيع، استبدل خطوة البناء بخطوات محطة «توقيع APK تلقائياً».']],
['t','هذا هو نظامك الكامل: تكتب في <code>www</code>، ترفع، فيفحص GitHub ويثبّت ويزامن ويبني وينشر. وبهذا تكون قد أنهيت رحلة الأتمتة.']]}
);
L.push(
{t:'الخاتمة والتخرج',s:'شكراً لك، وهذه خطواتك التالية',i:'trophy',m:4,b:[
['h','مبروك، وصلت إلى نهاية الرحلة'],
['p','بدأت بفكرة بسيطة: صفحة ويب. وانتهيت بنظام كامل يبني تطبيق Android وينشره تلقائياً دون أن يستهلك هاتفك أو باقتك. هذا إنجاز حقيقي يستحق الاحتفاء.'],
['h','ما الذي أتقنته؟'],
['u',['بناء واجهات الهاتف بـ HTML وCSS وJavaScript.','تنظيم التطبيق في شاشات وحفظ بياناته.','تحويله إلى تطبيق Android عبر Capacitor.','أتمتة التثبيت والمزامنة والبناء والتوقيع والنشر بملف YAML.','قراءة الأخطاء وإصلاحها بنفسك.']],
['h','خطواتك التالية'],
['u',['ابنِ تطبيقاً كاملاً لفكرة تهمك، وابدأ بشاشة واحدة.','أضف حسابات المستخدمين وقاعدة بيانات سحابية مثل Firebase.','انشر تطبيقك على Google Play بنسخة AAB موقّعة.','علّم صديقاً ما تعلمته، فالتعليم أفضل طرق الإتقان.']],
['h','شكر وتقدير'],
['p','شكراً لك على وقتك وصبرك وإصرارك. أن تتعلم البرمجة من هاتفك وبإمكانات محدودة يدل على عزيمة نادرة، وهي أهم من أي أداة تعلمتها هنا. نقدّر ثقتك بنا، ونتمنى أن نرى تطبيقاتك قريباً.'],
['t','اضغط «أنهيت الرحلة» في الأسفل لتستلم شهادة التخرج الخاصة بك.']]}
);
