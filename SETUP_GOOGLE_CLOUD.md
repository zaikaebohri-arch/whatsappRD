# How to Get `service-account.json`

To interact with Google Calendar automatically, you need a Service Account Key from Google Cloud.

## Step 1: Create a Project
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Click the project dropdown at the top and select **"New Project"**.
3.  Name it (e.g., `WhatsApp-Ava-Bot`) and click **Create**.
4.  Select the newly created project.

## Step 2: Enable Calendar API
1.  In the search bar at the top, type **"Google Calendar API"**.
2.  Click on "Google Calendar API" in the results.
3.  Click **Enable**.

## Step 3: Create Service Account
1.  In the search bar, type **"Credentials"** and select **"Credentials (API Manager)"**.
2.  Click **+ CREATE CREDENTIALS** > **Service account**.
3.  Give it a name (e.g., `ava-scheduler`).
4.  Click **Create and Continue**.
5.  (Optional) For "Role", you can select **Project > Editor** or leave it blank (specific calendar permissions are handled in Calendar settings).
6.  Click **Done**.

## Step 4: Download JSON Key
1.  In the Credentials list, verify you see your new Service Account (it has an email like `ava-scheduler@project-id.iam.gserviceaccount.com`).
2.  **Click on the email address** of the service account to edit it.
3.  Go to the **KEYS** tab.
4.  Click **ADD KEY** > **Create new key**.
5.  Select **JSON** and click **Create**.
6.  A file will automatically download to your computer.

## Step 5: Configure Project
1.  **Rename** the downloaded file to `service-account.json`.
2.  **Move** it to your project folder: `c:\whatsappRD\service-account.json`.
3.  **Copy the "client_email"** from inside the file (open it with notepad).
4.  **Share your Google Calendar** with that email address (as explained in `FIND_CALENDAR_ID.md`).
