# 🚀 Deployment Guide — HealthMateAI

This guide walks you through deploying the HealthMateAI application to production using free-tier cloud services.

---

## 📐 Architecture Overview

```
┌──────────────┐     HTTPS     ┌──────────────┐     MongoDB     ┌──────────────┐
│   Frontend   │ ──────────▶   │   Backend    │ ──────────────▶ │  MongoDB     │
│              │   API calls   │              │   connection    │       │
│              │ ◀──────────   │              │ ◀────────────── │              │
└──────────────┘     JSON      └──────────────┘     data        └──────────────┘
   Port 443                       Port 443                        Port 27017
   Static SPA                     Node.js API                     Cloud DB
```

---

## Step 1: Database — MongoDB Atlas

### 1.1 Create a Free Cluster

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up
2. Click **"Build a Database"** → choose **M0 Free Tier**
3. Select a region close to your backend (e.g., `AWS us-east-1`)
4. Set cluster name (e.g., `healthmate-cluster`)

### 1.2 Configure Access

1. **Database Access** → Add a database user:
   - Username: `healthmate-admin`
   - Password: Generate a strong password (save it!)
   - Role: `readWriteAnyDatabase`

2. **Network Access** → Add IP Address:
   - Click **"Allow Access from Anywhere"** → `0.0.0.0/0`
   - ⚠️ For production, restrict to your backend server's IP

### 1.3 Get Connection String

1. Click **"Connect"** → **"Connect your application"**
2. Copy the connection string:
   ```
   mongodb+srv://healthmate-admin:<password>@healthmate-cluster.xxxxx.mongodb.net/health-ai?retryWrites=true&w=majority
   ```
3. Replace `<password>` with your actual password

---

## Step 2: Backend — Render

### 2.1 Prepare for Deployment

Your backend is already production-ready. Verify these in `backend/package.json`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 2.2 Deploy to Render

1. Go to [Render](https://render.com) and sign up with GitHub
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repo
4. Configure:

| Setting | Value |
|---|---|
| **Name** | `healthmate-api` |
| **Region** | Same as Atlas cluster |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | Node |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free |

5. **Environment Variables** — Add these:

| Key | Value |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `5000` |
| `MONGODB_URI` | `mongodb+srv://...` (from Step 1.3) |
| `JWT_SECRET` | A random 64-char string (use `openssl rand -hex 32`) |
| `FRONTEND_URL` | `https://your-app.vercel.app` (update after Step 3) |
| `HUGGINGFACE_API_KEY` | Your HF key *(optional)* |

6. Click **"Create Web Service"** → wait for deployment
7. Note your backend URL: `https://healthmate-api.onrender.com`

### 2.3 Verify Backend

```bash
curl https://healthmate-api.onrender.com/api/health
# Expected: {"status":"OK","message":"Server is running",...}
```

---

## Step 3: Frontend — Vercel

### 3.1 Deploy to Vercel

1. Go to [Vercel](https://vercel.com) and sign up with GitHub
2. Click **"Add New Project"** → Import your repo
3. Configure:

| Setting | Value |
|---|---|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |

4. **Environment Variables** — Add:

| Key | Value |
|---|---|
| `VITE_API_URL` | `https://healthmate-api.onrender.com/api` |

5. Click **"Deploy"**
6. Note your frontend URL: `https://your-app.vercel.app`

### 3.2 Update Backend CORS

Go back to **Render** → your backend service → **Environment** → update:

```
FRONTEND_URL=https://your-app.vercel.app
```

Click **"Save Changes"** (Render will auto-redeploy).

### 3.3 Configure SPA Routing

Create **`frontend/vercel.json`** to handle client-side routing:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Step 4: Post-Deployment Checklist

| # | Check | Status |
|---|---|---|
| 1 | Backend health endpoint responds | ☐ |
| 2 | Frontend loads without errors | ☐ |
| 3 | Registration creates a new user | ☐ |
| 4 | Login returns JWT token | ☐ |
| 5 | Prediction returns disease result | ☐ |
| 6 | Dashboard loads charts and stats | ☐ |
| 7 | PDF download works on result page | ☐ |
| 8 | 404 page renders for unknown routes | ☐ |
| 9 | CORS allows frontend → backend calls | ☐ |
| 10 | No `.env` files committed to Git | ☐ |

---

## 🔧 Alternative Deployment Options

### Backend Alternatives

<details>
<summary><b>Railway</b></summary>

1. Go to [Railway](https://railway.app) → New Project → Deploy from GitHub
2. Set **Root Directory** to `backend`
3. Add the same environment variables as Render
4. Railway auto-detects Node.js and runs `npm start`

</details>

<details>
<summary><b>Docker</b></summary>

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
EXPOSE 5000
CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t healthmate-api ./backend
docker run -p 5000:5000 --env-file backend/.env healthmate-api
```

</details>

### Frontend Alternatives

<details>
<summary><b>Netlify</b></summary>

1. Go to [Netlify](https://netlify.com) → Add new site → Import from Git
2. Set **Base directory** to `frontend`
3. **Build command**: `npm run build`
4. **Publish directory**: `frontend/dist`
5. Add `VITE_API_URL` environment variable
6. Create `frontend/public/_redirects`:
   ```
   /*  /index.html  200
   ```

</details>

<details>
<summary><b>GitHub Pages</b></summary>

Not recommended — GitHub Pages doesn't support SPA routing natively. Use Vercel or Netlify instead.

</details>

---

## 🔐 Production Security Checklist

| # | Task | Priority |
|---|---|---|
| 1 | Use HTTPS for all endpoints | 🔴 Critical |
| 2 | Set strong `JWT_SECRET` (64+ chars) | 🔴 Critical |
| 3 | Restrict MongoDB Atlas to backend IP | 🟡 High |
| 4 | Set `NODE_ENV=production` | 🟡 High |
| 5 | Enable MongoDB authentication | 🟡 High |
| 6 | Set `FRONTEND_URL` to exact production domain | 🟡 High |
| 7 | Monitor rate-limiting metrics | 🟢 Medium |
| 8 | Set up error alerting (e.g., Sentry) | 🟢 Medium |
| 9 | Enable MongoDB Atlas backups | 🟢 Medium |
| 10 | Rotate JWT secrets periodically | 🟢 Medium |

---

## 🛠️ Troubleshooting

### Common Issues

| Problem | Solution |
|---|---|
| **CORS errors** | Verify `FRONTEND_URL` matches exactly (no trailing slash) |
| **MongoDB connection fails** | Check Atlas IP whitelist includes `0.0.0.0/0` for Render |
| **Frontend shows blank page** | Ensure `vercel.json` rewrites are configured for SPA |
| **Render spins down on free tier** | First request after idle takes ~30s (cold start) |
| **Environment variables not loading** | Vite requires `VITE_` prefix; restart after changes |
| **PDF export fails** | Verify `jspdf-autotable` v5 with `applyPlugin(jsPDF)` |

### Useful Commands

```bash
# Generate a secure JWT secret
openssl rand -hex 32

# Test backend health
curl https://your-api.onrender.com/api/health

# Check frontend build locally
cd frontend && npm run build && npm run preview
```

---

<p align="center">
  <b>🎉 Your HealthMateAI application is now live!</b>
</p>
