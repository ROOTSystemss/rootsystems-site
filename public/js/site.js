// RootSystems site — small, dependency-free progressive-enhancement layer.
// Everything here is purely additive: every element it touches is fully
// present and readable in the HTML/CSS with no JS at all, and every effect
// respects prefers-reduced-motion by skipping straight to the end state.
(function () {
  "use strict";

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- scroll reveal ----------
  // Adds .is-visible to each .reveal element the first time it enters the
  // viewport. If IntersectionObserver isn't available, or the user prefers
  // reduced motion, everything is just marked visible immediately.
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;

    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------- count-up stats ----------
  // Animates each [data-count-to] number from 0 to its target once it
  // scrolls into view. Falls back to just showing the final number if
  // IntersectionObserver is missing or motion is reduced.
  function initCountUp() {
    var els = document.querySelectorAll("[data-count-to]");
    if (!els.length) return;

    function setFinal(el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-count-suffix") || "";
      el.textContent = target + suffix;
    }

    if (reduceMotion || !("IntersectionObserver" in window)) {
      els.forEach(setFinal);
      return;
    }

    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count-to"));
      var suffix = el.getAttribute("data-count-suffix") || "";
      var duration = 1100;
      var start = null;

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
        var value = Math.round(eased * target);
        el.textContent = value + suffix;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      }

      window.requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    els.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ---------- mobile nav toggle ----------
  // Below the nav's collapse breakpoint (see style.css), the nav is a
  // hidden dropdown panel behind this button instead of an inline row.
  // Fully inert without JS: the toggle just won't do anything, same as
  // any other progressive-enhancement control here.
  function initMobileNav() {
    var toggle = document.querySelector(".site-nav__toggle");
    var nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;

    function closeMenu() {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Open menu");
      nav.classList.remove("is-open");
    }

    function openMenu() {
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Close menu");
      nav.classList.add("is-open");
    }

    toggle.addEventListener("click", function () {
      if (nav.classList.contains("is-open")) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || toggle.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
    });
  }

  // ---------- dark mode toggle ----------
  // Persists to localStorage under "rs-theme" - the same key head.ejs's
  // inline pre-paint script reads, so a saved choice survives navigation
  // and reload without a flash of the other theme.
  function initThemeToggle() {
    var toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    function systemPrefersDark() {
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    }

    function currentTheme() {
      var attr = document.documentElement.getAttribute("data-theme");
      if (attr === "dark" || attr === "light") return attr;
      return systemPrefersDark() ? "dark" : "light";
    }

    function applyLabel() {
      var isDark = currentTheme() === "dark";
      toggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
    }

    applyLabel();

    toggle.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("rs-theme", next);
      } catch (e) {}
      applyLabel();
    });
  }

  // ---------- staggered card reveal ----------
  // Cards inside a shared container (product floors, pricing lists) fade/
  // slide in one after another rather than all at once, using each card's
  // index within its own parent to compute the delay. Skipped entirely
  // under reduced motion (handled already by initReveal/CSS above).
  function initStagger() {
    document.querySelectorAll(".product-grid--simple, .pricing-flow-list").forEach(function (group) {
      var cards = group.querySelectorAll(".reveal");
      cards.forEach(function (card, index) {
        if (!card.style.transitionDelay) {
          card.style.transitionDelay = index * 90 + "ms";
        }
      });
    });
  }

  // ---------- pricing: progressive disclosure ----------
  // Nothing below the three choice cards is visible until one is picked -
  // selecting a card shows only its matching panel and swaps the others
  // out, rather than the page dumping every price on load.
  function initPricingFlow() {
    var choices = document.querySelectorAll(".choice-card");
    var panels = document.querySelectorAll(".pricing-flow-panel");
    if (!choices.length || !panels.length) return;

    choices.forEach(function (choice) {
      choice.addEventListener("click", function () {
        var target = choice.getAttribute("data-choice");

        choices.forEach(function (c) {
          c.setAttribute("aria-pressed", c === choice ? "true" : "false");
        });

        panels.forEach(function (panel) {
          var isMatch = panel.getAttribute("data-panel") === target;
          panel.classList.toggle("is-active", isMatch);
          if (isMatch) {
            panel.querySelectorAll(".reveal").forEach(function (el) {
              el.classList.add("is-visible");
            });
            panel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
          }
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initCountUp();
    initMobileNav();
    initThemeToggle();
    initStagger();
    initPricingFlow();
  });
})();
