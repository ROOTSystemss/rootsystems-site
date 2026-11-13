// Renders scripts/og-image.html to public/images/og-image.png (1200x630) with a local headless Chrome or Edge.
// Run by hand after changing the card: node scripts/build-og-image.js. Not part of the build.
// The screenshot is ~600 KB; it must then be saved as a 256-colour palette PNG to stay under 300 KB
// (test/seo.test.js checks), e.g. with sharp: png({ palette: true, colours: 256, dither: 1, effort: 10 }).
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");

const CANDIDATES = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
  "/usr/bin/google-chrome", "/usr/bin/chromium", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].filter(Boolean);
const browser = CANDIDATES.find((p) => fs.existsSync(p));
if (!browser) throw new Error("No Chrome or Edge found; set CHROME_PATH.");

const src = path.join(__dirname, "og-image.html");
const out = path.join(__dirname, "..", "public", "images", "og-image.png");
execFileSync(browser, [
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
  "--window-size=1200,630", "--virtual-time-budget=8000", "--screenshot=" + out, pathToFileURL(src).href,
], { stdio: "ignore", windowsHide: true });
const png = fs.readFileSync(out);
const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
if (width !== 1200 || height !== 630) throw new Error("og-image.png is " + width + "x" + height + ", expected 1200x630");
console.log("wrote " + path.relative(process.cwd(), out) + " (" + width + "x" + height + ", " + Math.round(png.length / 1024) + " KB)");
