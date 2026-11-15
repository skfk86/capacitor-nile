// مولّد رمز QR صغير (وضع البايت، تصحيح خطأ M، الإصدارات 1–10) — بلا مكتبات خارجية
const QR=(()=>{
const EC_M=[0,10,16,26,18,24,16,18,22,22,26]; // كلمات التصحيح لكل كتلة
const BLK_M=[0,1,1,1,2,2,4,4,4,5,5];          // عدد الكتل
const RAW=v=>{let r=(16*v+128)*v+64;if(v>=2){const n=Math.floor(v/7)+2;r-=(25*n-10)*n-55;if(v>=7)r-=36}return r};
const DATA=v=>Math.floor(RAW(v)/8)-EC_M[v]*BLK_M[v];
const ALIGN=v=>{if(v===1)return[];const n=Math.floor(v/7)+2,step=v===32?26:Math.ceil((v*4+4)/(n*2-2))*2,r=[6];for(let p=v*4+10;r.length<n;p-=step)r.splice(1,0,p);return r};
// حقل غالوا GF(256)
const EXP=new Array(512),LOG=new Array(256);(()=>{let x=1;for(let i=0;i<255;i++){EXP[i]=x;LOG[x]=i;x<<=1;if(x&256)x^=0x11d}for(let i=255;i<512;i++)EXP[i]=EXP[i-255]})();
const mul=(a,b)=>a&&b?EXP[LOG[a]+LOG[b]]:0;
function rsGen(d){let g=[1];for(let i=0;i<d;i++){const n=new Array(g.length+1).fill(0);g.forEach((c,j)=>{n[j]^=c;n[j+1]^=mul(c,EXP[i])});g=n}return g}
function rs(data,d){const g=rsGen(d),r=new Array(d).fill(0);for(const b of data){const f=b^r.shift();r.push(0);for(let i=0;i<d;i++)r[i]^=mul(g[i+1],f)}return r}
function encode(text){
  const bytes=[...new TextEncoder().encode(text)];
  let v=1;while(v<=10&&4+8*(v<10?1:2)+bytes.length*8>DATA(v)*8)v++;if(v>10)throw new Error('QR: text too long');
  const bits=[];const put=(val,n)=>{for(let i=n-1;i>=0;i--)bits.push((val>>>i)&1)};
  put(4,4);put(bytes.length,v<10?8:16);bytes.forEach(b=>put(b,8));
  const cap=DATA(v)*8;put(0,Math.min(4,cap-bits.length));while(bits.length%8)bits.push(0);
  for(let p=0xEC;bits.length<cap;p^=0xEC^0x11)put(p,8);
  const cw=[];for(let i=0;i<bits.length;i+=8)cw.push(parseInt(bits.slice(i,i+8).join(''),2));
  // تقسيم الكتل وتشبيكها
  const nb=BLK_M[v],ec=EC_M[v],raw=Math.floor(RAW(v)/8),short=nb-raw%nb,sLen=Math.floor(raw/nb)-ec;
  const blocks=[];for(let i=0,k=0;i<nb;i++){const len=sLen+(i<short?0:1);const d=cw.slice(k,k+len);k+=len;blocks.push([d,rs(d,ec)])}
  const out=[];for(let i=0;i<=sLen;i++)blocks.forEach(([d])=>{if(i<d.length)out.push(d[i])});
  for(let i=0;i<ec;i++)blocks.forEach(([,e])=>out.push(e[i]));
  // المصفوفة
  const N=v*4+17,M=[...Array(N)].map(()=>new Array(N).fill(null)),F=[...Array(N)].map(()=>new Array(N).fill(false));
  const set=(x,y,d)=>{M[y][x]=d;F[y][x]=true};
  const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x<0||y<0||x>=N||y>=N)continue;const d=Math.max(Math.abs(dx),Math.abs(dy));set(x,y,d!==2&&d!==4)}};
  finder(3,3);finder(N-4,3);finder(3,N-4);
  for(let i=0;i<N;i++){if(!F[6][i])set(i,6,i%2===0);if(!F[i][6])set(6,i,i%2===0)}
  const al=ALIGN(v);al.forEach(a=>al.forEach(b=>{if((a===6&&b===6)||(a===6&&b===N-7)||(a===N-7&&b===6))return;for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)set(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1)}));
  const fmt=(mask)=>{const data=(0<<3)|mask;let r=data;for(let i=0;i<10;i++)r=(r<<1)^((r>>>9)*0x537);const b=((data<<10)|r)^0x5412;
    for(let i=0;i<=5;i++)set(8,i,(b>>>i)&1);set(8,7,(b>>>6)&1);set(8,8,(b>>>7)&1);set(7,8,(b>>>8)&1);for(let i=9;i<15;i++)set(14-i,8,(b>>>i)&1);
    for(let i=0;i<8;i++)set(N-1-i,8,(b>>>i)&1);for(let i=8;i<15;i++)set(8,N-15+i,(b>>>i)&1);set(8,N-8,1)};
  fmt(0);
  if(v>=7){let r=v;for(let i=0;i<12;i++)r=(r<<1)^((r>>>11)*0x1F25);const b=(v<<12)|r;for(let i=0;i<18;i++){const bit=(b>>>i)&1,a=N-11+i%3,c=Math.floor(i/3);set(a,c,bit);set(c,a,bit)}}
  // وضع البيانات بنمط متعرّج
  const all=[];out.forEach(b=>{for(let i=7;i>=0;i--)all.push((b>>>i)&1)});
  let k=0;for(let r=N-1;r>=1;r-=2){if(r===6)r=5;for(let vv=0;vv<N;vv++)for(let j=0;j<2;j++){const x=r-j,up=((r+1)&2)===0,y=up?N-1-vv:vv;if(!F[y][x]){M[y][x]=k<all.length?all[k]===1:false;k++}}}
  // اختيار أفضل قناع
  const MASKS=[(x,y)=>(x+y)%2===0,(x,y)=>y%2===0,(x,y)=>x%3===0,(x,y)=>(x+y)%3===0,(x,y)=>(Math.floor(x/3)+Math.floor(y/2))%2===0,(x,y)=>x*y%2+x*y%3===0,(x,y)=>(x*y%2+x*y%3)%2===0,(x,y)=>((x+y)%2+x*y%3)%2===0];
  const apply=m=>{for(let y=0;y<N;y++)for(let x=0;x<N;x++)if(!F[y][x]&&MASKS[m](x,y))M[y][x]=!M[y][x]};
  const penalty=()=>{let p=0;for(let y=0;y<N;y++){let run=1;for(let x=1;x<N;x++){if(M[y][x]===M[y][x-1]){run++;if(run===5)p+=3;else if(run>5)p++}else run=1}}
    for(let x=0;x<N;x++){let run=1;for(let y=1;y<N;y++){if(M[y][x]===M[y-1][x]){run++;if(run===5)p+=3;else if(run>5)p++}else run=1}}
    for(let y=0;y<N-1;y++)for(let x=0;x<N-1;x++){const c=M[y][x];if(c===M[y][x+1]&&c===M[y+1][x]&&c===M[y+1][x+1])p+=3}
    let dark=0;M.forEach(r=>r.forEach(c=>dark+=c?1:0));p+=Math.floor(Math.abs(dark*20-N*N*10)/(N*N))*10;return p};
  let best=0,bp=1e9;for(let m=0;m<8;m++){apply(m);fmt(m);const p=penalty();if(p<bp){bp=p;best=m}apply(m)}
  apply(best);fmt(best);
  return M.map(r=>r.map(c=>!!c));
}
function draw(ctx,text,x,y,size,fg='#000',bg='#fff'){const m=encode(text),n=m.length,q=4,s=size/(n+q*2);ctx.fillStyle=bg;ctx.fillRect(x,y,size,size);ctx.fillStyle=fg;
  m.forEach((r,j)=>r.forEach((c,i)=>{if(c)ctx.fillRect(x+(i+q)*s,y+(j+q)*s,Math.ceil(s),Math.ceil(s))}))}
return {encode,draw};
})();
if(typeof module!=='undefined')module.exports=QR;
