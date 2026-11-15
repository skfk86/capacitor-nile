// الشهادة الموثّقة: شروط واضحة، اختبار نهائي يُصحَّح على الخادم، دليل عملي من GitHub، رمز QR ورقم تحقق
(()=>{
const {toast,esc}=window.NX;
const FN='https://mouzkibnxknubbfljcqw.supabase.co/functions/v1/cert';
const VERIFY='https://skfk86.github.io/capacitor-nile/docs/verify.html?id=';
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
    <div class="czh">${ic('shield',30)}<div><b>شهادة إتمام موثّقة</b><small>تصدرها ${ISSUER.ar} · يمكن لأي شخص التحقق منها</small></div></div>
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
// اسم الجهة المانحة وموقّع الشهادة — غيّرهما من هنا فقط
const ISSUER={ar:'أكاديمية مبرمج سوداني',en:'SUDANESE DEVELOPER ACADEMY',signer:'علوش',role:'المؤسس والمدرّب'};
function render(c){
  const W=1754,H=1240,cv=document.createElement('canvas');cv.width=W;cv.height=H;const x=cv.getContext('2d');
  const TEAL='#06424a',GOLD='#b8862b',GOLD2='#e2b04a',INK='#1d2b2e',MUT='#5d6f72';
  const F=(w,s,f='"Noto Sans Arabic","IBM Plex Sans Arabic",system-ui,sans-serif')=>`${w} ${s}px ${f}`;
  const T=(t,px,py,font,col=INK,al='center',dir='rtl')=>{x.direction=dir;x.textAlign=al;x.font=font;x.fillStyle=col;x.fillText(t,px,py)};
  // الخلفية والزخرفة
  x.fillStyle='#fbf8f1';x.fillRect(0,0,W,H);
  x.save();x.globalAlpha=.07;x.strokeStyle=TEAL;x.lineWidth=1;
  for(let k=0;k<26;k++){x.beginPath();for(let t=0;t<=W;t+=6){const yy=70+Math.sin(t/38+k*.45)*14+k*.8;t?x.lineTo(t,yy):x.moveTo(t,yy)}x.stroke();x.beginPath();for(let t=0;t<=W;t+=6){const yy=H-70+Math.sin(t/38+k*.45)*14-k*.8;t?x.lineTo(t,yy):x.moveTo(t,yy)}x.stroke()}
  x.restore();
  // علامة مائية
  x.save();x.globalAlpha=.045;x.translate(W/2,H/2+40);x.strokeStyle=TEAL;x.lineWidth=3;for(let r=60;r<=300;r+=24){x.beginPath();x.arc(0,0,r,0,7);x.stroke()}
  for(let a=0;a<48;a++){x.rotate(Math.PI/24);x.beginPath();x.moveTo(60,0);x.lineTo(300,0);x.stroke()}x.restore();
  // الإطار
  x.strokeStyle=TEAL;x.lineWidth=18;x.strokeRect(30,30,W-60,H-60);
  x.strokeStyle=GOLD;x.lineWidth=3;x.strokeRect(56,56,W-112,H-112);x.lineWidth=1;x.strokeRect(64,64,W-128,H-128);
  [[64,64],[W-64,64],[64,H-64],[W-64,H-64]].forEach(([a,b])=>{x.fillStyle=GOLD;x.beginPath();x.moveTo(a,b-14);x.lineTo(a+14,b);x.lineTo(a,b+14);x.lineTo(a-14,b);x.closePath();x.fill()});
  // شعار الجهة
  const ex=W/2,ey=165;x.fillStyle=TEAL;x.beginPath();x.arc(ex,ey,62,0,7);x.fill();x.strokeStyle=GOLD2;x.lineWidth=4;x.beginPath();x.arc(ex,ey,70,0,7);x.stroke();
  x.fillStyle=GOLD2;x.beginPath();x.arc(ex,ey-8,22,Math.PI,0);x.fill();x.fillRect(ex-34,ey+2,68,4);
  T('</>',ex,ey+40,F(700,24,'ui-monospace,monospace'),'#fff','center','ltr');
  T(ISSUER.ar,W/2,282,F(700,40),TEAL);
  T(ISSUER.en,W/2,318,F(600,17,'Georgia,"Times New Roman",serif'),GOLD,'center','ltr');
  // العنوان
  T('شهادة إتمام',W/2,410,F(700,74),INK);
  T('CERTIFICATE OF COMPLETION  ·  VERIFIED',W/2,452,F(600,20,'Georgia,"Times New Roman",serif'),MUT,'center','ltr');
  x.strokeStyle=GOLD;x.lineWidth=2;x.beginPath();x.moveTo(W/2-220,478);x.lineTo(W/2+220,478);x.stroke();
  T(`تشهد ${ISSUER.ar} بأن`,W/2,540,F(400,32),MUT);
  T(c.name,W/2,630,F(700,78),TEAL);
  x.strokeStyle='rgba(6,66,74,.25)';x.lineWidth=1.5;x.beginPath();x.moveTo(W/2-360,660);x.lineTo(W/2+360,660);x.stroke();
  T('قد أتمّ بنجاح دورة «بناء تطبيقات Android بتقنية Capacitor»',W/2,725,F(500,34),INK);
  const hrs=Math.max(1,Math.round(L.reduce((a,l)=>a+l.m,0)/60));
  T(`${L.length} محطة تعليمية  ·  نحو ${hrs} ساعات  ·  نتيجة الاختبار النهائي ${c.score}%  ·  تطبيق حقيقي منشور`,W/2,780,F(500,25),MUT);
  T('HTML  ·  CSS  ·  JavaScript  ·  Capacitor  ·  Git & GitHub  ·  GitHub Actions CI/CD',W/2,825,F(600,21,'Georgia,"Times New Roman",serif'),GOLD,'center','ltr');
  // التوقيع (يمين)
  const sx=W-330,by=1010;
  T(ISSUER.signer,sx,by-22,F(400,46,'"Segoe Script","Brush Script MT","Noto Sans Arabic",cursive'),TEAL);
  x.strokeStyle=INK;x.lineWidth=1.5;x.beginPath();x.moveTo(sx-170,by);x.lineTo(sx+170,by);x.stroke();
  T(ISSUER.role,sx,by+36,F(600,22),INK);T(ISSUER.ar,sx,by+68,F(400,19),MUT);
  // الختم (وسط)
  const cx=W/2,cy=960;
  x.fillStyle=GOLD2;x.beginPath();for(let i=0;i<48;i++){const a=i/48*Math.PI*2,r=i%2?92:102;x.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r)}x.closePath();x.fill();
  x.fillStyle='#fbf3df';x.beginPath();x.arc(cx,cy,80,0,7);x.fill();x.strokeStyle=GOLD;x.lineWidth=2;x.beginPath();x.arc(cx,cy,72,0,7);x.stroke();x.beginPath();x.arc(cx,cy,52,0,7);x.stroke();
  x.save();x.translate(cx,cy);x.font=F(700,12,'Georgia,serif');x.fillStyle=GOLD;x.direction='ltr';x.textAlign='center';
  const ring='VERIFIED  •  CERTIFIED COMPLETION  •  ';const n=ring.length;for(let i=0;i<n;i++){x.save();x.rotate(i/n*Math.PI*2);x.fillText(ring[i],0,-58);x.restore()}x.restore();
  T('موثّقة',cx,cy+4,F(700,26),TEAL);T(new Date(c.issued_at).getFullYear()+'',cx,cy+30,F(700,16,'Georgia,serif'),GOLD,'center','ltr');
  // التحقق (يسار)
  const qx=150,qy=850,qs=190;x.fillStyle='#fff';x.fillRect(qx-8,qy-8,qs+16,qs+16);x.strokeStyle='rgba(6,66,74,.25)';x.lineWidth=1;x.strokeRect(qx-8,qy-8,qs+16,qs+16);
  QR.draw(x,VERIFY+c.id,qx,qy,qs,INK,'#ffffff');
  T('رقم الشهادة',qx+qs+24,qy+40,F(400,19),MUT,'left');
  T(c.id,qx+qs+24,qy+78,F(700,30,'ui-monospace,Menlo,monospace'),TEAL,'left','ltr');
  T('تاريخ الإصدار',qx+qs+24,qy+122,F(400,19),MUT,'left');
  T(fmtDate(c.issued_at),qx+qs+24,qy+156,F(600,22),INK,'left');
  // التذييل
  T(`المشروع العملي: github.com/${c.login}/my-nile-app`,W/2,H-148,F(400,18),MUT);
  T('للتحقق من صحة الشهادة امسح الرمز أو افتح الرابط التالي وأدخل رقمها',W/2,H-118,F(400,18),MUT);
  T(`skfk86.github.io/capacitor-nile/docs/verify.html   ·   sig ${String(c.sig||'').slice(0,12)}`,W/2,H-90,F(500,17,'ui-monospace,Menlo,monospace'),TEAL,'center','ltr');
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
    const text=`حصلت على شهادة إتمام موثّقة من أكاديمية مبرمج سوداني في بناء تطبيقات Android! تحقق منها: ${VERIFY+c.id}`;
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
