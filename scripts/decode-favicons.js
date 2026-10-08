#!/usr/bin/env node
/**
 * Decode scripts/favicon-b64/*.b64 into public/ favicon assets.
 * Runs on Vercel via package.json "vercel-build" / "postinstall".
 */
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
  const dest = path.join(root, destRel);
  if (!fs.existsSync(src)) {
    console.warn(`[decode-favicons] missing ${srcName}, skip`);
    continue;
  }
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  const buf = Buffer.from(fs.readFileSync(src, 'utf8').trim(), 'base64');
  fs.writeFileSync(dest, buf);
  console.log(`[decode-favicons] wrote ${destRel} (${buf.length} bytes)`);
}
