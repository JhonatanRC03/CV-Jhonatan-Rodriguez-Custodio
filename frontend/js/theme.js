/**
 * Tema claro / oscuro.
 *
 * El tema inicial se fija en un script inline del <head> (antes de pintar) para
 * evitar el destello del tema equivocado. Aquí solo se gestiona el botón.
 * Sin preferencia guardada se usa el tema oscuro, sea cual sea el del sistema.
 */

import { onLangChange, t } from "./i18n.js";
import { $ } from "./utils.js";

const STORAGE_KEY = "theme";
const THEME_COLORS = { dark: "#070b14", light: "#f6f8fc" };

export const getTheme = () => document.documentElement.dataset.theme || "dark";

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);

  const button = $("#theme-toggle");
  if (button) {
    const label = t(theme === "dark" ? "theme.toLight" : "theme.toDark");
    button.setAttribute("aria-label", label);
    button.title = label;
    button.setAttribute("aria-pressed", String(theme === "light"));
  }
}

export function initTheme() {
  apply(getTheme());

  $("#theme-toggle")?.addEventListener("click", () => {
    const next = getTheme() === "dark" ? "light" : "dark";
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* sin persistencia: el cambio aplica solo a esta visita */
    }
    apply(next);
  });

  onLangChange(() => apply(getTheme()));
}
