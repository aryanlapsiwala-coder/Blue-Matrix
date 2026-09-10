# 🚀 KnowPass Full-Stack Deployment Guide

This guide provides end-to-end production deployment instructions for **KnowPass**:
- **Frontend**: [Vercel](https://vercel.com) (React 18 + Tailwind CSS + Vite)
- **Backend API & AI RAG Engine**: [Railway](https://railway.app) (Node.js Express + Google Gemini API)
- **Database**: [Supabase](https://supabase.com) (PostgreSQL + RLS)

---

## 1. 🌐 Frontend Deployment on Vercel

### Step 1: Push Code to GitHub
Ensure your code is committed to a GitHub repository:
```bash
git add .
git commit -m "feat: complete KnowPass full-stack platform"
git push origin main
```

### Step 2: Import Project into Vercel
1. Log into [Vercel Dashboard](https://vercel.com).
2. Click **"Add New Project"** -> Select your GitHub repository.
3. In **Framework Preset**, choose **Vite**.
4. In **Root Directory**, leave as `./` (Root).
5. Build & Output Settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Configure Environment Variables
Under **Environment Variables**, add:
```env
VITE_API_URL=https://your-backend-railway-url.up.railway.app
VITE_APP_ENV=production
```

### Step 4: Deploy
Click **"Deploy"**. Vercel will build the React application and provide an active `https://knowpass.vercel.app` URL.

---

## 2. 🚂 Backend Deployment on Railway

### Step 1: Deploy Backend Subfolder
1. Log into [Railway Dashboard](https://railway.app).
2. Click **"New Project"** -> **"Deploy from GitHub repo"**.
3. Select your repository.
4. Click on the created service card -> Go to **Settings**:
   - Set **Root Directory** to `/server`.
   - Set **Builder** to **Dockerfile** (or **Nixpacks** with Node 20).
   - Set **Start Command** to:
     ```bash
     node index.js
     ```

### Step 2: Configure Environment Variables in Railway
Under the **Variables** tab, add:
```env
PORT=5000
NODE_ENV=production
GEMINI_API_KEY=your_google_ai_studio_api_key_here
FRONTEND_URL=https://your-frontend.vercel.app
```

### Step 3: Generate Public Domain
1. In Railway Settings, scroll to **Networking** -> Click **"Generate Domain"**.
2. Copy the generated domain (e.g. `https://knowpass-backend.up.railway.app`).
3. Verify health by opening:
   👉 `https://knowpass-backend.up.railway.app/api/v1/health`

---

## 3. 🐘 PostgreSQL Database on Supabase

### Step 1: Create Supabase Project
1. Log into [Supabase Dashboard](https://supabase.com).
2. Click **"New Project"** -> Choose your region and set a database password.

### Step 2: Run SQL Schema Migrations
1. In the Supabase left sidebar, click **SQL Editor**.
2. Click **"New Query"**.
3. Open [`supabase/schema.sql`](file:///c:/SIHAnti/supabase/schema.sql) from this repository.
4. Paste the entire SQL script and click **"Run"**.
5. All tables (`profiles`, `knowledge_entries`, `entry_upvotes`, `lab_equipment`, `placement_insights`, `mentorship_sessions`) and RLS policies will be provisioned.

### Step 3: Get Connection String
1. Go to **Project Settings** -> **Database**.
2. Copy your **Connection string (URI)** and API keys for backend persistence.

---

## 4. 🔄 Full-Stack Architecture Diagram

```
[Student / Faculty / Technician Browser]
                 │
                 ▼
     [Vercel: React 18 + Tailwind]
                 │ (REST API / CORS)
                 ▼
   [Railway: Node.js Express Server]
          │                     │
          ▼                     ▼
[Supabase: PostgreSQL]   [Google Gemini 2.0 AI]
(Structured Data & RLS)   (Semantic Grounding & RAG)
```
