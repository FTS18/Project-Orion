"""
Gemini Integration Service for Project Orion
Replaces Ollama for faster inference using Google's Gemini API
"""
import aiohttp
import json
from typing import Dict, Any, List, Optional

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
        self.session: Optional[aiohttp.ClientSession] = None
    
    async def _ensure_session(self):
        if self.session is None or self.session.closed:
            self.session = aiohttp.ClientSession()
    
    async def close(self):
        if self.session and not self.session.closed:
            await self.session.close()
            
    def _format_messages(self, messages: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        """Convert OpenAI/Ollama format to Gemini format"""
        gemini_messages = []
        system_instruction = ""
        
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            
            if role == "system":
                # Gemini handles system prompts differently, but prepending is reliable
                system_instruction += f"{content}\n\n"
            elif role == "user":
                gemini_messages.append({
                    "role": "user",
                    "parts": [{"text": system_instruction + content if not gemini_messages else content}]
                })
                system_instruction = "" # Clear after attaching
            elif role == "assistant" or role == "agent":
                gemini_messages.append({
                    "role": "model",
                    "parts": [{"text": content}]
                })
                
        # If there's a pending system instruction without a user message, add a dummy user message
        # (Rare case, but prevents errors)
        if system_instruction and not gemini_messages:
            gemini_messages.append({
                "role": "user",
                "parts": [{"text": system_instruction + "Hello"}]
            })
            
        return gemini_messages

    async def chat(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> str:
        """Chat completion using Gemini"""
        await self._ensure_session()
        
        contents = self._format_messages(messages)
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": temperature,
                "maxOutputTokens": 8192,
            },
            "safetySettings": [
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"}
            ]
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}?key={self.api_key}",
                json=payload,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    try:
                        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
                    except (KeyError, IndexError):
                        with open("backend_error.log", "a") as f:
                            f.write(f"Gemini Parse Error. Data: {json.dumps(data)}\n")
                        raise Exception("Failed to parse Gemini response")
                else:
                    error_text = await response.text()
                    with open("backend_error.log", "a") as f:
                        f.write(f"Gemini API Error: {error_text}\n")
                    print(f"Gemini API Error: {error_text}")
                    raise Exception(f"Gemini API Error: {response.status}")
                    
        except aiohttp.ClientError as e:
            with open("backend_error.log", "a") as f:
                f.write(f"Gemini Connection Error: {str(e)}\n")
            print(f"Gemini Connection Error: {str(e)}")
            raise Exception(f"Connection error: {str(e)}")

    async def extract_json(self, prompt: str, text: str) -> Dict[str, Any]:
        """Extract structured JSON data from text"""
        full_prompt = f"""{prompt}

Input text:
{text}

Please respond ONLY with valid JSON, no other text. Do not use markdown formatting."""

        messages = [{"role": "user", "content": full_prompt}]
        response = await self.chat(messages, temperature=0.1)
        
        try:
            # Clean up markdown code blocks if present
            cleaned = response.replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except json.JSONDecodeError:
            return {}

# Initialize with provided key
gemini_service = GeminiService("AIzaSyCiGk1P6kiafYnsBy95Y7fwwdf9rF1j0Vk")
