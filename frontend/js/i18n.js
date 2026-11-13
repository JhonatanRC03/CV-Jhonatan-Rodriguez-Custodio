/**
 * Textos de la interfaz en español e inglés.
 *
 * El contenido del CV llega traducido desde la API (`/api/cv?lang=`); aquí solo
 * viven las etiquetas fijas de la página. En el HTML se marcan con:
 *   data-i18n="clave"            → textContent
 *   data-i18n-attr="attr:clave"  → atributo (aria-label, title, placeholder...)
 */

const STORAGE_KEY = "lang";
export const LANGUAGES = ["es", "en"];
/** Idioma de la primera visita. El visitante puede cambiarlo y se recuerda. */
const DEFAULT_LANG = "es";

const DICT = {
  es: {
    "meta.title": "Jhonatan Rodriguez Custodio | AI Engineer",
    "meta.description":
      "Jhonatan Rodriguez Custodio — AI Engineer especializado en sistemas RAG multimodales, arquitecturas multiagente y soluciones de IA generativa sobre Microsoft Azure.",

    "a11y.skip": "Saltar al contenido",
    "nav.about": "Sobre mí",
    "nav.experience": "Experiencia",
    "nav.projects": "Proyectos",
    "nav.skills": "Stack",
    "nav.certifications": "Certificaciones",
    "nav.contact": "Contacto",
    "nav.open": "Abrir menú",
    "nav.close": "Cerrar menú",
    "nav.preferences": "Preferencias",
    "theme.toLight": "Cambiar a tema claro",
    "theme.toDark": "Cambiar a tema oscuro",
    "lang.switch": "Switch to English",

    "hero.available": "Disponible para nuevos proyectos",
    "hero.greeting": "Hola, mi nombre es",
    "hero.ctaProjects": "Ver proyectos",
    "hero.ctaAsk": "Pregúntale a mi IA",
    "hero.ctaContact": "Hablemos",
    "hero.roles": [
      "AI Engineer",
      "Arquitecto de sistemas RAG",
      "Especialista en Azure AI",
      "Desarrollador multiagente",
    ],

    "about.title": "Sobre mí",
    "about.education": "Formación",
    "about.mentoring": "Mentoría y talleres",
    "about.focus": "En qué me enfoco",
    "about.focusItems": [
      ["Sistemas multiagente", "Orquestadores y agentes especialistas con Human-in-the-Loop."],
      ["RAG multimodal", "Búsqueda híbrida, semantic ranking y citas trazables."],
      ["Document AI", "Extracción estructurada con Document Intelligence + LLMs."],
      ["Entrega cloud-native", "App Service, Functions, Container Apps y AKS en Azure."],
    ],

    "experience.title": "Experiencia profesional",
    "experience.current": "Actual",

    "projects.title": "Proyectos destacados",
    "projects.lead":
      "Soluciones empresariales en producción. El código es privado; aquí documento la arquitectura y las decisiones de diseño de cada una.",
    "projects.all": "Todos",
    "projects.cue": "Ver arquitectura y detalle",
    "projects.detailOf": "Ver detalle de",
    "projects.count": (n) => `${n} ${n === 1 ? "proyecto" : "proyectos"}`,

    "skills.title": "Stack tecnológico",
    "skills.lead": "Las herramientas con las que diseño, construyo y despliego soluciones de IA en producción.",
    "skills.count": (n) => `${n} ${n === 1 ? "herramienta" : "herramientas"}`,
    "certs.title": "Certificaciones Microsoft",
    "certs.verify": "Verificar",

    "contact.title": "Trabajemos juntos",
    "contact.lead":
      "¿Tienes un reto de IA generativa, RAG o automatización documental? Escríbeme por el canal que prefieras y conversemos sobre cómo llevarlo a producción.",
    "contact.mailHint": "Escríbeme un correo",
    "contact.whatsappHint": "Respuesta rápida por chat",
    "contact.linkedinHint": "Conectemos profesionalmente",
    "contact.githubHint": "Revisa mi código",
    "contact.copy": "Copiar email",
    "contact.copied": "Email copiado",

    "footer.built": "Diseñado y construido por Jhonatan Rodriguez Custodio",

    "modal.close": "Cerrar detalle",
    "modal.problem": "Problema que resuelve",
    "modal.architecture": "Arquitectura",
    "modal.flow": "Flujo de la solución",
    "modal.components": "Servicios utilizados",
    "modal.tech": "Stack",
    "modal.askAI": "Pregúntale a la IA sobre este proyecto",
    "modal.askPrompt": (title) => `Explícame el proyecto ${title}: qué problema resuelve y cómo está construido.`,

    "diagram.user": "Usuario",
    "diagram.compute": "Cómputo",
    "diagram.ai": "IA / Cognitivo",
    "diagram.agent": "Agente",
    "diagram.data": "Datos",
    "diagram.security": "Seguridad",
    "diagram.observability": "Observabilidad",
    "diagram.integration": "Integración",
    "diagram.external": "Sistema externo",

    "chat.inviteTitle": "Soy el asistente de Jhonatan",
    "chat.inviteText": "Pregúntame sobre su experiencia, proyectos o certificaciones",
    "chat.inviteClose": "Ocultar mensaje",
    "chat.open": "Abrir asistente de IA",
    "chat.close": "Cerrar asistente",
    "chat.title": "Asistente de Jhonatan",
    "chat.quotaTitle": "Preguntas restantes",
    "chat.placeholder": "Hazme una pregunta...",
    "chat.placeholderBusy": "Generando respuesta...",
    "chat.placeholderDepleted": "Límite alcanzado — vuelve en 24 h",
    "chat.send": "Enviar",
    "chat.greeting":
      "¡Hola! Soy el asistente de Jhonatan y conozco su CV completo. Pregúntame lo que quieras sobre su experiencia, proyectos o certificaciones.",
    "chat.suggestions": [
      "¿Qué experiencia tiene con Azure?",
      "Háblame de sus sistemas multiagente",
      "¿Cómo lo contacto?",
    ],
    "chat.remaining": (n) => `${n} ${n === 1 ? "pregunta restante" : "preguntas restantes"}`,
    "chat.connectionError": "No pude conectar con el asistente. Intenta de nuevo en un momento.",
    "chat.disclaimer": "Respuestas generadas con IA a partir del CV.",

    "error.load": "No se pudo cargar el contenido. Recarga la página en unos segundos.",
  },

  en: {
    "meta.title": "Jhonatan Rodriguez Custodio | AI Engineer",
    "meta.description":
      "Jhonatan Rodriguez Custodio — AI Engineer specialized in multimodal RAG systems, multi-agent architectures and generative AI solutions on Microsoft Azure.",

    "a11y.skip": "Skip to content",
    "nav.about": "About",
    "nav.experience": "Experience",
    "nav.projects": "Projects",
    "nav.skills": "Stack",
    "nav.certifications": "Certifications",
    "nav.contact": "Contact",
    "nav.open": "Open menu",
    "nav.close": "Close menu",
    "nav.preferences": "Preferences",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",
    "lang.switch": "Cambiar a español",

    "hero.available": "Open to new projects",
    "hero.greeting": "Hi, my name is",
    "hero.ctaProjects": "View projects",
    "hero.ctaAsk": "Ask my AI",
    "hero.ctaContact": "Let's talk",
    "hero.roles": [
      "AI Engineer",
      "RAG systems architect",
      "Azure AI specialist",
      "Multi-agent developer",
    ],

    "about.title": "About me",
    "about.education": "Education",
    "about.mentoring": "Mentoring and workshops",
    "about.focus": "What I focus on",
    "about.focusItems": [
      ["Multi-agent systems", "Orchestrators and specialist agents with Human-in-the-Loop."],
      ["Multimodal RAG", "Hybrid search, semantic ranking and traceable citations."],
      ["Document AI", "Structured extraction with Document Intelligence + LLMs."],
      ["Cloud-native delivery", "App Service, Functions, Container Apps and AKS on Azure."],
    ],

    "experience.title": "Professional experience",
    "experience.current": "Current",

    "projects.title": "Featured projects",
    "projects.lead":
      "Enterprise solutions running in production. The code is private; here I document the architecture and design decisions behind each one.",
    "projects.all": "All",
    "projects.cue": "View architecture and details",
    "projects.detailOf": "View details of",
    "projects.count": (n) => `${n} ${n === 1 ? "project" : "projects"}`,

    "skills.title": "Tech stack",
    "skills.lead": "The tools I use to design, build and ship AI solutions to production.",
    "skills.count": (n) => `${n} ${n === 1 ? "tool" : "tools"}`,
    "certs.title": "Microsoft certifications",
    "certs.verify": "Verify",

    "contact.title": "Let's work together",
    "contact.lead":
      "Do you have a generative AI, RAG or document automation challenge? Reach out through any channel and let's talk about taking it to production.",
    "contact.mailHint": "Send me an email",
    "contact.whatsappHint": "Quick reply by chat",
    "contact.linkedinHint": "Let's connect",
    "contact.githubHint": "Check out my code",
    "contact.copy": "Copy email",
    "contact.copied": "Email copied",

    "footer.built": "Designed and built by Jhonatan Rodriguez Custodio",

    "modal.close": "Close details",
    "modal.problem": "Problem it solves",
    "modal.architecture": "Architecture",
    "modal.flow": "Solution flow",
    "modal.components": "Services used",
    "modal.tech": "Stack",
    "modal.askAI": "Ask the AI about this project",
    "modal.askPrompt": (title) => `Explain the ${title} project: what problem it solves and how it is built.`,

    "diagram.user": "User",
    "diagram.compute": "Compute",
    "diagram.ai": "AI / Cognitive",
    "diagram.agent": "Agent",
    "diagram.data": "Data",
    "diagram.security": "Security",
    "diagram.observability": "Observability",
    "diagram.integration": "Integration",
    "diagram.external": "External system",

    "chat.inviteTitle": "I'm Jhonatan's assistant",
    "chat.inviteText": "Ask me about his experience, projects or certifications",
    "chat.inviteClose": "Hide message",
    "chat.open": "Open AI assistant",
    "chat.close": "Close assistant",
    "chat.title": "Jhonatan's assistant",
    "chat.quotaTitle": "Questions left",
    "chat.placeholder": "Ask me a question...",
    "chat.placeholderBusy": "Generating answer...",
    "chat.placeholderDepleted": "Limit reached — come back in 24 h",
    "chat.send": "Send",
    "chat.greeting":
      "Hi! I'm Jhonatan's assistant and I know his full CV. Ask me anything about his experience, projects or certifications.",
    "chat.suggestions": [
      "What experience does he have with Azure?",
      "Tell me about his multi-agent systems",
      "How can I contact him?",
    ],
    "chat.remaining": (n) => `${n} ${n === 1 ? "question left" : "questions left"}`,
    "chat.connectionError": "I couldn't reach the assistant. Please try again in a moment.",
    "chat.disclaimer": "AI-generated answers based on the CV.",

    "error.load": "The content couldn't be loaded. Please reload the page in a few seconds.",
  },
};

function detect() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (LANGUAGES.includes(saved)) return saved;
  } catch {
    /* almacenamiento bloqueado: se usa el idioma por defecto */
  }
  return DEFAULT_LANG;
}

let current = detect();
const listeners = new Set();

export const getLang = () => current;

/** Traduce una clave. Si el valor es una función, recibe `args`. */
export function t(key, ...args) {
  const value = DICT[current][key] ?? DICT.es[key] ?? key;
  return typeof value === "function" ? value(...args) : value;
}

/** Aplica los textos fijos marcados en el HTML. */
export function applyStatic(root = document) {
  document.documentElement.lang = current;
  document.title = t("meta.title");
  document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.description"));

  root.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  root.querySelectorAll("[data-i18n-attr]").forEach((node) => {
    node.dataset.i18nAttr.split(";").forEach((pair) => {
      const [attr, key] = pair.split(":").map((s) => s.trim());
      if (attr && key) node.setAttribute(attr, t(key));
    });
  });
}

export function setLang(lang) {
  if (!LANGUAGES.includes(lang) || lang === current) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* sin persistencia: el cambio aplica solo a esta visita */
  }
  applyStatic();
  listeners.forEach((fn) => fn(lang));
}

export const onLangChange = (fn) => listeners.add(fn);
