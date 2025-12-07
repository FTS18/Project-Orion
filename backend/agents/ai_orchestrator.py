"""
AI-Powered Agent Orchestrator using Ollama
Replaces hardcoded logic with intelligent conversation
"""
from typing import Dict, Any, List, Optional
from datetime import datetime
from uuid import uuid4
import json
import re

from .ollama_service import LoanAgentPrompts
from .gemini_service import gemini_service
from ..storage.data import StorageManager


class AgentState:
    """Represents the state of an individual agent"""
    
    def __init__(self, agent_type: str):
        self.agent_type = agent_type
        self.status = "idle"  # idle, active, completed, error
        self.last_action = ""
        self.progress = 0
        self.data = {}
    
    def to_dict(self):
        return {
            "agentType": self.agent_type,
            "status": self.status,
            "lastAction": self.last_action,
            "progress": self.progress,
        }


class ConversationManager:
    """Manages conversation state with AI-powered understanding"""
    
    def __init__(self, customer_id: str, user_profile: Dict[str, Any] = None):
        self.customer_id = customer_id
        self.user_profile = user_profile or {}
        self.messages: List[Dict[str, str]] = []
        self.agent_states: Dict[str, AgentState] = {
            "master": AgentState("master"),
            "sales": AgentState("sales"),
            "verification": AgentState("verification"),
            "underwriting": AgentState("underwriting"),
            "sanction": AgentState("sanction"),
        }
        self.workflow_logs: List[Dict[str, Any]] = []
        
        # Extracted data from conversation
        self.loan_requirements: Dict[str, Any] = {}
        self.current_stage = "initial"  # initial, requirements_gathering, offer_presentation, verification, underwriting, sanction
    
    def add_message(self, role: str, content: str, agent_type: str = "master"):
        """Add message to conversation history"""
        self.messages.append({
            "role": role,
            "content": content,
            "agent": agent_type,
            "timestamp": datetime.utcnow().isoformat(),
        })
    
    def add_log(self, agent_type: str, action: str, details: str, level: str = "info"):
        """Add workflow log entry"""
        self.workflow_logs.append({
            "id": str(uuid4()),
            "timestamp": datetime.utcnow().isoformat(),
            "agentType": agent_type,
            "action": action,
            "details": details,
            "level": level,
        })
    
    def get_chat_history(self, last_n: int = 10) -> List[Dict[str, str]]:
        """Get formatted chat history for Ollama"""
        history = []
        for msg in self.messages[-last_n:]:
            history.append({
                "role": "assistant" if msg["role"] == "agent" else "user",
                "content": msg["content"]
            })
        return history


class AIOrchestrator:
    """AI-Powered Orchestrator using Ollama"""
    
    def __init__(self):
        self.conversations: Dict[str, ConversationManager] = {}
        self.storage = StorageManager()
    
    async def process_message(
        self, 
        customer_id: str, 
        message: str,
        user_profile: Dict[str, Any] = None,
        context: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Process user message using AI"""
        
        # Get or create conversation
        if customer_id not in self.conversations:
            self.conversations[customer_id] = ConversationManager(customer_id, user_profile)
        
        conv = self.conversations[customer_id]
        
        # Handle Context Injection (e.g., selected loan from marketplace)
        if context and context.get("selectedLoan"):
            loan = context["selectedLoan"]
            conv.loan_requirements["loan_type"] = loan.get("type", "Personal")
            conv.loan_requirements["loan_amount"] = loan.get("amount")
            conv.loan_requirements["selected_product_id"] = loan.get("id")
            conv.loan_requirements["selected_product_name"] = loan.get("name")
            conv.loan_requirements["selected_bank"] = loan.get("bank")
            
            # Auto-advance stage if we have context
            conv.current_stage = "requirements_gathered"
            conv.agent_states["sales"].status = "active"
            conv.agent_states["sales"].last_action = f"Processing application for {loan.get('name')}"
            
            conv.add_log("master", "context_injected", f"User selected {loan.get('name')}", "info")

        conv.add_message("user", message)
        
        # Update master agent status
        conv.agent_states["master"].status = "active"
        conv.agent_states["master"].last_action = "Processing your request..."
        conv.add_log("master", "process_message", f"User said: {message[:50]}", "info")
        
        try:
            # Generate AI response
            response = await self._generate_response(conv, message)
            
            # Extract any structured data from conversation
            await self._extract_requirements(conv, message)
            
            # Determine workflow progression
            await self._update_workflow_stage(conv)
            
            # Add AI response to conversation
            conv.add_message("agent", response, "master")
            conv.agent_states["master"].status = "completed"
            conv.agent_states["master"].last_action = "Response generated"
            
            # Build response
            return {
                "id": str(uuid4()),
                "customerId": customer_id,
                "message": response,
                "agentType": "master",
                "timestamp": datetime.utcnow().isoformat(),
                "agentStates": [state.to_dict() for state in conv.agent_states.values()],
                "workflowLogs": conv.workflow_logs[-10:],  # Last 10 logs
            }
        
        except Exception as e:
            conv.add_log("master", "error", str(e), "error")
            conv.agent_states["master"].status = "error"
            
            return {
                "id": str(uuid4()),
                "customerId": customer_id,
                "message": "I apologize, but I encountered an error. Please try again or rephrase your question.",
                "agentType": "master",
                "timestamp": datetime.utcnow().isoformat(),
                "agentStates": [state.to_dict() for state in conv.agent_states.values()],
                "workflowLogs": conv.workflow_logs[-10:],
            }
    
    async def _generate_response(self, conv: ConversationManager, message: str) -> str:
        """Generate AI response using Gemini, with fallback to mock responses"""
        
        try:
            # Prepare system prompt based on current stage
            system_prompt = LoanAgentPrompts.master_agent(
                conv.user_profile,
                conv.messages[-5:]  # Last 5 messages for context
            )
            
            # Get chat history
            # Advanced: Use k-NN / Fuzzy Search to find relevant past context
            from backend.services.advanced_algorithms import AdvancedAlgorithms
            
            # 1. Get all past user messages
            past_user_messages = [m["content"] for m in conv.messages if m["role"] == "user"]
            
            # 2. Find most relevant past messages to the current query
            relevant_context = []
            if past_user_messages:
                # Use fuzzy search (Cosine Similarity) to find semantically related past queries
                matches = AdvancedAlgorithms.fuzzy_search(message, past_user_messages, threshold=0.4)
                relevant_context = [m[0] for m in matches[:3]] # Top 3 relevant
            
            # 3. Always include immediate history (Short-term memory)
            immediate_history = conv.get_chat_history(last_n=5)
            
            # 4. Construct context string
            context_str = "\n".join([f"Relevant Past Context: {m}" for m in relevant_context])
            
            # 5. Add Loan Product Knowledge
            from backend.data.mock_loans import MOCK_LOANS
            products_str = json.dumps(MOCK_LOANS[:5]) # Pass top 5 products for context
            context_str += f"\n\nAvailable Loan Products: {products_str}"
            
            # 6. Add Specific Selected Product Context
            if conv.loan_requirements.get("selected_product_id"):
                selected_id = conv.loan_requirements.get("selected_product_id")
                selected_product = next((l for l in MOCK_LOANS if l["id"] == selected_id), None)
                if selected_product:
                    context_str += f"\n\nUSER SELECTED PRODUCT: {json.dumps(selected_product)}\nUser is specifically interested in this product. Focus on this."

            # Add system message at the start
            messages = [{"role": "system", "content": system_prompt + f"\n\n{context_str}"}]
            messages.extend(immediate_history)
            
            # Generate response from Gemini
            response = await gemini_service.chat(
                messages=messages,
                temperature=0.7,
                max_tokens=300
            )
            
            return response
            
        except Exception as e:
            conv.add_log("master", "ai_fallback", f"Using mock response: {str(e)}", "warning")
            # Fallback to mock response if AI fails
            return self._get_mock_response(conv, message)
    
    def _get_mock_response(self, conv: ConversationManager, message: str) -> str:
        """Generate contextual mock response when AI is unavailable"""
        
        message_lower = message.lower()
        user_name = conv.user_profile.get("firstName", conv.user_profile.get("name", "Customer"))
        if isinstance(user_name, str) and " " in user_name:
            user_name = user_name.split()[0]  # First name only
        
        # Greeting/start patterns
        if any(word in message_lower for word in ["hi", "hello", "hey", "start", "begin"]):
            return f"""Hello {user_name}! 👋 I'm your AI Loan Assistant.

I can help you with:
• Personal Loan
• Home Loan
• Business Loan

[SHOW_LOAN_CARDS: All]

What type of loan are you looking for today?"""

        # Loan type selection
        if any(word in message_lower for word in ["personal", "home", "business", "education"]):
            loan_type = "Personal"
            if "home" in message_lower:
                loan_type = "Home"
            elif "business" in message_lower:
                loan_type = "Business"
            elif "education" in message_lower:
                loan_type = "Education"
            
            conv.loan_requirements["loan_type"] = loan_type
            conv.agent_states["sales"].status = "active"
            conv.agent_states["sales"].last_action = f"Processing {loan_type} loan inquiry"
            
            conv.loan_requirements["loan_type"] = loan_type
            conv.agent_states["sales"].status = "active"
            conv.agent_states["sales"].last_action = f"Processing {loan_type} loan inquiry"
            
            # Find a relevant loan from mock data
            from backend.data.mock_loans import MOCK_LOANS
            
            # Check if a specific product was already selected via context
            selected_id = conv.loan_requirements.get("selected_product_id")
            if selected_id:
                relevant_loan = next((l for l in MOCK_LOANS if l["id"] == selected_id), None)
            
            # Fallback to category search if no specific ID or ID not found
            if not selected_id or not relevant_loan:
                relevant_loan = next((l for l in MOCK_LOANS if l["category"].lower() == loan_type.lower()), MOCK_LOANS[0])
            
            return f"""Great choice, {user_name}! I'll help you with a {loan_type} Loan.
            
I recommend the **{relevant_loan['productName']}** from {relevant_loan['bankName']}.

Here are the details:
💰 **Amount**: Up to ₹{relevant_loan['maxAmount']:,}
📅 **Tenure**: {relevant_loan['tenureRange']}
📊 **Interest Rate**: {relevant_loan['interestRate']}
✨ **Features**: {', '.join(relevant_loan['features'][:2])}

[SHOW_LOAN_CARDS: {loan_type}]

Would you like to proceed with this offer? Or tell me the specific amount you're looking for."""

        # Amount related
        # Improved regex to capture: 500000, 5,00,000, 5 lakhs, 5L, 500k
        amount_match = re.search(r'(\d+(?:,\d+)*(?:\.\d+)?)\s*(lakh|lakhs|lac|k|m|cr|crore)?', message_lower.replace('₹', '').replace('rs', '').strip())
        
        if amount_match and any(char.isdigit() for char in message_lower):
            try:
                raw_num = float(amount_match.group(1).replace(',', ''))
                suffix = amount_match.group(2)
                
                if suffix:
                    suffix = suffix.lower()
                    if suffix in ['lakh', 'lakhs', 'lac', 'l']:
                        amount = raw_num * 100000
                    elif suffix == 'k':
                        amount = raw_num * 1000
                    elif suffix == 'm':
                        amount = raw_num * 1000000
                    elif suffix in ['cr', 'crore']:
                        amount = raw_num * 10000000
                    else:
                        amount = raw_num
                else:
                    # Heuristic: If < 100, assume Lakhs (e.g. "5" -> 5 Lakhs) unless context implies otherwise
                    # But for now, let's assume raw number if > 1000, else lakhs if < 100
                    if raw_num < 100:
                        amount = raw_num * 100000
                    else:
                        amount = raw_num
                
                conv.loan_requirements["loan_amount"] = int(amount)
                
                conv.agent_states["sales"].status = "completed"
                conv.agent_states["verification"].status = "active"
                
                product_name = conv.loan_requirements.get("selected_product_name", f"{conv.loan_requirements.get('loan_type', 'Personal')} Loan")
                
                return f"""Perfect! I've updated your loan amount to **₹{int(amount):,}**.

Let me verify your details for **{product_name}**:
✅ Name: {user_name}
✅ Loan Type: {conv.loan_requirements.get('loan_type', 'Personal')} Loan
✅ Amount: ₹{int(amount):,}

I'll now initiate the verification process. Do you confirm these details?"""
            except Exception as e:
                conv.add_log("master", "amount_parse_error", str(e), "warning")

        # Fallback if amount keyword detected but no amount found, or just confirming
        if any(word in message_lower for word in ["amount", "value"]):
             current_amount = conv.loan_requirements.get('loan_amount', 300000)
             return f"Currently, I have noted an amount of ₹{current_amount:,}. If you'd like to change this, simply type the new amount (e.g., '5 Lakhs' or '500000')."

        # Yes/confirm patterns
        if any(word in message_lower for word in ["yes", "confirm", "proceed", "ok", "okay", "sure"]):
            conv.agent_states["verification"].status = "completed"
            conv.agent_states["underwriting"].status = "active"
            
            # Use selected product name if available
            product_name = conv.loan_requirements.get("selected_product_name", "your loan")
            
            return f"""Excellent! ✅ Your details have been verified for **{product_name}**.
            
Now running credit assessment...
• Checking credit score
• Analyzing financial history
• Calculating risk profile

This will take just a moment. Your application is progressing well! 📊"""

        # Status/progress patterns
        if any(word in message_lower for word in ["status", "progress", "update", "how"]):
            return f"""Here's your application status, {user_name}:

🟢 **Sales**: Complete
🟢 **Verification**: Complete  
🟡 **Underwriting**: In Progress
⚪ **Sanction**: Pending

Your application is being processed. Expected completion: ~2 minutes."""

        # Default response
        return f"""I understand, {user_name}. Let me help you with that.

You can tell me:
• The type of loan you need (Personal/Home/Business)
• The loan amount you're looking for
• Your preferred tenure

How can I assist you today?"""
    
    async def _extract_requirements(self, conv: ConversationManager, message: str):
        """Extract loan requirements from conversation using AI"""
        
        # Only extract if we don't have complete requirements yet
        if conv.loan_requirements.get("confidence") == "high":
            return
        
        try:
            # Prepare conversation context
            recent_messages = "\n".join([
                f"{m['role']}: {m['content']}"
                for m in conv.messages[-5:]
            ])
            
            # Extract structured data
            extracted = await gemini_service.extract_json(
                LoanAgentPrompts.extract_loan_requirements(),
                recent_messages
            )
            
            # Update requirements if we got valid data
            if extracted:
                conv.loan_requirements.update(extracted)
                conv.add_log(
                    "master",
                    "data_extraction",
                    f"Extracted: {json.dumps(extracted)}",
                    "info"
                )
        
        except Exception as e:
            conv.add_log("master", "extraction_error", str(e), "warning")
    
    async def _update_workflow_stage(self, conv: ConversationManager):
        """Update workflow stage based on gathered requirements"""
        
        reqs = conv.loan_requirements
        
        # Progress through stages based on collected data
        if conv.current_stage == "initial":
            if reqs.get("loan_type") and reqs.get("loan_amount"):
                conv.current_stage = "requirements_gathered"
                conv.agent_states["sales"].status = "active"
                conv.agent_states["sales"].progress = 50
                conv.add_log(
                    "sales",
                    "activated",
                    "Loan requirements gathered, preparing offers",
                    "success"
                )
        
        elif conv.current_stage == "requirements_gathered":
            if reqs.get("confidence") == "high":
                conv.current_stage = "offer_presentation"
                conv.agent_states["sales"].status = "completed"
                conv.agent_states["sales"].progress = 100
                conv.agent_states["verification"].status = "active"
                conv.add_log(
                    "verification",
                    "activated",
                    "Ready for document verification",
                    "info"
                )
    
    def get_conversation(self, customer_id: str) -> Optional[ConversationManager]:
        """Get conversation by customer ID"""
        return self.conversations.get(customer_id)


# Global orchestrator instance
ai_orchestrator = AIOrchestrator()
