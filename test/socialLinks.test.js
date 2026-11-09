"use strict";
// Task G 2026-11-08: the footer shows the RootSystems X and Instagram profiles as icon links, from one list.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { SOCIAL_LINKS, socialLinksHtml } = require("../src/data/socialLinks");

const html = socialLinksHtml();
assert.deepStrictEqual(SOCIAL_LINKS.map((l) => l.url), ["https://x.com/TheROOTsystems", "https://www.instagram.com/therootsystemms/"]);
for (const l of SOCIAL_LINKS) assert.ok(html.includes(`href="${l.url}" target="_blank" rel="noopener"`), l.name);
assert.strictEqual((html.match(/<a /g) || []).length, SOCIAL_LINKS.length, "one link per entry");
assert.ok(socialLinksHtml([...SOCIAL_LINKS, { name: "LinkedIn", url: "https://www.linkedin.com/company/x", icon: "linkedin" }]).includes("linkedin.com"), "adding an entry adds a link");
const root = path.join(__dirname, "..");
assert.ok(/<footer[\s\S]*socialLinksHtml[\s\S]*<\/footer>/.test(fs.readFileSync(path.join(root, "src", "views", "partials", "footer.ejs"), "utf8")), "footer renders the links");
assert.ok(fs.readFileSync(path.join(root, "src", "app.js"), "utf8").includes("app.locals.socialLinksHtml"), "app exposes the links to views");
console.log("PASS  social links: 2 profiles, new tab, noopener, in the footer");
