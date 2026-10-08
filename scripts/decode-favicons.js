#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const srcDir = path.join(root, 'scripts', 'favicon-b64');

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
