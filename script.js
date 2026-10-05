// Sticky nav: the header icons travel into the bar as the page scrolls.
const nav = document.querySelector(".nav");
const headerIcons = [...document.querySelectorAll(".icons-header a")];
const navIcons = [...document.querySelectorAll(".icons-nav a")];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
const TRAVEL = 180; // px of scroll over which the icons move
let navRects = [];

function measureNav() {
  navIcons.forEach((a) => (a.style.transform = "none"));
  navRects = navIcons.map((a) => a.getBoundingClientRect());
  update();
}

function update() {
  const rowTop = headerIcons[0].getBoundingClientRect().top;
  const navTop = navRects[0].top;
  let p = Math.min(1, Math.max(0, (navTop + TRAVEL - rowTop) / TRAVEL));
  if (reduceMotion.matches) p = p > 0.5 ? 1 : 0;

  nav.style.setProperty("--p", p);
  nav.toggleAttribute("data-moving", p > 0);
  nav.toggleAttribute("data-shown", p > 0.5);

  const k = reduceMotion.matches ? 0 : 1 - p;
  navIcons.forEach((a, i) => {
    const from = headerIcons[i].getBoundingClientRect();
    const to = navRects[i];
    const scale = 1 + (from.width / to.width - 1) * k;
    const dx = (from.left + from.width / 2 - (to.left + to.width / 2)) * k;
    const dy = (from.top + from.height / 2 - (to.top + to.height / 2)) * k;
    a.style.transform = k ? `translate(${dx}px, ${dy}px) scale(${scale})` : "";
  });
}

let ticking = false;
addEventListener("scroll", () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
}, { passive: true });
addEventListener("resize", measureNav);
document.fonts.ready.then(measureNav);
measureNav();

// Featured band: hover, focus or tap a panel to bring it forward; panel 1 is the default.
const band = document.querySelector(".band");
const panels = [...band.querySelectorAll(".panel")];
let pointerType = "mouse";

function activate(i) {
  band.dataset.active = i + 1;
  panels.forEach((p, k) => p.classList.toggle("is-active", k === i));
}

panels.forEach((panel, i) => {
  panel.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") activate(i); });
  // On touch, the first tap on a collapsed panel opens it; the second follows the link.
  panel.querySelector(".panel-link").addEventListener("click", (e) => {
    if (pointerType !== "mouse" && !panel.classList.contains("is-active")) {
      e.preventDefault();
      activate(i);
    }
  });
});
band.addEventListener("pointerdown", (e) => (pointerType = e.pointerType));
band.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") activate(0); });
band.addEventListener("focusin", (e) => {
  if (e.target.matches(":focus-visible")) activate(panels.indexOf(e.target.closest(".panel")));
});
band.addEventListener("focusout", (e) => { if (!band.contains(e.relatedTarget)) activate(0); });

