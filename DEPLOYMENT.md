# Deployment Guide

## Environment Variables

### Development (Local)
Create a `.env` file in the project root:
```bash
VITE_PORT=8081
VITE_BACKEND_PORT=3000
# Leave VITE_BACKEND_URL empty - Vite proxy will handle API requests
```

### Production (Vercel)
Add these environment variables in your Vercel project settings:

1. Go to your Vercel project → Settings → Environment Variables
2. Add the following:

**Variable Name:** `VITE_BACKEND_URL`  
**Value:** `https://deploydriverall.onrender.com`  
**Environment:** Production, Preview (select both)

⚠️ **Important:** Do NOT include a trailing slash in the URL.

## How It Works

### Local Development
- Frontend runs on `http://localhost:8081` (or port specified in `VITE_PORT`)
- Vite proxy forwards `/api/*` requests to `http://localhost:3000` (your local backend)
- No need to set `VITE_BACKEND_URL`

### Production (Vercel)
- Frontend makes direct requests to backend URL
- `VITE_BACKEND_URL` is used to construct full API URLs
- Example: `https://deploydriverall.onrender.com/api/drive/health`

## Redeploying

After setting the environment variable on Vercel:
1. Trigger a new deployment (commit and push, or use Vercel dashboard)
2. The frontend will now correctly connect to your Render backend

## Testing

After deployment, check your browser console:
- Successful: API requests should show `https://deploydriverall.onrender.com/api/...`
- Failed: Check CORS settings on your backend (Render service)

## Backend CORS Configuration

Make sure your backend (on Render) allows requests from your Vercel domain:
```javascript
// Example for Express.js
app.use(cors({
  origin: [
    'https://your-app.vercel.app',
    'http://localhost:8081' // for local development
  ]
}));
```
