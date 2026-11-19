/**
 * Static QA for the multi-page Instituto Chroma site.
 * Node.js only: no bundler, runtime framework or extra dependencies.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { Script } from "node:vm";
import { pages, projectRoot, checkSharedLayout } from "./sync-layout.mjs";

const issues = [];
const warnings = [];
const read = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

const pageContents = new Map(pages.map((page) => [page, read(page)]));
const idList = new Map();
const count = (source, regexp) => (source.match(regexp) || []).length;
const attrs = (htmlTag) => {
  const result = new Map();
  for (const match of htmlTag.matchAll(/([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g)) {
    result.set(match[1], match[2] ?? match[3] ?? "");
  }
  return result;
};

for (const page of pages) {
  const source = pageContents.get(page);
  const ids = [...source.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)]
    .map((match) => match[1]);

  idList.set(page, new Set(ids));

  for (const id of ids) {
    if (ids.indexOf(id) !== ids.lastIndexOf(id)) {
      const issue = page + ": duplicate id #" + id;
      if (!issues.includes(issue)) issues.push(issue);
    }
  }

  for (const tag of ["html", "head", "body", "header", "main", "footer"]) {
    const opens = count(source, new RegExp("<" + tag + "\\b", "g"));
    const closes = count(source, new RegExp("<\\/" + tag + ">", "g"));
    if (opens !== 1 || closes !== 1) {
      issues.push(page + ": expected exactly one <" + tag + "> pair");
    }
  }

  for (const tag of ["section", "div", "nav", "article", "form"]) {
    const opens = count(source, new RegExp("<" + tag + "\\b", "g"));
    const closes = count(source, new RegExp("<\\/" + tag + ">", "g"));
    if (opens !== closes) {
      issues.push(page + ": unmatched <" + tag + "> (" + opens + "/" + closes + ")");
    }
  }

  if (!/<!doctype html>/i.test(source)) {
    issues.push(page + ": missing HTML5 doctype");
  }
  if (!/<html\b[^>]*lang="pt-BR"/i.test(source)) {
    issues.push(page + ": missing document language");
  }
  if (!/<title>\S[\s\S]*?<\/title>/.test(source)) {
    issues.push(page + ": missing page title");
  }
  if (count(source, /<h1\b/g) !== 1) {
    issues.push(page + ": expected exactly one h1");
  }
  if (!/<main\b[^>]*id="conteudo-principal"/.test(source)) {
    issues.push(page + ": main content landmark must be addressable");
  }

  const buttons = [...source.matchAll(/<button\b[^>]*>/g)].map((match) => match[0]);
  for (const button of buttons) {
    if (!attrs(button).has("type")) {
      issues.push(page + ": button without explicit type: " + button.slice(0, 90));
    }
  }

  const images = [...source.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);
  for (const image of images) {
    const a = attrs(image);
    if (!a.has("alt")) {
      issues.push(page + ": image without alt attribute");
    }
    if (a.has("src") && (!a.has("width") || !a.has("height"))) {
      issues.push(page + ": static image missing intrinsic dimensions: " + a.get("src"));
    }
    if (a.get("src") === "") {
      issues.push(page + ": image with empty src");
    }
    if (!a.has("src") && !a.has("data-dynamic-image")) {
      issues.push(page + ": image lacking src without dynamic-image marker");
    }
    if (a.has("src") && !/^https?:|^data:/.test(a.get("src"))) {
      const imageFile = path.join(projectRoot, a.get("src"));
      if (!existsSync(imageFile)) {
        issues.push(page + ": missing image " + a.get("src"));
      }
    }
  }
}

for (const page of pages) {
  const source = pageContents.get(page);

  for (const match of source.matchAll(/\bhref\s*=\s*["']([^"']+)["']/g)) {
    const href = match[1].replaceAll("&amp;", "&");
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    if (href.startsWith("javascript:")) {
      issues.push(page + ": javascript: link is not allowed");
      continue;
    }

    const [pathname, fragment] = href.split("#");
    const destination = pathname.split("?")[0] || page;

    if (destination.endsWith(".html") && !pageContents.has(destination)) {
      issues.push(page + ": broken local page link " + href);
      continue;
    }
    if (fragment && pageContents.has(destination) && !idList.get(destination).has(fragment)) {
      issues.push(page + ": broken section link " + href);
    }
  }
}

const expectedScripts = ['app.js', 'v31.js'];
for (const page of pages) {
  const html = pageContents.get(page);
  const scripts = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*><\/script>/g)]
    .map((match) => match[1]);
  if (scripts.length !== 2 || scripts.some((src, i) => src !== expectedScripts[i])) {
    issues.push(page + ": unexpected script ordering; expected app.js and v31.js");
  }
}

for (const issue of checkSharedLayout()) {
  issues.push(issue);
}

for (const jsFile of ["app.js", "v31.js", "api/contato.js"]) {
  try {
    new Script(read(jsFile), { filename: jsFile });
  } catch (error) {
    issues.push(jsFile + ": JavaScript syntax: " + error.message);
  }
}

for (const cssFile of ["style.css", "v31.css"]) {
  const source = read(cssFile);
  const open = count(source, /{/g);
  const close = count(source, /}/g);
  if (open !== close) {
    issues.push(cssFile + ": unbalanced rule brackets (" + open + "/" + close + ")");
  }
  if (/data:image\/(?:webp|png|jpe?g);base64,[A-Za-z0-9+/=]{1000,}/.test(source)) {
    issues.push(cssFile + ": large inline raster image must be an external asset");
  }
  if (cssFile === "style.css" && source.length > 130000) {
    issues.push("style.css: exceeded the 130 KB source-size budget");
  }
  for (const match of source.matchAll(/url\(\s*["\']?(assets\/[^"\')]+)["\']?\s*\)/g)) {
    if (!existsSync(path.join(projectRoot, match[1]))) {
      issues.push(cssFile + ": missing background asset " + match[1]);
    }
  }
  const important = count(source, /!important\b/g);
  if (important) {
    warnings.push(cssFile + ": " + important + " !important declarations to review");
  }
}

if (count(pageContents.get("index.html"), /<section\b/g) > 10) {
  issues.push("index.html: homepage has more than ten major sections");
}
for (const page of ["index.html", "metodologia.html"]) {
  const source = pageContents.get(page);
  if (count(source, /<button\b[^>]*class="method-step(?:\s|")/g) !== 5) {
    issues.push(page + ": expected five teaching stages");
  }
}
for (const unitId of ["diadema", "itavuvu", "pannunzio"]) {
  if (!idList.get("unidades.html").has(unitId)) {
    issues.push("unidades.html: missing unit #" + unitId);
  }
}

if (warnings.length) {
  console.warn("Advisories:");
  for (const warning of warnings) console.warn("  - " + warning);
}

if (issues.length) {
  console.error("QA failed with " + issues.length + " issue(s):");
  for (const issue of issues) console.error("  - " + issue);
  process.exitCode = 1;
} else {
  console.log(
    "QA passed: " + pages.length +
    " pages, internal links, assets, IDs, semantics, shared layout, CSS and JavaScript.",
  );
}
