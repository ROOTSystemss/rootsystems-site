const fs = require("fs");
const path = require("path");

// Tiny, purpose-built parser for RootSystems' own legal docs (Terms/
// Privacy/Refund) - not a general markdown engine. It only understands the
// exact subset those three files use: a leading "# Title" line (discarded,
// the page's own <h1> already shows the title), a "**Last updated: ...**"
// line, "## N. Section" headings, plain single-line paragraphs, "- " bullet
// lists, and a trailing "---" + italic disclaimer aimed at whoever reviews
// the file (attorney/founder), not site visitors - parsing stops there so
// that note never ends up on the live page.

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function inline(text) {
  var html = escapeHtml(text);
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(
    /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g,
    '<a href="mailto:$1">$1</a>'
  );
  return html;
}

function parseLegalMarkdown(raw) {
  var lines = raw.split("\n");
  var lastUpdated = null;
  var blocks = [];
  var listBuffer = null;

  function flushList() {
    if (listBuffer) {
      blocks.push({ type: "ul", items: listBuffer });
      listBuffer = null;
    }
  }

  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();

    if (line === "---") break; // draft-disclaimer footer starts here - stop

    if (!line) continue;

    if (line.startsWith("# ")) continue; // title - page's own <h1> covers it

    var lastUpdatedMatch = line.match(/^\*\*Last updated:\s*(.+?)\*\*$/);
    if (lastUpdatedMatch) {
      lastUpdated = lastUpdatedMatch[1];
      continue;
    }

    if (line.startsWith("## ")) {
      flushList();
      blocks.push({ type: "h2", html: inline(line.slice(3)) });
      continue;
    }

    if (line.startsWith("- ")) {
      if (!listBuffer) listBuffer = [];
      listBuffer.push(inline(line.slice(2)));
      continue;
    }

    flushList();
    blocks.push({ type: "p", html: inline(line) });
  }
  flushList();

  return { lastUpdated: lastUpdated, blocks: blocks };
}

// Reads + parses one of the three legal source files from the repo root.
// Returns null (never throws) if the file isn't there, so the page falls
// back to the "not published yet" placeholder - same safety property the
// controller had before any real content existed.
function loadLegalDoc(filename) {
  var filePath = path.join(__dirname, "..", "..", filename);
  if (!fs.existsSync(filePath)) return null;
  var raw = fs.readFileSync(filePath, "utf8");
  return parseLegalMarkdown(raw);
}

module.exports = { loadLegalDoc: loadLegalDoc, parseLegalMarkdown: parseLegalMarkdown };
