// تذكيرات ذكية حسب خطة المتعلم: وقته، هدفه اليومي، سلسلته، المحطة التالية، وغيابه
(()=>{
const {toast,esc}=window.NX;
const LN=()=>plug('LocalNotifications');
const CH='nile-learning';
S.nt=Object.assign({streak:true,back:true,week:true},S.nt||{});
const IDS={day:7001,streak:7101,back3:7201,back7:7202,week:7301};

/* ===== محتوى الرسائل ===== */
const nextI=()=>L.findIndex((_,k)=>!done.includes(k));
const left=()=>L.length-done.length;
const pick=(arr,seed)=>arr[Math.abs(seed)%arr.length];
function dayMsg(dOff){
  const i=nextI(),st=streak(),g=S.goal||30;
  if(i<0)return {title:'أنت خريج النيل 🎓',body:'راجع مشروعك أو جرّب تحدياً جديداً في المختبر.',go:'paths'};
  const l=L[i],n=i+1,seed=new Date().getDate()+dOff;
  const titles=[`المحطة ${n}: ${l.t}`,`${l.m} دقائق فقط اليوم`,st>1?`🔥 ${st} أيام متتالية، أكمل اليوم`:`رحلتك على النيل تنتظرك`,`بقي ${left()} محطة لشهادتك`];
  const bodies=[`${l.s}. هدفك اليوم ${g} XP.`,`محطة واحدة تقرّبك من بناء تطبيقك الأول.`,`افتح «${l.t}» وأكمل من حيث توقفت.`,`كل محطة تضيف ميزة جديدة لمشروعك.`];
  return {title:pick(titles,seed),body:pick(bodies,seed+1),go:'next'};
}
const streakMsg=()=>({title:`🔥 سلسلتك ${streak()} ${streak()===1?'يوم':'أيام'} ستنقطع الليلة`,body:`لم تتعلم اليوم بعد. محطة واحدة قصيرة تحافظ على سلسلتك.`,go:'next'});
const backMsg=d=>d===3?{title:'اشتقنا لك على النيل 🌊',body:nextI()>=0?`توقفت عند «${L[nextI()].t}». عُد وأكمل في ${L[nextI()].m} دقائق.`:'عُد وجرّب تحديات المختبر.',go:'next'}
  :{title:'مشروعك ما زال بانتظارك',body:`أنجزت ${done.length} من ${L.length} محطة. خطوة صغيرة اليوم تعيدك للمسار.`,go:'project'};
function weekMsg(){let xp=0,act=0;for(let o=0;o<7;o++){xp+=S.xd[day(o)]||0;if(S.act[day(o)])act++}
  return {title:'ملخص أسبوعك على النيل 📊',body:`${xp} XP في ${act} ${act===1?'يوم':'أيام'} نشاط · المستوى ${Math.floor(S.xp/100)+1}. استمر!`,go:'stats'}}

/* ===== حساب الجدول ===== */
function at(dOff,h,m=0){const d=new Date();d.setDate(d.getDate()+dOff);d.setHours(h,m,0,0);return d}
function plan(){
  const now=Date.now(),H=S.rh||20,out=[],today=S.xd[day()]||0,goalMet=today>=(S.goal||30);
  // تذكير يومي لسبعة أيام قادمة؛ لا نذكّر اليوم إن تحقق الهدف
  for(let k=0;k<7;k++){const t=at(k,H);if(t<=now||(k===0&&goalMet))continue;out.push({id:IDS.day+k,at:t,...dayMsg(k)})}
  // تنبيه السلسلة: الليلة إن لم يتحقق الهدف وكانت هناك سلسلة
  if(S.nt.streak&&!S.act[day()]&&streak()>0){const t=at(0,Math.min(22,Math.max(H+2,21)));if(t>now)out.push({id:IDS.streak,at:t,...streakMsg()})}
  // تذكير العودة بعد غياب 3 و7 أيام
  if(S.nt.back){out.push({id:IDS.back3,at:at(3,H,30),...backMsg(3)});out.push({id:IDS.back7,at:at(7,H,30),...backMsg(7)})}
  // ملخص أسبوعي يوم الجمعة ظهراً
  if(S.nt.week){let k=(5-new Date().getDay()+7)%7;let t=at(k,12);if(t<=now)t=at(k+7,12);out.push({id:IDS.week,at:t,...weekMsg()})}
  return out;
}
const ALL_IDS=[...Array(7)].map((_,k)=>IDS.day+k).concat([IDS.streak,IDS.back3,IDS.back7,IDS.week]);

/* ===== الجدولة ===== */
let busy=null,chan=false;
async function resched(){
  const N=LN();if(!N||!S.rem)return false;
  if(busy)return busy;
  busy=(async()=>{try{
    if(!chan){try{await N.createChannel({id:CH,name:'تذكير التعلّم',description:'تذكير يومي وتنبيه السلسلة',importance:4,vibration:true})}catch(e){}chan=true}
    await N.cancel({notifications:ALL_IDS.map(id=>({id}))}).catch(()=>{});
    const list=plan().map(n=>({id:n.id,title:n.title,body:n.body,channelId:CH,schedule:{at:n.at,allowWhileIdle:true},extra:{go:n.go}}));
    if(list.length)await N.schedule({notifications:list});
    S.ntLast=Date.now();sv();return true;
  }catch(e){return false}finally{busy=null}})();
  return busy;
}
async function setEnabled(on){
  const N=LN();
  if(!N){toast('التذكير يعمل داخل التطبيق على الهاتف فقط');return false}
  try{
    if(!on){await N.cancel({notifications:ALL_IDS.map(id=>({id}))}).catch(()=>{});S.rem=false;sv();return true}
    let p=await N.checkPermissions();if(p.display!=='granted')p=await N.requestPermissions();
    if(p.display!=='granted'){toast('لم يُمنح إذن الإشعارات. فعّله من إعدادات الهاتف.');return false}
    S.rem=true;sv();await resched();return true;
  }catch(e){toast('تعذّر ضبط التذكير');return false}
}

/* ===== متى نعيد الجدولة؟ ===== */
// عند الخروج من التطبيق، وبعد كل محطة أو XP، وعند الفتح
document.addEventListener('visibilitychange',()=>{if(document.hidden)resched()});
let rt=0;const soon=()=>{clearTimeout(rt);rt=setTimeout(resched,1500)};
$('#lv').addEventListener('click',e=>{if(e.target.closest('.go,.qo'))soon()});
setTimeout(resched,2000);

/* ===== فتح الإشعار ===== */
(()=>{const N=LN();if(!N)return;
  N.addListener('localNotificationActionPerformed',a=>{const go=a&&a.notification&&a.notification.extra&&a.notification.extra.go;
    setTimeout(()=>{if(go==='next'){const i=nextI();if(i>=0){history.pushState({l:1},'');open(i)}}
      else if(go==='stats'){tab(1);refresh()}else if(go==='paths'){tab(2);refresh()}else if(go==='project'&&window.NXP)window.NXP.pgProject()},400)});
})();

/* ===== الإعدادات ===== */
const _settings=settings;
settings=function(){_settings();
  const row=[...document.querySelectorAll('#sets .row')].find(r=>r.querySelector('[data-rm]'));if(!row)return;
  const tg=(k,t,d)=>`<label><span><b>${t}</b><small>${d}</small></span><input type="checkbox" data-nt="${k}"${S.nt[k]?' checked':''}${S.rem?'':' disabled'}></label>`;
  const p=S.rem?dayMsg(0):null;
  row.insertAdjacentHTML('beforeend',`<div class="nty">${tg('streak','تنبيه السلسلة','ليلاً إن لم تتعلم اليوم')}${tg('back','تذكير العودة','بعد 3 و7 أيام من الغياب')}${tg('week','ملخص أسبوعي','كل جمعة ظهراً')}</div>${p?`<div class="nprev"><small>مثال على تذكير اليوم:</small><b>${esc(p.title)}</b>${esc(p.body)}</div>`:''}`);
};
$('#sets').addEventListener('change',e=>{const c=e.target.closest('[data-nt]');if(!c)return;S.nt[c.dataset.nt]=c.checked;sv();resched();toast(c.checked?'فُعّل':'أُوقف')});

window.NXN={setEnabled,resched,plan};
})();
