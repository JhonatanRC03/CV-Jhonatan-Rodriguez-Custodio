/**
 * Pinta las secciones a partir del CV que devuelve la API.
 *
 * Cada función vacía su contenedor antes de pintar: al cambiar de idioma se
 * vuelven a llamar con el CV traducido sin duplicar nodos.
 */

import { icon } from "./icons.js";
import { brandLogos, categoryIcon, glyphSvg, maskUrl, techIcon } from "./tech-icons.js";
import { t } from "./i18n.js";
import { openProject } from "./components/project-modal.js";
import { $, el, isLive, showToast, withLeadEmphasis } from "./utils.js";

/** Canales de contacto derivados del perfil. */
function contactChannels(profile) {
  return [
    {
      key: "mail",
      label: "Email",
      value: profile.email,
      href: `mailto:${profile.email}`,
      hint: t("contact.mailHint"),
      copy: profile.email,
    },
    {
      key: "whatsapp",
      label: "WhatsApp",
      value: profile.phone,
      href: `https://wa.me/${profile.whatsapp}`,
      hint: t("contact.whatsappHint"),
      external: true,
    },
    {
      key: "linkedin",
      label: "LinkedIn",
      value: "/in/jrc03",
      href: profile.linkedin,
      hint: t("contact.linkedinHint"),
      external: true,
    },
    {
      key: "github",
      label: "GitHub",
      value: "@JhonatanRC03",
      href: profile.github,
      hint: t("contact.githubHint"),
      external: true,
    },
  ];
}

function openInNewTab(a) {
  a.target = "_blank";
  a.rel = "noopener noreferrer";
}

/* ── Hero ── */
export function renderHero(profile) {
  $("#hero-summary").textContent = profile.summary;

  const social = $("#hero-social");
  social.replaceChildren();
  contactChannels(profile).forEach(({ key, label, href, external }) => {
    const a = el("a");
    a.href = href;
    a.title = label;
    a.setAttribute("aria-label", label);
    if (external) openInNewTab(a);
    a.append(icon(key, 20));

    const li = el("li");
    li.append(a);
    social.append(li);
  });

  const stats = $("#hero-stats");
  stats.replaceChildren();
  profile.stats.forEach(({ value, label, icon: iconName }, i) => {
    const card = el("div", "stat");
    card.style.setProperty("--i", i);

    const badge = el("span", "stat-icon");
    badge.append(glyphSvg(iconName || "sparkles", 20));

    const number = el("div", "stat-value", value);
    number.dataset.count = value;

    card.append(badge, number, el("div", "stat-label", label));
    stats.append(card);
  });
}

/* ── Sobre mí ── */
function renderTimelineList(target, items, mapper) {
  target.replaceChildren();
  items.forEach((item) => {
    const [title, sub, date] = mapper(item);
    const li = el("li");
    li.append(el("span", "item-title", title), el("span", "item-sub", sub), el("span", "item-date", date));
    target.append(li);
  });
}

export function renderAbout(profile, education, mentoring) {
  $("#about-text").replaceChildren(
    el("p", null, profile.summary),
    el("p", null, profile.summaryExtended)
  );

  const focus = $("#focus-grid");
  focus.replaceChildren();
  t("about.focusItems").forEach(([title, text]) => {
    const li = el("li", "focus-item");
    li.append(el("strong", null, title), el("span", null, text));
    focus.append(li);
  });

  renderTimelineList($("#education-list"), education, (e) => [e.degree, e.institution, e.period]);
  renderTimelineList($("#mentoring-list"), mentoring, (m) => [m.title, m.description, m.date]);
}

/* ── Experiencia ── */
export function renderExperience(experience) {
  const timeline = $("#timeline");
  timeline.replaceChildren();

  experience.forEach((job) => {
    const item = el("div", `timeline-item${job.current ? " current" : ""}`);

    const meta = el("div", "timeline-meta");
    meta.append(el("span", "timeline-date", job.period));
    if (job.current) meta.append(el("span", "badge-current", t("experience.current")));

    const list = el("ul", "bullet-list");
    job.highlights.forEach((text) => {
      const li = el("li");
      li.append(withLeadEmphasis(text));
      list.append(li);
    });

    item.append(
      meta,
      el("h3", null, job.role),
      el("p", "timeline-company", `${job.company} · ${job.location}`),
      list
    );
    timeline.append(item);
  });
}

/* ── Proyectos ── */
function buildProjectCard(project) {
  const card = el("article", "card project-card");
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `${t("projects.detailOf")} ${project.title}`);

  const head = el("div", "project-head");
  head.append(el("span", "project-category", project.category));
  if (project.status) {
    head.append(el("span", `modal-status ${isLive(project.status) ? "live" : "wip"}`, project.status));
  }

  // El resto del stack se muestra en el modal.
  const tech = el("ul", "tech-list");
  project.tech.slice(0, 4).forEach((item) => tech.append(el("li", null, item)));
  if (project.tech.length > 4) {
    tech.append(el("li", "tech-more", `+${project.tech.length - 4}`));
  }

  const cue = el("span", "project-cue");
  cue.append(el("span", null, t("projects.cue")), el("span", "cue-arrow", "→"));

  card.append(head, el("h3", null, project.title), el("p", null, project.description), tech, cue);

  const open = () => openProject(project);
  card.addEventListener("click", open);
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  return card;
}

export function renderProjects(projects) {
  const grid = $("#projects-grid");
  const filters = $("#project-filters");
  const all = t("projects.all");
  const counts = projects.reduce((acc, p) => ({ ...acc, [p.category]: (acc[p.category] || 0) + 1 }), {});
  const categories = [all, ...Object.keys(counts)];

  const paint = (category) => {
    grid.replaceChildren(
      ...projects.filter((p) => category === all || p.category === category).map(buildProjectCard)
    );
  };

  filters.replaceChildren();
  categories.forEach((category, index) => {
    const count = category === all ? projects.length : counts[category];
    const btn = el("button", `filter-btn${index === 0 ? " active" : ""}`);
    btn.type = "button";
    btn.setAttribute("aria-pressed", String(index === 0));
    btn.append(el("span", null, category), el("span", "filter-count", String(count)));
    btn.addEventListener("click", () => {
      filters.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.toggle("active", b === btn);
        b.setAttribute("aria-pressed", String(b === btn));
      });
      paint(category);
    });
    filters.append(btn);
  });

  paint(all);
}

/* ── Stack ── */
function buildMarquee(skills) {
  const marquee = $("#tech-marquee");
  const logos = brandLogos(skills);
  const track = el("div", "marquee-track");

  // La lista se duplica para que el desplazamiento en bucle no tenga corte.
  [0, 1].forEach(() => {
    const group = el("ul", "marquee-group");
    logos.forEach(({ name, src, mono }) => {
      const item = el("li", `marquee-item${mono ? " mono" : ""}`);
      if (mono) {
        const ico = el("span", "tech-ico mono");
        ico.style.setProperty("--src", maskUrl(src));
        item.append(ico);
      } else {
        const img = el("img");
        img.src = src;
        img.alt = "";
        img.loading = "lazy";
        img.width = 28;
        img.height = 28;
        item.append(img);
      }
      item.append(el("span", null, name.split(" (")[0]));
      group.append(item);
    });
    track.append(group);
  });

  marquee.replaceChildren(track);
}

export function renderSkills(skills) {
  buildMarquee(skills);

  const grid = $("#skills-grid");
  grid.replaceChildren();

  skills.forEach((group, groupIndex) => {
    const card = el("article", "card skill-card");
    card.style.setProperty("--card-i", groupIndex);

    const head = el("div", "skill-head");
    const badge = el("span", "skill-icon");
    badge.append(categoryIcon(group.icon));
    const titles = el("div", "skill-titles");
    titles.append(el("h3", null, group.category), el("span", "skill-count", t("skills.count", group.items.length)));
    head.append(badge, titles);

    const tags = el("ul", "tag-list");
    group.items.forEach((item, i) => {
      const { node, brand } = techIcon(item);
      const tag = el("li", "tag");
      tag.style.setProperty("--i", i);
      if (brand) tag.style.setProperty("--brand", brand);
      tag.append(node, el("span", null, item));
      tags.append(tag);
    });

    card.append(head, tags);
    grid.append(card);
  });
}

/* ── Certificaciones ── */
export function renderCertifications(certifications) {
  const grid = $("#certs-grid");
  grid.replaceChildren();

  certifications.forEach((cert) => {
    const card = el("a", "card cert-card");
    card.href = cert.url;
    openInNewTab(card);
    card.dataset.level = cert.level.toLowerCase();

    const header = el("div", "cert-header");
    header.append(el("span", "cert-code", cert.code), el("span", "cert-level", cert.level));

    const footer = el("div", "cert-footer");
    footer.append(el("span", null, cert.period), el("span", "cert-verify", `${t("certs.verify")} ↗`));

    card.append(header, el("p", "cert-name", cert.name), footer);
    grid.append(card);
  });
}

/* ── Contacto ── */
export function renderContactLinks(profile) {
  const grid = $("#contact-grid");
  grid.replaceChildren();

  contactChannels(profile).forEach(({ key, label, value, href, hint, external, copy }) => {
    const wrap = el("div", `contact-item contact-${key}`);
    const card = el("a", "card contact-card");
    card.href = href;
    if (external) openInNewTab(card);

    const badge = el("span", "contact-icon");
    badge.append(icon(key, 24));

    const body = el("span", "contact-body");
    body.append(el("h3", null, label), el("span", "contact-value", value), el("span", "contact-hint", hint));

    card.append(badge, body);
    wrap.append(card);

    // Muchos visitantes no tienen cliente de correo configurado: copiar es más útil.
    if (copy && navigator.clipboard) {
      const btn = el("button", "contact-copy");
      btn.type = "button";
      btn.title = t("contact.copy");
      btn.setAttribute("aria-label", t("contact.copy"));
      btn.append(icon("copy", 16));
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(copy);
          showToast(t("contact.copied"));
        } catch {
          /* el portapapeles puede estar bloqueado: el enlace mailto sigue disponible */
        }
      });
      wrap.append(btn);
    }

    grid.append(wrap);
  });
}

/** Pinta el CV completo. */
export function renderAll(cv) {
  renderHero(cv.profile);
  renderAbout(cv.profile, cv.education, cv.mentoring);
  renderExperience(cv.experience);
  renderProjects(cv.projects);
  renderSkills(cv.skills);
  renderCertifications(cv.certifications);
  renderContactLinks(cv.profile);
}
