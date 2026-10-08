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
function fromHeadTail(){
  const tailPath=path.join(dir,'tail_14500');
  if(!fs.existsSync(dest)||!fs.existsSync(tailPath)) return null;
  const head=fs.readFileSync(dest,'utf8');
  const tail=fs.readFileSync(tailPath,'utf8');
  if(head.length===14500 && tail.length===20112) return head+tail;
  return null;
}
const out=fromParts();
if(out.length!==34612) process.exit(2);
fs.writeFileSync(dest,out);
console.log('wrote',dest,out.length);
