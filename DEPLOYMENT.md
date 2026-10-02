# Deploying the College Website

Architecture:
- **frontend/** — React (Vite) static site, deployed as a Vercel project
- **backend/** — Node/Express API, deployed as a Vercel serverless project (see `backend/api/index.js` + `backend/vercel.json`)
- **Database** — Postgres (e.g. [Neon](https://neon.tech), free tier) instead of the local SQLite file, so data survives redeploys. Controlled entirely by the `DATABASE_URL` env var — if it's unset, the backend automatically falls back to local SQLite (handy for local dev).

This keeps everything on free tiers and avoids needing a persistent server.

---

## 1. Create a Postgres database (Neon, free)

1. Go to https://neon.tech and sign up (no credit card needed).
2. Create a new Project (any name/region).
3. On the project dashboard, copy the **connection string** — it looks like:
   `postgresql://user:password@ep-xxxx.region.aws.neon.tech/dbname?sslmode=require`
4. That's your `DATABASE_URL`. The backend will auto-create its tables and seed
   demo data (courses, faculty, students, admin accounts) the first time it runs.

## 2. Push the code to GitHub (optional but recommended)

```bash
cd college-website
git init && git add . && git commit -m "Initial college website"
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

(This step is just for version control/backup — the Vercel deploys below don't
require GitHub at all, since we deploy directly from the local folders via CLI.)

## 3. Deploy the backend to Vercel

```bash
cd backend
npm i -g vercel          # if not already installed
vercel login             # or use --token=<VERCEL_TOKEN> on every command
vercel link               # creates/links a Vercel project for this folder
vercel env add DATABASE_URL production      # paste your Neon connection string
vercel env add JWT_SECRET production        # paste a long random string
vercel env add FRONTEND_URL production      # fill in after step 4, then redeploy
vercel --prod
```

Note the deployment URL Vercel gives you, e.g. `https://college-backend.vercel.app`.

## 4. Deploy the frontend to Vercel

```bash
cd ../frontend
vercel link
vercel env add VITE_API_URL production      # the backend URL from step 3, no trailing slash
vercel --prod
```

Note the deployment URL, e.g. `https://college-website.vercel.app`.

## 5. Close the loop

Go back and set `FRONTEND_URL` on the **backend** project to your frontend's
URL from step 4, then redeploy the backend (`vercel --prod` again) so CORS
only allows your live frontend.

---

## Verify

Visit your frontend URL. Public pages should load, and `/admin/login` should
work with the seeded demo accounts:

| Role        | Username   | Password      |
|-------------|------------|---------------|
| Super Admin | admin      | admin123      |
| Registrar   | registrar  | registrar123  |
| Exam Cell   | examcell   | exam123       |

**Change these before sharing the site publicly** — log in as Super Admin,
create a new admin account from "Manage Admins", then delete the default ones.

---

## Alternative: traditional Node hosting (Render/Railway/a VPS)

The backend also runs as a normal long-lived Node server — just run
`npm start` (= `node server.js`), set the same `DATABASE_URL`/`JWT_SECRET`/
`FRONTEND_URL` env vars, and point your host at `backend/` as the root
directory, build command `npm install`, start command `npm start`.
