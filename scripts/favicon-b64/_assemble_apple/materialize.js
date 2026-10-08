const fs=require('fs');const path=require('path');
const dir=__dirname;
const dest=path.join(dir,'..','apple-touch-icon.png.b64');
function fromParts(){
  const head=[0,1,2].map(i=>fs.readFileSync(path.join(dir,'part'+i),'utf8')).join('');
  const mid=fs.readFileSync(path.join(dir,'part3a'),'utf8');
  const bridge=String.fromCharCode(110,112,122);
  const tail=fs.readFileSync(path.join(dir,'part3c'),'utf8');
  return head+mid+bridge+tail;
}
function fromHeadSufs(){
  if(!fs.existsSync(dest)) return null;
  const head=fs.readFileSync(dest,'utf8');
  if(head.length!==17306) return null;
  const names=['suf_17306_20000','suf_20000_23000','suf_23000_25959','suf_25959_31138'];
  if(!names.every(n=>fs.existsSync(path.join(dir,n)))) return null;
  const mid=names.map(n=>fs.readFileSync(path.join(dir,n),'utf8')).join('');
  const bridge=String.fromCharCode(110,112,122);
  const tail=fs.readFileSync(path.join(dir,'part3c'),'utf8');
  return head+mid+bridge+tail;
}
const out=fromParts() || fromHeadSufs();
if(!out || out.length!==34612) { console.error('bad len', out&&out.length); process.exit(2); }
fs.writeFileSync(dest,out);
console.log('wrote',dest,out.length);
