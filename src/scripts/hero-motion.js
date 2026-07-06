const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

function initHeroMotion() {
  const hero = document.querySelector(".hero");

  // Проверяем, есть ли элемент и не отключена ли анимация
  if (!hero || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }


  // ----------------------

  const root = document.documentElement;
  let targetProgress = 0;
  let currentProgress = 0;
  let rafId = 0;

  root.classList.add("has-hero-motion");

  const updateTarget = () => {
    const rect = hero.getBoundingClientRect();
    const distance = Math.max(rect.height - window.innerHeight * 0.35, 1);
    targetProgress = clamp(-rect.top / distance, 0, 1);

    if (!rafId) {
      rafId = window.requestAnimationFrame(render);
    }
  };

  const render = () => {
    currentProgress += (targetProgress - currentProgress) * 0.12;

    if (Math.abs(targetProgress - currentProgress) < 0.001) {
      currentProgress = targetProgress;
    }
    const style = hero.style;
    style.setProperty("--hero-bg-shift-y", `${(currentProgress * -60).toFixed(2)}px`);
    style.setProperty("--hero-glow-shift-y", `${(currentProgress * -35).toFixed(2)}px`);
    style.setProperty("--hero-overlay-shift-y", `${(currentProgress * -20).toFixed(2)}px`);
    style.setProperty("--hero-content-shift-y", `${(currentProgress * -30).toFixed(2)}px`);
    style.setProperty("--hero-copy-shift-y", `${(currentProgress * -18).toFixed(2)}px`);
    style.setProperty("--hero-spotlight-shift-y", `${(currentProgress * -40).toFixed(2)}px`);
    style.setProperty("--hero-overlay-opacity", (1 - currentProgress * 0.045).toFixed(3));
    style.setProperty("--hero-spotlight-opacity", (1 - currentProgress * 0.035).toFixed(3));

    if (Math.abs(targetProgress - currentProgress) >= 0.001) {
      rafId = window.requestAnimationFrame(render);
      return;
    }

    rafId = 0;
  };

  // ↓↓↓ НОВОЕ: батчинг scroll-событий через rAF ↓↓↓
  let scrollScheduled = false;

  const onScroll = () => {
    if (scrollScheduled) return;
    scrollScheduled = true;
    requestAnimationFrame(() => {
      updateTarget();
      scrollScheduled = false;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  // ↑↑↑ вместо старой строки: window.addEventListener("scroll", updateTarget, { passive: true }); ↑↑↑

  let resizeTimeout;

  window.addEventListener(
    "resize",
    () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(updateTarget, 120);
    },
    { passive: true }
  );

  updateTarget();
}

// Запускаем скрипт когда DOM готов
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initHeroMotion, { once: true });
} else {
  initHeroMotion();
}