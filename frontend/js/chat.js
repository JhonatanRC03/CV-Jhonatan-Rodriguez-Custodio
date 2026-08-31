import { getChatQuota, streamChat } from "./api.js";
import { CHAT_GREETING, CHAT_HISTORY_TURNS, CHAT_SUGGESTIONS } from "./config.js";
import { $, el } from "./utils.js";

const history = [];
let remaining = null;
let busy = false;

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

  if (usage?.total) {
    const tokens = el("span", null, `${usage.total.toLocaleString("es")} tokens`);
    tokens.title = `Entrada: ${usage.input} · Salida: ${usage.output}`;
    meta.append(tokens);
  }

  if (latency) meta.append(el("span", null, `${latency.toFixed(1)} s`));

  return meta;
}

function renderQuota() {
  const badge = $("#chat-quota");
  if (remaining === null) return;

  badge.textContent = `${remaining} ${remaining === 1 ? "pregunta" : "preguntas"}`;
  badge.classList.toggle("depleted", remaining === 0);
}

function setLocked(locked) {
  $("#chat-message").disabled = locked;
  $("#chat-form").querySelector("button").disabled = locked;
  $("#chat-message").placeholder = locked
    ? "Límite alcanzado — vuelve en 24 h"
    : "Hazme una pregunta...";
}

function renderSuggestions() {
  const box = $("#chat-suggestions");
  box.replaceChildren();

  if (remaining === 0 || history.length > 0) return;

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
  setLocked(true);
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
    setLocked(remaining === 0);
    if (remaining !== 0) $("#chat-message").focus();
  }
}

export function initChat() {
  const launcher = $("#chat-launcher");
  const widget = $("#chat-widget");
  const form = $("#chat-form");
  const input = $("#chat-message");

  pushMessage(CHAT_GREETING, "bot");
  renderSuggestions();

  getChatQuota()
    .then((quota) => {
      remaining = quota.remaining;
      $("#chat-model").textContent = quota.model;
      renderQuota();
      renderSuggestions();
      setLocked(remaining === 0);
    })
    .catch(() => {});

  launcher.addEventListener("click", () => {
    widget.hidden = false;
    launcher.classList.add("hidden");
    input.focus();
    scrollToEnd();
  });

  $("#chat-close").addEventListener("click", () => {
    widget.hidden = true;
    launcher.classList.remove("hidden");
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const question = input.value.trim();
    if (!question) return;
    input.value = "";
    ask(question);
  });
}
