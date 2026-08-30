(function () {
  "use strict";

  /* ---------- Stat count-up ---------- */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function animateStat(el, index) {
    var target = parseFloat(el.dataset.target || "0");
    var suffix = el.dataset.suffix || "";
    var decimals = parseInt(el.dataset.decimals || "0", 10);
    var duration = 1500 + index * 80;
    var startOffset = 480 + index * 90;

    setTimeout(function () {
      var startTime = null;

      function tick(now) {
        if (startTime === null) startTime = now;
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var value = target * easeOutCubic(progress);
        el.textContent = value.toFixed(decimals) + suffix;

        if (progress < 1) {
          requestAnimationFrame(tick);
        } else {
          el.textContent = target.toFixed(decimals) + suffix;
        }
      }

      requestAnimationFrame(tick);
    }, startOffset);
  }

  function initStatCounters() {
    var statValues = document.querySelectorAll(".stat-value");
    if (!statValues.length) return;

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var els = Array.prototype.slice.call(statValues);
          els.forEach(function (el, index) {
            animateStat(el, index);
          });
          obs.disconnect();
        });
      },
      { threshold: 0.25 },
    );

    observer.observe(document.querySelector(".stats"));
  }

  /* ---------- Mobile menu ---------- */
  function initMobileMenu() {
    var burger = document.querySelector(".burger");
    var overlay = document.getElementById("mobile-overlay");
    if (!burger || !overlay) return;

    var links = overlay.querySelectorAll(".mobile-link, .mobile-sign-in");

    function openMenu() {
      overlay.hidden = false;
      overlay.classList.add("is-open");
      burger.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      burger.setAttribute("aria-label", "Close menu");
      document.body.classList.add("menu-open");
    }

    function closeMenu() {
      overlay.hidden = true;
      overlay.classList.remove("is-open");
      burger.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
      burger.setAttribute("aria-label", "Open menu");
      document.body.classList.remove("menu-open");
    }

    function toggleMenu() {
      if (overlay.hidden) {
        openMenu();
      } else {
        closeMenu();
      }
    }

    burger.addEventListener("click", toggleMenu);

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !overlay.hidden) closeMenu();
    });

    links.forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 720 && !overlay.hidden) closeMenu();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initStatCounters();
    initMobileMenu();
  });
})();
