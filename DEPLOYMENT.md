# Deployment Guide — GitHub + Vercel

This project is a pnpm monorepo with:
- **Frontend**: React + Vite (`artifacts/x-checker/`)
- **API**: Vercel Serverless Functions (`api/`) — no separate server needed on Vercel

---

## Step 1 — Push to GitHub

### Option A: Replit Shell (recommended)

Open the **Shell** tab in Replit and run these commands one at a time:

```bash
# 1. Set your Git identity (first time only)
git config user.email "you@example.com"
git config user.name "Your Name"

# 2. Create a repo on github.com first, then add it as remote:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 3. Push everything
git add -A
git commit -m "Initial deployment setup"
git push -u origin main
```

> **Tip:** If GitHub asks for a password, use a **Personal Access Token** (not your GitHub password).  
> Generate one at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)  
> Scopes needed: `repo`

### Option B: Replit GitHub Integration

1. In Replit, click **Version Control** (the branch icon in the sidebar)
2. Click **Connect to GitHub**
3. Authorize Replit and select or create a repo
4. Click **Push** to upload your code

---

## Step 2 — Deploy on Vercel

### 2a. Import the project

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Click **Import Git Repository** → select your GitHub repo
3. Vercel will detect the `vercel.json` automatically

### 2b. Configure the project

Vercel will pre-fill these from `vercel.json` — **no changes needed**:

| Setting | Value |
|---|---|
| Framework Preset | Other |
| Build Command | `pnpm install && pnpm --filter @workspace/x-checker run build` |
| Output Directory | `artifacts/x-checker/dist/public` |
| Install Command | `pnpm install` |

### 2c. Environment variables (optional)

In Vercel → Project Settings → Environment Variables, you can add:

| Variable | Value | Required? |
|---|---|---|
| `TWITTER_BEARER_TOKEN` | Your token from developer.twitter.com | No — public fallback is built-in |

> **GA4 & AdSense:** These are configured directly in source files (not env vars):
> - GA4: edit `artifacts/x-checker/src/lib/analytics.ts`, replace `G-XXXXXXXXXX`
> - AdSense: edit `artifacts/x-checker/index.html`, replace `ca-pub-XXXXXXXXXXXXXXXXX`

### 2d. Deploy

Click **Deploy**. Vercel will:
1. Install dependencies with pnpm
2. Build the React + Vite frontend
3. Bundle the `api/` TypeScript files as serverless functions
4. Deploy everything to a `.vercel.app` domain

---

## How it works on Vercel

```
your-app.vercel.app
  ├── /              → React SPA (static files)
  ├── /tools/*       → React SPA (client-side routing)
  ├── /pricing       → React SPA (client-side routing)
  ├── /api/check-accounts  → Vercel Serverless Function
  └── /api/healthz         → Vercel Serverless Function
```

The frontend calls `/api/check-accounts` as a relative URL — no CORS issues, no separate server needed.

---

## Continuous deployment

Once connected, every push to `main` on GitHub automatically triggers a new Vercel deployment. No extra setup needed.

---

## Local development (Replit)

Everything still works on Replit as before:
```bash
# Frontend
PORT=5000 BASE_PATH=/ pnpm --filter @workspace/x-checker run dev

# API server (Express, for local dev)
PORT=8080 pnpm --filter @workspace/api-server run dev
```

---

## Custom domain

1. Vercel → Project → Settings → Domains
2. Add your domain (e.g., `xtoolkit.io`)
3. Update your DNS to point to Vercel's nameservers or add a CNAME
4. Vercel handles TLS automatically

---

## Checklist before going live

- [ ] Replace `G-XXXXXXXXXX` in `src/lib/analytics.ts` with your real GA4 Measurement ID
- [ ] Replace `ca-pub-XXXXXXXXXXXXXXXXX` in `index.html` with your real AdSense publisher ID
- [ ] Add real affiliate links in `src/components/monetization/AffiliateSection.tsx`
- [ ] Set a real privacy policy URL/contact email in the Privacy and Terms pages
- [ ] Test the account checker on the live Vercel URL
- [ ] Submit `sitemap.xml` to Google Search Console
