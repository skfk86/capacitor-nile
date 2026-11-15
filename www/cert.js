// الشهادة الموثّقة: شروط واضحة، اختبار نهائي يُصحَّح على الخادم، دليل عملي من GitHub، رمز QR ورقم تحقق
(()=>{
const {toast,esc}=window.NX;
const FN='https://mouzkibnxknubbfljcqw.supabase.co/functions/v1/cert';
const VERIFY='https://skfk86.github.io/capacitor-nile/verify.html?id=';
Object.assign(IC,{shield:'<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',qr:'<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>'});

async function api(body){
  const r=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
  let j={};try{j=await r.json()}catch(e){}
  if(!r.ok&&!j.message)j.message='تعذّر الاتصال بالخادم ('+r.status+')';
  return j;
}
const TK=()=>window.NXP?window.NXP.TK():'';
const fmtDate=d=>new Date(d).toLocaleDateString('ar',{year:'numeric',month:'long',day:'numeric'});

/* ===== صفحة الشهادة ===== */
let st=null; // حالة الخادم: {login, project, attempts_left}
async function pgCert(){
  if(S.cert)return showCert(S.cert);
  const allDone=done.length===L.length,tk=TK();
  sheet('الشهادة الموثّقة',`<div class="cz">
    <div class="czh">${ic('shield',30)}<div><b>شهادة إتمام موثّقة</b><small>يمكن لأي شخص التحقق منها برمز QR</small></div></div>
    <p class="pi">لضمان قيمتها، لا تُمنح الشهادة إلا بعد ثلاثة شروط:</p>
    <ul class="creq">
      <li class="${allDone?'y':''}">${ic(allDone?'check':'lock',18)}<span><b>أنهِ كل المحطات</b><small>${done.length} من ${L.length}</small></span></li>
      <li id="rq2" class="">${ic('lock',18)}<span><b>ابنِ تطبيقك الحقيقي</b><small>${tk?'جارٍ التحقق من مستودعك…':'احفظ رمز GitHub في «مشروعي» ثم ابنِ تطبيقك'}</small></span></li>
      <li id="rq3">${ic('lock',18)}<span><b>انجح في الاختبار النهائي</b><small>20 سؤالاً · 25 دقيقة · النجاح من 80% · 3 محاولات يومياً</small></span></li>
    </ul>
    <div class="row"><h3>اسمك كما سيظهر في الشهادة</h3><input class="srch czn" maxlength="60" value="${esc(S.name||'')}" placeholder="الاسم الكامل" aria-label="الاسم"></div>
    <button class="go czs" disabled>${ic('target',18)} ابدأ الاختبار النهائي</button>
    <p class="bh czm"></p>
    <button class="go2 czv">${ic('qr',16)} تحقق من شهادة</button>
  </div>`);
  const nm=document.querySelector('.czn');nm.oninput=()=>{S.name=nm.value.trim();sv();gate()};
  st=null;gate();
  if(!tk)return;
  const r=await api({action:'status',token:tk});
  if(r.certificate){S.cert=r.certificate;sv();return showCert(r.certificate,true)}
  if(r.error){msg(r.message);return}
  st=r;const rq2=document.getElementById('rq2');if(!rq2)return;
  rq2.className=r.project?'y':'';rq2.innerHTML=`${ic(r.project?'check':'lock',18)}<span><b>ابنِ تطبيقك الحقيقي</b><small>${r.project?'وُجد تطبيقك في github.com/'+esc(r.login)+'/my-nile-app':'لم نجد APK في مستودعك بعد. ابنِه من «مشروعي».'}</small></span>`;
  gate();
}
const msg=t=>{const m=document.querySelector('.czm');if(m)m.textContent=t||''};
function gate(){const b=document.querySelector('.czs');if(!b)return;
  const why=done.length<L.length?'أنهِ كل المحطات أولاً.':!TK()?'احفظ رمز GitHub من «مشروعي».':!st?'جارٍ التحقق…':!st.project?'ابنِ تطبيقك أولاً من «مشروعي».':!st.attempts_left?'استنفدت محاولات اليوم. عُد بعد 24 ساعة.':(S.name||'').length<3?'اكتب اسمك الكامل.':'';
  b.disabled=!!why;msg(why||`تبقّى لك ${st.attempts_left} ${st.attempts_left===1?'محاولة':'محاولات'} اليوم.`)}
$('#sh').addEventListener('click',e=>{
  if(!document.querySelector('#sh .cz'))return;
  if(e.target.closest('.czs')&&!e.target.closest('.czs').disabled)return startExam();
  if(e.target.closest('.czv'))return verifyPrompt();
  if(e.target.closest('.czsh'))return shareCert();
  if(e.target.closest('.czl'))return copyLink();
});

/* ===== الاختبار النهائي ===== */
let X=null; // {session,questions,ans,i,end,timer}
async function startExam(){
  if(!confirm('سيبدأ الاختبار الآن ويُحتسب محاولة. مستعد؟'))return;
  msg('جارٍ تجهيز الأسئلة…');
  const r=await api({action:'start',token:TK()});
  if(r.certificate){S.cert=r.certificate;sv();return showCert(r.certificate)}
  if(!r.session){msg(r.message||'تعذّر بدء الاختبار');return}
  const order=q=>q.options.map((_,i)=>i).sort(()=>Math.random()-.5);
  X={session:r.session,qs:r.questions.map(q=>({...q,ord:order(q)})),ans:{},i:0,end:new Date(r.expires_at).getTime(),pass:r.pass};
  const el=document.createElement('div');el.id='exam';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);document.body.classList.add('pgon');
  el.addEventListener('click',onExam);drawQ();X.timer=setInterval(tick,1000);tick();
}
function tick(){if(!X)return;const s=Math.max(0,Math.round((X.end-Date.now())/1000)),t=document.querySelector('#exam .xt2');
  if(t){t.textContent=String(Math.floor(s/60)).padStart(2,'0')+':'+String(s%60).padStart(2,'0');t.classList.toggle('low',s<120)}
  if(s<=0){clearInterval(X.timer);toast('انتهى الوقت، يُسلَّم الاختبار تلقائياً');submit(true)}}
function drawQ(){
  const q=X.qs[X.i],n=X.qs.length,answered=Object.keys(X.ans).length;
  document.getElementById('exam').innerHTML=`<div class="xb"><button class="eic xq" aria-label="خروج">${ic('x',20)}</button><b>الاختبار النهائي</b><span class="tsp"></span><span class="xt2">--:--</span></div>
  <div class="xp"><i style="width:${answered/n*100}%"></i></div>
  <div class="xbody"><small>السؤال ${X.i+1} من ${n}</small><h2>${esc(q.q)}</h2>
  ${q.ord.map((o,k)=>`<button class="qo${X.ans[q.id]===o?' sel':''}" data-o="${o}"><i>${'أبجد'[k]}</i><span>${esc(q.options[o])}</span></button>`).join('')}</div>
  <div class="xdots">${X.qs.map((qq,k)=>`<button class="${k===X.i?'on':''} ${X.ans[qq.id]!=null?'a':''}" data-j="${k}" aria-label="السؤال ${k+1}">${k+1}</button>`).join('')}</div>
  <div class="xnav"><button class="eb2 xpr"${X.i?'':' disabled'}>السابق</button><span class="tsp"></span>${X.i<n-1?'<button class="go xnx">التالي</button>':`<button class="go xsb">تسليم (${answered}/${n})</button>`}</div>`;
  tick();
}
function onExam(e){
  const o=e.target.closest('.qo');if(o){X.ans[X.qs[X.i].id]=+o.dataset.o;if(X.i<X.qs.length-1){X.i++;setTimeout(drawQ,160)}drawQ();return}
  const j=e.target.closest('[data-j]');if(j){X.i=+j.dataset.j;drawQ();return}
  if(e.target.closest('.xpr')){X.i--;drawQ();return}
  if(e.target.closest('.xnx')){X.i++;drawQ();return}
  if(e.target.closest('.xsb')){const left=X.qs.length-Object.keys(X.ans).length;if(confirm(left?`بقي ${left} سؤال بلا إجابة. تسليم الآن؟`:'تسليم الاختبار؟'))submit();return}
  if(e.target.closest('.xq')){if(confirm('الخروج يُنهي المحاولة وتُحتسب. متأكد؟'))submit(true);return}
}
let sending=false;
async function submit(){
  if(!X||sending)return;sending=true;clearInterval(X.timer);
  const el=document.getElementById('exam');el.innerHTML=`<div class="xres"><i class="spn big"></i><p>جارٍ التصحيح على الخادم…</p></div>`;
  const r=await api({action:'submit',token:TK(),session:X.session,answers:X.ans,name:S.name});sending=false;
  if(r.certificate){S.cert=r.certificate;sv();if(window.NX.addXP)window.NX.addXP(100,'شهادة موثّقة');confetti();
    el.innerHTML=`<div class="xres ok">${ic('award',56)}<h2>مبروك! نجحت بنسبة ${r.score}%</h2><p>صدرت شهادتك الموثّقة برقم <b dir="ltr">${esc(r.certificate.id)}</b></p><button class="go xdone">اعرض شهادتي</button></div>`}
  else if(r.passed===false)el.innerHTML=`<div class="xres bad">${ic('target',56)}<h2>نتيجتك ${r.score}%</h2><p>أجبت ${r.right} من ${r.total} إجابة صحيحة، والنجاح من ${r.pass}%. راجع المحطات وحاول مجدداً.</p><button class="go xdone">حسناً</button></div>`;
  else el.innerHTML=`<div class="xres bad">${ic('x',56)}<h2>تعذّر التسليم</h2><p>${esc(r.message||'خطأ غير معروف')}</p><button class="go xdone">حسناً</button></div>`;
  el.querySelector('.xdone').onclick=()=>{closeExam();if(S.cert)showCert(S.cert,true);else pgCert()};
}
function closeExam(){const el=document.getElementById('exam');if(el)el.remove();document.body.classList.remove('pgon');if(X)clearInterval(X.timer);X=null}
const prevB=window.NXB;window.NXB=()=>{if(document.getElementById('exam')){if(X&&!sending){if(confirm('الخروج يُنهي المحاولة وتُحتسب. متأكد؟'))submit(true)}else closeExam();return true}return prevB?prevB():false};

/* ===== رسم الشهادة ===== */
function render(c){
  const cv=document.createElement('canvas');cv.width=1080;cv.height=1440;const x=cv.getContext('2d');
  const g=x.createLinearGradient(0,0,0,1440);g.addColorStop(0,'#041f25');g.addColorStop(1,'#0b5c66');x.fillStyle=g;x.fillRect(0,0,1080,1440);
  x.strokeStyle='rgba(240,168,30,.75)';x.lineWidth=6;x.strokeRect(40,40,1000,1360);x.strokeStyle='rgba(240,168,30,.3)';x.lineWidth=2;x.strokeRect(58,58,964,1324);
  x.fillStyle='#f0a81e';x.beginPath();x.arc(540,190,62,0,7);x.fill();
  x.direction='rtl';x.textAlign='center';
  const T=(t,y,s,w=400,col='#fff')=>{x.fillStyle=col;x.font=`${w} ${s}px "Noto Sans Arabic","IBM Plex Sans Arabic",system-ui,sans-serif`;x.fillText(t,540,y)};
  T('شهادة إتمام موثّقة',330,64,700,'#f0a81e');
  x.direction='ltr';T('Capacitor Nile',405,44,700,'#cfe8e8');x.direction='rtl';
  T('تشهد منصة Capacitor Nile بأن',505,36,400,'#cfe8e8');
  T(c.name,610,84,700,'#ffd877');
  T('أتمّ دورة بناء تطبيقات Android بنجاح',700,40,400);
  T('HTML وCSS وJavaScript وCapacitor وGitHub Actions',760,32,400,'#cfe8e8');
  T(`اجتاز الاختبار النهائي بنسبة ${c.score}% وبنى تطبيقاً حقيقياً`,840,32,700,'#fff');
  x.direction='ltr';T('github.com/'+c.login+'/my-nile-app',892,28,400,'#9fd3d6');x.direction='rtl';
  T(fmtDate(c.issued_at),950,32,400,'#cfe8e8');
  QR.draw(x,VERIFY+c.id,400,990,280,'#041f25','#ffffff');
  x.direction='ltr';T(c.id,1320,40,700,'#ffd877');x.direction='rtl';
  T('امسح الرمز أو أدخل الرقم للتحقق من صحة الشهادة',1372,24,400,'#9fd3d6');
  return cv;
}
function showCert(c,replace){
  const ps=history.pushState;if(replace&&document.querySelector('#sh.on'))history.pushState=()=>{};
  try{sheet('شهادتي الموثّقة',`<div class="cz"><img class="czimg" alt="شهادة ${esc(c.name)}" src="${render(c).toDataURL('image/png')}">
    <div class="czid"><span>رقم التحقق</span><b dir="ltr">${esc(c.id)}</b></div>
    <button class="go czsh">${ic('copy',18)} شارك الشهادة</button>
    <button class="go2 czl">${ic('qr',16)} انسخ رابط التحقق</button>
    <p class="bh">أضف الرابط إلى سيرتك الذاتية أو LinkedIn. أي شخص يفتحه يرى أن الشهادة صحيحة وصادرة باسمك، ومعها رابط تطبيقك.</p></div>`)}
  finally{history.pushState=ps}
}
async function shareCert(){const c=S.cert;if(!c)return;const cv=render(c);
  cv.toBlob(async b=>{const f=new File([b],'nile-certificate-'+c.id+'.png',{type:'image/png'});const FS=plug('Filesystem'),SH=plug('Share');
    const text=`حصلت على شهادة Capacitor Nile الموثّقة! تحقق منها: ${VERIFY+c.id}`;
    if(FS&&SH){try{const data=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result.split(',')[1]);fr.readAsDataURL(b)});const w=await FS.writeFile({path:f.name,data,directory:'CACHE'});await SH.share({title:'شهادتي',text,files:[w.uri]});return}catch(e){if(/cancel/i.test((e&&e.message)||''))return}}
    try{if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],text});return}}catch(e){if(e&&e.name==='AbortError')return}
    const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;document.body.appendChild(a);a.click();a.remove()})}
function copyLink(){const u=VERIFY+S.cert.id,b=document.querySelector('.czl');copy(u,b)}

/* ===== التحقق من شهادة داخل التطبيق ===== */
async function verifyPrompt(){
  const id=(prompt('أدخل رقم الشهادة، مثل CN-ABCD-2345')||'').trim().toUpperCase();if(!id)return;
  const r=await api({action:'verify',id});
  if(r.valid)alert(`✓ شهادة صحيحة\n\nالاسم: ${r.name}\nالتاريخ: ${fmtDate(r.issued_at)}\nالنتيجة: ${r.score}%\nالتطبيق: ${r.repo_url}`);
  else alert('✗ لا توجد شهادة بهذا الرقم.');
}

window.pgCert=pgCert; // يستبدل صفحة الشهادة القديمة
const dc=dr.querySelector('[data-d=cert] span');if(dc)dc.textContent='الشهادة الموثّقة';
})();
