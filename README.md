# College Website & Student Management System

A full-stack college website with public informational pages and a role-based
admin system for managing student records.

## 🔗 Live

- **Website:** https://college-website-frontend-tau.vercel.app
- **Backend API:** https://college-website-backend-cyan.vercel.app
- **Database:** Neon Postgres (persistent, serverless)

## 🔑 Demo Admin Logins

| Role | Username | Password | Can do |
|---|---|---|---|
| Super Admin | `admin` | `admin123` | Everything, incl. managing other admin accounts |
| Registrar | `registrar` | `registrar123` | Full student record CRUD, view contact messages |
| Exam Cell | `examcell` | `exam123` | Update attendance/CGPA/status only |

> ⚠️ Change or remove these before sharing the site widely — log in as Super
> Admin → "Manage Admins" → create a new account → delete the defaults.

## 🗂️ Structure

```
college-website/
├── backend/     Node + Express API (Postgres via `DATABASE_URL`, falls back to local SQLite in dev)
│   ├── api/       Vercel serverless entry point
│   ├── routes/    auth, students, courses/faculty/contact
│   └── server.js  Traditional Node entry point (Render/Railway/VPS)
├── frontend/    React (Vite) site — public pages + admin dashboard
└── DEPLOYMENT.md  Full deployment guide
```

## ✨ Features

**Public site:** Home, About, Courses, Admissions, Faculty, Students overview, Contact form.

**Admin dashboard** (`/admin`): search/filter students, full CRUD (role-permitted),
contact message inbox, and admin account management — all enforced server-side
via JWT + role checks, not just hidden in the UI.

## 🛠️ Local development

```bash
# Backend
cd backend && npm install && npm start      # http://localhost:4000 (SQLite by default)

# Frontend
cd frontend && npm install && npm run dev   # http://localhost:5173 (proxies /api to backend)
```

Set `DATABASE_URL` as an env var on the backend to use Postgres instead of
local SQLite. See `backend/.env.example` and `frontend/.env.example`.

See `DEPLOYMENT.md` for full deployment instructions (Vercel + Neon, or
traditional Node hosting).
