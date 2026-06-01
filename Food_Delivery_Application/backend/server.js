import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRouter from "./routes/foodRoute.js";
import userRouter from "./routes/userRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";

const app = express();
app.set("trust proxy", 1);

const port = Number(process.env.PORT) || 4000;

// Allow deployed frontend + admin on any host (Vercel/Netlify). Custom header `token`
// must be listed or browsers block API calls after preflight.
const corsOrigins = [process.env.FRONTEND_URL, process.env.ADMIN_URL]
  .concat((process.env.CORS_EXTRA_ORIGINS || "").split(",").map((s) => s.trim()))
  .filter(Boolean);
const corsOptions =
  process.env.CORS_STRICT === "1" && corsOrigins.length > 0
    ? { origin: corsOrigins, credentials: false, allowedHeaders: ["Content-Type", "token"] }
    : {
        origin: true,
        credentials: false,
        allowedHeaders: ["Content-Type", "token"],
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      };
app.use(cors(corsOptions));
app.use(express.json());

connectDB().catch((err) => {
  console.error("Failed to connect to database:", err.message);
});

app.use("/api/food", foodRouter);
app.use("/images", express.static("uploads"));
app.use("/api/user", userRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "food-delivery-api" });
});

function publicApiBase(req) {
  if (process.env.PUBLIC_API_URL) {
    return process.env.PUBLIC_API_URL.replace(/\/$/, "");
  }
  const proto = req.headers["x-forwarded-proto"] || req.protocol;
  const host = req.headers["x-forwarded-host"] || req.get("host");
  return `${proto}://${host}`;
}

function deploymentHubHtml(req) {
  const api = publicApiBase(req);
  const frontend = process.env.FRONTEND_URL || "";
  const admin = process.env.ADMIN_URL || "";
  const missing = [];
  if (!frontend) missing.push("FRONTEND_URL");
  if (!admin) missing.push("ADMIN_URL");

  const hint =
    missing.length > 0
      ? `<p class="hint">Set these on your host (e.g. Render) and redeploy: <code>${missing.join(
          ", "
        )}</code>. Until then, use the API link and open frontend/admin from your own preview URLs.</p>`
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Food delivery — deployment hub</title>
  <style>
    :root { font-family: system-ui, sans-serif; background: #0f1419; color: #e7ecf3; }
    body { max-width: 42rem; margin: 2rem auto; padding: 0 1rem; line-height: 1.5; }
    h1 { font-size: 1.35rem; font-weight: 600; }
    p { color: #a8b3c4; }
    .hint { background: #1a2332; padding: 0.75rem 1rem; border-radius: 8px; font-size: 0.9rem; }
    code { background: #1a2332; padding: 0.1rem 0.35rem; border-radius: 4px; }
    ul { list-style: none; padding: 0; margin: 1.5rem 0; }
    li { margin: 0.75rem 0; }
    a.card {
      display: block; text-decoration: none; color: inherit;
      background: #1a2332; border: 1px solid #2d3a4d; border-radius: 10px;
      padding: 1rem 1.1rem; transition: border-color 0.15s, background 0.15s;
    }
    a.card:hover { border-color: #4d8af0; background: #1e2a3d; }
    .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.06em; color: #7d8da3; }
    .url { color: #6eb3f7; word-break: break-all; font-size: 0.95rem; margin-top: 0.25rem; }
    .disabled { opacity: 0.45; pointer-events: none; }
  </style>
</head>
<body>
  <h1>Food delivery app — live links</h1>
  <p>Open any app below. This page is served by your <strong>backend</strong>; bookmark this URL as your single entry point.</p>
  ${hint}
  <ul>
    <li>
      <a class="card ${frontend ? "" : "disabled"}" href="${frontend || "#"}" target="_blank" rel="noopener">
        <div class="label">Customer frontend</div>
        <div class="url">${frontend || "(set FRONTEND_URL)"}</div>
      </a>
    </li>
    <li>
      <a class="card ${admin ? "" : "disabled"}" href="${admin || "#"}" target="_blank" rel="noopener">
        <div class="label">Admin panel</div>
        <div class="url">${admin || "(set ADMIN_URL)"}</div>
      </a>
    </li>
    <li>
      <a class="card" href="${api}/api/health" target="_blank" rel="noopener">
        <div class="label">Backend API (health)</div>
        <div class="url">${api}/api/health</div>
      </a>
    </li>
  </ul>
  <p style="font-size:0.85rem;color:#6b7a90">JSON health: <a href="${api}/api/health" style="color:#6eb3f7">${api}/api/health</a></p>
</body>
</html>`;
}

app.get("/", (req, res) => {
  res.type("html").send(deploymentHubHtml(req));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
