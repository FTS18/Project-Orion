# Supabase Database Setup Guide

## 📋 What's Included

This migration creates a **production-ready loan application system** with:

### Main Tables:
1. **loan_applications** - Core application data with 50+ fields
2. **application_documents** - Document management with verification
3. **application_comments** - Threaded comments/notes system
4. **application_status_history** - Audit trail of all status changes

### Features:
- ✅ **Row Level Security (RLS)** - Users can only see their own data
- ✅ **Automatic Timestamps** - Auto-updates `updated_at`
- ✅ **Status History Tracking** - Automatic audit trail
- ✅ **Indexes** - Optimized for common queries
- ✅ **JSONB Fields** - Flexible data storage
- ✅ **Soft Deletes** - Data is never lost
- ✅ **Helper Views** - Pre-built queries

## 🚀 How to Apply Migration

### Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **+ New Query**
4. Copy the entire contents of `supabase/migrations/001_loan_applications_schema.sql`
5. Paste into the SQL Editor
6. Click **Run** (or press Ctrl+Enter)

### Option 2: Supabase CLI

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migration
supabase db push

# Or if you have local Supabase:
supabase migration up
```

### Option 3: psql (Direct Database Access)

```bash
psql -h db.YOUR_PROJECT.supabase.co -U postgres -d postgres -f supabase/migrations/001_loan_applications_schema.sql
```

## 📊 Schema Overview

### loan_applications Table Structure

**Application Info:**
- `id` (UUID, Primary Key)
- `application_number` (Unique, auto-generated)
- `user_id` (Auth user reference)
- `status` (draft, submitted, under_review, approved, rejected, disbursed, closed)

**Loan Details:**
- `loan_type` (personal, home, business, education, vehicle, other)
- `loan_amount`, `requested_tenure_months`, `purpose`
- `approved_amount`, `approved_tenure_months`, `interest_rate`
- `emi_amount`, `total_payable`

**Applicant Details:**
- Name, email, phone, DOB, PAN, Aadhar

**Employment:**
- Type, employer, income, experience

**Financial:**
- Existing loans, credit score, property details

**KYC & Verification:**
- KYC status, verification timestamps

**Underwriting:**
- Status, decision, notes, risk category

**Agent Tracking:**
- `agents_involved` (JSONB array)
- `workflow_state` (JSONB object)

**Documents & Communication:**
- `documents` (JSONB array of file references)
- `communication_log` (JSONB array)

## 🔒 Security (RLS Policies)

### For Regular Users:
- ✅ Can view their own applications
- ✅ Can create new applications
- ✅ Can update **draft** applications
- ❌ Cannot view others' applications

### For Admins:
- ✅ Can view all applications
- ✅ Can update any application
- ✅ Can assign applications

To make a user admin, update their metadata:
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'
WHERE email = 'admin@example.com';
```

## 📝 Usage Examples

### 1. Create a Loan Application

```typescript
import { supabase } from "@/lib/supabase";

const { data, error } = await supabase
  .from('loan_applications')
  .insert({
    loan_type: 'personal',
    loan_amount: 500000,
    requested_tenure_months: 36,
    purpose: 'Home renovation',
    applicant_name: 'John Doe',
    applicant_email: 'john@example.com',
    applicant_phone: '+919876543210',
    employment_type: 'salaried',
    monthly_income: 100000,
  })
  .select()
  .single();
```

### 2. Get User's Applications

```typescript
const { data, error } = await supabase
  .from('loan_applications')
  .select('*')
  .order('created_at', { ascending: false });
```

### 3. Update Application Status

```typescript
const { data, error } = await supabase
  .from('loan_applications')
  .update({ 
    status: 'submitted',
    submitted_at: new Date().toISOString()
  })
  .eq('id', applicationId);
// Status history will be created automatically!
```

### 4. Upload Document

```typescript
const { data, error } = await supabase
  .from('application_documents')
  .insert({
    application_id: appId,
    document_type: 'pan_card',
    file_name: 'pan.pdf',
    file_url: 'https://storage.../pan.pdf',
    file_size: 12345,
    mime_type: 'application/pdf',
  });
```

### 5. Add Comment/Note

```typescript
const { data, error } = await supabase
  .from('application_comments')
  .insert({
    application_id: appId,
    content: 'Please upload salary slips for last 3 months',
    comment_type: 'query',
    is_internal: false,
  });
```

## 🎯 Next Steps

1. **Apply the migration** (see options above)
2. **Update your `.env` file** with Supabase credentials
3. **Test with sample data**
4. **Wire up the UI** to use real data instead of mock data

## 🔧 Troubleshooting

### Error: "relation already exists"
The table might already exist. Drop it first:
```sql
DROP TABLE IF EXISTS loan_applications CASCADE;
```

### Error: "permission denied"
Make sure you're using the `service_role` key or logged in as admin.

### Need to reset everything?
```sql
DROP TABLE IF EXISTS application_status_history CASCADE;
DROP TABLE IF EXISTS application_comments CASCADE;
DROP TABLE IF EXISTS application_documents CASCADE;
DROP TABLE IF EXISTS loan_applications CASCADE;
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Updates](https://supabase.com/docs/guides/realtime)
