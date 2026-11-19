/**
 * Explicit release comparison. Vercel deployment fields must be obtained
 * from the provider; they are not inferred from the GitHub Actions outcome.
 *
 * Example (after inspecting a Vercel deployment):
 * CHROMA_DEPLOY_SHA=<provider_sha> CHROMA_DEPLOY_STATE=READY \
 * CHROMA_DEPLOY_URL=https://<preview-host> npm run verify:deployment
 *
 * This is a deterministic SHA/status comparison, not a remote health check.
 */
import { execFileSync } from "node:child_process";

function fail(message) {
  console.error("NOT HOMOLOGATED: " + message);
  process.exitCode = 1;
}

const sourceSha = execFileSync("git", ["rev-parse", "HEAD"], {
  encoding: "utf8",
}).trim();

const deployedSha = (process.env.CHROMA_DEPLOY_SHA || "").trim();
const state = (process.env.CHROMA_DEPLOY_STATE || "").trim();
const url = (process.env.CHROMA_DEPLOY_URL || "").trim();
const target = (process.env.CHROMA_DEPLOY_TARGET || "preview").trim();

if (!/^[a-f0-9]{40}$/.test(deployedSha)) {
  fail("Missing a valid 40-character deployment SHA from Vercel.");
} else if (deployedSha !== sourceSha) {
  fail("Deployment SHA differs from the checked-out Git commit. Expected " +
    sourceSha + ", found " + deployedSha + ".");
} else if (state !== "READY") {
  fail("Vercel deployment status is not READY.");
} else if (target !== "preview") {
  fail("Only preview deployments may be approved by this step.");
} else if (!/^https:\/\/[^/\s]+/.test(url)) {
  fail("An HTTPS preview URL is required.");
} else {
  console.log("SHA/status comparison approved for preview: " + deployedSha);
  console.log("URL provided for independent browser testing: " + url);
  console.log("Note: this comparison does not test the website or authenticate provider input.");
}
