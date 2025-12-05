"""
Simplified Pydantic models for API validation
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from enum import Enum


# Enums
class EmploymentType(str, Enum):
    SALARIED = "Salaried"
    SELF_EMPLOYED = "Self-Employed"


class ExistingLoan(str, Enum):
    YES = "yes"
    NO = "no"


class CreditBand(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class KYCStatus(str, Enum):
    VERIFIED = "VERIFIED"
    PENDING = "PENDING"
    FAILED = "FAILED"


class UnderwritingDecision(str, Enum):
    APPROVE = "APPROVE"
    REJECT = "REJECT"
    PENDING = "PENDING"


class AgentType(str, Enum):
    MASTER = "master"
    SALES = "sales"
    VERIFICATION = "verification"
    UNDERWRITING = "underwriting"
    SANCTION = "sanction"


class AgentStatus(str, Enum):
    IDLE = "idle"
    ACTIVE = "active"
    COMPLETED = "completed"
    ERROR = "error"


class LogLevel(str, Enum):
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    SUCCESS = "success"


# Models
class Customer(BaseModel):
    customerId: str
    name: str
    age: int
    city: str
    phone: str
    email: str
    existingLoan: str
    existingLoanAmount: int = 0
    creditScore: int
    preApprovedLimit: int
    employmentType: str
    monthlyNetSalary: int


class CrmRecord(BaseModel):
    customerId: str
    name: str
    phone: str
    address: str
    pincode: str
    city: str
    dob: str


class CreditBureauResponse(BaseModel):
    customerId: str
    score: int
    preApprovedLimit: int


class LoanOffer(BaseModel):
    offerId: str
    customerId: str
    creditBand: str
    maxAmount: int
    interestRate: float
    tenure: int
    processingFee: float


class KycVerificationRequest(BaseModel):
    customerId: str
    name: str
    phone: str
    address: str


class KycVerificationResponse(BaseModel):
    status: str
    mismatches: List[str] = []


class SalaryExtractionResponse(BaseModel):
    grossIncome: int
    netIncome: int
    employer: str
    parsed: bool = True


class UnderwritingRequest(BaseModel):
    customerId: str
    amount: int
    tenure: int
    rate: float


class UnderwritingResult(BaseModel):
    decision: str
    reason: str
    requiredAction: Optional[str] = None
    emi: Optional[float] = None
    totalAmount: Optional[float] = None
    referenceNumber: Optional[str] = None


class SanctionLetterRequest(BaseModel):
    customerId: str
    amount: int
    tenure: int
    rate: float


class SanctionLetterResponse(BaseModel):
    pdfUrl: str
    referenceNumber: str
    generatedAt: str


class AuditLogEntry(BaseModel):
    id: str
    customerId: str
    timestamp: str
    action: str
    decision: Optional[str] = None
    reason: str
    metadata: Optional[Dict[str, Any]] = None


class AgentMessage(BaseModel):
    id: str
    agentType: str
    role: str
    content: str
    timestamp: str
    metadata: Optional[Dict[str, Any]] = None


class AgentState(BaseModel):
    agentType: str
    status: str
    lastAction: Optional[str] = None
    progress: Optional[int] = 0


class WorkflowLogEntry(BaseModel):
    id: str
    timestamp: str
    agentType: str
    action: str
    details: str
    level: str = "info"


class ChatRequest(BaseModel):
    customerId: str
    message: str


class ChatResponse(BaseModel):
    id: str
    customerId: str
    message: str
    agentType: str
    timestamp: str
    agentStates: Optional[List[Dict[str, Any]]] = None
    workflowLogs: Optional[List[Dict[str, Any]]] = None
