import { $, el, withLeadEmphasis } from "./utils.js";

/* ── Hero ── */
export function renderHero(profile) {
  $("#hero-summary").textContent = profile.summary;

  const social = $("#hero-social");
  const links = [
    { label: "LinkedIn ↗", href: profile.linkedin, external: true },
    { label: profile.email, href: `mailto:${profile.email}` },
    { label: profile.phone, href: `tel:${profile.phone.replace(/[^\d+]/g, "")}` },
  ];

  links.forEach(({ label, href, external }) => {
    const a = el("a", null, label);
    a.href = href;
    if (external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    const li = el("li");
    li.append(a);
    social.append(li);
  });

  const stats = $("#hero-stats");
  profile.stats.forEach(({ value, label }) => {
    const card = el("div", "stat");
    const number = el("div", "stat-value", value);
    number.dataset.count = value;
    card.append(number, el("div", "stat-label", label));
    stats.append(card);
  });
}

/* ── Sobre mí ── */
export function renderAbout(profile, education, mentoring) {
  const about = $("#about-text");
  about.append(el("p", null, profile.summary), el("p", null, profile.summaryExtended));

  const eduList = $("#education-list");
  education.forEach((item) => {
    const li = el("li");
    li.append(
      el("span", "item-title", item.degree),
      el("span", "item-sub", item.institution),
      el("span", "item-date", item.period)
    );
    eduList.append(li);
  });

  const mentorList = $("#mentoring-list");
  mentoring.forEach((item) => {
    const li = el("li");
    li.append(
      el("span", "item-title", item.title),
      el("span", "item-sub", item.description),
      el("span", "item-date", item.date)
    );
    mentorList.append(li);
  });
}

/* ── Experiencia ── */
export function renderExperience(experience) {
  const timeline = $("#timeline");

  experience.forEach((job) => {
    const item = el("div", `timeline-item${job.current ? " current" : ""}`);

    const meta = el("div", "timeline-meta");
    meta.append(el("span", "timeline-date", job.period));
    if (job.current) meta.append(el("span", "badge-current", "Actual"));

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
export function renderProjects(projects) {
  const grid = $("#projects-grid");
  const filters = $("#project-filters");
  const categories = ["Todos", ...new Set(projects.map((p) => p.category))];

  const paint = (category) => {
    grid.replaceChildren();
    projects
      .filter((p) => category === "Todos" || p.category === category)
      .forEach((project) => {
        const card = el("article", "card");
        const tech = el("ul", "tech-list");
        project.tech.forEach((t) => tech.append(el("li", null, t)));

        card.append(
          el("span", "project-category", project.category),
          el("h3", null, project.title),
          el("p", null, project.description),
          tech
        );
        grid.append(card);
      });
  };

  categories.forEach((category, index) => {
    const btn = el("button", `filter-btn${index === 0 ? " active" : ""}`, category);
    btn.type = "button";
    btn.addEventListener("click", () => {
      filters.querySelector(".active")?.classList.remove("active");
      btn.classList.add("active");
      paint(category);
    });
    filters.append(btn);
  });

  paint("Todos");
}

/* ── Stack ── */
export function renderSkills(skills) {
  const grid = $("#skills-grid");

  skills.forEach((group) => {
    const card = el("article", "card skill-card");
    const tags = el("ul", "tag-list");
    group.items.forEach((item) => tags.append(el("li", "tag", item)));

    card.append(el("h3", null, group.category), tags);
    grid.append(card);
  });
}

/* ── Certificaciones ── */
export function renderCertifications(certifications) {
  const grid = $("#certs-grid");

  certifications.forEach((cert) => {
    const card = el("a", "card cert-card");
    card.href = cert.url;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const header = el("div", "cert-header");
    header.append(el("span", "cert-code", cert.code), el("span", "cert-level", cert.level));

    const footer = el("div", "cert-footer");
    footer.append(el("span", null, cert.period), el("span", "cert-verify", "Verificar ↗"));

    card.append(header, el("p", "cert-name", cert.name), footer);
    grid.append(card);
  });
}

/* ── Contacto directo ── */
export function renderContactLinks(profile) {
  const list = $("#contact-direct");
  const entries = [
    { label: profile.email, href: `mailto:${profile.email}` },
    { label: profile.phone, href: `tel:${profile.phone.replace(/[^\d+]/g, "")}` },
    { label: "LinkedIn", href: profile.linkedin, external: true },
  ];

  entries.forEach(({ label, href, external }) => {
    const a = el("a", null, label);
    a.href = href;
    if (external) {
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    }
    const li = el("li");
    li.append(a);
    list.append(li);
  });
}
