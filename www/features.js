// ميزات إضافية: اختبارات، محرر حي، تحديات، XP وهدف يومي وتذكير، بحث ومسرد، ترحيب، زر الرجوع ورقم الإصدار
(()=>{
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
Object.assign(IC,{
play:'<polygon points="6 3 20 12 6 21 6 3"/>',
search:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
x:'<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
bell:'<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
target:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>',
dict:'<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>'
});
S.xp=S.xp||0;S.xd=S.xd||{};S.qp=S.qp||{};S.ch=S.ch||{};S.goal=S.goal||30;
// المستخدمون القدامى: لا تُظهر شاشة الترحيب لمن بدأ الدورة
if(S.ob==null&&done.length)S.ob=1;

/* ===== XP والمستوى والهدف اليومي ===== */
const addXP=(n,why)=>{S.xp+=n;const k=day();S.xd[k]=(S.xd[k]||0)+n;sv();toast(`+${n} XP · ${why}`);if((S.xd[k]-n)<S.goal&&S.xd[k]>=S.goal)setTimeout(()=>toast('أحسنت! حققت هدفك اليومي'),1600)};
const lvl=()=>Math.floor(S.xp/100)+1;
const todayXP=()=>S.xd[day()]||0;
function toast(t){let el=document.getElementById('toast');if(!el){el=document.createElement('div');el.id='toast';el.setAttribute('role','status');document.body.appendChild(el)}el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),2200)}

/* ===== الاختبار القصير ===== */
// ترتيب ثابت مخلوط للخيارات حتى لا تكون الإجابة الصحيحة دائماً في المكان نفسه
const order=(i,k,n)=>{const a=[...Array(n).keys()];let h=(i+1)*97+(k+1)*31;for(let j=n-1;j>0;j--){h=(Math.imul(h,1103515245)+12345)&0x7fffffff;const r=h%(j+1);[a[j],a[r]]=[a[r],a[j]]}return a};
const needQuiz=i=>Q[i]&&!done.includes(i)&&!S.qp[i];
let qs=null;
function quizHTML(i){
  if(!Q[i])return '';
  const passed=done.includes(i)||S.qp[i];
  qs={i,ok:{},miss:{}};
  return `<section class="qz${passed?' ok':''}"><div class="qh">${ic('target',20)}<b>اختبر فهمك</b><span>${passed?'مكتمل':Q[i].length+' أسئلة'}</span></div>${Q[i].map((q,k)=>`<div class="qq" data-k="${k}"><p>${k+1}. ${esc(q[0])}</p>${order(i,k,q[1].length).map(o=>`<button class="qo${passed&&o===q[2]?' r':''}" data-o="${o}">${esc(q[1][o])}</button>`).join('')}</div>`).join('')}</section>`;
}
function lockGo(){const g=$('#lv .go');if(!g)return;const lk=needQuiz(cur);g.classList.toggle('lk',lk);if(lk)g.innerHTML=ic('lock',18)+' أجب عن الأسئلة لفتح المحطة التالية'}

/* ===== المحرر الحي ===== */
const WRAP={
css:c=>`<!doctype html><html lang="ar" dir="rtl"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;padding:12px}${c}</style></head><body><h1>عنوان رئيسي</h1><p>فقرة نصية للتجربة.</p><button id="btn">زر</button><div class="row"><div>1</div><div>2</div><div>3</div></div></body></html>`,
js:c=>`<!doctype html><html lang="ar" dir="rtl"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:system-ui;padding:12px}button,input{font:inherit;min-height:44px;margin:4px 0}</style></head><body><button id="btn">زر</button><input id="name" placeholder="اكتب هنا"><ul id="list"></ul><div id="out"></div><script>${c.replace(/<\/script/gi,'<\\/script')}<\/script></body></html>`,
html:c=>c
};
const LOG=`<script>(()=>{const p=(t,a)=>parent.postMessage({pg:1,t,m:a.map(x=>{try{return typeof x==='object'?JSON.stringify(x):String(x)}catch(e){return String(x)}}).join(' ')},'*');['log','warn','error'].forEach(k=>{const o=console[k];console[k]=(...a)=>{p(k,a);o.apply(console,a)}});addEventListener('error',e=>p('error',[e.message]))})()<\/script>`;
const doc=(code,lang)=>{const h=(WRAP[lang]||WRAP.html)(code);return /<head[^>]*>/i.test(h)?h.replace(/<head[^>]*>/i,m=>m+LOG):LOG+h};
let pgo=null;
function playground(code,lang,ch){
  close2();
  const el=document.createElement('div');el.id='pgd';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  const live=lang==='html'||lang==='css'||lang==='js';
  el.innerHTML=`<div class="bar"><button class="bk pgx" aria-label="إغلاق">${ic('x')}</button><span class="bt">${ch?esc(ch.t):'ملعب الكود · '+lang.toUpperCase()}</span></div>
  ${ch?`<div class="chd"><p>${ch.d}</p></div>`:''}
  <div class="pgw${live?'':' nolive'}"><textarea spellcheck="false" autocapitalize="off" autocomplete="off" dir="ltr" aria-label="الكود">${esc(code)}</textarea>
  ${live?`<div class="phn"><iframe sandbox="allow-scripts allow-modals" title="المعاينة"></iframe></div><pre class="plog" dir="ltr"></pre>`:''}</div>
  <div class="pga">${ch?`<button class="go pgc">${ic('check',18)} تحقق من الحل</button><ul class="chk"></ul>`:`<button class="go2 pgr">${ic('back',16)} استعادة الكود الأصلي</button>`}</div>`;
  document.body.appendChild(el);document.body.classList.add('pgon');
  const ta=el.querySelector('textarea'),fr=el.querySelector('iframe'),lg=el.querySelector('.plog');
  let t=0;const run=()=>{if(!fr)return;lg.textContent='';fr.srcdoc=doc(ta.value,lang)};
  ta.addEventListener('input',()=>{clearTimeout(t);t=setTimeout(run,450);if(ch){S['cd'+CH.indexOf(ch)]=ta.value;sv()}});
  ta.addEventListener('keydown',e=>{if(e.key==='Tab'){e.preventDefault();ta.setRangeText('  ',ta.selectionStart,ta.selectionEnd,'end')}});
  pgo={el,code,fr,lg,ch,ta,lang};run();
  el.onclick=e=>{
    if(e.target.closest('.pgx'))return close2();
    if(e.target.closest('.pgr')){ta.value=code;run();return}
    if(e.target.closest('.pgc'))checkCh();
  };
}
function close2(){if(!pgo)return;pgo.el.remove();pgo=null;document.body.classList.remove('pgon')}
addEventListener('message',e=>{if(!pgo||!pgo.fr||e.source!==pgo.fr.contentWindow||!e.data||!e.data.pg)return;pgo.lg.textContent+=(e.data.t==='log'?'› ':'⚠ ')+e.data.m+'\n'});

/* ===== التحديات ===== */
const has=(re)=>c=>re.test(c);
const CH=[
{t:'تحدي: جهّز مشروعك',lang:'bash',d:'اكتب أوامر Termux التي: تنشئ مجلد <code>myapp</code>، تدخل إليه، تنشئ بداخله مجلد <code>www</code>، ثم تنشئ ملف <code>www/index.html</code>.',s:'# اكتب أوامرك هنا\n',c:[['إنشاء مجلد myapp',has(/mkdir\s+(-p\s+)?myapp\b/)],['الدخول إلى المجلد',has(/cd\s+myapp\b/)],['إنشاء مجلد www',has(/mkdir\s+(-p\s+)?(myapp\/)?www\b/)],['إنشاء ملف index.html',has(/(touch|nano|>)\s*(myapp\/)?www\/index\.html/)]]},
{t:'تحدي: عدّاد ضغطات',lang:'html',d:'أكمل الصفحة لتصبح تطبيق عدّاد: زر يزيد رقماً ويعرضه. يجب أن تحتوي وسم viewport، وزراً، وحدث click، وتحديث النص.',s:'<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8">\n  <title>عدّاد</title>\n</head>\n<body>\n  <h1>0</h1>\n  \n</body>\n</html>',c:[['وسم meta viewport',has(/<meta[^>]+name=["']?viewport/i)],['عنصر button',has(/<button[\s>]/i)],['الاستماع لحدث click',has(/addEventListener\(\s*['"]click['"]|onclick\s*=/i)],['متغير عدّاد يزيد',has(/(\+\+|\+=\s*1|=\s*\w+\s*\+\s*1)/)],['تحديث النص المعروض',has(/(textContent|innerText|innerHTML)\s*=/)]]},
{t:'تحدي: إعدادات Capacitor',lang:'json',d:'اكتب <code>capacitor.config.json</code> لتطبيق اسمه «تطبيقي» ومعرّفه <code>com.my.app</code> ومجلد الويب <code>www</code>.',s:'{\n  \n}',c:[['JSON صالح',c=>{try{JSON.parse(c);return true}catch(e){return false}}],['appId = com.my.app',c=>{try{return JSON.parse(c).appId==='com.my.app'}catch(e){return false}}],['appName = تطبيقي',c=>{try{return JSON.parse(c).appName==='تطبيقي'}catch(e){return false}}],['webDir = www',c=>{try{return JSON.parse(c).webDir==='www'}catch(e){return false}}]]},
{t:'تحدي: أول بناء على السحابة',lang:'yaml',d:'اكتب workflow يعمل عند <code>push</code> على <code>main</code>، على <code>ubuntu-latest</code>، يجلب الكود ثم يبني APK للتجربة بأمر Gradle.',s:'name: Build\n',c:[['المحفز push',has(/^on:\s*[\s\S]*push/m)],['فرع main',has(/branches:\s*\[?\s*['"]?main/)],['runs-on: ubuntu-latest',has(/runs-on:\s*ubuntu-latest/)],['actions/checkout',has(/uses:\s*actions\/checkout@/)],['./gradlew assembleDebug',has(/gradlew\s+assembleDebug/)]]},
{t:'تحدي: الأتمتة الكاملة',lang:'yaml',d:'أكمل خطوات الـ job: جهّز Node، ثبّت الحزم، أضف Android إن لم يوجد، زامن، ثم ارفع الـ APK كـ Artifact.',s:'    steps:\n      - uses: actions/checkout@v4\n',c:[['actions/setup-node',has(/actions\/setup-node@/)],['npm install أو npm ci',has(/npm\s+(install|ci)\b/)],['npx cap add android',has(/cap\s+add\s+android/)],['npx cap sync',has(/cap\s+sync/)],['actions/upload-artifact',has(/actions\/upload-artifact@/)]]},
{t:'تحدي: الأتمتة المتقدمة',lang:'yaml',d:'اكتب workflow فيه: محفز وسم <code>v*</code>، وjob فحص <code>check</code> يسبق job <code>build</code> عبر <code>needs</code>، وكاش لـ Gradle، وقراءة السر <code>KS_PASS</code>.',s:'name: Release\non:\n',c:[["محفز tags: ['v*']",has(/tags:\s*\[?\s*['"]v\*['"]/)],['job باسم check',has(/^\s{2}check:/m)],['needs: check',has(/needs:\s*\[?\s*check/)],['actions/cache',has(/actions\/cache@/)],['secrets.KS_PASS',has(/\$\{\{\s*secrets\.KS_PASS\s*\}\}/)]]}
];
function checkCh(){
  const {ch,ta,el}=pgo,code=ta.value,r=ch.c.map(([l,f])=>[l,!!f(code)]),all=r.every(x=>x[1]);
  el.querySelector('.chk').innerHTML=r.map(([l,o])=>`<li class="${o?'y':'n'}">${ic(o?'check':'x',16)} ${esc(l)}</li>`).join('');
  if(all){const k=CH.indexOf(ch);if(!S.ch[k]){S.ch[k]=1;addXP(20,'تحدٍّ مكتمل')}else toast('حل صحيح!');confetti&&confetti()}
  else toast('بقيت شروط لم تتحقق');
}

/* ===== المسرد ===== */
const GL={
'Capacitor':'أداة تغلّف تطبيق الويب داخل تطبيق Android أصلي وتمنحه الوصول لمزايا الهاتف.',
'Termux':'تطبيق طرفية Linux على Android، تكتب فيه الأوامر وتدير المشروع.',
'HTML':'لغة بناء هيكل الصفحة: العناوين والنصوص والأزرار.',
'CSS':'لغة تنسيق الشكل: الألوان والأحجام والترتيب.',
'JavaScript':'لغة البرمجة التي تضيف التفاعل والمنطق.',
'Flexbox':'نظام في CSS لترتيب العناصر صفوفاً وأعمدة بسهولة.',
'viewport':'وسم meta يجعل الصفحة تأخذ عرض شاشة الهاتف بدل التصغير.',
'localStorage':'تخزين بسيط داخل المتصفح يحفظ نصوصاً حتى بعد إغلاق التطبيق.',
'JSON':'صيغة نصية لتمثيل البيانات، تُستخدم للحفظ والإعدادات.',
'npm':'مدير حزم Node.js، يثبّت المكتبات المذكورة في package.json.',
'package.json':'ملف يصف المشروع وحزمه وإصداراتها.',
'webDir':'الحقل في إعدادات Capacitor الذي يحدد مجلد ملفات الويب (عادة www).',
'appId':'المعرّف الفريد للتطبيق مثل com.my.app، لا يتغير بعد النشر.',
'sync':'الأمر npx cap sync ينسخ ملفات الويب والإضافات إلى مشروع Android.',
'Plugin':'إضافة تربط JavaScript بميزة أصلية مثل الكاميرا أو الإشعارات.',
'Gradle':'نظام البناء الذي يحوّل مشروع Android إلى APK أو AAB.',
'APK':'ملف تثبيت تطبيق Android، يصلح للتجربة والتوزيع المباشر.',
'AAB':'حزمة Android App Bundle، الصيغة المطلوبة للنشر على Google Play.',
'Keystore':'ملف مفتاح التوقيع، احتفظ به وبكلمة مروره دائماً.',
'versionCode':'رقم صحيح يزيد مع كل تحديث يُرفع إلى المتجر.',
'GitHub Actions':'خدمة تشغّل أوامرك على خوادم GitHub عند كل رفع.',
'workflow':'ملف YAML في .github/workflows يصف خطوات البناء.',
'YAML':'صيغة نصية تعتمد على المسافات، تُكتب بها ملفات GitHub Actions.',
'Secret':'قيمة سرية تُحفظ في إعدادات المستودع وتُقرأ بـ secrets.NAME.',
'Artifact':'ملف ناتج عن البناء يمكن تنزيله من صفحة التنفيذ.',
'Release':'إصدار منشور في GitHub مع ملفات مرفقة ورابط مباشر.',
'cache':'تخزين مؤقت للحزم بين مرات البناء لتسريعه.',
'manifest':'ملف AndroidManifest.xml الذي يحدد الصلاحيات وإعدادات التطبيق.'
};
const GK=Object.keys(GL),gfind=t=>{t=t.trim().toLowerCase().replace(/^npx cap /,'');return GK.find(k=>k.toLowerCase()===t||t===k.toLowerCase()+'.xml')};
function pgGloss(){sheet('مسرد المصطلحات',`<input class="srch" id="gq" type="search" placeholder="ابحث عن مصطلح…" aria-label="بحث في المسرد"><dl class="gl">${GK.map(k=>`<div><dt dir="ltr">${k}</dt><dd>${GL[k]}</dd></div>`).join('')}</dl>`);
  $('#gq').oninput=e=>{const q=e.target.value.trim().toLowerCase();document.querySelectorAll('.gl>div').forEach(d=>d.hidden=q&&!d.textContent.toLowerCase().includes(q))}}

/* ===== البحث في الدروس ===== */
const plain=h=>h.replace(/<[^>]+>/g,' ');
const IDX=L.map(l=>(l.t+' '+l.s+' '+l.b.map(x=>x[0]==='u'?x[1].join(' '):x[0]==='c'?x[2]:x[1]).map(plain).join(' ')).toLowerCase());
const sb=document.createElement('div');sb.className='sbx';
sb.innerHTML=`<label class="sw">${ic('search',18)}<input class="srch" id="lq" type="search" placeholder="ابحث في الدروس والمصطلحات…" aria-label="بحث"></label><div id="gres"></div>`;
$('#route').before(sb);
$('#lq').addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();let n=0;
  document.querySelectorAll('#route .st').forEach(s=>{const m=!q||IDX[+s.dataset.i].includes(q);s.hidden=!m;if(m)n++});
  const g=q?GK.filter(k=>k.toLowerCase().includes(q)||GL[k].includes(q)).slice(0,3):[];
  $('#gres').innerHTML=(q&&!n?'<p class="nr">لا توجد محطات مطابقة.</p>':'')+g.map(k=>`<div class="gc"><b dir="ltr">${k}</b><span>${GL[k]}</span></div>`).join('');
});

/* ===== ربط الدوال الأصلية ===== */
const _open=open;
open=function(i){
  _open(i);
  const lv=$('#lv'),art=lv.querySelector('article');
  art.insertAdjacentHTML('beforeend',quizHTML(i));
  // أزرار «جرّب» لأكواد HTML وCSS وJS
  let k=0;const cs=L[i].b.filter(x=>x[0]==='c');
  lv.querySelectorAll('.code').forEach(c=>{const x=cs[k++];if(!x||!['html','css','js'].includes(x[1]))return;
    const b=document.createElement('button');b.className='cp try';b.innerHTML=ic('play',14)+' جرّب';b.dataset.lang=x[1];c.querySelector('.ch').appendChild(b)});
  // المصطلحات القابلة للضغط
  art.querySelectorAll('code').forEach(c=>{if(!c.closest('pre')&&gfind(c.textContent)){c.classList.add('gt');c.setAttribute('role','button');c.tabIndex=0}});
  lockGo();
};
$('#lv').addEventListener('click',e=>{
  const t=e.target.closest('.try');
  if(t){e.stopImmediatePropagation();return playground(t.closest('.code').querySelector('pre').textContent,t.dataset.lang)}
  const gt=e.target.closest('code.gt');
  if(gt){const k=gfind(gt.textContent);return toast(k+': '+GL[k])}
  const o=e.target.closest('.qo');
  if(o){e.stopImmediatePropagation();const qq=o.closest('.qq'),k=+qq.dataset.k,q=Q[cur][k];
    if(o.closest('.qz.ok')||qs.ok[k])return;
    const r=+o.dataset.o===q[2];o.classList.add(r?'r':'w');
    if(r){qs.ok[k]=1;qq.querySelectorAll('.qo').forEach(b=>b.disabled=true);if(!qs.miss[k])addXP(5,'إجابة صحيحة')}
    else{qs.miss[k]=1;navigator.vibrate&&navigator.vibrate(40)}
    if(Q[cur].every((_,j)=>qs.ok[j])){S.qp[cur]=1;sv();o.closest('.qz').classList.add('ok');lockGo();const g=$('#lv .go');if(g)g.innerHTML='أتممت المحطة وانتقل للتالية';toast('ممتاز! فُتحت المحطة التالية')}
    return}
  const g=e.target.closest('.go');
  if(g){if(g.classList.contains('lk')){e.stopImmediatePropagation();toast('أجب عن أسئلة الاختبار أولاً');const z=$('#lv .qz');z&&z.scrollIntoView({behavior:'smooth',block:'start'});return}
    if(!done.includes(cur))addXP(10,'محطة مكتملة')}
},true);

const _home=home;
home=function(){_home();$('#chips').insertAdjacentHTML('beforeend',`<span class="chip">${ic('zap',16)} ${S.xp} XP · المستوى ${lvl()}</span>`)};

const _stats=stats;
stats=function(){
  _stats();
  const t=todayXP(),p=Math.min(1,t/S.goal),R=26,C=2*Math.PI*R,into=S.xp%100;
  $('#stats').insertAdjacentHTML('afterbegin',`<div class="xpc"><div class="xr"><svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--line)" stroke-width="7"/><circle cx="32" cy="32" r="${R}" fill="none" stroke="var(--sun)" stroke-width="7" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-p)}" transform="rotate(-90 32 32)"/></svg><b>${Math.round(p*100)}%</b></div>
  <div class="xt"><h3>الهدف اليومي</h3><p>${t} من ${S.goal} XP اليوم${t>=S.goal?' · تحقق!':''}</p><p>${ic('flame',15)} سلسلة ${streak()} ${streak()===1?'يوم':'أيام'}</p></div></div>
  <div class="xpc lv"><div class="xt"><h3>المستوى ${lvl()}</h3><p>${S.xp} XP إجمالاً · ${100-into} للمستوى التالي</p><div class="bar0"><div style="width:${into}%;height:100%;background:var(--nile);border-radius:4px"></div></div></div></div>`);
};

const _paths=paths;
paths=function(){
  _paths();
  $('#paths').insertAdjacentHTML('beforeend',`<h2 class="chh">${ic('trophy',20)} التحديات العملية</h2><p class="pi">طبّق ما تعلمته في كل مسار واحصل على 20 XP لكل تحدٍّ.</p>${CH.map((c,k)=>`<div class="chc${S.ch[k]?' ok':''}" data-c="${k}" role="button" tabindex="0"><span class="ti">${ic(S.ch[k]?'check':PT[k].i,22)}</span><span><small>المسار ${k+1} · ${PT[k].t}</small><b>${esc(c.t.replace('تحدي: ',''))}</b></span><em>${S.ch[k]?'مكتمل':'+20 XP'}</em></div>`).join('')}`);
};
$('#paths').addEventListener('click',e=>{const c=e.target.closest('.chc');if(!c)return;e.stopImmediatePropagation();const ch=CH[+c.dataset.c];playground(S['cd'+c.dataset.c]||ch.s,ch.lang,ch)},true);

/* ===== التذكير اليومي ===== */
const LN=()=>plug('LocalNotifications');
async function setRemind(on){
  const N=LN();
  if(!N){toast('التذكير يعمل داخل التطبيق على الهاتف فقط');return false}
  try{
    await N.cancel({notifications:[{id:7001}]}).catch(()=>{});
    if(!on)return true;
    let p=await N.checkPermissions();if(p.display!=='granted')p=await N.requestPermissions();
    if(p.display!=='granted'){toast('لم يُمنح إذن الإشعارات');return false}
    await N.schedule({notifications:[{id:7001,title:'رحلتك على النيل تنتظرك',body:'محطة واحدة اليوم تحافظ على سلسلتك. هيا!',schedule:{on:{hour:S.rh||20,minute:0},allowWhileIdle:true}}]});
    return true;
  }catch(e){toast('تعذّر ضبط التذكير');return false}
}
const _settings=settings;
settings=function(){
  _settings();
  const seg=(k,o,c)=>`<div class="seg">${o.map(x=>`<button data-${k}="${x[0]}"${String(c)===String(x[0])?' class="on"':''}>${x[1]}</button>`).join('')}</div>`;
  $('#sets').insertAdjacentHTML('afterbegin',`<div class="row"><h3>الهدف اليومي</h3>${seg('xg',[[10,'خفيف'],[30,'منتظم'],[50,'جادّ'],[100,'مكثّف']],S.goal)}</div>
  <div class="row"><h3>التذكير اليومي</h3>${seg('rm',[[0,'متوقف'],[9,'9 صباحاً'],[14,'2 ظهراً'],[20,'8 مساءً']],S.rem?S.rh:0)}</div>`);
};
$('#sets').addEventListener('click',async e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.xg){e.stopImmediatePropagation();S.goal=+b.dataset.xg;sv();settings();return}
  if(b.dataset.rm!=null){e.stopImmediatePropagation();const h=+b.dataset.rm;S.rh=h||S.rh;const ok=await setRemind(!!h);if(ok){S.rem=!!h;sv();toast(h?'سيصلك تذكير يومي':'أُوقف التذكير')}settings();return}
  if(b.id==='reset'){e.stopImmediatePropagation();if(!confirm('حذف كل التقدّم والإحصائيات؟'))return;done=[];save();Object.assign(S,{copies:0,act:{},xp:0,xd:{},qp:{},ch:{}});CH.forEach((_,k)=>delete S['cd'+k]);sv();prefs();render()}
},true);

/* ===== القائمة الجانبية ===== */
dr.insertAdjacentHTML('beforeend',`<div class="dx"><button data-x="gl">${ic('dict')}<span>مسرد المصطلحات</span></button><button data-x="pg">${ic('code')}<span>ملعب الكود</span></button></div>`);
dr.addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b)return;e.stopImmediatePropagation();drawer(false);
  if(b.dataset.x==='gl')pgGloss();else playground('<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta name="viewport" content="width=device-width,initial-scale=1">\n  <style>\n    body { font-family: system-ui; padding: 16px }\n  </style>\n</head>\n<body>\n  <h1>مرحباً بالنيل</h1>\n  <button onclick="this.textContent=\'تم!\'">اضغطني</button>\n</body>\n</html>','html')},true);

/* ===== رقم الإصدار الحقيقي ===== */
let VER='';
const AP=()=>plug('App');
(async()=>{const A=AP();if(!A)return;try{const i=await A.getInfo();VER=i.version+' ('+i.build+')'}catch(e){}})();
const _about=pgAbout;
pgAbout=function(){_about();if(VER)document.querySelectorAll('#sh .ab p').forEach(p=>{if(/الإصدار/.test(p.textContent))p.textContent='الإصدار '+VER})};

/* ===== زر الرجوع في Android ===== */
(()=>{const A=AP();if(!A)return;
  A.addListener('backButton',()=>{
    if(document.getElementById('ob'))return;
    if(pgo)return close2();
    if(dr.classList.contains('on'))return drawer(false);
    if(document.body.classList.contains('ov'))return history.back();
    const k=[...document.querySelectorAll('.tab')].findIndex(t=>t.classList.contains('on'));
    if(k>0){tab(0);refresh();return}
    A.exitApp();
  });
})();

/* ===== شاشات الترحيب ===== */
function onboard(){
  const el=document.createElement('div');el.id='ob';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');
  const lvls=[['مبتدئ تماماً','أبدأ من الصفر',0],['أعرف HTML وCSS وJS','أريد تحويل موقعي لتطبيق',15],['بنيت تطبيقاً من قبل','أريد أتمتة البناء والنشر',24]];
  const goals=[[10,'خفيف','5 دقائق يومياً'],[30,'منتظم','10 دقائق يومياً'],[50,'جادّ','20 دقيقة يومياً']];
  let st=0,start=0;
  const slides=[
    ()=>`<span class="sun2 big"></span><h2>أهلاً بك في Capacitor Nile</h2><p>من صفحة ويب بسيطة إلى تطبيق Android منشور، وكل ذلك من هاتفك.</p><button class="go obn">لنبدأ</button>`,
    ()=>`<h2>من أين تبدأ؟</h2><p>سنقترح لك نقطة البداية المناسبة.</p>${lvls.map((l,k)=>`<button class="obo" data-l="${k}"><b>${l[0]}</b><small>${l[1]}</small></button>`).join('')}`,
    ()=>`<h2>ما هدفك اليومي؟</h2><p>الالتزام القليل كل يوم أفضل من الكثير مرة واحدة.</p>${goals.map(g=>`<button class="obo" data-g="${g[0]}"><b>${g[1]} · ${g[0]} XP</b><small>${g[2]}</small></button>`).join('')}<p class="obt">${ic('bell',16)} يمكنك تفعيل تذكير يومي من الإعدادات.</p>`
  ];
  const draw=()=>{el.innerHTML=`<div class="obc">${slides[st]()}</div><div class="dots">${slides.map((_,k)=>`<i${k===st?' class="on"':''}></i>`).join('')}</div>${st?'':'<button class="obs">تخطّي</button>'}`};
  el.onclick=e=>{
    if(e.target.closest('.obs')){fin(false);return}
    if(e.target.closest('.obn')){st=1;draw();return}
    const l=e.target.closest('[data-l]');if(l){start=lvls[+l.dataset.l][2];st=2;draw();return}
    const g=e.target.closest('[data-g]');if(g){S.goal=+g.dataset.g;fin(true)}
  };
  const fin=go=>{S.ob=1;sv();el.remove();render();if(go){history.pushState({l:1},'');open(start)}};
  draw();document.body.appendChild(el);
}

prefs();render();
if(!S.ob)onboard();
})();
