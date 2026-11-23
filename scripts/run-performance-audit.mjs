/**
 * Local Lighthouse audits on the checked-out static site.
 * Metrics are diagnostic, not production-release scores.
 */
import { spawn } from "node:child_process";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const url = "http://127.0.0.1:4173/";
const reportDir = path.join(root, "qa-reports");
await mkdir(reportDir, { recursive: true });

function run(binary, args, timeout = 210000) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk) => { output += String(chunk); });
    child.stderr.on("data", (chunk) => { output += String(chunk); });
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Audit timed out: " + output.slice(-1500)));
    }, timeout);
    child.on("error", (error) => { clearTimeout(timer); reject(error); });
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code === 0) resolve(output);
      else reject(new Error("Audit failed (" + code + "): " + output.slice(-2400)));
    });
  });
}

const server = spawn(process.execPath, ["scripts/dev-server.mjs"], {
  cwd: root, stdio: "ignore",
});

try {
  let ready = false;
  for (let i = 0; i < 50; i++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(750) });
      if (response.ok) { ready = true; break; }
    } catch {
      // local server not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error("Local QA HTTP server did not start");

  for (const mode of ["mobile", "desktop"]) {
    const filename = path.join(reportDir, "lighthouse-" + mode + ".json");
    const args = [
      url,
      "--quiet",
      "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage",
      "--output=json",
      "--output-path=" + filename,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--max-wait-for-load=25000",
    ];
    if (mode === "desktop") args.push("--preset=desktop");
    const bin = path.join(root, "node_modules", ".bin", "lighthouse");
    await run(bin, args);
    const report = JSON.parse(await readFile(filename, "utf8"));
    const score = (key) => report.categories[key]?.score === null ||
      report.categories[key]?.score === undefined
      ? null
      : Math.round(report.categories[key].score * 100);

    console.log(JSON.stringify({
      mode,
      scores: {
        performance: score("performance"),
        accessibility: score("accessibility"),
        bestPractices: score("best-practices"),
        seo: score("seo"),
      },
      lcp: report.audits["largest-contentful-paint"]?.displayValue || null,
      cls: report.audits["cumulative-layout-shift"]?.displayValue || null,
      warning: "This is a non-indexed local preview, not a production SEO score.",
    }, null, 2));
  }
} finally {
  server.kill("SIGTERM");
}
