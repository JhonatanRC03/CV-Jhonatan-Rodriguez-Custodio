/**
 * Modal genérico y accesible.
 *
 * No sabe nada del contenido que muestra: recibe nodos ya construidos.
 * Gestiona apertura/cierre, bloqueo de scroll, Escape, clic en el fondo
 * y confinamiento del foco (WAI-ARIA "dialog").
 */

import { $, $$, lockScroll } from "../utils.js";

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

export function createModal({ overlay, panel, closeButton, body }) {
  let previouslyFocused = null;

  const isOpen = () => !overlay.hidden;

  /* Mantiene el foco dentro del diálogo mientras está abierto. */
  const trapFocus = (e) => {
    if (e.key !== "Tab" || !isOpen()) return;

    const items = $$(FOCUSABLE, panel).filter((n) => n.offsetParent !== null);
    if (!items.length) return;

    const first = items[0];
    const last = items[items.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const close = () => {
    if (!isOpen()) return;

    overlay.classList.remove("visible");
    lockScroll("modal", false);

    // Espera a que termine la transición antes de retirarlo del árbol.
    setTimeout(() => {
      overlay.hidden = true;
      body.replaceChildren();
      previouslyFocused?.focus();
    }, 260);
  };

  const open = (content) => {
    previouslyFocused = document.activeElement;

    body.replaceChildren(content);
    overlay.hidden = false;

    requestAnimationFrame(() => {
      overlay.classList.add("visible");
      // Con el panel ya en el layout: si no, scrollTop no surte efecto.
      panel.scrollTop = 0;
      // preventScroll evita que el navegador desplace el panel al enfocar.
      closeButton.focus({ preventScroll: true });
    });

    lockScroll("modal", true);
  };

  closeButton.addEventListener("click", close);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
    else trapFocus(e);
  });

  return { open, close, isOpen };
}

/** Instancia el modal declarado en el HTML. */
export function createProjectModalShell() {
  return createModal({
    overlay: $("#project-modal"),
    panel: $(".modal", $("#project-modal")),
    closeButton: $("#modal-close"),
    body: $("#modal-body"),
  });
}
