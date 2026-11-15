// محرر كود احترافي خفيف: تلوين، أرقام أسطر، إكمال تلقائي، أقواس ووسوم تلقائية، ومعاينة في صفحة مستقلة
(()=>{
const {toast,esc}=window.NX;

/* ===================== التلوين ===================== */
const sp=(c,t)=>`<span class="k-${c}">${esc(t)}</span>`;
const JSKW=new Set('const let var function return if else for while do of in new class extends async await try catch finally throw switch case break continue default typeof instanceof import export from delete void yield'.split(' '));
const JSLIT=new Set(['true','false','null','undefined','this','NaN']);
const JSBI=new Set('document window console localStorage JSON Math Date Array Object String Number Promise navigator history setTimeout setInterval alert fetch parseInt parseFloat'.split(' '));
function hlJS(s){
  const re=/(\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$))|(`(?:\\[\s\S]|[^`\\])*`?|'(?:\\.|[^'\\\n])*'?|"(?:\\.|[^"\\\n])*"?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(=>|[{}()[\];,.<>+\-*/%=!&|?:])|(\s+)|([\s\S])/g;
  let o='',m,prev='';
  while((m=re.exec(s))){
    if(m[1])o+=sp('c',m[1]);else if(m[2])o+=sp('s',m[2]);else if(m[3])o+=sp('n',m[3]);
    else if(m[4]){const w=m[4],nx=s.slice(re.lastIndex).match(/^\s*\(/);
      o+=JSKW.has(w)?sp('k',w):JSLIT.has(w)?sp('l',w):prev==='.'?sp(nx?'f':'p',w):JSBI.has(w)?sp('b',w):nx?sp('f',w):esc(w)}
    else if(m[5])o+=sp('o',m[5]);else o+=esc(m[6]||m[7]);
    if(!m[6])prev=m[0];
  }return o}
function hlCSS(s){
  let o='',i=0,depth=0,inVal=false;
  const re=/(\/\*[\s\S]*?(?:\*\/|$))|("(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(#[0-9a-fA-F]{3,8}\b)|(-?\d*\.?\d+(?:px|rem|em|%|vh|vw|dvh|s|ms|deg|fr)?\b)|(@[\w-]+)|([\w-]+)|([{}:;])|(\s+)|([\s\S])/g;let m;
  while((m=re.exec(s))){
    if(m[1])o+=sp('c',m[1]);else if(m[2])o+=sp('s',m[2]);else if(m[3])o+=sp('n',m[3]);else if(m[5])o+=sp('k',m[5]);
    else if(m[4])o+=depth&&inVal?sp('n',m[4]):sp('t',m[4]);
    else if(m[6]){const w=m[6];if(!depth)o+=sp('t',w);else if(!inVal&&/^\s*:/.test(s.slice(re.lastIndex)))o+=sp('p',w);else if(inVal)o+=sp('v',w);else o+=esc(w)}
    else if(m[7]){const c=m[7];if(c==='{'){depth++;inVal=false}else if(c==='}'){depth=Math.max(0,depth-1);inVal=false}else if(c===':'&&depth)inVal=true;else if(c===';')inVal=false;o+=sp('o',c)}
    else o+=esc(m[8]||m[9]);
  }return o}
function hlTag(t){
  const m=t.match(/^(<\/?)([\w-]*)([\s\S]*?)(\/?>)?$/);if(!m)return esc(t);
  let o=sp('o',m[1])+sp('t',m[2]);
  o+=m[3].replace(/([^\s=]+)(\s*=\s*)?("[^"]*"?|'[^']*'?|[^\s>]+)?|(\s+)/g,(x,a,eq,v,ws)=>ws?ws:(esc(a)&&`<span class="k-a">${esc(a)}</span>`)+(eq?sp('o',eq):'')+(v?sp('s',v):''));
  return o+(m[4]?sp('o',m[4]):'')}
function hlHTML(s){
  const re=/(<!--[\s\S]*?(?:-->|$))|(<!doctype[^>]*>?)|(<(script|style)\b[^>]*>)([\s\S]*?)(<\/\4>|$)|(<\/?[a-zA-Z][^<>]*>?)|([^<]+)|(<)/gi;let o='',m;
  while((m=re.exec(s))){
    if(m[1])o+=sp('c',m[1]);else if(m[2])o+=sp('k',m[2]);
    else if(m[3]){o+=hlTag(m[3])+(m[4].toLowerCase()==='style'?hlCSS(m[5]):hlJS(m[5]))+(m[6]?hlTag(m[6]):'')}
    else if(m[7])o+=hlTag(m[7]);else o+=esc(m[8]||m[9]);
    if(!m[0])re.lastIndex++;
  }return o}
const hlJSON=s=>esc(s).replace(/(&quot;(?:[^&]|&(?!quot;))*?&quot;)(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?)/g,(x,str,col,lit,num)=>str?`<span class="k-${col?'p':'s'}">${str}</span>${col||''}`:lit?`<span class="k-l">${lit}</span>`:`<span class="k-n">${num}</span>`);
const HL={html:hlHTML,css:hlCSS,js:hlJS,json:hlJSON,yaml:s=>esc(s).replace(/^(\s*-?\s*)([\w.-]+)(:)/gm,'$1<span class="k-p">$2</span>$3').replace(/(#.*)$/gm,'<span class="k-c">$1</span>').replace(/(\$\{\{[^}]*\}\})/g,'<span class="k-b">$1</span>'),bash:s=>esc(s).replace(/(#.*)$/gm,'<span class="k-c">$1</span>').replace(/^(\s*)([\w.-]+)/gm,'$1<span class="k-f">$2</span>').replace(/(\s)(-{1,2}[\w-]+)/g,'$1<span class="k-n">$2</span>')};
const hl=(code,lang)=>(HL[lang]||esc)(code);

/* ===================== بيانات الإكمال ===================== */
const VOID=new Set('img input meta link br hr source area base col embed wbr'.split(' '));
const TAGS='div span p a img button input form label ul ol li h1 h2 h3 h4 header main footer section nav article aside textarea select option table tr td th br hr strong em small code pre canvas video audio iframe script style link meta title head body html'.split(' ');
const ATTRS='id class style src href alt type value placeholder name onclick dir lang charset content rel width height disabled checked for action method required autocomplete hidden target'.split(' ');
const CSSP='display flex-direction flex-wrap flex justify-content align-items align-self gap grid-template-columns place-items position top right bottom left inset width height min-height max-width min-width margin margin-top margin-bottom padding padding-inline border border-radius border-bottom background background-color color font-size font-weight font-family line-height text-align text-decoration letter-spacing box-shadow opacity transition transform overflow z-index cursor outline object-fit aspect-ratio animation backdrop-filter'.split(' ');
const CSSV={display:'flex grid block inline-block inline-flex none',position:'relative absolute fixed sticky static','flex-direction':'row column row-reverse column-reverse','flex-wrap':'wrap nowrap','justify-content':'center space-between space-around space-evenly flex-start flex-end','align-items':'center flex-start flex-end stretch baseline','text-align':'center right left start end','font-weight':'400 500 600 700 bold normal',overflow:'hidden auto scroll visible',cursor:'pointer default','object-fit':'cover contain','text-decoration':'none underline line-through','place-items':'center start end','font-family':'system-ui sans-serif monospace'};
const CSSG='auto none 0 100% 50% 1fr inherit transparent #fff #000 var(--) 12px 16px 24px 1rem 100dvh'.split(' ');
const JSW=['const','let','function','return','if','else','for','while','document','console.log()','document.getElementById()','document.querySelector()','document.querySelectorAll()','document.createElement()','addEventListener()','appendChild()','textContent','innerHTML','classList.add()','classList.remove()','classList.toggle()','localStorage.getItem()','localStorage.setItem()','JSON.parse()','JSON.stringify()','setTimeout()','forEach()','map()','filter()','push()','length','value','preventDefault()','querySelector()','getElementById()','trim()','true','false','null','async','await','fetch()','Math.random()','Math.floor()'];
const SNIP={'!':'<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>تطبيقي</title>\n</head>\n<body>\n  ‸\n</body>\n</html>','log':'console.log(‸);','fn':'function ‸() {\n  \n}','click':"addEventListener('click', () => {\n  ‸\n});"};

/* ===================== حالة المحرر ===================== */
const FILES0={html:'<!doctype html>\n<html lang="ar" dir="rtl">\n<head>\n  <meta charset="utf-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1">\n  <title>ملعبي</title>\n</head>\n<body>\n  <h1>مرحباً بالنيل</h1>\n  <button id="btn">اضغطني</button>\n</body>\n</html>\n',css:'body {\n  font-family: system-ui;\n  padding: 16px;\n}\n\nbutton {\n  min-height: 48px;\n  padding: 0 20px;\n  border: 0;\n  border-radius: 12px;\n  background: #0b7a85;\n  color: #fff;\n}\n',js:"const btn = document.getElementById('btn');\n\nbtn.addEventListener('click', () => {\n  btn.textContent = 'تم!';\n  console.log('ضغطت الزر');\n});\n"};
const NAMES={html:'index.html',css:'style.css',js:'script.js',json:'config.json',yaml:'build.yml',bash:'commands.sh'};
let E=null; // {files,tab,orig,ch,lang,free}
let ed,ta,pre,gut,ac,acItems=[],acI=0,acCtx=null;

function open(code,lang,ch,opt={}){
  close(true);
  const free=!ch&&code==null;
  const files=free?Object.assign({},FILES0,S.pgf||{}):{[lang]:code};
  E={files,tab:free?'html':lang,orig:free?null:code,ch,lang,free};
  ed=document.createElement('div');ed.id='ed';ed.setAttribute('role','dialog');ed.setAttribute('aria-modal','true');
  const tabs=Object.keys(files);
  ed.innerHTML=`<div class="eb"><button class="eic ex" aria-label="إغلاق">${ic('x',20)}</button>
    <div class="etabs" dir="ltr">${tabs.map(t=>`<button data-tab="${t}"${t===E.tab?' class="on"':''}><i class="d-${t}"></i>${NAMES[t]}</button>`).join('')}</div>
    <button class="eic eundo" aria-label="تراجع">${ic('back',18)}</button></div>
    ${ch?`<details class="etask" open><summary>${ic('target',16)} ${esc(ch.t)}</summary><p>${ch.d}</p></details>`:''}
    <div class="ewrap" dir="ltr"><div class="egut" aria-hidden="true"></div><div class="earea"><pre class="ehl" aria-hidden="true"></pre><textarea spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" wrap="off" aria-label="محرر الكود"></textarea><div class="eac" role="listbox" hidden></div></div></div>
    <div class="etp" hidden><div class="eth" role="separator" aria-label="اسحب لتغيير الارتفاع"><i></i></div><div class="etm"></div></div>
    <div class="ekeys" dir="ltr">${['⇥','<','>','/','=','"',"'",'{','}','(',')',';',':','.','-','!'].map(k=>`<button data-ek="${k}">${k}</button>`).join('')}</div>
    <div class="ebar"><button class="eb2 etg">${ic('term2',16)} الطرفية</button><span class="tsp"></span>${E.orig!=null&&!ch?`<button class="eb2 ereset">${ic('back',16)} الأصل</button>`:''}${ch?`<button class="eb2 echk">${ic('check',16)} تحقق</button>`:''}${['html','css','js'].includes(lang)||free?`<button class="erun">${ic('play',18)} تشغيل</button>`:''}</div>`;
  document.body.appendChild(ed);document.body.classList.add('pgon');
  ta=ed.querySelector('textarea');pre=ed.querySelector('.ehl');gut=ed.querySelector('.egut');ac=ed.querySelector('.eac');
  load();
  ta.addEventListener('input',onInput);
  ta.addEventListener('keydown',onKey);
  ta.addEventListener('scroll',sync,{passive:true});
  ta.addEventListener('click',()=>hideAC());
  ed.addEventListener('click',onClick);
  ac.addEventListener('pointerdown',e=>{const it=e.target.closest('[data-i]');if(it){e.preventDefault();accept(+it.dataset.i)}});
  ed.addEventListener('focusin',e=>ed.classList.toggle('tf',!!e.target.closest('.etp')));
  const th=ed.querySelector('.eth');
  th.addEventListener('pointerdown',e=>{e.preventDefault();th.setPointerCapture(e.pointerId);const panel=ed.querySelector('.etp'),bot=panel.getBoundingClientRect().bottom,max=ed.clientHeight-220;
    const mv=ev=>{const h=Math.max(140,Math.min(max,bot-ev.clientY));panel.style.height=h+'px';S.tph=h};
    th.addEventListener('pointermove',mv);th.addEventListener('pointerup',()=>{th.removeEventListener('pointermove',mv);sv()},{once:true})});
  if(opt.term!=null)showTerm(opt.term);else setTimeout(()=>ta.focus({preventScroll:true}),80);
}
function showTerm(cmds){const panel=ed.querySelector('.etp');panel.hidden=false;panel.style.height=(S.tph||Math.round(ed.clientHeight*.42))+'px';ed.querySelector('.etg').classList.add('on');
  window.NXT.openTerm(cmds||null,{mount:panel.querySelector('.etm'),cwd:'/data/data/com.termux/files/home'+(cmds?'':'/playground'),onClose:hideTerm})}
function hideTerm(){if(!ed)return;const panel=ed.querySelector('.etp');panel.hidden=true;ed.classList.remove('tf');ed.querySelector('.etg').classList.remove('on');if(window.NXT.isOpen())window.NXT.closeTerm()}
const termOn=()=>ed&&!ed.querySelector('.etp').hidden;
function load(){lastV=null;pre._k=null;LH=0;ta.value=E.files[E.tab];ta.setSelectionRange(0,0);paint();ta.scrollTop=0;ta.scrollLeft=0;sync()}
function langOf(){return E.tab}
// عرض افتراضي: نلوّن النص كاملاً (سريع) لكن نرسم في الصفحة الأسطر الظاهرة فقط
let LINES=[],lastV=null,lastL=null,LH=0,PADT=0;
function splitHL(h){const out=[];let cur='',open='';const re=/(<span class="[^"]*">)|(<\/span>)|(\n)|([^<\n]+|<)/g;let m;
  while((m=re.exec(h))){if(m[1]){open=m[1];cur+=m[1]}else if(m[2]){open='';cur+=m[2]}else if(m[3]){out.push(open?cur+'</span>':cur);cur=open}else cur+=m[4]}
  out.push(cur);return out}
function paint(){
  const v=ta.value,L=langOf();
  if(v!==lastV||L!==lastL){LINES=splitHL(hl(v,L));lastV=v;lastL=L;
    E.files[E.tab]=v;if(E.free){S.pgf=E.files;sv()}else if(E.ch)window.NX.saveCh(E.ch,v)}
  if(!LH){const cs=getComputedStyle(ta);LH=parseFloat(cs.lineHeight);PADT=parseFloat(cs.paddingTop)}
  draw();
}
function draw(){
  const n=LINES.length,top=ta.scrollTop,h=ta.clientHeight||600;
  const a=Math.max(0,Math.floor((top-PADT)/LH)-15),b=Math.min(n,Math.ceil((top+h)/LH)+15);
  const key=a+':'+b+':'+lastV.length+':'+(lastV===pre._v);
  if(pre._k!==key||pre._v!==lastV){pre.innerHTML=LINES.slice(a,b).join('\n')+'\n ';pre._k=key;pre._v=lastV;pre._a=a
    gut.innerHTML=Array.from({length:b-a},(_,i)=>`<span>${a+i+1}</span>`).join('');gut.style.minWidth=(String(n).length*9+22)+'px'}
  const off=pre._a*LH-top;
  pre.style.transform=`translate(${-ta.scrollLeft}px,${off}px)`;gut.style.transform=`translateY(${off}px)`;
}
function sync(){if(lastV==null)return;draw();if(!ac.hidden)placeAC()}
let raf=0;const repaint=()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;paint();sync()})};
function close(silent){if(!ed)return;hideAC();closePreview();if(termOn())hideTerm();ed.remove();ed=null;E=null;document.body.classList.remove('pgon')}

/* ===================== الإدخال الذكي ===================== */
const PAIR={'(':')','[':']','{':'}','"':'"',"'":"'",'`':'`'};
const ins=t=>{document.execCommand('insertText',false,t)||ta.setRangeText(t,ta.selectionStart,ta.selectionEnd,'end')};
const caret=()=>ta.selectionStart;
function insertAt(text){ // يدعم ‸ لموضع المؤشر
  const k=text.indexOf('‸');const t=text.replace('‸','');const s=caret();ins(t);if(k>=0){const p=s+k;ta.setSelectionRange(p,p)}}
function lineIndent(pos){const ls=ta.value.lastIndexOf('\n',pos-1)+1;return ta.value.slice(ls).match(/^[ \t]*/)[0]}
let guard=false;
function onInput(e){
  if(guard){repaint();return}
  const v=ta.value,p=caret(),d=e.data;
  guard=true;
  try{
    if(e.inputType==='insertLineBreak'||(e.inputType==='insertText'&&d==null&&v[p-1]==='\n')){
      const ind=lineIndent(p-1),before=v[p-2],after=v.slice(p);
      const opens=before==='{'||before==='['||before==='('||(before==='>'&&/<([a-zA-Z][\w-]*)[^<>]*>$/.test(v.slice(0,p-1))&&!/<\/[^>]+>$/.test(v.slice(0,p-1)));
      if(opens&&/^\s*([}\])]|<\/)/.test(after)){insertAt(ind+'  ‸\n'+ind)}
      else if(opens)ins(ind+'  ');else if(ind)ins(ind);
    }else if(e.inputType==='insertText'&&d&&d.length===1){
      const nx=v[p]||'';
      if(')]}"\'`'.includes(d)&&nx===d){document.execCommand('forwardDelete')}
      else if(PAIR[d]&&(!nx||/[\s)\]};,>]/.test(nx))&&!((d==="'"||d==='"'||d==='`')&&/\w/.test(v[p-2]||''))){ins(PAIR[d]);ta.setSelectionRange(p,p)}
      else if(d==='>'&&isHTMLCtx(p)){const m=v.slice(0,p).match(/<([a-zA-Z][\w-]*)(?:\s[^<>]*)?>$/);if(m&&!VOID.has(m[1].toLowerCase())&&!/\/>$/.test(v.slice(0,p))){ins('</'+m[1]+'>');ta.setSelectionRange(p,p)}}
    }
  }finally{guard=false}
  repaint();suggest();
}
function onKey(e){
  if(!ac.hidden){
    if(e.key==='ArrowDown'){e.preventDefault();acI=(acI+1)%acItems.length;drawAC();return}
    if(e.key==='ArrowUp'){e.preventDefault();acI=(acI-1+acItems.length)%acItems.length;drawAC();return}
    if(e.key==='Enter'||e.key==='Tab'){e.preventDefault();accept(acI);return}
    if(e.key==='Escape'){e.preventDefault();hideAC();return}
  }
  if(e.key==='Tab'){e.preventDefault();if(!expand())ins('  ')}
  if((e.ctrlKey||e.metaKey)&&e.key==='Enter'){e.preventDefault();runPreview()}
}
function expand(){const v=ta.value,p=caret(),m=v.slice(0,p).match(/(^|\s)(!|log|fn|click)$/);if(!m)return false;
  if(m[2]==='!'&&langOf()!=='html')return false;if(m[2]!=='!'&&langOf()!=='js'&&!inScript(p))return false;
  ta.setSelectionRange(p-m[2].length,p);insertAt(SNIP[m[2]]);repaint();return true}
const inScript=p=>{const b=ta.value.slice(0,p);return b.lastIndexOf('<script')>b.lastIndexOf('</script')};
const inStyle=p=>{const b=ta.value.slice(0,p);return b.lastIndexOf('<style')>b.lastIndexOf('</style')};
const isHTMLCtx=p=>langOf()==='html'&&!inScript(p)&&!inStyle(p);

/* ===================== الإكمال التلقائي ===================== */
function context(p){
  const v=ta.value,b=v.slice(0,p);let L=langOf();
  if(L==='html'){if(inStyle(p))L='css';else if(inScript(p))L='js'}
  if(L==='html'){
    const lt=b.lastIndexOf('<'),gt=b.lastIndexOf('>');
    if(lt>gt){const seg=b.slice(lt+1);
      if(/^\/?[\w-]*$/.test(seg)&&!seg.startsWith('/'))return {k:'tag',w:seg,list:TAGS};
      if(/\s[\w-]*$/.test(seg)&&(seg.split('"').length%2===1)){const w=seg.match(/[\w-]*$/)[0];return {k:'attr',w,list:ATTRS}}}
    return null}
  if(L==='css'){
    const lb=Math.max(b.lastIndexOf('{'),b.lastIndexOf(';')),rb=b.lastIndexOf('}');if(lb<rb||lb<0)return null;
    const decl=b.slice(lb+1);const ci=decl.indexOf(':');
    if(ci<0){const w=decl.match(/[\w-]*$/)[0];return w?{k:'prop',w,list:CSSP}:null}
    const prop=decl.slice(0,ci).trim(),w=decl.match(/[\w#%.()-]*$/)[0];
    return {k:'val',w,list:[...(CSSV[prop]||'').split(' ').filter(Boolean),...CSSG]}}
  if(L==='js'){
    if(/(\/\/[^\n]*|['"`][^'"`\n]*)$/.test(b.split('\n').pop()))return null;
    const w=b.match(/[\w$.]*$/)[0];if(!w||/^\d/.test(w))return null;
    return {k:'js',w,list:JSW}}
  return null}
function suggest(){
  const c=context(caret());if(!c){hideAC();return}
  const w=c.w.toLowerCase();
  if(!w&&c.k!=='tag'&&c.k!=='val'){hideAC();return}
  let items=c.list.filter(x=>x.toLowerCase().startsWith(w)&&(c.k!=='js'&&c.k!=='val'||x.toLowerCase()!==w));
  if(c.k==='js'&&w.includes('.')){const tail=w.split('.').pop();items=c.list.filter(x=>x.toLowerCase().startsWith(w)||(tail&&x.toLowerCase().startsWith(tail)&&!x.includes('.')&&x.length>3&&!JSKW.has(x)))}
  items=[...new Set(items)].slice(0,7);
  if(!items.length){hideAC();return}
  acItems=items;acI=0;acCtx=c;drawAC();ac.hidden=false;placeAC();
}
const KIND={tag:'وسم',attr:'خاصية',prop:'CSS',val:'قيمة',js:'JS'};
function drawAC(){ac.innerHTML=acItems.map((x,i)=>`<div data-i="${i}" class="${i===acI?'on':''}" role="option"><b>${esc(acCtx.w)}</b>${esc(x.slice(acCtx.k==='js'&&acCtx.w.includes('.')&&!x.toLowerCase().startsWith(acCtx.w.toLowerCase())?acCtx.w.split('.').pop().length:acCtx.w.length))}<small>${KIND[acCtx.k]}</small></div>`).join('')}
function placeAC(){
  const cs=getComputedStyle(ta),lh=parseFloat(cs.lineHeight),cw=charW(),pad=parseFloat(cs.paddingTop),padL=parseFloat(cs.paddingLeft);
  const b=ta.value.slice(0,caret()),ln=b.split('\n').length-1,col=b.length-b.lastIndexOf('\n')-1;
  let top=pad+(ln+1)*lh-ta.scrollTop+4,left=padL+col*cw-ta.scrollLeft;
  const W=ta.clientWidth;left=Math.max(4,Math.min(left,W-ac.offsetWidth-4));
  if(top+ac.offsetHeight>ta.clientHeight-4)top=Math.max(4,top-lh-ac.offsetHeight-8);
  ac.style.transform=`translate(${left}px,${top}px)`}
let _cw=0;function charW(){if(_cw)return _cw;const s=document.createElement('span');s.className='ehl';s.style.cssText='position:absolute;visibility:hidden;padding:0';s.textContent='x'.repeat(50);ed.appendChild(s);_cw=s.getBoundingClientRect().width/50;s.remove();return _cw}
function hideAC(){if(ac){ac.hidden=true;acItems=[]}}
function accept(i){
  const x=acItems[i],c=acCtx;if(!x)return;const p=caret();
  let start=p-c.w.length;if(c.k==='js'&&c.w.includes('.')&&!x.toLowerCase().startsWith(c.w.toLowerCase()))start=p-c.w.split('.').pop().length;
  ta.setSelectionRange(start,p);hideAC();
  let t=x;
  if(c.k==='tag'){const nx=ta.value[p];t=VOID.has(x)?x+' ‸':x+(nx==='>'?'‸':'>‸</'+x+'>')}
  else if(c.k==='attr')t=x+'="‸"';
  else if(c.k==='prop')t=x+': ‸';
  else if(c.k==='val')t=x+(ta.value[p]===';'?'':';')+'‸';
  else if(c.k==='js'&&x.endsWith('()'))t=x.slice(0,-1)+'‸)';
  guard=true;try{insertAt(t)}finally{guard=false}
  repaint();ta.focus();if(c.k==='prop')setTimeout(suggest,0);
}

/* ===================== الأزرار ===================== */
function onClick(e){
  if(e.target.closest('.ex'))return close();
  const tb=e.target.closest('[data-tab]');if(tb){hideAC();E.tab=tb.dataset.tab;ed.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('on',b===tb));load();return}
  const k=e.target.closest('[data-ek]');if(k){e.preventDefault();ta.focus({preventScroll:true});const v=k.dataset.ek;
    if(v==='⇥'){if(!ac.hidden)accept(acI);else if(!expand())ins('  ')}else ins(v);return}
  if(e.target.closest('.eundo')){ta.focus();document.execCommand('undo');repaint();return}
  if(e.target.closest('.ereset')){if(confirm('استعادة الكود الأصلي؟')){ta.focus();ta.select();ins(E.orig);repaint()}return}
  if(e.target.closest('.etg'))return termOn()?hideTerm():showTerm();
  if(e.target.closest('.erun'))return runPreview();
  if(e.target.closest('.echk'))return check();
}
// أزرار الرموز لا تخطف التركيز من المحرر
document.addEventListener('pointerdown',e=>{if(e.target.closest('#ed [data-ek],#ed .eundo'))e.preventDefault()});

/* ===================== التحقق من التحدي ===================== */
function check(){const r=window.NX.chk(E.ch,ta.value);
  let s=ed.querySelector('.eres');if(!s){s=document.createElement('div');s.className='eres';ed.appendChild(s)}
  s.innerHTML=`<div class="erh"><b>${r.every(x=>x[1])?'حل صحيح! 🎉':'نتيجة التحقق'}</b><button class="eic erx" aria-label="إغلاق">${ic('x',18)}</button></div><ul>${r.map(([l,o])=>`<li class="${o?'y':'n'}">${ic(o?'check':'x',16)} ${esc(l)}</li>`).join('')}</ul>`;
  s.querySelector('.erx').onclick=()=>s.remove()}

/* ===================== صفحة المعاينة ===================== */
let pv=null,logs=[];
function buildDoc(){
  if(E.free){let h=E.files.html;const css=`<style>\n${E.files.css}</style>`,js=`<script>\n${E.files.js.replace(/<\/script/gi,'<\\/script')}<\/script>`;
    h=/<\/head>/i.test(h)?h.replace(/<\/head>/i,css+'\n</head>'):css+h;h=/<\/body>/i.test(h)?h.replace(/<\/body>/i,js+'\n</body>'):h+js;return window.NX.doc(h,'html')}
  return window.NX.doc(E.files[E.tab],E.tab)}
function runPreview(){
  hideAC();ta.blur();logs=[];
  if(!pv){pv=document.createElement('div');pv.id='epv';pv.setAttribute('role','dialog');
    pv.innerHTML=`<div class="eb"><button class="eic epb" aria-label="رجوع للمحرر">${ic('back',20)}</button><b>المعاينة</b><span class="tsp"></span><button class="eic epr" aria-label="إعادة التشغيل">${ic('route',18)}</button><button class="eb2 epc">${ic('term2',15)} Console <i class="ecn">0</i></button></div><iframe sandbox="allow-scripts allow-modals allow-forms" title="معاينة التطبيق"></iframe><div class="econ" dir="ltr" hidden><div class="ech"><b>Console</b><button class="ecl">مسح</button></div><pre></pre></div>`;
    ed.appendChild(pv);
    pv.onclick=e=>{if(e.target.closest('.epb'))return closePreview();if(e.target.closest('.epr'))return runPreview();
      if(e.target.closest('.epc')){const c=pv.querySelector('.econ');c.hidden=!c.hidden}
      if(e.target.closest('.ecl')){logs=[];drawLogs()}}}
  pv.querySelector('iframe').srcdoc=buildDoc();drawLogs();
  requestAnimationFrame(()=>pv.classList.add('on'));
}
function closePreview(){if(!pv)return;pv.classList.remove('on');const p=pv;pv=null;setTimeout(()=>p.remove(),250);ta&&ta.focus({preventScroll:true})}
function drawLogs(){if(!pv)return;pv.querySelector('.econ pre').innerHTML=logs.map(l=>`<div class="${l.t}">${l.t==='log'?'›':'⚠'} ${esc(l.m)}</div>`).join('')||'<div class="dim">لا توجد رسائل بعد</div>';const n=pv.querySelector('.ecn');n.textContent=logs.length;n.classList.toggle('err',logs.some(l=>l.t!=='log'));if(logs.some(l=>l.t==='error'))pv.querySelector('.econ').hidden=false}
addEventListener('message',e=>{if(!pv||!e.data||!e.data.pg||e.source!==pv.querySelector('iframe').contentWindow)return;logs.push({t:e.data.t,m:e.data.m});drawLogs()});

/* ===================== زر الرجوع ===================== */
const prevB=window.NXB;
window.NXB=()=>{if(ed){if(!ac.hidden){hideAC();return true}if(pv){closePreview();return true}const r=ed.querySelector('.eres');if(r){r.remove();return true}if(termOn()){hideTerm();return true}close();return true}return prevB?prevB():false};

function files(){return E&&E.free?E.files:Object.assign({},FILES0,S.pgf||{})}
function setFile(k,d){if(!k)return;const f=files();f[k]=d;S.pgf=Object.assign({},S.pgf||{},{[k]:d});sv();if(E&&E.free){E.files[k]=d;if(E.tab===k){const p=ta.selectionStart;ta.value=d;ta.setSelectionRange(Math.min(p,d.length),Math.min(p,d.length));paint();sync()}}}
window.NXE={open,hl,close,files,setFile,term:c=>ed&&showTerm(c)};
})();
