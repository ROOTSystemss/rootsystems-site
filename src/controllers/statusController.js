"use strict";
// AD-078 /status (knock-out 2026-11-17): live state of every product from the free uptime monitor.
const status = require("../services/statusService");

async function statusPage(req, res, next) {
  try {
    const history = await status.loadHistory();
    const summary = status.summarize(history, Math.floor(Date.now() / 1000));
    res.set("Cache-Control", "public, max-age=60");
    res.render("pages/status", { title: "Status — RootSystems", summary });
  } catch (err) { next(err); }
}

module.exports = { statusPage };
