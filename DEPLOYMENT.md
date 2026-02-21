# Deployment Guide (Render.com)

To keep this running 24/7 without your laptop, deploy it to the cloud.
We recommend **Render.com** (it has a free tier and supports Node.js excellently).

## Prerequisites
1.  **Git Repository**: Code must be on GitHub/GitLab.
2.  **Render Account**: Sign up at [render.com](https://render.com).

## Step 1: Push to GitHub
1.  Create a new repository on GitHub.
2.  Run these commands in your terminal:
    ```bash
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git push -u origin main
    ```

## Step 2: Create Web Service on Render
1.  Go to Render Dashboard > **New +** > **Web Service**.
2.  Connect your GitHub repository.
3.  **Settings**:
    - **Runtime**: Node
    - **Build Command**: `npm install`
    - **Start Command**: `node src/index.js`
4.  **Environment Variables** (Crucial Step):
    Add the following keys (copy values from your `.env` file):
    - `OPENAI_API_KEY`: `sk-...`
    - `WHATSAPP_ACCESS_TOKEN`: `...`
    - `WHATSAPP_PHONE_NUMBER_ID`: `...`
    - `VERIFY_TOKEN`: `lovable`
    - `GOOGLE_CALENDAR_ID`: `...`
    - `GOOGLE_SERVICE_ACCOUNT_JSON`: **(See Below)**

### How to set `GOOGLE_SERVICE_ACCOUNT_JSON`
Since you cannot upload the `service-account.json` file easily, we updated the code to read the **content** from a variable.
1.  Open your `service-account.json` file in Notepad.
2.  Copy the **entire content** (starts with `{` and ends with `}`).
3.  Paste it as the value for `GOOGLE_SERVICE_ACCOUNT_JSON` in Render.

## Step 3: Update WhatsApp Webhook
1.  Once deployed, Render will give you a URL like `https://whatsapp-ava.onrender.com`.
2.  Go to **Meta Developer Portal**.
3.  Update **Callback URL** to: `https://whatsapp-ava.onrender.com/webhook/whatsapp`
4.  Verify again.

**Done! Your bot is now in the cloud.**
