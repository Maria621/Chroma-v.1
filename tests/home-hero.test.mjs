/**
 * Homepage hero regression checks (static).
 * These do not measure actual pixels or replace browser-based QA.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (p) => readFileSync(path.join(root, p), "utf8");
const html = read("index.html");
const css = read("src/styles/refinements/06-home-hero.css");
const builder = read("scripts/build-front-end.mjs");

test("Hero keeps one clear heading, description and institutional CTA", () => {
  const hero = html.match(/<section class="hero" id="inicio">([\s\S]*?)<\/section>/)?.[1];
  assert.ok(hero, "Homepage hero must exist");
  assert.equal((hero.match(/<h1\b/g) || []).length, 1);
  assert.match(hero, /<div class="hero-bottom">/);
  assert.match(hero, /href="nossa-escola\.html"/);
  assert.match(hero, /Imagem ilustrativa criada digitalmente/);
});

test("Priority image retains its intrinsic ratio and descriptive alternative", () => {
  const img = html.match(/<img[^>]*class="photograph"[^>]*>/)?.[0];
  assert.ok(img, "Main hero image must be present");
  assert.match(img, /src="assets\/visual-hero\.avif"/);
  assert.match(img, /width="1100"/);
  assert.match(img, /height="619"/);
  assert.match(img, /fetchpriority="high"/);
  assert.match(img, /alt="[^"]*ilustrativa[^"]*"/);
});

test("Hero photo never uses cover in the last, authoritative component rules", () => {
  assert.match(css, /\.hero#inicio \.hero-photo \.photograph\s*\{[^}]*object-fit:\s*contain/s);
  assert.doesNotMatch(css, /object-fit:\s*cover/);
  assert.match(css, /\.hero#inicio \.hero-photo\s*\{[^}]*aspect-ratio:\s*1100\s*\/\s*619/s);
});

test("Responsive hero has explicit tablet and mobile stacking", () => {
  assert.match(css, /@media\s*\(max-width:\s*900px\)/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)/);
  assert.match(css, /\.hero#inicio \.hero-photo\s*\{[^}]*order:\s*2/s);
  assert.match(css, /\.hero#inicio \.hero-footer\s*\{[^}]*order:\s*3/s);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test("Hero component remains in the deterministic stylesheet build", () => {
  assert.match(builder, /src\/styles\/refinements\/06-home-hero\.css/);
  assert.match(css, /\.hero#inicio h1\s*\{[^}]*text-wrap:\s*balance/s);
});
