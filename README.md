
<div align="center">
  <img src="client/public/logo.png" alt="Project Orion Logo" width="120" />
  <h1>Project Orion</h1>
  <h3>Agentic AI Loan Processing System</h3>
  <p>
    <b>Powered by Google Gemini 2.5 Flash, FastAPI & React</b>
  </p>
  <p>
    Project Orion is a next-generation banking assistant that leverages autonomous AI agents to orchestrate the entire loan lifecycle—from initial consultation to final sanction—in real-time with multi-agent orchestration, KYC verification, underwriting, and dynamic rules engine.
  </p>

  <p>
    <a href="#-quick-start">🚀 Quick Start</a> •
    <a href="#-key-features">✨ Key Features</a> •
    <a href="#-tech-stack">💻 Tech Stack</a> •
    <a href="#-architecture">🏗️ Architecture</a> •
    <a href="#-project-structure">📁 Project Structure</a> •
    <a href="#-configuration">⚙️ Configuration</a> •
    <a href="#-api-endpoints">🔌 API Endpoints</a>
  </p>
</div>

---

## 🚀 Quick Start

### Prerequisites
- **Python 3.10+**
- **Node.js 18+**
- **Google Gemini API Key**
- **Ollama** (optional, for local model fallback)

### 1. Environment Setup

Create `.env` files in `client/` and `backend/`.

**`backend/.env`**:
```env
GEMINI_API_KEY=your_gemini_api_key
OLLAMA_BASE_URL=http://localhost:11434  # Optional
```

**`client/.env`** (if using Supabase):
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Run Application

**Backend (Terminal 1)**:
```bash
cd backend
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app:app --host 0.0.0.0 --port 5000 --reload
```

**Frontend (Terminal 2)**:
```bash
npm install
npm run dev
```

The frontend will start on `http://localhost:5173` and proxy API calls to `http://localhost:5000`.

---

## ✨ Key Features

- **🤖 Multi-Agent Orchestration**: Autonomous agents for Sales, Verification, Underwriting, Sanctioning, and KYC workflows
- **⚡ Real-Time Processing**: Powered by Gemini 2.5 Flash for sub-second latency with JSON extraction
- **🛡️ KYC & Compliance**: Document verification, salary extraction, sanction letter generation
- **📊 Rules Engine**: Dynamic loan eligibility rules with AB testing capabilities
- **💳 EMI Calculator**: Real-time EMI, interest breakdown, and amortization schedules
- **🎨 Modern UI**: React + Tailwind CSS with responsive design, dual-pane layout for chat & agent visibility
- **📈 Performance Analytics**: Track application metrics, success rates, and user engagement
- **🔄 Session Management**: Persistent conversation context across interactions

---

## 💻 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS + PostCSS
- **Build**: Vite
- **UI Components**: Radix UI (20+ components)
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: TanStack Query (React Query)
- **Charts**: Chart.js/custom visualizations
- **Database**: Supabase (optional)

### Backend
- **Framework**: FastAPI + Uvicorn
- **AI Models**: Google Gemini 2.5 Flash, Ollama (local fallback)
- **Database**: Drizzle ORM + PostgreSQL (optional)
- **Document Generation**: ReportLab (PDF)
- **Async**: Python asyncio + WebSockets

### DevOps
- **Containerization**: Docker + Docker Compose
- **Deployment**: Netlify (frontend), Vercel/Railway (backend)
- **Package Manager**: npm (frontend), pip (backend)

---

## 🏗️ Architecture

### AI Core: Multi-Agent System
The **Master Agent Orchestrator** manages specialized worker agents:
- **Sales Agent**: Initial inquiry handling, product recommendations
- **Verification Agent**: Document verification, KYC compliance
- **Underwriting Agent**: Risk assessment, eligibility determination
- **Sanction Agent**: Loan approval, offer generation
- **Chat Agent**: User interaction and context management

Powered by **Google Gemini 2.5 Flash** with fallback to **Ollama** for local deployment.

### Backend Architecture (FastAPI)
```
backend/
├── app.py                    # Main FastAPI application
├── routes_extended.py        # Additional route handlers
├── agents/                   # AI orchestration layer
│   ├── ai_orchestrator.py   # Master orchestrator
│   ├── worker_agents.py      # Specialized agents
│   ├── gemini_service.py     # Gemini API wrapper
│   └── ollama_service.py     # Ollama integration
├── services/                 # Business logic
│   ├── kyc.py               # KYC verification workflows
│   ├── underwriting.py       # Loan underwriting rules
│   ├── rules_engine.py       # Dynamic rules evaluation
│   ├── ab_testing.py         # A/B testing framework
│   ├── performance_analytics.py # Metrics & analytics
│   ├── advanced_algorithms.py   # EMI, risk scoring
│   ├── chat.py               # Chat session management
│   └── ollama_client.py      # Local LLM client
├── models/                   # Data schemas
│   └── schemas.py            # Pydantic models
├── storage/                  # Data persistence
│   └── data.py               # Storage manager
└── data/                     # Mock data
    └── mock_loans.py         # Sample loan products
```

### Frontend Architecture (React + Vite)
```
client/src/
├── App.tsx                   # Root component
├── main.tsx                  # Entry point
├── components/               # UI components
│   ├── chat-interface.tsx    # Main chat UI
│   ├── agent-panel.tsx       # Agent activity display
│   ├── kyc-document-viewer.tsx # Document preview
│   ├── rules-editor.tsx      # Rules management
│   ├── ab-testing-dashboard.tsx # A/B test results
│   ├── loan-comparison.tsx   # Offer comparison
│   ├── sanction-letter-modal.tsx # Sanction letter
│   ├── custom-data-entry.tsx # Manual data input
│   ├── document-upload.tsx   # File upload UI
│   ├── wizard-stepper.tsx    # Application steps
│   └── ui/                   # Radix UI wrappers
├── config/                   # Centralized configuration
│   ├── agents.config.ts      # Agent definitions
│   ├── features.config.ts    # Feature flags
│   └── ...
├── pages/                    # Page components
├── hooks/                    # Custom React hooks
├── lib/                      # Utilities
└── data/                     # Mock data

---

## ⚙️ Configuration System

Project Orion uses centralized configuration files for easy customization:

| Config File | Purpose | Location |
|-------------|---------|----------|
| `agents.config.ts` | Agent personas, tools, capabilities | `client/src/config/` |
| `features.config.ts` | Feature flags, UI toggles | `client/src/config/` |
| `loan.config.ts` | Loan products, rates, limits | `client/src/config/` |
| `rules.json` | Dynamic eligibility rules | `data/` |
| `customers.json` | Mock customer data | `data/` |
| `offers.json` | Predefined loan offers | `data/` |

---

## 🔌 API Endpoints

### Core Loan Operations
- `POST /api/customer/create` - Create/fetch customer
- `POST /api/credit-check` - Credit bureau verification
- `POST /api/kyc/verify` - KYC document verification
- `POST /api/kyc/salary-extraction` - Extract salary details
- `POST /api/offers` - Get loan offers
- `POST /api/underwriting` - Underwriting decision
- `POST /api/sanction-letter` - Generate sanction letter

### Chat & Agent Communication
- `WebSocket /ws/chat/{session_id}` - Real-time chat streaming
- `POST /api/chat` - Single chat request
- `GET /api/chat/history/{session_id}` - Get conversation history

### Analytics & Rules
- `GET /api/rules` - Fetch current rules
- `POST /api/rules/update` - Update rules dynamically
- `GET /api/analytics/performance` - Performance metrics
- `GET /api/ab-testing/status` - A/B test results
- `POST /api/ab-testing/track` - Track A/B test events

### Workflow Management
- `GET /api/workflow/log` - Workflow execution logs
- `GET /api/applications` - List all applications
- `GET /api/applications/{id}` - Get application details

---

## 🎯 Core Services & Modules

### Underwriting Service
- EMI calculation with principal/interest breakdown
- Risk scoring algorithm
- Eligibility validation against dynamic rules
- Loan product matching

### KYC Service
- Document verification (PAN, Aadhaar, Bank statements)
- Salary extraction from documents using OCR/AI
- Identity verification workflows

### Rules Engine
- YAML/JSON-based rule definitions
- Dynamic rule evaluation at runtime
- Support for complex conditions (AND/OR logic)
- A/B testing integration for rule variants

### Chat Service
- Session management with persistent context
- Multi-turn conversation tracking
- Integration with AI agents for intelligent responses
- Message history and audit logging

### Performance Analytics
- Track application conversion rates
- Monitor agent response times
- Log all workflow executions
- User engagement metrics

---

## 📦 Project Structure Details

### Key Files
- **`app.py`** - FastAPI main app with 10+ endpoints
- **`routes_extended.py`** - Extended API route handlers
- **`vite.config.ts`** - Frontend build configuration
- **`tsconfig.json`** - TypeScript configuration
- **`tailwind.config.ts`** - Tailwind CSS theme
- **`docker-compose.yml`** - Multi-container setup
- **`drizzle.config.ts`** - Database migrations config

### Data Models
- `Customer` - User profile and identity
- `LoanOffer` - Loan product details
- `UnderwritingResult` - Eligibility decision
- `SanctionLetterResponse` - Final approval document
- `WorkflowLogEntry` - Audit trail
- `ChatRequest/Response` - Chat message schema

---

## 🚢 Deployment

### Frontend
- **Netlify**: Recommended for static hosting
  - Connected to git repository
  - Automatic builds on push
  - See `netlify.toml` and `FRONTEND_HOSTING.txt`
- **Vercel**: Alternative serverless deployment
  - See `vercel.json` for configuration

### Backend
- **Docker Containerization**:
  ```bash
  docker build -f Dockerfile.frontend -t orion-frontend .
  docker-compose up
  ```
- **Manual Deployment**:
  - Railway, Heroku, or AWS EC2
  - See `DEPLOYMENT.md` for detailed steps

### Environment Variables
Backend requires:
- `GEMINI_API_KEY` - Google Generative AI API key
- `OLLAMA_BASE_URL` - Optional local model server
- `SUPABASE_URL` - Optional database
- `SUPABASE_KEY` - Optional auth

---

## 🔐 Security & Compliance

- **API Rate Limiting**: Implemented via FastAPI middleware
- **CORS Protection**: Configured for frontend origin only
- **Request Validation**: Pydantic schema validation on all inputs
- **Audit Logging**: All operations logged with timestamps
- **KYC Compliance**: Document verification and identity checks

---

## 🧪 Testing & Monitoring

### Current Implementation
- Mock data for testing (`data/mock_loans.py`, `data/customers.json`)
- Performance metrics tracking in `performance_analytics.py`
- Workflow logging system for debugging

### Next Steps (From NEXT_STEPS.md)
- Unit tests for utility functions (EMI calculation)
- E2E tests with Cypress/Playwright
- Integration tests for API endpoints
- Performance benchmarking suite

---

## 📊 Dashboard Features

- **Chat Interface**: Real-time conversation with AI agents
- **Agent Panel**: Visual representation of agent activities
- **Loan Comparison**: Side-by-side offer analysis
- **Rules Editor**: Dynamic rule creation and testing
- **A/B Testing Dashboard**: Test variant performance
- **KYC Document Viewer**: Preview and verify documents
- **Sanction Letter Modal**: Generate official approval documents

---

## 🛠️ Development

### Commands
```bash
# Frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview:client  # Preview build
npm run check        # TypeScript type checking

# Backend
python -m uvicorn app:app --reload  # Dev server
python -m uvicorn app:app --port 5000  # Production

# Database
npm run db:push      # Push Drizzle migrations
```

### Code Quality
- TypeScript for type safety
- Pydantic for data validation
- ESLint/Prettier configuration available
- Pre-commit hooks recommended

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📚 Documentation

- **`DEPLOYMENT.md`** - Detailed deployment instructions
- **`FRONTEND_HOSTING.txt`** - Frontend hosting options
- **`NEXT_STEPS.md`** - Roadmap and improvements
- **`supabase/MIGRATION_GUIDE.md`** - Database setup

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

<div align="center">
  <p>
    <strong>Project Orion</strong> - Revolutionizing Loan Processing with Agentic AI
  </p>
  <p>
    Built with ❤️ by the Project Orion Team
  </p>
  <p>
    © 2025 Project Orion
  </p>
</div>
