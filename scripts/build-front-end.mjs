/**
 * Instituto Chroma: deterministically assemble browser-ready CSS/JS.
 *
 * Design goal: keep the existing static HTML and the exact CSS cascade.
 * CSS source chunks are concatenated byte-for-byte in original order.
 * JavaScript features live in independent IIFEs and are bundled in stable order.
 *
 * Usage:
 *   npm run build:assets  # regenerate output files
 *   npm run check:assets  # fail when generated output is out of sync
 *
 * No external packages, network calls, frameworks or browser-time imports.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sources } from "../scripts/front-end-manifest.mjs";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));


const read = (name) => readFileSync(path.join(root, name), "utf8");
const isJavaScript = (name) => name.endsWith(".js");

export function assemble(name) {
  const parts = sources[name];
  if (!parts) throw new Error("Unknown output: " + name);
  const contents = parts.map(read);
  if (!isJavaScript(name)) return contents.join("");
  return contents.map((content) => content.trimEnd()).join("\n") + "\n";
}

export function verifyBundles({ write = false } = {}) {
  const drift = [];
  for (const name of Object.keys(sources)) {
    const content = assemble(name);
    if (read(name) === content) continue;
    if (write) {
      writeFileSync(path.join(root, name), content, "utf8");
    } else {
      drift.push(name);
    }
  }
  return drift;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const write = process.argv.includes("--write");
  const drift = verifyBundles({ write });
  if (drift.length) {
    console.error("Generated bundles out of sync: " + drift.join(", "));
    console.error("Run npm run build:assets and commit the resulting files.");
    process.exitCode = 1;
  } else {
    console.log(write
      ? "Front-end bundles regenerated from modular source."
      : "All generated CSS/JS bundles match their modular source.");
  }
}
