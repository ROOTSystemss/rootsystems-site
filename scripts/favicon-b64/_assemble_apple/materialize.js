const fs = require("fs");
const path = require("path");
const dir = __dirname;
const out = ["part0", "part1", "part2", "part3a"]
  .map((p) => fs.readFileSync(path.join(dir, p), "utf8"))
  .join("") + "npz" + fs.readFileSync(path.join(dir, "part3c"), "utf8");
const dest = path.join(dir, "..", "apple-touch-icon.png.b64");
fs.writeFileSync(dest, out);
console.log("wrote", dest, out.length);
