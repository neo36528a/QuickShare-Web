# Step-by-Step Google Drive API Setup Guide

This guide walks you through setting up official Google Drive API OAuth 2.0 credentials for QuickShare so that uploaded files are stored in your Google Drive account under the `QuickShare Uploads` folder.

---

## 1. Create a Project in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Name your project `QuickShare App` and click **Create**.

---

## 2. Enable the Google Drive API

1. In the left navigation menu, go to **APIs & Services** > **Library**.
2. Search for **Google Drive API**.
3. Click on **Google Drive API** and click **Enable**.

---

## 3. Configure OAuth Consent Screen

1. In the left menu, go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (or Internal if using Google Workspace) and click **Create**.
3. Fill in mandatory fields:
   - **App name**: `QuickShare`
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
4. Click **Save and Continue**.
5. On the **Scopes** page, click **Add or Remove Scopes** and add:
   - `https://www.googleapis.com/auth/drive.file` *(View and manage Google Drive files created by this app)*
6. Click **Save and Continue**.
7. Under **Test Users**, click **Add Users** and add your own Google email address.
8. Click **Save and Continue**.

---

## 4. Create OAuth 2.0 Client Credentials

1. Go to **APIs & Services** > **Credentials**.
2. Click **+ Create Credentials** > **OAuth client ID**.
3. Select **Application type**: **Web application**.
4. Name: `QuickShare Server Client`.
5. Under **Authorized redirect URIs**, click **+ Add URI** and add:
   ```text
   https://developers.google.com/oauthplayground
   ```
6. Click **Create**.
7. Copy your **Client ID** and **Client Secret**.

---

## 5. Generate Refresh Token via OAuth Playground

1. Navigate to [Google OAuth 2.0 Playground](https://developers.google.com/oauthplayground).
2. Click the ⚙️ **Gear icon** in the top right corner:
   - Check **Use your own OAuth credentials**.
   - Paste your **OAuth Client ID** and **OAuth Client Secret**.
3. On the left panel under **Step 1 (Select & authorize APIs)**, scroll down to **Drive API v3** or type:
   ```text
   https://www.googleapis.com/auth/drive.file
   ```
4. Click **Authorize APIs** and sign in with your Google account.
5. On **Step 2 (Exchange authorization code for tokens)**:
   - Click **Exchange authorization code for tokens**.
6. Copy the **Refresh token** output.

---

## 6. Configure `.env` File

Paste your credentials into `backend/.env` or root `.env`:

```env
GOOGLE_CLIENT_ID=1234567890-abcdef.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-secret-key
GOOGLE_REFRESH_TOKEN=1//04your-refresh-token
GOOGLE_DRIVE_FOLDER_NAME=QuickShare Uploads
```

On backend startup, QuickShare will automatically locate or create the target folder `QuickShare Uploads` in your Google Drive and begin accepting uploads up to 5 GB.
