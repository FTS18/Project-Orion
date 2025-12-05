"""
FastAPI + Agentic Mode Integration Service
"""
import asyncio
from typing import Callable


class ChatService:
    """Service to manage chat with Agentic AI"""

    def __init__(self, backend_url: str = "http://localhost:8000"):
        self.backend_url = backend_url
        self.ws_url = f"ws://localhost:8000"

    async def send_message(self, customer_id: str, message: str) -> dict:
        """Send message to backend and get response"""
        import httpx

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.backend_url}/api/agent/chat",
                json={"customerId": customer_id, "message": message},
            )

            if response.status_code == 200:
                return response.json()
            else:
                raise Exception(f"Backend error: {response.status_code}")

    async def get_conversation_history(self, customer_id: str) -> dict:
        """Get conversation history"""
        import httpx

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.backend_url}/api/conversation/{customer_id}"
            )

            if response.status_code == 200:
                return response.json()
            else:
                return {"messages": [], "agents": [], "logs": []}

    def get_websocket_url(self, customer_id: str) -> str:
        """Get WebSocket URL for real-time chat"""
        return f"{self.ws_url}/ws/chat/{customer_id}"


# Global service instance
chat_service = ChatService()
