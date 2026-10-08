#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'scripts', 'favicon-b64');
const assembleDir = path.join(srcDir, '_assemble_apple');

function assembleAppleB64() {
  const partPaths = [0, 1, 2].map((i) => path.join(assembleDir, `part${i}`));
  const p3a = path.join(assembleDir, 'part3a');
  const p3c = path.join(assembleDir, 'part3c');
  if (![...partPaths, p3a, p3c].every((p) => fs.existsSync(p))) {
    return null;
  }
  const head = partPaths.map((p) => fs.readFileSync(p, 'utf8')).join('');
  const mid = fs.readFileSync(p3a, 'utf8');
  // bridge bytes via fromCharCode to avoid transport autocorrect
  const bridge = String.fromCharCode(110, 112, 122);
  const tail = fs.readFileSync(p3c, 'utf8');
  return head + mid + bridge + tail;
}

const appleAssembled = assembleAppleB64();
if (appleAssembled && appleAssembled.length > 1000) {
  const destB64 = path.join(srcDir, 'apple-touch-icon.png.b64');
  fs.writeFileSync(destB64, appleAssembled);
  console.log(`[decode-favicons] assembled apple-touch-icon.png.b64 (${appleAssembled.length} chars)`);
}

const mapping = [
  ['favicon-32.png.b64', 'public/images/favicon-32.png'],
  ['favicon-64.png.b64', 'public/images/favicon-64.png'],
  ['apple-touch-icon.png.b64', 'public/images/apple-touch-icon.png'],
  ['favicon.ico.b64', 'public/favicon.ico'],
];

for (const [srcName, destRel] of mapping) {
  const src = path.join(srcDir, srcName);
  if (!fs.existsSync(src)) {
    console.warn(`[decode-favicons] missing ${srcName}, skip`);
    continue;
  }
  const b64 = fs.readFileSync(src, 'utf8').trim();
  if (!b64 || b64 === 'LOADING' || b64 === 'PLACEHOLDER' || b64.length < 100) {
    console.warn(`[decode-favicons] incomplete ${srcName}, skip`);
    continue;
  }
  const dest = path.join(root, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(dest, buf);
  console.log(`[decode-favicons] wrote ${destRel} (${buf.length} bytes)`);
}
