// السحابة: حفظ التقدّم بحساب GitHub، دوري الأسبوع، وإحصائيات مجهولة الهوية لتحسين الدورة
(()=>{
const {toast,esc}=window.NX;
const FN='https://mouzkibnxknubbfljcqw.supabase.co/functions/v1/nile';
Object.assign(IC,{cloud:'<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>',users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>'});
S.cl=Object.assign({show:true,an:true},S.cl||{});
const post=async b=>{const r=await fetch(FN,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),keepalive:true});let j={};try{j=await r.json()}catch(e){}if(!r.ok&&!j.message)j.message='HTTP '+r.status;return {ok:r.ok,...j}};
const TK=()=>window.NXP?window.NXP.TK():'';

/* ===== 1. إحصائيات مجهولة الهوية ===== */
// معرّف عشوائي للجهاز فقط: لا اسم، لا حساب، لا موقع
let dev='';try{dev=localStorage.getItem('cndev')||'';if(!dev){dev=Array.from(crypto.getRandomValues(new Uint8Array(10)),b=>(b%36).toString(36)).join('');localStorage.setItem('cndev',dev)}}catch(e){}
let Qe=[];try{Qe=JSON.parse(localStorage.getItem('cnev')||'[]')}catch(e){}
const keepQ=()=>{try{localStorage.setItem('cnev',JSON.stringify(Qe.slice(-300)))}catch(e){}};
function track(k,l,q,ok){if(!S.cl.an||!dev)return;const e={k};if(l!=null)e.l=l;if(q!=null)e.q=q;if(ok!=null)e.ok=ok;Qe.push(e);keepQ();if(Qe.length>=15)flush()}
let flushing=false;
async function flush(){if(flushing||!Qe.length||!S.cl.an||!navigator.onLine)return;flushing=true;const batch=Qe.slice(0,60);
  try{const r=await post({action:'track',dev,events:batch});if(r.ok){Qe=Qe.slice(batch.length);keepQ()}}catch(e){}flushing=false}
const _open=open;open=function(i){_open(i);track('open',i)};
document.addEventListener('nx:done',e=>{track('done',e.detail.l);soonSync()});
document.addEventListener('nx:quiz',e=>track('quiz',e.detail.l,e.detail.q,e.detail.ok));

/* ===== 2. حفظ التقدّم سحابياً ===== */
const KEYS=['xp','xd','act','qp','ch','goal','name','prj','copies','built','cert','nt','rh'];
const weekStart=()=>{const d=new Date();const k=(d.getDay()+6)%7;d.setDate(d.getDate()-k);d.setHours(0,0,0,0);return d};
function weekXP(){const w=weekStart();let s=0;for(const [k,v] of Object.entries(S.xd||{}))if(new Date(k+'T00:00:00')>=w)s+=v;return s}
let syncing=null;
async function sync(manual){
  const tk=TK();if(!tk||!navigator.onLine){if(manual)toast(tk?'لا يوجد اتصال':'احفظ رمز GitHub أولاً من «مشروعي»');return false}
  if(syncing)return syncing;
  syncing=(async()=>{try{
    const data={done:[...done]};KEYS.forEach(k=>{if(S[k]!=null)data[k]=S[k]});
    const r=await post({action:'sync',token:tk,data,weekXp:weekXP(),show:S.cl.show,name:S.name||''});
    if(!r.data){if(manual)toast(r.message||'تعذّرت المزامنة');return false}
    const m=r.data,before=done.length;
    done.length=0;(m.done||[]).forEach(i=>{if(i<L.length)done.push(i)});save();
    KEYS.forEach(k=>{if(m[k]!=null)S[k]=m[k]});
    S.cl.login=r.login;S.cl.avatar=r.avatar;S.cl.at=r.at;sv();
    if(done.length>before)toast(`استُعيد تقدّمك: ${done.length} محطة`);else if(manual)toast('تمت المزامنة');
    render();board=null;return true;
  }catch(e){if(manual)toast('تعذّرت المزامنة');return false}finally{syncing=null}})();
  return syncing;
}
let st=0;const soonSync=()=>{clearTimeout(st);st=setTimeout(()=>sync(),4000)};
let lastHidden=0;
document.addEventListener('visibilitychange',()=>{if(document.hidden){flush();if(Date.now()-lastHidden>60e3){lastHidden=Date.now();sync()}}});
addEventListener('online',()=>{flush();sync()});
setTimeout(()=>{flush();sync()},3000);

/* ===== 3. دوري الأسبوع ===== */
let board=null,boardAt=0;
async function loadBoard(){if(board&&Date.now()-boardAt<120e3)return board;try{const r=await post({action:'board',login:S.cl.login||''});if(r.top){board=r;boardAt=Date.now()}}catch(e){}return board}
const _stats=stats;
stats=function(){_stats();
  const box=document.createElement('div');box.className='lbd';box.innerHTML=`<div class="lbh">${ic('trophy',20)}<b>دوري الأسبوع</b><small class="lbt"></small></div><div class="lbl"><i class="spn"></i></div>`;
  const first=$('#stats .xpc.lv');(first||$('#stats').firstChild).after(box);
  loadBoard().then(b=>{const l=box.querySelector('.lbl');if(!l)return;
    if(!b){l.innerHTML='<p class="bh">الدوري يحتاج اتصالاً بالإنترنت.</p>';return}
    const d=new Date(b.week+'T00:00:00');d.setDate(d.getDate()+7);const left=Math.max(0,Math.ceil((d-Date.now())/864e5));
    box.querySelector('.lbt').textContent=`${b.total} مشارك · ينتهي بعد ${left} ${left===1?'يوم':'أيام'}`;
    const me=(S.cl.login||'').toLowerCase();
    const row=(p,i)=>`<li class="${p.login===me?'me':''}"><span class="rk r${i+1}">${i+1}</span><i class="av">${esc((p.name||'?').trim()[0]||'?')}${p.avatar?`<img src="${esc(p.avatar)}&s=64" alt="" loading="lazy" onerror="this.remove()">`:''}</i><b>${esc(p.name)}</b><em>${p.xp} XP</em></li>`;
    let h=b.top.length?`<ol>${b.top.slice(0,10).map(row).join('')}</ol>`:'<p class="bh">لا أحد في الدوري بعد هذا الأسبوع. كن الأول!</p>';
    if(b.me&&b.me.rank>10)h+=`<p class="lbme">ترتيبك: <b>${b.me.rank}</b> بـ ${b.me.xp} XP</p>`;
    if(!TK())h+='<p class="bh">اربط حساب GitHub من «مشروعي» لتدخل الدوري.</p>';
    else if(!S.cl.show)h+='<p class="bh">أنت مخفي من الدوري. غيّر ذلك من الإعدادات.</p>';
    l.innerHTML=h});
};

/* ===== الإعدادات ===== */
const _settings=settings;
settings=function(){_settings();
  const tk=TK(),at=S.cl.at?new Date(S.cl.at).toLocaleString('ar',{hour:'2-digit',minute:'2-digit',day:'numeric',month:'short'}):'';
  const tg=(k,t,d)=>`<label><span><b>${t}</b><small>${d}</small></span><input type="checkbox" data-cl="${k}"${S.cl[k]?' checked':''}></label>`;
  $('#sets').insertAdjacentHTML('afterbegin',`<div class="row clr"><h3>${ic('cloud',18)} الحفظ السحابي</h3>
    ${tk?`<p class="clst">${S.cl.avatar?`<img src="${esc(S.cl.avatar)}&s=64" alt="" onerror="this.remove()">`:''}<span><b>${S.cl.login?'@'+esc(S.cl.login):'متصل'}</b><small>${at?'آخر مزامنة: '+at:'لم تتم المزامنة بعد'}</small></span><button class="go2 clsync">زامن الآن</button></p>`
      :`<p class="bh">تقدّمك محفوظ على هذا الهاتف فقط. اربط حساب GitHub من «مشروعي» ليُحفظ سحابياً وتستعيده على أي هاتف.</p>`}
    <div class="nty">${tg('show','الظهور في دوري الأسبوع','باسمك وصورة حساب GitHub ونقاط الأسبوع')}${tg('an','إحصائيات مجهولة الهوية','تساعد في تحسين الدروس، بلا اسم أو حساب')}</div></div>`);
};
$('#sets').addEventListener('click',e=>{const b=e.target.closest('.clsync');if(!b)return;e.stopImmediatePropagation();b.disabled=true;sync(true).then(()=>{b.disabled=false;settings()})},true);
$('#sets').addEventListener('change',e=>{const c=e.target.closest('[data-cl]');if(!c)return;S.cl[c.dataset.cl]=c.checked;sv();if(c.dataset.cl==='an'&&!c.checked){Qe=[];keepQ()}if(c.dataset.cl==='show')sync();board=null});

// المزامنة فور حفظ الرمز في «مشروعي»
const _setItem=Storage.prototype.setItem;
Storage.prototype.setItem=function(k,v){_setItem.call(this,k,v);if(this===localStorage&&k==='cnt'&&v)setTimeout(()=>sync(true),300)};

// أحداث إضافية
document.addEventListener('click',e=>{if(e.target.closest('.pjb'))track('build')},true);

window.NXC={sync,flush,track,loadBoard};
})();
