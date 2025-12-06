"""
Ollama Integration Service for Project Orion
Provides LLM-powered conversational AI for loan agents
"""
import aiohttp
import json
from typing import Dict, Any, List, Optional
from datetime import datetime


class OllamaService:
    """Service for interacting with Ollama LLM"""
    
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "mistral:latest"):
        self.base_url = base_url
        self.model = model
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _ensure_session(self):
        """Ensure HTTP session is initialized"""
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
    
    async def close(self):
        """Close HTTP session"""
        if self.session and not self.session.closed:
            await self.session.close()
    
    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """Generate text using Ollama"""
        await self._ensure_session()
        
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                }
            }
            
            if system_prompt:
                payload["system"] = system_prompt
            
            async with self.session.post(
                f"{self.base_url}/api/generate",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("response", "").strip()
                else:
                    error_text = await response.text()
                    raise Exception(f"Ollama API error: {response.status} - {error_text}")
        
        except aiohttp.ClientError as e:
            raise Exception(f"Failed to connect to Ollama: {str(e)}")
        except Exception as e:
            raise Exception(f"Ollama generation error: {str(e)}")
    
    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """Chat completion using Ollama"""
        await self._ensure_session()
        
        try:
            payload = {
                "model": self.model,
                "messages": messages,
                "stream": False,
                "options": {
                    "temperature": temperature,
                    "num_predict": max_tokens,
                }
            }
            
            async with self.session.post(
                f"{self.base_url}/api/chat",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=30)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    return data.get("message", {}).get("content", "").strip()
                else:
                    error_text = await response.text()
                    raise Exception(f"Ollama API error: {response.status} - {error_text}")
        
        except aiohttp.ClientError as e:
            raise Exception(f"Failed to connect to Ollama: {str(e)}")
        except Exception as e:
            raise Exception(f"Ollama chat error: {str(e)}")
    
    async def extract_json(self, prompt: str, text: str) -> Dict[str, Any]:
        """Extract structured JSON data from text"""
        extraction_prompt = f"""{prompt}

Input text:
{text}

Please respond ONLY with valid JSON, no other text."""
        
        response = await self.generate(extraction_prompt, temperature=0.1)
        
        try:
            # Try to find JSON in the response
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            else:
                return json.loads(response)
        except json.JSONDecodeError:
            return {}


class LoanAgentPrompts:
    """Prompts for different loan agents"""
    
    @staticmethod
    def master_agent(user_profile: Dict[str, Any], conversation_history: List[Dict]) -> str:
        """System prompt for master agent"""
        user_name = user_profile.get('firstName', user_profile.get('name', 'there'))
        
        # Format financial details if available
        financial_context = ""
        if user_profile.get('monthlyNetSalary'):
            salary = user_profile.get('monthlyNetSalary')
            limit = user_profile.get('preApprovedLimit', salary * 10)
            score = user_profile.get('creditScore', 750)
            financial_context = f"""
Financial Profile:
- Monthly Salary: ₹{salary:,}
- Employment: {user_profile.get('employmentType', 'Unknown')}
- Credit Score: {score} (Excellent)
- Pre-approved Limit: ₹{limit:,}
- Existing Loan: {'Yes' if user_profile.get('hasExistingLoan') else 'No'}
"""

        return f"""You are the Master Loan Agent for Project Orion, a sophisticated AI banking assistant.
You are talking to {user_name}.

{financial_context}

Your Goal: Help {user_name} get the best loan offer based on their profile.

Guidelines:
1. PERSONALIZATION: Use their name and financial data.
   - If they have a pre-approved limit, mention it early! "I see you're pre-approved for up to ₹{user_profile.get('preApprovedLimit', '...'):,}"
   - If their credit score is good (750+), compliment them!
   
2. CONVERSATIONAL STYLE:
   - Be warm, professional, and concise.
   - Don't be robotic. Use emojis occasionally (👋, 💼, 🏠).
   - Ask ONE question at a time.
   - If you have their salary/employment, DO NOT ask for it again.

3. PROCESS:
   - First, ask what they need the money for (Purpose & Amount).
   - Then, suggest the best loan type.
   - Finally, coordinate with the Sales Agent to generate an offer.

Current conversation context:
{json.dumps(conversation_history[-5:], indent=2) if conversation_history else 'New conversation'}

Respond naturally to the user's latest message. Keep it under 3 sentences."""
    
    @staticmethod
    def sales_agent() -> str:
        """System prompt for sales agent"""
        return """You are a Sales Agent specializing in loan products.

Your role:
1. Analyze customer requirements
2. Recommend suitable loan products
3. Explain interest rates, tenure options, and features
4. Calculate EMI estimates
5. Present offers clearly

Response style:
- Clear and transparent
- Explain financial terms simply
- Provide specific numbers and calculations
- Highlight benefits relevant to customer needs"""
    
    @staticmethod
    def verification_agent() -> str:
        """System prompt for verification agent"""
        return """You are a KYC Verification Agent.

Your role:
1. Collect required documents (PAN, Aadhar, Address proof)
2. Verify identity information
3. Check document authenticity
4. Confirm contact details
5. Explain next steps

Response style:
- Clear instructions
- Security-focused
- Professional and reassuring
- Patient with document requirements"""
    
    @staticmethod
    def underwriting_agent() -> str:
        """System prompt for underwriting agent"""
        return """You are an Underwriting Agent evaluating loan applications.

Your role:
1. Assess creditworthiness
2. Evaluate repayment capacity
3. Check credit score implications
4. Review financial documents
5. Make approval/rejection decisions

Response style:
- Objective and fact-based
- Explain criteria clearly
- Be transparent about reasons
- Suggest improvements if rejected"""
    
    @staticmethod
    def extract_loan_requirements() -> str:
        """Prompt for extracting loan requirements from conversation"""
        return """Extract loan requirements from the conversation. Return JSON with these fields:
{
  "loan_type": "personal|home|business|education|vehicle|other",
  "loan_amount": number or null,
  "tenure_months": number or null,
  "purpose": "string describing purpose" or null,
  "monthly_income": number or null,
  "employment_type": "salaried|self_employed|business|retired" or null,
  "confidence": "low|medium|high"
}

Only include fields where you have clear information. Set confidence based on how explicitly the user stated their requirements."""


# Global Ollama service instance
ollama_service = OllamaService()


async def close_ollama():
    """Cleanup function"""
    await ollama_service.close()
