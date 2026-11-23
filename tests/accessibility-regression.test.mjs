import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (p) => readFileSync(path.join(root, p), "utf8");
const pages = [
  "index.html", "nossa-escola.html", "nossa-essencia.html",
  "metodologia.html", "estrutura.html", "experiencia-chroma.html",
  "unidades.html", "novidades.html", "contato.html", "parcerias.html",
  "aluno-nota-10.html", "privacidade.html",
];

test("Every page declares the existing institutional brand icon", () => {
  for (const page of pages) {
    assert.match(read(page), /rel="icon" href="assets\/logo-instituto-chroma\.png" type="image\/png"/, page);
  }
});

test("Decorative marquee is hidden from assistive technologies", () => {
  const html = read("index.html");
  assert.match(html, /<div class="marquee-band" aria-hidden="true">/);
  assert.doesNotMatch(html, /class="marquee-band" aria-label=/);
});

test("CSS contrast corrections are maintained as an independent module", () => {
  const source = read("src/styles/refinements/08-contrast.css");
  const bundle = read("v31.css");
  const build = read("scripts/build-front-end.mjs");
  assert.ok(bundle.endsWith(source));
  assert.match(build, /src\/styles\/refinements\/08-contrast\.css/);
  for (const selector of [
    ".marquee-band .marquee-copy",
    ".method-steps .method-step-n",
    ".gallery-disclaimer",
    ".v3-units-feature .v3-unit-note",
    ".footer-compact .footer-bottom span",
  ]) {
    assert.ok(source.includes(selector), "Missing contrast override " + selector);
  }
});
