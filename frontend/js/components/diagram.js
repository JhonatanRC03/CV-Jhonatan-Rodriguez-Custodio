/**
 * Renderiza el diagrama de arquitectura desde el JSON del proyecto.
 *
 * Espera `architecture.layers[].nodes[]`, donde cada nodo declara un `kind`
 * que determina su color. Añadir un servicio nuevo es añadirlo al JSON.
 */

import { el } from "../utils.js";

const KIND_LABELS = {
  user: "Usuario",
  compute: "Cómputo",
  ai: "IA / Cognitivo",
  data: "Datos",
  security: "Seguridad",
  observability: "Observabilidad",
  integration: "Integración",
};

function buildNode({ name, detail, kind = "compute" }) {
  const node = el("div", "diagram-node");
  node.dataset.kind = kind;
  node.append(el("span", "diagram-node-name", name));
  if (detail) node.append(el("span", "diagram-node-detail", detail));
  return node;
}

function buildLayer({ name, nodes, transversal }) {
  const layer = el("div", `diagram-layer${transversal ? " transversal" : ""}`);
  const inner = el("div", "diagram-layer-inner");
  const grid = el("div", "diagram-nodes");

  nodes.forEach((node) => grid.append(buildNode(node)));
  inner.append(el("span", "diagram-layer-name", name), grid);
  layer.append(inner);

  return layer;
}

/** Solo lista los tipos presentes en este diagrama. */
function buildLegend(layers) {
  const kinds = new Set(layers.flatMap((l) => l.nodes.map((n) => n.kind || "compute")));
  const legend = el("div", "diagram-legend");

  kinds.forEach((kind) => {
    const item = el("div", "legend-item");
    const dot = el("span", "legend-dot");
    dot.dataset.kind = kind;
    item.append(dot, el("span", null, KIND_LABELS[kind] || kind));
    legend.append(item);
  });

  return legend;
}

export function buildDiagram({ layers, caption }) {
  const wrap = el("div");
  const diagram = el("div", "diagram");

  layers.forEach((layer) => diagram.append(buildLayer(layer)));
  diagram.append(buildLegend(layers));

  wrap.append(diagram);
  if (caption) wrap.append(el("p", "diagram-caption", caption));

  return wrap;
}
