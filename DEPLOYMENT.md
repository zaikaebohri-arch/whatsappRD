# Deployment Guide (Render.com)

Since your project now has two parts (the **Bot** and the **Dashboard**), you should deploy them as two separate services on Render.

---

## Part 1: Deploy the WhatsApp Bot (Backend)

1.  **Create a New Web Service** on Render.
2.  **Connect your GitHub Repository**.
3.  **Root Directory**: Leave blank (this uses the root files).
4.  **Build Command**: `npm install`
5.  **Start Command**: `node src/index.js`
6.  **Environment Variables**:
    - `PORT`: `3000`
    - `OPENAI_API_KEY`: `sk-proj-...`
    - `WHATSAPP_ACCESS_TOKEN`: `EAAT...`
    - `WHATSAPP_PHONE_NUMBER_ID`: `9263...`
    - `VERIFY_TOKEN`: `lovable`
    - `SUPABASE_URL`: `https://...supabase.co`
    - `SUPABASE_ANON_KEY`: `eyJh...`

---

## Part 2: Deploy the Admin Dashboard (Frontend)

1.  **Create a New Web Service** on Render.
2.  **Connect the SAME GitHub Repository**.
3.  **Name**: Give it a different name (e.g., `whatsapp-admin`).
4.  **Root Directory**: `admin-dashboard` (Crucial!)
5.  **Build Command**: `npm install`
6.  **Start Command**: `npm run build && npm start`
7.  **Environment Variables**:
    - `NEXT_PUBLIC_SUPABASE_URL`: `https://...supabase.co`
    - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: `eyJh...`

---

## Step 3: Update WhatsApp Webhook
1.  Once the **Bot** is deployed, Render gives you a URL (e.g., `https://whatsapprd.onrender.com`).
2.  Go to the **Meta Developer Portal**.
3.  Add `/webhook/whatsapp` to that URL.
4.  **Callback URL**: `https://whatsapprd.onrender.com/webhook/whatsapp`

---

## How to Access
- **The Bot**: Runs silently in the background at your Render URL.
- **The Dashboard**: Visit the URL given to the `admin-dashboard` service (e.g., `https://whatsapp-admin.onrender.com`).
