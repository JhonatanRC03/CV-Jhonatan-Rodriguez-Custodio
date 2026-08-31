import { getCV } from "./api.js";
import { initChat } from "./chat.js";
import {
  renderAbout,
  renderCertifications,
  renderContactLinks,
  renderExperience,
  renderHero,
  renderProjects,
  renderSkills,
} from "./render.js";
import {
  initCounters,
  initNav,
  initReveal,
  initScrollEffects,
  initScrollSpy,
  initTyping,
} from "./ui.js";

async function init() {
  initScrollEffects();
  initNav();
  initTyping();
  initChat();

  try {
    const cv = await getCV();

    renderHero(cv.profile);
    renderAbout(cv.profile, cv.education, cv.mentoring);
    renderExperience(cv.experience);
    renderProjects(cv.projects);
    renderSkills(cv.skills);
    renderCertifications(cv.certifications);
    renderContactLinks(cv.profile);
  } catch (error) {
    console.error("No se pudo cargar el CV desde la API:", error);
  }

  initReveal();
  initScrollSpy();
  initCounters();
}

init();
