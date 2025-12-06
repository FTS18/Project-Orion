"""
Project Orion: Hackathon 6.0 - Master Agent Orchestration
Master Agent coordinates all worker agents for end-to-end loan approval
"""
from typing import Dict, List, Any, Optional
from datetime import datetime
from uuid import uuid4
import asyncio
import re
import json
from ..storage.data import StorageManager
from .worker_agents import SalesAgent, VerificationAgent, UnderwritingAgent, SanctionLetterGenerator


class ConversationContext:
    """Manages conversation state and workflow progress"""

    def __init__(self, customer_id: str):
        self.customer_id = customer_id
        self.messages: List[Dict[str, Any]] = []
        self.agent_states: List[Dict[str, Any]] = []
        self.workflow_logs: List[Dict[str, Any]] = []
        
        # Workflow state
        self.stage = "greeting"  # greeting → sales → kyc → underwriting → sanction → closed
        self.customer_data: Dict[str, Any] = {}
        self.loan_offer: Dict[str, Any] = {}
        self.kyc_verified = False
        self.underwriting_result: Dict[str, Any] = {}
        self.sanction_letter: Dict[str, Any] = {}
        self.workflow_complete = False

    def add_message(self, role: str, content: str, agent_type: str = None):
        self.messages.append({
            "role": role,
            "content": content,
            "agent": agent_type,
            "timestamp": datetime.utcnow().isoformat(),
        })

    def add_agent_state(self, agent_type: str, status: str, last_action: str, progress: int):
        self.agent_states.append({
            "agentType": agent_type,
            "status": status,
            "lastAction": last_action,
            "progress": progress,
        })

    def add_log(self, agent_type: str, action: str, details: str, level: str = "info"):
        self.workflow_logs.append({
            "id": str(uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "agentType": agent_type,
            "action": action,
            "details": details,
            "level": level,
        })


class MasterAgent:
    """Master Agent - Orchestrates the entire loan approval workflow"""

    def __init__(self):
        self.conversations: Dict[str, ConversationContext] = {}
        self.storage = StorageManager()
        
        # Initialize worker agents
        self.sales_agent = SalesAgent()
        self.verification_agent = VerificationAgent()
        self.underwriting_agent = UnderwritingAgent()
        self.sanction_agent = SanctionLetterGenerator()

    async def process(self, customer_id: str, message: str) -> Dict[str, Any]:
        """Process customer message through the workflow"""
        
        # Get or create conversation context
        if customer_id not in self.conversations:
            self.conversations[customer_id] = ConversationContext(customer_id)
        
        ctx = self.conversations[customer_id]
        ctx.add_message("user", message, "user")
        ctx.add_log("master", "receive", f"Message: {message[:40]}", "info")
        
        response = ""
        
        try:
            # Route to appropriate workflow stage
            if ctx.stage == "greeting":
                response = await self._handle_greeting(ctx, message)
            
            elif ctx.stage == "sales":
                response = await self._handle_sales(ctx, message)
            
            elif ctx.stage == "kyc":
                response = await self._handle_kyc(ctx, message)
            
            elif ctx.stage == "underwriting":
                response = await self._handle_underwriting(ctx, message)
            
            elif ctx.stage == "sanction":
                response = await self._handle_sanction(ctx, message)
            
            elif ctx.stage == "closed":
                response = await self._handle_closed(ctx, message)
            
            ctx.add_message("agent", response, "master")
        
        except Exception as e:
            ctx.add_log("master", "error", str(e), "error")
            response = f"I apologize for the error: {str(e)}"
            ctx.add_message("agent", response, "master")
        
        return {
            "id": str(uuid4()),
            "customerId": customer_id,
            "message": response,
            "agentType": "master",
            "stage": ctx.stage,
            "workflow_complete": ctx.workflow_complete,
            "timestamp": datetime.utcnow().isoformat(),
            "agentStates": ctx.agent_states,
            "workflowLogs": ctx.workflow_logs,
        }

    async def _handle_greeting(self, ctx: ConversationContext, message: str) -> str:
        """Initial greeting and customer identification"""
        ctx.add_agent_state("master", "active", "Greeting customer", 10)
        ctx.add_log("master", "stage", "Entering greeting stage", "info")
        
        # Extract customer info from message
        customer = self.storage.get_customer(ctx.customer_id)
        
        if customer:
            ctx.customer_data = {
                "name": customer.name,
                "email": customer.email,
                "phone": customer.phone,
                "monthly_income": customer.monthlyNetSalary,
            }
            
            ctx.stage = "sales"
            ctx.add_log("master", "customer_found", f"Customer {customer.name} identified", "success")
            ctx.add_agent_state("sales", "active", "Preparing offer", 30)
            
            greeting = f"""Welcome to our Personal Loan Service, {customer.name}! 👋

I'm your AI Loan Assistant, and I'm here to help you secure a personal loan quickly and easily.

With our fast approval process, you could have funds in your account within 24 hours. Whether you need money for consolidation, education, or any other purpose, we have flexible loan options tailored to your needs.

Let me share a personalized offer based on your profile..."""
            
            return greeting
        else:
            return "Welcome! I'm your AI Loan Assistant. Please provide your Customer ID (e.g., CUST001) to continue."

    async def _handle_sales(self, ctx: ConversationContext, message: str) -> str:
        """Sales agent negotiates loan terms and collects basic info"""
        ctx.add_agent_state("sales", "active", "Negotiating terms", 35)
        ctx.add_log("master", "stage", "Entering sales stage", "info")
        
        # Check for missing data
        missing_fields = []
        if "age" not in ctx.customer_data:
            missing_fields.append("age")
        if "employment_type" not in ctx.customer_data:
            missing_fields.append("employment_type")
        if "existing_loans" not in ctx.customer_data:
            missing_fields.append("existing_loans")
            
        # If message contains data, try to extract it (simple keyword matching for now)
        # In a real app, use an LLM or regex to extract
        lower_msg = message.lower()
        if "age" in missing_fields and any(char.isdigit() for char in message):
            # Very naive extraction - just finding a number
            import re
            nums = re.findall(r'\d+', message)
            if nums:
                ctx.customer_data["age"] = int(nums[0])
                missing_fields.remove("age")
        
        if "employment_type" in missing_fields:
            if "salaried" in lower_msg:
                ctx.customer_data["employment_type"] = "Salaried"
                missing_fields.remove("employment_type")
            elif "self" in lower_msg or "business" in lower_msg:
                ctx.customer_data["employment_type"] = "Self-Employed"
                missing_fields.remove("employment_type")
                
        if "existing_loans" in missing_fields:
            if "no" in lower_msg or "none" in lower_msg:
                ctx.customer_data["existing_loans"] = "no"
                missing_fields.remove("existing_loans")
            elif "yes" in lower_msg:
                ctx.customer_data["existing_loans"] = "yes"
                missing_fields.remove("existing_loans")

        # If still missing data, ask for it
        if missing_fields:
            if "age" in missing_fields:
                return "Before we proceed, could you please tell me your **age**?"
            if "employment_type" in missing_fields:
                return "Are you **Salaried** or **Self-Employed**?"
            if "existing_loans" in missing_fields:
                return "Do you have any **existing loans**? (Yes/No)"

        # Call sales agent
        sales_result = await self.sales_agent.negotiate(ctx.customer_data)
        
        ctx.loan_offer = sales_result.get("offer", {})
        ctx.customer_data["monthly_income"] = ctx.customer_data.get("monthly_income", 50000)
        ctx.customer_data["monthly_emi"] = sales_result.get("emi", 0)
        
        ctx.add_log("sales", "offer_prepared", f"Offer: ₹{ctx.loan_offer.get('amount'):,}", "success")
        ctx.add_agent_state("sales", "completed", "Offer prepared", 50)
        
        # Move to KYC
        ctx.stage = "kyc"
        ctx.add_agent_state("verification", "active", "Starting KYC verification", 50)
        
        kyc_message = f"""{sales_result['message']}

📋 **Next Step:** Let me verify your KYC details to proceed with the application.

Could you confirm your:
• Name
• Email
• Phone number

(I already have this on file, just need your confirmation)"""
        
        return kyc_message

    async def _handle_kyc(self, ctx: ConversationContext, message: str) -> str:
        """Verification agent performs KYC check"""
        ctx.add_agent_state("verification", "active", "Verifying KYC", 60)
        ctx.add_log("master", "stage", "Entering KYC verification stage", "info")
        
        # Call verification agent
        kyc_result = await self.verification_agent.verify_kyc(ctx.customer_id, ctx.customer_data)
        
        ctx.kyc_verified = kyc_result.get("verified", False)
        ctx.add_log("verification", "kyc_check", f"KYC Status: {kyc_result['status']}", 
                   "success" if ctx.kyc_verified else "warning")
        ctx.add_agent_state("verification", "completed", "KYC verification complete", 70)
        
        if not ctx.kyc_verified:
            return "KYC verification failed. Please contact our support team."
        
        # Move to underwriting
        ctx.stage = "underwriting"
        ctx.add_agent_state("underwriting", "active", "Starting credit evaluation", 70)
        
        kyc_message = f"""{kyc_result['message']}

✅ All checks passed! Now let me evaluate your credit profile and provide an instant approval decision."""
        
        return kyc_message

    async def _handle_underwriting(self, ctx: ConversationContext, message: str) -> str:
        """Underwriting agent evaluates credit and makes decision"""
        ctx.add_agent_state("underwriting", "active", "Evaluating credit", 75)
        ctx.add_log("master", "stage", "Entering underwriting stage", "info")
        
        # Extract loan amount and tenure from offer
        loan_amount = ctx.loan_offer.get("amount", 300000)
        monthly_income = ctx.customer_data.get("monthly_income", 50000)
        monthly_emi = ctx.customer_data.get("monthly_emi", 0)
        
        # Call underwriting agent
        underwriting_result = await self.underwriting_agent.evaluate_and_approve(
            ctx.customer_id,
            loan_amount,
            monthly_income,
            monthly_emi
        )
        
        ctx.underwriting_result = underwriting_result
        decision = underwriting_result.get("decision", "PENDING")
        
        ctx.add_log("underwriting", "evaluation", 
                   f"Decision: {decision}, Score: {underwriting_result.get('credit_score')}/900", 
                   "success" if decision == "APPROVE" else "warning")
        ctx.add_agent_state("underwriting", "completed", f"Decision: {decision}", 85)
        
        if decision != "APPROVE":
            ctx.stage = "closed"
            ctx.add_log("master", "workflow_end", f"Loan {decision}", "warning")
            return f"""{underwriting_result['message']}

Unfortunately, based on our evaluation, we're unable to proceed with your application at this time.

{underwriting_result.get('rejection_reason', 'Please contact our support team for more information.')}

Thank you for considering us. We appreciate your interest!"""
        
        # APPROVED - Move to sanction letter
        ctx.stage = "sanction"
        ctx.add_agent_state("sanction", "active", "Generating sanction letter", 90)
        
        approval_message = f"""{underwriting_result['message']}

🎉 **Great News! Your loan has been APPROVED!**

✅ Credit Score: {underwriting_result.get('credit_score')}/900
✅ Monthly EMI fits within your budget
✅ All regulatory checks passed

Now let me generate your official sanction letter..."""
        
        return approval_message

    async def _handle_sanction(self, ctx: ConversationContext, message: str) -> str:
        """Generate sanction letter and complete workflow"""
        ctx.add_agent_state("sanction", "active", "Generating PDF", 95)
        ctx.add_log("master", "stage", "Entering sanction letter generation", "info")
        
        # Generate sanction letter
        ref_number = f"LN{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        sanction_result = await self.sanction_agent.generate_letter(
            ctx.customer_id,
            ctx.customer_data.get("name", "Customer"),
            ctx.loan_offer.get("amount", 300000),
            ctx.loan_offer.get("tenure", 60),
            ctx.loan_offer.get("rate", 12.5),
            ctx.customer_data.get("monthly_emi", 5000),
            ref_number
        )
        
        ctx.sanction_letter = sanction_result
        ctx.workflow_complete = True
        ctx.stage = "closed"
        
        ctx.add_log("sanction", "letter_generated", f"Reference: {ref_number}", "success")
        ctx.add_agent_state("sanction", "completed", "Sanction letter ready", 100)
        ctx.add_agent_state("master", "completed", "Workflow complete", 100)
        
        return f"""{sanction_result['message']}

📄 **Your Sanction Letter has been generated!**

Reference Number: {ref_number}
Amount: ₹{ctx.loan_offer.get('amount'):,}
EMI: ₹{ctx.customer_data.get('monthly_emi'):,.0f}/month
Tenure: {ctx.loan_offer.get('tenure')} months

**Next Steps:**
1. Download your sanction letter (click button below)
2. Complete final documentation
3. Funds will be disbursed within 24 hours

Thank you for choosing us! If you have any questions, please reach out to our support team.

🎯 Your loan journey is complete!"""

    async def _handle_closed(self, ctx: ConversationContext, message: str) -> str:
        """Handle closed workflow - only respond to help/status queries"""
        return f"""Your loan application is now complete! 

Your Loan Details:
• Reference Number: {ctx.sanction_letter.get('reference_number', 'N/A')}
• Status: APPROVED & SANCTIONED
• Amount: ₹{ctx.loan_offer.get('amount'):,}

Thank you for using our service. Please keep your sanction letter safe for future reference."""


# Global instance
_master = MasterAgent()


async def master_agent(customer_id: str, message: str) -> Dict[str, Any]:
    """Entry point for agent processing"""
    return await _master.process(customer_id, message)


def get_conversation(customer_id: str) -> Optional[ConversationContext]:
    """Get conversation history"""
    return _master.conversations.get(customer_id)
