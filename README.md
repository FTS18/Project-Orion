# Project Orion - Agentic AI Loan Assistant (Gemini Powered)

**Status**: ✅ **Full System Running** | ✨ **Gemini 2.5 Flash Integration** | 🎯 **Supabase Auth & DB** | 🚀 **Production Ready**

---

## 🚀 Quick Start (5 Minutes)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** with npm
- **Supabase Account** (for Auth & Database)
- **Google Gemini API Key**

### 1. Environment Setup

Create a `.env` file in `client/` and `backend/` (or root depending on setup, but typically client needs VITE_ vars).

**`client/.env`**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**`backend/.env`** (or set in system env):
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

### 2. Installation & Setup

**Step 1: Backend (Terminal 1)**
```bash
cd backend
# Create virtual env (optional but recommended)
python -m venv venv
.\venv\Scripts\activate  # Windows
source venv/bin/activate # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Run Server
python -m uvicorn app:app --host 127.0.0.1 --port 5000 --reload
```
✅ Wait for: `Application startup complete`

**Step 2: Frontend (Terminal 2)**
```bash
cd client
npm install
npm run dev
```
✅ Wait for: `VITE ready`

**Step 3: Open Browser**
```
http://localhost:5000 (Proxy to Frontend)
OR
http://localhost:5173 (Direct Vite Dev Server)
```
Click **"Agentic Mode"** to start the AI workflow.

---

## 📁 Project Structure

```
Project-Orion/
├── backend/                    # Python FastAPI
│   ├── agents/
│   │   ├── ai_orchestrator.py  # Gemini Orchestrator
│   │   ├── gemini_service.py   # Google Gemini Integration
│   │   └── ...
│   ├── models/schemas.py       # Pydantic models
│   ├── app.py                  # FastAPI main app
│   └── requirements.txt
├── client/                     # React + Vite
│   ├── src/
│   │   ├── pages/
│   │   │   ├── agentic-mode.tsx # Main Agent Interface
│   │   │   ├── auth/            # Supabase Auth Pages
│   │   │   └── ...
│   │   ├── components/
│   │   │   ├── chat-interface.tsx # Chat UI with Quick Replies
│   │   │   ├── agent-panel.tsx    # Agent Status Visualization
│   │   │   └── ...
│   │   └── lib/supabase.ts      # Supabase Client
│   └── package.json
└── shared/                     # Shared types
```

---

## 🎯 System Architecture

### AI Core: Google Gemini 2.5 Flash
We have migrated from local Ollama models to **Google Gemini 2.5 Flash** for:
- **Speed**: <1s response times.
- **Accuracy**: Better context understanding and JSON extraction.
- **Reliability**: No local hardware dependency.

### Database & Auth: Supabase
- **Authentication**: Email/Password & Google OAuth.
- **Database**: PostgreSQL for storing User Profiles, Loan Applications, and Logs.
- **Real-time**: Live updates for agent status (planned).

### Agent Workflow (Orchestrator)
The `AIOrchestrator` manages the conversation flow:
1.  **Greeting**: Identifies user, fetches profile from Supabase.
2.  **Sales**: Proposes loan offers based on financial data.
3.  **Verification**: Validates KYC details.
4.  **Underwriting**: Analyzes credit score & risk.
5.  **Sanction**: Generates formal sanction letter.

---

## ✨ Key Features

- **Agentic AI Mode**: A specialized interface for complex workflows.
- **Resizable Panels**: Customize your workspace (Chat vs. Agent View).
- **Quick Replies**: Smart suggestions based on conversation context.
- **Real-time Logs**: Watch the agents "think" and execute tasks.
- **Sanction Letter Generation**: Automated PDF creation.

---

## 🧪 Testing Flow

1.  **Login/Signup**: Create an account or use Google Login.
2.  **Profile**: Update your "Financial Information" in the Profile tab.
3.  **Agentic Mode**: Go to the Agentic Mode page.
4.  **Chat**:
    - The agent will greet you by name.
    - It will know your income and pre-approved limit.
    - Follow the prompts (or use Quick Replies).
    - Watch the "Agents" tab to see which agent is active.

---

## 🔧 Troubleshooting

**Backend Errors**
- **Gemini API Error**: Check your `GEMINI_API_KEY`. Ensure it's valid and has quota.
- **Supabase Error**: Verify `SUPABASE_URL` and keys in `.env`.

**Frontend Errors**
- **"Failed to fetch"**: Ensure Backend is running on port 5000.
- **Auth Issues**: Clear cookies/local storage and try logging in again.

---

## 🚀 Deployment

**Backend**: Render / Railway (Python)
**Frontend**: Vercel / Netlify (Vite)
**Database**: Supabase (Managed)

See `DEPLOYMENT.md` (if available) for detailed steps.

---

**Last Updated**: December 6, 2025
**Version**: 2.0.0 (Gemini + Supabase Upgrade)
