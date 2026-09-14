/**
 * Punto de entrada del modal de proyectos.
 *
 * Une el contenedor genérico (modal.js) con el contenido específico
 * (project-detail.js). El resto de la app solo necesita `openProject`.
 */

import { createProjectModalShell } from "./modal.js";
import { buildProjectDetail } from "./project-detail.js";

let shell = null;

export function initProjectModal() {
  shell = createProjectModalShell();
}

export function openProject(project) {
  shell?.open(buildProjectDetail(project));
}
