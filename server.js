const { createServer } = require("http");
const { parse } = require("url");
const { ensureEnvFile } = require("./scripts/seed-admin");

// Load or initialize environment credentials
ensureEnvFile();

const next = require("next");
const { initDatabase } = require("./scripts/init-db");

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "0.0.0.0";
const port = parseInt(process.env.PORT, 10) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

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
      console.log(`> Swift Ship Courier ready on http://${hostname}:${port} (NODE_ENV=${process.env.NODE_ENV || "development"})`);
    });
});
