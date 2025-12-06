# 🚀 Supabase Integration - Complete Setup

## ✅ What's Been Created

### 1. Database Schema (`supabase/migrations/001_loan_applications_schema.sql`)
A production-ready database with:
- **4 Main Tables**: loan_applications, application_documents, application_comments, application_status_history
- **50+ Fields** in loan_applications covering full loan lifecycle
- **Row Level Security (RLS)** - Users can only access their own data
- **Automatic Triggers** - Auto-updating timestamps and status history
- **Indexes** - Optimized for performance
- **Helper Views** - Pre-built queries for common operations

### 2. TypeScript Integration (`client/src/lib/agent-user-context.ts`)
Full CRUD operations:
- `getCurrentUser()` - Get logged-in user
- `getUserLoanApplications()` - Fetch user's applications
- `saveLoanApplication()` - Create new application
- `updateLoanApplication()` - Update existing application
- `createLoanApplicationFromChat()` - Create from agent chat
- `addApplicationComment()` - Add notes/comments
- `uploadDocument()` - Upload and track documents

### 3. Documentation (`supabase/MIGRATION_GUIDE.md`)
Complete guide for setup and usage

## 📋 Quick Start Steps

### Step 1: Apply the Migration

**Option A: Supabase Dashboard (Easiest)**
1. Go to https://app.supabase.com
2. Open your project
3. Navigate to **SQL Editor**
4. Click **+ New Query**
5. Copy all content from `supabase/migrations/001_loan_applications_schema.sql`
6. Paste and click **Run**

**Option B: Supabase CLI**
```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

### Step 2: Create Storage Bucket for Documents

1. In Supabase Dashboard, go to **Storage**
2. Click **New Bucket**
3. Name it: `loan-documents`
4. Make it **Public** (or configure RLS for private)
5. Click **Create Bucket**

### Step 3: Update Environment Variables

Your `client/.env` should already have:
```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### Step 4: Test the Integration

```typescript
// Test creating an application
import { saveLoanApplication, getCurrentUser } from "@/lib/agent-user-context";

const user = await getCurrentUser();
if (user) {
  const app = await saveLoanApplication(user.id, {
    loan_type: 'personal',
    loan_amount: 500000,
    requested_tenure_months: 36,
    purpose: 'Home renovation',
  });
  console.log('Created:', app);
}
```

## 🎯 Features Now Available

### For Users:
- ✅ Create loan applications
- ✅ Track application status
- ✅ Upload documents
- ✅ Add comments/queries
- ✅ View application history
- ✅ Automated welcome messages with their name

### For Admins:
- ✅ View all applications
- ✅ Assign applications to loan officers
- ✅ Update application status
- ✅ Add internal notes
- ✅ Track agent activities
- ✅ Complete audit trail

## 📊 Database Schema Overview

### Main Table: loan_applications

**Key Fields:**
```typescript
{
  id: UUID,
  application_number: "APP123456",  // Auto-generated
  user_id: UUID,  // From auth.users
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "disbursed" | "closed",
  
  // Loan Details
  loan_type: "personal" | "home" | "business" | "education" | "vehicle" | "other",
  loan_amount: number,
  requested_tenure_months: number,
  purpose: string,
  
  // Approved Terms
  approved_amount: number,
  interest_rate: number,
  emi_amount: number,
  
  // Applicant Info
  applicant_name: string,
  applicant_email: string,
  applicant_phone: string,
  
  // Financial
  employment_type: string,
  monthly_income: number,
  credit_score: number,
  
  // Tracking
  agents_involved: JSONB[],  // Array of agent activities
  workflow_state: JSONB,     // Current workflow state
  
  // Timestamps
  created_at: timestamp,
  updated_at: timestamp,  // Auto-updates
  submitted_at: timestamp,
  completed_at: timestamp,
}
```

## 🔒 Security (RLS Policies)

**What Users Can Do:**
- ✅ View their own applications
- ✅ Create new applications
- ✅ Update **draft** applications
- ❌ Cannot see other users' data

**What Admins Can Do:**
- ✅ View all applications
- ✅ Update any application
- ✅ Assign applications

**To make someone admin:**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'admin@example.com';
```

## 💡 Usage in Agent Chat

The agent system now automatically:
1. Detects logged-in user
2. Uses their profile data
3. Auto-populates forms
4. Saves conversations
5. Tracks agent activities

**Example: User says "I need a personal loan of 5 lakhs"**

The system will:
1. Extract loan type (personal) and amount (500000)
2. Create a draft application in Supabase
3. Pre-fill user's name, email, phone
4. Track the conversation
5. Update status as it progresses

## 📝 Example Queries

### Get user's applications
```typescript
const apps = await getUserLoanApplications(userId);
```

### Create application
```typescript
const app = await saveLoanApplication(userId, {
  loan_type: 'home',
  loan_amount: 5000000,
  requested_tenure_months: 240,
  purpose: 'Buying new house',
  monthly_income: 150000,
});
```

### Update status
```typescript
await updateLoanApplication(appId, {
  status: 'submitted',
  submitted_at: new Date().toISOString(),
});
```

### Add comment
```typescript
await addApplicationComment(
  appId,
  'Please upload salary slips',
  'query',
  false  // Not internal
);
```

## 🎨 Next Steps

1. **Apply Migration** ✓ (Do this first!)
2. **Create Storage Bucket** ✓
3. **Test with Sample Data**
4. **Wire up UI forms** to save to Supabase
5. **Build Admin Dashboard** for viewing all applications
6. **Add Real-time Updates** using Supabase subscriptions

## 📚 Additional Resources

- [Migration Guide](./MIGRATION_GUIDE.md) - Detailed setup instructions
- [Supabase Docs](https://supabase.com/docs)
- [TypeScript Integration](../client/src/lib/agent-user-context.ts)

## 🐛 Troubleshooting

### "relation already exists"
Drop tables first:
```sql
DROP TABLE IF EXISTS loan_applications CASCADE;
```

### "permission denied for schema public"
Use service_role key or login as superuser.

### RLS blocking queries
Disable temporarily for testing:
```sql
ALTER TABLE loan_applications DISABLE ROW LEVEL SECURITY;
```

### Need to reset?
```sql
-- In SQL Editor, run:
DROP TABLE IF EXISTS application_status_history CASCADE;
DROP TABLE IF EXISTS application_comments CASCADE;
DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;

-- Then re-run the migration
```

---

**You're all set! 🎉** The database is ready to store real loan applications!
