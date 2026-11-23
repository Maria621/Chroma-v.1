/**
 * Institutional evidence guard: ensure illustrated visual assets do not become
 * claims of real photographs without explicit review and approved replacements.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pages, projectRoot } from "./sync-layout.mjs";

const issues = [];
const all = new Map(pages.map((p) => [
  p, readFileSync(path.join(projectRoot, p), "utf8"),
]));
const units = all.get("unidades.html");
const structure = all.get("estrutura.html");
const contents = all.get("nossa-escola.html");

for (const unit of ["diadema", "itavuvu", "pannunzio"]) {
  if (!units.includes('id="' + unit + '"')) {
    issues.push("Missing verified unit label " + unit);
  }
}
if (!units.includes("NÃO É FOTOGRAFIA DA UNIDADE")) {
  issues.push("Unit graphics must not imply documentary photography");
}
if (!structure.includes("imagem abaixo é ilustrativa")) {
  issues.push("Structure page lost explicit illustration disclosure");
}
if (!contents.includes("visuais conceituais não substituem registros históricos")) {
  issues.push("History page lost the documentary evidence warning");
}
if (!all.get("aluno-nota-10.html").includes("empresa independente")) {
  issues.push("Independently operated scholarship project attribution missing");
}
if (!existsSync(path.join(projectRoot, "MEDIA_REGISTER.md"))) {
  issues.push("Media evidence register missing");
}
if (!all.get("contato.html").includes("Instagram institucional")) {
  issues.push("Contact alternative missing while form is disabled");
}

if (issues.length) {
  console.error("Institutional credibility checks failed:\n - " + issues.join("\n - "));
  process.exitCode = 1;
} else {
  console.log("Institutional credibility QA passed: identity and evidence boundaries preserved.");
}
