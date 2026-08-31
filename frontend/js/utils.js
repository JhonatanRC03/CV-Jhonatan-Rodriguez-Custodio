export const $ = (selector, scope = document) => scope.querySelector(selector);
export const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

export function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

/** Convierte "MEF — descripción" en "<strong>MEF</strong> — descripción". */
export function withLeadEmphasis(text) {
  const separator = " — ";
  const index = text.indexOf(separator);
  const fragment = document.createDocumentFragment();

  if (index > 0 && index < 60) {
    fragment.append(el("strong", null, text.slice(0, index)), text.slice(index));
  } else {
    fragment.append(text);
  }

  return fragment;
}
