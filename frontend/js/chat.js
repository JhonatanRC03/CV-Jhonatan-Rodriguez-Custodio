import { sendChat } from "./api.js";
import { CHAT_GREETING, CHAT_SUGGESTIONS } from "./config.js";
import { $, el } from "./utils.js";

const win = () => $("#chat-window");

function pushMessage(text, author) {
  const msg = el("div", `msg msg-${author}`, text);
  win().append(msg);
  win().scrollTop = win().scrollHeight;
}

function showTyping() {
  const typing = el("div", "msg msg-bot msg-typing");
  typing.append(el("span"), el("span"), el("span"));
  win().append(typing);
  win().scrollTop = win().scrollHeight;
  return typing;
}

async function ask(question) {
  pushMessage(question, "user");
  const typing = showTyping();

  try {
    const { reply } = await sendChat(question);
    typing.remove();
    pushMessage(reply, "bot");
  } catch {
    typing.remove();
    pushMessage("No pude conectar con el servidor. Intenta de nuevo en un momento.", "bot");
  }
}

export function initChat() {
  const launcher = $("#chat-launcher");
  const widget = $("#chat-widget");
  const form = $("#chat-form");
  const input = $("#chat-message");

  pushMessage(CHAT_GREETING, "bot");

  const suggestions = $("#chat-suggestions");
  CHAT_SUGGESTIONS.forEach((text) => {
    const btn = el("button", "suggestion", text);
    btn.type = "button";
    btn.addEventListener("click", () => ask(text));
    suggestions.append(btn);
  });

  launcher.addEventListener("click", () => {
    widget.hidden = false;
    launcher.classList.add("hidden");
    input.focus();
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
