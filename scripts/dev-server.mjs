/**
 * Isolated local static server for Playwright QA. No external dependencies.
 * Never use as a production host or expose secret files.
 */
import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const host = "127.0.0.1";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://" + host);
    const pathname = decodeURIComponent(url.pathname);
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405).end();
      return;
    }
    if (pathname.startsWith("/api/") || pathname.includes("\0")) {
      response.writeHead(404).end();
      return;
    }

    const candidate = path.resolve(root, "." + (pathname === "/" ? "/index.html" : pathname));
    if (!candidate.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }

    const extension = path.extname(candidate).toLowerCase();
    if (!(extension in mime) || candidate.includes(path.sep + "node_modules" + path.sep)) {
      response.writeHead(404).end();
      return;
    }

    const file = await stat(candidate);
    if (!file.isFile()) {
      response.writeHead(404).end();
      return;
    }
    response.setHeader("Content-Type", mime[extension]);
    response.setHeader("Cache-Control", "no-store");
    const data = await readFile(candidate);
    response.writeHead(200);
    response.end(request.method === "HEAD" ? undefined : data);
  } catch {
    response.writeHead(404).end();
  }
});

server.listen(port, host, () => {
  console.log("Chroma QA server running at http://" + host + ":" + port);
});
