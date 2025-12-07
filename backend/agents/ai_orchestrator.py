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
        user_profile: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Process user message using AI"""
        
        # Get or create conversation
        if customer_id not in self.conversations:
            self.conversations[customer_id] = ConversationManager(customer_id, user_profile)
        
        conv = self.conversations[customer_id]
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
            chat_history = conv.get_chat_history(last_n=8)
            
            # Add system message at the start
            messages = [{"role": "system", "content": system_prompt}]
            messages.extend(chat_history)
            
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
            
            return f"""Great choice, {user_name}! I'll help you with a {loan_type} Loan.

Based on your profile, here's a pre-approved offer:
💰 **Amount**: Up to ₹5,00,000
📅 **Tenure**: 12-60 months  
📊 **Interest Rate**: 10.5% - 12.5% p.a.

Would you like to proceed with this offer? Or tell me the specific amount you're looking for."""

        # Amount related
        if any(word in message_lower for word in ["amount", "lakh", "lakhs", "₹", "rupee", "rs"]):
            # Try to extract amount
            import re
            amount_match = re.search(r'(\d+)\s*(?:lakh|lakhs|lac)', message_lower)
            if amount_match:
                amount = int(amount_match.group(1)) * 100000
                conv.loan_requirements["loan_amount"] = amount
            
            conv.agent_states["sales"].status = "completed"
            conv.agent_states["verification"].status = "active"
            
            return f"""Perfect! I've noted your loan amount preference.

Let me verify your details:
✅ Name: {user_name}
✅ Loan Type: {conv.loan_requirements.get('loan_type', 'Personal')} Loan
✅ Amount: ₹{conv.loan_requirements.get('loan_amount', 300000):,}

I'll now initiate the verification process. Do you confirm these details?"""

        # Yes/confirm patterns
        if any(word in message_lower for word in ["yes", "confirm", "proceed", "ok", "okay", "sure"]):
            conv.agent_states["verification"].status = "completed"
            conv.agent_states["underwriting"].status = "active"
            
            return f"""Excellent! ✅ Your details have been verified.

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
