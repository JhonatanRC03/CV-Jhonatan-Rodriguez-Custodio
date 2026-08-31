import { sendContact } from "./api.js";
import { $ } from "./utils.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function setStatus(text, type = "") {
  const status = $("#form-status");
  status.textContent = text;
  status.className = `form-status ${type}`;
}

function validate(fields) {
  let valid = true;

  Object.entries(fields).forEach(([name, value]) => {
    const input = $(`#${name}`);
    const ok = name === "email" ? EMAIL_RE.test(value) : value.length > 0;
    input.classList.toggle("invalid", !ok);
    if (!ok) valid = false;
  });

  return valid;
}

export function initContactForm() {
  const form = $("#contact-form");
  const button = form.querySelector("button[type=submit]");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const fields = {
      name: $("#name").value.trim(),
      email: $("#email").value.trim(),
      message: $("#message").value.trim(),
    };

    if (!validate(fields)) {
      setStatus("Revisa los campos marcados.", "error");
      return;
    }

    button.disabled = true;
    setStatus("Enviando...");

    try {
      const { message } = await sendContact(fields);
      setStatus(message, "success");
      form.reset();
    } catch {
      setStatus("No se pudo enviar. Escríbeme directamente por correo.", "error");
    } finally {
      button.disabled = false;
    }
  });
}
