#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'scripts', 'favicon-b64');

function readB64(baseName) {
  const whole = path.join(srcDir, baseName);
  if (fs.existsSync(whole)) {
    return fs.readFileSync(whole, 'utf8').trim();
  }
  let i = 0;
  let out = '';
  while (true) {
    const p = path.join(srcDir, `${baseName}.part${i}`);
    if (!fs.existsSync(p)) break;
    out += fs.readFileSync(p, 'utf8').trim();
    i++;
  }
  if (!out) return null;
  return out;
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
