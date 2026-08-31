import { TYPED_ROLES } from "./config.js";
import { $, $$ } from "./utils.js";

/* ── Header con fondo al hacer scroll + barra de progreso ── */
export function initScrollEffects() {
  const header = $("#header");
  const progress = $("#scroll-progress");

  const onScroll = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
    const max = document.body.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

/* ── Menú móvil ── */
export function initNav() {
  const toggle = $("#nav-toggle");
  const links = $("#nav-links");

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    links.classList.remove("open");
  };

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    links.classList.toggle("open", !open);
  });

  links.addEventListener("click", (e) => {
    if (e.target.tagName === "A") close();
  });
}

/* ── Resalta el enlace de la sección visible ── */
export function initScrollSpy() {
  const links = $$(".nav-link");
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) =>
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`)
        );
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );

  sections.forEach((section) => observer.observe(section));
}

/* ── Aparición progresiva de secciones ── */
export function initReveal() {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  $$(".reveal").forEach((node) => observer.observe(node));
}

/* ── Conteo ascendente de las estadísticas del hero ── */
const COUNTER_DURATION = 1600;

function countUp(node) {
  // Separa el número de adornos como "+" o "3+" para animar solo la cifra.
  const match = node.dataset.count.match(/^(\D*)(\d+)(.*)$/);

  if (!match) return;

  const [, prefix, digits, suffix] = match;
  const target = Number(digits);
  let start;

  const step = (now) => {
    start ??= now;
    const progress = Math.min((now - start) / COUNTER_DURATION, 1);
    const eased = 1 - (1 - progress) ** 3;

    node.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;

    if (progress < 1) requestAnimationFrame(step);
  };

  node.textContent = `${prefix}0${suffix}`;
  requestAnimationFrame(step);
}

export function initCounters() {
  const nodes = $$("[data-count]");

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        countUp(entry.target);
        obs.unobserve(entry.target);
      });
    },
    { threshold: 0.6 }
  );

  nodes.forEach((node) => observer.observe(node));
}

/* ── Efecto máquina de escribir en el hero ── */
export function initTyping() {
  const target = $("#typed-role");
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;

  const tick = () => {
    const role = TYPED_ROLES[roleIndex];
    charIndex += deleting ? -1 : 1;
    target.textContent = role.slice(0, charIndex);

    let delay = deleting ? 45 : 85;

    if (!deleting && charIndex === role.length) {
      deleting = true;
      delay = 2200;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % TYPED_ROLES.length;
      delay = 400;
    }

    setTimeout(tick, delay);
  };

  tick();
}
