/**
 * Preview safety gate. This script only reads HTML and never modifies files.
 * Preview pages must remain excluded from search indexing until release.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { pages, projectRoot } from "./sync-layout.mjs";

const failures = [];

for (const page of pages) {
  const html = readFileSync(path.join(projectRoot, page), "utf8");
  const robots = html.match(/<meta\s+name="robots"\s+content="([^"]+)"\s*\/?>/i);

  if (!robots) {
    failures.push(page + ": missing robots meta tag");
    continue;
  }

  const directives = robots[1].split(",").map((entry) => entry.trim().toLowerCase());
  if (!directives.includes("noindex") || !directives.includes("nofollow")) {
    failures.push(page + ": preview must remain noindex,nofollow");
  }
}

if (failures.length) {
  console.error("Preview safety failed:\n- " + failures.join("\n- "));
  process.exitCode = 1;
} else {
  console.log("Preview safety OK: all " + pages.length + " pages are noindex,nofollow.");
}
