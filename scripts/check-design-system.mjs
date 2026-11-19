/**
 * Verify design tokens and typography loading in every institutional page.
 * Does not prove external font availability or final visual rendering.
 */
import { readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { pages, projectRoot } from "./sync-layout.mjs";

const read = (file) => readFileSync(path.join(projectRoot, file), "utf8");
const issues = [];
const fontHref =
  "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800" +
  "&amp;family=Manrope:wght@400;500;600;700;800&amp;display=swap";
const stylesheets = [
  'href="' + fontHref + '"',
  'href="src/styles/tokens.css"',
  'href="style.css"',
  'href="v31.css"',
];
const preconnects = [
  'rel="preconnect" href="https://fonts.googleapis.com"',
  'rel="preconnect" href="https://fonts.gstatic.com" crossorigin',
];

for (const page of pages) {
  const html = read(page);
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  if (!head) {
    issues.push(page + ": missing head");
    continue;
  }
  for (const mark of preconnects) {
    if (!head.includes(mark)) {
      issues.push(page + ": missing font preconnect: " + mark);
    }
  }

  let previous = -1;
  for (const stylesheet of stylesheets) {
    const position = head.indexOf(stylesheet);
    if (position < 0) {
      issues.push(page + ": missing stylesheet " + stylesheet);
      continue;
    }
    if (position <= previous) {
      issues.push(page + ": stylesheet load order is incorrect");
    }
    if (head.indexOf(stylesheet, position + 1) >= 0) {
      issues.push(page + ": duplicate stylesheet " + stylesheet);
    }
    previous = position;
  }
}

const tokenFile = "src/styles/tokens.css";
if (!existsSync(path.join(projectRoot, tokenFile))) {
  issues.push("Missing design token file");
} else {
  const tokens = read(tokenFile);
  const required = [
    "--font-heading", "--font-body", "--sans", "--body",
    "--tracking-heading", "--leading-body",
    "--color-brand-navy", "--color-brand-primary", "--color-brand-accent",
    "--color-ink", "--chroma-yellow", "--chroma-focus",
    "--container-max", "--container-gutter", "--space-section",
  ];

  for (const key of required) {
    const declaration = new RegExp(key + "\\s*:");
    if (!declaration.test(tokens)) {
      issues.push("Missing token declaration: " + key);
    }
  }
  if (!tokens.includes("'Manrope'") || !tokens.includes("'DM Sans'")) {
    issues.push("Missing institutional font families in design tokens");
  }
  for (const file of ["style.css", "v31.css"]) {
    if (/:root\s*\{/.test(read(file))) {
      issues.push(file + ": global tokens must live in " + tokenFile);
    }
  }
}

if (issues.length) {
  console.error("Design system validation failed:");
  for (const issue of issues) console.error(" - " + issue);
  process.exitCode = 1;
} else {
  console.log("Design system OK for all " + pages.length + " pages.");
}
