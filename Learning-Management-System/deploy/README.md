# Deployment Guide

This folder contains everything needed to push the project to GitHub and deploy it live.

## 1. Push to GitHub

From the project root, run:

```powershell
powershell -ExecutionPolicy Bypass -File deploy/push-to-github.ps1
```

This initializes git in the project folder, sets the remote to
`https://github.com/JalapatiRavikumar/AI-Projects.git`, commits, and pushes to `main`.

> You must be authenticated to GitHub. When the push runs, a browser/credential
> prompt appears. Alternatively create a Personal Access Token and use it as the
> password when prompted.

## 2. Run the whole stack locally with Docker (one command)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8080
- Default admin: admin@gmail.com / admin123

## 3. Deploy live (free options)

The app has three parts: a MySQL database, the Spring Boot backend, and the React frontend.

### Database (MySQL) — pick one free host
- Railway: https://railway.app  (MySQL plugin)
- Aiven:   https://aiven.io     (free MySQL)
- PlanetScale: https://planetscale.com

Copy the connection details. You will get a JDBC URL like:
`jdbc:mysql://HOST:PORT/lms?sslMode=REQUIRED`

### Backend (Spring Boot) on Render
1. https://dashboard.render.com -> New -> Web Service -> connect your GitHub repo.
2. Root directory: `backend`. Render auto-detects the Dockerfile.
3. Add environment variables:
   - `DB_URL`   = your MySQL JDBC URL
   - `DB_USERNAME` = your DB user
   - `DB_PASSWORD` = your DB password
   - `JWT_SECRET`  = any long random string
   - `ADMIN_EMAIL` = admin@gmail.com
   - `ADMIN_PASSWORD` = admin123
4. Deploy. Note the backend URL, e.g. `https://lms-backend.onrender.com`.

(Or use `deploy/render.yaml` as a Blueprint to provision both services at once.)

### Frontend (React) on Vercel
1. https://vercel.com -> New Project -> import your GitHub repo.
2. Root directory: `frontend`.
3. Add environment variable:
   - `REACT_APP_API_BASE_URL` = your backend URL from the previous step
4. Deploy. Vercel gives you the live URL, e.g. `https://ai-projects-lms.vercel.app`.

### Final step
On the backend host, make sure CORS allows your frontend domain. This project
already allows any `localhost` port; for production add your Vercel domain in
`backend/src/main/java/com/lms/dev/config/WebSecurityConfig.java`
(`setAllowedOriginPatterns`).

## Live URL

After step 3, your live working URL is the Vercel URL of the frontend.
Paste it here once deployed:

```
LIVE URL: https://__________________.vercel.app
```
