// Pricing page: plan tiers are radio buttons (role="radio", aria-checked) in one radiogroup per
// product. One tier is selected on the whole page at a time: choosing another moves the selection,
// marks its card (.is-selected) and clears the old one. Arrow keys move within a group (roving
// tabindex), as for native radio buttons. Styling is in pages.css (--rs-plan-* variables).
(function () {
  "use strict";

  // radios: every tier button on the page; chosen: the one to select (or null to clear).
  function select(radios, chosen) {
    radios.forEach(function (r) {
      r.setAttribute("aria-checked", r === chosen ? "true" : "false");
      var card = r.closest(".rs-plan");
      if (card) card.classList.remove("is-selected");
    });
    var chosenCard = chosen && chosen.closest(".rs-plan");
    if (chosenCard) chosenCard.classList.add("is-selected");
  }

  // Roving tabindex: one tab stop per group (the checked tier, else the first).
  function syncTabStops(groups) {
    groups.forEach(function (g) {
      var items = Array.prototype.slice.call(g.querySelectorAll('[role="radio"]'));
      var stop = items.filter(function (r) { return r.getAttribute("aria-checked") === "true"; })[0] || items[0];
      items.forEach(function (r) { r.setAttribute("tabindex", r === stop ? "0" : "-1"); });
    });
  }

  function init(doc) {
    var radios = Array.prototype.slice.call(doc.querySelectorAll('.rs-plan [role="radio"]'));
    var groups = Array.prototype.slice.call(doc.querySelectorAll('.rs-plan [role="radiogroup"]'));
    if (!radios.length) return;
    syncTabStops(groups);
    radios.forEach(function (r) {
      r.addEventListener("click", function () { select(radios, r); syncTabStops(groups); });
      r.addEventListener("keydown", function (e) {
        var keys = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
        if (!(e.key in keys)) return;
        var items = Array.prototype.slice.call(r.closest('[role="radiogroup"]').querySelectorAll('[role="radio"]'));
        var next = items[(items.indexOf(r) + keys[e.key] + items.length) % items.length];
        e.preventDefault();
        select(radios, next);
        syncTabStops(groups);
        next.focus();
      });
    });
  }

  if (typeof module !== "undefined" && module.exports) module.exports = { select: select, syncTabStops: syncTabStops, init: init };
  if (typeof document !== "undefined") init(document);
})();
