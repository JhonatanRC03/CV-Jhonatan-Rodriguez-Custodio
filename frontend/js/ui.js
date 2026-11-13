import { getLang, onLangChange, setLang, t } from "./i18n.js";
import { $, $$, lockScroll } from "./utils.js";

/* ── Header con fondo al hacer scroll + barra de progreso ── */
export function initScrollEffects() {
  const header = $("#header");
  const progress = $("#scroll-progress");
  let ticking = false;

  const update = () => {
    header.classList.toggle("scrolled", window.scrollY > 40);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (window.scrollY / max) * 100 : 0}%`;
    ticking = false;
  };

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) requestAnimationFrame(update);
      ticking = true;
    },
    { passive: true }
  );
  update();
}

/* ── Menú móvil ── */
export function initNav() {
  const toggle = $("#nav-toggle");
  const links = $("#nav-links");
  const backdrop = $("#nav-backdrop");
  const mobile = window.matchMedia("(max-width: 860px)");

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  const syncLabel = () => toggle.setAttribute("aria-label", t(isOpen() ? "nav.close" : "nav.open"));

  // En móvil el drawer cerrado no debe ser alcanzable con Tab ni lectores de pantalla.
  const syncInert = () => {
    const hidden = mobile.matches && !isOpen();
    links.toggleAttribute("inert", hidden);
  };

  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    syncLabel();
    links.classList.toggle("open", open);
    document.body.classList.toggle("nav-open", open);
    lockScroll("nav", open);
    syncInert();

    if (open) {
      backdrop.hidden = false;
      requestAnimationFrame(() => backdrop.classList.add("visible"));
      links.querySelector("a")?.focus({ preventScroll: true });
    } else {
      backdrop.classList.remove("visible");
      setTimeout(() => {
        if (!isOpen()) backdrop.hidden = true;
      }, 350);
    }
  };

  toggle.addEventListener("click", () => setOpen(!isOpen()));
  backdrop.addEventListener("click", () => setOpen(false));

  links.addEventListener("click", (e) => {
    if (e.target.closest("a")) setOpen(false);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) {
      setOpen(false);
      toggle.focus();
    }
  });

  // Al pasar a escritorio el drawer deja de existir: hay que liberar el scroll.
  mobile.addEventListener("change", () => {
    if (!mobile.matches && isOpen()) setOpen(false);
    syncInert();
  });

  syncInert();
  onLangChange(syncLabel);
}

/* ── Selector de idioma ── */
export function initLangToggle() {
  const button = $("#lang-toggle");

  const paint = () => {
    $$("[data-lang]", button).forEach((node) =>
      node.classList.toggle("active", node.dataset.lang === getLang())
    );
  };

  button.addEventListener("click", () => setLang(getLang() === "es" ? "en" : "es"));
  onLangChange(paint);
  paint();
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
        links.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("active", active);
          if (active) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
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
    { threshold: 0.08 }
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

  $$("[data-count]:not([data-counted])").forEach((node) => {
    node.dataset.counted = "";
    observer.observe(node);
  });
}

/* ── Efecto máquina de escribir en el hero ── */
export function initTyping() {
  const target = $("#typed-role");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let roleIndex = 0;
  let charIndex = 0;
  let deleting = false;
  let timer;

  const tick = () => {
    const roles = t("hero.roles");
    const role = roles[roleIndex % roles.length];
    charIndex += deleting ? -1 : 1;
    target.textContent = role.slice(0, charIndex);

    let delay = deleting ? 45 : 85;

    if (!deleting && charIndex === role.length) {
      deleting = true;
      delay = 2200;
    } else if (deleting && charIndex === 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    timer = setTimeout(tick, delay);
  };

  const start = () => {
    clearTimeout(timer);
    roleIndex = 0;
    charIndex = 0;
    deleting = false;
    if (reduced) target.textContent = t("hero.roles")[0];
    else tick();
  };

  onLangChange(start);
  start();
}

export function initFooter() {
  $("#footer-year").textContent = new Date().getFullYear();
}
