/**
 * Iconos del stack tecnológico.
 *
 * Dos fuentes:
 *  · Logos de marca (Devicon, MIT; OpenAI de Simple Icons, CC0), guardados en
 *    assets/icons/tech/ para no depender de un CDN.
 *  · Glifos de línea propios para servicios sin logo libre (Azure Functions,
 *    Key Vault...). Se tiñen con el color de su familia.
 *
 * El nombre de cada skill se resuelve por patrón, así funcionan igual la
 * versión en español y en inglés del CV ("Arquitecturas multiagente" y
 * "Multi-agent architectures" caen en la misma regla).
 */

const LOGO_DIR = "assets/icons/tech";

const AZURE = "#0078d4";
const OPENAI = "#10a37f";

/* ── Glifos de línea (viewBox 24×24, trazo) ── */
const GLYPHS = {
  database: ["M4 6c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3z", "M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6", "M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"],
  plug: ["M9 2v6M15 2v6", "M6 8h12v3a6 6 0 0 1-12 0z", "M12 17v5"],
  agents: ["M12 3a3 3 0 1 1 0 6 3 3 0 0 1 0-6z", "M5 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6zM19 15a3 3 0 1 1 0 6 3 3 0 0 1 0-6z", "M10.5 8.6 6.5 15.4M13.5 8.6l4 6.8M8 18h8"],
  kernel: ["M12 2 3 7v10l9 5 9-5V7z", "M12 12 3 7M12 12l9-5M12 12v10"],
  person: ["M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z", "M4 21a8 8 0 0 1 11-7.4", "m15 18 2 2 4-4"],
  search: ["M11 4a7 7 0 1 1 0 14 7 7 0 0 1 0-14z", "m21 21-5-5", "M8 11h6M11 8v6"],
  prompt: ["M4 4h16v16H4z", "m8 9 3 3-3 3", "M13 15h3"],
  chat: ["M21 12a8 8 0 0 1-11.6 7.1L3 21l1.9-6.4A8 8 0 1 1 21 12z", "M8 10h8M8 14h5"],
  bolt: ["M13 2 4 14h7l-1 8 9-12h-7z"],
  eye: ["M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z", "M12 9a3 3 0 1 1 0 6 3 3 0 0 1 0-6z"],
  target: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8z", "M12 1v4M12 19v4M1 12h4M19 12h4"],
  docScan: ["M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z", "M14 3v5h5", "M9 13h6M9 17h4"],
  image: ["M4 4h16v16H4z", "M9 10a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z", "m20 15-5-5-9 10"],
  globe: ["M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18z", "M3 12h18", "M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"],
  box: ["M21 8 12 3 3 8v8l9 5 9-5z", "M3 8l9 5 9-5M12 13v8"],
  flow: ["M5 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4zM19 17a2 2 0 1 1 0 4 2 2 0 0 1 0-4z", "M7 5h6a4 4 0 0 1 0 8h-2a4 4 0 0 0 0 8h6"],
  key: ["M8 14a5 5 0 1 1 3.5-1.5L21 22", "M17 18l2-2M15 16l2-2"],
  pulse: ["M3 12h4l3-8 4 16 3-8h4"],
  barChart: ["M4 20V10M10 20V4M16 20v-7M22 20H2"],
  waveChart: ["M3 3v18h18", "M7 15c2-6 4-6 6-2s4 2 6-6"],
  etl: ["M3 6h11M3 12h7M3 18h11", "m17 9 4 3-4 3", "M10 12h11"],
  code: ["m8 6-6 6 6 6M16 6l6 6-6 6"],
  sparkles: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z"],
  layers: ["M12 3 2 8l10 5 10-5z", "M2 13l10 5 10-5", "M2 18l10 5 10-5"],
  cloud: ["M7 18a5 5 0 1 1 .9-9.9A6 6 0 0 1 19 10a4 4 0 0 1 0 8z"],
  calendar: ["M4 5h16v16H4z", "M4 10h16M9 3v4M15 3v4", "m9 15 2 2 4-4"],
  award: ["M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12z", "m8.5 13-1.5 9 5-3 5 3-1.5-9"],
  server: ["M3 4h18v6H3zM3 14h18v6H3z", "M7 7h.01M7 17h.01M11 7h6M11 17h6"],
  users: ["M9 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8z", "M2 21a7 7 0 0 1 14 0", "M16 4.1a4 4 0 0 1 0 7.8M22 21a7 7 0 0 0-4-6.3"],
  git: ["M6 3v12", "M6 21a3 3 0 1 1 0-6 3 3 0 0 1 0 6zM18 9a3 3 0 1 1 0-6 3 3 0 0 1 0 6z", "M18 9a9 9 0 0 1-9 9"],
};

/* Logo de marca. `mono`: logo monocromo que debe tomar el color del texto
   (si no, el negro de GitHub/Flask/OpenAI desaparece en el tema oscuro). */
const logo = (file, brand, mono = false) => ({ type: "logo", src: `${LOGO_DIR}/${file}.svg`, brand, mono });

/* Una url() relativa dentro de una variable CSS se resuelve desde la hoja de
   estilos que la usa (css/components/), no desde la página: hay que pasarla absoluta. */
export const maskUrl = (src) => `url("${new URL(src, document.baseURI).href}")`;
const glyph = (name, brand) => ({ type: "glyph", name, brand });

/* Orden importante: la primera regla que coincide gana. */
const RULES = [
  // Lenguajes
  [/^python$/, logo("python", "#3776ab")],
  [/sql server/, logo("microsoftsqlserver", "#cc2927")],
  [/^mysql$/, logo("mysql", "#00758f")],
  [/postgres/, logo("postgresql", "#336791")],
  [/^sql$/, glyph("database", "#e38c00")],
  [/^r$/, logo("r", "#276dc3")],
  [/^java$/, logo("java", "#e76f00")],
  [/typescript/, logo("typescript", "#3178c6")],
  [/javascript/, logo("javascript", "#f7df1e")],

  // IA agéntica
  [/model context protocol|\bmcp\b/, glyph("plug", "#a855f7")],
  [/agent framework/, glyph("agents", AZURE)],
  [/semantic kernel/, glyph("kernel", "#7b4fdb")],
  [/ai foundry|microsoft foundry/, logo("azure", AZURE)],
  [/multi.?agent|multiagente/, glyph("agents", "#a855f7")],
  [/human.in.the.loop/, glyph("person", "#10b981")],

  // IA generativa
  [/\brag\b/, glyph("search", "#06b6d4")],
  [/azure openai|openai|gpt vision/, logo("openai", OPENAI, true)],
  [/prompt/, glyph("prompt", "#f59e0b")],
  [/^nlp$/, glyph("chat", "#ec4899")],

  // Frameworks
  [/fastapi/, logo("fastapi", "#009688")],
  [/^flask$/, logo("flask", null, true)],
  [/^quart$/, glyph("bolt", "#8b5cf6")],
  [/react/, logo("react", "#61dafb")],
  [/angular/, logo("angular", "#dd0031")],

  // Visión
  [/yolo/, glyph("target", "#00b4d8")],
  [/opencv/, logo("opencv", "#5c3ee8")],
  [/tensorflow/, logo("tensorflow", "#ff6f00")],
  [/keras/, logo("keras", "#d00000")],

  // Documentos
  [/document intelligence/, glyph("docScan", AZURE)],
  [/content understanding/, glyph("image", AZURE)],

  // Azure
  [/ai search/, glyph("search", AZURE)],
  [/app service/, glyph("globe", AZURE)],
  [/functions/, glyph("bolt", AZURE)],
  [/container apps/, glyph("box", AZURE)],
  [/^aks$|kubernetes/, logo("kubernetes", "#326ce5")],
  [/logic apps/, glyph("flow", AZURE)],
  [/key vault/, glyph("key", AZURE)],
  [/insights/, glyph("pulse", AZURE)],

  // Datos
  [/pandas/, logo("pandas", "#150458")],
  [/numpy/, logo("numpy", "#4dabcf")],
  [/scikit/, logo("scikitlearn", "#f7931e")],
  [/pyspark|spark/, logo("apachespark", "#e25a1c")],
  [/power bi/, glyph("barChart", "#f2c811")],
  [/matplotlib/, logo("matplotlib", "#11557c")],
  [/seaborn/, glyph("waveChart", "#4c72b0")],
  [/^etl$/, glyph("etl", "#14b8a6")],

  // Bases de datos
  [/mongo/, logo("mongodb", "#47a248")],
  [/cosmos/, logo("cosmosdb", AZURE)],

  // Control de versiones
  [/^git$/, logo("git", "#f05032")],
  [/github/, logo("github", null, true)],
];

/** Icono de la tarjeta según el campo `icon` de cada categoría del CV. */
const CATEGORY_GLYPHS = {
  code: "code",
  agents: "agents",
  ai: "sparkles",
  stack: "layers",
  vision: "eye",
  doc: "docScan",
  cloud: "cloud",
  data: "barChart",
  db: "database",
  git: "git",
};

const NS = "http://www.w3.org/2000/svg";

export function glyphSvg(name, size = 18) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");

  (GLYPHS[name] || GLYPHS.code).forEach((d) => {
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    svg.append(path);
  });

  return svg;
}

export function resolveTech(name) {
  const key = name.toLowerCase().trim();
  const match = RULES.find(([pattern]) => pattern.test(key));
  return match ? match[1] : glyph("code", null);
}

/** Nodo del icono para una tecnología. */
export function techIcon(name) {
  const spec = resolveTech(name);
  const wrap = document.createElement("span");
  wrap.className = `tech-ico${spec.mono ? " mono" : ""}`;
  wrap.setAttribute("aria-hidden", "true");

  if (spec.type === "logo" && spec.mono) {
    // Máscara: la silueta del logo pintada con el color del texto.
    wrap.style.setProperty("--src", maskUrl(spec.src));
  } else if (spec.type === "logo") {
    const img = document.createElement("img");
    img.src = spec.src;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    img.width = 18;
    img.height = 18;
    // Si el archivo falta, queda un glifo genérico en lugar de una imagen rota.
    img.onerror = () => img.replaceWith(glyphSvg("code"));
    wrap.append(img);
  } else {
    wrap.append(glyphSvg(spec.name));
  }

  return { node: wrap, brand: spec.brand };
}

export function categoryIcon(key) {
  return glyphSvg(CATEGORY_GLYPHS[key] || "code", 20);
}

/** Logos de marca (sin glifos) para la cinta animada, sin repetir. */
export function brandLogos(skills) {
  const seen = new Set();
  const logos = [];

  skills
    .flatMap((group) => group.items)
    .forEach((name) => {
      const spec = resolveTech(name);
      if (spec.type !== "logo" || seen.has(spec.src)) return;
      seen.add(spec.src);
      logos.push({ name, ...spec });
    });

  return logos;
}
