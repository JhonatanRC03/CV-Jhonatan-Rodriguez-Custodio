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

export const sendChat = (message) =>
  request("/chat", { method: "POST", body: JSON.stringify({ message }) });

export const sendContact = (payload) =>
  request("/contact", { method: "POST", body: JSON.stringify(payload) });
