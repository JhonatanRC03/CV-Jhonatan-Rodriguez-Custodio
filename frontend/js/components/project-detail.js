/**
 * Contenido del modal de proyecto.
 *
 * Cada sección se declara una vez en SECTIONS y se resuelve por convención:
 * si el JSON del proyecto trae la clave, la sección se pinta; si no, se omite.
 * Añadir un proyecto = añadir un JSON. Añadir un tipo de sección = una entrada aquí.
 */

import { el, withLeadEmphasis } from "../utils.js";
import { buildDiagram } from "./diagram.js";

/* ── Renderizadores por tipo de dato ── */

const renderParagraph = (text) => el("p", "modal-text", text);

function renderFlow(steps) {
  const list = el("ol", "flow-list");

  steps.forEach((text, index) => {
    const item = el("li");
    const body = el("p");
    body.append(withLeadEmphasis(text));
    item.append(el("span", "flow-num", String(index + 1)), body);
    list.append(item);
  });

  return list;
}

function renderComponents(components) {
  const list = el("ul", "component-list");

  components.forEach(({ name, role }) => {
    const item = el("li");
    item.append(el("span", "component-name", name), el("span", "component-role", role));
    list.append(item);
  });

  return list;
}

function renderTech(tech) {
  const list = el("ul", "tech-list");
  tech.forEach((item) => list.append(el("li", null, item)));
  return list;
}

/* ── Declaración de secciones (el orden aquí es el orden visual) ── */

const SECTIONS = [
  { key: "problem", title: "Problema que resuelve", render: renderParagraph },
  { key: "architecture", title: "Arquitectura", render: buildDiagram },
  { key: "flow", title: "Flujo de la solución", render: renderFlow },
  { key: "components", title: "Servicios utilizados", render: renderComponents },
  { key: "tech", title: "Stack", render: renderTech },
];

const hasContent = (value) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value);

function wrapSection(title, content) {
  const section = el("section", "modal-section");
  section.append(el("h4", "modal-section-title", title), content);
  return section;
}

/* ── Cabecera ── */

function buildHeader(project) {
  const fragment = document.createDocumentFragment();
  const meta = el("div", "modal-meta");

  meta.append(el("span", "project-category", project.category));

  if (project.status) {
    const live = project.status.toLowerCase().startsWith("produc");
    meta.append(el("span", `modal-status ${live ? "live" : "wip"}`, project.status));
  }

  if (project.region) meta.append(el("span", "modal-region", project.region));

  const title = el("h3", "modal-title", project.title);
  title.id = "modal-title";

  fragment.append(meta, title, el("p", "modal-lead", project.description));
  return fragment;
}

function buildInsight({ title, text }) {
  const note = el("aside", "modal-insight");
  note.append(el("strong", null, title), el("p", null, text));
  return note;
}

/** Construye el contenido completo del modal para un proyecto. */
export function buildProjectDetail(project) {
  const fragment = document.createDocumentFragment();

  fragment.append(buildHeader(project));

  SECTIONS.filter(({ key }) => hasContent(project[key])).forEach(({ key, title, render }) =>
    fragment.append(wrapSection(title, render(project[key])))
  );

  if (project.insight) fragment.append(buildInsight(project.insight));

  return fragment;
}
