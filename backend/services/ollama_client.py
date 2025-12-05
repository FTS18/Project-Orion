"""
Ollama Client - Integrated with Local Ollama Server
"""
import httpx
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)


async def generate_chat_response(
    messages: List[Dict[str, str]],
    model: str = "mistral",
    base_url: str = "http://127.0.0.1:11434",
) -> str:
    """
    Generate response using local Ollama server
    
    Args:
        messages: List of message dicts with 'role' and 'content'
        model: Model name (default: mistral)
        base_url: Ollama server URL
    
    Returns:
        Generated response text
    """
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            # Format messages for Ollama
            formatted_messages = []
            for msg in messages:
                formatted_messages.append({
                    "role": msg.get("role", "user"),
                    "content": msg.get("content", "")
                })
            
            # Call Ollama API
            response = await client.post(
                f"{base_url}/api/chat",
                json={
                    "model": model,
                    "messages": formatted_messages,
                    "stream": False,
                },
            )
            
            if response.status_code == 200:
                data = response.json()
                return data.get("message", {}).get("content", "")
            else:
                logger.error(f"Ollama API error: {response.status_code}")
                return "I'm experiencing technical difficulties. Please try again."
                
    except httpx.ConnectError:
        logger.error("Failed to connect to Ollama server")
        return "I'm unable to connect to the AI service. Please ensure Ollama is running on port 11434."
    except Exception as e:
        logger.error(f"Error generating response: {str(e)}")
        return "An error occurred while generating a response. Please try again."
