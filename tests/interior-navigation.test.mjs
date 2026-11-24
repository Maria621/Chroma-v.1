/**
 * Chroma V5.4 — regressions for 11 internal pages and shared navigation.
 * Structural checks only. Browser interaction and layout require visual QA.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (p) => readFileSync(path.join(root, p), "utf8");
const pages = [
  "nossa-escola.html", "nossa-essencia.html", "metodologia.html",
  "estrutura.html", "experiencia-chroma.html", "unidades.html",
  "novidades.html", "contato.html", "parcerias.html",
  "aluno-nota-10.html", "privacidade.html",
];

test("Every internal page includes a single contextual return link", () => {
  for (const page of pages) {
    const html = read(page);
    const inner = html.match(/<div class="page-eyebrow">([\s\S]*?)<\/div>/)?.[1] || "";
    assert.match(inner, /class="page-return-home" href="index\.html"/, page);
    assert.equal((inner.match(/class="page-return-home"/g) || []).length, 1, page);
    assert.match(html, /<main id="conteudo-principal">/, page);
    assert.match(html, /<h1\b/, page);
  }
});

test("Shared desktop navigation uses disclosure semantics, not a menu role", () => {
  const header = read("src/partials/header.html");
  assert.match(header, /aria-expanded="false" aria-controls="institutional-panel"/);
  assert.doesNotMatch(header, /aria-haspopup="true"/);
  assert.match(header, /id="mobile-panel" hidden/);
});

test("Keyboard navigation supports dropdown choices and method steps", () => {
  const navigation = read("src/scripts/navigation.js");
  const methods = read("src/scripts/methodology.js");
  assert.match(navigation, /ArrowDown/);
  assert.match(navigation, /ArrowUp/);
  assert.match(navigation, /setDropdown\(false\)/);
  for (const key of ["ArrowDown", "ArrowUp", "Home", "End"]) {
    assert.ok(methods.includes(key), "Method keyboard support: " + key);
  }
  for (const page of ["index.html", "metodologia.html"]) {
    const html = read(page);
    const buttons = [...html.matchAll(/<button class="method-step[^>]*>[\s\S]*?<\/button>/g)];
    assert.equal(buttons.length, 5, page);
    for (const button of buttons) {
      assert.match(button[0], /class="method-plus" aria-hidden="true"/, page);
    }
  }
});

test("News art triggers are uniquely named and modal restores focus", () => {
  const html = read("novidades.html");
  const buttons = [...html.matchAll(/<button[^>]*data-view-image="([^"]+)"[^>]*aria-label="([^"]+)"[^>]*>/g)];
  assert.equal(buttons.length, 3);
  const labels = buttons.map((m) => m[2]);
  assert.equal(new Set(labels).size, 3);
  const dialog = read("src/scripts/news-dialog.js");
  assert.match(dialog, /addEventListener\('close'/);
  assert.match(dialog, /trigger\.focus\(\)/);
});

test("Units have an honest active contact alternative", () => {
  const html = read("unidades.html");
  assert.match(html, /units-contact-guidance/);
  assert.match(html, /instagram\.com\/escola_chroma/);
  assert.doesNotMatch(html, /mais próxima de você/);
});

test("Contextual navigation styles are part of the generated CSS", () => {
  const builder = read("scripts/front-end-manifest.mjs");
  const source = read("src/styles/refinements/07-inner-navigation.css");
  const output = read("v31.css");
  assert.match(builder, /07-inner-navigation\.css/);
  assert.ok(output.includes(source), "Navigation styles must be present in the CSS bundle");
  const contrast = read("src/styles/refinements/08-contrast.css");
  assert.ok(output.endsWith(contrast), "Accessibility refinements should be last");
  assert.ok(
    output.indexOf(source) < output.lastIndexOf(contrast),
    "Keep the declared order of CSS modules",
  );
  assert.match(source, /page-return-home:focus-visible/);
});
