# Deploying MERN Ecommerce Store (single URL)

This app serves the React frontend and the Express API from **one** web
service, so you get a single live URL. In production, Express serves
`frontend/dist` and the React app calls the API at the same origin (`/api`).

## Option A — Render (recommended, matches repo's render.yaml)

1. Go to https://render.com and sign in with GitHub.
2. Click **New → Blueprint** and select the `JalapatiRavikumar/AI-Projects` repo.
   Render reads `render.yaml` and finds the `mern-ecommerce-store` service.
3. When prompted, fill in the environment variables (marked `sync: false`):
   - `MONGO_URI`
   - `ACCESS_TOKEN_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `UPSTASH_REDIS_URL`  (must be a `rediss://` TLS URL)
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
   - `STRIPE_SECRET_KEY`
   - `CLIENT_URL`  → set to the URL Render assigns, e.g.
     `https://mern-ecommerce-store.onrender.com`
4. Click **Apply**. Render runs:
   - Build: `npm install && npm install --prefix frontend && npm run build --prefix frontend`
   - Start: `npm start`
5. When the deploy finishes, your single live URL is shown at the top of the
   service page.

> Note: after the first deploy, update `CLIENT_URL` to the real assigned URL and
> trigger a redeploy so Stripe redirects point to the right place.

## Option B — Railway

1. https://railway.app → **New Project → Deploy from GitHub repo**.
2. Set **Root Directory** to `MERN-Ecommerce-Store`.
3. Build command:
   `npm install && npm install --prefix frontend && npm run build --prefix frontend`
4. Start command: `npm start`
5. Add the same environment variables as above. Railway provides a public URL.

## Seeding products (optional)

To populate sample products in the deployed database, run locally against the
same `MONGO_URI`:

```bash
npm run seed
```
