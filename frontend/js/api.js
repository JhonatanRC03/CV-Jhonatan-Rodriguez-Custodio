import { API_URL } from "./config.js";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw Object.assign(new Error(data.error || "Error de red"), { status: res.status, data });
  }

  return data;
}

export const getCV = () => request("/cv");

export const getChatQuota = () => request("/chat/quota");

/**
 * Consume la respuesta del asistente como Server-Sent Events.
 * `on` recibe { start, delta, usage, done } y se invoca conforme llegan los eventos.
 */
export async function streamChat(message, history, on) {
  const res = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw Object.assign(new Error(data.error || "Error de red"), { status: res.status, data });
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n\n");
    buffer = chunks.pop();

    for (const chunk of chunks) {
      const event = chunk.match(/^event: (.+)$/m)?.[1];
      const raw = chunk.match(/^data: (.+)$/m)?.[1];
      if (!event || !raw) continue;

      const data = JSON.parse(raw);
      if (event === "error") throw Object.assign(new Error(data.error), { data });
      on[event]?.(data);
    }
  }
}

export const sendContact = (payload) =>
  request("/contact", { method: "POST", body: JSON.stringify(payload) });
