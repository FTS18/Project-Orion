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


@app.get("/api/offers/{customer_id}")
async def get_customer_offers(customer_id: str):
    """Get pre-approved offers for a specific customer from Offer Mart"""
    import json
    import os
    
    await asyncio.sleep(0.1)
    
    # Load from offers.json (Offer Mart)
    offers_path = os.path.join(os.path.dirname(__file__), "..", "data", "offers.json")
    try:
        with open(offers_path, "r") as f:
            all_offers = json.load(f)
        
        # Filter offers for this customer
        customer_offers = [o for o in all_offers if o.get("customerId") == customer_id]
        
        if not customer_offers:
            raise HTTPException(status_code=404, detail="No offers found for customer")
        
        return {
            "customerId": customer_id,
            "offers": customer_offers,
            "totalOffers": len(customer_offers)
        }
    except FileNotFoundError:
        # Fallback to in-memory offers
        offers = StorageManager.get_offers_by_customer(customer_id)
        return {
            "customerId": customer_id,
            "offers": [o.dict() for o in offers],
            "totalOffers": len(offers)
        }


@app.get("/api/loans/products")
async def get_loan_products():
    """Get all available loan products from partner banks"""
    from backend.data.mock_loans import MOCK_LOANS
    await asyncio.sleep(0.1)
    return MOCK_LOANS



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
    """Download sanction letter as PDF"""
    from fastapi.responses import Response
    from datetime import datetime
    from io import BytesIO
    
    await asyncio.sleep(0.1)

    # Remove .pdf extension if included
    ref = reference_number.replace(".pdf", "")
    letter = StorageManager.get_sanction_letter(ref)

    if not letter:
        raise HTTPException(status_code=404, detail="Sanction letter not found")

    # Generate PDF using reportlab
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.units import inch, cm
        from reportlab.lib.enums import TA_CENTER, TA_LEFT
        
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm)
        
        styles = getSampleStyleSheet()
        
        # Custom styles
        title_style = ParagraphStyle(
            'Title',
            parent=styles['Heading1'],
            fontSize=20,
            alignment=TA_CENTER,
            spaceAfter=20,
            textColor=colors.HexColor('#1a1a2e')
        )
        
        subtitle_style = ParagraphStyle(
            'Subtitle',
            parent=styles['Normal'],
            fontSize=12,
            alignment=TA_CENTER,
            textColor=colors.gray
        )
        
        heading_style = ParagraphStyle(
            'Heading',
            parent=styles['Heading2'],
            fontSize=14,
            spaceBefore=20,
            spaceAfter=10,
            textColor=colors.HexColor('#4361ee')
        )
        
        normal_style = ParagraphStyle(
            'CustomNormal',
            parent=styles['Normal'],
            fontSize=11,
            spaceAfter=6
        )
        
        # Build PDF content
        elements = []
        
        # Header
        elements.append(Paragraph("🚀 PROJECT ORION", title_style))
        elements.append(Paragraph("Agentic AI Loan Processing System", subtitle_style))
        elements.append(Spacer(1, 0.5*inch))
        
        # Sanction Letter Title
        elements.append(Paragraph("OFFICIAL SANCTION LETTER", heading_style))
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#4361ee')))
        elements.append(Spacer(1, 0.2*inch))
        
        # Reference and Date
        customer_name = letter.get('customerName', 'Valued Customer')
        date_str = datetime.now().strftime('%d %B %Y')
        elements.append(Paragraph(f"<b>Reference Number:</b> {ref}", normal_style))
        elements.append(Paragraph(f"<b>Date:</b> {date_str}", normal_style))
        elements.append(Spacer(1, 0.2*inch))
        
        # Greeting
        elements.append(Paragraph(f"Dear <b>{customer_name}</b>,", normal_style))
        elements.append(Spacer(1, 0.1*inch))
        elements.append(Paragraph(
            "We are pleased to inform you that your loan application has been <b>APPROVED</b>. "
            "Please find the details of your sanctioned loan below:",
            normal_style
        ))
        elements.append(Spacer(1, 0.2*inch))
        
        # Loan Details Table
        elements.append(Paragraph("LOAN DETAILS", heading_style))
        
        loan_amount = letter.get('amount', 100000)
        interest_rate = letter.get('interestRate', 10.5)
        tenure = letter.get('tenure', 24)
        emi = letter.get('emi', 4637)
        total_repayment = letter.get('totalRepayment', emi * tenure)
        processing_fee = int(loan_amount * 0.01)
        
        loan_data = [
            ['Loan Type', f"{letter.get('loanType', 'Personal')} Loan"],
            ['Sanctioned Amount', f"₹{loan_amount:,}"],
            ['Interest Rate', f"{interest_rate}% per annum"],
            ['Tenure', f"{tenure} months"],
            ['Monthly EMI', f"₹{emi:,}"],
            ['Total Repayment', f"₹{total_repayment:,}"],
            ['Processing Fee', f"₹{processing_fee:,} (1%)"],
        ]
        
        table = Table(loan_data, colWidths=[3*inch, 3*inch])
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), colors.HexColor('#f0f4ff')),
            ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 11),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
            ('TOPPADDING', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#ddd')),
        ]))
        elements.append(table)
        elements.append(Spacer(1, 0.3*inch))
        
        # Terms & Conditions
        elements.append(Paragraph("TERMS & CONDITIONS", heading_style))
        terms = [
            "1. This sanction is valid for 30 days from the date of issue.",
            "2. Disbursement is subject to completion of all documentation.",
            "3. Pre-closure is allowed after 6 months with nominal charges.",
            "4. EMI should be paid by the 5th of every month.",
            "5. Delay in EMI payment will attract penalty charges.",
        ]
        for term in terms:
            elements.append(Paragraph(term, normal_style))
        
        elements.append(Spacer(1, 0.5*inch))
        
        # Footer
        elements.append(HRFlowable(width="100%", thickness=1, color=colors.gray))
        elements.append(Spacer(1, 0.2*inch))
        elements.append(Paragraph("Thank you for choosing Project Orion!", 
                                  ParagraphStyle('Footer', alignment=TA_CENTER, fontSize=12, textColor=colors.gray)))
        elements.append(Paragraph("This is a system-generated document", 
                                  ParagraphStyle('Small', alignment=TA_CENTER, fontSize=9, textColor=colors.lightgrey)))
        
        # Build PDF
        doc.build(elements)
        
        pdf_content = buffer.getvalue()
        buffer.close()
        
        return Response(
            content=pdf_content,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Sanction_Letter_{ref}.pdf"
            }
        )
        
    except ImportError:
        # Fallback to text if reportlab not available
        content = f"""
PROJECT ORION - SANCTION LETTER
Reference: {ref}
Date: {datetime.now().strftime('%d %B %Y')}

Dear {letter.get('customerName', 'Valued Customer')},

Your loan application has been APPROVED!

Loan Amount: ₹{letter.get('amount', 100000):,}
Interest Rate: {letter.get('interestRate', 10.5)}%
Tenure: {letter.get('tenure', 24)} months

Thank you for choosing Project Orion!
"""
        return Response(
            content=content,
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename=Sanction_Letter_{ref}.txt"
            }
        )


# ============================================================================
# AGENTIC API ENDPOINTS
# ============================================================================


@app.post("/api/agent/chat", response_model=ChatResponse)
async def agent_chat(request: ChatRequest):
    """Chat with agentic AI system - Multi-agent orchestration"""
    
    from backend.agents.ai_orchestrator import ai_orchestrator
    
    result = await ai_orchestrator.process_message(
        request.customerId,
        request.message,
        request.userProfile,
        request.context
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
