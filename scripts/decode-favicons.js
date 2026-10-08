#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'scripts', 'favicon-b64');

function readB64(baseName) {
  const whole = path.join(srcDir, baseName);
  let fromParts = '';
  let i = 0;
  while (true) {
    const p = path.join(srcDir, `${baseName}.part${i}`);
    if (!fs.existsSync(p)) break;
    fromParts += fs.readFileSync(p, 'utf8').trim();
    i++;
  }
  if (fs.existsSync(whole)) {
    const w = fs.readFileSync(whole, 'utf8').trim();
    if (w.length > 100 && (!fromParts || w.length >= fromParts.length)) {
      return w;
    }
  }
  return fromParts || null;
}

const mapping = [
  ['favicon-32.png.b64', 'public/images/favicon-32.png'],
  ['favicon-64.png.b64', 'public/images/favicon-64.png'],
  ['apple-touch-icon.png.b64', 'public/images/apple-touch-icon.png'],
  ['favicon.ico.b64', 'public/favicon.ico'],
];

for (const [srcName, destRel] of mapping) {
  const b64 = readB64(srcName);
  const dest = path.join(root, destRel);
  if (!b64) {
    console.warn(`[decode-favicons] missing ${srcName}, skip`);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const buf = Buffer.from(b64, 'base64');
  fs.writeFileSync(dest, buf);
  console.log(`[decode-favicons] wrote ${destRel} (${buf.length} bytes)`);
}
