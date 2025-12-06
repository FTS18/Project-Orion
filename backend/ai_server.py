"""
Standalone AI Chat Server - Bypasses all old code
Run separately on port 8001 for testing Ollama integration
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
sys.path.append('.')

from backend.agents.ai_orchestrator import ai_orchestrator

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    customerId: str
    message: str

@app.post("/api/agent/chat")
async def chat(request: ChatRequest):
    """AI-powered chat endpoint"""
    user_profile = None
    if request.customerId.startswith("USER_"):
        user_id = request.customerId.replace("USER_", "")
        user_profile = {
            "user_id": user_id,
            "name": "User",
            "email": "user@example.com",
        }
    
    result = await ai_orchestrator.process_message(
        request.customerId,
        request.message,
        user_profile
    )
    
    return result

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
