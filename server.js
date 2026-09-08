const { createServer } = require("http");
const { parse } = require("url");
const path = require("path");
const fs = require("fs");
const { ensureEnvFile } = require("./scripts/seed-admin");

// Load or initialize environment credentials
ensureEnvFile();

const next = require("next");
const { initDatabase } = require("./scripts/init-db");

// On production hosting (e.g. Hostinger Passenger/Node), ensure NODE_ENV defaults to production
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = "production";
}
const dev = process.env.NODE_ENV === "development";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

// Explicitly specify dir: __dirname so Next finds .next regardless of process.cwd()
const app = next({ dev, hostname, port, dir: __dirname });
const handle = app.getRequestHandler();

const MIME_MAP = {
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".otf": "font/otf",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

function tryServeStatic(req, res, targetPath, contentType) {
  try {
    if (!fs.existsSync(targetPath)) return false;
    const stat = fs.statSync(targetPath);
    if (!stat.isFile()) return false;

    res.writeHead(200, {
      "Content-Type": contentType,
      "Content-Length": stat.size,
      "Cache-Control": "public, max-age=31536000, immutable",
    });
    fs.createReadStream(targetPath).pipe(res);
    return true;
  } catch {
    return false;
  }
}

app.prepare().then(async () => {
  // Automatically ensure database schema and seed exist on startup
  try {
    await initDatabase();
  } catch (err) {
    console.warn("[Server Init] DB check notice:", err.message);
  }

  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      const pathname = parsedUrl.pathname || "/";

      // 1. Bulletproof static file serving for Next.js assets (_next/static/...)
      // Prevents reverse proxies from returning 404 HTML error pages for CSS/JS
      if (pathname.startsWith("/_next/static/")) {
        const relativeAsset = pathname.substring("/_next/static/".length);
        const diskPath = path.join(__dirname, ".next", "static", relativeAsset);
        const ext = path.extname(diskPath).toLowerCase();
        const mime = MIME_MAP[ext] || "application/octet-stream";

        if (tryServeStatic(req, res, diskPath, mime)) {
          return;
        }
      }

      // 2. Direct static delivery for /public files (logos, icons, images)
      if (pathname !== "/" && !pathname.startsWith("/api/") && !pathname.startsWith("/_next/")) {
        const publicDiskPath = path.join(__dirname, "public", pathname);
        const ext = path.extname(publicDiskPath).toLowerCase();
        if (ext && MIME_MAP[ext]) {
          if (tryServeStatic(req, res, publicDiskPath, MIME_MAP[ext])) {
            return;
          }
        }
      }

      // 3. Forward all standard pages, SSR routes, and API endpoints to Next.js
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("Internal Server Error");
    }
  })
    .once("error", (err) => {
      console.error("Server startup error:", err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Swift Ship Courier ready on http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV || "production"})`);
    });
});

