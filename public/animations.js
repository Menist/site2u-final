/*!
 * site2u.by — Animations v3.0
 * Без зависимостей от GSAP. Entrance-анимации переведены на CSS (@keyframes).
 * JS отвечает только за: section reveals (IntersectionObserver) и magnetic buttons.
 *
 * Подключить в Layout.astro:
 *   <script defer src="/animations.js"></script>
 * (строку с gsap.min.js из Layout.astro нужно удалить — она больше не нужна)
 */

(function () {
  "use strict";

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isMobile = () => window.innerWidth <= 768;

  /* ═══════════════════════════════════════════════════════════════════════════
     UTILS
  ═══════════════════════════════════════════════════════════════════════════ */

  function onVisible(elements, callback, once = true) {
    const targets = Array.isArray(elements) ? elements : [elements];
    if (!targets.length) return;

    const io = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          callback(entry.target);
          if (once) io.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -300px 0px" }
    );

    targets.forEach(el => {
      const rect = el.getBoundingClientRect();
      const alreadyVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (alreadyVisible) {
        callback(el);
        if (once) return;
      }
      io.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     1. SECTION REVEALS (унифицированная функция)
  ═══════════════════════════════════════════════════════════════════════════ */

  function initSectionReveal(selector, className = "is-visible") {
    const section = document.querySelector(selector);
    if (!section) return;
    onVisible(section, () => section.classList.add(className));
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     2. MAGNETIC BUTTONS (vanilla JS, без GSAP)
  ═══════════════════════════════════════════════════════════════════════════ */

  function initMagneticButtons() {
    if (isMobile() || reduced || isTouch) return;

    document.querySelectorAll(".hero__cta, .cta__btn").forEach(btn => {
      // Как только entrance-анимация (heroCtaPop и т.п.) завершилась —
      // освобождаем transform от animation-fill-mode: both,
      // иначе CSS-анимация будет перебивать inline transform, который выставляет JS ниже.
      btn.addEventListener(
        "animationend",
        () => {
          btn.style.animation = "none";
        },
        { once: true }
      );

      btn.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";

      btn.addEventListener("mousemove", e => {
        const r = btn.getBoundingClientRect();
        const dX = (e.clientX - (r.left + r.width / 2)) * 0.38;
        const dY = (e.clientY - (r.top + r.height / 2)) * 0.38;
        btn.style.transform = `translate(${dX}px, ${dY}px)`;
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.transition = "transform 0.75s cubic-bezier(0.34, 1.2, 0.4, 1)";
        btn.style.transform = "translate(0, 0)";
      });

      btn.addEventListener("mouseenter", () => {
        btn.style.transition = "transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)";
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════════════
     INIT
  ═══════════════════════════════════════════════════════════════════════════ */

  function init() {
    document.documentElement.classList.remove("js-loading");
    document.body.classList.add("js-ready");

    // Секции с is-visible
    const sections = [
      ".services",
      ".about-teaser",
      ".advantages",
      ".process",
      ".configurator",
      ".cta"
    ];

    sections.forEach(selector => initSectionReveal(selector));

    initMagneticButtons();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();