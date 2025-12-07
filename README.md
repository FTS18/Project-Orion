
<div align="center">
  <img src="client/public/logo.png" alt="Project Orion Logo" width="120" />
  <h1>Project Orion</h1>
  <h3>Agentic AI Loan Processing System</h3>
  <p>
    <b>Powered by Google Gemini 2.5 Flash & Supabase</b>
  </p>
  <p>
    Project Orion is a next-generation banking assistant that leverages autonomous AI agents to orchestrate the entire loan lifecycle—from initial consultation to final sanction—in real-time.
  </p>

  <p>
    <a href="#-quick-start">🚀 Quick Start</a> •
    <a href="#-key-features">✨ Key Features</a> •
    <a href="#-architecture">🏗️ Architecture</a> •
    <a href="#-configuration">⚙️ Configuration</a>
  </p>
</div>

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Supabase Account** & **Google Gemini API Key**

### 1. Environment Setup

Create `.env` files in `client/` and `backend/`.

**`client/.env`**:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**`backend/.env`**:
```env
GEMINI_API_KEY=your_gemini_api_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

### 2. Run Application

**Backend (Terminal 1)**:
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --host 127.0.0.1 --port 5000 --reload
```

**Frontend (Terminal 2)**:
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5000` to start using the Agentic Mode.

---

## ✨ Key Features

- **🤖 Autonomous Agents**: Multi-agent orchestration for Sales, Verification, Underwriting, and Sanctioning.
- **⚡ Real-Time Processing**: Powered by Gemini 2.5 Flash for sub-second latent interactions.
- **🛡️ Secure & Compliant**: Full KYC verification and risk assessment workflows.
- **📊 Dynamic Configuration**: Centralized config for loan products, rules, and agent behaviors.
- **🎨 Modern UI**: Beautiful, responsive interface with dual-pane layout for chat and agent visibility.

---

## 🏗️ Architecture

### AI Core: Google Gemini 2.5 Flash
Migrated from local models to **Gemini 2.5 Flash** for superior speed (<1s latency), higher accuracy in JSON extraction, and zero local hardware dependency.

### Backend: FastAPI & Python
Robust Python backend handling the **AI Orchestrator**, managing context, state, and tool execution for agents.

### Database: Supabase (PostgreSQL)
- **Identity**: Secure Auth via Email/Password & Google.
- **Data**: comprehensive schemas for User Profiles, Applications, and Logs.

---

## ⚙️ Configuration System

Project Orion features a centralized configuration engine `client/src/config` ensuring modifiability without deep code changes.

| Config File | Purpose |
|-------------|---------|
| `agents.config.ts` | Agent personas, tools, and capabilities |
| `loan.config.ts` | Loan products, interest rates, and limits |
| `workflow.config.ts` | Step-by-step workflow definitions |
| `theme.config.ts` | Design tokens and branding |

---

<div align="center">
  <p>
    Built with ❤️ by the Project Orion Team
  </p>
  <p>
    © 2025 Project Orion
  </p>
</div>
