# Production Deployment Guide

This guide will help you deploy the Smart To-Do List Tracker to production using Railway for the backend and PostgreSQL database, and EAS for the Android APK.

## Prerequisites

- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- Expo account (already configured with EAS)
- Git installed locally

## Step 1: Push Code to GitHub

1. Create a new repository on GitHub
2. Push your local code to GitHub:

```bash
cd D:\New\To_Do_List
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy Backend and Database to Railway

### 2.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and log in
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repository and click "Import"

### 2.2 Add PostgreSQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "PostgreSQL"
3. Railway will automatically create a PostgreSQL database

### 2.3 Configure Backend Service

1. Click on your backend service (the one imported from GitHub)
2. Go to the "Variables" tab
3. Add the following environment variables:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=your_strong_production_jwt_secret_here
JWT_EXPIRATION=7d
PORT=3000
API_PREFIX=api
NODE_ENV=production
```

Note: `${{Postgres.DATABASE_URL}}` will automatically be replaced with the actual database connection string.

### 2.4 Deploy Backend

1. Railway will automatically detect the Node.js app and start building
2. The build process will run: `npm install && npm run build && npm run start:prod`
3. Wait for the deployment to complete
4. Once deployed, Railway will provide a public URL for your backend (e.g., `https://your-backend.up.railway.app`)

### 2.5 Verify Backend Deployment

1. Click on your backend service
2. Click the "URL" link to open your backend
3. Test the health endpoint: `https://your-backend.up.railway.app/api`
4. You should see a response from your NestJS app

## Step 3: Update Frontend API URL

### 3.1 Update API URL in Frontend

Update the frontend configuration to use the Railway backend URL:

**Option 1: Update `app.config.js`**

```javascript
// frontend/app.config.js
export default {
  // ... existing config
  extra: {
    apiBaseUrl: 'https://your-backend.up.railway.app/api', // Replace with your Railway URL
    eas: {
      projectId: '83154a56-614a-4b7e-8a84-e3e072177c33',
    },
  },
};
```

**Option 2: Update `.env` file**

```env
# frontend/.env
API_BASE_URL=https://your-backend.up.railway.app/api
```

### 3.2 Commit and Push Changes

```bash
cd D:\New\To_Do_List
git add .
git commit -m "Update API URL to use Railway backend"
git push origin main
```

## Step 4: Build Android APK with EAS

### 4.1 Update Frontend API URL

Make sure the API URL in your frontend is updated to the Railway backend URL.

### 4.2 Build Production APK

```bash
cd D:\New\To_Do_List\frontend
eas build --platform android --profile production
```

This will:
- Build the app in the cloud using EAS
- Use the production API URL configured in `app.config.js`
- Generate a downloadable APK file

### 4.3 Download the APK

1. After the build completes, EAS will provide a download link
2. Download the APK file to your computer

## Step 5: Distribute the APK

### 5.1 Distribution Options

You can distribute the APK through:

**Option 1: GitHub Releases**
1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Upload the APK file
4. Share the release URL with users

**Option 2: Google Drive**
1. Upload the APK to Google Drive
2. Set sharing permissions to "Anyone with the link"
3. Share the link with users

**Option 3: Direct File Sharing**
- Use any file-sharing service (Dropbox, OneDrive, etc.)
- Share the download link with users

### 5.2 Installation Instructions for Users

Users will need to:

1. Download the APK file
2. Enable "Install from unknown sources" in their Android settings:
   - Go to Settings → Security → Allow installation from unknown sources
3. Open the APK file and install
4. Grant necessary permissions (Internet, Notifications, etc.)

## Step 6: Monitor and Maintain

### Railway Monitoring

1. Monitor your Railway dashboard for:
   - Service health
   - Database usage
   - Logs and errors
   - Resource consumption

### Database Backups

Railway automatically creates database backups. You can:
- View backups in the PostgreSQL service
- Restore from backups if needed
- Set up backup schedules

### Updates

To update the application:

1. Make changes to your code
2. Commit and push to GitHub
3. Railway will automatically redeploy
4. Build a new APK with EAS
5. Distribute the updated APK

## Architecture Overview

```
Android App (APK)
    ↓ (HTTPS)
Railway Backend (NestJS)
    ↓ (DATABASE_URL)
Railway PostgreSQL Database
```

## Troubleshooting

### Backend Issues

- Check Railway logs for errors
- Verify environment variables are set correctly
- Ensure database connection is working
- Test API endpoints directly

### Frontend Issues

- Verify API URL is correct
- Check network connectivity
- Ensure backend is accessible
- Test API calls manually

### Build Issues

- Ensure EAS CLI is up to date: `npm install -g eas-cli@latest`
- Check app.config.js configuration
- Verify Expo project is properly connected
- Review EAS build logs

## Cost Considerations

- Railway: Free tier available (limited resources)
- EAS: Free builds available (limited builds per month)
- Consider upgrading plans for production use

## Security Notes

- Use strong JWT secrets in production
- Enable SSL (automatic on Railway)
- Keep dependencies updated
- Monitor for security vulnerabilities
- Use environment variables for sensitive data