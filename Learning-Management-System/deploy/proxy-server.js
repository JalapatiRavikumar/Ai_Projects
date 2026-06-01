/**
 * Zero-dependency single-origin server for the LMS.
 *
 * - Serves the React production build (frontend/build) as static files.
 * - Falls back to index.html for client-side (SPA) routes.
 * - Proxies every /api/* request to the Spring Boot backend.
 *
 * This means the whole app (UI + API) is reachable from ONE origin / ONE port,
 * so it can be exposed with a single tunnel and the frontend never needs a
 * rebuild when the public URL changes (it calls the API with relative paths).
 *
 * Usage:  node proxy-server.js
 * Env:    PORT (default 5000), BACKEND (default http://localhost:8080)
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const PORT = process.env.PORT || 5000;
const BACKEND = process.env.BACKEND || "http://localhost:8080";
const BUILD_DIR = path.resolve(__dirname, "..", "frontend", "build");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".map": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not found");
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(data);
  });
}

function proxy(req, res) {
  const backendUrl = new URL(req.url, BACKEND);
  const isHttps = backendUrl.protocol === "https:";
  const mod = isHttps ? require("https") : http;

  const headers = { ...req.headers };
  headers.host = backendUrl.host;

  const options = {
    protocol: backendUrl.protocol,
    hostname: backendUrl.hostname,
    port: backendUrl.port || (isHttps ? 443 : 80),
    path: backendUrl.pathname + backendUrl.search,
    method: req.method,
    headers,
  };

  const proxyReq = mod.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (e) => {
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad gateway", message: e.message }));
  });

  req.pipe(proxyReq, { end: true });
}

const server = http.createServer((req, res) => {
  // API + auth + docs go to the backend.
  if (
    req.url.startsWith("/api/") ||
    req.url.startsWith("/swagger-ui") ||
    req.url.startsWith("/v3/api-docs")
  ) {
    return proxy(req, res);
  }

  // Static assets / SPA fallback.
  const urlPath = decodeURIComponent(req.url.split("?")[0]);
  let filePath = path.join(BUILD_DIR, urlPath);

  // Prevent path traversal outside the build dir.
  if (!filePath.startsWith(BUILD_DIR)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }

  fs.stat(filePath, (err, stat) => {
    if (!err && stat.isFile()) {
      return sendFile(res, filePath);
    }
    // No matching file -> serve index.html so React Router can handle the route.
    sendFile(res, path.join(BUILD_DIR, "index.html"));
  });
});

server.listen(PORT, () => {
  console.log(`Single-origin server running on http://localhost:${PORT}`);
  console.log(`Serving build from: ${BUILD_DIR}`);
  console.log(`Proxying /api -> ${BACKEND}`);
});
