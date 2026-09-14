import { getChatQuota, streamChat } from "./api.js";
import { CHAT_GREETING, CHAT_HISTORY_TURNS, CHAT_SUGGESTIONS } from "./config.js";
import { $, el, isMobile, lockScroll } from "./utils.js";

const history = [];
let remaining = null;
let limit = null;
let busy = false;
let asked = false;

const win = () => $("#chat-window");

/** Mantiene el scroll abajo salvo que el usuario haya subido a leer. */
function scrollToEnd(force = false) {
  const node = win();
  const atBottom = node.scrollHeight - node.scrollTop - node.clientHeight < 60;
  if (force || atBottom) node.scrollTop = node.scrollHeight;
}

function pushMessage(text, author) {
  win().append(el("div", `msg msg-${author}`, text));
  scrollToEnd(true);
}

function showTyping() {
  const typing = el("div", "msg msg-bot msg-typing");
  typing.append(el("span"), el("span"), el("span"));
  win().append(typing);
  scrollToEnd(true);
  return typing;
}

/** Burbuja que se va llenando token a token. */
function createStreamBubble() {
  const bubble = el("div", "msg msg-bot streaming");
  const body = el("span", "msg-body");
  const caret = el("span", "msg-caret");
  bubble.append(body, caret);
  win().append(bubble);
  scrollToEnd(true);

  return {
    append(token) {
      body.textContent += token;
      scrollToEnd();
    },
    get text() {
      return body.textContent;
    },
    finish(meta) {
      bubble.classList.remove("streaming");
      caret.remove();
      if (meta) bubble.append(meta);
      scrollToEnd();
    },
    remove: () => bubble.remove(),
  };
}

function buildMeta({ model, usage, latency }) {
  const meta = el("div", "msg-meta");
  meta.append(el("span", "meta-model", model));

  if (usage?.output) {
    const tokens = el("span", null, `${usage.output.toLocaleString("es")} tokens`);
    meta.append(tokens);
  }

  if (latency) meta.append(el("span", null, `${latency.toFixed(1)} s`));

  return meta;
}

function renderQuota() {
  const badge = $("#chat-quota");
  if (remaining === null) return;

  badge.textContent = limit ? `${remaining}/${limit}` : String(remaining);
  badge.title = `${remaining} ${remaining === 1 ? "pregunta restante" : "preguntas restantes"}`;
  badge.classList.toggle("depleted", remaining === 0);
}

/** El campo se bloquea mientras responde el modelo y también al agotarse la cuota. */
function syncInputState() {
  const depleted = remaining === 0;
  const input = $("#chat-message");

  input.disabled = busy || depleted;
  $("#chat-form").querySelector("button").disabled = busy || depleted;

  if (depleted) input.placeholder = "Límite alcanzado — vuelve en 24 h";
  else if (busy) input.placeholder = "Generando respuesta...";
  else input.placeholder = "Hazme una pregunta...";
}

function renderSuggestions() {
  const box = $("#chat-suggestions");
  box.replaceChildren();

  if (asked || remaining === 0) return;

  CHAT_SUGGESTIONS.forEach((text) => {
    const btn = el("button", "suggestion", text);
    btn.type = "button";
    btn.addEventListener("click", () => ask(text));
    box.append(btn);
  });
}

async function ask(question) {
  if (busy || remaining === 0) return;

  busy = true;
  asked = true;
  syncInputState();
  pushMessage(question, "user");
  renderSuggestions();

  const typing = showTyping();
  let bubble = null;
  const stats = {};

  try {
    await streamChat(question, history.slice(-CHAT_HISTORY_TURNS), {
      start: (data) => {
        stats.model = data.model;
        remaining = data.remaining;
        renderQuota();
      },
      delta: (data) => {
        if (!bubble) {
          typing.remove();
          bubble = createStreamBubble();
        }
        bubble.append(data.text);
      },
      usage: (data) => {
        stats.usage = data;
      },
      done: (data) => {
        stats.latency = data.latency;
        if (typeof data.remaining === "number") remaining = data.remaining;
      },
    });

    typing.remove();
    bubble?.finish(buildMeta(stats));

    if (bubble?.text) {
      history.push(
        { role: "user", content: question },
        { role: "assistant", content: bubble.text }
      );
    }
  } catch (error) {
    typing.remove();
    bubble?.remove();
    pushMessage(
      error.data?.error || "No pude conectar con el asistente. Intenta de nuevo en un momento.",
      "bot"
    );
    if (error.status === 429) remaining = 0;
  } finally {
    busy = false;
    renderQuota();
    renderSuggestions();
    syncInputState();
    if (remaining !== 0) $("#chat-message").focus();
  }
}

export function initChat() {
  const launcher = $("#chat-launcher");
  const invite = $("#chat-invite");
  const widget = $("#chat-widget");
  const form = $("#chat-form");
  const input = $("#chat-message");

  pushMessage(CHAT_GREETING, "bot");
  renderSuggestions();

  getChatQuota()
    .then((quota) => {
      remaining = quota.remaining;
      limit = quota.limit;
      $("#chat-model").textContent = quota.model;
      renderQuota();
      renderSuggestions();
      syncInputState();
    })
    .catch(() => {});

  const open = () => {
    widget.hidden = false;
    launcher.classList.add("hidden");
    // Como hoja inferior ocupa la pantalla: el fondo no debe desplazarse.
    lockScroll("chat", isMobile());
    // En móvil, enfocar abre el teclado y tapa la conversación.
    if (!isMobile()) input.focus();
    scrollToEnd(true);
  };

  const close = () => {
    widget.hidden = true;
    launcher.classList.remove("hidden");
    invite.classList.add("dismissed");
    lockScroll("chat", false);
  };

  $("#chat-launcher-btn").addEventListener("click", open);
  invite.addEventListener("click", open);

  $("#chat-invite-close").addEventListener("click", (e) => {
    e.stopPropagation();
    invite.classList.add("dismissed");
  });

  $("#chat-close").addEventListener("click", close);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !widget.hidden) close();
  });

  // Al rotar o cambiar de tamaño, el bloqueo solo aplica en modo hoja.
  window.addEventListener("resize", () => {
    if (!widget.hidden) lockScroll("chat", isMobile());
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = "";
    ask(question);
  });
}
