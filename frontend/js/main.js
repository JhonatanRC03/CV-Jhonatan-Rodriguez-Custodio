import { getCV } from "./api.js";
import { initChat, openChat } from "./chat.js";
import { initProjectModal } from "./components/project-modal.js";
import { applyStatic, getLang, onLangChange, t } from "./i18n.js";
import { renderAll } from "./render.js";
import { initTheme } from "./theme.js";
import {
  initCounters,
  initFooter,
  initLangToggle,
  initNav,
  initReveal,
  initScrollEffects,
  initScrollSpy,
  initTyping,
} from "./ui.js";
import { $, showToast } from "./utils.js";

/** Cachea el CV por idioma: volver a un idioma ya visto es instantáneo. */
const cvCache = new Map();

async function loadCV(lang) {
  if (!cvCache.has(lang)) cvCache.set(lang, getCV(lang));
  try {
    return await cvCache.get(lang);
  } catch (error) {
    cvCache.delete(lang);
    throw error;
  }
}

async function paint(lang) {
  document.body.classList.add("is-loading");
  try {
    const cv = await loadCV(lang);
    // El usuario pudo cambiar de idioma otra vez mientras llegaba la respuesta.
    if (lang !== getLang()) return;
    renderAll(cv);
    initCounters();
  } catch (error) {
    console.error("No se pudo cargar el CV desde la API:", error);
    showToast(t("error.load"));
  } finally {
    document.body.classList.remove("is-loading");
  }
}

async function init() {
  applyStatic();
  initTheme();
  initScrollEffects();
  initNav();
  initLangToggle();
  initTyping();
  initFooter();
  initProjectModal();
  initChat();

  $("#hero-ask").addEventListener("click", () => openChat());

  await paint(getLang());

  initReveal();
  initScrollSpy();

  onLangChange(paint);
}

init();
