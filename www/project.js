// «مشروعي»: تطبيق قائمة مهام يكبر مع كل محطة، ثم يُبنى APK للتجربة على GitHub من داخل التطبيق
(()=>{
const {toast,esc,addXP}=window.NX;
Object.assign(IC,{hammer:'<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>',download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>'});
const P=Object.assign({name:'مهامي',color:'#0b7a85',emoji:'📝'},S.prj||{});
const saveP=()=>{S.prj=P;sv()};
const COLORS=['#0b7a85','#2f9e6e','#d6604d','#8a6fd9','#3b8fd9','#e0a21a'];
const EMOJI=['📝','✅','🚀','⭐','🌙','🌴'];

/* ===== الميزات التي تُفتح مع المحطات ===== */
const FEAT=[
{i:4,t:'هيكل الصفحة',d:'ملف HTML بعنوان تطبيقك'},
{i:5,t:'حقل وزر وقائمة',d:'عناصر الإدخال الأساسية'},
{i:7,t:'تصميم يناسب الإصبع',d:'ألوان تطبيقك وأزرار 48px ووضع داكن'},
{i:8,t:'ترتيب Flexbox',d:'الحقل والزر في صف واحد'},
{i:10,t:'إضافة المهام',d:'الضغط على الزر يضيف مهمة'},
{i:11,t:'نموذج ذكي',d:'زر Enter ويرفض المهمة الفارغة'},
{i:12,t:'شاشة «حول»',d:'شاشة ثانية مع زر الرجوع'},
{i:13,t:'حفظ المهام',d:'المهام تبقى بعد إغلاق التطبيق'},
{i:14,t:'إنجاز وحذف وعدّاد',d:'تطبيق مهام مكتمل'},
{i:15,t:'مشروع Capacitor',d:'يصبح قابلاً للبناء كتطبيق Android'}
];
const has=i=>done.includes(i);
const nF=()=>FEAT.filter(f=>has(f.i)).length;
const canBuild=()=>has(15);

/* ===== توليد كود تطبيق المتعلم ===== */
function genApp(){
  const n=esc(P.name),c=P.color,form=has(11),js=has(10)||has(11),store=has(13),full=has(14),about=has(12),style=has(7),flex=has(8);
  let css='';
  if(style)css+=`
    * { box-sizing: border-box; }
    body { margin: 0; font-family: system-ui, sans-serif; background: #f4f7f7; color: #10282d; min-height: 100dvh; }
    header { background: ${c}; color: #fff; padding: 24px 16px; }
    header h1 { margin: 0; font-size: 26px; }
    main { padding: 16px; }
    input, button { font: inherit; min-height: 48px; border-radius: 12px; }
    input { border: 1px solid #c9d6d8; padding: 0 12px; }
    button { border: 0; padding: 0 18px; background: ${c}; color: #fff; }
    ul { list-style: none; padding: 0; }
    li { background: #fff; margin: 8px 0; padding: 12px; border-radius: 12px; }
    @media (prefers-color-scheme: dark) {
      body { background: #0b1d21; color: #e4f1f0; }
      li, input { background: #14302f; color: #e4f1f0; border-color: #2a4b4f; }
    }`;
  if(flex)css+=`
    .row { display: flex; gap: 8px; }
    .row input { flex: 1; min-width: 0; }`;
  if(full)css+=`
    li { display: flex; align-items: center; gap: 10px; }
    li span { flex: 1; }
    li.done span { text-decoration: line-through; opacity: .5; }
    li button { min-height: 36px; padding: 0 12px; background: #d6604d; }`;
  if(about)css+=`
    .screen { display: none; }
    .screen.on { display: block; }`;
  const inputs=has(5)?(form?`
    <form id="f" class="row">
      <input id="task" placeholder="مهمة جديدة" autocomplete="off">
      <button>إضافة</button>
    </form>`:`
    <div class="row">
      <input id="task" placeholder="مهمة جديدة">
      <button id="add">إضافة</button>
    </div>`)+(full?`
    <p id="count"></p>`:'')+`
    <ul id="list"></ul>`:'';
  const home=`
    <main>
      <p>أول تطبيق أبنيه بنفسي ${P.emoji}</p>${inputs}${about?`
      <button id="aboutBtn">حول التطبيق</button>`:''}
    </main>`;
  const body=about?`
  <section id="home" class="screen on">
    <header><h1>${P.emoji} ${n}</h1></header>${home}
  </section>
  <section id="about" class="screen">
    <header><h1>حول ${n}</h1></header>
    <main>
      <p>صنعته في دورة Capacitor Nile.</p>
      <button id="backBtn">رجوع</button>
    </main>
  </section>`:`
  <header><h1>${P.emoji} ${n}</h1></header>${home}`;
  let s='';
  if(js&&has(5)){
    s+=`
    const input = document.getElementById('task');
    const list = document.getElementById('list');
    let tasks = [];`;
    if(store)s+=`
    try { tasks = JSON.parse(localStorage.getItem('my-tasks')) || []; } catch (e) {}
    function save() { localStorage.setItem('my-tasks', JSON.stringify(tasks)); }`;
    s+=`

    function render() {
      list.innerHTML = '';
      tasks.forEach((t, i) => {
        const li = document.createElement('li');`;
    s+=full?`
        li.className = t.done ? 'done' : '';
        const span = document.createElement('span');
        span.textContent = t.text;
        span.onclick = () => { t.done = !t.done; ${store?'save(); ':''}render(); };
        const del = document.createElement('button');
        del.textContent = 'حذف';
        del.onclick = () => { tasks.splice(i, 1); ${store?'save(); ':''}render(); };
        li.append(span, del);`:`
        li.textContent = t.text;`;
    s+=`
        list.appendChild(li);
      });`+(full?`
      const d = tasks.filter(t => t.done).length;
      document.getElementById('count').textContent = d + ' من ' + tasks.length + ' مكتملة';`:'')+`
    }

    function addTask() {
      const text = input.value.trim();${form?`
      if (!text) return;`:''}
      tasks.push({ text, done: false });
      input.value = '';${store?`
      save();`:''}
      render();
    }
`;
    s+=form?`
    document.getElementById('f').addEventListener('submit', e => {
      e.preventDefault();
      addTask();
    });`:`
    document.getElementById('add').addEventListener('click', addTask);`;
    s+=`
    render();`;
  }
  if(about)s+=`

    function show(id) {
      document.querySelectorAll('.screen').forEach(x => x.classList.toggle('on', x.id === id));
    }
    document.getElementById('aboutBtn').onclick = () => { history.pushState({ s: 'about' }, ''); show('about'); };
    document.getElementById('backBtn').onclick = () => history.back();
    addEventListener('popstate', () => show(history.state && history.state.s || 'home'));`;
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${n}</title>${css?`
  <style>${css}
  </style>`:''}
</head>
<body>${body}${s?`
  <script>${s}
  </script>`:''}
</body>
</html>
`;
}

/* ===== ملفات مشروع Capacitor ===== */
const slug=s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,'').replace(/^(\d)/,'u$1').slice(0,30)||'user';
const REPO='my-nile-app';
const files=login=>({
  'www/index.html':genApp(),
  'package.json':JSON.stringify({name:REPO,version:'1.0.0',private:true,dependencies:{'@capacitor/core':'^8.0.0','@capacitor/android':'^8.0.0'},devDependencies:{'@capacitor/cli':'^8.0.0','@capacitor/assets':'^3.0.0'}},null,2)+'\n',
  'capacitor.config.json':JSON.stringify({appId:'io.github.'+slug(login)+'.mynileapp',appName:P.name,webDir:'www'},null,2)+'\n',
  '.gitignore':'node_modules/\nandroid/\n',
  'README.md':`# ${P.name}\n\nتطبيقي الأول، صنعته في دورة Capacitor Nile.\n\nكل رفع إلى main يبني APK للتجربة وينشره في Releases.\n`,
  '.github/workflows/build.yml':`name: Build APK
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 21
      - name: Install
        run: npm install
      - name: Add Android
        run: npx cap add android
      - name: Icon
        run: npx capacitor-assets generate --android
      - name: Sync
        run: npx cap sync android
      - name: Build APK
        run: |
          cd android
          chmod +x gradlew
          ./gradlew assembleDebug
          cp app/build/outputs/apk/debug/app-debug.apk ../app.apk
      - name: Publish
        uses: softprops/action-gh-release@v2
        with:
          tag_name: build-\${{ github.run_number }}
          name: نسخة \${{ github.run_number }}
          body: نسخة تجريبية (debug) للاختبار فقط.
          files: app.apk
`
});
function iconB64(){
  const cv=document.createElement('canvas');cv.width=cv.height=1024;const x=cv.getContext('2d');
  x.fillStyle=P.color;x.fillRect(0,0,1024,1024);
  x.font='560px "Noto Color Emoji","Apple Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(P.emoji,512,560);
  return cv.toDataURL('image/png').split(',')[1];
}

/* ===== GitHub API ===== */
const TK=()=>{try{return localStorage.getItem('cnt')||''}catch(e){return ''}};
async function gh(path,opt={}){
  const r=await fetch('https://api.github.com'+path,{...opt,headers:{Accept:'application/vnd.github+json',Authorization:'Bearer '+TK(),'X-GitHub-Api-Version':'2022-11-28',...(opt.body?{'Content-Type':'application/json'}:{})}});
  let j=null;try{j=await r.json()}catch(e){}
  if(!r.ok){const e=new Error((j&&j.message)||('HTTP '+r.status));e.status=r.status;throw e}
  return j;
}
const b64=s=>btoa(unescape(encodeURIComponent(s)));
const errAr=e=>e.status===401?'الرمز غير صحيح أو منتهي. أنشئ رمزاً جديداً.':e.status===403||e.status===404?'الرمز لا يملك الصلاحيات المطلوبة (public_repo وworkflow).':/fetch|network/i.test(e.message)?'تعذّر الاتصال. تأكد من الإنترنت.':e.message;

async function build(log){
  log('التحقق من حسابك…');
  const me=await gh('/user');const o=me.login;
  log('تجهيز المستودع '+REPO+'…');
  let repo;
  try{repo=await gh(`/repos/${o}/${REPO}`)}
  catch(e){if(e.status!==404)throw e;repo=await gh('/user/repos',{method:'POST',body:JSON.stringify({name:REPO,description:'تطبيقي الأول من Capacitor Nile',auto_init:true})});await new Promise(r=>setTimeout(r,2500))}
  const br=repo.default_branch||'main';
  const ref=await gh(`/repos/${o}/${REPO}/git/ref/heads/${br}`);
  const base=await gh(`/repos/${o}/${REPO}/git/commits/${ref.object.sha}`);
  log('رفع ملفات مشروعك…');
  const F=files(o),tree=[];
  for(const [path,txt] of Object.entries(F)){const bl=await gh(`/repos/${o}/${REPO}/git/blobs`,{method:'POST',body:JSON.stringify({content:b64(txt),encoding:'base64'})});tree.push({path,mode:'100644',type:'blob',sha:bl.sha})}
  const ib=await gh(`/repos/${o}/${REPO}/git/blobs`,{method:'POST',body:JSON.stringify({content:iconB64(),encoding:'base64'})});
  tree.push({path:'assets/icon-only.png',mode:'100644',type:'blob',sha:ib.sha});
  const t=await gh(`/repos/${o}/${REPO}/git/trees`,{method:'POST',body:JSON.stringify({base_tree:base.tree.sha,tree})});
  const cm=await gh(`/repos/${o}/${REPO}/git/commits`,{method:'POST',body:JSON.stringify({message:'بناء '+P.name+' من Capacitor Nile',tree:t.sha,parents:[ref.object.sha]})});
  await gh(`/repos/${o}/${REPO}/git/refs/heads/${br}`,{method:'PATCH',body:JSON.stringify({sha:cm.sha})});
  S.bld={o,sha:cm.sha,t:Date.now()};S.bld.run=null;sv();
  log('تم الرفع، ينتظر GitHub بدء البناء…');
}

/* ===== متابعة البناء ===== */
let poll=0;
const STEP_AR={'Set up job':'تجهيز الخادم','Run actions/checkout@v4':'جلب الكود','Run actions/setup-node@v4':'تجهيز Node','Run actions/setup-java@v4':'تجهيز Java','Install':'تثبيت الحزم','Add Android':'إضافة Android','Icon':'توليد الأيقونة','Sync':'المزامنة','Build APK':'بناء APK','Publish':'النشر في Releases'};
async function track(){
  clearTimeout(poll);
  const b=S.bld;const box=document.getElementById('bst');if(!b||!box||!$('#sh').classList.contains('on'))return;
  try{
    const runs=await gh(`/repos/${b.o}/${REPO}/actions/runs?head_sha=${b.sha}&per_page=1`);
    const run=runs.workflow_runs&&runs.workflow_runs[0];
    if(!run){box.innerHTML=`<p class="bs">${spin()} ينتظر بدء البناء…</p>`;poll=setTimeout(track,6000);return}
    let steps='';
    try{const jb=await gh(`/repos/${b.o}/${REPO}/actions/runs/${run.id}/jobs`);const j=jb.jobs[0];
      if(j)steps=j.steps.filter(s=>STEP_AR[s.name]).map(s=>`<li class="${s.conclusion==='success'?'y':s.conclusion==='failure'?'n':s.status==='in_progress'?'p':''}">${s.conclusion==='success'?ic('check',15):s.conclusion==='failure'?ic('x',15):s.status==='in_progress'?spin():'<i class="dot"></i>'} ${STEP_AR[s.name]}</li>`).join('')}catch(e){}
    if(run.status!=='completed'){
      const m=Math.max(0,Math.round((Date.now()-new Date(run.created_at))/60000));
      box.innerHTML=`<p class="bs">${spin()} جارٍ البناء على خوادم GitHub · ${m} د</p><p class="bh">يستغرق عادة 4 إلى 7 دقائق. يمكنك الخروج والعودة لاحقاً.</p><ul class="bsteps">${steps}</ul>`;
      poll=setTimeout(track,8000);return;
    }
    if(run.conclusion==='success'){
      let url='';try{const rel=await gh(`/repos/${b.o}/${REPO}/releases/latest`);const a=rel.assets.find(x=>/\.apk$/.test(x.name));url=a?a.browser_download_url:rel.html_url}catch(e){url=`https://github.com/${b.o}/${REPO}/releases`}
      if(!S.built){S.built=1;sv();addXP(50,'أول APK لك!');confetti()}
      b.url=url;sv();
      box.innerHTML=`<div class="bok">${ic('check',22)}<div><b>تطبيقك جاهز!</b><span>نسخة تجريبية للاختبار فقط</span></div></div><a class="go bdl" href="${esc(url)}" target="_blank" rel="noopener">${ic('download',18)} نزّل APK</a><button class="go2 bcp" data-u="${esc(url)}">${ic('copy',15)} انسخ الرابط لمشاركته</button><p class="bh">بعد التنزيل اسمح بالتثبيت من مصادر غير معروفة إن طلب الهاتف ذلك.</p>`;
    }else{
      box.innerHTML=`<div class="bok bad">${ic('x',22)}<div><b>فشل البناء</b><span>لا تقلق، هذا جزء من التعلم.</span></div></div><ul class="bsteps">${steps}</ul><a class="go2" href="${esc(run.html_url)}" target="_blank" rel="noopener">افتح السجل على GitHub</a><p class="bh">راجع محطة «قراءة السجلات وإصلاح الأخطاء»، ثم اضغط «ابنِ» مجدداً.</p>`;
    }
  }catch(e){box.innerHTML=`<p class="bs">${esc(errAr(e))}</p>`}
}
const spin=()=>'<i class="spn"></i>';

/* ===== صفحة «مشروعي» ===== */
function pgProject(){
  const tk=TK();
  sheet('مشروعي',`
  <div class="pj">
    <div class="pjh" style="--c:${P.color}"><span class="pje">${P.emoji}</span><div><b>${esc(P.name)}</b><small>${nF()} من ${FEAT.length} ميزات · تطبيق قائمة مهام</small></div></div>
    <p class="pi">هذا تطبيقك أنت. كل محطة تنهيها تضيف إليه ميزة جديدة، وفي النهاية تبنيه APK حقيقياً.</p>
    <div class="phn pjp"><iframe sandbox="allow-scripts allow-same-origin allow-forms" title="معاينة تطبيقك"></iframe></div>
    <div class="row"><h3>اسم التطبيق</h3><input class="srch pjn" maxlength="30" value="${esc(P.name)}" aria-label="اسم التطبيق"></div>
    <div class="row"><h3>اللون</h3><div class="sw2">${COLORS.map(c=>`<button data-pc="${c}" style="background:${c}" aria-label="لون"${c===P.color?' class="on"':''}></button>`).join('')}</div></div>
    <div class="row"><h3>الأيقونة</h3><div class="sw2">${EMOJI.map(e=>`<button data-pe="${e}"${e===P.emoji?' class="on"':''}>${e}</button>`).join('')}</div></div>
    <h2 class="chh">${ic('route',20)} ميزات تطبيقك</h2>
    <ul class="ft2">${FEAT.map(f=>`<li class="${has(f.i)?'y':''}" data-li="${f.i}">${ic(has(f.i)?'check':'lock',16)}<span><b>${f.t}</b><small>${has(f.i)?f.d:'تُفتح في المحطة '+(f.i+1)+': '+esc(L[f.i].t)}</small></span></li>`).join('')}</ul>
    <button class="go2 pjc">${ic('code',16)} اعرض كود تطبيقك</button>
    <h2 class="chh">${ic('hammer',20)} ابنِ APK</h2>
    ${!canBuild()?`<p class="pi">يُفتح البناء بعد المحطة 16 «${esc(L[15].t)}».</p>`:`
    <div class="row"><h3>رمز GitHub</h3>
      <p class="bh">يُحفظ على هاتفك فقط ولا يُرسل إلا إلى GitHub.</p>
      ${tk?`<p class="tko">${ic('check',15)} الرمز محفوظ <button class="tkd">حذف</button></p>`:`
      <a class="go2" href="https://github.com/settings/tokens/new?scopes=public_repo,workflow&description=Capacitor%20Nile" target="_blank" rel="noopener">1. أنشئ رمزاً على GitHub</a>
      <p class="bh">اختر مدة الصلاحية، اترك الخيارين public_repo وworkflow محددين، ثم اضغط Generate token وانسخ الرمز.</p>
      <input class="srch tki" type="password" placeholder="2. الصق الرمز هنا (ghp_…)" dir="ltr" autocomplete="off" aria-label="رمز GitHub">
      <button class="go2 tks">حفظ الرمز</button>`}
    </div>
    <button class="go pjb"${tk?'':' disabled'}>${ic('hammer',18)} ابنِ تطبيقي الآن</button>
    <pre class="plog blog" dir="rtl"></pre>
    <div id="bst"></div>`}
  </div>`);
  const fr=document.querySelector('.pjp iframe');const upd=()=>{fr.srcdoc=genApp();const h=document.querySelector('.pjh');h.style.setProperty('--c',P.color);h.querySelector('.pje').textContent=P.emoji;h.querySelector('b').textContent=P.name};
  upd();
  document.querySelector('.pjn').oninput=e=>{P.name=e.target.value.trim()||'مهامي';saveP();clearTimeout(upd.t);upd.t=setTimeout(upd,400)};
  if(S.bld&&canBuild())track();
}
$('#sh').addEventListener('click',async e=>{
  if(!document.querySelector('#sh .pj'))return;
  const c=e.target.closest('[data-pc]'),em=e.target.closest('[data-pe]');
  if(c||em){if(c)P.color=c.dataset.pc;else P.emoji=em.dataset.pe;saveP();document.querySelectorAll(c?'[data-pc]':'[data-pe]').forEach(b=>b.classList.toggle('on',b===(c||em)));document.querySelector('.pjp iframe').srcdoc=genApp();const h=document.querySelector('.pjh');h.style.setProperty('--c',P.color);h.querySelector('.pje').textContent=P.emoji;return}
  const li=e.target.closest('[data-li]');if(li&&!has(+li.dataset.li)){const i=+li.dataset.li;history.back();setTimeout(()=>{history.pushState({l:1},'');open(i)},420);return}
  if(e.target.closest('.pjc')){window.NX.playground(genApp(),'html');return}
  if(e.target.closest('.tks')){const v=document.querySelector('.tki').value.trim();if(!/^(ghp_|github_pat_)\w+/.test(v)){toast('الرمز يبدأ عادة بـ ghp_');return}try{localStorage.setItem('cnt',v)}catch(x){}
    try{const me=await gh('/user');toast('مرحباً '+me.login+'!');pgRefresh()}catch(x){toast(errAr(x));try{localStorage.removeItem('cnt')}catch(y){}}return}
  if(e.target.closest('.tkd')){try{localStorage.removeItem('cnt')}catch(x){}pgRefresh();return}
  if(e.target.closest('.bcp')){const u=e.target.closest('.bcp').dataset.u;copy(u,e.target.closest('.bcp'));return}
  const b=e.target.closest('.pjb');
  if(b&&!b.disabled){b.disabled=true;const lg=document.querySelector('.blog');lg.textContent='';$('#bst').innerHTML='';
    try{await build(m=>lg.textContent+='• '+m+'\n');setTimeout(track,5000)}catch(x){lg.textContent+='✗ '+errAr(x)+'\n'}
    b.disabled=false}
});
function pgRefresh(){const s=$('#sh'),y=s.scrollTop,ps=history.pushState;history.pushState=()=>{};try{pgProject()}finally{history.pushState=ps}s.scrollTop=y}

/* ===== نقاط الدخول ===== */
const _home=home;
home=function(){_home();let c=document.getElementById('pjcard');
  if(!c){c=document.createElement('button');c.id='pjcard';c.className='pjcard';$('.sbx').before(c)}
  c.innerHTML=`<span class="pje" style="background:${P.color}">${P.emoji}</span><span><small>مشروعي</small><b>${esc(P.name)}</b><em>${nF()} من ${FEAT.length} ميزات${canBuild()?' · جاهز للبناء':''}</em></span>${ic('next',18)}`};
document.addEventListener('click',e=>{if(e.target.closest('#pjcard'))pgProject()});
dr.querySelector('.dx').insertAdjacentHTML('afterbegin',`<button data-y="pj">${ic('hammer')}<span>مشروعي</span></button>`);
dr.addEventListener('click',e=>{if(e.target.closest('[data-y="pj"]')){e.stopImmediatePropagation();drawer(false);pgProject()}},true);

// بطاقة «أُضيف إلى مشروعك» في نهاية المحطة
const _open=open;
open=function(i){_open(i);const f=FEAT.find(x=>x.i===i);if(!f)return;
  $('#lv article').insertAdjacentHTML('beforeend',`<div class="pjadd"><span class="pje" style="background:${P.color}">${P.emoji}</span><span><small>${has(i)?'في مشروعك':'أنهِ المحطة لتضيف إلى مشروعك'}</small><b>${f.t}</b></span><button class="pjgo">افتح</button></div>`)};
$('#lv').addEventListener('click',e=>{if(e.target.closest('.pjgo')){e.stopImmediatePropagation();history.back();setTimeout(pgProject,420)}},true);

window.NXP={genApp,files,iconB64,build,TK,REPO,pgProject};
AC.push(['hammer','أول APK','بنيت تطبيقك الأول من داخل التطبيق',()=>!!S.built]);
render();
})();
