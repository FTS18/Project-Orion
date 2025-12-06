"""
FastAPI Main Application - Project Orion Backend
All 10 endpoints from Express reimplemented in Python
"""
import asyncio
from typing import List
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime
from uuid import uuid4
import time

from backend.models.schemas import (
    Customer,
    CrmRecord,
    CreditBureauResponse,
    LoanOffer,
    KycVerificationRequest,
    KycVerificationResponse,
    SalaryExtractionResponse,
    UnderwritingRequest,
    UnderwritingResult,
    SanctionLetterRequest,
    SanctionLetterResponse,
    AuditLogEntry,
    ChatRequest,
    ChatResponse,
    WorkflowLogEntry
)
from backend.storage.data import StorageManager
from backend.agents.orchestrator import MasterAgent
from backend.routes_extended import extended_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting up Project Orion Backend...")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(title="Project Orion Backend", lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5000",
        "http://127.0.0.1:5000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Extended Routes (Rules Engine, etc.)
app.include_router(extended_router)

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/customers", response_model=List[Customer])
async def get_customers():
    """Get all customers"""
    await asyncio.sleep(0.1)  # Simulate latency
    customers = StorageManager.get_all_customers()
    return customers


@app.get("/api/crm/{customer_id}", response_model=CrmRecord)
async def get_crm(customer_id: str):
    """Get CRM record for customer"""
    await asyncio.sleep(0.08)
    record = StorageManager.get_crm_record(customer_id)
    if not record:
        raise HTTPException(status_code=404, detail="Customer not found in CRM")
    return record


@app.get("/api/credit/{customer_id}", response_model=CreditBureauResponse)
async def get_credit(customer_id: str):
    """Get credit bureau data"""
    await asyncio.sleep(0.1)
    credit_data = StorageManager.get_credit_data(customer_id)
    if not credit_data:
        raise HTTPException(status_code=404, detail="Credit data not found")
    return credit_data


@app.get("/api/offers", response_model=List[LoanOffer])
async def get_offers():
    """Get all pre-approved offers"""
    await asyncio.sleep(0.12)
    offers = StorageManager.get_offers()
    return offers


@app.post("/api/verify-kyc", response_model=KycVerificationResponse)
async def verify_kyc(request: KycVerificationRequest):
    """Verify KYC details"""
    await asyncio.sleep(0.15)

    result = await KycVerificationService.verify(
        request.customerId,
        request.name,
        request.phone,
        request.address,
    )
    return result


@app.post("/api/extract-salary", response_model=SalaryExtractionResponse)
async def extract_salary(request: dict):
    """Extract salary information (mock OCR)"""
    await asyncio.sleep(1.5)  # Simulate OCR processing

    customer_id = request.get("customerId")
    customer = StorageManager.get_customer(customer_id) if customer_id else None

    net_salary = customer.monthlyNetSalary if customer else 50000
    result = SalaryExtractionResponse(
        grossIncome=round(net_salary * 1.3),
        netIncome=net_salary,
        employer=(
            "Self-Employed"
            if customer and customer.employmentType == "Self-Employed"
            else "Agentic Technologies Pvt. Ltd."
        ),
        parsed=True,
    )
    return result


@app.post("/api/underwrite", response_model=UnderwritingResult)
async def underwrite(request: UnderwritingRequest):
    """Process underwriting decision"""
    await asyncio.sleep(0.2)

    result = await UnderwritingEngine.evaluate(
        request.customerId,
        request.loanRequest.amount,
        request.loanRequest.tenure,
        request.loanRequest.rate,
        request.creditScore,
        request.preApprovedLimit,
    )
    return result


@app.post("/api/generate-sanction-letter", response_model=SanctionLetterResponse)
async def generate_sanction_letter(request: SanctionLetterRequest):
    """Generate sanction letter"""
    await asyncio.sleep(0.3)

    reference_number = f"SNCT{int(datetime.utcnow().timestamp())}"
    generated_at = datetime.utcnow().isoformat()

    # Save sanction letter
    StorageManager.save_sanction_letter(request.customerId, reference_number)

    # Log audit
    entry = AuditLogEntry(
        id=str(uuid4()),
        customerId=request.customerId,
        timestamp=generated_at,
        action="SANCTION_LETTER_GENERATED",
        reason=f"Sanction letter generated with reference {reference_number}",
        metadata={
            "loanTerms": request.loanTerms.dict(),
            "signatory": request.signatory,
            "referenceNumber": reference_number,
        },
    )
    StorageManager.add_audit_log(entry)

    return SanctionLetterResponse(
        pdfUrl=f"/api/sanction/{reference_number}.pdf",
        referenceNumber=reference_number,
        generatedAt=generated_at,
    )


@app.get("/api/audit/{customer_id}", response_model=list[AuditLogEntry])
async def get_audit_logs(customer_id: str):
    """Get audit trail for customer"""
    await asyncio.sleep(0.08)
    logs = StorageManager.get_audit_logs(customer_id)
    return logs


@app.get("/api/sanction/{reference_number}.pdf")
async def download_sanction(reference_number: str):
    """Download sanction letter (placeholder)"""
    await asyncio.sleep(0.1)

    # Remove .pdf extension if included
    ref = reference_number.replace(".pdf", "")
    letter = StorageManager.get_sanction_letter(ref)

    if not letter:
        raise HTTPException(status_code=404, detail="Sanction letter not found")

    # Return placeholder PDF content
    return {
        "filename": f"sanction_{ref}.pdf",
        "content": f"Sanction Letter\nReference: {ref}\nGenerated: {letter['generatedAt']}",
        "mimeType": "application/pdf",
    }


# ============================================================================
# AGENTIC API ENDPOINTS
# ============================================================================


@app.post("/api/agent/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest):
    """Chat with agentic AI system powered by Ollama"""
    
    from backend.agents.ai_orchestrator import ai_orchestrator
    
    # Use provided user profile or extract if customer_id starts with USER_
    user_profile = request.userProfile
    
    if not user_profile and request.customerId.startswith("USER_"):
        # Fallback if profile wasn't passed but it's a user ID
        # In a real app, we'd fetch from DB here
        pass
    
    # Process message through AI orchestrator
    result = await ai_orchestrator.process_message(
        request.customerId,
        request.message,
        user_profile
    )
    
    return ChatResponse(
        id=result.get("id"),
        customerId=result.get("customerId"),
        message=result.get("message"),
        agentType=result.get("agentType"),
        timestamp=result.get("timestamp"),
        agentStates=result.get("agentStates"),
        workflowLogs=result.get("workflowLogs"),
    )


@app.websocket("/ws/chat/{customer_id}")
async def websocket_chat(websocket: WebSocket, customer_id: str):
    """WebSocket endpoint for real-time chat with Ollama"""
    from backend.agents.ai_orchestrator import ai_orchestrator
    
    await websocket.accept()

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            user_message = data.get("message", "")

            if not user_message:
                continue
            
            # Extract user profile
            user_profile = None
            if customer_id.startswith("USER_"):
                user_id = customer_id.replace("USER_", "")
                user_profile = {
                    "user_id": user_id,
                    "name": "User",
                    "email": "user@example.com",
                }

            # Process through AI orchestrator
            result = await ai_orchestrator.process_message(
                customer_id,
                user_message,
                user_profile
            )

            # Send response back
            await websocket.send_json(result)

    except WebSocketDisconnect:
        print(f"Client {customer_id} disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.send_json({"error": str(e)})


@app.get("/api/conversation/{customer_id}")
async def get_conversation(customer_id: str):
    """Get conversation history for customer"""
    conversation = master_agent.get_conversation(customer_id)

    if not conversation:
        return {"messages": [], "agents": [], "logs": []}

    return {
        "customerId": customer_id,
        "messages": conversation.conversation_history,
        "agents": [state.to_dict() for state in conversation.agent_states.values()],
        "logs": [log.dict() for log in conversation.workflow_logs],
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="localhost",
        port=8000,
        reload=True,
        log_level="info",
    )
