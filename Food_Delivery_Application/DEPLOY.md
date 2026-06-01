# Deploy — three separate live URLs

You will get **three different URLs**:

| App | Example host | What you set |
|-----|----------------|--------------|
| **Backend API** | `https://food-delivery-api.onrender.com` | Render Web Service |
| **Customer frontend** | `https://food-frontend.vercel.app` | Vercel or Netlify |
| **Admin panel** | `https://food-admin.vercel.app` | Vercel or Netlify (second site) |

You **cannot** get permanent `https://…` links without connecting **your** Render / Vercel / Netlify account once. The repo includes `render.yaml` and `netlify.toml` so setup is mostly point-and-click.

---

## A) Backend (Render) — API URL

1. Go to [render.com](https://render.com) → sign in with GitHub.
2. **New** → **Blueprint** → pick repo `JalapatiRavikumar/Ai_Projects`.
3. Select **`render.yaml`** at the repo root → apply.  
   Or **New** → **Web Service** → same repo → set **Root Directory** to:  
   `Food_devlivary_Application-main/Food_devlivary_Application-main/backend`
4. **Build:** `npm install` · **Start:** `npm start`
5. In **Environment**, add (names must match exactly):

| Name | Value |
|------|--------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random string |
| `STRIPE_SECRET_KEY` | `sk_test_…` (needed for paid checkout) |
| `FRONTEND_URL` | Your frontend URL (step B), no trailing `/` |
| `ADMIN_URL` | Your admin URL (step C), no trailing `/` |
| `PUBLIC_API_URL` | Your Render service URL, e.g. `https://food-delivery-api.onrender.com` (no trailing `/`) |

6. **Save** → wait for **Live**. Copy that URL → **this is your backend URL.**  
   Test: open `YOUR_BACKEND_URL/api/health` → should show JSON `{"ok":true,...}`.

---

## B) Frontend (Vercel) — customer app URL

1. [vercel.com](https://vercel.com) → **Add New** → **Project** → import `Ai_Projects`.
2. **Root Directory:** `Food_devlivary_Application-main/Food_devlivary_Application-main/frontend`
3. **Framework Preset:** Vite  
4. **Environment Variables** (Production + Preview):

| Name | Value |
|------|--------|
| `VITE_API_URL` | Same as backend URL, e.g. `https://food-delivery-api.onrender.com` (no trailing `/`) |

5. Deploy → copy **Production** URL → put it in Render as `FRONTEND_URL` → **Manual Deploy** the Render service again so the hub page and Stripe redirects use it.

---

## C) Admin (Vercel) — admin URL

Same as B, but **Root Directory:**  
`Food_devlivary_Application-main/Food_devlivary_Application-main/admin`

Set **`VITE_API_URL`** to the **same backend URL** as the frontend.

Copy the admin **Production** URL → Render → `ADMIN_URL` → redeploy backend.

---

## Optional: Netlify instead of Vercel

For each of **frontend** and **admin**:

1. [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**.
2. Base directory: `Food_devlivary_Application-main/Food_devlivary_Application-main/frontend` (or `…/admin`).
3. Build: `npm run build`, publish: `dist` (already in `netlify.toml`).
4. **Site settings → Environment variables:** add `VITE_API_URL` = your Render backend URL.

---

## Hub page (all links on one screen)

After `FRONTEND_URL` and `ADMIN_URL` are set on Render, open your **backend base URL** in a browser (e.g. `https://food-delivery-api.onrender.com/`). It lists frontend, admin, and API health.

---

## Local

Copy each `**/.env.example` to `**/.env` and fill values. Backend: `npm start`. Frontend: `npm run dev`. Admin: `npm run dev -- --port 5174`.

---

## CORS note

The API allows the browser **`token`** header on login/cart/order routes. If you lock CORS to specific domains only, set `CORS_STRICT=1` and `FRONTEND_URL`, `ADMIN_URL`, and optional `CORS_EXTRA_ORIGINS` (comma-separated) on Render.
