import { supabase } from "@/lib/supabase";
import type { AgentMessage } from "@shared/schema";

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  onboardingComplete: boolean;
  monthlySalary?: number;
  employmentType?: string;
  hasExistingLoan?: boolean;
  existingLoanAmount?: number;
}

export interface LoanApplication {
  id: string;
  application_number: string;
  user_id: string;
  status: string;
  loan_type: string;
  loan_amount: number;
  requested_tenure_months?: number;
  purpose?: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_phone?: string;
  employment_type?: string;
  monthly_income?: number;
  credit_score?: number;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;
  
  const meta = user.user_metadata;
  
  return {
    id: user.id,
    email: user.email || "",
    firstName: meta?.first_name,
    lastName: meta?.last_name,
    phone: meta?.phone,
    onboardingComplete: meta?.onboarding_complete || false,
    monthlySalary: meta?.monthly_salary,
    employmentType: meta?.employment_type,
    hasExistingLoan: meta?.has_existing_loan,
    existingLoanAmount: meta?.existing_loan_amount,
  };
}

export function createWelcomeMessage(userProfile: UserProfile | null): AgentMessage {
  const firstName = userProfile?.firstName || "there";
  
  const content = userProfile
    ? `Hello ${firstName}! 👋 I'm your AI Loan Assistant. I can see you're already logged in, so I have access to your profile information.

I'll coordinate with my team of specialized agents to help you through the loan application process.

What type of loan are you looking for today?
• Personal Loan
• Home Loan  
• Business Loan
• Education Loan

Just let me know and we'll get started!`
    : `Hello! I'm your AI Loan Assistant. I'll coordinate with my team of specialized agents to help you through the loan application process.

To get started, you can either:
1. Sign in to use your saved profile
2. Tell me your Customer ID (e.g., CUST001)
3. Describe what you're looking for

How would you like to proceed?`;

  return {
    id: "welcome",
    agentType: "master",
    role: "agent",
    content,
    timestamp: new Date().toISOString(),
  };
}

export async function getUserLoanApplications(userId: string): Promise<LoanApplication[]> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching applications:', error);
    return [];
  }
}

export async function saveLoanApplication(
  userId: string, 
  applicationData: Partial<LoanApplication>
): Promise<LoanApplication> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .insert({
        user_id: userId,
        ...applicationData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error saving application:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error saving application:', error);
    throw error;
  }
}

export async function updateLoanApplication(
  applicationId: string, 
  updates: Partial<LoanApplication>
): Promise<LoanApplication> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating application:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
}

export async function createLoanApplicationFromChat(
  userId: string,
  loanType: string,
  amount: number,
  purpose?: string
): Promise<LoanApplication> {
  const userProfile = await getCurrentUser();
  
  return saveLoanApplication(userId, {
    loan_type: loanType,
    loan_amount: amount,
    purpose: purpose || '',
    status: 'draft',
    applicant_name: userProfile ? `${userProfile.firstName} ${userProfile.lastName}`.trim() : undefined,
    applicant_email: userProfile?.email,
    applicant_phone: userProfile?.phone,
  });
}

export async function getApplicationById(applicationId: string): Promise<LoanApplication | null> {
  try {
    const { data, error } = await supabase
      .from('loan_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    
    if (error) {
      console.error('Error fetching application:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching application:', error);
    return null;
  }
}

export async function addApplicationComment(
  applicationId: string,
  content: string,
  commentType: 'note' | 'query' | 'response' | 'internal' = 'note',
  isInternal: boolean = false
) {
  try {
    const { data, error } = await supabase
      .from('application_comments')
      .insert({
        application_id: applicationId,
        content,
        comment_type: commentType,
        is_internal: isInternal,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

export async function uploadDocument(
  applicationId: string,
  documentType: string,
  file: File
) {
  try {
    // Upload file to Supabase Storage
    const fileName = `${applicationId}/${documentType}_${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('loan-documents')
      .upload(fileName, file);
    
    if (uploadError) throw uploadError;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('loan-documents')
      .getPublicUrl(fileName);
    
    // Save document reference
    const { data, error } = await supabase
      .from('application_documents')
      .insert({
        application_id: applicationId,
        document_type: documentType,
        file_name: file.name,
        file_url: publicUrl,
        file_size: file.size,
        mime_type: file.type,
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}
