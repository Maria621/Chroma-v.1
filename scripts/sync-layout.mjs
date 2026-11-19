/**
 * Instituto Chroma — single source of truth for the shared page shell.
 *
 * The public site remains ordinary static HTML, without a runtime dependency.
 * Edit src/partials/*, then run: node scripts/sync-layout.mjs --write
 * CI/QA runs with --check and reports drift instead of silently rewriting files.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
export const pages = [
  "index.html",
  "nossa-escola.html",
  "nossa-essencia.html",
  "metodologia.html",
  "estrutura.html",
  "experiencia-chroma.html",
  "unidades.html",
  "novidades.html",
  "contato.html",
  "parcerias.html",
  "aluno-nota-10.html",
  "privacidade.html",
];

const institutionPages = new Set([
  "nossa-escola.html",
  "nossa-essencia.html",
  "estrutura.html",
  "aluno-nota-10.html",
  "parcerias.html",
]);

const read = (relativePath) =>
  readFileSync(path.join(projectRoot, relativePath), "utf8");

const headerTemplate = read("src/partials/header.html").trim();
const footerTemplate = read("src/partials/footer.html").trim();

function replaceRequired(source, before, after, label) {
  if (!source.includes(before)) {
    throw new Error("Missing expected markup in " + label + ": " + before);
  }
  return source.replace(before, after);
}

export function renderHeader(page) {
  let result = headerTemplate;

  if (page === "index.html") {
    result = replaceRequired(
      result,
      "site-header header-solid chroma-header-v31",
      "site-header chroma-header-v31",
      page,
    );
    result = replaceRequired(
      result,
      'class="brand brand-official"',
      'class="brand brand-official brand-light"',
      page,
    );
    result = replaceRequired(
      result,
      "logo-instituto-chroma.png",
      "logo-instituto-chroma-branco.png",
      page,
    );
  }

  if (institutionPages.has(page)) {
    result = replaceRequired(
      result,
      'aria-controls="institutional-panel"',
      'aria-controls="institutional-panel" data-current="true"',
      page,
    );
  }

  if (!["privacidade.html", "contato.html"].includes(page)) {
    const anchor = '<a href="' + page + '">';
    if (result.includes(anchor)) {
      result = result.replaceAll(
        anchor,
        '<a href="' + page + '" aria-current="page">',
      );
    }
  }

  if (page === "contato.html") {
    result = replaceRequired(
      result,
      '<a class="header-cta" href="contato.html">',
      '<a class="header-cta" href="contato.html" aria-current="page">',
      page,
    );
  }

  return result;
}

export function renderFooter(page) {
  return page === "index.html"
    ? replaceRequired(
        footerTemplate,
        'href="#header"',
        'href="#inicio"',
        page,
      )
    : footerTemplate;
}

function extractElement(source, tag, page) {
  const expression = new RegExp("<" + tag + "\\b[\\s\\S]*?<\\/" + tag + ">");
  const match = source.match(expression);
  if (!match) {
    throw new Error("Missing <" + tag + "> in " + page);
  }
  return match[0];
}

export function normalizeMarkup(markup) {
  // Normalize formatting only; do not discard tag attributes or textual content.
  return markup.replace(/\s+/g, " ").trim();
}

export function checkSharedLayout({ write = false } = {}) {
  const mismatches = [];

  for (const page of pages) {
    const filePath = path.join(projectRoot, page);
    let source = read(page);
    const expectedHeader = renderHeader(page);
    const expectedFooter = renderFooter(page);

    for (const [tag, expected] of [
      ["header", expectedHeader],
      ["footer", expectedFooter],
    ]) {
      const current = extractElement(source, tag, page);
      if (normalizeMarkup(current) === normalizeMarkup(expected)) {
        continue;
      }

      if (!write) {
        mismatches.push(page + ": shared <" + tag + "> is out of sync");
        continue;
      }

      source = source.replace(current, expected);
    }

    if (write) {
      writeFileSync(filePath, source, "utf8");
    }
  }

  return mismatches;
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const write = process.argv.includes("--write");
  const mismatches = checkSharedLayout({ write });

  if (mismatches.length) {
    console.error(mismatches.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(
      write
        ? "Shared header/footer synchronized across " + pages.length + " pages."
        : "Shared header/footer consistent across " + pages.length + " pages.",
    );
  }
}
