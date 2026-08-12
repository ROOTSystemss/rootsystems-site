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

  // ---------- hero typewriter ----------
  // Types each line in HERO_LINES into [data-typewriter], pauses, deletes,
  // moves to the next line, and loops. The element's original text content
  // (set server-side in the template) is used as the very first line so
  // there's zero flash-of-empty-content before JS runs.
  function initTypewriter() {
    var el = document.querySelector("[data-typewriter]");
    if (!el) return;

    var lines;
    try {
      lines = JSON.parse(el.getAttribute("data-typewriter"));
    } catch (e) {
      return;
    }
    if (!Array.isArray(lines) || lines.length < 2) return;

    if (reduceMotion) return; // leave the server-rendered first line as-is

    var lineIndex = 0;
    var charIndex = lines[0].length; // already "typed" from the SSR text
    var deleting = false;
    var typeSpeed = 55;
    var deleteSpeed = 30;
    var holdTime = 2200;

    function tick() {
      var current = lines[lineIndex];

      if (!deleting) {
        charIndex++;
        if (charIndex > current.length) {
          charIndex = current.length;
          deleting = true;
          window.setTimeout(tick, holdTime);
          return;
        }
      } else {
        charIndex--;
        if (charIndex < 0) {
          charIndex = 0;
          deleting = false;
          lineIndex = (lineIndex + 1) % lines.length;
        }
      }

      el.textContent = lines[lineIndex].slice(0, charIndex);
      window.setTimeout(tick, deleting ? deleteSpeed : typeSpeed);
    }

    window.setTimeout(tick, holdTime);
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

  document.addEventListener("DOMContentLoaded", function () {
    initReveal();
    initTypewriter();
    initCountUp();
  });
})();
