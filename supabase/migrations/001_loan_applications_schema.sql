-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- LOAN APPLICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Application Info
  application_number TEXT UNIQUE NOT NULL DEFAULT CONCAT('APP', LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'disbursed', 'closed')),
  
  -- Loan Details
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal', 'home', 'business', 'education', 'vehicle', 'other')),
  loan_amount NUMERIC(15, 2) NOT NULL CHECK (loan_amount > 0),
  requested_tenure_months INTEGER CHECK (requested_tenure_months BETWEEN 6 AND 360),
  purpose TEXT,
  
  -- Approved Terms (filled after underwriting)
  approved_amount NUMERIC(15, 2),
  approved_tenure_months INTEGER,
  interest_rate NUMERIC(5, 2),
  processing_fee NUMERIC(10, 2),
  emi_amount NUMERIC(10, 2),
  total_payable NUMERIC(15, 2),
  
  -- Applicant Details (can be different from user profile)
  applicant_name TEXT,
  applicant_email TEXT,
  applicant_phone TEXT,
  applicant_dob DATE,
  applicant_pan TEXT,
  applicant_aadhar TEXT,
  
  -- Employment Details
  employment_type TEXT CHECK (employment_type IN ('salaried', 'self_employed', 'business', 'retired', 'other')),
  employer_name TEXT,
  monthly_income NUMERIC(12, 2),
  annual_income NUMERIC(12, 2),
  work_experience_years INTEGER,
  
  -- Financial Details
  existing_loans BOOLEAN DEFAULT false,
  existing_loan_emi NUMERIC(10, 2) DEFAULT 0,
  credit_score INTEGER CHECK (credit_score BETWEEN 300 AND 900),
  has_property BOOLEAN DEFAULT false,
  property_value NUMERIC(15, 2),
  
  -- Address
  current_address JSONB,
  permanent_address JSONB,
  
  -- Documents (stored as JSON array of file URLs/references)
  documents JSONB DEFAULT '[]'::jsonb,
  
  -- KYC & Verification
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'failed', 'resubmit_required')),
  kyc_verified_at TIMESTAMPTZ,
  kyc_verified_by TEXT,
  
  -- Underwriting
  underwriting_status TEXT DEFAULT 'pending' CHECK (underwriting_status IN ('pending', 'in_progress', 'approved', 'rejected')),
  underwriting_decision TEXT,
  underwriting_notes TEXT,
  underwriting_completed_at TIMESTAMPTZ,
  risk_category TEXT CHECK (risk_category IN ('low', 'medium', 'high', 'very_high')),
  
  -- Sanction Letter
  sanction_letter_url TEXT,
  sanction_letter_generated_at TIMESTAMPTZ,
  sanction_letter_accepted_at TIMESTAMPTZ,
  
  -- Agent Activity Tracking
  agents_involved JSONB DEFAULT '[]'::jsonb, -- Array of agent activities
  workflow_state JSONB DEFAULT '{}'::jsonb, -- Current workflow state
  
  -- Assignment & Processing
  assigned_to UUID REFERENCES auth.users(id), -- Loan officer/admin assigned
  assigned_at TIMESTAMPTZ,
  
  -- Communication Log
  communication_log JSONB DEFAULT '[]'::jsonb, -- Array of messages/calls
  
  -- Rejection/Issues
  rejection_reason TEXT,
  rejection_date TIMESTAMPTZ,
  issues JSONB DEFAULT '[]'::jsonb,
  
  -- Disbursement
  disbursement_date TIMESTAMPTZ,
  disbursement_amount NUMERIC(15, 2),
  disbursement_account JSONB,
  
  -- Metadata
  source TEXT DEFAULT 'web' CHECK (source IN ('web', 'mobile', 'agent', 'api')),
  referral_code TEXT,
  utm_data JSONB,
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Soft Delete
  deleted_at TIMESTAMPTZ,
  deleted_by UUID REFERENCES auth.users(id)
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_loan_applications_user_id ON loan_applications(user_id);
CREATE INDEX idx_loan_applications_status ON loan_applications(status);
CREATE INDEX idx_loan_applications_application_number ON loan_applications(application_number);
CREATE INDEX idx_loan_applications_created_at ON loan_applications(created_at DESC);
CREATE INDEX idx_loan_applications_loan_type ON loan_applications(loan_type);
CREATE INDEX idx_loan_applications_assigned_to ON loan_applications(assigned_to);
CREATE INDEX idx_loan_applications_deleted_at ON loan_applications(deleted_at) WHERE deleted_at IS NULL;

-- Composite indexes for common queries
CREATE INDEX idx_loan_applications_user_status ON loan_applications(user_id, status);
CREATE INDEX idx_loan_applications_status_created ON loan_applications(status, created_at DESC);

-- ============================================
-- APPLICATION DOCUMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  document_type TEXT NOT NULL CHECK (document_type IN (
    'pan_card', 'aadhar_card', 'photo', 'signature',
    'salary_slip', 'bank_statement', 'itr', 'form16',
    'property_documents', 'business_proof', 'gst_certificate',
    'other'
  )),
  
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  mime_type TEXT,
  
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES auth.users(id),
  verified_at TIMESTAMPTZ,
  verification_notes TEXT,
  
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_application_documents_application_id ON application_documents(application_id);
CREATE INDEX idx_application_documents_user_id ON application_documents(user_id);

-- ============================================
-- APPLICATION COMMENTS/NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  comment_type TEXT DEFAULT 'note' CHECK (comment_type IN ('note', 'query', 'response', 'internal')),
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false, -- Only visible to admins/agents
  
  parent_comment_id UUID REFERENCES application_comments(id), -- For threaded comments
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_application_comments_application_id ON application_comments(application_id);
CREATE INDEX idx_application_comments_created_at ON application_comments(created_at DESC);

-- ============================================
-- APPLICATION STATUS HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS application_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id UUID REFERENCES loan_applications(id) ON DELETE CASCADE,
  
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  change_reason TEXT,
  metadata JSONB,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_application_status_history_application_id ON application_status_history(application_id);
CREATE INDEX idx_application_status_history_created_at ON application_status_history(created_at DESC);

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loan_applications_updated_at
BEFORE UPDATE ON loan_applications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Auto-create status history on status change
CREATE OR REPLACE FUNCTION create_status_history()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO application_status_history (application_id, old_status, new_status, changed_by)
    VALUES (NEW.id, OLD.status, NEW.status, NEW.assigned_to);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_application_status_changes
AFTER UPDATE ON loan_applications
FOR EACH ROW
EXECUTE FUNCTION create_status_history();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_status_history ENABLE ROW LEVEL SECURITY;

-- Users can read their own applications
CREATE POLICY "Users can view own applications"
ON loan_applications FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own applications
CREATE POLICY "Users can create own applications"
ON loan_applications FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own draft applications
CREATE POLICY "Users can update own draft applications"
ON loan_applications FOR UPDATE
USING (auth.uid() = user_id AND status = 'draft')
WITH CHECK (auth.uid() = user_id);

-- Admin/agents can view all applications (requires admin role in user metadata)
CREATE POLICY "Admins can view all applications"
ON loan_applications FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Similar policies for documents
CREATE POLICY "Users can view own documents"
ON application_documents FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own documents"
ON application_documents FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view application comments"
ON application_comments FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM loan_applications
    WHERE loan_applications.id = application_comments.application_id
    AND (loan_applications.user_id = auth.uid() OR is_internal = false)
  )
);

CREATE POLICY "Users can create comments"
ON application_comments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Status history is read-only for users
CREATE POLICY "Users can view own status history"
ON application_status_history FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM loan_applications
    WHERE loan_applications.id = application_status_history.application_id
    AND loan_applications.user_id = auth.uid()
  )
);

-- ============================================
-- HELPER VIEWS
-- ============================================

-- Active applications view
CREATE OR REPLACE VIEW active_loan_applications AS
SELECT 
  la.*,
  u.email as user_email,
  u.raw_user_meta_data->>'first_name' as user_first_name,
  u.raw_user_meta_data->>'last_name' as user_last_name
FROM loan_applications la
LEFT JOIN auth.users u ON la.user_id = u.id
WHERE la.deleted_at IS NULL
  AND la.status NOT IN ('rejected', 'closed');

-- Application summary view
CREATE OR REPLACE VIEW application_summary AS
SELECT 
  la.id,
  la.application_number,
  la.user_id,
  la.status,
  la.loan_type,
  la.loan_amount,
  la.created_at,
  COUNT(DISTINCT ad.id) as document_count,
  COUNT(DISTINCT ac.id) as comment_count
FROM loan_applications la
LEFT JOIN application_documents ad ON la.id = ad.application_id
LEFT JOIN application_comments ac ON la.id = ac.application_id
WHERE la.deleted_at IS NULL
GROUP BY la.id;

-- ============================================
-- SAMPLE DATA (Optional - Remove in production)
-- ============================================

-- Insert sample loan application (requires actual user_id from auth.users)
-- INSERT INTO loan_applications (
--   user_id, loan_type, loan_amount, requested_tenure_months, 
--   purpose, status, applicant_name, applicant_email
-- ) VALUES (
--   'YOUR_USER_ID_HERE', 'personal', 500000, 36,
--   'Home renovation', 'submitted', 'John Doe', 'john@example.com'
-- );
