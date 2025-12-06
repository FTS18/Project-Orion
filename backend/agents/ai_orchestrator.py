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
        """Generate AI response using Ollama"""
        
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
        
        # Generate response
        response = await gemini_service.chat(
            messages=messages,
            temperature=0.7,
            max_tokens=300
        )
        
        return response
    
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
