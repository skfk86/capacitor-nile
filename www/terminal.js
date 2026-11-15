// طرفية محاكاة على طريقة Termux: نظام ملفات افتراضي، أوامر حقيقية الشكل، ومشروع المتعلم بداخلها
(()=>{
const {toast,esc,addXP}=window.NX;
Object.assign(IC,{term2:'<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>'});
const HOME='/data/data/com.termux/files/home',PRJ=HOME+'/my-nile-app',PG=HOME+'/playground';
const PGF={'index.html':'html','style.css':'css','script.js':'js'};
const inPG=p=>p===PG||p.startsWith(PG+'/');
function pgTree(){const f=window.NXE?window.NXE.files():(S.pgf||{});const r=dir();for(const [n,k] of Object.entries(PGF))r.c[n]={t:'f',d:f[k]||''};return r}

/* ===== نظام الملفات الافتراضي ===== */
const dir=()=>({t:'d',c:{}});
let FS;
function freshFS(){const r=dir();let n=r;for(const p of HOME.split('/').filter(Boolean)){n.c[p]=dir();n=n.c[p]}
  n.c['README.txt']={t:'f',d:'مرحباً بك في طرفية Capacitor Nile!\nاكتب help لعرض الأوامر.\n'};
  const usr=r.c.data.c.data.c['com.termux'].c.files.c.usr=dir();usr.c.bin=dir();return r}
try{FS=JSON.parse(localStorage.getItem('cnfs')||'null')}catch(e){}
if(!FS||FS.t!=='d')FS=freshFS();
let saveT=0;const saveFS=()=>{clearTimeout(saveT);saveT=setTimeout(()=>{try{localStorage.setItem('cnfs',JSON.stringify(FS))}catch(e){}},300)};
const T=Object.assign({cwd:HOME,pk:[],hist:[],n:0,git:{}},S.term||{});
const saveT2=()=>{S.term={cwd:T.cwd,pk:T.pk,hist:T.hist.slice(-60),n:T.n,git:T.git};sv()};

function norm(p,base=T.cwd){
  if(p==null||p==='')return base;
  if(p==='~'||p.startsWith('~/'))p=HOME+p.slice(1);
  const parts=(p.startsWith('/')?p:base+'/'+p).split('/'),out=[];
  for(const x of parts){if(!x||x==='.')continue;if(x==='..')out.pop();else out.push(x)}
  return '/'+out.join('/');
}
const short=p=>p===HOME?'~':p.startsWith(HOME+'/')?'~'+p.slice(HOME.length):p;
const inPrj=p=>p===PRJ||p.startsWith(PRJ+'/');
// مشروع المتعلم: يُولّد من «مشروعي» عند كل قراءة
function prjTree(){
  const r=dir();let F={};try{F=window.NXP.files((S.bld&&S.bld.o)||'you')}catch(e){}
  F['assets/icon-only.png']='[صورة PNG 1024×1024]';
  for(const [path,txt] of Object.entries(F)){const ps=path.split('/');let n=r;ps.slice(0,-1).forEach(x=>{n=n.c[x]=n.c[x]||dir()});n.c[ps.at(-1)]={t:'f',d:txt}}
  return r;
}
function node(p){
  if(inPG(p)){let n=pgTree();for(const x of p.slice(PG.length).split('/').filter(Boolean)){if(!n||n.t!=='d')return null;n=n.c[x]}return n||null}
  if(inPrj(p)){let n=prjTree();for(const x of p.slice(PRJ.length).split('/').filter(Boolean)){if(!n||n.t!=='d')return null;n=n.c[x]}return n||null}
  let n=FS;for(const x of p.split('/').filter(Boolean)){if(!n||n.t!=='d')return null;n=n.c[x]}
  if(p===HOME&&n){n.c['my-nile-app']=n.c['my-nile-app']||{t:'d',c:{},v:1};n.c.playground=n.c.playground||{t:'d',c:{},v:1}}
  return n||null;
}
function parentOf(p){const i=p.lastIndexOf('/');return [p.slice(0,i)||'/',p.slice(i+1)]}
const RO=p=>inPG(p)&&!PGF[p.slice(PG.length+1)]?'مجلد الملعب فيه ملفات المحرر الثلاثة فقط: index.html وstyle.css وscript.js.':inPrj(p)?'هذا مجلد مشروعك ويُولَّد تلقائياً من المحطات. غيّر الاسم واللون من «مشروعي».':'';

/* ===== تلوين الأوامر ===== */
function hlCmd(s){let o='',first=true;
  const re=/("(?:[^"\\]|\\.)*"?|'[^']*'?)|(&&|\|\||>>|[|;>])|(\s+)|(-{1,2}[\w-]+)|([^\s"'|;&>]+)|([\s\S])/g;let m;
  while((m=re.exec(s))){
    if(m[1])o+=`<span class="k-s">${esc(m[1])}</span>`;
    else if(m[2]){o+=`<span class="k-o">${esc(m[2])}</span>`;first=true}
    else if(m[3])o+=m[3];
    else if(m[4])o+=`<span class="k-n">${esc(m[4])}</span>`;
    else if(m[5]){const w=m[5];if(first){o+=`<span class="${CMD[w]||NEED[w]?'k-f':'k-e'}">${esc(w)}</span>`;first=false}
      else o+=/[\/~.]/.test(w)?`<span class="k-a">${esc(w)}</span>`:/^(install|init|add|sync|commit|push|status|update|upgrade|run|remote|config|log|branch)$/.test(w)?`<span class="k-k">${esc(w)}</span>`:esc(w)}
    else o+=esc(m[6]);
  }return o}

/* ===== الواجهة ===== */
let el=null,out,inp,ctrl=false,hi=-1,queue=[],busy=false;
const PROMPT=()=>`<span class="tp">${esc(short(T.cwd))} $</span> `;
function print(t,c=''){const d=document.createElement('div');d.className='tl '+c;d.dir='ltr';d.innerHTML=t;out.appendChild(d);while(out.childElementCount>600)out.firstChild.remove();out.scrollTop=out.scrollHeight}
const pr=(t,c)=>print(esc(t),c);
let OPT={};
function openTerm(cmds,opt={}){
  if(el){if(opt.cwd&&node(opt.cwd)){T.cwd=opt.cwd;updPrompt()}if(cmds)feed(cmds);return}
  OPT=opt;if(opt.cwd&&node(opt.cwd))T.cwd=opt.cwd;
  el=document.createElement('div');el.id='term';el.setAttribute('aria-label','الطرفية');if(opt.mount)el.className='emb';else{el.setAttribute('role','dialog');el.setAttribute('aria-modal','true')}
  el.innerHTML=`<div class="tbar"><button class="tx" aria-label="إغلاق">${ic(opt.mount?'back':'x',opt.mount?16:20)}</button><b dir="ltr">${opt.mount?'TERMINAL':'Termux · Nile'}</b><span class="tsp"></span><button class="thelp">help</button></div>
  <div class="tout" dir="ltr" aria-live="polite"></div>
  <div class="tin" dir="ltr"><span class="tpr"></span><div class="tiw"><div class="tih" aria-hidden="true"></div><input autocapitalize="off" autocomplete="off" autocorrect="off" spellcheck="false" enterkeyhint="send" aria-label="اكتب أمراً"></div></div>
  <div class="tkeys" dir="ltr">${['ESC','CTRL','TAB','↑','↓','←','→','/','-','|','~','.'].map(k=>`<button data-k="${k}">${k}</button>`).join('')}</div>`;
  if(opt.mount)opt.mount.appendChild(el);else{document.body.appendChild(el);document.body.classList.add('pgon')}
  out=el.querySelector('.tout');inp=el.querySelector('input');
  if(!T.n){pr('Welcome to Termux · Capacitor Nile edition','dim');print('<span dir="rtl">طرفية تدريبية آمنة: جرّب أي أمر دون خوف. اكتب <b>help</b> للبداية.</span>','ok')}
  else pr('Termux · Nile — type help','dim');
  updPrompt();
  const tih=el.querySelector('.tih');let lv=null;
  (function loop(){if(!el)return;if(inp.value!==lv){lv=inp.value;tih.innerHTML=hlCmd(lv)+' '}tih.style.transform=`translateX(${-inp.scrollLeft}px)`;requestAnimationFrame(loop)})();
  el.addEventListener('click',onClick);
  inp.addEventListener('keydown',onKey);
  out.addEventListener('click',()=>{if(!getSelection().toString())inp.focus()});
  setTimeout(()=>inp.focus(),60);
  if(cmds)feed(cmds);
}
function closeTerm(){if(!el)return;if(el.querySelector('.nano'))return closeNano(false);const emb=el.classList.contains('emb');el.remove();el=null;if(!emb)document.body.classList.remove('pgon');saveT2();const cb=OPT.onClose;OPT={};cb&&cb()}
window.NXB=()=>{if(el&&!el.classList.contains('emb')){closeTerm();return true}return false};
const updPrompt=()=>{el.querySelector('.tpr').innerHTML=PROMPT()};
function feed(cmds){queue=cmds.split('\n').map(x=>x.trim()).filter(x=>x&&!x.startsWith('#'));nextQ()}
function nextQ(){if(queue.length){inp.value=queue.shift();inp.focus();inp.setSelectionRange(inp.value.length,inp.value.length);el.querySelector('.tin').classList.add('q')}else el.querySelector('.tin').classList.remove('q')}
function onClick(e){
  if(e.target.closest('.tx'))return closeTerm();
  if(e.target.closest('.thelp')){run('help');return}
  const k=e.target.closest('[data-k]');if(!k)return;e.preventDefault();
  const v=k.dataset.k;
  if(v==='CTRL'){ctrl=!ctrl;k.classList.toggle('on',ctrl)}
  else if(v==='ESC'){inp.value='';queue=[];nextQ()}
  else if(v==='TAB')complete();
  else if(v==='↑')histMove(-1);else if(v==='↓')histMove(1);
  else if(v==='←'||v==='→'){const p=inp.selectionStart+(v==='←'?-1:1);inp.setSelectionRange(Math.max(0,p),Math.max(0,p))}
  else insert(v);
  inp.focus();
}
function insert(t){if(ctrl){ctrl=false;el.querySelector('[data-k=CTRL]').classList.remove('on');return ctrlKey(t)}const a=inp.selectionStart,b=inp.selectionEnd;inp.setRangeText(t,a,b,'end')}
function ctrlKey(k){k=k.toLowerCase();if(k==='c'){print(PROMPT()+esc(inp.value)+'^C');inp.value='';queue=[];nextQ()}else if(k==='l'){out.innerHTML=''}else if(k==='d'){closeTerm()}}
function onKey(e){
  if(ctrl&&e.key.length===1){e.preventDefault();insert(e.key);return}
  if(e.ctrlKey&&/^[cld]$/i.test(e.key)){e.preventDefault();ctrlKey(e.key);return}
  if(e.key==='Enter'){e.preventDefault();const v=inp.value;inp.value='';hi=-1;run(v)}
  else if(e.key==='Tab'){e.preventDefault();complete()}
  else if(e.key==='ArrowUp'){e.preventDefault();histMove(-1)}
  else if(e.key==='ArrowDown'){e.preventDefault();histMove(1)}
}
function histMove(d){const h=T.hist;if(!h.length)return;hi=hi<0?h.length:hi;hi=Math.max(0,Math.min(h.length,hi+d));inp.value=h[hi]||'';inp.setSelectionRange(inp.value.length,inp.value.length)}

/* ===== الإكمال التلقائي ===== */
function complete(){
  const v=inp.value.slice(0,inp.selectionStart),rest=inp.value.slice(inp.selectionStart);
  const words=v.split(/\s+/),last=words.at(-1);
  let opts=[];
  if(words.length===1)opts=Object.keys(CMD).filter(c=>c.startsWith(last)).map(c=>c+' ');
  else{const i=last.lastIndexOf('/'),dpart=i>=0?last.slice(0,i+1):'',fpart=last.slice(i+1);const n=node(norm(dpart||'.'));
    if(n&&n.t==='d')opts=Object.keys(n.c).filter(x=>x.startsWith(fpart)&&(fpart.startsWith('.')||!x.startsWith('.'))).map(x=>dpart+x+(n.c[x].t==='d'?'/':' '))}
  if(opts.length===1){inp.value=v.slice(0,v.length-last.length)+opts[0]+rest}
  else if(opts.length>1){let p=opts[0];for(const o of opts)while(!o.startsWith(p))p=p.slice(0,-1);
    if(p.length>last.length)inp.value=v.slice(0,v.length-last.length)+p+rest;else{print(PROMPT()+esc(inp.value));pr(opts.map(o=>o.trim()).join('   '),'dim')}}
  inp.setSelectionRange(inp.value.length-rest.length,inp.value.length-rest.length);
}

/* ===== تحليل وتنفيذ الأوامر ===== */
function tokenize(s){const t=[];let cur='',q=null,has=false;
  for(let i=0;i<s.length;i++){const c=s[i];
    if(q){if(c===q)q=null;else if(c==='\\'&&q==='"'&&i+1<s.length){cur+=s[++i]}else cur+=c;continue}
    if(c==='"'||c==="'"){q=c;has=true;continue}
    if(c==='\\'&&i+1<s.length){cur+=s[++i];has=true;continue}
    if(/\s/.test(c)){if(cur||has){t.push(cur);cur='';has=false}continue}
    if(c==='>'){if(cur||has){t.push(cur);cur='';has=false}if(s[i+1]==='>'){t.push('>>');i++}else t.push('>');continue}
    cur+=c}
  if(q)return {err:'unexpected EOF while looking for matching `'+q+"'"};
  if(cur||has)t.push(cur);return t}
function splitChain(s){const r=[];let cur='',q=null;for(let i=0;i<s.length;i++){const c=s[i];if(q){if(c===q)q=null;cur+=c;continue}if(c==='"'||c==="'"){q=c;cur+=c;continue}
  if(c==='&'&&s[i+1]==='&'){r.push([cur,'&&']);cur='';i++;continue}if(c===';'){r.push([cur,';']);cur='';continue}cur+=c}r.push([cur,null]);return r}

async function run(line){
  if(busy)return;
  print(PROMPT()+hlCmd(line),'cmd');
  const l=line.trim();if(!l){nextQ();return}
  if(T.hist.at(-1)!==l)T.hist.push(l);T.n++;
  if(T.n===20&&!S.termAch){S.termAch=1;addXP(15,'سيد الطرفية')}
  busy=true;el.querySelector('.tin').classList.add('busy');
  let ok=true;
  for(const [part,op] of splitChain(l)){
    if(part.trim()){ok=await exec(part.trim())!==false}
    if(op==='&&'&&!ok)break;
  }
  busy=false;if(el){el.querySelector('.tin').classList.remove('busy');updPrompt();saveFS();saveT2();nextQ()}
}
async function exec(s){
  s=s.replace(/\$HOME|\$\{HOME\}/g,HOME).replace(/\$PWD/g,T.cwd);
  const tk=tokenize(s);if(tk.err){pr('bash: '+tk.err,'err');return false}
  let redir=null,rf='';const r=tk.findIndex(x=>x==='>'||x==='>>');
  if(r>=0){redir=tk[r];rf=tk[r+1];tk.splice(r,2);if(!rf){pr("bash: syntax error near unexpected token `newline'",'err');return false}}
  const [c,...a]=tk;
  const f=CMD[c];
  if(!f){
    if(NEED[c]&&!T.pk.includes(NEED[c])){pr(`The program ${c} is not installed. Install it by executing:\n pkg install ${NEED[c]}`,'err');return false}
    const g=Object.keys(CMD).map(k=>[k,lev(k,c)]).sort((x,y)=>x[1]-y[1])[0];
    pr(`bash: ${c}: command not found`,'err');if(g&&g[1]<=2)print(`<span dir="rtl">هل تقصد <b dir="ltr">${esc(g[0])}</b>؟</span>`,'hint');return false}
  if(f.need&&!T.pk.includes(f.need)){pr(`The program ${c} is not installed. Install it by executing:\n pkg install ${f.need}`,'err');return false}
  const buf=[];let res;
  const o={redir:!!redir,out:(t,cl)=>redir?buf.push(t):pr(t,cl),html:(t,cl)=>redir?buf.push(t.replace(/<[^>]+>/g,'')):print(t,cl),err:t=>{pr(t,'err');res=false}};
  try{const v=await f.fn(a,o);if(v===false)res=false}catch(e){pr(c+': '+e.message,'err');res=false}
  if(redir){const p=norm(rf);if(RO(p)){pr('bash: '+rf+': Read-only file system','err');return false}
    const [pp,nm]=parentOf(p),pn=node(pp);if(!pn||pn.t!=='d'){pr('bash: '+rf+': No such file or directory','err');return false}
    const ex=pn.c[nm];if(ex&&ex.t==='d'){pr('bash: '+rf+': Is a directory','err');return false}
    const txt=buf.join('\n')+(buf.length?'\n':'');writeF(p,redir==='>>'&&ex?ex.d+txt:txt)}
  return res;
}
const lev=(a,b)=>{const m=[...Array(b.length+1).keys()];for(let i=1;i<=a.length;i++){let p=m[0];m[0]=i;for(let j=1;j<=b.length;j++){const t=m[j];m[j]=Math.min(m[j]+1,m[j-1]+1,p+(a[i-1]===b[j-1]?0:1));p=t}}return m[b.length]};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const flags=a=>{const f=new Set(),r=[];for(const x of a){if(/^-[a-zA-Z]+$/.test(x))[...x.slice(1)].forEach(c=>f.add(c));else r.push(x)}return [f,r]};
const NEED={node:'nodejs',npm:'nodejs',npx:'nodejs',git:'git',java:'openjdk-21',nano:'nano'};
const PKGS={nodejs:['nodejs-lts 22.11.0','npm 10.9.0'],git:['git 2.47.0','openssl 3.4.0'],'openjdk-21':['openjdk-21 21.0.5'],nano:['nano 8.2'],python:['python 3.12.7'],curl:['curl 8.11.0'],wget:['wget 1.25.0'],vim:['vim 9.1']};

/* ===== الأوامر ===== */
const CMD={
help:{d:'عرض الأوامر',fn:(a,o)=>{o.html('<span dir="rtl"><b>أوامر متاحة</b> — اضغط TAB للإكمال، و↑ للأوامر السابقة.</span>','ok');
  const g=[['الملفات','pwd ls cd mkdir touch cat echo rm mv cp tree nano'],['النظام','clear history whoami date uname pkg apt termux-setup-storage'],['التطوير — بعد pkg install nodejs git','node npm npx git'],['مشروعك','cd my-nile-app  ·  ls  ·  git push']];
  g.forEach(x=>{o.html(`<span class="tc" dir="rtl">${x[0]}</span>`);o.html('  '+esc(x[1]))});o.html('<span dir="rtl" class="dim">مثال: <b dir="ltr">mkdir myapp && cd myapp</b></span>')}},
clear:{fn:()=>{out.innerHTML=''}},
pwd:{fn:(a,o)=>o.out(T.cwd)},
whoami:{fn:(a,o)=>o.out('u0_a'+(200+((S.name||'').length%50)))},
date:{fn:(a,o)=>o.out(new Date().toString().replace(/\(.*\)/,'').trim())},
uname:{fn:(a,o)=>o.out(a.includes('-a')?'Linux localhost 5.15.148-android14 #1 SMP PREEMPT aarch64 Android':'Linux')},
echo:{fn:(a,o)=>{const n=a[0]==='-n';o.out((n?a.slice(1):a).join(' '))}},
history:{fn:(a,o)=>T.hist.slice(-30).forEach((h,i)=>o.out(String(T.hist.length-Math.min(30,T.hist.length)+i+1).padStart(4)+'  '+h))},
cd:{fn:(a,o)=>{const p=norm(a[0]||'~');const n=node(p);if(!n)return o.err(`bash: cd: ${a[0]}: No such file or directory`);if(n.t!=='d')return o.err(`bash: cd: ${a[0]}: Not a directory`);T.cwd=p}},
ls:{fn:(a,o)=>{const [f,r]=flags(a);const ts=r.length?r:['.'];
  ts.forEach((t,ti)=>{const p=norm(t),n=node(p);if(!n)return o.err(`ls: cannot access '${t}': No such file or directory`);
    if(ts.length>1)o.out((ti?'\n':'')+t+':');
    if(n.t==='f'){o.out(t);return}
    let names=Object.keys(n.c).sort();if(!f.has('a'))names=names.filter(x=>!x.startsWith('.'));else names=['.','..',...names];
    const isD=x=>x==='.'||x==='..'||(n.c[x]&&n.c[x].t==='d');
    if(f.has('l')){o.out('total '+names.length*4);names.forEach(x=>{const d=isD(x),sz=d?4096:new Blob([n.c[x].d||'']).size;o.html(`${d?'drwx------':'-rw-------'} 1 u0_a 1 ${String(sz).padStart(6)} ${new Date().toLocaleDateString('en-GB',{month:'short',day:'2-digit'})} ${d?`<span class="td">${esc(x)}</span>`:esc(x)}`)})}
    else if(names.length)o.html(names.map(x=>isD(x)?`<span class="td">${esc(x)}</span>`:/\.(sh)$/.test(x)?`<span class="tg">${esc(x)}</span>`:esc(x)).join('  '))})}},
mkdir:{fn:(a,o)=>{const [f,r]=flags(a);if(!r.length)return o.err('mkdir: missing operand');
  for(const t of r){const p=norm(t);if(RO(p))return o.err(`mkdir: cannot create directory '${t}': Read-only file system`);
    if(f.has('p')){let n=FS;for(const x of p.split('/').filter(Boolean)){n.c[x]=n.c[x]||dir();n=n.c[x];if(n.t!=='d')return o.err(`mkdir: cannot create directory '${t}': Not a directory`)}continue}
    const [pp,nm]=parentOf(p),pn=node(pp);if(!pn||pn.t!=='d')return o.err(`mkdir: cannot create directory '${t}': No such file or directory`);
    if(pn.c[nm])return o.err(`mkdir: cannot create directory '${t}': File exists`);pn.c[nm]=dir()}}},
touch:{fn:(a,o)=>{if(!a.length)return o.err('touch: missing file operand');for(const t of a){const p=norm(t);if(RO(p))return o.err(`touch: cannot touch '${t}': Read-only file system`);const [pp,nm]=parentOf(p),pn=node(pp);if(!pn||pn.t!=='d')return o.err(`touch: cannot touch '${t}': No such file or directory`);pn.c[nm]=pn.c[nm]||{t:'f',d:''}}}},
cat:{fn:(a,o)=>{if(!a.length)return o.err('cat: missing operand');for(const t of a){const n=node(norm(t));if(!n)return o.err(`cat: ${t}: No such file or directory`);if(n.t==='d')return o.err(`cat: ${t}: Is a directory`);const d=n.d.replace(/\n$/,'');const ext=(t.match(/\.(html|css|js|json|ya?ml|sh)$/)||[])[1];if(d&&ext&&!o.redir&&window.NXE){o.html(window.NXE.hl(d,{yml:'yaml',sh:'bash'}[ext]||ext))}else if(d)d.split('\n').forEach(x=>o.out(x))}}},
rm:{fn:(a,o)=>{const [f,r]=flags(a);if(!r.length)return o.err('rm: missing operand');for(const t of r){const p=norm(t);
  if(p==='/'||p===HOME||HOME.startsWith(p+'/'))return o.err(`rm: refusing to remove '${t}'`);if(RO(p)||p===PRJ||inPG(p))return o.err(`rm: cannot remove '${t}': Read-only file system`);
  const [pp,nm]=parentOf(p),pn=node(pp);if(!pn||!pn.c[nm]){if(f.has('f'))continue;return o.err(`rm: cannot remove '${t}': No such file or directory`)}
  if(pn.c[nm].t==='d'&&!f.has('r'))return o.err(`rm: cannot remove '${t}': Is a directory`);delete pn.c[nm]}}},
mv:{fn:(a,o)=>cpmv(a,o,true)},
cp:{fn:(a,o)=>cpmv(a,o,false)},
tree:{fn:(a,o)=>{const p=norm(a[0]||'.'),n=node(p);if(!n||n.t!=='d')return o.err((a[0]||'.')+' [error opening dir]');let nd=0,nf=0;o.html('<span class="td">'+esc(a[0]||'.')+'</span>');
  const walk=(n,pre)=>{const ks=Object.keys(n.c).filter(x=>!x.startsWith('.')).sort();ks.forEach((k,i)=>{const last=i===ks.length-1,c=n.c[k];o.html(esc(pre+(last?'└── ':'├── '))+(c.t==='d'?`<span class="td">${esc(k)}</span>`:esc(k)));if(c.t==='d'){nd++;walk(c,pre+(last?'    ':'│   '))}else nf++})};
  walk(n,'');o.out(`\n${nd} director${nd===1?"y":"ies"}, ${nf} file${nf===1?"":"s"}`)}},
nano:{fn:(a,o)=>{if(!a[0])return o.err('nano: اكتب اسم الملف، مثال: nano index.html');const p=norm(a[0]);const n=node(p);if(n&&n.t==='d')return o.err(`nano: ${a[0]} is a directory`);
  const [pp]=parentOf(p);if(!node(pp))return o.err(`nano: ${a[0]}: No such file or directory`);openNano(p,n?n.d:'',a[0])}},
'termux-setup-storage':{fn:async(a,o)=>{await sleep(400);o.out('Storage permission granted.');o.html('<span dir="rtl" class="dim">(محاكاة) في Termux الحقيقي يظهر طلب إذن الوصول للملفات.</span>');const h=node(HOME);h.c.storage=h.c.storage||{t:'d',c:{downloads:dir(),shared:dir(),dcim:dir()}}}},
pkg:{fn:(a,o)=>pkg(a,o)},
apt:{fn:(a,o)=>pkg(a,o)},
node:{need:'nodejs',fn:(a,o)=>{if(a[0]==='-v'||a[0]==='--version')return o.out('v22.11.0');if(a[0]==='-e'){try{const lg=[];const r=new Function('console',a.slice(1).join(' '))({log:(...x)=>lg.push(x.join(' '))});lg.forEach(x=>o.out(x));if(r!==undefined)o.out(String(r))}catch(e){o.err(e.name+': '+e.message)}return}
  if(a[0]){const n=node(norm(a[0]));if(!n)return o.err(`node:internal/modules/cjs/loader:1228\n  throw err;\nError: Cannot find module '${norm(a[0])}'`);try{const lg=[];new Function('console',n.d)({log:(...x)=>lg.push(x.map(v=>typeof v==='object'?JSON.stringify(v):String(v)).join(' ')),error:(...x)=>lg.push(x.join(' '))});lg.forEach(x=>o.out(x))}catch(e){o.err(e.name+': '+e.message)}return}
  o.html('<span dir="rtl" class="dim">وضع node التفاعلي غير مدعوم هنا. جرّب: <b dir="ltr">node -e "console.log(1+1)"</b></span>')}},
npm:{need:'nodejs',fn:(a,o)=>npm(a,o)},
npx:{need:'nodejs',fn:(a,o)=>npx(a,o)},
git:{need:'git',fn:(a,o)=>git(a,o)}
};
function cpmv(a,o,mv){const [f,r]=flags(a);const nm=mv?'mv':'cp';if(r.length<2)return o.err(`${nm}: missing destination file operand`);
  const [s,d]=r,sp=norm(s),dp0=norm(d),sn=node(sp);if(!sn)return o.err(`${nm}: cannot stat '${s}': No such file or directory`);
  if(sn.t==='d'&&!mv&&!f.has('r'))return o.err(`cp: -r not specified; omitting directory '${s}'`);
  if((mv&&(RO(sp)||inPG(sp)))||RO(dp0))return o.err(`${nm}: Read-only file system`);
  let dp=dp0;const dn=node(dp0);if(dn&&dn.t==='d')dp=dp0+'/'+parentOf(sp)[1];
  if(dp===sp||dp.startsWith(sp+'/'))return o.err(`${nm}: cannot move '${s}' to a subdirectory of itself`);
  const [pp,nn]=parentOf(dp),pn=node(pp);if(!pn||pn.t!=='d')return o.err(`${nm}: cannot create '${d}': No such file or directory`);
  pn.c[nn]=JSON.parse(JSON.stringify(sn));if(mv){const [sp2,sn2]=parentOf(sp);delete node(sp2).c[sn2]}}
async function pkg(a,o){
  const [c,...r]=a.filter(x=>x!=='-y');
  if(!c)return o.out('Usage: pkg [command] [arguments]\n\nCommands:\n  install   Install packages\n  update    Update apt database\n  upgrade   Upgrade all packages\n  list-installed  List installed packages');
  if(c==='update'||c==='upgrade'){o.out('Checking availability of current mirror:\n[*] https://packages-cf.termux.dev/apt/termux-main: ok');await sleep(500);o.out('Hit:1 https://packages-cf.termux.dev/apt/termux-main stable InRelease');await sleep(400);o.out('Reading package lists... Done\nBuilding dependency tree... Done');o.out(c==='upgrade'?'0 upgraded, 0 newly installed, 0 to remove and 0 not upgraded.':'All packages are up to date.');T.upd=1;return}
  if(c==='list-installed'){T.pk.forEach(p=>o.out(p+'/stable,now installed'));if(!T.pk.length)o.out('Listing... Done');return}
  if(c==='install'||c==='add'){if(!r.length)return o.err('E: No packages specified');
    for(const p of r){const k=p==='node'?'nodejs':p==='java'||p==='openjdk-17'?'openjdk-21':p;
      if(!PKGS[k]){o.err(`E: Unable to locate package ${p}`);continue}
      if(T.pk.includes(k)){o.out(`${PKGS[k][0].split(' ')[0]} is already the newest version (${PKGS[k][0].split(' ')[1]}).`);continue}
      o.out('Reading package lists... Done\nThe following NEW packages will be installed:\n  '+PKGS[k].map(x=>x.split(' ')[0]).join(' '));
      for(let i=1;i<=4;i++){await sleep(220);o.html(`<span class="dim">Get:${i} https://packages-cf.termux.dev ${PKGS[k][0].split(' ')[0]} [${(i*1.7).toFixed(1)} MB]</span>`)}
      await sleep(300);PKGS[k].forEach(x=>o.out('Setting up '+x.replace(' ',' (')+') ...'));T.pk.push(k);
      o.html(`<span dir="rtl" class="ok">✓ تم تثبيت ${esc(k)}</span>`)}
    return}
  o.err(`Unknown command: '${c}' (run 'pkg help' for usage information)`);
}
function readJSON(p){const n=node(p);if(!n||n.t!=='f')return null;try{return JSON.parse(n.d)}catch(e){return undefined}}
function writeF(p,d){if(RO(p))return false;if(inPG(p)){window.NXE&&window.NXE.setFile(PGF[p.slice(PG.length+1)],d);return true}const [pp,nm]=parentOf(p),pn=node(pp);if(!pn)return false;pn.c[nm]={t:'f',d};return true}
async function npm(a,o){
  const c=a[0];
  if(c==='-v'||c==='--version')return o.out('10.9.0');
  if(c==='init'){const p=norm('package.json');const name=parentOf(T.cwd)[1].toLowerCase().replace(/[^a-z0-9-]/g,'')||'app';const j={name,version:'1.0.0',description:'',main:'index.js',scripts:{test:'echo "Error: no test specified" && exit 1'},keywords:[],author:'',license:'ISC'};
    if(!a.includes('-y')&&!a.includes('--yes'))o.html('<span dir="rtl" class="dim">نستخدم الإعدادات الافتراضية (مثل npm init -y).</span>');
    if(!writeF(p,JSON.stringify(j,null,2)+'\n'))return o.err('npm error EROFS: read-only file system');o.out(`Wrote to ${p}:\n`);JSON.stringify(j,null,2).split('\n').forEach(x=>o.out(x));return}
  if(c==='install'||c==='i'||c==='ci'){const pj=readJSON(norm('package.json'));
    if(pj===null)return o.err(`npm error code ENOENT\nnpm error path ${T.cwd}/package.json\nnpm error enoent Could not read package.json`);
    if(pj===undefined)return o.err('npm error code EJSONPARSE\nnpm error JSON.parse Invalid package.json');
    const add=a.slice(1).filter(x=>!x.startsWith('-'));
    if(add.length&&!inPrj(T.cwd)){pj.dependencies=pj.dependencies||{};add.forEach(x=>{const m=x.match(/^(@?[^@]+)(?:@(.+))?$/);pj.dependencies[m[1]]='^'+(m[2]||(m[1].startsWith('@capacitor')?'8.0.0':'1.0.0'))});writeF(norm('package.json'),JSON.stringify(pj,null,2)+'\n')}
    const deps=Object.keys(Object.assign({},pj.dependencies,pj.devDependencies));
    for(let i=0;i<3;i++){await sleep(350);o.html('<span class="dim">'+['⠋ reify:fsevents','⠙ idealTree: timing','⠹ reify: extracting'][i]+'</span>')}
    const n=deps.length?deps.length*17+3:0;
    if(!inPrj(T.cwd)){const cw=node(T.cwd);cw.c.node_modules=cw.c.node_modules||dir();deps.forEach(d=>{cw.c.node_modules.c[d.replace('/','__')]=dir()})}
    o.out(`\nadded ${n} packages, and audited ${n+1} packages in ${(1+deps.length*.6).toFixed(0)}s\n\nfound 0 vulnerabilities`);return}
  if(c==='run'||c==='start'){const pj=readJSON(norm('package.json'));if(!pj)return o.err('npm error Missing script');const s=c==='start'?'start':a[1];if(!pj.scripts||!pj.scripts[s])return o.err(`npm error Missing script: "${s}"`);o.out(`\n> ${pj.name}@${pj.version} ${s}\n> ${pj.scripts[s]}\n`);return exec(pj.scripts[s])}
  o.out('npm <command>\n\nUsage:\n  npm init        create a package.json\n  npm install     install dependencies\n  npm run <name>  run a script');
}
async function npx(a,o){
  if(a[0]!=='cap'&&a[0]!=='@capacitor/cli')return o.err(`npm error could not determine executable to run`);
  const c=a[1];const pj=readJSON(norm('package.json'));
  const hasCli=pj&&Object.keys(Object.assign({},pj.dependencies,pj.devDependencies)).some(x=>x==='@capacitor/cli');
  if(!hasCli)return o.err('npm error could not determine executable to run\n'+'  (ثبّت أولاً: npm install @capacitor/core @capacitor/cli @capacitor/android)');
  const nm=node(norm('node_modules'));if(!inPrj(T.cwd)&&!nm)return o.err('[error] Capacitor CLI not found. Run npm install first.');
  const cfgP=norm('capacitor.config.json');
  if(c==='init'){const name=a[2]||'My App',id=a[3]||'com.example.app';if(!/^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/.test(id))return o.err(`[error] Invalid App ID "${id}". Must be in Java package form with no dashes (ex: com.example.app)`);
    if(!writeF(cfgP,JSON.stringify({appId:id,appName:name,webDir:'www'},null,2)+'\n'))return o.err('[error] Read-only file system');await sleep(300);o.html(`<span class="ok">✔</span> Creating capacitor.config.json in ${esc(T.cwd)} in 4.21ms`);o.html('<span class="ok">[success]</span> capacitor.config.json created!');return}
  const cfg=readJSON(cfgP);if(!cfg)return o.err('[error] Capacitor could not find the web assets directory. Create capacitor.config.json first (npx cap init).');
  const www=node(norm(cfg.webDir||'www'));
  if(c==='add'){if(a[2]!=='android')return o.err(`[error] Platform ${a[2]||''} not found. Use: npx cap add android`);
    if(!www||!www.c['index.html'])return o.err(`[error] Could not find the web assets directory: ./${cfg.webDir}.\n       Please create it and make sure it has an index.html file.`);
    if(node(norm('android'))&&!inPrj(T.cwd))return o.err('[error] android platform already exists.\n        To re-add this platform, first remove ./android, then run this command again.');
    for(const s of ['Adding native android project in android in','add in','Copying web assets from www to android/app/src/main/assets/public in','Creating capacitor.config.json in android/app/src/main/assets in','Updating Android plugins in']){await sleep(260);o.html(`<span class="ok">✔</span> ${s} ${(Math.random()*90+10).toFixed(2)}ms`)}
    o.html('<span class="ok">[success]</span> android platform added!');o.out('Follow the Developer Workflow guide to get building:\nhttps://capacitorjs.com/docs/basics/workflow');
    if(!inPrj(T.cwd)){const w=node(T.cwd);w.c.android={t:'d',c:{app:{t:'d',c:{'build.gradle':{t:'f',d:'android {\n    namespace "'+cfg.appId+'"\n    defaultConfig {\n        applicationId "'+cfg.appId+'"\n        versionCode 1\n        versionName "1.0"\n    }\n}\n'},src:{t:'d',c:{main:{t:'d',c:{'AndroidManifest.xml':{t:'f',d:'<?xml version="1.0" encoding="utf-8"?>\n<manifest xmlns:android="http://schemas.android.com/apk/res/android">\n    <application android:label="'+cfg.appName+'">\n    </application>\n    <uses-permission android:name="android.permission.INTERNET" />\n</manifest>\n'}}}}}}},'gradlew':{t:'f',d:'#!/bin/sh\n'},'variables.gradle':{t:'f',d:'ext {\n    minSdkVersion = 24\n    compileSdkVersion = 36\n    targetSdkVersion = 36\n}\n'}}}}
    return}
  if(c==='sync'||c==='copy'){if(!node(norm('android'))&&!inPrj(T.cwd))return o.err('[error] android platform has not been added yet.\n        Run: npx cap add android');
    for(const s of ['Copying web assets from www to android/app/src/main/assets/public in','Creating capacitor.config.json in android/app/src/main/assets in','copy android in',...(c==='sync'?['Updating Android plugins in','update android in']:[])]){await sleep(220);o.html(`<span class="ok">✔</span> ${s} ${(Math.random()*60+5).toFixed(2)}ms`)}
    o.html(`<span class="ok">[info]</span> ${c} finished in ${(Math.random()+.4).toFixed(3)}s`);return}
  if(c==='open')return o.html('<span dir="rtl" class="dim">npx cap open يفتح Android Studio على الحاسوب، وليس متاحاً على الهاتف. لهذا نبني على GitHub Actions.</span>');
  if(c==='doctor'){o.out('💊   Capacitor Doctor  💊\n\nLatest Dependencies:\n  @capacitor/cli: 8.0.0\n  @capacitor/core: 8.0.0\n  @capacitor/android: 8.0.0\n\n[success] Android looking great! 👌');return}
  o.out('Usage: npx cap [command]\n\nCommands:\n  init [appName] [appId]   Initialize Capacitor configuration\n  add android              Add the Android platform\n  sync                     Copy web assets and update plugins\n  copy                     Copy web assets only\n  doctor                   Check your setup');
}
async function git(a,o){
  const root=()=>{let p=T.cwd;while(true){const n=node(p);if(inPrj(p))return PRJ;if(n&&n.t==='d'&&n.c['.git'])return p;if(p==='/')return null;p=parentOf(p)[0]}};
  const c=a[0];
  if(c==='--version'||c==='-v')return o.out('git version 2.47.0');
  if(c==='init'){if(inPrj(T.cwd))return o.out('Reinitialized existing Git repository in '+PRJ+'/.git/');const n=node(T.cwd);const re=!!n.c['.git'];n.c['.git']=n.c['.git']||{t:'d',c:{HEAD:{t:'f',d:'ref: refs/heads/main\n'}}};o.out(`${re?'Reinitialized existing':'Initialized empty'} Git repository in ${T.cwd}/.git/`);return}
  if(c==='config'){const k=a.find(x=>/^user\.(name|email)$/.test(x));if(!k)return o.err('error: key does not contain a section');const v=a[a.indexOf(k)+1];if(v==null)return o.out(T.git[k]||'');T.git[k]=v;return}
  const rt=root();if(!rt)return o.err('fatal: not a git repository (or any of the parent directories): .git');
  const st=T.git[rt]=T.git[rt]||{staged:[],commits:0,remote:'',br:'main'};
  const allFiles=()=>{const r=[];const walk=(n,p)=>Object.entries(n.c).forEach(([k,v])=>{if(k==='.git'||k==='node_modules'||k==='android')return;v.t==='d'?walk(v,p+k+'/'):r.push(p+k)});walk(node(rt),'');return r};
  if(c==='status'){o.out('On branch '+st.br);if(!st.commits)o.out('\nNo commits yet');
    if(inPrj(rt)){o.out("Your branch is up to date with 'origin/main'.\n\nnothing to commit, working tree clean");o.html('<span dir="rtl" class="dim">مشروعك محفوظ تلقائياً. اكتب <b dir="ltr">git push</b> لبنائه على GitHub.</span>');return}
    const fs=allFiles(),cm=st.cm||[],un=fs.filter(f=>!st.staged.includes(f)&&!cm.includes(f));
    if(st.staged.length){o.out('\nChanges to be committed:');st.staged.forEach(f=>o.html('<span class="ok">\tnew file:   '+esc(f)+'</span>'))}
    if(un.length){o.out('\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)');un.forEach(f=>o.html('<span class="err">\t'+esc(f)+'</span>'))}
    if(!st.staged.length&&!un.length)o.out('\nnothing to commit, working tree clean');return}
  if(c==='add'){if(!a[1])return o.err('Nothing specified, nothing added.\nhint: Maybe you wanted to say \'git add .\'?');if(inPrj(rt))return;
    const fs=allFiles();if(a[1]==='.'||a[1]==='-A'||a[1]==='--all')st.staged=fs;else for(const f of a.slice(1)){const rel=norm(f).slice(rt.length+1);if(!fs.includes(rel)&&!fs.some(x=>x.startsWith(rel+'/')))return o.err(`fatal: pathspec '${f}' did not match any files`);fs.filter(x=>x===rel||x.startsWith(rel+'/')).forEach(x=>!st.staged.includes(x)&&st.staged.push(x))}
    return}
  if(c==='commit'){const mi=a.indexOf('-m');if(mi<0||!a[mi+1])return o.err('Aborting commit due to empty commit message.\n(استخدم: git commit -m "رسالة")');
    if(inPrj(rt))return o.out(`[main ${Math.random().toString(16).slice(2,9)}] ${a[mi+1]}\n (مشروعك يُحفظ تلقائياً — التغييرات ستُرفع مع git push)`);
    if(!T.git['user.name']&&!T.git['user.email'])return o.err('Author identity unknown\n\n*** Please tell me who you are.\n\nRun\n\n  git config --global user.email "you@example.com"\n  git config --global user.name "Your Name"');
    if(!st.staged.length)return o.err('nothing to commit (create/copy files and use "git add" to track)');
    st.commits++;o.out(`[${st.br}${st.commits===1?' (root-commit)':''} ${Math.random().toString(16).slice(2,9)}] ${a[mi+1]}\n ${st.staged.length} file${st.staged.length>1?'s':''} changed`);st.cm=[...new Set([...(st.cm||[]),...st.staged])];st.staged=[];return}
  if(c==='branch'){if(a[1]==='-M'&&a[2]){st.br=a[2];return}return o.html('* <span class="ok">'+esc(st.br)+'</span>')}
  if(c==='remote'){if(a[1]==='add'&&a[2]&&a[3]){if(st.remote&&!inPrj(rt))return o.err('error: remote origin already exists.');st.remote=a[3];return}if(a[1]==='-v'){const u=inPrj(rt)?`https://github.com/${(S.bld&&S.bld.o)||'USERNAME'}/my-nile-app.git`:st.remote;if(u){o.out(`origin\t${u} (fetch)`);o.out(`origin\t${u} (push)`)}return}return o.out(st.remote?'origin':'')}
  if(c==='log'){if(!st.commits&&!inPrj(rt))return o.err(`fatal: your current branch '${st.br}' does not have any commits yet`);o.html('<span class="tg">commit '+Math.random().toString(16).slice(2,14)+'</span> (HEAD -> '+esc(st.br)+')');o.out('Author: '+(T.git['user.name']||'you')+'\nDate:   '+new Date().toString().slice(0,24));return}
  if(c==='push'){
    if(inPrj(rt)){
      if(!window.NXP.TK()){o.html('<span dir="rtl" class="err">لم تحفظ رمز GitHub بعد. افتحه من «مشروعي» ثم عُد إلى هنا.</span>');return false}
      if(!done.includes(15)){o.html('<span dir="rtl" class="err">البناء يُفتح بعد المحطة 16 «إنشاء مشروع Capacitor».</span>');return false}
      o.out('Enumerating objects: 8, done.\nCounting objects: 100% (8/8), done.');
      try{await window.NXP.build(m=>o.html('<span dir="rtl" class="dim">• '+esc(m)+'</span>'));
        o.out(`To https://github.com/${S.bld.o}/my-nile-app.git\n   ${S.bld.sha.slice(0,7)}..main -> main`);
        o.html('<span dir="rtl" class="ok">✓ بدأ بناء APK على GitHub. تابع التقدّم وحمّل التطبيق من «مشروعي».</span>');o.html('<button class="tbtn" data-open="pj">افتح «مشروعي»</button>')}
      catch(e){o.err('error: failed to push some refs\n'+(e.status===401?'remote: Invalid username or token.':e.message));return false}
      return}
    if(!st.remote)return o.err("fatal: No configured push destination.\nEither specify the URL from the command-line or configure a remote repository using\n\n    git remote add <name> <url>");
    if(!st.commits)return o.err(`error: src refspec ${st.br} does not match any\nerror: failed to push some refs to '${st.remote}'`);
    o.out(`Username for 'https://github.com': `);await sleep(400);o.html('<span dir="rtl" class="dim">(محاكاة) في Termux الحقيقي تكتب اسمك ثم الرمز (Token) بدل كلمة المرور.</span>');await sleep(400);
    o.out(`Enumerating objects: ${st.commits*5}, done.\nWriting objects: 100% (${st.commits*5}/${st.commits*5}), done.\nTo ${st.remote}\n * [new branch]      ${st.br} -> ${st.br}`);return}
  if(c==='clone'||c==='pull')return o.html('<span dir="rtl" class="dim">(محاكاة) هذا الأمر يحتاج اتصالاً حقيقياً بـ GitHub. جرّب init وadd وcommit وpush.</span>');
  o.out('usage: git <command>\n\n  init      Create an empty Git repository\n  status    Show the working tree status\n  add       Add file contents to the index\n  commit    Record changes to the repository\n  remote    Manage set of tracked repositories\n  push      Update remote refs');
}
document.addEventListener('click',e=>{const b=e.target.closest('#term [data-open=pj]');if(b){closeTerm();window.NXP.pgProject()}});

/* ===== محرر nano ===== */
let nanoP=null;
function openNano(p,txt,name){nanoP=p;const ro=RO(p);
  const d=document.createElement('div');d.className='nano';d.dir='ltr';d.innerHTML=`<div class="nh"><span>GNU nano 8.2</span><b>${esc(name)}${ro?' [Read Only]':''}</b><span></span></div><textarea spellcheck="false" autocapitalize="off" autocomplete="off" dir="ltr"${ro?' readonly':''}>${esc(txt)}</textarea><div class="nf"><button data-n="save"${ro?' disabled':''}><b>^O</b> Write Out</button><button data-n="exit"><b>^X</b> Exit</button></div>`;
  el.appendChild(d);const ta=d.querySelector('textarea');ta.focus();ta.setSelectionRange(0,0);
  d.addEventListener('keydown',e=>{if(e.ctrlKey&&e.key.toLowerCase()==='o'){e.preventDefault();saveNano()}else if(e.ctrlKey&&e.key.toLowerCase()==='x'){e.preventDefault();closeNano(true)}else if(e.key==='Tab'){e.preventDefault();ta.setRangeText('  ',ta.selectionStart,ta.selectionEnd,'end')}});
  d.addEventListener('click',e=>{const b=e.target.closest('[data-n]');if(!b)return;b.dataset.n==='save'?saveNano():closeNano(true)});
}
function saveNano(){const d=el.querySelector('.nano');if(!d||RO(nanoP))return;const t=d.querySelector('textarea').value;writeF(nanoP,t.endsWith('\n')||!t?t:t+'\n');saveFS();
  const s=d.querySelector('.nh span:last-child');s.textContent=`[ Wrote ${t.split('\n').length} lines ]`;d._saved=t}
function closeNano(){const d=el&&el.querySelector('.nano');if(!d)return;const t=d.querySelector('textarea').value,n=node(nanoP),orig=n?n.d:'';
  if(!RO(nanoP)&&d._saved!==t&&t!==orig&&!(t+'\n'===orig)){if(!confirm('حفظ التعديلات قبل الخروج؟'))null;else saveNano()}
  d.remove();inp.focus();updPrompt()}

/* ===== نقاط الدخول ===== */
// زر «شغّل في الطرفية» لأكواد bash داخل الدروس
const _open=open;
open=function(i){_open(i);let k=0;const cs=L[i].b.filter(x=>x[0]==='c');
  $('#lv').querySelectorAll('.code').forEach(c=>{const x=cs[k++];if(!x||x[1]!=='bash')return;const b=document.createElement('button');b.className='cp trm';b.innerHTML=ic('term2',14)+' شغّل';c.querySelector('.ch').appendChild(b)})};
$('#lv').addEventListener('click',e=>{const t=e.target.closest('.trm');if(!t)return;e.stopImmediatePropagation();const cmds=t.closest('.code').querySelector('pre').textContent;if(window.NXE)window.NXE.open(null,'html',null,{term:cmds});else openTerm(cmds)},true);
window.NXT={openTerm,isOpen:()=>!!el,run:l=>run(l),closeTerm,reset:()=>{FS=freshFS();T.cwd=HOME;T.pk=[];T.git={};saveFS();saveT2()},fs:()=>FS,T};
})();
