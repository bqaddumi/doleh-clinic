# Physiotherapy Clinic Management System

Production-ready internal clinic management system for doctors and admins to manage patients and physiotherapy reports.

## Tech Stack

- Frontend: React, TypeScript, Material UI, TanStack Router, React Query, Axios
- Backend: Node.js, Express, JWT, Zod, local JSON datastore for local development

## Project Structure

```text
.
├── backend
│   ├── package.json
│   └── src
├── frontend
│   ├── package.json
│   └── src
├── package.json
└── README.md
```

## Setup

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Copy the example files and adjust values if needed:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Seed demo data

This creates the hardcoded admin user and sample patients/reports.

```bash
pnpm --filter physio-clinic-backend seed
```

Default admin credentials:

- Email: `admin@clinic.local`
- Password: `Admin123!`

### 4. Run the app

```bash
pnpm dev
```

Frontend: [http://localhost:5173](http://localhost:5173)

Backend: [http://localhost:5000](http://localhost:5000)

## Available Scripts

```bash
pnpm dev
pnpm --filter physio-clinic-frontend build
pnpm --filter physio-clinic-backend seed
```

## Deployment

### Prepared Free Hosting Setup

- Backend: Render
- Frontend: Vercel

Files added for deployment:

- [render.yaml](/Users/basharqaddumi/Documents/New%20project/render.yaml)
- [frontend/vercel.json](/Users/basharqaddumi/Documents/New%20project/frontend/vercel.json)
- [frontend/.env.production.example](/Users/basharqaddumi/Documents/New%20project/frontend/.env.production.example)

### Deploy Backend on Render

1. Push the project to GitHub.
2. Create a new Render Web Service from the repo.
3. Render will detect [render.yaml](/Users/basharqaddumi/Documents/New%20project/render.yaml).
4. After deployment, copy the backend URL.

Set this environment variable in Render after you know your frontend URL:

```text
CLIENT_URL=https://your-vercel-app.vercel.app
```

### Deploy Frontend on Vercel

1. Import the same repo into Vercel.
2. Set the root directory to `frontend`.
3. Add this environment variable in Vercel:

```text
VITE_API_URL=https://your-render-backend-url.onrender.com/api
```

Reference file:

- [frontend/.env.production.example](/Users/basharqaddumi/Documents/New%20project/frontend/.env.production.example)

### Important Limitation

The backend currently stores data in:

- [backend/src/data/db.json](/Users/basharqaddumi/Documents/New%20project/backend/src/data/db.json)

This is suitable for demo/testing deployments only. Free hosts do not guarantee durable local filesystem storage, so data may reset after restarts or redeploys.

## API Summary

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Dashboard

- `GET /api/dashboard/stats`

### Patients

- `GET /api/patients`
- `POST /api/patients`
- `GET /api/patients/:id`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`

### Reports

- `GET /api/reports`
- `POST /api/reports`
- `GET /api/reports/:id`
- `PUT /api/reports/:id`
- `DELETE /api/reports/:id`

## Notes

- All API routes except login are protected with JWT authentication.
- Passwords are hashed with bcrypt.
- Validation is handled with Zod on create/update/login requests.
- The frontend stores the JWT in local storage for local development simplicity.
- Backend data is stored in [backend/src/data/db.json](/Users/basharqaddumi/Documents/New%20project/backend/src/data/db.json), so no MongoDB service is required right now.
