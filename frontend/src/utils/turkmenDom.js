import { normalizeTmText } from "../store/locale";

const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "CODE", "PRE", "KBD", "SAMP"]);
const TEXT_ATTRIBUTES = ["placeholder", "title", "aria-label"];

const shouldSkipTextNode = (node) => {
  const parent = node.parentElement;
  if (!parent) return true;
  if (parent.isContentEditable) return true;
  if (SKIP_TAGS.has(parent.tagName)) return true;
  if (parent.closest("[data-no-tm-normalize='true']")) return true;
  return !String(node.nodeValue || "").trim();
};

const normalizeAttributes = (root) => {
  if (!(root instanceof Element) && !(root instanceof DocumentFragment)) return;

  root.querySelectorAll("*").forEach((element) => {
    if (element.closest("[data-no-tm-normalize='true']")) return;

    TEXT_ATTRIBUTES.forEach((attribute) => {
      const value = element.getAttribute(attribute);
      if (!value) return;
      const normalized = normalizeTmText(value);
      if (normalized !== value) element.setAttribute(attribute, normalized);
    });

    if (
      element instanceof HTMLInputElement &&
      ["button", "submit", "reset"].includes(element.type || "") &&
      typeof element.value === "string"
    ) {
      const normalized = normalizeTmText(element.value);
      if (normalized !== element.value) element.value = normalized;
    }
  });
};

export const applyTurkmenDomNormalization = (root) => {
  const host = root instanceof Document ? root.body : root;
  if (!(host instanceof Element) && !(host instanceof DocumentFragment)) return;

  normalizeAttributes(host);

  const walker = document.createTreeWalker(
    host,
    window.NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        return shouldSkipTextNode(node) ? window.NodeFilter.FILTER_REJECT : window.NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const textNodes = [];
  let currentNode = walker.nextNode();
  while (currentNode) {
    textNodes.push(currentNode);
    currentNode = walker.nextNode();
  }

  textNodes.forEach((node) => {
    const normalized = normalizeTmText(node.nodeValue || "");
    if (normalized !== node.nodeValue) node.nodeValue = normalized;
  });
};
