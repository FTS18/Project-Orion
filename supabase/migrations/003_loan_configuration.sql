-- Loan Configuration Tables
-- Enables database-driven loan product management

-- Loan Products Table
CREATE TABLE IF NOT EXISTS loan_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  -- Amount limits
  min_amount DECIMAL(15, 2) NOT NULL DEFAULT 50000,
  max_amount DECIMAL(15, 2) NOT NULL DEFAULT 2500000,
  default_amount DECIMAL(15, 2) NOT NULL DEFAULT 200000,
  amount_step DECIMAL(15, 2) NOT NULL DEFAULT 10000,
  -- Tenure limits (in months)
  min_tenure INTEGER NOT NULL DEFAULT 6,
  max_tenure INTEGER NOT NULL DEFAULT 60,
  default_tenure INTEGER NOT NULL DEFAULT 24,
  tenure_options INTEGER[] NOT NULL DEFAULT '{6, 12, 18, 24, 36, 48, 60}',
  -- Interest rates
  base_interest_rate DECIMAL(5, 2) NOT NULL DEFAULT 12.5,
  rate_adjustment_excellent DECIMAL(5, 2) NOT NULL DEFAULT -2.0,
  rate_adjustment_good DECIMAL(5, 2) NOT NULL DEFAULT -1.0,
  rate_adjustment_fair DECIMAL(5, 2) NOT NULL DEFAULT 0,
  rate_adjustment_poor DECIMAL(5, 2) NOT NULL DEFAULT 2.0,
  -- Processing fee
  processing_fee_rate DECIMAL(5, 2) NOT NULL DEFAULT 2.0,
  min_processing_fee DECIMAL(15, 2) NOT NULL DEFAULT 1000,
  -- Eligibility
  min_credit_score INTEGER NOT NULL DEFAULT 550,
  min_age INTEGER NOT NULL DEFAULT 21,
  max_age INTEGER NOT NULL DEFAULT 60,
  min_income DECIMAL(15, 2) NOT NULL DEFAULT 25000,
  -- Flags
  is_active BOOLEAN NOT NULL DEFAULT true,
  requires_collateral BOOLEAN NOT NULL DEFAULT false,
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Eligibility Rules Table
CREATE TABLE IF NOT EXISTS eligibility_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id VARCHAR(50) UNIQUE NOT NULL,
  loan_product_id UUID REFERENCES loan_products(id) ON DELETE CASCADE,
  rule_type VARCHAR(50) NOT NULL, -- 'credit_score', 'income', 'age', 'employment', 'custom'
  operator VARCHAR(20) NOT NULL, -- 'gte', 'lte', 'eq', 'in', 'between'
  field_name VARCHAR(100) NOT NULL,
  threshold_value JSONB NOT NULL, -- Can store single value or array
  error_message TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Document Requirements Table
CREATE TABLE IF NOT EXISTS document_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  loan_product_id UUID REFERENCES loan_products(id) ON DELETE CASCADE,
  document_type VARCHAR(100) NOT NULL, -- 'id_proof', 'address_proof', 'income_proof', etc.
  document_name VARCHAR(200) NOT NULL,
  description TEXT,
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  accepted_formats TEXT[] DEFAULT '{"pdf", "jpg", "png"}',
  max_file_size_mb INTEGER DEFAULT 5,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Rejection Reasons Table
CREATE TABLE IF NOT EXISTS rejection_reasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reason_code VARCHAR(50) UNIQUE NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'credit', 'income', 'documents', 'kyc', 'fraud', 'policy'
  short_reason VARCHAR(200) NOT NULL,
  detailed_reason TEXT NOT NULL,
  customer_message TEXT NOT NULL, -- User-friendly message
  suggestions TEXT[], -- Array of suggestions for the customer
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Feature Flags Table
CREATE TABLE IF NOT EXISTS feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT false,
  environments TEXT[] DEFAULT '{"development", "staging", "production"}',
  roles TEXT[] DEFAULT '{}', -- Empty means all roles
  ab_test_percentage INTEGER, -- NULL means no A/B testing
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default loan products
INSERT INTO loan_products (product_id, name, description, min_amount, max_amount, default_amount, base_interest_rate, min_credit_score)
VALUES 
  ('personal', 'Personal Loan', 'Unsecured personal loan for various needs', 50000, 2500000, 200000, 12.5, 550),
  ('home', 'Home Loan', 'Secured loan for property purchase', 500000, 50000000, 3000000, 8.5, 650),
  ('business', 'Business Loan', 'Loan for business expansion and working capital', 100000, 10000000, 500000, 14.0, 600)
ON CONFLICT (product_id) DO NOTHING;

-- Insert default rejection reasons
INSERT INTO rejection_reasons (reason_code, category, short_reason, detailed_reason, customer_message, suggestions)
VALUES
  ('LOW_CREDIT_SCORE', 'credit', 'Credit score below minimum', 'Credit score is below the minimum required threshold for this loan product.', 'Unfortunately, your credit score doesn''t meet our current requirements.', '{"Work on improving your credit score by paying bills on time", "Consider a secured loan option", "Try again after 6 months"}'),
  ('INSUFFICIENT_INCOME', 'income', 'Income below minimum', 'Monthly income is below the minimum required for the requested loan amount.', 'Your current income doesn''t meet the requirements for this loan amount.', '{"Consider a lower loan amount", "Add a co-applicant with additional income", "Explore our other loan products"}'),
  ('AGE_INELIGIBLE', 'policy', 'Age not in eligible range', 'Applicant age is outside the eligible range for this loan product.', 'Your age doesn''t fall within our eligibility criteria.', '{"Check eligibility criteria for other products", "Consider a co-applicant of eligible age"}'),
  ('KYC_FAILED', 'kyc', 'KYC verification failed', 'Customer KYC verification could not be completed successfully.', 'We couldn''t verify your identity documents.', '{"Ensure all documents are clear and readable", "Use government-issued ID proof", "Contact support if you believe this is an error"}'),
  ('HIGH_EMI_RATIO', 'income', 'EMI to income ratio too high', 'The EMI to income ratio exceeds the permitted threshold.', 'Your existing obligations are too high for this loan amount.', '{"Consider a lower loan amount", "Increase the loan tenure to reduce EMI", "Clear some existing debts first"}')
ON CONFLICT (reason_code) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (flag_id, name, description, enabled, environments)
VALUES
  ('agentic_mode', 'Agentic AI Mode', 'Enable multi-agent AI loan processing', true, '{"development", "staging", "production"}'),
  ('particles_background', 'Particles Background', 'Show animated particles in background', true, '{"development", "staging", "production"}'),
  ('confetti_on_approval', 'Confetti on Approval', 'Show confetti when loan is approved', true, '{"development", "staging", "production"}'),
  ('document_upload', 'Document Upload', 'Allow document uploads', false, '{"development", "staging"}'),
  ('ab_testing', 'A/B Testing Dashboard', 'Show A/B testing UI', false, '{"development", "staging"}')
ON CONFLICT (flag_id) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_loan_products_active ON loan_products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_eligibility_rules_product ON eligibility_rules(loan_product_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(enabled) WHERE enabled = true;

-- Add RLS policies
ALTER TABLE loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE eligibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE rejection_reasons ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

-- Public read access for all config tables (they're not sensitive)
CREATE POLICY "Allow public read on loan_products" ON loan_products FOR SELECT USING (true);
CREATE POLICY "Allow public read on eligibility_rules" ON eligibility_rules FOR SELECT USING (true);
CREATE POLICY "Allow public read on document_requirements" ON document_requirements FOR SELECT USING (true);
CREATE POLICY "Allow public read on rejection_reasons" ON rejection_reasons FOR SELECT USING (true);
CREATE POLICY "Allow public read on feature_flags" ON feature_flags FOR SELECT USING (true);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_loan_products_updated_at
  BEFORE UPDATE ON loan_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_eligibility_rules_updated_at
  BEFORE UPDATE ON eligibility_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
