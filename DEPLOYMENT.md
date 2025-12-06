# Deployment Guide

## 🚀 Vercel Deployment (Frontend Only)

This project is designed to run fully on Vercel using **Client-Side Fallback** if the Python backend is not available.

### 1. Environment Variables
Go to **Settings > Environment Variables** in your Vercel project and add:

| Variable | Description | Required? |
|----------|-------------|-----------|
| `VITE_SUPABASE_URL` | Your Supabase Project URL | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Anon Key | ✅ Yes |
| `VITE_GEMINI_API_KEY` | Google Gemini API Key | ✅ Yes (for fallback) |
| `VITE_API_URL` | URL of your Python Backend | ❌ Optional |

### 2. Build Settings
- **Framework Preset**: Vite
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

---

## 🐍 Backend Deployment (Optional)

If you want the full features (CRM lookup, PDF generation), deploy the backend to **Render** or **Railway**.

### Environment Variables (Backend)
| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | Google Gemini API Key |
| `SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_KEY` | Your Supabase **Service Role** Key |

### Start Command
```bash
python -m uvicorn app:app --host 0.0.0.0 --port $PORT
```
