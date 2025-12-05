# Agentic AI Loan Assistant

## Overview

This is a dual-mode loan processing application that demonstrates both traditional wizard-based workflows and AI-powered multi-agent systems. The application allows users to apply for personal loans through either a standard step-by-step form process or an interactive AI agent-based experience with real-time workflow visualization.

The system implements complete loan processing workflows including customer verification, KYC validation, salary slip extraction, underwriting logic, and sanction letter generation. It features a comprehensive design system based on Material Design 3 principles with full dark/light mode support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React 18+ with TypeScript in strict mode, using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter for lightweight SPA navigation between landing, standard mode, and agentic mode pages.

**UI Component Library**: Built on ShadCN/UI components (Radix UI primitives) with Tailwind CSS for styling. The design system uses CSS variables for theming, enabling seamless dark/light mode switching through next-themes integration.

**Design Tokens**: All colors, spacing, shadows, and typography are defined as CSS custom properties in `index.css`, ensuring consistent theming and no hardcoded values. The system uses Inter for primary typography and JetBrains Mono for code/logs.

**State Management**: TanStack Query (React Query) for server state management with custom API request utilities. Local component state managed with React hooks.

**Layout System**: Responsive grid-based layouts following Material Design 3 patterns. Standard mode uses a centered wizard layout (max-w-2xl), while agentic mode uses a 60/40 split (chat interface + agent panels).

**Key Pages**:
- Landing page with hero section and dual-mode selection
- Standard mode with 4-step wizard (Details → Documents → Verification → Review)
- Agentic mode with chat interface, worker agent panels, workflow graph, and log viewer

### Backend Architecture

**Framework**: Express.js server with TypeScript, following SOLID principles and separation of concerns.

**API Design**: RESTful endpoints for loan processing operations:
- `/api/verify-kyc` - KYC verification against CRM records
- `/api/extract-salary` - Salary slip document processing
- `/api/underwrite` - Loan eligibility evaluation
- `/api/generate-sanction-letter` - PDF sanction letter generation
- `/api/crm/:customerId` - Customer data retrieval
- `/api/credit/:customerId` - Credit bureau information

**Business Logic**: Implemented as service classes with clear single responsibilities:
- `UnderwritingEngine` - Implements exact underwriting rules (credit score checks, pre-approved limits, EMI calculations)
- Storage layer for managing synthetic customer data, CRM records, loan offers, and audit logs

**Underwriting Rules**:
1. Credit score < 700 → Reject
2. Loan amount ≤ pre-approved limit → Approve
3. Loan amount ≤ 2× pre-approved limit → Check salary (EMI ≤ 50% monthly salary)
4. Loan amount > 2× pre-approved limit → Reject

**Mock Data**: 10 synthetic Indian customers with complete profiles (CUST001-CUST010) including credit scores, employment details, pre-approved limits, and monthly salaries.

**Development Mode**: Vite middleware integration for HMR during development with automatic client template reloading.

**Production Build**: Optimized builds with esbuild bundling server code and Vite building client assets to `dist/`.

### System Architecture

**Database**: Configured for PostgreSQL via Drizzle ORM with schema definitions in `shared/schema.ts`. Currently using in-memory storage for demo purposes, but database migration structure is in place via `drizzle.config.ts`.

**Shared Types**: Zod schemas in `shared/schema.ts` provide runtime validation and TypeScript types used across frontend and backend, ensuring type safety for:
- Customer data structures
- Loan requests and responses
- Agent messages and status
- Workflow logs
- KYC/underwriting/sanction letter payloads

**Build System**: 
- Client: Vite with React plugin, path aliases (@, @shared, @assets)
- Server: esbuild bundling with selective externalization
- Monorepo structure with shared schemas and types

**Configuration Management**:
- TypeScript strict mode with path aliases
- Tailwind configured for client directory with ShadCN component paths
- PostCSS with autoprefixer
- Environment-based builds (development/production)

### External Dependencies

**UI Component Libraries**:
- Radix UI primitives (dialogs, dropdowns, tooltips, accordions, etc.)
- ShadCN/UI component system
- Embla Carousel for carousels
- cmdk for command palette patterns

**Styling & Theming**:
- Tailwind CSS 3.4+ with CSS variables
- class-variance-authority for component variants
- clsx/tailwind-merge for class name utilities

**Form Handling**:
- React Hook Form with @hookform/resolvers
- Zod for schema validation (drizzle-zod integration)

**Data Fetching**:
- TanStack Query (React Query) for caching and server state

**Database & ORM**:
- Drizzle ORM configured for PostgreSQL
- Connection pooling via pg
- Session storage with connect-pg-simple (currently using memorystore fallback)

**Development Tools**:
- Replit-specific plugins (runtime error modal, cartographer, dev banner)
- tsx for TypeScript execution
- Vite for HMR and development server

**Utilities**:
- date-fns for date manipulation
- nanoid for unique ID generation
- Wouter for lightweight routing

**Planned Integrations** (based on design documents):
- Ollama for local AI model inference (LLaMA3/Mistral/Phi-3)
- Multi-agent orchestration (LangGraph or CrewAI patterns)
- PDF generation for sanction letters
- Document OCR for salary slip extraction