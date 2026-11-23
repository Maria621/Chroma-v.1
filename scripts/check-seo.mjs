/**
 * Prelaunch SEO guard — do not lift noindex or fabricate a canonical origin.
 * Callers must explicitly configure an approved production domain for release.
 */
import { readFileSync } from "node:fs";
import { pages, projectRoot } from "./sync-layout.mjs";
import path from "node:path";

const issues = [];
for (const page of pages) {
  const html = readFileSync(path.join(projectRoot, page), "utf8");
  const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1];
  if (!head) {
    issues.push(page + ": missing head");
    continue;
  }
  const title = head.match(/<title>([^<]+)<\/title>/)?.[1];
  const desc = head.match(/<meta name="description" content="([^"]+)"/)?.[1];
  const ogTitle = head.match(/<meta property="og:title" content="([^"]+)"/)?.[1];
  const ogDesc = head.match(/<meta property="og:description" content="([^"]+)"/)?.[1];
  if (!title || !desc || !ogTitle || !ogDesc) {
    issues.push(page + ": title, description or social metadata missing");
  } else if (ogTitle !== title || ogDesc !== desc) {
    issues.push(page + ": Open Graph fields differ from editorial metadata");
  }
  for (const marker of [
    'property="og:locale" content="pt_BR"',
    'property="og:site_name" content="Instituto Chroma"',
    'property="og:type" content="website"',
    'name="twitter:card" content="summary"',
    'name="robots" content="noindex,nofollow"',
  ]) {
    if (!head.includes(marker)) issues.push(page + ": missing " + marker);
  }
  if (/rel="canonical"/i.test(head)) {
    issues.push(page + ": production canonical URL cannot be assumed in preview");
  }
}

if (issues.length) {
  console.error("SEO preview QA failed:\n - " + issues.join("\n - "));
  process.exitCode = 1;
} else {
  console.log("SEO preview QA passed: 12 pages with consistent social metadata and noindex.");
}
