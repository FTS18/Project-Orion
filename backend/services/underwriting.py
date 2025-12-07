"""
Underwriting Engine - SOLID Single Responsibility
Implements exact underwriting rules
"""
import math
from datetime import datetime
from backend.models.schemas import UnderwritingDecision, UnderwritingResult
from backend.storage.data import StorageManager


class UnderwritingEngine:
    """
    Enforces underwriting rules:
    Rule 1: creditScore < 700 → REJECT
    Rule 2: loanAmount ≤ preApprovedLimit → APPROVE
    Rule 3: loanAmount ≤ 2 × preApprovedLimit → check salary
    Rule 4: loanAmount > 2 × preApprovedLimit → REJECT
    """

    @staticmethod
    def calculate_emi(principal: float, annual_rate: float, tenure_months: int) -> float:
        """Calculate monthly EMI using standard amortization formula"""
        monthly_rate = annual_rate / 12 / 100
        if monthly_rate == 0:
            return principal / tenure_months

        numerator = principal * monthly_rate * math.pow(1 + monthly_rate, tenure_months)
        denominator = math.pow(1 + monthly_rate, tenure_months) - 1
        emi = numerator / denominator
        return round(emi)

    @staticmethod
    async def evaluate(
        customer_id: str,
        loan_amount: float,
        tenure: int,
        rate: float,
        credit_score: int = None,
        pre_approved_limit: float = None,
        monthly_net_salary: float = None,
    ) -> UnderwritingResult:
        """Evaluate loan application against underwriting rules"""

        # Get customer data if not provided
        customer = StorageManager.get_customer(customer_id)
        if not customer:
            return UnderwritingResult(
                decision=UnderwritingDecision.REJECT,
                reason="Customer not found",
                requiredAction="Please register as a customer first",
            )

        credit_score = credit_score or customer.creditScore
        pre_approved_limit = pre_approved_limit or customer.preApprovedLimit
        monthly_net_salary = monthly_net_salary or customer.monthlyNetSalary

        reference_number = f"UW{int(datetime.utcnow().timestamp())}"
        emi = UnderwritingEngine.calculate_emi(loan_amount, rate, tenure)
        total_amount = emi * tenure

        # --------------------------------------------------------------------
        # Advanced Algorithm: Weighted Scoring Model
        # --------------------------------------------------------------------
        from backend.services.advanced_algorithms import AdvancedAlgorithms
        
        # Normalize factors (0-1 scale)
        norm_credit = min(credit_score / 900, 1.0)
        norm_salary = min(monthly_net_salary / 200000, 1.0)  # Cap at 2L for normalization
        norm_lTV = min(pre_approved_limit / loan_amount, 1.0) if loan_amount > 0 else 1.0
        
        factors = {
            "credit_score": norm_credit,
            "income": norm_salary,
            "loan_to_value": norm_lTV
        }
        
        weights = {
            "credit_score": 0.5,  # 50% weight
            "income": 0.3,        # 30% weight
            "loan_to_value": 0.2  # 20% weight
        }
        
        application_score = AdvancedAlgorithms.calculate_weighted_score(factors, weights)
        
        # Log the calculated score
        await UnderwritingEngine._log_decision(
            customer_id, 
            "SCORING", 
            f"Calculated Weighted Score: {application_score:.2f} (Credit: {norm_credit:.2f}, Income: {norm_salary:.2f})"
        )
        # --------------------------------------------------------------------

        # Rule 1: creditScore < 700 → REJECT
        if credit_score < 700:
            await UnderwritingEngine._log_decision(
                customer_id, "REJECT", f"Credit score {credit_score} below threshold of 700"
            )
            return UnderwritingResult(
                decision=UnderwritingDecision.REJECT,
                reason=f"Credit score ({credit_score}) is below the minimum required threshold of 700.",
                requiredAction="Please improve your credit score and reapply.",
                emi=emi,
                totalAmount=total_amount,
                referenceNumber=reference_number,
            )

        # Rule 2: loanAmount ≤ preApprovedLimit → APPROVE
        if loan_amount <= pre_approved_limit:
            await UnderwritingEngine._log_decision(
                customer_id, "APPROVE", f"Amount ₹{loan_amount} within pre-approved limit ₹{pre_approved_limit}"
            )
            return UnderwritingResult(
                decision=UnderwritingDecision.APPROVE,
                reason=f"Loan amount (₹{loan_amount:,.0f}) is within your pre-approved limit (₹{pre_approved_limit:,.0f}).",
                requiredAction="Your loan has been approved. Please proceed to sanction letter generation.",
                emi=emi,
                totalAmount=total_amount,
                referenceNumber=reference_number,
            )

        # Rule 3: loanAmount ≤ 2 × preApprovedLimit → check salary
        if loan_amount <= 2 * pre_approved_limit:
            emi_percentage = (emi / monthly_net_salary) * 100

            if emi <= (monthly_net_salary * 0.5):  # EMI ≤ 50% of monthly salary
                await UnderwritingEngine._log_decision(
                    customer_id,
                    "APPROVE",
                    f"EMI ₹{emi} ({emi_percentage:.1f}%) within 50% salary threshold",
                )
                return UnderwritingResult(
                    decision=UnderwritingDecision.APPROVE,
                    reason=f"After salary verification, your EMI (₹{emi:,.0f}) is {emi_percentage:.1f}% of your monthly net salary, which is within acceptable limits.",
                    requiredAction="Your loan has been approved. Please proceed to sanction letter generation.",
                    emi=emi,
                    totalAmount=total_amount,
                    referenceNumber=reference_number,
                )
            else:
                await UnderwritingEngine._log_decision(
                    customer_id,
                    "REJECT",
                    f"EMI ₹{emi} ({emi_percentage:.1f}%) exceeds 50% salary threshold",
                )
                return UnderwritingResult(
                    decision=UnderwritingDecision.REJECT,
                    reason=f"EMI (₹{emi:,.0f}) would be {emi_percentage:.1f}% of your monthly net salary, exceeding the acceptable limit of 50%.",
                    requiredAction="Consider a lower loan amount or longer tenure to reduce EMI.",
                    emi=emi,
                    totalAmount=total_amount,
                    referenceNumber=reference_number,
                )

        # Rule 4: loanAmount > 2 × preApprovedLimit → REJECT
        await UnderwritingEngine._log_decision(
            customer_id,
            "REJECT",
            f"Amount ₹{loan_amount} exceeds 2x pre-approved limit (₹{2 * pre_approved_limit})",
        )
        return UnderwritingResult(
            decision=UnderwritingDecision.REJECT,
            reason=f"Requested amount (₹{loan_amount:,.0f}) exceeds the maximum eligible limit of ₹{(2 * pre_approved_limit):,.0f}.",
            requiredAction=f"Maximum eligible amount: ₹{(2 * pre_approved_limit):,.0f}",
            emi=emi,
            totalAmount=total_amount,
            referenceNumber=reference_number,
        )

    @staticmethod
    async def _log_decision(customer_id: str, decision: str, reason: str) -> None:
        """Log underwriting decision to audit trail"""
        from backend.models.schemas import AuditLogEntry

        entry = AuditLogEntry(
            id="",
            customerId=customer_id,
            timestamp=datetime.utcnow().isoformat(),
            action="UNDERWRITING_DECISION",
            decision=decision,
            reason=reason,
            metadata={"engine": "UnderwritingEngine", "version": "1.0"},
        )
        StorageManager.add_audit_log(entry)
